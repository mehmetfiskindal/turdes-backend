# Turdes Database Schema Dokümantasyonu

Bu dokümanda Turdes sisteminin PostgreSQL veritabanı şeması ve ilişkileri detaylı olarak açıklanmıştır.

## 1. Database Overview

**Database Engine:** PostgreSQL
**ORM:** Prisma
**Migration Tool:** Prisma Migrate

## 2. Core Tables

### Users (Kullanıcılar)

Sistemdeki tüm kullanıcıların temel bilgilerini tutar.

```sql
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "category" "UserCategory" NOT NULL DEFAULT 'NONE',
    "refreshToken" TEXT,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationToken" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
```

**UserCategory Enum:**
```sql
CREATE TYPE "UserCategory" AS ENUM (
  'NONE',
  'DISABLED',
  'ELDERLY',
  'LARGE_FAMILY',
  'UNEMPLOYED',
  'REFUGEE'
);
```

**Relationships:**
- One-to-many: AidRequest, Donation, Message
- One-to-one: Volunteer

### AidRequest (Yardım Talepleri)

Kullanıcıların yardım taleplerini tutar.

```sql
CREATE TABLE "AidRequest" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "isUrgent" BOOLEAN NOT NULL DEFAULT false,
    "recurring" BOOLEAN NOT NULL DEFAULT false,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "helpCode" TEXT,
    "userId" INTEGER NOT NULL,
    "organizationId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AidRequest_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AidRequest_helpCode_key" ON "AidRequest"("helpCode");
CREATE INDEX "AidRequest_userId_idx" ON "AidRequest"("userId");
CREATE INDEX "AidRequest_organizationId_idx" ON "AidRequest"("organizationId");
CREATE INDEX "AidRequest_status_idx" ON "AidRequest"("status");
CREATE INDEX "AidRequest_type_idx" ON "AidRequest"("type");
CREATE INDEX "AidRequest_isUrgent_idx" ON "AidRequest"("isUrgent");
```

**Status Values:** 'pending', 'approved', 'rejected', 'completed'
**Type Values:** 'food', 'medical', 'shelter', 'clothing', 'education', 'transportation', 'other'

**Relationships:**
- Many-to-one: User, Organization
- One-to-many: Comment, Document

### Organization (Organizasyonlar)

Yardım kuruluşlarının bilgilerini tutar.

```sql
CREATE TABLE "Organization" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "mission" TEXT NOT NULL,
    "rating" DOUBLE PRECISION DEFAULT 0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Organization_name_idx" ON "Organization"("name");
CREATE INDEX "Organization_type_idx" ON "Organization"("type");
CREATE INDEX "Organization_verified_idx" ON "Organization"("verified");
```

**Relationships:**
- One-to-many: AidRequest, Campaign, Event, Address, ContactInfo, Message, Rating
- Many-to-many: Volunteer (through VolunteerTask)

### Address (Adresler)

Organizasyonların adres bilgilerini tutar.

```sql
CREATE TABLE "Address" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "organizationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Address_organizationId_idx" ON "Address"("organizationId");
```

### ContactInfo (İletişim Bilgileri)

Organizasyonların iletişim bilgilerini tutar.

```sql
CREATE TABLE "ContactInfo" (
    "id" SERIAL NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "organizationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactInfo_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ContactInfo_organizationId_idx" ON "ContactInfo"("organizationId");
```

## 3. Comment & Document System

### Comment (Yorumlar)

Yardım taleplerindeki yorumları tutar.

```sql
CREATE TABLE "Comment" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "aidRequestId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Comment_aidRequestId_idx" ON "Comment"("aidRequestId");
```

### Document (Belgeler)

Yardım taleplerindeki belgeleri tutar.

```sql
CREATE TABLE "Document" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "aidRequestId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Document_aidRequestId_idx" ON "Document"("aidRequestId");
```

## 4. Donation System

### Donation (Bağışlar)

Bağış işlemlerini tutar.

