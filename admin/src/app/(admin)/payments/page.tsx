'use client';

import { useEffect, useState, useCallback } from 'react';
import { NumberField } from '@/components/NumberField';
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, TableSortLabel, Chip, IconButton, TextField, InputAdornment, Select,
  MenuItem, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Divider, Skeleton, Stack, Grid, Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon, Payment as PaymentIcon, Visibility as ViewIcon,
  Close as CloseIcon, Undo as RefundIcon,
} from '@mui/icons-material';
import { paymentsApi } from '@/lib/api';
import { olentiaColors } from '@/lib/theme';
import PageHeader from '@/components/common/PageHeader';
import ExportButton from '@/components/common/ExportButton';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  transactionId?: string;
  providerPaymentId?: string;
  providerData?: any;
  paidAt?: string;
  updatedAt?: string;
  order?: { id: string; orderNumber: string; total?: number };
  user?: { email: string; firstName?: string; lastName?: string; phone?: string };
  createdAt: string;
}

const statusConfig: Record<string, { label: string; color: 'default' | 'success' | 'warning' | 'error' | 'info' }> = {
  PENDING: { label: 'Beklemede', color: 'warning' },
  COMPLETED: { label: 'Tamamlandı', color: 'success' },
  FAILED: { label: 'Başarısız', color: 'error' },
  REFUNDED: { label: 'İade Edildi', color: 'info' },
  CANCELLED: { label: 'İptal', color: 'default' },
};

const methodLabels: Record<string, string> = {
  CREDIT_CARD: 'Kredi Kartı', BANK_TRANSFER: 'Havale/EFT', WALLET: 'Cüzdan', CASH_ON_DELIVERY: 'Kapıda Ödeme',
};

