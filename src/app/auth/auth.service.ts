import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UserDto } from './dto/user.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { Throttle } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private transporter = nodemailer.createTransport({
    host: this.configService.get<string>('MAIL_HOST'),
    port: parseInt(this.configService.get<string>('MAIL_PORT') || '587'),
    secure: false,
    auth: {
      user: this.configService.get<string>('MAIL_USER'),
      pass: this.configService.get<string>('MAIL_PASSWORD'),
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
      this.logger.debug(
        `TEST MODE: Email would be sent to ${user.email} with token ${token}`,
      );
      return;
    }
    // Normal ortamda e-posta gönderimi
    const hostUrl = this.configService.get<string>('HOST_URL') || '';
    const verificationUrl = `${hostUrl}auth/verify-email?token=${token}&email=${encodeURIComponent(user.email)}`;

    await this.transporter.sendMail({
      from: this.configService.get<string>('MAIL_FROM'),
      to: user.email,
      subject: 'Verify your email',
      text: `Please verify your email by clicking on the following link: ${verificationUrl}\n\nThis link contains both your verification token and email address to complete the verification process automatically.\n\nIf you need to enter these details manually:\n- Your verification token: ${token}\n- Your email: ${user.email}`,
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
  // (Kaldırıldı) sendPasswordResetEmail fonksiyonu kullanılmadığı için temizlendi.

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const user = await this.prismaService.user.findUnique({
      where: { email: verifyEmailDto.email },
    });
    // Eğer zaten doğrulanmışsa idempotent davran
    if (user && user.isEmailVerified) {
      return { message: 'Email already verified' };
    }

    if (
      !user ||
      user.verificationToken !== verifyEmailDto.token ||
      new Date() > user.tokenExpiresAt
    ) {
      if (user && new Date() > user.tokenExpiresAt) {
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
        tokenExpiresAt: null,
      },
    });

    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('MAIL_FROM'),
        to: verifyEmailDto.email,
        subject: 'Welcome to Our Platform!',
        text: 'Your email has been successfully verified. Welcome to our platform!',
      });
    } catch (e) {
      // Email gönderimi başarısız olsa bile doğrulama kalıcıdır; logla ve devam et
      this.logger.warn(`Welcome email send failed: ${e.message}`);
    }

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

    return this.generateTokenPair(user);
  }

  // Token generation
  private buildJwtPayload(user: User) {
    // New normalized payload uses 'email' instead of legacy 'username'
    return { email: user.email, sub: user.id, role: user.role };
  }

  private async generateTokenPair(user: User) {
    const payload = this.buildJwtPayload(user);
    const access_token = this.jwtService.sign(payload, {
      secret:
        this.configService.get<string>('JWT_ACCESS_SECRET') ||
        this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES') || '1h',
    });
    const refresh_token = this.jwtService.sign(payload, {
      secret:
        this.configService.get<string>('JWT_REFRESH_SECRET') ||
        this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES') || '7d',
    });
    const hashed = await bcrypt.hash(refresh_token, 10);
    await this.prismaService.user.update({
      where: { id: user.id },
      data: { refreshToken: hashed },
    });
    return { access_token, refresh_token, role: user.role, userId: user.id };
  }

  // User validation method
  async validateUser(email: string, password: string) {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user) {
      this.logger.debug('User not found');
      return null;
    }

    this.logger.verbose(`Retrieved user id=${user.id}`);

    if (typeof password !== 'string' || typeof user.passwordHash !== 'string') {
      this.logger.debug('Invalid password or passwordHash type');
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      this.logger.debug('Invalid password');
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
      this.logger.debug('User not found by ID');
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

      let decoded: any;
      try {
        decoded = this.jwtService.verify(refreshToken, {
          secret:
            this.configService.get<string>('JWT_REFRESH_SECRET') ||
            this.configService.get<string>('JWT_SECRET'),
        });
      } catch (err) {
        throw new HttpException(
          'Yenileme tokeniniz süresi dolmuş veya geçersiz. Lütfen tekrar giriş yapın.',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const user = await this.prismaService.user.findUnique({
        where: { id: decoded.sub },
      });
      if (!user || !user.refreshToken) {
        throw new HttpException(
          'Geçersiz yenileme tokeni. Lütfen tekrar giriş yapın.',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const match = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!match) {
        throw new HttpException(
          'Geçersiz yenileme tokeni. Lütfen tekrar giriş yapın.',
          HttpStatus.UNAUTHORIZED,
        );
      }

      return this.generateTokenPair(user);
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
}
