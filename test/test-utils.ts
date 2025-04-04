import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app/app.module';

export class TestHelper {
  private app: INestApplication;
  private accessToken: string;
  private adminToken: string;

  async initialize() {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    this.app = moduleFixture.createNestApplication();
    await this.app.init();

    // Token değerleri çevre değişkenlerinden gelir, varsayılan değerleri belirleyin
    this.accessToken = process.env.TEST_ACCESS_TOKEN || 'test-access-token';
    this.adminToken = process.env.TEST_ADMIN_TOKEN || 'test-admin-token';

    return this;
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

  async cleanup() {
    await this.app.close();
  }
}
