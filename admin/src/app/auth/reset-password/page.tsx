'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock as LockIcon,
  CheckCircleOutline,
} from '@mui/icons-material';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/api';

const brandColors = {
  rust: '#D4793F',
  rustLight: '#E08A4F',
  cream: '#F5E6D3',
  dark: '#0B0B0B',
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

const strengthChecks = [
  { label: 'En az 8 karakter', test: (p: string) => p.length >= 8 },
  { label: 'Büyük harf', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Küçük harf', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Rakam', test: (p: string) => /[0-9]/.test(p) },
  { label: 'Özel karakter', test: (p: string) => /[@$!%*?&]/.test(p) },
];

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const passedChecks = strengthChecks.filter((c) => c.test(password)).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }
    if (passedChecks < 5) {
      setError('Şifre tüm gereksinimleri karşılamalıdır.');
      return;
    }
    if (!token) {
      setError('Geçersiz veya eksik token.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      setSuccess(true);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        const msg = axiosErr.response?.data?.message;
        if (msg?.includes('expired')) {
          setError('Bu bağlantının süresi dolmuş. Lütfen yeni bir sıfırlama talebi oluşturun.');
        } else if (msg?.includes('invalid') || msg?.includes('not found')) {
          setError('Geçersiz sıfırlama bağlantısı.');
        } else {
          setError(msg || 'Şifre sıfırlanamadı. Lütfen tekrar deneyin.');
        }
      } else {
        setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', bgcolor: brandColors.dark }}>
        <Box sx={{ textAlign: 'center', maxWidth: 400, p: 4 }}>
          <Typography variant="h5" sx={{ color: brandColors.cream, fontWeight: 700, mb: 2 }}>
            Geçersiz Bağlantı
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 3 }}>
            Bu şifre sıfırlama bağlantısı geçersiz veya eksik. Lütfen yeni bir sıfırlama talebi oluşturun.
          </Typography>
          <Button
            component={Link}
            href="/admin/forgot-password"
            variant="contained"
            sx={{
              py: 1.2, borderRadius: 1.5,
              background: `linear-gradient(135deg, ${brandColors.rust} 0%, #B5632E 100%)`,
            }}
          >
            Şifremi Unuttum
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: brandColors.dark }}>
      {/* Left — Background Image */}
      <Box sx={{
        display: { xs: 'none', md: 'block' },
        width: '55%',
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: 'url(/images/auth-bg-3.jpg)',
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

          <Typography variant="h3" sx={{ color: brandColors.cream, fontWeight: 800, mb: 2, lineHeight: 1.2 }}>
            Yeni şifrenizi
            <br />
            <Box component="span" sx={{ color: brandColors.rust }}>belirleyin.</Box>
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.5)', mb: 5, maxWidth: 380, lineHeight: 1.8 }}>
            Güvenli bir şifre seçin. Büyük-küçük harf, rakam ve özel karakter içermelidir.
          </Typography>
        </Box>
      </Box>

      {/* Right — Form */}
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
            Şifre Sıfırla
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.5)', mb: 4 }}>
            Yeni şifrenizi aşağıya girin.
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 1.5 }}>{error}</Alert>}

          {success ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Box sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: 'rgba(76,175,80,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
                <CheckCircleOutline sx={{ color: '#4CAF50', fontSize: 40 }} />
              </Box>
              <Typography variant="h5" sx={{ color: brandColors.cream, fontWeight: 700, mb: 1 }}>
                Şifre Güncellendi!
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 3 }}>
                Şifreniz başarıyla değiştirildi. Artık yeni şifrenizle giriş yapabilirsiniz.
              </Typography>
              <Button
                component={Link}
                href="/admin/login"
                variant="contained"
                size="large"
                sx={{
                  px: 5, py: 1.2, borderRadius: 1.5, fontSize: '0.875rem',
                  background: `linear-gradient(135deg, ${brandColors.rust} 0%, #B5632E 100%)`,
                }}
              >
                Giriş Yap
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Yeni Şifre"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
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
                sx={{ ...inputSx, mb: 2 }}
              />

              <TextField
                fullWidth
                label="Şifre Tekrar"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start"><LockIcon /></InputAdornment>,
                  },
                }}
                sx={{ ...inputSx, mb: 2 }}
              />

              {/* Password strength */}
              <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5 }}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <Box
                    key={level}
                    sx={{
                      flex: 1, height: 3, borderRadius: 2,
                      bgcolor: passedChecks >= level
                        ? level <= 2 ? '#EF5350' : level <= 3 ? '#FF9800' : level <= 4 ? '#FFB74D' : '#4CAF50'
                        : 'rgba(255,255,255,0.08)',
                      transition: 'background-color 0.3s',
                    }}
                  />
                ))}
              </Box>

              {/* Requirements checklist */}
              {password.length > 0 && (
                <Box sx={{ mb: 2.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {strengthChecks.map((check, i) => (
                    <Typography
                      key={i}
                      variant="caption"
                      sx={{
                        color: check.test(password) ? '#4CAF50' : 'rgba(255,255,255,0.3)',
                        fontSize: '0.7rem',
                      }}
                    >
                      {check.test(password) ? '\u2713' : '\u2717'} {check.label}
                      {i < strengthChecks.length - 1 ? '\u00A0\u00A0' : ''}
                    </Typography>
                  ))}
                </Box>
              )}

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
                {isLoading ? <CircularProgress size={22} color="inherit" /> : 'Şifreyi Güncelle'}
              </Button>

              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <MuiLink
                  component={Link}
                  href="/admin/login"
                  underline="hover"
                  sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', '&:hover': { color: brandColors.rust } }}
                >
                  Giriş sayfasına dön
                </MuiLink>
              </Box>
            </Box>
          )}

          <Box sx={{ textAlign: 'center', mt: 5 }}>
            <Typography component="span" sx={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}>
              &copy; {new Date().getFullYear()} Pure Olentia
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#0B0B0B' }}>
        <CircularProgress sx={{ color: '#D4793F' }} />
      </Box>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
