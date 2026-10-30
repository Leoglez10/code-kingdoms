import { tpl } from './engine.js';

// World 2 — Herramientas: Strings, integer division, switch, do-while, 2D arrays, methods with several parameters.
export default [
  {
    name: 'El Pergamino de Letras',
    theory: `
      <p>Un <code>String</code> no es solo texto: es un <b>objeto</b> con métodos que puedes llamar con un punto.</p>
      <pre>String arma = "espada";
System.out.println(arma.length());       // 6  (cuántas letras)
System.out.println(arma.toUpperCase());  // ESPADA
System.out.println(arma.charAt(0));      // e  (la letra en la posición 0)</pre>
      <p>Igual que en los arrays, las posiciones empiezan en <b>0</b>. Ojo: <code>length()</code> en un String lleva paréntesis; en un array es <code>.length</code> sin paréntesis.</p>`,
    challenge: 'Declara <code>String heroe = "pixel";</code> e imprime, en tres líneas: su longitud, el nombre en mayúsculas y su primera letra. Debe salir <b>5</b>, <b>PIXEL</b> y <b>p</b>.',
    starter: tpl(),
    expected: '5\nPIXEL\np',
    require: [
      { re: /\bString\s+heroe\s*=\s*"pixel"/, msg: 'Declara: String heroe = "pixel";' },
      { re: /heroe\.length\s*\(\s*\)/, msg: 'Usa heroe.length() para la longitud.' },
      { re: /heroe\.toUpperCase\s*\(\s*\)/, msg: 'Usa heroe.toUpperCase() para las mayúsculas.' },
      { re: /heroe\.charAt\s*\(\s*0\s*\)/, msg: 'Usa heroe.charAt(0) para la primera letra.' },
    ],
    hint: 'Tres println: heroe.length(), heroe.toUpperCase() y heroe.charAt(0).',
    solution: tpl('        String heroe = "pixel";\n        System.out.println(heroe.length());\n        System.out.println(heroe.toUpperCase());\n        System.out.println(heroe.charAt(0));\n'),
  },
  {
    name: 'El Espejo que Compara',
    theory: `
      <p>Para comparar <b>textos</b> en Java no se usa <code>==</code>: se usa <code>.equals()</code>.</p>
      <pre>String a = "hola";
if (a.equals("hola")) {
    System.out.println("Son iguales");
}</pre>
      <p><code>==</code> pregunta si son <b>el mismo objeto</b> en memoria, no si tienen las mismas letras. A veces "funciona" por casualidad y luego falla. Con Strings, <b>siempre</b> <code>.equals()</code>.</p>`,
    challenge: 'Declara <code>String clave = "abre"</code> y <code>String intento = "abre"</code>. Si <code>intento</code> es igual a <code>clave</code> imprime <code>Puerta abierta</code>; si no, <code>Clave incorrecta</code>.',
    starter: tpl(),
    expected: 'Puerta abierta',
    require: [
      { re: /\bString\s+clave\s*=\s*"abre"/, msg: 'Declara: String clave = "abre";' },
      { re: /\bString\s+intento\s*=\s*"abre"/, msg: 'Declara: String intento = "abre";' },
      { re: /intento\.equals\s*\(\s*clave\s*\)|clave\.equals\s*\(\s*intento\s*\)/, msg: 'Compara con intento.equals(clave), no con ==.' },
      { re: /\belse\b/, msg: 'Falta el else para la clave incorrecta.' },
    ],
    hint: 'if (intento.equals(clave)) { ... } else { ... }',
    solution: tpl('        String clave = "abre";\n        String intento = "abre";\n        if (intento.equals(clave)) {\n            System.out.println("Puerta abierta");\n        } else {\n            System.out.println("Clave incorrecta");\n        }\n'),
  },
  {
    name: 'El Reparto del Botín',
    theory: `
      <p>Cuando divides dos <code>int</code>, Java hace <b>división entera</b>: se queda con la parte entera y tira los decimales.</p>
      <pre>int a = 7;
int b = 2;
System.out.println(a / b);  // 3   (no 3.5)
System.out.println(a % b);  // 1   (lo que sobra)</pre>
      <p>Juntos, <code>/</code> y <code>%</code> sirven para repartir: <code>/</code> dice cuánto le toca a cada uno y <code>%</code> cuánto sobra.</p>`,
    challenge: 'Hay <code>int monedas = 17</code> y <code>int jugadores = 5</code>. Imprime cuántas monedas le tocan a cada jugador y, en otra línea, cuántas sobran. Debe salir <b>3</b> y <b>2</b>.',
    starter: tpl(),
    expected: '3\n2',
    require: [
      { re: /\bint\s+monedas\s*=\s*17/, msg: 'Declara int monedas = 17;' },
      { re: /\bint\s+jugadores\s*=\s*5/, msg: 'Declara int jugadores = 5;' },
      { re: /monedas\s*\/\s*jugadores/, msg: 'Usa monedas / jugadores para el reparto.' },
      { re: /monedas\s*%\s*jugadores/, msg: 'Usa monedas % jugadores para lo que sobra.' },
    ],
    hint: 'System.out.println(monedas / jugadores);  y luego  System.out.println(monedas % jugadores);',
    solution: tpl('        int monedas = 17;\n        int jugadores = 5;\n        System.out.println(monedas / jugadores);\n        System.out.println(monedas % jugadores);\n'),
  },
  {
    name: 'El Selector de Pociones',
    theory: `
      <p>Cuando comparas una variable contra muchos valores fijos, <code>switch</code> es más limpio que una cadena de <code>if</code>.</p>
      <pre>int dia = 2;
switch (dia) {
    case 1:
        System.out.println("Lunes");
        break;
    case 2:
        System.out.println("Martes");
        break;
    default:
        System.out.println("Otro día");
}</pre>
      <p>Cada <code>case</code> termina con <code>break</code>; si lo olvidas, Java <b>sigue ejecutando</b> el siguiente caso. <code>default</code> se ejecuta cuando ningún caso coincide.</p>`,
    challenge: 'Declara <code>int pocion = 2</code>. Con un <code>switch</code>: si es 1 imprime <code>Vida</code>, si es 2 imprime <code>Mana</code>, y en cualquier otro caso <code>Agua</code>.',
    starter: tpl(),
    expected: 'Mana',
    require: [
      { re: /\bint\s+pocion\s*=\s*2/, msg: 'Declara int pocion = 2;' },
      { re: /switch\s*\(\s*pocion\s*\)/, msg: 'Usa switch (pocion).' },
      { re: /\bbreak\s*;/, msg: 'Termina cada case con break;' },
      { re: /\bdefault\s*:/, msg: 'Falta el default: para el resto de casos.' },
    ],
    hint: 'case 1: println("Vida"); break;  case 2: println("Mana"); break;  default: println("Agua");',
    solution: tpl('        int pocion = 2;\n        switch (pocion) {\n            case 1:\n                System.out.println("Vida");\n                break;\n            case 2:\n                System.out.println("Mana");\n                break;\n            default:\n                System.out.println("Agua");\n        }\n'),
  },
  {
    name: 'La Puerta Insistente',
    theory: `
      <p><code>do { ... } while (condición);</code> es como <code>while</code>, pero revisa la condición <b>al final</b>. Por eso el bloque se ejecuta <b>al menos una vez</b>.</p>
      <pre>int vidas = 0;
do {
    System.out.println("Intentando...");
} while (vidas > 0);   // se imprime una vez aunque vidas sea 0</pre>
      <p>Fíjate en el <code>;</code> después del <code>while (...)</code> final: es obligatorio.</p>`,
    challenge: 'Con <code>int intentos = 0</code> y un <code>do-while</code>, suma 1 a <code>intentos</code> e imprime <code>Intento N</code> mientras <code>intentos</code> sea menor que 3. Debe salir <code>Intento 1</code>, <code>Intento 2</code>, <code>Intento 3</code>.',
    starter: tpl(),
    expected: 'Intento 1\nIntento 2\nIntento 3',
    require: [
      { re: /\bdo\s*\{/, msg: 'Usa un bucle do { ... } while (...);' },
      { re: /\}\s*while\s*\(.*\)\s*;/, msg: 'El do-while termina con } while (condición);' },
    ],
    hint: 'do { intentos++; System.out.println("Intento " + intentos); } while (intentos < 3);',
    solution: tpl('        int intentos = 0;\n        do {\n            intentos++;\n            System.out.println("Intento " + intentos);\n        } while (intentos < 3);\n'),
  },
  {
    name: 'El Cazador de Vocales',
    theory: `
      <p>Puedes recorrer un String letra por letra con un <code>for</code> y <code>charAt(i)</code>. Cada letra es un <code>char</code>, que se escribe entre <b>comillas simples</b>.</p>
      <pre>String s = "hola";
for (int i = 0; i &lt; s.length(); i++) {
    if (s.charAt(i) == 'o') {
        System.out.println("¡Una o en " + i + "!");
    }
}</pre>
      <p>Los <code>char</code> sí se comparan con <code>==</code>: son valores simples, no objetos como los String.</p>`,
    challenge: 'Cuenta cuántas letras <code>\'a\'</code> tiene <code>String palabra = "banana"</code> e imprime el total (<b>3</b>).',
    starter: tpl(),
    expected: '3',
    require: [
      { re: /\bString\s+palabra\s*=\s*"banana"/, msg: 'Declara: String palabra = "banana";' },
      { re: /\bfor\s*\(/, msg: 'Recorre la palabra con un for.' },
      { re: /charAt\s*\(/, msg: 'Usa palabra.charAt(i) para leer cada letra.' },
      { re: /palabra\.length\s*\(\s*\)/, msg: 'Usa palabra.length() en la condición del for (no pongas el 6 a mano).' },
    ],
    hint: "int total = 0; for (...) { if (palabra.charAt(i) == 'a') { total++; } }",
    solution: tpl("        String palabra = \"banana\";\n        int total = 0;\n        for (int i = 0; i < palabra.length(); i++) {\n            if (palabra.charAt(i) == 'a') {\n                total++;\n            }\n        }\n        System.out.println(total);\n"),
  },
  {
    name: 'El Arquitecto de Salas',
    theory: `
      <p>Un método puede recibir <b>varios parámetros</b>, separados por comas. Cada uno lleva su tipo.</p>
      <pre>static String saludo(String nombre, int nivel) {
    return nombre + " (nivel " + nivel + ")";
}
// saludo("Leo", 3)  →  "Leo (nivel 3)"</pre>
      <p>Al llamarlo, los valores se pasan <b>en el mismo orden</b> que los parámetros.</p>`,
    challenge: 'Escribe <code>static int area(int ancho, int alto)</code> que devuelva <code>ancho * alto</code>. El main ya imprime <code>area(4, 5)</code> y <code>area(3, 3)</code>: debe salir <b>20</b> y <b>9</b>.',
    starter: 'public class Main {\n    // escribe tu método aquí\n\n\n    public static void main(String[] args) {\n        System.out.println(area(4, 5));\n        System.out.println(area(3, 3));\n    }\n}\n',
    expected: '20\n9',
    require: [
      { re: /static\s+int\s+area\s*\(\s*int\s+\w+\s*,\s*int\s+\w+\s*\)/, msg: 'La firma debe ser: static int area(int ancho, int alto)' },
      { re: /\breturn\b/, msg: 'Devuelve el resultado con return.' },
    ],
    hint: 'static int area(int ancho, int alto) { return ancho * alto; }',
    solution: 'public class Main {\n    static int area(int ancho, int alto) {\n        return ancho * alto;\n    }\n\n    public static void main(String[] args) {\n        System.out.println(area(4, 5));\n        System.out.println(area(3, 3));\n    }\n}\n',
  },
  {
    name: 'El Mapa en Cuadrícula',
    theory: `
      <p>Un <b>array 2D</b> es un array de arrays: perfecto para tableros y mapas. Se lee <code>[fila][columna]</code>.</p>
      <pre>int[][] tablero = {
    {1, 2, 3},
    {4, 5, 6}
};
System.out.println(tablero[0][2]);      // 3  (fila 0, columna 2)
System.out.println(tablero.length);     // 2  (filas)
System.out.println(tablero[0].length);  // 3  (columnas de la fila 0)</pre>`,
    challenge: 'Crea <code>int[][] mapa = {{1, 2, 3}, {4, 5, 6}};</code> e imprime, en tres líneas: el valor de la fila 1 columna 2, el número de filas y el número de columnas. Debe salir <b>6</b>, <b>2</b> y <b>3</b>.',
    starter: tpl(),
    expected: '6\n2\n3',
    require: [
      { re: /\bint\s*\[\s*\]\s*\[\s*\]\s*mapa\s*=/, msg: 'Declara: int[][] mapa = {{1, 2, 3}, {4, 5, 6}};' },
      { re: /mapa\s*\[\s*1\s*\]\s*\[\s*2\s*\]/, msg: 'Lee la celda con mapa[1][2].' },
      { re: /mapa\.length/, msg: 'Usa mapa.length para las filas.' },
      { re: /mapa\s*\[\s*0\s*\]\.length/, msg: 'Usa mapa[0].length para las columnas.' },
    ],
    hint: 'println(mapa[1][2]);  println(mapa.length);  println(mapa[0].length);',
    solution: tpl('        int[][] mapa = {{1, 2, 3}, {4, 5, 6}};\n        System.out.println(mapa[1][2]);\n        System.out.println(mapa.length);\n        System.out.println(mapa[0].length);\n'),
  },
  {
    name: 'El Recorrido del Tablero',
    theory: `
      <p>Para visitar <b>todas</b> las celdas de un array 2D se usan dos <code>for</code>, uno dentro del otro: el de afuera recorre filas y el de adentro columnas.</p>
      <pre>for (int f = 0; f &lt; tablero.length; f++) {
    for (int c = 0; c &lt; tablero[f].length; c++) {
        System.out.println(tablero[f][c]);
    }
}</pre>`,
    challenge: 'Crea <code>int[][] tesoro = {{1, 2}, {3, 4}, {5, 6}};</code> y con dos <code>for</code> anidados suma todas las celdas. Imprime el total (<b>21</b>).',
    starter: tpl(),
    expected: '21',
    require: [
      { re: /\bint\s*\[\s*\]\s*\[\s*\]\s*tesoro\s*=/, msg: 'Declara: int[][] tesoro = {{1, 2}, {3, 4}, {5, 6}};' },
      { re: /\bfor\s*\([^]*\bfor\s*\(/, msg: 'Usa dos for anidados: uno para filas y otro para columnas.' },
      { re: /tesoro\.length/, msg: 'Usa tesoro.length y tesoro[f].length (no pongas los tamaños a mano).' },
    ],
    hint: 'int total = 0; for (f...) { for (c...) { total += tesoro[f][c]; } }',
    solution: tpl('        int[][] tesoro = {{1, 2}, {3, 4}, {5, 6}};\n        int total = 0;\n        for (int f = 0; f < tesoro.length; f++) {\n            for (int c = 0; c < tesoro[f].length; c++) {\n                total += tesoro[f][c];\n            }\n        }\n        System.out.println(total);\n'),
  },
  {
    name: 'JEFE: El Golem de Letras',
    theory: `
      <p>¡Hora de combinar! Un método puede recibir un <code>String</code> y un <code>char</code>, recorrer el texto y devolver un conteo.</p>
      <pre>static int contarEspacios(String texto) {
    int n = 0;
    for (int i = 0; i &lt; texto.length(); i++) {
        if (texto.charAt(i) == ' ') {
            n++;
        }
    }
    return n;
}</pre>`,
    challenge: 'Escribe <code>static int contar(String texto, char letra)</code> que devuelva cuántas veces aparece <code>letra</code> en <code>texto</code>. El main ya imprime <code>contar("abracadabra", \'a\')</code> y <code>contar("java", \'v\')</code>: debe salir <b>5</b> y <b>1</b>.',
    starter: "public class Main {\n    // método contar aquí\n\n\n    public static void main(String[] args) {\n        System.out.println(contar(\"abracadabra\", 'a'));\n        System.out.println(contar(\"java\", 'v'));\n    }\n}\n",
    expected: '5\n1',
    require: [
      { re: /static\s+int\s+contar\s*\(\s*String\s+\w+\s*,\s*char\s+\w+\s*\)/, msg: 'La firma debe ser: static int contar(String texto, char letra)' },
      { re: /\bfor\s*\(/, msg: 'Recorre el texto con un for.' },
      { re: /charAt\s*\(/, msg: 'Usa texto.charAt(i) para comparar cada letra.' },
    ],
    hint: 'Dentro: int n = 0; for (...) { if (texto.charAt(i) == letra) { n++; } } return n;',
    solution: "public class Main {\n    static int contar(String texto, char letra) {\n        int n = 0;\n        for (int i = 0; i < texto.length(); i++) {\n            if (texto.charAt(i) == letra) {\n                n++;\n            }\n        }\n        return n;\n    }\n\n    public static void main(String[] args) {\n        System.out.println(contar(\"abracadabra\", 'a'));\n        System.out.println(contar(\"java\", 'v'));\n    }\n}\n",
  },
];
