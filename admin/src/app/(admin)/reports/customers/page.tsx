'use client';
import { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, Skeleton, Stack, Avatar } from '@mui/material';
import { dashboardApi } from '@/lib/api';
import { olentiaColors } from '@/lib/theme';
import PageHeader from '@/components/common/PageHeader';
import ExportButton from '@/components/common/ExportButton';

function formatCurrency(n: number | string | null | undefined) {
  const num = typeof n === 'string' ? parseFloat(n) : Number(n);
  if (isNaN(num)) return '₺0,00';
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(num);
}

interface CustomerInsights {
  total?: number;
  verified?: number;
  verificationRate?: number;
  withOrders?: number;
  conversionRate?: number;
  repeatCustomers?: number;
  repeatRate?: number;
  avgOrderValue?: number;
  topCustomers?: { user?: { firstName?: string; lastName?: string; email?: string }; totalSpent: number; orderCount: number }[];
}

export default function CustomersReportPage() {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<CustomerInsights | null>(null);

  useEffect(() => {
    dashboardApi.getCustomerInsights().then(r => { setInsights(r.data || r); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const topCustomers = insights?.topCustomers || [];

  return (
    <Box>
      <PageHeader
        title="Müşteri Raporu"
        subtitle="Müşteri analizleri ve içgörüler"
        breadcrumbs={[{ label: 'Raporlar', href: '/reports/customers' }, { label: 'Müşteri' }]}
        action={
          <ExportButton
            data={topCustomers.map(c => ({
              name: c.user?.firstName ? `${c.user.firstName} ${c.user.lastName}` : c.user?.email || '-',
              email: c.user?.email || '-',
              totalSpent: c.totalSpent,
              orderCount: c.orderCount,
            }))}
            columns={[
              { key: 'name', label: 'Müşteri' },
              { key: 'email', label: 'E-posta' },
              { key: 'totalSpent', label: 'Toplam Harcama' },
              { key: 'orderCount', label: 'Sipariş Sayısı' },
            ]}
            filename="musteri-raporu"
          />
        }
      />

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { title: 'Toplam Müşteri', value: insights?.total || 0 },
          { title: 'Doğrulanmış', value: `${insights?.verified || 0} (%${insights?.verificationRate || 0})` },
          { title: 'Sipariş Veren', value: `${insights?.withOrders || 0} (%${insights?.conversionRate || 0})` },
          { title: 'Tekrar Eden', value: `${insights?.repeatCustomers || 0} (%${insights?.repeatRate || 0})` },
          { title: 'Ort. Sipariş Değeri', value: formatCurrency(insights?.avgOrderValue || 0) },
        ].map((s) => (
          <Grid key={s.title} size={{ xs: 6, md: 2.4 }}>
            <Card>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="caption" color="text.secondary">{s.title}</Typography>
                {loading ? <Skeleton width={80} height={36} /> : <Typography variant="h5" fontWeight={700}>{s.value}</Typography>}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Top Customers */}
      <Card>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>En Çok Harcayan Müşteriler</Typography>
          {loading ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={40} sx={{ mb: 1 }} />) :
          topCustomers.length > 0 ? (
            <Stack spacing={1}>
              {topCustomers.map((c, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography variant="body2" fontWeight={700} sx={{ color: i < 3 ? olentiaColors.primary.main : 'text.secondary', width: 24 }}>{i + 1}</Typography>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: olentiaColors.primary.main, fontSize: 13 }}>{c.user?.firstName?.[0] || c.user?.email?.[0]?.toUpperCase() || '?'}</Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>{c.user?.firstName ? `${c.user.firstName} ${c.user.lastName}` : c.user?.email || '-'}</Typography>
                      <Typography variant="caption" color="text.secondary">{c.orderCount} sipariş</Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" fontWeight={700}>{formatCurrency(c.totalSpent)}</Typography>
                </Box>
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>Veri yok</Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
