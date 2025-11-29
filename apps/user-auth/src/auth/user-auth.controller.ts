import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { UserAuthService } from './user-auth.service';
import { AuthLoginDto, AuthRegisterDto } from '../dto/user.dto';
import { CreateOtpDto, VerifyOtpDto } from 'libs/common/src/dtos/otp.dto';
import { SwaggerConsumes } from 'libs/common/src/enums/swagger-consumes.enum';
import { RefreshAuthGuard } from '@app/auth/guards/refresh.guard';
import { JwtAuthGuard } from '@app/auth/guards/access.guard';

const REFRESH_TOKEN_EXPIRY_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

@ApiBearerAuth('bearer')
@Controller('auth')
export class UserAuthController {
  constructor(private readonly authService: UserAuthService) {}

  @Post('register')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async register(@Body() dto: AuthRegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  @HttpCode(200)
  async login(@Body() dto: AuthLoginDto, @Res() res: Response) {
    const result = await this.authService.login(dto);

    // Set refresh token cookie
    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      expires: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
    });

    return res.json({
      message: result.message,
      accessToken: result.accessToken,
      user: result.user,
    });
  }

  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  async refresh(@Req() req: Request) {
    const refreshToken = req.cookies['refresh_token'];
    return this.authService.refreshToken(refreshToken);
  }

  @UseGuards(RefreshAuthGuard)
  @Post('revoke')
  async revoke(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['refresh_token'];
    const result = await this.authService.revokeRefreshToken(refreshToken);

    res.clearCookie('refresh_token');
    return res.json(result);
  }

  @UseGuards(JwtAuthGuard)
  @Post('send-otp')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async sendOtp(@Body() dto: CreateOtpDto, @Res() res: Response) {
    const result = await this.authService.sendOtp(dto.userId, dto.phoneNumber);

    // ⚠️ For dev/testing only: set OTP in cookie
    res.cookie('otp', result.otp, {
      httpOnly: true,
      expires: result.expiresAt,
    });

    return res.json(result);
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-otp')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.checkOtp(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('resend-otp')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async resendOtp(@Body() dto: CreateOtpDto, @Res() res: Response) {
    const result = await this.authService.sendOtp(dto.userId, dto.phoneNumber);

    res.cookie('otp', result.otp, {
      httpOnly: true,
      expires: result.expiresAt,
    });

    return res.json(result);
  }
}
