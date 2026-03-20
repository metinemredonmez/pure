# Olentia Pure — Sprint Progress & Proje Özeti

> **Son Güncelleme:** 2026-03-20
> **Repo:** https://github.com/metinemredonmez/pure
> **API:** http://localhost:4000/api
> **Swagger:** http://localhost:4000/api/docs
> **Tech Stack:** NestJS + Prisma 6 + PostgreSQL 16 + Redis + MinIO + RabbitMQ

---

## 📊 Genel Durum

| Metrik | Değer |
|--------|-------|
| Toplam Modül | **21** |
| Prisma Model | **65+** |
| API Endpoint | **140+** |
| Enum | **22+** |
| Sprint 0 | ✅ Tamamlandı |
| Sprint 0.5 | ✅ Tamamlandı |
| Sprint 1 | ✅ Tamamlandı |
| Sprint 1.5 (Ek) | ✅ Tamamlandı |

---

## ✅ Sprint 0: Foundation — TAMAMLANDI
**Tarih:** 2026-03-19

### Altyapı
- [x] Docker Compose (PostgreSQL 16, Redis 7, MinIO, RabbitMQ, MailHog)
- [x] NestJS scaffold + TypeScript strict config
- [x] Prisma 6 ORM + PostgreSQL schema (50+ tablo, 13 modül)
- [x] ENV config (tüm servisler, ödeme, push, SMTP)
- [x] Swagger/OpenAPI dokümantasyon (Olentia branding)
- [x] Health check endpoint (`/api/health`)
- [x] Git repo + GitHub push
- [x] `.gitignore` (hassas dosyalar hariç)

### Auth & Güvenlik
- [x] JWT Authentication (access 15dk + refresh 7gün + token rotation)
- [x] Google OAuth 2.0 (Passport.js strategy)
- [x] Apple OAuth (Passport.js strategy)
- [x] MFA/TOTP (QR code ile authenticator app — otplib v4)
- [x] RBAC: ADMIN, CUSTOMER, SALES, SUPPORT, PARTNER
- [x] Global guards: JWT, Roles, Rate Limiting (Throttler)
- [x] Global exception filter + response transformer interceptor
- [x] `@Public()`, `@Roles()`, `@CurrentUser()` decorators
- [x] HttpOnly cookie tabanlı JWT

### 10 Ana Modül
| # | Modül | Açıklama | Endpoints |
|---|-------|----------|-----------|
| 1 | **Identity** | Auth, OAuth, JWT, MFA, profil | 12 |
| 2 | **Catalog** | Ürünler, varyantlar, kategoriler, koleksiyonlar | 10 |
| 3 | **Cart** | Guest + auth sepet, merge logic, session ID | 5 |
| 4 | **Order** | Sipariş, durum takibi, kupon, KDV %20, kargo | 8 |
| 5 | **Payment** | PayTR, iyzico, Google Pay, Apple Pay, QR ödeme, webhook | 8 |
| 6 | **Subscription** | Planlar, döngüler, pause/resume/cancel, billing | 7 |
| 7 | **B2B** | Lead CRM, teklif, sözleşme, makine atama, pipeline | 10 |
| 8 | **CMS** | Blog CRUD, FAQ, SEO metadata | 8 |
| 9 | **Chatbot** | Kural tabanlı intent, Türkçe yanıtlar, session | 3 |
| 10 | **Notification** | SMTP email, template sistemi, loglar | 6 |

### Port Mapping (Docker — çakışma yok):
| Servis | Port | Not |
|--------|------|-----|
| PostgreSQL | 5434 | (VMS: 5432, Backend: 5433) |
| Redis | 6380 | (VMS: 6379) |
| MinIO | 9002/9003 | (VMS: 9000/9001) |
| RabbitMQ | 5673/15673 | |
| MailHog | 1025/8025 | |
| NestJS API | 4000 | |

---

## ✅ Sprint 0.5: Extended Features — TAMAMLANDI
**Tarih:** 2026-03-20

### 3 Yeni Modül
| # | Modül | Açıklama | Endpoints |
|---|-------|----------|-----------|
| 11 | **AI Service** | STT, TTS, Chatbox, Günlük Rapor, Analiz | Yapı hazır |
| 12 | **Partner Portal** | Dashboard, satış takip, harita, bölge analiz | 7 |
| 13 | **Loyalty** | Puan, tier, milestone, ödüller, tekrar alım analizi | 14 |

