import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token refresh state
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Request interceptor - add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle 401 and refresh token
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Wait for the refresh to complete
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = Cookies.get('refreshToken');
      if (!refreshToken) {
        // No refresh token, redirect to login
        isRefreshing = false;
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        window.location.href = '/admin/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const newAccessToken = data.accessToken;
        Cookies.set('accessToken', newAccessToken, { expires: 1 });

        if (data.refreshToken) {
          Cookies.set('refreshToken', data.refreshToken, { expires: 7 });
        }

        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        window.location.href = '/admin/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (email: string, password: string, mfaCode?: string) => {
    const { data } = await api.post('/auth/login', { email, password, mfaCode });
    return data;
  },
  logout: async () => {
    const refreshToken = Cookies.get('refreshToken');
    await api.post('/auth/logout', { refreshToken });
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
  },
  getMe: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },
  changePassword: async (currentPassword: string, newPassword: string) => {
    const { data } = await api.post('/auth/change-password', { currentPassword, newPassword });
    return data;
  },
  setupMfa: async () => {
    const { data } = await api.post('/auth/mfa/setup');
    return data;
  },
  enableMfa: async (code: string) => {
    const { data } = await api.post('/auth/mfa/enable', { code });
    return data;
  },
  disableMfa: async () => {
    const { data } = await api.post('/auth/mfa/disable');
    return data;
  },
};

// Users API
export const usersApi = {
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: string;
  }) => {
    const { data } = await api.get('/admin/users', { params });
    return data;
  },
  getUserById: async (id: string) => {
    const { data } = await api.get(`/admin/users/${id}`);
    return data;
  },
  getStats: async () => {
    const { data } = await api.get('/admin/users/stats');
    return data;
  },
  updateRole: async (id: string, role: string) => {
    const { data } = await api.patch(`/admin/users/${id}/role`, { role });
    return data;
  },
  banUser: async (id: string, banned: boolean, reason?: string) => {
    const { data } = await api.patch(`/admin/users/${id}/ban`, {
      banned,
      reason,
    });
    return data;
  },
};

// Orders API
export const ordersApi = {
  getOrders: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) => {
    const { data } = await api.get('/admin/orders', { params });
    return data;
  },
  getOrderById: async (id: string) => {
    const { data } = await api.get(`/admin/orders/${id}`);
    return data;
  },
  updateStatus: async (id: string, status: string, note?: string) => {
    const { data } = await api.patch(`/admin/orders/${id}/status`, {
      status,
      note,
    });
    return data;
  },
};

// Payments API
export const paymentsApi = {
  getPayments: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    method?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: string;
  }) => {
    const { data } = await api.get('/admin/payments', { params });
    return data;
  },
  getPaymentById: async (id: string) => {
    const { data } = await api.get(`/admin/payments/${id}`);
    return data;
  },
  getStats: async () => {
    const { data } = await api.get('/admin/payments/stats');
    return data;
  },
  refund: async (id: string, amount: number, reason?: string) => {
    const { data } = await api.post(`/admin/payments/${id}/refund`, {
      amount,
      reason,
    });
    return data;
  },
};

// Subscriptions API
export const subscriptionsApi = {
  getSubscriptions: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => {
    const { data } = await api.get('/admin/subscriptions', { params });
    return data;
  },
  getStats: async () => {
    const { data } = await api.get('/admin/subscriptions/stats');
    return data;
  },
  // Plans
  getPlans: async () => {
    const { data } = await api.get('/subscription/plans');
    return data;
  },
  createPlan: async (planData: Record<string, unknown>) => {
    const { data } = await api.post('/admin/subscriptions/plans', planData);
    return data;
  },
  updatePlan: async (id: string, planData: Record<string, unknown>) => {
    const { data } = await api.put(`/admin/subscriptions/plans/${id}`, planData);
    return data;
  },
  deletePlan: async (id: string) => {
    const { data } = await api.delete(`/admin/subscriptions/plans/${id}`);
    return data;
  },
};

// Products API
export const productsApi = {
  getProducts: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    status?: string;
  }) => {
    const { data } = await api.get('/admin/products', { params });
    return data;
  },
  getProductBySlug: async (slug: string) => {
    const { data } = await api.get(`/admin/products/${slug}`);
    return data;
  },
  createProduct: async (product: Record<string, unknown>) => {
    const { data } = await api.post('/admin/products', product);
    return data;
  },
  updateProduct: async (id: string, product: Record<string, unknown>) => {
    const { data } = await api.put(`/admin/products/${id}`, product);
    return data;
  },
  deleteProduct: async (id: string) => {
    const { data } = await api.delete(`/admin/products/${id}`);
    return data;
  },
  addVariant: async (productId: string, variant: Record<string, unknown>) => {
    const { data } = await api.post(`/admin/products/${productId}/variants`, variant);
    return data;
  },
};

