import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '@/store';
import { MainLayout } from '@/components/layout';
import { Toaster } from '@/components/ui/sonner';
import {
  Login,
  Register,
  Dashboard,
  Workouts,
  WorkoutSessionPage,
  Stats,
  Users,
  WorkoutPlans,
  Exercises,
} from '@/pages';
import './App.css';

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role || '')) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  const { fetchUser } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/workouts" element={<Workouts />} />
          <Route path="/workouts/session" element={<WorkoutSessionPage />} />
          <Route path="/workouts/session/:id" element={<WorkoutSessionPage />} />
          <Route path="/stats" element={<Stats />} />
          
          {/* Coach/Admin Only Routes */}
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={['coach', 'admin']}>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/plans"
            element={
              <ProtectedRoute allowedRoles={['coach', 'admin']}>
                <WorkoutPlans />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exercises"
            element={
              <ProtectedRoute allowedRoles={['coach', 'admin']}>
                <Exercises />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}

export default App;
