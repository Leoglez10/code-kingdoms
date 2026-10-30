import { useEffect, useRef } from 'react';
import { T, COLS, ROWS, isPath, stationTiles, standTile } from '../game/layout.js';
import { composeLeo } from '../game/avatar.js';

// Canvas world map in the style of the original Java Quest / Cloud Quest:
// walk freely with arrows/WASD, press E/Space/Enter (or click) next to a station to enter it.
const W = COLS * T, H = ROWS * T;
const FONT = '8px "Press Start 2P", monospace';
const STATUS_COLOR = { done: '#a7f070', locked: '#566c86' };

const THEMES = {
  meadow: { ground: '#38b764', specks: ['#a7f070', '#257179'], path: '#c69a5b', pathSpeck: '#a0783f', deco: 'tree', sign: '#38b764', seed: 3 },
  java: { ground: '#38b764', specks: ['#a7f070', '#257179'], path: '#c69a5b', pathSpeck: '#a0783f', deco: 'tree', sign: '#38b764', seed: 7 },
  cloud: { ground: '#3b5dc9', specks: ['#41a6f6', '#29366f'], path: '#94b0c2', pathSpeck: '#566c86', deco: 'cloud', sign: '#3b5dc9', seed: 7 },
};

function drawBackground(theme, tiles) {
  const bg = document.createElement('canvas');
  bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  let seed = theme.seed;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const occupied = new Set(tiles.map(String));
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
    const path = isPath(x, y);
    g.fillStyle = path ? theme.path : theme.ground;
    g.fillRect(x * T, y * T, T, T);
    for (let k = 0; k < 6; k++) {
      g.fillStyle = path ? theme.pathSpeck : theme.specks[rand() < .5 ? 0 : 1];
      g.fillRect(x * T + Math.floor(rand() * 15), y * T + Math.floor(rand() * 15), 1, path || theme.deco === 'cloud' ? 1 : 2);
    }
    if (path || occupied.has(`${x},${y}`)) continue;
    const r = rand();
    const free = y < 2 || y > 10 || (y > 4 && y < 9);
    if (theme.deco === 'tree' && r < .07 && free) {
      g.fillStyle = '#5d275d'; g.fillRect(x * T + 7, y * T + 10, 3, 6);
      g.fillStyle = '#257179'; g.fillRect(x * T + 2, y * T + 2, 12, 9);
      g.fillStyle = '#38b764'; g.fillRect(x * T + 4, y * T + 1, 8, 7);
      g.fillStyle = '#a7f070'; g.fillRect(x * T + 5, y * T + 2, 2, 2);
    } else if (theme.deco === 'tree' && r < .15) {
      g.fillStyle = rand() < .5 ? '#ef7d57' : '#f4f4f4';
      g.fillRect(x * T + 6, y * T + 6, 3, 3);
      g.fillStyle = '#ffcd75'; g.fillRect(x * T + 7, y * T + 7, 1, 1);
    } else if (theme.deco === 'cloud' && r < .08 && free) {
      g.fillStyle = '#73eff7'; g.fillRect(x * T + 2, y * T + 8, 12, 3);
      g.fillStyle = '#f4f4f4'; g.fillRect(x * T + 3, y * T + 6, 10, 3); g.fillRect(x * T + 6, y * T + 4, 4, 2);
    }
  }
  return bg;
}

