import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, type SessaoColaborador } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect, useRef } from 'react';

interface ProtectedSessionRouteProps {
  /** Sessao que o colaborador precisa ter liberada para entrar. */
  session: SessaoColaborador;
  /**
   * Se true, um usuario logado que nao e admin nem colaborador (ex: login de
   * cliente) continua passando normalmente — usado nas sessoes que ja eram
   * abertas para qualquer logado antes deste guard existir (Sistema, Chamados,
   * Ranking). Se false, esse usuario e redirecionado — mesma semantica que o
   * ProtectedAdminRoute tinha antes (Quarto de Guerra, Gestao de Clientes).
   */
  fallbackAllowed?: boolean;
  children: React.ReactNode;
}

export const ProtectedSessionRoute = ({ session, fallbackAllowed = false, children }: ProtectedSessionRouteProps) => {
  const { user, loading, isAdmin, isColaborador, colaboradorSessoes, loadingRole } = useAuth();
  const location = useLocation();
  const toastShown = useRef(false);

  const temAcesso = isAdmin || (isColaborador && colaboradorSessoes.includes(session));
  const bloqueado = !isAdmin && !temAcesso && !fallbackAllowed;

  useEffect(() => {
    if (!loading && !loadingRole && user && bloqueado && !toastShown.current) {
      toastShown.current = true;
      toast.error('Sem permissao para acessar esta pagina');
    }
  }, [loading, loadingRole, user, bloqueado]);

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

  if (bloqueado) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
