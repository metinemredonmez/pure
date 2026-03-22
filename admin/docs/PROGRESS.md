# Olentia Admin Panel - Sprint Progress

## Genel Durum

| Sprint | Başlık | Durum | Tarih |
|--------|--------|-------|-------|
| 1 | Foundation + Auth | - | - |
| 2 | Dashboard + Products | - | - |
| 3 | Orders + Payments | - | - |
| 4 | Subscriptions + Loyalty | - | - |
| 5 | Users + CMS + Reviews | - | - |
| 6 | Notifications + Chatbot + AI + Settings | - | - |

---

## Sprint 1 — Foundation + Auth (3-4 gün)

### Görevler

- [ ] main variant'ı `/Users/emre/Desktop/pure/admin` olarak kopyala
- [ ] MUI tema özelleştirmesi (Olentia renkleri)
  - [ ] Primary: `#D4793F` (rust)
  - [ ] Background: `#0B0B0B` (dark)
  - [ ] Cards: `#161616`
  - [ ] Text: `#F5E6D3` (cream)
- [ ] Sidebar menü yapısı (Olentia admin modülleri)
- [ ] Auth entegrasyonu
  - [ ] JWT login
  - [ ] Refresh token
  - [ ] Auth guard
- [ ] API client setup (axios interceptor)

### Notlar

```
Endpoint'ler:
POST /auth/login
POST /auth/refresh
POST /auth/logout
GET  /auth/profile
```

---

## Sprint 2 — Dashboard + Products (3-4 gün)

### Görevler

- [ ] Dashboard sayfası
  - [ ] Satış grafikleri (ApexCharts)
  - [ ] Sipariş istatistikleri
  - [ ] MRR/ARR widget'ları
  - [ ] Aktif kullanıcı sayısı
- [ ] Ürün listesi
  - [ ] react-table entegrasyonu
  - [ ] Pagination
  - [ ] Filter
  - [ ] Search
- [ ] Ürün oluştur/düzenle formu
  - [ ] Görsel yükleme
  - [ ] Varyant yönetimi
- [ ] Ürün detay sayfası

### Notlar

```
Endpoint'ler:
GET    /products
GET    /products/:id
POST   /admin/products
PUT    /admin/products/:id
DELETE /admin/products/:id
```

---

## Sprint 3 — Orders + Payments (3-4 gün)

### Görevler

- [ ] Sipariş listesi
  - [ ] Filtreleme: durum, tarih, tutar
  - [ ] Arama
- [ ] Sipariş detay
  - [ ] Status timeline
  - [ ] Ürünler listesi
  - [ ] Adres bilgisi
  - [ ] Ödeme bilgisi
- [ ] Sipariş durum güncelleme
- [ ] Ödeme listesi
- [ ] İade işlemi

### Notlar

```
Endpoint'ler:
GET  /admin/orders
GET  /orders/:id
PUT  /admin/orders/:id/status
POST /admin/payment/:id/refund
```

---

## Sprint 4 — Subscriptions + Loyalty (3-4 gün)

### Görevler

- [ ] Abonelik listesi
  - [ ] Status badge
  - [ ] MRR gösterge
- [ ] Abonelik istatistikleri dashboard
  - [ ] MRR
  - [ ] ARR
  - [ ] Churn rate
- [ ] Plan yönetimi (CRUD)
- [ ] Loyalty ayarları paneli

### Notlar

```
Endpoint'ler:
GET /admin/subscriptions
GET /admin/subscriptions/stats
GET /admin/loyalty/config
PUT /admin/loyalty/config
```

---

## Sprint 5 — Users + CMS + Reviews (3-4 gün)

### Görevler

- [ ] Kullanıcı listesi
  - [ ] Arama
  - [ ] Filtre
  - [ ] Detay modal
- [ ] Kullanıcı profil sayfası
  - [ ] Siparişler tab
  - [ ] Abonelikler tab
  - [ ] Puanlar tab
- [ ] CMS yönetimi
  - [ ] Sayfa CRUD
  - [ ] Banner CRUD
  - [ ] SSS CRUD
- [ ] Yorum moderasyonu
  - [ ] Onay/Red butonları
  - [ ] Toplu işlem

### Notlar

```
Endpoint'ler:
GET  /admin/users
POST /admin/cms/pages
PUT  /admin/cms/pages/:id
PUT  /admin/reviews/:id/approve
```

---

## Sprint 6 — Notifications + Chatbot + AI + Settings (3-4 gün)

### Görevler

- [ ] Bildirim gönderme paneli
  - [ ] Tekil bildirim
  - [ ] Toplu email
- [ ] Chatbot oturum izleme
  - [ ] Oturum listesi
  - [ ] Sohbet detay
- [ ] AI analiz sayfası
  - [ ] Sorgu arayüzü
  - [ ] Insights dashboard
- [ ] GDPR yönetimi
  - [ ] Kullanıcı veri talepleri
- [ ] Genel ayarlar
  - [ ] 3rd party API key yönetimi

### Notlar

```
Endpoint'ler:
POST /admin/notifications/send
POST /admin/notifications/email
GET  /admin/chatbot/sessions
POST /ai/analysis/query
```

---

## Tamamlanan İşler Log

| Tarih | Sprint | İş | Notlar |
|-------|--------|-----|--------|
| - | - | - | - |

---

## Sorunlar & Çözümler

| Tarih | Sorun | Çözüm |
|-------|-------|-------|
| - | - | - |
