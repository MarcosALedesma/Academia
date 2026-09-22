const __responder = self.postMessage.bind(self);

const __motor = new URLSearchParams(self.location.search).get('motor') || '';
if (!/^[a-z0-9-]+$/.test(__motor)) throw new Error('Motor desconocido: ' + __motor);
importScripts('motor/' + __motor + '.js');

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
