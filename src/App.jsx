import { useEffect, useRef, useState } from 'react';
import { WORLDS, partsOf } from './worlds/index.js';
import {
  loadSave, writeSave, recordPass, recordFail, setDraft, setAvatar, importLegacy, partStatus,
} from './game/save.js';
import { achievementsFor, newlyUnlocked } from './game/achievements.js';
import PathMap from './components/PathMap.jsx';
import Pixels, { CASTLE, GEM } from './components/Pixels.jsx';
import LevelPanel from './components/LevelPanel.jsx';
import Wardrobe from './components/Wardrobe.jsx';
import Achievements from './components/Achievements.jsx';
import Leo from './components/Leo.jsx';

const storage = (() => { try { return window.localStorage; } catch { return null; } })();
const initial = loadSave(storage, WORLDS);

const STATUS_COLORS = { done: '#a7f070', locked: '#566c86' };
const castle = (color, status) =>
  <Pixels rows={CASTLE} colors={{ k: STATUS_COLORS[status] ?? color, d: '#1a1c2c' }} size={5} />;
const gem = (color, status) =>
  <Pixels rows={GEM} colors={{ g: STATUS_COLORS[status] ?? color, w: '#f4f4f4' }} size={5} className={status === 'open' ? 'bob' : ''} />;

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

  function onLevelContinue() {
    const { worldId } = level;
    setLevel(null);
    const w = WORLDS.find(x => x.id === worldId);
    // Clearing the last level of a part sends Leo back to the kingdom map, like finishing a stage.
    if (screen.name === 'part' && partStatus(w, save, screen.part) === 'done') go({ name: 'kingdom', worldId });
  }

  let title, body, back;
  if (screen.name === 'overworld') {
    title = 'CODE KINGDOMS';
    const nodes = [
      ...WORLDS.map(w => {
        const done = save.worlds[w.id].completed;
        return {
          id: w.id, label: w.name, title: w.name, sub: `${done}/${w.levels.length} · ${w.tagline}`,
          status: done === w.levels.length ? 'done' : 'open', icon: castle(w.color, done === w.levels.length ? 'done' : 'open'), world: w,
        };
      }),
      { id: 'soon', label: 'Próximamente', status: 'locked', lockedText: 'Nuevo reino en construcción', icon: castle('#566c86', 'locked') },
    ];
    body = <PathMap key="overworld" nodes={nodes} avatar={save.avatar} active={!level}
      caption="Elige un reino" onEnter={n => go({ name: 'kingdom', worldId: n.world.id })} />;
  } else if (screen.name === 'kingdom') {
    title = world.name;
    back = { name: 'overworld' };
    const done = save.worlds[world.id].completed === world.levels.length;
    const nodes = partsOf(world).map(p => {
      const status = partStatus(world, save, p.index);
      return {
        id: p.label, label: p.label, title: `Parte ${p.label}`, part: p,
        sub: world.levels.slice(p.start, p.end).map(l => l.name).join(' · '),
        status, lockedText: `Completa la parte ${partsOf(world)[p.index - 1]?.label} primero`,
        icon: <span className="flag" style={{ '--kingdom': STATUS_COLORS[status] ?? world.color }}>🚩</span>,
      };
    });
    body = (
      <>
        <PathMap key={`kingdom-${world.id}`} nodes={nodes} avatar={save.avatar} active={!level}
          theme={world.id} onEnter={n => go({ name: 'part', worldId: world.id, part: n.part.index })} />
        {done && <div className="screen-card victory" dangerouslySetInnerHTML={{ __html: `<h3>¡Completaste el ${world.name}!</h3>${world.victory}` }} />}
        <LegacyImport world={world} onImport={raw => setSave(importLegacy(save, world, raw))} />
      </>
    );
  } else if (screen.name === 'part') {
    const p = partsOf(world)[screen.part];
    title = `${world.name} · ${p.label}`;
    back = { name: 'kingdom', worldId: world.id };
    const completed = save.worlds[world.id].completed;
    const nodes = world.levels.slice(p.start, p.end).map((lv, k) => {
      const i = p.start + k;
      const status = i < completed ? 'done' : i === completed ? 'open' : 'locked';
      const boss = i === world.levels.length - 1;
      return {
        id: String(i), label: boss ? '!' : String(i + 1), title: `${i + 1}. ${lv.name}`, index: i, status,
        lockedText: `Haz primero el nivel ${completed + 1}`, icon: gem(boss ? '#b13e53' : world.color, status),
      };
    });
    body = <PathMap key={`part-${world.id}-${p.index}`} nodes={nodes} avatar={save.avatar} active={!level}
      theme={world.id} onEnter={n => setLevel({ worldId: world.id, index: n.index })} />;
  } else if (screen.name === 'wardrobe') {
    title = 'El armario de Leo';
    back = { name: 'overworld' };
    body = <Wardrobe avatar={save.avatar} onChange={(slot, v) => setSave(s => setAvatar(s, slot, v))} />;
  } else {
    title = 'Logros';
    back = { name: 'overworld' };
    body = <Achievements list={achievements} />;
  }

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  return (
    <div className="app">
      <header className="topbar">
        {back ? <button className="secondary" onClick={() => go(back)}>◀ Volver</button> : <span />}
        <h1>{title}</h1>
        <nav className="buttons">
          <button className="secondary icon-btn" onClick={() => go({ name: 'wardrobe' })} aria-label="Personalizar a Leo">
            <Leo avatar={save.avatar} size={2} />
          </button>
          <button className="secondary" onClick={() => go({ name: 'achievements' })}>🏆 {unlockedCount}/{achievements.length}</button>
        </nav>
      </header>
      {!storageOk && (
        <p className="warn">⚠ Este navegador no permite guardar (¿ventana privada o almacenamiento bloqueado?). Tu progreso se perderá al cerrar.</p>
      )}
      <main>{body}</main>
      <p className="help">Flechas / WASD para moverte · Enter, Espacio o E para entrar · también puedes hacer clic</p>
      {level && (
        <LevelPanel key={`${level.worldId}-${level.index}`} world={world} index={level.index} save={save}
          onRun={pass => setSave(s => pass ? recordPass(s, level.worldId, level.index) : recordFail(s, level.worldId, level.index))}
          onDraft={code => setSave(s => setDraft(s, level.worldId, level.index, code))}
          onClose={() => setLevel(null)} onContinue={onLevelContinue} />
      )}
      <div className="toasts" aria-live="polite">
        {toasts.map((a, i) => <div key={a.id + i} className="toast">{a.icon} <b>¡Logro!</b> {a.title}</div>)}
      </div>
    </div>
  );
}

function LegacyImport({ world, onImport }) {
  const [msg, setMsg] = useState('');
  async function pick(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      onImport(JSON.parse(await file.text()));
      setMsg('Progreso importado.');
    } catch (err) {
      setMsg(err instanceof SyntaxError ? 'Ese archivo no es JSON válido.' : err.message);
    }
  }
  return (
    <p className="help">
      ¿Ya jugaste la versión anterior?{' '}
      <label className="link">Importa tu progreso exportado<input type="file" accept="application/json,.json" hidden onChange={pick} /></label>
      {' '}al {world.name}. {msg && <b>{msg}</b>}
    </p>
  );
}
