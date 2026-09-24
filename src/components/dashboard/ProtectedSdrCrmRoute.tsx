import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const SDR_CRM_EMAIL = 'lucaspaulinobs@gmail.com';

/**
 * Aba CRM do SDR. Quem acessa:
 *  - o admin Lucas: o SDR da propria Traffic;
 *  - o cliente com "CRM do SDR" ligado em Gestao de Clientes (gestao_clientes.crm_ativo): so as
 *    conversas do SDR dele.
 * Isto so decide a interface — a edge function `sdr-crm` valida tudo de novo no servidor e deriva
 * o cliente do login, nunca do que o navegador manda.
 */
export const useSdrCrmAcesso = () => {
  const { user, isAdmin, isColaborador, isInfluenciador, clienteVinculadoId } = useAuth();

  const ehLucas = isAdmin && user?.email?.toLowerCase() === SDR_CRM_EMAIL;
  const souClienteSimples = !isAdmin && !isColaborador && !isInfluenciador && !!clienteVinculadoId;

  const { data: crmAtivo, isLoading } = useQuery({
    queryKey: ['crm-ativo-cliente', clienteVinculadoId],
    enabled: souClienteSimples,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('gestao_clientes')
        .select('crm_ativo')
        .eq('id', clienteVinculadoId)
        .maybeSingle();
      if (error) throw error;
      return (data as { crm_ativo: boolean } | null)?.crm_ativo === true;
    },
  });

  return {
    ehLucas,
    permitido: ehLucas || (souClienteSimples && crmAtivo === true),
    carregando: souClienteSimples && isLoading,
  };
};

export const useIsSdrCrmUser = () => useSdrCrmAcesso().permitido;

interface ProtectedSdrCrmRouteProps {
  children: React.ReactNode;
  /** Telas que enxergam varios clientes (CRM Clientes): so o Lucas, nunca um cliente. */
  somenteLucas?: boolean;
}

export const ProtectedSdrCrmRoute = ({ children, somenteLucas = false }: ProtectedSdrCrmRouteProps) => {
  const { loading, loadingRole } = useAuth();
  const { ehLucas, permitido: permitidoBase, carregando } = useSdrCrmAcesso();
  const permitido = somenteLucas ? ehLucas : permitidoBase;

  if (loading || loadingRole || carregando) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!permitido) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};
