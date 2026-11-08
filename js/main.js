import { floors } from './floors.js';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

runLoader();
startClock();
setupSound();
setupFloors();

// [00] loader: counts 0 -> 100, gone in under 2 seconds
function runLoader() {
  const loader = document.querySelector('#loader');
  if (!loader) return;
  const percent = loader.querySelector('[data-percent]');

  if (reduceMotion) {
    loader.remove();
    return;
  }

  const DURATION = 1300;
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min(1, (now - start) / DURATION);
    percent.textContent = String(Math.round((1 - (1 - t) ** 2) * 100));
    if (t < 1) {
      requestAnimationFrame(tick);
    } else {
      loader.classList.add('is-done');
      setTimeout(() => loader.remove(), 400);
    }
  };
  requestAnimationFrame(tick);
}

// live clock, visitor's local time
function startClock() {
  const el = document.querySelector('#clock');
  if (!el) return;
  const fmt = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const update = () => {
    const now = new Date();
    el.textContent = fmt.format(now);
    el.dateTime = now.toISOString();
    setTimeout(update, 1000 - now.getMilliseconds());
  };
  update();
}

// sound toggle: just the switch for now, no audio yet
function setupSound() {
  const btn = document.querySelector('#sound');
  if (!btn) return;
  let on = false;
  btn.addEventListener('click', () => {
    on = !on;
    btn.setAttribute('aria-pressed', String(on));
    btn.textContent = `[sound: ${on ? 'on' : 'off'}]`;
    // hook up audio here later
  });
}

// [03] floors: buttons + 3D view (or 2D fallback)
async function setupFloors() {
  const view = document.querySelector('#floor-view');
  const list = document.querySelector('#floor-list');
  const info = document.querySelector('#floor-info');
  if (!view || !list) return;

  const buttons = [];
  let current = floors.find((f) => f.id === 'ground') || floors[0];
  let viewer = null;

  function select(floor) {
    current = floor;
    document.documentElement.style.setProperty('--accent', floor.accent);
    for (const b of buttons) b.setAttribute('aria-pressed', String(b.dataset.id === floor.id));
    info.querySelector('[data-url]').textContent = floor.url;
    info.querySelector('[data-music]').textContent = floor.music;
    info.querySelector('[data-line]').textContent = floor.line;
    viewer?.show(floor);
  }

  // top to bottom, like a house
  for (const floor of [...floors].reverse()) {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'floor-btn';
    btn.dataset.id = floor.id;
    btn.style.setProperty('--floor', floor.accent);
    btn.innerHTML = '<span class="floor-btn__url"></span><span class="floor-btn__music"></span>';
    btn.querySelector('.floor-btn__url').textContent = floor.url;
    btn.querySelector('.floor-btn__music').textContent = floor.music;
    btn.addEventListener('click', () => select(floor));
    buttons.push(btn);
    li.appendChild(btn);
    list.appendChild(li);
  }
  select(current);

  if (hasWebGL()) {
    try {
      await document.fonts?.ready; // so 3D labels use the mono font
      const { createFloorplan } = await import('./floorplan.js');
      viewer = createFloorplan(view);
    } catch (err) {
      console.warn('3D view failed, using 2D fallback.', err);
      view.replaceChildren();
    }
  }
  if (!viewer) {
    const { createFallback } = await import('./fallback2d.js');
    viewer = createFallback(view);
    document.querySelector('#floor-hint').textContent = '// 2d view. your browser skipped the 3d.';
  }
  viewer.show(current);
}

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    return false;
  }
}
