'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Chip, Stack, IconButton,
  Skeleton, Avatar, FormControlLabel, Switch, ToggleButtonGroup, ToggleButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Select, MenuItem, FormControl, InputLabel, TextField, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Checkbox,
} from '@mui/material';
import {
  ChevronLeft, ChevronRight, Today as TodayIcon,
  ShoppingCart as OrderIcon, Payment as PaymentIcon,
  Subscriptions as SubIcon, LocalShipping as ShipIcon,
  Edit as EditIcon, OpenInNew as OpenIcon, Close as CloseIcon,
  Save as SaveIcon, Add as AddIcon, Event as MeetingIcon,
  Delete as DeleteIcon,
  CalendarMonth as CalendarViewIcon, ViewList as ListViewIcon,
  EditNote as EditViewIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { ordersApi, paymentsApi, subscriptionsApi, calendarApi } from '@/lib/api';
import { olentiaColors } from '@/lib/theme';
import PageHeader from '@/components/common/PageHeader';
import { useToast } from '@/contexts/ToastContext';

const EVENT_TYPES = {
  meeting: { label: 'Toplantı', color: '#FF6B6B', icon: <MeetingIcon sx={{ fontSize: 14 }} />, editableFields: ['title'] },
  order: { label: 'Sipariş', color: '#D4793F', icon: <OrderIcon sx={{ fontSize: 14 }} />, editableFields: ['status'] },
  payment: { label: 'Ödeme', color: '#4CAF50', icon: <PaymentIcon sx={{ fontSize: 14 }} />, editableFields: ['status'] },
  subscription: { label: 'Abonelik', color: '#42A5F5', icon: <SubIcon sx={{ fontSize: 14 }} />, editableFields: ['status'] },
  shipping: { label: 'Kargo', color: '#AB47BC', icon: <ShipIcon sx={{ fontSize: 14 }} />, editableFields: ['status'] },
} as const;

type EventType = keyof typeof EVENT_TYPES;

interface CalendarEvent {
  id: string;
  originalId: string; // actual DB id
  type: EventType;
  title: string;
  subtitle?: string;
  date: string;
  amount?: number;
  status?: string;
  extra?: Record<string, any>; // all raw data
}

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'RETURNED'];
const PAYMENT_STATUSES = ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'];
const SUB_STATUSES = ['ACTIVE', 'PAUSED', 'CANCELLED', 'EXPIRED', 'TRIAL'];

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Beklemede', CONFIRMED: 'Onaylandı', PREPARING: 'Hazırlanıyor',
  SHIPPED: 'Kargoda', IN_TRANSIT: 'Yolda', DELIVERED: 'Teslim Edildi',
  CANCELLED: 'İptal', RETURNED: 'İade', REFUNDED: 'İade Edildi',
  PAYMENT_FAILED: 'Ödeme Başarısız',
  COMPLETED: 'Tamamlandı', FAILED: 'Başarısız', PROCESSING: 'İşleniyor',
  ACTIVE: 'Aktif', PAUSED: 'Duraklatıldı', EXPIRED: 'Süresi Doldu', TRIAL: 'Deneme',
  PAST_DUE: 'Gecikmiş', SUSPENDED: 'Askıda',
};

const STATUS_COLORS: Record<string, string> = {
  DELIVERED: '#4caf50', COMPLETED: '#4caf50', ACTIVE: '#4caf50',
  CONFIRMED: '#66bb6a', PREPARING: '#ff9800', PENDING: '#ffa726',
  SHIPPED: '#42a5f5', IN_TRANSIT: '#29b6f6', PROCESSING: '#29b6f6',
  CANCELLED: '#f44336', FAILED: '#f44336', PAYMENT_FAILED: '#f44336',
  RETURNED: '#ef5350', REFUNDED: '#ef5350',
  PAUSED: '#ffb74d', TRIAL: '#ab47bc', EXPIRED: '#9e9e9e',
  PAST_DUE: '#ff7043', SUSPENDED: '#e53935',
};

function getStatusChipSx(status: string) {
  const color = STATUS_COLORS[status] || '#9e9e9e';
  return { height: 20, fontSize: 10, bgcolor: `${color}18`, color, borderColor: `${color}40` };
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n);
}

const DAYS_TR = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const MONTHS_TR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const days: { date: Date; isCurrentMonth: boolean }[] = [];
  for (let i = startDow - 1; i >= 0; i--) {
    days.push({ date: new Date(year, month, -i), isCurrentMonth: false });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ date: new Date(year, month, i), isCurrentMonth: true });
  }
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
  }
  return days;
}

