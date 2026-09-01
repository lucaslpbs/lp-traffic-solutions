// @ts-nocheck
import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CalendarIcon,
  Sparkles,
  Loader2,
  CheckCircle2,
  Clock,
  Phone,
  Instagram,
} from 'lucide-react';

const SERVICOS = [
  { id: 'stories', label: 'Stories' },
  { id: 'feed', label: 'Feed' },
  { id: 'presencial', label: 'Presencial' },
  { id: 'online', label: 'Online' },
];

const N8N_BASE = 'https://n8n.trafficsolutions.cloud/webhook';

const inputCls =
  'bg-foreground/5 border-foreground/10 text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-0';
const labelCls = 'block text-sm font-medium text-foreground/85 mb-1.5';

function fmtMoney(v: number | null) {
  if (v == null) return '—';
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

async function dispararWebhook(nome: string, payload: Record<string, unknown>) {
  try {
    await fetch(`${N8N_BASE}/${nome}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error('Erro ao disparar webhook', nome, err);
  }
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'confirmado') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success/20 text-success border border-success/30">
        Confirmado
      </span>
    );
  }
  if (status === 'cancelado') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-destructive/20 text-destructive border border-destructive/30">
        Cancelado
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-500 border border-amber-500/30">
      Pendente
    </span>
  );
}

export default function InfluenciadorBoardPage() {
  const { influenciadorId, agendamentoId } = useParams<{ influenciadorId: string; agendamentoId?: string }>();
  const navigate = useNavigate();
  const { isAdmin, isInfluenciador, influenciadorId: ownInfluenciadorId, clienteVinculadoId, user } = useAuth();
  const qc = useQueryClient();

  const souInfluenciador = isInfluenciador && ownInfluenciadorId === influenciadorId;
  const souCliente = !isAdmin && !souInfluenciador && !!clienteVinculadoId;
  const podeAgendar = isAdmin || souCliente;

  const { data: influenciador, isLoading: loadingInfluenciador } = useQuery({
    queryKey: ['influenciador', influenciadorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('influenciadores')
        .select('*')
        .eq('id', influenciadorId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!influenciadorId,
  });

  const { data: horarios = [] } = useQuery({
    queryKey: ['influenciador-horarios', influenciadorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('influenciador_horarios')
        .select('*')
        .eq('influenciador_id', influenciadorId!);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!influenciadorId,
  });

  const { data: clientesVinculados = [] } = useQuery({
    queryKey: ['influenciador-clientes-vinculados', influenciadorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('influenciador_clientes')
        .select('client_id, gestao_clientes(id, nome_cliente)')
        .eq('influenciador_id', influenciadorId!);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!influenciadorId && isAdmin,
  });

  const { data: agendamentos = [], isLoading: loadingAgendamentos } = useQuery({
    queryKey: ['influenciador-agendamentos', influenciadorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('influenciador_agendamentos')
        .select('*, gestao_clientes(nome_cliente, numero_grupo_whatsapp)')
        .eq('influenciador_id', influenciadorId!)
        .order('data', { ascending: true })
        .order('hora_inicio', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!influenciadorId,
  });

  const [selectedClientId, setSelectedClientId] = useState('');
  const [servico, setServico] = useState('');
  const [dataSelecionada, setDataSelecionada] = useState<Date>(new Date());
  const [horaSelecionada, setHoraSelecionada] = useState('');
  const [nomeContato, setNomeContato] = useState('');
  const [telefoneContato, setTelefoneContato] = useState('');
  const [instagramContato, setInstagramContato] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null);

  const diaSemana = dataSelecionada.getDay();
  const dataStr = format(dataSelecionada, 'yyyy-MM-dd');

  const slotsDisponiveis = useMemo(() => {
    if (!servico) return [];
    const horariosDoDia = horarios.filter(
      (h: any) => h.dia_semana === diaSemana && (h.servico === null || h.servico === servico)
    );
    const ocupados = new Set(
      agendamentos
        .filter((a: any) => a.data === dataStr && a.status !== 'cancelado')
        .map((a: any) => String(a.hora_inicio).slice(0, 5))
    );
    const slots = new Set<string>();
    for (const h of horariosDoDia as any[]) {
      let [hh, mm] = String(h.hora_inicio).slice(0, 5).split(':').map(Number);
      const [fimH, fimM] = String(h.hora_fim).slice(0, 5).split(':').map(Number);
      while (hh < fimH || (hh === fimH && mm < fimM)) {
        const slot = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
        if (!ocupados.has(slot)) slots.add(slot);
        hh += 1;
      }
    }
    return Array.from(slots).sort();
  }, [servico, dataStr, diaSemana, horarios, agendamentos]);

  const resetForm = () => {
    setServico('');
    setHoraSelecionada('');
    setNomeContato('');
    setTelefoneContato('');
    setInstagramContato('');
    setObservacoes('');
    if (isAdmin) setSelectedClientId('');
  };

  const handleAgendar = async (e: React.FormEvent) => {
    e.preventDefault();

    const clientIdFinal = isAdmin ? selectedClientId : clienteVinculadoId;

    if (!clientIdFinal) {
      toast.error('Selecione o cliente.');
      return;
    }
    if (!servico || !horaSelecionada || !nomeContato || !telefoneContato) {
      toast.error('Preencha serviço, horário, nome e telefone de contato.');
      return;
    }

    setSubmitting(true);
    try {
      const [hh, mm] = horaSelecionada.split(':').map(Number);
      const horaFim = `${String(hh + 1).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;

      const payload = {
        influenciador_id: influenciadorId,
        client_id: clientIdFinal,
        data: dataStr,
        hora_inicio: horaSelecionada,
        hora_fim: horaFim,
        servico,
        nome_contato: nomeContato,
        telefone_contato: telefoneContato,
        instagram_contato: instagramContato || null,
        observacoes: observacoes || null,
        status: isAdmin ? 'confirmado' : 'pendente_confirmacao',
        origem: isAdmin ? 'admin' : 'cliente',
        created_by: user?.id ?? null,
        confirmed_at: isAdmin ? new Date().toISOString() : null,
      };

      const { data: novoAgendamento, error } = await supabase
        .from('influenciador_agendamentos')
        .insert(payload)
        .select('*, gestao_clientes(nome_cliente, numero_grupo_whatsapp)')
        .single();
      if (error) throw error;

      const clienteInfo = (novoAgendamento as any).gestao_clientes;
      const webhookPayloadBase = {
        agendamento_id: novoAgendamento.id,
        data: dataStr,
        hora_inicio: horaSelecionada,
        hora_fim: horaFim,
        servico,
        nome_contato: nomeContato,
        telefone_contato: telefoneContato,
        instagram_contato: instagramContato || null,
        nome_cliente: clienteInfo?.nome_cliente ?? null,
        numero_grupo_whatsapp: clienteInfo?.numero_grupo_whatsapp ?? null,
      };

      if (isAdmin) {
        await dispararWebhook('influenciador-agendamento-admin', webhookPayloadBase);
      } else {
        const linkConfirmacao = `${window.location.origin}/dashboard/influenciadores/${influenciadorId}/confirmar/${novoAgendamento.id}`;
        await dispararWebhook('cliente-agendou', {
          ...webhookPayloadBase,
          nome_influenciador: influenciador?.nome ?? null,
          telefone_influenciador: influenciador?.telefone ?? null,
          link_confirmacao: linkConfirmacao,
        });
      }

      await supabase
        .from('influenciador_agendamentos')
        .update({ webhook_criado_disparado: true })
        .eq('id', novoAgendamento.id);

      toast.success(
        isAdmin ? 'Agendamento criado e confirmado!' : 'Agendamento solicitado! Aguardando confirmação do influenciador.'
      );
      resetForm();
      qc.invalidateQueries({ queryKey: ['influenciador-agendamentos', influenciadorId] });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar agendamento.');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmarAgendamento = async (agendamento: any) => {
    setConfirmandoId(agendamento.id);
    try {
      const { error } = await supabase
        .from('influenciador_agendamentos')
        .update({ status: 'confirmado', confirmed_at: new Date().toISOString() })
        .eq('id', agendamento.id);
      if (error) throw error;

      await dispararWebhook('influencer-aceitou', {
        agendamento_id: agendamento.id,
        data: agendamento.data,
        hora_inicio: agendamento.hora_inicio,
        servico: agendamento.servico,
        nome_cliente: agendamento.gestao_clientes?.nome_cliente ?? null,
        numero_grupo_whatsapp: agendamento.gestao_clientes?.numero_grupo_whatsapp ?? null,
      });

      await supabase
        .from('influenciador_agendamentos')
        .update({ webhook_confirmado_disparado: true })
        .eq('id', agendamento.id);

      toast.success('Agendamento confirmado! O grupo do cliente foi avisado.');
      qc.invalidateQueries({ queryKey: ['influenciador-agendamentos', influenciadorId] });
    } catch {
      toast.error('Erro ao confirmar agendamento.');
    } finally {
      setConfirmandoId(null);
    }
  };

  if (loadingInfluenciador) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!influenciador) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">
        Influenciador não encontrado.
      </div>
    );
  }

  const agendamentoFocado = agendamentoId
    ? agendamentos.find((a: any) => a.id === agendamentoId)
    : null;

  return (
    <div className="min-h-screen bg-background text-foreground p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-primary/15 border border-primary/20">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{influenciador.nome}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{influenciador.telefone}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-foreground/5 rounded-xl border border-foreground/10 p-4">
        <div>
          <p className="text-muted-foreground text-xs mb-1">Stories</p>
          <p className="text-foreground font-medium">{fmtMoney(influenciador.valor_stories)}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs mb-1">Feed</p>
          <p className="text-foreground font-medium">{fmtMoney(influenciador.valor_feed)}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs mb-1">Presencial</p>
          <p className="text-foreground font-medium">{fmtMoney(influenciador.valor_presencial)}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs mb-1">Online</p>
          <p className="text-foreground font-medium">{fmtMoney(influenciador.valor_online)}</p>
        </div>
      </div>

      {agendamentoFocado && agendamentoFocado.status === 'pendente_confirmacao' && souInfluenciador && (
        <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 flex items-center justify-between gap-4">
          <div>
            <p className="font-medium text-foreground">
              Confirmar agendamento de {format(new Date(`${agendamentoFocado.data}T00:00:00`), 'dd/MM/yyyy')} às{' '}
              {String(agendamentoFocado.hora_inicio).slice(0, 5)}
            </p>
            <p className="text-sm text-muted-foreground">
              {agendamentoFocado.nome_contato} • {agendamentoFocado.telefone_contato} • {agendamentoFocado.servico}
            </p>
          </div>
          <Button
            onClick={() => confirmarAgendamento(agendamentoFocado)}
            disabled={confirmandoId === agendamentoFocado.id}
            className="gap-2 bg-primary hover:bg-primary text-foreground"
          >
            <CheckCircle2 className="h-4 w-4" />
            Confirmar
          </Button>
        </div>
      )}

      {podeAgendar && (
        <form
          onSubmit={handleAgendar}
          className="bg-foreground/5 backdrop-blur-xl rounded-xl border border-foreground/10 p-5 space-y-4"
        >
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Novo agendamento
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {isAdmin && (
              <div>
                <label className={labelCls}>Cliente</label>
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger className={inputCls}>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-foreground/10 text-foreground">
                    {clientesVinculados.map((c: any) => (
                      <SelectItem key={c.client_id} value={c.client_id}>
                        {c.gestao_clientes?.nome_cliente ?? c.client_id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <label className={labelCls}>Serviço</label>
              <Select value={servico} onValueChange={(v) => { setServico(v); setHoraSelecionada(''); }}>
                <SelectTrigger className={inputCls}>
                  <SelectValue placeholder="Selecione o serviço" />
                </SelectTrigger>
                <SelectContent className="bg-card border-foreground/10 text-foreground">
                  {SERVICOS.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Data</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-64 justify-start text-left font-normal bg-foreground/5 border-foreground/10 text-foreground hover:bg-foreground/10 hover:text-foreground"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(dataSelecionada, 'dd/MM/yyyy', { locale: ptBR })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-card border-foreground/10" align="start">
                <Calendar
                  mode="single"
                  selected={dataSelecionada}
                  onSelect={(d) => { if (d) { setDataSelecionada(d); setHoraSelecionada(''); } }}
                  disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                  initialFocus
                  locale={ptBR}
                  className="pointer-events-auto bg-card text-foreground"
                />
              </PopoverContent>
            </Popover>
          </div>

          {servico && (
            <div>
              <label className={labelCls}>Horário disponível</label>
              {slotsDisponiveis.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum horário disponível para {format(dataSelecionada, 'dd/MM')} nesse serviço.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {slotsDisponiveis.map((slot) => (
                    <button
                      type="button"
                      key={slot}
                      onClick={() => setHoraSelecionada(slot)}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                        horaSelecionada === slot
                          ? 'bg-primary text-foreground border-primary'
                          : 'bg-foreground/5 border-foreground/10 text-foreground/85 hover:bg-foreground/10'
                      }`}
                    >
                      <Clock className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={labelCls}>Nome de contato</label>
              <Input value={nomeContato} onChange={(e) => setNomeContato(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Telefone de contato</label>
              <Input value={telefoneContato} onChange={(e) => setTelefoneContato(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Instagram</label>
              <Input value={instagramContato} onChange={(e) => setInstagramContato(e.target.value)} className={inputCls} placeholder="@usuario" />
            </div>
          </div>

          <div>
            <label className={labelCls}>Observações</label>
            <Textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} className={inputCls} rows={2} />
          </div>

          <Button type="submit" disabled={submitting} className="bg-primary hover:bg-primary text-foreground">
            {submitting ? 'Salvando...' : isAdmin ? 'Agendar (confirmado)' : 'Solicitar agendamento'}
          </Button>
        </form>
      )}

      <div className="bg-foreground/5 backdrop-blur-xl rounded-xl border border-foreground/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-foreground/10">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Agendamentos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-foreground/10">
                {['Data', 'Horário', 'Serviço', 'Cliente', 'Contato', 'Status', ...(souInfluenciador ? ['Ações'] : [])].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loadingAgendamentos ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">Carregando...</td>
                </tr>
              ) : agendamentos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">Nenhum agendamento ainda.</td>
                </tr>
              ) : (
                agendamentos.map((a: any) => (
                  <tr key={a.id} className="border-b border-foreground/5 last:border-0 hover:bg-foreground/[0.03]">
                    <td className="px-4 py-3 text-sm text-foreground">{format(new Date(`${a.data}T00:00:00`), 'dd/MM/yyyy')}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{String(a.hora_inicio).slice(0, 5)}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground capitalize">{a.servico}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{a.gestao_clientes?.nome_cliente ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1"><Phone className="h-3 w-3" />{a.telefone_contato}</div>
                      {a.instagram_contato && (
                        <div className="flex items-center gap-1"><Instagram className="h-3 w-3" />{a.instagram_contato}</div>
                      )}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                    {souInfluenciador && (
                      <td className="px-4 py-3">
                        {a.status === 'pendente_confirmacao' && (
                          <Button
                            size="sm"
                            onClick={() => confirmarAgendamento(a)}
                            disabled={confirmandoId === a.id}
                            className="gap-1.5 bg-primary hover:bg-primary text-foreground"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Confirmar
                          </Button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
