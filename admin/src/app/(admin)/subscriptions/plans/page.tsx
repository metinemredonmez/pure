'use client';

import { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, CardHeader, Typography, Grid, Button, TextField, Stack,
  Divider, Accordion, AccordionSummary, AccordionDetails, Tabs, Tab,
} from '@mui/material';
import {
  Add as AddIcon, Delete as DeleteIcon, ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { websiteApi } from '@/lib/api';
import { olentiaColors } from '@/lib/theme';
import PageHeader from '@/components/common/PageHeader';
import ImageUpload from '@/components/common/ImageUpload';
import { useToast } from '@/contexts/ToastContext';

// ───────── Types ─────────
interface IconStep { id: string; title: string; desc: string; icon: string }
interface FaqItem { id: string; q: string; a: string }
interface PackageOption { id: string; label: string; count: number; grams: number; packageName: string }
interface SeriesOption { id: string; label: string }
interface GrindOption { id: string; label: string }
interface TurkCfg {
  enabled: boolean
  packages: PackageOption[]
  prices: Record<string, number>
}
interface WithSeriesCfg {
  enabled: boolean
  series: SeriesOption[]
  grinds: GrindOption[]
  packages: PackageOption[]
  prices: Record<string, Record<string, number>>
}
interface SubscriptionConfig {
  turk: TurkCfg
  espresso: WithSeriesCfg
  filtre: WithSeriesCfg
}

// ───────── Defaults ─────────
const STEP_ICON_OPTIONS = [
  { value: 'coffee', label: 'Kahve' },
  { value: 'package', label: 'Paket' },
  { value: 'truck', label: 'Kargo' },
  { value: 'gift', label: 'Hediye' },
];
const DEFAULT_SUB_STEPS: IconStep[] = [
  { id: 'st1', title: 'Plan Seçin', desc: 'Size uygun paketi seçin', icon: 'coffee' },
  { id: 'st2', title: 'Taze Kavrulsun', desc: 'Sipariş üzerine kavrulur', icon: 'package' },
  { id: 'st3', title: 'Kapınıza Gelsin', desc: 'Ücretsiz hızlı kargo', icon: 'truck' },
  { id: 'st4', title: 'Her Ay Yeni Lezzet', desc: 'Farklı menşeiler', icon: 'gift' },
];
const DEFAULT_SUB_FAQ: FaqItem[] = [
  { id: 'q1', q: 'Aboneliğimi istediğim zaman iptal edebilir miyim?', a: 'Evet, dilediğiniz zaman hesabınızdan iptal edebilirsiniz.' },
];
const DEFAULT_CONFIG: SubscriptionConfig = {
  turk: {
    enabled: true,
    packages: [
      { id: 'turk-12x100', label: '100 g x 12 Adet', count: 12, grams: 100, packageName: 'Ev Başlangıç Paketi' },
      { id: 'turk-5x200', label: '200 g x 5 Adet', count: 5, grams: 200, packageName: 'Düzenli Kahve Paketi' },
      { id: 'turk-4x1000', label: '1000 g x 4 Adet', count: 4, grams: 1000, packageName: 'Mini Ofis Paketi' },
    ],
    prices: { 'turk-12x100': 0, 'turk-5x200': 0, 'turk-4x1000': 0 },
  },
  espresso: {
    enabled: true,
    series: [
      { id: 'blend', label: 'Blend' },
      { id: 'single-origin', label: 'Single Origin' },
      { id: 'single-origin-premium', label: 'Single Origin Premium' },
    ],
    grinds: [
      { id: 'cekirdek', label: 'Çekirdek — Öğütülmemiş' },
      { id: 'ogutulmus', label: 'Öğütülmüş Kahve' },
    ],
    packages: [
      { id: 'esp-4x250', label: '250 g x 4 Adet', count: 4, grams: 250, packageName: 'Ev Başlangıç Paketi' },
      { id: 'esp-2x1000', label: '1000 g x 2 Adet', count: 2, grams: 1000, packageName: 'Düzenli Kahve Paketi' },
      { id: 'esp-4x1000', label: '1000 g x 4 Adet', count: 4, grams: 1000, packageName: 'Mini Ofis Paketi' },
    ],
    prices: {
      'blend': { 'esp-4x250': 0, 'esp-2x1000': 0, 'esp-4x1000': 0 },
      'single-origin': { 'esp-4x250': 0, 'esp-2x1000': 0, 'esp-4x1000': 0 },
      'single-origin-premium': { 'esp-4x250': 0, 'esp-2x1000': 0, 'esp-4x1000': 0 },
    },
  },
  filtre: {
    enabled: true,
    series: [
      { id: 'blend', label: 'Blend' },
      { id: 'single-origin', label: 'Single Origin' },
      { id: 'single-origin-premium', label: 'Single Origin Premium' },
    ],
    grinds: [
      { id: 'cekirdek', label: 'Çekirdek — Öğütülmemiş' },
      { id: 'filtre-aeropress', label: 'Filtre Kahve / Aeropress' },
    ],
    packages: [
      { id: 'flt-4x250', label: '250 g x 4 Adet', count: 4, grams: 250, packageName: 'Ev Başlangıç Paketi' },
      { id: 'flt-2x1000', label: '1000 g x 2 Adet', count: 2, grams: 1000, packageName: 'Düzenli Kahve Paketi' },
      { id: 'flt-4x1000', label: '1000 g x 4 Adet', count: 4, grams: 1000, packageName: 'Mini Ofis Paketi' },
    ],
    prices: {
      'blend': { 'flt-4x250': 0, 'flt-2x1000': 0, 'flt-4x1000': 0 },
      'single-origin': { 'flt-4x250': 0, 'flt-2x1000': 0, 'flt-4x1000': 0 },
      'single-origin-premium': { 'flt-4x250': 0, 'flt-2x1000': 0, 'flt-4x1000': 0 },
    },
  },
};

export default function SubscriptionPlansPage() {
  const { showSuccess, showError } = useToast();

  // ── Sayfa Metinleri ──
  const [pageText, setPageText] = useState({
    subscriptionHeroBadge: 'Kahve Aboneliği',
    subscriptionHeroTitle: 'Taze Kavrulmuş Kahve <br /> ile Kapınıza Geliyoruz',
    subscriptionHeroSubtitle: 'Kahveleri hafta başında kavurup, ertesi gün kargoya veriyoruz.',
    subscriptionHeroCta: 'Abone Ol',
    subscriptionHeroImage: '',
    subscriptionSteps: DEFAULT_SUB_STEPS,
    subscriptionFaqHeading: 'Sıkça Sorulan Sorular',
    subscriptionFaq: DEFAULT_SUB_FAQ,
    subscriptionFaqCta: 'Kahveleri Keşfet',
  });
  const [savingText, setSavingText] = useState(false);

  // ── Süre indirimleri ──
  const [discounts, setDiscounts] = useState<{ months: number; percent: number }[]>([
    { months: 3, percent: 0 }, { months: 6, percent: 5 }, { months: 12, percent: 10 },
  ]);
  const [savingDiscounts, setSavingDiscounts] = useState(false);

  // ── Subscription Config (paketler/seriler/öğütümler/fiyatlar) ──
  const [config, setConfig] = useState<SubscriptionConfig>(DEFAULT_CONFIG);
  const [savingConfig, setSavingConfig] = useState(false);
  const [matrixTab, setMatrixTab] = useState<'turk' | 'espresso' | 'filtre'>('turk');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      const res = await websiteApi.getSettings();
      const data = res.data || res || {};
      setPageText({
        subscriptionHeroBadge: data.subscriptionHeroBadge || 'Kahve Aboneliği',
        subscriptionHeroTitle: data.subscriptionHeroTitle || 'Taze Kavrulmuş Kahve <br /> ile Kapınıza Geliyoruz',
        subscriptionHeroSubtitle: data.subscriptionHeroSubtitle || 'Kahveleri hafta başında kavurup, ertesi gün kargoya veriyoruz.',
        subscriptionHeroCta: data.subscriptionHeroCta || 'Abone Ol',
        subscriptionHeroImage: data.subscriptionHeroImage || '',
        subscriptionSteps: Array.isArray(data.subscriptionSteps) && data.subscriptionSteps.length ? data.subscriptionSteps : DEFAULT_SUB_STEPS,
        subscriptionFaqHeading: data.subscriptionFaqHeading || 'Sıkça Sorulan Sorular',
        subscriptionFaq: Array.isArray(data.subscriptionFaq) && data.subscriptionFaq.length ? data.subscriptionFaq : DEFAULT_SUB_FAQ,
        subscriptionFaqCta: data.subscriptionFaqCta || 'Kahveleri Keşfet',
      });
      if (Array.isArray(data.subscriptionDurationDiscounts) && data.subscriptionDurationDiscounts.length) {
        setDiscounts(data.subscriptionDurationDiscounts);
      }
      if (data.subscriptionConfig && typeof data.subscriptionConfig === 'object') {
        // Merge with defaults to handle missing fields
        const incoming = data.subscriptionConfig as Partial<SubscriptionConfig>;
        setConfig({
          turk: { ...DEFAULT_CONFIG.turk, ...incoming.turk },
          espresso: { ...DEFAULT_CONFIG.espresso, ...incoming.espresso },
          filtre: { ...DEFAULT_CONFIG.filtre, ...incoming.filtre },
        });
      }
    } catch {}
  };

  const savePageText = async () => {
    setSavingText(true);
    try {
      await websiteApi.updateMultipleSettings(
        Object.entries(pageText).map(([key, value]) => ({ key, value }))
      );
      showSuccess('Sayfa metinleri kaydedildi');
    } catch { showError('Kayıt başarısız'); }
    setSavingText(false);
  };

  const saveDiscounts = async () => {
    setSavingDiscounts(true);
    try {
      await websiteApi.updateMultipleSettings([{ key: 'subscriptionDurationDiscounts', value: discounts }]);
      showSuccess('İndirim oranları kaydedildi');
    } catch { showError('Kayıt başarısız'); }
    setSavingDiscounts(false);
  };

  const saveConfig = async () => {
    setSavingConfig(true);
    try {
      await websiteApi.updateMultipleSettings([{ key: 'subscriptionConfig', value: config }]);
      showSuccess('Abonelik konfigürasyonu kaydedildi');
    } catch { showError('Kayıt başarısız'); }
    setSavingConfig(false);
  };

  // ── Helpers — fiyatlar ──
  const updateTurkPrice = (pkgId: string, val: string) => {
    const n = Number(val) || 0;
    setConfig({ ...config, turk: { ...config.turk, prices: { ...config.turk.prices, [pkgId]: n } } });
  };
  const updateWithSeriesPrice = (coffeeKey: 'espresso' | 'filtre', seriesId: string, pkgId: string, val: string) => {
    const n = Number(val) || 0;
    const cfg = config[coffeeKey];
    const newPrices = { ...cfg.prices };
    if (!newPrices[seriesId]) newPrices[seriesId] = {};
    newPrices[seriesId] = { ...newPrices[seriesId], [pkgId]: n };
    setConfig({ ...config, [coffeeKey]: { ...cfg, prices: newPrices } });
  };

  // ── Helpers — paket meta (label / name / count / grams) ──
  const updatePackageMeta = (coffeeKey: 'turk' | 'espresso' | 'filtre', pkgId: string, field: 'label' | 'packageName' | 'count' | 'grams', val: string) => {
    const cfg = config[coffeeKey];
    const newPackages = cfg.packages.map((p) => {
      if (p.id !== pkgId) return p;
      if (field === 'count' || field === 'grams') {
        return { ...p, [field]: Number(val) || 0 };
      }
      return { ...p, [field]: val };
    });
    setConfig({ ...config, [coffeeKey]: { ...cfg, packages: newPackages } });
  };

  // ── Helpers — Series (Espresso / Filtre) ──
  const updateSeriesLabel = (coffeeKey: 'espresso' | 'filtre', seriesId: string, val: string) => {
    const cfg = config[coffeeKey];
    const newSeries = cfg.series.map((s) => s.id === seriesId ? { ...s, label: val } : s);
    setConfig({ ...config, [coffeeKey]: { ...cfg, series: newSeries } });
  };
  const addSeries = (coffeeKey: 'espresso' | 'filtre') => {
    const cfg = config[coffeeKey];
    const newId = `series-${Date.now()}`;
    setConfig({ ...config, [coffeeKey]: { ...cfg, series: [...cfg.series, { id: newId, label: 'Yeni Seri' }] } });
  };
  const removeSeries = (coffeeKey: 'espresso' | 'filtre', seriesId: string) => {
    const cfg = config[coffeeKey];
    const newSeries = cfg.series.filter((s) => s.id !== seriesId);
    const newPrices = { ...cfg.prices };
    delete newPrices[seriesId];
    setConfig({ ...config, [coffeeKey]: { ...cfg, series: newSeries, prices: newPrices } });
  };

  // ── Helpers — Grinds ──
  const updateGrindLabel = (coffeeKey: 'espresso' | 'filtre', grindId: string, val: string) => {
    const cfg = config[coffeeKey];
    const newGrinds = cfg.grinds.map((g) => g.id === grindId ? { ...g, label: val } : g);
    setConfig({ ...config, [coffeeKey]: { ...cfg, grinds: newGrinds } });
  };
  const addGrind = (coffeeKey: 'espresso' | 'filtre') => {
    const cfg = config[coffeeKey];
    const newId = `grind-${Date.now()}`;
    setConfig({ ...config, [coffeeKey]: { ...cfg, grinds: [...cfg.grinds, { id: newId, label: 'Yeni Öğütüm' }] } });
  };
  const removeGrind = (coffeeKey: 'espresso' | 'filtre', grindId: string) => {
    const cfg = config[coffeeKey];
    const newGrinds = cfg.grinds.filter((g) => g.id !== grindId);
    setConfig({ ...config, [coffeeKey]: { ...cfg, grinds: newGrinds } });
  };

  return (
    <Box>
      <PageHeader
        title="Abonelik Yönetimi"
        subtitle="pureolentia.com/subscription sayfasının tüm içeriği ve fiyatları"
        breadcrumbs={[{ label: 'Abonelikler', href: '/subscriptions' }, { label: 'Yönetim' }]}
      />

      <Box sx={{ p: 2, mb: 2, borderRadius: 1, bgcolor: 'action.hover', fontSize: 13 }}>
        ℹ️ Bu sayfada /subscription sayfasının <strong>her şeyi</strong> yönetilir:<br />
        — <strong>📝 Sayfa Metinleri</strong>: hero, "Nasıl Çalışır" 4 ikon, SSS, arka plan görseli<br />
        — <strong>💰 Süre İndirim Oranları</strong>: 3/6/12 ay indirim yüzdeleri<br />
        — <strong>💵 Fiyat Matrisi</strong>: kahve türü + ürün serisi + paket kombinasyonu için 1 gönderim fiyatları
      </Box>

      {/* SAYFA METİNLERİ */}
      <Accordion sx={{ mb: 2 }} defaultExpanded={false}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body1" fontWeight={600}>📝 Sayfa Metinleri (Hero, Adımlar, SSS, Arka Plan Görseli)</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Hero Bölümü</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth size="small" label="Üst Etiket (badge)" value={pageText.subscriptionHeroBadge}
                onChange={(e) => setPageText({ ...pageText, subscriptionHeroBadge: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth size="small" label="Buton Metni" value={pageText.subscriptionHeroCta}
                onChange={(e) => setPageText({ ...pageText, subscriptionHeroCta: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth size="small" label="Başlık (HTML — <br /> ile satır kırabilirsiniz)" value={pageText.subscriptionHeroTitle}
                onChange={(e) => setPageText({ ...pageText, subscriptionHeroTitle: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth size="small" multiline rows={2} label="Alt Yazı" value={pageText.subscriptionHeroSubtitle}
                onChange={(e) => setPageText({ ...pageText, subscriptionHeroSubtitle: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <ImageUpload label="Hero Arka Plan Görseli (1920x800px) — boş ise varsayılan kullanılır"
                value={pageText.subscriptionHeroImage}
                onChange={(url) => setPageText({ ...pageText, subscriptionHeroImage: typeof url === 'string' ? url : '' })} />
            </Grid>

            <Grid size={{ xs: 12 }}><Divider sx={{ my: 1 }} /></Grid>
            <Grid size={{ xs: 12 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Nasıl Çalışır? (4 ikon kartı)</Typography>
                <Button size="small" startIcon={<AddIcon />}
                  onClick={() => setPageText({ ...pageText, subscriptionSteps: [...pageText.subscriptionSteps, { id: `st-${Date.now()}`, title: '', desc: '', icon: 'coffee' }] })}
                >Yeni Adım</Button>
              </Stack>
            </Grid>
            {pageText.subscriptionSteps.map((s, idx) => (
              <Grid size={{ xs: 12 }} key={s.id || idx}>
                <Grid container spacing={1}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField fullWidth size="small" label="Başlık" value={s.title}
                      onChange={(e) => {
                        const arr = [...pageText.subscriptionSteps];
                        arr[idx] = { ...arr[idx], title: e.target.value };
                        setPageText({ ...pageText, subscriptionSteps: arr });
                      }} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField fullWidth size="small" label="Açıklama" value={s.desc}
                      onChange={(e) => {
                        const arr = [...pageText.subscriptionSteps];
                        arr[idx] = { ...arr[idx], desc: e.target.value };
                        setPageText({ ...pageText, subscriptionSteps: arr });
                      }} />
                  </Grid>
                  <Grid size={{ xs: 9, sm: 3 }}>
                    <TextField select fullWidth size="small" label="İkon" value={s.icon}
                      onChange={(e) => {
                        const arr = [...pageText.subscriptionSteps];
                        arr[idx] = { ...arr[idx], icon: e.target.value };
                        setPageText({ ...pageText, subscriptionSteps: arr });
                      }}
                      slotProps={{ select: { native: true } }}>
                      {STEP_ICON_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 3, sm: 1 }}>
                    <Button fullWidth size="small" color="error"
                      onClick={() => setPageText({ ...pageText, subscriptionSteps: pageText.subscriptionSteps.filter((_, i) => i !== idx) })}
                    >Sil</Button>
                  </Grid>
                </Grid>
              </Grid>
            ))}

            <Grid size={{ xs: 12 }}><Divider sx={{ my: 1 }} /></Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth size="small" label="SSS Başlığı" value={pageText.subscriptionFaqHeading}
                onChange={(e) => setPageText({ ...pageText, subscriptionFaqHeading: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth size="small" label="SSS Altı CTA Buton Metni" value={pageText.subscriptionFaqCta}
                onChange={(e) => setPageText({ ...pageText, subscriptionFaqCta: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>SSS Soruları</Typography>
                <Button size="small" startIcon={<AddIcon />}
                  onClick={() => setPageText({ ...pageText, subscriptionFaq: [...pageText.subscriptionFaq, { id: `fq-${Date.now()}`, q: '', a: '' }] })}
                >Yeni Soru</Button>
              </Stack>
            </Grid>
            {pageText.subscriptionFaq.map((f, idx) => (
              <Grid size={{ xs: 12 }} key={f.id || idx}>
                <Box sx={{ p: 1.5, mb: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <Grid container spacing={1}>
                    <Grid size={{ xs: 11 }}>
                      <TextField fullWidth size="small" label="Soru" value={f.q}
                        onChange={(e) => {
                          const arr = [...pageText.subscriptionFaq];
                          arr[idx] = { ...arr[idx], q: e.target.value };
                          setPageText({ ...pageText, subscriptionFaq: arr });
                        }} />
                    </Grid>
                    <Grid size={{ xs: 1 }}>
                      <Button fullWidth size="small" color="error"
                        onClick={() => setPageText({ ...pageText, subscriptionFaq: pageText.subscriptionFaq.filter((_, i) => i !== idx) })}
                      >Sil</Button>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField fullWidth size="small" multiline rows={2} label="Cevap" value={f.a}
                        onChange={(e) => {
                          const arr = [...pageText.subscriptionFaq];
                          arr[idx] = { ...arr[idx], a: e.target.value };
                          setPageText({ ...pageText, subscriptionFaq: arr });
                        }} />
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            ))}

            <Grid size={{ xs: 12 }}>
              <Button variant="contained" startIcon={<SaveIcon />} disabled={savingText}
                onClick={savePageText}
                sx={{ bgcolor: olentiaColors.primary.main }}>
                {savingText ? 'Kaydediliyor...' : 'Sayfa Metinlerini Kaydet'}
              </Button>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* SÜRE İNDİRİMLERİ */}
      <Accordion sx={{ mb: 2 }} defaultExpanded={false}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body1" fontWeight={600}>💰 Süre İndirim Oranları</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            Abonelik süresine göre toplam tutardan düşülecek indirim. Tüm paketler için ortak.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {discounts.map((d, idx) => (
              <TextField
                key={d.months}
                fullWidth size="small" type="number"
                label={`${d.months} Ay İndirimi (%)`}
                value={d.percent}
                onChange={(e) => {
                  const arr = [...discounts];
                  arr[idx] = { ...arr[idx], percent: Number(e.target.value) || 0 };
                  setDiscounts(arr);
                }}
              />
            ))}
          </Stack>
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" startIcon={<SaveIcon />} disabled={savingDiscounts}
              onClick={saveDiscounts}
              sx={{ bgcolor: olentiaColors.primary.main }}>
              {savingDiscounts ? 'Kaydediliyor...' : 'İndirimleri Kaydet'}
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* FİYAT MATRİSİ */}
      <Card sx={{ mb: 2 }}>
        <CardHeader
          title={<Typography variant="body1" fontWeight={600}>💵 Fiyat Matrisi (1 Gönderim Fiyatları)</Typography>}
          subheader="Her kombinasyon için 1 gönderimlik fiyatı (₺) girin. Müşteri seçimleri yaparken bu fiyat × süre × indirim formülüyle toplam hesaplanır."
        />
        <CardContent>
          <Tabs value={matrixTab} onChange={(_, v) => setMatrixTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tab label="Türk Kahvesi (3)" value="turk" />
            <Tab label="Espresso (9)" value="espresso" />
            <Tab label="Filtre Kahve (9)" value="filtre" />
          </Tabs>

          {/* TÜRK */}
          {matrixTab === 'turk' && (
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                Türk Kahvesi'nde ürün serisi yok — sadece paket × fiyat.
              </Typography>
              <Stack spacing={2}>
                {config.turk.packages.map((pkg) => (
                  <Box key={pkg.id} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Grid container spacing={1.5}>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField fullWidth size="small" label="Paket Etiketi" value={pkg.label}
                          onChange={(e) => updatePackageMeta('turk', pkg.id, 'label', e.target.value)} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField fullWidth size="small" label="Otomatik Paket Adı" value={pkg.packageName}
                          onChange={(e) => updatePackageMeta('turk', pkg.id, 'packageName', e.target.value)}
                          helperText="Ev Başlangıç / Düzenli / Mini Ofis" />
                      </Grid>
                      <Grid size={{ xs: 6, sm: 2 }}>
                        <TextField fullWidth size="small" type="number" label="Adet" value={pkg.count}
                          onChange={(e) => updatePackageMeta('turk', pkg.id, 'count', e.target.value)} />
                      </Grid>
                      <Grid size={{ xs: 6, sm: 2 }}>
                        <TextField fullWidth size="small" type="number" label="Gramaj (g)" value={pkg.grams}
                          onChange={(e) => updatePackageMeta('turk', pkg.id, 'grams', e.target.value)} />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
                            Her gönderim toplamı: {pkg.count * pkg.grams} g
                          </Typography>
                          <TextField size="small" type="number" label="1 Gönderim ₺" sx={{ width: 200 }}
                            value={config.turk.prices[pkg.id] ?? 0}
                            onChange={(e) => updateTurkPrice(pkg.id, e.target.value)} />
                        </Stack>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          {/* ESPRESSO / FİLTRE */}
          {(matrixTab === 'espresso' || matrixTab === 'filtre') && (
            <Box>
              {/* Seri (Blend / Single Origin / SO Premium) edit */}
              <Box sx={{ p: 2, mb: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="body2" fontWeight={600}>Ürün Serileri</Typography>
                  <Button size="small" startIcon={<AddIcon />} onClick={() => addSeries(matrixTab)}>
                    Yeni Seri
                  </Button>
                </Stack>
                <Stack spacing={1}>
                  {config[matrixTab].series.map((s) => (
                    <Stack key={s.id} direction="row" spacing={1} alignItems="center">
                      <TextField size="small" label="Seri Adı" sx={{ flex: 1 }}
                        value={s.label}
                        onChange={(e) => updateSeriesLabel(matrixTab, s.id, e.target.value)} />
                      <Button size="small" color="error" onClick={() => removeSeries(matrixTab, s.id)}>
                        <DeleteIcon fontSize="small" />
                      </Button>
                    </Stack>
                  ))}
                </Stack>
              </Box>

              {/* Öğütüm edit */}
              <Box sx={{ p: 2, mb: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="body2" fontWeight={600}>Öğütüm Seçenekleri</Typography>
                  <Button size="small" startIcon={<AddIcon />} onClick={() => addGrind(matrixTab)}>
                    Yeni Öğütüm
                  </Button>
                </Stack>
                <Stack spacing={1}>
                  {config[matrixTab].grinds.map((g) => (
                    <Stack key={g.id} direction="row" spacing={1} alignItems="center">
                      <TextField size="small" label="Öğütüm Adı" sx={{ flex: 1 }}
                        value={g.label}
                        onChange={(e) => updateGrindLabel(matrixTab, g.id, e.target.value)} />
                      <Button size="small" color="error" onClick={() => removeGrind(matrixTab, g.id)}>
                        <DeleteIcon fontSize="small" />
                      </Button>
                    </Stack>
                  ))}
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Öğütüm seçimi fiyatı etkilemez — sadece sipariş detayına yazılır.
                </Typography>
              </Box>

              {/* Paket meta edit */}
              <Box sx={{ p: 2, mb: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Paket Tanımları</Typography>
                <Stack spacing={2}>
                  {config[matrixTab].packages.map((pkg) => (
                    <Box key={pkg.id} sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 1 }}>
                      <Grid container spacing={1}>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <TextField fullWidth size="small" label="Paket Etiketi" value={pkg.label}
                            onChange={(e) => updatePackageMeta(matrixTab, pkg.id, 'label', e.target.value)} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <TextField fullWidth size="small" label="Otomatik Paket Adı" value={pkg.packageName}
                            onChange={(e) => updatePackageMeta(matrixTab, pkg.id, 'packageName', e.target.value)} />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 2 }}>
                          <TextField fullWidth size="small" type="number" label="Adet" value={pkg.count}
                            onChange={(e) => updatePackageMeta(matrixTab, pkg.id, 'count', e.target.value)} />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 2 }}>
                          <TextField fullWidth size="small" type="number" label="Gramaj (g)" value={pkg.grams}
                            onChange={(e) => updatePackageMeta(matrixTab, pkg.id, 'grams', e.target.value)} />
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Stack>
              </Box>

              {/* Fiyat matrisi (seri × paket) */}
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                Fiyatlar — Seri × Paket (1 Gönderim ₺)
              </Typography>
              {config[matrixTab].series.map((series) => (
                <Box key={series.id} sx={{ mb: 3 }}>
                  <Typography variant="body2" fontWeight={700} sx={{ mb: 1, color: olentiaColors.primary.main }}>
                    {series.label}
                  </Typography>
                  <Stack spacing={1}>
                    {config[matrixTab].packages.map((pkg) => (
                      <Stack key={pkg.id} direction="row" alignItems="center" spacing={2}
                        sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight={600}>{pkg.label}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {pkg.packageName} · Her gönderim: {pkg.count} × {pkg.grams}g = {pkg.count * pkg.grams}g
                          </Typography>
                        </Box>
                        <TextField size="small" type="number" label="1 Gönderim ₺" sx={{ width: 200 }}
                          value={config[matrixTab].prices[series.id]?.[pkg.id] ?? 0}
                          onChange={(e) => updateWithSeriesPrice(matrixTab, series.id, pkg.id, e.target.value)} />
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              ))}
            </Box>
          )}

          <Box sx={{ mt: 3 }}>
            <Button variant="contained" startIcon={<SaveIcon />} disabled={savingConfig}
              onClick={saveConfig}
              sx={{ bgcolor: olentiaColors.primary.main }}>
              {savingConfig ? 'Kaydediliyor...' : 'Fiyat Matrisini Kaydet'}
            </Button>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Kaydet'e basmadığın sürece değişiklikler siteye yansımaz.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
