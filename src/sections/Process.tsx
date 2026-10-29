import { useEffect, useRef, useState } from 'react';
import { processSteps } from '../data/content';
import { gsap } from '../lib/gsap';
import { useEnvironment } from '../hooks/useEnvironment';
import MotionText from '../components/MotionText';

// Linha do tempo de edição. No desktop a seção fica fixada e o cursor de tempo
// (cabeçote) percorre a timeline conforme a rolagem; os clipes se encaixam em sequência.
const ROWS = [
  { clips: [{ left: '2%', width: '34%', cls: '' }] },
  { clips: [{ left: '8%', width: '46%', cls: 'clip--2' }, { left: '60%', width: '26%', cls: 'clip--3' }] },
  { clips: [{ left: '0%', width: '62%', cls: '' }] },
  { clips: [{ left: '22%', width: '52%', cls: 'clip--4' }] },
];

export default function Process() {
  const env = useEnvironment();
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const head = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = root.current;
    if (!el || env.reduced) return;
    const mm = gsap.matchMedia();
    mm.add('(min-width: 761px)', () => {
      const t = track.current!;
      const clips = el.querySelectorAll<HTMLElement>('.clip');
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el, start: 'top top', end: '+=160%', pin: true, scrub: 0.6, invalidateOnRefresh: true,
          onUpdate: (self) => setActive(Math.min(processSteps.length - 1, Math.floor(self.progress * processSteps.length))),
        },
      });
      tl.fromTo(head.current, { x: 0 }, { x: () => t.clientWidth - 2, ease: 'none', duration: 1 }, 0)
        .fromTo(clips, { scaleX: 0 }, { scaleX: 1, ease: 'expo.out', stagger: 0.12, duration: 0.5 }, 0);
    });
    return () => mm.revert();
  }, [env.reduced]);

  return (
    <section id="processo" ref={root} className="process" aria-label="Processo criativo" style={{ padding: 0 }}>
      <div className="process__stage" style={{ minHeight: env.mobile ? undefined : '100svh', display: 'grid', alignContent: 'center', gap: 32, padding: 'clamp(96px,12vh,140px) var(--gutter)' }}>
        <div className="section-head process__head">
          <MotionText as="h2" className="display" mode="words">
            Processo criativo
          </MotionText>
          <span className="mono">02 — Da ideia ao corte final</span>
        </div>

        <div className="tl" aria-hidden="true">
          <div className="tl__ruler">
            <span>00:00:00</span><span>00:00:30</span><span>00:01:00</span><span>00:01:30</span><span>00:02:00</span>
          </div>
          <div ref={track} className="tl__track">
            <div ref={head} className="tl__head" />
            {ROWS.map((row, i) => (
              <div key={i} className={`tl__row ${i === 0 ? 'tl__row--v' : ''}`}>
                {row.clips.map((c, j) => (
                  <span key={j} className={`clip ${c.cls}`} style={{ left: c.left, width: c.width }} />
                ))}
              </div>
            ))}
          </div>
        </div>

        <ol className="steps" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {processSteps.map((s, i) => {
            const on = env.mobile || env.reduced || i === active;
            return (
              <li key={s.id} className={`step ${on ? 'is-active' : ''}`}>
                <span className="step__code">{s.code}</span>
                <h3 className="step__title">{s.title}</h3>
                <p className="step__text">{s.text}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
