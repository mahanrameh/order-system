import { AuthService } from '@app/auth';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class UserAuthService {
    constructor(
    @Inject(REQUEST) private request: Request,
    private tokenService: AuthService
  ) {}
    async login (email: string, password: string) {
      return true;
    }
    async validateJwtUser (email: string, password: string) {
      return true;
    }
}
