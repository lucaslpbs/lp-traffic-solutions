import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedHubRouteProps {
  children: React.ReactNode;
}

export const ProtectedHubRoute = ({ children }: ProtectedHubRouteProps) => {
  const { user, loading, loadingRole } = useAuth();
  const location = useLocation();

  if (loading || loadingRole) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#7c3aed] mx-auto" />
          <p className="mt-4 text-[#a1a1aa]">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
