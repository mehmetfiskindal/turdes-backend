import * as request from 'supertest';
import { TestHelper } from './test-utils';

describe('DashboardController (e2e)', () => {
  let testHelper: TestHelper;

  beforeAll(async () => {
    testHelper = await new TestHelper().initialize();
  });

  afterAll(async () => {
    await testHelper.cleanup();
  });

  it('/dashboard/analytics (GET)', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/dashboard/analytics')
      .set('Authorization', `Bearer ${testHelper.getAdminToken()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toBeDefined();
        expect(res.body).toHaveProperty('totalUsers');
        expect(res.body).toHaveProperty('totalAidRequests');
        expect(res.body).toHaveProperty('totalOrganizations');
      });
  });

  it('/dashboard/aid-distribution (GET)', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/dashboard/aid-distribution')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toBeDefined();
        expect(res.body).toHaveProperty('byType');
        expect(res.body).toHaveProperty('byStatus');
        expect(res.body).toHaveProperty('byMonth');
      });
  });

  it('/dashboard/user-categories (GET)', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/dashboard/user-categories')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toBeDefined();
        expect(res.body).toHaveProperty('byRole');
        expect(res.body).toHaveProperty('byRegion');
      });
  });

  it('/dashboard/organizations (GET)', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/dashboard/organizations')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toBeDefined();
        expect(res.body).toHaveProperty('totalCount');
        expect(res.body).toHaveProperty('byRating');
        expect(res.body).toHaveProperty('byRegion');
      });
  });

  it('/dashboard/donations (GET)', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/dashboard/donations')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toBeDefined();
        expect(res.body).toHaveProperty('totalAmount');
        expect(res.body).toHaveProperty('byMonth');
        expect(res.body).toHaveProperty('byType');
      });
  });

  it('/dashboard/aid-efficiency-by-location (GET)', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/dashboard/aid-efficiency-by-location')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toBeDefined();
        expect(Array.isArray(res.body)).toBeTruthy();
      });
  });
});