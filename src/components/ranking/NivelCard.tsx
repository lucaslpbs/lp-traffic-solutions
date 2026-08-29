import { useMemo } from 'react';
import { Award, Star } from 'lucide-react';
import { useNivelCliente, usePlacasCliente } from './nivel';
import { formatBRL, formatDataBR } from './types';

const estrelas = (n: number | null) => (n ? '★'.repeat(n) + '☆'.repeat(3 - n) : '');

export const NivelCard = ({ clientId }: { clientId: string }) => {
  const { data: nivel, isLoading } = useNivelCliente(clientId);
  const { data: placas = [] } = usePlacasCliente(clientId);

  const progresso = useMemo(() => {
    if (!nivel || !nivel.proximo_nivel || nivel.proximo_valor_minimo == null) return null;
    const atual =
      nivel.proximo_tipo_meta === 'acumulado' ? nivel.faturamento_acumulado : nivel.maior_faturamento_mensal;
    const pct = Math.min(100, (atual / nivel.proximo_valor_minimo) * 100);
    return { atual, meta: nivel.proximo_valor_minimo, pct };
  }, [nivel]);

  if (isLoading || !nivel) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-[#0f0f0f] p-5">
      <div className="flex items-center gap-2 mb-4">
        <Award className="h-5 w-5 text-[#60a5fa]" />
        <h2 className="text-lg font-semibold text-white">Meu nível</h2>
      </div>

      {nivel.nivel_atual ? (
        <p className="text-2xl font-bold text-white mb-4">
          {nivel.nivel_atual} <span className="text-amber-400">{estrelas(nivel.estrela_atual)}</span>
        </p>
      ) : (
        <p className="text-sm text-zinc-500 mb-4">Ainda não atingiu o primeiro degrau da régua.</p>
      )}

      {progresso && nivel.proximo_nivel && (
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">
              Próximo: {nivel.proximo_nivel} {estrelas(nivel.proximo_estrela)}
            </span>
            <span className="font-semibold text-white tabular-nums">
              {formatBRL(progresso.atual)} / {formatBRL(progresso.meta)}
            </span>
          </div>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#1e40af] to-[#3b82f6]"
              style={{ width: `${progresso.pct}%` }}
            />
          </div>
          <p className="text-xs text-zinc-500">
            {nivel.proximo_tipo_meta === 'acumulado'
              ? 'Faturamento acumulado desde o início do contrato'
              : 'Recorde de faturamento em um único mês'}
          </p>
        </div>
      )}

      {placas.length > 0 && (
        <div className="pt-3 border-t border-white/5">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
            Placas conquistadas
          </p>
          <div className="flex flex-wrap gap-2">
            {placas.map((p) => (
              <span
                key={p.id}
                title={`Atingido em ${formatDataBR(p.atingido_em)}${p.entregue ? ' · entregue' : ' · aguardando entrega'}`}
                className="flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-300"
              >
                <Star className="h-3 w-3" />
                {p.nome}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
