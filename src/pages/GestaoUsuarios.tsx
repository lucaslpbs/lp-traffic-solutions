// @ts-nocheck
import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase as supabaseGestao } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  UserCog,
  Plus,
  Search,
  Pencil,
  PauseCircle,
  PlayCircle,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';

type Colaborador = {
  user_id: string;
  nome: string;
  email: string;
  cargo: string | null;
  ativo: boolean;
  created_at: string;
};

type AdminUser = {
  user_id: string;
  email: string;
  created_at: string;
};

type ClienteOpcao = { id: string; nome_cliente: string };

type SessaoOpcao = { id: string; label: string };

const SESSOES: SessaoOpcao[] = [
  { id: 'guerra', label: 'Quarto de Guerra' },
  { id: 'gestao_clientes', label: 'Gestão de Clientes' },
  { id: 'sistema', label: 'Sistema' },
  { id: 'chamados', label: 'Chamados' },
  { id: 'ranking', label: 'Ranking' },
];

type FormData = {
  nome: string;
  email: string;
  cargo: string;
  senha: string;
  clientIds: string[];
  sessoes: string[];
};

const EMPTY_FORM: FormData = {
  nome: '',
  email: '',
  cargo: '',
  senha: '',
  clientIds: [],
  sessoes: [],
};

const inputCls =
  'bg-foreground/5 border-foreground/10 text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-0';
const labelCls = 'block text-sm font-medium text-foreground/85 mb-1.5';
const sectionTitleCls =
  'text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 pb-2 border-b border-foreground/10';

function StatusBadge({ ativo }: { ativo: boolean }) {
  return ativo ? (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success/20 text-success border border-success/30">
      Ativo
    </span>
  ) : (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-500/20 text-muted-foreground border border-gray-500/30">
      Inativo
    </span>
  );
}

