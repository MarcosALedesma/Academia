/* ============================================================================
 * motor.js — Express, de mentira pero en serio. Ahora con base de datos.
 *
 * Es el mismo motor de clase-express/js/motor.js (léase su cabecera: la
 * decisión de fondo no cambió) con una vuelta de tuerca: acá el "Node" del
 * alumno también tiene bcrypt, jsonwebtoken, dotenv y un Sequelize de juguete.
 * Todo lo que se agrega respeta la misma regla de siempre: el alumno escribe
 * la sintaxis REAL de esos paquetes, y lo que cambia es quién la ejecuta.
 *
 * LA DIFERENCIA GRANDE CON clase-express: ahí el motor era 100 % sincrónico.
 * Acá no puede serlo — conectar a una base, hashear con bcrypt, todo eso es
 * async de verdad en cualquier proyecto real, y el alumno tiene que escribir
 * async/await para que ande. El router (__manejar/__invocar), __correr() y
 * __pedido() están rehechos para esperar promesas en vez de asumir que todo
 * termina en el mismo tick. Ver COMO-ESTA-HECHO.md, sección 4.
 *
 * LA BASE DE DATOS SOBREVIVE A UN REINICIO DEL SERVIDOR. A propósito: es
 * justamente la diferencia con el arreglo en memoria de la clase anterior, y
 * es la razón de ser de esta clase. `__proceso.baseDeDatos` vive fuera del
 * ciclo de vida de `node app.js` / Ctrl+C (que sólo limpia la caché de
 * require, como Node de verdad). Sólo se vacía cuando el alumno hace
 * `sequelize.sync({ force: true })` en su propio código, o cuando aprieta
 * Verificar (ver la sección del verificador, más abajo).
 * ========================================================================== */

/* --------------------------------------------------------------------------
 * Estado del "proceso"
 * ------------------------------------------------------------------------ */

