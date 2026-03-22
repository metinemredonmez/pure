'use client';

import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Checkbox,
  FormControlLabel,
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
  Person as PersonIcon,
  CheckCircleOutline,
} from '@mui/icons-material';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

const features = [
  'Premium kahve abonelik yönetimi',
  'Gerçek zamanlı sipariş takibi',
  'Sadakat programı & ödüller',
  'Kişiselleştirilmiş kahve deneyimi',
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) { setError('Şifreler eşleşmiyor'); return; }
    if (form.password.length < 8) { setError('Şifre en az 8 karakter olmalıdır'); return; }
    if (!acceptTerms) { setError('Gizlilik politikası ve kullanım koşullarını kabul etmelisiniz'); return; }

    setIsLoading(true);
    try {
      await api.post('/auth/register', {
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
      });
      setSuccess(true);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setError(axiosErr.response?.data?.message || 'Kayıt yapılamadı');
      } else {
        setError('Kayıt yapılamadı. Lütfen tekrar deneyin.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: brandColors.dark }}>
        {/* Left — Hero Section */}
        <Box sx={{
          display: { xs: 'none', md: 'block' },
          width: '55%',
          position: 'relative',
          overflow: 'hidden',
          backgroundImage: 'url(/images/signup-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(135deg, rgba(11,11,11,0.85) 0%, rgba(11,11,11,0.6) 50%, rgba(212,121,63,0.15) 100%)',
            backdropFilter: 'blur(2px)',
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
              Kahve tutkunları
              <br />
              <Box component="span" sx={{ color: brandColors.rust }}>burada buluşuyor.</Box>
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.5)', mb: 5, maxWidth: 380, lineHeight: 1.8 }}>
              Pure Olentia ile premium kahve deneyiminin keyfini çıkarın. Özel karışımlar, taze kavurma ve kapınıza teslimat.
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
          <Box sx={{ width: '100%', maxWidth: 440 }}>
            {/* Mobile brand */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1, mb: 4 }}>
              <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <Image src="/images/logo.png" alt="Pure Olentia" width={34} height={34} style={{ objectFit: 'contain' }} />
              </Box>
              <Typography variant="h6" sx={{ color: brandColors.cream, fontWeight: 700 }}>Pure Olentia</Typography>
            </Box>

            <Typography variant="h4" sx={{ color: brandColors.cream, fontWeight: 700, mb: 0.5 }}>
              Hesap Oluştur
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.5)', mb: 4 }}>
              Zaten hesabınız var mı?{' '}
              <MuiLink component={Link} href="/admin/login" underline="hover" sx={{ color: brandColors.rust, fontWeight: 600 }}>
                Giriş Yap
              </MuiLink>
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

            {success ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: 'rgba(76,175,80,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
                  <CheckCircleOutline sx={{ color: '#4CAF50', fontSize: 48 }} />
                </Box>
                <Typography variant="h5" sx={{ color: brandColors.cream, fontWeight: 700, mb: 1 }}>Kayıt Başarılı!</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 3 }}>
                  E-posta adresinize doğrulama bağlantısı gönderildi.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => router.push('/admin/login')}
                  sx={{
                    px: 5, py: 1.5, borderRadius: 2,
                    background: `linear-gradient(135deg, ${brandColors.rust} 0%, #B5632E 100%)`,
                  }}
                >
                  Giriş Yap
                </Button>
              </Box>
            ) : (
              <Box component="form" onSubmit={handleSubmit}>
                {/* Name fields */}
                <Grid container spacing={2} sx={{ mb: 2.5 }}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth label="Ad" value={form.firstName} onChange={handleChange('firstName')} required autoFocus
                      slotProps={{ input: { startAdornment: <InputAdornment position="start"><PersonIcon /></InputAdornment> } }}
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth label="Soyad" value={form.lastName} onChange={handleChange('lastName')} required
                      slotProps={{ input: { startAdornment: <InputAdornment position="start"><PersonIcon /></InputAdornment> } }}
                      sx={inputSx}
                    />
                  </Grid>
                </Grid>

                {/* Email */}
                <TextField
                  fullWidth label="E-posta" type="email" value={form.email} onChange={handleChange('email')} required
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><EmailIcon /></InputAdornment> } }}
                  sx={{ ...inputSx, mb: 2.5 }}
                />

                {/* Passwords */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth label="Şifre" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange('password')} required
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
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth label="Şifre Tekrar" type={showPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={handleChange('confirmPassword')} required
                      slotProps={{ input: { startAdornment: <InputAdornment position="start"><LockIcon /></InputAdornment> } }}
                      sx={inputSx}
                    />
                  </Grid>
                </Grid>

                {/* Password strength hint */}
                <Box sx={{ display: 'flex', gap: 0.5, mb: 2.5 }}>
                  {[1, 2, 3, 4].map((level) => (
                    <Box
                      key={level}
                      sx={{
                        flex: 1, height: 3, borderRadius: 2,
                        bgcolor: form.password.length >= level * 3
                          ? level <= 1 ? '#EF5350' : level <= 2 ? '#FF9800' : level <= 3 ? '#FFB74D' : '#4CAF50'
                          : 'rgba(255,255,255,0.08)',
                        transition: 'background-color 0.3s',
                      }}
                    />
                  ))}
                </Box>

                {/* Terms */}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      sx={{ color: 'rgba(255,255,255,0.3)', '&.Mui-checked': { color: brandColors.rust } }}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                      <MuiLink component={Link} href="/admin/privacy" underline="hover" sx={{ color: brandColors.rust }}>Gizlilik Politikası</MuiLink>
                      {' ve '}
                      <MuiLink component={Link} href="/admin/terms" underline="hover" sx={{ color: brandColors.rust }}>Kullanım Koşulları</MuiLink>
                      {`'nı kabul ediyorum`}
                    </Typography>
                  }
                  sx={{ mb: 3 }}
                />

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
                  {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Kayıt Ol'}
                </Button>


                {/* Footer links */}
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                  <MuiLink component={Link} href="/admin/privacy" underline="hover" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', mx: 1 }}>Gizlilik</MuiLink>
                  <Typography component="span" sx={{ color: 'rgba(255,255,255,0.15)', fontSize: '0.75rem' }}>&bull;</Typography>
                  <MuiLink component={Link} href="/admin/terms" underline="hover" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', mx: 1 }}>Koşullar</MuiLink>
                  <Typography component="span" sx={{ color: 'rgba(255,255,255,0.15)', fontSize: '0.75rem' }}>&bull;</Typography>
                  <Typography component="span" sx={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem', mx: 1 }}>
                    &copy; {new Date().getFullYear()} Pure Olentia
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
  );
}
