# 🤖 Olentia Pure — AI Services

Olentia Pure'un yapay zeka destekli servis katmanı. Müşteri deneyimini zenginleştiren, admin'e güçlü analiz araçları sunan ve operasyonel verimliliği artıran AI modülleri.

---

## Modüller

### 🎙️ STT (Speech-to-Text)
Ses dosyalarını metne çevirir. Müşteriler sesli arama yapabilir, sesli sipariş verebilir.

**Endpoint:** `POST /api/ai/stt/transcribe`

**Özellikler:**
- Türkçe sesli arama desteği
- Multipart file upload (wav, mp3, webm)
- Gerçek zamanlı stream transkripsiyon (Phase 2)
- OpenAI Whisper API entegrasyonu (Phase 2)

**Kullanım Senaryoları:**
- Müşteri sitede mikrofon ikonuna basıp "Ethiopia Yirgacheffe istiyorum" dediğinde ürünü bulur
- Sesli sipariş: "Geçen ay aldığım kahveden bir daha gönder"
- Erişilebilirlik: Görme engelli kullanıcılar için sesli navigasyon

---

### 🔊 TTS (Text-to-Speech)
Metni sese çevirir. Admin sabah raporunu sesli dinler, müşteriler ürün açıklamalarını dinleyebilir.

**Endpoints:**
- `POST /api/ai/tts/synthesize` — Metin → Ses
- `GET /api/ai/tts/voices` — Kullanılabilir ses modelleri

**Özellikler:**
- 6 farklı ses modeli (alloy, echo, fable, onyx, nova, shimmer)
- Türkçe dil desteği
- MinIO'ya otomatik ses dosyası yükleme (Phase 2)
- OpenAI TTS API entegrasyonu (Phase 2)

**Kullanım Senaryoları:**
- Admin sabah açılış raporu: "Günaydın! Dün 47 sipariş aldınız, ₺12.450 ciro..."
- Ürün açıklaması dinleme: Müşteri ürün sayfasında hoparlör ikonuna basar
- Podcast tarzı kahve rehberi: "Bu hafta size Ethiopia çekirdeklerini anlatıyoruz..."

---

### 💬 Chatbox (AI Asistan)
Sitenin sağ alt köşesinde açılan akıllı sohbet asistanı. Müşterilere 7/24 destek verir.

**Endpoints:**
- `POST /api/ai/chat` — Mesaj gönder (public, giriş gerekmez)
- `GET /api/ai/chat/history/:sessionId` — Konuşma geçmişi

**Özellikler:**
- Session bazlı konuşma takibi (x-session-id header)
- Guest + kayıtlı kullanıcı desteği
- Türkçe doğal dil anlama
- Kural tabanlı intent tespiti (Phase 1)
- LangChain + RAG entegrasyonu (Phase 2)
- Ürün kataloğundan akıllı arama (Phase 2)

**Desteklenen Konular:**
| Konu | Örnek Soru |
|------|------------|
| Kahve önerisi | "Bana filtre için hafif bir kahve öner" |
| Sipariş takibi | "OLN-2024-000042 nerede?" |
| Abonelik bilgisi | "Aylık paketleriniz ne kadar?" |
| B2B yönlendirme | "Ofisimize kahve makinesi lazım" |
| İade/değişim | "Siparişimi iade etmek istiyorum" |
| Kargo bilgisi | "Kargo ücreti ne kadar?" |
| Fiyat bilgisi | "Ethiopia çekirdeği kaç lira?" |

**Phase 2 — LangChain/RAG ile:**
- Ürün veritabanından gerçek zamanlı bilgi çekme
- Sipariş durumu otomatik sorgulama
- Kişiselleştirilmiş öneriler (geçmiş siparişlere göre)
- Çok turlu konuşma hafızası

---

### 📊 Analysis (Günlük Rapor & Analiz)
Admin için güçlü analiz ve raporlama motoru. Sabah açılış modu ile güne hazır başla.

