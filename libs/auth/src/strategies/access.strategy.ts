import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import jwtConfig from '../configs/jwt.config';
import { AccessTokenPayload } from '../types/payload';
import { AuthService } from '../auth.service';
import type { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject(jwtConfig.KEY) private config: ConfigType<typeof jwtConfig>,
    private tokenService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.COOKIE_SECRET || 'defaultSecret',
      ignoreExpiration: false,
      passReqToCallback: true,
    } as StrategyOptionsWithRequest);

  }

  async validate(req: Request, payload: AccessTokenPayload) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    console.log(token);
    if (!token) throw new UnauthorizedException('Access token missing');

    try {
      const verified = this.tokenService.verifyAccessToken(token);
      console.log('Payload:', payload);
      return { sub: payload.sub, email: payload.email, role: payload.role };
    } catch (err) {
      console.error('JWT validation failed:', err.message);
      throw new UnauthorizedException('Invalid access token');
    }
  }
}
