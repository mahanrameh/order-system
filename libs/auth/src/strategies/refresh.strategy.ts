import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { Strategy } from "passport-custom";
import { UserAuthService } from "apps/user-auth/src/auth/user-auth.service";
import { createHash } from "crypto";

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(
    private authService: UserAuthService,
  ) {
    super();
  }

  async validate(req: Request): Promise<any> {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException("Refresh token missing");
    }

   
    const hashed = createHash("sha256").update(refreshToken).digest("hex");

   
    const stored = await this.authService.findRefreshToken(hashed);
    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }

    
    req.refreshToken = refreshToken;

    
    return {
      sub: stored.user.id,
      email: stored.user.email,
      role: stored.user.role,
    };
  }
}
