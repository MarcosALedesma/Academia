/* --------------------------------------------------------------------------
 * Estado del "proceso"
 * ------------------------------------------------------------------------ */

const __proceso = {
    archivos: {},
    modulos: {},
    consola: [],
    app: null,
    puerto: null,
    escuchando: false,
    instalados: {},
    corriendo: false
};

function __registrar(nivel, args) {
    const partes = args.map(function (v) { return __aTexto(v); });
    __proceso.consola.push({ nivel: nivel, texto: partes.join(' ') });
    if (__proceso.consola.length > 500) {
        __proceso.consola.splice(0, __proceso.consola.length - 500);
    }
}

function __aTexto(v) {
    if (typeof v === 'string') return v;
    if (v === undefined) return 'undefined';
    if (v === null) return 'null';
    if (typeof v === 'number' || typeof v === 'boolean') return String(v);
    if (v instanceof Error) return v.name + ': ' + v.message;
    try { return JSON.stringify(v); } catch (e) { return String(v); }
}

const __consola = {
    log:   function () { __registrar('log', [].slice.call(arguments)); },
    info:  function () { __registrar('log', [].slice.call(arguments)); },
    warn:  function () { __registrar('warn', [].slice.call(arguments)); },
    error: function () { __registrar('error', [].slice.call(arguments)); },
    table: function () { __registrar('log', [].slice.call(arguments)); }
};

/* ------------------------------------------------------------------------
 * Ruteo: '/api/alumnos/:id'
 * ---------------------------------------------------------------------- */

function __compilarRuta(patron) {
    const nombres = [];
    if (patron instanceof RegExp) return { regex: patron, nombres: nombres };

    let p = String(patron);
    if (p.length > 1 && p.charAt(p.length - 1) === '/') p = p.slice(0, -1);

    const fuente = p
        .replace(/[.+^${}()|[\]\\]/g, '\\$&')
        .replace(/\/:([A-Za-z_$][\w$]*)/g, function (_, nombre) {
            nombres.push(nombre);
            return '/([^/]+)';
        })
        .replace(/\*/g, '.*');

    return { regex: new RegExp('^' + (fuente === '' ? '/' : fuente) + '/?$'), nombres: nombres };
}

function __emparejar(compilada, ruta) {
    const m = compilada.regex.exec(ruta);
    if (!m) return null;
    const params = {};
    for (let i = 0; i < compilada.nombres.length; i++) {
        params[compilada.nombres[i]] = decodeURIComponent(m[i + 1]);
    }
    return params;
}

function __compilarPrefijo(patron) {
    let p = String(patron);
    if (p.length > 1 && p.charAt(p.length - 1) === '/') p = p.slice(0, -1);

    if (p === '/' || p === '') return { regex: /^/, nombres: [], texto: '/' };

    const nombres = [];
    const fuente = p
        .replace(/[.+^${}()|[\]\\]/g, '\\$&')
        .replace(/\/:([A-Za-z_$][\w$]*)/g, function (_, nombre) {
            nombres.push(nombre);
            return '/([^/]+)';
        });
    return { regex: new RegExp('^' + fuente + '(?=/|$)'), nombres: nombres, texto: p };
}

/* --------------------------------------------------------------------------
 * La query string
 * ------------------------------------------------------------------------ */

function __parsearQuery(texto) {
    const q = {};
    if (!texto) return q;
    texto.split('&').forEach(function (par) {
        if (!par) return;
        const i = par.indexOf('=');
        const clave = decodeURIComponent((i === -1 ? par : par.slice(0, i)).replace(/\+/g, ' '));
        const valor = i === -1 ? '' : decodeURIComponent(par.slice(i + 1).replace(/\+/g, ' '));
        if (Object.prototype.hasOwnProperty.call(q, clave)) {
            if (Array.isArray(q[clave])) q[clave].push(valor);
            else q[clave] = [q[clave], valor];
        } else {
            q[clave] = valor;
        }
    });
    return q;
}

/* ------------------------------------------------------------------------
 * req y res
 * ---------------------------------------------------------------------- */

function __crearReq(pedido) {
    const corte = pedido.ruta.indexOf('?');
    const camino = corte === -1 ? pedido.ruta : pedido.ruta.slice(0, corte);
    const cadena = corte === -1 ? '' : pedido.ruta.slice(corte + 1);

    const cabeceras = {};
    Object.keys(pedido.cabeceras || {}).forEach(function (k) {
        cabeceras[k.toLowerCase()] = pedido.cabeceras[k];
    });

    return {
        method: (pedido.metodo || 'GET').toUpperCase(),
        url: pedido.ruta,
        originalUrl: pedido.ruta,
        path: camino,
        baseUrl: '',
        params: {},
        query: __parsearQuery(cadena),
        body: undefined,
        headers: cabeceras,
        get: function (nombre) { return cabeceras[String(nombre).toLowerCase()]; },
        __crudo: pedido.cuerpoCrudo === undefined ? '' : pedido.cuerpoCrudo,
        __camino: camino
    };
}

