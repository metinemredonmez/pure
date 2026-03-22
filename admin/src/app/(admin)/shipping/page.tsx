'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, TableSortLabel, Chip, Select, MenuItem, FormControl,
  InputLabel, Skeleton, Stack, Grid, Tabs, Tab, Avatar, TextField, Switch,
  FormControlLabel, Button, Divider, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import {
  LocalShipping as ShippingIcon, Inventory as PrepareIcon, CheckCircle as DeliveredIcon,
  Loop as TransitIcon, Map as ZoneIcon, Settings as SettingsIcon,
  Save as SaveIcon, ContentCopy as CopyIcon, OpenInNew as OpenIcon,
  Close as CloseIcon, Timeline as TimelineIcon,
  CheckCircleOutline, LocalShippingOutlined, InventoryOutlined,
  HomeOutlined, AssignmentReturn,
} from '@mui/icons-material';
import { shippingApi } from '@/lib/api';
import { olentiaColors } from '@/lib/theme';
import PageHeader from '@/components/common/PageHeader';
import ExportButton from '@/components/common/ExportButton';
import { useToast } from '@/contexts/ToastContext';

interface Shipment {
  id: string; trackingNumber?: string; carrier?: string; status: string;
  estimatedDelivery?: string; order?: { id: string; orderNumber: string };
  user?: { email: string; firstName?: string; lastName?: string }; createdAt: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  PREPARING: { label: 'Hazirlaniyor', color: '#FF9800' },
  SHIPPED: { label: 'Kargoda', color: '#42A5F5' },
  IN_TRANSIT: { label: 'Yolda', color: '#29B6F6' },
  OUT_FOR_DELIVERY: { label: 'Dagitimda', color: '#AB47BC' },
  DELIVERED: { label: 'Teslim Edildi', color: '#4CAF50' },
  RETURNED: { label: 'Iade', color: '#f44336' },
  CANCELLED: { label: 'Iptal', color: '#9e9e9e' },
};

const carrierLabels: Record<string, string> = { YURTICI: 'Yurtici Kargo', ARAS: 'Aras Kargo', MNG: 'MNG Kargo' };
const carrierTrackingUrls: Record<string, (tracking: string) => string> = {
  YURTICI: (t) => `https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${t}`,
  ARAS: (t) => `https://www.araskargo.com.tr/taki.aspx?kession=${t}`,
  MNG: (t) => `https://www.mngkargo.com.tr/gonderi-takip/?code=${t}`,
};

