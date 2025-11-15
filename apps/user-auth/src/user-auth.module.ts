import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserAuthController } from './auth/user-auth.controller';
import { UserAuthService } from './auth/user-auth.service';
import { AuthService } from '@app/auth';
import { PrismaModule } from 'libs/prisma';
import { UserService } from './user/user.service';
import { UserController } from './user/user.controller';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.COOKIE_SECRET || 'defaultSecret',
      signOptions: { expiresIn: '60m' }, 
    }),
  ],
  controllers: [UserAuthController, UserController],
  providers: [UserAuthService, AuthService, UserService],
  exports: [UserAuthService, AuthService],
})
export class UserAuthModule {}