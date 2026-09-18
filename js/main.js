/* ============================================================================
 * main.js — Qué se muestra: el panel de inicio o una clase.
 *
 *   index.html          → panel con las clases y el avance de cada una
 *   index.html#/inicial → la clase inicial
 *   index.html#/avanzada→ la clase avanzada
 *
 * Al cambiar de ruta se recarga la página. Es lo más simple y no pierde nada:
 * el avance de cada clase ya está guardado en localStorage.
 * ========================================================================== */

/* Las globales que usan app.js, runner.js y terminal.js. Se completan más abajo. */
let CLASE_ACTUAL = null;
let PASOS = [];

function idPaso(i) { return 'p' + String(i + 1).padStart(2, '0'); }

function leerAvance(clase) {
    let crudo = null;
    try { crudo = localStorage.getItem(clase.clave); } catch (e) { return null; }
    if (!crudo) return null;
    try { return JSON.parse(crudo); } catch (e) { return null; }
}

function escaparAtributo(texto) {
    return String(texto).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

/* --------------------------------------------------------------------------
 * Panel de inicio
 * ------------------------------------------------------------------------ */

function tarjetaDeClase(clase) {
    const pasos = CONTENIDO[clase.id] || [];
    const avance = leerAvance(clase);
    const completados = (avance && avance.completados) || {};
    const hechos = pasos.filter(function (_, i) { return completados[idPaso(i)]; }).length;
    const actual = Math.min(Math.max((avance && avance.paso) || 0, 0), Math.max(pasos.length - 1, 0));
    const empezada = !!avance && (hechos > 0 || actual > 0);
    const terminada = pasos.length > 0 && hechos === pasos.length;

    const segmentos = pasos.map(function (p, i) {
        const cls = [];
        if (completados[idPaso(i)]) cls.push('hecho');
        if (empezada && i === actual) cls.push('actual');
        return '<li class="' + cls.join(' ') + '" title="' + (i + 1) + '. ' + escaparAtributo(p.titulo) + '"></li>';
    }).join('');

    let situacion = 'Todavía no empezaste esta clase.';
    let boton = 'Empezar';
    if (terminada) { situacion = 'Completaste todos los pasos.'; boton = 'Repasar'; }
    else if (empezada) { situacion = 'Vas por el paso ' + (actual + 1) + ': ' + pasos[actual].titulo; boton = 'Continuar'; }

    const el = document.createElement('a');
    el.className = 'tarjeta-clase';
    el.href = '#/' + clase.id;
    el.innerHTML =
        '<span class="nivel">' + clase.nivel + '</span>' +
        '<h2>' + clase.titulo + '</h2>' +
        '<p class="descripcion">' + clase.subtitulo + '</p>' +
        '<div class="avance-clase">' +
            '<div class="cuenta"><strong>' + hechos + ' de ' + pasos.length + '</strong> pasos</div>' +
            '<ol class="tira-pasos" style="--pasos:' + pasos.length + '">' + segmentos + '</ol>' +
            '<p class="situacion">' + situacion + '</p>' +
        '</div>' +
        '<span class="boton primario">' + boton + '</span>';
    return el;
}

function mostrarPanel() {
    document.title = 'Programación IV · Express';
    document.getElementById('vista-panel').hidden = false;
    const lista = document.getElementById('lista-clases');
    lista.innerHTML = '';
    CLASES.forEach(function (clase) { lista.appendChild(tarjetaDeClase(clase)); });
    if (location.protocol === 'file:') document.getElementById('aviso-archivo').hidden = false;
}

/* --------------------------------------------------------------------------
 * Una clase
 * ------------------------------------------------------------------------ */

function mostrarClase(clase) {
    CLASE_ACTUAL = clase;
    PASOS = CONTENIDO[clase.id];

    document.title = clase.titulo + ' · Programación IV';
    document.getElementById('titulo-de-clase').textContent = clase.titulo;
    document.getElementById('subtitulo-de-clase').textContent = clase.subtitulo;
    document.getElementById('ruta-pedido').value = clase.rutaPedido;
    document.getElementById('caja-cabeceras-pedido').hidden = !clase.conCabeceras;
    document.getElementById('texto-vacio-pedidos').innerHTML = clase.conCabeceras
        ? 'Elegí un método, escribí una ruta y dale a Enviar. Es lo mismo que hace el <code>curl</code> de la consola, ' +
          'pero sin pelear con las comillas. Para una ruta protegida, pegá el token que te devolvió el login en <strong>Cabeceras</strong>.'
        : 'Elegí un método, escribí una ruta y dale a Enviar. Es lo mismo que hace el <code>curl</code> de la consola, ' +
          'pero sin pelear con las comillas.';

    document.getElementById('vista-clase').hidden = false;
    arrancar();
}

/* --------------------------------------------------------------------------
 * Arranque
 * ------------------------------------------------------------------------ */

function claseDeLaRuta() {
    const id = location.hash.replace(/^#\/?/, '');
    return CLASES.find(function (c) { return c.id === id; }) || null;
}

const claseElegida = claseDeLaRuta();
if (claseElegida) mostrarClase(claseElegida); else mostrarPanel();

window.addEventListener('hashchange', function () {
    if (typeof guardarYa === 'function' && CLASE_ACTUAL) guardarYa();
    location.reload();
});
