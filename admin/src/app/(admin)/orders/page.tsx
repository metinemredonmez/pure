'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  Skeleton,
  Avatar,
  Stack,
  Grid,
  Tooltip,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  LocalShipping as ShippingIcon,
  Close as CloseIcon,
  Receipt as ReceiptIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Payment as PaymentIcon,
  AccessTime as TimeIcon,
  FilterList as FilterIcon,
  CancelOutlined as CancelIcon,
  DeleteOutline as DeleteIcon,
} from '@mui/icons-material';
import { ordersApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { olentiaColors } from '@/lib/theme';
import PageHeader from '@/components/common/PageHeader';
import ExportButton from '@/components/common/ExportButton';

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  /** Sipariş anındaki snapshot — ürün/varyant silinse bile görünür */
  productName?: string;
  variantName?: string;
  product?: {
    id: string;
    name: string;
    slug: string;
    images?: string[];
  };
  variant?: {
    id: string;
    name: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  discount: number;
  shippingCost: number;
  tax: number;
  total: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
  trackingNumber?: string;
  kargonomiShipmentId?: number | null;
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    companyName?: string;
    taxNumber?: string;
    isPartner?: boolean;
  };
  items?: OrderItem[];
  payment?: {
    id: string;
    status: string;
    method: string;
    amount: number;
  };
  address?: {
    title?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    line1?: string;
    line2?: string;
    city?: string;
    district?: string;
    postalCode?: string;
    country?: string;
  };
  statusHistory?: {
    id: string;
    status: string;
    note?: string;
    changedBy?: string;
    createdAt: string;
  }[];
}

const ORDER_STATUSES = [
  'PENDING',
  'PAID',
  'CONFIRMED',
  'PREPARING',
  'SHIPPED',
  'IN_TRANSIT',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
  'RETURNED',
];

const statusConfig: Record<string, { label: string; color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' }> = {
  PENDING: { label: 'Ödeme Bekleniyor', color: 'warning' },
  PAID: { label: 'Ödeme Alındı — Onay Bekliyor', color: 'warning' },
  CONFIRMED: { label: 'Onaylandı', color: 'info' },
  PREPARING: { label: 'Hazırlanıyor', color: 'primary' },
  SHIPPED: { label: 'Kargoda', color: 'secondary' },
  IN_TRANSIT: { label: 'Yolda', color: 'info' },
  DELIVERED: { label: 'Teslim Edildi', color: 'success' },
  CANCELLED: { label: 'İptal', color: 'error' },
  REFUNDED: { label: 'İade Edildi', color: 'error' },
  RETURNED: { label: 'İade', color: 'default' },
  PAYMENT_FAILED: { label: 'Ödeme Başarısız', color: 'error' },
};

