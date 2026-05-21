import { useEffect, useState, useMemo } from 'react';
import { supabaseGestao } from '@/integrations/supabase/clientGestao';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Users,
  Plus,
  Search,
  Eye,
  MessageSquare,
  Pencil,
  PauseCircle,
  PlayCircle,
  HelpCircle,
  TrendingUp,
  DollarSign,
  Calendar,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';

type GestaoCliente = Tables<'gestao_clientes'>;

type Parcela = { parcelas: string; valor: string; inicio: string };

type FormData = {
  nome_cliente: string;
  numero_conta_anuncio: string;
  segmento: string;
  responsavel_interno: string;
  numero_whatsapp_cliente: string;
  numero_grupo_whatsapp: string;
  valor_mensalidade: string;
  tipo_contrato: 'semanal' | 'mensal' | 'trimestral' | 'semestral' | 'anual';
  dia_vencimento: string;
  data_inicio: string;
  data_fim: string;
  limite_minimo_saldo: string;
  observacoes: string;
  plano_personalizado: boolean;
  parcelas: Parcela[];
};

const EMPTY_PARCELA: Parcela = { parcelas: '', valor: '', inicio: new Date().toISOString().split('T')[0] };

const EMPTY_FORM: FormData = {
  nome_cliente: '',
  numero_conta_anuncio: '',
  segmento: '',
  responsavel_interno: '',
  numero_whatsapp_cliente: '',
  numero_grupo_whatsapp: '',
  valor_mensalidade: '',
  tipo_contrato: 'mensal',
  dia_vencimento: '',
  data_inicio: new Date().toISOString().split('T')[0],
  data_fim: '',
  limite_minimo_saldo: '58.00',
  observacoes: '',
  plano_personalizado: false,
  parcelas: [{ ...EMPTY_PARCELA }],
};

const inputCls =
  'bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-0';
const labelCls = 'block text-sm font-medium text-gray-300 mb-1.5';
const sectionTitleCls =
  'text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 pb-2 border-b border-white/10';