function __crearRes() {
    const res = {
        statusCode: 200,
        __cabeceras: { 'x-powered-by': 'Express' },
        __cuerpo: '',
        __respondio: false
    };

    function yaRespondio() {
        if (res.__respondio) {
            throw new Error(
                'Cannot set headers after they are sent to the client ' +
                '[respondiste dos veces al mismo pedido: fijate si te falta un ' +
                'return antes de res.json(...), o un else]'
            );
        }
    }

    res.status = function (codigo) { yaRespondio(); res.statusCode = codigo; return res; };

    res.set = res.header = function (nombre, valor) {
        yaRespondio();
        if (nombre && typeof nombre === 'object') {
            Object.keys(nombre).forEach(function (k) {
                res.__cabeceras[k.toLowerCase()] = String(nombre[k]);
            });
        } else {
            res.__cabeceras[String(nombre).toLowerCase()] = String(valor);
        }
        return res;
    };

    res.type = function (t) {
        const mapa = { json: 'application/json', html: 'text/html', txt: 'text/plain', text: 'text/plain' };
        return res.set('Content-Type', (mapa[t] || t) + '; charset=utf-8');
    };

    res.json = function (dato) {
        yaRespondio();
        res.__cabeceras['content-type'] = 'application/json; charset=utf-8';
        try {
            res.__cuerpo = JSON.stringify(dato === undefined ? null : dato);
        } catch (e) {
            throw new Error('res.json() no pudo convertir el dato a JSON: ' + e.message);
        }
        res.__respondio = true;
        return res;
    };

    res.send = function (dato) {
        yaRespondio();
        if (dato === undefined || dato === null) {
            res.__cuerpo = '';
            res.__respondio = true;
            return res;
        }
        if (typeof dato === 'object') return res.json(dato);
        if (typeof dato === 'number') {
            __registrar('warn', ['[aviso] res.send(' + dato + ') manda el numero COMO TEXTO. ' +
                                 'El codigo de estado se pone con res.status(' + dato + ').']);
        }
        if (!res.__cabeceras['content-type']) {
            res.__cabeceras['content-type'] = 'text/html; charset=utf-8';
        }
        res.__cuerpo = String(dato);
        res.__respondio = true;
        return res;
    };

    res.end = function (dato) {
        yaRespondio();
        res.__cuerpo = dato === undefined ? '' : String(dato);
        res.__respondio = true;
        return res;
    };

    res.sendStatus = function (codigo) {
        const textos = {
            200: 'OK', 201: 'Created', 204: 'No Content', 400: 'Bad Request',
            401: 'Unauthorized', 403: 'Forbidden', 404: 'Not Found',
            500: 'Internal Server Error'
        };
        res.statusCode = codigo;
        return res.send(textos[codigo] || String(codigo));
    };

    return res;
}

/* ------------------------------------------------------------------------
 * El router
 * ---------------------------------------------------------------------- */

const __METODOS = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options', 'all'];

function __crearRouter() {
    const capas = [];

    const router = function (req, res, next) { router.__manejar(req, res, next); };
    router.__esRouter = true;
    router.__capas = capas;

    __METODOS.forEach(function (metodo) {
        router[metodo] = function (patron) {
            const manejadores = [].slice.call(arguments, 1).filter(function (f) { return f !== undefined; });
            if (typeof patron !== 'string' && !(patron instanceof RegExp)) {
                throw new TypeError('.' + metodo + '() necesita la ruta como primer argumento. ' +
                                    'Por ejemplo: app.' + metodo + '("/api/alumnos", (req, res) => { ... })');
            }
            if (manejadores.length === 0) {
                throw new TypeError('.' + metodo + '("' + patron + '") se quedó sin función manejadora: ' +
                                    'falta el (req, res) => { ... }');
            }
            manejadores.forEach(function (fn) {
                if (typeof fn !== 'function') {
                    throw new TypeError('.' + metodo + '("' + patron + '") recibió un ' + typeof fn +
                                        ' donde esperaba una función (req, res).');
                }
                capas.push({
                    tipo: 'ruta',
                    metodo: metodo === 'all' ? null : metodo.toUpperCase(),
                    patron: String(patron),
                    compilada: __compilarRuta(patron),
                    fn: fn
                });
            });
            return router;
        };
    });

    router.use = function (a) {
        let prefijo = '/';
        let fns = [].slice.call(arguments);
        if (typeof a === 'string') { prefijo = a; fns = [].slice.call(arguments, 1); }
        fns = fns.filter(function (f) { return f !== undefined; });
        if (fns.length === 0) {
            throw new TypeError('.use() no recibió ninguna función. ' +
                                'Ojo: es express.json() con paréntesis, no express.json.');
        }
        fns.forEach(function (fn) {
            if (typeof fn !== 'function') {
                throw new TypeError('.use() espera una función y recibió un ' + typeof fn + '. ' +
                                    'Si querés montar un router, revisá el module.exports = router.');
            }
            capas.push({
                tipo: fn.length === 4 ? 'error' : 'medio',
                prefijo: __compilarPrefijo(prefijo),
                fn: fn,
                esRouter: fn.__esRouter === true,
                nombre: fn.__nombreMedio || fn.name || 'anonimo'
            });
        });
        return router;
    };

    router.__manejar = function (req, res, salir) {
        let i = 0;
        const caminoOriginal = req.__camino;
        const baseOriginal = req.baseUrl;

        function siguiente(error) {
            req.__camino = caminoOriginal;
            req.baseUrl = baseOriginal;

            while (i < capas.length) {
                const capa = capas[i++];

                if (error && capa.tipo !== 'error') continue;
                if (!error && capa.tipo === 'error') continue;

                if (capa.tipo === 'ruta') {
                    if (capa.metodo && capa.metodo !== req.method) continue;
                    const params = __emparejar(capa.compilada, req.__camino);
                    if (!params) continue;
                    req.params = params;
                    req.__rutaActual = capa.patron;
                    return __invocar(capa, error, req, res, siguiente);
                }

                const m = capa.prefijo.regex.exec(req.__camino);
                if (!m) continue;
                if (capa.prefijo.texto !== '/' && capa.prefijo.texto !== '') {
                    req.baseUrl = baseOriginal + m[0];
                    req.__camino = req.__camino.slice(m[0].length) || '/';
                }
                return __invocar(capa, error, req, res, siguiente);
            }

            req.__camino = caminoOriginal;
            req.baseUrl = baseOriginal;
            if (salir) return salir(error);
            if (error) throw error;
        }

        siguiente();
    };

    return router;
}

