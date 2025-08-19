# GitHub Copilot Instructions

Bu kılavuz AI ajanlarının depoda hızlı ve güvenli üretken olmasını sağlar. "Genel iyi uygulamalar" yerine BU kod tabanına özgü gerçek kalıpları yansıtır.

## Çekirdek Mimari

- NestJS modüler yapı: Her domain `src/app/<modül>` (ör: `auth`, `aid-requests`, `campaigns`, `organizations`, `donors`, `volunteers`, `reports`, `history`, `faq`, `education`, `map`, `security`, `casl`, `audit`).
- ORM: Prisma (`prisma/schema.prisma`). Migration şart; şemayı değiştir -> `npm run migrate` (dev). Üretimde `prisma migrate deploy` (manuel eklemek gerekirse).
- Kimlik Doğrulama: JWT Access + Refresh; refresh token DB'de bcrypt hash (Alan: `User.refreshToken`). Payload (güncel): `{ email, sub, role }`.
- E-posta Doğrulama: `verificationToken` + `tokenExpiresAt`; doğrulanmadan login reddedilir.
- Rate Limiting: Global Throttler (100 req / 60s) + spesifik `@Throttle` (ör: resend verification 3/5dk).
- Audit Log: Yazma metodlarında (`POST|PUT|PATCH|DELETE`) `AuditLogInterceptor` action/entity/entityId/metadata/userId/ip/userAgent kaydeder. Kapat: `AUDIT_LOG_ENABLED=false`.
- Env Doğrulama: `AppModule` içindeki Joi şeması zorunlu değişkenleri enforce eder.

## Kritik Dosyalar

- `src/app/app.module.ts`: Config + Joi + Throttler + Audit interceptor wiring.
- `src/app/auth/auth.service.ts`: register, login, refresh, verify, resend, password reset, token pair üretimi.
- `src/app/audit/audit-log.interceptor.ts`: Otomatik denetim ve `sanitizeBody` hassas filtre.
- `prisma/schema.prisma`: Modeller (özellikle `User`, `AidRequest`, `AuditLog`).
- `test/*.e2e-spec.ts`: E2E desenleri.

## Önemli Kalıplar

- Prisma erişimi doğrudan service içinde (repository katmanı yok). Tekrarlayan query için yardımcı metod oluştur.
- Refresh token rotation: Her login/refresh sonrası DB hash overwrite.
- Email gönderimi test modunda simüle: (`NODE_ENV==='test'`) gerçek SMTP yok.
- Audit metadata sanitize: `SENSITIVE_KEYS` listesi; yeni gizli alan eklersen küçük harf halinde ekle (örn: `passwordresettoken`).
- Logger: `new Logger(ServiceName)`; `console.log` kullanma.

## Env Değişkenleri (Joi Şema)

Zorunlu: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `MAIL_HOST`, `MAIL_USER`, `MAIL_PASSWORD`, `MAIL_FROM`.
Varsayılan: `JWT_ACCESS_EXPIRES=1h`, `JWT_REFRESH_EXPIRES=7d`, `MAIL_PORT=587`.
Opsiyonel: `HOST_URL`, `FRONTEND_URL`, `AUDIT_LOG_ENABLED`.
Ek: `DATABASE_URL` zorunlu fakat Joi şemasında değil; Prisma datasource tarafından okunur. Test ortamında farklı DB için `.env.test` kullan.
Eksik zorunlu değişken bootstrap'i durdurur.

## CASL (Yetkilendirme Örneği)

Basitleştirilmiş kullanım (kural dosyalarına göre):

```ts
// ability factory benzeri (temsili)
ability.can('manage', 'AidRequest'); // admin gibi roller
ability.can('read', 'AidRequest');
```

Yeni endpoint eklerken subject ismi model adıyla uyumlu olmalı. CASL güncellemesi sonrası ilgili guard bu yetenekleri okur.

## Test Token Üretimi

- Script: `npm run test:gen-tokens` (`test/generate-test-tokens.ts`).
- E2E testler `.env.test` içindeki tokenları kullanır (örn: `TEST_ACCESS_TOKEN`). Payload formatı JWT payload ile uyumlu kalmalı.
- Payload değiştirirsen script ve test env değerlerini güncelle.

## Audit Log Davranışı

- Action mapping: POST=create, PUT/PATCH=update, DELETE=delete (+ `_failed` hata durumda).
- Entity: URL ilk segment.
- Metadata: Gövdeden hassas alanlar çıkarılır (derin gezinti). Listeyi genişletirken küçük harflerle ekle.
- Toplu testlerde log şişmesini önlemek için `.env.test` içine `AUDIT_LOG_ENABLED=false` ekleyebilirsin.

## Komutlar / Akışlar

- Geliştirme: `npm run start:dev`
- Build: `npm run build` -> `dist/`
- Test (unit): `npm test` ; E2E: `npm run test:e2e`
- Migration: `npm run migrate` (=`prisma migrate dev`)
- Prisma Studio: `npm run studio`
- Generate Prisma Client: `npm run generate`

## Endpoint Güvenliği

- Login öncesi email doğrulama şart (`isEmailVerified`).
- Role string `User.role` (enum değil). CASL ile ince taneli izin: yeni domain eklerken subject ekle.

## Kod Yazarken Dikkat

1. Yeni model -> schema.prisma değiştir + migration oluştur.
2. Yeni modul -> `<Feature>.module.ts` + service + controller; `AppModule` import.
3. Hassas alan (şifre, token, secret) response veya log'a eklenmez.
4. Yeni yazma endpoint'i -> audit otomatik devrede (devre dışı: env ile kapat).
5. Rate limit gerekiyorsa `@Throttle` kullan; global limit yeterli değilse.
6. JWT payload formatını değiştirirsen refresh/guard/E2E test tokenları güncelle.

## Talimattan Çıkmış Eski İçerik (DÜZELTİLDİ)

- Eski dokümanda `createTransporter` yazımı hatalı; doğru: `nodemailer.createTransport`.
- Handlebars/template engine şu an aktif kullanılmıyor; inline HTML mevcut.
- Şemada rolleri temsil eden enum yok; `role` string alanıdır.
- Password reset token alanları şemada yoksa sanitize listesinde yer alması gelecekte ekleme içindir.

## Deploy Notu (Özet)

1. Prod env değişkenleri (tüm zorunlular + `DATABASE_URL`) ayarlı.
2. `npm install --omit=dev && npm run build`.
3. Database migration: `prisma migrate deploy`.
4. Uygulamayı `node dist/main` ile başlat.

## Gelecek İyileştirme (Bilgi Amaçlı)

- Eski JWT tokenlar için legacy `username` desteğinin kaldırılması (geçiş tamamlandıktan sonra `payload.username` kabulü kaldırılabilir)
- Audit action override için decorator
- Email şablonlarını dosyalara ayırma

Bu dosyayı değişiklik yaptığında güncel tut. AI ajanı: Her büyük şema veya güvenlik değişikliğinde bu talimatı revize et.
