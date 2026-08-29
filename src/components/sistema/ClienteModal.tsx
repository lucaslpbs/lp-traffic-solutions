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
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm p-4 md:p-8"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-5xl h-[85vh] bg-surface-1 border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-lg bg-card border border-border flex items-center justify-center overflow-hidden shrink-0">
              {cliente.logo ? (
                <img
                  src={cliente.logo}
                  alt={cliente.nome}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-sm font-bold text-primary">
                  {cliente.nome.charAt(0)}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-foreground truncate">
                {cliente.nome}
              </h2>
              <Badge
                className={`text-[10px] h-4 ${
                  cliente.status === "ativo"
                    ? "bg-success/20 text-success border-success"
                    : "bg-zinc-700/30 text-muted-foreground border-border"
                }`}
              >
                {cliente.status === "ativo" ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleExpand}
              className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-3 transition-colors"
              title="Expandir para página"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-3 transition-colors"
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
