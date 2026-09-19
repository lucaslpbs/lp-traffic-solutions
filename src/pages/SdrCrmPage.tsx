import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, MessagesSquare, PauseCircle, PlayCircle, RefreshCw, Search, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { ListSkeleton } from '@/components/dashboard/Skeletons';

interface Conversa {
  telefone: string;
  nome: string | null;
  agente: string | null;
  interesse: string | null;
  ultima_mensagem: string | null;
  ultima_de: 'lead' | 'bot' | null;
  ultima_em: string | null;
  no_vacuo: boolean;
}

interface Mensagem {
  id: number;
  de: 'lead' | 'bot';
  texto: string;
  em: string;
}

// A funcao roda no Supabase do SDR (onde estao as tabelas), mas autentica com o
// login do projeto principal.
const SDR_CRM_URL = 'https://xhrcrusqzfckrjghjmgb.supabase.co/functions/v1/sdr-crm';

async function sdrCrm<T>(action: string, telefone?: string): Promise<T> {
  const { data: sessao } = await supabase.auth.getSession();
  const token = sessao.session?.access_token;
  if (!token) throw new Error('Sessão expirada, faça login novamente');

  const res = await fetch(SDR_CRM_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ action, telefone }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.success) throw new Error(data?.error || `Erro ${res.status}`);
  return data as T;
}

const isPausado = (agente: string | null) => agente === 'off';

// created_at do banco do SDR e UTC sem fuso.
const parseTs = (ts: string) => new Date(/Z|[+-]\d\d:?\d\d$/.test(ts) ? ts : `${ts}Z`);

const formatarHora = (ts: string | null) => {
  if (!ts) return '';
  const d = parseTs(ts);
  const hoje = new Date();
  const mesmoDia = d.toDateString() === hoje.toDateString();
  return mesmoDia
    ? d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) +
        ' ' +
        d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

