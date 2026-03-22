'use client';

import { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Button, TextField, Skeleton,
  Stack, Divider, Chip, Alert, IconButton,
} from '@mui/material';
import {
  SmartToy as AIIcon, Refresh as RefreshIcon, Send as SendIcon,
  Info as InfoIcon, TrendingUp as TrendIcon, Warning as WarningIcon,
  CalendarToday as CalendarIcon, Insights as InsightIcon,
  ShoppingCart as OrderIcon, People as PeopleIcon,
  Inventory as ProductIcon, Business as B2BIcon,
  Subscriptions as SubIcon,
} from '@mui/icons-material';
import { aiApi } from '@/lib/api';
import { olentiaColors } from '@/lib/theme';
import PageHeader from '@/components/common/PageHeader';

interface DailyReport {
  date: string;
  summary: string;
  metrics: {
    totalOrders: number;
    totalRevenue: number;
    newCustomers: number;
    activeSubscriptions: number;
    b2bLeads: number;
    topProducts: { name: string; count: number }[];
    conversionRate: number;
  };
  insights: string[];
  alerts: string[];
  calendarEvents: { time: string; event: string }[];
}

function formatCurrency(n: number | string | null | undefined) {
  const num = typeof n === 'string' ? parseFloat(n) : Number(n);
  if (isNaN(num)) return '₺0';
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(num);
}

