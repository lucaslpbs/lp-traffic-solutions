import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNivelCliente } from '@/components/ranking/nivel';
import {
  ESTRELAS_POR_NIVEL,
  estrelaPorOrdem,
  nivelPorNome,
} from '@/components/ranking/niveis';
import { cn } from '@/lib/utils';

/**
 * Selo do nivel atual, fixo no rodape da sidebar.
 *
 * Existe para o cliente carregar a identidade dele em qualquer tela do painel,
 * nao so no ranking — e como atalho para a pagina onde ele evolui.
 */
export const NivelBadge = ({ collapsed = false }: { collapsed?: boolean }) => {
  const { clienteVinculadoId } = useAuth();
  const { data: nivel } = useNivelCliente(clienteVinculadoId);

  const meta = nivelPorNome(nivel?.nivel_atual);
  if (!clienteVinculadoId || !meta) return null;

  const estrelas = estrelaPorOrdem(nivel?.ordem_atual);

  if (collapsed) {
    return (
      <Link
        to="/dashboard/ranking"
        title={`${meta.nome} · ${estrelas} de ${ESTRELAS_POR_NIVEL} estrelas`}
        className="focus-ring mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg border border-level/40 bg-level/15"
      >
        <Sparkles className="h-4 w-4 text-level" />
      </Link>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-2 mb-2"
    >
      <Link
        to="/dashboard/ranking"
        className="focus-ring group relative block overflow-hidden rounded-lg border border-level/35 bg-gradient-to-br from-level/20 to-transparent px-3 py-2.5"
      >
        <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="absolute inset-y-0 w-1/3 bg-foreground/15 blur-md animate-sheen" />
        </span>

        <p className="relative text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Meu nível
        </p>
        <div className="relative flex items-center justify-between gap-2 mt-0.5">
          <span className="text-sm font-bold text-level truncate">{meta.nome}</span>
          <span className="flex gap-0.5 flex-shrink-0">
            {Array.from({ length: ESTRELAS_POR_NIVEL }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'h-3 w-3',
                  i < estrelas ? 'fill-level text-level' : 'text-foreground/20'
                )}
              />
            ))}
          </span>
        </div>
      </Link>
    </motion.div>
  );
};
