'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Chip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, Divider, Skeleton, TablePagination,
} from '@mui/material';
import {
  Visibility as ViewIcon, Delete as DeleteIcon,
  Email as EmailIcon, Close as CloseIcon,
  MarkEmailRead as ReadIcon,
} from '@mui/icons-material';
import { websiteApi } from '@/lib/api';
import PageHeader from '@/components/common/PageHeader';

interface ContactMsg {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMsg[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMsg | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await websiteApi.getContactMessages({ page: page + 1, limit: 20 });
      const data = res?.data || res;
      setMessages(data?.data || []);
      setTotal(data?.total || 0);
    } catch {}
    setLoading(false);
  }, [page]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const handleView = (msg: ContactMsg) => {
    setSelected(msg);
    setDialogOpen(true);
    if (!msg.isRead) {
      websiteApi.getContactMessage(msg.id).catch(() => {});
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isRead: true } : m));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu mesaji silmek istediginize emin misiniz?')) return;
    try {
      await websiteApi.deleteContactMessage(id);
      fetchMessages();
      setDialogOpen(false);
    } catch {}
  };

  const unreadCount = messages.filter(m => !m.isRead).length;

  return (
    <Box>
      <PageHeader
        title="Iletisim Mesajlari"
        subtitle={`${total} mesaj${unreadCount > 0 ? ` (${unreadCount} okunmamis)` : ''}`}
        icon={<EmailIcon />}
      />

      <Card sx={{ mt: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Durum</TableCell>
                <TableCell>Ad Soyad</TableCell>
                <TableCell>E-posta</TableCell>
                <TableCell>Konu</TableCell>
                <TableCell>Tarih</TableCell>
                <TableCell align="right">Islemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}><Skeleton /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : messages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">Henuz mesaj yok</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                messages.map((msg) => (
                  <TableRow key={msg.id} sx={{ fontWeight: msg.isRead ? 'normal' : 'bold', bgcolor: msg.isRead ? 'transparent' : 'action.hover' }}>
                    <TableCell>
                      <Chip
                        size="small"
                        icon={msg.isRead ? <ReadIcon /> : <EmailIcon />}
                        label={msg.isRead ? 'Okundu' : 'Yeni'}
                        color={msg.isRead ? 'default' : 'primary'}
                        variant={msg.isRead ? 'outlined' : 'filled'}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: msg.isRead ? 'normal' : 700 }}>{msg.name}</TableCell>
                    <TableCell>{msg.email}</TableCell>
                    <TableCell>{msg.subject || '-'}</TableCell>
                    <TableCell>{new Date(msg.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleView(msg)}><ViewIcon /></IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(msg.id)}><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={20}
          rowsPerPageOptions={[20]}
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        />
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Mesaj Detayi
          <IconButton onClick={() => setDialogOpen(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <Divider />
        {selected && (
          <DialogContent>
            <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
              <Box><Typography variant="caption" color="text.secondary">Ad Soyad</Typography><Typography fontWeight={600}>{selected.name}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">E-posta</Typography><Typography><a href={`mailto:${selected.email}`}>{selected.email}</a></Typography></Box>
              {selected.phone && <Box><Typography variant="caption" color="text.secondary">Telefon</Typography><Typography><a href={`tel:${selected.phone}`}>{selected.phone}</a></Typography></Box>}
              {selected.subject && <Box><Typography variant="caption" color="text.secondary">Konu</Typography><Typography>{selected.subject}</Typography></Box>}
              <Box><Typography variant="caption" color="text.secondary">Mesaj</Typography><Typography sx={{ whiteSpace: 'pre-wrap', bgcolor: 'grey.50', p: 2, borderRadius: 1, mt: 0.5 }}>{selected.message}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Tarih</Typography><Typography>{new Date(selected.createdAt).toLocaleString('tr-TR')}</Typography></Box>
            </Box>
          </DialogContent>
        )}
        <DialogActions>
          {selected && <Button color="error" onClick={() => handleDelete(selected.id)}>Sil</Button>}
          <Button onClick={() => setDialogOpen(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
