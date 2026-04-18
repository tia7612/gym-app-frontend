import { useState, useEffect } from 'react';
import { useAuthStore, useWorkoutSessionStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Clock,
  Weight,
  FileText,
  Table,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { exportSessionsToCSV, exportStatsToPDF } from '@/utils/export';

// Registra componenti Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Opzioni comuni per i grafici
const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
    },
  },
};

// Componente Volume Chart
function VolumeChart({ data }: { data: any[] }) {
  const chartData = {
    labels: data.map((d) => `${d.date.day}/${d.date.month}`),
    datasets: [
      {
        label: 'Volume (kg)',
        data: data.map((d) => d.volume),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return <Line data={chartData} options={commonOptions} />;
}

// Componente Workouts Chart
function WorkoutsChart({ data }: { data: any[] }) {
  const chartData = {
    labels: data.map((d) => `Sett. ${d._id.week}`),
    datasets: [
      {
        label: 'Allenamenti',
        data: data.map((d) => d.count),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderRadius: 4,
      },
      {
        label: 'Volume (kg)',
        data: data.map((d) => d.volume),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderRadius: 4,
      },
    ],
  };

  return <Bar data={chartData} options={commonOptions} />;
}

// Componente Top Exercises Chart
function TopExercisesChart({ data }: { data: any[] }) {
  const chartData = {
    labels: data.slice(0, 5).map((d) => d.exerciseName),
    datasets: [
      {
        data: data.slice(0, 5).map((d) => d.count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  return (
    <Doughnut
      data={chartData}
      options={{
        ...commonOptions,
        cutout: '60%',
      }}
    />
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

// Main Stats Page
export function Stats() {
  const { user } = useAuthStore();
  const { sessions, progressStats, fetchSessions, fetchProgressStats, isLoading } = useWorkoutSessionStore();
  const { toast } = useToast();
  const [period, setPeriod] = useState('3months');

  useEffect(() => {
    fetchSessions({ limit: 100 });
    fetchProgressStats(user?.id, { period });
  }, [period]);

  const handleExportPDF = async () => {
    try {
      if (progressStats && user) {
        await exportStatsToPDF(progressStats, user, period);
        toast({
          title: 'Esportazione completata',
          description: 'Il PDF è stato scaricato con successo',
        });
      }
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Impossibile esportare il PDF',
        variant: 'destructive',
      });
    }
  };

  const handleExportCSV = () => {
    try {
      exportSessionsToCSV(sessions);
      toast({
        title: 'Esportazione completata',
        description: 'Il CSV è stato scaricato con successo',
      });
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Impossibile esportare il CSV',
        variant: 'destructive',
      });
    }
  };

  const generalStats = progressStats?.generalStats || {
    totalWorkouts: 0,
    totalVolume: 0,
    totalSets: 0,
    avgDuration: 0,
    avgEnergyLevel: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Statistiche</h1>
          <p className="text-muted-foreground mt-1">
            Analizza i tuoi progressi
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Periodo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Ultimo mese</SelectItem>
              <SelectItem value="3months">Ultimi 3 mesi</SelectItem>
              <SelectItem value="6months">Ultimi 6 mesi</SelectItem>
              <SelectItem value="1year">Ultimo anno</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportPDF}>
            <FileText className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" onClick={handleExportCSV}>
            <Table className="h-4 w-4 mr-2" />
            CSV
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Allenamenti"
          value={generalStats.totalWorkouts}
          description="Sessioni totali"
          icon={BarChart3}
        />
        <StatCard
          title="Volume"
          value={`${(generalStats.totalVolume / 1000).toFixed(1)}k`}
          description="Kg sollevati"
          icon={Weight}
        />
        <StatCard
          title="Serie"
          value={generalStats.totalSets}
          description="Serie completate"
          icon={TrendingUp}
        />
        <StatCard
          title="Durata Media"
          value={`${Math.round(generalStats.avgDuration)} min`}
          description="Per allenamento"
          icon={Clock}
        />
        <StatCard
          title="Energia Media"
          value={`${(generalStats.avgEnergyLevel || 0).toFixed(1)}/10`}
          description="Livello percepito"
          icon={Calendar}
        />
      </div>

      {/* Charts */}
      <Tabs defaultValue="volume" className="space-y-6">
        <TabsList>
          <TabsTrigger value="volume">Volume</TabsTrigger>
          <TabsTrigger value="frequency">Frequenza</TabsTrigger>
          <TabsTrigger value="exercises">Esercizi</TabsTrigger>
        </TabsList>

        <TabsContent value="volume" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Andamento Volume</CardTitle>
              <CardDescription>
                Volume totale allenamento nel tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-80" />
              ) : progressStats && progressStats.volumeOverTime && progressStats.volumeOverTime.length > 0 ? (
                <div className="h-80">
                  <VolumeChart data={progressStats.volumeOverTime} />
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  Nessun dato disponibile
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="frequency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Frequenza Allenamenti</CardTitle>
              <CardDescription>
                Numero di allenamenti per settimana
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-80" />
              ) : progressStats && progressStats.workoutsByWeek && progressStats.workoutsByWeek.length > 0 ? (
                <div className="h-80">
                  <WorkoutsChart data={progressStats.workoutsByWeek} />
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  Nessun dato disponibile
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exercises" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Esercizi Più Frequenti</CardTitle>
                <CardDescription>
                  Gli esercizi che esegui più spesso
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-64" />
                ) : progressStats && progressStats.topExercises && progressStats.topExercises.length > 0 ? (
                  <div className="h-64">
                    <TopExercisesChart data={progressStats.topExercises} />
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    Nessun dato disponibile
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dettaglio Esercizi</CardTitle>
                <CardDescription>
                  Lista degli esercizi più eseguiti
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-64" />
                ) : progressStats && progressStats.topExercises && progressStats.topExercises.length > 0 ? (
                  <div className="space-y-3">
                    {progressStats.topExercises.slice(0, 5).map((ex, index) => (
                      <div
                        key={ex._id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </span>
                          <span className="font-medium">{ex.exerciseName}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{ex.count} volte</p>
                          <p className="text-xs text-muted-foreground">
                            {ex.totalVolume.toLocaleString()} kg
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    Nessun dato disponibile
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
