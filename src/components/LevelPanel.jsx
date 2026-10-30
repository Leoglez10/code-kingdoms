import { useEffect, useRef, useState } from 'react';

// Modal with theory, challenge, editor and console for one level of one kingdom.
export default function LevelPanel({ world, index, save, onRun, onDraft, onClose, onContinue }) {
  const level = world.levels[index];
  const ws = save.worlds[world.id];
  const [code, setCode] = useState(ws.drafts[index] ?? level.starter);
  const [lines, setLines] = useState([{ text: world.idleOutput, cls: 'muted' }]);
  const [passed, setPassed] = useState(false);
  const [running, setRunning] = useState(false);
  const editor = useRef(null);
  const attempts = ws.attempts[index] || 0;

  useEffect(() => { editor.current?.focus(); }, []);
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [onClose]);

  const print = (text, cls = '') => setLines(l => [...l, { text, cls }]);

  async function run() {
    setRunning(true);
    setLines([]);
    const r = await world.run(level, code);
    setRunning(false);
    setLines(r.out.map(text => ({ text, cls: text.startsWith('$ ') ? 'cmd' : '' })));
    if (r.pass) { print('\n✔ ¡Nivel superado!', 'ok'); setPassed(true); }
    else print(`\n${r.error}`, 'err');
    onRun(r.pass);
  }

  function change(value) {
    setCode(value);
    onDraft(value);
  }

  function onKeyDown(e) {
    if (e.key === 'Tab') {
      e.preventDefault();
      e.target.setRangeText('    ', e.target.selectionStart, e.target.selectionEnd, 'end');
      change(e.target.value);
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      run();
    }
  }

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="lv-title">
      <div className="panel" style={{ '--kingdom': world.color }}>
        <div className="panel-header">
          <div>
            <div className="tag">{world.name} · NIVEL {index + 1} / {world.levels.length}</div>
            <h2 id="lv-title">{level.name}</h2>
          </div>
          <button className="secondary" onClick={onClose} aria-label="Cerrar">X</button>
        </div>
        <div className="theory" dangerouslySetInnerHTML={{ __html: level.theory }} />
        <div className="challenge"><b>Reto:</b> <span dangerouslySetInnerHTML={{ __html: level.challenge }} /></div>
        <div className="file-label">{world.fileLabel}</div>
        <textarea ref={editor} className="editor" spellCheck="false" value={code}
          onChange={e => change(e.target.value)} onKeyDown={onKeyDown} aria-label="Editor de código" />
        <div className="buttons">
          <button onClick={run} disabled={running}>{running ? '…' : '▶ Ejecutar'}</button>
          <button className="secondary" onClick={() => print(`💡 ${level.hint}`, 'hint')}>Pista</button>
          {attempts >= 2 && (
            <button className="secondary" onClick={() => { change(level.solution); print('Solución cargada. Léela con calma, entiende cada línea y pulsa Ejecutar.', 'hint'); }}>
              Ver solución
            </button>
          )}
          {passed && <button className="go" onClick={onContinue}>Continuar ➜</button>}
        </div>
        <pre className="console" aria-live="polite">
          {lines.map((l, i) => <span key={i} className={l.cls}>{l.text}{'\n'}</span>)}
        </pre>
        <p className="muted small">Ctrl/⌘ + Enter para ejecutar · Esc para cerrar</p>
      </div>
    </div>
  );
}
