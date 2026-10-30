import { chaptersOf, chapterStatus } from './parts.js';
import { partStatus } from './save.js';

// Achievements are derived from the save, so they never drift out of sync with progress.
export function achievementsFor(worlds, save) {
  const total = id => save.worlds[id].completed;
  const complete = w => total(w.id) === w.levels.length;
  const list = [
    { id: 'first-step', icon: '👣', title: 'Primer paso', desc: 'Supera tu primer nivel.', unlocked: worlds.some(w => total(w.id) > 0) },
  ];
  for (const w of worlds) {
    const chapters = chaptersOf(w);
    for (const c of chapters) {
      for (const p of c.parts) list.push({
        id: `${w.id}-part-${p.index + 1}`, icon: '🚩', title: `Parte ${p.label}`,
        desc: `Completa la parte ${p.label} del ${w.name}.`, unlocked: partStatus(w, save, p.index) === 'done',
      });
      if (chapters.length > 1) list.push({
        id: `${w.id}-world-${c.index + 1}`, icon: '🏰', title: `Mundo ${c.index + 1}: ${c.name}`,
        desc: `Completa el mundo ${c.index + 1} del ${w.name}.`, unlocked: chapterStatus(w, save, c.index) === 'done',
      });
    }
    list.push({ id: `${w.id}-complete`, icon: '👑', title: `Dueño del ${w.name}`, desc: `Completa todo el ${w.name}.`, unlocked: complete(w) });
  }
  list.push(
    { id: 'flawless', icon: '🎯', title: 'Sin tropiezos', desc: 'Supera 5 niveles al primer intento.', unlocked: save.flawless.length >= 5 },
    { id: 'stylist', icon: '🎨', title: 'Con estilo', desc: 'Cambia la ropa o el pelo de Leo.', unlocked: Object.values(save.avatar).some(v => v !== 0) },
    { id: 'polyglot', icon: '🌍', title: 'Políglota', desc: 'Completa todos los reinos.', unlocked: worlds.every(complete) },
  );
  return list;
}

export function newlyUnlocked(worlds, before, after) {
  const had = new Set(achievementsFor(worlds, before).filter(a => a.unlocked).map(a => a.id));
  return achievementsFor(worlds, after).filter(a => a.unlocked && !had.has(a.id));
}
