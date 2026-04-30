'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, TextField, Button, Grid, Divider, Skeleton,
  CardContent, CardHeader,
} from '@mui/material';
import {
  Settings as SettingsIcon, Save as SaveIcon, Add as AddIcon,
} from '@mui/icons-material';
import { websiteApi } from '@/lib/api';
import PageHeader from '@/components/common/PageHeader';
import ImageUpload from '@/components/common/ImageUpload';

interface GramOption { id: string; label: string; grams: number; bags: number }
interface DurationOption { months: number; label: string }
interface PeriodOption { weeks: number; label: string }
interface GrindGroup { kind: string; options: string[] }
interface SubscriptionBasePrices { 'turk-kahvesi': number; 'espresso': number; 'filtre-kahve': number }
interface FooterMenuItem { label: string; href: string }
interface FooterMenuGroup { id: string; title: string; items: FooterMenuItem[] }
interface NavMenuChild { id: string; name: string; href: string; description?: string }
interface NavMenuItem { id: string; name: string; href: string; children?: NavMenuChild[] }
interface MegaMenuGroup { id: string; name: string; items: NavMenuChild[] }
interface B2BFeature { id: string; title: string; desc: string; icon: string }
interface B2BStat { id: string; value: string; label: string }
interface IconStep { id: string; title: string; desc: string; icon: string }
interface FaqItem { id: string; q: string; a: string }

interface SiteSettingsState {
  siteName: string;
  logo: string;
  favicon: string;
  footerText: string;
  phone: string;
  email: string;
  address: string;
  mapLat: string;
  mapLng: string;
  workingHours: string;
  facebook: string;
  instagram: string;
  twitter: string;
  linkedin: string;
  youtube: string;
  franchiseBanners: string[];
  subscriptionGrams: GramOption[];
  subscriptionBasePrices: SubscriptionBasePrices;
  subscriptionDurations: DurationOption[];
  subscriptionPeriods: PeriodOption[];
  subscriptionGrinds: GrindGroup[];
  // Promo bölümleri (anasayfa)
  promo1Title: string;
  promo1Subtitle: string;
  promo1Cta: string;
  promo1Image: string;
  promo2Title: string;
  promo2Subtitle: string;
  promo2Cta: string;
  promo2Image: string;
  promo3Title: string;
  promo3Subtitle: string;
  promo3Image: string;
  // Anasayfa bölüm başlıkları
  homeCollectionsHeading: string;
  homeCollectionsSubHeading: string;
  homeNewArrivalsHeading: string;
  homeNewArrivalsSubHeading: string;
  homeBestSellersHeading: string;
  homeBestSellersSubHeading: string;
  homeExpertsHeading: string;
  homeExpertsSubHeading: string;
  homeViewAllLabel: string;
  homeViewAllCaption: string;
  homeCollectionCardCta: string;
  // B2B sayfası hero
  b2bHeroImage: string;
  b2bHeroBadge: string;
  b2bHeroTitle: string;
  b2bHeroSubtitle: string;
  b2bHeroPrimaryCta: string;
  b2bHeroSecondaryCta: string;
  footerMenus: FooterMenuGroup[];
  navMenus: NavMenuItem[];
  megaMenu: MegaMenuGroup[];
  b2bFeatures: B2BFeature[];
  b2bStats: B2BStat[];
  subscriptionHeroBadge: string;
  subscriptionHeroTitle: string;
  subscriptionHeroSubtitle: string;
  subscriptionHeroCta: string;
  subscriptionSteps: IconStep[];
  subscriptionFaqHeading: string;
  subscriptionFaq: FaqItem[];
  subscriptionFaqCta: string;
}

const DEFAULT_FOOTER_MENUS: FooterMenuGroup[] = [
  { id: 'kesfet', title: 'Keşfet', items: [
    { label: 'Blog', href: '/blog' },
    { label: 'Demleme Rehberi', href: '/demleme-rehberi' },
    { label: 'Kahve Sözlüğü', href: '/kahve-sozlugu' },
    { label: 'Ekipmanlar', href: '/ekipmanlar' },
    { label: 'Sadakat Programı', href: '/sadakat' },
  ]},
  { id: 'kurumsal', title: 'Kurumsal', items: [
    { label: 'Kurumsal Satış', href: '/b2b' },
    { label: 'Toptan Satış', href: '/toptan-satis' },
    { label: 'Kurumsal Hediye', href: '/kurumsal-hediye' },
    { label: 'Franchise', href: '/franchise' },
    { label: 'Abonelik', href: '/subscription' },
  ]},
  { id: 'destek', title: 'Destek', items: [
    { label: 'Sipariş Takibi', href: '/siparis-takibi' },
    { label: 'İade & Değişim', href: '/iade-degisim' },
    { label: 'Ödeme & Teslimat', href: '/odeme-teslimat' },
    { label: 'SSS', href: '/sss' },
    { label: 'İletişim', href: '/contact' },
  ]},
  { id: 'yasal', title: 'Yasal', items: [
    { label: 'Gizlilik Politikası', href: '/gizlilik-politikasi' },
    { label: 'KVKK', href: '/kvkk' },
    { label: 'Mesafeli Satış', href: '/mesafeli-satis' },
    { label: 'Kullanım Koşulları', href: '/kullanim-kosullari' },
    { label: 'Çerez Politikası', href: '/cerez-politikasi' },
  ]},
];

const DEFAULT_NAV_MENUS: NavMenuItem[] = [
  { id: 'kahveler', name: 'Kahveler', href: '/collections/all', children: [
    { id: 'turk-kahvesi', name: 'Türk Kahvesi', href: '/collections/turk-kahvesi', description: 'Geleneksel Türk kahvesi çeşitleri' },
    { id: 'filtre-kahve', name: 'Filtre Kahve', href: '/collections/filtre-kahve', description: 'Pour-over & filtre demleme' },
    { id: 'espresso', name: 'Espresso', href: '/collections/espresso', description: 'Espresso makineleri için özel' },
  ]},
  { id: 'abonelik', name: 'Abonelik', href: '/subscription', children: [
    { id: 'bireysel', name: 'Bireysel Abonelik', href: '/subscription' },
    { id: 'kurumsal-ab', name: 'Kurumsal Abonelik', href: '/b2b' },
  ]},
  { id: 'online-dukkan', name: 'Online Dükkan', href: '/collections/all' },
  { id: 'kesfet', name: 'Keşfet', href: '#', children: [
    { id: 'blog', name: 'Blog', href: '/blog' },
    { id: 'demleme', name: 'Demleme Rehberi', href: '/demleme-rehberi' },
    { id: 'sozluk', name: 'Kahve Sözlüğü', href: '/kahve-sozlugu' },
    { id: 'ekipman', name: 'Ekipmanlar', href: '/ekipmanlar' },
    { id: 'sadakat', name: 'Sadakat Programı', href: '/sadakat' },
  ]},
  { id: 'kurumsal', name: 'Kurumsal', href: '/b2b', children: [
    { id: 'kurumsal-satis', name: 'Kurumsal Satış', href: '/b2b' },
    { id: 'toptan', name: 'Toptan Satış', href: '/toptan-satis' },
    { id: 'hediye', name: 'Kurumsal Hediye', href: '/kurumsal-hediye' },
    { id: 'franchise', name: 'Franchise', href: '/franchise' },
    { id: 'abonelik2', name: 'Abonelik', href: '/subscription' },
  ]},
  { id: 'iletisim', name: 'İletişim', href: '/contact' },
];

