import * as request from 'supertest';
import { TestHelper } from './test-utils';

describe('CampaignsController (e2e)', () => {
  let testHelper: TestHelper;
  let campaignId: number;
  let organizationId: number;

  beforeAll(async () => {
    testHelper = await new TestHelper().initialize();
    // Test kullanıcısı oluştur ve giriş yap
    await testHelper.registerTestUser();

    // Test için organizasyon oluştur
    const orgRes = await request(testHelper.getApp().getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .send({
        name: 'Test Campaigns Org',
        description: 'Test organization for campaigns',
        contactEmail: 'campaigns@test.org',
        contactPhone: '5551234567',
      });
    organizationId = orgRes.body.id;
  });

  afterAll(async () => {
    await testHelper.cleanup();
  });

  it('/campaigns (POST) - should create a new campaign', () => {
    return request(testHelper.getApp().getHttpServer())
      .post('/campaigns')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .send({
        title: 'Test Campaign',
        description: 'This is a test campaign',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 gün sonra
        targetAmount: 10000,
        currentAmount: 0,
        organizationId: organizationId,
        status: 'active',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.title).toBe('Test Campaign');
        campaignId = res.body.id;
      });
  });

  it('/campaigns (GET) - should return all campaigns', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/campaigns')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
      });
  });

  it('/campaigns/:id (GET) - should return a specific campaign', () => {
    return request(testHelper.getApp().getHttpServer())
      .get(`/campaigns/${campaignId}`)
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id', campaignId);
        expect(res.body).toHaveProperty('title', 'Test Campaign');
      });
  });

  it('/campaigns/:id (PATCH) - should update a campaign', () => {
    return request(testHelper.getApp().getHttpServer())
      .patch(`/campaigns/${campaignId}`)
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .send({
        title: 'Updated Campaign',
        description: 'This is an updated campaign',
        targetAmount: 15000,
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id', campaignId);
        expect(res.body).toHaveProperty('title', 'Updated Campaign');
        expect(res.body).toHaveProperty('targetAmount', 15000);
      });
  });

  it('/campaigns/:id/donations (POST) - should add a donation to a campaign', () => {
    return request(testHelper.getApp().getHttpServer())
      .post(`/campaigns/${campaignId}/donations`)
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .send({
        amount: 1000,
        donorName: 'Test Donor',
        donorEmail: 'donor@test.com',
        message: 'Test donation',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('campaignId', campaignId);
        expect(res.body).toHaveProperty('amount', 1000);
      });
  });

  it('/campaigns/:id/donations (GET) - should get all donations for a campaign', () => {
    return request(testHelper.getApp().getHttpServer())
      .get(`/campaigns/${campaignId}/donations`)
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0]).toHaveProperty('amount');
      });
  });

  it('/campaigns/:id/status (PATCH) - should update campaign status', () => {
    return request(testHelper.getApp().getHttpServer())
      .patch(`/campaigns/${campaignId}/status`)
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .send({
        status: 'completed',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id', campaignId);
        expect(res.body).toHaveProperty('status', 'completed');
      });
  });

  it('/campaigns/organization/:orgId (GET) - should get campaigns by organization', () => {
    return request(testHelper.getApp().getHttpServer())
      .get(`/campaigns/organization/${organizationId}`)
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0]).toHaveProperty('organizationId', organizationId);
      });
  });

  it('/campaigns/:id (DELETE) - should delete a campaign', () => {
    return request(testHelper.getApp().getHttpServer())
      .delete(`/campaigns/${campaignId}`)
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id', campaignId);
        expect(res.body).toHaveProperty('isDeleted', true);
      });
  });
});
