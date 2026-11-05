import { faq } from '../data/content';

// Perguntas frequentes com <details>: acessível e funciona sem JavaScript.
export default function Faq() {
  return (
    <section className="faq" id="faq" aria-labelledby="faq-title">
      <div className="section-head">
        <h2 id="faq-title" className="display">Perguntas <span className="serif-em">rápidas</span></h2>
        <span className="mono">Respostas curtas. Do jeito que a gente trabalha.</span>
      </div>
      <div className="faq__list">
        {faq.map((f) => (
          <details key={f.q} className="faq__item glass">
            <summary>
              <h3>{f.q}</h3>
              <span className="faq__plus" aria-hidden="true" />
            </summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