// Categories API
export const categoriesApi = {
  getCategories: async () => {
    const { data } = await api.get('/categories');
    return data;
  },
  createCategory: async (category: Record<string, unknown>) => {
    const { data } = await api.post('/admin/categories', category);
    return data;
  },
  updateCategory: async (id: string, category: Record<string, unknown>) => {
    const { data } = await api.put(`/admin/categories/${id}`, category);
    return data;
  },
  deleteCategory: async (id: string) => {
    const { data } = await api.delete(`/admin/categories/${id}`);
    return data;
  },
};

// Collections API
export const collectionsApi = {
  getCollections: async () => {
    const { data } = await api.get('/collections');
    return data;
  },
  createCollection: async (collection: Record<string, unknown>) => {
    const { data } = await api.post('/admin/collections', collection);
    return data;
  },
  updateCollection: async (id: string, collection: Record<string, unknown>) => {
    const { data } = await api.put(`/admin/collections/${id}`, collection);
    return data;
  },
  deleteCollection: async (id: string) => {
    const { data } = await api.delete(`/admin/collections/${id}`);
    return data;
  },
};

// Dashboard API
export const dashboardApi = {
  getKPIs: async () => {
    const { data } = await api.get('/admin/dashboard');
    return data;
  },
  getRevenueChart: async (days?: number) => {
    const { data } = await api.get('/admin/dashboard/revenue-chart', { params: { days } });
    return data;
  },
  getTopProducts: async (limit?: number, days?: number) => {
    const { data } = await api.get('/admin/dashboard/top-products', { params: { limit, days } });
    return data;
  },
  getRecentOrders: async (limit?: number) => {
    const { data } = await api.get('/admin/dashboard/recent-orders', { params: { limit } });
    return data;
  },
  getCustomerInsights: async () => {
    const { data } = await api.get('/admin/dashboard/customer-insights');
    return data;
  },
  getOrderStatus: async () => {
    const { data } = await api.get('/admin/dashboard/order-status');
    return data;
  },
  getLowStock: async () => {
    const { data } = await api.get('/admin/dashboard/low-stock');
    return data;
  },
};

// Shipping API
export const shippingApi = {
  getShipments: async (params?: { page?: number; limit?: number; status?: string }) => {
    const { data } = await api.get('/admin/shipping', { params });
    return data;
  },
  updateShipment: async (id: string, update: Record<string, unknown>) => {
    const { data } = await api.patch(`/admin/shipping/${id}`, update);
    return data;
  },
  getDashboard: async () => {
    const { data } = await api.get('/admin/shipping/dashboard');
    return data;
  },
  getSettings: async () => {
    const { data } = await api.get('/admin/shipping/settings');
    return data;
  },
  updateSettings: async (settings: Record<string, unknown>) => {
    const { data } = await api.put('/admin/shipping/settings', settings);
    return data;
  },
  getZones: async () => {
    const { data } = await api.get('/admin/shipping/zones');
    return data;
  },
};

// Calendar API
export const calendarApi = {
  getEvents: async (params?: { startDate?: string; endDate?: string; type?: string }) => {
    const { data } = await api.get('/admin/calendar/events', { params });
    return data;
  },
  createEvent: async (event: Record<string, unknown>) => {
    const { data } = await api.post('/admin/calendar/events', event);
    return data;
  },
  updateEvent: async (id: string, event: Record<string, unknown>) => {
    const { data } = await api.put(`/admin/calendar/events/${id}`, event);
    return data;
  },
  deleteEvent: async (id: string) => {
    const { data } = await api.delete(`/admin/calendar/events/${id}`);
    return data;
  },
};

// Blog API
export const blogApi = {
  getPosts: async (params?: { page?: number; limit?: number }) => {
    const { data } = await api.get('/admin/blog/posts', { params });
    return data;
  },
  createPost: async (post: Record<string, unknown>) => {
    const { data } = await api.post('/admin/blog/posts', post);
    return data;
  },
  updatePost: async (id: string, post: Record<string, unknown>) => {
    const { data } = await api.put(`/admin/blog/posts/${id}`, post);
    return data;
  },
  deletePost: async (id: string) => {
    const { data } = await api.delete(`/admin/blog/posts/${id}`);
    return data;
  },
};

