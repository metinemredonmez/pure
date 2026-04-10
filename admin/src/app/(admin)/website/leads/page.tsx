'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Chip, IconButton, Dialog, DialogTitle,
  DialogContent, Button, Divider, Skeleton, Tooltip, TextField,
  TablePagination, Grid,
} from '@mui/material';
import {
  Visibility as ViewIcon, Download as ExportIcon,
  ContactMail as LeadIcon, Close as CloseIcon,
} from '@mui/icons-material';
import { b2bApi } from '@/lib/api';
import PageHeader from '@/components/common/PageHeader';
import ExportButton from '@/components/common/ExportButton';

interface Lead {
  id: string;
  companyName?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  city?: string;
  dailyPersonCount?: number;
  message?: string;
  source?: string;
  status: string;
  createdAt: string;
}

const statusConfig: Record<string, { label: string; color: 'default' | 'info' | 'success' | 'warning' | 'error' }> = {
  NEW: { label: 'Yeni', color: 'info' },
  CONTACTED: { label: 'Iletisime Gecildi', color: 'warning' },
  QUALIFIED: { label: 'Nitelikli', color: 'success' },
  PROPOSAL_SENT: { label: 'Teklif Gonderildi', color: 'success' },
  WON: { label: 'Kazanildi', color: 'success' },
  LOST: { label: 'Kaybedildi', color: 'error' },
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const res = await b2bApi.getLeads({ page: page + 1, limit: rowsPerPage });
      const data = res?.data || res;
      if (Array.isArray(data)) {
        setLeads(data);
        setTotal(data.length);
      } else {
        setLeads(data?.data || []);
        setTotal(data?.meta?.total || 0);
      }
    } catch { setLeads([]); }
    finally { setLoading(false); }
  }, [page, rowsPerPage]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const filteredLeads = search
    ? leads.filter(l =>
        (l.companyName || '').toLowerCase().includes(search.toLowerCase()) ||
        (l.contactName || '').toLowerCase().includes(search.toLowerCase()) ||
        (l.email || '').toLowerCase().includes(search.toLowerCase()) ||
        (l.city || '').toLowerCase().includes(search.toLowerCase())
      )
    : leads;

  const handleViewDetail = (lead: Lead) => {
    setSelectedLead(lead);
    setDetailOpen(true);
  };

  const exportData = filteredLeads.map(l => ({
    'Sirket': l.companyName || '',
    'Iletisim': l.contactName || '',
    'E-posta': l.email || '',
    'Telefon': l.phone || '',
    'Sehir': l.city || '',
    'Kisi Sayisi': l.dailyPersonCount || '',
    'Durum': statusConfig[l.status]?.label || l.status,
    'Tarih': formatDate(l.createdAt),
  }));

  return (
    <Box>
      <PageHeader
        title="Web Sitesi Basvurulari"
        subtitle={`${total} basvuru`}
        icon={<LeadIcon />}
        action={
          <ExportButton data={exportData} filename="basvurular" />
        }
      />

      <Card sx={{ mt: 3 }}>
        <Box sx={{ p: 2 }}>
          <TextField
            size="small" placeholder="Ara... (sirket, isim, e-posta, sehir)"
            value={search} onChange={(e) => setSearch(e.target.value)}
            sx={{ width: 350 }}
          />
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Sirket</TableCell>
                <TableCell>Iletisim</TableCell>
                <TableCell>E-posta</TableCell>
                <TableCell>Telefon</TableCell>
                <TableCell>Sehir</TableCell>
                <TableCell align="center">Durum</TableCell>
                <TableCell>Tarih</TableCell>
                <TableCell align="right">Islemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>{Array.from({ length: 8 }).map((_, j) => (<TableCell key={j}><Skeleton /></TableCell>))}</TableRow>
                ))
              ) : filteredLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">Henuz basvuru yok</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeads.map((lead) => (
                  <TableRow key={lead.id} hover>
                    <TableCell><Typography fontWeight={600} fontSize={13}>{lead.companyName || '-'}</Typography></TableCell>
                    <TableCell><Typography fontSize={13}>{lead.contactName || '-'}</Typography></TableCell>
                    <TableCell><Typography fontSize={12} color="text.secondary">{lead.email || '-'}</Typography></TableCell>
                    <TableCell><Typography fontSize={12}>{lead.phone || '-'}</Typography></TableCell>
                    <TableCell><Typography fontSize={12}>{lead.city || '-'}</Typography></TableCell>
                    <TableCell align="center">
                      <Chip
                        label={statusConfig[lead.status]?.label || lead.status}
                        color={statusConfig[lead.status]?.color || 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell><Typography fontSize={12} color="text.secondary">{formatDate(lead.createdAt)}</Typography></TableCell>
                    <TableCell align="right">
                      <Tooltip title="Detay">
                        <IconButton size="small" onClick={() => handleViewDetail(lead)}>
                          <ViewIcon sx={{ fontSize: 18 }} />
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
          Basvuru Detayi
          <IconButton size="small" onClick={() => setDetailOpen(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          {selectedLead && (
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Typography fontSize={12} color="text.secondary">Sirket</Typography>
                <Typography fontSize={14} fontWeight={600}>{selectedLead.companyName || '-'}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography fontSize={12} color="text.secondary">Iletisim Kisisi</Typography>
                <Typography fontSize={14}>{selectedLead.contactName || '-'}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography fontSize={12} color="text.secondary">E-posta</Typography>
                <Typography fontSize={14}>{selectedLead.email || '-'}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography fontSize={12} color="text.secondary">Telefon</Typography>
                <Typography fontSize={14}>{selectedLead.phone || '-'}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography fontSize={12} color="text.secondary">Sehir</Typography>
                <Typography fontSize={14}>{selectedLead.city || '-'}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography fontSize={12} color="text.secondary">Gunluk Kisi Sayisi</Typography>
                <Typography fontSize={14}>{selectedLead.dailyPersonCount || '-'}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography fontSize={12} color="text.secondary">Durum</Typography>
                <Chip
                  label={statusConfig[selectedLead.status]?.label || selectedLead.status}
                  color={statusConfig[selectedLead.status]?.color || 'default'}
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography fontSize={12} color="text.secondary">Kaynak</Typography>
                <Typography fontSize={14}>{selectedLead.source || 'Web Sitesi'}</Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography fontSize={12} color="text.secondary">Basvuru Tarihi</Typography>
                <Typography fontSize={14}>{formatDate(selectedLead.createdAt)}</Typography>
              </Grid>
              {selectedLead.message && (
                <Grid size={{ xs: 12 }}>
                  <Typography fontSize={12} color="text.secondary">Mesaj</Typography>
                  <Typography fontSize={14} sx={{ mt: 0.5, p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
                    {selectedLead.message}
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
