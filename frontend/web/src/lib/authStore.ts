import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from './api';

export type UserRole = 'admin' | 'moderator';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post<{ token: string; user: AuthUser }>('/auth/login', {
            email,
            password,
          });
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
          if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('auth_user', JSON.stringify(data.user));
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
        }
      },

      restoreSession: async () => {
        const token = get().token;
        if (!token) {
          set({ isLoading: false });
          return;
        }

        try {
          const { data } = await api.get<{ user: AuthUser }>('/auth/me');
          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          get().logout();
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
