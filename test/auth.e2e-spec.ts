import * as request from 'supertest';
import { TestHelper } from './test-utils';

describe('AuthController (e2e)', () => {
  let testHelper: TestHelper;

  beforeAll(async () => {
    testHelper = await new TestHelper().initialize();
  });

  afterAll(async () => {
    await testHelper.cleanup();
  });

  it('/auth/register (POST)', () => {
    const randomEmail = `test${Math.floor(Math.random() * 10000)}@test.com`;
    return request(testHelper.getApp().getHttpServer())
      .post('/auth/register')
      .send({
        email: randomEmail,
        password: 'testpass',
        name: 'Test User',
        phone: '1234567890',
        role: 'user',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('access_token');
        expect(res.body).toHaveProperty('refresh_token');
        expect(res.body).toHaveProperty('role');
        expect(res.body).toHaveProperty('userId');
      });
  });

  it('/auth/login (POST)', () => {
    return request(testHelper.getApp().getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@test.com',
        password: 'testpass',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('access_token');
        expect(res.body).toHaveProperty('refresh_token');
      });
  });

  it('/auth/refresh (POST)', () => {
    return request(testHelper.getApp().getHttpServer())
      .post('/auth/refresh')
      .send({
        refreshToken: 'valid-refresh-token', // Test ortamında geçerli bir refresh token
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('access_token');
        expect(res.body).toHaveProperty('refresh_token');
      });
  });

  it('/auth/reset-password (POST)', () => {
    return request(testHelper.getApp().getHttpServer())
      .post('/auth/reset-password')
      .send({
        email: 'test@test.com',
        resetToken: 'valid-reset-token', // Test ortamında geçerli bir reset token
        newPassword: 'newpassword123',
      })
      .expect(200);
  });

  it('/auth/verify-email (POST)', () => {
    return request(testHelper.getApp().getHttpServer())
      .post('/auth/verify-email')
      .send({
        email: 'test@test.com',
        verificationToken: 'valid-verification-token', // Test ortamında geçerli bir verification token
      })
      .expect(200);
  });

  it('/auth/resend-verification-email (POST)', () => {
    return request(testHelper.getApp().getHttpServer())
      .post('/auth/resend-verification-email')
      .send({
        email: 'test@test.com',
      })
      .expect(200);
  });
});