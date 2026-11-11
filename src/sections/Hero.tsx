import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import HalftoneHands from '../components/HalftoneHands';
import MagneticButton from '../components/MagneticButton';
import { LogoMark } from '../components/Logo';
import { stats } from '../data/content';
import { useEnvironment } from '../hooks/useEnvironment';

// Abertura: duas mãos robóticas em meio-tom apontam para o símbolo da NVUP.
// Elas chegam perto, mas não se tocam. A resposta fica para o fim da página.
export default function Hero({ ready }: { ready: boolean }) {
  const env = useEnvironment();
  const root = useRef<HTMLElement>(null);
  const clients = stats.find((s) => s.label.includes('clientes'));

  useEffect(() => {
    if (!ready || !root.current) return;
    const ctx = gsap.context(() => {
      if (env.reduced) return;
      gsap.from('.hero__tile', { scale: 0.6, opacity: 0, duration: 1.6, ease: 'expo.out' });
      gsap.from('.hero__reveal', { y: 30, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.1, delay: 0.5 });
      gsap.to('.hero__tile', {
        scale: 1.35, ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      });
      gsap.to('.hero__bottom', {
        y: -80, opacity: 0, ease: 'none',
        scrollTrigger: { trigger: root.current, start: '20% top', end: '70% top', scrub: true },
      });
    }, root);
    return () => ctx.revert();
  }, [ready, env.reduced]);

  return (
    <section className="hero" id="top" ref={root} aria-labelledby="hero-title">
      <HalftoneHands mode="hero" className="hero__canvas" />
      <div className="hero__tile glass" aria-hidden="true">
        <LogoMark className="hero__mark" />
      </div>

      <div className="hero__bottom">
        <div className="hero__proof hero__reveal">
          <span className="avatars" aria-hidden="true"><i /><i /><i /><i /></span>
          <span><b>{clients ? `${clients.prefix}${clients.value}` : '+50'}</b> marcas já passaram por aqui</span>
        </div>
        <h1 id="hero-title" className="hero__title hero__reveal">
          Sua marca em <span className="glass-text">movimento</span>.
        </h1>
        <p className="hero__lede hero__reveal">A NVUP filma, edita e posta. Você só acompanha o resultado.</p>
        <div className="hero__actions hero__reveal">
          <MagneticButton variant="light" href="#trabalhos" arrow>Ver o que fazemos</MagneticButton>
          <MagneticButton variant="glass" href="#contato">Pedir orçamento</MagneticButton>
        </div>
      </div>

      <a className="hero__scroll glass" href="#servicos">
        <span className="hero__scroll-dot" aria-hidden="true" />
        Role. Elas ainda não se tocaram.
      </a>
    </section>
  );
}
