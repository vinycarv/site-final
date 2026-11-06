import { useEffect, useRef } from 'react';

// Duas mãos robóticas desenhadas em código e renderizadas como meio-tom (pontos), em WebGL.
// Cada ponto ganha tamanho conforme o brilho do desenho de origem. O cursor funciona como
// lente (aumenta e acende os pontos) e o clique solta uma onda a partir de onde foi tocado.
//
// mode="hero": as mãos se aproximam do logo, mas nunca se tocam (o laço fica aberto).
// mode="touch": no fim da página, as pontas dos dedos se encontram e acendem a tela.

type Mode = 'hero' | 'touch';
type Props = { mode?: Mode; className?: string; onTouch?: () => void };

// ---------------------------------------------------------------------------
// Mão robótica estilo Ultron, desenhada em escala de cinza (o brilho vira o tamanho do ponto).
// Mão apontando para +x; a ponta do indicador fica em TIP. Ângulos em graus, + curva para +y.
// Proporções humanas: dedos finos, três falanges, polegar separado, palma com placas.
// ---------------------------------------------------------------------------
const TIP: [number, number] = [150, -58];
const TAU = Math.PI * 2;

const L = (x: number, a = 1) => {
  const v = Math.max(0, Math.min(255, Math.round(255 * x)));
  return `rgba(${v},${v},${v},${a})`;
};

// Placa cônica de metal: gradiente cilíndrico, brilho especular, fresta de painel e parafuso.
function plate(g: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, r1: number, r2: number, lum: number, detail = true) {
  const len = Math.hypot(x2 - x1, y2 - y1);
  const R = Math.max(r1, r2);
  const c = Math.min(r1, r2) * 0.45;
  g.save();
  g.translate(x1, y1);
  g.rotate(Math.atan2(y2 - y1, x2 - x1));
  const gr = g.createLinearGradient(0, -R, 0, R);
  gr.addColorStop(0, L(lum * 0.4));
  gr.addColorStop(0.16, L(lum));
  gr.addColorStop(0.4, L(lum * 0.88));
  gr.addColorStop(0.72, L(lum * 0.38));
  gr.addColorStop(0.9, L(lum * 0.12));
  gr.addColorStop(1, L(lum * 0.55)); // luz de borda embaixo: separa a silhueta do fundo
  g.fillStyle = gr;
  g.beginPath();
  g.moveTo(c, -r1);
  g.lineTo(len - c, -r2);
  g.quadraticCurveTo(len, -r2, len, -r2 + c);
  g.lineTo(len, r2 - c);
  g.quadraticCurveTo(len, r2, len - c, r2);
  g.lineTo(c, r1);
  g.quadraticCurveTo(0, r1, 0, r1 - c);
  g.lineTo(0, -r1 + c);
  g.quadraticCurveTo(0, -r1, c, -r1);
  g.closePath();
  g.fill();
  if (detail) {
    g.lineCap = 'round';
    g.strokeStyle = L(Math.min(1, lum * 1.3));
    g.lineWidth = Math.max(1.6, R * 0.15);
    g.beginPath();
    g.moveTo(len * 0.14, -r1 * 0.5);
    g.lineTo(len * 0.78, -r2 * 0.5);
    g.stroke();
    g.lineCap = 'butt';
    g.strokeStyle = L(0.02);
    g.lineWidth = Math.max(1.8, R * 0.17);
    const px = len * 0.64, pr = r1 + (r2 - r1) * 0.64;
    g.beginPath(); g.moveTo(px, -pr * 0.95); g.lineTo(px, pr * 0.95); g.stroke();
    g.fillStyle = L(1);
    g.beginPath(); g.arc(len * 0.32, r1 * 0.12, Math.max(1.1, R * 0.09), 0, TAU); g.fill();
  }
  g.restore();
}

// Articulação esférica com encaixe escuro, anel e núcleo luminoso.
function joint(g: CanvasRenderingContext2D, x: number, y: number, r: number, glow = 1) {
  g.fillStyle = L(0.03);
  g.beginPath(); g.arc(x, y, r * 1.14, 0, TAU); g.fill();
  const rg = g.createRadialGradient(x - r * 0.3, y - r * 0.38, r * 0.08, x, y, r);
  rg.addColorStop(0, L(1));
  rg.addColorStop(0.45, L(0.6));
  rg.addColorStop(1, L(0.1));
  g.fillStyle = rg;
  g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  g.strokeStyle = L(0.04);
  g.lineWidth = Math.max(1.2, r * 0.16);
  g.beginPath(); g.arc(x, y, r * 0.52, 0, TAU); g.stroke();
  g.fillStyle = L(glow);
  g.beginPath(); g.arc(x, y, r * 0.22, 0, TAU); g.fill();
}

