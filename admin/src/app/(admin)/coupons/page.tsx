'use client';
import { useEffect, useState, useCallback } from 'react';
import { NumberField } from '@/components/NumberField';
import { Box, Typography, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Divider, Skeleton, Stack, Grid, Tooltip, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, LocalOffer as CouponIcon, Close as CloseIcon } from '@mui/icons-material';
import { couponsApi } from '@/lib/api';
import { olentiaColors } from '@/lib/theme';
import PageHeader from '@/components/common/PageHeader';
import ExportButton from '@/components/common/ExportButton';

interface Coupon { id: string; code: string; description?: string; type: string; value: number; minOrderAmount?: number; maxDiscount?: number; maxUses?: number; usedCount?: number; isActive: boolean; startsAt?: string; expiresAt?: string; createdAt: string; }

const typeLabels: Record<string, string> = { percentage: 'Yüzde', fixed: 'Sabit Tutar', free_shipping: 'Ücretsiz Kargo' };

function formatCurrency(n: number) { return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n); }
function formatDate(d: string) { return new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }); }

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({ code: '', description: '', type: 'percentage', value: 0, minOrderAmount: 0, maxDiscount: 0, maxUses: 0, isActive: true, startsAt: '', expiresAt: '' });

  const fetch = useCallback(async () => {
    try { setLoading(true); const r = await couponsApi.getCoupons({ page: page + 1, limit: rowsPerPage }); const d = r.data || r; setCoupons(d.data || d.items || d || []); setTotal(d.meta?.total || d.total || 0); } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [page, rowsPerPage]);
  useEffect(() => { fetch(); }, [fetch]);

  const handleOpen = (c?: Coupon) => {
    if (c) { setEditing(c); setForm({ code: c.code, description: c.description || '', type: c.type, value: c.value, minOrderAmount: c.minOrderAmount || 0, maxDiscount: c.maxDiscount || 0, maxUses: c.maxUses || 0, isActive: c.isActive, startsAt: c.startsAt?.split('T')[0] || '', expiresAt: c.expiresAt?.split('T')[0] || '' }); }
    else {
      const today = new Date().toISOString().split('T')[0];
      const plus30 = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
      setEditing(null);
      setForm({ code: '', description: '', type: 'percentage', value: 0, minOrderAmount: 0, maxDiscount: 0, maxUses: 0, isActive: true, startsAt: today, expiresAt: plus30 });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form, minOrderAmount: form.minOrderAmount || undefined, maxDiscount: form.maxDiscount || undefined, maxUses: form.maxUses || undefined, startsAt: form.startsAt || undefined, expiresAt: form.expiresAt || undefined };
      if (editing) await couponsApi.updateCoupon(editing.id, payload); else await couponsApi.createCoupon(payload);
      setDialogOpen(false); fetch();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => { try { await couponsApi.deleteCoupon(id); setDeleteConfirm(null); fetch(); } catch (e) { console.error(e); } };

  return (
    <Box>
      <PageHeader
        title="Kuponlar"
        subtitle="İndirim kuponlarını yönet"
        breadcrumbs={[{ label: 'Kuponlar' }]}
        action={
          <Stack direction="row" spacing={1} alignItems="center">
            <ExportButton
              data={coupons}
              columns={[
                { key: 'code', label: 'Kod' },
                { key: 'type', label: 'Tip' },
                { key: 'value', label: 'Değer' },
                { key: 'usedCount', label: 'Kullanım' },
                { key: 'maxUses', label: 'Maks. Kullanım' },
                { key: 'isActive', label: 'Durum' },
                { key: 'expiresAt', label: 'Bitiş' },
              ]}
              filename="kuponlar"
            />
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()} sx={{ bgcolor: olentiaColors.primary.main, '&:hover': { bgcolor: olentiaColors.primary.dark } }}>Yeni Kupon</Button>
          </Stack>
        }
      />
      <Card>
        <TableContainer><Table>
          <TableHead><TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Kod</TableCell><TableCell sx={{ fontWeight: 600 }}>Tip</TableCell><TableCell sx={{ fontWeight: 600 }} align="right">Değer</TableCell>
            <TableCell sx={{ fontWeight: 600 }} align="center">Kullanım</TableCell><TableCell sx={{ fontWeight: 600 }}>Durum</TableCell><TableCell sx={{ fontWeight: 600 }}>Bitiş</TableCell><TableCell sx={{ fontWeight: 600 }} align="center">İşlem</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {loading ? Array.from({ length: 5 }).map((_, i) => <TableRow key={i}>{Array.from({ length: 7 }).map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}</TableRow>)
            : coupons.length === 0 ? <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6 }}><CouponIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} /><Typography color="text.secondary">Kupon bulunamadı</Typography></TableCell></TableRow>
            : coupons.map((c) => (
              <TableRow key={c.id} hover>
                <TableCell><Typography variant="body2" fontWeight={700} sx={{ fontFamily: 'monospace', color: olentiaColors.primary.main }}>{c.code}</Typography>{c.description && <Typography variant="caption" color="text.secondary">{c.description}</Typography>}</TableCell>
                <TableCell><Typography variant="body2">{typeLabels[c.type] || c.type}</Typography></TableCell>
                <TableCell align="right"><Typography variant="body2" fontWeight={600}>{c.type === 'percentage' ? `%${c.value}` : c.type === 'free_shipping' ? 'Ücretsiz' : formatCurrency(c.value)}</Typography></TableCell>
                <TableCell align="center"><Typography variant="body2">{c.usedCount || 0}{c.maxUses ? `/${c.maxUses}` : ''}</Typography></TableCell>
                <TableCell><Chip label={c.isActive ? 'Aktif' : 'Pasif'} color={c.isActive ? 'success' : 'default'} size="small" variant="outlined" /></TableCell>
                <TableCell><Typography variant="body2" color="text.secondary">{c.expiresAt ? formatDate(c.expiresAt) : '∞'}</Typography></TableCell>
                <TableCell align="center">
                  <Tooltip title="Düzenle"><IconButton size="small" onClick={() => handleOpen(c)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Sil"><IconButton size="small" color="error" onClick={() => setDeleteConfirm(c.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table></TableContainer>
        <TablePagination component="div" count={total} page={page} onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[5, 10, 25]} labelRowsPerPage="Sayfa başına:" labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`} />
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: 'background.paper', backgroundImage: 'none' } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="h6" fontWeight={700}>{editing ? 'Kupon Düzenle' : 'Yeni Kupon'}</Typography><IconButton onClick={() => setDialogOpen(false)} size="small"><CloseIcon /></IconButton></DialogTitle><Divider />
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid size={{ xs: 8 }}><TextField fullWidth label="Kupon Kodu" value={form.code} onChange={(e) => setForm({...form, code: e.target.value.toUpperCase()})} /></Grid>
            <Grid size={{ xs: 4 }}><FormControl fullWidth><InputLabel>Tip</InputLabel><Select value={form.type} label="Tip" onChange={(e) => setForm({...form, type: e.target.value})}><MenuItem value="percentage">Yüzde</MenuItem><MenuItem value="fixed">Sabit Tutar</MenuItem><MenuItem value="free_shipping">Ücretsiz Kargo</MenuItem></Select></FormControl></Grid>
            <Grid size={{ xs: 12 }}><TextField fullWidth label="Açıklama" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} size="small" /></Grid>
            <Grid size={{ xs: 6 }}><NumberField fullWidth label={form.type === 'percentage' ? 'İndirim (%)' : 'İndirim (₺)'} value={form.value} onValueChange={(v) => setForm({...form, value: v})} /></Grid>
            <Grid size={{ xs: 6 }}><NumberField fullWidth label="Min. Sipariş (₺)" value={form.minOrderAmount} onValueChange={(v) => setForm({...form, minOrderAmount: v})} /></Grid>
            <Grid size={{ xs: 6 }}><NumberField fullWidth label="Maks. İndirim (₺)" value={form.maxDiscount} onValueChange={(v) => setForm({...form, maxDiscount: v})} /></Grid>
            <Grid size={{ xs: 6 }}><NumberField fullWidth label="Maks. Kullanım" value={form.maxUses} onValueChange={(v) => setForm({...form, maxUses: v})} /></Grid>
            <Grid size={{ xs: 6 }}><TextField fullWidth type="date" label="Başlangıç" value={form.startsAt} onChange={(e) => setForm({...form, startsAt: e.target.value})} slotProps={{ inputLabel: { shrink: true } }} /></Grid>
            <Grid size={{ xs: 6 }}><TextField fullWidth type="date" label="Bitiş" value={form.expiresAt} onChange={(e) => setForm({...form, expiresAt: e.target.value})} slotProps={{ inputLabel: { shrink: true } }} /></Grid>
            <Grid size={{ xs: 12 }}><FormControlLabel control={<Switch checked={form.isActive} onChange={(e) => setForm({...form, isActive: e.target.checked})} />} label="Aktif" /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}><Button onClick={() => setDialogOpen(false)} color="inherit">İptal</Button><Button onClick={handleSave} variant="contained" disabled={saving || !form.code} sx={{ bgcolor: olentiaColors.primary.main, '&:hover': { bgcolor: olentiaColors.primary.dark } }}>{saving ? 'Kaydediliyor...' : editing ? 'Güncelle' : 'Oluştur'}</Button></DialogActions>
      </Dialog>

      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} PaperProps={{ sx: { bgcolor: 'background.paper', backgroundImage: 'none' } }}>
        <DialogTitle>Kuponu Sil</DialogTitle><DialogContent><Typography>Bu kuponu silmek istediğinize emin misiniz?</Typography></DialogContent>
        <DialogActions><Button onClick={() => setDeleteConfirm(null)} color="inherit">İptal</Button><Button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} color="error" variant="contained">Sil</Button></DialogActions>
      </Dialog>
    </Box>
  );
}
