/* ============================================================================
 * angular.js — La pantalla de la clase de Angular.
 *
 * Es el equivalente de app.js para Angular, con dos diferencias de fondo:
 *
 *   1. Está ENCAPSULADO. Todo vive adentro de `ClaseAngular`; no declara ninguna
 *      variable global. app.js ya usa nombres como `estado`, `editor` o
 *      `arrancar`, y comparten la misma página, así que tocar uno rompería al
 *      otro. Lo único que se toma prestado de app.js son cuatro funciones puras
 *      (escapar, marcado, dibujarBloques y la constante CONTENIDO), que no
 *      leen ni escriben nada de afuera.
 *
 *   2. En lugar de un servidor simulado y una terminal, tiene una VISTA PREVIA
 *      (vista.js) con Angular real, y una consola que muestra lo que Angular
 *      dice por dentro (errores NG0xxx, console.log del alumno).
 *
 * El proyecto del alumno es un objeto { 'ruta/archivo.ts': 'texto' }. Se guarda
 * en localStorage con el mismo formato que Express: { paso, completados,
 * archivos, activo }, así el panel de inicio calcula el avance sin saber de qué
 * clase se trata.
 * ========================================================================== */

var ClaseAngular = (function () {
    'use strict';

    /* Todos los ids de la pantalla de Angular llevan el prefijo "ng-", porque
       la de Express (que está en la misma página, oculta) usa los mismos nombres
       sin prefijo: `teoria`, `resultado`, `boton-verificar`... Pedir uno sin
       prefijo escribiría en la pantalla equivocada SIN dar ningún error.
       Por eso el controlador nunca llama a getElementById directamente. */
    function $(id) {
        var nodo = document.getElementById(id.indexOf('ng-') === 0 ? id : 'ng-' + id);
        if (!nodo) throw new Error('ClaseAngular: no existe el elemento ng-' + id.replace(/^ng-/, ''));
        return nodo;
    }

    var DEMORA_GUARDADO = 400;      // ms sin teclear antes de guardar
    var DEMORA_EJECUCION = 700;     // ms sin teclear antes de volver a ejecutar

    var estado = {
        paso: 0,
        completados: {},
        archivos: {},
        activo: null,
        proyectoDe: null,       // id del paso al que pertenece el proyecto en pantalla
        trabajo: {}             // { idPaso: { archivos } }: el proyecto de CADA paso
    };

    var relojGuardado = null;
    var relojEjecucion = null;
    var ejecutando = 0;             // contador: sólo la última ejecución actualiza la pantalla
    var erroresConsola = 0;

    var el = {};                    // referencias al DOM, se llenan en arrancar()

    /* ------------------------------------------------------------------------
     * Guardado
     * ---------------------------------------------------------------------- */

    function guardarYa() {
        clearTimeout(relojGuardado);
        try {
            /* El proyecto en pantalla ES el trabajo de su paso (el mismo objeto). */
            if (estado.proyectoDe) estado.trabajo[estado.proyectoDe] = estado.archivos;
            localStorage.setItem(CLASE_ACTUAL.clave, JSON.stringify({
                paso: estado.paso,
                completados: estado.completados,
                archivos: estado.archivos,
                activo: estado.activo,
                proyectoDe: estado.proyectoDe,
                trabajo: estado.trabajo
            }));
        } catch (e) { /* modo privado o cuota llena: se sigue sin guardar */ }
    }

    function guardar() {
        clearTimeout(relojGuardado);
        relojGuardado = setTimeout(guardarYa, DEMORA_GUARDADO);
    }

    function recuperar() {
        var crudo = null;
        try { crudo = localStorage.getItem(CLASE_ACTUAL.clave); } catch (e) { return false; }
        if (!crudo) return false;
        try {
            var d = JSON.parse(crudo);
            if (!d || typeof d !== 'object') return false;
            estado.paso = Math.min(Math.max(d.paso | 0, 0), PASOS.length - 1);
            estado.completados = d.completados && typeof d.completados === 'object' ? d.completados : {};
            estado.activo = typeof d.activo === 'string' ? d.activo : null;

            /* Formato nuevo: un proyecto guardado POR PASO (`trabajo`). El formato
               viejo guardaba un solo proyecto que se arrastraba de paso en paso y
               no se puede repartir: se descarta, se conserva el avance, y cada paso
               arranca de su semilla. */
            var trabajo = d.trabajo && typeof d.trabajo === 'object' ? d.trabajo : null;
            estado.trabajo = trabajo || {};
            estado.proyectoDe = trabajo && typeof d.proyectoDe === 'string' ? d.proyectoDe : null;
            var actual = estado.proyectoDe ? estado.trabajo[estado.proyectoDe] : null;
            if (actual && typeof actual === 'object' && Object.keys(actual).length) {
                estado.archivos = actual;
            } else {
                estado.archivos = {};
                estado.proyectoDe = null;
            }
            return true;
        } catch (e) { return false; }
    }

    /* ------------------------------------------------------------------------
     * Consola
     * ---------------------------------------------------------------------- */

    var ETIQUETAS = { log: '', warn: 'aviso', error: 'error' };

    function lineaConsola(nivel, texto, extra) {
        var div = document.createElement('div');
        div.className = 'linea-consola ' + (extra || ETIQUETAS[nivel] || '');
        var m = /(NG0\d+)/.exec(texto);
        if (m) {
            div.innerHTML = escaparTexto(texto).replace(m[1], '<span class="codigo-ng">' + m[1] + '</span>');
        } else {
            div.textContent = texto;
        }
        var cuerpo = el.consolaCuerpo;
        var pegado = cuerpo.scrollTop + cuerpo.clientHeight >= cuerpo.scrollHeight - 30;
        var vacia = cuerpo.querySelector('.ng-consola-vacia');
        if (vacia) cuerpo.removeChild(vacia);
        cuerpo.appendChild(div);
        if (cuerpo.children.length > 300) cuerpo.removeChild(cuerpo.firstChild);
        if (pegado) cuerpo.scrollTop = cuerpo.scrollHeight;

        if (nivel === 'error') {
            erroresConsola++;
            el.contadorErrores.textContent = erroresConsola > 99 ? '99+' : String(erroresConsola);
            el.contadorErrores.hidden = false;
        }
    }

    function escaparTexto(t) {
        return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function limpiarConsola() {
        el.consolaCuerpo.innerHTML =
            '<div class="ng-consola-vacia">Acá aparece lo que Angular dice por dentro: tus <code>console.log</code> y los errores con su código NG0xxx.</div>';
        erroresConsola = 0;
        el.contadorErrores.hidden = true;
    }

    /* ------------------------------------------------------------------------
     * Vista previa
     * ---------------------------------------------------------------------- */

    function estadoVista(clase, texto) {
        el.estadoVista.className = 'estado ' + (clase || '');
        el.estadoVista.textContent = texto || '';
    }

    function mostrarVelo(tipo, titulo, detalle) {
        if (!tipo) { el.velo.hidden = true; return; }
        el.velo.hidden = false;
        el.velo.className = 'ng-vista-velo ' + tipo;
        el.velo.innerHTML = '';
        if (tipo === 'cargando') {
            el.velo.innerHTML = '<div class="ng-barra-carga"><i></i></div><strong>' + escaparTexto(titulo) + '</strong>';
        } else {
            el.velo.innerHTML = '<strong>' + escaparTexto(titulo) + '</strong>' +
                                (detalle ? '<p>' + escaparTexto(detalle) + '</p>' : '');
        }
    }

    /** Ejecuta el proyecto actual en la vista previa. Devuelve el resultado del motor. */
    function ejecutar() {
        var mio = ++ejecutando;
        estadoVista('trabajando', 'Compilando…');

        return VistaAngular.ejecutar(estado.archivos, 'app/app.component.ts').then(function (r) {
            if (mio !== ejecutando) return r;                // llegó tarde: hay una más nueva en marcha

            if (r.ok) {
                mostrarVelo(null);
                var n = (r.errores || []).length;
                estadoVista(n ? 'mal' : 'bien', n ? n + (n === 1 ? ' error' : ' errores') + ' en la Consola' : 'Listo');
            } else {
                var texto = r.error ? r.error.mensaje : (r.detalle || '');
                mostrarVelo('error', r.titulo || 'La aplicación no arrancó', texto);
                estadoVista('mal', r.colgado ? 'Se colgó' : 'No arrancó');
                if (r.error) lineaConsola('error', r.error.mensaje +
                    (r.error.archivo ? '  (' + r.error.archivo + (r.error.linea ? ':' + r.error.linea : '') + ')' : ''));
            }
            return r;
        });
    }

    function programarEjecucion() {
        clearTimeout(relojEjecucion);
        estadoVista('trabajando', 'Esperando…');
        relojEjecucion = setTimeout(ejecutar, DEMORA_EJECUCION);
    }

    /* ------------------------------------------------------------------------
     * Editor: textarea transparente encima de un <pre> pintado.
     * Es la misma técnica que app.js; se repite acá porque app.js ata el editor
     * a variables globales que no se pueden compartir.
     * ---------------------------------------------------------------------- */

    var editor = { texto: null, pinta: null, regleta: null };

    function pintarEditor() {
        var nombre = estado.activo;
        var codigo = nombre ? (estado.archivos[nombre] || '') : '';
        editor.pinta.innerHTML = ResaltadorAngular.resaltar(codigo, ResaltadorAngular.lenguajeDe(nombre || ''));
        var lineas = codigo.split('\n').length;
        var nums = '';
        for (var i = 1; i <= lineas; i++) nums += i + '\n';
        editor.regleta.textContent = nums;
        editor.pinta.scrollTop = editor.texto.scrollTop;
        editor.pinta.scrollLeft = editor.texto.scrollLeft;
        editor.regleta.scrollTop = editor.texto.scrollTop;
    }

    function abrirArchivo(nombre) {
        estado.activo = nombre;
        var hay = nombre !== null && estado.archivos[nombre] !== undefined;
        editor.texto.value = hay ? estado.archivos[nombre] : '';
        editor.texto.disabled = !hay;
        pintarEditor();
        dibujarSolapas();
        guardar();
    }

    function nombreCorto(ruta) { return ruta.split('/').pop(); }

    function dibujarSolapas() {
        var nombres = Object.keys(estado.archivos).sort();
        el.solapas.innerHTML = '';
        nombres.forEach(function (n) {
            var b = document.createElement('button');
            b.className = 'solapa-archivo' + (n === estado.activo ? ' activa' : '');
            b.textContent = nombreCorto(n);
            b.title = n;
            b.addEventListener('click', function () { abrirArchivo(n); });
            el.solapas.appendChild(b);
        });
    }

    function iniciarEditor() {
        editor.texto = $('ng-editor');
        editor.pinta = $('ng-pintado');
        editor.regleta = $('ng-regleta');

        editor.texto.addEventListener('input', function () {
            if (!estado.activo) return;
            estado.archivos[estado.activo] = editor.texto.value;
            pintarEditor();
            guardar();
            programarEjecucion();
        });
        editor.texto.addEventListener('scroll', function () {
            editor.pinta.scrollTop = editor.texto.scrollTop;
            editor.pinta.scrollLeft = editor.texto.scrollLeft;
            editor.regleta.scrollTop = editor.texto.scrollTop;
        });
        editor.texto.addEventListener('keydown', function (e) {
            /* Tab inserta dos espacios; no saca el foco del editor. */
            if (e.key === 'Tab' && !e.shiftKey) {
                e.preventDefault();
                var t = editor.texto, a = t.selectionStart, b = t.selectionEnd;
                t.value = t.value.slice(0, a) + '  ' + t.value.slice(b);
                t.selectionStart = t.selectionEnd = a + 2;
                t.dispatchEvent(new Event('input'));
            }
        });
    }

    /* ------------------------------------------------------------------------
     * Pasos
     * ---------------------------------------------------------------------- */

    function paso() { return PASOS[estado.paso]; }

    function dibujarIndice() {
        /* Mismas clases que dibuja app.js en Express (paso-indice, numero-paso,
           titulo-paso, tilde): así el índice hereda todo su estilo de clase.css. */
        el.indice.innerHTML = PASOS.map(function (p, i) {
            var hecho = estado.completados[p.id] ? ' hecho' : '';
            var activo = i === estado.paso ? ' activo' : '';
            return '<button class="paso-indice' + hecho + activo + '" data-paso="' + i + '">' +
                   '<span class="numero-paso">' + (i + 1) + '</span>' +
                   '<span class="titulo-paso">' + escaparTexto(p.titulo) + '</span>' +
                   '<span class="tilde">&#10003;</span></button>';
        }).join('');
        Array.prototype.forEach.call(el.indice.querySelectorAll('[data-paso]'), function (b) {
            b.addEventListener('click', function () { irAPaso(Number(b.getAttribute('data-paso'))); });
        });

        var hechos = PASOS.filter(function (p) { return estado.completados[p.id]; }).length;
        $('progreso-texto').textContent = hechos + ' de ' + PASOS.length;
        $('progreso-barra').style.width = (PASOS.length ? (hechos / PASOS.length) * 100 : 0) + '%';
    }

    /* ------------------------------------------------------------------------
     * El proyecto de cada paso
     *
     * Cada paso trae SU proyecto completo (`semilla`). Al entrar se carga esa
     * semilla, y lo que el alumno escribe se guarda POR PASO en `estado.trabajo`:
     * volver a un paso ya trabajado recupera su código, y avanzar a uno nuevo
     * arranca limpio, sin arrastrar archivos de otro estilo (módulos o standalone).
     *
     * El proyecto en pantalla (`estado.archivos`) es el MISMO objeto que
     * `estado.trabajo[estado.proyectoDe]`: cualquier edición queda guardada sin
     * código extra. No se puede reasignar `estado.archivos` sin actualizar los dos.
     * ---------------------------------------------------------------------- */

    function clonar(obj) {
        var c = {};
        Object.keys(obj || {}).forEach(function (k) { c[k] = obj[k]; });
        return c;
    }

    /* Devuelve true si se llegó desde otro paso, false si es una recarga. */
    function armarProyectoDelPaso(indice) {
        var p = PASOS[indice];

        /* Recarga de la página: el proyecto en pantalla ya es el de este paso. */
        if (estado.proyectoDe === p.id && Object.keys(estado.archivos).length) return false;

        var previo = estado.trabajo[p.id];
        var base = (previo && typeof previo === 'object' && Object.keys(previo).length) ? previo : clonar(p.semilla);
        estado.trabajo[p.id] = base;
        estado.archivos = base;
        estado.proyectoDe = p.id;
        return true;
    }

    function archivoAAbrir(p, llegaDeOtroPaso) {
        function hay(n) { return !!n && estado.archivos[n] !== undefined; }
        if (!llegaDeOtroPaso && hay(estado.activo)) return estado.activo;
        if (hay(p.abrir)) return p.abrir;
        if (hay('app/app.component.ts')) return 'app/app.component.ts';
        return Object.keys(estado.archivos).sort()[0] || null;
    }

    function irAPaso(indice) {
        if (indice < 0 || indice >= PASOS.length) return;
        var p = PASOS[indice];

        var llegaDeOtro = armarProyectoDelPaso(indice);

        estado.paso = indice;
        var abrir = archivoAAbrir(p, llegaDeOtro);

        $('numero-actual').textContent = (indice + 1) + '.';
        $('titulo-actual').textContent = p.titulo;
        $('minutos-actual').textContent = '~' + p.minutos + ' min';
        $('teoria').innerHTML = dibujarBloquesAngular(p.teoria);
        $('consigna').innerHTML = dibujarBloquesAngular(p.consigna);
        $('columna-teoria').scrollTop = 0;

        $('anterior').disabled = indice === 0;
        $('siguiente').disabled = indice === PASOS.length - 1;
        $('boton-solucion').hidden = !p.solucion;

        limpiarResultado();
        dibujarIndice();
        abrirArchivo(abrir);
        guardar();
        limpiarConsola();
        ejecutar();
    }

    /* ------------------------------------------------------------------------
     * Teoría: dibujarBloques de app.js pinta los bloques de código con el
     * resaltador de JavaScript. Acá se necesita el de TypeScript + HTML, así
     * que se pintan los bloques de código a mano y el resto (h, p, tabla...)
     * se delega en app.js sin cambiarlo.
     * ---------------------------------------------------------------------- */

    function dibujarBloquesAngular(bloques) {
        return (bloques || []).map(function (b) {
            if (b.codigo) {
                var html = ResaltadorAngular.resaltar(b.codigo, 'auto');
                return '<div class="bloque-codigo">' +
                       (b.archivo ? '<div class="nombre-bloque">' + escapar(b.archivo) + '</div>' : '') +
                       '<pre><code>' + html + '</code></pre>' +
                       '<button class="copiar" data-copiar="' + escapar(b.codigo) + '">copiar</button>' +
                       '</div>';
            }
            return dibujarBloques([b]);
        }).join('');
    }

    /* ------------------------------------------------------------------------
     * Verificación
     * ---------------------------------------------------------------------- */

    function limpiarResultado() {
        el.resultado.hidden = true;
        el.resultado.className = 'resultado';
        el.resultado.innerHTML = '';
    }

    function mostrarResultado(clase, html) {
        el.resultado.hidden = false;
        el.resultado.className = 'resultado ' + clase;
        el.resultado.innerHTML = html;
    }

    function verificar() {
        var p = paso();
        var boton = $('boton-verificar');
        boton.disabled = true;
        mostrarResultado('esperando', '<h4>Verificando…</h4><p>Ejecutando tu aplicación y mirando la pantalla.</p>');
        clearTimeout(relojEjecucion);

        VerificadorAngular.verificar(VistaAngular, estado.archivos, p.chequeos || [], 'app/app.component.ts')
            .then(function (r) {
                boton.disabled = false;
                if (r.ok) {
                    estado.completados[p.id] = true;
                    guardarYa();
                    dibujarIndice();
                    var ultimo = estado.paso === PASOS.length - 1;
                    mostrarResultado('bien',
                        '<h4>¡Bien! Este paso está resuelto.</h4>' +
                        (ultimo ? '<p>Completaste la clase.</p>'
                                : '<p>Podés seguir con el próximo.</p><button class="boton primario" id="ng-ir-siguiente">Siguiente paso →</button>'));
                    var s = $('ng-ir-siguiente');
                    if (s) s.addEventListener('click', function () { irAPaso(estado.paso + 1); });
                    return;
                }
                var html = '<h4>' + escaparTexto(r.titulo || 'Todavía no') + '</h4>';
                if (r.detalle) html += '<p>' + escaparTexto(r.detalle) + '</p>';
                if (r.pista) html += '<p class="pista"><strong>Pista:</strong> ' + escaparTexto(r.pista) + '</p>';
                if (r.errorAngular) html += '<pre class="error-angular">' + escaparTexto(r.errorAngular) + '</pre>';
                mostrarResultado('mal', html);
                /* La verificación deja la vista en el estado del último chequeo;
                   se vuelve a ejecutar para que lo que se ve coincida con lo escrito. */
                ejecutar();
            });
    }

    function verSolucion() {
        var p = paso();
        if (!p.solucion) return;
        if (!confirm('Esto reemplaza tu código de este paso por la solución. ¿Seguro?')) return;
        Object.keys(p.solucion).forEach(function (n) { estado.archivos[n] = p.solucion[n]; });
        var abrir = Object.keys(p.solucion)[0];
        abrirArchivo(abrir);
        guardarYa();
        ejecutar();
    }

    function reiniciarTodo() {
        if (!confirm('Se borra todo tu avance de esta clase y se empieza de cero. ¿Seguro?')) return;
        try { localStorage.removeItem(CLASE_ACTUAL.clave); } catch (e) { /* nada */ }
        location.reload();
    }

    /* ------------------------------------------------------------------------
     * Solapas del panel inferior
     * ---------------------------------------------------------------------- */

    function iniciarSolapasPanel() {
        var botones = document.querySelectorAll('#ng-solapas-panel [data-panel]');
        Array.prototype.forEach.call(botones, function (b) {
            b.addEventListener('click', function () {
                Array.prototype.forEach.call(botones, function (o) { o.classList.toggle('activa', o === b); });
                var cual = b.getAttribute('data-panel');
                Array.prototype.forEach.call(document.querySelectorAll('.ng-panel-inferior .panel'), function (p) {
                    p.hidden = p.id !== 'ng-panel-' + cual;
                });
                if (cual === 'consola') {
                    el.contadorErrores.hidden = true;   // ya los vio
                }
            });
        });
    }

    /* ------------------------------------------------------------------------
     * Arranque
     * ---------------------------------------------------------------------- */

    function arrancar() {
        el.indice = $('indice-pasos');
        el.resultado = $('resultado');
        el.solapas = $('solapas-archivos');
        el.consolaCuerpo = $('ng-consola-cuerpo');
        el.contadorErrores = $('ng-contador-errores');
        el.estadoVista = $('ng-estado-vista');
        el.velo = $('ng-velo');
        iniciarEditor();
        iniciarSolapasPanel();
        limpiarConsola();

        VistaAngular.iniciar($('ng-pantalla'), function (nivel, texto) {
            lineaConsola(nivel, texto);
        });
        mostrarVelo('cargando', 'Cargando Angular…');

        $('boton-verificar').addEventListener('click', verificar);
        $('boton-solucion').addEventListener('click', verSolucion);
        $('boton-reiniciar').addEventListener('click', reiniciarTodo);
        $('anterior').addEventListener('click', function () { irAPaso(estado.paso - 1); });
        $('siguiente').addEventListener('click', function () { irAPaso(estado.paso + 1); });
        $('ng-recargar').addEventListener('click', function () { limpiarConsola(); ejecutar(); });
        $('ng-limpiar-consola').addEventListener('click', limpiarConsola);

        /* copiar (los botones de los bloques de código) */
        $('columna-teoria').addEventListener('click', function (e) {
            var b = e.target.closest('[data-copiar]');
            if (!b) return;
            var texto = b.getAttribute('data-copiar');
            var listo = function () { b.textContent = '¡copiado!'; setTimeout(function () { b.textContent = 'copiar'; }, 1200); };
            if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(texto).then(listo, function () {});
            else listo();
        });

        window.addEventListener('beforeunload', guardarYa);

        var habia = recuperar();
        if (!habia) estado.paso = 0;
        irAPaso(estado.paso);
    }

    return { arrancar: arrancar, guardarYa: guardarYa };
})();
