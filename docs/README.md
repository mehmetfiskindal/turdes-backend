# Turdes Proje Dokümantasyonu

Turdes backend projesi için kapsamlı dokümantasyon indeksi.

## 📋 Dokümantasyon İçeriği

### 1. [GitHub Copilot Talimatları](.github/copilot-instructions.md)
AI ajanları için özel olarak hazırlanmış Turdes kod tabanı rehberi. Bu dosya AI'ların projede etkili çalışması için gerekli tüm mimari kalıpları, domain-spesifik yaklaşımları ve geliştirme workflow'larını içerir.

**İçerik:**
- Proje genel bakış ve çekirdek mimari
- NestJS modüler yapı kalıpları
- Prisma ORM ve database yönetimi
- Authentication & security implementasyonu
- Test stratejileri ve debugging
- Environment konfigürasyonu
- Deployment notları

### 2. [Geliştirme Rehberi](docs/DEVELOPMENT.md)
Yeni geliştiriciler için kapsamlı başlangıç rehberi ve günlük geliştirme workflow'ları.

**İçerik:**
- Proje kurulumu ve gereksinimler
- Development environment konfigürasyonu
- Kod yapısı ve mimari açıklamaları
- API geliştirme kalıpları
- Database tasarım prensipleri
- Security best practices
- Performance optimization
- Monitoring ve logging

### 3. [API Dokümantasyonu](docs/API.md)
Tüm API endpoint'lerinin detaylı spesifikasyonları ve kullanım örnekleri.

**İçerik:**
- Authentication endpoints
- Yardım talepleri (Aid Requests) API
- Organizasyon yönetimi API
- Bağış sistemi (Donations) API
- Gönüllü yönetimi (Volunteers) API
- Kampanya yönetimi API
- Harita servisleri (Map Services) API
- Raporlama ve analitik API
- Hata yönetimi ve response formatları
- Rate limiting ve security

### 4. [Database Şema Dokümantasyonu](docs/DATABASE.md)
PostgreSQL veritabanı şeması, ilişkiler ve migration stratejileri.

**İçerik:**
- Tüm database tablolarının detaylı açıklamaları
- Entity relationship diagram (ERD)
- Index stratejileri ve performance optimization
- Migration history ve best practices
- Foreign key relationships
- Data types ve constraints
- Backup ve recovery stratejileri

### 5. [Test Rehberi](docs/TESTING.md)
Kapsamlı test stratejileri, test yazma kalıpları ve test çalıştırma prosedürleri.

**İçerik:**
- Test stratejisi overview
- TestHelper class kullanımı
- E2E test patterns
- Authentication testing
- Validation ve authorization testing
- Firebase integration testing
- Performance testing
- Error handling testing
- Test data management
- Debugging strategies

### 6. [Deployment Rehberi](docs/DEPLOYMENT.md)
Production, staging ve development ortamlarına deployment süreci.

**İçerik:**
- Environment konfigürasyonları
- Docker containerization
- Cloud deployment (Heroku, AWS, DigitalOcean)
- CI/CD pipeline setup
- Database migration strategies
- Monitoring ve health checks
- Backup ve recovery
- Security considerations
- Performance optimization
- Troubleshooting

## 🚀 Hızlı Başlangıç

### Geliştirici için
1. [Geliştirme Rehberi](docs/DEVELOPMENT.md) ile projeyi kurun
2. [API Dokümantasyonu](docs/API.md) ile endpoint'leri öğrenin
3. [Test Rehberi](docs/TESTING.md) ile test yazımını öğrenin

### AI Ajanları için
1. [GitHub Copilot Talimatları](.github/copilot-instructions.md) ile proje kalıplarını öğrenin
2. [Database Dokümantasyonu](docs/DATABASE.md) ile veri yapısını anlayın

### DevOps için
1. [Deployment Rehberi](docs/DEPLOYMENT.md) ile ortam kurulumlarını yapın
2. [Database Dokümantasyonu](docs/DATABASE.md) ile migration'ları planlayın

## 📁 Proje Yapısı

```
turdes-backend/
├── .github/
│   └── copilot-instructions.md    # AI ajanları için rehber
├── docs/
│   ├── DEVELOPMENT.md              # Geliştirme rehberi
│   ├── API.md                      # API dokümantasyonu
│   ├── DATABASE.md                 # Database şema dokümantasyonu
│   ├── TESTING.md                  # Test rehberi
│   └── DEPLOYMENT.md               # Deployment rehberi
├── src/
│   ├── app/                        # NestJS modülleri
│   ├── common/                     # Paylaşılan utilities
│   └── main.ts                     # Uygulama entry point
├── prisma/
│   ├── schema.prisma               # Database şeması
│   └── migrations/                 # Migration dosyaları
├── test/                           # E2E testler
└── package.json                    # Dependencies ve scripts
```

## 🔧 Temel Komutlar

```bash
# Geliştirme ortamını başlat
npm run start:dev

# Migration çalıştır
npm run migrate

# Testleri çalıştır
npm run test:e2e

# Build yap
npm run build

# Production'da çalıştır
npm run start:prod
```

## 📞 Destek

Bu dokümantasyonda bulamadığınız konular için:

1. İlgili dokümantasyon dosyasını kontrol edin
2. GitHub issues'ı kontrol edin
3. Development team'e ulaşın

## 🔄 Dokümantasyon Güncellemeleri

Bu dokümantasyon sürekli güncellenmektedir. Önemli değişiklikler:

- **Yeni özellik ekleme**: API.md ve DEVELOPMENT.md güncelle
- **Database değişiklikleri**: DATABASE.md güncelle
- **Deployment değişiklikleri**: DEPLOYMENT.md güncelle
- **Test stratejisi değişiklikleri**: TESTING.md güncelle
- **AI ajanları için yeni kalıplar**: copilot-instructions.md güncelle

---

**Not**: Bu dokümantasyon, Turdes backend projesi için kapsamlı bir rehber niteliğindedir. Proje geliştikçe dokümantasyon da güncel tutulacaktır.