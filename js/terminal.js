function crearTerminal(elementos, api) {

    const salida = elementos.salida;
    const entrada = elementos.entrada;
    const prompt = elementos.prompt;

    const historial = [];
    let posicionHistorial = -1;

    function escribir(texto, clase) {
        const linea = document.createElement('div');
        linea.className = 'linea-consola' + (clase ? ' ' + clase : '');
        linea.textContent = texto;
        salida.appendChild(linea);
        salida.scrollTop = salida.scrollHeight;
        return linea;
    }

    function escribirBloque(texto, clase) {
        String(texto).split('\n').forEach(function (l) { escribir(l, clase); });
    }

    function limpiar() { salida.innerHTML = ''; }

    function actualizarPrompt() {
        prompt.textContent = api.servidorCorriendo() ? 'proyecto (servidor) $' : 'proyecto $';
        prompt.className = 'prompt' + (api.servidorCorriendo() ? ' corriendo' : '');
    }

    /* --------------------------------------------------------------------------
     * Partir la línea en argumentos respetando comillas
     * ------------------------------------------------------------------------ */

    function partir(linea) {
        const partes = [];
        let actual = '';
        let comilla = null;
        let hayAlgo = false;

        for (let i = 0; i < linea.length; i++) {
            const c = linea.charAt(i);
            if (comilla) {
                if (c === comilla) { comilla = null; continue; }
                actual += c;
                continue;
            }
            if (c === '"' || c === "'") { comilla = c; hayAlgo = true; continue; }
            if (c === ' ' || c === '\t') {
                if (actual !== '' || hayAlgo) { partes.push(actual); actual = ''; hayAlgo = false; }
                continue;
            }
            actual += c;
        }
        if (actual !== '' || hayAlgo) partes.push(actual);
        return partes;
    }

    /* --------------------------------------------------------------------------
     * npm — sólo conoce los paquetes de CLASE_ACTUAL.paquetes
     * ------------------------------------------------------------------------ */

    const VERSIONES = CLASE_ACTUAL.paquetes;

    function npm(args) {
        const sub = args[0];

        if (sub === 'init') {
            const paquete = {
                name: CLASE_ACTUAL.paqueteJson.name,
                version: '1.0.0',
                description: CLASE_ACTUAL.paqueteJson.description,
                main: 'app.js',
                scripts: { start: 'node app.js' },
                dependencies: {}
            };
            const existente = api.leerArchivo('package.json');
            if (existente) {
                try { paquete.dependencies = JSON.parse(existente).dependencies || {}; } catch (e) { }
            }
            api.escribirArchivo('package.json', JSON.stringify(paquete, null, 2) + '\n');
            escribir('Wrote to /proyecto/package.json:');
            escribir('');
            escribirBloque(JSON.stringify(paquete, null, 2), 'tenue');
            escribir('');
            return;
        }

        if (sub === 'install' || sub === 'i') {
            const paquetes = args.slice(1).filter(function (a) { return a.charAt(0) !== '-'; });

            if (!api.leerArchivo('package.json')) {
                escribir('npm ERR! Could not read package.json', 'error');
                escribir('npm ERR! No existe el package.json: primero corré  npm init -y', 'error');
                return;
            }

            if (paquetes.length === 0) {
                let deps = {};
                try { deps = JSON.parse(api.leerArchivo('package.json')).dependencies || {}; } catch (e) { }
                const nombres = Object.keys(deps);
                if (nombres.length === 0) {
                    escribir('up to date, audited 1 package in 0s');
                    return;
                }
                nombres.forEach(function (n) { api.instalar(n, deps[n].replace('^', '')); });
                escribir('added ' + nombres.length + ' package' + (nombres.length === 1 ? '' : 's') + ' in 2s');
                return;
            }

            let alguno = false;
            paquetes.forEach(function (nombre) {
                if (!Object.prototype.hasOwnProperty.call(VERSIONES, nombre)) {
                    escribir('npm ERR! 404 Not Found - GET https://registry.npmjs.org/' + nombre, 'error');
                    escribir('npm ERR! [clase] En esta clase los paquetes disponibles son: ' +
                             Object.keys(VERSIONES).join(', ') + '.', 'error');
                    return;
                }
                api.instalar(nombre, VERSIONES[nombre]);
                alguno = true;
            });
            if (alguno) {
                escribir('');
                escribir('added ' + paquetes.length + ' package' + (paquetes.length === 1 ? '' : 's') + ' in 3s');
                escribir('');
                escribir('found 0 vulnerabilities');
                escribir('');
            }
            return;
        }

        escribir('Unknown command: "' + (sub === undefined ? '' : sub) + '"', 'error');
        escribir('[clase] Acá npm entiende  npm init -y  y  npm install <paquete>', 'tenue');
    }

    /* --------------------------------------------------------------------------
     * curl
     * ------------------------------------------------------------------------ */

    function curl(args) {
        let metodo = null;
        let url = null;
        const cabeceras = {};
        let cuerpo = '';
        let mostrarCabeceras = false;

        for (let i = 0; i < args.length; i++) {
            const a = args[i];
            if (a === '-X' || a === '--request') { metodo = (args[++i] || '').toUpperCase(); continue; }
            if (a === '-H' || a === '--header') {
                const h = args[++i] || '';
                const corte = h.indexOf(':');
                if (corte !== -1) cabeceras[h.slice(0, corte).trim()] = h.slice(corte + 1).trim();
                continue;
            }
            if (a === '-d' || a === '--data') { cuerpo = args[++i] || ''; continue; }
            if (a === '-i' || a === '--include') { mostrarCabeceras = true; continue; }
            if (a === '-s' || a === '--silent') continue;
            if (a.charAt(0) === '-') {
                escribir('curl: option ' + a + ': is unknown', 'error');
                escribir('[clase] curl acá entiende: -X  -H  -d  -i', 'tenue');
                return Promise.resolve();
            }
            if (!url) url = a;
        }

        if (!url) {
            escribir('curl: try \'curl --help\' for more information', 'error');
            return Promise.resolve();
        }
        if (!metodo) metodo = cuerpo ? 'POST' : 'GET';

        let ruta = url;
        const m = /^https?:\/\/[^/]*(\/.*)?$/.exec(url);
        if (m) ruta = m[1] || '/';
        else if (ruta.charAt(0) !== '/') ruta = '/' + ruta;

        if (!api.servidorCorriendo()) {
            escribir('curl: (7) Failed to connect to localhost port 3000: Connection refused', 'error');
            escribir('[clase] No hay ningún servidor escuchando. Arrancalo con  node app.js', 'tenue');
            return Promise.resolve();
        }

        return api.pedir({ metodo: metodo, ruta: ruta, cabeceras: cabeceras, cuerpoCrudo: cuerpo })
            .then(function (resp) {
                if (resp.sinServidor) {
                    escribir('curl: (7) Connection refused', 'error');
                    return;
                }
                if (resp.colgado) {
                    escribir('^C  [clase] el pedido nunca respondió: se cortó a mano.', 'error');
                    if (resp.error && resp.error.pista) escribirBloque(resp.error.pista, 'tenue');
                    return;
                }
                if (resp.titulo) {
                    escribir(resp.titulo, 'error');
                    escribirBloque(resp.detalle || '', 'tenue');
                    api.servidorSeCayo();
                    return;
                }

                if (mostrarCabeceras) {
                    escribir('HTTP/1.1 ' + resp.estado + ' ' + textoEstado(resp.estado), 'tenue');
                    Object.keys(resp.cabeceras).forEach(function (k) {
                        escribir(k + ': ' + resp.cabeceras[k], 'tenue');
                    });
                    escribir('');
                }

                if (resp.cuerpo !== '') escribirBloque(formatear(resp), 'cuerpo');

                escribir('[' + resp.estado + ' ' + textoEstado(resp.estado) + ' · ' +
                         (resp.cabeceras['content-type'] || 'sin tipo').split(';')[0] + ']',
                         resp.estado >= 400 ? 'estado-mal' : 'estado-bien');

                if (resp.error) {
                    escribir('');
                    escribir('[clase] Ojo: respondiste, pero después tu código se rompió:', 'error');
                    escribir('  ' + resp.error.nombre + ': ' + resp.error.mensaje, 'error');
                    if (resp.error.pista) escribirBloque('  ' + resp.error.pista, 'tenue');
                }
            });
    }

    function formatear(resp) {
        const tipo = resp.cabeceras['content-type'] || '';
        if (tipo.indexOf('application/json') === -1) return resp.cuerpo;
        try { return JSON.stringify(JSON.parse(resp.cuerpo), null, 2); }
        catch (e) { return resp.cuerpo; }
    }

    function textoEstado(codigo) {
        return ({ 200: 'OK', 201: 'Created', 204: 'No Content', 301: 'Moved Permanently',
                  400: 'Bad Request', 401: 'Unauthorized', 403: 'Forbidden', 404: 'Not Found',
                  500: 'Internal Server Error' })[codigo] || '';
    }

    /* --------------------------------------------------------------------------
     * node
     * ------------------------------------------------------------------------ */

    function node(args) {
        const archivo = args[0] || 'app.js';
        if (!api.leerArchivo(archivo)) {
            escribir('node:internal/modules/cjs/loader:1143', 'error');
            escribir('Error: Cannot find module \'/proyecto/' + archivo + '\'', 'error');
            return Promise.resolve();
        }

        return api.correr(archivo).then(function (r) {
            if (r.titulo) {
                escribir(r.titulo, 'error');
                escribirBloque(r.detalle || '', 'tenue');
                api.servidorSeCayo();
                actualizarPrompt();
                return;
            }

            (r.consola || []).forEach(function (l) {
                escribir(l.texto, l.nivel === 'error' ? 'error' : (l.nivel === 'warn' ? 'aviso' : ''));
            });

            if (!r.ok) {
                escribir('');
                escribir(r.error.archivo + (r.error.linea ? ':' + r.error.linea : ''), 'error');
                escribir(r.error.nombre + ': ' + r.error.mensaje, 'error');
                if (r.error.pista) { escribir(''); escribirBloque(r.error.pista, 'tenue'); }
                escribir('');
                escribir('Node.js v20.11.0', 'tenue');
                actualizarPrompt();
                return;
            }

            if (!r.escuchando) {
                escribir('');
                escribir('[clase] El archivo se ejecutó entero y el proceso terminó.', 'tenue');
                escribir('[clase] Sin app.listen(...) no hay servidor.', 'tenue');
            }
            actualizarPrompt();
        });
    }

    /* --------------------------------------------------------------------------
     * El resto
     * ------------------------------------------------------------------------ */

    function ls() {
        const nombres = api.listarArchivos().slice().sort();
        const carpetas = {};
        const sueltos = [];
        nombres.forEach(function (n) {
            const corte = n.indexOf('/');
            if (corte === -1) sueltos.push(n);
            else carpetas[n.slice(0, corte)] = true;
        });
        const todo = Object.keys(carpetas).map(function (c) { return c + '/'; }).concat(sueltos);
        if (Object.keys(api.instalados()).length > 0) todo.unshift('node_modules/');
        escribir(todo.join('   '));
    }

    function cat(args) {
        const nombre = args[0];
        if (!nombre) return escribir('cat: falta el nombre del archivo', 'error');
        const contenido = api.leerArchivo(nombre);
        if (contenido === null) {
            return escribir('cat: ' + nombre + ': No such file or directory', 'error');
        }
        escribirBloque(contenido.replace(/\n$/, ''), 'cuerpo');
    }

    function ayuda() {
        escribir('Comandos de esta consola:', 'titulo-ayuda');
        [['npm init -y', 'crea el package.json'],
         ['npm install ' + Object.keys(CLASE_ACTUAL.paquetes).join(' '), CLASE_ACTUAL.ayudaNpm],
         ['node app.js', 'arranca el servidor'],
         ['Ctrl+C  ·  stop', 'para el servidor'],
         ['curl <url>', 'le hace un pedido GET'],
         ['curl -X POST <url> -H "Content-Type: application/json" -d \'{...}\'', 'un POST con cuerpo'],
         CLASE_ACTUAL.conCabeceras ? ['curl <url> -H "Authorization: Bearer <token>"', 'un pedido con el token del login'] : null,
         ['curl -i <url>', 'muestra también las cabeceras'],
         ['ls  ·  cat <archivo>  ·  clear', 'mirar el proyecto y limpiar la pantalla']
        ].filter(Boolean).forEach(function (par) {
            escribir('  ' + par[0]);
            escribir('      ' + par[1], 'tenue');
        });
    }

    /* --------------------------------------------------------------------------
     * El despachador
     * ------------------------------------------------------------------------ */

    function ejecutar(linea) {
        const texto = linea.trim();
        escribir((api.servidorCorriendo() ? 'proyecto (servidor) $ ' : 'proyecto $ ') + texto, 'eco');
        if (texto === '') return Promise.resolve();

        historial.push(texto);
        posicionHistorial = historial.length;

        const partes = partir(texto);
        const comando = partes[0];
        const args = partes.slice(1);

        switch (comando) {
            case 'npm':   npm(args); break;
            case 'node':  return node(args).then(actualizarPrompt);
            case 'curl':  return curl(args).then(actualizarPrompt);
            case 'ls':    ls(); break;
            case 'dir':   ls(); break;
            case 'cat':   cat(args); break;
            case 'type':  cat(args); break;
            case 'clear': limpiar(); break;
            case 'cls':   limpiar(); break;
            case 'pwd':   escribir('/proyecto'); break;
            case 'help':  ayuda(); break;
            case 'stop':
            case 'exit':
                if (api.servidorCorriendo()) { api.apagar(); escribir('^C'); }
                else escribir('[clase] No hay ningún servidor corriendo.', 'tenue');
                break;
            case 'cd':
                escribir('[clase] Acá hay una sola carpeta y ya estás parado adentro.', 'tenue');
                break;
            default:
                escribir(comando + ': command not found', 'error');
                escribir('[clase] Escribí  help  para ver los comandos que entiende esta consola.', 'tenue');
        }

        actualizarPrompt();
        return Promise.resolve();
    }

    /* --------------------------------------------------------------------------
     * Teclado
     * ------------------------------------------------------------------------ */

    entrada.addEventListener('keydown', function (evento) {
        if (evento.key === 'Enter') {
            evento.preventDefault();
            const linea = entrada.value;
            entrada.value = '';
            ejecutar(linea);
            return;
        }
        if (evento.key === 'ArrowUp') {
            evento.preventDefault();
            if (posicionHistorial > 0) { posicionHistorial--; entrada.value = historial[posicionHistorial]; }
            return;
        }
        if (evento.key === 'ArrowDown') {
            evento.preventDefault();
            if (posicionHistorial < historial.length - 1) {
                posicionHistorial++;
                entrada.value = historial[posicionHistorial];
            } else {
                posicionHistorial = historial.length;
                entrada.value = '';
            }
            return;
        }
        if (evento.key === 'c' && (evento.ctrlKey || evento.metaKey) && !window.getSelection().toString()) {
            evento.preventDefault();
            escribir((api.servidorCorriendo() ? 'proyecto (servidor) $ ' : 'proyecto $ ') + entrada.value + '^C', 'eco');
            entrada.value = '';
            if (api.servidorCorriendo()) { api.apagar(); }
            actualizarPrompt();
        }
    });

    salida.parentElement.addEventListener('click', function (evento) {
        if (window.getSelection().toString()) return;
        entrada.focus();
    });

    actualizarPrompt();

    return {
        ejecutar: ejecutar,
        escribir: escribir,
        escribirBloque: escribirBloque,
        limpiar: limpiar,
        actualizarPrompt: actualizarPrompt,
        enfocar: function () { entrada.focus(); }
    };
}
