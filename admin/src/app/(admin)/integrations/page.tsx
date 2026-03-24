'use client';

import { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, TextField, Button, Stack,
  Skeleton, Alert, Snackbar, IconButton, Tooltip, Chip, InputAdornment,
  Accordion, AccordionSummary, AccordionDetails, Switch, FormControlLabel,
} from '@mui/material';
import {
  ExpandMore, Save as SaveIcon, Visibility, VisibilityOff,
  PaymentOutlined, EmailOutlined, NotificationsOutlined, SmartToyOutlined,
  SecurityOutlined, LocalShippingOutlined, AnalyticsOutlined, WebhookOutlined,
  MapOutlined, RefreshOutlined, CheckCircleOutlined, ErrorOutlined,
} from '@mui/icons-material';
import { integrationsApi } from '@/lib/api';
import { olentiaColors } from '@/lib/theme';
import PageHeader from '@/components/common/PageHeader';

interface Setting {
  key: string;
  value: string | null;
  group: string;
  description: string;
  isEncrypted: boolean;
  hasValue: boolean;
}

const groupIcons: Record<string, React.ReactNode> = {
  PAYMENT: <PaymentOutlined />,
  EMAIL: <EmailOutlined />,
  NOTIFICATION: <NotificationsOutlined />,
  AI: <SmartToyOutlined />,
  AUTH: <SecurityOutlined />,
  SHIPPING: <LocalShippingOutlined />,
  ANALYTICS: <AnalyticsOutlined />,
  WEBHOOK: <WebhookOutlined />,
  MAP: <MapOutlined />,
};

const groupLabels: Record<string, string> = {
  PAYMENT: 'Ödeme Entegrasyonları',
  EMAIL: 'E-posta (SMTP)',
  NOTIFICATION: 'Bildirim (Firebase / OneSignal)',
  AI: 'Yapay Zeka (OpenAI)',
  AUTH: 'Kimlik Doğrulama (OAuth)',
  SHIPPING: 'Kargo API',
  ANALYTICS: 'Analitik',
  WEBHOOK: 'Webhook',
  MAP: 'Harita (Google Maps)',
};

const groupDescriptions: Record<string, string> = {
  PAYMENT: 'PayTR, iyzico, Google Pay, Apple Pay API anahtarları',
  EMAIL: 'SMTP sunucu bilgileri (mail gönderimi için)',
  NOTIFICATION: 'Firebase Cloud Messaging ve OneSignal push bildirimleri',
  AI: 'OpenAI API anahtarı ve model ayarları',
  AUTH: 'Google ve Apple OAuth yapılandırması',
  SHIPPING: 'Yurtiçi Kargo, Aras Kargo, MNG Kargo API bilgileri',
  ANALYTICS: 'Google Analytics, Facebook Pixel, Hotjar',
  WEBHOOK: 'Webhook imzalama anahtarı',
  MAP: 'Google Maps API anahtarı',
};