function __invocar(capa, error, req, res, siguiente) {
    try {
        if (capa.tipo === 'error') capa.fn(error, req, res, siguiente);
        else capa.fn(req, res, siguiente);
    } catch (e) {
        siguiente(e);
    }
}

/* --------------------------------------------------------------------------
 * El módulo `express`
 * ------------------------------------------------------------------------ */

function __crearExpress() {

    function express() {
        const app = __crearRouter();
        app.__esApp = true;
        app.__ajustes = {};

        app.set = function (clave, valor) { app.__ajustes[clave] = valor; return app; };
        app.get_ajuste = function (clave) { return app.__ajustes[clave]; };

        const getRuta = app.get;
        app.get = function (patron) {
            if (arguments.length === 1 && typeof patron === 'string') {
                if (Object.prototype.hasOwnProperty.call(app.__ajustes, patron)) {
                    return app.__ajustes[patron];
                }
                throw new TypeError('app.get("' + patron + '") con un solo argumento LEE UN AJUSTE, ' +
                                    'no declara una ruta. Te falta la función: ' +
                                    'app.get("' + patron + '", (req, res) => { ... })');
            }
            return getRuta.apply(app, arguments);
        };

        app.listen = function (puerto, callback) {
            if (typeof puerto === 'function') { callback = puerto; puerto = 3000; }
            __proceso.app = app;
            __proceso.puerto = Number(puerto) || 3000;
            __proceso.escuchando = true;
            if (typeof callback === 'function') callback();
            return { close: function () { __proceso.escuchando = false; } };
        };

        return app;
    }

    /* ------------------------------------------------------------------------
     * express.json()
     * ---------------------------------------------------------------------- */
    express.json = function (opciones) {
        const medio = function json(req, res, next) {
            const tipo = req.headers['content-type'] || '';
            if (tipo.indexOf('application/json') === -1) return next();
            if (!req.__crudo) { req.body = {}; return next(); }
            try {
                req.body = JSON.parse(req.__crudo);
            } catch (e) {
                const error = new Error('Unexpected token in JSON at position 0 ' +
                                        '[el cuerpo que mandaste no es JSON válido]');
                error.status = 400;
                error.__esJsonRoto = true;
                return next(error);
            }
            next();
        };
        medio.__nombreMedio = 'express.json()';
        return medio;
    };

    express.urlencoded = function (opciones) {
        const medio = function urlencoded(req, res, next) {
            const tipo = req.headers['content-type'] || '';
            if (tipo.indexOf('application/x-www-form-urlencoded') === -1) return next();
            req.body = __parsearQuery(req.__crudo);
            next();
        };
        medio.__nombreMedio = 'express.urlencoded()';
        return medio;
    };

    /* ------------------------------------------------------------------------
     * express.static()
     * ---------------------------------------------------------------------- */
    express.static = function (carpeta) {
        const base = String(carpeta || 'public').replace(/^\.\//, '').replace(/\/$/, '');
        const medio = function serveStatic(req, res, next) {
            if (req.method !== 'GET' && req.method !== 'HEAD') return next();
            let pedido = req.__camino === '/' ? '/index.html' : req.__camino;
            const nombre = base + pedido;
            if (!Object.prototype.hasOwnProperty.call(__proceso.archivos, nombre)) return next();
            const ext = nombre.slice(nombre.lastIndexOf('.'));
            const tipos = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
                            '.json': 'application/json', '.txt': 'text/plain' };
            res.set('Content-Type', (tipos[ext] || 'application/octet-stream') + '; charset=utf-8');
            res.__cuerpo = __proceso.archivos[nombre];
            res.__respondio = true;
        };
        medio.__nombreMedio = 'express.static("' + base + '")';
        return medio;
    };

    express.Router = function () { return __crearRouter(); };

    return express;
}

