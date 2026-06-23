import { useState } from "react";
import { FileText, Workflow } from "lucide-react";
import { subAreasModal } from "@/lib/sistemaMockData";
import { Textarea } from "@/components/ui/textarea";
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

interface ClienteContentProps {
  clientId: string;
}

const allSubAreas = [...subAreasModal.referencia, ...subAreasModal.fluxo];

export const ClienteContent = ({ clientId }: ClienteContentProps) => {
  const [subArea, setSubArea] = useState<string>(subAreasModal.referencia[0]);

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
      case "Otimização": return <OtimizacaoForm clientId={clientId} />;
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
    <div className="flex flex-col md:flex-row flex-1 min-h-0">
      {/* Mobile: horizontal scrollable tabs */}
      <div className="md:hidden border-b border-zinc-800 overflow-x-auto shrink-0">
        <div className="flex px-3 py-2 gap-1 min-w-max">
          {allSubAreas.map((item) => (
            <button
              key={item}
              onClick={() => setSubArea(item)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-md text-xs transition-colors ${
                subArea === item
                  ? "bg-[#3b82f6]/15 text-[#3b82f6]"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop: sidebar */}
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-zinc-800 overflow-y-auto py-3">
        <div className="px-4 mb-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
            <FileText className="h-3 w-3" />
            Materiais de referência
          </div>
        </div>
        {subAreasModal.referencia.map((item) => (
          <button
            key={item}
            onClick={() => setSubArea(item)}
            className={`w-full text-left px-4 py-1.5 text-[13px] transition-colors ${
              subArea === item
                ? "bg-[#3b82f6]/10 text-[#3b82f6] border-r-2 border-[#3b82f6]"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
            }`}
          >
            {item}
          </button>
        ))}
        <div className="px-4 mt-5 mb-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
            <Workflow className="h-3 w-3" />
            Fluxo de trabalho
          </div>
        </div>
        {subAreasModal.fluxo.map((item) => (
          <button
            key={item}
            onClick={() => setSubArea(item)}
            className={`w-full text-left px-4 py-1.5 text-[13px] transition-colors ${
              subArea === item
                ? "bg-[#3b82f6]/10 text-[#3b82f6] border-r-2 border-[#3b82f6]"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
            }`}
          >
            {item}
          </button>
        ))}
      </aside>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto p-5 md:p-6">
        <h2 className="text-lg font-semibold text-white mb-5">{subArea}</h2>
        {renderSubArea()}
      </div>
    </div>
  );
};
