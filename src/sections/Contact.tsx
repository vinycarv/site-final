import { useState } from 'react';
import HalftoneHands from '../components/HalftoneHands';
import MagneticButton from '../components/MagneticButton';
import { LogoMark, LogoWord } from '../components/Logo';
import { site } from '../data/content';

// Fechamento: aqui as mãos finalmente se tocam, e o convite aparece.
export default function Contact() {
  const [touched, setTouched] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      location.href = `mailto:${site.email}`;
    }
  };

  return (
    <>
      <section className={`contact ${touched ? 'is-touched' : ''}`} id="contato" aria-labelledby="contact-title">
        <HalftoneHands mode="touch" className="contact__canvas" onTouch={() => setTouched(true)} />
        <div className="contact__content">
          <span className="contact__kicker glass">{touched ? 'Pronto. Elas se tocaram.' : 'Quase lá…'}</span>
          <h2 id="contact-title" className="display contact__title">
            Agora falta <span className="glass-text">você</span>.
          </h2>
          <p className="contact__note">Atendemos poucas marcas por vez, para manter o padrão. Garanta a sua vaga.</p>
          <div className="contact__row">
            <MagneticButton variant="light" external href={site.whatsapp} arrow>Chamar no WhatsApp</MagneticButton>
            <button type="button" className="btn btn--glass glass" onClick={copy} data-cursor="link">
              <span className="btn__label">{copied ? 'E-mail copiado ✓' : 'Copiar e-mail'}</span>
            </button>
          </div>
        </div>
      </section>
      <footer className="footer">
        <a href="#top" className="footer__brand" aria-label="NVUP, voltar ao topo">
          <LogoMark className="footer__mark" />
          <LogoWord className="footer__word" />
        </a>
        <nav aria-label="Rodapé" className="footer__links">
          <a href="#trabalhos">Trabalhos</a>
          <a href="#metodo">Método</a>
          <a href="#faq">FAQ</a>
          <a href={site.instagram} target="_blank" rel="noopener noreferrer">Instagram {site.instagramHandle}</a>
          <a href={`mailto:${site.email}`}>{site.email}</a>
        </nav>
        <span className="footer__copy">© {new Date().getFullYear()} NVUP · Agência & Produtora</span>
      </footer>
    </>
  );
}
