import { useEffect, useState } from 'react';
import Leo from './Leo.jsx';

// A world map: nodes joined by a path, Leo standing on the selected node.
// Arrow keys / WASD move between nodes, Enter / Space / E enters, clicking a node enters it.
export default function PathMap({ nodes, avatar, active, onEnter, theme = 'grass', caption }) {
  const firstOpen = Math.max(0, nodes.findIndex(n => n.status === 'open'));
  const [sel, setSel] = useState(firstOpen);
  const [walking, setWalking] = useState(false);

  // Zig-zag layout in percentages, so the map scales with the screen.
  const pos = nodes.map((_, i) => ({
    x: nodes.length === 1 ? 50 : 12 + (76 * i) / (nodes.length - 1),
    y: i % 2 ? 62 : 38,
  }));

  const move = to => {
    if (to < 0 || to >= nodes.length || to === sel) return;
    setSel(to);
    setWalking(true);
  };
  const enter = i => { if (nodes[i].status !== 'locked') onEnter(nodes[i], i); };

  useEffect(() => {
    if (!active) return;
    const onKey = e => {
      const k = e.key.toLowerCase();
      if (['arrowright', 'arrowdown', 'd', 's'].includes(k)) move(sel + 1);
      else if (['arrowleft', 'arrowup', 'a', 'w'].includes(k)) move(sel - 1);
      else if (['enter', ' ', 'e'].includes(k)) enter(sel);
      else return;
      e.preventDefault();
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  });

  const current = nodes[sel];
  return (
    <div className={`map map-${theme}`}>
      <svg className="map-path" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        <polyline points={pos.map(p => `${p.x},${p.y}`).join(' ')} />
      </svg>
      {nodes.map((n, i) => (
        <button key={n.id} className={`node node-${n.status} ${i === sel ? 'node-selected' : ''}`}
          style={{ left: `${pos[i].x}%`, top: `${pos[i].y}%` }}
          onClick={() => (i === sel ? enter(i) : move(i))}
          onDoubleClick={() => enter(i)}
          aria-label={`${n.label}${n.status === 'locked' ? ' (bloqueado)' : ''}`}>
          {n.icon}
          <span className="node-label">{n.label}</span>
        </button>
      ))}
      <div className={`leo-on-map ${walking ? 'walking' : ''}`}
        style={{ left: `${pos[sel].x}%`, top: `${pos[sel].y}%` }}
        onTransitionEnd={() => setWalking(false)}>
        <Leo avatar={avatar} size={3} />
      </div>
      <div className="map-caption">
        {current.status === 'locked'
          ? <span className="bad">🔒 {current.lockedText ?? 'Bloqueado'}</span>
          : <span>[Enter] {current.title ?? current.label}{current.sub ? ` · ${current.sub}` : ''}</span>}
        {caption && <span className="muted">{caption}</span>}
      </div>
    </div>
  );
}
