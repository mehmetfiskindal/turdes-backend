import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserDto } from './dto/user.dto';
import { Response } from 'express';

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

    const passwordHash: string = await bcrypt.hash(userDto.password, 10);

    const user = await this.prismaService.user.create({
      data: {
        name: userDto.name,
        email: userDto.email,
        phone: userDto.phone || null,
        passwordHash: passwordHash,
        role: userDto.role,
      },
    });

    return { message: 'User registered successfully', user };
  }

  async login(email: string, password: string, @Res() res: Response) {
    const user = await this.prismaService.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '7d',
    });

    await this.prismaService.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    res.cookie('accessToken', accessToken, { httpOnly: true, maxAge: 900000 }); // 15 minutes
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 604800000,
    }); // 7 days

    return res.send({ message: 'Login successful' });
  }
}
