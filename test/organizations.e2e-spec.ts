import * as request from 'supertest';
import { TestHelper } from './test-utils';

describe('OrganizationsController (e2e)', () => {
  let testHelper: TestHelper;

  beforeAll(async () => {
    testHelper = await new TestHelper().initialize();
  });

  afterAll(async () => {
    await testHelper.cleanup();
  });

  it('/organizations (GET)', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/organizations')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBeTruthy();
      });
  });

  it('/organizations/:id (GET)', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/organizations/1')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('name');
      });
  });

  it('/organizations (POST)', () => {
    return request(testHelper.getApp().getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .send({
        name: 'Test Organization',
        description: 'A Test Organization',
        address: '123 Test St',
        phone: '1234567890',
        email: 'test@org.com',
        website: 'http://testorg.com',
        logoUrl: 'http://testorg.com/logo.png',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('name', 'Test Organization');
      });
  });

  it('/organizations/:id (PATCH)', () => {
    return request(testHelper.getApp().getHttpServer())
      .patch('/organizations/1')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .send({
        name: 'Updated Organization',
        description: 'Updated description',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('name', 'Updated Organization');
        expect(res.body).toHaveProperty('description', 'Updated description');
      });
  });

  it('/organizations/:id/messages (POST)', () => {
    return request(testHelper.getApp().getHttpServer())
      .post('/organizations/1/messages')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .send({
        content: 'Test message',
        senderId: 1,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('content', 'Test message');
        expect(res.body).toHaveProperty('senderId', 1);
        expect(res.body).toHaveProperty('organizationId', 1);
      });
  });

  it('/organizations/:id/ratings (POST)', () => {
    return request(testHelper.getApp().getHttpServer())
      .post('/organizations/1/ratings')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .send({
        rating: 5,
        comment: 'Great organization!',
        userId: 1,
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('rating', 5);
        expect(res.body).toHaveProperty('comment', 'Great organization!');
        expect(res.body).toHaveProperty('organizationId', 1);
      });
  });

  it('/organizations/:id/ratings (GET)', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/organizations/1/ratings')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBeTruthy();
      });
  });

  it('/organizations/:id/flag (POST)', () => {
    return request(testHelper.getApp().getHttpServer())
      .post('/organizations/1/flag')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .send({
        reason: 'Suspicious activity',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('organizationId', 1);
        expect(res.body).toHaveProperty('reason', 'Suspicious activity');
      });
  });
});
