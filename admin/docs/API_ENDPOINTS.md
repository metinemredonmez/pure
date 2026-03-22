# Olentia Backend API Endpoints

Base URL: `http://localhost:3000/api`

---

## Identity (Auth)

| Method | Route | Auth | Açıklama |
|--------|-------|------|----------|
| POST | `/auth/register` | Public | Kayıt |
| POST | `/auth/login` | Public | Giriş |
| POST | `/auth/refresh` | Public | Token yenileme |
| POST | `/auth/logout` | User | Çıkış |
| POST | `/auth/forgot-password` | Public | Şifre sıfırlama |
| POST | `/auth/reset-password` | Public | Şifre güncelle |
| POST | `/auth/change-password` | User | Şifre değiştir |
| GET | `/auth/me` | User | Profil |
| POST | `/auth/mfa/setup` | User | MFA kurulum |
| POST | `/auth/mfa/enable` | User | MFA aktifle |
| POST | `/auth/mfa/disable` | User | MFA kapat |

---

## Products

| Method | Route | Auth | Açıklama |
|--------|-------|------|----------|
| GET | `/products` | Public | Ürün listesi |
| GET | `/products/:slug` | Public | Ürün detay |
| POST | `/admin/products` | Admin | Ürün oluştur |
| PUT | `/admin/products/:id` | Admin | Ürün güncelle |
| DELETE | `/admin/products/:id` | Admin | Ürün sil |
| POST | `/admin/products/:id/variants` | Admin | Varyant ekle |
| GET | `/categories` | Public | Kategori listesi |
| POST | `/admin/categories` | Admin | Kategori oluştur |
| GET | `/collections` | Public | Koleksiyon listesi |
| POST | `/admin/collections` | Admin | Koleksiyon oluştur |

---

## Cart

| Method | Route | Auth | Açıklama |
|--------|-------|------|----------|
| GET | `/cart` | User | Sepet getir |
| POST | `/cart/items` | User | Ürün ekle |
| PATCH | `/cart/items/:id` | User | Miktar güncelle |
| DELETE | `/cart/items/:id` | User | Ürün sil |
| POST | `/cart/merge` | User | Sepet birleştir |

---

## Orders

| Method | Route | Auth | Açıklama |
|--------|-------|------|----------|
| POST | `/orders` | User | Sipariş oluştur |
| GET | `/orders` | User | Siparişlerim |
| GET | `/orders/:id` | User | Sipariş detay |
| GET | `/admin/orders` | Admin | Tüm siparişler |
| PATCH | `/admin/orders/:id/status` | Admin | Durum güncelle |

---

## Payment

| Method | Route | Auth | Açıklama |
|--------|-------|------|----------|
| POST | `/checkout/session` | User | Ödeme başlat |
| POST | `/checkout/google-pay` | User | Google Pay |
| POST | `/checkout/apple-pay` | User | Apple Pay |
| POST | `/webhooks/paytr` | Public | PayTR webhook |
| POST | `/webhooks/iyzico` | Public | iyzico webhook |
| POST | `/admin/payments/:id/refund` | Admin | İade |

---

## Subscription

| Method | Route | Auth | Açıklama |
|--------|-------|------|----------|
| GET | `/subscription/plans` | Public | Plan listesi |
| POST | `/subscriptions` | User | Abone ol |
| GET | `/subscriptions` | User | Aboneliklerim |
| GET | `/subscriptions/:id` | User | Detay |
| POST | `/subscriptions/:id/change-plan` | User | Plan değiştir |
| DELETE | `/subscriptions/:id/pending-plan` | User | Değişiklik iptal |
| POST | `/subscriptions/:id/payment-method` | User | Kart güncelle |
| POST | `/subscriptions/:id/grind` | User | Öğütme değiştir |
| POST | `/subscriptions/:id/pause` | User | Duraklat |
| POST | `/subscriptions/:id/resume` | User | Devam |
| POST | `/subscriptions/:id/cancel` | User | İptal |
| GET | `/admin/subscriptions` | Admin | Tüm abonelikler |
| GET | `/admin/subscriptions/stats` | Admin | MRR/ARR istatistik |

---

## Reviews

| Method | Route | Auth | Açıklama |
|--------|-------|------|----------|
| GET | `/products/:productId/reviews` | Public | Ürün yorumları |
| GET | `/products/:productId/reviews/stats` | Public | Yorum istatistikleri |
| POST | `/products/:productId/reviews` | User | Yorum yaz |
| PUT | `/reviews/:id` | User | Yorum güncelle |
| DELETE | `/reviews/:id` | User | Yorum sil |
| GET | `/users/me/reviews` | User | Yorumlarım |
| POST | `/reviews/:id/helpful` | User | Faydalı bul |
| POST | `/reviews/:id/report` | User | Şikayet et |
| GET | `/admin/reviews` | Admin | Tüm yorumlar |
| PUT | `/admin/reviews/:id/approve` | Admin | Onayla/Reddet |

---

## Loyalty

| Method | Route | Auth | Açıklama |
|--------|-------|------|----------|
| GET | `/loyalty/account` | User | Puan bakiyesi |
| POST | `/loyalty/activate` | User | Programı aktifle |
| GET | `/loyalty/history` | User | Puan geçmişi |
| GET | `/loyalty/rewards` | User | Ödüller |
| POST | `/loyalty/redeem` | User | Puan kullan |
| POST | `/loyalty/rewards/:id/claim` | User | Ödül al |
| GET | `/loyalty/repurchase` | User | Yeniden satın al önerileri |
| GET | `/admin/loyalty/stats` | Admin | İstatistikler |
| GET | `/admin/loyalty/leaderboard` | Admin | Liderlik tablosu |
| POST | `/admin/loyalty/adjust` | Admin | Puan düzelt |
| GET | `/admin/loyalty/config` | Admin | Ayarlar |
| POST | `/admin/loyalty/config` | Admin | Ayar güncelle |
| GET | `/admin/loyalty/users/:userId` | Admin | Kullanıcı detay |
| GET | `/admin/loyalty/users/:userId/repurchase` | Admin | Kullanıcı önerileri |

