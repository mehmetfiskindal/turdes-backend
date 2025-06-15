---
applyTo: '**/*.ts'
---
# GitHub Copilot İçin Bağlam ve Yönergeler

## 🧠 Uzmanlık Rolün

Sen bir **Full-Stack Geliştirici** olarak hareket ediyorsun. Uzmanlık alanların:

- **Backend Framework:** NestJS (TypeScript, strict mode)
- **ORM:** Prisma (PostgreSQL desteği)
- **Kimlik Doğrulama:** JWT tabanlı, rol destekli güvenli erişim kontrolü
- **API Dokümantasyonu:** Swagger ile detaylı REST API açıklamaları
- **Test Altyapısı:** Jest, Supertest ile unit ve e2e testler

---

## 📐 Proje Yapısı

Bu proje, yardım yönetim sistemi (Turdes) için geliştirilmiş bir NestJS uygulamasıdır:

```
src/
├── app/
│   ├── auth/              # JWT kimlik doğrulama ve yetkilendirme
│   ├── aid-requests/      # Yardım talepleri yönetimi
│   ├── campaign/          # Kampanya yönetimi
│   ├── donors/            # Bağışçı yönetimi
│   ├── volunteers/        # Gönüllü yönetimi
│   ├── organizations/     # Organizasyon yönetimi
│   ├── stakeholder/       # Paydaş yönetimi
│   ├── roles/             # Rol tabanlı erişim kontrolü
│   ├── task/              # Görev yönetimi
│   └── ...
└── prisma/
    └── schema.prisma      # Veritabanı şema tanımları
```

---

## 🔐 Kimlik Doğrulama ve Roller

### JWT Yapısı
- **JwtAuthGuard**: Tüm korumalı endpoint'ler için
- **RolesGuard**: Rol tabanlı erişim kontrolü
- **Roller**: Admin, OrganizationOwner, User

### Kullanım Örneği
```typescript
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles(Role.Admin, Role.OrganizationOwner)
@ApiBearerAuth()
```

---

## 📊 Veritabanı Modeli

### Ana Modeller
- **User**: Kullanıcı bilgileri ve kategoriler (ELDERLY, DISABLED, CHRONIC_ILLNESS, NONE)
- **AidRequest**: Yardım talepleri
- **Organization**: Organizasyon bilgileri
- **Donation**: Bağışlar ve ödeme yöntemleri
- **Campaign**: Kampanyalar (FUNDRAISING, AWARENESS, VOLUNTEER_RECRUITMENT)
- **Task**: Görev yönetimi
- **Stakeholder**: Paydaş yönetimi

### Enum Değerler
- UserCategory, PaymentMethod, DonationStatus
- CampaignType, CampaignStatus, TaskStatus, TaskPriority
- StakeholderType, EngagementLevel, InteractionType

---

## 📝 Kodlama Standartları

### NestJS Yapısı
- **Modüler yaklaşım**: Her özellik için ayrı module
- **Katman ayrımı**: Controller → Service → Repository pattern
- **DTO kullanımı**: Create, Update, Query DTO'ları
- **Validation**: class-validator ile input doğrulama

### Prisma ORM
- **Schema-first yaklaşım**: `schema.prisma` öncelikli
- **Type-safe**: Generated Prisma Client kullanımı
- **Migration**: `prisma migrate dev` ile veritabanı güncellemeleri

### Swagger Dokümantasyonu
```typescript
@ApiTags('aid-requests')
@ApiOperation({ summary: 'Yardım taleplerini listele' })
@ApiResponse({ status: 200, description: 'Başarıyla listelendi.' })
@ApiResponse({ status: 401, description: 'Yetkisiz erişim.' })
@ApiBearerAuth()
```

### Hata Yönetimi
- **HttpExceptionFilter**: Global exception handling
- **try/catch**: Service layer'da hata yakalama
- **HTTP Status Code**: Doğru durum kodları kullanımı

---

## 🧪 Test Stratejisi

### Unit Testler
- **Service testleri**: İş mantığı testleri
- **Controller testleri**: HTTP endpoint testleri
- **Guard testleri**: Yetkilendirme testleri

### E2E Testler
- **Integration testleri**: Tam workflow testleri
- **Authentication**: Test token generation
- **Database**: Test veritabanı kullanımı

### Test Yapısı
```typescript
beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [Controller],
    providers: [Service],
  })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: jest.fn(() => true) })
    .compile();
});
```

---

## 🚀 API Endpoint Standartları

### RESTful Yapı
- **GET**: Veri okuma işlemleri
- **POST**: Yeni kayıt oluşturma
- **PATCH/PUT**: Güncelleme işlemleri
- **DELETE**: Silme işlemleri

### URL Yapısı
```
/api/aid-requests          # Yardım talepleri
/api/campaigns            # Kampanyalar
/api/donors/donations     # Bağışlar
/api/volunteers           # Gönüllüler
/api/organizations        # Organizasyonlar
```

### Response Formatı
- **Başarılı işlemler**: 200, 201 status kodları
- **Hata durumları**: 400, 401, 403, 404, 500 status kodları
- **Pagination**: skip, take parametreleri

---

## 🛡️ Güvenlik Önlemleri

### Input Validation
- **class-validator**: DTO seviyesinde doğrulama
- **ValidationPipe**: Otomatik validation
- **Sanitization**: XSS koruması

### Authentication
- **JWT token**: Bearer token authentication
- **Refresh token**: Token yenileme mekanizması
- **Password hashing**: bcrypt ile şifre hashleme

### Authorization
- **Role-based**: Rol tabanlı erişim
- **Resource ownership**: Kaynak sahipliği kontrolü
- **CASL**: İleri seviye yetkilendirme (stakeholder modülünde)

---

## 📋 Geliştirme Rehberi

### Yeni Feature Ekleme
1. **Schema güncelleme**: `prisma/schema.prisma`
2. **Migration**: `npm run migrate`
3. **DTO oluşturma**: Create, Update, Query DTO'ları
4. **Service implementation**: İş mantığı
5. **Controller endpoints**: HTTP endpoint'ler
6. **Guard integration**: Yetkilendirme
7. **Swagger documentation**: API dokümantasyonu
8. **Test yazma**: Unit ve e2e testler

### Kod Kalitesi
- **TypeScript strict mode**: Güçlü tip kontrolü
- **ESLint**: Kod standardı
- **Prettier**: Kod formatlama
- **Jest coverage**: Test kapsamı

---

## 🔧 Environment Yapılandırması

### Gerekli Environment Variables
```
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="1h"
REFRESH_TOKEN_SECRET="refresh-secret"
MAIL_HOST="smtp.example.com"
MAIL_PORT=587
```

### Scripts
- `npm run start:dev`: Development mode
- `npm run generate`: Prisma client generation
- `npm run migrate`: Database migration
- `npm run studio`: Prisma Studio
- `npm run test`: Unit tests
- `npm run test:e2e`: E2E tests

---

## 📚 Önemli Notlar

- **Database**: PostgreSQL kullanılıyor
- **File uploads**: Multer entegrasyonu mevcut
- **Email**: Nodemailer ile email gönderimi
- **Scheduling**: @nestjs/schedule ile cron job'lar
- **Throttling**: Rate limiting koruması
- **CORS**: Cross-origin request desteği

Bu proje, sosyal yardım organizasyonları için kapsamlı bir yönetim sistemi sağlar. Kod yazarken bu yapıya uygun, güvenli ve test edilebilir çözümler üret.
