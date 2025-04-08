import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app/app.module';
import { PrismaService } from '../src/app/prisma/prisma.service';
import * as request from 'supertest';

export class TestHelper {
  private app: INestApplication;
  private prismaService: PrismaService;
  private accessToken: string;
  private adminToken: string;
  private userCredentials = {
    email: `test${Math.floor(Math.random() * 10000)}@test.com`,
    password: 'testpass',
  };
  private adminCredentials = {
    email: 'admin@test.com',
    password: 'adminpass',
  };
  private registeredUserId: number | null = null;

  async initialize() {
    try {
      // Test öncesinde NODE_ENV ortam değişkenini 'test' olarak ayarla
      process.env.NODE_ENV = 'test';

      // Testler başlamadan önce açık kalan bağlantıları temizle
      this.prismaService = PrismaService.getInstance();
      await this.prismaService.cleanupConnections();

      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      this.app = moduleFixture.createNestApplication();

      // Prisma servisini modülden al
      this.prismaService = this.app.get(PrismaService);

      await this.app.init();

      // Token değerleri çevre değişkenlerinden gelir, varsayılan değerleri belirleyin
      this.accessToken = process.env.TEST_ACCESS_TOKEN || 'test-access-token';
      this.adminToken = process.env.TEST_ADMIN_TOKEN || 'test-admin-token';

      console.log('TestHelper: Test ortamı başlatıldı');
      return this;
    } catch (error) {
      console.error('TestHelper initialize hatası:', error);
      throw error;
    }
  }

  getApp(): INestApplication {
    return this.app;
  }

  getAccessToken(): string {
    return this.accessToken;
  }

  getAdminToken(): string {
    return this.adminToken;
  }

  getUserCredentials() {
    return this.userCredentials;
  }

  getAdminCredentials() {
    return this.adminCredentials;
  }

  getUserId() {
    return this.registeredUserId;
  }

  async registerTestUser() {
    try {
      const res = await request(this.app.getHttpServer())
        .post('/auth/register')
        .send({
          email: this.userCredentials.email,
          password: this.userCredentials.password,
          name: 'Test User',
          phone: '1234567890',
        });

      // Kullanıcıyı direkt olarak doğrulanmış olarak işaretle
      const createdUser = await this.prismaService.user.findUnique({
        where: { email: this.userCredentials.email },
      });

      if (createdUser) {
        this.registeredUserId = createdUser.id;

        // E-posta doğrulaması olmadan test için veritabanından direkt güncelleme
        await this.prismaService.user.update({
          where: { id: createdUser.id },
          data: { isEmailVerified: true },
        });

        // Login yaparak geçerli token al
        await this.loginTestUser();
      }

      return res;
    } catch (error) {
      console.error('Test kullanıcısı kayıt hatası:', error);
      throw error;
    }
  }

  async loginTestUser() {
    try {
      const res = await request(this.app.getHttpServer())
        .post('/auth/login')
        .send({
          email: this.userCredentials.email,
          password: this.userCredentials.password,
        });

      if (res.status === 200) {
        this.accessToken = res.body.access_token;
      }

      return res;
    } catch (error) {
      console.error('Test kullanıcısı giriş hatası:', error);
      throw error;
    }
  }

  async loginAdmin() {
    try {
      const res = await request(this.app.getHttpServer())
        .post('/auth/login')
        .send(this.adminCredentials);

      if (res.status === 200) {
        this.adminToken = res.body.access_token;
      }

      return res;
    } catch (error) {
      console.error('Admin kullanıcısı giriş hatası:', error);
      throw error;
    }
  }

  async createTestAdmin() {
    try {
      // Test ortamında admin kullanıcısı oluştur
      const existingAdmin = await this.prismaService.user.findUnique({
        where: { email: this.adminCredentials.email },
      });

      if (!existingAdmin) {
        const bcrypt = require('bcrypt');
        const passwordHash = await bcrypt.hash(
          this.adminCredentials.password,
          10,
        );

        await this.prismaService.user.create({
          data: {
            email: this.adminCredentials.email,
            name: 'Test Admin',
            phone: '1234567890',
            role: 'admin',
            passwordHash: passwordHash,
            isEmailVerified: true,
          },
        });

        // Admin token'ı güncelle
        await this.loginAdmin();
      }
    } catch (error) {
      console.error('Test admin oluşturma hatası:', error);
      throw error;
    }
  }

  async cleanup() {
    try {
      // Test sırasında oluşturulan kullanıcıyı temizle
      if (this.registeredUserId) {
        try {
          await this.prismaService.user.delete({
            where: { id: this.registeredUserId },
          });
        } catch (err) {
          console.log('Test kullanıcısı silinirken hata:', err);
        }
      }

      // Veritabanı bağlantılarını temizle
      if (this.prismaService) {
        await this.prismaService.cleanupConnections();
      }

      // Uygulama kapatılabilirse kapat
      if (this.app) {
        await this.app.close();
        console.log('TestHelper: Test uygulaması kapatıldı');
      }
    } catch (error) {
      console.error('TestHelper cleanup hatası:', error);
    }
  }
}
