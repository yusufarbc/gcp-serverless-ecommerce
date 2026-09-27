# MİMARİ VE OPERASYON ŞARTNAMESİ: GOOGLE EKOSİSTEMİ TABANLI AB D2C MOBİLYA E-TİCARET PLATFORMU

Bu doküman; Türkiye (Bursa/İnegöl) merkezli mobilya üretim kümelenmesinin, Avrupa Birliği ve Schengen bölgesine doğrudan tüketiciye (D2C) perakende satışı için tasarlanan uçtan uca sistem mimarisini kapsamaktadır. Altyapının tamamı Google ekosistemi üzerinde konumlandırılmış olup, "kullanılmadığında sıfıra inen" (Scale-to-Zero) sunucusuz (Serverless) servisler sayesinde aylık altyapı faturasını minimum düzeyde tutacak (FinOps odaklı) şekilde projelendirilmiştir.

---

## 1. Bütünleşik Sistem Topolojisi ve Uçtan Uca Veri Akışı

Platform; sunucusuz ön yüz, mikroservis API katmanı, ayrık veritabanı, birinci taraf izleme (server-side tracking) ve kurumsal Google ticari araçlarının tam entegrasyonu esasına dayanır.

```
                                      [ AB Tüketicisi (Mobil / Masaüstü) ]
                                                       │
                       ┌───────────────────────────────┴───────────────────────────────┐
                       │                                                               │
         (1. PWA & Dinamik SSR İstekleri)                                (2. Etiket & Rıza Veri Akışı)
                       │                                                               │
                       ▼                                                               ▼
           [ Firebase Hosting & CDN ]                                         [ Client-Side GTM ]
          (Anycast Edge Caching / SSL)                                       (Consent Mode v2 Katmanı)
                       │                                                               │
                       ├───────────────────────────────┐                               │ (First-Party HTTPS POST)
                       ▼                               ▼                               ▼
            [ Cloud Run: Storefront ]       [ Cloud Run: Core API ]         [ Cloud Run: Server-Side GTM ]
            (Next.js PWA / App Shell)       (MedusaJS E-Ticaret Motoru)     (ss.marka.com / Min-Instance: 0)
                       │                               │                               │
                       │ (Serverless VPC Access)       │                               ├──────────────────────────┐
                       ▼                               ▼                               ▼                          ▼
            [ Cloud Storage (GCS) ]         [ Cloud SQL: Postgres ]                 [ GA4 ]                 [ Google Ads ]
           (Görseller, 3D/AR Modeller)     (db-f1-micro / Frankfurt)         (BigQuery Streaming)      (Enhanced Conversions)
                       ▲                               │                               │                          ▲
                       │                               ▼                               ▼                          │
            [ Scheduled XML Feed ]          [ Cloud Tasks / Queues ]           [ BigQuery ML ] ───────────────┘
           (Merchant Center Beslemesi)     (Sipariş & Fatura Görevleri)        (Kitle Segmentasyonu / Looker)

```

---

## 2. Google Cloud Platform (GCP) Altyapı ve FinOps Mimarisi

Tüm altyapı bileşenleri, veri egemenliği ve AB Genel Veri Koruma Tüzüğü (GDPR) gereksinimleri ile düşük ağ gecikmesi hedefleri doğrultusunda **Frankfurt (`europe-west3`)** bölgesinde devreye alınır[cite: 71, 72, 73].

7/24 kesintisiz fatura üreten sabit sanal makineler (Compute Engine) veya küme yönetim ücreti bulunan Kubernetes (GKE) altyapıları yerine, tamamen istek başına maliyetlendirme (Pay-as-you-go) sunan sunucusuz GCP servisleri tercih edilmiştir.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        GCP PROJECT: mobilya-d2c-europe-prod                            │
│                        Region: europe-west3 (Frankfurt)                                │
├────────────────────────────────┬───────────────────────────────┬───────────────────────┤
│ 1. COMPUTE KATMANI             │ 2. VERİ VE DEPOLAMA           │ 3. AĞ, ASENKRON & GÜV.│
│ • Cloud Run: Storefront (UI)   │ • Cloud SQL: PostgreSQL       │ • Serverless VPC      │
│ • Cloud Run: Core API (Medusa) │ • Cloud Storage (GCS Standard)│ • Cloud Tasks         │
│ • Cloud Run: sGTM              │ • Secret Manager              │ • Cloud Scheduler     │
│ • Firebase Hosting & Cloud CDN │ • BigQuery (EU Multi-Region)  │ • Cloud DNS           │
└────────────────────────────────┴───────────────────────────────┴───────────────────────┘

