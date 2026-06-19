import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  clienteVinculadoId: string | null;
  loadingRole: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [clienteVinculadoId, setClienteVinculadoId] = useState<string | null>(null);
  const [loadingRole, setLoadingRole] = useState(true);

  const fetchUserRole = async (userId: string) => {
    setLoadingRole(true);
    try {
      const { data, error } = await supabase.rpc('user_is_admin', { user_id: userId });
      if (error) throw error;

      if (data === true) {
        setIsAdmin(true);
        setClienteVinculadoId(null);
      } else {
        setIsAdmin(false);
        const { data: uc, error: ucError } = await supabase
          .from('users_clients')
          .select('client_id')
          .eq('user_id', userId)
          .maybeSingle();
        if (ucError) throw ucError;
        setClienteVinculadoId(uc?.client_id ?? null);
      }
    } catch (err) {
      console.error('Erro ao buscar papel do usuario:', err);
      setIsAdmin(false);
      setClienteVinculadoId(null);
    } finally {
      setLoadingRole(false);
    }
  };

  const clearRole = () => {
    setIsAdmin(false);
    setClienteVinculadoId(null);
    setLoadingRole(false);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (session?.user) {
          fetchUserRole(session.user.id);
        } else {
          clearRole();
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        clearRole();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, clienteVinculadoId, loadingRole, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