### AI Service (Modül 11)
- [x] Klasör yapısı ve README oluşturuldu
- [x] STT (Speech-to-Text) endpoint yapısı
- [x] TTS (Text-to-Speech) endpoint yapısı
- [x] Chatbox — sitenin sağından AI asistan
- [x] Günlük Rapor — sabah açılış modu (sesli rapor)
- [x] Google Maps entegrasyon planı
- [x] Webhook event sistemi planı
- [ ] OpenAI Whisper entegrasyonu (Phase 2)
- [ ] LangChain RAG entegrasyonu (Phase 2)

### Partner Portal (Modül 12)
- [x] Partner dashboard API (günlük/aylık metrikler, komisyon)
- [x] Partner satış CRUD (koordinat destekli — Google Maps)
- [x] Partner profil güncelleme (konum, bölge)
- [x] Admin: Tüm partnerlar listesi
- [x] Admin: Satış haritası (koordinatlı tüm satışlar)
- [x] Admin: Bölgesel performans analizi

### In-App Bildirim Sistemi
- [x] `InAppNotification` modeli (Prisma)
- [x] `GET /notifications` — kullanıcı bildirimleri (sayfalı)
- [x] `PATCH /notifications/:id/read` — okundu işaretle
- [x] `PATCH /notifications/read-all` — tümünü okundu yap
- [x] `POST /admin/notifications/send-inapp` — admin'den bildirim gönder
- [x] Event-based helpers: sipariş, ödeme, abonelik, stok uyarısı, B2B lead

### Loyalty / Sadakat Sistemi (Modül 13)
- [x] **Puan sistemi:** Her 1 TL = 1 puan (tier çarpanlı)
- [x] **4 Tier:** Bronze → Silver (500p) → Gold (1500p) → Platinum (4000p)
- [x] **Tier bonus:** Silver %20, Gold %50, Platinum 2x puan
- [x] **Abonelik bonus:** Abone siparişlerde %50 ekstra puan
- [x] **Milestone:** Her 10 siparişte ücretsiz kahve + 500 bonus puan
- [x] **Referral:** Arkadaş davet = 100 puan, davet edilen = 50 puan
- [x] **Puan harcama:** 10 puan = 1 TL indirim kuponu (min 100 puan)
- [x] **Ek puanlar:** Kayıt 25p, ilk sipariş 50p, yorum 25p, doğum günü 200p
- [x] **Tekrar satın alma analizi:** CLV, sipariş sıklığı, favori ürünler
- [x] **Admin:** İstatistikler, leaderboard, manuel puan, config yönetimi

---

## ✅ Sprint 1: Commerce MVP + Güvenlik — TAMAMLANDI
**Tarih:** 2026-03-20

### 6 Yeni Modül
| # | Modül | Açıklama | Endpoints |
|---|-------|----------|-----------|
| 14 | **User** | Adres CRUD, Wishlist, Profil | 12 |
| 15 | **Review** | Ürün yorumları, rating, admin onay | 10 |
| 16 | **Admin** | Dashboard KPIs, Kupon CRUD, Audit log | 15 |
| 17 | **GDPR** | Veri export, hesap silme, consent | 8 |
| 18 | **Pricing** | Kanal fiyatları, müşteri fiyat, hacim indirimi | 12 |
| 19 | **Common** | Redis, Encryption, Upload servisleri | - |

### Güvenlik (Security)
- [x] Şifre sıfırlama (token-based, 1 saat geçerlilik)
- [x] Email doğrulama (aktivasyon linki)
- [x] Brute-force koruması (5 başarısız = 30 dk kilitleme)
- [x] Helmet.js (HTTP security headers)
- [x] CORS whitelist
- [x] JWT blacklist (Redis tabanlı)
- [x] API key authentication
- [x] Webhook HMAC doğrulama
- [x] **CSRF koruması** (Double Submit Cookie pattern)
- [x] **XSS sanitization** (SanitizePipe — script, event handler, iframe temizleme)
- [x] **ClamAV virus scan** (upload öncesi otomatik tarama, graceful degradation)

### Dosya & Medya
- [x] MinIO upload servisi (S3-compatible)
- [x] Sharp image optimization (WebP, resize, thumbnail)
- [x] Presigned URL desteği (özel dosyalar)
- [x] MIME type validation
- [x] **ClamAV entegrasyonu** (virüs tarama, INSTREAM protokolü)

### Kullanıcı Özellikleri
- [x] Adres CRUD (`/users/me/addresses`)
- [x] Varsayılan adres seçimi
- [x] Wishlist/Favoriler (`/users/me/wishlist`)
- [x] Avatar yükleme (`/users/me/avatar`)
- [x] Profil güncelleme

### Review Sistemi
- [x] Ürün yorumları (1-5 yıldız rating)
- [x] Verified purchase badge
- [x] Helpful/Report işlevleri
- [x] Admin onay akışı
- [x] Otomatik avgRating güncelleme

