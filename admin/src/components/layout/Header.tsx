'use client';

import {
  AppBar, Toolbar, IconButton, Typography, Box, Avatar, Menu, MenuItem,
  ListItemIcon, Divider, Badge, Tooltip, InputBase, alpha, Chip, Stack,
  Paper, List, ListItem, ListItemText, ClickAwayListener, CircularProgress, TextField,
} from '@mui/material';
import {
  MenuOutlined as MenuIcon, NotificationsOutlined as NotificationsIcon, SearchOutlined as SearchIcon,
  SettingsOutlined as SettingsIcon, LogoutOutlined as LogoutIcon, PersonOutlined as PersonIcon,
  DarkModeOutlined as DarkModeIcon, LightModeOutlined as LightModeIcon,
  CalendarTodayOutlined as CalendarIcon, AccessTimeOutlined as ClockIcon,
  ShoppingCartOutlined as OrderIcon, PaymentOutlined as PaymentIcon,
  PersonAddOutlined as UserAddIcon, WarningAmberOutlined as WarningIcon,
  CircleOutlined as DotIcon,
} from '@mui/icons-material';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeMode } from '@/components/ThemeRegistry';
import { olentiaColors } from '@/lib/theme';
import { api } from '@/lib/api';
import { DRAWER_WIDTH } from './Sidebar';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface HeaderProps {
  sidebarOpen: boolean;
  onMenuClick: () => void;
}