```

### 2.1. Hesaplama Katmanı (Serverless Compute)

* **Storefront (Cloud Run):** Next.js tabanlı vitrin arayüzü.


* *Yapılandırma:* `min-instances: 0`, `max-instances: 5`, `memory: 512MiB`, `cpu: 1`, `concurrency: 80`.


* *FinOps Etkisi:* İstek gelmediği anlarda konteyner sıfıra iner. İlk 2 milyon istek, 360.000 vCPU-saniye ve 180 GB-RAM saniye GCP Free Tier kapsamındadır.




* **Core API & Backend (Cloud Run):** MedusaJS e-ticaret çekirdeği.


* *Yapılandırma:* `min-instances: 0`, `max-instances: 3`, `memory: 1GiB`, `cpu: 1`, `concurrency: 40`.


* *Rolü:* Sepet, sipariş, katalog, stok, AB içi dinamik vergi hesaplamaları ve Admin API servislerini tek bir mikro konteyner mimarisinde çalıştırır.




* **Server-Side GTM (Cloud Run):**
* *Yapılandırma:* Google'ın varsayılan 3 instance önerisi yerine `min-instances: 0`, `max-instances: 2` atanır. Gece saatlerinde sıfıra inerek gereksiz sabit ücret üretmesi engellenir.





### 2.2. Veri ve Depolama Katmanı

* **Cloud SQL for PostgreSQL:**
* *Maliyet Optimizasyonu:* Başlangıç fazında paylaşımlı tek çekirdekli `db-f1-micro` (0.6 GB RAM, 1 vCPU) seçilir (~8-10 $/ay).


* *Depolama Yapılandırması:* Otomatik depolama artışı sınırlandırılmış 10 GB SSD disk.


* *Ağ Güvenliği:* Genel IP (Public IP) kapatılır. Veritabanına yalnızca Cloud Run servisleri **Serverless VPC Access Connector** üzerinden özel IP (Private IP) ile erişir.




* **Cloud Storage (GCS - Standard):**
* Ürün katalog fotoğrafları, 3D artırılmış gerçeklik modelleri (`.usdz`, `.gltf`), montaj ve bakım PDF kılavuzları ile faturalar saklanır[cite: 1, 7, 73].
* Doğrudan Firebase Hosting / Cloud CDN arkasına yönlendirilir; böylece genel internete açık bucket okuma (read/egress) maliyeti bertaraf edilir.


* *Lifecycle Politikası:* Temp dizinleri 14 gün sonra, sistem yedekleri 30 gün sonra otomatik silinir; fatura arşivleri 90 gün sonra Coldline katmanına aktarılır.




* **Secret Manager:** Stripe/Mollie gizli anahtarları, DB bağlantı dizgileri ve JWT imzalama anahtarları güvenli şekilde saklanır. İlk 6 aktif gizli anahtar sürümü ücretsizdir.



### 2.3. Asenkron Entegrasyon ve Zamanlama Katmanı

* **Cloud Tasks:** Sepet terk uyarıları, fatura PDF üretimi, e-posta gönderimi ve uluslararası nakliye acentelerine (2-Man lojistik) API bildirimleri asenkron kuyruğa aktarılır[cite: 5, 7, 73]. Ayda ilk 1 milyon görev ücretsizdir.


* **Cloud Scheduler:** Her gece saat 03:00'te Medusa veritabanını tarayan ve Merchant Center için güncel `feed.xml` dosyasını Cloud Storage kovasına yazan işlevi tetikler. Ayda ilk 3 zamanlanmış görev ücretsizdir.


* **Cloud DNS:** Alan adının Anycast DNS yönlendirmelerini yönetir; yüksek hız ve DNSSEC koruması sağlar.



---

## 3. Ön Yüz (Storefront) ve Progressive Web App (PWA) Mimarisi

Ön yüz mimarisi Next.js (App Router) ile inşa edilir. Core Web Vitals performans metriklerini optimize etmek ve arama motorlarında taranabilirliği güvenceye almak için Hibrit Render (SSR + ISR) kullanılır.

### 3.1. Dizin ve Çok Dilli URL Mimarisi (Subdirectory)

Arama motoru otoritesini tek bir kök domain altında toplamak adına Subdirectory modeli uygulanır; ccTLD uzantıları (defansif tesciller) HTTP 301 yönlendirmesiyle bu dizinlere bağlanır:

* `[marka.com/de/](https://marka.com/de/)` : Almanya ve Avusturya (Almanca)


* `[marka.com/fr/](https://marka.com/fr/)` : Fransa ve Belçika (Fransızca)


* `[marka.com/nl/](https://marka.com/nl/)` : Hollanda ve Flandre (Felemenkçe)


* `[marka.com/en/](https://marka.com/en/)` : Varsayılan / Global (İngilizce)



Her sayfada hedef kitleye uygun `hreflang` etiketleri dinamik olarak basılır:

```html
<link rel="alternate" hreflang="de-DE" href="https://marka.com/de/koltuklar" />
<link rel="alternate" hreflang="de-AT" href="https://marka.com/at/koltuklar" />
<link rel="alternate" hreflang="fr-FR" href="https://marka.com/fr/canapes" />
<link rel="alternate" hreflang="nl-NL" href="https://marka.com/nl/banken" />
<link rel="alternate" hreflang="x-default" href="https://marka.com/en/sofas" />

```

### 3.2. PWA Dosya Yapısı ve Web App Manifest

Sitenin kök dizininde yerel uygulama hissi sunan yapılandırma dosyaları barındırılır:

```json
// public/manifest.json
{
  "name": "İnegöl Living Europe",
  "short_name": "İnegölLiving",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FFFFFF",
  "theme_color": "#111827",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "shortcuts": [
    {
      "name": "Kargo ve Montaj Takibi",
      "url": "/de/order-tracking",
      "icons": [{ "src": "/icons/tracking.png", "sizes": "96x96" }]
    },
    {
      "name": "3D Odanda Gör (AR)",
      "url": "/de/ar-experience",
      "icons": [{ "src": "/icons/ar.png", "sizes": "96x96" }]
    }
  ]
}

```

### 3.3. Service Worker Önbellekleme Stratejisi (`sw.js`)

PWA, GCP sunucu maliyetlerini düşürmek için tarayıcı düzeyinde katmanlı bir önbellekleme mimarisi işletir:

1. **Statik Dosyalar ve 3D Modeller (Cache-First):** CSS, JS paketleri, web fontları, ürün fotoğrafları ve `.usdz` / `.gltf` 3D dosyaları tarayıcının Cache Storage alanına yazılır. Tekrar eden ziyaretlerde sunucuya sıfır istek gider; GCP egress trafiği düşürülür.


2. **Katalog ve Ürün Detay Sayfaları (Stale-While-Revalidate):** Sayfa önbellekten anında açılırken arka planda Cloud Run'a hafif bir istek gönderilerek stok ve fiyat tazeliği doğrulanır.


3. **Sepet ve Ödeme Aşaması (Network-Only):** KDV hesaplama (Union OSS) ve ödeme adımları kesinlikle önbelleğe alınmaz.


4. **Çevrimdışı Desteği (Offline Fallback):** İnternet koptuğunda kullanıcıya beyaz ekran yerine şık tasarımlı `offline.html` gösterilir.

### 3.4. Firebase Cloud Messaging (FCM) ve TWA Desteği

* **Web Push Bildirimleri:** Firebase Cloud Messaging API üzerinden kullanıcıya tarayıcı kapalıyken dahi ücretsiz kilit ekranı bildirimleri gönderilir:


* "Mobilyanız dağıtıma çıktı: 2-Man taşıma ekibimiz 13:00 - 15:00 arasında adresinizde olacaktır."


* Terk edilmiş sepet kurtarma ve fiyat düşüş bildirimleri.


* **Google Play Store Entegrasyonu (TWA):** Sistem `assetlinks.json` doğrulamasıyla Trusted Web Activity formatında paketlenerek yerel kod yazılmadan Google Play Store'da resmi uygulama olarak yayınlanır. Bu durum DACH pazarındaki kurumsal güven skorunu pekiştirir.



---

## 4. Arka Yüz (Backend Core API) ve Admin Paneli

E-ticaret çekirdeği olarak headless mimari sunan açık kaynaklı **MedusaJS** konumlandırılmıştır. Cloud Run üzerinde tek bir konteyner olarak çalışır.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        MEDUSAJS E-TİCARET MOTORU                       │
├────────────────────────┬───────────────────────┬───────────────────────┤
│ 1. ÜRÜN & REGÜLASYON   │ 2. LOJİSTİK & OPERASYON│ 3. VERGİ & BÖLGE (OSS)│
│ • GTİP / HS (Fasıl 94) │ • 2-Man Handling API  │ • Dinamik KDV Motoru  │
│ • EUDR GPS Parsel Veri │ • A.TR / Çeki Listesi │ • One-Stop Shop (OSS) │
│ • 3D/AR Medya Yönetimi │ • Parsiyel Koli & Desi│ • Tersine Lojistik/RMA│
└────────────────────────┴───────────────────────┴───────────────────────┘

```

### 4.1. Mobilyaya Özel Katalog ve Veritabanı Modülleri

* **GTİP / HS Sınıflandırması:** Her ürün için Armonize Sistem Fasıl 94 kodları (Oturma grupları için 9401, ahşap mobilyalar için 9403) veritabanı şemasına zorunlu alan olarak tanımlanır.


* **EUDR (Ormansızlaşma) Uyumluluk Modülü:** Tüzük (AB) 2023/1115 uyarınca, masif ahşap içeren ürünlerin kesildiği orman parsellerinin coğrafi koordinatları (GPS çokgenleri) ve TRACES NT referans numarası ürün meta verisinde saklanır.


* **Çoklu Koli ve Desi Ayrımı:** Bir yatak odası takımının tekil barkod yerine kaç parçadan oluştuğu (Koli 1: Başlık, Koli 2: Baza, Koli 3: Hırdavat) ve her kolinin brüt kg/cm ebatları tanımlanır.



### 4.2. Sipariş, Lojistik ve Gümrük Motoru

* **Gümrük Evrak Üretimi:** Sipariş tamamlandığında A.TR Dolaşım Belgesi başvuru taslağı, Menşe Beyanlı Ticari Fatura ve uluslararası taşımaya uygun Çeki Listesi (Packing List) tek tıkla PDF olarak Cloud Storage'da oluşturulur[cite: 1, 7, 73].
* **Son Kilometre (2-Man Handling) API Entegrasyonu:** DACH ve Fransa bölgesinde kata teslim ve montaj yapan lojistik sağlayıcıların (Rhenus, Dachser) API'lerine sipariş verileri, kat bilgisi ve asansör durumu anlık olarak aktarılır.



### 4.3. Vergi (Union OSS) ve Tersine Lojistik Yönetimi

* **Dinamik AB KDV Motoru:** Direktif 2006/112/EC uyarınca, sepet tutarı müşterinin ikamet ettiği ülkenin KDV oranına (Almanya: %19, Fransa: %20, Belçika: %21 vb.) göre dinamik hesaplanır. Her çeyrekte tek tıkla **Union OSS Beyanname Raporu** üretilir.


* **İade ve B-Stock Tasfiye Modülü:** 2011/83/EU Tüketici Hakları Direktifi uyarınca açılan 14 günlük yasal iade taleplerinde ürün Türkiye'ye geri çağrılmaz. Panel, ürünü doğrudan AB içindeki anlaşmalı tasfiye/konsolidasyon deposuna yönlendirir; ürün durumuna göre (Grade A/B) sitenin "Outlet / B-Ware" vitrininde indirimli olarak yeniden listelenmesini sağlar.



### 4.4. Yasal Uyumluluk Alanları (AB Standartları)

* **Omnibus Direktifi:** İndirimli ürünlerde son 30 gün içinde uygulanan en düşük fiyat (`lowest_price_30_days`) PDP üzerinde şeffaf olarak gösterilir.


* **GPSR Sorumlu Kişi:** Tüzük (AB) 2023/988 gereğince AB içinde yerleşik yetkili temsilcinin (EU Responsible Person) unvan ve tebligat adresi ürün kartında yer alır.


* **Tahmini İade Masrafı Bildirimi:** Alman BGB § 357(5) uyarınca hacimli nakliye ürünlerinin azami iade taşıma maliyeti tüketiciye sözleşme öncesinde bildirilir.



---

## 5. Veri Güvenliği, Rıza ve Ölçümleme Altyapısı

Modern gizlilik regülasyonları (GDPR / ePrivacy) ve üçüncü taraf çerez kısıtlamaları kapsamında birinci taraf (first-party) veri mimarisi işletilir[cite: 2, 73].

```
[ Tüketici Tarayıcısı ] ──► [ IAB TCF 2.2 Uyumlu CMP Banner ]
                                         │
        ┌────────────────────────────────┴────────────────────────────────┐
        │ (Kullanıcı Rızası Verildi: Granted)                             │ (Rıza Reddedildi: Denied)
        ▼                                                                 ▼
[ Data Layer E-Ticaret Nesnesi ]                                 [ Çerezsiz Sinyaller ]
        │                                                        (Cookieless Pings)
        ▼                                                                 │
[ Client-Side GTM ] ──► (HTTPS POST: ss.marka.com) ───────────────────────┤
                                                                          ▼
                                                       [ Server-Side GTM (Cloud Run) ]
                                                                          │
                                         ┌────────────────────────────────┼────────────────────────────────┐
                                         ▼                                ▼                                ▼
                              [ SHA-256 Hashleme ]              [ Google Analytics 4 ]           [ BigQuery Export ]
                                         │                                │                        (Ham Veri Deposu)
                                         ▼                                ▼                                │
                              [ Google Ads API ] ◄─────────────────────────────────────────────────────────┘
                            (Enhanced Conversions)                   (RFM & Kitle Modelleri)

```

### 5.1. Data Layer Şeması (Satın Alma Olayı)

Satın alma tamamlandığında tetiklenen standart veri katmanı:

```javascript
window.dataLayer = window.dataLayer || [];
dataLayer.push({ ecommerce: null });
dataLayer.push({
  event: "purchase",
  ecommerce: {
    transaction_id: "ORD_EU_2026_1042",
    value: 2450.00,
    tax: 391.18,
    shipping: 120.00,
    currency: "EUR",
    coupon: "MOBILYA2026",
    items: [
      {
        item_id: "ING-KLTK-001",
        item_name: "İnegöl Masif 3'lü Koltuk",
        item_brand: "MarkaAdı",
        item_category: "Mobilya",
        item_category2: "Oturma Odası",
        item_variant: "Keten Bej",
        price: 2450.00,
        quantity: 1
      }
    ]
  },
  user_data: {
    email: "hans.mueller@example.de",
    phone_number: "+491701234567",
    address: {
      first_name: "Hans",
      last_name: "Müller",
      city: "Frankfurt",
      postal_code: "60311",
      country: "DE"
    }
  }
});

```

### 5.2. Consent Mode v2 Konfigürasyonu

Sayfa ilk yüklendiğinde diğer tüm script'lerden önce varsayılan izin durumunu `denied` olarak başlatan mimari kod bloğu:

```javascript
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  'ad_storage': 'denied',
  'analytics_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied',
  'wait_for_update': 500
});

