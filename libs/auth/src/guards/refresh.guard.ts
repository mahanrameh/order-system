import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class RefreshAuthGuard extends AuthGuard('refresh') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();

    if (err) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (!req.refreshToken) {
      throw new UnauthorizedException('Refresh token required');
    }

    if (!user) {
      throw new UnauthorizedException('Refresh token validation failed');
    }

    return user;
  }
}