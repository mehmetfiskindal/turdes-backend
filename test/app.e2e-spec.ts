import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/auth/register (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@test.com',
        password: 'testpass',
        name: 'Test User',
        phone: '1234567890',
        role: 'user',
      })
      .expect(201);
  });

  it('/auth/login (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@test.com',
        password: 'testpass',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('access_token');
        expect(res.body).toHaveProperty('refresh_token');
      });
  });

  it('/aidrequests (GET)', () => {
    return request(app.getHttpServer())
      .get('/aidrequests')
      .set('Authorization', `Bearer ${process.env.TEST_ACCESS_TOKEN}`)
      .expect(200);
  });

  it('/aidrequests (POST)', () => {
    return request(app.getHttpServer())
      .post('/aidrequests')
      .set('Authorization', `Bearer ${process.env.TEST_ACCESS_TOKEN}`)
      .send({
        type: 'Food',
        description: 'Need food',
        status: 'Pending',
        userId: 1,
        organizationId: 1,
        locationId: 1,
        isDeleted: false,
        latitude: 40.7128,
        longitude: -74.006,
      })
      .expect(201);
  });

  it('/aidrequests/:id (GET)', () => {
    return request(app.getHttpServer())
      .get('/aidrequests/1')
      .set('Authorization', `Bearer ${process.env.TEST_ACCESS_TOKEN}`)
      .expect(200);
  });

  it('/aidrequests/:id/status (PATCH)', () => {
    return request(app.getHttpServer())
      .patch('/aidrequests/1/status')
      .set('Authorization', `Bearer ${process.env.TEST_ACCESS_TOKEN}`)
      .send({
        status: 'Completed',
        userId: '1',
        userRole: 'admin',
      })
      .expect(200);
  });

  it('/aidrequests/:id/comments (POST)', () => {
    return request(app.getHttpServer())
      .post('/aidrequests/1/comments')
      .set('Authorization', `Bearer ${process.env.TEST_ACCESS_TOKEN}`)
      .send({
        content: 'This is a comment',
      })
      .expect(201);
  });

  it('/aidrequests/:id/documents (POST)', () => {
    return request(app.getHttpServer())
      .post('/aidrequests/1/documents')
      .set('Authorization', `Bearer ${process.env.TEST_ACCESS_TOKEN}`)
      .send({
        documentName: 'Document',
        documentUrl: 'http://example.com',
      })
      .expect(201);
  });

  it('/aidrequests/:id/delete (PATCH)', () => {
    return request(app.getHttpServer())
      .patch('/aidrequests/1/delete')
      .set('Authorization', `Bearer ${process.env.TEST_ACCESS_TOKEN}`)
      .expect(200);
  });
});
