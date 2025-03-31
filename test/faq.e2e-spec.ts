import * as request from 'supertest';
import { TestHelper } from './test-utils';

describe('FaqController (e2e)', () => {
  let testHelper: TestHelper;

  beforeAll(async () => {
    testHelper = await new TestHelper().initialize();
  });

  afterAll(async () => {
    await testHelper.cleanup();
  });

  it('/faq (GET)', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/faq')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBeTruthy();
      });
  });

  it('/faq/:id (GET)', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/faq/1')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('question');
        expect(res.body).toHaveProperty('answer');
      });
  });

  it('/faq (POST)', () => {
    return request(testHelper.getApp().getHttpServer())
      .post('/faq')
      .send({
        question: 'Test Question?',
        answer: 'Test Answer',
        category: 'General'
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('question', 'Test Question?');
        expect(res.body).toHaveProperty('answer', 'Test Answer');
        expect(res.body).toHaveProperty('category', 'General');
      });
  });

  it('/faq/:id (PATCH)', () => {
    return request(testHelper.getApp().getHttpServer())
      .patch('/faq/1')
      .send({
        question: 'Updated Question?',
        answer: 'Updated Answer'
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('question', 'Updated Question?');
        expect(res.body).toHaveProperty('answer', 'Updated Answer');
      });
  });

  it('/faq/:id (DELETE)', () => {
    // Önce yeni bir FAQ oluşturalım ve sonra silelim
    return request(testHelper.getApp().getHttpServer())
      .post('/faq')
      .send({
        question: 'Question to Delete?',
        answer: 'Answer to Delete',
        category: 'General'
      })
      .expect(201)
      .then(res => {
        const faqId = res.body.id;
        return request(testHelper.getApp().getHttpServer())
          .delete(`/faq/${faqId}`)
          .expect(200)
          .expect((delRes) => {
            expect(delRes.body).toHaveProperty('id');
          });
      });
  });
});