```sql
CREATE TABLE "Donation" (
    "id" SERIAL NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "type" TEXT NOT NULL,
    "anonymous" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "donorId" INTEGER,
    "userId" INTEGER,
    "campaignId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Donation_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Donation_donorId_idx" ON "Donation"("donorId");
CREATE INDEX "Donation_userId_idx" ON "Donation"("userId");
CREATE INDEX "Donation_campaignId_idx" ON "Donation"("campaignId");
CREATE INDEX "Donation_type_idx" ON "Donation"("type");
CREATE INDEX "Donation_anonymous_idx" ON "Donation"("anonymous");
```

**Type Values:** 'money', 'goods', 'service'

### Donor (Bağışçılar)

Bağışçı bilgilerini tutar.

```sql
CREATE TABLE "Donor" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Donor_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Donor_email_key" ON "Donor"("email");
```

## 5. Volunteer System

### Volunteer (Gönüllüler)

Gönüllü bilgilerini tutar.

```sql
CREATE TABLE "Volunteer" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "skills" TEXT[],
    "availability" TEXT[],
    "address" TEXT NOT NULL,
    "hasVehicle" BOOLEAN NOT NULL DEFAULT false,
    "identificationNumber" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Volunteer_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Volunteer_email_key" ON "Volunteer"("email");
CREATE UNIQUE INDEX "Volunteer_identificationNumber_key" ON "Volunteer"("identificationNumber");
CREATE UNIQUE INDEX "Volunteer_userId_key" ON "Volunteer"("userId");
```

### VolunteerTask (Gönüllü Görevleri)

Gönüllülere atanan görevleri tutar.

```sql
CREATE TABLE "VolunteerTask" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'assigned',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "scheduledDate" TIMESTAMP(3),
    "completedDate" TIMESTAMP(3),
    "volunteerId" INTEGER NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VolunteerTask_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "VolunteerTask_volunteerId_idx" ON "VolunteerTask"("volunteerId");
CREATE INDEX "VolunteerTask_organizationId_idx" ON "VolunteerTask"("organizationId");
CREATE INDEX "VolunteerTask_status_idx" ON "VolunteerTask"("status");
```

**Status Values:** 'assigned', 'in_progress', 'completed', 'cancelled'

## 6. Campaign & Event System

### Campaign (Kampanyalar)

Bağış kampanyalarını tutar.

```sql
CREATE TABLE "Campaign" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "targetAmount" DOUBLE PRECISION NOT NULL,
    "currentAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "endDate" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "organizationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Campaign_organizationId_idx" ON "Campaign"("organizationId");
CREATE INDEX "Campaign_active_idx" ON "Campaign"("active");
```

### Event (Etkinlikler)

Organizasyonların düzenlediği etkinlikleri tutar.

```sql
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Event_organizationId_idx" ON "Event"("organizationId");
CREATE INDEX "Event_date_idx" ON "Event"("date");
```

## 7. Communication System

### Message (Mesajlar)

Kullanıcı-organizasyon mesajlaşmasını tutar.

```sql
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Message_userId_idx" ON "Message"("userId");
CREATE INDEX "Message_organizationId_idx" ON "Message"("organizationId");
```

### Rating (Puanlama)

Organizasyon puanlamalarını tutar.

```sql
CREATE TABLE "Rating" (
    "id" SERIAL NOT NULL,
    "rating" INTEGER NOT NULL,
    "feedback" TEXT,
    "userId" INTEGER NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Rating_userId_idx" ON "Rating"("userId");
CREATE INDEX "Rating_organizationId_idx" ON "Rating"("organizationId");
CREATE INDEX "Rating_rating_idx" ON "Rating"("rating");
```

## 8. Audit & FAQ System

### AuditLog (Denetim Kayıtları)

Sistem aktivitelerini tutar.

```sql
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" INTEGER,
    "userId" INTEGER,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");
CREATE INDEX "AuditLog_entity_idx" ON "AuditLog"("entity");
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");
```

### FAQ (Sık Sorulan Sorular)

Sık sorulan soruları tutar.

```sql
CREATE TABLE "FAQ" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FAQ_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "FAQ_category_idx" ON "FAQ"("category");
```

## 9. Geographic Data & Services

### AidCenter (Yardım Merkezleri)

Statik yardım merkezlerini tutar.

