// Single save for the whole game. Every change returns a new object so React can diff it.
// ponytail: localStorage only; swap loadSave/writeSave for an API call when cloud saves arrive.
export const SAVE_KEY = 'codeKingdoms.save.v1';
export const AVATAR_SLOTS = ['hair', 'shirt', 'pants', 'shoes'];
export const STYLES_PER_SLOT = 3;
const DRAFT_LIMIT = 20000;

const emptyWorld = () => ({ completed: 0, drafts: {}, attempts: {} });
const isObj = v => !!v && typeof v === 'object' && !Array.isArray(v);

export function emptySave(worlds) {
  return {
    version: 1,
    worlds: Object.fromEntries(worlds.map(w => [w.id, emptyWorld()])),
    avatar: Object.fromEntries(AVATAR_SLOTS.map(s => [s, 0])),
    flawless: [],
  };
}

function sanitizeWorld(raw, levels) {
  const base = emptyWorld();
  if (!isObj(raw)) return base;
  const completed = Number(raw.completed ?? raw.progress);
  if (Number.isFinite(completed)) base.completed = Math.max(0, Math.min(levels, Math.trunc(completed)));
  const validIndex = k => Number.isInteger(Number(k)) && Number(k) >= 0 && Number(k) < levels;
  for (const [k, v] of Object.entries(isObj(raw.drafts) ? raw.drafts : {}))
    if (validIndex(k) && typeof v === 'string' && v.length <= DRAFT_LIMIT) base.drafts[k] = v;
  for (const [k, v] of Object.entries(isObj(raw.attempts) ? raw.attempts : {}))
    if (validIndex(k) && Number.isFinite(Number(v)) && Number(v) >= 0) base.attempts[k] = Math.trunc(Number(v));
  return base;
}

export function sanitizeSave(raw, worlds) {
  const base = emptySave(worlds);
  if (!isObj(raw)) return base;
  for (const w of worlds) base.worlds[w.id] = sanitizeWorld(raw.worlds?.[w.id], w.levels.length);
  for (const slot of AVATAR_SLOTS) {
    const v = raw.avatar?.[slot];
    if (Number.isInteger(v) && v >= 0 && v < STYLES_PER_SLOT) base.avatar[slot] = v;
  }
  const valid = new Set(worlds.flatMap(w => w.levels.map((_, i) => `${w.id}:${i}`)));
  if (Array.isArray(raw.flawless)) base.flawless = [...new Set(raw.flawless.filter(k => valid.has(k)))];
  return base;
}

// Returns { save, ok }. ok:false means the browser refused storage (private window, blocked site data).
export function loadSave(storage, worlds) {
  if (!storage) return { save: emptySave(worlds), ok: false };
  let raw;
  try { raw = storage.getItem(SAVE_KEY); } catch { return { save: emptySave(worlds), ok: false }; }
  try { return { save: sanitizeSave(raw ? JSON.parse(raw) : null, worlds), ok: true }; }
  catch { return { save: emptySave(worlds), ok: true }; }
}

export function writeSave(storage, save) {
  if (!storage) return false;
  try { storage.setItem(SAVE_KEY, JSON.stringify(save)); return true; } catch { return false; }
}

const updateWorld = (save, id, fn) => ({ ...save, worlds: { ...save.worlds, [id]: fn(save.worlds[id]) } });

export function recordPass(save, id, i) {
  const w = save.worlds[id];
  let next = save;
  if (!w.attempts[i] && !save.flawless.includes(`${id}:${i}`)) next = { ...save, flawless: [...save.flawless, `${id}:${i}`] };
  if (i !== w.completed) return next;
  return updateWorld(next, id, ww => ({ ...ww, completed: ww.completed + 1 }));
}

export const recordFail = (save, id, i) =>
  updateWorld(save, id, w => ({ ...w, attempts: { ...w.attempts, [i]: (w.attempts[i] || 0) + 1 } }));

export const setDraft = (save, id, i, code) =>
  updateWorld(save, id, w => ({ ...w, drafts: { ...w.drafts, [i]: code } }));

export function setAvatar(save, slot, value) {
  if (!AVATAR_SLOTS.includes(slot) || !Number.isInteger(value) || value < 0 || value >= STYLES_PER_SLOT) return save;
  return { ...save, avatar: { ...save.avatar, [slot]: value } };
}

// Imports a progress file exported by the old standalone Java Quest / Cloud Quest.
export function importLegacy(save, world, raw) {
  if (!isObj(raw) || !('progress' in raw || 'drafts' in raw)) throw new Error('Ese archivo no parece un progreso exportado.');
  return updateWorld(save, world.id, () => sanitizeWorld(raw, world.levels.length));
}

export function partStatus(world, save, p) {
  const done = save.worlds[world.id].completed;
  const start = world.partSizes.slice(0, p).reduce((a, b) => a + b, 0);
  const end = start + world.partSizes[p];
  return done >= end ? 'done' : done >= start ? 'open' : 'locked';
}
