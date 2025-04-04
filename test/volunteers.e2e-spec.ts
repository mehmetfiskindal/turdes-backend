import * as request from 'supertest';
import { TestHelper } from './test-utils';

describe('VolunteersController (e2e)', () => {
  let testHelper: TestHelper;

  beforeAll(async () => {
    testHelper = await new TestHelper().initialize();
  });

  afterAll(async () => {
    await testHelper.cleanup();
  });

  it('/volunteers/register (POST)', () => {
    return request(testHelper.getApp().getHttpServer())
      .post('/volunteers/register')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .send({
        name: 'Test Volunteer',
        email: 'volunteer@test.com',
        phone: '1234567890',
        skills: ['driving', 'first-aid'],
        availability: ['weekends', 'evenings'],
        locationId: 1,
        userId: 1,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('name', 'Test Volunteer');
        expect(res.body).toHaveProperty('email', 'volunteer@test.com');
      });
  });

  it('/volunteers/assign-task (POST)', () => {
    return request(testHelper.getApp().getHttpServer())
      .post('/volunteers/assign-task')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .send({
        volunteerId: 1,
        taskId: 1,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 1 day later
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('volunteerId', 1);
        expect(res.body).toHaveProperty('taskId', 1);
      });
  });
});
