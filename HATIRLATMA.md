# HATIRLATMA — Nerede Kaldık? (Son güncelleme: 10 Ağustos 2026)

> Bu dosya, proje yeniden clone'landığında Claude'a (veya sana) bağlam vermek için.
> Yeni bir Claude oturumunda: "HATIRLATMA.md dosyasını oku, kaldığımız yerden devam et" de.

## Proje yapısı
- **Monorepo:** `backend` (NestJS + Prisma + PostgreSQL, port 4000), `web` (Next.js 16 mağaza, port 3001), `admin` (Next.js 16 panel, port 3000)
- **Sunucu:** Turhost VPS — `ssh pure` (root@mail), kod `/var/www/pureolentia`, pm2 süreçleri: `pureolentia-api` / `pureolentia-admin` / `pureolentia-web`
- **Domainler:** pureolentia.com (web), admin.pureolentia.com, api.pureolentia.com
- Sunucu komutlarını Emre elle çalıştırır; Claude komut verir, çıktı yapıştırılır.

## KRİTİK KURALLAR (bozma!)
1. **Build:** admin + web `package.json`'da `next build --webpack` SABİT. Turbopack, route-group manifestlerini üretmiyor → sayfalar `InvariantError` ile açılmıyor. Deploy'da her zaman `rm -rf .next` ile temiz build.
2. **Deploy şablonu:**
   ```
   cd /var/www/pureolentia && git pull
   cd backend && npm install && npx prisma migrate deploy && npm run build && pm2 reload pureolentia-api
   cd ../admin && rm -rf .next && npm run build && pm2 restart pureolentia-admin
   cd ../web && rm -rf .next && npm run build && pm2 restart pureolentia-web
   ```
3. **KDV:** Fiyatlar KDV DAHİL (%1). KDV toplama EKLENMEZ — `order.service.ts` + web cart/checkout böyle yazıldı. `taxRate` admin ayarında `1` = %1.
4. **Silme = SOFT delete:** Kullanıcı ve ürün varyantı silme soft'tur (FK Restrict; hard delete 500 verir).
5. **Varyant sistemi:** `ProductVariant` = kavurma × öğütme × gramaj × fiyat × stok. Admin ürün formunda editör var; site `ProductBuyBox` seçime göre fiyat gösterir; sipariş kalemine `variantName` snapshot düşer.
6. **Sepet → sipariş:** Siparişe yalnızca GERÇEK DB varyant id gider; sentetik id backend'de "variant not found" yapar.

## ✅ Bitenler (Tem-Ağu 2026 oturumları)
- Admin kullanıcı silme 500 → soft-delete; GlobalExceptionFilter artık 5xx'leri stack trace ile logluyor
- KDV ikiye katlanma bug'ı düzeltildi (₺549 → ₺1.098 oluyordu)
- Mail düzeltildi: mail.pureolentia.com TLS sertifikası yenilendi (süresi dolmuştu), SMTP çalışıyor; Celal info@ kullanıyor
- Yeni üye kaydında üyeye hoş geldin + admin'e (info@) bildirim maili
- Bülten sistemi: abone tablosu, site formu gerçek kayıt, admin "Bülten" sayfası, Toplu Mesaj'da "Bülten Aboneleri" hedefi
- Admin sayı alanları "0 silinemiyor" sorunu → ortak NumberField (8 sayfa)
- Dükkan: kategoriler admin ile canlı senkron, Kavurma/Gramaj/Fiyat filtreleri kaldırıldı, sıralama çalışıyor, hero kapak görseli + tasarım iyileştirmeleri
- Ürünler: fiyatlı gramaj + öğütme + çoklu kavurma seçimi (varyant sistemi), seçimler siparişe düşüyor
- Checkout yeniden yazıldı: misafir sipariş, sepet kalıcılık, adım adım onay, ödenmemiş sipariş hatırlatma cron
- Web i18n Faz 1: TR/EN altyapı hazır (dil seçici şimdilik gizli, varsayılan TR)
- **Kargonomi kargo entegrasyonu AKTİF:** token admin → Entegrasyonlar → Kargo API'de (şifreli), webhook kayıtlı (id 185, secret admin'de), depo id 127423 admin'de. Sipariş detayında "Kargonomi ile Gönder" + Barkod PDF. Durum güncellemeleri webhook ile otomatik.
- **AI asistan (chatbot) kodu hazır:** Claude'a bağlı (`claude-haiku-4-5`), canlı ürün verisiyle öneri yapıyor. `ANTHROPIC_API_KEY` backend .env'e girilince aktifleşir; anahtar yoksa ezber cevaplara düşer.

## ⏳ BEKLEYEN İŞLER (sıradaki oturumda buradan devam)
1. **AI asistan aktivasyonu:** console.anthropic.com'dan anahtar al ($5 kredi yüklendi mi?), sunucu `backend/.env`'e `ANTHROPIC_API_KEY=...` ekle, deploy (npm install şart — yeni paket `@anthropic-ai/sdk`), sitede chat balonundan test ("meyvemsi kahve öner" → gerçek ürün + fiyat + link vermeli).
2. **Kargonomi uçtan uca test:** Kargonomi bakiyesi yükle → bir siparişi "Kargonomi ile Gönder" → barkod PDF indir → webhook ile durum güncellemesi düşüyor mu bak.
3. **Mail kalıcı düzeltme (EKİM'DEN ÖNCE ŞART):** mail.pureolentia.com sertifikası ~12 Ekim'de dolar. İki sorun: (a) Tailscale resolv.conf'u ezince certbot DNS'e takılıyor, (b) sertifika standalone modda → port 80'de nginx'le çakışıyor. Çözüm: renewal hook (pre: nginx stop, post: nginx start + postfix/dovecot reload) + DNS kalıcı fix. Yapılmazsa mail yine kesilir.
4. **PUREOLENTIA X (Twitter) hesabı:** manuel iş, Bülent'te.
5. Varyant (kavurma×öğütme×gramaj) uçtan uca canlı test: admin'den varyant gir → sitede seç → fiyat değişsin → sipariş ver → admin sipariş detayında "250g - V60 - Orta Kavurma" görünsün.

## Gizli bilgiler NEREDE (bu dosyada YOK, commit etme!)
- Sunucu `backend/.env`: SMTP, DB, (eklenecek) ANTHROPIC_API_KEY
- Admin → Entegrasyonlar → Kargo API: Kargonomi token + webhook secret (şifreli DB'de)
- Claude hafızası: `~/.claude/projects/-Users-emre-Desktop-pure/memory/` (Mac'te, repo dışında)
