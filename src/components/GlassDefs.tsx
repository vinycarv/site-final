import { useEffect } from 'react';

// Filtro SVG de refração usado pelo efeito "liquid glass" (Chrome/Edge aplicam no fundo
// via backdrop-filter; nos outros navegadores fica o vidro com desfoque e brilho, sem distorção).
// Também liga o brilho especular que acompanha o cursor em qualquer elemento .glass.
export default function GlassDefs() {
  useEffect(() => {
    const ok = typeof CSS !== 'undefined' && CSS.supports('backdrop-filter', 'url(#lg) blur(1px)') && /Chrome\//.test(navigator.userAgent);
    if (ok) document.documentElement.classList.add('lg-refract');
    const onMove = (e: PointerEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.<HTMLElement>('.glass, .glass-text');
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--gx', `${e.clientX - r.left}px`);
      el.style.setProperty('--gy', `${e.clientY - r.top}px`);
    };
    addEventListener('pointermove', onMove, { passive: true });
    return () => removeEventListener('pointermove', onMove);
  }, []);

  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <filter id="lg" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.008 0.012" numOctaves="2" seed="7" result="n" />
        <feGaussianBlur in="n" stdDeviation="2" result="nb" />
        <feDisplacementMap in="SourceGraphic" in2="nb" scale="38" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}
