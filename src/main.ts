/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import * as dotenv from 'dotenv';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

dotenv.config(); // .env dosyasındaki değişkenleri yükler
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(cookieParser());
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // Global HTTP Exception Filter kaydedin
  app.useGlobalFilters(new HttpExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Turdes Backend API')
    .setDescription(
      'Turdes Yardım Yönetim Sistemi için REST API dokümantasyonu',
    )
    .setVersion('1.0')
    .addTag('auth', 'Kimlik doğrulama ve yetkilendirme')
    .addTag('aid-requests', 'Yardım talepleri')
    .addTag('campaigns', 'Kampanyalar')
    .addTag('donors', 'Bağışçı yönetimi')
    .addTag('volunteers', 'Gönüllü yönetimi')
    .addTag('organizations', 'Organizasyon yönetimi')
    .addTag('stakeholder', 'Paydaş yönetimi')
    .addTag('interaction', 'Paydaş etkileşimleri')
    .addTag('reports', 'Raporlar')
    .addTag('education', 'Eğitim içerikleri')
    .addTag('faq', 'Sık sorulan sorular')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'JWT token ile kimlik doğrulama kullanın',
    })
    .build();

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  const document = SwaggerModule.createDocument(app, config);
  // Swagger arayüzünü 'api/docs' yolunda servis et, böylece normal API endpoint'lerinden ayrılmış olur
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Sayfa yenilendikten sonra auth bilgilerini koru
      docExpansion: 'none', // Başlangıçta tüm endpoint'leri kapalı tut
      tagsSorter: 'alpha', // API tag'lerini alfabetik olarak sırala
      operationsSorter: 'alpha', // İşlemleri alfabetik olarak sırala
      filter: true, // Arama filtreleme özelliğini aktif et
    },
  });
  await app.listen(3000);
}
bootstrap();
