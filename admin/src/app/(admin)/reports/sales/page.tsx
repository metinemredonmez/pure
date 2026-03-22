'use client';
import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Skeleton, Stack, LinearProgress,
  TextField, MenuItem, Select, FormControl, InputLabel, Button,
} from '@mui/material';
import { FilterList as FilterIcon, Download as DownloadIcon } from '@mui/icons-material';
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

export default function SalesReportPage() {
  const [loading, setLoading] = useState(true);
  const [revenue, setRevenue] = useState<{ date: string; revenue: number; orders: number }[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; totalSold: number; revenue: number }[]>([]);
  const [days, setDays] = useState(30);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [revRes, prodRes] = await Promise.all([
        dashboardApi.getRevenueChart(days).catch(() => ({ data: [] })),
        dashboardApi.getTopProducts(10, days).catch(() => ({ data: [] })),
      ]);
      let r = revRes.data || revRes;
      r = Array.isArray(r) ? r : [];

      // Client-side date filtering
      if (startDate || endDate) {
        r = r.filter((d: any) => {
          if (startDate && d.date < startDate) return false;
          if (endDate && d.date > endDate) return false;
          return true;
        });
      }

      setRevenue(r);
      const p = prodRes.data || prodRes;
      setTopProducts(Array.isArray(p) ? p : []);
    } finally {
      setLoading(false);
    }
  }, [days, startDate, endDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalRevenue = revenue.reduce((s, d) => s + (d.revenue || 0), 0);
  const totalOrders = revenue.reduce((s, d) => s + (d.orders || 0), 0);
  const avgDaily = revenue.length > 0 ? totalRevenue / revenue.length : 0;
  const maxDaily = Math.max(...revenue.map(d => d.revenue || 0), 1);

  return (
    <Box>
      <PageHeader
        title="Satış Raporu"
        subtitle="Satış performansı ve gelir analizi"
        breadcrumbs={[{ label: 'Raporlar', href: '/reports/sales' }, { label: 'Satış' }]}
        action={
          <ExportButton
            data={revenue}
            columns={[
              { key: 'date', label: 'Tarih' },
              { key: 'revenue', label: 'Gelir' },
              { key: 'orders', label: 'Sipariş' },
            ]}
            filename="satis-raporu"
          />
        }
      />

      {/* Filters */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <FilterIcon sx={{ color: 'text.secondary' }} />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Dönem</InputLabel>
            <Select value={days} label="Dönem" onChange={(e) => { setDays(Number(e.target.value)); setStartDate(''); setEndDate(''); }}>
              {periodOptions.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField size="small" type="date" label="Başlangıç" value={startDate}
            onChange={(e) => setStartDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
          <TextField size="small" type="date" label="Bitiş" value={endDate}
            onChange={(e) => setEndDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
          {(startDate || endDate) && (
            <Button size="small" onClick={() => { setStartDate(''); setEndDate(''); }}>Temizle</Button>
          )}
        </Stack>
      </Card>

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Toplam Gelir</Typography>
              {loading ? <Skeleton width={120} height={40} /> :
                <Typography variant="h4" fontWeight={700} sx={{ color: olentiaColors.primary.main }}>{formatCurrency(totalRevenue)}</Typography>}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Toplam Sipariş</Typography>
              {loading ? <Skeleton width={80} height={40} /> :
                <Typography variant="h4" fontWeight={700}>{totalOrders}</Typography>}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Günlük Ortalama</Typography>
              {loading ? <Skeleton width={100} height={40} /> :
                <Typography variant="h4" fontWeight={700}>{formatCurrency(avgDaily)}</Typography>}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {/* Daily Revenue */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Günlük Gelir</Typography>
              {loading ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={24} sx={{ mb: 1 }} />) :
              revenue.length > 0 ? <Stack spacing={0.5}>{revenue.slice(-14).map((d) => (
                <Box key={d.date} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" sx={{ width: 50, flexShrink: 0 }}>{new Date(d.date).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })}</Typography>
                  <LinearProgress variant="determinate" value={(d.revenue / maxDaily) * 100} sx={{ flex: 1, height: 8, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.08)', '& .MuiLinearProgress-bar': { bgcolor: olentiaColors.primary.main, borderRadius: 4 } }} />
                  <Typography variant="caption" sx={{ width: 80, textAlign: 'right' }}>{formatCurrency(d.revenue)}</Typography>
                </Box>
              ))}</Stack> : <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>Veri yok</Typography>}
            </CardContent>
          </Card>
        </Grid>

        {/* Top Products */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>En Çok Satan Ürünler</Typography>
              {loading ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={32} sx={{ mb: 1 }} />) :
              topProducts.length > 0 ? <Stack spacing={1}>{topProducts.slice(0, 10).map((p, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography variant="body2" fontWeight={700} sx={{ color: i < 3 ? olentiaColors.primary.main : 'text.secondary', width: 24 }}>{i + 1}</Typography>
                    <Typography variant="body2" fontWeight={500}>{p.name}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" fontWeight={600}>{formatCurrency(p.revenue)}</Typography>
                    <Typography variant="caption" color="text.secondary">{p.totalSold} adet</Typography>
                  </Box>
                </Box>
              ))}</Stack> : <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>Veri yok</Typography>}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
