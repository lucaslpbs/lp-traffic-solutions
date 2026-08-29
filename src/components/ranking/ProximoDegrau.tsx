import { CalendarDays, Layers, Lock, Check, ArrowRight } from 'lucide-react';
import { ProgressBar } from '@/components/ui/progress-bar';
import { cn } from '@/lib/utils';
import { formatBRL } from './types';
import { ESTRELAS_POR_NIVEL } from './niveis';
import type { NivelCliente } from './nivel';
import {
  useRegrasNiveis,
  useRegrasGerais,
  proximoDoCaminho,
  type CaminhoProgresso,
} from './regras';

const estrelasTexto = (n: number) => '★'.repeat(n) + '☆'.repeat(Math.max(0, ESTRELAS_POR_NIVEL - n));

interface LinhaCaminhoProps {
  titulo: string;
  icone: typeof CalendarDays;
  caminho: CaminhoProgresso | null;
  /** Caminho mais perto de ser batido — ganha a cor do nivel. */
  liderando: boolean;
  /** Texto do bloqueio de tempo, quando houver. */
  travado?: string | null;
  delay?: number;
}

const LinhaCaminho = ({
  titulo,
  icone: Icone,
  caminho,
  liderando,
  travado,
  delay = 0,
}: LinhaCaminhoProps) => (
  <div
    className={cn(
      'rounded-xl border p-4 transition-colors',
      liderando ? 'border-level/45 bg-level/[0.07]' : 'border-border bg-background/30'
    )}
  >
    <div className="flex items-center gap-2 mb-2">
      <Icone className={cn('h-4 w-4', liderando ? 'text-level' : 'text-muted-foreground')} />
      <span
        className={cn(
          'text-[11px] font-semibold uppercase tracking-widest',
          liderando ? 'text-level' : 'text-muted-foreground'
        )}
      >
        {titulo}
      </span>
      {liderando && caminho && (
        <span className="ml-auto rounded-full bg-level/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-level">
          mais perto
        </span>
      )}
    </div>

    {!caminho ? (
      <div className="flex items-center gap-2 py-1">
        <Check className="h-4 w-4 text-success" />
        <p className="text-sm text-muted-foreground">
          Todos os degraus deste caminho já foram conquistados.
        </p>
      </div>
    ) : (
      <>
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 mb-2">
          <p className="text-sm font-semibold text-foreground">
            {caminho.nivel}{' '}
            <span className={liderando ? 'text-level' : 'text-muted-foreground'}>
              {estrelasTexto(caminho.estrela)}
            </span>
          </p>
          <p className="text-sm tabular-nums text-foreground">
            {formatBRL(caminho.atual)}
            <span className="text-muted-foreground font-normal"> / {formatBRL(caminho.meta)}</span>
          </p>
        </div>

        <ProgressBar
          pct={caminho.pct}
          delay={80 + delay}
          brilho={liderando}
          aria-label={`Progresso ${titulo}`}
          className="h-2"
          fillClassName={
            liderando
              ? 'bg-gradient-to-r from-level-dark via-level to-level-glow'
              : 'bg-foreground/25'
          }
        />

        <p className="mt-2 text-xs text-muted-foreground tabular-nums">
          Faltam{' '}
          <strong className={cn('font-semibold', liderando ? 'text-level' : 'text-foreground')}>
            {formatBRL(caminho.falta)}
          </strong>
        </p>
      </>
    )}

    {travado && (
      <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-warning/10 px-2.5 py-1.5 text-xs text-warning">
        <Lock className="h-3.5 w-3.5 flex-shrink-0 mt-px" />
        <span>{travado}</span>
      </p>
    )}
  </div>
);

/**
 * Os dois caminhos da regua, lado a lado.
 *
 * A promocao no banco olha o MAIOR degrau satisfeito por qualquer um dos dois
 * criterios — mensal e acumulado correm em paralelo, nao em sequencia. A RPC
 * devolve so o "proximo na ordem", o que escondia metade do jogo: o cliente via
 * uma meta de acumulado gigante sem saber que estava a poucos mil reais de
 * subir pelo melhor mes. Aqui os dois aparecem, com destaque para o mais perto.
 */
export const ProximoDegrau = ({ nivel }: { nivel: NivelCliente | null | undefined }) => {
  const { data: degraus = [] } = useRegrasNiveis();
  const { data: regras } = useRegrasGerais();

  if (!nivel || degraus.length === 0) return null;

  const viaMes = proximoDoCaminho(degraus, 'mensal', nivel.maior_faturamento_mensal);
  const viaAcumulado = proximoDoCaminho(degraus, 'acumulado', nivel.faturamento_acumulado);

  if (!viaMes && !viaAcumulado) return null;

  // Trava de tempo: o acumulado so conta depois de N meses distintos com
  // faturamento e M meses de contrato ativo.
  const faltamMeses = regras
    ? Math.max(0, regras.mesesDistintosMinimo - nivel.meses_com_faturamento)
    : 0;
  const faltamContrato = regras
    ? Math.max(0, regras.mesesContratoMinimo - nivel.meses_contrato_ativo)
    : 0;
  const acumuladoLiberado = faltamMeses === 0 && faltamContrato === 0;

  const travaAcumulado = acumuladoLiberado
    ? null
    : [
        faltamMeses > 0
          ? `${faltamMeses} ${faltamMeses === 1 ? 'mês' : 'meses'} com faturamento`
          : null,
        faltamContrato > 0
          ? `${faltamContrato} ${faltamContrato === 1 ? 'mês' : 'meses'} de contrato`
          : null,
      ]
        .filter(Boolean)
        .join(' e ');

  /*
    Quem leva o destaque.

    Um caminho travado por tempo perde para um livre, por mais perto que esteja
    do valor — ele ainda nao promove. Mas caminho esgotado nao concorre: se so
    sobrou um degrau possivel, ele e o destaque mesmo estando travado, senao a
    unica carta acionavel da tela ficaria apagada.
  */
  const candidatos = [
    viaMes && { tipo: 'mensal' as const, pct: viaMes.pct, travado: 0 },
    viaAcumulado && {
      tipo: 'acumulado' as const,
      pct: viaAcumulado.pct,
      travado: acumuladoLiberado ? 0 : 1,
    },
  ].filter(Boolean) as { tipo: 'mensal' | 'acumulado'; pct: number; travado: number }[];

  const lidera = candidatos.sort((a, b) => a.travado - b.travado || b.pct - a.pct)[0]?.tipo;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Próximo degrau</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <LinhaCaminho
          titulo="Via mês"
          icone={CalendarDays}
          caminho={viaMes}
          liderando={lidera === 'mensal' && !!viaMes}
        />
        <LinhaCaminho
          titulo="Via acumulado"
          icone={Layers}
          caminho={viaAcumulado}
          liderando={lidera === 'acumulado' && !!viaAcumulado}
          travado={
            travaAcumulado ? `Este caminho libera após ${travaAcumulado}.` : null
          }
          delay={120}
        />
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Os dois caminhos valem ao mesmo tempo — você sobe pelo que bater primeiro.{' '}
        <span className="text-foreground/80">Via mês</span> olha o seu melhor mês;{' '}
        <span className="text-foreground/80">via acumulado</span>, tudo desde o início do contrato.
      </p>
    </div>
  );
};
