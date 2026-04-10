'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Chip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, Divider, Skeleton, Tooltip, TextField,
  TablePagination, Grid, Select, MenuItem, FormControl, InputLabel,
  CardContent,
} from '@mui/material';
import {
  Visibility as ViewIcon, Delete as DeleteIcon,
  Store as FranchiseIcon, Close as CloseIcon,
} from '@mui/icons-material';
import { websiteApi } from '@/lib/api';
import PageHeader from '@/components/common/PageHeader';
import ExportButton from '@/components/common/ExportButton';

interface FranchiseApp {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  city: string;
  locationType: string;
  locationTypeOther?: string;
  budget: string;
  hasExperience: boolean;
  experienceDetail?: string;
  plannedOpenDate: string;
  heardFrom?: string;
  notes?: string;
  status: string;
  adminNotes?: string;
  createdAt: string;
}

const statusConfig: Record<string, { label: string; color: 'default' | 'info' | 'success' | 'warning' | 'error' }> = {
  NEW: { label: 'Yeni', color: 'info' },
  REVIEWING: { label: 'Inceleniyor', color: 'warning' },
  CONTACTED: { label: 'Iletisime Gecildi', color: 'warning' },
  INTERVIEW: { label: 'Gorusme', color: 'info' },
  APPROVED: { label: 'Onaylandi', color: 'success' },
  REJECTED: { label: 'Reddedildi', color: 'error' },
};

const locationLabels: Record<string, string> = {
  cadde: 'Cadde', avm: 'AVM', ofis: 'Ofis Bolgesi', diger: 'Diger',
};

const budgetLabels: Record<string, string> = {
  '500000-alti': '500.000 TL alti',
  '500000-1000000': '500.000 - 1.000.000 TL',
  '1000000-2000000': '1.000.000 - 2.000.000 TL',
  '2000000-uzeri': '2.000.000 TL uzeri',
};

