import * as request from 'supertest';
import { TestHelper } from './test-utils';

describe('FaqController (e2e)', () => {
  let testHelper: TestHelper;
  let faqId: number;

  beforeAll(async () => {
    testHelper = await new TestHelper().initialize();
    // Test kullanıcısı oluştur ve giriş yap
    await testHelper.registerTestUser();
  });

  afterAll(async () => {
    await testHelper.cleanup();
  });

  it('/faq (POST) - should create a new FAQ entry', () => {
    return request(testHelper.getApp().getHttpServer())
      .post('/faq')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .send({
        question: 'Nasıl yardım alabilirim?',
        answer:
          'Yardım almak için uygulamamız üzerinden talep oluşturabilirsiniz.',
        category: 'general',
        order: 1,
        isPublished: true,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.question).toBe('Nasıl yardım alabilirim?');
        faqId = res.body.id;
      });
  });

  it('/faq (GET) - should return all FAQ entries', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/faq')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
      });
  });

  it('/faq/published (GET) - should return only published FAQ entries', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/faq/published')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        res.body.forEach((faq) => {
          expect(faq.isPublished).toBe(true);
        });
      });
  });

  it('/faq/:id (GET) - should return a specific FAQ entry', () => {
    return request(testHelper.getApp().getHttpServer())
      .get(`/faq/${faqId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id', faqId);
        expect(res.body).toHaveProperty('question', 'Nasıl yardım alabilirim?');
      });
  });

  it('/faq/category/:category (GET) - should return FAQs by category', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/faq/category/general')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        res.body.forEach((faq) => {
          expect(faq.category).toBe('general');
        });
      });
  });

  it('/faq/:id (PATCH) - should update a FAQ entry', () => {
    return request(testHelper.getApp().getHttpServer())
      .patch(`/faq/${faqId}`)
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .send({
        question: 'Yardım almak için ne yapmalıyım?',
        answer:
          'Güncellenmiş cevap: Uygulamamız üzerinden talep oluşturabilirsiniz.',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id', faqId);
        expect(res.body).toHaveProperty(
          'question',
          'Yardım almak için ne yapmalıyım?',
        );
        expect(res.body).toHaveProperty(
          'answer',
          'Güncellenmiş cevap: Uygulamamız üzerinden talep oluşturabilirsiniz.',
        );
      });
  });

  it('/faq/:id/publish (PATCH) - should toggle publish status', () => {
    return request(testHelper.getApp().getHttpServer())
      .patch(`/faq/${faqId}/publish`)
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .send({
        isPublished: false,
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id', faqId);
        expect(res.body).toHaveProperty('isPublished', false);
      });
  });

  it('/faq/:id/order (PATCH) - should update FAQ order', () => {
    return request(testHelper.getApp().getHttpServer())
      .patch(`/faq/${faqId}/order`)
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .send({
        order: 2,
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id', faqId);
        expect(res.body).toHaveProperty('order', 2);
      });
  });

  it('/faq/:id (DELETE) - should delete a FAQ entry', () => {
    return request(testHelper.getApp().getHttpServer())
      .delete(`/faq/${faqId}`)
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id', faqId);
        expect(res.body).toHaveProperty('deleted');
        expect(res.body.deleted).toBeTruthy();
      });
  });
});
