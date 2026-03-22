# Olentia Admin Panel

> Premium kahve e-ticaret yönetim paneli

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **UI Library:** MUI v7 + Emotion
- **Charts:** ApexCharts
- **Tables:** @tanstack/react-table
- **Icons:** Tabler Icons
- **Language:** TypeScript

## Tema

Modernize (main variant) teması kullanılıyor.

### Renk Paleti

| Renk | Hex | Kullanım |
|------|-----|----------|
| Primary | `#D4793F` | Rust/Orange - Ana aksiyonlar |
| Background | `#0B0B0B` | Dark - Sayfa arkaplanı |
| Card | `#161616` | Kartlar ve paneller |
| Text | `#F5E6D3` | Cream - Ana metin |
| Secondary | `#8B7355` | İkincil metin |

## Backend API

Base URL: `http://localhost:3000/api`

Backend NestJS + Prisma + PostgreSQL kullanıyor.

## Modüller

1. **Auth** - JWT tabanlı kimlik doğrulama
2. **Dashboard** - Satış grafikleri, MRR/ARR, istatistikler
3. **Products** - Ürün CRUD, varyantlar, stok yönetimi
4. **Orders** - Sipariş yönetimi, durum takibi
5. **Subscriptions** - Abonelik yönetimi, plan değişiklikleri
6. **Payments** - Ödeme takibi, iade işlemleri
7. **Users** - Kullanıcı yönetimi, profiller
8. **Loyalty** - Puan sistemi ayarları
9. **Reviews** - Yorum moderasyonu
10. **CMS** - Sayfa, banner, SSS yönetimi
11. **Notifications** - Bildirim gönderimi
12. **Chatbot** - AI sohbet oturum izleme
13. **Analytics** - Raporlar ve AI insights
14. **Settings** - Genel ayarlar, GDPR

## Sprint Planı

Detaylı sprint planı için [PROGRESS.md](./PROGRESS.md) dosyasına bakın.

## Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Development
npm run dev

# Production build
npm run build
npm run start
```

## Klasör Yapısı

```
admin/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (auth)/          # Auth sayfaları
│   │   ├── (dashboard)/     # Dashboard layout
│   │   │   ├── dashboard/
│   │   │   ├── products/
│   │   │   ├── orders/
│   │   │   ├── subscriptions/
│   │   │   ├── users/
│   │   │   ├── reviews/
│   │   │   ├── cms/
│   │   │   ├── notifications/
│   │   │   ├── chatbot/
│   │   │   ├── analytics/
│   │   │   └── settings/
│   │   └── layout.tsx
│   ├── components/          # Shared components
│   ├── lib/                 # Utilities, API client
│   ├── hooks/               # Custom hooks
│   ├── store/               # State management
│   ├── types/               # TypeScript types
│   └── theme/               # MUI theme config
├── public/
└── package.json
```

## API Endpoints

Tüm endpoint listesi için [API_ENDPOINTS.md](./API_ENDPOINTS.md) dosyasına bakın.
