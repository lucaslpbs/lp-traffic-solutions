import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Stagger, StaggerItem, Reveal } from '@/components/dashboard/Motion';
import { fadeUp } from '@/lib/motion';
import { LINK_TIPO_ICON, type LinkItem, type LinkTipo } from '@/components/linktree/LinkPageEditor';
import { Building2 } from 'lucide-react';
import NotFound from './NotFound';

interface LinktreeData {
  nome_cliente: string;
  logo_url: string | null;
  titulo: string | null;
  bio: string | null;
  cor_primaria: string | null;
  cor_secundaria: string | null;
  cor_fundo: string | null;
  links: LinkItem[];
}

const DEFAULT_PRIMARY = '#6366f1';
const DEFAULT_SECONDARY = '#8b5cf6';
const DEFAULT_BG = '#0b0b14';

export default function LinkPage() {
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<LinktreeData | null>(null);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    setLoading(true);
    supabase
      .from('linktree_publico')
      .select('nome_cliente, logo_url, titulo, bio, cor_primaria, cor_secundaria, cor_fundo, links')
      .eq('slug', slug)
      .maybeSingle()
      .then(({ data: row }) => {
        if (!active) return;
        if (row) {
          setData({
            nome_cliente: row.nome_cliente ?? '',
            logo_url: row.logo_url,
            titulo: row.titulo,
            bio: row.bio,
            cor_primaria: row.cor_primaria,
            cor_secundaria: row.cor_secundaria,
            cor_fundo: row.cor_fundo,
            links: Array.isArray(row.links) ? (row.links as unknown as LinkItem[]) : [],
          });
        } else {
          setData(null);
        }
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: DEFAULT_BG }}
      >
        <div className="h-10 w-10 rounded-full border-2 border-white/20 border-t-white animate-spin" />
      </div>
    );
  }

  if (!data) {
    return <NotFound />;
  }

  const corPrimaria = data.cor_primaria || DEFAULT_PRIMARY;
  const corSecundaria = data.cor_secundaria || DEFAULT_SECONDARY;
  const corFundo = data.cor_fundo || DEFAULT_BG;

  return (
    <div
      className="relative min-h-screen flex flex-col items-center px-6 py-16"
      style={{
        background: `radial-gradient(circle at 20% -10%, ${corPrimaria}33, transparent 55%), radial-gradient(circle at 80% 110%, ${corSecundaria}33, transparent 55%), ${corFundo}`,
        color: '#fff',
      }}
    >
      <motion.div
        className="absolute inset-0 -z-10 pointer-events-none"
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          background: `radial-gradient(circle at 50% 0%, ${corPrimaria}22, transparent 60%)`,
        }}
      />

      <div className="w-full max-w-md flex flex-col items-center">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="h-24 w-24 rounded-2xl overflow-hidden border border-white/15 bg-white/5 backdrop-blur flex items-center justify-center shrink-0"
        >
          {data.logo_url ? (
            <img src={data.logo_url} alt={data.nome_cliente} className="h-full w-full object-cover" />
          ) : (
            <Building2 className="h-10 w-10 text-white/60" />
          )}
        </motion.div>

        <Reveal delay={0.1} className="mt-5 text-center">
          <h1 className="text-2xl font-bold">{data.titulo || data.nome_cliente}</h1>
          {data.bio && <p className="mt-2 text-sm text-white/70">{data.bio}</p>}
        </Reveal>

        <Stagger className="mt-8 w-full flex flex-col gap-3" stagger={0.06} delay={0.2}>
          {data.links.map((link) => {
            const Icon = LINK_TIPO_ICON[link.tipo as LinkTipo] ?? LINK_TIPO_ICON.custom;
            if (!link.url) return null;
            return (
              <StaggerItem key={link.id}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 w-full rounded-xl border border-white/15 bg-white/5 backdrop-blur px-5 py-3.5 hover:bg-white/10 hover:border-white/25 hover:-translate-y-0.5 transition-all"
                  style={{ boxShadow: `0 0 0 1px ${corPrimaria}22` }}
                >
                  <Icon className="h-5 w-5 shrink-0" style={{ color: corPrimaria }} />
                  <span className="font-medium">{link.label || link.url}</span>
                </a>
              </StaggerItem>
            );
          })}
        </Stagger>

        <Reveal delay={0.4} subtle className="mt-12 text-xs text-white/40">
          Traffic Solutions
        </Reveal>
      </div>
    </div>
  );
}
