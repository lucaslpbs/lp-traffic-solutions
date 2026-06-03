import { useEffect, useRef } from 'react';

export default function NucleoOftalmologiaDashboardKommo() {
  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <iframe
      ref={ref}
      src="/nucleo-kommo-dashboard.html"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        border: 'none',
        zIndex: 9999,
      }}
      title="Dashboard CRM Kommo – Núcleo de Oftalmologia"
    />
  );
}
