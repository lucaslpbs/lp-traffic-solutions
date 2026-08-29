import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

const CHAVE_SESSAO = 'ts:intro-vista';
const DURACAO_MS = 2400;

/** Slogan da marca — mesmo do <title> e das metatags do site. */
const SLOGAN = 'Marketing que Gera Resultados Reais';

/**
 * Abertura do sistema: logo + slogan enquanto o painel carrega.
 *
 * Toca uma vez por sessao do navegador. Voltar para o dashboard depois de
 * navegar pelas telas nao repete a animacao — uma intro que reaparece a cada
 * clique deixa de ser marca e vira obstaculo.
 *
 * A saida e comandada por setTimeout, e nao pelo fim da animacao: se o
 * requestAnimationFrame nao rodar (aba em segundo plano, economia de bateria),
 * uma cortina presa em tela deixaria o cliente sem acesso ao sistema. O
 * cronometro dispensa a cortina de qualquer jeito.
 */
export const IntroSistema = () => {
  const reduzir = useReducedMotion();

  // Decidido na primeira renderizacao para nao piscar a cortina depois do
  // painel ja ter aparecido.
  const [visivel, setVisivel] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return !sessionStorage.getItem(CHAVE_SESSAO);
    } catch {
      // Navegador com armazenamento bloqueado: mostra a intro e segue.
      return true;
    }
  });

  useEffect(() => {
    if (!visivel) return;

    try {
      sessionStorage.setItem(CHAVE_SESSAO, '1');
    } catch {
      /* sem armazenamento, a intro so nao sera lembrada */
    }

    const t = setTimeout(() => setVisivel(false), reduzir ? 600 : DURACAO_MS);
    return () => clearTimeout(t);
  }, [visivel, reduzir]);

  return (
    <AnimatePresence>
      {visivel && (
        <motion.div
          key="intro"
          role="status"
          aria-label="Carregando o sistema"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5, ease: 'easeInOut' } }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
        >
          {/* ── Brilho de fundo na cor do nivel ── */}
          <div className="absolute inset-0 overflow-hidden" aria-hidden>
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 0.45, scale: 1 }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              className="absolute left-1/2 top-1/2 h-[38rem] w-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-level/20 blur-3xl"
            />
          </div>

          <div className="relative flex flex-col items-center">
            {/* ── Logo ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.86, filter: 'blur(6px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <img
                src="/TFLOGO.png"
                alt="Traffic Solutions"
                className="h-16 sm:h-20 w-auto"
              />
              {/* facho de luz atravessando a logo */}
              {!reduzir && (
                <motion.span
                  aria-hidden
                  initial={{ x: '-140%' }}
                  animate={{ x: '240%' }}
                  transition={{ duration: 1.1, delay: 0.55, ease: 'easeInOut' }}
                  className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-12 bg-foreground/25 blur-md"
                />
              )}
            </motion.div>

            {/* ── Slogan ── */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 text-center text-sm sm:text-base font-medium tracking-wide text-muted-foreground px-6"
            >
              {SLOGAN}
            </motion.p>

            {/* ── Barra de carregamento ── */}
            <div className="mt-8 h-[3px] w-40 overflow-hidden rounded-full bg-foreground/10">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: (DURACAO_MS - 400) / 1000, ease: [0.3, 0.8, 0.4, 1] }}
                className="h-full rounded-full bg-gradient-to-r from-level-dark via-level to-level-glow"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
