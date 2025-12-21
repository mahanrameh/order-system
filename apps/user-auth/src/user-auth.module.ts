import { Module } from '@nestjs/common';
import { UserAuthController } from './auth/user-auth.controller';
import { UserAuthService } from './auth/user-auth.service';
import { UserService } from './user/user.service';
import { UserController } from './user/user.controller';
import { PrismaModule } from 'libs/prisma';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@app/auth'; 
import jwtConfig from '@app/auth/configs/jwt.config';
import { UserAuthRepository } from './repositories/user-auth.repository';
import { UserRepository } from './repositories/user.repository';
import { OtpRepository } from './repositories/otp.repository';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { MessagingModule } from 'libs/messaging';

@Module({
  imports: [
    ConfigModule.forFeature(jwtConfig),
    PrismaModule,
    AuthModule,
    MessagingModule
  ],
  controllers: [UserAuthController, UserController],
  providers: [
    UserAuthService, 
    UserService,
    UserAuthRepository,
    UserRepository,
    OtpRepository,
    RefreshTokenRepository
  ],
  exports: [UserAuthService],
})
export class UserAuthModule {}
