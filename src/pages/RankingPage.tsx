import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  Plus,
  Settings,
  Trophy,
  Medal,
  Gift,
  Percent,
  Receipt,
  BookOpen,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { RankingTable } from '@/components/ranking/RankingTable';
import { VendaDialog } from '@/components/ranking/VendaDialog';
import {
  PeriodoFilter,
  PERIODO_PADRAO,
  paramsPeriodo,
  type Periodo,
} from '@/components/ranking/PeriodoFilter';
import {
  type PerfilRanking,
  type RankingRow,
  type Venda,
} from '@/components/ranking/types';
import { ClientesFinaisPanel } from '@/components/ranking/ClientesFinaisPanel';
import { useClientesFinais } from '@/components/ranking/clientesFinais';
import { PlacasConquistadas } from '@/components/ranking/NivelCard';
import { NivelHero } from '@/components/ranking/NivelHero';
import { ReguaNiveis } from '@/components/ranking/ReguaNiveis';
import { Podio } from '@/components/ranking/Podio';
import { RegrasNiveis } from '@/components/ranking/RegrasNiveis';
import { useNivelCliente } from '@/components/ranking/nivel';
import { PontosPanel } from '@/components/ranking/PontosPanel';
import { CardapioResgate } from '@/components/ranking/CardapioResgate';
import { ComissaoPanel } from '@/components/ranking/ComissaoPanel';
import { MeuPerfilCard } from '@/components/ranking/MeuPerfilCard';
import { ResumoStats } from '@/components/ranking/ResumoStats';
import { EvolucaoMensal } from '@/components/ranking/EvolucaoMensal';
import { MinhasVendasList } from '@/components/ranking/MinhasVendasList';
import { Reveal } from '@/components/dashboard/Motion';
import { TableSkeleton } from '@/components/dashboard/Skeletons';
import {
  DashTabs,
  DashTabsList,
  DashTabsTrigger,
  DashTabsPanel,
} from '@/components/dashboard/DashboardTabs';

/**
 * A pagina inteira cabia numa rolagem so: perfil, numeros, ranking, nivel,
 * pontos, cardapio de resgate, comissao, clientes finais e vendas, um embaixo
 * do outro. Agora cada assunto e uma aba; a aba ativa fica na URL (?aba=) para
 * o refresh e o link compartilhado caírem no mesmo lugar.
 */
const ABAS = [
  { id: 'visao-geral', label: 'Visão geral', icon: Trophy },
  { id: 'nivel', label: 'Nível & Placas', icon: Medal },
  { id: 'pontos', label: 'Pontos & Resgates', icon: Gift },
  { id: 'comissao', label: 'Comissão', icon: Percent },
  { id: 'vendas', label: 'Vendas', icon: Receipt },
  { id: 'regras', label: 'Regras', icon: BookOpen },
] as const;

type AbaId = (typeof ABAS)[number]['id'];

const ABA_PADRAO: AbaId = 'visao-geral';
const ehAba = (v: string | null): v is AbaId => ABAS.some((a) => a.id === v);

