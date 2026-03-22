'use client';

import { Box, Typography, Breadcrumbs, Link as MuiLink } from '@mui/material';
import { NavigateNext, HomeOutlined } from '@mui/icons-material';
import Link from 'next/link';
import { ReactNode } from 'react';

interface Crumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Crumb[];
  action?: ReactNode;
}

export default function PageHeader({ title, subtitle, breadcrumbs, action }: PageHeaderProps) {
  return (
    <Box sx={{ mb: 2.5 }}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs separator={<NavigateNext sx={{ fontSize: 16 }} />} sx={{ mb: 1, '& .MuiBreadcrumbs-li': { fontSize: 13 } }}>
          <MuiLink component={Link} href="/" underline="hover" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <HomeOutlined sx={{ fontSize: 16 }} /> Ana Sayfa
          </MuiLink>
          {breadcrumbs.map((crumb, i) =>
            crumb.href && i < breadcrumbs.length - 1 ? (
              <MuiLink key={i} component={Link} href={crumb.href} underline="hover" color="text.secondary">{crumb.label}</MuiLink>
            ) : (
              <Typography key={i} color="text.primary" fontSize={13} fontWeight={500}>{crumb.label}</Typography>
            )
          )}
        </Breadcrumbs>
      )}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>{title}</Typography>
          {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
        </Box>
        {action && <Box>{action}</Box>}
      </Box>
    </Box>
  );
}
