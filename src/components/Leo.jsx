import Pixels from './Pixels.jsx';
import { composeLeo } from '../game/avatar.js';

export default function Leo({ avatar, size = 4, className }) {
  const { rows, colors } = composeLeo(avatar);
  return <Pixels rows={rows} colors={colors} size={size} className={className} title="Leo" />;
}
