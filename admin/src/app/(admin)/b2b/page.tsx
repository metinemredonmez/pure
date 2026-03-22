'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination, Chip, IconButton,
  Skeleton, Tooltip, Select, MenuItem, FormControl, InputLabel, Dialog,
  DialogTitle, DialogContent, DialogActions, Button, TextField, Divider,
  Stack, Avatar, Tabs, Tab, Alert, LinearProgress,
} from '@mui/material';
import {
  Business as B2BIcon, Close as CloseIcon, Edit as EditIcon,
  Add as AddIcon, Person as PersonIcon, Email as EmailIcon,
  Phone as PhoneIcon, Info as InfoIcon, Description as QuoteIcon,
  Handshake as ContractIcon, TrendingUp as TrendIcon,
  Groups as GroupsIcon, LocalCafe as CafeIcon,
  AssignmentTurnedIn as AssignIcon, FilterList as FilterIcon,
  Visibility as ViewIcon, Delete as DeleteIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { b2bApi } from '@/lib/api';
import { olentiaColors } from '@/lib/theme';
import PageHeader from '@/components/common/PageHeader';
import ExportButton from '@/components/common/ExportButton';

interface Lead {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  employeeCount?: number;
  monthlyConsumption?: string;
  status: string;
  assignedTo?: string;
  notes?: string;
  source?: string;
  lostReason?: string;
  createdAt: string;
  updatedAt?: string;
  quotes?: Quote[];
  contracts?: Contract[];
}

interface Quote {
  id: string;
  leadId: string;
  packageName: string;
  monthlyKg: number;
  machineCount: number;
  contractMonths: number;
  monthlyPrice: number;
  setupFee?: number;
  notes?: string;
  sentAt?: string;
  createdAt: string;
}

interface Contract {
  id: string;
  leadId: string;
  contractNumber: string;
  startDate: string;
  endDate: string;
  monthlyKg: number;
  monthlyPrice: number;
  status: string;
  signedAt?: string;
  createdAt: string;
}

const statusConfig: Record<string, { label: string; color: 'warning' | 'info' | 'success' | 'error' | 'default' | 'primary' | 'secondary'; icon: string }> = {
  NEW_LEAD: { label: 'Yeni Lead', color: 'info', icon: '🆕' },
  CONTACTED: { label: 'Iletisimde', color: 'warning', icon: '📞' },
  QUALIFIED: { label: 'Nitelikli', color: 'primary', icon: '✅' },
  PROPOSAL_SENT: { label: 'Teklif Gonderildi', color: 'secondary', icon: '📋' },
  NEGOTIATION: { label: 'Muzakere', color: 'warning', icon: '🤝' },
  WON: { label: 'Kazanildi', color: 'success', icon: '🎉' },
  LOST: { label: 'Kayip', color: 'error', icon: '❌' },
};

const consumptionOptions = ['5-10kg', '10-25kg', '25-50kg', '50-100kg', '100kg+'];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n);
}

