import { LEVELS, compileCheck, transpile, execute, grade } from './engine.js';

// Binds the function to a fixed name: the bundler minifies `execute` to something else.
export const workerSource = fn => `var execute = (${fn.toString()});\nonmessage = e => postMessage(execute(e.data));`;

// Runs the transpiled program in a Worker so infinite loops can be killed.
function runInWorker(code) {
  const url = URL.createObjectURL(new Blob([workerSource(execute)], { type: 'text/javascript' }));
  return new Promise(resolve => {
    const w = new Worker(url);
    const done = res => { clearTimeout(timer); w.terminate(); URL.revokeObjectURL(url); resolve(res); };
    const timer = setTimeout(() => done({ ok: false, out: [], error: 'TIMEOUT' }), 1500);
    w.onmessage = e => done(e.data);
    w.onerror = e => { e.preventDefault(); done({ ok: false, out: [], error: e.message || 'Error interno del ejecutor' }); };
    w.postMessage(code);
  });
}

export async function runJava(level, src, exec = runInWorker) {
  const err = compileCheck(src);
  if (err) return { pass: false, out: [], error: `Main.java:${err.line}: error: ${err.msg}` };
  const res = await exec(transpile(src));
  const g = grade(level, src, res);
  return { pass: g.pass, out: res.out, error: g.pass ? null : `✘ ${g.msg}` };
}

export default {
  id: 'java',
  name: 'Reino de Java',
  tagline: 'Variables, bucles, arrays y métodos',
  color: '#f0a040',
  fileLabel: 'Main.java',
  idleOutput: 'La salida de tu programa aparecerá aquí.',
  levels: LEVELS,
  partSizes: [4, 3, 3],
  map: { theme: 'java', station: 'crystal', sign: 'JAVA QUEST', trail: 'sigue el camino' },
  run: (level, src) => runJava(level, src),
  victory: `
    <p>Ya dominas lo básico: variables, tipos, operadores, condicionales, bucles, arrays y métodos. 🎉</p>
    <p><b>Siguiente paso:</b> escribir Java "de verdad" en tu computadora:</p>
    <pre>1. Instala el JDK (por ejemplo Temurin 21)
2. Guarda tu código en Main.java
3. javac Main.java   # compila
4. java Main         # ejecuta</pre>
    <p>Después toca aprender <b>clases y objetos</b>, el corazón de Java.</p>`,
};
