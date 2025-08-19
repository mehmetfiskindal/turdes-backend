# Turdes - Yardım Talebi Takip Sistemi

Turdes, yardım taleplerinin etkili bir şekilde takip edilmesini, organizasyonlar ve gönüllüler arasında bağlantı kurulmasını ve yardım süreçlerinin optimize edilmesini sağlayan bir backend API projesidir.

## İçindekiler
- [Özellikler](#%C3%96zellikler)
- [Teknoloji Yığını](#Teknoloji-Y%C4%B1%C4%9F%C4%B1n%C4%B1)
- [Kurulum](#Kurulum)
- [Geliştirme](#Geli%C5%9Ftirme)
- [Proje Yapısı](#Proje-Yap%C4%B1s%C4%B1)
- [API Dokümentasyonu](#API-Dok%C3%BCmentasyonu)
- [Katkıda Bulunma](#Katk%C4%B1da-Bulunma)
- [Lisans](#Lisans)

## Özellikler

### 1. Yardım Talebi Takip Sistemi
- Kullanıcılar, taleplerinin durumunu **Beklemede, Onaylandı, Reddedildi** gibi kategorilerde takip edebilir.
- Talep durumu değiştiğinde **Firebase üzerinden push bildirim veya e-posta** ile bilgilendirme yapılır.

### 2. Yardım Taleplerine Yorum ve Belge Ekleme
- Organizasyonlar ve kullanıcılar, yardım taleplerine ek bilgi veya not ekleyebilir.
- Talebe **tıbbi rapor, kimlik belgesi** gibi dosyalar yüklenebilir.

### 3. Yardım Haritası
- Kullanıcılar, **bulundukları bölgedeki aktif yardım merkezlerini** harita üzerinde görebilir.
- Organizasyonlar, yardım taleplerini harita üzerinde görüntüleyerek dağıtım planlaması yapabilir.

### 4. Gönüllü Kayıt ve Görev Dağıtımı
- Yardım organizasyonlarına **gönüllü kaydı** oluşturulabilir.
- Organizasyonlar, **gönüllülere görev atayabilir** (yardım paketi dağıtımı, tıbbi destek vb.).

### 5. Bağış ve Gönüllü Profili
- Kullanıcılar, **yaptıkları bağışları ve gönüllü faaliyetlerini** profillerinde takip edebilir.

### 6. Bağış Yönetim Sistemi
- Bağış yapanlara **otomatik teşekkür mesajları** gönderilir.
- Bağışların **hangi alanlara kullanıldığı detaylı raporlarla gösterilir.**

### 7. Mesajlaşma ve Kullanıcı Destek Sistemi
- Kullanıcılar ve organizasyonlar **doğrudan mesajlaşabilir**.
- Yardım talebiyle ilgili **SSS bölümü** bulunur.

### 8. Yardım Kampanyaları ve Etkinlikler
- Organizasyonlar **kampanya ve etkinlikler** oluşturabilir.
- Kullanıcılar **kampanyalara bağış** yapabilir ve **etkinliklere katılım** sağlayabilir.

### 9. Yardım Geçmişi ve Takibi
- Kullanıcılar ve organizasyonlar, **geçmişteki yardım taleplerini** görüntüleyebilir.

### 10. Analitik ve Raporlama
- Organizasyonlar **yardım talebi ve dağıtımı ile ilgili detaylı raporlar** alabilir.
- Kullanıcılar, **bağışları ve gönüllü aktivitelerini görsel istatistiklerle** takip edebilir.

## Teknoloji Yığını

- **Backend Framework**: NestJS
- **Veritabanı Erişimi**: Prisma ORM
- **Kimlik Doğrulama**: JWT, Passport.js
- **API Dokümantasyonu**: Swagger/OpenAPI
- **Test**: Jest, SuperTest
- **Bildirimler**: Firebase Admin SDK, Nodemailer
- **Diğer Özellikler**: CASL (yetkilendirme), Throttler (rate limiting), QR kod üretimi

## Kurulum

Projeyi yerel ortamda çalıştırmak için aşağıdaki adımları takip edebilirsiniz:

1. Depoyu klonlayın:
   ```sh
   git clone https://github.com/kullanici/turdesbe.git
   cd turdesbe
   ```

2. Bağımlılıkları yükleyin:
   ```sh
   npm install
   ```

3. Çevresel değişkenleri ayarlayın:
   ```sh
   cp .env.example .env
   # .env dosyasını düzenleyin ve gerekli değişkenleri ayarlayın
   ```

4. Veritabanını oluşturun ve migrate edin:
   ```sh
   npm run migrate
   ```

5. Sunucuyu başlatın:
   ```sh
   # Geliştirme modunda çalıştırma
   npm run start:dev
   
   # Üretim modunda çalıştırma
   npm run build
   npm run start:prod
   ```

## Geliştirme

### Prisma Komutları

```sh
# Veritabanı şemasını oluşturmak/güncellemek
npm run generate

# Veritabanı değişikliklerini migrate etmek
npm run migrate

# Prisma Studio'yu başlatmak (veritabanı görsel yönetimi)
npm run studio
```

### Test

```sh
# Birim testleri çalıştırmak
npm run test

# Uçtan uca (E2E) testleri çalıştırmak
npm run test:e2e

# Tüm E2E testleri birlikte çalıştırmak
npm run test:e2e:all

# Test tokenları oluşturmak
npm run test:gen-tokens
```

## Proje Yapısı

```
src/
  ├─ app/                   # Ana uygulama kodları
  │   ├─ aid-centers/       # Yardım merkezleri modülü
  │   ├─ aid-requests/      # Yardım talepleri modülü
  │   ├─ auth/              # Kimlik doğrulama modülü
  │   ├─ campaigns/         # Kampanyalar modülü
  │   ├─ casl/              # Yetkilendirme modülü
  │   ├─ dashboard/         # Gösterge paneli modülü
  │   ├─ donors/            # Bağışçılar modülü
  │   ├─ education/         # Eğitim materyalleri modülü
  │   ├─ faq/               # SSS modülü
  │   ├─ firebase/          # Firebase entegrasyonu
  │   ├─ history/           # Geçmiş kayıtlar modülü
  │   ├─ map/               # Harita ve konum modülü
  │   ├─ organizations/     # Organizasyonlar modülü
  │   ├─ prisma/            # Prisma servis modülü
  │   ├─ reports/           # Raporlama modülü
  │   ├─ security/          # Güvenlik modülü
  │   ├─ volunteers/        # Gönüllüler modülü
  │   ├─ weather/           # Hava durumu modülü
  │   └─ app.module.ts      # Ana uygulama modülü
  ├─ assets/                # Statik dosyalar
  ├─ common/                # Ortak bileşenler ve yardımcılar
  └─ main.ts                # Uygulama giriş noktası
prisma/
  ├─ schema.prisma          # Veritabanı şema tanımları
  └─ migrations/            # Veritabanı migrasyonları
test/
  └─ ...                    # Test dosyaları
```

## API Dokümentasyonu

API endpoint'leri Swagger ile dokümante edilmiştir. Uygulamayı çalıştırdıktan sonra aşağıdaki URL'i ziyaret ederek API dokümentasyonuna ulaşabilirsiniz:

```
http://localhost:3000/api
```

### Temel API Endpoint'leri

- **Kimlik Doğrulama**
  - `POST /api/auth/register` - Yeni kullanıcı kaydı
  - `POST /api/auth/login` - Kullanıcı girişi
  - `POST /api/auth/refresh` - Access token yenileme
  - `POST /api/auth/verify-email` - E-posta doğrulama
  - `POST /api/auth/resend-verification-email` - Doğrulama e-postasını yeniden gönderme

- **Yardım Talepleri**
  - `GET /api/aidrequests` - Tüm yardım taleplerini listeleme
  - `POST /api/aidrequests` - Yeni yardım talebi oluşturma
  - `GET /api/aidrequests/:id/:organizationId` - Belirli bir yardım talebini görüntüleme
  - `PATCH /api/aidrequests/:id/status` - Yardım talebi durumunu güncelleme
  - `POST /api/aidrequests/:id/comments` - Yardım talebine yorum ekleme
  - `POST /api/aidrequests/:id/documents` - Yardım talebine belge ekleme

- **Organizasyonlar**
  - `GET /api/organizations` - Tüm organizasyonları listeleme
  - `GET /api/organizations/:id` - Belirli bir organizasyonu görüntüleme
  - `POST /api/organizations` - Yeni organizasyon oluşturma
  - `POST /api/organizations/:id/messages` - Organizasyona mesaj gönderme
  - `POST /api/organizations/:id/ratings` - Organizasyon puanlama

- **Bağışlar**
  - `POST /api/donors/donations` - Bağış yapma
  - `GET /api/donors/donations` - Bağışları listeleme
  - `GET /api/donors/donations/statistics` - Bağış istatistiklerini görüntüleme

- **Harita ve Konum Servisleri**
  - `GET /api/map/aid-centers` - Yakındaki yardım merkezlerini bulma
  - `GET /api/map/social-services` - Yakındaki sosyal destek hizmetlerini bulma
  - `POST /api/route-optimization/calculate` - Optimum rota hesaplama

## Katkıda Bulunma

Projeye katkıda bulunmak için:

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b yeni-ozellik`)
3. Değişikliklerinizi commit edin (`git commit -am 'Yeni özellik: Özellik açıklaması'`)
4. Branch'inizi push edin (`git push origin yeni-ozellik`)
5. Pull Request oluşturun

## Lisans

Bu proje MIT lisansı altında sunulmaktadır.

## Audit Log
Uygulama yazma (POST/PUT/PATCH/DELETE) isteklerinde otomatik olarak `AuditLog` tablosuna kayıt açar.

Kaydedilen alanlar:
- userId (oturum varsa)
- action: create/update/delete (+ _failed son ekli hata durumunda)
- entity: URL ilk segmenti (ör: aid-requests)
- entityId: route param `id` varsa
- metadata: Gövdeden hassas alanlar çıkarılmış (password, token vb.) JSON
- ip, userAgent, createdAt

Özelleştirme:
- `AUDIT_LOG_ENABLED=false` env ile tamamen kapatılabilir.

Performans:
- Kayıt hataları uygulamayı etkilemez (hatalar yutulur), asenkron create işlemi beklenmez.

Gelecek İyileştirmeler:
- Belirli entity alanlarını maskeleme whitelist desteği
- Esnek action adlandırma decorator tabanlı