export default function RankingPage() {
  const { user, isAdmin, clienteVinculadoId } = useAuth();
  const qc = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const aba = ehAba(searchParams.get('aba')) ? (searchParams.get('aba') as AbaId) : ABA_PADRAO;
  const setAba = (v: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('aba', v);
    setSearchParams(params, { replace: true });
  };

  const [periodo, setPeriodo] = useState<Periodo>(PERIODO_PADRAO);
  const [periodoVendas, setPeriodoVendas] = useState<Periodo>(PERIODO_PADRAO);
  const [vendaDialog, setVendaDialog] = useState(false);
  const [vendaEditando, setVendaEditando] = useState<Venda | null>(null);

  // ── Ranking consolidado ──
  const { data: ranking = [], isLoading: loadingRanking, error: erroRanking } = useQuery({
    queryKey: ['ranking-geral', periodo.inicio?.toISOString() ?? null, periodo.fim?.toISOString() ?? null],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc('ranking_geral', paramsPeriodo(periodo));
      if (error) throw error;
      return (data ?? []).map((r: any) => ({
        ...r,
        posicao: Number(r.posicao) || 0,
        total_vendido: Number(r.total_vendido) || 0,
        qtd_vendas: Number(r.qtd_vendas) || 0,
        maior_venda: Number(r.maior_venda) || 0,
      })) as RankingRow[];
    },
  });

  // ── Minhas vendas ──
  const { data: vendas = [] } = useQuery({
    queryKey: [
      'minhas-vendas',
      clienteVinculadoId,
      periodo.inicio?.toISOString() ?? null,
      periodo.fim?.toISOString() ?? null,
    ],
    queryFn: async () => {
      let q = (supabase as any)
        .from('ranking_vendas')
        .select('*')
        .eq('client_id', clienteVinculadoId)
        .order('data', { ascending: false });
      if (periodo.inicio) q = q.gte('data', format(periodo.inicio, 'yyyy-MM-dd'));
      if (periodo.fim) q = q.lte('data', format(periodo.fim, 'yyyy-MM-dd'));
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map((v: any) => ({ ...v, valor: Number(v.valor) || 0 })) as Venda[];
    },
    enabled: !!clienteVinculadoId,
  });

  // ── Lista "Minhas vendas" — tem filtro de data proprio ──
  const { data: vendasLista = [], isLoading: loadingLista } = useQuery({
    queryKey: [
      'minhas-vendas-lista',
      clienteVinculadoId,
      periodoVendas.inicio?.toISOString() ?? null,
      periodoVendas.fim?.toISOString() ?? null,
    ],
    queryFn: async () => {
      let q = (supabase as any)
        .from('ranking_vendas')
        .select('*')
        .eq('client_id', clienteVinculadoId)
        .order('data', { ascending: false });
      if (periodoVendas.inicio) q = q.gte('data', format(periodoVendas.inicio, 'yyyy-MM-dd'));
      if (periodoVendas.fim) q = q.lte('data', format(periodoVendas.fim, 'yyyy-MM-dd'));
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map((v: any) => ({ ...v, valor: Number(v.valor) || 0 })) as Venda[];
    },
    enabled: !!clienteVinculadoId,
  });

  // ── Meu perfil no ranking ──
  const { data: perfil } = useQuery({
    queryKey: ['ranking-perfil', clienteVinculadoId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('ranking_perfis')
        .select('*')
        .eq('client_id', clienteVinculadoId)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as PerfilRanking | null;
    },
    enabled: !!clienteVinculadoId,
  });

  // ── Nivel na regua ── (mesma queryKey usada pelo tema no DashboardLayout,
  // entao o react-query serve as duas com uma requisicao so)
  const { data: nivel } = useNivelCliente(clienteVinculadoId);

  const minhaLinha = useMemo(
    () => ranking.find((r) => r.client_id === clienteVinculadoId) ?? null,
    [ranking, clienteVinculadoId]
  );

  // Nome do comprador para exibir em cada venda
  const { data: clientesFinais = [] } = useClientesFinais(clienteVinculadoId);
  const nomeComprador = useMemo(() => {
    const m = new Map<string, string>();
    clientesFinais.forEach((c) => m.set(c.id, c.nome));
    return m;
  }, [clientesFinais]);

  // Totais calculados a partir das proprias vendas — usados como fallback
  // caso a RPC ranking_geral nao responda (ex.: SQL ainda nao atualizado).
  const vendasAprovadas = useMemo(
    () => vendas.filter((v) => v.status === 'aprovada'),
    [vendas]
  );

  const totaisLocais = useMemo(() => {
    const total = vendasAprovadas.reduce((s, v) => s + v.valor, 0);
    const maior = vendasAprovadas.reduce((s, v) => Math.max(s, v.valor), 0);
    const ultima = vendasAprovadas.length
      ? vendasAprovadas.map((v) => v.data).sort().slice(-1)[0]
      : null;
    return { total, maior, qtd: vendasAprovadas.length, ultima };
  }, [vendasAprovadas]);

  const meuResumo = {
    posicao: minhaLinha?.posicao ?? 0,
    total_vendido: minhaLinha?.total_vendido ?? totaisLocais.total,
    qtd_vendas: minhaLinha?.qtd_vendas ?? totaisLocais.qtd,
    maior_venda: minhaLinha?.maior_venda ?? totaisLocais.maior,
    ultima_venda: minhaLinha?.ultima_venda ?? totaisLocais.ultima,
  };

  const posicaoTexto = meuResumo.posicao > 0 ? `${meuResumo.posicao}º` : '—';

  const porMes = useMemo(() => {
    const mapa = new Map<string, number>();
    vendasAprovadas.forEach((v) => {
      const chave = v.data.slice(0, 7);
      mapa.set(chave, (mapa.get(chave) ?? 0) + v.valor);
    });
    return Array.from(mapa.entries())
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .slice(0, 6)
      .map(([mes, total]) => ({ mes, total }));
  }, [vendasAprovadas]);

  const melhorMes = porMes.length ? Math.max(...porMes.map((m) => m.total)) : 0;

  const invalidar = () => {
    qc.invalidateQueries({ queryKey: ['ranking-geral'] });
    qc.invalidateQueries({ queryKey: ['minhas-vendas'] });
    qc.invalidateQueries({ queryKey: ['minhas-vendas-lista'] });
    qc.invalidateQueries({ queryKey: ['clientes-finais-resumo'] });
  };

  const abrirNovaVenda = () => {
    setVendaEditando(null);
    setVendaDialog(true);
  };

  const editarVenda = (v: Venda) => {
    setVendaEditando(v);
    setVendaDialog(true);
  };

  const nomeExibicao = perfil?.apelido || minhaLinha?.nome_cliente || 'Meu Ranking';
  const fotoAtual = perfil?.foto_url ?? minhaLinha?.foto_url ?? null;

  return (
    <div className="min-h-screen bg-background">
      <div className="p-5 sm:p-8 lg:p-10 max-w-6xl mx-auto space-y-8 lg:space-y-10 pb-20">
        {/* ── Hero pintado com a cor do nivel do cliente ── */}
        {clienteVinculadoId && (
          <NivelHero
            nomeExibicao={nomeExibicao}
            fotoUrl={fotoAtual}
            nivelNome={nivel?.nivel_atual}
            ordem={nivel?.ordem_atual}
            posicao={meuResumo.posicao}
            totalVendido={meuResumo.total_vendido}
            nivel={nivel}
          />
        )}

        {/* ── Barra de acoes ── */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <PeriodoFilter value={periodo} onChange={setPeriodo} />

          <div className="flex flex-wrap items-center gap-2">
            {isAdmin && (
              <Button asChild variant="outline">
                <Link to="/dashboard/ranking/admin">
                  <Settings className="h-4 w-4 mr-2" />
                  Administrar ranking
                </Link>
              </Button>
            )}
            {clienteVinculadoId && (
              <Button
                onClick={abrirNovaVenda}
                className="bg-gradient-to-r from-level-dark to-level text-primary-foreground shadow-lg shadow-level/30 hover:brightness-110 transition-all"
              >
                <Plus className="h-4 w-4 mr-2" />
                Registrar venda
              </Button>
            )}
          </div>
        </div>

        {!clienteVinculadoId && (
          <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
            {isAdmin
              ? 'Você está vendo o ranking como administrador. Use "Administrar ranking" para lançar e editar vendas de qualquer cliente.'
              : 'Sua conta ainda não está vinculada a um cliente. Fale com o suporte para liberar o ranking.'}
          </div>
        )}

        {erroRanking && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            Não foi possível carregar sua posição no ranking: {(erroRanking as any)?.message}
          </div>
        )}

        <DashTabs value={aba} onValueChange={setAba}>
          <DashTabsList className="w-full sm:w-auto">
            {ABAS.map((a) => {
              const Icon = a.icon;
              return (
                <DashTabsTrigger key={a.id} value={a.id}>
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{a.label}</span>
                </DashTabsTrigger>
              );
            })}
          </DashTabsList>

          {/* ── Visao geral: regua, podio, perfil e numeros ── */}
          <DashTabsPanel value="visao-geral" className="space-y-8 lg:space-y-10">
            {clienteVinculadoId && <ReguaNiveis ordem={nivel?.ordem_atual} />}

            {isAdmin && !loadingRanking && <Podio rows={ranking} destaqueId={clienteVinculadoId} />}

            {clienteVinculadoId && (
              <div className="grid gap-6 lg:gap-8 lg:grid-cols-[minmax(0,340px)_1fr]">
                <MeuPerfilCard
                  clientId={clienteVinculadoId}
                  userId={user?.id}
                  perfil={perfil ?? null}
                  nomeCliente={minhaLinha?.nome_cliente}
                  fotoRanking={minhaLinha?.foto_url}
                  resumo={meuResumo}
                  posicaoTexto={posicaoTexto}
                />

                <div className="space-y-6 lg:space-y-8">
                  <ResumoStats
                    posicaoTexto={posicaoTexto}
                    totalVendido={meuResumo.total_vendido}
                    qtdVendas={meuResumo.qtd_vendas}
                    melhorMes={melhorMes}
                  />
                  <EvolucaoMensal porMes={porMes} />
                </div>
              </div>
            )}

            {/* ── Ranking geral — somente admin ──
                O cliente nunca ve nome/valor dos outros: a RPC ranking_geral
                devolve apenas a linha dele (com a posicao ja calculada). */}
            {isAdmin &&
              (loadingRanking ? (
                <TableSkeleton rows={8} />
              ) : (
                <RankingTable
                  rows={ranking}
                  destaqueId={clienteVinculadoId}
                  pularPrimeiros={3}
                  limite={10}
                  titulo="Demais colocados"
                />
              ))}

            {!isAdmin && clienteVinculadoId && (
              <div className="rounded-xl border border-border bg-card p-4 flex items-start gap-3">
                <Trophy className="h-5 w-5 text-level flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  Sua posição é calculada sobre todos os clientes, mas os números de cada um são
                  privados — você vê apenas os seus. Registre suas vendas para subir no ranking.
                </p>
              </div>
            )}
          </DashTabsPanel>

          {/* ── Nivel na regua + placas conquistadas ── */}
          <DashTabsPanel value="nivel" className="space-y-8 lg:space-y-10">
            {clienteVinculadoId ? (
              <>
                <ReguaNiveis ordem={nivel?.ordem_atual} />
                <PlacasConquistadas clientId={clienteVinculadoId} />
              </>
            ) : (
              <SemVinculo />
            )}
          </DashTabsPanel>

          {/* ── Pontos de indicacao/engajamento + cardapio de resgate ── */}
          <DashTabsPanel value="pontos" className="space-y-8 lg:space-y-10">
            {clienteVinculadoId ? (
              <>
                <PontosPanel clientId={clienteVinculadoId} />
                <CardapioResgate clientId={clienteVinculadoId} />
              </>
            ) : (
              <SemVinculo />
            )}
          </DashTabsPanel>

          <DashTabsPanel value="comissao">
            {clienteVinculadoId ? (
              <ComissaoPanel clientId={clienteVinculadoId} />
            ) : (
              <SemVinculo />
            )}
          </DashTabsPanel>

          {/* ── Meus clientes (compradores) + minhas vendas ── */}
          <DashTabsPanel value="regras">
            <RegrasNiveis />
          </DashTabsPanel>

          <DashTabsPanel value="vendas" className="space-y-8 lg:space-y-10">
            {clienteVinculadoId ? (
              <>
                <ClientesFinaisPanel clientId={clienteVinculadoId} />
                <MinhasVendasList
                  vendas={vendasLista}
                  loading={loadingLista}
                  periodo={periodoVendas}
                  onPeriodoChange={setPeriodoVendas}
                  nomeComprador={nomeComprador}
                  onEditar={editarVenda}
                />
              </>
            ) : (
              <SemVinculo />
            )}
          </DashTabsPanel>
        </DashTabs>
      </div>

      <VendaDialog
        open={vendaDialog}
        onOpenChange={setVendaDialog}
        clientId={clienteVinculadoId}
        venda={vendaEditando}
        onSaved={invalidar}
      />
    </div>
  );
}

const SemVinculo = () => (
  <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
    Esta seção fica disponível quando sua conta estiver vinculada a um cliente.
  </div>
);
