'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Chip, IconButton, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, Divider, Skeleton, Stack, Grid, Tooltip,
  Switch, FormControlLabel, ToggleButton, ToggleButtonGroup, Autocomplete,
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  ViewCarousel as BannerIcon, Close as CloseIcon,
  DragIndicator as DragIcon,
} from '@mui/icons-material';
import { websiteApi, uploadApi, productsApi, collectionsApi } from '@/lib/api';
import { olentiaColors } from '@/lib/theme';
import PageHeader from '@/components/common/PageHeader';

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  mobileImage?: string;
  ctaText?: string;
  ctaUrl?: string;
  sortOrder: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/**
 * Resolve image URL for preview. Handles:
 * - Full URL (http/https) → use as-is
 * - /uploads/... → backend API domain (where uploads are served)
 * - /hero/, /images/, or other relative paths → public web domain
 */
function resolveImagePreviewUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/uploads/')) {
    // Anchor `/api` to end of string — `api.pureolentia.com` subdomain
    // would otherwise be corrupted by an unanchored replace.
    const api = process.env.NEXT_PUBLIC_API_URL || '';
    return api.replace(/\/api\/?$/, '') + url;
  }
  // Legacy paths (/hero/...) were stored relative to the public website
  const web = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pureolentia.com';
  return url.startsWith('/') ? web + url : url;
}

const emptyForm = {
  title: '', subtitle: '', image: '', mobileImage: '', ctaText: '', ctaUrl: '',
  sortOrder: 0, isActive: true, startDate: '', endDate: '',
};

type LinkMode = 'product' | 'collection' | 'page' | 'custom';

interface PickerOption { slug: string; label: string }

// Detect mode from a stored URL so we can pre-fill the picker on edit.
function detectLinkMode(url: string): LinkMode {
  if (!url) return 'product';
  if (url.startsWith('/products/')) return 'product';
  if (url.startsWith('/collections/')) return 'collection';
  if (url.startsWith('http://') || url.startsWith('https://')) return 'custom';
  return 'page';
}

