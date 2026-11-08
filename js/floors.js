// Floor plans. Edit layouts here.
//
// Units are meters. (0, 0) is the center of the floor.
//   x / z  = center of a room or prop (x = left/right, z = back/front, -z is the back)
//   w / d  = width (x) and depth (z)
//
// rooms:  rooms with walls
//   doors: sides with a door in the middle -> 'n' (back), 's' (front), 'w' (left), 'e' (right)
//   open:  sides without any wall
// props:  plain boxes as furniture (h = height, color optional, defaults to the accent)
// walls:  false = no walls at all (rooftop)
// note:   big label floating above the floor
//
// Room names and furniture are placeholders.

export const floors = [
  {
    id: 'basement',
    url: 'yoris://basement',
    music: 'techno / rave',
    line: 'lights low. bass high. see you at 5.',
    accent: '#ff2e4d',
    size: { w: 16, d: 12 },
    rooms: [
      { name: 'dancefloor', x: -2, z: 0, w: 12, d: 12, open: ['e'] },
      { name: 'dj booth', x: 6, z: -3, w: 4, d: 6, doors: ['w'] },
      { name: 'chill corner', x: 6, z: 3, w: 4, d: 6, doors: ['w'] },
    ],
    props: [
      // dj desk
      { x: 5.2, z: -3, w: 1, d: 2.4, h: 1 },
    ],
  },
  {
    id: 'ground',
    url: 'yoris://ground',
    music: 'house',
    line: 'house music and the kitchen. you know where this ends.',
    accent: '#ffb000',
    size: { w: 16, d: 12 },
    rooms: [
      { name: 'hallway', x: -6, z: 0, w: 4, d: 12, open: ['e'], doors: ['s'] },
      { name: 'living room', x: 2, z: -2.5, w: 12, d: 7, doors: ['w', 's'] },
      { name: 'kitchen = bar', x: 2, z: 3.5, w: 12, d: 5, doors: ['n', 'w'] },
    ],
    props: [
      // kitchen counter along the wall
      { x: 2, z: 5.3, w: 8, d: 0.8, h: 1 },
      // bar counter
      { x: 2, z: 2.8, w: 5, d: 1, h: 1.1 },
      // fridge
      { x: 7.2, z: 5.2, w: 0.9, d: 0.9, h: 2, color: '#e8e8f0' },
    ],
  },
  {
    id: 'first',
    url: 'yoris://first',
    music: 'white girl music',
    line: 'pop anthems, throwbacks, scream-along hits. no judgement.',
    accent: '#ff5ccd',
    size: { w: 16, d: 12 },
    rooms: [
      { name: 'hallway', x: 0, z: 0, w: 16, d: 3, open: ['n', 's'] },
      { name: 'bedroom', x: -4, z: -3.75, w: 8, d: 4.5, doors: ['s'] },
      { name: 'teen room', x: 4, z: -3.75, w: 8, d: 4.5, doors: ['s'] },
      { name: 'guest room', x: -4, z: 3.75, w: 8, d: 4.5, doors: ['n'] },
      { name: 'study', x: 4, z: 3.75, w: 8, d: 4.5, doors: ['n'] },
    ],
    props: [
      // bed
      { x: -4, z: -4.8, w: 2, d: 1.6, h: 0.5 },
    ],
  },
  {
    id: 'rooftop',
    url: 'yoris://rooftop',
    music: 'summer only',
    line: 'open air, no walls. closed when it’s cold.',
    accent: '#39f0a6',
    size: { w: 16, d: 12 },
    walls: false,
    note: 'summer only',
    rooms: [
      { name: 'terrace', x: 0, z: 0, w: 16, d: 12 },
    ],
    props: [
      { x: -4, z: -2, w: 3, d: 1, h: 0.45 },
      { x: 4, z: 2, w: 3, d: 1, h: 0.45 },
    ],
  },
];
