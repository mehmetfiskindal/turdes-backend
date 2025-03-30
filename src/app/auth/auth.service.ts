import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UserDto } from './dto/user.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Register method
  async register(userDto: UserDto) {
    const existingUser = await this.prismaService.user.findUnique({
      where: { email: userDto.email },
    });

    if (existingUser) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }

    const passwordHash: string = await bcrypt.hash(userDto.password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await this.prismaService.user.create({
      data: {
        email: userDto.email,
        name: userDto.name,
        phone: userDto.phone,
        role: userDto.role,
        passwordHash: passwordHash,
        isEmailVerified: false,
        verificationToken: verificationToken,
      },
    });

    await this.sendVerificationEmail(user.email, verificationToken);

    return { message: 'User registered successfully. Please verify your email.' };
  }

  private async sendVerificationEmail(email: string, token: string) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify your email',
      text: `Please verify your email by clicking on the following link: ${verificationUrl}`,
    });
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const user = await this.prismaService.user.findUnique({
      where: { email: verifyEmailDto.email },
    });

    if (!user || user.verificationToken !== verifyEmailDto.token) {
      throw new HttpException('Invalid or expired verification token', HttpStatus.BAD_REQUEST);
    }

    await this.prismaService.user.update({
      where: { email: verifyEmailDto.email },
      data: {
        isEmailVerified: true,
        verificationToken: null,
      },
    });

    return { message: 'Email verified successfully' };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user || user.isEmailVerified) {
      throw new HttpException('Invalid request', HttpStatus.BAD_REQUEST);
    }

    const newToken = crypto.randomBytes(32).toString('hex');

    await this.prismaService.user.update({
      where: { email },
      data: { verificationToken: newToken },
    });

    await this.sendVerificationEmail(email, newToken);

    return { message: 'Verification email resent successfully' };
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
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    const tokens = this.generateToken(user);
    await this.prismaService.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refresh_token },
    });
    return tokens;
  }

  // Token generation
  generateToken(user: User) {
    const payload = { username: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, {
        expiresIn: '7d', // 7 gün
      }),
      role: user.role,
      userId: user.id,
    };
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

    console.log('Retrieved user:', user); // Add logging

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

  // Validate user by ID
  async validateUserById(userId: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.log('User not found by ID'); // Add logging
      return null;
    }

    const { passwordHash, ...result } = user; // eslint-disable-line @typescript-eslint/no-unused-vars
    return result;
  }

  // Refresh token validation and generation
  async refreshToken(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_SECRET,
      });

      const user = await this.prismaService.user.findUnique({
        where: {
          id: decoded.sub,
          refreshToken: refreshToken,
        },
      });

      if (!user) {
        throw new HttpException(
          'Invalid refresh token',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const payload = { username: user.email, sub: user.id, role: user.role };
      return {
        access_token: this.jwtService.sign(payload),
        refresh_token: this.jwtService.sign(payload, {
          expiresIn: '7d',
        }),
      };
    } catch (e) {
      throw new HttpException(
        'Refresh token expired or invalid',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  // Reset password method
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.prismaService.user.findUnique({
      where: { email: resetPasswordDto.email },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const newPasswordHash: string = await bcrypt.hash(
      resetPasswordDto.newPassword,
      10,
    );
    await this.prismaService.user.update({
      where: { email: resetPasswordDto.email },
      data: { passwordHash: newPasswordHash },
    });

    return { message: 'Password reset successfully' };
  }
}
