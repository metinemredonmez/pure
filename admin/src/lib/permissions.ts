export type UserRole = 'ADMIN' | 'SALES' | 'PARTNER' | 'CUSTOMER';

interface PagePermission {
  path: string;
  roles: UserRole[];
  readOnly?: UserRole[];
}

export const pagePermissions: PagePermission[] = [
  { path: '/', roles: ['ADMIN', 'SALES', 'PARTNER'] },
  { path: '/orders', roles: ['ADMIN', 'SALES'] },
  { path: '/products', roles: ['ADMIN', 'SALES'], readOnly: ['PARTNER'] },
  { path: '/categories', roles: ['ADMIN'] },
  { path: '/collections', roles: ['ADMIN'] },
  { path: '/subscriptions', roles: ['ADMIN', 'SALES'] },
  { path: '/payments', roles: ['ADMIN', 'SALES'] },
  { path: '/coupons', roles: ['ADMIN'] },
  { path: '/pricing', roles: ['ADMIN', 'SALES'] },
  { path: '/users', roles: ['ADMIN'] },
  { path: '/reviews', roles: ['ADMIN'] },
  { path: '/shipping', roles: ['ADMIN', 'SALES'] },
  { path: '/blog', roles: ['ADMIN'] },
  { path: '/faq', roles: ['ADMIN'] },
  { path: '/seo', roles: ['ADMIN'] },
  { path: '/loyalty', roles: ['ADMIN'] },
  { path: '/b2b', roles: ['ADMIN', 'SALES'] },
  { path: '/partners', roles: ['ADMIN'] },
  { path: '/notifications', roles: ['ADMIN'] },
  { path: '/reports/sales', roles: ['ADMIN', 'SALES', 'PARTNER'] },
  { path: '/reports/customers', roles: ['ADMIN', 'SALES'] },
  { path: '/reports/products', roles: ['ADMIN', 'SALES', 'PARTNER'] },
  { path: '/ai-reports', roles: ['ADMIN'] },
  { path: '/chatbot', roles: ['ADMIN'] },
  { path: '/ops', roles: ['ADMIN'] },
  { path: '/audit-logs', roles: ['ADMIN'] },
  { path: '/profile', roles: ['ADMIN', 'SALES', 'PARTNER'] },
  { path: '/settings', roles: ['ADMIN'] },
  { path: '/website/banners', roles: ['ADMIN'] },
  { path: '/website/machines', roles: ['ADMIN'] },
  { path: '/website/brands', roles: ['ADMIN'] },
  { path: '/website/references', roles: ['ADMIN'] },
  { path: '/website/pages', roles: ['ADMIN'] },
  { path: '/website/site-settings', roles: ['ADMIN'] },
  { path: '/website/leads', roles: ['ADMIN', 'SALES'] },
  { path: '/website/franchise', roles: ['ADMIN', 'SALES'] },
];

export function canAccessPage(role: UserRole, path: string): boolean {
  const permission = pagePermissions.find((p) => p.path === path);
  if (!permission) return role === 'ADMIN';
  return permission.roles.includes(role) || (permission.readOnly?.includes(role) ?? false);
}

export function isReadOnly(role: UserRole, path: string): boolean {
  const permission = pagePermissions.find((p) => p.path === path);
  if (!permission) return true;
  return permission.readOnly?.includes(role) ?? false;
}

export function getAccessiblePaths(role: UserRole): string[] {
  return pagePermissions
    .filter((p) => p.roles.includes(role) || (p.readOnly?.includes(role) ?? false))
    .map((p) => p.path);
}
