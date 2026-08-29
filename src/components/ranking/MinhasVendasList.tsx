import { useMemo, useState } from 'react';
import { Pencil, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Stagger, StaggerItem } from '@/components/dashboard/Motion';
import { ListSkeleton } from '@/components/dashboard/Skeletons';
import { PeriodoFilter, type Periodo } from './PeriodoFilter';
import { StatusBadge } from './VendaStatus';
import { formatBRL, formatDataBR, type Venda } from './types';

interface MinhasVendasListProps {
  vendas: Venda[];
  loading: boolean;
  periodo: Periodo;
  onPeriodoChange: (p: Periodo) => void;
  /** id do cliente final -> nome, para rotular o comprador de cada venda. */
  nomeComprador: Map<string, string>;
  onEditar: (venda: Venda) => void;
}

/** Lista "Minhas vendas", com filtro de periodo proprio e visor do print. */
export const MinhasVendasList = ({
  vendas,
  loading,
  periodo,
  onPeriodoChange,
  nomeComprador,
  onEditar,
}: MinhasVendasListProps) => {
  const [printAberto, setPrintAberto] = useState<string | null>(null);

  const pendentes = useMemo(() => vendas.filter((v) => v.status === 'pendente'), [vendas]);

  return (
    <>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Minhas vendas</h2>
            <p className="text-sm text-muted-foreground">
              {vendas.length} {vendas.length === 1 ? 'registro' : 'registros'}
              {pendentes.length > 0 && (
                <span className="text-warning"> · {pendentes.length} em análise</span>
              )}
            </p>
          </div>
          <PeriodoFilter value={periodo} onChange={onPeriodoChange} />
        </div>

        {loading ? (
          <div className="p-4">
            <ListSkeleton rows={4} />
          </div>
        ) : vendas.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            Você ainda não registrou vendas neste período.
          </p>
        ) : (
          <Stagger className="divide-y divide-border" stagger={0.03}>
            {vendas.map((v) => (
              <StaggerItem key={v.id}>
                <div className="flex items-center gap-4 px-4 py-3">
                  {v.foto_url ? (
                    <button
                      type="button"
                      onClick={() => setPrintAberto(v.foto_url)}
                      aria-label="Ver print da venda"
                      className="focus-ring rounded-lg flex-shrink-0"
                    >
                      <img
                        src={v.foto_url}
                        alt=""
                        className="h-12 w-12 rounded-lg object-cover border border-border hover:border-level transition-colors"
                      />
                    </button>
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-surface-2 border border-border flex items-center justify-center flex-shrink-0">
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground tabular-nums">
                      {formatBRL(v.valor)}
                      {v.cliente_final_id && nomeComprador.get(v.cliente_final_id) && (
                        <span className="ml-2 text-sm font-normal text-level">
                          {nomeComprador.get(v.cliente_final_id)}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDataBR(v.data)}
                      {v.descricao ? ` • ${v.descricao}` : ''}
                    </p>
                    {v.status === 'recusada' && v.motivo_recusa && (
                      <p className="text-xs text-destructive mt-0.5">Motivo: {v.motivo_recusa}</p>
                    )}
                  </div>

                  <StatusBadge status={v.status} />

                  {/* cliente so edita enquanto a venda esta em analise; excluir e so do admin */}
                  {v.status === 'pendente' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEditar(v)}
                      aria-label="Editar venda"
                      className="text-muted-foreground hover:text-foreground hover:bg-foreground/10"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </div>

      <Dialog open={!!printAberto} onOpenChange={() => setPrintAberto(null)}>
        <DialogContent className="max-w-3xl p-2">
          {printAberto && (
            <img src={printAberto} alt="Print da venda" className="w-full rounded-lg object-contain" />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