/* ------------------------------------------------------------------------
 * require() y el "sistema de archivos"
 * ---------------------------------------------------------------------- */

function __normalizar(nombre, desde) {
    if (nombre.charAt(0) !== '.') return nombre;
    const base = desde.indexOf('/') === -1 ? '' : desde.slice(0, desde.lastIndexOf('/'));
    const partes = (base ? base.split('/') : []).concat(nombre.split('/'));
    const pila = [];
    partes.forEach(function (p) {
        if (p === '' || p === '.') return;
        if (p === '..') { pila.pop(); return; }
        pila.push(p);
    });
    return pila.join('/');
}

function __resolver(ruta) {
    const candidatos = [ruta, ruta + '.js', ruta + '/index.js', ruta + '.json'];
    for (let i = 0; i < candidatos.length; i++) {
        if (Object.prototype.hasOwnProperty.call(__proceso.archivos, candidatos[i])) return candidatos[i];
    }
    return null;
}

const __NUCLEO = ['fs', 'path', 'http', 'os', 'url', 'crypto', 'events'];

function __crearRequire(desde) {
    return function require(nombre) {
        if (typeof nombre !== 'string' || nombre === '') {
            throw new TypeError('require() necesita el nombre del módulo entre comillas.');
        }

        if (nombre === 'express') {
            if (!__proceso.instalados.express) {
                const e = new Error("Cannot find module 'express'");
                e.code = 'MODULE_NOT_FOUND';
                e.__pista = 'Express no viene con Node: es un paquete que hay que instalar. ' +
                            'Corré  npm install express  en la consola y volvé a intentar.';
                throw e;
            }
            return __crearExpress();
        }

        if (__NUCLEO.indexOf(nombre) !== -1) {
            const e = new Error("Cannot find module '" + nombre + "'");
            e.__pista = 'El módulo ' + nombre + ' existe en Node de verdad, pero esta clase no lo ' +
                        'simula: acá el alcance es Express y un arreglo en memoria.';
            throw e;
        }

        const destino = __resolver(__normalizar(nombre, desde));
        if (!destino) {
            const e = new Error("Cannot find module '" + nombre + "'");
            e.code = 'MODULE_NOT_FOUND';
            e.__pista = nombre.charAt(0) === '.'
                ? 'No existe ese archivo en el proyecto. Fijate el nombre en las solapas del editor. ' +
                  'Acordate del ./ adelante para los archivos propios.'
                : 'Ese paquete no está instalado. Los únicos que entran en esta clase son express ' +
                  'y los archivos propios del proyecto (con ./ adelante).';
            throw e;
        }

        if (Object.prototype.hasOwnProperty.call(__proceso.modulos, destino)) {
            return __proceso.modulos[destino].exports;
        }

        if (destino.slice(-5) === '.json') {
            const valor = JSON.parse(__proceso.archivos[destino]);
            __proceso.modulos[destino] = { exports: valor };
            return valor;
        }

        return __ejecutarArchivo(destino);
    };
}

function __ejecutarArchivo(nombre) {
    const modulo = { exports: {} };
    __proceso.modulos[nombre] = modulo;

    const codigo = __proceso.archivos[nombre];
    const carpeta = nombre.indexOf('/') === -1 ? '.' : nombre.slice(0, nombre.lastIndexOf('/'));

    let fn;
    try {
        fn = new Function(
            'exports', 'require', 'module', '__filename', '__dirname', 'console', 'process',
            codigo + '\n//# sourceURL=' + nombre
        );
    } catch (e) {
        e.__archivo = nombre;
        e.__sintaxis = true;
        throw e;
    }

    try {
        fn(modulo.exports, __crearRequire(nombre), modulo, nombre, carpeta, __consola, __proceso.process);
    } catch (e) {
        delete __proceso.modulos[nombre];
        if (!e.__archivo) e.__archivo = nombre;
        throw e;
    }

    return modulo.exports;
}

__proceso.process = {
    env: {},
    argv: ['node', 'app.js'],
    platform: 'linux',
    exit: function () { throw new Error('process.exit() no se puede usar en esta clase.'); }
};

/* --------------------------------------------------------------------------
 * Errores presentables
 * ------------------------------------------------------------------------ */

function __linea(error, archivo) {
    const stack = String(error && error.stack || '');
    const re = new RegExp(archivo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ':(\\d+)');
    const m = re.exec(stack);
    if (!m) return null;
    const n = Number(m[1]) - 2;
    return n > 0 ? n : null;
}

