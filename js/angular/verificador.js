/* ============================================================================
 * verificador.js — El banco de pruebas de la clase de Angular.
 *
 * Recibe los chequeos de un paso (dato puro, ver contenido/angular-inicial.js)
 * y los corre EN ORDEN contra la vista previa. Devuelve siempre un objeto; no
 * lanza. Mismo contrato que verificar() en las clases de Express.
 *
 * Dos cosas que este verificador NO hace, a propósito:
 *   - No se fía de `ok`. Angular puede arrancar sin excepción y dejar la pantalla
 *     rota (un NG0304 no lanza nada). Por eso hay chequeos de `sinErrores` y de DOM.
 *   - No chequea tipos. Vista.transpileModule borra los tipos sin comprobarlos,
 *     como se explica en la teoría del paso 1. Un `let x: number = 'a'` no falla acá.
 *
 * `vista` es el objeto de vista.js:  { ejecutar(archivos, entrada), inspeccionar(consulta) }
 * ========================================================================== */

var VerificadorAngular = (function () {

    function fallo(titulo, detalle, chequeo, extra) {
        var r = { ok: false, titulo: titulo, detalle: detalle || '' };
        if (chequeo && chequeo.pista) r.pista = chequeo.pista;
        if (extra) Object.keys(extra).forEach(function (k) { r[k] = extra[k]; });
        return r;
    }

    /** Los errores de Angular a veces llegan duplicados (segunda pasada del modo desarrollo). */
    function sinDuplicados(lista) {
        var vistos = {};
        return (lista || []).filter(function (e) {
            var clave = e.slice(0, 200);
            if (vistos[clave]) return false;
            vistos[clave] = true;
            return true;
        });
    }

    /** Un error de Angular en lenguaje del alumno. Devuelve { codigo, titulo, pista } o null. */
    function traducirError(texto) {
        var m = /(NG0\d+)/.exec(texto);
        var codigo = m ? m[1] : null;

        if (codigo === 'NG0304') {
            var el = /'([^']+)' is not a known element/.exec(texto);
            var etiqueta = el ? el[1] : 'la etiqueta';
            return { codigo: codigo,
                     titulo: 'Angular no conoce <' + etiqueta + '>',
                     pista: 'Tres causas posibles: (1) el componente no está en declarations de app.module.ts, ' +
                            '(2) es standalone y falta ponerlo en el imports del componente que lo usa, ' +
                            '(3) el selector está mal escrito (¿le falta el prefijo app-?).' };
        }
        if (codigo === 'NG0303') {
            var pr = /Can't bind to '([^']+)'/.exec(texto);
            var prop = pr ? pr[1] : 'esa propiedad';
            var pista = 'Angular no encontró la propiedad ' + prop + ' en ese elemento. ';
            if (/ngforOf/.test(texto)) {
                pista = 'Escribiste *ngfor con la f minúscula. Es *ngFor, con F mayúscula. ' +
                        'Angular no lo reconoce como directiva y lo trata como un atributo cualquiera.';
            } else if (/ngForOf|ngIf/.test(texto)) {
                pista = 'Falta importar la directiva. Con módulos, BrowserModule ya la trae; si el componente es ' +
                        'standalone, agregá NgFor / NgIf en el array imports del componente y en el import de arriba.';
            } else if (/ngModel/.test(texto)) {
                pista = 'ngModel necesita FormsModule. Importalo en el módulo (o en el imports del componente, si es standalone).';
            } else {
                pista += 'Si es un @Input de un componente propio, revisá que esté declarado con @Input() en el hijo.';
            }
            return { codigo: codigo, titulo: 'Angular no reconoce ' + prop, pista: pista };
        }
        if (codigo === 'NG0301' || /No provider for/.test(texto)) {
            return { codigo: codigo || 'NG0201', titulo: 'Falta un proveedor',
                     pista: 'Estás inyectando algo que Angular no sabe crear. Si es un servicio, tiene que tener @Injectable({ providedIn: \'root\' }).' };
        }
        if (/Cannot read properties of (undefined|null)/.test(texto)) {
            var pp = /reading '([^']+)'/.exec(texto);
            return { codigo: null, titulo: 'Un dato todavía no existe',
                     pista: 'El template intentó leer ' + (pp ? '.' + pp[1] : 'una propiedad') +
                            ' de algo que vale undefined. Revisá que la propiedad exista en la clase y esté inicializada.' };
        }
        if (/is not a function/.test(texto)) {
            return { codigo: null, titulo: 'Algo no es una función',
                     pista: 'Estás llamando con () algo que no es un método. En un (click) se llama al método con paréntesis; en una interpolación, un get se usa SIN paréntesis.' };
        }
        return { codigo: codigo, titulo: 'Angular protestó', pista: null };
    }

    /* ---------------------------------------------------------------------- */

    function chequeoFuente(c, archivos, chequeoCompleto) {
        var nombre = c.archivo || 'app/app.component.ts';
        var texto = archivos[nombre];
        if (texto === undefined) {
            return fallo('Falta el archivo ' + nombre, 'Todavía no existe en el proyecto.', chequeoCompleto);
        }
        var debe = c.debeTener || [];
        for (var i = 0; i < debe.length; i++) {
            if (!new RegExp(debe[i].re).test(texto)) {
                return fallo('Falta algo en ' + nombre, debe[i].que, chequeoCompleto);
            }
        }
        var noDebe = c.noDebeTener || [];
        for (var j = 0; j < noDebe.length; j++) {
            if (new RegExp(noDebe[j].re).test(texto)) {
                return fallo('Hay algo de más en ' + nombre, noDebe[j].que, chequeoCompleto);
            }
        }
        return null;
    }

    function consultaDom(vista, spec) {
        if (spec.contar) return vista.inspeccionar({ contar: spec.contar.selector });
        if (spec.textos) return vista.inspeccionar({ textos: spec.textos.selector });
        if (spec.existe) return vista.inspeccionar({ tiene: spec.existe.selector });
        if (spec.noExiste) return vista.inspeccionar({ tiene: spec.noExiste.selector });
        if (spec.atributo) return vista.inspeccionar({ atributo: [spec.atributo.selector, spec.atributo.nombre] });
        if (spec.propiedad) return vista.inspeccionar({ propiedad: [spec.propiedad.selector, spec.propiedad.nombre] });
        if (spec.enfocado) return vista.inspeccionar({ enfocado: spec.enfocado.selector });
        return Promise.resolve({ error: 'Chequeo de DOM desconocido' });
    }

    function igualLista(a, b) {
        if (a.length !== b.length) return false;
        for (var i = 0; i < a.length; i++) if (String(a[i]) !== String(b[i])) return false;
        return true;
    }

    function mostrar(v) { try { return JSON.stringify(v); } catch (e) { return String(v); } }

    function chequeoDom(c, vista) {
        var spec = c.dom;
        return consultaDom(vista, spec).then(function (r) {
            if (r.error) return fallo('Falló una comprobación', r.error, c);

            if (spec.contar) {
                var n = r.cantidad, k = spec.contar;
                if (k.es !== undefined && n !== k.es) {
                    return fallo('Hay ' + n + ' de "' + k.selector + '" y tendrían que ser ' + k.es + '.', '', c);
                }
                if (k.min !== undefined && n < k.min) {
                    return fallo('Hay ' + n + ' de "' + k.selector + '" y tendrían que ser al menos ' + k.min + '.', '', c);
                }
                if (k.max !== undefined && n > k.max) {
                    return fallo('Hay ' + n + ' de "' + k.selector + '" y tendrían que ser ' + k.max + ' como máximo.', '', c);
                }
            }
            if (spec.textos) {
                var t = spec.textos;
                if (t.igual && !igualLista(r.textos, t.igual)) {
                    return fallo('El texto en pantalla no es el esperado',
                                 'En "' + t.selector + '" se ve ' + mostrar(r.textos) + ' y tendría que verse ' + mostrar(t.igual) + '.', c);
                }
                if (t.contiene !== undefined && !r.textos.some(function (x) { return x.indexOf(t.contiene) !== -1; })) {
                    return fallo('Falta un texto en pantalla',
                                 'En "' + t.selector + '" tendría que aparecer "' + t.contiene + '". Se ve ' + mostrar(r.textos) + '.', c);
                }
            }
            if (spec.existe && !r.existe) {
                return fallo('Falta un elemento en pantalla', 'No existe nada que coincida con "' + spec.existe.selector + '".', c);
            }
            if (spec.noExiste && r.existe) {
                return fallo('Hay un elemento de más en pantalla', 'No debería existir nada que coincida con "' + spec.noExiste.selector + '".', c);
            }
            if (spec.atributo) {
                if (!r.existe) return fallo('Falta un elemento en pantalla', 'No existe "' + spec.atributo.selector + '".', c);
                if (String(r.valor) !== String(spec.atributo.igual)) {
                    return fallo('Un atributo no tiene el valor esperado',
                                 spec.atributo.nombre + ' vale ' + mostrar(r.valor) + ' y tendría que valer ' + mostrar(spec.atributo.igual) + '.', c);
                }
            }
            if (spec.propiedad) {
                if (!r.existe) return fallo('Falta un elemento en pantalla', 'No existe "' + spec.propiedad.selector + '".', c);
                if (r.valor !== spec.propiedad.igual) {
                    return fallo('Una propiedad no tiene el valor esperado',
                                 spec.propiedad.nombre + ' vale ' + mostrar(r.valor) + ' y tendría que valer ' + mostrar(spec.propiedad.igual) + '.', c);
                }
            }
            if (spec.enfocado) {
                if (!r.existe) return fallo('Falta un elemento en pantalla', 'No existe "' + spec.enfocado.selector + '".', c);
                if (!r.enfocado) {
                    return fallo('El foco no está donde tiene que estar',
                                 '"' + spec.enfocado.selector + '" tendría que tener el foco del teclado y no lo tiene.', c);
                }
            }
            return null;
        });
    }

    /* ---------------------------------------------------------------------- */

    /**
     * archivos: el proyecto del alumno.  chequeos: los del paso.
     * Devuelve una Promise que SIEMPRE resuelve con { ok:true } o el objeto de fallo.
     */
    function verificar(vista, archivos, chequeos, entrada) {
        var i = 0;
        var resultadoEjecucion = null;

        /* Los chequeos de texto no necesitan arrancar nada: se resuelven primero.
           Un archivo mal escrito se le dice al alumno antes de esperar a Angular. */
        for (var a = 0; a < chequeos.length; a++) {
            if (!chequeos[a].fuente) continue;
            var f = chequeoFuente(chequeos[a].fuente, archivos, chequeos[a]);
            if (f) return Promise.resolve(f);
        }

        return vista.ejecutar(archivos, entrada).then(function (r) {
            resultadoEjecucion = r;

            if (!r.ok) {
                /* El motor devuelve el mensaje real en r.error; se sube a `detalle`
                   para que el alumno lo lea sin abrir nada. */
                var det = r.detalle || '';
                var pista = null;
                if (r.error) {
                    var donde = r.error.archivo ? ' (en ' + r.error.archivo + (r.error.linea ? ', línea ' + r.error.linea : '') + ')' : '';
                    det = r.error.mensaje + donde;
                    if (r.error.nombre === 'ModuleNotFound') {
                        pista = 'La ruta del import no coincide con ningún archivo. ./ es la carpeta actual y ../ sube una carpeta. ' +
                                'Revisá cuántos niveles hay entre el archivo que importa y el que querés importar.';
                    } else if (r.error.nombre === 'SyntaxError') {
                        pista = 'Falta o sobra algún carácter: una llave, un paréntesis, una coma o una comilla. Mirá la línea que dice el mensaje y la anterior.';
                    } else if (/NG0907/.test(r.error.mensaje)) {
                        pista = 'Un componente sin standalone: true tiene que declararse en un módulo. O agregá standalone: true, o creá app/app.module.ts.';
                    }
                }
                return fallo(r.titulo || 'La aplicación no arrancó', det, null,
                             { error: r.error || null, fase: r.fase, pista: pista });
            }

            function siguiente() {
                if (i >= chequeos.length) return Promise.resolve({ ok: true });
                var c = chequeos[i++];

                if (c.fuente) return siguiente();          // ya resuelto arriba

                if (c.arranca) return siguiente();         // ya sabemos que arrancó

                if (c.sinErrores) {
                    var errs = sinDuplicados(resultadoEjecucion.errores);
                    if (errs.length) {
                        var tr = traducirError(errs[0]);
                        return Promise.resolve(fallo(tr.titulo, errs[0].split('\n')[0], c,
                                                     { pista: tr.pista || c.pista, errorAngular: errs[0], codigo: tr.codigo }));
                    }
                    return siguiente();
                }

                if (c.errorEsperado) {
                    var buscados = sinDuplicados(resultadoEjecucion.errores);
                    var hay = buscados.some(function (e) { return e.indexOf(c.errorEsperado) !== -1; });
                    if (!hay) return Promise.resolve(fallo('No apareció el error ' + c.errorEsperado, '', c));
                    return siguiente();
                }

                if (c.accion) {
                    var consulta = c.accion.clic ? { clic: c.accion.clic } : { escribir: c.accion.escribir };
                    return vista.inspeccionar(consulta).then(function (rr) {
                        if (!rr.hecho) {
                            return fallo('No encuentro el elemento para interactuar',
                                         'No existe "' + (c.accion.clic || c.accion.escribir[0]) + '" en la pantalla.', c);
                        }
                        return siguiente();
                    });
                }

                if (c.dom) {
                    return chequeoDom(c, vista).then(function (f2) {
                        return f2 || siguiente();
                    });
                }
                return siguiente();
            }
            return siguiente();
        });
    }

    return { verificar: verificar, traducirError: traducirError, sinDuplicados: sinDuplicados };
})();
