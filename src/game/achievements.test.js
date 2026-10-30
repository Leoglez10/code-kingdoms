import { describe, it, expect } from 'vitest';
import { achievementsFor, newlyUnlocked } from './achievements.js';
import { emptySave, recordPass, recordFail, setAvatar } from './save.js';

const WORLDS = [
  { id: 'java', name: 'Java', levels: Array(10).fill({}), partSizes: [4, 3, 3] },
  { id: 'cloud', name: 'Cloud', levels: Array(10).fill({}), partSizes: [4, 3, 3] },
];
const passAll = (s, id, n = 10) => { for (let i = 0; i < n; i++) s = recordPass(s, id, i); return s; };
const unlocked = s => achievementsFor(WORLDS, s).filter(a => a.unlocked).map(a => a.id);

describe('achievements', () => {
  it('has none unlocked on a fresh save', () => {
    expect(unlocked(emptySave(WORLDS))).toEqual([]);
  });

  it('lists one achievement per part and per kingdom', () => {
    const ids = achievementsFor(WORLDS, emptySave(WORLDS)).map(a => a.id);
    expect(ids).toEqual(expect.arrayContaining(['java-part-1', 'java-part-3', 'cloud-part-2', 'java-complete', 'cloud-complete']));
  });

  it('unlocks first step and part achievements as levels are cleared', () => {
    let s = recordPass(emptySave(WORLDS), 'java', 0);
    expect(unlocked(s)).toEqual(['first-step']);
    s = passAll(s, 'java', 4);
    expect(unlocked(s)).toContain('java-part-1');
    expect(unlocked(s)).not.toContain('java-part-2');
  });

  it('unlocks kingdom and polyglot achievements', () => {
    let s = passAll(emptySave(WORLDS), 'java');
    expect(unlocked(s)).toContain('java-complete');
    expect(unlocked(s)).not.toContain('polyglot');
    s = passAll(s, 'cloud');
    expect(unlocked(s)).toContain('polyglot');
  });

  it('unlocks flawless after 5 first-try passes, not with failures', () => {
    let s = passAll(emptySave(WORLDS), 'java', 4);
    expect(unlocked(s)).not.toContain('flawless');
    s = recordFail(s, 'java', 4);
    s = recordPass(s, 'java', 4);
    expect(unlocked(s)).not.toContain('flawless');
    s = recordPass(s, 'java', 5);
    expect(unlocked(s)).toContain('flawless');
  });

  it('unlocks stylist when Leo changes style', () => {
    expect(unlocked(setAvatar(emptySave(WORLDS), 'shoes', 1))).toEqual(['stylist']);
  });

  it('adds one achievement per world when a kingdom has several worlds', () => {
    const multi = [{ id: 'java', name: 'Java', levels: Array(6).fill({}), partSizes: [3, 3], chapters: [{ name: 'Uno', parts: 1 }, { name: 'Dos', parts: 1 }] }];
    let s = emptySave(multi);
    for (let i = 0; i < 3; i++) s = recordPass(s, 'java', i);
    const got = achievementsFor(multi, s);
    expect(got.find(a => a.id === 'java-world-1')).toMatchObject({ unlocked: true, title: 'Mundo 1: Uno' });
    expect(got.find(a => a.id === 'java-world-2').unlocked).toBe(false);
    expect(got.find(a => a.id === 'java-part-2').title).toBe('Parte 2-1');
    expect(achievementsFor(WORLDS, emptySave(WORLDS)).some(a => a.id.includes('-world-'))).toBe(false);
  });

  it('reports only achievements newly unlocked between two saves', () => {
    const before = passAll(emptySave(WORLDS), 'java', 3);
    const after = recordPass(before, 'java', 3);
    expect(newlyUnlocked(WORLDS, before, after).map(a => a.id)).toEqual(['java-part-1']);
  });
});
