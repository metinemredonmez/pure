'use client';

import { useState, useEffect, useCallback, useMemo, memo, ReactNode } from 'react';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Sidebar, { DRAWER_WIDTH } from './Sidebar';
import Header from './Header';
import { useAuth } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';

const InfoBar = dynamic(() => import('./InfoBar'), { ssr: false, loading: () => null });

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'), { noSsr: true });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const handleToggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);
  const handleCloseSidebar = useCallback(() => setSidebarOpen(false), []);

  if (!mounted || isLoading) {
    return null;
  }

  if (!isAuthenticated) return null;

  return (
    <ToastProvider>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar open={sidebarOpen} onClose={handleCloseSidebar} onToggle={handleToggleSidebar} />
        <Header sidebarOpen={sidebarOpen && !isMobile} onMenuClick={handleToggleSidebar} />
        <InfoBar sidebarOpen={sidebarOpen && !isMobile} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 1.5, sm: 2, md: 2.5 },
            pt: { xs: 1.5, sm: 2 },
            mt: '100px',
            transition: 'margin 0.2s ease-in-out',
            bgcolor: 'background.default',
            minHeight: 'calc(100vh - 100px)',
            overflow: 'auto',
          }}
        >
          {children}
          <Box component="footer" sx={{ mt: 4, py: 2, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
            <Typography variant="caption" color="text.disabled">
              © {new Date().getFullYear()} Pure Olentia. Tüm hakları saklıdır. | pureolentia.com
            </Typography>
          </Box>
        </Box>
      </Box>
    </ToastProvider>
  );
}
