import { useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2, Package, Plus, Upload, X, ImagePlus, ShieldCheck, XCircle, Trash2, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Stagger, StaggerItem, Reveal } from '@/components/dashboard/Motion';
import { ListSkeleton, PageHeaderSkeleton } from '@/components/dashboard/Skeletons';
import {
  DashTabs,
  DashTabsList,
  DashTabsTrigger,
  DashTabsPanel,
} from '@/components/dashboard/DashboardTabs';
import { ProductCard } from '@/components/produtos/ProductCard';
import type { ClientProduct, ProdutoStatus } from '@/components/produtos/types';
import { uploadProductImage, removeProductImages, validateProductImageFile } from '@/lib/clientProductsStorage';

const labelCls = 'block text-sm font-medium text-foreground/85 mb-1.5';

// ── Client View ──

function ClienteProdutosView() {
  const { clienteVinculadoId } = useAuth();
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('');
  const [preco, setPreco] = useState('');
  const [descricao, setDescricao] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);

  const { data: clienteInfo, isLoading: loadingCliente } = useQuery({
    queryKey: ['produtos-cliente-info', clienteVinculadoId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('gestao_clientes')
        .select('cadastro_produtos_ativo')
        .eq('id', clienteVinculadoId)
        .maybeSingle();
      if (error) throw error;
      return data as { cadastro_produtos_ativo: boolean } | null;
    },
    enabled: !!clienteVinculadoId,
  });

  const habilitado = clienteInfo?.cadastro_produtos_ativo === true;

  const { data: produtos = [], isLoading: loadingProdutos } = useQuery({
    queryKey: ['produtos-cliente', clienteVinculadoId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('client_products')
        .select('*, client_product_images(*)')
        .eq('client_id', clienteVinculadoId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as ClientProduct[];
    },
    enabled: !!clienteVinculadoId && habilitado,
  });

  const resetForm = () => {
    setNome('');
    setCategoria('');
    setPreco('');
    setDescricao('');
    setFiles([]);
    setPreviews((prev) => {
      prev.forEach((url) => URL.revokeObjectURL(url));
      return [];
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFiles = (list: FileList | null) => {
    if (!list) return;
    const novos: File[] = [];
    for (const file of Array.from(list)) {
      const erro = validateProductImageFile(file);
      if (erro) {
        toast.error(`${file.name}: ${erro}`);
        continue;
      }
      novos.push(file);
    }
    if (novos.length === 0) return;
    setFiles((prev) => [...prev, ...novos]);
    setPreviews((prev) => [...prev, ...novos.map((f) => URL.createObjectURL(f))]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const enviar = async () => {
    if (!clienteVinculadoId || !nome.trim() || !descricao.trim()) {
      toast.error('Preencha nome e descrição do produto.');
      return;
    }
    if (files.length === 0) {
      toast.error('Adicione ao menos uma imagem do produto.');
      return;
    }

    setEnviando(true);
    try {
      const { data: produto, error } = await (supabase as any)
        .from('client_products')
        .insert({
          client_id: clienteVinculadoId,
          nome_produto: nome.trim(),
          categoria: categoria.trim() || null,
          preco: preco ? parseFloat(preco.replace(',', '.')) : null,
          descricao: descricao.trim(),
        })
        .select()
        .single();
      if (error) throw error;

      const uploads = await Promise.all(
        files.map((file, i) =>
          uploadProductImage(file, clienteVinculadoId, produto.id).then((r) => ({ ...r, ordem: i }))
        )
      );

      const { error: imgError } = await (supabase as any).from('client_product_images').insert(
        uploads.map((u) => ({
          product_id: produto.id,
          storage_path: u.storagePath,
          original_url: u.publicUrl,
          ordem: u.ordem,
        }))
      );
      if (imgError) throw imgError;

      toast.success('Produto cadastrado! Aguardando aprovação do administrador.');
      resetForm();
      setFormOpen(false);
      qc.invalidateQueries({ queryKey: ['produtos-cliente'] });
    } catch (err) {
      console.error(err);
      toast.error('Erro ao cadastrar produto.');
    } finally {
      setEnviando(false);
    }
  };

  const excluir = async (produto: ClientProduct) => {
    const { error } = await (supabase as any).from('client_products').delete().eq('id', produto.id);
    if (error) {
      toast.error('Erro ao excluir produto.');
      return;
    }
    const paths = (produto.client_product_images ?? []).map((i) => i.storage_path);
    await removeProductImages(paths);
    toast.success('Produto excluído.');
    qc.invalidateQueries({ queryKey: ['produtos-cliente'] });
  };

  if (loadingCliente) {
    return (
      <div className="p-5 sm:p-8 lg:p-10 space-y-8" role="status" aria-label="Carregando">
        <PageHeaderSkeleton />
        <ListSkeleton rows={3} />
      </div>
    );
  }

  if (!habilitado) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-6">
        <div className="rounded-xl border border-border bg-card p-12 text-center max-w-md">
          <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground">Funcionalidade não disponível</h3>
          <p className="text-muted-foreground mt-2">
            O cadastro de produtos ainda não foi liberado para sua conta. Fale com o administrador.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 sm:p-8 lg:p-10 max-w-4xl mx-auto space-y-8">
      <Reveal>
        <PageHeader
          title="Meus Produtos"
          subtitle="Cadastre os produtos que a equipe vai usar no atendimento."
          icon={Package}
          actions={
            <Button onClick={() => setFormOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Novo produto
            </Button>
          }
        />
      </Reveal>

      {loadingProdutos ? (
        <ListSkeleton rows={3} />
      ) : produtos.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Package className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p>Você ainda não cadastrou nenhum produto.</p>
        </div>
      ) : (
        <Stagger className="space-y-3">
          {produtos.map((p) => (
            <StaggerItem key={p.id}>
              <ProductCard
                product={p}
                actions={
                  p.status === 'pendente' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => excluir(p)}
                      className="border-destructive/50 text-destructive hover:bg-destructive/15 gap-1.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Excluir
                    </Button>
                  ) : null
                }
              />
            </StaggerItem>
          ))}
        </Stagger>
      )}

      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo produto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Nome do produto</label>
              <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Tênis Runner Pro" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Categoria</label>
                <Input value={categoria} onChange={(e) => setCategoria(e.target.value)} placeholder="Ex: Calçados" />
              </div>
              <div>
                <label className={labelCls}>Preço</label>
                <Input value={preco} onChange={(e) => setPreco(e.target.value)} placeholder="0,00" inputMode="decimal" />
              </div>
            </div>
            <div>
              <label className={labelCls}>Descrição</label>
              <Textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={4}
                placeholder="Descreva o produto..."
              />
            </div>
            <div>
              <label className={labelCls}>Imagens</label>
              <div className="flex flex-wrap gap-2">
                {previews.map((src, i) => (
                  <div key={src} className="relative h-16 w-16">
                    <img src={src} alt="" className="h-16 w-16 rounded-md object-cover" />
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-16 w-16 rounded-md border border-dashed border-foreground/20 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors"
                >
                  <ImagePlus className="h-5 w-5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setFormOpen(false);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button onClick={enviar} disabled={enviando} className="gap-2">
              {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {enviando ? 'Enviando...' : 'Cadastrar produto'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Admin View ──

type FilterTab = ProdutoStatus | 'todos';

const filterTabs: { id: FilterTab; label: string }[] = [
  { id: 'pendente', label: 'Pendentes' },
  { id: 'aprovado', label: 'Aprovados' },
  { id: 'rejeitado', label: 'Rejeitados' },
  { id: 'todos', label: 'Todos' },
];

function AdminProdutosView() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<FilterTab>('pendente');
  const [rejeitando, setRejeitando] = useState<ClientProduct | null>(null);
  const [motivo, setMotivo] = useState('');
  const [processando, setProcessando] = useState(false);

  const { data: produtos = [], isLoading: loading } = useQuery({
    queryKey: ['produtos-admin'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('client_products')
        .select('*, client_product_images(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;

      const clientIds = [...new Set((data as any[]).map((p: any) => p.client_id))];
      let clientesMap: Record<string, string> = {};
      if (clientIds.length > 0) {
        const { data: clientes } = await (supabase as any)
          .from('gestao_clientes')
          .select('id, nome_cliente')
          .in('id', clientIds);
        if (clientes) {
          clientesMap = Object.fromEntries((clientes as any[]).map((c: any) => [c.id, c.nome_cliente]));
        }
      }

      return (data as any[]).map((p: any) => ({
        ...p,
        nome_cliente: clientesMap[p.client_id] || p.client_id,
      })) as ClientProduct[];
    },
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['produtos-admin'] });

  const filtered = filter === 'todos' ? produtos : produtos.filter((p) => p.status === filter);

  const aprovar = async (produto: ClientProduct) => {
    setProcessando(true);
    const { error } = await (supabase as any)
      .from('client_products')
      .update({
        status: 'aprovado',
        motivo_rejeicao: null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', produto.id);
    if (error) {
      toast.error('Erro ao aprovar produto.');
    } else {
      toast.success('Produto aprovado.');
      invalidate();
    }
    setProcessando(false);
  };

  const abrirRejeicao = (produto: ClientProduct) => {
    setRejeitando(produto);
    setMotivo(produto.motivo_rejeicao || '');
  };

  const confirmarRejeicao = async () => {
    if (!rejeitando) return;
    setProcessando(true);
    const { error } = await (supabase as any)
      .from('client_products')
      .update({
        status: 'rejeitado',
        motivo_rejeicao: motivo.trim() || null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', rejeitando.id);
    if (error) {
      toast.error('Erro ao rejeitar produto.');
    } else {
      toast.success('Produto rejeitado.');
      setRejeitando(null);
      setMotivo('');
      invalidate();
    }
    setProcessando(false);
  };

  const acoesDe = (p: ClientProduct) => {
    if (p.status !== 'pendente') return null;
    return (
      <>
        <Button
          size="sm"
          variant="outline"
          onClick={() => aprovar(p)}
          disabled={processando}
          className="border-success/50 text-success hover:bg-success/15 hover:text-success gap-1.5"
        >
          <ShieldCheck className="h-3.5 w-3.5" /> Aprovar
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => abrirRejeicao(p)}
          disabled={processando}
          className="border-destructive/50 text-destructive hover:bg-destructive/15 gap-1.5"
        >
          <XCircle className="h-3.5 w-3.5" /> Rejeitar
        </Button>
      </>
    );
  };

  return (
    <div className="p-5 sm:p-8 lg:p-10 max-w-5xl mx-auto space-y-8">
      <Reveal>
        <PageHeader
          title="Produtos dos Clientes"
          subtitle="Revise e aprove os produtos cadastrados pelos clientes."
          icon={Package}
        />
      </Reveal>

      <DashTabs value={filter} onValueChange={(v) => setFilter(v as FilterTab)}>
        <DashTabsList>
          {filterTabs.map((t) => (
            <DashTabsTrigger key={t.id} value={t.id}>
              {t.label}
              {t.id !== 'todos' && (
                <span className="text-xs opacity-70">
                  ({produtos.filter((p) => p.status === t.id).length})
                </span>
              )}
            </DashTabsTrigger>
          ))}
        </DashTabsList>

        {filterTabs.map((t) => (
          <DashTabsPanel key={t.id} value={t.id}>
            {loading ? (
              <ListSkeleton rows={3} />
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Package className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p>Nenhum produto por aqui.</p>
              </div>
            ) : (
              <Stagger className="space-y-3">
                {filtered.map((p) => (
                  <StaggerItem key={p.id}>
                    <ProductCard product={p} showCliente actions={acoesDe(p)} />
                  </StaggerItem>
                ))}
              </Stagger>
            )}
          </DashTabsPanel>
        ))}
      </DashTabs>

      <Dialog open={!!rejeitando} onOpenChange={(open) => !open && setRejeitando(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar produto</DialogTitle>
          </DialogHeader>
          <div>
            <label className={labelCls}>Motivo (opcional, visível para o cliente)</label>
            <Textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={3}
              placeholder="Ex: imagem de baixa qualidade..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejeitando(null)}>
              Cancelar
            </Button>
            <Button onClick={confirmarRejeicao} disabled={processando} variant="destructive">
              {processando ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirmar rejeição'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Entry point ──

export default function ProdutosPage() {
  const { isAdmin, clienteVinculadoId, loadingRole } = useAuth();

  if (loadingRole) {
    return (
      <div className="p-5 sm:p-8 lg:p-10 space-y-8" role="status" aria-label="Carregando">
        <PageHeaderSkeleton />
        <ListSkeleton rows={3} />
      </div>
    );
  }

  if (isAdmin) return <AdminProdutosView />;
  if (clienteVinculadoId) return <ClienteProdutosView />;

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <div className="rounded-xl border border-border bg-card p-12 text-center max-w-md">
        <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground">Sem acesso</h3>
        <p className="text-muted-foreground mt-2">Esta área é exclusiva para clientes e administradores.</p>
      </div>
    </div>
  );
}
