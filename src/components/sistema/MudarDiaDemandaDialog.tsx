import { useState } from "react";
import { CalendarClock, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  DIAS_SEMANA_CURTO,
  dateKey,
  descreverRecorrencia,
  diffDias,
  parseKey,
  type DemandaFixa,
} from "@/components/sistema/checklistAlertas";

interface Props {
  demanda: DemandaFixa | null;
  /** Ocorrencia (data) que ficou pendente do cliente e acabou de ser concluida. */
  ocorrencia: string | null;
  agora: Date;
  onFechar: () => void;
  onSalvar: (patch: Partial<DemandaFixa>) => Promise<void>;
}

const nomeDia = (key: string) => parseKey(key).toLocaleDateString("pt-BR", { weekday: "long" });

const dataCurta = (key: string) =>
  parseKey(key).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

const mesmosDias = (a: number[], b: number[]) =>
  a.length === b.length && [...a].sort().every((dia, i) => dia === [...b].sort()[i]);

const pill = "font-mono-plex h-8 w-11 rounded-full text-[11px] uppercase tracking-wider border transition-colors";

const Conteudo = ({
  demanda,
  ocorrencia,
  agora,
  onFechar,
  onSalvar,
}: Omit<Props, "demanda" | "ocorrencia"> & { demanda: DemandaFixa; ocorrencia: string }) => {
  const hoje = dateKey(agora);
  const semanal = demanda.recorrencia === "semanal";
  const [semana, setSemana] = useState<number[]>(demanda.dias_semana);
  const [diaMes, setDiaMes] = useState(demanda.dia_mes ? String(demanda.dia_mes) : "");
  const [salvando, setSalvando] = useState(false);

  const diaDoMes = Number(diaMes);
  const valido = semanal ? semana.length > 0 : Number.isInteger(diaDoMes) && diaDoMes >= 1 && diaDoMes <= 31;
  const alterado = semanal ? !mesmosDias(semana, demanda.dias_semana) : diaDoMes !== demanda.dia_mes;

  const toggleDia = (dia: number) =>
    setSemana((prev) => (prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]));

  const usarHoje = () => {
    const d = parseKey(hoje);
    if (semanal) setSemana([d.getDay()]);
    else setDiaMes(String(d.getDate()));
  };

  const salvar = async () => {
    if (!valido || !alterado) return;
    setSalvando(true);
    await onSalvar(semanal ? { dias_semana: [...semana].sort((a, b) => a - b) } : { dia_mes: diaDoMes });
    setSalvando(false);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-foreground flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-primary" />
          Mudar o dia da demanda fixa?
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-1 text-sm">
        <p className="font-medium text-foreground">{demanda.titulo}</p>
        <p className="text-xs text-muted-foreground">
          Era de {nomeDia(ocorrencia)} ({dataCurta(ocorrencia)}) e o cliente só resolveu hoje ({nomeDia(hoje)},{" "}
          {dataCurta(hoje)}), {diffDias(hoje, ocorrencia)} dias depois. Hoje ela se repete:{" "}
          {descreverRecorrencia(demanda).toLowerCase()}.
        </p>
      </div>

      <div className="space-y-2">
        {semanal ? (
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Dias da semana">
            {DIAS_SEMANA_CURTO.map((nome, dia) => {
              const ativo = semana.includes(dia);
              return (
                <button
                  key={nome}
                  type="button"
                  onClick={() => toggleDia(dia)}
                  aria-pressed={ativo}
                  className={`${pill} ${
                    ativo
                      ? "bg-[hsl(var(--alert-red))] border-[hsl(var(--alert-red))] text-white"
                      : "bg-surface-2 border-surface-3 text-muted-foreground hover:border-[hsl(var(--alert-red)/0.6)]"
                  }`}
                >
                  {nome}
                </button>
              );
            })}
          </div>
        ) : (
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            Todo dia
            <Input
              type="number"
              inputMode="numeric"
              min={1}
              max={31}
              value={diaMes}
              onChange={(e) => setDiaMes(e.target.value)}
              className="bg-surface-2 border-surface-3 h-9 w-20 rounded-full px-3 text-center"
            />
          </label>
        )}
        <button type="button" onClick={usarHoje} className="text-xs text-primary hover:underline">
          Usar o dia de hoje ({semanal ? nomeDia(hoje) : `dia ${parseKey(hoje).getDate()}`})
        </button>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onFechar}
          className="px-3.5 py-1.5 rounded-full text-sm border border-border text-foreground/85 hover:bg-surface-3"
        >
          Manter como está
        </button>
        <button
          type="button"
          onClick={salvar}
          disabled={!valido || !alterado || salvando}
          className="px-4 py-1.5 rounded-full text-sm bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-1.5 disabled:opacity-50"
        >
          {salvando && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Salvar novo dia
        </button>
      </div>
    </>
  );
};

/**
 * Janelinha que aparece ao concluir uma demanda que ficou "pendente do cliente"
 * por mais de um dia: o cliente atrasou, entao pode fazer sentido mover o dia
 * fixo (ex.: de sexta para segunda) ou manter como esta.
 */
export const MudarDiaDemandaDialog = ({ demanda, ocorrencia, agora, onFechar, onSalvar }: Props) => (
  <Dialog open={!!demanda && !!ocorrencia} onOpenChange={(aberto) => !aberto && onFechar()}>
    <DialogContent className="bg-surface-1 border-surface-3 text-foreground max-w-md">
      {demanda && ocorrencia && (
        <Conteudo
          key={`${demanda.id}-${ocorrencia}`}
          demanda={demanda}
          ocorrencia={ocorrencia}
          agora={agora}
          onFechar={onFechar}
          onSalvar={onSalvar}
        />
      )}
    </DialogContent>
  </Dialog>
);