// FAQ API
export const faqApi = {
  getFaqs: async (category?: string) => {
    const { data } = await api.get('/faq', { params: { category } });
    return data;
  },
  createFaq: async (faq: Record<string, unknown>) => {
    const { data } = await api.post('/admin/faq', faq);
    return data;
  },
  updateFaq: async (id: string, faq: Record<string, unknown>) => {
    const { data } = await api.put(`/admin/faq/${id}`, faq);
    return data;
  },
  deleteFaq: async (id: string) => {
    const { data } = await api.delete(`/admin/faq/${id}`);
    return data;
  },
};

// Loyalty API
export const loyaltyApi = {
  getStats: async () => {
    const { data } = await api.get('/admin/loyalty/stats');
    return data;
  },
  getLeaderboard: async () => {
    const { data } = await api.get('/admin/loyalty/leaderboard');
    return data;
  },
  adjustPoints: async (userId: string, points: number, reason: string) => {
    const { data } = await api.post('/admin/loyalty/adjust', { userId, points, reason });
    return data;
  },
  getConfig: async () => {
    const { data } = await api.get('/admin/loyalty/config');
    return data;
  },
  updateConfig: async (config: Record<string, unknown>) => {
    const { data } = await api.post('/admin/loyalty/config', config);
    return data;
  },
  getUserLoyalty: async (userId: string) => {
    const { data } = await api.get(`/admin/loyalty/users/${userId}`);
    return data;
  },
};

// Reviews API
export const reviewsApi = {
  getReviews: async (params?: { page?: number; limit?: number; status?: string; productId?: string }) => {
    const { data } = await api.get('/admin/reviews', { params });
    return data;
  },
  approveReview: async (id: string, approved: boolean) => {
    const { data } = await api.post(`/admin/reviews/${id}/approve`, { approved });
    return data;
  },
  deleteReview: async (id: string) => {
    const { data } = await api.delete(`/admin/reviews/${id}`);
    return data;
  },
};

// B2B API
export const b2bApi = {
  getLeads: async (params?: { page?: number; limit?: number; status?: string }) => {
    const { data } = await api.get('/admin/b2b/leads', { params });
    return data;
  },
  updateLead: async (id: string, update: Record<string, unknown>) => {
    const { data } = await api.patch(`/admin/b2b/leads/${id}`, update);
    return data;
  },
  deleteLead: async (id: string) => {
    const { data } = await api.delete(`/admin/b2b/leads/${id}`);
    return data;
  },
  createQuote: async (quote: Record<string, unknown>) => {
    const { data } = await api.post('/admin/b2b/quotes', quote);
    return data;
  },
  createContract: async (contract: Record<string, unknown>) => {
    const { data } = await api.post('/admin/b2b/contracts', contract);
    return data;
  },
};

// Partner Admin API
export const partnerAdminApi = {
  getPartners: async () => {
    const { data } = await api.get('/partner/admin/list');
    return data;
  },
  getSalesMap: async () => {
    const { data } = await api.get('/partner/admin/sales-map');
    return data;
  },
  getRegionalPerformance: async () => {
    const { data } = await api.get('/partner/admin/regional-performance');
    return data;
  },
  updatePartner: async (id: string, update: Record<string, unknown>) => {
    const { data } = await api.patch(`/partner/admin/${id}`, update);
    return data;
  },
  deletePartner: async (id: string) => {
    const { data } = await api.delete(`/partner/admin/${id}`);
    return data;
  },
};

// Notification Admin API
export const notificationsApi = {
  sendEmail: async (payload: Record<string, unknown>) => {
    const { data } = await api.post('/admin/notifications/send', payload);
    return data;
  },
  sendTemplate: async (payload: Record<string, unknown>) => {
    const { data } = await api.post('/admin/notifications/send-template', payload);
    return data;
  },
  getTemplates: async () => {
    const { data } = await api.get('/admin/notifications/templates');
    return data;
  },
  createTemplate: async (template: Record<string, unknown>) => {
    const { data } = await api.post('/admin/notifications/templates', template);
    return data;
  },
  updateTemplate: async (id: string, template: Record<string, unknown>) => {
    const { data } = await api.put(`/admin/notifications/templates/${id}`, template);
    return data;
  },
  getLogs: async (params?: { page?: number; limit?: number }) => {
    const { data } = await api.get('/admin/notifications/logs', { params });
    return data;
  },
  sendInApp: async (payload: { userId: string; title: string; message: string; type?: string; link?: string }) => {
    const { data } = await api.post('/admin/notifications/send-inapp', payload);
    return data;
  },
};

