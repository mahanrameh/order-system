import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UserAuthService } from 'apps/user-auth/src/user-auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(
    private readonly authService: UserAuthService
  ) {
    super({
      usernameField: 'email',
      passReqToCallback: false,
    });
  }

async validate(email: string, password: string): Promise<any> {
  try {
    const user = await this.authService.login(email, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  } catch (err) {
    throw new UnauthorizedException(err.message);
  }
}
}