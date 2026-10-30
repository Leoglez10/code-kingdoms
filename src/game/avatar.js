// Leo is a 12x14 pixel sprite. Each style overlays some rows: '.' keeps the base pixel,
// any other char paints it with that style's color for the char.
const BASE = [
  '............',
  '............',
  '...ssssss...',
  '..sesssses..',
  '..ssssssss..',
  '...ssmmss...',
  '...cccccc...',
  '..cccccccc..',
  '.sccccccccs.',
  '.s.cccccc.s.',
  '...pppppp...',
  '...pp..pp...',
  '...pp..pp...',
  '..ooo..ooo..',
];

const BASE_COLORS = { s: '#f2c79b', e: '#1a1c2c', m: '#b13e53', w: '#f4f4f4' };

export const STYLES = {
  hair: [
    { name: 'Corto', colors: { h: '#5d3a1a' }, rows: { 0: '...hhhhhh...', 1: '..hhhhhhhh..', 2: '..h......h..' } },
    { name: 'Puntiagudo', colors: { h: '#1a1c2c' }, rows: { 0: '..h.h..h.h..', 1: '..hhhhhhhh..', 2: '..hh.hh.hh..' } },
    {
      name: 'Largo', colors: { h: '#b13e53' },
      rows: { 0: '...hhhhhh...', 1: '..hhhhhhhh..', 2: '.hh......hh.', 3: '.h........h.', 4: '.h........h.', 5: '.hh......hh.' },
    },
  ],
  shirt: [
    { name: 'Camiseta', colors: { c: '#ef7d57' }, rows: {} },
    { name: 'Sudadera', colors: { c: '#38b764' }, rows: { 6: '..cccccccc..', 7: '..ccwccwcc..', 8: '.cccccccccc.', 9: '.c.cccccc.c.' } },
    { name: 'Chaqueta', colors: { c: '#3b5dc9' }, rows: { 7: '..ccwwwwcc..', 8: '.cccwwwwccc.', 9: '.c.cwwwwc.c.' } },
  ],
  pants: [
    { name: 'Jeans', colors: { p: '#41a6f6' }, rows: {} },
    { name: 'Shorts', colors: { p: '#a0783f' }, rows: { 12: '...ss..ss...' } },
    { name: 'Joggers', colors: { p: '#333c57' }, rows: { 12: '...ww..ww...' } },
  ],
  shoes: [
    { name: 'Tenis', colors: { o: '#b13e53' }, rows: { 13: '..oow..oow..' } },
    { name: 'Botas', colors: { o: '#5d3a1a' }, rows: { 12: '...oo..oo...', 13: '..ooo..ooo..' } },
    { name: 'Sandalias', colors: { o: '#a0783f' }, rows: { 13: '..sos..sos..' } },
  ],
};

// Later slots win where rows overlap (boots cover the pants' bottom row).
const ORDER = ['pants', 'shoes', 'shirt', 'hair'];

export function composeLeo(avatar) {
  const rows = BASE.map(r => [...r]);
  const colors = { ...BASE_COLORS };
  for (const slot of ORDER) {
    const style = STYLES[slot][avatar[slot]] ?? STYLES[slot][0];
    Object.assign(colors, style.colors);
    for (const [y, row] of Object.entries(style.rows))
      [...row].forEach((c, x) => { if (c !== '.') rows[y][x] = c; });
  }
  return { rows: rows.map(r => r.join('')), colors };
}
