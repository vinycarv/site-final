import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { fresnelFragment, fresnelVertex } from './shaders';

// Estado compartilhado, lido dentro do loop de render (sem re-renderizar React).
const input = { x: 0, y: 0, scroll: 0, active: true, moved: false };

// Cursor projetado no plano da cena. Os quadros se afastam dele, o núcleo segue de leve,
// e um clique dispara uma onda que expande a composição e acelera a rotação.
const pointer = { world: new THREE.Vector3(), burst: 0 };
const PUSH_R = 2.9;
const PTR = new THREE.Vector3();
const CORE_TARGET = new THREE.Vector3();

type Variant = 'hero' | 'contact';

const ORANGE = new THREE.Color('#ff5a1f');
const TMP = new THREE.Vector3();
const BODY = new THREE.Color('#141416');

// Câmera por estados: abertura, transição, galeria, processo e encerramento.
const KEYS: { p: number; pos: [number, number, number]; look: [number, number, number] }[] = [
  { p: 0.0, pos: [0, 0.6, 13], look: [0, 0, 0] },
  { p: 0.3, pos: [5.5, 1.6, 8.5], look: [0, 0, 0] },
  { p: 0.6, pos: [-5, -1.2, 8], look: [0, 0, 0] },
  { p: 0.85, pos: [2, 0.4, 10], look: [0, 0, 0] },
  { p: 1.0, pos: [0, 0, 12], look: [0, 0, 0] },
];

function camAt(p: number) {
  for (let i = 0; i < KEYS.length - 1; i++) {
    const a = KEYS[i], b = KEYS[i + 1];
    if (p <= b.p) {
      const t = (p - a.p) / (b.p - a.p);
      const e = t * t * (3 - 2 * t); // curva suave entre estados
      return {
        pos: a.pos.map((v, k) => v + (b.pos[k] - v) * e) as [number, number, number],
        look: a.look.map((v, k) => v + (b.look[k] - v) * e) as [number, number, number],
      };
    }
  }
  return { pos: KEYS[KEYS.length - 1].pos, look: KEYS[KEYS.length - 1].look };
}

function Frames({ variant }: { variant: Variant }) {
  const group = useRef<THREE.Group>(null);
  const count = variant === 'hero' ? 7 : 5;
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        i,
        base: new THREE.Vector3(),
        tilt: (i % 2 ? 1 : -1) * 0.18,
        tone: i % 4 === 0 ? ORANGE : BODY,
      })),
    [count],
  );

  const material = useMemo(
    () =>
      items.map(
        (it) =>
          new THREE.ShaderMaterial({
            vertexShader: fresnelVertex,
            fragmentShader: fresnelFragment,
            uniforms: {
              uBody: { value: it.tone.clone() },
              uRim: { value: ORANGE.clone() },
              uTime: { value: 0 },
              uAlpha: { value: 0.92 },
            },
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide,
          }),
      ),
    [items],
  );

  useEffect(() => () => material.forEach((m) => m.dispose()), [material]);

  useFrame((state, dt) => {
    if (!group.current || !input.active) return;
    const t = state.clock.elapsedTime;
    const spread = variant === 'hero' ? 1 : 0.7;
    group.current.children.forEach((mesh, idx) => {
      const it = items[idx];
      const a = idx * (Math.PI * 2 / count) + input.scroll * 2.4 + t * 0.05;
      const r = (variant === 'hero' ? 4.6 : 3.4) * spread;
      TMP.set(Math.cos(a) * r, Math.sin(idx * 0.9 + t * 0.4) * 1.5, Math.sin(a) * r * 0.55 - 1.5);
      if (input.moved) {
        const dx = TMP.x - pointer.world.x;
        const dy = TMP.y - pointer.world.y;
        const d = Math.hypot(dx, dy);
        if (d < PUSH_R && d > 0.0001) {
          const f = (1 - d / PUSH_R) * 1.8;
          TMP.x += (dx / d) * f;
          TMP.y += (dy / d) * f;
        }
      }
      TMP.multiplyScalar(1 + pointer.burst * 0.28);
      mesh.position.lerp(TMP, 1 - Math.pow(0.001, dt));
      mesh.lookAt(0, 0, 0);
      mesh.rotation.z += (it.tilt - mesh.rotation.z) * 0.04;
      mesh.rotation.y += Math.sin(t * 0.6 + idx) * 0.0008;
      const m = material[idx];
      m.uniforms.uTime.value = t;
    });
  });

  return (
    <group ref={group}>
      {items.map((it, idx) => (
        <mesh key={it.i} material={material[idx]}>
          <boxGeometry args={[3.2, 1.8, 0.05]} />
        </mesh>
      ))}
    </group>
  );
}