```

Kullanıcı CMP banner'ı üzerinden onay verdiğinde durum `granted` olarak güncellenir ve GTM etiketleri tetiklenir.

### 5.3. Server-Side GTM ve Gelişmiş Dönüşümler (Enhanced Conversions)

* İstemci izleme istekleri doğrudan `ss.marka.com` birinci taraf alt alan adına gönderilir.


* Cloud Run üzerindeki sGTM, gelen `user_data` nesnesi içindeki müşteri e-posta ve telefon bilgilerini sunucu belleğinde **SHA-256 algoritmasıyla tek yönlü şifreler (hash)**.


* Şifrelenmiş veri doğrudan Google Ads Conversion API'ye gönderilerek reklam atıf doğruluğu en üst düzeye çıkarılır.



### 5.4. GA4 ve BigQuery Ham Veri Entegrasyonu

* GA4 verileri yerel entegrasyonla GCP BigQuery'ye bağlanır.


* Her gün `analytics_<property_id>` tablosuna dökülen ham veriler üzerinden Looker Studio panolarında brüt kâr, iade düşülmüş net ROAS ve kampanya performans analizleri yürütülür.



---

## 6. Ticari Entegrasyon, Arama ve Reklam Motoru

Google yüzeylerinde görünürlük, ürün kataloğunun semantik kalitesi ve reklam algoritmalarının beslenmesiyle sağlanır.

```
                     ┌──────────────────────────────────────────────┐
                     │           MEDUSA E-TİCARET MOTORU            │
                     └──────────────────────┬───────────────────────┘
                                            │
                       (Cloud Scheduler: Her Gece 03:00)
                                            │
                                            ▼
                     ┌──────────────────────────────────────────────┐
                     │          CLOUD STORAGE: feed.xml             │
                     └──────────────────────┬───────────────────────┘
                                            │
                        (Scheduled Fetch: XML Beslemesi)
                                            │
                                            ▼
                     ┌──────────────────────────────────────────────┐
                     │         GOOGLE MERCHANT CENTER NEXT          │
                     └──────────────┬────────────────┬──────────────┘
                                    │                │
                 (Hesap Bağlantısı) │                │ (Organik Tıklamalar)
                                    ▼                ▼
     ┌───────────────────────────────────┐      ┌───────────────────────────────────┐
     │            GOOGLE ADS             │      │       NEXT.JS STOREFRONT          │
     │ • Performance Max (PMax)          │      │    (Product Schema JSON-LD)       │
     │ • Değer Temelli Teklifleme (tROAS)│      └─────────────────┬─────────────────┘
     └───────────────────────────────────┘                        │
                                                                  ▼
                                                ┌───────────────────────────────────┐
                                                │      SEARCH CONSOLE (GSC)         │
                                                │   (Merchant Listings Denetimi)    │
                                                └───────────────────────────────────┘