const notifIcons: Record<string, React.ReactNode> = {
  ORDER: <OrderIcon sx={{ fontSize: 18, color: '#D4793F' }} />,
  PAYMENT: <PaymentIcon sx={{ fontSize: 18, color: '#4CAF50' }} />,
  USER: <UserAddIcon sx={{ fontSize: 18, color: '#42A5F5' }} />,
  ALERT: <WarningIcon sx={{ fontSize: 18, color: '#FF9800' }} />,
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Az önce';
  if (mins < 60) return `${mins} dk önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.floor(hours / 24);
  return `${days} gün önce`;
}

export default function Header({ sidebarOpen, onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { mode, toggleTheme } = useThemeMode();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ type: string; label: string; path: string }[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [forexAnchorEl, setForexAnchorEl] = useState<null | HTMLElement>(null);
  const [forexAmount, setForexAmount] = useState('100');
  const [forexFrom, setForexFrom] = useState<'TRY' | 'USD' | 'EUR'>('USD');

  const [forex, setForex] = useState<{ usd: number; eur: number } | null>(null);
  const [todayOrders, setTodayOrders] = useState(0);

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Forex
  useEffect(() => {
    fetch('https://api.exchangerate-api.com/v4/latest/USD')
      .then(r => r.json())
      .then(data => {
        if (data.rates?.TRY) {
          const usd = data.rates.TRY;
          const eur = usd / (data.rates.EUR || 0.92);
          setForex({ usd: Math.round(usd * 100) / 100, eur: Math.round(eur * 100) / 100 });
        }
      })
      .catch(() => setForex({ usd: 38.45, eur: 41.20 })); // fallback
  }, []);

  // Today orders count
  useEffect(() => {
    api.get('/admin/dashboard').then(r => {
      const d = r.data?.data || r.data;
      setTodayOrders(d?.today?.orders || 0);
    }).catch(() => {});
  }, []);

  // Search
  const menuPages = [
    { label: 'Dashboard', path: '/', keywords: 'dashboard anasayfa panel' },
    { label: 'Siparişler', path: '/orders', keywords: 'sipariş order' },
    { label: 'Ürünler', path: '/products', keywords: 'ürün product kahve' },
    { label: 'Kategoriler', path: '/categories', keywords: 'kategori category' },
    { label: 'Koleksiyonlar', path: '/collections', keywords: 'koleksiyon collection' },
    { label: 'Abonelikler', path: '/subscriptions', keywords: 'abonelik subscription' },
    { label: 'Ödemeler', path: '/payments', keywords: 'ödeme payment' },
    { label: 'Kuponlar', path: '/coupons', keywords: 'kupon coupon indirim' },
    { label: 'Fiyatlandırma', path: '/pricing', keywords: 'fiyat price' },
    { label: 'Kullanıcılar', path: '/users', keywords: 'kullanıcı user müşteri' },
    { label: 'Değerlendirmeler', path: '/reviews', keywords: 'değerlendirme review yorum' },
    { label: 'Kargo', path: '/shipping', keywords: 'kargo shipping teslimat' },
    { label: 'Blog', path: '/blog', keywords: 'blog yazı post' },
    { label: 'SEO', path: '/seo', keywords: 'seo meta' },
    { label: 'Sadakat', path: '/loyalty', keywords: 'sadakat loyalty puan' },
    { label: 'B2B', path: '/b2b', keywords: 'b2b kurumsal' },
    { label: 'Partnerler', path: '/partners', keywords: 'partner bayi' },
    { label: 'Bildirimler', path: '/notifications', keywords: 'bildirim notification' },
    { label: 'Satış Raporu', path: '/reports/sales', keywords: 'satış rapor gelir' },
    { label: 'Müşteri Raporu', path: '/reports/customers', keywords: 'müşteri rapor' },
    { label: 'Ürün Raporu', path: '/reports/products', keywords: 'ürün rapor' },
    { label: 'AI Raporlar', path: '/ai-reports', keywords: 'ai yapay zeka rapor' },
    { label: 'Chatbot', path: '/chatbot', keywords: 'chatbot sohbet' },
    { label: 'Sistem Yönetimi', path: '/ops', keywords: 'sistem cache cron' },
    { label: 'Denetim Logları', path: '/audit-logs', keywords: 'denetim log audit' },
    { label: 'Ayarlar', path: '/settings', keywords: 'ayar setting' },
    { label: 'Profil', path: '/profile', keywords: 'profil hesap şifre 2fa' },
  ];

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) { setSearchResults([]); setSearchOpen(false); return; }
    setSearching(true);
    setSearchOpen(true);

    const q = query.toLowerCase();
    const results: { type: string; label: string; path: string }[] = [];

    // Search pages
    menuPages.forEach(p => {
      if (p.label.toLowerCase().includes(q) || p.keywords.includes(q)) {
        results.push({ type: 'Sayfa', label: p.label, path: p.path });
      }
    });

    // Search API (orders, users, products) in parallel
    try {
      const [ordersRes, usersRes, productsRes] = await Promise.all([
        api.get('/admin/orders', { params: { search: query, limit: 3 } }).catch(() => ({ data: null })),
        api.get('/admin/users', { params: { search: query, limit: 3 } }).catch(() => ({ data: null })),
        api.get('/products', { params: { search: query, limit: 3 } }).catch(() => ({ data: null })),
      ]);

      const orders = ordersRes.data?.data?.data || ordersRes.data?.data || [];
      if (Array.isArray(orders)) orders.forEach((o: { id: string; orderNumber: string }) => {
        results.push({ type: 'Sipariş', label: o.orderNumber || o.id, path: `/orders?search=${query}` });
      });

      const users = usersRes.data?.data?.data || usersRes.data?.data || [];
      if (Array.isArray(users)) users.forEach((u: { id: string; email: string; firstName?: string; lastName?: string }) => {
        results.push({ type: 'Kullanıcı', label: u.firstName ? `${u.firstName} ${u.lastName}` : u.email, path: `/users?search=${query}` });
      });

      const products = productsRes.data?.data?.data || productsRes.data?.data || [];
      if (Array.isArray(products)) products.forEach((p: { id: string; name: string }) => {
        results.push({ type: 'Ürün', label: p.name, path: `/products?search=${query}` });
      });
    } catch { /* ignore */ }

    setSearchResults(results.slice(0, 10));
    setSearching(false);
  };

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await api.get('/notifications', { params: { limit: 5 } });
      const result = data.data || data;
      const items = result.data || result.items || (Array.isArray(result) ? result : []);
      setNotifications(items);
      setUnreadCount(items.filter((n: Notification) => !n.isRead).length);
    } catch {
      // Fallback demo
      setNotifications([]);
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const handleMarkRead = async (id: string) => {
    try { await api.patch(`/notifications/${id}/read`); } catch { /* ignore */ }
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleProfileMenuClose = () => setAnchorEl(null);
  const handleNotifMenuOpen = (event: React.MouseEvent<HTMLElement>) => { setNotifAnchorEl(event.currentTarget); fetchNotifications(); };
  const handleNotifMenuClose = () => setNotifAnchorEl(null);
  const handleLogout = async () => { handleProfileMenuClose(); await logout(); };

  const dateStr = currentTime.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = currentTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

  return (
    <AppBar
      position="fixed" elevation={0}
      sx={{
        width: { md: sidebarOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%' },
        ml: { md: sidebarOpen ? `${DRAWER_WIDTH}px` : 0 },
        transition: 'width 0.2s ease-in-out, margin 0.2s ease-in-out',
        bgcolor: 'background.default', borderBottom: '1px solid', borderColor: 'divider',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ gap: 0.5 }}>
        <IconButton color="inherit" aria-label="toggle sidebar" edge="start" onClick={onMenuClick} sx={{ mr: 0.5, color: 'text.primary' }}>
          <MenuIcon />
        </IconButton>

        {/* Search */}
        <ClickAwayListener onClickAway={() => setSearchOpen(false)}>
          <Box sx={{
            position: 'relative', borderRadius: 2,
            bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
            '&:hover': { bgcolor: (theme) => alpha(theme.palette.grey[500], 0.12) },
            width: { xs: 'auto', sm: 260 }, display: { xs: 'none', sm: 'block' },
          }}>
            <Box sx={{ position: 'absolute', left: 10, height: '100%', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
              {searching ? <CircularProgress size={16} sx={{ color: 'text.secondary' }} /> : <SearchIcon sx={{ color: 'text.secondary', fontSize: 18 }} />}
            </Box>
            <InputBase
              placeholder="Sayfa, sipariş, ürün ara..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => { if (searchResults.length > 0) setSearchOpen(true); }}
              onKeyDown={(e) => { if (e.key === 'Escape') setSearchOpen(false); }}
              sx={{ color: 'text.primary', width: '100%', fontSize: 13, '& .MuiInputBase-input': { padding: '7px 8px 7px 34px' } }}
            />
            {searchOpen && searchResults.length > 0 && (
              <Paper sx={{
                position: 'absolute', top: '100%', left: 0, right: 0, mt: 0.5, zIndex: 1300,
                maxHeight: 360, overflow: 'auto', borderRadius: 2,
                bgcolor: '#1E1E1E', border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              }}>
                <List dense sx={{ py: 0.5 }}>
                  {searchResults.map((r, i) => (
                    <ListItem key={i} component="div"
                      onClick={() => { router.push(r.path); setSearchOpen(false); setSearchQuery(''); }}
                      sx={{ cursor: 'pointer', py: 0.8, px: 1.5, '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' } }}>
                      <Chip label={r.type} size="small" sx={{ mr: 1, height: 20, fontSize: 10, bgcolor: r.type === 'Sayfa' ? `${olentiaColors.primary.main}20` : r.type === 'Sipariş' ? '#4CAF5020' : r.type === 'Ürün' ? '#42A5F520' : '#FF980020', color: r.type === 'Sayfa' ? olentiaColors.primary.main : r.type === 'Sipariş' ? '#4CAF50' : r.type === 'Ürün' ? '#42A5F5' : '#FF9800' }} />
                      <ListItemText primary={r.label} primaryTypographyProps={{ fontSize: 13 }} />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}
            {searchOpen && searchResults.length === 0 && searchQuery.length >= 2 && !searching && (
              <Paper sx={{
                position: 'absolute', top: '100%', left: 0, right: 0, mt: 0.5, zIndex: 1300,
                borderRadius: 2, bgcolor: '#1E1E1E', border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              }}>
                <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>Sonuç bulunamadı</Typography>
              </Paper>
            )}
          </Box>
        </ClickAwayListener>

        <Box sx={{ flexGrow: 1 }} />

        {/* Widgets */}
        <Box sx={{
          display: { xs: 'none', lg: 'flex' }, alignItems: 'center', gap: 1, mr: 1,
          '@keyframes fadeSlideIn': {
            from: { opacity: 0, transform: 'translateY(-8px)' },
            to: { opacity: 1, transform: 'translateY(0)' },
          },
          '@keyframes gentlePulse': {
            '0%, 100%': { transform: 'scale(1)' },
            '50%': { transform: 'scale(1.03)' },
          },
          '@keyframes shimmer': {
            '0%': { backgroundPosition: '-200% 0' },
            '100%': { backgroundPosition: '200% 0' },
          },
        }}>
          {/* Date & Time */}
          <Chip
            icon={<CalendarIcon sx={{ fontSize: 14 }} />}
            label={`${dateStr} ${timeStr}`}
            size="small"
            variant="outlined"
            sx={{
              height: 26, fontSize: 11, borderColor: 'divider', color: 'text.secondary',
              '& .MuiChip-icon': { color: 'text.secondary' },
              animation: 'fadeSlideIn 0.5s ease-out',
              transition: 'all 0.2s ease',
              '&:hover': { transform: 'scale(1.05)', borderColor: olentiaColors.primary.main },
            }}
          />

          {/* Forex — click to open calculator */}
          {forex && (
            <>
              <Chip
                label={`$ ${forex.usd}`}
                size="small"
                onClick={(e) => { setForexFrom('USD'); setForexAnchorEl(e.currentTarget); }}
                sx={{
                  height: 26, fontSize: 11, fontWeight: 700, bgcolor: 'rgba(76,175,80,0.12)', color: '#4CAF50', border: 'none', cursor: 'pointer',
                  animation: 'fadeSlideIn 0.7s ease-out, gentlePulse 4s ease-in-out infinite',
                  transition: 'all 0.2s ease',
                  '&:hover': { transform: 'scale(1.1)', bgcolor: 'rgba(76,175,80,0.22)' },
                }}
              />
              <Chip
                label={`€ ${forex.eur}`}
                size="small"
                onClick={(e) => { setForexFrom('EUR'); setForexAnchorEl(e.currentTarget); }}
                sx={{
                  height: 26, fontSize: 11, fontWeight: 700, bgcolor: 'rgba(66,165,245,0.12)', color: '#42A5F5', border: 'none', cursor: 'pointer',
                  animation: 'fadeSlideIn 0.9s ease-out, gentlePulse 4s ease-in-out 1s infinite',
                  transition: 'all 0.2s ease',
                  '&:hover': { transform: 'scale(1.1)', bgcolor: 'rgba(66,165,245,0.22)' },
                }}
              />
            </>
          )}

          {/* Today orders — click to go to orders */}
          <Chip
            icon={<OrderIcon sx={{ fontSize: 14 }} />}
            label={`${todayOrders} sipariş`}
            size="small"
            onClick={() => router.push('/orders')}
            sx={{
              height: 26, fontSize: 11, fontWeight: 600, cursor: 'pointer',
              bgcolor: `${olentiaColors.primary.main}18`, color: olentiaColors.primary.main, border: 'none',
              '& .MuiChip-icon': { color: olentiaColors.primary.main },
              animation: 'fadeSlideIn 1.1s ease-out',
              transition: 'all 0.2s ease',
              '&:hover': { transform: 'scale(1.1)', bgcolor: `${olentiaColors.primary.main}30` },
            }}
          />
        </Box>

        {/* Right side icons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title="Bildirimler">
            <IconButton onClick={handleNotifMenuOpen} sx={{ color: 'text.secondary' }}>
              <Badge badgeContent={unreadCount} color="error" sx={{ '& .MuiBadge-badge': { fontSize: 10, height: 16, minWidth: 16 } }}>
                <NotificationsIcon sx={{ fontSize: 20 }} />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title={mode === 'dark' ? 'Açık Tema' : 'Koyu Tema'}>
            <IconButton onClick={toggleTheme} sx={{ color: 'text.secondary' }}>
              {mode === 'dark' ? <LightModeIcon sx={{ fontSize: 20 }} /> : <DarkModeIcon sx={{ fontSize: 20 }} />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Profil">
            <IconButton onClick={handleProfileMenuOpen} sx={{ ml: 0.5 }}>
              <Avatar src="/images/logo.png" sx={{ width: 30, height: 30, bgcolor: 'transparent' }} imgProps={{ style: { objectFit: 'contain' } }} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Profile Menu */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleProfileMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{ sx: { mt: 1.5, minWidth: 200, borderRadius: 2, boxShadow: '0 8px 24px rgba(0,0,0,0.4)' } }}>
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email}
            </Typography>
            <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
          </Box>
          <Divider />
          <MenuItem onClick={() => { handleProfileMenuClose(); router.push('/profile'); }}>
            <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>Profil
          </MenuItem>
          <MenuItem onClick={() => { handleProfileMenuClose(); router.push('/settings'); }}>
            <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>Ayarlar
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
            <Typography color="error">Çıkış Yap</Typography>
          </MenuItem>
        </Menu>

        {/* Forex Calculator Popover */}
        <Menu anchorEl={forexAnchorEl} open={Boolean(forexAnchorEl)} onClose={() => setForexAnchorEl(null)}
          transformOrigin={{ horizontal: 'center', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
          PaperProps={{ sx: { mt: 1.5, width: 280, borderRadius: 2, p: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' } }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Döviz Hesaplayıcı</Typography>
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField size="small" type="number" value={forexAmount}
                onChange={(e) => setForexAmount(e.target.value)}
                sx={{ flex: 1, '& .MuiInputBase-input': { py: 0.75, fontSize: 14, fontWeight: 700 } }} />
              <Stack direction="row" spacing={0.5}>
                {(['TRY', 'USD', 'EUR'] as const).map(c => (
                  <Chip key={c} label={c} size="small"
                    onClick={() => setForexFrom(c)}
                    sx={{
                      height: 24, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                      bgcolor: forexFrom === c ? (c === 'TRY' ? `${olentiaColors.primary.main}20` : c === 'USD' ? 'rgba(76,175,80,0.2)' : 'rgba(66,165,245,0.2)') : 'transparent',
                      color: forexFrom === c ? (c === 'TRY' ? olentiaColors.primary.main : c === 'USD' ? '#4CAF50' : '#42A5F5') : 'text.secondary',
                      border: `1px solid ${forexFrom === c ? 'currentColor' : 'rgba(255,255,255,0.1)'}`,
                    }}
                  />
                ))}
              </Stack>
            </Stack>
            {forex && (() => {
              const amt = parseFloat(forexAmount) || 0;
              const results: { currency: string; value: number; color: string }[] = [];
              if (forexFrom === 'TRY') {
                results.push({ currency: 'USD', value: amt / forex.usd, color: '#4CAF50' });
                results.push({ currency: 'EUR', value: amt / forex.eur, color: '#42A5F5' });
              } else if (forexFrom === 'USD') {
                results.push({ currency: 'TRY', value: amt * forex.usd, color: olentiaColors.primary.main });
                results.push({ currency: 'EUR', value: (amt * forex.usd) / forex.eur, color: '#42A5F5' });
              } else {
                results.push({ currency: 'TRY', value: amt * forex.eur, color: olentiaColors.primary.main });
                results.push({ currency: 'USD', value: (amt * forex.eur) / forex.usd, color: '#4CAF50' });
              }
              return (
                <Stack spacing={1}>
                  {results.map(r => (
                    <Box key={r.currency} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, borderRadius: 1, bgcolor: `${r.color}08` }}>
                      <Typography variant="body2" color="text.secondary">{r.currency}</Typography>
                      <Typography variant="body1" fontWeight={700} sx={{ color: r.color }}>
                        {r.currency === 'TRY' ? '₺' : r.currency === 'USD' ? '$' : '€'}{r.value.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              );
            })()}
            <Typography variant="caption" color="text.disabled" sx={{ textAlign: 'center' }}>
              1 USD = ₺{forex?.usd} · 1 EUR = ₺{forex?.eur}
            </Typography>
          </Stack>
        </Menu>

        {/* Notifications Menu */}
        <Menu anchorEl={notifAnchorEl} open={Boolean(notifAnchorEl)} onClose={handleNotifMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{ sx: { mt: 1.5, width: 360, maxHeight: 440, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' } }}>
          <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight={700}>Bildirimler</Typography>
            {unreadCount > 0 && <Chip label={`${unreadCount} yeni`} size="small" color="error" sx={{ height: 20, fontSize: 11 }} />}
          </Box>
          <Divider />
          {notifications.length > 0 ? notifications.map((n) => (
            <MenuItem key={n.id} onClick={() => { handleMarkRead(n.id); handleNotifMenuClose(); }}
              sx={{ py: 1.5, opacity: n.isRead ? 0.6 : 1, alignItems: 'flex-start', gap: 1.5 }}>
              <Box sx={{ mt: 0.3 }}>{notifIcons[n.type] || <DotIcon sx={{ fontSize: 18, color: 'text.secondary' }} />}</Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight={n.isRead ? 400 : 600}>{n.title}</Typography>
                <Typography variant="caption" color="text.secondary">{n.message}</Typography>
                <Typography variant="caption" color="text.disabled" display="block" sx={{ mt: 0.3 }}>{timeAgo(n.createdAt)}</Typography>
              </Box>
              {!n.isRead && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: olentiaColors.primary.main, mt: 0.8 }} />}
            </MenuItem>
          )) : (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <NotificationsIcon sx={{ fontSize: 32, color: 'text.disabled', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">Bildirim yok</Typography>
            </Box>
          )}
          <Divider />
          <MenuItem sx={{ justifyContent: 'center', py: 1.5 }} onClick={() => { handleNotifMenuClose(); router.push('/notifications'); }}>
            <Typography variant="body2" sx={{ color: olentiaColors.primary.main, fontWeight: 600 }}>Tümünü Gör</Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
