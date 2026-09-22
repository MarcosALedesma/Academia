CONTENIDO.practica = [];

(function () {
    'use strict';

    /* ------------------------------------------------------------------------
     * Ayudas
     * ---------------------------------------------------------------------- */

    var CUATRO = [
        "    { id: 1, paciente: 'Ana Gómez', estado: 'pendiente' },",
        "    { id: 2, paciente: 'Luis Pérez', estado: 'confirmado' },",
        "    { id: 3, paciente: 'Sofía Ruiz', estado: 'pendiente' },",
        "    { id: 4, paciente: 'Marcos Díaz', estado: 'cancelado' }"
    ].join('\n');

    function C(t) {
        return t.replace(/^\n/, '').replace(/@@CUATRO@@/g, CUATRO);
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

    var pasos = [

    /* ------------------------------------------------------------------------
     * Bindings y comunicación
     * ---------------------------------------------------------------------- */

{
    id: 'p01',
    titulo: 'Contador con límites',
    minutos: 10,
    abrir: 'app/app.component.ts',

    teoria: [
        { h: 'El estado de un botón sale de una condición' },
        { p: 'Un botón no se "apaga" con código que lo busca y lo modifica: se **enlaza** a una condición, y Angular lo deshabilita o lo habilita solo cada vez que la condición cambia.' },
        { codigo: C(`
<button (click)="restar()" [disabled]="valor === 0">-1</button>
`), archivo: 'un evento y una propiedad en el mismo elemento' },
        { p: '`(click)` **escucha** el clic y llama a un método. `[disabled]` **recibe** un dato: el resultado de la expresión `valor === 0`. Cuando `valor` llega a 0, la expresión da `true` y el botón queda deshabilitado.' },
        { nota: 'Sin corchetes, `disabled="valor === 0"` es un texto fijo y no una condición: el botón queda deshabilitado siempre, porque cualquier texto no vacío es truthy.' }
    ],

    consigna: [
        { p: 'El componente ya tiene el valor y los tres métodos, pero los botones no hacen nada. Conectalos:' },
        { numerada: [
            'El botón `#sumar` llama a `sumar()` con `(click)`.',
            'El botón `#restar` llama a `restar()` con `(click)` y **está deshabilitado cuando `valor` es 0**, con `[disabled]`.',
            'El botón `#reset` llama a `resetear()`.'
        ] },
        { p: 'Al empezar, el botón de restar tiene que verse deshabilitado.' }
    ],

    semilla: {
        'app/app.module.ts': moduloDe([]),
        'app/app.component.ts': C(`
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: \`
    <p id="valor">Valor: {{ valor }}</p>
    <button id="sumar">+1</button>
    <button id="restar">-1</button>
    <button id="reset">Reset</button>
  \`
})
export class AppComponent {
  valor: number = 0;

  sumar(): void { this.valor++; }
  restar(): void { this.valor--; }
  resetear(): void { this.valor = 0; }
}
`)
    },

    solucion: {
        'app/app.component.ts': C(`
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: \`
    <p id="valor">Valor: {{ valor }}</p>
    <button id="sumar" (click)="sumar()">+1</button>
    <button id="restar" (click)="restar()" [disabled]="valor === 0">-1</button>
    <button id="reset" (click)="resetear()">Reset</button>
  \`
})
export class AppComponent {
  valor: number = 0;

  sumar(): void { this.valor++; }
  restar(): void { this.valor--; }
  resetear(): void { this.valor = 0; }
}
`)
    },

    chequeos: [
        { fuente: { debeTener: [
            { re: '\\(\\s*click\\s*\\)\\s*=\\s*.sumar\\(', que: 'Falta (click)="sumar()" en el botón +1.' },
            { re: '\\(\\s*click\\s*\\)\\s*=\\s*.restar\\(', que: 'Falta (click)="restar()" en el botón -1.' },
            { re: '\\(\\s*click\\s*\\)\\s*=\\s*.resetear\\(', que: 'Falta (click)="resetear()" en el botón Reset.' },
            { re: '\\[\\s*disabled\\s*\\]\\s*=', que: 'Falta [disabled] con corchetes en el botón -1.' }
          ] } },
        { arranca: true },
        { sinErrores: true },
        { dom: { propiedad: { selector: '#restar', nombre: 'disabled', igual: true } },
          pista: 'Con el valor en 0 el botón -1 tiene que estar deshabilitado: [disabled]="valor === 0".' },
        { accion: { clic: '#sumar' } },
        { accion: { clic: '#sumar' } },
        { dom: { textos: { selector: '#valor', igual: ['Valor: 2'] } } },
        { dom: { propiedad: { selector: '#restar', nombre: 'disabled', igual: false } },
          pista: 'Con el valor distinto de 0 el botón -1 tiene que habilitarse solo.' },
        { accion: { clic: '#restar' } },
        { dom: { textos: { selector: '#valor', igual: ['Valor: 1'] } } },
        { accion: { clic: '#reset' } },
        { dom: { textos: { selector: '#valor', igual: ['Valor: 0'] } } },
        { dom: { propiedad: { selector: '#restar', nombre: 'disabled', igual: true } },
          pista: 'Después de resetear vuelve a 0 y el botón -1 tiene que volver a deshabilitarse.' }
    ]
},

{
    id: 'p02',
    titulo: 'Encontrá los cuatro errores',
    minutos: 14,
    abrir: 'app/producto/producto.component.ts',

    teoria: [
        { h: 'Leer código con errores es una habilidad' },
        { p: 'En un parcial es común recibir código que "casi" funciona y pedirte que lo arregles. Los errores más típicos de comunicación entre componentes son siempre los mismos, y algunos **no muestran ningún mensaje**. Repasalos:' },
        { tabla: {
            cabeceras: ['Error', 'Qué se ve'],
            filas: [
                ['Usar `@Input()` sin importar `Input`', 'La aplicación no carga: `Input is not defined`'],
                ['Etiqueta sin el prefijo del selector: `<producto>` en vez de `<app-producto>`', '`NG0304`: la etiqueta no es un elemento conocido'],
                ['Un número sin corchetes: `precio="15000"`', 'Nada: llega el **texto** "15000" y `precio + 1` da "150001"'],
                ['Un booleano sin corchetes: `enStock="false"`', 'Nada: el texto "false" es **truthy** y el producto figura disponible']
            ]
        } },
        { clave: 'Los dos últimos no dan ningún error: la pantalla muestra algo que parece correcto pero no lo es. Por eso conviene revisar **el tipo** de cada dato que se pasa, no sólo que aparezca.' }
    ],

    consigna: [
        { p: 'Este código tiene **cuatro errores**. Uno rompe el hijo, uno rompe la etiqueta del padre y dos no muestran nada raro. Encontralos y corregilos, sin cambiar lo que muestra el hijo:' },
        { lista: [
            'El precio tiene que valer el **número** 15000: el hijo muestra `precio + 1` y tiene que dar 15001.',
            'El producto **no tiene stock**: el hijo tiene que decir "Sin stock".'
        ] },
        { nota: 'Empezá por la Consola: te dice cuál es el primero. Cuando lo arregles, aparece el siguiente.' }
    ],

    semilla: {
        'app/app.module.ts': moduloDe([['ProductoComponent', './producto/producto.component']]),
        'app/producto/producto.component.ts': C(`
import { Component } from '@angular/core';

@Component({
  selector: 'app-producto',
  template: \`
    <div class="producto">
      <h3 id="nombre">{{ nombre }}</h3>
      <p id="precio">Precio + 1: {{ precio + 1 }}</p>
      <p id="stock">{{ enStock ? 'Disponible' : 'Sin stock' }}</p>
    </div>
  \`
})
export class ProductoComponent {
  @Input() nombre: string = '';
  @Input() precio: number = 0;
  @Input() enStock: boolean = false;
}
`),
        'app/app.component.ts': C(`
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: \`
    <h2>Producto</h2>
    <producto
      nombre="Teclado mecánico"
      precio="15000"
      enStock="false">
    </producto>
  \`
})
export class AppComponent {}
`)
    },

    solucion: {
        'app/producto/producto.component.ts': C(`
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-producto',
  template: \`
    <div class="producto">
      <h3 id="nombre">{{ nombre }}</h3>
      <p id="precio">Precio + 1: {{ precio + 1 }}</p>
      <p id="stock">{{ enStock ? 'Disponible' : 'Sin stock' }}</p>
    </div>
  \`
})
export class ProductoComponent {
  @Input() nombre: string = '';
  @Input() precio: number = 0;
  @Input() enStock: boolean = false;
}
`),
        'app/app.component.ts': C(`
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: \`
    <h2>Producto</h2>
    <app-producto
      nombre="Teclado mecánico"
      [precio]="15000"
      [enStock]="false">
    </app-producto>
  \`
})
export class AppComponent {}
`)
    },

    chequeos: [
        { fuente: { archivo: 'app/producto/producto.component.ts', debeTener: [
            { re: imp('Input', '@angular/core'), que: "Error 1: falta importar Input:  import { Component, Input } from '@angular/core';" }
          ] } },
        { fuente: { debeTener: [
            { re: '<app-producto', que: 'Error 2: la etiqueta tiene que ser <app-producto>, con el prefijo del selector.' },
            { re: '\\[\\s*precio\\s*\\]\\s*=', que: 'Error 3: el precio es un número y necesita corchetes: [precio]="15000".' },
            { re: '\\[\\s*enStock\\s*\\]\\s*=', que: 'Error 4: el booleano necesita corchetes: [enStock]="false".' }
          ],
          noDebeTener: [
            { re: '<producto\\b', que: 'Sigue la etiqueta <producto>: el selector es app-producto.' },
            { re: '\\bprecio\\s*=\\s*.\\d', que: 'El precio sin corchetes llega como texto.' },
            { re: '\\benStock\\s*=\\s*.(true|false)', que: 'El booleano sin corchetes llega como texto: y el texto "false" es truthy.' }
          ] } },
        { arranca: true },
        { sinErrores: true },
        { dom: { textos: { selector: '#nombre', igual: ['Teclado mecánico'] } } },
        { dom: { textos: { selector: '#precio', igual: ['Precio + 1: 15001'] } },
          pista: 'Si dice 150001, el precio llegó como texto: le faltan los corchetes.' },
        { dom: { textos: { selector: '#stock', igual: ['Sin stock'] } },
          pista: 'Si dice Disponible, el false llegó como texto: le faltan los corchetes.' }
    ]
},

{
    id: 'p03',
    titulo: 'Los cinco bindings en una etiqueta',
    minutos: 14,
    abrir: 'app/app.component.ts',

    teoria: [
        { h: 'Todo lo que se puede hacer con un componente hijo' },
        { p: 'Una sola etiqueta puede combinar los distintos tipos de binding. Cada uno tiene su sintaxis, y elegir mal el tipo es el error de parcial más frecuente.' },
        { tabla: {
            cabeceras: ['Necesito...', 'Sintaxis'],
            filas: [
                ['Pasar un texto fijo', '`titulo="Mouse gamer"` (o `[titulo]="\'Mouse gamer\'"`)'],
                ['Pasar un número', '`[stock]="2500"`'],
                ['Pasar el valor de una variable del padre', '`[precio]="precioActual"`'],
                ['Pasar un booleano', '`[destacado]="true"`'],
                ['Escuchar un evento del hijo', '`(eliminado)="borrar($event)"`']
            ]
        } },
        { clave: 'La regla: **corchetes, entra un dato. Paréntesis, sale un evento.** Y lo que va entre comillas con corchetes es **código TypeScript**, no texto.' }
    ],

    consigna: [
        { p: 'El componente `app-item` ya está hecho: recibe `titulo`, `stock`, `precio` y `destacado`, y emite `eliminado` con el título. El padre lo usa vacío. Escribí la etiqueta con los cinco bindings:' },
        { numerada: [
            'Pasar el texto fijo **`Mouse gamer`** a `titulo`.',
            'Pasar el número **2500** a `stock`.',
            'Pasar el contenido de la variable **`precioActual`** del padre a `precio`.',
            'Pasar **`true`** a `destacado`.',
            'Escuchar `eliminado` y llamar al método `borrar($event)` del padre.'
        ] }
    ],

    semilla: {
        'app/app.module.ts': moduloDe([['ItemComponent', './item/item.component']]),
        'app/item/item.component.ts': C(`
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-item',
  template: \`
    <div class="item" [ngClass]="{ 'destacado': destacado }">
      <h3 id="titulo">{{ titulo }}</h3>
      <p id="stock">Stock + 1: {{ stock + 1 }}</p>
      <p id="precio">Precio: {{ precio }}</p>
      <p id="destacado">{{ destacado ? 'Destacado' : 'Común' }}</p>
      <button id="eliminar" (click)="eliminado.emit(titulo)">Eliminar</button>
    </div>
  \`,
  styles: \`
    .item { border: 1px solid #c8d0da; border-radius: 6px; padding: 2px 14px; max-width: 260px; }
    .destacado { border-color: #f0ad00; background: #fffbea; }
  \`
})
export class ItemComponent {
  @Input() titulo: string = '';
  @Input() stock: number = 0;
  @Input() precio: number = 0;
  @Input() destacado: boolean = false;
  @Output() eliminado = new EventEmitter<string>();
}
`),
        'app/app.component.ts': C(`
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: \`
    <h2>Inventario</h2>
    <app-item></app-item>
    <p id="mensaje">{{ mensaje }}</p>
  \`
})
export class AppComponent {
  precioActual: number = 1800;
  mensaje: string = '';

  borrar(titulo: string): void {
    this.mensaje = 'Eliminado: ' + titulo;
  }
}
`)
    },

    solucion: {
        'app/app.component.ts': C(`
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: \`
    <h2>Inventario</h2>
    <app-item
      titulo="Mouse gamer"
      [stock]="2500"
      [precio]="precioActual"
      [destacado]="true"
      (eliminado)="borrar($event)">
    </app-item>
    <p id="mensaje">{{ mensaje }}</p>
  \`
})
export class AppComponent {
  precioActual: number = 1800;
  mensaje: string = '';

  borrar(titulo: string): void {
    this.mensaje = 'Eliminado: ' + titulo;
  }
}
`)
    },

    chequeos: [
        { fuente: { debeTener: [
            { re: 'titulo\\s*=\\s*.Mouse gamer', que: 'Falta el texto fijo:  titulo="Mouse gamer".' },
            { re: '\\[\\s*stock\\s*\\]\\s*=\\s*.2500', que: 'El número necesita corchetes:  [stock]="2500".' },
            { re: '\\[\\s*precio\\s*\\]\\s*=\\s*.precioActual', que: 'La variable del padre necesita corchetes:  [precio]="precioActual".' },
            { re: '\\[\\s*destacado\\s*\\]\\s*=\\s*.true', que: 'El booleano necesita corchetes:  [destacado]="true".' },
            { re: '\\(\\s*eliminado\\s*\\)\\s*=\\s*.borrar\\(\\s*\\$event', que: 'El evento se escucha con paréntesis:  (eliminado)="borrar($event)".' }
          ] } },
        { arranca: true },
        { sinErrores: true },
        { dom: { textos: { selector: '#titulo', igual: ['Mouse gamer'] } } },
        { dom: { textos: { selector: '#stock', igual: ['Stock + 1: 2501'] } },
          pista: 'Si dice 25001, el número llegó como texto: le faltan los corchetes a [stock].' },
        { dom: { textos: { selector: '#precio', igual: ['Precio: 1800'] } },
          pista: 'El precio sale de la variable precioActual del padre: [precio]="precioActual".' },
        { dom: { textos: { selector: '#destacado', igual: ['Destacado'] } },
          pista: 'El booleano true tiene que pasarse con corchetes: [destacado]="true".' },
        { accion: { clic: '#eliminar' } },
        { dom: { textos: { selector: '#mensaje', igual: ['Eliminado: Mouse gamer'] } },
          pista: 'El padre tiene que escuchar el evento: (eliminado)="borrar($event)".' }
    ]
},

{
    id: 'p04',
    titulo: 'Tabla con estado vacío y filas alternas',
    minutos: 18,
    abrir: 'app/app.component.ts',

    teoria: [
        { h: 'Directivas y clases trabajando juntas' },
        { p: 'Una tabla real combina varias herramientas: `*ngIf` para el estado vacío, `*ngFor` para las filas, y `[ngClass]` para pintarlas según una condición.' },
        { codigo: C(`
<table *ngIf="productos.length > 0; else sinProductos">
  <tr *ngFor="let p of productos; let i = index"
      [ngClass]="{ 'par': i % 2 === 0, 'sin-stock': p.stock === 0 }">
    <td>{{ p.nombre }}</td>
  </tr>
</table>

<ng-template #sinProductos>
  <p>No hay productos cargados</p>
</ng-template>
`), archivo: 'tres directivas en una tabla' },
        { p: '`let i = index` da el número de fila (arranca en 0). `i % 2 === 0` es verdadero en las filas 0, 2, 4...: el resto de dividir por 2 es la forma clásica de alternar.' },
        { nota: 'El objeto de `ngClass` puede tener **varias clases a la vez**, cada una con su propia condición. Una fila puede ser par **y** sin stock al mismo tiempo.' }
    ],

    consigna: [
        { p: 'Los datos y los botones "Vaciar" y "Cargar" ya están. Escribí la tabla:' },
        { numerada: [
            'Si `productos` **no está vacío**, mostrá una `<table id="tabla">` con una fila `<tr class="fila">` por producto: nombre, precio y stock.',
            'Si **está vacío**, en lugar de la tabla mostrá `<p id="vacio">No hay productos cargados</p>`. Usá `*ngIf` con `else` y un `<ng-template>`.',
            'Las filas **pares** (0, 2...) llevan la clase `par`.',
            'Los productos **sin stock** (stock 0) llevan la clase `sin-stock`.'
        ] },
        { p: 'Los estilos de `par` y `sin-stock` ya están definidos.' }
    ],

    semilla: {
        'app/app.module.ts': moduloDe([]),
        'app/app.component.ts': C(`
import { Component } from '@angular/core';

interface Producto {
  nombre: string;
  precio: number;
  stock: number;
}

const ORIGINAL: Producto[] = [
  { nombre: 'Teclado', precio: 15000, stock: 4 },
  { nombre: 'Mouse', precio: 8000, stock: 0 },
  { nombre: 'Monitor', precio: 120000, stock: 2 },
  { nombre: 'Cable HDMI', precio: 3000, stock: 0 }
];

@Component({
  selector: 'app-root',
  template: \`
    <h2>Productos</h2>
    <button id="vaciar" (click)="vaciar()">Vaciar</button>
    <button id="cargar" (click)="cargar()">Cargar</button>
  \`,
  styles: \`
    .par { background: #f1f4f8; }
    .sin-stock { color: #999; text-decoration: line-through; }
    table { border-collapse: collapse; margin-top: 8px; }
    td { padding: 4px 12px; }
  \`
})
export class AppComponent {
  productos: Producto[] = [...ORIGINAL];

  vaciar(): void { this.productos = []; }
  cargar(): void { this.productos = [...ORIGINAL]; }
}
`)
    },

    solucion: {
        'app/app.component.ts': C(`
import { Component } from '@angular/core';

interface Producto {
  nombre: string;
  precio: number;
  stock: number;
}

const ORIGINAL: Producto[] = [
  { nombre: 'Teclado', precio: 15000, stock: 4 },
  { nombre: 'Mouse', precio: 8000, stock: 0 },
  { nombre: 'Monitor', precio: 120000, stock: 2 },
  { nombre: 'Cable HDMI', precio: 3000, stock: 0 }
];

@Component({
  selector: 'app-root',
  template: \`
    <h2>Productos</h2>
    <button id="vaciar" (click)="vaciar()">Vaciar</button>
    <button id="cargar" (click)="cargar()">Cargar</button>

    <table id="tabla" *ngIf="productos.length > 0; else sinProductos">
      <tr class="fila" *ngFor="let p of productos; let i = index"
          [ngClass]="{ 'par': i % 2 === 0, 'sin-stock': p.stock === 0 }">
        <td>{{ p.nombre }}</td>
        <td>{{ p.precio }}</td>
        <td>{{ p.stock }}</td>
      </tr>
    </table>
    <ng-template #sinProductos>
      <p id="vacio">No hay productos cargados</p>
    </ng-template>
  \`,
  styles: \`
    .par { background: #f1f4f8; }
    .sin-stock { color: #999; text-decoration: line-through; }
    table { border-collapse: collapse; margin-top: 8px; }
    td { padding: 4px 12px; }
  \`
})
export class AppComponent {
  productos: Producto[] = [...ORIGINAL];

  vaciar(): void { this.productos = []; }
  cargar(): void { this.productos = [...ORIGINAL]; }
}
`)
    },

    chequeos: [
        { fuente: { debeTener: [
            { re: '\\*ngIf\\s*=\\s*.[^"\']*;\\s*else\\s+\\w+', que: 'Falta el *ngIf con else, apuntando a la referencia del <ng-template>.' },
            { re: '<ng-template\\s+#\\w+', que: 'Falta el <ng-template #nombre> con el mensaje de lista vacía.' },
            { re: '\\*ngFor\\s*=\\s*.let\\s+\\w+\\s+of\\s+productos[^"\']*index', que: 'Falta el *ngFor con el índice:  let p of productos; let i = index.' },
            { re: '\\[\\s*ngClass\\s*\\]', que: 'Falta [ngClass] para pintar las filas.' },
            { re: 'i\\s*%\\s*2', que: 'Para alternar las filas se usa el resto de dividir el índice por 2:  i % 2 === 0.' }
          ] } },
        { arranca: true },
        { sinErrores: true },
        { dom: { contar: { selector: '.fila', es: 4 } },
          pista: 'Tiene que haber una fila por producto: 4 en total, con class="fila".' },
        { dom: { contar: { selector: '.fila.par', es: 2 } },
          pista: 'Las filas 0 y 2 son pares: [ngClass]="{ \'par\': i % 2 === 0 }".' },
        { dom: { contar: { selector: '.fila.sin-stock', es: 2 } },
          pista: 'El mouse y el cable no tienen stock: \'sin-stock\': p.stock === 0.' },
        { dom: { noExiste: { selector: '#vacio' } } },
        { accion: { clic: '#vaciar' } },
        { dom: { textos: { selector: '#vacio', igual: ['No hay productos cargados'] } },
          pista: 'Sin productos tiene que aparecer el mensaje, en un párrafo con id vacio.' },
        { dom: { noExiste: { selector: '#tabla' } },
          pista: 'Sin productos la tabla no tiene que existir. El *ngIf tiene que eliminarla.' },
        { accion: { clic: '#cargar' } },
        { dom: { contar: { selector: '.fila', es: 4 } } },
        { dom: { noExiste: { selector: '#vacio' } } }
    ]
},

{
    id: 'p05',
    titulo: 'Tareas: completar y eliminar',
    minutos: 18,
    abrir: 'app/app.component.ts',

    teoria: [
        { h: 'Un hijo, dos eventos, un estado en el padre' },
        { p: 'Este es el patrón más repetido de los prácticos: una lista donde cada fila puede **eliminarse** o **marcarse como completada**. El hijo no guarda nada: emite lo que el usuario quiere, y el padre decide.' },
        { diagrama: 'padre (tareas: [...])\n  ├─ [id] [titulo] [completada] ──▶ hijo (muestra la tarea)\n  └─ (completarTarea) (eliminarTarea) ◀── hijo (avisa qué se apretó)' },
        { clave: 'El dato `completada` **baja** con `[completada]="t.completada"`, y el aviso **sube** con `(completarTarea)`. Cuando el padre cambia `t.completada`, el hijo lo recibe de nuevo y se vuelve a pintar solo.' },
        { nota: 'Cada `@Output` es **un evento distinto**: `completarTarea` y `eliminarTarea`. No se junta todo en uno con un texto que diga cuál fue.' }
    ],

    consigna: [
        { p: 'El hijo `app-tarea-item` ya recibe `id`, `titulo` y `completada`, y emite `completarTarea` y `eliminarTarea` con el id. El padre lista las tareas pero no le pasa `completada` ni escucha nada. Completalo:' },
        { numerada: [
            'Pasale a cada tarea `[completada]="t.completada"`.',
            'Escuchá `(completarTarea)` llamando a `completarPorId($event)` y `(eliminarTarea)` llamando a `eliminarPorId($event)`.',
            '`completarPorId(id)`: buscá la tarea y poné `completada` en `true`.',
            '`eliminarPorId(id)`: sacá la tarea del array.'
        ] },
        { p: 'Las tareas completadas se ven tachadas, y el contador de abajo cuenta cuántas hay.' }
    ],

    semilla: {
        'app/app.module.ts': moduloDe([['TareaItemComponent', './tarea-item/tarea-item.component']]),
        'app/tarea-item/tarea-item.component.ts': C(`
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-tarea-item',
  template: \`
    <div class="tarea" [ngClass]="{ 'completada': completada }">
      <span class="titulo">{{ titulo }}</span>
      <button class="completar" (click)="completarTarea.emit(id)">Completar</button>
      <button class="eliminar" (click)="eliminarTarea.emit(id)">Eliminar</button>
    </div>
  \`,
  styles: \`
    .tarea { display: flex; gap: 12px; align-items: center; padding: 4px 0; }
    .completada .titulo { text-decoration: line-through; color: #999; }
  \`
})
export class TareaItemComponent {
  @Input() id: number = 0;
  @Input() titulo: string = '';
  @Input() completada: boolean = false;
  @Output() completarTarea = new EventEmitter<number>();
  @Output() eliminarTarea = new EventEmitter<number>();
}
`),
        'app/app.component.ts': C(`
import { Component } from '@angular/core';

interface Tarea {
  id: number;
  titulo: string;
  completada: boolean;
}

@Component({
  selector: 'app-root',
  template: \`
    <h2>Mis tareas</h2>
    <app-tarea-item
      *ngFor="let t of tareas"
      [id]="t.id"
      [titulo]="t.titulo">
    </app-tarea-item>
    <p id="resumen">Completadas: {{ completadas }}</p>
  \`
})
export class AppComponent {
  tareas: Tarea[] = [
    { id: 1, titulo: 'Preparar clase de Angular', completada: false },
    { id: 2, titulo: 'Corregir parciales', completada: false },
    { id: 3, titulo: 'Actualizar el repo', completada: false }
  ];

  get completadas(): number {
    return this.tareas.filter(t => t.completada).length;
  }

  completarPorId(id: number): void {
  }

  eliminarPorId(id: number): void {
  }
}
`)
    },

    solucion: {
        'app/app.component.ts': C(`
import { Component } from '@angular/core';

interface Tarea {
  id: number;
  titulo: string;
  completada: boolean;
}

@Component({
  selector: 'app-root',
  template: \`
    <h2>Mis tareas</h2>
    <app-tarea-item
      *ngFor="let t of tareas"
      [id]="t.id"
      [titulo]="t.titulo"
      [completada]="t.completada"
      (completarTarea)="completarPorId($event)"
      (eliminarTarea)="eliminarPorId($event)">
    </app-tarea-item>
    <p id="resumen">Completadas: {{ completadas }}</p>
  \`
})
export class AppComponent {
  tareas: Tarea[] = [
    { id: 1, titulo: 'Preparar clase de Angular', completada: false },
    { id: 2, titulo: 'Corregir parciales', completada: false },
    { id: 3, titulo: 'Actualizar el repo', completada: false }
  ];

  get completadas(): number {
    return this.tareas.filter(t => t.completada).length;
  }

  completarPorId(id: number): void {
    const t = this.tareas.find(x => x.id === id);
    if (t) { t.completada = true; }
  }

  eliminarPorId(id: number): void {
    this.tareas = this.tareas.filter(t => t.id !== id);
  }
}
`)
    },

    chequeos: [
        { fuente: { debeTener: [
            { re: '\\[\\s*completada\\s*\\]\\s*=', que: 'Falta pasar el dato con corchetes:  [completada]="t.completada".' },
            { re: '\\(\\s*completarTarea\\s*\\)\\s*=', que: 'Falta escuchar (completarTarea)="completarPorId($event)".' },
            { re: '\\(\\s*eliminarTarea\\s*\\)\\s*=', que: 'Falta escuchar (eliminarTarea)="eliminarPorId($event)".' }
          ] } },
        { arranca: true },
        { sinErrores: true },
        { dom: { contar: { selector: 'app-tarea-item', es: 3 } } },
        { dom: { textos: { selector: '#resumen', igual: ['Completadas: 0'] } } },
        { accion: { clic: '.completar' } },
        { dom: { contar: { selector: '.tarea.completada', es: 1 } },
          pista: 'Al completar la primera tarea tiene que verse tachada: pasale [completada]="t.completada" y ponelo en true en completarPorId.' },
        { dom: { textos: { selector: '#resumen', igual: ['Completadas: 1'] } } },
        { accion: { clic: '.eliminar' } },
        { dom: { contar: { selector: 'app-tarea-item', es: 2 } },
          pista: 'Al eliminar la primera tienen que quedar 2. eliminarPorId tiene que sacarla del array.' },
        { dom: { textos: { selector: '.titulo', igual: ['Corregir parciales', 'Actualizar el repo'] } } },
        { dom: { textos: { selector: '#resumen', igual: ['Completadas: 0'] } },
          pista: 'La tarea completada era la que se eliminó: el contador vuelve a 0.' }
    ]
},

    /* ------------------------------------------------------------------------
     * Formularios y proyección
     * ---------------------------------------------------------------------- */

{
    id: 'p06',
    titulo: 'Select con ngModel',
    minutos: 14,
    abrir: 'app/app.component.ts',

    teoria: [
        { h: 'ngModel también funciona con un select' },
        { p: '`[(ngModel)]` no es sólo para campos de texto: enlaza cualquier control de formulario. Con un `<select>`, lo elegido por el usuario queda guardado en la propiedad, y si la propiedad cambia desde el código, el select cambia solo.' },
        { codigo: C(`
<select [(ngModel)]="estadoElegido">
  <option *ngFor="let o of opciones" [value]="o">{{ o }}</option>
</select>
<p>Mostrando: {{ estadoElegido }}</p>
`), archivo: 'el select con sus opciones' },
        { p: 'Las opciones se generan con `*ngFor` a partir de un array, y cada una lleva su valor con `[value]`. Como siempre, `ngModel` necesita **`FormsModule`** en el módulo: en este proyecto ya está importado.' },
        { clave: 'Lo habitual es combinar el select con un `get` que **filtra la lista** según lo elegido. Cuando el usuario cambia la opción, el `get` se recalcula y la lista se actualiza sola.' }
    ],

    consigna: [
        { p: 'El componente ya tiene `estadoElegido`, las `opciones` y un `get turnosFiltrados` que filtra la lista. Falta el select:' },
        { numerada: [
            'Un `<select id="estado">` enlazado con `[(ngModel)]="estadoElegido"`.',
            'Una `<option>` por cada elemento de `opciones`, con `*ngFor` y `[value]`.',
            'Un párrafo `#mostrando` que diga `Mostrando: ` seguido de la opción elegida.'
        ] }
    ],

    semilla: {
        'app/app.module.ts': moduloDe([], true),
        'app/app.component.ts': C(`
import { Component } from '@angular/core';

interface Turno {
  id: number;
  paciente: string;
  estado: string;
}

@Component({
  selector: 'app-root',
  template: \`
    <h2>Turnos</h2>
    <ul id="lista">
      <li *ngFor="let t of turnosFiltrados">{{ t.paciente }}</li>
    </ul>
  \`
})
export class AppComponent {
  estadoElegido: string = 'todos';
  opciones: string[] = ['todos', 'pendiente', 'confirmado', 'cancelado'];

  turnos: Turno[] = [
@@CUATRO@@
  ];

  get turnosFiltrados(): Turno[] {
    if (this.estadoElegido === 'todos') {
      return this.turnos;
    }
    return this.turnos.filter(t => t.estado === this.estadoElegido);
  }
}
`)
    },

    solucion: {
        'app/app.component.ts': C(`
import { Component } from '@angular/core';

interface Turno {
  id: number;
  paciente: string;
  estado: string;
}

@Component({
  selector: 'app-root',
  template: \`
    <h2>Turnos</h2>
    <select id="estado" [(ngModel)]="estadoElegido">
      <option *ngFor="let o of opciones" [value]="o">{{ o }}</option>
    </select>
    <p id="mostrando">Mostrando: {{ estadoElegido }}</p>
    <ul id="lista">
      <li *ngFor="let t of turnosFiltrados">{{ t.paciente }}</li>
    </ul>
  \`
})
export class AppComponent {
  estadoElegido: string = 'todos';
  opciones: string[] = ['todos', 'pendiente', 'confirmado', 'cancelado'];

  turnos: Turno[] = [
@@CUATRO@@
  ];

  get turnosFiltrados(): Turno[] {
    if (this.estadoElegido === 'todos') {
      return this.turnos;
    }
    return this.turnos.filter(t => t.estado === this.estadoElegido);
  }
}
`)
    },

    chequeos: [
        { fuente: { debeTener: [
            { re: '<select', que: 'Falta el <select id="estado">.' },
            { re: '\\[\\(\\s*ngModel\\s*\\)\\]\\s*=\\s*.estadoElegido', que: 'Falta enlazar el select:  [(ngModel)]="estadoElegido".' },
            { re: '<option[^>]*\\*ngFor[^>]*opciones', que: 'Las opciones se generan con *ngFor a partir del array opciones.' },
            { re: '<option[^>]*\\[\\s*value\\s*\\]', que: 'Cada option lleva su valor con [value]="o".' }
          ] } },
        { arranca: true },
        { sinErrores: true,
          pista: 'Si el error habla de ngModel, revisá que escribiste [(ngModel)] con los dos pares de signos.' },
        { dom: { textos: { selector: '#mostrando', igual: ['Mostrando: todos'] } } },
        { dom: { contar: { selector: '#lista li', es: 4 } } },
        { accion: { elegir: ['#estado', 'confirmado'] } },
        { dom: { textos: { selector: '#mostrando', igual: ['Mostrando: confirmado'] } },
          pista: 'Al elegir una opción, estadoElegido tiene que cambiar. Revisá [(ngModel)] en el select.' },
        { dom: { textos: { selector: '#lista li', igual: ['Luis Pérez'] } } },
        { accion: { elegir: ['#estado', 'pendiente'] } },
        { dom: { textos: { selector: '#lista li', igual: ['Ana Gómez', 'Sofía Ruiz'] } } }
    ]
},

{
    id: 'p07',
    titulo: 'El panel colapsable',
    minutos: 18,
    abrir: 'app/panel/panel.component.ts',

    teoria: [
        { h: 'Tres herramientas en un componente' },
        { p: 'El panel colapsable es el ejemplo perfecto para ver **`@Input`, `@Output` y `ng-content` juntos**. Cada una resuelve una cosa distinta:' },
        { tabla: {
            cabeceras: ['Necesidad', 'Herramienta'],
            filas: [
                ['El título y si arranca abierto o cerrado', '`@Input()`'],
                ['Que el padre se entere de que se abrió o se cerró', '`@Output()` + `EventEmitter`'],
                ['Que cada panel muestre contenido distinto', '`<ng-content>`']
            ]
        } },
        { codigo: C(`
<div class="cuerpo" *ngIf="expandido">
  <ng-content></ng-content>
</div>
`), archivo: 'el contenido proyectado sólo se ve si el panel está abierto' },
        { p: 'El `<ng-content>` puede estar **adentro de un `*ngIf`**: el contenido del padre se muestra únicamente cuando el panel está expandido.' },
        { nota: 'El evento emite un **booleano** con el estado nuevo: `EventEmitter<boolean>`. El padre no tiene que adivinar si el panel se abrió o se cerró.' }
    ],

    consigna: [
        { p: 'El panel ya tiene su título, el encabezado clickeable y el cuerpo. El padre lo usa tres veces y anota en `#registro` el último cambio. Completá el panel:' },
        { numerada: [
            'Agregá `<ng-content></ng-content>` adentro del `<div class="cuerpo">`.',
            'Declará `@Output() cambioEstado = new EventEmitter<boolean>()`.',
            'En `alternar()`, después de cambiar `expandido`, emití el estado nuevo con `cambioEstado.emit(...)`.'
        ] },
        { p: 'El primer panel arranca abierto y los otros dos cerrados.' }
    ],

    semilla: {
        'app/app.module.ts': moduloDe([['PanelComponent', './panel/panel.component']]),
        'app/panel/panel.component.ts': C(`
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-panel',
  template: \`
    <div class="panel">
      <div class="encabezado" (click)="alternar()">
        <strong>{{ titulo }}</strong>
        <span>{{ expandido ? '-' : '+' }}</span>
      </div>
      <div class="cuerpo" *ngIf="expandido">
      </div>
    </div>
  \`,
  styles: \`
    .panel { border: 1px solid #c8d0da; border-radius: 6px; margin: 6px 0; max-width: 320px; }
    .encabezado { display: flex; justify-content: space-between; padding: 8px 12px; cursor: pointer; background: #eef3f8; }
    .cuerpo { padding: 4px 12px; }
  \`
})
export class PanelComponent {
  @Input() titulo: string = '';
  @Input() expandido: boolean = false;

  alternar(): void {
    this.expandido = !this.expandido;
  }
}
`),
        'app/app.component.ts': C(`
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: \`
    <div id="paneles">
      <app-panel titulo="Datos personales" [expandido]="true"
                 (cambioEstado)="guardarEstado('datos', $event)">
        <p id="datos-texto">Nombre: Ana Gómez</p>
      </app-panel>
      <app-panel titulo="Historial" (cambioEstado)="guardarEstado('historial', $event)">
        <p id="historial-texto">Último turno: 24/08</p>
      </app-panel>
      <app-panel titulo="Notas" (cambioEstado)="guardarEstado('notas', $event)">
        <p id="notas-texto">En tratamiento desde marzo.</p>
      </app-panel>
    </div>
    <p id="registro">{{ ultimo }}</p>
  \`
})
export class AppComponent {
  ultimo: string = 'Sin cambios';

  guardarEstado(nombre: string, abierto: boolean): void {
    this.ultimo = nombre + ': ' + (abierto ? 'abierto' : 'cerrado');
  }
}
`)
    },

    solucion: {
        'app/panel/panel.component.ts': C(`
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-panel',
  template: \`
    <div class="panel">
      <div class="encabezado" (click)="alternar()">
        <strong>{{ titulo }}</strong>
        <span>{{ expandido ? '-' : '+' }}</span>
      </div>
      <div class="cuerpo" *ngIf="expandido">
        <ng-content></ng-content>
      </div>
    </div>
  \`,
  styles: \`
    .panel { border: 1px solid #c8d0da; border-radius: 6px; margin: 6px 0; max-width: 320px; }
    .encabezado { display: flex; justify-content: space-between; padding: 8px 12px; cursor: pointer; background: #eef3f8; }
    .cuerpo { padding: 4px 12px; }
  \`
})
export class PanelComponent {
  @Input() titulo: string = '';
  @Input() expandido: boolean = false;
  @Output() cambioEstado = new EventEmitter<boolean>();

  alternar(): void {
    this.expandido = !this.expandido;
    this.cambioEstado.emit(this.expandido);
  }
}
`)
    },

    chequeos: [
        { fuente: { archivo: 'app/panel/panel.component.ts', debeTener: [
            { re: '<ng-content', que: 'Falta el <ng-content></ng-content> dentro del cuerpo.' },
            { re: imp('Output', '@angular/core'), que: "Falta importar Output desde '@angular/core'." },
            { re: imp('EventEmitter', '@angular/core'), que: "Falta importar EventEmitter desde '@angular/core'." },
            { re: '@Output\\(\\)\\s*cambioEstado\\s*=\\s*new\\s+EventEmitter\\s*<\\s*boolean\\s*>', que: 'Falta:  @Output() cambioEstado = new EventEmitter<boolean>();' },
            { re: 'cambioEstado\\.emit\\(', que: 'alternar() tiene que emitir con this.cambioEstado.emit(this.expandido).' }
          ] } },
        { arranca: true },
        { sinErrores: true },
        { dom: { existe: { selector: '#datos-texto' } },
          pista: 'El primer panel arranca abierto: su contenido tiene que verse. Falta el <ng-content> en el cuerpo.' },
        { dom: { noExiste: { selector: '#historial-texto' } } },
        { accion: { clic: '#paneles app-panel:nth-child(1) .encabezado' } },
        { dom: { noExiste: { selector: '#datos-texto' } },
          pista: 'Al cerrar el panel su contenido tiene que desaparecer.' },
        { dom: { textos: { selector: '#registro', igual: ['datos: cerrado'] } },
          pista: 'Al cerrar, el panel tiene que emitir false: cambioEstado.emit(this.expandido) después de cambiar expandido.' },
        { accion: { clic: '#paneles app-panel:nth-child(2) .encabezado' } },
        { dom: { existe: { selector: '#historial-texto' } } },
        { dom: { textos: { selector: '#registro', igual: ['historial: abierto'] } },
          pista: 'Al abrir, el panel tiene que emitir true.' }
    ]
},

{
    id: 'p08',
    titulo: '@ContentChild: el wizard',
    minutos: 20,
    abrir: 'app/wizard/wizard.component.ts',

    teoria: [
        { h: 'Llegar al contenido que te proyectaron' },
        { p: '`@ViewChild` busca en **el propio template** del componente. Pero un componente que recibe contenido con `ng-content` también puede necesitar acceder a ese contenido: por ejemplo, un asistente de pasos (wizard) que tiene que **validar el paso actual** antes de avanzar, sin saber qué paso le pusieron.' },
        { p: 'Para eso está **`@ContentChild`**: busca en el contenido **proyectado**, es decir, lo que el padre insertó desde afuera.' },
        { codigo: C(`
export interface PasoValidable {
  esValido(): boolean;
}

export class WizardComponent {
  @ContentChild('pasoActual') paso!: PasoValidable;

  siguiente(): void {
    if (this.paso && !this.paso.esValido()) {
      return;
    }
    this.pasoNumero++;
  }
}
`), archivo: 'wizard.component.ts' },
        { codigo: C(`
<app-wizard>
  <app-paso-datos #pasoActual></app-paso-datos>
</app-wizard>
`), archivo: 'el padre marca el paso con una referencia de template' },
        { tabla: {
            cabeceras: ['Decorador', 'Dónde busca'],
            filas: [
                ['`@ViewChild`', 'En el propio template del componente'],
                ['`@ContentChild`', 'En el contenido proyectado con `ng-content`']
            ]
        } },
        { nota: 'El wizard sólo conoce la **interface** `PasoValidable`, no el paso concreto. Así sirve para cualquier paso que tenga un método `esValido()`. Es el mismo criterio de los componentes reutilizables: se configura desde afuera.' }
    ],

    consigna: [
        { p: 'El wizard muestra "Paso N" y un botón Siguiente que avanza siempre, sin mirar nada. El padre ya le puso adentro un paso de datos, marcado con `#pasoActual`, que sólo es válido si el nombre tiene 3 letras o más. Hacé que el wizard valide antes de avanzar:' },
        { numerada: [
            'Importá `ContentChild` y obtené el paso con `@ContentChild(\'pasoActual\') paso!: PasoValidable;`.',
            'En `siguiente()`, si el paso **no es válido**, poné en `error` el texto `Complete el paso antes de continuar` y no avances.',
            'Si es válido, vaciá `error` y avanzá.'
        ] }
    ],

    semilla: {
        'app/app.module.ts': moduloDe([
            ['WizardComponent', './wizard/wizard.component'],
            ['PasoDatosComponent', './paso-datos/paso-datos.component']
        ], true),
        'app/models/paso.model.ts': C(`
export interface PasoValidable {
  esValido(): boolean;
}
`),
        'app/paso-datos/paso-datos.component.ts': C(`
import { Component } from '@angular/core';
import { PasoValidable } from '../models/paso.model';

@Component({
  selector: 'app-paso-datos',
  template: \`<input id="nombre" [(ngModel)]="nombre" placeholder="Nombre (mínimo 3 letras)">\`
})
export class PasoDatosComponent implements PasoValidable {
  nombre: string = '';

  esValido(): boolean {
    return this.nombre.length >= 3;
  }
}
`),
        'app/wizard/wizard.component.ts': C(`
import { Component } from '@angular/core';
import { PasoValidable } from '../models/paso.model';

@Component({
  selector: 'app-wizard',
  template: \`
    <h3 id="numero">Paso {{ pasoNumero }}</h3>
    <ng-content></ng-content>
    <p id="error" *ngIf="error">{{ error }}</p>
    <button id="siguiente" (click)="siguiente()">Siguiente</button>
  \`
})
export class WizardComponent {
  pasoNumero: number = 1;
  error: string = '';

  siguiente(): void {
    this.pasoNumero++;
  }
}
`),
        'app/app.component.ts': C(`
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: \`
    <app-wizard>
      <app-paso-datos #pasoActual></app-paso-datos>
    </app-wizard>
  \`
})
export class AppComponent {}
`)
    },

    solucion: {
        'app/wizard/wizard.component.ts': C(`
import { Component, ContentChild } from '@angular/core';
import { PasoValidable } from '../models/paso.model';

@Component({
  selector: 'app-wizard',
  template: \`
    <h3 id="numero">Paso {{ pasoNumero }}</h3>
    <ng-content></ng-content>
    <p id="error" *ngIf="error">{{ error }}</p>
    <button id="siguiente" (click)="siguiente()">Siguiente</button>
  \`
})
export class WizardComponent {
  @ContentChild('pasoActual') paso!: PasoValidable;

  pasoNumero: number = 1;
  error: string = '';

  siguiente(): void {
    if (this.paso && !this.paso.esValido()) {
      this.error = 'Complete el paso antes de continuar';
      return;
    }
    this.error = '';
    this.pasoNumero++;
  }
}
`)
    },

    chequeos: [
        { fuente: { archivo: 'app/wizard/wizard.component.ts', debeTener: [
            { re: imp('ContentChild', '@angular/core'), que: "Falta importar ContentChild desde '@angular/core'." },
            { re: '@ContentChild\\(\\s*.pasoActual.\\s*\\)', que: "Falta la referencia al contenido proyectado:  @ContentChild('pasoActual') paso!: PasoValidable;" },
            { re: 'esValido\\s*\\(\\s*\\)', que: 'siguiente() tiene que preguntar this.paso.esValido().' }
          ] } },
        { arranca: true },
        { sinErrores: true },
        { dom: { textos: { selector: '#numero', igual: ['Paso 1'] } } },
        { accion: { clic: '#siguiente' } },
        { dom: { textos: { selector: '#numero', igual: ['Paso 1'] } },
          pista: 'Con el nombre vacío el paso no es válido: el wizard no tiene que avanzar.' },
        { dom: { textos: { selector: '#error', igual: ['Complete el paso antes de continuar'] } },
          pista: 'Si el paso no es válido, this.error tiene que valer exactamente "Complete el paso antes de continuar".' },
        { accion: { escribir: ['#nombre', 'Ana'] } },
        { accion: { clic: '#siguiente' } },
        { dom: { textos: { selector: '#numero', igual: ['Paso 2'] } },
          pista: 'Con un nombre de 3 letras el paso es válido: el wizard tiene que avanzar.' },
        { dom: { noExiste: { selector: '#error' } },
          pista: 'Al avanzar el mensaje de error tiene que desaparecer: this.error = \'\'.' }
    ]
},

    /* ------------------------------------------------------------------------
     * Pipes y control flow
     * ---------------------------------------------------------------------- */

{
    id: 'p09',
    titulo: 'Pipes: transformar para mostrar',
    minutos: 14,
    abrir: 'app/app.component.ts',

    teoria: [
        { h: 'Cambiar cómo se ve un dato, no el dato' },
        { p: 'Un **pipe** transforma un valor para mostrarlo en el template, sin modificar el dato original. Se escribe con una barra vertical: `{{ valor | pipe }}`.' },
        { tabla: {
            cabeceras: ['Pipe', 'Qué hace', 'Ejemplo'],
            filas: [
                ['`uppercase`', 'Todo en mayúsculas', '`{{ codigo | uppercase }}`'],
                ['`lowercase`', 'Todo en minúsculas', '`{{ estado | lowercase }}`'],
                ['`titlecase`', 'Primera letra de cada palabra en mayúscula', '`{{ nombre | titlecase }}`'],
                ['`slice`', 'Recorta un texto o un array', '`{{ texto | slice:0:7 }}`'],
                ['`date`', 'Da formato a una fecha', "`{{ fecha | date:'dd/MM/yyyy' }}`"],
                ['`json`', 'Muestra un objeto como JSON: sirve para depurar', '`{{ turno | json }}`'],
                ['`async`', 'Se suscribe a un Observable', '`{{ turnos$ | async }}`']
            ]
        } },
        { p: 'Los **parámetros** de un pipe van después de dos puntos: `slice:0:7` recibe el inicio y el fin. Y se pueden **encadenar**: `{{ texto | slice:0:3 | uppercase }}` primero recorta y después pasa a mayúsculas.' },
        { clave: 'Es **otro** "pipe" distinto del `.pipe()` de RxJS: este se usa en el template, con la barra, para mostrar un valor. Los dos comparten el nombre y nada más.' },
        { nota: 'Los pipes vienen con el módulo común, que `BrowserModule` ya incluye: no hay que importar nada para usarlos.' }
    ],

    consigna: [
        { p: 'El componente muestra seis datos sin ningún formato. Aplicá el pipe correcto a cada uno:' },
        { numerada: [
            '`#codigo`: en **mayúsculas**.',
            '`#estado`: en **minúsculas**.',
            '`#paciente`: con la primera letra de cada palabra en **mayúscula**.',
            '`#descripcion`: sólo los **primeros 7 caracteres**.',
            '`#fecha`: con el formato **`dd/MM/yyyy`**.',
            '`#objeto`: como **JSON**.'
        ] }
    ],

    semilla: {
        'app/app.module.ts': moduloDe([]),
        'app/app.component.ts': C(`
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: \`
    <p id="codigo">{{ codigo }}</p>
    <p id="estado">{{ estado }}</p>
    <p id="paciente">{{ paciente }}</p>
    <p id="descripcion">{{ descripcion }}</p>
    <p id="fecha">{{ fecha }}</p>
    <pre id="objeto">{{ turno }}</pre>
  \`
})
export class AppComponent {
  codigo: string = 'turno-2026-0824';
  estado: string = 'CONFIRMADO';
  paciente: string = 'maría fernández';
  descripcion: string = 'Control anual de rutina';
  fecha: Date = new Date(2026, 7, 24);
  turno = { id: 1, estado: 'pendiente' };
}
`)
    },

    solucion: {
        'app/app.component.ts': C(`
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: \`
    <p id="codigo">{{ codigo | uppercase }}</p>
    <p id="estado">{{ estado | lowercase }}</p>
    <p id="paciente">{{ paciente | titlecase }}</p>
    <p id="descripcion">{{ descripcion | slice:0:7 }}</p>
    <p id="fecha">{{ fecha | date:'dd/MM/yyyy' }}</p>
    <pre id="objeto">{{ turno | json }}</pre>
  \`
})
export class AppComponent {
  codigo: string = 'turno-2026-0824';
  estado: string = 'CONFIRMADO';
  paciente: string = 'maría fernández';
  descripcion: string = 'Control anual de rutina';
  fecha: Date = new Date(2026, 7, 24);
  turno = { id: 1, estado: 'pendiente' };
}
`)
    },

    chequeos: [
        { fuente: { debeTener: [
            { re: '\\|\\s*uppercase', que: 'Falta el pipe uppercase en el código.' },
            { re: '\\|\\s*lowercase', que: 'Falta el pipe lowercase en el estado.' },
            { re: '\\|\\s*titlecase', que: 'Falta el pipe titlecase en el paciente.' },
            { re: '\\|\\s*slice\\s*:\\s*0\\s*:\\s*7', que: 'Falta el pipe slice con sus parámetros:  slice:0:7' },
            { re: '\\|\\s*date\\s*:', que: "Falta el pipe date con su formato:  date:'dd/MM/yyyy'" },
            { re: '\\|\\s*json', que: 'Falta el pipe json en el objeto.' }
          ] } },
        { arranca: true },
        { sinErrores: true },
        { dom: { textos: { selector: '#codigo', igual: ['TURNO-2026-0824'] } } },
        { dom: { textos: { selector: '#estado', igual: ['confirmado'] } } },
        { dom: { textos: { selector: '#paciente', igual: ['María Fernández'] } } },
        { dom: { textos: { selector: '#descripcion', igual: ['Control'] } },
          pista: 'slice:0:7 recorta desde el carácter 0 hasta el 7: queda "Control".' },
        { dom: { textos: { selector: '#fecha', igual: ['24/08/2026'] } },
          pista: "El formato va entre comillas simples y con MM en mayúscula (mes):  date:'dd/MM/yyyy'." },
        { dom: { textos: { selector: '#objeto', igual: ['{ "id": 1, "estado": "pendiente" }'] } } }
    ]
},

{
    id: 'p10',
    titulo: 'Un pipe propio',
    minutos: 18,
    abrir: 'app/pipes/iniciales.pipe.ts',

    teoria: [
        { h: 'Cuando ninguno de los pipes alcanza' },
        { p: 'Si necesitás una transformación que no existe, escribís la tuya. Un pipe propio es una **clase con el decorador `@Pipe`** y un método `transform`, que recibe el valor (y los parámetros) y devuelve el resultado.' },
        { codigo: C(`
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'iniciales' })
export class InicialesPipe implements PipeTransform {
  transform(nombre: string, separador: string = ''): string {
    return nombre.split(' ').map(p => p.charAt(0).toUpperCase()).join(separador);
  }
}
`), archivo: 'iniciales.pipe.ts' },
        { codigo: C(`
{{ paciente | iniciales }}         <!-- AG -->
{{ paciente | iniciales:'.' }}     <!-- A.G -->
`), archivo: 'el segundo argumento del transform es el parámetro' },
        { p: '`name` es el nombre que se usa en el template. El primer parámetro de `transform` es siempre el valor de la izquierda de la barra; los siguientes son los que van después de los dos puntos.' },
        { clave: 'Como un componente, un pipe propio **hay que declararlo**: va en el array `declarations` de `app.module.ts`. Si te olvidás, la Consola muestra `NG0302`: el pipe no se encontró.' }
    ],

    consigna: [
        { p: 'El template ya usa `| iniciales` tres veces, pero el pipe todavía no existe de verdad: es una clase común que devuelve el nombre sin cambios. Convertila en un pipe:' },
        { numerada: [
            'En **`iniciales.pipe.ts`**: importá `Pipe` y `PipeTransform`, agregá `@Pipe({ name: \'iniciales\' })` y `implements PipeTransform`.',
            '`transform(nombre, separador = \'\')` tiene que devolver la **primera letra de cada palabra, en mayúscula**, unidas con el separador.',
            'En **`app.module.ts`**: importá `InicialesPipe` y agregalo a `declarations`.'
        ] },
        { p: '`Ana Gómez` tiene que dar `AG`, o `A.G` con el separador `.`. Y `luis pérez ruiz` da `LPR`.' }
    ],

    semilla: {
        'app/app.module.ts': C(`
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [BrowserModule],
  bootstrap: [AppComponent]
})
export class AppModule { }
`),
        'app/pipes/iniciales.pipe.ts': C(`
export class InicialesPipe {
  transform(nombre: string, separador: string = ''): string {
    return nombre;
  }
}
`),
        'app/app.component.ts': C(`
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: \`
    <h2>Pacientes</h2>
    <p id="sin-punto">{{ paciente | iniciales }}</p>
    <p id="con-punto">{{ paciente | iniciales:'.' }}</p>
    <p id="largo">{{ otro | iniciales }}</p>
  \`
})
export class AppComponent {
  paciente: string = 'Ana Gómez';
  otro: string = 'luis pérez ruiz';
}
`)
    },

    solucion: {
        'app/app.module.ts': C(`
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { InicialesPipe } from './pipes/iniciales.pipe';

@NgModule({
  declarations: [
    AppComponent,
    InicialesPipe
  ],
  imports: [BrowserModule],
  bootstrap: [AppComponent]
})
export class AppModule { }
`),
        'app/pipes/iniciales.pipe.ts': C(`
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'iniciales' })
export class InicialesPipe implements PipeTransform {
  transform(nombre: string, separador: string = ''): string {
    return nombre.split(' ').map(p => p.charAt(0).toUpperCase()).join(separador);
  }
}
`)
    },

    chequeos: [
        { fuente: { archivo: 'app/pipes/iniciales.pipe.ts', debeTener: [
            { re: imp('Pipe', '@angular/core'), que: "Falta importar Pipe desde '@angular/core'." },
            { re: imp('PipeTransform', '@angular/core'), que: "Falta importar PipeTransform desde '@angular/core'." },
            { re: '@Pipe\\(\\s*\\{\\s*name\\s*:\\s*.iniciales', que: "Falta el decorador:  @Pipe({ name: 'iniciales' })" },
            { re: 'implements\\s+PipeTransform', que: 'La clase tiene que declarar  implements PipeTransform.' },
            { re: 'transform\\s*\\(', que: 'Falta el método transform.' }
          ] } },
        { fuente: { archivo: 'app/app.module.ts', debeTener: [
            { re: 'import\\s*\\{[^}]*InicialesPipe[^}]*\\}\\s*from', que: "Falta importar el pipe en el módulo:  import { InicialesPipe } from './pipes/iniciales.pipe';" },
            { re: 'declarations\\s*:\\s*\\[[^\\]]*InicialesPipe', que: 'InicialesPipe tiene que estar en el array declarations, no sólo importado.' }
          ] } },
        { arranca: true },
        { sinErrores: true,
          pista: 'Si dice que el pipe iniciales no se encontró (NG0302), falta declararlo en app.module.ts.' },
        { dom: { textos: { selector: '#sin-punto', igual: ['AG'] } },
          pista: 'transform tiene que devolver la primera letra de cada palabra en mayúscula: AG.' },
        { dom: { textos: { selector: '#con-punto', igual: ['A.G'] } },
          pista: 'El segundo parámetro es el separador con el que se unen las iniciales: join(separador).' },
        { dom: { textos: { selector: '#largo', igual: ['LPR'] } },
          pista: 'Tiene que funcionar con cualquier cantidad de palabras y con minúsculas: toUpperCase() en cada inicial.' }
    ]
},

{
    id: 'p11',
    titulo: 'Control flow moderno: @if, @for, @switch',
    minutos: 20,
    abrir: 'app/app.component.ts',

    teoria: [
        { h: 'Una sintaxis nueva para lo de siempre' },
        { p: 'Desde Angular 17, los templates tienen una sintaxis propia para condicionales y bucles, que reemplaza a las directivas `*ngIf`, `*ngFor` y `ngSwitch`. Es la que usan los tutoriales actuales de angular.dev, y la que vas a ver en proyectos nuevos. **En el parcial pueden pedirte cualquiera de las dos**: conviene saber leer y escribir ambas.' },
        { tabla: {
            cabeceras: ['Con directivas', 'Con control flow'],
            filas: [
                ['`*ngIf="cond"`', '`@if (cond) { ... }`'],
                ['`*ngIf="cond; else otro"`', '`@if (cond) { ... } @else { ... }`'],
                ['`*ngFor="let t of turnos"`', '`@for (t of turnos; track t.id) { ... }`'],
                ['`*ngIf="turnos.length === 0"` para el estado vacío', '`@for (...) { ... } @empty { ... }`'],
                ['`[ngSwitch]` y `*ngSwitchCase`', '`@switch (x) { @case (valor) { ... } @default { ... } }`']
            ]
        } },
        { codigo: C(`
@for (t of turnos; track t.id) {
  <li>{{ t.paciente }}</li>
} @empty {
  <li>No hay turnos</li>
}

@if (turnos.length > 0) {
  <p>Hay {{ turnos.length }} turnos</p>
} @else {
  <p>Sin turnos</p>
}

@switch (estado) {
  @case ('pendiente') { <span>Pendiente</span> }
  @case ('confirmado') { <span>Confirmado</span> }
  @default { <span>Otro</span> }
}
`), archivo: 'las tres estructuras' },
        { clave: 'En `@for`, el **`track` es obligatorio**: le dice a Angular cómo identificar cada elemento para no volver a dibujar toda la lista cuando cambia. Casi siempre es un id: `track t.id`.' },
        { nota: 'No se importa nada: el control flow está integrado al template. Y `@empty` reemplaza al `*ngIf` del estado vacío de una lista.' }
    ],

    consigna: [
        { p: 'Este template funciona, pero está escrito con directivas. **Reescribilo con la sintaxis nueva**, sin cambiar lo que se ve:' },
        { numerada: [
            'El `*ngFor` del `<li>` pasa a `@for (t of turnos; track t.id)`.',
            'El `[ngSwitch]` con sus `*ngSwitchCase` pasa a `@switch` con `@case` y `@default`.',
            'El `<li id="vacio">` con `*ngIf` pasa a un bloque `@empty` del mismo `@for`.',
            'El `*ngIf ... else` del contador pasa a `@if ... @else`.'
        ] },
        { p: 'Al terminar no tiene que quedar ningún `*ngFor`, `*ngIf` ni `ngSwitch`.' }
    ],

    semilla: {
        'app/app.module.ts': moduloDe([]),
        'app/app.component.ts': C(`
import { Component } from '@angular/core';

interface Turno {
  id: number;
  paciente: string;
  estado: string;
}

@Component({
  selector: 'app-root',
  template: \`
    <h2>Turnos</h2>
    <ul id="lista">
      <li *ngFor="let t of turnos" [ngSwitch]="t.estado">
        <span *ngSwitchCase="'pendiente'" class="etiqueta pendiente">Pendiente</span>
        <span *ngSwitchCase="'confirmado'" class="etiqueta confirmado">Confirmado</span>
        <span *ngSwitchDefault class="etiqueta otro">Otro</span>
        {{ t.paciente }}
      </li>
      <li id="vacio" *ngIf="turnos.length === 0">No hay turnos</li>
    </ul>
    <p id="cantidad" *ngIf="turnos.length > 0; else sinTurnos">Hay {{ turnos.length }} turnos</p>
    <ng-template #sinTurnos>
      <p id="cantidad">Sin turnos</p>
    </ng-template>
    <button id="vaciar" (click)="turnos = []">Vaciar</button>
  \`
})
export class AppComponent {
  turnos: Turno[] = [
    { id: 1, paciente: 'Ana Gómez', estado: 'pendiente' },
    { id: 2, paciente: 'Luis Pérez', estado: 'confirmado' },
    { id: 3, paciente: 'Marcos Díaz', estado: 'cancelado' }
  ];
}
`)
    },

    solucion: {
        'app/app.component.ts': C(`
import { Component } from '@angular/core';

interface Turno {
  id: number;
  paciente: string;
  estado: string;
}

@Component({
  selector: 'app-root',
  template: \`
    <h2>Turnos</h2>
    <ul id="lista">
      @for (t of turnos; track t.id) {
        <li>
          @switch (t.estado) {
            @case ('pendiente') {
              <span class="etiqueta pendiente">Pendiente</span>
            }
            @case ('confirmado') {
              <span class="etiqueta confirmado">Confirmado</span>
            }
            @default {
              <span class="etiqueta otro">Otro</span>
            }
          }
          {{ t.paciente }}
        </li>
      } @empty {
        <li id="vacio">No hay turnos</li>
      }
    </ul>
    @if (turnos.length > 0) {
      <p id="cantidad">Hay {{ turnos.length }} turnos</p>
    } @else {
      <p id="cantidad">Sin turnos</p>
    }
    <button id="vaciar" (click)="turnos = []">Vaciar</button>
  \`
})
export class AppComponent {
  turnos: Turno[] = [
    { id: 1, paciente: 'Ana Gómez', estado: 'pendiente' },
    { id: 2, paciente: 'Luis Pérez', estado: 'confirmado' },
    { id: 3, paciente: 'Marcos Díaz', estado: 'cancelado' }
  ];
}
`)
    },

    chequeos: [
        { fuente: { debeTener: [
            { re: '@for\\s*\\(', que: 'Falta el @for (t of turnos; track t.id) { ... }.' },
            { re: 'track\\s+\\w+\\.\\w+', que: 'El @for necesita el track:  @for (t of turnos; track t.id).' },
            { re: '@empty', que: 'Falta el bloque @empty para el estado vacío.' },
            { re: '@switch\\s*\\(', que: 'Falta el @switch (t.estado) { ... }.' },
            { re: '@case\\s*\\(', que: 'Falta al menos un @case.' },
            { re: '@default', que: 'Falta el bloque @default.' },
            { re: '@if\\s*\\(', que: 'Falta el @if para el contador.' },
            { re: '@else', que: 'Falta el @else del contador.' }
          ],
          noDebeTener: [
            { re: '\\*ngFor', que: 'Todavía queda un *ngFor: pasalo a @for.' },
            { re: '\\*ngIf', que: 'Todavía queda un *ngIf: pasalo a @if o @empty.' },
            { re: 'ngSwitch', que: 'Todavía queda un ngSwitch: pasalo a @switch.' }
          ] } },
        { arranca: true },
        { sinErrores: true },
        { dom: { contar: { selector: '#lista li', es: 3 } } },
        { dom: { contar: { selector: '.etiqueta.pendiente', es: 1 } } },
        { dom: { contar: { selector: '.etiqueta.confirmado', es: 1 } } },
        { dom: { contar: { selector: '.etiqueta.otro', es: 1 } },
          pista: 'El turno cancelado no es pendiente ni confirmado: tiene que caer en @default.' },
        { dom: { textos: { selector: '#cantidad', igual: ['Hay 3 turnos'] } } },
        { dom: { noExiste: { selector: '#vacio' } } },
        { accion: { clic: '#vaciar' } },
        { dom: { textos: { selector: '#vacio', igual: ['No hay turnos'] } },
          pista: 'Sin turnos tiene que aparecer el bloque @empty del @for.' },
        { dom: { textos: { selector: '#cantidad', igual: ['Sin turnos'] } },
          pista: 'Sin turnos el contador tiene que pasar al @else.' },
        { dom: { contar: { selector: '.etiqueta', es: 0 } } }
    ]
}

    ];

    pasos.forEach(function (p) { CONTENIDO.practica.push(p); });
})();