```

### 6.1. Google Merchant Center Next (GMC) ve Veri Akışı

* **XML Feed Mimarisi:** Cloud Storage'da barındırılan XML akışı Merchant Center Next'e "Scheduled Fetch" ile bağlanır. Mobilya için akışta şu öznitelikler eksiksiz yer alır[cite: 2, 73]:


* `id`, `title`, `description`, `link`, `image_link`, `price`, `availability`.


* `brand`, `gtin` (EAN-13 barkodu), `mpn`.


* `shipping_weight` ve `shipping_length/width/height` (Hacimli lojistik hesaplama için).


* `transit_time_label` (Ülke bazlı teslimat süresi etiketi).




* **Ücretsiz Ürün Listelemeleri (Free Listings):** Reklam harcaması olmaksızın Google Alışveriş sekmesinde, Görsellerde ve Google Lens aramalarında organik listeleme elde edilir.


* **Top Quality Store Programı:** Açık iade şartları, şeffaf nakliye tarifeleri ve sitede Google Pay/PayPal ödeme seçeneklerinin bulunması sayesinde mağaza güven rozeti kazanır[cite: 22, 50, 73].

### 6.2. Google Ads Kampanya Mimarisi

* **Performance Max (PMax):** Arama, Alışveriş, YouTube, Haritalar ve Keşfet ağlarını tek çatı altında birleştirir. Yüksek çözünürlüklü oda görselleri, kumaş dokusu yakın çekimleri ve YouTube Shorts dikey videoları zengin varlık grupları (Asset Groups) olarak tanımlanır.


* **Değer Temelli Teklifleme (Value-Based Bidding):** Google Ads algoritması, sGTM'den gelen sepet tutarlarını okuyarak salt tıklama veya sipariş adedi yerine **Hedef ROAS (tROAS)** optimizasyonuyla yüksek cirolu mobilya satışlarına odaklanır.



### 6.3. Search Console ve Yapılandırılmış Veriler (Schema JSON-LD)

Next.js vitrini, ürün detay sayfalarının sunucu çıktısına (SSR) Schema.org standartlarında JSON-LD etiketlerini doğrudan basar:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "İnegöl Masif Ahşap Yemek Masası",
  "image": "https://storage.googleapis.com/marka-media/masa-1.webp",
  "description": "FSC sertifikalı meşe ağacından üretilen masif yemek masası.",
  "sku": "ING-MASA-002",
  "gtin13": "8680001234567",
  "brand": {
    "@type": "Brand",
    "name": "MarkaAdı"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://marka.com/de/yemek-masasi",
    "priceCurrency": "EUR",
    "price": "1290.00",
    "priceValidUntil": "2026-12-31",
    "itemCondition": "https://schema.org/NewCondition",
    "availability": "https://schema.org/InStock",
    "hasMerchantReturnPolicy": {
      "@type": "MerchantReturnPolicy",
      "applicableCountry": "DE",
      "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
      "merchantReturnDays": 14,
      "returnMethod": "https://schema.org/ReturnByMail"
    }
  }
}
</script>

```

