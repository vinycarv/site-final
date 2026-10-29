import { useEffect, useRef } from 'react';
import type { Project } from '../data/content';
import { gsap } from '../lib/gsap';
import { useEnvironment } from '../hooks/useEnvironment';

// Expansão do card: o recorte (clip-path) parte da posição do card e cresce até a tela inteira.
// Ao fechar, o caminho inverso devolve a composição para o card de origem.
export default function ProjectDetail({ project: p, origin, onClose }: { project: Project; origin: HTMLElement | null; onClose: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const env = useEnvironment();

  const originInset = () => {
    const r = origin?.getBoundingClientRect();
    if (!r) return 'inset(40% 40% 40% 40% round 6px)';
    return `inset(${r.top}px ${innerWidth - r.right}px ${innerHeight - r.bottom}px ${r.left}px round 6px)`;
  };

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    document.body.style.overflow = 'hidden';
    el.style.visibility = 'visible';
    if (env.reduced) {
      gsap.set(el, { clipPath: 'inset(0px 0px 0px 0px round 0px)' });
    } else {
      gsap.fromTo(el, { clipPath: originInset() }, { clipPath: 'inset(0px 0px 0px 0px round 0px)', duration: 1.1, ease: 'expo.inOut' });
    }
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && handleClose();
    addEventListener('keydown', onKey);
    return () => {
      removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    const el = root.current;
    if (!el) return;
    const done = () => {
      el.style.visibility = 'hidden';
      onClose();
      origin?.focus();
    };
    if (env.reduced) return done();
    gsap.to(el, { clipPath: originInset(), duration: 0.9, ease: 'expo.inOut', onComplete: done });
  };

  return (
    <div ref={root} className="detail" role="dialog" aria-modal="true" aria-labelledby="detail-title" style={{ visibility: 'hidden' }}>
      <button ref={closeBtn} className="btn detail__close" onClick={handleClose} type="button" data-cursor="link">
        <span className="btn__fill" aria-hidden="true" /><span className="btn__label">Fechar</span>
      </button>
      <div className="detail__media" style={{ background: `linear-gradient(135deg, ${p.tone[0]}, ${p.tone[1]})` }}>
        {p.videoUrl ? (
          <video src={p.videoUrl} controls playsInline preload="metadata" style={{ width: '100%', height: '100%', objectFit: 'cover' }}>
            Seu navegador não suporta vídeo. <a href={p.externalUrl || p.videoUrl}>Abrir o vídeo</a>.
          </video>
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
            <span className="mono">{p.externalUrl ? 'Vídeo disponível no link abaixo' : 'Vídeo em breve'}</span>
          </div>
        )}
      </div>
      <div className="detail__body">
        <span className="mono">{p.number} — {p.category} · {p.year}</span>
        <h2 id="detail-title" className="display detail__title">{p.title}</h2>
        <p style={{ color: 'var(--muted)', maxWidth: '60ch', margin: 0, fontSize: 18 }}>{p.description}</p>
        <dl className="mono" style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '8px 24px', margin: 0 }}>
          <dt>Função</dt><dd style={{ margin: 0 }}>{p.role}</dd>
          <dt>Formato</dt><dd style={{ margin: 0 }}>{p.format}</dd>
        </dl>
        {p.externalUrl && (
          <a className="btn btn--primary" href={p.externalUrl} target="_blank" rel="noopener noreferrer" style={{ justifySelf: 'start' }}>
            <span className="btn__label">Assistir</span>
          </a>
        )}
      </div>
    </div>
  );
}
