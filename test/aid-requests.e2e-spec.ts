import * as request from 'supertest';
import { TestHelper } from './test-utils';

describe('AidRequestsController (e2e)', () => {
  let testHelper: TestHelper;

  beforeAll(async () => {
    testHelper = await new TestHelper().initialize();
  });

  afterAll(async () => {
    await testHelper.cleanup();
  });

  it('/aidrequests (GET)', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/aidrequests')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBeTruthy();
      });
  });

  it('/aidrequests (POST)', () => {
    return request(testHelper.getApp().getHttpServer())
      .post('/aidrequests')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .send({
        type: 'Food',
        description: 'Need food supplies',
        status: 'Pending',
        userId: 1,
        organizationId: 1,
        locationId: 1,
        isDeleted: false,
        latitude: 40.7128,
        longitude: -74.006,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('type', 'Food');
        expect(res.body).toHaveProperty('qrCodeUrl');
      });
  });

  it('/aidrequests/:id/:organizationId (GET)', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/aidrequests/1/1') // id ve organizationId
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('type');
      });
  });

  it('/aidrequests/:id/status (PATCH)', () => {
    return request(testHelper.getApp().getHttpServer())
      .patch('/aidrequests/1/status')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .send({
        status: 'In Progress',
        userId: '1',
        userRole: 'admin',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('status', 'In Progress');
      });
  });

  it('/aidrequests/:id/comments (POST)', () => {
    return request(testHelper.getApp().getHttpServer())
      .post('/aidrequests/1/comments')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .send({
        content: 'This is a test comment',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('content', 'This is a test comment');
        expect(res.body).toHaveProperty('aidRequestId', 1);
      });
  });

  it('/aidrequests/:id/documents (POST)', () => {
    return request(testHelper.getApp().getHttpServer())
      .post('/aidrequests/1/documents')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .send({
        documentName: 'Test Document',
        documentUrl: 'http://example.com/test-doc',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('name', 'Test Document');
        expect(res.body).toHaveProperty('url', 'http://example.com/test-doc');
        expect(res.body).toHaveProperty('aidRequestId', 1);
      });
  });

  it('/aidrequests/:id/verify (PATCH)', () => {
    return request(testHelper.getApp().getHttpServer())
      .patch('/aidrequests/1/verify')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('isVerified', true);
      });
  });

  it('/aidrequests/:id/report (PATCH)', () => {
    return request(testHelper.getApp().getHttpServer())
      .patch('/aidrequests/1/report')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('isReported', true);
      });
  });

  it('/aidrequests/verify-delivery (POST)', () => {
    return request(testHelper.getApp().getHttpServer())
      .post('/aidrequests/verify-delivery')
      .send({
        qrCodeData: 'aidRequest:1',
        status: 'Delivered',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('status', 'Delivered');
      });
  });

  it('/aidrequests/search (POST)', () => {
    return request(testHelper.getApp().getHttpServer())
      .post('/aidrequests/search')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .send({
        status: 'Pending',
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortDirection: 'desc',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('data');
        expect(res.body).toHaveProperty('meta');
        expect(Array.isArray(res.body.data)).toBeTruthy();
      });
  });

  it('/aidrequests/trigger-weather/:latitude/:longitude (POST)', () => {
    return request(testHelper.getApp().getHttpServer())
      .post('/aidrequests/trigger-weather/40.7128/-74.006')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('triggeredRequests');
      });
  });

  it('/aidrequests/:id/delete (PATCH)', () => {
    return request(testHelper.getApp().getHttpServer())
      .patch('/aidrequests/1/delete')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('isDeleted', true);
      });
  });
});