function formatCurrency(amount: number | string | null | undefined) {
  const num = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
  if (isNaN(num) || num === null || num === undefined) return '₺0,00';
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(num);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function OrdersPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN'; // iptal/iade/silme yalnızca ADMIN
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  // 'paid' = ödemesi alınan siparişler (varsayılan), 'unpaid' = ödeme bekleyenler
  const [paymentTab, setPaymentTab] = useState<'paid' | 'unpaid'>('paid');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionOrder, setActionOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');

  // Kargo sürecinde / bitmiş siparişte iptal edilemez
  const CANCELLABLE_BLOCKED = ['SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await ordersApi.getOrders({
        page: page + 1,
        limit: rowsPerPage,
        search: search || undefined,
        status: statusFilter || undefined,
        paymentState: paymentTab,
      });
      const result = response.data || response;
      setOrders(result.data || result.items || []);
      setTotal(result.meta?.total || result.total || 0);
    } catch (error) {
      console.error('Siparişler yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, statusFilter, paymentTab]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleViewOrder = async (order: Order) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const response = await ordersApi.getOrderById(order.id);
      const result = response.data || response;
      setSelectedOrder(result);
    } catch (error) {
      console.error('Sipariş detayı yüklenemedi:', error);
      setSelectedOrder(order);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleOpenStatusDialog = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setStatusNote('');
    setStatusDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;
    setStatusUpdating(true);
    try {
      await ordersApi.updateStatus(selectedOrder.id, newStatus, statusNote || undefined);
      setStatusDialogOpen(false);
      fetchOrders();
    } catch (error) {
      console.error('Durum güncellenemedi:', error);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!actionOrder) return;
    setActionLoading(true);
    try {
      await ordersApi.cancelOrder(actionOrder.id, cancelReason || undefined);
      setCancelDialogOpen(false);
      setCancelReason('');
      fetchOrders();
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Sipariş iptal edilemedi');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!actionOrder) return;
    setActionLoading(true);
    try {
      await ordersApi.deleteOrder(actionOrder.id);
      setDeleteDialogOpen(false);
      fetchOrders();
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Sipariş silinemedi');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadBarcode = async (shipmentId: number) => {
    try {
      const blob = await ordersApi.downloadKargonomiBarcode(shipmentId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kargonomi-${shipmentId}-barkod.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Barkod indirilemedi');
    }
  };

  const handleShipKargonomi = async (order: Order) => {
    if (!window.confirm(`${order.orderNumber} siparişi Kargonomi ile kargoya verilsin mi? (En ucuz firma otomatik seçilir, bakiyeden düşer)`)) return;
    try {
      const res = await ordersApi.shipViaKargonomi(order.id);
      const r = res?.data || res;
      alert(`Gönderi oluşturuldu (Kargonomi #${r?.shipmentId || '?'}).${r?.trackingCode ? ' Takip: ' + r.trackingCode : ' Takip no webhook ile gelecek.'}`);
      fetchOrders();
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Kargonomi gönderisi oluşturulamadı');
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setPage(0);
      fetchOrders();
    }
  };

  return (
    <Box>
      <PageHeader
        title="Siparişler"
        subtitle="Tüm siparişleri görüntüle ve yönet"
        breadcrumbs={[{ label: 'Siparişler' }]}
        action={
          <Stack direction="row" spacing={1} alignItems="center">
            <ExportButton
              data={orders}
              columns={[
                { key: 'orderNumber', label: 'Sipariş No' },
                { key: 'user.email', label: 'Müşteri' },
                { key: 'status', label: 'Durum' },
                { key: 'total', label: 'Tutar' },
                { key: 'createdAt', label: 'Tarih' },
              ]}
              filename="siparisler"
            />
            <Chip
              icon={<ReceiptIcon sx={{ color: `${olentiaColors.primary.main} !important` }} />}
              label={`${total} sipariş`}
              sx={{ bgcolor: `${olentiaColors.primary.main}15`, color: olentiaColors.primary.main, fontWeight: 600 }}
            />
          </Stack>
        }
      />

      {/* Ödeme durumu ayrımı — sadece ödemesi alınan siparişler işlem listesinde */}
      <Card sx={{ mb: 2 }}>
        <Tabs
          value={paymentTab}
          onChange={(_, v) => { setPaymentTab(v); setStatusFilter(''); setPage(0); }}
          sx={{ px: 2 }}
        >
          <Tab value="paid" label="Ödemesi Alınan Siparişler" />
          <Tab value="unpaid" label="Ödeme Bekleyenler" />
        </Tabs>
      </Card>

      {/* Filters */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            size="small"
            placeholder="Sipariş no veya e-posta ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ minWidth: 300, flex: 1 }}
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Durum Filtrele</InputLabel>
            <Select
              value={statusFilter}
              label="Durum Filtrele"
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            >
              <MenuItem value="">Tümü</MenuItem>
              {ORDER_STATUSES.map((s) => (
                <MenuItem key={s} value={s}>
                  {statusConfig[s]?.label || s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Card>

      {/* Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>
                  <TableSortLabel active={sortBy === 'orderNumber'} direction={sortBy === 'orderNumber' ? sortOrder : 'asc'} onClick={() => handleSort('orderNumber')}>
                    Sipariş No
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Müşteri</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  <TableSortLabel active={sortBy === 'status'} direction={sortBy === 'status' ? sortOrder : 'asc'} onClick={() => handleSort('status')}>
                    Durum
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">
                  <TableSortLabel active={sortBy === 'total'} direction={sortBy === 'total' ? sortOrder : 'asc'} onClick={() => handleSort('total')}>
                    Tutar
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
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <TableCell key={j}><Skeleton /></TableCell>
                      ))}
                    </TableRow>
                  ))
                : orders.length === 0
                ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <ReceiptIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                      <Typography color="text.secondary">Sipariş bulunamadı</Typography>
                    </TableCell>
                  </TableRow>
                )
                : [...orders].sort((a, b) => {
                    const aVal = a[sortBy as keyof Order];
                    const bVal = b[sortBy as keyof Order];
                    if (aVal == null) return 1;
                    if (bVal == null) return -1;
                    const cmp = typeof aVal === 'number' ? aVal - (bVal as number) : String(aVal).localeCompare(String(bVal));
                    return sortOrder === 'asc' ? cmp : -cmp;
                  }).map((order) => (
                    <TableRow
                      key={order.id}
                      hover
                      sx={{ cursor: 'pointer', '&:last-child td': { border: 0 } }}
                      onClick={() => handleViewOrder(order)}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} sx={{ color: olentiaColors.primary.main }}>
                          {order.orderNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: olentiaColors.primary.main, fontSize: 14 }}>
                            {order.user?.firstName?.[0] || order.user?.email?.[0]?.toUpperCase() || '?'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {order.user?.firstName && order.user?.lastName
                                ? `${order.user.firstName} ${order.user.lastName}`
                                : order.user?.email || '-'}
                            </Typography>
                            {order.user?.firstName && (
                              <Typography variant="caption" color="text.secondary">
                                {order.user.email}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={statusConfig[order.status]?.label || order.status}
                          color={statusConfig[order.status]?.color || 'default'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600}>
                          {formatCurrency(order.total || 0)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(order.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Detay">
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleViewOrder(order); }}>
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Durum Güncelle">
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleOpenStatusDialog(order); }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {isAdmin && !order.kargonomiShipmentId && ['PAID', 'CONFIRMED', 'PREPARING'].includes(order.status) && (
                          <Tooltip title="Kargonomi ile Gönder">
                            <IconButton size="small" color="primary" onClick={(e) => { e.stopPropagation(); handleShipKargonomi(order); }}>
                              <ShippingIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {isAdmin && !CANCELLABLE_BLOCKED.includes(order.status) && (
                          <Tooltip title="Siparişi İptal Et">
                            <IconButton size="small" color="warning" onClick={(e) => { e.stopPropagation(); setActionOrder(order); setCancelReason(''); setCancelDialogOpen(true); }}>
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {isAdmin && (
                          <Tooltip title="Siparişi Sil">
                            <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); setActionOrder(order); setDeleteDialogOpen(true); }}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Sayfa başına:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        />
      </Card>

      {/* Order Detail Dialog */}
      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { bgcolor: 'background.paper', backgroundImage: 'none' } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ReceiptIcon sx={{ color: olentiaColors.primary.main }} />
            <Typography variant="h6" fontWeight={700}>
              {selectedOrder?.orderNumber || 'Sipariş Detayı'}
            </Typography>
            {selectedOrder && (
              <Chip
                label={statusConfig[selectedOrder.status]?.label || selectedOrder.status}
                color={statusConfig[selectedOrder.status]?.color || 'default'}
                size="small"
              />
            )}
          </Box>
          <IconButton onClick={() => setDetailOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          {detailLoading ? (
            <Box sx={{ py: 4 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} height={40} sx={{ mb: 1 }} />
              ))}
            </Box>
          ) : selectedOrder ? (
            <Grid container spacing={3} sx={{ mt: 0 }}>
              {/* Customer Info */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <PersonIcon sx={{ color: olentiaColors.primary.main, fontSize: 20 }} />
                  <Typography variant="subtitle2" fontWeight={700}>Müşteri Bilgileri</Typography>
                </Box>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="body2" fontWeight={500}>
                    {selectedOrder.user?.firstName} {selectedOrder.user?.lastName}
                    {selectedOrder.user?.isPartner && (
                      <Chip label="B2B" size="small" color="success" sx={{ ml: 1, height: 18 }} />
                    )}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {selectedOrder.user?.email}
                  </Typography>
                  {(selectedOrder.user?.phone || selectedOrder.address?.phone) && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      Tel: {selectedOrder.user?.phone || selectedOrder.address?.phone}
                    </Typography>
                  )}
                  {(selectedOrder.user?.companyName || selectedOrder.user?.taxNumber) && (
                    <>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="caption" fontWeight={700} display="block">Cari / Fatura Bilgisi</Typography>
                      {selectedOrder.user?.companyName && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          Firma: {selectedOrder.user.companyName}
                        </Typography>
                      )}
                      {selectedOrder.user?.taxNumber && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          Vergi/TCKN: {selectedOrder.user.taxNumber}
                        </Typography>
                      )}
                    </>
                  )}
                </Card>
              </Grid>

              {/* Address */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <LocationIcon sx={{ color: olentiaColors.primary.main, fontSize: 20 }} />
                  <Typography variant="subtitle2" fontWeight={700}>Teslimat / Fatura Adresi</Typography>
                </Box>
                <Card variant="outlined" sx={{ p: 2 }}>
                  {selectedOrder.address ? (
                    <>
                      <Typography variant="body2" fontWeight={500}>
                        {selectedOrder.address.firstName} {selectedOrder.address.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {selectedOrder.address.line1}
                        {selectedOrder.address.line2 && `, ${selectedOrder.address.line2}`}
                        <br />
                        {[selectedOrder.address.district, selectedOrder.address.city, selectedOrder.address.postalCode]
                          .filter(Boolean)
                          .join(' / ')}
                        <br />
                        {selectedOrder.address.phone}
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="caption" color="text.secondary">Adres bilgisi yok</Typography>
                  )}
                </Card>
              </Grid>

              {/* Order Items */}
              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <ShippingIcon sx={{ color: olentiaColors.primary.main, fontSize: 20 }} />
                  <Typography variant="subtitle2" fontWeight={700}>Sipariş Kalemleri</Typography>
                </Box>
                <Card variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Ürün</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="center">Adet</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Birim Fiyat</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Toplam</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedOrder.items?.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar
                                src={item.product?.images?.[0]}
                                variant="rounded"
                                sx={{ width: 36, height: 36, bgcolor: '#1e1e1e' }}
                              >
                                {item.product?.name?.[0] || '?'}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight={500}>
                                  {item.product?.name || item.productName || 'Bilinmeyen Ürün'}
                                </Typography>
                                {/* Seçilen gramaj + öğütme — canlı varyant, yoksa sipariş anındaki snapshot */}
                                {(item.variant?.name || item.variantName) && (
                                  <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
                                    {item.variant?.name || item.variantName}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="center">{item.quantity}</TableCell>
                          <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(item.totalPrice)}</TableCell>
                        </TableRow>
                      )) || (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            <Typography variant="caption" color="text.secondary">Ürün bilgisi yok</Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Card>
              </Grid>

              {/* Payment Summary */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <PaymentIcon sx={{ color: olentiaColors.primary.main, fontSize: 20 }} />
                  <Typography variant="subtitle2" fontWeight={700}>Ödeme Özeti</Typography>
                </Box>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Ara Toplam</Typography>
                      <Typography variant="body2">{formatCurrency(selectedOrder.subtotal)}</Typography>
                    </Box>
                    {selectedOrder.discount > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">İndirim</Typography>
                        <Typography variant="body2" color="success.main">-{formatCurrency(selectedOrder.discount)}</Typography>
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Kargo</Typography>
                      <Typography variant="body2">{formatCurrency(selectedOrder.shippingCost)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">KDV</Typography>
                      <Typography variant="body2">{formatCurrency(selectedOrder.tax || 0)}</Typography>
                    </Box>
                    <Divider />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle2" fontWeight={700}>Toplam</Typography>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ color: olentiaColors.primary.main }}>
                        {formatCurrency(selectedOrder.total || 0)}
                      </Typography>
                    </Box>
                  </Stack>
                </Card>
              </Grid>

              {/* Kargo (Kargonomi) */}
              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <ShippingIcon sx={{ color: olentiaColors.primary.main, fontSize: 20 }} />
                  <Typography variant="subtitle2" fontWeight={700}>Kargo</Typography>
                </Box>
                <Card variant="outlined" sx={{ p: 2 }}>
                  {selectedOrder.kargonomiShipmentId ? (
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
                      <Box>
                        <Typography variant="body2">
                          Kargonomi Gönderi: <b>#{selectedOrder.kargonomiShipmentId}</b>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Takip No: {selectedOrder.trackingNumber || 'Henüz yok (webhook ile gelecek)'}
                        </Typography>
                      </Box>
                      <Button size="small" variant="outlined" onClick={() => handleDownloadBarcode(selectedOrder.kargonomiShipmentId!)}>
                        Barkod PDF İndir
                      </Button>
                    </Stack>
                  ) : (
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Henüz kargoya verilmedi.
                      </Typography>
                      {isAdmin && ['PAID', 'CONFIRMED', 'PREPARING'].includes(selectedOrder.status) && (
                        <Button size="small" variant="contained" startIcon={<ShippingIcon />} onClick={() => handleShipKargonomi(selectedOrder)}>
                          Kargonomi ile Gönder
                        </Button>
                      )}
                    </Stack>
                  )}
                </Card>
              </Grid>

              {/* Status History */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <TimeIcon sx={{ color: olentiaColors.primary.main, fontSize: 20 }} />
                  <Typography variant="subtitle2" fontWeight={700}>Durum Geçmişi</Typography>
                </Box>
                <Card variant="outlined" sx={{ p: 2 }}>
                  {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 ? (
                    <Stack spacing={1.5}>
                      {selectedOrder.statusHistory.map((h) => (
                        <Box key={h.id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: olentiaColors.primary.main, mt: 0.8, flexShrink: 0 }} />
                          <Box>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                              <Chip
                                label={statusConfig[h.status]?.label || h.status}
                                color={statusConfig[h.status]?.color || 'default'}
                                size="small"
                                variant="outlined"
                                sx={{ height: 22 }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(h.createdAt)}
                              </Typography>
                            </Box>
                            {h.note && (
                              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                {h.note}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="caption" color="text.secondary">Durum geçmişi yok</Typography>
                  )}
                </Card>
              </Grid>

              {/* Note */}
              {selectedOrder.note && (
                <Grid size={{ xs: 12 }}>
                  <Card variant="outlined" sx={{ p: 2, bgcolor: `${olentiaColors.primary.main}08` }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>Müşteri Notu:</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>{selectedOrder.note}</Typography>
                  </Card>
                </Grid>
              )}
            </Grid>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { bgcolor: 'background.paper', backgroundImage: 'none' } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight={700}>Durum Güncelle</Typography>
        </DialogTitle>
        <DialogContent>
          {/* Sipariş Özeti */}
          {selectedOrder && (
            <Box sx={{ mb: 2, p: 1.5, borderRadius: 1, bgcolor: 'action.hover' }}>
              <Grid container spacing={1}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Sipariş No</Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ color: olentiaColors.primary.main }}>{selectedOrder.orderNumber}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Tutar</Typography>
                  <Typography variant="body2" fontWeight={600}>{formatCurrency(selectedOrder.total || 0)}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Müşteri</Typography>
                  <Typography variant="body2">{selectedOrder.user?.firstName ? `${selectedOrder.user.firstName} ${selectedOrder.user.lastName}` : selectedOrder.user?.email || '-'}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Mevcut Durum</Typography>
                  <Chip label={statusConfig[selectedOrder.status]?.label || selectedOrder.status} color={statusConfig[selectedOrder.status]?.color || 'default'} size="small" />
                </Grid>
              </Grid>
            </Box>
          )}

          <FormControl fullWidth size="small">
            <InputLabel>Yeni Durum</InputLabel>
            <Select value={newStatus} label="Yeni Durum" onChange={(e) => setNewStatus(e.target.value)}>
              {ORDER_STATUSES.map((s) => (
                <MenuItem key={s} value={s}>
                  <Chip
                    label={statusConfig[s]?.label || s}
                    color={statusConfig[s]?.color || 'default'}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            multiline
            rows={2}
            size="small"
            label="Not (opsiyonel)"
            value={statusNote}
            onChange={(e) => setStatusNote(e.target.value)}
            sx={{ mt: 2 }}
            placeholder="Durum değişikliği hakkında not..."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setStatusDialogOpen(false)} color="inherit">İptal</Button>
          <Button
            onClick={handleUpdateStatus}
            variant="contained"
            disabled={statusUpdating || newStatus === selectedOrder?.status}
            sx={{ bgcolor: olentiaColors.primary.main, '&:hover': { bgcolor: olentiaColors.primary.dark } }}
          >
            {statusUpdating ? 'Güncelleniyor...' : 'Güncelle'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sipariş İptal Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Siparişi İptal Et</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>{actionOrder?.orderNumber}</strong> siparişi iptal edilecek. Ödeme alınmışsa
            otomatik iade başlatılır ve stok geri yüklenir.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={2}
            size="small"
            label="İptal nedeni (opsiyonel)"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCancelDialogOpen(false)} color="inherit">Vazgeç</Button>
          <Button onClick={handleCancelOrder} variant="contained" color="warning" disabled={actionLoading}>
            {actionLoading ? 'İşleniyor...' : 'İptal Et'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sipariş Silme Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Siparişi Sil</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            <strong>{actionOrder?.orderNumber}</strong> siparişi ve tüm kayıtları (ödeme, kargo, geçmiş)
            <strong> kalıcı olarak</strong> silinecek. Bu işlem geri alınamaz. Muhasebe kaydı için iptal
            (iade) tercih edilmelidir.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">Vazgeç</Button>
          <Button onClick={handleDeleteOrder} variant="contained" color="error" disabled={actionLoading}>
            {actionLoading ? 'Siliniyor...' : 'Kalıcı Sil'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