**Endpoints:**
- `GET /api/ai/analysis/daily-report` — Günlük analiz raporu (JSON)
- `GET /api/ai/analysis/voice-report` — Sesli rapor metni (TTS'e hazır)
- `POST /api/ai/analysis/query` — Doğal dil sorgusu (Phase 2)

**Sabah Açılış Modu — Nasıl Çalışır:**
1. Admin sabah paneli açar
2. Sistem otomatik günlük raporu çeker
3. TTS ile sesli rapor başlar:
   > "Günaydın! 19 Mart 2026 raporunuz: 47 sipariş, ₺12.450 ciro, 8 yeni müşteri.
   > Öne çıkan: Siparişler düne göre %23 arttı. 3 yeni B2B lead geldi.
   > Dikkat: 2 üründe stok kritik seviyede — Ethiopia Yirgacheffe, Colombia Supremo.
   > Bugünkü takvim: Saat 09:00'da 12 sipariş kargoya hazırlanacak. Saat 10:00'da 5 abonelik yenilemesi yapılacak.
   > İyi bir gün geçirmenizi dilerim!"

**Rapor İçeriği:**
- **Metrikler:** Sipariş sayısı, ciro, yeni müşteriler, aktif abonelikler, B2B leadler
- **Karşılaştırma:** Dünle kıyaslama (artış/azalış yüzdesi)
- **Uyarılar:** Düşük stok, sipariş düşüşü, ödeme hataları
- **Takvim:** Kargo hazırlık, abonelik yenilemeleri, teslimat planı
- **En çok satanlar:** Top 5 ürün ve adetleri
- **Dönüşüm oranı:** Ziyaretçi → Sipariş oranı

**Phase 2 — Doğal Dil Sorgusu:**
```
POST /api/ai/analysis/query
{ "question": "Bu hafta en çok satan kahve hangisi?" }
{ "question": "B2B lead dönüşüm oranımız nedir?" }
{ "question": "Geçen ay abonelik iptalleri neden arttı?" }
```
LangChain SQL Agent ile veritabanına doğal dil sorgusu yapabilecek.

---

## Google Maps Entegrasyonu

Partner ve satış takibi harita üzerinde:

- **Partner Konumları:** Her partner'ın latitude/longitude bilgisi
- **Satış Haritası:** Nerede ne satılmış, bölgesel performans
- **Isı Haritası:** Yoğun satış bölgeleri görselleştirmesi
- **Bölge Analizi:** İstanbul, Ankara, İzmir bazlı karşılaştırma

**ENV Ayarı:**
```
GOOGLE_MAPS_API_KEY=your-api-key
GOOGLE_MAPS_GEOCODING=true
```

---

## Webhook Sistemi

Dış sistemlerle event-driven entegrasyon:

**Desteklenen Eventler:**
- `order.created` — Yeni sipariş oluşturuldu
- `order.shipped` — Sipariş kargoya verildi
- `payment.completed` — Ödeme tamamlandı
- `payment.failed` — Ödeme başarısız
- `subscription.renewed` — Abonelik yenilendi
- `subscription.cancelled` — Abonelik iptal edildi
- `b2b.lead_created` — Yeni B2B lead
- `stock.low` — Stok kritik seviye

**Güvenlik:** HMAC-SHA256 imza ile webhook doğrulama
**Retry:** Başarısız webhook'lar 3 kez tekrar denenir

---

## Tech Stack

| Teknoloji | Kullanım |
|-----------|----------|
| OpenAI Whisper | Speech-to-Text |
| OpenAI TTS | Text-to-Speech |
| OpenAI GPT-4 | Chatbox & Analysis |
| LangChain | RAG pipeline, SQL agent |
| Google Maps API | Partner/satış haritası |
| MinIO | Ses dosyası depolama |

---

## ENV Değişkenleri

```env
# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4
OPENAI_TTS_MODEL=tts-1
OPENAI_WHISPER_MODEL=whisper-1

# Google Maps
GOOGLE_MAPS_API_KEY=AIza...
GOOGLE_MAPS_GEOCODING=true
```

---

## Roadmap

| Phase | Özellik | Durum |
|-------|---------|-------|
| 1 | Kural tabanlı chatbox | ✅ Hazır |
| 1 | Günlük rapor API | ✅ Hazır |
| 1 | Sesli rapor metni | ✅ Hazır |
| 1 | STT/TTS endpoint yapısı | ✅ Hazır |
| 2 | OpenAI Whisper STT | 🔜 Planlanan |
| 2 | OpenAI TTS ses üretimi | 🔜 Planlanan |
| 2 | LangChain chatbox (RAG) | 🔜 Planlanan |
| 2 | Doğal dil analiz sorgusu | 🔜 Planlanan |
| 2 | Google Maps harita görselleştirme | 🔜 Planlanan |
| 3 | Kişiselleştirilmiş ürün önerisi | 🔜 Planlanan |
| 3 | Müşteri segmentasyonu | 🔜 Planlanan |
| 3 | Tahminsel stok yönetimi | 🔜 Planlanan |
