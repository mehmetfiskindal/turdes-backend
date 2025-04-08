import * as request from 'supertest';
import { TestHelper } from './test-utils';

describe('DashboardController (e2e)', () => {
  let testHelper: TestHelper;

  beforeAll(async () => {
    testHelper = await new TestHelper().initialize();
    // Test kullanıcısı oluştur ve giriş yap
    await testHelper.registerTestUser();
  });

  afterAll(async () => {
    await testHelper.cleanup();
  });

  it('/dashboard/analytics (GET)', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/dashboard/analytics')
      .set('Authorization', `Bearer ${testHelper.getAdminToken()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toBeDefined();
        expect(res.body).toHaveProperty('totalUsers');
        expect(res.body).toHaveProperty('totalAidRequests');
        expect(res.body).toHaveProperty('totalOrganizations');
      });
  });

  it('/dashboard/aid-distribution (GET)', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/dashboard/aid-distribution')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toBeDefined();
        expect(res.body).toHaveProperty('byType');
        expect(res.body).toHaveProperty('byStatus');
        expect(res.body).toHaveProperty('byMonth');
      });
  });

  it('/dashboard/user-categories (GET)', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/dashboard/user-categories')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toBeDefined();
        expect(res.body).toHaveProperty('byRole');
        expect(res.body).toHaveProperty('byRegion');
      });
  });

  it('/dashboard/organizations (GET)', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/dashboard/organizations')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toBeDefined();
        expect(res.body).toHaveProperty('totalCount');
        expect(res.body).toHaveProperty('byRating');
        expect(res.body).toHaveProperty('byRegion');
      });
  });

  it('/dashboard/donations (GET)', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/dashboard/donations')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toBeDefined();
        expect(res.body).toHaveProperty('totalAmount');
        expect(res.body).toHaveProperty('byMonth');
        expect(res.body).toHaveProperty('byType');
      });
  });

  it('/dashboard/aid-efficiency-by-location (GET)', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/dashboard/aid-efficiency-by-location')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toBeDefined();
        expect(Array.isArray(res.body)).toBeTruthy();
      });
  });

  it('/dashboard/summary (GET) - should return dashboard summary', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/dashboard/summary')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('totalAidRequests');
        expect(res.body).toHaveProperty('totalDonations');
        expect(res.body).toHaveProperty('totalVolunteers');
      });
  });

  it('/dashboard/recent-activity (GET) - should return recent activities', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/dashboard/recent-activity')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('/dashboard/aid-requests-by-status (GET) - should return aid requests grouped by status', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/dashboard/aid-requests-by-status')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('pending');
        expect(res.body).toHaveProperty('inProgress');
        expect(res.body).toHaveProperty('completed');
      });
  });

  it('/dashboard/aid-requests-by-type (GET) - should return aid requests grouped by type', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/dashboard/aid-requests-by-type')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(Object.keys(res.body).length).toBeGreaterThan(0);
      });
  });

  it('/dashboard/donations-by-month (GET) - should return donations grouped by month', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/dashboard/donations-by-month')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('/dashboard/volunteers-by-skill (GET) - should return volunteers grouped by skill', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/dashboard/volunteers-by-skill')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(Object.keys(res.body).length).toBeGreaterThan(0);
      });
  });

  it('/dashboard/campaigns-status (GET) - should return campaigns status', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/dashboard/campaigns-status')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('activeCampaigns');
        expect(res.body).toHaveProperty('completedCampaigns');
        expect(res.body).toHaveProperty('totalFundsRaised');
      });
  });

  it('/dashboard/organization/:id (GET) - should return organization-specific dashboard', () => {
    // Önce organizasyon oluşturalım
    return request(testHelper.getApp().getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .send({
        name: 'Test Dashboard Org',
        description: 'Test organization for dashboard',
        contactEmail: 'dashboard@test.org',
        contactPhone: '5551234567',
      })
      .then((orgRes) => {
        const orgId = orgRes.body.id;

        return request(testHelper.getApp().getHttpServer())
          .get(`/dashboard/organization/${orgId}`)
          .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
          .expect(200)
          .expect((res) => {
            expect(res.body).toHaveProperty('organizationName');
            expect(res.body).toHaveProperty('totalMembers');
            expect(res.body).toHaveProperty('aidRequestsStats');
            expect(res.body).toHaveProperty('donationsStats');
          });
      });
  });

  it('/dashboard/map-data (GET) - should return geospatial data for map', () => {
    return request(testHelper.getApp().getHttpServer())
      .get('/dashboard/map-data')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        if (res.body.length > 0) {
          expect(res.body[0]).toHaveProperty('latitude');
          expect(res.body[0]).toHaveProperty('longitude');
          expect(res.body[0]).toHaveProperty('type');
        }
      });
  });
});
