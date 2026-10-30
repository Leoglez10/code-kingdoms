import { describe, it, expect } from 'vitest';
import { compileCheck, transpile, execute } from './engine.js';

const main = body => `public class Main {\n    public static void main(String[] args) {\n${body}\n    }\n}\n`;
const run = src => {
  expect(compileCheck(src)).toBeNull();
  const r = execute(transpile(src));
  if (!r.ok) throw new Error(r.error);
  return r.out;
};

describe('Java engine: World 2 features', () => {
  it('truncates division between ints like Java', () => {
    expect(run(main('        int a = 7;\n        int b = 2;\n        System.out.println(a / b);\n        System.out.println(-7 / 2);'))).toEqual(['3', '-3']);
  });

  it('runs switch with case and default lines', () => {
    const src = main('        int x = 2;\n        switch (x) {\n            case 1:\n                System.out.println("uno");\n                break;\n            case 2:\n                System.out.println("dos");\n                break;\n            default:\n                System.out.println("otro");\n        }');
    expect(run(src)).toEqual(['dos']);
  });

  it('supports 2D array initializers, also across lines', () => {
    expect(run(main('        int[][] m = {{1, 2}, {3, 4}};\n        System.out.println(m[1][0] + m[0].length);'))).toEqual(['5']);
    expect(run(main('        int[][] m = {\n            {1, 2},\n            {3, 4}\n        };\n        System.out.println(m.length);'))).toEqual(['2']);
  });

  it('supports common String methods', () => {
    expect(run(main('        String s = "Hola";\n        System.out.println(s.contains("ol"));\n        System.out.println(s.isEmpty());\n        System.out.println(s.equalsIgnoreCase("HOLA"));'))).toEqual(['true', 'false', 'true']);
  });

  it('does not touch slashes inside strings', () => {
    expect(run(main('        int km = 10;\n        int h = 4;\n        System.out.println("km/h");'))).toEqual(['km/h']);
  });
});

describe('Java engine: World 3 classes', () => {
  const prog = (classes, body) => `${classes}\n\n${main(body)}`;

  it('creates objects with default field values', () => {
    expect(run(prog('class Heroe {\n    String nombre;\n    int nivel;\n    boolean listo;\n}',
      '        Heroe h = new Heroe();\n        System.out.println(h.nivel);\n        System.out.println(h.listo);\n        h.nombre = "Leo";\n        System.out.println(h.nombre);'))).toEqual(['0', 'false', 'Leo']);
  });

  it('resolves bare field and method names inside instance methods', () => {
    const cls = 'class Cofre {\n    private int monedas;\n    Cofre(int m) {\n        monedas = m;\n    }\n    void agregar(int n) {\n        monedas = monedas + n;\n    }\n    int total() {\n        return monedas;\n    }\n    String reporte() {\n        return "monedas: " + total();\n    }\n}';
    expect(run(prog(cls, '        Cofre c = new Cofre(10);\n        c.agregar(5);\n        System.out.println(c.reporte());'))).toEqual(['monedas: 15']);
  });

  it('keeps constructor parameters that shadow fields', () => {
    const cls = 'class Espada {\n    String nombre;\n    Espada(String nombre) {\n        this.nombre = nombre;\n    }\n}';
    expect(run(prog(cls, '        Espada e = new Espada("X");\n        System.out.println(e.nombre);'))).toEqual(['X']);
  });

  it('supports inheritance, super, @Override, toString and arrays of objects', () => {
    const cls = [
      'class Animal {',
      '    String nombre;',
      '    Animal(String nombre) {',
      '        this.nombre = nombre;',
      '    }',
      '    String sonido() {',
      '        return "...";',
      '    }',
      '    public String toString() {',
      '        return nombre + " hace " + sonido();',
      '    }',
      '}',
      'class Gato extends Animal {',
      '    Gato() {',
      '        super("Michi");',
      '    }',
      '    @Override',
      '    String sonido() {',
      '        return "Miau";',
      '    }',
      '}',
    ].join('\n');
    const body = '        Animal[] zoo = { new Gato(), new Animal("Rex") };\n        for (Animal a : zoo) {\n            System.out.println(a);\n        }';
    expect(run(prog(cls, body))).toEqual(['Michi hace Miau', 'Rex hace ...']);
  });

  it('calls super() implicitly in subclass constructors', () => {
    const cls = 'class Base {\n    int x = 1;\n}\nclass Hija extends Base {\n    int y;\n    Hija() {\n        y = x + 1;\n    }\n}';
    expect(run(prog(cls, '        Hija h = new Hija();\n        System.out.println(h.y);'))).toEqual(['2']);
  });
});
