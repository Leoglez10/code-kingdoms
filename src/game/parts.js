// A kingdom is split into chapters (worlds 1, 2, 3…) and each chapter into parts (1-1, 1-2…).
// A kingdom without `chapters` is a single chapter holding all its parts.
export function chaptersOf(world) {
  const chapters = world.chapters ?? [{ name: world.name, parts: world.partSizes.length }];
  let p = 0, level = 0;
  return chapters.map((c, ci) => {
    const parts = world.partSizes.slice(p, p + c.parts).map((size, k) => {
      const part = { index: p + k, chapter: ci, label: `${ci + 1}-${k + 1}`, start: level, end: level + size };
      level += size;
      return part;
    });
    p += c.parts;
    return { index: ci, name: c.name, parts, start: parts[0].start, end: parts.at(-1).end };
  });
}

export const partsOf = world => chaptersOf(world).flatMap(c => c.parts);

export function chapterStatus(world, save, c) {
  const { start, end } = chaptersOf(world)[c];
  const done = save.worlds[world.id].completed;
  return done >= end ? 'done' : done >= start ? 'open' : 'locked';
}
