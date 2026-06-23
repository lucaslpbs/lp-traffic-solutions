import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { X, Maximize2 } from "lucide-react";
import { SistemaCliente } from "./ClienteGallery";
import { ClienteContent } from "./ClienteContent";

interface Props {
  cliente: SistemaCliente | null;
  onClose: () => void;
}

export const ClienteModal = ({ cliente, onClose }: Props) => {
  const navigate = useNavigate();

  if (!cliente) return null;

  const handleExpand = () => {
    onClose();
    navigate(`/dashboard/sistema/cliente/${cliente.id}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-8"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-5xl h-[85vh] bg-[#111111] border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
              {cliente.logo ? (
                <img
                  src={cliente.logo}
                  alt={cliente.nome}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-sm font-bold text-[#3b82f6]">
                  {cliente.nome.charAt(0)}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-white truncate">
                {cliente.nome}
              </h2>
              <Badge
                className={`text-[10px] h-4 ${
                  cliente.status === "ativo"
                    ? "bg-emerald-600/20 text-emerald-400 border-emerald-700"
                    : "bg-zinc-700/30 text-zinc-400 border-zinc-700"
                }`}
              >
                {cliente.status === "ativo" ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleExpand}
              className="h-8 w-8 rounded-md flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Expandir para página"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-md flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Fechar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Shared sidebar + content */}
        <ClienteContent clientId={cliente.id} />
      </div>
    </div>
  );
};