const SHAPES = {
  crystal(ctx, x, cy, color, open, tick) {
    ctx.fillStyle = '#333c57'; ctx.fillRect(x + 2, cy + 10, 12, 5);
    ctx.fillStyle = '#566c86'; ctx.fillRect(x + 3, cy + 10, 10, 2);
    ctx.fillStyle = color;
    ctx.fillRect(x + 7, cy, 2, 1); ctx.fillRect(x + 6, cy + 1, 4, 2);
    ctx.fillRect(x + 5, cy + 3, 6, 3); ctx.fillRect(x + 6, cy + 6, 4, 2); ctx.fillRect(x + 7, cy + 8, 2, 1);
    ctx.fillStyle = '#f4f4f4'; ctx.fillRect(x + 6, cy + 2, 1, 2);
    if (open && tick % 40 < 20) { ctx.fillStyle = color; ctx.fillRect(x + 1, cy + 2, 1, 1); ctx.fillRect(x + 14, cy + 5, 1, 1); }
  },
  cloud(ctx, x, cy, color, open, tick) {
    ctx.fillStyle = '#1a1c2c'; ctx.fillRect(x + 1, cy + 9, 14, 2);
    ctx.fillStyle = color;
    ctx.fillRect(x + 1, cy + 5, 14, 4); ctx.fillRect(x + 3, cy + 3, 6, 2); ctx.fillRect(x + 7, cy + 1, 5, 4);
    ctx.fillStyle = '#73eff7'; ctx.fillRect(x + 4, cy + 3, 2, 1);
    if (open && tick % 40 < 20) { ctx.fillStyle = '#ffcd75'; ctx.fillRect(x + 7, cy + 11, 1, 3); ctx.fillRect(x + 6, cy + 13, 1, 1); }
  },
  castle(ctx, x, cy, color, open, tick) {
    ctx.fillStyle = '#1a1c2c'; ctx.fillRect(x, cy + 14, 16, 2);
    ctx.fillStyle = color;
    ctx.fillRect(x + 1, cy + 3, 4, 11); ctx.fillRect(x + 11, cy + 3, 4, 11); ctx.fillRect(x + 4, cy + 6, 8, 8);
    for (const tx of [1, 3, 11, 13]) ctx.fillRect(x + tx, cy + 1, 1, 2);
    for (const tx of [4, 7, 10]) ctx.fillRect(x + tx, cy + 4, 2, 2);
    ctx.fillStyle = '#1a1c2c';
    ctx.fillRect(x + 6, cy + 10, 4, 4); ctx.fillRect(x + 7, cy + 9, 2, 1);
    ctx.fillRect(x + 2, cy + 6, 1, 2); ctx.fillRect(x + 13, cy + 6, 1, 2);
    if (open) { ctx.fillStyle = tick % 40 < 20 ? '#ffcd75' : '#ef7d57'; ctx.fillRect(x + 8, cy - 3, 4, 2); ctx.fillStyle = '#f4f4f4'; ctx.fillRect(x + 7, cy - 3, 1, 7); }
  },
  flag(ctx, x, cy, color, open, tick) {
    ctx.fillStyle = '#333c57'; ctx.fillRect(x + 3, cy + 12, 10, 3);
    ctx.fillStyle = '#f4f4f4'; ctx.fillRect(x + 5, cy, 1, 13);
    const wave = open && tick % 30 < 15 ? 1 : 0;
    ctx.fillStyle = color; ctx.fillRect(x + 6, cy + 1, 7, 5 + wave); ctx.fillRect(x + 13, cy + 2 + wave, 1, 3);
  },
};

