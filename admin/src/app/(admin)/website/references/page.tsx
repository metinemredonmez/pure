'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Chip, IconButton, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, Divider, Skeleton, Grid, Tooltip,
  Switch, FormControlLabel, Avatar,
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  WorkspacePremium as RefIcon, Close as CloseIcon,
} from '@mui/icons-material';
import { websiteApi } from '@/lib/api';
import PageHeader from '@/components/common/PageHeader';
import ImageUpload from '@/components/common/ImageUpload';

interface Reference {
  id: string;
  companyName: string;
  logo?: string;
  testimonial?: string;
  contactPerson?: string;
  sector?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

const emptyForm = { companyName: '', logo: '', testimonial: '', contactPerson: '', sector: '', isActive: true, sortOrder: 0 };

export default function ReferencesPage() {
  const [references, setReferences] = useState<Reference[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Reference | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchReferences = useCallback(async () => {
    try {
      setLoading(true);
      const res = await websiteApi.getReferences();
      setReferences(Array.isArray(res) ? res : res.data || []);
    } catch { setReferences([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchReferences(); }, [fetchReferences]);

  const handleOpen = (ref?: Reference) => {
    if (ref) {
      setEditing(ref);
      setForm({ companyName: ref.companyName, logo: ref.logo || '', testimonial: ref.testimonial || '', contactPerson: ref.contactPerson || '', sector: ref.sector || '', isActive: ref.isActive, sortOrder: ref.sortOrder });
    } else {
      setEditing(null);
      setForm({ ...emptyForm, sortOrder: references.length });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) { await websiteApi.updateReference(editing.id, form); }
      else { await websiteApi.createReference(form); }
      setDialogOpen(false);
      fetchReferences();
    } catch { /* toast */ }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu referans silinecek. Emin misiniz?')) return;
    await websiteApi.deleteReference(id);
    fetchReferences();
  };

  return (
    <Box>
      <PageHeader
        title="Referans Musteriler"
        subtitle={`${references.length} referans`}
        icon={<RefIcon />}
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()} size="small">
            Yeni Referans
          </Button>
        }
      />

      <Card sx={{ mt: 3 }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell width={50}>#</TableCell>
                <TableCell>Şirket</TableCell>
                <TableCell>Sektor</TableCell>
                <TableCell>Iletisim Kisisi</TableCell>
                <TableCell>Yorum</TableCell>
                <TableCell align="center">Durum</TableCell>
                <TableCell align="right">Islemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>{Array.from({ length: 7 }).map((_, j) => (<TableCell key={j}><Skeleton /></TableCell>))}</TableRow>
                ))
              ) : references.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">Henuz referans eklenmemis</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                references.map((ref, idx) => (
                  <TableRow key={ref.id} hover>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {ref.logo ? (
                          <Avatar src={ref.logo} variant="rounded" sx={{ width: 32, height: 32 }} />
                        ) : (
                          <Avatar variant="rounded" sx={{ width: 32, height: 32, bgcolor: 'action.hover', fontSize: 12 }}>{ref.companyName[0]}</Avatar>
                        )}
                        <Typography fontWeight={600} fontSize={13}>{ref.companyName}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell><Chip label={ref.sector || 'Belirtilmemis'} size="small" variant="outlined" /></TableCell>
                    <TableCell><Typography fontSize={12}>{ref.contactPerson || '-'}</Typography></TableCell>
                    <TableCell>
                      <Typography fontSize={12} color="text.secondary" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ref.testimonial || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={ref.isActive ? 'Aktif' : 'Pasif'} color={ref.isActive ? 'success' : 'default'} size="small" />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Duzenle"><IconButton size="small" onClick={() => handleOpen(ref)}><EditIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>
                      <Tooltip title="Sil"><IconButton size="small" color="error" onClick={() => handleDelete(ref.id)}><DeleteIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {editing ? 'Referans Duzenle' : 'Yeni Referans'}
          <IconButton size="small" onClick={() => setDialogOpen(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Şirket Adi" size="small" value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Sektor" size="small" value={form.sector}
                onChange={(e) => setForm({ ...form, sector: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <ImageUpload
                label="Firma Logosu (önerilen: 400x200px, şeffaf PNG)"
                value={form.logo}
                onChange={(url) => setForm({ ...form, logo: url as string })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Iletisim Kisisi" size="small" value={form.contactPerson}
                onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Musteri Yorumu" size="small" multiline rows={3} value={form.testimonial}
                onChange={(e) => setForm({ ...form, testimonial: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={<Switch checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />}
                label="Aktif"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Iptal</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !form.companyName}>
            {saving ? 'Kaydediliyor...' : editing ? 'Guncelle' : 'Olustur'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
