import { Fragment, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useClienteSecao } from "./useClienteSecao";

interface SecaoLoaderProps<T extends object> {
  clientId?: string;
  secao: string;
  /** Nome usado na mensagem de erro de carregamento. */
  rotulo: string;
  children: (props: {
    initial: Partial<T>;
    save: (dados: T) => Promise<void>;
    update: (mudar: (atual: Partial<T>) => T) => Promise<T>;
  }) => ReactNode;
}

/**
 * Carrega o conteudo salvo de uma secao do cliente e so entao monta o editor
 * (que usa `initial` apenas na montagem). Cuida de loading e erro.
 */
export function SecaoLoader<T extends object>({
  clientId,
  secao,
  rotulo,
  children,
}: SecaoLoaderProps<T>) {
  const { data, isLoading, isError, save, update } = useClienteSecao<T>(clientId, secao);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  if (isError) {
    return (
      <p className="text-sm text-destructive">
        Erro ao carregar {rotulo}. Recarregue a página.
      </p>
    );
  }

  return <Fragment key={clientId}>{children({ initial: data ?? {}, save, update })}</Fragment>;
}
