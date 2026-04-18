import { create } from 'zustand';
import { usersAPI } from '@/services/api';
import type { User, UserStats, CoachDashboard } from '@/types';

interface UserState {
  users: User[];
  selectedUser: User | null;
  userStats: UserStats | null;
  dashboard: CoachDashboard | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchUsers: (params?: { role?: string; search?: string; isActive?: boolean }) => Promise<void>;
  fetchUserById: (id: string) => Promise<void>;
  createUser: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    phone?: string;
    dateOfBirth?: string;
    height?: number;
    weight?: number;
    fitnessGoals?: string;
    notes?: string;
  }) => Promise<void>;
  updateUser: (id: string, data: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  fetchUserStats: (id: string) => Promise<void>;
  fetchDashboard: () => Promise<void>;
  setSelectedUser: (user: User | null) => void;
  clearError: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  selectedUser: null,
  userStats: null,
  dashboard: null,
  isLoading: false,
  error: null,

  fetchUsers: async (params) => {
    try {
      set({ isLoading: true, error: null });
      const response = await usersAPI.getAll(params);
      set({ users: response.data.data.users, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Errore nel caricamento utenti',
        isLoading: false,
      });
    }
  },

  fetchUserById: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const response = await usersAPI.getById(id);
      set({ selectedUser: response.data.data.user, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Errore nel caricamento utente',
        isLoading: false,
      });
    }
  },

  createUser: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await usersAPI.create(data);
      const newUser = response.data.data.user;
      set((state) => ({
        users: [newUser, ...state.users],
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Errore nella creazione utente',
        isLoading: false,
      });
      throw error;
    }
  },

  updateUser: async (id, data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await usersAPI.update(id, data);
      const updatedUser = response.data.data.user;
      set((state) => ({
        users: state.users.map((u) => (u.id === id ? updatedUser : u)),
        selectedUser: state.selectedUser?.id === id ? updatedUser : state.selectedUser,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Errore nell\'aggiornamento utente',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await usersAPI.delete(id);
      set((state) => ({
        users: state.users.filter((u) => u.id !== id),
        selectedUser: state.selectedUser?.id === id ? null : state.selectedUser,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Errore nell\'eliminazione utente',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchUserStats: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const response = await usersAPI.getStats(id);
      set({ userStats: response.data.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Errore nel caricamento statistiche',
        isLoading: false,
      });
    }
  },

  fetchDashboard: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await usersAPI.getDashboard();
      set({ dashboard: response.data.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Errore nel caricamento dashboard',
        isLoading: false,
      });
    }
  },

  setSelectedUser: (user) => {
    set({ selectedUser: user });
  },

  clearError: () => set({ error: null }),
}));
