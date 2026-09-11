/**
 * Typed API Client for MI TEA Online Ordering
 * Provides unified fetch wrapper with standardized error handling and SSR/client resilience.
 */

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, string | number | boolean | undefined | null>;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions & { body?: any } = {}
): Promise<T> {
  const { params, body, headers = {}, ...rest } = options;

  let url = endpoint;
  if (params) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query.set(key, String(value));
      }
    });
    const queryString = query.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const reqHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  const init: RequestInit = {
    ...rest,
    headers: reqHeaders,
  };

  if (body !== undefined) {
    init.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  const response = await fetch(url, init);

  let responseData: any;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    responseData = await response.json();
  } else {
    responseData = await response.text();
  }

  if (!response.ok) {
    const message =
      (typeof responseData === 'object' && responseData?.error) ||
      (typeof responseData === 'string' && responseData) ||
      `HTTP Error ${response.status}: ${response.statusText}`;
    throw new ApiError(message, response.status, responseData);
  }

  return responseData as T;
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'POST', body }),

  put: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'PUT', body }),

  patch: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'PATCH', body }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),

  // ── High-Level Typed Endpoints ─────────────────────────────────────────────

  // Menu
  getCategories: () =>
    apiClient.get<{ categories: any[]; total: number }>('/api/menu/categories'),

  getMenuItems: (params?: { category?: string; popular?: boolean; available?: boolean; q?: string }) =>
    apiClient.get<{ items: any[]; total: number }>('/api/menu/items', { params }),

  getMenuItem: (id: string) =>
    apiClient.get<{ item: any }>(`/api/menu/items/${id}`),

  getCustomizations: () =>
    apiClient.get<any>('/api/menu/customizations'),

  // Stores
  getStores: () =>
    apiClient.get<{ stores: any[]; total: number }>('/api/stores'),

  validateAddress: (data: { address: string; city: string; state: string; zip: string; storeId?: string }) =>
    apiClient.post<{ valid: boolean; deliveryAddress?: any; reason?: string }>('/api/stores/validate-address', data),

  // Promos
  validatePromo: (code: string, subtotal: number) =>
    apiClient.post<{ valid: boolean; discountPercent?: number; freeDelivery?: boolean; description?: string; reason?: string }>(
      '/api/promos/validate',
      { code, subtotal }
    ),

  // Orders
  getOrders: (params?: { limit?: number; offset?: number; status?: string }) =>
    apiClient.get<{ orders: any[]; total: number; limit: number; offset: number }>('/api/orders', { params }),

  createOrder: (orderData: any) =>
    apiClient.post<{ orderId: string; orderNumber: string; placedOrder: any; total: number }>('/api/orders', orderData),

  getOrder: (id: string) =>
    apiClient.get<{ order: any }>(`/api/orders/${id}`),

  cancelOrder: (id: string, reason?: string) =>
    apiClient.post<{ success: boolean; order: any }>(`/api/orders/${id}/cancel`, { reason }),

  // Payments
  createPaymentIntent: (orderId: string) =>
    apiClient.post<{ clientSecret: string; paymentIntentId: string; amount: number; demo?: boolean }>('/api/payments/intent', { orderId }),

  createStripeCheckout: (orderId: string) =>
    apiClient.post<{ checkoutUrl: string; sessionId: string; demo?: boolean }>('/api/payments/checkout', { orderId }),

  payWithCash: (orderId: string) =>
    apiClient.post<{ success: boolean; orderId: string; message: string }>('/api/payments/cash', { orderId }),

  // Loyalty
  getLoyaltyCard: () =>
    apiClient.get<{ card: any }>('/api/loyalty/stamps'),

  addLoyaltyStamp: (count: number = 1) =>
    apiClient.post<{ success: boolean; stamps: number }>('/api/loyalty/stamps', { count }),

  redeemLoyaltyReward: () =>
    apiClient.post<{ success: boolean; promoCode: string; voucher: any }>('/api/loyalty/redeem'),

  // Gift Cards
  getGiftCardBalance: (code: string) =>
    apiClient.get<{ code: string; balance: number; amount: number; isRedeemed: boolean }>(`/api/gift-cards/${encodeURIComponent(code)}/balance`),

  redeemGiftCard: (code: string, amount: number) =>
    apiClient.post<{ success: boolean; code: string; redeemedAmount: number; remainingBalance: number }>(
      `/api/gift-cards/${encodeURIComponent(code)}/redeem`,
      { amount }
    ),

  // Notifications
  getNotifications: (params?: { limit?: number; offset?: number }) =>
    apiClient.get<{ notifications: any[]; total: number; unreadCount: number }>('/api/notifications', { params }),

  markNotificationAsRead: (id: string) =>
    apiClient.put<{ success: boolean }>(`/api/notifications/${id}/read`),

  markAllNotificationsAsRead: () =>
    apiClient.put<{ success: boolean; count: number }>('/api/notifications/read-all'),

  // ─── Admin Methods ────────────────────────────────────────────────────────
  adminGetStats: () =>
    apiClient.get<{ success: boolean; stats: any }>('/api/admin/orders?stats=true'),

  adminGetOrders: (params?: { status?: string; storeId?: string; limit?: number; offset?: number }) =>
    apiClient.get<{ success: boolean; orders: any[]; total: number; limit: number; offset: number }>(
      '/api/admin/orders',
      { params }
    ),

  adminUpdateOrderStatus: (orderId: string, status: string, paymentStatus?: string) =>
    apiClient.patch<{ success: boolean; order: any }>('/api/admin/orders', { orderId, status, paymentStatus }),

  adminCreateProduct: (data: any) =>
    apiClient.post<{ success: boolean; item: any }>('/api/admin/menu', data),

  adminUpdateProduct: (data: any) =>
    apiClient.put<{ success: boolean; item: any }>('/api/admin/menu', data),

  adminPatchProduct: (id: string, updates: { available?: boolean; price?: number; popular?: boolean }) =>
    apiClient.patch<{ success: boolean; item: any }>('/api/admin/menu', { id, ...updates }),

  adminDeleteProduct: (id: string, permanent: boolean = false) =>
    apiClient.delete<{ success: boolean; message: string; deleted?: boolean }>(
      `/api/admin/menu?id=${encodeURIComponent(id)}${permanent ? '&permanent=true' : ''}`
    ),

  adminGetUsers: (params?: { role?: string; q?: string }) =>
    apiClient.get<{ success: boolean; users: any[] }>('/api/admin/users', { params }),

  adminUpdateUserRole: (id: string, role: 'CUSTOMER' | 'ADMIN') =>
    apiClient.patch<{ success: boolean; user: any }>('/api/admin/users', { id, role }),

  adminDeleteUser: (id: string) =>
    apiClient.delete<{ success: boolean; message: string }>(`/api/admin/users?id=${encodeURIComponent(id)}`),

  adminGetPromos: () =>
    apiClient.get<{ success: boolean; promos: any[] }>('/api/admin/promos'),

  adminCreatePromo: (data: any) =>
    apiClient.post<{ success: boolean; promo: any }>('/api/admin/promos', data),

  adminTogglePromo: (id: string, is_active: boolean) =>
    apiClient.patch<{ success: boolean; promo: any }>('/api/admin/promos', { id, is_active }),

  adminDeletePromo: (id: string) =>
    apiClient.delete<{ success: boolean; message: string }>(`/api/admin/promos?id=${encodeURIComponent(id)}`),

  adminGetStore: () =>
    apiClient.get<{ success: boolean; store: any }>('/api/admin/store'),

  adminUpdateStore: (data: any) =>
    apiClient.patch<{ success: boolean; store: any }>('/api/admin/store', data),

  adminGetCateringRequests: (params?: { status?: string; limit?: number; offset?: number }) =>
    apiClient.get<{
      success: boolean;
      requests: any[];
      total: number;
      limit: number;
      offset: number;
    }>('/api/admin/catering', { params }),

  adminUpdateCateringStatus: (id: string, status: string, adminNotes?: string) =>
    apiClient.patch<{ success: boolean; request: any }>('/api/admin/catering', {
      id,
      status,
      adminNotes,
    }),
};