function __describirError(error) {
    const archivo = error && error.__archivo ? error.__archivo : 'app.js';
    const nombre = error && error.name ? error.name : 'Error';
    let mensaje = error && error.message ? error.message : String(error);

    const traducciones = [
        [/Cannot read propert(?:y|ies) of undefined \(reading '([^']+)'\)/,
         function (m) {
             return 'Estás leyendo .' + m[1] + ' de algo que vale undefined. ' +
                    'Si es req.body, te falta app.use(express.json()). ' +
                    'Si es el resultado de un find(), no encontró nada: hay que preguntar por undefined antes de usarlo.';
         }],
        [/([\w$.]+) is not a function/,
         function (m) { return m[1] + ' no es una función. Revisá el nombre: casi siempre es una letra de más o de menos.'; }],
        [/([\w$]+) is not defined/,
         function (m) { return 'No existe ninguna variable llamada ' + m[1] + ' en este archivo. ' +
                               'Fijate si la declaraste, o si la escribiste distinto.'; }],
        [/Assignment to constant variable/,
         function () { return 'Estás reasignando una variable declarada con const. ' +
                              'Ojo: a un arreglo const SÍ se le puede hacer push; lo que no se puede es ponerle otro arreglo con =.'; }]
    ];

    let explicacion = error && error.__pista ? error.__pista : null;
    for (let i = 0; i < traducciones.length && !explicacion; i++) {
        const m = traducciones[i][0].exec(mensaje);
        if (m) explicacion = traducciones[i][1](m);
    }

    return {
        nombre: nombre,
        mensaje: mensaje,
        archivo: archivo,
        linea: __linea(error, archivo),
        pista: explicacion,
        sintaxis: !!(error && error.__sintaxis)
    };
}

/* --------------------------------------------------------------------------
 * El mapa de rutas
 * ------------------------------------------------------------------------ */

function __mapaDeRutas(router, prefijo, salida, vistos) {
    if (!router || vistos.indexOf(router) !== -1) return salida;
    vistos.push(router);
    router.__capas.forEach(function (capa) {
        if (capa.tipo === 'ruta') {
            salida.push({
                metodo: capa.metodo || 'TODOS',
                ruta: (prefijo + capa.patron).replace(/\/{2,}/g, '/') || '/'
            });
        } else if (capa.esRouter) {
            __mapaDeRutas(capa.fn, prefijo + (capa.prefijo.texto === '/' ? '' : capa.prefijo.texto), salida, vistos);
        } else {
            salida.push({ medio: true, nombre: capa.nombre, tipo: capa.tipo,
                          ruta: (prefijo + capa.prefijo.texto) || '/' });
        }
    });
    return salida;
}

/* --------------------------------------------------------------------------
 * La API que usa motor-worker.js
 * ------------------------------------------------------------------------ */

function __vaciarConsola() {
    const c = __proceso.consola;
    __proceso.consola = [];
    return c;
}

function __apagar() {
    __proceso.modulos = {};
    __proceso.app = null;
    __proceso.puerto = null;
    __proceso.escuchando = false;
    __proceso.corriendo = false;
    __proceso.consola = [];
}

function __correr(entrada) {
    __apagar();
    const nombre = entrada || 'app.js';

    if (!Object.prototype.hasOwnProperty.call(__proceso.archivos, nombre)) {
        return {
            ok: false, consola: [],
            error: { nombre: 'Error', mensaje: "Cannot find module '" + nombre + "'",
                     archivo: nombre, linea: null,
                     pista: 'No existe ese archivo en el proyecto.', sintaxis: false }
        };
    }

    try {
        __ejecutarArchivo(nombre);
    } catch (e) {
        const consola = __vaciarConsola();
        __proceso.escuchando = false;
        return { ok: false, consola: consola, error: __describirError(e) };
    }

    __proceso.corriendo = true;
    return {
        ok: true,
        consola: __vaciarConsola(),
        escuchando: __proceso.escuchando,
        puerto: __proceso.puerto,
        rutas: __proceso.escuchando ? __mapaDeRutas(__proceso.app, '', [], []) : []
    };
}

