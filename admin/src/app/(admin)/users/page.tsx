'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Tooltip,
  Grid,
  Alert,
  Tabs,
  Tab,
  Badge,
  Stack,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as ActiveIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { usersApi } from '@/lib/api';
import { User, UserRole } from '@/types';
import { olentiaColors } from '@/lib/theme';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import PageHeader from '@/components/common/PageHeader';
import ExportButton from '@/components/common/ExportButton';

type UserType = 'all' | 'b2c' | 'b2b';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [userType, setUserType] = useState<UserType>('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Dialog state
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState<string>('');
  const [banReason, setBanReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: Record<string, unknown> = {
        page: page + 1,
        limit: rowsPerPage,
      };

      if (searchDebounced) params.search = searchDebounced;
      if (roleFilter) params.role = roleFilter;

      // Filter by user type (B2B = isPartner, B2C = !isPartner)
      // Note: This would need backend support, for now we filter on frontend
      const response = await usersApi.getUsers(params);
      const result = response.data || response;
      let filteredUsers = result.data || result.items || (Array.isArray(result) ? result : []);

      if (userType === 'b2b') {
        filteredUsers = filteredUsers.filter((u: User) => u.isPartner);
      } else if (userType === 'b2c') {
        filteredUsers = filteredUsers.filter((u: User) => !u.isPartner);
      }

      setUsers(filteredUsers);
      setTotal(
        userType === 'all'
          ? (result.meta?.total || result.total || filteredUsers.length)
          : filteredUsers.length
      );
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Kullanıcılar yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  }, [page, rowsPerPage, searchDebounced, roleFilter, userType]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    user: User
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRoleChange = async () => {
    if (!selectedUser || !newRole) return;
    setActionLoading(true);
    try {
      await usersApi.updateRole(selectedUser.id, newRole);
      setSuccess('Kullanıcı rolü güncellendi');
      setRoleDialogOpen(false);
      fetchUsers();
    } catch (err) {
      setError('Rol güncellenirken bir hata oluştu');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBanToggle = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await usersApi.banUser(
        selectedUser.id,
        selectedUser.isActive,
        banReason || undefined
      );
      setSuccess(
        selectedUser.isActive
          ? 'Kullanıcı engellendi'
          : 'Kullanıcı engeli kaldırıldı'
      );
      setBanDialogOpen(false);
      setBanReason('');
      fetchUsers();
    } catch (err) {
      setError('İşlem sırasında bir hata oluştu');
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleChip = (role: string) => {
    const config: Record<
      string,
      { label: string; color: 'default' | 'error' | 'success' | 'warning' | 'info' }
    > = {
      CUSTOMER: { label: 'Müşteri', color: 'default' },
      ADMIN: { label: 'Admin', color: 'error' },
      SALES: { label: 'Satış', color: 'info' },
      PARTNER: { label: 'Partner', color: 'success' },
    };
    const { label, color } = config[role] || { label: role, color: 'default' as const };
    return <Chip size="small" label={label} color={color} />;
  };

  const b2bCount = users.filter((u) => u.isPartner).length;
  const b2cCount = users.filter((u) => !u.isPartner).length;

  // Client-side sorting
  const sortedUsers = [...users].sort((a, b) => {
    let aVal: any, bVal: any;
    switch (sortBy) {
      case 'firstName': aVal = `${a.firstName} ${a.lastName}`.toLowerCase(); bVal = `${b.firstName} ${b.lastName}`.toLowerCase(); break;
      case 'role': aVal = a.role; bVal = b.role; break;
      case 'orderCount': aVal = a._count?.orders || 0; bVal = b._count?.orders || 0; break;
      case 'createdAt': aVal = a.createdAt; bVal = b.createdAt; break;
      default: aVal = a.createdAt; bVal = b.createdAt;
    }
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <Box>
      <PageHeader
        title="Kullanıcılar"
        subtitle="Tüm kullanıcıları yönetin"
        breadcrumbs={[{ label: 'Kullanıcılar' }]}
        action={
          <Stack direction="row" spacing={1} alignItems="center">
            <ExportButton
              data={users}
              columns={[
                { key: 'email', label: 'E-posta' },
                { key: 'firstName', label: 'Ad' },
                { key: 'lastName', label: 'Soyad' },
                { key: 'role', label: 'Rol' },
                { key: 'isActive', label: 'Aktif' },
                { key: 'createdAt', label: 'Kayıt Tarihi' },
              ]}
              filename="kullanicilar"
            />
            <Tooltip title="Yenile">
              <IconButton onClick={fetchUsers} disabled={isLoading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        }
      />

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}

      {/* User Type Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={userType}
          onChange={(_, v) => setUserType(v)}
          sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            value="all"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon fontSize="small" />
                <span>Tümü</span>
                <Badge
                  badgeContent={total}
                  color="primary"
                  max={9999}
                  sx={{ ml: 1 }}
                />
              </Box>
            }
          />
          <Tab
            value="b2c"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon fontSize="small" />
                <span>B2C</span>
                <Chip label={b2cCount} size="small" sx={{ ml: 1 }} />
              </Box>
            }
          />
          <Tab
            value="b2b"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BusinessIcon fontSize="small" />
                <span>B2B / Kurumsal</span>
                <Chip
                  label={b2bCount}
                  size="small"
                  color="success"
                  sx={{ ml: 1 }}
                />
              </Box>
            }
          />
        </Tabs>
      </Card>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                placeholder="İsim, e-posta veya telefon ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  },
                }}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Rol</InputLabel>
                <Select
                  value={roleFilter}
                  label="Rol"
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="USER">Kullanıcı</MenuItem>
                  <MenuItem value="ADMIN">Admin</MenuItem>
                  <MenuItem value="PARTNER">Partner</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sortDirection={sortBy === 'firstName' ? sortOrder : false}>
                  <TableSortLabel active={sortBy === 'firstName'} direction={sortBy === 'firstName' ? sortOrder : 'asc'} onClick={() => handleSort('firstName')}>Kullanıcı</TableSortLabel>
                </TableCell>
                <TableCell>Tip</TableCell>
                <TableCell sortDirection={sortBy === 'role' ? sortOrder : false}>
                  <TableSortLabel active={sortBy === 'role'} direction={sortBy === 'role' ? sortOrder : 'asc'} onClick={() => handleSort('role')}>Rol</TableSortLabel>
                </TableCell>
                <TableCell>Durum</TableCell>
                <TableCell sortDirection={sortBy === 'orderCount' ? sortOrder : false}>
                  <TableSortLabel active={sortBy === 'orderCount'} direction={sortBy === 'orderCount' ? sortOrder : 'asc'} onClick={() => handleSort('orderCount')}>Sipariş</TableSortLabel>
                </TableCell>
                <TableCell sortDirection={sortBy === 'createdAt' ? sortOrder : false}>
                  <TableSortLabel active={sortBy === 'createdAt'} direction={sortBy === 'createdAt' ? sortOrder : 'asc'} onClick={() => handleSort('createdAt')}>Kayıt Tarihi</TableSortLabel>
                </TableCell>
                <TableCell align="right">İşlem</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      Kullanıcı bulunamadı
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                sortedUsers.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          src={user.avatar || undefined}
                          sx={{ bgcolor: olentiaColors.primary.light }}
                        >
                          {user.firstName?.[0] ||
                            user.email[0].toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {user.firstName && user.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : '-'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.email}
                          </Typography>
                          {user.phone && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: 'block' }}
                            >
                              {user.phone}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {user.isPartner ? (
                        <Box>
                          <Chip
                            icon={<BusinessIcon />}
                            label="B2B"
                            size="small"
                            variant="outlined"
                            sx={{ bgcolor: 'rgba(76,175,80,0.12)', color: '#4CAF50', borderColor: 'rgba(76,175,80,0.3)', '& .MuiChip-icon': { color: '#4CAF50' } }}
                          />
                          {user.companyName && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: 'block', mt: 0.5 }}
                            >
                              {user.companyName}
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Chip
                          icon={<PersonIcon />}
                          label="B2C"
                          size="small"
                          sx={{ bgcolor: 'rgba(66,165,245,0.12)', color: '#42A5F5', borderColor: 'rgba(66,165,245,0.3)', '& .MuiChip-icon': { color: '#42A5F5' } }}
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                    <TableCell>{getRoleChip(user.role)}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        icon={user.isActive ? <ActiveIcon /> : <BlockIcon />}
                        label={user.isActive ? 'Aktif' : 'Engelli'}
                        color={user.isActive ? 'success' : 'error'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {user._count?.orders || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {format(new Date(user.createdAt), 'd MMM yyyy', {
                          locale: tr,
                        })}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, user)}
                      >
                        <MoreIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Sayfa başına:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} / ${count}`
          }
        />
      </Card>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            setNewRole(selectedUser?.role || 'USER');
            setRoleDialogOpen(true);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Rol Değiştir
        </MenuItem>
        <MenuItem
          onClick={() => {
            setBanDialogOpen(true);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            {selectedUser?.isActive ? (
              <BlockIcon fontSize="small" color="error" />
            ) : (
              <ActiveIcon fontSize="small" color="success" />
            )}
          </ListItemIcon>
          {selectedUser?.isActive ? 'Engelle' : 'Engeli Kaldır'}
        </MenuItem>
      </Menu>

      {/* Role Change Dialog */}
      <Dialog open={roleDialogOpen} onClose={() => setRoleDialogOpen(false)}>
        <DialogTitle>Rol Değiştir</DialogTitle>
        <DialogContent sx={{ minWidth: 300 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {selectedUser?.email} kullanıcısının rolünü değiştirin
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Yeni Rol</InputLabel>
            <Select
              value={newRole}
              label="Yeni Rol"
              onChange={(e) => setNewRole(e.target.value)}
            >
              <MenuItem value="USER">Kullanıcı</MenuItem>
              <MenuItem value="ADMIN">Admin</MenuItem>
              <MenuItem value="PARTNER">Partner</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialogOpen(false)}>İptal</Button>
          <Button
            variant="contained"
            onClick={handleRoleChange}
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={20} /> : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Ban Dialog */}
      <Dialog open={banDialogOpen} onClose={() => setBanDialogOpen(false)}>
        <DialogTitle>
          {selectedUser?.isActive ? 'Kullanıcıyı Engelle' : 'Engeli Kaldır'}
        </DialogTitle>
        <DialogContent sx={{ minWidth: 300 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {selectedUser?.isActive
              ? `${selectedUser?.email} kullanıcısını engellemek istediğinize emin misiniz?`
              : `${selectedUser?.email} kullanıcısının engelini kaldırmak istediğinize emin misiniz?`}
          </Typography>
          {selectedUser?.isActive && (
            <TextField
              fullWidth
              label="Engelleme Sebebi (opsiyonel)"
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              multiline
              rows={2}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBanDialogOpen(false)}>İptal</Button>
          <Button
            variant="contained"
            color={selectedUser?.isActive ? 'error' : 'success'}
            onClick={handleBanToggle}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <CircularProgress size={20} />
            ) : selectedUser?.isActive ? (
              'Engelle'
            ) : (
              'Engeli Kaldır'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
