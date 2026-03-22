// User types
export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  avatar: string | null;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  provider: string;
  isPartner: boolean;
  companyName: string | null;
  taxNumber: string | null;
  partnerRegion: string | null;
  mfaEnabled: boolean;
  marketingConsent: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    orders: number;
  };
}

export type UserRole = 'CUSTOMER' | 'ADMIN' | 'SALES' | 'PARTNER';

export interface UserListResponse {
  data: User[];
  meta: PaginationMeta;
}

// Order types
export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'PAYMENT_FAILED';

// Payment types
export interface Payment {
  id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  createdAt: string;
  paidAt: string | null;
  order?: {
    orderNumber: string;
    status: string;
    user: {
      id: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
    };
  };
  refunds?: Refund[];
}

export type PaymentMethod =
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'BANK_TRANSFER'
  | 'APPLE_PAY'
  | 'GOOGLE_PAY';

export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REFUNDED';

export interface Refund {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
}

// Pagination
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: UserRole;
  avatar: string | null;
  emailVerified: boolean;
  mfaEnabled: boolean;
  isActive: boolean;
}

// Stats types
export interface DashboardStats {
  users: {
    total: number;
    newToday: number;
    newThisMonth: number;
    roleDistribution: { role: string; count: number }[];
  };
  orders: {
    total: number;
    todayCount: number;
    thisMonthCount: number;
    statusDistribution: { status: string; count: number }[];
  };
  payments: {
    totalPayments: number;
    successfulPayments: number;
    failedPayments: number;
    todayRevenue: number;
    thisMonthRevenue: number;
    lastMonthRevenue: number;
    methodDistribution: { method: string; count: number; amount: number }[];
  };
  subscriptions?: {
    activeCount: number;
    pausedCount: number;
    cancelledCount: number;
    mrr: number;
  };
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}
