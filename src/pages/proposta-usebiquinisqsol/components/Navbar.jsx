import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-[1000] flex items-center justify-between px-4 sm:px-5 md:px-10 transition-[background-color,padding,border-color,box-shadow] duration-300 ${
        scrolled
          ? 'py-2.5 sm:py-3 bg-[#0B1F4D]/90 backdrop-blur-md border-b border-[#0B1F4D]/40 shadow-lg'
          : 'py-4 sm:py-5 bg-transparent border-b border-transparent'
      }`}
    >
      <img src="/TFLOGO.png" alt="Traffic Solutions" className="h-7 md:h-8 object-contain" />

      <span
        className="hidden sm:block text-[#FFF8F0] text-lg tracking-wide"
        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
      >
        Q'Sol
      </span>

      <motion.a
        href="https://wa.me/5585998088064"
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className="inline-flex items-center justify-center gap-2 min-w-[44px] min-h-[44px] px-3 sm:px-5 py-2 rounded-full font-body font-semibold text-sm text-white"
        style={{ background: 'linear-gradient(90deg, #FF7A3D, #FF4F6E)' }}
      >
        <MessageCircle size={18} />
        <span className="hidden sm:inline">Falar conosco</span>
      </motion.a>
    </motion.nav>
  );
}
