'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, TableSortLabel, Chip, IconButton, TextField, InputAdornment, Select,
  MenuItem, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Divider, Skeleton, Avatar, Stack, Grid, Tooltip, Switch, FormControlLabel,
} from '@mui/material';
import {
  Search as SearchIcon, Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Inventory as ProductIcon, Close as CloseIcon, Visibility as ViewIcon,
} from '@mui/icons-material';
import { productsApi, categoriesApi } from '@/lib/api';
import { olentiaColors } from '@/lib/theme';
import PageHeader from '@/components/common/PageHeader';
import ExportButton from '@/components/common/ExportButton';

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  status: string;
  isActive?: boolean;
  isFeatured: boolean;
  stock?: number;
  description?: string;
  shortDescription?: string;
  origin?: string;
  roastLevel?: string;
  weight?: number;
  aromaProfile?: string[];
  brewGuide?: string;
  altitude?: string;
  process?: string;
  images?: { url: string }[];
  category?: { id: string; name: string };
  variants?: { id: string; name: string; stock: number; price: number }[];
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const statusConfig: Record<string, { label: string; color: 'default' | 'success' | 'warning' | 'error' }> = {
  ACTIVE: { label: 'Aktif', color: 'success' },
  DRAFT: { label: 'Taslak', color: 'warning' },
  ARCHIVED: { label: 'Arşiv', color: 'default' },
  OUT_OF_STOCK: { label: 'Stokta Yok', color: 'error' },
};

const roastLabels: Record<string, string> = {
  LIGHT: 'Açık', MEDIUM: 'Orta', MEDIUM_DARK: 'Orta-Koyu', DARK: 'Koyu',
};

function formatCurrency(amount: number | string | null | undefined) {
  const num = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
  if (isNaN(num)) return '₺0,00';
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(num);
}


