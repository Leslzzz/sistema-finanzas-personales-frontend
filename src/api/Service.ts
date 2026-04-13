import api from './axios';

// ─── Auth ──────────────────────────────────────────────────────────────────────

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    name: string;
    email: string;
    password: string;
}

export interface AuthUser {
    id: number;
    name: string;
    email: string;
}

export interface AuthResponse {
    token: string;
    user: AuthUser;
}

export interface MeResponse {
    id: number;
    name: string;
    email: string;
    onboardingCompleted: boolean;
}

export const authService = {
    /** POST /auth/login */
    login: async (payload: LoginPayload): Promise<AuthResponse> => {
        const { data } = await api.post<AuthResponse>('/auth/login', payload);
        localStorage.setItem('token', data.token);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user_name', data.user.name);
        return data;
    },

    /** POST /auth/register */
    register: async (payload: RegisterPayload): Promise<AuthResponse> => {
        const { data } = await api.post<AuthResponse>('/auth/register', payload);
        localStorage.setItem('token', data.token);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user_name', data.user.name);
        return data;
    },

    /** GET /auth/me — devuelve usuario autenticado y si completó onboarding */
    me: async (): Promise<MeResponse> => {
        const { data } = await api.get<MeResponse>('/auth/me');
        return data;
    },

    /** POST /auth/logout */
    logout: async (): Promise<void> => {
        try {
            await api.post('/auth/logout');
        } catch {
            // Si falla el servidor igual limpiamos el cliente
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('user_name');
            localStorage.removeItem('onboarding_done');
            window.location.href = '/landing';
        }
    },

    isLoggedIn: (): boolean => localStorage.getItem('isAuthenticated') === 'true',
};

// ─── Onboarding ────────────────────────────────────────────────────────────────

export interface OnboardingCategory {
    label: string;
    budgetLimit: number;
}

export interface OnboardingPayload {
    monthlyIncome: number;
    categories: OnboardingCategory[];
}

export const OnboardingService = {
    /** POST /onboarding — se llama una sola vez al terminar el wizard */
    complete: async (payload: OnboardingPayload): Promise<void> => {
        await api.post('/onboarding', payload);
        localStorage.setItem('onboarding_done', 'true');
    },
};

// ─── Transactions ──────────────────────────────────────────────────────────────

export interface Transaction {
    id: string;
    desc: string;
    amount: number;
    type: 'ingreso' | 'gasto';
    category: string;
    date: string;
}

export interface CreateTransactionPayload {
    desc: string;
    amount: number;
    type: 'ingreso' | 'gasto';
    category: string;
    date: string;
}

export interface TransactionSummary {
    ingresos: number;
    gastos: number;
    balance: number;
}

export interface CategoryDistribution {
    label: string;
    value: number;   // porcentaje entero
    color: string;
}

export const TransactionService = {
    /** GET /transactions */
    getAll: async (): Promise<Transaction[]> => {
        const { data } = await api.get<Transaction[]>('/transactions');
        return data;
    },

    /** POST /transactions */
    create: async (payload: CreateTransactionPayload): Promise<Transaction> => {
        const { data } = await api.post<Transaction>('/transactions', payload);
        return data;
    },

    /** GET /transactions/summary — resumen del mes activo */
    getSummary: async (): Promise<TransactionSummary> => {
        const { data } = await api.get<TransactionSummary>('/transactions/summary');
        return data;
    },

    /** GET /transactions/categories — distribución porcentual para el pie chart */
    getCategories: async (): Promise<CategoryDistribution[]> => {
        const { data } = await api.get<CategoryDistribution[]>('/transactions/categories');
        return data;
    },

    /** POST /transactions/import — importa CSV o Excel */
    importFile: async (file: File): Promise<{ imported: number }> => {
        const form = new FormData();
        form.append('file', file);
        const { data } = await api.post<{ imported: number }>('/transactions/import', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
    },

    /** GET /transactions/export?format=csv|pdf&token=... — devuelve URL de descarga directa */
    getExportUrl: (format: 'csv' | 'pdf'): string => {
        const token = localStorage.getItem('token') ?? '';
        const base  = import.meta.env.VITE_API_URL as string;
        return `${base}/transactions/export?format=${format}&token=${encodeURIComponent(token)}`;
    },
};

// ─── Budgets ───────────────────────────────────────────────────────────────────

export interface Budget {
    id: string;
    label: string;
    icon: string;
    color: string;
    limit: number;
    spent: number;
}

export const BudgetService = {
    /** GET /budgets */
    getAll: async (): Promise<Budget[]> => {
        const { data } = await api.get<Budget[]>('/budgets');
        return data;
    },

    /** PUT /budgets/:id */
    update: async (id: string, limit: number): Promise<Budget> => {
        const { data } = await api.put<Budget>(`/budgets/${id}`, { limit });
        return data;
    },
};

// ─── Profile ───────────────────────────────────────────────────────────────────

export interface Profile {
    id: number;
    name: string;
    email: string;
    avatarUrl: string | null;
    timezone: string;
    monthStartDay: number;
    notifications: {
        budgetAlert: boolean;
        dailyReminder: boolean;
    };
}

export const ProfileService = {
    /** GET /profile */
    get: async (): Promise<Profile> => {
        const { data } = await api.get<Profile>('/profile');
        return data;
    },

    /** PUT /profile */
    update: async (payload: { name?: string; email?: string }): Promise<Profile> => {
        const { data } = await api.put<Profile>('/profile', payload);
        return data;
    },

    /** PUT /profile/password */
    changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
        await api.put('/profile/password', { currentPassword, newPassword });
    },

    /** POST /profile/avatar */
    uploadAvatar: async (file: File): Promise<{ avatarUrl: string }> => {
        const form = new FormData();
        form.append('avatar', file);
        const { data } = await api.post<{ avatarUrl: string }>('/profile/avatar', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
    },

    /** PUT /profile/preferences */
    updatePreferences: async (payload: { timezone?: string; monthStartDay?: number }): Promise<Profile> => {
        const { data } = await api.put<Profile>('/profile/preferences', payload);
        return data;
    },

    /** PUT /profile/notifications */
    updateNotifications: async (payload: { budgetAlert?: boolean; dailyReminder?: boolean }): Promise<Profile> => {
        const { data } = await api.put<Profile>('/profile/notifications', payload);
        return data;
    },

    /** DELETE /profile — elimina la cuenta (irreversible) */
    deleteAccount: async (): Promise<void> => {
        await api.delete('/profile');
    },
};

// ─── Categorías predefinidas (constante local) ────────────────────────────────
// Usadas en los modales de transacción para mostrar opciones al usuario.

export const PREDEFINED_CATEGORIES = [
    { label: 'Vivienda',      icon: '🏠', color: '#60a5fa' },
    { label: 'Alimentación',  icon: '🍔', color: '#34d399' },
    { label: 'Transporte',    icon: '🚗', color: '#fbbf24' },
    { label: 'Salud',         icon: '💊', color: '#f87171' },
    { label: 'Ocio',          icon: '🎬', color: '#a78bfa' },
    { label: 'Educación',     icon: '📚', color: '#38bdf8' },
    { label: 'Ropa',          icon: '👗', color: '#fb7185' },
    { label: 'Servicios',     icon: '🏡', color: '#a3e635' },
    { label: 'Ahorro',        icon: '💰', color: '#4ade80' },
    { label: 'Otros',         icon: '📦', color: '#94a3b8' },
] as const;
