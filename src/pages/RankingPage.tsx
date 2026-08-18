import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Camera,
  Check,
  Loader2,
  Pencil,
  Plus,
  Settings,
  Trophy,
  TrendingUp,
  Medal,
  Receipt,
  Building2,
  ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { LampContainer, LampTitle } from '@/components/ui/lamp';
import { RankingTable } from '@/components/ranking/RankingTable';
import { VendaDialog, ExcluirVendaButton } from '@/components/ranking/VendaDialog';
import {
  PeriodoFilter,
  PERIODO_PADRAO,
  paramsPeriodo,
  type Periodo,
} from '@/components/ranking/PeriodoFilter';
import {
  formatBRL,
  formatDataBR,
  parseDateOnly,
  type PerfilRanking,
  type RankingRow,
  type Venda,
} from '@/components/ranking/types';
import { uploadPerfilFoto, validateRankingImage } from '@/lib/rankingStorage';
import { cn } from '@/lib/utils';

const StatCard = ({
  icon: Icon,
  label,
  valor,
  destaque,
}: {
  icon: any;
  label: string;
  valor: string;
  destaque?: boolean;
}) => (
  <div
    className={cn(
      'rounded-xl border p-4',
      destaque
        ? 'border-[#3b82f6]/40 bg-gradient-to-br from-[#1e40af]/25 to-[#3b82f6]/10'
        : 'border-white/10 bg-[#0f0f0f]'
    )}
  >
    <div className="flex items-center gap-2 text-zinc-400 mb-2">
      <Icon className="h-4 w-4" />
      <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-2xl font-bold text-white tabular-nums">{valor}</p>
  </div>
);