---

## 7. Ödeme Sistemleri ve Google Pay Mimarisi

Google Pay Web API, hassas kart verilerini satıcının sunucularına temas ettirmeden şifreleyen bir cüzdan (tokenizasyon) katmanıdır. Tahsilat işlemini gerçekleştirmek üzere lisanslı bir Ödeme Hizmeti Sağlayıcısı (PSP: Stripe veya Mollie) ile entegre edilir.

```
[ Müşteri ] ── (Google Pay Butonu Tıklanır) ──> [ Google Pay Web API: isReadyToPay() ]
                                                                 │
                                                                 ▼
[ Şifreli Ödeme Belirteci (Token) ] <─────────── [ Biyometrik Onay ve Kart Seçimi ]
                 │
                 ▼
┌────────────────────────────────────────────────────────────────┐
│      LİSANSLI ÖDEME AĞ GEÇİDİ (PSP: Stripe / Mollie)           │
└────────────────────────────────┬───────────────────────────────┘
                                 │
     ┌───────────────────────────┼───────────────────────────────┐
     ▼                           ▼                               ▼
[ Uluslararası Kartlar ]    [ Bölgesel Ödeme Metotları ]   [ Sonradan Öde (BNPL) ]
 (Visa, Mastercard vb.)      (Hollanda: iDEAL,              (Klarna, PayPal)
                              Belçika: Bancontact)

```