type Finger = { k: [number, number]; len: [number, number, number]; ang: [number, number, number]; r: number; lum: number };

function finger(g: CanvasRenderingContext2D, f: Finger) {
  const pts: [number, number][] = [f.k];
  f.len.forEach((l, i) => {
    const a = (f.ang[i] * Math.PI) / 180;
    const [px, py] = pts[i];
    pts.push([px + Math.cos(a) * l, py + Math.sin(a) * l]);
  });
  const rr = [f.r, f.r * 0.9, f.r * 0.8, f.r * 0.5];
  // cabo (tendão) correndo pelo dorso do dedo
  g.strokeStyle = L(0.9);
  g.lineWidth = 1.6;
  g.beginPath();
  g.moveTo(pts[0][0], pts[0][1] - f.r * 0.1);
  for (let i = 1; i < 4; i++) g.lineTo(pts[i][0], pts[i][1] - rr[i] * 0.15);
  g.stroke();
  for (let i = 0; i < 3; i++) plate(g, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], rr[i], rr[i + 1], f.lum);
  // ponta do dedo: calota e sensor
  const [tx, ty] = pts[3];
  const ta = (f.ang[2] * Math.PI) / 180;
  g.fillStyle = L(f.lum * 0.8);
  g.beginPath(); g.arc(tx, ty, rr[3] * 0.95, 0, TAU); g.fill();
  g.fillStyle = L(1);
  g.beginPath(); g.arc(tx - Math.cos(ta) * rr[3] * 0.2, ty - Math.sin(ta) * rr[3] * 0.2, rr[3] * 0.34, 0, TAU); g.fill();
  joint(g, pts[1][0], pts[1][1], rr[1] * 0.92);
  joint(g, pts[2][0], pts[2][1], rr[2] * 0.9);
}

function collar(g: CanvasRenderingContext2D, x: number, w: number, r: number, lum: number) {
  const gr = g.createLinearGradient(0, -r, 0, r);
  gr.addColorStop(0, L(lum * 0.4)); gr.addColorStop(0.2, L(lum)); gr.addColorStop(0.55, L(lum * 0.5)); gr.addColorStop(1, L(lum * 0.45));
  g.fillStyle = gr;
  g.beginPath(); g.roundRect(x, -r, w, r * 2, 5); g.fill();
}

