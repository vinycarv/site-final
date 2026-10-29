import { useEffect, useRef, useState } from 'react';
import { gsap } from '../lib/gsap';
import { site } from '../data/content';

type Props = { onDone: () => void; ready: boolean };

// Contador baseado em etapas reais: fontes carregadas, página completa e cena 3D montada.
// Cada etapa só conta quando de fato termina; não há porcentagem falsa por tempo.
export default function Preloader({ onDone, ready }: Props) {
  const [pct, setPct] = useState(0);
  const [done, setDone] = useState(false);
  const [steps, setSteps] = useState({ fonts: false, load: false, scene: false });
  const root = useRef<HTMLDivElement>(null);
  const counter = useRef({ v: 0 });

  useEffect(() => {
    let cancelled = false;
    document.fonts.ready.then(() => !cancelled && setSteps((s) => ({ ...s, fonts: true })));
    const onLoad = () => setSteps((s) => ({ ...s, load: true }));
    if (document.readyState === 'complete') onLoad();
    else addEventListener('load', onLoad, { once: true });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (ready) setSteps((s) => ({ ...s, scene: true }));
  }, [ready]);

  const total = 3;
  const finished = Object.values(steps).filter(Boolean).length;
  const target = Math.round((finished / total) * 100);

  useEffect(() => {
    gsap.to(counter.current, {
      v: target, duration: 0.8, ease: 'power2.out',
      onUpdate: () => setPct(Math.round(counter.current.v)),
    });
  }, [target]);

  useEffect(() => {
    if (finished < total) return;
    const tl = gsap.timeline({ onComplete: () => { setDone(true); onDone(); } });
    tl.to('.pre__count', { opacity: 0, duration: 0.3, delay: 0.25 })
      .to('.pre__line', { scaleX: 1, duration: 0.6, ease: 'expo.inOut' }, '<')
      .to(root.current, { yPercent: -100, duration: 1.2, ease: 'expo.inOut' }, '+=0.1');
  }, [finished, onDone]);

  useEffect(() => {
    const dot = document.querySelector('.pre__dot');
    if (!dot) return;
    gsap.fromTo(dot, { scale: 0 }, { scale: 1, duration: 0.8, ease: 'back.out(2)' });
    gsap.fromTo('.pre__name .mask > span', { yPercent: 110 }, { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08, delay: 0.3 });
  }, []);

  if (done) return null;

  return (
    <div className="pre" ref={root} role="status" aria-live="polite" aria-label={`Carregando, ${pct}%`}>
      <div className="pre__rec"><span className="rec-dot" />REC</div>
      <div className="pre__center">
        <div className="pre__dot" />
        <div className="pre__name" aria-label={site.name}>
          {site.name.split(' ').map((w) => (
            <span className="mask" key={w} aria-hidden="true"><span>{w}</span></span>
          ))}
        </div>
      </div>
      <div className="pre__line" />
      <div className="pre__count">{String(pct).padStart(3, '0')}<span>%</span></div>
    </div>
  );
}