export default function RankingPage() {
  const { user, isAdmin, clienteVinculadoId } = useAuth();
  const qc = useQueryClient();
  const fotoRef = useRef<HTMLInputElement>(null);

  const [periodo, setPeriodo] = useState<Periodo>(PERIODO_PADRAO);
  const [vendaDialog, setVendaDialog] = useState(false);
  const [vendaEditando, setVendaEditando] = useState<Venda | null>(null);
  const [printAberto, setPrintAberto] = useState<string | null>(null);
  const [editandoApelido, setEditandoApelido] = useState(false);
  const [apelido, setApelido] = useState('');
  const [enviandoFoto, setEnviandoFoto] = useState(false);

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
  const { data: vendas = [], isLoading: loadingVendas } = useQuery({
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

  const minhaLinha = useMemo(
    () => ranking.find((r) => r.client_id === clienteVinculadoId) ?? null,
    [ranking, clienteVinculadoId]
  );

  // Totais calculados a partir das proprias vendas — usados como fallback
  // caso a RPC ranking_geral nao responda (ex.: SQL ainda nao atualizado).
  const totaisLocais = useMemo(() => {
    const total = vendas.reduce((s, v) => s + v.valor, 0);
    const maior = vendas.reduce((s, v) => Math.max(s, v.valor), 0);
    const ultima = vendas.length
      ? vendas.map((v) => v.data).sort().slice(-1)[0]
      : null;
    return { total, maior, qtd: vendas.length, ultima };
  }, [vendas]);

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
    vendas.forEach((v) => {
      const chave = v.data.slice(0, 7);
      mapa.set(chave, (mapa.get(chave) ?? 0) + v.valor);
    });
    return Array.from(mapa.entries())
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .slice(0, 6)
      .map(([mes, total]) => ({ mes, total }));
  }, [vendas]);

  const melhorMes = porMes.length ? Math.max(...porMes.map((m) => m.total)) : 0;

  const invalidar = () => {
    qc.invalidateQueries({ queryKey: ['ranking-geral'] });
    qc.invalidateQueries({ queryKey: ['minhas-vendas'] });
  };

  // ── Foto de perfil ──
  const handleFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !clienteVinculadoId) return;
    const erro = validateRankingImage(file);
    if (erro) {
      toast.error(erro);
      return;
    }
    setEnviandoFoto(true);
    try {
      const url = await uploadPerfilFoto(file, clienteVinculadoId);
      const { error } = await (supabase as any).from('ranking_perfis').upsert(
        {
          client_id: clienteVinculadoId,
          foto_url: url,
          apelido: perfil?.apelido ?? null,
          updated_by: user?.id ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'client_id' }
      );
      if (error) throw error;
      toast.success('Foto de perfil atualizada');
      qc.invalidateQueries({ queryKey: ['ranking-perfil'] });
      qc.invalidateQueries({ queryKey: ['ranking-geral'] });
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? 'Erro ao enviar a foto');
    } finally {
      setEnviandoFoto(false);
      if (fotoRef.current) fotoRef.current.value = '';
    }
  };

  const salvarApelido = async () => {
    if (!clienteVinculadoId) return;
    const { error } = await (supabase as any).from('ranking_perfis').upsert(
      {
        client_id: clienteVinculadoId,
        apelido: apelido.trim() || null,
        foto_url: perfil?.foto_url ?? null,
        updated_by: user?.id ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'client_id' }
    );
    if (error) {
      toast.error('Erro ao salvar o apelido');
      return;
    }
    setEditandoApelido(false);
    toast.success('Perfil atualizado');
    qc.invalidateQueries({ queryKey: ['ranking-perfil'] });
    qc.invalidateQueries({ queryKey: ['ranking-geral'] });
  };

  const fotoAtual = perfil?.foto_url ?? minhaLinha?.foto_url ?? null;
  const nomeExibicao = perfil?.apelido || minhaLinha?.nome_cliente || 'Meu perfil';

  return (
    <div className="min-h-screen bg-black">
      {/* ── Cabecalho lamp ── */}
      <LampContainer>
        <LampTitle>Meu Ranking</LampTitle>
        <p className="max-w-xl text-center text-sm md:text-base text-zinc-400 -mt-2">
          Registre suas vendas, acompanhe sua evolução e dispute o topo com os outros clientes.
        </p>
      </LampContainer>

      <div className="-mt-56 relative z-10 p-6 lg:p-8 max-w-6xl mx-auto space-y-6 pb-16">
        {/* ── Barra de acoes ── */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <PeriodoFilter value={periodo} onChange={setPeriodo} />

          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button
                asChild
                variant="outline"
                className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white"
              >
                <Link to="/dashboard/ranking/admin">
                  <Settings className="h-4 w-4 mr-2" />
                  Administrar ranking
                </Link>
              </Button>
            )}
            {clienteVinculadoId && (
              <Button
                onClick={() => {
                  setVendaEditando(null);
                  setVendaDialog(true);
                }}
                className="bg-gradient-to-r from-[#1e40af] to-[#3b82f6] hover:from-[#1e3a8a] hover:to-[#2563eb] text-white shadow-lg shadow-blue-500/25"
              >
                <Plus className="h-4 w-4 mr-2" />
                Registrar venda
              </Button>
            )}
          </div>
        </div>

        {!clienteVinculadoId && (
          <div className="rounded-xl border border-white/10 bg-[#0f0f0f] p-4 text-sm text-zinc-400">
            {isAdmin
              ? 'Você está vendo o ranking como administrador. Use "Administrar ranking" para lançar e editar vendas de qualquer cliente.'
              : 'Sua conta ainda não está vinculada a um cliente. Fale com o suporte para liberar o ranking.'}
          </div>
        )}

        {erroRanking && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            Não foi possível carregar sua posição no ranking: {(erroRanking as any)?.message}
          </div>
        )}

        {/* ── Meu perfil + numeros ── */}
        {clienteVinculadoId && (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_1fr]">
            <div className="rounded-xl border border-white/10 bg-[#0f0f0f] p-5">
              <h2 className="text-lg font-semibold text-white mb-4">Meu Perfil</h2>

              <div className="flex items-center gap-4 mb-5">
                <div className="relative">
                  {fotoAtual ? (
                    <img
                      src={fotoAtual}
                      alt={nomeExibicao}
                      className="h-20 w-20 rounded-xl object-cover border border-white/10"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <Building2 className="h-7 w-7 text-zinc-600" />
                    </div>
                  )}
                  <input
                    ref={fotoRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleFoto}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fotoRef.current?.click()}
                    disabled={enviandoFoto}
                    title="Enviar foto de perfil"
                    className="absolute -bottom-2 -right-2 rounded-full bg-gradient-to-r from-[#1e40af] to-[#3b82f6] p-2 text-white shadow-lg shadow-blue-500/25 hover:opacity-90"
                  >
                    {enviandoFoto ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Camera className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>

                <div className="min-w-0 flex-1">
                  {editandoApelido ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={apelido}
                        onChange={(e) => setApelido(e.target.value)}
                        placeholder="Como quer aparecer"
                        className="bg-white/5 border-white/10 text-white h-9"
                      />
                      <Button
                        size="icon"
                        onClick={salvarApelido}
                        className="h-9 w-9 bg-[#3b82f6] hover:bg-[#2563eb]"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setApelido(perfil?.apelido ?? '');
                        setEditandoApelido(true);
                      }}
                      className="group flex items-center gap-2 text-left"
                    >
                      <span className="text-xl font-bold text-[#60a5fa] truncate">{nomeExibicao}</span>
                      <Pencil className="h-3.5 w-3.5 text-zinc-600 group-hover:text-zinc-300" />
                    </button>
                  )}
                  <p className="text-sm text-zinc-500 truncate">{minhaLinha?.nome_cliente}</p>
                </div>
              </div>

              <dl className="space-y-2.5 text-sm">
                {[
                  ['Posição no ranking', posicaoTexto],
                  ['Total vendido', formatBRL(meuResumo.total_vendido)],
                  ['Qtd. de vendas', String(meuResumo.qtd_vendas)],
                  ['Maior venda', formatBRL(meuResumo.maior_venda)],
                  ['Última venda', formatDataBR(meuResumo.ultima_venda)],
                ].map(([label, valor]) => (
                  <div key={label} className="flex items-center justify-between border-b border-white/5 pb-2">
                    <dt className="text-zinc-400">{label}</dt>
                    <dd className="font-semibold text-white tabular-nums">{valor}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard icon={Trophy} label="Posição" valor={posicaoTexto} destaque />
                <StatCard
                  icon={TrendingUp}
                  label="Total no período"
                  valor={formatBRL(meuResumo.total_vendido)}
                />
                <StatCard icon={Receipt} label="Vendas" valor={String(meuResumo.qtd_vendas)} />
                <StatCard icon={Medal} label="Melhor mês" valor={formatBRL(melhorMes)} />
              </div>

              {/* Evolucao por mes */}
              <div className="rounded-xl border border-white/10 bg-[#0f0f0f] p-5">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-4">
                  Evolução por mês
                </h3>
                {porMes.length === 0 ? (
                  <p className="text-sm text-zinc-500">Nenhuma venda no período selecionado.</p>
                ) : (
                  <div className="space-y-3">
                    {porMes.map(({ mes, total }) => (
                      <div key={mes} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-zinc-400 capitalize">
                            {format(parseDateOnly(`${mes}-01`), "MMMM 'de' yyyy", { locale: ptBR })}
                          </span>
                          <span className="font-semibold text-white tabular-nums">{formatBRL(total)}</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#1e40af] to-[#3b82f6]"
                            style={{ width: `${melhorMes ? (total / melhorMes) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Ranking geral — somente admin ──
            O cliente nunca ve nome/valor dos outros: a RPC ranking_geral
            devolve apenas a linha dele (com a posicao ja calculada). */}
        {isAdmin &&
          (loadingRanking ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-[#3b82f6]" />
            </div>
          ) : (
            <RankingTable
              rows={ranking}
              destaqueId={clienteVinculadoId}
              limite={10}
              titulo="Ranking de vendas"
            />
          ))}

        {!isAdmin && clienteVinculadoId && (
          <div className="rounded-xl border border-white/10 bg-[#0f0f0f] p-4 flex items-start gap-3">
            <Trophy className="h-5 w-5 text-[#60a5fa] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-zinc-400">
              Sua posição é calculada sobre todos os clientes, mas os números de cada um são
              privados — você vê apenas os seus. Registre suas vendas para subir no ranking.
            </p>
          </div>
        )}

        {/* ── Minhas vendas ── */}
        {clienteVinculadoId && (
          <div className="rounded-xl border border-white/10 bg-[#0f0f0f] overflow-hidden">
            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Minhas vendas</h2>
              <span className="text-sm text-zinc-500">
                {vendas.length} {vendas.length === 1 ? 'registro' : 'registros'}
              </span>
            </div>

            {loadingVendas ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-7 w-7 animate-spin text-[#3b82f6]" />
              </div>
            ) : vendas.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-zinc-500">
                Você ainda não registrou vendas neste período.
              </p>
            ) : (
              <div className="divide-y divide-white/5">
                {vendas.map((v) => (
                  <div key={v.id} className="flex items-center gap-4 px-4 py-3">
                    {v.foto_url ? (
                      <button type="button" onClick={() => setPrintAberto(v.foto_url)}>
                        <img
                          src={v.foto_url}
                          alt="Print da venda"
                          className="h-12 w-12 rounded-lg object-cover border border-white/10 hover:border-[#3b82f6] transition-colors"
                        />
                      </button>
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                        <ImageIcon className="h-4 w-4 text-zinc-600" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white tabular-nums">{formatBRL(v.valor)}</p>
                      <p className="text-xs text-zinc-500">
                        {formatDataBR(v.data)}
                        {v.descricao ? ` • ${v.descricao}` : ''}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setVendaEditando(v);
                        setVendaDialog(true);
                      }}
                      className="text-zinc-500 hover:text-white hover:bg-white/10"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <ExcluirVendaButton vendaId={v.id} onDeleted={invalidar} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <VendaDialog
        open={vendaDialog}
        onOpenChange={setVendaDialog}
        clientId={clienteVinculadoId}
        venda={vendaEditando}
        onSaved={invalidar}
      />

      <Dialog open={!!printAberto} onOpenChange={() => setPrintAberto(null)}>
        <DialogContent className="bg-[#0f0f0f] border-white/10 max-w-3xl p-2">
          {printAberto && (
            <img src={printAberto} alt="Print da venda" className="w-full rounded-lg object-contain" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