export default function B2BPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [tab, setTab] = useState(0);

  // Create Lead
  const [createDialog, setCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState({
    companyName: '', contactName: '', email: '', phone: '',
    employeeCount: '', monthlyConsumption: '',
  });
  const [creating, setCreating] = useState(false);

  // Detail / Edit
  const [detailDialog, setDetailDialog] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  // Delete
  const [deleteDialog, setDeleteDialog] = useState<Lead | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Create Quote
  const [quoteDialog, setQuoteDialog] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    packageName: '', monthlyKg: '', machineCount: '', contractMonths: '12', monthlyPrice: '', setupFee: '',
  });
  const [creatingQuote, setCreatingQuote] = useState(false);

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const r = await b2bApi.getLeads({ page: page + 1, limit: rowsPerPage, status: statusFilter || undefined });
      const d = r.data || r;
      setLeads(d.data || d.items || d || []);
      setTotal(d.meta?.total || d.total || 0);
    } catch (e) {
      console.error('B2B verileri yuklenemedi:', e);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, statusFilter]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  // Stats
  const stats = {
    total: total,
    won: leads.filter(l => l.status === 'WON').length,
    active: leads.filter(l => !['WON', 'LOST'].includes(l.status)).length,
    lost: leads.filter(l => l.status === 'LOST').length,
  };

  const handleCreateLead = async () => {
    setCreating(true);
    try {
      const payload: Record<string, unknown> = {
        companyName: createForm.companyName,
        contactName: createForm.contactName,
        email: createForm.email,
        phone: createForm.phone,
      };
      if (createForm.employeeCount) payload.employeeCount = parseInt(createForm.employeeCount);
      if (createForm.monthlyConsumption) payload.monthlyConsumption = createForm.monthlyConsumption;

      // Public endpoint - no auth needed
      const { api } = await import('@/lib/api');
      await api.post('/b2b/leads', payload);

      setCreateDialog(false);
      setCreateForm({ companyName: '', contactName: '', email: '', phone: '', employeeCount: '', monthlyConsumption: '' });
      fetchLeads();
    } catch (e) {
      console.error('Lead olusturulamadi:', e);
    } finally {
      setCreating(false);
    }
  };

  const handleViewLead = (lead: Lead) => {
    setSelectedLead(lead);
    setEditStatus(lead.status);
    setEditNotes(lead.notes || '');
    setDetailDialog(true);
  };

  const handleUpdateLead = async () => {
    if (!selectedLead) return;
    setUpdating(true);
    try {
      await b2bApi.updateLead(selectedLead.id, {
        status: editStatus,
        notes: editNotes || undefined,
      });
      setDetailDialog(false);
      fetchLeads();
    } catch (e) {
      console.error('Lead guncellenemedi:', e);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteLead = async () => {
    if (!deleteDialog) return;
    setDeleting(true);
    try {
      await b2bApi.deleteLead(deleteDialog.id);
      setDeleteDialog(null);
      fetchLeads();
    } catch (e) {
      console.error('Lead silinemedi:', e);
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateQuote = async () => {
    if (!selectedLead) return;
    setCreatingQuote(true);
    try {
      await b2bApi.createQuote({
        leadId: selectedLead.id,
        packageName: quoteForm.packageName,
        monthlyKg: parseInt(quoteForm.monthlyKg),
        machineCount: parseInt(quoteForm.machineCount),
        contractMonths: parseInt(quoteForm.contractMonths),
        monthlyPrice: parseFloat(quoteForm.monthlyPrice),
        setupFee: quoteForm.setupFee ? parseFloat(quoteForm.setupFee) : 0,
      });
      setQuoteDialog(false);
      setQuoteForm({ packageName: '', monthlyKg: '', machineCount: '', contractMonths: '12', monthlyPrice: '', setupFee: '' });
      fetchLeads();
    } catch (e) {
      console.error('Teklif olusturulamadi:', e);
    } finally {
      setCreatingQuote(false);
    }
  };

  const statCards = [
    { title: 'Toplam Lead', value: stats.total, icon: <GroupsIcon />, color: '#4FC3F7', desc: 'Kayitli kurumsal aday sayisi' },
    { title: 'Aktif Gorusmeler', value: stats.active, icon: <TrendIcon />, color: olentiaColors.primary.main, desc: 'Devam eden muzakereler' },
    { title: 'Kazanilan', value: stats.won, icon: <AssignIcon />, color: '#66BB6A', desc: 'Sozlesmeye donusen leadler' },
    { title: 'Kayip', value: stats.lost, icon: <B2BIcon />, color: '#EF5350', desc: 'Kapanan firsatlar' },
  ];

  return (
    <Box>
      <PageHeader
        title="B2B Kurumsal Yonetim"
        subtitle="Kurumsal musteri adaylari, teklifler ve sozlesmeleri yonetin"
        breadcrumbs={[{ label: 'B2B Yonetimi' }]}
        action={
          <Stack direction="row" spacing={1} alignItems="center">
            <ExportButton
              data={leads}
              columns={[
                { key: 'companyName', label: 'Firma' },
                { key: 'contactName', label: 'Iletisim' },
                { key: 'email', label: 'E-posta' },
                { key: 'phone', label: 'Telefon' },
                { key: 'status', label: 'Durum' },
                { key: 'monthlyConsumption', label: 'Aylik Tuketim' },
                { key: 'createdAt', label: 'Tarih' },
              ]}
              filename="b2b-leadler"
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialog(true)}
              sx={{ bgcolor: olentiaColors.primary.main, '&:hover': { bgcolor: olentiaColors.primary.dark } }}
            >
              Yeni Lead
            </Button>
          </Stack>
        }
      />

      {/* Info Banner */}
      <Card sx={{ mb: 3, p: 2, bgcolor: `${olentiaColors.primary.main}08`, border: `1px solid ${olentiaColors.primary.main}20` }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <InfoIcon sx={{ color: olentiaColors.primary.main, fontSize: 20 }} />
          <Box>
            <Typography variant="body2" fontWeight={600} sx={{ color: olentiaColors.primary.main }}>
              B2B Kurumsal Satis Sureci
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Kurumsal musteriler web sitesinden veya manuel olarak lead eklenir. Lead → Iletisim → Nitelikli → Teklif → Muzakere → Sozlesme seklinde ilerler.
              Her firmaya ozel kahve paketi, makine tahsisi ve fiyatlandirma yapilabilir.
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
                    <Typography variant="h5" fontWeight={800}>{card.value}</Typography>
                    <Typography variant="caption" color="text.secondary">{card.title}</Typography>
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, display: 'block' }}>{card.desc}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pipeline Progress */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Satis Hatti (Pipeline)</Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {Object.entries(statusConfig).map(([key, config]) => {
            const count = leads.filter(l => l.status === key).length;
            return (
              <Chip
                key={key}
                label={`${config.icon} ${config.label}: ${count}`}
                color={config.color as any}
                variant={statusFilter === key ? 'filled' : 'outlined'}
                size="small"
                onClick={() => { setStatusFilter(statusFilter === key ? '' : key); setPage(0); }}
                sx={{ cursor: 'pointer', fontWeight: 600 }}
              />
            );
          })}
          {statusFilter && (
            <Chip label="Filtreyi Temizle" size="small" variant="outlined" onDelete={() => { setStatusFilter(''); setPage(0); }}
              sx={{ borderStyle: 'dashed' }} />
          )}
        </Stack>
      </Card>

      {/* Leads Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Firma</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Iletisim Kisi</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Iletisim</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tuketim</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Durum</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tarih</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Islem</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>{Array.from({ length: 7 }).map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}</TableRow>
                  ))
                : leads.length === 0
                ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <B2BIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1.5 }} />
                      <Typography variant="h6" color="text.secondary" fontWeight={600}>
                        {statusFilter ? 'Bu durumda lead bulunamadi' : 'Henuz kurumsal musteri adayi yok'}
                      </Typography>
                      <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5, mb: 2 }}>
                        &quot;Yeni Lead&quot; butonuna tiklayarak ilk kurumsal musteri adayinizi ekleyin.
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => setCreateDialog(true)}
                        sx={{ borderColor: olentiaColors.primary.main, color: olentiaColors.primary.main }}
                      >
                        Ilk Lead&apos;i Ekle
                      </Button>
                    </TableCell>
                  </TableRow>
                )
                : leads.map((lead) => (
                    <TableRow key={lead.id} hover sx={{ cursor: 'pointer' }} onClick={() => handleViewLead(lead)}>
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar sx={{ width: 36, height: 36, bgcolor: `${olentiaColors.primary.main}20`, color: olentiaColors.primary.main, fontSize: 14, fontWeight: 700 }}>
                            {lead.companyName[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={700}>{lead.companyName}</Typography>
                            {lead.employeeCount && (
                              <Typography variant="caption" color="text.disabled">{lead.employeeCount} calisan</Typography>
                            )}
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>{lead.contactName}</Typography>
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.3}>
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <EmailIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                            <Typography variant="caption" color="text.secondary">{lead.email}</Typography>
                          </Stack>
                          {lead.phone && (
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <PhoneIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                              <Typography variant="caption" color="text.secondary">{lead.phone}</Typography>
                            </Stack>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {lead.monthlyConsumption ? (
                          <Chip icon={<CafeIcon sx={{ fontSize: 14 }} />} label={lead.monthlyConsumption} size="small"
                            sx={{ height: 24, fontSize: 11, bgcolor: `${olentiaColors.primary.main}12`, color: olentiaColors.primary.main }} />
                        ) : (
                          <Typography variant="caption" color="text.disabled">-</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${statusConfig[lead.status]?.icon || ''} ${statusConfig[lead.status]?.label || lead.status}`}
                          color={statusConfig[lead.status]?.color || 'default'}
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">{formatDate(lead.createdAt)}</Typography>
                      </TableCell>
                      <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                        <Tooltip title="Detay & Duzenle">
                          <IconButton size="small" onClick={() => handleViewLead(lead)}>
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Teklif Olustur">
                          <IconButton size="small" onClick={() => { setSelectedLead(lead); setQuoteDialog(true); }}
                            sx={{ color: '#66BB6A' }}>
                            <QuoteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Sil">
                          <IconButton size="small" onClick={() => setDeleteDialog(lead)}
                            sx={{ color: '#EF5350' }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div" count={total} page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Sayfa basina:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        />
      </Card>

      {/* ═══ CREATE LEAD DIALOG ═══ */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { bgcolor: 'background.paper', backgroundImage: 'none' } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <B2BIcon sx={{ color: olentiaColors.primary.main }} />
            <Typography variant="h6" fontWeight={700}>Yeni Kurumsal Lead</Typography>
          </Stack>
          <IconButton onClick={() => setCreateDialog(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 2.5, borderRadius: 2 }}>
            Kurumsal musteri adayinin bilgilerini girin. Lead otomatik olarak &quot;Yeni Lead&quot; durumunda olusturulur.
          </Alert>

          <Stack spacing={2}>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
              Firma Bilgileri
            </Typography>
            <TextField fullWidth label="Firma Adi *" value={createForm.companyName} size="small"
              onChange={(e) => setCreateForm({ ...createForm, companyName: e.target.value })}
              placeholder="Ornek: ABC Holding A.S." />

            <Stack direction="row" spacing={2}>
              <TextField fullWidth label="Calisan Sayisi" type="number" value={createForm.employeeCount} size="small"
                onChange={(e) => setCreateForm({ ...createForm, employeeCount: e.target.value })}
                placeholder="50" />
              <FormControl fullWidth size="small">
                <InputLabel>Aylik Kahve Tuketimi</InputLabel>
                <Select value={createForm.monthlyConsumption} label="Aylik Kahve Tuketimi"
                  onChange={(e) => setCreateForm({ ...createForm, monthlyConsumption: e.target.value })}>
                  <MenuItem value="">Belirtilmedi</MenuItem>
                  {consumptionOptions.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                </Select>
              </FormControl>
            </Stack>

            <Divider sx={{ my: 0.5 }} />

            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
              Iletisim Bilgileri
            </Typography>

            <TextField fullWidth label="Yetkili Kisi Adi *" value={createForm.contactName} size="small"
              onChange={(e) => setCreateForm({ ...createForm, contactName: e.target.value })}
              placeholder="Ornek: Mehmet Yilmaz" />

            <Stack direction="row" spacing={2}>
              <TextField fullWidth label="E-posta *" type="email" value={createForm.email} size="small"
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                placeholder="mehmet@firma.com" />
              <TextField fullWidth label="Telefon *" value={createForm.phone} size="small"
                onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                placeholder="+90 555 123 4567" />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setCreateDialog(false)} color="inherit">Iptal</Button>
          <Button onClick={handleCreateLead} variant="contained"
            disabled={creating || !createForm.companyName || !createForm.contactName || !createForm.email || !createForm.phone}
            startIcon={<AddIcon />}
            sx={{ bgcolor: olentiaColors.primary.main, '&:hover': { bgcolor: olentiaColors.primary.dark } }}>
            {creating ? 'Olusturuluyor...' : 'Lead Olustur'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ═══ LEAD DETAIL / EDIT DIALOG ═══ */}
      <Dialog open={detailDialog} onClose={() => setDetailDialog(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { bgcolor: 'background.paper', backgroundImage: 'none' } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar sx={{ width: 36, height: 36, bgcolor: `${olentiaColors.primary.main}20`, color: olentiaColors.primary.main, fontWeight: 700 }}>
              {selectedLead?.companyName?.[0] || '?'}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={700}>{selectedLead?.companyName}</Typography>
              <Typography variant="caption" color="text.secondary">Lead Detayi</Typography>
            </Box>
          </Stack>
          <IconButton onClick={() => setDetailDialog(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          {selectedLead && (
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              {/* Lead Info Cards */}
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 6 }}>
                  <Card variant="outlined" sx={{ p: 1.5 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Yetkili</Typography>
                        <Typography variant="body2" fontWeight={600}>{selectedLead.contactName}</Typography>
                      </Box>
                    </Stack>
                  </Card>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Card variant="outlined" sx={{ p: 1.5 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">E-posta</Typography>
                        <Typography variant="body2" fontWeight={600} sx={{ fontSize: 12 }}>{selectedLead.email}</Typography>
                      </Box>
                    </Stack>
                  </Card>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Card variant="outlined" sx={{ p: 1.5 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Telefon</Typography>
                        <Typography variant="body2" fontWeight={600}>{selectedLead.phone || '-'}</Typography>
                      </Box>
                    </Stack>
                  </Card>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Card variant="outlined" sx={{ p: 1.5 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CafeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Aylik Tuketim</Typography>
                        <Typography variant="body2" fontWeight={600}>{selectedLead.monthlyConsumption || '-'}</Typography>
                      </Box>
                    </Stack>
                  </Card>
                </Grid>
              </Grid>

              {/* Current Status */}
              <Card variant="outlined" sx={{ p: 2, bgcolor: `${statusConfig[selectedLead.status]?.color === 'success' ? '#66BB6A' : statusConfig[selectedLead.status]?.color === 'error' ? '#EF5350' : olentiaColors.primary.main}06` }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" color="text.secondary">Mevcut Durum</Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        label={`${statusConfig[selectedLead.status]?.icon || ''} ${statusConfig[selectedLead.status]?.label || selectedLead.status}`}
                        color={statusConfig[selectedLead.status]?.color || 'default'}
                        sx={{ fontWeight: 700 }}
                      />
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary">Olusturulma</Typography>
                    <Typography variant="body2" fontWeight={600}>{formatDate(selectedLead.createdAt)}</Typography>
                  </Box>
                </Stack>
              </Card>

              {/* Update Status */}
              <Box>
                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 1, display: 'block' }}>
                  Durumu Guncelle
                </Typography>
                <FormControl fullWidth size="small">
                  <InputLabel>Yeni Durum</InputLabel>
                  <Select value={editStatus} label="Yeni Durum" onChange={(e) => setEditStatus(e.target.value)}>
                    {Object.entries(statusConfig).map(([k, v]) => (
                      <MenuItem key={k} value={k}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography>{v.icon}</Typography>
                          <Typography>{v.label}</Typography>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Notes */}
              <TextField
                fullWidth multiline rows={3} label="Notlar"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Gorusme notlari, takip bilgileri..."
                size="small"
              />

              {/* Quick Actions */}
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" size="small" startIcon={<QuoteIcon />}
                  onClick={() => { setDetailDialog(false); setQuoteDialog(true); }}
                  sx={{ flex: 1, borderColor: '#66BB6A', color: '#66BB6A' }}>
                  Teklif Olustur
                </Button>
                <Button variant="outlined" size="small" startIcon={<ContractIcon />}
                  sx={{ flex: 1, borderColor: '#42A5F5', color: '#42A5F5' }}
                  disabled>
                  Sozlesme Olustur
                </Button>
              </Stack>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDetailDialog(false)} color="inherit">Kapat</Button>
          <Button onClick={handleUpdateLead} variant="contained"
            disabled={updating || editStatus === selectedLead?.status}
            sx={{ bgcolor: olentiaColors.primary.main, '&:hover': { bgcolor: olentiaColors.primary.dark } }}>
            {updating ? 'Kaydediliyor...' : 'Guncelle'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ═══ CREATE QUOTE DIALOG ═══ */}
      <Dialog open={quoteDialog} onClose={() => setQuoteDialog(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { bgcolor: 'background.paper', backgroundImage: 'none' } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <QuoteIcon sx={{ color: '#66BB6A' }} />
            <Box>
              <Typography variant="h6" fontWeight={700}>Teklif Olustur</Typography>
              <Typography variant="caption" color="text.secondary">{selectedLead?.companyName}</Typography>
            </Box>
          </Stack>
          <IconButton onClick={() => setQuoteDialog(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 2.5, borderRadius: 2 }}>
            Firmaya ozel kahve paketi ve makine tahsisi iceren bir teklif hazirlyin.
          </Alert>

          <Stack spacing={2}>
            <TextField fullWidth label="Paket Adi *" value={quoteForm.packageName} size="small"
              onChange={(e) => setQuoteForm({ ...quoteForm, packageName: e.target.value })}
              placeholder="Ornek: Premium Ofis Paketi" />

            <Stack direction="row" spacing={2}>
              <TextField fullWidth label="Aylik Kahve (kg) *" type="number" value={quoteForm.monthlyKg} size="small"
                onChange={(e) => setQuoteForm({ ...quoteForm, monthlyKg: e.target.value })}
                placeholder="25" />
              <TextField fullWidth label="Makine Sayisi *" type="number" value={quoteForm.machineCount} size="small"
                onChange={(e) => setQuoteForm({ ...quoteForm, machineCount: e.target.value })}
                placeholder="2" />
            </Stack>

            <Stack direction="row" spacing={2}>
              <TextField fullWidth label="Sozlesme Suresi (ay) *" type="number" value={quoteForm.contractMonths} size="small"
                onChange={(e) => setQuoteForm({ ...quoteForm, contractMonths: e.target.value })} />
              <TextField fullWidth label="Aylik Fiyat (TL) *" type="number" value={quoteForm.monthlyPrice} size="small"
                onChange={(e) => setQuoteForm({ ...quoteForm, monthlyPrice: e.target.value })}
                placeholder="5000" />
            </Stack>

            <TextField fullWidth label="Kurulum Ucreti (TL)" type="number" value={quoteForm.setupFee} size="small"
              onChange={(e) => setQuoteForm({ ...quoteForm, setupFee: e.target.value })}
              placeholder="0" helperText="Opsiyonel tek seferlik kurulum ucreti" />

            {/* Summary */}
            {quoteForm.monthlyPrice && quoteForm.contractMonths && (
              <Card variant="outlined" sx={{ p: 2, bgcolor: 'rgba(102,187,106,0.05)', borderColor: 'rgba(102,187,106,0.3)' }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>Teklif Ozeti</Typography>
                <Stack spacing={0.5} sx={{ mt: 1 }}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Aylik Ucret</Typography>
                    <Typography variant="body2" fontWeight={700}>{formatCurrency(parseFloat(quoteForm.monthlyPrice) || 0)}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Sozlesme Toplami ({quoteForm.contractMonths} ay)</Typography>
                    <Typography variant="body2" fontWeight={700} sx={{ color: '#66BB6A' }}>
                      {formatCurrency((parseFloat(quoteForm.monthlyPrice) || 0) * (parseInt(quoteForm.contractMonths) || 0))}
                    </Typography>
                  </Stack>
                  {quoteForm.setupFee && parseFloat(quoteForm.setupFee) > 0 && (
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Kurulum</Typography>
                      <Typography variant="body2" fontWeight={600}>{formatCurrency(parseFloat(quoteForm.setupFee))}</Typography>
                    </Stack>
                  )}
                </Stack>
              </Card>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setQuoteDialog(false)} color="inherit">Iptal</Button>
          <Button onClick={handleCreateQuote} variant="contained"
            disabled={creatingQuote || !quoteForm.packageName || !quoteForm.monthlyKg || !quoteForm.machineCount || !quoteForm.monthlyPrice}
            startIcon={<QuoteIcon />}
            sx={{ bgcolor: '#66BB6A', '&:hover': { bgcolor: '#57A55A' } }}>
            {creatingQuote ? 'Olusturuluyor...' : 'Teklif Olustur'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* ═══ DELETE CONFIRM DIALOG ═══ */}
      <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { bgcolor: 'background.paper', backgroundImage: 'none' } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
          <WarningIcon sx={{ color: '#EF5350' }} />
          <Typography variant="h6" fontWeight={700}>Lead Sil</Typography>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            Bu islem geri alinamaz! Lead ve bagli tum teklifler/sozlesmeler silinecektir.
          </Alert>
          {deleteDialog && (
            <Card variant="outlined" sx={{ p: 2 }}>
              <Typography variant="body2" fontWeight={700}>{deleteDialog.companyName}</Typography>
              <Typography variant="caption" color="text.secondary">{deleteDialog.contactName} — {deleteDialog.email}</Typography>
            </Card>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDeleteDialog(null)} color="inherit">Iptal</Button>
          <Button onClick={handleDeleteLead} variant="contained" disabled={deleting}
            sx={{ bgcolor: '#EF5350', '&:hover': { bgcolor: '#D32F2F' } }}>
            {deleting ? 'Siliniyor...' : 'Evet, Sil'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
