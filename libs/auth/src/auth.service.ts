import { Injectable, NotAcceptableException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AccessTokenPayload } from "./types/payload";
import { PrismaService } from "libs/prisma";
import { AuthMessage, NotFoundMessage } from "libs/common/src/enums/message.enum";


@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private prisma: PrismaService
    ){}

    createAccessToken(payload: AccessTokenPayload) {
        const token = this.jwtService.sign(payload, {
            secret: process.env.COOKIE_SECRET,
            expiresIn: '1d' //! In production this time should be much lower
        })
        
        return token;
    }
    
    verifyAccessToken(token: string): AccessTokenPayload {
    try {
        return this.jwtService.verify<AccessTokenPayload>(token, {
        secret: process.env.COOKIE_SECRET,
        });
    } catch (err) {
        throw new UnauthorizedException('Invalid access token');
    }
    }

    createOtpToken(): string {
    return Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit
    }

    async verifyOtpToken(phoneNumber: string, code: string): Promise<boolean> {
    const otpRecord = await this.prisma.client.otp.findFirst({
        where: {
        phoneNumber,
        code,
        },
    });

    if (!otpRecord) {
        throw new NotAcceptableException(NotFoundMessage.NotFound);
    }

    if (otpRecord.isVerified) {
        throw new UnauthorizedException(AuthMessage.AlreadyExistAccount);
    }

    const now = Date.now();
    const expiredAt = new Date(otpRecord.expiredAt).getTime();

    if (now > expiredAt) {
        throw new UnauthorizedException(AuthMessage.ExpiredCode);
    }

    await this.prisma.client.otp.update({
        where: { id: otpRecord.id },
        data: { isVerified: true },
    });

    return true;
    }


}
