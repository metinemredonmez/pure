'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination, Chip, Skeleton,
  Stack, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Divider, IconButton, Tabs, Tab, Alert, Avatar, Tooltip,
} from '@mui/material';
import {
  Email as EmailIcon, Close as CloseIcon, Send as SendIcon,
  History as HistoryIcon, Info as InfoIcon,
  CheckCircle as CheckIcon, Error as ErrorIcon,
  Description as TemplateIcon, Science as TestIcon,
  Campaign as CampaignIcon, DraftsOutlined as DraftIcon,
  NotificationsActive as PushIcon, Sms as SmsIcon,
  Visibility as ViewIcon, PhoneAndroid as MobileIcon,
  Cloud as CloudIcon, Wifi as WifiIcon,
} from '@mui/icons-material';
import { notificationsApi } from '@/lib/api';
import { olentiaColors } from '@/lib/theme';
import PageHeader from '@/components/common/PageHeader';
import ExportButton from '@/components/common/ExportButton';

interface NotifLog {
  id: string;
  channel: string;
  recipient: string;
  subject?: string;
  status: string;
  createdAt: string;
}

interface Template {
  id: string;
  name: string;
  subject: string;
  channel: string;
  body: string;
  isActive: boolean;
}

const channelConfig: Record<string, { label: string; color: string; icon: string }> = {
  email: { label: 'E-posta', color: '#4FC3F7', icon: '📧' },
  sms: { label: 'SMS', color: '#66BB6A', icon: '📱' },
  push: { label: 'Push', color: '#FFA726', icon: '🔔' },
  inapp: { label: 'Uygulama', color: '#AB47BC', icon: '💬' },
};

