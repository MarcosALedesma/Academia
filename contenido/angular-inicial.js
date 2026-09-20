/* ============================================================================
 * angular-inicial.js — EL CONTENIDO DE LA CLASE DE ANGULAR. Dato puro, sin funciones.
 *
 * Mismo esquema que contenido/inicial.js (Express), con dos diferencias:
 *   - los archivos son de un proyecto Angular (app/app.component.ts, ...)
 *   - los chequeos no le hablan a un servidor: miran el DOM de la vista previa.
 *
 * Cubre las secciones 1 a 4 del apunte de repaso: cómo se organiza un proyecto,
 * componentes, los cuatro bindings y las directivas *ngIf, *ngFor y ngClass.
 *
 * ESQUEMA DE UN PASO
 * ------------------
 *   id, titulo, minutos, teoria, consigna, semilla, solucion   (igual que Express)
 *   probar       no se usa
 *   abrir        (opcional) archivo que se abre al entrar al paso. Por omisión app/app.component.ts.
 *   semilla      el proyecto COMPLETO del paso ({ 'ruta': 'texto' }). Al entrar se carga esa
 *                semilla; lo que el alumno escribe se guarda por paso, así volver atrás no lo pierde.
 *   chequeos     [chequeos]  vocabulario abajo
 *
 * BLOQUES (teoria y consigna): los mismos que Express.
 *   { h } { p } { lista } { numerada } { codigo, archivo } { terminal }
 *   { clave } { nota } { tabla } { diagrama }
 *
 * VOCABULARIO DE UN CHEQUEO
 * -------------------------
 *   { fuente: { archivo?, debeTener:[{re,que}], noDebeTener:[{re,que}] }, pista? }
 *        mira el TEXTO de un archivo del alumno. Sirve para lo que no se ve en
 *        pantalla: que declaró el componente, que usó tal decorador.
 *
 *   { arranca: true, pista? }
 *        la aplicación tiene que arrancar sin romperse.
 *
 *   { sinErrores: true, pista? }
 *        Angular no protestó por consola (NG0303, NG0304, TypeError...).
 *
 *   { errorEsperado: 'NG0304', pista? }   -- para pasos que muestran un error a propósito
 *
 *   { dom: { ... }, pista? }     mira la pantalla REAL de la vista previa
 *        contar:    { selector, es? , min?, max? }
 *        textos:    { selector, igual?: [...], contiene?: '...' }
 *        existe:    { selector }    noExiste: { selector }
 *        atributo:  { selector, nombre, igual }
 *        propiedad: { selector, nombre, igual }
 *
 *   { accion: { clic: 'selector' | escribir: ['selector','texto'] }, pista? }
 *        interactúa con la pantalla; los chequeos siguientes ven el resultado.
 *
 * En p/lista/nota/clave/h se puede usar `código` entre acentos graves y
 * **negrita** entre asteriscos dobles. Nada más: no es Markdown.
 * ========================================================================== */