function __pedido(pedido) {
    if (!__proceso.escuchando || !__proceso.app) {
        return { sinServidor: true, consola: __vaciarConsola() };
    }

    const req = __crearReq(pedido);
    const res = __crearRes();
    let errorFinal = null;

    try {
        __proceso.app.__manejar(req, res, function (error) {
            if (error) { errorFinal = error; return; }
            res.statusCode = 404;
            res.__cabeceras['content-type'] = 'text/html; charset=utf-8';
            res.__cuerpo = '<pre>Cannot ' + req.method + ' ' + req.path + '</pre>';
            res.__respondio = true;
        });
    } catch (e) {
        errorFinal = e;
    }

    if (errorFinal && !res.__respondio) {
        const d = __describirError(errorFinal);
        res.statusCode = errorFinal.status || 500;
        res.__cabeceras['content-type'] = 'text/html; charset=utf-8';
        res.__cuerpo = '<pre>' + d.nombre + ': ' + d.mensaje + '</pre>';
        res.__respondio = true;
        return {
            estado: res.statusCode, cabeceras: res.__cabeceras, cuerpo: res.__cuerpo,
            consola: __vaciarConsola(), error: d
        };
    }

    if (!res.__respondio) {
        return {
            colgado: true, consola: __vaciarConsola(),
            error: {
                nombre: 'Error', mensaje: 'El pedido quedó colgado.',
                archivo: 'app.js', linea: null, sintaxis: false,
                pista: 'Alguna función que atendió ' + req.method + ' ' + req.path + ' terminó sin ' +
                       'responder y sin llamar a next(). Todo camino tiene que terminar en un ' +
                       'res.json(...) / res.send(...) o en un next().'
            }
        };
    }

    return {
        estado: res.statusCode,
        cabeceras: res.__cabeceras,
        cuerpo: res.__cuerpo,
        consola: __vaciarConsola(),
        error: errorFinal ? __describirError(errorFinal) : null
    };
}

/* ------------------------------------------------------------------------
 * EL VERIFICADOR
 * ---------------------------------------------------------------------- */

function __igual(a, b) {
    if (a === b) return true;
    if (typeof a !== typeof b) return false;
    if (a === null || b === null) return false;
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    if (typeof a !== 'object') return false;
    const ka = Object.keys(a), kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    for (let i = 0; i < ka.length; i++) {
        if (!Object.prototype.hasOwnProperty.call(b, ka[i])) return false;
        if (!__igual(a[ka[i]], b[ka[i]])) return false;
    }
    return true;
}

function __subconjunto(esperado, obtenido) {
    if (esperado === null || typeof esperado !== 'object') return esperado === obtenido;
    if (Array.isArray(esperado)) {
        if (!Array.isArray(obtenido) || obtenido.length !== esperado.length) return false;
        return esperado.every(function (v, i) { return __subconjunto(v, obtenido[i]); });
    }
    if (obtenido === null || typeof obtenido !== 'object' || Array.isArray(obtenido)) return false;
    return Object.keys(esperado).every(function (k) {
        return Object.prototype.hasOwnProperty.call(obtenido, k) &&
               __subconjunto(esperado[k], obtenido[k]);
    });
}

function __mostrar(v) {
    try { return JSON.stringify(v); } catch (e) { return String(v); }
}

function __recortar(texto, tope) {
    const t = String(texto === undefined ? '' : texto);
    return t.length > tope ? t.slice(0, tope) + '…' : t;
}

