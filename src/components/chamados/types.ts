export interface Chamado {
  id: string;
  client_id: string;
  mensagem: string;
  resposta_admin: string | null;
  status: 'aberto' | 'respondido' | 'concluido';
  created_at: string;
  respondido_at: string | null;
  concluido_at: string | null;
  nome_cliente?: string;
}

export type ChamadoStatus = Chamado['status'];

export const statusConfig: Record<ChamadoStatus, { label: string; cls: string }> = {
  aberto: { label: 'Aberto', cls: 'bg-warning/15 text-warning border-warning/40' },
  respondido: { label: 'Respondido', cls: 'bg-primary/15 text-primary border-primary/40' },
  concluido: { label: 'Concluído', cls: 'bg-success/15 text-success border-success/40' },
};

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
