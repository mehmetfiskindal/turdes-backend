import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UserDto } from './dto/user.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService, JwtService, PrismaService],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const userDto: UserDto = {
        email: 'test@test.com',
        password: 'testpass',
        name: 'Test User',
        phone: '1234567890',
        role: 'user',
      };
      jest.spyOn(authService, 'register').mockImplementation(async () => ({
        access_token: 'test_token',
        refresh_token: 'test_token',
        role: 'user',
        userId: 1,
      }));

      expect(await authController.register(userDto)).toEqual({
        access_token: 'test_token',
        refresh_token: 'test_token',
        role: 'user',
        userId: 1,
      });
    });
  });

  describe('refreshToken', () => {
    it('should refresh access token', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'some-refresh-token',
      };
      jest.spyOn(authService, 'refreshToken').mockImplementation(async () => ({
        access_token: 'new_access_token',
        refresh_token: 'new_refresh_token',
      }));

      expect(await authController.refreshToken(refreshTokenDto)).toEqual({
        access_token: 'new_access_token',
        refresh_token: 'new_refresh_token',
      });
    });
  });

  describe('login', () => {
    it('should log in a user', async () => {
      const loginDto: LoginDto = {
        email: 'test@test.com',
        password: 'testpass',
      };
      jest.spyOn(authService, 'login').mockImplementation(async () => ({
        access_token: 'access_token',
        refresh_token: 'refresh_token',
        role: 'user',
        userId: 1,
      }));

      expect(await authController.login(loginDto)).toEqual({
        access_token: 'access_token',
        refresh_token: 'refresh_token',
        role: 'user',
        userId: 1,
      });
    });
  });
});
