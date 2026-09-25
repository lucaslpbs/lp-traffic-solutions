import { useMemo, useRef, useState } from "react";
import { BellRing, Check, Hourglass, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  DIAS_SEMANA_CURTO,
  descreverRecorrencia,
  demandaEmAlerta,
  formatDiaCurto,
  formatHorario,
  proximaOcorrencia,
  statusDemanda,
  type DemandaFixa,
  type Recorrencia,
  type StatusDemanda,
} from "@/components/sistema/checklistAlertas";

export interface DemandaForm {
  client_id: string;
  titulo: string;
  responsavel: string;
  recorrencia: Recorrencia;
  dias_semana: number[];
  dia_mes: string;
  data_unica: string;
  horario: string;
}

interface ClienteBasico {
  id: string;
  nome: string;
  status: string;
}

interface Props {
  clientes: ClienteBasico[];
  demandas: DemandaFixa[];
  agora: Date;
  busca: string;
  onSalvar: (valores: DemandaForm, id: string | null) => Promise<boolean>;
  onAlternarAtiva: (demanda: DemandaFixa) => void;
  onExcluir: (demanda: DemandaFixa) => void;
  onMarcarFeita: (status: StatusDemanda) => void;
}

const formVazio: DemandaForm = {
  client_id: "",
  titulo: "",
  responsavel: "",
  recorrencia: "semanal",
  dias_semana: [],
  dia_mes: "",
  data_unica: "",
  horario: "09:00",
};

const opcoesRecorrencia: { id: Recorrencia; label: string }[] = [
  { id: "semanal", label: "Toda semana" },
  { id: "mensal", label: "Todo mês" },
  { id: "unica", label: "Data específica" },
];

const inputCls = "bg-surface-2 border-surface-3 text-foreground";
const pillBase = "font-mono-plex px-3 py-1.5 rounded-full text-[11px] uppercase tracking-wider border transition-colors";
const pillOn = "bg-primary border-primary text-primary-foreground";
const pillOff = "bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground";

const validar = (f: DemandaForm): string | null => {
  if (!f.client_id) return "Escolha o cliente";
  if (!f.titulo.trim()) return "Descreva a demanda";
  if (!f.horario) return "Defina o horário";
  if (f.recorrencia === "semanal" && f.dias_semana.length === 0) return "Marque ao menos um dia da semana";
  if (f.recorrencia === "mensal") {
    const dia = Number(f.dia_mes);
    if (!Number.isInteger(dia) || dia < 1 || dia > 31) return "Informe o dia do mês (1 a 31)";
  }
  if (f.recorrencia === "unica" && !f.data_unica) return "Escolha a data";
  return null;
};

