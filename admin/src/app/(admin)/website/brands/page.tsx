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
  Storefront as BrandIcon, Close as CloseIcon,
} from '@mui/icons-material';
import { websiteApi } from '@/lib/api';
import PageHeader from '@/components/common/PageHeader';
import ImageUpload from '@/components/common/ImageUpload';

interface Brand {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

const emptyForm = { name: '', logo: '', description: '', sortOrder: 0, isActive: true };

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchBrands = useCallback(async () => {
    try {
      setLoading(true);
      const res = await websiteApi.getBrands();
      setBrands(Array.isArray(res) ? res : res.data || []);
    } catch { setBrands([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchBrands(); }, [fetchBrands]);

  const handleOpen = (brand?: Brand) => {
    if (brand) {
      setEditing(brand);
      setForm({ name: brand.name, logo: brand.logo || '', description: brand.description || '', sortOrder: brand.sortOrder, isActive: brand.isActive });
    } else {
      setEditing(null);
      setForm({ ...emptyForm, sortOrder: brands.length });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) { await websiteApi.updateBrand(editing.id, form); }
      else { await websiteApi.createBrand(form); }
      setDialogOpen(false);
      fetchBrands();
    } catch { /* toast */ }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu marka silinecek. Emin misiniz?')) return;
    await websiteApi.deleteBrand(id);
    fetchBrands();
  };

  return (
    <Box>
      <PageHeader
        title="Marka Portfoyu"
        subtitle={`${brands.length} marka`}
        icon={<BrandIcon />}
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()} size="small">
            Yeni Marka
          </Button>
        }
      />

      <Card sx={{ mt: 3 }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell width={50}>#</TableCell>
                <TableCell>Logo</TableCell>
                <TableCell>Marka Adi</TableCell>
                <TableCell>Aciklama</TableCell>
                <TableCell align="center">Durum</TableCell>
                <TableCell align="right">Islemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>{Array.from({ length: 6 }).map((_, j) => (<TableCell key={j}><Skeleton /></TableCell>))}</TableRow>
                ))
              ) : brands.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">Henuz marka eklenmemis</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                brands.map((brand, idx) => (
                  <TableRow key={brand.id} hover>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>
                      {brand.logo ? (
                        <Avatar src={brand.logo} variant="rounded" sx={{ width: 40, height: 40 }} />
                      ) : (
                        <Avatar variant="rounded" sx={{ width: 40, height: 40, bgcolor: 'action.hover' }}>{brand.name[0]}</Avatar>
                      )}
                    </TableCell>
                    <TableCell><Typography fontWeight={600} fontSize={13}>{brand.name}</Typography></TableCell>
                    <TableCell>
                      <Typography fontSize={12} color="text.secondary" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {brand.description || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={brand.isActive ? 'Aktif' : 'Pasif'} color={brand.isActive ? 'success' : 'default'} size="small" />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Duzenle"><IconButton size="small" onClick={() => handleOpen(brand)}><EditIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>
                      <Tooltip title="Sil"><IconButton size="small" color="error" onClick={() => handleDelete(brand.id)}><DeleteIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>
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
          {editing ? 'Marka Duzenle' : 'Yeni Marka'}
          <IconButton size="small" onClick={() => setDialogOpen(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Marka Adi" size="small" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <ImageUpload
                label="Marka Logosu (önerilen: 400x200px, şeffaf PNG)"
                value={form.logo}
                onChange={(url) => setForm({ ...form, logo: url as string })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Aciklama" size="small" multiline rows={3} value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField fullWidth label="Siralama" type="number" size="small" value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
            </Grid>
            <Grid size={{ xs: 6 }} sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControlLabel
                control={<Switch checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />}
                label="Aktif"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Iptal</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !form.name}>
            {saving ? 'Kaydediliyor...' : editing ? 'Guncelle' : 'Olustur'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
