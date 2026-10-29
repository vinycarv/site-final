import { useEffect, useRef } from 'react';
import { services, site, stats } from '../data/content';
import { gsap } from '../lib/gsap';
import { useEnvironment } from '../hooks/useEnvironment';
import MotionText from '../components/MotionText';

// Sobre: retrato abstrato (lente e órbitas, sem foto) e contadores que sobem ao entrar na tela.
export default function About() {
  const env = useEnvironment();
  const root = useRef<HTMLElement>(null);
  const lens = useRef<SVGGElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || env.reduced) return;
    const ctx = gsap.context(() => {
      gsap.to('.about__orbit', { rotate: 360, transformOrigin: '50% 50%', duration: 40, repeat: -1, ease: 'none' });
      gsap.to(lens.current, {
        rotate: 90, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
      });
      gsap.utils.toArray<HTMLElement>('.about__portrait').forEach((p) => {
        gsap.fromTo(p, { clipPath: 'inset(100% 0 0 0)' }, {
          clipPath: 'inset(0% 0 0 0)', duration: 1.4, ease: 'expo.inOut',
          scrollTrigger: { trigger: p, start: 'top 85%', once: true },
        });
      });
      gsap.utils.toArray<HTMLElement>('[data-count]').forEach((n) => {
        const target = Number(n.dataset.count);
        const prefix = n.dataset.prefix ?? '';
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target, duration: 1.8, ease: 'power3.out',
          onUpdate: () => { n.textContent = prefix + Math.round(obj.v); },
          scrollTrigger: { trigger: n, start: 'top 90%', once: true },
        });
      });
    }, el);
    return () => ctx.revert();
  }, [env.reduced]);

  return (
    <section id="sobre" ref={root} className="about" aria-label="Sobre">
      <div className="about__portrait" aria-hidden="true">
        <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id="glow" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#ff5a1f" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#0b0b0d" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="400" height="500" fill="url(#glow)" />
          <g className="about__orbit" stroke="#ff5a1f" strokeOpacity="0.5" fill="none">
            <circle cx="200" cy="230" r="150" strokeDasharray="2 10" />
          </g>
          <g className="about__orbit" stroke="#f5f3ef" strokeOpacity="0.25" fill="none">
            <ellipse cx="200" cy="230" rx="190" ry="60" />
          </g>
          <g ref={lens}>
            <circle cx="200" cy="230" r="78" fill="#141416" stroke="#ff5a1f" strokeWidth="2" />
            <circle cx="200" cy="230" r="44" fill="none" stroke="#ff5a1f" strokeOpacity="0.7" />
            <circle cx="200" cy="230" r="14" fill="#ff5a1f" />
            <path d="M160 170 L190 170 M160 170 L160 200" stroke="#f5f3ef" strokeOpacity="0.6" strokeWidth="1.5" fill="none" />
          </g>
          <text x="24" y="470" fill="#f5f3ef" fillOpacity="0.5" fontFamily="JetBrains Mono, monospace" fontSize="12">REC · VC-01</text>
        </svg>
      </div>

      <div className="about__copy">
        <span className="mono">03 — Sobre</span>
        <MotionText as="h2" className="display" mode="words">
          Eu cuido do ritmo.
        </MotionText>
        <p>{site.intro}</p>
        <div className="about__stats">
          {stats.map((s) => (
            <div key={s.label} className="stat">
              <span className="stat__num" data-count={s.value} data-prefix={s.prefix}>
                {env.reduced ? `${s.prefix}${s.value}` : `${s.prefix}0`}
              </span>
              <span className="stat__label" style={{ display: 'block' }}>{s.label}</span>
            </div>
          ))}
        </div>
        <ul className="services">
          {services.map((s, i) => (
            <li key={s}>
              {s}
              <span>{String(i + 1).padStart(2, '0')}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
