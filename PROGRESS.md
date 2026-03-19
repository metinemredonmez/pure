# Olentia Pure — Sprint Progress

## Sprint 0: Foundation ✅ COMPLETED
**Tarih:** 2026-03-19

- [x] Docker Compose (PostgreSQL 16, Redis 7, MinIO, RabbitMQ, MailHog)
- [x] NestJS scaffold + TypeScript config
- [x] Prisma ORM + PostgreSQL schema (40+ tablo, 10 modül)
- [x] JWT Auth (access 15dk + refresh 7gün + token rotation)
- [x] Google OAuth + Apple OAuth strategies
- [x] MFA/TOTP (QR code ile authenticator app)
- [x] RBAC (ADMIN, CUSTOMER, SALES, SUPPORT, PARTNER)
- [x] Swagger API docs (`/api/docs`)
- [x] Global guards (JWT, Roles, Rate Limiting)
- [x] Global exception filter + response transformer
- [x] ENV config (PayTR, iyzico, Google Pay, Apple Pay, SMTP, Firebase, OneSignal)
- [x] Health check endpoint
- [x] Git repo + GitHub push

### Modüller oluşturuldu:
1. **Identity** — Auth, OAuth, JWT, MFA, profile
2. **Catalog** — Products, variants, categories, collections
3. **Cart** — Guest + auth cart, merge logic
4. **Order** — Order creation, status tracking, coupon
5. **Payment** — PayTR, iyzico, Google Pay, Apple Pay, QR payment, webhooks
6. **Subscription** — Plans, cycles, pause/resume/cancel
7. **B2B** — Leads, quotes, contracts, machine assignments, CRM pipeline
8. **CMS** — Blog, FAQ, SEO metadata
9. **Chatbot** — Rule-based chatbot, intent detection
10. **Notification** — SMTP email, templates, logs

### Port Mapping (Docker):
| Servis | Port |
|--------|------|
| PostgreSQL | 5434 |
| Redis | 6380 |
| MinIO | 9002/9003 |
| RabbitMQ | 5673/15673 |
| MailHog | 1025/8025 |
| NestJS API | 4000 |

---

## Sprint 1: Commerce MVP (Planlanan)
**Hedef:** Çalışan e-ticaret akışı

- [ ] AI servis modülü (STT, TTS, chatbox, LangChain analiz)
- [ ] Şifre değiştirme / reset akışı
- [ ] Product CRUD tam test (Swagger üzerinden)
- [ ] Cart → Order → Payment tam akış
- [ ] iyzico sandbox entegrasyonu
- [ ] PayTR sandbox entegrasyonu
- [ ] MinIO file upload (product images)
- [ ] Admin dashboard API endpoints (stats, KPI)
- [ ] Seed data (örnek ürünler, kategoriler)
- [ ] Admin panel (Modernize template) kurulumu

---

## Sprint 2: Content & Discovery (Planlanan)

- [ ] Blog CRUD + SEO
- [ ] FAQ yönetimi
- [ ] Chatbot AI entegrasyonu (LangChain/RAG)
- [ ] STT/TTS entegrasyonu
- [ ] Email template sistemi
- [ ] Push notification (Firebase + OneSignal)

---

## Sprint 3: Subscription & B2B (Planlanan)

- [ ] Subscription tam akış (ödeme + cycle + retry)
- [ ] B2B CRM pipeline (kanban)
- [ ] Quote PDF generation
- [ ] Contract management
- [ ] Machine assignment automation

---

## Sprint 4: AI & Analytics (Planlanan)

- [ ] AI-powered product recommendations
- [ ] Customer analytics dashboard
- [ ] Sales reporting
- [ ] Inventory alerts
- [ ] Advanced chatbot (RAG + OpenAI)

---

## Sprint 5: Mobile & Scale (Planlanan)

- [ ] React Native mobile app
- [ ] CDN setup
- [ ] Performance optimization
- [ ] Load testing
- [ ] Production deployment (Hetzner)
