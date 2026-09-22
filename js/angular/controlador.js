var ClaseAngular = (function () {
    'use strict';

    function $(id) {
        var nodo = document.getElementById(id.indexOf('ng-') === 0 ? id : 'ng-' + id);
        if (!nodo) throw new Error('ClaseAngular: no existe el elemento ng-' + id.replace(/^ng-/, ''));
        return nodo;
    }

    var DEMORA_GUARDADO = 400;
    var DEMORA_EJECUCION = 700;

    var estado = {
        paso: 0,
        completados: {},
        archivos: {},
        activo: null,
        proyectoDe: null,
        trabajo: {}
    };

    var relojGuardado = null;
    var relojEjecucion = null;
    var ejecutando = 0;
    var erroresConsola = 0;

    var el = {};

    /* ------------------------------------------------------------------------
     * Guardado
     * ---------------------------------------------------------------------- */

    function guardarYa() {
        clearTimeout(relojGuardado);
        try {
            if (estado.proyectoDe) estado.trabajo[estado.proyectoDe] = estado.archivos;
            localStorage.setItem(CLASE_ACTUAL.clave, JSON.stringify({
                paso: estado.paso,
                completados: estado.completados,
                archivos: estado.archivos,
                activo: estado.activo,
                proyectoDe: estado.proyectoDe,
                trabajo: estado.trabajo
            }));
        } catch (e) { }
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

    function ejecutar() {
        var mio = ++ejecutando;
        estadoVista('trabajando', 'Compilando…');

        return VistaAngular.ejecutar(estado.archivos, 'app/app.component.ts').then(function (r) {
            if (mio !== ejecutando) return r;

            if (r.ok) {
                mostrarVelo(null);
                var n = (r.errores || []).length;
                estadoVista(n ? 'mal' : 'bien', n ? n + (n === 1 ? ' error' : ' errores') + ' en la Consola' : 'Listo');
                if (CLASE_ACTUAL.api) {
                    /* Los pedidos a la API simulada tardan más que los 60 ms que el motor
                       espera antes de contestar: acá arrancó bien, pero puede fallar un
                       instante después. Se vuelve a mirar una vez que el pedido pudo
                       haber terminado, sin pisar una ejecución más nueva. */
                    var propio = mio;
                    var antes = erroresConsola;
                    setTimeout(function () {
                        if (propio !== ejecutando || erroresConsola === antes) return;
                        estadoVista('mal', erroresConsola + (erroresConsola === 1 ? ' error' : ' errores') + ' en la Consola');
                    }, 2700);
                }
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
     * Editor
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
     * ---------------------------------------------------------------------- */

    function clonar(obj) {
        var c = {};
        Object.keys(obj || {}).forEach(function (k) { c[k] = obj[k]; });
        return c;
    }

    function armarProyectoDelPaso(indice) {
        var p = PASOS[indice];

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
     * Teoría
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
                if (CLASE_ACTUAL.api) $('red').value = 'normal';
                if (r.ok) {
                    estado.completados[p.id] = true;
                    guardarYa();
                    dibujarIndice();
                    var ultimo = estado.paso === PASOS.length - 1;
                    mostrarResultado('bien',
                        '<h4>¡Bien! Este paso está resuelto.</h4>' +
                        (ultimo ? '<p>Completaste la clase.</p>'
                                : '<p>Podés seguir con el próximo.</p><button class="boton primario" id="ng-ir-siguiente">Siguiente paso →</button>'));
                    if (!ultimo) $('ng-ir-siguiente').addEventListener('click', function () { irAPaso(estado.paso + 1); });
                    return;
                }
                var html = '<h4>' + escaparTexto(r.titulo || 'Todavía no') + '</h4>';
                if (r.detalle) html += '<p>' + escaparTexto(r.detalle) + '</p>';
                if (r.pista) html += '<p class="pista"><strong>Pista:</strong> ' + escaparTexto(r.pista) + '</p>';
                if (r.errorAngular) html += '<pre class="error-angular">' + escaparTexto(r.errorAngular) + '</pre>';
                mostrarResultado('mal', html);
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

    function reiniciarPaso() {
        var p = paso();
        if (!confirm('Se descarta lo que escribiste en este paso y vuelve el código inicial. ¿Seguro?')) return;
        var base = clonar(p.semilla);
        estado.trabajo[p.id] = base;
        estado.archivos = base;
        estado.proyectoDe = p.id;
        limpiarResultado();
        abrirArchivo(archivoAAbrir(p, true));
        guardarYa();
        limpiarConsola();
        ejecutar();
    }

    function reiniciarTodo() {
        if (!confirm('Se borra todo tu avance de esta clase y se empieza de cero. ¿Seguro?')) return;
        try { localStorage.removeItem(CLASE_ACTUAL.clave); } catch (e) { }
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
                    el.contadorErrores.hidden = true;
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
        $('boton-reiniciar-paso').addEventListener('click', reiniciarPaso);
        if (CLASE_ACTUAL.api) {
            $('red-caja').hidden = false;
            $('red').addEventListener('change', function () { VistaAngular.inspeccionar({ red: $('red').value }); });
        }
        $('boton-reiniciar').addEventListener('click', reiniciarTodo);
        $('anterior').addEventListener('click', function () { irAPaso(estado.paso - 1); });
        $('siguiente').addEventListener('click', function () { irAPaso(estado.paso + 1); });
        $('ng-recargar').addEventListener('click', function () { limpiarConsola(); ejecutar(); });
        $('ng-limpiar-consola').addEventListener('click', limpiarConsola);

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
