# Turdes Testing Guide

Bu dokümanda Turdes backend sisteminin test stratejisi, test yazma rehberi ve test çalıştırma prosedürleri açıklanmıştır.

## 1. Test Strategy Overview

Turdes projesi kapsamlı bir test stratejisi benimser:

- **Unit Tests**: Servis ve utility fonksiyonları için
- **E2E Tests**: API endpoint'leri için tam entegrasyon testleri
- **Integration Tests**: Firebase ve external service entegrasyonları
- **Test Data Management**: Tutarlı test verisi yönetimi

## 2. Test Infrastructure

### Test Framework
- **Jest**: Test runner ve assertion library
- **Supertest**: HTTP endpoint testing
- **TestHelper**: Custom test utility class

### Test Environment Setup

**Test Database:**
```bash
# Test için ayrı database kullan
DATABASE_URL="postgresql://user:password@localhost:5432/turdes_test"
```

**Environment Variables:**
```bash
NODE_ENV=test
AUDIT_LOG_ENABLED=false
JWT_ACCESS_SECRET=test-access-secret
JWT_REFRESH_SECRET=test-refresh-secret
TEST_ACCESS_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
TEST_ADMIN_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 3. Test Commands

```bash
# Unit testler
npm test

# E2E testler
npm run test:e2e

# Firebase emulator ile integration testler
npm run test:firebase

# Test token'ları generate et
npm run test:gen-tokens

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## 4. TestHelper Class Usage

### Basic Setup

```typescript
import { TestHelper } from './test-utils';

describe('AidRequests E2E', () => {
  let testHelper: TestHelper;

  beforeAll(async () => {
    testHelper = await new TestHelper().initialize();
  });

  afterAll(async () => {
    await testHelper.cleanup();
  });

  it('should create aid request', async () => {
    const token = testHelper.getAccessToken();
    
    const response = await request(testHelper.app.getHttpServer())
      .post('/api/aidrequests')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'food',
        description: 'Test aid request',
        isUrgent: true,
        location: {
          latitude: 41.0082,
          longitude: 28.9784
        }
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
```

### Test User Management

```typescript
describe('User specific tests', () => {
  let testHelper: TestHelper;
  let testUser: any;

  beforeAll(async () => {
    testHelper = await new TestHelper().initialize();
    testUser = await testHelper.registerTestUser({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
  });

  it('should access user data', () => {
    expect(testUser.isEmailVerified).toBe(true);
    expect(testUser.email).toBe('test@example.com');
  });
});
```

## 5. E2E Test Patterns

### Standard CRUD Testing

