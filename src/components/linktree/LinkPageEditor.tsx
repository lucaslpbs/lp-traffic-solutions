import {
  ArrowDown,
  ArrowUp,
  Facebook,
  Globe,
  Instagram,
  Link2,
  Mail,
  MapPin,
  MessageCircle,
  Music2,
  Plus,
  Trash2,
  Youtube,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type LinkTipo =
  | 'whatsapp'
  | 'instagram'
  | 'site'
  | 'facebook'
  | 'tiktok'
  | 'youtube'
  | 'email'
  | 'localizacao'
  | 'custom';

export interface LinkItem {
  id: string;
  tipo: LinkTipo;
  label: string;
  url: string;
}

export interface LinkPageValue {
  titulo: string;
  bio: string;
  corPrimaria: string;
  corSecundaria: string;
  corFundo: string;
  links: LinkItem[];
  ativo: boolean;
}

export const LINK_TIPOS: { value: LinkTipo; label: string; icon: React.ElementType }[] = [
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { value: 'instagram', label: 'Instagram', icon: Instagram },
  { value: 'site', label: 'Site', icon: Globe },
  { value: 'facebook', label: 'Facebook', icon: Facebook },
  { value: 'tiktok', label: 'TikTok', icon: Music2 },
  { value: 'youtube', label: 'YouTube', icon: Youtube },
  { value: 'email', label: 'E-mail', icon: Mail },
  { value: 'localizacao', label: 'Localização', icon: MapPin },
  { value: 'custom', label: 'Link genérico', icon: Link2 },
];

export const LINK_TIPO_ICON: Record<LinkTipo, React.ElementType> = LINK_TIPOS.reduce(
  (acc, t) => ({ ...acc, [t.value]: t.icon }),
  {} as Record<LinkTipo, React.ElementType>
);

const inputCls =
  'bg-foreground/5 border-foreground/10 text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-0';
const labelCls = 'block text-sm font-medium text-foreground/85 mb-1.5';

function newLinkId() {
  return `link_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function ColorField({ label, value, onChange }: ColorFieldProps) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-12 rounded-lg border border-foreground/10 bg-transparent cursor-pointer"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className={inputCls}
        />
      </div>
    </div>
  );
}

interface LinkPageEditorProps {
  value: LinkPageValue;
  onChange: (value: LinkPageValue) => void;
}

export function LinkPageEditor({ value, onChange }: LinkPageEditorProps) {
  const set = <K extends keyof LinkPageValue>(field: K, v: LinkPageValue[K]) =>
    onChange({ ...value, [field]: v });

  const setLink = (id: string, patch: Partial<LinkItem>) =>
    set(
      'links',
      value.links.map((l) => (l.id === id ? { ...l, ...patch } : l))
    );

  const addLink = () =>
    set('links', [...value.links, { id: newLinkId(), tipo: 'custom', label: '', url: '' }]);

  const removeLink = (id: string) =>
    set('links', value.links.filter((l) => l.id !== id));

  const moveLink = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= value.links.length) return;
    const links = [...value.links];
    [links[index], links[target]] = [links[target], links[index]];
    set('links', links);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-lg border border-foreground/10 p-4">
        <div>
          <p className="text-sm font-medium text-foreground">Página pública ativa</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quando desativado, a URL fica indisponível.
          </p>
        </div>
        <Switch checked={value.ativo} onCheckedChange={(v) => set('ativo', v)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={labelCls}>Título</label>
          <Input
            value={value.titulo}
            onChange={(e) => set('titulo', e.target.value)}
            placeholder="Nome exibido na página"
            className={inputCls}
          />
        </div>
        <div className="col-span-2">
          <label className={labelCls}>Bio / subtítulo</label>
          <Textarea
            value={value.bio}
            onChange={(e) => set('bio', e.target.value)}
            placeholder="Uma frase curta sobre o negócio"
            className={inputCls}
            rows={2}
          />
        </div>
        <ColorField label="Cor primária" value={value.corPrimaria} onChange={(v) => set('corPrimaria', v)} />
        <ColorField label="Cor secundária" value={value.corSecundaria} onChange={(v) => set('corSecundaria', v)} />
        <ColorField label="Cor de fundo" value={value.corFundo} onChange={(v) => set('corFundo', v)} />
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Links</p>
        {value.links.map((link, i) => {
          const Icon = LINK_TIPO_ICON[link.tipo];
          return (
            <div key={link.id} className="border border-foreground/10 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Select value={link.tipo} onValueChange={(v) => setLink(link.id, { tipo: v as LinkTipo })}>
                  <SelectTrigger className={`${inputCls} w-40 shrink-0`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-foreground/10 text-foreground">
                    {LINK_TIPOS.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        <span className="flex items-center gap-2">
                          <t.icon className="h-3.5 w-3.5" />
                          {t.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => moveLink(i, -1)}
                    disabled={i === 0}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveLink(i, 1)}
                    disabled={i === value.links.length - 1}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeLink(link.id)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                <Input
                  value={link.label}
                  onChange={(e) => setLink(link.id, { label: e.target.value })}
                  placeholder="Texto do botão"
                  className={inputCls}
                />
              </div>
              <Input
                value={link.url}
                onChange={(e) => setLink(link.id, { url: e.target.value })}
                placeholder="https://..."
                className={inputCls}
              />
            </div>
          );
        })}
        <button
          type="button"
          onClick={addLink}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-foreground/10 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/20 hover:bg-foreground/5 transition-colors w-full justify-center"
        >
          <Plus className="h-4 w-4" />
          Adicionar link
        </button>
      </div>
    </div>
  );
}
