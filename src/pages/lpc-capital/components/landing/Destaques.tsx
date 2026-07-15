import { motion } from 'framer-motion';
import ico01 from '../../assets/ico01.png';
import ico02 from '../../assets/ico02.png';
import ico03 from '../../assets/ico03.png';
import ico04 from '../../assets/ico04.png';

const DESTAQUES = [
  { icon: ico01, texto: 'Prazo de 20 anos', big: true },
  { icon: ico02, texto: '60% do valor do imóvel' },
  { icon: ico03, texto: 'Facilidade na aprovação' },
  { icon: ico04, texto: 'Diversificação de bancos para aprovação e taxas a partir de 1,09%' },
];

export function Destaques() {
  return (
    <section className="lpc-noise bg-[#00325b] py-24 lg:py-28">
      <div className="max-w-[1180px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#c99900]">Destaques</span>
          <h2 className="lpc-display text-white font-semibold text-[clamp(26px,3vw,38px)] mt-2">
            Números que fazem a diferença
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {DESTAQUES.map((item, i) => (
            <motion.div
              key={item.texto}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`rounded-2xl p-7 flex flex-col gap-6 ${
                i % 2 === 0
                  ? 'bg-gradient-to-br from-[#c99900] to-[#f3de74] text-[#00325b]'
                  : 'bg-white/[0.04] border border-white/10 text-white'
              }`}
            >
              <img src={item.icon} alt="" className={`w-10 h-10 object-contain ${i % 2 === 0 ? 'invert' : ''}`} />
              <p className="font-bold text-lg leading-snug">{item.texto}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
