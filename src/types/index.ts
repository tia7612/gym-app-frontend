// Tipi utente
export type UserRole = 'user' | 'coach' | 'admin';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  phone?: string;
  dateOfBirth?: string;
  height?: number;
  weight?: number;
  fitnessGoals?: string;
  notes?: string;
  isActive: boolean;
  profileImage?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Tipi esercizio
export type ExerciseCategory = 'petto' | 'schiena' | 'spalle' | 'braccia' | 'gambe' | 'core' | 'cardio' | 'altro';
export type MuscleGroup = 'petto' | 'dorsali' | 'trapezi' | 'deltoidi' | 'bicipiti' | 'tricipiti' | 'avambracci' | 'addominali' | 'lombari' | 'quadricipiti' | 'femorali' | 'glutei' | 'polpacci' | 'collo' | 'cardio';
export type Equipment = 'nessuno' | 'manubri' | 'bilanciere' | 'cavi' | 'macchinario' | 'kettlebell' | 'elastici' | 'propria_peso' | 'altro';
export type Difficulty = 'principiante' | 'intermedio' | 'avanzato';

export interface Exercise {
  id: string;
  name: string;
  description?: string;
  category: ExerciseCategory;
  muscleGroup: MuscleGroup[];
  equipment: Equipment;
  difficulty: Difficulty;
  instructions?: string;
  videoUrl?: string;
  imageUrl?: string;
  isDefault: boolean;
  createdBy?: string;
}

// Tipi scheda allenamento
export type WorkoutGoal = 'forza' | 'ipertrofia' | 'definizione' | 'resistenza' | 'generale' | 'recupero' | 'altro';

export interface WorkoutExercise {
  exercise: Exercise | string;
  order: number;
  sets: number;
  reps: string;
  weight: number;
  restSeconds: number;
  notes?: string;
  tempo?: string;
}

export interface WorkoutDay {
  dayName: string;
  dayNumber: number;
  exercises: WorkoutExercise[];
  notes?: string;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description?: string;
  user: User | string;
  createdBy: User | string;
  days: WorkoutDay[];
  durationWeeks: number;
  difficulty: Difficulty;
  goal: WorkoutGoal;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Tipi sessione allenamento
export type Mood = 'ottimo' | 'buono' | 'normale' | 'stanco' | 'scarso';

export interface ExerciseSet {
  setNumber: number;
  weight: number;
  reps: number;
  rpe?: number;
  notes?: string;
  isCompleted: boolean;
}

export interface ExerciseLog {
  exercise: Exercise | string;
  exerciseName: string;
  sets: ExerciseSet[];
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  user: User | string;
  workoutPlan?: WorkoutPlan | string;
  dayName?: string;
  sessionName: string;
  exercises: ExerciseLog[];
  startTime: string;
  endTime?: string;
  duration?: number;
  totalVolume: number;
  totalSets: number;
  mood?: Mood;
  energyLevel?: number;
  sleepHours?: number;
  bodyWeight?: number;
  notes?: string;
  location?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Tipi statistiche
export interface ProgressStats {
  generalStats: {
    totalWorkouts: number;
    totalVolume: number;
    totalSets: number;
    avgDuration: number;
    avgEnergyLevel: number;
  };
  workoutsByWeek: Array<{
    _id: { year: number; week: number };
    count: number;
    volume: number;
  }>;
  volumeOverTime: Array<{
    date: { year: number; month: number; day: number };
    volume: number;
  }>;
  exerciseProgress: Array<{
    date: string;
    sets: ExerciseSet[];
    exerciseName: string;
  }>;
  topExercises: Array<{
    _id: string;
    exerciseName: string;
    count: number;
    totalVolume: number;
  }>;
}

export interface UserStats {
  totalWorkouts: number;
  lastWorkout: string | null;
  workoutsThisMonth: number;
  totalVolume: number;
  activePlans: number;
}

export interface CoachDashboard {
  stats: {
    totalUsers: number;
    activeUsers: number;
    workoutsThisWeek: number;
    totalPlans: number;
    activePlans: number;
  };
  recentUsers: User[];
  recentWorkouts: WorkoutSession[];
}

// Tipi API Response
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{ msg: string; param: string }>;
}

// Tipi filtri
export interface ExerciseFilters {
  category?: ExerciseCategory;
  muscleGroup?: string;
  search?: string;
  difficulty?: Difficulty;
}

export interface WorkoutSessionFilters {
  startDate?: string;
  endDate?: string;
  limit?: number;
}
