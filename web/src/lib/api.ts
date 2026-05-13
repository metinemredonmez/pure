const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

// ============ FETCH HELPER ============
export async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null

  const refreshToken = localStorage.getItem('pureolentia_refresh_token')
  if (!refreshToken) return null

  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    const json = await res.json().catch(() => null)

    if (!res.ok || json?.success === false) {
      localStorage.removeItem('pureolentia_token')
      localStorage.removeItem('pureolentia_refresh_token')
      return null
    }

    const data = json?.data || json
    const accessToken = data?.accessToken || data?.token
    const nextRefreshToken = data?.refreshToken

    if (!accessToken) return null

    localStorage.setItem('pureolentia_token', accessToken)
    if (nextRefreshToken) localStorage.setItem('pureolentia_refresh_token', nextRefreshToken)
    return accessToken
  } catch {
    return null
  }
}


function getLegacyStoredToken(): string | null {
  if (typeof window === 'undefined') return null

  const keys = ['pureolentia_token', 'accessToken', 'access_token', 'token', 'authToken']
  for (const key of keys) {
    const value = localStorage.getItem(key)
    if (value) {
      if (key !== 'pureolentia_token') localStorage.setItem('pureolentia_token', value)
      return value
    }
  }

  return null
}

/** JWT exp claim check — true if missing or expired */
function isJwtExpired(token: string | null): boolean {
  if (!token) return true
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (typeof payload.exp !== 'number') return false
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

function clearAllAuthStorage(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('pureolentia_token')
  localStorage.removeItem('pureolentia_refresh_token')
  localStorage.removeItem('pureolentia_user')
  localStorage.removeItem('accessToken')
  localStorage.removeItem('access_token')
  localStorage.removeItem('token')
  localStorage.removeItem('authToken')
}

export async function getStoredAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null

  const token = getLegacyStoredToken()

  // Geçerli (henüz expire olmamış) token varsa direkt dön
  if (token && !isJwtExpired(token)) return token

  // Expire olmuş veya hiç yoksa refresh dene
  const refreshed = await refreshAccessToken()
  if (refreshed && !isJwtExpired(refreshed)) return refreshed

  // Hem access hem refresh expired → tüm auth state temizle (UI guest moduna geçsin)
  clearAllAuthStorage()
  return null
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit & { revalidate?: number; skipAuthRefresh?: boolean }): Promise<T | null> {
  try {
    const { revalidate = 60, skipAuthRefresh = false, ...fetchOptions } = options || {}
    const buildFetchOptions = (headers?: HeadersInit): any => {
      const opts: any = {
        ...fetchOptions,
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions?.headers,
          ...headers,
        },
      }

      // Only add next.revalidate for GET requests (server-side caching)
      // POST/PUT/DELETE requests from client components don't support this
      if (!fetchOptions.method || fetchOptions.method === 'GET') {
        opts.next = { revalidate }
      }

      return opts
    }

    let res = await fetch(`${API_URL}${endpoint}`, buildFetchOptions())

    if (res.status === 401 && !skipAuthRefresh && endpoint !== '/auth/refresh') {
      const newToken = await refreshAccessToken()
      if (newToken) {
        res = await fetch(`${API_URL}${endpoint}`, buildFetchOptions({ Authorization: `Bearer ${newToken}` }))
      }
    }

    const json = await res.json().catch(() => null)
    if (!res.ok) {
      // Return the error response so forms can show the message
      return { success: false, ...(json || {}), statusCode: json?.statusCode || res.status } as T
    }
    return json
  } catch (error) {
    return null
  }
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` }
}

// ============ WEBSITE PUBLIC ============
export const getApiBanners = () => fetchAPI<any>('/public/banners')
export const getApiMachines = () => fetchAPI<any>('/public/machines')
export const getApiMachineBySlug = (slug: string) => fetchAPI<any>(`/public/machines/${slug}`)
export const getApiMachinesCompare = (slugs: string) => fetchAPI<any>(`/public/machines/compare?slugs=${slugs}`)
// getApiBrands kaldırıldı — Brand modeli silindi (orphan).
export const getApiReferences = () => fetchAPI<any>('/public/references')
export const getApiPage = (slug: string) => fetchAPI<any>(`/public/pages/${slug}`)
export const getApiSiteSettings = () => fetchAPI<any>('/public/site-settings')
export const submitFranchiseApplication = (data: any) =>
  fetchAPI<any>('/public/franchise-application', { method: 'POST', body: JSON.stringify(data), revalidate: 0 })
export const submitContactMessage = (data: { name: string; email: string; message: string; phone?: string; subject?: string }) =>
  fetchAPI<any>('/public/contact-message', { method: 'POST', body: JSON.stringify(data), revalidate: 0 })

// ============ BLOG (PUBLIC) ============
export const getApiBlogPosts = (params?: { page?: number; limit?: number; categorySlug?: string; search?: string }) => {
  const q = new URLSearchParams()
  if (params?.page) q.set('page', String(params.page))
  if (params?.limit) q.set('limit', String(params.limit))
  if (params?.categorySlug) q.set('categorySlug', params.categorySlug)
  if (params?.search) q.set('search', params.search)
  return fetchAPI<any>(`/public/blog-posts${q.toString() ? '?' + q : ''}`)
}
export const getApiBlogPostBySlug = (slug: string) => fetchAPI<any>(`/public/blog-posts/${slug}`)
export const getApiBlogCategories = () => fetchAPI<any>('/public/blog-categories')
export const getApiBlogComments = (slug: string) =>
  fetchAPI<any>(`/public/blog-posts/${slug}/comments`, { revalidate: 0 })
export const submitBlogComment = (
  slug: string,
  data: { authorName: string; authorEmail?: string; body: string },
) =>
  fetchAPI<any>(`/public/blog-posts/${slug}/comments`, {
    method: 'POST',
    body: JSON.stringify(data),
    revalidate: 0,
  })

// ============ CATALOG ============
export const getApiProducts = (params?: Record<string, any>) => {
  const q = new URLSearchParams()
  if (params) Object.entries(params).forEach(([k, v]) => v && q.set(k, String(v)))
  return fetchAPI<any>(`/products${q.toString() ? '?' + q : ''}`)
}
export const getApiProductBySlug = (slug: string) => fetchAPI<any>(`/products/${slug}`)
export const getApiCategories = () => fetchAPI<any>('/categories')
export const getApiCollections = () => fetchAPI<any>('/collections')

// ============ PRODUCT REVIEWS ============
export const getApiProductReviews = (productId: string) => fetchAPI<any>(`/products/${productId}/reviews`)
export const getApiProductReviewStats = (productId: string) => fetchAPI<any>(`/products/${productId}/reviews/stats`)
export const apiSubmitReview = (token: string, productId: string, data: any) =>
  fetchAPI<any>(`/products/${productId}/reviews`, { method: 'POST', body: JSON.stringify(data), headers: authHeaders(token), revalidate: 0 })
export const apiMarkReviewHelpful = (token: string, reviewId: string) =>
  fetchAPI<any>(`/reviews/${reviewId}/helpful`, { method: 'POST', headers: authHeaders(token), revalidate: 0 })
export const apiReportReview = (token: string, reviewId: string) =>
  fetchAPI<any>(`/reviews/${reviewId}/report`, { method: 'POST', headers: authHeaders(token), revalidate: 0 })

// ============ AUTH ============
export const apiLogin = (email: string, password: string) =>
  fetchAPI<any>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }), revalidate: 0 })
export const apiRegister = (data: any) =>
  fetchAPI<any>('/auth/register', { method: 'POST', body: JSON.stringify(data), revalidate: 0 })
export const apiGetMe = (token: string) =>
  fetchAPI<any>('/auth/me', { headers: authHeaders(token), revalidate: 0 })
export const apiForgotPassword = (email: string) =>
  fetchAPI<any>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }), revalidate: 0 })
export const apiResetPassword = (token: string, newPassword: string) =>
  fetchAPI<any>('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, newPassword }), revalidate: 0 })
export const apiChangePassword = (token: string, data: any) =>
  fetchAPI<any>('/auth/change-password', { method: 'POST', body: JSON.stringify(data), headers: authHeaders(token), revalidate: 0 })
export const apiRefreshToken = (refreshToken: string) =>
  fetchAPI<any>('/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken }), revalidate: 0 })
export const apiLogout = (token: string) =>
  fetchAPI<any>('/auth/logout', { method: 'POST', headers: authHeaders(token), revalidate: 0 })
export const apiVerifyEmail = (token: string) =>
  fetchAPI<any>(`/auth/verify-email?token=${token}`, { revalidate: 0 })
export const apiGoogleAuth = () => `${API_URL}/auth/google`
export const apiAppleAuth = () => `${API_URL}/auth/apple`

// ============ USER PROFILE ============
export const apiGetProfile = (token: string) =>
  fetchAPI<any>('/users/me/profile', { headers: authHeaders(token), revalidate: 0 })
export const apiUpdateProfile = (token: string, data: any) =>
  fetchAPI<any>('/users/me/profile', { method: 'PATCH', body: JSON.stringify(data), headers: authHeaders(token), revalidate: 0 })
export const apiUploadAvatar = (token: string, formData: FormData) =>
  fetch(`${API_URL}/users/me/avatar`, { method: 'POST', body: formData, headers: { Authorization: `Bearer ${token}` } })

// ============ ADDRESSES ============
export const apiGetAddresses = (token: string) =>
  fetchAPI<any>('/users/me/addresses', { headers: authHeaders(token), revalidate: 0 })
export const apiGetAddress = (token: string, id: string) =>
  fetchAPI<any>(`/users/me/addresses/${id}`, { headers: authHeaders(token), revalidate: 0 })
export const apiCreateAddress = (token: string, data: any) =>
  fetchAPI<any>('/users/me/addresses', { method: 'POST', body: JSON.stringify(data), headers: authHeaders(token), revalidate: 0 })
export const apiUpdateAddress = (token: string, id: string, data: any) =>
  fetchAPI<any>(`/users/me/addresses/${id}`, { method: 'PUT', body: JSON.stringify(data), headers: authHeaders(token), revalidate: 0 })
export const apiDeleteAddress = (token: string, id: string) =>
  fetchAPI<any>(`/users/me/addresses/${id}`, { method: 'DELETE', headers: authHeaders(token), revalidate: 0 })
export const apiSetDefaultAddress = (token: string, id: string) =>
  fetchAPI<any>(`/users/me/addresses/${id}/default`, { method: 'PATCH', headers: authHeaders(token), revalidate: 0 })

// ============ WISHLIST ============
export const apiGetWishlist = (token: string) =>
  fetchAPI<any>('/users/me/wishlist', { headers: authHeaders(token), revalidate: 0 })
export const apiAddToWishlist = (token: string, productId: string) =>
  fetchAPI<any>(`/users/me/wishlist/${productId}`, { method: 'POST', headers: authHeaders(token), revalidate: 0 })
export const apiRemoveFromWishlist = (token: string, productId: string) =>
  fetchAPI<any>(`/users/me/wishlist/${productId}`, { method: 'DELETE', headers: authHeaders(token), revalidate: 0 })
export const apiCheckWishlist = (token: string, productId: string) =>
  fetchAPI<any>(`/users/me/wishlist/${productId}/check`, { headers: authHeaders(token), revalidate: 0 })

// ============ CART ============
export const apiGetCart = (token: string) =>
  fetchAPI<any>('/cart', { headers: authHeaders(token), revalidate: 0 })
export const apiAddToCart = (token: string, data: any) =>
  fetchAPI<any>('/cart/items', { method: 'POST', body: JSON.stringify(data), headers: authHeaders(token), revalidate: 0 })
export const apiUpdateCartItem = (token: string, itemId: string, data: any) =>
  fetchAPI<any>(`/cart/items/${itemId}`, { method: 'PATCH', body: JSON.stringify(data), headers: authHeaders(token), revalidate: 0 })
export const apiRemoveCartItem = (token: string, itemId: string) =>
  fetchAPI<any>(`/cart/items/${itemId}`, { method: 'DELETE', headers: authHeaders(token), revalidate: 0 })
export const apiMergeCart = (token: string, guestCartId: string) =>
  fetchAPI<any>('/cart/merge', { method: 'POST', body: JSON.stringify({ guestCartId }), headers: authHeaders(token), revalidate: 0 })

// ============ COUPONS ============
export const apiValidateCoupon = (code: string, subtotal: number) =>
  fetchAPI<any>('/coupons/validate', { method: 'POST', body: JSON.stringify({ code, subtotal }), revalidate: 0 })

// ============ ORDERS ============
export const apiCreateOrder = (token: string, data: any) =>
  fetchAPI<any>('/orders', { method: 'POST', body: JSON.stringify(data), headers: authHeaders(token), revalidate: 0 })
export const apiGetOrders = (token: string) =>
  fetchAPI<any>('/orders', { headers: authHeaders(token), revalidate: 0 })
export const apiGetOrder = (token: string, id: string) =>
  fetchAPI<any>(`/orders/${id}`, { headers: authHeaders(token), revalidate: 0 })
export const apiReturnOrder = (token: string, orderId: string, data: any) =>
  fetchAPI<any>(`/orders/${orderId}/return`, { method: 'POST', body: JSON.stringify(data), headers: authHeaders(token), revalidate: 0 })

// ============ PAYMENT ============
export const apiCreateCheckoutSession = (token: string, data: any) =>
  fetchAPI<any>('/checkout/session', { method: 'POST', body: JSON.stringify(data), headers: authHeaders(token), revalidate: 0 })
export const apiGooglePayCheckout = (token: string, data: any) =>
  fetchAPI<any>('/checkout/google-pay', { method: 'POST', body: JSON.stringify(data), headers: authHeaders(token), revalidate: 0 })
export const apiApplePayCheckout = (token: string, data: any) =>
  fetchAPI<any>('/checkout/apple-pay', { method: 'POST', body: JSON.stringify(data), headers: authHeaders(token), revalidate: 0 })

// ============ SHIPPING ============
export const apiGetShippingZones = () => fetchAPI<any>('/shipping/zones')
export const apiCalculateShipping = (data: any) =>
  fetchAPI<any>('/shipping/calculate', { method: 'POST', body: JSON.stringify(data), revalidate: 0 })
export const apiTrackOrder = (token: string, orderId: string) =>
  fetchAPI<any>(`/shipping/${orderId}/tracking`, { headers: authHeaders(token), revalidate: 0 })
export const apiTrackOrderLive = (token: string, orderId: string) =>
  fetchAPI<any>(`/shipping/${orderId}/tracking/live`, { headers: authHeaders(token), revalidate: 0 })
export const apiGetShippingLabel = (token: string, orderId: string) =>
  fetchAPI<any>(`/shipping/${orderId}/label`, { headers: authHeaders(token), revalidate: 0 })

// ============ SUBSCRIPTION ============
export const apiGetSubscriptionPlans = () => fetchAPI<any>('/subscription/plans')
export const apiGetSubscriptions = (token: string) =>
  fetchAPI<any>('/subscriptions', { headers: authHeaders(token), revalidate: 0 })
export const apiGetSubscription = (token: string, id: string) =>
  fetchAPI<any>(`/subscriptions/${id}`, { headers: authHeaders(token), revalidate: 0 })
export const apiCreateSubscription = (token: string, data: any) =>
  fetchAPI<any>('/subscriptions', { method: 'POST', body: JSON.stringify(data), headers: authHeaders(token), revalidate: 0 })
export const apiCancelSubscription = (token: string, id: string) =>
  fetchAPI<any>(`/subscriptions/${id}/cancel`, { method: 'POST', headers: authHeaders(token), revalidate: 0 })
export const apiPauseSubscription = (token: string, id: string) =>
  fetchAPI<any>(`/subscriptions/${id}/pause`, { method: 'POST', headers: authHeaders(token), revalidate: 0 })
export const apiResumeSubscription = (token: string, id: string) =>
  fetchAPI<any>(`/subscriptions/${id}/resume`, { method: 'POST', headers: authHeaders(token), revalidate: 0 })
export const apiChangeSubscriptionPlan = (token: string, id: string, data: any) =>
  fetchAPI<any>(`/subscriptions/${id}/change-plan`, { method: 'POST', body: JSON.stringify(data), headers: authHeaders(token), revalidate: 0 })
export const apiChangeSubscriptionGrind = (token: string, id: string, data: any) =>
  fetchAPI<any>(`/subscriptions/${id}/grind`, { method: 'POST', body: JSON.stringify(data), headers: authHeaders(token), revalidate: 0 })
export const apiUpdateSubscriptionPayment = (token: string, id: string, data: any) =>
  fetchAPI<any>(`/subscriptions/${id}/payment-method`, { method: 'POST', body: JSON.stringify(data), headers: authHeaders(token), revalidate: 0 })

// ============ FAQ / CMS ============
export const getApiFAQ = () => fetchAPI<any>('/faq')

// ============ CHATBOT ============
export const apiChatbotMessage = (message: string, sessionId?: string) =>
  fetchAPI<any>('/chatbot/message', { method: 'POST', body: JSON.stringify({ message, sessionId }), revalidate: 0 })
export const apiChatbotHistory = (sessionId: string) =>
  fetchAPI<any>(`/chatbot/history?sessionId=${sessionId}`, { revalidate: 0 })

// ============ LOYALTY ============
export const apiGetLoyaltyStats = (token: string) =>
  fetchAPI<any>('/loyalty/stats', { headers: authHeaders(token), revalidate: 0 })
export const apiGetLoyaltyRewards = (token: string) =>
  fetchAPI<any>('/loyalty/rewards', { headers: authHeaders(token), revalidate: 0 })
export const apiClaimReward = (token: string, rewardId: string) =>
  fetchAPI<any>(`/loyalty/rewards/${rewardId}/claim`, { method: 'POST', headers: authHeaders(token), revalidate: 0 })
export const apiGetLeaderboard = () => fetchAPI<any>('/loyalty/leaderboard')
export const apiGetLoyaltyHistory = (token: string) =>
  fetchAPI<any>('/loyalty/history', { headers: authHeaders(token), revalidate: 0 })
export const apiRedeemPoints = (token: string, data: any) =>
  fetchAPI<any>('/loyalty/redeem', { method: 'POST', body: JSON.stringify(data), headers: authHeaders(token), revalidate: 0 })

// ============ NOTIFICATIONS ============
export const apiGetNotifications = (token: string) =>
  fetchAPI<any>('/notifications', { headers: authHeaders(token), revalidate: 0 })
export const apiMarkNotificationRead = (token: string, id: string) =>
  fetchAPI<any>(`/notifications/${id}/read`, { method: 'PATCH', headers: authHeaders(token), revalidate: 0 })
export const apiMarkAllNotificationsRead = (token: string) =>
  fetchAPI<any>('/notifications/read-all', { method: 'PATCH', headers: authHeaders(token), revalidate: 0 })

// ============ B2B ============
export const apiSubmitB2BLead = (data: any) =>
  fetchAPI<any>('/b2b/leads', { method: 'POST', body: JSON.stringify(data), revalidate: 0 })

// ============ PRICING (PARTNER) ============
export const apiGetProductPrice = (productId: string) =>
  fetchAPI<any>(`/pricing/products/${productId}/price`)
export const apiGetPartnerPrice = (token: string, productId: string) =>
  fetchAPI<any>(`/pricing/partner/products/${productId}/price`, { headers: authHeaders(token), revalidate: 0 })

// ============ PRIVACY / CONSENT ============
export const apiGetConsents = () => fetchAPI<any>('/privacy/consents')
export const apiAcceptPrivacy = (token: string) =>
  fetchAPI<any>('/privacy/accept', { method: 'POST', headers: authHeaders(token), revalidate: 0 })
export const apiSetCookies = (data: any) =>
  fetchAPI<any>('/privacy/cookies', { method: 'POST', body: JSON.stringify(data), revalidate: 0 })
export const apiSubmitConsents = (data: any) =>
  fetchAPI<any>('/privacy/consents', { method: 'POST', body: JSON.stringify(data), revalidate: 0 })
