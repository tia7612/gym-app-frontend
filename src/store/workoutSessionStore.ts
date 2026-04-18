import { create } from 'zustand';
import { workoutSessionsAPI } from '@/services/api';
import type { WorkoutSession, ProgressStats, ExerciseSet } from '@/types';

interface WorkoutSessionState {
  sessions: WorkoutSession[];
  currentSession: WorkoutSession | null;
  progressStats: ProgressStats | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchSessions: (params?: {
    user?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }) => Promise<void>;
  fetchSessionById: (id: string) => Promise<WorkoutSession>;
  createSession: (data: {
    workoutPlan?: string;
    dayName?: string;
    sessionName: string;
    exercises: any[];
    mood?: string;
    energyLevel?: number;
    sleepHours?: number;
    bodyWeight?: number;
    notes?: string;
    location?: string;
  }) => Promise<void>;
  updateSession: (id: string, data: Partial<WorkoutSession>) => Promise<void>;
  endSession: (id: string) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  fetchProgressStats: (userId?: string, params?: {
    exerciseId?: string;
    period?: string;
  }) => Promise<void>;
  fetchExerciseHistory: (exerciseId: string, userId?: string) => Promise<any[]>;
  setCurrentSession: (session: WorkoutSession | null) => void;
  addExerciseToSession: (exercise: any) => void;
  updateExerciseSets: (exerciseIndex: number, sets: ExerciseSet[]) => void;
  clearError: () => void;
}

export const useWorkoutSessionStore = create<WorkoutSessionState>((set) => ({
  sessions: [],
  currentSession: null,
  progressStats: null,
  isLoading: false,
  error: null,

  fetchSessions: async (params) => {
    try {
      set({ isLoading: true, error: null });
      const response = await workoutSessionsAPI.getAll(params);
      set({ sessions: response.data.data.sessions, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Errore nel caricamento sessioni',
        isLoading: false,
      });
    }
  },

  fetchSessionById: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const response = await workoutSessionsAPI.getById(id);
      const session = response.data.data.session;
      set({ currentSession: session, isLoading: false });
      return session;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Errore nel caricamento sessione',
        isLoading: false,
      });
      throw error;
    }
  },

  createSession: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await workoutSessionsAPI.create(data);
      const newSession = response.data.data.session;
      set((state) => ({
        sessions: [newSession, ...state.sessions],
        currentSession: newSession,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Errore nella creazione sessione',
        isLoading: false,
      });
      throw error;
    }
  },

  updateSession: async (id, data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await workoutSessionsAPI.update(id, data);
      const updatedSession = response.data.data.session;
      set((state) => ({
        sessions: state.sessions.map((s) => (s.id === id ? updatedSession : s)),
        currentSession: state.currentSession?.id === id ? updatedSession : state.currentSession,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Errore nell\'aggiornamento sessione',
        isLoading: false,
      });
      throw error;
    }
  },

  endSession: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const response = await workoutSessionsAPI.endSession(id);
      const endedSession = response.data.data.session;
      set((state) => ({
        sessions: state.sessions.map((s) => (s.id === id ? endedSession : s)),
        currentSession: endedSession,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Errore nella terminazione sessione',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteSession: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await workoutSessionsAPI.delete(id);
      set((state) => ({
        sessions: state.sessions.filter((s) => s.id !== id),
        currentSession: state.currentSession?.id === id ? null : state.currentSession,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Errore nell\'eliminazione sessione',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchProgressStats: async (userId, params) => {
    try {
      set({ isLoading: true, error: null });
      const response = await workoutSessionsAPI.getProgressStats(userId, params);
      set({ progressStats: response.data.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Errore nel caricamento statistiche',
        isLoading: false,
      });
    }
  },

  fetchExerciseHistory: async (exerciseId, userId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await workoutSessionsAPI.getExerciseHistory(exerciseId, userId);
      set({ isLoading: false });
      return response.data.data.history;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Errore nel caricamento storico',
        isLoading: false,
      });
      return [];
    }
  },

  setCurrentSession: (session) => {
    set({ currentSession: session });
  },

  addExerciseToSession: (exercise) => {
    set((state) => {
      if (!state.currentSession) return state;
      
      const updatedSession = {
        ...state.currentSession,
        exercises: [...state.currentSession.exercises, exercise],
      };
      
      return { currentSession: updatedSession };
    });
  },

  updateExerciseSets: (exerciseIndex, sets) => {
    set((state) => {
      if (!state.currentSession) return state;
      
      const updatedExercises = [...state.currentSession.exercises];
      updatedExercises[exerciseIndex] = {
        ...updatedExercises[exerciseIndex],
        sets,
      };
      
      return {
        currentSession: {
          ...state.currentSession,
          exercises: updatedExercises,
        },
      };
    });
  },

  clearError: () => set({ error: null }),
}));