function Core({ variant }: { variant: Variant }) {
  const mesh = useRef<THREE.Mesh>(null);
  const wire = useRef<THREE.Mesh>(null);
  const size = variant === 'hero' ? 1.1 : 1.6;
  useFrame((state, dt) => {
    if (!mesh.current || !wire.current || !input.active) return;
    const t = state.clock.elapsedTime;
    const pulse = 1 + Math.sin(t * 2.2) * 0.04 + pointer.burst * 0.35;
    mesh.current.scale.setScalar(pulse);
    CORE_TARGET.set(input.moved ? pointer.world.x * 0.22 : 0, input.moved ? pointer.world.y * 0.22 : 0, 0);
    mesh.current.position.lerp(CORE_TARGET, 1 - Math.pow(0.04, dt));
    wire.current.position.copy(mesh.current.position);
    const spin = 0.25 + pointer.burst * 4;
    mesh.current.rotation.y += dt * spin;
    wire.current.rotation.x += dt * (0.12 + pointer.burst * 2);
    wire.current.rotation.y -= dt * 0.18;
  });
  return (
    <group>
      <mesh ref={mesh}>
        <icosahedronGeometry args={[size, 1]} />
        <meshBasicMaterial color={ORANGE} transparent opacity={0.22} depthWrite={false} />
      </mesh>
      <mesh ref={wire}>
        <icosahedronGeometry args={[size * 1.55, 1]} />
        <meshBasicMaterial color={ORANGE} wireframe transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

function Particles() {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const n = 140;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 26;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 14 - 2;
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  useEffect(() => () => geo.dispose(), [geo]);
  const ref = useRef<THREE.Points>(null);
  useFrame((_, dt) => {
    if (!ref.current || !input.active) return;
    ref.current.rotation.y += dt * (0.01 + pointer.burst * 0.8);
    ref.current.rotation.x += ((input.moved ? input.y * 0.12 : 0) - ref.current.rotation.x) * (1 - Math.pow(0.05, dt));
  });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial color="#ff7a35" size={0.035} transparent opacity={0.45} depthWrite={false} sizeAttenuation />
    </points>
  );
}

function Rig({ variant }: { variant: Variant }) {
  const { camera } = useThree();
  const root = useRef<THREE.Group>(null);
  const look = useMemo(() => new THREE.Vector3(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  useFrame((state, dt) => {
    pointer.burst *= Math.pow(0.03, dt);
    if (!input.active) return;
    // Converte a posição do mouse em um ponto no plano z = 0 da cena.
    PTR.set(input.x, input.y, 0.5).unproject(state.camera);
    PTR.sub(state.camera.position).normalize();
    const k = -state.camera.position.z / PTR.z;
    pointer.world.set(state.camera.position.x + PTR.x * k, state.camera.position.y + PTR.y * k, 0);

    const base = variant === 'contact' ? 0.95 : input.scroll;
    const c = camAt(base);
    // Parallax mais forte: a câmera e o olhar acompanham o mouse em profundidade.
    target.set(c.pos[0] + input.x * 1.5, c.pos[1] + input.y * 0.9, c.pos[2]);
    camera.position.lerp(target, 1 - Math.pow(0.03, dt));
    look.set(c.look[0] + input.x * 0.5, c.look[1] + input.y * 0.3, c.look[2]);
    camera.lookAt(look);
    if (root.current) {
      root.current.rotation.y += (input.x * 0.34 - root.current.rotation.y) * (1 - Math.pow(0.06, dt));
      root.current.rotation.x += (input.y * 0.2 - root.current.rotation.x) * (1 - Math.pow(0.06, dt));
    }
  });
  return (
    <group ref={root}>
      <Frames variant={variant} />
      <Core variant={variant} />
      <Particles />
    </group>
  );
}

export default function CinemaScene({ variant = 'hero', className = '' }: { variant?: Variant; className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      input.x = (e.clientX / innerWidth) * 2 - 1;
      input.y = -((e.clientY / innerHeight) * 2 - 1);
      input.moved = true;
    };
    const onDown = () => { pointer.burst = 1; };
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      input.scroll = max > 0 ? scrollY / max : 0;
    };
    const io = new IntersectionObserver(([en]) => { input.active = en.isIntersecting; }, { threshold: 0 });
    if (wrap.current) io.observe(wrap.current);
    addEventListener('pointermove', onMove, { passive: true });
    addEventListener('pointerdown', onDown, { passive: true });
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      io.disconnect();
      removeEventListener('pointermove', onMove);
      removeEventListener('pointerdown', onDown);
      removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div ref={wrap} className={`cinema ${className}`} aria-hidden="true">
      <Canvas
        dpr={[1, 1.6]}
        camera={{ fov: 40, near: 0.1, far: 80, position: [0, 0.6, 13] }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <fog attach="fog" args={['#0b0b0d', 14, 34]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[4, 6, 5]} intensity={1.1} color="#fff1e6" />
        <pointLight position={[-6, -2, 4]} intensity={2.4} color="#ff5a1f" distance={18} />
        <Rig variant={variant} />
      </Canvas>
    </div>
  );
}
