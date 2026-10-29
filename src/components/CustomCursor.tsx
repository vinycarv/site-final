import { useEffect, useRef, useState } from 'react';
import { useEnvironment } from '../hooks/useEnvironment';

type Mode = 'default' | 'link' | 'project' | 'video' | 'gallery';

// Cursor com ponto e anel. O anel segue com inércia; o modo muda conforme o alvo.
// Só existe em telas com mouse fino. Em touch, o cursor nativo continua.
export default function CustomCursor() {
  const env = useEnvironment();
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const [mode, setMode] = useState<Mode>('default');
  const enabled = env.fine && !env.reduced;

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add('has-cursor');
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, raf = 0;

    const onMove = (e: PointerEvent) => {
      mx = e.clientX; my = e.clientY;
      if (dot.current) dot.current.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
    };
    const loop = () => {
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      if (label.current) label.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };
    const onOver = (e: PointerEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>('[data-cursor]');
      const kind = (el?.dataset.cursor as Mode | undefined) ?? (
        (e.target as HTMLElement).closest('a, button') ? 'link' : 'default'
      );
      setMode(kind);
    };
    addEventListener('pointermove', onMove, { passive: true });
    addEventListener('pointerover', onOver, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('pointermove', onMove);
      removeEventListener('pointerover', onOver);
      document.documentElement.classList.remove('has-cursor');
    };
  }, [enabled]);

  if (!enabled) return null;
  const labels: Partial<Record<Mode, string>> = { project: 'VER', video: 'PLAY', gallery: 'ARRASTAR' };

  return (
    <>
      <div ref={dot} className="cursor-dot" aria-hidden="true" />
      <div ref={ring} className={`cursor-ring cursor-ring--${mode}`} aria-hidden="true" />
      <span ref={label} className={`cursor-label ${labels[mode] ? 'is-on' : ''}`} aria-hidden="true">
        {labels[mode] ?? ''}
      </span>
    </>
  );
}
