import * as request from 'supertest';
import { TestHelper } from './test-utils';

describe('MapController (e2e)', () => {
  let testHelper: TestHelper;

  beforeAll(async () => {
    testHelper = await new TestHelper().initialize();
  });

  afterAll(async () => {
    await testHelper.cleanup();
  });

  it('/map/aid-centers (GET)', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/map/aid-centers?latitude=40.7128&longitude=-74.006&radiusKm=10')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBeTruthy();
      });
  });

  it('/map/social-services (GET)', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/map/social-services?latitude=40.7128&longitude=-74.006&radiusKm=15')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBeTruthy();
      });
  });
});