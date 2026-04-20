'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardHeader, CardContent, Grid, TextField, Button,
  Select, MenuItem, InputLabel, FormControl, Chip, Alert, Stack, Divider,
  CircularProgress, Table, TableHead, TableRow, TableCell, TableBody,
} from '@mui/material';
import { Campaign as CampaignIcon, Send as SendIcon, PeopleAlt as AudienceIcon, History as HistoryIcon } from '@mui/icons-material';
import PageHeader from '@/components/common/PageHeader';
import { api } from '@/lib/api';

type Audience = 'ALL' | 'CUSTOMERS' | 'SUBSCRIBERS' | 'MANUAL';
type Channel = 'EMAIL' | 'PUSH';

const AUDIENCE_LABELS: Record<Audience, string> = {
  ALL: 'Tum Kullanicilar',
  CUSTOMERS: 'Musteriler (siparis vermis)',
  SUBSCRIBERS: 'Aboneler (aktif abonelik)',
  MANUAL: 'Manuel Liste',
};

const CHANNEL_LABELS: Record<Channel, string> = {
  EMAIL: 'E-posta',
  PUSH: 'Push Bildirim',
};

function unwrap(d: any): any {
  let c = d;
  for (let i = 0; i < 3; i++) {
    if (c && typeof c === 'object' && 'data' in c && (c.success !== undefined || typeof c.data === 'object')) {
      c = c.data;
    } else break;
  }
  return c;
}

