import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { useWorkoutPlanStore, useWorkoutSessionStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Check,
  Plus,
  Minus,
  Clock,
  Save,
  ChevronLeft,
} from 'lucide-react';
import type { ExerciseSet, ExerciseLog } from '@/types';

// Timer component
function Timer({ startTime }: { startTime: Date }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 text-lg font-mono">
      <Clock className="h-5 w-5 text-primary" />
      {formatTime(elapsed)}
    </div>
  );
}

// Exercise Card Component
function ExerciseCard({
  exerciseLog,
  exerciseIndex,
  onUpdateSets,
}: {
  exerciseLog: ExerciseLog;
  exerciseIndex: number;
  onUpdateSets: (exerciseIndex: number, sets: ExerciseSet[]) => void;
}) {
  const [sets, setSets] = useState<ExerciseSet[]>(exerciseLog.sets);

  useEffect(() => {
    onUpdateSets(exerciseIndex, sets);
  }, [sets]);

  const addSet = () => {
    const lastSet = sets[sets.length - 1];
    setSets([
      ...sets,
      {
        setNumber: sets.length + 1,
        weight: lastSet?.weight || 0,
        reps: lastSet?.reps || 0,
        isCompleted: false,
      },
    ]);
  };

  const removeSet = (index: number) => {
    const newSets = sets.filter((_, i) => i !== index);
    // Rinumera le serie
    newSets.forEach((set, i) => {
      set.setNumber = i + 1;
    });
    setSets(newSets);
  };

  const updateSet = (index: number, field: keyof ExerciseSet, value: number | boolean) => {
    const newSets = [...sets];
    newSets[index] = { ...newSets[index], [field]: value };
    setSets(newSets);
  };

  const toggleComplete = (index: number) => {
    updateSet(index, 'isCompleted', !sets[index].isCompleted);
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{exerciseLog.exerciseName}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {sets.filter((s) => s.isCompleted).length}/{sets.length} serie completate
            </p>
          </div>
          <Badge variant="outline">{exerciseLog.sets.length} serie pianificate</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* Header */}
          <div className="grid grid-cols-12 gap-2 text-xs text-muted-foreground px-2">
            <div className="col-span-2">Serie</div>
            <div className="col-span-3">Peso (kg)</div>
            <div className="col-span-3">Reps</div>
            <div className="col-span-2">RPE</div>
            <div className="col-span-2"></div>
          </div>

          {/* Sets */}
          {sets.map((set, index) => (
            <div
              key={index}
              className={`grid grid-cols-12 gap-2 items-center p-2 rounded-lg ${
                set.isCompleted ? 'bg-primary/10' : 'bg-muted'
              }`}
            >
              <div className="col-span-2 font-medium">{set.setNumber}</div>
              <div className="col-span-3">
                <Input
                  type="number"
                  value={set.weight || ''}
                  onChange={(e) => updateSet(index, 'weight', parseFloat(e.target.value) || 0)}
                  className="h-8"
                  placeholder="0"
                />
              </div>
              <div className="col-span-3">
                <Input
                  type="number"
                  value={set.reps || ''}
                  onChange={(e) => updateSet(index, 'reps', parseInt(e.target.value) || 0)}
                  className="h-8"
                  placeholder="0"
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={set.rpe || ''}
                  onChange={(e) => updateSet(index, 'rpe', parseInt(e.target.value) || 0)}
                  className="h-8"
                  placeholder="-"
                />
              </div>
              <div className="col-span-2 flex gap-1">
                <Button
                  variant={set.isCompleted ? 'default' : 'outline'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => toggleComplete(index)}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => removeSet(index)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Button variant="outline" className="w-full mt-3" onClick={addSet}>
          <Plus className="mr-2 h-4 w-4" />
          Aggiungi Serie
        </Button>
      </CardContent>
    </Card>
  );
}

// Main Workout Session Page
export function WorkoutSessionPage() {
  const [searchParams] = useSearchParams();
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { activePlan, fetchActivePlan } = useWorkoutPlanStore();
  const {
    createSession,
    isLoading,
  } = useWorkoutSessionStore();

  const [sessionName, setSessionName] = useState('Allenamento');
  const [exercises, setExercises] = useState<ExerciseLog[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [mood, setMood] = useState<string>('');
  const [energyLevel, setEnergyLevel] = useState<string>('');
  const [notes, setNotes] = useState('');

  const dayIndex = parseInt(searchParams.get('day') || '0');
  const planId = searchParams.get('plan');

  // Carica scheda o sessione esistente
  useEffect(() => {
    if (id) {
      // Carica sessione esistente
      // fetchSessionById(id);
    } else {
      // Nuova sessione dalla scheda
      fetchActivePlan();
    }
  }, [id]);

  // Inizializza esercizi dalla scheda
  useEffect(() => {
    if (activePlan && activePlan.days[dayIndex] && !id) {
      const day = activePlan.days[dayIndex];
      setSessionName(day.dayName);
      
      const initialExercises: ExerciseLog[] = day.exercises.map((ex) => ({
        exercise: typeof ex.exercise === 'string' ? ex.exercise : ex.exercise.id,
        exerciseName: typeof ex.exercise === 'string' ? 'Esercizio' : ex.exercise.name,
        sets: Array(ex.sets)
          .fill(null)
          .map((_, i) => ({
            setNumber: i + 1,
            weight: ex.weight || 0,
            reps: parseInt(ex.reps) || 0,
            isCompleted: false,
          })),
        notes: ex.notes,
      }));
      
      setExercises(initialExercises);
      setStartTime(new Date());
    }
  }, [activePlan, dayIndex]);

  const handleUpdateSets = (exerciseIndex: number, sets: ExerciseSet[]) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex] = { ...newExercises[exerciseIndex], sets };
    setExercises(newExercises);
  };

  const handleSave = async () => {
    try {
      const sessionData = {
        workoutPlan: planId || undefined,
        dayName: sessionName,
        sessionName,
        exercises: exercises.map((ex) => ({
          exercise: ex.exercise,
          exerciseName: ex.exerciseName,
          sets: ex.sets.map((s) => ({
            setNumber: s.setNumber,
            weight: s.weight,
            reps: s.reps,
            rpe: s.rpe,
            isCompleted: s.isCompleted,
          })),
        })),
      };

      await createSession(sessionData);
      toast({
        title: 'Allenamento salvato',
        description: 'I tuoi progressi sono stati salvati con successo',
      });
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Impossibile salvare l\'allenamento',
        variant: 'destructive',
      });
    }
  };

  const handleEndSession = async () => {
    try {
      // Salva e termina
      await handleSave();
      
      toast({
        title: 'Allenamento completato',
        description: 'Ottimo lavoro!',
      });
      navigate('/workouts');
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Impossibile terminare l\'allenamento',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16" />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    );
  }

  const completedSets = exercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.isCompleted).length,
    0
  );
  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets.length, 0);

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between sticky top-0 bg-background z-10 py-4 border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{sessionName}</h1>
            {startTime && <Timer startTime={startTime} />}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {completedSets}/{totalSets} serie
          </Badge>
          <Button variant="outline" size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-1" />
            Salva
          </Button>
        </div>
      </div>

      {/* Exercises */}
      <ScrollArea className="h-[calc(100vh-200px)]">
        {exercises.map((exercise, index) => (
          <ExerciseCard
            key={index}
            exerciseLog={exercise}
            exerciseIndex={index}
            onUpdateSets={handleUpdateSets}
          />
        ))}
      </ScrollArea>

      {/* End Session Button */}
      <div className="fixed bottom-20 left-4 right-4 md:static md:mt-6">
        <Button className="w-full" size="lg" onClick={() => setShowEndDialog(true)}>
          <Check className="mr-2 h-5 w-5" />
          Termina Allenamento
        </Button>
      </div>

      {/* End Session Dialog */}
      <Dialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Termina Allenamento</DialogTitle>
            <DialogDescription>
              Aggiungi alcune note prima di concludere
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Come ti sei sentito?</Label>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ottimo">Ottimo</SelectItem>
                  <SelectItem value="buono">Buono</SelectItem>
                  <SelectItem value="normale">Normale</SelectItem>
                  <SelectItem value="stanco">Stanco</SelectItem>
                  <SelectItem value="scarso">Scarso</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Livello di energia (1-10)</Label>
              <Select value={energyLevel} onValueChange={setEnergyLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona..." />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <SelectItem key={n} value={n.toString()}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Note</Label>
              <textarea
                className="w-full min-h-[80px] p-3 rounded-md border bg-background"
                placeholder="Aggiungi note sull'allenamento..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEndDialog(false)}>
              Annulla
            </Button>
            <Button onClick={handleEndSession}>
              <Check className="mr-2 h-4 w-4" />
              Conferma
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
