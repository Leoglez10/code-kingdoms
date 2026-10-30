import { describe, it, expect } from 'vitest';
import { COLS, ROWS, isPath, stationTiles } from './layout.js';

const besidePath = ([x, y]) => [[0, 1], [0, -1], [1, 0], [-1, 0]].some(([dx, dy]) => isPath(x + dx, y + dy));

describe('map layout', () => {
  it('reproduces the original 10-station U layout closely', () => {
    const t = stationTiles(10);
    expect(t[0]).toEqual([1, 2]);
    expect(t[9]).toEqual([1, 9]);
    expect(t.filter(([, y]) => y === 2)).toHaveLength(4);
  });

  for (const n of [1, 3, 4, 10]) {
    it(`places ${n} stations inside the map, beside the path, never overlapping`, () => {
      const t = stationTiles(n);
      expect(t).toHaveLength(n);
      expect(new Set(t.map(String)).size).toBe(n);
      for (const [x, y] of t) {
        expect(x >= 0 && x < COLS && y >= 0 && y < ROWS).toBe(true);
        expect(isPath(x, y)).toBe(false);
        expect(besidePath([x, y])).toBe(true);
      }
    });
  }
});
