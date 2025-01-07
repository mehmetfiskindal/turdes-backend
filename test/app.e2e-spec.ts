import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

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

  it('/organizationNames (GET)', () => {
    return request(app.getHttpServer())
      .get('/organizationNames')
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual(expect.any(Array));
      });
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
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('access_token');
        expect(res.body).toHaveProperty('refresh_token');
        expect(res.body).toHaveProperty('role');
        expect(res.body).toHaveProperty('userId');
      });
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
        expect(res.body).toHaveProperty('role');
        expect(res.body).toHaveProperty('userId');
      });
  });

  it('/aidrequests (GET)', () => {
    return request(app.getHttpServer())
      .get('/aidrequests')
      .set('Authorization', 'Bearer ' + 'test_token')
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual(expect.any(Array));
      });
  });

  it('/aidrequests (POST)', () => {
    return request(app.getHttpServer())
      .post('/aidrequests')
      .set('Authorization', 'Bearer ' + 'test_token')
      .send({
        type: 'Food',
        description: 'Need food',
        status: 'Pending',
        userId: 1,
        organizationId: 1,
        locationId: 1,
        isDeleted: false,
        latitude: 40.7128,
        longitude: -74.0060,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('type');
        expect(res.body).toHaveProperty('description');
        expect(res.body).toHaveProperty('status');
        expect(res.body).toHaveProperty('userId');
        expect(res.body).toHaveProperty('organizationId');
        expect(res.body).toHaveProperty('locationId');
        expect(res.body).toHaveProperty('isDeleted');
        expect(res.body).toHaveProperty('latitude');
        expect(res.body).toHaveProperty('longitude');
      });
  });

  it('/aidrequests/:id/:organizationId (GET)', () => {
    return request(app.getHttpServer())
      .get('/aidrequests/1/1')
      .set('Authorization', 'Bearer ' + 'test_token')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('type');
        expect(res.body).toHaveProperty('description');
        expect(res.body).toHaveProperty('status');
        expect(res.body).toHaveProperty('userId');
        expect(res.body).toHaveProperty('organizationId');
        expect(res.body).toHaveProperty('locationId');
        expect(res.body).toHaveProperty('isDeleted');
        expect(res.body).toHaveProperty('latitude');
        expect(res.body).toHaveProperty('longitude');
      });
  });

  it('/aidrequests/:id/status (PATCH)', () => {
    return request(app.getHttpServer())
      .patch('/aidrequests/1/status')
      .set('Authorization', 'Bearer ' + 'test_token')
      .send({
        status: 'Completed',
        userId: '1',
        userRole: 'admin',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('status');
      });
  });

  it('/aidrequests/:id/comments (POST)', () => {
    return request(app.getHttpServer())
      .post('/aidrequests/1/comments')
      .set('Authorization', 'Bearer ' + 'test_token')
      .send({
        content: 'This is a comment',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('content');
      });
  });

  it('/aidrequests/:id/documents (POST)', () => {
    return request(app.getHttpServer())
      .post('/aidrequests/1/documents')
      .set('Authorization', 'Bearer ' + 'test_token')
      .send({
        documentName: 'Document',
        documentUrl: 'http://example.com',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('documentName');
        expect(res.body).toHaveProperty('documentUrl');
      });
  });

  it('/aidrequests/:id/delete (PATCH)', () => {
    return request(app.getHttpServer())
      .patch('/aidrequests/1/delete')
      .set('Authorization', 'Bearer ' + 'test_token')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('isDeleted');
      });
  });

  it('/campaigns (POST)', () => {
    return request(app.getHttpServer())
      .post('/campaigns')
      .set('Authorization', 'Bearer ' + 'test_token')
      .send({
        name: 'Campaign 1',
        description: 'Description of Campaign 1',
        endDate: '2023-12-31',
        targetAmount: 10000,
        organizationId: 1,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('name');
        expect(res.body).toHaveProperty('description');
        expect(res.body).toHaveProperty('endDate');
        expect(res.body).toHaveProperty('targetAmount');
        expect(res.body).toHaveProperty('organizationId');
      });
  });

  it('/campaigns/:id (GET)', () => {
    return request(app.getHttpServer())
      .get('/campaigns/1')
      .set('Authorization', 'Bearer ' + 'test_token')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('name');
        expect(res.body).toHaveProperty('description');
        expect(res.body).toHaveProperty('endDate');
        expect(res.body).toHaveProperty('targetAmount');
        expect(res.body).toHaveProperty('organizationId');
      });
  });

  it('/donors (POST)', () => {
    return request(app.getHttpServer())
      .post('/donors')
      .set('Authorization', 'Bearer ' + 'test_token')
      .send({
        name: 'Donor 1',
        email: 'donor1@example.com',
        phone: '1234567890',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('name');
        expect(res.body).toHaveProperty('email');
        expect(res.body).toHaveProperty('phone');
      });
  });

  it('/donors/:id (GET)', () => {
    return request(app.getHttpServer())
      .get('/donors/1')
      .set('Authorization', 'Bearer ' + 'test_token')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('name');
        expect(res.body).toHaveProperty('email');
        expect(res.body).toHaveProperty('phone');
      });
  });

  it('/education (POST)', () => {
    return request(app.getHttpServer())
      .post('/education')
      .set('Authorization', 'Bearer ' + 'test_token')
      .send({
        title: 'Training 1',
        description: 'Description of Training 1',
        date: '2023-12-31',
        location: 'Location 1',
        organizationId: 1,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('title');
        expect(res.body).toHaveProperty('description');
        expect(res.body).toHaveProperty('date');
        expect(res.body).toHaveProperty('location');
        expect(res.body).toHaveProperty('organizationId');
      });
  });

  it('/faq (POST)', () => {
    return request(app.getHttpServer())
      .post('/faq')
      .set('Authorization', 'Bearer ' + 'test_token')
      .send({
        question: 'What is FAQ 1?',
        answer: 'Answer to FAQ 1',
        organizationId: 1,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('question');
        expect(res.body).toHaveProperty('answer');
        expect(res.body).toHaveProperty('organizationId');
      });
  });

  it('/history (POST)', () => {
    return request(app.getHttpServer())
      .post('/history')
      .set('Authorization', 'Bearer ' + 'test_token')
      .send({
        aidRequestId: 1,
        status: 'Completed',
        userId: 1,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('aidRequestId');
        expect(res.body).toHaveProperty('status');
        expect(res.body).toHaveProperty('userId');
      });
  });

  it('/map (POST)', () => {
    return request(app.getHttpServer())
      .post('/map')
      .set('Authorization', 'Bearer ' + 'test_token')
      .send({
        aidRequestId: 1,
        latitude: 40.7128,
        longitude: -74.0060,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('aidRequestId');
        expect(res.body).toHaveProperty('latitude');
        expect(res.body).toHaveProperty('longitude');
      });
  });

  it('/organizations (POST)', () => {
    return request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', 'Bearer ' + 'test_token')
      .send({
        name: 'Organization 1',
        type: 'Non-Profit',
        mission: 'Mission of Organization 1',
        address: '123 Test St',
        phone: '123-456-7890',
        email: 'org1@example.com',
        contactName: 'John Doe',
        contactPhone: '123-456-7890',
        contactEmail: 'john@example.com',
        donationAccount: '123456789',
        iban: 'TR123456789',
        taxNumber: '123456789',
        aidTypes: 'Food, Shelter',
        targetAudience: 'Homeless',
        volunteerNeeds: 'Volunteers needed',
        latitude: 40.7128,
        longitude: -74.0060,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('name');
        expect(res.body).toHaveProperty('type');
        expect(res.body).toHaveProperty('mission');
        expect(res.body).toHaveProperty('address');
        expect(res.body).toHaveProperty('phone');
        expect(res.body).toHaveProperty('email');
        expect(res.body).toHaveProperty('contactName');
        expect(res.body).toHaveProperty('contactPhone');
        expect(res.body).toHaveProperty('contactEmail');
        expect(res.body).toHaveProperty('donationAccount');
        expect(res.body).toHaveProperty('iban');
        expect(res.body).toHaveProperty('taxNumber');
        expect(res.body).toHaveProperty('aidTypes');
        expect(res.body).toHaveProperty('targetAudience');
        expect(res.body).toHaveProperty('volunteerNeeds');
        expect(res.body).toHaveProperty('latitude');
        expect(res.body).toHaveProperty('longitude');
      });
  });

  it('/reports (POST)', () => {
    return request(app.getHttpServer())
      .post('/reports')
      .set('Authorization', 'Bearer ' + 'test_token')
      .send({
        title: 'Report 1',
        description: 'Description of Report 1',
        date: '2023-12-31',
        organizationId: 1,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('title');
        expect(res.body).toHaveProperty('description');
        expect(res.body).toHaveProperty('date');
        expect(res.body).toHaveProperty('organizationId');
      });
  });

  it('/volunteers (POST)', () => {
    return request(app.getHttpServer())
      .post('/volunteers')
      .set('Authorization', 'Bearer ' + 'test_token')
      .send({
        name: 'Volunteer 1',
        email: 'volunteer1@example.com',
        phone: '1234567890',
        organizationId: 1,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('name');
        expect(res.body).toHaveProperty('email');
        expect(res.body).toHaveProperty('phone');
        expect(res.body).toHaveProperty('organizationId');
      });
  });
});
