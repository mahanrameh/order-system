import { Controller, Get } from '@nestjs/common';
import { UserAuthService } from './user-auth.service';

@Controller()
export class UserAuthController {
  constructor(private readonly userAuthService: UserAuthService) {}

  @Get()
  getHello(): string {
    return this.userAuthService.getHello();
  }
}