function __compararEspera(espera, resp) {
    const e = espera || {};

    if (e.estado !== undefined && resp.estado !== e.estado) {
        return 'Esperaba el código de estado ' + e.estado + ' y devolviste ' + resp.estado + '.' +
               (resp.estado === 404 && e.estado !== 404
                    ? ' Un 404 acá quiere decir que Express no encontró ninguna ruta que coincida: ' +
                      'revisá el método y cómo escribiste la ruta.'
                    : '');
    }
    if (e.estadoEn && e.estadoEn.indexOf(resp.estado) === -1) {
        return 'Esperaba alguno de estos códigos de estado: ' + e.estadoEn.join(', ') +
               '. Devolviste ' + resp.estado + '.';
    }
    if (e.tipoContenido) {
        const ct = resp.cabeceras['content-type'] || '';
        if (ct.indexOf(e.tipoContenido) === -1) {
            return 'Esperaba una respuesta de tipo ' + e.tipoContenido + ' y el Content-Type fue "' +
                   (ct || '(ninguno)') + '". Para mandar JSON se usa res.json(...), no res.send(...) con texto.';
        }
    }
    if (e.cuerpoVacio && String(resp.cuerpo) !== '') {
        return 'Esperaba una respuesta sin cuerpo y mandaste: ' + __recortar(resp.cuerpo, 120);
    }
    if (e.texto !== undefined && String(resp.cuerpo) !== e.texto) {
        return 'Esperaba exactamente "' + e.texto + '" y devolviste "' + __recortar(resp.cuerpo, 120) + '".';
    }
    if (e.textoContiene !== undefined && String(resp.cuerpo).indexOf(e.textoContiene) === -1) {
        return 'La respuesta tenía que contener "' + e.textoContiene + '" y devolviste "' +
               __recortar(resp.cuerpo, 160) + '".';
    }

    if (e.consolaContiene !== undefined) {
        const salida = (resp.consola || []).map(function (l) { return l.texto; }).join('\n');
        if (salida.indexOf(e.consolaContiene) === -1) {
            return 'Al atender este pedido tenía que imprimirse "' + e.consolaContiene +
                   '" en la consola del servidor. ' +
                   (salida ? 'Se imprimió: ' + __recortar(salida, 200) : 'No se imprimió nada.');
        }
    }

    const pideJson = e.esArreglo || e.largo !== undefined || e.json !== undefined ||
                     e.jsonParcial !== undefined || e.contieneObjeto !== undefined ||
                     e.noContieneObjeto !== undefined || e.camposEnCadaUno !== undefined;
    if (!pideJson) return null;

    let dato;
    try {
        dato = JSON.parse(resp.cuerpo);
    } catch (err) {
        return 'Esperaba JSON y la respuesta no lo es: ' + __recortar(resp.cuerpo, 160) +
               ' — para mandar objetos y arreglos se usa res.json(...).';
    }

    if (e.esArreglo && !Array.isArray(dato)) {
        return 'Esperaba un arreglo y devolviste ' + (dato === null ? 'null' : typeof dato) +
               ': ' + __recortar(__mostrar(dato), 160);
    }
    if (e.largo !== undefined) {
        if (!Array.isArray(dato)) return 'Esperaba un arreglo de ' + e.largo + ' elementos y no devolviste un arreglo.';
        if (dato.length !== e.largo) {
            return 'Esperaba ' + e.largo + ' elemento(s) en el arreglo y vinieron ' + dato.length + '.';
        }
    }
    if (e.camposEnCadaUno) {
        const lista = Array.isArray(dato) ? dato : [dato];
        for (let i = 0; i < lista.length; i++) {
            for (let j = 0; j < e.camposEnCadaUno.length; j++) {
                const campo = e.camposEnCadaUno[j];
                if (!lista[i] || typeof lista[i] !== 'object' ||
                    !Object.prototype.hasOwnProperty.call(lista[i], campo)) {
                    return 'A este objeto le falta la propiedad "' + campo + '": ' +
                           __recortar(__mostrar(lista[i]), 160);
                }
            }
        }
    }
    if (e.json !== undefined && !__igual(e.json, dato)) {
        return 'Esperaba exactamente ' + __recortar(__mostrar(e.json), 240) +
               ' y devolviste ' + __recortar(__mostrar(dato), 240) + '.';
    }
    if (e.jsonParcial !== undefined && !__subconjunto(e.jsonParcial, dato)) {
        return 'La respuesta tenía que incluir ' + __recortar(__mostrar(e.jsonParcial), 240) +
               ' y devolviste ' + __recortar(__mostrar(dato), 240) + '.';
    }
    if (e.contieneObjeto !== undefined) {
        const lista = Array.isArray(dato) ? dato : [dato];
        const hay = lista.some(function (x) { return __subconjunto(e.contieneObjeto, x); });
        if (!hay) {
            return 'No encontré ' + __recortar(__mostrar(e.contieneObjeto), 200) +
                   ' en la respuesta: ' + __recortar(__mostrar(dato), 240) + '.';
        }
    }
    if (e.noContieneObjeto !== undefined) {
        const lista2 = Array.isArray(dato) ? dato : [dato];
        const sigue = lista2.some(function (x) { return __subconjunto(e.noContieneObjeto, x); });
        if (sigue) {
            return 'Todavía aparece ' + __recortar(__mostrar(e.noContieneObjeto), 200) +
                   ' en la respuesta, y no tendría que estar: ' + __recortar(__mostrar(dato), 240) + '.';
        }
    }
    return null;
}

function __fallo(titulo, detalle, chequeo, extra) {
    const r = { ok: false, titulo: titulo, detalle: detalle };
    if (chequeo && chequeo.pista) r.pista = chequeo.pista;
    if (extra) Object.keys(extra).forEach(function (k) { r[k] = extra[k]; });
    return r;
}

