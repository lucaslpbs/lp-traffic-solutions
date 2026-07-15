import { motion } from 'framer-motion';
import pilar1 from '../../assets/pilar-1.jpeg';
import pilar2 from '../../assets/pilar-2.jpeg';
import pilar3 from '../../assets/pilar-3.jpeg';

const PILARES = [
  {
    titulo: 'Educação Financeira',
    texto: 'Oferecemos conteúdos gratuitos para você entender suas opções de crédito e tomar decisões mais seguras.',
    img: pilar1,
  },
  {
    titulo: 'Tecnologia',
    texto: 'Plataforma digital robusta, segura e intuitiva, sempre em evolução.',
    img: pilar2,
  },
  {
    titulo: 'Atendimento Humano e Personalizado',
    texto: 'Aqui, cada cliente é único. Nossa equipe está disponível 7 dias por semana para te orientar com clareza e respeito.',
    img: pilar3,
  },
];

export function Proposito() {
  return (
    <section id="sobre" className="bg-white py-24 lg:py-32">
      <div className="max-w-[1180px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mb-16"
        >
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#c9a227]">Sobre nós</span>
          <h2 className="lpc-serif text-[#0f0e0c] font-semibold text-[clamp(28px,3.4vw,42px)] mt-2 mb-4">
            Nosso propósito
          </h2>
          <p className="text-[#0f0e0c]/60 leading-relaxed text-lg">
            A LPC Capital nasceu para transformar o acesso ao crédito em uma jornada mais
            consciente, simples e eficiente.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {PILARES.map((pilar, i) => (
            <motion.div
              key={pilar.titulo}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="group"
            >
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-5">
                <img
                  src={pilar.img}
                  alt={pilar.titulo}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-2xl" />
                <span className="absolute top-4 left-4 w-8 h-8 rounded-full bg-[#0a0a0a] text-[#e8c968] text-sm font-bold flex items-center justify-center">
                  {i + 1}
                </span>
              </div>
              <h3 className="text-[#0f0e0c] font-bold text-lg mb-2">{pilar.titulo}</h3>
              <p className="text-[#0f0e0c]/60 leading-relaxed">{pilar.texto}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
