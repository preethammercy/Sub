import { AdminOverview, Order, OrderCredentials, Product, User, UserRole } from '../types';

const TOKEN_STORAGE_KEY = 'ottsub_auth_token';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY) || localStorage.getItem('subsplit_auth_token');
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem('subsplit_auth_token');
    }
  } catch {
    // Ignore storage quota errors
  }
}

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(path, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data as T;
}

export const api = {
  health: () =>
    apiRequest<{ ok: boolean; brand?: string; dbMode: 'vercel-redis'; upiId: string }>('/api/health'),

  getConfig: () =>
    apiRequest<{
      brand: string;
      upiId: string;
      dbMode: 'vercel-redis';
      firebase: {
        apiKey: string;
        authDomain: string;
        databaseURL?: string;
        projectId: string;
        storageBucket: string;
        messagingSenderId: string;
        appId: string;
        measurementId?: string;
        firestoreDatabaseId?: string;
      };
    }>('/api/config'),

  firebaseLogin: (payload: { idToken: string }) =>
    apiRequest<{ user: User; token: string }>('/api/auth/firebase', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  adminLogin: (payload: { email: string; password: string }) =>
    apiRequest<{ user: User; token: string }>('/api/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  logout: () =>
    apiRequest<{ ok: boolean }>('/api/auth/logout', {
      method: 'POST',
    }),

  me: () => apiRequest<{ user: User }>('/api/auth/me'),

  getProducts: (category?: string, q?: string) => {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.set('category', category);
    if (q) params.set('q', q);
    const qs = params.toString();
    return apiRequest<{ products: Product[] }>(`/api/products${qs ? `?${qs}` : ''}`);
  },

  createOrder: (productId: string, planId?: string) =>
    apiRequest<{ order: Order }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify({ productId, ...(planId ? { planId } : {}) }),
    }),

  getMyOrders: () => apiRequest<{ orders: Order[] }>('/api/orders/mine'),

  submitOrderPayment: (orderId: string, payload: { utrNumber: string; payerUpiId?: string }) =>
    apiRequest<{ order: Order }>(`/api/orders/${orderId}/submit-payment`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getAdminOverview: () => apiRequest<AdminOverview>('/api/admin/overview'),

  updateUserRole: (userId: string, role: UserRole) =>
    apiRequest<{ user: User }>(`/api/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    }),

  approveOrder: (orderId: string, payload: { credentials: OrderCredentials; adminNote?: string }) =>
    apiRequest<{ order: Order }>(`/api/admin/orders/${orderId}/approve`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  rejectOrder: (orderId: string, payload: { adminNote: string }) =>
    apiRequest<{ order: Order }>(`/api/admin/orders/${orderId}/reject`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  createProduct: (payload: Partial<Product>) =>
    apiRequest<{ product: Product }>('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateProduct: (id: string, payload: Partial<Product>) =>
    apiRequest<{ product: Product }>(`/api/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteProduct: (id: string) =>
    apiRequest<{ ok: boolean }>(`/api/admin/products/${id}`, {
      method: 'DELETE',
    }),
};
