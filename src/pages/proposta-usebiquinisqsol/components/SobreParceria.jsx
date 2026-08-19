import { motion } from 'framer-motion';

export default function SobreParceria() {
  return (
    <section id="sobre" className="bg-[#FFF8F0] px-5 py-14 md:py-28">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="max-w-3xl mx-auto text-center"
      >
        <p className="font-body uppercase text-[#FF4F6E] text-xs md:text-sm tracking-[0.28em] font-semibold mb-4">
          01 · A OPORTUNIDADE
        </p>
        <h2 className="font-display font-bold text-[#0B1F4D] text-[clamp(26px,4vw,40px)] leading-tight mb-6">
          Verão é o melhor momento pra Q'Sol vender mais
        </h2>
        <p className="font-body text-[#0B1F4D]/75 text-base md:text-lg leading-relaxed">
          A <span className="font-semibold text-[#0B1F4D]">Use Biquínis Q'Sol</span> tem produto de
          desejo, ticket certo para conversão direta via WhatsApp e uma temporada inteira pela frente.
          O que falta é previsibilidade: gente qualificada chegando todos os dias no perfil e no
          WhatsApp da loja. É exatamente aí que entra a Traffic Solutions — preparamos 3 caminhos
          possíveis de parceria para acelerar isso, cada um pensado pro momento certo da marca.
        </p>
      </motion.div>
    </section>
  );
}