### Admin Panel API
- [x] Dashboard KPIs (`/admin/dashboard`)
- [x] Gelir grafiği (günlük/aylık)
- [x] Top ürünler
- [x] Müşteri insights
- [x] Sipariş durumu dağılımı
- [x] Düşük stok uyarıları
- [x] Kupon CRUD (`/admin/coupons`)
- [x] Audit log (`/admin/audit-logs`)

### KVKK/GDPR Uyumluluk
- [x] Veri dışa aktarma (`/gdpr/export`)
- [x] Hesap silme — right to be forgotten (`/gdpr/delete-account`)
- [x] Consent yönetimi (`/gdpr/consent`)
- [x] Çerez tercihleri (`/gdpr/cookies`)
- [x] Gizlilik politikası kabul

### Fiyatlandırma Sistemi
- [x] Kanal bazlı fiyatlar (B2C, B2B, Subscription, Partner)
- [x] Müşteri özel fiyatları
- [x] Toplu alım indirimleri (hacim bazlı)
- [x] Fiyat değişiklik geçmişi
- [x] Abonelik fiyatlandırma

### Ödeme Altyapısı (Scaffolded)
- [x] PayTR iframe API yapısı
- [x] iyzico checkout form yapısı
- [x] Webhook handler'lar
- [x] QR/Google Pay/Apple Pay support

---

## ✅ Sprint 1.5 (Ek): Entegrasyonlar & Kargo — TAMAMLANDI
**Tarih:** 2026-03-20

### 3rd Party Entegrasyon Ayarları Sistemi
39 ayar, 9 grup, 18 şifreli alan — Admin panelden yönetilecek, DB'de tutulacak, AES-256 encrypted.

| Grup | Ayar Sayısı | Şifreli |
|------|-------------|---------|
| PAYMENT | 12 | 5 |
| MAP | 1 | 1 |
| EMAIL | 5 | 1 |
| NOTIFICATION | 4 | 2 |
| AI | 2 | 1 |
| AUTH | 7 | 3 |
| SHIPPING | 4 | 4 |
| ANALYTICS | 3 | 0 |
| WEBHOOK | 1 | 1 |
| **TOPLAM** | **39** | **18** |

- [x] `IntegrationSetting` Prisma modeli + enum
- [x] `IntegrationSettingsService` — CRUD, şifreleme, önbellekleme
- [x] Admin API (`/admin/settings/integrations`) — 8 endpoint
- [x] Seed defaults (39 ayar tanımı)
- [x] Test connection (email, payment)

### Kargo Modülü — 13 Endpoint

**Admin:**
- [x] `POST /admin/shipping/create` — Sipariş için kargo kaydı oluştur
- [x] `GET /admin/shipping/orders` — Kargoya verilecek siparişler
- [x] `PUT /admin/shipping/:orderId/ship` — Siparişi kargoya ver
- [x] `GET /admin/shipping/:orderId/label` — Kargo etiketi PDF
- [x] `POST /admin/shipping/:orderId/return` — İade kargo kaydı
- [x] `GET /admin/shipping/dashboard` — Kargo özet
- [x] `PUT /admin/shipping/settings` — Varsayılan ayarlar

