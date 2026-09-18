/* ============================================================================
 * motor-worker.js — La cáscara del Worker donde vive el "Node" del alumno.
 *
 * Lo único que hay que poder cortar de verdad es un `while (true)`, y en
 * JavaScript eso sólo lo garantiza `worker.terminate()` desde afuera. Ver
 * runner.js para el watchdog.
 *
 * Esta cáscara es común a las dos clases. `__atender` puede devolver una
 * Promise (la clase avanzada enseña async/await: base de datos, bcrypt, JWT)
 * o un valor directo (la inicial): `onmessage` acepta los dos casos.
 * ========================================================================== */

const __responder = self.postMessage.bind(self);

/* Qué motor carga lo decide la página: motor-worker.js?motor=inicial (o avanzada).
   Se valida el nombre para que el parámetro no pueda apuntar a cualquier archivo. */
const __motor = new URLSearchParams(self.location.search).get('motor') || '';
if (!/^[a-z0-9-]+$/.test(__motor)) throw new Error('Motor desconocido: ' + __motor);
importScripts('motor/' + __motor + '.js');

/* De acá en adelante, nada de lo que el alumno pueda alcanzar desde su código
   sirve para hablar con la página, salir del worker o pedir algo por red. No es
   criptografía: es evitar que un copy-paste de internet haga cosas raras
   adentro de la clase. */
self.postMessage = function () { throw new Error('bloqueado'); };
self.close = function () { throw new Error('bloqueado'); };
self.importScripts = function () { throw new Error('bloqueado'); };
self.fetch = function () { throw new Error('bloqueado'); };
self.XMLHttpRequest = function () { throw new Error('bloqueado'); };

self.onmessage = function (evento) {
    const datos = evento.data || {};

    Promise.resolve()
        .then(function () { return __atender(datos); })
        .catch(function (error) {
            return {
                ok: false,
                interno: true,
                titulo: 'Se cayó el motor de la clase',
                detalle: String(error && error.message),
                error: { nombre: 'Error', mensaje: String(error && error.message),
                         archivo: 'motor.js', linea: null, pista: null, sintaxis: false }
            };
        })
        .then(function (resultado) {
            __responder({ id: datos.id, resultado: resultado });
        });
};
