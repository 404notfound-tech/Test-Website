// 3D-Ansicht der Grundrisse. Die Daten kommen aus floors.js.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const WALL_H = 1.4;   // Wandhöhe (niedrig, damit man reinschauen kann)
const WALL_T = 0.12;  // Wandstärke
const DOOR_W = 1.4;   // Türbreite
const INSET = WALL_T / 2 + 0.03; // Wände leicht nach innen, damit Nachbarräume sich nicht überlappen

export function createFloorplan(container) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
  camera.position.set(1, 1.1, 1.2);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 8;
  controls.maxDistance = 45;
  controls.maxPolarAngle = Math.PI / 2.2;
  controls.autoRotate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  controls.autoRotateSpeed = 0.6;
  controls.addEventListener('start', () => { controls.autoRotate = false; });

  scene.add(new THREE.HemisphereLight(0xffffff, 0x222233, 1.4));
  const sun = new THREE.DirectionalLight(0xffffff, 1.2);
  sun.position.set(10, 20, 8);
  scene.add(sun);

  let group = null;
  let current = null;

  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function fitCamera(floor) {
    let dist = Math.max(floor.size.w, floor.size.d) * 1.5;
    if (camera.aspect < 1) dist /= Math.max(camera.aspect, 0.5);
    controls.target.set(0, 0, 0);
    camera.position.normalize().multiplyScalar(dist);
    controls.update();
  }

  function show(floor) {
    if (group) {
      scene.remove(group);
      dispose(group);
    }
    current = floor;
    group = buildFloor(floor);
    scene.add(group);
    fitCamera(floor);
    renderer.render(scene, camera);
  }

  // Nur rendern, wenn die Ansicht sichtbar ist
  let visible = true;
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(container);
  new ResizeObserver(() => {
    resize();
    if (current) fitCamera(current);
  }).observe(container);
  resize();

  renderer.setAnimationLoop(() => {
    if (!visible) return;
    controls.update();
    renderer.render(scene, camera);
  });

  return { show };
}

function buildFloor(floor) {
  const g = new THREE.Group();
  const accent = new THREE.Color(floor.accent);

  // Bodenplatte mit Akzent-Kante
  const base = box(floor.size.w, 0.2, floor.size.d, new THREE.Color('#15151c'));
  base.position.y = -0.1;
  g.add(base);
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(base.geometry),
    new THREE.LineBasicMaterial({ color: accent })
  );
  edges.position.copy(base.position);
  g.add(edges);

  const tileColor = new THREE.Color('#1e1e28').lerp(accent, 0.18);
  const wallColor = new THREE.Color('#2a2a36').lerp(accent, 0.35);

  for (const room of floor.rooms) {
    const tile = box(room.w - 0.1, 0.02, room.d - 0.1, tileColor);
    tile.position.set(room.x, 0.01, room.z);
    g.add(tile);

    if (floor.walls !== false) addWalls(g, room, wallColor);

    const label = makeLabel(room.name, '#ffffff', 0.7);
    label.position.set(room.x, WALL_H + 0.6, room.z);
    g.add(label);
  }

  for (const p of floor.props || []) {
    const color = p.color ? new THREE.Color(p.color) : accent;
    const mesh = box(p.w, p.h, p.d, color, p.color ? 0 : 0.35);
    mesh.position.set(p.x, p.h / 2, p.z);
    g.add(mesh);
  }

  if (floor.note) {
    const note = makeLabel(floor.note, floor.accent, 1.6);
    note.position.set(0, 4, 0);
    g.add(note);
  }

  return g;
}

function addWalls(g, room, color) {
  const { x, z, w, d } = room;
  const doors = room.doors || [];
  const open = room.open || [];
  const hLen = w - 2 * INSET + WALL_T; // Wände hinten/vorne
  const vLen = d - 2 * INSET - WALL_T; // Wände links/rechts (zwischen den anderen)

  const sides = [
    { id: 'n', cx: x, cz: z - d / 2 + INSET, len: hLen, alongX: true },
    { id: 's', cx: x, cz: z + d / 2 - INSET, len: hLen, alongX: true },
    { id: 'w', cx: x - w / 2 + INSET, cz: z, len: vLen, alongX: false },
    { id: 'o', cx: x + w / 2 - INSET, cz: z, len: vLen, alongX: false },
  ];

  for (const s of sides) {
    if (open.includes(s.id)) continue;

    const segments = [];
    if (doors.includes(s.id) && s.len > DOOR_W + 0.4) {
      const segLen = (s.len - DOOR_W) / 2;
      const offset = DOOR_W / 2 + segLen / 2;
      segments.push({ len: segLen, off: -offset }, { len: segLen, off: offset });
    } else {
      segments.push({ len: s.len, off: 0 });
    }

    for (const seg of segments) {
      const wall = s.alongX
        ? box(seg.len, WALL_H, WALL_T, color)
        : box(WALL_T, WALL_H, seg.len, color);
      wall.position.set(
        s.alongX ? s.cx + seg.off : s.cx,
        WALL_H / 2,
        s.alongX ? s.cz : s.cz + seg.off
      );
      g.add(wall);
    }
  }
}

function box(w, h, d, color, emissive = 0) {
  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.8,
    emissive: color,
    emissiveIntensity: emissive,
  });
  return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
}

function makeLabel(text, color, height) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const font = '700 64px system-ui, sans-serif';
  ctx.font = font;
  canvas.width = Math.ceil(ctx.measureText(text).width) + 48;
  canvas.height = 96;
  ctx.font = font;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 4);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false }));
  sprite.scale.set((height * canvas.width) / canvas.height, height, 1);
  sprite.renderOrder = 10;
  return sprite;
}

function dispose(obj) {
  obj.traverse((o) => {
    o.geometry?.dispose();
    if (o.material) {
      o.material.map?.dispose();
      o.material.dispose();
    }
  });
}
