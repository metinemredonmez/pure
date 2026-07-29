'use client';

import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, TextField, Button, Switch,
  FormControlLabel, Stack, Alert, Skeleton, Snackbar,
} from '@mui/material';
import { Save as SaveIcon, RestoreOutlined } from '@mui/icons-material';
import { websiteApi } from '@/lib/api';
import { NumberField } from '@/components/NumberField';
import { olentiaColors } from '@/lib/theme';

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  currency: string;
  taxRate: number;
  freeShippingThreshold: number;
  shippingCost: number;
  maintenanceMode: boolean;
  emailNotifications: boolean;
  orderNotifications: boolean;
  stockAlerts: boolean;
  lowStockThreshold: number;
}

const DEFAULTS: SiteSettings = {
  siteName: 'Pure Olentia',
  siteDescription: 'Premium Kahve Deneyimi',
  contactEmail: 'info@olentia.com',
  contactPhone: '+90 212 000 00 00',
  address: 'Istanbul, Türkiye',
  currency: 'TRY',
  taxRate: 18,
  freeShippingThreshold: 200,
  shippingCost: 29.90,
  maintenanceMode: false,
  emailNotifications: true,
  orderNotifications: true,
  stockAlerts: true,
  lowStockThreshold: 10,
};

// Map UI field → SiteSettings key (websiteApi upsert ediyor, key'ler dinamik)
const SETTING_KEYS: Record<keyof SiteSettings, string> = {
  siteName: 'siteName',
  siteDescription: 'siteDescription',
  contactEmail: 'email',
  contactPhone: 'phone',
  address: 'address',
  currency: 'currency',
  taxRate: 'taxRate',
  freeShippingThreshold: 'freeShippingThreshold',
  shippingCost: 'shippingCost',
  maintenanceMode: 'maintenanceMode',
  emailNotifications: 'emailNotifications',
  orderNotifications: 'orderNotifications',
  stockAlerts: 'stockAlerts',
  lowStockThreshold: 'lowStockThreshold',
};

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULTS);
  const [original, setOriginal] = useState<SiteSettings>(DEFAULTS);
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    setDirty(JSON.stringify(settings) !== JSON.stringify(original));
  }, [settings, original]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await websiteApi.getSettings();
      const data = (res?.data || res || {}) as Record<string, unknown>;

      const loaded = { ...DEFAULTS };
      (Object.keys(SETTING_KEYS) as (keyof SiteSettings)[]).forEach((localKey) => {
        const apiKey = SETTING_KEYS[localKey];
        const v = data[apiKey];
        if (v !== null && v !== undefined && v !== '') {
          if (typeof DEFAULTS[localKey] === 'boolean') {
            (loaded as Record<string, unknown>)[localKey] = v === 'true' || v === true;
          } else if (typeof DEFAULTS[localKey] === 'number') {
            (loaded as Record<string, unknown>)[localKey] = Number(v);
          } else {
            (loaded as Record<string, unknown>)[localKey] = String(v);
          }
        }
      });
      setSettings(loaded);
      setOriginal(loaded);
    } catch {
      // Use defaults on first load
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    let failed = 0;
    try {
      // Bulk upsert via websiteApi (SiteSettings table — works correctly)
      const entries = Object.entries(settings).map(([key, value]) => ({
        key: SETTING_KEYS[key as keyof SiteSettings] || key,
        value,
      }));
      await websiteApi.updateMultipleSettings(entries);
      setOriginal({ ...settings });
      setToast({ open: true, message: 'Ayarlar başarıyla kaydedildi', severity: 'success' });
    } catch (err) {
      failed = 1;
      setToast({ open: true, message: 'Ayarlar kaydedilemedi: ' + (err instanceof Error ? err.message : 'Sunucu hatası'), severity: 'error' });
    }
    setSaving(false);
    void failed;
  };

  const handleReset = () => {
    setSettings({ ...original });
  };

  const update = (key: keyof SiteSettings, value: unknown) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <Box>
        <Skeleton height={40} width={200} sx={{ mb: 1 }} />
        <Skeleton height={20} width={300} sx={{ mb: 3 }} />
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map(i => (
            <Grid key={i} size={{ xs: 12, md: 6 }}>
              <Skeleton height={250} variant="rounded" />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Ayarlar</Typography>
          <Typography variant="body2" color="text.secondary">Site ve sistem ayarlarını yönet</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          {dirty && (
            <Button variant="outlined" startIcon={<RestoreOutlined />} onClick={handleReset} size="small"
              sx={{ borderColor: 'rgba(255,255,255,0.2)', color: 'text.secondary' }}>
              Sıfırla
            </Button>
          )}
          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving || !dirty}
            sx={{ bgcolor: olentiaColors.primary.main, '&:hover': { bgcolor: olentiaColors.primary.dark } }}>
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </Stack>
      </Box>

      {dirty && <Alert severity="info" sx={{ mb: 2 }}>Kaydedilmemiş değişiklikler var</Alert>}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Genel Bilgiler</Typography>
              <Stack spacing={2}>
                <TextField fullWidth label="Site Adı" value={settings.siteName} onChange={(e) => update('siteName', e.target.value)} size="small" />
                <TextField fullWidth label="Açıklama" value={settings.siteDescription} onChange={(e) => update('siteDescription', e.target.value)} size="small" />
                <TextField fullWidth label="İletişim E-posta" value={settings.contactEmail} onChange={(e) => update('contactEmail', e.target.value)} size="small" />
                <TextField fullWidth label="Telefon" value={settings.contactPhone} onChange={(e) => update('contactPhone', e.target.value)} size="small" />
                <TextField fullWidth label="Adres" value={settings.address} onChange={(e) => update('address', e.target.value)} size="small" multiline rows={2} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Ödeme & Kargo</Typography>
              <Stack spacing={2}>
                <TextField fullWidth label="Para Birimi" value={settings.currency} size="small" disabled />
                <NumberField fullWidth label="KDV Oranı (%)" value={settings.taxRate} onValueChange={(v) => update('taxRate', v)} size="small" />
                <NumberField fullWidth label="Ücretsiz Kargo Limiti (₺)" value={settings.freeShippingThreshold} onValueChange={(v) => update('freeShippingThreshold', v)} size="small" />
                <NumberField fullWidth label="Kargo Ücreti (₺)" value={settings.shippingCost} onValueChange={(v) => update('shippingCost', v)} size="small" />
                <NumberField fullWidth label="Düşük Stok Eşiği" value={settings.lowStockThreshold} onValueChange={(v) => update('lowStockThreshold', v)} size="small" />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Bildirimler</Typography>
              <Stack spacing={1}>
                <FormControlLabel control={<Switch checked={settings.emailNotifications} onChange={(e) => update('emailNotifications', e.target.checked)} color="primary" />} label="E-posta Bildirimleri" />
                <FormControlLabel control={<Switch checked={settings.orderNotifications} onChange={(e) => update('orderNotifications', e.target.checked)} color="primary" />} label="Sipariş Bildirimleri" />
                <FormControlLabel control={<Switch checked={settings.stockAlerts} onChange={(e) => update('stockAlerts', e.target.checked)} color="primary" />} label="Stok Uyarıları" />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Sistem</Typography>
              <FormControlLabel
                control={<Switch checked={settings.maintenanceMode} onChange={(e) => update('maintenanceMode', e.target.checked)} color="error" />}
                label="Bakım Modu"
              />
              <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 6, mt: -1 }}>
                Aktif edildiğinde site ziyaretçilere kapalı olur
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setToast(prev => ({ ...prev, open: false }))} severity={toast.severity} variant="filled">{toast.message}</Alert>
      </Snackbar>
    </Box>
  );
}