---

## Notification

| Method | Route | Auth | Açıklama |
|--------|-------|------|----------|
| GET | `/notifications` | User | Bildirimlerim |
| PATCH | `/notifications/:id/read` | User | Okundu |
| PATCH | `/notifications/read-all` | User | Hepsini oku |
| POST | `/admin/notifications/send` | Admin | Email gönder |
| POST | `/admin/notifications/send-template` | Admin | Template ile gönder |
| POST | `/admin/notifications/send-inapp` | Admin | In-app bildirim |
| GET | `/admin/notifications/templates` | Admin | Template listesi |
| POST | `/admin/notifications/templates` | Admin | Template oluştur |
| PUT | `/admin/notifications/templates/:id` | Admin | Template güncelle |
| GET | `/admin/notifications/logs` | Admin | Gönderim logları |

---

## Chatbot

| Method | Route | Auth | Açıklama |
|--------|-------|------|----------|
| POST | `/chatbot/message` | Public/User | Mesaj gönder |
| GET | `/chatbot/history` | User | Sohbet geçmişi |
| GET | `/admin/chatbot/sessions` | Admin | Tüm oturumlar |
| GET | `/admin/chatbot/sessions/:sessionId` | Admin | Oturum detay |

---

## CMS

| Method | Route | Auth | Açıklama |
|--------|-------|------|----------|
| GET | `/blog/posts` | Public | Blog listesi |
| GET | `/blog/posts/:slug` | Public | Blog detay |
| GET | `/faq` | Public | SSS listesi |
| GET | `/admin/blog/posts` | Admin | Admin blog listesi |
| POST | `/admin/blog/posts` | Admin | Blog oluştur |
| PUT | `/admin/blog/posts/:id` | Admin | Blog güncelle |
| DELETE | `/admin/blog/posts/:id` | Admin | Blog sil |
| POST | `/admin/faq` | Admin | SSS ekle |
| PUT | `/admin/seo/:pagePath` | Admin | SEO güncelle |

---

## GDPR

| Method | Route | Auth | Açıklama |
|--------|-------|------|----------|
| POST | `/gdpr/consent` | User | Onay güncelle |
| GET | `/gdpr/consents` | User | Onay durumu |
| POST | `/gdpr/export-data` | User | Veri indir |
| DELETE | `/gdpr/delete-account` | User | Hesap sil |
| POST | `/gdpr/cookie-consent` | Public | Çerez tercihi |

---

## AI Service

| Method | Route | Auth | Açıklama |
|--------|-------|------|----------|
| POST | `/ai/stt/transcribe` | User | Speech-to-text |
| POST | `/ai/tts/synthesize` | User | Text-to-speech |
| GET | `/ai/tts/voices` | User | Ses listesi |
| POST | `/ai/chat` | User | AI chat |
| GET | `/ai/chat/history/:sessionId` | User | Chat geçmişi |
| GET | `/ai/analysis/daily-report` | Admin | Günlük rapor |
| GET | `/ai/analysis/voice-report` | Admin | Sesli rapor |
| POST | `/ai/analysis/query` | Admin | AI sorgu |

---

## Partner

| Method | Route | Auth | Açıklama |
|--------|-------|------|----------|
| GET | `/partner/dashboard` | Partner | Dashboard |
| GET | `/partner/sales` | Partner | Satışlarım |
| POST | `/partner/sales` | Partner | Satış kaydet |
| PUT | `/partner/profile` | Partner | Profil güncelle |
| GET | `/partner/admin/list` | Admin | Partner listesi |
| GET | `/partner/admin/sales-map` | Admin | Satış haritası |
| GET | `/partner/admin/regional-performance` | Admin | Bölgesel performans |

---

## B2B

| Method | Route | Auth | Açıklama |
|--------|-------|------|----------|
| POST | `/b2b/leads` | Public | Lead oluştur |
| GET | `/admin/b2b/leads` | Admin | Lead listesi |
| PATCH | `/admin/b2b/leads/:id` | Admin | Lead güncelle |
| POST | `/admin/b2b/quotes` | Admin | Teklif oluştur |
| POST | `/admin/b2b/contracts` | Admin | Sözleşme oluştur |
| POST | `/admin/b2b/contracts/:id/assign-machine` | Admin | Makine ata |

---

## User

| Method | Route | Auth | Açıklama |
|--------|-------|------|----------|
| GET | `/users/me/addresses` | User | Adreslerim |
| GET | `/users/me/addresses/:id` | User | Adres detay |
| POST | `/users/me/addresses` | User | Adres ekle |
| PUT | `/users/me/addresses/:id` | User | Adres güncelle |
| DELETE | `/users/me/addresses/:id` | User | Adres sil |
| PATCH | `/users/me/addresses/:id/default` | User | Varsayılan yap |
| GET | `/users/me/wishlist` | User | Favorilerim |
| POST | `/users/me/wishlist/:productId` | User | Favorilere ekle |
| DELETE | `/users/me/wishlist/:productId` | User | Favoriden çıkar |
| GET | `/users/me/wishlist/:productId/check` | User | Favori mi? |
| PATCH | `/users/me/profile` | User | Profil güncelle |
| POST | `/users/me/avatar` | User | Avatar yükle |

---

## Health

| Method | Route | Auth | Açıklama |
|--------|-------|------|----------|
| GET | `/health` | Public | Health check |
| GET | `/` | Public | API info |