const DEFAULT_MEGA_MENU: MegaMenuGroup[] = [
  { id: 'mensei', name: 'Menşei', items: [
    { id: 'ethiopia', name: 'Etiyopya', href: '/collections/ethiopia' },
    { id: 'colombia', name: 'Kolombiya', href: '/collections/colombia' },
    { id: 'brazil', name: 'Brezilya', href: '/collections/brazil' },
    { id: 'kenya', name: 'Kenya', href: '/collections/kenya' },
    { id: 'guatemala', name: 'Guatemala', href: '/collections/guatemala' },
  ]},
  { id: 'isleme', name: 'İşleme Yöntemi', items: [
    { id: 'washed', name: 'Yıkanmış (Washed)', href: '/collections/washed' },
    { id: 'natural', name: 'Doğal (Natural)', href: '/collections/natural' },
    { id: 'honey', name: 'Bal (Honey)', href: '/collections/honey' },
    { id: 'anaerobic', name: 'Anaerobik', href: '/collections/anaerobic' },
  ]},
  { id: 'kavurma', name: 'Kavurma Profili', items: [
    { id: 'light', name: 'Açık Kavurma', href: '/collections/light-roast' },
    { id: 'medium', name: 'Orta Kavurma', href: '/collections/medium-roast' },
    { id: 'dark', name: 'Koyu Kavurma', href: '/collections/dark-roast' },
  ]},
  { id: 'ekipman-mm', name: 'Ekipmanlar', items: [
    { id: 'grinder', name: 'Öğütücüler', href: '/collections/grinders' },
    { id: 'brewer', name: 'Demleme Ekipmanları', href: '/collections/brewers' },
    { id: 'accessory', name: 'Aksesuarlar', href: '/collections/accessories' },
    { id: 'sub-mm', name: 'Abonelik', href: '/subscription' },
  ]},
];

const ICON_OPTIONS = [
  { value: 'price', label: 'Para / Fiyat' },
  { value: 'leaf', label: 'Yaprak / Doğa' },
  { value: 'truck', label: 'Kamyon / Teslimat' },
  { value: 'cap', label: 'Diploma / Eğitim' },
  { value: 'tag', label: 'Etiket' },
  { value: 'person', label: 'Kişi' },
];

const DEFAULT_B2B_FEATURES: B2BFeature[] = [
  { id: 'pricing', title: 'Özel Fiyatlandırma', desc: 'Hacme göre özel indirimli fiyatlar ve esnek ödeme seçenekleri.', icon: 'price' },
  { id: 'roast', title: 'Özel Kavurma Profili', desc: 'Markanıza özel kavurma ve blend oluşturma imkanı.', icon: 'leaf' },
  { id: 'delivery', title: 'Planlı Teslimat', desc: 'Periyodik ve zamanında teslimat garantisi.', icon: 'truck' },
  { id: 'training', title: 'Barista Eğitimi', desc: 'Ekibinize profesyonel barista ve demleme eğitimi.', icon: 'cap' },
  { id: 'label', title: 'Özel Etiketleme', desc: 'Kendi markanızla paketleme ve white-label hizmeti.', icon: 'tag' },
  { id: 'manager', title: 'Kişisel Hesap Yöneticisi', desc: 'Size özel irtibat kişisi ve öncelikli destek.', icon: 'person' },
];

const DEFAULT_B2B_STATS: B2BStat[] = [
  { id: 's1', value: '200+', label: 'Kurumsal Müşteri' },
  { id: 's2', value: '15+', label: 'Şehir' },
  { id: 's3', value: '%98', label: 'Memnuniyet' },
  { id: 's4', value: '24s', label: 'Teslimat' },
];

const STEP_ICON_OPTIONS = [
  { value: 'coffee', label: 'Kahve' },
  { value: 'package', label: 'Paket' },
  { value: 'truck', label: 'Kamyon' },
  { value: 'gift', label: 'Hediye' },
];

const DEFAULT_SUB_STEPS: IconStep[] = [
  { id: 'st1', title: 'Plan Seçin', desc: 'Size uygun paketi seçin', icon: 'coffee' },
  { id: 'st2', title: 'Taze Kavrulsun', desc: 'Sipariş üzerine kavrulur', icon: 'package' },
  { id: 'st3', title: 'Kapınıza Gelsin', desc: 'Ücretsiz hızlı kargo', icon: 'truck' },
  { id: 'st4', title: 'Her Ay Yeni Lezzet', desc: 'Farklı menşeiler', icon: 'gift' },
];

const DEFAULT_SUB_FAQ: FaqItem[] = [
  { id: 'q1', q: 'Aboneliğimi istediğim zaman iptal edebilir miyim?', a: 'Evet, aboneliğinizi dilediğiniz zaman hesabınızdan iptal edebilirsiniz.' },
  { id: 'q2', q: 'Kahve tercihimi değiştirebilir miyim?', a: 'Her teslimat öncesi tercihlerinizi değiştirebilirsiniz.' },
  { id: 'q3', q: 'Teslimat ne zaman yapılır?', a: 'Kahveniz seçtiğiniz periyotlarda taze kavrularak 1-3 iş günü içinde kargoya verilir.' },
  { id: 'q4', q: 'Planları kim düzenliyor?', a: 'Planlar, fiyatlar ve özellikler admin panelden yönetilir, bu sayfada her zaman güncel bilgi görürsünüz.' },
];

const DEFAULT_GRAMS: GramOption[] = [
  { id: '1x250', label: '1 x 250 g', grams: 250, bags: 1 },
  { id: '2x250', label: '2 x 250 g', grams: 500, bags: 2 },
  { id: '3x250', label: '3 x 250 g', grams: 750, bags: 3 },
  { id: '1x1000', label: '1 x 1 kg', grams: 1000, bags: 1 },
];

const DEFAULT_DURATIONS: DurationOption[] = [
  { months: 3, label: '3 ay boyunca' },
  { months: 6, label: '6 ay boyunca' },
  { months: 12, label: '12 ay boyunca' },
];

const DEFAULT_PERIODS: PeriodOption[] = [
  { weeks: 1, label: 'Haftada 1' },
  { weeks: 2, label: '2 haftada 1' },
  { weeks: 4, label: 'Ayda 1' },
];

const DEFAULT_GRINDS: GrindGroup[] = [
  { kind: 'Türk', options: ['Türk'] },
  { kind: 'Espresso', options: ['Espresso', 'Moka Pot'] },
  { kind: 'Filtre', options: ['Filtre', 'French Press', 'Chemex', 'AeroPress'] },
];

