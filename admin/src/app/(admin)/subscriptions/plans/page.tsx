'use client';

import { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, CardHeader, Typography, Grid, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Stack, Chip, IconButton,
  Skeleton, Switch, FormControlLabel, Divider, Accordion, AccordionSummary, AccordionDetails,
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Close as CloseIcon, LocalCafe, ExpandMore as ExpandMoreIcon, Save as SaveIcon,
} from '@mui/icons-material';
import { subscriptionsApi, websiteApi } from '@/lib/api';
import { olentiaColors } from '@/lib/theme';
import PageHeader from '@/components/common/PageHeader';
import ImageUpload from '@/components/common/ImageUpload';
import { useToast } from '@/contexts/ToastContext';

interface IconStep { id: string; title: string; desc: string; icon: string }
interface FaqItem { id: string; q: string; a: string }

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
  { id: 'q1', q: 'Aboneliğimi istediğim zaman iptal edebilir miyim?', a: 'Evet, aboneliğinizi dilediğiniz zaman hesabınızdan iptal edebilirsiniz.' },
];

type CoffeeKind = 'turk' | 'espresso' | 'filtre';
interface CoffeeConfig { coffee: CoffeeKind; grams: number[] }

interface SubPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  image?: string | null;
  monthlyWeight: number;
  priceMonthly: number;
  discountPercent: number;
  freeShipping: boolean;
  isActive: boolean;
  sortOrder: number;
  availableGrams?: CoffeeConfig[] | null;
  availableDurations?: any;
  availablePeriods?: any;
  availableGrinds?: any;
  _count?: { subscriptions: number };
}

const COFFEE_KINDS: { id: CoffeeKind; label: string }[] = [
  { id: 'turk', label: 'Türk Kahvesi' },
  { id: 'espresso', label: 'Espresso' },
  { id: 'filtre', label: 'Filtre Kahve' },
];

const PLAN_COLORS = ['#D4793F', '#4CAF50', '#42A5F5', '#AB47BC'];
const formatCurrency = (n: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n);

