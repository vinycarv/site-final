// ---------------------------------------------------------------------------
// Mão robótica cromada, desenhada em vetor (autoral) e "assada" uma única vez num sprite.
// O sprite é desenhado a cada quadro com rotação e escala, então o custo no scroll é mínimo.
//
// Mão apontando para +x. A ponta do indicador fica em TIP. Ângulos em graus (+ curva para +y).
// Cromo = reflexo de ambiente: faixa clara no topo, horizonte escuro, rebote claro embaixo.
// ---------------------------------------------------------------------------
type G = CanvasRenderingContext2D;
type Finger = { k: [number, number]; len: [number, number, number]; ang: [number, number, number]; r: number; m: number };

export const BOX = { x0: -800, y0: -190, w: 1010, h: 640 };
export type Who = 'adam' | 'deus';

// Poses inspiradas na "Criação de Adão" (Michelangelo, domínio público), em versão robótica:
// - adam: pulso caído, dedos soltos e pesando para baixo, o indicador quase relaxado;
// - deus: braço firme, indicador reto e apontado, os outros dedos recolhidos.
// wrist = quanto o antebraço gira em relação à mão (graus, negativo = antebraço sobe para a direita).
type Pose = { wrist: number; index: Finger; middle: Finger; ring: Finger; pinky: Finger; thumb: Finger };

const TAU = Math.PI * 2;

const L = (v: number, a = 1) => {
  const c = Math.max(0, Math.min(255, Math.round(255 * v)));
  return `rgba(${c},${c},${Math.min(255, c + 5)},${a})`;
};

// Perfil do cromo ao longo da largura do cilindro: [posição, luminosidade]
const CHROME: [number, number][] = [
  [0, 0.02], [0.07, 0.4], [0.15, 0.98], [0.25, 0.78], [0.35, 0.2], [0.43, 0.04],
  [0.53, 0.3], [0.67, 0.64], [0.79, 0.4], [0.9, 0.92], [0.96, 0.5], [1, 0.03],
];

function chrome(g: G, y0: number, y1: number, m = 1) {
  const gr = g.createLinearGradient(0, y0, 0, y1);
  for (const [p, v] of CHROME) gr.addColorStop(p, L(v * m));
  return gr;
}

// Peça cônica de metal (falange, tubo, pistão): bisel, oclusão nas pontas, faixas especulares.
function plate(g: G, x1: number, y1: number, x2: number, y2: number, r1: number, r2: number, m = 1, groove: number | null = 0.64) {
  const len = Math.hypot(x2 - x1, y2 - y1);
  const R = Math.max(r1, r2);
  const c = Math.min(r1, r2) * 0.5;
  g.save();
  g.translate(x1, y1);
  g.rotate(Math.atan2(y2 - y1, x2 - x1));
  const body = () => {
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
  };
  body(); g.fillStyle = chrome(g, -R, R, m); g.fill();
  const ao = g.createLinearGradient(0, 0, len, 0);
  ao.addColorStop(0, 'rgba(0,0,0,.6)'); ao.addColorStop(0.15, 'rgba(0,0,0,0)');
  ao.addColorStop(0.85, 'rgba(0,0,0,0)'); ao.addColorStop(1, 'rgba(0,0,0,.5)');
  body(); g.fillStyle = ao; g.fill();
  body(); g.strokeStyle = 'rgba(0,0,0,.9)'; g.lineWidth = Math.max(1.3, R * 0.1); g.stroke();
  g.lineCap = 'round';
  g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = Math.max(1.2, R * 0.09);
  g.beginPath(); g.moveTo(len * 0.1, -r1 * 0.62); g.lineTo(len * 0.82, -r2 * 0.62); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.38)'; g.lineWidth = Math.max(1, R * 0.05);
  g.beginPath(); g.moveTo(len * 0.12, r1 * 0.72); g.lineTo(len * 0.8, r2 * 0.72); g.stroke();
  if (groove !== null && len > 26) {
    const px = len * groove, pr = r1 + (r2 - r1) * groove;
    g.lineCap = 'butt';
    g.strokeStyle = 'rgba(0,0,0,.95)'; g.lineWidth = Math.max(1.8, R * 0.15);
    g.beginPath(); g.moveTo(px, -pr * 0.96); g.lineTo(px, pr * 0.96); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = Math.max(0.8, R * 0.05);
    g.beginPath(); g.moveTo(px + R * 0.12, -pr * 0.9); g.lineTo(px + R * 0.12, pr * 0.9); g.stroke();
  }
  g.restore();
}

