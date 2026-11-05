import { useEffect, useRef, useState } from 'react';
import { gsap } from '../lib/gsap';
import { LogoMark, LogoWord } from './Logo';

type Props = { onDone: () => void; ready: boolean };

// Contador baseado em etapas reais: fontes carregadas, página completa e cena montada.
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
    // trava de segurança: rede lenta não pode prender a pessoa na abertura
    const cap = setTimeout(() => !cancelled && setSteps({ fonts: true, load: true, scene: true }), 2600);
    return () => { cancelled = true; clearTimeout(cap); };
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
    gsap.fromTo('.pre__mark', { clipPath: 'inset(100% 0 0 0)', scale: 0.9 }, { clipPath: 'inset(0% 0 0 0)', scale: 1, duration: 1.2, ease: 'expo.out' });
    gsap.fromTo('.pre__word', { opacity: 0, letterSpacing: '0.4em', y: 10 }, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', delay: 0.35 });
  }, []);

  if (done) return null;

  return (
    <div className="pre" ref={root} role="status" aria-live="polite" aria-label={`Carregando, ${pct}%`}>
      <div className="pre__rec mono"><span className="rec-dot" />REC</div>
      <div className="pre__center">
        <LogoMark className="pre__mark" />
        <LogoWord className="pre__word" />
      </div>
      <div className="pre__line" />
      <div className="pre__count">{String(pct).padStart(3, '0')}<span>%</span></div>
    </div>
  );
}
