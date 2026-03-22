'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Skeleton, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Divider, Stack, IconButton, Chip, Tooltip,
  Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  QuestionAnswer as FaqIcon, Close as CloseIcon,
} from '@mui/icons-material';
import { faqApi } from '@/lib/api';
import { olentiaColors } from '@/lib/theme';
import PageHeader from '@/components/common/PageHeader';
import ExportButton from '@/components/common/ExportButton';
import { useToast } from '@/contexts/ToastContext';

interface FAQ {
  id: string; question: string; answer: string; category?: string;
  sortOrder?: number; isActive?: boolean;
}

const CATEGORIES = ['Genel', 'Kargo', 'Odeme', 'Iade', 'Abonelik', 'Urun'];
const categoryColors: Record<string, string> = {
  Genel: '#9e9e9e', Kargo: '#42A5F5', Odeme: '#4CAF50', Iade: '#f44336',
  Abonelik: '#AB47BC', Urun: '#D4793F', kargo: '#42A5F5', odeme: '#4CAF50',
  iade: '#f44336', abonelik: '#AB47BC', urun: '#D4793F',
};

export default function FaqPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ question: '', answer: '', category: '' });
  const [confirmDelete, setConfirmDelete] = useState<FAQ | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  const { showSuccess, showError } = useToast();

  const fetchFaqs = useCallback(async () => {
    try {
      setLoading(true);
      const r = await faqApi.getFaqs(categoryFilter || undefined);
      const d = r.data || r;
      setFaqs(Array.isArray(d) ? d : d.data || []);
    } catch { setFaqs([]); }
    finally { setLoading(false); }
  }, [categoryFilter]);

  useEffect(() => { fetchFaqs(); }, [fetchFaqs]);

  const handleOpen = (faq?: FAQ) => {
    if (faq) {
      setEditingFaq(faq);
      setForm({ question: faq.question, answer: faq.answer, category: faq.category || '' });
    } else {
      setEditingFaq(null);
      setForm({ question: '', answer: '', category: '' });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingFaq) {
        await faqApi.updateFaq(editingFaq.id, form);
        showSuccess('Soru guncellendi');
      } else {
        await faqApi.createFaq(form);
        showSuccess('Soru eklendi');
      }
      setDialogOpen(false);
      fetchFaqs();
    } catch { showError('Islem basarisiz'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await faqApi.deleteFaq(confirmDelete.id);
      showSuccess('Soru silindi');
      setConfirmDelete(null);
      fetchFaqs();
    } catch { showError('Silinemedi'); }
  };

  return (
    <Box>
      <PageHeader
        title="Sikca Sorulan Sorular"
        subtitle={`${faqs.length} soru`}
        breadcrumbs={[{ label: 'SSS' }]}
        action={
          <Stack direction="row" spacing={1} alignItems="center">
            <ExportButton data={faqs}
              columns={[{ key: 'question', label: 'Soru' }, { key: 'answer', label: 'Cevap' }, { key: 'category', label: 'Kategori' }]}
              filename="sss" />
            <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => handleOpen()}
              sx={{ bgcolor: olentiaColors.primary.main, '&:hover': { bgcolor: olentiaColors.primary.dark } }}>
              Yeni Soru
            </Button>
          </Stack>
        }
      />

      <Card sx={{ mb: 2, p: 2 }}>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Kategori</InputLabel>
          <Select value={categoryFilter} label="Kategori" onChange={(e) => setCategoryFilter(e.target.value)}>
            <MenuItem value="">Tumu</MenuItem>
            {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>
        </FormControl>
      </Card>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Soru</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Cevap</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Kategori</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Islem</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>{Array.from({ length: 4 }).map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}</TableRow>
              )) : faqs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                    <FaqIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                    <Typography color="text.secondary">SSS bulunamadi</Typography>
                  </TableCell>
                </TableRow>
              ) : faqs.map((f) => (
                <TableRow key={f.id} hover>
                  <TableCell sx={{ maxWidth: 250 }}>
                    <Typography variant="body2" fontWeight={600}>{f.question}</Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 400 }}>
                    <Typography variant="body2" color="text.secondary" noWrap title={f.answer}>{f.answer}</Typography>
                  </TableCell>
                  <TableCell>
                    {f.category ? (
                      <Chip label={f.category} size="small"
                        sx={{ height: 22, fontSize: 11, bgcolor: `${categoryColors[f.category] || '#9e9e9e'}15`, color: categoryColors[f.category] || '#9e9e9e' }} />
                    ) : '-'}
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.25} justifyContent="flex-end">
                      <IconButton size="small" onClick={() => handleOpen(f)}><EditIcon sx={{ fontSize: 16 }} /></IconButton>
                      <IconButton size="small" color="error" onClick={() => setConfirmDelete(f)}><DeleteIcon sx={{ fontSize: 16 }} /></IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight={700}>{editingFaq ? 'Soruyu Duzenle' : 'Yeni Soru'}</Typography>
          <IconButton onClick={() => setDialogOpen(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField fullWidth label="Soru" value={form.question} size="small"
              onChange={(e) => setForm({ ...form, question: e.target.value })} />
            <TextField fullWidth multiline rows={3} label="Cevap" value={form.answer} size="small"
              onChange={(e) => setForm({ ...form, answer: e.target.value })} />
            <FormControl fullWidth size="small">
              <InputLabel>Kategori</InputLabel>
              <Select value={form.category} label="Kategori" onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Iptal</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !form.question || !form.answer}
            sx={{ bgcolor: olentiaColors.primary.main }}>
            {saving ? 'Kaydediliyor...' : editingFaq ? 'Guncelle' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <DeleteIcon sx={{ color: '#f44336' }} />
            <Typography variant="h6" fontWeight={700}>Soruyu Sil</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            <strong>{confirmDelete?.question}</strong> sorusunu silmek istediginizden emin misiniz?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmDelete(null)}>Vazgec</Button>
          <Button variant="contained" color="error" onClick={handleDelete} startIcon={<DeleteIcon />}>Sil</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