const openDateLabels: Record<string, string> = {
  hemen: 'Hemen', '1-3-ay': '1-3 ay icinde', '3-6-ay': '3-6 ay icinde', '6-ay-sonrasi': '6 ay ve sonrasi',
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function FranchisePage() {
  const [apps, setApps] = useState<FranchiseApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<FranchiseApp | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [stats, setStats] = useState<any>(null);

  const fetchApps = useCallback(async () => {
    try {
      setLoading(true);
      const res = await websiteApi.getFranchiseApplications({
        page: page + 1, limit: rowsPerPage, status: statusFilter || undefined,
      });
      const data = res?.data || res;
      if (Array.isArray(data)) {
        setApps(data);
        setTotal(data.length);
      } else {
        setApps(data?.data || []);
        setTotal(data?.meta?.total || 0);
      }
    } catch { setApps([]); }
    finally { setLoading(false); }
  }, [page, rowsPerPage, statusFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await websiteApi.getFranchiseStats();
      setStats(res?.data || res);
    } catch { /* */ }
  }, []);

  useEffect(() => { fetchApps(); fetchStats(); }, [fetchApps, fetchStats]);

  const handleViewDetail = (app: FranchiseApp) => {
    setSelected(app);
    setDetailOpen(true);
  };

  const handleOpenStatusDialog = (app: FranchiseApp) => {
    setSelected(app);
    setNewStatus(app.status);
    setAdminNotes(app.adminNotes || '');
    setStatusDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selected) return;
    await websiteApi.updateFranchiseStatus(selected.id, { status: newStatus, adminNotes });
    setStatusDialogOpen(false);
    fetchApps();
    fetchStats();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu basvuru silinecek. Emin misiniz?')) return;
    await websiteApi.deleteFranchiseApplication(id);
    fetchApps();
    fetchStats();
  };

  const exportData = apps.map(a => ({
    'Ad Soyad': a.fullName,
    'Telefon': a.phone,
    'E-posta': a.email,
    'Sehir': a.city,
    'Lokasyon': locationLabels[a.locationType] || a.locationType,
    'Butce': budgetLabels[a.budget] || a.budget,
    'Tecrube': a.hasExperience ? 'Evet' : 'Hayir',
    'Acilis Zamani': openDateLabels[a.plannedOpenDate] || a.plannedOpenDate,
    'Durum': statusConfig[a.status]?.label || a.status,
    'Tarih': formatDate(a.createdAt),
  }));

  return (
    <Box>
      <PageHeader
        title="Franchise Basvurulari"
        subtitle={`${total} basvuru`}
        icon={<FranchiseIcon />}
        action={<ExportButton data={exportData} filename="franchise-basvurulari" />}
      />

      {/* Stats */}
      {stats && (
        <Grid container spacing={2} sx={{ mt: 1, mb: 2 }}>
          <Grid size={{ xs: 6, md: 2 }}>
            <Card><CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography fontSize={24} fontWeight={700}>{stats.total || 0}</Typography>
              <Typography fontSize={12} color="text.secondary">Toplam</Typography>
            </CardContent></Card>
          </Grid>
          {Object.entries(statusConfig).map(([key, cfg]) => (
            <Grid size={{ xs: 6, md: 2 }} key={key}>
              <Card><CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography fontSize={24} fontWeight={700}>{stats.byStatus?.[key] || 0}</Typography>
                <Typography fontSize={12} color="text.secondary">{cfg.label}</Typography>
              </CardContent></Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Card>
        <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Durum Filtresi</InputLabel>
            <Select value={statusFilter} label="Durum Filtresi" onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
              <MenuItem value="">Tumu</MenuItem>
              {Object.entries(statusConfig).map(([key, cfg]) => (
                <MenuItem key={key} value={key}>{cfg.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Ad Soyad</TableCell>
                <TableCell>Telefon</TableCell>
                <TableCell>E-posta</TableCell>
                <TableCell>Sehir</TableCell>
                <TableCell>Lokasyon</TableCell>
                <TableCell>Butce</TableCell>
                <TableCell align="center">Durum</TableCell>
                <TableCell>Tarih</TableCell>
                <TableCell align="right">Islemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>{Array.from({ length: 9 }).map((_, j) => (<TableCell key={j}><Skeleton /></TableCell>))}</TableRow>
                ))
              ) : apps.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">Henuz franchise basvurusu yok</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                apps.map((app) => (
                  <TableRow key={app.id} hover>
                    <TableCell><Typography fontWeight={600} fontSize={13}>{app.fullName}</Typography></TableCell>
                    <TableCell><Typography fontSize={12}>{app.phone}</Typography></TableCell>
                    <TableCell><Typography fontSize={12} color="text.secondary">{app.email}</Typography></TableCell>
                    <TableCell><Typography fontSize={12}>{app.city}</Typography></TableCell>
                    <TableCell>
                      <Chip label={locationLabels[app.locationType] || app.locationType} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell><Typography fontSize={11}>{budgetLabels[app.budget] || app.budget}</Typography></TableCell>
                    <TableCell align="center">
                      <Chip
                        label={statusConfig[app.status]?.label || app.status}
                        color={statusConfig[app.status]?.color || 'default'}
                        size="small"
                        onClick={() => handleOpenStatusDialog(app)}
                        sx={{ cursor: 'pointer' }}
                      />
                    </TableCell>
                    <TableCell><Typography fontSize={12} color="text.secondary">{formatDate(app.createdAt)}</Typography></TableCell>
                    <TableCell align="right">
                      <Tooltip title="Detay">
                        <IconButton size="small" onClick={() => handleViewDetail(app)}>
                          <ViewIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Sil">
                        <IconButton size="small" color="error" onClick={() => handleDelete(app.id)}>
                          <DeleteIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div" count={total} page={page} rowsPerPage={rowsPerPage}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }}
          rowsPerPageOptions={[10, 25, 50]}
          labelRowsPerPage="Sayfa basina:"
        />
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Franchise Basvuru Detayi
          <IconButton size="small" onClick={() => setDetailOpen(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          {selected && (
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Typography fontSize={12} color="text.secondary">Ad Soyad</Typography>
                <Typography fontSize={14} fontWeight={600}>{selected.fullName}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography fontSize={12} color="text.secondary">Telefon</Typography>
                <Typography fontSize={14}>{selected.phone}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography fontSize={12} color="text.secondary">E-posta</Typography>
                <Typography fontSize={14}>{selected.email}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography fontSize={12} color="text.secondary">Sehir / Ilce</Typography>
                <Typography fontSize={14}>{selected.city}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography fontSize={12} color="text.secondary">Lokasyon Turu</Typography>
                <Typography fontSize={14}>
                  {locationLabels[selected.locationType] || selected.locationType}
                  {selected.locationTypeOther && ` (${selected.locationTypeOther})`}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography fontSize={12} color="text.secondary">Yatirim Butcesi</Typography>
                <Typography fontSize={14}>{budgetLabels[selected.budget] || selected.budget}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography fontSize={12} color="text.secondary">Isletme Tecrubesi</Typography>
                <Typography fontSize={14}>
                  {selected.hasExperience ? 'Evet' : 'Hayir'}
                  {selected.experienceDetail && ` — ${selected.experienceDetail}`}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography fontSize={12} color="text.secondary">Acilis Plani</Typography>
                <Typography fontSize={14}>{openDateLabels[selected.plannedOpenDate] || selected.plannedOpenDate}</Typography>
              </Grid>
              {selected.heardFrom && (
                <Grid size={{ xs: 6 }}>
                  <Typography fontSize={12} color="text.secondary">Bizi Nereden Duydu</Typography>
                  <Typography fontSize={14}>{selected.heardFrom}</Typography>
                </Grid>
              )}
              <Grid size={{ xs: 6 }}>
                <Typography fontSize={12} color="text.secondary">Durum</Typography>
                <Chip
                  label={statusConfig[selected.status]?.label || selected.status}
                  color={statusConfig[selected.status]?.color || 'default'}
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography fontSize={12} color="text.secondary">Basvuru Tarihi</Typography>
                <Typography fontSize={14}>{formatDate(selected.createdAt)}</Typography>
              </Grid>
              {selected.notes && (
                <Grid size={{ xs: 12 }}>
                  <Typography fontSize={12} color="text.secondary">Basvuranin Notu</Typography>
                  <Typography fontSize={14} sx={{ mt: 0.5, p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
                    {selected.notes}
                  </Typography>
                </Grid>
              )}
              {selected.adminNotes && (
                <Grid size={{ xs: 12 }}>
                  <Typography fontSize={12} color="text.secondary">Admin Notu</Typography>
                  <Typography fontSize={14} sx={{ mt: 0.5, p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
                    {selected.adminNotes}
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => { setDetailOpen(false); if (selected) handleOpenStatusDialog(selected); }}>
            Durum Guncelle
          </Button>
          <Button onClick={() => setDetailOpen(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Durum Guncelle</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Durum</InputLabel>
            <Select value={newStatus} label="Durum" onChange={(e) => setNewStatus(e.target.value)}>
              {Object.entries(statusConfig).map(([key, cfg]) => (
                <MenuItem key={key} value={key}>{cfg.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField fullWidth label="Admin Notu" size="small" multiline rows={3} value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)} />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setStatusDialogOpen(false)}>Iptal</Button>
          <Button variant="contained" onClick={handleUpdateStatus}>Guncelle</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
