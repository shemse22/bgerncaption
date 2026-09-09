import { AppNotification, ManualPaymentPlatform, MinuteTransaction, PaymentRecord, Project, SystemSettings, User } from '../types';

export interface ServerState {
  currentUser: User;
  users: User[];
  projects: Project[];
  transactions: MinuteTransaction[];
  payments: PaymentRecord[];
  notifications: AppNotification[];
  settings: SystemSettings;
}

const TOKEN_KEY = 'bgern_session_token';
const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) || '';

function token() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

function adminPassword(): string {
  try {
    return sessionStorage.getItem('bgern_admin_password') || localStorage.getItem('bgern_admin_password') || '';
  } catch {
    return '';
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const pass = adminPassword();
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(init.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
      ...(pass ? { 'x-admin-password': pass } : {}),
      ...init.headers,
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || payload.message || `API request failed: ${response.status}`);
  return payload as T;
}

export const Api = {
  async loginWithGoogle(email: string, name: string): Promise<ServerState> {
    const payload = await request<ServerState & { token: string }>('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ email, name }),
    });
    localStorage.setItem(TOKEN_KEY, payload.token);
    return payload;
  },

  async loginWithClerk(user: Partial<User>): Promise<ServerState> {
    const payload = await request<ServerState & { token: string }>('/api/auth/clerk', {
      method: 'POST',
      body: JSON.stringify(user),
    });
    if (payload.token) {
      localStorage.setItem(TOKEN_KEY, payload.token);
    }
    return payload;
  },

  async adminLogin(credentials: { username: string; email: string; password: string }): Promise<ServerState & { token: string }> {
    const payload = await request<{ success: boolean; token: string; user: User; state: ServerState }>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (payload.token) {
      localStorage.setItem(TOKEN_KEY, payload.token);
    }
    return { ...payload.state, token: payload.token };
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
  },

  session: () => request<ServerState>('/api/session'),

  createProject: (project: Project) => request<ServerState>('/api/projects', {
    method: 'POST',
    body: JSON.stringify(project),
  }),

  updateProject: (projectId: string, updates: Partial<Project>) => request<ServerState>(`/api/projects/${projectId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  }),

  deleteProject: (projectId: string) => request<ServerState>(`/api/projects/${projectId}`, {
    method: 'DELETE',
  }),

  verifyPayment: (payment: PaymentRecord) => request<ServerState>('/api/payments/verify', {
    method: 'POST',
    body: JSON.stringify(payment),
  }),

  approvePayment: (paymentId: string) => request<{ success: boolean; message: string; state: ServerState }>(`/api/admin/payments/${paymentId}/approve`, {
    method: 'POST',
    body: JSON.stringify({}),
  }),

  rejectPayment: (paymentId: string, reason?: string) => request<ServerState>(`/api/admin/payments/${paymentId}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  }),

  addUserMinutes: (userId: string, minutes: number) => request<ServerState>(`/api/admin/users/${userId}/minutes`, {
    method: 'POST',
    body: JSON.stringify({ minutes }),
  }),

  saveSettings: (settings: SystemSettings) => request<ServerState>('/api/admin/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  }),

  savePaymentPlatforms: (paymentPlatforms: ManualPaymentPlatform[]) => request<{ success: boolean; paymentPlatforms: ManualPaymentPlatform[]; state: ServerState }>('/api/admin/payment-platforms', {
    method: 'PUT',
    body: JSON.stringify({ paymentPlatforms }),
  }),

  getSettings: () => request<SystemSettings>('/api/settings'),
};
