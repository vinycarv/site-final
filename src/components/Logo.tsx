import { MARK_PATH, MARK_VIEWBOX, WORD_PATH, WORD_VIEWBOX } from '../data/logo';

// Símbolo e logotipo da VNUP, vetorizados a partir do arquivo original.
export function LogoMark({ className = '', title }: { className?: string; title?: string }) {
  return (
    <svg className={className} viewBox={MARK_VIEWBOX} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <path d={MARK_PATH} fill="currentColor" fillRule="evenodd" />
    </svg>
  );
}

export function LogoWord({ className = '', title }: { className?: string; title?: string }) {
  return (
    <svg className={className} viewBox={WORD_VIEWBOX} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <path d={WORD_PATH} fill="currentColor" fillRule="evenodd" />
    </svg>
  );
}
