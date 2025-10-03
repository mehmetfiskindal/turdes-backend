# Turdes API Endpoint Spesifikasyonları

Bu dokümanda Turdes backend sisteminin tüm API endpoint'leri detaylıyla açıklanmıştır.

## Base URL
```
Development: http://localhost:3000/api
Production: https://api.turdes.com/api
```

## Authentication

Tüm protected endpoint'ler için Bearer token gereklidir:
```
Authorization: Bearer <access_token>
```

## 1. Authentication Endpoints

### POST /auth/register
Yeni kullanıcı kaydı oluşturur.

**Request Body:**
```json
{
  "name": "Ahmet Yılmaz",
  "email": "ahmet@example.com",
  "password": "securePassword123",
  "phone": "05551234567",
  "category": "NONE"
}
```

**Response:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Kayıt başarılı. E-posta doğrulama bağlantısı gönderildi.",
  "data": {
    "id": 1,
    "name": "Ahmet Yılmaz",
    "email": "ahmet@example.com",
    "isEmailVerified": false
  }
}
```

### POST /auth/login
Kullanıcı girişi yapar.

**Request Body:**
```json
{
  "email": "ahmet@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Giriş başarılı",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "Ahmet Yılmaz",
      "email": "ahmet@example.com",
      "role": "user"
    }
  }
}
```

### POST /auth/refresh
Access token yeniler.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST /auth/verify-email
E-posta doğrulama yapar.

**Request Body:**
```json
{
  "token": "verification-token-from-email"
}
```

### POST /auth/resend-verification-email
Doğrulama e-postasını yeniden gönderir.

**Request Body:**
```json
{
  "email": "ahmet@example.com"
}
```

## 2. Aid Requests (Yardım Talepleri)

### GET /aidrequests
Yardım taleplerini listeler.

**Query Parameters:**
- `page` (optional): Sayfa numarası (default: 1)
- `limit` (optional): Sayfa başına kayıt (default: 10)
- `status` (optional): Durum filtresi (pending, approved, rejected)
- `type` (optional): Tip filtresi (food, medical, shelter, etc.)

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Yardım talepleri başarıyla getirildi",
  "data": {
    "data": [
      {
        "id": 1,
        "type": "food",
        "description": "Aileme yemek yardımı gerekiyor",
        "status": "pending",
        "isUrgent": true,
        "userId": 1,
        "organizationId": null,
        "location": {
          "latitude": 41.0082,
          "longitude": 28.9784
        },
        "user": {
          "name": "Ahmet Yılmaz",
          "category": "ELDERLY"
        },
        "helpCode": "TR2024001"
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

### POST /aidrequests
Yeni yardım talebi oluşturur.

**Request Body:**
```json
{
  "type": "food",
  "description": "Aileme acil yemek yardımı gerekiyor. 4 kişilik aile için temel gıda maddeleri.",
  "isUrgent": true,
  "recurring": false,
  "location": {
    "latitude": 41.0082,
    "longitude": 28.9784
  }
}
```

**Response:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Yardım talebi başarıyla oluşturuldu",
  "data": {
    "id": 1,
    "type": "food",
    "description": "Aileme acil yemek yardımı gerekiyor...",
    "status": "pending",
    "isUrgent": true,
    "userId": 1,
    "helpCode": "TR2024001",
    "qrCodeUrl": "https://api.qrserver.com/v1/create-qr-code/?data=TR2024001"
  }
}
```