export default function SubscriptionPlansPage() {
  const [plans, setPlans] = useState<SubPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubPlan | null>(null);
  const [form, setForm] = useState({
    name: '', slug: '', description: '', image: '', monthlyWeight: 250,
    priceMonthly: 0, discountPercent: 0, freeShipping: true, isActive: true, sortOrder: 0,
    // Per-plan config (spec mantığına göre admin'den yönetilebilir)
    coffeeConfigs: [] as CoffeeConfig[],   // Hangi kahveler + her birinin gramaj listesi
    durations: [3, 6] as number[],          // Süre seçenekleri (ay)
    periods: ['monthly'] as string[],       // 'monthly' | 'biweekly'
    bagMultipliers: [] as number[],         // Mini Ofis için (1/2/5 kg). Boş → çarpan yok.
  });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<SubPlan | null>(null);
  const { showSuccess, showError } = useToast();

  // ── Sayfa Metinleri (eskiden Site Ayarları → Abonelik tab'ındaydı) ──
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

  useEffect(() => { fetchPlans(); loadPageText(); }, []);

  const loadPageText = async () => {
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
    } catch {}
  };

  const savePageText = async () => {
    setSavingText(true);
    try {
      await websiteApi.updateMultipleSettings(
        Object.entries(pageText).map(([key, value]) => ({ key, value }))
      );
      showSuccess('Sayfa metinleri kaydedildi');
    } catch {
      showError('Kayıt başarısız');
    }
    setSavingText(false);
  };

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await subscriptionsApi.getPlans();
      const data = res.data || res;
      setPlans(Array.isArray(data) ? data : data.plans || []);
    } catch { setPlans([]); }
    setLoading(false);
  };

  const handleOpenDialog = (plan?: SubPlan) => {
    if (plan) {
      setEditingPlan(plan);
      setForm({
        name: plan.name, slug: plan.slug, description: plan.description || '', image: plan.image || '',
        monthlyWeight: plan.monthlyWeight, priceMonthly: Number(plan.priceMonthly),
        discountPercent: plan.discountPercent, freeShipping: plan.freeShipping,
        isActive: plan.isActive, sortOrder: plan.sortOrder,
        coffeeConfigs: Array.isArray(plan.availableGrams) ? plan.availableGrams as CoffeeConfig[] : [],
        durations: Array.isArray(plan.availableDurations) ? plan.availableDurations as number[] : [3, 6],
        periods: Array.isArray(plan.availablePeriods) ? plan.availablePeriods as string[] : ['monthly'],
        bagMultipliers: Array.isArray(plan.availableGrinds) ? plan.availableGrinds as number[] : [],
      });
    } else {
      setEditingPlan(null);
      setForm({
        name: '', slug: '', description: '', image: '', monthlyWeight: 250, priceMonthly: 0,
        discountPercent: 0, freeShipping: true, isActive: true, sortOrder: plans.length + 1,
        coffeeConfigs: [],
        durations: [3, 6],
        periods: ['monthly'],
        bagMultipliers: [],
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Map UI fields to SubPlan JSON columns (reuse existing schema columns).
      const payload = {
        name: form.name, slug: form.slug, description: form.description, image: form.image,
        monthlyWeight: form.monthlyWeight, priceMonthly: form.priceMonthly,
        discountPercent: form.discountPercent, freeShipping: form.freeShipping,
        isActive: form.isActive, sortOrder: form.sortOrder,
        availableGrams: form.coffeeConfigs,         // [{coffee, grams: number[]}]
        availableDurations: form.durations,          // [3, 6, 12]
        availablePeriods: form.periods,              // ['monthly', 'biweekly']
        availableGrinds: form.bagMultipliers,        // [1, 2, 5] Mini Ofis için
      };
      if (editingPlan) {
        await subscriptionsApi.updatePlan(editingPlan.id, payload);
        showSuccess('Plan guncellendi');
      } else {
        const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        await subscriptionsApi.createPlan({ ...payload, slug });
        showSuccess('Plan olusturuldu');
      }
      setDialogOpen(false);
      fetchPlans();
    } catch { showError('Islem basarisiz'); }
    setSaving(false);
  };

  // ── Yardımcılar: kahve config'i güncelle ──
  const toggleCoffee = (coffee: CoffeeKind) => {
    const exists = form.coffeeConfigs.find((c) => c.coffee === coffee);
    if (exists) {
      setForm({ ...form, coffeeConfigs: form.coffeeConfigs.filter((c) => c.coffee !== coffee) });
    } else {
      setForm({ ...form, coffeeConfigs: [...form.coffeeConfigs, { coffee, grams: [250] }] });
    }
  };
  const updateCoffeeGrams = (coffee: CoffeeKind, gramsStr: string) => {
    const grams = gramsStr.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => Number.isFinite(n) && n > 0);
    setForm({
      ...form,
      coffeeConfigs: form.coffeeConfigs.map((c) => (c.coffee === coffee ? { ...c, grams } : c)),
    });
  };
  const toggleDuration = (months: number) => {
    setForm({
      ...form,
      durations: form.durations.includes(months)
        ? form.durations.filter((d) => d !== months)
        : [...form.durations, months].sort((a, b) => a - b),
    });
  };
  const togglePeriod = (period: string) => {
    setForm({
      ...form,
      periods: form.periods.includes(period)
        ? form.periods.filter((p) => p !== period)
        : [...form.periods, period],
    });
  };
  const updateBagMultipliers = (str: string) => {
    const arr = str.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => Number.isFinite(n) && n > 0);
    setForm({ ...form, bagMultipliers: arr });
  };

  // ── Global Süre İndirimleri (site-settings: subscriptionDurationDiscounts) ──
  const [discounts, setDiscounts] = useState<{ months: number; percent: number }[]>([
    { months: 3, percent: 0 }, { months: 6, percent: 5 }, { months: 12, percent: 10 },
  ]);
  const [savingDiscounts, setSavingDiscounts] = useState(false);

  useEffect(() => {
    websiteApi.getSettings().then((res) => {
      const data = res?.data || res || {};
      if (Array.isArray(data.subscriptionDurationDiscounts) && data.subscriptionDurationDiscounts.length) {
        setDiscounts(data.subscriptionDurationDiscounts);
      }
    }).catch(() => {});
  }, []);

  const saveDiscounts = async () => {
    setSavingDiscounts(true);
    try {
      await websiteApi.updateMultipleSettings([{ key: 'subscriptionDurationDiscounts', value: discounts }]);
      showSuccess('İndirim oranları kaydedildi');
    } catch {
      showError('Kayıt başarısız');
    }
    setSavingDiscounts(false);
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await subscriptionsApi.deletePlan(confirmDelete.id);
      showSuccess('Plan silindi');
      setConfirmDelete(null);
      fetchPlans();
    } catch { showError('Silinemedi'); }
  };

  return (
    <Box>
      <PageHeader
        title="Abonelik Planları (3 Paket)"
        subtitle={`${plans.length} plan — pureolentia.com/subscription sayfasında 3 kart olarak gösterilir`}
        breadcrumbs={[{ label: 'Abonelikler', href: '/subscriptions' }, { label: 'Planlar' }]}
        action={
          <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}
            sx={{ bgcolor: olentiaColors.primary.main, '&:hover': { bgcolor: olentiaColors.primary.dark } }}>
            Yeni Plan
          </Button>
        }
      />

      <Box sx={{ p: 2, mb: 2, borderRadius: 1, bgcolor: 'action.hover', fontSize: 13 }}>
        ℹ️ Bu sayfada <strong>/subscription</strong> sayfası için her şey yönetilir:<br />
        — Aşağıdaki <strong>"Sayfa Metinleri"</strong> bölümünden: hero başlık, alt yazı, badge, CTA butonu, arka plan görseli, "Nasıl Çalışır" 4 ikon kartı, SSS.<br />
        — Aşağıdaki <strong>3 Paket kartından</strong>: paket adı, açıklama, görseli, fiyatı (sıralama: <strong>Sıra alanı</strong>).<br />
        — Kahve fiyatları <strong>Ürünler</strong> sayfasından gelir (her gramaj/ürün kendi fiyatı).
      </Box>

      {/* SAYFA METİNLERİ — eskiden Site Ayarları → Abonelik tab'ındaydı */}
      <Accordion sx={{ mb: 3 }} defaultExpanded={false}>
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
              <ImageUpload
                label="Hero Arka Plan Görseli (önerilen 1920x800px) — boş ise varsayılan kahveli arka plan"
                value={pageText.subscriptionHeroImage}
                onChange={(url) => setPageText({ ...pageText, subscriptionHeroImage: typeof url === 'string' ? url : '' })}
              />
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
              <Button
                variant="contained" startIcon={<SaveIcon />}
                disabled={savingText}
                onClick={savePageText}
                sx={{ bgcolor: olentiaColors.primary.main }}
              >
                {savingText ? 'Kaydediliyor...' : 'Sayfa Metinlerini Kaydet'}
              </Button>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Süre İndirim Oranları — global */}
      <Accordion sx={{ mb: 3 }} defaultExpanded={false}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body1" fontWeight={600}>💰 Süre İndirim Oranları (Spec madde 9)</Typography>
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
                helperText={`örn: ${d.months === 3 ? '0' : d.months === 6 ? '5' : '10'}`}
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

      <Typography variant="h6" sx={{ mb: 2, mt: 1, fontWeight: 600 }}>3 Paket Kartı</Typography>

      {loading ? (
        <Grid container spacing={2}>
          {[1, 2, 3].map(i => <Grid key={i} size={{ xs: 12, md: 4 }}><Skeleton height={200} variant="rounded" /></Grid>)}
        </Grid>
      ) : plans.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary" sx={{ mb: 2 }}>Henuz plan yok</Typography>
          <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}
            sx={{ bgcolor: olentiaColors.primary.main }}>Ilk Plan</Button>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {plans.map((plan, i) => {
            const color = PLAN_COLORS[i % PLAN_COLORS.length];
            return (
              <Grid key={plan.id} size={{ xs: 6, sm: 4, md: 3 }}>
                <Card sx={{
                  height: '100%',
                  borderTop: `3px solid ${color}`,
                  transition: 'all 0.2s',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 6px 24px ${color}15` },
                  opacity: plan.isActive ? 1 : 0.5,
                }}>
                  <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                    {/* Top row */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                      <Typography variant="subtitle1" fontWeight={700}>{plan.name}</Typography>
                      <Stack direction="row" spacing={0.25}>
                        <IconButton size="small" onClick={() => handleOpenDialog(plan)}><EditIcon sx={{ fontSize: 15 }} /></IconButton>
                        <IconButton size="small" color="error" onClick={() => setConfirmDelete(plan)}><DeleteIcon sx={{ fontSize: 15 }} /></IconButton>
                      </Stack>
                    </Stack>

                    {plan.description && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2, lineHeight: 1.4 }}>{plan.description}</Typography>
                    )}

                    {/* Price */}
                    <Typography variant="h4" fontWeight={800} sx={{ color, mb: 0.5 }}>
                      {formatCurrency(Number(plan.priceMonthly))}
                      <Typography component="span" variant="body2" color="text.secondary"> /ay</Typography>
                    </Typography>

                    {/* Info row */}
                    <Stack direction="row" spacing={0.5} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
                      <Chip label={`${plan.monthlyWeight}g`} size="small" sx={{ height: 22, fontSize: 10, bgcolor: `${color}12`, color }} />
                      <Chip label={`%${plan.discountPercent}`} size="small" sx={{ height: 22, fontSize: 10, bgcolor: `${color}12`, color }} />
                      {plan.freeShipping && <Chip label="Ucretsiz Kargo" size="small" sx={{ height: 22, fontSize: 10, bgcolor: 'rgba(76,175,80,0.12)', color: '#4caf50' }} />}
                      <Chip label={`${plan._count?.subscriptions || 0} abone`} size="small" sx={{ height: 22, fontSize: 10, bgcolor: 'action.hover' }} />
                      {!plan.isActive && <Chip label="Pasif" size="small" sx={{ height: 22, fontSize: 10, bgcolor: 'rgba(244,67,54,0.12)', color: '#f44336' }} />}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight={700}>{editingPlan ? 'Duzenle' : 'Yeni Plan'}</Typography>
          <IconButton onClick={() => setDialogOpen(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField fullWidth label="Plan Adi" value={form.name} size="small" onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <TextField fullWidth label="Açıklama" value={form.description} size="small" multiline rows={2} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <ImageUpload
              label="Plan Görseli (önerilen 800x600px)"
              value={form.image}
              onChange={(url) => setForm({ ...form, image: typeof url === 'string' ? url : '' })}
            />
            <Stack direction="row" spacing={2}>
              <TextField fullWidth type="number" label="Aylık Fiyat (₺)"
                value={form.priceMonthly} size="small"
                onChange={(e) => setForm({ ...form, priceMonthly: Number(e.target.value) })}
                helperText="Aşağıdaki 'Aylık Miktar' kadar kahve için baz fiyat. Müşteri farklı miktar seçince orantısal hesaplanır." />
              <TextField fullWidth type="number" label="Aylık Miktar (g)"
                value={form.monthlyWeight} size="small"
                onChange={(e) => setForm({ ...form, monthlyWeight: Number(e.target.value) })}
                helperText="Bu plan'ın baz aylık kahve miktarı (örn 1000g = 1kg/ay). Üstündeki fiyat bu miktar için." />
            </Stack>
            {form.priceMonthly > 0 && form.monthlyWeight > 0 && (
              <Box sx={{
                p: 1.5,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'action.hover',
              }}>
                <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                  Birim fiyat: {formatCurrency(form.priceMonthly / (form.monthlyWeight / 1000))} / kg
                  {' '}({formatCurrency(form.priceMonthly / (form.monthlyWeight / 250))} / 250g paket)
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                  Müşteri 500g/ay seçerse aylık {formatCurrency(form.priceMonthly / 2)}, 2kg/ay seçerse aylık {formatCurrency(form.priceMonthly * 2)} öder.
                </Typography>
              </Box>
            )}
            <Stack direction="row" spacing={2}>
              <TextField fullWidth type="number" label="Indirim (%)" value={form.discountPercent} size="small" onChange={(e) => setForm({ ...form, discountPercent: Number(e.target.value) })} />
              <TextField fullWidth type="number" label="Sira" value={form.sortOrder} size="small" onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
            </Stack>
            <Stack direction="row" spacing={2}>
              <FormControlLabel control={<Switch checked={form.freeShipping} onChange={(e) => setForm({ ...form, freeShipping: e.target.checked })} size="small" />} label="Ucretsiz Kargo" />
              <FormControlLabel control={<Switch checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} size="small" />} label="Aktif" />
            </Stack>

            <Divider sx={{ my: 1 }} />

            {/* PAKET KONFİGÜRASYONU — spec'e göre admin tam kontrol */}
            <Typography variant="body1" fontWeight={700} sx={{ mt: 1 }}>
              ☕ Paket Konfigürasyonu (Spec)
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
              Bu plan seçildiğinde müşterinin göreceği kahve türü, gramaj, süre ve sıklık seçenekleri.
              Fiyat <strong>Ürünler</strong> sayfasındaki ürün/varyasyon fiyatından çekilir.
            </Typography>

            {/* Kahve Türleri + Gramaj */}
            <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Kahve Türleri & Gramajlar</Typography>
              <Stack spacing={1.5}>
                {COFFEE_KINDS.map((ck) => {
                  const cfg = form.coffeeConfigs.find((c) => c.coffee === ck.id);
                  const enabled = !!cfg;
                  return (
                    <Box key={ck.id}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <FormControlLabel
                          control={
                            <Switch size="small" checked={enabled} onChange={() => toggleCoffee(ck.id)} />
                          }
                          label={ck.label}
                          sx={{ minWidth: 180 }}
                        />
                        {enabled && (
                          <TextField
                            size="small"
                            label="Gramajlar (virgülle ayır, gram cinsinden)"
                            placeholder="örn: 100, 200, 1000"
                            value={cfg!.grams.join(', ')}
                            onChange={(e) => updateCoffeeGrams(ck.id, e.target.value)}
                            sx={{ flex: 1 }}
                            helperText={`Ev Başlangıç: Türk 100,200 / Espresso 250 / Filtre 250 — Düzenli: Türk 200,1000 / Espresso 250,1000 / Filtre 250,1000 — Mini Ofis: hepsi 1000`}
                          />
                        )}
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            </Box>

            {/* Süre Seçenekleri */}
            <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Abonelik Süreleri (Ay)</Typography>
              <Stack direction="row" spacing={1}>
                {[3, 6, 12].map((m) => (
                  <Chip
                    key={m}
                    label={`${m} Ay`}
                    color={form.durations.includes(m) ? 'primary' : 'default'}
                    variant={form.durations.includes(m) ? 'filled' : 'outlined'}
                    onClick={() => toggleDuration(m)}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Spec: Ev Başlangıç = 3/6 Ay · Düzenli & Mini Ofis = 3/6/12 Ay
              </Typography>
            </Box>

            {/* Gönderim Sıklığı */}
            <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Gönderim Sıklığı</Typography>
              <Stack direction="row" spacing={1}>
                <Chip
                  label="Ayda 1"
                  color={form.periods.includes('monthly') ? 'primary' : 'default'}
                  variant={form.periods.includes('monthly') ? 'filled' : 'outlined'}
                  onClick={() => togglePeriod('monthly')}
                  sx={{ cursor: 'pointer' }}
                />
                <Chip
                  label="15 Günde 1"
                  color={form.periods.includes('biweekly') ? 'primary' : 'default'}
                  variant={form.periods.includes('biweekly') ? 'filled' : 'outlined'}
                  onClick={() => togglePeriod('biweekly')}
                  sx={{ cursor: 'pointer' }}
                />
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Spec: Ev Başlangıç sadece Ayda 1 · Düzenli & Mini Ofis ikisi de
              </Typography>
            </Box>

            {/* Mini Ofis kg çarpanları */}
            <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Mini Ofis kg Çarpanları (opsiyonel)</Typography>
              <TextField
                fullWidth
                size="small"
                label="Çarpanlar (virgülle ayır, kg cinsinden)"
                placeholder="örn: 1, 2, 5"
                value={form.bagMultipliers.join(', ')}
                onChange={(e) => updateBagMultipliers(e.target.value)}
                helperText="Sadece Mini Ofis paketi için: 1/2/5 kg → 1/2/5 adet 1000g paket. Diğer paketler boş bırakın."
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Iptal</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !form.name || form.priceMonthly <= 0}
            sx={{ bgcolor: olentiaColors.primary.main }}>
            {saving ? 'Kaydediliyor...' : editingPlan ? 'Guncelle' : 'Olustur'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <DeleteIcon sx={{ color: '#f44336' }} />
            <Typography variant="h6" fontWeight={700}>Plani Sil</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            <strong>{confirmDelete?.name}</strong> planini silmek istediginizden emin misiniz?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmDelete(null)}>Vazgec</Button>
          <Button variant="contained" color="error" onClick={handleDelete} startIcon={<DeleteIcon />}>Sil</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
