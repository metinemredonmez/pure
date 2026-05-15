'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, Chip, IconButton, Skeleton, Stack, Tooltip,
  Rating, Select, MenuItem, FormControl, InputLabel, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, Avatar, Grid, Tabs, Tab, Divider,
} from '@mui/material';
import {
  Star as StarIcon, Check as ApproveIcon, Close as RejectIcon, Delete as DeleteIcon,
  RateReview as ReviewIcon, Google as GoogleIcon, Store as StoreIcon,
  ThumbUp as HelpfulIcon, FormatQuote as QuoteIcon, Refresh as RefreshIcon,
} from '@mui/icons-material';
import { googleReviewsApi, reviewsApi } from '@/lib/api';
import { olentiaColors } from '@/lib/theme';
import PageHeader from '@/components/common/PageHeader';
import ExportButton from '@/components/common/ExportButton';
import { useToast } from '@/contexts/ToastContext';

interface Review {
  id: string; rating: number; title?: string; comment?: string; status: string;
  user?: { email: string; firstName?: string; lastName?: string };
  product?: { name: string }; createdAt: string; helpfulCount?: number;
}

interface GoogleReview {
  author: string; rating: number; text: string; time: string; profilePhoto?: string;
}

const statusConfig: Record<string, { label: string; color: 'warning' | 'success' | 'error' | 'default' }> = {
  PENDING: { label: 'Beklemede', color: 'warning' },
  APPROVED: { label: 'Onayli', color: 'success' },
  REJECTED: { label: 'Reddedildi', color: 'error' },
};

function formatDate(d: string) { return new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }); }

