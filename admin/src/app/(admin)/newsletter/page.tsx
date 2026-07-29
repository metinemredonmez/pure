'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, Chip, IconButton, Stack, Tooltip,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert,
} from '@mui/material';
import {
  Delete as DeleteIcon, Add as AddIcon, Download as DownloadIcon,
  Campaign as BroadcastIcon, MarkEmailRead as NewsletterIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { websiteApi } from '@/lib/api';
import { olentiaColors } from '@/lib/theme';
import PageHeader from '@/components/common/PageHeader';
import { useToast } from '@/contexts/ToastContext';

interface Subscriber {
  id: string;
  email: string;
  name?: string | null;
  status: string;
  source?: string | null;
  createdAt: string;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function NewsletterPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [rows, setRows] = useState<Subscriber[]>([]);
  const [total, setTotal] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [addOpen, setAddOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    try {
      const res = await websiteApi.getNewsletterSubscribers({
        page: page + 1,
        limit: rowsPerPage,
        search: search || undefined,
      });
      // API cevabı { success, data: { data:[...], total, activeCount }, timestamp } zarfında gelir.
      const result = (res?.data ?? res) as { data?: Subscriber[]; total?: number; activeCount?: number };
      setRows(Array.isArray(result?.data) ? result.data : []);
      setTotal(result?.total || 0);
      setActiveCount(result?.activeCount ?? 0);
    } catch {
      showToast('Aboneler yüklenemedi', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, showToast]);

  useEffect(() => {
    const t = setTimeout(fetchRows, 300);
    return () => clearTimeout(t);
  }, [fetchRows]);

  const handleAdd = async () => {
    const email = newEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      showToast('Geçerli bir e-posta girin', 'error');
      return;
    }
    setSaving(true);
    try {
      await websiteApi.addNewsletterSubscriber({ email, name: newName.trim() || undefined });
      showToast('Abone eklendi', 'success');
      setAddOpen(false);
      setNewEmail('');
      setNewName('');
      fetchRows();
    } catch {
      showToast('Abone eklenemedi', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await websiteApi.deleteNewsletterSubscriber(deleteId);
      showToast('Abone silindi', 'success');
      setDeleteId(null);
      fetchRows();
    } catch {
      showToast('Silme başarısız', 'error');
    }
  };

  const handleExport = async () => {
    try {
      const raw = await websiteApi.exportNewsletterSubscribers();
      const csv = typeof raw === 'string' ? raw : ((raw as { data?: string })?.data ?? '');
      const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bulten-aboneleri-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      showToast('Dışa aktarma başarısız', 'error');
    }
  };

  return (
    <Box>
      <PageHeader
        title="Bülten Aboneleri"
        subtitle={`Toplam ${total} kayıt · ${activeCount} aktif abone`}
      />

      <Alert severity="info" icon={<NewsletterIcon />} sx={{ mb: 2 }}>
        Abonelere toplu e-posta göndermek için{' '}
        <Button size="small" startIcon={<BroadcastIcon />} onClick={() => router.push('/broadcasts')} sx={{ ml: 0.5 }}>
          Toplu Mesaj
        </Button>{' '}
        sayfasında hedef kitleyi <b>Bülten Aboneleri</b> seçin.
      </Alert>

      <Card>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }} alignItems="center">
            <TextField
              size="small"
              placeholder="E-posta ara…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              sx={{ flex: 1, minWidth: 220 }}
            />
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExport}>
              CSV Dışa Aktar
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddOpen(true)}>
              Abone Ekle
            </Button>
          </Stack>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>E-posta</TableCell>
                  <TableCell>Ad</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell>Kaynak</TableCell>
                  <TableCell>Tarih</TableCell>
                  <TableCell align="right">İşlem</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!loading && rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      Henüz abone yok.
                    </TableCell>
                  </TableRow>
                )}
                {rows.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell>{r.email}</TableCell>
                    <TableCell>{r.name || '—'}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={r.status === 'active' ? 'Aktif' : 'Çıkmış'}
                        color={r.status === 'active' ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">{r.source || '—'}</Typography>
                    </TableCell>
                    <TableCell>{formatDate(r.createdAt)}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Sil">
                        <IconButton size="small" color="error" onClick={() => setDeleteId(r.id)}>
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
            component="div"
            count={total}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[25, 50, 100]}
            labelRowsPerPage="Sayfa başına:"
          />
        </CardContent>
      </Card>

      {/* Add dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Abone Ekle</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth size="small" type="email" label="E-posta"
              value={newEmail} onChange={(e) => setNewEmail(e.target.value)} autoFocus
            />
            <TextField
              fullWidth size="small" label="Ad (opsiyonel)"
              value={newName} onChange={(e) => setNewName(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>İptal</Button>
          <Button variant="contained" onClick={handleAdd} disabled={saving}>Ekle</Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Aboneyi Sil</DialogTitle>
        <DialogContent>
          <Typography variant="body2">Bu aboneyi listeden kalıcı olarak silmek istediğinize emin misiniz?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>İptal</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Sil</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
