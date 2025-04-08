import * as request from 'supertest';
import { TestHelper } from './test-utils';

describe('OrganizationsController (e2e)', () => {
  let testHelper: TestHelper;
  let organizationId: number;

  beforeAll(async () => {
    testHelper = await new TestHelper().initialize();
    // Test kullanıcısı oluştur ve giriş yap
    await testHelper.registerTestUser();
  });

  afterAll(async () => {
    await testHelper.cleanup();
  });

  it('/organizations (POST) - should create a new organization', () => {
    return request(testHelper.getApp().getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .send({
        name: 'Test Organization',
        description: 'This is a test organization',
        contactEmail: 'test@org.com',
        contactPhone: '5551234567',
        address: '123 Test St, Test City',
        website: 'https://testorg.com',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.name).toBe('Test Organization');
        organizationId = res.body.id;
      });
  });

  it('/organizations (GET) - should return all organizations', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/organizations')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
      });
  });

  it('/organizations/:id (GET) - should return a specific organization', () => {
    return request(testHelper.getApp().getHttpServer())
      .get(`/organizations/${organizationId}`)
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id', organizationId);
        expect(res.body).toHaveProperty('name', 'Test Organization');
      });
  });

  it('/organizations/:id (PATCH) - should update an organization', () => {
    return request(testHelper.getApp().getHttpServer())
      .patch(`/organizations/${organizationId}`)
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .send({
        name: 'Updated Organization',
        description: 'This is an updated organization',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id', organizationId);
        expect(res.body).toHaveProperty('name', 'Updated Organization');
        expect(res.body).toHaveProperty(
          'description',
          'This is an updated organization',
        );
      });
  });

  it('/organizations/:id/members (POST) - should add a member to an organization', () => {
    return request(testHelper.getApp().getHttpServer())
      .post(`/organizations/${organizationId}/members`)
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .send({
        email: 'member@test.com',
        role: 'member',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('organizationId', organizationId);
        expect(res.body).toHaveProperty('role', 'member');
      });
  });

  it('/organizations/:id/members (GET) - should get all members of an organization', () => {
    return request(testHelper.getApp().getHttpServer())
      .get(`/organizations/${organizationId}/members`)
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0]).toHaveProperty('role');
      });
  });

  it('/organizations/:id/members/:memberId (PATCH) - should update a member role', () => {
    // Önce üyeleri alalım ve bir id bulalım
    return request(testHelper.getApp().getHttpServer())
      .get(`/organizations/${organizationId}/members`)
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .then((res) => {
        const memberId = res.body[0].id;

        return request(testHelper.getApp().getHttpServer())
          .patch(`/organizations/${organizationId}/members/${memberId}`)
          .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
          .send({
            role: 'admin',
          })
          .expect(200)
          .expect((res) => {
            expect(res.body).toHaveProperty('id', memberId);
            expect(res.body).toHaveProperty('role', 'admin');
          });
      });
  });

  it('/organizations/:id/members/:memberId (DELETE) - should remove a member', () => {
    // Önce üyeleri alalım ve bir id bulalım
    return request(testHelper.getApp().getHttpServer())
      .get(`/organizations/${organizationId}/members`)
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .then((res) => {
        const memberId = res.body[0].id;

        return request(testHelper.getApp().getHttpServer())
          .delete(`/organizations/${organizationId}/members/${memberId}`)
          .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
          .expect(200);
      });
  });

  it('/organizations/:id (DELETE) - should delete an organization', () => {
    return request(testHelper.getApp().getHttpServer())
      .delete(`/organizations/${organizationId}`)
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id', organizationId);
        expect(res.body).toHaveProperty('isDeleted', true);
      });
  });
});