function drawHand(g: CanvasRenderingContext2D) {
  // ---- antebraço: tubo segmentado, vazamentos de ventilação e pistões hidráulicos ----
  plate(g, -760, 6, -215, 0, 72, 52, 0.58, false);
  g.strokeStyle = L(0.03);
  g.lineWidth = 7;
  for (const x of [-640, -520, -410, -320]) { g.beginPath(); g.moveTo(x, -64); g.lineTo(x + 4, 64); g.stroke(); }
  g.lineWidth = 3;
  for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(-470 + i * 12, -34); g.lineTo(-470 + i * 12, 34); g.stroke(); }
  g.strokeStyle = L(0.85); g.lineWidth = 3; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-740, -40); g.lineTo(-230, -30); g.stroke();
  for (const sy of [-1, 1]) {
    g.fillStyle = L(0.12); g.fillRect(-380, sy * 40 - 8, 150, 16);
    plate(g, -380, sy * 40, -240, sy * 34, 8, 7, 0.85, false);
    g.fillStyle = L(0.95); g.fillRect(-240, sy * 35 - 3, 46, 6);
    g.strokeStyle = L(0.8); g.lineWidth = 2;
    g.beginPath(); g.moveTo(-620, sy * 12); g.bezierCurveTo(-470, sy * 30, -330, sy * 6, -214, sy * 18); g.stroke();
  }
  // ---- punho: três anéis ----
  collar(g, -222, 15, 60, 0.7);
  collar(g, -204, 13, 56, 0.8);
  collar(g, -188, 11, 52, 0.62);

  // ---- palma: placa traseira chanfrada com sulcos e núcleo de energia ----
  const pg = g.createLinearGradient(0, -80, 0, 86);
  pg.addColorStop(0, L(0.38)); pg.addColorStop(0.18, L(0.84)); pg.addColorStop(0.52, L(0.55)); pg.addColorStop(0.85, L(0.18)); pg.addColorStop(1, L(0.5));
  g.fillStyle = pg;
  g.beginPath();
  g.moveTo(-176, -46);
  g.lineTo(-108, -66);
  g.quadraticCurveTo(-60, -80, -2, -72);
  g.lineTo(6, 78);
  g.quadraticCurveTo(-60, 92, -110, 66);
  g.lineTo(-176, 48);
  g.closePath();
  g.fill();
  g.strokeStyle = L(0.02); g.lineWidth = 4;
  g.beginPath(); g.moveTo(-132, -62); g.quadraticCurveTo(-120, 0, -134, 58); g.stroke();
  g.beginPath(); g.moveTo(-52, -76); g.quadraticCurveTo(-42, 0, -52, 84); g.stroke();
  // tendões dos metacarpos
  const knuckles: [number, number][] = [[2, -58], [2, -20], [2, 18], [0, 54]];
  knuckles.forEach(([kx, ky], i) => {
    g.strokeStyle = L(0.03); g.lineWidth = 5;
    g.beginPath(); g.moveTo(kx - 6, ky + 3); g.lineTo(-172, ky * 0.3 + 3 + i); g.stroke();
    g.strokeStyle = L(0.95); g.lineWidth = 2.2;
    g.beginPath(); g.moveTo(kx - 6, ky); g.lineTo(-172, ky * 0.3 + i); g.stroke();
  });
  // núcleo de energia (repulsor)
  const cx = -92, cy = 4;
  g.fillStyle = L(0.02); g.beginPath(); g.arc(cx, cy, 34, 0, TAU); g.fill();
  const ring = g.createLinearGradient(0, cy - 30, 0, cy + 30);
  ring.addColorStop(0, L(1)); ring.addColorStop(0.5, L(0.45)); ring.addColorStop(1, L(0.8));
  g.fillStyle = ring; g.beginPath(); g.arc(cx, cy, 29, 0, TAU); g.fill();
  g.fillStyle = L(0.04); g.beginPath(); g.arc(cx, cy, 21, 0, TAU); g.fill();
  const glow = g.createRadialGradient(cx, cy, 0, cx, cy, 19);
  glow.addColorStop(0, L(1)); glow.addColorStop(0.5, L(0.85)); glow.addColorStop(1, L(0.1));
  g.fillStyle = glow; g.beginPath(); g.arc(cx, cy, 19, 0, TAU); g.fill();

  // ---- polegar: base carnuda (placa) + 3 falanges ----
  plate(g, -128, -26, -88, -56, 30, 22, 0.72, false);
  finger(g, { k: [-88, -56], len: [56, 46, 38], ang: [-50, -34, -16], r: 14, lum: 0.86 });
  joint(g, -88, -56, 17);

  // ---- dedos: o indicador estendido, os outros curvados em repouso ----
  finger(g, { k: [2, 54], len: [58, 38, 32], ang: [10, 38, 68], r: 10, lum: 0.6 });
  finger(g, { k: [2, 18], len: [70, 46, 38], ang: [6, 32, 60], r: 11.5, lum: 0.7 });
  finger(g, { k: [2, -20], len: [76, 50, 41], ang: [2, 22, 48], r: 12, lum: 0.82 });
  finger(g, { k: [2, -58], len: [68, 44, 38], ang: [0, -1, 3], r: 12, lum: 1 });
  for (const [kx, ky] of knuckles) joint(g, kx, ky, 14.5, 0.9);
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
      cellCss = W < 760 ? 3.6 : 5;
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
      const ang = (portrait ? 58 : 24) * (Math.PI / 180);
      const tile = mode === 'hero' ? Math.min(W, H) * (portrait ? 0.15 : 0.085) : 0;
      let gap: number;
      if (mode === 'hero') gap = tile + 26 + (1 - ease) * 220 + p * -10;
      else gap = 3 + Math.pow(1 - p, 1.4) * Math.min(W, 900) * 0.42;
      const breathe = reduced ? 0 : Math.sin(t * 1.1) * (mode === 'hero' ? 7 : 4 * (1 - p));
      const s = Math.min(W * (portrait ? 0.86 : 0.74), H * 1.3) / 640;

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
