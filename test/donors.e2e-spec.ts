import * as request from 'supertest';
import { TestHelper } from './test-utils';

describe('DonorsController (e2e)', () => {
  let testHelper: TestHelper;
  let donorId: number;

  beforeAll(async () => {
    testHelper = await new TestHelper().initialize();
    // Test kullanıcısı oluştur ve giriş yap
    await testHelper.registerTestUser();
  });

  afterAll(async () => {
    await testHelper.cleanup();
  });

  it('/donors (POST) - should create a new donor', () => {
    return request(testHelper.getApp().getHttpServer())
      .post('/donors')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .send({
        firstName: 'Alice',
        lastName: 'Smith',
        email: `donor${Math.floor(Math.random() * 10000)}@test.com`,
        phone: '5551234567',
        address: '123 Donor St',
        city: 'Test City',
        postalCode: '12345',
        preferredContactMethod: 'email',
        donationType: 'monetary',
        isAnonymous: false,
        notes: 'Regular donor',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.firstName).toBe('Alice');
        expect(res.body.lastName).toBe('Smith');
        donorId = res.body.id;
      });
  });

  it('/donors (GET) - should return all donors', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/donors')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
      });
  });

  it('/donors/:id (GET) - should return a specific donor', () => {
    return request(testHelper.getApp().getHttpServer())
      .get(`/donors/${donorId}`)
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id', donorId);
        expect(res.body).toHaveProperty('firstName', 'Alice');
        expect(res.body).toHaveProperty('lastName', 'Smith');
      });
  });

  it('/donors/:id (PATCH) - should update a donor', () => {
    return request(testHelper.getApp().getHttpServer())
      .patch(`/donors/${donorId}`)
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .send({
        firstName: 'Alicia',
        preferredContactMethod: 'phone',
        notes: 'Updated donor notes',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id', donorId);
        expect(res.body).toHaveProperty('firstName', 'Alicia');
        expect(res.body).toHaveProperty('preferredContactMethod', 'phone');
        expect(res.body).toHaveProperty('notes', 'Updated donor notes');
      });
  });

  it('/donors/:id/donations (POST) - should add a donation from a donor', () => {
    return request(testHelper.getApp().getHttpServer())
      .post(`/donors/${donorId}/donations`)
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .send({
        amount: 1500,
        date: new Date().toISOString(),
        type: 'monetary',
        campaign: 'General Fund',
        paymentMethod: 'credit_card',
        notes: 'Test donation',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('donorId', donorId);
        expect(res.body).toHaveProperty('amount', 1500);
      });
  });

  it('/donors/:id/donations (GET) - should get all donations from a donor', () => {
    return request(testHelper.getApp().getHttpServer())
      .get(`/donors/${donorId}/donations`)
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0]).toHaveProperty('donorId', donorId);
      });
  });

  it('/donors/search (POST) - should search donors by criteria', () => {
    return request(testHelper.getApp().getHttpServer())
      .post('/donors/search')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .send({
        donationType: 'monetary',
        city: 'Test City',
      })
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0]).toHaveProperty('donationType', 'monetary');
      });
  });

  it('/donors/statistics (GET) - should get donor statistics', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/donors/statistics')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('totalDonors');
        expect(res.body).toHaveProperty('totalDonations');
        expect(res.body).toHaveProperty('averageDonationAmount');
      });
  });

  it('/donors/:id (DELETE) - should delete a donor', () => {
    return request(testHelper.getApp().getHttpServer())
      .delete(`/donors/${donorId}`)
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id', donorId);
        expect(res.body).toHaveProperty('isDeleted', true);
      });
  });

  it('/donors/donations (POST)', () => {
    return request(testHelper.getApp().getHttpServer())
      .post('/donors/donations')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .send({
        amount: 100,
        currency: 'USD',
        type: 'Money',
        isAnonymous: false,
        userId: 1,
        organizationId: 1,
        campaignId: null,
        note: 'Test donation',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('amount', 100);
        expect(res.body).toHaveProperty('currency', 'USD');
        expect(res.body).toHaveProperty('type', 'Money');
        expect(res.body).toHaveProperty('isAnonymous', false);
      });
  });

  it('/donors/donations (GET)', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/donors/donations')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBeTruthy();
      });
  });

  it('/donors/donations/anonymous (GET)', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/donors/donations/anonymous')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBeTruthy();
      });
  });

  it('/donors/donations/statistics (GET)', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/donors/donations/statistics')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('totalDonations');
        expect(res.body).toHaveProperty('totalAmount');
        expect(res.body).toHaveProperty('donationsByType');
        expect(res.body).toHaveProperty('donationsByMonth');
      });
  });
});
