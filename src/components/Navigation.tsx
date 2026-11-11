import { useEffect, useState } from 'react';
import { site } from '../data/content';
import MagneticButton from './MagneticButton';
import { LogoMark } from './Logo';

const links = [
  { id: 'trabalhos', label: 'Trabalhos' },
  { id: 'antes-depois', label: 'Antes/Depois' },
  { id: 'metodo', label: 'Método' },
  { id: 'faq', label: 'FAQ' },
];

// Menu fixo: fica transparente no topo e ganha fundo translúcido ao rolar.
// Marca a seção ativa com IntersectionObserver. No celular vira uma camada em tela cheia.
export default function Navigation({ ready }: { ready: boolean }) {
  const [solid, setSolid] = useState(false);
  const [active, setActive] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(scrollY > 40);
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    return () => removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => en.isIntersecting && setActive(en.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    );
    links.forEach((l) => {
      const el = document.getElementById(l.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  // Fecha o menu com Escape e devolve o foco ao botão.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <header className={`nav ${solid ? 'is-solid' : ''}`} style={{ opacity: ready ? 1 : 0, transition: 'opacity .8s .2s, background .5s, border-color .5s' }}>
        <a className="nav__brand" href="#top" data-cursor="link" aria-label="NVUP, início">
          <LogoMark className="nav__mark" />
          <span>NVUP</span>
        </a>
        <nav aria-label="Principal" className="nav__pill glass">
          <ul className="nav__links">
            {links.map((l) => (
              <li key={l.id}>
                <a className={`nav__link ${active === l.id ? 'is-active' : ''}`} href={`#${l.id}`} aria-current={active === l.id ? 'true' : undefined}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <MagneticButton variant="glass" href="#contato" className="nav__cta">Entrar em contato</MagneticButton>
        <button className="nav__burger glass" aria-expanded={open} aria-controls="menu" aria-label={open ? 'Fechar menu' : 'Abrir menu'} onClick={() => setOpen((o) => !o)}>
          <span />
        </button>
      </header>

      <div id="menu" className={`menu ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <ul>
          {links.map((l) => (
            <li key={l.id}>
              <a href={`#${l.id}`} tabIndex={open ? 0 : -1} onClick={() => setOpen(false)}>{l.label}</a>
            </li>
          ))}
          <li><a href="#contato" tabIndex={open ? 0 : -1} onClick={() => setOpen(false)}>Contato</a></li>
          <li>
            <MagneticButton variant="wa" external href={site.whatsapp} tabIndex={open ? 0 : -1} style={{ marginTop: 20 }}>
              Chamar no WhatsApp
            </MagneticButton>
          </li>
        </ul>
      </div>
    </>
  );
}
