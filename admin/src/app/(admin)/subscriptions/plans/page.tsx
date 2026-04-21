'use client';

import { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Stack, Chip, IconButton,
  Skeleton, Switch, FormControlLabel, Divider,
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Close as CloseIcon, LocalCafe,
} from '@mui/icons-material';
import { subscriptionsApi } from '@/lib/api';
import { olentiaColors } from '@/lib/theme';
import PageHeader from '@/components/common/PageHeader';
import { useToast } from '@/contexts/ToastContext';

interface DurationOption { months: number; label: string }
interface PeriodOption { weeks: number; label: string }
interface GrindGroup { kind: string; options: string[] }

interface SubPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  monthlyWeight: number;
  priceMonthly: number;
  discountPercent: number;
  freeShipping: boolean;
  isActive: boolean;
  sortOrder: number;
  availableDurations?: DurationOption[] | null;
  availablePeriods?: PeriodOption[] | null;
  availableGrinds?: GrindGroup[] | null;
  _count?: { subscriptions: number };
}

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

const PLAN_COLORS = ['#D4793F', '#4CAF50', '#42A5F5', '#AB47BC'];
const formatCurrency = (n: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n);

export default function SubscriptionPlansPage() {
  const [plans, setPlans] = useState<SubPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubPlan | null>(null);
  const [form, setForm] = useState({
    name: '', slug: '', description: '', monthlyWeight: 250,
    priceMonthly: 0, discountPercent: 0, freeShipping: true, isActive: true, sortOrder: 0,
    availableDurations: DEFAULT_DURATIONS as DurationOption[],
    availablePeriods: DEFAULT_PERIODS as PeriodOption[],
    availableGrinds: DEFAULT_GRINDS as GrindGroup[],
  });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<SubPlan | null>(null);
  const { showSuccess, showError } = useToast();

  useEffect(() => { fetchPlans(); }, []);

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
        name: plan.name, slug: plan.slug, description: plan.description || '',
        monthlyWeight: plan.monthlyWeight, priceMonthly: Number(plan.priceMonthly),
        discountPercent: plan.discountPercent, freeShipping: plan.freeShipping,
        isActive: plan.isActive, sortOrder: plan.sortOrder,
        availableDurations: Array.isArray(plan.availableDurations) && plan.availableDurations.length ? plan.availableDurations : DEFAULT_DURATIONS,
        availablePeriods: Array.isArray(plan.availablePeriods) && plan.availablePeriods.length ? plan.availablePeriods : DEFAULT_PERIODS,
        availableGrinds: Array.isArray(plan.availableGrinds) && plan.availableGrinds.length ? plan.availableGrinds : DEFAULT_GRINDS,
      });
    } else {
      setEditingPlan(null);
      setForm({
        name: '', slug: '', description: '', monthlyWeight: 250, priceMonthly: 0,
        discountPercent: 0, freeShipping: true, isActive: true, sortOrder: plans.length + 1,
        availableDurations: DEFAULT_DURATIONS, availablePeriods: DEFAULT_PERIODS, availableGrinds: DEFAULT_GRINDS,
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingPlan) {
        await subscriptionsApi.updatePlan(editingPlan.id, form);
        showSuccess('Plan guncellendi');
      } else {
        const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        await subscriptionsApi.createPlan({ ...form, slug });
        showSuccess('Plan olusturuldu');
      }
      setDialogOpen(false);
      fetchPlans();
    } catch { showError('Islem basarisiz'); }
    setSaving(false);
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
        title="Abonelik Planlari"
        subtitle={`${plans.length} plan`}
        breadcrumbs={[{ label: 'Abonelikler', href: '/subscriptions' }, { label: 'Planlar' }]}
        action={
          <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}
            sx={{ bgcolor: olentiaColors.primary.main, '&:hover': { bgcolor: olentiaColors.primary.dark } }}>
            Yeni Plan
          </Button>
        }
      />

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
            <TextField fullWidth label="Aciklama" value={form.description} size="small" multiline rows={2} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <Stack direction="row" spacing={2}>
              <TextField fullWidth type="number" label="Fiyat (TL)" value={form.priceMonthly} size="small" onChange={(e) => setForm({ ...form, priceMonthly: Number(e.target.value) })} />
              <TextField fullWidth type="number" label="Miktar (g)" value={form.monthlyWeight} size="small" onChange={(e) => setForm({ ...form, monthlyWeight: Number(e.target.value) })} />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField fullWidth type="number" label="Indirim (%)" value={form.discountPercent} size="small" onChange={(e) => setForm({ ...form, discountPercent: Number(e.target.value) })} />
              <TextField fullWidth type="number" label="Sira" value={form.sortOrder} size="small" onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
            </Stack>
            <Stack direction="row" spacing={2}>
              <FormControlLabel control={<Switch checked={form.freeShipping} onChange={(e) => setForm({ ...form, freeShipping: e.target.checked })} size="small" />} label="Ucretsiz Kargo" />
              <FormControlLabel control={<Switch checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} size="small" />} label="Aktif" />
            </Stack>

            <Divider sx={{ my: 1 }} />

            {/* Süre Seçenekleri */}
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="body2" fontWeight={600}>Süre Seçenekleri</Typography>
              <Button size="small" onClick={() => setForm({ ...form, availableDurations: [...form.availableDurations, { months: 1, label: 'Yeni Süre' }] })}>+ Ekle</Button>
            </Stack>
            {form.availableDurations.map((d, idx) => (
              <Stack key={idx} direction="row" spacing={1} alignItems="center">
                <TextField sx={{ flex: 1 }} size="small" label="Etiket" value={d.label}
                  onChange={(e) => { const arr = [...form.availableDurations]; arr[idx] = { ...arr[idx], label: e.target.value }; setForm({ ...form, availableDurations: arr }); }} />
                <TextField sx={{ width: 80 }} size="small" type="number" label="Ay" value={d.months}
                  onChange={(e) => { const arr = [...form.availableDurations]; arr[idx] = { ...arr[idx], months: Number(e.target.value) || 1 }; setForm({ ...form, availableDurations: arr }); }} />
                <IconButton size="small" color="error" onClick={() => setForm({ ...form, availableDurations: form.availableDurations.filter((_, i) => i !== idx) })}><DeleteIcon fontSize="small" /></IconButton>
              </Stack>
            ))}

            <Divider sx={{ my: 1 }} />

            {/* Peryot Seçenekleri */}
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="body2" fontWeight={600}>Peryot Seçenekleri</Typography>
              <Button size="small" onClick={() => setForm({ ...form, availablePeriods: [...form.availablePeriods, { weeks: 1, label: 'Yeni Peryot' }] })}>+ Ekle</Button>
            </Stack>
            {form.availablePeriods.map((p, idx) => (
              <Stack key={idx} direction="row" spacing={1} alignItems="center">
                <TextField sx={{ flex: 1 }} size="small" label="Etiket" value={p.label}
                  onChange={(e) => { const arr = [...form.availablePeriods]; arr[idx] = { ...arr[idx], label: e.target.value }; setForm({ ...form, availablePeriods: arr }); }} />
                <TextField sx={{ width: 80 }} size="small" type="number" label="Hafta" value={p.weeks}
                  onChange={(e) => { const arr = [...form.availablePeriods]; arr[idx] = { ...arr[idx], weeks: Number(e.target.value) || 1 }; setForm({ ...form, availablePeriods: arr }); }} />
                <IconButton size="small" color="error" onClick={() => setForm({ ...form, availablePeriods: form.availablePeriods.filter((_, i) => i !== idx) })}><DeleteIcon fontSize="small" /></IconButton>
              </Stack>
            ))}

            <Divider sx={{ my: 1 }} />

            {/* Çekme Derecesi */}
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="body2" fontWeight={600}>Çekme Derecesi</Typography>
              <Button size="small" onClick={() => setForm({ ...form, availableGrinds: [...form.availableGrinds, { kind: 'Yeni', options: [''] }] })}>+ Grup</Button>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Grup adı plandan otomatik çıkarılan kategoriyle eşleşmeli (Türk/Espresso/Filtre).
            </Typography>
            {form.availableGrinds.map((g, idx) => (
              <Stack key={idx} direction="row" spacing={1} alignItems="center">
                <TextField sx={{ width: 130 }} size="small" label="Grup" value={g.kind}
                  onChange={(e) => { const arr = [...form.availableGrinds]; arr[idx] = { ...arr[idx], kind: e.target.value }; setForm({ ...form, availableGrinds: arr }); }} />
                <TextField sx={{ flex: 1 }} size="small" label="Seçenekler (virgülle ayır)" value={(g.options || []).join(', ')}
                  onChange={(e) => { const arr = [...form.availableGrinds]; arr[idx] = { ...arr[idx], options: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }; setForm({ ...form, availableGrinds: arr }); }} />
                <IconButton size="small" color="error" onClick={() => setForm({ ...form, availableGrinds: form.availableGrinds.filter((_, i) => i !== idx) })}><DeleteIcon fontSize="small" /></IconButton>
              </Stack>
            ))}
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
