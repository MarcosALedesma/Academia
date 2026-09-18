/* ============================================================================
 * runner.js — Lo único que la interfaz sabe del motor.
 *
 * Contrato: NINGUNA de estas funciones lanza. Todo error del alumno vuelve
 * adentro del objeto resultado. Un throw acá sería un botón que no hace nada.
 *
 * El watchdog: si el worker no contesta en LIMITE_MS, se lo mata y se vuelve a
 * crear. Para el alumno eso es "se me colgó el servidor", que es la traducción
 * correcta de lo que le pasó.
 * ========================================================================== */

const LIMITE_MS = 4000;
/* Un solo worker para las dos clases; el motor (inicial o avanzada) se elige por parámetro. */
function rutaWorker() { return 'js/motor-worker.js?motor=' + encodeURIComponent(CLASE_ACTUAL.motor); }

let trabajador = null;
let contador = 0;
const pendientes = new Map();

/* Espejo en el hilo principal de lo que el worker tiene cargado. Si hay que
   recrearlo por un cuelgue, se le vuelve a mandar sin molestar a nadie. */
let entorno = { archivos: {}, instalados: {} };

function obtenerTrabajador() {
    if (trabajador) return trabajador;
    trabajador = new Worker(rutaWorker());
    trabajador.onmessage = function (evento) {
        const datos = evento.data || {};
        const p = pendientes.get(datos.id);
        if (!p) return;
        clearTimeout(p.reloj);
        pendientes.delete(datos.id);
        p.resolver(datos.resultado);
    };
    trabajador.onerror = function () {
        matarYResponder({
            ok: false, caido: true,
            titulo: 'Se cayó el motor',
            detalle: 'Volvé a intentar. Si sigue pasando, recargá la página.'
        });
    };
    trabajador.postMessage({ id: ++contador, comando: 'entorno',
                             archivos: entorno.archivos, instalados: entorno.instalados });
    return trabajador;
}

function matarYResponder(resultado) {
    if (trabajador) { trabajador.terminate(); trabajador = null; }
    pendientes.forEach(function (p) { clearTimeout(p.reloj); p.resolver(resultado); });
    pendientes.clear();
}

function enviar(orden) {
    return new Promise(function (resolver) {
        const id = ++contador;
        const reloj = setTimeout(function () {
            matarYResponder({
                ok: false, colgado: true,
                titulo: 'Tu servidor se colgó',
                detalle: 'Pasaron ' + (LIMITE_MS / 1000) + ' segundos sin respuesta y hubo que matar el ' +
                         'proceso. Casi siempre es un bucle que no termina (un while sin condición de ' +
                         'corte, o un for que nunca llega al final). El servidor quedó apagado: ' +
                         'arreglá el código y volvé a hacer node app.js.'
            });
        }, LIMITE_MS);
        pendientes.set(id, { resolver: resolver, reloj: reloj });
        orden.id = id;
        obtenerTrabajador().postMessage(orden);
    });
}

/* --------------------------------------------------------------------------
 * API pública
 * ------------------------------------------------------------------------ */

/** Sincroniza el proyecto y los paquetes instalados con el worker. */
function sincronizar(archivos, instalados) {
    entorno = { archivos: archivos, instalados: instalados };
    return enviar({ comando: 'entorno', archivos: archivos, instalados: instalados });
}

function correr(entrada) { return enviar({ comando: 'correr', entrada: entrada || 'app.js' }); }

function apagar() { return enviar({ comando: 'apagar' }); }

function pedir(pedido) { return enviar({ comando: 'pedido', pedido: pedido }); }

function estadoServidor() { return enviar({ comando: 'estado' }); }

function verificar(chequeos) { return enviar({ comando: 'verificar', chequeos: chequeos || [] }); }