export default function GestaoUsuarios() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { data: colaboradores = [], isLoading: loading } = useQuery({
    queryKey: ['colaboradores'],
    queryFn: async () => {
      const { data, error } = await supabaseGestao
        .from('colaboradores')
        .select('*')
        .order('nome');
      if (error) throw error;
      return (data ?? []) as Colaborador[];
    },
  });

  const { data: admins = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabaseGestao.rpc('list_admin_users');
      if (error) throw error;
      return (data ?? []) as AdminUser[];
    },
  });

  const { data: clientesOpcoes = [] } = useQuery({
    queryKey: ['gestao-clientes-opcoes'],
    queryFn: async () => {
      const { data, error } = await supabaseGestao
        .from('gestao_clientes')
        .select('id, nome_cliente')
        .eq('status', 'ativo')
        .order('nome_cliente');
      if (error) throw error;
      return (data ?? []) as ClienteOpcao[];
    },
    enabled: modalOpen,
  });

  const invalidateColaboradores = () => {
    qc.invalidateQueries({ queryKey: ['colaboradores'] });
  };

  const filtered = useMemo(() => {
    return colaboradores.filter((c) => {
      const matchSearch =
        !search ||
        c.nome.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        filterStatus === 'todos' ||
        (filterStatus === 'ativo' && c.ativo) ||
        (filterStatus === 'inativo' && !c.ativo);
      return matchSearch && matchStatus;
    });
  }, [colaboradores, search, filterStatus]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowPassword(false);
    setModalOpen(true);
  };

  const openEdit = async (c: Colaborador) => {
    setEditingId(c.user_id);
    setShowPassword(false);
    setModalOpen(true);
    setForm({
      nome: c.nome,
      email: c.email,
      cargo: c.cargo ?? '',
      senha: '',
      clientIds: [],
      sessoes: [],
    });

    const [{ data: clientRows }, { data: sessaoRows }] = await Promise.all([
      supabaseGestao.from('colaborador_clientes').select('client_id').eq('user_id', c.user_id),
      supabaseGestao.from('colaborador_sessoes').select('sessao').eq('user_id', c.user_id),
    ]);

    setForm((prev) => ({
      ...prev,
      clientIds: (clientRows ?? []).map((r) => r.client_id),
      sessoes: (sessaoRows ?? []).map((r) => r.sessao),
    }));
  };

  const toggleCliente = (id: string) => {
    setForm((prev) => ({
      ...prev,
      clientIds: prev.clientIds.includes(id)
        ? prev.clientIds.filter((c) => c !== id)
        : [...prev.clientIds, id],
    }));
  };

  const toggleSessao = (id: string) => {
    setForm((prev) => ({
      ...prev,
      sessoes: prev.sessoes.includes(id)
        ? prev.sessoes.filter((s) => s !== id)
        : [...prev.sessoes, id],
    }));
  };

  const toggleAtivo = async (c: Colaborador) => {
    const { error } = await supabaseGestao
      .from('colaboradores')
      .update({ ativo: !c.ativo })
      .eq('user_id', c.user_id);
    if (error) {
      toast.error('Erro ao atualizar status do colaborador.');
      return;
    }
    toast.success(c.ativo ? 'Colaborador desativado.' : 'Colaborador ativado.');
    invalidateColaboradores();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.nome || !form.email) {
      toast.error('Nome e e-mail são obrigatórios.');
      return;
    }
    if (!editingId && !form.senha) {
      toast.error('Senha é obrigatória ao criar um novo colaborador.');
      return;
    }
    if (form.senha && form.senha.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabaseGestao.functions.invoke('manage-collaborator-auth', {
        body: {
          action: editingId ? 'update' : 'create',
          user_id: editingId ?? undefined,
          nome: form.nome,
          email: form.email,
          cargo: form.cargo || null,
          ...(form.senha ? { password: form.senha } : {}),
          client_ids: form.clientIds,
          sessoes: form.sessoes,
        },
      });
      if (error) throw error;
      if (!data?.success) {
        toast.error(data?.error || 'Erro ao salvar colaborador.');
        return;
      }

      toast.success(editingId ? 'Colaborador atualizado com sucesso!' : 'Colaborador criado com sucesso!');
      setModalOpen(false);
      invalidateColaboradores();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar colaborador.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/15 border border-primary/20">
            <UserCog className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestão de Usuários</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Controle o acesso de cada colaborador aos clientes e às áreas do sistema
            </p>
          </div>
        </div>
        <Button onClick={openCreate} className="bg-primary hover:bg-primary text-foreground gap-2">
          <Plus className="h-4 w-4" />
          Novo Colaborador
        </Button>
      </div>

      {/* Administradores — acesso total, so leitura aqui */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Administradores</h2>
          <span className="text-xs text-muted-foreground">— acesso total ao sistema</span>
        </div>
        <div className="bg-foreground/5 backdrop-blur-xl rounded-xl border border-foreground/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-foreground/10">
                  {['E-mail', 'Desde'].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {admins.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-4 py-6 text-center text-muted-foreground text-sm">
                      Nenhum administrador encontrado.
                    </td>
                  </tr>
                ) : (
                  admins.map((a) => (
                    <tr key={a.user_id} className="border-b border-foreground/5 last:border-0">
                      <td className="px-4 py-2.5 text-sm font-medium text-foreground">{a.email}</td>
                      <td className="px-4 py-2.5 text-sm text-muted-foreground">
                        {new Date(a.created_at).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`pl-9 ${inputCls}`}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className={`w-40 ${inputCls}`}>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-card border-foreground/10 text-foreground">
            <SelectItem value="todos">Todos status</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="inativo">Inativo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-foreground/5 backdrop-blur-xl rounded-xl border border-foreground/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-foreground/10">
                {['Nome', 'E-mail', 'Cargo', 'Clientes', 'Sessões', 'Status', 'Ações'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    Carregando...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    Nenhum colaborador encontrado.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.user_id} className="border-b border-foreground/5 last:border-0 hover:bg-foreground/[0.03]">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{c.nome}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{c.email}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{c.cargo || '—'}</td>
                    <ClienteCountCell userId={c.user_id} />
                    <SessaoCountCell userId={c.user_id} />
                    <td className="px-4 py-3">
                      <StatusBadge ativo={c.ativo} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => openEdit(c)}
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => toggleAtivo(c)}
                          title={c.ativo ? 'Desativar' : 'Ativar'}
                        >
                          {c.ativo ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-foreground/10">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Colaborador' : 'Novo Colaborador'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className={sectionTitleCls}>Identificação</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Nome *</label>
                  <Input
                    value={form.nome}
                    onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
                    className={inputCls}
                    placeholder="Nome do colaborador"
                  />
                </div>
                <div>
                  <label className={labelCls}>Cargo</label>
                  <Input
                    value={form.cargo}
                    onChange={(e) => setForm((p) => ({ ...p, cargo: e.target.value }))}
                    className={inputCls}
                    placeholder="Ex: Gestora de Tráfego"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className={sectionTitleCls}>Acesso (Login)</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>E-mail *</label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    className={inputCls}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <label className={labelCls}>
                    {editingId ? 'Nova senha (opcional)' : 'Senha *'}
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={form.senha}
                      onChange={(e) => setForm((p) => ({ ...p, senha: e.target.value }))}
                      className={`pr-9 ${inputCls}`}
                      placeholder={editingId ? 'Deixe em branco para manter' : 'Mínimo 6 caracteres'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className={sectionTitleCls}>Sessões liberadas</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SESSOES.map((s) => (
                  <label key={s.id} className="flex items-center gap-2 text-sm text-foreground/85 cursor-pointer">
                    <Checkbox
                      checked={form.sessoes.includes(s.id)}
                      onCheckedChange={() => toggleSessao(s.id)}
                    />
                    {s.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className={sectionTitleCls}>Clientes liberados</h3>
              {clientesOpcoes.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum cliente ativo cadastrado.</p>
              ) : (
                <div className="max-h-56 overflow-y-auto space-y-2 border border-foreground/10 rounded-lg p-3 bg-foreground/[0.02]">
                  {clientesOpcoes.map((c) => (
                    <label key={c.id} className="flex items-center gap-2 text-sm text-foreground/85 cursor-pointer">
                      <Checkbox
                        checked={form.clientIds.includes(c.id)}
                        onCheckedChange={() => toggleCliente(c.id)}
                      />
                      {c.nome_cliente}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting} className="bg-primary hover:bg-primary text-foreground">
                {submitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ClienteCountCell({ userId }: { userId: string }) {
  const { data } = useQuery({
    queryKey: ['colaborador-clientes-count', userId],
    queryFn: async () => {
      const { count, error } = await supabaseGestao
        .from('colaborador_clientes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      if (error) throw error;
      return count ?? 0;
    },
  });
  return <td className="px-4 py-3 text-sm text-muted-foreground">{data ?? '—'}</td>;
}

function SessaoCountCell({ userId }: { userId: string }) {
  const { data } = useQuery({
    queryKey: ['colaborador-sessoes-count', userId],
    queryFn: async () => {
      const { count, error } = await supabaseGestao
        .from('colaborador_sessoes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      if (error) throw error;
      return count ?? 0;
    },
  });
  return <td className="px-4 py-3 text-sm text-muted-foreground">{data ?? '—'}</td>;
}
