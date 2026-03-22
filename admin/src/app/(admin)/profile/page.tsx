'use client';

import { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, TextField, Button, Stack, Alert,
  Divider, Avatar, Chip, Switch, FormControlLabel, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton,
} from '@mui/material';
import {
  Person as PersonIcon, Lock as LockIcon, Security as SecurityIcon,
  QrCode2 as QrIcon, Close as CloseIcon, CheckCircle as CheckIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/lib/api';
import { olentiaColors } from '@/lib/theme';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [tab, setTab] = useState<'profile' | 'password' | 'security'>('profile');

  // Password
  const [pwForm, setPwForm] = useState({ current: '', newPass: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // MFA
  const [mfaSetupOpen, setMfaSetupOpen] = useState(false);
  const [mfaLoading, setMfaLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [mfaSecret, setMfaSecret] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaVerifying, setMfaVerifying] = useState(false);
  const [mfaMsg, setMfaMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [disabling, setDisabling] = useState(false);

  const handleChangePassword = async () => {
    if (pwForm.newPass !== pwForm.confirm) {
      setPwMsg({ type: 'error', text: 'Yeni şifreler eşleşmiyor' });
      return;
    }
    if (pwForm.newPass.length < 8) {
      setPwMsg({ type: 'error', text: 'Şifre en az 8 karakter olmalı' });
      return;
    }
    setPwSaving(true);
    setPwMsg(null);
    try {
      await authApi.changePassword(pwForm.current, pwForm.newPass);
      setPwMsg({ type: 'success', text: 'Şifre başarıyla değiştirildi' });
      setPwForm({ current: '', newPass: '', confirm: '' });
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setPwMsg({ type: 'error', text: err.response?.data?.message || 'Şifre değiştirilemedi' });
    } finally {
      setPwSaving(false);
    }
  };

  const handleSetupMfa = async () => {
    setMfaLoading(true);
    setMfaMsg(null);
    setMfaCode('');
    try {
      const response = await authApi.setupMfa();
      const result = response.data || response;
      setQrCode(result.qrCode);
      setMfaSecret(result.secret);
      setMfaSetupOpen(true);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setMfaMsg({ type: 'error', text: err.response?.data?.message || 'MFA kurulumu başarısız' });
    } finally {
      setMfaLoading(false);
    }
  };

  const handleVerifyMfa = async () => {
    if (mfaCode.length !== 6) return;
    setMfaVerifying(true);
    try {
      await authApi.enableMfa(mfaCode);
      setMfaSetupOpen(false);
      setMfaMsg({ type: 'success', text: 'İki faktörlü doğrulama aktif edildi' });
      refreshUser();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setMfaMsg({ type: 'error', text: err.response?.data?.message || 'Kod doğrulanamadı' });
    } finally {
      setMfaVerifying(false);
    }
  };

  const handleDisableMfa = async () => {
    setDisabling(true);
    try {
      await authApi.disableMfa();
      setMfaMsg({ type: 'success', text: 'İki faktörlü doğrulama devre dışı bırakıldı' });
      refreshUser();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setMfaMsg({ type: 'error', text: err.response?.data?.message || 'MFA devre dışı bırakılamadı' });
    } finally {
      setDisabling(false);
    }
  };

  const copySecret = () => {
    if (mfaSecret) {
      navigator.clipboard.writeText(mfaSecret);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Profil</Typography>
        <Typography variant="body2" color="text.secondary">Hesap bilgileri ve güvenlik ayarları</Typography>
      </Box>

      <Grid container spacing={2}>
        {/* Left — Nav */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: olentiaColors.primary.main, fontSize: 28, mx: 'auto', mb: 1.5 }}>
                {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
              </Avatar>
              <Typography variant="subtitle1" fontWeight={700}>
                {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email}
              </Typography>
              <Chip label={user?.role || 'ADMIN'} size="small" sx={{ mt: 0.5, bgcolor: `${olentiaColors.primary.main}20`, color: olentiaColors.primary.main }} />
            </CardContent>
            <Divider />
            <Stack spacing={0.5} sx={{ p: 1 }}>
              {[
                { key: 'profile' as const, label: 'Profil Bilgileri', icon: <PersonIcon sx={{ fontSize: 18 }} /> },
                { key: 'password' as const, label: 'Şifre Değiştir', icon: <LockIcon sx={{ fontSize: 18 }} /> },
                { key: 'security' as const, label: 'Güvenlik (2FA)', icon: <SecurityIcon sx={{ fontSize: 18 }} /> },
              ].map((item) => (
                <Button
                  key={item.key}
                  fullWidth
                  startIcon={item.icon}
                  onClick={() => setTab(item.key)}
                  variant={tab === item.key ? 'contained' : 'text'}
                  sx={{
                    justifyContent: 'flex-start', fontSize: 13,
                    ...(tab === item.key ? { bgcolor: olentiaColors.primary.main } : { color: 'text.secondary' }),
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Stack>
          </Card>
        </Grid>

        {/* Right — Content */}
        <Grid size={{ xs: 12, md: 9 }}>
          {/* Profile Info */}
          {tab === 'profile' && (
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Profil Bilgileri</Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <TextField fullWidth label="Ad" value={user?.firstName || ''} disabled size="small" />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField fullWidth label="Soyad" value={user?.lastName || ''} disabled size="small" />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField fullWidth label="E-posta" value={user?.email || ''} disabled size="small" />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField fullWidth label="Telefon" value={user?.phone || ''} disabled size="small" />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField fullWidth label="Rol" value={user?.role || ''} disabled size="small" />
                  </Grid>
                </Grid>
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Chip icon={<CheckIcon />} label={user?.emailVerified ? 'E-posta Doğrulanmış' : 'E-posta Doğrulanmamış'} color={user?.emailVerified ? 'success' : 'warning'} size="small" variant="outlined" />
                  <Chip icon={<SecurityIcon />} label={user?.mfaEnabled ? '2FA Aktif' : '2FA Pasif'} color={user?.mfaEnabled ? 'success' : 'default'} size="small" variant="outlined" />
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Change Password */}
          {tab === 'password' && (
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Şifre Değiştir</Typography>
                {pwMsg && <Alert severity={pwMsg.type} sx={{ mb: 2 }}>{pwMsg.text}</Alert>}
                <Stack spacing={2} sx={{ maxWidth: 400 }}>
                  <TextField fullWidth type="password" label="Mevcut Şifre" value={pwForm.current} onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })} />
                  <TextField fullWidth type="password" label="Yeni Şifre" value={pwForm.newPass} onChange={(e) => setPwForm({ ...pwForm, newPass: e.target.value })} helperText="En az 8 karakter" />
                  <TextField fullWidth type="password" label="Yeni Şifre (Tekrar)" value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} />
                  <Button
                    variant="contained" onClick={handleChangePassword}
                    disabled={pwSaving || !pwForm.current || !pwForm.newPass || !pwForm.confirm}
                    sx={{ bgcolor: olentiaColors.primary.main, '&:hover': { bgcolor: olentiaColors.primary.dark }, alignSelf: 'flex-start' }}
                  >
                    {pwSaving ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          )}

          {/* 2FA Security */}
          {tab === 'security' && (
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <SecurityIcon sx={{ color: olentiaColors.primary.main }} />
                  <Typography variant="subtitle1" fontWeight={700}>İki Faktörlü Doğrulama (2FA)</Typography>
                </Box>

                {mfaMsg && <Alert severity={mfaMsg.type} sx={{ mb: 2 }}>{mfaMsg.text}</Alert>}

                <Card variant="outlined" sx={{ p: 2.5, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="body1" fontWeight={600}>Google Authenticator / TOTP</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Google Authenticator, Authy veya benzeri bir uygulama ile hesabınızı koruyun.
                        Her girişte telefonunuzdaki 6 haneli kodu girmeniz gerekecek.
                      </Typography>
                    </Box>
                    <Chip
                      label={user?.mfaEnabled ? 'Aktif' : 'Pasif'}
                      color={user?.mfaEnabled ? 'success' : 'default'}
                      variant="outlined"
                      sx={{ ml: 2 }}
                    />
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    {user?.mfaEnabled ? (
                      <Button
                        variant="outlined" color="error" onClick={handleDisableMfa} disabled={disabling}
                      >
                        {disabling ? 'Devre dışı bırakılıyor...' : '2FA Devre Dışı Bırak'}
                      </Button>
                    ) : (
                      <Button
                        variant="contained" startIcon={<QrIcon />}
                        onClick={handleSetupMfa} disabled={mfaLoading}
                        sx={{ bgcolor: olentiaColors.primary.main, '&:hover': { bgcolor: olentiaColors.primary.dark } }}
                      >
                        {mfaLoading ? 'QR Kod Oluşturuluyor...' : '2FA Aktif Et'}
                      </Button>
                    )}
                  </Box>
                </Card>

                <Typography variant="body2" color="text.secondary">
                  İki faktörlü doğrulama, hesabınıza yetkisiz erişimi önlemek için ek bir güvenlik katmanı ekler.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* MFA Setup Dialog */}
      <Dialog open={mfaSetupOpen} onClose={() => setMfaSetupOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { bgcolor: 'background.paper', backgroundImage: 'none' } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <QrIcon sx={{ color: olentiaColors.primary.main }} />
            <Typography variant="h6" fontWeight={700}>2FA Kurulumu</Typography>
          </Box>
          <IconButton onClick={() => setMfaSetupOpen(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Stack spacing={3} sx={{ py: 1 }}>
            {/* Step 1 */}
            <Box>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                1. Google Authenticator uygulamasını açın
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Google Authenticator, Authy veya Microsoft Authenticator uygulamasını telefonunuzda açın.
              </Typography>
            </Box>

            {/* Step 2 — QR Code */}
            <Box>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                2. QR Kodu taratın
              </Typography>
              {qrCode && (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Box
                    component="img"
                    src={qrCode}
                    alt="QR Code"
                    sx={{ width: 200, height: 200, borderRadius: 2, border: '2px solid', borderColor: 'divider', p: 1, bgcolor: '#fff' }}
                  />
                </Box>
              )}
              {mfaSecret && (
                <Box sx={{ mt: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">QR okuyamıyorsanız bu kodu manuel girin:</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, p: 1.5, borderRadius: 1, bgcolor: 'grey.50' }}>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: 2, flex: 1 }}>
                      {mfaSecret}
                    </Typography>
                    <IconButton size="small" onClick={copySecret}><CopyIcon fontSize="small" /></IconButton>
                  </Box>
                </Box>
              )}
            </Box>

            {/* Step 3 — Verify */}
            <Box>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                3. Doğrulama kodunu girin
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                Uygulamada görünen 6 haneli kodu girin:
              </Typography>
              <TextField
                fullWidth
                label="6 Haneli Kod"
                value={mfaCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setMfaCode(val);
                }}
                placeholder="000000"
                slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: 24, textAlign: 'center', letterSpacing: 8 } } }}
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setMfaSetupOpen(false)} color="inherit">İptal</Button>
          <Button
            onClick={handleVerifyMfa} variant="contained"
            disabled={mfaVerifying || mfaCode.length !== 6}
            sx={{ bgcolor: olentiaColors.primary.main, '&:hover': { bgcolor: olentiaColors.primary.dark } }}
          >
            {mfaVerifying ? 'Doğrulanıyor...' : 'Doğrula ve Aktif Et'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
