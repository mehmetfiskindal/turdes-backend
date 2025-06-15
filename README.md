# Turdes - Yardım Talebi Takip Sistemi

Turdes, yardım taleplerinin etkili bir şekilde takip edilmesini, organizasyonlar ve gönüllüler arasında bağlantı kurulmasını ve yardım süreçlerinin optimize edilmesini sağlayan bir backend API projesidir.

## İçindekiler
- [Özellikler](#%C3%96zellikler)
- [Teknoloji Yığını](#Teknoloji-Y%C4%B1%C4%9F%C4%B1n%C4%B1)
- [Kurulum](#Kurulum)
- [Geliştirme](#Geliştir)
- [Proje Yapısı](#Proje-Yap%C4%B1s%C4%B1)
- [API Dokümentasyonu](#API-Dok%C3%BCmentasyonu)
- [Katkıda Bulunma](#Katk%C4%B1da-Bulunma)
- [Lisans](#Lisans)

## Eklemek İstediğim Özellikler 
- bazı özellikler mevcut olabilir ancak detaylandırmak için gemine ve chatgpt'den planlama için yardım alıyorum.

### 1. Yardım Talebi Takip Sistemi
- Kullanıcılar, taleplerinin durumunu **Beklemede, Onaylandı, Reddedildi** gibi kategorilerde takip edebilir.
- Talep durumu değiştiğinde **Firebase üzerinden push bildirim veya e-posta** ile bilgilendirme yapılır.
    Bu özellik, yardım talep eden kullanıcıların başvurularının her aşamasını şeffaf bir şekilde izleyebilmelerini ve organizasyonların da talepleri etkin bir şekilde yönetebilmelerini sağlar.

    ## 1.1. Talep Durumu Kategorileri:

    Beklemede: Kullanıcı tarafından yeni oluşturulan ve henüz bir organizasyon yetkilisi tarafından incelenmemiş olan talepler bu kategoride yer alır.
    Bu aşamada, talepteki bilgilerde eksiklik olup olmadığı veya talebin organizasyonun yardım kriterlerine uygun olup olmadığı değerlendirilir.
    Kullanıcı bu durumdayken talebini düzenleyebilir veya iptal edebilir (belirli bir süre içinde veya organizasyon tarafından henüz işleme alınmamışsa gibi kısıtlamalar olabilir).
    İnceleniyor: Organizasyon yetkilisi tarafından işleme alınan ve değerlendirme sürecinde olan talepler bu kategoriye geçer.
    Bu aşamada, talep detayları incelenir, gerekirse kullanıcıdan ek bilgi veya belge talep edilebilir (Yorum ve Belge Ekleme özelliği ile).
    Organizasyon içinde farklı departmanlara veya yetkililere yönlendirilebilir.
    Onaylandı: Yapılan değerlendirme sonucunda kullanıcının yardım talebinin uygun bulunduğu ve karşılanacağı anlamına gelir.
    Onaylanan talepler için organizasyon tarafından yardım sağlama süreci başlatılır (gönüllü atama, kaynak planlaması vb.).
    Kullanıcıya, yardımın ne zaman ve nasıl ulaştırılacağına dair bilgilendirme yapılabilir.
    Reddedildi: Yapılan değerlendirme sonucunda kullanıcının yardım talebinin çeşitli nedenlerle (organizasyonun yardım kriterlerine uymama, yetersiz kaynak vb.) karşılanamayacağı anlamına gelir.
    Reddedilme nedeni kullanıcıya açık ve anlaşılır bir şekilde bildirilmelidir.
    Kullanıcıya alternatif yardım kaynakları veya yönlendirme seçenekleri sunulabilir.
    Tamamlandı: Onaylanan yardım talebinin başarıyla sonuçlandığı ve yardımın kullanıcıya ulaştırıldığı anlamına gelir.
    Bu aşamada, yardımın detayları (ne tür yardım sağlandı, ne zaman ulaştırıldı vb.) sisteme kaydedilebilir.
    Kullanıcıdan geri bildirim alınabilir (opsiyonel).
    İptal Edildi: Kullanıcı tarafından veya organizasyon tarafından (istisnai durumlarda) talep sürecinin sonlandırıldığı anlamına gelir.
    İptal nedenleri sisteme kaydedilebilir.
    ## 1.2. Talep Durumu Takibi (Kullanıcı Tarafında):

    Anasayfa/Profil: Kullanıcılar, oluşturdukları tüm yardım taleplerinin mevcut durumunu kolayca görebilecekleri bir özet paneline sahip olmalıdır.
    Talep Detay Sayfası: Her bir talebin detay sayfasına girerek, talebin tüm durum değişikliklerini ve ilgili tarihleri kronolojik olarak görüntüleyebilirler.
    Durum Geçiş Bildirimleri: Talebin durumu "Beklemede"den "İnceleniyor"a, "İnceleniyor"dan "Onaylandı" veya "Reddedildi"ye geçtiğinde kullanıcıya otomatik olarak bildirim gönderilir.
    ## 1.3. Talep Durumu Yönetimi (Organizasyon Tarafında):

    Yönetim Paneli: Organizasyon yetkilileri, tüm yardım taleplerini mevcut durumlarına göre listeleyebilecekleri ve filtreleyebilecekleri bir yönetim paneline sahip olmalıdır.
    Durum Güncelleme: Yetkililer, her bir talebin durumunu sistem üzerinden kolayca güncelleyebilirler.
    Toplu İşlemler (Opsiyonel): Belirli kriterlere uyan birden fazla talebin durumunu aynı anda güncelleme imkanı sunulabilir.
    Durum Geçiş Logları: Her bir talep için durum değişikliklerinin ne zaman ve hangi yetkili tarafından yapıldığına dair bir kayıt tutulmalıdır.
    ## 1.4. Firebase Üzerinden Push Bildirim veya E-posta ile Bilgilendirme:

    Anlık Bildirimler (Push Notifications): Talep durumu değiştiğinde kullanıcının mobil cihazına anlık bildirim gönderilir. Bu, kullanıcının durumu hızlı bir şekilde öğrenmesini sağlar.
    Bildirim içeriği, talebin yeni durumu hakkında kısa ve öz bilgi içermelidir (örneğin, "Yardım talebiniz onaylandı!").
    Kullanıcıların bildirim tercihlerini yönetebilme imkanı sunulabilir.
    E-posta Bildirimleri: Push bildirimine ek olarak veya alternatif olarak, talep durumu değişiklikleri kullanıcının kayıtlı e-posta adresine de gönderilebilir.
    E-posta bildirimleri, push bildirimlerine göre daha detaylı bilgi içerebilir.
    E-posta gönderiminde gecikmeler yaşanabileceği göz önünde bulundurulmalıdır.
    Firebase Entegrasyonu: Uygulamanın Firebase Cloud Messaging (FCM) servisi ile entegrasyonu sağlanarak push bildirimleri gönderilir. E-posta gönderimi için ise Firebase Authentication veya harici bir e-posta servis sağlayıcısı (örneğin, SendGrid, Mailgun) kullanılabilir.
    Bildirim Şablonları: Farklı durum değişiklikleri için özelleştirilebilir bildirim şablonları oluşturulabilir.
    Teknik Detaylar ve Dikkat Edilmesi Gerekenler:

    Gerçek Zamanlı Güncelleme: Talep durumu güncellemelerinin hem kullanıcı hem de organizasyon tarafında mümkün olduğunca gerçek zamanlı yansıması önemlidir.
    Güvenlik: Talep bilgilerine yetkisiz erişimin engellenmesi için gerekli güvenlik önlemleri alınmalıdır.
    Ölçeklenebilirlik: Sistem, artan talep sayılarını ve kullanıcı yükünü kaldırabilecek şekilde tasarlanmalıdır.
    Kullanıcı Deneyimi: Talep takibi süreci kullanıcı dostu ve kolay anlaşılır olmalıdır.
    Bu detaylı inceleme, Yardım Talebi Takip Sistemi özelliğinin nasıl işleyeceği ve nelere dikkat edilmesi gerektiği konusunda daha net bir fikir sunmaktadır


### 2. Yardım Taleplerine Yorum ve Belge Ekleme
- Organizasyonlar ve kullanıcılar, yardım taleplerine ek bilgi veya not ekleyebilir.
- Talebe **tıbbi rapor, kimlik belgesi** gibi dosyalar yüklenebilir.

    ## 2.1. Yorum Ekleme:

    Kullanıcı Tarafında:
    Kullanıcılar, oluşturdukları yardım taleplerine ek bilgiler, açıklamalar veya taleplerindeki güncellemeleri yazılı olarak ekleyebilirler. Örneğin, "İlacımın dozu değişti", "Adresimde küçük bir değişiklik oldu" gibi.
    Yorumlar, talep detay sayfasında kronolojik bir sırayla görüntülenebilir, böylece tüm iletişim akışı kolayca takip edilebilir.
    Kullanıcılar, kendi ekledikleri yorumları düzenleyebilir veya silebilir (belirli bir süre içinde veya organizasyon tarafından henüz yanıtlanmamışsa gibi kısıtlamalar olabilir).
    Organizasyon Tarafında:
    Organizasyon yetkilileri, kullanıcının talebine doğrudan yorum yazarak soru sorabilir, ek bilgi talep edebilir veya talebin durumu hakkında bilgilendirme yapabilirler. Örneğin, "Lütfen doktor raporunuzun güncel halini yükleyebilir misiniz?", "Talebiniz değerlendirmeye alınmıştır." gibi.
    Organizasyon içindeki farklı yetkililer tarafından eklenen yorumlar, kimin yazdığını belirtecek şekilde (isim veya kullanıcı rolü) gösterilebilir.
    Organizasyon yetkilileri, gerekirse kullanıcı yorumlarına özel notlar ekleyebilir (sadece iç görünüm için).

    ## 2.2. Belge Ekleme:

    Kullanıcı Tarafında:
    Kullanıcılar, yardım taleplerini destekleyici çeşitli belgeleri (resim, PDF, Word vb.) sisteme yükleyebilirler. Bunlar tıbbi raporlar, kimlik belgeleri, ihtiyaç listeleri veya durumu açıklayıcı diğer dokümanlar olabilir.
    Yüklenebilecek dosya türleri ve boyutları sistem yöneticisi tarafından belirlenebilir.
    Kullanıcılar, yükledikleri belgeleri görüntüleyebilir ve gerekirse (henüz organizasyon tarafından incelenmemişse) silebilirler.
    Organizasyon Tarafında:
    Organizasyon yetkilileri, kullanıcı tarafından yüklenen belgeleri kolayca görüntüleyebilir ve indirebilirler.
    Organizasyon yetkilileri de talebe ek olarak belge yükleyebilirler. Örneğin, onay belgesi, sevk formu veya yardımın fotoğrafı gibi.
    Yüklenen belgelerin bir listesi ve önizlemesi talep detay sayfasında yer alabilir.
    Teknik Detaylar ve Dikkat Edilmesi Gerekenler:

    Güvenlik: Yüklenen belgelerin güvenliği ve gizliliği en önemli öncelik olmalıdır. Hassas kişisel verilerin korunması için gerekli şifreleme ve erişim kontrol mekanizmaları uygulanmalıdır.
    Bildirimler: Bir talebe yeni bir yorum veya belge eklendiğinde, ilgili kullanıcılara ve organizasyon yetkililerine (talep sahibi veya sorumlu kişi) bildirim gönderilmesi faydalı olabilir.
    Dosya Yönetimi: Yüklenen dosyaların düzenli bir şekilde saklanması, yedeklenmesi ve gerektiğinde kolayca erişilebilir olması için uygun bir dosya yönetim sistemi kurulmalıdır.
    Kullanıcı Deneyimi: Yorum ekleme ve belge yükleme süreçleri kullanıcı dostu ve sezgisel olmalıdır.
    Bu özellik, yardım taleplerinin daha şeffaf ve verimli bir şekilde yönetilmesine katkı sağlayacaktır. Kullanıcılar ihtiyaçlarını daha iyi ifade edebilirken, organizasyonlar da gerekli bilgilere daha kolay ulaşabilirler.

### 3. Yardım Haritası
- Kullanıcılar, **bulundukları bölgedeki aktif yardım merkezlerini** harita üzerinde görebilir.
- Organizasyonlar, yardım taleplerini harita üzerinde görüntüleyerek dağıtım planlaması yapabilir.
  Bu özellik, coğrafi konumu temel alarak kullanıcıları ve yardım organizasyonlarını birbirine yaklaştırmayı ve kaynakların daha etkin dağıtılmasını sağlamayı amaçlar. İşte bu özelliğin potansiyel ayrıntıları:

    ## 3.1. Kullanıcılar İçin Yardım Merkezi Görüntüleme:

    Konum Belirleme: Kullanıcılar, cihazlarının konum servislerini kullanarak veya manuel olarak adres girerek bulundukları bölgeyi harita üzerinde görebilirler.
    Aktif Yardım Merkezleri: Harita üzerinde, yakındaki aktif yardım merkezleri (organizasyonların fiziksel ofisleri, dağıtım noktaları, etkinlik alanları vb.) işaretlenir.
    Detay Bilgileri: Bir yardım merkezi işaretine tıklandığında, merkezin adı, adresi, iletişim bilgileri (telefon, e-posta), varsa çalışma saatleri ve sunduğu yardım türleri gibi temel bilgiler görüntülenebilir.
    Rota Çizme: Kullanıcılara, seçtikleri yardım merkezine harita üzerinden yol tarifi alma imkanı sunulabilir.
    Filtreleme: Kullanıcılar, ihtiyaçlarına göre harita üzerindeki yardım merkezlerini belirli kriterlere göre filtreleyebilirler. Örneğin, "gıda yardımı", "tıbbi destek", "giysi yardımı" gibi.
    Yakınlık Alarmı (Opsiyonel): Kullanıcılar, belirli bir yarıçap içindeki yeni açılan yardım merkezleri hakkında bildirim almayı tercih edebilirler.
    ## 3.2. Organizasyonlar İçin Yardım Talebi ve Dağıtım Planlama:

    Talep Konumları: Organizasyon yetkilileri, harita üzerinde bekleyen yardım taleplerinin coğrafi konumlarını görebilirler. Bu, ihtiyaç bölgelerini görselleştirmelerine yardımcı olur.
    Dağıtım Planlama: Organizasyonlar, harita üzerindeki yardım taleplerini ve kendi kaynaklarının (gönüllüler, araçlar, yardım malzemeleri) konumlarını görerek en verimli dağıtım rotalarını planlayabilirler.
    Bölge Bazlı Raporlama: Harita üzerinden belirli bölgelerdeki yardım talebi yoğunluğu veya dağıtım durumu hakkında görsel raporlar alabilirler.
    Gönüllü Atama: Organizasyonlar, harita üzerindeki gönüllülerin konumlarını görerek, belirli bir bölgedeki yardım faaliyetlerine en yakın gönüllüleri atayabilirler.
    Alan Tanımlama (Opsiyonel): Organizasyonlar, belirli hizmet bölgeleri tanımlayabilir ve bu bölgelerdeki yardım taleplerini ve kaynaklarını daha kolay yönetebilirler.
    Teknik Detaylar ve Dikkat Edilmesi Gerekenler:

    Harita Entegrasyonu: Google Maps, Mapbox veya Leaflet gibi güvenilir bir harita servis sağlayıcısı ile entegrasyon sağlanmalıdır.
    Konum Veri Güvenliği: Kullanıcıların konum verileri gizli tutulmalı ve yalnızca gerekli amaçlar için (yakındaki yardım merkezlerini göstermek gibi) kullanılmalıdır. Veri işleme süreçleri şeffaf olmalıdır.
    Gerçek Zamanlı Güncelleme: Yardım merkezlerinin ve talep konumlarının harita üzerinde mümkün olduğunca gerçek zamanlı güncellenmesi önemlidir.
    Performans: Harita üzerindeki çok sayıda işaretçinin performansı olumsuz etkilememesi için optimizasyon çalışmaları yapılmalıdır (kümeleme gibi teknikler kullanılabilir).
    Erişilebilirlik: Haritanın ve üzerindeki bilgilerin farklı cihazlarda ve ekran boyutlarında doğru şekilde görüntülenmesi sağlanmalıdır.




### 4. Gönüllü Kayıt ve Görev Dağıtımı
- Yardım organizasyonlarına **gönüllü kaydı** oluşturulabilir.
- Organizasyonlar, **gönüllülere görev atayabilir** (yardım paketi dağıtımı, tıbbi destek vb.).
    
   ### 4.1.  Gönüllü Kayıt:
    
    Kayıt Formu: Aday gönüllüler, ad-soyad, iletişim bilgileri, ilgi alanları (yardım türleri), yetenekleri (tıbbi, lojistik, idari vb.), müsaitlik durumları ve bulundukları konum gibi bilgileri içeren bir kayıt formu aracılığıyla sisteme kaydolabilirler.
    Profil Oluşturma: Kayıt sonrası gönüllüler, profillerini daha detaylı doldurabilir, fotoğraf ekleyebilir ve özgeçmişlerini yükleyebilirler.
    Doğrulama Süreci (Opsiyonel): Organizasyonlar, gönüllülerin bilgilerini (kimlik, referans vb.) doğrulama mekanizması uygulayabilirler.
    İletişim Tercihleri: Gönüllüler, hangi konularda ve hangi iletişim kanalı (e-posta, SMS, push bildirim) üzerinden bilgilendirme almak istediklerini belirleyebilirler.
    Gizlilik ve KVKK: Gönüllülerin kişisel verilerinin korunması için gerekli gizlilik politikaları ve KVKK (Kişisel Verileri Koruma Kanunu) uyumluluğu sağlanmalıdır.

    
    ### 4.2. Görev Oluşturma ve Atama:

    Görev Tanımlama: Organizasyon yetkilileri, gerçekleştirilmesi gereken görevleri (yardım paketi hazırlama, dağıtım, çağrı merkezi desteği, etkinlik organizasyonu vb.) detaylı olarak tanımlayabilirler. Bu tanımlar; görev adı, açıklaması, başlangıç ve bitiş tarihleri, konumu, ihtiyaç duyulan gönüllü sayısı, gerekli yetenekler ve varsa diğer özel gereksinimleri içerebilir.
    Gönüllü Arama ve Filtreleme: Organizasyonlar, görev için uygun gönüllüleri ilgi alanlarına, yeteneklerine, müsaitlik durumlarına ve konumlarına göre filtreleyebilir ve arayabilirler.
    Gönüllülere Görev Atama: Uygun gönüllülere sistem üzerinden görev ataması yapılabilir. Atama sırasında gönüllüye görev detayları ve ilgili diğer bilgiler iletilir.
    Görev Kabul/Reddetme: Gönüllüler, kendilerine atanan görevleri inceleyebilir ve kabul veya reddedebilirler.
    Otomatik Görev Önerileri (Opsiyonel): Sistem, gönüllülerin profillerine ve tercihlerine göre uygun görevleri otomatik olarak önerebilir.

    ### 4.3. Görev Takibi ve Yönetimi:

    Görev Durumu: Atanan görevlerin durumu (beklemede, kabul edildi, tamamlandı, iptal edildi vb.) sistem üzerinden takip edilebilir.
    Gönüllü Performansı (Opsiyonel): Tamamlanan görevler üzerinden gönüllülerin katılımı ve performansı hakkında (anonim veya genel) istatistikler tutulabilir.
    İletişim: Görevle ilgili gönüllüler ve organizasyon yetkilileri arasında sistem üzerinden doğrudan iletişim kurulabilir.
    Geri Bildirim: Tamamlanan görevler sonrası gönüllülere ve organizasyon yetkililerine birbirlerine geri bildirim verme imkanı sunulabilir.
    Teknik Detaylar ve Dikkat Edilmesi Gerekenler:

    Kullanıcı Rolleri ve Yetkilendirme: Gönüllülerin ve organizasyon yetkililerinin sistemdeki yetkileri farklı olmalıdır.
    Bildirimler: Yeni görev atamaları, görev durumu değişiklikleri ve görevle ilgili iletişimler hakkında ilgili gönüllülere ve organizasyon yetkililerine bildirimler gönderilmelidir.
    Takvim Entegrasyonu (Opsiyonel): Gönüllülerin müsaitlik durumlarını ve atanan görevleri kişisel takvimleriyle senkronize edebilme imkanı sunulabilir.
    Mobil Uygulama Entegrasyonu: Gönüllülerin görevleri mobil uygulamaları üzerinden görüntüleyebilmeleri ve yönetebilmeleri faydalı olabilir.
    Bu özellik, yardım organizasyonlarının gönüllü kaynaklarını daha etkin bir şekilde yönetmelerine ve gönüllülerin de yardım süreçlerine daha kolay dahil olmalarına olanak tanır.

### 5. Bağış ve Gönüllü Profili
- Kullanıcılar, **yaptıkları bağışları ve gönüllü faaliyetlerini** profillerinde takip edebilir.

    ### 5.1. Bağış Takibi:

    Bağış Geçmişi: Kullanıcılar, yaptıkları tüm bağışların (tarih, miktar, bağış yapılan alan/proje, ödeme yöntemi, bağış durumu) detaylı bir listesini profillerinde görüntüleyebilirler.
    Bağış Detayları: Her bir bağışın detay sayfasına tıklayarak daha fazla bilgiye (örneğin, bağış sertifikası indirilebilirliği) erişebilirler.
    Filtreleme ve Sıralama: Bağış geçmişini tarihe, miktara veya bağış yapılan alana göre filtreleyebilir ve sıralayabilirler.
    Bağış Özeti: Kullanıcının toplam bağış miktarı gibi özet bilgiler profilde gösterilebilir.
    Vergi Makbuzları (Opsiyonel): Yapılan bağışlara ait vergi makbuzları sistem üzerinden indirilebilir olabilir.
    
    
    ### 5.2. Gönüllü Faaliyetleri Takibi:

    Gönüllü Geçmişi: Kayıtlı gönüllüler, katıldıkları tüm gönüllü görevlerinin (görev adı, tarih, süre, görev durumu) bir listesini profillerinde görüntüleyebilirler.
    Görev Detayları: Her bir gönüllü görevinin detay sayfasına tıklayarak görev açıklamasına, organizasyon geri bildirimine (varsa) ve katılım sertifikasına (varsa) erişebilirler.
    Katılım İstatistikleri: Gönüllünün toplam gönüllülük süresi, katıldığı görev sayısı gibi istatistikler profilde gösterilebilir.
    İlgili Alanlar ve Yetenekler: Gönüllünün profilinde belirttiği ilgi alanları ve yetenekleri kolayca görüntülenebilir.
    Referanslar/Öneriler (Opsiyonel): Tamamlanan gönüllü görevleri sonrası organizasyon yetkilileri tarafından verilen referanslar veya öneriler profilde gösterilebilir.
    
    
    ### 5.3. Profil Yönetimi:

    Kişisel Bilgiler: Kullanıcılar, iletişim bilgileri, adresleri gibi kişisel bilgilerini güncelleyebilirler.
    Şifre Değiştirme: Kullanıcılar, hesap güvenlikleri için şifrelerini değiştirebilirler.
    Bildirim Ayarları: Kullanıcılar, hangi tür bildirimleri (bağış onayları, yeni görev önerileri vb.) almak istediklerini ayarlayabilirler.
    Gizlilik Ayarları: Kullanıcılar, profil bilgilerinin ne kadarının diğer kullanıcılara veya organizasyonlara görünür olacağını kontrol edebilirler.
    Hesap Silme: Kullanıcılara hesaplarını silme seçeneği sunulabilir (silme koşulları belirtilmelidir).
    Teknik Detaylar ve Dikkat Edilmesi Gerekenler:

    Veri Entegrasyonu: Bağış modülü ve gönüllü yönetim modülü ile sorunsuz bir entegrasyon sağlanmalıdır.
    Güvenlik: Kullanıcıların kişisel ve finansal verilerinin güvenliği en üst düzeyde sağlanmalıdır.
    Kullanıcı Deneyimi: Profil sayfaları kullanıcı dostu ve kolay anlaşılır olmalıdır.
    Bildirim Sistemi: Bağış ve gönüllü faaliyetleriyle ilgili önemli güncellemeler kullanıcılara zamanında bildirilmelidir.


### 6. Bağış Yönetim Sistemi (Yeni Modül)
- Bağış yapanlara **otomatik teşekkür mesajları** gönderilir.
- Bağışların **hangi alanlara kullanıldığı detaylı raporlarla gösterilir.**
- Bağış toplama ve takip işlemleri için özel modül.


    ### 6.1. Bağış Alma:

    Çoklu Ödeme Yöntemleri: Sistem, kredi kartı, banka havalesi, mobil ödeme, sanal POS gibi çeşitli online ve offline bağış yöntemlerini desteklemelidir.
    Tek Seferlik ve Düzenli Bağışlar: Kullanıcılara hem tek seferlik bağış yapma hem de aylık, yıllık gibi düzenli bağış talimatı verme imkanı sunulmalıdır.
    Bağış Kampanyaları: Farklı projeler veya ihtiyaçlar için özel bağış kampanyaları oluşturulabilir ve takip edilebilir. Her kampanya için hedef belirlenebilir ve ilerleme durumu gösterilebilir.
    Anonim Bağış Seçeneği: Kullanıcılara kimliklerini gizli tutarak bağış yapma seçeneği sunulmalıdır.
    Bağış Formları: Web sitesi ve mobil uygulamaya kolayca entegre edilebilecek özelleştirilebilir bağış formları oluşturulabilmelidir.
    QR Kod ile Bağış: Özellikle etkinliklerde veya saha çalışmalarında QR kod okutarak hızlı bağış yapma imkanı sunulabilir.

    ### 6.2. Bağış Takibi ve Yönetimi:

    Merkezi Veritabanı: Tüm bağışlar (bağışçı bilgileri, tarih, miktar, ödeme yöntemi, kampanya, bağış durumu vb.) merkezi bir veritabanında güvenli bir şekilde saklanmalıdır.
    Bağış Durumu Yönetimi: Bağışların durumu (beklemede, onaylandı, tamamlandı, iade edildi vb.) sistem üzerinden takip edilebilir.
    Otomatik Mutabakat: Banka hesapları ve ödeme sistemleriyle otomatik mutabakat sağlanarak manuel işlemleri azaltılabilir.
    Bağışçı Segmentasyonu: Bağışçılar, bağış sıklığı, miktarı, ilgi alanları gibi kriterlere göre segmentlere ayrılabilir. Bu, hedefli iletişim ve kampanyalar için önemlidir.
    
    ### 6.3. Otomatik Teşekkür Mesajları:

    Özelleştirilebilir Teşekkürler: Bağış yapıldıktan sonra bağışçıya otomatik olarak kişiselleştirilmiş teşekkür mesajları (e-posta veya SMS ile) gönderilmelidir. Bu mesajlar, bağış miktarı, bağış yapılan kampanya gibi bilgileri içerebilir.
    Farklı Bağış Türlerine Özel Teşekkürler: Tek seferlik ve düzenli bağışçılara farklı teşekkür mesajları gönderilebilir.
    Gecikmeli Teşekkürler (Opsiyonel): Belirli bir süre sonra veya kampanyanın sonunda ek teşekkür mesajları gönderilebilir.


    ### 6.4. Bağış Kullanım Raporları:

    Detaylı Raporlama: Toplanan bağışların hangi alanlarda (gıda, eğitim, sağlık vb.) ve hangi projelerde kullanıldığına dair detaylı ve şeffaf raporlar oluşturulabilmelidir.
    Görselleştirme: Raporlar, grafikler ve tablolar aracılığıyla kolay anlaşılır bir şekilde sunulmalıdır.
    Bağışçıya Özel Raporlar (Opsiyonel): Belirli bir miktarın üzerinde bağış yapan bağışçılara, bağışlarının somut etkilerini gösteren özel raporlar gönderilebilir.
    Düzenli Raporlama: Bağış kullanım raporları düzenli aralıklarla (aylık, üç aylık, yıllık) yayınlanabilir.
    Teknik Detaylar ve Dikkat Edilmesi Gerekenler:

    Güvenlik ve PCI DSS Uyumluluğu: Online ödeme işlemleri için en yüksek güvenlik standartları (PCI DSS) sağlanmalıdır.
    Entegrasyonlar: Mevcut muhasebe sistemleri ve diğer kurumsal yazılımlarla entegrasyon imkanı sunulmalıdır.
    Raporlama Araçları: Esnek ve özelleştirilebilir raporlama araçları ile farklı formatlarda (PDF, CSV vb.) raporlar oluşturulabilmelidir.
    Kullanıcı Rolleri ve Yetkilendirme: Bağış bilgilerine erişim ve işlem yapma yetkileri farklı kullanıcılara göre ayarlanabilmelidir.
    Denetlenebilirlik: Tüm bağış işlemleri ve sistemdeki değişiklikler denetlenebilir bir şekilde loglanmalıdır.


### 7. Mesajlaşma ve Kullanıcı Destek Sistemi
- Kullanıcılar ve organizasyonlar **doğrudan mesajlaşabilir**.
- Yardım talebiyle ilgili **SSS bölümü** bulunur.

      7. Mesajlaşma ve Kullanıcı Destek Sistemi
    Bu özellik, kullanıcılar ve organizasyonlar arasında doğrudan ve etkili iletişimi sağlamanın yanı sıra, kullanıcıların sıkça sorulan sorulara hızlıca yanıt bulabilmelerini amaçlar.

    ## 7.1. Doğrudan Mesajlaşma:

    Kullanıcı-Organizasyon Mesajlaşması: Yardım talep eden kullanıcılar, talepleriyle ilgili olarak doğrudan ilgili organizasyon yetkilileriyle mesajlaşabilirler. Bu, ek bilgi alışverişi, netleştirme veya durum güncellemeleri için kullanılabilir.
    Organizasyon İçi Mesajlaşma: Organizasyon yetkilileri kendi aralarında veya belirli gönüllü gruplarıyla görevler, planlamalar veya genel konular hakkında iletişim kurabilirler.
    Gerçek Zamanlı Bildirimler: Yeni mesajlar geldiğinde kullanıcılara ve organizasyon yetkililerine anlık bildirimler (push veya e-posta) gönderilmelidir.
    Mesaj Geçmişi: Tüm mesajlaşma geçmişi saklanmalı ve ilgili kişiler tarafından görüntülenebilmelidir.
    Dosya Paylaşımı (Opsiyonel): Mesajlaşma üzerinden belge veya görsel paylaşımı imkanı sunulabilir.
    Grup Mesajlaşması (Opsiyonel): Belirli bir yardım talebiyle ilgili olan kullanıcılar ve organizasyon yetkilileri arasında veya belirli gönüllü gruplarıyla grup sohbetleri oluşturulabilir.
    
    ## 7.2. Kullanıcı Destek Sistemi (SSS Bölümü):

    Kapsamlı SSS: Sıkça sorulan sorular ve cevapları (yardım talebi nasıl oluşturulur, bağış nasıl yapılır, gönüllü nasıl olunur vb.) kolayca erişilebilir bir SSS bölümünde toplanmalıdır.
    Kategorilendirme ve Arama: SSS bölümü konularına göre kategorilere ayrılmalı ve kullanıcıların anahtar kelimelerle arama yapabilmesine olanak tanınmalıdır.
    Görsel Materyaller (Opsiyonel): SSS cevaplarını desteklemek için resimler veya kısa videolar eklenebilir.
    Kullanıcı Geri Bildirimi: Kullanıcılardan SSS içeriği hakkında geri bildirim alınabilir (faydalı mıydı, eksik bilgi var mıydı gibi). Bu geri bildirimler SSS bölümünü sürekli iyileştirmek için kullanılabilir.
    İletişim Formu (Alternatif Destek): Kullanıcıların SSS bölümünde cevap bulamadıkları sorular için doğrudan organizasyona ulaşabilecekleri bir iletişim formu sunulabilir.
    Teknik Detaylar ve Dikkat Edilmesi Gerekenler:

    Kullanıcı Arayüzü: Mesajlaşma arayüzü kullanıcı dostu, sezgisel ve hızlı olmalıdır.
    Bildirim Sistemi Güvenilirliği: Bildirimlerin zamanında ve doğru kişilere ulaşması sağlanmalıdır.
    Veri Güvenliği: Mesaj içerikleri ve kullanıcı bilgileri güvenli bir şekilde saklanmalıdır.
    Moderasyon (Opsiyonel): Organizasyon yetkilileri için uygunsuz içerikleri veya spam mesajları filtreleme ve yönetme araçları sunulabilir.
    Mobil Uyumluluk: Mesajlaşma ve SSS bölümü mobil cihazlarda sorunsuz çalışmalıdır.
    Bu özellik, kullanıcıların sorularına hızlı yanıt bulmalarını sağlayarak destek yükünü azaltırken, doğrudan mesajlaşma imkanı sayesinde daha karmaşık durumlarda etkili iletişim kurulmasına olanak tanır.

### 8. Yardım Etkinlikleri (Kampanya Modülü Kaldırıldı)
- Organizasyonlar **etkinlikler** oluşturabilir.
- Kullanıcılar **etkinliklere katılım** sağlayabilir.
    ## 8.1. Etkinlik Oluşturma:

    Etkinlik Detayları: Organizasyon yetkilileri, etkinlik adı, açıklaması, tarihi, saati, konumu (harita üzerinde işaretleme imkanı), kontenjanı, katılım ücreti (varsa), iletişim bilgileri ve ilgili diğer detayları girebilirler.
    Etkinlik Türü: Etkinlikler farklı türlere (bağış etkinliği, gönüllü buluşması, seminer, farkındalık kampanyası vb.) ayrılabilir.
    Görsel ve Medya: Etkinliğe özel görseller (afiş, fotoğraf) ve videolar eklenebilir.
    Hedef Kitle: Etkinliğin hedef kitlesi (genel halk, gönüllüler, bağışçılar vb.) belirtilebilir.
    Kayıt Formu Özelleştirme (Opsiyonel): Etkinliğe özel kayıt formları oluşturulabilir ve katılımcılardan ek bilgiler talep edilebilir.

    ## 8.2. Etkinlik Listeleme ve Arama:

    Etkinlik Takvimi: Kullanıcılar, yaklaşan ve geçmiş etkinlikleri bir takvim görünümünde veya liste olarak görüntüleyebilirler.
    Filtreleme ve Arama: Etkinlikler tarihe, türe, konuma veya anahtar kelimelere göre filtrelenebilir ve aranabilir.
    Etkinlik Detay Sayfası: Her etkinliğin detaylı bilgilerini içeren bir sayfası olmalıdır. Bu sayfada etkinlik açıklaması, tarih, saat, konum, katılım koşulları, iletişim bilgileri ve kayıt/katılım butonu yer almalıdır.
    
    ## 8.3. Etkinliğe Katılım ve Yönetimi:

    Online Kayıt: Kullanıcılar, sistem üzerinden etkinliklere online olarak kayıt olabilirler. Kontenjan sınırlaması varsa, kayıtlar bu sınıra göre yönetilmelidir.
    Katılım Durumu: Kullanıcılar, kayıt oldukları etkinliklerin durumunu (beklemede, onaylandı, iptal edildi vb.) profillerinde takip edebilirler.
    Hatırlatma Bildirimleri: Kayıtlı kullanıcılara etkinlik öncesinde hatırlatma bildirimleri gönderilebilir.
    Katılımcı Listesi: Organizasyon yetkilileri, etkinliğe kayıt olan katılımcıların bir listesini görüntüleyebilir ve yönetebilirler.
    Katılım Onayı/Reddi: Organizasyonlar, kayıtları onaylayabilir veya reddedebilirler (kontenjan doluluğu veya diğer nedenlerle).
    QR Kod ile Katılım Kontrolü (Opsiyonel): Etkinlik günü katılımcıların kayıtlarını QR kod ile hızlıca kontrol etme imkanı sunulabilir.
    Geri Bildirim Toplama (Opsiyonel): Etkinlik sonrası katılımcılardan geri bildirim toplamak için anketler veya değerlendirme formları sunulabilir.
    Teknik Detaylar ve Dikkat Edilmesi Gerekenler:

    Harita Entegrasyonu: Etkinlik konumları harita üzerinde doğru bir şekilde işaretlenmelidir.
    Bildirim Sistemi: Etkinliklerle ilgili önemli güncellemeler ve hatırlatmalar kullanıcılara zamanında iletilmelidir.
    Ödeme Entegrasyonu (Ücretli Etkinlikler İçin): Eğer etkinlikler ücretliyse, güvenli online ödeme yöntemleri entegre edilmelidir.
    Kullanıcı Rolleri ve Yetkilendirme: Etkinlik oluşturma ve yönetme yetkileri organizasyon yetkilileriyle sınırlandırılmalıdır.
    Sosyal Medya Entegrasyonu: Etkinliklerin sosyal medya platformlarında kolayca paylaşılabilmesi sağlanabilir.
    Bu özellik, yardım kuruluşlarının farkındalık yaratma, gönüllü toplama ve bağış sağlama gibi amaçlarına yönelik etkinlikler düzenlemelerine ve daha geniş kitlelere ulaşmalarına yardımcı olacaktır.
    
### 9. Yardım Geçmişi ve Takibi
- Kullanıcılar ve organizasyonlar, **geçmişteki yardım taleplerini** görüntüleyebilir.

    ## 9.1. Kullanıcılar İçin Yardım Geçmişi:

    Talep Listesi: Kullanıcılar, daha önce oluşturdukları tüm yardım taleplerinin (tarih, talep türü, mevcut durum, sonuç) bir listesini profillerinde görüntüleyebilirler.
    Detay Sayfaları: Her bir geçmiş talebin detay sayfasına tıklayarak, talep açıklaması, eklenen belgeler, organizasyon yorumları, talep durumu değişiklikleri ve sonuç (onaylandıysa sağlanan yardımın detayları, reddedildiyse ret nedeni) gibi bilgilere erişebilirler.
    Filtreleme ve Sıralama: Kullanıcılar, geçmiş taleplerini tarihe, talep türüne veya duruma göre filtreleyebilir ve sıralayabilirler.
    ## 9.2. Organizasyonlar İçin Yardım Geçmişi ve Takibi:

    Kapsamlı Kayıt: Sistem, tüm yardım taleplerinin ve dağıtılan yardımların detaylı bir kaydını tutar. Bu kayıtlar; talep eden kullanıcı bilgileri, talep tarihi, talep türü, talep durumu, atanan gönüllü/personel, dağıtılan yardımın türü ve miktarı, dağıtım tarihi ve konumu gibi bilgileri içerir.
    Detaylı Arama ve Filtreleme: Organizasyon yetkilileri, yardım geçmişini çeşitli kriterlere göre (tarih aralığı, talep türü, kullanıcı, gönüllü, yardım türü, durum vb.) detaylı olarak arayabilir ve filtreleyebilirler.
    Raporlama ve Analiz: Bu geçmiş veriler, raporlama ve analiz modülü için önemli bir kaynak oluşturur. Örneğin, belirli bir dönemde yapılan toplam yardım sayısı, en çok talep edilen yardım türleri, ortalama işlem süresi gibi istatistikler elde edilebilir.
    Denetim ve Hesap Verebilirlik: Kapsamlı yardım geçmişi kayıtları, yapılan faaliyetlerin denetlenmesine ve hesap verebilirliğin sağlanmasına yardımcı olur.
    Tekrar Eden Taleplerin Tespiti (Opsiyonel): Sistem, aynı kullanıcıdan gelen benzer talepleri tespit ederek suiistimalleri önlemeye yardımcı olabilir.

    ## Teknik Detaylar ve Dikkat Edilmesi Gerekenler:

    Veritabanı Tasarımı: Yardım geçmişi verilerinin verimli bir şekilde saklanması ve sorgulanabilmesi için uygun bir veritabanı tasarımı yapılmalıdır.
    Performans: Büyük miktarda geçmiş verinin olduğu durumlarda bile sistemin hızlı ve sorunsuz çalışması sağlanmalıdır.
    Veri Güvenliği ve Gizliliği: Kullanıcı bilgileri ve yardım detayları güvenli bir şekilde saklanmalı ve yetkisiz erişime karşı korunmalıdır.
    Arşivleme (Opsiyonel): Belirli bir süreyi aşan geçmiş veriler için arşivleme mekanizmaları düşünülebilir.
    Kullanıcı Rolleri ve Yetkilendirme: Yardım geçmişi bilgilerine erişim yetkileri farklı kullanıcı rolleri için ayarlanmalıdır.
    Bu özellik, hem kullanıcıların geçmiş etkileşimlerini takip etmelerini sağlayarak şeffaflığı artırır, hem de organizasyonlara operasyonel verimlilik ve stratejik planlama için değerli bilgiler sunar.



### 10. Analitik ve Raporlama
- Organizasyonlar **yardım talebi ve dağıtımı ile ilgili detaylı raporlar** alabilir.
- Kullanıcılar, **bağışları ve gönüllü aktivitelerini görsel istatistiklerle** takip edebilir.

  Bu özellik, yardım organizasyonlarının topladıkları verileri anlamlandırmalarına, performanslarını ölçmelerine ve gelecekteki stratejilerini şekillendirmelerine yardımcı olacak çeşitli analizler ve raporlar sunmayı amaçlar. Kullanıcılar için ise bağış ve gönüllü aktivitelerinin görsel bir özetini sunarak katılımın etkisini görmelerini sağlar.

    ## 10.1. Organizasyonlar İçin Analitik ve Raporlama:

    Yardım Talebi Raporları:
    Toplam talep sayısı, yeni talep sayısı, tamamlanan talep sayısı, bekleyen talep sayısı gibi genel istatistikler.
    Talep türlerine göre dağılım (gıda, giysi, tıbbi yardım vb.).
    Talep yoğunluğu haritası (bölgelere göre talep sayısı).
    Ortalama talep işlem süresi.
    En çok talep edilen yardım türleri ve nedenleri.
    Talep karşılama oranları.
    Dağıtım Raporları:
    Dağıtılan yardım miktarları ve türleri.
    Dağıtım yapılan bölgeler.
    Dağıtım maliyetleri.
    Gönüllülerin dağıtım süreçlerindeki etkinliği.
    Bağış Raporları:
    Toplam bağış miktarı, yeni bağış sayısı.
    Bağış yöntemlerine göre dağılım.
    Bağış kampanyalarına göre performans.
    Düzenli bağışçı sayısı ve ortalama bağış miktarı.
    Bağışçı demografik bilgileri (anonimleştirilmiş olarak).
    Bağış trendleri (zaman içindeki değişimler).
    Gönüllü Raporları:
    Toplam gönüllü sayısı, aktif gönüllü sayısı.
    Gönüllülerin ilgi alanlarına ve yeteneklerine göre dağılım.
    Gönüllü katılım oranları (görev kabul/tamamlama).
    Gönüllülerin görev türlerine göre dağılımı.
    Gönüllülerin aktif olduğu bölgeler.
    Özelleştirilebilir Raporlar: Kullanıcıların kendi belirledikleri kriterlere göre özel raporlar oluşturabilme imkanı.
    Rapor Dışa Aktarma: Raporları farklı formatlarda (CSV, Excel, PDF vb.) dışa aktarabilme özelliği.
    Görselleştirme: Raporların grafikler, tablolar ve haritalar aracılığıyla görsel olarak sunulması.
    Dashboard: Önemli metriklerin ve özet bilgilerin kolayca görüntülenebileceği bir kontrol paneli.
    
    ## 10.2. Kullanıcılar İçin Görsel İstatistikler:

    Bağış Özeti: Toplam bağış miktarı, yapılan bağış sayısı gibi bilgilerin görsel grafikleri.
    Bağış Dağılımı: Bağışların farklı alanlara veya projelere göre dağılımını gösteren pasta grafikler veya çubuk grafikler.
    Gönüllü Katılım Özeti: Katılılan toplam görev sayısı, gönüllülük yapılan toplam süre gibi bilgilerin görsel sunumu.
    Zaman Çizelgesi: Bağış ve gönüllü aktivitelerinin zaman içindeki gelişimini gösteren bir çizelge.
    Teknik Detaylar ve Dikkat Edilmesi Gerekenler:

    Veri Toplama ve İşleme: Doğru ve güvenilir veri toplama mekanizmaları kurulmalı ve veriler etkili bir şekilde işlenmelidir.
    Veri Güvenliği ve Gizliliği: Analiz ve raporlama süreçlerinde kullanıcıların kişisel verilerinin gizliliği korunmalıdır.
    Performans: Büyük veri kümeleri üzerinde bile hızlı ve doğru analizler yapılabilmelidir.
    Kullanıcı Arayüzü: Raporlama araçları kullanıcı dostu ve kolay anlaşılır olmalıdır.
    Entegrasyon: Diğer modüllerden (bağış, talep, gönüllü yönetimi vb.) veri çekebilmelidir.
    Filtreleme ve Gruplama: Raporların farklı kriterlere göre filtrelenebilmesi ve gruplandırılabilmesi önemlidir.
    Bu özellik, yardım kuruluşlarının karar alma süreçlerini destekleyecek değerli bilgiler sunarken, kullanıcıların da katkılarının somut etkilerini görmelerini sağlayarak motivasyonlarını artıracaktır.

### 11. Paydaş Yönetimi (Yeni Modül)
- Organizasyonlar, paydaşlarını (bağışçılar, gönüllüler, partnerler vb.) yönetebilir.
- Paydaşlara **etiketler** atanabilir ve filtrelenebilir.
- Paydaşlar için **özel alanlar** tanımlanabilir ve yönetilebilir.
- Paydaş **etkileşim puanı** hesaplanabilir.
- Paydaşlar için **geçici silme (soft delete)** özelliği bulunur.

   ## 11.1. Paydaş Kaydı ve Profilleri:

    Paydaş Türleri: Sistemde farklı paydaş türleri (bireysel bağışçı, kurumsal bağışçı, gönüllü, partner kuruluş, medya temsilcisi vb.) tanımlanabilir.
    Detaylı Bilgiler: Her paydaş için iletişim bilgileri, ilgi alanları, etkileşim geçmişi, notlar ve diğer ilgili detaylar kaydedilebilir.
    Özel Alanlar: Her paydaş türüne özgü ek bilgi alanları tanımlanabilir (örneğin, kurumsal bağışçılar için sektör, yıllık bağış potansiyeli gibi).
    Belge Yönetimi: Paydaşlarla ilgili sözleşmeler, raporlar, sunumlar gibi belgeler paydaş profillerine yüklenebilir.
    ## 11.2. Etiketleme ve Filtreleme:

    Etiket Oluşturma: Paydaşlar, ilgi alanlarına, bağış sıklıklarına, katılım düzeylerine veya diğer önemli kriterlere göre etiketlenebilir.
    Gelişmiş Filtreleme: Etiketler ve diğer profil bilgileri kullanılarak paydaşlar detaylı bir şekilde filtrelenebilir (örneğin, "son 6 ayda 1000 TL üzeri bağış yapan bireysel bağışçılar").
    
    ## 11.3. Özel Alan Tanımlama ve Yönetimi:

    Özelleştirilebilir Alanlar: Organizasyonlar, kendi ihtiyaçlarına göre paydaş profillerine özel alanlar ekleyebilir ve bu alanları yönetebilirler. Bu, her paydaş türü için farklı önemli bilgileri takip etmeyi sağlar.
    
    
    ## 11.4. Etkileşim Puanı:

    Puanlama Sistemi: Paydaşların sisteme olan katkıları (bağış yapma, gönüllü görev alma, etkinliklere katılma vb.) belirli bir puanlama sistemine göre değerlendirilebilir.
    Etkileşim Seviyeleri: Etkileşim puanlarına göre paydaşlar farklı seviyelere ayrılabilir (örneğin, "platin bağışçı", "aktif gönüllü"). Bu, özel ilgi ve iletişim stratejileri geliştirmek için kullanılabilir.
    
    ## 11.5. Geçici Silme (Soft Delete):

    Geri Alınabilir Silme: Paydaş kayıtları kalıcı olarak silmek yerine geçici olarak silinebilir. Bu, yanlışlıkla silinen veya belirli bir süre sonra tekrar etkileşime geçilebilecek paydaşların verilerinin kaybolmasını önler. Geçici olarak silinen kayıtlar belirli bir süre sonra kalıcı olarak silinebilir.
    Teknik Detaylar ve Dikkat Edilmesi Gerekenler:

    Veritabanı Tasarımı: Paydaş bilgilerinin esnek ve verimli bir şekilde saklanabilmesi için uygun bir veritabanı yapısı oluşturulmalıdır.
    Gizlilik ve KVKK: Paydaşların kişisel verilerinin korunması için gerekli önlemler alınmalı ve KVKK uyumluluğu sağlanmalıdır.
    Raporlama: Paydaş verileri üzerinden çeşitli raporlar (örneğin, aktif bağışçı sayısı, gönüllü demografisi) oluşturulabilmelidir.
    Entegrasyon: Diğer modüllerle (bağış, gönüllü yönetimi, etkinlikler) sorunsuz entegrasyon sağlanmalıdır.
    Kullanıcı Rolleri ve Yetkilendirme: Paydaş bilgilerine erişim ve düzenleme yetkileri farklı kullanıcılara göre ayarlanabilmelidir.
    Bu modül, yardım kuruluşlarının paydaşlarıyla daha stratejik ve kişiselleştirilmiş ilişkiler kurmalarına, desteklerini artırmalarına ve uzun vadeli bağlılık oluşturmalarına yardımcı olacaktır.

### 12. Etkileşim Yönetimi (Yeni Modül)
- Paydaşlarla yapılan etkileşimlerin (toplantılar, e-postalar, aramalar) kaydı tutulabilir.
  Bu yeni modül, yardım kuruluşlarının paydaşlarıyla gerçekleştirdiği çeşitli etkileşimlerin (toplantılar, e-postalar, telefon görüşmeleri vb.) sistematik bir şekilde kaydedilmesini ve takip edilmesini sağlayarak iletişim süreçlerini iyileştirmeyi ve paydaş ilişkilerini güçlendirmeyi amaçlar.

    ## 12.1. Etkileşim Kaydı:

    Etkileşim Türleri: Sistemde farklı etkileşim türleri (toplantı, e-posta, telefon görüşmesi, etkinlik katılımı, gönderilen mektup vb.) tanımlanabilir.
    Etkileşim Detayları: Her etkileşim için tarih, saat, ilgili paydaş(lar), etkileşimi gerçekleştiren kullanıcı, özet, notlar, sonuçlar ve varsa ilgili belgeler kaydedilebilir.
    Hatırlatıcılar: Gelecekteki etkileşimler için hatırlatıcılar oluşturulabilir.
    Tekrarlayan Etkileşimler: Düzenli olarak gerçekleşen etkileşimler (örneğin, aylık bağışçı bilgilendirme e-postası) tanımlanabilir.
    ## 12.2. Paydaş Bazlı Etkileşim Geçmişi:

    Kapsamlı Geçmiş: Her paydaşın profilinde, kendisiyle gerçekleştirilen tüm etkileşimlerin kronolojik bir listesi görüntülenebilir. Bu, paydaşla olan ilişkinin geçmişini kolayca takip etmeyi sağlar.
    Filtreleme: Etkileşim geçmişi, etkileşim türüne, tarihe veya etkileşimi gerçekleştiren kullanıcıya göre filtrelenebilir.
    ## 12.3. Raporlama ve Analiz:

    Etkileşim İstatistikleri: Belirli bir dönemde gerçekleştirilen toplam etkileşim sayısı, etkileşim türlerine göre dağılım, en sık etkileşim kurulan paydaşlar gibi istatistikler elde edilebilir.
    Etkileşim Verimliliği: Farklı etkileşim türlerinin sonuçları analiz edilerek en etkili iletişim yöntemleri belirlenebilir.
    Paydaş Katılımı: Paydaşların etkileşimlere katılım düzeyleri takip edilebilir.
    Teknik Detaylar ve Dikkat Edilmesi Gerekenler:

    Entegrasyon: Paydaş Yönetimi modülü ile tam entegrasyon sağlanmalıdır.
    Kullanıcı Arayüzü: Etkileşim kaydı ve görüntüleme arayüzü kullanıcı dostu olmalıdır.
    Bildirimler: Hatırlatıcılar için zamanında bildirimler gönderilmelidir.
    Veri Güvenliği: Etkileşim bilgileri güvenli bir şekilde saklanmalıdır.
    Kullanıcı Rolleri ve Yetkilendirme: Etkileşim kaydı ve görüntüleme yetkileri farklı kullanıcılara göre ayarlanabilmelidir.
    Bu modül, yardım kuruluşlarının paydaşlarıyla olan iletişimini daha planlı ve verimli hale getirerek ilişkilerini güçlendirmelerine ve hedeflerine ulaşmalarına yardımcı olacaktır.


### 13. Görev Yönetimi (Yeni Modül)
- Organizasyon içinde veya gönüllülere yönelik görevler oluşturulabilir, atanabilir ve takip edilebilir.
- Görevler filtrelenebilir ve durumu yönetilebilir.
  Bu yeni modül, yardım organizasyonu içindeki personelin ve gönüllülerin görevlerini oluşturma, atama, takip etme ve yönetme süreçlerini merkezileştirerek iş akışını düzenlemeyi ve verimliliği artırmayı amaçlar.

    ## 13.1. Görev Oluşturma:

    Görev Tanımı: Görev adı, açıklaması, son tarih, öncelik seviyesi, ilgili proje/talep, atanacak kişi(ler) gibi detaylar belirtilebilir.
    Tekrarlayan Görevler: Düzenli olarak yapılması gereken görevler (örneğin, haftalık raporlama) tanımlanabilir.
    Alt Görevler: Büyük görevler daha küçük alt görevlere ayrılabilir ve her bir alt görev için ayrı sorumlular ve son tarihler belirlenebilir.
    Dosya Ekleme: Görevle ilgili dokümanlar, talimatlar veya diğer dosyalar göreve eklenebilir.
    ## 13.2. Görev Atama:

    Kullanıcı/Gönüllü Seçimi: Görevler, sistemdeki organizasyon personeline veya gönüllülere atanabilir.
    Birden Fazla Atanan: Bir göreve birden fazla kişi atanabilir.
    Bildirimler: Görev atandığında ilgili kullanıcılara/gönüllülere otomatik bildirimler gönderilir.
    ## 13.3. Görev Takibi:

    Görev Durumu: Görevlerin durumu (beklemede, devam ediyor, tamamlandı, iptal edildi) sistem üzerinden takip edilebilir.
    İlerleme Takibi: Görevlerin ne kadarının tamamlandığı görsel olarak takip edilebilir.
    Yorumlar ve Güncellemeler: Görevle ilgili ilerleme veya sorunlar hakkında yorumlar ve güncellemeler eklenebilir.
    Hatırlatıcılar: Görev son tarihlerine yaklaşıldığında veya gecikmelerde hatırlatıcı bildirimler gönderilebilir.
    ## 13.4. Görev Yönetimi:

    Görev Listeleme ve Görüntüleme: Tüm görevler veya kullanıcının/gönüllünün kendisine atanan görevler listelenebilir ve detayları görüntülenebilir.
    Filtreleme ve Sıralama: Görevler duruma, önceliğe, son tarihe, atanan kişiye veya ilgili projeye göre filtrelenebilir ve sıralanabilir.
    Takvim Görünümü: Görevler takvim üzerinde son tarihlerine göre görüntülenebilir.
    Teknik Detaylar ve Dikkat Edilmesi Gerekenler:

    Kullanıcı Rolleri ve Yetkilendirme: Görev oluşturma, atama ve yönetme yetkileri farklı kullanıcılara göre ayarlanabilmelidir.
    Bildirim Sistemi Güvenilirliği: Görevlerle ilgili bildirimlerin zamanında ve doğru kişilere ulaşması sağlanmalıdır.
    Entegrasyon: İlgili diğer modüllerle (yardım talepleri, etkinlikler, paydaş yönetimi) entegrasyon sağlanabilir.
    Raporlama: Tamamlanan görev sayısı, ortalama tamamlanma süresi, geciken görevler gibi konularda raporlar oluşturulabilir.
    Mobil Uyumluluk: Görevlerin mobil cihazlar üzerinden de görüntülenebilmesi ve yönetilebilmesi faydalı olabilir.
    Bu modül, yardım kuruluşlarının operasyonel süreçlerini daha iyi organize etmelerine, görev dağılımını etkinleştirmelerine ve genel verimliliklerini artırmalarına yardımcı olacaktır.
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
  │   ├─ casl/              # Yetkilendirme modülü
  │   ├─ custom-fields/     # Özel alanlar modülü (Yeni)
  │   ├─ dashboard/         # Gösterge paneli modülü
  │   ├─ donations/         # Bağış modülü (Yeni)
  │   ├─ donors/            # Bağışçılar modülü (Bağış modülü ile ilişkili olabilir, kontrol edilmeli)
  │   ├─ education/         # Eğitim materyalleri modülü
  │   ├─ faq/               # SSS modülü
  │   ├─ firebase/          # Firebase entegrasyonu
  │   ├─ history/           # Geçmiş kayıtlar modülü
  │   ├─ interactions/      # Etkileşim yönetimi modülü (Yeni)
  │   ├─ map/               # Harita ve konum modülü
  │   ├─ organizations/     # Organizasyonlar modülü
  │   ├─ prisma/            # Prisma servis modülü
  │   ├─ reports/           # Raporlama modülü
  │   ├─ security/          # Güvenlik modülü
  │   ├─ stakeholders/      # Paydaş yönetimi modülü (Yeni)
  │   ├─ tags/              # Etiketleme modülü (Yeni)
  │   ├─ tasks/             # Görev yönetimi modülü (Yeni)
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

- **Bağışlar (Yeni/Güncellenmiş)**
  - `POST /api/donations` - Bağış yapma
  - `GET /api/donations` - Bağışları listeleme
  - `GET /api/donations/statistics` - Bağış istatistiklerini görüntüleme
  // (Eski /api/donors/donations endpoint'leri buraya taşınmış olabilir)

- **Paydaşlar (Yeni)**
  - `GET /api/stakeholders` - Paydaşları listeleme (filtreleme ile)
  - `POST /api/stakeholders` - Yeni paydaş oluşturma
  - `GET /api/stakeholders/:id` - Belirli bir paydaşı görüntüleme
  - `PATCH /api/stakeholders/:id` - Paydaşı güncelleme
  - `DELETE /api/stakeholders/:id` - Paydaşı silme (soft delete)
  - `GET /api/stakeholders/:id/engagement-score` - Paydaş etkileşim puanını alma

- **Etkileşimler (Yeni)**
  - `POST /api/stakeholders/:stakeholderId/interactions` - Yeni etkileşim ekleme
  - `GET /api/stakeholders/:stakeholderId/interactions` - Paydaşın etkileşimlerini listeleme

- **Görevler (Yeni)**
  - `GET /api/tasks` - Görevleri listeleme (filtreleme ile)
  - `POST /api/tasks` - Yeni görev oluşturma
  - `GET /api/tasks/:id` - Belirli bir görevi görüntüleme
  - `PATCH /api/tasks/:id` - Görevi güncelleme
  - `DELETE /api/tasks/:id` - Görevi silme

- **Etiketler (Yeni)**
  - `POST /api/tags` - Yeni etiket oluşturma
  - `GET /api/tags` - Etiketleri listeleme
  - `POST /api/stakeholders/:stakeholderId/tags/:tagId` - Paydaşa etiket ekleme
  - `DELETE /api/stakeholders/:stakeholderId/tags/:tagId` - Paydaştan etiket kaldırma

- **Özel Alanlar (Yeni)**
  - `POST /api/custom-fields` - Yeni özel alan tanımı oluşturma
  - `GET /api/custom-fields` - Özel alan tanımlarını listeleme
  - `PATCH /api/custom-fields/:id` - Özel alan tanımını güncelleme
  - `DELETE /api/custom-fields/:id` - Özel alan tanımını silme
  - `POST /api/stakeholders/:stakeholderId/custom-fields` - Paydaşa özel alan değeri ekleme/güncelleme

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


