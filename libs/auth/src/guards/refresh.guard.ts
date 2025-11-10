import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt } from 'passport-jwt';

@Injectable()
export class RefreshAuthGuard extends AuthGuard('refresh-jwt') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();

    if (err) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    try {
      if (!req.refreshToken) {
        const raw = ExtractJwt.fromBodyField('refreshToken')(req) as string | null;
        if (raw) req.refreshToken = raw;
      }
    } catch {}

    if (!user) {
      throw new UnauthorizedException('Refresh token required');
    }

    return user;
  }
}