const __proceso = {
    archivos: {},        // nombre -> contenido (el proyecto del alumno)
    modulos: {},         // caché de require, igual que la de Node
    consola: [],         // lo que imprimió console.log desde el último corte
    app: null,           // la app de Express que quedó escuchando
    puerto: null,
    escuchando: false,
    instalados: {},      // lo que "instaló" npm
    corriendo: false,    // ¿hay un node app.js vivo?
    baseDeDatos: {}       // nombreDeModelo -> { filas: [...], siguienteId }. SOBREVIVE reinicios.
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

/* --------------------------------------------------------------------------
 * Un pequeño "reloj": convierte cualquier operación en una Promise que se
 * resuelve unos milisegundos después. No es que haga falta tecnológicamente
 * —no hay red de verdad—, pero es lo que hace que "si te olvidás el await
 * pasa algo raro" sea DEMOSTRABLE en vez de un cuento. bcrypt, jwt* y las
 * consultas al modelo lo usan. (*jsonwebtoken en realidad es sincrónico sin
 * callback — por eso jwt.sign/verify NO pasan por acá, ver más abajo.)
 * ------------------------------------------------------------------------ */

function __asincrono(fn, ms) {
    return new Promise(function (resolver, rechazar) {
        setTimeout(function () {
            try { resolver(fn()); } catch (e) { rechazar(e); }
        }, ms === undefined ? 8 : ms);
    });
}

function __cadenaAleatoria(n) {
    const alfabeto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789./';
    let s = '';
    for (let i = 0; i < n; i++) s += alfabeto.charAt(Math.floor(Math.random() * alfabeto.length));
    return s;
}

/* --------------------------------------------------------------------------
 * Ruteo: '/api/tareas/:id'  ->  expresión regular + nombres de parámetros
 * Igual que en clase-express: alcanza con segmentos literales, :parámetros
 * y el '*' de cierre.
 * ------------------------------------------------------------------------ */

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

/* --------------------------------------------------------------------------
 * req y res — igual que en clase-express.
 * ------------------------------------------------------------------------ */

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

/* --------------------------------------------------------------------------
 * El router: una pila de capas que se recorre en orden con next().
 *
 * NOVEDAD respecto de clase-express: un manejador puede ser `async`. Si la
 * función devuelve algo con `.then`, y esa promesa se rechaza sin que el
 * alumno la haya atajado, __invocar la manda sola a next(error) — es el
 * comportamiento de Express 5. En Express 4 clásico esto NO es automático y
 * hay que hacer try/catch a mano; se los cuenta la teoría del paso del guard.
 * ------------------------------------------------------------------------ */

const __METODOS = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options', 'all'];

function __crearRouter() {
    const capas = [];

    const router = function (req, res, next) { return router.__manejar(req, res, next); };
    router.__esRouter = true;
    router.__capas = capas;

    __METODOS.forEach(function (metodo) {
        router[metodo] = function (patron) {
            const manejadores = [].slice.call(arguments, 1).filter(function (f) { return f !== undefined; });
            if (typeof patron !== 'string' && !(patron instanceof RegExp)) {
                throw new TypeError('.' + metodo + '() necesita la ruta como primer argumento. ' +
                                    'Por ejemplo: app.' + metodo + '("/api/tareas", (req, res) => { ... })');
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

    /** Recorre las capas. `salir` es el next() del router de más afuera. */
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
                    __invocar(capa, error, req, res, siguiente);
                    return;
                }

                const m = capa.prefijo.regex.exec(req.__camino);
                if (!m) continue;
                if (capa.prefijo.texto !== '/' && capa.prefijo.texto !== '') {
                    req.baseUrl = baseOriginal + m[0];
                    req.__camino = req.__camino.slice(m[0].length) || '/';
                }
                __invocar(capa, error, req, res, siguiente);
                return;
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

/** Llama a la capa. Si devuelve una promesa que se rechaza sin atajar, la manda a next(). */
function __invocar(capa, error, req, res, siguiente) {
    let resultado;
    try {
        resultado = (capa.tipo === 'error') ? capa.fn(error, req, res, siguiente)
                                             : capa.fn(req, res, siguiente);
    } catch (e) {
        siguiente(e);
        return;
    }
    if (resultado && typeof resultado.then === 'function') {
        resultado.catch(function (e) {
            if (!res.__respondio) siguiente(e);
        });
    }
}

/* --------------------------------------------------------------------------
 * El módulo `express` — igual que en clase-express.
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

/* --------------------------------------------------------------------------
 * bcrypt — hash unidireccional. No es criptografía de verdad (no hace falta:
 * nadie va a intentar romperlo), pero el CONTRATO es el real: hash() y
 * compare() son async y devuelven Promise; con la misma contraseña, dos
 * hash() dan resultados DISTINTOS (por la sal); compare() es la única forma
 * de verificar, porque el hash no se puede "deshacer".
 * ------------------------------------------------------------------------ */

function __crearBcrypt() {
    const LARGO_SAL = 7 + 22;   // '$2b$10$' (7) + 22 caracteres al azar

    function sal(rondas) {
        return '$2b$' + String(rondas || 10).padStart(2, '0') + '$' + __cadenaAleatoria(22);
    }

    /* Ni remotamente bcrypt de verdad: una mezcla determinística de la sal y
       el texto. Alcanza para el contrato (mismo texto + misma sal = mismo
       resultado; no se puede volver de acá para atrás a la contraseña). */
    function mezclar(sal, texto) {
        let h1 = 0, h2 = 0;
        const cadena = sal + '::' + texto;
        for (let i = 0; i < cadena.length; i++) h1 = (h1 * 31 + cadena.charCodeAt(i)) >>> 0;
        const combinado = cadena + h1;
        for (let i = 0; i < combinado.length; i++) h2 = (h2 * 131 + combinado.charCodeAt(i)) >>> 0;
        return h1.toString(36).padStart(7, '0') + h2.toString(36).padStart(7, '0');
    }

    const bcrypt = {};

    bcrypt.genSaltSync = function (rondas) { return sal(rondas); };

    bcrypt.hashSync = function (texto, rondasOSal) {
        if (typeof texto !== 'string') {
            throw new TypeError('data must be a string');
        }
        const s = typeof rondasOSal === 'string' ? rondasOSal : sal(rondasOSal);
        return s + mezclar(s, texto);
    };

    bcrypt.hash = function (texto, rondasOSal) {
        return __asincrono(function () { return bcrypt.hashSync(texto, rondasOSal); }, 20);
    };

    bcrypt.compareSync = function (texto, hashGuardado) {
        if (typeof texto !== 'string' || typeof hashGuardado !== 'string') return false;
        if (hashGuardado.indexOf('$2') !== 0) return false;
        if (hashGuardado.length < LARGO_SAL) return false;
        const s = hashGuardado.slice(0, LARGO_SAL);
        return hashGuardado === s + mezclar(s, texto);
    };

    bcrypt.compare = function (texto, hashGuardado) {
        return __asincrono(function () { return bcrypt.compareSync(texto, hashGuardado); }, 20);
    };

    return bcrypt;
}

/* --------------------------------------------------------------------------
 * jsonwebtoken — OJO: a diferencia de bcrypt, sign()/verify() SIN callback
 * son SINCRÓNICOS en el paquete de verdad, y acá se respeta tal cual. No
 * hace falta await para usarlos (aunque no molesta si lo ponen igual, porque
 * await sobre un valor que no es una promesa simplemente lo devuelve).
 * ------------------------------------------------------------------------ */

function __crearJwt() {
    function base64url(texto) {
        return btoa(unescape(encodeURIComponent(texto)))
            .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }
    function base64urlADecodificar(texto) {
        let t = texto.replace(/-/g, '+').replace(/_/g, '/');
        while (t.length % 4) t += '=';
        return decodeURIComponent(escape(atob(t)));
    }

    function firmar(datos, secreto) {
        let h1 = 0, h2 = 0;
        const cadena = String(secreto) + '::' + datos;
        for (let i = 0; i < cadena.length; i++) h1 = (h1 * 33 + cadena.charCodeAt(i)) >>> 0;
        const combinado = cadena + h1;
        for (let i = 0; i < combinado.length; i++) h2 = (h2 * 17 + combinado.charCodeAt(i)) >>> 0;
        return base64url(h1.toString(36) + '.' + h2.toString(36));
    }

    function segundos(expresion) {
        if (typeof expresion === 'number') return expresion;
        const m = /^(\d+)\s*(s|m|h|d)?$/.exec(String(expresion).trim());
        if (!m) throw new Error('"expiresIn" should be a number of seconds or string representing a timespan eg: "1d", "20h", "60"');
        const unidad = { s: 1, m: 60, h: 3600, d: 86400 }[m[2] || 's'];
        return Number(m[1]) * unidad;
    }

    const jwt = {};

    jwt.sign = function (payload, secreto, opciones) {
        if (secreto === undefined || secreto === null || secreto === '') {
            throw new Error('secretOrPrivateKey must have a value');
        }
        if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
            throw new Error('payload is required and must be an object. ' +
                            'jwt.sign({ id: usuario.id, ... }, SECRETO, { expiresIn: \'1h\' })');
        }
        const cabecera = { alg: 'HS256', typ: 'JWT' };
        const ahora = Math.floor(Date.now() / 1000);
        const cuerpo = Object.assign({}, payload, { iat: ahora });
        if (opciones && opciones.expiresIn !== undefined) {
            cuerpo.exp = ahora + segundos(opciones.expiresIn);
        }
        const encabezado = base64url(JSON.stringify(cabecera)) + '.' + base64url(JSON.stringify(cuerpo));
        return encabezado + '.' + firmar(encabezado, secreto);
    };

    jwt.verify = function (token, secreto) {
        if (typeof token !== 'string' || token === '') {
            const e = new Error('jwt must be provided'); e.name = 'JsonWebTokenError'; throw e;
        }
        const partes = token.split('.');
        if (partes.length !== 3) {
            const e = new Error('jwt malformed'); e.name = 'JsonWebTokenError'; throw e;
        }
        if (firmar(partes[0] + '.' + partes[1], secreto) !== partes[2]) {
            const e = new Error('invalid signature'); e.name = 'JsonWebTokenError'; throw e;
        }
        let cuerpo;
        try {
            cuerpo = JSON.parse(base64urlADecodificar(partes[1]));
        } catch (e2) {
            const e = new Error('invalid token'); e.name = 'JsonWebTokenError'; throw e;
        }
        if (cuerpo.exp !== undefined && Math.floor(Date.now() / 1000) >= cuerpo.exp) {
            const e = new Error('jwt expired');
            e.name = 'TokenExpiredError';
            e.expiredAt = new Date(cuerpo.exp * 1000);
            throw e;
        }
        return cuerpo;
    };

    jwt.decode = function (token) {
        try {
            const partes = String(token).split('.');
            return JSON.parse(base64urlADecodificar(partes[1]));
        } catch (e) { return null; }
    };

    return jwt;
}

/* --------------------------------------------------------------------------
 * dotenv — lee un .env "de archivo del proyecto" (no hay disco: es un
 * archivo más en __proceso.archivos) y carga process.env. Igual que el de
 * verdad: no pisa una variable que ya estaba puesta.
 * ------------------------------------------------------------------------ */

function __crearDotenv() {
    return {
        config: function (opciones) {
            const ruta = (opciones && opciones.path) ? String(opciones.path).replace(/^\.\//, '') : '.env';
            if (!Object.prototype.hasOwnProperty.call(__proceso.archivos, ruta)) {
                return { error: new Error("ENOENT: no such file or directory, open '" + ruta + "'") };
            }
            const parsed = {};
            String(__proceso.archivos[ruta]).split('\n').forEach(function (linea) {
                const l = linea.trim();
                if (!l || l.charAt(0) === '#') return;
                const igual = l.indexOf('=');
                if (igual === -1) return;
                const clave = l.slice(0, igual).trim();
                let valor = l.slice(igual + 1).trim();
                const entreComillas = (valor.charAt(0) === '"' && valor.charAt(valor.length - 1) === '"') ||
                                      (valor.charAt(0) === "'" && valor.charAt(valor.length - 1) === "'");
                if (entreComillas) valor = valor.slice(1, -1);
                parsed[clave] = valor;
                if (!Object.prototype.hasOwnProperty.call(__proceso.process.env, clave)) {
                    __proceso.process.env[clave] = valor;
                }
            });
            return { parsed: parsed };
        }
    };
}

/* --------------------------------------------------------------------------
 * sequelize — un ORM de juguete. define(), sync(), y en cada modelo:
 * create/findAll/findOne/findByPk/update/destroy, todos async. Las filas
 * viven en __proceso.baseDeDatos (ver la cabecera del archivo): sobreviven
 * un `node app.js` nuevo, y sólo se vacían con sync({ force: true }) o
 * cuando el alumno aprieta Verificar.
 * ------------------------------------------------------------------------ */

const DataTypes = {
    STRING: 'STRING', TEXT: 'TEXT', INTEGER: 'INTEGER', FLOAT: 'FLOAT',
    BOOLEAN: 'BOOLEAN', DATE: 'DATE', DATEONLY: 'DATEONLY'
};

function __filtrar(filas, opciones) {
    const where = (opciones || {}).where;
    if (!where) return filas.slice();
    return filas.filter(function (f) {
        return Object.keys(where).every(function (k) { return f[k] === where[k]; });
    });
}

function __normalizarColumna(def) {
    if (def === null || typeof def !== 'object') return { type: def };
    return def;
}

function __crearModelo(nombre, columnas) {
    if (!__proceso.baseDeDatos[nombre]) {
        __proceso.baseDeDatos[nombre] = { filas: [], siguienteId: 1 };
    }
    const tabla = __proceso.baseDeDatos[nombre];
    const modelo = {};
    modelo.__esModelo = true;
    modelo.__nombre = nombre;
    modelo.__columnas = columnas || {};

    function validar(datos, idPropio) {
        const fila = {};
        Object.keys(modelo.__columnas).forEach(function (clave) {
            const def = __normalizarColumna(modelo.__columnas[clave]);
            let valor = datos ? datos[clave] : undefined;
            if ((valor === undefined || valor === '') && def.defaultValue !== undefined) valor = def.defaultValue;
            if ((valor === undefined || valor === null) && def.allowNull === false) {
                const e = new Error('notNull Violation: ' + nombre + '.' + clave + ' no puede ser null');
                e.name = 'SequelizeValidationError';
                throw e;
            }
            if (valor !== undefined && valor !== null && def.unique) {
                const chocaCon = tabla.filas.some(function (f) { return f.id !== idPropio && f[clave] === valor; });
                if (chocaCon) {
                    const e = new Error('Validation error: ' + clave + ' debe ser único, y ya existe "' + valor + '"');
                    e.name = 'SequelizeUniqueConstraintError';
                    throw e;
                }
            }
            fila[clave] = valor === undefined ? null : valor;
        });
        return fila;
    }

    function conMetodos(fila) {
        fila.save = function () {
            return __asincrono(function () {
                const revalidada = validar(fila, fila.id);
                Object.keys(revalidada).forEach(function (k) { fila[k] = revalidada[k]; });
                fila.updatedAt = new Date().toISOString();
                const i = tabla.filas.findIndex(function (f) { return f.id === fila.id; });
                if (i !== -1) tabla.filas[i] = __copiar(fila);
                return fila;
            }, 8);
        };
        fila.destroy = function () {
            return __asincrono(function () {
                tabla.filas = tabla.filas.filter(function (f) { return f.id !== fila.id; });
                return undefined;
            }, 8);
        };
        fila.toJSON = function () {
            const copia = {};
            Object.keys(fila).forEach(function (k) { if (typeof fila[k] !== 'function') copia[k] = fila[k]; });
            return copia;
        };
        return fila;
    }

    function __copiar(o) {
        const c = {};
        Object.keys(o).forEach(function (k) { if (typeof o[k] !== 'function') c[k] = o[k]; });
        return c;
    }

    modelo.create = function (datos) {
        return __asincrono(function () {
            const fila = validar(datos, null);
            fila.id = tabla.siguienteId++;
            fila.createdAt = new Date().toISOString();
            fila.updatedAt = fila.createdAt;
            tabla.filas.push(fila);
            return conMetodos(__copiar(fila));
        }, 12);
    };

    modelo.count = function (opciones) {
        return __asincrono(function () { return __filtrar(tabla.filas, opciones).length; }, 8);
    };

    modelo.findAll = function (opciones) {
        return __asincrono(function () {
            return __filtrar(tabla.filas, opciones).map(function (f) { return conMetodos(__copiar(f)); });
        }, 10);
    };

    modelo.findOne = function (opciones) {
        return __asincrono(function () {
            const f = __filtrar(tabla.filas, opciones)[0];
            return f ? conMetodos(__copiar(f)) : null;
        }, 10);
    };

    modelo.findByPk = function (id) {
        return __asincrono(function () {
            const f = tabla.filas.find(function (x) { return String(x.id) === String(id); });
            return f ? conMetodos(__copiar(f)) : null;
        }, 10);
    };

    modelo.update = function (datos, opciones) {
        return __asincrono(function () {
            const afectadas = __filtrar(tabla.filas, opciones);
            afectadas.forEach(function (f) {
                Object.keys(datos || {}).forEach(function (k) {
                    if (Object.prototype.hasOwnProperty.call(modelo.__columnas, k)) f[k] = datos[k];
                });
                f.updatedAt = new Date().toISOString();
            });
            return [afectadas.length];
        }, 10);
    };

    modelo.destroy = function (opciones) {
        return __asincrono(function () {
            const afectadas = __filtrar(tabla.filas, opciones);
            tabla.filas = tabla.filas.filter(function (f) { return afectadas.indexOf(f) === -1; });
            return afectadas.length;
        }, 10);
    };

    return modelo;
}

function __crearSequelizeModulo() {

    function Sequelize(nombreOUrl) {
        this.__modelos = {};
        this.__nombre = typeof nombreOUrl === 'string' ? nombreOUrl : 'app';
    }

    Sequelize.prototype.authenticate = function () {
        return __asincrono(function () { return undefined; }, 15);
    };

    Sequelize.prototype.define = function (nombre, columnas) {
        const modelo = __crearModelo(nombre, columnas);
        this.__modelos[nombre] = modelo;
        return modelo;
    };

    Sequelize.prototype.sync = function (opciones) {
        const propios = this.__modelos;
        return __asincrono(function () {
            if (opciones && opciones.force) {
                Object.keys(propios).forEach(function (nombre) {
                    __proceso.baseDeDatos[nombre] = { filas: [], siguienteId: 1 };
                });
            }
            return undefined;
        }, 15);
    };

    Sequelize.prototype.close = function () {
        return __asincrono(function () { return undefined; }, 5);
    };

    return { Sequelize: Sequelize, DataTypes: DataTypes };
}

/* --------------------------------------------------------------------------
 * require() y el "sistema de archivos" — igual mecánica que clase-express,
 * con cuatro paquetes nuevos además de express.
 * ------------------------------------------------------------------------ */

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
const __PAQUETES = {
    express:      __crearExpress,
    bcrypt:       __crearBcrypt,
    jsonwebtoken: __crearJwt,
    dotenv:       __crearDotenv,
    sequelize:    __crearSequelizeModulo
};

function __crearRequire(desde) {
    return function require(nombre) {
        if (typeof nombre !== 'string' || nombre === '') {
            throw new TypeError('require() necesita el nombre del módulo entre comillas.');
        }

        if (Object.prototype.hasOwnProperty.call(__PAQUETES, nombre)) {
            if (!__proceso.instalados[nombre]) {
                const e = new Error("Cannot find module '" + nombre + "'");
                e.code = 'MODULE_NOT_FOUND';
                e.__pista = 'El paquete ' + nombre + ' no viene con Node: hay que instalarlo. ' +
                            'Corré  npm install ' + nombre + '  en la consola y volvé a intentar.';
                throw e;
            }
            return __PAQUETES[nombre]();
        }

        if (__NUCLEO.indexOf(nombre) !== -1) {
            const e = new Error("Cannot find module '" + nombre + "'");
            e.__pista = 'El módulo ' + nombre + ' existe en Node de verdad, pero esta clase no lo simula: ' +
                        'el alcance es Express, bcrypt, jsonwebtoken, dotenv y sequelize.';
            throw e;
        }

        const destino = __resolver(__normalizar(nombre, desde));
        if (!destino) {
            const e = new Error("Cannot find module '" + nombre + "'");
            e.code = 'MODULE_NOT_FOUND';
            e.__pista = nombre.charAt(0) === '.'
                ? 'No existe ese archivo en el proyecto. Fijate el nombre en las solapas del editor. ' +
                  'Acordate del ./ adelante para los archivos propios.'
                : 'Ese paquete no está instalado, o no es ninguno de los que entran en esta clase ' +
                  '(express, bcrypt, jsonwebtoken, dotenv, sequelize) ni un archivo propio (con ./ adelante).';
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

    let explicacion = error && error.__pista ? error.__pista : null;

    if (!explicacion && error && error.name === 'JsonWebTokenError') {
        explicacion = 'El guard llamó a jwt.verify(...) y no lo atajó con try/catch. Cuando el token ' +
                      'no vino, está mal formado o la firma no coincide, jwt.verify() NO devuelve null: ' +
                      'tira un error. Hay que envolverlo: try { const datos = jwt.verify(token, SECRETO); ' +
                      '... } catch (error) { return res.status(401).json({ error: \'Token inválido\' }); }';
    }
    if (!explicacion && error && error.name === 'TokenExpiredError') {
        explicacion = 'El token venció (pasó el expiresIn). jwt.verify() tira un error cuando eso pasa, ' +
                      'igual que con un token inválido: hay que atajarlo con try/catch y devolver 401.';
    }
    if (!explicacion && error && error.name === 'SequelizeValidationError') {
        explicacion = 'El modelo rechazó los datos (' + mensaje + '). Pasa cuando falta un campo con ' +
                      'allowNull: false, o no cumple una regla. Conviene atajarlo y devolver un 400, no ' +
                      'dejar que tire abajo el pedido.';
    }
    if (!explicacion && error && error.name === 'SequelizeUniqueConstraintError') {
        explicacion = 'Ya existe una fila con ese valor en una columna unique (por ejemplo, ese email ya ' +
                      'está registrado). Conviene atajarlo con try/catch y devolver un 400 con un mensaje ' +
                      'claro, no dejar que rompa el servidor.';
    }

    const traducciones = [
        [/Cannot read propert(?:y|ies) of (undefined|null) \(reading '([^']+)'\)/,
         function (m) {
             return 'Estás leyendo .' + m[2] + ' de algo que vale ' + m[1] + '. ' +
                    'Si es req.body, te falta app.use(express.json()). ' +
                    'Si es req.usuario, no pasaste por el guard (o el guard no lo asignó). ' +
                    'Si es el resultado de un findOne()/findByPk(), no encontró nada: hay que preguntar ' +
                    'por null antes de usarlo.';
         }],
        [/([\w$.]+) is not a function/,
         function (m) { return m[1] + ' no es una función. Revisá el nombre: casi siempre es una letra de más o de menos.'; }],
        [/([\w$]+) is not defined/,
         function (m) { return 'No existe ninguna variable llamada ' + m[1] + ' en este archivo. ' +
                               'Fijate si la declaraste, la importaste, o si la escribiste distinto.'; }],
        [/Assignment to constant variable/,
         function () { return 'Estás reasignando una variable declarada con const.'; }]
    ];

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

/** Apaga el proceso (Ctrl+C). La caché de require se limpia, la "base de
 *  datos" NO: es justamente la diferencia con un arreglo en memoria. */
function __apagar() {
    __proceso.modulos = {};
    __proceso.app = null;
    __proceso.puerto = null;
    __proceso.escuchando = false;
    __proceso.corriendo = false;
    __proceso.consola = [];
}

/** Espera, en pasos cortos, a que el arranque asincrónico del alumno
 *  (conectar, sincronizar, recién ahí app.listen) termine de asentarse. Si
 *  el archivo llamó a app.listen() de forma sincrónica, esto vuelve ya
 *  mismo: sólo se demora cuando hace falta. */
function __esperarEscucha() {
    const LIMITE = 400, PASO = 10;
    let pasado = 0;
    return new Promise(function (resolver) {
        (function intentar() {
            if (__proceso.escuchando || pasado >= LIMITE) return resolver();
            pasado += PASO;
            setTimeout(intentar, PASO);
        })();
    });
}

/** `node app.js`. Devuelve una Promise porque el arranque puede depender de
 *  cosas asincrónicas (conectar a la base, sincronizar los modelos). */
function __correr(entrada) {
    __apagar();
    const nombre = entrada || 'app.js';

    if (!Object.prototype.hasOwnProperty.call(__proceso.archivos, nombre)) {
        return Promise.resolve({
            ok: false, consola: [],
            error: { nombre: 'Error', mensaje: "Cannot find module '" + nombre + "'",
                     archivo: nombre, linea: null,
                     pista: 'No existe ese archivo en el proyecto.', sintaxis: false }
        });
    }

    try {
        __ejecutarArchivo(nombre);
    } catch (e) {
        const consola = __vaciarConsola();
        __proceso.escuchando = false;
        return Promise.resolve({ ok: false, consola: consola, error: __describirError(e) });
    }

    return __esperarEscucha().then(function () {
        __proceso.corriendo = true;
        return {
            ok: true,
            consola: __vaciarConsola(),
            escuchando: __proceso.escuchando,
            puerto: __proceso.puerto,
            rutas: __proceso.escuchando ? __mapaDeRutas(__proceso.app, '', [], []) : []
        };
    });
}

/** Espera a que el pedido quede resuelto: `res` respondida, O el router llegó
 *  al final de las capas (con o sin error) y avisó por su callback de salida.
 *  Si tarda más que LIMITE, se da por colgado — el mismo diagnóstico que un
 *  pedido sincrónico que nunca llama a next() ni responde, sólo que acá hace
 *  falta un plazo real porque un manejador async legítimo también tarda unos
 *  milisegundos. Sin mirar también `estaListo()` (que se prende cuando el
 *  router terminó, incluso si nadie respondió), un next(error) async que cae
 *  en un pedido sin middleware de error se reportaría como "colgado" en vez
 *  de como el error que es. */
function __esperarListo(res, estaListo) {
    const LIMITE = 800, PASO = 10;
    let pasado = 0;
    return new Promise(function (resolver) {
        (function intentar() {
            if (res.__respondio || estaListo()) return resolver(false);
            if (pasado >= LIMITE) return resolver(true);
            pasado += PASO;
            setTimeout(intentar, PASO);
        })();
    });
}

/** Un pedido HTTP contra el servidor que quedó escuchando. */
function __pedido(pedido) {
    if (!__proceso.escuchando || !__proceso.app) {
        return Promise.resolve({ sinServidor: true, consola: __vaciarConsola() });
    }

    const req = __crearReq(pedido);
    const res = __crearRes();
    let errorFinal = null;
    let cayoAlFinal = false;
    let terminado = false;

    try {
        __proceso.app.__manejar(req, res, function (error) {
            terminado = true;
            if (error) { errorFinal = error; return; }
            cayoAlFinal = true;
        });
    } catch (e) {
        errorFinal = e;
        terminado = true;
    }

    return __esperarListo(res, function () { return terminado; }).then(function (colgado) {
        if (colgado) {
            return {
                colgado: true, consola: __vaciarConsola(),
                error: {
                    nombre: 'Error', mensaje: 'El pedido quedó colgado.',
                    archivo: 'app.js', linea: null, sintaxis: false,
                    pista: 'Alguna función que atendió ' + req.method + ' ' + req.path + ' terminó sin ' +
                           'responder y sin llamar a next(). Si es un manejador async, revisá que todos ' +
                           'los caminos terminen en un return con res.json()/res.send(), o en next().'
                }
            };
        }

        if (cayoAlFinal && !res.__respondio) {
            res.statusCode = 404;
            res.__cabeceras['content-type'] = 'text/html; charset=utf-8';
            res.__cuerpo = '<pre>Cannot ' + req.method + ' ' + req.path + '</pre>';
            res.__respondio = true;
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

        return {
            estado: res.statusCode,
            cabeceras: res.__cabeceras,
            cuerpo: res.__cuerpo,
            consola: __vaciarConsola(),
            error: errorFinal ? __describirError(errorFinal) : null
        };
    });
}

/* ==========================================================================
 * EL VERIFICADOR
 *
 * Mismo vocabulario que clase-express (documentado ahí), más dos cosas
 * nuevas que hacen falta para probar rutas protegidas con JWT:
 *
 *   guardar: { token: 'token' }
 *     Después de un chequeo de pedido que salió bien, guarda el campo
 *     `token` de la respuesta (JSON) bajo el nombre `token`, para usarlo
 *     después.
 *
 *   {{token}}  dentro de `ruta`, `cabeceras` o `json`
 *     Se reemplaza por lo que se haya guardado con ese nombre. Así se puede
 *     hacer login en un chequeo y usar el token real en el siguiente:
 *
 *   { pedido: { metodo:'POST', ruta:'/api/auth/login', json:{...} },
 *     espera: { estado: 200, camposEnCadaUno: ['token'] },
 *     guardar: { token: 'token' } },
 *   { pedido: { metodo:'GET', ruta:'/api/tareas',
 *               cabeceras: { Authorization: 'Bearer {{token}}' } },
 *     espera: { estado: 200, esArreglo: true } }
 *
 * Los chequeos corren EN ORDEN sobre el MISMO servidor, arrancado limpio y
 * con la "base de datos" vacía (sync({force:true}) implícito): así un test
 * puede registrarse, loguearse y usar su propio token, sin pisarse con lo
 * que el alumno haya cargado a mano.
 * ========================================================================== */

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
                     e.noContieneObjeto !== undefined || e.camposEnCadaUno !== undefined ||
                     e.sinCampos !== undefined;
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
    if (e.sinCampos) {
        const lista3 = Array.isArray(dato) ? dato : [dato];
        for (let i = 0; i < lista3.length; i++) {
            for (let j = 0; j < e.sinCampos.length; j++) {
                const campo = e.sinCampos[j];
                if (lista3[i] && typeof lista3[i] === 'object' &&
                    Object.prototype.hasOwnProperty.call(lista3[i], campo)) {
                    return 'La respuesta NO tendría que traer la propiedad "' + campo + '" (por ejemplo, ' +
                           'la contraseña o el hash nunca se devuelven) y la trae: ' +
                           __recortar(__mostrar(lista3[i]), 200) + '.';
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

function __expandirVariables(valor, variables) {
    if (typeof valor === 'string') {
        return valor.replace(/\{\{(\w+)\}\}/g, function (_, nombreVar) {
            return Object.prototype.hasOwnProperty.call(variables, nombreVar) ? variables[nombreVar] : '';
        });
    }
    if (Array.isArray(valor)) return valor.map(function (v) { return __expandirVariables(v, variables); });
    if (valor && typeof valor === 'object') {
        const copia = {};
        Object.keys(valor).forEach(function (k) { copia[k] = __expandirVariables(valor[k], variables); });
        return copia;
    }
    return valor;
}

async function __verificar(chequeos) {

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

    /* La base de datos se vacía antes de verificar: los chequeos necesitan
       partir siempre del mismo punto. Es la misma idea que un pedido con
       datos de prueba en CI, y ya está avisado en la interfaz que Verificar
       reinicia el servidor con lo que el alumno tenga cargado a mano. */
    __proceso.baseDeDatos = {};

    const arranque = await __correr('app.js');

    if (!arranque.ok) {
        return __fallo(
            arranque.error.sintaxis ? 'Tu código no compila' : 'Tu servidor se cayó al arrancar',
            arranque.error.nombre + ': ' + arranque.error.mensaje,
            null,
            { error: arranque.error, consola: arranque.consola }
        );
    }

    const variables = {};

    for (let i = 0; i < chequeos.length; i++) {
        const c = chequeos[i];
        if (c.entorno) continue;

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

        if (c.pedido) {
            const p = {
                metodo: c.pedido.metodo || 'GET',
                ruta: __expandirVariables(c.pedido.ruta, variables),
                cabeceras: __expandirVariables(c.pedido.cabeceras || {}, variables),
                cuerpoCrudo: ''
            };
            if (c.pedido.json !== undefined) {
                p.cuerpoCrudo = JSON.stringify(__expandirVariables(c.pedido.json, variables));
                if (!p.cabeceras['Content-Type'] && !p.cabeceras['content-type']) {
                    p.cabeceras['Content-Type'] = 'application/json';
                }
            } else if (c.pedido.texto !== undefined) {
                p.cuerpoCrudo = __expandirVariables(c.pedido.texto, variables);
            }

            const resp = await __pedido(p);

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

            if (c.guardar) {
                let datoJson = null;
                try { datoJson = JSON.parse(resp.cuerpo); } catch (e) { /* nada para guardar */ }
                if (datoJson && typeof datoJson === 'object') {
                    Object.keys(c.guardar).forEach(function (nombreVar) {
                        const campo = c.guardar[nombreVar];
                        if (Object.prototype.hasOwnProperty.call(datoJson, campo)) {
                            variables[nombreVar] = String(datoJson[campo]);
                        }
                    });
                }
            }
            continue;
        }
    }

    return { ok: true };
}

/* --------------------------------------------------------------------------
 * Entrada única desde el worker
 * ------------------------------------------------------------------------ */

async function __atender(orden) {
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
            const resultado = await __verificar(datos.chequeos || []);
            if (estaba) await __correr('app.js'); else __apagar();
            return resultado;
        }

        default:
            return { ok: false, titulo: 'Orden desconocida', detalle: String(datos.comando) };
    }
}
