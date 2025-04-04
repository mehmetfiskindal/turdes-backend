/**
 * This utility script generates JWT tokens for testing purposes
 * Run it with: npx ts-node test/generate-test-tokens.ts
 */

import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: '.env.test' });

const JWT_SECRET = process.env.JWT_SECRET || 'test_secret';
const ACCESS_EXPIRATION = process.env.JWT_ACCESS_EXPIRATION || '1h';

// Generate a regular user token
const generateUserToken = () => {
  const payload = {
    sub: 1,
    email: 'test@test.com',
    role: 'user',
    iat: Math.floor(Date.now() / 1000),
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_EXPIRATION });
};

// Generate an admin token
const generateAdminToken = () => {
  const payload = {
    sub: 2,
    email: 'admin@test.com',
    role: 'admin',
    iat: Math.floor(Date.now() / 1000),
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_EXPIRATION });
};

// Generate and display tokens
const userToken = generateUserToken();
const adminToken = generateAdminToken();

console.log('User (Regular) Token:');
console.log(userToken);
console.log('\nAdmin Token:');
console.log(adminToken);

// Update .env.test file with the tokens if it exists
try {
  const envTestPath = path.join(process.cwd(), '.env.test');
  if (fs.existsSync(envTestPath)) {
    let envContent = fs.readFileSync(envTestPath, 'utf8');

    // Replace or add TEST_ACCESS_TOKEN
    if (envContent.includes('TEST_ACCESS_TOKEN=')) {
      envContent = envContent.replace(
        /TEST_ACCESS_TOKEN=.*(\r?\n|$)/g,
        `TEST_ACCESS_TOKEN=${userToken}$1`,
      );
    } else {
      envContent += `\nTEST_ACCESS_TOKEN=${userToken}`;
    }

    // Replace or add TEST_ADMIN_TOKEN
    if (envContent.includes('TEST_ADMIN_TOKEN=')) {
      envContent = envContent.replace(
        /TEST_ADMIN_TOKEN=.*(\r?\n|$)/g,
        `TEST_ADMIN_TOKEN=${adminToken}$1`,
      );
    } else {
      envContent += `\nTEST_ADMIN_TOKEN=${adminToken}`;
    }

    fs.writeFileSync(envTestPath, envContent);
    console.log('\nUpdated .env.test file with new tokens');
  } else {
    console.log('\nNo .env.test file found. Create one with these tokens:');
    console.log(`TEST_ACCESS_TOKEN=${userToken}`);
    console.log(`TEST_ADMIN_TOKEN=${adminToken}`);
  }
} catch (error) {
  console.error('Error updating .env.test file:', error);
}
