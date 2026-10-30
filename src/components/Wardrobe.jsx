import Leo from './Leo.jsx';
import { STYLES } from '../game/avatar.js';
import { AVATAR_SLOTS } from '../game/save.js';

const SLOT_NAMES = { hair: 'Pelo', shirt: 'Ropa', pants: 'Pantalón', shoes: 'Zapatos' };

export default function Wardrobe({ avatar, onChange }) {
  return (
    <section className="screen-card wardrobe">
      <div className="wardrobe-preview"><Leo avatar={avatar} size={12} /></div>
      <div className="wardrobe-slots">
        {AVATAR_SLOTS.map(slot => (
          <fieldset key={slot}>
            <legend>{SLOT_NAMES[slot]}</legend>
            {STYLES[slot].map((style, v) => (
              <button key={style.name} className={`style-option ${avatar[slot] === v ? 'chosen' : ''}`}
                aria-pressed={avatar[slot] === v} onClick={() => onChange(slot, v)}>
                <Leo avatar={{ ...avatar, [slot]: v }} size={3} />
                <span>{style.name}</span>
              </button>
            ))}
          </fieldset>
        ))}
      </div>
    </section>
  );
}
