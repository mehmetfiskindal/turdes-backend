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
import { Throttle } from '@nestjs/throttler';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
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
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30); // Token valid for 30 minutes

    const user = await this.prismaService.user.create({
      data: {
        email: userDto.email,
        name: userDto.name,
        phone: userDto.phone,
        role: userDto.role,
        passwordHash: passwordHash,
        isEmailVerified: false, // Her zaman false olarak başlar
        verificationToken: verificationToken, // Her zaman sistem tarafından üretilir
        tokenExpiresAt: expiresAt, // Save expiration time
      },
    });

    await this.sendVerificationEmail(user.email, verificationToken);

    return {
      message: 'User registered successfully. Please verify your email.',
    };
  }

  private async sendVerificationEmail(email: string, token: string) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

    await this.transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: 'Verify your email',
      text: `Please verify your email by clicking on the following link: ${verificationUrl}

This link contains both your verification token and email address to complete the verification process automatically.

If you need to enter these details manually:
- Your verification token: ${token}
- Your email: ${email}`,
      html: `
        <h2>Email Verification</h2>
        <p>Please verify your email by clicking on the following link:</p>
        <p><a href="${verificationUrl}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
        <p>Or copy and paste this URL into your browser:</p>
        <p>${verificationUrl}</p>
        <p>This link contains both your verification token and email address to complete the verification process automatically.</p>
        <p>If you need to enter these details manually:</p>
        <ul>
          <li><strong>Your verification token:</strong> ${token}</li>
          <li><strong>Your email:</strong> ${email}</li>
        </ul>
      `,
    });
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const user = await this.prismaService.user.findUnique({
      where: { email: verifyEmailDto.email },
    });

    if (
      !user ||
      user.verificationToken !== verifyEmailDto.token ||
      new Date() > user.tokenExpiresAt
    ) {
      if (new Date() > user.tokenExpiresAt) {
        throw new HttpException(
          'Verification token expired. Please request a new verification email.',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'Invalid verification token',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prismaService.user.update({
      where: { email: verifyEmailDto.email },
      data: {
        isEmailVerified: true,
        verificationToken: null,
      },
    });

    // Send welcome email after successful verification
    await this.transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: verifyEmailDto.email,
      subject: 'Welcome to Our Platform!',
      text: 'Your email has been successfully verified. Welcome to our platform!',
    });

    return { message: 'Email verified successfully' };
  }

  @Throttle({ default: { limit: 3, ttl: 300000 } }) // Allow 3 requests per 5 minutes
  async resendVerificationEmail(email: string) {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user || user.isEmailVerified) {
      throw new HttpException('Invalid request', HttpStatus.BAD_REQUEST);
    }

    const newToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30); // Token valid for 30 minutes

    await this.prismaService.user.update({
      where: { email },
      data: { verificationToken: newToken, tokenExpiresAt: expiresAt },
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

    if (!user.isEmailVerified) {
      throw new HttpException(
        'Email not verified. Please verify your email or request a new verification email.',
        HttpStatus.UNAUTHORIZED,
      );
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
