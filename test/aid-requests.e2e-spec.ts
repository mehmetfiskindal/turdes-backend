import * as request from 'supertest';
import { TestHelper } from './test-utils';

describe('AidRequestsController (e2e)', () => {
  let testHelper: TestHelper;
  let aidRequestId: number;

  beforeAll(async () => {
    testHelper = await new TestHelper().initialize();
    // Test kullanıcısı oluştur ve giriş yap
    await testHelper.registerTestUser();
  });

  afterAll(async () => {
    await testHelper.cleanup();
  });

  it('/aidrequests (GET) - should return all aid requests', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/aidrequests')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('/aidrequests (POST) - should create a new aid request', () => {
    return request(testHelper.getApp().getHttpServer())
      .post('/aidrequests')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .send({
        type: 'Food',
        description: 'Need emergency food supplies',
        status: 'Pending',
        latitude: 40.7128,
        longitude: -74.006,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.type).toBe('Food');
        expect(res.body.description).toBe('Need emergency food supplies');
        aidRequestId = res.body.id; // Sonraki testlerde kullanmak için ID'yi kaydediyoruz
      });
  });

  it('/aidrequests/:id (GET) - should return a specific aid request', () => {
    return request(testHelper.getApp().getHttpServer())
      .get(`/aidrequests/${aidRequestId}`)
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id', aidRequestId);
        expect(res.body).toHaveProperty('type', 'Food');
      });
  });

  it('/aidrequests/:id (PATCH) - should update an aid request', () => {
    return request(testHelper.getApp().getHttpServer())
      .patch(`/aidrequests/${aidRequestId}`)
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .send({
        description: 'Updated description',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id', aidRequestId);
        expect(res.body).toHaveProperty('description', 'Updated description');
      });
  });

  it('/aidrequests/:id/status (PATCH) - should update an aid request status', () => {
    return request(testHelper.getApp().getHttpServer())
      .patch(`/aidrequests/${aidRequestId}/status`)
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .send({
        status: 'InProgress',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id', aidRequestId);
        expect(res.body).toHaveProperty('status', 'InProgress');
      });
  });

  it('/aidrequests/:id/comments (POST) - should add a comment to an aid request', () => {
    return request(testHelper.getApp().getHttpServer())
      .post(`/aidrequests/${aidRequestId}/comments`)
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .send({
        content: 'This is a test comment',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('content', 'This is a test comment');
        expect(res.body).toHaveProperty('aidRequestId', aidRequestId);
      });
  });

  it('/aidrequests/:id/documents (POST) - should add a document to an aid request', () => {
    return request(testHelper.getApp().getHttpServer())
      .post(`/aidrequests/${aidRequestId}/documents`)
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .send({
        documentName: 'Test Document',
        documentUrl: 'http://test-document-url.com',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('documentName', 'Test Document');
        expect(res.body).toHaveProperty('aidRequestId', aidRequestId);
      });
  });

  it('/aidrequests/:id/comments (GET) - should get all comments for an aid request', () => {
    return request(testHelper.getApp().getHttpServer())
      .get(`/aidrequests/${aidRequestId}/comments`)
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0]).toHaveProperty('content');
      });
  });

  it('/aidrequests/:id/documents (GET) - should get all documents for an aid request', () => {
    return request(testHelper.getApp().getHttpServer())
      .get(`/aidrequests/${aidRequestId}/documents`)
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0]).toHaveProperty('documentName');
      });
  });

  it('/aidrequests/:id/delete (PATCH) - should mark an aid request as deleted', () => {
    return request(testHelper.getApp().getHttpServer())
      .patch(`/aidrequests/${aidRequestId}/delete`)
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id', aidRequestId);
        expect(res.body).toHaveProperty('isDeleted', true);
      });
  });
});
