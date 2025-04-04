import * as request from 'supertest';
import { TestHelper } from './test-utils';

describe('EducationController (e2e)', () => {
  let testHelper: TestHelper;

  beforeAll(async () => {
    testHelper = await new TestHelper().initialize();
  });

  afterAll(async () => {
    await testHelper.cleanup();
  });

  it('/education/upload (POST)', () => {
    return request(testHelper.getApp().getHttpServer())
      .post('/education/upload')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .send({
        title: 'Test Training Material',
        description: 'A test training material',
        type: 'VIDEO',
        url: 'https://example.com/video',
        thumbnailUrl: 'https://example.com/thumbnail.jpg',
        category: 'Aid Distribution',
        tags: ['training', 'aid', 'distribution'],
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('title', 'Test Training Material');
        expect(res.body).toHaveProperty('type', 'VIDEO');
      });
  });

  it('/education/all (GET)', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/education/all')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBeTruthy();
      });
  });
});
