import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Users, Phone, UserCheck, ShoppingCart, TrendingUp,
  Search, RefreshCw, ChevronDown, ChevronUp, MessageSquare,
  Star, AlertCircle, CheckCircle2, Clock, XCircle,
  Filter,
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

interface Lead {
  id: string;
  nome: string;
  telefone: string | null;
  atendente: string | null;
  comprou: boolean | null;
  nivel_conversa: string | null;
  interesse_cliente: string | null;
  nivel_atendimento: string | null;
  status: string | null;
  notas: string | null;
  origem: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_OPTIONS = ['Novo', 'Em Andamento', 'Aguardando', 'Fechado', 'Perdido'];
const NIVEL_CONVERSA_OPTIONS = ['Inicial', 'Qualificado', 'Negociação', 'Proposta Enviada', 'Fechamento'];
const INTERESSE_OPTIONS = ['Baixo', 'Médio', 'Alto', 'Muito Alto'];
const NIVEL_ATENDIMENTO_OPTIONS = ['Ruim', 'Regular', 'Bom', 'Excelente'];

const STATUS_COLORS: Record<string, string> = {
  'Novo': '#3b82f6',
  'Em Andamento': '#f59e0b',
  'Aguardando': '#8b5cf6',
  'Fechado': '#10b981',
  'Perdido': '#ef4444',
};

const INTERESSE_COLORS: Record<string, string> = {
  'Baixo': '#ef4444',
  'Médio': '#f59e0b',
  'Alto': '#3b82f6',
  'Muito Alto': '#10b981',
};

const StatusIcon = ({ status }: { status: string | null }) => {
  switch (status) {
    case 'Novo': return <Clock className="h-4 w-4 text-blue-400" />;
    case 'Em Andamento': return <TrendingUp className="h-4 w-4 text-yellow-400" />;
    case 'Aguardando': return <AlertCircle className="h-4 w-4 text-purple-400" />;
    case 'Fechado': return <CheckCircle2 className="h-4 w-4 text-green-400" />;
    case 'Perdido': return <XCircle className="h-4 w-4 text-red-400" />;
    default: return <Clock className="h-4 w-4 text-gray-400" />;
  }
};

const InteresseBadge = ({ interesse }: { interesse: string | null }) => {
  const color = INTERESSE_COLORS[interesse || 'Médio'] || '#6b7280';
  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}
    >
      {interesse || 'N/A'}
    </span>
  );
};

const NivelAtendimentoBadge = ({ nivel }: { nivel: string | null }) => {
  const colorMap: Record<string, string> = {
    'Ruim': '#ef4444', 'Regular': '#f59e0b', 'Bom': '#3b82f6', 'Excelente': '#10b981',
  };
  const color = colorMap[nivel || ''] || '#6b7280';
  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}
    >
      {nivel || 'N/A'}
    </span>
  );
};

