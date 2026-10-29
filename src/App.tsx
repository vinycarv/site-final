import { useEffect, useState } from 'react';
import Preloader from './components/Preloader';
import Navigation from './components/Navigation';
import CustomCursor from './components/CustomCursor';
import ScrollProgress from './components/ScrollProgress';
import Hero from './sections/Hero';
import Gallery from './sections/Gallery';
import Process from './sections/Process';
import About from './sections/About';
import Contact from './sections/Contact';
import { ScrollTrigger } from './lib/gsap';

export default function App() {
  const [sceneReady, setSceneReady] = useState(false);
  const [introDone, setIntroDone] = useState(false);

  // Marca a cena como pronta depois da primeira montagem do React (o canvas WebGL monta junto).
  useEffect(() => {
    const t = setTimeout(() => setSceneReady(true), 350);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (introDone) ScrollTrigger.refresh();
  }, [introDone]);

  return (
    <>
      <a className="skip" href="#trabalhos">Pular para os trabalhos</a>
      {!introDone && <Preloader ready={sceneReady} onDone={() => setIntroDone(true)} />}
      <CustomCursor />
      <ScrollProgress />
      <Navigation ready={introDone} />
      <main id="main">
        <Hero ready={introDone} />
        <Gallery />
        <Process />
        <About />
        <Contact />
      </main>
    </>
  );
}
