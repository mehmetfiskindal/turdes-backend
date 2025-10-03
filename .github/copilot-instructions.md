# GitHub Copilot Instructions - Turdes Backend# GitHub Copilot Instructions

Bu kılavuz AI ajanlarının Turdes yardım talebi takip sistemi kod tabanında hızlı ve güvenli üretken olmasını sağlar. "Genel iyi uygulamalar" yerine BU kod tabanına özgü gerçek kalıpları yansıtır.Bu kılavuz AI ajanlarının depoda hızlı ve güvenli üretken olmasını sağlar. "Genel iyi uygulamalar" yerine BU kod tabanına özgü gerçek kalıpları yansıtır.

## Proje Genel Bakış## Çekirdek Mimari

**Turdes**, yardım taleplerinin etkili takip edilmesini, organizasyonlar ve gönüllüler arasında bağlantı kurulmasını ve yardım süreçlerinin optimize edilmesini sağlayan bir backend API sistemidir.- **NestJS Modüler Yapı**: Her domain `src/app/<modül>` (mevcut: `auth`, `aid-requests`, `campaigns`, `organizations`, `donors`, `volunteers`, `reports`, `history`, `faq`, `education`, `map`, `prisma`). Yeni modül: `feature.module.ts` + `feature.service.ts` + `feature.controller.ts` şablonu.

- **ORM**: Prisma (`prisma/schema.prisma`). Migration zorunlu; şemayı değiştir -> `npm run migrate` (dev). Üretimde `prisma migrate deploy`.

**Temel Özellikler:**- **Kimlik Doğrulama**: JWT Access + Refresh token pair; refresh token DB'de bcrypt hash (`User.refreshToken`). Payload: `{ email, sub, role }`. Email doğrulama zorunlu (`isEmailVerified: true`).

- Yardım talebi takip sistemi (Beklemede/Onaylandı/Reddedildi durumları)- **Global Interceptors**: `ResponseInterceptor` (standart response wrapper), `AllExceptionsFilter` (hata yakalama), `ThrottlerGuard` (100 req/60s).

- Firebase push bildirimleri ve e-posta bilgilendirmeleri- **Audit System**: `AuditLog` modeli; yazma metodlarında otomatik kayıt. Hassas alan filtreleme built-in. Kapat: `AUDIT_LOG_ENABLED=false`.

- Yorum/belge ekleme (tıbbi rapor, kimlik belgesi)- **Config Management**: Joi validation schema in `AppModule` for required env vars. `TypedConfigService` for type-safe config access.

- Harita tabanlı yardım merkezi görüntüleme ve dağıtım planlaması

- Gönüllü kayıt ve görev atama sistemi## Kritik Dosyalar & Kalıplar

- Bağış yönetimi ve otomatik teşekkür mesajları

- Organizasyon-kullanıcı mesajlaşma sistemi**Core Infrastructure:**

- Kampanya ve etkinlik yönetimi

- Analitik ve raporlama sistemi- `src/app/app.module.ts`: Global setup (Joi config, throttler, interceptors, filters)

- `src/common/`: Global @Module with TypedConfigService, ResponseInterceptor, AllExceptionsFilter

## Çekirdek Mimari- `src/app/prisma/prisma.service.ts`: Singleton pattern, connection pooling, test cleanup helpers

**NestJS Modüler Yapı:\*\***Authentication Flow:\*\*

- Her domain `src/app/<modül>` (mevcut: `auth`, `aid-requests`, `campaigns`, `organizations`, `donors`, `volunteers`, `reports`, `history`, `faq`, `education`, `map`, `prisma`)

- Yeni modül şablonu: `feature.module.ts` + `feature.service.ts` + `feature.controller.ts`- JWT refresh rotation on every login/refresh (overwrites DB hash)

- Email verification required: `verificationToken` + `tokenExpiresAt` before login

**ORM & Database:**- Test mode email simulation: `NODE_ENV==='test'` skips SMTP

- Prisma (`prisma/schema.prisma`) - Migration zorunlu

- Şema değişikliği → `npm run migrate` (dev) / `prisma migrate deploy` (prod)**Database & Validation:**

- Direct Prisma access in services (repository katmanı yok)

- Direct Prisma access in services (no repository layer)

**Authentication & Security:**- Create helper methods for common queries

- JWT Access + Refresh token pair; refresh token DB'de bcrypt hash (`User.refreshToken`)- Model changes require migration: `npm run migrate`

- Payload format: `{ email, sub, role }`- Required env vars validated in AppModule Joi schema

- Email verification zorunlu (`isEmailVerified: true`)

- Global interceptors: `ResponseInterceptor`, `AllExceptionsFilter`, `ThrottlerGuard` (100 req/60s)**Testing Framework:**

**Audit & Config:**- E2E test setup in `test/test-utils.ts`: TestHelper class for app/token/cleanup