// Strip the mode-specific prefix so the picker shows the bare slug/path.
function stripPrefix(url: string, mode: LinkMode): string {
  if (!url) return '';
  if (mode === 'product') return url.replace(/^\/products\//, '');
  if (mode === 'collection') return url.replace(/^\/collections\//, '');
  if (mode === 'page') return url.replace(/^\//, '');
  return url;
}

// Re-build the stored URL from the picker's mode + value.
function buildUrl(mode: LinkMode, value: string): string {
  const v = (value || '').trim();
  if (!v) return '';
  if (mode === 'product') return `/products/${v.replace(/^\//, '')}`;
  if (mode === 'collection') return `/collections/${v.replace(/^\//, '')}`;
  if (mode === 'page') return v.startsWith('/') ? v : `/${v}`;
  return v;
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Buton Linki picker state — UI-only, persisted via form.ctaUrl
  const [linkMode, setLinkMode] = useState<LinkMode>('product');
  const [productOpts, setProductOpts] = useState<PickerOption[]>([]);
  const [collectionOpts, setCollectionOpts] = useState<PickerOption[]>([]);
  const [pageOpts, setPageOpts] = useState<PickerOption[]>([]);

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      const res = await websiteApi.getBanners();
      setBanners(Array.isArray(res) ? res : res.data || []);
    } catch { setBanners([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchBanners(); }, [fetchBanners]);

  // Lazily load picker options the first time the dialog opens.
  useEffect(() => {
    if (!dialogOpen) return;
    if (productOpts.length === 0) {
      productsApi.getProducts({ limit: 500 }).then((res: any) => {
        const list = res?.data?.data || res?.data || res || [];
        setProductOpts(
          (Array.isArray(list) ? list : []).map((p: any) => ({
            slug: p.slug || p.handle || '',
            label: p.title || p.name || p.slug || '',
          })).filter((o) => o.slug),
        );
      }).catch(() => {});
    }
    if (collectionOpts.length === 0) {
      collectionsApi.getCollections().then((res: any) => {
        const list = res?.data?.data || res?.data || res || [];
        setCollectionOpts(
          (Array.isArray(list) ? list : []).map((c: any) => ({
            slug: c.slug || c.handle || '',
            label: c.name || c.title || c.slug || '',
          })).filter((o) => o.slug),
        );
      }).catch(() => {});
    }
    if (pageOpts.length === 0) {
      websiteApi.getPages().then((res: any) => {
        const list = res?.data?.data || res?.data || res || [];
        setPageOpts(
          (Array.isArray(list) ? list : []).map((p: any) => ({
            slug: p.slug || '',
            label: p.title || p.slug || '',
          })).filter((o) => o.slug),
        );
      }).catch(() => {});
    }
  }, [dialogOpen, productOpts.length, collectionOpts.length, pageOpts.length]);

  const handleOpen = (banner?: Banner) => {
    if (banner) {
      setEditing(banner);
      setForm({
        title: banner.title, subtitle: banner.subtitle || '', image: banner.image,
        mobileImage: banner.mobileImage || '', ctaText: banner.ctaText || '', ctaUrl: banner.ctaUrl || '',
        sortOrder: banner.sortOrder, isActive: banner.isActive,
        startDate: banner.startDate ? banner.startDate.slice(0, 10) : '',
        endDate: banner.endDate ? banner.endDate.slice(0, 10) : '',
      });
      setLinkMode(detectLinkMode(banner.ctaUrl || ''));
    } else {
      setEditing(null);
      setForm({ ...emptyForm, sortOrder: banners.length });
      setLinkMode('product');
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
      };
      if (editing) {
        await websiteApi.updateBanner(editing.id, payload);
      } else {
        await websiteApi.createBanner(payload);
      }
      setDialogOpen(false);
      fetchBanners();
    } catch { /* toast */ }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu banner silinecek. Emin misiniz?')) return;
    await websiteApi.deleteBanner(id);
    fetchBanners();
  };

  return (
    <Box>
      <PageHeader
        title="Banner Yonetimi"
        subtitle={`${banners.length} banner`}
        icon={<BannerIcon />}
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()} size="small">
            Yeni Banner
          </Button>
        }
      />

      <Card sx={{ mt: 3 }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell width={50}>#</TableCell>
                <TableCell>Gorsel</TableCell>
                <TableCell>Baslik</TableCell>
                <TableCell>CTA</TableCell>
                <TableCell>Tarih Araligi</TableCell>
                <TableCell align="center">Durum</TableCell>
                <TableCell align="right">Islemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}><Skeleton /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : banners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">Henuz banner eklenmemis</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                banners.map((banner, idx) => (
                  <TableRow key={banner.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <DragIcon sx={{ fontSize: 16, color: 'text.disabled', cursor: 'grab' }} />
                        {idx + 1}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box
                        component="img" src={resolveImagePreviewUrl(banner.image)} alt={banner.title}
                        sx={{ width: 80, height: 40, objectFit: 'cover', borderRadius: 1 }}
                        onError={(e: any) => { e.target.style.display = 'none'; }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={600} fontSize={13}>{banner.title}</Typography>
                      {banner.subtitle && (
                        <Typography fontSize={11} color="text.secondary">{banner.subtitle}</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {banner.ctaText && (
                        <Chip label={banner.ctaText} size="small" variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell>
                      {banner.startDate || banner.endDate ? (
                        <Typography fontSize={12} color="text.secondary">
                          {banner.startDate ? formatDate(banner.startDate) : '...'} - {banner.endDate ? formatDate(banner.endDate) : '...'}
                        </Typography>
                      ) : (
                        <Typography fontSize={12} color="text.disabled">Surekli</Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={banner.isActive ? 'Aktif' : 'Pasif'}
                        color={banner.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Duzenle">
                        <IconButton size="small" onClick={() => handleOpen(banner)}>
                          <EditIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Sil">
                        <IconButton size="small" color="error" onClick={() => handleDelete(banner.id)}>
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
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {editing ? 'Banner Düzenle' : 'Yeni Banner'}
          <IconButton size="small" onClick={() => setDialogOpen(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Başlık" size="small" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                helperText='Satır kırmak için <br /> kullanabilirsiniz. Örn: "Türk Kahvesi 200gr <br /> Geleneksel Paket"' />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Alt Başlık (üst metin)" size="small" value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                helperText="Hero slide'da başlığın üzerinde küçük yazı (örn: 'Geleneksel 200gr paket')" />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Buton Metni" size="small" value={form.ctaText}
                onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
                helperText="Boş bırakılırsa 'İncele' kullanılır" />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom component="div">
                Butonun Yönlendireceği Yer
              </Typography>
              <ToggleButtonGroup
                size="small" exclusive fullWidth
                value={linkMode}
                onChange={(_, v: LinkMode | null) => {
                  if (!v) return;
                  setLinkMode(v);
                  // Reset URL when switching modes — avoids stitching wrong slugs into wrong prefixes
                  setForm((p) => ({ ...p, ctaUrl: '' }));
                }}
                sx={{ mb: 1 }}
              >
                <ToggleButton value="product">Ürün</ToggleButton>
                <ToggleButton value="collection">Koleksiyon</ToggleButton>
                <ToggleButton value="page">Sayfa</ToggleButton>
                <ToggleButton value="custom">Özel URL</ToggleButton>
              </ToggleButtonGroup>

              {linkMode === 'custom' ? (
                <TextField
                  fullWidth size="small" label="Tam URL"
                  value={form.ctaUrl}
                  onChange={(e) => setForm({ ...form, ctaUrl: e.target.value })}
                  placeholder="https://pureolentia.com/b2b"
                  helperText="Tam URL girin (https:// ile başlamalı)"
                />
              ) : (
                (() => {
                  const opts = linkMode === 'product' ? productOpts : linkMode === 'collection' ? collectionOpts : pageOpts;
                  const currentSlug = stripPrefix(form.ctaUrl, linkMode);
                  const selected = opts.find((o) => o.slug === currentSlug) || null;
                  const labelMap = { product: 'Ürün Seç', collection: 'Koleksiyon Seç', page: 'Sayfa Seç', custom: '' };
                  const helperMap = {
                    product: 'Banner butonu seçili ürünün sayfasına yönlendirir',
                    collection: 'Banner butonu seçili koleksiyona yönlendirir',
                    page: 'Banner butonu seçili sayfaya yönlendirir',
                    custom: '',
                  };
                  return (
                    <Autocomplete
                      size="small"
                      options={opts}
                      getOptionLabel={(o) => o?.label || ''}
                      isOptionEqualToValue={(a, b) => a.slug === b.slug}
                      value={selected}
                      onChange={(_, v) => {
                        const next = v ? buildUrl(linkMode, v.slug) : '';
                        setForm((p) => ({ ...p, ctaUrl: next }));
                      }}
                      noOptionsText="Sonuç yok"
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={labelMap[linkMode]}
                          helperText={helperMap[linkMode]}
                        />
                      )}
                    />
                  );
                })()
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom component="div">
                Masaüstü Görsel <strong>(1920x800px önerilen, max 10MB)</strong>
              </Typography>
              {form.image && (
                <Box sx={{ position: 'relative', width: '100%', height: 120, mb: 1, borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                  <img src={resolveImagePreviewUrl(form.image)}
                    alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <IconButton size="small" sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'error.main', color: 'white', '&:hover': { bgcolor: 'error.dark' } }}
                    onClick={() => setForm({ ...form, image: '' })}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
              <Button variant="outlined" component="label" fullWidth size="small" sx={{ borderStyle: 'dashed' }}>
                {form.image ? 'Görseli Değiştir' : 'Görsel Yükle'}
                <input type="file" hidden accept="image/*" onChange={async (e) => {
                  const file = e.target.files?.[0]; if (!file) return;
                  try { const res = await uploadApi.uploadSingle(file); const url = (res?.data || res)?.url; if (url) setForm((p) => ({ ...p, image: url })); } catch (err) { console.error(err); }
                  e.target.value = '';
                }} />
              </Button>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom component="div">
                Mobil Görsel <strong>(800x1000px önerilen, opsiyonel)</strong>
              </Typography>
              {form.mobileImage && (
                <Box sx={{ position: 'relative', width: '100%', height: 120, mb: 1, borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                  <img src={resolveImagePreviewUrl(form.mobileImage)}
                    alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <IconButton size="small" sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'error.main', color: 'white', '&:hover': { bgcolor: 'error.dark' } }}
                    onClick={() => setForm({ ...form, mobileImage: '' })}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
              <Button variant="outlined" component="label" fullWidth size="small" sx={{ borderStyle: 'dashed' }}>
                {form.mobileImage ? 'Görseli Değiştir' : 'Mobil Görsel Yükle'}
                <input type="file" hidden accept="image/*" onChange={async (e) => {
                  const file = e.target.files?.[0]; if (!file) return;
                  try { const res = await uploadApi.uploadSingle(file); const url = (res?.data || res)?.url; if (url) setForm((p) => ({ ...p, mobileImage: url })); } catch (err) { console.error(err); }
                  e.target.value = '';
                }} />
              </Button>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Sıralama (küçük numara önce gösterilir)" type="number" size="small" value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={<Switch checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />}
                label="Aktif"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>İptal</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !form.title || !form.image}>
            {saving ? 'Kaydediliyor...' : editing ? 'Güncelle' : 'Oluştur'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
