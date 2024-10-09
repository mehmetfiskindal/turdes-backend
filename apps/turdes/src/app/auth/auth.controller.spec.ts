// import { Test, TestingModule } from '@nestjs/testing';
// import { AuthController } from './auth.controller';
// import { AuthService } from './auth.service';
// import { JwtService } from '@nestjs/jwt';
// import { PrismaService } from '../prisma.service';
// import { UserDto } from './dto/user.dto';
// import { LoginDto } from './dto/login.dto';
// import { RefreshTokenDto } from './dto/refresh.dto';
// import { UnauthorizedException } from '@nestjs/common';
// import { Response } from 'express';

// describe('AuthController', () => {
//   let authController: AuthController;
//   let authService: AuthService;
//   let jwtService: JwtService;
//   let prismaService: PrismaService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [AuthController],
//       providers: [
//         AuthService,
//         JwtService,
//         PrismaService,
//         {
//           provide: AuthService,
//           useValue: {
//             register: jest.fn(),
//             login: jest.fn(),
//             refreshToken: jest.fn(),
//           },
//         },
//         {
//           provide: JwtService,
//           useValue: {
//             sign: jest.fn(),
//             verify: jest.fn(),
//           },
//         },
//         {
//           provide: PrismaService,
//           useValue: {
//             user: {
//               findUnique: jest.fn(),
//               create: jest.fn(),
//               update: jest.fn(),
//             },
//           },
//         },
//       ],
//     }).compile();

//     authController = module.get<AuthController>(AuthController);
//     authService = module.get<AuthService>(AuthService);
//     jwtService = module.get<JwtService>(JwtService);
//     prismaService = module.get<PrismaService>(PrismaService);
//   });

//   describe('register', () => {
//     it('should register a new user', async () => {
//       const userDto: UserDto = {
//         email: 'test@example.com',
//         password: 'password',
//         name: '',
//         role: '',
//       };

//       jest.spyOn(authService, 'register').mockResolvedValue({
//         message: 'User registered successfully',
//         user: {
//           name: 'Test User',
//           id: 1,
//           email: 'test@example.com',
//           phone: null,
//           passwordHash: 'hashed-password',
//           role: 'user',
//           refreshToken: null,
//           createdAt: new Date(),
//           updatedAt: new Date(),
//         },
//       });

//       const result = await authController.register(userDto);
//       expect(result.message).toBe('User registered successfully');
//       expect(result.user.email).toBe('test@example.com');
//     });
//   });

//   describe('login', () => {
//     it('should login a user', async () => {
//       const loginDto: LoginDto = {
//         email: 'john.doe@example.com',
//         password: 'Password123',
//       };

//       const mockResponse = {
//         cookie: jest.fn(),
//         json: jest.fn(),
//       } as unknown as Response;

//       const mockLoginResponse = { message: 'Login successful' };
//       jest.spyOn(authService, 'login').mockResolvedValue(mockLoginResponse);

//       const result = await authController.login(loginDto, mockResponse);

//       expect(result).toBe(mockLoginResponse);
//       expect(mockResponse.cookie).toHaveBeenCalled();
//     });

//     it('should throw UnauthorizedException if login fails', async () => {
//       const loginDto: LoginDto = {
//         email: 'john.doe@example.com',
//         password: 'wrong-password',
//       };

//       const mockResponse = {
//         cookie: jest.fn(),
//         json: jest.fn(),
//       } as unknown as Response;

//       jest.spyOn(authService, 'login').mockImplementation(() => {
//         throw new UnauthorizedException('Invalid credentials');
//       });

//       await expect(
//         authController.login(loginDto, mockResponse)
//       ).rejects.toThrow(UnauthorizedException);
//     });
//   });

//   describe('refreshToken', () => {
//     it('should refresh access token', async () => {
//       const refreshTokenDto: RefreshTokenDto = {
//         refreshToken: 'valid-refresh-token',
//       };
//       const decodedToken = { userId: 1 };
//       const user = {
//         id: 1,
//         email: 'john.doe@example.com',
//         role: 'user',
//         refreshToken: 'valid-refresh-token',
//         name: 'Test User',
//         phone: null,
//         passwordHash: 'hashed-password',
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       };
//       const newAccessToken = 'new-access-token';

//       jest.spyOn(jwtService, 'verify').mockReturnValue(decodedToken);
//       jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);
//       jest.spyOn(jwtService, 'sign').mockReturnValue(newAccessToken);

//       const result = await authController.refreshToken(refreshTokenDto);
//       expect(result).toEqual({
//         accessToken: newAccessToken,
//       });
//     });

//     it('should throw UnauthorizedException if refresh token is invalid', async () => {
//       const refreshTokenDto: RefreshTokenDto = {
//         refreshToken: 'invalid-refresh-token',
//       };

//       jest.spyOn(jwtService, 'verify').mockImplementation(() => {
//         throw new Error('Invalid token');
//       });

//       await expect(
//         authController.refreshToken(refreshTokenDto)
//       ).rejects.toThrow(UnauthorizedException);
//     });

//     it('should throw UnauthorizedException if user is not found', async () => {
//       const refreshTokenDto: RefreshTokenDto = {
//         refreshToken: 'valid-refresh-token',
//       };
//       const decodedToken = { userId: 1 };

//       jest.spyOn(jwtService, 'verify').mockReturnValue(decodedToken);
//       jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

//       await expect(
//         authController.refreshToken(refreshTokenDto)
//       ).rejects.toThrow(UnauthorizedException);
//     });
//   });
// });
