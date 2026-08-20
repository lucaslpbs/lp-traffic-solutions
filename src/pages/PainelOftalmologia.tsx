import { useCallback, useEffect, useState } from 'react';
import { Power, History } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface AtendenteStatus {
  id: number;
  nome: string;
  ativo: boolean;
  atualizado_em: string;
}

interface AtendenteLog {
  id: number;
  nome: string;
  status_novo: boolean;
  criado_em: string;
}

const ATENDENTES = ['carina', 'jeane'] as const;

const DISPLAY_NAME: Record<string, string> = {
  carina: 'Carina',
  jeane: 'Jeane',
};

const formatDateTime = (iso: string): string =>
  new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

export default function PainelOftalmologia() {
  const [status, setStatus] = useState<Record<string, AtendenteStatus>>({});
  const [logs, setLogs] = useState<AtendenteLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingToggle, setPendingToggle] = useState<AtendenteStatus | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchStatus = useCallback(async () => {
    const { data, error } = await supabase
      .from('atendentes_status')
      .select('id, nome, ativo, atualizado_em')
      .in('nome', ATENDENTES as unknown as string[]);

    if (!error && data) {
      const byName: Record<string, AtendenteStatus> = {};
      for (const row of data as AtendenteStatus[]) {
        byName[row.nome] = row;
      }
      setStatus(byName);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    const { data, error } = await supabase
      .from('atendentes_log')
      .select('id, nome, status_novo, criado_em')
      .order('criado_em', { ascending: false })
      .limit(50);

    if (!error && data) {
      setLogs(data as AtendenteLog[]);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchStatus(), fetchLogs()]);
      setLoading(false);
    })();
  }, [fetchStatus, fetchLogs]);

  const confirmToggle = async () => {
    if (!pendingToggle) return;
    setSaving(true);
    const novoStatus = !pendingToggle.ativo;

    const { error } = await supabase
      .from('atendentes_status')
      .update({ ativo: novoStatus })
      .eq('id', pendingToggle.id);

    if (!error) {
      setStatus((prev) => ({
        ...prev,
        [pendingToggle.nome]: { ...pendingToggle, ativo: novoStatus },
      }));
      await fetchLogs();
    }

    setSaving(false);
    setPendingToggle(null);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 sm:p-6 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Painel de Atendimento — Núcleo de Oftalmologia
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Ligue ou desligue o recebimento de novos leads para cada atendente.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-6 border border-white/10 h-28 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {ATENDENTES.map((nome) => {
              const atendente = status[nome];
              const ativo = atendente?.ativo ?? false;
              return (
                <div
                  key={nome}
                  className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:bg-white/[0.08] transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-base font-semibold text-white">{DISPLAY_NAME[nome]}</p>
                      <p className={`text-xs font-medium mt-1 ${ativo ? 'text-emerald-400' : 'text-gray-500'}`}>
                        {ativo ? 'Ligada' : 'Desligada'}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg" style={{ background: ativo ? '#10b98120' : '#6b728020' }}>
                      <Power className="h-5 w-5" style={{ color: ativo ? '#10b981' : '#6b7280' }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-5">
                    <Switch
                      checked={ativo}
                      disabled={!atendente}
                      onCheckedChange={() => atendente && setPendingToggle(atendente)}
                    />
                    <p className="text-xs text-gray-500">
                      {atendente ? `Atualizado em ${formatDateTime(atendente.atualizado_em)}` : 'Sem registro'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-white/10">
            <History className="h-4 w-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-300">Histórico</h2>
          </div>

          {logs.length === 0 ? (
            <p className="text-sm text-gray-500 px-6 py-8 text-center">Nenhum registro ainda.</p>
          ) : (
            <ul className="divide-y divide-white/5 max-h-[28rem] overflow-y-auto">
              {logs.map((log) => (
                <li key={log.id} className="px-6 py-3 text-sm text-gray-300">
                  <span className="font-medium text-white">{DISPLAY_NAME[log.nome] ?? log.nome}</span>
                  {': '}
                  {log.status_novo ? (
                    <span className="text-emerald-400">Ligada</span>
                  ) : (
                    <span className="text-gray-500">Desligada</span>
                  )}
                  <span className="text-gray-500"> às {formatDateTime(log.criado_em)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <AlertDialog open={!!pendingToggle} onOpenChange={(open) => !open && setPendingToggle(null)}>
        <AlertDialogContent className="bg-[#111111] border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingToggle && !pendingToggle.ativo ? 'Ativar' : 'Desativar'} {pendingToggle ? DISPLAY_NAME[pendingToggle.nome] : ''}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Tem certeza que deseja {pendingToggle && !pendingToggle.ativo ? 'ativar' : 'desativar'}{' '}
              {pendingToggle ? DISPLAY_NAME[pendingToggle.nome] : ''}? Essa ação altera imediatamente a distribuição de leads no CRM.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving} className="border-white/10 bg-transparent hover:bg-white/5 text-white">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={saving}
              onClick={(e) => {
                e.preventDefault();
                confirmToggle();
              }}
            >
              {saving ? 'Salvando...' : 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
