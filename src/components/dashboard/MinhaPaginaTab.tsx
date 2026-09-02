import { useState } from 'react';
import { Copy, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { LinkPageEditor, type LinkPageValue, type LinkItem } from '@/components/linktree/LinkPageEditor';

interface MinhaPaginaTabProps {
  slug: string | null;
  titulo: string | null;
  bio: string | null;
  corPrimaria: string | null;
  corSecundaria: string | null;
  corFundo: string | null;
  links: LinkItem[];
  ativo: boolean;
  onSaved: () => void;
}

export function MinhaPaginaTab(props: MinhaPaginaTabProps) {
  const [value, setValue] = useState<LinkPageValue>({
    titulo: props.titulo ?? '',
    bio: props.bio ?? '',
    corPrimaria: props.corPrimaria ?? '',
    corSecundaria: props.corSecundaria ?? '',
    corFundo: props.corFundo ?? '',
    links: props.links,
    ativo: props.ativo,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.rpc('update_linktree_page', {
        p_titulo: value.titulo,
        p_bio: value.bio,
        p_cor_primaria: value.corPrimaria,
        p_cor_secundaria: value.corSecundaria,
        p_cor_fundo: value.corFundo,
        p_links: value.links as unknown as Json,
        p_ativo: value.ativo,
      });
      if (error) throw error;
      toast.success('Página atualizada!');
      props.onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar a página.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {props.slug ? (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Endereço da sua página</p>
            <p className="text-sm font-medium text-foreground truncate">
              {window.location.origin}/{props.slug}
            </p>
          </div>
          <a
            href={`/${props.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition-colors shrink-0"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/${props.slug}`);
              toast.success('Link copiado!');
            }}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition-colors shrink-0"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          O endereço da sua página ainda não foi definido pela Traffic Solutions. Fale com seu
          responsável para configurá-lo — enquanto isso você já pode preparar o conteúdo abaixo.
        </p>
      )}

      <LinkPageEditor value={value} onChange={setValue} />

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary hover:bg-primary text-foreground gap-2"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? 'Salvando...' : 'Salvar alterações'}
        </Button>
      </div>
    </div>
  );
}