export default function LeadsDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterInteresse, setFilterInteresse] = useState<string>('all');
  const [filterComprou, setFilterComprou] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'created_at' | 'nome'>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const fetchLeads = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setLeads(data as Lead[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const filtered = useMemo(() => {
    let result = [...leads];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(l =>
        l.nome.toLowerCase().includes(q) ||
        l.atendente?.toLowerCase().includes(q) ||
        l.telefone?.includes(q)
      );
    }
    if (filterStatus !== 'all') result = result.filter(l => l.status === filterStatus);
    if (filterInteresse !== 'all') result = result.filter(l => l.interesse_cliente === filterInteresse);
    if (filterComprou === 'sim') result = result.filter(l => l.comprou === true);
    if (filterComprou === 'nao') result = result.filter(l => l.comprou !== true);

    result.sort((a, b) => {
      const valA = sortField === 'nome' ? a.nome : a.created_at;
      const valB = sortField === 'nome' ? b.nome : b.created_at;
      return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

    return result;
  }, [leads, search, filterStatus, filterInteresse, filterComprou, sortField, sortDir]);

  // KPIs
  const totalLeads = leads.length;
  const totalComprou = leads.filter(l => l.comprou).length;
  const taxaConversao = totalLeads > 0 ? ((totalComprou / totalLeads) * 100).toFixed(1) : '0';
  const emAndamento = leads.filter(l => l.status === 'Em Andamento').length;
  const novos = leads.filter(l => l.status === 'Novo').length;

  // Charts data
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach(l => {
      const s = l.status || 'Novo';
      counts[s] = (counts[s] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name, value, color: STATUS_COLORS[name] || '#6b7280',
    }));
  }, [leads]);

  const interesseData = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach(l => {
      const i = l.interesse_cliente || 'Médio';
      counts[i] = (counts[i] || 0) + 1;
    });
    return INTERESSE_OPTIONS.map(name => ({
      name, value: counts[name] || 0, color: INTERESSE_COLORS[name],
    }));
  }, [leads]);

  const toggleSort = (field: 'created_at' | 'nome') => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Painel de Leads & Conversas
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Resumo completo de conversas, leads e atendimentos
          </p>
        </div>
        <Button
          onClick={fetchLeads}
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
          { title: 'Total de Leads', value: totalLeads, icon: Users, color: '#3b82f6' },
          { title: 'Novos', value: novos, icon: Clock, color: '#8b5cf6' },
          { title: 'Em Andamento', value: emAndamento, icon: MessageSquare, color: '#f59e0b' },
          { title: 'Compraram', value: totalComprou, icon: ShoppingCart, color: '#10b981' },
          { title: 'Taxa Conversão', value: `${taxaConversao}%`, icon: TrendingUp, color: '#ec4899' },
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
        {/* Status Distribution */}
        <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Distribuição por Status</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {statusData.map(s => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                {s.name} ({s.value})
              </div>
            ))}
          </div>
        </div>

        {/* Interest Level */}
        <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Nível de Interesse</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={interesseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {interesseData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
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
              placeholder="Buscar por nome, atendente ou telefone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-gray-300">
                <Filter className="h-3.5 w-3.5 mr-1.5" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
                {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterInteresse} onValueChange={setFilterInteresse}>
              <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-gray-300">
                <Star className="h-3.5 w-3.5 mr-1.5" />
                <SelectValue placeholder="Interesse" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo Interesse</SelectItem>
                {INTERESSE_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterComprou} onValueChange={setFilterComprou}>
              <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-gray-300">
                <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                <SelectValue placeholder="Comprou?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="sim">Comprou</SelectItem>
                <SelectItem value="nao">Não comprou</SelectItem>
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
                  { label: 'Nome', field: 'nome' as const },
                  { label: 'Telefone', field: null },
                  { label: 'Atendente', field: null },
                  { label: 'Status', field: null },
                  { label: 'Interesse', field: null },
                  { label: 'Atendimento', field: null },
                  { label: 'Nível Conversa', field: null },
                  { label: 'Comprou?', field: null },
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
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-white/5 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    Nenhum lead encontrado
                  </td>
                </tr>
              ) : (
                filtered.map(lead => (
                  <tr
                    key={lead.id}
                    className="border-b border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer"
                    onClick={() => setExpandedId(expandedId === lead.id ? null : lead.id)}
                  >
                    <td className="px-4 py-3 font-medium text-white">{lead.nome}</td>
                    <td className="px-4 py-3 text-gray-400">
                      {lead.telefone ? (
                        <span className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5" />
                          {lead.telefone}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {lead.atendente ? (
                        <span className="flex items-center gap-1.5">
                          <UserCheck className="h-3.5 w-3.5 text-blue-400" />
                          {lead.atendente}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5">
                        <StatusIcon status={lead.status} />
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{
                            background: `${STATUS_COLORS[lead.status || ''] || '#6b7280'}22`,
                            color: STATUS_COLORS[lead.status || ''] || '#6b7280',
                          }}
                        >
                          {lead.status || 'N/A'}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <InteresseBadge interesse={lead.interesse_cliente} />
                    </td>
                    <td className="px-4 py-3">
                      <NivelAtendimentoBadge nivel={lead.nivel_atendimento} />
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{lead.nivel_conversa || 'Inicial'}</td>
                    <td className="px-4 py-3">
                      {lead.comprou ? (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30">Sim</Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500 border-white/10">Não</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-500">
          <span>Exibindo {filtered.length} de {totalLeads} leads</span>
        </div>
      </div>
    </div>
  );
}
