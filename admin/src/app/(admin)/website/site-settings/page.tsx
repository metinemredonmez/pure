'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, TextField, Button, Grid, Divider, Skeleton,
  CardContent, CardHeader,
} from '@mui/material';
import {
  Settings as SettingsIcon, Save as SaveIcon,
} from '@mui/icons-material';
import { websiteApi } from '@/lib/api';
import PageHeader from '@/components/common/PageHeader';
import ImageUpload from '@/components/common/ImageUpload';

interface GramOption { id: string; label: string; grams: number; bags: number }
interface DurationOption { months: number; label: string }
interface PeriodOption { weeks: number; label: string }
interface GrindGroup { kind: string; options: string[] }
interface SubscriptionBasePrices { 'turk-kahvesi': number; 'espresso': number; 'filtre-kahve': number }

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
  kvkkText: string;
  cookiePolicy: string;
  franchiseBanners: string[];
  subscriptionGrams: GramOption[];
  subscriptionBasePrices: SubscriptionBasePrices;
  subscriptionDurations: DurationOption[];
  subscriptionPeriods: PeriodOption[];
  subscriptionGrinds: GrindGroup[];
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
}

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
  kvkkText: '', cookiePolicy: '',
  franchiseBanners: [],
  subscriptionGrams: DEFAULT_GRAMS,
  subscriptionBasePrices: { 'turk-kahvesi': 180, 'espresso': 180, 'filtre-kahve': 200 },
  subscriptionDurations: DEFAULT_DURATIONS,
  subscriptionPeriods: DEFAULT_PERIODS,
  subscriptionGrinds: DEFAULT_GRINDS,
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
        kvkkText: data.kvkkText || '',
        cookiePolicy: data.cookiePolicy || '',
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
                    label="Logo (onerilen: 400x120px, seffaf PNG)"
                    value={settings.logo}
                    onChange={(url) => setSettings({ ...settings, logo: url as string })}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <ImageUpload
                    label="Favicon (onerilen: 64x64px, PNG/ICO)"
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
              subheader="Franchise sayfasindaki 'Pure Olentia Magaza Konsepti' bolumunde gosterilen gorseller. Birden fazla eklerseniz otomatik slideshow olur (5 sn gecis). Onerilen: 1920x820px (21:9 oran)."
              titleTypographyProps={{ fontSize: 15, fontWeight: 600 }}
            />
            <CardContent>
              <ImageUpload
                label="Franchise Banner Gorselleri"
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
              subheader="Abonelik sayfasinda (/subscription) gosterilen gramaj secenekleri ve kategori bazli 250g basina baslangic fiyatlari. Toplam fiyat: baz_fiyat x paket_sayisi x (gramaj/250) x ayda_teslimat x toplam_ay"
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

        {/* Yasal Metinler */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader title="Yasal Metinler" titleTypographyProps={{ fontSize: 15, fontWeight: 600 }} />
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth label="KVKK / Aydinlatma Metni" size="small" multiline rows={6} value={settings.kvkkText}
                    onChange={(e) => setSettings({ ...settings, kvkkText: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth label="Cerez Politikasi" size="small" multiline rows={6} value={settings.cookiePolicy}
                    onChange={(e) => setSettings({ ...settings, cookiePolicy: e.target.value })} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
