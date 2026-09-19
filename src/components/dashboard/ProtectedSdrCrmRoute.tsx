import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const SDR_CRM_EMAIL = 'lucaspaulinobs@gmail.com';

/** Aba CRM do SDR — exclusiva do admin Lucas. A edge function `sdr-crm` valida de novo no servidor. */
export const useIsSdrCrmUser = () => {
  const { user, isAdmin } = useAuth();
  return isAdmin && user?.email?.toLowerCase() === SDR_CRM_EMAIL;
};

export const ProtectedSdrCrmRoute = ({ children }: { children: React.ReactNode }) => {
  const { loading, loadingRole } = useAuth();
  const permitido = useIsSdrCrmUser();

  if (loading || loadingRole) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!permitido) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};
