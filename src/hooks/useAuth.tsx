// @ts-nocheck
import { useState, useEffect, useRef, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type SessaoColaborador = 'guerra' | 'gestao_clientes' | 'sistema' | 'chamados' | 'ranking';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  clienteVinculadoId: string | null;
  isRemoved: boolean;
  isColaborador: boolean;
  colaboradorInativo: boolean;
  colaboradorClientIds: string[];
  colaboradorClientAccountNumbers: string[];
  colaboradorSessoes: SessaoColaborador[];
  isInfluenciador: boolean;
  influenciadorId: string | null;
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
  const [isRemoved, setIsRemoved] = useState(false);
  const [isColaborador, setIsColaborador] = useState(false);
  const [colaboradorInativo, setColaboradorInativo] = useState(false);
  const [colaboradorClientIds, setColaboradorClientIds] = useState<string[]>([]);
  const [colaboradorClientAccountNumbers, setColaboradorClientAccountNumbers] = useState<string[]>([]);
  const [colaboradorSessoes, setColaboradorSessoes] = useState<SessaoColaborador[]>([]);
  const [isInfluenciador, setIsInfluenciador] = useState(false);
  const [influenciadorId, setInfluenciadorId] = useState<string | null>(null);
  const [loadingRole, setLoadingRole] = useState(true);
  const roleFetchedForUser = useRef<string | null>(null);

  const fetchUserRole = async (userId: string, force = false) => {
    if (!force && roleFetchedForUser.current === userId) return;

    if (!roleFetchedForUser.current) {
      setLoadingRole(true);
    }

    try {
      const { data, error } = await supabase.rpc('user_is_admin', { user_id: userId });
      if (error) throw error;

      if (data === true) {
        setIsAdmin(true);
        setClienteVinculadoId(null);
        setIsRemoved(false);
        setIsColaborador(false);
        setColaboradorInativo(false);
        setColaboradorClientIds([]);
        setColaboradorClientAccountNumbers([]);
        setColaboradorSessoes([]);
        setIsInfluenciador(false);
        setInfluenciadorId(null);
        roleFetchedForUser.current = userId;
        return;
      }

      setIsAdmin(false);

      const { data: colaborador, error: colaboradorError } = await supabase
        .from('colaboradores')
        .select('ativo')
        .eq('user_id', userId)
        .maybeSingle();
      if (colaboradorError) throw colaboradorError;

      if (colaborador) {
        setClienteVinculadoId(null);
        setIsRemoved(false);
        setIsInfluenciador(false);
        setInfluenciadorId(null);

        if (!colaborador.ativo) {
          setIsColaborador(false);
          setColaboradorInativo(true);
          setColaboradorClientIds([]);
          setColaboradorClientAccountNumbers([]);
          setColaboradorSessoes([]);
          roleFetchedForUser.current = userId;
          return;
        }

        setIsColaborador(true);
        setColaboradorInativo(false);

        const [{ data: clientRows }, { data: sessaoRows }] = await Promise.all([
          supabase
            .from('colaborador_clientes')
            .select('client_id, gestao_clientes(id, numero_conta_anuncio)')
            .eq('user_id', userId),
          supabase
            .from('colaborador_sessoes')
            .select('sessao')
            .eq('user_id', userId),
        ]);

        setColaboradorClientIds((clientRows ?? []).map((row) => row.client_id));
        setColaboradorClientAccountNumbers(
          (clientRows ?? [])
            .map((row) => row.gestao_clientes?.numero_conta_anuncio)
            .filter((v): v is string => !!v)
        );
        setColaboradorSessoes((sessaoRows ?? []).map((row) => row.sessao as SessaoColaborador));

        roleFetchedForUser.current = userId;
        return;
      }

      setIsColaborador(false);
      setColaboradorInativo(false);
      setColaboradorClientIds([]);
      setColaboradorClientAccountNumbers([]);
      setColaboradorSessoes([]);

      const { data: influenciador, error: influenciadorError } = await supabase
        .from('influenciadores')
        .select('id, ativo')
        .eq('user_id', userId)
        .maybeSingle();
      if (influenciadorError) throw influenciadorError;

      if (influenciador) {
        setClienteVinculadoId(null);
        setIsRemoved(false);
        setIsInfluenciador(!!influenciador.ativo);
        setInfluenciadorId(influenciador.id);
        roleFetchedForUser.current = userId;
        return;
      }

      setIsInfluenciador(false);
      setInfluenciadorId(null);

      const { data: uc, error: ucError } = await supabase
        .from('users_clients')
        .select('client_id')
        .eq('user_id', userId)
        .maybeSingle();
      if (ucError) throw ucError;
      setClienteVinculadoId(uc?.client_id ?? null);

      if (!uc?.client_id) {
        const { data: removed } = await supabase
          .from('clientes_removidos')
          .select('id')
          .eq('user_id', userId)
          .limit(1)
          .maybeSingle();
        setIsRemoved(!!removed);
      } else {
        setIsRemoved(false);
      }
      roleFetchedForUser.current = userId;
    } catch (err) {
      console.error('Erro ao buscar papel do usuario:', err);
      setIsAdmin(false);
      setClienteVinculadoId(null);
      setIsInfluenciador(false);
      setInfluenciadorId(null);
    } finally {
      setLoadingRole(false);
    }
  };

  const clearRole = () => {
    setIsAdmin(false);
    setClienteVinculadoId(null);
    setIsRemoved(false);
    setIsColaborador(false);
    setColaboradorInativo(false);
    setColaboradorClientIds([]);
    setColaboradorClientAccountNumbers([]);
    setColaboradorSessoes([]);
    setIsInfluenciador(false);
    setInfluenciadorId(null);
    setLoadingRole(false);
    roleFetchedForUser.current = null;
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (session?.user) {
          const isNewUser = event === 'SIGNED_IN' && roleFetchedForUser.current !== session.user.id;
          fetchUserRole(session.user.id, isNewUser);
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
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAdmin,
        clienteVinculadoId,
        isRemoved,
        isColaborador,
        colaboradorInativo,
        colaboradorClientIds,
        colaboradorClientAccountNumbers,
        colaboradorSessoes,
        isInfluenciador,
        influenciadorId,
        loadingRole,
        signIn,
        signOut,
      }}
    >
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