```typescript
describe('AidRequests CRUD', () => {
  let testHelper: TestHelper;
  let createdAidRequest: any;

  beforeAll(async () => {
    testHelper = await new TestHelper().initialize();
  });

  afterAll(async () => {
    await testHelper.cleanup();
  });

  // CREATE
  it('should create aid request', async () => {
    const response = await request(testHelper.app.getHttpServer())
      .post('/api/aidrequests')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .send({
        type: 'food',
        description: 'Test description',
        isUrgent: false,
        location: { latitude: 41.0082, longitude: 28.9784 }
      });

    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty('id');
    createdAidRequest = response.body.data;
  });

  // READ
  it('should get aid request by id', async () => {
    const response = await request(testHelper.app.getHttpServer())
      .get(`/api/aidrequests/${createdAidRequest.id}`)
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`);

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(createdAidRequest.id);
  });

  // UPDATE
  it('should update aid request', async () => {
    const response = await request(testHelper.app.getHttpServer())
      .patch(`/api/aidrequests/${createdAidRequest.id}`)
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .send({ description: 'Updated description' });

    expect(response.status).toBe(200);
    expect(response.body.data.description).toBe('Updated description');
  });

  // DELETE
  it('should delete aid request', async () => {
    const response = await request(testHelper.app.getHttpServer())
      .delete(`/api/aidrequests/${createdAidRequest.id}`)
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`);

    expect(response.status).toBe(200);
  });
});
```

### Authentication Testing

```typescript
describe('Authentication', () => {
  let testHelper: TestHelper;

  beforeAll(async () => {
    testHelper = await new TestHelper().initialize();
  });

  afterAll(async () => {
    await testHelper.cleanup();
  });

  it('should register new user', async () => {
    const response = await request(testHelper.app.getHttpServer())
      .post('/api/auth/register')
      .send({
        name: 'New User',
        email: 'newuser@test.com',
        password: 'password123',
        phone: '05551234567'
      });

    expect(response.status).toBe(201);
    expect(response.body.data.email).toBe('newuser@test.com');
    expect(response.body.data.isEmailVerified).toBe(false);
  });

  it('should login user', async () => {
    // First register and verify a user
    const user = await testHelper.registerTestUser({
      name: 'Login Test User',
      email: 'login@test.com',
      password: 'password123'
    });

    const response = await request(testHelper.app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'login@test.com',
        password: 'password123'
      });

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('access_token');
    expect(response.body.data).toHaveProperty('refresh_token');
  });

  it('should require email verification for login', async () => {
    // Create unverified user
    await request(testHelper.app.getHttpServer())
      .post('/api/auth/register')
      .send({
        name: 'Unverified User',
        email: 'unverified@test.com',
        password: 'password123'
      });

    const response = await request(testHelper.app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'unverified@test.com',
        password: 'password123'
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toContain('email');
  });
});
```

### Validation Testing

```typescript
describe('Input Validation', () => {
  let testHelper: TestHelper;

  beforeAll(async () => {
    testHelper = await new TestHelper().initialize();
  });

  afterAll(async () => {
    await testHelper.cleanup();
  });

  it('should validate required fields', async () => {
    const response = await request(testHelper.app.getHttpServer())
      .post('/api/aidrequests')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .send({
        // Missing required fields
        description: 'Test description'
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('should validate email format', async () => {
    const response = await request(testHelper.app.getHttpServer())
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'invalid-email', // Invalid email format
        password: 'password123'
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('email');
  });
});
```

### Authorization Testing

```typescript
describe('Authorization', () => {
  let testHelper: TestHelper;

  beforeAll(async () => {
    testHelper = await new TestHelper().initialize();
  });

  afterAll(async () => {
    await testHelper.cleanup();
  });

  it('should require authentication', async () => {
    const response = await request(testHelper.app.getHttpServer())
      .get('/api/aidrequests');

    expect(response.status).toBe(401);
  });

  it('should require admin role for admin endpoints', async () => {
    const response = await request(testHelper.app.getHttpServer())
      .post('/api/organizations')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`) // Regular user token
      .send({
        name: 'Test Org',
        type: 'NGO',
        mission: 'Test mission'
      });

    expect(response.status).toBe(403);
  });

  it('should allow admin access', async () => {
    const response = await request(testHelper.app.getHttpServer())
      .post('/api/organizations')
      .set('Authorization', `Bearer ${testHelper.getAdminToken()}`)
      .send({
        name: 'Test Org',
        type: 'NGO',
        mission: 'Test mission',
        address: {
          address: 'Test Address',
          latitude: 41.0082,
          longitude: 28.9784
        },
        contactInfo: {
          phone: '02125551234',
          email: 'test@org.com'
        }
      });

    expect(response.status).toBe(201);
  });
});
```

## 6. Firebase Integration Testing

### Firebase Emulator Setup

```typescript
describe('Firebase Integration', () => {
  beforeAll(async () => {
    // Firebase emulator automatically starts with npm run test:firebase
    // Ports: Auth(9099), Firestore(8080), Storage(9199)
  });

  it('should send notification', async () => {
    // Test notification sending without actual Firebase
    const notificationData = {
      userId: 1,
      title: 'Test Notification',
      body: 'Test message',
      type: 'aid_request_approved'
    };

    // In test environment, notifications are simulated
    expect(process.env.NODE_ENV).toBe('test');
  });
});
```

## 7. Database Testing

### Transaction Testing

```typescript
describe('Database Transactions', () => {
  let testHelper: TestHelper;

  beforeAll(async () => {
    testHelper = await new TestHelper().initialize();
  });

  afterAll(async () => {
    await testHelper.cleanup();
  });

  it('should rollback on error', async () => {
    const prisma = testHelper.app.get(PrismaService);
    
    await expect(
      prisma.$transaction(async (tx) => {
        // Create user
        const user = await tx.user.create({
          data: {
            name: 'Test User',
            email: 'test@transaction.com',
            password: 'hashed',
            isEmailVerified: true
          }
        });

        // This should fail due to constraint violation
        await tx.user.create({
          data: {
            name: 'Duplicate User',
            email: 'test@transaction.com', // Same email
            password: 'hashed',
            isEmailVerified: true
          }
        });
      })
    ).rejects.toThrow();

    // Verify no user was created
    const users = await prisma.user.findMany({
      where: { email: 'test@transaction.com' }
    });
    expect(users).toHaveLength(0);
  });
});
```

### Audit Log Testing

```typescript
describe('Audit Logging', () => {
  let testHelper: TestHelper;

  beforeAll(async () => {
    testHelper = await new TestHelper().initialize();
    // Enable audit logging for this test
    process.env.AUDIT_LOG_ENABLED = 'true';
  });

  afterAll(async () => {
    await testHelper.cleanup();
    process.env.AUDIT_LOG_ENABLED = 'false';
  });

  it('should create audit log on aid request creation', async () => {
    const response = await request(testHelper.app.getHttpServer())
      .post('/api/aidrequests')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .send({
        type: 'food',
        description: 'Audit test',
        isUrgent: false,
        location: { latitude: 41.0082, longitude: 28.9784 }
      });

    expect(response.status).toBe(201);

    const prisma = testHelper.app.get(PrismaService);
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        action: 'create',
        entity: 'aid-requests'
      }
    });

    expect(auditLogs.length).toBeGreaterThan(0);
  });
});
```

## 8. Performance Testing

### Response Time Testing

```typescript
describe('Performance', () => {
  let testHelper: TestHelper;

  beforeAll(async () => {
    testHelper = await new TestHelper().initialize();
  });

  afterAll(async () => {
    await testHelper.cleanup();
  });

  it('should respond within acceptable time', async () => {
    const startTime = Date.now();

    const response = await request(testHelper.app.getHttpServer())
      .get('/api/aidrequests')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`);

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    expect(response.status).toBe(200);
    expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
  });
});
```

### Rate Limiting Testing

```typescript
describe('Rate Limiting', () => {
  let testHelper: TestHelper;

  beforeAll(async () => {
    testHelper = await new TestHelper().initialize();
  });

  afterAll(async () => {
    await testHelper.cleanup();
  });

  it('should enforce rate limits', async () => {
    const promises = [];
    
    // Send 101 requests (limit is 100/minute)
    for (let i = 0; i < 101; i++) {
      promises.push(
        request(testHelper.app.getHttpServer())
          .get('/api/dashboard/analytics')
          .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      );
    }

    const responses = await Promise.all(promises);
    const rateLimitedResponses = responses.filter(r => r.status === 429);
    
    expect(rateLimitedResponses.length).toBeGreaterThan(0);
  });
});
```

## 9. Error Handling Testing

```typescript
describe('Error Handling', () => {
  let testHelper: TestHelper;

  beforeAll(async () => {
    testHelper = await new TestHelper().initialize();
  });

  afterAll(async () => {
    await testHelper.cleanup();
  });

  it('should handle database errors gracefully', async () => {
    // Try to create aid request with invalid foreign key
    const response = await request(testHelper.app.getHttpServer())
      .post('/api/aidrequests')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .send({
        type: 'food',
        description: 'Test description',
        organizationId: 99999 // Non-existent organization
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body).toHaveProperty('message');
  });

  it('should handle validation errors', async () => {
    const response = await request(testHelper.app.getHttpServer())
      .post('/api/auth/register')
      .send({
        name: 'A', // Too short
        email: 'invalid-email',
        password: '123' // Too short
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
```

## 10. Test Data Management

### Creating Test Organizations

```typescript
async function createTestOrganization(testHelper: TestHelper) {
  const response = await request(testHelper.app.getHttpServer())
    .post('/api/organizations')
    .set('Authorization', `Bearer ${testHelper.getAdminToken()}`)
    .send({
      name: 'Test Organization',
      type: 'NGO',
      mission: 'Test mission',
      address: {
        address: 'Test Address',
        latitude: 41.0082,
        longitude: 28.9784
      },
      contactInfo: {
        phone: '02125551234',
        email: 'test@org.com'
      }
    });

  return response.body.data;
}
```

### Creating Test Campaigns

```typescript
async function createTestCampaign(testHelper: TestHelper, organizationId: number) {
  const response = await request(testHelper.app.getHttpServer())
    .post('/api/campaigns')
    .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
    .send({
      name: 'Test Campaign',
      description: 'Test campaign description',
      targetAmount: 10000,
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
    });

  return response.body.data;
}
```

## 11. Test Best Practices

### DO's

1. **Use TestHelper**: Always use TestHelper for consistent setup
2. **Clean Data**: Always cleanup test data after tests
3. **Isolated Tests**: Each test should be independent
4. **Descriptive Names**: Use clear, descriptive test names
5. **Test Real Scenarios**: Test actual user workflows
6. **Validate Responses**: Check both success and error responses

### DON'Ts

1. **Don't Share State**: Don't rely on test execution order
2. **Don't Skip Cleanup**: Always cleanup after tests
3. **Don't Hardcode**: Use variables and helper functions
4. **Don't Test Implementation**: Test behavior, not implementation
5. **Don't Ignore Async**: Properly handle async operations

### Test Organization

```typescript
describe('AidRequests Module', () => {
  describe('GET /api/aidrequests', () => {
    // Tests for listing aid requests
  });

  describe('POST /api/aidrequests', () => {
    // Tests for creating aid requests
  });

  describe('GET /api/aidrequests/:id', () => {
    // Tests for getting single aid request
  });

  describe('PATCH /api/aidrequests/:id', () => {
    // Tests for updating aid requests
  });
});
```

## 12. Debugging Tests

### Debug Mode

```bash
# Run tests with debug output
DEBUG=* npm run test:e2e

# Run specific test file
npm run test:e2e -- aid-requests.e2e-spec.ts

# Run tests with coverage
npm run test:cov
```

### Test Logging

```typescript
describe('Debug Tests', () => {
  it('should log request/response for debugging', async () => {
    const response = await request(testHelper.app.getHttpServer())
      .post('/api/aidrequests')
      .set('Authorization', `Bearer ${testHelper.getAccessToken()}`)
      .send({
        type: 'food',
        description: 'Debug test'
      });

    console.log('Request body:', {
      type: 'food',
      description: 'Debug test'
    });
    console.log('Response:', response.body);

    expect(response.status).toBe(201);
  });
});
```

Bu test rehberi Turdes backend sisteminin tüm test yaklaşımlarını ve best practice'lerini kapsar. Yeni özellikler eklerken mutlaka karşılık gelen testleri de yazın.