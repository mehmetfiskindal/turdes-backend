import * as crypto from 'crypto';
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
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService, // Inject MailerService
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
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30); // Token valid for 30 minutes

    // API üzerinden yapılan tüm kayıtlarda rol 'user' olarak ayarlanır
    // Admin rolü sadece veritabanı script'i ile atanabilir
    const user = await this.prismaService.user.create({
      data: {
        email: userDto.email,
        name: userDto.name,
        phone: userDto.phone,
        role: 'user', // Kullanıcı tarafından gönderilen rol bilgisi dikkate alınmaz, her zaman 'user'
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

  // E-posta doğrulama e-postası gönderen metot
  async sendVerificationEmail(
    userOrEmail: User | string,
    token: string,
  ): Promise<void> {
    let user: User;

    // Eğer string tipinde bir email parametresi geçirildiyse, kullanıcıyı veritabanından al
    if (typeof userOrEmail === 'string') {
      user = await this.prismaService.user.findUnique({
        where: { email: userOrEmail },
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
    } else {
      // Doğrudan User nesnesi verilmiş
      user = userOrEmail;
    }

    // Test ortamında e-posta gönderimi yapma
    if (process.env.NODE_ENV === 'test') {
      console.log(
        `TEST MODE: Email would be sent to ${user.email} with token ${token}`,
      );
      return;
    }

    // Normal ortamda e-posta gönderimi
    // HOST_URL değişkenini kontrol edelim ve düzgün bir URL oluşturalım
    const baseUrl =
      process.env.FRONTEND_URL || 'https://turdes-production.up.railway.app';
    const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${token}&email=${encodeURIComponent(user.email)}`;

    await this.mailerService.sendMail({
      from: process.env.MAIL_FROM,
      to: user.email,
      subject: 'Verify your email',
      text: `Please verify your email by clicking on the following link: ${verificationUrl}

This link contains both your verification token and email address to complete the verification process automatically.

If you need to enter these details manually:
- Your verification token: ${token}
- Your email: ${user.email}`,
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
          <li><strong>Your email:</strong> ${user.email}</li>
        </ul>
      `,
    });
  }

  // Şifre sıfırlama e-postası gönderen metot
  async sendPasswordResetEmail(
    userOrEmail: User | string,
    token: string,
  ): Promise<void> {
    let user: User;

    // Eğer string tipinde bir email parametresi geçirildiyse, kullanıcıyı veritabanından al
    if (typeof userOrEmail === 'string') {
      user = await this.prismaService.user.findUnique({
        where: { email: userOrEmail },
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
    } else {
      // Doğrudan User nesnesi verilmiş
      user = userOrEmail;
    }

    // Test ortamında e-posta gönderimi yapma
    if (process.env.NODE_ENV === 'test') {
      console.log(
        `TEST MODE: Password reset email would be sent to ${user.email} with token ${token}`,
      );
      return;
    }

    // Normal ortamda e-posta gönderimi
    const resetUrl = `${process.env.HOST_URL}auth/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;

    await this.mailerService.sendMail({
      from: process.env.MAIL_FROM,
      to: user.email,
      subject: 'Şifre Sıfırlama İsteği',
      text: `Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın: ${resetUrl}

Bu bağlantı şifre sıfırlama işlemi için hem token hem de e-posta adresinizi içerir.

Bu bilgileri manuel olarak girmeniz gerekirse:
- Şifre sıfırlama tokeniniz: ${token}
- E-posta adresiniz: ${user.email}

Bu e-posta size yanlışlıkla geldiyse, lütfen dikkate almayın.`,
      html: `
        <h2>Şifre Sıfırlama</h2>
        <p>Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
        <p><a href="${resetUrl}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Şifremi Sıfırla</a></p>
        <p>Veya bu URL'yi tarayıcınıza kopyalayıp yapıştırın:</p>
        <p>${resetUrl}</p>
        <p>Bu bağlantı şifre sıfırlama işlemi için hem token hem de e-posta adresinizi içerir.</p>
        <p>Bu bilgileri manuel olarak girmeniz gerekirse:</p>
        <ul>
          <li><strong>Şifre sıfırlama tokeniniz:</strong> ${token}</li>
          <li><strong>E-posta adresiniz:</strong> ${user.email}</li>
        </ul>
        <p>Bu e-posta size yanlışlıkla geldiyse, lütfen dikkate almayın.</p>
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
    await this.mailerService.sendMail({
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
      throw new HttpException(
        'E-posta adresi veya şifre hatalı',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (
      typeof loginDto.password !== 'string' ||
      typeof user.passwordHash !== 'string'
    ) {
      throw new HttpException(
        'Geçersiz kimlik bilgileri',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new HttpException(
        'E-posta adresi veya şifre hatalı',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!user.isEmailVerified) {
      throw new HttpException(
        'E-posta adresiniz doğrulanmadı. Lütfen e-postanızı doğrulayın veya yeni bir doğrulama e-postası talep edin.',
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
      if (!refreshToken || refreshToken.trim() === '') {
        throw new HttpException(
          'Yenileme tokeni sağlanmadı',
          HttpStatus.BAD_REQUEST,
        );
      }

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
          'Geçersiz yenileme tokeni. Lütfen tekrar giriş yapın.',
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
      if (e instanceof HttpException) {
        throw e;
      }
      throw new HttpException(
        'Yenileme tokeniniz süresi dolmuş veya geçersiz. Lütfen tekrar giriş yapın.',
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
      throw new HttpException(
        'Bu e-posta adresi ile kayıtlı bir kullanıcı bulunamadı',
        HttpStatus.NOT_FOUND,
      );
    }

    // Eğer kullanıcının e-posta doğrulaması yoksa
    if (!user.isEmailVerified) {
      throw new HttpException(
        'E-posta adresiniz doğrulanmadı. Lütfen önce e-posta adresinizi doğrulayın.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Mevcut şifre kontrolü (isteğe bağlı, güvenlik için eklenebilir)
    if (resetPasswordDto.currentPassword) {
      const isCurrentPasswordValid = await bcrypt.compare(
        resetPasswordDto.currentPassword,
        user.passwordHash,
      );

      if (!isCurrentPasswordValid) {
        throw new HttpException(
          'Mevcut şifreniz yanlış. Lütfen geçerli bir şifre girin.',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    // Yeni şifre geçerlilik kontrolü (isteğe bağlı)
    if (resetPasswordDto.newPassword.length < 6) {
      throw new HttpException(
        'Yeni şifreniz en az 6 karakter uzunluğunda olmalıdır.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const newPasswordHash: string = await bcrypt.hash(
      resetPasswordDto.newPassword,
      10,
    );

    await this.prismaService.user.update({
      where: { email: resetPasswordDto.email },
      data: { passwordHash: newPasswordHash },
    });

    return { message: 'Şifreniz başarıyla güncellendi' };
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user || !user.isEmailVerified) {
      // Kullanıcı yoksa veya e-posta doğrulanmamışsa, güvenlik nedeniyle işlem yapma
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(resetToken, 10);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token 1 saat geçerli

    await this.prismaService.user.update({
      where: { email },
      data: {
        passwordResetToken: hashedToken,
        passwordResetTokenExpiresAt: expiresAt,
      },
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    await this.mailerService.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: 'Parola Sıfırlama İsteği',
      template: 'forgot-password',
      context: {
        name: user.name || 'Kullanıcı',
        resetLink: resetUrl,
        validityDuration: '1 saat',
      },
    });
  }
}
