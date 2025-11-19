import { Module } from '@nestjs/common';
import { UserAuthController } from './auth/user-auth.controller';
import { UserAuthService } from './auth/user-auth.service';
import { UserService } from './user/user.service';
import { UserController } from './user/user.controller';
import { PrismaModule } from 'libs/prisma';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@app/auth'; 
import jwtConfig from '@app/auth/configs/jwt.config';

@Module({
  imports: [
    ConfigModule.forFeature(jwtConfig),
    PrismaModule,
    AuthModule, 
  ],
  controllers: [UserAuthController, UserController],
  providers: [UserAuthService, UserService],
  exports: [UserAuthService],
})
export class UserAuthModule {}
