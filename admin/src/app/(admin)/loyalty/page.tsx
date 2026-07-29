'use client';

import { useEffect, useState, useCallback } from 'react';
import { NumberField } from '@/components/NumberField';
import {
  Box, Typography, Card, CardContent, Grid, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Skeleton, Stack, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  Divider, IconButton, Tooltip, LinearProgress, Alert,
} from '@mui/material';
import {
  Loyalty as LoyaltyIcon, EmojiEvents as TrophyIcon,
  TrendingUp as TrendingIcon, People as PeopleIcon,
  Close as CloseIcon, Stars as StarsIcon,
  Info as InfoIcon, CardGiftcard as GiftIcon,
  WorkspacePremium as PremiumIcon, Redeem as RedeemIcon,
  AddCircleOutline as AddIcon, RemoveCircleOutline as RemoveIcon,
} from '@mui/icons-material';
import { loyaltyApi } from '@/lib/api';
import { olentiaColors } from '@/lib/theme';
import PageHeader from '@/components/common/PageHeader';
import ExportButton from '@/components/common/ExportButton';

interface LoyaltyStats {
  totalMembers?: number;
  activeMembers?: number;
  totalPointsIssued?: number;
  totalPointsRedeemed?: number;
  tierDistribution?: Record<string, number>;
}

interface LeaderboardUser {
  id: string;
  userId: string;
  totalPoints: number;
  currentPoints: number;
  tier: string;
  user?: { email: string; firstName?: string; lastName?: string };
}

const tierConfig: Record<string, { label: string; color: string; icon: string; minPoints: number; benefit: string }> = {
  BRONZE: { label: 'Bronz', color: '#CD7F32', icon: '🥉', minPoints: 0, benefit: '%5 indirim' },
  SILVER: { label: 'Gümüş', color: '#C0C0C0', icon: '🥈', minPoints: 500, benefit: '%10 indirim + ücretsiz kargo' },
  GOLD: { label: 'Altin', color: '#FFD700', icon: '🥇', minPoints: 2000, benefit: '%15 indirim + oncelikli kargo' },
  PLATINUM: { label: 'Platin', color: '#E5E4E2', icon: '💎', minPoints: 5000, benefit: '%20 indirim + ozel urunler' },
  DIAMOND: { label: 'Elmas', color: '#B9F2FF', icon: '👑', minPoints: 10000, benefit: '%25 indirim + VIP erişim' },
};

function formatNumber(n: number) {
  return new Intl.NumberFormat('tr-TR').format(n);
}

