CONTENIDO.ministore = [];

(function () {
    'use strict';

    /* ------------------------------------------------------------------------
     * Archivos del proyecto
     * ---------------------------------------------------------------------- */

    function C(t) { return t.replace(/^\n/, ''); }

    function imp(nombre, modulo) {
        return 'import\\s*\\{[^}]*\\b' + nombre + '\\b[^}]*\\}\\s*from\\s*.' + modulo;
    }

    var RUTA = {
        config: 'app/app.config.ts',
        rutas: 'app/app.routes.ts',
        appTs: 'app/app.component.ts',
        appHtml: 'app/app.component.html',
        appCss: 'app/app.component.css',
        producto: 'app/core/models/product.interface.ts',
        respuesta: 'app/core/models/products-response.interface.ts',
        servicio: 'app/core/services/product.service.ts',
        paginaTs: 'app/features/products/pages/products-page/products-page.component.ts',
        paginaHtml: 'app/features/products/pages/products-page/products-page.component.html',
        paginaCss: 'app/features/products/pages/products-page/products-page.component.css',
        tarjetaTs: 'app/features/products/components/product-card/product-card.component.ts',
        tarjetaHtml: 'app/features/products/components/product-card/product-card.component.html',
        tarjetaCss: 'app/features/products/components/product-card/product-card.component.css',
        listaTs: 'app/features/products/components/product-list/product-list.component.ts',
        listaCss: 'app/features/products/components/product-list/product-list.component.css'
    };

    var CONFIG = C(`
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
  ]
};
`);

    var CONFIG_SIN_HTTP = C(`
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
  ]
};
`);

    var RUTAS = C(`
import { Routes } from '@angular/router';

export const routes: Routes = [];
`);

    var APP_TS = C(`
import { Component } from '@angular/core';
import { ProductsPageComponent } from './features/products/pages/products-page/products-page.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ProductsPageComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {}
`);

    var APP_TS_NG_NEW = C(`
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'ministore';
}
`);

    var APP_HTML = '<app-products-page />\n';
    var APP_HTML_NG_NEW = '<router-outlet />\n';

    var PRODUCTO = C(`
export interface Product {
  id: number;
  title: string;
  price: number;
  rating: number;
  thumbnail: string;
}
`);

    var RESPUESTA = C(`
import { Product } from './product.interface';

export interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}
`);

    var SERVICIO = C(`
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductsResponse } from '../models/products-response.interface';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://dummyjson.com/products';

  getProducts(limit: number, skip: number): Observable<ProductsResponse> {
    return this.http.get<ProductsResponse>(
      \`\${this.apiUrl}?limit=\${limit}&skip=\${skip}\`
    );
  }
}
`);

    var TARJETA_TS = C(`
import { Component, Input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Product } from '../../../../core/models/product.interface';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
}
`);

    var TARJETA_HTML = C(`
<article class="card">
  <img [src]="product.thumbnail" [alt]="product.title" />

  <h3 class="card__title">{{ product.title }}</h3>

  <p class="card__price">{{ product.price | currency }}</p>
  <span class="card__rating">★ {{ product.rating }}</span>
</article>
`);

    var TARJETA_CSS = C(`
.card {
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  overflow: hidden;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.card img {
  height: 160px;
  object-fit: contain;
  background: #f3f4f6;
}

.card__title  { margin: 0.9rem 1rem 0; font-size: 1rem; }
.card__price  { margin: 0.4rem 1rem;   font-weight: 700; }
.card__rating { margin: 0 1rem 1rem;   color: #f59e0b; font-size: 0.85rem; }
`);

    var TARJETA_TS_VACIA = C(`
import { Component } from '@angular/core';

@Component({
  selector: 'app-product-card',
  standalone: true,
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
})
export class ProductCardComponent {
}
`);

    var LISTA_TS = C(`
import { Component, Input } from '@angular/core';
import { Product } from '../../../../core/models/product.interface';
import { ProductCardComponent } from '../product-card/product-card.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [ProductCardComponent],
  template: \`
    <div class="grid">
      @for (product of products; track product.id) {
        <app-product-card [product]="product" />
      }
    </div>
  \`,
  styleUrl: './product-list.component.css',
})
export class ProductListComponent {
  @Input({ required: true }) products: Product[] = [];
}
`);

    var LISTA_CSS = C(`
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.25rem;
  padding: 1.5rem;
  max-width: 1100px;
  margin: 0 auto;
}
`);

    var PAGINA_TS = C(`
import { Component, OnInit, inject, signal } from '@angular/core';

import { Product } from '../../../../core/models/product.interface';
import { ProductService } from '../../../../core/services/product.service';
import { ProductListComponent } from '../../components/product-list/product-list.component';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [ProductListComponent],
  templateUrl: './products-page.component.html',
  styleUrl: './products-page.component.css',
})
export class ProductsPageComponent implements OnInit {
  private readonly productService = inject(ProductService);

  readonly products = signal<Product[]>([]);
  readonly loading = signal(false);

  ngOnInit(): void {
    this.loading.set(true);

    this.productService.getProducts(12, 0).subscribe({
      next: (response) => {
        this.products.set(response.products);
        this.loading.set(false);
      },
    });
  }
}
`);

    var PAGINA_TS_VACIA = C(`
import { Component } from '@angular/core';

@Component({
  selector: 'app-products-page',
  standalone: true,
  templateUrl: './products-page.component.html',
  styleUrl: './products-page.component.css',
})
export class ProductsPageComponent {
}
`);

    var PAGINA_HTML = C(`
@if (loading()) {
  <p class="loading">Cargando productos…</p>
} @else {
  <app-product-list [products]="products()" />
}
`);

    var PAGINA_CSS = C(`
.loading {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}
`);

    var BASE = {
        RUTA: RUTA, C: C, imp: imp,
        CONFIG: CONFIG, RUTAS: RUTAS, APP_TS: APP_TS, APP_HTML: APP_HTML,
        PRODUCTO: PRODUCTO, RESPUESTA: RESPUESTA, SERVICIO: SERVICIO,
        TARJETA_TS: TARJETA_TS, TARJETA_HTML: TARJETA_HTML, TARJETA_CSS: TARJETA_CSS,
        LISTA_TS: LISTA_TS, LISTA_CSS: LISTA_CSS,
        PAGINA_TS: PAGINA_TS, PAGINA_HTML: PAGINA_HTML, PAGINA_CSS: PAGINA_CSS
    };
    window.MiniStoreBase = BASE;

    function proyecto(extra, quitar) {
        var p = {};
        p[RUTA.config] = CONFIG;
        p[RUTA.rutas] = RUTAS;
        p[RUTA.appTs] = APP_TS;
        p[RUTA.appHtml] = APP_HTML;
        p[RUTA.appCss] = '';
        p[RUTA.producto] = PRODUCTO;
        p[RUTA.respuesta] = RESPUESTA;
        p[RUTA.servicio] = SERVICIO;
        p[RUTA.paginaTs] = PAGINA_TS;
        p[RUTA.paginaHtml] = PAGINA_HTML;
        p[RUTA.paginaCss] = PAGINA_CSS;
        p[RUTA.tarjetaTs] = TARJETA_TS;
        p[RUTA.tarjetaHtml] = TARJETA_HTML;
        p[RUTA.tarjetaCss] = TARJETA_CSS;
        p[RUTA.listaTs] = LISTA_TS;
        p[RUTA.listaCss] = LISTA_CSS;
        Object.keys(extra || {}).forEach(function (k) { p[k] = extra[k]; });
        (quitar || []).forEach(function (k) { delete p[k]; });
        return p;
    }

    var pasos = [

    /* ------------------------------------------------------------------------
     * Ideas
     * ---------------------------------------------------------------------- */

{
    id: 'p01',
    titulo: 'Qué es una API y cómo se lee un JSON',
    minutos: 14,
    abrir: RUTA.appHtml,

    teoria: [
        { h: 'Entender antes de escribir' },
        { p: 'Hasta ahora todos los datos de tus aplicaciones estaban escritos a mano adentro del componente. En una aplicación real los datos viven en **un servidor**, y tu aplicación se los **pide**. Ese servidor ofrece una **API**: un conjunto de direcciones a las que se les puede pedir información.' },
        { clave: 'Una API es como el **mozo de un restaurante**. Vos no entrás a la cocina: le pedís al mozo lo que querés, él lo busca y te lo trae en un formato que entendés. Tu aplicación no entra a la base de datos: le pide los productos a la API, y la API responde.' },

        { h: 'Un pedido y una respuesta' },
        { p: 'Toda comunicación con una API es un **pedido** (request) y una **respuesta** (response). El pedido lleva una **URL** (a dónde) y un **método** (qué querés hacer). Para pedir datos se usa `GET`.' },
        { codigo: 'GET https://dummyjson.com/products/1', archivo: 'un pedido: método + URL' },
        { p: 'La URL se lee de a partes: `https://dummyjson.com` es el servidor, `/products` es el **endpoint** (el recurso: los productos) y `/1` elige el producto con id 1. La respuesta trae además un **código de estado**:' },
        { tabla: {
            cabeceras: ['Código', 'Significa', 'Ejemplo'],
            filas: [
                ['`200`', 'Salió bien', 'El producto existe y llegó'],
                ['`404`', 'No existe lo que pediste', '`/products/999`, o un endpoint mal escrito'],
                ['`500`', 'Falló el servidor', 'Un error del lado de la API'],
                ['`0`', 'Ni siquiera hubo respuesta', 'Sin conexión a internet']
            ]
        } },

        { h: 'JSON: el idioma de las respuestas' },
        { p: 'Las APIs responden en **JSON**, un texto que se parece a un objeto de JavaScript. Tiene objetos `{ }`, arrays `[ ]`, textos, números y booleanos, y se pueden anidar unos adentro de otros.' },
        { codigo: C(`
{
  "id": 1,
  "title": "Essence Mascara Lash Princess",
  "price": 18.85,
  "tags": ["beauty", "mascara"],
  "dimensions": { "width": 7.5, "height": 12 }
}
`), archivo: 'la respuesta de /products/1, recortada' },
        { lista: [
            'Para llegar a un dato de un **objeto** se usa el punto: `producto.title`.',
            'Para llegar a un elemento de un **array** se usa el índice, que arranca en 0: `producto.tags[0]`.',
            'Los objetos anidados se recorren encadenando puntos: `producto.dimensions.width`.',
            'La cantidad de elementos de un array está en `length`: `producto.tags.length`.'
        ] },
        { nota: 'Una respuesta suele traer **muchos más datos de los que necesitás**. Saber leer un JSON es saber encontrar en él los pocos campos que te sirven.' },
        { p: 'Para que puedas practicar sin conexión, en esta clase la API está **simulada** dentro de la pantalla, con los mismos endpoints, el mismo formato de respuesta y la misma URL de `dummyjson.com`. El código que escribas sirve igual contra la API real.' }
    ],

    consigna: [
        { p: 'El componente ya tiene un `producto` con la forma de una respuesta real. Mostrá sus datos en `app.component.html`, uno en cada párrafo:' },
        { numerada: [
            '`#titulo`: el título del producto.',
            '`#precio`: el precio.',
            '`#marca`: la marca.',
            '`#etiqueta`: la **primera** etiqueta, `tags[0]`.',
            '`#imagenes`: **cuántas** imágenes tiene, con `length`.',
            '`#ancho`: el ancho, que está adentro de `dimensions`.'
        ] }
    ],

    semilla: proyecto({
        'app/app.component.ts': C(`
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
})
export class AppComponent {
  producto = {
    id: 1,
    title: 'Essence Mascara Lash Princess',
    price: 18.85,
    rating: 4.29,
    brand: 'Essence',
    tags: ['beauty', 'mascara'],
    images: ['frente.png', 'perfil.png', 'caja.png'],
    dimensions: { width: 7.5, height: 12 },
  };
}
`),
        'app/app.component.html': C(`
<h1 id="titulo"></h1>
<p id="precio"></p>
<p id="marca"></p>
<p id="etiqueta"></p>
<p id="imagenes"></p>
<p id="ancho"></p>
`)
    }),

    solucion: {
        'app/app.component.html': C(`
<h1 id="titulo">{{ producto.title }}</h1>
<p id="precio">{{ producto.price }}</p>
<p id="marca">{{ producto.brand }}</p>
<p id="etiqueta">{{ producto.tags[0] }}</p>
<p id="imagenes">{{ producto.images.length }}</p>
<p id="ancho">{{ producto.dimensions.width }}</p>
`)
    },

    chequeos: [
        { fuente: { archivo: RUTA.appHtml, debeTener: [
            { re: 'producto\\.title', que: 'Falta mostrar el título con {{ producto.title }}.' },
            { re: 'producto\\.tags\\[\\s*0\\s*\\]', que: 'La primera etiqueta es tags[0]: los índices arrancan en 0.' },
            { re: 'producto\\.images\\.length', que: 'La cantidad de imágenes es producto.images.length.' },
            { re: 'producto\\.dimensions\\.width', que: 'El ancho está adentro de dimensions: producto.dimensions.width.' }
          ] } },
        { arranca: true },
        { sinErrores: true },
        { dom: { textos: { selector: '#titulo', igual: ['Essence Mascara Lash Princess'] } } },
        { dom: { textos: { selector: '#precio', igual: ['18.85'] } } },
        { dom: { textos: { selector: '#marca', igual: ['Essence'] } } },
        { dom: { textos: { selector: '#etiqueta', igual: ['beauty'] } } },
        { dom: { textos: { selector: '#imagenes', igual: ['3'] } },
          pista: 'El producto tiene 3 imágenes: producto.images.length.' },
        { dom: { textos: { selector: '#ancho', igual: ['7.5'] } } }
    ]
},

    /* ------------------------------------------------------------------------
     * El proyecto
     * ---------------------------------------------------------------------- */

{
    id: 'p02',
    titulo: 'El proyecto y provideHttpClient',
    minutos: 16,
    abrir: RUTA.config,

    teoria: [
        { h: 'Crear el proyecto' },
        { terminal: 'ng new ministore\ncd ministore\nng serve' },
        { p: 'El asistente hace unas preguntas. Para esta clase: estilos **CSS**, sin SSR. Con Angular 18 los componentes son **standalone**: cada uno declara sus propias dependencias en `imports`, y no hay `app.module.ts`. La aplicación se configura en **`app.config.ts`**.' },
        { codigo: C(`
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
  ]
};
`), archivo: 'app.config.ts, como lo genera ng new' },
        { p: 'El array `providers` dice **qué servicios globales existen** en la aplicación. Ahí se registran las herramientas que Angular no trae encendidas por defecto.' },

        { h: 'HttpClient no viene encendido' },
        { p: '`HttpClient` es la herramienta de Angular para hablar con una API. Pero hay que **encenderla**: se agrega `provideHttpClient()` a los providers.' },
        { codigo: C(`
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
  ]
};
`), archivo: 'app.config.ts, con HttpClient' },
        { nota: 'Si te olvidás, la aplicación no arranca y la Consola dice **`No provider for HttpClient!`**. Es el error más frecuente de esta clase: Angular está diciendo "me pediste HttpClient y nadie me enseñó a crearlo".' },

        { h: 'El primer pedido' },
        { codigo: C(`
private readonly http = inject(HttpClient);

ngOnInit(): void {
  this.http
    .get<{ title: string }>('https://dummyjson.com/products/1')
    .subscribe((producto) => this.titulo.set(producto.title));
}
`), archivo: 'app.component.ts' },
        { p: '`inject(HttpClient)` le pide a Angular la herramienta. `http.get(url)` **no devuelve los datos**: devuelve un **Observable**, el mismo concepto que ya viste. El pedido recién sale cuando alguien hace `subscribe`, y el dato llega más tarde, cuando el servidor responde.' },
        { p: '`titulo` es un **signal**: un valor que Angular vigila. Se lee con paréntesis, `titulo()`, y se cambia con `.set(...)`. Cuando cambia, el template se actualiza solo.' }
    ],

    consigna: [
        { p: 'El componente ya pide el producto 1 y muestra su título, pero la aplicación no arranca: mirá la Consola. Encendé `HttpClient` en `app.config.ts`:' },
        { numerada: [
            'Importá `provideHttpClient` desde `\'@angular/common/http\'`.',
            'Agregalo, **llamándolo con paréntesis**, al array `providers`.'
        ] },
        { p: 'Al arreglarlo, el título pasa de "Cargando..." al nombre del producto, medio segundo después.' }
    ],

    semilla: proyecto({
        'app/app.config.ts': CONFIG_SIN_HTTP,
        'app/app.component.ts': C(`
import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  private readonly http = inject(HttpClient);

  readonly titulo = signal('Cargando...');

  ngOnInit(): void {
    this.http
      .get<{ title: string }>('https://dummyjson.com/products/1')
      .subscribe((producto) => this.titulo.set(producto.title));
  }
}
`),
        'app/app.component.html': '<h1 id="titulo">{{ titulo() }}</h1>\n'
    }),

    solucion: {
        'app/app.config.ts': CONFIG
    },

    chequeos: [
        { fuente: { archivo: RUTA.config, debeTener: [
            { re: imp('provideHttpClient', '@angular/common/http'), que: "Falta importar provideHttpClient desde '@angular/common/http'." },
            { re: 'provideHttpClient\\s*\\(\\s*\\)', que: 'Falta agregar provideHttpClient() al array providers, con paréntesis.' }
          ] } },
        { arranca: true },
        { sinErrores: true,
          pista: 'Si dice No provider for HttpClient, falta provideHttpClient() en app.config.ts.' },
        { dom: { textos: { selector: '#titulo', igual: ['Cargando...'] } } },
        { accion: { esperar: 900 } },
        { dom: { textos: { selector: '#titulo', igual: ['Essence Mascara Lash Princess'] } },
          pista: 'El pedido salió pero el título no cambió. Revisá que el subscribe llame a this.titulo.set(producto.title).' },
        { pedidos: { contiene: ['https://dummyjson.com/products/1'] } }
    ]
},

{
    id: 'p03',
    titulo: 'La estructura: core, features y shared',
    minutos: 18,
    abrir: RUTA.servicio,

    teoria: [
        { h: 'Un proyecto ordenado' },
        { p: 'Una aplicación crece rápido. Si todo está en una sola carpeta, a las dos semanas nadie encuentra nada. Angular no impone una estructura, pero la comunidad usa una que funciona muy bien: organizar **por responsabilidad**.' },
        { diagrama: 'src/app/\n├── core/                      lo que usa toda la aplicación\n│   ├── models/                 interfaces: Product, ProductsResponse\n│   └── services/               ProductService (habla con la API)\n├── features/                  cada funcionalidad completa\n│   └── products/\n│       ├── pages/              pantallas: products-page\n│       └── components/         piezas: product-card, product-list\n├── shared/                    piezas reutilizables en varias features\n└── app.component.ts' },
        { tabla: {
            cabeceras: ['Carpeta', 'Qué va adentro', 'Pregunta para decidir'],
            filas: [
                ['`core`', 'Modelos y servicios de toda la aplicación', '¿Lo usa cualquier parte de la app?'],
                ['`features`', 'Una carpeta por funcionalidad, con sus páginas y componentes', '¿Pertenece a un tema puntual, como productos?'],
                ['`shared`', 'Componentes chicos y genéricos: un botón, un loader, un paginador', '¿Lo usarían varias features distintas?']
            ]
        } },
        { p: 'En el proyecto real, cada pieza se crea con el CLI, que la deja en su lugar y con sus tres archivos:' },
        { terminal: 'ng generate interface core/models/product\nng generate interface core/models/products-response\nng generate service core/services/product\nng generate component features/products/pages/products-page\nng generate component features/products/components/product-card' },

        { h: 'Las rutas relativas cuentan carpetas' },
        { p: 'Con archivos en carpetas distintas, cada `import` tiene que **contar los niveles**: `./` es la carpeta actual y cada `../` sube una.' },
        { codigo: C(`
// desde  features/products/pages/products-page/products-page.component.ts
import { ProductService } from '../../../../core/services/product.service';
//                            └┬┘
//   1 ../ sale de products-page, 2 de pages, 3 de products, 4 de features: llega a app/
`), archivo: 'cuatro niveles hacia arriba' },
        { nota: 'Un import mal contado es el error más común al empezar a ordenar carpetas. La Consola te dice cuál falta, de a uno por vez.' }
    ],

    consigna: [
        { p: 'El proyecto ya está ordenado en carpetas y todo el código está escrito, pero **cinco imports tienen mal contadas las rutas** y la aplicación no carga. Corregilos, de a uno: la Consola te dice cuál es el próximo.' },
        { lista: [
            '`product.service.ts` importa `ProductsResponse`.',
            '`products-page.component.ts` importa `ProductService` y `ProductListComponent`.',
            '`product-list.component.ts` importa `ProductCardComponent`.',
            '`product-card.component.ts` importa `Product`.'
        ] },
        { nota: 'Pista general: mirá en qué carpeta está el archivo que importa y en cuál el que querés importar. Contá cuántos `../` hacen falta para llegar a `app/`.' }
    ],

    semilla: proyecto({
        'app/core/services/product.service.ts': SERVICIO.replace("'../models/products-response.interface'", "'./products-response.interface'"),
        'app/features/products/pages/products-page/products-page.component.ts': PAGINA_TS
            .replace("'../../../../core/services/product.service'", "'../../core/services/product.service'")
            .replace("'../../components/product-list/product-list.component'", "'../components/product-list/product-list.component'"),
        'app/features/products/components/product-list/product-list.component.ts': LISTA_TS.replace("'../product-card/product-card.component'", "'./product-card/product-card.component'"),
        'app/features/products/components/product-card/product-card.component.ts': TARJETA_TS.replace("'../../../../core/models/product.interface'", "'../../core/models/product.interface'")
    }),

    solucion: {
        'app/core/services/product.service.ts': SERVICIO,
        'app/features/products/pages/products-page/products-page.component.ts': PAGINA_TS,
        'app/features/products/components/product-list/product-list.component.ts': LISTA_TS,
        'app/features/products/components/product-card/product-card.component.ts': TARJETA_TS
    },

    chequeos: [
        { fuente: { archivo: RUTA.servicio, debeTener: [
            { re: 'from\\s*.\\.\\./models/products-response\\.interface', que: "El servicio está en core/services y el modelo en core/models: se sube una carpeta:  '../models/products-response.interface'." }
          ] } },
        { fuente: { archivo: RUTA.paginaTs, debeTener: [
            { re: 'from\\s*.(\\.\\./){4}core/services/product\\.service', que: "La page está cuatro niveles adentro de app/:  '../../../../core/services/product.service'." },
            { re: 'from\\s*.\\.\\./\\.\\./components/product-list/product-list\\.component', que: "La lista está en features/products/components: se sube a products y se baja:  '../../components/product-list/product-list.component'." }
          ] } },
        { fuente: { archivo: RUTA.listaTs, debeTener: [
            { re: 'from\\s*.\\.\\./product-card/product-card\\.component', que: "La card es una carpeta hermana de product-list:  '../product-card/product-card.component'." }
          ] } },
        { fuente: { archivo: RUTA.tarjetaTs, debeTener: [
            { re: 'from\\s*.(\\.\\./){4}core/models/product\\.interface', que: "La card está cuatro niveles adentro de app/:  '../../../../core/models/product.interface'." }
          ] } },
        { arranca: true },
        { sinErrores: true },
        { accion: { esperar: 900 } },
        { dom: { contar: { selector: 'app-product-card', es: 12 } },
          pista: 'Con todas las rutas bien tienen que verse 12 productos.' }
    ]
},

    /* ------------------------------------------------------------------------
     * Datos
     * ---------------------------------------------------------------------- */

{
    id: 'p04',
    titulo: 'Las interfaces: Product y ProductsResponse',
    minutos: 16,
    abrir: RUTA.producto,

    teoria: [
        { h: 'Decirle a TypeScript qué forma tienen los datos' },
        { p: 'La respuesta de la API es un JSON con decenas de campos. Sin interfaces, TypeScript no sabe qué hay adentro y hay que escribir `any`, que significa "no me controles nada".' },
        { codigo: C(`
// mal: cualquier error de tipeo pasa desapercibido
getProducts(): Observable<any> { ... }
producto.titel      // ningún aviso: el campo se llama title

// bien: el editor conoce la forma de los datos
getProducts(): Observable<ProductsResponse> { ... }
producto.titel      // error: la propiedad no existe
`), archivo: 'any frente a una interface' },
        { clave: 'Una interface **describe sólo lo que vos necesitás**, no toda la respuesta. Si la API manda 20 campos y tu pantalla usa 5, la interface tiene 5.' },
        { h: 'Las dos interfaces de MiniStore' },
        { p: 'La respuesta de `/products` es un objeto que trae la lista y datos de paginación. Cada elemento de la lista es un producto. Por eso son dos interfaces, una adentro de la otra:' },
        { codigo: C(`
export interface Product {
  id: number;
  title: string;
  price: number;
  rating: number;
  thumbnail: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}
`), archivo: 'core/models' },
        { p: 'Cada una va en **su propio archivo** dentro de `core/models`. `ProductsResponse` necesita **importar** `Product`, porque lo usa: `import { Product } from \'./product.interface\'`. Y las dos llevan `export`.' },
        { nota: 'En esta pantalla los tipos se borran al compilar y no se comprueban: si escribís mal un tipo no aparece ningún error. El aviso lo da tu editor. Por eso acá se verifica que las interfaces estén bien escritas.' }
    ],

    consigna: [
        { p: 'Los dos archivos de `core/models` están vacíos. Escribí las interfaces:' },
        { numerada: [
            '**`product.interface.ts`**: `Product`, exportada, con `id`, `price` y `rating` como `number`, y `title` y `thumbnail` como `string`.',
            '**`products-response.interface.ts`**: `ProductsResponse`, exportada, con `products` (un array de `Product`), y `total`, `skip` y `limit` como `number`.',
            'En el segundo archivo, importá `Product` desde `\'./product.interface\'`.'
        ] }
    ],

    semilla: proyecto({
        'app/core/models/product.interface.ts': '// Escribí acá la interface Product\n',
        'app/core/models/products-response.interface.ts': '// Escribí acá la interface ProductsResponse\n'
    }),

    solucion: {
        'app/core/models/product.interface.ts': PRODUCTO,
        'app/core/models/products-response.interface.ts': RESPUESTA
    },

    chequeos: [
        { fuente: { archivo: RUTA.producto, debeTener: [
            { re: 'export\\s+interface\\s+Product\\b', que: 'Falta exportar la interface:  export interface Product { ... }' },
            { re: '\\bid\\s*:\\s*number', que: 'Falta id: number.' },
            { re: 'title\\s*:\\s*string', que: 'Falta title: string.' },
            { re: 'price\\s*:\\s*number', que: 'Falta price: number.' },
            { re: 'rating\\s*:\\s*number', que: 'Falta rating: number.' },
            { re: 'thumbnail\\s*:\\s*string', que: 'Falta thumbnail: string.' }
          ],
          noDebeTener: [
            { re: ':\\s*any\\b', que: 'Nada de any: cada campo tiene su tipo.' }
          ] } },
        { fuente: { archivo: RUTA.respuesta, debeTener: [
            { re: 'import\\s*\\{\\s*Product\\s*\\}\\s*from\\s*.\\./product\\.interface', que: "Falta importar Product:  import { Product } from './product.interface';" },
            { re: 'export\\s+interface\\s+ProductsResponse\\b', que: 'Falta exportar la interface:  export interface ProductsResponse { ... }' },
            { re: 'products\\s*:\\s*Product\\[\\]', que: 'products es un array de productos:  products: Product[];' },
            { re: 'total\\s*:\\s*number', que: 'Falta total: number.' },
            { re: 'skip\\s*:\\s*number', que: 'Falta skip: number.' },
            { re: 'limit\\s*:\\s*number', que: 'Falta limit: number.' }
          ] } },
        { arranca: true },
        { sinErrores: true },
        { accion: { esperar: 900 } },
        { dom: { contar: { selector: 'app-product-card', es: 12 } } }
    ]
},

{
    id: 'p05',
    titulo: 'El service con HttpClient',
    minutos: 20,
    abrir: RUTA.servicio,

    teoria: [
        { h: 'Quién habla con la API' },
        { p: 'Los componentes **muestran** datos; no tendrían que saber de dónde salen. Quien habla con la API es un **service**: una clase que junta todos los pedidos de un tema. Así, si la URL cambia, se cambia en un solo lugar.' },
        { clave: 'El componente le pide los productos al **service**, y el service le pide los productos a la **API**. El componente nunca llama a `http` directamente.' },
        { codigo: C(`
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductsResponse } from '../models/products-response.interface';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://dummyjson.com/products';

  getProducts(limit: number, skip: number): Observable<ProductsResponse> {
    return this.http.get<ProductsResponse>(
      \`\${this.apiUrl}?limit=\${limit}&skip=\${skip}\`
    );
  }
}
`), archivo: 'core/services/product.service.ts' },
        { h: 'Línea por línea' },
        { lista: [
            '`@Injectable({ providedIn: \'root\' })`: una única instancia para toda la aplicación, como ya viste.',
            '`inject(HttpClient)` pide la herramienta. Es la forma moderna de pedir una dependencia: reemplaza al parámetro del constructor.',
            '`apiUrl` guarda la dirección **una sola vez**: nadie más la escribe.',
            '`get<ProductsResponse>(url)` le dice a TypeScript qué forma va a tener la respuesta. Devuelve un `Observable<ProductsResponse>`.',
            '`limit` es **cuántos** productos traer y `skip` es **cuántos saltear** desde el principio. Los usa la API para paginar.'
        ] },
        { nota: 'La URL se arma con una **template string** entre comillas invertidas, para poder meter los valores con `${ }`. Con comillas simples no funciona.' }
    ],

    consigna: [
        { p: 'La page ya está lista y le pide al service `getProducts(12, 0)`, pero el service está vacío. Escribilo:' },
        { numerada: [
            'Importá `inject`, `HttpClient`, `Observable` y `ProductsResponse`.',
            'Guardá `HttpClient` en `http` con `inject(HttpClient)`, y la URL `https://dummyjson.com/products` en `apiUrl`.',
            'Escribí `getProducts(limit: number, skip: number): Observable<ProductsResponse>`.',
            'Adentro, hacé un `get<ProductsResponse>` a la URL con `?limit=` y `&skip=` armados con una template string.'
        ] }
    ],

    semilla: proyecto({
        'app/core/services/product.service.ts': C(`
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ProductService {
}
`)
    }),

    solucion: {
        'app/core/services/product.service.ts': SERVICIO
    },

    chequeos: [
        { fuente: { archivo: RUTA.servicio, debeTener: [
            { re: imp('inject', '@angular/core'), que: "Falta importar inject desde '@angular/core'." },
            { re: imp('HttpClient', '@angular/common/http'), que: "Falta importar HttpClient desde '@angular/common/http'." },
            { re: imp('Observable', 'rxjs'), que: "Falta importar Observable desde 'rxjs'." },
            { re: 'inject\\s*\\(\\s*HttpClient\\s*\\)', que: 'Falta pedir la herramienta:  private readonly http = inject(HttpClient);' },
            { re: 'https://dummyjson\\.com/products', que: 'Falta la URL de la API: https://dummyjson.com/products.' },
            { re: 'getProducts\\s*\\(\\s*limit\\s*:\\s*number\\s*,\\s*skip\\s*:\\s*number\\s*\\)', que: 'Falta getProducts(limit: number, skip: number).' },
            { re: 'Observable\\s*<\\s*ProductsResponse\\s*>', que: 'getProducts devuelve un Observable<ProductsResponse>.' },
            { re: '\\.get\\s*<\\s*ProductsResponse\\s*>\\s*\\(', que: 'Falta hacer el pedido:  this.http.get<ProductsResponse>(url).' },
            { re: 'limit=\\$\\{\\s*limit\\s*\\}', que: 'La URL lleva ?limit=${limit}, armada con una template string (comillas invertidas).' },
            { re: 'skip=\\$\\{\\s*skip\\s*\\}', que: 'La URL lleva &skip=${skip}.' }
          ] } },
        { arranca: true },
        { sinErrores: true },
        { accion: { esperar: 900 } },
        { pedidos: { contiene: ['https://dummyjson.com/products?limit=12&skip=0'] },
          pista: 'El pedido tiene que ser exactamente  https://dummyjson.com/products?limit=12&skip=0.' },
        { dom: { contar: { selector: 'app-product-card', es: 12 } } }
    ]
},

    /* ------------------------------------------------------------------------
     * Pantallas
     * ---------------------------------------------------------------------- */

{
    id: 'p06',
    titulo: 'La page con signals',
    minutos: 22,
    abrir: RUTA.paginaTs,

    teoria: [
        { h: 'La page coordina' },
        { p: 'La **page** es la pantalla: le pide los datos al service, guarda lo que llega y se lo pasa a los componentes que lo dibujan. No dibuja nada compuesto ella: para eso están la lista y la card.' },
        { h: 'Signals: valores que Angular vigila' },
        { p: 'Un `signal` guarda un valor y **avisa a Angular cuando cambia**. Se crea con un valor inicial, se lee **llamándolo como función** y se modifica con `.set(...)`.' },
        { codigo: C(`
readonly products = signal<Product[]>([]);
readonly loading = signal(false);

this.loading.set(true);      // cambiar el valor
this.products();             // leer el valor: con paréntesis
`), archivo: 'signals de la page' },
        { p: 'En el template también se leen con paréntesis: `products()`, `loading()`. Cuando el valor cambia, Angular actualiza **sólo esa parte** de la pantalla.' },
        { h: 'El estado de carga' },
        { p: 'El pedido a la API tarda. Mientras tanto no hay datos, y la pantalla no puede quedar en blanco: conviene mostrar un mensaje. Por eso la page tiene un signal `loading`:' },
        { numerada: [
            'Al empezar el pedido, `loading` pasa a `true`.',
            'Cuando llegan los datos, se guardan en `products` y `loading` vuelve a `false`.'
        ] },
        { codigo: C(`
@if (loading()) {
  <p class="loading">Cargando productos…</p>
} @else {
  <app-product-list [products]="products()" />
}
`), archivo: 'products-page.component.html' },
        { p: '`@if` y `@else` son el **control flow** moderno de Angular: se decide qué mostrar según el valor del signal. Y el pedido se dispara en **`ngOnInit`**, no en el constructor, por la misma razón que ya viste.' }
    ],

    consigna: [
        { p: 'La page está vacía: sólo tiene la estructura del componente. Escribila entera:' },
        { numerada: [
            'En **`products-page.component.ts`**: importá `ProductListComponent`, `Product`, `ProductService`, y `OnInit`, `inject`, `signal` de Angular. Agregá `ProductListComponent` al array `imports` del componente.',
            'Pedí el service con `inject(ProductService)`.',
            'Creá los signals `products` (con `signal<Product[]>([])`) y `loading` (con `signal(false)`).',
            'En `ngOnInit`: `loading` a `true`, y pedí `getProducts(12, 0)`. En el `next`, guardá `response.products` y poné `loading` en `false`.',
            'En **`products-page.component.html`**: mostrá `<p class="loading">Cargando productos…</p>` mientras `loading()` sea verdadero, y si no, `<app-product-list [products]="products()" />`.'
        ] },
        { p: 'Al abrir tiene que verse "Cargando productos…" y, casi un segundo después, los 12 productos.' }
    ],

    semilla: proyecto({
        'app/features/products/pages/products-page/products-page.component.ts': PAGINA_TS_VACIA,
        'app/features/products/pages/products-page/products-page.component.html': ''
    }),

    solucion: {
        'app/features/products/pages/products-page/products-page.component.ts': PAGINA_TS,
        'app/features/products/pages/products-page/products-page.component.html': PAGINA_HTML
    },

    chequeos: [
        { fuente: { archivo: RUTA.paginaTs, debeTener: [
            { re: imp('signal', '@angular/core'), que: "Falta importar signal desde '@angular/core'." },
            { re: imp('inject', '@angular/core'), que: "Falta importar inject desde '@angular/core'." },
            { re: imp('OnInit', '@angular/core'), que: "Falta importar OnInit desde '@angular/core'." },
            { re: 'imports\\s*:\\s*\\[[^\\]]*ProductListComponent', que: 'Falta agregar ProductListComponent al array imports del componente.' },
            { re: 'inject\\s*\\(\\s*ProductService\\s*\\)', que: 'Falta pedir el service:  inject(ProductService).' },
            { re: 'products\\s*=\\s*signal\\s*<\\s*Product\\[\\]\\s*>', que: 'Falta el signal:  readonly products = signal<Product[]>([]);' },
            { re: 'loading\\s*=\\s*signal\\s*\\(', que: 'Falta el signal:  readonly loading = signal(false);' },
            { re: 'ngOnInit\\s*\\(', que: 'El pedido se dispara en ngOnInit().' },
            { re: 'getProducts\\s*\\(\\s*12\\s*,\\s*0\\s*\\)', que: 'Pedí la primera página:  getProducts(12, 0).' },
            { re: '\\.subscribe\\s*\\(', que: 'Falta suscribirse al Observable.' },
            { re: 'loading\\.set\\s*\\(\\s*true', que: 'Al empezar el pedido, loading pasa a true.' },
            { re: 'loading\\.set\\s*\\(\\s*false', que: 'Cuando llegan los datos, loading vuelve a false.' }
          ] } },
        { fuente: { archivo: RUTA.paginaHtml, debeTener: [
            { re: '@if\\s*\\(\\s*loading\\(\\)\\s*\\)', que: 'Falta el @if (loading()) { ... }.' },
            { re: '@else', que: 'Falta el @else con la lista.' },
            { re: '<app-product-list\\s+\\[products\\]\\s*=\\s*.products\\(\\)', que: 'Falta la lista:  <app-product-list [products]="products()" />' }
          ] } },
        { arranca: true },
        { sinErrores: true },
        { dom: { textos: { selector: '.loading', igual: ['Cargando productos…'] } },
          pista: 'Apenas abre tiene que verse "Cargando productos…". Poné loading en true antes de pedir.' },
        { dom: { contar: { selector: 'app-product-card', es: 0 } } },
        { accion: { esperar: 900 } },
        { dom: { noExiste: { selector: '.loading' } },
          pista: 'Cuando llegan los datos, loading tiene que volver a false y el mensaje desaparecer.' },
        { dom: { contar: { selector: 'app-product-card', es: 12 } },
          pista: 'Cuando llegan los datos tienen que verse los 12 productos: products.set(response.products).' }
    ]
},

{
    id: 'p07',
    titulo: 'La card con @Input',
    minutos: 22,
    abrir: RUTA.tarjetaTs,

    teoria: [
        { h: 'Una pieza que muestra un producto' },
        { p: 'La **card** dibuja un solo producto. No sabe de dónde vino: lo **recibe** de su padre por un `@Input`, y se dibuja con eso. Es el mismo concepto del tema de comunicación entre componentes, aplicado a datos reales.' },
        { codigo: C(`
@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
}
`), archivo: 'product-card.component.ts' },
        { lista: [
            '`@Input({ required: true })` marca que el padre **tiene que** pasar un producto: sin él la card no tiene sentido.',
            '`product!: Product` lleva el `!` porque no se inicializa acá: llega desde afuera.',
            '`imports: [CurrencyPipe]`: un componente standalone tiene que importar lo que usa en su template. Acá, el pipe que da formato de moneda.'
        ] },
        { h: 'El template' },
        { codigo: C(`
<article class="card">
  <img [src]="product.thumbnail" [alt]="product.title" />

  <h3 class="card__title">{{ product.title }}</h3>

  <p class="card__price">{{ product.price | currency }}</p>
  <span class="card__rating">★ {{ product.rating }}</span>
</article>
`), archivo: 'product-card.component.html' },
        { p: 'Fijate en `[src]` y `[alt]`: llevan **corchetes**, porque reciben una expresión. Sin corchetes, la imagen buscaría un archivo llamado literalmente `product.thumbnail`. Y `currency` convierte `18.85` en `$18.85`.' },
        { nota: 'Las versiones más nuevas de Angular tienen otra forma de declarar entradas, con `input.required<Product>()`. Es la misma idea, con otra sintaxis; en esta pantalla no se puede ejecutar, pero la vas a ver en proyectos actuales. Lo que evalúa el parcial es `@Input`.' }
    ],

    consigna: [
        { p: 'La lista ya recorre los productos y le pasa cada uno a `<app-product-card>`, pero la card está vacía: no recibe nada ni dibuja nada. Escribila:' },
        { numerada: [
            'En **`product-card.component.ts`**: importá `Input`, `CurrencyPipe` y `Product`. Agregá `CurrencyPipe` a `imports`.',
            'Declará `@Input({ required: true }) product!: Product;`.',
            'En **`product-card.component.html`**: un `<article class="card">` con la imagen (`[src]` y `[alt]`), el título en `h3.card__title`, el precio con el pipe `currency` en `p.card__price`, y el rating con una estrella en `span.card__rating`.'
        ] },
        { p: 'La estrella es el carácter `★` seguido de un espacio y el rating, por ejemplo `★ 4.29`.' }
    ],

    semilla: proyecto({
        'app/features/products/components/product-card/product-card.component.ts': TARJETA_TS_VACIA,
        'app/features/products/components/product-card/product-card.component.html': ''
    }),

    solucion: {
        'app/features/products/components/product-card/product-card.component.ts': TARJETA_TS,
        'app/features/products/components/product-card/product-card.component.html': TARJETA_HTML
    },

    chequeos: [
        { fuente: { archivo: RUTA.tarjetaTs, debeTener: [
            { re: imp('Input', '@angular/core'), que: "Falta importar Input desde '@angular/core'." },
            { re: imp('CurrencyPipe', '@angular/common'), que: "Falta importar CurrencyPipe desde '@angular/common'." },
            { re: 'imports\\s*:\\s*\\[[^\\]]*CurrencyPipe', que: 'Falta agregar CurrencyPipe al array imports del componente.' },
            { re: '@Input\\(\\s*\\{\\s*required\\s*:\\s*true\\s*\\}\\s*\\)\\s*product', que: 'Falta la entrada:  @Input({ required: true }) product!: Product;' }
          ] } },
        { fuente: { archivo: RUTA.tarjetaHtml, debeTener: [
            { re: '\\[\\s*src\\s*\\]\\s*=\\s*.product\\.thumbnail', que: 'La imagen lleva corchetes:  [src]="product.thumbnail".' },
            { re: '\\[\\s*alt\\s*\\]\\s*=\\s*.product\\.title', que: 'El alt lleva corchetes:  [alt]="product.title".' },
            { re: 'product\\.price\\s*\\|\\s*currency', que: 'El precio usa el pipe currency:  {{ product.price | currency }}.' },
            { re: 'product\\.rating', que: 'Falta mostrar el rating.' }
          ] } },
        { arranca: true },
        { sinErrores: true },
        { accion: { esperar: 900 } },
        { dom: { contar: { selector: '.card', es: 12 } },
          pista: 'Tiene que haber un article con clase card por cada producto: 12.' },
        { dom: { textos: { selector: '.card__title', contiene: 'Essence Mascara Lash Princess' } } },
        { dom: { textos: { selector: '.card__price', contiene: '$18.85' } },
          pista: 'El precio se muestra con el pipe currency: 18.85 pasa a $18.85.' },
        { dom: { textos: { selector: '.card__rating', contiene: '★ 4.29' } },
          pista: 'El rating se muestra como  ★ 4.29: la estrella, un espacio y el número.' },
        { dom: { atributo: { selector: '.card img', nombre: 'alt', igual: 'Essence Mascara Lash Princess' } },
          pista: 'El alt de la imagen es el título del producto.' }
    ]
},

{
    id: 'p08',
    titulo: 'Conectar todo y ver el viaje de los datos',
    minutos: 18,
    abrir: RUTA.appTs,

    teoria: [
        { h: 'La última pieza' },
        { p: 'El proyecto que crea `ng new` muestra un componente raíz con un `<router-outlet />`: el lugar donde se dibujarían páginas si hubiera rutas. Como MiniStore tiene **una sola pantalla**, la ponés directamente en el componente raíz.' },
        { codigo: C(`
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ProductsPageComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {}
`), archivo: 'app.component.ts' },
        { codigo: '<app-products-page />', archivo: 'app.component.html' },
        { clave: 'En un componente **standalone**, para usar la etiqueta de otro tenés que hacer **dos cosas**: importar la clase, y agregarla al array `imports`. Si falta el array, la Consola muestra `NG0304`: la etiqueta no es un elemento conocido.' },

        { h: 'El viaje de los datos' },
        { p: 'Ahora que está todo conectado, seguí un dato desde que se pide hasta que se ve:' },
        { diagrama: 'API  ──▶  HttpClient  ──▶  ProductService  ──▶  ProductsPage  ──▶  ProductList  ──▶  ProductCard\n JSON      get<T>()       Observable          subscribe()         @Input products       @Input product\n                                              signal.set()        @for track id         template + pipe' },
        { numerada: [
            'La **page** se crea y en `ngOnInit` llama a `getProducts(12, 0)`.',
            'El **service** hace `http.get` y devuelve un Observable: todavía **no salió nada**.',
            'La page hace **`subscribe`**: ahora sí sale el pedido a la API.',
            'Mientras tanto `loading` es `true` y la pantalla muestra "Cargando…".',
            'La respuesta llega: `products.set(...)` y `loading.set(false)`. Los signals avisan a Angular.',
            'El template vuelve a dibujarse: la lista recibe los productos y crea **una card por cada uno**.'
        ] },
        { h: 'Para repasar' },
        { lista: [
            '¿Por qué el componente no llama a `http` directamente, sino a través de un service?',
            '¿Qué pasa si te olvidás de `provideHttpClient()`? ¿Cómo se ve?',
            '¿Por qué un `Observable` no hace nada hasta que alguien se suscribe?',
            '¿Para qué sirve `track product.id` en el `@for`?',
            '¿Qué diferencia hay entre `product` (la interface) y `products()` (el signal)?'
        ] }
    ],

    consigna: [
        { p: 'Todo está armado, pero el componente raíz es el que genera `ng new`: muestra un `<router-outlet />` vacío. Ponés la pantalla de productos:' },
        { numerada: [
            'En **`app.component.ts`**: importá `ProductsPageComponent` y agregalo al array `imports`. Podés sacar `RouterOutlet`.',
            'En **`app.component.html`**: reemplazá el `<router-outlet />` por `<app-products-page />`.'
        ] },
        { p: 'Al terminar tienen que verse los 12 productos con sus cards.' }
    ],

    semilla: proyecto({
        'app/app.component.ts': APP_TS_NG_NEW,
        'app/app.component.html': APP_HTML_NG_NEW
    }),

    solucion: {
        'app/app.component.ts': APP_TS,
        'app/app.component.html': APP_HTML
    },

    chequeos: [
        { fuente: { archivo: RUTA.appTs, debeTener: [
            { re: 'import\\s*\\{[^}]*ProductsPageComponent[^}]*\\}\\s*from', que: 'Falta importar ProductsPageComponent.' },
            { re: 'imports\\s*:\\s*\\[[^\\]]*ProductsPageComponent', que: 'Falta agregar ProductsPageComponent al array imports del componente.' }
          ] } },
        { fuente: { archivo: RUTA.appHtml, debeTener: [
            { re: '<app-products-page', que: 'Falta la etiqueta  <app-products-page />  en app.component.html.' }
          ] } },
        { arranca: true },
        { sinErrores: true,
          pista: 'Si dice que app-products-page no es un elemento conocido, falta agregar la clase al array imports.' },
        { dom: { textos: { selector: '.loading', igual: ['Cargando productos…'] } } },
        { accion: { esperar: 900 } },
        { dom: { contar: { selector: 'app-product-card', es: 12 } } },
        { dom: { textos: { selector: '.card__title', contiene: 'Essence Mascara Lash Princess' } } },
        { pedidos: { contiene: ['https://dummyjson.com/products?limit=12&skip=0'] } }
    ]
}

    ];

    pasos.forEach(function (p) { CONTENIDO.ministore.push(p); });
})();