// Esfera cromada de articulação, com encaixe escuro, anel interno e ponto de luz.
function joint(g: G, x: number, y: number, r: number) {
  g.fillStyle = '#020202';
  g.beginPath(); g.arc(x, y, r * 1.18, 0, TAU); g.fill();
  const rg = g.createRadialGradient(x - r * 0.32, y - r * 0.4, r * 0.05, x, y, r);
  rg.addColorStop(0, L(1)); rg.addColorStop(0.2, L(0.88)); rg.addColorStop(0.5, L(0.26));
  rg.addColorStop(0.78, L(0.56)); rg.addColorStop(1, L(0.05));
  g.fillStyle = rg;
  g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(0,0,0,.85)'; g.lineWidth = Math.max(1, r * 0.13);
  g.beginPath(); g.arc(x, y, r * 0.56, 0, TAU); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.95)';
  g.beginPath(); g.arc(x - r * 0.3, y - r * 0.36, r * 0.13, 0, TAU); g.fill();
}

// Cabo que cruza a articulação pelo dorso, com leve folga (mostra a mecânica por fora).
function cable(g: G, ax: number, ay: number, bx: number, by: number, a: number, bow: number) {
  const cx = (ax + bx) / 2 + Math.sin(a) * bow, cy = (ay + by) / 2 - Math.cos(a) * bow;
  g.lineCap = 'round';
  g.strokeStyle = '#030303'; g.lineWidth = 3.4;
  g.beginPath(); g.moveTo(ax, ay); g.quadraticCurveTo(cx, cy, bx, by); g.stroke();
  g.strokeStyle = 'rgba(215,215,220,.85)'; g.lineWidth = 0.9;
  g.beginPath(); g.moveTo(ax, ay - 0.6); g.quadraticCurveTo(cx, cy - 0.6, bx, by - 0.6); g.stroke();
}


function finger(g: G, f: Finger) {
  const pts: [number, number][] = [f.k];
  const A = f.ang.map((d) => (d * Math.PI) / 180);
  f.len.forEach((l, i) => {
    const [px, py] = pts[i];
    pts.push([px + Math.cos(A[i]) * l, py + Math.sin(A[i]) * l]);
  });
  const rr = [f.r, f.r * 0.9, f.r * 0.8, f.r * 0.52];
  for (let i = 0; i < 3; i++) plate(g, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], rr[i], rr[i + 1], f.m, i === 2 ? 0.5 : 0.64);
  for (let i = 1; i < 3; i++) {
    const a = (A[i - 1] + A[i]) / 2;
    const o = rr[i] * 0.62;
    const dx = Math.sin(a) * -o, dy = Math.cos(a) * o; // lado do dorso (negativo em y)
    cable(g, pts[i][0] - Math.cos(A[i - 1]) * rr[i] * 1.5 + dx, pts[i][1] - Math.sin(A[i - 1]) * rr[i] * 1.5 + dy,
      pts[i][0] + Math.cos(A[i]) * rr[i] * 1.5 + dx, pts[i][1] + Math.sin(A[i]) * rr[i] * 1.5 + dy, a, rr[i] * 0.7);
  }
  joint(g, pts[1][0], pts[1][1], rr[1] * 0.95);
  joint(g, pts[2][0], pts[2][1], rr[2] * 0.92);
  // ponta: sensor luminoso
  const [tx, ty] = pts[3];
  g.fillStyle = 'rgba(255,255,255,.95)';
  g.beginPath(); g.arc(tx - Math.cos(A[2]) * rr[3] * 0.3, ty - Math.sin(A[2]) * rr[3] * 0.3, rr[3] * 0.3, 0, TAU); g.fill();
}


