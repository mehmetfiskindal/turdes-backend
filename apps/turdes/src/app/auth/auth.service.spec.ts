import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { LoginDto } from './dto/login.dto';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('register', () => {
    it('should throw an error if a user with the same email already exists', async () => {
      prismaService.user.findUnique = jest
        .fn()
        .mockResolvedValue({ email: 'test@example.com' });

      const userDto: UserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'user',
      };

      await expect(authService.register(userDto)).rejects.toThrow(
        new BadRequestException('A user with the same email already exists')
      );
    });

    it('should register a new user successfully', async () => {
      prismaService.user.findUnique = jest.fn().mockResolvedValue(null);
      prismaService.user.create = jest.fn().mockResolvedValue({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: 'hashedpassword',
        role: 'user',
      });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');

      const userDto: UserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'user',
      };

      const result = await authService.register(userDto);

      expect(result).toEqual({
        message: 'User registered successfully',
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          passwordHash: 'hashedpassword',
          role: 'user',
        },
      });
    });
  });

  describe('login', () => {
    it('should throw an error if user is not found', async () => {
      prismaService.user.findUnique = jest.fn().mockResolvedValue(null);
      const loginDto: LoginDto = {
        email: 'john.doe@example.com',
        password: 'Password123',
      };

      await expect(authService.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid email or password')
      );
    });

    it('should throw an error if password is incorrect', async () => {
      prismaService.user.findUnique = jest.fn().mockResolvedValue({
        email: 'test@example.com',
        passwordHash: 'hashedpassword',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      const wrongPassword = 'wrongpassword';
      const loginDto: LoginDto = {
        email: 'john.doe@example.com',
        password: wrongPassword,
      };
      await expect(authService.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid email or password')
      );
    });

    it('should log in a user and set cookies', async () => {
      prismaService.user.findUnique = jest.fn().mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        passwordHash: 'hashedpassword',
        role: 'user',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign = jest.fn().mockReturnValue('signedToken');
      prismaService.user.update = jest.fn();
    });
  });
});
