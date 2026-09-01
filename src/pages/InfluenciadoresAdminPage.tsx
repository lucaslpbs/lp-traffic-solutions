// @ts-nocheck
import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
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
  Sparkles,
  Plus,
  Search,
  Pencil,
  PauseCircle,
  PlayCircle,
  Eye,
  EyeOff,
  Trash2,
  CalendarDays,
} from 'lucide-react';

type Influenciador = {
  id: string;
  user_id: string;
  nome: string;
  telefone: string;
  email: string;
  valor_stories: number | null;
  valor_feed: number | null;
  valor_presencial: number | null;
  valor_online: number | null;
  ativo: boolean;
  created_at: string;
};

type ClienteOpcao = { id: string; nome_cliente: string };

const DIAS_SEMANA = [
  { id: '0', label: 'Domingo' },
  { id: '1', label: 'Segunda' },
  { id: '2', label: 'Terça' },
  { id: '3', label: 'Quarta' },
  { id: '4', label: 'Quinta' },
  { id: '5', label: 'Sexta' },
  { id: '6', label: 'Sábado' },
];

const SERVICOS = [
  { id: 'stories', label: 'Stories' },
  { id: 'feed', label: 'Feed' },
  { id: 'presencial', label: 'Presencial' },
  { id: 'online', label: 'Online' },
];

type HorarioForm = { diaSemana: string; servicos: string[]; horaInicio: string; horaFim: string };

const EMPTY_HORARIO: HorarioForm = { diaSemana: '1', servicos: [], horaInicio: '09:00', horaFim: '18:00' };

type FormData = {
  nome: string;
  telefone: string;
  email: string;
  senha: string;
  valorStories: string;
  valorFeed: string;
  valorPresencial: string;
  valorOnline: string;
  clientIds: string[];
  horarios: HorarioForm[];
};

