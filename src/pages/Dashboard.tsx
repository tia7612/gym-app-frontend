import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore, useWorkoutPlanStore, useWorkoutSessionStore, useUserStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { Skeleton } from '@/components/ui/skeleton';
import {
  Dumbbell,
  Calendar,
  TrendingUp,
  Target,
  Users,
  FileText,
  Activity,
  ArrowRight,
  Plus,
} from 'lucide-react';

// Dashboard per utenti normali
function UserDashboard() {
  const { user } = useAuthStore();
  const { activePlan, fetchActivePlan, isLoading: planLoading } = useWorkoutPlanStore();
  const { sessions, fetchSessions, progressStats, fetchProgressStats } = useWorkoutSessionStore();

  useEffect(() => {
    fetchActivePlan();
    fetchSessions({ limit: 5 });
    fetchProgressStats();
  }, []);

  const lastWorkout = sessions[0];
  const totalWorkouts = progressStats?.generalStats?.totalWorkouts || 0;
  const totalVolume = progressStats?.generalStats?.totalVolume || 0;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold">
          Ciao, {user?.firstName}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Ecco il riepilogo dei tuoi allenamenti
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Allenamenti Totali
            </CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWorkouts}</div>
            <p className="text-xs text-muted-foreground">
              Sessioni completate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Volume Totale
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(totalVolume / 1000).toFixed(1)}k kg
            </div>
            <p className="text-xs text-muted-foreground">
              Peso sollevato
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Ultimo Allenamento
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lastWorkout
                ? new Date(lastWorkout.startTime).toLocaleDateString('it-IT')
                : '-'}
            </div>
            <p className="text-xs text-muted-foreground">
              {lastWorkout?.sessionName || 'Nessun allenamento'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Scheda Attiva
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">
              {activePlan?.name || 'Nessuna'}
            </div>
            <p className="text-xs text-muted-foreground">
              {activePlan ? `${activePlan.days.length} giorni` : 'Contatta il tuo coach'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Scheda Attiva */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              La tua Scheda
            </CardTitle>
            <CardDescription>
              {activePlan?.description || 'Visualizza e segui la tua scheda di allenamento'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {planLoading ? (
              <Skeleton className="h-32" />
            ) : activePlan ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{activePlan.name}</span>
                  <span className="text-sm text-muted-foreground capitalize">
                    {activePlan.difficulty}
                  </span>
                </div>
                <div className="space-y-2">
                  {activePlan.days.slice(0, 3).map((day, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-muted rounded-lg"
                    >
                      <span className="text-sm">{day.dayName}</span>
                      <span className="text-xs text-muted-foreground">
                        {day.exercises.length} esercizi
                      </span>
                    </div>
                  ))}
                  {activePlan.days.length > 3 && (
                    <p className="text-xs text-center text-muted-foreground">
                      +{activePlan.days.length - 3} giorni
                    </p>
                  )}
                </div>
                <Link to="/workouts">
                  <Button className="w-full">
                    Inizia Allenamento
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Non hai ancora una scheda assegnata
                </p>
                <p className="text-sm text-muted-foreground">
                  Contatta il tuo coach per ricevere una scheda personalizzata
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ultimi Allenamenti */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Ultimi Allenamenti
            </CardTitle>
            <CardDescription>
              Le tue ultime sessioni di allenamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sessions.length > 0 ? (
              <div className="space-y-3">
                {sessions.slice(0, 5).map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-sm">{session.sessionName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(session.startTime).toLocaleDateString('it-IT')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {session.totalVolume?.toLocaleString()} kg
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {session.totalSets} serie
                      </p>
                    </div>
                  </div>
                ))}
                <Link to="/stats">
                  <Button variant="outline" className="w-full">
                    Vedi Tutte
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Nessun allenamento registrato
                </p>
                <Link to="/workouts">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuovo Allenamento
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Dashboard per coach
function CoachDashboard() {
  const { dashboard, fetchDashboard, isLoading } = useUserStore();

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (isLoading || !dashboard) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const { stats, recentUsers, recentWorkouts } = dashboard;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard Coach</h1>
        <p className="text-muted-foreground mt-1">
          Panoramica della tua palestra
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Utenti Totali</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Utenti Attivi</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Allenamenti Settimana</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.workoutsThisWeek}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Schede Totali</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPlans}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Schede Attive</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePlans}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Ultimi Utenti */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Ultimi Utenti</CardTitle>
              <CardDescription>Utenti registrati di recente</CardDescription>
            </div>
            <Link to="/users">
              <Button variant="outline" size="sm">
                Vedi Tutti
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(user.createdAt || '').toLocaleDateString('it-IT')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ultimi Allenamenti */}
        <Card>
          <CardHeader>
            <CardTitle>Ultimi Allenamenti</CardTitle>
            <CardDescription>Sessioni recenti degli utenti</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentWorkouts.map((workout) => (
                <div
                  key={workout.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {typeof workout.user === 'object'
                        ? `${workout.user.firstName} ${workout.user.lastName}`
                        : 'Utente'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {workout.sessionName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {workout.totalVolume?.toLocaleString()} kg
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(workout.startTime).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Azioni Rapide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link to="/users">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nuovo Utente
              </Button>
            </Link>
            <Link to="/plans">
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Nuova Scheda
              </Button>
            </Link>
            <Link to="/exercises">
              <Button variant="outline">
                <Dumbbell className="mr-2 h-4 w-4" />
                Gestisci Esercizi
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Main Dashboard Component
export function Dashboard() {
  const { user } = useAuthStore();

  if (user?.role === 'coach' || user?.role === 'admin') {
    return <CoachDashboard />;
  }

  return <UserDashboard />;
}
