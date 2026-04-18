import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Loader2 } from 'lucide-react';

export function MainLayout() {
  const { isAuthenticated, isLoading, fetchUser } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && location.pathname !== '/login' && location.pathname !== '/register') {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate, location]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Desktop */}
      <Header />

      <div className="flex">
        {/* Sidebar Desktop */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 pb-20 md:pb-0">
          <div className="container mx-auto px-4 py-6 max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Bottom Navigation Mobile */}
      <BottomNav />
    </div>
  );
}
