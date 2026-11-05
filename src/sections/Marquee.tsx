import { services } from '../data/content';

// Faixa de serviços correndo em loop. Duas cópias garantem a emenda sem salto.
export default function Marquee() {
  const row = (hidden: boolean) => (
    <ul className="marquee__row" aria-hidden={hidden || undefined}>
      {services.map((s) => (
        <li key={s}>
          <span className="marquee__word">{s}</span>
          <svg className="marquee__star" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 0l2.2 7.8L20 10l-7.8 2.2L10 20l-2.2-7.8L0 10l7.8-2.2z" fill="currentColor" /></svg>
        </li>
      ))}
    </ul>
  );
  return (
    <section id="servicos" className="marquee" aria-label="Serviços">
      <h2 className="sr-only">Serviços</h2>
      <div className="marquee__track">
        {row(false)}
        {row(true)}
      </div>
    </section>
  );
}