### GET /aidrequests/:id
Belirli bir yardım talebini getirir.

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Yardım talebi başarıyla getirildi",
  "data": {
    "id": 1,
    "type": "food",
    "description": "Aileme acil yemek yardımı gerekiyor...",
    "status": "pending",
    "isUrgent": true,
    "userId": 1,
    "organizationId": null,
    "helpCode": "TR2024001",
    "qrCodeUrl": "https://api.qrserver.com/v1/create-qr-code/?data=TR2024001",
    "user": {
      "name": "Ahmet Yılmaz",
      "email": "ahmet@example.com",
      "category": "ELDERLY"
    },
    "comments": [
      {
        "id": 1,
        "content": "Talebiniz değerlendiriliyor",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "documents": [
      {
        "id": 1,
        "name": "kimlik_belgesi.pdf",
        "url": "https://storage.googleapis.com/turdes/documents/..."
      }
    ]
  }
}
```

### PATCH /aidrequests/:id/status
Yardım talebi durumunu günceller (Organization only).

**Request Body:**
```json
{
  "status": "approved",
  "comment": "Talebiniz onaylandı. En kısa sürede size ulaşacağız."
}
```

### POST /aidrequests/:id/comments
Yardım talebine yorum ekler.

**Request Body:**
```json
{
  "content": "Ek bilgi: 3 çocuğumuz var, bebek maması da gerekiyor."
}
```

### POST /aidrequests/:id/documents
Yardım talebine belge ekler.

**Request Body (multipart/form-data):**
```
file: [uploaded file]
name: "Tıbbi Rapor"
```

## 3. Organizations (Organizasyonlar)

### GET /organizations
Organizasyonları listeler.

**Query Parameters:**
- `page`, `limit`: Pagination
- `type` (optional): Organizasyon tipi
- `city` (optional): Şehir filtresi

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Organizasyonlar başarıyla getirildi",
  "data": {
    "data": [
      {
        "id": 1,
        "name": "Ankara Yardım Derneği",
        "type": "NGO",
        "mission": "İhtiyaç sahiplerine yardım etmek",
        "rating": 4.8,
        "address": {
          "address": "Kızılay, Ankara",
          "latitude": 39.9208,
          "longitude": 32.8541
        },
        "contactInfo": {
          "phone": "03121234567",
          "email": "info@ankarayardim.org"
        }
      }
    ],
    "total": 15,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

### POST /organizations
Yeni organizasyon oluşturur (Admin only).

**Request Body:**
```json
{
  "name": "İstanbul Yardım Vakfı",
  "type": "Foundation",
  "mission": "Sosyal yardım ve dayanışma",
  "address": {
    "address": "Beşiktaş, İstanbul",
    "latitude": 41.0426,
    "longitude": 29.0007
  },
  "contactInfo": {
    "phone": "02125551234",
    "email": "info@istanbulyardim.org",
    "contactName": "Mehmet Demir",
    "contactPhone": "05321234567",
    "contactEmail": "mehmet@istanbulyardim.org"
  }
}
```

### POST /organizations/:id/messages
Organizasyona mesaj gönderir.

**Request Body:**
```json
{
  "content": "Yardım talebim hakkında bilgi almak istiyorum."
}
```

### POST /organizations/:id/ratings
Organizasyonu puanlar.

**Request Body:**
```json
{
  "rating": 5,
  "feedback": "Çok hızlı ve etkili yardım sağladılar."
}
```

## 4. Donations (Bağışlar)

### POST /donors/donations
Bağış yapar.

**Request Body:**
```json
{
  "amount": 500,
  "currency": "TRY",
  "type": "money",
  "anonymous": false,
  "campaignId": 1,
  "note": "İhtiyaç sahipleri için"
}
```

**Response:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Bağış başarıyla kaydedildi",
  "data": {
    "id": 1,
    "amount": 500,
    "currency": "TRY",
    "type": "money",
    "anonymous": false,
    "donorId": 1,
    "userId": 1,
    "campaignId": 1,
    "createdAt": "2024-01-15T14:30:00Z"
  }
}
```

### GET /donors/donations
Bağışları listeler.

**Query Parameters:**
- `userId` (optional): Kullanıcı filtresi
- `campaignId` (optional): Kampanya filtresi
- `anonymous` (optional): Anonim bağış filtresi

### GET /donors/donations/statistics
Bağış istatistiklerini getirir.

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Bağış istatistikleri başarıyla getirildi",
  "data": {
    "totalDonations": 1250,
    "totalAmount": 45000,
    "averageDonationAmount": 36,
    "donationsByType": {
      "money": 800,
      "goods": 300,
      "service": 150
    },
    "donationsByMonth": [
      { "month": "2024-01", "amount": 15000 },
      { "month": "2024-02", "amount": 18000 },
      { "month": "2024-03", "amount": 12000 }
    ]
  }
}
```

## 5. Volunteers (Gönüllüler)

### POST /volunteers
Gönüllü kaydı oluşturur.

**Request Body:**
```json
{
  "firstName": "Ayşe",
  "lastName": "Kaya",
  "email": "ayse@example.com",
  "phone": "05441234567",
  "skills": ["driving", "first-aid", "cooking"],
  "availability": ["weekends", "evenings"],
  "address": "Kadıköy, İstanbul",
  "hasVehicle": true,
  "identificationNumber": "12345678901"
}
```

### GET /volunteers
Gönüllüleri listeler.

### GET /volunteers/:id/tasks
Gönüllünün görevlerini listeler.

### POST /volunteers/:id/tasks
Gönüllüye görev atar (Organization only).

**Request Body:**
```json
{
  "name": "Gıda Dağıtımı",
  "description": "Beşiktaş bölgesinde gıda paketi dağıtımı",
  "latitude": 41.0426,
  "longitude": 29.0007,
  "scheduledDate": "2024-01-20T09:00:00Z"
}
```

## 6. Campaigns (Kampanyalar)

### GET /campaigns
Kampanyaları listeler.

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Kampanyalar başarıyla getirildi",
  "data": {
    "data": [
      {
        "id": 1,
        "name": "Kış Yardımı Kampanyası",
        "description": "Soğuk kış aylarında ihtiyaç sahiplerine yardım",
        "targetAmount": 100000,
        "currentAmount": 45000,
        "endDate": "2024-03-31T23:59:59Z",
        "organizationId": 1,
        "organization": {
          "name": "Ankara Yardım Derneği"
        }
      }
    ]
  }
}
```

### POST /campaigns
Yeni kampanya oluşturur (Organization only).