### 7.1. İstemci Tarafı Google Pay Entegrasyonu

```javascript
// Google Pay İstemci Tanımlaması
const paymentsClient = new google.payments.api.PaymentsClient({
  environment: 'PRODUCTION'
});

const baseRequest = {
  apiVersion: 2,
  apiVersionMinor: 0
};

const tokenizationSpecification = {
  type: 'PAYMENT_GATEWAY',
  parameters: {
    'gateway': 'stripe',
    'stripe:version': '2024-06-20',
    'stripe:publishableKey': 'pk_live_...'
  }
};

const allowedCardPaymentMethods = [{
  type: 'CARD',
  parameters: {
    allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
    allowedCardNetworks: ['MASTERCARD', 'VISA']
  },
  tokenizationSpecification: tokenizationSpecification
}];

// Cüzdan Uyumluluk Kontrolü ve Buton Çıkarma
paymentsClient.isReadyToPay(Object.assign({}, baseRequest, {
  allowedPaymentMethods: allowedCardPaymentMethods
})).then(function(response) {
  if (response.result) {
    const button = paymentsClient.createButton({
      buttonColor: 'black',
      buttonType: 'buy',
      onClick: onGooglePaymentButtonClicked
    });
    document.getElementById('gpay-container').appendChild(button);
  }
});

```

### 7.2. AB Bölgesel Ödeme Yöntemleri

Mobilyada sepet terk oranlarını engellemek adına tekil PSP üzerinden şu yöntemler aktif edilir:

* **iDEAL (Hollanda):** Hollanda e-ticaret ödemelerinin %60'ından fazlasını oluşturur.
* **Bancontact (Belçika):** Belçika pazarında en yaygın banka kartı altyapısıdır.
* **Klarna (Pay Later & Slice It):** Yüksek sepet tutarlı mobilya alışverişlerinde tüketiciye 30 gün sonra ödeme veya 3 taksit imkânı sunarak dönüşüm oranını yükseltir.
* **PayPal:** Almanya ve Avusturya tüketicilerinin birincil tercihidir; sitede bağımsız ekspres ödeme butonu olarak sunulur.



