# Turdes Backend - Geliştirme Kılavuzu

## Proje Kurulum Adımları

### 1. Geliştirme Ortamı Hazırlama

**Gereksinimler:**
- Node.js 18+ 
- PostgreSQL 14+
- Firebase CLI
- Git

**Kurulum:**
```bash
# Depoyu klonla
git clone https://github.com/developersailor/turdes-backend.git
cd turdes-backend

# Bağımlılıkları yükle
npm install

# Prisma client oluştur
npm run generate
```

### 2. Veritabanı Kurulumu

**PostgreSQL Kurulumu:**
```bash
# macOS (Homebrew)
brew install postgresql
brew services start postgresql

# Windows (Chocolatey)
choco install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib
```

**Veritabanı Oluşturma:**
```sql
-- PostgreSQL'e bağlan
psql -U postgres

-- Veritabanı oluştur
CREATE DATABASE turdes_dev;
CREATE DATABASE turdes_test;

-- Kullanıcı oluştur (opsiyonel)
CREATE USER turdes_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE turdes_dev TO turdes_user;
GRANT ALL PRIVILEGES ON DATABASE turdes_test TO turdes_user;
```

### 3. Environment Variables

**.env dosyası oluştur:**
```bash
cp .env.example .env
```

**Gerekli değişkenler:**
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/turdes_dev"

# JWT Secrets (güvenli rastgele stringler oluştur)
JWT_ACCESS_SECRET=your-super-secure-access-secret-here
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-here
JWT_ACCESS_EXPIRES=1h
JWT_REFRESH_EXPIRES=7d

# Email Configuration (Gmail example)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password  # Gmail app password
MAIL_FROM=your-email@gmail.com

# Application URLs
HOST_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3001

# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----"

# Features
AUDIT_LOG_ENABLED=true
NODE_ENV=development
```

### 4. Veritabanı Migration

```bash
# İlk migration'ı çalıştır
npm run migrate

# Prisma Studio'yu aç (veritabanını görüntüle)
npm run studio
```

### 5. Firebase Kurulumu

**Firebase CLI kurulum:**
```bash
npm install -g firebase-tools
firebase login
```

**Firebase projesi kurulumu:**
```bash
# Firebase projesini başlat
firebase init

# Emulator'ları başlat (geliştirme için)
npm run firebase:start
```

### 6. İlk Admin Kullanıcı Oluşturma

```bash
# Interaktif admin oluşturma scripti
npm run create-admin
```

### 7. Uygulamayı Başlatma

```bash
# Geliştirme modunda başlat
npm run start:dev

# API dokümantasyonu: http://localhost:3000/api
# Prisma Studio: npm run studio
# Firebase UI: http://localhost:4000
```

## Geliştirme Workflow'u

### Yeni Feature Geliştirme

1. **Feature Branch Oluştur:**
```bash
git checkout -b feature/yeni-ozellik-adi
```

2. **Database Schema Değişikliği (eğer gerekiyorsa):**
```bash
# schema.prisma dosyasını düzenle
# Migration oluştur
npm run migrate
```

3. **NestJS Modül Oluştur:**
```bash
# Örnek: donors modülü
mkdir src/app/donors
touch src/app/donors/donors.module.ts
touch src/app/donors/donors.service.ts
touch src/app/donors/donors.controller.ts
touch src/app/donors/dto/create-donor.dto.ts
touch src/app/donors/dto/update-donor.dto.ts
```

4. **Test Yaz:**
```bash
# E2E test oluştur
touch test/donors.e2e-spec.ts

# Unit test çalıştır
npm test

# E2E test çalıştır
npm run test:e2e
```

5. **Commit ve Push:**
```bash
git add .
git commit -m "feat: add donors module with CRUD operations"
git push origin feature/yeni-ozellik-adi
```

### Test Stratejisi

**Unit Tests:**
```bash
npm test                    # Tüm unit testler
npm run test:watch         # Watch mode
npm run test:cov           # Coverage raporu
```

**E2E Tests:**
```bash
npm run test:e2e           # Tüm E2E testler
npm run test:e2e:all       # All-tests.e2e-spec.ts
npm run test:firebase      # Firebase emulator ile
```

**Test Veritabanı:**
```bash
# Test için ayrı .env.test dosyası oluştur
cp .env .env.test
# DATABASE_URL'i test veritabanına değiştir
```

## API Endpoint Geliştirme Rehberi

### Standart CRUD Controller

```typescript
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DonorsService } from './donors.service';
import { CreateDonorDto } from './dto/create-donor.dto';
import { UpdateDonorDto } from './dto/update-donor.dto';

@ApiTags('donors')
@ApiBearerAuth()
@Controller('donors')
export class DonorsController {
  constructor(private readonly donorsService: DonorsService) {}

  @Post()
  create(@Body() createDonorDto: CreateDonorDto) {
    return this.donorsService.create(createDonorDto);
  }

