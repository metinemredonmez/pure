'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, TextField, Button, Grid, Divider, Skeleton,
  CardContent, CardHeader,
} from '@mui/material';
import {
  Settings as SettingsIcon, Save as SaveIcon,
} from '@mui/icons-material';
import { websiteApi } from '@/lib/api';
import PageHeader from '@/components/common/PageHeader';
import ImageUpload from '@/components/common/ImageUpload';

interface SiteSettingsState {
  siteName: string;
  logo: string;
  favicon: string;
  footerText: string;
  phone: string;
  email: string;
  address: string;
  mapLat: string;
  mapLng: string;
  workingHours: string;
  facebook: string;
  instagram: string;
  twitter: string;
  linkedin: string;
  youtube: string;
  kvkkText: string;
  cookiePolicy: string;
  franchiseBanners: string[];
}

const defaultSettings: SiteSettingsState = {
  siteName: '', logo: '', favicon: '', footerText: '',
  phone: '', email: '', address: '', mapLat: '', mapLng: '', workingHours: '',
  facebook: '', instagram: '', twitter: '', linkedin: '', youtube: '',
  kvkkText: '', cookiePolicy: '',
  franchiseBanners: [],
};

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState<SiteSettingsState>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await websiteApi.getSettings();
      const data = res?.data || res || {};
      setSettings({
        siteName: data.siteName || '',
        logo: data.logo || '',
        favicon: data.favicon || '',
        footerText: data.footerText || '',
        phone: data.phone || '',
        email: data.email || '',
        address: data.address || '',
        mapLat: data.mapLat || '',
        mapLng: data.mapLng || '',
        workingHours: data.workingHours || '',
        facebook: data.facebook || '',
        instagram: data.instagram || '',
        twitter: data.twitter || '',
        linkedin: data.linkedin || '',
        youtube: data.youtube || '',
        kvkkText: data.kvkkText || '',
        cookiePolicy: data.cookiePolicy || '',
        franchiseBanners: Array.isArray(data.franchiseBanners) ? data.franchiseBanners : [],
      });
    } catch { /* fallback */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const entries = Object.entries(settings).map(([key, value]) => ({ key, value }));
      await websiteApi.updateMultipleSettings(entries);
    } catch { /* toast */ }
    finally { setSaving(false); }
  };

  if (loading) {
    return (
      <Box>
        <PageHeader title="Site Ayarlari" icon={<SettingsIcon />} />
        <Card sx={{ mt: 3, p: 3 }}><Skeleton height={400} /></Card>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Site Ayarlari"
        subtitle="Web sitesi genel ayarlari"
        icon={<SettingsIcon />}
        action={
          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving} size="small">
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        }
      />

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Genel */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader title="Genel Bilgiler" titleTypographyProps={{ fontSize: 15, fontWeight: 600 }} />
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth label="Site Adi" size="small" value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <ImageUpload
                    label="Logo (onerilen: 400x120px, seffaf PNG)"
                    value={settings.logo}
                    onChange={(url) => setSettings({ ...settings, logo: url as string })}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <ImageUpload
                    label="Favicon (onerilen: 64x64px, PNG/ICO)"
                    value={settings.favicon}
                    onChange={(url) => setSettings({ ...settings, favicon: url as string })}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth label="Footer Metni" size="small" value={settings.footerText}
                    onChange={(e) => setSettings({ ...settings, footerText: e.target.value })} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Iletisim */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader title="Iletisim Bilgileri" titleTypographyProps={{ fontSize: 15, fontWeight: 600 }} />
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth label="Telefon" size="small" value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth label="E-posta" size="small" value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth label="Adres" size="small" multiline rows={2} value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField fullWidth label="Harita Lat" size="small" value={settings.mapLat}
                    onChange={(e) => setSettings({ ...settings, mapLat: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField fullWidth label="Harita Lng" size="small" value={settings.mapLng}
                    onChange={(e) => setSettings({ ...settings, mapLng: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth label="Calisma Saatleri" size="small" value={settings.workingHours}
                    onChange={(e) => setSettings({ ...settings, workingHours: e.target.value })}
                    helperText="Ornek: Pzt-Cum 09:00-18:00" />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Sosyal Medya */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader title="Sosyal Medya" titleTypographyProps={{ fontSize: 15, fontWeight: 600 }} />
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth label="Facebook" size="small" value={settings.facebook}
                    onChange={(e) => setSettings({ ...settings, facebook: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth label="Instagram" size="small" value={settings.instagram}
                    onChange={(e) => setSettings({ ...settings, instagram: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth label="Twitter / X" size="small" value={settings.twitter}
                    onChange={(e) => setSettings({ ...settings, twitter: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth label="LinkedIn" size="small" value={settings.linkedin}
                    onChange={(e) => setSettings({ ...settings, linkedin: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth label="YouTube" size="small" value={settings.youtube}
                    onChange={(e) => setSettings({ ...settings, youtube: e.target.value })} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Franchise Banner */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader
              title="Franchise Sayfasi Banner"
              subheader="Franchise sayfasindaki 'Pure Olentia Magaza Konsepti' bolumunde gosterilen gorseller. Birden fazla eklerseniz otomatik slideshow olur (5 sn gecis). Onerilen: 1920x820px (21:9 oran)."
              titleTypographyProps={{ fontSize: 15, fontWeight: 600 }}
            />
            <CardContent>
              <ImageUpload
                label="Franchise Banner Gorselleri"
                value={settings.franchiseBanners}
                onChange={(urls) => setSettings({ ...settings, franchiseBanners: Array.isArray(urls) ? urls : urls ? [urls] : [] })}
                multiple
                maxFiles={5}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Yasal Metinler */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader title="Yasal Metinler" titleTypographyProps={{ fontSize: 15, fontWeight: 600 }} />
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth label="KVKK / Aydinlatma Metni" size="small" multiline rows={6} value={settings.kvkkText}
                    onChange={(e) => setSettings({ ...settings, kvkkText: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth label="Cerez Politikasi" size="small" multiline rows={6} value={settings.cookiePolicy}
                    onChange={(e) => setSettings({ ...settings, cookiePolicy: e.target.value })} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