// Pricing Admin API
export const pricingApi = {
  getProductPrices: async (productId: string) => {
    const { data } = await api.get(`/admin/products/${productId}/prices`);
    return data;
  },
  setProductPrice: async (productId: string, price: Record<string, unknown>) => {
    const { data } = await api.post(`/admin/products/${productId}/prices`, price);
    return data;
  },
  getVolumeDiscounts: async () => {
    const { data } = await api.get('/admin/volume-discounts');
    return data;
  },
  createVolumeDiscount: async (discount: Record<string, unknown>) => {
    const { data } = await api.post('/admin/volume-discounts', discount);
    return data;
  },
  updateVolumeDiscount: async (id: string, discount: Record<string, unknown>) => {
    const { data } = await api.put(`/admin/volume-discounts/${id}`, discount);
    return data;
  },
  deleteVolumeDiscount: async (id: string) => {
    const { data } = await api.delete(`/admin/volume-discounts/${id}`);
    return data;
  },
};

// AI Analysis API
export const aiApi = {
  getDailyReport: async () => {
    const { data } = await api.get('/ai/analysis/daily-report');
    return data;
  },
  getVoiceReport: async () => {
    const { data } = await api.get('/ai/analysis/voice-report');
    return data;
  },
  query: async (question: string) => {
    const { data } = await api.post('/ai/analysis/query', { question });
    return data;
  },
};

// Chatbot Admin API
export const chatbotApi = {
  getSessions: async (params?: { page?: number; limit?: number }) => {
    const { data } = await api.get('/admin/chatbot/sessions', { params });
    return data;
  },
  getSessionHistory: async (sessionId: string) => {
    const { data } = await api.get(`/admin/chatbot/sessions/${sessionId}`);
    return data;
  },
};

// Audit Log API
export const auditApi = {
  getLogs: async (params?: { page?: number; limit?: number; userId?: string; action?: string; entity?: string }) => {
    const { data } = await api.get('/admin/audit-logs', { params });
    return data;
  },
};

// Cache Management API
export const cacheApi = {
  getStats: async () => {
    const { data } = await api.get('/admin/cache/stats');
    return data;
  },
  getGroups: async () => {
    const { data } = await api.get('/admin/cache/groups');
    return data;
  },
  flushAll: async () => {
    const { data } = await api.delete('/admin/cache/flush-all');
    return data;
  },
  clearGroup: async (group: string) => {
    const { data } = await api.delete(`/admin/cache/${group}`);
    return data;
  },
  warmUp: async () => {
    const { data } = await api.post('/admin/cache/warm-up');
    return data;
  },
};

// Cron Job API
export const cronApi = {
  getJobs: async () => {
    const { data } = await api.get('/admin/cron/jobs');
    return data;
  },
  triggerJob: async (name: string) => {
    const { data } = await api.post(`/admin/cron/jobs/${name}/trigger`);
    return data;
  },
  toggleJob: async (name: string) => {
    const { data } = await api.patch(`/admin/cron/jobs/${name}/toggle`);
    return data;
  },
  getJobLogs: async (name: string) => {
    const { data } = await api.get(`/admin/cron/jobs/${name}/logs`);
    return data;
  },
  getRecentLogs: async () => {
    const { data } = await api.get('/admin/cron/logs');
    return data;
  },
};

// Integration Settings API
export const integrationsApi = {
  getSettings: async (group?: string) => {
    const { data } = await api.get('/admin/settings/integrations', { params: { group } });
    return data;
  },
  getGroups: async () => {
    const { data } = await api.get('/admin/settings/integrations/groups');
    return data;
  },
  updateSetting: async (key: string, value: unknown) => {
    const { data } = await api.put(`/admin/settings/integrations/${key}`, { value });
    return data;
  },
  testConnection: async (group: string) => {
    const { data } = await api.post('/admin/settings/integrations/test', { group });
    return data;
  },
  seed: async () => {
    const { data } = await api.post('/admin/settings/integrations/seed');
    return data;
  },
};

// Coupons API
export const couponsApi = {
  getCoupons: async (params?: { page?: number; limit?: number; isActive?: boolean }) => {
    const { data } = await api.get('/admin/coupons', { params });
    return data;
  },
  createCoupon: async (coupon: Record<string, unknown>) => {
    const { data } = await api.post('/admin/coupons', coupon);
    return data;
  },
  updateCoupon: async (id: string, coupon: Record<string, unknown>) => {
    const { data } = await api.put(`/admin/coupons/${id}`, coupon);
    return data;
  },
  deleteCoupon: async (id: string) => {
    const { data } = await api.delete(`/admin/coupons/${id}`);
    return data;
  },
};

