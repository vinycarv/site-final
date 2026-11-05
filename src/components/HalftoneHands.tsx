import { useEffect, useRef } from 'react';

// Duas mãos robóticas desenhadas em código e renderizadas como meio-tom (pontos), em WebGL.
// Cada ponto ganha tamanho conforme o brilho do desenho de origem. O cursor funciona como
// lente (aumenta e acende os pontos) e o clique solta uma onda a partir de onde foi tocado.
//
// mode="hero": as mãos se aproximam do logo, mas nunca se tocam (o laço fica aberto).
// mode="touch": no fim da página, as pontas dos dedos se encontram e acendem a tela.

type Mode = 'hero' | 'touch';
type Props = { mode?: Mode; className?: string; onTouch?: () => void };

type Seg = [number, number, number, number, number, number]; // x1 y1 x2 y2 raio brilho

// Mão apontando para +x. A ponta do indicador fica em TIP.
const TIP: [number, number] = [272, -58];
const FAR: Seg[] = [
  // dedos ao fundo (mais escuros): anelar e mínimo dobrados
  [40, 22, 84, 26, 19, 0.5], [90, 33, 88, 64, 17, 0.45], [82, 72, 58, 72, 15, 0.4],
  [28, 52, 62, 58, 15, 0.42], [68, 64, 66, 86, 14, 0.38],
];
const NEAR: Seg[] = [
  // médio dobrado
  [45, -12, 96, -8, 20, 0.7], [102, 0, 102, 38, 18, 0.62], [96, 48, 68, 50, 16, 0.55],
  // indicador estendido, em três falanges
  [52, -50, 132, -55, 21, 1], [142, -56, 202, -58, 19, 1], [212, -58, 256, -58, 16, 1],
  // polegar
  [-72, -52, -14, -92, 24, 0.85], [-2, -98, 42, -100, 19, 0.9],
];
const JOINTS: [number, number, number][] = [
  [137, -55, 12], [207, -57, 11], [-8, -95, 13], [99, -4, 12], [-140, 0, 40],
];

function capsule(g: CanvasRenderingContext2D, s: Seg, k = 1) {
  const [x1, y1, x2, y2, r, lum] = s;
  const len = Math.hypot(x2 - x1, y2 - y1);
  g.save();
  g.translate(x1, y1);
  g.rotate(Math.atan2(y2 - y1, x2 - x1));
  const grad = g.createLinearGradient(0, -r, 0, r);
  const v = (x: number) => `rgb(${Math.round(255 * x * k)},${Math.round(255 * x * k)},${Math.round(255 * x * k)})`;
  grad.addColorStop(0, v(lum * 0.6));
  grad.addColorStop(0.25, v(lum));
  grad.addColorStop(0.55, v(lum * 0.7));
  grad.addColorStop(0.82, v(lum * 0.3));
  grad.addColorStop(1, v(lum * 0.75)); // contraluz na borda: separa a silhueta do fundo
  g.fillStyle = grad;
  g.beginPath();
  g.roundRect(-r, -r, len + 2 * r, 2 * r, r);
  g.fill();
  // brilho especular fino, dá a cara de metal
  g.fillStyle = v(Math.min(1, lum * 1.15));
  g.fillRect(0, -r * 0.55, len, Math.max(1.5, r * 0.12));
  g.restore();
}

