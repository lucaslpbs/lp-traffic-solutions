import { useState } from 'react';
import { Check, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { STATUS_VENDA, type StatusVenda, type Venda } from './types';
import { cn } from '@/lib/utils';

export const StatusBadge = ({
  status,
  className,
}: {
  status: StatusVenda;
  className?: string;
}) => {
  const cfg = STATUS_VENDA[status] ?? STATUS_VENDA.pendente;
  return (
    <span
      className={cn(
        'rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap',
        cfg.cls,
        className
      )}
    >
      {cfg.label}
    </span>
  );
};

/** Botoes de aprovar / recusar — somente admin. */
export const AprovacaoButtons = ({
  venda,
  onChanged,
}: {
  venda: Venda;
  onChanged: () => void;
}) => {
  const { user } = useAuth();
  const [salvando, setSalvando] = useState<StatusVenda | null>(null);

  const alterar = async (status: StatusVenda, motivo?: string | null) => {
    setSalvando(status);
    const { error } = await (supabase as any)
      .from('ranking_vendas')
      .update({
        status,
        motivo_recusa: status === 'recusada' ? (motivo ?? null) : null,
        aprovada_por: user?.id ?? null,
        aprovada_em: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', venda.id);
    setSalvando(null);

    if (error) {
      console.error(error);
      toast.error('Erro ao atualizar a venda');
      return;
    }
    toast.success(status === 'aprovada' ? 'Venda aprovada — já pontua no ranking' : 'Venda recusada');
    onChanged();
  };

  const recusar = () => {
    const motivo = window.prompt('Motivo da recusa (opcional):') ?? null;
    alterar('recusada', motivo?.trim() || null);
  };

  return (
    <div className="flex items-center gap-1">
      {venda.status !== 'aprovada' && (
        <Button
          size="sm"
          onClick={() => alterar('aprovada')}
          disabled={!!salvando}
          className="bg-emerald-600 hover:bg-emerald-500 text-white h-8"
        >
          {salvando === 'aprovada' ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Check className="h-3.5 w-3.5" />
          )}
          <span className="ml-1 hidden sm:inline">Aprovar</span>
        </Button>
      )}
      {venda.status !== 'recusada' && (
        <Button
          size="sm"
          variant="outline"
          onClick={recusar}
          disabled={!!salvando}
          className="h-8 bg-white/5 border-white/10 text-zinc-300 hover:bg-red-500/10 hover:text-red-400"
        >
          {salvando === 'recusada' ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <X className="h-3.5 w-3.5" />
          )}
          <span className="ml-1 hidden sm:inline">Recusar</span>
        </Button>
      )}
    </div>
  );
};