const POSES: Record<Who, Pose> = {
  adam: {
    wrist: -30,
    index: { k: [2, -58], len: [72, 47, 41], ang: [4, 9, 14], r: 12.5, m: 1 },
    middle: { k: [2, -20], len: [80, 53, 44], ang: [12, 34, 58], r: 12.5, m: 0.94 },
    ring: { k: [2, 18], len: [74, 49, 41], ang: [18, 42, 68], r: 12, m: 0.86 },
    pinky: { k: [0, 54], len: [61, 41, 35], ang: [24, 50, 76], r: 10.5, m: 0.78 },
    thumb: { k: [-88, -56], len: [56, 46, 38], ang: [-40, -22, -6], r: 14, m: 1 },
  },
  deus: {
    wrist: 10,
    index: { k: [2, -58], len: [72, 47, 41], ang: [-1, -2, -3], r: 12.5, m: 1 },
    middle: { k: [2, -20], len: [80, 53, 44], ang: [6, 22, 40], r: 12.5, m: 0.94 },
    ring: { k: [2, 18], len: [74, 49, 41], ang: [12, 32, 54], r: 12, m: 0.86 },
    pinky: { k: [0, 54], len: [61, 41, 35], ang: [16, 40, 66], r: 10.5, m: 0.78 },
    thumb: { k: [-88, -56], len: [56, 46, 38], ang: [-34, -10, 10], r: 14, m: 1 },
  },
};

// Ponta do indicador de cada pose (a mão é posicionada por este ponto).
export const TIPS: Record<Who, [number, number]> = (() => {
  const out = {} as Record<Who, [number, number]>;
  (Object.keys(POSES) as Who[]).forEach((w) => {
    const f = POSES[w].index;
    let x = f.k[0], y = f.k[1];
    f.len.forEach((l, i) => { const a = (f.ang[i] * Math.PI) / 180; x += Math.cos(a) * l; y += Math.sin(a) * l; });
    out[w] = [x, y];
  });
  return out;
})();

function ring(g: G, x: number, w: number, r: number, m: number) {
  g.save();
  g.beginPath(); g.roundRect(x, -r, w, r * 2, 5);
  g.fillStyle = chrome(g, -r, r, m); g.fill();
  g.strokeStyle = 'rgba(0,0,0,.9)'; g.lineWidth = 2; g.stroke();
  g.restore();
}

function bevelPoly(g: G, pts: [number, number][], m: number, y0: number, y1: number) {
  g.beginPath();
  pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  g.closePath();
  g.fillStyle = chrome(g, y0, y1, m); g.fill();
  g.lineJoin = 'round';
  g.strokeStyle = 'rgba(0,0,0,.92)'; g.lineWidth = 3; g.stroke();
  g.beginPath();
  for (let i = 0; i < pts.length / 2 + 1 && i < pts.length; i++) (i ? g.lineTo(pts[i][0], pts[i][1] + 3.5) : g.moveTo(pts[i][0], pts[i][1] + 3.5));
  g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 1.2; g.stroke();
}

