export default function Footer() {
  return (
    <footer className="bg-[#082347] px-5 py-12">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div className="flex flex-col items-center md:items-start gap-2">
          <img src="/TFLOGO.png" alt="Traffic Solutions" className="h-8 object-contain" />
          <p className="font-body text-[#F0F1F2]/60 text-sm">Marketing que gera resultados.</p>
        </div>

        <div className="flex flex-col items-center md:items-end gap-1">
          <p className="font-body text-[#F0F1F2]/70 text-sm">
            Proposta válida por 7 dias a partir do envio
          </p>
          <a
            href="https://wa.me/5585998088064"
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-[#2f6fd6] text-sm hover:underline"
          >
            wa.me/5585998088064
          </a>
        </div>
      </div>
    </footer>
  );
}
