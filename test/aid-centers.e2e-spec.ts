import * as request from 'supertest';
import { TestHelper } from './test-utils';

describe('AidCentersController (e2e)', () => {
  let testHelper: TestHelper;

  beforeAll(async () => {
    testHelper = await new TestHelper().initialize();
  });

  afterAll(async () => {
    await testHelper.cleanup();
  });

  it('/aid-centers/local (GET)', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/aid-centers/local')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBeTruthy();
      });
  });

  it('/aid-centers/government (GET)', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/aid-centers/government')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBeTruthy();
      });
  });
});
