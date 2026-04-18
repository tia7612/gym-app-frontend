import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Dumbbell,
  BarChart3,
  Users,
  ClipboardList,
  List,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: string[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
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
  {
    label: 'Esercizi',
    href: '/exercises',
    icon: List,
    roles: ['coach', 'admin'],
  },
];

export function Sidebar() {
  const { user } = useAuthStore();
  const location = useLocation();

  const filteredItems = navItems.filter((item) =>
    item.roles.includes(user?.role || 'user')
  );

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-background min-h-[calc(100vh-4rem)] sticky top-16">
      <nav className="flex-1 space-y-1 p-4">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href ||
            (item.href !== '/' && location.pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer Sidebar */}
      <div className="border-t p-4">
        <div className="rounded-lg bg-muted p-3">
          <p className="text-xs font-medium text-muted-foreground">
            Gym Management App v1.0
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Gestisci la tua palestra
          </p>
        </div>
      </div>
    </aside>
  );
}