// Mock tracking steps
const getTrackingSteps = (status: string) => {
  const steps = [
    { label: 'Siparis Alindi', time: '21.03.2026 14:30', done: true, icon: <InventoryOutlined sx={{ fontSize: 18 }} /> },
    { label: 'Hazirlaniyor', time: '21.03.2026 15:45', done: ['PREPARING', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(status), icon: <PrepareIcon sx={{ fontSize: 18 }} /> },
    { label: 'Kargoya Verildi', time: '21.03.2026 17:00', done: ['SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(status), icon: <LocalShippingOutlined sx={{ fontSize: 18 }} /> },
    { label: 'Transfer Merkezinde', time: '22.03.2026 08:15', done: ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(status), icon: <TransitIcon sx={{ fontSize: 18 }} /> },
    { label: 'Dagitima Cikti', time: '22.03.2026 10:30', done: ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(status), icon: <ShippingIcon sx={{ fontSize: 18 }} /> },
    { label: 'Teslim Edildi', time: '22.03.2026 14:20', done: status === 'DELIVERED', icon: <CheckCircleOutline sx={{ fontSize: 18 }} /> },
  ];
  if (status === 'RETURNED') {
    steps.push({ label: 'Iade Edildi', time: '23.03.2026 11:00', done: true, icon: <AssignmentReturn sx={{ fontSize: 18 }} /> });
  }
  return steps;
};

interface ShippingZone {
  id: string; name: string; cities: string[]; baseCost: number; extraKgCost: number;
  estimatedDays: number; freeShippingThreshold?: number; isActive: boolean;
}

// Mock kargo ayarları
const INITIAL_SETTINGS = {
  defaultCarrier: 'YURTICI',
  freeShippingThreshold: 300,
  enableFreeShipping: true,
  maxWeight: 30,
  labelFormat: 'PDF',
  autoAssignTracking: true,
  notifyOnShipped: true,
  notifyOnDelivered: true,
};

function formatDate(d: string) { return new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
function formatCurrency(n: number) { return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n); }

export default function ShippingPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [tab, setTab] = useState(0);
  const [trackingShipment, setTrackingShipment] = useState<Shipment | null>(null);
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const handleSort = (field: string) => { if (sortBy === field) { setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); } else { setSortBy(field); setSortOrder('asc'); } };
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [savingSettings, setSavingSettings] = useState(false);
  const { showSuccess } = useToast();

  const fetchShipments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await shippingApi.getShipments({ page: page + 1, limit: rowsPerPage, status: statusFilter || undefined });
      const result = response.data || response;
      setShipments(result.data || result.items || []);
      setTotal(result.meta?.total || result.total || 0);
    } catch {
      // Mock data
      setShipments([
        { id: '1', trackingNumber: 'YK7834921', carrier: 'YURTICI', status: 'DELIVERED', order: { id: '1', orderNumber: 'OLN-2026-171' }, user: { email: 'ayse@test.com', firstName: 'Ayse', lastName: 'Korkmaz' }, createdAt: new Date().toISOString(), estimatedDelivery: new Date(Date.now() + 86400000).toISOString() },
        { id: '2', trackingNumber: 'AK4521873', carrier: 'ARAS', status: 'IN_TRANSIT', order: { id: '2', orderNumber: 'OLN-2026-170' }, user: { email: 'emre@test.com', firstName: 'Emre', lastName: 'Sahin' }, createdAt: new Date().toISOString(), estimatedDelivery: new Date(Date.now() + 172800000).toISOString() },
        { id: '3', trackingNumber: 'MNG9182734', carrier: 'MNG', status: 'SHIPPED', order: { id: '3', orderNumber: 'OLN-2026-162' }, user: { email: 'selin@test.com', firstName: 'Selin', lastName: 'Ozturk' }, createdAt: new Date().toISOString(), estimatedDelivery: new Date(Date.now() + 259200000).toISOString() },
        { id: '4', trackingNumber: 'YK6273841', carrier: 'YURTICI', status: 'PREPARING', order: { id: '4', orderNumber: 'OLN-2026-161' }, user: { email: 'murat@test.com', firstName: 'Murat', lastName: 'Celik' }, createdAt: new Date().toISOString() },
        { id: '5', trackingNumber: 'AK8374621', carrier: 'ARAS', status: 'OUT_FOR_DELIVERY', order: { id: '5', orderNumber: 'OLN-2026-160' }, user: { email: 'can@test.com', firstName: 'Can', lastName: 'Kaya' }, createdAt: new Date().toISOString(), estimatedDelivery: new Date().toISOString() },
      ]);
      setTotal(5);
    } finally { setLoading(false); }
  }, [page, rowsPerPage, statusFilter]);

  useEffect(() => { fetchShipments(); }, [fetchShipments]);

  // Fetch zones
  useEffect(() => {
    shippingApi.getZones().then(r => {
      const d = r.data || r;
      setZones(Array.isArray(d) ? d : []);
    }).catch(() => {});
  }, []);

  const handleSaveSettings = () => {
    setSavingSettings(true);
    setTimeout(() => { setSavingSettings(false); showSuccess('Kargo ayarlari kaydedildi'); }, 1000);
  };

  // Stats
  const preparing = shipments.filter(s => s.status === 'PREPARING').length;
  const inTransit = shipments.filter(s => ['SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(s.status)).length;
  const delivered = shipments.filter(s => s.status === 'DELIVERED').length;

  return (
    <Box>
      <PageHeader
        title="Kargo Yonetimi"
        subtitle="Gonderileri takip et, bolgeleri ve ayarlari yonet"
        breadcrumbs={[{ label: 'Kargo' }]}
        action={
          <ExportButton data={shipments}
            columns={[
              { key: 'trackingNumber', label: 'Takip No' }, { key: 'order.orderNumber', label: 'Siparis' },
              { key: 'carrier', label: 'Firma' }, { key: 'status', label: 'Durum' }, { key: 'createdAt', label: 'Tarih' },
            ]}
            filename="kargo" />
        }
      />

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Hazirlaniyor', value: preparing, color: '#FF9800', icon: <PrepareIcon /> },
          { label: 'Yolda', value: inTransit, color: '#42A5F5', icon: <TransitIcon /> },
          { label: 'Teslim Edildi', value: delivered, color: '#4CAF50', icon: <DeliveredIcon /> },
          { label: 'Toplam', value: total, color: olentiaColors.primary.main, icon: <ShippingIcon /> },
        ].map(kpi => (
          <Grid key={kpi.label} size={{ xs: 6, sm: 3 }}>
            <Card sx={{ p: 2, borderTop: `3px solid ${kpi.color}` }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" fontWeight={800}>{kpi.value}</Typography>
                  <Typography variant="caption" color="text.secondary">{kpi.label}</Typography>
                </Box>
                <Avatar sx={{ bgcolor: `${kpi.color}15`, color: kpi.color }}>{kpi.icon}</Avatar>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}
          sx={{ px: 2, '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 }, '& .Mui-selected': { color: olentiaColors.primary.main } }}>
          <Tab icon={<ShippingIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Gonderiler" />
          <Tab icon={<ZoneIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Kargo Bolgeleri" />
          <Tab icon={<SettingsIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Ayarlar" />
        </Tabs>
      </Card>

      {/* Tab 0: Shipments */}
      {tab === 0 && (
        <>
          <Card sx={{ mb: 2, p: 2 }}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Durum</InputLabel>
              <Select value={statusFilter} label="Durum" onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
                <MenuItem value="">Tumu</MenuItem>
                {Object.entries(statusConfig).map(([k, v]) => <MenuItem key={k} value={k}>{v.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Card>
          <Card>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>
                      <TableSortLabel active={sortBy === 'trackingNumber'} direction={sortBy === 'trackingNumber' ? sortOrder : 'asc'} onClick={() => handleSort('trackingNumber')}>Takip No</TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Siparis</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Musteri</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      <TableSortLabel active={sortBy === 'carrier'} direction={sortBy === 'carrier' ? sortOrder : 'asc'} onClick={() => handleSort('carrier')}>Firma</TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      <TableSortLabel active={sortBy === 'status'} direction={sortBy === 'status' ? sortOrder : 'asc'} onClick={() => handleSort('status')}>Durum</TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      <TableSortLabel active={sortBy === 'estimatedDelivery'} direction={sortBy === 'estimatedDelivery' ? sortOrder : 'asc'} onClick={() => handleSort('estimatedDelivery')}>Tahmini Teslimat</TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      <TableSortLabel active={sortBy === 'createdAt'} direction={sortBy === 'createdAt' ? sortOrder : 'asc'} onClick={() => handleSort('createdAt')}>Tarih</TableSortLabel>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>{Array.from({ length: 7 }).map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}</TableRow>
                  )) : shipments.length === 0 ? (
                    <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6 }}><ShippingIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} /><Typography color="text.secondary">Gonderi yok</Typography></TableCell></TableRow>
                  ) : [...shipments].sort((a, b) => {
                    const aVal = (a as any)[sortBy] || '';
                    const bVal = (b as any)[sortBy] || '';
                    const cmp = String(aVal).localeCompare(String(bVal));
                    return sortOrder === 'asc' ? cmp : -cmp;
                  }).map((s) => (
                    <TableRow key={s.id} hover>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Typography variant="body2" onClick={() => s.trackingNumber && setTrackingShipment(s)}
                            sx={{ fontFamily: 'monospace', fontSize: 12, cursor: s.trackingNumber ? 'pointer' : 'default', color: s.trackingNumber ? olentiaColors.primary.main : 'text.secondary', '&:hover': s.trackingNumber ? { textDecoration: 'underline' } : {} }}>
                            {s.trackingNumber || '-'}
                          </Typography>
                          {s.trackingNumber && (
                            <Tooltip title="Kopyala">
                              <IconButton size="small" onClick={() => { navigator.clipboard.writeText(s.trackingNumber!); showSuccess('Kopyalandi'); }}>
                                <CopyIcon sx={{ fontSize: 12 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell><Typography variant="body2" fontWeight={500} sx={{ color: olentiaColors.primary.main }}>{s.order?.orderNumber || '-'}</Typography></TableCell>
                      <TableCell><Typography variant="body2">{s.user?.firstName ? `${s.user.firstName} ${s.user.lastName}` : '-'}</Typography></TableCell>
                      <TableCell><Typography variant="body2">{carrierLabels[s.carrier || ''] || s.carrier || '-'}</Typography></TableCell>
                      <TableCell>
                        <Chip label={statusConfig[s.status]?.label || s.status} size="small"
                          sx={{ bgcolor: `${statusConfig[s.status]?.color || '#9e9e9e'}18`, color: statusConfig[s.status]?.color || '#9e9e9e' }} />
                      </TableCell>
                      <TableCell><Typography variant="body2" color="text.secondary">{s.estimatedDelivery ? formatDate(s.estimatedDelivery) : '-'}</Typography></TableCell>
                      <TableCell><Typography variant="caption" color="text.secondary">{formatDate(s.createdAt)}</Typography></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination component="div" count={total} page={page} onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[5, 10, 25]}
              labelRowsPerPage="Sayfa basina:" labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`} />
          </Card>
        </>
      )}

      {/* Tab 1: Kargo Bolgeleri */}
      {tab === 1 && (
        <Grid container spacing={2}>
          {zones.map((zone, i) => {
            const colors = ['#D4793F', '#4CAF50', '#42A5F5', '#AB47BC', '#FF6B6B'];
            const color = colors[i % colors.length];
            return (
              <Grid key={zone.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card sx={{ borderTop: `3px solid ${color}`, transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)' } }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                      <Typography variant="subtitle1" fontWeight={700}>{zone.name}</Typography>
                      <Avatar sx={{ width: 28, height: 28, bgcolor: `${color}15`, color, fontSize: 12 }}>
                        <ZoneIcon sx={{ fontSize: 16 }} />
                      </Avatar>
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                      {zone.cities.join(', ')}
                    </Typography>
                    <Stack spacing={0.5}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary">Baz ucret</Typography>
                        <Typography variant="caption" fontWeight={600}>{formatCurrency(zone.baseCost)}</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary">Ek kg ucret</Typography>
                        <Typography variant="caption" fontWeight={600}>{formatCurrency(zone.extraKgCost)}</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary">Tahmini sure</Typography>
                        <Typography variant="caption" fontWeight={600}>{zone.estimatedDays} gun</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary">Ucretsiz kargo</Typography>
                        <Chip label={`${formatCurrency(zone.freeShippingThreshold || 0)}+`} size="small" sx={{ height: 20, fontSize: 10, bgcolor: 'rgba(76,175,80,0.12)', color: '#4caf50' }} />
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Tab 2: Ayarlar */}
      {tab === 2 && (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Genel Kargo Ayarlari</Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Varsayilan Kargo Firmasi</InputLabel>
                  <Select value={settings.defaultCarrier} label="Varsayilan Kargo Firmasi"
                    onChange={(e) => setSettings({ ...settings, defaultCarrier: e.target.value })}>
                    <MenuItem value="YURTICI">Yurtici Kargo</MenuItem>
                    <MenuItem value="ARAS">Aras Kargo</MenuItem>
                    <MenuItem value="MNG">MNG Kargo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth size="small" type="number" label="Ucretsiz Kargo Esigi (TL)"
                  value={settings.freeShippingThreshold}
                  onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth size="small" type="number" label="Maks. Agirlik (kg)"
                  value={settings.maxWeight}
                  onChange={(e) => setSettings({ ...settings, maxWeight: Number(e.target.value) })} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Etiket Formati</InputLabel>
                  <Select value={settings.labelFormat} label="Etiket Formati"
                    onChange={(e) => setSettings({ ...settings, labelFormat: e.target.value })}>
                    <MenuItem value="PDF">PDF</MenuItem>
                    <MenuItem value="ZPL">ZPL (Termal)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Bildirimler</Typography>
            <Stack direction="row" spacing={3}>
              <FormControlLabel control={<Switch checked={settings.enableFreeShipping} onChange={(e) => setSettings({ ...settings, enableFreeShipping: e.target.checked })} size="small" />} label="Ucretsiz Kargo Aktif" />
              <FormControlLabel control={<Switch checked={settings.autoAssignTracking} onChange={(e) => setSettings({ ...settings, autoAssignTracking: e.target.checked })} size="small" />} label="Otomatik Takip No" />
              <FormControlLabel control={<Switch checked={settings.notifyOnShipped} onChange={(e) => setSettings({ ...settings, notifyOnShipped: e.target.checked })} size="small" />} label="Kargoda Bildir" />
              <FormControlLabel control={<Switch checked={settings.notifyOnDelivered} onChange={(e) => setSettings({ ...settings, notifyOnDelivered: e.target.checked })} size="small" />} label="Teslimde Bildir" />
            </Stack>

            <Divider sx={{ my: 3 }} />
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>API Anahtarlari</Typography>
            <Card variant="outlined" sx={{ p: 2, bgcolor: 'rgba(66,165,245,0.05)', borderColor: 'rgba(66,165,245,0.2)' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Kargo firmasi API anahtarlari Entegrasyonlar sayfasindan yonetilmektedir.
                </Typography>
                <Button size="small" variant="outlined" onClick={() => window.location.href = '/integrations'}
                  sx={{ borderColor: olentiaColors.primary.main, color: olentiaColors.primary.main }}>
                  Entegrasyonlara Git
                </Button>
              </Stack>
            </Card>

            <Box sx={{ mt: 3, textAlign: 'right' }}>
              <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveSettings} disabled={savingSettings}
                sx={{ bgcolor: olentiaColors.primary.main, '&:hover': { bgcolor: olentiaColors.primary.dark } }}>
                {savingSettings ? 'Kaydediliyor...' : 'Ayarlari Kaydet'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Tracking Dialog */}
      <Dialog open={!!trackingShipment} onClose={() => setTrackingShipment(null)} maxWidth="sm" fullWidth>
        {trackingShipment && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar sx={{ bgcolor: `${statusConfig[trackingShipment.status]?.color || '#9e9e9e'}15`, color: statusConfig[trackingShipment.status]?.color }}>
                  <ShippingIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={700}>Kargo Takip</Typography>
                  <Typography variant="caption" color="text.secondary">{trackingShipment.trackingNumber}</Typography>
                </Box>
              </Stack>
              <IconButton onClick={() => setTrackingShipment(null)} size="small"><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent>
              {/* Shipment info */}
              <Grid container spacing={1.5} sx={{ mb: 3 }}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Siparis</Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ color: olentiaColors.primary.main }}>{trackingShipment.order?.orderNumber}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Musteri</Typography>
                  <Typography variant="body2">{trackingShipment.user?.firstName} {trackingShipment.user?.lastName}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Kargo Firmasi</Typography>
                  <Typography variant="body2">{carrierLabels[trackingShipment.carrier || ''] || trackingShipment.carrier}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Durum</Typography>
                  <Chip label={statusConfig[trackingShipment.status]?.label} size="small"
                    sx={{ bgcolor: `${statusConfig[trackingShipment.status]?.color}18`, color: statusConfig[trackingShipment.status]?.color }} />
                </Grid>
              </Grid>

              <Divider sx={{ mb: 2 }} />

              {/* Timeline */}
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>Kargo Hareketleri</Typography>
              <Stack spacing={0}>
                {getTrackingSteps(trackingShipment.status).map((step, i, arr) => (
                  <Stack key={i} direction="row" spacing={1.5} sx={{ pb: 2, position: 'relative' }}>
                    {/* Vertical line */}
                    {i < arr.length - 1 && (
                      <Box sx={{
                        position: 'absolute', left: 15, top: 32, width: 2, height: 'calc(100% - 16px)',
                        bgcolor: step.done && arr[i + 1]?.done ? '#4CAF50' : 'divider',
                      }} />
                    )}
                    {/* Icon */}
                    <Avatar sx={{
                      width: 32, height: 32, zIndex: 1,
                      bgcolor: step.done ? '#4CAF5015' : 'action.hover',
                      color: step.done ? '#4CAF50' : 'text.disabled',
                    }}>
                      {step.icon}
                    </Avatar>
                    {/* Content */}
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={step.done ? 600 : 400} sx={{ color: step.done ? 'text.primary' : 'text.disabled' }}>
                        {step.label}
                      </Typography>
                      <Typography variant="caption" color={step.done ? 'text.secondary' : 'text.disabled'}>
                        {step.done ? step.time : '-'}
                      </Typography>
                    </Box>
                    {step.done && i === arr.filter(s => s.done).length - 1 && (
                      <Chip label="Guncel" size="small" sx={{ height: 20, fontSize: 10, bgcolor: '#4CAF5018', color: '#4CAF50' }} />
                    )}
                  </Stack>
                ))}
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              {trackingShipment.carrier && trackingShipment.trackingNumber && carrierTrackingUrls[trackingShipment.carrier] && (
                <Button variant="outlined" size="small" startIcon={<OpenIcon />}
                  onClick={() => window.open(carrierTrackingUrls[trackingShipment.carrier!](trackingShipment.trackingNumber!), '_blank')}
                  sx={{ mr: 'auto' }}>
                  {carrierLabels[trackingShipment.carrier]} Sitesinde Takip Et
                </Button>
              )}
              <Button onClick={() => setTrackingShipment(null)}>Kapat</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
