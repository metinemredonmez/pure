'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Chip, IconButton, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, Divider, Skeleton, Stack, Switch, FormControlLabel, Avatar,
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Category as CategoryIcon, Close as CloseIcon, Inventory as ProductIcon,
} from '@mui/icons-material';
import { categoriesApi } from '@/lib/api';
import { olentiaColors } from '@/lib/theme';
import PageHeader from '@/components/common/PageHeader';
import ExportButton from '@/components/common/ExportButton';
import { useToast } from '@/contexts/ToastContext';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  parentId?: string;
  children?: Category[];
  _count?: { products: number };
}

const CATEGORY_COLORS = ['#D4793F', '#4CAF50', '#42A5F5', '#AB47BC', '#FF6B6B', '#FFB74D', '#26A69A', '#EC407A', '#5C6BC0'];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', description: '', isActive: true });
  const [confirmDelete, setConfirmDelete] = useState<Category | null>(null);
  const { showSuccess, showError } = useToast();

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await categoriesApi.getCategories();
      const result = response.data || response;
      setCategories(Array.isArray(result) ? result : result.data || []);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9ğüşıöç]+/g, '-').replace(/(^-|-$)/g, '');

  const handleOpenDialog = (cat?: Category) => {
    if (cat) {
      setEditingCategory(cat);
      setForm({ name: cat.name, slug: cat.slug, description: cat.description || '', isActive: cat.isActive });
    } else {
      setEditingCategory(null);
      setForm({ name: '', slug: '', description: '', isActive: true });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingCategory) {
        await categoriesApi.updateCategory(editingCategory.id, form);
        showSuccess('Kategori guncellendi');
      } else {
        await categoriesApi.createCategory({ ...form, slug: form.slug || generateSlug(form.name) });
        showSuccess('Kategori olusturuldu');
      }
      setDialogOpen(false);
      fetchCategories();
    } catch {
      showError('Islem basarisiz');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await categoriesApi.deleteCategory(confirmDelete.id);
      showSuccess('Kategori silindi');
      setConfirmDelete(null);
      fetchCategories();
    } catch {
      showError('Kategori silinemedi');
    }
  };

  const totalProducts = categories.reduce((s, c) => s + (c._count?.products || 0), 0);

  return (
    <Box>
      <PageHeader
        title="Kategoriler"
        subtitle={`${categories.length} kategori, ${totalProducts} urun`}
        breadcrumbs={[{ label: 'Kategoriler' }]}
        action={
          <Stack direction="row" spacing={1} alignItems="center">
            <ExportButton
              data={categories}
              columns={[
                { key: 'name', label: 'Kategori' },
                { key: 'slug', label: 'Slug' },
                { key: '_count.products', label: 'Urun Sayisi' },
              ]}
              filename="kategoriler"
            />
            <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}
              sx={{ bgcolor: olentiaColors.primary.main, '&:hover': { bgcolor: olentiaColors.primary.dark } }}>
              Yeni Kategori
            </Button>
          </Stack>
        }
      />

      {loading ? (
        <Grid container spacing={2}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}><Skeleton height={140} variant="rounded" /></Grid>
          ))}
        </Grid>
      ) : categories.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <CategoryIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography color="text.secondary" sx={{ mb: 2 }}>Kategori bulunamadi</Typography>
          <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}
            sx={{ bgcolor: olentiaColors.primary.main }}>Ilk Kategoriyi Olustur</Button>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {categories.map((cat, i) => (
            <Grid key={cat.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Card sx={{
                height: '100%', transition: 'all 0.2s',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 4px 20px ${CATEGORY_COLORS[i % CATEGORY_COLORS.length]}15` },
                borderTop: `3px solid ${CATEGORY_COLORS[i % CATEGORY_COLORS.length]}`,
                opacity: cat.isActive ? 1 : 0.6,
              }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                    <Avatar sx={{ width: 40, height: 40, bgcolor: `${CATEGORY_COLORS[i % CATEGORY_COLORS.length]}15`, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}>
                      <CategoryIcon sx={{ fontSize: 22 }} />
                    </Avatar>
                    <Stack direction="row" spacing={0.25}>
                      <IconButton size="small" onClick={() => handleOpenDialog(cat)}>
                        <EditIcon sx={{ fontSize: 15 }} />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => setConfirmDelete(cat)}>
                        <DeleteIcon sx={{ fontSize: 15 }} />
                      </IconButton>
                    </Stack>
                  </Stack>

                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>{cat.name}</Typography>
                  {cat.description && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, lineHeight: 1.3 }}>{cat.description}</Typography>
                  )}
                  <Typography variant="caption" color="text.disabled" sx={{ fontFamily: 'monospace', display: 'block', mb: 1.5 }}>/{cat.slug}</Typography>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      icon={<ProductIcon sx={{ fontSize: '14px !important' }} />}
                      label={`${cat._count?.products || 0} urun`}
                      size="small"
                      sx={{ height: 24, fontSize: 11, bgcolor: `${CATEGORY_COLORS[i % CATEGORY_COLORS.length]}12`, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length], '& .MuiChip-icon': { color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] } }}
                    />
                    <Chip
                      label={cat.isActive ? 'Aktif' : 'Pasif'}
                      size="small"
                      sx={{ height: 24, fontSize: 11, bgcolor: cat.isActive ? 'rgba(76,175,80,0.12)' : 'rgba(158,158,158,0.12)', color: cat.isActive ? '#4caf50' : '#9e9e9e' }}
                    />
                  </Stack>

                  {/* Alt kategoriler */}
                  {cat.children && cat.children.length > 0 && (
                    <Box sx={{ mt: 1.5, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Alt Kategoriler</Typography>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                        {cat.children.map((child) => (
                          <Chip key={child.id} label={`${child.name} (${child._count?.products || 0})`} size="small"
                            sx={{ height: 20, fontSize: 10, bgcolor: 'action.hover' }} />
                        ))}
                      </Stack>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={700}>{editingCategory ? 'Kategori Duzenle' : 'Yeni Kategori'}</Typography>
          <IconButton onClick={() => setDialogOpen(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField fullWidth label="Kategori Adi" value={form.name} size="small"
              onChange={(e) => setForm({ ...form, name: e.target.value, slug: editingCategory ? form.slug : generateSlug(e.target.value) })} />
            <TextField fullWidth label="Slug" value={form.slug} size="small"
              onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            <TextField fullWidth multiline rows={2} label="Aciklama" value={form.description} size="small"
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <FormControlLabel
              control={<Switch checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} size="small" />}
              label="Aktif"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Iptal</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving || !form.name}
            sx={{ bgcolor: olentiaColors.primary.main }}>
            {saving ? 'Kaydediliyor...' : editingCategory ? 'Guncelle' : 'Olustur'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <DeleteIcon sx={{ color: '#f44336' }} />
            <Typography variant="h6" fontWeight={700}>Kategoriyi Sil</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            <strong>{confirmDelete?.name}</strong> kategorisini silmek istediginizden emin misiniz?
            {(confirmDelete?._count?.products || 0) > 0 && (
              <> Bu kategoride <strong>{confirmDelete?._count?.products}</strong> urun bulunuyor.</>
            )}
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
