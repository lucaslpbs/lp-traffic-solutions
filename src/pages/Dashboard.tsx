// @ts-nocheck
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { format, subDays } from 'date-fns';
import {
  Building2,
  TrendingUp,
  MessageSquare,
  DollarSign,
  Eye,
  MousePointer,
  Users,
  Instagram,
  Video,
  BarChart3,
  Megaphone,
  LineChart,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { KPICard } from '@/components/dashboard/KPICard';
import { DashboardChart } from '@/components/dashboard/DashboardChart';
import { DateFilter } from '@/components/dashboard/DateFilter';
import { SiteDashboard } from '@/components/dashboard/SiteDashboard';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Section } from '@/components/dashboard/Section';
import { Stagger, StaggerItem, Reveal } from '@/components/dashboard/Motion';
import {
  KPIGridSkeleton,
  ChartGridSkeleton,
  CardGridSkeleton,
  PageHeaderSkeleton,
} from '@/components/dashboard/Skeletons';
import {
  DashTabs,
  DashTabsList,
  DashTabsTrigger,
  DashTabsPanel,
} from '@/components/dashboard/DashboardTabs';
import { chartColors } from '@/lib/chartColors';
import { parseDateForSort, formatDateBR } from '@/lib/dateUtils';

interface N8NClient {
  id_conta: string;
  nome: string;
  campanhas_ativas: number;
  picture_url: string;
}

interface N8NResponse {
  total_clientes: number;
  campanhas_ativas: number;
  relatorios_disponiveis: number;
  clientes: N8NClient[];
}

interface ReportData {
  nome_campanha: string;
  dia: string;
  nome_conjunto_anuncios: string;
  alcance: number;
  impressoes: number;
  frequencia: number;
  valor_usado_brl: number;
  compras: number;
  custo_por_compra: number;
  valor_conversao_compra: number;
  cliques_link: number;
  cpc_clique_link: number;
  cliques_todos: number;
  cpc_todos: number;
  conversas_mensagem_iniciadas: number;
  custo_por_conversa_mensagem_iniciada: number;
  reproducoes_video_3s: number;
  visitas_perfil_instagram: number;
  ctr: number;
  cpm: number;
  visualizacoes_pagina_destino?: number;
  finalizacoes_compra_iniciadas?: number;
  adicionados_carrinho?: number;
}

type TabType = 'mensagem' | 'site';

/** Grade de KPIs com entrada escalonada. */
const KPIGrid = ({ items }: { items: any[] }) => (
  <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" stagger={0.04}>
    {items.map((kpi) => (
      <StaggerItem key={kpi.title}>
        <KPICard {...kpi} />
      </StaggerItem>
    ))}
  </Stagger>
);

const EmptyState = ({ titulo, descricao }: { titulo: string; descricao: string }) => (
  <div className="rounded-xl border border-border bg-card p-12 text-center">
    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
    <h3 className="text-lg font-medium text-foreground">{titulo}</h3>
    <p className="text-muted-foreground mt-2">{descricao}</p>
  </div>
);

