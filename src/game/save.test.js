import { describe, it, expect } from 'vitest';
import {
  SAVE_KEY, emptySave, sanitizeSave, loadSave, writeSave,
  recordPass, recordFail, setDraft, setAvatar, importLegacy, partStatus,
} from './save.js';

const WORLDS = [
  { id: 'java', levels: Array(10).fill({}), partSizes: [4, 3, 3] },
  { id: 'cloud', levels: Array(10).fill({}), partSizes: [4, 3, 3] },
];

const memoryStorage = (init = {}) => {
  const data = { ...init };
  return { getItem: k => data[k] ?? null, setItem: (k, v) => { data[k] = v; }, data };
};

describe('save model', () => {
  it('starts every world at level 0 with default avatar', () => {
    const s = emptySave(WORLDS);
    expect(s.worlds.java).toEqual({ completed: 0, drafts: {}, attempts: {} });
    expect(s.avatar).toEqual({ hair: 0, shirt: 0, pants: 0, shoes: 0 });
    expect(s.flawless).toEqual([]);
  });

  it('sanitizes garbage, out-of-range values and unknown worlds', () => {
    const s = sanitizeSave({
      worlds: { java: { completed: 99, drafts: { 0: 'x', 50: 'y', 1: 7 }, attempts: { 2: -1, 3: 2.7 } }, ruby: { completed: 3 } },
      avatar: { hair: 2, shirt: 9, pants: 'a' },
      flawless: ['java:0', 'nope', 'java:0'],
    }, WORLDS);
    expect(s.worlds.java).toEqual({ completed: 10, drafts: { 0: 'x' }, attempts: { 3: 2 } });
    expect(s.worlds.ruby).toBeUndefined();
    expect(s.avatar).toEqual({ hair: 2, shirt: 0, pants: 0, shoes: 0 });
    expect(s.flawless).toEqual(['java:0']);
    expect(sanitizeSave('nope', WORLDS)).toEqual(emptySave(WORLDS));
  });

  it('round-trips through storage and survives corrupt or blocked storage', () => {
    const storage = memoryStorage();
    const s = recordPass(emptySave(WORLDS), 'java', 0);
    expect(writeSave(storage, s)).toBe(true);
    expect(loadSave(storage, WORLDS)).toEqual({ save: s, ok: true });
    expect(loadSave(memoryStorage({ [SAVE_KEY]: '{bad' }), WORLDS).save).toEqual(emptySave(WORLDS));
    expect(loadSave(null, WORLDS).ok).toBe(false);
    expect(writeSave({ setItem() { throw new Error('quota'); } }, s)).toBe(false);
  });
});

describe('progress', () => {
  it('advances only when the next open level is passed', () => {
    let s = recordPass(emptySave(WORLDS), 'java', 0);
    expect(s.worlds.java.completed).toBe(1);
    s = recordPass(s, 'java', 0);
    expect(s.worlds.java.completed).toBe(1);
    s = recordPass(s, 'java', 5);
    expect(s.worlds.java.completed).toBe(1);
  });

  it('marks a level flawless only when passed with no failed attempts', () => {
    let s = recordPass(emptySave(WORLDS), 'java', 0);
    s = recordFail(s, 'java', 1);
    s = recordPass(s, 'java', 1);
    expect(s.flawless).toEqual(['java:0']);
    expect(s.worlds.java.attempts).toEqual({ 1: 1 });
  });

  it('does not mutate the previous save', () => {
    const a = emptySave(WORLDS);
    const b = setDraft(recordFail(a, 'java', 0), 'java', 0, 'code');
    expect(a.worlds.java).toEqual({ completed: 0, drafts: {}, attempts: {} });
    expect(b.worlds.java.drafts[0]).toBe('code');
  });

  it('computes part status from completed levels', () => {
    let s = emptySave(WORLDS);
    expect([0, 1, 2].map(p => partStatus(WORLDS[0], s, p))).toEqual(['open', 'locked', 'locked']);
    for (let i = 0; i < 4; i++) s = recordPass(s, 'java', i);
    expect([0, 1, 2].map(p => partStatus(WORLDS[0], s, p))).toEqual(['done', 'open', 'locked']);
  });

  it('changes one avatar slot within 0..2', () => {
    const s = setAvatar(emptySave(WORLDS), 'hair', 2);
    expect(s.avatar.hair).toBe(2);
    expect(setAvatar(s, 'hair', 3).avatar.hair).toBe(2);
    expect(setAvatar(s, 'hat', 1).avatar).toEqual(s.avatar);
  });
});

describe('legacy import', () => {
  it('imports a Java Quest / Cloud Quest export into one world', () => {
    const legacy = { version: 2, progress: 10, drafts: { 3: 'int x;' }, attempts: { 1: 4 } };
    const s = importLegacy(emptySave(WORLDS), WORLDS[0], legacy);
    expect(s.worlds.java).toEqual({ completed: 10, drafts: { 3: 'int x;' }, attempts: { 1: 4 } });
    expect(s.worlds.cloud.completed).toBe(0);
  });

  it('rejects files that are not a progress export', () => {
    expect(() => importLegacy(emptySave(WORLDS), WORLDS[0], { foo: 1 })).toThrow(/progreso/);
  });
});