- `AuditLog` modeli; yazma metodlarında otomatik kayıt- Test tokens from env vars: `TEST_ACCESS_TOKEN`, `TEST_ADMIN_TOKEN`

- Hassas alan filtreleme built-in (AUDIT_LOG_ENABLED=false ile kapatılabilir)- Firebase emulator integration: `npm run test:firebase`

- Joi validation schema in `AppModule` for required env vars

- `TypedConfigService` for type-safe config access## Env Yapılandırması & Workflow

## Kritik Dosyalar & Domain Patterns**Required ENV (Joi Validated):**

**Core Infrastructure:**```bash

- `src/app/app.module.ts`: Global setup (Joi config, throttler, interceptors, filters)JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, MAIL_HOST, MAIL_USER, MAIL_PASSWORD, MAIL_FROM

- `src/common/`: Global @Module with TypedConfigService, ResponseInterceptor, AllExceptionsFilter```

- `src/app/prisma/prisma.service.ts`: Singleton pattern, connection pooling, test cleanup helpers

**Defaults:**

**Domain-Specific Patterns:**

````bash

**Aid Requests (Yardım Talepleri):**JWT_ACCESS_EXPIRES=1h, JWT_REFRESH_EXPIRES=7d, MAIL_PORT=587, NODE_ENV=development

```typescript```

// Status flow: 'pending' → 'approved' / 'rejected'

// QR kod generation for request tracking**Optional:** `HOST_URL`, `FRONTEND_URL`, `AUDIT_LOG_ENABLED`, Firebase configs

// Comment and Document attachments

// Firebase notifications on status change**Development Commands:**

````

````bash

**Organizations:**npm run start:dev          # Watch mode development

```typescriptnpm run migrate             # Prisma migration (dev)

// Rating and feedback systemnpm run studio              # Prisma visual DB manager

// Address and ContactInfo relationsnpm run test:e2e           # E2E tests

// Campaign and Event managementnpm run test:gen-tokens    # Generate test JWT tokens

// Message system with usersnpm run create-admin       # Interactive admin user creation

````

**Donations & Volunteers:\*\***Production:\*\*

````typescript
// Anonymous donation support```bash

// Volunteer task assignment systemnpm run build && npm run start:prod

// Donation statistics and reportsprisma migrate deploy  # Production migrations

// Automatic thank you messages```
````

## Test & Debugging Patterns

**Map & Location Services:**

````typescript**E2E Test Structure:**

// Aid center proximity search

// Route optimization for distribution```typescript

// Geographic data with lat/lng coordinates// Use TestHelper for consistent test setup

```const testHelper = await new TestHelper().initialize();

testHelper.getAccessToken(); // Pre-configured tokens

## Environment ConfigurationtestHelper.registerTestUser(); // Creates verified test user

await testHelper.cleanup(); // Proper test teardown

**Required ENV (Joi Validated):**```

```bash

JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, MAIL_HOST, MAIL_USER, MAIL_PASSWORD, MAIL_FROM**Firebase Integration:**

````

````bash

**Firebase Integration:**npm run test:firebase  # Runs tests with Firebase emulator

```bash# Emulator ports: Auth(9099), Firestore(8080), Storage(9199), UI(4000)

FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY```

````

**Audit Log Behavior:**

**Defaults:**

```bash- Action mapping: `POST=create, PUT/PATCH=update, DELETE=delete` (+`\_failed` suffix on errors)

JWT_ACCESS_EXPIRES=1h, JWT_REFRESH_EXPIRES=7d, MAIL_PORT=587, NODE_ENV=development- Entity: URL first segment (`/api/aid-requests` → `aid-requests`)

````- Metadata: Request body with sensitive fields filtered (passwords, tokens)

- Disable in tests: `AUDIT_LOG_ENABLED=false` in `.env.test`

**Optional:** `HOST_URL`, `FRONTEND_URL`, `AUDIT_LOG_ENABLED`

## Response & Error Handling

## Development Workflow

**Standard Response Format (ResponseInterceptor):**

**Commands:**

```bash```typescript

npm run start:dev          # Watch mode development{

npm run migrate             # Prisma migration (dev)  success: true,

npm run studio              # Prisma visual DB manager  statusCode: 200,

npm run test:e2e           # E2E tests  message: "Veri başarıyla getirildi", // Turkish messages by HTTP method

npm run test:firebase      # Firebase emulator tests  data: T,

npm run create-admin       # Interactive admin user creation  timestamp: "2023-...",

```  path: "/api/..."

}

**Testing Patterns:**```

```typescript

// Use TestHelper for consistent test setup**Error Response (AllExceptionsFilter):**

const testHelper = await new TestHelper().initialize();

testHelper.getAccessToken(); // Pre-configured tokens```typescript

testHelper.registerTestUser(); // Creates verified test user{

