import { useEffect, useRef, useState } from 'react';

// Pergunta aberta + resposta escondida. Segurar o botão por 1,2 s revela (ou Enter/Espaço).
export default function Secret() {
  const [pct, setPct] = useState(0);
  const [open, setOpen] = useState(false);
  const raf = useRef(0);
  const t0 = useRef(0);

  const stop = () => {
    cancelAnimationFrame(raf.current);
    if (!open) setPct(0);
  };
  const hold = () => {
    if (open) return;
    t0.current = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0.current) / 1200);
      setPct(p);
      if (p >= 1) { setOpen(true); return; }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  return (
    <section className="secret" id="segredo" aria-labelledby="secret-title">
      <h2 id="secret-title" className="display secret__q">
        O que faz alguém <span className="glass-text">parar</span> de rolar o feed?
      </h2>
      <button
        type="button"
        className={`secret__btn glass ${open ? 'is-open' : ''}`}
        style={{ ['--p' as string]: pct }}
        onPointerDown={hold}
        onPointerUp={stop}
        onPointerLeave={stop}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(true); setPct(1); } }}
        aria-expanded={open}
        aria-controls="secret-answer"
        data-cursor="link"
      >
        <span className="secret__ring" aria-hidden="true" />
        {open ? 'Revelado' : 'Segure para revelar'}
      </button>
      <p id="secret-answer" className={`secret__a ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        Os 3 primeiros segundos. <span className="serif-em">É neles que a gente mais trabalha.</span>
      </p>
    </section>
  );
}
