import * as request from 'supertest';
import { TestHelper } from './test-utils';

describe('CampaignsController (e2e)', () => {
  let testHelper: TestHelper;

  beforeAll(async () => {
    testHelper = await new TestHelper().initialize();
  });

  afterAll(async () => {
    await testHelper.cleanup();
  });

  it('/campaigns (GET)', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/campaigns')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBeTruthy();
      });
  });

  it('/campaigns/:id (GET)', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/campaigns/1')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('name');
      });
  });

  it('/campaigns (POST)', () => {
    return request(testHelper.getApp().getHttpServer())
      .post('/campaigns')
      .send({
        name: 'Test Campaign',
        description: 'A Test Campaign',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        targetAmount: 10000,
        organizationId: 1,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('name', 'Test Campaign');
      });
  });

  it('/campaigns/:id (PATCH)', () => {
    return request(testHelper.getApp().getHttpServer())
      .patch('/campaigns/1')
      .send({
        name: 'Updated Campaign',
        description: 'Updated campaign description',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('name', 'Updated Campaign');
      });
  });

  it('/campaigns/:id (DELETE)', () => {
    // Yeni bir kampanya oluşturup sonra silmek için
    return request(testHelper.getApp().getHttpServer())
      .post('/campaigns')
      .send({
        name: 'Temp Campaign',
        description: 'Will be deleted',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        targetAmount: 5000,
        organizationId: 1,
      })
      .expect(201)
      .then((res) => {
        const campaignId = res.body.id;
        return request(testHelper.getApp().getHttpServer())
          .delete(`/campaigns/${campaignId}`)
          .expect(200)
          .expect((delRes) => {
            expect(delRes.body).toHaveProperty('id');
            expect(delRes.body.id).toBe(campaignId);
          });
      });
  });

  it('/campaigns/:id/events (POST)', () => {
    return request(testHelper.getApp().getHttpServer())
      .post('/campaigns/1/events')
      .send({
        name: 'Test Event',
        description: 'A Test Event',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Test Location',
        organizationId: 1,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('name', 'Test Event');
        expect(res.body).toHaveProperty('campaignId', 1);
      });
  });

  it('/campaigns/:id/events (GET)', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/campaigns/1/events')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBeTruthy();
      });
  });

  it('/campaigns/:id/events/:eventId (GET)', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/campaigns/1/events/1')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('campaignId', 1);
      });
  });

  it('/campaigns/:id/events/:eventId (PATCH)', () => {
    return request(testHelper.getApp().getHttpServer())
      .patch('/campaigns/1/events/1')
      .send({
        name: 'Updated Event',
        description: 'Updated event description',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('name', 'Updated Event');
        expect(res.body).toHaveProperty(
          'description',
          'Updated event description',
        );
      });
  });

  it('/campaigns/:id/events/:eventId (DELETE)', () => {
    // Yeni bir event oluşturup sonra silmek için
    return request(testHelper.getApp().getHttpServer())
      .post('/campaigns/1/events')
      .send({
        name: 'Temp Event',
        description: 'Will be deleted',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Temp Location',
        organizationId: 1,
      })
      .expect(201)
      .then((res) => {
        const eventId = res.body.id;
        return request(testHelper.getApp().getHttpServer())
          .delete(`/campaigns/1/events/${eventId}`)
          .expect(200)
          .expect((delRes) => {
            expect(delRes.body).toHaveProperty('id');
            expect(delRes.body.id).toBe(eventId);
          });
      });
  });
});