const EMPTY_FORM: FormData = {
  nome: '',
  telefone: '',
  email: '',
  senha: '',
  valorStories: '',
  valorFeed: '',
  valorPresencial: '',
  valorOnline: '',
  clientIds: [],
  horarios: [],
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

export default function InfluenciadoresAdminPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { data: influenciadores = [], isLoading: loading } = useQuery({
    queryKey: ['influenciadores'],
    queryFn: async () => {
      const { data, error } = await supabaseGestao
        .from('influenciadores')
        .select('*')
        .order('nome');
      if (error) throw error;
      return (data ?? []) as Influenciador[];
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

  const invalidate = () => qc.invalidateQueries({ queryKey: ['influenciadores'] });

  const filtered = useMemo(() => {
    return influenciadores.filter((i) => {
      if (!search) return true;
      const s = search.toLowerCase();
      return i.nome.toLowerCase().includes(s) || i.email.toLowerCase().includes(s);
    });
  }, [influenciadores, search]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowPassword(false);
    setModalOpen(true);
  };

  const openEdit = async (i: Influenciador) => {
    setEditingId(i.id);
    setShowPassword(false);
    setModalOpen(true);
    setForm({
      nome: i.nome,
      telefone: i.telefone,
      email: i.email,
      senha: '',
      valorStories: i.valor_stories != null ? String(i.valor_stories) : '',
      valorFeed: i.valor_feed != null ? String(i.valor_feed) : '',
      valorPresencial: i.valor_presencial != null ? String(i.valor_presencial) : '',
      valorOnline: i.valor_online != null ? String(i.valor_online) : '',
      clientIds: [],
      horarios: [],
    });

    const [{ data: clientRows }, { data: horarioRows }] = await Promise.all([
      supabaseGestao.from('influenciador_clientes').select('client_id').eq('influenciador_id', i.id),
      supabaseGestao
        .from('influenciador_horarios')
        .select('dia_semana, servico, hora_inicio, hora_fim')
        .eq('influenciador_id', i.id)
        .order('dia_semana'),
    ]);

    // Cada linha de horario no banco e um (dia_semana, hora_inicio, hora_fim,
    // servico); agrupamos aqui as que compartilham o mesmo dia/horario numa
    // unica linha de formulario com varios servicos marcados.
    const grupos = new Map<string, HorarioForm>();
    for (const h of horarioRows ?? []) {
      const horaInicio = h.hora_inicio?.slice(0, 5) ?? '09:00';
      const horaFim = h.hora_fim?.slice(0, 5) ?? '18:00';
      const chave = `${h.dia_semana}|${horaInicio}|${horaFim}`;
      if (!grupos.has(chave)) {
        grupos.set(chave, { diaSemana: String(h.dia_semana), servicos: [], horaInicio, horaFim });
      }
      if (h.servico) grupos.get(chave)!.servicos.push(h.servico);
    }

    setForm((prev) => ({
      ...prev,
      clientIds: (clientRows ?? []).map((r) => r.client_id),
      horarios: Array.from(grupos.values()),
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

  const addHorario = () => {
    setForm((prev) => ({ ...prev, horarios: [...prev.horarios, { ...EMPTY_HORARIO }] }));
  };

  const removeHorario = (index: number) => {
    setForm((prev) => ({ ...prev, horarios: prev.horarios.filter((_, i) => i !== index) }));
  };

  const handleHorarioField = (index: number, field: 'diaSemana' | 'horaInicio' | 'horaFim', value: string) => {
    setForm((prev) => {
      const updated = [...prev.horarios];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, horarios: updated };
    });
  };

  const toggleHorarioServico = (index: number, servicoId: string) => {
    setForm((prev) => {
      const updated = [...prev.horarios];
      const atual = updated[index].servicos;
      updated[index] = {
        ...updated[index],
        servicos: atual.includes(servicoId) ? atual.filter((s) => s !== servicoId) : [...atual, servicoId],
      };
      return { ...prev, horarios: updated };
    });
  };

  const toggleAtivo = async (i: Influenciador) => {
    const { error } = await supabaseGestao
      .from('influenciadores')
      .update({ ativo: !i.ativo })
      .eq('id', i.id);
    if (error) {
      toast.error('Erro ao atualizar status do influenciador.');
      return;
    }
    toast.success(i.ativo ? 'Influenciador desativado.' : 'Influenciador ativado.');
    invalidate();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.nome || !form.email || !form.telefone) {
      toast.error('Nome, telefone e e-mail são obrigatórios.');
      return;
    }
    if (!editingId && !form.senha) {
      toast.error('Senha é obrigatória ao criar um novo influenciador.');
      return;
    }
    if (form.senha && form.senha.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabaseGestao.functions.invoke('manage-influencer-auth', {
        body: {
          action: editingId ? 'update' : 'create',
          influenciador_id: editingId ?? undefined,
          nome: form.nome,
          email: form.email,
          telefone: form.telefone,
          ...(form.senha ? { password: form.senha } : {}),
          valor_stories: form.valorStories ? parseFloat(form.valorStories) : null,
          valor_feed: form.valorFeed ? parseFloat(form.valorFeed) : null,
          valor_presencial: form.valorPresencial ? parseFloat(form.valorPresencial) : null,
          valor_online: form.valorOnline ? parseFloat(form.valorOnline) : null,
          client_ids: form.clientIds,
        },
      });
      if (error) throw error;
      if (!data?.success) {
        toast.error(data?.error || 'Erro ao salvar influenciador.');
        return;
      }

      const influenciadorId = data.influenciador_id as string;

      await supabaseGestao.from('influenciador_horarios').delete().eq('influenciador_id', influenciadorId);
      // Um horario sem servico marcado vale pra todos (servico=null); com um
      // ou mais marcados, vira uma linha por servico no banco.
      const horariosExpandidos = form.horarios.flatMap((h) => {
        const base = { influenciador_id: influenciadorId, dia_semana: parseInt(h.diaSemana, 10), hora_inicio: h.horaInicio, hora_fim: h.horaFim };
        return h.servicos.length > 0
          ? h.servicos.map((servico) => ({ ...base, servico }))
          : [{ ...base, servico: null }];
      });
      if (horariosExpandidos.length > 0) {
        const { error: horarioError } = await supabaseGestao.from('influenciador_horarios').insert(horariosExpandidos);
        if (horarioError) {
          toast.error('Influenciador salvo, mas houve erro ao salvar os horários: ' + horarioError.message);
        }
      }

      toast.success(editingId ? 'Influenciador atualizado com sucesso!' : 'Influenciador criado com sucesso!');
      setModalOpen(false);
      invalidate();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar influenciador.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/15 border border-primary/20">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Influenciadores</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Cadastre influenciadores, defina valores e horários, e vincule clientes ativos
            </p>
          </div>
        </div>
        <Button onClick={openCreate} className="bg-primary hover:bg-primary text-foreground gap-2">
          <Plus className="h-4 w-4" />
          Novo Influenciador
        </Button>
      </div>

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
      </div>

      <div className="bg-foreground/5 backdrop-blur-xl rounded-xl border border-foreground/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-foreground/10">
                {['Nome', 'Telefone', 'E-mail', 'Status', 'Ações'].map((h) => (
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
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    Carregando...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    Nenhum influenciador encontrado.
                  </td>
                </tr>
              ) : (
                filtered.map((i) => (
                  <tr key={i.id} className="border-b border-foreground/5 last:border-0 hover:bg-foreground/[0.03]">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{i.nome}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{i.telefone}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{i.email}</td>
                    <td className="px-4 py-3">
                      <StatusBadge ativo={i.ativo} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="Ver agenda">
                          <Link to={`/dashboard/influenciadores/${i.id}`}>
                            <CalendarDays className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => openEdit(i)}
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => toggleAtivo(i)}
                          title={i.ativo ? 'Desativar' : 'Ativar'}
                        >
                          {i.ativo ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
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

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-foreground/10">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Influenciador' : 'Novo Influenciador'}</DialogTitle>
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
                    placeholder="Nome do influenciador"
                  />
                </div>
                <div>
                  <label className={labelCls}>Telefone *</label>
                  <Input
                    value={form.telefone}
                    onChange={(e) => setForm((p) => ({ ...p, telefone: e.target.value }))}
                    className={inputCls}
                    placeholder="5585999999999"
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
              <h3 className={sectionTitleCls}>Valores por serviço (opcional)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className={labelCls}>Stories</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.valorStories}
                    onChange={(e) => setForm((p) => ({ ...p, valorStories: e.target.value }))}
                    className={inputCls}
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <label className={labelCls}>Feed</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.valorFeed}
                    onChange={(e) => setForm((p) => ({ ...p, valorFeed: e.target.value }))}
                    className={inputCls}
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <label className={labelCls}>Presencial</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.valorPresencial}
                    onChange={(e) => setForm((p) => ({ ...p, valorPresencial: e.target.value }))}
                    className={inputCls}
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <label className={labelCls}>Online</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.valorOnline}
                    onChange={(e) => setForm((p) => ({ ...p, valorOnline: e.target.value }))}
                    className={inputCls}
                    placeholder="0,00"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-foreground/10">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Horários disponíveis
                </h3>
                <Button type="button" variant="ghost" size="sm" onClick={addHorario} className="h-7 gap-1 text-xs">
                  <Plus className="h-3.5 w-3.5" />
                  Adicionar
                </Button>
              </div>
              {form.horarios.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum horário definido ainda.</p>
              ) : (
                <div className="space-y-3">
                  {form.horarios.map((h, idx) => (
                    <div key={idx} className="border border-foreground/10 rounded-lg p-3 space-y-3">
                      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-end">
                        <div>
                          <label className={labelCls}>Dia</label>
                          <Select value={h.diaSemana} onValueChange={(v) => handleHorarioField(idx, 'diaSemana', v)}>
                            <SelectTrigger className={inputCls}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-foreground/10 text-foreground">
                              {DIAS_SEMANA.map((d) => (
                                <SelectItem key={d.id} value={d.id}>
                                  {d.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className={labelCls}>Início</label>
                          <Input
                            type="time"
                            value={h.horaInicio}
                            onChange={(e) => handleHorarioField(idx, 'horaInicio', e.target.value)}
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <label className={labelCls}>Fim</label>
                          <Input
                            type="time"
                            value={h.horaFim}
                            onChange={(e) => handleHorarioField(idx, 'horaFim', e.target.value)}
                            className={inputCls}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-muted-foreground hover:text-destructive"
                          onClick={() => removeHorario(idx)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div>
                        <label className={labelCls}>Serviços (nenhum marcado = vale para todos)</label>
                        <div className="flex flex-wrap gap-3">
                          {SERVICOS.map((s) => (
                            <label key={s.id} className="flex items-center gap-1.5 text-sm text-foreground/85 cursor-pointer">
                              <Checkbox
                                checked={h.servicos.includes(s.id)}
                                onCheckedChange={() => toggleHorarioServico(idx, s.id)}
                              />
                              {s.label}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className={sectionTitleCls}>Clientes vinculados</h3>
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
