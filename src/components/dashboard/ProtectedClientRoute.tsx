import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect, useRef } from 'react';

/**
 * Guarda a rota /dashboard/:clientId (relatorio de um cliente especifico,
 * identificado pelo numero_conta_anuncio). Admin sempre entra; colaborador
 * so entra se o cliente estiver entre os liberados pra ele.
 */
export const ProtectedClientRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isAdmin, isColaborador, colaboradorClientAccountNumbers, loadingRole } = useAuth();
  const { clientId } = useParams<{ clientId: string }>();
  const location = useLocation();
  const toastShown = useRef(false);

  const temAcesso = isAdmin || (isColaborador && !!clientId && colaboradorClientAccountNumbers.includes(clientId));

  useEffect(() => {
    if (!loading && !loadingRole && user && !temAcesso && !toastShown.current) {
      toastShown.current = true;
      toast.error('Sem permissao para acessar esta pagina');
    }
  }, [loading, loadingRole, user, temAcesso]);

  if (loading || loadingRole) {
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
