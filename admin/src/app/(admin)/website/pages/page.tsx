'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Chip, IconButton, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, Divider, Skeleton, Grid, Tooltip,
  Switch, FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Description as PageIcon, Close as CloseIcon,
} from '@mui/icons-material';
import { websiteApi } from '@/lib/api';
import PageHeader from '@/components/common/PageHeader';

interface SitePage {
  id: string;
  title: string;
  slug: string;
  sections: any[];
  isPublished: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoImage?: string;
  createdAt: string;
  updatedAt: string;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const emptyForm = {
  title: '', slug: '', sections: '[]', isPublished: false,
  seoTitle: '', seoDescription: '', seoImage: '',
};

export default function PagesPage() {
  const [pages, setPages] = useState<SitePage[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SitePage | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchPages = useCallback(async () => {
    try {
      setLoading(true);
      const res = await websiteApi.getPages();
      setPages(Array.isArray(res) ? res : res.data || []);
    } catch { setPages([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPages(); }, [fetchPages]);

  const handleOpen = (page?: SitePage) => {
    if (page) {
      setEditing(page);
      setForm({
        title: page.title, slug: page.slug,
        sections: JSON.stringify(page.sections, null, 2),
        isPublished: page.isPublished,
        seoTitle: page.seoTitle || '', seoDescription: page.seoDescription || '', seoImage: page.seoImage || '',
      });
    } else {
      setEditing(null);
      setForm(emptyForm);
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let parsedSections;
      try { parsedSections = JSON.parse(form.sections); } catch { parsedSections = []; }
      const payload = { ...form, sections: parsedSections };
      if (editing) { await websiteApi.updatePage(editing.id, payload); }
      else { await websiteApi.createPage(payload); }
      setDialogOpen(false);
      fetchPages();
    } catch { /* toast */ }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu sayfa silinecek. Emin misiniz?')) return;
    await websiteApi.deletePage(id);
    fetchPages();
  };

  return (
    <Box>
      <PageHeader
        title="Sayfa Yonetimi"
        subtitle={`${pages.length} sayfa`}
        icon={<PageIcon />}
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()} size="small">
            Yeni Sayfa
          </Button>
        }
      />

      <Card sx={{ mt: 3 }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Sayfa Adi</TableCell>
                <TableCell>Slug</TableCell>
                <TableCell>Bolum Sayisi</TableCell>
                <TableCell>SEO</TableCell>
                <TableCell align="center">Durum</TableCell>
                <TableCell>Son Guncelleme</TableCell>
                <TableCell align="right">Islemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>{Array.from({ length: 7 }).map((_, j) => (<TableCell key={j}><Skeleton /></TableCell>))}</TableRow>
                ))
              ) : pages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">Henuz sayfa eklenmemis</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                pages.map((page) => (
                  <TableRow key={page.id} hover>
                    <TableCell><Typography fontWeight={600} fontSize={13}>{page.title}</Typography></TableCell>
                    <TableCell><Typography fontSize={12} color="text.secondary">/{page.slug}</Typography></TableCell>
                    <TableCell>
                      <Chip label={`${Array.isArray(page.sections) ? page.sections.length : 0} bolum`} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      {page.seoTitle ? (
                        <Chip label="SEO OK" size="small" color="success" variant="outlined" />
                      ) : (
                        <Chip label="SEO Eksik" size="small" color="warning" variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={page.isPublished ? 'Yayinda' : 'Taslak'} color={page.isPublished ? 'success' : 'default'} size="small" />
                    </TableCell>
                    <TableCell><Typography fontSize={12} color="text.secondary">{formatDate(page.updatedAt)}</Typography></TableCell>
                    <TableCell align="right">
                      <Tooltip title="Duzenle"><IconButton size="small" onClick={() => handleOpen(page)}><EditIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>
                      <Tooltip title="Sil"><IconButton size="small" color="error" onClick={() => handleDelete(page.id)}><DeleteIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {editing ? 'Sayfa Duzenle' : 'Yeni Sayfa'}
          <IconButton size="small" onClick={() => setDialogOpen(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Sayfa Adi" size="small" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Slug" size="small" value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                helperText="Ornek: hakkimizda, kvkk, iletisim" />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Bolumler (JSON)" size="small" multiline rows={8} value={form.sections}
                onChange={(e) => setForm({ ...form, sections: e.target.value })}
                helperText='Ornek: [{"type":"text","title":"Baslik","content":"Icerik..."}]' />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 1 }} />
              <Typography fontWeight={600} fontSize={14} sx={{ mb: 1 }}>SEO Ayarlari</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="SEO Title" size="small" value={form.seoTitle}
                onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="SEO Image URL" size="small" value={form.seoImage}
                onChange={(e) => setForm({ ...form, seoImage: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="SEO Description" size="small" multiline rows={2} value={form.seoDescription}
                onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={<Switch checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />}
                label="Yayinla"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Iptal</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !form.title || !form.slug}>
            {saving ? 'Kaydediliyor...' : editing ? 'Guncelle' : 'Olustur'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
