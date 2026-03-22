'use client';
import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Skeleton, Stack, Chip, Avatar,
  FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import { Warning as WarningIcon, FilterList as FilterIcon } from '@mui/icons-material';
import { dashboardApi } from '@/lib/api';
import { olentiaColors } from '@/lib/theme';
import PageHeader from '@/components/common/PageHeader';
import ExportButton from '@/components/common/ExportButton';

function formatCurrency(n: number | string | null | undefined) {
  const num = typeof n === 'string' ? parseFloat(n) : Number(n);
  if (isNaN(num)) return '₺0,00';
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(num);
}

const periodOptions = [
  { value: 7, label: 'Son 7 Gün' },
  { value: 14, label: 'Son 14 Gün' },
  { value: 30, label: 'Son 30 Gün' },
  { value: 60, label: 'Son 60 Gün' },
  { value: 90, label: 'Son 90 Gün' },
];

export default function ProductsReportPage() {
  const [loading, setLoading] = useState(true);
  const [topProducts, setTopProducts] = useState<{ name: string; totalSold: number; revenue: number }[]>([]);
  const [lowStock, setLowStock] = useState<{ id: string; name: string; sku: string; stock: number; lowStockThreshold?: number }[]>([]);
  const [days, setDays] = useState(30);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, stockRes] = await Promise.all([
        dashboardApi.getTopProducts(15, days).catch(() => ({ data: [] })),
        dashboardApi.getLowStock().catch(() => ({ data: [] })),
      ]);
      const p = prodRes.data || prodRes;
      setTopProducts(Array.isArray(p) ? p : []);
      const s = stockRes.data || stockRes;
      setLowStock(Array.isArray(s) ? s : []);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalSold = topProducts.reduce((s, p) => s + (p.totalSold || 0), 0);
  const totalRevenue = topProducts.reduce((s, p) => s + (p.revenue || 0), 0);

  return (
    <Box>
      <PageHeader
        title="Ürün Raporu"
        subtitle="Ürün performansı ve stok durumu"
        breadcrumbs={[{ label: 'Raporlar', href: '/reports/products' }, { label: 'Ürün' }]}
        action={
          <ExportButton
            data={topProducts}
            columns={[
              { key: 'name', label: 'Ürün' },
              { key: 'totalSold', label: 'Satış Adedi' },
              { key: 'revenue', label: 'Gelir' },
            ]}
            filename="urun-raporu"
          />
        }
      />

      {/* Filters */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <FilterIcon sx={{ color: 'text.secondary' }} />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Dönem</InputLabel>
            <Select value={days} label="Dönem" onChange={(e) => setDays(Number(e.target.value))}>
              {periodOptions.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
            </Select>
          </FormControl>
        </Stack>
      </Card>

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card><CardContent>
            <Typography variant="body2" color="text.secondary">Toplam Satış Adedi</Typography>
            {loading ? <Skeleton width={80} height={40} /> : <Typography variant="h4" fontWeight={700}>{totalSold}</Typography>}
          </CardContent></Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card><CardContent>
            <Typography variant="body2" color="text.secondary">Toplam Ürün Geliri</Typography>
            {loading ? <Skeleton width={120} height={40} /> : <Typography variant="h4" fontWeight={700} sx={{ color: olentiaColors.primary.main }}>{formatCurrency(totalRevenue)}</Typography>}
          </CardContent></Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card><CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningIcon sx={{ color: '#FFAE1F' }} />
              <Typography variant="body2" color="text.secondary">Düşük Stok Uyarıları</Typography>
            </Box>
            {loading ? <Skeleton width={40} height={40} /> : <Typography variant="h4" fontWeight={700} color="warning.main">{lowStock.length}</Typography>}
          </CardContent></Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {/* Top Products */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card><CardContent>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>En Çok Satan ({periodOptions.find(o => o.value === days)?.label})</Typography>
            {loading ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={40} sx={{ mb: 1 }} />) :
            topProducts.length > 0 ? <Stack spacing={1}>{topProducts.map((p, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ width: 28, height: 28, bgcolor: olentiaColors.primary.main, fontSize: 12 }}>{i + 1}</Avatar>
                  <Typography variant="body2" fontWeight={500}>{p.name}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Chip label={`${p.totalSold} adet`} size="small" variant="outlined" />
                  <Typography variant="body2" fontWeight={600} sx={{ minWidth: 80, textAlign: 'right' }}>{formatCurrency(p.revenue)}</Typography>
                </Box>
              </Box>
            ))}</Stack> : <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>Veri yok</Typography>}
          </CardContent></Card>
        </Grid>

        {/* Low Stock */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card><CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <WarningIcon sx={{ color: '#FFAE1F' }} />
              <Typography variant="subtitle1" fontWeight={700}>Düşük Stok</Typography>
            </Box>
            {loading ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={32} sx={{ mb: 1 }} />) :
            lowStock.length > 0 ? <Stack spacing={1.5}>{lowStock.map((p) => (
              <Box key={p.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" fontWeight={500}>{p.name}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>{p.sku}</Typography>
                </Box>
                <Chip label={`${p.stock}`} size="small" color={p.stock === 0 ? 'error' : 'warning'} variant="outlined" />
              </Box>
            ))}</Stack> : <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>Stok sorunu yok</Typography>}
          </CardContent></Card>
        </Grid>
      </Grid>
    </Box>
  );
}
