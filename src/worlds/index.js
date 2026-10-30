import java from './java/index.js';
import cloud from './cloud/index.js';

// To add a kingdom: create a module with the same shape as java/index.js and list it here.
export const WORLDS = [java, cloud];

export function partsOf(world) {
  const n = WORLDS.indexOf(world) + 1;
  let start = 0;
  return world.partSizes.map((size, p) => {
    const part = { index: p, label: `${n}-${p + 1}`, start, end: start + size };
    start += size;
    return part;
  });
}