export default function IntegrationsPage() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Setting[]>([]);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [expanded, setExpanded] = useState<string | false>(false);
  const [testing, setTesting] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await integrationsApi.getSettings();
      const data = res.data || res;
      const items = data.settings || data || [];
      if (Array.isArray(items)) {
        setSettings(items);
        const vals: Record<string, string> = {};
        items.forEach((s: Setting) => {
          vals[s.key] = s.isEncrypted && s.hasValue ? '••••••••' : (s.value || '');
        });
        setEditValues(vals);
      }
    } catch {
      // Seed default settings
      try {
        await integrationsApi.testConnection('seed');
      } catch { /* ignore */ }
    }
    setLoading(false);
  };

  const handleSave = async (key: string) => {
    const value = editValues[key];
    if (!value || value === '••••••••') return;

    setSaving(prev => ({ ...prev, [key]: true }));
    try {
      await integrationsApi.updateSetting(key, value);
      setToast({ open: true, message: `${key} kaydedildi`, severity: 'success' });
      // Update hasValue
      setSettings(prev => prev.map(s => s.key === key ? { ...s, hasValue: true } : s));
    } catch {
      setToast({ open: true, message: `${key} kaydedilemedi`, severity: 'error' });
    }
    setSaving(prev => ({ ...prev, [key]: false }));
  };

  const handleSaveGroup = async (group: string) => {
    const groupSettings = settings.filter(s => s.group === group);
    setSaving(prev => ({ ...prev, [group]: true }));

    let success = 0;
    let failed = 0;
    for (const s of groupSettings) {
      const value = editValues[s.key];
      if (!value || value === '••••••••') continue;
      try {
        await integrationsApi.updateSetting(s.key, value);
        success++;
      } catch {
        failed++;
      }
    }

    if (failed === 0 && success > 0) {
      setToast({ open: true, message: `${groupLabels[group] || group}: ${success} ayar kaydedildi`, severity: 'success' });
    } else if (failed > 0) {
      setToast({ open: true, message: `${failed} ayar kaydedilemedi`, severity: 'error' });
    }
    setSaving(prev => ({ ...prev, [group]: false }));
    fetchSettings();
  };

  const handleTest = async (group: string) => {
    setTesting(prev => ({ ...prev, [group]: true }));
    try {
      await integrationsApi.testConnection(group);
      setToast({ open: true, message: `${groupLabels[group] || group} bağlantısı başarılı ✓`, severity: 'success' });
    } catch {
      setToast({ open: true, message: `${groupLabels[group] || group} bağlantı hatası`, severity: 'error' });
    }
    setTesting(prev => ({ ...prev, [group]: false }));
  };

  const groups = [...new Set(settings.map(s => s.group))];

  if (loading) {
    return (
      <Box>
        <Skeleton height={40} width={300} sx={{ mb: 1 }} />
        <Skeleton height={20} width={400} sx={{ mb: 3 }} />
        {[1, 2, 3, 4].map(i => <Skeleton key={i} height={80} variant="rounded" sx={{ mb: 1.5 }} />)}
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Entegrasyon Ayarları"
        subtitle="Tüm API anahtarları ve servis yapılandırmaları"
        breadcrumbs={[{ label: 'Ayarlar', href: '/settings' }, { label: 'Entegrasyonlar' }]}
        action={
          <Button variant="outlined" startIcon={<RefreshOutlined />} onClick={fetchSettings} size="small"
            sx={{ borderColor: 'rgba(255,255,255,0.15)', color: 'text.secondary' }}>
            Yenile
          </Button>
        }
      />

      {settings.length === 0 && (
        <Alert
          severity="info"
          sx={{ mb: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={async () => {
                try {
                  await integrationsApi.seed();
                  setToast({ open: true, message: 'Entegrasyon ayarları oluşturuldu!', severity: 'success' });
                  fetchSettings();
                } catch {
                  setToast({ open: true, message: 'Seed işlemi başarısız', severity: 'error' });
                }
              }}
            >
              Ayarları Oluştur
            </Button>
          }
        >
          Henüz entegrasyon ayarı bulunamadı. &quot;Ayarları Oluştur&quot; butonuna tıklayın.
        </Alert>
      )}

      {groups.map(group => {
        const groupSettings = settings.filter(s => s.group === group);
        const configuredCount = groupSettings.filter(s => s.hasValue).length;
        const totalCount = groupSettings.length;

        return (
          <Accordion
            key={group}
            expanded={expanded === group}
            onChange={(_, isExpanded) => setExpanded(isExpanded ? group : false)}
            sx={{
              mb: 1.5, bgcolor: '#1A1A1A', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '8px !important', '&:before': { display: 'none' },
              '&.Mui-expanded': { mb: 1.5 },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 2.5, py: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', pr: 2 }}>
                <Box sx={{
                  width: 40, height: 40, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  bgcolor: `${olentiaColors.primary.main}15`, color: olentiaColors.primary.main,
                }}>
                  {groupIcons[group] || <WebhookOutlined />}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600}>{groupLabels[group] || group}</Typography>
                  <Typography variant="caption" color="text.secondary">{groupDescriptions[group] || ''}</Typography>
                </Box>
                <Chip
                  size="small"
                  icon={configuredCount === totalCount ? <CheckCircleOutlined sx={{ fontSize: 14 }} /> : <ErrorOutlined sx={{ fontSize: 14 }} />}
                  label={`${configuredCount}/${totalCount}`}
                  color={configuredCount === totalCount ? 'success' : configuredCount > 0 ? 'warning' : 'error'}
                  variant="outlined"
                  sx={{ height: 24 }}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 2.5, pb: 2.5 }}>
              <Grid container spacing={2}>
                {groupSettings.map(setting => {
                  const isSecret = setting.isEncrypted;
                  const showSecret = showSecrets[setting.key];
                  const keyLabel = setting.key
                    .replace(/_/g, ' ')
                    .replace(/\b\w/g, l => l.toUpperCase());

                  return (
                    <Grid key={setting.key} size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label={keyLabel}
                        value={editValues[setting.key] || ''}
                        onChange={(e) => setEditValues(prev => ({ ...prev, [setting.key]: e.target.value }))}
                        type={isSecret && !showSecret ? 'password' : 'text'}
                        placeholder={setting.hasValue ? '(yapılandırılmış)' : 'Değer girin...'}
                        helperText={setting.description || undefined}
                        slotProps={{
                          input: {
                            endAdornment: isSecret ? (
                              <InputAdornment position="end">
                                <IconButton size="small" onClick={() => setShowSecrets(prev => ({ ...prev, [setting.key]: !prev[setting.key] }))}>
                                  {showSecret ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                                </IconButton>
                              </InputAdornment>
                            ) : setting.hasValue ? (
                              <InputAdornment position="end">
                                <CheckCircleOutlined sx={{ fontSize: 16, color: '#4CAF50' }} />
                              </InputAdornment>
                            ) : undefined,
                          },
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: 'rgba(255,255,255,0.03)',
                            '& fieldset': { borderColor: setting.hasValue ? 'rgba(76,175,80,0.3)' : 'rgba(255,255,255,0.1)' },
                          },
                        }}
                      />
                    </Grid>
                  );
                })}
              </Grid>

              <Stack direction="row" spacing={1} sx={{ mt: 2.5 }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={() => handleSaveGroup(group)}
                  disabled={!!saving[group]}
                  size="small"
                  sx={{ bgcolor: olentiaColors.primary.main, '&:hover': { bgcolor: olentiaColors.primary.dark } }}
                >
                  {saving[group] ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => handleTest(group)}
                  disabled={!!testing[group]}
                  size="small"
                  sx={{ borderColor: 'rgba(255,255,255,0.15)', color: 'text.secondary' }}
                >
                  {testing[group] ? 'Test ediliyor...' : 'Bağlantı Test Et'}
                </Button>
              </Stack>
            </AccordionDetails>
          </Accordion>
        );
      })}

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setToast(prev => ({ ...prev, open: false }))} severity={toast.severity} variant="filled">{toast.message}</Alert>
      </Snackbar>
    </Box>
  );
}
