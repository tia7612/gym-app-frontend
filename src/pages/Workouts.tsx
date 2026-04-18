import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore, useWorkoutPlanStore, useWorkoutSessionStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Dumbbell,
  Play,
  Calendar,
  Clock,
  ChevronRight,
  Plus,
  History,
  FileText,
} from 'lucide-react';
import { formatDuration } from '@/utils/export';

// Componente per iniziare un nuovo allenamento
function StartWorkoutDialog() {
  const { activePlan } = useWorkoutPlanStore();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  if (!activePlan) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">
          Non hai una scheda attiva
        </p>
        <p className="text-sm text-muted-foreground">
          Contatta il tuo coach per ricevere una scheda
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Seleziona un giorno della tua scheda:
      </p>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {activePlan.days.map((day, index) => (
          <Link
            key={index}
            to={`/workouts/session?day=${index}&plan=${activePlan.id}`}
          >
            <div
              className={`p-4 rounded-lg border cursor-pointer transition-colors hover:bg-muted ${
                selectedDay === index ? 'border-primary bg-primary/5' : ''
              }`}
              onClick={() => setSelectedDay(index)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{day.dayName}</p>
                  <p className="text-sm text-muted-foreground">
                    {day.exercises.length} esercizi
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Componente per la scheda attiva
function ActivePlanCard() {
  const { activePlan, isLoading, fetchActivePlan } = useWorkoutPlanStore();

  useEffect(() => {
    fetchActivePlan();
  }, []);

  if (isLoading) {
    return <Skeleton className="h-64" />;
  }

  if (!activePlan) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Scheda Attiva</CardTitle>
          <CardDescription>La tua scheda di allenamento corrente</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Non hai una scheda attiva al momento
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{activePlan.name}</CardTitle>
            <CardDescription>{activePlan.description}</CardDescription>
          </div>
          <Badge variant="default">Attiva</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Badge variant="secondary" className="capitalize">
            {activePlan.difficulty}
          </Badge>
          <Badge variant="secondary" className="capitalize">
            {activePlan.goal}
          </Badge>
          <Badge variant="outline">
            {activePlan.durationWeeks} settimane
          </Badge>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Giorni di allenamento:</p>
          {activePlan.days.map((day, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-muted rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded">
                  <Dumbbell className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{day.dayName}</p>
                  <p className="text-xs text-muted-foreground">
                    {day.exercises.length} esercizi
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          ))}
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full">
              <Play className="mr-2 h-4 w-4" />
              Inizia Allenamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nuovo Allenamento</DialogTitle>
              <DialogDescription>
                Seleziona il giorno della scheda da seguire
              </DialogDescription>
            </DialogHeader>
            <StartWorkoutDialog />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

// Componente per lo storico allenamenti
function WorkoutHistory() {
  const { sessions, isLoading, fetchSessions } = useWorkoutSessionStore();

  useEffect(() => {
    fetchSessions({ limit: 20 });
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Nessun allenamento registrato</p>
        <p className="text-sm text-muted-foreground mt-1">
          Inizia il tuo primo allenamento!
        </p>
      </div>
    );
  }

  // Raggruppa per mese
  const groupedSessions = sessions.reduce((groups, session) => {
    const date = new Date(session.startTime);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    if (!groups[key]) {
      groups[key] = {
        month: date.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' }),
        sessions: [],
      };
    }
    groups[key].sessions.push(session);
    return groups;
  }, {} as Record<string, { month: string; sessions: typeof sessions }>);

  return (
    <div className="space-y-6">
      {Object.values(groupedSessions).map((group) => (
        <div key={group.month}>
          <h3 className="text-sm font-medium text-muted-foreground mb-3 capitalize">
            {group.month}
          </h3>
          <div className="space-y-3">
            {group.sessions.map((session) => (
              <Link key={session.id} to={`/workouts/session/${session.id}`}>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded">
                      <Dumbbell className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{session.sessionName}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(session.startTime).toLocaleDateString('it-IT')}
                        </span>
                        {session.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDuration(session.duration)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {session.totalVolume?.toLocaleString()} kg
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {session.totalSets} serie
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Pagina principale
export function Workouts() {
  const { user } = useAuthStore();
  const isCoach = user?.role === 'coach' || user?.role === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Allenamenti</h1>
          <p className="text-muted-foreground mt-1">
            Gestisci i tuoi allenamenti e la tua scheda
          </p>
        </div>
        {!isCoach && (
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nuovo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Nuovo Allenamento</DialogTitle>
                <DialogDescription>
                  Seleziona il giorno della scheda da seguire
                </DialogDescription>
              </DialogHeader>
              <StartWorkoutDialog />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs defaultValue="schedule" className="space-y-6">
        <TabsList>
          <TabsTrigger value="schedule">Scheda</TabsTrigger>
          <TabsTrigger value="history">Storico</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <ActivePlanCard />
            
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Statistiche Rapide</CardTitle>
                <CardDescription>I tuoi progressi recenti</CardDescription>
              </CardHeader>
              <CardContent>
                <QuickStats />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Storico Allenamenti</CardTitle>
              <CardDescription>Tutte le tue sessioni passate</CardDescription>
            </CardHeader>
            <CardContent>
              <WorkoutHistory />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Componente statistiche rapide
function QuickStats() {
  const { sessions, fetchSessions, progressStats, fetchProgressStats } = useWorkoutSessionStore();

  useEffect(() => {
    fetchSessions({ limit: 7 });
    fetchProgressStats();
  }, []);

  const thisWeekWorkouts = sessions.filter((s) => {
    const sessionDate = new Date(s.startTime);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return sessionDate >= weekAgo;
  }).length;

  const avgDuration = progressStats?.generalStats?.avgDuration || 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-muted rounded-lg text-center">
          <p className="text-2xl font-bold">{thisWeekWorkouts}</p>
          <p className="text-xs text-muted-foreground">Questa settimana</p>
        </div>
        <div className="p-4 bg-muted rounded-lg text-center">
          <p className="text-2xl font-bold">{Math.round(avgDuration)}</p>
          <p className="text-xs text-muted-foreground">Minuti medi</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <p className="text-sm font-medium">Ultimi 7 allenamenti:</p>
        <div className="flex gap-1">
          {[...Array(7)].map((_, i) => {
            const hasWorkout = i < sessions.length;
            return (
              <div
                key={i}
                className={`flex-1 h-8 rounded ${
                  hasWorkout ? 'bg-primary' : 'bg-muted'
                }`}
                title={hasWorkout ? sessions[i]?.sessionName : 'Nessun allenamento'}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
