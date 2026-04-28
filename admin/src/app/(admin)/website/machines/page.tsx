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
  CoffeeMaker as MachineIcon, Close as CloseIcon,
} from '@mui/icons-material';
import { websiteApi } from '@/lib/api';
import PageHeader from '@/components/common/PageHeader';
import ImageUpload from '@/components/common/ImageUpload';

interface MachineModule {
  id?: string;
  name: string;
  width: number;
  height: number;
  depth: number;
  variant?: string;
}

interface Machine {
  id: string;
  name: string;
  slug: string;
  description?: string;
  images: string[];
  capacity?: string;
  dailyCupMin?: number;
  dailyCupMax?: number;
  drinkCount?: number;
  features: string[];
  isActive: boolean;
  sortOrder: number;
  modules: MachineModule[];
  createdAt: string;
}

const emptyForm = {
  name: '', slug: '', description: '', images: '' as string, capacity: '',
  dailyCupMin: 0, dailyCupMax: 0, drinkCount: 0, features: '' as string,
  isActive: true, sortOrder: 0,
  modules: [] as MachineModule[],
};

const emptyModule: MachineModule = { name: '', width: 0, height: 0, depth: 0, variant: '' };

export default function MachinesPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Machine | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchMachines = useCallback(async () => {
    try {
      setLoading(true);
      const res = await websiteApi.getMachines();
      setMachines(Array.isArray(res) ? res : res.data || []);
    } catch { setMachines([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchMachines(); }, [fetchMachines]);

  const handleOpen = (machine?: Machine) => {
    if (machine) {
      setEditing(machine);
      setForm({
        name: machine.name, slug: machine.slug, description: machine.description || '',
        images: machine.images.join(', '), capacity: machine.capacity || '',
        dailyCupMin: machine.dailyCupMin || 0, dailyCupMax: machine.dailyCupMax || 0,
        drinkCount: machine.drinkCount || 0, features: machine.features.join(', '),
        isActive: machine.isActive, sortOrder: machine.sortOrder,
        modules: machine.modules.map(m => ({ name: m.name, width: m.width, height: m.height, depth: m.depth, variant: m.variant || '' })),
      });
    } else {
      setEditing(null);
      setForm({ ...emptyForm, sortOrder: machines.length, modules: [] });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        images: form.images ? form.images.split(',').map(s => s.trim()).filter(Boolean) : [],
        features: form.features ? form.features.split(',').map(s => s.trim()).filter(Boolean) : [],
        modules: form.modules.filter(m => m.name),
      };
      if (editing) {
        await websiteApi.updateMachine(editing.id, payload);
      } else {
        await websiteApi.createMachine(payload);
      }
      setDialogOpen(false);
      fetchMachines();
    } catch { /* toast */ }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu makine silinecek. Emin misiniz?')) return;
    await websiteApi.deleteMachine(id);
    fetchMachines();
  };

  const addModule = () => setForm({ ...form, modules: [...form.modules, { ...emptyModule }] });
  const removeModule = (idx: number) => setForm({ ...form, modules: form.modules.filter((_, i) => i !== idx) });
  const updateModule = (idx: number, field: string, value: any) => {
    const updated = [...form.modules];
    (updated[idx] as any)[field] = value;
    setForm({ ...form, modules: updated });
  };

  return (
    <Box>
      <PageHeader
        title="Makine Katalogu"
        subtitle={`${machines.length} makine`}
        icon={<MachineIcon />}
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()} size="small">
            Yeni Makine
          </Button>
        }
      />

      <Card sx={{ mt: 3 }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Makine</TableCell>
                <TableCell>Kapasite</TableCell>
                <TableCell>Gunluk Bardak</TableCell>
                <TableCell>Icecek Cesidi</TableCell>
                <TableCell>Moduller</TableCell>
                <TableCell align="center">Durum</TableCell>
                <TableCell align="right">Islemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}><Skeleton /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : machines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">Henuz makine eklenmemis</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                machines.map((machine) => (
                  <TableRow key={machine.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {machine.images[0] && (
                          <Box component="img" src={machine.images[0]} alt={machine.name}
                            sx={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 1 }}
                            onError={(e: any) => { e.target.style.display = 'none'; }} />
                        )}
                        <Box>
                          <Typography fontWeight={600} fontSize={13}>{machine.name}</Typography>
                          <Typography fontSize={11} color="text.secondary">{machine.slug}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{machine.capacity || '-'}</TableCell>
                    <TableCell>
                      {machine.dailyCupMin && machine.dailyCupMax
                        ? `${machine.dailyCupMin}-${machine.dailyCupMax}`
                        : '-'}
                    </TableCell>
                    <TableCell>{machine.drinkCount || '-'}</TableCell>
                    <TableCell>
                      {machine.modules.length > 0 ? (
                        <Chip label={`${machine.modules.length} modul`} size="small" variant="outlined" />
                      ) : '-'}
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={machine.isActive ? 'Aktif' : 'Pasif'} color={machine.isActive ? 'success' : 'default'} size="small" />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Duzenle">
                        <IconButton size="small" onClick={() => handleOpen(machine)}><EditIcon sx={{ fontSize: 18 }} /></IconButton>
                      </Tooltip>
                      <Tooltip title="Sil">
                        <IconButton size="small" color="error" onClick={() => handleDelete(machine.id)}><DeleteIcon sx={{ fontSize: 18 }} /></IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {editing ? 'Makine Duzenle' : 'Yeni Makine'}
          <IconButton size="small" onClick={() => setDialogOpen(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Makine Adi" size="small" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Slug" size="small" value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Aciklama" size="small" multiline rows={2} value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <ImageUpload
                label="Makine Görselleri (önerilen: 1200x800px, birden fazla seçilebilir)"
                value={form.images ? String(form.images).split(',').map((s: string) => s.trim()).filter(Boolean) : []}
                onChange={(urls) => setForm({ ...form, images: Array.isArray(urls) ? urls.join(',') : urls })}
                multiple
                maxFiles={8}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField fullWidth label="Kapasite" size="small" value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField fullWidth label="Min Bardak/Gun" type="number" size="small" value={form.dailyCupMin}
                onChange={(e) => setForm({ ...form, dailyCupMin: Number(e.target.value) })} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField fullWidth label="Max Bardak/Gun" type="number" size="small" value={form.dailyCupMax}
                onChange={(e) => setForm({ ...form, dailyCupMax: Number(e.target.value) })} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField fullWidth label="Icecek Cesidi" type="number" size="small" value={form.drinkCount}
                onChange={(e) => setForm({ ...form, drinkCount: Number(e.target.value) })} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Ozellikler (virgullu)" size="small" value={form.features}
                onChange={(e) => setForm({ ...form, features: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={<Switch checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />}
                label="Aktif"
              />
            </Grid>

            {/* Modules */}
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography fontWeight={600} fontSize={14}>Modul Boyutlari</Typography>
                <Button size="small" startIcon={<AddIcon />} onClick={addModule}>Modul Ekle</Button>
              </Box>
              {form.modules.map((mod, idx) => (
                <Grid container spacing={1} key={idx} sx={{ mb: 1 }}>
                  <Grid size={{ xs: 3 }}>
                    <TextField fullWidth label="Modul Adi" size="small" value={mod.name}
                      onChange={(e) => updateModule(idx, 'name', e.target.value)} />
                  </Grid>
                  <Grid size={{ xs: 2 }}>
                    <TextField fullWidth label="Genislik (mm)" type="number" size="small" value={mod.width}
                      onChange={(e) => updateModule(idx, 'width', Number(e.target.value))} />
                  </Grid>
                  <Grid size={{ xs: 2 }}>
                    <TextField fullWidth label="Yukseklik (mm)" type="number" size="small" value={mod.height}
                      onChange={(e) => updateModule(idx, 'height', Number(e.target.value))} />
                  </Grid>
                  <Grid size={{ xs: 2 }}>
                    <TextField fullWidth label="Derinlik (mm)" type="number" size="small" value={mod.depth}
                      onChange={(e) => updateModule(idx, 'depth', Number(e.target.value))} />
                  </Grid>
                  <Grid size={{ xs: 2 }}>
                    <TextField fullWidth label="Varyant" size="small" value={mod.variant}
                      onChange={(e) => updateModule(idx, 'variant', e.target.value)} />
                  </Grid>
                  <Grid size={{ xs: 1 }} sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton size="small" color="error" onClick={() => removeModule(idx)}>
                      <DeleteIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Iptal</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !form.name || !form.slug}>
            {saving ? 'Kaydediliyor...' : editing ? 'Guncelle' : 'Olustur'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
