import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { AuthRegisterDto, AuthLoginDto } from '../dto/user.dto';
import {
  AuthMessage,
  BadRequestMessage,
  NotFoundMessage,
  PublicMessage,
  ConflictMessage,
} from 'libs/common/src/enums/message.enum';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { createHash, randomBytes } from 'crypto';
import { AuthService as TokenService } from '@app/auth';
import { VerifyOtpDto } from 'libs/common/src/dtos/otp.dto';
import { UserAuthRepository } from '../repositories/user-auth.repository';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { OtpRepository } from '../repositories/otp.repository';
import { RabbitMqService } from 'libs/messaging';

const REFRESH_TOKEN_EXPIRY_MS = 1000 * 60 * 60 * 24 * 30; 
const OTP_EXPIRY_MS = 2 * 60 * 1000; 

@Injectable()
export class UserAuthService {
  constructor(
    private readonly userRepo: UserAuthRepository,
    private readonly refreshRepo: RefreshTokenRepository,
    private readonly otpRepo: OtpRepository,
    private readonly tokenService: TokenService,
    private readonly events: RabbitMqService
  ) {}

  async register(dto: AuthRegisterDto) {
    const username = this.normalizeUsername(dto.username);
    const email = dto.email.trim().toLowerCase();
    const phone: string | null = dto.phone ? dto.phone.trim() : null;

    if (!username || !dto.password) {
      throw new BadRequestException(BadRequestMessage.InValidRegisterData);
    }

    await this.ensureUniqueFields(email, phone ?? undefined);

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = await this.userRepo.createUser({
      username,
      email,
      phone,
      password: hashedPassword,
      basket: { create: {} },
    });

    await this.events.notify(
      user.id,
      'EMAIL',
      `Welcome ${user.username}! Your account has been created successfully.`
    );

    return {
      message: PublicMessage.Created,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        basketId: user.basket?.id,
      },
    };
  }

  async login(dto: AuthLoginDto) {
    const email = dto.email?.trim();
    const password = dto.password;

    if (!email || !password) {
      throw new BadRequestException(BadRequestMessage.InValidLoginData);
    }

    const user = await this.userRepo.findByEmail(email);
    if (!user || !user.password) {
      throw new UnauthorizedException(AuthMessage.InvalidCredentials);
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new UnauthorizedException(AuthMessage.InvalidCredentials);
    }

    const accessTokenPayload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.tokenService.createAccessToken(accessTokenPayload);

    const tokenId = uuid();
    const rawRefreshToken = randomBytes(32).toString('base64url');
    const hashedRefreshToken = createHash('sha256').update(rawRefreshToken).digest('hex');

    await this.refreshRepo.createToken({
      tokenId,
      tokenHash: hashedRefreshToken,
      user: { connect: { id: user.id } },
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
      isRevoked: false,
    });

    await this.events.notify(
      user.id,
      'EMAIL',
      `You have logged in successfully at ${new Date().toLocaleString()}.`
    );

    return {
      message: PublicMessage.LoggedIn,
      accessToken,
      refreshToken: rawRefreshToken, 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        basketId: user.basket?.id,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException(AuthMessage.RefreshTokenMissing);
    }

    const hashed = createHash('sha256').update(refreshToken).digest('hex');
    const stored = await this.refreshRepo.findByHash(hashed);

    if (!stored || !stored.user || stored.expiresAt < new Date()) {
      throw new UnauthorizedException(AuthMessage.InvalidOrExpiredRefreshToken);
    }

    const payload = { sub: stored.user.id, email: stored.user.email, role: stored.user.role };
    const newAccessToken = this.tokenService.createAccessToken(payload);

    return {
      message: PublicMessage.LoggedIn,
      accessToken: newAccessToken,
      user: {
        id: stored.user.id,
        email: stored.user.email,
        username: stored.user.username,
        role: stored.user.role,
      },
    };
  }

  async revokeRefreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException(AuthMessage.RefreshTokenMissing);
    }

    const hashed = createHash('sha256').update(refreshToken).digest('hex');
    const stored = await this.refreshRepo.findByHash(hashed);

    if (!stored) {
      throw new NotFoundException(NotFoundMessage.NotFoundRefreshToken);
    }

    await this.refreshRepo.revokeToken(stored.id);

    await this.events.notify(
      stored.userId,
      'EMAIL',
      `Your refresh token has been revoked.`
    );

    return { message: PublicMessage.Deleted };
  }

  async sendOtp(userId: number, phoneNumber: string) {
    const otp = this.tokenService.createOtpToken();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

    await this.saveOtp(userId, phoneNumber, otp, expiresAt);

    await this.events.notify(
      userId,
      'SMS',
      `Your OTP code is ${otp}. It expires in 2 minutes.`
    );

    return {
      message: PublicMessage.SentOtp,
      otp, //! return for dev/testing only, remove in production
      expiresAt,
    };
  }

  async saveOtp(userId: number, phoneNumber: string, code: string, expiresAt: Date) {
    const existingOtp = await this.otpRepo.findByUser(userId);

    if (existingOtp) {
      await this.otpRepo.updateOtp(existingOtp.id, {
        code,
        expiredAt: expiresAt,
        isVerified: false,
        phoneNumber,
      });
    } else {
      await this.otpRepo.createOtp({
        user: { connect: { id: userId } },
        phoneNumber,
        code,
        expiredAt: expiresAt,
        isVerified: false,
      });
    }
  }

  async checkOtp(dto: VerifyOtpDto) {
    const otp = await this.otpRepo.findByUserPhone(dto.phoneNumber);
    if (!otp || otp.expiredAt < new Date()) {
      throw new UnauthorizedException(AuthMessage.OtpVerificationFailed);
    }

    const isVerified = await this.tokenService.verifyOtpToken(dto.phoneNumber, dto.code);
    if (!isVerified) {
      throw new UnauthorizedException(AuthMessage.OtpVerificationFailed);
    }

    await this.otpRepo.markVerified(otp.id);

    await this.events.notify(
      otp.userId,
      'SMS',
      `Your phone number ${dto.phoneNumber} has been verified successfully.`
    );

    return { message: PublicMessage.OtpVerified };
  }




  private async ensureUniqueFields(email?: string, phone?: string) {
    if (email) {
      const byEmail = await this.userRepo.findByEmail(email);
      if (byEmail) throw new ConflictException(ConflictMessage.EmailAlreadyExists);
    }
    if (phone) {
      const byPhone = await this.userRepo.findByPhone(phone);
      if (byPhone) throw new ConflictException(ConflictMessage.PhoneAlreadyExists);
    }
    return true;
  }

  private normalizeUsername(username: string) {
    return username?.trim().toLowerCase();
  }
}
