import axios, { type AxiosInstance, type AxiosError } from 'axios';
import Cookies from 'js-cookie';

// Configurazione base API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Crea istanza axios
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor per aggiungere token JWT
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor per gestire errori
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token scaduto o non valido
      Cookies.remove('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  }) => api.post('/auth/register', data),
  
  getMe: () => api.get('/auth/me'),
  
  updateProfile: (data: Partial<{
    firstName: string;
    lastName: string;
    phone: string;
    dateOfBirth: string;
    height: number;
    weight: number;
    fitnessGoals: string;
  }>) => api.put('/auth/profile', data),
  
  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/auth/change-password', { currentPassword, newPassword }),
};

// Users API
export const usersAPI = {
  getAll: (params?: { role?: string; search?: string; isActive?: boolean }) =>
    api.get('/users', { params }),
  
  getById: (id: string) => api.get(`/users/${id}`),
  
  create: (data: {
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
  }) => api.post('/users', data),
  
  update: (id: string, data: Partial<{
    firstName: string;
    lastName: string;
    phone: string;
    dateOfBirth: string;
    height: number;
    weight: number;
    fitnessGoals: string;
    notes: string;
    isActive: boolean;
  }>) => api.put(`/users/${id}`, data),
  
  delete: (id: string) => api.delete(`/users/${id}`),
  
  getStats: (id: string) => api.get(`/users/${id}/stats`),
  
  getDashboard: () => api.get('/users/dashboard'),
};

// Exercises API
export const exercisesAPI = {
  getAll: (params?: {
    category?: string;
    muscleGroup?: string;
    search?: string;
    difficulty?: string;
  }) => api.get('/exercises', { params }),
  
  getById: (id: string) => api.get(`/exercises/${id}`),
  
  create: (data: {
    name: string;
    description?: string;
    category: string;
    muscleGroup: string[];
    equipment: string;
    difficulty: string;
    instructions?: string;
    videoUrl?: string;
  }) => api.post('/exercises', data),
  
  update: (id: string, data: Partial<{
    name: string;
    description: string;
    category: string;
    muscleGroup: string[];
    equipment: string;
    difficulty: string;
    instructions: string;
    videoUrl: string;
    imageUrl: string;
  }>) => api.put(`/exercises/${id}`, data),
  
  delete: (id: string) => api.delete(`/exercises/${id}`),
  
  getCategories: () => api.get('/exercises/categories'),
};

// Workout Plans API
export const workoutPlansAPI = {
  getAll: (params?: { user?: string; isActive?: boolean }) =>
    api.get('/workout-plans', { params }),
  
  getById: (id: string) => api.get(`/workout-plans/${id}`),
  
  getActive: (userId?: string) =>
    api.get(`/workout-plans/active${userId ? `/${userId}` : ''}`),
  
  create: (data: {
    name: string;
    description?: string;
    user: string;
    days: Array<{
      dayName: string;
      dayNumber: number;
      exercises: Array<{
        exercise: string;
        order: number;
        sets: number;
        reps: string;
        weight?: number;
        restSeconds?: number;
        notes?: string;
        tempo?: string;
      }>;
      notes?: string;
    }>;
    durationWeeks?: number;
    difficulty?: string;
    goal?: string;
    notes?: string;
  }) => api.post('/workout-plans', data),
  
  update: (id: string, data: Partial<{
    name: string;
    description: string;
    days: any[];
    durationWeeks: number;
    difficulty: string;
    goal: string;
    notes: string;
    isActive: boolean;
    endDate: string;
  }>) => api.put(`/workout-plans/${id}`, data),
  
  delete: (id: string) => api.delete(`/workout-plans/${id}`),
  
  duplicate: (id: string, newUserId?: string) =>
    api.post(`/workout-plans/${id}/duplicate`, { newUserId }),
  
  toggleStatus: (id: string) =>
    api.patch(`/workout-plans/${id}/toggle-status`),
};

// Workout Sessions API
export const workoutSessionsAPI = {
  getAll: (params?: {
    user?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }) => api.get('/workout-sessions', { params }),
  
  getById: (id: string) => api.get(`/workout-sessions/${id}`),
  
  create: (data: {
    workoutPlan?: string;
    dayName?: string;
    sessionName: string;
    exercises: Array<{
      exercise: string;
      exerciseName: string;
      sets: Array<{
        setNumber: number;
        weight: number;
        reps: number;
        rpe?: number;
        notes?: string;
        isCompleted?: boolean;
      }>;
      notes?: string;
    }>;
    mood?: string;
    energyLevel?: number;
    sleepHours?: number;
    bodyWeight?: number;
    notes?: string;
    location?: string;
  }) => api.post('/workout-sessions', data),
  
  update: (id: string, data: Partial<{
    exercises: any[];
    mood: string;
    energyLevel: number;
    sleepHours: number;
    bodyWeight: number;
    notes: string;
    endTime: string;
  }>) => api.put(`/workout-sessions/${id}`, data),
  
  endSession: (id: string) => api.patch(`/workout-sessions/${id}/end`),
  
  delete: (id: string) => api.delete(`/workout-sessions/${id}`),
  
  getProgressStats: (userId?: string, params?: {
    exerciseId?: string;
    period?: string;
  }) => api.get(`/workout-sessions/stats${userId ? `/${userId}` : ''}`, { params }),
  
  getExerciseHistory: (exerciseId: string, userId?: string) =>
    api.get(`/workout-sessions/history/${exerciseId}${userId ? `/${userId}` : ''}`),
};

export default api;
