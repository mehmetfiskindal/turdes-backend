# End-to-End (E2E) Tests for TurdesBE API

This directory contains end-to-end tests for all API endpoints in the TurdesBE application. The tests ensure that the API endpoints work correctly from the client's perspective.

## Structure

The tests are organized by module, with each module having its own test file:

- `app.e2e-spec.ts` - Core application endpoints
- `auth.e2e-spec.ts` - Authentication endpoints
- `aid-requests.e2e-spec.ts` - Aid request endpoints
- `recurring-requests.e2e-spec.ts` - Recurring aid request endpoints
- `aid-centers.e2e-spec.ts` - Aid centers information endpoints
- `organizations.e2e-spec.ts` - Organizations endpoints
- `campaigns.e2e-spec.ts` - Campaigns and events endpoints
- `dashboard.e2e-spec.ts` - Dashboard statistics endpoints
- `donors.e2e-spec.ts` - Donor and donation endpoints
- `education.e2e-spec.ts` - Education materials endpoints
- `faq.e2e-spec.ts` - FAQ endpoints
- `history.e2e-spec.ts` - History tracking endpoints
- `map.e2e-spec.ts` - Map related endpoints
- `route-optimization.e2e-spec.ts` - Delivery route optimization endpoints
- `reports.e2e-spec.ts` - Report generation endpoints
- `volunteers.e2e-spec.ts` - Volunteer management endpoints

The `all-tests.e2e-spec.ts` file imports all test files to allow running all tests in sequence.

## Utilities

- `test-utils.ts` - Contains helper classes and functions for test setup and teardown

## Prerequisites

Before running the tests, make sure you have:

1. PostgreSQL database running
2. Environment variables properly set in a `.env.test` file
3. Required JWT test tokens added to the environment variables:
   - `TEST_ACCESS_TOKEN` - JWT token for regular user
   - `TEST_ADMIN_TOKEN` - JWT token for admin user

## Environment Setup

Create a `.env.test` file with the following content:

```
DATABASE_URL="postgresql://username:password@localhost:5432/turdesbe_test"
JWT_SECRET=test_secret
JWT_ACCESS_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d
TEST_ACCESS_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (Add your test token here)
TEST_ADMIN_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (Add your admin token here)
```

## Running Tests

### Run all tests

```bash
npm run test:e2e
```

### Run specific test module

```bash
npx jest --config ./test/jest-e2e.json auth.e2e-spec.ts
```

## Test Database

The tests require a test database. You can set up the test database using:

```bash
DATABASE_URL=YOUR_TEST_DB_URL npx prisma migrate deploy
```

## Adding New Tests

When adding new endpoints to the API:

1. Create a test for each new endpoint in the appropriate test file
2. For new modules, create a new test file named `[module-name].e2e-spec.ts`
3. Add the new test file to the imports in `all-tests.e2e-spec.ts`

## Generating Test Data

For tests that require pre-populated data, add the necessary seed data in the `beforeAll` hook of the test file.

## Test Tokens

Both `testHelper.getAccessToken()` and `testHelper.getAdminToken()` methods are available to get authentication tokens for different user roles.