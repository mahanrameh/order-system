import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiConsumes } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { UserAuthService } from './user-auth.service';
import { AuthLoginDto, AuthRegisterDto } from '../dto/user.dto';
import { CreateOtpDto, VerifyOtpDto } from 'libs/common/src/dtos/otp.dto';
import { SwaggerConsumes } from 'libs/common/src/enums/swagger-consumes.enum';
import { LocalAuthGuard } from '@app/auth/guards/local.guard';
import { RefreshAuthGuard } from '@app/auth/guards/refresh.guard';
import { JwtAuthGuard } from '@app/auth/guards/access.guard';

@Controller('auth')
export class UserAuthController {
  constructor(private readonly authService: UserAuthService) {}

  @Post('register')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async register(@Body() dto: AuthRegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  @HttpCode(200)
  async login(@Body() dto: AuthLoginDto, @Res() res: Response) {
    return this.authService.login(dto, res);
  }

  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    return this.authService.refreshToken(req, res);
  }

  @UseGuards(RefreshAuthGuard)
  @Post('revoke')
  async revoke(@Req() req: Request, @Res() res: Response) {
    return this.authService.revokeRefreshToken(req, res);
  }

  @Post('send-otp')
  @UseGuards(JwtAuthGuard)
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async sendOtp(@Body() dto: CreateOtpDto, @Res() res: Response) {
    return this.authService.sendOtp(res, dto.userId, dto.phoneNumber);
  }

  @Post('verify-otp')
  @UseGuards(JwtAuthGuard)
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.checkOtp(dto);
  }

  @Post('resend-otp')
  @UseGuards(JwtAuthGuard)
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async resendOtp(@Body() dto: CreateOtpDto, @Res() res: Response) {
    return this.authService.sendOtp(res, dto.userId, dto.phoneNumber);
  }
}
