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

export default function PrivacyPage() {
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
          Gizlilik Politikası
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', mb: 4 }}>
          Son güncelleme: {new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
        </Typography>

        <Section title="1. Genel Bilgi">
          Pure Olentia (&quot;Şirket&quot;, &quot;biz&quot;) olarak kişisel verilerinizin güvenliği bizim için önemlidir. Bu gizlilik politikası, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve Avrupa Birliği Genel Veri Koruma Tüzüğü (GDPR) uyarınca kişisel verilerinizin nasıl toplandığı, işlendiği, saklandığı ve korunduğu hakkında sizi bilgilendirmek amacıyla hazırlanmıştır.
        </Section>

        <Section title="2. Toplanan Veriler">
          Hizmetlerimizi sunarken aşağıdaki kişisel verileri toplayabiliriz: Ad ve soyad, e-posta adresi, telefon numarası, teslimat adresi, ödeme bilgileri (kart numarası saklanmaz — tokenize edilir), sipariş geçmişi, çerez verileri ve site kullanım istatistikleri, IP adresi ve tarayıcı bilgileri.
        </Section>

        <Section title="3. Verilerin Kullanım Amaçları">
          Kişisel verileriniz şu amaçlarla işlenmektedir: Siparişlerinizin işlenmesi ve teslimatı, abonelik hizmetlerinin yönetimi, müşteri destek hizmetlerinin sunulması, yasal yükümlülüklerin yerine getirilmesi, hizmet kalitesinin iyileştirilmesi, kişiselleştirilmiş deneyim sunulması (izniniz dahilinde), sadakat programı yönetimi.
        </Section>

        <Section title="4. Verilerin Paylaşılması">
          Kişisel verileriniz, yasal zorunluluklar dışında üçüncü taraflarla paylaşılmaz. Yalnızca şu durumlarda paylaşım yapılabilir: Kargo şirketleri (teslimat için gerekli minimum bilgi), ödeme sağlayıcıları (PayTR, iyzico — PCI DSS uyumlu), yasal yükümlülükler (mahkeme kararı vb.).
        </Section>

        <Section title="5. Veri Güvenliği">
          Verilerinizi korumak için endüstri standardı güvenlik önlemleri uygulamaktayız: AES-256-GCM şifreleme, SSL/TLS ile veri iletimi, düzenli güvenlik denetimleri, erişim kontrolü ve yetkilendirme, ClamAV ile dosya tarama.
        </Section>

        <Section title="6. Çerezler (Cookies)">
          Web sitemizde zorunlu çerezler (oturum yönetimi), analitik çerezler (site kullanım analizi — izninizle), pazarlama çerezleri (kişiselleştirilmiş içerik — izninizle) kullanılmaktadır. Çerez tercihlerinizi istediğiniz zaman değiştirebilirsiniz.
        </Section>

        <Section title="7. Haklarınız (KVKK Madde 11 / GDPR Madde 15-22)">
          Kişisel verilerinizle ilgili şu haklara sahipsiniz: Verilerinizin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme, yurt içinde veya yurt dışında aktarılan üçüncü kişileri bilme, eksik veya yanlış işlenmiş verilerin düzeltilmesini isteme, KVKK Madde 7 kapsamında verilerin silinmesini veya yok edilmesini isteme (unutulma hakkı), verilerinizin taşınabilirliği, otomatik karar alma süreçlerine itiraz.
        </Section>

        <Section title="8. Veri Saklama Süresi">
          Kişisel verileriniz, işlenme amaçları için gerekli olan süre boyunca saklanır. Yasal zorunluluklar gereği bazı veriler daha uzun süre tutulabilir (mali kayıtlar: 10 yıl, fatura bilgileri: 10 yıl).
        </Section>

        <Section title="9. İletişim">
          Gizlilik politikamız hakkında sorularınız için bize aşağıdaki kanallardan ulaşabilirsiniz: E-posta: kvkk@pureolentia.com, Adres: Pure Olentia, İstanbul, Türkiye.
        </Section>

        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 4, color: 'rgba(255,255,255,0.3)' }}>
          &copy; {new Date().getFullYear()} Pure Olentia. Tüm hakları saklıdır.
        </Typography>
      </Paper>
    </Box>
  );
}
