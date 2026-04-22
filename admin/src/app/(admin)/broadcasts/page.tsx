'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardHeader, CardContent, Grid, TextField, Button,
  Select, MenuItem, InputLabel, FormControl, Chip, Alert, Stack, Divider,
  CircularProgress, Table, TableHead, TableRow, TableCell, TableBody,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Paper,
  Collapse, Tooltip, LinearProgress,
} from '@mui/material';
import {
  Campaign as CampaignIcon, Send as SendIcon, PeopleAlt as AudienceIcon,
  History as HistoryIcon, CheckCircle as CheckIcon, Error as ErrorIcon,
  Email as EmailIcon, Notifications as PushIcon, Close as CloseIcon,
  WarningAmber as WarningIcon, ExpandMore as ExpandMoreIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import PageHeader from '@/components/common/PageHeader';
import { api } from '@/lib/api';

type Audience = 'ALL' | 'CUSTOMERS' | 'SUBSCRIBERS' | 'MANUAL';
type Channel = 'EMAIL' | 'PUSH';

const AUDIENCE_LABELS: Record<Audience, string> = {
  ALL: 'Tüm Kullanıcılar',
  CUSTOMERS: 'Müşteriler (sipariş vermiş)',
  SUBSCRIBERS: 'Aboneler (aktif abonelik)',
  MANUAL: 'Manuel Liste',
};

const CHANNEL_LABELS: Record<Channel, string> = {
  EMAIL: 'E-posta',
  PUSH: 'Push Bildirim',
};

const ERROR_HINTS: Record<string, { title: string; detail: string; action?: string }> = {
  'onesignal-broadcast': {
    title: 'OneSignal gönderimi başarısız',
    detail: 'OneSignal isteği reddetti. Aşağıdaki orijinal hata mesajına bakın.',
    action: 'Entegrasyonlar → OneSignal ayarlarını kontrol edin (App ID + REST API Key).',
  },
  'onesignal-not-configured': {
    title: 'OneSignal yapılandırılmamış',
    detail: 'App ID veya API Key tanımlı değil.',
    action: 'Entegrasyonlar → OneSignal bölümünden ekleyin.',
  },
  'smtp-not-configured': {
    title: 'SMTP yapılandırılmamış',
    detail: 'E-posta sunucu ayarları boş.',
    action: 'Entegrasyonlar → SMTP bölümünden tanımlayın.',
  },
  'smtp-send-failed': {
    title: 'E-posta gönderimi başarısız',
    detail: 'SMTP kimlik doğrulaması veya sunucu erişimi başarısız.',
    action: 'SMTP kullanıcı/parola ve port ayarlarını doğrulayın.',
  },
  'no-recipients': {
    title: 'Alıcı bulunamadı',
    detail: 'Hedef kitle boş.',
  },
};

// Map raw OneSignal / provider error messages to user-friendly explanations
function classifyRawError(raw: string): { title: string; detail: string; action?: string } | null {
  const r = raw.toLowerCase();
  if (r.includes('not subscribed') || r.includes('included players are not')) {
    return {
      title: 'Hiç aktif push abonesi yok',
      detail: 'Sistemde kayıtlı kullanıcılar push bildirimine izin vermemiş ya da abonelikleri pasif. OneSignal sadece push iznini onaylamış cihazlara gönderim yapar.',
      action: 'Test için: bir tarayıcıda siteyi açın, push izin penceresini onaylayın. Sonra "Manuel" hedefle değil "Tüm Kullanıcılar" ile tekrar gönderin.',
    };
  }
  if (r.includes('invalid_player_ids') || r.includes('invalid playerids')) {
    return {
      title: 'Player ID listesi geçersiz',
      detail: 'OneSignal hedef cihazları tanımıyor.',
      action: 'OneSignal panelinde abone listesini kontrol edin.',
    };
  }
  if (r.includes('rate limit')) {
    return {
      title: 'Hız limiti aşıldı',
      detail: 'OneSignal kısa sürede çok istek aldığını söylüyor.',
      action: 'Birkaç dakika bekleyin ve tekrar deneyin.',
    };
  }
  if (r.includes('app_id') || r.includes('app id')) {
    return {
      title: 'OneSignal App ID hatalı',
      detail: 'Entegrasyon ayarındaki App ID OneSignal panelindekiyle eşleşmiyor.',
      action: 'Entegrasyonlar → OneSignal bölümünden App ID değerini doğrulayın.',
    };
  }
  if (r.includes('rest api') || r.includes('unauthorized') || r.includes('401') || r.includes('403')) {
    return {
      title: 'OneSignal yetkisiz',
      detail: 'REST API Key geçersiz ya da yanlış key kullanılıyor.',
      action: 'OneSignal → Settings → Keys & IDs → REST API Key değerini güncelleyin.',
    };
  }
  return null;
}

function unwrap(d: any): any {
  let c = d;
  for (let i = 0; i < 3; i++) {
    if (c && typeof c === 'object' && 'data' in c && (c.success !== undefined || typeof c.data === 'object')) {
      c = c.data;
    } else break;
  }
  return c;
}

function humanizeError(code: string, raw?: string): { title: string; detail: string; action?: string } {
  // First try mapping the raw OneSignal/SMTP error text — it's most specific
  if (raw) {
    const cls = classifyRawError(raw);
    if (cls) return cls;
  }
  // Fall back to the code-level hint
  if (ERROR_HINTS[code]) return ERROR_HINTS[code];
  return { title: code, detail: raw || 'Detay yok.' };
}

export default function BroadcastsPage() {
  const [audience, setAudience] = useState<Audience>('ALL');
  const [channel, setChannel] = useState<Channel>('EMAIL');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [manualEmailsText, setManualEmailsText] = useState('');
  const [preview, setPreview] = useState<{ count: number; sample: string[] } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

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
    setPreviewLoading(true);
    try {
      const { data } = await api.post('/admin/broadcasts/preview', { audience, manualEmails });
      setPreview(unwrap(data));
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Önizleme başarısız');
    } finally {
      setPreviewLoading(false);
    }
  };

  const validate = (): string | null => {
    if (!subject.trim()) return 'Konu zorunludur';
    if (!body.trim()) return 'İçerik zorunludur';
    if (audience === 'MANUAL' && manualEmails.length === 0) return 'Manuel e-posta listesi boş';
    return null;
  };

  const handleSendClick = () => {
    setError(null);
    setResult(null);
    const err = validate();
    if (err) { setError(err); return; }
    setConfirmOpen(true);
  };

  const doSend = async () => {
    setConfirmOpen(false);
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const { data } = await api.post('/admin/broadcasts/send', {
        audience, channel, subject, body,
        manualEmails: audience === 'MANUAL' ? manualEmails : undefined,
      });
      setResult(unwrap(data));
      loadHistory();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Gönderim başarısız');
    } finally {
      setLoading(false);
    }
  };

  const totalAttempts = result ? (result.sent || 0) + (result.failed || 0) : 0;
  const successRate = totalAttempts > 0 ? Math.round(((result?.sent || 0) / totalAttempts) * 100) : 0;

  // Group errors by raw message (most informative) — collect emails per group.
  // Backend may send {email, error} where 'email' can be a synthetic marker
  // like "onesignal-broadcast" rather than a real address.
  const groupedErrors: Record<string, { rawCode: string; emails: string[] }> = {};
  if (result?.errors?.length) {
    result.errors.forEach((e: any) => {
      const rawMsg = String(e.error || e.reason || e.message || '').trim();
      const codeMarker = String(e.email || e.code || 'unknown');
      const isSyntheticMarker = codeMarker.includes('-') && !codeMarker.includes('@');
      const key = rawMsg || codeMarker;
      if (!groupedErrors[key]) groupedErrors[key] = { rawCode: codeMarker, emails: [] };
      if (!isSyntheticMarker && codeMarker) groupedErrors[key].emails.push(codeMarker);
    });
  }

  return (
    <Box>
      <PageHeader
        title="Toplu Mesaj Gönderimi"
        subtitle="Müşterilere toplu e-posta veya push bildirim gönderin"
        icon={<CampaignIcon />}
      />

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Left: compose form */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardHeader title="Mesaj Oluştur" titleTypographyProps={{ fontSize: 15, fontWeight: 600 }} />
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
                      renderValue={(v) => (
                        <Stack direction="row" spacing={1} alignItems="center">
                          {v === 'EMAIL' ? <EmailIcon fontSize="small" /> : <PushIcon fontSize="small" />}
                          <span>{CHANNEL_LABELS[v as Channel]}</span>
                        </Stack>
                      )}
                    >
                      <MenuItem value="EMAIL">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <EmailIcon fontSize="small" /><span>E-posta</span>
                        </Stack>
                      </MenuItem>
                      <MenuItem value="PUSH">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <PushIcon fontSize="small" /><span>Push Bildirim</span>
                        </Stack>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {audience === 'MANUAL' && (
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth multiline rows={4} size="small"
                      label="E-posta Listesi (her satıra bir adres veya virgülle ayır)"
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
                  <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
                    <Button
                      startIcon={previewLoading ? <CircularProgress size={14} /> : <AudienceIcon />}
                      variant="outlined" size="small"
                      onClick={previewAudience}
                      disabled={previewLoading}
                    >
                      Hedef Kitleyi Hesapla
                    </Button>
                    {preview && (
                      <Chip
                        icon={<CheckIcon sx={{ fontSize: 16 }} />}
                        label={`${preview.count.toLocaleString('tr-TR')} alıcı`}
                        color="primary" size="small" variant="outlined"
                      />
                    )}
                  </Stack>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth size="small"
                    label="Konu / Başlık"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    inputProps={{ maxLength: 300 }}
                    helperText={`${subject.length} / 300 karakter`}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth multiline rows={10} size="small"
                    label={channel === 'EMAIL' ? 'İçerik (HTML destekli)' : 'İçerik (düz metin)'}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder={channel === 'EMAIL'
                      ? '<h2>Merhaba!</h2><p>Yeni kahve partimiz geldi...</p>'
                      : 'Yeni ürünler mağazamızda! Hemen göz atın.'
                    }
                  />
                  <Typography variant="caption" color="text.secondary">
                    {channel === 'EMAIL' ? 'HTML etiketleri kullanabilirsiniz (h1, h2, p, a, img vb.)' : 'Push bildirimler düz metin olarak gönderilir'}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ my: 1 }} />
                  {(() => {
                    const missing: string[] = [];
                    if (!subject.trim()) missing.push('Konu');
                    if (!body.trim()) missing.push('İçerik');
                    if (audience === 'MANUAL' && manualEmails.length === 0) missing.push('Manuel liste');
                    const disabled = loading || missing.length > 0;
                    return (
                      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
                        <Tooltip title={missing.length ? `Eksik alanlar: ${missing.join(', ')}` : ''} arrow>
                          <span>
                            <Button
                              variant="contained" color="primary" size="medium"
                              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                              onClick={handleSendClick}
                              disabled={disabled}
                            >
                              {loading ? 'Gönderiliyor...' : 'Şimdi Gönder'}
                            </Button>
                          </span>
                        </Tooltip>
                        {missing.length > 0 ? (
                          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                            {missing.map((m) => (
                              <Chip key={m} label={`Eksik: ${m}`} size="small" color="warning" variant="outlined" />
                            ))}
                          </Stack>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Gönderim işlemi geri alınamaz
                          </Typography>
                        )}
                      </Stack>
                    );
                  })()}
                </Grid>

                {error && (
                  <Grid size={{ xs: 12 }}>
                    <Alert severity="error" onClose={() => setError(null)} icon={<ErrorIcon />}>
                      {error}
                    </Alert>
                  </Grid>
                )}

                {/* RESULT — rich summary */}
                {result && (
                  <Grid size={{ xs: 12 }}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2.5,
                        borderColor: result.failed > 0 ? 'warning.main' : 'success.main',
                        bgcolor: result.failed > 0 ? 'warning.50' : 'success.50',
                        '&.MuiPaper-root': { borderRadius: 2 },
                      }}
                    >
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                        {result.failed > 0 ? (
                          <WarningIcon sx={{ color: 'warning.main', fontSize: 28 }} />
                        ) : (
                          <CheckIcon sx={{ color: 'success.main', fontSize: 28 }} />
                        )}
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2" fontWeight={700}>
                            Gönderim Tamamlandı
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {totalAttempts.toLocaleString('tr-TR')} alıcıya gönderim denendi · Başarı oranı %{successRate}
                          </Typography>
                        </Box>
                        <IconButton size="small" onClick={() => setResult(null)}>
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Stack>

                      <LinearProgress
                        variant="determinate"
                        value={successRate}
                        sx={{
                          height: 8, borderRadius: 4, mb: 2,
                          bgcolor: 'rgba(0,0,0,0.08)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: result.failed > 0 ? 'warning.main' : 'success.main',
                          },
                        }}
                      />

                      <Grid container spacing={1.5}>
                        <Grid size={{ xs: 6 }}>
                          <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', bgcolor: 'background.paper' }}>
                            <Typography variant="h5" fontWeight={700} color="success.main">
                              {(result.sent || 0).toLocaleString('tr-TR')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Başarılı
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', bgcolor: 'background.paper' }}>
                            <Typography variant="h5" fontWeight={700} color={result.failed > 0 ? 'error.main' : 'text.disabled'}>
                              {(result.failed || 0).toLocaleString('tr-TR')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Hata
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>

                      {/* Grouped errors with human hints */}
                      {Object.keys(groupedErrors).length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Button
                            size="small"
                            onClick={() => setShowErrors((s) => !s)}
                            endIcon={<ExpandMoreIcon sx={{ transform: showErrors ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />}
                            sx={{ textTransform: 'none' }}
                          >
                            Hata Detayları ({Object.keys(groupedErrors).length} farklı sebep)
                          </Button>
                          <Collapse in={showErrors} sx={{ mt: 1 }}>
                            <Stack spacing={1.5}>
                              {Object.entries(groupedErrors).map(([rawMsg, info]) => {
                                const human = humanizeError(info.rawCode, rawMsg);
                                return (
                                  <Paper
                                    key={rawMsg}
                                    variant="outlined"
                                    sx={{
                                      p: 2,
                                      bgcolor: 'background.paper',
                                      borderColor: 'error.light',
                                    }}
                                  >
                                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                                      <ErrorIcon sx={{ color: 'error.main', fontSize: 20, mt: 0.25 }} />
                                      <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography variant="subtitle2" fontWeight={700} sx={{ color: 'error.main' }}>
                                          {human.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.5 }}>
                                          {human.detail}
                                        </Typography>
                                        {human.action && (
                                          <Box
                                            sx={{
                                              mt: 1.25,
                                              p: 1.25,
                                              bgcolor: 'info.50',
                                              border: '1px solid',
                                              borderColor: 'info.light',
                                              borderRadius: 1,
                                              display: 'flex',
                                              gap: 1,
                                              alignItems: 'flex-start',
                                            }}
                                          >
                                            <Typography variant="caption" sx={{ color: 'info.main', fontWeight: 700, lineHeight: 1.6 }}>
                                              ÇÖZÜM
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'text.primary', lineHeight: 1.6 }}>
                                              {human.action}
                                            </Typography>
                                          </Box>
                                        )}
                                        {/* Original raw error message — collapsible mono */}
                                        <Box
                                          component="details"
                                          sx={{
                                            mt: 1.25,
                                            '& summary': {
                                              cursor: 'pointer',
                                              fontSize: 11,
                                              color: 'text.disabled',
                                              userSelect: 'none',
                                            },
                                          }}
                                        >
                                          <summary>Orijinal hata mesajı</summary>
                                          <Box
                                            sx={{
                                              mt: 0.75,
                                              p: 1,
                                              bgcolor: 'action.hover',
                                              borderRadius: 1,
                                              fontFamily: 'monospace',
                                              fontSize: 11,
                                              wordBreak: 'break-word',
                                            }}
                                          >
                                            <strong>{info.rawCode}</strong>: {rawMsg}
                                          </Box>
                                        </Box>
                                        {info.emails.length > 0 && (
                                          <Box sx={{ mt: 1.25 }}>
                                            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                                              Etkilenen alıcılar ({info.emails.length})
                                            </Typography>
                                            <Box
                                              sx={{
                                                maxHeight: 120,
                                                overflow: 'auto',
                                                bgcolor: 'action.hover',
                                                p: 1,
                                                borderRadius: 1,
                                                fontFamily: 'monospace',
                                                fontSize: 11,
                                              }}
                                            >
                                              {info.emails.slice(0, 50).join(', ')}
                                              {info.emails.length > 50 && ` ... +${info.emails.length - 50} daha`}
                                            </Box>
                                          </Box>
                                        )}
                                      </Box>
                                    </Stack>
                                  </Paper>
                                );
                              })}
                            </Stack>
                          </Collapse>
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Right: preview + tips */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardHeader title="Özet & Önizleme" titleTypographyProps={{ fontSize: 15, fontWeight: 600 }} />
            <CardContent>
              <Stack spacing={1.5}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Hedef</Typography>
                  <Typography variant="body2" fontWeight={600}>{AUDIENCE_LABELS[audience]}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Kanal</Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {channel === 'EMAIL' ? <EmailIcon fontSize="small" /> : <PushIcon fontSize="small" />}
                    <Typography variant="body2" fontWeight={600}>{CHANNEL_LABELS[channel]}</Typography>
                  </Stack>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Alıcı Sayısı</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {preview ? `${preview.count.toLocaleString('tr-TR')} kişi` : '— (hesaplanmadı)'}
                  </Typography>
                </Box>
                {preview?.sample && preview.sample.length > 0 && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Örnek Alıcılar</Typography>
                    {preview.sample.slice(0, 5).map((e) => (
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
            <CardHeader title="İpuçları" titleTypographyProps={{ fontSize: 14, fontWeight: 600 }} />
            <CardContent>
              <Typography variant="caption" component="div" sx={{ mb: 1 }}>
                • E-posta için SMTP ayarları <strong>Entegrasyonlar</strong> sayfasında olmalı
              </Typography>
              <Typography variant="caption" component="div" sx={{ mb: 1 }}>
                • Push için <strong>OneSignal</strong> App ID + API Key gerekli
              </Typography>
              <Typography variant="caption" component="div" sx={{ mb: 1 }}>
                • Konu kısa ve ilgi çekici olsun (max 60 karakter önerilir)
              </Typography>
              <Typography variant="caption" component="div" sx={{ mb: 1 }}>
                • Test için önce MANUEL hedef ile kendinize gönderin
              </Typography>
              <Typography variant="caption" component="div">
                • Gönderim geri alınamaz — içeriği dikkatle kontrol edin
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* History */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader
              title="Son Gönderimler"
              titleTypographyProps={{ fontSize: 15, fontWeight: 600 }}
              avatar={<HistoryIcon fontSize="small" />}
            />
            <CardContent sx={{ pt: 0 }}>
              {history.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <HistoryIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Henüz gönderim yok
                  </Typography>
                </Box>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Tarih</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Kanal</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Alıcı</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Konu</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Durum</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {history.slice(0, 30).map((row: any) => (
                      <TableRow key={row.id} hover>
                        <TableCell sx={{ fontSize: 12 }}>
                          {new Date(row.createdAt).toLocaleString('tr-TR', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={0.75} alignItems="center">
                            {row.channel === 'email' || row.channel === 'EMAIL' ? (
                              <EmailIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            ) : (
                              <PushIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            )}
                            <Typography variant="caption" sx={{ textTransform: 'lowercase' }}>{row.channel}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: 11, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <Tooltip title={row.recipient || ''}>
                            <span>{row.recipient}</span>
                          </Tooltip>
                        </TableCell>
                        <TableCell sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <Tooltip title={row.subject || ''}>
                            <span>{row.subject}</span>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={row.status === 'sent' ? 'Gönderildi' : row.status === 'failed' ? 'Başarısız' : row.status}
                            size="small"
                            color={row.status === 'sent' ? 'success' : row.status === 'failed' ? 'error' : 'default'}
                            variant="outlined"
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

      {/* Confirm dialog — replaces native confirm() */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          <Typography variant="h6" fontWeight={700}>Gönderim Onayı</Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.5}>
            <Typography variant="body2">
              Bu işlem <strong>geri alınamaz</strong>. Gönderim bilgilerini kontrol edin:
            </Typography>
            <Paper variant="outlined" sx={{ p: 1.5 }}>
              <Stack spacing={0.75}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">Kanal</Typography>
                  <Typography variant="caption" fontWeight={600}>{CHANNEL_LABELS[channel]}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">Hedef</Typography>
                  <Typography variant="caption" fontWeight={600}>{AUDIENCE_LABELS[audience]}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">Alıcı</Typography>
                  <Typography variant="caption" fontWeight={600}>
                    {preview ? `${preview.count.toLocaleString('tr-TR')} kişi` : '(hesaplanmadı)'}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">Konu</Typography>
                  <Typography variant="caption" fontWeight={600} sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {subject}
                  </Typography>
                </Stack>
              </Stack>
            </Paper>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmOpen(false)} color="inherit">Vazgeç</Button>
          <Button onClick={doSend} variant="contained" color="primary" startIcon={<SendIcon />}>
            Gönder
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