**Kullanıcı:**
- [x] `GET /orders/:orderId/tracking` — Kargo takip
- [x] `GET /orders/:orderId/tracking/live` — Anlık durum (API'den)

**Webhook:**
- [x] `POST /webhooks/shipping/yurtici` — Yurtiçi webhook
- [x] `POST /webhooks/shipping/aras` — Aras webhook
- [x] `POST /webhooks/shipping/mng` — MNG webhook

**Public:**
- [x] `POST /shipping/calculate` — Dinamik kargo ücreti hesapla

### Prisma Modelleri (Kargo)
- [x] `ShipmentRecord` — Kargo kaydı (carrier, tracking, status, label)
- [x] `ShipmentStatusHistory` — Durum geçmişi
- [x] `ShippingZone` — Bölge/ücret tanımı
- [x] `ShippingSettings` — Varsayılan ayarlar

### Kargo Firması Entegrasyonları
- [x] **Yurtiçi Kargo** — `YurticiCarrier` (SOAP/REST)
- [x] **Aras Kargo** — `ArasCarrier` (REST)
- [x] **MNG Kargo** — `MngCarrier` (REST)

Her firma için: `createShipment`, `getStatus`, `getLabel`, `cancelShipment`, `createReturn`

### Güvenlik (Ek)
- [x] Apple OAuth strategy (`passport-apple`)
- [x] Brute-force guard (`LoginThrottleGuard`) — 5 başarısız = 30 dk kilitleme
- [x] JWT blacklist guard (Redis tabanlı)
- [x] API key guard (`@RequireApiKey()` decorator)
- [x] Webhook HMAC guard
- [x] Strong password validator (`@IsStrongPassword()`)
- [x] PayTR HMAC token generation (tam implementasyon)
- [x] iyzico checkout form (authorization header)
- [x] Refund API (PayTR iade endpoint)

### Cache Yönetimi
Admin panelden cache temizleme ve izleme:

- [x] `GET /admin/cache/stats` — Cache istatistikleri (key sayısı, bellek, uptime)
- [x] `GET /admin/cache/groups` — Mevcut cache grupları
- [x] `DELETE /admin/cache/flush-all` — Tüm cache temizle
- [x] `DELETE /admin/cache/:group` — Grup bazlı temizle
- [x] `POST /admin/cache/clear-multiple` — Birden fazla grup temizle
- [x] `POST /admin/cache/warm-up` — Cache ön yükleme

**9 Cache Grubu:**
| Grup | Prefix | Açıklama |
|------|--------|----------|
| products | `cache:products:*` | Ürün listesi, detay, fiyat |
| categories | `cache:categories:*` | Kategori ağacı |
| pricing | `cache:pricing:*` | Kanal fiyatları, hacim indirimi |
| settings | `cache:settings:*` | Integration settings |
| shipping | `cache:shipping:*` | Kargo bölgeleri, ücret |
| loyalty | `cache:loyalty:*` | Loyalty config, tier |
| cms | `cache:cms:*` | Blog, FAQ, SEO |
| dashboard | `cache:dashboard:*` | Admin dashboard KPI |
| sessions | `cache:sessions:*` | JWT blacklist, login |

### Cron Job Yönetimi
15 planlı job, BullMQ ile güvenilir iş işleme:

- [x] `GET /admin/cron/jobs` — Tüm jobları listele
- [x] `GET /admin/cron/jobs/:name` — Job detayı
- [x] `POST /admin/cron/jobs/:name/trigger` — Manuel tetikle
- [x] `PATCH /admin/cron/jobs/:name/toggle` — Aktif/pasif yap
- [x] `GET /admin/cron/jobs/:name/logs` — Job çalışma logları
- [x] `GET /admin/cron/logs` — Tüm loglar
- [x] `GET /admin/cron/definitions` — Job tanımları

**15 Planlı Job:**
| # | Job | Schedule | Açıklama |
|---|-----|----------|----------|
| 1 | cart-cleanup | Her 6 saat | 7 gün eski sepetleri sil |
| 2 | subscription-renewal | 03:00 | Abonelik yenileme |
| 3 | subscription-reminder | 09:00 | 3 gün kala hatırlatma |
| 4 | order-auto-complete | 02:00 | Teslim edilmiş siparişleri tamamla |
| 5 | loyalty-birthday | 08:00 | Doğum günü bonus puanı |
| 6 | loyalty-expiry | 01:00 | Süresi dolan puanları expire et |
| 7 | price-schedule | Her saat | Zamanlı fiyat güncellemeleri |
| 8 | stock-alert | Her 30 dk | Düşük stok bildirimi |
| 9 | dashboard-refresh | Her 15 dk | Dashboard KPI cache yenile |
| 10 | shipment-tracking | Her 2 saat | Kargo durumu güncelle |
| 11 | email-queue | Her 5 dk | Bekleyen e-postaları gönder |
| 12 | jwt-cleanup | 04:00 | JWT blacklist temizle |
| 13 | session-cleanup | 05:00 | Eski oturumları temizle |
| 14 | analytics-daily | 00:30 | Günlük analiz hesapla |
| 15 | b2b-lead-followup | 10:00 | B2B lead takip hatırlatması |

**Teknik:**
- [x] `@nestjs/schedule` — Cron zamanlama
- [x] `BullMQ` — Güvenilir job işleme (retry, backoff)
- [x] `CronJob` + `CronJobLog` Prisma modelleri
- [x] `OpsQueueProcessor` — 15 job processor

---

## 🔜 Sprint 2: Content & Communication — PLANLI
**Hedef:** İçerik yönetimi ve müşteri iletişimi

- [ ] Blog + SEO tam akış
- [ ] FAQ yönetimi
- [ ] Email template editörü (admin panelde)
- [ ] Firebase push notification entegrasyonu
- [ ] OneSignal web push entegrasyonu
- [ ] WebSocket (Socket.IO) — anlık in-app bildirimler
- [x] Kargo takip entegrasyonu (Yurtiçi/Aras/MNG API) ✅ Tamamlandı

---

## 🔜 Sprint 3: Subscription & B2B — PLANLI
**Hedef:** Abonelik otomasyonu ve B2B pipeline

- [ ] Subscription tam akış (otomatik ödeme + cycle + retry + iptal)
- [ ] B2B CRM pipeline kanban görünümü
- [ ] Quote PDF generation
- [ ] Contract management
- [ ] Machine assignment otomasyonu
- [ ] Fatura kesimi (e-Arşiv/e-Fatura entegrasyonu)

---

## 🔜 Sprint 4: AI & Analytics — PLANLI
**Hedef:** Yapay zeka ve analitik

- [ ] OpenAI Whisper STT entegrasyonu
- [ ] OpenAI TTS ses üretimi
- [ ] LangChain chatbox (RAG — ürün kataloğundan bilgi çekme)
- [ ] Doğal dil analiz sorgusu (SQL Agent)
- [ ] AI ürün önerisi (kişiselleştirilmiş)
- [ ] Müşteri segmentasyonu
- [ ] Tahminsel stok yönetimi
- [ ] Google Maps harita görselleştirme (partner + satış)
- [ ] Excel/PDF rapor export

---

## 🔜 Sprint 5: Mobile & Production — PLANLI
**Hedef:** Mobil uygulama ve canlıya çıkış

- [ ] React Native / Expo mobil uygulama
- [ ] CDN setup (Cloudflare)
- [ ] Performance optimization
- [ ] Load testing (k6/Artillery)
- [ ] KVKK/GDPR compliance (veri silme, export, onay)
- [ ] Audit log sistemi
- [ ] Production deployment (Hetzner — PM2)
- [ ] SSL + domain yapılandırma
- [ ] Monitoring (Sentry + Grafana)

---

## 🏗️ Teknik Mimari

```
pure/
├── docker-compose.yml          # Lokal altyapı
├── PROGRESS.md                 # Bu dosya
├── infra/
│   └── init.sql                # Schema oluşturma SQL
└── backend/
    ├── prisma/
    │   └── schema.prisma       # 50+ model, 15+ enum
    ├── src/
    │   ├── main.ts             # Bootstrap + Swagger
    │   ├── app.module.ts       # Root module (13 modül)
    │   ├── app.controller.ts   # Health check
    │   ├── config/
    │   │   └── configuration.ts
    │   ├── prisma/
    │   │   ├── prisma.module.ts
    │   │   └── prisma.service.ts
    │   ├── common/
    │   │   ├── decorators/      # @Public, @Roles, @CurrentUser
    │   │   ├── filters/         # GlobalExceptionFilter
    │   │   ├── interceptors/    # TransformInterceptor
    │   │   └── pipes/           # PaginationDto
    │   └── modules/
    │       ├── identity/        # Auth, OAuth, JWT, MFA
    │       ├── catalog/         # Products, variants
    │       ├── cart/            # Sepet
    │       ├── order/           # Sipariş
    │       ├── payment/         # Ödeme (5 yöntem)
    │       ├── subscription/    # Abonelik
    │       ├── b2b/             # B2B CRM
    │       ├── cms/             # Blog, FAQ, SEO
    │       ├── chatbot/         # AI chatbot
    │       ├── notification/    # Email + in-app
    │       ├── ai-service/      # STT, TTS, analiz
    │       ├── partner/         # Partner portal
    │       └── loyalty/         # Sadakat sistemi
    └── .env                    # Environment variables
```

---

## 📦 Ödeme Yöntemleri

| Yöntem | Tip | Durum |
|--------|-----|-------|
| PayTR | Kredi kartı (iframe) | ✅ Endpoint hazır |
| iyzico | Kredi kartı | ✅ Endpoint hazır |
| Google Pay | Mobil/Web | ✅ Endpoint hazır |
| Apple Pay | iOS/Safari | ✅ Endpoint hazır |
| QR Code | QR okutma ile ödeme | ✅ Endpoint hazır |

---

## 🏆 Loyalty Sistemi Özeti

| Özellik | Detay |
|---------|-------|
| Her 1 TL | 1 puan (tier çarpanlı) |
| Bronze | 0+ puan, 1x çarpan |
| Silver | 500+ puan, 1.2x çarpan |
| Gold | 1500+ puan, 1.5x çarpan |
| Platinum | 4000+ puan, 2x çarpan |
| Her 10 sipariş | Ücretsiz kahve + 500 puan |
| Abonelik | %50 ekstra puan |
| Referral | Davet eden 100p + davet edilen 50p |
| Harcama | 10 puan = 1 TL |
