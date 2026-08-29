import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Phone, Search, Sparkles, UserPlus, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  useClientesFinais,
  useResumoClientesFinais,
  RESUMO_VAZIO,
  soDigitos,
} from './clientesFinais';
import { formatBRL, formatDataBR } from './types';

/**
 * Bloco "Meus clientes" — lista os compradores cadastrados pelo cliente,
 * com quanto cada um ja comprou, e permite cadastrar um novo.
 */
export const ClientesFinaisPanel = ({ clientId }: { clientId: string }) => {
  const { user } = useAuth();
  const qc = useQueryClient();

  const [busca, setBusca] = useState('');
  const [abrirNovo, setAbrirNovo] = useState(false);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [salvando, setSalvando] = useState(false);

  const { data: clientes = [], isLoading } = useClientesFinais(clientId);
  const { data: resumos } = useResumoClientesFinais(clientId);

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const digitos = soDigitos(termo);
    const filtrados = termo
      ? clientes.filter(
          (c) =>
            c.nome.toLowerCase().includes(termo) ||
            (digitos && soDigitos(c.telefone ?? '').includes(digitos))
        )
      : clientes;

    return filtrados
      .map((c) => ({ ...c, resumo: resumos?.get(c.id) ?? RESUMO_VAZIO }))
      .sort((a, b) => b.resumo.total - a.resumo.total || a.nome.localeCompare(b.nome));
  }, [clientes, busca, resumos]);

  const totalCarteira = useMemo(
    () => lista.reduce((s, c) => s + c.resumo.total, 0),
    [lista]
  );
  const novos = useMemo(() => lista.filter((c) => c.resumo.qtd === 0).length, [lista]);

  const cadastrar = async () => {
    if (!nome.trim()) {
      toast.error('Informe o nome da empresa/cliente');
      return;
    }
    setSalvando(true);
    try {
      const { error } = await (supabase as any).from('ranking_clientes_finais').insert({
        client_id: clientId,
        nome: nome.trim(),
        telefone: telefone.trim() || null,
        created_by: user?.id ?? null,
      });
      if (error) throw error;
      toast.success('Cliente cadastrado');
      qc.invalidateQueries({ queryKey: ['clientes-finais'] });
      setNome('');
      setTelefone('');
      setAbrirNovo(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? 'Erro ao cadastrar o cliente');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="rounded-xl border border-foreground/10 bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-foreground/5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary-light" />
          <h2 className="text-lg font-semibold text-foreground">Meus clientes</h2>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="text-muted-foreground">
            <span className="font-semibold text-foreground">{clientes.length}</span> cadastrados
          </span>
          <span className="text-muted-foreground">
            <span className="font-semibold text-foreground">{novos}</span> sem compra
          </span>
          <span className="text-muted-foreground">
            <span className="font-semibold text-primary-light">{formatBRL(totalCarteira)}</span> na
            carteira
          </span>
        </div>
      </div>

      <div className="px-4 py-3 border-b border-foreground/5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Digite o nome do cliente"
            className="pl-9 bg-foreground/5 border-foreground/10 text-foreground placeholder:text-muted-foreground/80"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setAbrirNovo((v) => !v)}
          className="bg-foreground/5 border-foreground/10 text-foreground hover:bg-foreground/10 hover:text-foreground"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Novo cliente
        </Button>
      </div>

      {abrirNovo && (
        <div className="px-4 py-4 border-b border-foreground/5 bg-foreground/[0.03] grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">Nome da empresa / cliente</Label>
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: SamySam Moda Fashion"
              className="bg-foreground/5 border-foreground/10 text-foreground placeholder:text-muted-foreground/80"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">Telefone</Label>
            <Input
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(85) 9 9999-9999"
              inputMode="tel"
              className="bg-foreground/5 border-foreground/10 text-foreground placeholder:text-muted-foreground/80"
            />
          </div>
          <Button
            onClick={cadastrar}
            disabled={salvando}
            className="bg-gradient-to-r from-primary-dark to-primary hover:from-primary-darker hover:to-primary-hover text-foreground"
          >
            {salvando && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Cadastrar
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      ) : lista.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-muted-foreground">
          {clientes.length === 0
            ? 'Nenhum cliente cadastrado ainda. Cadastre no botão "Novo cliente" ou direto ao registrar uma venda.'
            : 'Nenhum cliente encontrado para essa busca.'}
        </p>
      ) : (
        <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
          {lista.map((c) => (
            <div
              key={c.id}
              className="rounded-xl border border-foreground/10 bg-foreground/[0.02] p-4 hover:border-primary/50 transition-colors"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Nome e telefone do cliente
              </p>
              <p className="font-bold text-foreground truncate mt-0.5">{c.nome}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Phone className="h-3 w-3" />
                {c.telefone || 'Sem telefone'}
              </p>

              <div className="mt-3 pt-3 border-t border-foreground/5 flex items-end justify-between">
                <div>
                  <p className="text-lg font-bold text-primary-light tabular-nums">
                    {formatBRL(c.resumo.total)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {c.resumo.qtd === 0
                      ? 'nenhuma compra ainda'
                      : `${c.resumo.qtd} ${c.resumo.qtd === 1 ? 'compra' : 'compras'} · última em ${formatDataBR(c.resumo.ultima)}`}
                  </p>
                </div>
                {c.resumo.qtd === 0 && (
                  <span className="flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-medium text-success">
                    <Sparkles className="h-3 w-3" />
                    novo
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
