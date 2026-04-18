import { create } from 'zustand';
import { workoutPlansAPI } from '@/services/api';
import type { WorkoutPlan } from '@/types';

interface WorkoutPlanState {
  plans: WorkoutPlan[];
  activePlan: WorkoutPlan | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchPlans: (params?: { user?: string; isActive?: boolean }) => Promise<void>;
  fetchActivePlan: (userId?: string) => Promise<void>;
  getPlanById: (id: string) => WorkoutPlan | undefined;
  createPlan: (data: {
    name: string;
    description?: string;
    user: string;
    days: any[];
    durationWeeks?: number;
    difficulty?: string;
    goal?: string;
    notes?: string;
  }) => Promise<void>;
  updatePlan: (id: string, data: Partial<WorkoutPlan>) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;
  duplicatePlan: (id: string, newUserId?: string) => Promise<void>;
  togglePlanStatus: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useWorkoutPlanStore = create<WorkoutPlanState>((set, get) => ({
  plans: [],
  activePlan: null,
  isLoading: false,
  error: null,

  fetchPlans: async (params) => {
    try {
      set({ isLoading: true, error: null });
      const response = await workoutPlansAPI.getAll(params);
      set({ plans: response.data.data.plans, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Errore nel caricamento schede',
        isLoading: false,
      });
    }
  },

  fetchActivePlan: async (userId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await workoutPlansAPI.getActive(userId);
      set({ activePlan: response.data.data.plan, isLoading: false });
    } catch (error: any) {
      if (error.response?.status === 404) {
        set({ activePlan: null, isLoading: false });
      } else {
        set({
          error: error.response?.data?.message || 'Errore nel caricamento scheda attiva',
          isLoading: false,
        });
      }
    }
  },

  getPlanById: (id: string) => {
    return get().plans.find((p) => p.id === id);
  },

  createPlan: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await workoutPlansAPI.create(data);
      const newPlan = response.data.data.plan;
      set((state) => ({
        plans: [newPlan, ...state.plans],
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Errore nella creazione scheda',
        isLoading: false,
      });
      throw error;
    }
  },

  updatePlan: async (id, data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await workoutPlansAPI.update(id, data);
      const updatedPlan = response.data.data.plan;
      set((state) => ({
        plans: state.plans.map((p) => (p.id === id ? updatedPlan : p)),
        activePlan: state.activePlan?.id === id ? updatedPlan : state.activePlan,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Errore nell\'aggiornamento scheda',
        isLoading: false,
      });
      throw error;
    }
  },

  deletePlan: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await workoutPlansAPI.delete(id);
      set((state) => ({
        plans: state.plans.filter((p) => p.id !== id),
        activePlan: state.activePlan?.id === id ? null : state.activePlan,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Errore nell\'eliminazione scheda',
        isLoading: false,
      });
      throw error;
    }
  },

  duplicatePlan: async (id, newUserId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await workoutPlansAPI.duplicate(id, newUserId);
      const duplicatedPlan = response.data.data.plan;
      set((state) => ({
        plans: [duplicatedPlan, ...state.plans],
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Errore nella duplicazione scheda',
        isLoading: false,
      });
      throw error;
    }
  },

  togglePlanStatus: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const response = await workoutPlansAPI.toggleStatus(id);
      const updatedPlan = response.data.data.plan;
      set((state) => ({
        plans: state.plans.map((p) => (p.id === id ? updatedPlan : p)),
        activePlan: updatedPlan.isActive ? updatedPlan : state.activePlan,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Errore nel cambio stato scheda',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
