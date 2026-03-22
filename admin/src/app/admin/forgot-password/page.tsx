'use client';

import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  CircularProgress,
  Link as MuiLink,
  Grid,
} from '@mui/material';
import { Email as EmailIcon, ArrowBack, CheckCircleOutline } from '@mui/icons-material';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/api';

const brandColors = {
  rust: '#D4793F',
  rustLight: '#E08A4F',
  cream: '#F5E6D3',
  dark: '#0B0B0B',
  card: '#161616',
};

const inputSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: 'rgba(255,255,255,0.03)',
    borderRadius: 1.5,
    fontSize: '0.875rem',
    '& input': { py: 1.2, px: 1.5 },
    '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus': {
      WebkitBoxShadow: '0 0 0 100px #161616 inset !important',
      WebkitTextFillColor: '#FFFFFF !important',
    },
    '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
    '&.Mui-focused fieldset': { borderColor: brandColors.rust },
  },
  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' },
  '& .MuiOutlinedInput-input': { color: '#FFFFFF' },
  '& .MuiInputAdornment-root .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.25)', fontSize: 18 },
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: brandColors.dark }}>
        {/* Left — Background Image with blur */}
        <Box sx={{
          display: { xs: 'none', md: 'block' },
          width: '55%',
          position: 'relative',
          overflow: 'hidden',
          backgroundImage: 'url(/images/auth-bg-2.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(135deg, rgba(11,11,11,0.85) 0%, rgba(11,11,11,0.6) 50%, rgba(212,121,63,0.15) 100%)',
            backdropFilter: 'blur(3px)',
            zIndex: 0,
          },
        }}>
          <Box sx={{
            position: 'relative', zIndex: 1,
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            minHeight: '100vh', p: 6,
          }}>
            {/* Brand */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 6 }}>
              <Box sx={{
                width: 52, height: 52, borderRadius: 2,
                bgcolor: '#FFFFFF',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
              }}>
                <Image src="/images/logo.png" alt="Pure Olentia" width={44} height={44} style={{ objectFit: 'contain' }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ color: brandColors.cream, fontWeight: 700, lineHeight: 1.2 }}>Pure Olentia</Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>Premium Coffee Experience</Typography>
              </Box>
            </Box>

            {/* Headline */}
            <Typography variant="h3" sx={{ color: brandColors.cream, fontWeight: 800, mb: 2, lineHeight: 1.2 }}>
              Endişelenmeyin,
              <br />
              <Box component="span" sx={{ color: brandColors.rust }}>biz buradayız.</Box>
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.5)', mb: 5, maxWidth: 380, lineHeight: 1.8 }}>
              Şifrenizi sıfırlamak çok kolay. E-posta adresinizi girin, size hemen bir sıfırlama bağlantısı gönderelim.
            </Typography>

            {/* Info items */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                'E-posta adresinize bağlantı gönderilecek',
                'Bağlantı 30 dakika geçerlidir',
                'Yeni şifrenizi belirleyebilirsiniz',
              ].map((f, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CheckCircleOutline sx={{ color: brandColors.rust, fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>{f}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Right — Form Section */}
        <Box sx={{
          width: { xs: '100%', md: '45%' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 3, md: 6 },
        }}>
          <Box sx={{ width: '100%', maxWidth: 400 }}>
            {/* Mobile brand */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1, mb: 4 }}>
              <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <Image src="/images/logo.png" alt="Pure Olentia" width={34} height={34} style={{ objectFit: 'contain' }} />
              </Box>
              <Typography variant="h6" sx={{ color: brandColors.cream, fontWeight: 700 }}>Pure Olentia</Typography>
            </Box>

            {/* Back link */}
            <MuiLink
              component={Link}
              href="/admin/login"
              underline="none"
              sx={{ display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.5)', mb: 4, fontSize: '0.875rem', '&:hover': { color: brandColors.rust } }}
            >
              <ArrowBack sx={{ fontSize: 18, mr: 0.5 }} /> Giriş sayfasına dön
            </MuiLink>

            <Typography variant="h4" sx={{ color: brandColors.cream, fontWeight: 700, mb: 0.5 }}>
              Şifremi Unuttum
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.5)', mb: 4 }}>
              E-posta adresinizi girin, şifre sıfırlama bağlantısı göndereceğiz.
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

            {success ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: 'rgba(76,175,80,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
                  <CheckCircleOutline sx={{ color: '#4CAF50', fontSize: 48 }} />
                </Box>
                <Typography variant="h5" sx={{ color: brandColors.cream, fontWeight: 700, mb: 1 }}>Bağlantı Gönderildi!</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 3 }}>
                  Şifre sıfırlama bağlantısı <strong>{email}</strong> adresine gönderildi. Lütfen e-postanızı kontrol edin.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  component={Link}
                  href="/admin/login"
                  sx={{
                    px: 5, py: 1.5, borderRadius: 2,
                    background: `linear-gradient(135deg, ${brandColors.rust} 0%, #B5632E 100%)`,
                  }}
                >
                  Giriş Sayfasına Dön
                </Button>
              </Box>
            ) : (
              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="E-posta"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  slotProps={{
                    input: {
                      startAdornment: <InputAdornment position="start"><EmailIcon /></InputAdornment>,
                    },
                  }}
                  sx={{ ...inputSx, mb: 3 }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isLoading}
                  sx={{
                    py: 1.5, fontSize: '1rem', borderRadius: 2,
                    background: `linear-gradient(135deg, ${brandColors.rust} 0%, #B5632E 100%)`,
                    '&:hover': { background: `linear-gradient(135deg, ${brandColors.rustLight} 0%, ${brandColors.rust} 100%)` },
                    '&:disabled': { opacity: 0.6 },
                  }}
                >
                  {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sıfırlama Bağlantısı Gönder'}
                </Button>
              </Box>
            )}

            {/* Footer links */}
            <Box sx={{ textAlign: 'center', mt: 5 }}>
              <MuiLink component={Link} href="/admin/privacy" underline="hover" sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', mx: 1 }}>Gizlilik</MuiLink>
              <Typography component="span" sx={{ color: 'rgba(255,255,255,0.15)', fontSize: '0.75rem' }}>&bull;</Typography>
              <MuiLink component={Link} href="/admin/terms" underline="hover" sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', mx: 1 }}>Koşullar</MuiLink>
              <Typography component="span" sx={{ color: 'rgba(255,255,255,0.15)', fontSize: '0.75rem' }}>&bull;</Typography>
              <Typography component="span" sx={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem', mx: 1 }}>
                &copy; {new Date().getFullYear()} Pure Olentia
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
  );
}
