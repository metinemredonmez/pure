'use client';

import { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Chip, Skeleton, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, IconButton, Divider,
  Stack, Alert, Avatar,
} from '@mui/material';
import {
  PriceChange as PriceIcon, Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Close as CloseIcon, Info as InfoIcon, TrendingDown, LocalOffer,
} from '@mui/icons-material';
import { pricingApi } from '@/lib/api';
import { olentiaColors } from '@/lib/theme';
import PageHeader from '@/components/common/PageHeader';
import { useToast } from '@/contexts/ToastContext';

interface VolumeDiscount {
  id: string;
  minQuantity: number;
  maxQuantity?: number;
  discountPercent: number;
  productId?: string;
  product?: { name: string };
}

const TIER_COLORS = ['#FFB74D', '#4CAF50', '#42A5F5', '#AB47BC', '#FF6B6B'];

export default function PricingPage() {
  const [loading, setLoading] = useState(true);
  const [discounts, setDiscounts] = useState<VolumeDiscount[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<VolumeDiscount | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', minQuantity: 0, maxQuantity: 0, discountPercent: 0, channel: 'B2C' });
  const [confirmDelete, setConfirmDelete] = useState<VolumeDiscount | null>(null);
  const { showSuccess, showError } = useToast();

  const fetchData = async () => {
    try {
      const r = await pricingApi.getVolumeDiscounts();
      const d = r.data || r;
      setDiscounts(Array.isArray(d) ? d : d.data || []);
    } catch { setDiscounts([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleOpen = (d?: VolumeDiscount) => {
    if (d) {
      setEditingDiscount(d);
      setForm({ name: (d as any).name || '', minQuantity: d.minQuantity, maxQuantity: d.maxQuantity || 0, discountPercent: d.discountPercent, channel: (d as any).channel || 'B2C' });
    } else {
      setEditingDiscount(null);
      setForm({ name: '', minQuantity: 0, maxQuantity: 0, discountPercent: 0, channel: 'B2C' });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const name = form.name || `${form.minQuantity}+ Adet %${form.discountPercent} Indirim`;
      const data = { ...form, name, maxQuantity: form.maxQuantity || undefined };
      if (editingDiscount) {
        await pricingApi.updateVolumeDiscount(editingDiscount.id, data);
        showSuccess('Indirim guncellendi');
      } else {
        await pricingApi.createVolumeDiscount(data);
        showSuccess('Indirim olusturuldu');
      }
      setDialogOpen(false);
      fetchData();
    } catch { showError('Islem basarisiz'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await pricingApi.deleteVolumeDiscount(confirmDelete.id);
      showSuccess('Indirim silindi');
      setConfirmDelete(null);
      fetchData();
    } catch { showError('Silinemedi'); }
  };

  // Sort by minQuantity
  const sorted = [...discounts].sort((a, b) => a.minQuantity - b.minQuantity);

  return (
    <Box>
      <PageHeader
        title="Fiyatlandirma"
        subtitle="Hacim indirimleri ve toplu alis avantajlari"
        breadcrumbs={[{ label: 'Fiyatlandirma' }]}
        action={
          <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => handleOpen()}
            sx={{ bgcolor: olentiaColors.primary.main, '&:hover': { bgcolor: olentiaColors.primary.dark } }}>
            Yeni Indirim
          </Button>
        }
      />

      {/* Info Card */}
      <Alert severity="info" icon={<InfoIcon />}
        sx={{ mb: 3, bgcolor: 'rgba(66,165,245,0.08)', color: 'text.primary', border: '1px solid rgba(66,165,245,0.2)',
          '& .MuiAlert-icon': { color: '#42A5F5' } }}>
        <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>Hacim Indirimi Nasil Calisir?</Typography>
        <Typography variant="caption" color="text.secondary">
          Musteriler belirli miktarin uzerinde urun aldiklariinda otomatik indirim uygulanir.
          Ornegin: 5+ adet alimda %5, 10+ adet alimda %10 indirim.
          Indirimler sepet toplamindan otomatik dusulur. Kupon indirimleriyle birlikte kullanilamaz.
        </Typography>
      </Alert>

      {loading ? (
        <Grid container spacing={2}>
          {[1, 2, 3].map(i => <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}><Skeleton height={140} variant="rounded" /></Grid>)}
        </Grid>
      ) : sorted.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <PriceIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography color="text.secondary" sx={{ mb: 1 }}>Henuz hacim indirimi yok</Typography>
          <Typography variant="caption" color="text.disabled" sx={{ mb: 2, display: 'block' }}>
            Toplu alislarda indirim tanimlayarak satis hacminizi artirin
          </Typography>
          <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => handleOpen()}
            sx={{ bgcolor: olentiaColors.primary.main }}>Ilk Indirimi Olustur</Button>
        </Card>
      ) : (
        <>
          {/* Visual Tier Steps */}
          <Card sx={{ mb: 3, p: 2 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Indirim Kademeleri</Typography>
            <Stack direction="row" spacing={0} sx={{ position: 'relative' }}>
              {sorted.map((d, i) => (
                <Box key={d.id} sx={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                  <Box sx={{
                    height: 4, bgcolor: TIER_COLORS[i % TIER_COLORS.length],
                    borderRadius: i === 0 ? '4px 0 0 4px' : i === sorted.length - 1 ? '0 4px 4px 0' : 0,
                  }} />
                  <Typography variant="h5" fontWeight={800} sx={{ color: TIER_COLORS[i % TIER_COLORS.length], mt: 1 }}>
                    %{d.discountPercent}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {d.minQuantity}+ adet
                    {d.maxQuantity ? ` (max ${d.maxQuantity})` : ''}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Card>

          {/* Discount Cards */}
          <Grid container spacing={2}>
            {sorted.map((d, i) => {
              const color = TIER_COLORS[i % TIER_COLORS.length];
              return (
                <Grid key={d.id} size={{ xs: 6, sm: 4, md: 3 }}>
                  <Card sx={{
                    height: '100%', borderTop: `3px solid ${color}`,
                    transition: 'all 0.2s',
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 6px 24px ${color}15` },
                  }}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: `${color}15`, color }}>
                          <TrendingDown sx={{ fontSize: 18 }} />
                        </Avatar>
                        <Stack direction="row" spacing={0.25}>
                          <IconButton size="small" onClick={() => handleOpen(d)}><EditIcon sx={{ fontSize: 14 }} /></IconButton>
                          <IconButton size="small" color="error" onClick={() => setConfirmDelete(d)}><DeleteIcon sx={{ fontSize: 14 }} /></IconButton>
                        </Stack>
                      </Stack>

                      <Typography variant="h4" fontWeight={800} sx={{ color }}>%{d.discountPercent}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>indirim</Typography>

                      <Stack spacing={0.5}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="caption" color="text.secondary">Min. adet</Typography>
                          <Typography variant="caption" fontWeight={600}>{d.minQuantity}</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="caption" color="text.secondary">Maks. adet</Typography>
                          <Typography variant="caption" fontWeight={600}>{d.maxQuantity || 'Sinirsiz'}</Typography>
                        </Stack>
                        {d.product && (
                          <Chip icon={<LocalOffer sx={{ fontSize: '12px !important' }} />}
                            label={d.product.name} size="small"
                            sx={{ height: 20, fontSize: 10, mt: 0.5, bgcolor: `${color}12`, color, '& .MuiChip-icon': { color } }} />
                        )}
                        {!d.product && (
                          <Chip label="Tum Urunler" size="small" sx={{ height: 20, fontSize: 10, mt: 0.5, bgcolor: 'action.hover' }} />
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* Example calculation */}
          {sorted.length > 0 && (
            <Card sx={{ mt: 3, p: 2, bgcolor: 'rgba(212,121,63,0.05)', border: '1px solid rgba(212,121,63,0.15)' }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Ornek Hesaplama</Typography>
              <Typography variant="caption" color="text.secondary">
                Bir musteri 250g kahve (₺199,90) x {sorted[sorted.length - 1]?.minQuantity || 10} adet siparis verirse:{' '}
                <strong>₺{((199.9 * (sorted[sorted.length - 1]?.minQuantity || 10)) * (1 - (sorted[sorted.length - 1]?.discountPercent || 10) / 100)).toFixed(2)}</strong>
                {' '}(%{sorted[sorted.length - 1]?.discountPercent || 10} indirimle,{' '}
                <span style={{ color: '#4CAF50' }}>₺{((199.9 * (sorted[sorted.length - 1]?.minQuantity || 10)) * ((sorted[sorted.length - 1]?.discountPercent || 10) / 100)).toFixed(2)} tasarruf</span>)
              </Typography>
            </Card>
          )}
        </>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight={700}>{editingDiscount ? 'Indirimi Duzenle' : 'Yeni Hacim Indirimi'}</Typography>
          <IconButton onClick={() => setDialogOpen(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="info" sx={{ '& .MuiAlert-message': { fontSize: 12 } }}>
              Musteri bu miktarda veya uzerinde urun aldiginda otomatik indirim uygulanir.
            </Alert>
            <TextField fullWidth label="Indirim Adi" value={form.name} size="small"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="orn: 10+ Adet Indirimi"
              helperText="Bos birakirsaniz otomatik olusturulur" />
            <TextField fullWidth type="number" label="Minimum Adet" value={form.minQuantity} size="small"
              onChange={(e) => setForm({ ...form, minQuantity: Number(e.target.value) })}
              helperText="Indirimin basladigi minimum urun adedi" />
            <TextField fullWidth type="number" label="Maksimum Adet (0 = sinirsiz)" value={form.maxQuantity} size="small"
              onChange={(e) => setForm({ ...form, maxQuantity: Number(e.target.value) })}
              helperText="0 birakirsaniz ust limit olmaz" />
            <TextField fullWidth type="number" label="Indirim Yuzdesi (%)" value={form.discountPercent} size="small"
              onChange={(e) => setForm({ ...form, discountPercent: Number(e.target.value) })}
              helperText="Sepet toplamindan dusulecek yuzde" />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Iptal</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || form.minQuantity <= 0 || form.discountPercent <= 0}
            sx={{ bgcolor: olentiaColors.primary.main }}>
            {saving ? 'Kaydediliyor...' : editingDiscount ? 'Guncelle' : 'Olustur'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <DeleteIcon sx={{ color: '#f44336' }} />
            <Typography variant="h6" fontWeight={700}>Indirimi Sil</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            <strong>{confirmDelete?.minQuantity}+ adet %{confirmDelete?.discountPercent}</strong> hacim indirimini silmek istediginizden emin misiniz?
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
