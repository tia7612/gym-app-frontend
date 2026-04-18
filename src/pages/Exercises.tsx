import { useState, useEffect } from 'react';
import { useExerciseStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Dumbbell,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
} from 'lucide-react';

// Form per creare/modificare esercizio
function ExerciseForm({
  exercise,
  categories,
  muscleGroups,
  equipment,
  onSubmit,
  onCancel,
}: {
  exercise?: any;
  categories: any[];
  muscleGroups: any[];
  equipment: any[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: exercise?.name || '',
    description: exercise?.description || '',
    category: exercise?.category || '',
    muscleGroup: exercise?.muscleGroup || [],
    equipment: exercise?.equipment || 'nessuno',
    difficulty: exercise?.difficulty || 'intermedio',
    instructions: exercise?.instructions || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const toggleMuscleGroup = (value: string) => {
    const current = formData.muscleGroup;
    const updated = current.includes(value)
      ? current.filter((v: string) => v !== value)
      : [...current, value];
    setFormData({ ...formData, muscleGroup: updated });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Categoria *</Label>
        <Select
          value={formData.category}
          onValueChange={(value) => setFormData({ ...formData, category: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleziona categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Gruppi Muscolari</Label>
        <div className="flex flex-wrap gap-2">
          {muscleGroups.map((mg) => (
            <Badge
              key={mg.value}
              variant={formData.muscleGroup.includes(mg.value) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => toggleMuscleGroup(mg.value)}
            >
              {mg.label}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="equipment">Attrezzatura</Label>
        <Select
          value={formData.equipment}
          onValueChange={(value) => setFormData({ ...formData, equipment: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleziona attrezzatura" />
          </SelectTrigger>
          <SelectContent>
            {equipment.map((eq) => (
              <SelectItem key={eq.value} value={eq.value}>
                {eq.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="difficulty">Difficoltà</Label>
        <Select
          value={formData.difficulty}
          onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleziona difficoltà" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="principiante">Principiante</SelectItem>
            <SelectItem value="intermedio">Intermedio</SelectItem>
            <SelectItem value="avanzato">Avanzato</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrizione</Label>
        <textarea
          id="description"
          className="w-full min-h-[60px] p-3 rounded-md border bg-background"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="instructions">Istruzioni</Label>
        <textarea
          id="instructions"
          className="w-full min-h-[80px] p-3 rounded-md border bg-background"
          value={formData.instructions}
          onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
          placeholder="Descrivi come eseguire correttamente l'esercizio..."
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Annulla
        </Button>
        <Button type="submit">
          {exercise ? 'Salva Modifiche' : 'Crea Esercizio'}
        </Button>
      </DialogFooter>
    </form>
  );
}

// Main Exercises Page
export function Exercises() {
  const {
    exercises,
    categories,
    muscleGroups,
    equipment,
    isLoading,
    fetchExercises,
    fetchCategories,
    createExercise,
    updateExercise,
    deleteExercise,
  } = useExerciseStore();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingExercise, setEditingExercise] = useState<any>(null);

  useEffect(() => {
    fetchExercises();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchExercises({ category: categoryFilter, search });
  }, [categoryFilter, search]);

  const handleCreate = async (data: any) => {
    try {
      await createExercise(data);
      setShowCreateDialog(false);
      toast({
        title: 'Esercizio creato',
        description: 'L\'esercizio è stato creato con successo',
      });
    } catch (error: any) {
      toast({
        title: 'Errore',
        description: error.message || 'Impossibile creare l\'esercizio',
        variant: 'destructive',
      });
    }
  };

  const handleUpdate = async (data: any) => {
    if (!editingExercise) return;
    try {
      await updateExercise(editingExercise.id, data);
      setEditingExercise(null);
      toast({
        title: 'Esercizio aggiornato',
        description: 'Le modifiche sono state salvate',
      });
    } catch (error: any) {
      toast({
        title: 'Errore',
        description: error.message || 'Impossibile aggiornare l\'esercizio',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteExercise(id);
      toast({
        title: 'Esercizio eliminato',
        description: 'L\'esercizio è stato eliminato',
      });
    } catch (error: any) {
      toast({
        title: 'Errore',
        description: error.message || 'Impossibile eliminare l\'esercizio',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Esercizi</h1>
          <p className="text-muted-foreground mt-1">
            Gestisci la libreria esercizi
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuovo Esercizio
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crea Nuovo Esercizio</DialogTitle>
              <DialogDescription>
                Aggiungi un nuovo esercizio alla libreria
              </DialogDescription>
            </DialogHeader>
            <ExerciseForm
              categories={categories}
              muscleGroups={muscleGroups}
              equipment={equipment}
              onSubmit={handleCreate}
              onCancel={() => setShowCreateDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca esercizi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Tutte le categorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tutte le categorie</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Exercises Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : exercises.length === 0 ? (
        <div className="text-center py-12">
          <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nessun esercizio trovato</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {exercises.map((exercise) => (
            <Card key={exercise.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{exercise.name}</CardTitle>
                    <CardDescription className="capitalize">
                      {categories.find((c) => c.value === exercise.category)?.label || exercise.category}
                    </CardDescription>
                  </div>
                  {exercise.isDefault && (
                    <Badge variant="secondary">Default</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  {exercise.muscleGroup.slice(0, 3).map((mg) => (
                    <Badge key={mg} variant="outline" className="text-xs capitalize">
                      {muscleGroups.find((m) => m.value === mg)?.label || mg}
                    </Badge>
                  ))}
                  {exercise.muscleGroup.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{exercise.muscleGroup.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="capitalize">{exercise.difficulty}</span>
                  <span>•</span>
                  <span>
                    {equipment.find((e) => e.value === exercise.equipment)?.label || exercise.equipment}
                  </span>
                </div>

                {!exercise.isDefault && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setEditingExercise(exercise)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Modifica
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(exercise.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingExercise} onOpenChange={() => setEditingExercise(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifica Esercizio</DialogTitle>
            <DialogDescription>
              Modifica i dati dell'esercizio
            </DialogDescription>
          </DialogHeader>
          {editingExercise && (
            <ExerciseForm
              exercise={editingExercise}
              categories={categories}
              muscleGroups={muscleGroups}
              equipment={equipment}
              onSubmit={handleUpdate}
              onCancel={() => setEditingExercise(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
