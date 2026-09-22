var VistaAngular = (function () {

    var VERSION = (function () {
        var origen = document.currentScript && document.currentScript.src || '';
        var m = /[?&]v=([^&]+)/.exec(origen);
        return m ? m[1] : '';
    })();

    var LIMITE_MS = 5000;

    var marco = null;
    var contenedor = null;
    var listo = false;
    var esperandoListo = [];
    var contador = 0;
    var pendientes = {};
    var alConsola = function () {};

    function alRecibir(evento) {
        if (!marco || evento.source !== marco.contentWindow) return;
        var d = evento.data || {};

        if (d.tipo === 'listo') {
            listo = true;
            var cola = esperandoListo; esperandoListo = [];
            cola.forEach(function (f) { f(); });
            return;
        }
        if (d.tipo === 'consola') { alConsola(d.nivel, d.texto); return; }

        var p = pendientes[d.id];
        if (!p) return;
        clearTimeout(p.reloj);
        delete pendientes[d.id];
        p.resolver(d);
    }

    window.addEventListener('message', alRecibir);

    function crearMarco() {
        listo = false;
        marco = document.createElement('iframe');
        marco.className = 'marco-vista';
        marco.title = 'Vista previa de tu aplicación';
        marco.setAttribute('sandbox', 'allow-scripts');
        marco.src = 'vista-angular.html' + (VERSION ? '?v=' + VERSION : '');
        contenedor.innerHTML = '';
        contenedor.appendChild(marco);
    }

    function cuandoListo(f) {
        if (listo) f(); else esperandoListo.push(f);
    }

    function matarYResponder(resultado) {
        Object.keys(pendientes).forEach(function (id) {
            var p = pendientes[id];
            clearTimeout(p.reloj);
            p.resolver(resultado);
        });
        pendientes = {};
        esperandoListo = [];
        crearMarco();
    }

    function enviar(orden) {
        return new Promise(function (resolver) {
            var id = ++contador;
            orden.id = id;

            var reloj = setTimeout(function () {
                matarYResponder({
                    ok: false, colgado: true, fase: 'colgado',
                    titulo: 'Tu aplicación se colgó',
                    detalle: 'Pasaron ' + (LIMITE_MS / 1000) + ' segundos sin respuesta y hubo que reiniciar la vista previa. ' +
                             'Casi siempre es un bucle que no termina (un while sin condición de corte) o un getter que ' +
                             'se llama a sí mismo. Arreglá el código y volvé a guardar.'
                });
            }, LIMITE_MS);

            pendientes[id] = { resolver: resolver, reloj: reloj };
            cuandoListo(function () {
                try { marco.contentWindow.postMessage(orden, '*'); }
                catch (e) {
                    clearTimeout(reloj);
                    delete pendientes[id];
                    resolver({ ok: false, titulo: 'No se pudo hablar con la vista previa', detalle: String(e && e.message) });
                }
            });
        });
    }

    /* ------------------------------------------------------------------------
     * API pública
     * ---------------------------------------------------------------------- */

    function iniciar(donde, consola) {
        contenedor = donde;
        alConsola = consola || function () {};
        crearMarco();
    }

    function ejecutar(archivos, entrada) {
        return enviar({ tipo: 'ejecutar', archivos: archivos, entrada: entrada || 'app/app.component.ts' });
    }

    function inspeccionar(consulta) {
        return enviar({ tipo: 'inspeccionar', consulta: consulta });
    }

    function reiniciar() { matarYResponder({ ok: false, titulo: 'Vista reiniciada', detalle: '' }); }

    return { iniciar: iniciar, ejecutar: ejecutar, inspeccionar: inspeccionar, reiniciar: reiniciar };
})();
