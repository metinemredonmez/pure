'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination, Skeleton, Dialog,
  DialogTitle, DialogContent, IconButton, Divider, Stack, Chip, Avatar, Alert,
} from '@mui/material';
import {
  Chat as ChatIcon, Close as CloseIcon, Visibility as ViewIcon,
  Info as InfoIcon, SmartToy as BotIcon, Person as PersonIcon,
  Schedule as TimeIcon,
} from '@mui/icons-material';
import { chatbotApi } from '@/lib/api';
import { olentiaColors } from '@/lib/theme';
import PageHeader from '@/components/common/PageHeader';
import ExportButton from '@/components/common/ExportButton';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

interface Session { id: string; sessionId: string; userId?: string; messageCount?: number; lastMessageAt?: string; createdAt: string; }
interface Message { role: string; content: string; createdAt: string; }

export default function ChatbotPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const r = await chatbotApi.getSessions({ page: page + 1, limit: 10 });
      const d = r.data || r;
      setSessions(d.data || d.items || d || []);
      setTotal(d.meta?.total || d.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const viewSession = async (sessionId: string) => {
    setSelectedSession(sessionId);
    setMsgLoading(true);
    try {
      const r = await chatbotApi.getSessionHistory(sessionId);
      const d = r.data || r;
      setMessages(Array.isArray(d) ? d : d.messages || d.data || []);
    } catch (e) {
      console.error(e);
      setMessages([]);
    } finally {
      setMsgLoading(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Chatbot Yonetimi"
        subtitle="Musteri chatbot konusmalarini incele ve analiz et"
        breadcrumbs={[{ label: 'Chatbot' }]}
        action={
          <ExportButton
            data={sessions}
            columns={[
              { key: 'sessionId', label: 'Oturum ID' },
              { key: 'messageCount', label: 'Mesaj' },
              { key: 'lastMessageAt', label: 'Son Mesaj' },
              { key: 'createdAt', label: 'Baslangic' },
            ]}
            filename="chatbot-oturumlar"
          />
        }
      />

      {/* Info */}
      <Card sx={{ mb: 3, p: 2, bgcolor: `${olentiaColors.primary.main}08`, border: `1px solid ${olentiaColors.primary.main}20` }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <InfoIcon sx={{ color: olentiaColors.primary.main, fontSize: 20 }} />
          <Box>
            <Typography variant="body2" fontWeight={600} sx={{ color: olentiaColors.primary.main }}>AI Chatbot</Typography>
            <Typography variant="caption" color="text.secondary">
              Musteri web sitesindeki chatbot konusmalarini buradan takip edebilirsiniz.
              Her oturumun mesaj gecmisi goruntulenebilir. Bot OpenAI GPT ile calismaktadir.
            </Typography>
          </Box>
        </Stack>
      </Card>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { title: 'Toplam Oturum', value: total, icon: <ChatIcon />, color: '#4FC3F7' },
          { title: 'Aktif Oturum', value: sessions.filter(s => {
            const last = s.lastMessageAt ? new Date(s.lastMessageAt) : new Date(s.createdAt);
            return Date.now() - last.getTime() < 3600000;
          }).length, icon: <BotIcon />, color: '#66BB6A' },
        ].map((c) => (
          <Grid key={c.title} size={{ xs: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: `${c.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color }}>{c.icon}</Box>
                  <Box>
                    <Typography variant="h5" fontWeight={800}>{c.value}</Typography>
                    <Typography variant="caption" color="text.secondary">{c.title}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Sessions Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Oturum</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Mesaj</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Son Mesaj</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Baslangic</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Islem</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>{Array.from({ length: 5 }).map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}</TableRow>
                  ))
                : sessions.length === 0
                ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <ChatIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1.5 }} />
                      <Typography variant="h6" color="text.secondary" fontWeight={600}>
                        Henuz chatbot oturumu yok
                      </Typography>
                      <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
                        Musteriler web sitesindeki chatbot ile konustugunda oturumlar burada gorunecektir.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )
                : sessions.map((s) => (
                    <TableRow key={s.id} hover sx={{ cursor: 'pointer' }} onClick={() => viewSession(s.sessionId || s.id)}>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar sx={{ width: 30, height: 30, bgcolor: `${olentiaColors.primary.main}15`, color: olentiaColors.primary.main, fontSize: 14 }}>
                            <ChatIcon sx={{ fontSize: 16 }} />
                          </Avatar>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 11 }}>
                            {(s.sessionId || s.id).slice(0, 16)}...
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip label={s.messageCount || 0} size="small"
                          sx={{ height: 24, fontWeight: 700, bgcolor: `${olentiaColors.primary.main}12`, color: olentiaColors.primary.main }} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {s.lastMessageAt ? formatDate(s.lastMessageAt) : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">{formatDate(s.createdAt)}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={() => viewSession(s.sessionId || s.id)}>
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div" count={total} page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={10} onRowsPerPageChange={() => {}}
          rowsPerPageOptions={[10]} labelRowsPerPage=""
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        />
      </Card>

      {/* ═══ SESSION DETAIL DIALOG ═══ */}
      <Dialog open={!!selectedSession} onClose={() => setSelectedSession(null)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { bgcolor: 'background.paper', backgroundImage: 'none' } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <ChatIcon sx={{ color: olentiaColors.primary.main }} />
            <Box>
              <Typography variant="h6" fontWeight={700}>Konusma Gecmisi</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                {selectedSession?.slice(0, 20)}...
              </Typography>
            </Box>
          </Stack>
          <IconButton onClick={() => setSelectedSession(null)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ maxHeight: 450 }}>
          {msgLoading
            ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={50} sx={{ mb: 1, borderRadius: 2 }} />)
            : messages.length > 0
            ? (
              <Stack spacing={1.5} sx={{ py: 1 }}>
                {messages.map((m, i) => (
                  <Box key={i} sx={{
                    p: 1.5, borderRadius: 2,
                    bgcolor: m.role === 'user' ? 'rgba(255,255,255,0.04)' : `${olentiaColors.primary.main}08`,
                    borderLeft: `3px solid ${m.role === 'user' ? '#4FC3F7' : olentiaColors.primary.main}`,
                  }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                      {m.role === 'user'
                        ? <PersonIcon sx={{ fontSize: 16, color: '#4FC3F7' }} />
                        : <BotIcon sx={{ fontSize: 16, color: olentiaColors.primary.main }} />}
                      <Typography variant="caption" fontWeight={700} color={m.role === 'user' ? '#4FC3F7' : olentiaColors.primary.main}>
                        {m.role === 'user' ? 'Musteri' : 'Bot'}
                      </Typography>
                      <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
                        {formatDate(m.createdAt)}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ lineHeight: 1.7 }}>{m.content}</Typography>
                  </Box>
                ))}
              </Stack>
            )
            : (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <ChatIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">Bu oturumda mesaj bulunamadi</Typography>
              </Box>
            )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
