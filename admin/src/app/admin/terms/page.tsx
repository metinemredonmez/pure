'use client';

import { Box, Paper, Typography, Link as MuiLink } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import Link from 'next/link';

const brandColors = { rust: '#D4793F', cream: '#F5E6D3', dark: '#0B0B0B' };

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Box sx={{ mb: 3 }}>
    <Typography variant="h6" sx={{ color: brandColors.cream, mb: 1, fontWeight: 600 }}>{title}</Typography>
    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>{children}</Typography>
  </Box>
);

export default function TermsPage() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: brandColors.dark, p: { xs: 2, md: 4 }, display: 'flex', justifyContent: 'center' }}>
      <Paper sx={{ maxWidth: 800, width: '100%', p: { xs: 3, md: 5 }, borderRadius: 3, bgcolor: 'rgba(22,22,22,0.95)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <MuiLink
          component={Link}
          href="/admin/login"
          underline="none"
          sx={{ display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.5)', mb: 4, fontSize: '0.875rem', '&:hover': { color: brandColors.rust } }}
        >
          <ArrowBack sx={{ fontSize: 18, mr: 0.5 }} /> Giriş sayfasına dön
        </MuiLink>

        <Typography variant="h4" fontWeight={700} sx={{ color: brandColors.cream, mb: 1 }}>
          Kullanım Koşulları
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', mb: 4 }}>
          Son güncelleme: {new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
        </Typography>

        <Section title="1. Hizmet Kapsamı">
          Pure Olentia, premium kahve ve kahve ürünleri satışı yapan bir e-ticaret platformudur. Web sitemiz ve mobil uygulamamız üzerinden ürün satışı, abonelik hizmetleri, B2B kurumsal satış ve sadakat programı hizmetleri sunmaktadır.
        </Section>

        <Section title="2. Üyelik Koşulları">
          Sitemize üye olmak için 18 yaşını doldurmuş olmanız gerekmektedir. Üyelik bilgilerinizin doğruluğundan siz sorumlusunuz. Hesap güvenliğinizi sağlamak sizin yükümlülüğünüzdedir. Şifrenizi üçüncü kişilerle paylaşmamanız önerilir.
        </Section>

        <Section title="3. Sipariş ve Teslimat">
          Siparişleriniz, ödemenin onaylanmasının ardından işleme alınır. Teslimat süreleri bölgeye göre 1-5 iş günü arasında değişmektedir. Abonelik siparişleri her ay belirlenen tarihte otomatik olarak oluşturulur. Kargo bedeli belirli bir tutarın üzerindeki siparişlerde ücretsizdir.
        </Section>

        <Section title="4. Ödeme Koşulları">
          Kredi kartı, banka kartı ve QR kod ile ödeme yapabilirsiniz. Tüm ödemeler 3D Secure ile güvenli şekilde işlenir. Kart bilgileriniz sunucularımızda saklanmaz — PCI DSS uyumlu ödeme sağlayıcıları (PayTR, iyzico) tarafından tokenize edilir.
        </Section>

        <Section title="5. Abonelik Hizmetleri">
          Abonelik planları aylık olarak yenilenir. İlk ödeme 3D Secure ile alınır, sonraki ödemeler tokenize kart bilgisi ile otomatik çekilir. Aboneliğinizi istediğiniz zaman duraklatabilir, devam ettirebilir veya iptal edebilirsiniz. İptal durumunda mevcut dönem sonuna kadar hizmet devam eder.
        </Section>

        <Section title="6. İade ve Cayma Hakkı">
          6502 sayılı Tüketicinin Korunması Hakkında Kanun kapsamında, ürünü teslim aldığınız tarihten itibaren 14 gün içinde cayma hakkınızı kullanabilirsiniz. Gıda ürünlerinde ambalajı açılmamış ürünler iade edilebilir. İade talepleriniz 3 iş günü içinde değerlendirilir.
        </Section>

        <Section title="7. Sadakat Programı">
          Sadakat programına katılım ücretsizdir. Alışverişlerinizden puan kazanırsınız. Puanlar, indirim kuponlarına veya ücretsiz ürünlere dönüştürülebilir. Şirket, sadakat programı koşullarını önceden bildirimde bulunarak değiştirme hakkını saklı tutar.
        </Section>

        <Section title="8. Fikri Mülkiyet Hakları">
          Web sitemizdeki tüm içerik, tasarım, logo, marka ve görseller Pure Olentia&apos;a aittir ve telif hakları ile korunmaktadır. İzinsiz kopyalama, çoğaltma ve dağıtım yasaktır.
        </Section>

        <Section title="9. Sorumluluk Sınırlaması">
          Pure Olentia, mücbir sebepler (doğal afet, savaş, pandemi, internet altyapı sorunları vb.) nedeniyle hizmet aksamalarından sorumlu tutulamaz. Ürün görselleri temsilidir, renk ve boyut farklılıkları olabilir.
        </Section>

        <Section title="10. Uyuşmazlık Çözümü">
          Bu koşullardan doğan uyuşmazlıklarda Türkiye Cumhuriyeti kanunları uygulanır. Uyuşmazlıklarda İstanbul Mahkemeleri ve İcra Daireleri yetkilidir. Tüketici hakem heyetine başvuru hakkınız saklıdır.
        </Section>

        <Section title="11. Değişiklikler">
          Pure Olentia, bu kullanım koşullarını önceden bildirimde bulunarak değiştirme hakkını saklı tutar. Güncel koşullar her zaman bu sayfada yayımlanır.
        </Section>

        <Section title="12. İletişim">
          Kullanım koşullarımız hakkında sorularınız için: E-posta: destek@pureolentia.com, Telefon: +90 (212) 000 00 00, Adres: Pure Olentia, İstanbul, Türkiye.
        </Section>

        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 4, color: 'rgba(255,255,255,0.3)' }}>
          &copy; {new Date().getFullYear()} Pure Olentia. Tüm hakları saklıdır.
        </Typography>
      </Paper>
    </Box>
  );
}
