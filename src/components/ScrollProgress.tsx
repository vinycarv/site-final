import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';

// Linha de progresso no topo, ligada à rolagem da página.
export default function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const t = gsap.to(ref.current, {
      scaleX: 1, ease: 'none',
      scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 },
    });
    return () => { t.scrollTrigger?.kill(); t.kill(); };
  }, []);
  return <div className="progress" ref={ref} aria-hidden="true" />;
}