await testHelper.cleanup(); // Proper test teardown  success: false,

```  statusCode: 400,

  message: "Error description",

**Firebase Integration:**  error: "BadRequest",

```bash  timestamp: "2023-...",

# Emulator ports: Auth(9099), Firestore(8080), Storage(9199), UI(4000)  path: "/api/..."

npm run test:firebase  # Runs tests with Firebase emulator}

````

## Response & Error Handling**Prisma Error Mapping:** P2002→Conflict, P2025→NotFound, P2003→BadRequest

**Standard Response Format (ResponseInterceptor):**## Komutlar / Akışlar

```typescript

{- Geliştirme: `npm run start:dev`

  success: true,- Build: `npm run build` -> `dist/`

  statusCode: 200,- Test (unit): `npm test` ; E2E: `npm run test:e2e`

  message: "Veri başarıyla getirildi", // Turkish messages by HTTP method- Migration: `npm run migrate` (=`prisma migrate dev`)

  data: T,- Prisma Studio: `npm run studio`

  timestamp: "2023-...",- Generate Prisma Client: `npm run generate`

  path: "/api/..."

}## Endpoint Güvenliği

```

- Login öncesi email doğrulama şart (`isEmailVerified`).

**Error Response (AllExceptionsFilter):**- Role string `User.role` (enum değil). CASL ile ince taneli izin: yeni domain eklerken subject ekle.

```typescript

{## Kod Yazarken Dikkat

  success: false,

  statusCode: 400,1. Yeni model -> schema.prisma değiştir + migration oluştur.

  message: "Error description",2. Yeni modul -> `<Feature>.module.ts` + service + controller; `AppModule` import.

  error: "BadRequest",3. Hassas alan (şifre, token, secret) response veya log'a eklenmez.

  timestamp: "2023-...",4. Yeni yazma endpoint'i -> audit otomatik devrede (devre dışı: env ile kapat).

  path: "/api/..."5. Rate limit gerekiyorsa `@Throttle` kullan; global limit yeterli değilse.

}6. JWT payload formatını değiştirirsen refresh/guard/E2E test tokenları güncelle.

```

## Deploy Notu (Özet)

**Prisma Error Mapping:** P2002→Conflict, P2025→NotFound, P2003→BadRequest

1. Prod env değişkenleri (tüm zorunlular + `DATABASE_URL`) ayarlı.

## Turdes-Specific Implementation Guidelines2. `npm install --omit=dev && npm run build`.

3. Database migration: `prisma migrate deploy`.

**Yardım Talebi Workflow:**4. Uygulamayı `node dist/main` ile başlat.

1. User creates aid request with status 'pending'

2. Organization reviews and updates to 'approved'/'rejected'## Gelecek İyileştirme (Bilgi Amaçlı)

3. Automatic Firebase notification + email sent

4. Comments/documents can be added throughout process- Eski JWT tokenlar için legacy `username` desteğinin kaldırılması (geçiş tamamlandıktan sonra `payload.username` kabulü kaldırılabilir)

5. QR code generation for tracking- Audit action override için decorator

6. Audit log records all status changes- Email şablonlarını dosyalara ayırma

**Notification System:**Bu dosyayı değişiklik yaptığında güncel tut. AI ajanı: Her büyük şema veya güvenlik değişikliğinde bu talimatı revise et.

```typescript
// Test mode: NODE_ENV==='test' skips SMTP
// Production: Firebase Admin SDK + Nodemailer
// Templates: Turkish language, context-aware messages
```

**Security & Permissions:**

- Email verification required before login
- Role-based access: 'user', 'admin', 'organization'
- CASL for fine-grained permissions
- Rate limiting on sensitive endpoints

**Data Privacy:**

- Sensitive fields filtered in audit logs
- Anonymous donation support
- User data protection in responses

## Code Conventions

1. **New Model**: Update `schema.prisma` → create migration
2. **New Module**: Create `<Feature>.module.ts` + service + controller → import in `AppModule`
3. **Sensitive Data**: Never expose passwords, tokens, secrets in responses/logs
4. **Write Operations**: Audit logging automatically enabled (disable: `AUDIT_LOG_ENABLED=false`)
5. **Rate Limiting**: Use `@Throttle` decorator for endpoint-specific limits
6. **JWT Changes**: Update refresh logic, guards, and E2E test tokens

## Production Deployment

```bash
# Environment setup
cp .env.example .env  # Configure all required env vars

# Build and deploy
npm install --omit=dev
npm run build
prisma migrate deploy  # Production migrations
node dist/main          # Start application
```

**Health Checks:**

- Swagger UI: `http://localhost:3000/api`
- Prisma Studio: `npm run studio`
- Firebase Emulator UI: `http://localhost:4000`

Bu dosyayı değişiklik yaptığında güncel tut. Her büyük şema veya güvenlik değişikliğinde bu talimatı revize et.
