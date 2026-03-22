'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, Chip, TextField, InputAdornment, Select,
  MenuItem, FormControl, InputLabel, Skeleton, Stack,
} from '@mui/material';
import {
  Search as SearchIcon, Subscriptions as SubIcon,
} from '@mui/icons-material';
import { subscriptionsApi } from '@/lib/api';
import { olentiaColors } from '@/lib/theme';
import PageHeader from '@/components/common/PageHeader';
import ExportButton from '@/components/common/ExportButton';

interface Subscription {
  id: string;
  status: string;
  plan?: { name: string; priceMonthly: number; interval: string };
  user?: { email: string; firstName?: string; lastName?: string };
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelledAt?: string;
  createdAt: string;
}

const statusConfig: Record<string, { label: string; color: 'default' | 'success' | 'warning' | 'error' | 'info' }> = {
  ACTIVE: { label: 'Aktif', color: 'success' },
  PAUSED: { label: 'Duraklatıldı', color: 'warning' },
  CANCELLED: { label: 'İptal', color: 'error' },
  EXPIRED: { label: 'Süresi Doldu', color: 'default' },
  SUSPENDED: { label: 'Askıda', color: 'error' },
  TRIAL: { label: 'Deneme', color: 'info' },
  PENDING: { label: 'Beklemede', color: 'warning' },
};

const intervalLabels: Record<string, string> = {
  MONTHLY: 'Aylık', YEARLY: 'Yıllık', WEEKLY: 'Haftalık',
};

function formatCurrency(amount: number | string | null | undefined) {
  const num = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
  if (isNaN(num)) return '₺0,00';
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(num);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await subscriptionsApi.getSubscriptions({
        page: page + 1, limit: rowsPerPage, status: statusFilter || undefined,
      });
      const result = response.data || response;
      setSubscriptions(result.data || result.items || []);
      setTotal(result.meta?.total || result.total || 0);
    } catch (error) {
      console.error('Abonelikler yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, statusFilter]);

  useEffect(() => { fetchSubscriptions(); }, [fetchSubscriptions]);

  return (
    <Box>
      <PageHeader
        title="Abonelikler"
        subtitle="Kahve aboneliklerini yönet"
        breadcrumbs={[{ label: 'Abonelikler' }]}
        action={
          <Stack direction="row" spacing={1} alignItems="center">
            <ExportButton
              data={subscriptions}
              columns={[
                { key: 'user.email', label: 'Müşteri' },
                { key: 'plan.name', label: 'Plan' },
                { key: 'plan.priceMonthly', label: 'Tutar' },
                { key: 'plan.interval', label: 'Periyot' },
                { key: 'status', label: 'Durum' },
                { key: 'currentPeriodEnd', label: 'Sonraki Ödeme' },
                { key: 'createdAt', label: 'Başlangıç' },
              ]}
              filename="abonelikler"
            />
            <Chip icon={<SubIcon />} label={`${total} abonelik`}
              sx={{ bgcolor: `${olentiaColors.primary.main}20`, color: olentiaColors.primary.main }} />
          </Stack>
        }
      />

      <Card sx={{ mb: 3, p: 2 }}>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Durum Filtrele</InputLabel>
          <Select value={statusFilter} label="Durum Filtrele" onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
            <MenuItem value="">Tümü</MenuItem>
            {Object.entries(statusConfig).map(([k, v]) => <MenuItem key={k} value={k}>{v.label}</MenuItem>)}
          </Select>
        </FormControl>
      </Card>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Müşteri</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Plan</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Tutar</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Periyot</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Durum</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Sonraki Ödeme</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Başlangıç</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading
                ? Array.from({ length: rowsPerPage }).map((_, i) => (
                    <TableRow key={i}>{Array.from({ length: 7 }).map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}</TableRow>
                  ))
                : subscriptions.length === 0
                ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <SubIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                      <Typography color="text.secondary">Abonelik bulunamadı</Typography>
                    </TableCell>
                  </TableRow>
                )
                : subscriptions.map((sub) => (
                    <TableRow key={sub.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {sub.user?.firstName ? `${sub.user.firstName} ${sub.user.lastName}` : sub.user?.email || '-'}
                        </Typography>
                        {sub.user?.firstName && (
                          <Typography variant="caption" color="text.secondary">{sub.user.email}</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>{sub.plan?.name || '-'}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600}>{sub.plan ? formatCurrency(sub.plan.priceMonthly) : '-'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {sub.plan?.interval ? (intervalLabels[sub.plan.interval] || sub.plan.interval) : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={statusConfig[sub.status]?.label || sub.status}
                          color={statusConfig[sub.status]?.color || 'default'} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {sub.currentPeriodEnd ? formatDate(sub.currentPeriodEnd) : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">{formatDate(sub.createdAt)}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination component="div" count={total} page={page}
          onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[5, 10, 25]} labelRowsPerPage="Sayfa başına:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        />
      </Card>
    </Box>
  );
}
