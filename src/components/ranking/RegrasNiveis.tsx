import { RevealOnScroll } from '@/components/ui/reveal-on-scroll';
import { Award, Star, Trophy, Info, Lock, Check, MapPin, CalendarDays, Layers } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { formatBRL } from './types';
import { nivelPorNome, ESTRELAS_POR_NIVEL, NIVEIS } from './niveis';
import { useNivelCliente } from './nivel';
import { useRegrasNiveis, useRegrasPlacas, useRegrasGerais, agruparPorNivel } from './regras';
import { TableSkeleton } from '@/components/dashboard/Skeletons';

/**
 * O que cada placa comunica, alem do valor.
 *
 * Fica no codigo porque a tabela `ranking_config_placas` guarda so nome e
 * valor. A busca e por nome, com uma frase generica de reserva — se o admin
 * cadastrar uma placa nova, ela aparece com texto neutro em vez de vazio.
 */
const DESCRICAO_PLACA: Record<string, string> = {
  Starter:
    'Os primeiros R$ 50 mil faturados com a gente — a prova de que a operação saiu do papel.',
  Growth:
    'Os primeiros seis dígitos: o crescimento deixou de ser sorte e virou rotina.',
  Performance:
    'Dobrar os cem mil significa uma máquina de vendas que já se sustenta sozinha.',
  Scale:
    'Meio milhão faturado — o patamar em que a operação vira referência no seu mercado.',
  Enterprise:
    'Um milhão. A placa mais rara da régua; pouquíssimos clientes chegam até aqui.',
};

const descricaoDe = (nome: string) =>
  DESCRICAO_PLACA[nome] ?? 'Marco de faturamento acumulado ao longo do contrato.';

/** Tres pontos de estrela, preenchidos ate `ativas`. */
const Pips = ({ ativas, cor }: { ativas: number; cor: string }) => (
  <span className="flex gap-0.5" aria-label={`${ativas} de ${ESTRELAS_POR_NIVEL} estrelas`}>
    {Array.from({ length: ESTRELAS_POR_NIVEL }).map((_, i) => (
      <Star
        key={i}
        className="h-3 w-3"
        style={{
          color: cor,
          fill: i < ativas ? cor : 'transparent',
          opacity: i < ativas ? 1 : 0.3,
        }}
      />
    ))}
  </span>
);