**Request Body:**
```json
{
  "name": "Eğitim Yardımı Kampanyası",
  "description": "Çocukların eğitim ihtiyaçları için",
  "targetAmount": 50000,
  "endDate": "2024-06-30T23:59:59Z"
}
```

### POST /campaigns/:id/donations
Kampanyaya bağış yapar.

## 7. Map Services (Harita Servisleri)

### GET /map/aid-centers
Yakındaki yardım merkezlerini bulur.

**Query Parameters:**
- `latitude`: Enlem (required)
- `longitude`: Boylam (required)
- `radiusKm`: Yarıçap (km, default: 10)
- `type` (optional): Merkez tipi

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Yardım merkezleri başarıyla getirildi",
  "data": [
    {
      "id": 1,
      "name": "Ankara Merkez Yardım Noktası",
      "type": "food_distribution",
      "latitude": 39.9208,
      "longitude": 32.8541,
      "distance": 2.5,
      "address": "Kızılay Meydanı, Ankara",
      "phone": "03121234567",
      "workingHours": "09:00-17:00",
      "services": ["food", "clothing", "medicine"]
    }
  ]
}
```

### GET /map/social-services
Yakındaki sosyal hizmetleri bulur.

**Query Parameters:**
- `latitude`, `longitude`: Konum (required)
- `radiusKm`: Yarıçap
- `serviceType` (optional): Hizmet tipi (health, education, social)

### POST /route-optimization/calculate
Optimum dağıtım rotası hesaplar.

**Request Body:**
```json
{
  "startPoint": {
    "latitude": 39.9208,
    "longitude": 32.8541
  },
  "destinations": [
    {
      "latitude": 39.9308,
      "longitude": 32.8641,
      "aidRequestId": 1
    },
    {
      "latitude": 39.9108,
      "longitude": 32.8441,
      "aidRequestId": 2
    }
  ],
  "vehicleType": "car",
  "maxStops": 10
}
```

## 8. Reports & Analytics

### GET /reports/aid-distribution
Yardım dağıtım raporunu getirir.

**Query Parameters:**
- `startDate`: Başlangıç tarihi (YYYY-MM-DD)
- `endDate`: Bitiş tarihi (YYYY-MM-DD)
- `organizationId` (optional): Organizasyon filtresi

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Dağıtım raporu başarıyla getirildi",
  "data": {
    "totalDelivered": 156,
    "byRegion": {
      "Ankara": 45,
      "İstanbul": 67,
      "İzmir": 44
    },
    "byType": {
      "food": 89,
      "medical": 34,
      "shelter": 33
    },
    "byMonth": [
      { "month": "2024-01", "count": 52 },
      { "month": "2024-02", "count": 48 },
      { "month": "2024-03", "count": 56 }
    ]
  }
}
```

### GET /dashboard/analytics
Dashboard istatistiklerini getirir (Admin/Organization).

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Dashboard verileri başarıyla getirildi",
  "data": {
    "totalUsers": 1250,
    "totalAidRequests": 856,
    "totalOrganizations": 45,
    "pendingRequests": 23,
    "approvedRequests": 789,
    "totalDonations": 125000,
    "activeVolunteers": 234,
    "activeCampaigns": 12
  }
}
```

## 9. FAQ & Education

### GET /faq
SSS listesini getirir.

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "SSS başarıyla getirildi",
  "data": [
    {
      "id": 1,
      "question": "Yardım talebim ne kadar sürede değerlendirilir?",
      "answer": "Yardım talepleri genellikle 24-48 saat içinde değerlendirilir.",
      "category": "aid-requests"
    }
  ]
}
```

### GET /education/materials
Eğitim materyallerini getirir.

## 10. Notifications

### GET /notifications
Kullanıcının bildirimlerini getirir.

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Bildirimler başarıyla getirildi",
  "data": [
    {
      "id": 1,
      "content": "Yardım talebiniz onaylandı",
      "type": "aid_request_approved",
      "read": false,
      "createdAt": "2024-01-15T10:30:00Z",
      "relatedId": 1,
      "relatedType": "aid_request"
    }
  ]
}
```

### PATCH /notifications/:id/read
Bildirimi okundu olarak işaretler.

## Error Responses

Tüm hata durumlarında standart format:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "error": "BadRequestException",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/aidrequests"
}
```

**HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `429`: Too Many Requests
- `500`: Internal Server Error

## Rate Limiting

**Global Limits:**
- 100 requests per minute per IP

**Specific Limits:**
- Auth endpoints: 5 requests per minute
- File upload: 10 requests per minute
- Email sending: 3 requests per 5 minutes

## File Upload

**Supported formats:**
- Images: JPG, PNG, GIF (max 5MB)
- Documents: PDF, DOC, DOCX (max 10MB)

**Upload endpoint:**
```
POST /upload
Content-Type: multipart/form-data

file: [binary data]
type: "document" | "image"
```

Bu API dokümantasyonu Turdes backend sisteminin tüm endpoint'lerini ve kullanım örneklerini içerir.