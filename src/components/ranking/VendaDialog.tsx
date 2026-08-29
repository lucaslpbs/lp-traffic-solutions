import { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, ImagePlus, Loader2, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { uploadVendaPrint, validateRankingImage } from '@/lib/rankingStorage';
import { parseDateOnly, type Venda } from './types';
import { ClienteFinalPicker } from './ClienteFinalPicker';
import { cn } from '@/lib/utils';

interface ClienteOption {
  id: string;
  nome_cliente: string;
}

interface VendaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Cliente fixo (visao do cliente). Ignorado quando `clientes` e informado. */
  clientId?: string | null;
  /** Lista de clientes para o admin escolher. */
  clientes?: ClienteOption[];
  /** Venda em edicao — quando ausente, o dialog cadastra uma nova. */
  venda?: Venda | null;
  onSaved: () => void;
}

export const VendaDialog = ({
  open,
  onOpenChange,
  clientId,
  clientes,
  venda,
  onSaved,
}: VendaDialogProps) => {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [valor, setValor] = useState('');
  const [data, setData] = useState<Date>(new Date());
  const [descricao, setDescricao] = useState('');
  const [clienteSel, setClienteSel] = useState<string>('');
  const [clienteFinalId, setClienteFinalId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const modoAdmin = !!clientes?.length;

  useEffect(() => {
    if (!open) return;
    if (venda) {
      setValor(String(venda.valor).replace('.', ','));
      setData(parseDateOnly(venda.data));
      setDescricao(venda.descricao ?? '');
      setClienteSel(venda.client_id);
      setClienteFinalId(venda.cliente_final_id ?? null);
      setPreview(venda.foto_url);
    } else {
      setValor('');
      setData(new Date());
      setDescricao('');
      setClienteSel(clientId ?? '');
      setClienteFinalId(null);
      setPreview(null);
    }
    setFile(null);
  }, [open, venda, clientId]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const erro = validateRankingImage(f);
    if (erro) {
      toast.error(erro);
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const limparFoto = () => {
    setFile(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const salvar = async () => {
    const alvo = modoAdmin ? clienteSel : clientId;
    const valorNum = Number(valor.replace(/\./g, '').replace(',', '.'));

    if (!alvo) {
      toast.error('Selecione o cliente da venda');
      return;
    }
    if (!valorNum || valorNum <= 0) {
      toast.error('Informe um valor de venda válido');
      return;
    }

    setSalvando(true);
    try {
      let fotoUrl = venda?.foto_url ?? null;
      if (file) {
        fotoUrl = await uploadVendaPrint(file, alvo);
      } else if (!preview) {
        fotoUrl = null;
      }

      const payload = {
        client_id: alvo,
        valor: valorNum,
        data: format(data, 'yyyy-MM-dd'),
        descricao: descricao.trim() || null,
        foto_url: fotoUrl,
        cliente_final_id: clienteFinalId,
      };

      if (venda) {
        const { error } = await (supabase as any)
          .from('ranking_vendas')
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq('id', venda.id);
        if (error) throw error;
        toast.success('Venda atualizada');
      } else if (modoAdmin) {
        // venda lancada pelo admin ja entra aprovada
        const { error } = await (supabase as any).from('ranking_vendas').insert({
          ...payload,
          created_by: user?.id ?? null,
          status: 'aprovada',
          aprovada_por: user?.id ?? null,
          aprovada_em: new Date().toISOString(),
        });
        if (error) throw error;
        toast.success('Venda lançada e aprovada');
      } else {
        const { error } = await (supabase as any)
          .from('ranking_vendas')
          .insert({ ...payload, created_by: user?.id ?? null, status: 'pendente' });
        if (error) throw error;
        toast.success('Venda enviada para análise! Ela entra no ranking assim que for aprovada.');
      }

      onSaved();
      onOpenChange(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? 'Erro ao salvar a venda');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-foreground/10 text-foreground sm:max-w-[520px] max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{venda ? 'Editar venda' : 'Registrar venda'}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {venda
              ? 'Atualize os dados da venda. O ranking é recalculado automaticamente.'
              : modoAdmin
                ? 'Venda lançada pelo admin já entra aprovada e pontua no ranking.'
                : 'Cadastre sua venda: ela vai para análise e entra no ranking assim que for aprovada.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {modoAdmin && (
            <div className="space-y-1.5">
              <Label className="text-foreground/85">Cliente</Label>
              <Select
                value={clienteSel}
                onValueChange={(v) => {
                  setClienteSel(v);
                  setClienteFinalId(null);
                }}
              >
                <SelectTrigger className="bg-foreground/5 border-foreground/10 text-foreground">
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent className="bg-surface-1 border-foreground/10 text-foreground max-h-64">
                  {clientes!.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="focus:bg-foreground/10 focus:text-foreground">
                      {c.nome_cliente}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <ClienteFinalPicker
            clientId={modoAdmin ? clienteSel || null : clientId}
            value={clienteFinalId}
            onChange={setClienteFinalId}
          />

          <div className="space-y-1.5">
            <Label className="text-foreground/85">Valor da venda</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
              <Input
                value={valor}
                onChange={(e) => setValor(e.target.value.replace(/[^\d.,]/g, ''))}
                placeholder="0,00"
                inputMode="decimal"
                className="pl-10 bg-foreground/5 border-foreground/10 text-foreground placeholder:text-muted-foreground/80"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-foreground/85">Data</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal bg-foreground/5 border-foreground/10 text-foreground hover:bg-foreground/10 hover:text-foreground"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(data, 'dd/MM/yyyy', { locale: ptBR })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-surface-1 border-foreground/10" align="start">
                <Calendar
                  mode="single"
                  selected={data}
                  onSelect={(d) => d && setData(d)}
                  initialFocus
                  locale={ptBR}
                  className="pointer-events-auto bg-surface-1 text-foreground"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1.5">
            <Label className="text-foreground/85">Print da venda</Label>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFile}
              className="hidden"
            />
            {preview ? (
              <div className="relative rounded-lg overflow-hidden border border-foreground/10">
                <img src={preview} alt="Print da venda" className="w-full max-h-56 object-contain bg-background" />
                <button
                  type="button"
                  onClick={limparFoto}
                  className="absolute top-2 right-2 rounded-full bg-background/70 p-1.5 text-foreground/85 hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className={cn(
                  'w-full rounded-lg border border-dashed border-foreground/15 bg-foreground/5 py-8',
                  'flex flex-col items-center gap-2 text-muted-foreground hover:border-primary hover:text-foreground transition-colors'
                )}
              >
                <ImagePlus className="h-6 w-6" />
                <span className="text-sm">Clique para enviar o print (PNG, JPG ou WebP — até 5MB)</span>
              </button>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-foreground/85">Descrição</Label>
            <Textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="O que foi vendido, canal de origem, observações..."
              className="bg-foreground/5 border-foreground/10 text-foreground placeholder:text-muted-foreground/80 min-h-[90px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={salvando}
            className="bg-foreground/5 border-foreground/10 text-foreground hover:bg-foreground/10 hover:text-foreground"
          >
            Cancelar
          </Button>
          <Button
            onClick={salvar}
            disabled={salvando}
            className="bg-gradient-to-r from-primary-dark to-primary hover:from-primary-darker hover:to-primary-hover text-foreground shadow-lg shadow-primary/25"
          >
            {salvando && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {venda ? 'Salvar alterações' : 'Registrar venda'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/** Botao de exclusao reutilizado nas listas de venda */
export const ExcluirVendaButton = ({
  vendaId,
  onDeleted,
}: {
  vendaId: string;
  onDeleted: () => void;
}) => {
  const [apagando, setApagando] = useState(false);

  const excluir = async () => {
    if (!window.confirm('Excluir esta venda? O ranking será recalculado.')) return;
    setApagando(true);
    const { error } = await (supabase as any).from('ranking_vendas').delete().eq('id', vendaId);
    setApagando(false);
    if (error) {
      toast.error('Erro ao excluir venda');
      return;
    }
    toast.success('Venda excluída');
    onDeleted();
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={excluir}
      disabled={apagando}
      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
    >
      {apagando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
};
