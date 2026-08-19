import { Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatBRL, medalhaPara, type RankingRow } from './types';

interface RankingTableProps {
  rows: RankingRow[];
  /** client_id que deve ficar destacado (o cliente logado) */
  destaqueId?: string | null;
  /** Quantas posicoes mostrar. O destaque entra sempre, mesmo fora do corte. */
  limite?: number;
  titulo?: string;
}

const Avatar = ({ row }: { row: RankingRow }) =>
  row.foto_url ? (
    <img
      src={row.foto_url}
      alt={row.nome_cliente}
      className="h-9 w-9 rounded-lg object-cover flex-shrink-0 border border-white/10"
    />
  ) : (
    <div className="h-9 w-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
      <Building2 className="h-4 w-4 text-zinc-500" />
    </div>
  );

export const RankingTable = ({ rows, destaqueId, limite, titulo }: RankingTableProps) => {
  // `||` e nao `??`: quando a RPC nao devolve posicao ela chega como 0,
  // e a ordem da lista ja e a ordem do ranking.
  const comPosicao = rows.map((r, i) => ({ ...r, posicao: r.posicao || i + 1 }));
  const visiveis = limite ? comPosicao.slice(0, limite) : comPosicao;
  const meu = comPosicao.find((r) => r.client_id === destaqueId);
  const meuForaDoCorte = meu && !visiveis.some((r) => r.client_id === meu.client_id);

  const Linha = ({
    row,
  }: {
    row: RankingRow & { posicao: number };
  }) => {
    const destaque = row.client_id === destaqueId;
    const medalha = medalhaPara(row.posicao);
    return (
      <div
        className={cn(
          'grid grid-cols-[64px_1fr_auto] md:grid-cols-[80px_1fr_120px_140px] items-center gap-3 px-4 py-3 border-t border-white/5',
          destaque ? 'bg-[#3b82f6]/10' : 'hover:bg-white/[0.03]'
        )}
      >
        <div className="flex items-center gap-2">
          {medalha ? (
            <span className="text-xl leading-none">{medalha}</span>
          ) : (
            <span className="h-6 w-6" />
          )}
          <span
            className={cn(
              'text-sm font-semibold',
              destaque ? 'text-[#60a5fa]' : 'text-zinc-400'
            )}
          >
            {row.posicao}º
          </span>
        </div>

        <div className="flex items-center gap-3 min-w-0">
          <Avatar row={row} />
          <div className="min-w-0">
            <p className={cn('font-medium truncate', destaque ? 'text-white' : 'text-zinc-200')}>
              {row.apelido || row.nome_cliente}
            </p>
            {row.apelido && (
              <p className="text-xs text-zinc-500 truncate">{row.nome_cliente}</p>
            )}
          </div>
        </div>

        <div className="hidden md:block text-sm text-zinc-400">
          {row.qtd_vendas} {row.qtd_vendas === 1 ? 'venda' : 'vendas'}
        </div>

        <div
          className={cn(
            'text-right font-bold tabular-nums',
            destaque ? 'text-[#60a5fa]' : 'text-white'
          )}
        >
          {formatBRL(row.total_vendido)}
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-xl border border-white/10 bg-[#0f0f0f] overflow-hidden">
      {titulo && (
        <div className="px-4 py-3 border-b border-white/5">
          <h2 className="text-lg font-semibold text-white">{titulo}</h2>
        </div>
      )}

      <div className="grid grid-cols-[64px_1fr_auto] md:grid-cols-[80px_1fr_120px_140px] gap-3 px-4 py-2.5 bg-white/[0.03] text-xs font-semibold uppercase tracking-wider text-zinc-500">
        <span>Posição</span>
        <span>Cliente</span>
        <span className="hidden md:block">Vendas</span>
        <span className="text-right">Total vendido</span>
      </div>

      {visiveis.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-zinc-500">
          Nenhuma venda registrada neste período.
        </p>
      ) : (
        visiveis.map((row) => <Linha key={row.client_id} row={row} />)
      )}

      {meuForaDoCorte && meu && (
        <>
          <div className="px-4 py-1 text-center text-zinc-600 text-xs border-t border-white/5">•••</div>
          <Linha row={meu} />
        </>
      )}
    </div>
  );
};
