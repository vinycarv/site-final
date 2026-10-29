import { useEffect, useRef, useState } from 'react';
import { projects, type Project } from '../data/content';
import { gsap, ScrollTrigger } from '../lib/gsap';
import { useEnvironment } from '../hooks/useEnvironment';
import MotionText from '../components/MotionText';
import ProjectDetail from './ProjectDetail';

// Galeria de trabalhos. No desktop, o trilho horizontal é fixado e anda conforme a rolagem.
// No celular, os cards empilham na vertical (toque e rolagem naturais).
export default function Gallery() {
  const env = useEnvironment();
  const pin = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [origin, setOrigin] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (env.reduced || !pin.current || !track.current) return;
    const mm = gsap.matchMedia();
    mm.add('(min-width: 761px)', () => {
      const el = track.current!;
      const tween = gsap.to(el, {
        x: () => -(el.scrollWidth - innerWidth + 2 * parseFloat(getComputedStyle(el).paddingLeft)),
        ease: 'none',
        scrollTrigger: {
          trigger: pin.current, start: 'top top',
          end: () => '+=' + Math.max(0, el.scrollWidth - innerWidth),
          pin: true, scrub: 0.8, invalidateOnRefresh: true,
        },
      });
      return () => { tween.scrollTrigger?.kill(); tween.kill(); };
    });
    return () => mm.revert();
  }, [env.reduced]);

  useEffect(() => {
    if (env.reduced) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.work').forEach((card) => {
        gsap.fromTo(card, { y: 90, opacity: 0, rotateX: 10 }, {
          y: 0, opacity: 1, rotateX: 0, duration: 1.3, ease: 'expo.out',
          scrollTrigger: { trigger: card, start: 'top 92%', once: true },
        });
      });
    });
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [env.reduced]);

  const open = (p: Project, el: HTMLElement) => {
    setOrigin(el);
    setOpenId(p.id);
  };
  const close = () => setOpenId(null);
  const current = projects.find((p) => p.id === openId) ?? null;

  return (
    <section id="trabalhos" className="gallery" aria-label="Trabalhos">
      <div ref={pin} className="gallery__pin" style={{ position: 'relative', minHeight: env.mobile ? undefined : '100svh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'clamp(88px,11vh,120px) 0' }}>
        <div className="section-head" style={{ paddingInline: 'var(--gutter)' }}>
          <MotionText as="h2" className="display gallery__title" mode="words">
            Trabalhos
          </MotionText>
          <span className="mono">01 — Seleção</span>
        </div>
        <div ref={track} className="gallery__track">
          {projects.map((p) => (
            <WorkCard key={p.id} project={p} onOpen={(el) => open(p, el)} />
          ))}
        </div>
        <span className="mono gallery__hint" aria-hidden="true">Role para avançar →</span>
      </div>

      {current && <ProjectDetail project={current} origin={origin} onClose={close} />}
    </section>
  );
}

function WorkCard({ project: p, onOpen }: { project: Project; onOpen: (el: HTMLElement) => void }) {
  const frame = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const card = useRef<HTMLButtonElement>(null);
  const env = useEnvironment();

  const tilt = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!env.fine || env.reduced || !frame.current) return;
    const r = frame.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    gsap.to(frame.current, { rotateX: (0.5 - py) * 8, rotateY: (px - 0.5) * 10, duration: 0.6, ease: 'power3.out', transformPerspective: 900 });
    frame.current.style.setProperty('--mx', px * 100 + '%');
    frame.current.style.setProperty('--my', py * 100 + '%');
  };
  const reset = () => {
    if (frame.current) gsap.to(frame.current, { rotateX: 0, rotateY: 0, duration: 0.9, ease: 'elastic.out(1, 0.6)' });
    if (video.current) { video.current.pause(); card.current?.classList.remove('is-playing'); }
  };
  const enter = () => {
    if (!video.current || !p.videoUrl || env.reduced) return;
    card.current?.classList.add('is-playing');
    video.current.play().catch(() => undefined);
  };

  return (
    <button
      ref={card}
      className="work"
      data-cursor={p.videoUrl ? 'video' : 'project'}
      onPointerEnter={enter}
      onPointerMove={tilt}
      onPointerLeave={reset}
      onFocus={enter}
      onBlur={reset}
      onClick={(e) => onOpen(e.currentTarget)}
      aria-label={`Abrir projeto ${p.number}: ${p.title}, ${p.category}`}
      type="button"
    >
      <div ref={frame} className="work__frame" style={{ ['--a' as string]: p.tone[0], ['--b' as string]: p.tone[1] }}>
        <div className="work__cover" style={p.thumb ? { backgroundImage: `url(${p.thumb})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined} />
        {p.videoUrl && <video ref={video} className="work__video" src={p.videoUrl} muted playsInline preload="none" loop aria-hidden="true" />}
        <div className="work__glow" aria-hidden="true" />
        <span className="work__num" aria-hidden="true">{p.number}</span>
        <span className="work__tc" aria-hidden="true">{p.format}</span>
      </div>
      <div className="work__meta">
        <h3 className="work__title">{p.title}</h3>
        <span className="work__cat">{p.category} · {p.year}</span>
      </div>
    </button>
  );
}
