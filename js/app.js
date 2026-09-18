/* ============================================================================
 * app.js — La interfaz de las clases (la misma para inicial y avanzada).
 *
 * Estado, navegación entre pasos, editor, verificación y panel de pedidos.
 * El contenido está en pasos.js; la ejecución, en runner.js y motor.js. Acá no
 * hay nada de Express: sólo pantalla.
 * ========================================================================== */

/* La clave de localStorage, el motor, los paquetes y los textos propios de cada clase
   salen de CLASE_ACTUAL (clases.js); el contenido, de PASOS (contenido/<clase>.js). */

const estado = {
    paso: 0,
    archivos: {},
    instalados: {},
    completados: {},
    archivoActivo: 'app.js',
    servidorCorriendo: false
};

let terminal = null;

/* --------------------------------------------------------------------------
 * Persistencia
 *
 * La clase dura dos horas y el navegador de una máquina del laboratorio se
 * reinicia solo más seguido de lo que uno querría. Todo lo que el alumno
 * escribe se guarda en cada tecla: si se corta la luz, se recupera.
 * ------------------------------------------------------------------------ */

let relojGuardado = null;

function guardar() {
    clearTimeout(relojGuardado);
    relojGuardado = setTimeout(guardarYa, 300);
}

/** Escribe en el momento, sin esperar los 300 ms. main.js lo llama antes de salir de la clase. */
function guardarYa() {
    clearTimeout(relojGuardado);
    try {
        localStorage.setItem(CLASE_ACTUAL.clave, JSON.stringify({
            paso: estado.paso,
            archivos: estado.archivos,
            instalados: estado.instalados,
            completados: estado.completados,
            archivoActivo: estado.archivoActivo
        }));
    } catch (e) { /* modo incógnito o disco lleno: se sigue sin guardar */ }
}

function recuperar() {
    let crudo = null;
    try { crudo = localStorage.getItem(CLASE_ACTUAL.clave); } catch (e) { return false; }
    if (!crudo) return false;
    try {
        const d = JSON.parse(crudo);
        estado.paso = d.paso || 0;
        estado.archivos = d.archivos || {};
        estado.instalados = d.instalados || {};
        estado.completados = d.completados || {};
        estado.archivoActivo = d.archivoActivo || 'app.js';
        return true;
    } catch (e) { return false; }
}

/* --------------------------------------------------------------------------
 * Texto: escapado y el mini-marcado de la teoría
 * ------------------------------------------------------------------------ */

