import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Res,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto } from './dto/user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { RefreshTokenDto } from './dto/refresh.dto';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';

@Controller('auth')
@ApiTags('Authentication') // Api Tag ekledik
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService // Prisma servisi ekledik
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully.' })
  @ApiResponse({ status: 400, description: 'User already exists.' })
  @ApiBody({ type: UserDto }) // Body'nin tipini Swagger için belirttik
  async register(@Body() userDto: UserDto) {
    return this.authService.register(userDto);
  }

  @Post('login')
  @HttpCode(200)
  @UseGuards(AuthGuard('local')) // Assuming you're using local strategy for authentication
  @ApiOperation({ summary: 'Log in a user' }) // Provides a description in Swagger
  @ApiResponse({ status: 200, description: 'User logged in successfully.' }) // Successful response
  @ApiResponse({ status: 401, description: 'Invalid credentials.' }) // Error response for invalid credentials
  @ApiBody({ type: LoginDto }) // Specifies the body for Swagger, in this case, the LoginUserDto
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const tokens = await this.authService.login(loginDto);

    // Set refresh token as a cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
    });

    return res.json({
      accessToken: tokens.accessToken,
    });
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
    const { refreshToken } = refresh;
    try {
      // Refresh token'ı doğrula
      const decoded = this.jwtService.verify(refresh.refreshToken, {
        secret: process.env.JWT_SECRET,
      });

      // Kullanıcıyı Prisma ile sorgula
      const user = await this.prismaService.user.findUnique({
        where: {
          id: decoded.userId,
          refreshToken: refreshToken,
        },
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
