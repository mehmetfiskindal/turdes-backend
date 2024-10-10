import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UserDto } from './dto/user.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '@prisma/client'; // Prisma'dan otomatik oluşturulan User tipi
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  // Register method
  async register(userDto: UserDto) {
    const existingUser = await this.prismaService.user.findUnique({
      where: { email: userDto.email },
    });

    if (existingUser) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }

    const passwordHash: string = await bcrypt.hash(userDto.password, 10);
    const user = await this.prismaService.user.create({
      data: {
        name: userDto.name,
        email: userDto.email,
        phone: userDto.phone,
        role: userDto.role,
        passwordHash: passwordHash, // Hashlenmiş şifre kaydediliyor
      },
    });

    return this.generateToken(user);
  }

  // Login method
  async login(loginDto: LoginDto) {
    const user = await this.prismaService.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    if (
      typeof loginDto.password !== 'string' ||
      typeof user.passwordHash !== 'string'
    ) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash
    );
    if (!isPasswordValid) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    return this.generateToken(user);
  }

  // Token generation
  generateToken(user: User) {
    const payload = { username: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, {
        expiresIn: '7d', // 7 gün
      }),
    };
  }

  // Logout method
  async logout(userId: number) {
    await this.prismaService.user.update({
      where: { id: userId },
      data: { refreshToken: null }, // Kullanıcının refresh token'ı null yapılıyor
    });
    return { message: 'User logged out successfully' };
  }

  // User validation method
  async validateUser(email: string, password: string) {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log('User not found'); // Add logging
      return null;
    }

    if (typeof password !== 'string' || typeof user.passwordHash !== 'string') {
      console.log('Invalid password or passwordHash type'); // Add logging
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      console.log('Invalid password'); // Add logging
      return null;
    }

    const { passwordHash, ...result } = user; // eslint-disable-line @typescript-eslint/no-unused-vars
    return result;
  }
}
