import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Stagger, StaggerItem } from '@/components/dashboard/Motion';
import { EASE_OUT } from '@/lib/motion';
import { isLightColor } from '@/lib/colorExtraction';
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

/**
 * Fundo animado: gradiente vivo migrando entre as cores da paleta + linhas
 * grossas cruzando a tela em diagonal, como feixes de luz passando.
 */
function AnimatedBackground({
  corPrimaria,
  corSecundaria,
  corFundo,
  isLight,
  reduceMotion,
}: {
  corPrimaria: string;
  corSecundaria: string;
  corFundo: string;
  isLight: boolean;
  reduceMotion: boolean;
}) {
  const lineOpacity = isLight ? 0.3 : 0.45;
  const lines = [
    { color: corPrimaria, top: '6%', thickness: 14, angle: -18, duration: 9, delay: 0 },
    { color: corSecundaria, top: '32%', thickness: 8, angle: -18, duration: 12, delay: 2.6 },
    { color: corPrimaria, top: '58%', thickness: 18, angle: -18, duration: 14, delay: 5.1 },
    { color: corSecundaria, top: '82%', thickness: 10, angle: -18, duration: 10.5, delay: 1.4 },
  ];

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Gradiente vivo — migra devagar entre fundo e as cores da paleta */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(120deg, ${corFundo}, ${corPrimaria}40, ${corFundo}, ${corSecundaria}40, ${corFundo})`,
          backgroundSize: '400% 400%',
        }}
        animate={reduceMotion ? undefined : { backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
      />

      {/* Linhas grossas cruzando a tela */}
      {lines.map((line, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            top: line.top,
            left: 0,
            width: '60vmax',
            height: line.thickness,
            background: `linear-gradient(90deg, transparent, ${line.color}, transparent)`,
            opacity: lineOpacity,
            filter: 'blur(2px)',
            rotate: `${line.angle}deg`,
          }}
          initial={{ x: '-70vw' }}
          animate={reduceMotion ? undefined : { x: ['-70vw', '110vw'] }}
          transition={{ duration: line.duration, repeat: Infinity, ease: 'linear', delay: line.delay }}
        />
      ))}
    </div>
  );
}

export default function LinkPage() {
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<LinktreeData | null>(null);
  const reduceMotion = !!useReducedMotion();

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

  // O fundo é 100% escolhido pelo cliente (pode ser claro ou escuro), então o
  // texto/vidro precisa se adaptar ao contraste em vez de assumir branco fixo.
  const isLight = isLightColor(corFundo);
  const textPrimary = isLight ? '#18181b' : '#ffffff';
  const textMuted = isLight ? 'rgba(24,24,27,0.65)' : 'rgba(255,255,255,0.7)';
  const textFooter = isLight ? 'rgba(24,24,27,0.45)' : 'rgba(255,255,255,0.4)';
  const glassBg = isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)';
  const glassBgHover = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.1)';
  const glassBorder = isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.15)';
  const glassBorderHover = isLight ? 'rgba(0,0,0,0.22)' : 'rgba(255,255,255,0.25)';

  return (
    <div
      className="relative z-0 min-h-screen flex flex-col items-center px-6 py-16"
      style={{ background: corFundo, color: textPrimary }}
    >
      <AnimatedBackground
        corPrimaria={corPrimaria}
        corSecundaria={corSecundaria}
        corFundo={corFundo}
        isLight={isLight}
        reduceMotion={reduceMotion}
      />

      <motion.div
        className="w-full max-w-md flex flex-col items-center"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
      >
        <div className="relative">
          <motion.div
            className="absolute inset-0 rounded-2xl blur-xl -z-10"
            style={{ background: corPrimaria }}
            animate={reduceMotion ? undefined : { opacity: [0.35, 0.6, 0.35], scale: [0.95, 1.08, 0.95] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="h-24 w-24 rounded-2xl overflow-hidden backdrop-blur flex items-center justify-center shrink-0"
            style={{ border: `1px solid ${glassBorder}`, background: glassBg }}
            initial={{ opacity: 0, scale: 0.7, rotate: -8 }}
            animate={
              reduceMotion
                ? { opacity: 1, scale: 1, rotate: 0 }
                : { opacity: 1, scale: 1, rotate: 0, y: [0, -6, 0] }
            }
            transition={
              reduceMotion
                ? { duration: 0.5, ease: EASE_OUT }
                : {
                    opacity: { duration: 0.5, ease: EASE_OUT },
                    scale: { duration: 0.5, ease: EASE_OUT },
                    rotate: { duration: 0.5, ease: EASE_OUT },
                    y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 },
                  }
            }
          >
            {data.logo_url ? (
              <img src={data.logo_url} alt={data.nome_cliente} className="h-full w-full object-cover" />
            ) : (
              <Building2 className="h-10 w-10" style={{ color: textMuted }} />
            )}
          </motion.div>
        </div>

        <motion.div
          className="mt-5 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE_OUT, delay: 0.15 }}
        >
          <h1 className="text-2xl font-bold">{data.titulo || data.nome_cliente}</h1>
          {data.bio && (
            <p className="mt-2 text-sm" style={{ color: textMuted, whiteSpace: 'pre-line' }}>
              {data.bio}
            </p>
          )}
        </motion.div>

        <Stagger className="mt-8 w-full flex flex-col gap-3" stagger={0.07} delay={0.3}>
          {data.links.map((link) => {
            const Icon = LINK_TIPO_ICON[link.tipo as LinkTipo] ?? LINK_TIPO_ICON.custom;
            if (!link.url) return null;
            return (
              <StaggerItem key={link.id}>
                <motion.a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 w-full rounded-xl backdrop-blur px-5 py-3.5"
                  style={{
                    border: `1px solid ${glassBorder}`,
                    background: glassBg,
                    boxShadow: `0 0 0 1px ${corPrimaria}22`,
                  }}
                  whileHover={{ scale: reduceMotion ? 1 : 1.02, y: reduceMotion ? 0 : -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = glassBgHover;
                    e.currentTarget.style.borderColor = glassBorderHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = glassBg;
                    e.currentTarget.style.borderColor = glassBorder;
                  }}
                >
                  <Icon className="h-5 w-5 shrink-0" style={{ color: corPrimaria }} />
                  <span className="font-medium">{link.label || link.url}</span>
                </motion.a>
              </StaggerItem>
            );
          })}
        </Stagger>

        <motion.span
          className="mt-12 text-xs"
          style={{ color: textFooter }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          Traffic Solutions
        </motion.span>
      </motion.div>
    </div>
  );
}
