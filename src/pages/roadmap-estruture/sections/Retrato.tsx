import { Blob, CountUp, FillBar, Reveal } from "../components/motion-kit";
import {
  canalLabel,
  controleLabel,
  custoLabel,
  faturamentoLabel,
  fonteLabel,
  formatarBRL,
  funcionariosLabel,
  investimentoLabel,
  margemExibida,
  operacaoLabel,
  papelLabel,
  pedidosLabel,
  tipoCnpjLabel,
} from "../labels";
import type { Diagnostico, Roadmap, RoadmapDestaque } from "../types";

function toneColor(tom?: RoadmapDestaque["tom"]) {
  if (tom === "critico") return "hsl(var(--rme-scarlet))";
  if (tom === "alerta") return "hsl(var(--rme-orange))";
  return "hsl(var(--rme-paper))";
}

function DestaqueBloco({ d, index }: { d: RoadmapDestaque; index: number }) {
  const cor = toneColor(d.tom);
  const decimais =
    typeof d.valorNumerico === "number" && !Number.isInteger(d.valorNumerico) ? 1 : 0;

  return (
    <Reveal delay={index * 0.08} className="min-w-0">
      <div
        className="rme-soft h-full p-7 sm:p-8"
        style={{
          background: "hsl(var(--rme-ink-soft) / 0.75)",
          border: "1px solid hsl(var(--rme-paper) / 0.08)",
          backdropFilter: "blur(6px)",
        }}
      >
        <p className="rme-hairline">{d.label}</p>
        <p
          className="rme-display mt-4 text-[clamp(2rem,4.5vw,3.1rem)]"
          style={{ color: cor }}
        >
          {typeof d.valorNumerico === "number" ? (
            <CountUp
              to={d.valorNumerico}
              decimals={decimais}
              prefix={d.prefixo ?? ""}
              suffix={d.sufixo ?? ""}
            />
          ) : (
            d.valor
          )}
        </p>
        {d.observacao && (
          <p className="mt-4 text-sm leading-relaxed" style={{ color: "hsl(var(--rme-muted))" }}>
            {d.observacao}
          </p>
        )}
      </div>
    </Reveal>
  );
}

function LinhaDado({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div
      className="flex flex-wrap items-baseline justify-between gap-3 py-4"
      style={{ borderTop: "1px solid hsl(var(--rme-paper) / 0.08)" }}
    >
      <span className="rme-hairline">{rotulo}</span>
      <span className="text-[0.98rem] font-medium" style={{ color: "hsl(var(--rme-paper))" }}>
        {valor}
      </span>
    </div>
  );
}

