import java from './java/index.js';
import cloud from './cloud/index.js';

export { partsOf, chaptersOf } from '../game/parts.js';

// To add a kingdom: create a module with the same shape as java/index.js and list it here.
export const WORLDS = [java, cloud];