---

## 8. Google Workspace Operasyonel Orkestrasyonu

Google Workspace; operasyonel iş akışlarını, kurumsal iletişimi ve yasal arşivleme süreçlerini merkezi bir yapıda konsolide eder.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        GOOGLE WORKSPACE ORKESTRASYON MERKEZİ                           │
├────────────────────────┬───────────────────────────────┬───────────────────────────────┤
│ 1. GMAIL & KURUMSAL DNS│ 2. E-TABLOLAR & APPS SCRIPT   │ 3. GOOGLE DRIVE & VAULT       │
│ • support@marka.com    │ • Atölye Stoklarını Otomatik  │ • A.TR Dolaşım Belgeleri      │
│ • info@marka.com       │   XML Kataloğuna Dönüştürme   │ • EUDR GPS Parsel Arşivi      │
│ • SPF, DKIM, DMARC     │ • Cloud Tasks ile Sipariş     │ • REACH & EN 12520 Testleri   │
│   Tam Güvenlik Uyum    │   Senkronizasyon Satırları    │ • 10 Yıl Yasal Saklama        │
└────────────────────────┴───────────────────────────────┴───────────────────────────────┘

```

### 8.1. E-Posta Güvenliği ve Teslim Edilebilirlik

Müşteri sipariş onaylarının, faturaların ve destek yazışmalarının spam filtrelerine takılmasını önlemek adına Cloud DNS üzerinde şu kayıtlar tanımlanır:

* **SPF Kaydı:** `v=spf1 include:_spf.google.com ~all`
* **DKIM İmzası:** Google Workspace paneli üzerinden üretilen 2048-bit TXT anahtarı DNS'e işlenir.
* **DMARC Politikası:** Yetkisiz alan adı kullanımını ve sahte e-postaları engellemek için: `v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@marka.com; pct=100; adkim=s; aspf=s`

### 8.2. Tedarikçi Entegrasyonu ve Apps Script Otomasyonu

* İnegöl atölyelerindeki fason üreticilerden gelen haftalık stok ve hammadde listeleri Google Drive üzerinde paylaşılan Ortak Sürücüye (Shared Drives) yüklenir[cite: 3, 6, 73].
* E-Tabloya bağlı bir **Google Apps Script** otomasyonu çalışarak ürünlerin fiyatlarını Euro paritesine çevirir, para birimini günceller ve Merchant Center için standart JSON formatında dışa aktarır.



### 8.3. Google Vault ve Regülasyon Dokümantasyonu

* **EUDR ve GPSR Yasal Arşivi:** Orman Genel Müdürlüğü tahsis evrakları, FSC sertifikaları, EN 12520 mukavemet test raporları ve REACH formaldehit laboratuvar analizleri Google Drive'da saklanır.


* **Google Vault:** İhracat faturaları ve gümrük beyannameleri olası bir AB mali denetimine karşı silinmeye karşı korumalı (Legal Hold) olarak 10 yıl yasal süre boyunca arşivlenir.



---

## 9. FinOps Maliyet Matrisi ve Bütçe Simülasyonu

Sistem, düşük ve orta ölçekli başlangıç hacminde (aylık 15.000 – 30.000 tekil ziyaretçi, ~50-100 mobilya siparişi) minimum faturayı garanti eder:

| Bileşen / Servis | Kapasite / Fiyatlandırma Modeli | Tahmini Aylık Maliyet |
| --- | --- | --- |
| **Cloud Run: Storefront** | Next.js PWA, Scale-to-Zero (Free Tier kotasında)

 | $0.00 – $1.50

 |
| **Cloud Run: Medusa API** | Node.js Core API, Scale-to-Zero

 | $0.00 – $2.00

 |
| **Cloud Run: sGTM** | Server Tag Manager, Min-instances: 0

 | $0.00 – $1.00

 |
| **Cloud SQL: PostgreSQL** | `db-f1-micro` paylaşımlı instance (7/24 Aktif)

 | ~$8.50 – $10.00

 |
| **Cloud Storage** | 20 GB Görsel, 3D Medya ve Fatura Depolama

 | ~$0.40

 |
| **Firebase Hosting / CDN** | Global Edge Önbellek (Aylık 10 GB altı ücretsiz)

 | $0.00

 |
| **Serverless VPC Access** | Cloud SQL özel bağlantısı (Mikro throughput)

 | ~$2.00 – $3.00 |
| **Cloud Tasks & Scheduler** | Asenkron kuyruk ve zamanlanmış XML üretimi

 | $0.00 (İlk 1M görev bedelsiz)

 |
| **Secret Manager & DNS** | 5 Gizli anahtar ve Cloud DNS bölgesi

 | ~$0.60 |
| **BigQuery + GA4** | Ham etkinlik loglama (10 GB depolama / 1 TB sorgu bedelsiz) | $0.00 |
| **Google Workspace** | 1 Kullanıcı Business Starter lisansı (~6 €/ay)

 | ~$6.50

 |
| **GMC, Ads, GTM, GA4** | Google Ticari ve Analitik Platform Kullanımı

 | $0.00

 |
| **TOPLAM SABİT BULUT GİDERİ** | **GCP Sunucusuz Altyapı + Workspace Lisansı** | **~$18.00 – $25.00 / Ay** |

*(Not: Satış başına ödenen Stripe/Mollie komisyonları ve Google Ads tıklama bütçeleri doğrudan satış hacmine bağlı operasyonel değişken giderlerdir).*

---

## 10. Adım Adım Dağıtım ve Canlıya Alma Rehberi

Tüm platformun sıfırdan canlıya alınması için takip edilecek terminal ve yapılandırma adımları:

### Adım 1: GCP Ortamının Hazırlanması ve Servislerin Açılması

```bash
# Proje seçimi ve gerekli API'lerin aktif edilmesi
gcloud config set project mobilya-d2c-europe-prod
gcloud services enable \
  run.googleapis.com \
  sqladmin.googleapis.com \
  storage.googleapis.com \
  secretmanager.googleapis.com \
  cloudtasks.googleapis.com \
  cloudscheduler.googleapis.com \
  vpcaccess.googleapis.com \
  dns.googleapis.com

