'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, Chip, IconButton, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, Divider, Skeleton, Stack, Grid, Tooltip,
  FormControl, InputLabel, Select, MenuItem, Tabs, Tab,
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Article as BlogIcon, Close as CloseIcon,
} from '@mui/icons-material';
import { blogApi } from '@/lib/api';
import { olentiaColors } from '@/lib/theme';
import PageHeader from '@/components/common/PageHeader';
import ExportButton from '@/components/common/ExportButton';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  status?: string;
  isPublished?: boolean;
  author?: { firstName?: string; lastName?: string; email: string };
  tags?: string[];
  publishedAt?: string;
  createdAt: string;
}

const statusConfig: Record<string, { label: string; color: 'default' | 'success' | 'warning' }> = {
  PUBLISHED: { label: 'Yayında', color: 'success' },
  DRAFT: { label: 'Taslak', color: 'warning' },
  ARCHIVED: { label: 'Arşiv', color: 'default' },
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '', slug: '', excerpt: '', content: '', status: 'DRAFT', tags: '',
    coverImage: '', metaTitle: '', metaDescription: '',
  });

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await blogApi.getPosts({ page: page + 1, limit: rowsPerPage });
      const result = response.data || response;
      setPosts(result.data || result.items || result || []);
      setTotal(result.meta?.total || result.total || 0);
    } catch (error) {
      console.error('Blog yazıları yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const generateSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9ğüşıöç]+/g, '-').replace(/(^-|-$)/g, '');

  const handleOpenDialog = (post?: BlogPost) => {
    if (post) {
      setEditingPost(post);
      setForm({
        title: post.title, slug: post.slug, excerpt: post.excerpt || '',
        content: post.content || '', status: post.status || 'draft',
        tags: post.tags?.join(', ') || '', coverImage: (post as any).coverImage || '', metaTitle: '', metaDescription: '',
      });
    } else {
      setEditingPost(null);
      setForm({ title: '', slug: '', excerpt: '', content: '', status: 'DRAFT', tags: '', coverImage: '', metaTitle: '', metaDescription: '' });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        title: form.title, slug: form.slug || generateSlug(form.title),
        excerpt: form.excerpt || undefined, content: form.content,
        isPublished: form.status === 'PUBLISHED',
        coverImage: form.coverImage || undefined,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()) : undefined,
        seoTitle: form.metaTitle || undefined, seoDescription: form.metaDescription || undefined,
      };
      if (editingPost) {
        await blogApi.updatePost(editingPost.id, payload);
      } else {
        await blogApi.createPost(payload);
      }
      setDialogOpen(false);
      fetchPosts();
    } catch (error) {
      console.error('Blog yazısı kaydedilemedi:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await blogApi.deletePost(id);
      setDeleteConfirm(null);
      fetchPosts();
    } catch (error) {
      console.error('Blog yazısı silinemedi:', error);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Blog Yazıları"
        subtitle="Blog içeriklerini yönet"
        breadcrumbs={[{ label: 'Blog Yazıları' }]}
        action={
          <Stack direction="row" spacing={1} alignItems="center">
            <ExportButton
              data={posts}
              columns={[
                { key: 'title', label: 'Başlık' },
                { key: 'slug', label: 'Slug' },
                { key: 'author.email', label: 'Yazar' },
                { key: 'status', label: 'Durum' },
                { key: 'createdAt', label: 'Tarih' },
              ]}
              filename="blog-yazilari"
            />
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}
              sx={{ bgcolor: olentiaColors.primary.main, '&:hover': { bgcolor: olentiaColors.primary.dark } }}>
              Yeni Yazı
            </Button>
          </Stack>
        }
      />

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Başlık</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Yazar</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Durum</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Etiketler</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tarih</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">İşlem</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>{Array.from({ length: 6 }).map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}</TableRow>
                  ))
                : posts.length === 0
                ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <BlogIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                      <Typography color="text.secondary">Blog yazısı bulunamadı</Typography>
                    </TableCell>
                  </TableRow>
                )
                : posts.map((post) => (
                    <TableRow key={post.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{post.title}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: 11 }}>
                          /{post.slug}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {post.author?.firstName ? `${post.author.firstName} ${post.author.lastName}` : 'Pure Olentia'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const st = post.isPublished ? 'PUBLISHED' : 'DRAFT';
                          return <Chip label={statusConfig[st]?.label || st} color={statusConfig[st]?.color || 'default'} size="small" />;
                        })()}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                          {post.tags?.slice(0, 3).map((tag) => (
                            <Chip key={tag} label={tag} size="small" sx={{ height: 22, fontSize: 11 }} />
                          ))}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(post.publishedAt || post.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Düzenle">
                          <IconButton size="small" onClick={() => handleOpenDialog(post)}><EditIcon fontSize="small" /></IconButton>
                        </Tooltip>
                        <Tooltip title="Sil">
                          <IconButton size="small" color="error" onClick={() => setDeleteConfirm(post.id)}><DeleteIcon fontSize="small" /></IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination component="div" count={total} page={page}
          onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[5, 10, 25]} labelRowsPerPage="Sayfa başına:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        />
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={700}>{editingPost ? 'Duzenle' : 'Yeni Yazi'}</Typography>
          <IconButton onClick={() => setDialogOpen(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <Stack direction="row" spacing={1.5}>
              <TextField fullWidth label="Baslik" value={form.title} size="small"
                onChange={(e) => setForm({ ...form, title: e.target.value, slug: editingPost ? form.slug : generateSlug(e.target.value) })} />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Durum</InputLabel>
                <Select value={form.status} label="Durum" onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <MenuItem value="DRAFT">Taslak</MenuItem>
                  <MenuItem value="PUBLISHED">Yayinda</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <TextField fullWidth label="Ozet" value={form.excerpt} size="small"
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
            <TextField fullWidth multiline rows={4} label="Icerik" value={form.content} size="small"
              onChange={(e) => setForm({ ...form, content: e.target.value })} />
            <TextField fullWidth label="Kapak Resmi URL" value={form.coverImage} size="small"
              onChange={(e) => setForm({ ...form, coverImage: e.target.value })} placeholder="https://..." />
            <TextField fullWidth label="Etiketler" value={form.tags} size="small"
              onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="kahve, espresso" />
            <Stack direction="row" spacing={1.5}>
              <TextField fullWidth label="SEO Baslik" value={form.metaTitle} size="small"
                onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} />
              <TextField fullWidth label="SEO Aciklama" value={form.metaDescription} size="small"
                onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} color="inherit">İptal</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving || !form.title}
            sx={{ bgcolor: olentiaColors.primary.main, '&:hover': { bgcolor: olentiaColors.primary.dark } }}>
            {saving ? 'Kaydediliyor...' : editingPost ? 'Güncelle' : 'Yayınla'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}
        PaperProps={{ sx: { bgcolor: 'background.paper', backgroundImage: 'none' } }}>
        <DialogTitle>Yazıyı Sil</DialogTitle>
        <DialogContent>
          <Typography>Bu blog yazısını silmek istediğinize emin misiniz?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)} color="inherit">İptal</Button>
          <Button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} color="error" variant="contained">Sil</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