function drawHand(g: CanvasRenderingContext2D) {
  // antebraço: cilindro com faixas de encaixe
  capsule(g, [-760, 4, -170, 0, 64, 0.62]);
  g.fillStyle = 'rgb(10,10,10)';
  for (const x of [-560, -420, -290]) g.fillRect(x, -70, 7, 140);
  g.fillStyle = 'rgb(200,200,200)';
  g.fillRect(-700, 20, 480, 5); // pistão
  FAR.forEach((s) => capsule(g, s));
  // palma
  const pg = g.createLinearGradient(0, -78, 0, 78);
  pg.addColorStop(0, 'rgb(150,150,150)');
  pg.addColorStop(0.3, 'rgb(215,215,215)');
  pg.addColorStop(1, 'rgb(60,60,60)');
  g.fillStyle = pg;
  g.beginPath();
  g.roundRect(-130, -76, 180, 150, 34);
  g.fill();
  g.fillStyle = 'rgb(20,20,20)';
  g.fillRect(-60, -70, 4, 138);
  // articulação do pulso
  NEAR.forEach((s) => capsule(g, s));
  for (const [x, y, r] of JOINTS) {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2);
    g.fillStyle = 'rgb(30,30,30)'; g.fill();
    g.beginPath(); g.arc(x, y, r * 0.55, 0, Math.PI * 2);
    g.fillStyle = 'rgb(235,235,235)'; g.fill();
  }
}

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }`;
const FRAG = `precision mediump float;
uniform sampler2D uTex; uniform vec2 uRes; uniform vec2 uGrid; uniform float uCell;
uniform vec2 uMouse; uniform float uTime; uniform vec3 uRip; uniform float uFlash;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main(){
  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 cell = floor(p / uCell);
  vec2 c = (cell + 0.5) * uCell;
  vec2 dm = c - uMouse; float md = length(dm);
  float infl = smoothstep(uCell * 20.0, 0.0, md);
  vec2 suv = (cell + 0.5 - (dm / (md + 0.001)) * infl * 2.6) / uGrid;
  float l = texture2D(uTex, suv).r;
  l += infl * 0.16 * (0.35 + l);
  float rd = length(c - uRip.xy);
  float age = uRip.z;
  float ring = exp(-pow((rd - age * 1400.0) / 60.0, 2.0)) * max(0.0, 1.0 - age);
  l += ring * 0.55 + uFlash * 0.35;
  float tw = hash(cell);
  l *= 0.88 + 0.12 * sin(uTime * 1.4 + tw * 40.0);
  float r = sqrt(clamp(l, 0.0, 1.2)) * uCell * 0.62;
  float d = length(p - c);
  float a = 1.0 - smoothstep(r - 0.9, r + 0.4, d);
  vec3 col = mix(vec3(0.55), vec3(1.0), clamp(l * 1.1, 0.0, 1.0));
  gl_FragColor = vec4(col * a, a);
}`;

export default function HalftoneHands({ mode = 'hero', className = '', onTouch }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const touchCb = useRef(onTouch);
  touchCb.current = onTouch;

  useEffect(() => {
    const el = canvas.current!;
    const host = wrap.current!;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const src = document.createElement('canvas');
    const g = src.getContext('2d', { willReadFrequently: false })!;
    const noise = document.createElement('canvas');

    const gl = el.getContext('webgl', { premultipliedAlpha: true, antialias: false, alpha: true });

    let W = 0, H = 0, dpr = 1, cellCss = 7, cols = 0, rows = 0;
    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999, px: 0, py: 0 };
    const rip = { x: 0, y: 0, t0: -10 };
    let visible = true, raf = 0, start = performance.now(), touched = false, flash = 0;

    // ---------- WebGL ----------
    let prog: WebGLProgram | null = null, tex: WebGLTexture | null = null;
    const U: Record<string, WebGLUniformLocation | null> = {};
    if (gl) {
      const sh = (type: number, code: string) => {
        const s = gl.createShader(type)!; gl.shaderSource(s, code); gl.compileShader(s); return s;
      };
      prog = gl.createProgram()!;
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      gl.useProgram(prog);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, 'p');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      ['uTex', 'uRes', 'uGrid', 'uCell', 'uMouse', 'uTime', 'uRip', 'uFlash'].forEach((n) => (U[n] = gl.getUniformLocation(prog!, n)));
      gl.clearColor(0, 0, 0, 0);
    }

    const resize = () => {
      const r = host.getBoundingClientRect();
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      dpr = Math.min(devicePixelRatio || 1, 1.75);
      cellCss = W < 760 ? 5.5 : 7;
      el.width = Math.round(W * dpr); el.height = Math.round(H * dpr);
      cols = Math.ceil(W / cellCss); rows = Math.ceil(H / cellCss);
      src.width = cols; src.height = rows;
      noise.width = cols; noise.height = rows;
      // campo de fundo: pontos finos e irregulares, como uma película granulada
      const n = noise.getContext('2d')!;
      const img = n.createImageData(cols, rows);
      for (let i = 0; i < cols * rows; i++) {
        const x = i % cols, y = (i / cols) | 0;
        const blob = 0.5 + 0.5 * Math.sin(x * 0.07 + Math.sin(y * 0.05) * 2) * Math.cos(y * 0.06 - x * 0.02);
        const v = (0.03 + Math.random() * 0.1 * blob + (Math.random() < 0.012 ? 0.25 : 0)) * 255;
        img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v; img.data[i * 4 + 3] = 255;
      }
      n.putImageData(img, 0, 0);
      if (gl) gl.viewport(0, 0, el.width, el.height);
    };

    const progress = () => {
      const r = host.getBoundingClientRect();
      if (mode === 'hero') return Math.min(1, Math.max(0, -r.top / Math.max(1, r.height)));
      return Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight * 0.95)));
    };

    const paint = (now: number) => {
      const t = (now - start) / 1000;
      const p = progress();
      const intro = reduced ? 1 : Math.min(1, t / 2.6);
      const ease = 1 - Math.pow(1 - intro, 3);
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.drawImage(noise, 0, 0);
      g.setTransform(1 / cellCss, 0, 0, 1 / cellCss, 0, 0);

      const portrait = W / H < 0.85;
      const cx = W / 2, cy = H * (mode === 'hero' ? (portrait ? 0.3 : 0.44) : (portrait ? 0.3 : 0.42));
      const ang = (portrait ? 38 : 24) * (Math.PI / 180);
      const tile = mode === 'hero' ? Math.min(W, H) * (portrait ? 0.15 : 0.085) : 0;
      let gap: number;
      if (mode === 'hero') gap = tile + 26 + (1 - ease) * 220 + p * -10;
      else gap = 3 + Math.pow(1 - p, 1.4) * Math.min(W, 900) * 0.42;
      const breathe = reduced ? 0 : Math.sin(t * 1.1) * (mode === 'hero' ? 7 : 4 * (1 - p));
      const s = Math.min(W * (portrait ? 0.95 : 0.72), H * 1.25) / 780;

      // halo de luz no centro (onde fica o logo / onde os dedos se encontram)
      const glowR = (mode === 'hero' ? tile * 3.2 : 90 + p * 150 + flash * 120) + Math.sin(t * 2) * 6;
      const hg = g.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      const gv = mode === 'hero' ? 0.6 : 0.12 + p * 0.38 + flash * 0.4;
      hg.addColorStop(0, `rgba(255,255,255,${gv})`);
      hg.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = hg;
      g.fillRect(cx - glowR, cy - glowR, glowR * 2, glowR * 2);

      mouse.px += ((mouse.tx > -999 ? (mouse.tx / W - 0.5) : 0) - mouse.px) * 0.05;
      mouse.py += ((mouse.ty > -999 ? (mouse.ty / H - 0.5) : 0) - mouse.py) * 0.05;

      for (const side of [-1, 1]) {
        // side -1: mão de baixo/esquerda; side 1: mão de cima/direita
        const dirx = Math.cos(ang) * side, diry = -Math.sin(ang) * side;
        const d = gap + breathe;
        const tx = cx + dirx * d + mouse.px * -14 * side;
        const ty = cy + diry * d + mouse.py * -10 * side;
        const rot = Math.atan2(-diry, -dirx) + (reduced ? 0 : Math.sin(t * 0.7 + side) * 0.02);
        g.save();
        g.translate(tx, ty);
        g.rotate(rot);
        g.scale(s, side === 1 ? -s : s);
        g.translate(-TIP[0], -TIP[1]);
        drawHand(g);
        g.restore();
      }

      if (mode === 'touch' && p > 0.97 && !touched) {
        touched = true; flash = 1;
        rip.x = cx * dpr; rip.y = cy * dpr; rip.t0 = now;
        touchCb.current?.();
      }
      if (mode === 'touch' && p < 0.85) touched = false;
      flash *= 0.96;

      mouse.x += (mouse.tx - mouse.x) * 0.2;
      mouse.y += (mouse.ty - mouse.y) * 0.2;

      if (gl && prog) {
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
        gl.uniform1i(U.uTex, 0);
        gl.uniform2f(U.uRes, el.width, el.height);
        gl.uniform2f(U.uGrid, cols, rows);
        gl.uniform1f(U.uCell, cellCss * dpr);
        gl.uniform2f(U.uMouse, mouse.x * dpr, mouse.y * dpr);
        gl.uniform1f(U.uTime, reduced ? 0 : t);
        gl.uniform3f(U.uRip, rip.x, rip.y, (now - rip.t0) / 1400);
        gl.uniform1f(U.uFlash, flash);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      } else {
        // sem WebGL: desenha os pontos em 2D (mais simples, sem lente)
        const c2 = el.getContext('2d');
        if (!c2) return;
        const data = g.getImageData(0, 0, cols, rows).data;
        c2.setTransform(dpr, 0, 0, dpr, 0, 0);
        c2.clearRect(0, 0, W, H);
        c2.fillStyle = '#fff';
        for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
          const l = data[(y * cols + x) * 4] / 255;
          const r = Math.sqrt(l) * cellCss * 0.6;
          if (r < 0.35) continue;
          c2.beginPath(); c2.arc((x + 0.5) * cellCss, (y + 0.5) * cellCss, r, 0, 6.283); c2.fill();
        }
      }
    };

    const loop = (now: number) => {
      if (visible && !document.hidden) paint(now);
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      mouse.tx = e.clientX - r.left; mouse.ty = e.clientY - r.top;
      if (mouse.x < -999) { mouse.x = mouse.tx; mouse.y = mouse.ty; }
    };
    const onLeave = () => { mouse.tx = -9999; mouse.ty = -9999; };
    const onDown = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      if (e.clientY < r.top || e.clientY > r.bottom) return;
      rip.x = (e.clientX - r.left) * dpr; rip.y = (e.clientY - r.top) * dpr; rip.t0 = performance.now();
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    const io = new IntersectionObserver(([en]) => (visible = en.isIntersecting), { threshold: 0 });
    io.observe(host);
    addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    addEventListener('pointerdown', onDown, { passive: true });
    if (reduced) {
      start = performance.now() - 5000;
      const still = () => paint(performance.now());
      still();
      addEventListener('scroll', still, { passive: true });
      return () => { ro.disconnect(); io.disconnect(); removeEventListener('scroll', still); removeEventListener('pointermove', onMove); removeEventListener('pointerdown', onDown); document.removeEventListener('pointerleave', onLeave); };
    }
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect(); io.disconnect();
      removeEventListener('pointermove', onMove);
      removeEventListener('pointerdown', onDown);
      document.removeEventListener('pointerleave', onLeave);
      if (gl) gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [mode]);

  return (
    <div ref={wrap} className={`halftone ${className}`} aria-hidden="true">
      <canvas ref={canvas} />
    </div>
  );
}
