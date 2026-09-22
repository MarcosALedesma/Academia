var ResaltadorAngular = (function () {
    'use strict';

    function esc(t) {
        return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function span(clase, texto) { return '<span class="' + clase + '">' + esc(texto) + '</span>'; }

    /* ------------------------------------------------------------------------
     * HTML + sintaxis de Angular
     * ---------------------------------------------------------------------- */

    function esAtributoAngular(nombre) {
        return /^(\[.*\]|\(.*\)|\*.*|#.*)$/.test(nombre);
    }

    function resaltarInterpolaciones(texto) {
        var salida = '', ultimo = 0, m, re = /\{\{[\s\S]*?\}\}/g;
        while ((m = re.exec(texto)) !== null) {
            salida += esc(texto.slice(ultimo, m.index)) + span('c-interp', m[0]);
            ultimo = m.index + m[0].length;
        }
        return salida + esc(texto.slice(ultimo));
    }

    function resaltarHtml(html) {
        var salida = '', ultimo = 0, m;
        var re = /(<!--[\s\S]*?-->)|(<\/?[A-Za-z][\w-]*(?:\s+[^<>]*?)?\s*\/?>)/g;

        while ((m = re.exec(html)) !== null) {
            salida += resaltarInterpolaciones(html.slice(ultimo, m.index));
            if (m[1]) {
                salida += span('c-comentario', m[1]);
            } else {
                salida += resaltarEtiqueta(m[2]);
            }
            ultimo = m.index + m[0].length;
        }
        return salida + resaltarInterpolaciones(html.slice(ultimo));
    }

    function resaltarEtiqueta(tag) {
        var m = /^(<\/?)([A-Za-z][\w-]*)([\s\S]*?)(\/?>)$/.exec(tag);
        if (!m) return esc(tag);

        var salida = span('c-etiqueta', m[1] + m[2]);
        var resto = m[3];
        var ultimo = 0, a;
        var reAtr = /([^\s=<>"']+)(?:(\s*=\s*)("[^"]*"|'[^']*'|[^\s"'<>]+))?/g;

        while ((a = reAtr.exec(resto)) !== null) {
            salida += esc(resto.slice(ultimo, a.index));
            var nombre = a[1];
            salida += span(esAtributoAngular(nombre) ? 'c-angular' : 'c-atributo', nombre);
            if (a[2] !== undefined) {
                salida += esc(a[2]);
                var valor = a[3];
                salida += /^["']/.test(valor)
                    ? span(esAtributoAngular(nombre) ? 'c-angular-valor' : 'c-texto', valor)
                    : span('c-texto', valor);
            }
            ultimo = a.index + a[0].length;
        }
        salida += esc(resto.slice(ultimo));
        return salida + span('c-etiqueta', m[4]);
    }

    /* ------------------------------------------------------------------------
     * TypeScript
     * ---------------------------------------------------------------------- */

    var CLAVES = ('import|export|from|class|interface|type|extends|implements|constructor|' +
                  'const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|' +
                  'new|this|private|public|protected|readonly|static|get|set|void|of|in|' +
                  'try|catch|finally|throw|async|await|default|null|undefined|true|false').split('|');

    var TIPOS = 'string|number|boolean|any|void|never|unknown|object|Array|Promise|Date|Observable|EventEmitter|Subscription'.split('|');

    function pareceHtml(t) { return /<[A-Za-z\/!]/.test(t); }

    function resaltarTypescript(codigo) {
        var re = new RegExp(
            '(\\/\\*[\\s\\S]*?\\*\\/|\\/\\/[^\\n]*)' +
            '|(`(?:[^`\\\\]|\\\\[\\s\\S])*`)' +
            '|(\'(?:[^\'\\\\\\n]|\\\\.)*\'|"(?:[^"\\\\\\n]|\\\\.)*")' +
            '|(\\b\\d+(?:\\.\\d+)?\\b)' +
            '|(@[A-Za-z_]\\w*)' +
            '|\\b(' + CLAVES.join('|') + ')\\b' +
            '|\\b(' + TIPOS.join('|') + ')\\b' +
            '|(\\.[A-Za-z_$][\\w$]*)' +
            '|\\b([A-Za-z_$][\\w$]*)(?=\\s*[(<]?\\s*\\()',
            'g');

        var salida = '', ultimo = 0, m;
        while ((m = re.exec(codigo)) !== null) {
            salida += esc(codigo.slice(ultimo, m.index));
            if (m[1])      salida += span('c-comentario', m[1]);
            else if (m[2]) {
                var interior = m[2].slice(1, -1);
                salida += pareceHtml(interior)
                    ? span('c-texto', '`') + resaltarHtml(interior) + span('c-texto', '`')
                    : span('c-texto', m[2]);
            }
            else if (m[3]) salida += span('c-texto', m[3]);
            else if (m[4]) salida += span('c-numero', m[4]);
            else if (m[5]) salida += span('c-decorador', m[5]);
            else if (m[6]) salida += span('c-clave', m[6]);
            else if (m[7]) salida += span('c-tipo', m[7]);
            else if (m[8]) salida += span('c-propiedad', m[8]);
            else           salida += span('c-llamada', m[9]);
            ultimo = m.index + m[0].length;
        }
        return salida + esc(codigo.slice(ultimo));
    }

    /* ------------------------------------------------------------------------
     * API pública
     * ---------------------------------------------------------------------- */

    function lenguajeDe(nombre) {
        if (/\.(ts|js)$/.test(nombre)) return 'ts';
        if (/\.html?$/.test(nombre)) return 'html';
        if (/\.css$/.test(nombre)) return 'css';
        if (/\.json$/.test(nombre)) return 'json';
        return 'texto';
    }

    function resaltarCss(css) {
        var re = /(\/\*[\s\S]*?\*\/)|([.#]?[A-Za-z_:][\w-]*)(\s*\{)|([A-Za-z-]+)(\s*:)|(#[0-9a-fA-F]{3,8}\b|-?\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw)?)/g;
        var salida = '', ultimo = 0, m;
        while ((m = re.exec(css)) !== null) {
            salida += esc(css.slice(ultimo, m.index));
            if (m[1])      salida += span('c-comentario', m[1]);
            else if (m[2]) salida += span('c-llamada', m[2]) + esc(m[3]);
            else if (m[4]) salida += span('c-propiedad', m[4]) + esc(m[5]);
            else           salida += span('c-numero', m[6]);
            ultimo = m.index + m[0].length;
        }
        return salida + esc(css.slice(ultimo));
    }

    function resaltar(codigo, lenguaje) {
        var l = lenguaje || 'auto';
        if (l === 'auto') {
            l = /^\s*(<|<!--)/.test(codigo) ? 'html' : 'ts';
        }
        var pintado = l === 'html' ? resaltarHtml(codigo)
                    : l === 'css'  ? resaltarCss(codigo)
                    : l === 'json' || l === 'ts' ? resaltarTypescript(codigo)
                    : esc(codigo);
        return pintado + '\n';
    }

    return { resaltar: resaltar, lenguajeDe: lenguajeDe, esc: esc };
})();