```sql
CREATE TABLE "AidCenter" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT,
    "workingHours" TEXT,
    "services" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AidCenter_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AidCenter_type_idx" ON "AidCenter"("type");
CREATE INDEX "AidCenter_latitude_longitude_idx" ON "AidCenter"("latitude", "longitude");
```

### SocialService (Sosyal Hizmetler)

Sosyal hizmet noktalarını tutar.

```sql
CREATE TABLE "SocialService" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT,
    "workingHours" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialService_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SocialService_serviceType_idx" ON "SocialService"("serviceType");
CREATE INDEX "SocialService_latitude_longitude_idx" ON "SocialService"("latitude", "longitude");
```

## 10. Foreign Key Relationships

```sql
-- User relationships
ALTER TABLE "AidRequest" ADD CONSTRAINT "AidRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Message" ADD CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Volunteer" ADD CONSTRAINT "Volunteer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Organization relationships
ALTER TABLE "AidRequest" ADD CONSTRAINT "AidRequest_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Address" ADD CONSTRAINT "Address_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ContactInfo" ADD CONSTRAINT "ContactInfo_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Event" ADD CONSTRAINT "Event_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Message" ADD CONSTRAINT "Message_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "VolunteerTask" ADD CONSTRAINT "VolunteerTask_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AidRequest relationships
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_aidRequestId_fkey" FOREIGN KEY ("aidRequestId") REFERENCES "AidRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Document" ADD CONSTRAINT "Document_aidRequestId_fkey" FOREIGN KEY ("aidRequestId") REFERENCES "AidRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Donation relationships
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "Donor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Volunteer relationships
ALTER TABLE "VolunteerTask" ADD CONSTRAINT "VolunteerTask_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
```

## 11. Database Indexes Performance

### Composite Indexes

Performans için önemli composite index'ler:

```sql
-- AidRequest status ve tip sorguları için
CREATE INDEX "AidRequest_status_type_idx" ON "AidRequest"("status", "type");

-- AidRequest lokasyon sorguları için
CREATE INDEX "AidRequest_location_idx" ON "AidRequest"("latitude", "longitude");

-- Donation filtreleme sorguları için
CREATE INDEX "Donation_user_campaign_idx" ON "Donation"("userId", "campaignId");

-- Volunteer task status sorguları için
CREATE INDEX "VolunteerTask_volunteer_status_idx" ON "VolunteerTask"("volunteerId", "status");

-- Message zaman sorguları için
CREATE INDEX "Message_organization_date_idx" ON "Message"("organizationId", "createdAt");

-- Audit log filtreleme için
CREATE INDEX "AuditLog_entity_action_idx" ON "AuditLog"("entity", "action");
```

## 12. Data Migration Notes

### Migration History

1. **20241020214819_add_comments_and_documents_to_aid_requests**
   - Comment ve Document tablolarını ekledi
   - AidRequest ilişkilerini kurdu

2. **20250404230321_add_is_email_verified_to_user**
   - User tablosuna email doğrulama alanları ekledi
   - verificationToken ve tokenExpiresAt alanları

3. **20250409153207_add_help_code_to_aid_request**
   - AidRequest tablosuna helpCode alanı ekledi
   - QR kod desteği için unique constraint

4. **20250816170359_add_audit_log**
   - AuditLog tablosunu ekledi
   - Sistem aktivite takibi için

### Future Migration Considerations

- Email template tablosu eklenebilir
- Notification tablosu eklenebilir
- File storage metadata tablosu eklenebilir
- Performance monitoring tabloları eklenebilir

## 13. Database Performance Tips

1. **Index Kullanımı:**
   - Where clause'larda kullanılan alanlar için index
   - Join operation'ları için foreign key index'ler
   - Sorting operation'ları için order by alanları

2. **Query Optimization:**
   - SELECT * yerine gerekli alanları seç
   - LIMIT kullanarak pagination uygula
   - N+1 query problemini önlemek için include kullan

3. **Connection Pool:**
   - Prisma connection pool settings optimize et
   - Database connection limits ayarla

Bu dokümantasyon Turdes veritabanının tam şemasını ve ilişkilerini kapsar. Yeni özellikler eklenirken bu dokümantasyonu güncel tutmayı unutmayın.