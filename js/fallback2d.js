// 2D fallback (SVG, top-down) when WebGL or the CDN isn't available.
// Uses the same data as the 3D view.
const NS = 'http://www.w3.org/2000/svg';

export function createFallback(container) {
  container.classList.add('is-2d');
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('role', 'img');
  container.appendChild(svg);

  function el(name, attrs, text) {
    const node = document.createElementNS(NS, name);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
    if (text) node.textContent = text;
    svg.appendChild(node);
    return node;
  }

  function show(floor) {
    const { w, d } = floor.size;
    svg.replaceChildren();
    svg.setAttribute('viewBox', `${-w / 2 - 1} ${-d / 2 - 1} ${w + 2} ${d + 2}`);
    svg.setAttribute('aria-label', `floor plan of ${floor.url}`);

    el('rect', { x: -w / 2, y: -d / 2, width: w, height: d, fill: '#111116', stroke: floor.accent, 'stroke-width': 0.06 });

    for (const r of floor.rooms) {
      el('rect', {
        x: r.x - r.w / 2 + 0.1, y: r.z - r.d / 2 + 0.1, width: r.w - 0.2, height: r.d - 0.2,
        fill: 'none',
        stroke: floor.walls === false ? '#55555c' : floor.accent,
        'stroke-width': 0.08,
        'stroke-dasharray': floor.walls === false ? '0.3 0.3' : 'none',
      });
    }
    for (const p of floor.props || []) {
      el('rect', { x: p.x - p.w / 2, y: p.z - p.d / 2, width: p.w, height: p.d, fill: p.color || floor.accent, opacity: 0.85 });
    }
    for (const r of floor.rooms) {
      el('text', { x: r.x, y: r.z, class: 'plan-label' }, r.name);
    }
    if (floor.note) {
      el('text', { x: 0, y: -d / 2 + 1.6, class: 'plan-note', fill: floor.accent }, floor.note);
    }
  }

  return { show };
}