function escapar(texto) {
    return String(texto)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** `código` y **negrita**. Nada más: no es Markdown y no queremos que lo sea. */
function marcado(texto) {
    return escapar(texto)
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

/* --------------------------------------------------------------------------
 * Resaltado de sintaxis
 *
 * Un <pre> abajo con el texto coloreado y el <textarea> encima con la letra
 * transparente y el cursor visible. Los dos con exactamente la misma tipografía,
 * el mismo interlineado y el mismo padding, y los scrolls atados: si se
 * despegan, se nota enseguida.
 * ------------------------------------------------------------------------ */

const PALABRAS = ('const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|' +
                  'new|delete|typeof|instanceof|in|of|class|extends|this|null|undefined|true|false|' +
                  'try|catch|finally|throw|async|await|export|default').split('|');

function resaltar(codigo) {
    const patron = new RegExp(
        '(\\/\\*[\\s\\S]*?\\*\\/|\\/\\/[^\\n]*)' +                    // 1 comentarios
        '|(\'(?:[^\'\\\\\\n]|\\\\.)*\'|"(?:[^"\\\\\\n]|\\\\.)*"|`(?:[^`\\\\]|\\\\.)*`)' +  // 2 textos
        '|(\\b\\d+(?:\\.\\d+)?\\b)' +                                 // 3 números
        '|\\b(' + PALABRAS.join('|') + ')\\b' +                       // 4 palabras clave
        '|(\\.[A-Za-z_$][\\w$]*)' +                                   // 5 .propiedades
        '|\\b([A-Za-z_$][\\w$]*)(?=\\s*\\()',                         // 6 llamadas
        'g');

    let salida = '';
    let ultimo = 0;
    let m;

    while ((m = patron.exec(codigo)) !== null) {
        salida += escapar(codigo.slice(ultimo, m.index));
        const clase = m[1] ? 'c-comentario' : m[2] ? 'c-texto' : m[3] ? 'c-numero'
                    : m[4] ? 'c-clave' : m[5] ? 'c-propiedad' : 'c-llamada';
        salida += '<span class="' + clase + '">' + escapar(m[0]) + '</span>';
        ultimo = m.index + m[0].length;
    }
    salida += escapar(codigo.slice(ultimo));
    /* El salto final hace que la última línea no quede pegada al borde y que
       el <pre> y el <textarea> midan lo mismo. */
    return salida + '\n';
}

/* --------------------------------------------------------------------------
 * Bloques de teoría y consigna
 * ------------------------------------------------------------------------ */

function dibujarBloques(bloques) {
    return (bloques || []).map(function (b) {
        if (b.h)        return '<h3>' + marcado(b.h) + '</h3>';
        if (b.p)        return '<p>' + marcado(b.p) + '</p>';
        if (b.clave)    return '<div class="caja clave"><span class="etiqueta-caja">La idea</span>' +
                               '<p>' + marcado(b.clave) + '</p></div>';
        if (b.nota)     return '<div class="caja nota"><span class="etiqueta-caja">Ojo</span>' +
                               '<p>' + marcado(b.nota) + '</p></div>';
        if (b.lista)    return '<ul>' + b.lista.map(function (i) {
                                   return '<li>' + marcado(i) + '</li>'; }).join('') + '</ul>';
        if (b.numerada) return '<ol>' + b.numerada.map(function (i) {
                                   return '<li>' + marcado(i) + '</li>'; }).join('') + '</ol>';
        if (b.codigo)   return '<div class="bloque-codigo">' +
                               (b.archivo ? '<div class="nombre-bloque">' + escapar(b.archivo) + '</div>' : '') +
                               '<pre><code>' + resaltar(b.codigo) + '</code></pre>' +
                               '<button class="copiar" data-copiar="' + escapar(b.codigo) + '">copiar</button>' +
                               '</div>';
        if (b.diagrama) return '<div class="bloque-diagrama"><pre>' + escapar(b.diagrama) + '</pre></div>';
        if (b.terminal) return '<div class="bloque-terminal"><pre>' + escapar(b.terminal) + '</pre>' +
                               '<button class="copiar" data-copiar="' + escapar(b.terminal) + '">copiar</button>' +
                               '</div>';
        if (b.tabla)    return '<div class="envoltorio-tabla"><table><thead><tr>' +
                               b.tabla.cabeceras.map(function (c) {
                                   return '<th>' + marcado(c) + '</th>'; }).join('') +
                               '</tr></thead><tbody>' +
                               b.tabla.filas.map(function (f) {
                                   return '<tr>' + f.map(function (c) {
                                       return '<td>' + marcado(c) + '</td>'; }).join('') + '</tr>';
                               }).join('') + '</tbody></table></div>';
        return '';
    }).join('');
}

/* --------------------------------------------------------------------------
 * El editor
 * ------------------------------------------------------------------------ */

const editor = {
    caja: null, texto: null, pinta: null, regleta: null
};

function iniciarEditor() {
    editor.caja = document.getElementById('caja-editor');
    editor.texto = document.getElementById('editor');
    editor.pinta = document.getElementById('pintado');
    editor.regleta = document.getElementById('regleta');

    editor.texto.addEventListener('input', function () {
        estado.archivos[estado.archivoActivo] = editor.texto.value;
        pintarEditor();
        guardar();
        marcarDesincronizado();
    });

    editor.texto.addEventListener('scroll', function () {
        editor.pinta.scrollTop = editor.texto.scrollTop;
        editor.pinta.scrollLeft = editor.texto.scrollLeft;
        editor.regleta.scrollTop = editor.texto.scrollTop;
    });

    editor.texto.addEventListener('keydown', function (evento) {
        /* Tab mete dos espacios en vez de saltar de control. En un editor de
           código es lo que uno espera; el precio es que hay que salir con el
           mouse, y para eso está Escape+Tab. */
        if (evento.key === 'Tab') {
            evento.preventDefault();
            const t = editor.texto;
            const inicio = t.selectionStart, fin = t.selectionEnd;
            t.value = t.value.slice(0, inicio) + '  ' + t.value.slice(fin);
            t.selectionStart = t.selectionEnd = inicio + 2;
            t.dispatchEvent(new Event('input'));
            return;
        }
        /* Enter mantiene la indentación de la línea anterior, y la aumenta si
           esa línea terminaba en llave o paréntesis abierto. */
        if (evento.key === 'Enter') {
            const t = editor.texto;
            const hastaAca = t.value.slice(0, t.selectionStart);
            const lineaActual = hastaAca.slice(hastaAca.lastIndexOf('\n') + 1);
            const sangria = (/^[ \t]*/.exec(lineaActual) || [''])[0];
            const abre = /[{([]\s*$/.test(lineaActual);
            const extra = abre ? '  ' : '';
            if (sangria === '' && !abre) return;
            evento.preventDefault();
            const inicio = t.selectionStart, fin = t.selectionEnd;
            const inserto = '\n' + sangria + extra;
            t.value = t.value.slice(0, inicio) + inserto + t.value.slice(fin);
            t.selectionStart = t.selectionEnd = inicio + inserto.length;
            t.dispatchEvent(new Event('input'));
        }
    });
}

function pintarEditor() {
    const codigo = editor.texto.value;
    editor.pinta.innerHTML = resaltar(codigo);
    const lineas = codigo.split('\n').length;
    let numeros = '';
    for (let i = 1; i <= lineas; i++) numeros += i + '\n';
    editor.regleta.textContent = numeros;
}

function abrirArchivo(nombre) {
    if (estado.archivos[nombre] === undefined) return;
    estado.archivoActivo = nombre;
    editor.texto.value = estado.archivos[nombre];
    pintarEditor();
    dibujarSolapas();
    guardar();
}

function dibujarSolapas() {
    const contenedor = document.getElementById('solapas-archivos');
    const nombres = Object.keys(estado.archivos).sort(function (a, b) {
        if (a === 'app.js') return -1;                  // app.js siempre primero
        if (b === 'app.js') return 1;
        if (a === 'package.json') return 1;             // y package.json último
        if (b === 'package.json') return -1;
        return a.localeCompare(b);
    });

    contenedor.innerHTML = nombres.map(function (n) {
        return '<button class="solapa-archivo' + (n === estado.archivoActivo ? ' activa' : '') +
               '" data-archivo="' + escapar(n) + '">' + escapar(n) + '</button>';
    }).join('') + '<button class="solapa-archivo nuevo" id="boton-nuevo-archivo" title="Crear un archivo">+</button>';

    contenedor.querySelectorAll('[data-archivo]').forEach(function (boton) {
        boton.addEventListener('click', function () { abrirArchivo(boton.dataset.archivo); });
    });
    document.getElementById('boton-nuevo-archivo').addEventListener('click', nuevoArchivo);

    document.getElementById('editor-vacio').hidden = nombres.length > 0;
}

function nuevoArchivo() {
    const nombre = prompt('Nombre del archivo nuevo (por ejemplo: ' + CLASE_ACTUAL.ejemploArchivo + ')');
    if (!nombre) return;
    const limpio = nombre.trim().replace(/^\.?\//, '');
    if (!limpio) return;
    if (estado.archivos[limpio] !== undefined) return abrirArchivo(limpio);
    estado.archivos[limpio] = '';
    abrirArchivo(limpio);
}

/* --------------------------------------------------------------------------
 * El aviso de "guardaste pero no reiniciaste"
 *
 * Es el tropiezo número uno de la clase: cambian el código, hacen curl y ven
 * el comportamiento viejo. En Node pasa exactamente igual y por eso existe
 * nodemon. Acá se avisa, pero no se reinicia solo: que lo hagan ellos.
 * ------------------------------------------------------------------------ */

let desincronizado = false;

function marcarDesincronizado() {
    if (!estado.servidorCorriendo || desincronizado) return;
    desincronizado = true;
    document.getElementById('aviso-reinicio').hidden = false;
}

function limpiarDesincronizado() {
    desincronizado = false;
    document.getElementById('aviso-reinicio').hidden = true;
}

/* --------------------------------------------------------------------------
 * Navegación entre pasos
 * ------------------------------------------------------------------------ */

function pasoActual() { return PASOS[estado.paso]; }

function dibujarIndice() {
    const contenedor = document.getElementById('indice-pasos');
    contenedor.innerHTML = PASOS.map(function (p, i) {
        const hecho = estado.completados[p.id] ? ' hecho' : '';
        const activo = i === estado.paso ? ' activo' : '';
        return '<button class="paso-indice' + hecho + activo + '" data-paso="' + i + '">' +
               '<span class="numero-paso">' + (i + 1) + '</span>' +
               '<span class="titulo-paso">' + escapar(p.titulo) + '</span>' +
               '<span class="tilde">&#10003;</span></button>';
    }).join('');

    contenedor.querySelectorAll('[data-paso]').forEach(function (boton) {
        boton.addEventListener('click', function () { irAPaso(Number(boton.dataset.paso)); });
    });

    const hechos = PASOS.filter(function (p) { return estado.completados[p.id]; }).length;
    document.getElementById('progreso-texto').textContent = hechos + ' de ' + PASOS.length;
    document.getElementById('progreso-barra').style.width =
        (PASOS.length ? (hechos / PASOS.length) * 100 : 0) + '%';
}

function irAPaso(indice) {
    if (indice < 0 || indice >= PASOS.length) return;
    estado.paso = indice;
    const paso = PASOS[indice];

    /* La semilla NUNCA pisa lo que el alumno escribió: sólo crea lo que falta. */
    if (paso.semilla) {
        let creado = null;
        Object.keys(paso.semilla).forEach(function (n) {
            if (estado.archivos[n] !== undefined) return;
            estado.archivos[n] = paso.semilla[n];
            if (creado === null) creado = n;
        });
        /* Se abre la solapa nueva sólo la primera vez. Volver a un paso ya
           hecho no tiene por qué sacarte del archivo donde estabas. */
        if (creado !== null) estado.archivoActivo = creado;
    }

    document.getElementById('numero-actual').textContent = (indice + 1) + '.';
    document.getElementById('titulo-actual').textContent = paso.titulo;
    document.getElementById('minutos-actual').textContent = '~' + paso.minutos + ' min';
    document.getElementById('teoria').innerHTML = dibujarBloques(paso.teoria);
    document.getElementById('consigna').innerHTML = dibujarBloques(paso.consigna);

    document.getElementById('anterior').disabled = indice === 0;
    document.getElementById('siguiente').disabled = indice === PASOS.length - 1;
    document.getElementById('boton-solucion').hidden = !paso.solucion;

    limpiarResultado();
    dibujarIndice();
    dibujarSugerencias(paso);
    if (Object.keys(estado.archivos).length > 0) {
        if (estado.archivos[estado.archivoActivo] === undefined) {
            estado.archivoActivo = Object.keys(estado.archivos)[0];
        }
        abrirArchivo(estado.archivoActivo);
    } else {
        dibujarSolapas();
    }
    document.getElementById('columna-teoria').scrollTop = 0;
    guardar();
}

function dibujarSugerencias(paso) {
    const consola = document.getElementById('sugerencias-consola');
    consola.innerHTML = (paso.consolaSugerida || []).map(function (c) {
        return '<button class="chip" data-comando="' + escapar(c) + '">' + escapar(c) + '</button>';
    }).join('');
    consola.querySelectorAll('[data-comando]').forEach(function (b) {
        b.addEventListener('click', function () {
            terminal.ejecutar(b.dataset.comando);
            terminal.enfocar();
        });
    });

    const pedidos = document.getElementById('sugerencias-pedidos');
    pedidos.innerHTML = (paso.probar || []).map(function (p, i) {
        return '<button class="chip metodo-' + p.metodo.toLowerCase() + '" data-probar="' + i + '">' +
               p.metodo + ' ' + escapar(p.ruta) + '</button>';
    }).join('');
    pedidos.querySelectorAll('[data-probar]').forEach(function (b) {
        b.addEventListener('click', function () {
            const p = paso.probar[Number(b.dataset.probar)];
            document.getElementById('metodo-pedido').value = p.metodo;
            document.getElementById('ruta-pedido').value = p.ruta;
            document.getElementById('cuerpo-pedido').value = p.cuerpo || '';
            document.getElementById('cabeceras-pedido').value = p.cabeceras || '';
            actualizarFormularioPedido();
            enviarPedidoDelPanel();
        });
    });
}

/* --------------------------------------------------------------------------
 * Ejecución: todo lo que toca el worker pasa por acá
 * ------------------------------------------------------------------------ */

function sincronizarProyecto() {
    return sincronizar(estado.archivos, estado.instalados);
}

function correrProyecto(entrada) {
    return sincronizarProyecto().then(function () {
        return correr(entrada);
    }).then(function (r) {
        estado.servidorCorriendo = !!r.escuchando;
        limpiarDesincronizado();
        refrescarRutas();
        return r;
    });
}

function apagarProyecto() {
    estado.servidorCorriendo = false;
    limpiarDesincronizado();
    refrescarRutas();
    return apagar();
}

/** El único camino por el que sale un pedido, venga del curl o del panel. */
function hacerPedido(pedido) {
    return pedir(pedido).then(function (resp) {
        /* Lo que el servidor imprime va a la consola, porque es su salida
           estándar. En la vida real serían dos ventanas distintas; acá se
           distingue por color. */
        (resp.consola || []).forEach(function (l) {
            terminal.escribir(l.texto, 'log-servidor');
        });
        return resp;
    });
}

function refrescarRutas() {
    const caja = document.getElementById('lista-rutas');
    if (!estado.servidorCorriendo) {
        caja.innerHTML = '<p class="vacio">El servidor no está corriendo. Arrancalo con ' +
                         '<code>node app.js</code> y acá vas a ver todas las rutas que quedaron ' +
                         'declaradas, en el orden en que Express las va a probar.</p>';
        return;
    }
    estadoServidor().then(function (r) {
        const rutas = r.rutas || [];
        if (rutas.length === 0) {
            caja.innerHTML = '<p class="vacio">El servidor está escuchando pero no tiene ' +
                             'ninguna ruta declarada. Cualquier pedido va a dar 404.</p>';
            return;
        }
        caja.innerHTML = '<table class="tabla-rutas"><tbody>' + rutas.map(function (x, i) {
            if (x.medio) {
                return '<tr class="fila-medio"><td class="orden">' + (i + 1) + '</td>' +
                       '<td class="etiqueta-medio">middleware</td>' +
                       '<td colspan="2">' + escapar(x.nombre) +
                       (x.tipo === 'error' ? ' <em>(de error)</em>' : '') + '</td></tr>';
            }
            return '<tr><td class="orden">' + (i + 1) + '</td>' +
                   '<td><span class="pastilla metodo-' + x.metodo.toLowerCase() + '">' +
                   escapar(x.metodo) + '</span></td>' +
                   '<td class="ruta-celda">' + escapar(x.ruta) + '</td><td></td></tr>';
        }).join('') + '</tbody></table>';
    });
}

/* --------------------------------------------------------------------------
 * El panel de pedidos
 * ------------------------------------------------------------------------ */

function actualizarFormularioPedido() {
    const metodo = document.getElementById('metodo-pedido').value;
    const conCuerpo = metodo === 'POST' || metodo === 'PUT' || metodo === 'PATCH';
    document.getElementById('caja-cuerpo-pedido').hidden = !conCuerpo;
}

function enviarPedidoDelPanel() {
    const metodo = document.getElementById('metodo-pedido').value;
    let ruta = document.getElementById('ruta-pedido').value.trim();
    const cuerpo = document.getElementById('cuerpo-pedido').value;
    const cabecerasCrudo = document.getElementById('cabeceras-pedido').value;
    const caja = document.getElementById('respuesta-pedido');

    if (ruta === '') ruta = '/';
    if (ruta.charAt(0) !== '/') ruta = '/' + ruta;

    if (!estado.servidorCorriendo) {
        caja.className = 'respuesta mal';
        caja.innerHTML = '<div class="linea-estado">Connection refused</div>' +
                         '<p>No hay ningún servidor escuchando. Arrancalo con <code>node app.js</code> ' +
                         'en la consola.</p>';
        return;
    }

    const cabeceras = {};
    const conCuerpo = metodo === 'POST' || metodo === 'PUT' || metodo === 'PATCH';
    cabecerasCrudo.split('\n').forEach(function (linea) {
        const corte = linea.indexOf(':');
        if (corte === -1) return;
        const clave = linea.slice(0, corte).trim();
        const valor = linea.slice(corte + 1).trim();
        if (clave) cabeceras[clave] = valor;
    });
    if (conCuerpo && cuerpo.trim() !== '' && !cabeceras['Content-Type']) {
        cabeceras['Content-Type'] = 'application/json';
    }

    caja.className = 'respuesta';
    caja.innerHTML = '<div class="linea-estado">esperando…</div>';

    hacerPedido({ metodo: metodo, ruta: ruta, cabeceras: cabeceras,
                  cuerpoCrudo: conCuerpo ? cuerpo : '' }).then(function (resp) {

        if (resp.titulo) {                               // se colgó y lo mataron
            estado.servidorCorriendo = false;
            refrescarRutas();
            caja.className = 'respuesta mal';
            caja.innerHTML = '<div class="linea-estado">' + escapar(resp.titulo) + '</div>' +
                             '<p>' + escapar(resp.detalle || '') + '</p>';
            return;
        }
        if (resp.sinServidor) {
            estado.servidorCorriendo = false;
            caja.className = 'respuesta mal';
            caja.innerHTML = '<div class="linea-estado">Connection refused</div>';
            return;
        }
        if (resp.colgado) {
            caja.className = 'respuesta mal';
            caja.innerHTML = '<div class="linea-estado">El pedido quedó colgado</div>' +
                             '<p>' + escapar(resp.error.pista) + '</p>';
            return;
        }

        const tipo = resp.cabeceras['content-type'] || '';
        let cuerpoMostrado = resp.cuerpo;
        if (tipo.indexOf('application/json') !== -1) {
            try { cuerpoMostrado = JSON.stringify(JSON.parse(resp.cuerpo), null, 2); }
            catch (e) { /* si no parsea, se muestra crudo */ }
        }

        caja.className = 'respuesta ' + (resp.estado >= 400 ? 'mal' : 'bien');
        caja.innerHTML =
            '<div class="linea-estado"><span class="codigo-estado">' + resp.estado + '</span> ' +
            escapar(textoDeEstado(resp.estado)) +
            '<span class="tipo-respuesta">' + escapar(tipo.split(';')[0] || 'sin tipo') + '</span></div>' +
            (cuerpoMostrado === '' ? '<p class="vacio">Sin cuerpo.</p>'
                                   : '<pre class="cuerpo-respuesta">' + escapar(cuerpoMostrado) + '</pre>') +
            (resp.error ? '<div class="error-posterior"><strong>Respondiste, pero después se rompió:</strong> ' +
                          escapar(resp.error.nombre + ': ' + resp.error.mensaje) +
                          (resp.error.pista ? '<br>' + escapar(resp.error.pista) : '') + '</div>' : '');
    });
}

function textoDeEstado(codigo) {
    return ({ 200: 'OK', 201: 'Created', 204: 'No Content', 400: 'Bad Request',
              401: 'Unauthorized', 403: 'Forbidden', 404: 'Not Found',
              500: 'Internal Server Error' })[codigo] || '';
}

/* --------------------------------------------------------------------------
 * Verificación
 * ------------------------------------------------------------------------ */

function limpiarResultado() {
    const caja = document.getElementById('resultado');
    caja.className = 'resultado';
    caja.innerHTML = '';
    caja.hidden = true;
}

function verificarPaso() {
    const paso = pasoActual();
    const boton = document.getElementById('boton-verificar');
    const caja = document.getElementById('resultado');

    boton.disabled = true;
    boton.textContent = 'Verificando…';
    caja.hidden = false;
    caja.className = 'resultado esperando';
    caja.innerHTML = '<p>Arrancando tu servidor y haciéndole los pedidos…</p>';

    sincronizarProyecto()
        .then(function () { return verificar(paso.chequeos); })
        .then(function (r) {
            boton.disabled = false;
            boton.textContent = 'Verificar';

            /* La verificación reinicia el proceso. Si el alumno tenía datos
               cargados a mano, se le fueron: mejor decírselo que dejarlo
               descubrir solo por qué la lista volvió a tener tres. */
            if (estado.servidorCorriendo) {
                terminal.escribir('[clase] La verificación reinició el servidor con el código actual' +
                                  (CLASE_ACTUAL.reinicioConBase ? ' y una base de datos vacía' : '') +
                                  ': lo que hayas cargado a mano se perdió.', 'tenue');
                limpiarDesincronizado();
                refrescarRutas();
            }

            if (r.ok) {
                estado.completados[paso.id] = true;
                dibujarIndice();
                guardar();
                caja.className = 'resultado bien';
                caja.innerHTML = '<h4>Listo, el paso ' + (estado.paso + 1) + ' está resuelto.</h4>' +
                    (estado.paso < PASOS.length - 1
                        ? '<p>Podés seguir con <strong>' + escapar(PASOS[estado.paso + 1].titulo) +
                          '</strong>.</p><button class="boton primario" id="seguir">Siguiente paso &rarr;</button>'
                        : '<p>Y con eso terminaste la clase entera. Bien ahí.</p>');
                const seguir = document.getElementById('seguir');
                if (seguir) seguir.addEventListener('click', function () { irAPaso(estado.paso + 1); });
                return;
            }

            caja.className = 'resultado mal';
            let html = '<h4>' + escapar(r.titulo || 'Todavía no') + '</h4>';
            if (r.detalle) html += '<p>' + escapar(r.detalle) + '</p>';

            if (r.error) {
                html += '<div class="traza">' +
                        escapar(r.error.archivo + (r.error.linea ? ':' + r.error.linea : '')) + '  ' +
                        escapar(r.error.nombre + ': ' + r.error.mensaje) + '</div>';
                if (r.error.pista) html += '<p class="pista">' + escapar(r.error.pista) + '</p>';
            }
            if (r.pista) html += '<p class="pista">' + escapar(r.pista) + '</p>';

            if (r.pedidoHecho) {
                html += '<div class="detalle-pedido"><strong>Se hizo:</strong> ' +
                        escapar(r.pedidoHecho.metodo + ' ' + r.pedidoHecho.ruta) +
                        (r.pedidoHecho.cuerpo ? '  con cuerpo  ' + escapar(r.pedidoHecho.cuerpo) : '') +
                        '<br><strong>Devolviste:</strong> ' + r.respuesta.estado + '  ' +
                        escapar(r.respuesta.cuerpo || '(sin cuerpo)') + '</div>';
            }
            if (r.consola && r.consola.length) {
                html += '<div class="consola-verificacion"><strong>Tu servidor imprimió:</strong><pre>' +
                        escapar(r.consola.map(function (l) { return l.texto; }).join('\n')) + '</pre></div>';
            }
            caja.innerHTML = html;
        });
}

function verSolucion() {
    const paso = pasoActual();
    if (!paso.solucion) return;

    const nombres = Object.keys(paso.solucion);
    const aviso = 'Esto va a reemplazar ' + nombres.join(' y ') +
                  ' con la solución completa del paso ' + (estado.paso + 1) + '.\n\n' +
                  'Lo que hayas escrito en ' + (nombres.length > 1 ? 'esos archivos' : 'ese archivo') +
                  ' se pierde. ¿Seguimos?';
    if (!confirm(aviso)) return;

    nombres.forEach(function (n) { estado.archivos[n] = paso.solucion[n]; });
    estado.archivoActivo = nombres[0];
    abrirArchivo(nombres[0]);
    marcarDesincronizado();
    guardar();

    terminal.escribir('[clase] Se pegó la solución del paso ' + (estado.paso + 1) +
                      '. Acordate de reiniciar el servidor: Ctrl+C y node app.js', 'tenue');
}

/* --------------------------------------------------------------------------
 * Reinicios
 * ------------------------------------------------------------------------ */

function reiniciarTodo() {
    if (!confirm('Esto borra TODO: los archivos que escribiste, los paquetes instalados y el ' +
                 'progreso de los ' + PASOS.length + ' pasos. No se puede deshacer. ¿Seguro?')) return;
    try { localStorage.removeItem(CLASE_ACTUAL.clave); } catch (e) { /* da igual */ }
    location.reload();
}

/* --------------------------------------------------------------------------
 * Solapas del panel de abajo
 * ------------------------------------------------------------------------ */

function iniciarSolapasPanel() {
    document.querySelectorAll('[data-panel]').forEach(function (boton) {
        boton.addEventListener('click', function () {
            document.querySelectorAll('[data-panel]').forEach(function (b) {
                b.classList.toggle('activa', b === boton);
            });
            document.querySelectorAll('.panel').forEach(function (p) {
                p.hidden = p.id !== 'panel-' + boton.dataset.panel;
            });
            if (boton.dataset.panel === 'consola') terminal.enfocar();
            if (boton.dataset.panel === 'rutas') refrescarRutas();
        });
    });
}

/* --------------------------------------------------------------------------
 * Arranque
 * ------------------------------------------------------------------------ */

function arrancar() {
    iniciarEditor();

    const habia = recuperar();

    terminal = crearTerminal(
        {
            salida: document.getElementById('salida-consola'),
            entrada: document.getElementById('entrada-consola'),
            prompt: document.getElementById('prompt-consola')
        },
        {
            leerArchivo: function (n) {
                return estado.archivos[n] === undefined ? null : estado.archivos[n];
            },
            escribirArchivo: function (n, c) {
                const eraNuevo = estado.archivos[n] === undefined;
                estado.archivos[n] = c;
                /* El primer archivo del proyecto lo crea `npm init`, y hasta
                   ese momento el editor está vacío y sin solapa activa. */
                if (eraNuevo && estado.archivos[estado.archivoActivo] === undefined) {
                    abrirArchivo(n);
                } else {
                    dibujarSolapas();
                }
                guardar();
            },
            listarArchivos: function () { return Object.keys(estado.archivos); },
            instalados: function () { return estado.instalados; },
            instalar: function (nombre, version) {
                estado.instalados[nombre] = version;
                /* npm install también toca el package.json: es la mitad del punto. */
                const crudo = estado.archivos['package.json'];
                if (crudo) {
                    try {
                        const p = JSON.parse(crudo);
                        p.dependencies = p.dependencies || {};
                        p.dependencies[nombre] = '^' + version;
                        estado.archivos['package.json'] = JSON.stringify(p, null, 2) + '\n';
                        if (estado.archivoActivo === 'package.json') abrirArchivo('package.json');
                    } catch (e) { /* si estaba roto, no se toca */ }
                }
                guardar();
            },
            servidorCorriendo: function () { return estado.servidorCorriendo; },
            servidorSeCayo: function () {
                estado.servidorCorriendo = false;
                refrescarRutas();
            },
            correr: correrProyecto,
            apagar: apagarProyecto,
            pedir: hacerPedido
        }
    );

    iniciarSolapasPanel();

    document.getElementById('anterior').addEventListener('click', function () { irAPaso(estado.paso - 1); });
    document.getElementById('siguiente').addEventListener('click', function () { irAPaso(estado.paso + 1); });
    document.getElementById('boton-verificar').addEventListener('click', verificarPaso);
    document.getElementById('boton-solucion').addEventListener('click', verSolucion);
    document.getElementById('boton-reiniciar').addEventListener('click', reiniciarTodo);
    document.getElementById('metodo-pedido').addEventListener('change', actualizarFormularioPedido);
    document.getElementById('enviar-pedido').addEventListener('click', enviarPedidoDelPanel);
    document.getElementById('ruta-pedido').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') enviarPedidoDelPanel();
    });

    /* Los botones "copiar" de los bloques de código de la teoría. */
    document.addEventListener('click', function (evento) {
        const boton = evento.target.closest('.copiar');
        if (!boton) return;
        const texto = boton.dataset.copiar;
        if (navigator.clipboard) navigator.clipboard.writeText(texto);
        const antes = boton.textContent;
        boton.textContent = 'copiado';
        setTimeout(function () { boton.textContent = antes; }, 1200);
    });

    irAPaso(estado.paso);
    sincronizarProyecto();

    if (habia) {
        terminal.escribir('[clase] Se recuperó lo que tenías de antes: los archivos y el progreso.', 'tenue');
        terminal.escribir('[clase] El servidor arranca apagado. Levantalo con  node app.js', 'tenue');
    } else {
        terminal.escribir('Consola del proyecto. Escribí  help  si te perdés.', 'tenue');
        terminal.escribir('');
    }
    terminal.enfocar();
}

/* arrancar() lo llama main.js cuando la ruta es una clase. */