const statusColors: Record<string, 'success' | 'error' | 'warning' | 'default'> = {
  sent: 'success', SENT: 'success',
  failed: 'error', FAILED: 'error',
  pending: 'warning', PENDING: 'warning',
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function NotificationsPage() {
  const [tab, setTab] = useState(0);
  const [logs, setLogs] = useState<NotifLog[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  // Send email
  const [sendDialog, setSendDialog] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [emailForm, setEmailForm] = useState({ to: '', subject: '', html: '' });

  // Test template
  const [testDialog, setTestDialog] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testTemplate, setTestTemplate] = useState('');
  const [testSending, setTestSending] = useState(false);

  // Push bildirim
  const [pushDialog, setPushDialog] = useState(false);
  const [pushForm, setPushForm] = useState({ userId: '', title: '', message: '', type: 'info', link: '' });
  const [pushSending, setPushSending] = useState(false);

  // Template detail
  const [templateDetail, setTemplateDetail] = useState<Template | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === 0) {
        const r = await notificationsApi.getLogs({ page: page + 1, limit: 10 });
        const d = r.data || r;
        const items = Array.isArray(d) ? d : (d.data || d.items || []);
        setLogs(items);
        setTotal(d.meta?.total || items.length || 0);
      } else if (tab === 1) {
        const r = await notificationsApi.getTemplates();
        const d = r.data || r;
        setTemplates(Array.isArray(d) ? d : d.data || []);
      }
    } catch (e) {
      console.error('Bildirim verileri yuklenemedi:', e);
    } finally {
      setLoading(false);
    }
  }, [tab, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── E-posta gonder ──
  const handleSendEmail = async () => {
    setSending(true);
    setSendResult(null);
    try {
      const res = await notificationsApi.sendEmail({
        to: emailForm.to,
        subject: emailForm.subject,
        html: emailForm.html, // Backend 'html' bekliyor
      });
      const d = res.data || res;
      setSendResult({ ok: d.success !== false, msg: d.success !== false ? `E-posta gonderildi: ${emailForm.to}` : (d.error || 'Basarisiz') });
      if (d.success !== false) {
        setEmailForm({ to: '', subject: '', html: '' });
        setTimeout(() => { setSendDialog(false); setSendResult(null); fetchData(); }, 1500);
      }
    } catch (e: any) {
      setSendResult({ ok: false, msg: e?.response?.data?.message?.join?.(', ') || e?.response?.data?.message || 'Gonderim hatasi' });
    } finally {
      setSending(false);
    }
  };

  // ── Test sablonu gonder ──
  const handleTestTemplate = async () => {
    if (!testEmail || !testTemplate) return;
    setTestSending(true);
    setSendResult(null);
    try {
      await notificationsApi.sendTemplate({
        to: testEmail,
        template: testTemplate,
        variables: {
          firstName: 'Test Kullanici',
          orderNumber: 'OLN-TEST-001',
          total: '₺299,90',
          planName: 'Premium Paket',
          nextDate: '22.04.2026',
          resetLink: 'https://pureolentia.com/reset/test-token-123',
          trackingNumber: 'TR1234567890',
        },
      });
      setSendResult({ ok: true, msg: `"${testTemplate}" sablonu ${testEmail} adresine gonderildi!` });
      setTimeout(() => { setTestDialog(false); setSendResult(null); fetchData(); }, 1500);
    } catch (e: any) {
      setSendResult({ ok: false, msg: e?.response?.data?.message || 'Test gonderim hatasi' });
    } finally {
      setTestSending(false);
    }
  };

  // ── Push bildirim gonder ──
  const handleSendPush = async () => {
    setPushSending(true);
    setSendResult(null);
    try {
      await notificationsApi.sendInApp({
        userId: pushForm.userId,
        title: pushForm.title,
        message: pushForm.message,
        type: pushForm.type || 'info',
        link: pushForm.link || undefined,
      });
      setSendResult({ ok: true, msg: `Bildirim gonderildi!` });
      setPushForm({ userId: '', title: '', message: '', type: 'info', link: '' });
      setTimeout(() => { setPushDialog(false); setSendResult(null); }, 1500);
    } catch (e: any) {
      setSendResult({ ok: false, msg: e?.response?.data?.message || 'Bildirim gonderilemedi' });
    } finally {
      setPushSending(false);
    }
  };

  const sentCount = logs.filter(l => ['sent', 'SENT'].includes(l.status)).length;
  const failedCount = logs.filter(l => ['failed', 'FAILED'].includes(l.status)).length;

  return (
    <Box>
      <PageHeader
        title="Bildirim Yonetimi"
        subtitle="E-posta, push ve uygulama ici bildirimleri yonetin"
        breadcrumbs={[{ label: 'Bildirimler' }]}
        action={
          <Stack direction="row" spacing={1} alignItems="center">
            <ExportButton
              data={logs}
              columns={[
                { key: 'recipient', label: 'Alici' },
                { key: 'subject', label: 'Konu' },
                { key: 'channel', label: 'Kanal' },
                { key: 'status', label: 'Durum' },
                { key: 'createdAt', label: 'Tarih' },
              ]}
              filename="bildirimler"
            />
            <Button variant="outlined" size="small" startIcon={<TestIcon />}
              onClick={() => { setTestDialog(true); setSendResult(null); }}
              sx={{ borderColor: '#66BB6A', color: '#66BB6A' }}>
              Test
            </Button>
            <Button variant="outlined" size="small" startIcon={<PushIcon />}
              onClick={() => { setPushDialog(true); setSendResult(null); }}
              sx={{ borderColor: '#AB47BC', color: '#AB47BC' }}>
              Push
            </Button>
            <Button variant="contained" size="small" startIcon={<SendIcon />}
              onClick={() => { setSendDialog(true); setSendResult(null); }}
              sx={{ bgcolor: olentiaColors.primary.main, '&:hover': { bgcolor: olentiaColors.primary.dark } }}>
              E-posta
            </Button>
          </Stack>
        }
      />

      {/* Info */}
      <Card sx={{ mb: 3, p: 2, bgcolor: `${olentiaColors.primary.main}08`, border: `1px solid ${olentiaColors.primary.main}20` }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <InfoIcon sx={{ color: olentiaColors.primary.main, fontSize: 20 }} />
          <Box>
            <Typography variant="body2" fontWeight={600} sx={{ color: olentiaColors.primary.main }}>Bildirim Kanallari</Typography>
            <Typography variant="caption" color="text.secondary">
              E-posta (SMTP/Nodemailer) · Uygulama ici bildirim (In-App) · Push bildirim (OneSignal — Phase 2).
              Sablonlar degisken destekler. Test butonuyla gercek e-posta gonderebilirsiniz.
            </Typography>
          </Box>
        </Stack>
      </Card>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { title: 'Toplam Gonderim', value: total || logs.length, icon: <CampaignIcon />, color: '#4FC3F7' },
          { title: 'Basarili', value: sentCount, icon: <CheckIcon />, color: '#66BB6A' },
          { title: 'Basarisiz', value: failedCount, icon: <ErrorIcon />, color: '#EF5350' },
          { title: 'Sablonlar', value: templates.length, icon: <TemplateIcon />, color: '#FFA726' },
        ].map((c) => (
          <Grid key={c.title} size={{ xs: 6, md: 3 }}>
            <Card sx={{ '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 4px 20px ${c.color}15` }, transition: 'all 0.2s' }}>
              <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: `${c.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color }}>{c.icon}</Box>
                  <Box>
                    <Typography variant="h5" fontWeight={800}>{c.value}</Typography>
                    <Typography variant="caption" color="text.secondary">{c.title}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Card sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => { setTab(v); setPage(0); }} sx={{ '& .MuiTab-root': { fontWeight: 600, minHeight: 48 } }}>
          <Tab label="Gonderim Loglari" icon={<HistoryIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
          <Tab label="E-posta Sablonlari" icon={<TemplateIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
          <Tab label="Entegrasyonlar" icon={<CloudIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
        </Tabs>
      </Card>

      {/* ═══ TAB 0: LOGS ═══ */}
      {tab === 0 && (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Alici</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Konu</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Kanal</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Durum</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Tarih</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? Array.from({ length: 5 }).map((_, i) => <TableRow key={i}>{Array.from({ length: 5 }).map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}</TableRow>)
                : logs.length === 0 ? (
                  <TableRow><TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <EmailIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1.5 }} />
                    <Typography variant="h6" color="text.secondary" fontWeight={600}>Henuz bildirim gonderilmemis</Typography>
                    <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>Ustteki butonlarla ilk bildirimi gonderin.</Typography>
                  </TableCell></TableRow>
                ) : logs.map((log) => {
                  const ch = channelConfig[log.channel] || { label: log.channel, color: '#999', icon: '📨' };
                  return (
                    <TableRow key={log.id} hover>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar sx={{ width: 30, height: 30, bgcolor: `${ch.color}15`, color: ch.color, fontSize: 13 }}>
                            {log.recipient[0]?.toUpperCase()}
                          </Avatar>
                          <Typography variant="body2" fontWeight={500}>{log.recipient}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {log.subject || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={`${ch.icon} ${ch.label}`} size="small"
                          sx={{ height: 24, fontSize: 11, fontWeight: 600, bgcolor: `${ch.color}15`, color: ch.color }} />
                      </TableCell>
                      <TableCell>
                        <Chip label={log.status === 'sent' || log.status === 'SENT' ? 'Gonderildi' : log.status === 'failed' || log.status === 'FAILED' ? 'Basarisiz' : log.status}
                          size="small" color={statusColors[log.status] || 'default'} variant="outlined" sx={{ fontWeight: 600 }}
                          icon={log.status === 'sent' || log.status === 'SENT' ? <CheckIcon sx={{ fontSize: 14 }} /> : log.status === 'failed' || log.status === 'FAILED' ? <ErrorIcon sx={{ fontSize: 14 }} /> : undefined} />
                      </TableCell>
                      <TableCell><Typography variant="caption" color="text.secondary">{formatDate(log.createdAt)}</Typography></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination component="div" count={total} page={page} onPageChange={(_, p) => setPage(p)}
            rowsPerPage={10} onRowsPerPageChange={() => {}} rowsPerPageOptions={[10]} labelRowsPerPage=""
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`} />
        </Card>
      )}

      {/* ═══ TAB 1: TEMPLATES ═══ */}
      {tab === 1 && (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Sablon</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Konu</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Kanal</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Durum</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Islem</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? Array.from({ length: 4 }).map((_, i) => <TableRow key={i}>{Array.from({ length: 5 }).map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}</TableRow>)
                : templates.length === 0 ? (
                  <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <TemplateIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                    <Typography color="text.secondary">Sablon bulunamadi</Typography>
                  </TableCell></TableRow>
                ) : templates.map((t) => {
                  const ch = channelConfig[t.channel] || { label: t.channel, color: '#999', icon: '📨' };
                  return (
                    <TableRow key={t.id} hover sx={{ cursor: 'pointer' }} onClick={() => setTemplateDetail(t)}>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <DraftIcon sx={{ fontSize: 18, color: ch.color }} />
                          <Typography variant="body2" fontWeight={600}>{t.name}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell><Typography variant="body2" color="text.secondary">{t.subject || '-'}</Typography></TableCell>
                      <TableCell>
                        <Chip label={`${ch.icon} ${ch.label}`} size="small"
                          sx={{ height: 24, fontSize: 11, fontWeight: 600, bgcolor: `${ch.color}15`, color: ch.color }} />
                      </TableCell>
                      <TableCell>
                        <Chip label={t.isActive ? 'Aktif' : 'Pasif'} size="small" color={t.isActive ? 'success' : 'default'} variant="outlined" sx={{ fontWeight: 600 }} />
                      </TableCell>
                      <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                        <Tooltip title="Detay"><IconButton size="small" onClick={() => setTemplateDetail(t)}><ViewIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Test gonder">
                          <IconButton size="small" onClick={() => { setTestTemplate(t.name); setTestDialog(true); setSendResult(null); }} sx={{ color: '#66BB6A' }}>
                            <TestIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* ═══ TAB 2: ENTEGRASYONLAR ═══ */}
      {tab === 2 && (
        <Grid container spacing={2}>
          {[
            {
              name: 'SMTP E-posta',
              icon: <EmailIcon sx={{ fontSize: 28 }} />,
              status: 'Aktif',
              color: '#66BB6A',
              active: true,
              desc: 'Nodemailer ile SMTP e-posta gonderimi. Siparis onay, sifre sifirlama, hos geldiniz e-postalari otomatik gonderilir.',
              details: ['Protokol: SMTP (TLS)', 'Provider: Konfigurasyona bagli', 'Sablonlar: 6 adet aktif', 'Degisken destegi: {{variable}}'],
            },
            {
              name: 'Uygulama Ici Bildirim',
              icon: <PushIcon sx={{ fontSize: 28 }} />,
              status: 'Aktif',
              color: '#66BB6A',
              active: true,
              desc: 'Panel ici anlik bildirimler. Siparis, kargo ve sistem bildirimleri kullanici panelinde gosterilir.',
              details: ['Tip: In-App Notification', 'Depolama: PostgreSQL', 'Okundu/Okunmadi takibi', 'Filtreleme ve sayfalama'],
            },
            {
              name: 'OneSignal Push',
              icon: <MobileIcon sx={{ fontSize: 28 }} />,
              status: 'Phase 2',
              color: '#FFA726',
              active: false,
              desc: 'OneSignal ile mobil ve web push bildirimleri. Kampanya, indirim ve hatirlatma bildirimleri gonderilir.',
              details: ['SDK: @onesignal/node-onesignal', 'Platform: iOS, Android, Web', 'Segmentasyon destegi', 'A/B test destegi'],
            },
            {
              name: 'WebSocket (Canli)',
              icon: <WifiIcon sx={{ fontSize: 28 }} />,
              status: 'Phase 2',
              color: '#FFA726',
              active: false,
              desc: 'Socket.IO ile canli bildirim akisi. Siparis durumu, mesaj ve acil bildirimler aninda iletilir.',
              details: ['Protokol: WebSocket', 'Kutuphane: Socket.IO', 'Oda bazli yayinlama', 'Otomatik yeniden baglanma'],
            },
            {
              name: 'SMS Bildirim',
              icon: <SmsIcon sx={{ fontSize: 28 }} />,
              status: 'Phase 3',
              color: '#EF5350',
              active: false,
              desc: 'Twilio/Netgsm ile SMS bildirimleri. Siparis onay ve kargo bildirimleri SMS olarak gonderilir.',
              details: ['Provider: Netgsm / Twilio', 'Turkiye numara destegi', 'Toplu SMS gonderimi', 'OTP dogrulama'],
            },
            {
              name: 'Webhook',
              icon: <CloudIcon sx={{ fontSize: 28 }} />,
              status: 'Phase 3',
              color: '#EF5350',
              active: false,
              desc: 'Harici sistemlere webhook ile bildirim gonderimi. Siparis, odeme ve stok olaylari tetiklenir.',
              details: ['Metod: POST (JSON)', 'Retry: 3 deneme', 'HMAC imza dogrulama', 'Olay filtreleme'],
            },
          ].map((item) => (
            <Grid key={item.name} size={{ xs: 12, md: 6 }}>
              <Card sx={{
                height: '100%',
                border: `1px solid ${item.active ? `${item.color}30` : 'rgba(255,255,255,0.06)'}`,
                bgcolor: item.active ? `${item.color}04` : 'transparent',
                opacity: item.active ? 1 : 0.8,
                transition: 'all 0.2s',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 4px 20px ${item.color}10` },
              }}>
                <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color }}>
                        {item.icon}
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700}>{item.name}</Typography>
                        <Chip label={item.status} size="small"
                          sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: `${item.color}15`, color: item.color }} />
                      </Box>
                    </Stack>
                    {item.active && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color, boxShadow: `0 0 8px ${item.color}` }} />}
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, lineHeight: 1.5 }}>
                    {item.desc}
                  </Typography>
                  <Stack spacing={0.5}>
                    {item.details.map((d, i) => (
                      <Stack key={i} direction="row" spacing={0.5} alignItems="center">
                        <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: item.active ? item.color : 'text.disabled' }} />
                        <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>{d}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* ═══ SEND EMAIL DIALOG ═══ */}
      <Dialog open={sendDialog} onClose={() => setSendDialog(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { bgcolor: 'background.paper', backgroundImage: 'none' } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <SendIcon sx={{ color: olentiaColors.primary.main }} />
            <Typography variant="h6" fontWeight={700}>E-posta Gonder</Typography>
          </Stack>
          <IconButton onClick={() => setSendDialog(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          {sendResult && <Alert severity={sendResult.ok ? 'success' : 'error'} sx={{ mb: 2, borderRadius: 2 }}>{sendResult.msg}</Alert>}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField fullWidth label="Alici E-posta *" size="small" value={emailForm.to}
              onChange={(e) => setEmailForm({ ...emailForm, to: e.target.value })} placeholder="kullanici@ornek.com" />
            <TextField fullWidth label="Konu *" size="small" value={emailForm.subject}
              onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })} placeholder="Bildirim konusu" />
            <TextField fullWidth multiline rows={5} label="Icerik (HTML) *" size="small" value={emailForm.html}
              onChange={(e) => setEmailForm({ ...emailForm, html: e.target.value })}
              placeholder="<h2>Merhaba</h2><p>E-posta icerik...</p>"
              helperText="HTML etiketleri desteklenir: <h1>, <p>, <a>, <strong>, <ul> vb." />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setSendDialog(false)} color="inherit">Iptal</Button>
          <Button onClick={handleSendEmail} variant="contained" disabled={sending || !emailForm.to || !emailForm.subject || !emailForm.html}
            startIcon={<SendIcon />} sx={{ bgcolor: olentiaColors.primary.main, '&:hover': { bgcolor: olentiaColors.primary.dark } }}>
            {sending ? 'Gonderiliyor...' : 'Gonder'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ═══ TEST TEMPLATE DIALOG ═══ */}
      <Dialog open={testDialog} onClose={() => setTestDialog(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { bgcolor: 'background.paper', backgroundImage: 'none' } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <TestIcon sx={{ color: '#66BB6A' }} />
            <Typography variant="h6" fontWeight={700}>Test E-posta</Typography>
          </Stack>
          <IconButton onClick={() => setTestDialog(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          {sendResult && <Alert severity={sendResult.ok ? 'success' : 'error'} sx={{ mb: 2, borderRadius: 2 }}>{sendResult.msg}</Alert>}
          <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 2, borderRadius: 2 }}>
            Secilen sablonu test verilerle gonderir. Degiskenler otomatik doldurulur.
          </Alert>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField fullWidth label="Test E-posta *" size="small" value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)} placeholder="test@ornek.com" />
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Sablon Sec</Typography>
            <Stack spacing={1}>
              {(templates.length > 0 ? templates : [
                { name: 'welcome', subject: 'Hos Geldiniz' },
                { name: 'order_confirmed', subject: 'Siparis Onay' },
                { name: 'order_shipped', subject: 'Kargo' },
                { name: 'password_reset', subject: 'Sifre Sifirlama' },
                { name: 'subscription_renewed', subject: 'Abonelik' },
                { name: 'email_verification', subject: 'E-posta Dogrulama' },
              ] as any[]).map((t) => (
                <Card key={t.name} variant="outlined" onClick={() => setTestTemplate(t.name)}
                  sx={{
                    p: 1.5, cursor: 'pointer',
                    borderColor: testTemplate === t.name ? olentiaColors.primary.main : 'divider',
                    bgcolor: testTemplate === t.name ? `${olentiaColors.primary.main}08` : 'transparent',
                    '&:hover': { borderColor: olentiaColors.primary.main },
                  }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{t.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{t.subject}</Typography>
                    </Box>
                    {testTemplate === t.name && <CheckIcon sx={{ color: olentiaColors.primary.main, fontSize: 20 }} />}
                  </Stack>
                </Card>
              ))}
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setTestDialog(false)} color="inherit">Iptal</Button>
          <Button onClick={handleTestTemplate} variant="contained" disabled={testSending || !testEmail || !testTemplate}
            startIcon={<TestIcon />} sx={{ bgcolor: '#66BB6A', '&:hover': { bgcolor: '#57A55A' } }}>
            {testSending ? 'Gonderiliyor...' : 'Test Gonder'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ═══ PUSH BILDIRIM DIALOG ═══ */}
      <Dialog open={pushDialog} onClose={() => setPushDialog(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { bgcolor: 'background.paper', backgroundImage: 'none' } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <PushIcon sx={{ color: '#AB47BC' }} />
            <Typography variant="h6" fontWeight={700}>Uygulama Ici Bildirim</Typography>
          </Stack>
          <IconButton onClick={() => setPushDialog(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          {sendResult && <Alert severity={sendResult.ok ? 'success' : 'error'} sx={{ mb: 2, borderRadius: 2 }}>{sendResult.msg}</Alert>}
          <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 2, borderRadius: 2 }}>
            Belirli bir kullaniciya anlik uygulama ici bildirim gonderir. Kullanici panelinde gorunur.
          </Alert>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField fullWidth label="Kullanici ID *" size="small" value={pushForm.userId}
              onChange={(e) => setPushForm({ ...pushForm, userId: e.target.value })}
              placeholder="cuid veya kullanici ID" helperText="Kullanicilar sayfasindan ID kopyalayabilirsiniz" />
            <TextField fullWidth label="Baslik *" size="small" value={pushForm.title}
              onChange={(e) => setPushForm({ ...pushForm, title: e.target.value })} placeholder="Bildirim basligi" />
            <TextField fullWidth multiline rows={3} label="Mesaj *" size="small" value={pushForm.message}
              onChange={(e) => setPushForm({ ...pushForm, message: e.target.value })} placeholder="Bildirim icerigi..." />
            <Stack direction="row" spacing={2}>
              <TextField fullWidth label="Tip" size="small" value={pushForm.type}
                onChange={(e) => setPushForm({ ...pushForm, type: e.target.value })} placeholder="info / order / promo" />
              <TextField fullWidth label="Link (opsiyonel)" size="small" value={pushForm.link}
                onChange={(e) => setPushForm({ ...pushForm, link: e.target.value })} placeholder="/orders/123" />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setPushDialog(false)} color="inherit">Iptal</Button>
          <Button onClick={handleSendPush} variant="contained" disabled={pushSending || !pushForm.userId || !pushForm.title || !pushForm.message}
            startIcon={<PushIcon />} sx={{ bgcolor: '#AB47BC', '&:hover': { bgcolor: '#9C27B0' } }}>
            {pushSending ? 'Gonderiliyor...' : 'Bildirim Gonder'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ═══ TEMPLATE DETAIL DIALOG ═══ */}
      <Dialog open={!!templateDetail} onClose={() => setTemplateDetail(null)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { bgcolor: 'background.paper', backgroundImage: 'none' } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <TemplateIcon sx={{ color: '#FFA726' }} />
            <Box>
              <Typography variant="h6" fontWeight={700}>{templateDetail?.name}</Typography>
              <Typography variant="caption" color="text.secondary">Sablon Detayi</Typography>
            </Box>
          </Stack>
          <IconButton onClick={() => setTemplateDetail(null)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          {templateDetail && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 6 }}>
                  <Card variant="outlined" sx={{ p: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">Konu</Typography>
                    <Typography variant="body2" fontWeight={600}>{templateDetail.subject || '-'}</Typography>
                  </Card>
                </Grid>
                <Grid size={{ xs: 3 }}>
                  <Card variant="outlined" sx={{ p: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">Kanal</Typography>
                    <Typography variant="body2" fontWeight={600}>{channelConfig[templateDetail.channel]?.label || templateDetail.channel}</Typography>
                  </Card>
                </Grid>
                <Grid size={{ xs: 3 }}>
                  <Card variant="outlined" sx={{ p: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">Durum</Typography>
                    <Chip label={templateDetail.isActive ? 'Aktif' : 'Pasif'} size="small" color={templateDetail.isActive ? 'success' : 'default'} variant="outlined" sx={{ mt: 0.5 }} />
                  </Card>
                </Grid>
              </Grid>
              <Box>
                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>HTML Icerik</Typography>
                <Card variant="outlined" sx={{ p: 2, mt: 0.5, maxHeight: 250, overflow: 'auto', bgcolor: 'rgba(0,0,0,0.2)' }}>
                  <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', fontSize: 11, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                    {templateDetail.body}
                  </Typography>
                </Card>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setTemplateDetail(null)} color="inherit">Kapat</Button>
          <Button variant="outlined" startIcon={<TestIcon />}
            onClick={() => { setTemplateDetail(null); setTestTemplate(templateDetail?.name || ''); setTestDialog(true); setSendResult(null); }}
            sx={{ borderColor: '#66BB6A', color: '#66BB6A' }}>
            Test Gonder
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