export const RegrasNiveis = () => {
  const { clienteVinculadoId } = useAuth();
  const { data: degraus = [], isLoading } = useRegrasNiveis();
  const { data: placas = [] } = useRegrasPlacas();
  const { data: regras } = useRegrasGerais();
  const { data: meuNivel } = useNivelCliente(clienteVinculadoId);

  if (isLoading) return <TableSkeleton rows={6} />;

  const grupos = agruparPorNivel(degraus);
  const minhaOrdem = meuNivel?.ordem_atual ?? 0;
  const meuNivelNome = meuNivel?.nivel_atual ?? null;

  const mesesDistintos = regras?.mesesDistintosMinimo ?? 2;
  const mesesContrato = regras?.mesesContratoMinimo ?? 5;

  return (
    <div className="space-y-8">
      {/* ── Como funciona ── */}
      <RevealOnScroll as="header" className="rounded-xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-3">
          <Info className="h-4 w-4 text-level" />
          <span className="text-xs font-semibold uppercase tracking-widest text-level">
            Como funciona
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
          {NIVEIS.length} níveis, {ESTRELAS_POR_NIVEL} estrelas cada
        </h2>
        <p className="text-muted-foreground max-w-2xl leading-relaxed">
          São {NIVEIS.length * ESTRELAS_POR_NIVEL} degraus no total, e existem{' '}
          <strong className="text-foreground font-semibold">dois caminhos para subir</strong> —
          eles valem ao mesmo tempo, e você sobe pelo que bater primeiro.
        </p>

        {/* os dois caminhos, explicados */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-surface-2/40 p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <CalendarDays className="h-4 w-4 text-level" />
              <span className="text-sm font-semibold text-foreground">Via mês</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Olha o seu <strong className="text-foreground/85 font-medium">melhor mês</strong> de
              faturamento. Basta um único mês atingir o valor — ele não precisa se repetir.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-surface-2/40 p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Layers className="h-4 w-4 text-level" />
              <span className="text-sm font-semibold text-foreground">Via acumulado</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Soma{' '}
              <strong className="text-foreground/85 font-medium">tudo desde o início do contrato</strong>
              . Chega mais longe, mas tem duas condições de tempo.
            </p>
          </div>
        </div>

        {/* trava de tempo do acumulado */}
        <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-warning/30 bg-warning/[0.07] p-4">
          <Lock className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-warning mb-1">
              O acumulado tem carência
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ele só conta faturamento vindo de pelo menos{' '}
              <strong className="text-foreground font-semibold">
                {mesesDistintos} {mesesDistintos === 1 ? 'mês diferente' : 'meses diferentes'}
              </strong>
              , e passa a valer a partir de{' '}
              <strong className="text-foreground font-semibold">
                {mesesContrato} {mesesContrato === 1 ? 'mês' : 'meses'} de contrato
              </strong>{' '}
              com a gente. Antes disso, só o caminho via mês faz você subir.
            </p>
          </div>
        </div>

        {/* amostra das cinco cores */}
        <div className="mt-6 flex gap-1.5" aria-hidden>
          {NIVEIS.map((n) => (
            <RevealOnScroll
              key={n.slug}
              delay={80 + n.posicao * 70}
              deslocamento="sm"
              className="h-1.5 flex-1 rounded-full"
            >
              <span
                className="block h-full w-full rounded-full"
                style={{ backgroundColor: n.hex }}
              />
            </RevealOnScroll>
          ))}
        </div>
      </RevealOnScroll>

      {/* ── Os cinco niveis ── */}
      <div className="space-y-5">
        {grupos.map((g) => {
          const meta = nivelPorNome(g.nivel);
          const cor = meta?.hex ?? 'hsl(var(--level))';
          const base = g.itens[0]?.tipo_meta === 'acumulado' ? 'Acumulado' : 'Melhor mês';
          const ehMeuNivel = meuNivelNome === g.nivel;

          return (
            <RevealOnScroll
              as="section"
              key={g.nivel}
              delay={40}
              className={cn(
                'group relative overflow-hidden rounded-xl border bg-card p-6 transition-all duration-300',
                ehMeuNivel && 'ring-1'
              )}
              style={{
                borderColor: ehMeuNivel ? `${cor}80` : `${cor}3d`,
                boxShadow: ehMeuNivel ? `0 0 32px -10px ${cor}99` : undefined,
                ...(ehMeuNivel ? ({ '--tw-ring-color': `${cor}66` } as React.CSSProperties) : {}),
              }}
            >
              {/* faixa lateral na cor do nivel */}
              <span
                aria-hidden
                className={cn(
                  'absolute inset-y-0 left-0 transition-all duration-300',
                  ehMeuNivel ? 'w-1.5' : 'w-1 group-hover:w-1.5'
                )}
                style={{ backgroundColor: cor }}
              />

              {ehMeuNivel && (
                <span
                  aria-hidden
                  className="absolute inset-0 opacity-60 pointer-events-none"
                  style={{ backgroundImage: `linear-gradient(90deg, ${cor}14, transparent 60%)` }}
                />
              )}

              <div className="relative flex flex-wrap items-center gap-x-3 gap-y-1 mb-5 pl-2">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold"
                  style={{ backgroundColor: `${cor}26`, color: cor }}
                >
                  {meta?.posicao ?? '·'}
                </span>
                <h3 className="text-xl font-bold" style={{ color: cor }}>
                  {g.nivel}
                </h3>

                {ehMeuNivel && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider animate-pulse-glow"
                    style={{ backgroundColor: `${cor}26`, color: cor }}
                  >
                    <MapPin className="h-3 w-3" />
                    Você está aqui
                  </span>
                )}

                {meta && !ehMeuNivel && (
                  <span className="text-sm text-muted-foreground">{meta.legenda}</span>
                )}

                <span className="ml-auto rounded-full border border-border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                  {base}
                </span>
              </div>

              <ul className="relative grid gap-3 sm:grid-cols-3 pl-2">
                {g.itens.map((d) => {
                  const conquistado = minhaOrdem >= d.ordem;
                  const degrauAtual = minhaOrdem === d.ordem;

                  return (
                    <RevealOnScroll
                      as="li"
                      key={`${d.nivel}-${d.estrela}`}
                      delay={60 * d.estrela}
                      deslocamento="sm"
                      className={cn(
                        'relative rounded-lg border px-4 py-3 transition-colors',
                        degrauAtual ? 'border-transparent' : 'border-border bg-surface-2/50'
                      )}
                      style={
                        degrauAtual
                          ? { borderColor: `${cor}66`, backgroundColor: `${cor}1a` }
                          : undefined
                      }
                    >
                      <div className="flex items-center justify-between gap-2">
                        <Pips ativas={d.estrela} cor={cor} />
                        {conquistado && (
                          <Check
                            className="h-3.5 w-3.5 flex-shrink-0"
                            style={{ color: cor }}
                            aria-label="Conquistado"
                          />
                        )}
                      </div>
                      <p className="mt-1.5 text-base font-semibold text-foreground tabular-nums">
                        {formatBRL(d.valor_minimo)}
                      </p>
                    </RevealOnScroll>
                  );
                })}
              </ul>
            </RevealOnScroll>
          );
        })}
      </div>

      {/* ── Placas fisicas ── */}
      {placas.length > 0 && (
        <RevealOnScroll
          as="section"
          delay={40}
          className="rounded-xl border border-border bg-card p-6 sm:p-8"
        >
          <div className="flex items-center gap-2 mb-2">
            <Award className="h-5 w-5 text-level" />
            <h3 className="text-lg font-bold text-foreground">Placas físicas</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
            Marcos de faturamento acumulado. Ao bater cada um, a placa é produzida e enviada para
            você — independente do nível em que estiver na régua.
          </p>

          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {placas.map((p, i) => {
              const cor = nivelPorNome(p.nome)?.hex ?? 'hsl(var(--level))';
              return (
                <RevealOnScroll
                  as="li"
                  key={p.nome}
                  delay={70 * i}
                  className="group relative flex flex-col overflow-hidden rounded-xl border p-5"
                  style={{
                    borderColor: `${cor}3d`,
                    backgroundImage: `linear-gradient(180deg, ${cor}1a, transparent)`,
                  }}
                >
                  <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="absolute inset-y-0 w-1/3 bg-foreground/15 blur-md animate-sheen" />
                  </span>

                  <div className="relative flex items-center gap-3 mb-2">
                    <Trophy className="h-6 w-6 flex-shrink-0" style={{ color: cor }} />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground leading-tight">{p.nome}</p>
                      <p
                        className="text-xs font-semibold tabular-nums"
                        style={{ color: cor }}
                      >
                        {formatBRL(p.valor_acumulado_minimo)}
                      </p>
                    </div>
                  </div>

                  <p className="relative text-sm text-muted-foreground leading-relaxed">
                    {descricaoDe(p.nome)}
                  </p>
                </RevealOnScroll>
              );
            })}
          </ol>
        </RevealOnScroll>
      )}
    </div>
  );
};