export default function SdrCrmPage() {
  const qc = useQueryClient();
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [busca, setBusca] = useState('');
  const [soVacuo, setSoVacuo] = useState(false);
  const fimRef = useRef<HTMLDivElement>(null);

  const { data: conversas = [], isLoading, isFetching, error: erroLista } = useQuery({
    queryKey: ['sdr-crm-conversas'],
    queryFn: async () => (await sdrCrm<{ conversas: Conversa[] }>('list')).conversas,
    refetchInterval: 20000,
  });

  const { data: mensagens = [], isLoading: loadingMsgs } = useQuery({
    queryKey: ['sdr-crm-mensagens', selecionado],
    enabled: !!selecionado,
    queryFn: async () => (await sdrCrm<{ mensagens: Mensagem[] }>('messages', selecionado!)).mensagens,
    refetchInterval: 10000,
  });

  useEffect(() => {
    fimRef.current?.scrollIntoView({ block: 'end' });
  }, [mensagens.length, selecionado]);

  const atual = conversas.find((c) => c.telefone === selecionado) ?? null;

  const pausar = useMutation({
    mutationFn: (tel: string) => sdrCrm('pause', tel),
    onSuccess: () => {
      toast.success('Bot pausado para este lead');
      qc.invalidateQueries({ queryKey: ['sdr-crm-conversas'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const reativar = useMutation({
    mutationFn: (tel: string) => sdrCrm('resume', tel),
    onSuccess: () => {
      toast.success('Bot reativado para este lead');
      qc.invalidateQueries({ queryKey: ['sdr-crm-conversas'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const reenviar = useMutation({
    mutationFn: (tel: string) => sdrCrm('retry', tel),
    onSuccess: () => {
      toast.success('SDR acionado para responder novamente');
      setTimeout(() => {
        qc.invalidateQueries({ queryKey: ['sdr-crm-mensagens', selecionado] });
        qc.invalidateQueries({ queryKey: ['sdr-crm-conversas'] });
      }, 4000);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtradas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return conversas.filter((c) => {
      if (soVacuo && !c.no_vacuo) return false;
      if (!q) return true;
      return c.telefone.includes(q) || (c.nome ?? '').toLowerCase().includes(q);
    });
  }, [conversas, busca, soVacuo]);

  const totalVacuo = conversas.filter((c) => c.no_vacuo).length;

  return (
    <div className="p-4 md:p-6 space-y-4">
      <PageHeader
        title="CRM"
        subtitle="Acompanhamento do SDR · +55 85 9608-7727 (somente leitura)"
        icon={MessagesSquare}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              qc.invalidateQueries({ queryKey: ['sdr-crm-conversas'] });
              qc.invalidateQueries({ queryKey: ['sdr-crm-mensagens'] });
            }}
          >
            <RefreshCw className={cn('h-4 w-4 mr-2', isFetching && 'animate-spin')} />
            Atualizar
          </Button>
        }
      />

      {erroLista && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {(erroLista as Error).message}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[360px_1fr] h-[calc(100vh-220px)] min-h-[480px]">
        {/* Lista de conversas */}
        <div className="flex flex-col rounded-xl border bg-card overflow-hidden">
          <div className="p-3 space-y-2 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar nome ou telefone"
                className="pl-9"
              />
            </div>
            <button
              type="button"
              onClick={() => setSoVacuo((v) => !v)}
              className={cn(
                'w-full flex items-center justify-between rounded-md border px-3 py-1.5 text-sm transition-colors',
                soVacuo ? 'border-amber-500 bg-amber-500/10 text-amber-600' : 'text-muted-foreground hover:bg-foreground/5'
              )}
            >
              <span className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> No vácuo
              </span>
              <span className="font-semibold">{totalVacuo}</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-3"><ListSkeleton rows={6} /></div>
            ) : filtradas.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">Nenhuma conversa encontrada.</p>
            ) : (
              filtradas.map((c) => (
                <button
                  key={c.telefone}
                  type="button"
                  onClick={() => setSelecionado(c.telefone)}
                  className={cn(
                    'w-full text-left px-3 py-3 border-b transition-colors hover:bg-foreground/5',
                    selecionado === c.telefone && 'bg-foreground/10'
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium truncate">{c.nome || c.telefone}</span>
                    <span className="text-xs text-muted-foreground shrink-0">{formatarHora(c.ultima_em)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate mt-0.5">
                    {c.ultima_de === 'bot' && <span className="opacity-70">SDR: </span>}
                    {c.ultima_mensagem ?? 'Sem mensagens'}
                  </p>
                  <div className="flex gap-1.5 mt-1.5">
                    {c.no_vacuo && (
                      <span className="text-[11px] rounded-full bg-amber-500/15 text-amber-600 px-2 py-0.5">no vácuo</span>
                    )}
                    {isPausado(c.agente) && (
                      <span className="text-[11px] rounded-full bg-destructive/15 text-destructive px-2 py-0.5">bot pausado</span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Conversa */}
        <div className="flex flex-col rounded-xl border bg-card overflow-hidden min-h-0">
          {!atual ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-2">
              <MessagesSquare className="h-10 w-10 opacity-40" />
              <p className="text-sm">Selecione uma conversa para acompanhar</p>
            </div>
          ) : (
            <>
              <div className="p-3 border-b flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold truncate">{atual.nome || atual.telefone}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {atual.telefone}
                    {atual.interesse ? ` · ${atual.interesse}` : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={reenviar.isPending}
                    onClick={() => reenviar.mutate(atual.telefone)}
                  >
                    {reenviar.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                    Responder novamente
                  </Button>
                  {isPausado(atual.agente) ? (
                    <Button
                      variant="default"
                      size="sm"
                      disabled={reativar.isPending}
                      onClick={() => reativar.mutate(atual.telefone)}
                    >
                      {reativar.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <PlayCircle className="h-4 w-4 mr-2" />}
                      Reativar bot
                    </Button>
                  ) : (
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={pausar.isPending}
                      onClick={() => {
                        if (window.confirm(`Pausar o bot para ${atual.nome || atual.telefone}?`)) pausar.mutate(atual.telefone);
                      }}
                    >
                      {pausar.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <PauseCircle className="h-4 w-4 mr-2" />}
                      Pausar bot
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-muted/20">
                {loadingMsgs ? (
                  <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                ) : mensagens.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-8">Sem histórico de mensagens.</p>
                ) : (
                  mensagens.map((m) => (
                    <div key={m.id} className={cn('flex', m.de === 'bot' ? 'justify-end' : 'justify-start')}>
                      <div
                        className={cn(
                          'max-w-[80%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap break-words',
                          m.de === 'bot' ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-card border rounded-bl-sm'
                        )}
                      >
                        {m.texto}
                        <div className="text-[10px] opacity-60 mt-1 text-right">{formatarHora(m.em)}</div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={fimRef} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
