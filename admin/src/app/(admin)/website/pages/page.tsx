'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Chip, IconButton, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, Divider, Skeleton, Grid, Tooltip,
  Switch, FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Description as PageIcon, Close as CloseIcon,
} from '@mui/icons-material';
import { websiteApi } from '@/lib/api';
import PageHeader from '@/components/common/PageHeader';

interface SitePage {
  id: string;
  title: string;
  slug: string;
  sections: any[];
  isPublished: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoImage?: string;
  createdAt: string;
  updatedAt: string;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const emptyForm = {
  title: '',
  slug: '',
  content: '', // raw HTML content — serialized to sections[{type:'html', content}]
  isPublished: false,
  seoTitle: '',
  seoDescription: '',
  seoImage: '',
};

// Shortcut: one-click creation of 5 standard support pages
const SUPPORT_PAGE_TEMPLATES: Array<{
  title: string;
  slug: string;
  seoDescription: string;
  content: string;
}> = [
  {
    title: 'Ekipmanlar',
    slug: 'ekipmanlar',
    seoDescription: 'Specialty kahve demleme ekipmanları rehberi.',
    content: `<h2>Kahve Ekipmanları Rehberi</h2>
<p>Her demleme yönteminin kendine özgü bir dili vardır. Doğru ekipmanla kahvenizin karakterini ortaya çıkarabilirsiniz.</p>
<h3>Filtre Kahve Ekipmanları</h3>
<ul>
  <li><strong>Hario V60:</strong> Aromayı öne çıkaran koni filtre. Hafif kavrumlar için ideal.</li>
  <li><strong>Chemex:</strong> Kalın kağıt filtre ile berrak ve temiz içim.</li>
  <li><strong>Kalita Wave:</strong> Düz tabanlı, tutarlı demleme.</li>
</ul>
<h3>Daldırma Yöntemleri</h3>
<ul>
  <li><strong>French Press:</strong> Yoğun gövdeli, ekonomik.</li>
  <li><strong>Aeropress:</strong> Kompakt, seyahat dostu.</li>
</ul>
<h3>Espresso ve Türk Kahvesi</h3>
<ul>
  <li><strong>Espresso Makinesi</strong></li>
  <li><strong>Moka Pot</strong></li>
  <li><strong>Cezve:</strong> Geleneksel Türk kahvesi için.</li>
</ul>`,
  },
  {
    title: 'Sipariş Takibi',
    slug: 'siparis-takibi',
    seoDescription: 'Pure Olentia siparişinizi takip edin.',
    content: `<h2>Siparişiniz Nerede?</h2>
<p>Sipariş takibi için sipariş numaranız ve e-posta adresinizle sorgulama yapabilirsiniz.</p>
<h3>Siparişinizin Yolculuğu</h3>
<ol>
  <li><strong>Sipariş Alındı</strong> — Ödeme onaylandı.</li>
  <li><strong>Taze Kavrulur</strong> — 24 saat içinde sipariş üzerine.</li>
  <li><strong>Paketleme</strong> — Valf kontrollü hava sızdırmaz paketler.</li>
  <li><strong>Kargoya Teslim</strong> — Takip numarası e-posta ile iletilir.</li>
  <li><strong>Kapınızda</strong> — 1-3 iş günü içinde.</li>
</ol>`,
  },
  {
    title: 'İade & Değişim',
    slug: 'iade-degisim',
    seoDescription: 'Pure Olentia iade ve değişim koşulları.',
    content: `<h2>İade & Değişim Koşulları</h2>
<p>Memnuniyetiniz önceliğimizdir. 14 gün içinde iade hakkınız vardır.</p>
<h3>İade Koşulları</h3>
<ul>
  <li>Ambalajı açılmamış kahve ürünleri iade edilebilir.</li>
  <li>Ekipmanlar orijinal ambalajında, kullanılmamış olmalıdır.</li>
  <li>İade kargo ücreti müşteriye aittir (hatalı gönderim hariç).</li>
</ul>
<h3>İade Süreci</h3>
<ol>
  <li>info@pureolentia.com adresine sipariş numaranızla iletin.</li>
  <li>24 saat içinde iade kodunuz size iletilir.</li>
  <li>Ürünü orijinal ambalajında bize gönderin.</li>
  <li>Ürün ulaştıktan sonra 7 iş günü içinde ücret iadesi yapılır.</li>
</ol>`,
  },
  {
    title: 'Sıkça Sorulan Sorular',
    slug: 'sss',
    seoDescription: 'Pure Olentia kahveleri, abonelik, kargo hakkında SSS.',
    content: `<h2>Sıkça Sorulan Sorular</h2>
<h3>Siparişim ne zaman elime ulaşır?</h3>
<p>24 saat içinde kavrulur, 1-3 iş günü içinde kapınızda olur.</p>
<h3>Kargo ücreti ne kadar?</h3>
<p>300 TL üzeri siparişlerde ücretsiz kargo.</p>
<h3>Kahvelerinizin tazeliği nasıl?</h3>
<p>Tüm kahvelerimiz sipariş sonrası kavrulur. Kavurma tarihi ambalajda yer alır.</p>
<h3>Abonelik nasıl çalışır?</h3>
<p>Planı seçin, her ay taze kahveniz kapınıza gelir. İstediğiniz zaman iptal edebilirsiniz.</p>
<h3>Hangi ödeme yöntemlerini kabul ediyorsunuz?</h3>
<p>Kredi kartı, banka kartı, havale/EFT. Tüm ödemeler SSL ile güvence altında.</p>`,
  },
  {
    title: 'Gizlilik Politikası',
    slug: 'gizlilik-politikasi',
    seoDescription: 'Pure Olentia KVKK gizlilik politikası.',
    content: `<h2>Gizlilik Politikası</h2>
<p>6698 sayılı KVKK uyarınca, kişisel verileriniz veri sorumlusu sıfatıyla <strong>Pure Olentia Kahve</strong> tarafından işlenmektedir.</p>
<p><strong>Adres:</strong> Abdurrahmangazi, Nane Sk. No:8, 34887 Sancaktepe/İstanbul<br/>
<strong>E-posta:</strong> info@pureolentia.com<br/>
<strong>Telefon:</strong> 0552 462 29 54</p>
<h3>İşlenen Kişisel Veriler</h3>
<ul>
  <li>Kimlik ve iletişim bilgileri</li>
  <li>Sipariş ve fatura bilgileri</li>
  <li>Pazarlama tercihleri (onay dahilinde)</li>
</ul>
<h3>Haklarınız</h3>
<p>KVKK Madde 11 uyarınca kişisel verilerinizin işlenip işlenmediğini öğrenme, düzeltilmesini/silinmesini talep etme haklarınız vardır.</p>
<p>Başvurular için: <a href="mailto:info@pureolentia.com">info@pureolentia.com</a></p>`,
  },
];

export default function PagesPage() {
  const [pages, setPages] = useState<SitePage[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SitePage | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchPages = useCallback(async () => {
    try {
      setLoading(true);
      const res = await websiteApi.getPages();
      setPages(Array.isArray(res) ? res : res.data || []);
    } catch { setPages([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPages(); }, [fetchPages]);

  const sectionsToContent = (sections: any[] | any): string => {
    if (!Array.isArray(sections)) return '';
    return sections
      .map((s) => (typeof s === 'string' ? s : (s?.content ?? '')))
      .filter(Boolean)
      .join('\n\n');
  };

  const handleOpen = (page?: SitePage) => {
    if (page) {
      setEditing(page);
      setForm({
        title: page.title,
        slug: page.slug,
        content: sectionsToContent(page.sections),
        isPublished: page.isPublished,
        seoTitle: page.seoTitle || '',
        seoDescription: page.seoDescription || '',
        seoImage: page.seoImage || '',
      });
    } else {
      setEditing(null);
      setForm(emptyForm);
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const sections = form.content
        ? [{ type: 'html', content: form.content }]
        : [];
      const { content: _omit, ...rest } = form;
      const payload = { ...rest, sections };
      if (editing) {
        await websiteApi.updatePage(editing.id, payload);
      } else {
        await websiteApi.createPage(payload);
      }
      setDialogOpen(false);
      fetchPages();
    } catch { /* toast */ }
    finally { setSaving(false); }
  };

  const handleSeedSupportPages = async () => {
    if (!confirm('5 destek sayfası (Ekipmanlar, Sipariş Takibi, İade & Değişim, SSS, Gizlilik Politikası) taslak olarak oluşturulacak. Devam edilsin mi?')) return;
    setSaving(true);
    try {
      const existingSlugs = new Set(pages.map((p) => p.slug));
      for (const tpl of SUPPORT_PAGE_TEMPLATES) {
        if (existingSlugs.has(tpl.slug)) continue;
        await websiteApi.createPage({
          title: tpl.title,
          slug: tpl.slug,
          sections: [{ type: 'html', content: tpl.content }],
          isPublished: true,
          seoTitle: tpl.title + ' - Pure Olentia',
          seoDescription: tpl.seoDescription,
          seoImage: '',
        });
      }
      fetchPages();
    } catch { /* toast */ }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu sayfa silinecek. Emin misiniz?')) return;
    await websiteApi.deletePage(id);
    fetchPages();
  };

  return (
    <Box>
      <PageHeader
        title="Sayfa Yönetimi"
        subtitle={`${pages.length} sayfa`}
        icon={<PageIcon />}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={handleSeedSupportPages}
              size="small"
              disabled={saving}
            >
              Destek Sayfalarını Oluştur
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()} size="small">
              Yeni Sayfa
            </Button>
          </Box>
        }
      />

      <Card sx={{ mt: 3 }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Sayfa Adi</TableCell>
                <TableCell>Slug</TableCell>
                <TableCell>Bolum Sayisi</TableCell>
                <TableCell>SEO</TableCell>
                <TableCell align="center">Durum</TableCell>
                <TableCell>Son Guncelleme</TableCell>
                <TableCell align="right">Islemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>{Array.from({ length: 7 }).map((_, j) => (<TableCell key={j}><Skeleton /></TableCell>))}</TableRow>
                ))
              ) : pages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">Henuz sayfa eklenmemis</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                pages.map((page) => (
                  <TableRow key={page.id} hover>
                    <TableCell><Typography fontWeight={600} fontSize={13}>{page.title}</Typography></TableCell>
                    <TableCell><Typography fontSize={12} color="text.secondary">/{page.slug}</Typography></TableCell>
                    <TableCell>
                      <Chip label={`${Array.isArray(page.sections) ? page.sections.length : 0} bolum`} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      {page.seoTitle ? (
                        <Chip label="SEO OK" size="small" color="success" variant="outlined" />
                      ) : (
                        <Chip label="SEO Eksik" size="small" color="warning" variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={page.isPublished ? 'Yayinda' : 'Taslak'} color={page.isPublished ? 'success' : 'default'} size="small" />
                    </TableCell>
                    <TableCell><Typography fontSize={12} color="text.secondary">{formatDate(page.updatedAt)}</Typography></TableCell>
                    <TableCell align="right">
                      <Tooltip title="Duzenle"><IconButton size="small" onClick={() => handleOpen(page)}><EditIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>
                      <Tooltip title="Sil"><IconButton size="small" color="error" onClick={() => handleDelete(page.id)}><DeleteIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {editing ? 'Sayfa Duzenle' : 'Yeni Sayfa'}
          <IconButton size="small" onClick={() => setDialogOpen(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Sayfa Adi" size="small" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Slug" size="small" value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                helperText="Örnek: hakkimizda, kvkk, iletisim, sss, ekipmanlar" />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="İçerik (HTML)"
                size="small"
                multiline
                rows={14}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                helperText="HTML etiketleri kullanabilirsiniz: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <a> gibi. Web sitesinde olduğu gibi render edilir."
                slotProps={{ htmlInput: { style: { fontFamily: 'ui-monospace, Menlo, Monaco, monospace', fontSize: 13 } } }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 1 }} />
              <Typography fontWeight={600} fontSize={14} sx={{ mb: 1 }}>SEO Ayarlari</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="SEO Title" size="small" value={form.seoTitle}
                onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="SEO Image URL" size="small" value={form.seoImage}
                onChange={(e) => setForm({ ...form, seoImage: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="SEO Description" size="small" multiline rows={2} value={form.seoDescription}
                onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={<Switch checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />}
                label="Yayinla"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Iptal</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !form.title || !form.slug}>
            {saving ? 'Kaydediliyor...' : editing ? 'Guncelle' : 'Olustur'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