export const DemandasFixasPanel = ({
  clientes,
  demandas,
  agora,
  busca,
  onSalvar,
  onAlternarAtiva,
  onExcluir,
  onMarcarFeita,
}: Props) => {
  const [form, setForm] = useState<DemandaForm>(formVazio);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const patch = (p: Partial<DemandaForm>) => {
    setForm((prev) => ({ ...prev, ...p }));
    setErro(null);
  };

  const toggleDia = (dia: number) =>
    patch({
      dias_semana: form.dias_semana.includes(dia)
        ? form.dias_semana.filter((d) => d !== dia)
        : [...form.dias_semana, dia],
    });

  const resetar = () => {
    setForm(formVazio);
    setEditandoId(null);
    setErro(null);
  };

  const editar = (d: DemandaFixa) => {
    setEditandoId(d.id);
    setErro(null);
    setForm({
      client_id: d.client_id,
      titulo: d.titulo,
      responsavel: d.responsavel || "",
      recorrencia: d.recorrencia,
      dias_semana: d.dias_semana,
      dia_mes: d.dia_mes ? String(d.dia_mes) : "",
      data_unica: d.data_unica || "",
      horario: formatHorario(d.horario),
    });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const submeter = async () => {
    const msg = validar(form);
    if (msg) {
      setErro(msg);
      return;
    }
    setSalvando(true);
    const ok = await onSalvar(form, editandoId);
    setSalvando(false);
    if (ok) resetar();
  };

  const nomePorCliente = useMemo(() => new Map(clientes.map((c) => [c.id, c.nome])), [clientes]);

  const grupos = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const map = new Map<string, DemandaFixa[]>();
    for (const d of demandas) {
      const nome = nomePorCliente.get(d.client_id) || "";
      if (termo && !nome.toLowerCase().includes(termo)) continue;
      if (!map.has(d.client_id)) map.set(d.client_id, []);
      map.get(d.client_id)!.push(d);
    }
    return [...map.entries()]
      .map(([clientId, lista]) => ({ clientId, nome: nomePorCliente.get(clientId) || "Cliente removido", lista }))
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [demandas, nomePorCliente, busca]);

  const clientesOrdenados = useMemo(
    () =>
      [...clientes].sort((a, b) => {
        if ((a.status === "ativo") !== (b.status === "ativo")) return a.status === "ativo" ? -1 : 1;
        return a.nome.localeCompare(b.nome);
      }),
    [clientes]
  );

  return (
    <div className="space-y-5">
      <div
        ref={formRef}
        className="rounded-xl border border-border bg-card/50 p-5 space-y-4 scroll-mt-4"
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.target as HTMLElement).tagName === "INPUT") submeter();
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h4 className="font-serif text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
              <BellRing className="h-4 w-4 text-[hsl(var(--alert-red))]" />
              {editandoId ? "Editar demanda fixa" : "Nova demanda fixa"}
            </h4>
            <p className="text-xs text-muted-foreground max-w-xl">
              Antes do dia ela aparece como um item normal no card do cliente e dá para concluir antes. No dia
              marcado, o card sobe para o topo do quadro em alerta vermelho, mostrando o horário, até você marcar
              como feita. Se você já enviou e falta o cliente, use "Pendente cliente" no card: o alerta sai, mas a
              demanda continua aberta até você concluir.
            </p>
          </div>
          {editandoId && (
            <button
              type="button"
              onClick={resetar}
              className="shrink-0 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
              Cancelar edição
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select
            value={form.client_id}
            onChange={(e) => patch({ client_id: e.target.value })}
            aria-label="Cliente"
            className={`${inputCls} h-9 rounded-full border px-3.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring`}
          >
            <option value="">Cliente…</option>
            {clientesOrdenados.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
                {c.status !== "ativo" ? " (inativo)" : ""}
              </option>
            ))}
          </select>
          <Input
            value={form.titulo}
            onChange={(e) => patch({ titulo: e.target.value })}
            placeholder="Ex.: Gerar saldo de R$ 200 + relatório"
            aria-label="Demanda"
            className={`${inputCls} h-9 rounded-full px-3.5`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {opcoesRecorrencia.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => patch({ recorrencia: o.id })}
              aria-pressed={form.recorrencia === o.id}
              className={`${pillBase} ${form.recorrencia === o.id ? pillOn : pillOff}`}
            >
              {o.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {form.recorrencia === "semanal" && (
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Dias da semana">
              {DIAS_SEMANA_CURTO.map((nome, dia) => {
                const ativo = form.dias_semana.includes(dia);
                return (
                  <button
                    key={nome}
                    type="button"
                    onClick={() => toggleDia(dia)}
                    aria-pressed={ativo}
                    className={`font-mono-plex h-8 w-11 rounded-full text-[11px] uppercase tracking-wider border transition-colors ${
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
          )}
          {form.recorrencia === "mensal" && (
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              Todo dia
              <Input
                type="number"
                inputMode="numeric"
                min={1}
                max={31}
                value={form.dia_mes}
                onChange={(e) => patch({ dia_mes: e.target.value })}
                className={`${inputCls} h-9 w-20 rounded-full px-3 text-center`}
              />
              <span className="text-xs">(em meses mais curtos vale o último dia)</span>
            </label>
          )}
          {form.recorrencia === "unica" && (
            <Input
              type="date"
              value={form.data_unica}
              onChange={(e) => patch({ data_unica: e.target.value })}
              aria-label="Data"
              className={`${inputCls} h-9 w-44 rounded-full px-3.5`}
            />
          )}

          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            às
            <Input
              type="time"
              value={form.horario}
              onChange={(e) => patch({ horario: e.target.value })}
              className={`${inputCls} h-9 w-28 rounded-full px-3.5`}
            />
          </label>

          <Input
            value={form.responsavel}
            onChange={(e) => patch({ responsavel: e.target.value })}
            list="checklist-responsaveis"
            placeholder="Resp."
            aria-label="Responsável"
            className={`${inputCls} h-9 w-28 rounded-full px-3.5`}
          />
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          <p className="text-xs text-destructive min-h-4" role="alert">
            {erro}
          </p>
          <button
            type="button"
            onClick={submeter}
            disabled={salvando}
            className="px-4 py-1.5 rounded-full text-sm bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-1.5 disabled:opacity-60"
          >
            {salvando ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            {editandoId ? "Salvar alterações" : "Cadastrar demanda fixa"}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {grupos.map((g) => (
          <section key={g.clientId} className="space-y-1.5">
            <h5 className="font-mono-plex text-[11px] uppercase tracking-wider text-muted-foreground px-1">
              {g.nome}
            </h5>
            <ul className="space-y-1.5">
              {g.lista.map((d) => {
                const status = statusDemanda(d, agora);
                const proxima = proximaOcorrencia(d, agora);
                const emAlerta = !!status && demandaEmAlerta(status);
                return (
                  <li
                    key={d.id}
                    className={`flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border px-3.5 py-2.5 ${
                      emAlerta ? "alert-surface" : "border-border bg-card/40"
                    } ${d.ativo ? "" : "opacity-60"}`}
                  >
                    <div className="flex-1 min-w-[12rem]">
                      <p className="text-[13.5px] font-medium text-foreground">{d.titulo}</p>
                      <p className="font-mono-plex text-[10px] uppercase tracking-wider text-muted-foreground">
                        {descreverRecorrencia(d)}
                        {d.responsavel && <> · {d.responsavel}</>}
                      </p>
                      {status?.observacao && (
                        <p className="mt-0.5 text-[11px] italic text-warning/90">{status.observacao}</p>
                      )}
                    </div>

                    {!d.ativo ? (
                      <span className="font-mono-plex text-[10px] uppercase tracking-wider text-muted-foreground">
                        Pausada
                      </span>
                    ) : emAlerta ? (
                      <button
                        type="button"
                        onClick={() => onMarcarFeita(status!)}
                        title="Marcar como feita"
                        className="font-mono-plex flex items-center gap-1.5 rounded-full bg-[hsl(var(--alert-red))] px-2.5 py-1 text-[10px] uppercase tracking-wider text-white hover:brightness-125"
                      >
                        <Check className="h-3 w-3" />
                        {status!.rotulo}
                      </button>
                    ) : status?.estado === "aguardando" ? (
                      <button
                        type="button"
                        onClick={() => onMarcarFeita(status)}
                        title="Cliente respondeu: concluir"
                        className="font-mono-plex flex items-center gap-1.5 rounded-full bg-[hsl(var(--wait-blue))] px-2.5 py-1 text-[10px] uppercase tracking-wider text-white hover:brightness-125"
                      >
                        <Hourglass className="h-3 w-3" />
                        {status.rotulo}
                      </button>
                    ) : status?.estado === "feita" ? (
                      <button
                        type="button"
                        onClick={() => onMarcarFeita(status)}
                        title="Desfazer"
                        className="font-mono-plex rounded-full border border-success/40 bg-success/15 px-2.5 py-1 text-[10px] uppercase tracking-wider text-success"
                      >
                        {status.rotulo}
                      </button>
                    ) : proxima ? (
                      <span className="font-mono-plex text-[10px] uppercase tracking-wider text-muted-foreground">
                        Próxima: {formatDiaCurto(proxima)} {formatHorario(d.horario)}
                      </span>
                    ) : (
                      <span className="font-mono-plex text-[10px] uppercase tracking-wider text-muted-foreground">
                        Encerrada
                      </span>
                    )}

                    <div className="flex items-center gap-2 shrink-0">
                      <Switch
                        checked={d.ativo}
                        onCheckedChange={() => onAlternarAtiva(d)}
                        aria-label={d.ativo ? "Pausar demanda" : "Ativar demanda"}
                        title={d.ativo ? "Pausar" : "Ativar"}
                      />
                      <button
                        type="button"
                        onClick={() => editar(d)}
                        className="text-muted-foreground hover:text-primary"
                        title="Editar"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onExcluir(d)}
                        className="text-muted-foreground hover:text-destructive"
                        title="Excluir"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
        {grupos.length === 0 && (
          <p className="text-sm text-muted-foreground py-6 text-center">
            {demandas.length === 0
              ? "Nenhuma demanda fixa cadastrada ainda. Cadastre acima, por exemplo: “Gerar saldo de R$ 200 + relatório”, toda terça às 11:00."
              : "Nenhuma demanda fixa para esta busca."}
          </p>
        )}
      </div>
    </div>
  );
};
