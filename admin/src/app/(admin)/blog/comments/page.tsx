'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Box, Card, Chip, IconButton, Skeleton, Stack, Tab, Table, TableBody, TableCell,
  TableContainer, TableHead, TablePagination, TableRow, Tabs, Tooltip, Typography,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon, Cancel as RejectIcon, Delete as DeleteIcon,
  ChatBubbleOutline as CommentIcon, HourglassEmpty as PendingIcon,
} from '@mui/icons-material';
import { blogCommentsApi } from '@/lib/api';
import PageHeader from '@/components/common/PageHeader';

type Status = 'PENDING' | 'APPROVED' | 'REJECTED';

interface BlogComment {
  id: string;
  authorName: string;
  authorEmail?: string | null;
  body: string;
  status: Status;
  createdAt: string;
  post: { id: string; title: string; slug: string };
}

const statusConfig: Record<Status, { label: string; color: 'default' | 'success' | 'warning' | 'error' }> = {
  PENDING: { label: 'Bekliyor', color: 'warning' },
  APPROVED: { label: 'Onaylı', color: 'success' },
  REJECTED: { label: 'Reddedildi', color: 'error' },
};

function formatDate(date: string) {
  return new Date(date).toLocaleString('tr-TR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function BlogCommentsPage() {
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [total, setTotal] = useState(0);
  const [tab, setTab] = useState<Status | 'ALL'>('PENDING');

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await blogCommentsApi.list({
        status: tab === 'ALL' ? undefined : tab,
        page: page + 1,
        limit: rowsPerPage,
      });
      const result = response.data || response;
      setComments(result.data || result.items || result || []);
      setTotal(result.meta?.total || result.total || 0);
    } catch (error) {
      console.error('Yorumlar yüklenemedi:', error);
      setComments([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, tab]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSetStatus = async (id: string, status: Status) => {
    try {
      await blogCommentsApi.setStatus(id, status);
      fetchComments();
    } catch (error) {
      console.error('Durum güncellenemedi:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu yorumu silmek istediğinize emin misiniz?')) return;
    try {
      await blogCommentsApi.remove(id);
      fetchComments();
    } catch (error) {
      console.error('Yorum silinemedi:', error);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Blog Yorumları"
        subtitle="Yorumları onayla, reddet veya sil"
        breadcrumbs={[{ label: 'Blog', href: '/blog' }, { label: 'Yorumlar' }]}
      />

      <Card>
        <Tabs
          value={tab}
          onChange={(_, v) => {
            setTab(v);
            setPage(0);
          }}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<PendingIcon fontSize="small" />} iconPosition="start" label="Bekleyen" value="PENDING" />
          <Tab icon={<ApproveIcon fontSize="small" />} iconPosition="start" label="Onaylı" value="APPROVED" />
          <Tab icon={<RejectIcon fontSize="small" />} iconPosition="start" label="Reddedilen" value="REJECTED" />
          <Tab label="Hepsi" value="ALL" />
        </Tabs>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Yorum</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Yazar</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Yazı</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Durum</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tarih</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">İşlem</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : comments.length === 0
                ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                        <CommentIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                        <Typography color="text.secondary">Yorum bulunamadı</Typography>
                      </TableCell>
                    </TableRow>
                  )
                : comments.map((c) => (
                    <TableRow key={c.id} hover>
                      <TableCell sx={{ maxWidth: 400 }}>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                          {c.body}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{c.authorName}</Typography>
                        {c.authorEmail && (
                          <Typography variant="caption" color="text.secondary">{c.authorEmail}</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>{c.post?.title}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: 11 }}>
                          /{c.post?.slug}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={statusConfig[c.status].label}
                          color={statusConfig[c.status].color}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">{formatDate(c.createdAt)}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          {c.status !== 'APPROVED' && (
                            <Tooltip title="Onayla">
                              <IconButton size="small" color="success" onClick={() => handleSetStatus(c.id, 'APPROVED')}>
                                <ApproveIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {c.status !== 'REJECTED' && (
                            <Tooltip title="Reddet">
                              <IconButton size="small" color="warning" onClick={() => handleSetStatus(c.id, 'REJECTED')}>
                                <RejectIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Sil">
                            <IconButton size="small" color="error" onClick={() => handleDelete(c.id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 20, 50, 100]}
          labelRowsPerPage="Sayfa başına:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        />
      </Card>
    </Box>
  );
}
