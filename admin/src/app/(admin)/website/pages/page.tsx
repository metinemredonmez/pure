'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Chip, IconButton, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, Divider, Skeleton, Grid, Tooltip,
  Switch, FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Description as PageIcon, Close as CloseIcon,
} from '@mui/icons-material';
import { websiteApi, uploadApi } from '@/lib/api';
import PageHeader from '@/components/common/PageHeader';
import ImageUpload from '@/components/common/ImageUpload';

interface SitePage {
  id: string;
  title: string;
  slug: string;
  sections: any[];
  isPublished: boolean;
  heroImage?: string;
  heroKicker?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoImage?: string;
  createdAt: string;
  updatedAt: string;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const emptyForm = {
  title: '',
  slug: '',
  content: '', // raw HTML content — serialized to sections[{type:'html', content}]
  isPublished: false,
  heroImage: '',
  heroKicker: '',
  seoTitle: '',
  seoDescription: '',
  seoImage: '',
};

// Shortcut: one-click creation of all 18 standard CMS pages
// (5 support + 4 legal + 5 commercial + 4 brand/content)
const SUPPORT_PAGE_TEMPLATES: Array<{
  title: string;
  slug: string;
  seoDescription: string;
  content: string;
}> = [
  // ── SUPPORT ──
  {
    title: 'Ekipmanlar',
    slug: 'ekipmanlar',
    seoDescription: 'Specialty kahve demleme ekipmanları rehberi.',
    content: `<h2>Kahve Ekipmanları Rehberi</h2>
<p>Her demleme yönteminin kendine özgü bir dili vardır. Doğru ekipmanla kahvenizin karakterini ortaya çıkarabilirsiniz.</p>
<p><img src="/hero/brazil-santos.jpg" alt="Brazil Santos" style="width:100%;border-radius:16px;margin:16px 0"/></p>
<h3>Filtre Kahve Ekipmanları</h3>
<ul>
  <li><strong>Hario V60:</strong> Aromayı öne çıkaran koni filtre. Hafif kavrumlar için ideal.</li>
  <li><strong>Chemex:</strong> Kalın kağıt filtre ile berrak ve temiz içim.</li>
  <li><strong>Kalita Wave:</strong> Düz tabanlı, tutarlı demleme.</li>
</ul>
<h3>Daldırma Yöntemleri</h3>
<ul>
  <li><strong>French Press:</strong> Yoğun gövdeli, ekonomik, geleneksel.</li>
  <li><strong>Aeropress:</strong> Kompakt, seyahat dostu, çok yönlü.</li>
</ul>
<h3>Espresso ve Türk Kahvesi</h3>
<ul>
  <li><strong>Espresso Makinesi:</strong> 9 bar basınçla yoğun ekstraksiyon.</li>
  <li><strong>Moka Pot:</strong> Ocak üstü klasik.</li>
  <li><strong>Cezve:</strong> Geleneksel Türk kahvesi için vazgeçilmez.</li>
</ul>
<h3>Yardımcı Ekipmanlar</h3>
<ul>
  <li><strong>Burr Öğütücü:</strong> Tutarlı öğütme aroma için şart.</li>
  <li><strong>Hassas Terazi:</strong> 0.1g hassasiyet.</li>
  <li><strong>Kuğu Boyunlu İbrik:</strong> Pour-over için su kontrolü.</li>
</ul>`,
  },
  {
    title: 'Sipariş Takibi',
    slug: 'siparis-takibi',
    seoDescription: 'Pure Olentia siparişinizi takip edin.',
    content: `<h2>Siparişiniz Nerede?</h2>
<p>Sipariş numaranız ve e-posta adresinizle sorgulama yapabilirsiniz.</p>
<h3>Siparişinizin Yolculuğu</h3>
<ol>
  <li><strong>Sipariş Alındı</strong> — Ödeme onaylandı, onay e-postası gönderildi.</li>
  <li><strong>Taze Kavrulur</strong> — 24 saat içinde sipariş üzerine kavrulur.</li>
  <li><strong>Paketleme</strong> — Valf kontrollü hava sızdırmaz paket.</li>
  <li><strong>Kargoya Teslim</strong> — Takip numarası e-posta ile iletilir.</li>
  <li><strong>Kapınızda</strong> — 1-3 iş günü içinde.</li>
</ol>
<p>Destek için: <a href="mailto:info@pureolentia.com">info@pureolentia.com</a> · 0552 462 29 54</p>`,
  },
  {
    title: 'İade & Değişim',
    slug: 'iade-degisim',
    seoDescription: 'Pure Olentia iade ve değişim koşulları.',
    content: `<h2>İade & Değişim Koşulları</h2>
<p>Memnuniyetiniz önceliğimizdir. 14 gün içinde iade hakkınız vardır.</p>
<h3>İade Koşulları</h3>
<ul>
  <li>Ambalajı açılmamış kahve ürünleri iade edilebilir.</li>
  <li>Ekipmanlar orijinal ambalajında, kullanılmamış olmalıdır.</li>
  <li>İade kargo ücreti müşteriye aittir (hatalı gönderim hariç).</li>
</ul>
<h3>İade Süreci</h3>
<ol>
  <li>info@pureolentia.com adresine sipariş numaranızla iletin.</li>
  <li>24 saat içinde iade kodunuz size iletilir.</li>
  <li>Ürünü orijinal ambalajında bize gönderin.</li>
  <li>Ürün ulaştıktan sonra 7 iş günü içinde ücret iadesi yapılır.</li>
</ol>`,
  },
  {
    title: 'Sıkça Sorulan Sorular',
    slug: 'sss',
    seoDescription: 'Pure Olentia kahveleri, abonelik, kargo hakkında SSS.',
    content: `<h2>Sıkça Sorulan Sorular</h2>
<h3>Siparişim ne zaman elime ulaşır?</h3>
<p>24 saat içinde kavrulur, 1-3 iş günü içinde kapınızda olur.</p>
<h3>Kargo ücreti ne kadar?</h3>
<p>300 TL üzeri siparişlerde ücretsiz kargo. Abonelikte tüm kargolar ücretsiz.</p>
<h3>Kahvelerinizin tazeliği nasıl?</h3>
<p>Tüm kahvelerimiz sipariş sonrası kavrulur. Kavurma tarihi ambalajda yer alır. İdeal tüketim: 4 hafta.</p>
<h3>Kahveyi nasıl saklamalıyım?</h3>
<p>Serin, kuru, ışıksız bir yerde, hava almayan kapta. Buzdolabında saklamayın.</p>
<h3>Abonelik nasıl çalışır?</h3>
<p>Planı seçin, her ay taze kahveniz kapınıza gelir. İstediğiniz zaman hesap panelinden iptal edebilirsiniz.</p>
<h3>Hangi ödeme yöntemlerini kabul ediyorsunuz?</h3>
<p>Kredi kartı, banka kartı, havale/EFT. Tüm ödemeler SSL ile güvence altında.</p>
<h3>Kurumsal müşterilere indirim var mı?</h3>
<p>Evet. Ofisler, kafeler, oteller için özel fiyatlar sunuyoruz. B2B sayfamızdan teklif isteyebilirsiniz.</p>`,
  },
  {
    title: 'Gizlilik Politikası',
    slug: 'gizlilik-politikasi',
    seoDescription: 'Pure Olentia KVKK gizlilik politikası.',
    content: `<h2>Gizlilik Politikası</h2>
<p>6698 sayılı KVKK uyarınca, kişisel verileriniz veri sorumlusu sıfatıyla <strong>Pure Olentia Kahve</strong> tarafından işlenmektedir.</p>
<p><strong>Adres:</strong> Abdurrahmangazi, Nane Sk. No:8, 34887 Sancaktepe/İstanbul<br/>
<strong>E-posta:</strong> info@pureolentia.com<br/>
<strong>Telefon:</strong> 0552 462 29 54</p>
<h3>İşlenen Kişisel Veriler</h3>
<ul>
  <li>Kimlik ve iletişim bilgileri</li>
  <li>Sipariş ve fatura bilgileri</li>
  <li>Pazarlama tercihleri (onay dahilinde)</li>
</ul>
<h3>Haklarınız</h3>
<p>KVKK Madde 11 uyarınca kişisel verilerinizin işlenip işlenmediğini öğrenme, düzeltilmesini/silinmesini talep etme haklarınız vardır.</p>
<p>Başvurular için: <a href="mailto:info@pureolentia.com">info@pureolentia.com</a></p>`,
  },

  // ── LEGAL ──
  {
    title: 'Mesafeli Satış Sözleşmesi',
    slug: 'mesafeli-satis',
    seoDescription: 'Pure Olentia mesafeli satış sözleşmesi.',
    content: `<h2>Mesafeli Satış Sözleşmesi</h2>
<p>İşbu sözleşme, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği uyarınca düzenlenmiştir.</p>
<h3>1. Taraflar</h3>
<p><strong>Satıcı:</strong> Pure Olentia Kahve<br/>
Adres: Abdurrahmangazi, Nane Sk. No:8, 34887 Sancaktepe/İstanbul<br/>
E-posta: info@pureolentia.com · Telefon: 0552 462 29 54</p>
<p><strong>Alıcı:</strong> Web sitesi üzerinden sipariş veren tüketici</p>
<h3>2. Sözleşmenin Konusu</h3>
<p>Alıcının Satıcıya ait web sitesinden sipariş ettiği ürünlerin satışı ve teslimi.</p>
<h3>3. Ödeme ve Teslimat</h3>
<p>Ödeme online güvenli altyapı (PayTR/Iyzico) ile yapılır. Ürünler sipariş sonrası 1-3 iş günü içinde Alıcı'ya teslim edilir.</p>
<h3>4. Cayma Hakkı</h3>
<p>Alıcı, ürünü teslim aldığı tarihten itibaren 14 gün içinde herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayma hakkına sahiptir.</p>
<h3>5. Cayma Hakkı Kullanılamayacak Ürünler</h3>
<p>Ambalajı açılmış kahve ürünleri, hijyen ve tazelik nedeniyle cayma hakkı kapsamı dışındadır.</p>
<h3>6. Uyuşmazlık Çözümü</h3>
<p>İşbu sözleşmeden doğacak uyuşmazlıklarda Sanayi ve Ticaret Bakanlığınca ilan edilen değere kadar Tüketici Hakem Heyetleri, aşan durumlarda Tüketici Mahkemeleri yetkilidir.</p>`,
  },
  {
    title: 'Kullanım Koşulları',
    slug: 'kullanim-kosullari',
    seoDescription: 'Pure Olentia web sitesi kullanım koşulları.',
    content: `<h2>Kullanım Koşulları</h2>
<p>Pure Olentia web sitesini (pureolentia.com) kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız.</p>
<h3>1. Genel</h3>
<p>Bu site Pure Olentia Kahve tarafından işletilmektedir. Site üzerinden sunulan hizmetler, içerikler ve ürünler işbu koşullara tabidir.</p>
<h3>2. Üyelik</h3>
<ul>
  <li>18 yaşından büyük olmanız gerekir.</li>
  <li>Hesap bilgilerinizin güvenliği size aittir.</li>
  <li>Yanıltıcı bilgi vermemekle yükümlüsünüz.</li>
</ul>
<h3>3. Fikri Mülkiyet</h3>
<p>Sitedeki tüm içerikler (metin, görsel, logo, video) Pure Olentia'nın fikri mülkiyetidir ve izinsiz kullanılamaz.</p>
<h3>4. Sorumluluk Sınırı</h3>
<p>Pure Olentia, sitenin kesintisiz veya hatasız çalışacağını garanti etmez. Site kullanımından doğabilecek dolaylı zararlardan sorumlu tutulamaz.</p>
<h3>5. Değişiklikler</h3>
<p>Pure Olentia, bu koşulları önceden bildirmeksizin güncelleme hakkına sahiptir. Güncel koşullar her zaman bu sayfada yayınlanır.</p>
<h3>6. Uygulanacak Hukuk</h3>
<p>İşbu koşullar Türkiye Cumhuriyeti yasalarına tabidir. Uyuşmazlık halinde İstanbul Mahkemeleri yetkilidir.</p>`,
  },
  {
    title: 'Çerez Politikası',
    slug: 'cerez-politikasi',
    seoDescription: 'Pure Olentia çerez kullanım politikası.',
    content: `<h2>Çerez Politikası</h2>
<p>Pure Olentia web sitesinde (pureolentia.com) kullanılan çerezler hakkında bilgi.</p>
<h3>Çerez Nedir?</h3>
<p>Çerezler (cookies), web sitesini ziyaret ettiğinizde tarayıcınıza kaydedilen küçük metin dosyalarıdır. Size daha iyi bir deneyim sunmak için kullanılır.</p>
<h3>Kullandığımız Çerez Türleri</h3>
<ul>
  <li><strong>Zorunlu Çerezler:</strong> Site işleyişi için gereklidir (oturum, sepet). Devre dışı bırakılamaz.</li>
  <li><strong>Performans Çerezleri:</strong> Site performansını ölçmek için (sayfa yükleme süresi, hata raporları).</li>
  <li><strong>Analitik Çerezler:</strong> Ziyaretçi davranışlarını anlamak için (Google Analytics benzeri).</li>
  <li><strong>Pazarlama Çerezleri:</strong> Size uygun reklamlar göstermek için. Sadece onayınızla kullanılır.</li>
</ul>
<h3>Çerezleri Yönetme</h3>
<p>Tarayıcı ayarlarınızdan çerezleri silebilir veya engelleyebilirsiniz. Ancak bu durumda bazı site özellikleri çalışmayabilir.</p>
<h3>İletişim</h3>
<p>Çerezler hakkında sorularınız için: <a href="mailto:info@pureolentia.com">info@pureolentia.com</a></p>`,
  },
  {
    title: 'KVKK Aydınlatma Metni',
    slug: 'kvkk',
    seoDescription: 'Pure Olentia KVKK aydınlatma metni.',
    content: `<h2>Kişisel Verilerin Korunması Aydınlatma Metni</h2>
<p>6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) uyarınca hazırlanan işbu aydınlatma metni, veri sorumlusu sıfatıyla <strong>Pure Olentia Kahve</strong> tarafından kişisel verilerinizin işlenme amacı, yöntemi ve haklarınız hakkında bilgilendirme amacı taşır.</p>
<h3>Veri Sorumlusu</h3>
<p>Pure Olentia Kahve<br/>
Abdurrahmangazi, Nane Sk. No:8, 34887 Sancaktepe/İstanbul<br/>
info@pureolentia.com · 0552 462 29 54</p>
<h3>İşlenen Kişisel Veriler ve Toplanma Yöntemi</h3>
<ul>
  <li>Kimlik bilgileri (ad, soyad)</li>
  <li>İletişim bilgileri (e-posta, telefon, adres)</li>
  <li>Müşteri işlem bilgileri (sipariş, ödeme referansı, fatura)</li>
  <li>İşlem güvenliği bilgileri (IP, log kayıtları)</li>
</ul>
<p>Bu veriler, web sitesi üyeliği, sipariş, iletişim formu gibi yöntemlerle otomatik yollarla toplanır.</p>
<h3>Kişisel Verilerin İşlenme Amaçları</h3>
<ul>
  <li>Mal ve hizmet satış süreçlerinin yürütülmesi</li>
  <li>Sözleşme süreçlerinin yürütülmesi</li>
  <li>Müşteri memnuniyeti süreçlerinin yürütülmesi</li>
  <li>Yasal yükümlülüklerin yerine getirilmesi</li>
</ul>
<h3>Haklarınız (KVKK Madde 11)</h3>
<ul>
  <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
  <li>İşlenmişse bilgi talep etme</li>
  <li>İşlenme amacını öğrenme</li>
  <li>Eksik/yanlış işlenmişse düzeltme talep etme</li>
  <li>Silinmesini veya yok edilmesini isteme</li>
  <li>Tazminat talep etme</li>
</ul>
<p>Başvuru: <a href="mailto:info@pureolentia.com">info@pureolentia.com</a></p>`,
  },

  // ── COMMERCIAL ──
  {
    title: 'Ödeme & Teslimat',
    slug: 'odeme-teslimat',
    seoDescription: 'Pure Olentia ödeme ve teslimat bilgileri.',
    content: `<h2>Ödeme & Teslimat</h2>
<h3>Ödeme Yöntemleri</h3>
<ul>
  <li><strong>Kredi Kartı / Banka Kartı:</strong> Visa, Mastercard, Troy. PayTR/Iyzico güvenli altyapı ile.</li>
  <li><strong>Havale / EFT:</strong> Sipariş onayı sonrası 24 saat içinde ödeme yapılmalıdır.</li>
  <li><strong>Taksit:</strong> Anlaşmalı bankaların kartlarına taksit seçeneği mevcuttur.</li>
</ul>
<h3>Güvenlik</h3>
<p>Kart bilgileri Pure Olentia'da saklanmaz. Tüm ödemeler SSL sertifikası ve 3D Secure ile güvence altındadır.</p>
<h3>Teslimat Bölgeleri</h3>
<p>Türkiye geneline kargo ile gönderim yapılmaktadır. İstanbul içi aynı gün teslimat bazı bölgelerde mümkündür.</p>
<h3>Kargo Süreleri</h3>
<ul>
  <li><strong>İstanbul içi:</strong> 1 iş günü</li>
  <li><strong>Büyükşehirler:</strong> 1-2 iş günü</li>
  <li><strong>Diğer iller:</strong> 2-3 iş günü</li>
</ul>
<h3>Kargo Ücretleri</h3>
<ul>
  <li><strong>300 TL üzeri siparişler:</strong> Ücretsiz kargo</li>
  <li><strong>300 TL altı:</strong> Standart kargo ücreti (anlaşmalı kargo firmamıza göre)</li>
  <li><strong>Abonelik siparişleri:</strong> Her zaman ücretsiz kargo</li>
</ul>
<h3>Kargoya Veriliş Süresi</h3>
<p>Siparişiniz ödeme onayından sonra 24 saat içinde taze kavrulup kargoya teslim edilir. Hafta sonu alınan siparişler Pazartesi kavrulur.</p>`,
  },
  {
    title: 'Toptan Satış',
    slug: 'toptan-satis',
    seoDescription: 'Pure Olentia toptan kahve satışı.',
    content: `<h2>Toptan Satış</h2>
<p>Kafe, restoran, otel ve ofisler için özel toptan fiyatlar. Yüksek kalite, tutarlı tedarik.</p>
<h3>Toptan Müşterilerimize Sunduklarımız</h3>
<ul>
  <li>Özel toptan fiyatlar (hacme göre)</li>
  <li>Düzenli teslimat programı</li>
  <li>Özel blend geliştirme imkanı</li>
  <li>Barista eğitimi desteği</li>
  <li>Ekipman danışmanlığı</li>
  <li>Markalama (özel ambalaj)</li>
</ul>
<h3>Minimum Sipariş</h3>
<ul>
  <li>Toptan: 10 kg ve üzeri</li>
  <li>Düzenli: Aylık 25 kg ve üzeri</li>
</ul>
<h3>Başvuru</h3>
<p>Toptan satış için bize ulaşın:</p>
<p><strong>E-posta:</strong> info@pureolentia.com<br/>
<strong>Telefon:</strong> 0552 462 29 54</p>
<p>Size 24 saat içinde özel teklif gönderilir.</p>`,
  },
  {
    title: 'Kurumsal Hediye',
    slug: 'kurumsal-hediye',
    seoDescription: 'Pure Olentia kurumsal hediye paketleri.',
    content: `<h2>Kurumsal Hediye Paketleri</h2>
<p>Çalışanlarınız, müşterileriniz ve iş ortaklarınız için unutulmaz kahve hediyeleri.</p>
<p><img src="/hero/hediye-paketi.jpg" alt="Pure Olentia Hediye Paketi" style="width:100%;border-radius:16px;margin:16px 0"/></p>
<h3>Neden Pure Olentia?</h3>
<ul>
  <li>Taze kavrulmuş specialty kahve</li>
  <li>Özel tasarım ambalaj ve kutu</li>
  <li>Şirket logonuzla markalama imkanı</li>
  <li>Toplu sipariş avantajı</li>
  <li>Türkiye geneline hızlı teslimat</li>
</ul>
<h3>Hediye Seçenekleri</h3>
<ul>
  <li><strong>Klasik Set:</strong> Türk Kahvesi 100gr + cezve + fincan</li>
  <li><strong>Premium Set:</strong> 3 farklı menşei + demleme rehberi</li>
  <li><strong>Gourmet Set:</strong> Blend + ekipman + workshop davetiyesi</li>
  <li><strong>Özel Tasarım:</strong> Talebinize göre özel paket</li>
</ul>
<h3>Kurumsal Teklif</h3>
<p>Minimum 20 adet sipariş için toplu indirim. Özel teklif için:</p>
<p><a href="mailto:info@pureolentia.com">info@pureolentia.com</a> · 0552 462 29 54</p>`,
  },
  {
    title: 'Kahve Okulu',
    slug: 'kahve-okulu',
    seoDescription: 'Pure Olentia kahve okulu: eğitimler ve workshoplar.',
    content: `<h2>Pure Olentia Kahve Okulu</h2>
<p>Specialty kahve dünyasını derinlemesine öğrenin. Yeni başlayandan profesyonele, herkes için eğitim programlarımız.</p>
<h3>Eğitim Programlarımız</h3>
<h4>🎓 Başlangıç: Kahve Tutkunları</h4>
<ul>
  <li>Specialty kahve nedir?</li>
  <li>Menşei, işleme ve kavurma</li>
  <li>Temel demleme yöntemleri</li>
  <li>Süre: 1 gün · Fiyat: Talebe göre</li>
</ul>
<h4>☕ Orta: Ev Baristası</h4>
<ul>
  <li>V60, Chemex, Aeropress detaylı</li>
  <li>Öğütme kalibrasyonu</li>
  <li>Su kimyası ve sıcaklığı</li>
  <li>Tatma eğitimi (cupping)</li>
  <li>Süre: 2 gün · Sertifikalı</li>
</ul>
<h4>🏆 Pro: Barista Sertifika</h4>
<ul>
  <li>Espresso teknik</li>
  <li>Milk texturing / latte art</li>
  <li>SCA sertifika hazırlığı</li>
  <li>Menu mühendisliği</li>
  <li>Süre: 5 gün · Uluslararası sertifika</li>
</ul>
<h3>Kurumsal Eğitim</h3>
<p>Ekibinize özel, iş yerinizde veya mekanımızda eğitim düzenleyebiliriz. Detay için iletişime geçin.</p>
<p><a href="mailto:info@pureolentia.com">info@pureolentia.com</a></p>`,
  },
  {
    title: 'Kampanyalar',
    slug: 'kampanyalar',
    seoDescription: 'Pure Olentia güncel kampanyalar ve fırsatlar.',
    content: `<h2>Güncel Kampanyalar</h2>
<p>Pure Olentia'nın en iyi fırsatları. Taze kavrulmuş specialty kahveyi daha avantajlı fiyatlarla keşfedin.</p>
<h3>🎁 Abonelik İndirimi</h3>
<p>Aylık kahve aboneliğinde <strong>%15 indirim</strong>. Her ay kapınıza taze kahve, iptal özgürlüğüyle.</p>
<h3>🚚 Ücretsiz Kargo</h3>
<p>300 TL üzeri tüm siparişlerde ücretsiz kargo. Abonelik siparişlerinde her zaman ücretsiz.</p>
<h3>☕ Hediye Seti Fırsatı</h3>
<p>3'lü Türk Kahvesi hediye setinde özel fiyat. Sevdiklerinize kahve hediyesi.</p>
<h3>🏢 Kurumsal İndirim</h3>
<p>10 kg ve üzeri siparişlerde toptan fiyat. Ofisiniz için özel teklif alın.</p>
<h3>📬 Bültene Abone Olun</h3>
<p>Yeni kampanyaları ve özel indirimleri ilk sizden öğrenin. <a href="/contact">E-posta adresinizi paylaşın</a>.</p>`,
  },

  // ── BRAND / CONTENT ──
  {
    title: 'Menşei Hikayeleri',
    slug: 'menseiler',
    seoDescription: 'Pure Olentia kahvelerinin geldiği topraklar ve çiftçiler.',
    content: `<h2>Her Fincanın Arkasında Bir Hikaye</h2>
<p>Pure Olentia olarak kahvelerimizi direct trade yöntemiyle doğrudan çiftçiden alıyoruz. Her menşei, kendine özgü bir iklim, toprak ve kültürden geliyor.</p>
<h3>🇪🇹 Etiyopya — Kahvenin Anavatanı</h3>
<p>Kahvenin doğduğu topraklar. Yirgacheffe, Sidamo, Guji bölgeleri dünyanın en kaliteli arabica çekirdeklerini yetiştirir. Çiçeksi, meyvemsi ve karmaşık aromalar.</p>
<p><strong>Tipik notlar:</strong> Bergamot, limon, yasemin, yaban mersini</p>
<h3>🇨🇴 Kolombiya — Klasikler Diyarı</h3>
<p>Huila ve Nariño bölgelerinden gelen Kolombiya kahveleri dengeli, tatlı ve kolay içilir karakterleriyle tanınır. Yeni başlayanlar için mükemmel.</p>
<p><strong>Tipik notlar:</strong> Karamel, fındık, çikolata, narenciye</p>
<h3>🇧🇷 Brezilya — Gövdeli ve Zengin</h3>
<p>Dünyanın en büyük kahve üreticisi. Santos, Mogiana ve Cerrado bölgeleri düşük asiditeli, çikolatalı ve tütünlü kahveleriyle espresso harmanları için idealdir.</p>
<p><strong>Tipik notlar:</strong> Bitter çikolata, fındık, tütün, kakao</p>
<h3>🇰🇪 Kenya — Parlak ve Asidik</h3>
<p>Nyeri ve Kirinyaga bölgelerinden gelen AA sınıfı Kenya kahveleri yoğun meyve notaları ve parlak asiditeyle öne çıkar.</p>
<p><strong>Tipik notlar:</strong> Böğürtlen, kuşburnu, kan portakalı, siyah çay</p>
<h3>🇬🇹 Guatemala — Volkanik Karakter</h3>
<p>Antigua, Huehuetenango ve Atitlán bölgeleri volkanik topraklarda yetişen baharatlı ve çikolatalı kahveleriyle tanınır.</p>
<p><strong>Tipik notlar:</strong> Tarçın, bitter çikolata, karamel, badem</p>`,
  },
  {
    title: 'Sürdürülebilirlik',
    slug: 'surdurulebilirlik',
    seoDescription: 'Pure Olentia sürdürülebilir kahve anlayışı.',
    content: `<h2>Sürdürülebilir Kahve Anlayışı</h2>
<p>Pure Olentia'da sürdürülebilirlik sadece bir söz değil, iş modelimizin temeli.</p>
<h3>🌱 Direct Trade</h3>
<p>Kahvemizi doğrudan üreticiden, aracısız satın alıyoruz. Bu sayede:</p>
<ul>
  <li>Çiftçiler hak ettikleri fiyatı alır</li>
  <li>Piyasa dalgalanmalarına karşı koruma sağlarız</li>
  <li>Kalite üzerinde tam kontrol</li>
  <li>Üreticilerle uzun vadeli ilişki</li>
</ul>
<h3>🌍 Çevre</h3>
<ul>
  <li>Gölge altı yetiştirme destekliyoruz</li>
  <li>Organik sertifikalı çiftliklerle çalışıyoruz</li>
  <li>Ambalajlarımız geri dönüştürülebilir</li>
  <li>Karbon ayak izimizi ölçüyoruz ve azaltıyoruz</li>
</ul>
<h3>👥 Sosyal Etki</h3>
<ul>
  <li>Kadın kooperatiflerine özel alım</li>
  <li>Çocuk işçiliğine sıfır tolerans</li>
  <li>Çiftçi çocuklarının eğitimine destek</li>
  <li>Yerel sağlık projelerine katkı</li>
</ul>
<h3>📈 Sertifikalar</h3>
<ul>
  <li>SCA (Specialty Coffee Association) üyeliği</li>
  <li>Fair Trade bilinci</li>
  <li>Rainforest Alliance onayı (seçili kahvelerde)</li>
</ul>
<p>Her fincanın arkasında bir çiftçinin alın teri, bir toprağın cömertliği var. Bunu hiç unutmuyoruz.</p>`,
  },
  {
    title: 'Kahve Sözlüğü',
    slug: 'kahve-sozlugu',
    seoDescription: 'Kahve terimleri sözlüğü.',
    content: `<h2>Kahve Sözlüğü</h2>
<p>Kahve dünyasında sıkça karşılaştığınız terimlerin açıklamaları.</p>

<h3>A — B</h3>
<ul>
  <li><strong>Arabica:</strong> Kahve ağacının en kaliteli türü. Specialty kahvelerin %100'ü arabicadır.</li>
  <li><strong>Aroma:</strong> Kahvenin koku profili (çiçeksi, meyvemsi, çikolatalı vb).</li>
  <li><strong>Bloom:</strong> Demleme başında taze kahveden CO₂ çıkışı sonucu şişme hali.</li>
  <li><strong>Body (Gövde):</strong> Kahvenin ağızda bıraktığı dolgunluk hissi.</li>
  <li><strong>Burr Grinder:</strong> Konik veya düz bıçaklı öğütücü. Tutarlı öğütme sağlar.</li>
</ul>

<h3>C — E</h3>
<ul>
  <li><strong>Crema:</strong> Espresso'nun üzerindeki altın rengi köpük. Kalite göstergesi.</li>
  <li><strong>Cupping:</strong> Kahve tadım metodolojisi. SCA standartlarına göre yapılır.</li>
  <li><strong>Decaf:</strong> Kafeinsiz kahve (genellikle 99.9% kafeini alınmış).</li>
  <li><strong>Direct Trade:</strong> Doğrudan ticaret. Çiftçiden aracısız alım.</li>
  <li><strong>Extraction (Ekstraksiyon):</strong> Kahve özünün suya geçmesi süreci.</li>
</ul>

<h3>F — L</h3>
<ul>
  <li><strong>Fair Trade:</strong> Üreticilere adil fiyat garantisi veren sertifika.</li>
  <li><strong>Grind (Öğütme):</strong> Çekirdeklerin parçalanması. Kaba, orta, ince çeşitleri var.</li>
  <li><strong>Honey Process:</strong> Bal işleme. Meyvenin bir kısmı çekirdek üzerinde bırakılır.</li>
</ul>

<h3>M — R</h3>
<ul>
  <li><strong>Microlot:</strong> Tek bir bahçeden toplanan, sınırlı miktarda özel kahve.</li>
  <li><strong>Natural Process:</strong> Doğal işleme. Meyvenin içinde kurutma.</li>
  <li><strong>Origin (Menşei):</strong> Kahvenin yetiştirildiği ülke/bölge.</li>
  <li><strong>Pour-over:</strong> Üzerinden dökme demleme yöntemi (V60, Chemex).</li>
  <li><strong>Q Grader:</strong> SCA tarafından sertifikalı profesyonel kahve tatıcısı.</li>
  <li><strong>Roast Level:</strong> Kavurma derecesi (light, medium, dark).</li>
</ul>

<h3>S — Z</h3>
<ul>
  <li><strong>Single Origin:</strong> Tek menşei kahve. Tek ülke, tek bölge, tek çiftlik.</li>
  <li><strong>Specialty:</strong> SCA tarafından 80+ puan alan premium kahve sınıfı.</li>
  <li><strong>TDS (Total Dissolved Solids):</strong> Demlenmiş kahvedeki toplam çözünmüş madde oranı.</li>
  <li><strong>Terroir:</strong> Yetişme koşullarının (iklim, toprak, yükseklik) kahveye etkisi.</li>
  <li><strong>Washed Process:</strong> Yıkanmış işleme. Temiz, parlak, asidik kahveler verir.</li>
</ul>`,
  },
  {
    title: 'Demleme Rehberi',
    slug: 'demleme-rehberi',
    seoDescription: 'V60, Chemex, French Press, Aeropress, Moka Pot ve Cezve için adım adım demleme tarifleri.',
    content: `<h2>Demleme Rehberi</h2>
<p>Her ekipmanın kendine özgü bir dili var. Pure Olentia barista ekibimizin hazırladığı rehberle kahvenizin tam potansiyelini ortaya çıkarın.</p>

<h3>☕ V60 (Pour-over)</h3>
<p><strong>Oran:</strong> 15g kahve / 250ml su (1:16)<br/>
<strong>Öğütme:</strong> Orta-ince<br/>
<strong>Su sıcaklığı:</strong> 92-94°C<br/>
<strong>Süre:</strong> 2:30 - 3:00</p>
<ol>
  <li>Filtre kağıdını ıslat, ibriği kazanılı suyla ısıt.</li>
  <li>Kahveyi filtreye koy, ortasında çukur oluştur.</li>
  <li><strong>Bloom:</strong> 30ml su dök, 30 saniye bekle.</li>
  <li>Spiral hareketlerle merkezden dışa doğru 100ml dök.</li>
  <li>1:15'te 150ml daha ekle, toplam 250ml'ye ulaş.</li>
  <li>Suyun tamamen süzülmesini bekle.</li>
</ol>

<h3>⚗️ Chemex</h3>
<p><strong>Oran:</strong> 30g kahve / 500ml su (1:17)<br/>
<strong>Öğütme:</strong> Orta (V60'tan biraz daha kaba)<br/>
<strong>Süre:</strong> 4:00 - 5:00</p>
<ol>
  <li>Chemex filtresini ıslat (katlı kısım oluğun önünde).</li>
  <li>Kahveyi ekle.</li>
  <li>Bloom: 60ml su, 45 saniye.</li>
  <li>Spiral hareketlerle 200ml'ye kadar dök.</li>
  <li>Su çekildikçe kademeli olarak 500ml'ye tamamla.</li>
</ol>

<h3>🫗 French Press</h3>
<p><strong>Oran:</strong> 30g kahve / 500ml su (1:16)<br/>
<strong>Öğütme:</strong> İri<br/>
<strong>Su sıcaklığı:</strong> 95°C<br/>
<strong>Süre:</strong> 4 dakika</p>
<ol>
  <li>French Press'i sıcak suyla ısıt.</li>
  <li>Kahveyi ekle.</li>
  <li>Suyun tamamını hızlıca dök.</li>
  <li>30 saniye sonra crust'u karıştır.</li>
  <li>4 dakika bekle.</li>
  <li>Pistonu yavaşça bastır.</li>
  <li>Hemen servis et (bekleme = acılaşma).</li>
</ol>

<h3>🚀 Aeropress</h3>
<p><strong>Oran:</strong> 15g kahve / 220ml su (1:14)<br/>
<strong>Öğütme:</strong> Orta-ince<br/>
<strong>Süre:</strong> 2:00</p>
<ol>
  <li>Aeropress'i ters modda kur.</li>
  <li>Kahveyi ekle, 50ml su dök, 30 saniye bekle.</li>
  <li>Geri kalan suyu ekle, 10 saniye karıştır.</li>
  <li>Filtre kapağını kapa, bardağa çevir.</li>
  <li>30 saniyede yavaşça bastır.</li>
</ol>

<h3>☕ Moka Pot</h3>
<p><strong>Oran:</strong> Haznesini tamamen doldur (sıkıştırmadan)<br/>
<strong>Öğütme:</strong> İnce (espressodan biraz daha kaba)<br/>
<strong>Su:</strong> Alt hazneye valfe kadar sıcak su</p>
<ol>
  <li>Alt hazneye sıcak su doldur.</li>
  <li>Filtre sepetini kahveyle doldur.</li>
  <li>Üst hazneyi sık.</li>
  <li>Orta ateşe koy.</li>
  <li>Gur gur sesi başladığında ocaktan al.</li>
  <li>Musluk suyuyla soğut (pişmesin).</li>
</ol>

<h3>🇹🇷 Türk Kahvesi (Cezve)</h3>
<p><strong>Oran:</strong> 1 fincan su, 1.5 tatlı kaşığı toz öğütülmüş kahve<br/>
<strong>Öğütme:</strong> Toz kadar ince<br/>
<strong>Süre:</strong> 4-5 dakika (düşük ateş)</p>
<ol>
  <li>Suyu cezveye koy.</li>
  <li>Kahveyi ve şekeri ekle (tercih ettiğin sertlikte).</li>
  <li>Karıştır, düşük ateşe koy.</li>
  <li>Köpüklenmeye başladığında karıştırma.</li>
  <li>Köpük yükseldiğinde ocaktan al.</li>
  <li>Köpüğü fincanlara dağıt, cezveyi tekrar ateşe koy.</li>
  <li>Bir kez daha kabardığında fincanlara dök.</li>
</ol>`,
  },
];

export default function PagesPage() {
  const [pages, setPages] = useState<SitePage[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SitePage | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchPages = useCallback(async () => {
    try {
      setLoading(true);
      const res = await websiteApi.getPages();
      setPages(Array.isArray(res) ? res : res.data || []);
    } catch { setPages([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPages(); }, [fetchPages]);

  const sectionsToContent = (sections: any[] | any): string => {
    if (!Array.isArray(sections)) return '';
    return sections
      .map((s) => (typeof s === 'string' ? s : (s?.content ?? '')))
      .filter(Boolean)
      .join('\n\n');
  };

  const handleOpen = (page?: SitePage) => {
    if (page) {
      setEditing(page);
      setForm({
        title: page.title,
        slug: page.slug,
        content: sectionsToContent(page.sections),
        isPublished: page.isPublished,
        heroImage: page.heroImage || '',
        heroKicker: page.heroKicker || '',
        seoTitle: page.seoTitle || '',
        seoDescription: page.seoDescription || '',
        seoImage: page.seoImage || '',
      });
    } else {
      setEditing(null);
      setForm(emptyForm);
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const sections = form.content
        ? [{ type: 'html', content: form.content }]
        : [];
      const { content: _omit, ...rest } = form;
      const payload = { ...rest, sections };
      if (editing) {
        await websiteApi.updatePage(editing.id, payload);
      } else {
        await websiteApi.createPage(payload);
      }
      setDialogOpen(false);
      fetchPages();
    } catch { /* toast */ }
    finally { setSaving(false); }
  };

  const handleSeedSupportPages = async () => {
    const count = SUPPORT_PAGE_TEMPLATES.length;
    if (
      !confirm(
        `${count} sayfa yayınlanmış olarak oluşturulacak:\n` +
          `\n• Destek: Ekipmanlar, Sipariş Takibi, İade & Değişim, SSS, Gizlilik Politikası` +
          `\n• Yasal: Mesafeli Satış, Kullanım Koşulları, Çerez Politikası, KVKK` +
          `\n• Ticari: Ödeme & Teslimat, Toptan Satış, Kurumsal Hediye, Kahve Okulu, Kampanyalar` +
          `\n• İçerik: Menşei Hikayeleri, Sürdürülebilirlik, Kahve Sözlüğü, Demleme Rehberi` +
          `\n\nAynı slug'a sahip mevcut sayfalar atlanır. Devam edilsin mi?`
      )
    )
      return;
    setSaving(true);
    let created = 0;
    let skipped = 0;
    let failed = 0;
    try {
      const existingSlugs = new Set(pages.map((p) => p.slug));
      for (const tpl of SUPPORT_PAGE_TEMPLATES) {
        if (existingSlugs.has(tpl.slug)) {
          skipped++;
          continue;
        }
        try {
          await websiteApi.createPage({
            title: tpl.title,
            slug: tpl.slug,
            sections: [{ type: 'html', content: tpl.content }],
            isPublished: true,
            seoTitle: tpl.title + ' - Pure Olentia',
            seoDescription: tpl.seoDescription,
            seoImage: '',
          });
          created++;
        } catch {
          failed++;
        }
      }
      await fetchPages();
      alert(
        `Sayfa oluşturma tamamlandı.\n\n` +
          `✅ Oluşturulan: ${created}\n` +
          `⏭ Atlanan (zaten var): ${skipped}\n` +
          (failed > 0 ? `❌ Hata: ${failed}\n` : '')
      );
    } catch {
      alert('Sayfalar oluşturulurken bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu sayfa silinecek. Emin misiniz?')) return;
    await websiteApi.deletePage(id);
    fetchPages();
  };

  return (
    <Box>
      <PageHeader
        title="Sayfa Yönetimi"
        subtitle={`${pages.length} sayfa`}
        icon={<PageIcon />}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={handleSeedSupportPages}
              size="small"
              disabled={saving}
            >
              Destek Sayfalarını Oluştur
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()} size="small">
              Yeni Sayfa
            </Button>
          </Box>
        }
      />

      <Card sx={{ mt: 3 }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Sayfa Adi</TableCell>
                <TableCell>Slug</TableCell>
                <TableCell>Bolum Sayisi</TableCell>
                <TableCell>SEO</TableCell>
                <TableCell align="center">Durum</TableCell>
                <TableCell>Son Guncelleme</TableCell>
                <TableCell align="right">Islemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>{Array.from({ length: 7 }).map((_, j) => (<TableCell key={j}><Skeleton /></TableCell>))}</TableRow>
                ))
              ) : pages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">Henuz sayfa eklenmemis</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                pages.map((page) => (
                  <TableRow key={page.id} hover>
                    <TableCell><Typography fontWeight={600} fontSize={13}>{page.title}</Typography></TableCell>
                    <TableCell><Typography fontSize={12} color="text.secondary">/{page.slug}</Typography></TableCell>
                    <TableCell>
                      <Chip label={`${Array.isArray(page.sections) ? page.sections.length : 0} bolum`} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      {page.seoTitle ? (
                        <Chip label="SEO OK" size="small" color="success" variant="outlined" />
                      ) : (
                        <Chip label="SEO Eksik" size="small" color="warning" variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={page.isPublished ? 'Yayinda' : 'Taslak'} color={page.isPublished ? 'success' : 'default'} size="small" />
                    </TableCell>
                    <TableCell><Typography fontSize={12} color="text.secondary">{formatDate(page.updatedAt)}</Typography></TableCell>
                    <TableCell align="right">
                      <Tooltip title="Duzenle"><IconButton size="small" onClick={() => handleOpen(page)}><EditIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>
                      <Tooltip title="Sil"><IconButton size="small" color="error" onClick={() => handleDelete(page.id)}><DeleteIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {editing ? 'Sayfa Duzenle' : 'Yeni Sayfa'}
          <IconButton size="small" onClick={() => setDialogOpen(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Sayfa Adi" size="small" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Slug" size="small" value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                helperText="Örnek: hakkimizda, kvkk, iletisim, sss, ekipmanlar" />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 1 }} />
              <Typography fontWeight={600} fontSize={14} sx={{ mb: 1 }}>Hero (Sayfa Üst Banner)</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                Görsel yüklerseniz sayfanın üst banner'ına arkaplan olur. Boş bırakırsanız varsayılan kahverengi gradient kullanılır.
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <ImageUpload
                label="Hero Arkaplan Görseli (önerilen 1920x800px)"
                value={form.heroImage}
                onChange={(url) => setForm((prev) => ({ ...prev, heroImage: typeof url === 'string' ? url : '' }))}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth size="small" label="Üst Etiket (kicker)" value={form.heroKicker}
                onChange={(e) => setForm({ ...form, heroKicker: e.target.value })}
                helperText="Örn: 'Yasal Bilgiler', 'Müşteri Hizmetleri' (başlığın üstünde gösterilir)" />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography variant="body2" fontWeight={600} sx={{ mr: 'auto' }}>
                  Icerik (HTML)
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  component="label"
                  startIcon={<span>📷</span>}
                  sx={{ borderStyle: 'dashed' }}
                >
                  Resim Ekle
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const res = await uploadApi.uploadSingle(file);
                        const url = (res?.data || res)?.url;
                        if (url) {
                          const imgTag = `\n<img src="${url}" alt="${file.name.replace(/\.[^.]+$/, '')}" style="max-width:100%;height:auto;border-radius:8px;margin:1em 0;" />\n`;
                          setForm((prev) => ({ ...prev, content: prev.content + imgTag }));
                        }
                      } catch (err) {
                        console.error('Upload error:', err);
                      }
                      e.target.value = '';
                    }}
                  />
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    const tag = prompt('Hangi HTML etiketi? (h2, h3, p, ul, li, strong, a)', 'h2');
                    if (!tag) return;
                    const text = prompt(`${tag} icerigi:`, '');
                    if (text !== null) {
                      setForm((prev) => ({ ...prev, content: prev.content + `\n<${tag}>${text}</${tag}>\n` }));
                    }
                  }}
                >
                  HTML Ekle
                </Button>
              </Box>
              <TextField
                fullWidth
                size="small"
                multiline
                rows={14}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                helperText="HTML etiketleri kullanabilirsiniz. 'Resim Ekle' butonu ile yuklenen gorseller otomatik olarak icerige <img> tagi olarak eklenir."
                slotProps={{ htmlInput: { style: { fontFamily: 'ui-monospace, Menlo, Monaco, monospace', fontSize: 13 } } }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 1 }} />
              <Typography fontWeight={600} fontSize={14} sx={{ mb: 1 }}>SEO Ayarlari</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="SEO Title" size="small" value={form.seoTitle}
                onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <ImageUpload
                label="SEO Paylasim Gorseli (onerilen: 1200x630px, sosyal medya icin)"
                value={form.seoImage}
                onChange={(url) => setForm({ ...form, seoImage: url as string })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="SEO Description" size="small" multiline rows={2} value={form.seoDescription}
                onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={<Switch checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />}
                label="Yayinla"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Iptal</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !form.title || !form.slug}>
            {saving ? 'Kaydediliyor...' : editing ? 'Guncelle' : 'Olustur'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