export default function WalkMap({ stations, kind, theme = 'meadow', sign, score, avatar, active, onEnter }) {
  const canvas = useRef(null);
  const live = useRef({});
  live.current = { stations, kind, sign, score, avatar, active, onEnter };

  useEffect(() => {
    const ctx = canvas.current.getContext('2d');
    const tiles = stationTiles(stations.length);
    const bg = drawBackground(THEMES[theme], tiles);
    const start = standTile(tiles[Math.max(0, stations.findIndex(s => s.status === 'open'))]);
    const player = { x: start[0] * T, y: start[1] * T, dir: 1, step: 0 };
    const keys = {};
    let near = -1, tick = 0, raf = 0;

    const interact = i => {
      const s = live.current.stations[i];
      if (s && s.status !== 'locked') live.current.onEnter(s, i);
    };
    const onKeyDown = e => {
      if (!live.current.active) return;
      const k = e.key.toLowerCase();
      keys[k] = true;
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
      if (['e', ' ', 'enter'].includes(k)) interact(near);
    };
    const onKeyUp = e => { keys[e.key.toLowerCase()] = false; };
    const onClick = e => {
      const r = canvas.current.getBoundingClientRect();
      const mx = (e.clientX - r.left) / r.width * W, my = (e.clientY - r.top) / r.height * H;
      interact(tiles.findIndex(([x, y]) => Math.abs(mx - (x * T + 8)) < 12 && Math.abs(my - (y * T + 8)) < 12));
    };

    function update() {
      if (!live.current.active) { for (const k in keys) keys[k] = false; return; }
      let dx = 0, dy = 0;
      if (keys.arrowleft || keys.a) dx--;
      if (keys.arrowright || keys.d) dx++;
      if (keys.arrowup || keys.w) dy--;
      if (keys.arrowdown || keys.s) dy++;
      if (dx || dy) {
        const len = Math.hypot(dx, dy), speed = 1.4;
        player.x = Math.max(0, Math.min(W - T, player.x + dx / len * speed));
        player.y = Math.max(0, Math.min(H - T, player.y + dy / len * speed));
        if (dx) player.dir = dx;
        player.step++;
      }
      near = tiles.findIndex(([x, y]) => Math.hypot(player.x - x * T, player.y - y * T) < 18);
    }

    function drawStation(s, i) {
      const [tx, ty] = tiles[i], x = tx * T, y = ty * T;
      const open = s.status === 'open';
      const color = STATUS_COLOR[s.status] ?? s.color;
      const cy = y + 1 + (open ? Math.round(Math.sin(tick / 12) * 1.5) : 0);
      SHAPES[s.kind ?? live.current.kind](ctx, x, cy, color, open, tick);
      if (s.mark) {
        ctx.font = FONT; ctx.textAlign = 'center';
        ctx.fillStyle = '#1a1c2c'; ctx.fillText(s.mark, x + 8, y + 18);
      }
    }

    function drawPlayer() {
      const { rows, colors } = composeLeo(live.current.avatar);
      const hop = Math.floor(player.step / 8) % 2;
      const ox = Math.round(player.x) + 2, oy = Math.round(player.y) + 1 - hop;
      rows.forEach((row, ry) => [...row].forEach((c, rx) => {
        if (c === '.') return;
        ctx.fillStyle = colors[c];
        ctx.fillRect(ox + (player.dir > 0 ? rx : 11 - rx), oy + ry, 1, 1);
      }));
    }

    function drawSign() {
      const { title, sub } = live.current.sign;
      ctx.fillStyle = THEMES[theme].sign; ctx.fillRect(96, 92, 128, 34);
      ctx.fillStyle = 'rgba(26,28,44,.55)'; ctx.fillRect(96, 92, 128, 34);
      ctx.font = FONT; ctx.textAlign = 'center';
      ctx.fillStyle = '#ffcd75'; ctx.fillText(title, 160, 106);
      ctx.fillStyle = '#94b0c2'; ctx.fillText(sub, 160, 119);
    }

    function drawHud() {
      const { stations: st, score: sc } = live.current;
      ctx.font = FONT; ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(26,28,44,.8)'; ctx.fillRect(2, 2, 70, 13);
      ctx.fillStyle = '#ffcd75'; ctx.fillText(`★ ${sc}`, 6, 12);
      if (near < 0) return;
      const s = st[near];
      const locked = s.status === 'locked';
      const msg = locked ? `BLOQUEADO: ${s.lockedText}` : `[E] ${s.name}`;
      ctx.fillStyle = 'rgba(26,28,44,.9)'; ctx.fillRect(4, 172, 312, 16);
      ctx.fillStyle = locked ? '#ef7d57' : '#f4f4f4'; ctx.textAlign = 'center';
      ctx.fillText(msg.length > 38 ? msg.slice(0, 37) + '…' : msg, 160, 183);
    }

    function loop() {
      tick++;
      update();
      ctx.drawImage(bg, 0, 0);
      drawSign();
      live.current.stations.forEach(drawStation);
      drawPlayer();
      drawHud();
      raf = requestAnimationFrame(loop);
    }
    loop();
    addEventListener('keydown', onKeyDown);
    addEventListener('keyup', onKeyUp);
    canvas.current.addEventListener('click', onClick);
    const el = canvas.current;
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('keydown', onKeyDown);
      removeEventListener('keyup', onKeyUp);
      el.removeEventListener('click', onClick);
    };
  }, [theme, stations.length]); // eslint-disable-line react-hooks/exhaustive-deps

  return <canvas ref={canvas} className="game" width={W} height={H} aria-label="Mapa del mundo" />;
}
