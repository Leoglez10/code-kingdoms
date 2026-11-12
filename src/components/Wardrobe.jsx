import { useState } from 'react';
import Leo from './Leo.jsx';
import { STYLES } from '../game/avatar.js';
import { AVATAR_SLOTS, NAME_LIMIT } from '../game/save.js';

const SLOT_NAMES = { hair: 'Pelo', shirt: 'Ropa', pants: 'Pantalón', shoes: 'Zapatos' };

export default function Wardrobe({ avatar, name, onName, onChange }) {
  // Local text so spaces survive while typing; the save keeps the cleaned name.
  const [draft, setDraft] = useState(name);
  return (
    <section className="card wardrobe">
      <div className="wardrobe-preview">
        <Leo avatar={avatar} size={12} />
        <label className="wardrobe-name">
          <span>Nombre</span>
          <input value={draft} maxLength={NAME_LIMIT} autoComplete="off" spellCheck={false}
            onChange={e => { setDraft(e.target.value); onName(e.target.value); }}
            onBlur={() => setDraft(name)} />
        </label>
      </div>
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
