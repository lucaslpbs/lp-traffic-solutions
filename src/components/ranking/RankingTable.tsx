import { motion } from 'framer-motion';
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
  /** Esconde os que ja aparecem no podio. */
  pularPrimeiros?: number;
}

const Avatar = ({ row, destaque }: { row: RankingRow; destaque: boolean }) =>
  row.foto_url ? (
    <img
      src={row.foto_url}
      alt=""
      className={cn(
        'h-9 w-9 rounded-lg object-cover flex-shrink-0 border',
        destaque ? 'border-level' : 'border-border'
      )}
    />
  ) : (
    <div
      className={cn(
        'h-9 w-9 rounded-lg bg-foreground/5 border flex items-center justify-center flex-shrink-0',
        destaque ? 'border-level' : 'border-border'
      )}
    >
      <Building2 className="h-4 w-4 text-muted-foreground" />
    </div>
  );

export const RankingTable = ({
  rows,
  destaqueId,
  limite,
  titulo,
  pularPrimeiros = 0,
}: RankingTableProps) => {
  // `||` e nao `??`: quando a RPC nao devolve posicao ela chega como 0,
  // e a ordem da lista ja e a ordem do ranking.
  const comPosicao = rows.map((r, i) => ({ ...r, posicao: r.posicao || i + 1 }));

  // Maior valor da lista — usado para a barra de proporcao de cada linha, que
  // deixa a diferenca entre o 1o e o 10o visivel sem precisar ler os numeros.
  const teto = comPosicao.reduce((m, r) => Math.max(m, r.total_vendido), 0);

  const apos = comPosicao.slice(pularPrimeiros);
  const visiveis = limite ? apos.slice(0, limite) : apos;
  const meu = comPosicao.find((r) => r.client_id === destaqueId);
  const meuForaDoCorte = meu && !visiveis.some((r) => r.client_id === meu.client_id);

  const Linha = ({
    row,
    index,
  }: {
    row: RankingRow & { posicao: number };
    index: number;
  }) => {
    const destaque = row.client_id === destaqueId;
    const medalha = medalhaPara(row.posicao);
    const proporcao = teto > 0 ? (row.total_vendido / teto) * 100 : 0;

    return (
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.04, duration: 0.3 }}
        className={cn(
          'relative grid grid-cols-[64px_1fr_auto] md:grid-cols-[80px_1fr_120px_140px] items-center gap-3 px-4 py-3 border-t border-border/60',
          destaque ? 'bg-level/10' : 'hover:bg-foreground/[0.03]'
        )}
      >
        {/* barra de proporcao, atras do conteudo */}
        <motion.span
          aria-hidden
          initial={{ width: 0 }}
          animate={{ width: `${proporcao}%` }}
          transition={{ delay: 0.15 + index * 0.04, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            'absolute inset-y-0 left-0 pointer-events-none',
            destaque
              ? 'bg-gradient-to-r from-level/25 to-transparent'
              : 'bg-gradient-to-r from-foreground/[0.05] to-transparent'
          )}
        />

        <div className="relative flex items-center gap-2">
          {medalha ? (
            <span className="text-xl leading-none">{medalha}</span>
          ) : (
            <span className="h-6 w-6" />
          )}
          <span
            className={cn(
              'text-sm font-semibold tabular-nums',
              destaque ? 'text-level' : 'text-muted-foreground'
            )}
          >
            {row.posicao}º
          </span>
        </div>

        <div className="relative flex items-center gap-3 min-w-0">
          <Avatar row={row} destaque={destaque} />
          <div className="min-w-0">
            <p className="font-medium truncate text-foreground">
              {row.apelido || row.nome_cliente}
            </p>
            {row.apelido && (
              <p className="text-xs text-muted-foreground truncate">{row.nome_cliente}</p>
            )}
          </div>
        </div>

        <div className="relative hidden md:block text-sm text-muted-foreground tabular-nums">
          {row.qtd_vendas} {row.qtd_vendas === 1 ? 'venda' : 'vendas'}
        </div>

        <div
          className={cn(
            'relative text-right font-bold tabular-nums',
            destaque ? 'text-level' : 'text-foreground'
          )}
        >
          {formatBRL(row.total_vendido)}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {titulo && (
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">{titulo}</h2>
        </div>
      )}

      <div className="grid grid-cols-[64px_1fr_auto] md:grid-cols-[80px_1fr_120px_140px] gap-3 px-4 py-2.5 bg-foreground/[0.03] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <span>Posição</span>
        <span>Cliente</span>
        <span className="hidden md:block">Vendas</span>
        <span className="text-right">Total vendido</span>
      </div>

      {visiveis.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-muted-foreground">
          Nenhuma venda registrada neste período.
        </p>
      ) : (
        visiveis.map((row, i) => <Linha key={row.client_id} row={row} index={i} />)
      )}

      {meuForaDoCorte && meu && (
        <>
          <div className="px-4 py-1 text-center text-muted-foreground/80 text-xs border-t border-border/60">
            •••
          </div>
          <Linha row={meu} index={visiveis.length} />
        </>
      )}
    </div>
  );
};
