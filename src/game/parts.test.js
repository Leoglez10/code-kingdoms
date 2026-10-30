import { describe, it, expect } from 'vitest';
import { chaptersOf, partsOf, chapterStatus } from './parts.js';
import { emptySave, recordPass } from './save.js';

const multi = { id: 'java', levels: Array(7).fill({}), partSizes: [2, 2, 3], chapters: [{ name: 'A', parts: 2 }, { name: 'B', parts: 1 }] };
const single = { id: 'cloud', name: 'Nube', levels: Array(10).fill({}), partSizes: [4, 3, 3] };

describe('chapters and parts', () => {
  it('numbers parts by chapter like 1-1, 1-2, 2-1', () => {
    expect(partsOf(multi).map(p => [p.label, p.start, p.end])).toEqual([['1-1', 0, 2], ['1-2', 2, 4], ['2-1', 4, 7]]);
  });

  it('gives each chapter its name, parts and level range', () => {
    const [a, b] = chaptersOf(multi);
    expect([a.name, a.start, a.end, a.parts.length]).toEqual(['A', 0, 4, 2]);
    expect([b.name, b.start, b.end, b.parts[0].index]).toEqual(['B', 4, 7, 2]);
  });

  it('treats a kingdom without chapters as one chapter', () => {
    const cs = chaptersOf(single);
    expect(cs).toHaveLength(1);
    expect(cs[0].parts.map(p => p.label)).toEqual(['1-1', '1-2', '1-3']);
  });

  it('unlocks a chapter only when the previous one is complete', () => {
    let s = emptySave([multi]);
    expect([0, 1].map(c => chapterStatus(multi, s, c))).toEqual(['open', 'locked']);
    for (let i = 0; i < 4; i++) s = recordPass(s, 'java', i);
    expect([0, 1].map(c => chapterStatus(multi, s, c))).toEqual(['done', 'open']);
  });
});
