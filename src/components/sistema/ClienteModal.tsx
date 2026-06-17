import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, FileText, Workflow } from "lucide-react";
import { Cliente, subAreasModal } from "@/lib/sistemaMockData";
import { PersonaForm } from "./PersonaForm";
import { ICPForm } from "./forms/ICPForm";
import { EscopoForm } from "./forms/EscopoForm";
import { HistoriasForm } from "./forms/HistoriasForm";
import { BibliotecaForm } from "./forms/BibliotecaForm";
import { CanaisForm } from "./forms/CanaisForm";
import { LinhasEditoriaisForm } from "./forms/LinhasEditoriaisForm";
import { CalendarioEditorialForm } from "./forms/CalendarioEditorialForm";
import { RelatoriosForm } from "./forms/RelatoriosForm";
import { OtimizacaoForm } from "./forms/OtimizacaoForm";
import { DiarioBordoForm } from "./forms/DiarioBordoForm";

interface Props {
  cliente: Cliente | null;
  onClose: () => void;
}

export const ClienteModal = ({ cliente, onClose }: Props) => {
  const [subArea, setSubArea] = useState<string | null>(null);

  if (!cliente) return null;

  const renderSubArea = () => {
    switch (subArea) {
      case "Persona": return <PersonaForm />;
      case "ICP": return <ICPForm />;
      case "Escopo do trabalho": return <EscopoForm />;
      case "Diretório de histórias do especialista": return <HistoriasForm />;
      case "Biblioteca de estudos e referências": return <BibliotecaForm />;
      case "Canais de comunicação": return <CanaisForm />;
      case "Linhas editoriais": return <LinhasEditoriaisForm />;
      case "Calendário editorial": return <CalendarioEditorialForm />;
      case "Relatórios": return <RelatoriosForm />;
      case "Otimização": return <OtimizacaoForm />;
      case "Diário de Bordo": return <DiarioBordoForm />;
      default:
        return (
          <Textarea
            className="min-h-[400px] bg-[#1c1c1e] border-[#2a2a2a] text-white"
            placeholder={`Descreva ${subArea?.toLowerCase()}...`}
          />
        );
    }
  };

  return (
    <Sheet open={!!cliente} onOpenChange={(o) => { if (!o) { setSubArea(null); onClose(); } }}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl bg-[#111111] border-[#2a2a2a] text-white overflow-y-auto"
      >
        <SheetHeader className="space-y-3 border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-lg font-bold text-[#3b82f6]">
              {cliente.nome.charAt(0)}
            </div>
            <div className="flex-1">
              <SheetTitle className="text-zinc-100">{cliente.nome}</SheetTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={cliente.status === "ativo" ? "bg-emerald-600/20 text-emerald-400 border-emerald-700" : "bg-zinc-700/30 text-zinc-400 border-zinc-700"}>
                  {cliente.status === "ativo" ? "Ativo" : "Inativo"}
                </Badge>
                <span className="text-xs text-zinc-500">{cliente.servico} · {cliente.periodo}</span>
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="pt-5">
          {subArea ? (
            <div className="space-y-4">
              <button
                onClick={() => setSubArea(null)}
                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200"
              >
                <ChevronLeft className="h-3 w-3" /> Voltar
              </button>
              <h3 className="text-lg font-semibold">{subArea}</h3>
              {renderSubArea()}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3 text-zinc-300">
                  <FileText className="h-4 w-4 text-[#3b82f6]" />
                  <h4 className="font-semibold">Materiais de referência</h4>
                </div>
                <ul className="space-y-1">
                  {subAreasModal.referencia.map((item) => (
                    <li key={item}>
                      <button
                        onClick={() => setSubArea(item)}
                        className="w-full text-left px-3 py-2 rounded-md text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white border border-transparent hover:border-zinc-800"
                      >
                        {item}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3 text-zinc-300">
                  <Workflow className="h-4 w-4 text-[#3b82f6]" />
                  <h4 className="font-semibold">Fluxo de trabalho</h4>
                </div>
                <ul className="space-y-1">
                  {subAreasModal.fluxo.map((item) => (
                    <li key={item}>
                      <button
                        onClick={() => setSubArea(item)}
                        className="w-full text-left px-3 py-2 rounded-md text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white border border-transparent hover:border-zinc-800"
                      >
                        {item}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