function ClienteDashboardView() {
  const { clienteVinculadoId } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('mensagem');
  const [startDate, setStartDate] = useState<Date | undefined>(subDays(new Date(), 7));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());

  const { data: clienteInfo, isLoading: loadingClient } = useQuery({
    queryKey: ['cliente-info', clienteVinculadoId],
    queryFn: async () => {
      const { data } = await supabase
        .from('gestao_clientes')
        .select('id, nome_cliente, logo_url, numero_conta_anuncio')
        .eq('id', clienteVinculadoId!)
        .single();
      return data as { nome_cliente: string; logo_url: string | null; numero_conta_anuncio: string | null } | null;
    },
    enabled: !!clienteVinculadoId,
  });

  const clientName = clienteInfo?.nome_cliente ?? '';
  const clientLogo = clienteInfo?.logo_url ?? null;
  const accountId = clienteInfo?.numero_conta_anuncio ?? null;
  const missingAccount = !!clienteInfo && !accountId;

  const { data: reports = [], isLoading: loading, refetch: refetchReports } = useQuery({
    queryKey: ['cliente-reports', accountId, clientName, startDate ? format(startDate, 'yyyy-MM-dd') : null, endDate ? format(endDate, 'yyyy-MM-dd') : null],
    queryFn: async () => {
      const dataInicial = startDate ? format(startDate, 'dd/MM/yyyy') : format(subDays(new Date(), 7), 'dd/MM/yyyy');
      const dataFinal = endDate ? format(endDate, 'dd/MM/yyyy') : format(new Date(), 'dd/MM/yyyy');

      const response = await fetch('https://n8n.trafficsolutions.cloud/webhook/relatorio-meta-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data_inicial: dataInicial,
          data_final: dataFinal,
          nome_cliente: clientName,
          account_id: accountId,
        }),
      });

      if (!response.ok) throw new Error('Erro ao buscar relatorio');
      const result = await response.json();
      return (Array.isArray(result) ? result : result.data || []) as ReportData[];
    },
    enabled: !!accountId && !!clientName,
  });

  const handleFilter = () => refetchReports();

  if (loadingClient || (loading && reports.length === 0)) {
    return (
      <div className="p-5 sm:p-8 lg:p-10 space-y-8" role="status" aria-label="Carregando dashboard">
        <PageHeaderSkeleton />
        <KPIGridSkeleton count={4} />
        <ChartGridSkeleton count={2} />
      </div>
    );
  }

  if (missingAccount) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-6">
        <div className="rounded-xl border border-border bg-card p-12 text-center max-w-md">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground">Conta de anúncio não configurada</h3>
          <p className="text-muted-foreground mt-2">
            Este cliente ainda não possui uma conta de anúncio vinculada. Contate o administrador.
          </p>
        </div>
      </div>
    );
  }

  const aggregatedByDay = reports.reduce((acc, r) => {
    const day = r.dia;
    if (!acc[day]) {
      acc[day] = {
        dia: day,
        valor_usado_brl: 0,
        impressoes: 0,
        alcance: 0,
        cliques_todos: 0,
        cliques_link: 0,
        conversas_mensagem_iniciadas: 0,
        visitas_perfil_instagram: 0,
        reproducoes_video_3s: 0,
        compras: 0,
        valor_conversao_compra: 0,
        visualizacoes_pagina_destino: 0,
        finalizacoes_compra_iniciadas: 0,
        adicionados_carrinho: 0,
      };
    }
    acc[day].valor_usado_brl += r.valor_usado_brl || 0;
    acc[day].impressoes += r.impressoes || 0;
    acc[day].alcance += r.alcance || 0;
    acc[day].cliques_todos += r.cliques_todos || 0;
    acc[day].cliques_link += r.cliques_link || 0;
    acc[day].conversas_mensagem_iniciadas += r.conversas_mensagem_iniciadas || 0;
    acc[day].visitas_perfil_instagram += r.visitas_perfil_instagram || 0;
    acc[day].reproducoes_video_3s += r.reproducoes_video_3s || 0;
    acc[day].compras += r.compras || 0;
    acc[day].valor_conversao_compra += r.valor_conversao_compra || 0;
    acc[day].visualizacoes_pagina_destino += r.visualizacoes_pagina_destino || 0;
    acc[day].finalizacoes_compra_iniciadas += r.finalizacoes_compra_iniciadas || 0;
    acc[day].adicionados_carrinho += r.adicionados_carrinho || 0;
    return acc;
  }, {} as Record<string, any>);

  const dailyData = Object.values(aggregatedByDay).sort((a: any, b: any) =>
    parseDateForSort(a.dia) - parseDateForSort(b.dia)
  );

  const totalSpent = reports.reduce((sum, r) => sum + (r.valor_usado_brl || 0), 0);
  const totalMessages = reports.reduce((sum, r) => sum + (r.conversas_mensagem_iniciadas || 0), 0);
  const totalImpressions = reports.reduce((sum, r) => sum + (r.impressoes || 0), 0);
  const totalReach = reports.reduce((sum, r) => sum + (r.alcance || 0), 0);
  const totalClicks = reports.reduce((sum, r) => sum + (r.cliques_todos || 0), 0);
  const totalLinkClicks = reports.reduce((sum, r) => sum + (r.cliques_link || 0), 0);
  const totalVisits = reports.reduce((sum, r) => sum + (r.visitas_perfil_instagram || 0), 0);
  const totalVideoViews = reports.reduce((sum, r) => sum + (r.reproducoes_video_3s || 0), 0);
  const totalPurchases = reports.reduce((sum, r) => sum + (r.compras || 0), 0);

  const avgCPM = totalImpressions > 0 ? (totalSpent / totalImpressions) * 1000 : 0;
  const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const costPerMessage = totalMessages > 0 ? totalSpent / totalMessages : 0;

  const chartData = dailyData.map((d: any) => ({
    date: formatDateBR(d.dia),
    valor_usado_brl: d.valor_usado_brl,
    conversas_mensagem_iniciadas: d.conversas_mensagem_iniciadas,
    custo_por_conversa: d.conversas_mensagem_iniciadas > 0
      ? d.valor_usado_brl / d.conversas_mensagem_iniciadas
      : 0,
    impressoes: d.impressoes,
    cliques_todos: d.cliques_todos,
    cliques_link: d.cliques_link,
    visitas_perfil_instagram: d.visitas_perfil_instagram,
    reproducoes_video_3s: d.reproducoes_video_3s,
  }));

  // Os 12 KPIs agrupados por assunto — antes eram tres fileiras seguidas, sem
  // nada dizendo por que uma metrica estava numa fileira e nao na outra.
  const kpisResultado = [
    { title: 'Valor Total Gasto', value: totalSpent.toFixed(2), icon: DollarSign, prefix: 'R$ ', tone: 'brand' },
    { title: 'Total de Conversas', value: totalMessages, icon: MessageSquare, tone: 'success' },
    { title: 'Custo por Conversa', value: costPerMessage.toFixed(2), icon: MessageSquare, prefix: 'R$ ', tone: 'warning' },
    { title: 'Total de Compras', value: totalPurchases, icon: TrendingUp, tone: 'success' },
  ];

  const kpisAlcance = [
    { title: 'Impressões', value: totalImpressions.toLocaleString('pt-BR'), icon: Eye, tone: 'info' },
    { title: 'Alcance', value: totalReach.toLocaleString('pt-BR'), icon: Users, tone: 'info' },
    { title: 'CPM Médio', value: avgCPM.toFixed(2), icon: Eye, prefix: 'R$ ', tone: 'neutral' },
    { title: 'CTR Médio', value: avgCTR.toFixed(2), icon: MousePointer, suffix: '%', tone: 'neutral' },
  ];

  const kpisEngajamento = [
    { title: 'Cliques Totais', value: totalClicks.toLocaleString('pt-BR'), icon: MousePointer, tone: 'accent' },
    { title: 'Cliques no Link', value: totalLinkClicks.toLocaleString('pt-BR'), icon: MousePointer, tone: 'accent' },
    { title: 'Visitas Instagram', value: totalVisits.toLocaleString('pt-BR'), icon: Instagram, tone: 'accent' },
    { title: 'Visualizações 3s', value: totalVideoViews.toLocaleString('pt-BR'), icon: Video, tone: 'accent' },
  ];

  return (
    <div className="p-5 sm:p-8 lg:p-10">
      <Reveal>
        <PageHeader
          className="mb-6"
          title={clientName || 'Meu Dashboard'}
          subtitle="Acompanhe seus resultados"
          imageUrl={clientLogo}
          icon={Building2}
          actions={
            <DateFilter
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              onFilter={handleFilter}
            />
          }
        />
      </Reveal>

      <DashTabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)}>
        <DashTabsList>
          <DashTabsTrigger value="mensagem">
            <MessageSquare className="h-4 w-4" />
            Mensagem
          </DashTabsTrigger>
          <DashTabsTrigger value="site">
            <Megaphone className="h-4 w-4" />
            Site
          </DashTabsTrigger>
        </DashTabsList>

        <DashTabsPanel value="mensagem">
          {reports.length === 0 ? (
            <EmptyState
              titulo="Nenhum dado encontrado"
              descricao="Não há dados disponíveis para o período selecionado."
            />
          ) : (
            <div className="space-y-12">
              <Section
                title="Investimento & Resultado"
                description="O que foi investido e o que voltou no período."
                icon={DollarSign}
              >
                <KPIGrid items={kpisResultado} />
              </Section>

              <Section
                title="Alcance & Entrega"
                description="Quantas pessoas viram os anúncios e a que custo."
                icon={Eye}
                collapsible
              >
                <KPIGrid items={kpisAlcance} />
              </Section>

              <Section
                title="Engajamento"
                description="Cliques, visitas ao perfil e visualizações de vídeo."
                icon={MousePointer}
                collapsible
              >
                <KPIGrid items={kpisEngajamento} />
              </Section>

              <Section
                title="Desempenho diário"
                description="Evolução do investimento e das conversas ao longo do período."
                icon={LineChart}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:gap-8">
                  <Reveal subtle>
                    <DashboardChart title="Valor Gasto por Dia" data={chartData} dataKey="valor_usado_brl" color={chartColors.brand} type="area" prefix="R$ " />
                  </Reveal>
                  <Reveal subtle delay={0.08}>
                    <DashboardChart title="Conversas Iniciadas" data={chartData} dataKey="conversas_mensagem_iniciadas" color={chartColors.success} type="composed" secondaryLine={{ dataKey: 'custo_por_conversa', color: chartColors.warning, prefix: 'R$ ', label: 'Custo/Conversa' }} />
                  </Reveal>
                </div>
              </Section>

              <Section
                title="Detalhamento"
                description="Impressões, cliques, visitas e vídeo, dia a dia."
                icon={BarChart3}
                collapsible
                defaultOpen={false}
                contentClassName="space-y-6 xl:space-y-8 pt-2"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:gap-8">
                  <DashboardChart title="Impressões por Dia" data={chartData} dataKey="impressoes" color={chartColors.warning} type="line" />
                  <DashboardChart title="Cliques por Dia" data={chartData} dataKey="cliques_todos" color={chartColors.accent} type="bar" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:gap-8">
                  <DashboardChart title="Visitas ao Instagram" data={chartData} dataKey="visitas_perfil_instagram" color={chartColors.pink} type="area" />
                  <DashboardChart title="Visualizações de Vídeo (3s)" data={chartData} dataKey="reproducoes_video_3s" color={chartColors.cyan} type="bar" />
                </div>
              </Section>
            </div>
          )}
        </DashTabsPanel>

        <DashTabsPanel value="site">
          {reports.length === 0 ? (
            <EmptyState
              titulo="Nenhum dado encontrado"
              descricao="Não há dados disponíveis para o período selecionado."
            />
          ) : (
            <SiteDashboard dailyData={dailyData} showLabelsForPDF={false} />
          )}
        </DashTabsPanel>
      </DashTabs>
    </div>
  );
}

