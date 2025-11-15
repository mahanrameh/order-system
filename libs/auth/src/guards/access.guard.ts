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

    if (!req.rawAccessToken) {
      const raw = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
      if (raw) req.rawAccessToken = raw;
    }

    if (!user) {
      throw new UnauthorizedException('Login required');
    }

    return user;
  }
}