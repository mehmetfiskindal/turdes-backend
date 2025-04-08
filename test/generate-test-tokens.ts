import * as dotenv from 'dotenv';

import * as fs from 'fs';
import * as path from 'path';

// Çevre değişkenlerini yükle
dotenv.config();

/**
 * Test tokenları oluşturmak için kullanılacak yardımcı script
 * Bu script komut satırından çalıştırılabilir: npx ts-node generate-test-tokens.ts
 */
async function generateTestTokens() {
  try {
    console.log('Test tokenları oluşturuluyor...');

    // JWT secret test ortamı için rastgele oluşturuluyor
    const jwtSecret =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    // Test kullanıcıları için payload
    const userPayload = {
      id: 1,
      email: 'test@test.com',
      role: 'user',
    };

    const adminPayload = {
      id: 2,
      email: 'admin@test.com',
      role: 'admin',
    };

    // Token oluşturma işlemi (gerçek uygulamada JWT kullanılıyor)
    const userToken = Buffer.from(JSON.stringify(userPayload)).toString(
      'base64',
    );
    const adminToken = Buffer.from(JSON.stringify(adminPayload)).toString(
      'base64',
    );

    // Test token'larını .env.test dosyasına yazıyoruz
    const envContent = `
TEST_JWT_SECRET=${jwtSecret}
TEST_ACCESS_TOKEN=${userToken}
TEST_ADMIN_TOKEN=${adminToken}
`;

    fs.writeFileSync(path.join(__dirname, '../.env.test'), envContent);
    console.log('.env.test dosyası oluşturuldu.');
    console.log('Test tokenları başarıyla oluşturuldu!');
  } catch (error) {
    console.error('Token oluşturma hatası:', error);
    process.exit(1);
  }
}

// Scripti direkt olarak çalıştırırsak tokenları oluştur
if (require.main === module) {
  generateTestTokens();
}

export { generateTestTokens };
