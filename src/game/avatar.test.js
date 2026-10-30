import { describe, it, expect } from 'vitest';
import { STYLES, composeLeo } from './avatar.js';
import { AVATAR_SLOTS, STYLES_PER_SLOT } from './save.js';

describe('Leo avatar', () => {
  it('offers 3 styles for hair, shirt, pants and shoes', () => {
    for (const slot of AVATAR_SLOTS) expect(STYLES[slot]).toHaveLength(STYLES_PER_SLOT);
  });

  it('composes a 12x14 sprite for every combination with a color for every pixel', () => {
    for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) {
      const { rows, colors } = composeLeo({ hair: a, shirt: b, pants: a, shoes: b });
      expect(rows).toHaveLength(14);
      for (const r of rows) {
        expect(r).toHaveLength(12);
        for (const c of r) if (c !== '.') expect(colors[c], `missing color ${c}`).toBeTruthy();
      }
    }
  });

  it('makes each style visibly different', () => {
    for (const slot of AVATAR_SLOTS) {
      const looks = [0, 1, 2].map(v => JSON.stringify(composeLeo({ hair: 0, shirt: 0, pants: 0, shoes: 0, [slot]: v })));
      expect(new Set(looks).size).toBe(3);
    }
  });
});
