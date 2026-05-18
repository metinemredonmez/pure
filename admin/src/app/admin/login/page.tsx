'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Link as MuiLink,
  Grid,
  Divider,
  Chip,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  CheckCircleOutline,
} from '@mui/icons-material';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

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

const features = [
  'Premium kahve abonelik yönetimi',
  'Gerçek zamanlı sipariş takibi',
  'Sadakat programı & ödüller',
  'Kişiselleştirilmiş kahve deneyimi',
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaCode, setMfaCode] = useState('');

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'unauthorized') {
      setError('Bu panele erişim için admin yetkisi gereklidir.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password, mfaCode || undefined);
    } catch (err: unknown) {
      const error = err as Error & { mfaRequired?: boolean };
      if (error.mfaRequired || error.message === 'MFA_REQUIRED') {
        setMfaRequired(true);
        setError('');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: brandColors.dark }}>
        <CircularProgress sx={{ color: brandColors.rust }} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: brandColors.dark }}>
        {/* Left — Hero Section */}
        <Box sx={{
          display: { xs: 'none', md: 'block' },
          width: '55%',
          position: 'relative',
          overflow: 'hidden',
          backgroundImage: 'url(/images/login-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            // Daha az opak overlay — fotoğraf daha net görünür
            background: 'linear-gradient(135deg, rgba(11,11,11,0.55) 0%, rgba(11,11,11,0.35) 50%, rgba(212,121,63,0.10) 100%)',
            // Blur kaldırıldı; fotoğraf sharp kalsın
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
              Yönetim paneline
              <br />
              <Box component="span" sx={{ color: brandColors.rust }}>hoş geldiniz.</Box>
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.5)', mb: 5, maxWidth: 380, lineHeight: 1.8 }}>
              Pure Olentia admin paneli ile siparişleri, ürünleri ve müşterilerinizi tek noktadan yönetin.
            </Typography>

            {/* Features */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {features.map((f, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CheckCircleOutline sx={{ color: brandColors.rust, fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>{f}</Typography>
                </Box>
              ))}
            </Box>

            {/* Stats */}
            <Box sx={{ display: 'flex', gap: 4, mt: 6 }}>
              {[
                { num: '10K+', label: 'Mutlu Müşteri' },
                { num: '50+', label: 'Kahve Çeşidi' },
                { num: '4.9', label: 'Ortalama Puan' },
              ].map((s, i) => (
                <Box key={i}>
                  <Typography variant="h5" sx={{ color: brandColors.rust, fontWeight: 800 }}>{s.num}</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>{s.label}</Typography>
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

            <Typography variant="h4" sx={{ color: brandColors.cream, fontWeight: 700, mb: 0.5 }}>
              Giriş Yap
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.5)', mb: 4 }}>
              Yönetim paneline giriş yapın.
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit}>
              {/* Email */}
              <TextField
                fullWidth
                label="E-posta"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start"><EmailIcon /></InputAdornment>,
                  },
                }}
                sx={{ ...inputSx, mb: 2.5 }}
              />

              {/* Password */}
              <TextField
                fullWidth
                label="Şifre"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start"><LockIcon /></InputAdornment>,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: 'rgba(255,255,255,0.3)' }}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ ...inputSx, mb: 1.5 }}
              />

              {/* Forgot password link */}
              <Box sx={{ textAlign: 'right', mb: 3 }}>
                <MuiLink
                  component={Link}
                  href="/admin/forgot-password"
                  underline="hover"
                  sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', '&:hover': { color: brandColors.rust } }}
                >
                  Şifremi Unuttum
                </MuiLink>
              </Box>

              {/* MFA Code */}
              {mfaRequired && (
                <TextField
                  fullWidth
                  label="6 Haneli Doğrulama Kodu"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  placeholder="000000"
                  slotProps={{
                    input: {
                      startAdornment: <InputAdornment position="start"><LockIcon /></InputAdornment>,
                      sx: { fontFamily: 'monospace', fontSize: 18, letterSpacing: 4 },
                    },
                  }}
                  sx={{ ...inputSx, mb: 2.5 }}
                  helperText="Google Authenticator uygulamasındaki kodu girin"
                />
              )}

              {/* Submit */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{
                  py: 1.2, fontSize: '0.875rem', borderRadius: 1.5,
                  background: `linear-gradient(135deg, ${brandColors.rust} 0%, #B5632E 100%)`,
                  '&:hover': { background: `linear-gradient(135deg, ${brandColors.rustLight} 0%, ${brandColors.rust} 100%)` },
                  '&:disabled': { opacity: 0.6 },
                }}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Giriş Yap'}
              </Button>


              {/* Footer links */}
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <MuiLink component={Link} href="/admin/privacy" underline="hover" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', mx: 1 }}>Gizlilik</MuiLink>
                <Typography component="span" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>&bull;</Typography>
                <MuiLink component={Link} href="/admin/terms" underline="hover" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', mx: 1 }}>Koşullar</MuiLink>
                <Typography component="span" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>&bull;</Typography>
                <Typography component="span" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', mx: 1 }}>
                  &copy; {new Date().getFullYear()} Pure Olentia
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
  );
}

function LoginLoading() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: brandColors.dark }}>
      <CircularProgress sx={{ color: brandColors.rust }} />
    </Box>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  );
}
