import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AuthMessage } from 'libs/common/src/enums/message.enum';
import { ExtractJwt } from 'passport-jwt';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();
    console.log('JwtAuthGuard user:', user);

    if (err) {
      throw new UnauthorizedException('Invalid access token');
    }

    if (!req.rawAccessToken) {
      const raw = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
      if (raw) (req as any).rawAccessToken = raw;

      console.log('JwtAuthGuard token:', raw);
    }

    if (!user) {
      throw new UnauthorizedException(AuthMessage.LoginRequired);
    }

    return user;
  }
}
