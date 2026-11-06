import { useEffect, useRef } from 'react';


// Fundo de meio-tom (pontos, em WebGL) com duas mãos robóticas cromadas por cima, em vetor liso.
// O cursor funciona como lente nos pontos (aumenta e acende) e o clique solta uma onda de luz.
//
// mode="hero": as mãos se aproximam do logo, mas nunca se tocam (o laço fica aberto).
// mode="touch": no fim da página, as pontas dos dedos se encontram e acendem a tela.

type Mode = 'hero' | 'touch';
type Props = { mode?: Mode; className?: string; onTouch?: () => void };

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
  const handsRef = useRef<HTMLCanvasElement>(null);
  const touchCb = useRef(onTouch);
  touchCb.current = onTouch;

  useEffect(() => {
    const el = canvas.current!;
    const hel = handsRef.current!;
    const hc = hel.getContext('2d')!;
    // mão criada pelo Vinícius (public/hand.png), sem fundo; a ponta do indicador fica em TIP
    const handImg = new Image();
    let handReady = false;
    handImg.onload = () => { handReady = true; };
    handImg.src = '/hand.png';
    const TIP = [42, 535];
    const handScale = () => Math.min(W * (W / H < 0.85 ? 0.62 : 0.5), H * 0.62) / 576;
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
      hel.width = el.width; hel.height = el.height;
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
      const cx = W / 2, cy = H * (mode === 'hero' ? (portrait ? 0.3 : 0.4) : (portrait ? 0.3 : 0.42));
      // composição horizontal, como no quadro; no celular a cena inteira gira para a diagonal
      const th = (portrait ? -52 : 0) * (Math.PI / 180);
      const co = Math.cos(th), si = Math.sin(th);
      const tile = mode === 'hero' ? Math.min(W, H) * (portrait ? 0.15 : 0.085) : 0;
      let gap: number;
      if (mode === 'hero') gap = tile + 30 + (1 - ease) * 240 + p * -10;
      else gap = 3 + Math.pow(1 - p, 1.4) * Math.min(W, 900) * 0.42;
      const breathe = reduced ? 0 : Math.sin(t * 1.1) * (mode === 'hero' ? 7 : 4 * (1 - p));
      const s = handScale();
      const lift = 14 * Math.min(1, (gap + breathe) / 60); // um dedo mais alto que o outro; no toque se alinham

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

      hc.setTransform(1, 0, 0, 1, 0, 0);
      hc.clearRect(0, 0, hel.width, hel.height);
      // esquerda = imagem espelhada na horizontal e na vertical (palma virada, como a mão de Adão);
      // direita = original
      const hands = [{ sx: -1, sy: -1 }, { sx: 1, sy: 1 }];
      for (const h of hands) {
        if (!handReady) continue;
        const d = gap + breathe;
        const ox = h.sx * d, oy = -h.sx * lift;
        const px = ox * co - oy * si, py = ox * si + oy * co;
        const tx = cx + px + mouse.px * -14 * h.sx;
        const ty = cy + py + mouse.py * -10 * h.sx;
        const rot = (((h.sx > 0 ? 24 : 30) + (reduced ? 0 : Math.sin(t * 0.7 + h.sx) * 1.1)) * Math.PI) / 180 + th;
        const place = (c: CanvasRenderingContext2D) => {
          c.translate(tx, ty);
          c.rotate(rot);
          c.scale(h.sx * s, h.sy * s);
          c.translate(-TIP[0], -TIP[1]);
          c.drawImage(handImg, 0, 0);
        };
        // mão lisa por cima
        hc.save();
        hc.setTransform(dpr, 0, 0, dpr, 0, 0);
        place(hc);
        hc.restore();
        // a mesma mão também entra no meio-tom, só dentro da lente do mouse
        if (mouse.x > -999) {
          g.save();
          g.beginPath();
          g.arc(mouse.x, mouse.y, cellCss * 21, 0, Math.PI * 2);
          g.clip();
          g.filter = 'brightness(2.6) contrast(1.15)';
          place(g);
          g.restore();
        }
      }
      // lente do mouse em cima das mãos: perto do cursor a mão lisa some suavemente
      // e aparece a versão em pontos (ampliada e acesa pelo shader)
      if (handReady && mouse.x > -999) {
        const lr = cellCss * 20 * dpr;
        const mx = mouse.x * dpr, my = mouse.y * dpr;
        const lg = hc.createRadialGradient(mx, my, 0, mx, my, lr);
        lg.addColorStop(0, 'rgba(0,0,0,1)');
        lg.addColorStop(0.55, 'rgba(0,0,0,0.85)');
        lg.addColorStop(1, 'rgba(0,0,0,0)');
        hc.save();
        hc.globalCompositeOperation = 'destination-out';
        hc.fillStyle = lg;
        hc.fillRect(mx - lr, my - lr, lr * 2, lr * 2);
        hc.restore();
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
      <canvas ref={handsRef} className="halftone__hands" />
    </div>
  );
}
