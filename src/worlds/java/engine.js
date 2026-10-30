// Ported from Java Quest. Levels, simulated compiler and grader.
const tpl = (body = '        // escribe tu código aquí\n\n') =>
  `public class Main {\n    public static void main(String[] args) {\n${body}    }\n}\n`;

const LEVELS = [
  {
    name: 'La Señal',
    theory: `
      <p>Todo programa en Java vive dentro de una <b>clase</b>. Y toda aplicación empieza a ejecutarse en el método <code>main</code>: es la puerta de entrada.</p>
      <pre>public class Main {
    public static void main(String[] args) {
        System.out.println("Hola");
    }
}</pre>
      <p><code>System.out.println(...)</code> imprime un texto y salta de línea. El texto va entre <b>comillas dobles</b> y cada instrucción termina con <code>;</code> (punto y coma). Las llaves <code>{ }</code> marcan dónde empieza y termina cada bloque.</p>`,
    challenge: 'Imprime exactamente: <code>Hola, Mundo!</code>',
    starter: tpl(),
    expected: 'Hola, Mundo!',
    require: [],
    hint: 'Escribe dentro de main: System.out.println("...");',
    solution: tpl('        System.out.println("Hola, Mundo!");\n'),
  },
  {
    name: 'El Cofre de Monedas',
    theory: `
      <p>Una <b>variable</b> es una caja con nombre donde guardas un valor. En Java tienes que decir de qué <b>tipo</b> es la caja.</p>
      <pre>int vidas = 3;      // int = número entero
vidas = vidas + 1;  // ahora vale 4
System.out.println(vidas);</pre>
      <p>Fíjate: para <b>declarar</b> se pone el tipo (<code>int vidas</code>), pero para <b>cambiar</b> su valor después ya no se repite el tipo. Al imprimir una variable no lleva comillas.</p>`,
    challenge: 'Declara <code>int monedas</code> con valor <b>5</b>, súmale <b>3</b> (cambiando la variable) e imprime <code>monedas</code>. Debe salir <b>8</b>.',
    starter: tpl(),
    expected: '8',
    require: [
      { re: /\bint\s+monedas\s*=\s*5\s*;/, msg: 'Declara la variable así: int monedas = 5;' },
      { re: /monedas\s*(=\s*monedas\s*\+\s*3|\+=\s*3)/, msg: 'Cambia la variable: monedas = monedas + 3;' },
    ],
    hint: 'int monedas = 5;  luego  monedas = monedas + 3;  y por último imprime monedas (sin comillas).',
    solution: tpl('        int monedas = 5;\n        monedas = monedas + 3;\n        System.out.println(monedas);\n'),
  },
  {
    name: 'El Herrero Parlanchín',
    theory: `
      <p>Para guardar texto se usa el tipo <code>String</code> (con <b>S mayúscula</b>, Java distingue mayúsculas).</p>
      <pre>String arma = "Espada";
System.out.println("Tienes: " + arma);  // Tienes: Espada</pre>
      <p>El operador <code>+</code> con textos los <b>concatena</b> (los pega). Puedes pegar textos, variables y números.</p>`,
    challenge: 'Crea <code>String nombre</code> con el valor <code>"Pixel"</code> e imprime <code>Hola, Pixel!</code> usando <code>+</code> para pegar la variable.',
    starter: tpl(),
    expected: 'Hola, Pixel!',
    require: [
      { re: /\bString\s+nombre\s*=\s*"Pixel"\s*;/, msg: 'Declara: String nombre = "Pixel";' },
      { re: /println\s*\(.*\+\s*nombre/, msg: 'Usa + para pegar la variable nombre dentro del println.' },
    ],
    hint: 'System.out.println("Hola, " + nombre + "!");',
    solution: tpl('        String nombre = "Pixel";\n        System.out.println("Hola, " + nombre + "!");\n'),
  },
  {
    name: 'La Forja Matemática',
    theory: `
      <p>Operadores aritméticos: <code>+</code> suma, <code>-</code> resta, <code>*</code> multiplica, <code>/</code> divide y <code>%</code> da el <b>resto</b> (módulo) de una división.</p>
      <pre>int a = 10;
int b = 4;
System.out.println(a * b);  // 40
System.out.println(a % b);  // 2  (10 = 4*2 + 2)</pre>
      <p>Dato: en Java, dividir dos <code>int</code> da un entero: <code>7 / 2</code> es <b>3</b>, no 3.5. Por eso aquí practicamos con <code>*</code> y <code>%</code>.</p>`,
    challenge: 'Declara <code>int ataque = 7</code> y <code>int multiplicador = 3</code>. Imprime <code>ataque * multiplicador</code> y en otra línea <code>ataque % multiplicador</code>. Debe salir <b>21</b> y <b>1</b>.',
    starter: tpl(),
    expected: '21\n1',
    require: [
      { re: /\bint\s+ataque\s*=\s*7/, msg: 'Declara int ataque = 7;' },
      { re: /\bint\s+multiplicador\s*=\s*3/, msg: 'Declara int multiplicador = 3;' },
      { re: /ataque\s*\*\s*multiplicador/, msg: 'Usa las variables: ataque * multiplicador' },
      { re: /ataque\s*%\s*multiplicador/, msg: 'Usa las variables: ataque % multiplicador' },
    ],
    hint: 'Dos println: uno con (ataque * multiplicador) y otro con (ataque % multiplicador).',
    solution: tpl('        int ataque = 7;\n        int multiplicador = 3;\n        System.out.println(ataque * multiplicador);\n        System.out.println(ataque % multiplicador);\n'),
  },
  {
    name: 'El Puente Frágil',
    theory: `
      <p>Con <code>if</code> el programa <b>decide</b>. Si la condición es verdadera, se ejecuta el bloque; si no, se ejecuta el <code>else</code>.</p>
      <pre>int llaves = 2;
if (llaves >= 1) {
    System.out.println("Puedes abrir");
} else {
    System.out.println("Busca una llave");
}</pre>
      <p>Comparadores: <code>&lt;</code> <code>&gt;</code> <code>&lt;=</code> <code>&gt;=</code> <code>==</code> (igual) <code>!=</code> (distinto). Ojo: <code>=</code> asigna, <code>==</code> compara.</p>`,
    challenge: 'Declara <code>int vida = 30</code>. Si <code>vida</code> es menor que <b>50</b> imprime <code>Cuidado!</code>, si no imprime <code>Todo bien</code>.',
    starter: tpl(),
    expected: 'Cuidado!',
    require: [
      { re: /\bint\s+vida\s*=\s*30/, msg: 'Declara int vida = 30;' },
      { re: /if\s*\(\s*vida\s*<\s*50\s*\)/, msg: 'La condición debe ser: if (vida < 50)' },
      { re: /\belse\b/, msg: 'Falta el else para el caso contrario.' },
    ],
    hint: 'if (vida < 50) { ... } else { ... }',
    solution: tpl('        int vida = 30;\n        if (vida < 50) {\n            System.out.println("Cuidado!");\n        } else {\n            System.out.println("Todo bien");\n        }\n'),
  },
  {
    name: 'La Escalera Infinita',
    theory: `
      <p>Un bucle <code>for</code> repite código un número de veces. Tiene 3 partes separadas por <code>;</code>:</p>
      <pre>for (int i = 0; i &lt; 3; i++) {
    System.out.println("Paso " + i);
}
// Paso 0, Paso 1, Paso 2</pre>
      <p>1) <b>inicio</b> <code>int i = 0</code> · 2) <b>condición</b> para seguir <code>i &lt; 3</code> · 3) <b>avance</b> <code>i++</code> (suma 1 a i).</p>`,
    challenge: 'Usa un <code>for</code> para imprimir los números del <b>1 al 5</b>, uno por línea.',
    starter: tpl(),
    expected: '1\n2\n3\n4\n5',
    require: [{ re: /\bfor\s*\(/, msg: 'Debes usar un bucle for (no 5 println).' }],
    hint: 'Empieza en 1 y sigue mientras i <= 5.',
    solution: tpl('        for (int i = 1; i <= 5; i++) {\n            System.out.println(i);\n        }\n'),
  },
  {
    name: 'La Plataforma de Lanzamiento',
    theory: `
      <p>El bucle <code>while</code> repite <b>mientras</b> la condición sea verdadera. Tú controlas cuándo cambia la variable.</p>
      <pre>int energia = 3;
while (energia > 0) {
    System.out.println("Energía: " + energia);
    energia--;   // resta 1
}</pre>
      <p>¡Cuidado! Si la variable nunca cambia, la condición nunca se vuelve falsa y tienes un <b>bucle infinito</b>.</p>`,
    challenge: 'Con un <code>while</code>, haz la cuenta regresiva <b>3, 2, 1</b> (uno por línea) y al final imprime <code>Despegue!</code>.',
    starter: tpl(),
    expected: '3\n2\n1\nDespegue!',
    require: [{ re: /\bwhile\s*\(/, msg: 'Debes usar un bucle while.' }],
    hint: 'int cuenta = 3; while (cuenta > 0) { imprime; cuenta--; }  y el Despegue va DESPUÉS del bucle.',
    solution: tpl('        int cuenta = 3;\n        while (cuenta > 0) {\n            System.out.println(cuenta);\n            cuenta--;\n        }\n        System.out.println("Despegue!");\n'),
  },
  {
    name: 'El Tesoro de Gemas',
    theory: `
      <p>Un <b>array</b> guarda varios valores del mismo tipo en orden. Cada uno tiene una posición (índice) que <b>empieza en 0</b>.</p>
      <pre>int[] notas = {7, 9, 6};
System.out.println(notas[0]);      // 7
System.out.println(notas.length);  // 3

int total = 0;
for (int i = 0; i &lt; notas.length; i++) {
    total = total + notas[i];
}</pre>
      <p>Se recorre con un <code>for</code> usando <code>.length</code> para saber cuántos elementos hay.</p>`,
    challenge: 'Crea <code>int[] gemas = {4, 8, 15};</code> y con un <code>for</code> suma todas las gemas e imprime el total (<b>27</b>).',
    starter: tpl(),
    expected: '27',
    require: [
      { re: /\bint\s*\[\s*\]\s*gemas\s*=\s*\{\s*4\s*,\s*8\s*,\s*15\s*\}/, msg: 'Declara: int[] gemas = {4, 8, 15};' },
      { re: /\bfor\s*\(/, msg: 'Recorre el array con un for.' },
      { re: /gemas\.length|:\s*gemas\b/, msg: 'Usa gemas.length en la condición del for (no pongas el 3 a mano).' },
    ],
    hint: 'int total = 0; for (int i = 0; i < gemas.length; i++) { total = total + gemas[i]; }',
    solution: tpl('        int[] gemas = {4, 8, 15};\n        int total = 0;\n        for (int i = 0; i < gemas.length; i++) {\n            total = total + gemas[i];\n        }\n        System.out.println(total);\n'),
  },
  {
    name: 'El Mago de los Métodos',
    theory: `
      <p>Un <b>método</b> es un bloque de código con nombre que puedes reutilizar. Recibe <b>parámetros</b> y puede <b>devolver</b> un valor con <code>return</code>.</p>
      <pre>public class Main {
    static int sumar(int a, int b) {
        return a + b;
    }

    public static void main(String[] args) {
        System.out.println(sumar(2, 3)); // 5
    }
}</pre>
      <p><code>static int sumar(int a, int b)</code> = devuelve un <code>int</code>, se llama <code>sumar</code> y recibe dos <code>int</code>. Los métodos van <b>dentro de la clase</b> pero <b>fuera de main</b>.</p>`,
    challenge: 'Escribe el método <code>static int doble(int n)</code> que devuelva <code>n * 2</code>. El main ya lo llama con 21: debe salir <b>42</b>.',
    starter: 'public class Main {\n    // escribe tu método aquí\n\n\n    public static void main(String[] args) {\n        System.out.println(doble(21));\n    }\n}\n',
    expected: '42',
    require: [
      { re: /static\s+int\s+doble\s*\(\s*int\s+\w+\s*\)/, msg: 'La firma debe ser: static int doble(int n)' },
      { re: /\breturn\b/, msg: 'El método debe devolver el resultado con return.' },
    ],
    hint: 'static int doble(int n) { return n * 2; }',
    solution: 'public class Main {\n    static int doble(int n) {\n        return n * 2;\n    }\n\n    public static void main(String[] args) {\n        System.out.println(doble(21));\n    }\n}\n',
  },
  {
    name: 'JEFE FINAL: El Dragón Par',
    theory: `
      <p>¡Hora de combinar todo! Un método puede devolver un <code>String</code> y usar <code>if</code> dentro. Recuerda: un número es <b>par</b> si <code>n % 2 == 0</code>.</p>
      <pre>static String signo(int n) {
    if (n >= 0) {
        return "positivo";
    }
    return "negativo";
}</pre>
      <p>Cuando se ejecuta un <code>return</code>, el método termina ahí mismo.</p>`,
    challenge: 'Crea <code>static String clasificar(int n)</code> que devuelva <code>"par"</code> o <code>"impar"</code>. En main, con un <code>for</code> del 1 al 4 imprime:<br><code>1 es impar</code><br><code>2 es par</code><br><code>3 es impar</code><br><code>4 es par</code>',
    starter: 'public class Main {\n    // método clasificar aquí\n\n\n    public static void main(String[] args) {\n        // for del 1 al 4 aquí\n\n    }\n}\n',
    expected: '1 es impar\n2 es par\n3 es impar\n4 es par',
    require: [
      { re: /static\s+String\s+clasificar\s*\(\s*int\s+\w+\s*\)/, msg: 'La firma debe ser: static String clasificar(int n)' },
      { re: /%\s*2/, msg: 'Usa % 2 para saber si es par.' },
      { re: /\bfor\s*\(/, msg: 'Usa un for del 1 al 4 en main.' },
      { re: /clasificar\s*\(\s*\w+\s*\)[^]*clasificar\s*\(|println\s*\(.*clasificar\s*\(/, msg: 'Llama a clasificar(i) dentro del println.' },
    ],
    hint: 'En main: System.out.println(i + " es " + clasificar(i));',
    solution: 'public class Main {\n    static String clasificar(int n) {\n        if (n % 2 == 0) {\n            return "par";\n        }\n        return "impar";\n    }\n\n    public static void main(String[] args) {\n        for (int i = 1; i <= 4; i++) {\n            System.out.println(i + " es " + clasificar(i));\n        }\n    }\n}\n',
  },
];

// Simulates the Java compiler's most common beginner errors. Returns null when the code "compiles".
function compileCheck(src) {
  const fail = (line, msg) => ({ line, msg });
  const lines = src.replace(/"(?:\\.|[^"\\\n])*"/g, '""').split('\n');
  let depth = 0;
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].replace(/\/\/.*$/, '').trim();
    const n = i + 1;
    if (!t) continue;
    if (/\bstring\s+\w+/.test(t)) return fail(n, '`string` no existe: el tipo es `String` (con S mayúscula). Java distingue mayúsculas y minúsculas.');
    if (/\bsystem\.out\b|System\.Out\b/.test(t)) return fail(n, 'Se escribe exactamente `System.out` (S mayúscula, out en minúscula).');
    if (/\bprintln\s*\(/.test(t) && !/System\.out\.println\s*\(/.test(t)) return fail(n, 'Para imprimir usa `System.out.println(...)`.');
    if (/\bint\s+\w+\s*=\s*""/.test(t)) return fail(n, 'incompatible types: String cannot be converted to int. Un `int` guarda números, no texto entre comillas.');
    if (/\bString\s+\w+\s*=\s*-?\d/.test(t)) return fail(n, 'incompatible types: int cannot be converted to String. El texto va entre comillas dobles.');
    if (/'[^'\\]{2,}'/.test(t)) return fail(n, 'Las comillas simples son para UN carácter (char). Para texto usa comillas dobles "...".');
    const isBlockLine = /^(if|else|for|while|do|switch|case|default|public|private|protected|static|class|abstract)\b/.test(t)
      || t.startsWith('}') || t.startsWith('@');
    // Lines ending in ',' continue a multi-line array initializer.
    if (!/[;{},]$/.test(t) && !isBlockLine) return fail(n, "';' expected — cada instrucción termina con punto y coma.");
    for (const c of t) depth += c === '{' ? 1 : c === '}' ? -1 : 0;
    if (depth < 0) return fail(n, 'Sobra una llave `}`.');
  }
  if (depth > 0) return fail(lines.length, 'Falta cerrar una llave `}`. Cada `{` necesita su `}`.');
  if (!/public\s+static\s+void\s+main\s*\(\s*String\s*\[\s*\]\s*\w+\s*\)/.test(src))
    return fail(1, 'No encuentro `public static void main(String[] args)`. Es la puerta de entrada del programa.');
  return null;
}

// ---------- Java -> JavaScript translation ----------
// ponytail: regex-based translator for the subset these levels teach (no generics, interfaces,
// nested classes or static fields); swap in a real Java interpreter if levels go beyond it.

const LITERAL = /("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')/;

// Applies fn only to code outside string and char literals.
const outsideStrings = (s, fn) => s.split(LITERAL).map((part, i) => (i % 2 ? part : fn(part))).join('');

// Same length as s, with literal contents blanked, so braces inside strings never count.
const mask = s => s.replace(new RegExp(LITERAL.source, 'g'), m => m[0] + ' '.repeat(m.length - 2) + m[0]);

function matchBrace(masked, open) {
  let depth = 0;
  for (let i = open; i < masked.length; i++) {
    if (masked[i] === '{') depth++;
    else if (masked[i] === '}' && --depth === 0) return i;
  }
  return masked.length - 1;
}

// `= {1, {2, 3}}` array initializers become `= [1, [2, 3]]`.
function convertInitializers(s) {
  const m = mask(s);
  const out = [...s];
  const re = /=\s*\{/g;
  let x;
  while ((x = re.exec(m))) {
    const open = x.index + x[0].length - 1;
    const close = matchBrace(m, open);
    for (let i = open; i <= close; i++) if (m[i] === '{') out[i] = '['; else if (m[i] === '}') out[i] = ']';
    re.lastIndex = close + 1;
  }
  return out.join('');
}

const TYPE = '(?:final\\s+)?(?:int|double|float|long|short|byte|char|boolean|String|var|[A-Z]\\w*)(?:\\s*\\[\\s*\\])*';
const paramNames = params => params.split(',').map(p => p.trim().split(/\s+/).pop()).filter(Boolean);

// Statement-level translation shared by main, static methods and instance methods.
function convertStatements(s, intNames) {
  s = convertInitializers(s);
  return outsideStrings(s, code => code
    .replace(/new\s+\w+\s*\[\s*(\w+)\s*\]\s*\[\s*(\w+)\s*\]/g, 'Array.from({ length: $1 }, () => new Array($2).fill(0))')
    .replace(/new\s+\w+\s*\[\s*(\w+)\s*\]/g, 'new Array($1).fill(0)')
    .replace(new RegExp(`\\b${TYPE}\\s+(\\w+)\\s*(=|;|:)`, 'g'), 'let $1 $2')
    .replace(/for\s*\(\s*let\s+(\w+)\s*:/g, 'for (let $1 of')
    .replace(/\.length\(\)/g, '.length')
    .replace(/\.contains\s*\(/g, '.includes(')
    .replace(/System\.out\.println\s*\(/g, '__println(').replace(/System\.out\.print\s*\(/g, '__print(')
    // int / int truncates in Java. ponytail: only plain names or literals, `(a + b) / 2` stays a float.
    .replace(/((?:\w+\.)*\w+)\s*\/\s*((?:\w+\.)*\w+)/g, (m, a, b) => {
      const isInt = t => /^\d+$/.test(t) || intNames.has(t.split('.').pop());
      return isInt(a) && isInt(b) ? `Math.trunc(${a} / ${b})` : m;
    }));
}

// Inside instance methods Java lets you write `vida` for `this.vida`; JavaScript does not.
function addThis(body, locals, fields, methods) {
  return outsideStrings(body, code => code
    .replace(/(?<![.\w$])([A-Za-z_]\w*)(\s*\()/g, (m, n, p) => (methods.has(n) && !locals.has(n) ? `this.${n}${p}` : m))
    .replace(/(?<![.\w$])([A-Za-z_]\w*)\b(?!\s*\()/g, (m, n) => (fields.has(n) && !locals.has(n) ? `this.${n}` : m)));
}

const DEFAULTS = { int: '0', long: '0', short: '0', byte: '0', double: '0', float: '0', boolean: 'false' };

function splitClasses(src) {
  const m = mask(src);
  const re = /(?:(?:public|abstract|final)\s+)*class\s+(\w+)(?:\s+extends\s+(\w+))?\s*\{/g;
  const out = [];
  let x;
  while ((x = re.exec(m))) {
    const open = x.index + x[0].length - 1;
    const close = matchBrace(m, open);
    out.push({ name: x[1], parent: x[2] ?? null, body: src.slice(open + 1, close) });
    re.lastIndex = close + 1;
  }
  return out;
}

// Splits a class body into fields (`type name = init;`) and methods/constructors (`header { body }`).
function parseMembers(cls) {
  const { body } = cls, m = mask(body);
  const fields = [], methods = [];
  let start = 0;
  const strip = h => h.replace(/\b(public|private|protected|static|final|abstract)\b/g, '').trim();
  for (let i = 0; i < m.length; i++) {
    if (m[i] === ';') {
      const f = /^([\w<>[\]\s]+?)\s+(\w+)\s*(?:=\s*([^]*))?$/.exec(strip(body.slice(start, i)));
      if (f) fields.push({ type: f[1].trim(), name: f[2], init: f[3] });
      start = i + 1;
    } else if (m[i] === '{') {
      const close = matchBrace(m, i);
      const header = strip(body.slice(start, i));
      const ctor = /^(\w+)\s*\(([^)]*)\)$/.exec(header);
      const meth = /^[\w<>[\],\s]+?\s+(\w+)\s*\(([^)]*)\)$/.exec(header);
      if (ctor && ctor[1] === cls.name) methods.push({ ctor: true, name: 'constructor', params: paramNames(ctor[2]), body: body.slice(i + 1, close) });
      else if (meth) methods.push({ name: meth[1], params: paramNames(meth[2]), body: body.slice(i + 1, close) });
      i = close;
      start = i + 1;
    }
  }
  return { ...cls, fields, methods };
}

function transpile(src) {
  const s = src.replace(/\/\/.*$/gm, '').replace(/@\w+/g, '');
  const intNames = new Set([...s.matchAll(/\b(?:int|long|short|byte)(?:\s*\[\s*\])*\s+(\w+)/g)].map(x => x[1]));
  const classes = splitClasses(s).map(parseMembers);
  const mainClass = classes.find(c => /static\s+void\s+main\s*\(/.test(c.body));
  const others = classes.filter(c => c !== mainClass);
  const byName = new Map(others.map(c => [c.name, c]));
  const lineage = c => (c ? [c, ...lineage(byName.get(c.parent))] : []);

  // Parents must be defined before their subclasses.
  const ordered = [];
  const visit = c => { if (!c || ordered.includes(c)) return; visit(byName.get(c.parent)); ordered.push(c); };
  others.forEach(visit);

  const classCode = ordered.map(c => {
    const fields = new Set(lineage(c).flatMap(k => k.fields.map(f => f.name)));
    const methods = new Set(lineage(c).flatMap(k => k.methods.filter(x => !x.ctor).map(x => x.name)));
    const fieldCode = c.fields.map(f => `  ${f.name} = ${f.init ? convertStatements(f.init, intNames) : DEFAULTS[f.type] ?? 'null'};`);
    const methodCode = c.methods.map(mt => {
      let body = convertStatements(mt.body, intNames);
      const locals = new Set([...mt.params, ...[...body.matchAll(/\blet\s+(\w+)/g)].map(x => x[1])]);
      body = addThis(body, locals, fields, methods);
      // Java inserts super() for you; JavaScript requires it before using `this`.
      if (mt.ctor && c.parent && !/\bsuper\s*\(/.test(body)) body = ' super();' + body;
      return `  ${mt.name}(${mt.params.join(', ')}) {${body}}`;
    });
    return `class ${c.name}${c.parent ? ` extends ${c.parent}` : ''} {\n${[...fieldCode, ...methodCode].join('\n')}\n}`;
  });

  let main = mainClass ? mainClass.body : '';
  main = main.replace(/public\s+static\s+void\s+main\s*\([^)]*\)/, 'function main()');
  main = main.replace(/(?:(?:public|private)\s+)?static\s+[\w[\]]+\s+(\w+)\s*\(([^)]*)\)/g,
    (m, name, params) => `function ${name}(${paramNames(params).join(', ')})`);
  main = convertStatements(main, intNames);
  return `"use strict";\n${classCode.join('\n')}\n${main}\nmain();`;
}

function execute(code) {
  const helpers = {
    equals(o) { return this.valueOf() === String(o); },
    equalsIgnoreCase(o) { return this.toLowerCase() === String(o).toLowerCase(); },
    isEmpty() { return this.length === 0; },
  };
  for (const [k, fn] of Object.entries(helpers)) if (!String.prototype[k]) String.prototype[k] = fn;
  const out = [];
  let line = '';
  const __print = x => { line += String(x); };
  const __println = (x = '') => { out.push(line + String(x)); line = ''; };
  try {
    new Function('__println', '__print', code)(__println, __print);
  } catch (e) {
    if (line) out.push(line);
    return { ok: false, out, error: e.name + ': ' + e.message };
  }
  if (line) out.push(line);
  return { ok: true, out };
}

function friendlyError(msg) {
  const undef = msg.match(/(\w+) is not defined/);
  if (undef) return `error: cannot find symbol\n  símbolo: ${undef[1]}\n→ ¿Declaraste esa variable, método o clase? ¿Lo escribiste igual (mayúsculas incluidas)?`;
  if (/already been declared/.test(msg)) return 'error: variable already defined\n→ Declaraste dos veces la misma variable. Para cambiarla, no repitas el tipo.';
  if (/Cannot read properties of (null|undefined)/.test(msg)) return 'Exception: NullPointerException\n→ Usaste un objeto que todavía no existe. ¿Le hiciste `new`?';
  if (/is not a function/.test(msg)) return 'error: cannot find symbol (método)\n→ Ese método no existe en el objeto. Revisa el nombre y la clase.';
  if (/^SyntaxError/.test(msg)) return 'error de sintaxis\n→ Revisa paréntesis ( ), llaves { } y comillas.';
  if (msg === 'TIMEOUT') return 'Tu programa nunca terminó (¿bucle infinito?)\n→ Revisa que la condición del bucle llegue a ser falsa.';
  return msg;
}

const normalize = s => s.split('\n').map(l => l.trimEnd()).join('\n').trim();

function grade(level, src, res) {
  if (!res.ok) return { pass: false, msg: friendlyError(res.error) };
  for (const r of level.require) if (!r.re.test(src)) return { pass: false, msg: r.msg };
  if (normalize(res.out.join('\n')) !== normalize(level.expected))
    return { pass: false, msg: `La salida no coincide. Se esperaba:\n${level.expected}` };
  return { pass: true };
}

export { LEVELS, tpl, compileCheck, transpile, execute, grade };
