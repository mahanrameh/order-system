import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from 'libs/prisma';
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
import type { Request, Response } from 'express';
import { CookieKeys } from 'libs/common/src/enums/cookie.enum';
import { AuthService as TokenService } from '@app/auth';
import { CreateOtpDto, VerifyOtpDto } from 'libs/common/src/dtos/otp.dto';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class UserAuthService {
  constructor(
    @Inject(REQUEST) private request: Request,
    private prisma: PrismaService,
    private tokenService: TokenService,
  ) {}

  async register(dto: AuthRegisterDto) {
    const username = dto.username?.trim().toLowerCase();
    const email = dto.email.trim().toLowerCase();
    const phone = dto.phone?.trim();

    if (!username || !dto.password) {
      throw new BadRequestException(BadRequestMessage.InValidRegisterData);
    }

    await this.ensureUniqueFields(email, phone);

    try {
      const hashedPassword = await bcrypt.hash(dto.password, 12);

      const user = await this.prisma.client.user.create({
        data: {
          username,
          email,
          phone,
          password: hashedPassword,
        },
      });

      return {
        message: PublicMessage.Created,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      };
    } catch (err) {
      console.error('Registration failed:', err);
      throw new BadRequestException(AuthMessage.TryAgain);
    }
  }

  async login(dto: AuthLoginDto, res: Response) {
    const email = dto.email?.trim();
    const password = dto.password;

    if (!email || !password) {
      throw new BadRequestException(BadRequestMessage.InValidLoginData);
    }

    const user = await this.prisma.client.user.findUnique({ where: { email } });
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

    await this.prisma.client.refreshToken.create({
      data: {
        tokenId,
        tokenHash: hashedRefreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      },
    });

    res.cookie(CookieKeys.REFRESH, rawRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    });

    return {
      message: PublicMessage.LoggedIn,
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    };
  }

  async refreshToken(req: Request, res: Response) {
    const refreshToken = req.cookies[CookieKeys.REFRESH];
    if (!refreshToken) {
      throw new UnauthorizedException(AuthMessage.RefreshTokenMissing);
    }

    const hashed = createHash('sha256').update(refreshToken).digest('hex');
    const stored = await this.findRefreshToken(hashed);

    if (!stored || stored.expiresAt < new Date() || stored.isRevoked) {
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

  async revokeRefreshToken(req: Request, res: Response) {
    const refreshToken = req.cookies[CookieKeys.REFRESH];
    if (!refreshToken) {
      throw new UnauthorizedException(AuthMessage.RefreshTokenMissing);
    }

    const hashed = createHash('sha256').update(refreshToken).digest('hex');
    const stored = await this.findRefreshToken(hashed);

    if (!stored) {
      throw new NotFoundException(NotFoundMessage.NotFoundRefreshToken);
    }

    await this.prisma.client.refreshToken.update({
      where: { id: stored.id },
      data: { isRevoked: true },
    });

    res.clearCookie(CookieKeys.REFRESH);

    return { message: PublicMessage.Deleted };
  }

  async sendOtp(res: Response, userId: number, phoneNumber: string) {
    const otp = this.tokenService.createOtpToken();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

    await this.saveOtp(userId, phoneNumber, otp, expiresAt);

    res.cookie(CookieKeys.OTP, otp, {
      httpOnly: true,
      expires: expiresAt,
    }); //! For testing in development only

    res.json({
      message: PublicMessage.SentOtp,
      otp, //! Remove in production
    });
  }

  async saveOtp(userId: number, phoneNumber: string, code: string, expiresAt: Date) {
    const existingOtp = await this.prisma.client.otp.findFirst({
      where: { userId },
    });

    if (existingOtp) {
      await this.prisma.client.otp.update({
        where: { id: existingOtp.id },
        data: { code, expiredAt: expiresAt, isVerified: false, phoneNumber },
      });
    } else {
      await this.prisma.client.otp.create({
        data: {
          userId,
          phoneNumber,
          code,
          expiredAt: expiresAt,
        },
      });
    }
  }

  async checkOtp(dto: VerifyOtpDto) {
    const isVerified = await this.tokenService.verifyOtpToken(dto.phoneNumber, dto.code);

    if (!isVerified) {
      throw new UnauthorizedException(AuthMessage.OtpVerificationFailed);
    }

    return {
      message: PublicMessage.OtpVerified,
    };
  }

  async findRefreshToken(token: string) {
    const validRefreshToken = await this.prisma.client.refreshToken.findFirst({
      where: { tokenHash: token, isRevoked: false },
      include: { user: true },
    });
    if (!validRefreshToken) {
      throw new NotFoundException(NotFoundMessage.NotFoundRefreshToken);
    }
    return validRefreshToken;
  }

  private async ensureUniqueFields(email?: string, phone?: string) {
    if (email) {
      const byEmail = await this.prisma.client.user.findUnique({ where: { email } });
      if (byEmail) throw new ConflictException(ConflictMessage.EmailAlreadyExists);
    }
    if (phone) {
      const byPhone = await this.prisma.client.user.findUnique({ where: { phone } });
      if (byPhone) throw new ConflictException(ConflictMessage.PhoneAlreadyExists);
    }
    return true;
  }

  normalizeUsername(username: string) {
    return username?.trim().toLowerCase();
  }
}
