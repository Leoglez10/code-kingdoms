import { useEffect, useRef, useState } from 'react';
import { WORLDS, partsOf } from './worlds/index.js';
import {
  loadSave, writeSave, recordPass, recordFail, setDraft, setAvatar, importLegacy, partStatus,
} from './game/save.js';
import { achievementsFor, newlyUnlocked } from './game/achievements.js';
import WalkMap from './components/WalkMap.jsx';
import LevelPanel from './components/LevelPanel.jsx';
import Wardrobe from './components/Wardrobe.jsx';
import Achievements from './components/Achievements.jsx';
import Leo from './components/Leo.jsx';

const storage = (() => { try { return window.localStorage; } catch { return null; } })();
const initial = loadSave(storage, WORLDS);
const TOTAL_LEVELS = WORLDS.reduce((n, w) => n + w.levels.length, 0);

export default function App() {
  const [save, setSave] = useState(initial.save);
  const [storageOk, setStorageOk] = useState(initial.ok);
  const [screen, setScreen] = useState({ name: 'overworld' });
  const [level, setLevel] = useState(null); // { worldId, index }
  const [toasts, setToasts] = useState([]);
  const prev = useRef(save);

  // Persist every change and announce achievements unlocked by it.
  useEffect(() => {
    if (!writeSave(storage, save)) setStorageOk(false);
    const fresh = newlyUnlocked(WORLDS, prev.current, save);
    prev.current = save;
    if (fresh.length) setToasts(t => [...t, ...fresh]);
  }, [save]);

  useEffect(() => {
    if (!toasts.length) return;
    const timer = setTimeout(() => setToasts(t => t.slice(1)), 3500);
    return () => clearTimeout(timer);
  }, [toasts]);

  const world = WORLDS.find(w => w.id === (level?.worldId ?? screen.worldId));
  const go = s => setScreen(s);
  const achievements = achievementsFor(WORLDS, save);
  const mapProps = { avatar: save.avatar, active: !level };

  function onLevelContinue() {
    const { worldId } = level;
    setLevel(null);
    const w = WORLDS.find(x => x.id === worldId);
    // Clearing the last level of a part sends Leo back to the kingdom map, like finishing a stage.
    if (screen.name === 'part' && partStatus(w, save, screen.part) === 'done') go({ name: 'kingdom', worldId });
  }

  let title, body, back, help = 'Flechas / WASD para moverte · E, Espacio o Enter para entrar · también puedes hacer clic';
  if (screen.name === 'overworld') {
    title = 'CODE KINGDOMS';
    const done = WORLDS.reduce((n, w) => n + save.worlds[w.id].completed, 0);
    const stations = [
      ...WORLDS.map(w => {
        const c = save.worlds[w.id].completed;
        return { id: w.id, name: `${w.name} (${c}/${w.levels.length})`, color: w.color, status: c === w.levels.length ? 'done' : 'open', world: w };
      }),
      { id: 'soon', name: 'Próximamente', color: '#566c86', status: 'locked', lockedText: 'reino en construcción' },
    ];
    body = <WalkMap key="overworld" {...mapProps} stations={stations} kind="castle" theme="meadow"
      sign={{ title: 'CODE KINGDOMS', sub: 'elige un reino' }} score={`${done}/${TOTAL_LEVELS}`}
      onEnter={s => go({ name: 'kingdom', worldId: s.world.id })} />;
  } else if (screen.name === 'kingdom') {
    title = world.name.toUpperCase();
    back = { name: 'overworld' };
    const completed = save.worlds[world.id].completed;
    const parts = partsOf(world);
    const stations = parts.map(p => ({
      id: p.label, mark: p.label, part: p, color: world.color, status: partStatus(world, save, p.index),
      name: `Parte ${p.label}: ${world.levels[p.start].name}…`,
      lockedText: `completa la parte ${parts[p.index - 1]?.label}`,
    }));
    body = (
      <>
        <WalkMap key={`kingdom-${world.id}`} {...mapProps} stations={stations} kind="flag" theme={world.map.theme}
          sign={{ title: world.map.sign, sub: 'elige una parte' }} score={`${completed}/${world.levels.length}`}
          onEnter={s => go({ name: 'part', worldId: world.id, part: s.part.index })} />
        {completed === world.levels.length && (
          <div className="card victory" dangerouslySetInnerHTML={{ __html: `<h2>¡Completaste el ${world.name}!</h2>${world.victory}` }} />
        )}
      </>
    );
  } else if (screen.name === 'part') {
    const p = partsOf(world)[screen.part];
    title = `${world.map.sign} ${p.label}`;
    back = { name: 'kingdom', worldId: world.id };
    const completed = save.worlds[world.id].completed;
    const stations = world.levels.slice(p.start, p.end).map((lv, k) => {
      const i = p.start + k;
      const boss = i === world.levels.length - 1;
      return {
        id: String(i), index: i, mark: boss ? '!' : String(i + 1), name: `${i + 1}. ${lv.name}`,
        color: boss ? '#b13e53' : world.map.station === 'cloud' ? '#f4f4f4' : '#73eff7',
        status: i < completed ? 'done' : i === completed ? 'open' : 'locked',
        lockedText: `haz el nivel ${completed + 1}`,
      };
    });
    body = <WalkMap key={`part-${world.id}-${p.index}`} {...mapProps} stations={stations} kind={world.map.station}
      theme={world.map.theme} sign={{ title: `PARTE ${p.label}`, sub: world.map.trail }}
      score={`${Math.min(Math.max(completed - p.start, 0), p.end - p.start)}/${p.end - p.start}`}
      onEnter={s => setLevel({ worldId: world.id, index: s.index })} />;
  } else if (screen.name === 'wardrobe') {
    title = 'EL ARMARIO DE LEO';
    back = { name: 'overworld' };
    help = 'Elige un estilo para cada parte. Se guarda solo.';
    body = <Wardrobe avatar={save.avatar} onChange={(slot, v) => setSave(s => setAvatar(s, slot, v))} />;
  } else {
    title = 'LOGROS';
    back = { name: 'overworld' };
    help = 'Los logros se desbloquean solos mientras juegas.';
    body = <Achievements list={achievements} />;
  }

  return (
    <>
      <h1>{title}</h1>
      {body}
      <p className="help">{help}</p>
      <p className="help">Tu progreso se guarda solo en este navegador.</p>
      <div className="buttons">
        {back && <button className="secondary" onClick={() => go(back)}>◀ Volver</button>}
        <button className="secondary leo-btn" onClick={() => go({ name: 'wardrobe' })}><Leo avatar={save.avatar} size={2} /> Leo</button>
        <button className="secondary" onClick={() => go({ name: 'achievements' })}>🏆 Logros {achievements.filter(a => a.unlocked).length}/{achievements.length}</button>
        {screen.name === 'kingdom' && <LegacyImport world={world} onImport={raw => setSave(importLegacy(save, world, raw))} />}
      </div>
      {!storageOk && (
        <p className="warn">⚠ Este navegador no permite guardar (¿ventana privada o almacenamiento bloqueado?). Tu progreso se perderá al cerrar.</p>
      )}
      {level && (
        <LevelPanel key={`${level.worldId}-${level.index}`} world={world} index={level.index} save={save}
          onRun={pass => setSave(s => pass ? recordPass(s, level.worldId, level.index) : recordFail(s, level.worldId, level.index))}
          onDraft={code => setSave(s => setDraft(s, level.worldId, level.index, code))}
          onClose={() => setLevel(null)} onContinue={onLevelContinue} />
      )}
      <div className="toasts" aria-live="polite">
        {toasts.map((a, i) => <div key={a.id + i} className="toast">{a.icon} <b>¡Logro!</b> {a.title}</div>)}
      </div>
    </>
  );
}

// Loads a progress file exported by the old standalone Java Quest / Cloud Quest.
function LegacyImport({ world, onImport }) {
  const input = useRef(null);
  async function pick(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      onImport(JSON.parse(await file.text()));
      alert(`Progreso importado al ${world.name}.`);
    } catch (err) {
      alert(err instanceof SyntaxError ? 'Ese archivo no es JSON válido.' : err.message);
    }
  }
  return (
    <>
      <button className="secondary" onClick={() => input.current.click()}>⬆ Importar progreso anterior</button>
      <input ref={input} type="file" accept="application/json,.json" hidden onChange={pick} />
    </>
  );
}
