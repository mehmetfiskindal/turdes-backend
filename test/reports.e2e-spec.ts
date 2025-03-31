import * as request from 'supertest';
import { TestHelper } from './test-utils';

describe('ReportsController (e2e)', () => {
  let testHelper: TestHelper;

  beforeAll(async () => {
    testHelper = await new TestHelper().initialize();
  });

  afterAll(async () => {
    await testHelper.cleanup();
  });

  it('/reports/aid-distribution (GET)', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/reports/aid-distribution?startDate=2023-01-01&endDate=2023-12-31')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('byRegion');
        expect(res.body).toHaveProperty('byType');
        expect(res.body).toHaveProperty('byMonth');
        expect(res.body).toHaveProperty('totalDelivered');
      });
  });

  it('/reports/donation-distribution (GET)', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/reports/donation-distribution?startDate=2023-01-01&endDate=2023-12-31')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('byRegion');
        expect(res.body).toHaveProperty('byType');
        expect(res.body).toHaveProperty('byMonth');
        expect(res.body).toHaveProperty('totalAmount');
      });
  });
});