import { useState, useEffect } from 'react';
import {
  Users, Activity, CheckCircle2, XCircle, TrendingUp, RefreshCw, Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  XAxis, YAxis, CartesianGrid,
} from 'recharts';

const SUPABASE_URL = 'https://ffqucgvdqnyrlidylgkr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmcXVjZ3ZkcW55cmxpZHlsZ2tyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MjU5MjcsImV4cCI6MjA5NjAwMTkyN30.TQwa3KgLbNt_vgx6PfguwKiI0eqn5Be1GQCE94RTzhQ';

interface PipelineStats {
  total: number;
  ganhos: number;
  perdidos: number;
}

interface SnapshotData {
  gerado_em: string;
  total_leads: number;
  total_ganhos: number;
  total_perdidos: number;
  taxa_conversao: number;
  ativos: number;
  por_pipeline: Record<string, PipelineStats>;
  por_etapa: Record<string, number>;
  por_responsavel: Record<string, number>;
  por_especialidade: Record<string, number>;
  por_motivo_perda: Record<string, number>;
  por_utm_source: Record<string, number>;
  por_mes: Record<string, number>;
  por_pagamento: Record<string, number>;
}

const PIPELINES = [
  'Funil de Vendas',
  'Funil Jeane',
  'Funil Carina',
  'Funil Números Novos',
  'Confirmações Amigo',
];

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
const SPECIALTY_COLORS = ['#06b6d4', '#10b981', '#f59e0b', '#6b7280'];
const UTM_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#ef4444', '#06b6d4'];

const tooltipStyle = {
  background: '#111111',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  color: '#fff',
  fontSize: 12,
};

const formatMes = (mesAno: string): string => {
  const [year, month] = mesAno.split('-');
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${months[parseInt(month) - 1]}/${year.slice(2)}`;
};

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

const toChartData = (obj: Record<string, number>) =>
  Object.entries(obj).map(([name, value]) => ({ name, value }));

const topN = (obj: Record<string, number>, n: number) =>
  Object.entries(obj)
    .sort(([, a], [, b]) => b - a)
    .slice(0, n)
    .map(([name, value]) => ({ name, value }));

export default function NucleoOftalmologiaDashboard() {
  const [snapshot, setSnapshot] = useState<SnapshotData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/dashboard_snapshots?select=data,created_at&order=created_at.desc&limit=1`,
        {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
        }
      );
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length > 0 && rows[0].data) {
          setSnapshot(rows[0].data as SnapshotData);
        } else {
          setSnapshot(null);
        }
      }
    } catch (err) {
      console.error('Erro ao buscar snapshot:', err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const mesByMonth = snapshot
    ? Object.entries(snapshot.por_mes)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, value]) => ({ name: formatMes(name), value }))
    : [];

  const pipelineData = snapshot
    ? Object.entries(snapshot.por_pipeline).map(([name, v]) => ({ name, value: v.total }))
    : [];

  const top10Etapas = snapshot ? topN(snapshot.por_etapa, 10) : [];
  const especialidadeData = snapshot ? toChartData(snapshot.por_especialidade) : [];
  const motivoPerdaData = snapshot ? toChartData(snapshot.por_motivo_perda) : [];
  const utmData = snapshot ? toChartData(snapshot.por_utm_source) : [];
  const pagamentoData = snapshot ? toChartData(snapshot.por_pagamento) : [];

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Dashboard — Núcleo de Oftalmologia
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            CRM Kommo · {snapshot ? `Atualizado em: ${formatDate(snapshot.gerado_em)}` : 'Aguardando dados...'}
          </p>
        </div>
        <Button
          onClick={fetchData}
          variant="outline"
          className="border-white/10 text-gray-300 hover:bg-white/5 hover:text-white gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Loading */}
      {loading && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-5 border border-white/10">
                <div className="h-3 bg-white/5 rounded animate-pulse mb-3 w-2/3" />
                <div className="h-7 bg-white/5 rounded animate-pulse w-1/2" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-6 border border-white/10 h-64">
                <div className="h-4 bg-white/5 rounded animate-pulse mb-4 w-1/3" />
                <div className="h-48 bg-white/5 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </>
      )}

      {/* Empty state */}
      {!loading && !snapshot && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Activity className="h-12 w-12 text-gray-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-400">Aguardando primeiro snapshot</h3>
          <p className="text-sm text-gray-600 mt-2 max-w-sm">
            Os dados serão carregados automaticamente após a primeira execução do n8n (todos os dias às 2h da manhã).
          </p>
        </div>
      )}

      {/* Dashboard content */}
      {!loading && snapshot && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[
              { title: 'Total de Leads', value: snapshot.total_leads, icon: Users, color: '#3b82f6' },
              { title: 'Leads Ativos', value: snapshot.ativos, icon: Activity, color: '#8b5cf6' },
              { title: 'Ganhos', value: snapshot.total_ganhos, icon: CheckCircle2, color: '#10b981' },
              { title: 'Perdidos', value: snapshot.total_perdidos, icon: XCircle, color: '#ef4444' },
              { title: 'Taxa de Conversão', value: `${snapshot.taxa_conversao}%`, icon: TrendingUp, color: '#ec4899' },
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

          {/* Row 1: Leads por Mês + Leads por Pipeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Leads por Mês</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mesByMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Leads por Pipeline</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pipelineData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                      {pipelineData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 mt-2 justify-center">
                {pipelineData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs text-gray-400">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    {d.name} ({d.value})
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: Top 10 Etapas + Especialidade */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Top 10 Etapas</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={top10Etapas} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fill: '#9ca3af', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      width={150}
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="value" fill="#6366f1" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Por Especialidade</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={especialidadeData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                      {especialidadeData.map((_, i) => (
                        <Cell key={i} fill={SPECIALTY_COLORS[i % SPECIALTY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 mt-2 justify-center">
                {especialidadeData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs text-gray-400">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: SPECIALTY_COLORS[i % SPECIALTY_COLORS.length] }} />
                    {d.name} ({d.value})
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row 3: Motivos de Perda + UTM Source */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Motivos de Perda</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={motivoPerdaData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="value" fill="#ef4444" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Origem (UTM Source)</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={utmData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                      {utmData.map((_, i) => (
                        <Cell key={i} fill={UTM_COLORS[i % UTM_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 mt-2 justify-center">
                {utmData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs text-gray-400">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: UTM_COLORS[i % UTM_COLORS.length] }} />
                    {d.name} ({d.value})
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row 4: Tipo de Pagamento (full width) */}
          <div className="mb-8">
            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Tipo de Pagamento</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pagamentoData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Pipeline Performance Table */}
          <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10">
              <h3 className="text-sm font-semibold text-gray-300">Performance por Pipeline</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    {['Pipeline', 'Total', 'Ganhos', 'Perdidos', 'Taxa Conv.'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PIPELINES.map(name => {
                    const p = snapshot.por_pipeline[name];
                    if (!p) return null;
                    const taxa = p.total > 0 ? (p.ganhos / p.total * 100).toFixed(1) + '%' : '0%';
                    return (
                      <tr key={name} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                        <td className="px-4 py-3 text-gray-200 font-medium">{name}</td>
                        <td className="px-4 py-3 text-gray-300">{p.total}</td>
                        <td className="px-4 py-3 text-green-400">{p.ganhos}</td>
                        <td className="px-4 py-3 text-red-400">{p.perdidos}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            {taxa}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