function StatusBadge({ status }: { status: GestaoCliente['status'] }) {
  const map: Record<
    GestaoCliente['status'],
    { label: string; cls: string }
  > = {
    ativo: {
      label: 'Ativo',
      cls: 'bg-green-500/20 text-green-400 border border-green-500/30',
    },
    pausado: {
      label: 'Pausado',
      cls: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    },
    cancelado: {
      label: 'Cancelado',
      cls: 'bg-red-500/20 text-red-400 border border-red-500/30',
    },
  };
  const { label, cls } = map[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

function FluxosBadge({ criados }: { criados: boolean }) {
  return criados ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
      ✓ Automações ativas
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
      ⏳ Aguardando
    </span>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-5 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${accent ?? 'bg-blue-500/15'}`}>
        <Icon className="h-5 w-5 text-blue-400" />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-xl font-bold text-white mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function TooltipIcon({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" className="ml-1.5 text-gray-500 hover:text-gray-300 inline-flex">
          <HelpCircle className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-xs">{text}</TooltipContent>
    </Tooltip>
  );
}

export default function GestaoClientes() {
  const [clientes, setClientes] = useState<GestaoCliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [filterContrato, setFilterContrato] = useState<string>('todos');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [cobrarCliente, setCobrarCliente] = useState<GestaoCliente | null>(null);
  const [cobrandoId, setCobrandoId] = useState<string | null>(null);

  const fetchClientes = async () => {
    setLoading(true);
    const { data, error } = await supabaseGestao
      .from('gestao_clientes')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setClientes(data as GestaoCliente[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const filtered = useMemo(() => {
    return clientes.filter((c) => {
      const matchSearch =
        !search ||
        c.nome_cliente.toLowerCase().includes(search.toLowerCase()) ||
        c.numero_conta_anuncio.includes(search);
      const matchStatus = filterStatus === 'todos' || c.status === filterStatus;
      const matchContrato =
        filterContrato === 'todos' || c.tipo_contrato === filterContrato;
      return matchSearch && matchStatus && matchContrato;
    });
  }, [clientes, search, filterStatus, filterContrato]);

  const kpis = useMemo(() => {
    const ativos = clientes.filter((c) => c.status === 'ativo');
    const mrr = ativos.reduce((s, c) => s + c.valor_mensalidade, 0);
    const hoje = new Date();
    const diaHoje = hoje.getDate();
    const vencendoSemana = ativos.filter((c) => {
      const diff = c.dia_vencimento - diaHoje;
      return diff >= 0 && diff <= 7;
    }).length;
    return {
      total: clientes.length,
      ativos: ativos.length,
      mrr,
      vencendoSemana,
    };
  }, [clientes]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (c: GestaoCliente) => {
    setEditingId(c.id);
    const parcelasDetalhes = Array.isArray(c.parcelas_detalhes) ? (c.parcelas_detalhes as Parcela[]) : null;
    setForm({
      nome_cliente: c.nome_cliente,
      numero_conta_anuncio: c.numero_conta_anuncio,
      segmento: c.segmento ?? '',
      responsavel_interno: c.responsavel_interno ?? '',
      numero_whatsapp_cliente: c.numero_whatsapp_cliente,
      numero_grupo_whatsapp: c.numero_grupo_whatsapp,
      valor_mensalidade: String(c.valor_mensalidade),
      tipo_contrato: c.tipo_contrato,
      dia_vencimento: String(c.dia_vencimento),
      data_inicio: c.data_inicio,
      data_fim: c.data_fim ?? '',
      limite_minimo_saldo: String(c.limite_minimo_saldo),
      observacoes: c.observacoes ?? '',
      plano_personalizado: c.plano_personalizado ?? false,
      parcelas: parcelasDetalhes ?? [{ ...EMPTY_PARCELA }],
    });
    setModalOpen(true);
  };

  const handleField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleParcelaField = (index: number, field: keyof Parcela, value: string) => {
    setForm((prev) => {
      const updated = [...prev.parcelas];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, parcelas: updated };
    });
  };

  const addParcela = () => {
    setForm((prev) => ({
      ...prev,
      parcelas: [...prev.parcelas, { ...EMPTY_PARCELA }],
    }));
  };

  const removeParcela = (index: number) => {
    setForm((prev) => ({
      ...prev,
      parcelas: prev.parcelas.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.nome_cliente ||
      !form.numero_conta_anuncio ||
      !form.numero_whatsapp_cliente ||
      !form.numero_grupo_whatsapp ||
      !form.valor_mensalidade ||
      !form.dia_vencimento
    ) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }

    setSubmitting(true);
    try {
      const valorEfetivo = form.plano_personalizado
        ? parseFloat(form.parcelas[0]?.valor || '0')
        : parseFloat(form.valor_mensalidade);

      const payload = {
        nome_cliente: form.nome_cliente,
        numero_conta_anuncio: form.numero_conta_anuncio,
        segmento: form.segmento || null,
        responsavel_interno: form.responsavel_interno || null,
        numero_whatsapp_cliente: form.numero_whatsapp_cliente,
        numero_grupo_whatsapp: form.numero_grupo_whatsapp,
        valor_mensalidade: valorEfetivo,
        tipo_contrato: form.tipo_contrato,
        dia_vencimento: parseInt(form.dia_vencimento),
        data_inicio: form.data_inicio,
        data_fim: form.data_fim || null,
        limite_minimo_saldo: parseFloat(form.limite_minimo_saldo) || 58,
        observacoes: form.observacoes || null,
        plano_personalizado: form.plano_personalizado,
        parcelas_detalhes: form.plano_personalizado ? form.parcelas : null,
      };

      if (editingId) {
        const { error } = await supabaseGestao
          .from('gestao_clientes')
          .update(payload)
          .eq('id', editingId);
        if (error) throw error;
        toast.success('Cliente atualizado com sucesso!');
        setModalOpen(false);
        fetchClientes();
        return;
      }

      const { data: novoCliente, error } = await supabaseGestao
        .from('gestao_clientes')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;

      const nc = novoCliente as GestaoCliente;

      const webhookPayload = {
        action: 'novo_cliente',
        id: nc.id,
        timestamp: new Date().toISOString(),
        clientName: nc.nome_cliente,
        accountId: nc.numero_conta_anuncio,
        numero: nc.numero_grupo_whatsapp,
        limiteMinimo: nc.limite_minimo_saldo,
        numero_whatsapp_cliente: nc.numero_whatsapp_cliente,
        valor_mensalidade: nc.valor_mensalidade,
        dia_vencimento: nc.dia_vencimento,
        tipo_contrato: nc.tipo_contrato,
        data_inicio: nc.data_inicio,
        responsavel_interno: nc.responsavel_interno,
        segmento: nc.segmento,
        plano_personalizado: form.plano_personalizado,
        parcelas_detalhes: form.plano_personalizado ? form.parcelas : null,
      };

      try {
        await fetch(
          'https://n8n.trafficsolutions.cloud/webhook/novo-cliente-cadastrado',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(webhookPayload),
          }
        );
        await supabaseGestao
          .from('gestao_clientes')
          .update({ webhook_cadastro_disparado: true })
          .eq('id', nc.id);
      } catch {
        // webhook failure is non-blocking
      }

      toast.success(
        'Cliente cadastrado! Os fluxos de automação serão criados em instantes.'
      );
      setModalOpen(false);
      fetchClientes();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : 'Erro ao salvar cliente.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (c: GestaoCliente) => {
    const next: GestaoCliente['status'] = c.status === 'ativo' ? 'pausado' : 'ativo';
    const { error } = await supabaseGestao
      .from('gestao_clientes')
      .update({ status: next })
      .eq('id', c.id);
    if (error) {
      toast.error('Erro ao atualizar status.');
    } else {
      toast.success(`Cliente ${next === 'ativo' ? 'ativado' : 'pausado'}.`);
      fetchClientes();
    }
  };

  const confirmarCobranca = async () => {
    if (!cobrarCliente) return;
    setCobrandoId(cobrarCliente.id);
    try {
      await fetch('https://n8n.trafficsolutions.cloud/webhook/cobrar-cliente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cobrar_cliente',
          timestamp: new Date().toISOString(),
          id: cobrarCliente.id,
          nome_cliente: cobrarCliente.nome_cliente,
          numero_conta_anuncio: cobrarCliente.numero_conta_anuncio,
          numero_whatsapp_cliente: cobrarCliente.numero_whatsapp_cliente,
          numero_grupo_whatsapp: cobrarCliente.numero_grupo_whatsapp,
          valor_mensalidade: cobrarCliente.valor_mensalidade,
          dia_vencimento: cobrarCliente.dia_vencimento,
          tipo_contrato: cobrarCliente.tipo_contrato,
        }),
      });
      toast.success(
        `Cobrança enviada para ${cobrarCliente.nome_cliente} via WhatsApp!`
      );
    } catch {
      toast.error('Erro ao enviar cobrança.');
    } finally {
      setCobrandoId(null);
      setCobrarCliente(null);
    }
  };

  const fmtMoney = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/15 border border-blue-500/20">
            <Users className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Gestão de Clientes</h1>
            <p className="text-sm text-gray-500 mt-0.5">Contratos, automações e cobranças</p>
          </div>
        </div>
        <Button
          onClick={openCreate}
          className="bg-[#3b82f6] hover:bg-blue-600 text-white gap-2"
        >
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard icon={Users} label="Total de Clientes" value={kpis.total} />
        <KpiCard
          icon={TrendingUp}
          label="Clientes Ativos"
          value={kpis.ativos}
          accent="bg-green-500/15"
        />
        <KpiCard
          icon={DollarSign}
          label="MRR Total"
          value={fmtMoney(kpis.mrr)}
          accent="bg-emerald-500/15"
        />
        <KpiCard
          icon={Calendar}
          label="Vencendo esta semana"
          value={kpis.vencendoSemana}
          accent="bg-orange-500/15"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar por nome ou conta..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`pl-9 ${inputCls}`}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className={`w-40 ${inputCls}`}>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-[#0f0f0f] border-white/10 text-white">
            <SelectItem value="todos">Todos status</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="pausado">Pausado</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterContrato} onValueChange={setFilterContrato}>
          <SelectTrigger className={`w-44 ${inputCls}`}>
            <SelectValue placeholder="Contrato" />
          </SelectTrigger>
          <SelectContent className="bg-[#0f0f0f] border-white/10 text-white">
            <SelectItem value="todos">Todos contratos</SelectItem>
            <SelectItem value="semanal">Semanal</SelectItem>
            <SelectItem value="mensal">Mensal</SelectItem>
            <SelectItem value="trimestral">Trimestral</SelectItem>
            <SelectItem value="semestral">Semestral</SelectItem>
            <SelectItem value="anual">Anual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                {[
                  '#',
                  'Nome',
                  'Conta Anúncio',
                  'WhatsApp',
                  'Valor',
                  'Vencimento',
                  'Status',
                  'Fluxos',
                  'Ações',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                    Carregando...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              ) : (
                filtered.map((c, i) => (
                  <>
                    <tr
                      key={c.id}
                      className="border-b border-white/5 hover:bg-white/3 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-500 text-sm">{i + 1}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-white">{c.nome_cliente}</p>
                          {c.segmento && (
                            <p className="text-xs text-gray-500">{c.segmento}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400 font-mono">
                        {c.numero_conta_anuncio}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400 font-mono">
                        {c.numero_whatsapp_cliente}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-white">
                        {fmtMoney(c.valor_mensalidade)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        Dia {c.dia_vencimento}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-4 py-3">
                        <FluxosBadge criados={c.fluxos_criados} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() =>
                                  setExpandedId(expandedId === c.id ? null : c.id)
                                }
                                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                              >
                                {expandedId === c.id ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Ver detalhes</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => setCobrarCliente(c)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-green-400 hover:bg-green-500/10 transition-colors"
                              >
                                <MessageSquare className="h-4 w-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Cobrar cliente</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => openEdit(c)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Editar</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => toggleStatus(c)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10 transition-colors"
                              >
                                {c.status === 'ativo' ? (
                                  <PauseCircle className="h-4 w-4" />
                                ) : (
                                  <PlayCircle className="h-4 w-4" />
                                )}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {c.status === 'ativo' ? 'Pausar' : 'Ativar'}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                    {expandedId === c.id && (
                      <tr key={`${c.id}-detail`} className="bg-white/3 border-b border-white/5">
                        <td colSpan={9} className="px-6 py-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500 text-xs mb-1">ID do Grupo WhatsApp</p>
                              <p className="text-white font-mono">{c.numero_grupo_whatsapp}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs mb-1">Tipo de Contrato</p>
                              <p className="text-white capitalize">{c.tipo_contrato}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs mb-1">Início do Contrato</p>
                              <p className="text-white">{c.data_inicio}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs mb-1">Limite Mín. Saldo</p>
                              <p className="text-white">{fmtMoney(c.limite_minimo_saldo)}</p>
                            </div>
                            {c.responsavel_interno && (
                              <div>
                                <p className="text-gray-500 text-xs mb-1">Responsável</p>
                                <p className="text-white">{c.responsavel_interno}</p>
                              </div>
                            )}
                            {c.data_fim && (
                              <div>
                                <p className="text-gray-500 text-xs mb-1">Fim do Contrato</p>
                                <p className="text-white">{c.data_fim}</p>
                              </div>
                            )}
                            {c.observacoes && (
                              <div className="col-span-2">
                                <p className="text-gray-500 text-xs mb-1">Observações</p>
                                <p className="text-white">{c.observacoes}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-gray-500 text-xs mb-1">Webhook disparado</p>
                              <p className={c.webhook_cadastro_disparado ? 'text-green-400' : 'text-yellow-400'}>
                                {c.webhook_cadastro_disparado ? 'Sim' : 'Não'}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-[#0a0a0a] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {editingId ? 'Editar Cliente' : 'Novo Cliente'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-2">
            {/* Identificação */}
            <div>
              <p className={sectionTitleCls}>Identificação</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={labelCls}>
                    Nome do Cliente <span className="text-red-400">*</span>
                  </label>
                  <Input
                    value={form.nome_cliente}
                    onChange={(e) => handleField('nome_cliente', e.target.value)}
                    placeholder="Ex: Livet Indústria"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>
                    Nº Conta de Anúncio Meta
                    <span className="text-red-400">*</span>
                    <TooltipIcon text="ID numérico da conta no Meta Ads. Ex: 705340254145484" />
                  </label>
                  <Input
                    value={form.numero_conta_anuncio}
                    onChange={(e) =>
                      handleField('numero_conta_anuncio', e.target.value)
                    }
                    placeholder="705340254145484"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Segmento</label>
                  <Select
                    value={form.segmento}
                    onValueChange={(v) => handleField('segmento', v)}
                  >
                    <SelectTrigger className={inputCls}>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0f0f0f] border-white/10 text-white">
                      {['Saúde', 'Moda', 'Varejo', 'Educação', 'Serviços', 'Outro'].map(
                        (s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className={labelCls}>Responsável Interno</label>
                  <Input
                    value={form.responsavel_interno}
                    onChange={(e) =>
                      handleField('responsavel_interno', e.target.value)
                    }
                    placeholder="Nome do responsável"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            {/* WhatsApp */}
            <div>
              <p className={sectionTitleCls}>WhatsApp</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>
                    Nº WhatsApp do Cliente <span className="text-red-400">*</span>
                    <TooltipIcon text="Número pessoal do cliente, usado para cobrança. Ex: 5585999999999" />
                  </label>
                  <Input
                    value={form.numero_whatsapp_cliente}
                    onChange={(e) =>
                      handleField('numero_whatsapp_cliente', e.target.value)
                    }
                    placeholder="5585999999999"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>
                    ID do Grupo WhatsApp <span className="text-red-400">*</span>
                    <TooltipIcon text="ID do grupo onde os alertas e relatórios são enviados. Encontre em: abrir grupo no WhatsApp Web → a URL contém o ID." />
                  </label>
                  <Input
                    value={form.numero_grupo_whatsapp}
                    onChange={(e) =>
                      handleField('numero_grupo_whatsapp', e.target.value)
                    }
                    placeholder="120363425141584579"
                    className={inputCls}
                  />
                  <p className="text-xs text-gray-600 mt-1.5">
                    Este ID é usado nos fluxos automáticos de alerta de saldo e relatório diário.
                  </p>
                </div>
              </div>
            </div>

            {/* Contrato & Financeiro */}
            <div>
              <p className={sectionTitleCls}>Contrato & Financeiro</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>
                    Valor da Mensalidade (R$) <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    readOnly={form.plano_personalizado}
                    value={
                      form.plano_personalizado
                        ? form.parcelas[0]?.valor || ''
                        : form.valor_mensalidade
                    }
                    onChange={(e) =>
                      !form.plano_personalizado &&
                      handleField('valor_mensalidade', e.target.value)
                    }
                    placeholder="1500.00"
                    className={`${inputCls} ${form.plano_personalizado ? 'opacity-60 cursor-not-allowed' : ''}`}
                  />
                </div>
                <div>
                  <label className={labelCls}>
                    Tipo de Contrato <span className="text-red-400">*</span>
                  </label>
                  <Select
                    value={form.tipo_contrato}
                    onValueChange={(v) =>
                      handleField(
                        'tipo_contrato',
                        v as FormData['tipo_contrato']
                      )
                    }
                  >
                    <SelectTrigger className={inputCls}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0f0f0f] border-white/10 text-white">
                      <SelectItem value="semanal">Semanal</SelectItem>
                      <SelectItem value="mensal">Mensal</SelectItem>
                      <SelectItem value="trimestral">Trimestral</SelectItem>
                      <SelectItem value="semestral">Semestral</SelectItem>
                      <SelectItem value="anual">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Toggle plano personalizado */}
                <div className="col-span-2">
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        plano_personalizado: !prev.plano_personalizado,
                      }))
                    }
                    className="flex items-center gap-3 group"
                  >
                    <span
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        form.plano_personalizado ? 'bg-blue-500' : 'bg-white/20'
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                          form.plano_personalizado ? 'translate-x-5' : ''
                        }`}
                      />
                    </span>
                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                      Plano de parcelas personalizado
                    </span>
                  </button>
                </div>

                {/* Painel de parcelas */}
                {form.plano_personalizado && (
                  <div className="col-span-2 space-y-3">
                    {form.parcelas.map((p, i) => (
                      <div
                        key={i}
                        className="border border-white/10 rounded-lg p-4"
                      >
                        <div className="grid grid-cols-3 gap-3 items-end">
                          <div>
                            <label className={labelCls}>Parcelas</label>
                            <Input
                              type="number"
                              min="1"
                              value={p.parcelas}
                              onChange={(e) =>
                                handleParcelaField(i, 'parcelas', e.target.value)
                              }
                              placeholder="3"
                              className={inputCls}
                            />
                          </div>
                          <div>
                            <label className={labelCls}>Valor R$</label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={p.valor}
                              onChange={(e) =>
                                handleParcelaField(i, 'valor', e.target.value)
                              }
                              placeholder="500.00"
                              className={inputCls}
                            />
                          </div>
                          <div className="flex gap-2 items-end">
                            <div className="flex-1">
                              <label className={labelCls}>Início</label>
                              <Input
                                type="date"
                                value={p.inicio}
                                onChange={(e) =>
                                  handleParcelaField(i, 'inicio', e.target.value)
                                }
                                className={inputCls}
                              />
                            </div>
                            {form.parcelas.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeParcela(i)}
                                className="mb-0.5 p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={addParcela}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-sm text-gray-400 hover:text-white hover:border-white/20 hover:bg-white/5 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        Adicionar grupo de parcelas
                      </button>
                    </div>

                    {/* Linha do tempo */}
                    {(() => {
                      const grupos = form.parcelas.filter(
                        (p) => p.parcelas && p.valor
                      );
                      if (grupos.length === 0) return null;
                      const total = grupos.reduce(
                        (acc, p) =>
                          acc + parseInt(p.parcelas || '0') * parseFloat(p.valor || '0'),
                        0
                      );
                      return (
                        <div className="border border-white/10 rounded-lg p-4 space-y-2">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            Linha do tempo:
                          </p>
                          {grupos.map((p, i) => {
                            const data = p.inicio
                              ? new Date(p.inicio + 'T00:00:00').toLocaleDateString('pt-BR')
                              : '—';
                            const val = parseFloat(p.valor || '0').toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            });
                            return (
                              <p key={i} className="text-sm text-gray-300">
                                {p.parcelas}x de {val} — a partir de {data}
                              </p>
                            );
                          })}
                          <div className="pt-2 border-t border-white/10">
                            <p className="text-sm font-semibold text-white">
                              Total:{' '}
                              {total.toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                <div>
                  <label className={labelCls}>
                    Dia de Vencimento <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    value={form.dia_vencimento}
                    onChange={(e) =>
                      handleField('dia_vencimento', e.target.value)
                    }
                    placeholder="10"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>
                    Data de Início <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="date"
                    value={form.data_inicio}
                    onChange={(e) => handleField('data_inicio', e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Data de Fim</label>
                  <Input
                    type="date"
                    value={form.data_fim}
                    onChange={(e) => handleField('data_fim', e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            {/* Meta Ads */}
            <div>
              <p className={sectionTitleCls}>Configurações Meta Ads</p>
              <div className="max-w-xs">
                <label className={labelCls}>
                  Limite Mínimo de Saldo (R$)
                  <TooltipIcon text="Quando o saldo da conta cair abaixo deste valor, o alerta será disparado automaticamente." />
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.limite_minimo_saldo}
                  onChange={(e) =>
                    handleField('limite_minimo_saldo', e.target.value)
                  }
                  placeholder="58.00"
                  className={inputCls}
                />
              </div>
            </div>

            {/* Observações */}
            <div>
              <p className={sectionTitleCls}>Observações</p>
              <textarea
                value={form.observacoes}
                onChange={(e) => handleField('observacoes', e.target.value)}
                placeholder="Anotações internas..."
                rows={3}
                className={`w-full rounded-md border px-3 py-2 text-sm resize-none ${inputCls}`}
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-[#3b82f6] hover:bg-blue-600 text-white"
              >
                {submitting
                  ? 'Salvando...'
                  : editingId
                  ? 'Salvar Alterações'
                  : 'Cadastrar Cliente'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Cobrar Dialog */}
      <Dialog
        open={!!cobrarCliente}
        onOpenChange={(o) => !o && setCobrarCliente(null)}
      >
        <DialogContent className="bg-[#0a0a0a] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Cobrança</DialogTitle>
          </DialogHeader>
          {cobrarCliente && (
            <div className="space-y-3 my-2">
              <div className="bg-white/5 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Cliente</span>
                  <span className="text-white font-medium">
                    {cobrarCliente.nome_cliente}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Valor</span>
                  <span className="text-white font-medium">
                    {fmtMoney(cobrarCliente.valor_mensalidade)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Vencimento</span>
                  <span className="text-white">Dia {cobrarCliente.dia_vencimento}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">WhatsApp</span>
                  <span className="text-white font-mono text-xs">
                    {cobrarCliente.numero_whatsapp_cliente}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Uma mensagem de cobrança será enviada via WhatsApp para o número acima.
              </p>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setCobrarCliente(null)}
              className="text-gray-400 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmarCobranca}
              disabled={cobrandoId !== null}
              className="bg-[#3b82f6] hover:bg-blue-600 text-white"
            >
              {cobrandoId ? 'Enviando...' : 'Enviar Cobrança'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
