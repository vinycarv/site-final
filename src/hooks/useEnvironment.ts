import { useEffect, useState } from 'react';

// Detecta preferências do sistema e capacidades do aparelho.
export function useEnvironment() {
  const query = (q: string) => (typeof window !== 'undefined' ? window.matchMedia(q).matches : false);
  const [env, setEnv] = useState(() => ({
    reduced: query('(prefers-reduced-motion: reduce)'),
    fine: query('(pointer: fine)'),
    mobile: query('(max-width: 760px)'),
    webgl: hasWebGL(),
  }));

  useEffect(() => {
    const mqs = [
      window.matchMedia('(prefers-reduced-motion: reduce)'),
      window.matchMedia('(pointer: fine)'),
      window.matchMedia('(max-width: 760px)'),
    ];
    const update = () =>
      setEnv((e) => ({
        ...e,
        reduced: mqs[0].matches,
        fine: mqs[1].matches,
        mobile: mqs[2].matches,
      }));
    mqs.forEach((m) => m.addEventListener('change', update));
    return () => mqs.forEach((m) => m.removeEventListener('change', update));
  }, []);

  return env;
}

export function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}
