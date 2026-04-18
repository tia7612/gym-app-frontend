import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { authAPI } from '@/services/api';
import type { User, AuthState } from '@/types';

interface AuthStore extends AuthState {
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true });
          const response = await authAPI.login(email, password);
          const { user, token } = response.data.data;
          
          // Salva token nei cookie
          Cookies.set('token', token, { expires: 7, secure: true, sameSite: 'strict' });
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error.response?.data?.message || 'Errore durante il login');
        }
      },

      register: async (data) => {
        try {
          set({ isLoading: true });
          const response = await authAPI.register(data);
          const { user, token } = response.data.data;
          
          Cookies.set('token', token, { expires: 7, secure: true, sameSite: 'strict' });
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error.response?.data?.message || 'Errore durante la registrazione');
        }
      },

      logout: () => {
        Cookies.remove('token');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      fetchUser: async () => {
        try {
          set({ isLoading: true });
          const token = Cookies.get('token');
          
          if (!token) {
            set({ isLoading: false });
            return;
          }

          const response = await authAPI.getMe();
          const { user } = response.data.data;
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          Cookies.remove('token');
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      updateUser: (data) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...data } });
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
