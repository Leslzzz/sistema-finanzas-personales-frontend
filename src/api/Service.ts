import api from './axios';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LoginPayload {
    email: string;
    password: string;
}

export interface LoginResponse {
    user_name?: string;
    name?: string;      
    email?: string;
    // Si el backend aún manda los tokens en el JSON, los tipamos como opcionales
    // pero nuestro código frontend simplemente los ignorará por seguridad.
    access?: string;
    refresh?: string;
}

export interface RegisterPayload {
    name: string;
    email: string;
    password: string;
}

export interface UserInfo {
    name: string;
    email: string;
    created_at: string;
}

export interface DashboardSummary {
    balance_total: number;
    total_income: number;
    total_outcome: number;
}

export interface DashboardResponse {
    user_info: UserInfo;
    summary: DashboardSummary;
}

export interface Category {
    id: number;
    name: string;
    budget: string;
}

export interface Transaction {
    id?: number;
    description: string;
    date?: string;
    document_type?: 'FACTURA' | 'TICKET' | 'OTRO' | null;
    url_document?: string | null;
    category: number;
    income_details?: { amount: string };
    outcome_details?: { expense: string };
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authService = {
    /** POST /api/login/ */
    login: async (payload: LoginPayload): Promise<LoginResponse> => {
        const { data } = await api.post<LoginResponse>('/api/login/', payload);
        
        // SEGURIDAD: Ya NO guardamos tokens aquí. 
        // El backend debe enviarlos como Cookies HTTP-Only.
        localStorage.setItem('isAuthenticated', 'true');
        
        if (data.user_name) {
            localStorage.setItem('user_name', data.user_name);
        } else if (data.name) {
            localStorage.setItem('user_name', data.name);
        }

        return data; 
    },

    /** POST /api/register/ */
    register: async (payload: RegisterPayload): Promise<void> => {
        await api.post('/api/register/', payload);
    },

    /** Limpia sesión */
    logout: async (): Promise<void> => {
        try {
            // Le decimos al backend que elimine las cookies HTTP-Only de este usuario
            await api.post('/api/logout/');
        } catch (error) {
            console.error("Error al cerrar sesión en el servidor:", error);
        } finally {
            // Limpiamos la UI sin importar si el backend falló
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('user_name');
            localStorage.removeItem('onboarding_done');
            window.location.href = '/landing';
        }
    },

    isLoggedIn: (): boolean => localStorage.getItem('isAuthenticated') === 'true',
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const DashboardService = {
    /** GET /api/dashboard/home/ */
    getHome: async (): Promise<DashboardResponse> => {
        const { data } = await api.get<DashboardResponse>('/api/dashboard/home/');
        return data;
    },
};

// ─── Transactions ─────────────────────────────────────────────────────────────

export const TransactionService = {
    getAll: async (): Promise<Transaction[]> => {
        const { data } = await api.get<Transaction[]>('/api/transactions/');
        return data;
    },

    create: async (tx: Omit<Transaction, 'id' | 'date'>): Promise<Transaction> => {
        const { data } = await api.post<Transaction>('/api/transactions/', tx);
        return data;
    },

    update: async (id: number, tx: Partial<Transaction>): Promise<Transaction> => {
        const { data } = await api.put<Transaction>(`/api/transactions/${id}/`, tx);
        return data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/api/transactions/${id}/`);
    },
};

// ─── Categories ───────────────────────────────────────────────────────────────

export const CategoryService = {
    getAll: async (): Promise<Category[]> => {
        const { data } = await api.get<Category[]>('/api/categories/');
        return data;
    },

    create: async (name: string, budget: number): Promise<Category> => {
        const { data } = await api.post<Category>('/api/categories/', { name, budget });
        return data;
    },
};