export default function AIReportsPage() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<DailyReport | null>(null);
  const [reportError, setReportError] = useState('');
  const [query, setQuery] = useState('');
  const [queryResult, setQueryResult] = useState('');
  const [querying, setQuerying] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    setReportError('');
    try {
      const r = await aiApi.getDailyReport();
      const d = r.data || r;
      if (d && d.summary) {
        setReport(d);
      } else {
        setReport(d);
      }
    } catch {
      setReportError('Rapor yuklenemedi. Lutfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuery = async () => {
    if (!query.trim()) return;
    setQuerying(true);
    setQueryResult('');
    try {
      const r = await aiApi.query(query);
      const d = r.data || r;
      setQueryResult(d.answer || d.result || JSON.stringify(d));
    } catch {
      setQueryResult('Sorgu calistirilamadi. Lutfen tekrar deneyin.');
    } finally {
      setQuerying(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="AI Raporlar"
        subtitle="Yapay zeka destekli analiz ve raporlama"
        breadcrumbs={[{ label: 'AI Raporlar' }]}
      />

      {/* Info */}
      <Card sx={{ mb: 3, p: 2, bgcolor: `${olentiaColors.primary.main}08`, border: `1px solid ${olentiaColors.primary.main}20` }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <InfoIcon sx={{ color: olentiaColors.primary.main, fontSize: 20 }} />
          <Box>
            <Typography variant="body2" fontWeight={600} sx={{ color: olentiaColors.primary.main }}>AI Analiz Motoru</Typography>
            <Typography variant="caption" color="text.secondary">
              Gunluk rapor mevcut verilerden otomatik olusturulur. Dogal dil sorgusu Phase 2&apos;de LangChain ile aktif olacaktir.
            </Typography>
          </Box>
        </Stack>
      </Card>

      <Grid container spacing={2.5}>
        {/* ═══ GUNLUK RAPOR ═══ */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: `${olentiaColors.primary.main}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AIIcon sx={{ color: olentiaColors.primary.main, fontSize: 20 }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>Gunluk Rapor</Typography>
                    <Typography variant="caption" color="text.disabled">Otomatik olusturulan ozet</Typography>
                  </Box>
                </Stack>
                <Button variant="outlined" size="small" startIcon={<RefreshIcon />}
                  onClick={fetchReport} disabled={loading}
                  sx={{ borderColor: olentiaColors.primary.main, color: olentiaColors.primary.main }}>
                  {loading ? 'Yukleniyor...' : 'Olustur'}
                </Button>
              </Stack>

              {reportError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{reportError}</Alert>}

              {loading ? (
                <Stack spacing={1.5}>
                  {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} height={24} />)}
                </Stack>
              ) : report ? (
                <Stack spacing={2}>
                  {/* Summary */}
                  <Card variant="outlined" sx={{ p: 2, bgcolor: `${olentiaColors.primary.main}06`, borderColor: `${olentiaColors.primary.main}20` }}>
                    <Typography variant="body2" fontWeight={500} sx={{ lineHeight: 1.7 }}>
                      {report.summary}
                    </Typography>
                    {report.date && (
                      <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
                        Rapor tarihi: {new Date(report.date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </Typography>
                    )}
                  </Card>

                  {/* Metrics */}
                  {report.metrics && (
                    <Box>
                      <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 1, display: 'block' }}>
                        Metrikler
                      </Typography>
                      <Grid container spacing={1}>
                        {[
                          { label: 'Siparis', value: report.metrics.totalOrders, icon: <OrderIcon sx={{ fontSize: 16 }} />, color: '#4FC3F7' },
                          { label: 'Ciro', value: formatCurrency(report.metrics.totalRevenue), icon: <TrendIcon sx={{ fontSize: 16 }} />, color: '#66BB6A' },
                          { label: 'Yeni Musteri', value: report.metrics.newCustomers, icon: <PeopleIcon sx={{ fontSize: 16 }} />, color: '#AB47BC' },
                          { label: 'Abonelik', value: report.metrics.activeSubscriptions, icon: <SubIcon sx={{ fontSize: 16 }} />, color: '#FFA726' },
                          { label: 'B2B Lead', value: report.metrics.b2bLeads, icon: <B2BIcon sx={{ fontSize: 16 }} />, color: '#4FC3F7' },
                          { label: 'Donusum', value: `%${report.metrics.conversionRate}`, icon: <InsightIcon sx={{ fontSize: 16 }} />, color: '#EF5350' },
                        ].map((m) => (
                          <Grid key={m.label} size={{ xs: 4, sm: 4 }}>
                            <Card variant="outlined" sx={{ p: 1.2, textAlign: 'center' }}>
                              <Box sx={{ color: m.color, mb: 0.3 }}>{m.icon}</Box>
                              <Typography variant="body2" fontWeight={800}>{m.value}</Typography>
                              <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>{m.label}</Typography>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}

                  {/* Insights */}
                  {report.insights && report.insights.length > 0 && (
                    <Box>
                      <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 1, display: 'block' }}>
                        Icgoruler
                      </Typography>
                      <Stack spacing={0.5}>
                        {report.insights.map((insight, i) => (
                          <Stack key={i} direction="row" spacing={1} alignItems="center" sx={{ p: 1, borderRadius: 1, bgcolor: 'rgba(102,187,106,0.06)' }}>
                            <InsightIcon sx={{ fontSize: 16, color: '#66BB6A' }} />
                            <Typography variant="body2">{insight}</Typography>
                          </Stack>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {/* Alerts */}
                  {report.alerts && report.alerts.length > 0 && (
                    <Box>
                      <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 1, display: 'block' }}>
                        Uyarilar
                      </Typography>
                      <Stack spacing={0.5}>
                        {report.alerts.map((alert, i) => (
                          <Stack key={i} direction="row" spacing={1} alignItems="center" sx={{ p: 1, borderRadius: 1, bgcolor: 'rgba(239,83,80,0.06)' }}>
                            <WarningIcon sx={{ fontSize: 16, color: '#EF5350' }} />
                            <Typography variant="body2">{alert}</Typography>
                          </Stack>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {/* Calendar Events */}
                  {report.calendarEvents && report.calendarEvents.length > 0 && (
                    <Box>
                      <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 1, display: 'block' }}>
                        Gunun Plani
                      </Typography>
                      <Stack spacing={0.5}>
                        {report.calendarEvents.map((ev, i) => (
                          <Stack key={i} direction="row" spacing={1} alignItems="center" sx={{ p: 1, borderRadius: 1, bgcolor: 'rgba(79,195,247,0.06)' }}>
                            <CalendarIcon sx={{ fontSize: 16, color: '#4FC3F7' }} />
                            <Chip label={ev.time} size="small" sx={{ height: 22, fontSize: 11, fontWeight: 700, bgcolor: '#4FC3F715', color: '#4FC3F7' }} />
                            <Typography variant="body2">{ev.event}</Typography>
                          </Stack>
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Stack>
              ) : (
                <Box sx={{ py: 6, textAlign: 'center' }}>
                  <AIIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1.5 }} />
                  <Typography variant="h6" color="text.secondary" fontWeight={600}>Rapor henuz olusturulmadi</Typography>
                  <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
                    &quot;Olustur&quot; butonuna tiklayarak gunun raporunu olusturun.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* ═══ DOGAL DIL SORGU ═══ */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#AB47BC15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AIIcon sx={{ color: '#AB47BC', fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>Dogal Dil Sorgu</Typography>
                  <Typography variant="caption" color="text.disabled">Verilerinizi sorgulayın</Typography>
                </Box>
              </Stack>

              <Stack spacing={2}>
                <TextField
                  fullWidth multiline rows={3}
                  placeholder="Orn: Bu ay en cok satan urun hangisi? Gecen aya gore satislar nasil? Musteri sayisi ne kadar artti?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleQuery(); } }}
                  size="small"
                />
                <Button
                  variant="contained" fullWidth startIcon={<SendIcon />}
                  onClick={handleQuery}
                  disabled={querying || !query.trim()}
                  sx={{ bgcolor: '#AB47BC', '&:hover': { bgcolor: '#9C27B0' } }}
                >
                  {querying ? 'Analiz ediliyor...' : 'Sor'}
                </Button>

                {queryResult && (
                  <Card variant="outlined" sx={{ p: 2, bgcolor: '#AB47BC06', borderColor: '#AB47BC20' }}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 1, display: 'block' }}>
                      Yanit
                    </Typography>
                    <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                      {queryResult}
                    </Typography>
                  </Card>
                )}

                {/* Ornek Sorular */}
                <Box>
                  <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 1, display: 'block' }}>
                    Ornek Sorular
                  </Typography>
                  <Stack spacing={0.5}>
                    {[
                      'Bu ay toplam kac siparis geldi?',
                      'En cok satan 5 urun hangisi?',
                      'Musterilerin tekrar alis orani kac?',
                      'Gecen haftaya gore satis degisimi?',
                      'Hangi bolge en cok siparis veriyor?',
                    ].map((q) => (
                      <Card key={q} variant="outlined" sx={{
                        p: 1, cursor: 'pointer',
                        '&:hover': { borderColor: '#AB47BC', bgcolor: '#AB47BC06' },
                        transition: 'all 0.15s',
                      }}
                        onClick={() => setQuery(q)}>
                        <Typography variant="caption" color="text.secondary">{q}</Typography>
                      </Card>
                    ))}
                  </Stack>
                </Box>

                {/* Phase 2 Note */}
                <Alert severity="warning" icon={<InfoIcon />} sx={{ borderRadius: 2 }}>
                  <Typography variant="caption">
                    Dogal dil sorgusu su anda basit yanitlar verir. Phase 2&apos;de LangChain + OpenAI entegrasyonu ile gercek AI analiz aktif olacaktir.
                  </Typography>
                </Alert>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
