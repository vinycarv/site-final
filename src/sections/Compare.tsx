import { useRef, useState } from 'react';
import { projects } from '../data/content';

// Antes e depois: a mesma imagem, crua de um lado e tratada do outro. Arraste para comparar.
// Funciona com mouse, toque e teclado (setas), porque o controle é um input range.
export default function Compare() {
  const [v, setV] = useState(50);
  const box = useRef<HTMLDivElement>(null);
  const shot = projects.find((p) => p.thumb)?.thumb ?? '';

  const drag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons !== 1 && e.pointerType === 'mouse') return;
    const r = box.current!.getBoundingClientRect();
    setV(Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)));
  };

  return (
    <section className="compare" id="antes-depois" aria-labelledby="compare-title">
      <div className="section-head">
        <h2 id="compare-title" className="display">Bruto <span className="serif-em">vs.</span> VNUP</h2>
        <span className="mono">Arraste. A diferença aparece na hora.</span>
      </div>
      <div
        ref={box}
        className="compare__box"
        style={{ ['--v' as string]: `${v}%` }}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); drag(e); }}
        onPointerMove={drag}
        data-cursor="gallery"
      >
        <img className="compare__img compare__img--raw" src={shot} alt="Quadro de vídeo sem tratamento: cores lavadas e sem contraste" width={480} height={360} loading="lazy" decoding="async" />
        <img className="compare__img compare__img--pro" src={shot} alt="O mesmo quadro depois da edição e do tratamento de cor da VNUP" width={480} height={360} loading="lazy" decoding="async" />
        <span className="compare__tag compare__tag--l glass">Bruto</span>
        <span className="compare__tag compare__tag--r glass">VNUP</span>
        <span className="compare__handle glass" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18"><path d="M9 6l-6 6 6 6M15 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
        <input
          className="compare__range"
          type="range" min={0} max={100} value={v}
          onChange={(e) => setV(Number(e.target.value))}
          aria-label="Comparar antes e depois do tratamento"
        />
      </div>
    </section>
  );
}