```

### Adım 2: Serverless Ağ ve Cloud SQL Veritabanı Kurulumu

```bash
# Serverless VPC Access Bağlayıcısının oluşturulması
gcloud compute networks vpc-access connectors create serverless-vpc-connector \
  --region=europe-west3 \
  --range=10.8.0.0/28 \
  --network=default

# Cloud SQL PostgreSQL db-f1-micro instance kurulumu
gcloud sql instances create mobilya-db-instance \
  --database-version=POSTGRES_16 \
  --tier=db-f1-micro \
  --region=europe-west3 \
  --no-assign-ip \
  --network=projects/mobilya-d2c-europe-prod/global/networks/default \
  --storage-size=10GB \
  --storage-auto-increase=false

```

### Adım 3: MedusaJS Core API Konteynerinin Dağıtılması

```bash
# Cloud Run üzerine MedusaJS API'nin dağıtılması (Scale-to-Zero)
gcloud run deploy medusa-core-api \
  --image=europe-west3-docker.pkg.dev/mobilya-d2c-europe-prod/apps/medusa-backend:latest \
  --region=europe-west3 \
  --platform=managed \
  --allow-unauthenticated \
  --vpc-connector=serverless-vpc-connector \
  --set-env-vars="NODE_ENV=production,PORT=9000" \
  --set-secrets="DATABASE_URL=DATABASE_URL_SECRET:latest,JWT_SECRET=JWT_SECRET:latest" \
  --min-instances=0 \
  --max-instances=3 \
  --memory=1Gi \
  --cpu=1 \
  --concurrency=40

```

### Adım 4: Next.js PWA Vitrin ve Firebase Hosting Dağıtımı

```bash
# Storefront uygulamasının Cloud Run'a dağıtımı
gcloud run deploy storefront-pwa \
  --image=europe-west3-docker.pkg.dev/mobilya-d2c-europe-prod/apps/nextjs-storefront:latest \
  --region=europe-west3 \
  --platform=managed \
  --allow-unauthenticated \
  --min-instances=0 \
  --max-instances=5 \
  --memory=512Mi \
  --cpu=1 \
  --concurrency=80

# Firebase CLI ile Cloud CDN & Edge yönlendirmesi
firebase deploy --only hosting

```

### Adım 5: Server-Side GTM ve Alan Adı Bağlantısı

1. Google Tag Manager paneli üzerinden bir "Server Container" oluşturulur.
2. Üretilen kapsayıcı yapılandırma kodu (Container Config) kopyalanır.
3. Cloud Run üzerinde `min-instances: 0` parametresiyle sGTM konteyneri ayağa kaldırılır:

```bash
gcloud run deploy sgtm-container \
  --image=gcr.io/cloud-tagging-102307/gtm-cloud-image:latest \
  --region=europe-west3 \
  --platform=managed \
  --allow-unauthenticated \
  --set-env-vars="CONTAINER_CONFIG=GTM-XXXXXX,PORT=8080" \
  --min-instances=0 \
  --max-instances=2 \
  --memory=512Mi

```

4. Cloud DNS üzerinde `ss.marka.com` için bir CNAME kaydı açılarak bu Cloud Run servisine yönlendirilir.

Bu mimari kurgu sayesinde; Türkiye'den Avrupa Birliği'ne yönelik perakende mobilya satışı, katı AB mevzuatlarına (GDPR, GPSR, EUDR, Omnibus) tam uyumlu, endüstriyel standartta güvenli ve trafiğin olmadığı anlarda maliyeti sıfırlayan kurumsal bir yapıda çalıştırılmaktadır[cite: 1, 4, 73].