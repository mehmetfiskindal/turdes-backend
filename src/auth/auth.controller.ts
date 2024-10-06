// Auth Controller (auth/auth.controller.ts)
import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto } from './dto/user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { User } from '../models/user.model';
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('register')
  async register(@Body() userDto: UserDto) {
    return this.authService.register(userDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('refresh')
  async refreshToken(@Body() refreshRequest: { refreshToken: string }) {
    const { refreshToken } = refreshRequest;

    try {
      // Refresh token'ı doğrula
      const decoded = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_SECRET,
      });
      const user = await User.findOne({
        where: { id: decoded.userId, refreshToken },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Yeni access token oluşturma
      const payload = { userId: user.id, email: user.email, role: user.role };
      const newAccessToken = this.jwtService.sign(payload, {
        expiresIn: '15m',
        secret: process.env.JWT_SECRET,
      });

      return { accessToken: newAccessToken };
    } catch (e) {
      console.error(e);
      throw new UnauthorizedException('Refresh token expired or invalid');
    }
  }
}
