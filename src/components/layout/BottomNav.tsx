import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Dumbbell,
  BarChart3,
  Users,
  ClipboardList,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: string[];
}

const navItems: NavItem[] = [
  {
    label: 'Home',
    href: '/',
    icon: LayoutDashboard,
    roles: ['user', 'coach', 'admin'],
  },
  {
    label: 'Allenamenti',
    href: '/workouts',
    icon: Dumbbell,
    roles: ['user', 'coach', 'admin'],
  },
  {
    label: 'Statistiche',
    href: '/stats',
    icon: BarChart3,
    roles: ['user', 'coach', 'admin'],
  },
  {
    label: 'Utenti',
    href: '/users',
    icon: Users,
    roles: ['coach', 'admin'],
  },
  {
    label: 'Schede',
    href: '/plans',
    icon: ClipboardList,
    roles: ['coach', 'admin'],
  },
];

export function BottomNav() {
  const { user } = useAuthStore();
  const location = useLocation();

  const filteredItems = navItems.filter((item) =>
    item.roles.includes(user?.role || 'user')
  );

  // Mostra solo 5 elementi massimo
  const visibleItems = filteredItems.slice(0, 5);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
      <div className="flex justify-around items-center h-16">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href ||
            (item.href !== '/' && location.pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 flex-1 h-full',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'fill-current')} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
