import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUserStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  UsersIcon,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  FileText,
  TrendingUp,
} from 'lucide-react';
import type { User } from '@/types';

// Form per creare/modificare utente
function UserForm({
  user,
  onSubmit,
  onCancel,
}: {
  user?: User | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    password: '',
    height: user?.height || '',
    weight: user?.weight || '',
    fitnessGoals: user?.fitnessGoals || '',
    notes: user?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Nome *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Cognome *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>

      {!user && (
        <div className="space-y-2">
          <Label htmlFor="password">Password {user ? '(lascia vuoto per non modificare)' : ''}</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder={user ? '••••••••' : 'Minimo 6 caratteri'}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="phone">Telefono</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="height">Altezza (cm)</Label>
          <Input
            id="height"
            type="number"
            value={formData.height}
            onChange={(e) => setFormData({ ...formData, height: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="weight">Peso (kg)</Label>
          <Input
            id="weight"
            type="number"
            value={formData.weight}
            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fitnessGoals">Obiettivi</Label>
        <Input
          id="fitnessGoals"
          value={formData.fitnessGoals}
          onChange={(e) => setFormData({ ...formData, fitnessGoals: e.target.value })}
          placeholder="es. Aumento massa muscolare, dimagrimento..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Note</Label>
        <textarea
          id="notes"
          className="w-full min-h-[80px] p-3 rounded-md border bg-background"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Note aggiuntive sull'utente..."
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Annulla
        </Button>
        <Button type="submit">
          {user ? 'Salva Modifiche' : 'Crea Utente'}
        </Button>
      </DialogFooter>
    </form>
  );
}

// Main Users Page
export function UsersPage() {
  const { users, isLoading, fetchUsers, createUser, updateUser, deleteUser } = useUserStore();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchUsers({ search });
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const handleCreate = async (data: any) => {
    try {
      await createUser(data);
      setShowCreateDialog(false);
      toast({
        title: 'Utente creato',
        description: 'L\'utente è stato creato con successo',
      });
    } catch (error: any) {
      toast({
        title: 'Errore',
        description: error.message || 'Impossibile creare l\'utente',
        variant: 'destructive',
      });
    }
  };

  const handleUpdate = async (data: any) => {
    if (!editingUser) return;
    try {
      await updateUser(editingUser.id, data);
      setEditingUser(null);
      toast({
        title: 'Utente aggiornato',
        description: 'Le modifiche sono state salvate',
      });
    } catch (error: any) {
      toast({
        title: 'Errore',
        description: error.message || 'Impossibile aggiornare l\'utente',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id);
      setShowDeleteDialog(null);
      toast({
        title: 'Utente eliminato',
        description: 'L\'utente è stato disattivato',
      });
    } catch (error: any) {
      toast({
        title: 'Errore',
        description: error.message || 'Impossibile eliminare l\'utente',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gestione Utenti</h1>
          <p className="text-muted-foreground mt-1">
            Gestisci gli utenti della palestra
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuovo Utente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crea Nuovo Utente</DialogTitle>
              <DialogDescription>
                Inserisci i dati del nuovo utente
              </DialogDescription>
            </DialogHeader>
            <UserForm
              onSubmit={handleCreate}
              onCancel={() => setShowCreateDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cerca utenti per nome, cognome o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5" />
            Utenti ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <UsersIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nessun utente trovato</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center">
                      <span className="font-medium text-primary">
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant={user.isActive ? 'default' : 'secondary'} className="text-xs">
                          {user.isActive ? 'Attivo' : 'Inattivo'}
                        </Badge>
                        {user.phone && (
                          <span className="text-xs text-muted-foreground">{user.phone}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingUser(user)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Modifica
                      </DropdownMenuItem>
                      <Link to={`/users/${user.id}/plans`}>
                        <DropdownMenuItem>
                          <FileText className="mr-2 h-4 w-4" />
                          Schede
                        </DropdownMenuItem>
                      </Link>
                      <Link to={`/users/${user.id}/stats`}>
                        <DropdownMenuItem>
                          <TrendingUp className="mr-2 h-4 w-4" />
                          Statistiche
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setShowDeleteDialog(user.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Elimina
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifica Utente</DialogTitle>
            <DialogDescription>
              Modifica i dati di {editingUser?.firstName} {editingUser?.lastName}
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <UserForm
              user={editingUser}
              onSubmit={handleUpdate}
              onCancel={() => setEditingUser(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!showDeleteDialog} onOpenChange={() => setShowDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conferma Eliminazione</DialogTitle>
            <DialogDescription>
              Sei sicuro di voler disattivare questo utente? L'utente non potrà più accedere all'app.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(null)}>
              Annulla
            </Button>
            <Button
              variant="destructive"
              onClick={() => showDeleteDialog && handleDelete(showDeleteDialog)}
            >
              Elimina
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