export default function Retrato({
  diagnostico,
  roadmap,
}: {
  diagnostico: Diagnostico;
  roadmap: Roadmap;
}) {
  const { perfil, numeros, margem, aquisicao } = diagnostico;
  const margemAtual = margemExibida(diagnostico);
  const produtos = margem.produtos ?? [];

  return (
    <section className="relative px-6 py-28 sm:px-10 lg:px-20">
      <Blob color="hsl(var(--rme-orange))" size={520} top={120} right={-220} opacity={0.12} speed={-70} />

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <Reveal>
          <span className="rme-eyebrow">Retrato do seu negócio</span>
          <h2 className="rme-display mt-6 max-w-3xl text-[clamp(2rem,5.5vw,3.8rem)]">
            O que os seus números dizem hoje
          </h2>
        </Reveal>

        {roadmap.resumo && (
          <Reveal delay={0.1}>
            <p
              className="mt-8 max-w-3xl text-[1.05rem] leading-[1.85] sm:text-[1.15rem]"
              style={{ color: "hsl(var(--rme-paper-dim))" }}
            >
              {roadmap.resumo}
            </p>
          </Reveal>
        )}

        {roadmap.destaques && roadmap.destaques.length > 0 && (
          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {roadmap.destaques.map((d, i) => (
              <DestaqueBloco key={d.label} d={d} index={i} />
            ))}
          </div>
        )}

        <div className="mt-20 grid gap-14 lg:grid-cols-[1.05fr_1fr]">
          {/* Ficha do diagnóstico */}
          <Reveal>
            <div>
              <h3 className="rme-display text-[clamp(1.4rem,3vw,2rem)]">Sua ficha</h3>
              <div className="mt-6">
                <LinhaDado rotulo="Operação" valor={operacaoLabel[perfil.operacao]} />
                <LinhaDado rotulo="Papel" valor={papelLabel[perfil.papel]} />
                <LinhaDado rotulo="Onde vende" valor={canalLabel[perfil.canal]} />
                <LinhaDado
                  rotulo="CNPJ"
                  valor={
                    perfil.temCnpj
                      ? perfil.tipoCnpj
                        ? tipoCnpjLabel[perfil.tipoCnpj]
                        : "Ativo"
                      : "Não possui"
                  }
                />
                <LinhaDado
                  rotulo="Faturamento mensal"
                  valor={faturamentoLabel[numeros.faturamentoMensal]}
                />
                <LinhaDado rotulo="Pedidos por mês" valor={pedidosLabel[numeros.pedidosMes]} />
                <LinhaDado rotulo="Equipe" valor={funcionariosLabel[numeros.funcionarios]} />
                <LinhaDado
                  rotulo="Vendedores"
                  valor={
                    numeros.temVendedores
                      ? `${numeros.quantidadeVendedores ?? 1} vendedor(es)`
                      : "Nenhum"
                  }
                />
                <LinhaDado rotulo="Controle de vendas" valor={controleLabel[numeros.controle]} />
                <LinhaDado
                  rotulo="Origem dos clientes"
                  valor={aquisicao.fontes.map((f) => fonteLabel[f]).join(" · ") || "—"}
                />
                <LinhaDado
                  rotulo="Tráfego pago"
                  valor={
                    aquisicao.fazTrafegoPago
                      ? [
                          aquisicao.gestaoTrafego === "contrata" ? "Terceirizado" : "Gestão própria",
                          aquisicao.investimentoMensal
                            ? investimentoLabel[aquisicao.investimentoMensal]
                            : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")
                      : "Não investe"
                  }
                />
                {perfil.instagram && (
                  <LinhaDado rotulo="Instagram" valor={perfil.instagram} />
                )}
              </div>
            </div>
          </Reveal>

          {/* Margem */}
          <Reveal delay={0.12}>
            <div>
              <h3 className="rme-display text-[clamp(1.4rem,3vw,2rem)]">Sua margem</h3>

              {typeof margemAtual === "number" && (
                <div className="mt-6">
                  <div className="flex items-end justify-between gap-4">
                    <p
                      className="rme-display text-[clamp(2.8rem,7vw,4.6rem)]"
                      style={{
                        color:
                          margemAtual < 25
                            ? "hsl(var(--rme-scarlet))"
                            : "hsl(var(--rme-orange))",
                      }}
                    >
                      <CountUp to={margemAtual} decimals={1} suffix="%" />
                    </p>
                    <p className="rme-hairline pb-3">
                      {margem.sabeMargemReal ? "informada" : "calculada"}
                    </p>
                  </div>
                  <div className="mt-4">
                    <FillBar
                      value={margemAtual}
                      max={60}
                      tone={margemAtual < 25 ? "scarlet" : "orange"}
                    />
                  </div>
                  {margem.descontaCustosVariaveis === false && (
                    <p
                      className="mt-4 text-sm leading-relaxed"
                      style={{ color: "hsl(var(--rme-scarlet))" }}
                    >
                      Essa margem não desconta frete, embalagem e taxa de cartão — o número real é
                      menor.
                    </p>
                  )}
                </div>
              )}

              {produtos.length > 0 && (
                <div className="mt-10 space-y-4">
                  <p className="rme-hairline">Produtos analisados</p>
                  {produtos.map((p, i) => {
                    const m =
                      typeof p.margemCalculada === "number"
                        ? p.margemCalculada
                        : p.precoVenda > 0
                          ? ((p.precoVenda - p.custo) / p.precoVenda) * 100
                          : 0;
                    return (
                      <Reveal key={`${p.nome}-${i}`} delay={i * 0.06} y={18}>
                        <div
                          className="rme-soft p-5"
                          style={{
                            background: "hsl(var(--rme-ink-soft) / 0.7)",
                            border: "1px solid hsl(var(--rme-paper) / 0.07)",
                          }}
                        >
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <span className="font-semibold">{p.nome}</span>
                            <span
                              className="rme-display text-lg"
                              style={{
                                color:
                                  m < 25 ? "hsl(var(--rme-scarlet))" : "hsl(var(--rme-orange))",
                              }}
                            >
                              {m.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%
                            </span>
                          </div>
                          <p className="mt-2 text-sm" style={{ color: "hsl(var(--rme-muted))" }}>
                            {custoLabel(perfil.papel)} {formatarBRL(p.custo)} · Venda{" "}
                            {formatarBRL(p.precoVenda)}
                          </p>
                          <div className="mt-4">
                            <FillBar value={m} max={60} tone={m < 25 ? "scarlet" : "orange"} />
                          </div>
                        </div>
                      </Reveal>
                    );
                  })}
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
