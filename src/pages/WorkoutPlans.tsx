import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWorkoutPlanStore, useUserStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ClipboardList,
  Plus,
  Search,
  Calendar,
  Target,
  Edit,
  Copy,
  Trash2,
  Power,
} from 'lucide-react';
import type { WorkoutPlan } from '@/types';

export function WorkoutPlans() {
  const { plans, isLoading, fetchPlans, deletePlan, togglePlanStatus, duplicatePlan } = useWorkoutPlanStore();
  const { users, fetchUsers } = useUserStore();
  const [search, setSearch] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    fetchPlans();
    fetchUsers();
  }, []);

  const activePlans = plans.filter((p) => p.isActive);
  const inactivePlans = plans.filter((p) => !p.isActive);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Schede Allenamento</h1>
          <p className="text-muted-foreground mt-1">
            Gestisci le schede degli utenti
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuova Scheda
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crea Nuova Scheda</DialogTitle>
              <DialogDescription>
                Crea una nuova scheda di allenamento per un utente
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                Seleziona un utente per creare una scheda personalizzata:
              </p>
              <div className="mt-4 grid gap-2 max-h-64 overflow-y-auto">
                {users.map((user) => (
                  <Link
                    key={user.id}
                    to={`/plans/create?user=${user.id}`}
                    onClick={() => setShowCreateDialog(false)}
                  >
                    <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors">
                      <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cerca schede..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Attive ({activePlans.length})</TabsTrigger>
          <TabsTrigger value="inactive">Inattive ({inactivePlans.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : activePlans.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nessuna scheda attiva</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {activePlans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onToggle={() => togglePlanStatus(plan.id)}
                  onDuplicate={() => duplicatePlan(plan.id)}
                  onDelete={() => deletePlan(plan.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="inactive" className="space-y-4">
          {inactivePlans.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nessuna scheda inattiva</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {inactivePlans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onToggle={() => togglePlanStatus(plan.id)}
                  onDuplicate={() => duplicatePlan(plan.id)}
                  onDelete={() => deletePlan(plan.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Plan Card Component
function PlanCard({
  plan,
  onToggle,
  onDuplicate,
  onDelete,
}: {
  plan: WorkoutPlan;
  onToggle: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const user = typeof plan.user === 'object' ? plan.user : null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{plan.name}</CardTitle>
            <CardDescription>
              {user ? `${user.firstName} ${user.lastName}` : 'Utente'}
            </CardDescription>
          </div>
          <Badge variant={plan.isActive ? 'default' : 'secondary'}>
            {plan.isActive ? 'Attiva' : 'Inattiva'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline" className="capitalize">
            {plan.difficulty}
          </Badge>
          <Badge variant="outline" className="capitalize">
            {plan.goal}
          </Badge>
          <Badge variant="outline">
            {plan.days.length} giorni
          </Badge>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {plan.durationWeeks} settimane
          </span>
          {plan.startDate && (
            <span className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              {new Date(plan.startDate).toLocaleDateString('it-IT')}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <Link to={`/plans/${plan.id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              <Edit className="mr-2 h-4 w-4" />
              Modifica
            </Button>
          </Link>
          <Button variant="ghost" size="icon" onClick={onToggle}>
            <Power className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDuplicate}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