CONTENIDO.angular = [

/* ========================================================================== */
{
    id: 'p01',
    titulo: 'Qué es Angular y cómo arranca',
    minutos: 12,

    teoria: [
        { h: 'Framework, no biblioteca' },
        { p: 'Una **biblioteca** es un conjunto de herramientas que vos llamás cuando querés. Un **framework** es al revés: te da una estructura que dice dónde va cada cosa, y es él quien llama a tu código cuando corresponde. Express es una biblioteca. **Angular es un framework.**' },
        { p: 'Se escribe en **TypeScript**, que es JavaScript con tipos. El navegador no entiende TypeScript, así que Angular lo compila a JavaScript antes de mostrarlo. Los tipos existen sólo mientras programás: sirven para que el editor te avise de un error antes de ejecutar.' },

        { h: 'Una sola página' },
        { p: 'Una aplicación de Angular es una **SPA** (Single Page Application). Hay un único archivo HTML de verdad, `index.html`, y la página nunca se recarga: cuando el usuario navega, Angular reemplaza pedazos del HTML en vivo. Por eso se siente rápida, parecida a una app de celular.' },

        { h: 'Cómo se enciende la aplicación' },
        { diagrama: 'index.html\n  └─ <app-root>                 ← la etiqueta que espera Angular\n       └─ AppComponent          ← la clase que responde a esa etiqueta\n            └─ su template      ← el HTML que Angular pone ahí adentro\n                 └─ <app-otro>  ← cada componente hijo hace lo mismo' },
        { p: 'El navegador carga `index.html`, encuentra la etiqueta `<app-root>` y Angular la **reemplaza** por el template de `AppComponent`. Cada etiqueta de componente que aparezca ahí adentro se reemplaza, a su vez, por su propio template, y así hacia abajo. El `index.html` no se toca nunca.' },
        { clave: 'Un componente **no aparece por existir**. Alguien tiene que poner su etiqueta. Si creás un componente y la pantalla queda en blanco, casi siempre es porque nadie lo invocó.' },

        { h: 'Los archivos de un proyecto' },
        { tabla: {
            cabeceras: ['Archivo', 'Para qué sirve'],
            filas: [
                ['`index.html`', 'El único HTML real. Tiene `<app-root>`.'],
                ['`main.ts`', 'El punto de arranque: le dice a Angular qué componente encender.'],
                ['`app.component.ts`', 'La lógica del componente raíz: clase, propiedades, métodos.'],
                ['`app.component.html`', 'Lo que se ve en pantalla. Es el template.'],
                ['`package.json`', 'La ficha del proyecto: qué paquetes necesita.']
            ]
        } },
        { p: 'En esta clase vas a escribir el template **adentro del mismo archivo `.ts`**, con la propiedad `template`, para tener todo a la vista. Es exactamente lo mismo: Angular no distingue si el HTML está en un archivo aparte (`templateUrl`) o adentro (`template`).' },

        { h: 'Los comandos que existen (y que acá no hace falta correr)' },
        { terminal: 'npm install -g @angular/cli@18   # instalar el CLI, versión 18\nng new mi-proyecto               # crear un proyecto\nng serve                         # levantar el servidor en localhost:4200' },
        { p: 'Necesitás **Node.js**, **npm** y el **Angular CLI**, que es el que provee el comando `ng`. En el aula todo eso ya está resuelto por esta pantalla: acá vas a ver el resultado de tu código sin instalar nada.' },
        { nota: 'El paquete es `@angular/cli`, no `angular@cli`. Y el comando es `ng new`, no `ng nwe`. Son detalles que se toman.' }
    ],

    consigna: [
        { p: 'Ya hay un `AppComponent` en `app/app.component.ts`, pero le falta el mensaje. Cambiá la propiedad `titulo` para que valga exactamente **`Sistema de turnos`**.' },
        { p: 'Fijate qué pasa en la **vista previa** de la derecha cada vez que guardás: Angular vuelve a arrancar la aplicación con tu código nuevo.' },
        { nota: 'Si la vista queda en blanco, mirá la pestaña **Consola**: ahí Angular te dice qué le pasó, con un código como `NG0304`. Aprender a leer esos códigos es media materia.' }
    ],

    semilla: {
        'app/app.component.ts':
            "import { Component } from '@angular/core';\n\n" +
            "@Component({\n" +
            "  selector: 'app-root',\n" +
            "  standalone: true,\n" +
            "  template: `\n" +
            "    <h1>{{ titulo }}</h1>\n" +
            "    <p>Bienvenido al panel de gestión</p>\n" +
            "  `\n" +
            "})\n" +
            "export class AppComponent {\n" +
            "  titulo: string = 'Hola mundo';\n" +
            "}\n"
    },

    solucion: {
        'app/app.component.ts':
            "import { Component } from '@angular/core';\n\n" +
            "@Component({\n" +
            "  selector: 'app-root',\n" +
            "  standalone: true,\n" +
            "  template: `\n" +
            "    <h1>{{ titulo }}</h1>\n" +
            "    <p>Bienvenido al panel de gestión</p>\n" +
            "  `\n" +
            "})\n" +
            "export class AppComponent {\n" +
            "  titulo: string = 'Sistema de turnos';\n" +
            "}\n"
    },

    chequeos: [
        { arranca: true,
          pista: 'La aplicación no arrancó. Mirá la Consola: ahí está el error.' },
        { dom: { textos: { selector: 'h1', igual: ['Sistema de turnos'] } },
          pista: 'El título tiene que decir exactamente "Sistema de turnos". Cambiá el valor de la propiedad titulo, entre comillas simples.' }
    ]
},

/* ========================================================================== */
{
    id: 'p02',
    titulo: 'Anatomía de un componente',
    minutos: 14,

    teoria: [
        { h: 'Una pieza de pantalla reutilizable' },
        { p: 'Una aplicación de Angular es un **árbol de componentes**. Cada componente es una pieza de pantalla: una tarjeta, un menú, un formulario. Y cada uno vive en tres archivos con la misma raíz:' },
        { tabla: {
            cabeceras: ['Archivo', 'Qué contiene'],
            filas: [
                ['`ejemplo.component.ts`', 'La **lógica**: la clase, las propiedades, los métodos'],
                ['`ejemplo.component.html`', 'El **template**: lo que se ve'],
                ['`ejemplo.component.css`', 'Los **estilos**, que sólo afectan a ese componente']
            ]
        } },

        { h: 'El archivo .ts, línea por línea' },
        { codigo: "import { Component } from '@angular/core';\n\n@Component({\n  selector: 'app-ejemplo',\n  template: `<p>{{ titulo }}</p>`\n})\nexport class EjemploComponent {\n  titulo: string = 'Hola mundo';\n\n  saludar(): void {\n    console.log('Hola!');\n  }\n}", archivo: 'ejemplo.component.ts' },
        { p: '**`@Component({...})`** es un **decorador**: una etiqueta que agrega información a la clase para que Angular sepa que no es una clase cualquiera sino un componente. Lo que va adentro son sus datos: cómo se llama su etiqueta, dónde está su HTML.' },
        { p: '**`selector`** es el nombre de la etiqueta HTML del componente. Si es `app-ejemplo`, en cualquier template escribís `<app-ejemplo></app-ejemplo>`. El prefijo `app-` es la convención: evita chocar con etiquetas nativas como `<button>`.' },
        { p: '**`titulo: string`** es una **propiedad**: un dato que el componente guarda. Lo que viene después de los dos puntos es su **tipo**. **`saludar(): void`** es un **método**: una acción que el componente sabe hacer. `void` quiere decir que no devuelve nada.' },
        { clave: 'Las propiedades y los métodos de la clase están **disponibles en el template**. Eso es lo que conecta la lógica con la pantalla: lo que declarás en el `.ts`, lo usás en el HTML.' },

        { h: 'Propiedades calculadas: get' },
        { p: 'Un `get` es una propiedad que por dentro ejecuta código. Desde el template se usa **como si fuera una variable**, pero se recalcula sola. Conviene para sacar lógica del HTML:' },
        { codigo: "export class ResumenComponent {\n  notas: number[] = [8, 4, 10, 6, 7];\n\n  get promedio(): number {\n    const suma = this.notas.reduce((a, b) => a + b, 0);\n    return suma / this.notas.length;\n  }\n}", archivo: 'resumen.component.ts' },
        { nota: 'Adentro de la clase, para llegar a una propiedad se escribe `this.notas`. En el **template** no: ahí se escribe `notas`, sin `this`. Es la confusión más común del principio.' }
    ],

    consigna: [
        { p: 'Vas a armar un componente con datos y una acción. En `app/app.component.ts`:' },
        { numerada: [
            'Agregá una propiedad `notas` de tipo `number[]` con estos valores: `8`, `4`, `10`, `6`, `7`.',
            'Agregá un `get promedio` que devuelva el promedio de las notas (la suma dividida por la cantidad).',
            'Mostrá el promedio en el template dentro del párrafo con id `promedio`, con `{{ promedio }}`.'
        ] },
        { p: 'El promedio de esas notas es **7**. Si te da otra cosa, revisá la cuenta.' }
    ],

    semilla: {
        'app/app.component.ts':
            "import { Component } from '@angular/core';\n\n" +
            "@Component({\n" +
            "  selector: 'app-root',\n" +
            "  standalone: true,\n" +
            "  template: `\n" +
            "    <h1>Resumen de notas</h1>\n" +
            "    <p id=\"promedio\"></p>\n" +
            "  `\n" +
            "})\n" +
            "export class AppComponent {\n" +
            "  // Acá van las notas y el promedio\n" +
            "}\n"
    },

    solucion: {
        'app/app.component.ts':
            "import { Component } from '@angular/core';\n\n" +
            "@Component({\n" +
            "  selector: 'app-root',\n" +
            "  standalone: true,\n" +
            "  template: `\n" +
            "    <h1>Resumen de notas</h1>\n" +
            "    <p id=\"promedio\">{{ promedio }}</p>\n" +
            "  `\n" +
            "})\n" +
            "export class AppComponent {\n" +
            "  notas: number[] = [8, 4, 10, 6, 7];\n\n" +
            "  get promedio(): number {\n" +
            "    const suma = this.notas.reduce((a, b) => a + b, 0);\n" +
            "    return suma / this.notas.length;\n" +
            "  }\n" +
            "}\n"
    },

    chequeos: [
        { fuente: { debeTener: [
            { re: 'notas\\s*:\\s*number\\[\\]', que: 'Falta la propiedad notas de tipo number[].' },
            { re: 'get\\s+promedio\\s*\\(', que: 'Falta el get promedio(). Se escribe:  get promedio(): number { ... }' }
          ] } },
        { arranca: true, pista: 'La aplicación no arrancó. Mirá la Consola.' },
        { sinErrores: true },
        { dom: { textos: { selector: '#promedio', igual: ['7'] } },
          pista: 'El promedio de 8, 4, 10, 6 y 7 es 7. Revisá que el get devuelva suma / cantidad y que el template use {{ promedio }}, sin this.' }
    ]
},

/* ========================================================================== */
{
    id: 'p03',
    titulo: 'Un componente adentro de otro',
    minutos: 16,
    abrir: 'app/app.module.ts',

    teoria: [
        { h: 'Por qué se separa en componentes' },
        { p: 'Una pantalla entera escrita en un solo componente se vuelve inmanejable enseguida. La idea de Angular es partirla en piezas chicas y reutilizables, y **armar la pantalla poniendo unas adentro de otras**, como bloques.' },

        { h: 'Los dos pasos para usar un componente hijo' },
        { numerada: [
            '**Crearlo**: una clase con `@Component` y su `selector`.',
            '**Ponerlo** en el template del padre, con la etiqueta que dice su selector.'
        ] },
        { codigo: "// saludo/saludo.component.ts\n@Component({\n  selector: 'app-saludo',\n  template: `<p>Hola desde el hijo</p>`\n})\nexport class SaludoComponent {}", archivo: 'saludo.component.ts' },
        { codigo: "// app.component.ts\n@Component({\n  selector: 'app-root',\n  template: `<h1>Panel</h1> <app-saludo></app-saludo>`\n})\nexport class AppComponent {}", archivo: 'app.component.ts' },
        { p: 'Pero falta un tercer paso, y es el que hace tropezar a todo el mundo: **Angular tiene que saber que ese componente existe**. Hay dos formas de decírselo, y el apunte enseña las dos porque las dos están vigentes.' },

        { h: 'Con módulos: declarations' },
        { p: 'Es el estilo de los proyectos creados con `ng new --standalone=false`. Hay un archivo central, `app.module.ts`, donde se **registra** todo lo que existe:' },
        { codigo: "import { NgModule } from '@angular/core';\nimport { BrowserModule } from '@angular/platform-browser';\nimport { AppComponent } from './app.component';\nimport { SaludoComponent } from './saludo/saludo.component';\n\n@NgModule({\n  declarations: [        // MIS componentes\n    AppComponent,\n    SaludoComponent\n  ],\n  imports: [BrowserModule],   // OTROS módulos que necesito\n  bootstrap: [AppComponent]   // por dónde arranca la app\n})\nexport class AppModule { }", archivo: 'app.module.ts' },
        { tabla: {
            cabeceras: ['Lista', 'Qué va adentro'],
            filas: [
                ['`declarations`', 'Los componentes que escribiste **vos**. Si falta uno, su etiqueta no se reconoce.'],
                ['`imports`', 'Módulos **de afuera**: `FormsModule` para formularios, por ejemplo.'],
                ['`bootstrap`', 'El componente raíz. Siempre `AppComponent`.']
            ]
        } },
        { nota: 'El error clásico: confundir `declarations` con `imports`. Los componentes propios van en **declarations**; los módulos de terceros van en **imports**.' },

        { h: 'Standalone: el componente se declara a sí mismo' },
        { p: 'Desde Angular 17 es el valor por defecto. No hay `app.module.ts`: cada componente lleva `standalone: true` y trae, en su propio `imports`, lo que necesita.' },
        { tabla: {
            cabeceras: ['', 'Con módulos', 'Standalone'],
            filas: [
                ['Dónde se declara', 'En `declarations` de `app.module.ts`', 'El componente se declara a sí mismo'],
                ['Existe `app.module.ts`', 'Sí', 'No'],
                ['Marca en el decorador', 'Ninguna', '`standalone: true`'],
                ['Imports del componente', 'Los provee el módulo', 'Van en el array `imports` del componente']
            ]
        } },
        { clave: 'Las dos preguntas del asistente `ng new` (estilo standalone o módulos, y si querés routing) **son cosas distintas**. Una decide cómo se declaran los componentes; la otra, cómo se navega. Se combinan libremente.' },

        { h: 'El error que vas a ver' },
        { p: 'Si creás el hijo y te olvidás de declararlo, Angular no rompe con una excepción: la pantalla **queda sin el hijo** y por la Consola aparece un error `NG0304`, que dice que la etiqueta "no es un elemento conocido". Es exactamente el mismo error si escribís mal el selector, por ejemplo `<saludo>` en vez de `<app-saludo>`.' }
    ],

    consigna: [
        { p: 'Este proyecto usa **módulos**. Ya existe el componente hijo `SaludoComponent` en `app/saludo/saludo.component.ts`, y el padre ya tiene su etiqueta `<app-saludo>`. Pero la pantalla sólo muestra el título.' },
        { p: 'Arreglalo en `app/app.module.ts`: **declarar** el componente hijo.' },
        { numerada: [
            'Importá `SaludoComponent` al principio del archivo.',
            'Agregalo al array `declarations`.'
        ] },
        { p: 'Si lo hacés bien, aparece **Hola desde el hijo** debajo del título, y la Consola queda sin errores. Antes de arreglarlo, **mirá la Consola** con el error a propósito: es el que más vas a ver en el parcial.' }
    ],

    semilla: {
        'app/app.component.ts':
            "import { Component } from '@angular/core';\n\n" +
            "@Component({\n" +
            "  selector: 'app-root',\n" +
            "  template: `\n" +
            "    <h1>Panel</h1>\n" +
            "    <app-saludo></app-saludo>\n" +
            "  `\n" +
            "})\n" +
            "export class AppComponent {}\n",
        'app/saludo/saludo.component.ts':
            "import { Component } from '@angular/core';\n\n" +
            "@Component({\n" +
            "  selector: 'app-saludo',\n" +
            "  template: `<p id=\"saludo\">Hola desde el hijo</p>`\n" +
            "})\n" +
            "export class SaludoComponent {}\n",
        'app/app.module.ts':
            "import { NgModule } from '@angular/core';\n" +
            "import { BrowserModule } from '@angular/platform-browser';\n" +
            "import { AppComponent } from './app.component';\n\n" +
            "@NgModule({\n" +
            "  declarations: [\n" +
            "    AppComponent\n" +
            "  ],\n" +
            "  imports: [BrowserModule],\n" +
            "  bootstrap: [AppComponent]\n" +
            "})\n" +
            "export class AppModule { }\n"
    },

    solucion: {
        'app/app.module.ts':
            "import { NgModule } from '@angular/core';\n" +
            "import { BrowserModule } from '@angular/platform-browser';\n" +
            "import { AppComponent } from './app.component';\n" +
            "import { SaludoComponent } from './saludo/saludo.component';\n\n" +
            "@NgModule({\n" +
            "  declarations: [\n" +
            "    AppComponent,\n" +
            "    SaludoComponent\n" +
            "  ],\n" +
            "  imports: [BrowserModule],\n" +
            "  bootstrap: [AppComponent]\n" +
            "})\n" +
            "export class AppModule { }\n"
    },

    chequeos: [
        { fuente: { archivo: 'app/app.module.ts', debeTener: [
            { re: "import\\s*\\{[^}]*SaludoComponent[^}]*\\}\\s*from", que: "Falta importar SaludoComponent arriba de todo:  import { SaludoComponent } from './saludo/saludo.component';" },
            { re: "declarations\\s*:\\s*\\[[^\\]]*SaludoComponent", que: 'SaludoComponent tiene que estar adentro del array declarations, no solo importado.' }
          ] } },
        { arranca: true },
        { sinErrores: true,
          pista: 'Angular protesta por consola. Si dice NG0304, el componente todavía no está declarado o el selector está mal escrito.' },
        { dom: { textos: { selector: '#saludo', igual: ['Hola desde el hijo'] } },
          pista: 'El hijo no se está mostrando. Revisá que SaludoComponent esté en declarations de app.module.ts.' }
    ]
},

/* ========================================================================== */
{
    id: 'p04',
    titulo: 'Interpolación: mostrar datos',
    minutos: 12,

    teoria: [
        { h: 'Los cuatro bindings' },
        { p: 'Un **binding** es una conexión entre la clase (el `.ts`) y el template (el HTML). Todo lo que sigue de la materia se apoya en estos cuatro. Aprendelos como tabla, porque los vas a usar todos los días:' },
        { tabla: {
            cabeceras: ['Sintaxis', 'Nombre', 'Dirección', 'Para qué sirve'],
            filas: [
                ['`{{ variable }}`', 'Interpolación', 'TS → HTML', 'Mostrar un valor en pantalla'],
                ['`[propiedad]="valor"`', 'Property binding', 'TS → HTML', 'Pasar un dato a una propiedad'],
                ['`(evento)="metodo()"`', 'Event binding', 'HTML → TS', 'Escuchar un evento y ejecutar código'],
                ['`[(ngModel)]="var"`', 'Two-way binding', 'Ambas', 'Leer y escribir el mismo valor']
            ]
        } },
        { clave: 'La regla para memorizar: **corchetes, entra un dato. Paréntesis, sale un evento.** Los corchetes sirven para mandar algo; los paréntesis para escuchar algo.' },

        { h: 'Interpolación' },
        { p: 'Las llaves dobles toman una propiedad de la clase y escriben su valor en el HTML. Aceptan **expresiones simples**, no sentencias:' },
        { codigo: "<p>{{ nombre }}</p>\n<p>{{ nombre.toUpperCase() }}</p>\n<p>{{ precio * cantidad }}</p>\n<p>{{ alumno.nota >= 6 ? 'Aprobado' : 'Desaprobado' }}</p>", archivo: 'ejemplos de interpolación' },
        { p: 'La última usa el **operador ternario**: `condición ? valorSiSí : valorSiNo`. Es la forma de decidir qué texto mostrar sin escribir un `if`.' },

        { h: 'Lo que NO se puede' },
        { p: 'Adentro de las llaves no funcionan `typeof`, `new`, asignaciones (`x = 5`) ni operadores como `++`. Si necesitás algo de eso, va en el archivo `.ts`, no en el template. Y si una expresión se hace larga, conviene un `get`, como viste en el paso 2.' },
        { nota: 'Si interpolás un **objeto entero**, `{{ alumno }}`, en pantalla aparece `[object Object]`. Es señal de que hay que acceder a una propiedad con el punto: `{{ alumno.nombre }}`.' }
    ],

    consigna: [
        { p: 'Tenés un alumno como objeto. Mostrá sus datos en pantalla con interpolación, sin tocar la clase:' },
        { numerada: [
            'En el `<h2>` con id `nombre`, mostrá el nombre del alumno **en mayúsculas** (`toUpperCase()`).',
            'En el párrafo con id `total`, mostrá el resultado de multiplicar `precio` por `cantidad`.',
            'En el párrafo con id `estado`, mostrá **`Aprobado`** si la nota es 6 o más, y **`Desaprobado`** si no, con el operador ternario.'
        ] },
        { nota: 'No cambies los datos de la clase. La nota de Ana es 8, así que tiene que decir Aprobado.' }
    ],

    semilla: {
        'app/app.component.ts':
            "import { Component } from '@angular/core';\n\n" +
            "@Component({\n" +
            "  selector: 'app-root',\n" +
            "  standalone: true,\n" +
            "  template: `\n" +
            "    <h2 id=\"nombre\"></h2>\n" +
            "    <p id=\"total\"></p>\n" +
            "    <p id=\"estado\"></p>\n" +
            "  `\n" +
            "})\n" +
            "export class AppComponent {\n" +
            "  alumno = { nombre: 'Ana Gómez', nota: 8 };\n" +
            "  precio: number = 1500;\n" +
            "  cantidad: number = 3;\n" +
            "}\n"
    },

    solucion: {
        'app/app.component.ts':
            "import { Component } from '@angular/core';\n\n" +
            "@Component({\n" +
            "  selector: 'app-root',\n" +
            "  standalone: true,\n" +
            "  template: `\n" +
            "    <h2 id=\"nombre\">{{ alumno.nombre.toUpperCase() }}</h2>\n" +
            "    <p id=\"total\">{{ precio * cantidad }}</p>\n" +
            "    <p id=\"estado\">{{ alumno.nota >= 6 ? 'Aprobado' : 'Desaprobado' }}</p>\n" +
            "  `\n" +
            "})\n" +
            "export class AppComponent {\n" +
            "  alumno = { nombre: 'Ana Gómez', nota: 8 };\n" +
            "  precio: number = 1500;\n" +
            "  cantidad: number = 3;\n" +
            "}\n"
    },

    chequeos: [
        { arranca: true },
        { sinErrores: true },
        { dom: { textos: { selector: '#nombre', igual: ['ANA GÓMEZ'] } },
          pista: 'El nombre tiene que verse en mayúsculas: {{ alumno.nombre.toUpperCase() }}. Acordate de los paréntesis del método.' },
        { dom: { textos: { selector: '#total', igual: ['4500'] } },
          pista: '1500 por 3 da 4500. Escribí la multiplicación adentro de las llaves: {{ precio * cantidad }}.' },
        { dom: { textos: { selector: '#estado', igual: ['Aprobado'] } },
          pista: 'Ana tiene 8, así que tiene que decir Aprobado. Con el ternario: {{ alumno.nota >= 6 ? \'Aprobado\' : \'Desaprobado\' }}.' }
    ]
},

/* ========================================================================== */
{
    id: 'p05',
    titulo: 'Property binding y la trampa de los tipos',
    minutos: 14,

    teoria: [
        { h: 'Los corchetes convierten el texto en código' },
        { p: 'Cuando ponés corchetes, lo que va entre comillas **deja de ser texto y pasa a ser una expresión de TypeScript**. Sin corchetes, es texto plano.' },
        { codigo: "<img [src]=\"rutaImagen\">              <!-- rutaImagen es una VARIABLE -->\n<button [disabled]=\"!formularioValido\">Enviar</button>\n<app-hijo [edad]=\"42\"></app-hijo>       <!-- pasa el NÚMERO 42 -->", archivo: 'property binding' },

        { h: 'Los tres casos, uno al lado del otro' },
        { codigo: "<app-hijo dato=\"hola\">       <!-- el string \"hola\" -->\n<app-hijo [dato]=\"hola\">      <!-- el valor de la VARIABLE hola -->\n<app-hijo [dato]=\"'hola'\">    <!-- el string \"hola\", igual que el primero -->", archivo: 'tres formas' },
        { p: 'La segunda y la tercera se ven casi iguales y hacen cosas opuestas: una busca una variable llamada `hola`, la otra usa el texto `hola`. Si la variable no existe, no hay error de compilación: simplemente llega `undefined`.' },

        { h: 'La trampa de los tipos' },
        { p: 'Sin corchetes, **todo llega como string**. `edad="42"` pasa el texto `"42"`, no el número 42. Y lo peor es con los booleanos:' },
        { codigo: "<button disabled=\"false\">   <!-- deshabilitado: el TEXTO \"false\" es truthy -->\n<button [disabled]=\"false\">  <!-- habilitado: el BOOLEANO false -->", archivo: 'la trampa' },
        { p: 'En JavaScript, `"false"` es un string no vacío, y **todo string no vacío es truthy**. Resultado: el botón queda deshabilitado, y no aparece ningún error en la consola. Es un bug que no deja pistas.' },
        { clave: 'Regla práctica: un string fijo, los corchetes son opcionales. Un **number, boolean, array u objeto**, los corchetes son **obligatorios**. Una **variable** del padre, los corchetes son obligatorios.' },
        { nota: 'El elemento existe, pero en un `<button>` la propiedad es `disabled`. Con `[disabled]="algo"`, Angular le asigna a esa **propiedad del elemento** el valor de la expresión. Por eso funciona con booleanos de verdad.' }
    ],

    consigna: [
        { p: 'Hay dos botones que tienen que estar **deshabilitados solo cuando corresponde**, y una imagen que tiene que tomar su ruta de una variable:' },
        { numerada: [
            'El botón con id `enviar` tiene que estar deshabilitado cuando `nombre` tiene menos de 3 caracteres. Usá `[disabled]` con `nombre.length < 3`.',
            'La imagen con id `foto` tiene que tomar su `src` de la variable `rutaFoto`. Usá `[src]`.',
            'La imagen también tiene que tomar su `alt` de la variable `descripcion`. Usá `[alt]`.'
        ] },
        { nota: 'Como `nombre` arranca vacío, el botón **tiene que verse deshabilitado** al principio. Si no lo está, probablemente pusiste `disabled` sin corchetes.' }
    ],

    semilla: {
        'app/app.component.ts':
            "import { Component } from '@angular/core';\n\n" +
            "@Component({\n" +
            "  selector: 'app-root',\n" +
            "  standalone: true,\n" +
            "  template: `\n" +
            "    <img id=\"foto\" src=\"\" alt=\"\">\n" +
            "    <button id=\"enviar\">Enviar</button>\n" +
            "  `\n" +
            "})\n" +
            "export class AppComponent {\n" +
            "  nombre: string = '';\n" +
            "  rutaFoto: string = 'assets/ana.jpg';\n" +
            "  descripcion: string = 'Foto de Ana';\n" +
            "}\n"
    },

    solucion: {
        'app/app.component.ts':
            "import { Component } from '@angular/core';\n\n" +
            "@Component({\n" +
            "  selector: 'app-root',\n" +
            "  standalone: true,\n" +
            "  template: `\n" +
            "    <img id=\"foto\" [src]=\"rutaFoto\" [alt]=\"descripcion\">\n" +
            "    <button id=\"enviar\" [disabled]=\"nombre.length < 3\">Enviar</button>\n" +
            "  `\n" +
            "})\n" +
            "export class AppComponent {\n" +
            "  nombre: string = '';\n" +
            "  rutaFoto: string = 'assets/ana.jpg';\n" +
            "  descripcion: string = 'Foto de Ana';\n" +
            "}\n"
    },

    chequeos: [
        { fuente: { debeTener: [
            { re: '\\[\\s*disabled\\s*\\]\\s*=', que: 'Falta [disabled] con corchetes. Sin corchetes el valor es texto, y el texto "false" es truthy.' },
            { re: '\\[\\s*src\\s*\\]\\s*=', que: 'Falta [src] con corchetes: la ruta sale de la variable rutaFoto.' },
            { re: '\\[\\s*alt\\s*\\]\\s*=', que: 'Falta [alt] con corchetes: el texto sale de la variable descripcion.' }
          ] } },
        { arranca: true },
        { sinErrores: true },
        { dom: { propiedad: { selector: '#enviar', nombre: 'disabled', igual: true } },
          pista: 'Con nombre vacío el botón tiene que estar deshabilitado. Usá [disabled]="nombre.length < 3".' },
        { dom: { atributo: { selector: '#foto', nombre: 'src', igual: 'assets/ana.jpg' } },
          pista: 'El src tiene que salir de la variable rutaFoto: [src]="rutaFoto".' },
        { dom: { atributo: { selector: '#foto', nombre: 'alt', igual: 'Foto de Ana' } },
          pista: 'El alt tiene que salir de la variable descripcion: [alt]="descripcion".' }
    ]
},

/* ========================================================================== */
{
    id: 'p06',
    titulo: 'Event binding y two-way binding',
    minutos: 16,

    teoria: [
        { h: 'Los paréntesis escuchan eventos' },
        { p: 'Con paréntesis, el flujo se invierte: no entra un dato, **sale un evento**. Adentro va el nombre del evento y a la derecha lo que se ejecuta cuando ocurre:' },
        { codigo: "<button (click)=\"guardar()\">Guardar</button>\n<input (input)=\"alEscribir($event)\">\n<form (submit)=\"enviar()\">\n<div (mouseenter)=\"resaltar()\" (mouseleave)=\"quitar()\">", archivo: 'event binding' },
        { p: '**`$event`** es una variable especial con el dato del evento. En un evento del navegador contiene el objeto del evento; en un evento personalizado de un componente hijo, contiene lo que ese hijo mandó con `emit()`.' },
        { p: 'A la derecha del `=` no hace falta llamar a un método: también se puede escribir una expresión directa, como `(click)="contador = contador + 1"`.' },

        { h: 'Two-way binding: la banana en la caja' },
        { p: 'Cuando querés **leer y escribir el mismo valor**, se juntan los dos: corchetes y paréntesis, `[( )]`. Se le llama *banana in a box* por la forma. Su uso típico es `ngModel` en un formulario:' },
        { codigo: "<input [(ngModel)]=\"nombre\" placeholder=\"Tu nombre\">\n<p>Hola, {{ nombre }}</p>", archivo: 'ngModel' },
        { p: 'Lo que escribe el usuario actualiza `nombre`, y si `nombre` cambia desde el código, el campo se actualiza solo. Es exactamente lo mismo que escribir por separado:' },
        { codigo: "<input [ngModel]=\"nombre\" (ngModelChange)=\"nombre = $event\">", archivo: 'lo que hace por dentro' },
        { clave: '`ngModel` no viene solo: pertenece a **`FormsModule`**. Si te olvidás de importarlo, la consola muestra `NG0303: Can\'t bind to \'ngModel\' since it isn\'t a known property of \'input\'`. Es el error más común de los formularios.' },
        { nota: 'En un proyecto con módulos, `FormsModule` va en el array `imports` de `app.module.ts`. En uno standalone, va en el `imports` del **propio componente**. Es la misma idea que viste en el paso 3.' }
    ],

    consigna: [
        { p: 'Armá un contador y un campo de nombre que se actualiza en vivo:' },
        { numerada: [
            'El botón `#sumar` tiene que **sumar 1** a `valor` cada vez que se hace clic. Usá `(click)`.',
            'El botón `#reset` tiene que volver `valor` a **0**.',
            'El campo `#nombre` tiene que estar enlazado con `[(ngModel)]` a la propiedad `nombre`, y el párrafo `#saludo` tiene que mostrarlo.'
        ] },
        { p: 'Para que `ngModel` funcione, **importá `FormsModule`**: tanto en el `import` de arriba como en el array `imports` del componente.' }
    ],

    semilla: {
        'app/app.component.ts':
            "import { Component } from '@angular/core';\n\n" +
            "@Component({\n" +
            "  selector: 'app-root',\n" +
            "  standalone: true,\n" +
            "  template: `\n" +
            "    <p id=\"cuenta\">Valor: {{ valor }}</p>\n" +
            "    <button id=\"sumar\">+1</button>\n" +
            "    <button id=\"reset\">Reset</button>\n\n" +
            "    <input id=\"nombre\" placeholder=\"Tu nombre\">\n" +
            "    <p id=\"saludo\"></p>\n" +
            "  `\n" +
            "})\n" +
            "export class AppComponent {\n" +
            "  valor: number = 0;\n" +
            "  nombre: string = '';\n\n" +
            "  sumar(): void { this.valor++; }\n" +
            "  reiniciar(): void { this.valor = 0; }\n" +
            "}\n"
    },

    solucion: {
        'app/app.component.ts':
            "import { Component } from '@angular/core';\n" +
            "import { FormsModule } from '@angular/forms';\n\n" +
            "@Component({\n" +
            "  selector: 'app-root',\n" +
            "  standalone: true,\n" +
            "  imports: [FormsModule],\n" +
            "  template: `\n" +
            "    <p id=\"cuenta\">Valor: {{ valor }}</p>\n" +
            "    <button id=\"sumar\" (click)=\"sumar()\">+1</button>\n" +
            "    <button id=\"reset\" (click)=\"reiniciar()\">Reset</button>\n\n" +
            "    <input id=\"nombre\" [(ngModel)]=\"nombre\" placeholder=\"Tu nombre\">\n" +
            "    <p id=\"saludo\">{{ nombre }}</p>\n" +
            "  `\n" +
            "})\n" +
            "export class AppComponent {\n" +
            "  valor: number = 0;\n" +
            "  nombre: string = '';\n\n" +
            "  sumar(): void { this.valor++; }\n" +
            "  reiniciar(): void { this.valor = 0; }\n" +
            "}\n"
    },

    chequeos: [
        { fuente: { debeTener: [
            { re: "\\(\\s*click\\s*\\)\\s*=", que: 'Falta un (click) con paréntesis en los botones.' },
            { re: "\\[\\(\\s*ngModel\\s*\\)\\]", que: 'Falta [(ngModel)] en el campo de nombre. Los corchetes van por fuera de los paréntesis: [( )].' },
            { re: "FormsModule", que: 'Falta importar FormsModule, que es el que trae ngModel.' }
          ] } },
        { arranca: true },
        { sinErrores: true,
          pista: 'Si el error dice NG0303 con ngModel, falta agregar FormsModule al array imports del componente.' },
        { accion: { clic: '#sumar' } },
        { accion: { clic: '#sumar' } },
        { accion: { clic: '#sumar' } },
        { dom: { textos: { selector: '#cuenta', igual: ['Valor: 3'] } },
          pista: 'Después de 3 clics tiene que decir "Valor: 3". Revisá que el botón tenga (click)="sumar()", con paréntesis.' },
        { accion: { clic: '#reset' } },
        { dom: { textos: { selector: '#cuenta', igual: ['Valor: 0'] } },
          pista: 'El botón Reset tiene que volver el valor a 0. Llamá al método reiniciar().' },
        { accion: { escribir: ['#nombre', 'Lucía'] } },
        { dom: { textos: { selector: '#saludo', igual: ['Lucía'] } },
          pista: 'Lo que escribís en el campo tiene que aparecer en #saludo. Con [(ngModel)]="nombre" y {{ nombre }} se conecta solo.' }
    ]
},

/* ========================================================================== */
{
    id: 'p07',
    titulo: 'Directivas: *ngIf',
    minutos: 14,

    teoria: [
        { h: 'El asterisco' },
        { p: 'Hasta acá los bindings **cambiaban valores**. Las directivas estructurales hacen algo más fuerte: **crean o eliminan elementos del DOM**. Se reconocen por el asterisco.' },
        { clave: 'Un elemento con `*ngIf="false"` **no está escondido con CSS: directamente no existe** en la página. Si abrís el inspector, no lo vas a encontrar.' },
        { nota: 'Las mayúsculas importan: es `*ngIf`, con **I** mayúscula. Si lo escribís mal, Angular no lo ignora en silencio: por la Consola aparece `NG0303`. Pero **en pantalla no pasa nada**, y por eso es fácil pasarlo por alto.' },

        { h: '*ngIf' },
        { codigo: "<p *ngIf=\"mostrar\">Solo se ve si mostrar es true</p>\n<p *ngIf=\"nota >= 6\">APROBADO</p>\n<p *ngIf=\"turnos.length === 0\">No hay turnos para hoy</p>", archivo: 'ngIf' },
        { p: 'La condición es una **expresión de TypeScript**, igual que en un property binding. Si da un valor truthy, el elemento se crea; si no, se elimina.' },

        { h: 'Con else' },
        { codigo: "<p *ngIf=\"nota >= 6; else desaprobado\">APROBADO</p>\n\n<ng-template #desaprobado>\n  <p>DESAPROBADO</p>\n</ng-template>", archivo: 'ngIf con else' },
        { p: '`#desaprobado` es una **referencia de template**: le pone nombre a ese bloque para poder apuntarlo desde el `else`. Y `<ng-template>` **nunca se muestra por su cuenta**: solo aparece cuando algo lo invoca.' },

        { h: 'Los tres que se repiten en los parciales' },
        { lista: [
            '**Estado vacío:** `*ngIf="turnos.length === 0"` para mostrar "no hay nada" en lugar de una tabla vacía.',
            '**Cargando:** `*ngIf="cargando"` para mostrar un indicador mientras llegan datos.',
            '**Permisos:** `*ngIf="esAdmin"` para mostrar un botón solo a quien corresponde.'
        ] },
        { nota: '`*ngIf` necesita `NgIf`. Con módulos, `BrowserModule` ya lo trae. En un componente **standalone** hay que importarlo: `import { NgIf } from \'@angular/common\'` y agregarlo al array `imports` del componente.' }
    ],

    consigna: [
        { p: 'Mostrá el estado de una lista de turnos con `*ngIf`. Este componente es **standalone**, así que tenés que importar `NgIf` (arriba de todo y en el array `imports` del componente).' },
        { numerada: [
            'Si `turnos` está **vacío**, mostrá el párrafo con id `vacio` que dice `No hay turnos agendados.`',
            'Si `turnos` tiene elementos, mostrá la lista `<ul>` con id `lista`.',
            'Usá `*ngIf` con `else` y un `<ng-template>` para el caso vacío, en lugar de dos `*ngIf` separados.'
        ] },
        { p: 'Probalo: cambiá `turnos` de `[]` a `[\'Ana\', \'Luis\']` y mirá cómo se intercambian. Después dejalo como estaba.' }
    ],

    semilla: {
        'app/app.component.ts':
            "import { Component } from '@angular/core';\n\n" +
            "@Component({\n" +
            "  selector: 'app-root',\n" +
            "  standalone: true,\n" +
            "  template: `\n" +
            "    <h2>Turnos de hoy</h2>\n" +
            "    <ul id=\"lista\">\n" +
            "      <li>Ana Gómez</li>\n" +
            "      <li>Luis Pérez</li>\n" +
            "    </ul>\n" +
            "    <p id=\"vacio\">No hay turnos agendados.</p>\n" +
            "  `\n" +
            "})\n" +
            "export class AppComponent {\n" +
            "  turnos: string[] = [];\n" +
            "}\n"
    },

    solucion: {
        'app/app.component.ts':
            "import { Component } from '@angular/core';\n" +
            "import { NgIf } from '@angular/common';\n\n" +
            "@Component({\n" +
            "  selector: 'app-root',\n" +
            "  standalone: true,\n" +
            "  imports: [NgIf],\n" +
            "  template: `\n" +
            "    <h2>Turnos de hoy</h2>\n" +
            "    <ul id=\"lista\" *ngIf=\"turnos.length > 0; else sinTurnos\">\n" +
            "      <li>Ana Gómez</li>\n" +
            "      <li>Luis Pérez</li>\n" +
            "    </ul>\n" +
            "    <ng-template #sinTurnos>\n" +
            "      <p id=\"vacio\">No hay turnos agendados.</p>\n" +
            "    </ng-template>\n" +
            "  `\n" +
            "})\n" +
            "export class AppComponent {\n" +
            "  turnos: string[] = [];\n" +
            "}\n"
    },

    chequeos: [
        { fuente: { debeTener: [
            { re: "\\*ngIf", que: 'Falta el *ngIf, con I mayúscula y el asterisco adelante.' },
            { re: "else\\s+\\w+", que: 'Falta el else del *ngIf, apuntando a la referencia del <ng-template>.' },
            { re: "<ng-template\\s+#\\w+", que: 'Falta el <ng-template #nombre> con el mensaje de lista vacía.' },
            { re: "\\bNgIf\\b[^;]*from\\s*['\"]@angular/common['\"]", que: "Falta importar NgIf:  import { NgIf } from '@angular/common';" }
          ] } },
        { arranca: true },
        { sinErrores: true,
          pista: 'Si el error habla de ngIf, falta agregar NgIf al array imports del componente.' },
        { dom: { existe: { selector: '#vacio' } },
          pista: 'Con turnos vacío tiene que verse el párrafo "No hay turnos agendados.".' },
        { dom: { noExiste: { selector: '#lista' } },
          pista: 'Con turnos vacío la lista NO tiene que existir. El *ngIf tiene que eliminarla, no esconderla.' }
    ]
},

/* ========================================================================== */
{
    id: 'p08',
    titulo: 'Directivas: *ngFor',
    minutos: 16,

    teoria: [
        { h: 'Repetir un elemento por cada dato' },
        { p: '`*ngFor` toma un array y **crea una copia del elemento por cada valor**. Es la directiva que más vas a usar: cada lista, cada tabla, cada grilla de tarjetas sale de acá.' },
        { codigo: "<li *ngFor=\"let t of turnos\">{{ t.paciente }} - {{ t.hora }}</li>", archivo: 'ngFor' },
        { p: 'Se lee: "por cada `t` **de** `turnos`, repetí este `<li>`". La variable `t` es **temporal** y existe solo dentro de ese elemento.' },
        { nota: 'Es `*ngFor` con **F** mayúscula. Con `*ngfor` en minúscula Angular lo trata como un atributo cualquiera: no se genera nada en pantalla y, si no mirás la Consola, no hay ninguna pista.' },

        { h: 'El índice y otras variables' },
        { codigo: "<li *ngFor=\"let t of turnos; let i = index\">\n  {{ i + 1 }}. {{ t.paciente }}\n</li>\n\n<li *ngFor=\"let t of turnos; let primero = first; let ultimo = last\">\n  {{ t.paciente }} <span *ngIf=\"primero\">(el primero)</span>\n</li>", archivo: 'ngFor con index, first, last' },
        { p: 'El índice arranca en **0**, por eso se muestra `i + 1`. También están `first`, `last`, `even` y `odd`.' },

        { h: 'Un solo asterisco por elemento' },
        { p: 'No se pueden poner **dos directivas estructurales en el mismo elemento**. Esto **rompe la compilación**, con el mensaje `Can\'t have multiple template bindings on one element`:' },
        { codigo: "<li *ngFor=\"let t of turnos\" *ngIf=\"t.activo\">  <!-- ERROR -->", archivo: 'esto NO se puede' },
        { p: 'La solución es **envolver** con un `<ng-container>`, que agrupa sin generar HTML real:' },
        { codigo: "<ng-container *ngFor=\"let t of turnos\">\n  <li *ngIf=\"t.estado !== 'cancelado'\">{{ t.paciente }}</li>\n</ng-container>", archivo: 'ng-container' },
        { clave: '`<ng-container>` **no aparece en el HTML final**. Es solo un soporte para colgar una directiva. Si usaras un `<div>` en su lugar, agregarías un elemento de más a la página.' },
        { nota: 'Para usar `*ngFor` hay que importar `NgFor`, igual que `NgIf`.' }
    ],

    consigna: [
        { p: 'Mostrá los turnos como una lista numerada. Importá `NgFor` y `NgIf`.' },
        { numerada: [
            'Con `*ngFor`, creá un `<li>` por cada turno. Cada `<li>` tiene que mostrar **número, hora y paciente**, como `1. 09:00 - Ana Gómez`.',
            'Los turnos **cancelados** no se tienen que mostrar. Como no podés poner `*ngFor` y `*ngIf` juntos, usá un `<ng-container>`.'
        ] },
        { p: 'Vas a ver 2 elementos de los 3 turnos, porque uno está cancelado. **La numeración sigue al índice original**, así que el segundo turno visible es el tercero: `3. 11:00 - Sofía Ruiz`.' }
    ],

    semilla: {
        'app/app.component.ts':
            "import { Component } from '@angular/core';\n\n" +
            "interface Turno {\n" +
            "  id: number;\n" +
            "  paciente: string;\n" +
            "  hora: string;\n" +
            "  estado: 'pendiente' | 'confirmado' | 'cancelado';\n" +
            "}\n\n" +
            "@Component({\n" +
            "  selector: 'app-root',\n" +
            "  standalone: true,\n" +
            "  template: `\n" +
            "    <h2>Turnos de hoy</h2>\n" +
            "    <ul id=\"lista\">\n" +
            "      <!-- Un <li> por cada turno -->\n" +
            "    </ul>\n" +
            "  `\n" +
            "})\n" +
            "export class AppComponent {\n" +
            "  turnos: Turno[] = [\n" +
            "    { id: 1, paciente: 'Ana Gómez', hora: '09:00', estado: 'pendiente' },\n" +
            "    { id: 2, paciente: 'Luis Pérez', hora: '10:30', estado: 'cancelado' },\n" +
            "    { id: 3, paciente: 'Sofía Ruiz', hora: '11:00', estado: 'confirmado' }\n" +
            "  ];\n" +
            "}\n"
    },

    solucion: {
        'app/app.component.ts':
            "import { Component } from '@angular/core';\n" +
            "import { NgFor, NgIf } from '@angular/common';\n\n" +
            "interface Turno {\n" +
            "  id: number;\n" +
            "  paciente: string;\n" +
            "  hora: string;\n" +
            "  estado: 'pendiente' | 'confirmado' | 'cancelado';\n" +
            "}\n\n" +
            "@Component({\n" +
            "  selector: 'app-root',\n" +
            "  standalone: true,\n" +
            "  imports: [NgFor, NgIf],\n" +
            "  template: `\n" +
            "    <h2>Turnos de hoy</h2>\n" +
            "    <ul id=\"lista\">\n" +
            "      <ng-container *ngFor=\"let t of turnos; let i = index\">\n" +
            "        <li *ngIf=\"t.estado !== 'cancelado'\">{{ i + 1 }}. {{ t.hora }} - {{ t.paciente }}</li>\n" +
            "      </ng-container>\n" +
            "    </ul>\n" +
            "  `\n" +
            "})\n" +
            "export class AppComponent {\n" +
            "  turnos: Turno[] = [\n" +
            "    { id: 1, paciente: 'Ana Gómez', hora: '09:00', estado: 'pendiente' },\n" +
            "    { id: 2, paciente: 'Luis Pérez', hora: '10:30', estado: 'cancelado' },\n" +
            "    { id: 3, paciente: 'Sofía Ruiz', hora: '11:00', estado: 'confirmado' }\n" +
            "  ];\n" +
            "}\n"
    },

    chequeos: [
        { fuente: { debeTener: [
            { re: "\\*ngFor\\s*=\\s*[\"']let\\s+\\w+\\s+of\\s+turnos", que: 'Falta el *ngFor="let t of turnos", con F mayúscula.' },
            { re: "<ng-container", que: 'Falta el <ng-container> para poder combinar *ngFor con *ngIf.' },
            { re: "\\bNgFor\\b[^;]*from\\s*['\"]@angular/common['\"]|import\\s*\\{[^}]*NgFor[^}]*\\}\\s*from\\s*['\"]@angular/common['\"]", que: "Falta importar NgFor:  import { NgFor } from '@angular/common';" }
          ],
          noDebeTener: [
            { re: "<li[^>]*\\*ngFor[^>]*\\*ngIf|<li[^>]*\\*ngIf[^>]*\\*ngFor", que: 'Hay *ngFor y *ngIf en el mismo <li>. No se puede: envolvelo con un <ng-container>.' }
          ] } },
        { arranca: true },
        { sinErrores: true,
          pista: 'Si el error habla de ngForOf, falta agregar NgFor al array imports del componente, o escribiste *ngfor con la f minúscula.' },
        { dom: { contar: { selector: '#lista li', es: 2 } },
          pista: 'Tienen que verse 2 turnos: el cancelado no se muestra. Revisá el *ngIf="t.estado !== \'cancelado\'".' },
        { dom: { textos: { selector: '#lista li', igual: ['1. 09:00 - Ana Gómez', '3. 11:00 - Sofía Ruiz'] } },
          pista: 'Cada <li> tiene que decir "número. hora - paciente". El número es i + 1, con let i = index.' }
    ]
},

/* ========================================================================== */
{
    id: 'p09',
    titulo: 'ngClass y ngStyle',
    minutos: 14,

    teoria: [
        { h: 'Cambiar el aspecto sin crear ni destruir' },
        { p: '`*ngIf` y `*ngFor` crean o eliminan elementos. `ngClass` y `ngStyle` son distintas: **el elemento siempre existe** y solo cambia su apariencia. Por eso van con **corchetes** (property binding), no con asterisco.' },
        { tabla: {
            cabeceras: ['', 'Con asterisco', 'Con corchetes'],
            filas: [
                ['Ejemplo', '`*ngIf`, `*ngFor`', '`[ngClass]`, `[ngStyle]`'],
                ['Qué hacen', 'Crean o destruyen elementos', 'Cambian la apariencia del elemento']
            ]
        } },

        { h: 'ngClass' },
        { p: 'Recibe una expresión y **agrega o quita clases CSS** según su valor. Tiene cuatro formas:' },
        { codigo: "<!-- una clase condicional -->\n<div [ngClass]=\"{ 'activo': estaActivo }\">...</div>\n\n<!-- elegir entre dos -->\n<p [ngClass]=\"aprobado ? 'verde' : 'rojo'\">...</p>\n\n<!-- la clase sale del valor de una variable -->\n<div [ngClass]=\"tipo\">...</div>\n\n<!-- varias a la vez -->\n<div [ngClass]=\"{ 'activo': estaActivo, 'destacado': esVip }\">...</div>", archivo: 'ngClass' },
        { p: 'La forma del objeto se lee: "**la clase** `activo` **se aplica si** `estaActivo` es verdadero". Las claves son nombres de clase; los valores son las condiciones.' },

        { h: 'ngStyle' },
        { p: 'Lo mismo pero con **estilos en línea**, cuando el valor viene de una variable y no alcanza con una clase fija:' },
        { codigo: "<div [ngStyle]=\"{ 'color': aprobado ? 'green' : 'red' }\">...</div>", archivo: 'ngStyle' },
        { clave: 'Siempre que puedas, preferí **`ngClass` con una clase en el CSS**. Los estilos en línea con `ngStyle` se reservan para valores que **calculás** (un ancho en porcentaje, un color que viene de los datos).' },
        { nota: 'Los estilos de un componente **solo afectan a ese componente**. Están encapsulados: una clase `.verde` que definís en un componente no se aplica a otro.' }
    ],

    consigna: [
        { p: 'Pintá cada turno según su estado. Importá `NgFor` y `NgClass`.' },
        { numerada: [
            'Cada `<li>` de la lista `#lista` tiene que llevar, con `[ngClass]`, la clase que **coincida con el estado** del turno (`pendiente`, `confirmado` o `cancelado`). Se hace con `[ngClass]="t.estado"`.',
            'En el párrafo `#resumen`, con `[ngStyle]`, poné el color en **`green`** si hay más confirmados que cancelados, y en **`red`** si no. Usá el `get hayMasConfirmados` que ya está en la clase.'
        ] },
        { nota: 'Los estilos de cada estado ya están definidos en la propiedad `styles`. Solo tenés que aplicar la clase correcta.' }
    ],

    semilla: {
        'app/app.component.ts':
            "import { Component } from '@angular/core';\n\n" +
            "interface Turno {\n" +
            "  id: number;\n" +
            "  paciente: string;\n" +
            "  estado: 'pendiente' | 'confirmado' | 'cancelado';\n" +
            "}\n\n" +
            "@Component({\n" +
            "  selector: 'app-root',\n" +
            "  standalone: true,\n" +
            "  template: `\n" +
            "    <ul id=\"lista\">\n" +
            "      <li>Falta el ngFor</li>\n" +
            "    </ul>\n" +
            "    <p id=\"resumen\">Resumen del día</p>\n" +
            "  `,\n" +
            "  styles: `\n" +
            "    .pendiente  { background: #fff3cd; }\n" +
            "    .confirmado { background: #d4edda; }\n" +
            "    .cancelado  { background: #f8d7da; text-decoration: line-through; }\n" +
            "  `\n" +
            "})\n" +
            "export class AppComponent {\n" +
            "  turnos: Turno[] = [\n" +
            "    { id: 1, paciente: 'Ana Gómez', estado: 'pendiente' },\n" +
            "    { id: 2, paciente: 'Luis Pérez', estado: 'confirmado' },\n" +
            "    { id: 3, paciente: 'Sofía Ruiz', estado: 'confirmado' },\n" +
            "    { id: 4, paciente: 'Marcos Díaz', estado: 'cancelado' }\n" +
            "  ];\n\n" +
            "  get hayMasConfirmados(): boolean {\n" +
            "    const c = this.turnos.filter(t => t.estado === 'confirmado').length;\n" +
            "    const x = this.turnos.filter(t => t.estado === 'cancelado').length;\n" +
            "    return c > x;\n" +
            "  }\n" +
            "}\n"
    },

    solucion: {
        'app/app.component.ts':
            "import { Component } from '@angular/core';\n" +
            "import { NgFor, NgClass, NgStyle } from '@angular/common';\n\n" +
            "interface Turno {\n" +
            "  id: number;\n" +
            "  paciente: string;\n" +
            "  estado: 'pendiente' | 'confirmado' | 'cancelado';\n" +
            "}\n\n" +
            "@Component({\n" +
            "  selector: 'app-root',\n" +
            "  standalone: true,\n" +
            "  imports: [NgFor, NgClass, NgStyle],\n" +
            "  template: `\n" +
            "    <ul id=\"lista\">\n" +
            "      <li *ngFor=\"let t of turnos\" [ngClass]=\"t.estado\">{{ t.paciente }}</li>\n" +
            "    </ul>\n" +
            "    <p id=\"resumen\" [ngStyle]=\"{ 'color': hayMasConfirmados ? 'green' : 'red' }\">Resumen del día</p>\n" +
            "  `,\n" +
            "  styles: `\n" +
            "    .pendiente  { background: #fff3cd; }\n" +
            "    .confirmado { background: #d4edda; }\n" +
            "    .cancelado  { background: #f8d7da; text-decoration: line-through; }\n" +
            "  `\n" +
            "})\n" +
            "export class AppComponent {\n" +
            "  turnos: Turno[] = [\n" +
            "    { id: 1, paciente: 'Ana Gómez', estado: 'pendiente' },\n" +
            "    { id: 2, paciente: 'Luis Pérez', estado: 'confirmado' },\n" +
            "    { id: 3, paciente: 'Sofía Ruiz', estado: 'confirmado' },\n" +
            "    { id: 4, paciente: 'Marcos Díaz', estado: 'cancelado' }\n" +
            "  ];\n\n" +
            "  get hayMasConfirmados(): boolean {\n" +
            "    const c = this.turnos.filter(t => t.estado === 'confirmado').length;\n" +
            "    const x = this.turnos.filter(t => t.estado === 'cancelado').length;\n" +
            "    return c > x;\n" +
            "  }\n" +
            "}\n"
    },

    chequeos: [
        { fuente: { debeTener: [
            { re: "\\[\\s*ngClass\\s*\\]\\s*=", que: 'Falta [ngClass] con corchetes: ngClass es un property binding, no una directiva con asterisco.' },
            { re: "\\[\\s*ngStyle\\s*\\]\\s*=", que: 'Falta [ngStyle] con corchetes en el párrafo del resumen.' },
            { re: "\\*ngFor", que: 'Falta el *ngFor que crea un <li> por cada turno.' }
          ] } },
        { arranca: true },
        { sinErrores: true,
          pista: 'Si el error habla de ngClass o ngStyle, falta agregarlos al array imports del componente.' },
        { dom: { contar: { selector: '#lista li', es: 4 } },
          pista: 'Tienen que verse 4 turnos, uno por cada elemento del array.' },
        { dom: { contar: { selector: '#lista li.confirmado', es: 2 } },
          pista: 'Los 2 turnos confirmados tienen que llevar la clase "confirmado". Usá [ngClass]="t.estado".' },
        { dom: { contar: { selector: '#lista li.cancelado', es: 1 } },
          pista: 'El turno cancelado tiene que llevar la clase "cancelado".' },
        { dom: { atributo: { selector: '#resumen', nombre: 'style', igual: 'color: green;' } },
          pista: 'Hay 2 confirmados contra 1 cancelado: el resumen tiene que estar en verde. [ngStyle]="{ \'color\': hayMasConfirmados ? \'green\' : \'red\' }".' }
    ]
},

/* ========================================================================== */
{
    id: 'p10',
    titulo: 'Desafío: la agenda de turnos',
    minutos: 22,

    teoria: [
        { h: 'Todo junto' },
        { p: 'Este paso no trae teoría nueva. Trae un problema real donde tenés que **decidir qué herramienta va en cada lugar**. Es del nivel de un ejercicio de parcial.' },
        { p: 'Antes de escribir código, mirá cada requisito y preguntate: ¿es un **dato que se muestra**, un **dato que se pasa a una propiedad**, un **evento**, o algo que **aparece o desaparece**?' },
        { tabla: {
            cabeceras: ['Si el requisito es...', 'Se usa...'],
            filas: [
                ['Mostrar un valor', '`{{ interpolación }}`'],
                ['Pasar un dato a una propiedad (`disabled`, `src`)', '`[propiedad]="valor"`'],
                ['Reaccionar a un clic', '`(click)="metodo()"`'],
                ['Leer y escribir un campo del formulario', '`[(ngModel)]`'],
                ['Que algo aparezca o desaparezca', '`*ngIf`'],
                ['Repetir algo por cada elemento', '`*ngFor`'],
                ['Cambiar la apariencia', '`[ngClass]` / `[ngStyle]`']
            ]
        } },
        { clave: 'La pregunta que ordena todo: **¿es un dato o es un evento?** Los datos bajan con corchetes; los eventos suben con paréntesis.' },

        { h: 'Errores que te van a costar puntos' },
        { lista: [
            '`disabled="false"` sin corchetes: el texto `"false"` es truthy, el botón queda deshabilitado.',
            '`*ngfor` con la f minúscula: no se muestra nada.',
            '`*ngFor` y `*ngIf` en el mismo elemento: no compila.',
            'Olvidar `FormsModule` con `ngModel`: `NG0303`.',
            'Usar `this.` dentro del template: en el template se escribe `turnos`, no `this.turnos`.'
        ] }
    ],

    consigna: [
        { p: 'Armá la **agenda del día** de un consultorio. Importá `NgFor`, `NgIf`, `NgClass` y `FormsModule`.' },
        { numerada: [
            'Un campo de texto `#filtro` con `[(ngModel)]="filtro"` que **filtra los turnos por nombre** mientras escribís. Usá el `get turnosFiltrados` que ya está en la clase.',
            'Una lista `#lista` con un `<li>` por cada turno **filtrado**, mostrando `hora - paciente`, con la **clase del estado** (`[ngClass]`).',
            'Si el filtro no encuentra a nadie, mostrá el párrafo `#vacio` con **`Sin resultados`** (`*ngIf`). Si hay resultados, ese párrafo **no tiene que existir**.',
            'Un contador `#total` que diga **`Turnos: N`**, con la cantidad de turnos filtrados (interpolación).',
            'Un botón `#limpiar`, **deshabilitado cuando el filtro está vacío** (`[disabled]`), que al hacer clic **vacíe el filtro** (`(click)`).'
        ] },
        { nota: 'Son cinco requisitos y usa **cinco herramientas distintas**. Antes de escribir, asigná cada una. Si dos te parecen lo mismo, releé la tabla de la teoría.' }
    ],

    semilla: {
        'app/app.component.ts':
            "import { Component } from '@angular/core';\n\n" +
            "interface Turno {\n" +
            "  id: number;\n" +
            "  paciente: string;\n" +
            "  hora: string;\n" +
            "  estado: 'pendiente' | 'confirmado' | 'cancelado';\n" +
            "}\n\n" +
            "@Component({\n" +
            "  selector: 'app-root',\n" +
            "  standalone: true,\n" +
            "  template: `\n" +
            "    <h2>Agenda del día</h2>\n" +
            "    <!-- Armá acá los cinco requisitos -->\n" +
            "  `,\n" +
            "  styles: `\n" +
            "    .pendiente  { background: #fff3cd; }\n" +
            "    .confirmado { background: #d4edda; }\n" +
            "    .cancelado  { background: #f8d7da; text-decoration: line-through; }\n" +
            "  `\n" +
            "})\n" +
            "export class AppComponent {\n" +
            "  filtro: string = '';\n\n" +
            "  turnos: Turno[] = [\n" +
            "    { id: 1, paciente: 'Ana Gómez', hora: '09:00', estado: 'pendiente' },\n" +
            "    { id: 2, paciente: 'Luis Pérez', hora: '10:30', estado: 'confirmado' },\n" +
            "    { id: 3, paciente: 'Sofía Ruiz', hora: '11:00', estado: 'confirmado' },\n" +
            "    { id: 4, paciente: 'Marcos Díaz', hora: '12:15', estado: 'cancelado' }\n" +
            "  ];\n\n" +
            "  get turnosFiltrados(): Turno[] {\n" +
            "    return this.turnos.filter(t =>\n" +
            "      t.paciente.toLowerCase().includes(this.filtro.toLowerCase())\n" +
            "    );\n" +
            "  }\n\n" +
            "  limpiar(): void {\n" +
            "    this.filtro = '';\n" +
            "  }\n" +
            "}\n"
    },

    solucion: {
        'app/app.component.ts':
            "import { Component } from '@angular/core';\n" +
            "import { NgFor, NgIf, NgClass } from '@angular/common';\n" +
            "import { FormsModule } from '@angular/forms';\n\n" +
            "interface Turno {\n" +
            "  id: number;\n" +
            "  paciente: string;\n" +
            "  hora: string;\n" +
            "  estado: 'pendiente' | 'confirmado' | 'cancelado';\n" +
            "}\n\n" +
            "@Component({\n" +
            "  selector: 'app-root',\n" +
            "  standalone: true,\n" +
            "  imports: [NgFor, NgIf, NgClass, FormsModule],\n" +
            "  template: `\n" +
            "    <h2>Agenda del día</h2>\n\n" +
            "    <input id=\"filtro\" [(ngModel)]=\"filtro\" placeholder=\"Buscar paciente...\">\n" +
            "    <button id=\"limpiar\" [disabled]=\"filtro.length === 0\" (click)=\"limpiar()\">Limpiar</button>\n\n" +
            "    <p id=\"total\">Turnos: {{ turnosFiltrados.length }}</p>\n\n" +
            "    <ul id=\"lista\">\n" +
            "      <li *ngFor=\"let t of turnosFiltrados\" [ngClass]=\"t.estado\">{{ t.hora }} - {{ t.paciente }}</li>\n" +
            "    </ul>\n\n" +
            "    <p id=\"vacio\" *ngIf=\"turnosFiltrados.length === 0\">Sin resultados</p>\n" +
            "  `,\n" +
            "  styles: `\n" +
            "    .pendiente  { background: #fff3cd; }\n" +
            "    .confirmado { background: #d4edda; }\n" +
            "    .cancelado  { background: #f8d7da; text-decoration: line-through; }\n" +
            "  `\n" +
            "})\n" +
            "export class AppComponent {\n" +
            "  filtro: string = '';\n\n" +
            "  turnos: Turno[] = [\n" +
            "    { id: 1, paciente: 'Ana Gómez', hora: '09:00', estado: 'pendiente' },\n" +
            "    { id: 2, paciente: 'Luis Pérez', hora: '10:30', estado: 'confirmado' },\n" +
            "    { id: 3, paciente: 'Sofía Ruiz', hora: '11:00', estado: 'confirmado' },\n" +
            "    { id: 4, paciente: 'Marcos Díaz', hora: '12:15', estado: 'cancelado' }\n" +
            "  ];\n\n" +
            "  get turnosFiltrados(): Turno[] {\n" +
            "    return this.turnos.filter(t =>\n" +
            "      t.paciente.toLowerCase().includes(this.filtro.toLowerCase())\n" +
            "    );\n" +
            "  }\n\n" +
            "  limpiar(): void {\n" +
            "    this.filtro = '';\n" +
            "  }\n" +
            "}\n"
    },

    chequeos: [
        { fuente: { debeTener: [
            { re: "\\[\\(\\s*ngModel\\s*\\)\\]", que: 'Falta [(ngModel)] en el campo de filtro.' },
            { re: "\\*ngFor", que: 'Falta el *ngFor de la lista.' },
            { re: "\\*ngIf", que: 'Falta el *ngIf del mensaje "Sin resultados".' },
            { re: "\\[\\s*ngClass\\s*\\]", que: 'Falta [ngClass] para pintar cada turno según su estado.' },
            { re: "\\[\\s*disabled\\s*\\]", que: 'Falta [disabled] con corchetes en el botón Limpiar.' },
            { re: "\\(\\s*click\\s*\\)", que: 'Falta el (click) en el botón Limpiar.' }
          ],
          noDebeTener: [
            { re: "this\\.[A-Za-z]+[^`]*`\\s*,\\s*styles|template:\\s*`[^`]*\\{\\{\\s*this\\.", que: 'Adentro del template no se escribe this. Se escribe turnosFiltrados, no this.turnosFiltrados.' }
          ] } },
        { arranca: true },
        { sinErrores: true,
          pista: 'Si el error habla de ngModel, falta FormsModule; si habla de ngForOf, ngIf o ngClass, falta agregarlos al array imports.' },

        /* Estado inicial: sin filtro */
        { dom: { contar: { selector: '#lista li', es: 4 } },
          pista: 'Sin filtro tienen que verse los 4 turnos.' },
        { dom: { textos: { selector: '#total', igual: ['Turnos: 4'] } },
          pista: 'El contador tiene que decir "Turnos: 4". Usá {{ turnosFiltrados.length }}.' },
        { dom: { noExiste: { selector: '#vacio' } },
          pista: 'Hay resultados, así que el párrafo "Sin resultados" NO tiene que existir.' },
        { dom: { propiedad: { selector: '#limpiar', nombre: 'disabled', igual: true } },
          pista: 'Con el filtro vacío el botón Limpiar tiene que estar deshabilitado: [disabled]="filtro.length === 0".' },
        { dom: { contar: { selector: '#lista li.confirmado', es: 2 } },
          pista: 'Los 2 turnos confirmados tienen que llevar la clase "confirmado".' },

        /* Filtro que encuentra a alguien */
        { accion: { escribir: ['#filtro', 'ana'] } },
        { dom: { textos: { selector: '#lista li', igual: ['09:00 - Ana Gómez'] } },
          pista: 'Al escribir "ana" tiene que quedar solo "09:00 - Ana Gómez". La lista tiene que recorrer turnosFiltrados, no turnos.' },
        { dom: { textos: { selector: '#total', igual: ['Turnos: 1'] } },
          pista: 'El contador tiene que actualizarse: "Turnos: 1".' },
        { dom: { propiedad: { selector: '#limpiar', nombre: 'disabled', igual: false } },
          pista: 'Con texto en el filtro el botón Limpiar tiene que quedar habilitado.' },

        /* Filtro sin resultados */
        { accion: { escribir: ['#filtro', 'zzz'] } },
        { dom: { existe: { selector: '#vacio' } },
          pista: 'Si nadie coincide tiene que aparecer el párrafo "Sin resultados".' },
        { dom: { textos: { selector: '#vacio', igual: ['Sin resultados'] } } },
        { dom: { contar: { selector: '#lista li', es: 0 } },
          pista: 'Sin resultados no tiene que haber ningún <li>.' },

        /* El botón limpia el filtro */
        { accion: { clic: '#limpiar' } },
        { dom: { contar: { selector: '#lista li', es: 4 } },
          pista: 'Al hacer clic en Limpiar el filtro se vacía y vuelven los 4 turnos. Llamá a limpiar() en el (click).' },
        { dom: { noExiste: { selector: '#vacio' } },
          pista: 'Después de limpiar, "Sin resultados" tiene que desaparecer.' }
    ]
}

];
