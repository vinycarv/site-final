import { useEffect, useRef } from 'react';
import { site } from '../data/content';
import { gsap, ScrollTrigger } from '../lib/gsap';
import CinemaScene from '../three/CinemaScene';
import MagneticButton from '../components/MagneticButton';
import MotionText from '../components/MotionText';
import { useEnvironment } from '../hooks/useEnvironment';

// Abertura em tela cheia. Ao rolar, a cena encolhe para um quadro cinematográfico
// (máscara com clip-path), e o título se afasta em profundidade.
export default function Hero({ ready }: { ready: boolean }) {
  const env = useEnvironment();
  const frame = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLDivElement>(null);
  const showScene = env.webgl && !env.reduced;

  useEffect(() => {
    if (!frame.current || !title.current || env.reduced) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(frame.current,
        { clipPath: 'inset(0% 0% 0% 0% round 0px)' },
        {
          clipPath: 'inset(9% 14% 14% 14% round 6px)', ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
        });
      gsap.to(title.current, {
        y: 180, z: -200, scale: 0.92, opacity: 0.1, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
      });
    });
    return () => ctx.revert();
  }, [env.reduced]);

  useEffect(() => {
    if (ready) ScrollTrigger.refresh();
  }, [ready]);

  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero__clip" ref={frame}>
        {showScene ? <CinemaScene variant="hero" /> : <div className="hero__fallback" aria-hidden="true" />}
        <div className="hero__vignette" aria-hidden="true" />
      </div>

      <div className="hero__meta" style={{ opacity: ready ? 1 : 0, transition: 'opacity 1s .4s' }}>
        <span className="mono rec"><span className="rec-dot" />{site.role}</span>
        <span className="mono">Edição · Cor · Direção</span>
      </div>

      <div className="hero__content" ref={title}>
        <h1 id="hero-title" className="display hero__title">
          <MotionText as="span" mode="words" delay={ready ? 0 : 1.6} start="top 100%">
            Histórias que prendem
          </MotionText>
          <br />
          <MotionText as="span" className="hero__em" mode="words" delay={ready ? 0.15 : 1.75} start="top 100%">
            a atenção
          </MotionText>
        </h1>
        <div className="hero__sub">
          <p className="hero__lede reveal-fade" style={{ opacity: ready ? 1 : 0, transition: 'opacity 1.2s .9s' }}>{site.intro}</p>
          <div className="hero__actions">
            <MagneticButton variant="primary" href="#trabalhos" data-cursor="link">Explorar projetos</MagneticButton>
            <MagneticButton href="#contato" data-cursor="link">Vamos conversar</MagneticButton>
          </div>
        </div>
      </div>
      <span className="mono hero__scroll" aria-hidden="true">Role para ver</span>
    </section>
  );
}
