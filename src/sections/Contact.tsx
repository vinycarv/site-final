import { useState } from 'react';
import { site } from '../data/content';
import CinemaScene from '../three/CinemaScene';
import MagneticButton from '../components/MagneticButton';
import MotionText from '../components/MotionText';
import { useEnvironment } from '../hooks/useEnvironment';

const YEAR = new Date().getFullYear();

// Copia o e-mail. Usa a API do navegador e, se ela não existir, cai num campo temporário.
async function copyText(text: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* segue para o fallback */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

function CopyEmail() {
  const [label, setLabel] = useState('Copiar e-mail');
  const onCopy = async () => {
    const ok = await copyText(site.email);
    setLabel(ok ? 'Copiado ✓' : site.email);
    setTimeout(() => setLabel('Copiar e-mail'), 2200);
  };
  return (
    <button type="button" className="copy" onClick={onCopy} data-cursor="link" aria-label={`Copiar e-mail ${site.email}`}>
      <small>E-mail</small>
      <span>{label === 'Copiar e-mail' ? site.email : label}</span>
    </button>
  );
}

export default function Contact() {
  const env = useEnvironment();
  const showScene = env.webgl && !env.reduced;
  return (
    <>
      <section id="contato" className="contact" aria-label="Contato">
        {showScene && (
          <div className="contact__scene" aria-hidden="true">
            <CinemaScene variant="contact" />
          </div>
        )}
        <MotionText as="h2" className="display contact__title" mode="words">
          Vamos fazer seu próximo <em>corte</em>.
        </MotionText>
        <div className="contact__row">
          <MagneticButton variant="wa" href={site.whatsapp} external data-cursor="link">
            Chamar no WhatsApp
          </MagneticButton>
          <MagneticButton href={site.instagram} external data-cursor="link">
            Instagram {site.instagramHandle}
          </MagneticButton>
          <CopyEmail />
        </div>
        <span className="mono contact__number">WhatsApp {site.whatsappLabel}</span>
      </section>

      <footer className="footer">
        <span className="mono">© {YEAR} {site.name}</span>
        <span className="mono">{site.role}</span>
        <a href="#top" data-cursor="link">Voltar ao topo ↑</a>
      </footer>
    </>
  );
}
