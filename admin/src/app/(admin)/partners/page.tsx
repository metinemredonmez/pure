'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Skeleton, Avatar, Stack,
  IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Divider, LinearProgress, Alert, TablePagination, TextField,
  FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import {
  Handshake as PartnerIcon, Close as CloseIcon, Info as InfoIcon,
  TrendingUp as TrendIcon, LocationOn as LocationIcon,
  Email as EmailIcon, Phone as PhoneIcon, Business as BusinessIcon,
  Person as PersonIcon, MonetizationOn as MoneyIcon,
  Visibility as ViewIcon, Map as MapIcon,
  Groups as GroupsIcon, Receipt as ReceiptIcon,
  Public as PublicIcon, LocalCafe as CafeIcon,
  Edit as EditIcon, Delete as DeleteIcon, Warning as WarningIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { partnerAdminApi } from '@/lib/api';
import { olentiaColors } from '@/lib/theme';
import PageHeader from '@/components/common/PageHeader';
import ExportButton from '@/components/common/ExportButton';

interface Partner {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  companyName?: string;
  partnerRegion?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  locationLabel?: string;
  createdAt: string;
  _count?: { partnerSales: number };
}

interface RegionalData {
  region: string;
  salesCount: number;
  totalRevenue: number;
  totalCommission: number;
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n);
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const regionColors: Record<string, string> = {
  'Marmara': '#4FC3F7',
  'Ege': '#66BB6A',
  'Ic Anadolu': '#FFA726',
  'Akdeniz': '#EF5350',
  'Karadeniz': '#AB47BC',
  'Guneydogu': '#FF7043',
  'Dogu Anadolu': '#26A69A',
};

function getRegionColor(region: string): string {
  return regionColors[region] || olentiaColors.primary.main;
}

export default function PartnersPage() {
  const [loading, setLoading] = useState(true);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [regional, setRegional] = useState<RegionalData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);

  // Detail / Edit dialog
  const [detailDialog, setDetailDialog] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ companyName: '', phone: '', partnerRegion: '', locationLabel: '' });
  const [updating, setUpdating] = useState(false);

  // Delete
  const [deleteDialog, setDeleteDialog] = useState<Partner | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, rRes] = await Promise.all([
        partnerAdminApi.getPartners().catch(() => ({ data: { data: [] } })),
        partnerAdminApi.getRegionalPerformance().catch(() => ({ data: [] })),
      ]);
      const pData = pRes.data || pRes;
      const partnerList = pData.data || pData.items || (Array.isArray(pData) ? pData : []);
      setPartners(partnerList);
      setTotal(pData.meta?.total || partnerList.length);
      const rData = rRes.data || rRes;
      setRegional(Array.isArray(rData) ? rData : []);
    } catch (e) {
      console.error('Partner verileri yuklenemedi:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Computed stats
  const totalRevenue = regional.reduce((s, r) => s + r.totalRevenue, 0);
  const totalCommission = regional.reduce((s, r) => s + r.totalCommission, 0);
  const totalSalesCount = regional.reduce((s, r) => s + r.salesCount, 0);
  const maxRegionRevenue = Math.max(...regional.map(r => r.totalRevenue), 1);

  const statCards = [
    { title: 'Toplam Partner', value: partners.length, icon: <GroupsIcon />, color: '#4FC3F7', desc: 'Aktif is ortagi sayisi' },
    { title: 'Toplam Satis', value: totalSalesCount, icon: <ReceiptIcon />, color: olentiaColors.primary.main, desc: 'Tum partnerler genelinde' },
    { title: 'Toplam Ciro', value: formatCurrency(totalRevenue), icon: <MoneyIcon />, color: '#66BB6A', desc: 'Partner kanali uzerinden' },
    { title: 'Toplam Komisyon', value: formatCurrency(totalCommission), icon: <TrendIcon />, color: '#FFA726', desc: 'Partner kazanclari' },
  ];

  const handleViewPartner = (partner: Partner) => {
    setSelectedPartner(partner);
    setEditMode(false);
    setEditForm({
      companyName: partner.companyName || '',
      phone: partner.phone || '',
      partnerRegion: partner.partnerRegion || '',
      locationLabel: partner.locationLabel || '',
    });
    setDetailDialog(true);
  };

  const handleUpdatePartner = async () => {
    if (!selectedPartner) return;
    setUpdating(true);
    try {
      await partnerAdminApi.updatePartner(selectedPartner.id, editForm);
      setDetailDialog(false);
      setEditMode(false);
      fetchData();
    } catch (e) {
      console.error('Partner guncellenemedi:', e);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeletePartner = async () => {
    if (!deleteDialog) return;
    setDeleting(true);
    try {
      await partnerAdminApi.deletePartner(deleteDialog.id);
      setDeleteDialog(null);
      fetchData();
    } catch (e) {
      console.error('Partner silinemedi:', e);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Partner Yonetimi"
        subtitle="Is ortaklarini, bolgesel performansi ve satis agini yonetin"
        breadcrumbs={[{ label: 'Partner Yonetimi' }]}
        action={
          <ExportButton
            data={partners.map(p => ({
              partner: p.firstName ? `${p.firstName} ${p.lastName}` : p.email,
              firma: p.companyName || '-',
              bolge: p.partnerRegion || '-',
              satisSayisi: p._count?.partnerSales || 0,
              konum: p.locationLabel || '-',
              tarih: p.createdAt,
            }))}
            columns={[
              { key: 'partner', label: 'Partner' },
              { key: 'firma', label: 'Firma' },
              { key: 'bolge', label: 'Bolge' },
              { key: 'satisSayisi', label: 'Satis Sayisi' },
              { key: 'konum', label: 'Konum' },
              { key: 'tarih', label: 'Kayit Tarihi' },
            ]}
            filename="partnerler"
          />
        }
      />

      {/* Info Banner */}
      <Card sx={{ mb: 3, p: 2, bgcolor: `${olentiaColors.primary.main}08`, border: `1px solid ${olentiaColors.primary.main}20` }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <InfoIcon sx={{ color: olentiaColors.primary.main, fontSize: 20 }} />
          <Box>
            <Typography variant="body2" fontWeight={600} sx={{ color: olentiaColors.primary.main }}>
              Partner Satis Agi
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Olentia&apos;nin Turkiye genelindeki bayi ve is ortaklari agi. Her partner kendi bolgesinde satis yaparak komisyon kazanir.
              Bolgesel performans raporlari ile en verimli bolgeler takip edilir.
            </Typography>
          </Box>
        </Stack>
      </Card>

      {/* Stat Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statCards.map((card) => (
          <Grid key={card.title} size={{ xs: 6, md: 3 }}>
            <Card sx={{
              transition: 'all 0.2s ease',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 4px 20px ${card.color}15` },
            }}>
              <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: `${card.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color }}>
                    {card.icon}
                  </Box>
                  <Box>
                    <Typography variant="h5" fontWeight={800} sx={{ fontSize: typeof card.value === 'string' ? 16 : 24 }}>
                      {card.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">{card.title}</Typography>
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, display: 'block' }}>{card.desc}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5}>
        {/* Partner Table */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <Box sx={{ p: 2, pb: 0 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1" fontWeight={700}>Partnerler</Typography>
                <Chip label={`${partners.length} partner`} size="small" sx={{ bgcolor: `${olentiaColors.primary.main}12`, color: olentiaColors.primary.main, fontWeight: 600 }} />
              </Stack>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Partner</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Firma</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Bolge</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Konum</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">Satislar</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">Islem</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>{Array.from({ length: 6 }).map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}</TableRow>
                      ))
                    : partners.length === 0
                    ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                          <PartnerIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1.5 }} />
                          <Typography variant="h6" color="text.secondary" fontWeight={600}>
                            Henuz partner bulunamadi
                          </Typography>
                          <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
                            Partner eklemek icin kullanici yonetiminden bir kullaniciya &quot;PARTNER&quot; rolu atayin.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )
                    : partners.map((p) => (
                        <TableRow key={p.id} hover sx={{ cursor: 'pointer' }} onClick={() => handleViewPartner(p)}>
                          <TableCell>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <Avatar sx={{
                                width: 36, height: 36,
                                bgcolor: `${getRegionColor(p.partnerRegion || '')}20`,
                                color: getRegionColor(p.partnerRegion || ''),
                                fontSize: 14, fontWeight: 700,
                              }}>
                                {p.firstName?.[0] || '?'}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight={700}>
                                  {p.firstName ? `${p.firstName} ${p.lastName}` : p.email}
                                </Typography>
                                <Typography variant="caption" color="text.disabled">{p.email}</Typography>
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>{p.companyName || '-'}</Typography>
                          </TableCell>
                          <TableCell>
                            {p.partnerRegion ? (
                              <Chip
                                icon={<PublicIcon sx={{ fontSize: 14 }} />}
                                label={p.partnerRegion}
                                size="small"
                                sx={{
                                  height: 24, fontSize: 11, fontWeight: 600,
                                  bgcolor: `${getRegionColor(p.partnerRegion)}15`,
                                  color: getRegionColor(p.partnerRegion),
                                  '& .MuiChip-icon': { color: getRegionColor(p.partnerRegion) },
                                }}
                              />
                            ) : (
                              <Typography variant="caption" color="text.disabled">-</Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {p.locationLabel ? (
                              <Stack direction="row" spacing={0.5} alignItems="center">
                                <LocationIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                                <Typography variant="caption" color="text.secondary">{p.locationLabel}</Typography>
                              </Stack>
                            ) : (
                              <Typography variant="caption" color="text.disabled">-</Typography>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={p._count?.partnerSales || 0}
                              size="small"
                              sx={{
                                height: 24, minWidth: 36, fontWeight: 700,
                                bgcolor: (p._count?.partnerSales || 0) > 5 ? 'rgba(102,187,106,0.12)' : 'rgba(0,0,0,0.06)',
                                color: (p._count?.partnerSales || 0) > 5 ? '#66BB6A' : 'text.secondary',
                              }}
                            />
                          </TableCell>
                          <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                            <Tooltip title="Detay">
                              <IconButton size="small" onClick={() => handleViewPartner(p)}>
                                <ViewIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Sil">
                              <IconButton size="small" onClick={() => setDeleteDialog(p)} sx={{ color: '#EF5350' }}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </TableContainer>
            {partners.length > 0 && (
              <TablePagination
                component="div" count={total} page={page}
                onPageChange={(_, p) => setPage(p)}
                rowsPerPage={10}
                onRowsPerPageChange={() => {}}
                rowsPerPageOptions={[10]}
                labelRowsPerPage=""
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
              />
            )}
          </Card>
        </Grid>

        {/* Regional Performance Sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ mb: 2.5 }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={700}>Bolgesel Performans</Typography>
                <MapIcon sx={{ fontSize: 20, color: 'text.disabled' }} />
              </Stack>

              {loading
                ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={56} sx={{ mb: 1, borderRadius: 1 }} />)
                : regional.length > 0
                ? (
                  <Stack spacing={1.5}>
                    {regional
                      .sort((a, b) => b.totalRevenue - a.totalRevenue)
                      .map((r, i) => {
                        const color = getRegionColor(r.region || '');
                        const pct = (r.totalRevenue / maxRegionRevenue) * 100;
                        return (
                          <Box key={r.region} sx={{
                            p: 1.5, borderRadius: 2,
                            border: `1px solid ${color}20`,
                            bgcolor: `${color}04`,
                            transition: 'all 0.2s',
                            '&:hover': { bgcolor: `${color}08`, borderColor: `${color}40` },
                          }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.8 }}>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Box sx={{
                                  width: 8, height: 8, borderRadius: '50%', bgcolor: color,
                                  boxShadow: `0 0 6px ${color}60`,
                                }} />
                                <Typography variant="body2" fontWeight={700}>{r.region}</Typography>
                                {i === 0 && <Chip label="1." size="small" sx={{ height: 18, fontSize: 10, fontWeight: 800, bgcolor: `${color}20`, color }} />}
                              </Stack>
                              <Typography variant="body2" fontWeight={800} sx={{ color }}>
                                {formatCurrency(r.totalRevenue)}
                              </Typography>
                            </Stack>

                            <LinearProgress
                              variant="determinate"
                              value={pct}
                              sx={{
                                height: 6, borderRadius: 3, mb: 0.8,
                                bgcolor: `${color}12`,
                                '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 },
                              }}
                            />

                            <Stack direction="row" justifyContent="space-between">
                              <Typography variant="caption" color="text.disabled">
                                {r.salesCount} satis
                              </Typography>
                              <Typography variant="caption" color="text.disabled">
                                Komisyon: {formatCurrency(r.totalCommission)}
                              </Typography>
                            </Stack>
                          </Box>
                        );
                      })}
                  </Stack>
                )
                : (
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <MapIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">Bolgesel veri yok</Typography>
                  </Box>
                )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          {regional.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Ozet Bilgiler</Typography>
                <Stack spacing={1.5}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">Ort. Partner Basi Satis</Typography>
                    <Typography variant="body2" fontWeight={700}>
                      {partners.length > 0 ? Math.round(totalSalesCount / partners.length) : 0}
                    </Typography>
                  </Stack>
                  <Divider />
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">Ort. Komisyon Orani</Typography>
                    <Typography variant="body2" fontWeight={700} sx={{ color: '#66BB6A' }}>
                      {totalRevenue > 0 ? `%${((totalCommission / totalRevenue) * 100).toFixed(1)}` : '-'}
                    </Typography>
                  </Stack>
                  <Divider />
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">Aktif Bolge Sayisi</Typography>
                    <Typography variant="body2" fontWeight={700}>{regional.length}</Typography>
                  </Stack>
                  <Divider />
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">En Yuksek Ciro</Typography>
                    <Chip
                      label={regional.sort((a, b) => b.totalRevenue - a.totalRevenue)?.[0]?.region || '-'}
                      size="small"
                      sx={{
                        height: 22, fontSize: 11, fontWeight: 700,
                        bgcolor: `${getRegionColor(regional?.[0]?.region || '')}15`,
                        color: getRegionColor(regional?.[0]?.region || ''),
                      }}
                    />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* ═══ PARTNER DETAIL DIALOG ═══ */}
      <Dialog open={detailDialog} onClose={() => setDetailDialog(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { bgcolor: 'background.paper', backgroundImage: 'none' } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{
              width: 44, height: 44,
              bgcolor: `${getRegionColor(selectedPartner?.partnerRegion || '')}20`,
              color: getRegionColor(selectedPartner?.partnerRegion || ''),
              fontWeight: 700, fontSize: 18,
            }}>
              {selectedPartner?.firstName?.[0] || '?'}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {selectedPartner?.firstName ? `${selectedPartner.firstName} ${selectedPartner.lastName}` : selectedPartner?.email}
              </Typography>
              <Typography variant="caption" color="text.secondary">Partner Detayi</Typography>
            </Box>
          </Stack>
          <IconButton onClick={() => setDetailDialog(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          {selectedPartner && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              {!editMode ? (
                <>
                  {/* View Mode — Info Cards */}
                  <Grid container spacing={1.5}>
                    {[
                      { icon: <BusinessIcon sx={{ fontSize: 16, color: 'text.secondary' }} />, label: 'Firma', value: selectedPartner.companyName || '-' },
                      { icon: <PublicIcon sx={{ fontSize: 16, color: 'text.secondary' }} />, label: 'Bolge', value: selectedPartner.partnerRegion || '-' },
                      { icon: <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />, label: 'E-posta', value: selectedPartner.email, small: true },
                      { icon: <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />, label: 'Telefon', value: selectedPartner.phone || '-' },
                    ].map((item) => (
                      <Grid key={item.label} size={{ xs: 6 }}>
                        <Card variant="outlined" sx={{ p: 1.5 }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            {item.icon}
                            <Box>
                              <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                              <Typography variant="body2" fontWeight={600} sx={item.small ? { fontSize: 11 } : {}}>{item.value}</Typography>
                            </Box>
                          </Stack>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>

                  {selectedPartner.locationLabel && (
                    <Card variant="outlined" sx={{ p: 1.5, bgcolor: 'rgba(79,195,247,0.04)' }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <LocationIcon sx={{ fontSize: 16, color: '#4FC3F7' }} />
                        <Typography variant="body2" fontWeight={600}>{selectedPartner.locationLabel}</Typography>
                      </Stack>
                    </Card>
                  )}

                  <Stack direction="row" justifyContent="space-between" sx={{ pt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">Satislar: <b>{selectedPartner._count?.partnerSales || 0}</b></Typography>
                    <Typography variant="caption" color="text.secondary">Kayit: <b>{formatDate(selectedPartner.createdAt)}</b></Typography>
                  </Stack>
                </>
              ) : (
                <>
                  {/* Edit Mode */}
                  <TextField fullWidth label="Firma Adi" size="small" value={editForm.companyName}
                    onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })} />
                  <TextField fullWidth label="Telefon" size="small" value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                  <FormControl fullWidth size="small">
                    <InputLabel>Bolge</InputLabel>
                    <Select value={editForm.partnerRegion} label="Bolge"
                      onChange={(e) => setEditForm({ ...editForm, partnerRegion: e.target.value })}>
                      {['Marmara', 'Ege', 'Ic Anadolu', 'Akdeniz', 'Karadeniz', 'Guneydogu', 'Dogu Anadolu'].map(r => (
                        <MenuItem key={r} value={r}>{r}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField fullWidth label="Konum Etiketi" size="small" value={editForm.locationLabel}
                    onChange={(e) => setEditForm({ ...editForm, locationLabel: e.target.value })}
                    placeholder="Istanbul Kadikoy" />
                </>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, justifyContent: 'space-between' }}>
          <Box>
            {!editMode && (
              <Button size="small" color="error" onClick={() => { setDetailDialog(false); setDeleteDialog(selectedPartner); }}>
                Sil
              </Button>
            )}
          </Box>
          <Stack direction="row" spacing={1}>
            {editMode ? (
              <>
                <Button onClick={() => setEditMode(false)} color="inherit">Vazgec</Button>
                <Button onClick={handleUpdatePartner} variant="contained" disabled={updating}
                  startIcon={<SaveIcon />}
                  sx={{ bgcolor: olentiaColors.primary.main, '&:hover': { bgcolor: olentiaColors.primary.dark } }}>
                  {updating ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => setDetailDialog(false)} color="inherit">Kapat</Button>
                <Button onClick={() => setEditMode(true)} variant="outlined" startIcon={<EditIcon />}
                  sx={{ borderColor: olentiaColors.primary.main, color: olentiaColors.primary.main }}>
                  Duzenle
                </Button>
              </>
            )}
          </Stack>
        </DialogActions>
      </Dialog>

      {/* ═══ DELETE CONFIRM DIALOG ═══ */}
      <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { bgcolor: 'background.paper', backgroundImage: 'none' } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
          <WarningIcon sx={{ color: '#EF5350' }} />
          <Typography variant="h6" fontWeight={700}>Partner Sil</Typography>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            Partner deaktif edilecek ve musteri rolune dondurulecektir.
          </Alert>
          {deleteDialog && (
            <Card variant="outlined" sx={{ p: 2 }}>
              <Typography variant="body2" fontWeight={700}>
                {deleteDialog.firstName} {deleteDialog.lastName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {deleteDialog.companyName} — {deleteDialog.partnerRegion}
              </Typography>
            </Card>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDeleteDialog(null)} color="inherit">Iptal</Button>
          <Button onClick={handleDeletePartner} variant="contained" disabled={deleting}
            sx={{ bgcolor: '#EF5350', '&:hover': { bgcolor: '#D32F2F' } }}>
            {deleting ? 'Siliniyor...' : 'Evet, Sil'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
