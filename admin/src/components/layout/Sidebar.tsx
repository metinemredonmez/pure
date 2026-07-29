'use client';

import { useState, useCallback, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Collapse, Typography, Divider, Avatar, IconButton, useMediaQuery, useTheme,
} from '@mui/material';
import {
  DashboardOutlined as DashboardIcon, ShoppingCartOutlined as OrdersIcon, InventoryOutlined as ProductsIcon,
  CategoryOutlined as CategoriesIcon, SubscriptionsOutlined as SubscriptionsIcon, PeopleOutlined as UsersIcon,
  AssessmentOutlined as ReportsIcon, SettingsOutlined as SettingsIcon, ExpandLess, ExpandMore,
  ChevronLeft, PaymentOutlined as PaymentIcon, LocalShippingOutlined as ShippingIcon,
  ArticleOutlined as CmsIcon, LoyaltyOutlined as LoyaltyIcon, LocalOfferOutlined as CouponIcon,
  RateReviewOutlined as ReviewIcon, BusinessOutlined as B2BIcon, HandshakeOutlined as PartnerIcon,
  PriceChangeOutlined as PriceIcon, SmartToyOutlined as AIIcon, ChatOutlined as ChatIcon,
  HistoryOutlined as AuditIcon, StorageOutlined as OpsIcon, NotificationsOutlined as NotifIcon,
  IntegrationInstructionsOutlined as IntegrationIcon,
  CalendarMonthOutlined as CalendarIcon,
  LanguageOutlined as WebsiteIcon,
  MarkEmailReadOutlined as NewsletterIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { olentiaColors, olentiaLightColors } from '@/lib/theme';
import { canAccessPage, UserRole } from '@/lib/permissions';

const DRAWER_WIDTH = 260;

interface MenuItem {
  title: string;
  path?: string;
  icon: React.ReactNode;
  children?: { title: string; path: string }[];
}

const menuItems: MenuItem[] = [
  { title: 'Dashboard', path: '/', icon: <DashboardIcon sx={{ fontSize: 20 }} /> },
  { title: 'Takvim', path: '/calendar', icon: <CalendarIcon sx={{ fontSize: 20 }} /> },
  { title: 'Siparişler', path: '/orders', icon: <OrdersIcon sx={{ fontSize: 20 }} /> },
  {
    title: 'Ürünler', icon: <ProductsIcon sx={{ fontSize: 20 }} />,
    children: [
      { title: 'Ürün Listesi', path: '/products' },
      { title: 'Kategoriler', path: '/categories' },
      // Koleksiyonlar sidebar'dan kaldırıldı — anasayfa kartları artık Site Ayarları'ndan
      // tek yerden yönetiliyor. Sayfa URL ile (/collections) hâlâ erişilebilir
      // (gerekirse koleksiyona ürün eklemek için).
    ],
  },
  { title: 'Abonelikler', icon: <SubscriptionsIcon sx={{ fontSize: 20 }} />, children: [
    { title: 'Müşteri Abonelikleri', path: '/subscriptions' },
    { title: 'Abonelik Yönetimi', path: '/subscriptions/plans' },
  ] },
  { title: 'Ödemeler', path: '/payments', icon: <PaymentIcon sx={{ fontSize: 20 }} /> },
  { title: 'Kuponlar', path: '/coupons', icon: <CouponIcon sx={{ fontSize: 20 }} /> },
  { title: 'Fiyatlandırma', path: '/pricing', icon: <PriceIcon sx={{ fontSize: 20 }} /> },
  { title: 'Kullanıcılar', path: '/users', icon: <UsersIcon sx={{ fontSize: 20 }} /> },
  { title: 'Değerlendirmeler', path: '/reviews', icon: <ReviewIcon sx={{ fontSize: 20 }} /> },
  { title: 'Kargo', path: '/shipping', icon: <ShippingIcon sx={{ fontSize: 20 }} /> },
  {
    title: 'CMS', icon: <CmsIcon sx={{ fontSize: 20 }} />,
    children: [
      { title: 'Blog Yazıları', path: '/blog' },
      { title: 'Blog Yorumları', path: '/blog/comments' },
      { title: 'SEO', path: '/seo' },
    ],
  },
  { title: 'Sadakat', path: '/loyalty', icon: <LoyaltyIcon sx={{ fontSize: 20 }} /> },
  { title: 'B2B', path: '/b2b', icon: <B2BIcon sx={{ fontSize: 20 }} /> },
  { title: 'Partnerler', path: '/partners', icon: <PartnerIcon sx={{ fontSize: 20 }} /> },
  { title: 'Bildirimler', path: '/notifications', icon: <NotifIcon sx={{ fontSize: 20 }} /> },
  { title: 'Toplu Mesaj', path: '/broadcasts', icon: <NotifIcon sx={{ fontSize: 20 }} /> },
  { title: 'Bülten', path: '/newsletter', icon: <NewsletterIcon sx={{ fontSize: 20 }} /> },
  {
    title: 'Raporlar', icon: <ReportsIcon sx={{ fontSize: 20 }} />,
    children: [
      { title: 'Satış Raporu', path: '/reports/sales' },
      { title: 'Müşteri Raporu', path: '/reports/customers' },
      { title: 'Ürün Raporu', path: '/reports/products' },
    ],
  },
  { title: 'AI Raporlar', path: '/ai-reports', icon: <AIIcon sx={{ fontSize: 20 }} /> },
  { title: 'Chatbot', path: '/chatbot', icon: <ChatIcon sx={{ fontSize: 20 }} /> },
  {
    title: 'Sistem', icon: <OpsIcon sx={{ fontSize: 20 }} />,
    children: [
      { title: 'Sistem Yönetimi', path: '/ops' },
      { title: 'Denetim Logları', path: '/audit-logs' },
    ],
  },
  {
    title: 'Web Sitesi', icon: <WebsiteIcon sx={{ fontSize: 20 }} />,
    children: [
      { title: 'Banner\'lar', path: '/website/banners' },
      { title: 'Makineler', path: '/website/machines' },
      // 'Markalar' kaldırıldı — Brand modeli silindi (orphan).
      { title: 'Referanslar', path: '/website/references' },
      { title: 'Sayfalar', path: '/website/pages' },
      { title: 'Site Ayarları', path: '/website/site-settings' },
      // 'Başvurular' (/website/leads) kaldırıldı — /admin/b2b ile duplicate idi.
      // B2B başvuruları artık tek yerden /admin/b2b'de yönetiliyor.
      { title: 'Franchise', path: '/website/franchise' },
    ],
  },
  { title: 'Entegrasyonlar', path: '/integrations', icon: <IntegrationIcon sx={{ fontSize: 20 }} /> },
  { title: 'Ayarlar', path: '/settings', icon: <SettingsIcon sx={{ fontSize: 20 }} /> },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  onToggle: () => void;
}

export default function Sidebar({ open, onClose, onToggle }: SidebarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const userRole = (user?.role as UserRole) || 'CUSTOMER';

  // Theme'e göre renk paleti (dark/light)
  const c = theme.palette.mode === 'light' ? olentiaLightColors : olentiaColors;

  // Filter menu items based on role
  const filteredMenuItems = menuItems
    .map((item) => {
      if (item.path) {
        return canAccessPage(userRole, item.path) ? item : null;
      }
      if (item.children) {
        const accessibleChildren = item.children.filter((child) => canAccessPage(userRole, child.path));
        if (accessibleChildren.length === 0) return null;
        return { ...item, children: accessibleChildren };
      }
      return item;
    })
    .filter(Boolean) as MenuItem[];

  const handleToggleExpand = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]
    );
  };

  const [isPending, startTransition] = useTransition();
  const handleNavigation = useCallback((path: string) => {
    startTransition(() => {
      router.push(path);
    });
    if (isMobile) onClose();
  }, [router, isMobile, onClose]);

  const isActive = (path: string) => pathname === path;
  const isParentActive = (children?: { path: string }[]) =>
    children?.some((child) => pathname === child.path);

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: c.background.sidebar }}>
      {/* Logo */}
      <Box sx={{ px: 2.5, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 64 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box component="img" src="/images/logo.png" alt="Olentia" sx={{ width: 32, height: 32, borderRadius: '6px', objectFit: 'contain' }} />
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: 15, color: c.text.primary, lineHeight: 1.2 }}>
              Olentia
            </Typography>
            <Typography sx={{ fontSize: 11, color: c.text.secondary, lineHeight: 1 }}>
              Admin
            </Typography>
          </Box>
        </Box>
        {!isMobile && (
          <IconButton onClick={onToggle} size="small" sx={{ color: c.text.secondary }}>
            <ChevronLeft sx={{ fontSize: 18 }} />
          </IconButton>
        )}
      </Box>

      {/* Nav */}
      <Box sx={{ flex: 1, overflow: 'auto', px: 2, py: 1 }}>
        <List disablePadding>
          {filteredMenuItems.map((item) => (
            <Box key={item.title}>
              <ListItem disablePadding sx={{ mb: 0.25 }}>
                <ListItemButton
                  selected={item.path ? isActive(item.path) : isParentActive(item.children)}
                  onClick={() => item.path ? handleNavigation(item.path) : handleToggleExpand(item.title)}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText
                    primary={item.title}
                    primaryTypographyProps={{ fontSize: 13, fontWeight: isActive(item.path || '') || isParentActive(item.children) ? 600 : 400 }}
                  />
                  {item.children && (expandedItems.includes(item.title) ? <ExpandLess sx={{ fontSize: 18 }} /> : <ExpandMore sx={{ fontSize: 18 }} />)}
                </ListItemButton>
              </ListItem>

              {item.children && (
                <Collapse in={expandedItems.includes(item.title)} timeout="auto" unmountOnExit>
                  <List disablePadding sx={{ pl: 1 }}>
                    {item.children.map((child) => (
                      <ListItem key={child.path} disablePadding sx={{ mb: 0.25 }}>
                        <ListItemButton
                          selected={isActive(child.path)}
                          onClick={() => handleNavigation(child.path)}
                          sx={{ pl: 5 }}
                        >
                          <Box sx={{
                            width: 4, height: 4, borderRadius: '50%', mr: 1.5, flexShrink: 0,
                            bgcolor: isActive(child.path) ? c.primary.main : c.text.disabled,
                          }} />
                          <ListItemText
                            primary={child.title}
                            primaryTypographyProps={{ fontSize: 13, fontWeight: isActive(child.path) ? 600 : 400 }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              )}
            </Box>
          ))}
        </List>
      </Box>

      {/* Profile */}
      <Box sx={{ p: 2 }}>
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: '7px',
          bgcolor: c.background.hover,
        }}>
          <Avatar sx={{ width: 34, height: 34, bgcolor: c.primary.main, fontSize: 14 }}>
            {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email}
            </Typography>
            <Typography sx={{ fontSize: 11, color: c.text.secondary }}>Admin</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      <Drawer
        variant="temporary" open={open && isMobile} onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="persistent" open={open}
        sx={{
          display: { xs: 'none', md: 'block' }, width: open ? DRAWER_WIDTH : 0, flexShrink: 0,
          transition: 'width 0.2s ease-in-out', overflow: 'hidden',
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, overflow: 'hidden' },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}

export { DRAWER_WIDTH };
