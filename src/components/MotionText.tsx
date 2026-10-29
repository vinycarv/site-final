import { useLayoutEffect, useRef, type ElementType, type ReactNode } from 'react';
import { gsap } from '../lib/gsap';
import { useEnvironment } from '../hooks/useEnvironment';

type Props = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  // 'lines' sobe cada linha de dentro de uma máscara; 'words' revela palavra por palavra;
  // 'chars' gira cada letra em perspectiva.
  mode?: 'lines' | 'words' | 'chars';
  delay?: number;
  start?: string;
};

// Texto que anima com máscara. Mantém o texto acessível: o conteúdo completo fica no
// atributo aria-label, e os fragmentos visuais ficam escondidos para leitores de tela.
export default function MotionText({ as: Tag = 'h2', children, className = '', mode = 'words', delay = 0, start = 'top 85%' }: Props) {
  const ref = useRef<HTMLElement>(null);
  const env = useEnvironment();
  const text = typeof children === 'string' ? children : '';

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !text || env.reduced) return;
    const pieces = el.querySelectorAll<HTMLElement>('.mt-inner');
    const ctx = gsap.context(() => {
      gsap.fromTo(pieces,
        mode === 'chars' ? { yPercent: 0, rotateX: -85, opacity: 0, transformOrigin: '50% 100%' } : { yPercent: 110, opacity: 0.2 },
        {
          yPercent: 0, rotateX: 0, opacity: 1,
          duration: mode === 'chars' ? 1.1 : 1.3,
          ease: mode === 'chars' ? 'expo.out' : 'power4.out',
          stagger: mode === 'chars' ? { each: 0.02, from: 'start' } : { each: 0.09, from: 'start' },
          delay,
          scrollTrigger: { trigger: el, start, once: true },
        });
    }, el);
    return () => ctx.revert();
  }, [text, mode, delay, start, env.reduced]);

  const unit = (s: string, i: number, kind: 'w' | 'c') => (
    <span className={`mt-mask ${kind === 'c' ? 'mt-mask--c' : ''}`} key={`${kind}${i}`} aria-hidden="true">
      <span className="mt-inner">{s}</span>
    </span>
  );

  if (!text || env.reduced) {
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <Tag ref={ref} className={`motion-text ${className}`} aria-label={text}>
      {mode === 'chars'
        ? text.split('').map((c, i) => (c === ' ' ? ' ' : unit(c, i, 'c')))
        : text.split(' ').map((w, i, arr) => (
            <span key={i}>
              {unit(w, i, 'w')}
              {i < arr.length - 1 ? ' ' : ''}
            </span>
          ))}
    </Tag>
  );
}

