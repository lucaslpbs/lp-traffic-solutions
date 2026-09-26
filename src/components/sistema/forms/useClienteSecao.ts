import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const TABLE = "sistema_cliente_secoes";

// A tabela ainda nao esta em integrations/supabase/types.ts (arquivo gerado).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const secoes = () => (supabase as any).from(TABLE);

/**
 * Le/grava o conteudo de uma aba de referencia do cliente (persona, icp...)
 * na tabela `sistema_cliente_secoes` — uma linha por (cliente, secao).
 */
export function useClienteSecao<T extends object>(clientId: string | undefined, secao: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ["sistema-cliente-secao", clientId, secao];

  const query = useQuery({
    queryKey,
    enabled: !!clientId,
    queryFn: async (): Promise<Partial<T> | null> => {
      const { data, error } = await secoes()
        .select("dados")
        .eq("client_id", clientId)
        .eq("secao", secao)
        .maybeSingle();
      if (error) throw error;
      return (data?.dados as Partial<T>) ?? null;
    },
  });

  const gravar = async (dados: T) => {
    if (!clientId) throw new Error("Cliente nao informado");
    const { error } = await secoes().upsert(
      {
        client_id: clientId,
        secao,
        dados,
        updated_by: user?.id ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "client_id,secao" }
    );
    if (error) throw error;
    queryClient.setQueryData(queryKey, dados);
  };

  /** Substitui o documento inteiro (forms com botao Salvar). */
  const save = gravar;

  /**
   * Para listas editadas por varias pessoas (calendario, diario, relatorios):
   * le a versao mais recente do banco, aplica so a mudanca e grava, em vez de
   * sobrescrever com a copia que ficou aberta na tela.
   */
  const update = async (mudar: (atual: Partial<T>) => T): Promise<T> => {
    if (!clientId) throw new Error("Cliente nao informado");
    const { data, error } = await secoes()
      .select("dados")
      .eq("client_id", clientId)
      .eq("secao", secao)
      .maybeSingle();
    if (error) throw error;
    const novo = mudar((data?.dados ?? {}) as Partial<T>);
    await gravar(novo);
    return novo;
  };

  return { data: query.data, isLoading: query.isLoading, isError: query.isError, save, update };
}

/** Estado local de um form de secao: valores, "sujo?", e o submit que grava de verdade. */
export function useSecaoEditor<T>(initial: T, onSave: (valores: T) => Promise<void>) {
  const [values, setValues] = useState<T>(initial);
  const [baseline, setBaseline] = useState(() => JSON.stringify(initial));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const dirty = JSON.stringify(values) !== baseline;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      await onSave(values);
      setBaseline(JSON.stringify(values));
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (err) {
      console.error(`Erro ao salvar secao:`, err);
      toast.error("Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  return { values, setValues, dirty, saving, saved, onSubmit };
}
