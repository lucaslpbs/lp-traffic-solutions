import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect, useRef } from 'react';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export const ProtectedAdminRoute = ({ children }: ProtectedAdminRouteProps) => {
  const { user, loading, isAdmin, loadingRole } = useAuth();
  const location = useLocation();
  const toastShown = useRef(false);

  useEffect(() => {
    if (!loading && !loadingRole && user && !isAdmin && !toastShown.current) {
      toastShown.current = true;
      toast.error('Sem permissao para acessar esta pagina');
    }
  }, [loading, loadingRole, user, isAdmin]);

  if (loading || loadingRole) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#3b82f6] mx-auto" />
          <p className="mt-4 text-[#a1a1aa]">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
