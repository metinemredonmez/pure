'use client';
import { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Skeleton, Button, Stack, IconButton, Tooltip, Switch, Tabs, Tab, Alert } from '@mui/material';
import { Storage as CacheIcon, Schedule as CronIcon, IntegrationInstructions as IntIcon, PlayArrow as TriggerIcon, Refresh as RefreshIcon, DeleteSweep as FlushIcon } from '@mui/icons-material';
import { cacheApi, cronApi, integrationsApi } from '@/lib/api';
import { olentiaColors } from '@/lib/theme';

export default function OpsPage() {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [cacheStats, setCacheStats] = useState<Record<string, unknown> | null>(null);
  const [cronJobs, setCronJobs] = useState<{ name: string; schedule?: string; isActive?: boolean; lastRun?: string; status?: string }[]>([]);
  const [integrationGroups, setIntegrationGroups] = useState<{ group: string; label: string; totalSettings: number; configuredSettings: number }[]>([]);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    setLoading(true);
    if (tab === 0) { cacheApi.getStats().then(r => setCacheStats(r.data || r)).catch(() => {}).finally(() => setLoading(false)); }
    else if (tab === 1) { cronApi.getJobs().then(r => { const d = r.data || r; setCronJobs(Array.isArray(d) ? d : d.data || []); }).catch(() => {}).finally(() => setLoading(false)); }
    else { integrationsApi.getGroups().then(r => { const d = r.data || r; setIntegrationGroups(Array.isArray(d) ? d : d.data || []); }).catch(() => {}).finally(() => setLoading(false)); }
  }, [tab]);

  const handleFlushCache = async () => { try { await cacheApi.flushAll(); setActionMsg('Cache temizlendi'); setTimeout(() => setActionMsg(''), 3000); } catch (e) { console.error(e); } };
  const handleWarmUp = async () => { try { await cacheApi.warmUp(); setActionMsg('Cache ısıtıldı'); setTimeout(() => setActionMsg(''), 3000); } catch (e) { console.error(e); } };
  const handleTriggerJob = async (name: string) => { try { await cronApi.triggerJob(name); setActionMsg(`${name} tetiklendi`); setTimeout(() => setActionMsg(''), 3000); } catch (e) { console.error(e); } };
  const handleToggleJob = async (name: string) => { try { await cronApi.toggleJob(name); const r = await cronApi.getJobs(); const d = r.data || r; setCronJobs(Array.isArray(d) ? d : []); } catch (e) { console.error(e); } };
  const handleTestConnection = async (group: string) => { try { await integrationsApi.testConnection(group); setActionMsg(`${group} bağlantısı başarılı`); setTimeout(() => setActionMsg(''), 3000); } catch (e) { setActionMsg(`${group} bağlantı hatası`); setTimeout(() => setActionMsg(''), 3000); } };

  return (
    <Box>
      <Box sx={{ mb: 3 }}><Typography variant="h5" fontWeight={700}>Sistem Yönetimi</Typography><Typography variant="body2" color="text.secondary">Cache, Cron İşleri ve Entegrasyonlar</Typography></Box>
      {actionMsg && <Alert severity="info" sx={{ mb: 2 }}>{actionMsg}</Alert>}
      <Card sx={{ mb: 2 }}><Tabs value={tab} onChange={(_, v) => setTab(v)}><Tab label="Cache" icon={<CacheIcon />} iconPosition="start" /><Tab label="Cron İşleri" icon={<CronIcon />} iconPosition="start" /><Tab label="Entegrasyonlar" icon={<IntIcon />} iconPosition="start" /></Tabs></Card>

      {tab === 0 && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Card><CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={700}>Cache İstatistikleri</Typography>
                <Stack direction="row" spacing={1}><Button size="small" variant="outlined" startIcon={<RefreshIcon />} onClick={handleWarmUp}>Isıt</Button><Button size="small" variant="outlined" color="error" startIcon={<FlushIcon />} onClick={handleFlushCache}>Temizle</Button></Stack>
              </Box>
              {loading ? <Skeleton height={100} /> : cacheStats ? <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: 12 }}>{JSON.stringify(cacheStats, null, 2)}</Typography> : <Typography variant="body2" color="text.secondary">Veri yok</Typography>}
            </CardContent></Card>
          </Grid>
        </Grid>
      )}

      {tab === 1 && (
        <Card><TableContainer><Table>
          <TableHead><TableRow><TableCell sx={{ fontWeight: 600 }}>İş</TableCell><TableCell sx={{ fontWeight: 600 }}>Zamanlama</TableCell><TableCell sx={{ fontWeight: 600 }}>Durum</TableCell><TableCell sx={{ fontWeight: 600 }}>Son Çalışma</TableCell><TableCell sx={{ fontWeight: 600 }} align="center">Aktif</TableCell><TableCell sx={{ fontWeight: 600 }} align="center">İşlem</TableCell></TableRow></TableHead>
          <TableBody>
            {loading ? Array.from({ length: 5 }).map((_, i) => <TableRow key={i}>{Array.from({ length: 6 }).map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}</TableRow>)
            : cronJobs.length === 0 ? <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6 }}><Typography color="text.secondary">Cron işi bulunamadı</Typography></TableCell></TableRow>
            : cronJobs.map((j) => (
              <TableRow key={j.name} hover>
                <TableCell><Typography variant="body2" fontWeight={600}>{j.name}</Typography></TableCell>
                <TableCell><Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{j.schedule || '-'}</Typography></TableCell>
                <TableCell><Chip label={j.status || 'IDLE'} size="small" color={j.status === 'RUNNING' ? 'info' : j.status === 'SUCCESS' ? 'success' : j.status === 'FAILED' ? 'error' : 'default'} variant="outlined" /></TableCell>
                <TableCell><Typography variant="caption" color="text.secondary">{j.lastRun ? new Date(j.lastRun).toLocaleString('tr-TR') : '-'}</Typography></TableCell>
                <TableCell align="center"><Switch size="small" checked={j.isActive !== false} onChange={() => handleToggleJob(j.name)} /></TableCell>
                <TableCell align="center"><Tooltip title="Tetikle"><IconButton size="small" onClick={() => handleTriggerJob(j.name)} color="primary"><TriggerIcon fontSize="small" /></IconButton></Tooltip></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table></TableContainer></Card>
      )}

      {tab === 2 && (
        <Card><TableContainer><Table>
          <TableHead><TableRow><TableCell sx={{ fontWeight: 600 }}>Grup</TableCell><TableCell sx={{ fontWeight: 600 }} align="center">Ayar Sayısı</TableCell><TableCell sx={{ fontWeight: 600 }} align="center">Yapılandırılmış</TableCell><TableCell sx={{ fontWeight: 600 }} align="center">Test</TableCell></TableRow></TableHead>
          <TableBody>
            {loading ? Array.from({ length: 5 }).map((_, i) => <TableRow key={i}>{Array.from({ length: 4 }).map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}</TableRow>)
            : integrationGroups.length === 0 ? <TableRow><TableCell colSpan={4} align="center" sx={{ py: 6 }}><Typography color="text.secondary">Entegrasyon bulunamadı</Typography></TableCell></TableRow>
            : integrationGroups.map((g) => (
              <TableRow key={g.group} hover>
                <TableCell><Typography variant="body2" fontWeight={600}>{g.label || g.group}</Typography></TableCell>
                <TableCell align="center"><Chip label={g.totalSettings || 0} size="small" variant="outlined" /></TableCell>
                <TableCell align="center"><Chip label={g.configuredSettings || 0} size="small" color={g.configuredSettings === g.totalSettings ? 'success' : 'warning'} variant="outlined" /></TableCell>
                <TableCell align="center"><Button size="small" onClick={() => handleTestConnection(g.group)}>Test Et</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table></TableContainer></Card>
      )}
    </Box>
  );
}
