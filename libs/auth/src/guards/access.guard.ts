import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt } from 'passport-jwt';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();

    if (err) {
      throw new UnauthorizedException('Invalid access token');
    }
    try {
      if (!req.rawAccessToken) {
        const raw = ExtractJwt.fromAuthHeaderAsBearerToken()(req) as string | null;
        if (raw) req.rawAccessToken = raw;
      }
    } catch {}

    if (!user) {
      throw new UnauthorizedException('Login required');
    }

    return user;
  }
}