import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import type { ConfigType } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import jwtConfig from "../configs/jwt.config";
import { UserAuthService } from "apps/user-auth/src/auth/user-auth.service";
import { AccessTokenPayload } from "../types/payload";
import { AuthService } from "../auth.service";
import type { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject(jwtConfig.KEY) private config: ConfigType<typeof jwtConfig>,
    private authService: UserAuthService,
    private tokenService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.secret as string,
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: AccessTokenPayload) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req) as string | null;

    if (!token) {
      throw new UnauthorizedException('Access token missing');
    }

    try {
      const verified = this.tokenService.verifyAccessToken(token);

      req.rawAccessToken = token;

      return verified ?? payload;
    } catch (err) {
      throw new UnauthorizedException('Invalid access token');
    }
  }
}