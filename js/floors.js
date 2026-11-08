// Grundrisse der Stockwerke – hier anpassen.
//
// Maße in Metern. Der Ursprung (0, 0) ist die Mitte des Stockwerks.
//   x / z  = Mittelpunkt (x = links/rechts, z = vorne/hinten, -z ist hinten)
//   w / d  = Breite (x) und Tiefe (z)
//
// rooms:  Räume mit Wänden.
//   doors: Seiten mit Tür in der Mitte  -> 'n' (hinten), 's' (vorne), 'w' (links), 'o' (rechts)
//   open:  Seiten ganz ohne Wand
// props:  einfache Boxen als Möbel (h = Höhe, color optional, sonst Akzentfarbe)
// walls:  false = keine Wände (z. B. Dachterrasse)
// note:   großer Hinweis über dem Stockwerk
//
// Raumnamen sind Platzhalter.

export const floors = [
  {
    id: 'keller',
    name: 'Keller',
    music: 'Techno / Rave',
    accent: '#ff2e63',
    size: { w: 16, d: 12 },
    rooms: [
      { name: 'Tanzfläche', x: -2, z: 0, w: 12, d: 12, open: ['o'] },
      { name: 'DJ-Pult', x: 6, z: -3, w: 4, d: 6, doors: ['w'] },
      { name: 'Chill-Ecke', x: 6, z: 3, w: 4, d: 6, doors: ['w'] },
    ],
    props: [
      { x: 5.2, z: -3, w: 1, d: 2.4, h: 1 },
    ],
  },
  {
    id: 'eg',
    name: 'Erdgeschoss',
    music: 'House',
    accent: '#ffb000',
    size: { w: 16, d: 12 },
    rooms: [
      { name: 'Flur', x: -6, z: 0, w: 4, d: 12, open: ['o'], doors: ['s'] },
      { name: 'Wohnzimmer', x: 2, z: -2.5, w: 12, d: 7, doors: ['w', 's'] },
      { name: 'Küche = Bar', x: 2, z: 3.5, w: 12, d: 5, doors: ['n', 'w'] },
    ],
    props: [
      // Küchenzeile an der Wand
      { x: 2, z: 5.3, w: 8, d: 0.8, h: 1 },
      // Tresen
      { x: 2, z: 2.8, w: 5, d: 1, h: 1.1 },
      // Kühlschrank
      { x: 7.2, z: 5.2, w: 0.9, d: 0.9, h: 2, color: '#e8e8f0' },
    ],
  },
  {
    id: 'og1',
    name: '1. Stock',
    music: 'White Girl Music',
    accent: '#ff6ad5',
    size: { w: 16, d: 12 },
    rooms: [
      { name: 'Flur', x: 0, z: 0, w: 16, d: 3, open: ['n', 's'] },
      { name: 'Schlafzimmer', x: -4, z: -3.75, w: 8, d: 4.5, doors: ['s'] },
      { name: 'Jugendzimmer', x: 4, z: -3.75, w: 8, d: 4.5, doors: ['s'] },
      { name: 'Gästezimmer', x: -4, z: 3.75, w: 8, d: 4.5, doors: ['n'] },
      { name: 'Arbeitszimmer', x: 4, z: 3.75, w: 8, d: 4.5, doors: ['n'] },
    ],
    props: [
      // Bett
      { x: -4, z: -4.8, w: 2, d: 1.6, h: 0.5 },
    ],
  },
  {
    id: 'dach',
    name: 'Dachterrasse',
    music: 'Nur im Sommer',
    accent: '#38e8a8',
    size: { w: 16, d: 12 },
    walls: false,
    note: 'Nur im Sommer',
    rooms: [
      { name: 'Terrasse', x: 0, z: 0, w: 16, d: 12 },
    ],
    props: [
      { x: -4, z: -2, w: 3, d: 1, h: 0.45 },
      { x: 4, z: 2, w: 3, d: 1, h: 0.45 },
    ],
  },
];
