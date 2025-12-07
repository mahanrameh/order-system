import { Module, Global } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'libs/prisma';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/access.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import jwtConfig from './configs/jwt.config';

@Global() 
@Module({
  imports: [
    ConfigModule.forFeature(jwtConfig),
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.COOKIE_SECRET || 'defaultSecret',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [AuthService, JwtStrategy, LocalStrategy],
  exports: [AuthService, PassportModule, JwtModule, JwtStrategy, LocalStrategy],
})
export class AuthModule {}
