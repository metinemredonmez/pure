'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Chip, Skeleton, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, Divider, Stack, IconButton,
  Avatar, Switch, FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Collections as CollIcon, Close as CloseIcon,
} from '@mui/icons-material';
import { collectionsApi } from '@/lib/api';
import { olentiaColors } from '@/lib/theme';
import PageHeader from '@/components/common/PageHeader';
import ExportButton from '@/components/common/ExportButton';
import { useToast } from '@/contexts/ToastContext';

interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
  _count?: { products: number };
}

const COLL_COLORS = ['#42A5F5', '#AB47BC', '#4CAF50', '#FF6B6B', '#FFB74D', '#26A69A', '#EC407A', '#D4793F'];

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingColl, setEditingColl] = useState<Collection | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', description: '', isActive: true });
  const [confirmDelete, setConfirmDelete] = useState<Collection | null>(null);
  const { showSuccess, showError } = useToast();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const r = await collectionsApi.getCollections();
      const d = r.data || r;
      setCollections(Array.isArray(d) ? d : d.data || []);
    } catch { setCollections([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const generateSlug = (n: string) => n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleOpenDialog = (coll?: Collection) => {
    if (coll) {
      setEditingColl(coll);
      setForm({ name: coll.name, slug: coll.slug, description: coll.description || '', isActive: coll.isActive !== false });
    } else {
      setEditingColl(null);
      setForm({ name: '', slug: '', description: '', isActive: true });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingColl) {
        await collectionsApi.updateCollection(editingColl.id, form);
        showSuccess('Koleksiyon guncellendi');
      } else {
        await collectionsApi.createCollection({ ...form, slug: form.slug || generateSlug(form.name) });
        showSuccess('Koleksiyon olusturuldu');
      }
      setDialogOpen(false);
      fetchData();
    } catch { showError('Islem basarisiz'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await collectionsApi.deleteCollection(confirmDelete.id);
      showSuccess('Koleksiyon silindi');
      setConfirmDelete(null);
      fetchData();
    } catch { showError('Silinemedi'); }
  };

  return (
    <Box>
      <PageHeader
        title="Koleksiyonlar"
        subtitle={`${collections.length} koleksiyon`}
        breadcrumbs={[{ label: 'Koleksiyonlar' }]}
        action={
          <Stack direction="row" spacing={1} alignItems="center">
            <ExportButton data={collections}
              columns={[{ key: 'name', label: 'Koleksiyon' }, { key: 'slug', label: 'Slug' }, { key: 'description', label: 'Aciklama' }]}
              filename="koleksiyonlar" />
            <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}
              sx={{ bgcolor: olentiaColors.primary.main, '&:hover': { bgcolor: olentiaColors.primary.dark } }}>
              Yeni Koleksiyon
            </Button>
          </Stack>
        }
      />

      {loading ? (
        <Grid container spacing={2}>
          {Array.from({ length: 4 }).map((_, i) => <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}><Skeleton height={120} variant="rounded" /></Grid>)}
        </Grid>
      ) : collections.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <CollIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography color="text.secondary" sx={{ mb: 2 }}>Koleksiyon bulunamadi</Typography>
          <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}
            sx={{ bgcolor: olentiaColors.primary.main }}>Ilk Koleksiyonu Olustur</Button>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {collections.map((c, i) => (
            <Grid key={c.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Card sx={{
                height: '100%', transition: 'all 0.2s',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 4px 20px ${COLL_COLORS[i % COLL_COLORS.length]}15` },
                borderLeft: `3px solid ${COLL_COLORS[i % COLL_COLORS.length]}`,
              }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: `${COLL_COLORS[i % COLL_COLORS.length]}15`, color: COLL_COLORS[i % COLL_COLORS.length] }}>
                      <CollIcon sx={{ fontSize: 20 }} />
                    </Avatar>
                    <Stack direction="row" spacing={0.25}>
                      <IconButton size="small" onClick={() => handleOpenDialog(c)}><EditIcon sx={{ fontSize: 15 }} /></IconButton>
                      <IconButton size="small" color="error" onClick={() => setConfirmDelete(c)}><DeleteIcon sx={{ fontSize: 15 }} /></IconButton>
                    </Stack>
                  </Stack>
                  <Typography variant="subtitle2" fontWeight={700}>{c.name}</Typography>
                  {c.description && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, lineHeight: 1.3 }}>{c.description}</Typography>}
                  <Typography variant="caption" color="text.disabled" sx={{ fontFamily: 'monospace', display: 'block', mb: 1 }}>/{c.slug}</Typography>
                  <Stack direction="row" spacing={0.5}>
                    <Chip label={c.isActive !== false ? 'Aktif' : 'Pasif'} size="small"
                      sx={{ height: 22, fontSize: 10, bgcolor: c.isActive !== false ? 'rgba(76,175,80,0.12)' : 'rgba(158,158,158,0.12)', color: c.isActive !== false ? '#4caf50' : '#9e9e9e' }} />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create/Edit */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight={700}>{editingColl ? 'Koleksiyon Duzenle' : 'Yeni Koleksiyon'}</Typography>
          <IconButton onClick={() => setDialogOpen(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField fullWidth label="Koleksiyon Adi" value={form.name} size="small"
              onChange={(e) => setForm({ ...form, name: e.target.value, slug: editingColl ? form.slug : generateSlug(e.target.value) })} />
            <TextField fullWidth label="Slug" value={form.slug} size="small" onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            <TextField fullWidth multiline rows={2} label="Aciklama" value={form.description} size="small" onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <FormControlLabel control={<Switch checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} size="small" />} label="Aktif" />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Iptal</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving || !form.name} sx={{ bgcolor: olentiaColors.primary.main }}>
            {saving ? 'Kaydediliyor...' : editingColl ? 'Guncelle' : 'Olustur'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete */}
      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <DeleteIcon sx={{ color: '#f44336' }} />
            <Typography variant="h6" fontWeight={700}>Koleksiyonu Sil</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            <strong>{confirmDelete?.name}</strong> koleksiyonunu silmek istediginizden emin misiniz?
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
