// Auth Service (auth/auth.service.ts)
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service'; // Prisma servisini ekleyin
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserDto } from './dto/user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  async register(userDto: UserDto) {
    const existingUser = await this.prismaService.user.findUnique({
      where: { email: userDto.email },
    });

    if (existingUser) {
      throw new BadRequestException(
        'A user with the same email already exists'
      );
    }

    // Şifreyi hashleyin ve Prisma'ya `passwordHash` olarak gönderin
    const passwordHash: string = await bcrypt.hash(userDto.password, 10);

    // Prisma'ya sadece gerekli alanları sağlayın
    const user = await this.prismaService.user.create({
      data: {
        name: userDto.name,
        email: userDto.email,
        phone: userDto.phone || null,
        passwordHash: passwordHash, // Şifre hashlenmiş olarak Prisma'ya gönderiliyor
        role: userDto.role,
      },
    });

    return { message: 'User registered successfully', user };
  }

  async login(email: string, password: string) {
    // Kullanıcıyı email ile bulma
    const user = await this.prismaService.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // JWT token'larını oluşturma
    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '7d',
    });

    // Refresh token'ı veritabanına kaydetme
    await this.prismaService.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return { accessToken, refreshToken };
  }
}
