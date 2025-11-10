import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AccessTokenPayload, RefreshTokenPayload } from "./types/payload";


@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService
    ){}

    createAccessToken(payload: AccessTokenPayload) {
        const token = this.jwtService.sign(payload, {
            secret: process.env.ACCESS_TOKEN_SECRET_KEY,
            expiresIn: '1d'
        })
        
        return token;
    }
    
    verifyAccessToken(token: string): AccessTokenPayload {
    try {
        return this.jwtService.verify<AccessTokenPayload>(token, {
        secret: process.env.ACCESS_TOKEN_SECRET_KEY,
        });
    } catch (err) {
        throw new UnauthorizedException('Invalid access token');
    }
    }


    createRefreshToken(payload: RefreshTokenPayload) {
    const token = this.jwtService.sign(payload, {
        secret: process.env.REFRESH_TOKEN_SECRET_KEY,
        expiresIn: '30d',
    });
    return token;
    }

    verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
        return this.jwtService.verify<RefreshTokenPayload>(token, {
        secret: process.env.REFRESH_TOKEN_SECRET_KEY,
        });
    } catch (err) {
        throw new UnauthorizedException('Invalid refresh token');
    }
    }
}