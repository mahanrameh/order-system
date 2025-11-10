import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import type { ConfigType } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthService } from "../auth.service";
import refreshConfig from "../configs/refresh.config";
import { RefreshTokenPayload } from "../types/payload";
import { UserAuthService } from "apps/user-auth/src/user-auth.service";

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh-jwt') {
  constructor(
    @Inject(refreshConfig.KEY) private config: ConfigType<typeof refreshConfig>,
    private authService: UserAuthService,
    private tokenService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField("refreshToken"),
      secretOrKey: config.secret as string,
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: RefreshTokenPayload) {
    const refreshToken = req.body?.refreshToken as string | undefined;

    if (!refreshToken) {
      throw new UnauthorizedException("Refresh token missing");
    }

    try {
      const verified = this.tokenService.verifyRefreshToken(refreshToken);
      req.refreshToken = refreshToken;
      return verified ?? payload;
    } catch (err) {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }
}