import { tpl } from './engine.js';

// World 3 — Objetos: classes, fields, constructors, this, methods, encapsulation, toString, inheritance.
const program = (classes, body) => `${classes}\n${tpl(body)}`;

export default [
  {
    name: 'El Molde de Héroes',
    theory: `
      <p>Una <b>clase</b> es un molde y un <b>objeto</b> es algo hecho con ese molde. La clase dice qué datos (<b>campos</b>) tiene cada objeto.</p>
      <pre>class Mascota {
    String nombre;
    int edad;
}

// en main:
Mascota m = new Mascota();   // new crea un objeto nuevo
m.nombre = "Rex";
m.edad = 3;
System.out.println(m.nombre);  // Rex</pre>
      <p>Las clases extra van <b>fuera</b> de <code>Main</code>, en el mismo archivo. Con el punto accedes a los campos de un objeto.</p>`,
    challenge: 'Crea la clase <code>Heroe</code> con <code>String nombre</code> e <code>int nivel</code>. En main crea un héroe, ponle nombre <code>"Leo"</code> y nivel <b>1</b>, e imprime <code>Leo nivel 1</code>.',
    starter: program('class Heroe {\n    // campos aquí\n}\n', '        // crea tu héroe aquí\n\n'),
    expected: 'Leo nivel 1',
    require: [
      { re: /class\s+Heroe\s*\{/, msg: 'Crea la clase: class Heroe { ... }' },
      { re: /\bString\s+nombre\s*;/, msg: 'La clase necesita el campo: String nombre;' },
      { re: /\bint\s+nivel\s*;/, msg: 'La clase necesita el campo: int nivel;' },
      { re: /new\s+Heroe\s*\(\s*\)/, msg: 'Crea el objeto con new Heroe();' },
    ],
    hint: 'Heroe h = new Heroe(); h.nombre = "Leo"; h.nivel = 1; System.out.println(h.nombre + " nivel " + h.nivel);',
    solution: program('class Heroe {\n    String nombre;\n    int nivel;\n}\n',
      '        Heroe h = new Heroe();\n        h.nombre = "Leo";\n        h.nivel = 1;\n        System.out.println(h.nombre + " nivel " + h.nivel);\n'),
  },
  {
    name: 'La Forja del Constructor',
    theory: `
      <p>Un <b>constructor</b> llena los campos al crear el objeto. Se llama igual que la clase y <b>no tiene tipo de retorno</b>.</p>
      <pre>class Mascota {
    String nombre;

    Mascota(String nombre) {
        this.nombre = nombre;
    }
}

Mascota m = new Mascota("Rex");</pre>
      <p><code>this.nombre</code> es el campo del objeto; <code>nombre</code> a secas es el parámetro. <code>this</code> deshace el empate cuando se llaman igual.</p>`,
    challenge: 'Crea la clase <code>Espada</code> con <code>String nombre</code>, <code>int danio</code> y un constructor <code>Espada(String nombre, int danio)</code>. En main crea <code>new Espada("Excalibur", 50)</code> e imprime <code>Excalibur: 50</code>.',
    starter: program('class Espada {\n    // campos y constructor aquí\n}\n', '        // crea la espada aquí\n\n'),
    expected: 'Excalibur: 50',
    require: [
      { re: /Espada\s*\(\s*String\s+\w+\s*,\s*int\s+\w+\s*\)\s*\{/, msg: 'El constructor debe ser: Espada(String nombre, int danio) { ... }' },
      { re: /this\.\w+\s*=/, msg: 'Dentro del constructor usa this.campo = parametro;' },
      { re: /new\s+Espada\s*\(\s*"Excalibur"\s*,\s*50\s*\)/, msg: 'Crea la espada con new Espada("Excalibur", 50);' },
    ],
    hint: 'Espada(String nombre, int danio) { this.nombre = nombre; this.danio = danio; }',
    solution: program('class Espada {\n    String nombre;\n    int danio;\n\n    Espada(String nombre, int danio) {\n        this.nombre = nombre;\n        this.danio = danio;\n    }\n}\n',
      '        Espada e = new Espada("Excalibur", 50);\n        System.out.println(e.nombre + ": " + e.danio);\n'),
  },
  {
    name: 'El Cofre que Habla',
    theory: `
      <p>Los objetos también tienen <b>métodos</b>: acciones que usan sus propios campos. Van dentro de la clase y <b>sin</b> <code>static</code>.</p>
      <pre>class Lampara {
    boolean encendida;

    void cambiar() {
        encendida = !encendida;   // usa el campo de ESTE objeto
    }
}

Lampara l = new Lampara();
l.cambiar();</pre>
      <p><code>void</code> significa que el método no devuelve nada. Dentro del método puedes usar los campos directamente.</p>`,
    challenge: 'Crea la clase <code>Cofre</code> con <code>int monedas</code>, un constructor <code>Cofre(int monedas)</code>, el método <code>void agregar(int n)</code> que sume <code>n</code> y el método <code>int total()</code> que devuelva las monedas. En main: crea un cofre con 10, agrega 5 e imprime <code>total()</code> (<b>15</b>).',
    starter: program('class Cofre {\n    // campo, constructor y métodos aquí\n}\n', '        // usa el cofre aquí\n\n'),
    expected: '15',
    require: [
      { re: /void\s+agregar\s*\(\s*int\s+\w+\s*\)/, msg: 'Falta el método: void agregar(int n)' },
      { re: /int\s+total\s*\(\s*\)/, msg: 'Falta el método: int total()' },
      { re: /\.agregar\s*\(\s*5\s*\)/, msg: 'En main llama a agregar(5) sobre el cofre.' },
      { re: /\.total\s*\(\s*\)/, msg: 'Imprime el resultado de total().' },
    ],
    hint: 'void agregar(int n) { monedas = monedas + n; }   int total() { return monedas; }',
    solution: program('class Cofre {\n    int monedas;\n\n    Cofre(int monedas) {\n        this.monedas = monedas;\n    }\n\n    void agregar(int n) {\n        monedas = monedas + n;\n    }\n\n    int total() {\n        return monedas;\n    }\n}\n',
      '        Cofre c = new Cofre(10);\n        c.agregar(5);\n        System.out.println(c.total());\n'),
  },
  {
    name: 'Los Gemelos Independientes',
    theory: `
      <p>Cada objeto tiene <b>sus propios</b> campos. Dos objetos de la misma clase no comparten datos: cambiar uno no toca al otro.</p>
      <pre>Lampara a = new Lampara();
Lampara b = new Lampara();
a.cambiar();
// a.encendida es true, b.encendida sigue false</pre>`,
    challenge: 'Crea la clase <code>Contador</code> con <code>int valor</code> y el método <code>void sumar()</code> que le sume 1. En main crea dos contadores <code>a</code> y <code>b</code>; suma 2 veces en <code>a</code> y 1 vez en <code>b</code>. Imprime <code>a.valor</code> y <code>b.valor</code> (<b>2</b> y <b>1</b>).',
    starter: program('class Contador {\n    // campo y método aquí\n}\n', '        // crea a y b aquí\n\n'),
    expected: '2\n1',
    require: [
      { re: /void\s+sumar\s*\(\s*\)/, msg: 'Falta el método: void sumar()' },
      { re: /new\s+Contador[^]*new\s+Contador/, msg: 'Crea DOS objetos Contador con new.' },
    ],
    hint: 'void sumar() { valor++; }  En main: a.sumar(); a.sumar(); b.sumar();',
    solution: program('class Contador {\n    int valor;\n\n    void sumar() {\n        valor++;\n    }\n}\n',
      '        Contador a = new Contador();\n        Contador b = new Contador();\n        a.sumar();\n        a.sumar();\n        b.sumar();\n        System.out.println(a.valor);\n        System.out.println(b.valor);\n'),
  },
  {
    name: 'La Bóveda Privada',
    theory: `
      <p><b>Encapsular</b> es proteger los datos: el campo se marca <code>private</code> y solo se cambia mediante métodos que ponen las reglas.</p>
      <pre>class Cuenta {
    private int saldo = 0;

    int getSaldo() {         // "getter": deja leer
        return saldo;
    }

    void retirar(int x) {    // pone reglas al cambiarlo
        if (x &lt;= saldo) {
            saldo = saldo - x;
        }
    }
}</pre>
      <p>Así nadie puede hacer <code>cuenta.saldo = -999</code> desde afuera.</p>`,
    challenge: 'Crea <code>Vida</code> con <code>private int puntos = 100</code>, <code>int getPuntos()</code> y <code>void recibirDanio(int d)</code> que reste <code>d</code> pero <b>nunca</b> baje de 0. En main: recibe 30 de daño e imprime los puntos (<b>70</b>); luego recibe 500 e imprime otra vez (<b>0</b>).',
    starter: program('class Vida {\n    // campo privado y métodos aquí\n}\n', '        // prueba la vida aquí\n\n'),
    expected: '70\n0',
    require: [
      { re: /private\s+int\s+puntos\s*=\s*100/, msg: 'El campo debe ser: private int puntos = 100;' },
      { re: /int\s+getPuntos\s*\(\s*\)/, msg: 'Falta el getter: int getPuntos()' },
      { re: /void\s+recibirDanio\s*\(\s*int\s+\w+\s*\)/, msg: 'Falta el método: void recibirDanio(int d)' },
      { re: /\.getPuntos\s*\(\s*\)/, msg: 'En main lee los puntos con getPuntos().' },
    ],
    hint: 'void recibirDanio(int d) { puntos = puntos - d; if (puntos < 0) { puntos = 0; } }',
    solution: program('class Vida {\n    private int puntos = 100;\n\n    int getPuntos() {\n        return puntos;\n    }\n\n    void recibirDanio(int d) {\n        puntos = puntos - d;\n        if (puntos < 0) {\n            puntos = 0;\n        }\n    }\n}\n',
      '        Vida v = new Vida();\n        v.recibirDanio(30);\n        System.out.println(v.getPuntos());\n        v.recibirDanio(500);\n        System.out.println(v.getPuntos());\n'),
  },
  {
    name: 'El Retrato Mágico',
    theory: `
      <p>Si imprimes un objeto, Java llama a su método <code>toString()</code>. Si no lo defines, sale algo feo como <code>Item@1b6d3586</code>.</p>
      <pre>class Item {
    String nombre;

    public String toString() {
        return "Item: " + nombre;
    }
}

System.out.println(miItem);   // Item: Poción</pre>
      <p><code>toString</code> debe ser <code>public</code> y devolver un <code>String</code>.</p>`,
    challenge: 'Crea <code>Item</code> con <code>String nombre</code>, <code>int precio</code>, un constructor con ambos y <code>public String toString()</code> que devuelva <code>nombre ($precio)</code>. En main imprime directamente <code>new Item("Poción", 25)</code>: debe salir <code>Poción ($25)</code>.',
    starter: program('class Item {\n    // campos, constructor y toString aquí\n}\n', '        // imprime el item aquí\n\n'),
    expected: 'Poción ($25)',
    require: [
      { re: /public\s+String\s+toString\s*\(\s*\)/, msg: 'Falta: public String toString()' },
      { re: /println\s*\(\s*(new\s+Item|\w+)\s*(\(.*\))?\s*\)\s*;/, msg: 'Imprime el objeto directamente: System.out.println(item);' },
    ],
    hint: 'public String toString() { return nombre + " ($" + precio + ")"; }',
    solution: program('class Item {\n    String nombre;\n    int precio;\n\n    Item(String nombre, int precio) {\n        this.nombre = nombre;\n        this.precio = precio;\n    }\n\n    public String toString() {\n        return nombre + " ($" + precio + ")";\n    }\n}\n',
      '        Item pocion = new Item("Poción", 25);\n        System.out.println(pocion);\n'),
  },
  {
    name: 'El Ejército de Objetos',
    theory: `
      <p>Un array puede guardar <b>objetos</b>. Se recorre igual que uno de números; cada elemento es un objeto con sus campos.</p>
      <pre>Mascota[] grupo = { new Mascota("Rex"), new Mascota("Luna") };
for (Mascota m : grupo) {      // "for-each": por cada m en grupo
    System.out.println(m.nombre);
}</pre>
      <p>El <b>for-each</b> (<code>for (Tipo x : array)</code>) es la forma corta de recorrer todo sin manejar índices.</p>`,
    challenge: 'La clase <code>Heroe</code> ya está hecha. Crea <code>Heroe[] equipo</code> con <code>new Heroe("Ana", 3)</code>, <code>new Heroe("Leo", 5)</code> y <code>new Heroe("Max", 4)</code>. Recórrelo y suma los niveles: imprime <b>12</b>.',
    starter: program('class Heroe {\n    String nombre;\n    int nivel;\n\n    Heroe(String nombre, int nivel) {\n        this.nombre = nombre;\n        this.nivel = nivel;\n    }\n}\n', '        // crea el equipo y suma los niveles aquí\n\n'),
    expected: '12',
    require: [
      { re: /Heroe\s*\[\s*\]\s*equipo\s*=/, msg: 'Declara: Heroe[] equipo = { ... };' },
      { re: /\bfor\s*\(/, msg: 'Recorre el equipo con un for.' },
      { re: /\.nivel/, msg: 'Suma el campo nivel de cada héroe.' },
    ],
    hint: 'int total = 0; for (Heroe h : equipo) { total += h.nivel; }',
    solution: program('class Heroe {\n    String nombre;\n    int nivel;\n\n    Heroe(String nombre, int nivel) {\n        this.nombre = nombre;\n        this.nivel = nivel;\n    }\n}\n',
      '        Heroe[] equipo = { new Heroe("Ana", 3), new Heroe("Leo", 5), new Heroe("Max", 4) };\n        int total = 0;\n        for (Heroe h : equipo) {\n            total += h.nivel;\n        }\n        System.out.println(total);\n'),
  },
  {
    name: 'La Herencia del Reino',
    theory: `
      <p>Con <code>extends</code> una clase <b>hereda</b> los campos y métodos de otra. La hija es "un tipo de" la madre.</p>
      <pre>class Vehiculo {
    String marca;
    Vehiculo(String marca) { this.marca = marca; }
    String describir() { return "Vehículo " + marca; }
}

class Moto extends Vehiculo {
    Moto(String marca) {
        super(marca);   // llama al constructor de Vehiculo
    }
}

new Moto("Yamaha").describir();   // "Vehículo Yamaha"</pre>
      <p><code>super(...)</code> va en la primera línea del constructor de la hija.</p>`,
    challenge: 'Ya existe <code>Animal</code> con <code>saludar()</code>. Crea <code>class Perro extends Animal</code> con un constructor <code>Perro(String nombre)</code> que llame a <code>super(nombre)</code>. En main imprime <code>new Perro("Rex").saludar()</code>: debe salir <code>Soy Rex</code>.',
    starter: program('class Animal {\n    String nombre;\n\n    Animal(String nombre) {\n        this.nombre = nombre;\n    }\n\n    String saludar() {\n        return "Soy " + nombre;\n    }\n}\n\n// clase Perro aquí\n', '        // crea el perro aquí\n\n'),
    expected: 'Soy Rex',
    require: [
      { re: /class\s+Perro\s+extends\s+Animal/, msg: 'Declara: class Perro extends Animal { ... }' },
      { re: /\bsuper\s*\(\s*\w+\s*\)/, msg: 'El constructor de Perro debe llamar a super(nombre);' },
      { re: /new\s+Perro\s*\(/, msg: 'Crea un Perro con new Perro("Rex").' },
    ],
    hint: 'class Perro extends Animal { Perro(String nombre) { super(nombre); } }',
    solution: program('class Animal {\n    String nombre;\n\n    Animal(String nombre) {\n        this.nombre = nombre;\n    }\n\n    String saludar() {\n        return "Soy " + nombre;\n    }\n}\n\nclass Perro extends Animal {\n    Perro(String nombre) {\n        super(nombre);\n    }\n}\n',
      '        Perro p = new Perro("Rex");\n        System.out.println(p.saludar());\n'),
  },
  {
    name: 'El Coro de la Granja',
    theory: `
      <p>Una hija puede <b>sobrescribir</b> un método de la madre para comportarse distinto. Se marca con <code>@Override</code> para que Java revise que de verdad existe en la madre.</p>
      <pre>class Instrumento {
    String tocar() { return "..."; }
}
class Tambor extends Instrumento {
    @Override
    String tocar() { return "Pum"; }
}

Instrumento x = new Tambor();
x.tocar();   // "Pum": se usa la versión del objeto real</pre>
      <p>A esto se le llama <b>polimorfismo</b>: el mismo llamado, distinto comportamiento según el objeto.</p>`,
    challenge: 'Ya existe <code>Animal</code> con <code>String sonido()</code> que devuelve <code>"..."</code>. Crea <code>Gato</code> (devuelve <code>"Miau"</code>) y <code>Vaca</code> (devuelve <code>"Muu"</code>), ambas con <code>@Override</code>. En main recorre <code>Animal[] granja = { new Gato(), new Vaca(), new Animal() }</code> imprimiendo cada <code>sonido()</code>.',
    starter: program('class Animal {\n    String sonido() {\n        return "...";\n    }\n}\n\n// clases Gato y Vaca aquí\n', '        Animal[] granja = { new Gato(), new Vaca(), new Animal() };\n        // recorre la granja aquí\n\n'),
    expected: 'Miau\nMuu\n...',
    require: [
      { re: /class\s+Gato\s+extends\s+Animal/, msg: 'Declara: class Gato extends Animal' },
      { re: /class\s+Vaca\s+extends\s+Animal/, msg: 'Declara: class Vaca extends Animal' },
      { re: /@Override[^]*@Override/, msg: 'Marca los dos métodos sobrescritos con @Override.' },
      { re: /\bfor\s*\(/, msg: 'Recorre la granja con un for.' },
    ],
    hint: 'class Gato extends Animal { @Override String sonido() { return "Miau"; } }  y en main: for (Animal a : granja) { println(a.sonido()); }',
    solution: program('class Animal {\n    String sonido() {\n        return "...";\n    }\n}\n\nclass Gato extends Animal {\n    @Override\n    String sonido() {\n        return "Miau";\n    }\n}\n\nclass Vaca extends Animal {\n    @Override\n    String sonido() {\n        return "Muu";\n    }\n}\n',
      '        Animal[] granja = { new Gato(), new Vaca(), new Animal() };\n        for (Animal a : granja) {\n            System.out.println(a.sonido());\n        }\n'),
  },
  {
    name: 'JEFE FINAL: El Dragón de Clases',
    theory: `
      <p>¡El último jefe! Junta todo: clases, constructor, encapsulación, <code>toString</code>, herencia y <code>@Override</code>. Una hija puede reutilizar el método de la madre con <code>super.metodo(...)</code>:</p>
      <pre>@Override
void recibir(int d) {
    super.recibir(d / 2);   // la armadura reduce el daño a la mitad
}</pre>`,
    challenge: `Ya existe <code>Personaje</code>. Crea <code>class Dragon extends Personaje</code> cuyo constructor <code>Dragon()</code> llame a <code>super("Dragón", 50)</code> y que sobrescriba <code>recibir(int d)</code> para recibir solo <b>la mitad</b> del daño usando <code>super.recibir(...)</code>. El main ya está escrito y debe imprimir:<br><code>Dragón (30)</code><br><code>Leo (0)</code><br><code>true</code><br><code>false</code>`,
    starter: program('class Personaje {\n    String nombre;\n    int vida;\n\n    Personaje(String nombre, int vida) {\n        this.nombre = nombre;\n        this.vida = vida;\n    }\n\n    void recibir(int d) {\n        vida = vida - d;\n        if (vida < 0) {\n            vida = 0;\n        }\n    }\n\n    boolean vivo() {\n        return vida > 0;\n    }\n\n    public String toString() {\n        return nombre + " (" + vida + ")";\n    }\n}\n\n// clase Dragon aquí\n',
      '        Dragon d = new Dragon();\n        Personaje h = new Personaje("Leo", 30);\n        d.recibir(40);\n        h.recibir(40);\n        System.out.println(d);\n        System.out.println(h);\n        System.out.println(d.vivo());\n        System.out.println(h.vivo());\n'),
    expected: 'Dragón (30)\nLeo (0)\ntrue\nfalse',
    require: [
      { re: /class\s+Dragon\s+extends\s+Personaje/, msg: 'Declara: class Dragon extends Personaje' },
      { re: /super\s*\(\s*"Dragón"\s*,\s*50\s*\)/, msg: 'El constructor debe llamar a super("Dragón", 50);' },
      { re: /@Override\s*void\s+recibir\s*\(\s*int\s+\w+\s*\)/, msg: 'Sobrescribe con @Override void recibir(int d)' },
      { re: /super\.recibir\s*\(/, msg: 'Reutiliza el método de la madre con super.recibir(...)' },
    ],
    hint: 'class Dragon extends Personaje { Dragon() { super("Dragón", 50); } @Override void recibir(int d) { super.recibir(d / 2); } }',
    solution: program('class Personaje {\n    String nombre;\n    int vida;\n\n    Personaje(String nombre, int vida) {\n        this.nombre = nombre;\n        this.vida = vida;\n    }\n\n    void recibir(int d) {\n        vida = vida - d;\n        if (vida < 0) {\n            vida = 0;\n        }\n    }\n\n    boolean vivo() {\n        return vida > 0;\n    }\n\n    public String toString() {\n        return nombre + " (" + vida + ")";\n    }\n}\n\nclass Dragon extends Personaje {\n    Dragon() {\n        super("Dragón", 50);\n    }\n\n    @Override\n    void recibir(int d) {\n        super.recibir(d / 2);\n    }\n}\n',
      '        Dragon d = new Dragon();\n        Personaje h = new Personaje("Leo", 30);\n        d.recibir(40);\n        h.recibir(40);\n        System.out.println(d);\n        System.out.println(h);\n        System.out.println(d.vivo());\n        System.out.println(h.vivo());\n'),
  },
];
