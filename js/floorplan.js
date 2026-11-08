// 3D floor plan view. Data comes from floors.js.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const WALL_H = 1.4;   // low walls so you can look inside
const WALL_T = 0.12;  // wall thickness
const DOOR_W = 1.4;   // door width
const INSET = WALL_T / 2 + 0.03; // pull walls inward so neighbouring rooms don't overlap
const FONT = '"JetBrains Mono", ui-monospace, monospace';

export function createFloorplan(container) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
  camera.position.set(1, 1.1, 1.2);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 8;
  controls.maxDistance = 45;
  controls.maxPolarAngle = Math.PI / 2.2;
  controls.autoRotate = !reduceMotion;
  controls.autoRotateSpeed = 0.6;
  controls.addEventListener('start', () => { controls.autoRotate = false; });

  // light gets tinted with the floor's accent
  const hemi = new THREE.HemisphereLight(0xffffff, 0x111118, 1.3);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffffff, 1);
  sun.position.set(10, 20, 8);
  scene.add(sun);

  let group = null;
  let current = null;
  let needsRender = true;
  let visible = true;

  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    needsRender = true;
  }

  function fitCamera(floor) {
    let dist = Math.max(floor.size.w, floor.size.d) * 1.45;
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
    hemi.color.set('#ffffff').lerp(new THREE.Color(floor.accent), 0.35);
    fitCamera(floor);
    renderer.render(scene, camera);
  }

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    needsRender = true;
  }).observe(container);
  new ResizeObserver(() => {
    resize();
    if (current) fitCamera(current);
  }).observe(container);
  resize();

  // only draw when visible and something actually changed
  renderer.setAnimationLoop(() => {
    if (!visible) return;
    const moved = controls.update();
    if (moved || needsRender) {
      renderer.render(scene, camera);
      needsRender = false;
    }
  });

  return { show };
}

function buildFloor(floor) {
  const g = new THREE.Group();
  const accent = new THREE.Color(floor.accent);
  const edgeMat = new THREE.LineBasicMaterial({ color: accent });

  // base plate
  const base = box(floor.size.w, 0.2, floor.size.d, new THREE.Color('#111116'));
  base.position.y = -0.1;
  g.add(base, edgesOf(base, edgeMat));

  const tileColor = new THREE.Color('#1a1a20').lerp(accent, 0.12);
  const wallColor = new THREE.Color('#24242c');

  for (const room of floor.rooms) {
    const tile = box(room.w - 0.1, 0.02, room.d - 0.1, tileColor);
    tile.position.set(room.x, 0.01, room.z);
    g.add(tile);

    if (floor.walls !== false) addWalls(g, room, wallColor, edgeMat);

    const label = makeLabel(room.name, '#f1f1ee', 0.65);
    label.position.set(room.x, WALL_H + 0.6, room.z);
    g.add(label);
  }

  for (const p of floor.props || []) {
    const color = p.color ? new THREE.Color(p.color) : accent;
    const mesh = box(p.w, p.h, p.d, color, p.color ? 0 : 0.4);
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

function addWalls(g, room, color, edgeMat) {
  const { x, z, w, d } = room;
  const doors = room.doors || [];
  const open = room.open || [];
  const hLen = w - 2 * INSET + WALL_T; // back / front walls
  const vLen = d - 2 * INSET - WALL_T; // left / right walls (fit between the others)

  const sides = [
    { id: 'n', cx: x, cz: z - d / 2 + INSET, len: hLen, alongX: true },
    { id: 's', cx: x, cz: z + d / 2 - INSET, len: hLen, alongX: true },
    { id: 'w', cx: x - w / 2 + INSET, cz: z, len: vLen, alongX: false },
    { id: 'e', cx: x + w / 2 - INSET, cz: z, len: vLen, alongX: false },
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
      g.add(wall, edgesOf(wall, edgeMat));
    }
  }
}

function box(w, h, d, color, emissive = 0) {
  const mat = new THREE.MeshLambertMaterial({ color, emissive: color, emissiveIntensity: emissive });
  return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
}

function edgesOf(mesh, mat) {
  const lines = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), mat);
  lines.position.copy(mesh.position);
  return lines;
}

function makeLabel(text, color, height) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const font = `700 56px ${FONT}`;
  ctx.font = font;
  canvas.width = Math.ceil(ctx.measureText(text).width) + 40;
  canvas.height = 88;
  ctx.font = font;
  ctx.fillStyle = 'rgba(10, 10, 11, 0.75)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 3);

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