const defaultSettings: SiteSettingsState = {
  siteName: '', logo: '', favicon: '', footerText: '',
  phone: '', email: '', address: '', mapLat: '', mapLng: '', workingHours: '',
  facebook: '', instagram: '', twitter: '', linkedin: '', youtube: '',
  franchiseBanners: [],
  subscriptionGrams: DEFAULT_GRAMS,
  subscriptionBasePrices: { 'turk-kahvesi': 180, 'espresso': 180, 'filtre-kahve': 200 },
  subscriptionDurations: DEFAULT_DURATIONS,
  subscriptionPeriods: DEFAULT_PERIODS,
  subscriptionGrinds: DEFAULT_GRINDS,
  promo1Title: 'Taze kavurma, hızlı teslimat.',
  promo1Subtitle: 'Pure Olentia ile ücretsiz kargo ve abonelik indirimi fırsatı.',
  promo1Cta: 'Kahveleri İncele',
  promo1Image: '',
  promo2Title: 'Hediye paketi kahve setleri',
  promo2Subtitle: 'Sevdiklerinize özel kahve deneyimi hediye edin. Taze kavrulmuş, özenle paketlenmiş.',
  promo2Cta: 'Hediye Setleri',
  promo2Image: '',
  promo3Title: 'Fırsatları kaçırmayın.',
  promo3Subtitle: 'Yeni mahsul kahveler, özel indirimler ve kahve dünyasından haberler.',
  promo3Image: '',
  homeCollectionsHeading: 'Daha fazla keşfet',
  homeCollectionsSubHeading: 'Sizin için seçilmiş koleksiyonlar',
  homeNewArrivalsHeading: 'Yeni Gelenler',
  homeNewArrivalsSubHeading: 'Taze kavrulmuş özel kahveler',
  homeBestSellersHeading: 'Çok Satanlar',
  homeBestSellersSubHeading: 'En sevilen kahvelerimiz',
  homeExpertsHeading: 'Uzmanlar seçti',
  homeExpertsSubHeading: 'Haftanın favorileri',
  homeViewAllLabel: 'Daha fazla',
  homeViewAllCaption: 'Tümünü gör',
  homeCollectionCardCta: 'Hepsini Gör',
  b2bHeroImage: '',
  b2bHeroBadge: 'Kurumsal Çözümler',
  b2bHeroTitle: 'İşletmeniz için Premium Kahve Tedariği',
  b2bHeroSubtitle: 'Ofisiniz, restoranınız, oteliniz veya kafeniz için özel fiyatlarla specialty kahve tedarikçisi.',
  b2bHeroPrimaryCta: 'Teklif Alın',
  b2bHeroSecondaryCta: 'Franchise',
  footerMenus: DEFAULT_FOOTER_MENUS,
  navMenus: DEFAULT_NAV_MENUS,
  megaMenu: DEFAULT_MEGA_MENU,
  b2bFeatures: DEFAULT_B2B_FEATURES,
  b2bStats: DEFAULT_B2B_STATS,
  subscriptionHeroBadge: 'Kahve Aboneliği',
  subscriptionHeroTitle: 'Taze Kavrulmuş Kahve <br /> ile Kapınıza Geliyoruz',
  subscriptionHeroSubtitle: 'Kahveleri hafta başında kavurup, ertesi gün kargoya veriyoruz. Seçtiğiniz süre boyunca taze kahvenizi sabit tutacak şekilde hareket ediyoruz.',
  subscriptionHeroCta: 'Abone Ol',
  subscriptionSteps: DEFAULT_SUB_STEPS,
  subscriptionFaqHeading: 'Sıkça Sorulan Sorular',
  subscriptionFaq: DEFAULT_SUB_FAQ,
  subscriptionFaqCta: 'Kahveleri Keşfet',
};

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState<SiteSettingsState>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const res = await websiteApi.getSettings();
      const data = res?.data || res || {};
      setSettings({
        siteName: data.siteName || '',
        logo: data.logo || '',
        favicon: data.favicon || '',
        footerText: data.footerText || '',
        phone: data.phone || '',
        email: data.email || '',
        address: data.address || '',
        mapLat: data.mapLat || '',
        mapLng: data.mapLng || '',
        workingHours: data.workingHours || '',
        facebook: data.facebook || '',
        instagram: data.instagram || '',
        twitter: data.twitter || '',
        linkedin: data.linkedin || '',
        youtube: data.youtube || '',
        franchiseBanners: Array.isArray(data.franchiseBanners) ? data.franchiseBanners : [],
        subscriptionGrams: Array.isArray(data.subscriptionGrams) && data.subscriptionGrams.length
          ? data.subscriptionGrams
          : DEFAULT_GRAMS,
        subscriptionBasePrices: data.subscriptionBasePrices && typeof data.subscriptionBasePrices === 'object'
          ? { ...defaultSettings.subscriptionBasePrices, ...data.subscriptionBasePrices }
          : defaultSettings.subscriptionBasePrices,
        subscriptionDurations: Array.isArray(data.subscriptionDurations) && data.subscriptionDurations.length
          ? data.subscriptionDurations
          : DEFAULT_DURATIONS,
        subscriptionPeriods: Array.isArray(data.subscriptionPeriods) && data.subscriptionPeriods.length
          ? data.subscriptionPeriods
          : DEFAULT_PERIODS,
        subscriptionGrinds: Array.isArray(data.subscriptionGrinds) && data.subscriptionGrinds.length
          ? data.subscriptionGrinds
          : DEFAULT_GRINDS,
        promo1Title: data.promo1Title || defaultSettings.promo1Title,
        promo1Subtitle: data.promo1Subtitle || defaultSettings.promo1Subtitle,
        promo1Cta: data.promo1Cta || defaultSettings.promo1Cta,
        promo1Image: data.promo1Image || '',
        promo2Title: data.promo2Title || defaultSettings.promo2Title,
        promo2Subtitle: data.promo2Subtitle || defaultSettings.promo2Subtitle,
        promo2Cta: data.promo2Cta || defaultSettings.promo2Cta,
        promo2Image: data.promo2Image || '',
        promo3Title: data.promo3Title || defaultSettings.promo3Title,
        promo3Subtitle: data.promo3Subtitle || defaultSettings.promo3Subtitle,
        promo3Image: data.promo3Image || '',
        homeCollectionsHeading: data.homeCollectionsHeading || defaultSettings.homeCollectionsHeading,
        homeCollectionsSubHeading: data.homeCollectionsSubHeading || defaultSettings.homeCollectionsSubHeading,
        homeNewArrivalsHeading: data.homeNewArrivalsHeading || defaultSettings.homeNewArrivalsHeading,
        homeNewArrivalsSubHeading: data.homeNewArrivalsSubHeading || defaultSettings.homeNewArrivalsSubHeading,
        homeBestSellersHeading: data.homeBestSellersHeading || defaultSettings.homeBestSellersHeading,
        homeBestSellersSubHeading: data.homeBestSellersSubHeading || defaultSettings.homeBestSellersSubHeading,
        homeExpertsHeading: data.homeExpertsHeading || defaultSettings.homeExpertsHeading,
        homeExpertsSubHeading: data.homeExpertsSubHeading || defaultSettings.homeExpertsSubHeading,
        homeViewAllLabel: data.homeViewAllLabel || defaultSettings.homeViewAllLabel,
        homeViewAllCaption: data.homeViewAllCaption || defaultSettings.homeViewAllCaption,
        homeCollectionCardCta: data.homeCollectionCardCta || defaultSettings.homeCollectionCardCta,
        b2bHeroImage: data.b2bHeroImage || '',
        b2bHeroBadge: data.b2bHeroBadge || defaultSettings.b2bHeroBadge,
        b2bHeroTitle: data.b2bHeroTitle || defaultSettings.b2bHeroTitle,
        b2bHeroSubtitle: data.b2bHeroSubtitle || defaultSettings.b2bHeroSubtitle,
        b2bHeroPrimaryCta: data.b2bHeroPrimaryCta || defaultSettings.b2bHeroPrimaryCta,
        b2bHeroSecondaryCta: data.b2bHeroSecondaryCta || defaultSettings.b2bHeroSecondaryCta,
        footerMenus: Array.isArray(data.footerMenus) && data.footerMenus.length
          ? data.footerMenus
          : DEFAULT_FOOTER_MENUS,
        navMenus: Array.isArray(data.navMenus) && data.navMenus.length
          ? data.navMenus
          : DEFAULT_NAV_MENUS,
        megaMenu: Array.isArray(data.megaMenu) && data.megaMenu.length
          ? data.megaMenu
          : DEFAULT_MEGA_MENU,
        b2bFeatures: Array.isArray(data.b2bFeatures) && data.b2bFeatures.length
          ? data.b2bFeatures
          : DEFAULT_B2B_FEATURES,
        b2bStats: Array.isArray(data.b2bStats) && data.b2bStats.length
          ? data.b2bStats
          : DEFAULT_B2B_STATS,
        subscriptionHeroBadge: data.subscriptionHeroBadge || defaultSettings.subscriptionHeroBadge,
        subscriptionHeroTitle: data.subscriptionHeroTitle || defaultSettings.subscriptionHeroTitle,
        subscriptionHeroSubtitle: data.subscriptionHeroSubtitle || defaultSettings.subscriptionHeroSubtitle,
        subscriptionHeroCta: data.subscriptionHeroCta || defaultSettings.subscriptionHeroCta,
        subscriptionSteps: Array.isArray(data.subscriptionSteps) && data.subscriptionSteps.length
          ? data.subscriptionSteps
          : DEFAULT_SUB_STEPS,
        subscriptionFaqHeading: data.subscriptionFaqHeading || defaultSettings.subscriptionFaqHeading,
        subscriptionFaq: Array.isArray(data.subscriptionFaq) && data.subscriptionFaq.length
          ? data.subscriptionFaq
          : DEFAULT_SUB_FAQ,
        subscriptionFaqCta: data.subscriptionFaqCta || defaultSettings.subscriptionFaqCta,
      });
    } catch (e: any) {
      setFetchError(e?.message || 'Ayarlar yuklenemedi. Sayfa verilerinizi kaybetmemek icin Kaydet butonu devre disi.');
    }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const entries = Object.entries(settings).map(([key, value]) => ({ key, value }));
      await websiteApi.updateMultipleSettings(entries);
    } catch { /* toast */ }
    finally { setSaving(false); }
  };

  if (loading) {
    return (
      <Box>
        <PageHeader title="Site Ayarlari" icon={<SettingsIcon />} />
        <Card sx={{ mt: 3, p: 3 }}><Skeleton height={400} /></Card>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Site Ayarlari"
        subtitle="Web sitesi genel ayarlari"
        icon={<SettingsIcon />}
        action={
          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving} size="small">
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        }
      />

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Genel */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader title="Genel Bilgiler" titleTypographyProps={{ fontSize: 15, fontWeight: 600 }} />
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth label="Site Adi" size="small" value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <ImageUpload
                    label="Logo (önerilen: 400x120px, şeffaf PNG)"
                    value={settings.logo}
                    onChange={(url) => setSettings({ ...settings, logo: url as string })}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <ImageUpload
                    label="Favicon (önerilen: 64x64px, PNG/ICO)"
                    value={settings.favicon}
                    onChange={(url) => setSettings({ ...settings, favicon: url as string })}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth label="Footer Metni" size="small" value={settings.footerText}
                    onChange={(e) => setSettings({ ...settings, footerText: e.target.value })} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Iletisim */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader title="Iletisim Bilgileri" titleTypographyProps={{ fontSize: 15, fontWeight: 600 }} />
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth label="Telefon" size="small" value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth label="E-posta" size="small" value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth label="Adres" size="small" multiline rows={2} value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField fullWidth label="Harita Lat" size="small" value={settings.mapLat}
                    onChange={(e) => setSettings({ ...settings, mapLat: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField fullWidth label="Harita Lng" size="small" value={settings.mapLng}
                    onChange={(e) => setSettings({ ...settings, mapLng: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth label="Calisma Saatleri" size="small" value={settings.workingHours}
                    onChange={(e) => setSettings({ ...settings, workingHours: e.target.value })}
                    helperText="Ornek: Pzt-Cum 09:00-18:00" />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Sosyal Medya */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader title="Sosyal Medya" titleTypographyProps={{ fontSize: 15, fontWeight: 600 }} />
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth label="Facebook" size="small" value={settings.facebook}
                    onChange={(e) => setSettings({ ...settings, facebook: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth label="Instagram" size="small" value={settings.instagram}
                    onChange={(e) => setSettings({ ...settings, instagram: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth label="Twitter / X" size="small" value={settings.twitter}
                    onChange={(e) => setSettings({ ...settings, twitter: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth label="LinkedIn" size="small" value={settings.linkedin}
                    onChange={(e) => setSettings({ ...settings, linkedin: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth label="YouTube" size="small" value={settings.youtube}
                    onChange={(e) => setSettings({ ...settings, youtube: e.target.value })} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Franchise Banner */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader
              title="Franchise Sayfasi Banner"
              subheader="Franchise sayfasindaki 'Pure Olentia Magaza Konsepti' bolumunde gösterilen gorseller. Birden fazla eklerseniz otomatik slideshow olur (5 sn gecis). Onerilen: 1920x820px (21:9 oran)."
              titleTypographyProps={{ fontSize: 15, fontWeight: 600 }}
            />
            <CardContent>
              <ImageUpload
                label="Franchise Banner Görselleri"
                value={settings.franchiseBanners}
                onChange={(urls) => setSettings({ ...settings, franchiseBanners: Array.isArray(urls) ? urls : urls ? [urls] : [] })}
                multiple
                maxFiles={5}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Abonelik Ayarlari */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader
              title="Abonelik Ayarlari"
              subheader="Abonelik sayfasinda (/subscription) gösterilen gramaj seçenekleri ve kategori bazli 250g basina baslangic fiyatlari. Toplam fiyat: baz_fiyat x paket_sayisi x (gramaj/250) x ayda_teslimat x toplam_ay"
              titleTypographyProps={{ fontSize: 15, fontWeight: 600 }}
            />
            <CardContent>
              <Typography variant="body2" sx={{ mb: 2, fontWeight: 600 }}>Kategori Baz Fiyatlari (₺ / 250g)</Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth size="small" type="number" label="Turk Kahvesi"
                    value={settings.subscriptionBasePrices['turk-kahvesi']}
                    onChange={(e) => setSettings({
                      ...settings,
                      subscriptionBasePrices: { ...settings.subscriptionBasePrices, 'turk-kahvesi': Number(e.target.value) || 0 }
                    })}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth size="small" type="number" label="Espresso"
                    value={settings.subscriptionBasePrices['espresso']}
                    onChange={(e) => setSettings({
                      ...settings,
                      subscriptionBasePrices: { ...settings.subscriptionBasePrices, 'espresso': Number(e.target.value) || 0 }
                    })}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth size="small" type="number" label="Filtre Kahve"
                    value={settings.subscriptionBasePrices['filtre-kahve']}
                    onChange={(e) => setSettings({
                      ...settings,
                      subscriptionBasePrices: { ...settings.subscriptionBasePrices, 'filtre-kahve': Number(e.target.value) || 0 }
                    })}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Gramaj Secenekleri</Typography>
                <Button
                  size="small"
                  onClick={() => {
                    const newOpt: GramOption = { id: `opt-${Date.now()}`, label: 'Yeni Secenek', grams: 250, bags: 1 };
                    setSettings({ ...settings, subscriptionGrams: [...settings.subscriptionGrams, newOpt] });
                  }}
                >
                  + Ekle
                </Button>
              </Box>

              {settings.subscriptionGrams.map((g, idx) => (
                <Grid container spacing={1} key={g.id || idx} sx={{ mb: 1, alignItems: 'center' }}>
                  <Grid size={{ xs: 12, sm: 5 }}>
                    <TextField
                      fullWidth size="small" label="Etiket (ornek: 2 x 250 g)"
                      value={g.label}
                      onChange={(e) => {
                        const arr = [...settings.subscriptionGrams];
                        arr[idx] = { ...arr[idx], label: e.target.value };
                        setSettings({ ...settings, subscriptionGrams: arr });
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <TextField
                      fullWidth size="small" type="number" label="Gram (tek paket)"
                      value={g.grams}
                      onChange={(e) => {
                        const arr = [...settings.subscriptionGrams];
                        arr[idx] = { ...arr[idx], grams: Number(e.target.value) || 0 };
                        setSettings({ ...settings, subscriptionGrams: arr });
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 2 }}>
                    <TextField
                      fullWidth size="small" type="number" label="Paket"
                      value={g.bags}
                      onChange={(e) => {
                        const arr = [...settings.subscriptionGrams];
                        arr[idx] = { ...arr[idx], bags: Number(e.target.value) || 1 };
                        setSettings({ ...settings, subscriptionGrams: arr });
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 2 }}>
                    <Button
                      fullWidth color="error" size="small"
                      onClick={() => {
                        const arr = settings.subscriptionGrams.filter((_, i) => i !== idx);
                        setSettings({ ...settings, subscriptionGrams: arr });
                      }}
                    >
                      Sil
                    </Button>
                  </Grid>
                </Grid>
              ))}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Süre Secenekleri</Typography>
                <Button
                  size="small"
                  onClick={() => setSettings({
                    ...settings,
                    subscriptionDurations: [...settings.subscriptionDurations, { months: 1, label: 'Yeni Süre' }]
                  })}
                >
                  + Ekle
                </Button>
              </Box>
              {settings.subscriptionDurations.map((d, idx) => (
                <Grid container spacing={1} key={idx} sx={{ mb: 1, alignItems: 'center' }}>
                  <Grid size={{ xs: 12, sm: 7 }}>
                    <TextField
                      fullWidth size="small" label="Etiket (ornek: 3 ay boyunca)"
                      value={d.label}
                      onChange={(e) => {
                        const arr = [...settings.subscriptionDurations];
                        arr[idx] = { ...arr[idx], label: e.target.value };
                        setSettings({ ...settings, subscriptionDurations: arr });
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <TextField
                      fullWidth size="small" type="number" label="Ay"
                      value={d.months}
                      onChange={(e) => {
                        const arr = [...settings.subscriptionDurations];
                        arr[idx] = { ...arr[idx], months: Number(e.target.value) || 1 };
                        setSettings({ ...settings, subscriptionDurations: arr });
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 2 }}>
                    <Button
                      fullWidth color="error" size="small"
                      onClick={() => setSettings({
                        ...settings,
                        subscriptionDurations: settings.subscriptionDurations.filter((_, i) => i !== idx)
                      })}
                    >
                      Sil
                    </Button>
                  </Grid>
                </Grid>
              ))}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Peryot Secenekleri</Typography>
                <Button
                  size="small"
                  onClick={() => setSettings({
                    ...settings,
                    subscriptionPeriods: [...settings.subscriptionPeriods, { weeks: 1, label: 'Yeni Peryot' }]
                  })}
                >
                  + Ekle
                </Button>
              </Box>
              {settings.subscriptionPeriods.map((p, idx) => (
                <Grid container spacing={1} key={idx} sx={{ mb: 1, alignItems: 'center' }}>
                  <Grid size={{ xs: 12, sm: 7 }}>
                    <TextField
                      fullWidth size="small" label="Etiket (ornek: 2 haftada 1)"
                      value={p.label}
                      onChange={(e) => {
                        const arr = [...settings.subscriptionPeriods];
                        arr[idx] = { ...arr[idx], label: e.target.value };
                        setSettings({ ...settings, subscriptionPeriods: arr });
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <TextField
                      fullWidth size="small" type="number" label="Hafta"
                      value={p.weeks}
                      onChange={(e) => {
                        const arr = [...settings.subscriptionPeriods];
                        arr[idx] = { ...arr[idx], weeks: Number(e.target.value) || 1 };
                        setSettings({ ...settings, subscriptionPeriods: arr });
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 2 }}>
                    <Button
                      fullWidth color="error" size="small"
                      onClick={() => setSettings({
                        ...settings,
                        subscriptionPeriods: settings.subscriptionPeriods.filter((_, i) => i !== idx)
                      })}
                    >
                      Sil
                    </Button>
                  </Grid>
                </Grid>
              ))}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Cekme Derecesi Secenekleri</Typography>
                <Button
                  size="small"
                  onClick={() => setSettings({
                    ...settings,
                    subscriptionGrinds: [...settings.subscriptionGrinds, { kind: 'Yeni', options: [''] }]
                  })}
                >
                  + Yeni Grup
                </Button>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Her grup, plan adından cikarilan kategori (Türk/Espresso/Filtre). Ornek: Espresso grubunda "Espresso, Moka Pot" gibi.
              </Typography>
              {settings.subscriptionGrinds.map((g, idx) => (
                <Grid container spacing={1} key={idx} sx={{ mb: 1, alignItems: 'center' }}>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <TextField
                      fullWidth size="small" label="Grup (Türk/Espresso/Filtre)"
                      value={g.kind}
                      onChange={(e) => {
                        const arr = [...settings.subscriptionGrinds];
                        arr[idx] = { ...arr[idx], kind: e.target.value };
                        setSettings({ ...settings, subscriptionGrinds: arr });
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 7 }}>
                    <TextField
                      fullWidth size="small" label="Secenekler (virgül ile ayir)"
                      value={(g.options || []).join(', ')}
                      onChange={(e) => {
                        const arr = [...settings.subscriptionGrinds];
                        arr[idx] = { ...arr[idx], options: e.target.value.split(',').map(s => s.trim()).filter(Boolean) };
                        setSettings({ ...settings, subscriptionGrinds: arr });
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 2 }}>
                    <Button
                      fullWidth color="error" size="small"
                      onClick={() => setSettings({
                        ...settings,
                        subscriptionGrinds: settings.subscriptionGrinds.filter((_, i) => i !== idx)
                      })}
                    >
                      Sil
                    </Button>
                  </Grid>
                </Grid>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Anasayfa Bölüm Başlıkları */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader
              title="Anasayfa Bölüm Başlıkları"
              subheader="Anasayfadaki ürün ve koleksiyon bölümlerinin başlık + alt başlıkları. Bunlar tarayıcıda kullanıcıya görünen metinlerdir."
              titleTypographyProps={{ fontSize: 15, fontWeight: 600 }}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Koleksiyonlar Bölümü</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth size="small" label="Başlık" value={settings.homeCollectionsHeading}
                    onChange={(e) => setSettings({ ...settings, homeCollectionsHeading: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth size="small" label="Alt Başlık" value={settings.homeCollectionsSubHeading}
                    onChange={(e) => setSettings({ ...settings, homeCollectionsSubHeading: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth size="small" label="Koleksiyon kart butonu" value={settings.homeCollectionCardCta}
                    onChange={(e) => setSettings({ ...settings, homeCollectionCardCta: e.target.value })}
                    helperText="Her koleksiyon kartının altındaki buton (örn: 'Hepsini Gör')" />
                </Grid>

                <Grid size={{ xs: 12 }}><Divider sx={{ my: 1 }} /></Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Yeni Gelenler Bölümü</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth size="small" label="Başlık" value={settings.homeNewArrivalsHeading}
                    onChange={(e) => setSettings({ ...settings, homeNewArrivalsHeading: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth size="small" label="Alt Başlık" value={settings.homeNewArrivalsSubHeading}
                    onChange={(e) => setSettings({ ...settings, homeNewArrivalsSubHeading: e.target.value })} />
                </Grid>

                <Grid size={{ xs: 12 }}><Divider sx={{ my: 1 }} /></Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Çok Satanlar Bölümü</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth size="small" label="Başlık" value={settings.homeBestSellersHeading}
                    onChange={(e) => setSettings({ ...settings, homeBestSellersHeading: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth size="small" label="Alt Başlık" value={settings.homeBestSellersSubHeading}
                    onChange={(e) => setSettings({ ...settings, homeBestSellersSubHeading: e.target.value })} />
                </Grid>

                <Grid size={{ xs: 12 }}><Divider sx={{ my: 1 }} /></Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Uzman Seçimi Bölümü</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth size="small" label="Başlık" value={settings.homeExpertsHeading}
                    onChange={(e) => setSettings({ ...settings, homeExpertsHeading: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth size="small" label="Alt Başlık" value={settings.homeExpertsSubHeading}
                    onChange={(e) => setSettings({ ...settings, homeExpertsSubHeading: e.target.value })} />
                </Grid>

                <Grid size={{ xs: 12 }}><Divider sx={{ my: 1 }} /></Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>"Tümünü Gör" Kartı (Uzman Seçimi sonu)</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth size="small" label="Üst Etiket" value={settings.homeViewAllLabel}
                    onChange={(e) => setSettings({ ...settings, homeViewAllLabel: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth size="small" label="Alt Etiket" value={settings.homeViewAllCaption}
                    onChange={(e) => setSettings({ ...settings, homeViewAllCaption: e.target.value })} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Anasayfa Promo Bölümleri */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader
              title="Anasayfa Promo Bölümleri"
              subheader="Anasayfadaki 3 promo bölümünün başlık + alt yazı + buton + sağdaki görsel. Görsel boş bırakılırsa varsayılan statik görsel kullanılır."
              titleTypographyProps={{ fontSize: 15, fontWeight: 600 }}
            />
            <CardContent>
              <Grid container spacing={2}>
                {/* Promo 1 */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Promo 1 — "Taze kavurma, hızlı teslimat" bölümü</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth size="small" label="Başlık" value={settings.promo1Title}
                    onChange={(e) => setSettings({ ...settings, promo1Title: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth size="small" label="Buton Metni" value={settings.promo1Cta}
                    onChange={(e) => setSettings({ ...settings, promo1Cta: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth size="small" multiline rows={2} label="Alt Yazı" value={settings.promo1Subtitle}
                    onChange={(e) => setSettings({ ...settings, promo1Subtitle: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <ImageUpload
                    label="Sağ Görsel (önerilen 800x600px)"
                    value={settings.promo1Image}
                    onChange={(url) => setSettings({ ...settings, promo1Image: typeof url === 'string' ? url : '' })}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}><Divider sx={{ my: 1 }} /></Grid>

                {/* Promo 2 */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Promo 2 — "Hediye paketi kahve setleri" bölümü</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth size="small" label="Başlık" value={settings.promo2Title}
                    onChange={(e) => setSettings({ ...settings, promo2Title: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth size="small" label="Buton Metni" value={settings.promo2Cta}
                    onChange={(e) => setSettings({ ...settings, promo2Cta: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth size="small" multiline rows={2} label="Alt Yazı" value={settings.promo2Subtitle}
                    onChange={(e) => setSettings({ ...settings, promo2Subtitle: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <ImageUpload
                    label="Sol Görsel (önerilen 800x800px, kare)"
                    value={settings.promo2Image}
                    onChange={(url) => setSettings({ ...settings, promo2Image: typeof url === 'string' ? url : '' })}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}><Divider sx={{ my: 1 }} /></Grid>

                {/* Promo 3 — Newsletter */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Promo 3 — Newsletter / "Fırsatları kaçırmayın" bölümü</Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth size="small" label="Başlık" value={settings.promo3Title}
                    onChange={(e) => setSettings({ ...settings, promo3Title: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth size="small" multiline rows={2} label="Alt Yazı" value={settings.promo3Subtitle}
                    onChange={(e) => setSettings({ ...settings, promo3Subtitle: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <ImageUpload
                    label="Sağ Görsel (önerilen 600x600px)"
                    value={settings.promo3Image}
                    onChange={(url) => setSettings({ ...settings, promo3Image: typeof url === 'string' ? url : '' })}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* B2B Hero */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader
              title="B2B / Kurumsal Sayfası Hero"
              subheader="/b2b sayfasının en üstündeki bölüm. Görsel yüklerseniz arka plan olur (üzerine koyu overlay binebilir); boş bırakırsanız varsayılan gradient kullanılır. Önerilen görsel: 1920x800px."
              titleTypographyProps={{ fontSize: 15, fontWeight: 600 }}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <ImageUpload
                    label="Hero Arka Plan Görseli"
                    value={settings.b2bHeroImage}
                    onChange={(url) => setSettings({ ...settings, b2bHeroImage: typeof url === 'string' ? url : '' })}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth size="small" label="Üst Etiket (badge)" value={settings.b2bHeroBadge}
                    onChange={(e) => setSettings({ ...settings, b2bHeroBadge: e.target.value })}
                    helperText="Örn: 'Kurumsal Çözümler'" />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth size="small" label="Birincil Buton Metni" value={settings.b2bHeroPrimaryCta}
                    onChange={(e) => setSettings({ ...settings, b2bHeroPrimaryCta: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth size="small" label="Başlık" value={settings.b2bHeroTitle}
                    onChange={(e) => setSettings({ ...settings, b2bHeroTitle: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth size="small" multiline rows={2} label="Alt Başlık" value={settings.b2bHeroSubtitle}
                    onChange={(e) => setSettings({ ...settings, b2bHeroSubtitle: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth size="small" label="İkincil Buton Metni" value={settings.b2bHeroSecondaryCta}
                    onChange={(e) => setSettings({ ...settings, b2bHeroSecondaryCta: e.target.value })} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Footer Menü Grupları */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader
              title="Footer Menü Grupları"
              subheader="Sitenin altındaki menü kolonları (Keşfet / Kurumsal / Destek / Yasal vb.). Her grubun başlığı + altında istediğiniz kadar link. Sıralama yukarıdan aşağıya, soldan sağa."
              titleTypographyProps={{ fontSize: 15, fontWeight: 600 }}
              action={
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => setSettings({
                    ...settings,
                    footerMenus: [
                      ...settings.footerMenus,
                      { id: `grup-${Date.now()}`, title: 'Yeni Grup', items: [{ label: '', href: '' }] },
                    ],
                  })}
                >
                  Yeni Grup
                </Button>
              }
            />
            <CardContent>
              {settings.footerMenus.length === 0 && (
                <Typography variant="body2" color="text.secondary">Henüz menü grubu yok. "Yeni Grup" ile ekleyin.</Typography>
              )}
              {settings.footerMenus.map((group, gIdx) => (
                <Box key={group.id || gIdx} sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
                    <TextField
                      size="small"
                      label="Grup Başlığı"
                      value={group.title}
                      onChange={(e) => {
                        const arr = [...settings.footerMenus];
                        arr[gIdx] = { ...arr[gIdx], title: e.target.value };
                        setSettings({ ...settings, footerMenus: arr });
                      }}
                      sx={{ flex: 1 }}
                    />
                    <Button
                      size="small" color="error" variant="outlined"
                      onClick={() => setSettings({
                        ...settings,
                        footerMenus: settings.footerMenus.filter((_, i) => i !== gIdx),
                      })}
                    >
                      Grubu Sil
                    </Button>
                  </Box>

                  {group.items.map((item, iIdx) => (
                    <Grid container spacing={1} key={iIdx} sx={{ mb: 1, alignItems: 'center' }}>
                      <Grid size={{ xs: 12, sm: 5 }}>
                        <TextField
                          fullWidth size="small" label="Link Yazısı"
                          value={item.label}
                          onChange={(e) => {
                            const arr = [...settings.footerMenus];
                            const items = [...arr[gIdx].items];
                            items[iIdx] = { ...items[iIdx], label: e.target.value };
                            arr[gIdx] = { ...arr[gIdx], items };
                            setSettings({ ...settings, footerMenus: arr });
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 9, sm: 5 }}>
                        <TextField
                          fullWidth size="small" label="URL (örn: /sss veya https://...)"
                          value={item.href}
                          onChange={(e) => {
                            const arr = [...settings.footerMenus];
                            const items = [...arr[gIdx].items];
                            items[iIdx] = { ...items[iIdx], href: e.target.value };
                            arr[gIdx] = { ...arr[gIdx], items };
                            setSettings({ ...settings, footerMenus: arr });
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 3, sm: 2 }}>
                        <Button
                          fullWidth size="small" color="error"
                          onClick={() => {
                            const arr = [...settings.footerMenus];
                            const items = arr[gIdx].items.filter((_, i) => i !== iIdx);
                            arr[gIdx] = { ...arr[gIdx], items };
                            setSettings({ ...settings, footerMenus: arr });
                          }}
                        >
                          Sil
                        </Button>
                      </Grid>
                    </Grid>
                  ))}

                  <Button
                    size="small" startIcon={<AddIcon />}
                    onClick={() => {
                      const arr = [...settings.footerMenus];
                      arr[gIdx] = { ...arr[gIdx], items: [...arr[gIdx].items, { label: '', href: '' }] };
                      setSettings({ ...settings, footerMenus: arr });
                    }}
                    sx={{ mt: 1 }}
                  >
                    Yeni Link
                  </Button>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Üst Menü (Navbar) */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader
              title="Üst Menü (Navbar)"
              subheader="Sitenin üstündeki ana menü öğeleri (Kahveler / Abonelik / Online Dükkan / Keşfet / Kurumsal / İletişim). Her grubun kendi açılır listesi olabilir."
              titleTypographyProps={{ fontSize: 15, fontWeight: 600 }}
              action={
                <Button size="small" startIcon={<AddIcon />}
                  onClick={() => setSettings({
                    ...settings,
                    navMenus: [...settings.navMenus, { id: `nav-${Date.now()}`, name: 'Yeni', href: '/', children: [] }],
                  })}
                >
                  Yeni Menü
                </Button>
              }
            />
            <CardContent>
              {settings.navMenus.map((m, mIdx) => (
                <Box key={m.id || mIdx} sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <Grid container spacing={1} sx={{ mb: 2, alignItems: 'center' }}>
                    <Grid size={{ xs: 12, sm: 5 }}>
                      <TextField fullWidth size="small" label="Menü Adı" value={m.name}
                        onChange={(e) => {
                          const arr = [...settings.navMenus];
                          arr[mIdx] = { ...arr[mIdx], name: e.target.value };
                          setSettings({ ...settings, navMenus: arr });
                        }} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 5 }}>
                      <TextField fullWidth size="small" label="URL (üst seviye link)" value={m.href}
                        onChange={(e) => {
                          const arr = [...settings.navMenus];
                          arr[mIdx] = { ...arr[mIdx], href: e.target.value };
                          setSettings({ ...settings, navMenus: arr });
                        }}
                        helperText="# yazarsanız sadece dropdown açar" />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 2 }}>
                      <Button fullWidth size="small" color="error" variant="outlined"
                        onClick={() => setSettings({ ...settings, navMenus: settings.navMenus.filter((_, i) => i !== mIdx) })}
                      >
                        Menüyü Sil
                      </Button>
                    </Grid>
                  </Grid>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Açılır liste öğeleri:
                  </Typography>
                  {(m.children || []).map((c, cIdx) => (
                    <Grid container spacing={1} key={cIdx} sx={{ mb: 1 }}>
                      <Grid size={{ xs: 12, sm: 5 }}>
                        <TextField fullWidth size="small" label="Alt link adı" value={c.name}
                          onChange={(e) => {
                            const arr = [...settings.navMenus];
                            const ch = [...(arr[mIdx].children || [])];
                            ch[cIdx] = { ...ch[cIdx], name: e.target.value };
                            arr[mIdx] = { ...arr[mIdx], children: ch };
                            setSettings({ ...settings, navMenus: arr });
                          }} />
                      </Grid>
                      <Grid size={{ xs: 9, sm: 5 }}>
                        <TextField fullWidth size="small" label="URL" value={c.href}
                          onChange={(e) => {
                            const arr = [...settings.navMenus];
                            const ch = [...(arr[mIdx].children || [])];
                            ch[cIdx] = { ...ch[cIdx], href: e.target.value };
                            arr[mIdx] = { ...arr[mIdx], children: ch };
                            setSettings({ ...settings, navMenus: arr });
                          }} />
                      </Grid>
                      <Grid size={{ xs: 3, sm: 2 }}>
                        <Button fullWidth size="small" color="error"
                          onClick={() => {
                            const arr = [...settings.navMenus];
                            const ch = (arr[mIdx].children || []).filter((_, i) => i !== cIdx);
                            arr[mIdx] = { ...arr[mIdx], children: ch };
                            setSettings({ ...settings, navMenus: arr });
                          }}
                        >Sil</Button>
                      </Grid>
                    </Grid>
                  ))}
                  <Button size="small" startIcon={<AddIcon />}
                    onClick={() => {
                      const arr = [...settings.navMenus];
                      const ch = [...(arr[mIdx].children || []), { id: `c-${Date.now()}`, name: '', href: '' }];
                      arr[mIdx] = { ...arr[mIdx], children: ch };
                      setSettings({ ...settings, navMenus: arr });
                    }}
                    sx={{ mt: 1 }}
                  >
                    Alt Link Ekle
                  </Button>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Mega Menu */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader
              title='Mega Menu ("Kahveler" altındaki büyük menü)'
              subheader='Anasayfada "Kahveler" üzerine gelince çıkan büyük menü. Her grup (Menşei, İşleme Yöntemi vb.) altında alt linkler.'
              titleTypographyProps={{ fontSize: 15, fontWeight: 600 }}
              action={
                <Button size="small" startIcon={<AddIcon />}
                  onClick={() => setSettings({
                    ...settings,
                    megaMenu: [...settings.megaMenu, { id: `mm-${Date.now()}`, name: 'Yeni Grup', items: [] }],
                  })}
                >Yeni Grup</Button>
              }
            />
            <CardContent>
              {settings.megaMenu.map((g, gIdx) => (
                <Box key={g.id || gIdx} sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <Grid container spacing={1} sx={{ mb: 2 }}>
                    <Grid size={{ xs: 12, sm: 10 }}>
                      <TextField fullWidth size="small" label="Grup Adı" value={g.name}
                        onChange={(e) => {
                          const arr = [...settings.megaMenu];
                          arr[gIdx] = { ...arr[gIdx], name: e.target.value };
                          setSettings({ ...settings, megaMenu: arr });
                        }} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 2 }}>
                      <Button fullWidth size="small" color="error" variant="outlined"
                        onClick={() => setSettings({ ...settings, megaMenu: settings.megaMenu.filter((_, i) => i !== gIdx) })}
                      >Sil</Button>
                    </Grid>
                  </Grid>
                  {g.items.map((it, iIdx) => (
                    <Grid container spacing={1} key={iIdx} sx={{ mb: 1 }}>
                      <Grid size={{ xs: 12, sm: 5 }}>
                        <TextField fullWidth size="small" label="Link adı" value={it.name}
                          onChange={(e) => {
                            const arr = [...settings.megaMenu];
                            const items = [...arr[gIdx].items];
                            items[iIdx] = { ...items[iIdx], name: e.target.value };
                            arr[gIdx] = { ...arr[gIdx], items };
                            setSettings({ ...settings, megaMenu: arr });
                          }} />
                      </Grid>
                      <Grid size={{ xs: 9, sm: 5 }}>
                        <TextField fullWidth size="small" label="URL" value={it.href}
                          onChange={(e) => {
                            const arr = [...settings.megaMenu];
                            const items = [...arr[gIdx].items];
                            items[iIdx] = { ...items[iIdx], href: e.target.value };
                            arr[gIdx] = { ...arr[gIdx], items };
                            setSettings({ ...settings, megaMenu: arr });
                          }} />
                      </Grid>
                      <Grid size={{ xs: 3, sm: 2 }}>
                        <Button fullWidth size="small" color="error"
                          onClick={() => {
                            const arr = [...settings.megaMenu];
                            arr[gIdx] = { ...arr[gIdx], items: arr[gIdx].items.filter((_, i) => i !== iIdx) };
                            setSettings({ ...settings, megaMenu: arr });
                          }}
                        >Sil</Button>
                      </Grid>
                    </Grid>
                  ))}
                  <Button size="small" startIcon={<AddIcon />}
                    onClick={() => {
                      const arr = [...settings.megaMenu];
                      arr[gIdx] = { ...arr[gIdx], items: [...arr[gIdx].items, { id: `i-${Date.now()}`, name: '', href: '' }] };
                      setSettings({ ...settings, megaMenu: arr });
                    }}
                    sx={{ mt: 1 }}
                  >
                    Link Ekle
                  </Button>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* B2B Stats */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader
              title="/b2b Sayfası Stats Kartları"
              subheader='Hero altındaki 4 sayı kartı (200+ Kurumsal Müşteri / 15+ Şehir / %98 Memnuniyet / 24s Teslimat).'
              titleTypographyProps={{ fontSize: 15, fontWeight: 600 }}
              action={
                <Button size="small" startIcon={<AddIcon />}
                  onClick={() => setSettings({ ...settings, b2bStats: [...settings.b2bStats, { id: `s-${Date.now()}`, value: '', label: '' }] })}
                >Yeni Stat</Button>
              }
            />
            <CardContent>
              {settings.b2bStats.map((s, idx) => (
                <Grid container spacing={1} key={s.id || idx} sx={{ mb: 1 }}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField fullWidth size="small" label="Değer (örn: 200+)" value={s.value}
                      onChange={(e) => {
                        const arr = [...settings.b2bStats];
                        arr[idx] = { ...arr[idx], value: e.target.value };
                        setSettings({ ...settings, b2bStats: arr });
                      }} />
                  </Grid>
                  <Grid size={{ xs: 9, sm: 6 }}>
                    <TextField fullWidth size="small" label="Etiket (örn: Kurumsal Müşteri)" value={s.label}
                      onChange={(e) => {
                        const arr = [...settings.b2bStats];
                        arr[idx] = { ...arr[idx], label: e.target.value };
                        setSettings({ ...settings, b2bStats: arr });
                      }} />
                  </Grid>
                  <Grid size={{ xs: 3, sm: 2 }}>
                    <Button fullWidth size="small" color="error"
                      onClick={() => setSettings({ ...settings, b2bStats: settings.b2bStats.filter((_, i) => i !== idx) })}
                    >Sil</Button>
                  </Grid>
                </Grid>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* B2B Features */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader
              title='/b2b "Neden Pure Olentia?" Özellik Kartları'
              subheader="6 ikon kartı (Özel Fiyatlandırma, Özel Kavurma, Planlı Teslimat, Barista Eğitimi, Özel Etiketleme, Hesap Yöneticisi). Her kart için başlık + açıklama + ikon seçimi."
              titleTypographyProps={{ fontSize: 15, fontWeight: 600 }}
              action={
                <Button size="small" startIcon={<AddIcon />}
                  onClick={() => setSettings({ ...settings, b2bFeatures: [...settings.b2bFeatures, { id: `f-${Date.now()}`, title: '', desc: '', icon: 'price' }] })}
                >Yeni Özellik</Button>
              }
            />
            <CardContent>
              {settings.b2bFeatures.map((f, idx) => (
                <Box key={f.id || idx} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <Grid container spacing={1}>
                    <Grid size={{ xs: 12, sm: 5 }}>
                      <TextField fullWidth size="small" label="Başlık" value={f.title}
                        onChange={(e) => {
                          const arr = [...settings.b2bFeatures];
                          arr[idx] = { ...arr[idx], title: e.target.value };
                          setSettings({ ...settings, b2bFeatures: arr });
                        }} />
                    </Grid>
                    <Grid size={{ xs: 9, sm: 5 }}>
                      <TextField select fullWidth size="small" label="İkon" value={f.icon}
                        onChange={(e) => {
                          const arr = [...settings.b2bFeatures];
                          arr[idx] = { ...arr[idx], icon: e.target.value };
                          setSettings({ ...settings, b2bFeatures: arr });
                        }}
                        slotProps={{ select: { native: true } }}
                      >
                        {ICON_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 3, sm: 2 }}>
                      <Button fullWidth size="small" color="error"
                        onClick={() => setSettings({ ...settings, b2bFeatures: settings.b2bFeatures.filter((_, i) => i !== idx) })}
                      >Sil</Button>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField fullWidth size="small" multiline rows={2} label="Açıklama" value={f.desc}
                        onChange={(e) => {
                          const arr = [...settings.b2bFeatures];
                          arr[idx] = { ...arr[idx], desc: e.target.value };
                          setSettings({ ...settings, b2bFeatures: arr });
                        }} />
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Abonelik Sayfası — Hero / Adımlar / SSS */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader
              title="/subscription Sayfası — Hero, Adımlar, SSS"
              subheader='Abonelik sayfasının üst banner metinleri, "Nasıl çalışır?" 4 ikon kartı ve SSS bölümü. Plan kartları ayrı bir yerden (Abonelikler → Planlar), configurator ayrı (Site Ayarları → Abonelik Ayarları) yönetiliyor.'
              titleTypographyProps={{ fontSize: 15, fontWeight: 600 }}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Hero Bölümü</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth size="small" label="Üst Etiket (badge)" value={settings.subscriptionHeroBadge}
                    onChange={(e) => setSettings({ ...settings, subscriptionHeroBadge: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth size="small" label="Buton Metni" value={settings.subscriptionHeroCta}
                    onChange={(e) => setSettings({ ...settings, subscriptionHeroCta: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth size="small" label="Başlık (HTML — &lt;br /&gt; ile satır kırabilirsiniz)" value={settings.subscriptionHeroTitle}
                    onChange={(e) => setSettings({ ...settings, subscriptionHeroTitle: e.target.value })}
                    helperText='Örn: "Taze Kavrulmuş Kahve <br /> ile Kapınıza Geliyoruz"' />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth size="small" multiline rows={2} label="Alt Yazı" value={settings.subscriptionHeroSubtitle}
                    onChange={(e) => setSettings({ ...settings, subscriptionHeroSubtitle: e.target.value })} />
                </Grid>

                <Grid size={{ xs: 12 }}><Divider sx={{ my: 1 }} /></Grid>

                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Nasıl Çalışır? (4 ikon kartı)</Typography>
                    <Button size="small" startIcon={<AddIcon />}
                      onClick={() => setSettings({ ...settings, subscriptionSteps: [...settings.subscriptionSteps, { id: `st-${Date.now()}`, title: '', desc: '', icon: 'coffee' }] })}
                    >Yeni Adım</Button>
                  </Box>
                </Grid>
                {settings.subscriptionSteps.map((s, idx) => (
                  <Grid size={{ xs: 12 }} key={s.id || idx}>
                    <Grid container spacing={1}>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField fullWidth size="small" label="Başlık" value={s.title}
                          onChange={(e) => {
                            const arr = [...settings.subscriptionSteps];
                            arr[idx] = { ...arr[idx], title: e.target.value };
                            setSettings({ ...settings, subscriptionSteps: arr });
                          }} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField fullWidth size="small" label="Açıklama" value={s.desc}
                          onChange={(e) => {
                            const arr = [...settings.subscriptionSteps];
                            arr[idx] = { ...arr[idx], desc: e.target.value };
                            setSettings({ ...settings, subscriptionSteps: arr });
                          }} />
                      </Grid>
                      <Grid size={{ xs: 9, sm: 3 }}>
                        <TextField select fullWidth size="small" label="İkon" value={s.icon}
                          onChange={(e) => {
                            const arr = [...settings.subscriptionSteps];
                            arr[idx] = { ...arr[idx], icon: e.target.value };
                            setSettings({ ...settings, subscriptionSteps: arr });
                          }}
                          slotProps={{ select: { native: true } }}
                        >
                          {STEP_ICON_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                        </TextField>
                      </Grid>
                      <Grid size={{ xs: 3, sm: 1 }}>
                        <Button fullWidth size="small" color="error"
                          onClick={() => setSettings({ ...settings, subscriptionSteps: settings.subscriptionSteps.filter((_, i) => i !== idx) })}
                        >Sil</Button>
                      </Grid>
                    </Grid>
                  </Grid>
                ))}

                <Grid size={{ xs: 12 }}><Divider sx={{ my: 1 }} /></Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth size="small" label="SSS Başlığı" value={settings.subscriptionFaqHeading}
                    onChange={(e) => setSettings({ ...settings, subscriptionFaqHeading: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>SSS Soruları</Typography>
                    <Button size="small" startIcon={<AddIcon />}
                      onClick={() => setSettings({ ...settings, subscriptionFaq: [...settings.subscriptionFaq, { id: `fq-${Date.now()}`, q: '', a: '' }] })}
                    >Yeni Soru</Button>
                  </Box>
                </Grid>
                {settings.subscriptionFaq.map((f, idx) => (
                  <Grid size={{ xs: 12 }} key={f.id || idx}>
                    <Box sx={{ p: 1.5, mb: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                      <Grid container spacing={1}>
                        <Grid size={{ xs: 11 }}>
                          <TextField fullWidth size="small" label="Soru" value={f.q}
                            onChange={(e) => {
                              const arr = [...settings.subscriptionFaq];
                              arr[idx] = { ...arr[idx], q: e.target.value };
                              setSettings({ ...settings, subscriptionFaq: arr });
                            }} />
                        </Grid>
                        <Grid size={{ xs: 1 }}>
                          <Button fullWidth size="small" color="error"
                            onClick={() => setSettings({ ...settings, subscriptionFaq: settings.subscriptionFaq.filter((_, i) => i !== idx) })}
                          >Sil</Button>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <TextField fullWidth size="small" multiline rows={2} label="Cevap" value={f.a}
                            onChange={(e) => {
                              const arr = [...settings.subscriptionFaq];
                              arr[idx] = { ...arr[idx], a: e.target.value };
                              setSettings({ ...settings, subscriptionFaq: arr });
                            }} />
                        </Grid>
                      </Grid>
                    </Box>
                  </Grid>
                ))}

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth size="small" label="SSS Altı CTA Buton Metni" value={settings.subscriptionFaqCta}
                    onChange={(e) => setSettings({ ...settings, subscriptionFaqCta: e.target.value })} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Eski "Yasal Metinler" kartı kaldırıldı — yasal sayfalar artık
            Web Sitesi → Sayfalar (CMS) üzerinden yönetiliyor (kvkk, cerez-politikasi,
            mesafeli-satis, kullanim-kosullari, gizlilik-politikasi). */}
      </Grid>
    </Box>
  );
}