export default function BroadcastsPage() {
  const [audience, setAudience] = useState<Audience>('ALL');
  const [channel, setChannel] = useState<Channel>('EMAIL');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [manualEmailsText, setManualEmailsText] = useState('');
  const [preview, setPreview] = useState<{ count: number; sample: string[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  const manualEmails = manualEmailsText
    .split(/[\n,;]/)
    .map((e) => e.trim())
    .filter(Boolean);

  const loadHistory = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/broadcasts/history?limit=30');
      setHistory(unwrap(data) || []);
    } catch {
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const previewAudience = async () => {
    setError(null);
    try {
      const { data } = await api.post('/admin/broadcasts/preview', { audience, manualEmails });
      setPreview(unwrap(data));
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Onizleme basarisiz');
    }
  };

  const send = async () => {
    setError(null);
    setResult(null);
    if (!subject.trim()) return setError('Konu zorunludur');
    if (!body.trim()) return setError('Icerik zorunludur');
    if (audience === 'MANUAL' && manualEmails.length === 0) return setError('Manuel e-posta listesi bos');

    if (!confirm(`${preview?.count || '?'} aliciya gonderilecek. Emin misiniz?`)) return;

    setLoading(true);
    try {
      const { data } = await api.post('/admin/broadcasts/send', {
        audience, channel, subject, body, manualEmails: audience === 'MANUAL' ? manualEmails : undefined,
      });
      setResult(unwrap(data));
      loadHistory();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Gonderim basarisiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Toplu Mesaj Gonderimi"
        subtitle="Musterilere toplu e-posta veya push bildirim gonderin"
        icon={<CampaignIcon />}
      />

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Left: compose form */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardHeader title="Mesaj Olustur" titleTypographyProps={{ fontSize: 15, fontWeight: 600 }} />
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Hedef Kitle</InputLabel>
                    <Select
                      value={audience}
                      label="Hedef Kitle"
                      onChange={(e) => { setAudience(e.target.value as Audience); setPreview(null); }}
                    >
                      {Object.entries(AUDIENCE_LABELS).map(([v, l]) => (
                        <MenuItem key={v} value={v}>{l}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Kanal</InputLabel>
                    <Select
                      value={channel}
                      label="Kanal"
                      onChange={(e) => setChannel(e.target.value as Channel)}
                    >
                      {Object.entries(CHANNEL_LABELS).map(([v, l]) => (
                        <MenuItem key={v} value={v}>{l}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {audience === 'MANUAL' && (
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth multiline rows={4} size="small"
                      label="E-posta Listesi (her satira bir adres veya virgulle ayir)"
                      value={manualEmailsText}
                      onChange={(e) => { setManualEmailsText(e.target.value); setPreview(null); }}
                      placeholder="ornek1@email.com&#10;ornek2@email.com"
                    />
                    <Typography variant="caption" color="text.secondary">
                      {manualEmails.length} adres girildi
                    </Typography>
                  </Grid>
                )}

                <Grid size={{ xs: 12 }}>
                  <Button
                    startIcon={<AudienceIcon />}
                    variant="outlined" size="small"
                    onClick={previewAudience}
                  >
                    Hedef Kitleyi Hesapla
                  </Button>
                  {preview && (
                    <Chip
                      label={`${preview.count} alici bulundu`}
                      color="primary" size="small"
                      sx={{ ml: 1.5 }}
                    />
                  )}
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth size="small"
                    label="Konu / Baslik"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    inputProps={{ maxLength: 300 }}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth multiline rows={10} size="small"
                    label={channel === 'EMAIL' ? 'Icerik (HTML destekli)' : 'Icerik (duz metin)'}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder={channel === 'EMAIL'
                      ? '<h2>Merhaba!</h2><p>Yeni kahve partimiz geldi...</p>'
                      : 'Yeni urunler magazamizda! Hemen goz atin.'
                    }
                  />
                  <Typography variant="caption" color="text.secondary">
                    {channel === 'EMAIL' ? 'HTML etiketleri kullanabilirsiniz (h1, h2, p, a, img vb.)' : 'Push bildirimler duz metin olarak gonderilir'}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ my: 1 }} />
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Button
                      variant="contained" color="primary" size="medium"
                      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                      onClick={send}
                      disabled={loading || !subject.trim() || !body.trim()}
                    >
                      {loading ? 'Gonderiliyor...' : 'Simdi Gonder'}
                    </Button>
                    <Typography variant="caption" color="text.secondary">
                      Gonderim islemi geri alinamaz
                    </Typography>
                  </Stack>
                </Grid>

                {error && (
                  <Grid size={{ xs: 12 }}>
                    <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
                  </Grid>
                )}

                {result && (
                  <Grid size={{ xs: 12 }}>
                    <Alert severity="success">
                      <strong>Gonderim tamamlandi:</strong> {result.sent} basarili, {result.failed} hata
                      {result.errors?.length > 0 && (
                        <Box sx={{ mt: 1, fontSize: 11 }}>
                          Hatalar: {result.errors.map((e: any) => e.email).join(', ')}
                        </Box>
                      )}
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Right: preview + tips */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardHeader title="Ozet & Onizleme" titleTypographyProps={{ fontSize: 15, fontWeight: 600 }} />
            <CardContent>
              <Stack spacing={1.5}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Hedef</Typography>
                  <Typography variant="body2" fontWeight={600}>{AUDIENCE_LABELS[audience]}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Kanal</Typography>
                  <Typography variant="body2" fontWeight={600}>{CHANNEL_LABELS[channel]}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Alici Sayisi</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {preview ? preview.count : '— (hesaplanmadi)'}
                  </Typography>
                </Box>
                {preview?.sample && preview.sample.length > 0 && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Ornek Aliciler</Typography>
                    {preview.sample.map((e) => (
                      <Typography key={e} variant="caption" sx={{ display: 'block', fontFamily: 'monospace' }}>
                        {e}
                      </Typography>
                    ))}
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardHeader title="Ipuclari" titleTypographyProps={{ fontSize: 14, fontWeight: 600 }} />
            <CardContent>
              <Typography variant="caption" component="div" sx={{ mb: 1 }}>
                • E-posta icin SMTP ayarlari <strong>Entegrasyonlar</strong> sayfasinda olmali
              </Typography>
              <Typography variant="caption" component="div" sx={{ mb: 1 }}>
                • Konu kisa ve ilgi cekici olsun (max 60 karakter onerilir)
              </Typography>
              <Typography variant="caption" component="div" sx={{ mb: 1 }}>
                • Test icin once MANUEL hedef ile kendinize gonderin
              </Typography>
              <Typography variant="caption" component="div">
                • Gonderim geri alinamaz — iceriği dikkatlice kontrol edin
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* History */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader
              title="Son Gonderimler"
              titleTypographyProps={{ fontSize: 15, fontWeight: 600 }}
              avatar={<HistoryIcon fontSize="small" />}
            />
            <CardContent sx={{ pt: 0 }}>
              {history.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                  Henuz gonderim yok
                </Typography>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Tarih</TableCell>
                      <TableCell>Kanal</TableCell>
                      <TableCell>Alici</TableCell>
                      <TableCell>Konu</TableCell>
                      <TableCell>Durum</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {history.slice(0, 30).map((row: any) => (
                      <TableRow key={row.id}>
                        <TableCell>{new Date(row.createdAt).toLocaleString('tr-TR')}</TableCell>
                        <TableCell>{row.channel}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: 11 }}>{row.recipient}</TableCell>
                        <TableCell>{row.subject}</TableCell>
                        <TableCell>
                          <Chip
                            label={row.status}
                            size="small"
                            color={row.status === 'sent' ? 'success' : row.status === 'failed' ? 'error' : 'default'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
