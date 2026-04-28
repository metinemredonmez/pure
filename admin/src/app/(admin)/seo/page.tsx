'use client';
import { useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, TextField, Button, Stack, Alert, Divider } from '@mui/material';
import { Search as SeoIcon, Save as SaveIcon } from '@mui/icons-material';
import { api } from '@/lib/api';
import { olentiaColors } from '@/lib/theme';

export default function SeoPage() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pagePath, setPagePath] = useState('/');
  const [form, setForm] = useState({ metaTitle: '', metaDescription: '', ogTitle: '', ogDescription: '', ogImage: '', canonicalUrl: '', keywords: '' });

  const handleSave = async () => {
    setSaving(true);
    try { await api.put(`/admin/seo/${encodeURIComponent(pagePath)}`, form); setSaved(true); setTimeout(() => setSaved(false), 3000); } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const pages = ['/', '/products', '/about', '/contact', '/blog', '/sss', '/subscription', '/b2b', '/franchise'];

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box><Typography variant="h5" fontWeight={700}>SEO Yönetimi</Typography><Typography variant="body2" color="text.secondary">Sayfa bazlı SEO meta verilerini düzenle</Typography></Box>
        <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving} sx={{ bgcolor: olentiaColors.primary.main, '&:hover': { bgcolor: olentiaColors.primary.dark } }}>{saving ? 'Kaydediliyor...' : 'Kaydet'}</Button>
      </Box>
      {saved && <Alert severity="success" sx={{ mb: 2 }}>SEO verileri kaydedildi</Alert>}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card><CardContent>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Sayfa Seç</Typography>
            <Stack spacing={0.5}>{pages.map((p) => (
              <Button key={p} fullWidth variant={pagePath === p ? 'contained' : 'text'} onClick={() => setPagePath(p)}
                sx={{ justifyContent: 'flex-start', fontFamily: 'monospace', fontSize: 12, ...(pagePath === p ? { bgcolor: olentiaColors.primary.main } : { color: 'text.secondary' }) }}>
                {p}
              </Button>
            ))}</Stack>
          </CardContent></Card>
        </Grid>
        <Grid size={{ xs: 12, md: 9 }}>
          <Card><CardContent>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>SEO Verileri — {pagePath}</Typography>
            <Stack spacing={2}>
              <TextField fullWidth label="Meta Başlık" value={form.metaTitle} onChange={(e) => setForm({...form, metaTitle: e.target.value})} helperText="50-60 karakter önerilir" />
              <TextField fullWidth multiline rows={2} label="Meta Açıklama" value={form.metaDescription} onChange={(e) => setForm({...form, metaDescription: e.target.value})} helperText="150-160 karakter önerilir" />
              <TextField fullWidth label="Anahtar Kelimeler" value={form.keywords} onChange={(e) => setForm({...form, keywords: e.target.value})} placeholder="kahve, espresso, premium (virgülle ayırın)" />
              <Divider />
              <TextField fullWidth label="OG Başlık" value={form.ogTitle} onChange={(e) => setForm({...form, ogTitle: e.target.value})} />
              <TextField fullWidth label="OG Açıklama" value={form.ogDescription} onChange={(e) => setForm({...form, ogDescription: e.target.value})} />
              <TextField fullWidth label="OG Resim URL" value={form.ogImage} onChange={(e) => setForm({...form, ogImage: e.target.value})} />
              <TextField fullWidth label="Canonical URL" value={form.canonicalUrl} onChange={(e) => setForm({...form, canonicalUrl: e.target.value})} />
            </Stack>
          </CardContent></Card>
        </Grid>
      </Grid>
    </Box>
  );
}
