(function () {
    'use strict';

    function C(t) { return t.replace(/^\n/, ''); }

    function imp(nombre) {
        return 'import\\s*\\{[^}]*\\b' + nombre + '\\b[^}]*\\}\\s*from\\s*.@angular/core';
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

{
    id: 'p11',
    titulo: '@Input: del padre al hijo',
    minutos: 15,
    abrir: 'app/tarjeta/tarjeta.component.ts',

    teoria: [
        { h: 'De acá en adelante: proyectos con módulos' },
        { p: 'Los pasos que siguen usan **módulos**, como un proyecto creado con `ng new --standalone=false`, que es el estilo de la materia. Cada componente nuevo se **declara** en `app.module.ts`. Acá el módulo ya viene armado con todo declarado; en el parcial lo vas a tener que hacer vos, como en el paso 3.' },

        { h: 'El problema' },
        { p: 'Si un `TarjetaComponent` tiene el nombre del usuario escrito adentro, sirve para **un solo usuario**. Lo que se necesita es que el padre le pase el dato y que el mismo hijo sirva para cualquier caso.' },
        { clave: 'Pensá el componente hijo como una **función** y los `@Input` como sus **parámetros**. La función es siempre la misma; lo que cambia es lo que le pasás cada vez que la llamás.' },

        { h: 'Los tres pasos' },
        { numerada: [
            '**El hijo declara** la propiedad de entrada con el decorador `@Input()`.',
            '**El hijo la muestra** en su template, con `{{ }}` como cualquier otra propiedad.',
            '**El padre le pasa el valor** con un property binding: `[propiedad]="valor"`.'
        ] },
        { codigo: C(`
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-tarjeta',
  template: \`
    <h3>{{ nombreUsuario }}</h3>
    <p>Edad: {{ edad }}</p>
  \`
})
export class TarjetaComponent {
  @Input() nombreUsuario: string = '';
  @Input() edad: number = 0;
}
`), archivo: 'tarjeta.component.ts (el hijo)' },
        { codigo: '<app-tarjeta [nombreUsuario]="usuario" [edad]="edadUsuario"></app-tarjeta>', archivo: 'app.component.html (el padre)' },
        { nota: 'Sin el decorador no funciona. Una propiedad sin `@Input()` existe, pero es privada para el mundo exterior: si el padre intenta enlazarla, la Consola muestra `NG0303: Can\'t bind to \'x\' since it isn\'t a known property of \'app-tarjeta\'`. Ese mismo error aparece si el componente no está declarado o si escribiste mal el nombre de la etiqueta.' },

        { h: 'Resumen' },
        { tabla: {
            cabeceras: ['Aspecto', 'Detalle'],
            filas: [
                ['Dirección del flujo', 'Padre hacia hijo'],
                ['Quién lo declara', 'El hijo, con `@Input()`'],
                ['Sintaxis en el padre', 'Property binding: `[propiedad]="valor"`'],
                ['Quién dispara', 'El padre, al asignar el valor'],
                ['Import necesario', "`import { Input } from '@angular/core'`"],
                ['Propósito típico', 'Configurar o inicializar el hijo']
            ]
        } }
    ],

    consigna: [
        { p: 'El proyecto ya tiene dos componentes: `AppComponent` (el padre) y `TarjetaComponent` (el hijo). Hoy la tarjeta muestra siempre un nombre vacío y edad 0. Hacé que muestre los datos que le pasa el padre:' },
        { numerada: [
            'En **`tarjeta.component.ts`**: marcá `nombreUsuario` y `edad` con `@Input()`. Acordate de importar `Input`.',
            'En **`app.component.ts`**: pasale a `<app-tarjeta>` el valor de `usuario` y el de `edadUsuario`, con property binding.'
        ] },
        { nota: 'Los datos del padre son `usuario` (`Cesar`) y `edadUsuario` (`42`). Como `edadUsuario` es un número, el binding lleva corchetes: sin ellos llegaría como texto.' }
    ],

    semilla: {
        'app/app.module.ts': moduloDe([['TarjetaComponent', './tarjeta/tarjeta.component']]),
        'app/app.component.ts': C(`
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: \`
    <h2>Perfil</h2>
    <app-tarjeta></app-tarjeta>
  \`
})
export class AppComponent {
  usuario: string = 'Cesar';
  edadUsuario: number = 42;
}
`),
        'app/tarjeta/tarjeta.component.ts': C(`
import { Component } from '@angular/core';

@Component({
  selector: 'app-tarjeta',
  template: \`
    <div class="tarjeta">
      <h3 id="nombre">{{ nombreUsuario }}</h3>
      <p id="edad">Edad: {{ edad }}</p>
    </div>
  \`,
  styles: \`
    .tarjeta { border: 1px solid #c8d0da; border-radius: 6px; padding: 4px 14px; max-width: 260px; }
  \`
})
export class TarjetaComponent {
  nombreUsuario: string = '';
  edad: number = 0;
}
`)
    },

    solucion: {
        'app/app.component.ts': C(`
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: \`
    <h2>Perfil</h2>
    <app-tarjeta [nombreUsuario]="usuario" [edad]="edadUsuario"></app-tarjeta>
  \`
})
export class AppComponent {
  usuario: string = 'Cesar';
  edadUsuario: number = 42;
}
`),
        'app/tarjeta/tarjeta.component.ts': C(`
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-tarjeta',
  template: \`
    <div class="tarjeta">
      <h3 id="nombre">{{ nombreUsuario }}</h3>
      <p id="edad">Edad: {{ edad }}</p>
    </div>
  \`,
  styles: \`
    .tarjeta { border: 1px solid #c8d0da; border-radius: 6px; padding: 4px 14px; max-width: 260px; }
  \`
})
export class TarjetaComponent {
  @Input() nombreUsuario: string = '';
  @Input() edad: number = 0;
}
`)
    },

    chequeos: [
        { fuente: { archivo: 'app/tarjeta/tarjeta.component.ts', debeTener: [
            { re: imp('Input'), que: "Falta importar Input:  import { Component, Input } from '@angular/core';" },
            { re: '@Input\\(\\)\\s*nombreUsuario', que: 'Falta @Input() delante de nombreUsuario, en el hijo.' },
            { re: '@Input\\(\\)\\s*edad', que: 'Falta @Input() delante de edad, en el hijo.' }
          ] } },
        { fuente: { debeTener: [
            { re: '\\[\\s*nombreUsuario\\s*\\]\\s*=', que: 'Falta pasar nombreUsuario desde el padre, con corchetes: [nombreUsuario]="usuario".' },
            { re: '\\[\\s*edad\\s*\\]\\s*=', que: 'Falta pasar edad desde el padre, con corchetes: [edad]="edadUsuario".' }
          ] } },
        { arranca: true },
        { sinErrores: true,
          pista: 'Si el error dice NG0303, falta el @Input() en el hijo para esa propiedad.' },
        { dom: { textos: { selector: '#nombre', igual: ['Cesar'] } },
          pista: 'El nombre tiene que llegar desde el padre: [nombreUsuario]="usuario".' },
        { dom: { textos: { selector: '#edad', igual: ['Edad: 42'] } },
          pista: 'La edad tiene que llegar como número: [edad]="edadUsuario", con corchetes.' }
    ]
},

{
    id: 'p12',
    titulo: '@Input con objetos e interfaces',
    minutos: 16,
    abrir: 'app/app.component.ts',

    teoria: [
        { h: 'Un objeto entero, no cinco propiedades sueltas' },
        { p: 'Lo habitual en la práctica no es mandar cinco `@Input` sueltos, sino **un objeto completo**. Y para que el editor sepa qué forma tiene ese objeto, se lo describe con una **interface**: un contrato que dice qué propiedades tiene y de qué tipo es cada una. Las interfaces se ven a fondo más adelante; por ahora alcanza con saber que **no generan código JavaScript**, existen sólo para que te avisen de los errores mientras escribís.' },
        { codigo: C(`
export interface Alumno {
  legajo: number;
  nombre: string;
  nota: number;
}
`), archivo: 'models/alumno.model.ts' },
        { p: 'Se guarda en su propio archivo terminado en `.model.ts`, dentro de una carpeta `models`, y **el `export` es obligatorio** para poder importarla desde otro archivo.' },

        { h: 'El hijo recibe el objeto' },
        { codigo: C(`
import { Component, Input } from '@angular/core';
import { Alumno } from '../models/alumno.model';

@Component({
  selector: 'app-carta-alumno',
  template: \`<h3>{{ estudiante.nombre }}</h3>\`
})
export class CartaAlumnoComponent {
  @Input() estudiante!: Alumno;

  get aprobado(): boolean {
    return this.estudiante.nota >= 6;
  }
}
`), archivo: 'carta-alumno.component.ts' },
        { p: 'El signo de exclamación de `estudiante!` se llama *definite assignment assertion*. Le dice a TypeScript: "confiá, esta propiedad va a tener valor aunque yo no la inicialice acá". Se usa mucho con `@Input` y con `@ViewChild`.' },

        { h: 'El padre repite y pasa' },
        { p: 'Como el hijo espera **un** alumno, el padre combina lo que ya sabés: `*ngFor` para repetir y `[estudiante]` para pasar cada uno.' },
        { codigo: '<app-carta-alumno *ngFor="let al of alumnos" [estudiante]="al"></app-carta-alumno>', archivo: 'app.component.html (el padre)' },
        { nota: 'Si en el template del hijo ves `[object Object]`, estás interpolando el objeto entero: `{{ estudiante }}`. Hay que acceder a una propiedad con el punto: `{{ estudiante.nombre }}`.' },
        { p: 'También existe un alias, `@Input(\'nombre\') nombreUsuario`, que hace que adentro la propiedad se llame de una forma y afuera de otra. Se puede, pero no conviene: genera confusión.' }
    ],

    consigna: [
        { p: 'El hijo `CartaAlumnoComponent` ya está listo: recibe un `estudiante` y muestra nombre, legajo, nota y si aprobó. El padre tiene el array `alumnos`, pero todavía no dibuja nada.' },
        { numerada: [
            'En **`app.component.ts`**, dibujá **una carta por cada alumno** con un solo `*ngFor`.',
            'Pasale a cada carta su alumno con `[estudiante]="al"`.'
        ] },
        { p: 'Tienen que aparecer tres cartas: Ana y Sofía aprobadas, Luis desaprobado.' }
    ],

    semilla: {
        'app/app.module.ts': moduloDe([['CartaAlumnoComponent', './carta-alumno/carta-alumno.component']]),
        'app/models/alumno.model.ts': C(`
export interface Alumno {
  legajo: number;
  nombre: string;
  nota: number;
}
`),
        'app/carta-alumno/carta-alumno.component.ts': C(`
import { Component, Input } from '@angular/core';
import { Alumno } from '../models/alumno.model';

@Component({
  selector: 'app-carta-alumno',
  template: \`
    <div class="carta">
      <h3 class="nombre">{{ estudiante.nombre }}</h3>
      <p>Legajo: {{ estudiante.legajo }}</p>
      <p>Nota: {{ estudiante.nota }}</p>
      <p class="estado" [ngClass]="aprobado ? 'verde' : 'rojo'">
        {{ aprobado ? 'APROBADO' : 'DESAPROBADO' }}
      </p>
    </div>
  \`,
  styles: \`
    .carta { border: 1px solid #c8d0da; border-radius: 6px; padding: 2px 14px; margin: 8px 0; max-width: 260px; }
    .verde { color: #2e7d32; font-weight: 600; }
    .rojo { color: #c62828; font-weight: 600; }
  \`
})
export class CartaAlumnoComponent {
  @Input() estudiante!: Alumno;

  get aprobado(): boolean {
    return this.estudiante.nota >= 6;
  }
}
`),
        'app/app.component.ts': C(`
import { Component } from '@angular/core';
import { Alumno } from './models/alumno.model';

@Component({
  selector: 'app-root',
  template: \`
    <h2>Alumnos</h2>
    <!-- Una carta por cada alumno -->
  \`
})
export class AppComponent {
  alumnos: Alumno[] = [
    { legajo: 101, nombre: 'Ana Gómez', nota: 8 },
    { legajo: 102, nombre: 'Luis Pérez', nota: 4 },
    { legajo: 103, nombre: 'Sofía Ruiz', nota: 10 }
  ];
}
`)
    },

    solucion: {
        'app/app.component.ts': C(`
import { Component } from '@angular/core';
import { Alumno } from './models/alumno.model';

@Component({
  selector: 'app-root',
  template: \`
    <h2>Alumnos</h2>
    <app-carta-alumno *ngFor="let al of alumnos" [estudiante]="al"></app-carta-alumno>
  \`
})
export class AppComponent {
  alumnos: Alumno[] = [
    { legajo: 101, nombre: 'Ana Gómez', nota: 8 },
    { legajo: 102, nombre: 'Luis Pérez', nota: 4 },
    { legajo: 103, nombre: 'Sofía Ruiz', nota: 10 }
  ];
}
`)
    },

    chequeos: [
        { fuente: { debeTener: [
            { re: '\\*ngFor\\s*=\\s*.let\\s+\\w+\\s+of\\s+alumnos', que: 'Falta el *ngFor="let al of alumnos", con F mayúscula.' },
            { re: '\\[\\s*estudiante\\s*\\]\\s*=', que: 'Falta pasarle el alumno a cada carta: [estudiante]="al".' }
          ] } },
        { arranca: true },
        { sinErrores: true,
          pista: 'Si el error dice NG0303 con estudiante, revisá que escribiste [estudiante] tal cual, con corchetes.' },
        { dom: { contar: { selector: 'app-carta-alumno', es: 3 } },
          pista: 'Tiene que haber una carta por cada alumno: 3 en total.' },
        { dom: { textos: { selector: '.nombre', igual: ['Ana Gómez', 'Luis Pérez', 'Sofía Ruiz'] } },
          pista: 'Cada carta tiene que recibir SU alumno. Con let al of alumnos y [estudiante]="al" se arma solo.' },
        { dom: { textos: { selector: '.estado', igual: ['APROBADO', 'DESAPROBADO', 'APROBADO'] } },
          pista: 'Ana y Sofía aprobaron y Luis no. Si los estados no coinciden, revisá que pases el objeto al, no otra cosa.' }
    ]
},

{
    id: 'p13',
    titulo: 'Un componente reutilizable (y una trampa)',
    minutos: 16,
    abrir: 'app/app.component.ts',

    teoria: [
        { h: 'Se configura desde afuera, nunca por dentro' },
        { p: 'La gracia de un componente reutilizable es que se **configura con sus `@Input`**. Una alerta que sirve para tres casos no se escribe tres veces: se escribe una, y cada caso le pasa distintos valores.' },
        { codigo: C(`
@Component({ selector: 'app-alerta', template: \`
  <div class="alerta" [ngClass]="tipo" *ngIf="visible">{{ mensaje }}</div>
\` })
export class AlertaComponent {
  @Input() tipo: 'exito' | 'error' | 'advertencia' = 'exito';
  @Input() mensaje: string = '';
  @Input() visible: boolean = true;
}
`), archivo: 'alerta.component.ts' },
        { p: 'El tipo de `tipo` es un **union type de valores literales**: no es un string cualquiera, sólo esos tres textos exactos son válidos. Un error de tipeo se marca en el editor en lugar de fallar en producción.' },
        { codigo: C(`
<app-alerta tipo="exito" mensaje="Turno confirmado"></app-alerta>
<app-alerta tipo="error" mensaje="No se pudo conectar"></app-alerta>
<app-alerta tipo="advertencia" mensaje="El turno vence pronto"></app-alerta>
`), archivo: 'el mismo componente, tres usos' },
        { clave: 'El **test de la reutilización**: si para agregar el tercer caso tuviste que editar el componente hijo, el diseño está mal.' },

        { h: 'La trampa de los tipos, otra vez' },
        { p: 'Sin corchetes, **todo llega como texto**. Con un booleano es peligroso:' },
        { codigo: C(`
<app-alerta visible="false">     <!-- el TEXTO "false": es truthy, la alerta se ve -->
<app-alerta [visible]="false">   <!-- el BOOLEANO false: la alerta se esconde -->
`), archivo: 'dos formas, resultados opuestos' },
        { p: 'El texto `"false"` es un string no vacío, y **todo string no vacío es truthy** en JavaScript. Por eso un `*ngIf="visible"` muestra la alerta cuando debería esconderla, y **no aparece ningún error en la Consola**. Es un bug que no deja pistas.' },
        { nota: 'Regla práctica: un string fijo, los corchetes son opcionales. Un **number, boolean, array u objeto**, los corchetes son obligatorios. Una **variable** del padre, obligatorios.' }
    ],

    consigna: [
        { p: 'La alerta ya está lista y **no se toca**. El padre la usa tres veces, pero hay un bug que no da error:' },
        { numerada: [
            'La tercera alerta ("Ya no se puede cancelar") tiene que estar **escondida**, pero se ve. Encontrá por qué y arreglalo.',
            'Agregá una **cuarta alerta** de tipo `error` con el mensaje `Sin conexión`, usando el mismo componente.'
        ] },
        { p: 'Al terminar tienen que verse **3 alertas**: la confirmada, la de advertencia y la de sin conexión.' }
    ],

    semilla: {
        'app/app.module.ts': moduloDe([['AlertaComponent', './alerta/alerta.component']]),
        'app/alerta/alerta.component.ts': C(`
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-alerta',
  template: \`
    <div class="alerta" [ngClass]="tipo" *ngIf="visible">
      {{ mensaje }}
    </div>
  \`,
  styles: \`
    .alerta { padding: 10px; border-radius: 4px; margin: 6px 0; }
    .exito { background: #d4edda; color: #155724; }
    .error { background: #f8d7da; color: #721c24; }
    .advertencia { background: #fff3cd; color: #856404; }
  \`
})
export class AlertaComponent {
  @Input() tipo: 'exito' | 'error' | 'advertencia' = 'exito';
  @Input() mensaje: string = '';
  @Input() visible: boolean = true;
}
`),
        'app/app.component.ts': C(`
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: \`
    <h2>Avisos</h2>
    <app-alerta tipo="exito" mensaje="Turno confirmado"></app-alerta>
    <app-alerta tipo="advertencia" mensaje="El turno vence pronto"></app-alerta>
    <app-alerta tipo="error" mensaje="Ya no se puede cancelar" visible="false"></app-alerta>
  \`
})
export class AppComponent {}
`)
    },

    solucion: {
        'app/app.component.ts': C(`
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: \`
    <h2>Avisos</h2>
    <app-alerta tipo="exito" mensaje="Turno confirmado"></app-alerta>
    <app-alerta tipo="advertencia" mensaje="El turno vence pronto"></app-alerta>
    <app-alerta tipo="error" mensaje="Ya no se puede cancelar" [visible]="false"></app-alerta>
    <app-alerta tipo="error" mensaje="Sin conexión"></app-alerta>
  \`
})
export class AppComponent {}
`)
    },

    chequeos: [
        { fuente: { debeTener: [
            { re: '\\[\\s*visible\\s*\\]\\s*=\\s*.false', que: 'Falta [visible]="false" con corchetes en la tercera alerta.' },
            { re: 'mensaje\\s*=\\s*.Sin conexión', que: 'Falta la cuarta alerta, con mensaje="Sin conexión".' }
          ],
          noDebeTener: [
            { re: '\\bvisible\\s*=\\s*.false', que: 'Hay un visible="false" sin corchetes. Sin corchetes llega el TEXTO "false", que es truthy. Tiene que ser [visible]="false".' }
          ] } },
        { arranca: true },
        { sinErrores: true },
        { dom: { contar: { selector: 'app-alerta .alerta', es: 3 } },
          pista: 'Tienen que verse 3 alertas. Si ves 4, la tercera no se está escondiendo.' },
        { dom: { textos: { selector: '.alerta', igual: ['Turno confirmado', 'El turno vence pronto', 'Sin conexión'] } },
          pista: 'Se tienen que ver, en este orden: Turno confirmado, El turno vence pronto y Sin conexión.' },
        { dom: { contar: { selector: '.alerta.error', es: 1 } },
          pista: 'La cuarta alerta tiene que ser de tipo error.' }
    ]
},

{
    id: 'p14',
    titulo: '@Output: del hijo al padre',
    minutos: 16,
    abrir: 'app/hijo/hijo.component.ts',

    teoria: [
        { h: 'El problema' },
        { p: 'Con `@Input` el flujo va en un solo sentido: **padre hacia hijo**. El hijo recibe información, pero no tiene forma de avisarle al padre que algo pasó adentro suyo. Para eso está `@Output`, que invierte la dirección.' },
        { clave: 'Pensalo como el **timbre de una casa**. El padre, que está adentro, no sabe cuándo va a sonar. El hijo, que es el visitante, decide cuándo tocarlo. El padre sólo tiene que estar escuchando.' },

        { h: 'EventEmitter' },
        { p: 'El mecanismo se apoya en `EventEmitter`, un emisor de eventos propios. El hijo declara una propiedad de ese tipo, la marca con `@Output()`, y cuando quiere avisar algo llama a `.emit(valor)`. Lo que va entre `<` y `>` es el **tipo del dato** que se emite; si el evento no manda nada, es `EventEmitter<void>`.' },
        { numerada: [
            '**El hijo declara** el `@Output()` con un `EventEmitter` tipado.',
            '**El hijo emite** con `.emit(...)` cuando corresponde, por ejemplo al hacer clic.',
            '**El padre escucha** con event binding: `(evento)="metodo($event)"`.',
            '**El padre define** qué hacer en ese método.'
        ] },
        { codigo: C(`
import { Component, Output, EventEmitter } from '@angular/core';

@Component({ selector: 'app-hijo', template: \`<button (click)="avisarAlPadre()">Avisar</button>\` })
export class HijoComponent {
  @Output() alHacerClick = new EventEmitter<string>();

  avisarAlPadre(): void {
    this.alHacerClick.emit('Hola desde el hijo');
  }
}
`), archivo: 'hijo.component.ts' },
        { codigo: '<app-hijo (alHacerClick)="recibirMensaje($event)"></app-hijo>', archivo: 'app.component.html (el padre)' },
        { p: '`$event` contiene exactamente lo que el hijo pasó dentro de `emit()`. El método del padre lo recibe como parámetro.' },
        { nota: 'El error más común de todo el tema: escribir `[alHacerClick]` con **corchetes** en vez de `(alHacerClick)` con **paréntesis**. Los corchetes son para recibir datos; los paréntesis, para escuchar eventos.' },

        { h: 'Input frente a Output' },
        { tabla: {
            cabeceras: ['Aspecto', '`@Input()`', '`@Output()`'],
            filas: [
                ['Dirección', 'Padre hacia hijo', 'Hijo hacia padre'],
                ['Binding en el padre', '`[prop]="valor"`', '`(evento)="metodo($event)"`'],
                ['Qué declara el hijo', 'Una propiedad de entrada', 'Un `EventEmitter` tipado'],
                ['Quién dispara', 'El padre, al asignar', 'El hijo, al llamar `emit()`'],
                ['Propósito', 'Configurar el hijo', 'Notificar un evento o cambio']
            ]
        } }
    ],

    consigna: [
        { p: 'El hijo tiene un botón, pero no le avisa nada a nadie. El padre tiene un párrafo `#mensaje` esperando un aviso. Conectalos:' },
        { numerada: [
            'En **`hijo.component.ts`**: declarás un `@Output() alHacerClick` de tipo `EventEmitter<string>`, y en `avisarAlPadre()` emitís el texto **`Hola desde el hijo`**. Importá `Output` y `EventEmitter`.',
            'En **`app.component.ts`**: escuchá `(alHacerClick)` en `<app-hijo>` y llamá a `recibirMensaje($event)`.'
        ] },
        { p: 'Al hacer clic en el botón, el párrafo tiene que cambiar de "Todavía no llegó nada" a lo que emitió el hijo.' }
    ],

    semilla: {
        'app/app.module.ts': moduloDe([['HijoComponent', './hijo/hijo.component']]),
        'app/hijo/hijo.component.ts': C(`
import { Component } from '@angular/core';

@Component({
  selector: 'app-hijo',
  template: \`
    <button id="avisar" (click)="avisarAlPadre()">Avisar al padre</button>
  \`
})
export class HijoComponent {
  avisarAlPadre(): void {
    // Acá el hijo tiene que emitir el mensaje
  }
}
`),
        'app/app.component.ts': C(`
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: \`
    <h2>El padre</h2>
    <app-hijo></app-hijo>
    <p id="mensaje">{{ mensajeRecibido }}</p>
  \`
})
export class AppComponent {
  mensajeRecibido: string = 'Todavía no llegó nada';

  recibirMensaje(mensaje: string): void {
    this.mensajeRecibido = mensaje;
  }
}
`)
    },

    solucion: {
        'app/hijo/hijo.component.ts': C(`
import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-hijo',
  template: \`
    <button id="avisar" (click)="avisarAlPadre()">Avisar al padre</button>
  \`
})
export class HijoComponent {
  @Output() alHacerClick = new EventEmitter<string>();

  avisarAlPadre(): void {
    this.alHacerClick.emit('Hola desde el hijo');
  }
}
`),
        'app/app.component.ts': C(`
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: \`
    <h2>El padre</h2>
    <app-hijo (alHacerClick)="recibirMensaje($event)"></app-hijo>
    <p id="mensaje">{{ mensajeRecibido }}</p>
  \`
})
export class AppComponent {
  mensajeRecibido: string = 'Todavía no llegó nada';

  recibirMensaje(mensaje: string): void {
    this.mensajeRecibido = mensaje;
  }
}
`)
    },

    chequeos: [
        { fuente: { archivo: 'app/hijo/hijo.component.ts', debeTener: [
            { re: imp('Output'), que: "Falta importar Output:  import { Component, Output, EventEmitter } from '@angular/core';" },
            { re: imp('EventEmitter'), que: "Falta importar EventEmitter desde '@angular/core'." },
            { re: '@Output\\(\\)\\s*alHacerClick\\s*=\\s*new\\s+EventEmitter\\s*<\\s*string\\s*>', que: 'Falta declarar:  @Output() alHacerClick = new EventEmitter<string>();' },
            { re: 'alHacerClick\\.emit\\(', que: 'El hijo tiene que emitir con this.alHacerClick.emit(...) adentro de avisarAlPadre().' }
          ] } },
        { fuente: { debeTener: [
            { re: '\\(\\s*alHacerClick\\s*\\)\\s*=', que: 'El padre tiene que escuchar el evento con paréntesis: (alHacerClick)="recibirMensaje($event)".' }
          ],
          noDebeTener: [
            { re: '\\[\\s*alHacerClick\\s*\\]', que: 'Escribiste [alHacerClick] con corchetes. Para escuchar un evento van paréntesis: (alHacerClick).' }
          ] } },
        { arranca: true },
        { sinErrores: true },
        { dom: { textos: { selector: '#mensaje', igual: ['Todavía no llegó nada'] } },
          pista: 'Antes de hacer clic el mensaje tiene que ser el original. No cambies el valor inicial del padre.' },
        { accion: { clic: '#avisar' } },
        { dom: { textos: { selector: '#mensaje', igual: ['Hola desde el hijo'] } },
          pista: 'Al hacer clic, el padre tiene que recibir "Hola desde el hijo". Revisá que emitas ese texto y que el padre llame a recibirMensaje($event).' }
    ]
},

{
    id: 'p15',
    titulo: 'Input y Output juntos: lista de tareas',
    minutos: 18,
    abrir: 'app/app.component.ts',

    teoria: [
        { h: 'Lo mejor de los dos mundos' },
        { p: 'Casi todo componente real usa **los dos**: `@Input` para bajar los datos y `@Output` para subir lo que pasó. El caso clásico es una lista donde cada fila tiene un botón de eliminar.' },
        { codigo: C(`
export class TareaItemComponent {
  @Input() titulo: string = '';
  @Input() id: number = 0;
  @Output() eliminarTarea = new EventEmitter<number>();

  onEliminar(): void {
    this.eliminarTarea.emit(this.id);
  }
}
`), archivo: 'tarea-item.component.ts (el hijo)' },
        { codigo: C(`
<app-tarea-item
  *ngFor="let t of tareas"
  [id]="t.id"
  [titulo]="t.titulo"
  (eliminarTarea)="eliminarPorId($event)">
</app-tarea-item>
`), archivo: 'el padre: baja datos con [ ] y escucha con ( )' },
        { clave: 'El hijo **nunca toca el array**. Sólo informa su intención: "quiero eliminar la tarea 2". Es el padre quien decide y ejecuta. Si el hijo modificara el estado del padre, dejarían de ser independientes.' },
        { p: 'Fijate en los dos bindings sobre la misma etiqueta: los **corchetes** mandan datos hacia el hijo y los **paréntesis** escuchan lo que el hijo manda hacia arriba. Es la regla de siempre, aplicada a la vez.' },
        { nota: 'Nombrá el `@Output` con lo que **pasó** (`tareaEliminada`, `eliminarTarea`), no con lo que tiene que hacer el padre. El hijo no sabe qué va a hacer el padre con el aviso.' }
    ],

    consigna: [
        { p: 'El hijo `TareaItemComponent` ya está completo: recibe `id` y `titulo`, y emite `eliminarTarea` con el id. Lo que falta es el **padre**:' },
        { numerada: [
            'Dibujá un `<app-tarea-item>` por cada tarea con `*ngFor`, dentro del `<div id="lista">`.',
            'Pasale `[id]` y `[titulo]` de cada tarea, y escuchá `(eliminarTarea)` llamando a `eliminarPorId($event)`.',
            'Implementá `eliminarPorId(id)`: tiene que **sacar del array** la tarea con ese id.'
        ] },
        { p: 'Al eliminar la primera tarea tienen que quedar dos, y el contador de abajo tiene que actualizarse.' }
    ],

    semilla: {
        'app/app.module.ts': moduloDe([['TareaItemComponent', './tarea-item/tarea-item.component']]),
        'app/tarea-item/tarea-item.component.ts': C(`
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-tarea-item',
  template: \`
    <div class="tarea">
      <span class="titulo">{{ titulo }}</span>
      <button class="eliminar" (click)="onEliminar()">Eliminar</button>
    </div>
  \`,
  styles: \`
    .tarea { display: flex; gap: 12px; align-items: center; padding: 4px 0; }
  \`
})
export class TareaItemComponent {
  @Input() titulo: string = '';
  @Input() id: number = 0;
  @Output() eliminarTarea = new EventEmitter<number>();

  onEliminar(): void {
    this.eliminarTarea.emit(this.id);
  }
}
`),
        'app/app.component.ts': C(`
import { Component } from '@angular/core';

interface Tarea {
  id: number;
  titulo: string;
}

@Component({
  selector: 'app-root',
  template: \`
    <h2>Mis tareas</h2>
    <div id="lista">
      <!-- Un app-tarea-item por cada tarea -->
    </div>
    <p id="cantidad">Tareas: {{ tareas.length }}</p>
  \`
})
export class AppComponent {
  tareas: Tarea[] = [
    { id: 1, titulo: 'Preparar clase de Angular' },
    { id: 2, titulo: 'Corregir parciales' },
    { id: 3, titulo: 'Actualizar el repo' }
  ];

  eliminarPorId(id: number): void {
    // Acá el padre decide y ejecuta
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
}

@Component({
  selector: 'app-root',
  template: \`
    <h2>Mis tareas</h2>
    <div id="lista">
      <app-tarea-item
        *ngFor="let t of tareas"
        [id]="t.id"
        [titulo]="t.titulo"
        (eliminarTarea)="eliminarPorId($event)">
      </app-tarea-item>
    </div>
    <p id="cantidad">Tareas: {{ tareas.length }}</p>
  \`
})
export class AppComponent {
  tareas: Tarea[] = [
    { id: 1, titulo: 'Preparar clase de Angular' },
    { id: 2, titulo: 'Corregir parciales' },
    { id: 3, titulo: 'Actualizar el repo' }
  ];

  eliminarPorId(id: number): void {
    this.tareas = this.tareas.filter(t => t.id !== id);
  }
}
`)
    },

    chequeos: [
        { fuente: { debeTener: [
            { re: '\\*ngFor\\s*=\\s*.let\\s+\\w+\\s+of\\s+tareas', que: 'Falta el *ngFor="let t of tareas" en <app-tarea-item>.' },
            { re: '\\[\\s*id\\s*\\]\\s*=', que: 'Falta pasar el id con [id]="t.id".' },
            { re: '\\[\\s*titulo\\s*\\]\\s*=', que: 'Falta pasar el título con [titulo]="t.titulo".' },
            { re: '\\(\\s*eliminarTarea\\s*\\)\\s*=', que: 'Falta escuchar el evento del hijo, con paréntesis: (eliminarTarea)="eliminarPorId($event)".' }
          ] } },
        { arranca: true },
        { sinErrores: true },
        { dom: { contar: { selector: 'app-tarea-item', es: 3 } },
          pista: 'Tiene que haber una fila por cada tarea: 3 en total.' },
        { dom: { textos: { selector: '.titulo', igual: ['Preparar clase de Angular', 'Corregir parciales', 'Actualizar el repo'] } },
          pista: 'Cada fila tiene que mostrar el título de su tarea: [titulo]="t.titulo".' },
        { accion: { clic: 'app-tarea-item .eliminar' } },
        { dom: { contar: { selector: 'app-tarea-item', es: 2 } },
          pista: 'Al eliminar la primera tienen que quedar 2. Revisá que eliminarPorId saque del array la tarea con ese id.' },
        { dom: { textos: { selector: '.titulo', igual: ['Corregir parciales', 'Actualizar el repo'] } },
          pista: 'Se tiene que ir la PRIMERA tarea (id 1), no otra. Filtrá con t.id !== id.' },
        { dom: { textos: { selector: '#cantidad', igual: ['Tareas: 2'] } } }
    ]
},

{
    id: 'p16',
    titulo: 'Dos eventos desde el mismo hijo',
    minutos: 18,
    abrir: 'app/app.component.ts',

    teoria: [
        { h: 'Un evento por cada cosa que puede pasar' },
        { p: 'Un hijo puede tener **todos los `@Output` que necesite**, uno por cada cosa distinta que puede querer avisar. Una tarjeta de turno, por ejemplo, tiene dos acciones: confirmar y cancelar. No conviene un solo evento genérico con un texto que diga cuál fue: cada acción es su propio evento.' },
        { codigo: C(`
export class TurnoCardComponent {
  @Input() turno!: Turno;
  @Output() confirmado = new EventEmitter<number>();
  @Output() cancelado = new EventEmitter<number>();

  onConfirmar(): void { this.confirmado.emit(this.turno.id); }
  onCancelar(): void { this.cancelado.emit(this.turno.id); }
}
`), archivo: 'turno-card.component.ts' },
        { codigo: C(`
<app-turno-card
  *ngFor="let t of turnos"
  [turno]="t"
  (confirmado)="confirmarTurno($event)"
  (cancelado)="cancelarTurno($event)">
</app-turno-card>
`), archivo: 'el padre escucha cada evento por separado' },
        { p: 'El hijo emite el **id** y no el turno entero, para no darle al padre más de lo que necesita. El padre lo busca en su array y cambia el estado.' },
        { clave: 'Fijate quién cambia el estado: **el padre**. La tarjeta no modifica `turno.estado` por su cuenta. El hijo informa "el usuario quiere confirmar el turno 3"; el padre decide qué significa eso.' },
        { nota: 'Buenas prácticas del `@Output`: tiparlo siempre (`EventEmitter<number>`, nunca `EventEmitter<any>`), nombrarlo por lo que pasó, y usarlo sólo dentro de un componente o una directiva.' }
    ],

    consigna: [
        { p: 'La tarjeta `TurnoCardComponent` ya está lista: muestra un turno y tiene dos botones que emiten `confirmado` y `cancelado` con el id. Falta el padre:' },
        { numerada: [
            'En el template, escuchá `(confirmado)` y `(cancelado)` llamando a `confirmarTurno($event)` y `cancelarTurno($event)`.',
            'Implementá `confirmarTurno(id)`: buscá el turno con ese id y cambiale el estado a `\'confirmado\'`.',
            'Implementá `cancelarTurno(id)`: lo mismo, pero con `\'cancelado\'`.'
        ] },
        { nota: 'Para buscar un elemento de un array por una condición se usa `find`: `this.turnos.find(x => x.id === id)`. Ojo: puede devolver `undefined`, así que hay que preguntar si existe antes de modificarlo.' }
    ],

    semilla: {
        'app/app.module.ts': moduloDe([['TurnoCardComponent', './turno-card/turno-card.component']]),
        'app/models/turno.model.ts': C(`
export interface Turno {
  id: number;
  paciente: string;
  hora: string;
  estado: 'pendiente' | 'confirmado' | 'cancelado';
}
`),
        'app/turno-card/turno-card.component.ts': C(`
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Turno } from '../models/turno.model';

@Component({
  selector: 'app-turno-card',
  template: \`
    <div class="turno" [ngClass]="turno.estado">
      <p class="dato">{{ turno.hora }} - {{ turno.paciente }}</p>
      <div *ngIf="turno.estado !== 'cancelado'">
        <button class="btn-confirmar" (click)="onConfirmar()">Confirmar</button>
        <button class="btn-cancelar" (click)="onCancelar()">Cancelar</button>
      </div>
    </div>
  \`,
  styles: \`
    .turno { border: 1px solid #c8d0da; border-radius: 6px; padding: 2px 14px; margin: 8px 0; max-width: 300px; }
    .pendiente { background: #fff3cd; }
    .confirmado { background: #d4edda; }
    .cancelado { background: #f8d7da; text-decoration: line-through; }
  \`
})
export class TurnoCardComponent {
  @Input() turno!: Turno;
  @Output() confirmado = new EventEmitter<number>();
  @Output() cancelado = new EventEmitter<number>();

  onConfirmar(): void { this.confirmado.emit(this.turno.id); }
  onCancelar(): void { this.cancelado.emit(this.turno.id); }
}
`),
        'app/app.component.ts': C(`
import { Component } from '@angular/core';
import { Turno } from './models/turno.model';

@Component({
  selector: 'app-root',
  template: \`
    <h2>Agenda del día</h2>
    <app-turno-card *ngFor="let t of turnos" [turno]="t"></app-turno-card>
  \`
})
export class AppComponent {
  turnos: Turno[] = [
    { id: 1, paciente: 'Ana Gómez', hora: '09:00', estado: 'pendiente' },
    { id: 2, paciente: 'Luis Pérez', hora: '10:30', estado: 'confirmado' },
    { id: 3, paciente: 'Sofía Ruiz', hora: '11:00', estado: 'pendiente' }
  ];

  confirmarTurno(id: number): void {
    // Buscar el turno y cambiarle el estado a 'confirmado'
  }

  cancelarTurno(id: number): void {
    // Buscar el turno y cambiarle el estado a 'cancelado'
  }
}
`)
    },

    solucion: {
        'app/app.component.ts': C(`
import { Component } from '@angular/core';
import { Turno } from './models/turno.model';

@Component({
  selector: 'app-root',
  template: \`
    <h2>Agenda del día</h2>
    <app-turno-card
      *ngFor="let t of turnos"
      [turno]="t"
      (confirmado)="confirmarTurno($event)"
      (cancelado)="cancelarTurno($event)">
    </app-turno-card>
  \`
})
export class AppComponent {
  turnos: Turno[] = [
    { id: 1, paciente: 'Ana Gómez', hora: '09:00', estado: 'pendiente' },
    { id: 2, paciente: 'Luis Pérez', hora: '10:30', estado: 'confirmado' },
    { id: 3, paciente: 'Sofía Ruiz', hora: '11:00', estado: 'pendiente' }
  ];

  confirmarTurno(id: number): void {
    const t = this.turnos.find(x => x.id === id);
    if (t) { t.estado = 'confirmado'; }
  }

  cancelarTurno(id: number): void {
    const t = this.turnos.find(x => x.id === id);
    if (t) { t.estado = 'cancelado'; }
  }
}
`)
    },

    chequeos: [
        { fuente: { debeTener: [
            { re: '\\(\\s*confirmado\\s*\\)\\s*=', que: 'Falta escuchar el evento del hijo: (confirmado)="confirmarTurno($event)".' },
            { re: '\\(\\s*cancelado\\s*\\)\\s*=', que: 'Falta escuchar el evento del hijo: (cancelado)="cancelarTurno($event)".' }
          ] } },
        { arranca: true },
        { sinErrores: true },
        { dom: { contar: { selector: 'app-turno-card', es: 3 } } },
        { dom: { contar: { selector: '.turno.confirmado', es: 1 } },
          pista: 'Al empezar hay un solo turno confirmado (Luis).' },
        { accion: { clic: '.btn-confirmar' } },
        { dom: { contar: { selector: '.turno.confirmado', es: 2 } },
          pista: 'Al confirmar el primer turno, tienen que quedar 2 confirmados. Revisá confirmarTurno(): buscá el turno con find y cambiale el estado a \'confirmado\'.' },
        { accion: { clic: '.btn-cancelar' } },
        { dom: { contar: { selector: '.turno.cancelado', es: 1 } },
          pista: 'Al cancelar el primer turno tiene que aparecer 1 cancelado. Revisá cancelarTurno().' },
        { dom: { contar: { selector: '.turno.confirmado', es: 1 } },
          pista: 'Después de cancelar el primero quedan confirmados sólo Luis. cancelarTurno() tiene que cambiar el estado del turno correcto.' },
        { dom: { contar: { selector: '.btn-cancelar', es: 2 } },
          pista: 'Un turno cancelado no muestra más sus botones: quedan los de los otros dos.' }
    ]
},

{
    id: 'p17',
    titulo: 'Emitir un objeto tipado',
    minutos: 18,
    abrir: 'app/formulario-paciente/formulario-paciente.component.ts',

    teoria: [
        { h: 'Un evento puede llevar un objeto completo' },
        { p: 'Hasta ahora los eventos llevaban un número o un texto. Pero `emit()` acepta **cualquier valor**, incluido un objeto con varios datos. Es lo que se usa cuando un formulario tiene que entregarle al padre todo lo que el usuario cargó.' },
        { codigo: C(`
export interface FiltroBusqueda {
  texto: string;
  soloActivos: boolean;
}

export class BuscadorComponent {
  texto: string = '';
  soloActivos: boolean = false;
  @Output() buscar = new EventEmitter<FiltroBusqueda>();

  onBuscar(): void {
    this.buscar.emit({ texto: this.texto, soloActivos: this.soloActivos });
  }
}
`), archivo: 'buscador.component.ts' },
        { codigo: C(`
<app-buscador (buscar)="aplicarFiltro($event)"></app-buscador>
`), archivo: 'el padre' },
        { codigo: C(`
aplicarFiltro(filtro: FiltroBusqueda): void {
  console.log('Buscar:', filtro.texto, 'solo activos:', filtro.soloActivos);
}
`), archivo: 'app.component.ts' },
        { clave: 'Tipá siempre lo que emitís con una **interface**: `EventEmitter<Paciente>`. Así el editor te avisa si te olvidás de un campo, y el padre sabe exactamente qué forma tiene `$event`. Evitá `EventEmitter<any>`.' },
        { p: 'Un formulario usa `[(ngModel)]` para leer lo que se escribe, como viste en el paso 6. Para eso el módulo tiene que importar **`FormsModule`**; en este proyecto ya viene importado.' }
    ],

    consigna: [
        { p: 'El formulario de pacientes tiene tres campos con `ngModel` y un botón Guardar, pero no entrega nada. El padre tiene una lista vacía de pacientes.' },
        { numerada: [
            'En **`formulario-paciente.component.ts`**: declará `@Output() guardado = new EventEmitter<Paciente>()`, y en `onGuardar()` emití **un objeto `Paciente` completo** con nombre, dni y teléfono.',
            'En **`app.component.ts`**: escuchá `(guardado)` y llamá a `agregarPaciente($event)`.',
            'Implementá `agregarPaciente(paciente)`: agregalo al array `pacientes` con `push`.'
        ] },
        { p: 'La lista de abajo ya recorre `pacientes`: tiene que ir mostrando cada paciente que se guarda.' }
    ],

    semilla: {
        'app/app.module.ts': moduloDe([['FormularioPacienteComponent', './formulario-paciente/formulario-paciente.component']], true),
        'app/models/paciente.model.ts': C(`
export interface Paciente {
  nombre: string;
  dni: string;
  telefono: string;
}
`),
        'app/formulario-paciente/formulario-paciente.component.ts': C(`
import { Component } from '@angular/core';
import { Paciente } from '../models/paciente.model';

@Component({
  selector: 'app-formulario-paciente',
  template: \`
    <div class="formulario">
      <input id="nombre" [(ngModel)]="nombre" placeholder="Nombre">
      <input id="dni" [(ngModel)]="dni" placeholder="DNI">
      <input id="telefono" [(ngModel)]="telefono" placeholder="Teléfono">
      <button id="guardar" (click)="onGuardar()">Guardar</button>
    </div>
  \`,
  styles: \`
    .formulario { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0; }
  \`
})
export class FormularioPacienteComponent {
  nombre: string = '';
  dni: string = '';
  telefono: string = '';

  onGuardar(): void {
    // Acá hay que emitir UN objeto Paciente completo
  }
}
`),
        'app/app.component.ts': C(`
import { Component } from '@angular/core';
import { Paciente } from './models/paciente.model';

@Component({
  selector: 'app-root',
  template: \`
    <h2>Pacientes</h2>
    <app-formulario-paciente></app-formulario-paciente>
    <ul id="lista">
      <li *ngFor="let p of pacientes">{{ p.nombre }} - DNI {{ p.dni }} - {{ p.telefono }}</li>
    </ul>
  \`
})
export class AppComponent {
  pacientes: Paciente[] = [];

  agregarPaciente(paciente: Paciente): void {
    // Acá el padre agrega el paciente al array
  }
}
`)
    },

    solucion: {
        'app/formulario-paciente/formulario-paciente.component.ts': C(`
import { Component, Output, EventEmitter } from '@angular/core';
import { Paciente } from '../models/paciente.model';

@Component({
  selector: 'app-formulario-paciente',
  template: \`
    <div class="formulario">
      <input id="nombre" [(ngModel)]="nombre" placeholder="Nombre">
      <input id="dni" [(ngModel)]="dni" placeholder="DNI">
      <input id="telefono" [(ngModel)]="telefono" placeholder="Teléfono">
      <button id="guardar" (click)="onGuardar()">Guardar</button>
    </div>
  \`,
  styles: \`
    .formulario { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0; }
  \`
})
export class FormularioPacienteComponent {
  nombre: string = '';
  dni: string = '';
  telefono: string = '';

  @Output() guardado = new EventEmitter<Paciente>();

  onGuardar(): void {
    this.guardado.emit({ nombre: this.nombre, dni: this.dni, telefono: this.telefono });
  }
}
`),
        'app/app.component.ts': C(`
import { Component } from '@angular/core';
import { Paciente } from './models/paciente.model';

@Component({
  selector: 'app-root',
  template: \`
    <h2>Pacientes</h2>
    <app-formulario-paciente (guardado)="agregarPaciente($event)"></app-formulario-paciente>
    <ul id="lista">
      <li *ngFor="let p of pacientes">{{ p.nombre }} - DNI {{ p.dni }} - {{ p.telefono }}</li>
    </ul>
  \`
})
export class AppComponent {
  pacientes: Paciente[] = [];

  agregarPaciente(paciente: Paciente): void {
    this.pacientes.push(paciente);
  }
}
`)
    },

    chequeos: [
        { fuente: { archivo: 'app/formulario-paciente/formulario-paciente.component.ts', debeTener: [
            { re: imp('Output'), que: "Falta importar Output desde '@angular/core'." },
            { re: imp('EventEmitter'), que: "Falta importar EventEmitter desde '@angular/core'." },
            { re: '@Output\\(\\)\\s*guardado\\s*=\\s*new\\s+EventEmitter\\s*<\\s*Paciente\\s*>', que: 'Falta declarar:  @Output() guardado = new EventEmitter<Paciente>();' },
            { re: 'guardado\\.emit\\(', que: 'Falta emitir el objeto con this.guardado.emit({ ... }) adentro de onGuardar().' }
          ] } },
        { fuente: { debeTener: [
            { re: '\\(\\s*guardado\\s*\\)\\s*=', que: 'El padre tiene que escuchar el evento con paréntesis: (guardado)="agregarPaciente($event)".' }
          ] } },
        { arranca: true },
        { sinErrores: true },
        { dom: { contar: { selector: '#lista li', es: 0 } },
          pista: 'Al empezar la lista tiene que estar vacía.' },
        { accion: { escribir: ['#nombre', 'Lucía Fernández'] } },
        { accion: { escribir: ['#dni', '30123456'] } },
        { accion: { escribir: ['#telefono', '3462-555123'] } },
        { accion: { clic: '#guardar' } },
        { dom: { contar: { selector: '#lista li', es: 1 } },
          pista: 'Al guardar tiene que aparecer un paciente. Revisá que el hijo emita el objeto y que agregarPaciente lo agregue con push.' },
        { dom: { textos: { selector: '#lista li', igual: ['Lucía Fernández - DNI 30123456 - 3462-555123'] } },
          pista: 'El objeto emitido tiene que llevar los tres datos: { nombre: this.nombre, dni: this.dni, telefono: this.telefono }.' }
    ]
},

{
    id: 'p18',
    titulo: 'Two-way binding propio: [(cantidad)]',
    minutos: 16,
    abrir: 'app/selector-cantidad/selector-cantidad.component.ts',

    teoria: [
        { h: 'Input y Output en una sola sintaxis' },
        { p: 'En el paso 6 usaste `[(ngModel)]` en un campo de formulario. Ese two-way binding no es magia especial de `ngModel`: **cualquier componente tuyo puede tenerlo**. La sintaxis `[( )]` (la *banana in a box*) junta un `@Input` con un `@Output`.' },
        { clave: 'La regla: si tenés un `@Input() valor`, el `@Output` correspondiente **tiene que llamarse `valorChange`**: el mismo nombre más el sufijo `Change`. Si respetás ese nombre, el padre puede escribir `[(valor)]`.' },
        { codigo: C(`
export class ContadorComponent {
  @Input() valor: number = 0;
  @Output() valorChange = new EventEmitter<number>();

  incrementar(): void {
    this.valor++;
    this.valorChange.emit(this.valor);
  }
}
`), archivo: 'contador.component.ts' },
        { codigo: '<app-contador [(valor)]="totalGlobal"></app-contador>', archivo: 'el padre' },
        { p: 'Por dentro Angular sigue usando el mismo mecanismo de siempre. La línea del padre equivale exactamente a escribir las dos cosas por separado:' },
        { codigo: '<app-contador [valor]="totalGlobal" (valorChange)="totalGlobal = $event"></app-contador>', archivo: 'lo mismo, desarmado' },
        { nota: 'Es **azúcar sintáctica**. Si el hijo no emite el `Change`, el padre nunca se entera de los cambios, aunque use los corchetes y paréntesis: es exactamente el bug que vas a ver en este paso.' }
    ],

    consigna: [
        { p: 'El selector de cantidad de un carrito tiene botones + y −. El hijo cambia su propio número, pero el total del padre **no se entera**: el padre sólo le pasa el valor, no escucha nada.' },
        { numerada: [
            'En **`selector-cantidad.component.ts`**: declará `@Output() cantidadChange = new EventEmitter<number>()` y emití la cantidad nueva cada vez que cambia, en `sumar()` y en `restar()`.',
            'En **`app.component.ts`**: pasá de `[cantidad]="totalCarrito"` a `[(cantidad)]="totalCarrito"`.'
        ] },
        { p: 'Al apretar + el número del hijo **y** el total del padre tienen que subir juntos.' }
    ],

    semilla: {
        'app/app.module.ts': moduloDe([['SelectorCantidadComponent', './selector-cantidad/selector-cantidad.component']]),
        'app/selector-cantidad/selector-cantidad.component.ts': C(`
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-selector-cantidad',
  template: \`
    <button id="menos" (click)="restar()">-</button>
    <span id="cantidad">{{ cantidad }}</span>
    <button id="mas" (click)="sumar()">+</button>
  \`
})
export class SelectorCantidadComponent {
  @Input() cantidad: number = 1;

  sumar(): void {
    this.cantidad++;
  }

  restar(): void {
    if (this.cantidad > 1) {
      this.cantidad--;
    }
  }
}
`),
        'app/app.component.ts': C(`
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: \`
    <h2>Carrito</h2>
    <app-selector-cantidad [cantidad]="totalCarrito"></app-selector-cantidad>
    <p id="total">Unidades en el carrito: {{ totalCarrito }}</p>
  \`
})
export class AppComponent {
  totalCarrito: number = 1;
}
`)
    },

    solucion: {
        'app/selector-cantidad/selector-cantidad.component.ts': C(`
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-selector-cantidad',
  template: \`
    <button id="menos" (click)="restar()">-</button>
    <span id="cantidad">{{ cantidad }}</span>
    <button id="mas" (click)="sumar()">+</button>
  \`
})
export class SelectorCantidadComponent {
  @Input() cantidad: number = 1;
  @Output() cantidadChange = new EventEmitter<number>();

  sumar(): void {
    this.cantidad++;
    this.cantidadChange.emit(this.cantidad);
  }

  restar(): void {
    if (this.cantidad > 1) {
      this.cantidad--;
      this.cantidadChange.emit(this.cantidad);
    }
  }
}
`),
        'app/app.component.ts': C(`
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: \`
    <h2>Carrito</h2>
    <app-selector-cantidad [(cantidad)]="totalCarrito"></app-selector-cantidad>
    <p id="total">Unidades en el carrito: {{ totalCarrito }}</p>
  \`
})
export class AppComponent {
  totalCarrito: number = 1;
}
`)
    },

    chequeos: [
        { fuente: { archivo: 'app/selector-cantidad/selector-cantidad.component.ts', debeTener: [
            { re: imp('Output'), que: "Falta importar Output desde '@angular/core'." },
            { re: imp('EventEmitter'), que: "Falta importar EventEmitter desde '@angular/core'." },
            { re: '@Output\\(\\)\\s*cantidadChange', que: 'El @Output tiene que llamarse cantidadChange: el nombre del @Input más el sufijo Change.' },
            { re: 'cantidadChange\\.emit\\(', que: 'Falta emitir el valor nuevo con this.cantidadChange.emit(this.cantidad).' }
          ] } },
        { fuente: { debeTener: [
            { re: '\\[\\(\\s*cantidad\\s*\\)\\]\\s*=\\s*.totalCarrito', que: 'El padre tiene que usar la banana: [(cantidad)]="totalCarrito". Los corchetes van por fuera de los paréntesis.' }
          ] } },
        { arranca: true },
        { sinErrores: true },
        { dom: { textos: { selector: '#total', igual: ['Unidades en el carrito: 1'] } } },
        { accion: { clic: '#mas' } },
        { accion: { clic: '#mas' } },
        { dom: { textos: { selector: '#cantidad', igual: ['3'] } },
          pista: 'Después de dos clics en + el selector tiene que mostrar 3.' },
        { dom: { textos: { selector: '#total', igual: ['Unidades en el carrito: 3'] } },
          pista: 'El total del padre no se actualizó. El hijo tiene que emitir cantidadChange en sumar(), y el padre usar [(cantidad)].' },
        { accion: { clic: '#menos' } },
        { dom: { textos: { selector: '#total', igual: ['Unidades en el carrito: 2'] } },
          pista: 'Al restar también hay que emitir cantidadChange, en restar().' }
    ]
},

{
    id: 'p19',
    titulo: 'ng-content: proyectar contenido',
    minutos: 16,
    abrir: 'app/tarjeta/tarjeta.component.ts',

    teoria: [
        { h: 'Otro problema: pasar HTML, no datos' },
        { p: '`@Input` pasa **datos**. `ng-content` resuelve algo distinto: cómo el padre le pasa **HTML o componentes enteros** al hijo, para que este los muestre en un lugar preciso de su template.' },
        { clave: 'El hijo define la **caja** (estructura, estilos, comportamiento) y el padre define el **contenido**.' },
        { codigo: C(`
<div class="tarjeta">
  <ng-content></ng-content>
</div>
`), archivo: 'tarjeta.component.html (el hijo)' },
        { codigo: C(`
<app-tarjeta>
  <h3>Título dinámico</h3>
  <p>Este contenido lo define el padre, no el hijo.</p>
</app-tarjeta>
`), archivo: 'app.component.html (el padre)' },
        { p: 'Todo lo que el padre escribe **entre las etiquetas de apertura y cierre** se inyecta exactamente donde el hijo puso `<ng-content>`.' },
        { nota: 'Si el hijo **no** tiene `<ng-content>`, el contenido que el padre pone entre sus etiquetas **no se muestra, y no hay ningún error**. Angular simplemente no sabe dónde ponerlo. Es un bug silencioso: la pantalla queda incompleta y la Consola limpia.' },
        { h: 'Por qué es tan potente' },
        { p: 'En lugar de mandar sólo texto, el padre puede mandar **componentes enteros**. Un `<app-modal>` puede contener adentro un `<app-formulario-paciente>` sin que el modal sepa nada de formularios. Esa independencia es la que permite reutilizarlo en toda la aplicación.' },
        { h: 'Cuándo Input y cuándo ng-content' },
        { tabla: {
            cabeceras: ['Lo que el padre quiere pasar', 'Herramienta'],
            filas: [
                ['Un dato: texto, número, booleano, objeto', '`@Input()`'],
                ['HTML o componentes arbitrarios', '`<ng-content>`']
            ]
        } }
    ],

    consigna: [
        { p: 'La `TarjetaComponent` muestra un título que recibe por `@Input`, pero el padre la usa tres veces con **contenido distinto** (un párrafo, una lista y una tabla) y ese contenido no aparece: las tres tarjetas sólo muestran el título. Mirá la Consola: no hay ningún error.' },
        { numerada: [
            'En **`tarjeta.component.ts`**: agregá un `<ng-content></ng-content>` adentro del `<div class="cuerpo">`, donde tiene que aparecer el contenido del padre.'
        ] },
        { nota: 'No toques el padre. Un componente reutilizable se arregla del lado del componente, no de cada lugar donde se usa.' }
    ],

    semilla: {
        'app/app.module.ts': moduloDe([['TarjetaComponent', './tarjeta/tarjeta.component']]),
        'app/tarjeta/tarjeta.component.ts': C(`
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-tarjeta',
  template: \`
    <div class="tarjeta">
      <h3 class="titulo">{{ titulo }}</h3>
      <div class="cuerpo">
        <!-- Acá tiene que aparecer el contenido que mande el padre -->
      </div>
    </div>
  \`,
  styles: \`
    .tarjeta { border: 1px solid #c8d0da; border-radius: 6px; padding: 2px 14px 10px; margin: 8px 0; max-width: 320px; }
    .titulo { margin: 8px 0 4px; }
  \`
})
export class TarjetaComponent {
  @Input() titulo: string = '';
}
`),
        'app/app.component.ts': C(`
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: \`
    <app-tarjeta titulo="Aviso">
      <p id="aviso">Hoy no hay turnos por la tarde.</p>
    </app-tarjeta>

    <app-tarjeta titulo="Pendientes">
      <ul id="pendientes">
        <li>Corregir parciales</li>
        <li>Actualizar el repo</li>
      </ul>
    </app-tarjeta>

    <app-tarjeta titulo="Horarios">
      <table id="horarios">
        <tr><td>Lunes</td><td>09:00</td></tr>
        <tr><td>Martes</td><td>10:30</td></tr>
      </table>
    </app-tarjeta>
  \`
})
export class AppComponent {}
`)
    },

    solucion: {
        'app/tarjeta/tarjeta.component.ts': C(`
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-tarjeta',
  template: \`
    <div class="tarjeta">
      <h3 class="titulo">{{ titulo }}</h3>
      <div class="cuerpo">
        <ng-content></ng-content>
      </div>
    </div>
  \`,
  styles: \`
    .tarjeta { border: 1px solid #c8d0da; border-radius: 6px; padding: 2px 14px 10px; margin: 8px 0; max-width: 320px; }
    .titulo { margin: 8px 0 4px; }
  \`
})
export class TarjetaComponent {
  @Input() titulo: string = '';
}
`)
    },

    chequeos: [
        { fuente: { archivo: 'app/tarjeta/tarjeta.component.ts', debeTener: [
            { re: '<ng-content', que: 'Falta el <ng-content></ng-content> en el template de la tarjeta.' }
          ] } },
        { arranca: true },
        { sinErrores: true },
        { dom: { contar: { selector: 'app-tarjeta .tarjeta', es: 3 } } },
        { dom: { textos: { selector: '.titulo', igual: ['Aviso', 'Pendientes', 'Horarios'] } } },
        { dom: { textos: { selector: '#aviso', igual: ['Hoy no hay turnos por la tarde.'] } },
          pista: 'El párrafo del padre no aparece. Falta el <ng-content> dentro de la tarjeta.' },
        { dom: { contar: { selector: '#pendientes li', es: 2 } },
          pista: 'La lista del padre no aparece. El mismo <ng-content> tiene que servir para cualquier contenido.' },
        { dom: { contar: { selector: '#horarios tr', es: 2 } },
          pista: 'La tabla del padre no aparece.' },
        { dom: { existe: { selector: '.cuerpo #aviso' } },
          pista: 'El contenido tiene que aparecer adentro del div con clase cuerpo, no afuera.' }
    ]
},

{
    id: 'p20',
    titulo: 'ng-content con select: varias ranuras',
    minutos: 16,
    abrir: 'app/tarjeta/tarjeta.component.ts',

    teoria: [
        { h: 'Más de un lugar donde proyectar' },
        { p: 'Con un solo `<ng-content>` todo el contenido cae en el mismo lugar. Pero una tarjeta tiene encabezado, cuerpo y pie. Se pueden definir **varias ranuras** con el atributo `select`, que filtra por **selector CSS**.' },
        { codigo: C(`
<div class="tarjeta">
  <header>
    <ng-content select="[titulo]"></ng-content>
  </header>
  <section>
    <ng-content></ng-content>
  </section>
  <footer>
    <ng-content select="[acciones]"></ng-content>
  </footer>
</div>
`), archivo: 'tarjeta.component.html (el hijo)' },
        { codigo: C(`
<app-tarjeta>
  <h3 titulo>Encabezado</h3>
  <p>Cuerpo de la tarjeta</p>
  <button acciones>Guardar</button>
</app-tarjeta>
`), archivo: 'app.component.html (el padre)' },
        { p: 'El padre **marca** cada pieza con un atributo (`titulo`, `acciones`) y el hijo lo usa para saber dónde ubicarla. `select="[titulo]"` significa "el elemento que tenga el atributo `titulo`".' },
        { clave: 'El `<ng-content>` **sin `select`** es la ranura por defecto: recibe todo lo que no coincida con ninguna otra.' },
        { nota: 'Igual que antes: si el padre marca una pieza con un atributo y el hijo no tiene la ranura para ese atributo, la pieza cae en la ranura por defecto. No hay error, pero queda en el lugar equivocado.' }
    ],

    consigna: [
        { p: 'El padre ya usa la tarjeta con tres piezas marcadas: un `<h3 titulo>`, un párrafo y un `<button acciones>`. Pero la tarjeta sólo tiene una ranura, así que **las tres piezas se apilan en el cuerpo**.' },
        { numerada: [
            'En **`tarjeta.component.ts`**: agregá `<ng-content select="[titulo]">` adentro del `<header>`.',
            'Agregá `<ng-content select="[acciones]">` adentro del `<footer>`.',
            'Dejá el `<ng-content>` sin `select` en el `<section>`, para el cuerpo.'
        ] },
        { p: 'Al terminar, el título tiene que estar en el encabezado, el párrafo en el cuerpo y el botón en el pie.' }
    ],

    semilla: {
        'app/app.module.ts': moduloDe([['TarjetaComponent', './tarjeta/tarjeta.component']]),
        'app/tarjeta/tarjeta.component.ts': C(`
import { Component } from '@angular/core';

@Component({
  selector: 'app-tarjeta',
  template: \`
    <div class="tarjeta">
      <header class="encabezado">
      </header>
      <section class="cuerpo">
        <ng-content></ng-content>
      </section>
      <footer class="pie">
      </footer>
    </div>
  \`,
  styles: \`
    .tarjeta { border: 1px solid #c8d0da; border-radius: 6px; max-width: 320px; }
    .encabezado { background: #eef3f8; padding: 4px 14px; }
    .cuerpo { padding: 4px 14px; }
    .pie { border-top: 1px solid #dde3ea; padding: 6px 14px; }
  \`
})
export class TarjetaComponent {}
`),
        'app/app.component.ts': C(`
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: \`
    <app-tarjeta>
      <h3 titulo>Encabezado</h3>
      <p id="texto">Cuerpo de la tarjeta</p>
      <button acciones id="guardar">Guardar</button>
    </app-tarjeta>
  \`
})
export class AppComponent {}
`)
    },

    solucion: {
        'app/tarjeta/tarjeta.component.ts': C(`
import { Component } from '@angular/core';

@Component({
  selector: 'app-tarjeta',
  template: \`
    <div class="tarjeta">
      <header class="encabezado">
        <ng-content select="[titulo]"></ng-content>
      </header>
      <section class="cuerpo">
        <ng-content></ng-content>
      </section>
      <footer class="pie">
        <ng-content select="[acciones]"></ng-content>
      </footer>
    </div>
  \`,
  styles: \`
    .tarjeta { border: 1px solid #c8d0da; border-radius: 6px; max-width: 320px; }
    .encabezado { background: #eef3f8; padding: 4px 14px; }
    .cuerpo { padding: 4px 14px; }
    .pie { border-top: 1px solid #dde3ea; padding: 6px 14px; }
  \`
})
export class TarjetaComponent {}
`)
    },

    chequeos: [
        { fuente: { archivo: 'app/tarjeta/tarjeta.component.ts', debeTener: [
            { re: '<ng-content\\s+select\\s*=\\s*.\\[titulo\\]', que: 'Falta la ranura del encabezado:  <ng-content select="[titulo]"></ng-content>' },
            { re: '<ng-content\\s+select\\s*=\\s*.\\[acciones\\]', que: 'Falta la ranura del pie:  <ng-content select="[acciones]"></ng-content>' }
          ] } },
        { arranca: true },
        { sinErrores: true },
        { dom: { existe: { selector: '.encabezado h3' } },
          pista: 'El título tiene que estar adentro del <header>: <ng-content select="[titulo]"> dentro del encabezado.' },
        { dom: { existe: { selector: '.cuerpo #texto' } },
          pista: 'El párrafo tiene que quedar en el cuerpo, con el <ng-content> sin select.' },
        { dom: { existe: { selector: '.pie #guardar' } },
          pista: 'El botón tiene que estar adentro del <footer>: <ng-content select="[acciones]"> dentro del pie.' },
        { dom: { noExiste: { selector: '.cuerpo h3' } },
          pista: 'El título no tiene que quedar en el cuerpo: tiene que ir a su propia ranura.' },
        { dom: { noExiste: { selector: '.cuerpo button' } },
          pista: 'El botón no tiene que quedar en el cuerpo: tiene que ir a su propia ranura.' }
    ]
},

{
    id: 'p21',
    titulo: '@ViewChild: llamar al hijo desde el padre',
    minutos: 18,
    abrir: 'app/app.component.ts',

    teoria: [
        { h: 'Comunicación declarativa e imperativa' },
        { p: 'Con `@Input`, `@Output` y `ng-content` la comunicación es **declarativa**: se define en el template. `@ViewChild` es distinto: le da al padre una **referencia directa** al hijo desde el código TypeScript, para llamar sus métodos o leer sus propiedades.' },
        { codigo: C(`
import { Component, ViewChild } from '@angular/core';
import { ContadorComponent } from './contador/contador.component';

@Component({
  selector: 'app-padre',
  template: \`
    <app-contador></app-contador>
    <button (click)="resetearContador()">Resetear</button>
  \`
})
export class PadreComponent {
  @ViewChild(ContadorComponent) contador!: ContadorComponent;

  resetearContador(): void {
    this.contador.reset();   // llama al método del hijo directamente
  }
}
`), archivo: 'padre.component.ts' },
        { h: 'Cuándo está disponible la referencia' },
        { p: 'La referencia recién existe **después de `ngAfterViewInit`**, no en `ngOnInit`. Si en `ngOnInit` intentás usar `this.contador`, recibís `undefined`. Si necesitás usarla apenas se renderiza la vista, hay que implementar ese hook del ciclo de vida:' },
        { codigo: C(`
import { Component, ViewChild, AfterViewInit } from '@angular/core';

export class PadreComponent implements AfterViewInit {
  @ViewChild(ContadorComponent) contador!: ContadorComponent;

  ngAfterViewInit(): void {
    console.log('Valor inicial del hijo:', this.contador.valor);
  }
}
`), archivo: 'con ngAfterViewInit' },
        { clave: '`@ViewChild` es **la excepción, no la regla**. Se usa sólo cuando hay que invocar algo de forma imperativa: `reset()`, `focus()`, `play()`, `validar()`. Si alcanza con pasar datos, se usa `@Input` y `@Output`. Abusar de `@ViewChild` acopla al padre con la implementación interna del hijo.' },

        { h: 'ViewChild frente a ContentChild' },
        { tabla: {
            cabeceras: ['Decorador', 'Dónde busca'],
            filas: [
                ['`@ViewChild`', 'En el **propio template** del componente'],
                ['`@ContentChild`', 'En el contenido **proyectado** con `ng-content`: lo que el padre insertó desde afuera']
            ]
        } }
    ],

    consigna: [
        { p: 'El hijo `ContadorComponent` tiene su propio botón para sumar y un método público `reset()`. El padre tiene un botón "Resetear desde el padre", pero todavía no hace nada.' },
        { numerada: [
            'En **`app.component.ts`**: obtené la referencia al hijo con `@ViewChild(ContadorComponent) contador!: ContadorComponent;`. Importá `ViewChild`.',
            'Completá `resetearContador()`: tiene que llamar al método `reset()` del hijo.'
        ] },
        { p: 'Sumá varias veces con el botón del hijo y después usá el del padre: el valor tiene que volver a 0.' }
    ],

    semilla: {
        'app/app.module.ts': moduloDe([['ContadorComponent', './contador/contador.component']]),
        'app/contador/contador.component.ts': C(`
import { Component } from '@angular/core';

@Component({
  selector: 'app-contador',
  template: \`
    <p id="valor">Valor actual: {{ valor }}</p>
    <button id="sumar" (click)="sumar()">+1</button>
  \`
})
export class ContadorComponent {
  valor: number = 0;

  sumar(): void {
    this.valor++;
  }

  reset(): void {
    this.valor = 0;
  }
}
`),
        'app/app.component.ts': C(`
import { Component } from '@angular/core';
import { ContadorComponent } from './contador/contador.component';

@Component({
  selector: 'app-root',
  template: \`
    <h2>El padre</h2>
    <app-contador></app-contador>
    <button id="resetear" (click)="resetearContador()">Resetear desde el padre</button>
  \`
})
export class AppComponent {
  resetearContador(): void {
    // Acá hay que llamar al método reset() del hijo
  }
}
`)
    },

    solucion: {
        'app/app.component.ts': C(`
import { Component, ViewChild } from '@angular/core';
import { ContadorComponent } from './contador/contador.component';

@Component({
  selector: 'app-root',
  template: \`
    <h2>El padre</h2>
    <app-contador></app-contador>
    <button id="resetear" (click)="resetearContador()">Resetear desde el padre</button>
  \`
})
export class AppComponent {
  @ViewChild(ContadorComponent) contador!: ContadorComponent;

  resetearContador(): void {
    this.contador.reset();
  }
}
`)
    },

    chequeos: [
        { fuente: { debeTener: [
            { re: imp('ViewChild'), que: "Falta importar ViewChild:  import { Component, ViewChild } from '@angular/core';" },
            { re: '@ViewChild\\(\\s*ContadorComponent\\s*\\)', que: 'Falta la referencia al hijo:  @ViewChild(ContadorComponent) contador!: ContadorComponent;' },
            { re: '\\.reset\\(\\)', que: 'resetearContador() tiene que llamar al método del hijo: this.contador.reset().' }
          ] } },
        { arranca: true },
        { sinErrores: true },
        { accion: { clic: '#sumar' } },
        { accion: { clic: '#sumar' } },
        { accion: { clic: '#sumar' } },
        { dom: { textos: { selector: '#valor', igual: ['Valor actual: 3'] } },
          pista: 'Después de 3 clics en +1 el valor tiene que ser 3. Ese botón es del hijo y no hay que tocarlo.' },
        { accion: { clic: '#resetear' } },
        { dom: { textos: { selector: '#valor', igual: ['Valor actual: 0'] } },
          pista: 'El botón del padre tiene que dejar el valor del hijo en 0. Llamá a this.contador.reset().' }
    ]
},

{
    id: 'p22',
    titulo: '@ViewChild con ElementRef: dar foco',
    minutos: 14,
    abrir: 'app/app.component.ts',

    teoria: [
        { h: 'No sólo componentes: también elementos del HTML' },
        { p: '`@ViewChild` también puede buscar un **elemento cualquiera** de tu template. Para eso primero se le pone un nombre con una **referencia de template**, `#nombre`, y después `@ViewChild` lo busca por ese nombre, escrito entre comillas.' },
        { codigo: C(`
<input #campoBusqueda type="text">
<button (click)="enfocar()">Ir al buscador</button>
`), archivo: 'template' },
        { codigo: C(`
import { Component, ViewChild, ElementRef } from '@angular/core';

export class BuscadorComponent {
  @ViewChild('campoBusqueda') campo!: ElementRef<HTMLInputElement>;

  enfocar(): void {
    this.campo.nativeElement.focus();
  }
}
`), archivo: 'buscador.component.ts' },
        { p: '`ElementRef` es un envoltorio del elemento real del DOM. Con `.nativeElement` accedés al elemento de verdad, y ahí podés llamar lo que tenga: `focus()`, `scrollIntoView()`, `select()`.' },
        { clave: 'Fijate la diferencia: para un **componente** se usa `@ViewChild(MiComponente)`, con la clase. Para un **elemento del HTML** se usa `@ViewChild(\'nombre\')`, con el texto de la referencia de template.' },
        { nota: 'Un caso típico es la accesibilidad: cuando se abre un modal o se muestra un formulario, se le da el foco al primer campo para que el usuario pueda escribir sin tocar el mouse.' }
    ],

    consigna: [
        { p: 'Hay un campo de búsqueda y un botón "Ir al buscador". El campo ya tiene su referencia de template, `#campoBusqueda`. El botón llama a `enfocar()`, pero todavía no hace nada.' },
        { numerada: [
            'En **`app.component.ts`**: obtené el campo con `@ViewChild(\'campoBusqueda\') campo!: ElementRef<HTMLInputElement>;`. Importá `ViewChild` y `ElementRef`.',
            'En `enfocar()`, poné el foco en el campo con `this.campo.nativeElement.focus()`.'
        ] },
        { p: 'Al apretar el botón, el cursor tiene que quedar parpadeando dentro del campo.' }
    ],

    semilla: {
        'app/app.module.ts': moduloDe([]),
        'app/app.component.ts': C(`
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: \`
    <input #campoBusqueda id="buscador" type="text" placeholder="Buscar...">
    <button id="ir" (click)="enfocar()">Ir al buscador</button>
  \`
})
export class AppComponent {
  enfocar(): void {
    // Acá hay que poner el foco en el campo
  }
}
`)
    },

    solucion: {
        'app/app.component.ts': C(`
import { Component, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-root',
  template: \`
    <input #campoBusqueda id="buscador" type="text" placeholder="Buscar...">
    <button id="ir" (click)="enfocar()">Ir al buscador</button>
  \`
})
export class AppComponent {
  @ViewChild('campoBusqueda') campo!: ElementRef<HTMLInputElement>;

  enfocar(): void {
    this.campo.nativeElement.focus();
  }
}
`)
    },

    chequeos: [
        { fuente: { debeTener: [
            { re: imp('ViewChild'), que: 'Falta importar ViewChild desde @angular/core.' },
            { re: imp('ElementRef'), que: 'Falta importar ElementRef desde @angular/core.' },
            { re: '@ViewChild\\(\\s*.campoBusqueda.\\s*\\)', que: "Falta buscar el campo por su referencia:  @ViewChild('campoBusqueda') campo!: ElementRef<HTMLInputElement>;" },
            { re: 'nativeElement\\.focus\\(\\)', que: 'enfocar() tiene que usar this.campo.nativeElement.focus().' }
          ] } },
        { arranca: true },
        { sinErrores: true,
          pista: 'Si dice que campo es undefined, revisá que el nombre entre comillas coincida con la referencia #campoBusqueda del template.' },
        { accion: { clic: '#ir' } },
        { dom: { enfocado: { selector: '#buscador' } },
          pista: 'Después de apretar el botón, el campo tiene que tener el foco. Revisá que enfocar() llame a this.campo.nativeElement.focus().' }
    ]
},

{
    id: 'p23',
    titulo: 'Desafío: el modal reutilizable',
    minutos: 28,
    abrir: 'app/modal/modal.component.ts',

    teoria: [
        { h: 'Todo junto' },
        { p: 'Este paso no trae teoría nueva. Trae un problema del nivel de un **práctico integrador**, donde tenés que **decidir qué herramienta va en cada requisito**. Es exactamente el modal reutilizable que aparece en los parciales.' },
        { p: 'Antes de escribir código, mirá cada requisito y preguntate: ¿es un **dato**, un **evento**, un **contenido** o una **acción sobre el HTML del hijo**?' },
        { tabla: {
            cabeceras: ['Si el requisito es...', 'Se usa...'],
            filas: [
                ['Configurar el hijo desde afuera (título, si se ve o no)', '`@Input()`'],
                ['Que el padre defina el cuerpo, con HTML arbitrario', '`<ng-content>`'],
                ['Que el hijo avise algo', '`@Output()` + `EventEmitter`'],
                ['Dos avisos distintos (confirmar y cancelar)', 'Dos `@Output()`, uno por evento'],
                ['Que el hijo actúe sobre su propio HTML (dar foco)', '`@ViewChild` + `ElementRef`']
            ]
        } },
        { clave: 'La pregunta que ordena todo: **¿es un dato o es un evento?** Los datos bajan con `@Input`; los eventos suben con `@Output`. Si lo que baja es HTML arbitrario, es `ng-content`. Y si hay que ejecutar una acción adentro del hijo, recién ahí `@ViewChild`.' },

        { h: 'El foco al abrir' },
        { p: 'El botón de confirmar está adentro de un `*ngIf`, así que **recién existe después de que Angular renderiza**. Si intentás darle el foco en el mismo momento en que llega el valor de `visible`, todavía no está. La solución es esperar un instante con `setTimeout`:' },
        { codigo: C(`
private _visible = false;

@Input()
set visible(v: boolean) {
  this._visible = v;
  if (v) {
    setTimeout(() => this.btnConfirmar?.nativeElement.focus());
  }
}
get visible(): boolean { return this._visible; }
`), archivo: 'un @Input con setter' },
        { p: 'Un `@Input` puede ser un **setter**: una función que se ejecuta cada vez que el padre le asigna un valor. Es el lugar natural para reaccionar a "el modal se acaba de abrir". El `?.` evita el error si la referencia todavía no existe.' },
        { nota: 'Criterio de evaluación clave: **reutilización real**. El mismo modal tiene que funcionar en dos contextos distintos sin modificarlo entre uno y otro. Si tuviste que tocar el modal para el segundo caso, el diseño no es reutilizable.' }
    ],

    consigna: [
        { p: 'El padre (`app.component.ts`) ya está escrito y **no se toca**. Usa dos veces `<app-modal>` con contenido distinto: uno para cancelar un turno y otro para eliminar un paciente. Tu trabajo es construir **`modal.component.ts`** para que ese uso funcione.' },
        { numerada: [
            'El **título** y el flag **`visible`** se configuran desde el padre.',
            'El **cuerpo** lo define cada pantalla que usa el modal.',
            'El modal avisa al padre cuando el usuario **confirma**.',
            'El modal avisa al padre cuando el usuario **cancela**: es un evento distinto.',
            'Al abrirse, el **foco** queda en el botón de confirmar, sin que el padre sepa cómo está armado el HTML del modal.'
        ] },
        { p: 'Para poder verificarlo, usá estos nombres en el HTML del modal:' },
        { tabla: {
            cabeceras: ['Elemento', 'Cómo se tiene que llamar'],
            filas: [
                ['El fondo que tapa la pantalla', 'clase `overlay`, con `*ngIf` para que exista sólo si `visible` es verdadero'],
                ['El título', 'clase `modal-titulo`'],
                ['El botón de confirmar', 'clase `btn-confirmar` y referencia de template `#btnConfirmar`'],
                ['El botón de cancelar', 'clase `btn-cancelar`']
            ]
        } },
        { nota: 'Los eventos que escucha el padre se llaman **`confirmar`** y **`cancelar`**: los ves en su template. Al principio la Consola va a mostrar errores `NG0303` porque el modal todavía no tiene esos `@Input` y `@Output`: es lo esperado.' }
    ],

    semilla: {
        'app/app.module.ts': moduloDe([['ModalComponent', './modal/modal.component']]),
        'app/modal/modal.component.ts': C(`
import { Component } from '@angular/core';

@Component({
  selector: 'app-modal',
  template: \`
    <!-- Armá acá el modal: fondo, título, cuerpo y botones -->
  \`,
  styles: \`
    .overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.45); display: flex; align-items: center; justify-content: center; }
    .modal { background: #fff; border-radius: 8px; padding: 14px 18px; min-width: 260px; }
    .acciones { display: flex; gap: 8px; margin-top: 12px; }
  \`
})
export class ModalComponent {
}
`),
        'app/app.component.ts': C(`
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: \`
    <h2>Consultorio</h2>
    <button id="abrir-turno" (click)="abrirTurno()">Cancelar turno</button>
    <button id="abrir-paciente" (click)="abrirPaciente()">Eliminar paciente</button>
    <p id="mensaje">{{ mensaje }}</p>

    <app-modal titulo="Cancelar turno"
               [visible]="modalTurnoVisible"
               (confirmar)="cancelarTurno()"
               (cancelar)="cerrarModales()">
      <p id="cuerpo-turno">Esta acción no se puede deshacer.</p>
    </app-modal>

    <app-modal titulo="Eliminar paciente"
               [visible]="modalPacienteVisible"
               (confirmar)="eliminarPaciente()"
               (cancelar)="cerrarModales()">
      <p>Vas a eliminar a:</p>
      <strong id="cuerpo-paciente">{{ pacienteSel.nombre }}</strong>
      <p>DNI: {{ pacienteSel.dni }}</p>
    </app-modal>
  \`
})
export class AppComponent {
  modalTurnoVisible: boolean = false;
  modalPacienteVisible: boolean = false;
  pacienteSel = { nombre: 'Ana Gómez', dni: '30.123.456' };
  mensaje: string = '';

  abrirTurno(): void { this.modalTurnoVisible = true; }
  abrirPaciente(): void { this.modalPacienteVisible = true; }

  cancelarTurno(): void {
    this.mensaje = 'Turno cancelado';
    this.modalTurnoVisible = false;
  }

  eliminarPaciente(): void {
    this.mensaje = 'Paciente eliminado';
    this.modalPacienteVisible = false;
  }

  cerrarModales(): void {
    this.modalTurnoVisible = false;
    this.modalPacienteVisible = false;
  }
}
`)
    },

    solucion: {
        'app/modal/modal.component.ts': C(`
import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-modal',
  template: \`
    <div class="overlay" *ngIf="visible">
      <div class="modal">
        <h3 class="modal-titulo">{{ titulo }}</h3>
        <div class="cuerpo">
          <ng-content></ng-content>
        </div>
        <div class="acciones">
          <button #btnConfirmar class="btn-confirmar" (click)="confirmar.emit()">Confirmar</button>
          <button class="btn-cancelar" (click)="cancelar.emit()">Cancelar</button>
        </div>
      </div>
    </div>
  \`,
  styles: \`
    .overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.45); display: flex; align-items: center; justify-content: center; }
    .modal { background: #fff; border-radius: 8px; padding: 14px 18px; min-width: 260px; }
    .acciones { display: flex; gap: 8px; margin-top: 12px; }
  \`
})
export class ModalComponent {
  @Input() titulo: string = '';
  @Output() confirmar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();
  @ViewChild('btnConfirmar') btnConfirmar!: ElementRef<HTMLButtonElement>;

  private _visible = false;

  @Input()
  set visible(v: boolean) {
    this._visible = v;
    if (v) {
      setTimeout(() => this.btnConfirmar?.nativeElement.focus());
    }
  }
  get visible(): boolean {
    return this._visible;
  }
}
`)
    },

    chequeos: [
        { fuente: { archivo: 'app/modal/modal.component.ts', debeTener: [
            { re: '@Input\\(\\)\\s*titulo', que: 'Falta el @Input() titulo: el título se configura desde el padre.' },
            { re: '@Input\\(\\)\\s*(set\\s+)?visible', que: 'Falta el @Input() visible: si el modal se ve o no se configura desde el padre.' },
            { re: '<ng-content', que: 'Falta el <ng-content>: el cuerpo del modal lo define el padre.' },
            { re: '@Output\\(\\)\\s*confirmar', que: 'Falta el @Output() confirmar: el modal tiene que avisar cuando el usuario confirma.' },
            { re: '@Output\\(\\)\\s*cancelar', que: 'Falta el @Output() cancelar: es un evento distinto al de confirmar.' },
            { re: '@ViewChild', que: 'Falta @ViewChild para llegar al botón de confirmar desde el código del modal.' },
            { re: 'focus\\(\\)', que: 'Falta dar el foco al botón de confirmar con .nativeElement.focus().' }
          ] } },
        { arranca: true },
        { sinErrores: true,
          pista: 'Si el error dice NG0303 con visible, titulo, confirmar o cancelar, falta declarar ese @Input o @Output en el modal.' },

        { dom: { noExiste: { selector: '.overlay' } },
          pista: 'Con visible en false el modal no tiene que existir. El fondo (clase overlay) va con *ngIf="visible".' },

        { accion: { clic: '#abrir-turno' } },
        { dom: { contar: { selector: '.overlay', es: 1 } },
          pista: 'Al apretar "Cancelar turno" tiene que aparecer el modal. Revisá que el *ngIf dependa de visible.' },
        { dom: { textos: { selector: '.modal-titulo', igual: ['Cancelar turno'] } },
          pista: 'El título tiene que mostrar el @Input titulo, en un elemento con clase modal-titulo.' },
        { dom: { existe: { selector: '#cuerpo-turno' } },
          pista: 'El cuerpo que define el padre no aparece. Falta el <ng-content> adentro del modal.' },
        { dom: { enfocado: { selector: '.btn-confirmar' } },
          pista: 'Al abrirse, el botón de confirmar tiene que tener el foco. El botón recién existe después del *ngIf: usá un setTimeout antes de llamar a focus().' },
        { accion: { clic: '.btn-confirmar' } },
        { dom: { textos: { selector: '#mensaje', igual: ['Turno cancelado'] } },
          pista: 'Al confirmar, el modal tiene que emitir confirmar. El botón (clase btn-confirmar) llama a confirmar.emit().' },
        { dom: { noExiste: { selector: '.overlay' } },
          pista: 'Después de confirmar el padre cierra el modal: visible vuelve a false y el modal desaparece.' },

        { accion: { clic: '#abrir-paciente' } },
        { dom: { textos: { selector: '.modal-titulo', igual: ['Eliminar paciente'] } },
          pista: 'El mismo modal tiene que servir para otro caso sin modificarlo: el título viene del padre.' },
        { dom: { textos: { selector: '#cuerpo-paciente', igual: ['Ana Gómez'] } },
          pista: 'El cuerpo del segundo caso es distinto y también lo define el padre, con <ng-content>.' },
        { dom: { enfocado: { selector: '.btn-confirmar' } },
          pista: 'El foco tiene que ir al botón de confirmar CADA VEZ que se abre, no sólo la primera.' },
        { accion: { clic: '.btn-cancelar' } },
        { dom: { noExiste: { selector: '.overlay' } },
          pista: 'Al cancelar el modal tiene que cerrarse. El botón btn-cancelar llama a cancelar.emit().' },
        { dom: { textos: { selector: '#mensaje', igual: ['Turno cancelado'] } },
          pista: 'Cancelar NO es confirmar: el mensaje no tiene que cambiar. Son dos @Output distintos.' }
    ]
}

    ];

    pasos.forEach(function (p) { CONTENIDO.angular.push(p); });
})();
