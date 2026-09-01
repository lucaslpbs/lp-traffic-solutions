// @ts-nocheck
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect, useRef } from 'react';

/**
 * Guarda /dashboard/influenciadores/:influenciadorId (e as sub-rotas de
 * confirmacao). Admin sempre entra; o proprio influenciador so entra na sua
 * agenda; o cliente so entra se tiver vinculo com esse influenciador em
 * influenciador_clientes.
 */
export const ProtectedInfluencerBoardRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isAdmin, isInfluenciador, influenciadorId, clienteVinculadoId, loadingRole } = useAuth();
  const { influenciadorId: paramId } = useParams<{ influenciadorId: string }>();
  const location = useLocation();
  const toastShown = useRef(false);

  const isOwnInfluencer = isInfluenciador && influenciadorId === paramId;
  const precisaChecarVinculo = !isAdmin && !isOwnInfluencer && !!clienteVinculadoId && !!paramId;

  const { data: temVinculo, isLoading: loadingVinculo } = useQuery({
    queryKey: ['influenciador-cliente-vinculo', paramId, clienteVinculadoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('influenciador_clientes')
        .select('influenciador_id')
        .eq('influenciador_id', paramId)
        .eq('client_id', clienteVinculadoId)
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
    enabled: precisaChecarVinculo,
  });

  const checkingVinculo = precisaChecarVinculo && loadingVinculo;
  const temAcesso = isAdmin || isOwnInfluencer || !!temVinculo;

  useEffect(() => {
    if (!loading && !loadingRole && !checkingVinculo && user && !temAcesso && !toastShown.current) {
      toastShown.current = true;
      toast.error('Sem permissao para acessar esta pagina');
    }
  }, [loading, loadingRole, checkingVinculo, user, temAcesso]);

  if (loading || loadingRole || checkingVinculo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!temAcesso) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
