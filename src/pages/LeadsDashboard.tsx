import { useState, useEffect, useMemo } from 'react';
import {
  Users, Phone, UserCheck, ShoppingCart, TrendingUp,
  Search, RefreshCw, ChevronDown, ChevronUp, MessageSquare,
  Star, AlertCircle, CheckCircle2, Clock, XCircle,
  Filter, ThumbsUp, ThumbsDown, ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

interface ResumoLead {
  id: number;
  lead_id: number;
  vendedor_id: number;
  periodo_inicio: string;
  periodo_fim: string;
  resumo: string;
  qualidade_lead: number;
  qualidade_vendedor: number;
  pontos_positivos_vendedor: string;
  erros_vendedor: string;
  vendeu: boolean;
  motivo_nao_venda: string | null;
  valor_vendido: number | null;
  proximo_passo_sugerido: string | null;
  created_at: string;
  fez_followup: boolean | null;
}

const parseJsonArray = (val: string | null): string[] => {
  if (!val) return [];
  try { return JSON.parse(val); } catch { return []; }
};

const qualidadeColor = (q: number): string => {
  if (q >= 8) return '#10b981';
  if (q >= 5) return '#f59e0b';
  return '#ef4444';
};

const qualidadeLabel = (q: number): string => {
  if (q >= 8) return 'Alto';
  if (q >= 5) return 'Médio';
  return 'Baixo';
};

export default function LeadsDashboard() {
  const [resumos, setResumos] = useState<ResumoLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterVendeu, setFilterVendeu] = useState<string>('all');
  const [filterQualidadeLead, setFilterQualidadeLead] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [sortField, setSortField] = useState<'created_at' | 'qualidade_lead'>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const fetchResumos = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://n8n.trafficsolutions.cloud/webhook/busca-resumos');
      if (res.ok) {
        const data = await res.json();
        setResumos(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Erro ao buscar resumos:', err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchResumos(); }, []);

  const filtered = useMemo(() => {
    let result = [...resumos];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(r =>
        r.resumo.toLowerCase().includes(q) ||
        r.proximo_passo_sugerido?.toLowerCase().includes(q) ||
        r.motivo_nao_venda?.toLowerCase().includes(q)
      );
    }
    if (filterVendeu === 'sim') result = result.filter(r => r.vendeu === true);
    if (filterVendeu === 'nao') result = result.filter(r => r.vendeu !== true);
    if (filterQualidadeLead === 'alto') result = result.filter(r => r.qualidade_lead >= 8);
    if (filterQualidadeLead === 'medio') result = result.filter(r => r.qualidade_lead >= 5 && r.qualidade_lead < 8);
    if (filterQualidadeLead === 'baixo') result = result.filter(r => r.qualidade_lead < 5);

    result.sort((a, b) => {
      if (sortField === 'qualidade_lead') {
        return sortDir === 'asc' ? a.qualidade_lead - b.qualidade_lead : b.qualidade_lead - a.qualidade_lead;
      }
      return sortDir === 'asc'
        ? a.created_at.localeCompare(b.created_at)
        : b.created_at.localeCompare(a.created_at);
    });

    return result;
  }, [resumos, search, filterVendeu, filterQualidadeLead, sortField, sortDir]);

  // KPIs
  const total = resumos.length;
  const totalVendeu = resumos.filter(r => r.vendeu).length;
  const taxaConversao = total > 0 ? ((totalVendeu / total) * 100).toFixed(1) : '0';
  const avgQualidadeLead = total > 0 ? (resumos.reduce((s, r) => s + r.qualidade_lead, 0) / total).toFixed(1) : '0';
  const avgQualidadeVendedor = total > 0 ? (resumos.reduce((s, r) => s + r.qualidade_vendedor, 0) / total).toFixed(1) : '0';

  // Charts
  const vendaData = useMemo(() => {
    const vendeu = resumos.filter(r => r.vendeu).length;
    const naoVendeu = resumos.filter(r => !r.vendeu).length;
    return [
      { name: 'Vendeu', value: vendeu, color: '#10b981' },
      { name: 'Não Vendeu', value: naoVendeu, color: '#ef4444' },
    ].filter(d => d.value > 0);
  }, [resumos]);

  const qualidadeLeadData = useMemo(() => {
    const alto = resumos.filter(r => r.qualidade_lead >= 8).length;
    const medio = resumos.filter(r => r.qualidade_lead >= 5 && r.qualidade_lead < 8).length;
    const baixo = resumos.filter(r => r.qualidade_lead < 5).length;
    return [
      { name: 'Alto (8-10)', value: alto, color: '#10b981' },
      { name: 'Médio (5-7)', value: medio, color: '#f59e0b' },
      { name: 'Baixo (1-4)', value: baixo, color: '#ef4444' },
    ];
  }, [resumos]);

  const toggleSort = (field: 'created_at' | 'qualidade_lead') => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Painel de Resumos & Conversas
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Análise completa de conversas, qualidade de leads e vendedores
          </p>
        </div>
        <Button
          onClick={fetchResumos}
          variant="outline"
          className="border-white/10 text-gray-300 hover:bg-white/5 hover:text-white gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { title: 'Total Resumos', value: total, icon: Users, color: '#3b82f6' },
          { title: 'Vendas', value: totalVendeu, icon: ShoppingCart, color: '#10b981' },
          { title: 'Taxa Conversão', value: `${taxaConversao}%`, icon: TrendingUp, color: '#ec4899' },
          { title: 'Qual. Lead (Média)', value: avgQualidadeLead, icon: Star, color: '#f59e0b' },
          { title: 'Qual. Vendedor (Média)', value: avgQualidadeVendedor, icon: UserCheck, color: '#8b5cf6' },
        ].map(kpi => (
          <div
            key={kpi.title}
            className="bg-white/5 backdrop-blur-xl rounded-xl p-5 border border-white/10 hover:bg-white/[0.08] transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-400 font-medium">{kpi.title}</p>
                <p className="text-2xl font-bold text-white mt-1">{kpi.value}</p>
              </div>
              <div className="p-2.5 rounded-lg" style={{ background: `${kpi.color}20` }}>
                <kpi.icon className="h-5 w-5" style={{ color: kpi.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Conversão de Vendas</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={vendaData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {vendaData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {vendaData.map(s => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                {s.name} ({s.value})
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Qualidade dos Leads</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={qualidadeLeadData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {qualidadeLeadData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10 mb-6">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar no resumo, motivo ou próximo passo..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select value={filterVendeu} onValueChange={setFilterVendeu}>
              <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-gray-300">
                <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                <SelectValue placeholder="Vendeu?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="sim">Vendeu</SelectItem>
                <SelectItem value="nao">Não vendeu</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterQualidadeLead} onValueChange={setFilterQualidadeLead}>
              <SelectTrigger className="w-[160px] bg-white/5 border-white/10 text-gray-300">
                <Star className="h-3.5 w-3.5 mr-1.5" />
                <SelectValue placeholder="Qual. Lead" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Qualidades</SelectItem>
                <SelectItem value="alto">Alto (8-10)</SelectItem>
                <SelectItem value="medio">Médio (5-7)</SelectItem>
                <SelectItem value="baixo">Baixo (1-4)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {[
                  { label: 'ID', field: null },
                  { label: 'Resumo', field: null },
                  { label: 'Qual. Lead', field: 'qualidade_lead' as const },
                  { label: 'Qual. Vendedor', field: null },
                  { label: 'Vendeu?', field: null },
                  { label: 'Valor', field: null },
                  { label: 'Follow-up', field: null },
                  { label: 'Data', field: 'created_at' as const },
                ].map(col => (
                  <th
                    key={col.label}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                    onClick={() => col.field && toggleSort(col.field)}
                  >
                    <span className="flex items-center gap-1">
                      {col.label}
                      {col.field && sortField === col.field && (
                        sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-white/5 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    Nenhum resumo encontrado
                  </td>
                </tr>
              ) : (
                filtered.map(r => {
                  const isExpanded = expandedId === r.id;
                  const pontosPositivos = parseJsonArray(r.pontos_positivos_vendedor);
                  const erros = parseJsonArray(r.erros_vendedor);
                  const leadColor = qualidadeColor(r.qualidade_lead);
                  const vendedorColor = qualidadeColor(r.qualidade_vendedor);

                  return (
                    <>
                      <tr
                        key={r.id}
                        className="border-b border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer"
                        onClick={() => setExpandedId(isExpanded ? null : r.id)}
                      >
                        <td className="px-4 py-3 text-gray-500 font-mono text-xs">#{r.id}</td>
                        <td className="px-4 py-3 text-gray-300 max-w-xs">
                          <p className="truncate">{r.resumo}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="text-xs font-bold px-2.5 py-1 rounded-full"
                            style={{ background: `${leadColor}22`, color: leadColor, border: `1px solid ${leadColor}44` }}
                          >
                            {r.qualidade_lead}/10
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="text-xs font-bold px-2.5 py-1 rounded-full"
                            style={{ background: `${vendedorColor}22`, color: vendedorColor, border: `1px solid ${vendedorColor}44` }}
                          >
                            {r.qualidade_vendedor}/10
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {r.vendeu ? (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30">Sim</Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-500 border-white/10">Não</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs">
                          {r.valor_vendido != null ? `R$ ${r.valor_vendido.toLocaleString('pt-BR')}` : '—'}
                        </td>
                        <td className="px-4 py-3">
                          {r.fez_followup === true ? (
                            <CheckCircle2 className="h-4 w-4 text-green-400" />
                          ) : r.fez_followup === false ? (
                            <XCircle className="h-4 w-4 text-red-400" />
                          ) : (
                            <Clock className="h-4 w-4 text-gray-500" />
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {new Date(r.created_at).toLocaleDateString('pt-BR')}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr key={`${r.id}-detail`} className="border-b border-white/5 bg-white/[0.02]">
                          <td colSpan={8} className="px-6 py-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Resumo completo */}
                              <div>
                                <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2 flex items-center gap-1.5">
                                  <MessageSquare className="h-3.5 w-3.5" /> Resumo da Conversa
                                </h4>
                                <p className="text-sm text-gray-300 leading-relaxed">{r.resumo}</p>

                                {r.motivo_nao_venda && (
                                  <div className="mt-4">
                                    <h4 className="text-xs font-semibold text-red-400 uppercase mb-1 flex items-center gap-1.5">
                                      <XCircle className="h-3.5 w-3.5" /> Motivo da Não Venda
                                    </h4>
                                    <p className="text-sm text-gray-400">{r.motivo_nao_venda}</p>
                                  </div>
                                )}

                                {r.proximo_passo_sugerido && (
                                  <div className="mt-4">
                                    <h4 className="text-xs font-semibold text-blue-400 uppercase mb-1 flex items-center gap-1.5">
                                      <ArrowRight className="h-3.5 w-3.5" /> Próximo Passo Sugerido
                                    </h4>
                                    <p className="text-sm text-gray-300">{r.proximo_passo_sugerido}</p>
                                  </div>
                                )}
                              </div>

                              {/* Avaliação do vendedor */}
                              <div>
                                {pontosPositivos.length > 0 && (
                                  <div className="mb-4">
                                    <h4 className="text-xs font-semibold text-green-400 uppercase mb-2 flex items-center gap-1.5">
                                      <ThumbsUp className="h-3.5 w-3.5" /> Pontos Positivos do Vendedor
                                    </h4>
                                    <ul className="space-y-1">
                                      {pontosPositivos.map((p, i) => (
                                        <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                                          {p}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {erros.length > 0 && (
                                  <div>
                                    <h4 className="text-xs font-semibold text-red-400 uppercase mb-2 flex items-center gap-1.5">
                                      <ThumbsDown className="h-3.5 w-3.5" /> Erros do Vendedor
                                    </h4>
                                    <ul className="space-y-1">
                                      {erros.map((e, i) => (
                                        <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                                          <AlertCircle className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                                          {e}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                <div className="mt-4 flex gap-4 text-xs text-gray-500">
                                  <span>Lead ID: {r.lead_id}</span>
                                  <span>Vendedor ID: {r.vendedor_id}</span>
                                  <span>Período: {new Date(r.periodo_inicio).toLocaleDateString('pt-BR')} – {new Date(r.periodo_fim).toLocaleDateString('pt-BR')}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-500">
          <span>Exibindo {filtered.length} de {total} resumos</span>
        </div>
      </div>
    </div>
  );
}
