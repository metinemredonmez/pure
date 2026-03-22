'use client';

import { Box, Typography, Button, Stack } from '@mui/material';
import { useRouter } from 'next/navigation';
import { SentimentDissatisfied as SadIcon, Home as HomeIcon, ArrowBack as BackIcon } from '@mui/icons-material';

export default function NotFound() {
  const router = useRouter();

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: '#0B0B0B',
      px: 3,
    }}>
      <Box sx={{ textAlign: 'center', maxWidth: 480 }}>
        <SadIcon sx={{ fontSize: 80, color: '#D4793F', mb: 2 }} />
        <Typography variant="h1" fontWeight={800} sx={{ color: '#D4793F', fontSize: { xs: 64, md: 96 }, lineHeight: 1 }}>
          404
        </Typography>
        <Typography variant="h5" fontWeight={600} sx={{ color: '#F5E6D3', mt: 2, mb: 1 }}>
          Sayfa Bulunamadı
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(245,230,211,0.6)', mb: 4 }}>
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="outlined"
            startIcon={<BackIcon />}
            onClick={() => router.back()}
            sx={{ color: '#F5E6D3', borderColor: 'rgba(255,255,255,0.2)', '&:hover': { borderColor: '#D4793F' } }}
          >
            Geri Dön
          </Button>
          <Button
            variant="contained"
            startIcon={<HomeIcon />}
            onClick={() => router.push('/')}
            sx={{ bgcolor: '#D4793F', '&:hover': { bgcolor: '#C06830' } }}
          >
            Ana Sayfa
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
