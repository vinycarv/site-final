import { steps } from '../data/content';

// Método em quatro cartões de vidro. O texto fica escondido e aparece no hover/foco/toque:
// pouca leitura de cara, e a curiosidade puxa a interação.
export default function Method() {
  return (
    <section className="method" id="metodo" aria-labelledby="method-title">
      <div className="section-head">
        <h2 id="method-title" className="display">Do <span className="serif-em">play</span> ao post</h2>
        <span className="mono">4 etapas. Toque em cada uma.</span>
      </div>
      <ol className="method__grid">
        {steps.map((s, i) => (
          <li key={s.n} className="method__card glass" tabIndex={0}>
            <span className="method__n">{s.n}</span>
            <MethodIcon i={i} />
            <h3 className="method__title">{s.title}</h3>
            <p className="method__text">{s.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function MethodIcon({ i }: { i: number }) {
  // ícones feitos de pontos, na mesma linguagem do meio-tom das mãos
  const shapes = [
    (x: number, y: number) => Math.hypot(x - 4.5, y - 4.5) < 4.2 && Math.hypot(x - 4.5, y - 4.5) > 1.6, // lente
    (x: number, y: number) => (x + y) % 3 === 0 || x === 4, // corte
    (x: number, y: number) => y >= 8 - x * 0.9 && y <= 8, // subida
    (x: number, y: number) => [2, 5, 8].some((c, k) => x >= c - 1 && x <= c && y >= 8 - k * 3), // barras
  ];
  const dots = [];
  for (let y = 0; y < 10; y++) for (let x = 0; x < 10; x++) {
    const on = shapes[i](x, y);
    dots.push(<circle key={`${x}-${y}`} cx={x * 6 + 3} cy={y * 6 + 3} r={on ? 2.2 : 0.7} fill="currentColor" opacity={on ? 1 : 0.25} />);
  }
  return <svg className="method__icon" viewBox="0 0 60 60" aria-hidden="true">{dots}</svg>;
}
