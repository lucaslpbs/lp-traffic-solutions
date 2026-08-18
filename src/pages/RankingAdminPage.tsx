import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Building2,
  Camera,
  ImageIcon,
  Loader2,
  Pencil,
  Plus,
  Receipt,
  Search,
  TrendingUp,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LampContainer, LampTitle } from '@/components/ui/lamp';
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
  medalhaPara,
  type RankingRow,
  type Venda,
} from '@/components/ranking/types';
import { uploadPerfilFoto, validateRankingImage } from '@/lib/rankingStorage';
import { cn } from '@/lib/utils';

interface ClienteOption {
  id: string;
  nome_cliente: string;
}

const KPI = ({ icon: Icon, label, valor }: { icon: any; label: string; valor: string }) => (
  <div className="rounded-xl border border-white/10 bg-[#0f0f0f] p-4">
    <div className="flex items-center gap-2 text-zinc-400 mb-2">
      <Icon className="h-4 w-4" />
      <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-2xl font-bold text-white tabular-nums">{valor}</p>
  </div>
);

export default function RankingAdminPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const [periodo, setPeriodo] = useState<Periodo>(PERIODO_PADRAO);
  const [clienteFiltro, setClienteFiltro] = useState<string>('todos');
  const [busca, setBusca] = useState('');
  const [vendaDialog, setVendaDialog] = useState(false);
  const [vendaEditando, setVendaEditando] = useState<Venda | null>(null);
  const [printAberto, setPrintAberto] = useState<string | null>(null);
  const [perfilEditando, setPerfilEditando] = useState<RankingRow | null>(null);

  // ── Clientes ativos ──
  const { data: clientes = [] } = useQuery({
    queryKey: ['ranking-admin-clientes'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('gestao_clientes')
        .select('id, nome_cliente')
        .eq('status', 'ativo')
        .order('nome_cliente');
      if (error) throw error;
      return (data ?? []) as ClienteOption[];
    },
  });

  const nomePorId = useMemo(() => {
    const m = new Map<string, string>();
    clientes.forEach((c) => m.set(c.id, c.nome_cliente));
    return m;
  }, [clientes]);

  // ── Ranking consolidado ──
  const { data: ranking = [], isLoading: loadingRanking } = useQuery({
    queryKey: [
      'ranking-geral-admin',
      periodo.inicio?.toISOString() ?? null,
      periodo.fim?.toISOString() ?? null,
    ],
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

  // ── Todas as vendas ──
  const { data: vendas = [], isLoading: loadingVendas } = useQuery({
    queryKey: [
      'ranking-admin-vendas',
      clienteFiltro,
      periodo.inicio?.toISOString() ?? null,
      periodo.fim?.toISOString() ?? null,
    ],
    queryFn: async () => {
      let q = (supabase as any)
        .from('ranking_vendas')
        .select('*')
        .order('data', { ascending: false })
        .limit(500);
      if (clienteFiltro !== 'todos') q = q.eq('client_id', clienteFiltro);
      if (periodo.inicio) q = q.gte('data', format(periodo.inicio, 'yyyy-MM-dd'));
      if (periodo.fim) q = q.lte('data', format(periodo.fim, 'yyyy-MM-dd'));
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map((v: any) => ({ ...v, valor: Number(v.valor) || 0 })) as Venda[];
    },
  });

  const vendasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return vendas;
    return vendas.filter(
      (v) =>
        (nomePorId.get(v.client_id) ?? '').toLowerCase().includes(termo) ||
        (v.descricao ?? '').toLowerCase().includes(termo)
    );
  }, [vendas, busca, nomePorId]);

  const totais = useMemo(() => {
    const total = ranking.reduce((s, r) => s + r.total_vendido, 0);
    const qtd = ranking.reduce((s, r) => s + r.qtd_vendas, 0);
    const ativos = ranking.filter((r) => r.qtd_vendas > 0).length;
    return { total, qtd, ativos, ticket: qtd ? total / qtd : 0 };
  }, [ranking]);

  const invalidar = () => {
    qc.invalidateQueries({ queryKey: ['ranking-geral-admin'] });
    qc.invalidateQueries({ queryKey: ['ranking-geral'] });
    qc.invalidateQueries({ queryKey: ['ranking-admin-vendas'] });
  };

  return (
    <div className="min-h-screen bg-black">
      <LampContainer>
        <LampTitle>Administrar Ranking</LampTitle>
        <p className="max-w-xl text-center text-sm md:text-base text-zinc-400 -mt-2">
          Lance, edite e audite as vendas de todos os clientes em um só lugar.
        </p>
      </LampContainer>

      <div className="-mt-56 relative z-10 p-6 lg:p-8 max-w-7xl mx-auto space-y-6 pb-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-wrap items-end gap-3">
            <Button
              asChild
              variant="outline"
              className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white"
            >
              <Link to="/dashboard/ranking">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Ver ranking
              </Link>
            </Button>

            <PeriodoFilter value={periodo} onChange={setPeriodo} />

            <div className="flex flex-col gap-1">
              <span className="text-xs text-zinc-500 font-medium">Cliente</span>
              <Select value={clienteFiltro} onValueChange={setClienteFiltro}>
                <SelectTrigger className="w-[220px] bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#111] border-white/10 text-white max-h-64">
                  <SelectItem value="todos" className="focus:bg-white/10 focus:text-white">
                    Todos os clientes
                  </SelectItem>
                  {clientes.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="focus:bg-white/10 focus:text-white">
                      {c.nome_cliente}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={() => {
              setVendaEditando(null);
              setVendaDialog(true);
            }}
            className="bg-gradient-to-r from-[#1e40af] to-[#3b82f6] hover:from-[#1e3a8a] hover:to-[#2563eb] text-white shadow-lg shadow-blue-500/25"
          >
            <Plus className="h-4 w-4 mr-2" />
            Lançar venda
          </Button>
        </div>

        {/* ── KPIs ── */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KPI icon={TrendingUp} label="Total vendido" valor={formatBRL(totais.total)} />
          <KPI icon={Receipt} label="Vendas lançadas" valor={String(totais.qtd)} />
          <KPI icon={Users} label="Clientes com vendas" valor={String(totais.ativos)} />
          <KPI icon={TrendingUp} label="Ticket médio" valor={formatBRL(totais.ticket)} />
        </div>

        {/* ── Ranking consolidado com edicao de perfil ── */}
        <div className="rounded-xl border border-white/10 bg-[#0f0f0f] overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5">
            <h2 className="text-lg font-semibold text-white">Ranking consolidado</h2>
          </div>

          <div className="grid grid-cols-[70px_1fr_100px_140px_56px] gap-3 px-4 py-2.5 bg-white/[0.03] text-xs font-semibold uppercase tracking-wider text-zinc-500">
            <span>Posição</span>
            <span>Cliente</span>
            <span>Vendas</span>
            <span className="text-right">Total</span>
            <span />
          </div>

          {loadingRanking ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-7 w-7 animate-spin text-[#3b82f6]" />
            </div>
          ) : (
            ranking.map((r, i) => (
              <div
                key={r.client_id}
                className="grid grid-cols-[70px_1fr_100px_140px_56px] items-center gap-3 px-4 py-3 border-t border-white/5 hover:bg-white/[0.03]"
              >
                <div className="flex items-center gap-2">
                  {medalhaPara((r.posicao || i + 1)) ? (
                    <span className="text-lg leading-none">{medalhaPara((r.posicao || i + 1))}</span>
                  ) : (
                    <span className="h-5 w-5" />
                  )}
                  <span className="text-sm font-semibold text-zinc-400">{(r.posicao || i + 1)}º</span>
                </div>

                <div className="flex items-center gap-3 min-w-0">
                  {r.foto_url ? (
                    <img
                      src={r.foto_url}
                      alt={r.nome_cliente}
                      className="h-9 w-9 rounded-lg object-cover border border-white/10"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-zinc-500" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-zinc-200 truncate">
                      {r.apelido || r.nome_cliente}
                    </p>
                    <p className="text-xs text-zinc-500 truncate">
                      Última venda: {formatDataBR(r.ultima_venda)}
                    </p>
                  </div>
                </div>

                <span className="text-sm text-zinc-400">{r.qtd_vendas}</span>
                <span className="text-right font-bold text-white tabular-nums">
                  {formatBRL(r.total_vendido)}
                </span>

                <Button
                  variant="ghost"
                  size="icon"
                  title="Editar perfil no ranking"
                  onClick={() => setPerfilEditando(r)}
                  className="text-zinc-500 hover:text-white hover:bg-white/10"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* ── Vendas lancadas ── */}
        <div className="rounded-xl border border-white/10 bg-[#0f0f0f] overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-white">Vendas lançadas</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por cliente ou descrição"
                className="pl-9 w-[280px] bg-white/5 border-white/10 text-white placeholder:text-zinc-600"
              />
            </div>
          </div>

          {loadingVendas ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-7 w-7 animate-spin text-[#3b82f6]" />
            </div>
          ) : vendasFiltradas.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-zinc-500">
              Nenhuma venda encontrada com os filtros atuais.
            </p>
          ) : (
            <div className="divide-y divide-white/5">
              {vendasFiltradas.map((v) => (
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
                    <p className="font-medium text-zinc-200 truncate">
                      {nomePorId.get(v.client_id) ?? v.client_id}
                    </p>
                    <p className="text-xs text-zinc-500 truncate">
                      {formatDataBR(v.data)}
                      {v.descricao ? ` • ${v.descricao}` : ''}
                    </p>
                  </div>

                  <span className="font-bold text-white tabular-nums">{formatBRL(v.valor)}</span>

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
      </div>

      <VendaDialog
        open={vendaDialog}
        onOpenChange={setVendaDialog}
        clientes={clientes}
        venda={vendaEditando}
        onSaved={invalidar}
      />

      <PerfilDialog
        row={perfilEditando}
        onClose={() => setPerfilEditando(null)}
        onSaved={() => {
          setPerfilEditando(null);
          invalidar();
        }}
        userId={user?.id ?? null}
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

// ── Dialog de perfil do cliente no ranking (foto + apelido) ──

function PerfilDialog({
  row,
  onClose,
  onSaved,
  userId,
}: {
  row: RankingRow | null;
  onClose: () => void;
  onSaved: () => void;
  userId: string | null;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [apelido, setApelido] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [carregadoDe, setCarregadoDe] = useState<string | null>(null);

  // sincroniza o form quando muda o cliente selecionado
  if (row && carregadoDe !== row.client_id) {
    setCarregadoDe(row.client_id);
    setApelido(row.apelido ?? '');
    setPreview(row.foto_url);
    setFile(null);
  }

  const escolherArquivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const erro = validateRankingImage(f);
    if (erro) {
      toast.error(erro);
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const salvar = async () => {
    if (!row) return;
    setSalvando(true);
    try {
      let fotoUrl = row.foto_url;
      if (file) fotoUrl = await uploadPerfilFoto(file, row.client_id);

      const { error } = await (supabase as any).from('ranking_perfis').upsert(
        {
          client_id: row.client_id,
          apelido: apelido.trim() || null,
          foto_url: fotoUrl,
          updated_by: userId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'client_id' }
      );
      if (error) throw error;
      toast.success('Perfil atualizado');
      onSaved();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? 'Erro ao salvar o perfil');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={!!row} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-[#0f0f0f] border-white/10 text-white sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Perfil no ranking</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-sm text-zinc-400">{row?.nome_cliente}</p>

          <div className="flex items-center gap-4">
            {preview ? (
              <img
                src={preview}
                alt="Foto de perfil"
                className="h-20 w-20 rounded-xl object-cover border border-white/10"
              />
            ) : (
              <div className="h-20 w-20 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Building2 className="h-7 w-7 text-zinc-600" />
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={escolherArquivo}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileRef.current?.click()}
              className={cn('bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white')}
            >
              <Camera className="h-4 w-4 mr-2" />
              Trocar foto
            </Button>
          </div>

          <div className="space-y-1.5">
            <Label className="text-zinc-300">Apelido no ranking</Label>
            <Input
              value={apelido}
              onChange={(e) => setApelido(e.target.value)}
              placeholder={row?.nome_cliente}
              className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={salvando}
            className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white"
          >
            Cancelar
          </Button>
          <Button
            onClick={salvar}
            disabled={salvando}
            className="bg-gradient-to-r from-[#1e40af] to-[#3b82f6] hover:from-[#1e3a8a] hover:to-[#2563eb] text-white"
          >
            {salvando && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
