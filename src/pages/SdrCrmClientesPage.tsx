import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ChevronRight, MessagesSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { ListSkeleton } from '@/components/dashboard/Skeletons';
import { sdrCrm, type CrmClienteResumo } from '@/lib/sdrCrmApi';
import { SdrCrmView } from '@/pages/SdrCrmPage';

const LISTA_URL = '/dashboard/crm-clientes';

/** Clientes com CRM ligado e configurado. Exclusivo do admin Lucas — a funcao recusa qualquer outro usuario. */
const useCrmClientes = () =>
  useQuery({
    queryKey: ['sdr-crm-clientes'],
    queryFn: async () => (await sdrCrm<{ clientes: CrmClienteResumo[] }>('clientes')).clientes,
    staleTime: 30_000,
  });

/** Rota /dashboard/crm-clientes: escolhe de qual cliente abrir o CRM. */
export default function SdrCrmClientesPage() {
  const { data: clientes = [], isLoading, error } = useCrmClientes();

  return (
    <div className="p-4 md:p-6 space-y-4">
      <PageHeader
        title="CRM Clientes"
        subtitle="Escolha um cliente para acompanhar as conversas do SDR dele."
        icon={MessagesSquare}
      />

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {(error as Error).message}
        </div>
      )}

      {isLoading ? (
        <ListSkeleton rows={4} />
      ) : clientes.length === 0 && !error ? (
        <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground space-y-1">
          <MessagesSquare className="h-10 w-10 mx-auto mb-2 opacity-40" />
          <p>Nenhum cliente com CRM ainda.</p>
          <p>
            Ligue &quot;CRM do SDR&quot; em Gestão de Clientes e vincule o token do cliente na tabela
            crm_clientes.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {clientes.map((c) => (
            <Link
              key={c.client_id}
              to={`${LISTA_URL}/${c.client_id}`}
              className="group flex items-center justify-between gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-foreground/5"
            >
              <span className="flex items-center gap-3 min-w-0">
                <MessagesSquare className="h-5 w-5 shrink-0 text-muted-foreground" />
                <span className="font-medium truncate">{c.nome}</span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/** Rota /dashboard/crm-clientes/:crmClientId: o CRM de um cliente, com volta para a lista. */
export function SdrCrmClienteDetalhePage() {
  const { crmClientId } = useParams<{ crmClientId: string }>();
  const navigate = useNavigate();
  const { data: clientes = [], isLoading } = useCrmClientes();

  if (isLoading) {
    return (
      <div className="p-4 md:p-6">
        <ListSkeleton rows={4} />
      </div>
    );
  }

  const cliente = clientes.find((c) => c.client_id === crmClientId);
  if (!cliente) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Button variant="outline" size="sm" onClick={() => navigate(LISTA_URL)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Todos os clientes
        </Button>
        <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
          Este cliente não tem CRM ativo.
        </div>
      </div>
    );
  }

  // key: trocar de cliente remonta a tela inteira (conversa aberta, busca e filtros nao vazam de um para outro).
  return (
    <SdrCrmView
      key={cliente.client_id}
      clienteId={cliente.client_id}
      nomeCliente={cliente.nome}
      onVoltar={() => navigate(LISTA_URL)}
    />
  );
}