const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || 'https://api.pureolentia.com/api').replace(/\/api\/?$/, '');
function imageUrl(url?: string) {
  if (!url) return undefined;
  if (url.startsWith('/')) return `${API_ORIGIN}${url}`;
  return url;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Form state
  const [form, setForm] = useState({
    name: '', slug: '', sku: '', description: '', shortDescription: '',
    price: 0, compareAtPrice: 0, costPrice: 0, stock: 0, imageUrls: [] as string[], status: 'DRAFT',
    isFeatured: false, origin: '', roastLevel: '', weight: 0,
    aromaProfile: '', brewGuide: '', altitude: '', process: '', categoryId: '',
  });

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await productsApi.getProducts({
        page: page + 1, limit: rowsPerPage,
        search: search || undefined, status: statusFilter || undefined,
      });
      const result = response.data || response;
      setProducts(result.data || result.items || result || []);
      setTotal(result.meta?.total || result.total || 0);
    } catch (error) {
      console.error('Ürünler yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, statusFilter]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await categoriesApi.getCategories();
      const result = response.data || response;
      setCategories(Array.isArray(result) ? result : result.data || []);
    } catch (error) {
      console.error('Kategoriler yüklenemedi:', error);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setForm({
        name: product.name, slug: product.slug, sku: product.sku,
        description: product.description || '', shortDescription: product.shortDescription || '',
        price: Number(product.price) || 0,
        compareAtPrice: Number(product.compareAtPrice) || 0,
        stock: product.stock || 0,
        imageUrls: (product.images || []).map((img: any) => img.url),
        costPrice: Number(product.costPrice) || 0,
        status: product.status,
        isFeatured: product.isFeatured,
        origin: product.origin || '', roastLevel: product.roastLevel || '',
        weight: product.weight || 0,
        aromaProfile: Array.isArray(product.aromaProfile) ? product.aromaProfile.join(', ') : '',
        brewGuide: product.brewGuide || '',
        altitude: product.altitude || '', process: product.process || '', categoryId: product.category?.id || '',
      });
    } else {
      setEditingProduct(null);
      setForm({
        name: '', slug: '', sku: '', description: '', shortDescription: '',
        price: 0, compareAtPrice: 0, costPrice: 0, stock: 0, imageUrls: [] as string[], status: 'DRAFT',
        isFeatured: false, origin: '', roastLevel: '', weight: 0,
        aromaProfile: '', brewGuide: '', altitude: '', process: '', categoryId: '',
      });
    }
    setDialogOpen(true);
  };

  const generateSlug = (name: string) => {
    return name
      .toLocaleLowerCase('tr-TR')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ı/g, 'i')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        slug: form.slug,
        sku: form.sku,
        description: form.description || undefined,
        price: form.price,
        compareAtPrice: form.compareAtPrice || undefined,
        costPrice: form.costPrice || undefined,
        weight: form.weight || undefined,
        stock: form.stock || 0,
        categoryId: form.categoryId || undefined,
        status: form.status,
        roastLevel: form.roastLevel || undefined,
        origin: form.origin || undefined,
        altitude: form.altitude || undefined,
        process: form.process || undefined,
        aromaProfile: form.aromaProfile ? form.aromaProfile.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        brewGuide: form.brewGuide || undefined,
        isActive: form.status === 'ACTIVE',
        isFeatured: form.isFeatured,
        images: form.imageUrls.map((url: string) => ({ url, alt: form.name })),
      };
      if (editingProduct) {
        await productsApi.updateProduct(editingProduct.id, payload);
      } else {
        await productsApi.createProduct(payload);
      }
      setDialogOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Ürün kaydedilemedi:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await productsApi.deleteProduct(id);
      setDeleteConfirm(null);
      fetchProducts();
    } catch (error) {
      console.error('Ürün silinemedi:', error);
    }
  };

  const totalStock = (product: Product) => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
    }
    return product.stock ?? 0;
  };

  return (
    <Box>
      <PageHeader
        title="Ürünler"
        subtitle="Ürün kataloğunu yönet"
        breadcrumbs={[{ label: 'Ürünler' }]}
        action={
          <Stack direction="row" spacing={1}>
            <ExportButton
              data={products}
              columns={[
                { key: 'name', label: 'Ürün Adı' },
                { key: 'sku', label: 'SKU' },
                { key: 'price', label: 'Fiyat' },
                { key: 'stock', label: 'Stok' },
                { key: 'isActive', label: 'Durum' },
              ]}
              filename="urunler"
            />
            <Button
              variant="contained" startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{ bgcolor: olentiaColors.primary.main, '&:hover': { bgcolor: olentiaColors.primary.dark } }}
            >
              Yeni Ürün
            </Button>
          </Stack>
        }
      />

      <Card sx={{ mb: 3, p: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            size="small" placeholder="Ürün ara..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { setPage(0); fetchProducts(); } }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment> } }}
            sx={{ minWidth: 300, flex: 1 }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Durum</InputLabel>
            <Select value={statusFilter} label="Durum" onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
              <MenuItem value="">Tümü</MenuItem>
              <MenuItem value="ACTIVE">Aktif</MenuItem>
              <MenuItem value="DRAFT">Taslak</MenuItem>
              <MenuItem value="ARCHIVED">Arşiv</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Card>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>
                  <TableSortLabel active={sortBy === 'name'} direction={sortBy === 'name' ? sortOrder : 'asc'} onClick={() => handleSort('name')}>
                    Ürün
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>SKU</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Kategori</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">
                  <TableSortLabel active={sortBy === 'price'} direction={sortBy === 'price' ? sortOrder : 'asc'} onClick={() => handleSort('price')}>
                    Fiyat
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">
                  <TableSortLabel active={sortBy === 'stock'} direction={sortBy === 'stock' ? sortOrder : 'asc'} onClick={() => handleSort('stock')}>
                    Stok
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  <TableSortLabel active={sortBy === 'status'} direction={sortBy === 'status' ? sortOrder : 'asc'} onClick={() => handleSort('status')}>
                    Durum
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">İşlem</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading
                ? Array.from({ length: rowsPerPage }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}
                    </TableRow>
                  ))
                : products.length === 0
                ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <ProductIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                      <Typography color="text.secondary">Ürün bulunamadı</Typography>
                    </TableCell>
                  </TableRow>
                )
                : [...products].sort((a, b) => {
                    let aVal: string | number | undefined;
                    let bVal: string | number | undefined;
                    if (sortBy === 'stock') {
                      aVal = totalStock(a);
                      bVal = totalStock(b);
                    } else {
                      aVal = a[sortBy as keyof Product] as string | number | undefined;
                      bVal = b[sortBy as keyof Product] as string | number | undefined;
                    }
                    if (aVal == null) return 1;
                    if (bVal == null) return -1;
                    const cmp = typeof aVal === 'number' ? aVal - (bVal as number) : String(aVal).localeCompare(String(bVal));
                    return sortOrder === 'asc' ? cmp : -cmp;
                  }).map((product) => (
                    <TableRow key={product.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            src={imageUrl(product.images?.[0]?.url)}
                            variant="rounded"
                            sx={{ width: 40, height: 40, bgcolor: `${olentiaColors.primary.main}20`, color: olentiaColors.primary.main, fontWeight: 700, fontSize: 16 }}
                          >
                            {product.name[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>{product.name}</Typography>
                            {product.origin && (
                              <Typography variant="caption" color="text.secondary">
                                {product.origin} {product.roastLevel && `• ${roastLabels[product.roastLevel] || product.roastLevel}`}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12 }}>{product.sku}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">{product.category?.name || '-'}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600}>{formatCurrency(product.price)}</Typography>
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                          <Typography variant="caption" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                            {formatCurrency(product.compareAtPrice)}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={totalStock(product)}
                          size="small"
                          color={totalStock(product) > 10 ? 'success' : totalStock(product) > 0 ? 'warning' : 'error'}
                          variant="outlined"
                          sx={{ minWidth: 50 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={statusConfig[product.status]?.label || product.status}
                          color={statusConfig[product.status]?.color || 'default'}
                          size="small" variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Düzenle">
                          <IconButton size="small" onClick={() => handleOpenDialog(product)}><EditIcon fontSize="small" /></IconButton>
                        </Tooltip>
                        <Tooltip title="Sil">
                          <IconButton size="small" color="error" onClick={() => setDeleteConfirm(product.id)}><DeleteIcon fontSize="small" /></IconButton>
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
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Sayfa başına:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        />
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { bgcolor: 'background.paper', backgroundImage: 'none' } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={700}>{editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün'}</Typography>
          <IconButton onClick={() => setDialogOpen(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField fullWidth label="Ürün Adı" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value, slug: editingProduct ? form.slug : generateSlug(e.target.value) })}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} sx={{ mb: 2 }} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Slug (URL)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} size="small" sx={{ mb: 2 }} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth multiline rows={3} label="Açıklama" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} sx={{ mb: 2 }} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <TextField fullWidth type="number" label="Fiyat (₺)" value={form.price || ""} onChange={(e) => setForm({ ...form, price: e.target.value === "" ? 0 : Number(e.target.value) })} inputProps={{ min: 0, step: "0.01" }} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <TextField fullWidth type="number" label="Karşılaştırma Fiyatı" value={form.compareAtPrice || ""} onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value === "" ? 0 : Number(e.target.value) })} inputProps={{ min: 0, step: "0.01" }} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <TextField fullWidth type="number" label="Maliyet" value={form.costPrice || ""} onChange={(e) => setForm({ ...form, costPrice: e.target.value === "" ? 0 : Number(e.target.value) })} inputProps={{ min: 0, step: "0.01" }} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <TextField fullWidth type="number" label="Ağırlık (g)" value={form.weight || ""} onChange={(e) => setForm({ ...form, weight: e.target.value === "" ? 0 : Number(e.target.value) })} inputProps={{ min: 0 }} />
            </Grid>
            <Grid size={{ xs: 6, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Kategori</InputLabel>
                <Select value={form.categoryId} label="Kategori" onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                  <MenuItem value="">Seçiniz</MenuItem>
                  {categories.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Durum</InputLabel>
                <Select value={form.status} label="Durum" onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <MenuItem value="DRAFT">Taslak</MenuItem>
                  <MenuItem value="ACTIVE">Aktif</MenuItem>
                  <MenuItem value="ARCHIVED">Arşiv</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Kavurma</InputLabel>
                <Select value={form.roastLevel} label="Kavurma" onChange={(e) => setForm({ ...form, roastLevel: e.target.value })}>
                  <MenuItem value="">Seçiniz</MenuItem>
                  <MenuItem value="LIGHT">Açık</MenuItem>
                  <MenuItem value="MEDIUM">Orta</MenuItem>
                  <MenuItem value="MEDIUM_DARK">Orta-Koyu</MenuItem>
                  <MenuItem value="DARK">Koyu</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6, md: 4 }}>
              <TextField fullWidth label="Menşei" value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} placeholder="Ethiopia" />
            </Grid>
            <Grid size={{ xs: 6, md: 4 }}>
              <TextField fullWidth label="Rakım" value={form.altitude} onChange={(e) => setForm({ ...form, altitude: e.target.value })} placeholder="1800-2200m" />
            </Grid>
            <Grid size={{ xs: 6, md: 4 }}>
              <TextField fullWidth label="İşlem" value={form.process} onChange={(e) => setForm({ ...form, process: e.target.value })} placeholder="Washed" />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Aroma Profili" value={form.aromaProfile} onChange={(e) => setForm({ ...form, aromaProfile: e.target.value })} placeholder="çikolata, fındık, karamel (virgülle ayırın)" />
            </Grid>
            <Grid size={{ xs: 6, md: 4 }}>
              <TextField fullWidth type="number" label="Stok" value={form.stock || ""} onChange={(e) => setForm({ ...form, stock: e.target.value === "" ? 0 : Number(e.target.value) })} inputProps={{ min: 0 }} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>Ürün Görselleri</Typography>
                {/* Preview */}
                {form.imageUrls && form.imageUrls.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    {form.imageUrls.map((url: string, idx: number) => (
                      <Box key={idx} sx={{ position: 'relative', width: 100, height: 100, borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                        <img src={imageUrl(url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <IconButton size="small" sx={{ position: 'absolute', top: 0, right: 0, bgcolor: 'error.main', color: 'white', '&:hover': { bgcolor: 'error.dark' }, width: 20, height: 20 }}
                          onClick={() => setForm({ ...form, imageUrls: form.imageUrls.filter((_: string, i: number) => i !== idx) })}>
                          <CloseIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                )}
                {/* Upload button */}
                <Button variant="outlined" component="label" fullWidth sx={{ py: 3, borderStyle: 'dashed' }}>
                  📷 Görsel Yükle (Birden fazla seçebilirsiniz)
                  <input type="file" hidden multiple accept="image/*"
                    onChange={async (e) => {
                      const files = e.target.files;
                      if (!files || files.length === 0) return;
                      try {
                        const { uploadApi } = await import('@/lib/api');
                        const res = await uploadApi.uploadMultiple(Array.from(files));
                        const urls = Array.isArray(res?.data) ? res.data.map((f: any) => f.url) : (res?.data?.urls || res?.urls || []);
                        setForm((prev: any) => ({ ...prev, imageUrls: [...(prev.imageUrls || []), ...urls] }));
                      } catch (err) { console.error('Upload error:', err); }
                      e.target.value = '';
                    }}
                  />
                </Button>
                <Typography variant="caption" color="text.secondary">Max 10MB, JPG/PNG/WebP. Önerilen: 800x800px</Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={<Switch checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} color="primary" />}
                label="Öne Çıkan Ürün"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} color="inherit">İptal</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving || !form.name || !form.sku || !form.price}
            sx={{ bgcolor: olentiaColors.primary.main, '&:hover': { bgcolor: olentiaColors.primary.dark } }}>
            {saving ? 'Kaydediliyor...' : editingProduct ? 'Güncelle' : 'Oluştur'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} PaperProps={{ sx: { bgcolor: 'background.paper', backgroundImage: 'none' } }}>
        <DialogTitle>Ürünü Sil</DialogTitle>
        <DialogContent>
          <Typography>Bu ürünü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)} color="inherit">İptal</Button>
          <Button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} color="error" variant="contained">Sil</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
