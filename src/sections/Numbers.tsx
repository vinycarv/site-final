import { useEffect, useRef, useState } from 'react';
import { site, stats } from '../data/content';
import { gsap } from '../lib/gsap';

// Números contam do zero quando entram na tela.
export default function Numbers() {
  return (
    <section className="numbers" id="resultados" aria-labelledby="numbers-title">
      <h2 id="numbers-title" className="sr-only">Resultados</h2>
      <ul className="numbers__grid">
        {stats.map((s) => <Counter key={s.label} {...s} />)}
      </ul>
      <p className="numbers__by">Fundada por <b>{site.founder}</b>, editor e filmmaker.</p>
    </section>
  );
}

function Counter({ value, prefix, suffix, label }: { value: number; prefix: string; suffix: string; label: string }) {
  const ref = useRef<HTMLLIElement>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const o = { v: 0 };
    const t = gsap.to(o, {
      v: value, duration: 2.2, ease: 'expo.out',
      onUpdate: () => setN(Math.round(o.v)),
      scrollTrigger: { trigger: ref.current, start: 'top 85%', once: true },
    });
    return () => { t.scrollTrigger?.kill(); t.kill(); };
  }, [value]);
  return (
    <li ref={ref} className="numbers__item">
      <span className="numbers__value" aria-label={`${prefix}${value}${suffix}`}>
        <span aria-hidden="true">{prefix}{n}{suffix}</span>
      </span>
      <span className="numbers__label">{label}</span>
    </li>
  );
}
