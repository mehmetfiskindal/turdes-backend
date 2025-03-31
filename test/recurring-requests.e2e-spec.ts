import * as request from 'supertest';
import { TestHelper } from './test-utils';

describe('RecurringRequestsController (e2e)', () => {
  let testHelper: TestHelper;

  beforeAll(async () => {
    testHelper = await new TestHelper().initialize();
  });

  afterAll(async () => {
    await testHelper.cleanup();
  });

  it('/recurring-aid-requests (GET)', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/recurring-aid-requests')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBeTruthy();
      });
  });

  it('/recurring-aid-requests/:id/schedule (POST)', () => {
    return request(testHelper.getApp().getHttpServer())
      .post('/recurring-aid-requests/1/schedule')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .send({
        frequency: 'WEEKLY',
        dayOfWeek: 1, // Pazartesi
        timeOfDay: '10:00',
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 gün sonra
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('frequency', 'WEEKLY');
        expect(res.body).toHaveProperty('dayOfWeek', 1);
      });
  });

  it('/recurring-aid-requests/process (POST)', () => {
    return request(testHelper.getApp().getHttpServer())
      .post('/recurring-aid-requests/process')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('processedCount');
        expect(typeof res.body.processedCount).toBe('number');
      });
  });
});