function drawHand(g: G, who: Who) {
  const pose = POSES[who];
  // ---- antebraço: tubo segmentado com anéis, pistões e cabos (gira em torno do pulso) ----
  g.save();
  g.translate(-190, 0);
  g.rotate((pose.wrist * Math.PI) / 180);
  g.translate(190, 0);
  plate(g, -770, 6, -215, 0, 74, 52, 0.7, null);
  for (const x of [-650, -530, -420, -325]) {
    g.strokeStyle = '#020202'; g.lineWidth = 8;
    g.beginPath(); g.moveTo(x, -66); g.lineTo(x + 4, 66); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 1.2;
    g.beginPath(); g.moveTo(x + 6, -62); g.lineTo(x + 10, 62); g.stroke();
  }
  g.strokeStyle = '#020202'; g.lineWidth = 3;
  for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(-480 + i * 12, -32); g.lineTo(-480 + i * 12, 32); g.stroke(); }
  for (const sy of [-1, 1]) {
    g.fillStyle = '#050505'; g.beginPath(); g.roundRect(-392, sy * 42 - 11, 170, 22, 6); g.fill();
    plate(g, -392, sy * 42, -236, sy * 35, 10, 8, 0.95, 0.5);
    plate(g, -236, sy * 35, -190, sy * 33, 5, 5, 1, null);
    g.strokeStyle = '#030303'; g.lineWidth = 3.4; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-640, sy * 13); g.bezierCurveTo(-470, sy * 34, -340, sy * 6, -214, sy * 20); g.stroke();
    g.strokeStyle = 'rgba(215,215,220,.8)'; g.lineWidth = 0.9;
    g.beginPath(); g.moveTo(-640, sy * 13 - 0.6); g.bezierCurveTo(-470, sy * 34 - 0.6, -340, sy * 6 - 0.6, -214, sy * 20 - 0.6); g.stroke();
  }
  // ---- punho: anéis ----
  ring(g, -224, 16, 61, 0.9);
  ring(g, -205, 13, 57, 1);
  ring(g, -189, 11, 53, 0.8);
  g.restore();

  // ---- palma: placa dorsal chanfrada, metacarpos e núcleo de energia ----
  g.fillStyle = '#050505';
  g.beginPath(); g.moveTo(-176, -48); g.lineTo(6, -76); g.lineTo(10, 82); g.lineTo(-176, 50); g.closePath(); g.fill();
  bevelPoly(g, [[-168, -42], [-108, -62], [-44, -72], [-2, -66], [4, 66], [-44, 78], [-108, 60], [-168, 44]], 0.62, -78, 80);
  const knuckles: [number, number][] = [[2, -58], [2, -20], [2, 18], [0, 54]];
  knuckles.forEach(([kx, ky], i) => plate(g, kx - 4, ky, -156, ky * 0.3 + i, 9.5, 7, 0.95, 0.5));
  g.strokeStyle = '#020202'; g.lineWidth = 4;
  g.beginPath(); g.moveTo(-136, -58); g.quadraticCurveTo(-124, 0, -138, 56); g.stroke();
  // núcleo de energia
  const cx = -92, cy = 4;
  g.fillStyle = '#020202'; g.beginPath(); g.arc(cx, cy, 35, 0, TAU); g.fill();
  const rg = g.createLinearGradient(0, cy - 30, 0, cy + 30);
  for (const [p, v] of CHROME) rg.addColorStop(p, L(v));
  g.fillStyle = rg; g.beginPath(); g.arc(cx, cy, 30, 0, TAU); g.fill();
  g.fillStyle = '#020202'; g.beginPath(); g.arc(cx, cy, 22, 0, TAU); g.fill();
  const glow = g.createRadialGradient(cx, cy, 0, cx, cy, 20);
  glow.addColorStop(0, L(1)); glow.addColorStop(0.45, L(0.9)); glow.addColorStop(1, L(0.08));
  g.fillStyle = glow; g.beginPath(); g.arc(cx, cy, 20, 0, TAU); g.fill();

  // ---- polegar: base (eminência tenar) + 3 falanges ----
  plate(g, -132, -24, -88, -56, 31, 23, 0.8, null);
  finger(g, pose.thumb);
  joint(g, -88, -56, 17.5);

  // ---- dedos ----
  finger(g, pose.pinky);
  finger(g, pose.ring);
  finger(g, pose.middle);
  finger(g, pose.index);
  for (const [kx, ky] of knuckles) joint(g, kx, ky, 15);
}

// Desenha a mão uma vez e devolve o sprite (com um brilho suave ao redor).
export function bakeHand(k: number, who: Who): HTMLCanvasElement {
  const w = Math.ceil(BOX.w * k), h = Math.ceil(BOX.h * k);
  const tmp = document.createElement('canvas');
  tmp.width = w; tmp.height = h;
  const t = tmp.getContext('2d')!;
  t.setTransform(k, 0, 0, k, -BOX.x0 * k, -BOX.y0 * k);
  drawHand(t, who);
  const out = document.createElement('canvas');
  out.width = w; out.height = h;
  const o = out.getContext('2d')!;
  o.shadowColor = 'rgba(255,255,255,0.3)';
  o.shadowBlur = 22 * k;
  o.drawImage(tmp, 0, 0);
  return out;
}
