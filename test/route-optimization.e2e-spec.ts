import * as request from 'supertest';
import { TestHelper } from './test-utils';

describe('RouteOptimizationController (e2e)', () => {
  let testHelper: TestHelper;

  beforeAll(async () => {
    testHelper = await new TestHelper().initialize();
  });

  afterAll(async () => {
    await testHelper.cleanup();
  });

  it('/route-optimization/calculate (POST)', () => {
    return request(testHelper.getApp().getHttpServer())
      .post('/route-optimization/calculate')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .send({
        startLatitude: 40.7128,
        startLongitude: -74.006,
        deliveryIds: [1, 2, 3]
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('route');
        expect(res.body).toHaveProperty('totalDistance');
        expect(res.body).toHaveProperty('estimatedTime');
        expect(res.body).toHaveProperty('startPoint');
        expect(res.body).toHaveProperty('returnToStartIncluded');
        expect(Array.isArray(res.body.route)).toBeTruthy();
      });
  });
});