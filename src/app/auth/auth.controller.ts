import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Query,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Throttle } from '@nestjs/throttler';
import { UserDto } from './dto/user.dto';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { RefreshTokenDto } from './dto/refresh.dto';
import { AuthGuard } from '@nestjs/passport';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully.' })
  @ApiResponse({ status: 400, description: 'User already exists.' })
  @ApiBody({ type: UserDto }) // Body'nin tipini Swagger için belirttik
  async register(@Body() userDto: UserDto) {
    return this.authService.register(userDto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({
    status: 200,
    description: 'Access token refreshed successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token.',
  })
  @ApiBody({ type: RefreshTokenDto }) // Body'nin tipini Swagger için belirttik
  async refreshToken(@Body() refresh: RefreshTokenDto) {
    return this.authService.refreshToken(refresh.refreshToken);
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 300000 } })
  @ApiOperation({ summary: 'Log in a user' })
  @ApiResponse({ status: 200, description: 'User logged in successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseGuards(AuthGuard('local')) // LocalStrategy kullanarak kimlik doğrulama
  async login(@Body() loginDto: LoginDto) {
    const token = await this.authService.login(loginDto);
    return token; // Direkt JSON yanıtı döndürmek NestJS'de daha yaygın bir yaklaşımdır
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset user password' })
  @ApiResponse({ status: 200, description: 'Password reset successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid request.' })
  @ApiBody({ type: ResetPasswordDto })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify user email' })
  @ApiResponse({ status: 200, description: 'Email verified successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid request.' })
  @ApiBody({ type: VerifyEmailDto })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Get('verify-email')
  @ApiOperation({ summary: 'Verify user email via link' })
  @ApiResponse({ status: 200, description: 'Email verified successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid request.' })
  async verifyEmailGet(
    @Query('token') token: string,
    @Query('email') email: string,
    @Res() res: Response,
  ) {
    try {
      await this.authService.verifyEmail({ email, token });

      // MVC yaklaşımı: Template'e veri gönderiyoruz
      return res.render('auth/verify-email-success', {
        message:
          'E-posta adresiniz başarıyla doğrulandı! Artık hesabınıza giriş yapabilirsiniz.',
        loginUrl: this.configService.get<string>('FRONTEND_URL') || '/',
      });
    } catch (error) {
      // Hata tipine göre özel mesajlar ve davranışlar
      let showResend = false;
      let errorMessage =
        'Doğrulama işlemi sırasında bir hata oluştu. Lütfen tekrar deneyiniz.';

      if (error.message && error.message.includes('expired')) {
        errorMessage =
          'Doğrulama bağlantısının süresi dolmuş. Lütfen yeni bir doğrulama e-postası talep ediniz.';
        showResend = true;
      } else if (
        error.message &&
        error.message.includes('Invalid verification token')
      ) {
        errorMessage =
          'Geçersiz doğrulama kodu. Lütfen e-postadaki bağlantıyı kontrol ediniz.';
      }

      // MVC yaklaşımı: Hata durumunda ilgili template'e veri gönderiyoruz
      const frontend = this.configService.get<string>('FRONTEND_URL') || '';
      return res.render('auth/verify-email-error', {
        message: errorMessage,
        showResend: showResend,
        resendUrl: `${frontend}/resend-verification?email=${encodeURIComponent(email)}`,
        homeUrl: frontend || '/',
      });
    }
  }

  @Post('resend-verification-email')
  @ApiOperation({ summary: 'Resend verification email' })
  @ApiResponse({
    status: 200,
    description: 'Verification email resent successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid request.' })
  async resendVerificationEmail(@Body('email') email: string) {
    return this.authService.resendVerificationEmail(email);
  }
}
