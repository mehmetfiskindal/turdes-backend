import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { HttpException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
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
            sign: jest.fn().mockReturnValue('test_token'),
            verify: jest.fn(),
          },
        },
        {
          provide: require('@nestjs/config').ConfigService,
          useValue: {
            get: (key: string) => {
              const map: Record<string, string> = {
                JWT_ACCESS_SECRET: 'access_secret',
                JWT_REFRESH_SECRET: 'refresh_secret',
                JWT_ACCESS_EXPIRES: '1h',
                JWT_REFRESH_EXPIRES: '7d',
                MAIL_HOST: 'smtp.test',
                MAIL_PORT: '587',
                MAIL_USER: 'user',
                MAIL_PASSWORD: 'pass',
                MAIL_FROM: 'test@test.com',
                HOST_URL: 'http://localhost/',
              };
              return map[key];
            },
          },
        },
      ],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
    prismaService = moduleRef.get<PrismaService>(PrismaService);
    jwtService = moduleRef.get<JwtService>(JwtService);
  });

  describe('register', () => {
    it('should throw an exception if user already exists', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValueOnce({
        id: 1,
        email: 'test@test.com',
        role: 'user',
        refreshToken: null,
        name: 'Test User',
        phone: '1234567890',
        passwordHash: 'hashed_password',
        createdAt: new Date(),
        updatedAt: new Date(),
        isEmailVerified: true,
        verificationToken: null,
        tokenExpiresAt: null,
        category: 'NONE' as any,
      });
      await expect(
        authService.register({
          email: 'test@test.com',
          password: 'password',
          name: 'Test',
          phone: '1234567890',
          role: 'user',
        }),
      ).rejects.toThrow(HttpException);
    });

    it('should create a new user and return message', async () => {
      // first findUnique -> existing user check
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValueOnce(null as any)
        // second findUnique inside sendVerificationEmail (by email) returns created user
        .mockResolvedValueOnce({
          id: 1,
          email: 'test@test.com',
          role: 'user',
          refreshToken: null,
          name: 'Test User',
          phone: '1234567890',
          passwordHash: 'hashed_password',
          createdAt: new Date(),
          updatedAt: new Date(),
          isEmailVerified: false,
          verificationToken: 'token',
          tokenExpiresAt: new Date(Date.now() + 1000 * 60 * 30),
          category: 'NONE' as any,
        } as any);
      jest.spyOn(prismaService.user, 'create').mockResolvedValueOnce({
        id: 1,
        email: 'test@test.com',
        role: 'user',
        refreshToken: null,
        name: 'Test User',
        phone: '1234567890',
        passwordHash: 'hashed_password',
        createdAt: new Date(),
        updatedAt: new Date(),
        isEmailVerified: false,
        verificationToken: 'token',
        tokenExpiresAt: new Date(Date.now() + 1000 * 60 * 30),
        category: 'NONE' as any,
      } as any);
      process.env.NODE_ENV = 'test';
      const response = await authService.register({
        email: 'test@test.com',
        password: 'password',
        name: 'Test',
        phone: '1234567890',
        role: 'user',
      });
      expect(response).toEqual({
        message: 'User registered successfully. Please verify your email.',
      });
    });
  });

  describe('login', () => {
    it('should throw an exception if user does not exist', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValueOnce(null);
      await expect(
        authService.login({ email: 'test@test.com', password: 'password' }),
      ).rejects.toThrow(HttpException);
    });

    it('should return tokens if login is successful', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        passwordHash: await bcrypt.hash('password', 10),
        role: 'user',
        refreshToken: null,
        name: 'Test User',
        phone: '1234567890',
        createdAt: new Date(),
        updatedAt: new Date(),
        isEmailVerified: true,
        verificationToken: null,
        tokenExpiresAt: null,
        category: 'NONE' as any,
      };
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValueOnce(mockUser);
      const tokens = await authService.login({
        email: 'test@test.com',
        password: 'password',
      });
      expect(tokens).toEqual({
        access_token: 'test_token',
        refresh_token: 'test_token',
        role: 'user',
        userId: 1,
      });
    });
  });

  describe('refreshToken', () => {
    it('should throw an exception if refresh token is invalid', async () => {
      jest.spyOn(jwtService, 'verify').mockImplementationOnce(() => {
        throw new Error();
      });
      await expect(authService.refreshToken('invalid_token')).rejects.toThrow(
        HttpException,
      );
    });

    it('should return new tokens if refresh token is valid', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        role: 'user',
        refreshToken: await bcrypt.hash('valid_token', 10),
        name: 'Test User',
        phone: '1234567890',
        passwordHash: 'hashed_password',
        createdAt: new Date(),
        updatedAt: new Date(),
        isEmailVerified: true,
        verificationToken: null,
        tokenExpiresAt: null,
        category: 'NONE' as any,
      };
      jest.spyOn(jwtService, 'verify').mockReturnValue({ sub: mockUser.id });
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValueOnce(mockUser as any);
      // bcrypt.compare to succeed
  jest.spyOn(bcrypt as any, 'compare').mockResolvedValue(true as any);
      const tokens = await authService.refreshToken('valid_token');
      expect(tokens).toEqual({
        access_token: 'test_token',
        refresh_token: 'test_token',
        role: 'user',
        userId: 1,
      });
    });
  });
});
