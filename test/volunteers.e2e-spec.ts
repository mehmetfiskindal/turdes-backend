import * as request from 'supertest';
import { TestHelper } from './test-utils';

describe('VolunteersController (e2e)', () => {
  let testHelper: TestHelper;
  let volunteerId: number;

  beforeAll(async () => {
    testHelper = await new TestHelper().initialize();
    // Test kullanıcısı oluştur ve giriş yap
    await testHelper.registerTestUser();
  });

  afterAll(async () => {
    await testHelper.cleanup();
  });

  it('/volunteers (POST) - should create a new volunteer', () => {
    return request(testHelper.getApp().getHttpServer())
      .post('/volunteers')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: `volunteer${Math.floor(Math.random() * 10000)}@test.com`,
        phone: '5551234567',
        skills: ['driving', 'first-aid'],
        availability: ['weekends', 'evenings'],
        address: '123 Volunteer St',
        city: 'Test City',
        postalCode: '12345',
        hasVehicle: true,
        identificationNumber: 'V12345',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.firstName).toBe('John');
        expect(res.body.lastName).toBe('Doe');
        volunteerId = res.body.id;
      });
  });

  it('/volunteers (GET) - should return all volunteers', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/volunteers')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
      });
  });

  it('/volunteers/:id (GET) - should return a specific volunteer', () => {
    return request(testHelper.getApp().getHttpServer())
      .get(`/volunteers/${volunteerId}`)
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id', volunteerId);
        expect(res.body).toHaveProperty('firstName', 'John');
        expect(res.body).toHaveProperty('lastName', 'Doe');
      });
  });

  it('/volunteers/:id (PATCH) - should update a volunteer', () => {
    return request(testHelper.getApp().getHttpServer())
      .patch(`/volunteers/${volunteerId}`)
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .send({
        firstName: 'Jane',
        skills: ['driving', 'first-aid', 'cooking'],
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id', volunteerId);
        expect(res.body).toHaveProperty('firstName', 'Jane');
        expect(res.body).toHaveProperty('skills');
        expect(res.body.skills).toContain('cooking');
      });
  });

  it('/volunteers/search (POST) - should search volunteers by criteria', () => {
    return request(testHelper.getApp().getHttpServer())
      .post('/volunteers/search')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .send({
        skills: ['driving'],
        availability: ['weekends'],
      })
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0]).toHaveProperty('skills');
      });
  });

  it('/volunteers/:id/assign (POST) - should assign volunteer to a task', () => {
    return request(testHelper.getApp().getHttpServer())
      .post(`/volunteers/${volunteerId}/assign`)
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .send({
        taskId: 1, // Test task ID
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 saat sonra
        notes: 'Test assignment',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('volunteerId', volunteerId);
        expect(res.body).toHaveProperty('taskId', 1);
      });
  });

  it('/volunteers/:id/tasks (GET) - should get volunteer assigned tasks', () => {
    return request(testHelper.getApp().getHttpServer())
      .get(`/volunteers/${volunteerId}/tasks`)
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('/volunteers/:id/status (PATCH) - should update volunteer status', () => {
    return request(testHelper.getApp().getHttpServer())
      .patch(`/volunteers/${volunteerId}/status`)
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .send({
        status: 'inactive',
        reason: 'Temporary unavailable',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id', volunteerId);
        expect(res.body).toHaveProperty('status', 'inactive');
      });
  });

  it('/volunteers/:id (DELETE) - should delete a volunteer', () => {
    return request(testHelper.getApp().getHttpServer())
      .delete(`/volunteers/${volunteerId}`)
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id', volunteerId);
        expect(res.body).toHaveProperty('isDeleted', true);
      });
  });
});