function AdminDashboardView() {
  const { isAdmin, colaboradorClientAccountNumbers } = useAuth();

  const { data, isLoading: loading } = useQuery({
    queryKey: ['admin-dashboard-clients'],
    queryFn: async () => {
      const response = await fetch('https://n8n.trafficsolutions.cloud/webhook/bm-clientes-ativos', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Erro ao buscar clientes');
      return (await response.json()) as N8NResponse;
    },
  });

  if (loading) {
    return (
      <div className="p-5 sm:p-8 lg:p-10 space-y-8" role="status" aria-label="Carregando clientes">
        <PageHeaderSkeleton />
        <CardGridSkeleton count={3} />
        <CardGridSkeleton count={6} />
      </div>
    );
  }

  // Admin ve todos os clientes; colaborador so ve os liberados pra ele
  const clients = isAdmin
    ? data?.clientes || []
    : (data?.clientes || []).filter((c) => colaboradorClientAccountNumbers.includes(c.id_conta));

  const resumo = [
    { title: 'Total de Clientes', value: clients.length, icon: Building2, tone: 'brand' },
    {
      title: 'Campanhas Ativas',
      value: isAdmin ? data?.campanhas_ativas || 0 : clients.reduce((sum, c) => sum + (c.campanhas_ativas || 0), 0),
      icon: TrendingUp,
      tone: 'success',
    },
    { title: 'Relatórios Disponíveis', value: data?.relatorios_disponiveis || 0, icon: MessageSquare, tone: 'info' },
  ];

  return (
    <div className="p-5 sm:p-8 lg:p-10 space-y-8">
      <Reveal>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bem-vindo ao Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Selecione um cliente para visualizar seus relatórios de desempenho
          </p>
        </div>
      </Reveal>

      <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-6" stagger={0.06}>
        {resumo.map((r) => (
          <StaggerItem key={r.title}>
            <KPICard {...r} />
          </StaggerItem>
        ))}
      </Stagger>

      <Section title="Seus Clientes" icon={Building2}>
        {clients.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground">Nenhum cliente encontrado</h3>
            <p className="text-muted-foreground mt-2">
              Você ainda não tem clientes vinculados à sua conta.
            </p>
          </div>
        ) : (
          <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" stagger={0.04}>
            {clients.map((client) => (
              <StaggerItem key={client.id_conta}>
                <Link
                  to={`/dashboard/${client.id_conta}?nome=${encodeURIComponent(client.nome)}`}
                  className="focus-ring group block h-full rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:bg-surface-2/60 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-4">
                    {client.picture_url ? (
                      <img
                        src={client.picture_url}
                        alt=""
                        className="h-12 w-12 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                        {client.nome}
                      </h3>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm text-muted-foreground">Ver relatório →</p>
                        <span className="text-xs text-success bg-success/15 px-2 py-0.5 rounded-full whitespace-nowrap">
                          {client.campanhas_ativas} campanhas
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </Section>
    </div>
  );
}

function RemovedAccessView() {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-xl border border-border bg-card p-8 text-center">
        <div className="mx-auto mb-6 p-4 rounded-full bg-destructive/15 w-fit">
          <Building2 className="h-10 w-10 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-3">
          Seu acesso não está mais ativo
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
          Para mais dúvidas, fale com Lucas Paulino ou procure o Instagram da
          Traffic Solutions.
        </p>
        <button
          onClick={() => signOut()}
          className="focus-ring rounded text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
        >
          Sair da conta
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { isAdmin, isRemoved, isColaborador, colaboradorInativo } = useAuth();

  if (!isAdmin && (isRemoved || colaboradorInativo)) return <RemovedAccessView />;
  return isAdmin || isColaborador ? <AdminDashboardView /> : <ClienteDashboardView />;
}
