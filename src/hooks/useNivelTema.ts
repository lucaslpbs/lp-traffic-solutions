import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNivelCliente } from '@/components/ranking/nivel';
import { temaDoNivel, type NivelSlug } from '@/components/ranking/niveis';

/**
 * Aplica o tema do nivel do cliente logado no <html>, via data-nivel.
 *
 * Fica no <html> e nao numa div porque Dialog, Popover, Sheet e os toasts
 * renderizam em portal no body — dentro de uma div, so metade da interface
 * mudaria de cor.
 *
 * A query e a mesma (mesma queryKey) que a pagina de ranking ja usa, entao o
 * react-query serve as duas com uma requisicao so.
 */
export const useNivelTema = (): NivelSlug | null => {
  const { clienteVinculadoId } = useAuth();
  const { data: nivel } = useNivelCliente(clienteVinculadoId);
  const slug = temaDoNivel(nivel?.nivel_atual);

  useEffect(() => {
    const root = document.documentElement;
    if (slug) {
      root.dataset.nivel = slug;
    } else {
      delete root.dataset.nivel;
    }
    return () => {
      delete root.dataset.nivel;
    };
  }, [slug]);

  return slug;
};
