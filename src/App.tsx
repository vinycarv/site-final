import { useEffect, useState } from 'react';
import Preloader from './components/Preloader';
import Navigation from './components/Navigation';
import CustomCursor from './components/CustomCursor';
import ScrollProgress from './components/ScrollProgress';
import GlassDefs from './components/GlassDefs';
import Hero from './sections/Hero';
import Marquee from './sections/Marquee';
import Gallery from './sections/Gallery';
import Compare from './sections/Compare';
import Method from './sections/Method';
import Numbers from './sections/Numbers';
import Secret from './sections/Secret';
import Faq from './sections/Faq';
import Contact from './sections/Contact';
import { ScrollTrigger } from './lib/gsap';

export default function App() {
  const [sceneReady, setSceneReady] = useState(false);
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSceneReady(true), 250);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (introDone) ScrollTrigger.refresh();
  }, [introDone]);

  return (
    <>
      <a className="skip" href="#trabalhos">Pular para os trabalhos</a>
      <GlassDefs />
      {!introDone && <Preloader ready={sceneReady} onDone={() => setIntroDone(true)} />}
      <CustomCursor />
      <ScrollProgress />
      <Navigation ready={introDone} />
      <main id="main">
        <Hero ready={introDone} />
        <Marquee />
        <Gallery />
        <Compare />
        <Method />
        <Numbers />
        <Secret />
        <Faq />
        <Contact />
      </main>
    </>
  );
}