function formatCurrency(amount: number, currency = 'TRY') {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency }).format(amount);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [refundDialog, setRefundDialog] = useState<Payment | null>(null);
  const [refundAmount, setRefundAmount] = useState(0);
  const [refundReason, setRefundReason] = useState('');
  const [refunding, setRefunding] = useState(false);
  const [viewDialog, setViewDialog] = useState<Payment | null>(null);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await paymentsApi.getPayments({
        page: page + 1, limit: rowsPerPage,
        search: search || undefined, status: statusFilter || undefined, method: methodFilter || undefined,
      });
      const result = response.data || response;
      setPayments(result.data || result.items || []);
      setTotal(result.meta?.total || result.total || 0);
    } catch (error) {
      console.error('Ödemeler yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, statusFilter, methodFilter]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const handleRefund = async () => {
    if (!refundDialog) return;
    setRefunding(true);
    try {
      await paymentsApi.refund(refundDialog.id, refundAmount, refundReason || undefined);
      setRefundDialog(null);
      fetchPayments();
    } catch (error) {
      console.error('İade yapılamadı:', error);
    } finally {
      setRefunding(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Ödemeler"
        subtitle="Ödeme işlemlerini takip et"
        breadcrumbs={[{ label: 'Ödemeler' }]}
        action={
          <Stack direction="row" spacing={1} alignItems="center">
            <ExportButton
              data={payments}
              columns={[
                { key: 'transactionId', label: 'İşlem ID' },
                { key: 'order.orderNumber', label: 'Sipariş No' },
                { key: 'user.email', label: 'Müşteri' },
                { key: 'amount', label: 'Tutar' },
                { key: 'currency', label: 'Para Birimi' },
                { key: 'method', label: 'Yöntem' },
                { key: 'status', label: 'Durum' },
                { key: 'createdAt', label: 'Tarih' },
              ]}
              filename="odemeler"
            />
            <Chip icon={<PaymentIcon />} label={`${total} ödeme`}
              sx={{ bgcolor: `${olentiaColors.primary.main}20`, color: olentiaColors.primary.main }} />
          </Stack>
        }
      />

      <Card sx={{ mb: 3, p: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField size="small" placeholder="İşlem ID veya e-posta ara..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { setPage(0); fetchPayments(); } }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment> } }}
            sx={{ minWidth: 280, flex: 1 }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Durum</InputLabel>
            <Select value={statusFilter} label="Durum" onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
              <MenuItem value="">Tümü</MenuItem>
              {Object.entries(statusConfig).map(([k, v]) => <MenuItem key={k} value={k}>{v.label}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Yöntem</InputLabel>
            <Select value={methodFilter} label="Yöntem" onChange={(e) => { setMethodFilter(e.target.value); setPage(0); }}>
              <MenuItem value="">Tümü</MenuItem>
              {Object.entries(methodLabels).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
            </Select>
          </FormControl>
        </Stack>
      </Card>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>İşlem ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Sipariş</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Müşteri</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">
                  <TableSortLabel active={sortBy === 'amount'} direction={sortBy === 'amount' ? sortOrder : 'asc'} onClick={() => handleSort('amount')}>
                    Tutar
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  <TableSortLabel active={sortBy === 'method'} direction={sortBy === 'method' ? sortOrder : 'asc'} onClick={() => handleSort('method')}>
                    Yöntem
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  <TableSortLabel active={sortBy === 'status'} direction={sortBy === 'status' ? sortOrder : 'asc'} onClick={() => handleSort('status')}>
                    Durum
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  <TableSortLabel active={sortBy === 'createdAt'} direction={sortBy === 'createdAt' ? sortOrder : 'asc'} onClick={() => handleSort('createdAt')}>
                    Tarih
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">İşlem</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading
                ? Array.from({ length: rowsPerPage }).map((_, i) => (
                    <TableRow key={i}>{Array.from({ length: 8 }).map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}</TableRow>
                  ))
                : payments.length === 0
                ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                      <PaymentIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                      <Typography color="text.secondary">Ödeme bulunamadı</Typography>
                    </TableCell>
                  </TableRow>
                )
                : [...payments].sort((a, b) => {
                    const aVal = a[sortBy as keyof Payment];
                    const bVal = b[sortBy as keyof Payment];
                    if (aVal == null) return 1;
                    if (bVal == null) return -1;
                    const cmp = typeof aVal === 'number' ? aVal - (bVal as number) : String(aVal).localeCompare(String(bVal));
                    return sortOrder === 'asc' ? cmp : -cmp;
                  }).map((payment) => (
                    <TableRow key={payment.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 11 }}>
                          {payment.transactionId || payment.id.slice(0, 12)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500} sx={{ color: olentiaColors.primary.main }}>
                          {payment.order?.orderNumber || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {(payment as any).order?.user?.firstName
                            ? `${(payment as any).order.user.firstName} ${(payment as any).order.user.lastName}`
                            : (payment as any).order?.user?.email || payment.user?.email || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600}>{formatCurrency(payment.amount, payment.currency)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">{methodLabels[payment.method] || payment.method}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={statusConfig[payment.status]?.label || payment.status}
                          color={statusConfig[payment.status]?.color || 'default'} size="small" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">{formatDate(payment.createdAt)}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        {payment.status === 'COMPLETED' && (
                          <Tooltip title="İade Et">
                            <IconButton size="small" onClick={() => { setRefundDialog(payment); setRefundAmount(payment.amount); setRefundReason(''); }}>
                              <RefundIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination component="div" count={total} page={page}
          onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[5, 10, 25, 50]} labelRowsPerPage="Sayfa başına:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        />
      </Card>

      {/* Refund Dialog */}
      <Dialog open={!!refundDialog} onClose={() => setRefundDialog(null)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { bgcolor: 'background.paper', backgroundImage: 'none' } }}>
        <DialogTitle><Typography variant="h6" fontWeight={700}>İade İşlemi</Typography></DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <NumberField fullWidth label="İade Tutarı (₺)" value={refundAmount}
              onValueChange={(v) => setRefundAmount(v)}
              helperText={`Maksimum: ${formatCurrency(refundDialog?.amount || 0)}`} />
            <TextField fullWidth multiline rows={2} label="İade Sebebi" value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRefundDialog(null)} color="inherit">İptal</Button>
          <Button onClick={handleRefund} variant="contained" color="error" disabled={refunding || refundAmount <= 0}>
            {refunding ? 'İade Ediliyor...' : 'İade Et'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