// Upload API
// Website API
export const websiteApi = {
  // Banners
  getBanners: async () => { const { data } = await api.get('/admin/banners'); return data; },
  createBanner: async (banner: Record<string, unknown>) => { const { data } = await api.post('/admin/banners', banner); return data; },
  updateBanner: async (id: string, banner: Record<string, unknown>) => { const { data } = await api.put(`/admin/banners/${id}`, banner); return data; },
  deleteBanner: async (id: string) => { const { data } = await api.delete(`/admin/banners/${id}`); return data; },
  reorderBanners: async (items: { id: string; sortOrder: number }[]) => { const { data } = await api.patch('/admin/banners/reorder', { items }); return data; },

  // Machines
  getMachines: async () => { const { data } = await api.get('/admin/machines'); return data; },
  createMachine: async (machine: Record<string, unknown>) => { const { data } = await api.post('/admin/machines', machine); return data; },
  updateMachine: async (id: string, machine: Record<string, unknown>) => { const { data } = await api.put(`/admin/machines/${id}`, machine); return data; },
  deleteMachine: async (id: string) => { const { data } = await api.delete(`/admin/machines/${id}`); return data; },
  reorderMachines: async (items: { id: string; sortOrder: number }[]) => { const { data } = await api.patch('/admin/machines/reorder', { items }); return data; },

  // Brands
  getBrands: async () => { const { data } = await api.get('/admin/brands'); return data; },
  createBrand: async (brand: Record<string, unknown>) => { const { data } = await api.post('/admin/brands', brand); return data; },
  updateBrand: async (id: string, brand: Record<string, unknown>) => { const { data } = await api.put(`/admin/brands/${id}`, brand); return data; },
  deleteBrand: async (id: string) => { const { data } = await api.delete(`/admin/brands/${id}`); return data; },

  // References
  getReferences: async () => { const { data } = await api.get('/admin/references'); return data; },
  createReference: async (ref: Record<string, unknown>) => { const { data } = await api.post('/admin/references', ref); return data; },
  updateReference: async (id: string, ref: Record<string, unknown>) => { const { data } = await api.put(`/admin/references/${id}`, ref); return data; },
  deleteReference: async (id: string) => { const { data } = await api.delete(`/admin/references/${id}`); return data; },

  // Pages
  getPages: async () => { const { data } = await api.get('/admin/pages'); return data; },
  createPage: async (page: Record<string, unknown>) => { const { data } = await api.post('/admin/pages', page); return data; },
  updatePage: async (id: string, page: Record<string, unknown>) => { const { data } = await api.put(`/admin/pages/${id}`, page); return data; },
  deletePage: async (id: string) => { const { data } = await api.delete(`/admin/pages/${id}`); return data; },

  // Franchise Applications
  getFranchiseApplications: async (params?: { page?: number; limit?: number; status?: string }) => { const { data } = await api.get('/admin/franchise-applications', { params }); return data; },
  getFranchiseStats: async () => { const { data } = await api.get('/admin/franchise-applications/stats'); return data; },
  getFranchiseApplication: async (id: string) => { const { data } = await api.get(`/admin/franchise-applications/${id}`); return data; },
  updateFranchiseStatus: async (id: string, payload: { status: string; adminNotes?: string }) => { const { data } = await api.patch(`/admin/franchise-applications/${id}/status`, payload); return data; },
  deleteFranchiseApplication: async (id: string) => { const { data } = await api.delete(`/admin/franchise-applications/${id}`); return data; },

  // Contact Messages
  getContactMessages: async (params?: { page?: number; limit?: number }) => { const { data } = await api.get("/admin/contact-messages", { params }); return data; },
  getContactMessage: async (id: string) => { const { data } = await api.get(`/admin/contact-messages/${id}`); return data; },
  deleteContactMessage: async (id: string) => { const { data } = await api.delete(`/admin/contact-messages/${id}`); return data; },

  // Site Settings
  getSettings: async () => { const { data } = await api.get('/admin/site-settings'); return data; },
  updateSetting: async (key: string, value: unknown) => { const { data } = await api.put('/admin/site-settings', { key, value }); return data; },
  updateMultipleSettings: async (settings: { key: string; value: unknown }[]) => { const { data } = await api.put('/admin/site-settings/bulk', { settings }); return data; },
};

export const uploadApi = {
  uploadSingle: async (file: File, folder?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) formData.append('folder', folder);
    const { data } = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  uploadMultiple: async (files: File[]) => {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    const { data } = await api.post('/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};

export default api;
