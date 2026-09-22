CONTENIDO.ministore2 = [];

(function () {
    'use strict';

    var B = window.MiniStoreBase;
    var C = B.C, imp = B.imp, RUTA = B.RUTA;

    var R2 = {
        paginadorTs: 'app/shared/components/pagination/pagination.component.ts',
        paginadorHtml: 'app/shared/components/pagination/pagination.component.html',
        paginadorCss: 'app/shared/components/pagination/pagination.component.css',
        cargador: 'app/shared/components/loader/loader.component.ts',
        consulta: 'app/core/models/product-query.interface.ts'
    };

    /* ------------------------------------------------------------------------
     * Archivos
     * ---------------------------------------------------------------------- */

    var PAGINADOR_TS = C(`
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css',
})
export class PaginationComponent {
  @Input({ required: true }) currentPage = 1;
  @Input({ required: true }) totalPages = 1;

  @Output() pageChange = new EventEmitter<number>();

  goTo(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    if (page === this.currentPage) return;

    this.pageChange.emit(page);
  }
}
`);

    var PAGINADOR_TS_VACIO = C(`
import { Component } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css',
})
export class PaginationComponent {
}
`);

    var PAGINADOR_HTML = C(`
<nav class="pagination">
  <button (click)="goTo(currentPage - 1)"
          [disabled]="currentPage === 1">← Anterior</button>

  <span>{{ currentPage }} / {{ totalPages }}</span>

  <button (click)="goTo(currentPage + 1)"
          [disabled]="currentPage === totalPages">Siguiente →</button>
</nav>
`);

    var PAGINADOR_CSS = C(`
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1.5rem;
}

.pagination button {
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
}

.pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
`);

    var CARGADOR_TS = C(`
import { Component } from '@angular/core';

@Component({
  selector: 'app-loader',
  standalone: true,
  template: \`<div class="loader" role="status">Cargando…</div>\`,
  styles: \`
    .loader { text-align: center; padding: 3rem; color: #6b7280; }
  \`,
})
export class LoaderComponent {}
`);

    var CONSULTA = C(`
export interface ProductQuery {
  search?: string;
  category?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}
`);

    var SERVICIO_BUSQUEDA = C(`
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductsResponse } from '../models/products-response.interface';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://dummyjson.com/products';

  getProducts(limit: number, skip: number, search = ''): Observable<ProductsResponse> {
    const url = search
      ? \`\${this.apiUrl}/search?q=\${search}&limit=\${limit}&skip=\${skip}\`
      : \`\${this.apiUrl}?limit=\${limit}&skip=\${skip}\`;

    return this.http.get<ProductsResponse>(url);
  }
}
`);

    var SERVICIO_CONSULTA = C(`
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductQuery } from '../models/product-query.interface';
import { ProductsResponse } from '../models/products-response.interface';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://dummyjson.com/products';

  getProducts(limit: number, skip: number, query: ProductQuery = {}): Observable<ProductsResponse> {
    const { search = '', category = '', sortBy = '', order = 'asc' } = query;

    let url = this.apiUrl;

    if (search) {
      url += \`/search?q=\${search}&\`;
    } else if (category) {
      url += \`/category/\${category}?\`;
    } else {
      url += '?';
    }

    url += \`limit=\${limit}&skip=\${skip}\`;

    if (sortBy) {
      url += \`&sortBy=\${sortBy}&order=\${order}\`;
    }

    return this.http.get<ProductsResponse>(url);
  }
}
`);

    var SERVICIO_CONSULTA_SEMILLA = SERVICIO_BUSQUEDA;

    /* ------------------------------------------------------------------------
     * La page, armada según lo que ya tiene
     * ---------------------------------------------------------------------- */

    function paginaTs(o) {
        var nucleo = ['Component', 'OnInit'];
        if (o.total) nucleo.push('computed');
        nucleo.push('inject', 'signal');
        var comps = ['ProductListComponent'];
        if (o.pag) comps.push('PaginationComponent');
        if (o.states) comps.push('LoaderComponent');

        var l = [];
        l.push('import { ' + nucleo.join(', ') + " } from '@angular/core';", '');
        l.push("import { Product } from '../../../../core/models/product.interface';");
        l.push("import { ProductService } from '../../../../core/services/product.service';");
        l.push("import { ProductListComponent } from '../../components/product-list/product-list.component';");
        if (o.pag) l.push("import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';");
        if (o.states) l.push("import { LoaderComponent } from '../../../../shared/components/loader/loader.component';");
        l.push('', '@Component({', "  selector: 'app-products-page',", '  standalone: true,');
        l.push('  imports: [' + comps.join(', ') + '],');
        l.push("  templateUrl: './products-page.component.html',", "  styleUrl: './products-page.component.css',", '})');
        l.push('export class ProductsPageComponent implements OnInit {');
        l.push('  private readonly productService = inject(ProductService);', '');
        l.push('  readonly products = signal<Product[]>([]);');
        l.push('  readonly loading = signal(false);');
        if (o.states) l.push('  readonly error = signal<string | null>(null);');
        l.push('  readonly page = signal(1);');
        if (o.total) l.push('  readonly total = signal(0);');
        if (o.search) l.push("  readonly search = signal('');");
        if (o.query) { l.push("  readonly category = signal('');"); l.push("  readonly sort = signal('');"); }
        l.push('', '  readonly pageSize = 12;');
        if (o.total) l.push('  readonly totalPages = computed(() => Math.ceil(this.total() / this.pageSize));');
        l.push('', '  ngOnInit(): void {', '    this.loadPage(1);', '  }', '');
        if (o.search) l.push('  buscar(termino: string): void {', '    this.search.set(termino);', '    this.loadPage(1);', '  }', '');
        if (o.query) {
            l.push('  cambiarCategoria(slug: string): void {', '    this.category.set(slug);', '    this.loadPage(1);', '  }', '');
            l.push('  cambiarOrden(valor: string): void {', '    this.sort.set(valor);', '    this.loadPage(1);', '  }', '');
        }
        l.push('  loadPage(page: number): void {', '    this.loading.set(true);');
        if (o.states) l.push('    this.error.set(null);');
        l.push('', o.skipFijo ? '    const skip = 0;' : '    const skip = (page - 1) * this.pageSize;');
        if (o.query) l.push("    const [sortBy, order] = this.sort() ? this.sort().split('-') : ['', 'asc'];");
        l.push('');
        var sangria;
        if (o.query) {
            sangria = '      ';
            l.push('    this.productService', '      .getProducts(this.pageSize, skip, {', '        search: this.search(),', '        category: this.category(),', '        sortBy,', "        order: order as 'asc' | 'desc',", '      })', '      .subscribe({');
        } else {
            sangria = '    ';
            l.push(o.search
                ? '    this.productService.getProducts(this.pageSize, skip, this.search()).subscribe({'
                : '    this.productService.getProducts(this.pageSize, skip).subscribe({');
        }
        l.push(sangria + '  next: (response) => {');
        l.push(sangria + '    this.products.set(response.products);');
        if (o.total) l.push(sangria + '    this.total.set(response.total);');
        l.push(sangria + '    this.page.set(page);');
        l.push(sangria + '    this.loading.set(false);');
        l.push(sangria + '  },');
        if (o.states) {
            l.push(sangria + '  error: () => {');
            l.push(sangria + "    this.error.set('No pudimos cargar los productos. Reintentá.');");
            l.push(sangria + '    this.loading.set(false);');
            l.push(sangria + '  },');
        }
        l.push(sangria + '});', '  }', '}', '');
        return l.join('\n');
    }

    function paginaHtml(o) {
        var l = [];
        if (o.buscador) {
            l.push('<section class="buscador">',
                   '  <input #q',
                   '         type="search"',
                   '         placeholder="Buscar productos…"',
                   '         (keyup.enter)="buscar(q.value)" />',
                   '',
                   '  <button id="buscar" (click)="buscar(q.value)">Buscar</button>',
                   '',
                   '  @if (search()) {',
                   '    <p id="resultados">Resultados para "{{ search() }}" · {{ total() }} encontrados</p>',
                   '    <button id="limpiar" (click)="buscar(\'\')">Limpiar</button>',
                   '  }',
                   '</section>',
                   '');
        }
        if (o.query) {
            l.push('<section class="filtros">',
                   '  <select id="categoria" (change)="cambiarCategoria($any($event.target).value)">',
                   '    <option value="">Todas las categorías</option>',
                   '    <option value="laptops">Laptops</option>',
                   '    <option value="smartphones">Smartphones</option>',
                   '    <option value="mens-watches">Relojes de hombre</option>',
                   '    <option value="groceries">Almacén</option>',
                   '  </select>',
                   '',
                   '  <select id="orden" (change)="cambiarOrden($any($event.target).value)">',
                   '    <option value="">Sin ordenar</option>',
                   '    <option value="price-asc">Precio: menor a mayor</option>',
                   '    <option value="price-desc">Precio: mayor a menor</option>',
                   '  </select>',
                   '</section>',
                   '');
        }
        var cuerpo = ['<app-product-list [products]="products()" />', ''];
        if (o.pag) {
            cuerpo.push('<app-pagination', '  [currentPage]="page()"', '  [totalPages]="totalPages()"', '  (pageChange)="loadPage($event)" />');
        } else {
            cuerpo.push('<nav class="pager">',
                        '  <button id="anterior" (click)="loadPage(page() - 1)" [disabled]="page() === 1">← Anterior</button>',
                        o.total ? '  <span id="pagina">Página {{ page() }} de {{ totalPages() }}</span>' : '  <span id="pagina">Página {{ page() }}</span>',
                        '  <button id="siguiente" (click)="loadPage(page() + 1)">Siguiente →</button>',
                        '</nav>');
        }
        function sangrar(lineas) { return lineas.map(function (x) { return x ? '  ' + x : x; }); }
        if (o.states) {
            l.push('@if (loading()) {', '  <app-loader />', '} @else if (error()) {',
                   '  <p id="error" class="error">{{ error() }}</p>',
                   '  <button id="reintentar" (click)="loadPage(page())">Reintentar</button>',
                   '} @else if (products().length === 0) {',
                   '  <p id="vacio" class="vacio">No encontramos productos.</p>',
                   '} @else {');
        } else {
            l.push('@if (loading()) {', o.loader ? '  <app-loader />' : '  <p class="loading">Cargando productos…</p>', '} @else {');
        }
        l = l.concat(sangrar(cuerpo));
        l.push('}', '');
        return l.join('\n');
    }

    var PAGINA_CSS = C(`
.buscador, .filtros {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  max-width: 1100px;
  margin: 1rem auto 0;
  padding: 0 1.5rem;
}

.error { color: #b91c1c; text-align: center; padding: 1.5rem 1rem 0; }
.vacio { text-align: center; padding: 3rem; color: #6b7280; }
.pager { display: flex; align-items: center; justify-content: center; gap: 1rem; padding: 1.5rem; }
`);

    /* ------------------------------------------------------------------------
     * Proyecto base de la segunda clase
     * ---------------------------------------------------------------------- */

    function proyecto(o) {
        var p = {};
        p[RUTA.config] = B.CONFIG;
        p[RUTA.rutas] = B.RUTAS;
        p[RUTA.appTs] = B.APP_TS;
        p[RUTA.appHtml] = B.APP_HTML;
        p[RUTA.appCss] = '';
        p[RUTA.producto] = B.PRODUCTO;
        p[RUTA.respuesta] = B.RESPUESTA;
        p[RUTA.servicio] = o.servicio || B.SERVICIO;
        p[RUTA.tarjetaTs] = B.TARJETA_TS;
        p[RUTA.tarjetaHtml] = B.TARJETA_HTML;
        p[RUTA.tarjetaCss] = B.TARJETA_CSS;
        p[RUTA.listaTs] = B.LISTA_TS;
        p[RUTA.listaCss] = B.LISTA_CSS;
        p[RUTA.paginaTs] = paginaTs(o.paginaTs || {});
        p[RUTA.paginaHtml] = paginaHtml(o.paginaHtml || {});
        p[RUTA.paginaCss] = PAGINA_CSS;
        if (o.paginador) {
            p[R2.paginadorTs] = o.paginador === 'vacio' ? PAGINADOR_TS_VACIO : PAGINADOR_TS;
            p[R2.paginadorHtml] = o.paginador === 'vacio' ? '' : PAGINADOR_HTML;
            p[R2.paginadorCss] = PAGINADOR_CSS;
        }
        if (o.cargador) p[R2.cargador] = CARGADOR_TS;
        if (o.consulta) p[R2.consulta] = CONSULTA;
        return p;
    }

    var TITULOS_P1 = 'Bedside Table African Cherry';

    var pasos = [

    /* ------------------------------------------------------------------------
     * Paginación
     * ---------------------------------------------------------------------- */

{
    id: 'p01',
    titulo: 'Paginación: limit y skip',
    minutos: 18,
    abrir: RUTA.paginaTs,

    teoria: [
        { h: 'Nadie pide 194 productos de una vez' },
        { p: 'La API tiene **194 productos**. Traerlos todos juntos sería lento, pesado y, en pantalla, imposible de leer. Lo normal es pedirlos **de a poco**: una **página** por vez. A eso se le llama **paginación**.' },
        { p: 'La API ofrece dos parámetros, que se agregan a la URL después de un `?` y se separan con `&`:' },
        { tabla: {
            cabeceras: ['Parámetro', 'Significa', 'Ejemplo'],
            filas: [
                ['`limit`', 'Cuántos productos traer', '`limit=12`'],
                ['`skip`', 'Cuántos productos **saltear** desde el principio', '`skip=24`']
            ]
        } },
        { codigo: 'https://dummyjson.com/products?limit=12&skip=24', archivo: '"traeme 12 productos, salteando los primeros 24"' },
        { h: 'La fórmula' },
        { p: 'La página 1 no saltea nada. La página 2 saltea los 12 de la página 1. La 3 saltea los 24 anteriores. El patrón es siempre el mismo:' },
        { codigo: 'skip = (page - 1) * pageSize', archivo: 'la fórmula de la paginación' },
        { tabla: {
            cabeceras: ['Página', 'Cuenta', 'skip', 'Trae los productos'],
            filas: [
                ['1', '(1 - 1) × 12', '0', '1 al 12'],
                ['2', '(2 - 1) × 12', '12', '13 al 24'],
                ['3', '(3 - 1) × 12', '24', '25 al 36'],
                ['17', '(17 - 1) × 12', '192', '193 y 194 (sólo 2)']
            ]
        } },
        { clave: 'El `skip` **no** lo elige el usuario: se **calcula** a partir de la página. El usuario piensa en páginas; la API piensa en cuántos saltear.' },
        { nota: 'En el código, `page` es el número de página que **querés cargar** (el parámetro de `loadPage`). El signal `page()` guarda la página **que se está mostrando**. Se actualiza recién cuando llegan los datos.' }
    ],

    consigna: [
        { p: 'La page ya tiene los botones Anterior y Siguiente, y el número de página. Pero el `skip` está fijo en `0`: siempre pide la primera página. Arreglalo:' },
        { numerada: [
            'En `loadPage(page)`, calculá el `skip` con la fórmula: `(page - 1) * this.pageSize`.'
        ] },
        { p: 'Fijate en la Consola de red de tu editor real: cada clic en Siguiente tiene que pedir `skip=12`, después `skip=24`, y así.' }
    ],

    semilla: proyecto({
        paginaTs: { skipFijo: true },
        paginaHtml: { nav: true }
    }),

    solucion: {
        'app/features/products/pages/products-page/products-page.component.ts': paginaTs({})
    },

    chequeos: [
        { fuente: { archivo: RUTA.paginaTs, debeTener: [
            { re: '\\(\\s*page\\s*-\\s*1\\s*\\)\\s*\\*\\s*this\\.pageSize', que: 'Falta la fórmula:  const skip = (page - 1) * this.pageSize;' },
            { re: 'getProducts\\s*\\(\\s*this\\.pageSize\\s*,\\s*skip\\s*\\)', que: 'El pedido tiene que usar el skip calculado:  getProducts(this.pageSize, skip).' }
          ] } },
        { arranca: true },
        { sinErrores: true },
        { accion: { esperar: 900 } },
        { dom: { textos: { selector: '#pagina', igual: ['Página 1'] } } },
        { dom: { propiedad: { selector: '#anterior', nombre: 'disabled', igual: true } } },
        { accion: { clic: '#siguiente' } },
        { accion: { esperar: 900 } },
        { dom: { textos: { selector: '#pagina', igual: ['Página 2'] } } },
        { pedidos: { ultimo: 'limit=12&skip=12' },
          pista: 'La página 2 tiene que pedir skip=12: (2 - 1) * 12.' },
        { dom: { textos: { selector: '.card__title', contiene: TITULOS_P1 } },
          pista: 'La página 2 empieza en el producto 13: Bedside Table African Cherry.' },
        { accion: { clic: '#anterior' } },
        { accion: { esperar: 900 } },
        { dom: { textos: { selector: '#pagina', igual: ['Página 1'] } } },
        { pedidos: { ultimo: 'limit=12&skip=0' } }
    ]
},

{
    id: 'p02',
    titulo: 'Total de páginas con computed',
    minutos: 16,
    abrir: RUTA.paginaTs,

    teoria: [
        { h: 'Saber cuántas páginas hay' },
        { p: 'Para mostrar "Página 3 de 17" y saber cuándo termina la lista, hace falta el **total de páginas**. La API lo permite: la respuesta trae `total`, la cantidad de productos que hay en **toda** la colección.' },
        { codigo: C(`
{
  "products": [ ... 12 productos ... ],
  "total": 194,
  "skip": 0,
  "limit": 12
}
`), archivo: 'lo que devuelve la API' },
        { p: 'Con el total y el tamaño de página se calcula la cantidad de páginas **redondeando hacia arriba**: 194 ÷ 12 = 16,17, pero la página 17 existe (tiene 2 productos).' },
        { codigo: 'totalPages = Math.ceil(total / pageSize)     // Math.ceil(194 / 12) = 17', archivo: 'redondear hacia arriba' },
        { h: 'computed: un signal que se calcula solo' },
        { p: 'Un `computed` es un signal **derivado**: se define con una función que usa otros signals, y Angular lo **recalcula solo** cada vez que alguno de ellos cambia. No lo modificás vos.' },
        { codigo: C(`
readonly total = signal(0);
readonly pageSize = 12;

readonly totalPages = computed(() => Math.ceil(this.total() / this.pageSize));
`), archivo: 'signal + computed' },
        { clave: 'Un `signal` se **cambia** con `.set()`. Un `computed` **nunca** se cambia: se calcula. Si el `total` pasa de 0 a 194, `totalPages` pasa de 0 a 17 sin que hagas nada más.' }
    ],

    consigna: [
        { p: 'El template ya muestra "Página 1 de ..." usando `totalPages()`, pero la page todavía no lo tiene: la Consola muestra un error. Agregalo:' },
        { numerada: [
            'Importá `computed` desde `\'@angular/core\'`.',
            'Creá el signal `total` con `signal(0)`.',
            'En el `next`, guardá `response.total` con `this.total.set(...)`.',
            'Creá `totalPages` con `computed(() => Math.ceil(this.total() / this.pageSize))`.'
        ] },
        { p: 'Tiene que aparecer "Página 1 de 17" y avanzar a "Página 2 de 17" al apretar Siguiente.' }
    ],

    semilla: proyecto({
        paginaTs: {},
        paginaHtml: { nav: true, total: true }
    }),

    solucion: {
        'app/features/products/pages/products-page/products-page.component.ts': paginaTs({ total: true })
    },

    chequeos: [
        { fuente: { archivo: RUTA.paginaTs, debeTener: [
            { re: imp('computed', '@angular/core'), que: "Falta importar computed desde '@angular/core'." },
            { re: 'total\\s*=\\s*signal\\s*\\(', que: 'Falta el signal:  readonly total = signal(0);' },
            { re: 'total\\.set\\s*\\(\\s*response\\.total', que: 'En el next, guardá el total:  this.total.set(response.total);' },
            { re: 'totalPages\\s*=\\s*computed\\s*\\(', que: 'Falta el computed:  readonly totalPages = computed(() => ...);' },
            { re: 'Math\\.ceil\\s*\\(', que: 'Para las páginas se redondea hacia arriba con Math.ceil.' }
          ] } },
        { arranca: true },
        { sinErrores: true,
          pista: 'Si dice que totalPages no es una función, todavía falta el computed en la page.' },
        { accion: { esperar: 900 } },
        { dom: { textos: { selector: '#pagina', igual: ['Página 1 de 17'] } },
          pista: 'Son 194 productos de a 12: Math.ceil(194 / 12) = 17 páginas.' },
        { accion: { clic: '#siguiente' } },
        { accion: { esperar: 900 } },
        { dom: { textos: { selector: '#pagina', igual: ['Página 2 de 17'] } } }
    ]
},

{
    id: 'p03',
    titulo: 'El componente de paginación',
    minutos: 22,
    abrir: R2.paginadorTs,

    teoria: [
        { h: 'Sacar la botonera de la page' },
        { p: 'Los botones Anterior y Siguiente ya funcionan, pero están mezclados con la page. Una botonera de páginas sirve en **cualquier lista**: conviene que sea un componente aparte, reutilizable. Por eso va en **`shared`**.' },
        { p: 'Es el patrón de siempre, aplicado a una pieza real: la page le **pasa** la página actual y el total con `@Input`, y el componente le **avisa** qué página eligió el usuario con `@Output`.' },
        { codigo: C(`
export class PaginationComponent {
  @Input({ required: true }) currentPage = 1;
  @Input({ required: true }) totalPages = 1;

  @Output() pageChange = new EventEmitter<number>();

  goTo(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    if (page === this.currentPage) return;

    this.pageChange.emit(page);
  }
}
`), archivo: 'pagination.component.ts' },
        { lista: [
            '`goTo` es el **único** camino para cambiar de página: primero **valida** y recién después emite.',
            'Si la página pedida es menor que 1 o mayor que el total, no hace nada.',
            'Si es la página en la que ya estás, tampoco: evita pedirle a la API lo que ya tenés.',
            'El componente **no llama a la API** ni guarda datos: sólo avisa. Quien decide qué hacer es la page.'
        ] },
        { codigo: C(`
<nav class="pagination">
  <button (click)="goTo(currentPage - 1)"
          [disabled]="currentPage === 1">← Anterior</button>

  <span>{{ currentPage }} / {{ totalPages }}</span>

  <button (click)="goTo(currentPage + 1)"
          [disabled]="currentPage === totalPages">Siguiente →</button>
</nav>
`), archivo: 'pagination.component.html' },
        { p: 'Y la page lo usa así: los **corchetes** bajan los datos, los **paréntesis** escuchan el aviso.' },
        { codigo: C(`
<app-pagination
  [currentPage]="page()"
  [totalPages]="totalPages()"
  (pageChange)="loadPage($event)" />
`), archivo: 'products-page.component.html' },
        { nota: 'El botón se deshabilita con `[disabled]` en la primera y en la última página. La validación de `goTo` es una **segunda defensa**: aunque alguien llame al método a mano, no se sale de los límites.' }
    ],

    consigna: [
        { p: 'La page ya usa `<app-pagination>` con sus tres enlaces, pero el componente está vacío y la Consola muestra errores. Escribilo:' },
        { numerada: [
            'En **`pagination.component.ts`**: importá `Input`, `Output` y `EventEmitter`, y declará los dos `@Input({ required: true })` (`currentPage` y `totalPages`) y el `@Output() pageChange` de tipo `EventEmitter<number>`.',
            'Escribí `goTo(page: number)`: no hace nada si `page` es menor que 1 o mayor que `totalPages`, ni si es igual a `currentPage`. Si no, emite `pageChange`.',
            'En **`pagination.component.html`**: un `<nav class="pagination">` con un botón Anterior, un `<span>` con `currentPage / totalPages` y un botón Siguiente. Los botones llaman a `goTo` y se deshabilitan en los extremos con `[disabled]`.'
        ] }
    ],

    semilla: proyecto({
        paginador: 'vacio',
        paginaTs: { total: true, pag: true },
        paginaHtml: { pag: true }
    }),

    solucion: {
        'app/shared/components/pagination/pagination.component.ts': PAGINADOR_TS,
        'app/shared/components/pagination/pagination.component.html': PAGINADOR_HTML
    },

    chequeos: [
        { fuente: { archivo: R2.paginadorTs, debeTener: [
            { re: imp('Input', '@angular/core'), que: "Falta importar Input desde '@angular/core'." },
            { re: imp('Output', '@angular/core'), que: "Falta importar Output desde '@angular/core'." },
            { re: imp('EventEmitter', '@angular/core'), que: "Falta importar EventEmitter desde '@angular/core'." },
            { re: '@Input\\(\\s*\\{\\s*required\\s*:\\s*true\\s*\\}\\s*\\)\\s*currentPage', que: 'Falta:  @Input({ required: true }) currentPage = 1;' },
            { re: '@Input\\(\\s*\\{\\s*required\\s*:\\s*true\\s*\\}\\s*\\)\\s*totalPages', que: 'Falta:  @Input({ required: true }) totalPages = 1;' },
            { re: '@Output\\(\\)\\s*pageChange\\s*=\\s*new\\s+EventEmitter\\s*<\\s*number\\s*>', que: 'Falta:  @Output() pageChange = new EventEmitter<number>();' },
            { re: 'goTo\\s*\\(\\s*page\\s*:\\s*number\\s*\\)', que: 'Falta el método goTo(page: number).' },
            { re: 'page\\s*<\\s*1', que: 'goTo tiene que rechazar las páginas menores que 1.' },
            { re: 'page\\s*>\\s*this\\.totalPages', que: 'goTo tiene que rechazar las páginas mayores que totalPages.' },
            { re: 'pageChange\\.emit\\s*\\(', que: 'goTo tiene que emitir con this.pageChange.emit(page).' }
          ] } },
        { fuente: { archivo: R2.paginadorHtml, debeTener: [
            { re: '\\(\\s*click\\s*\\)\\s*=\\s*.goTo\\s*\\(', que: 'Los botones llaman a goTo con (click).' },
            { re: '\\[\\s*disabled\\s*\\]', que: 'Los botones se deshabilitan con [disabled].' },
            { re: 'currentPage\\s*\\}\\}\\s*/\\s*\\{\\{\\s*totalPages', que: 'Falta mostrar  {{ currentPage }} / {{ totalPages }}.' }
          ] } },
        { arranca: true },
        { sinErrores: true },
        { accion: { esperar: 900 } },
        { dom: { textos: { selector: '.pagination span', igual: ['1 / 17'] } } },
        { dom: { propiedad: { selector: '.pagination button:first-child', nombre: 'disabled', igual: true } },
          pista: 'En la primera página el botón Anterior tiene que estar deshabilitado: [disabled]="currentPage === 1".' },
        { dom: { propiedad: { selector: '.pagination button:last-child', nombre: 'disabled', igual: false } } },
        { accion: { clic: '.pagination button:last-child' } },
        { accion: { esperar: 900 } },
        { dom: { textos: { selector: '.pagination span', igual: ['2 / 17'] } },
          pista: 'Al apretar Siguiente el componente tiene que emitir pageChange con la página 2.' },
        { pedidos: { ultimo: 'limit=12&skip=12' } },
        { dom: { propiedad: { selector: '.pagination button:first-child', nombre: 'disabled', igual: false } },
          pista: 'En la página 2 el botón Anterior tiene que estar habilitado.' }
    ]
},

    /* ------------------------------------------------------------------------
     * Búsqueda y filtros
     * ---------------------------------------------------------------------- */

{
    id: 'p04',
    titulo: 'Búsqueda con /search',
    minutos: 22,
    abrir: RUTA.servicio,

    teoria: [
        { h: 'Otro endpoint, la misma respuesta' },
        { p: 'Para buscar, la API ofrece **otro endpoint**: `/products/search`, con el parámetro `q`. Lo importante es que **la respuesta tiene la misma forma**: `products`, `total`, `skip` y `limit`. Por eso el resto de la aplicación, la lista y la paginación, funciona sin cambios.' },
        { tabla: {
            cabeceras: ['Qué querés', 'URL'],
            filas: [
                ['Todos los productos, paginados', '`/products?limit=12&skip=0`'],
                ['Buscar "phone", paginado', '`/products/search?q=phone&limit=12&skip=0`']
            ]
        } },
        { p: 'El service decide cuál usar según haya o no un término de búsqueda:' },
        { codigo: C(`
getProducts(limit: number, skip: number, search = ''): Observable<ProductsResponse> {
  const url = search
    ? \`\${this.apiUrl}/search?q=\${search}&limit=\${limit}&skip=\${skip}\`
    : \`\${this.apiUrl}?limit=\${limit}&skip=\${skip}\`;

  return this.http.get<ProductsResponse>(url);
}
`), archivo: 'product.service.ts' },
        { p: '`search = \'\'` es un **parámetro con valor por defecto**: si nadie le pasa nada, es el texto vacío, que cuenta como "no hay búsqueda".' },
        { h: 'En la page' },
        { codigo: C(`
readonly search = signal('');

buscar(termino: string): void {
  this.search.set(termino);
  this.loadPage(1);            // siempre volver a la página 1
}
`), archivo: 'products-page.component.ts' },
        { clave: 'Al buscar hay que **volver a la página 1**. Si estabas en la página 5 y buscás "phone", que sólo tiene 8 resultados, la página 5 **no existe**: la lista quedaría vacía. Es el error más frecuente de esta clase.' },
        { p: 'Y `loadPage` pasa el término al service: `getProducts(this.pageSize, skip, this.search())`.' }
    ],

    consigna: [
        { p: 'La page ya tiene el cuadro de búsqueda en el template, pero no funciona: le faltan las dos mitades del código.' },
        { numerada: [
            'En **`product.service.ts`**: agregá el parámetro `search = \'\'` a `getProducts`. Si hay búsqueda, la URL es `/search?q=...&limit=...&skip=...`; si no, la de siempre.',
            'En **`products-page.component.ts`**: creá el signal `search` (`signal(\'\')`).',
            'Escribí `buscar(termino)`: guarda el término en `search` y **vuelve a la página 1** con `loadPage(1)`.',
            'En `loadPage`, pasale `this.search()` como tercer parámetro a `getProducts`.'
        ] },
        { p: 'Con "phone" tienen que aparecer 8 productos, una sola página y el texto "Resultados para "phone" · 8 encontrados". El botón Limpiar vuelve a todo.' }
    ],

    semilla: proyecto({
        paginador: true,
        paginaTs: { total: true, pag: true },
        paginaHtml: { pag: true, buscador: true }
    }),

    solucion: {
        'app/core/services/product.service.ts': SERVICIO_BUSQUEDA,
        'app/features/products/pages/products-page/products-page.component.ts': paginaTs({ total: true, pag: true, search: true })
    },

    chequeos: [
        { fuente: { archivo: RUTA.servicio, debeTener: [
            { re: "search\\s*=\\s*''", que: "Falta el parámetro con valor por defecto:  search = ''." },
            { re: '/search\\?q=\\$\\{\\s*search\\s*\\}', que: 'La búsqueda usa /search?q=${search}, con una template string.' },
            { re: 'limit=\\$\\{\\s*limit\\s*\\}', que: 'La URL sigue llevando limit=${limit}.' }
          ] } },
        { fuente: { archivo: RUTA.paginaTs, debeTener: [
            { re: "search\\s*=\\s*signal\\s*\\(\\s*''", que: "Falta el signal:  readonly search = signal('');" },
            { re: 'buscar\\s*\\(\\s*termino\\s*:\\s*string\\s*\\)', que: 'Falta el método buscar(termino: string).' },
            { re: 'search\\.set\\s*\\(\\s*termino', que: 'buscar tiene que guardar el término:  this.search.set(termino);' },
            { re: 'this\\.loadPage\\s*\\(\\s*1\\s*\\)', que: 'Después de buscar hay que volver a la página 1:  this.loadPage(1);' },
            { re: 'getProducts\\s*\\(\\s*this\\.pageSize\\s*,\\s*skip\\s*,\\s*this\\.search\\s*\\(\\s*\\)', que: 'loadPage tiene que pasar la búsqueda:  getProducts(this.pageSize, skip, this.search()).' }
          ] } },
        { arranca: true },
        { sinErrores: true,
          pista: 'Si dice que search o buscar no son funciones, faltan en la page.' },
        { accion: { esperar: 900 } },
        { dom: { contar: { selector: 'app-product-card', es: 12 } } },
        { accion: { clic: '.pagination button:last-child' } },
        { accion: { esperar: 900 } },
        { dom: { textos: { selector: '.pagination span', igual: ['2 / 17'] } } },
        { accion: { escribir: ['input[type="search"]', 'phone'] } },
        { accion: { clic: '#buscar' } },
        { accion: { esperar: 900 } },
        { pedidos: { ultimo: 'search?q=phone&limit=12&skip=0' },
          pista: 'Estabas en la página 2 y buscaste: el pedido tiene que ser de la página 1 (skip=0). buscar tiene que llamar a loadPage(1).' },
        { dom: { contar: { selector: 'app-product-card', es: 8 } },
          pista: 'Buscar "phone" tiene que dar 8 productos.' },
        { dom: { textos: { selector: '#resultados', igual: ['Resultados para "phone" · 8 encontrados'] } },
          pista: 'El total (8) sale de la respuesta: this.total.set(response.total).' },
        { dom: { textos: { selector: '.pagination span', igual: ['1 / 1'] } } },
        { accion: { clic: '#limpiar' } },
        { accion: { esperar: 900 } },
        { dom: { contar: { selector: 'app-product-card', es: 12 } } },
        { dom: { noExiste: { selector: '#resultados' } } },
        { pedidos: { ultimo: '?limit=12&skip=0' },
          pista: 'Al limpiar, buscar(\'\') tiene que volver al endpoint de siempre, sin /search.' },
        { dom: { textos: { selector: '.pagination span', igual: ['1 / 17'] } } }
    ]
},

{
    id: 'p05',
    titulo: 'Bonus: categorías y orden',
    minutos: 22,
    abrir: RUTA.servicio,

    teoria: [
        { h: 'Más endpoints, más parámetros' },
        { p: 'La API ofrece más formas de pedir productos. Todas devuelven la **misma forma de respuesta**, así que la lista y la paginación siguen funcionando igual:' },
        { tabla: {
            cabeceras: ['Qué querés', 'URL'],
            filas: [
                ['Sólo una categoría', '`/products/category/laptops?limit=12&skip=0`'],
                ['Ordenar por precio, de menor a mayor', '`/products?limit=12&skip=0&sortBy=price&order=asc`'],
                ['Ordenar por precio, de mayor a menor', '`/products?limit=12&skip=0&sortBy=price&order=desc`']
            ]
        } },
        { p: 'La categoría **cambia el camino** de la URL (`/category/laptops`); el orden **agrega parámetros** al final (`sortBy` y `order`).' },
        { h: 'Demasiados parámetros' },
        { p: '`getProducts(limit, skip, search, category, sortBy, order)` ya son seis parámetros posicionales: fácil confundir el orden. Cuando una función acumula opciones, conviene agruparlas en **un objeto** con una interface, donde cada una es opcional.' },
        { codigo: C(`
export interface ProductQuery {
  search?: string;
  category?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}
`), archivo: 'core/models/product-query.interface.ts' },
        { codigo: C(`
getProducts(limit: number, skip: number, query: ProductQuery = {}): Observable<ProductsResponse> {
  const { search = '', category = '', sortBy = '', order = 'asc' } = query;

  let url = this.apiUrl;

  if (search) {
    url += \`/search?q=\${search}&\`;
  } else if (category) {
    url += \`/category/\${category}?\`;
  } else {
    url += '?';
  }

  url += \`limit=\${limit}&skip=\${skip}\`;

  if (sortBy) {
    url += \`&sortBy=\${sortBy}&order=\${order}\`;
  }

  return this.http.get<ProductsResponse>(url);
}
`), archivo: 'product.service.ts' },
        { p: 'La línea con `{ search = \'\', ... } = query` se llama **desestructuración con valores por defecto**: saca cada propiedad del objeto y, si falta, usa el valor de la derecha. La URL se **arma por partes**, sumando lo que corresponda.' },
        { nota: 'Si hay búsqueda, la API **ignora la categoría**: `/search` y `/category` son endpoints distintos. Por eso el `if` los trata como excluyentes.' }
    ],

    consigna: [
        { p: 'La page y el template ya tienen los dos selectores (categoría y orden) y arman el objeto de opciones, pero el service todavía espera un texto como tercer parámetro. Refactorizalo:' },
        { numerada: [
            'Importá `ProductQuery` desde `\'../models/product-query.interface\'` (la interface ya existe).',
            'Cambiá el tercer parámetro de `getProducts` por `query: ProductQuery = {}`.',
            'Desestructurá `search`, `category`, `sortBy` y `order` de `query`, con sus valores por defecto.',
            'Armá la URL por partes: `/search?q=...&` si hay búsqueda; `/category/...?` si hay categoría; `?` si no hay ninguna. Después `limit` y `skip`.',
            'Si hay `sortBy`, sumá `&sortBy=...&order=...` al final.'
        ] }
    ],

    semilla: proyecto({
        paginador: true,
        consulta: true,
        servicio: SERVICIO_BUSQUEDA,
        paginaTs: { total: true, pag: true, search: true, query: true },
        paginaHtml: { pag: true, buscador: true, query: true }
    }),

    solucion: {
        'app/core/services/product.service.ts': SERVICIO_CONSULTA
    },

    chequeos: [
        { fuente: { archivo: RUTA.servicio, debeTener: [
            { re: 'import\\s*\\{\\s*ProductQuery\\s*\\}\\s*from\\s*.\\.\\./models/product-query\\.interface', que: "Falta importar ProductQuery:  import { ProductQuery } from '../models/product-query.interface';" },
            { re: 'query\\s*:\\s*ProductQuery', que: 'El tercer parámetro es un objeto:  query: ProductQuery = {}.' },
            { re: '/category/\\$\\{\\s*category\\s*\\}', que: 'Falta el camino de categoría:  /category/${category}.' },
            { re: 'sortBy=\\$\\{\\s*sortBy\\s*\\}', que: 'Falta el parámetro de orden:  &sortBy=${sortBy}.' },
            { re: 'order=\\$\\{\\s*order\\s*\\}', que: 'Falta el sentido del orden:  &order=${order}.' }
          ] } },
        { arranca: true },
        { sinErrores: true },
        { accion: { esperar: 900 } },
        { dom: { contar: { selector: 'app-product-card', es: 12 } } },
        { pedidos: { ultimo: 'https://dummyjson.com/products?limit=12&skip=0' },
          pista: 'Sin filtros el pedido tiene que ser el de siempre:  /products?limit=12&skip=0.' },
        { accion: { elegir: ['#categoria', 'laptops'] } },
        { accion: { esperar: 900 } },
        { pedidos: { ultimo: '/products/category/laptops?limit=12&skip=0' },
          pista: 'Con categoría el camino cambia:  /products/category/laptops?limit=12&skip=0.' },
        { dom: { contar: { selector: 'app-product-card', es: 6 } } },
        { dom: { textos: { selector: '.pagination span', igual: ['1 / 1'] } } },
        { accion: { elegir: ['#orden', 'price-desc'] } },
        { accion: { esperar: 900 } },
        { pedidos: { ultimo: 'sortBy=price&order=desc' },
          pista: 'Con orden se agrega al final:  &sortBy=price&order=desc.' },
        { dom: { textos: { selector: 'app-product-card:first-child .card__title', igual: ['Asus Zenbook Pro Dual Screen Laptop'] } },
          pista: 'Ordenadas de mayor a menor precio, la primera laptop es la Asus Zenbook Pro.' },
        { accion: { elegir: ['#categoria', ''] } },
        { accion: { esperar: 900 } },
        { pedidos: { ultimo: 'https://dummyjson.com/products?limit=12&skip=0&sortBy=price&order=desc' } },
        { dom: { textos: { selector: 'app-product-card:first-child .card__title', igual: ['Dodge Hornet GT Plus'] } } }
    ]
},

    /* ------------------------------------------------------------------------
     * Estados
     * ---------------------------------------------------------------------- */

{
    id: 'p06',
    titulo: 'Estados: cargando, error y vacío',
    minutos: 24,
    abrir: RUTA.paginaTs,

    teoria: [
        { h: 'Una pantalla honesta' },
        { p: 'Hasta ahora la aplicación sólo conoce el camino feliz: el pedido sale bien y hay datos. Una aplicación real tiene que **contarle al usuario qué está pasando** en los otros casos. Toda lista que depende de una API tiene, como mínimo, cuatro estados:' },
        { tabla: {
            cabeceras: ['Estado', 'Cuándo', 'Qué se muestra'],
            filas: [
                ['**Cargando**', 'El pedido salió y todavía no hay respuesta', 'Un indicador: `<app-loader />`'],
                ['**Error**', 'El pedido falló: sin internet, servidor caído', 'Un mensaje claro y un botón **Reintentar**'],
                ['**Vacío**', 'El pedido salió bien pero no hay resultados', '"No encontramos productos"'],
                ['**Éxito**', 'Llegaron datos', 'La lista y la paginación']
            ]
        } },
        { clave: 'Los estados son **excluyentes**: en cada momento hay uno solo. Por eso el template usa una cadena de `@if / @else if / @else`.' },
        { codigo: C(`
@if (loading()) {
  <app-loader />
} @else if (error()) {
  <p class="error">{{ error() }}</p>
  <button (click)="loadPage(page())">Reintentar</button>
} @else if (products().length === 0) {
  <p class="vacio">No encontramos productos.</p>
} @else {
  <app-product-list [products]="products()" />
  <app-pagination ... />
}
`), archivo: 'products-page.component.html' },
        { h: 'El error en el código' },
        { p: '`subscribe` acepta un objeto con **dos** callbacks: `next` para cuando llega la respuesta y `error` para cuando falla. Sin el segundo, un fallo de red sale como error sin capturar y la pantalla se queda en "Cargando…" para siempre.' },
        { codigo: C(`
this.productService.getProducts(this.pageSize, skip).subscribe({
  next: (response) => { ... },
  error: () => {
    this.error.set('No pudimos cargar los productos. Reintentá.');
    this.loading.set(false);
  },
});
`), archivo: 'el callback error' },
        { nota: 'Dos detalles fáciles de olvidar: al **empezar** un pedido hay que **limpiar** el error anterior (`this.error.set(null)`), y en el callback `error` hay que **apagar** `loading`. Si no, el spinner queda girando sobre el mensaje de error.' },
        { p: 'Para probarlo, arriba de la vista previa hay un selector **Red**: poné "Sin conexión" y hacé un pedido para ver el estado de error. El botón Reintentar vuelve a pedir **la misma página**, porque `page()` sólo cambia cuando un pedido sale bien.' }
    ],

    consigna: [
        { p: 'La aplicación sólo maneja el camino feliz: con "Sin conexión" queda cargando para siempre. Sumale los estados. `LoaderComponent` ya existe en `shared`:' },
        { numerada: [
            'En la page: creá el signal `error` con `signal<string | null>(null)`.',
            'En `loadPage`, poné `error` en `null` al empezar.',
            'Agregá el callback `error` al `subscribe`: guardá `\'No pudimos cargar los productos. Reintentá.\'` en `error` y apagá `loading`.',
            'Importá `LoaderComponent` y agregalo a `imports`.',
            'En el template: `@if (loading())` con `<app-loader />`; `@else if (error())` con un `<p id="error">` y un `<button id="reintentar">` que llama a `loadPage(page())`; `@else if (products().length === 0)` con `<p id="vacio">No encontramos productos.</p>`; y `@else` con la lista y la paginación.'
        ] }
    ],

    semilla: proyecto({
        paginador: true,
        cargador: true,
        servicio: SERVICIO_BUSQUEDA,
        paginaTs: { total: true, pag: true, search: true },
        paginaHtml: { pag: true, buscador: true }
    }),

    solucion: {
        'app/features/products/pages/products-page/products-page.component.ts': paginaTs({ total: true, pag: true, search: true, states: true }),
        'app/features/products/pages/products-page/products-page.component.html': paginaHtml({ pag: true, buscador: true, states: true })
    },

    chequeos: [
        { fuente: { archivo: RUTA.paginaTs, debeTener: [
            { re: imp('LoaderComponent', '\\.\\./'), que: "Falta importar LoaderComponent desde '../../../../shared/components/loader/loader.component'." },
            { re: 'imports\\s*:\\s*\\[[^\\]]*LoaderComponent', que: 'Falta agregar LoaderComponent al array imports.' },
            { re: 'error\\s*=\\s*signal\\s*<\\s*string\\s*\\|\\s*null\\s*>\\s*\\(\\s*null', que: 'Falta el signal:  readonly error = signal<string | null>(null);' },
            { re: 'error\\.set\\s*\\(\\s*null\\s*\\)', que: 'Al empezar un pedido hay que limpiar el error anterior:  this.error.set(null);' },
            { re: 'error\\s*:\\s*\\(', que: 'Falta el callback error en el subscribe:  error: () => { ... }.' },
            { re: 'No pudimos cargar los productos\\. Reintentá\\.', que: "El mensaje tiene que ser exactamente: 'No pudimos cargar los productos. Reintentá.'" }
          ] } },
        { fuente: { archivo: RUTA.paginaHtml, debeTener: [
            { re: '<app-loader', que: 'Falta el <app-loader /> mientras carga.' },
            { re: '@else\\s+if\\s*\\(\\s*error\\(\\)', que: 'Falta el @else if (error()) { ... }.' },
            { re: 'id="reintentar"', que: 'Falta el botón con id="reintentar".' },
            { re: '@else\\s+if\\s*\\(\\s*products\\(\\)\\.length\\s*===\\s*0', que: 'Falta el @else if (products().length === 0) { ... } para el estado vacío.' },
            { re: 'id="vacio"', que: 'Falta el párrafo con id="vacio".' }
          ] } },
        { arranca: true },
        { sinErrores: true },
        { dom: { existe: { selector: '.loader' } },
          pista: 'Mientras carga tiene que verse <app-loader />.' },
        { dom: { noExiste: { selector: '#error' } } },
        { accion: { esperar: 900 } },
        { dom: { contar: { selector: 'app-product-card', es: 12 } } },
        { dom: { noExiste: { selector: '.loader' } } },

        { accion: { red: 'caida' } },
        { accion: { clic: '.pagination button:last-child' } },
        { dom: { existe: { selector: '.loader' } },
          pista: 'Al pedir la página 2 tiene que volver a mostrarse el loader.' },
        { accion: { esperar: 900 } },
        { dom: { textos: { selector: '#error', igual: ['No pudimos cargar los productos. Reintentá.'] } },
          pista: 'Sin conexión el pedido falla: el callback error tiene que guardar el mensaje. Si queda cargando para siempre, falta apagar loading en el error.' },
        { dom: { existe: { selector: '#reintentar' } } },
        { dom: { noExiste: { selector: '.loader' } },
          pista: 'En el estado de error el loader tiene que haberse apagado: this.loading.set(false).' },
        { dom: { noExiste: { selector: '.pagination' } } },

        { accion: { red: 'normal' } },
        { accion: { clic: '#reintentar' } },
        { accion: { esperar: 900 } },
        { dom: { noExiste: { selector: '#error' } },
          pista: 'Al reintentar y salir bien, el mensaje de error tiene que desaparecer: this.error.set(null) al empezar.' },
        { dom: { contar: { selector: 'app-product-card', es: 12 } } },
        { dom: { textos: { selector: '.pagination span', igual: ['1 / 17'] } },
          pista: 'Reintentar vuelve a pedir la misma página: la que se estaba mostrando, la 1.' },

        { accion: { escribir: ['input[type="search"]', 'zzzz'] } },
        { accion: { clic: '#buscar' } },
        { accion: { esperar: 900 } },
        { dom: { textos: { selector: '#vacio', igual: ['No encontramos productos.'] } },
          pista: 'Una búsqueda sin resultados no es un error: el pedido sale bien pero no hay productos. Es el estado vacío.' },
        { dom: { noExiste: { selector: 'app-product-card' } } },
        { dom: { noExiste: { selector: '#error' } } }
    ]
},

    /* ------------------------------------------------------------------------
     * Desafío
     * ---------------------------------------------------------------------- */

{
    id: 'p07',
    titulo: 'Desafío final: MiniStore completo',
    minutos: 40,
    abrir: RUTA.servicio,

    teoria: [
        { h: 'Lo que ya sabés, todo junto' },
        { p: 'Este paso no trae teoría nueva. Tenés una tienda que lista productos y pagina, y tenés que sumarle **búsqueda** y **los cuatro estados**. Es lo mismo que hiciste por partes, pero ahora sin las piezas armadas.' },
        { h: 'Un orden de trabajo' },
        { p: 'Las funcionalidades dependen unas de otras. Conviene construirlas en este orden, verificando cada una antes de pasar a la siguiente:' },
        { numerada: [
            '**El service**: agregá el parámetro `search` y armá la URL de `/search`.',
            '**La page**: el signal `search` y el método `buscar`, que **vuelve a la página 1**.',
            '**El template**: el cuadro de búsqueda, el botón Buscar y el resultado con el botón Limpiar.',
            '**El error**: el signal, el callback `error` y limpiarlo al empezar un pedido.',
            '**El template de estados**: la cadena `@if / @else if / @else`.',
            '**Probar con la red**: "Sin conexión", Reintentar, y una búsqueda sin resultados.'
        ] },
        { h: 'Los errores de siempre' },
        { tabla: {
            cabeceras: ['Síntoma', 'Causa probable'],
            filas: [
                ['`No provider for HttpClient`', 'Falta `provideHttpClient()` en `app.config.ts`'],
                ['`app-loader is not a known element`', 'Falta agregar `LoaderComponent` al array `imports` de la page'],
                ['Buscás y la lista aparece vacía', 'No volviste a la página 1 al buscar'],
                ['Pantalla en "Cargando…" para siempre', 'Falta el callback `error`, o no apaga `loading`'],
                ['El mensaje de error no se va al reintentar', 'No limpiás `error` al empezar el pedido'],
                ['La paginación muestra `1 / 17` con una búsqueda', 'El `total` no sale de la respuesta: `total.set(response.total)`']
            ]
        } },
        { nota: 'Los ids que se piden en el template son los que usa la verificación. Las clases y el resto del diseño, como siempre, son tuyos.' }
    ],

    consigna: [
        { p: 'El proyecto pagina bien, pero no busca ni maneja errores. Sumale todo lo que falta. `LoaderComponent` ya existe en `shared`.' },
        { p: '**Búsqueda**' },
        { numerada: [
            '`getProducts(limit, skip, search = \'\')`: con búsqueda, la URL es `/search?q=...&limit=...&skip=...`.',
            'En la page: signal `search` y método `buscar(termino)`, que guarda el término y **vuelve a la página 1**. `loadPage` tiene que pasar `this.search()`.',
            'En el template: un `<input type="search">` con una referencia `#q`, y un botón `id="buscar"` que llama a `buscar(q.value)`.',
            'Si hay búsqueda, mostrar `<p id="resultados">` con el texto **`Resultados para "phone" · 8 encontrados`** (con el término y el total reales) y un botón `id="limpiar"` que llama a `buscar(\'\')`.'
        ] },
        { p: '**Estados**' },
        { numerada: [
            'Signal `error` (`signal<string | null>(null)`), que se limpia al empezar cada pedido.',
            'Callback `error` en el `subscribe`, con el mensaje **`No pudimos cargar los productos. Reintentá.`**, que también apaga `loading`.',
            'Template: `<app-loader />` cargando; `<p id="error">` y `<button id="reintentar">` (que vuelve a pedir la página actual) si falló; `<p id="vacio">No encontramos productos.</p>` si no hay resultados; y la lista con la paginación si todo salió bien.'
        ] }
    ],

    semilla: proyecto({
        paginador: true,
        cargador: true,
        paginaTs: { total: true, pag: true },
        paginaHtml: { pag: true }
    }),

    solucion: {
        'app/core/services/product.service.ts': SERVICIO_BUSQUEDA,
        'app/features/products/pages/products-page/products-page.component.ts': paginaTs({ total: true, pag: true, search: true, states: true }),
        'app/features/products/pages/products-page/products-page.component.html': paginaHtml({ pag: true, buscador: true, states: true })
    },

    chequeos: [
        { fuente: { archivo: RUTA.servicio, debeTener: [
            { re: "search\\s*=\\s*''", que: "El service tiene que recibir la búsqueda:  search = ''." },
            { re: '/search\\?q=\\$\\{\\s*search\\s*\\}', que: 'La búsqueda usa el endpoint  /search?q=${search}.' }
          ] } },
        { fuente: { archivo: RUTA.paginaTs, debeTener: [
            { re: "search\\s*=\\s*signal\\s*\\(\\s*''", que: "Falta el signal:  readonly search = signal('');" },
            { re: 'buscar\\s*\\(', que: 'Falta el método buscar(termino).' },
            { re: 'this\\.loadPage\\s*\\(\\s*1\\s*\\)', que: 'Después de buscar hay que volver a la página 1.' },
            { re: 'error\\s*=\\s*signal', que: 'Falta el signal error.' },
            { re: 'error\\s*:\\s*\\(', que: 'Falta el callback error en el subscribe.' },
            { re: 'No pudimos cargar los productos\\. Reintentá\\.', que: "El mensaje de error tiene que ser exactamente: 'No pudimos cargar los productos. Reintentá.'" }
          ] } },
        { fuente: { archivo: RUTA.paginaHtml, debeTener: [
            { re: 'type="search"', que: 'Falta el <input type="search">.' },
            { re: 'id="buscar"', que: 'Falta el botón con id="buscar".' },
            { re: 'id="resultados"', que: 'Falta el párrafo con id="resultados".' },
            { re: 'id="limpiar"', que: 'Falta el botón con id="limpiar".' },
            { re: '<app-loader', que: 'Falta el <app-loader /> mientras carga.' },
            { re: 'id="error"', que: 'Falta el párrafo con id="error".' },
            { re: 'id="reintentar"', que: 'Falta el botón con id="reintentar".' },
            { re: 'id="vacio"', que: 'Falta el párrafo con id="vacio".' }
          ] } },
        { arranca: true },
        { sinErrores: true },

        { dom: { existe: { selector: '.loader' } } },
        { accion: { esperar: 900 } },
        { dom: { contar: { selector: 'app-product-card', es: 12 } } },
        { dom: { textos: { selector: '.pagination span', igual: ['1 / 17'] } } },

        { accion: { clic: '.pagination button:last-child' } },
        { accion: { esperar: 900 } },
        { dom: { textos: { selector: '.pagination span', igual: ['2 / 17'] } } },

        { accion: { escribir: ['input[type="search"]', 'phone'] } },
        { accion: { clic: '#buscar' } },
        { accion: { esperar: 900 } },
        { pedidos: { ultimo: 'search?q=phone&limit=12&skip=0' },
          pista: 'Al buscar hay que volver a la página 1: el pedido tiene que llevar skip=0.' },
        { dom: { contar: { selector: 'app-product-card', es: 8 } } },
        { dom: { textos: { selector: '#resultados', igual: ['Resultados para "phone" · 8 encontrados'] } } },
        { dom: { textos: { selector: '.pagination span', igual: ['1 / 1'] } } },

        { accion: { clic: '#limpiar' } },
        { accion: { esperar: 900 } },
        { dom: { contar: { selector: 'app-product-card', es: 12 } } },
        { dom: { noExiste: { selector: '#resultados' } } },

        { accion: { red: 'caida' } },
        { accion: { clic: '.pagination button:last-child' } },
        { accion: { esperar: 900 } },
        { dom: { textos: { selector: '#error', igual: ['No pudimos cargar los productos. Reintentá.'] } },
          pista: 'Sin conexión tiene que verse el mensaje de error, con el botón Reintentar.' },
        { dom: { noExiste: { selector: '.loader' } } },

        { accion: { red: 'normal' } },
        { accion: { clic: '#reintentar' } },
        { accion: { esperar: 900 } },
        { dom: { noExiste: { selector: '#error' } } },
        { dom: { contar: { selector: 'app-product-card', es: 12 } } },

        { accion: { escribir: ['input[type="search"]', 'zzzz'] } },
        { accion: { clic: '#buscar' } },
        { accion: { esperar: 900 } },
        { dom: { textos: { selector: '#vacio', igual: ['No encontramos productos.'] } } },
        { dom: { noExiste: { selector: '#error' } } },
        { dom: { noExiste: { selector: '.loader' } } }
    ]
}

    ];

    pasos.forEach(function (p) { CONTENIDO.ministore2.push(p); });
})();