function toDateStr(d: Date) { return d.toISOString().split('T')[0]; }

export default function CalendarPage() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(toDateStr(new Date()));
  const [viewMode, setViewMode] = useState<'calendar' | 'list' | 'edit'>('calendar');
  const [filters, setFilters] = useState<Record<EventType, boolean>>({
    meeting: true, order: true, payment: true, subscription: true, shipping: true,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void }>({ open: false, title: '', message: '', onConfirm: () => {} });

  // Meeting create dialog
  const [meetingDialog, setMeetingDialog] = useState(false);
  const [meetingForm, setMeetingForm] = useState({
    title: '', description: '', startDate: '', startTime: '09:00',
    endTime: '10:00', location: '', allDay: false,
  });

  // Edit dialog state
  const [editEvent, setEditEvent] = useState<CalendarEvent | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const router = useRouter();
  const { showSuccess, showError } = useToast();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthDays = useMemo(() => getMonthDays(year, month), [year, month]);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const allEvents: CalendarEvent[] = [];

    try {
      // Fetch orders
      const ordersRes = await ordersApi.getOrders({ page: 1, limit: 100 }).catch(() => ({ data: [] }));
      const orders = ordersRes.data || ordersRes;
      const orderList = Array.isArray(orders) ? orders : (orders?.data || orders?.items || []);
      orderList.forEach((o: any) => {
        if (o.createdAt) {
          allEvents.push({
            id: `order-${o.id}`, originalId: o.id, type: 'order',
            title: o.orderNumber || `#${o.id?.slice(-6)}`,
            subtitle: o.user?.firstName ? `${o.user.firstName} ${o.user.lastName}` : o.user?.email,
            date: o.createdAt.split('T')[0],
            amount: Number(o.total || o.totalAmount || 0),
            status: o.status,
            extra: o,
          });
        }
      });

      // Fetch payments
      const paymentsRes = await paymentsApi.getPayments({ page: 1, limit: 100 }).catch(() => ({ data: [] }));
      const payments = paymentsRes.data || paymentsRes;
      const paymentList = Array.isArray(payments) ? payments : (payments?.data || payments?.items || []);
      paymentList.forEach((p: any) => {
        if (p.createdAt) {
          allEvents.push({
            id: `payment-${p.id}`, originalId: p.id, type: 'payment',
            title: `${formatCurrency(Number(p.amount || 0))}`,
            subtitle: p.method || p.paymentMethod,
            date: p.createdAt.split('T')[0],
            amount: Number(p.amount || 0),
            status: p.status,
            extra: p,
          });
        }
      });

      // Fetch subscriptions
      const subsRes = await subscriptionsApi.getSubscriptions({ page: 1, limit: 100 }).catch(() => ({ data: [] }));
      const subs = subsRes.data || subsRes;
      const subList = Array.isArray(subs) ? subs : (subs?.data || subs?.items || []);
      subList.forEach((s: any) => {
        if (s.currentPeriodEnd) {
          allEvents.push({
            id: `sub-renew-${s.id}`, originalId: s.id, type: 'subscription',
            title: `${s.plan?.name || 'Abonelik'} yenileme`,
            subtitle: s.user?.email,
            date: s.currentPeriodEnd.split('T')[0],
            amount: Number(s.plan?.priceMonthly || 0),
            status: s.status,
            extra: s,
          });
        }
        if (s.createdAt) {
          allEvents.push({
            id: `sub-start-${s.id}`, originalId: s.id, type: 'subscription',
            title: `${s.plan?.name || 'Abonelik'} başlangıç`,
            subtitle: s.user?.email,
            date: s.createdAt.split('T')[0],
            status: s.status,
            extra: s,
          });
        }
      });
      // Fetch calendar events (meetings etc)
      const calRes = await calendarApi.getEvents({}).catch(() => ({ data: [] }));
      const calEvents = calRes.data || calRes;
      const calList = Array.isArray(calEvents) ? calEvents : [];
      calList.forEach((c: any) => {
        if (c.startDate) {
          const start = new Date(c.startDate);
          const end = c.endDate ? new Date(c.endDate) : null;
          const timeStr = c.allDay ? 'Tüm gün' :
            `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}` +
            (end ? ` - ${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}` : '');
          allEvents.push({
            id: `meeting-${c.id}`, originalId: c.id, type: 'meeting',
            title: c.title,
            subtitle: timeStr + (c.location ? ` | ${c.location}` : ''),
            date: c.startDate.split('T')[0],
            extra: c,
          });
        }
      });

    } catch (e) {
      console.error('Takvim verileri yüklenemedi:', e);
    }

    setEvents(allEvents);
    setLoading(false);
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const filteredEvents = useMemo(() => events.filter(e => filters[e.type]), [events, filters]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    filteredEvents.forEach(e => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return map;
  }, [filteredEvents]);

  const selectedEvents = eventsByDate[selectedDate] || [];
  const today = toDateStr(new Date());

  const goToToday = () => { setCurrentDate(new Date()); setSelectedDate(today); };
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const todayEvents = eventsByDate[today] || [];
  const todayRevenue = todayEvents.filter(e => e.type === 'payment').reduce((s, e) => s + (e.amount || 0), 0);

  // Open edit dialog
  const handleEditEvent = (event: CalendarEvent) => {
    setEditEvent(event);
    setEditStatus(event.status || '');
  };

  // Navigate to detail page
  const handleGoToDetail = (event: CalendarEvent) => {
    const routes: Record<EventType, string> = {
      order: '/orders',
      payment: '/payments',
      subscription: '/subscriptions',
      shipping: '/shipping',
    };
    router.push(routes[event.type]);
  };

  // Save status change
  const handleSaveStatus = async () => {
    if (!editEvent || editStatus === editEvent.status) return;
    setSaving(true);
    try {
      if (editEvent.type === 'order') {
        await ordersApi.updateStatus(editEvent.originalId, editStatus);
      } else {
        showError('Bu tür için durum güncellemesi henüz desteklenmiyor');
        setSaving(false);
        return;
      }
      showSuccess('Durum güncellendi');
      setEditEvent(null);
      fetchEvents(); // reload
    } catch {
      showError('Güncelleme başarısız');
    } finally {
      setSaving(false);
    }
  };

  // Create meeting
  const handleCreateMeeting = async () => {
    if (!meetingForm.title || !meetingForm.startDate) return;
    setSaving(true);
    try {
      const startDate = meetingForm.allDay
        ? `${meetingForm.startDate}T00:00:00`
        : `${meetingForm.startDate}T${meetingForm.startTime}:00`;
      const endDate = meetingForm.allDay
        ? `${meetingForm.startDate}T23:59:59`
        : `${meetingForm.startDate}T${meetingForm.endTime}:00`;
      await calendarApi.createEvent({
        title: meetingForm.title,
        description: meetingForm.description,
        startDate,
        endDate,
        allDay: meetingForm.allDay,
        type: 'meeting',
        location: meetingForm.location,
      });
      showSuccess('Toplantı eklendi');
      setMeetingDialog(false);
      setMeetingForm({ title: '', description: '', startDate: '', startTime: '09:00', endTime: '10:00', location: '', allDay: false });
      fetchEvents();
    } catch {
      showError('Toplantı eklenemedi');
    }
    setSaving(false);
  };

  // Delete meeting
  const handleDeleteMeeting = (event: CalendarEvent) => {
    setConfirmDialog({
      open: true,
      title: 'Toplantıyı Sil',
      message: `"${event.title}" toplantısını silmek istediğinizden emin misiniz?`,
      onConfirm: async () => {
        try {
          await calendarApi.deleteEvent(event.originalId);
          showSuccess('Toplantı silindi');
          setEditEvent(null);
          setConfirmDialog(prev => ({ ...prev, open: false }));
          fetchEvents();
        } catch {
          showError('Silinemedi');
        }
      },
    });
  };

  // Open meeting dialog for a specific date
  const handleAddMeetingForDate = () => {
    setMeetingForm(prev => ({ ...prev, startDate: selectedDate }));
    setMeetingDialog(true);
  };

  const getStatusOptions = (type: EventType) => {
    switch (type) {
      case 'order': return ORDER_STATUSES;
      case 'payment': return PAYMENT_STATUSES;
      case 'subscription': return SUB_STATUSES;
      default: return [];
    }
  };

  return (
    <Box>
      <PageHeader
        title="Takvim"
        subtitle="Sipariş, ödeme, abonelik ve toplantı olayları"
        breadcrumbs={[{ label: 'Takvim' }]}
        action={
          <Stack direction="row" spacing={1} alignItems="center">
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, v) => v && setViewMode(v)}
              size="small"
              sx={{ '& .MuiToggleButton-root': { px: 1.5, py: 0.5, fontSize: 12, textTransform: 'none', borderColor: 'divider' }, '& .Mui-selected': { bgcolor: `${olentiaColors.primary.main}20 !important`, color: `${olentiaColors.primary.main} !important` } }}
            >
              <ToggleButton value="calendar"><CalendarViewIcon sx={{ fontSize: 16, mr: 0.5 }} />Takvim</ToggleButton>
              <ToggleButton value="list"><ListViewIcon sx={{ fontSize: 16, mr: 0.5 }} />Liste</ToggleButton>
              <ToggleButton value="edit"><EditViewIcon sx={{ fontSize: 16, mr: 0.5 }} />Düzenle</ToggleButton>
            </ToggleButtonGroup>
            <Button variant="contained" size="small" startIcon={<AddIcon />}
              onClick={() => { setMeetingForm(prev => ({ ...prev, startDate: selectedDate })); setMeetingDialog(true); }}
              sx={{ bgcolor: olentiaColors.primary.main, '&:hover': { bgcolor: '#C06830' } }}>
              Toplantı Ekle
            </Button>
          </Stack>
        }
      />

      {/* Today Summary */}
      <Card sx={{ mb: 3, p: 2, borderLeft: `4px solid ${olentiaColors.primary.main}` }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="subtitle2" color="text.secondary">Bugün</Typography>
            <Typography variant="h6" fontWeight={700}>
              {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' })}
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Chip icon={<OrderIcon />} label={`${todayEvents.filter(e => e.type === 'order').length} sipariş`} size="small"
              sx={{ bgcolor: `${EVENT_TYPES.order.color}20`, color: EVENT_TYPES.order.color, '& .MuiChip-icon': { color: `${EVENT_TYPES.order.color} !important` } }} />
            <Chip icon={<PaymentIcon />} label={todayRevenue > 0 ? formatCurrency(todayRevenue) : '0 ödeme'} size="small"
              sx={{ bgcolor: `${EVENT_TYPES.payment.color}20`, color: EVENT_TYPES.payment.color, '& .MuiChip-icon': { color: `${EVENT_TYPES.payment.color} !important` } }} />
            <Chip
              icon={<SubIcon />}
              label={`${todayEvents.filter(e => e.type === 'subscription').length} abonelik`}
              size="small"
              sx={{ bgcolor: `${EVENT_TYPES.subscription.color}20`, color: EVENT_TYPES.subscription.color, '& .MuiChip-icon': { color: `${EVENT_TYPES.subscription.color} !important` } }}
            />
          </Stack>
        </Stack>
      </Card>

      {/* Filters */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ flex: 1 }}>
            {(Object.entries(EVENT_TYPES) as [EventType, typeof EVENT_TYPES[EventType]][]).map(([key, config]) => (
              <Chip key={key} label={config.label} size="small"
                icon={<Box sx={{ '& svg': { fontSize: '14px !important' } }}>{config.icon}</Box>}
                onClick={() => setFilters(prev => ({ ...prev, [key]: !prev[key] }))}
                sx={{
                  height: 28, fontSize: 11,
                  bgcolor: filters[key] ? `${config.color}20` : 'transparent',
                  color: filters[key] ? config.color : 'text.disabled',
                  border: `1px solid ${filters[key] ? config.color : 'rgba(255,255,255,0.1)'}`,
                  cursor: 'pointer', transition: 'all 0.2s',
                  '& .MuiChip-icon': { color: filters[key] ? config.color : 'text.disabled' },
                }}
              />
            ))}
          </Stack>
          {(viewMode === 'list' || viewMode === 'edit') && (
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField size="small" placeholder="Ara..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ width: 150, '& .MuiInputBase-input': { py: 0.5, fontSize: 12 } }} />
              <TextField size="small" type="date" label="Başlangıç" value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                sx={{ width: 140, '& .MuiInputBase-input': { py: 0.5, fontSize: 12 } }}
                slotProps={{ inputLabel: { shrink: true, sx: { fontSize: 12 } } }} />
              <TextField size="small" type="date" label="Bitiş" value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                sx={{ width: 140, '& .MuiInputBase-input': { py: 0.5, fontSize: 12 } }}
                slotProps={{ inputLabel: { shrink: true, sx: { fontSize: 12 } } }} />
              {(searchQuery || dateRange.start || dateRange.end) && (
                <Button size="small" onClick={() => { setSearchQuery(''); setDateRange({ start: '', end: '' }); }}
                  sx={{ fontSize: 11, minWidth: 'auto', px: 1, color: 'text.secondary' }}>
                  Temizle
                </Button>
              )}
            </Stack>
          )}
        </Stack>
      </Card>

      {/* ═══ CALENDAR VIEW ═══ */}
      {viewMode === 'calendar' ? (<Grid container spacing={2}>
        {/* Calendar Grid */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <IconButton onClick={prevMonth}><ChevronLeft /></IconButton>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="h6" fontWeight={700}>{MONTHS_TR[month]} {year}</Typography>
                  <IconButton size="small" onClick={goToToday}><TodayIcon fontSize="small" /></IconButton>
                </Stack>
                <IconButton onClick={nextMonth}><ChevronRight /></IconButton>
              </Stack>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, mb: 0.5 }}>
                {DAYS_TR.map(d => (
                  <Box key={d} sx={{ textAlign: 'center', py: 0.5 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>{d}</Typography>
                  </Box>
                ))}
              </Box>

              {loading ? (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
                  {Array.from({ length: 42 }).map((_, i) => <Skeleton key={i} variant="rectangular" height={72} sx={{ borderRadius: 1 }} />)}
                </Box>
              ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
                  {monthDays.map(({ date, isCurrentMonth }, i) => {
                    const dateStr = toDateStr(date);
                    const dayEvents = eventsByDate[dateStr] || [];
                    const isToday = dateStr === today;
                    const isSelected = dateStr === selectedDate;

                    return (
                      <Box key={i} onClick={() => setSelectedDate(dateStr)}
                        sx={{
                          minHeight: 72, p: 0.5, borderRadius: 1, cursor: 'pointer',
                          border: isSelected ? `2px solid ${olentiaColors.primary.main}` : '1px solid transparent',
                          bgcolor: isToday ? `${olentiaColors.primary.main}10` : isCurrentMonth ? 'background.paper' : 'action.hover',
                          opacity: isCurrentMonth ? 1 : 0.4,
                          '&:hover': { bgcolor: `${olentiaColors.primary.main}08` },
                          transition: 'all 0.15s',
                        }}
                      >
                        <Typography variant="caption" fontWeight={isToday ? 700 : 400}
                          sx={{ color: isToday ? olentiaColors.primary.main : 'text.primary', display: 'block', mb: 0.25 }}>
                          {date.getDate()}
                        </Typography>
                        <Stack spacing={0.25}>
                          {dayEvents.slice(0, 3).map((e, j) => (
                            <Box key={j} sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: EVENT_TYPES[e.type].color, flexShrink: 0 }} />
                              <Typography variant="caption" noWrap sx={{ fontSize: 9, lineHeight: 1.2 }}>{e.title}</Typography>
                            </Box>
                          ))}
                          {dayEvents.length > 3 && (
                            <Typography variant="caption" sx={{ fontSize: 9, color: 'text.secondary' }}>+{dayEvents.length - 3} daha</Typography>
                          )}
                        </Stack>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Selected Day Details — clickable events */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ position: 'sticky', top: 80, maxHeight: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })}
                </Typography>
                <IconButton size="small" onClick={handleAddMeetingForDate}
                  sx={{ bgcolor: `${olentiaColors.primary.main}15`, '&:hover': { bgcolor: `${olentiaColors.primary.main}30` } }}>
                  <AddIcon sx={{ fontSize: 18, color: olentiaColors.primary.main }} />
                </IconButton>
              </Stack>

              {selectedEvents.length === 0 ? (
                <Box sx={{ py: 3, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.disabled">Etkinlik yok</Typography>
                </Box>
              ) : (
                <>
                  <Stack spacing={0.5} sx={{ flex: 1, overflow: 'auto', '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 } }}>
                    {selectedEvents.map((e) => (
                      <Box key={e.id}
                        onClick={() => handleEditEvent(e)}
                        sx={{
                          py: 0.75, px: 1, borderRadius: 0.5, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: 1,
                          '&:hover': { bgcolor: `${EVENT_TYPES[e.type].color}12` },
                          transition: 'background 0.15s',
                        }}
                      >
                        <Box sx={{ width: 4, height: 28, borderRadius: 1, bgcolor: EVENT_TYPES[e.type].color, flexShrink: 0 }} />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={500} noWrap sx={{ fontSize: 13 }}>{e.title}</Typography>
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            {e.amount && e.amount > 0 && <Typography variant="caption" fontWeight={600} sx={{ color: EVENT_TYPES[e.type].color }}>{formatCurrency(e.amount)}</Typography>}
                            {e.status && <Chip label={STATUS_LABELS[e.status] || e.status} size="small" variant="outlined" sx={getStatusChipSx(e.status)} />}
                            {e.subtitle && !e.amount && <Typography variant="caption" color="text.secondary" noWrap>{e.subtitle}</Typography>}
                          </Stack>
                        </Box>
                        <EditIcon sx={{ fontSize: 12, color: 'text.disabled', opacity: 0, '.MuiBox-root:hover > &': { opacity: 1 } }} />
                      </Box>
                    ))}
                  </Stack>
                  <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 1, textAlign: 'right' }}>
                    {selectedEvents.length} etkinlik
                    {selectedEvents.some(e => e.amount) && <> · {formatCurrency(selectedEvents.reduce((s, e) => s + (e.amount || 0), 0))}</>}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>) : null}

      {/* ═══ LIST VIEW (Excel-like) ═══ */}
      {viewMode === 'list' && (
        <Card>
          <TableContainer sx={{ maxHeight: 'calc(100vh - 320px)' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Tarih</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Tür</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Başlık</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Detay</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12 }} align="right">Tutar</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Durum</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEvents
                  .filter(e => {
                    if (searchQuery) {
                      const q = searchQuery.toLowerCase();
                      if (!e.title.toLowerCase().includes(q) && !(e.subtitle || '').toLowerCase().includes(q)) return false;
                    }
                    if (dateRange.start && e.date < dateRange.start) return false;
                    if (dateRange.end && e.date > dateRange.end) return false;
                    return true;
                  })
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((e) => (
                    <TableRow key={e.id} hover onClick={() => handleEditEvent(e)} sx={{ cursor: 'pointer' }}>
                      <TableCell>
                        <Typography variant="caption">{new Date(e.date + 'T00:00:00').toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={EVENT_TYPES[e.type].label}
                          sx={{ height: 20, fontSize: 10, bgcolor: `${EVENT_TYPES[e.type].color}20`, color: EVENT_TYPES[e.type].color, border: 'none' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500} sx={{ fontSize: 13 }}>{e.title}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">{e.subtitle || '-'}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        {e.amount && e.amount > 0 ? (
                          <Typography variant="body2" fontWeight={600} sx={{ fontSize: 13 }}>{formatCurrency(e.amount)}</Typography>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        {e.status ? (
                          <Chip label={STATUS_LABELS[e.status] || e.status} size="small" variant="outlined" sx={getStatusChipSx(e.status || '')} />
                        ) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ p: 1, borderTop: '1px solid', borderColor: 'divider', textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary">
              {filteredEvents.length} etkinlik · Toplam: {formatCurrency(filteredEvents.reduce((s, e) => s + (e.amount || 0), 0))}
            </Typography>
          </Box>
        </Card>
      )}

      {/* ═══ EDIT VIEW (Inline editing) ═══ */}
      {viewMode === 'edit' && (
        <Card>
          <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Checkbox size="small" checked={selectedItems.size === filteredEvents.length && filteredEvents.length > 0}
                indeterminate={selectedItems.size > 0 && selectedItems.size < filteredEvents.length}
                onChange={(e) => { if (e.target.checked) { setSelectedItems(new Set(filteredEvents.map(ev => ev.id))); } else { setSelectedItems(new Set()); } }} />
              <Typography variant="caption" color="text.secondary">{selectedItems.size > 0 ? `${selectedItems.size} seçili` : 'Tümünü seç'}</Typography>
            </Stack>
            {selectedItems.size > 0 && (
              <Stack direction="row" spacing={1}>
                <Button size="small" variant="outlined" color="error" startIcon={<DeleteIcon sx={{ fontSize: 14 }} />}
                  onClick={() => {
                    setConfirmDialog({
                      open: true,
                      title: 'Toplu Silme',
                      message: `${selectedItems.size} etkinliği silmek istediğinizden emin misiniz? Sadece toplantılar silinebilir.`,
                      onConfirm: async () => {
                        for (const id of selectedItems) {
                          const ev = filteredEvents.find(e => e.id === id);
                          if (ev?.type === 'meeting') { try { await calendarApi.deleteEvent(ev.originalId); } catch {} }
                        }
                        setSelectedItems(new Set());
                        setConfirmDialog(prev => ({ ...prev, open: false }));
                        showSuccess('Seçili toplantılar silindi');
                        fetchEvents();
                      },
                    });
                  }}>
                  Sil
                </Button>
              </Stack>
            )}
          </Box>
          <TableContainer sx={{ maxHeight: 'calc(100vh - 360px)' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" sx={{ width: 40 }}></TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Tarih</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Tür</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Başlık</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Detay</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12 }} align="right">Tutar</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Durum</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, width: 60 }}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEvents
                  .filter(e => {
                    if (searchQuery) {
                      const q = searchQuery.toLowerCase();
                      if (!e.title.toLowerCase().includes(q) && !(e.subtitle || '').toLowerCase().includes(q)) return false;
                    }
                    if (dateRange.start && e.date < dateRange.start) return false;
                    if (dateRange.end && e.date > dateRange.end) return false;
                    return true;
                  })
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((e) => (
                    <TableRow key={e.id} hover selected={selectedItems.has(e.id)}
                      sx={{ '&.Mui-selected': { bgcolor: `${EVENT_TYPES[e.type].color}08` } }}>
                      <TableCell padding="checkbox">
                        <Checkbox size="small" checked={selectedItems.has(e.id)}
                          onChange={(ev) => {
                            const next = new Set(selectedItems);
                            ev.target.checked ? next.add(e.id) : next.delete(e.id);
                            setSelectedItems(next);
                          }} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">{new Date(e.date + 'T00:00:00').toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })}</Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: EVENT_TYPES[e.type].color, display: 'inline-block' }} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: 13 }}>{e.title}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">{e.subtitle || '-'}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        {e.amount && e.amount > 0 ? (
                          <Typography variant="body2" fontWeight={600} sx={{ fontSize: 13, color: EVENT_TYPES[e.type].color }}>{formatCurrency(e.amount)}</Typography>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        {e.status ? (
                          <Chip label={STATUS_LABELS[e.status] || e.status} size="small" variant="outlined" sx={getStatusChipSx(e.status || '')} />
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => handleEditEvent(e)}>
                          <EditIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}


      {/* Edit Event Dialog */}
      <Dialog open={!!editEvent} onClose={() => setEditEvent(null)} maxWidth="sm" fullWidth>
        {editEvent && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar sx={{ bgcolor: EVENT_TYPES[editEvent.type].color, width: 36, height: 36 }}>
                  {EVENT_TYPES[editEvent.type].icon}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={700}>{editEvent.title}</Typography>
                  <Typography variant="caption" color="text.secondary">{EVENT_TYPES[editEvent.type].label}</Typography>
                </Box>
              </Stack>
              <IconButton onClick={() => setEditEvent(null)} size="small"><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Stack spacing={2.5} sx={{ pt: 1 }}>
                {/* Event info - read only */}
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary">Tarih</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {new Date(editEvent.date + 'T00:00:00').toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </Typography>
                  </Grid>
                  {editEvent.amount && editEvent.amount > 0 && (
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary">Tutar</Typography>
                      <Typography variant="body2" fontWeight={700} sx={{ color: olentiaColors.primary.main }}>
                        {formatCurrency(editEvent.amount)}
                      </Typography>
                    </Grid>
                  )}
                  {editEvent.subtitle && (
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary">
                        {editEvent.type === 'order' ? 'Müşteri' : editEvent.type === 'payment' ? 'Yöntem' : 'E-posta'}
                      </Typography>
                      <Typography variant="body2">{editEvent.subtitle}</Typography>
                    </Grid>
                  )}
                  {editEvent.extra?.orderNumber && (
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary">Sipariş No</Typography>
                      <Typography variant="body2" fontWeight={500}>{editEvent.extra.orderNumber}</Typography>
                    </Grid>
                  )}
                  {editEvent.extra?.plan?.name && (
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary">Plan</Typography>
                      <Typography variant="body2">{editEvent.extra.plan.name}</Typography>
                    </Grid>
                  )}
                </Grid>

                <Divider />

                {/* Editable: Status */}
                <FormControl fullWidth size="small">
                  <InputLabel>Durum</InputLabel>
                  <Select value={editStatus} label="Durum" onChange={(e) => setEditStatus(e.target.value)}>
                    {getStatusOptions(editEvent.type).map(s => (
                      <MenuItem key={s} value={s}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box sx={{
                            width: 8, height: 8, borderRadius: '50%',
                            bgcolor: s === 'CANCELLED' || s === 'FAILED' ? '#f44336'
                              : s === 'DELIVERED' || s === 'COMPLETED' || s === 'ACTIVE' ? '#4caf50'
                              : s === 'PENDING' || s === 'PAUSED' || s === 'TRIAL' ? '#ff9800'
                              : '#2196f3',
                          }} />
                          <Typography variant="body2">{STATUS_LABELS[s] || s}</Typography>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Extra details */}
                {editEvent.extra && (
                  <Box sx={{ bgcolor: 'action.hover', borderRadius: 1, p: 1.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>Detaylar</Typography>
                    <Stack spacing={0.5}>
                      {editEvent.type === 'order' && editEvent.extra.items?.length > 0 && (
                        <>
                          <Typography variant="caption" fontWeight={600}>Ürünler:</Typography>
                          {editEvent.extra.items.slice(0, 5).map((item: any, idx: number) => (
                            <Typography key={idx} variant="caption" color="text.secondary">
                              - {item.product?.name || item.productName || 'Ürün'} x{item.quantity}
                            </Typography>
                          ))}
                        </>
                      )}
                      {editEvent.type === 'payment' && (
                        <>
                          {editEvent.extra.transactionId && <Typography variant="caption">İşlem ID: {editEvent.extra.transactionId}</Typography>}
                          {editEvent.extra.orderId && <Typography variant="caption">Sipariş: {editEvent.extra.orderId?.slice(-8)}</Typography>}
                        </>
                      )}
                      {editEvent.type === 'subscription' && editEvent.extra.plan && (
                        <>
                          <Typography variant="caption">Plan: {editEvent.extra.plan.name}</Typography>
                          {editEvent.extra.currentPeriodEnd && (
                            <Typography variant="caption">Sonraki yenileme: {new Date(editEvent.extra.currentPeriodEnd).toLocaleDateString('tr-TR')}</Typography>
                          )}
                        </>
                      )}
                    </Stack>
                  </Box>
                )}
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
              {editEvent.type === 'meeting' ? (
                <Button variant="outlined" color="error" size="small" startIcon={<DeleteIcon />}
                  onClick={() => handleDeleteMeeting(editEvent)}>Sil</Button>
              ) : (
                <Button variant="outlined" size="small" startIcon={<OpenIcon />} onClick={() => handleGoToDetail(editEvent)}>
                  Detay Sayfasına Git
                </Button>
              )}
              <Box sx={{ flex: 1 }} />
              <Button onClick={() => setEditEvent(null)}>İptal</Button>
              {editEvent.type !== 'meeting' && (
                <Button variant="contained" startIcon={<SaveIcon />}
                  onClick={handleSaveStatus} disabled={saving || editStatus === editEvent.status}
                  sx={{ bgcolor: olentiaColors.primary.main, '&:hover': { bgcolor: '#C06830' } }}>
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Meeting Create Dialog */}
      <Dialog open={meetingDialog} onClose={() => setMeetingDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <MeetingIcon sx={{ color: '#FF6B6B' }} />
            <Typography variant="h6" fontWeight={700}>Toplantı Ekle</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField fullWidth label="Başlık" value={meetingForm.title} size="small"
              onChange={(e) => setMeetingForm(prev => ({ ...prev, title: e.target.value }))} />
            <TextField fullWidth label="Açıklama" value={meetingForm.description} size="small" multiline rows={2}
              onChange={(e) => setMeetingForm(prev => ({ ...prev, description: e.target.value }))} />
            <TextField fullWidth type="date" label="Tarih" value={meetingForm.startDate} size="small"
              onChange={(e) => setMeetingForm(prev => ({ ...prev, startDate: e.target.value }))}
              slotProps={{ inputLabel: { shrink: true } }} />
            <FormControlLabel
              control={<Switch checked={meetingForm.allDay} size="small"
                onChange={(e) => setMeetingForm(prev => ({ ...prev, allDay: e.target.checked }))} />}
              label="Tüm gün"
            />
            {!meetingForm.allDay && (
              <Stack direction="row" spacing={2}>
                <TextField fullWidth type="time" label="Başlangıç" value={meetingForm.startTime} size="small"
                  onChange={(e) => setMeetingForm(prev => ({ ...prev, startTime: e.target.value }))}
                  slotProps={{ inputLabel: { shrink: true } }} />
                <TextField fullWidth type="time" label="Bitiş" value={meetingForm.endTime} size="small"
                  onChange={(e) => setMeetingForm(prev => ({ ...prev, endTime: e.target.value }))}
                  slotProps={{ inputLabel: { shrink: true } }} />
              </Stack>
            )}
            <TextField fullWidth label="Konum" value={meetingForm.location} size="small"
              onChange={(e) => setMeetingForm(prev => ({ ...prev, location: e.target.value }))} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMeetingDialog(false)}>İptal</Button>
          <Button variant="contained" onClick={handleCreateMeeting}
            disabled={saving || !meetingForm.title || !meetingForm.startDate}
            sx={{ bgcolor: '#FF6B6B', '&:hover': { bgcolor: '#E55555' } }}>
            {saving ? 'Ekleniyor...' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog(prev => ({ ...prev, open: false }))} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <DeleteIcon sx={{ color: '#f44336' }} />
            <Typography variant="h6" fontWeight={700}>{confirmDialog.title}</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}>Vazgeç</Button>
          <Button variant="contained" color="error" onClick={confirmDialog.onConfirm}
            startIcon={<DeleteIcon />}>
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