  @Get()
  findAll() {
    return this.donorsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.donorsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDonorDto: UpdateDonorDto) {
    return this.donorsService.update(+id, updateDonorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.donorsService.remove(+id);
  }
}
```

### Service Layer Pattern

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDonorDto } from './dto/create-donor.dto';
import { UpdateDonorDto } from './dto/update-donor.dto';

@Injectable()
export class DonorsService {
  constructor(private prisma: PrismaService) {}

  async create(createDonorDto: CreateDonorDto) {
    return this.prisma.donor.create({
      data: createDonorDto,
    });
  }

  async findAll() {
    return this.prisma.donor.findMany({
      include: {
        donations: true,
      },
    });
  }

  async findOne(id: number) {
    const donor = await this.prisma.donor.findUnique({
      where: { id },
      include: {
        donations: true,
      },
    });

    if (!donor) {
      throw new NotFoundException(`Donor with ID ${id} not found`);
    }

    return donor;
  }

  async update(id: number, updateDonorDto: UpdateDonorDto) {
    const existingDonor = await this.findOne(id);
    
    return this.prisma.donor.update({
      where: { id },
      data: updateDonorDto,
    });
  }

  async remove(id: number) {
    const existingDonor = await this.findOne(id);
    
    return this.prisma.donor.delete({
      where: { id },
    });
  }
}
```

### DTO Validation

```typescript
import { IsString, IsEmail, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDonorDto {
  @ApiProperty({ description: 'Bağışçının adı' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'E-posta adresi' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Telefon numarası', required: false })
  @IsOptional()
  @IsString()
  phone?: string;
}
```

## Veritabanı Geliştirme

### Schema Design Patterns

```prisma
model Donor {
  id        Int        @id @default(autoincrement())
  name      String     @db.VarChar(255)
  email     String     @unique @db.VarChar(255)
  phone     String?    @db.VarChar(255)
  createdAt DateTime   @default(now()) @db.Timestamptz(6)
  updatedAt DateTime   @updatedAt @db.Timestamptz(6)
  
  // Relations
  donations Donation[]
  
  @@map("donors")
}

model Donation {
  id        Int      @id @default(autoincrement())
  amount    Float
  currency  String   @default("TRY")
  type      String   // "money", "goods", "service"
  donorId   Int
  userId    Int
  createdAt DateTime @default(now()) @db.Timestamptz(6)
  updatedAt DateTime @updatedAt @db.Timestamptz(6)
  anonymous Boolean  @default(false)
  
  // Relations
  donor     Donor    @relation(fields: [donorId], references: [id])
  user      User     @relation(fields: [userId], references: [id])
  
  @@map("donations")
}
```

### Migration Best Practices

```bash
# Migration oluşturma
npm run migrate

# Migration adlandırma
# Otomatik: 20241020214819_add_comments_and_documents_to_aid_requests
# Manuel: prisma migrate dev --name add_donor_phone_field

# Production'da migration
prisma migrate deploy

# Migration rollback (dikkatli kullan!)
prisma migrate reset
```

## Security & Best Practices

### Authentication Middleware

```typescript
// JWT Guard kullanımı
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('donors')
export class DonorsController {
  @Post()
  create(@CurrentUser() user: any, @Body() createDonorDto: CreateDonorDto) {
    // user.id, user.email, user.role erişilebilir
    return this.donorsService.create(createDonorDto, user.id);
  }
}
```

### Input Validation

```typescript
import { ValidationPipe } from '@nestjs/common';

// Global validation pipe (main.ts'de)
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,      // Sadece DTO'da tanımlı fieldları kabul et
  forbidNonWhitelisted: true,  // Ekstra field varsa hata ver
  transform: true,      // Tip dönüşümü yap
}));
```

### Rate Limiting

```typescript
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { UseGuards } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Post('login')
  @UseGuards(ThrottlerGuard)
  @Throttle(5, 60) // 5 request per 60 seconds
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
```

## Troubleshooting

### Sık Karşılaşılan Sorunlar

**1. Prisma Connection Error:**
```bash
# Bağlantı stringini kontrol et
echo $DATABASE_URL

# Veritabanının çalıştığından emin ol
pg_isready -h localhost -p 5432
```

**2. JWT Token Hatası:**
```bash
# Secret'ları kontrol et
echo $JWT_ACCESS_SECRET
echo $JWT_REFRESH_SECRET

# Test tokenları yeniden oluştur
npm run test:gen-tokens
```

**3. Firebase Emulator Hatası:**
```bash
# Firebase CLI güncel mi?
firebase --version

# Emulator'ı yeniden başlat
firebase emulators:start --only auth,firestore,storage
```

**4. Email Gönderim Hatası:**
```bash
# Gmail App Password oluşturdun mu?
# 2FA aktif mi?
# MAIL_* değişkenleri doğru mu?
```

### Debug Modları

```bash
# Debug mode ile başlat
npm run start:debug

# Test debug
npm run test:debug

# Prisma debug
DEBUG=prisma:* npm run start:dev
```

## İleri Düzey Konular

### Custom Decorators

```typescript
// @CurrentUser decorator örneği
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    
    return data ? user?.[data] : user;
  },
);

// Kullanım
@Get('profile')
getProfile(@CurrentUser() user: any) {
  return user;
}

@Get('email')
getEmail(@CurrentUser('email') email: string) {
  return { email };
}
```

### Custom Pipes

```typescript
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const val = parseInt(value, 10);
    if (isNaN(val)) {
      throw new BadRequestException('Validation failed');
    }
    return val;
  }
}
```

### Event System

```typescript
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AidRequestsService {
  constructor(private eventEmitter: EventEmitter2) {}
  
  async updateStatus(id: number, status: string) {
    const aidRequest = await this.prisma.aidRequest.update({
      where: { id },
      data: { status },
    });
    
    // Event emit et
    this.eventEmitter.emit('aidRequest.statusChanged', {
      aidRequest,
      previousStatus: 'pending',
      newStatus: status,
    });
    
    return aidRequest;
  }
}

// Event listener
@Injectable()
export class NotificationService {
  @OnEvent('aidRequest.statusChanged')
  async handleStatusChange(payload: any) {
    // Firebase notification gönder
    // Email gönder
  }
}
```

Bu kılavuz, Turdes backend projesini geliştirirken ihtiyaç duyacağınız tüm temel bilgileri içerir. Sorularınız için GitHub Issues kullanabilirsiniz.