function __verificar(chequeos) {

    for (let n = 0; n < chequeos.length; n++) {
        const ce = chequeos[n].entorno;
        if (!ce) continue;
        if (ce.instalado && !__proceso.instalados[ce.instalado]) {
            return __fallo('Falta instalar ' + ce.instalado,
                           'En la consola: npm install ' + ce.instalado, chequeos[n]);
        }
        if (ce.archivoExiste &&
            !Object.prototype.hasOwnProperty.call(__proceso.archivos, ce.archivoExiste)) {
            return __fallo('Falta el archivo ' + ce.archivoExiste,
                           'Todavía no existe en el proyecto.', chequeos[n]);
        }
    }
    if (chequeos.every(function (c) { return !!c.entorno; })) return { ok: true };

    const arranque = __correr('app.js');

    if (!arranque.ok) {
        return __fallo(
            arranque.error.sintaxis ? 'Tu código no compila' : 'Tu servidor se cayó al arrancar',
            arranque.error.nombre + ': ' + arranque.error.mensaje,
            null,
            { error: arranque.error, consola: arranque.consola }
        );
    }

    for (let i = 0; i < chequeos.length; i++) {
        const c = chequeos[i];
        if (c.entorno) continue;

        /* ---- chequeo sobre el texto del archivo --------------------------- */
        if (c.fuente) {
            const archivo = c.fuente.archivo || 'app.js';
            const texto = __proceso.archivos[archivo];
            if (texto === undefined) {
                return __fallo('Falta un archivo', 'El proyecto no tiene ' + archivo + '.', c);
            }
            const debe = c.fuente.debeTener || [];
            for (let j = 0; j < debe.length; j++) {
                if (!new RegExp(debe[j].re).test(texto)) {
                    return __fallo('Falta algo en ' + archivo, debe[j].que, c);
                }
            }
            const noDebe = c.fuente.noDebeTener || [];
            for (let k = 0; k < noDebe.length; k++) {
                if (new RegExp(noDebe[k].re).test(texto)) {
                    return __fallo('Hay algo de más en ' + archivo, noDebe[k].que, c);
                }
            }
            continue;
        }

        /* ---- chequeo del arranque ----------------------------------------- */
        if (c.arranque) {
            if (c.arranque.escuchando && !__proceso.escuchando) {
                return __fallo(
                    'Tu servidor no quedó escuchando',
                    'El archivo se ejecutó entero sin errores, pero nunca se llamó a app.listen(...). ' +
                    'Sin eso el proceso arranca, hace lo que tenga que hacer y se termina: no hay servidor.',
                    c
                );
            }
            if (c.arranque.puerto && __proceso.puerto !== c.arranque.puerto) {
                return __fallo(
                    'Puerto equivocado',
                    'Esperaba que escucharas en el puerto ' + c.arranque.puerto +
                    ' y quedaste escuchando en el ' + __proceso.puerto + '.',
                    c
                );
            }
            if (c.arranque.consolaContiene) {
                const salida = arranque.consola.map(function (l) { return l.texto; }).join('\n');
                if (salida.indexOf(c.arranque.consolaContiene) === -1) {
                    return __fallo(
                        'Falta el mensaje en la consola',
                        'Esperaba ver "' + c.arranque.consolaContiene + '" impreso al arrancar. ' +
                        (salida ? 'Se imprimió: ' + __recortar(salida, 200) : 'No se imprimió nada.'),
                        c
                    );
                }
            }
            continue;
        }

        /* ---- chequeo por pedido HTTP -------------------------------------- */
        if (c.pedido) {
            const p = {
                metodo: c.pedido.metodo || 'GET',
                ruta: c.pedido.ruta,
                cabeceras: c.pedido.cabeceras || {},
                cuerpoCrudo: ''
            };
            if (c.pedido.json !== undefined) {
                p.cuerpoCrudo = JSON.stringify(c.pedido.json);
                if (!p.cabeceras['Content-Type'] && !p.cabeceras['content-type']) {
                    p.cabeceras['Content-Type'] = 'application/json';
                }
            } else if (c.pedido.texto !== undefined) {
                p.cuerpoCrudo = c.pedido.texto;
            }

            const resp = __pedido(p);

            if (resp.sinServidor) {
                return __fallo('No hay servidor escuchando',
                               'Te falta app.listen(...) para que el servidor atienda pedidos.', c);
            }
            if (resp.colgado) {
                return __fallo('El pedido ' + p.metodo + ' ' + p.ruta + ' quedó colgado',
                               resp.error.pista, c, { error: resp.error, consola: resp.consola });
            }
            if (resp.error) {
                return __fallo(
                    resp.estado >= 500
                        ? 'Se rompió al atender ' + p.metodo + ' ' + p.ruta
                        : 'Respondiste bien, pero después tu código se rompió',
                    resp.error.nombre + ': ' + resp.error.mensaje,
                    c, { error: resp.error, consola: resp.consola }
                );
            }

            const problema = __compararEspera(c.espera, resp);
            if (problema) {
                return __fallo(p.metodo + ' ' + p.ruta + ' no devolvió lo que se pedía', problema, c, {
                    pedidoHecho: { metodo: p.metodo, ruta: p.ruta, cuerpo: p.cuerpoCrudo },
                    respuesta: { estado: resp.estado, cuerpo: __recortar(resp.cuerpo, 400) },
                    consola: resp.consola
                });
            }
            continue;
        }
    }

    return { ok: true };
}

/* --------------------------------------------------------------------------
 * Entrada única desde el worker
 * ------------------------------------------------------------------------ */

function __atender(orden) {
    const datos = orden || {};
    switch (datos.comando) {

        case 'entorno':
            __proceso.archivos = datos.archivos || {};
            __proceso.instalados = datos.instalados || {};
            return { ok: true };

        case 'correr':
            return __correr(datos.entrada || 'app.js');

        case 'apagar':
            __apagar();
            return { ok: true };

        case 'pedido':
            return __pedido(datos.pedido || {});

        case 'estado':
            return {
                escuchando: __proceso.escuchando,
                puerto: __proceso.puerto,
                rutas: __proceso.escuchando ? __mapaDeRutas(__proceso.app, '', [], []) : []
            };

        case 'verificar': {
            const estaba = __proceso.corriendo;
            const resultado = __verificar(datos.chequeos || []);
            if (estaba) __correr('app.js'); else __apagar();
            return resultado;
        }

        default:
            return { ok: false, titulo: 'Orden desconocida', detalle: String(datos.comando) };
    }
}
