import * as request from 'supertest';
import { TestHelper } from './test-utils';

describe('HistoryController (e2e)', () => {
  let testHelper: TestHelper;

  beforeAll(async () => {
    testHelper = await new TestHelper().initialize();
  });

  afterAll(async () => {
    await testHelper.cleanup();
  });

  it('/history/user/:userId (GET)', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/history/user/1')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBeTruthy();
      });
  });

  it('/history/organization/:organizationId (GET)', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/history/organization/1')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBeTruthy();
      });
  });
});
