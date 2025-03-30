# Turdes - Yardım Talebi Takip Sistemi

Turdes, yardım taleplerinin etkili bir şekilde takip edilmesini, organizasyonlar ve gönüllüler arasında bağlantı kurulmasını ve yardım süreçlerinin optimize edilmesini sağlayan bir backend projesidir.

## İçindekiler
- [Özellikler](#%C3%96zellikler)
- [Kurulum](#Kurulum)
- [Kullanım](#Kullan%C4%B1m)
- [API Dokümentasyonu](#API-Dok%C3%BCmentasyonu)
- [Katkıda Bulunma](#Katk%C4%B1da-Bulunma)
- [Lisans](#Lisans)

## Özellikler

### 1. Yardım Talebi Takip Sistemi
- Kullanıcılar, taleplerinin durumunu **Beklemede, Onaylandı, Reddedildi** gibi kategorilerde takip edebilir.
- Talep durumu değiştiğinde **push bildirim veya e-posta** ile bilgilendirme yapılır.

### 2. Yardım Taleplerine Yorum ve Belge Ekleme
- Organizasyonlar ve kullanıcılar, yardım taleplerine ek bilgi veya not ekleyebilir.
- Talebe **tıbbi rapor, kimlik belgesi** gibi dosyalar yüklenebilir.

### 3. Yardım Haritası
- Kullanıcılar, **bulundukları bölgedeki aktif yardım merkezlerini** harita üzerinde görebilir.
- Organizasyonlar, yardım taleplerini harita üzerinde görüntüleyerek dağıtım planlaması yapabilir.

### 4. Gönüllü Kıyıt ve Görev Dağıtımı
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

### 8. Yardım Kategorileri ve Acil Durum Talepleri
- Yardım talepleri **gıda, barınma, tıbbi yardım** gibi kategorilere ayrılabilir.
- Organizasyonlar **acil yardım çağrılarını öne çıkarabilir.**

### 9. Yardım Geçmişi ve Takibi
- Kullanıcılar ve organizasyonlar, **geçmişteki yardım taleplerini** görüntüleyebilir.

### 10. Analitik ve Raporlama
- Organizasyonlar **yardım talebi ve dağıtımı ile ilgili detaylı raporlar** alabilir.
- Kullanıcılar, **bağışları ve gönüllü aktivitelerini görsel istatistiklerle** takip edebilir.

## Kurulum
Projeyi yerel ortamda çalıştırmak için aşağıdaki adımları takip edebilirsiniz:

1. Depoyu klonlayın:
   ```sh
   git clone https://github.com/kullanici/turdes-backend.git
   cd turdes-backend
   ```
2. Bağımlılıkları yükleyin:
   ```sh
   npm install
   ```
3. Çevresel değişkenleri (.env) ayarlayın.
4. Sunucuyu başlatın:
   ```sh
   npm run start
   ```

## Kullanım
API endpoint'leri aşağıdaki gibi kullanılabilir:
- Yardım talebi oluşturmak: `POST /api/requests`
- Talep durumu sorgulamak: `GET /api/requests/:id/status`
- Bağış yapmak: `POST /api/donations`

Daha fazla detay için [API Dokümentasyonu](#API-Dok%C3%BCmentasyonu) bölümünü inceleyebilirsiniz.

## Katkıda Bulunma
Projeye katkıda bulunmak için:
1. Fork yapın.
2. Değişiklikleri yapın.
3. PR oluşturun.

## Lisans
Bu proje MIT lisansı altında sunulmaktadır.

