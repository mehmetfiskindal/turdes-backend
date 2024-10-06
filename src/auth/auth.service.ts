// Auth Service (auth/auth.service.ts)
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../models/user.model';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserDto } from './dto/user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    private jwtService: JwtService,
  ) {}

  async register(userDto: UserDto) {
    const existingUser = await this.userModel.findOne({
      where: { email: userDto.email },
    });
    if (existingUser) {
      throw new BadRequestException(
        'A user with the same email already exists',
      );
    }
    const passwordHash = await bcrypt.hash(userDto.password, 10);
    const user = await this.userModel.create({ ...userDto, passwordHash });
    return { message: 'User registered successfully', user };
  }

  async login(email: string, password: string) {
    const user = await this.userModel.findOne({ where: { email } });
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

    // Refresh token'ı veritabanında saklayabilirsiniz
    await user.update({ refreshToken });

    return { accessToken, refreshToken };
  }
}
