import * as request from 'supertest';
import { TestHelper } from './test-utils';

describe('DonorsController (e2e)', () => {
  let testHelper: TestHelper;

  beforeAll(async () => {
    testHelper = await new TestHelper().initialize();
  });

  afterAll(async () => {
    await testHelper.cleanup();
  });

  it('/donors/donations (POST)', () => {
    return request(testHelper.getApp().getHttpServer())
      .post('/donors/donations')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .send({
        amount: 100,
        currency: 'USD',
        type: 'Money',
        isAnonymous: false,
        userId: 1,
        organizationId: 1,
        campaignId: null,
        note: 'Test donation'
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('amount', 100);
        expect(res.body).toHaveProperty('currency', 'USD');
        expect(res.body).toHaveProperty('type', 'Money');
        expect(res.body).toHaveProperty('isAnonymous', false);
      });
  });

  it('/donors/donations (GET)', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/donors/donations')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBeTruthy();
      });
  });

  it('/donors/donations/anonymous (GET)', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/donors/donations/anonymous')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBeTruthy();
      });
  });

  it('/donors/donations/statistics (GET)', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/donors/donations/statistics')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('totalDonations');
        expect(res.body).toHaveProperty('totalAmount');
        expect(res.body).toHaveProperty('donationsByType');
        expect(res.body).toHaveProperty('donationsByMonth');
      });
  });
});