export default function LoyaltyPage() {
  const [stats, setStats] = useState<LoyaltyStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [adjustDialog, setAdjustDialog] = useState(false);
  const [adjustUserId, setAdjustUserId] = useState('');
  const [adjustPoints, setAdjustPoints] = useState(0);
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustType, setAdjustType] = useState<'add' | 'remove'>('add');
  const [adjusting, setAdjusting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, leaderboardRes] = await Promise.all([
        loyaltyApi.getStats().catch(() => ({ data: null })),
        loyaltyApi.getLeaderboard().catch(() => ({ data: [] })),
      ]);
      const statsData = statsRes.data || statsRes;
      const mapped: LoyaltyStats = {
        totalMembers: statsData.totalAccounts ?? statsData.totalMembers ?? 0,
        activeMembers: statsData.activeAccounts ?? statsData.activeMembers ?? 0,
        totalPointsIssued: statsData.points?.totalIssued ?? statsData.totalPointsIssued ?? 0,
        totalPointsRedeemed: statsData.points?.totalSpent ?? statsData.totalPointsRedeemed ?? 0,
        tierDistribution: Array.isArray(statsData.tierDistribution)
          ? Object.fromEntries(statsData.tierDistribution.map((t: { tier: string; count: number }) => [t.tier, t.count]))
          : statsData.tierDistribution,
      };
      setStats(mapped);
      const lbData = leaderboardRes.data || leaderboardRes;
      setLeaderboard(Array.isArray(lbData) ? lbData : lbData.data || []);
    } catch (error) {
      console.error('Sadakat verileri yuklenemedi:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAdjust = async () => {
    if (!adjustUserId || !adjustPoints) return;
    setAdjusting(true);
    try {
      const pts = adjustType === 'remove' ? -Math.abs(adjustPoints) : Math.abs(adjustPoints);
      await loyaltyApi.adjustPoints(adjustUserId, pts, adjustReason);
      setAdjustDialog(false);
      fetchData();
    } catch (error) {
      console.error('Puan ayarlanamadi:', error);
    } finally {
      setAdjusting(false);
    }
  };

  const redeemRate = stats?.totalPointsIssued
    ? Math.round(((stats?.totalPointsRedeemed || 0) / stats.totalPointsIssued) * 100)
    : 0;

  const statCards = [
    {
      title: 'Toplam Uye',
      value: stats?.totalMembers ?? 0,
      icon: <PeopleIcon sx={{ fontSize: 24 }} />,
      color: '#4FC3F7',
      desc: 'Sadakat programina kayitli toplam musteri sayisi',
    },
    {
      title: 'Aktif Uye',
      value: stats?.activeMembers ?? 0,
      icon: <LoyaltyIcon sx={{ fontSize: 24 }} />,
      color: olentiaColors.primary.main,
      desc: 'Son 30 gunde puan kazanan veya kullanan uyeler',
    },
    {
      title: 'Verilen Puan',
      value: stats?.totalPointsIssued ?? 0,
      icon: <TrendingIcon sx={{ fontSize: 24 }} />,
      color: '#66BB6A',
      desc: 'Siparisler ve kampanyalarla kazanilan toplam puan',
    },
    {
      title: 'Kullanilan Puan',
      value: stats?.totalPointsRedeemed ?? 0,
      icon: <RedeemIcon sx={{ fontSize: 24 }} />,
      color: '#FFA726',
      desc: 'Indirim ve oduller icin harcanan toplam puan',
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Sadakat Programi"
        subtitle="Musteri puan sistemi, seviyeler ve odulleri yonetin"
        breadcrumbs={[{ label: 'Sadakat Programi' }]}
        action={
          <Stack direction="row" spacing={1} alignItems="center">
            <ExportButton
              data={leaderboard}
              columns={[
                { key: 'user.email', label: 'Musteri' },
                { key: 'tier', label: 'Seviye' },
                { key: 'totalPoints', label: 'Toplam Puan' },
                { key: 'currentPoints', label: 'Mevcut Puan' },
              ]}
              filename="sadakat"
            />
            <Button
              variant="contained"
              startIcon={<StarsIcon />}
              onClick={() => { setAdjustDialog(true); setAdjustUserId(''); setAdjustPoints(0); setAdjustReason(''); setAdjustType('add'); }}
              sx={{ bgcolor: olentiaColors.primary.main, '&:hover': { bgcolor: olentiaColors.primary.dark } }}
            >
              Puan Ayarla
            </Button>
          </Stack>
        }
      />

      {/* Info Banner */}
      <Card sx={{ mb: 3, p: 2, bgcolor: `${olentiaColors.primary.main}08`, border: `1px solid ${olentiaColors.primary.main}20` }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <InfoIcon sx={{ color: olentiaColors.primary.main, fontSize: 20 }} />
          <Box>
            <Typography variant="body2" fontWeight={600} sx={{ color: olentiaColors.primary.main }}>
              Sadakat Programi Nasil Calisir?
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Musteriler her 1 TL harcama icin 1 puan kazanir. Puanlar seviye yukseltme ve indirim icin kullanilabilir.
              Her seviyenin kendine ozel avantajlari vardir. Puanlarin gecerlilik suresi 12 aydir.
            </Typography>
          </Box>
        </Stack>
      </Card>

      {/* Stat Cards - Enhanced */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statCards.map((card) => (
          <Grid key={card.title} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{
              height: '100%',
              transition: 'all 0.2s ease',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 4px 20px ${card.color}15` },
            }}>
              <CardContent sx={{ py: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Box sx={{
                    width: 48, height: 48, borderRadius: 2,
                    bgcolor: `${card.color}15`, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', color: card.color,
                  }}>
                    {card.icon}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.3, display: 'block' }}>
                      {card.title}
                    </Typography>
                    {loading ? <Skeleton width={70} height={32} /> : (
                      <Typography variant="h5" fontWeight={800}>{formatNumber(card.value)}</Typography>
                    )}
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, lineHeight: 1.3, display: 'block', mt: 0.5 }}>
                      {card.desc}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Puan Kullanım Orani + Tier Distribution */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Redeem Rate */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%', p: 2.5 }}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <GiftIcon sx={{ color: '#AB47BC', fontSize: 20 }} />
                <Typography variant="subtitle2" fontWeight={700}>Puan Kullanım Orani</Typography>
              </Stack>
              <Box sx={{ textAlign: 'center', py: 1 }}>
                {loading ? <Skeleton width={80} height={48} sx={{ mx: 'auto' }} /> : (
                  <Typography variant="h3" fontWeight={800} sx={{ color: redeemRate > 50 ? '#66BB6A' : redeemRate > 20 ? '#FFA726' : '#EF5350' }}>
                    %{redeemRate}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary">
                  Verilen puanlarin %{redeemRate}&apos;i kullanildi
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={redeemRate}
                sx={{
                  height: 8, borderRadius: 4,
                  bgcolor: 'rgba(255,255,255,0.06)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    bgcolor: redeemRate > 50 ? '#66BB6A' : redeemRate > 20 ? '#FFA726' : '#EF5350',
                  },
                }}
              />
            </Stack>
          </Card>
        </Grid>

        {/* Tier Distribution */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ height: '100%', p: 2.5 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <PremiumIcon sx={{ color: '#FFD700', fontSize: 20 }} />
              <Typography variant="subtitle2" fontWeight={700}>Seviye Dagilimi & Avantajlar</Typography>
            </Stack>
            <Grid container spacing={1.5}>
              {Object.entries(tierConfig).map(([tier, config]) => {
                const count = stats?.tierDistribution?.[tier] || 0;
                return (
                  <Grid key={tier} size={{ xs: 6, sm: 4, md: 2.4 }}>
                    <Card variant="outlined" sx={{
                      p: 1.5, textAlign: 'center',
                      borderColor: count > 0 ? `${config.color}60` : 'divider',
                      bgcolor: count > 0 ? `${config.color}08` : 'transparent',
                      transition: 'all 0.2s',
                      '&:hover': { borderColor: config.color, transform: 'scale(1.02)' },
                    }}>
                      <Typography sx={{ fontSize: 24, lineHeight: 1 }}>{config.icon}</Typography>
                      <Typography variant="body2" fontWeight={700} sx={{ color: config.color, mt: 0.5 }}>
                        {config.label}
                      </Typography>
                      <Typography variant="h6" fontWeight={800} sx={{ my: 0.3 }}>
                        {loading ? <Skeleton width={30} sx={{ mx: 'auto' }} /> : count}
                      </Typography>
                      <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9, lineHeight: 1.2, display: 'block' }}>
                        {config.minPoints > 0 ? `${formatNumber(config.minPoints)}+ puan` : 'Baslangic'}
                      </Typography>
                      <Chip
                        label={config.benefit}
                        size="small"
                        sx={{ mt: 0.5, height: 18, fontSize: 9, bgcolor: `${config.color}15`, color: config.color }}
                      />
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Card>
        </Grid>
      </Grid>

      {/* Leaderboard */}
      <Card>
        <Box sx={{ p: 2, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <TrophyIcon sx={{ color: '#FFD700', fontSize: 22 }} />
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>En Iyi Musteriler</Typography>
              <Typography variant="caption" color="text.secondary">Toplam puana gore siralama</Typography>
            </Box>
          </Stack>
          <Chip label={`${leaderboard.length} uye`} size="small" sx={{ bgcolor: `${olentiaColors.primary.main}15`, color: olentiaColors.primary.main }} />
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, width: 50 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Musteri</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Seviye</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Toplam Puan</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Mevcut Puan</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Durum</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>{Array.from({ length: 6 }).map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}</TableRow>
                  ))
                : leaderboard.length === 0
                ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <TrophyIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1.5 }} />
                      <Typography variant="h6" color="text.secondary" fontWeight={600}>Henuz sadakat uyesi yok</Typography>
                      <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
                        Musteriler ilk alisverislerini yaptiktan sonra otomatik olarak programa dahil olur.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )
                : leaderboard.map((user, i) => (
                    <TableRow key={user.id} hover sx={{
                      bgcolor: i === 0 ? 'rgba(255,215,0,0.03)' : i === 1 ? 'rgba(192,192,192,0.02)' : i === 2 ? 'rgba(205,127,50,0.02)' : 'transparent',
                    }}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700} sx={{
                          color: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'text.secondary',
                          fontSize: i < 3 ? 16 : 14,
                        }}>
                          {i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{
                            width: 36, height: 36, fontSize: 15,
                            bgcolor: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : olentiaColors.primary.main,
                            color: i < 3 ? '#000' : '#fff',
                          }}>
                            {user.user?.firstName?.[0] || user.user?.email?.[0]?.toUpperCase() || '?'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {user.user?.firstName ? `${user.user.firstName} ${user.user.lastName}` : user.user?.email || '-'}
                            </Typography>
                            {user.user?.firstName && (
                              <Typography variant="caption" color="text.secondary">{user.user.email}</Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${tierConfig[user.tier]?.icon || ''} ${tierConfig[user.tier]?.label || user.tier}`}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            bgcolor: `${tierConfig[user.tier]?.color || '#999'}20`,
                            color: tierConfig[user.tier]?.color || '#999',
                            border: `1px solid ${tierConfig[user.tier]?.color || '#999'}40`,
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={700}>{formatNumber(user.totalPoints)}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="flex-end">
                          <StarsIcon sx={{ fontSize: 14, color: '#FFA726' }} />
                          <Typography variant="body2" fontWeight={600} sx={{ color: '#FFA726' }}>
                            {formatNumber(user.currentPoints)}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={user.currentPoints > 0 ? 'Aktif' : 'Pasif'}
                          size="small"
                          color={user.currentPoints > 0 ? 'success' : 'default'}
                          variant="outlined"
                          sx={{ height: 22, fontSize: 11 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Adjust Points Dialog - Enhanced */}
      <Dialog open={adjustDialog} onClose={() => setAdjustDialog(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { bgcolor: 'background.paper', backgroundImage: 'none' } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <StarsIcon sx={{ color: olentiaColors.primary.main }} />
            <Typography variant="h6" fontWeight={700}>Puan Ayarla</Typography>
          </Stack>
          <IconButton onClick={() => setAdjustDialog(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          {/* Info Banner */}
          <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 2.5, borderRadius: 2 }}>
            Bir musteriye manuel olarak puan ekleyebilir veya cikarabilirsiniz.
            Bu islem denetim loglarinda kayit altina alinir.
          </Alert>

          <Stack spacing={2.5}>
            {/* User ID */}
            <TextField
              fullWidth
              label="Musteri ID veya E-posta"
              value={adjustUserId}
              onChange={(e) => setAdjustUserId(e.target.value)}
              placeholder="cuid veya musteri@email.com"
              helperText="Kullanicilar sayfasindan musteri ID'sini kopyalayabilirsiniz"
              size="small"
            />

            {/* Puan Type Toggle */}
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Islem Tipi</Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  variant={adjustType === 'add' ? 'contained' : 'outlined'}
                  startIcon={<AddIcon />}
                  onClick={() => setAdjustType('add')}
                  sx={{
                    flex: 1,
                    bgcolor: adjustType === 'add' ? '#66BB6A' : 'transparent',
                    borderColor: '#66BB6A',
                    color: adjustType === 'add' ? '#fff' : '#66BB6A',
                    '&:hover': { bgcolor: adjustType === 'add' ? '#57A55A' : '#66BB6A15' },
                  }}
                >
                  Puan Ekle
                </Button>
                <Button
                  variant={adjustType === 'remove' ? 'contained' : 'outlined'}
                  startIcon={<RemoveIcon />}
                  onClick={() => setAdjustType('remove')}
                  sx={{
                    flex: 1,
                    bgcolor: adjustType === 'remove' ? '#EF5350' : 'transparent',
                    borderColor: '#EF5350',
                    color: adjustType === 'remove' ? '#fff' : '#EF5350',
                    '&:hover': { bgcolor: adjustType === 'remove' ? '#D94240' : '#EF535015' },
                  }}
                >
                  Puan Cikar
                </Button>
              </Stack>
            </Box>

            {/* Points Amount */}
            <NumberField
              fullWidth
              label="Puan Miktari"
              value={adjustPoints}
              onValueChange={(v) => setAdjustPoints(Math.abs(v))}
              size="small"
              slotProps={{ input: { inputProps: { min: 1 } } }}
              helperText={adjustPoints > 0 ? (
                adjustType === 'add'
                  ? `Musteriye ${formatNumber(adjustPoints)} puan eklenecek`
                  : `Musteriden ${formatNumber(adjustPoints)} puan dusulecek`
              ) : 'Eklenecek veya cikarilacak puan miktarini girin'}
            />

            {/* Reason */}
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Sebep / Aciklama"
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              placeholder="Ornek: Kampanya odulu, iade telafisi, ozel musteri promosyonu..."
              size="small"
            />

            {/* Summary Card */}
            {adjustUserId && adjustPoints > 0 && (
              <Card variant="outlined" sx={{
                p: 2,
                bgcolor: adjustType === 'add' ? 'rgba(102,187,106,0.05)' : 'rgba(239,83,80,0.05)',
                borderColor: adjustType === 'add' ? 'rgba(102,187,106,0.3)' : 'rgba(239,83,80,0.3)',
              }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>Islem Ozeti</Typography>
                <Stack spacing={0.5} sx={{ mt: 1 }}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Musteri</Typography>
                    <Typography variant="body2" fontWeight={600}>{adjustUserId}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Islem</Typography>
                    <Chip
                      label={adjustType === 'add' ? `+${formatNumber(adjustPoints)} puan` : `-${formatNumber(adjustPoints)} puan`}
                      size="small"
                      sx={{
                        height: 22, fontSize: 11, fontWeight: 700,
                        bgcolor: adjustType === 'add' ? '#66BB6A20' : '#EF535020',
                        color: adjustType === 'add' ? '#66BB6A' : '#EF5350',
                      }}
                    />
                  </Stack>
                  {adjustReason && (
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Sebep</Typography>
                      <Typography variant="body2" fontWeight={500}>{adjustReason}</Typography>
                    </Stack>
                  )}
                </Stack>
              </Card>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setAdjustDialog(false)} color="inherit">Iptal</Button>
          <Button
            onClick={handleAdjust}
            variant="contained"
            disabled={adjusting || !adjustUserId || !adjustPoints}
            startIcon={adjustType === 'add' ? <AddIcon /> : <RemoveIcon />}
            sx={{
              bgcolor: adjustType === 'add' ? '#66BB6A' : '#EF5350',
              '&:hover': { bgcolor: adjustType === 'add' ? '#57A55A' : '#D94240' },
            }}
          >
            {adjusting ? 'Kaydediliyor...' : adjustType === 'add' ? 'Puan Ekle' : 'Puan Cikar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
