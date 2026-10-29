import { useRef, type ReactNode, type AnchorHTMLAttributes } from 'react';
import { gsap } from '../lib/gsap';
import { useEnvironment } from '../hooks/useEnvironment';

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode; variant?: 'primary' | 'ghost' | 'wa'; external?: boolean };

// Botão que acompanha o cursor de leve, com limite de deslocamento, e volta com mola ao sair.
export default function MagneticButton({ children, variant = 'ghost', external, className = '', ...rest }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  const env = useEnvironment();

  const move = (e: React.PointerEvent<HTMLAnchorElement>) => {
    if (!env.fine || env.reduced || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) * 0.25;
    const dy = (e.clientY - (r.top + r.height / 2)) * 0.35;
    gsap.to(ref.current, { x: Math.max(-12, Math.min(12, dx)), y: Math.max(-10, Math.min(10, dy)), duration: 0.4, ease: 'power3.out' });
  };
  const leave = () => {
    if (ref.current) gsap.to(ref.current, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.45)' });
  };

  return (
    <a
      ref={ref}
      className={`btn btn--${variant} ${className}`}
      onPointerMove={move}
      onPointerLeave={leave}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      {...rest}
    >
      <span className="btn__fill" aria-hidden="true" />
      <span className="btn__label">{children}</span>
    </a>
  );
}
