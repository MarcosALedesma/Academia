CONTENIDO.angular2 = [];

(function () {
    'use strict';

    /* ------------------------------------------------------------------------
     * Ayudas
     * ---------------------------------------------------------------------- */

    var TRES = [
        "    { id: 1, paciente: 'Ana Gómez', fecha: '2026-08-24', hora: '09:00', estado: 'pendiente' },",
        "    { id: 2, paciente: 'Luis Pérez', fecha: '2026-08-24', hora: '10:30', estado: 'confirmado' },",
        "    { id: 3, paciente: 'Sofía Ruiz', fecha: '2026-08-24', hora: '11:00', estado: 'pendiente' }"
    ].join('\n');

    var CUATRO = [
        "    { id: 1, paciente: 'Ana Gómez', fecha: '2026-08-24', hora: '09:00', estado: 'pendiente' },",
        "    { id: 2, paciente: 'Luis Pérez', fecha: '2026-08-24', hora: '10:30', estado: 'confirmado' },",
        "    { id: 3, paciente: 'Sofía Ruiz', fecha: '2026-08-24', hora: '11:00', estado: 'pendiente' },",
        "    { id: 4, paciente: 'Marcos Díaz', fecha: '2026-08-24', hora: '12:15', estado: 'cancelado' }"
    ].join('\n');

    function C(t) {
        return t.replace(/^\n/, '').replace(/@@TRES@@/g, TRES).replace(/@@CUATRO@@/g, CUATRO);
    }

    function imp(nombre, modulo) {
        return 'import\\s*\\{[^}]*\\b' + nombre + '\\b[^}]*\\}\\s*from\\s*.' + modulo;
    }

    function moduloDe(hijos, conFormularios) {
        var l = [
            "import { NgModule } from '@angular/core';",
            "import { BrowserModule } from '@angular/platform-browser';"
        ];
        if (conFormularios) l.push("import { FormsModule } from '@angular/forms';");
        l.push("import { AppComponent } from './app.component';");
        hijos.forEach(function (h) { l.push('import { ' + h[0] + " } from '" + h[1] + "';"); });
        var nombres = ['AppComponent'].concat(hijos.map(function (h) { return h[0]; }));
        l.push('');
        l.push('@NgModule({');
        l.push('  declarations: [');
        l.push('    ' + nombres.join(',\n    '));
        l.push('  ],');
        l.push('  imports: [BrowserModule' + (conFormularios ? ', FormsModule' : '') + '],');
        l.push('  bootstrap: [AppComponent]');
        l.push('})');
        l.push('export class AppModule { }');
        l.push('');
        return l.join('\n');
    }

    var TURNO_MODEL = C(`
export interface Turno {
  id: number;
  paciente: string;
  fecha: string;
  hora: string;
  estado: 'pendiente' | 'confirmado' | 'cancelado';
}
`);

    var pasos = [

    /* ------------------------------------------------------------------------
     * Interfaces
     * ---------------------------------------------------------------------- */

{
    id: 'p01',
    titulo: 'Interfaces: el contrato de los datos',
    minutos: 14,
    abrir: 'app/models/turno.model.ts',

    teoria: [
        { h: 'Un contrato para tus datos' },
        { p: 'Una **interface** describe qué propiedades tiene un objeto y de qué tipo es cada una. Es un contrato: cualquier objeto que se declare como `Alumno` tiene que cumplirlo.' },
        { codigo: C(`
export interface Alumno {
  legajo: number;
  nombre: string;
  nota: number;
}
`), archivo: 'models/alumno.model.ts' },
        { clave: 'Una interface **no genera código JavaScript**. Existe sólo en tiempo de compilación: cuando TypeScript se convierte a JS, desaparece por completo. Su única función es que el editor te avise si te equivocaste, antes de que la aplicación se rompa en el navegador.' },

        { h: 'Qué errores detecta' },
        { codigo: C(`
const a: Alumno = { legajo: 101, nombre: 'Ana', nota: 8 };           // correcto
const b: Alumno = { legajo: 101, nombre: 'Ana' };                      // falta nota
const c: Alumno = { legajo: '101', nombre: 'Ana', nota: 8 };           // legajo tiene que ser number
const d: Alumno = { legajo: 101, nombre: 'Ana', nota: 8, edad: 20 };   // edad no existe en Alumno
`), archivo: 'tres errores, marcados mientras escribís' },
        { p: 'Los tres errores los marca el editor **mientras escribís**, y además te da autocompletado: escribís `alumno.` y aparecen las propiedades disponibles.' },
        { nota: 'En esta pantalla los tipos se borran al compilar y **no se comprueban**: un `nota: string = 8` no marca error acá. El aviso de tipos lo da tu editor (VS Code). Por eso en este paso se verifica que la interface esté bien escrita, no que un compilador la chequee.' },

        { h: 'Union types de valores literales' },
        { codigo: C(`
export interface Turno {
  id: number;
  paciente: string;
  estado: 'pendiente' | 'confirmado' | 'cancelado';
}
`), archivo: 'models/turno.model.ts' },
        { p: 'La propiedad `estado` no es un string cualquiera: sólo esos tres textos exactos son válidos.' },
        { codigo: C(`
turno.estado = 'confirmado';    // correcto
turno.estado = 'confirmadoo';   // error de compilación
turno.estado = 'listo';         // error de compilación
`), archivo: 'un error de tipeo se marca al escribir' },

        { h: 'Propiedades opcionales' },
        { p: 'El signo de pregunta hace que una propiedad pueda faltar:' },
        { codigo: C(`
export interface Alumno {
  legajo: number;
  nombre: string;
  email?: string;
}
`), archivo: 'email es opcional' },

        { h: 'Dónde va el archivo' },
        { p: 'Por convención, cada interface va en su propio archivo terminado en `.model.ts`, dentro de una carpeta `models`. **El `export` es obligatorio** para poder importarla desde otro archivo. Y como no existe en tiempo de ejecución, **no va en `app.module.ts`**: Angular ni se entera de que existe.' },
        { codigo: C(`
// desde src/app/carta-alumno/carta-alumno.component.ts
import { Alumno } from '../models/alumno.model';

// desde src/app/app.component.ts
import { Alumno } from './models/alumno.model';
`), archivo: '../ sube una carpeta, ./ es la carpeta actual' }
    ],

    consigna: [
        { p: 'El padre ya tipa su array con `Turno[]` y muestra las observaciones sólo cuando existen, pero el archivo `turno.model.ts` está vacío. Escribí la interface:' },
        { numerada: [
            'Exportala: `export interface Turno`.',
            'Con `id` de tipo `number`, y `paciente`, `fecha` y `hora` de tipo `string`.',
            'Con `estado` como **union type** de literales: `pendiente`, `confirmado` y `cancelado`.',
            'Con `observaciones` **opcional**, de tipo `string`.'
        ] }
    ],

    semilla: {
        'app/app.module.ts': moduloDe([]),
        'app/models/turno.model.ts': '// Definí acá la interface Turno\n',
        'app/app.component.ts': C(`
import { Component } from '@angular/core';
import { Turno } from './models/turno.model';

@Component({
  selector: 'app-root',
  template: \`
    <h2>Agenda</h2>
    <ul id="lista">
      <li *ngFor="let t of turnos">
        {{ t.hora }} - {{ t.paciente }} ({{ t.estado }})
        <em class="obs" *ngIf="t.observaciones">{{ t.observaciones }}</em>
      </li>
    </ul>
  \`
})
export class AppComponent {
  turnos: Turno[] = [
    { id: 1, paciente: 'Ana Gómez', fecha: '2026-08-24', hora: '09:00', estado: 'pendiente', observaciones: 'Trae estudios' },
    { id: 2, paciente: 'Luis Pérez', fecha: '2026-08-24', hora: '10:30', estado: 'confirmado' }
  ];
}
`)
    },

    solucion: {
        'app/models/turno.model.ts': C(`
export interface Turno {
  id: number;
  paciente: string;
  fecha: string;
  hora: string;
  estado: 'pendiente' | 'confirmado' | 'cancelado';
  observaciones?: string;
}
`)
    },

    chequeos: [
        { fuente: { archivo: 'app/models/turno.model.ts', debeTener: [
            { re: 'export\\s+interface\\s+Turno\\b', que: 'Falta exportar la interface:  export interface Turno { ... }' },
            { re: '\\bid\\s*:\\s*number', que: 'Falta id de tipo number.' },
            { re: 'paciente\\s*:\\s*string', que: 'Falta paciente de tipo string.' },
            { re: 'fecha\\s*:\\s*string', que: 'Falta fecha de tipo string.' },
            { re: 'hora\\s*:\\s*string', que: 'Falta hora de tipo string.' },
            { re: 'estado\\s*:[^;]*pendiente', que: "estado tiene que incluir el literal 'pendiente'." },
            { re: 'estado\\s*:[^;]*confirmado', que: "estado tiene que incluir el literal 'confirmado'." },
            { re: 'estado\\s*:[^;]*cancelado', que: "estado tiene que incluir el literal 'cancelado'." },
            { re: 'observaciones\\s*\\?\\s*:\\s*string', que: 'observaciones tiene que ser opcional:  observaciones?: string;' }
          ],
          noDebeTener: [
            { re: 'estado\\s*:\\s*string', que: 'estado no puede ser un string cualquiera: tiene que ser un union type de los tres valores.' }
          ] } },
        { arranca: true },
        { sinErrores: true },
        { dom: { contar: { selector: '#lista li', es: 2 } } },
        { dom: { contar: { selector: '.obs', es: 1 } },
          pista: 'Sólo el primer turno tiene observaciones.' },
        { dom: { textos: { selector: '.obs', igual: ['Trae estudios'] } } }
    ]
},

{
    id: 'p02',
    titulo: 'Interface, class y tipos derivados',
    minutos: 14,
    abrir: 'app/models/producto.model.ts',

    teoria: [
        { h: 'Interface o class' },
        { tabla: {
            cabeceras: ['Aspecto', '`interface`', '`class`'],
            filas: [
                ['Genera código JavaScript', 'No', 'Sí'],
                ['Puede tener métodos con lógica', 'No', 'Sí'],
                ['Se instancia con `new`', 'No', 'Sí'],
                ['Para qué se usa', 'Modelar datos que se leen y se transportan', 'Objetos con comportamiento propio']
            ]
        } },
        { clave: 'Si el objeto sólo lleva datos (un turno, un alumno, un producto), se usa **interface**: es más liviana. Se reserva **class** para cuando el objeto necesita métodos propios.' },
        { codigo: C(`
export class Producto {
  constructor(public nombre: string, public precio: number) {}

  precioConIva(): number {
    return (this.precio * 121) / 100;
  }
}

const teclado = new Producto('Teclado', 1000);
teclado.precioConIva();   // 1210
`), archivo: 'models/producto.model.ts' },
        { p: 'Escribir `public` delante de un parámetro del constructor hace dos cosas a la vez: lo declara como parámetro y crea una propiedad de la clase con ese valor. Es azúcar sintáctica de TypeScript.' },

        { h: 'Tipar lo que viaja' },
        { p: 'Las interfaces sirven para tipar arrays, `@Input`, `@Output` y parámetros de métodos:' },
        { codigo: C(`
@Input() turno!: Turno;
@Output() turnoConfirmado = new EventEmitter<Turno>();

cambiarEstado(id: number, nuevoEstado: Turno['estado']): void {
  const t = this.turnos.find(x => x.id === id);
  if (t) { t.estado = nuevoEstado; }
}
`), archivo: 'tres usos' },
        { p: "`Turno['estado']` significa \"el tipo que tiene la propiedad `estado` dentro de `Turno`\". Así, si mañana se agrega un cuarto estado, este método se actualiza solo." }
    ],

    consigna: [
        { p: 'El padre ya crea dos productos con `new Producto(...)` y muestra el precio con IVA, pero la class no existe todavía. Escribila en `producto.model.ts`:' },
        { numerada: [
            'Exportala: `export class Producto`.',
            'Con un constructor que reciba `public nombre: string` y `public precio: number`.',
            'Con un método `precioConIva()` que devuelva el precio más el 21%.'
        ] },
        { p: 'El teclado de 1000 tiene que dar 1210, y el mouse de 500, 605.' }
    ],

    semilla: {
        'app/app.module.ts': moduloDe([]),
        'app/models/producto.model.ts': '// Escribí acá la class Producto\n',
        'app/app.component.ts': C(`
import { Component } from '@angular/core';
import { Producto } from './models/producto.model';

@Component({
  selector: 'app-root',
  template: \`
    <h2>Productos</h2>
    <ul id="lista">
      <li *ngFor="let p of productos">{{ p.nombre }}: {{ p.precioConIva() }}</li>
    </ul>
  \`
})
export class AppComponent {
  productos: Producto[] = [
    new Producto('Teclado', 1000),
    new Producto('Mouse', 500)
  ];
}
`)
    },

    solucion: {
        'app/models/producto.model.ts': C(`
export class Producto {
  constructor(public nombre: string, public precio: number) {}

  precioConIva(): number {
    return (this.precio * 121) / 100;
  }
}
`)
    },

    chequeos: [
        { fuente: { archivo: 'app/models/producto.model.ts', debeTener: [
            { re: 'export\\s+class\\s+Producto\\b', que: 'Falta exportar la class:  export class Producto { ... }' },
            { re: 'constructor\\s*\\(', que: 'Falta el constructor.' },
            { re: 'public\\s+nombre\\s*:\\s*string', que: 'El constructor tiene que recibir  public nombre: string.' },
            { re: 'public\\s+precio\\s*:\\s*number', que: 'El constructor tiene que recibir  public precio: number.' },
            { re: 'precioConIva\\s*\\(\\s*\\)', que: 'Falta el método precioConIva().' }
          ] } },
        { arranca: true },
        { sinErrores: true,
          pista: 'Si dice que Producto no es un constructor, revisá que la class esté exportada.' },
        { dom: { contar: { selector: '#lista li', es: 2 } } },
        { dom: { textos: { selector: '#lista li', igual: ['Teclado: 1210', 'Mouse: 605'] } },
          pista: 'El precio con IVA es el precio por 1,21: 1000 da 1210 y 500 da 605.' }
    ]
},

    /* ------------------------------------------------------------------------
     * Servicios
     * ---------------------------------------------------------------------- */

{
    id: 'p03',
    titulo: 'Tu primer servicio',
    minutos: 18,
    abrir: 'app/servicios/turnos.service.ts',

    teoria: [
        { h: 'Por qué sacar los datos del componente' },
        { p: 'Hasta ahora los arrays vivían como propiedades del componente. Funciona para ejemplos chicos, pero trae tres problemas apenas la aplicación crece:' },
        { lista: [
            'Si dos componentes que **no son padre e hijo** necesitan los mismos datos, no hay forma de compartirlos sin duplicar código.',
            'Si mañana los datos vienen de una API en vez de estar escritos a mano, hay que **tocar cada componente** que los usa.',
            'Se mezcla "cómo se ven los datos" con "de dónde salen los datos": el componente hace dos trabajos.'
        ] },
        { p: 'La solución de Angular es el **servicio**: una clase independiente de cualquier componente, cuya única responsabilidad es manejar un tipo de dato, y que cualquier componente puede consumir.' },

        { h: 'Crear un servicio' },
        { terminal: 'ng generate service servicios/turnos\nng g s servicios/turnos        # abreviado' },
        { codigo: C(`
import { Injectable } from '@angular/core';
import { Turno } from '../models/turno.model';

@Injectable({
  providedIn: 'root'
})
export class TurnosService {
  private turnos: Turno[] = [
    { id: 1, paciente: 'Ana Gómez', fecha: '2026-08-24', hora: '09:00', estado: 'pendiente' }
  ];

  obtenerTodos(): Turno[] {
    return this.turnos;
  }
}
`), archivo: 'servicios/turnos.service.ts' },
        { clave: '`providedIn: \'root\'` le indica a Angular que este servicio es un **singleton**: una única instancia compartida por toda la aplicación. Cualquier componente que lo pida trabaja sobre el mismo array, no sobre copias. Y el array es `private` a propósito: los componentes no lo tocan directo, sino a través de los métodos que el servicio expone.' },

        { h: 'Inyectar y consumir' },
        { codigo: C(`
export class ListaTurnosComponent implements OnInit {
  turnos: Turno[] = [];

  constructor(private turnosService: TurnosService) {}

  ngOnInit(): void {
    this.turnos = this.turnosService.obtenerTodos();
  }
}
`), archivo: 'lista-turnos.component.ts' },
        { p: 'Escribir `private turnosService: TurnosService` en el constructor le **pide** a Angular el servicio: él lo crea (una sola vez) y te lo entrega. Además declara el parámetro y crea una propiedad privada con ese valor.' },
        { nota: 'El servicio **nunca se crea con `new`**. Si escribís `new TurnosService()` te salteás la inyección y cada componente tendría su propia copia. Y la carga de datos va en `ngOnInit`, no en el constructor: el constructor es sólo para pedir dependencias.' }
    ],

    consigna: [
        { p: 'El servicio tiene el array pero todavía no es un servicio de verdad, y el componente no lo usa. Arreglá los dos:' },
        { numerada: [
            'En **`turnos.service.ts`**: agregá `@Injectable({ providedIn: \'root\' })` a la clase, e importá `Injectable`.',
            'Agregá el método `obtenerTodos(): Turno[]`, que devuelve el array.',
            'En **`app.component.ts`**: pedí el servicio en el constructor con `private turnosService: TurnosService`.',
            'En `ngOnInit()`, cargá `this.turnos` con lo que devuelve `obtenerTodos()`.'
        ] }
    ],

    semilla: {
        'app/app.module.ts': moduloDe([]),
        'app/models/turno.model.ts': TURNO_MODEL,
        'app/servicios/turnos.service.ts': C(`
import { Injectable } from '@angular/core';
import { Turno } from '../models/turno.model';

export class TurnosService {
  private turnos: Turno[] = [
@@TRES@@
  ];

  constructor() {}
}
`),
        'app/app.component.ts': C(`
import { Component, OnInit } from '@angular/core';
import { Turno } from './models/turno.model';
import { TurnosService } from './servicios/turnos.service';

@Component({
  selector: 'app-root',
  template: \`
    <h2>Turnos</h2>
    <ul id="lista">
      <li *ngFor="let t of turnos">{{ t.hora }} - {{ t.paciente }} ({{ t.estado }})</li>
    </ul>
  \`
})
export class AppComponent implements OnInit {
  turnos: Turno[] = [];

  constructor() {}

  ngOnInit(): void {
  }
}
`)
    },

    solucion: {
        'app/servicios/turnos.service.ts': C(`
import { Injectable } from '@angular/core';
import { Turno } from '../models/turno.model';

@Injectable({
  providedIn: 'root'
})
export class TurnosService {
  private turnos: Turno[] = [
@@TRES@@
  ];

  constructor() {}

  obtenerTodos(): Turno[] {
    return this.turnos;
  }
}
`),
        'app/app.component.ts': C(`
import { Component, OnInit } from '@angular/core';
import { Turno } from './models/turno.model';
import { TurnosService } from './servicios/turnos.service';

@Component({
  selector: 'app-root',
  template: \`
    <h2>Turnos</h2>
    <ul id="lista">
      <li *ngFor="let t of turnos">{{ t.hora }} - {{ t.paciente }} ({{ t.estado }})</li>
    </ul>
  \`
})
export class AppComponent implements OnInit {
  turnos: Turno[] = [];

  constructor(private turnosService: TurnosService) {}

  ngOnInit(): void {
    this.turnos = this.turnosService.obtenerTodos();
  }
}
`)
    },

    chequeos: [
        { fuente: { archivo: 'app/servicios/turnos.service.ts', debeTener: [
            { re: imp('Injectable', '@angular/core'), que: "Falta importar Injectable desde '@angular/core'." },
            { re: '@Injectable\\(\\s*\\{\\s*providedIn\\s*:\\s*.root', que: "Falta @Injectable({ providedIn: 'root' }) delante de la clase." },
            { re: 'private\\s+turnos', que: 'El array tiene que seguir siendo private.' },
            { re: 'obtenerTodos\\s*\\(\\s*\\)\\s*:\\s*Turno\\[\\]', que: 'Falta el método  obtenerTodos(): Turno[].' }
          ] } },
        { fuente: { debeTener: [
            { re: 'constructor\\s*\\(\\s*private\\s+\\w+\\s*:\\s*TurnosService', que: 'Falta pedir el servicio en el constructor:  constructor(private turnosService: TurnosService) {}' },
            { re: 'ngOnInit\\s*\\(\\s*\\)\\s*(:\\s*void\\s*)?\\{[^}]*obtenerTodos\\s*\\(', que: 'Falta cargar los turnos en ngOnInit() con obtenerTodos().' }
          ],
          noDebeTener: [
            { re: 'constructor\\s*\\([^)]*\\)\\s*\\{[^}]*obtenerTodos', que: 'La carga de datos va en ngOnInit, no en el constructor.' },
            { re: 'new\\s+TurnosService', que: 'El servicio no se crea con new: lo inyecta Angular por el constructor.' }
          ] } },
        { arranca: true },
        { sinErrores: true,
          pista: 'Si dice No provider for TurnosService, falta @Injectable({ providedIn: \'root\' }) en el servicio.' },
        { dom: { contar: { selector: '#lista li', es: 3 } } },
        { dom: { textos: { selector: '#lista li', igual: ['09:00 - Ana Gómez (pendiente)', '10:30 - Luis Pérez (confirmado)', '11:00 - Sofía Ruiz (pendiente)'] } } }
    ]
},

{
    id: 'p04',
    titulo: 'Un servicio con CRUD',
    minutos: 20,
    abrir: 'app/servicios/turnos.service.ts',

    teoria: [
        { h: 'Array privado, métodos públicos' },
        { p: 'Un servicio de datos expone un conjunto de operaciones sobre su array interno. Se las conoce como **CRUD**: crear, leer, actualizar y eliminar.' },
        { codigo: C(`
obtenerTodos(): Turno[] {
  return this.turnos;
}

obtenerPorId(id: number): Turno | undefined {
  return this.turnos.find(t => t.id === id);
}

agregar(nuevoTurno: Turno): void {
  this.turnos.push(nuevoTurno);
}

cambiarEstado(id: number, nuevoEstado: Turno['estado']): void {
  const turno = this.turnos.find(t => t.id === id);
  if (turno) {
    turno.estado = nuevoEstado;
  }
}

eliminar(id: number): void {
  this.turnos = this.turnos.filter(t => t.id !== id);
}
`), archivo: 'dentro de TurnosService' },
        { p: '`obtenerPorId` devuelve `Turno | undefined` porque `find` puede no encontrar nada: por eso los métodos que modifican preguntan `if (turno)` antes de tocarlo.' },
        { clave: 'Este patrón (**array privado más métodos públicos**) es exactamente lo que después se reemplaza por llamadas HTTP. La forma de usar el servicio desde el componente no cambia casi nada: sólo cambia lo que pasa adentro de cada método.' },
        { nota: '`eliminar` **reasigna** el array del servicio (`this.turnos = ...filter(...)`). Un componente que guardó la referencia vieja no se entera. Por eso el componente de este paso vuelve a pedir la lista después de cada acción.' }
    ],

    consigna: [
        { p: 'El componente ya está completo: muestra los turnos, tiene botones para confirmar, cancelar y eliminar cada uno, y un botón para agregar. Pero el servicio sólo sabe devolver la lista. Completalo con los cuatro métodos que faltan:' },
        { numerada: [
            '`obtenerPorId(id: number): Turno | undefined`.',
            '`agregar(nuevoTurno: Turno): void`, que agrega el turno al array.',
            '`cambiarEstado(id: number, nuevoEstado: Turno[\'estado\']): void`, que busca el turno y le cambia el estado.',
            '`eliminar(id: number): void`, que saca del array el turno con ese id.'
        ] }
    ],

    semilla: {
        'app/app.module.ts': moduloDe([]),
        'app/models/turno.model.ts': TURNO_MODEL,
        'app/servicios/turnos.service.ts': C(`
import { Injectable } from '@angular/core';
import { Turno } from '../models/turno.model';

@Injectable({
  providedIn: 'root'
})
export class TurnosService {
  private turnos: Turno[] = [
@@TRES@@
  ];

  obtenerTodos(): Turno[] {
    return this.turnos;
  }
}
`),
        'app/app.component.ts': C(`
import { Component, OnInit } from '@angular/core';
import { Turno } from './models/turno.model';
import { TurnosService } from './servicios/turnos.service';

@Component({
  selector: 'app-root',
  template: \`
    <h2>Turnos</h2>
    <ul id="lista">
      <li *ngFor="let t of turnos" [ngClass]="t.estado">
        <span class="dato">{{ t.paciente }} ({{ t.estado }})</span>
        <button class="btn-confirmar" (click)="confirmar(t.id)">Confirmar</button>
        <button class="btn-cancelar" (click)="cancelar(t.id)">Cancelar</button>
        <button class="btn-eliminar" (click)="eliminar(t.id)">Eliminar</button>
      </li>
    </ul>
    <button id="agregar" (click)="agregarNuevo()">Agregar turno</button>
    <p id="cantidad">Turnos: {{ turnos.length }}</p>
  \`
})
export class AppComponent implements OnInit {
  turnos: Turno[] = [];

  constructor(private turnosService: TurnosService) {}

  ngOnInit(): void {
    this.recargar();
  }

  confirmar(id: number): void {
    this.turnosService.cambiarEstado(id, 'confirmado');
    this.recargar();
  }

  cancelar(id: number): void {
    this.turnosService.cambiarEstado(id, 'cancelado');
    this.recargar();
  }

  eliminar(id: number): void {
    this.turnosService.eliminar(id);
    this.recargar();
  }

  agregarNuevo(): void {
    this.turnosService.agregar({ id: 4, paciente: 'Marcos Díaz', fecha: '2026-08-24', hora: '12:15', estado: 'pendiente' });
    this.recargar();
  }

  private recargar(): void {
    this.turnos = this.turnosService.obtenerTodos();
  }
}
`)
    },

    solucion: {
        'app/servicios/turnos.service.ts': C(`
import { Injectable } from '@angular/core';
import { Turno } from '../models/turno.model';

@Injectable({
  providedIn: 'root'
})
export class TurnosService {
  private turnos: Turno[] = [
@@TRES@@
  ];

  obtenerTodos(): Turno[] {
    return this.turnos;
  }

  obtenerPorId(id: number): Turno | undefined {
    return this.turnos.find(t => t.id === id);
  }

  agregar(nuevoTurno: Turno): void {
    this.turnos.push(nuevoTurno);
  }

  cambiarEstado(id: number, nuevoEstado: Turno['estado']): void {
    const turno = this.turnos.find(t => t.id === id);
    if (turno) {
      turno.estado = nuevoEstado;
    }
  }

  eliminar(id: number): void {
    this.turnos = this.turnos.filter(t => t.id !== id);
  }
}
`)
    },

    chequeos: [
        { fuente: { archivo: 'app/servicios/turnos.service.ts', debeTener: [
            { re: 'obtenerPorId\\s*\\(\\s*id\\s*:\\s*number\\s*\\)', que: 'Falta  obtenerPorId(id: number).' },
            { re: 'agregar\\s*\\(\\s*\\w+\\s*:\\s*Turno\\s*\\)', que: 'Falta  agregar(nuevoTurno: Turno).' },
            { re: 'cambiarEstado\\s*\\(\\s*id\\s*:\\s*number\\s*,\\s*\\w+\\s*:\\s*Turno\\[\\s*.estado.\\s*\\]', que: "Falta cambiarEstado(id: number, nuevoEstado: Turno['estado'])." },
            { re: 'eliminar\\s*\\(\\s*id\\s*:\\s*number\\s*\\)', que: 'Falta  eliminar(id: number).' }
          ] } },
        { arranca: true },
        { sinErrores: true,
          pista: 'Si dice que un método no es una función, todavía falta escribirlo en el servicio.' },
        { dom: { textos: { selector: '#cantidad', igual: ['Turnos: 3'] } } },
        { accion: { clic: '.btn-confirmar' } },
        { dom: { textos: { selector: '.dato', igual: ['Ana Gómez (confirmado)', 'Luis Pérez (confirmado)', 'Sofía Ruiz (pendiente)'] } },
          pista: 'Al confirmar el primer turno tiene que pasar a confirmado. Revisá cambiarEstado: buscá el turno con find y cambiale el estado.' },
        { accion: { clic: '.btn-cancelar' } },
        { dom: { textos: { selector: '.dato', igual: ['Ana Gómez (cancelado)', 'Luis Pérez (confirmado)', 'Sofía Ruiz (pendiente)'] } },
          pista: 'Al cancelar el primer turno tiene que pasar a cancelado.' },
        { accion: { clic: '.btn-eliminar' } },
        { dom: { textos: { selector: '#cantidad', igual: ['Turnos: 2'] } },
          pista: 'Al eliminar el primer turno tienen que quedar 2. eliminar tiene que sacar del array el turno con ese id.' },
        { dom: { textos: { selector: '.dato', igual: ['Luis Pérez (confirmado)', 'Sofía Ruiz (pendiente)'] } } },
        { accion: { clic: '#agregar' } },
        { dom: { textos: { selector: '.dato', igual: ['Luis Pérez (confirmado)', 'Sofía Ruiz (pendiente)', 'Marcos Díaz (pendiente)'] } },
          pista: 'agregar tiene que sumar el turno al final del array, con push.' }
    ]
},

{
    id: 'p05',
    titulo: 'Un servicio, dos componentes',
    minutos: 16,
    abrir: 'app/nuevo-turno/nuevo-turno.component.ts',

    teoria: [
        { h: 'El singleton en acción' },
        { p: 'Como el servicio es **una sola instancia** para toda la aplicación, dos componentes que no tienen ninguna relación entre sí pueden compartir datos: ninguno le pasa nada al otro. Los dos hablan con el mismo servicio.' },
        { diagrama: 'NuevoTurnoComponent ──agregar()──▶ ┌────────────────┐\n                                   │ TurnosService  │  una sola instancia\nListaTurnosComponent ◀─obtenerTodos()─ │  turnos: [...] │\n                                   └────────────────┘' },
        { p: 'Sin servicio, para que un formulario le avise a una lista habría que subir el dato con `@Output` hasta un padre común y volver a bajarlo con `@Input`. Con un servicio, cada componente se conecta directo.' },
        { clave: '`providedIn: \'root\'` es lo que garantiza que **los dos componentes reciban la misma instancia**. Si cada uno creara la suya con `new`, el formulario agregaría a un array y la lista leería otro.' },
        { nota: 'Funciona porque `obtenerTodos()` devuelve **la misma referencia** del array y `agregar` usa `push`. La lista ve el cambio sin pedir nada. Más adelante vas a ver una forma más robusta de avisar cambios: `BehaviorSubject`.' }
    ],

    consigna: [
        { p: 'El proyecto tiene una lista de turnos y un formulario para agregar uno. La lista ya está completa, pero el formulario todavía no le agrega nada al servicio:' },
        { numerada: [
            'En **`nuevo-turno.component.ts`**: importá `TurnosService` y pedilo en el constructor con `private turnosService: TurnosService`.',
            'En `guardar()`, llamá a `agregar` del servicio con un turno completo: el nombre que escribió el usuario en `paciente`, estado `pendiente`.',
            'Vaciá el campo `paciente` después de guardar.'
        ] },
        { p: 'Al guardar, el turno nuevo tiene que aparecer en la lista **sin que ningún componente le pase nada al otro**.' }
    ],

    semilla: {
        'app/app.module.ts': moduloDe([
            ['ListaTurnosComponent', './lista-turnos/lista-turnos.component'],
            ['NuevoTurnoComponent', './nuevo-turno/nuevo-turno.component']
        ], true),
        'app/models/turno.model.ts': TURNO_MODEL,
        'app/servicios/turnos.service.ts': C(`
import { Injectable } from '@angular/core';
import { Turno } from '../models/turno.model';

@Injectable({
  providedIn: 'root'
})
export class TurnosService {
  private turnos: Turno[] = [
@@TRES@@
  ];

  obtenerTodos(): Turno[] {
    return this.turnos;
  }

  agregar(nuevoTurno: Turno): void {
    this.turnos.push(nuevoTurno);
  }
}
`),
        'app/lista-turnos/lista-turnos.component.ts': C(`
import { Component, OnInit } from '@angular/core';
import { Turno } from '../models/turno.model';
import { TurnosService } from '../servicios/turnos.service';

@Component({
  selector: 'app-lista-turnos',
  template: \`
    <ul id="lista">
      <li *ngFor="let t of turnos">{{ t.paciente }}</li>
    </ul>
  \`
})
export class ListaTurnosComponent implements OnInit {
  turnos: Turno[] = [];

  constructor(private turnosService: TurnosService) {}

  ngOnInit(): void {
    this.turnos = this.turnosService.obtenerTodos();
  }
}
`),
        'app/nuevo-turno/nuevo-turno.component.ts': C(`
import { Component } from '@angular/core';

@Component({
  selector: 'app-nuevo-turno',
  template: \`
    <input id="paciente" [(ngModel)]="paciente" placeholder="Paciente">
    <button id="guardar" (click)="guardar()">Guardar</button>
  \`
})
export class NuevoTurnoComponent {
  paciente: string = '';

  guardar(): void {
    // Acá hay que agregar el turno al servicio
  }
}
`),
        'app/app.component.ts': C(`
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: \`
    <h2>Turnos</h2>
    <app-nuevo-turno></app-nuevo-turno>
    <app-lista-turnos></app-lista-turnos>
  \`
})
export class AppComponent {}
`)
    },

    solucion: {
        'app/nuevo-turno/nuevo-turno.component.ts': C(`
import { Component } from '@angular/core';
import { TurnosService } from '../servicios/turnos.service';

@Component({
  selector: 'app-nuevo-turno',
  template: \`
    <input id="paciente" [(ngModel)]="paciente" placeholder="Paciente">
    <button id="guardar" (click)="guardar()">Guardar</button>
  \`
})
export class NuevoTurnoComponent {
  paciente: string = '';

  constructor(private turnosService: TurnosService) {}

  guardar(): void {
    this.turnosService.agregar({
      id: this.turnosService.obtenerTodos().length + 1,
      paciente: this.paciente,
      fecha: '2026-08-24',
      hora: '12:00',
      estado: 'pendiente'
    });
    this.paciente = '';
  }
}
`)
    },

    chequeos: [
        { fuente: { archivo: 'app/nuevo-turno/nuevo-turno.component.ts', debeTener: [
            { re: 'import\\s*\\{[^}]*TurnosService[^}]*\\}\\s*from', que: "Falta importar el servicio:  import { TurnosService } from '../servicios/turnos.service';" },
            { re: 'constructor\\s*\\(\\s*private\\s+\\w+\\s*:\\s*TurnosService', que: 'Falta pedir el servicio en el constructor:  constructor(private turnosService: TurnosService) {}' },
            { re: '\\.agregar\\s*\\(', que: 'guardar() tiene que llamar a this.turnosService.agregar(...).' }
          ],
          noDebeTener: [
            { re: 'new\\s+TurnosService', que: 'El servicio no se crea con new: si lo creás vos, la lista no ve lo que agregás. Lo inyecta Angular por el constructor.' }
          ] } },
        { arranca: true },
        { sinErrores: true },
        { dom: { contar: { selector: '#lista li', es: 3 } } },
        { accion: { escribir: ['#paciente', 'Lucía Gómez'] } },
        { accion: { clic: '#guardar' } },
        { dom: { contar: { selector: '#lista li', es: 4 } },
          pista: 'Al guardar tiene que aparecer un turno más en la lista. Revisá que guardar() llame a agregar del servicio.' },
        { dom: { textos: { selector: '#lista li', contiene: 'Lucía Gómez' } },
          pista: 'El turno nuevo tiene que llevar el nombre que escribiste en el campo.' }
    ]
},

{
    id: 'p06',
    titulo: 'Ciclo de vida de un componente',
    minutos: 16,
    abrir: 'app/panel/panel.component.ts',

    teoria: [
        { h: 'Los momentos de la vida de un componente' },
        { p: 'Angular crea un componente, lo muestra y, en algún momento, lo destruye (por ejemplo, cuando un `*ngIf` pasa a falso). En cada momento importante llama a un método especial, un **hook del ciclo de vida**, si el componente lo tiene.' },
        { tabla: {
            cabeceras: ['Hook', 'Cuándo se ejecuta', 'Para qué se usa'],
            filas: [
                ['`constructor`', 'Al crear la instancia', 'Sólo inyección de dependencias'],
                ['`ngOnInit`', 'Después de recibir los `@Input`', 'Pedir datos, inicializar'],
                ['`ngAfterViewInit`', 'Después de renderizar la vista', 'Usar referencias de `@ViewChild`'],
                ['`ngOnDestroy`', 'Al destruir el componente', 'Desuscribirse, limpiar']
            ]
        } },
        { codigo: C(`
import { Component, Input, OnInit, AfterViewInit, OnDestroy } from '@angular/core';

export class PanelComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() nombre: string = '';

  ngOnInit(): void { }
  ngAfterViewInit(): void { }
  ngOnDestroy(): void { }
}
`), archivo: 'cada hook es una interface que se implementa' },
        { clave: 'El orden es siempre el mismo: **constructor**, **ngOnInit**, **ngAfterViewInit** y, al final, **ngOnDestroy**. Y la diferencia clave entre constructor y `ngOnInit`: en el constructor los `@Input` todavía no llegaron; en `ngOnInit` ya están.' },
        { nota: '`implements OnInit` no hace que el hook funcione: Angular llama al método igual. Sirve para que el editor te avise si lo escribís mal. Es una buena práctica ponerlo siempre.' }
    ],

    consigna: [
        { p: 'El panel recibe un `nombre` y sólo tiene constructor. El padre lo muestra o lo oculta con un botón. Agregale los otros tres hooks, y que cada uno escriba en la Consola con `console.log`:' },
        { numerada: [
            '`ngOnInit` escribe exactamente `ngOnInit: ` seguido del nombre. Con el nombre "Panel A" tiene que decir `ngOnInit: Panel A`.',
            '`ngAfterViewInit` escribe `ngAfterViewInit`.',
            '`ngOnDestroy` escribe `ngOnDestroy`.',
            'La clase tiene que declarar `implements OnInit, AfterViewInit, OnDestroy`.'
        ] },
        { p: 'Mirá la Consola: al ocultar el panel tiene que aparecer el mensaje de destrucción.' }
    ],

    semilla: {
        'app/app.module.ts': moduloDe([['PanelComponent', './panel/panel.component']]),
        'app/panel/panel.component.ts': C(`
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-panel',
  template: \`<p id="panel">{{ nombre }}</p>\`
})
export class PanelComponent {
  @Input() nombre: string = '';

  constructor() {
    console.log('constructor');
  }
}
`),
        'app/app.component.ts': C(`
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: \`
    <button id="alternar" (click)="mostrar = !mostrar">Mostrar / ocultar</button>
    <app-panel *ngIf="mostrar" nombre="Panel A"></app-panel>
  \`
})
export class AppComponent {
  mostrar: boolean = true;
}
`)
    },

    solucion: {
        'app/panel/panel.component.ts': C(`
import { Component, Input, OnInit, AfterViewInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-panel',
  template: \`<p id="panel">{{ nombre }}</p>\`
})
export class PanelComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() nombre: string = '';

  constructor() {
    console.log('constructor');
  }

  ngOnInit(): void {
    console.log('ngOnInit: ' + this.nombre);
  }

  ngAfterViewInit(): void {
    console.log('ngAfterViewInit');
  }

  ngOnDestroy(): void {
    console.log('ngOnDestroy');
  }
}
`)
    },

    chequeos: [
        { fuente: { archivo: 'app/panel/panel.component.ts', debeTener: [
            { re: 'implements[^{]*\\bOnInit\\b', que: 'Falta  implements OnInit  en la clase.' },
            { re: 'implements[^{]*\\bAfterViewInit\\b', que: 'Falta  AfterViewInit  en el implements.' },
            { re: 'implements[^{]*\\bOnDestroy\\b', que: 'Falta  OnDestroy  en el implements.' },
            { re: 'ngOnInit\\s*\\(', que: 'Falta el método ngOnInit().' },
            { re: 'ngAfterViewInit\\s*\\(', que: 'Falta el método ngAfterViewInit().' },
            { re: 'ngOnDestroy\\s*\\(', que: 'Falta el método ngOnDestroy().' }
          ] } },
        { arranca: true },
        { sinErrores: true },
        { consola: { enOrden: ['constructor', 'ngOnInit: Panel A', 'ngAfterViewInit'] },
          pista: 'Los mensajes tienen que salir en este orden: constructor, ngOnInit: Panel A y ngAfterViewInit.' },
        { dom: { existe: { selector: '#panel' } } },
        { accion: { clic: '#alternar' } },
        { dom: { noExiste: { selector: '#panel' } } },
        { consola: { contiene: ['ngOnDestroy'] },
          pista: 'Al ocultar el panel tiene que aparecer ngOnDestroy en la Consola.' }
    ]
},

    /* ------------------------------------------------------------------------
     * Observables
     * ---------------------------------------------------------------------- */

{
    id: 'p07',
    titulo: 'De array a Observable',
    minutos: 22,
    abrir: 'app/servicios/turnos.service.ts',

    teoria: [
        { h: 'El problema de esperar' },
        { p: 'Todo lo anterior funcionaba porque el array vive en memoria: pedirle un dato al servicio es instantáneo. Pero en una aplicación real los datos vienen de un servidor, y una request puede tardar 50 milisegundos o 3 segundos. Mientras tanto el navegador no puede quedarse pausado: JavaScript es de un solo hilo, y si algo lo bloquea toda la interfaz se congela.' },
        { p: 'Necesitamos poder decir: "pedí este dato, seguí con lo tuyo, y cuando esté listo, avisame". Eso es programación **asincrónica**, y en Angular la herramienta estándar es el **Observable**, de la librería RxJS.' },

        { h: 'Qué es un Observable' },
        { p: 'Un Observable representa un **flujo de datos en el tiempo**, no un valor único. Es como una Promise mejorada: una Promise resuelve un único valor una sola vez; un Observable puede emitir cero, uno o muchos valores a lo largo del tiempo, y se puede cancelar a mitad de camino.' },
        { clave: 'Pensalo como una **suscripción a un canal de noticias**. No te dan todas las noticias de una vez ni sabés cuándo llega la próxima. Vos te suscribís una vez, y cada vez que hay una noticia nueva te la envían. Podés desuscribirte cuando ya no te interesa.' },
        { tabla: {
            cabeceras: ['Concepto', 'Qué es'],
            filas: [
                ['`Observable`', 'La fuente de datos: define qué se va a emitir y cuándo'],
                ['`subscribe()`', 'Quien se suscribe y define qué hacer con cada valor (`next`), con los errores (`error`) y al completarse (`complete`)'],
                ['`Subscription`', 'El objeto que representa la suscripción activa, para cancelarla con `unsubscribe()`']
            ]
        } },

        { h: 'of() y delay()' },
        { codigo: C(`
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

obtenerTodos(): Observable<Turno[]> {
  return of(this.turnos).pipe(delay(800));   // simula 800 ms de red
}
`), archivo: 'turnos.service.ts' },
        { p: '`of(valor)` crea un Observable que emite ese valor una vez y se completa. Es la forma más simple de tener algo con forma de Observable antes de que el dato tarde de verdad. `delay(800)` lo retrasa para simular la red.' },

        { h: 'Consumirlo desde el componente' },
        { codigo: C(`
ngOnInit(): void {
  this.cargando = true;
  this.turnosSub = this.turnosService.obtenerTodos().subscribe({
    next: (data) => {
      this.turnos = data;
      this.cargando = false;
    },
    error: (err) => {
      console.error('Error al traer turnos', err);
      this.cargando = false;
    }
  });
}
`), archivo: 'lista-turnos.component.ts' },
        { p: 'El flag `cargando` es buena práctica: como la respuesta puede tardar, conviene mostrarle al usuario un indicador mientras el Observable todavía no emitió.' }
    ],

    consigna: [
        { p: 'El servicio devuelve el array de golpe. Hacelo asincrónico:' },
        { numerada: [
            'En **`turnos.service.ts`**: `obtenerTodos()` tiene que devolver `Observable<Turno[]>` con `of(this.turnos).pipe(delay(800))`. Importá `Observable`, `of` y `delay`.',
            'En **`app.component.ts`**: en `ngOnInit`, poné `cargando` en `true` y suscribite con `next` y `error`. En `next` guardá los datos y poné `cargando` en `false`.',
            'Guardá la suscripción en `turnosSub` y cancelala en `ngOnDestroy`.'
        ] },
        { p: 'Al abrir tiene que verse "Cargando turnos..." y, casi un segundo después, la lista.' }
    ],

    semilla: {
        'app/app.module.ts': moduloDe([]),
        'app/models/turno.model.ts': TURNO_MODEL,
        'app/servicios/turnos.service.ts': C(`
import { Injectable } from '@angular/core';
import { Turno } from '../models/turno.model';

@Injectable({
  providedIn: 'root'
})
export class TurnosService {
  private turnos: Turno[] = [
@@TRES@@
  ];

  obtenerTodos(): Turno[] {
    return this.turnos;
  }
}
`),
        'app/app.component.ts': C(`
import { Component, OnInit } from '@angular/core';
import { Turno } from './models/turno.model';
import { TurnosService } from './servicios/turnos.service';

@Component({
  selector: 'app-root',
  template: \`
    <h2>Turnos</h2>
    <p id="cargando" *ngIf="cargando">Cargando turnos...</p>
    <ul id="lista">
      <li *ngFor="let t of turnos">{{ t.paciente }}</li>
    </ul>
  \`
})
export class AppComponent implements OnInit {
  turnos: Turno[] = [];
  cargando: boolean = false;

  constructor(private turnosService: TurnosService) {}

  ngOnInit(): void {
    this.turnos = this.turnosService.obtenerTodos();
  }
}
`)
    },

    solucion: {
        'app/servicios/turnos.service.ts': C(`
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Turno } from '../models/turno.model';

@Injectable({
  providedIn: 'root'
})
export class TurnosService {
  private turnos: Turno[] = [
@@TRES@@
  ];

  obtenerTodos(): Observable<Turno[]> {
    return of(this.turnos).pipe(delay(800));
  }
}
`),
        'app/app.component.ts': C(`
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Turno } from './models/turno.model';
import { TurnosService } from './servicios/turnos.service';

@Component({
  selector: 'app-root',
  template: \`
    <h2>Turnos</h2>
    <p id="cargando" *ngIf="cargando">Cargando turnos...</p>
    <ul id="lista">
      <li *ngFor="let t of turnos">{{ t.paciente }}</li>
    </ul>
  \`
})
export class AppComponent implements OnInit, OnDestroy {
  turnos: Turno[] = [];
  cargando: boolean = false;
  private turnosSub!: Subscription;

  constructor(private turnosService: TurnosService) {}

  ngOnInit(): void {
    this.cargando = true;
    this.turnosSub = this.turnosService.obtenerTodos().subscribe({
      next: (data) => {
        this.turnos = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al traer turnos', err);
        this.cargando = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.turnosSub.unsubscribe();
  }
}
`)
    },

    chequeos: [
        { fuente: { archivo: 'app/servicios/turnos.service.ts', debeTener: [
            { re: imp('Observable', 'rxjs'), que: "Falta importar Observable desde 'rxjs'." },
            { re: imp('of', 'rxjs'), que: "Falta importar of desde 'rxjs'." },
            { re: imp('delay', 'rxjs'), que: "Falta importar delay desde 'rxjs/operators'." },
            { re: 'obtenerTodos\\s*\\(\\s*\\)\\s*:\\s*Observable\\s*<\\s*Turno\\[\\]\\s*>', que: 'obtenerTodos() tiene que devolver Observable<Turno[]>.' },
            { re: '\\bof\\s*\\(', que: 'Falta crear el Observable con of(this.turnos).' },
            { re: 'delay\\s*\\(', que: 'Falta el delay(800) para simular la red.' }
          ] } },
        { fuente: { debeTener: [
            { re: '\\.subscribe\\s*\\(', que: 'Falta suscribirse: this.turnosService.obtenerTodos().subscribe(...).' },
            { re: 'next\\s*:', que: 'Falta el callback next dentro del subscribe.' },
            { re: 'cargando\\s*=\\s*true', que: 'Falta poner cargando en true al empezar.' },
            { re: 'ngOnDestroy\\s*\\(', que: 'Falta ngOnDestroy() para cancelar la suscripción.' },
            { re: 'unsubscribe\\s*\\(', que: 'Falta llamar a unsubscribe() en ngOnDestroy.' }
          ] } },
        { arranca: true },
        { sinErrores: true },
        { dom: { existe: { selector: '#cargando' } },
          pista: 'Apenas abre tiene que verse "Cargando turnos...". Poné cargando en true antes de suscribirte.' },
        { dom: { contar: { selector: '#lista li', es: 0 } },
          pista: 'Mientras carga la lista tiene que estar vacía.' },
        { accion: { esperar: 1300 } },
        { dom: { noExiste: { selector: '#cargando' } },
          pista: 'Cuando llegan los datos, cargando tiene que volver a false.' },
        { dom: { contar: { selector: '#lista li', es: 3 } },
          pista: 'Cuando llegan los datos tienen que verse los 3 turnos. Asignalos en el next.' }
    ]
},

{
    id: 'p08',
    titulo: 'Un Observable es perezoso',
    minutos: 16,
    abrir: 'app/app.component.ts',

    teoria: [
        { h: 'Crear no es ejecutar' },
        { p: 'Un Observable no hace nada hasta que alguien se suscribe. Crearlo sólo **describe** qué va a emitir. Recién cuando alguien llama a `.subscribe()` empieza a correr.' },
        { clave: 'Esto es distinto de una **Promise**, que empieza a ejecutarse apenas se crea. Un Observable es perezoso.' },
        { codigo: C(`
const emisiones$ = new Observable<number>(subscriber => {
  console.log('El Observable empezó a emitir');
  subscriber.next(10);
  subscriber.next(20);
  subscriber.complete();
});

// hasta acá no pasó nada: no hay ningún mensaje en la Consola

emisiones$.subscribe({
  next: (valor) => console.log('llegó', valor),
  error: (err) => console.error(err),
  complete: () => console.log('terminó')
});
`), archivo: 'crear y suscribirse son dos momentos' },
        { p: 'El objeto que se le pasa a `subscribe` tiene tres callbacks, todos opcionales: `next` se ejecuta con cada valor, `error` si algo falla, y `complete` cuando el flujo termina.' },
        { nota: 'Cada `subscribe` arranca **una ejecución nueva**. Si te suscribís dos veces, el Observable emite todo dos veces.' }
    ],

    consigna: [
        { p: 'El componente ya tiene un Observable que emite tres números, pero nadie se suscribe. El botón "Suscribirme" llama a `suscribirse()`, que está vacío.' },
        { numerada: [
            'En `suscribirse()`, llamá a `subscribe` sobre `this.emisiones$` con un objeto de tres callbacks.',
            '`next`: agrega el valor recibido al array `recibidos`.',
            '`error`: lo muestra con `console.error`.',
            '`complete`: cambia `estado` a `Completado`.'
        ] },
        { p: 'Fijate que **antes** de apretar el botón la Consola no muestra nada: el Observable todavía no empezó.' }
    ],

    semilla: {
        'app/app.module.ts': moduloDe([]),
        'app/app.component.ts': C(`
import { Component } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  template: \`
    <button id="suscribir" (click)="suscribirse()">Suscribirme</button>
    <ul id="recibidos">
      <li *ngFor="let n of recibidos">{{ n }}</li>
    </ul>
    <p id="estado">{{ estado }}</p>
  \`
})
export class AppComponent {
  recibidos: number[] = [];
  estado: string = 'Sin suscribir';

  emisiones$ = new Observable<number>(subscriber => {
    console.log('El Observable empezó a emitir');
    subscriber.next(10);
    subscriber.next(20);
    subscriber.next(30);
    subscriber.complete();
  });

  suscribirse(): void {
  }
}
`)
    },

    solucion: {
        'app/app.component.ts': C(`
import { Component } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  template: \`
    <button id="suscribir" (click)="suscribirse()">Suscribirme</button>
    <ul id="recibidos">
      <li *ngFor="let n of recibidos">{{ n }}</li>
    </ul>
    <p id="estado">{{ estado }}</p>
  \`
})
export class AppComponent {
  recibidos: number[] = [];
  estado: string = 'Sin suscribir';

  emisiones$ = new Observable<number>(subscriber => {
    console.log('El Observable empezó a emitir');
    subscriber.next(10);
    subscriber.next(20);
    subscriber.next(30);
    subscriber.complete();
  });

  suscribirse(): void {
    this.emisiones$.subscribe({
      next: (valor) => this.recibidos.push(valor),
      error: (err) => console.error(err),
      complete: () => { this.estado = 'Completado'; }
    });
  }
}
`)
    },

    chequeos: [
        { fuente: { debeTener: [
            { re: 'emisiones\\$\\s*\\.subscribe\\s*\\(', que: 'Falta suscribirse:  this.emisiones$.subscribe({ ... }).' },
            { re: 'next\\s*:', que: 'Falta el callback next.' },
            { re: 'error\\s*:', que: 'Falta el callback error.' },
            { re: 'complete\\s*:', que: 'Falta el callback complete.' }
          ] } },
        { arranca: true },
        { sinErrores: true },
        { consola: { noContiene: ['El Observable empezó a emitir'] },
          pista: 'Antes de apretar el botón el Observable no tiene que haber empezado. No te suscribas al crear el componente: hacelo dentro de suscribirse().' },
        { dom: { textos: { selector: '#estado', igual: ['Sin suscribir'] } } },
        { accion: { clic: '#suscribir' } },
        { consola: { contiene: ['El Observable empezó a emitir'] },
          pista: 'Al apretar el botón el Observable tiene que empezar a emitir.' },
        { dom: { textos: { selector: '#recibidos li', igual: ['10', '20', '30'] } },
          pista: 'En next agregá cada valor a this.recibidos con push.' },
        { dom: { textos: { selector: '#estado', igual: ['Completado'] } },
          pista: 'En complete cambiá this.estado a \'Completado\'.' }
    ]
},

{
    id: 'p09',
    titulo: 'Desuscribirse: el memory leak',
    minutos: 16,
    abrir: 'app/reloj/reloj.component.ts',

    teoria: [
        { h: 'Una suscripción que no se cancela sigue viva' },
        { p: 'Cuando un componente se destruye (el usuario navega a otra pantalla, un `*ngIf` pasa a falso), cualquier suscripción que siga viva **sigue consumiendo memoria** y puede intentar actualizar propiedades de un componente que ya no existe. Eso es un **memory leak**, y con el tiempo puede hacer que la aplicación se ponga lenta o falle.' },
        { clave: 'Toda suscripción manual con `.subscribe()` se guarda en una variable y se cancela en `ngOnDestroy()` con `.unsubscribe()`.' },
        { codigo: C(`
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, interval } from 'rxjs';

export class RelojComponent implements OnInit, OnDestroy {
  private sub!: Subscription;

  ngOnInit(): void {
    this.sub = interval(1000).subscribe(n => console.log('tick', n));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
`), archivo: 'reloj.component.ts' },
        { p: '`interval(1000)` es un Observable que emite un número cada segundo, **para siempre**: nunca se completa. Es el caso típico donde olvidarse de desuscribirse duele, porque el flujo no termina solo.' },
        { nota: 'Los Observables que **sí** se completan solos, como el `of()` del paso anterior o una request HTTP, se limpian por su cuenta. Pero es más seguro acostumbrarse a desuscribirse siempre, o usar el pipe `async`, que el próximo paso muestra.' }
    ],

    consigna: [
        { p: 'El reloj cuenta un tick cada 200 milisegundos y lo escribe en la Consola. El padre lo muestra o lo oculta con un botón. Ocultalo y mirá la Consola: **los ticks siguen apareciendo**, aunque el reloj ya no existe.' },
        { numerada: [
            'Guardá la suscripción en una propiedad de tipo `Subscription`. Importá `Subscription` y `OnDestroy`.',
            'Implementá `ngOnDestroy()` y cancelala con `unsubscribe()`.'
        ] },
        { p: 'Cuando el reloj se oculte, los mensajes tienen que dejar de aparecer.' }
    ],

    semilla: {
        'app/app.module.ts': moduloDe([['RelojComponent', './reloj/reloj.component']]),
        'app/reloj/reloj.component.ts': C(`
import { Component, OnInit } from '@angular/core';
import { interval } from 'rxjs';

@Component({
  selector: 'app-reloj',
  template: \`<p id="segundos">Ticks: {{ ticks }}</p>\`
})
export class RelojComponent implements OnInit {
  ticks: number = 0;

  ngOnInit(): void {
    interval(200).subscribe(n => {
      this.ticks = n + 1;
      console.log('tick ' + n);
    });
  }
}
`),
        'app/app.component.ts': C(`
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: \`
    <button id="alternar" (click)="mostrar = !mostrar">Mostrar / ocultar reloj</button>
    <app-reloj *ngIf="mostrar"></app-reloj>
  \`
})
export class AppComponent {
  mostrar: boolean = true;
}
`)
    },

    solucion: {
        'app/reloj/reloj.component.ts': C(`
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-reloj',
  template: \`<p id="segundos">Ticks: {{ ticks }}</p>\`
})
export class RelojComponent implements OnInit, OnDestroy {
  ticks: number = 0;
  private sub!: Subscription;

  ngOnInit(): void {
    this.sub = interval(200).subscribe(n => {
      this.ticks = n + 1;
      console.log('tick ' + n);
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
`)
    },

    chequeos: [
        { fuente: { archivo: 'app/reloj/reloj.component.ts', debeTener: [
            { re: imp('Subscription', 'rxjs'), que: "Falta importar Subscription desde 'rxjs'." },
            { re: ':\\s*Subscription', que: 'Falta guardar la suscripción en una propiedad de tipo Subscription.' },
            { re: 'ngOnDestroy\\s*\\(', que: 'Falta el método ngOnDestroy().' },
            { re: 'unsubscribe\\s*\\(\\s*\\)', que: 'Falta llamar a unsubscribe() en ngOnDestroy.' }
          ] } },
        { arranca: true },
        { sinErrores: true },
        { accion: { esperar: 600 } },
        { consola: { contiene: ['tick 0'] },
          pista: 'El reloj tiene que estar contando: tiene que aparecer tick 0 en la Consola.' },
        { accion: { clic: '#alternar' } },
        { dom: { noExiste: { selector: '#segundos' } } },
        { accion: { esperar: 300 } },
        { consola: { quieto: 800 },
          pista: 'Después de ocultar el reloj siguen apareciendo mensajes: la suscripción sigue viva. Guardá el resultado de subscribe en una propiedad y cancelalo con unsubscribe() en ngOnDestroy.' }
    ]
},

{
    id: 'p10',
    titulo: 'El pipe async',
    minutos: 16,
    abrir: 'app/app.component.ts',

    teoria: [
        { h: 'Suscribirse desde el template' },
        { p: 'Angular ofrece un pipe especial, **`async`**, que se suscribe al Observable y **se desuscribe solo** cuando el componente se destruye. Se usa en el template y el componente ya no necesita `ngOnDestroy`.' },
        { codigo: C(`
turnos$!: Observable<Turno[]>;

ngOnInit(): void {
  this.turnos$ = this.turnosService.obtenerTodos();
}
`), archivo: 'app.component.ts' },
        { codigo: C(`
<div *ngFor="let t of turnos$ | async">
  <p>{{ t.paciente }} - {{ t.hora }}</p>
</div>
`), archivo: 'app.component.html' },
        { clave: 'Por convención, las propiedades que guardan un Observable (en vez del dato ya resuelto) se nombran con el sufijo **`$`**: `turnos$` en vez de `turnos`. Sirve para distinguir a simple vista que eso es un flujo, no el dato final.' },
        { p: 'Mientras el Observable todavía no emitió, `async` devuelve `null` y el `*ngFor` no dibuja nada. Cuando llega el dato, se dibuja solo.' },
        { h: 'Cuándo usar cada uno' },
        { tabla: {
            cabeceras: ['Pipe `async`', '`subscribe` manual'],
            filas: [
                ['El dato se muestra directamente en el template', 'Necesitás el dato dentro del código TypeScript, por ejemplo para hacer cálculos antes de mostrarlo'],
                ['Se desuscribe solo', 'Tenés que desuscribirte vos en `ngOnDestroy`']
            ]
        } },
        { nota: 'Cuidado con los dos "pipe": el `| async` del template es un pipe de **Angular** (transforma un valor para mostrarlo). El `.pipe(...)` de un Observable es de **RxJS** (encadena operadores). El próximo paso trabaja con este último.' }
    ],

    consigna: [
        { p: 'El componente ya funciona con `subscribe` manual: guarda los datos, se desuscribe en `ngOnDestroy` y tiene bastante código. Reescribilo con el pipe `async`:' },
        { numerada: [
            'Reemplazá el array `turnos` por `turnos$!: Observable<Turno[]>`.',
            'En `ngOnInit`, asigná `this.turnos$ = this.turnosService.obtenerTodos()`. **Sin subscribe.**',
            'En el template, recorré `turnos$ | async` en el `*ngFor`.',
            'Borrá la suscripción y el `ngOnDestroy`: ya no hacen falta.'
        ] }
    ],

    semilla: {
        'app/app.module.ts': moduloDe([]),
        'app/models/turno.model.ts': TURNO_MODEL,
        'app/servicios/turnos.service.ts': C(`
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Turno } from '../models/turno.model';

@Injectable({
  providedIn: 'root'
})
export class TurnosService {
  private turnos: Turno[] = [
@@TRES@@
  ];

  obtenerTodos(): Observable<Turno[]> {
    return of(this.turnos).pipe(delay(500));
  }
}
`),
        'app/app.component.ts': C(`
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Turno } from './models/turno.model';
import { TurnosService } from './servicios/turnos.service';

@Component({
  selector: 'app-root',
  template: \`
    <h2>Turnos</h2>
    <ul id="lista">
      <li *ngFor="let t of turnos">{{ t.paciente }}</li>
    </ul>
  \`
})
export class AppComponent implements OnInit, OnDestroy {
  turnos: Turno[] = [];
  private turnosSub!: Subscription;

  constructor(private turnosService: TurnosService) {}

  ngOnInit(): void {
    this.turnosSub = this.turnosService.obtenerTodos().subscribe(data => {
      this.turnos = data;
    });
  }

  ngOnDestroy(): void {
    this.turnosSub.unsubscribe();
  }
}
`)
    },

    solucion: {
        'app/app.component.ts': C(`
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Turno } from './models/turno.model';
import { TurnosService } from './servicios/turnos.service';

@Component({
  selector: 'app-root',
  template: \`
    <h2>Turnos</h2>
    <ul id="lista">
      <li *ngFor="let t of turnos$ | async">{{ t.paciente }}</li>
    </ul>
  \`
})
export class AppComponent implements OnInit {
  turnos$!: Observable<Turno[]>;

  constructor(private turnosService: TurnosService) {}

  ngOnInit(): void {
    this.turnos$ = this.turnosService.obtenerTodos();
  }
}
`)
    },

    chequeos: [
        { fuente: { debeTener: [
            { re: 'turnos\\$', que: 'Falta la propiedad turnos$ (con el sufijo $ de los Observables).' },
            { re: '\\|\\s*async', que: 'Falta el pipe async en el template:  turnos$ | async' }
          ],
          noDebeTener: [
            { re: '\\.subscribe\\s*\\(', que: 'Con el pipe async no hace falta subscribe: el pipe se suscribe solo.' },
            { re: 'ngOnDestroy\\s*\\(', que: 'Con el pipe async no hace falta ngOnDestroy: el pipe se desuscribe solo.' }
          ] } },
        { arranca: true },
        { sinErrores: true },
        { dom: { contar: { selector: '#lista li', es: 0 } },
          pista: 'Antes de que llegue el dato la lista tiene que estar vacía.' },
        { accion: { esperar: 900 } },
        { dom: { contar: { selector: '#lista li', es: 3 } },
          pista: 'Cuando llega el dato tienen que verse los 3 turnos. El *ngFor tiene que recorrer turnos$ | async.' },
        { dom: { textos: { selector: '#lista li', igual: ['Ana Gómez', 'Luis Pérez', 'Sofía Ruiz'] } } }
    ]
},

{
    id: 'p11',
    titulo: 'pipe() de RxJS: map y filter',
    minutos: 20,
    abrir: 'app/servicios/turnos.service.ts',

    teoria: [
        { h: 'Una cinta transportadora para los datos' },
        { p: 'El método `pipe()` de un Observable encadena **operadores** que transforman el flujo antes de que llegue a quien se suscribe. Es una cinta transportadora en una fábrica: el dato entra por un extremo, pasa por una serie de estaciones y sale transformado por el otro.' },
        { codigo: C(`
observable$.pipe(
  operador1(...),
  operador2(...),
  operador3(...)
).subscribe(valorFinal => {
  // acá el valor ya pasó por los tres operadores, en orden
});
`), archivo: 'la forma general' },
        { p: 'Los operadores se ejecutan **en el orden en que se escriben**. Cada uno recibe lo que el anterior le entregó, no el valor original.' },

        { h: 'map: transformar cada valor emitido' },
        { codigo: C(`
import { map } from 'rxjs/operators';

obtenerPendientes(): Observable<Turno[]> {
  return this.obtenerTodos().pipe(
    map(turnos => turnos.filter(t => t.estado === 'pendiente'))
  );
}

obtenerNombres(): Observable<string[]> {
  return this.obtenerTodos().pipe(
    map(turnos => turnos.map(t => t.paciente))
  );
}
`), archivo: 'turnos.service.ts' },
        { nota: 'En el segundo ejemplo hay **dos `map` distintos** y no hay que confundirlos. El `map` de RxJS (el del `pipe`) transforma lo que emite el Observable completo: el array entero, una vez. El `.map()` de array, adentro, transforma cada elemento del array. Son dos herramientas que casualmente se llaman igual.' },

        { h: 'filter: descartar valores' },
        { p: 'El `filter` de RxJS decide, **emisión por emisión**, si un valor sigue en la cadena o se descarta. Es útil cuando el Observable emite muchos valores sueltos:' },
        { codigo: C(`
import { filter } from 'rxjs/operators';

of(1, 2, 3, 4, 5, 6).pipe(
  filter(n => n % 2 === 0)
).subscribe(n => console.log(n));   // 2, 4, 6
`), archivo: 'un valor por vez' },
        { clave: 'Mantené la lógica de transformación (`map`, `filter`) del lado del **servicio**, no del componente. Así el componente recibe el dato ya en la forma que necesita mostrarlo, y se dedica sólo a la vista.' }
    ],

    consigna: [
        { p: 'El componente ya usa tres métodos del servicio, pero el servicio sólo tiene `obtenerTodos()`. Escribí los tres que faltan, cada uno con `pipe()`:' },
        { numerada: [
            '`obtenerPendientes(): Observable<Turno[]>`: sólo los turnos con estado `pendiente`. Usá `map` con el `filter` de array adentro.',
            '`obtenerNombres(): Observable<string[]>`: sólo los nombres de los pacientes. Usá `map` con el `.map()` de array adentro.',
            '`obtenerNumerosPares(): Observable<number>`: usá `of(1, 2, 3, 4, 5, 6)` y el operador `filter` de RxJS para dejar sólo los pares.'
        ] },
        { p: 'Importá `map` y `filter` desde `rxjs/operators`.' }
    ],

    semilla: {
        'app/app.module.ts': moduloDe([]),
        'app/models/turno.model.ts': TURNO_MODEL,
        'app/servicios/turnos.service.ts': C(`
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Turno } from '../models/turno.model';

@Injectable({
  providedIn: 'root'
})
export class TurnosService {
  private turnos: Turno[] = [
@@CUATRO@@
  ];

  obtenerTodos(): Observable<Turno[]> {
    return of(this.turnos);
  }
}
`),
        'app/app.component.ts': C(`
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Turno } from './models/turno.model';
import { TurnosService } from './servicios/turnos.service';

@Component({
  selector: 'app-root',
  template: \`
    <h3>Pendientes</h3>
    <ul id="pendientes">
      <li *ngFor="let t of pendientes$ | async">{{ t.paciente }}</li>
    </ul>
    <h3>Nombres</h3>
    <ul id="nombres">
      <li *ngFor="let n of nombres$ | async">{{ n }}</li>
    </ul>
    <h3>Pares</h3>
    <ul id="pares">
      <li *ngFor="let n of pares">{{ n }}</li>
    </ul>
  \`
})
export class AppComponent implements OnInit {
  pendientes$!: Observable<Turno[]>;
  nombres$!: Observable<string[]>;
  pares: number[] = [];

  constructor(private turnosService: TurnosService) {}

  ngOnInit(): void {
    this.pendientes$ = this.turnosService.obtenerPendientes();
    this.nombres$ = this.turnosService.obtenerNombres();
    this.turnosService.obtenerNumerosPares().subscribe(n => this.pares.push(n));
  }
}
`)
    },

    solucion: {
        'app/servicios/turnos.service.ts': C(`
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { Turno } from '../models/turno.model';

@Injectable({
  providedIn: 'root'
})
export class TurnosService {
  private turnos: Turno[] = [
@@CUATRO@@
  ];

  obtenerTodos(): Observable<Turno[]> {
    return of(this.turnos);
  }

  obtenerPendientes(): Observable<Turno[]> {
    return this.obtenerTodos().pipe(
      map(turnos => turnos.filter(t => t.estado === 'pendiente'))
    );
  }

  obtenerNombres(): Observable<string[]> {
    return this.obtenerTodos().pipe(
      map(turnos => turnos.map(t => t.paciente))
    );
  }

  obtenerNumerosPares(): Observable<number> {
    return of(1, 2, 3, 4, 5, 6).pipe(
      filter(n => n % 2 === 0)
    );
  }
}
`)
    },

    chequeos: [
        { fuente: { archivo: 'app/servicios/turnos.service.ts', debeTener: [
            { re: imp('map', 'rxjs'), que: "Falta importar map desde 'rxjs/operators'." },
            { re: imp('filter', 'rxjs'), que: "Falta importar filter desde 'rxjs/operators'." },
            { re: 'obtenerPendientes\\s*\\(\\s*\\)', que: 'Falta el método obtenerPendientes().' },
            { re: 'obtenerNombres\\s*\\(\\s*\\)', que: 'Falta el método obtenerNombres().' },
            { re: 'obtenerNumerosPares\\s*\\(\\s*\\)', que: 'Falta el método obtenerNumerosPares().' },
            { re: '\\.pipe\\s*\\(', que: 'Los tres métodos tienen que usar .pipe(...).' }
          ] } },
        { arranca: true },
        { sinErrores: true,
          pista: 'Si dice que un método no es una función, todavía falta escribirlo en el servicio.' },
        { dom: { textos: { selector: '#pendientes li', igual: ['Ana Gómez', 'Sofía Ruiz'] } },
          pista: 'Sólo los turnos con estado pendiente: map(turnos => turnos.filter(t => t.estado === \'pendiente\')).' },
        { dom: { textos: { selector: '#nombres li', igual: ['Ana Gómez', 'Luis Pérez', 'Sofía Ruiz', 'Marcos Díaz'] } },
          pista: 'Los cuatro nombres, en orden: map(turnos => turnos.map(t => t.paciente)).' },
        { dom: { textos: { selector: '#pares li', igual: ['2', '4', '6'] } },
          pista: 'of(1, 2, 3, 4, 5, 6).pipe(filter(n => n % 2 === 0)) deja sólo 2, 4 y 6.' }
    ]
},

{
    id: 'p12',
    titulo: 'tap y el orden de los operadores',
    minutos: 16,
    abrir: 'app/servicios/turnos.service.ts',

    teoria: [
        { h: 'tap: mirar sin modificar' },
        { p: '`tap` deja pasar cada valor **tal cual** y ejecuta un efecto secundario, como escribir en la Consola. Es la herramienta para espiar qué pasa en cada punto de la cadena, sin alterarla.' },
        { codigo: C(`
import { map, tap } from 'rxjs/operators';

obtenerPendientes(): Observable<Turno[]> {
  return this.obtenerTodos().pipe(
    tap(turnos => console.log('Llegaron ' + turnos.length + ' turnos')),
    map(turnos => turnos.filter(t => t.estado === 'pendiente')),
    tap(p => console.log('De esos, ' + p.length + ' están pendientes'))
  );
}
`), archivo: 'turnos.service.ts' },
        { p: 'El primer `tap` ve el array completo, **antes** del filtro. El segundo ve sólo los pendientes, **después** del `map`. Esto confirma que los operadores se ejecutan en el orden en que se escriben.' },

        { h: 'Los cuatro operadores base' },
        { tabla: {
            cabeceras: ['Operador', 'Qué hace con cada valor', 'Modifica el valor'],
            filas: [
                ['`map()`', 'Lo transforma y devuelve el resultado', 'Sí'],
                ['`tap()`', 'Lo deja pasar y ejecuta un efecto secundario', 'No'],
                ['`filter()`', 'Decide si sigue en la cadena o se descarta', 'No, filtra'],
                ['`catchError()`', 'Intercepta errores y decide cómo continuar', 'Sólo en caso de error']
            ]
        } },
        { nota: 'El orden importa. Un `tap` puesto **antes** del `map` ve datos distintos que uno puesto **después**. Si el segundo `tap` te muestra la cantidad total en vez de la de pendientes, está en el lugar equivocado.' }
    ],

    consigna: [
        { p: '`obtenerPendientes()` ya filtra con `map`. Agregale dos `tap` para ver el recorrido de los datos en la Consola:' },
        { numerada: [
            'Un `tap` **antes** del `map` que escriba exactamente `Llegaron 4 turnos`, usando la cantidad real: `\'Llegaron \' + turnos.length + \' turnos\'`.',
            'Un `tap` **después** del `map` que escriba exactamente `De esos, 2 están pendientes`, con la cantidad real de pendientes.'
        ] },
        { p: 'Importá `tap` desde `rxjs/operators`. En la Consola los dos mensajes tienen que salir en ese orden.' }
    ],

    semilla: {
        'app/app.module.ts': moduloDe([]),
        'app/models/turno.model.ts': TURNO_MODEL,
        'app/servicios/turnos.service.ts': C(`
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Turno } from '../models/turno.model';

@Injectable({
  providedIn: 'root'
})
export class TurnosService {
  private turnos: Turno[] = [
@@CUATRO@@
  ];

  obtenerTodos(): Observable<Turno[]> {
    return of(this.turnos);
  }

  obtenerPendientes(): Observable<Turno[]> {
    return this.obtenerTodos().pipe(
      map(turnos => turnos.filter(t => t.estado === 'pendiente'))
    );
  }
}
`),
        'app/app.component.ts': C(`
import { Component, OnInit } from '@angular/core';
import { Turno } from './models/turno.model';
import { TurnosService } from './servicios/turnos.service';

@Component({
  selector: 'app-root',
  template: \`
    <h2>Pendientes</h2>
    <ul id="pendientes">
      <li *ngFor="let t of pendientes">{{ t.paciente }}</li>
    </ul>
  \`
})
export class AppComponent implements OnInit {
  pendientes: Turno[] = [];

  constructor(private turnosService: TurnosService) {}

  ngOnInit(): void {
    this.turnosService.obtenerPendientes().subscribe(p => {
      this.pendientes = p;
    });
  }
}
`)
    },

    solucion: {
        'app/servicios/turnos.service.ts': C(`
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Turno } from '../models/turno.model';

@Injectable({
  providedIn: 'root'
})
export class TurnosService {
  private turnos: Turno[] = [
@@CUATRO@@
  ];

  obtenerTodos(): Observable<Turno[]> {
    return of(this.turnos);
  }

  obtenerPendientes(): Observable<Turno[]> {
    return this.obtenerTodos().pipe(
      tap(turnos => console.log('Llegaron ' + turnos.length + ' turnos')),
      map(turnos => turnos.filter(t => t.estado === 'pendiente')),
      tap(p => console.log('De esos, ' + p.length + ' están pendientes'))
    );
  }
}
`)
    },

    chequeos: [
        { fuente: { archivo: 'app/servicios/turnos.service.ts', debeTener: [
            { re: imp('tap', 'rxjs'), que: "Falta importar tap desde 'rxjs/operators'." },
            { re: 'tap\\s*\\([\\s\\S]*tap\\s*\\(', que: 'Tienen que ser dos tap: uno antes y otro después del map.' }
          ] } },
        { arranca: true },
        { sinErrores: true },
        { consola: { enOrden: ['Llegaron 4 turnos', 'De esos, 2 están pendientes'] },
          pista: 'Tienen que salir dos mensajes, en este orden: Llegaron 4 turnos (antes del map) y De esos, 2 están pendientes (después del map). Si el segundo dice 4, está antes del map.' },
        { dom: { textos: { selector: '#pendientes li', igual: ['Ana Gómez', 'Sofía Ruiz'] } } }
    ]
},

{
    id: 'p13',
    titulo: 'catchError: cuando algo falla',
    minutos: 16,
    abrir: 'app/servicios/turnos.service.ts',

    teoria: [
        { h: 'Un error no puede romper la aplicación' },
        { p: 'Las cosas fallan: el servidor se cae, se corta la conexión, la respuesta viene mal. Un Observable que falla emite un **error** y se termina. Si nadie lo maneja, el error sale sin control y puede dejar la pantalla rota.' },
        { p: '`catchError` intercepta el error dentro del `pipe` y decide cómo continuar. Devuelve **otro Observable**: el que reemplaza al que falló.' },
        { codigo: C(`
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

obtenerTodos(): Observable<Turno[]> {
  return of(this.turnos).pipe(
    catchError(error => {
      console.error('Algo salió mal', error);
      return of([]);   // devuelve un array vacío en vez de romper la app
    })
  );
}
`), archivo: 'turnos.service.ts' },
        { p: 'Con `of([])` el componente recibe una lista vacía y puede mostrar "no hay datos", como cualquier otra lista vacía. No se entera de que hubo un error.' },
        { h: 'Dónde manejar el error' },
        { tabla: {
            cabeceras: ['Dónde', 'Cuándo conviene'],
            filas: [
                ['`catchError` en el servicio', 'Querés una respuesta de reemplazo y que el componente siga funcionando igual'],
                ['Callback `error` del `subscribe`', 'El componente tiene que reaccionar distinto, por ejemplo mostrando un mensaje de error']
            ]
        } },
        { nota: 'En este paso usá `console.warn` en lugar de `console.error` dentro del `catchError`: la pantalla de verificación cuenta como error cualquier `console.error`, y acá el error ya está manejado.' }
    ],

    consigna: [
        { p: 'El servidor de los turnos "está caído": `obtenerTodos()` devuelve un Observable que falla siempre con `Sin conexión`. Como nadie maneja el error, aparece en la Consola como un error sin capturar.' },
        { numerada: [
            'Agregale un `.pipe(...)` al Observable que falla, con `catchError`. Importá `catchError`.',
            'Adentro, escribí el problema con `console.warn` y devolvé `of([])`.'
        ] },
        { p: 'La aplicación tiene que seguir funcionando y mostrar "No hay turnos para mostrar", sin errores en la Consola.' }
    ],

    semilla: {
        'app/app.module.ts': moduloDe([]),
        'app/models/turno.model.ts': TURNO_MODEL,
        'app/servicios/turnos.service.ts': C(`
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { Turno } from '../models/turno.model';

@Injectable({
  providedIn: 'root'
})
export class TurnosService {
  obtenerTodos(): Observable<Turno[]> {
    return throwError(() => new Error('Sin conexión'));
  }
}
`),
        'app/app.component.ts': C(`
import { Component, OnInit } from '@angular/core';
import { Turno } from './models/turno.model';
import { TurnosService } from './servicios/turnos.service';

@Component({
  selector: 'app-root',
  template: \`
    <h2>Turnos</h2>
    <p id="vacio" *ngIf="turnos.length === 0">No hay turnos para mostrar</p>
    <ul id="lista">
      <li *ngFor="let t of turnos">{{ t.paciente }}</li>
    </ul>
  \`
})
export class AppComponent implements OnInit {
  turnos: Turno[] = [];

  constructor(private turnosService: TurnosService) {}

  ngOnInit(): void {
    this.turnosService.obtenerTodos().subscribe(data => {
      this.turnos = data;
    });
  }
}
`)
    },

    solucion: {
        'app/servicios/turnos.service.ts': C(`
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Turno } from '../models/turno.model';

@Injectable({
  providedIn: 'root'
})
export class TurnosService {
  obtenerTodos(): Observable<Turno[]> {
    return throwError(() => new Error('Sin conexión')).pipe(
      catchError(error => {
        console.warn('Algo salió mal:', error.message);
        return of([]);
      })
    );
  }
}
`)
    },

    chequeos: [
        { fuente: { archivo: 'app/servicios/turnos.service.ts', debeTener: [
            { re: imp('catchError', 'rxjs'), que: "Falta importar catchError desde 'rxjs/operators'." },
            { re: 'catchError\\s*\\(', que: 'Falta usar catchError(...) dentro del pipe.' },
            { re: 'of\\s*\\(\\s*\\[\\s*\\]\\s*\\)', que: 'catchError tiene que devolver un Observable de reemplazo:  return of([]);' }
          ] } },
        { arranca: true },
        { sinErrores: true,
          pista: 'Todavía hay un error sin manejar. catchError tiene que devolver of([]) y no volver a lanzar el error. Y usá console.warn, no console.error.' },
        { dom: { textos: { selector: '#vacio', igual: ['No hay turnos para mostrar'] } } },
        { dom: { contar: { selector: '#lista li', es: 0 } } }
    ]
},

    /* ------------------------------------------------------------------------
     * Estado compartido
     * ---------------------------------------------------------------------- */

{
    id: 'p14',
    titulo: 'BehaviorSubject: componentes sin relación',
    minutos: 22,
    abrir: 'app/servicios/notificaciones.service.ts',

    teoria: [
        { h: 'El problema del prop drilling' },
        { p: 'Todo lo que viste de `@Input`, `@Output` y `ng-content` funciona sólo entre **padre e hijo directos**. Si dos componentes hermanos, o que ni siquiera están cerca en el árbol, necesitan compartir información, subir el dato con `@Output` hasta el padre común y volver a bajarlo con `@Input` se vuelve inmanejable. Eso se conoce como **prop drilling**.' },
        { p: 'La solución es sacar el estado compartido del árbol de componentes y ponerlo en un **servicio**.' },

        { h: 'BehaviorSubject' },
        { codigo: C(`
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotificacionesService {
  private mensajeSubject = new BehaviorSubject<string>('');
  mensaje$ = this.mensajeSubject.asObservable();

  enviar(mensaje: string): void {
    this.mensajeSubject.next(mensaje);
  }
}
`), archivo: 'notificaciones.service.ts' },
        { p: 'Un `BehaviorSubject` es un tipo especial de Observable que **guarda el último valor emitido** y se lo entrega inmediatamente a cualquiera que se suscriba, **aunque se suscriba después** de que el valor fue emitido. Por eso es ideal para guardar el estado actual compartido. Se crea con un **valor inicial**.' },
        { p: '`asObservable()` expone el flujo hacia afuera pero **sin el método `next`**: los componentes pueden escuchar pero no emitir directamente. Sólo el servicio controla qué se emite, a través de su método `enviar()`.' },

        { h: 'Los dos extremos' },
        { codigo: C(`
// componente A: emite (equivale a un @Output, pero global)
constructor(private notiService: NotificacionesService) {}

avisar(): void {
  this.notiService.enviar('Algo pasó en el componente A');
}
`), archivo: 'componente-a.component.ts' },
        { codigo: C(`
// componente B: escucha (equivale a un @Input, pero global)
ngOnInit(): void {
  this.sub = this.notiService.mensaje$.subscribe(msg => {
    this.mensaje = msg;
  });
}

ngOnDestroy(): void {
  this.sub.unsubscribe();
}
`), archivo: 'componente-b.component.ts' },
        { clave: 'Los componentes A y B no se conocen entre sí, no tienen relación padre-hijo, y sin embargo se comunican a través del servicio, que Angular inyecta como singleton.' }
    ],

    consigna: [
        { p: 'Hay un emisor, un receptor y un componente "tardío" que el padre muestra recién cuando se aprieta un botón. El emisor y el tardío ya están hechos. Falta el servicio y el receptor:' },
        { numerada: [
            'En **`notificaciones.service.ts`**: un `BehaviorSubject<string>` privado con valor inicial `\'\'`, el flujo público `mensaje$` con `asObservable()`, y `enviar(mensaje)` que emite con `next`.',
            'En **`receptor.component.ts`**: en `ngOnInit`, suscribite a `mensaje$` y guardá el valor en `mensaje`. Cancelá la suscripción en `ngOnDestroy`.'
        ] },
        { p: 'Mirá bien el componente tardío: aparece **después** de que se envió el mensaje y, aun así, lo muestra al instante. Eso es lo que hace especial a `BehaviorSubject`.' }
    ],

    semilla: {
        'app/app.module.ts': moduloDe([
            ['EmisorComponent', './emisor/emisor.component'],
            ['ReceptorComponent', './receptor/receptor.component'],
            ['TardioComponent', './tardio/tardio.component']
        ]),
        'app/servicios/notificaciones.service.ts': C(`
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {
}
`),
        'app/emisor/emisor.component.ts': C(`
import { Component } from '@angular/core';
import { NotificacionesService } from '../servicios/notificaciones.service';

@Component({
  selector: 'app-emisor',
  template: \`<button id="enviar" (click)="enviar()">Enviar mensaje</button>\`
})
export class EmisorComponent {
  constructor(private notiService: NotificacionesService) {}

  enviar(): void {
    this.notiService.enviar('Hola desde el emisor');
  }
}
`),
        'app/receptor/receptor.component.ts': C(`
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificacionesService } from '../servicios/notificaciones.service';

@Component({
  selector: 'app-receptor',
  template: \`<p id="receptor">Receptor: {{ mensaje || 'Sin mensajes' }}</p>\`
})
export class ReceptorComponent implements OnInit, OnDestroy {
  mensaje: string = '';
  private sub!: Subscription;

  constructor(private notiService: NotificacionesService) {}

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }
}
`),
        'app/tardio/tardio.component.ts': C(`
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificacionesService } from '../servicios/notificaciones.service';

@Component({
  selector: 'app-tardio',
  template: \`<p id="tardio">Tardío: {{ mensaje || 'Sin mensajes' }}</p>\`
})
export class TardioComponent implements OnInit, OnDestroy {
  mensaje: string = '';
  private sub!: Subscription;

  constructor(private notiService: NotificacionesService) {}

  ngOnInit(): void {
    this.sub = this.notiService.mensaje$.subscribe(msg => {
      this.mensaje = msg;
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
`),
        'app/app.component.ts': C(`
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: \`
    <h2>Notificaciones</h2>
    <app-emisor></app-emisor>
    <app-receptor></app-receptor>
    <button id="mostrar-tardio" (click)="verTardio = true">Mostrar el tardío</button>
    <app-tardio *ngIf="verTardio"></app-tardio>
  \`
})
export class AppComponent {
  verTardio: boolean = false;
}
`)
    },

    solucion: {
        'app/servicios/notificaciones.service.ts': C(`
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {
  private mensajeSubject = new BehaviorSubject<string>('');
  mensaje$ = this.mensajeSubject.asObservable();

  enviar(mensaje: string): void {
    this.mensajeSubject.next(mensaje);
  }
}
`),
        'app/receptor/receptor.component.ts': C(`
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificacionesService } from '../servicios/notificaciones.service';

@Component({
  selector: 'app-receptor',
  template: \`<p id="receptor">Receptor: {{ mensaje || 'Sin mensajes' }}</p>\`
})
export class ReceptorComponent implements OnInit, OnDestroy {
  mensaje: string = '';
  private sub!: Subscription;

  constructor(private notiService: NotificacionesService) {}

  ngOnInit(): void {
    this.sub = this.notiService.mensaje$.subscribe(msg => {
      this.mensaje = msg;
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
`)
    },

    chequeos: [
        { fuente: { archivo: 'app/servicios/notificaciones.service.ts', debeTener: [
            { re: 'new\\s+BehaviorSubject\\s*<\\s*string\\s*>\\s*\\(', que: "Falta el BehaviorSubject con su valor inicial:  new BehaviorSubject<string>('')" },
            { re: 'private\\s+\\w+\\s*=\\s*new\\s+BehaviorSubject', que: 'El BehaviorSubject tiene que ser private: sólo el servicio emite.' },
            { re: 'mensaje\\$\\s*=', que: 'Falta el flujo público:  mensaje$ = this.mensajeSubject.asObservable();' },
            { re: 'asObservable\\s*\\(\\s*\\)', que: 'Falta asObservable() para exponer el flujo sin el next.' },
            { re: '\\.next\\s*\\(', que: 'enviar() tiene que emitir con .next(mensaje).' }
          ] } },
        { fuente: { archivo: 'app/receptor/receptor.component.ts', debeTener: [
            { re: 'mensaje\\$\\s*\\.subscribe\\s*\\(', que: 'Falta suscribirse:  this.notiService.mensaje$.subscribe(...).' },
            { re: 'unsubscribe\\s*\\(\\s*\\)', que: 'Falta cancelar la suscripción con unsubscribe() en ngOnDestroy.' }
          ] } },
        { arranca: true },
        { sinErrores: true },
        { dom: { textos: { selector: '#receptor', igual: ['Receptor: Sin mensajes'] } } },
        { accion: { clic: '#enviar' } },
        { dom: { textos: { selector: '#receptor', igual: ['Receptor: Hola desde el emisor'] } },
          pista: 'El receptor tiene que recibir lo que emite el servicio. Suscribite a mensaje$ y guardá el valor en this.mensaje.' },
        { dom: { noExiste: { selector: '#tardio' } } },
        { accion: { clic: '#mostrar-tardio' } },
        { dom: { textos: { selector: '#tardio', igual: ['Tardío: Hola desde el emisor'] } },
          pista: 'El tardío se suscribe después de que se envió el mensaje y tiene que recibirlo igual. Con BehaviorSubject se logra solo; si no funciona, revisá que uses BehaviorSubject y no otro tipo.' }
    ]
},

{
    id: 'p15',
    titulo: 'Estado compartido: el carrito',
    minutos: 24,
    abrir: 'app/servicios/carrito.service.ts',

    teoria: [
        { h: 'Un estado, varios flujos derivados' },
        { p: 'El servicio puede guardar **un** estado y, a partir de él, ofrecer varios flujos derivados con los operadores que ya conocés. Los componentes se suscriben al que necesitan, y todos se actualizan solos cuando el estado cambia.' },
        { codigo: C(`
@Injectable({ providedIn: 'root' })
export class CarritoService {
  private itemsSubject = new BehaviorSubject<Producto[]>([]);

  items$ = this.itemsSubject.asObservable();
  cantidad$ = this.items$.pipe(map(items => items.length));
  total$ = this.items$.pipe(
    map(items => items.reduce((suma, p) => suma + p.precio, 0))
  );

  agregar(producto: Producto): void {
    this.itemsSubject.next([...this.itemsSubject.value, producto]);
  }

  vaciar(): void {
    this.itemsSubject.next([]);
  }
}
`), archivo: 'carrito.service.ts' },
        { p: 'Tres detalles para fijarse:' },
        { lista: [
            '**`.value`** devuelve el valor actual del `BehaviorSubject`, sin suscribirse. Sirve para armar el estado nuevo a partir del anterior.',
            '**No se modifica el array: se emite uno nuevo.** `[...items, producto]` crea una copia con el elemento agregado. Emitir siempre un array nuevo es lo que hace que todos los suscriptores detecten el cambio.',
            '`cantidad$` y `total$` **nacen de `items$`**: no hay que actualizarlos a mano. Cuando `items$` emite, se recalculan solos.'
        ] },
        { h: 'Consumirlo desde los componentes' },
        { codigo: C(`
constructor(public carrito: CarritoService) {}
`), archivo: 'header.component.ts' },
        { codigo: '<p>Carrito ({{ carrito.cantidad$ | async }})</p>', archivo: 'header.component.html' },
        { nota: 'Si el template usa el servicio (`carrito.cantidad$`), el parámetro del constructor tiene que ser **`public`**, no `private`: una propiedad privada no se puede leer desde el template en un proyecto real.' }
    ],

    consigna: [
        { p: 'Hay un catálogo con botones para agregar productos, un encabezado que muestra la cantidad y el total, y una lista con lo que hay en el carrito. Los tres componentes ya están hechos y leen del servicio. Escribí el servicio `CarritoService`:' },
        { numerada: [
            'Un `BehaviorSubject<Producto[]>` privado, con un array vacío como valor inicial.',
            '`items$`, público, con `asObservable()`.',
            '`cantidad$`: la cantidad de items, derivada de `items$` con `map`.',
            '`total$`: la suma de los precios, derivada de `items$` con `map` y `reduce`.',
            '`agregar(producto)`: emite un array **nuevo** con el producto agregado.',
            '`vaciar()`: emite un array vacío.'
        ] },
        { p: 'Importá `BehaviorSubject` desde `rxjs` y `map` desde `rxjs/operators`.' }
    ],

    semilla: {
        'app/app.module.ts': moduloDe([
            ['HeaderComponent', './header/header.component'],
            ['CatalogoComponent', './catalogo/catalogo.component'],
            ['ListaCarritoComponent', './lista-carrito/lista-carrito.component']
        ]),
        'app/models/producto.model.ts': C(`
export interface Producto {
  id: number;
  nombre: string;
  precio: number;
}
`),
        'app/servicios/carrito.service.ts': C(`
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Producto } from '../models/producto.model';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
}
`),
        'app/header/header.component.ts': C(`
import { Component } from '@angular/core';
import { CarritoService } from '../servicios/carrito.service';

@Component({
  selector: 'app-header',
  template: \`
    <p id="cantidad">Carrito ({{ carrito.cantidad$ | async }})</p>
    <p id="total">Total: {{ carrito.total$ | async }}</p>
  \`
})
export class HeaderComponent {
  constructor(public carrito: CarritoService) {}
}
`),
        'app/catalogo/catalogo.component.ts': C(`
import { Component } from '@angular/core';
import { Producto } from '../models/producto.model';
import { CarritoService } from '../servicios/carrito.service';

@Component({
  selector: 'app-catalogo',
  template: \`
    <div id="catalogo">
      <div class="producto" *ngFor="let p of productos">
        <span>{{ p.nombre }} ({{ p.precio }})</span>
        <button class="btn-agregar" (click)="agregar(p)">Agregar</button>
      </div>
    </div>
  \`
})
export class CatalogoComponent {
  productos: Producto[] = [
    { id: 1, nombre: 'Teclado', precio: 15000 },
    { id: 2, nombre: 'Mouse', precio: 8000 },
    { id: 3, nombre: 'Monitor', precio: 120000 }
  ];

  constructor(private carrito: CarritoService) {}

  agregar(producto: Producto): void {
    this.carrito.agregar(producto);
  }
}
`),
        'app/lista-carrito/lista-carrito.component.ts': C(`
import { Component } from '@angular/core';
import { CarritoService } from '../servicios/carrito.service';

@Component({
  selector: 'app-lista-carrito',
  template: \`
    <ul id="carrito">
      <li *ngFor="let p of carrito.items$ | async">{{ p.nombre }}</li>
    </ul>
    <button id="vaciar" (click)="carrito.vaciar()">Vaciar carrito</button>
  \`
})
export class ListaCarritoComponent {
  constructor(public carrito: CarritoService) {}
}
`),
        'app/app.component.ts': C(`
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: \`
    <app-header></app-header>
    <app-catalogo></app-catalogo>
    <app-lista-carrito></app-lista-carrito>
  \`
})
export class AppComponent {}
`)
    },

    solucion: {
        'app/servicios/carrito.service.ts': C(`
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Producto } from '../models/producto.model';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private itemsSubject = new BehaviorSubject<Producto[]>([]);

  items$ = this.itemsSubject.asObservable();
  cantidad$ = this.items$.pipe(map(items => items.length));
  total$ = this.items$.pipe(
    map(items => items.reduce((suma, p) => suma + p.precio, 0))
  );

  agregar(producto: Producto): void {
    this.itemsSubject.next([...this.itemsSubject.value, producto]);
  }

  vaciar(): void {
    this.itemsSubject.next([]);
  }
}
`)
    },

    chequeos: [
        { fuente: { archivo: 'app/servicios/carrito.service.ts', debeTener: [
            { re: 'private\\s+\\w+\\s*=\\s*new\\s+BehaviorSubject\\s*<\\s*Producto\\[\\]\\s*>\\s*\\(\\s*\\[\\s*\\]\\s*\\)', que: 'Falta el BehaviorSubject privado:  private itemsSubject = new BehaviorSubject<Producto[]>([]);' },
            { re: 'items\\$\\s*=', que: 'Falta el flujo público items$.' },
            { re: 'cantidad\\$\\s*=', que: 'Falta el flujo derivado cantidad$.' },
            { re: 'total\\$\\s*=', que: 'Falta el flujo derivado total$.' },
            { re: 'agregar\\s*\\(', que: 'Falta el método agregar(producto).' },
            { re: 'vaciar\\s*\\(', que: 'Falta el método vaciar().' },
            { re: '\\[\\s*\\.\\.\\.', que: 'agregar tiene que emitir un array NUEVO con el spread:  [...items, producto]. No modifiques el array anterior con push.' }
          ] } },
        { arranca: true },
        { sinErrores: true },
        { dom: { textos: { selector: '#cantidad', igual: ['Carrito (0)'] } },
          pista: 'Al empezar el carrito está vacío: cantidad$ tiene que emitir 0.' },
        { dom: { textos: { selector: '#total', igual: ['Total: 0'] } } },
        { accion: { clic: '.btn-agregar' } },
        { dom: { textos: { selector: '#cantidad', igual: ['Carrito (1)'] } },
          pista: 'Al agregar el teclado la cantidad tiene que pasar a 1. agregar tiene que emitir con next.' },
        { dom: { textos: { selector: '#total', igual: ['Total: 15000'] } },
          pista: 'El total es la suma de los precios: reduce((suma, p) => suma + p.precio, 0).' },
        { dom: { textos: { selector: '#carrito li', igual: ['Teclado'] } } },
        { accion: { clic: '#catalogo .producto:nth-child(2) .btn-agregar' } },
        { dom: { textos: { selector: '#cantidad', igual: ['Carrito (2)'] } } },
        { dom: { textos: { selector: '#total', igual: ['Total: 23000'] } } },
        { dom: { textos: { selector: '#carrito li', igual: ['Teclado', 'Mouse'] } } },
        { accion: { clic: '#vaciar' } },
        { dom: { textos: { selector: '#cantidad', igual: ['Carrito (0)'] } },
          pista: 'vaciar() tiene que emitir un array vacío.' },
        { dom: { contar: { selector: '#carrito li', es: 0 } } }
    ]
},

    /* ------------------------------------------------------------------------
     * Desafío final
     * ---------------------------------------------------------------------- */

{
    id: 'p16',
    titulo: 'Desafío final: la agenda con servicio',
    minutos: 30,
    abrir: 'app/servicios/turnos.service.ts',

    teoria: [
        { h: 'Todo junto' },
        { p: 'Este paso no trae teoría nueva: es un problema del nivel de un práctico integrador donde tenés que **elegir la herramienta correcta para cada requisito**. Antes de escribir código, preguntate: ¿es un dato o un evento? ¿entre padre e hijo, o entre componentes sin relación?' },

        { h: 'Qué mecanismo usar en cada caso' },
        { tabla: {
            cabeceras: ['Situación', 'Mecanismo'],
            filas: [
                ['El padre le manda datos a un hijo directo', '`@Input()`'],
                ['El hijo le avisa algo a su padre directo', '`@Output()` + `EventEmitter`'],
                ['Leer y escribir el mismo valor entre padre e hijo', '`[(ngModel)]` o un `[(valor)]` propio'],
                ['El padre le pasa HTML o componentes al hijo', '`ng-content`'],
                ['El padre necesita llamar un método del hijo', '`@ViewChild`'],
                ['El hijo accede al contenido que le proyectaron', '`@ContentChild`'],
                ['Componentes hermanos o sin relación comparten estado', 'Servicio + `BehaviorSubject`'],
                ['Los datos vienen de una API o tardan en llegar', 'Servicio que devuelve un `Observable`']
            ]
        } },

        { h: 'Errores frecuentes' },
        { tabla: {
            cabeceras: ['Síntoma', 'Causa probable'],
            filas: [
                ["`NG0303: Can't bind to 'x'`", 'Falta `@Input()` en el hijo, o falta el componente en `declarations`, o la etiqueta está mal escrita'],
                ['Pantalla en blanco, sin errores', 'El componente existe pero nadie puso su etiqueta'],
                ['El `*ngFor` no genera nada', 'La F va en mayúscula: `*ngFor`'],
                ['Muestra `[object Object]`', 'Estás interpolando el objeto entero: accedé a una propiedad'],
                ['El número llega como texto', 'Faltan los corchetes: `[edad]="42"`'],
                ['Un booleano `false` se comporta como `true`', 'Lo pasaste sin corchetes: el texto "false" es truthy'],
                ['El evento del hijo nunca llega', 'Usaste corchetes en vez de paréntesis en el padre'],
                ["`Can't bind to 'ngModel'`", 'Falta importar `FormsModule`'],
                ['`@ViewChild` devuelve `undefined`', 'Lo usás en `ngOnInit`: recién existe en `ngAfterViewInit`'],
                ['`No provider for X`', 'Falta `@Injectable({ providedIn: \'root\' })` en el servicio'],
                ['La app se pone lenta con el uso', 'Falta `unsubscribe` en `ngOnDestroy`: memory leak'],
                ['Error al importar la interface', 'Ruta mal: `../` sube una carpeta, `./` es la carpeta actual']
            ]
        } },

        { h: 'Para repasar antes del parcial' },
        { p: 'Respondé por escrito, con tus palabras. Si no podés explicarlo sin mirar, todavía no lo sabés.' },
        { numerada: [
            '¿Por qué `@Input` no alcanza para que el hijo le avise algo al padre?',
            '¿Cuál es la diferencia entre corchetes y paréntesis en el template del padre?',
            '¿Qué pasa si pasás un booleano sin corchetes? ¿Por qué es peligroso?',
            '¿Cuándo conviene `ng-content` en lugar de `@Input`?',
            '¿Por qué se dice que `@ViewChild` es la excepción y no la regla?',
            '¿Por qué una interface no genera código JavaScript? ¿Para qué sirve entonces?',
            '¿Cuál es la diferencia entre interface y class? ¿Cuándo usarías cada una?',
            '¿Qué significa `providedIn: \'root\'` y por qué importa que sea singleton?',
            '¿Por qué el array del servicio se declara `private`?',
            '¿Por qué la carga de datos va en `ngOnInit` y no en el constructor?',
            '¿Qué diferencia hay entre una Promise y un Observable?',
            '¿Qué significa que un Observable es perezoso?',
            '¿Qué es un memory leak y cómo se evita?',
            '¿Cuándo conviene el pipe `async` y cuándo el `subscribe` manual?',
            '¿Cuál es la diferencia entre el `map` de RxJS y el `.map()` de un array?',
            '¿Qué es el prop drilling y cómo lo resuelve un `BehaviorSubject`?'
        ] }
    ],

    consigna: [
        { p: 'Armá la **agenda de un consultorio** con un servicio central. La lista de turnos y el resumen ya están hechos y leen del servicio. Vos escribís el servicio y el formulario para agregar turnos.' },
        { numerada: [
            '**`turnos.service.ts`**: un `BehaviorSubject<Turno[]>` privado que arranque con `TURNOS_INICIALES`, y el flujo público `turnos$`.',
            'En el servicio, `cantidadPendientes$`, derivado de `turnos$` con `map`, que devuelva cuántos turnos están en estado `pendiente`.',
            '`cambiarEstado(id: number, nuevoEstado: Turno[\'estado\'])`: emite una lista **nueva** con ese turno actualizado.',
            '`agregar(turno: Turno)`: emite una lista **nueva** con el turno agregado al final.',
            '**`nuevo-turno.component.ts`**: pedí el servicio en el constructor y, en `guardar()`, agregá un turno `pendiente` con el nombre escrito y vaciá el campo.'
        ] },
        { nota: 'La lista y el resumen no tienen ninguna relación entre sí. Si el servicio está bien hecho, cuando confirmás un turno el contador de pendientes tiene que bajar **solo**.' }
    ],

    semilla: {
        'app/app.module.ts': moduloDe([
            ['ListaTurnosComponent', './lista-turnos/lista-turnos.component'],
            ['ResumenComponent', './resumen/resumen.component'],
            ['NuevoTurnoComponent', './nuevo-turno/nuevo-turno.component']
        ], true),
        'app/models/turno.model.ts': TURNO_MODEL,
        'app/servicios/turnos.service.ts': C(`
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Turno } from '../models/turno.model';

const TURNOS_INICIALES: Turno[] = [
@@TRES@@
];

@Injectable({
  providedIn: 'root'
})
export class TurnosService {
}
`),
        'app/lista-turnos/lista-turnos.component.ts': C(`
import { Component } from '@angular/core';
import { TurnosService } from '../servicios/turnos.service';

@Component({
  selector: 'app-lista-turnos',
  template: \`
    <ul id="lista">
      <li class="turno" *ngFor="let t of turnosService.turnos$ | async" [ngClass]="t.estado">
        <span class="dato">{{ t.hora }} - {{ t.paciente }}</span>
        <button class="btn-confirmar" (click)="confirmar(t.id)">Confirmar</button>
        <button class="btn-cancelar" (click)="cancelar(t.id)">Cancelar</button>
      </li>
    </ul>
  \`,
  styles: \`
    .pendiente { background: #fff3cd; }
    .confirmado { background: #d4edda; }
    .cancelado { background: #f8d7da; text-decoration: line-through; }
  \`
})
export class ListaTurnosComponent {
  constructor(public turnosService: TurnosService) {}

  confirmar(id: number): void {
    this.turnosService.cambiarEstado(id, 'confirmado');
  }

  cancelar(id: number): void {
    this.turnosService.cambiarEstado(id, 'cancelado');
  }
}
`),
        'app/resumen/resumen.component.ts': C(`
import { Component } from '@angular/core';
import { TurnosService } from '../servicios/turnos.service';

@Component({
  selector: 'app-resumen',
  template: \`<p id="pendientes">Pendientes: {{ turnosService.cantidadPendientes$ | async }}</p>\`
})
export class ResumenComponent {
  constructor(public turnosService: TurnosService) {}
}
`),
        'app/nuevo-turno/nuevo-turno.component.ts': C(`
import { Component } from '@angular/core';

@Component({
  selector: 'app-nuevo-turno',
  template: \`
    <input id="paciente" [(ngModel)]="paciente" placeholder="Paciente">
    <button id="guardar" (click)="guardar()">Guardar</button>
  \`
})
export class NuevoTurnoComponent {
  paciente: string = '';

  guardar(): void {
  }
}
`),
        'app/app.component.ts': C(`
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: \`
    <h2>Agenda</h2>
    <app-resumen></app-resumen>
    <app-nuevo-turno></app-nuevo-turno>
    <app-lista-turnos></app-lista-turnos>
  \`
})
export class AppComponent {}
`)
    },

    solucion: {
        'app/servicios/turnos.service.ts': C(`
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Turno } from '../models/turno.model';

const TURNOS_INICIALES: Turno[] = [
@@TRES@@
];

@Injectable({
  providedIn: 'root'
})
export class TurnosService {
  private turnosSubject = new BehaviorSubject<Turno[]>(TURNOS_INICIALES);

  turnos$ = this.turnosSubject.asObservable();
  cantidadPendientes$ = this.turnos$.pipe(
    map(turnos => turnos.filter(t => t.estado === 'pendiente').length)
  );

  cambiarEstado(id: number, nuevoEstado: Turno['estado']): void {
    const actualizados = this.turnosSubject.value.map(t =>
      t.id === id ? { ...t, estado: nuevoEstado } : t
    );
    this.turnosSubject.next(actualizados);
  }

  agregar(turno: Turno): void {
    this.turnosSubject.next([...this.turnosSubject.value, turno]);
  }
}
`),
        'app/nuevo-turno/nuevo-turno.component.ts': C(`
import { Component } from '@angular/core';
import { TurnosService } from '../servicios/turnos.service';

@Component({
  selector: 'app-nuevo-turno',
  template: \`
    <input id="paciente" [(ngModel)]="paciente" placeholder="Paciente">
    <button id="guardar" (click)="guardar()">Guardar</button>
  \`
})
export class NuevoTurnoComponent {
  paciente: string = '';

  constructor(private turnosService: TurnosService) {}

  guardar(): void {
    this.turnosService.agregar({
      id: Date.now(),
      paciente: this.paciente,
      fecha: '2026-08-24',
      hora: '13:00',
      estado: 'pendiente'
    });
    this.paciente = '';
  }
}
`)
    },

    chequeos: [
        { fuente: { archivo: 'app/servicios/turnos.service.ts', debeTener: [
            { re: 'private\\s+\\w+\\s*=\\s*new\\s+BehaviorSubject\\s*<\\s*Turno\\[\\]\\s*>\\s*\\(\\s*TURNOS_INICIALES', que: 'Falta el BehaviorSubject privado:  private turnosSubject = new BehaviorSubject<Turno[]>(TURNOS_INICIALES);' },
            { re: 'turnos\\$\\s*=', que: 'Falta el flujo público turnos$.' },
            { re: 'cantidadPendientes\\$\\s*=', que: 'Falta el flujo derivado cantidadPendientes$.' },
            { re: 'cambiarEstado\\s*\\(\\s*id\\s*:\\s*number\\s*,\\s*\\w+\\s*:\\s*Turno\\[\\s*.estado.\\s*\\]', que: "Falta cambiarEstado(id: number, nuevoEstado: Turno['estado'])." },
            { re: 'agregar\\s*\\(\\s*\\w+\\s*:\\s*Turno\\s*\\)', que: 'Falta agregar(turno: Turno).' },
            { re: '\\.next\\s*\\(', que: 'Los métodos tienen que emitir el estado nuevo con next.' }
          ] } },
        { fuente: { archivo: 'app/nuevo-turno/nuevo-turno.component.ts', debeTener: [
            { re: 'constructor\\s*\\(\\s*private\\s+\\w+\\s*:\\s*TurnosService', que: 'Falta pedir el servicio en el constructor.' },
            { re: '\\.agregar\\s*\\(', que: 'guardar() tiene que llamar a agregar del servicio.' }
          ],
          noDebeTener: [
            { re: 'new\\s+TurnosService', que: 'El servicio no se crea con new: lo inyecta Angular.' }
          ] } },
        { arranca: true },
        { sinErrores: true },
        { dom: { textos: { selector: '#pendientes', igual: ['Pendientes: 2'] } },
          pista: 'Al empezar hay 2 turnos pendientes. cantidadPendientes$ tiene que contar los de estado pendiente.' },
        { dom: { contar: { selector: '#lista li', es: 3 } } },
        { accion: { clic: '.btn-confirmar' } },
        { dom: { textos: { selector: '#pendientes', igual: ['Pendientes: 1'] } },
          pista: 'Al confirmar un turno pendiente, el resumen tiene que bajar a 1 SOLO. cambiarEstado tiene que emitir con next.' },
        { dom: { contar: { selector: '.turno.confirmado', es: 2 } } },
        { accion: { escribir: ['#paciente', 'Marcos Díaz'] } },
        { accion: { clic: '#guardar' } },
        { dom: { contar: { selector: '#lista li', es: 4 } },
          pista: 'Al guardar tiene que aparecer un turno más. agregar tiene que emitir una lista nueva con el turno al final.' },
        { dom: { textos: { selector: '.dato', contiene: 'Marcos Díaz' } } },
        { dom: { textos: { selector: '#pendientes', igual: ['Pendientes: 2'] } },
          pista: 'El turno nuevo es pendiente: el resumen tiene que subir a 2, sin que nadie se lo avise.' },
        { accion: { clic: '.btn-cancelar' } },
        { dom: { contar: { selector: '.turno.cancelado', es: 1 } } },
        { dom: { textos: { selector: '#pendientes', igual: ['Pendientes: 2'] } },
          pista: 'El primer turno ya estaba confirmado: cancelarlo no cambia la cantidad de pendientes.' }
    ]
}

    ];

    pasos.forEach(function (p) { CONTENIDO.angular2.push(p); });
})();
