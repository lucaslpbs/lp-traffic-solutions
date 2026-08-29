import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Search, UserPlus, Users, X, Phone, Sparkles } from 'lucide-react';
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
  type ClienteFinal,
} from './clientesFinais';
import { formatBRL, formatDataBR } from './types';
import { cn } from '@/lib/utils';

interface ClienteFinalPickerProps {
  /** Dono do cadastro — o cliente que esta lancando a venda. */
  clientId?: string | null;
  value: string | null;
  onChange: (id: string | null) => void;
}

export const ClienteFinalPicker = ({ clientId, value, onChange }: ClienteFinalPickerProps) => {
  const { user } = useAuth();
  const qc = useQueryClient();

  const [abrirLista, setAbrirLista] = useState(false);
  const [abrirNovo, setAbrirNovo] = useState(false);
  const [busca, setBusca] = useState('');
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [salvando, setSalvando] = useState(false);

  const { data: clientes = [], isLoading } = useClientesFinais(clientId);
  const { data: resumos } = useResumoClientesFinais(clientId);

  const selecionado = useMemo(
    () => clientes.find((c) => c.id === value) ?? null,
    [clientes, value]
  );

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return clientes;
    const digitos = soDigitos(termo);
    return clientes.filter(
      (c) =>
        c.nome.toLowerCase().includes(termo) ||
        (digitos && soDigitos(c.telefone ?? '').includes(digitos))
    );
  }, [clientes, busca]);

  const resumoDe = (id: string) => resumos?.get(id) ?? RESUMO_VAZIO;

  const cadastrar = async () => {
    if (!clientId) {
      toast.error('Selecione o cliente da venda primeiro');
      return;
    }
    if (!nome.trim()) {
      toast.error('Informe o nome da empresa/cliente');
      return;
    }

    const telLimpo = telefone.trim();
    const duplicado = clientes.find(
      (c) =>
        c.nome.trim().toLowerCase() === nome.trim().toLowerCase() ||
        (telLimpo && soDigitos(c.telefone ?? '') === soDigitos(telLimpo))
    );
    if (duplicado) {
      toast.info(`${duplicado.nome} já está cadastrado — selecionado automaticamente.`);
      onChange(duplicado.id);
      setAbrirNovo(false);
      setNome('');
      setTelefone('');
      return;
    }

    setSalvando(true);
    try {
      const { data, error } = await (supabase as any)
        .from('ranking_clientes_finais')
        .insert({
          client_id: clientId,
          nome: nome.trim(),
          telefone: telLimpo || null,
          created_by: user?.id ?? null,
        })
        .select()
        .single();
      if (error) throw error;

      toast.success('Cliente cadastrado');
      qc.invalidateQueries({ queryKey: ['clientes-finais'] });
      onChange((data as ClienteFinal).id);
      setAbrirNovo(false);
      setAbrirLista(false);
      setNome('');
      setTelefone('');
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? 'Erro ao cadastrar o cliente');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-foreground/85">Cliente da venda</Label>

      {/* ── Selecionado ── */}
      {selecionado ? (
        <div className="rounded-lg border border-primary/40 bg-primary/10 p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-foreground truncate">{selecionado.nome}</p>
              {selecionado.telefone && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Phone className="h-3 w-3" />
                  {selecionado.telefone}
                </p>
              )}
              {resumoDe(selecionado.id).qtd > 0 ? (
                <p className="text-xs text-primary-light mt-1.5">
                  Recorrente — já comprou {formatBRL(resumoDe(selecionado.id).total)} em{' '}
                  {resumoDe(selecionado.id).qtd}{' '}
                  {resumoDe(selecionado.id).qtd === 1 ? 'compra' : 'compras'} · última em{' '}
                  {formatDataBR(resumoDe(selecionado.id).ultima)}
                </p>
              ) : (
                <p className="text-xs text-success mt-1.5 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Cliente novo — primeira compra
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onChange(null)}
              title="Remover seleção"
              className="rounded-full bg-background/40 p-1.5 text-muted-foreground hover:text-destructive flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setAbrirLista((v) => !v);
              setAbrirNovo(false);
            }}
            disabled={!clientId}
            className="bg-foreground/5 border-foreground/10 text-foreground hover:bg-foreground/10 hover:text-foreground"
          >
            <Users className="h-4 w-4 mr-2" />
            Clientes cadastrados ({clientes.length})
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setAbrirNovo((v) => !v);
              setAbrirLista(false);
            }}
            disabled={!clientId}
            className="bg-foreground/5 border-foreground/10 text-foreground hover:bg-foreground/10 hover:text-foreground"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Novo cliente
          </Button>
        </div>
      )}

      {!clientId && (
        <p className="text-xs text-muted-foreground">Selecione o cliente da venda para liberar o cadastro.</p>
      )}

      {/* ── Bloco de clientes existentes ── */}
      {abrirLista && !selecionado && (
        <div className="rounded-lg border border-foreground/10 bg-foreground/[0.03] p-3 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome ou telefone"
              className="pl-9 bg-foreground/5 border-foreground/10 text-foreground placeholder:text-muted-foreground/80"
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : filtrados.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2 text-center">
              {clientes.length === 0
                ? 'Nenhum cliente cadastrado ainda. Use "Novo cliente".'
                : 'Nenhum cliente encontrado para essa busca.'}
            </p>
          ) : (
            <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
              {filtrados.map((c) => {
                const r = resumoDe(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      onChange(c.id);
                      setAbrirLista(false);
                    }}
                    className={cn(
                      'w-full rounded-lg border border-foreground/10 bg-card p-3 text-left',
                      'hover:border-primary hover:bg-foreground/[0.06] transition-colors'
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{c.nome}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {c.telefone || 'Sem telefone'}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-semibold text-primary-light tabular-nums">
                          {formatBRL(r.total)}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {r.qtd === 0
                            ? 'cliente novo'
                            : `${r.qtd} ${r.qtd === 1 ? 'compra' : 'compras'}`}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Cadastro rapido ── */}
      {abrirNovo && !selecionado && (
        <div className="rounded-lg border border-foreground/10 bg-foreground/[0.03] p-3 space-y-3">
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
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setAbrirNovo(false)}
              className="bg-foreground/5 border-foreground/10 text-foreground hover:bg-foreground/10 hover:text-foreground"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={cadastrar}
              disabled={salvando}
              className="bg-gradient-to-r from-primary-dark to-primary hover:from-primary-darker hover:to-primary-hover text-foreground"
            >
              {salvando && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Cadastrar e usar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