// Google reviews now come from backend (/admin/google-reviews → Google Places API + 6h cache).
// If GOOGLE_PLACES_API_KEY or GOOGLE_PLACE_ID are missing in backend .env, mock data is returned.

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [tab, setTab] = useState(0);
  const { showSuccess, showError } = useToast();
  const [googleReviews, setGoogleReviews] = useState<GoogleReview[]>([]);
  const [googleRating, setGoogleRating] = useState<number>(0);
  const [googleCount, setGoogleCount] = useState<number>(0);
  const [googleSource, setGoogleSource] = useState<'live' | 'cache' | 'mock' | ''>('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const fetchGoogleReviews = useCallback(async (refresh = false) => {
    try {
      setGoogleLoading(true);
      const r = refresh ? await googleReviewsApi.refresh() : await googleReviewsApi.list();
      const d = r.data || r;
      setGoogleReviews(Array.isArray(d.reviews) ? d.reviews : []);
      setGoogleRating(typeof d.rating === 'number' ? d.rating : 0);
      setGoogleCount(typeof d.reviewCount === 'number' ? d.reviewCount : (d.reviews?.length ?? 0));
      setGoogleSource(d.source || '');
    } catch {
      setGoogleReviews([]);
    } finally {
      setGoogleLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 1 && googleReviews.length === 0) fetchGoogleReviews(false);
  }, [tab, googleReviews.length, fetchGoogleReviews]);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const r = await reviewsApi.getReviews({ page: page + 1, limit: rowsPerPage, status: statusFilter || undefined });
      const d = r.data || r;
      setReviews(d.data || d.items || (Array.isArray(d) ? d : []));
      setTotal(d.meta?.total || d.total || 0);
    } catch { setReviews([]); }
    finally { setLoading(false); }
  }, [page, rowsPerPage, statusFilter]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleApprove = async (id: string, approved: boolean) => {
    try {
      await reviewsApi.approveReview(id, approved);
      showSuccess(approved ? 'Yorum onaylandi' : 'Yorum reddedildi');
      fetchReviews();
    } catch { showError('Islem basarisiz'); }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await reviewsApi.deleteReview(deleteConfirm);
      showSuccess('Yorum silindi');
      setDeleteConfirm(null);
      fetchReviews();
    } catch { showError('Silinemedi'); }
  };

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '0';

  return (
    <Box>
      <PageHeader
        title="Degerlendirmeler"
        subtitle="Site ve Google yorumlarini yonet"
        breadcrumbs={[{ label: 'Degerlendirmeler' }]}
        action={
          <ExportButton data={reviews}
            columns={[
              { key: 'product.name', label: 'Urun' }, { key: 'user.email', label: 'Musteri' },
              { key: 'rating', label: 'Puan' }, { key: 'comment', label: 'Yorum' },
              { key: 'status', label: 'Durum' }, { key: 'createdAt', label: 'Tarih' },
            ]}
            filename="degerlendirmeler"
          />
        }
      />

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h4" fontWeight={800} sx={{ color: olentiaColors.primary.main }}>{avgRating}</Typography>
            <Rating value={Number(avgRating)} readOnly size="small" precision={0.1} sx={{ mb: 0.5 }} />
            <Typography variant="caption" color="text.secondary">Site Ortalamasi</Typography>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h4" fontWeight={800} sx={{ color: '#4CAF50' }}>5.0</Typography>
            <Rating value={5} readOnly size="small" sx={{ mb: 0.5 }} />
            <Typography variant="caption" color="text.secondary">Google (20 yorum)</Typography>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h4" fontWeight={800}>{total}</Typography>
            <Typography variant="caption" color="text.secondary">Site Yorumlari</Typography>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h4" fontWeight={800} sx={{ color: '#FF9800' }}>
              {reviews.filter(r => r.status === 'PENDING').length}
            </Typography>
            <Typography variant="caption" color="text.secondary">Onay Bekleyen</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}
          sx={{ px: 2, '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 }, '& .Mui-selected': { color: olentiaColors.primary.main } }}>
          <Tab icon={<StoreIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={`Site Yorumlari (${total})`} />
          <Tab icon={<GoogleIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Google Yorumlari (20)" />
        </Tabs>
      </Card>

      {/* Tab 0: Site Reviews */}
      {tab === 0 && (
        <>
          <Card sx={{ mb: 2, p: 2 }}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Durum</InputLabel>
              <Select value={statusFilter} label="Durum" onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
                <MenuItem value="">Tumu</MenuItem>
                <MenuItem value="PENDING">Beklemede</MenuItem>
                <MenuItem value="APPROVED">Onayli</MenuItem>
                <MenuItem value="REJECTED">Reddedildi</MenuItem>
              </Select>
            </FormControl>
          </Card>

          <Card>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Urun</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Musteri</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Puan</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Yorum</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Durum</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Tarih</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">Islem</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>{Array.from({ length: 7 }).map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}</TableRow>
                  )) : reviews.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                        <ReviewIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                        <Typography color="text.secondary">Yorum bulunamadi</Typography>
                      </TableCell>
                    </TableRow>
                  ) : reviews.map((r) => (
                    <TableRow key={r.id} hover>
                      <TableCell><Typography variant="body2" fontWeight={500}>{r.product?.name || '-'}</Typography></TableCell>
                      <TableCell><Typography variant="body2">{r.user?.firstName ? `${r.user.firstName} ${r.user.lastName}` : r.user?.email || '-'}</Typography></TableCell>
                      <TableCell><Rating value={r.rating} readOnly size="small" /></TableCell>
                      <TableCell sx={{ maxWidth: 250 }}>
                        <Typography variant="body2" noWrap title={r.comment}>{r.comment || '-'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={statusConfig[r.status]?.label || r.status}
                          color={statusConfig[r.status]?.color || 'default'} size="small" />
                      </TableCell>
                      <TableCell><Typography variant="caption" color="text.secondary">{formatDate(r.createdAt)}</Typography></TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.25} justifyContent="center">
                          {r.status === 'PENDING' && (
                            <>
                              <Tooltip title="Onayla"><IconButton size="small" color="success" onClick={() => handleApprove(r.id, true)}><ApproveIcon sx={{ fontSize: 16 }} /></IconButton></Tooltip>
                              <Tooltip title="Reddet"><IconButton size="small" color="error" onClick={() => handleApprove(r.id, false)}><RejectIcon sx={{ fontSize: 16 }} /></IconButton></Tooltip>
                            </>
                          )}
                          <Tooltip title="Sil"><IconButton size="small" onClick={() => setDeleteConfirm(r.id)}><DeleteIcon sx={{ fontSize: 16 }} /></IconButton></Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination component="div" count={total} page={page}
              onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              rowsPerPageOptions={[5, 10, 25]} labelRowsPerPage="Sayfa basina:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`} />
          </Card>
        </>
      )}

      {/* Tab 1: Google Reviews */}
      {tab === 1 && (
        <Box>
          {/* Google Summary */}
          <Card sx={{ mb: 3, p: 2.5, borderLeft: `4px solid #4CAF50` }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ width: 48, height: 48, bgcolor: '#4CAF5015' }}>
                <GoogleIcon sx={{ color: '#4CAF50', fontSize: 28 }} />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="h5" fontWeight={800}>
                    {googleRating ? googleRating.toFixed(1) : '—'}
                  </Typography>
                  <Rating value={googleRating || 0} readOnly size="small" precision={0.1} />
                  <Typography variant="body2" color="text.secondary">{googleCount} yorum</Typography>
                  {googleSource === 'mock' && (
                    <Chip
                      label="Mock"
                      size="small"
                      color="warning"
                      sx={{ ml: 1, height: 20, fontSize: 10 }}
                    />
                  )}
                  {googleSource === 'cache' && (
                    <Chip label="Önbellek" size="small" sx={{ ml: 1, height: 20, fontSize: 10 }} />
                  )}
                  {googleSource === 'live' && (
                    <Chip label="Canlı" size="small" color="success" sx={{ ml: 1, height: 20, fontSize: 10 }} />
                  )}
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  Olentia — Kahve Kavurma Sirketi | Sancaktepe, Istanbul
                </Typography>
              </Box>
              <Tooltip title="Google'dan tekrar çek (önbelleği temizler)">
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<RefreshIcon />}
                  onClick={() => fetchGoogleReviews(true)}
                  disabled={googleLoading}
                >
                  Yenile
                </Button>
              </Tooltip>
            </Stack>
          </Card>

          {googleSource === 'mock' && (
            <Box sx={{ mb: 2, p: 1.5, borderRadius: 1, bgcolor: 'warning.main', color: 'warning.contrastText', opacity: 0.9 }}>
              <Typography variant="caption">
                Backend .env içinde <code>GOOGLE_PLACES_API_KEY</code> ve <code>GOOGLE_PLACE_ID</code> tanımlı değil — mock veri gösteriliyor.
              </Typography>
            </Box>
          )}

          {/* Google Review Cards */}
          {googleLoading ? (
            <Grid container spacing={2}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card sx={{ p: 2 }}>
                    <Skeleton variant="rectangular" height={120} />
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : googleReviews.length === 0 ? (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <GoogleIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
              <Typography color="text.secondary">Google yorumu bulunamadı.</Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {googleReviews.map((gr, i) => (
                <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card sx={{
                    height: '100%', transition: 'all 0.2s',
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 20px rgba(76,175,80,0.1)' },
                  }}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                        <Avatar
                          src={(gr as any).profilePhoto}
                          sx={{ width: 32, height: 32, bgcolor: `${olentiaColors.primary.main}15`, color: olentiaColors.primary.main, fontSize: 14, fontWeight: 700 }}
                        >
                          {gr.author?.[0]}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight={600}>{gr.author}</Typography>
                          <Typography variant="caption" color="text.disabled">{gr.time}</Typography>
                        </Box>
                        <GoogleIcon sx={{ fontSize: 16, color: '#4CAF50' }} />
                      </Stack>
                      <Rating value={gr.rating} readOnly size="small" sx={{ mb: 1 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5, fontSize: 13 }}>
                        <QuoteIcon sx={{ fontSize: 14, color: 'text.disabled', mr: 0.5, verticalAlign: 'text-top' }} />
                        {gr.text}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="caption" color="text.disabled">
              Google yorumları Places API üzerinden 6 saatte bir otomatik çekilir. Google sadece son 5 yorumu döner.
            </Typography>
          </Box>
        </Box>
      )}

      {/* Delete Dialog */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <DeleteIcon sx={{ color: '#f44336' }} />
            <Typography variant="h6" fontWeight={700}>Yorumu Sil</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">Bu yorumu silmek istediginizden emin misiniz?</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteConfirm(null)}>Vazgec</Button>
          <Button variant="contained" color="error" onClick={handleDelete} startIcon={<DeleteIcon />}>Sil</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
