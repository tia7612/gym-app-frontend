import { create } from 'zustand';
import { exercisesAPI } from '@/services/api';
import type { Exercise } from '@/types';

interface ExerciseState {
  exercises: Exercise[];
  categories: Array<{ value: string; label: string }>;
  muscleGroups: Array<{ value: string; label: string }>;
  equipment: Array<{ value: string; label: string }>;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchExercises: (filters?: {
    category?: string;
    muscleGroup?: string;
    search?: string;
    difficulty?: string;
  }) => Promise<void>;
  fetchCategories: () => Promise<void>;
  getExerciseById: (id: string) => Exercise | undefined;
  createExercise: (data: {
    name: string;
    description?: string;
    category: string;
    muscleGroup: string[];
    equipment: string;
    difficulty: string;
    instructions?: string;
    videoUrl?: string;
  }) => Promise<void>;
  updateExercise: (id: string, data: Partial<Exercise>) => Promise<void>;
  deleteExercise: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useExerciseStore = create<ExerciseState>((set, get) => ({
  exercises: [],
  categories: [],
  muscleGroups: [],
  equipment: [],
  isLoading: false,
  error: null,

  fetchExercises: async (filters) => {
    try {
      set({ isLoading: true, error: null });
      const response = await exercisesAPI.getAll(filters);
      set({ exercises: response.data.data.exercises, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Errore nel caricamento esercizi',
        isLoading: false,
      });
    }
  },

  fetchCategories: async () => {
    try {
      const response = await exercisesAPI.getCategories();
      const { categories, muscleGroups, equipment } = response.data.data;
      set({ categories, muscleGroups, equipment });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Errore nel caricamento categorie' });
    }
  },

  getExerciseById: (id: string) => {
    return get().exercises.find((e) => e.id === id);
  },

  createExercise: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await exercisesAPI.create(data);
      const newExercise = response.data.data.exercise;
      set((state) => ({
        exercises: [...state.exercises, newExercise],
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Errore nella creazione esercizio',
        isLoading: false,
      });
      throw error;
    }
  },

  updateExercise: async (id, data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await exercisesAPI.update(id, data);
      const updatedExercise = response.data.data.exercise;
      set((state) => ({
        exercises: state.exercises.map((e) =>
          e.id === id ? updatedExercise : e
        ),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Errore nell\'aggiornamento esercizio',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteExercise: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await exercisesAPI.delete(id);
      set((state) => ({
        exercises: state.exercises.filter((e) => e.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Errore nell\'eliminazione esercizio',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
