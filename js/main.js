import { floors } from './floors.js';

const section = document.querySelector('#stockwerke');
const view = document.querySelector('#floor-view');
const list = document.querySelector('#floor-list');
const START = 'eg';

// 3D separat laden: Wenn CDN oder WebGL nicht gehen, funktionieren die Buttons trotzdem.
let plan = null;
try {
  const { createFloorplan } = await import('./floorplan.js');
  plan = createFloorplan(view);
} catch (err) {
  console.error(err);
  view.innerHTML = '<p class="floor-view__error">3D-Ansicht konnte nicht geladen werden.</p>';
}

const buttons = [];

function select(floor) {
  section.style.setProperty('--floor-accent', floor.accent);
  for (const b of buttons) b.setAttribute('aria-pressed', String(b.dataset.id === floor.id));
  plan?.show(floor);
}

// Von oben nach unten anzeigen, wie bei einem Haus
for (const floor of [...floors].reverse()) {
  const li = document.createElement('li');
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'floor-btn';
  btn.dataset.id = floor.id;
  btn.style.setProperty('--accent', floor.accent);
  btn.innerHTML = '<span class="floor-btn__name"></span><span class="floor-btn__music"></span>';
  btn.querySelector('.floor-btn__name').textContent = floor.name;
  btn.querySelector('.floor-btn__music').textContent = floor.music;
  btn.addEventListener('click', () => select(floor));
  buttons.push(btn);
  li.appendChild(btn);
  list.appendChild(li);
}

select(floors.find((f) => f.id === START) || floors[0]);
