'use client';
import { useEffect, useState, useCallback } from 'react';
import { Box, Typography, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Chip, Skeleton, TextField, InputAdornment, Stack } from '@mui/material';
import { Search as SearchIcon, History as LogIcon } from '@mui/icons-material';
import { auditApi } from '@/lib/api';
import { olentiaColors } from '@/lib/theme';
import PageHeader from '@/components/common/PageHeader';
import ExportButton from '@/components/common/ExportButton';

function formatDate(d: string) { return new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }

interface AuditLog { id: string; action: string; entity: string; entityId?: string; userId?: string; user?: { email: string; firstName?: string }; ipAddress?: string; createdAt: string; }

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const fetchLogs = useCallback(async () => {
    try { setLoading(true); const r = await auditApi.getLogs({ page: page + 1, limit: 20 }); const d = r.data || r; setLogs(d.data || d.items || d || []); setTotal(d.meta?.total || d.total || 0); } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [page]);
  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const actionColors: Record<string, 'info' | 'success' | 'error' | 'warning' | 'default'> = { CREATE: 'success', UPDATE: 'info', DELETE: 'error', LOGIN: 'warning' };

  return (
    <Box>
      <PageHeader
        title="Denetim Logları"
        subtitle="Sistem aktivitelerini takip et"
        breadcrumbs={[{ label: 'Denetim Logları' }]}
        action={
          <ExportButton
            data={logs}
            columns={[
              { key: 'createdAt', label: 'Tarih' },
              { key: 'user.email', label: 'Kullanıcı' },
              { key: 'action', label: 'İşlem' },
              { key: 'entity', label: 'Varlık' },
              { key: 'entityId', label: 'Varlık ID' },
              { key: 'ipAddress', label: 'IP Adresi' },
            ]}
            filename="denetim-loglari"
          />
        }
      />
      <Card><TableContainer><Table size="small">
        <TableHead><TableRow><TableCell sx={{ fontWeight: 600 }}>Tarih</TableCell><TableCell sx={{ fontWeight: 600 }}>Kullanıcı</TableCell><TableCell sx={{ fontWeight: 600 }}>İşlem</TableCell><TableCell sx={{ fontWeight: 600 }}>Varlık</TableCell><TableCell sx={{ fontWeight: 600 }}>ID</TableCell><TableCell sx={{ fontWeight: 600 }}>IP</TableCell></TableRow></TableHead>
        <TableBody>
          {loading ? Array.from({ length: 10 }).map((_, i) => <TableRow key={i}>{Array.from({ length: 6 }).map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}</TableRow>)
          : logs.length === 0 ? <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6 }}><LogIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} /><Typography color="text.secondary">Log bulunamadı</Typography></TableCell></TableRow>
          : logs.map((l) => (
            <TableRow key={l.id} hover>
              <TableCell><Typography variant="caption">{formatDate(l.createdAt)}</Typography></TableCell>
              <TableCell><Typography variant="body2">{l.user?.firstName || l.user?.email || l.userId?.slice(0, 8) || '-'}</Typography></TableCell>
              <TableCell><Chip label={l.action} size="small" color={actionColors[l.action] || 'default'} variant="outlined" sx={{ height: 22 }} /></TableCell>
              <TableCell><Typography variant="body2">{l.entity}</Typography></TableCell>
              <TableCell><Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{l.entityId?.slice(0, 12) || '-'}</Typography></TableCell>
              <TableCell><Typography variant="caption" color="text.secondary">{l.ipAddress || '-'}</Typography></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table></TableContainer>
      <TablePagination component="div" count={total} page={page} onPageChange={(_, p) => setPage(p)} rowsPerPage={20} onRowsPerPageChange={() => {}} rowsPerPageOptions={[20]} labelRowsPerPage="" labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`} /></Card>
    </Box>
  );
}
