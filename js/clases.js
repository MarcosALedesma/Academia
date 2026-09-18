/* ============================================================================
 * clases.js — El catálogo: qué clases hay y lo propio de cada una.
 *
 * Para agregar una clase nueva:
 *   1. Escribir sus pasos en contenido/<id>.js  (CONTENIDO.<id> = [ ... ])
 *   2. Poner su motor en js/motor/<motor>.js     (o reutilizar uno existente)
 *   3. Sumar acá un objeto y un <script> en index.html
 *
 * Todo lo demás (editor, consola, panel de pedidos, verificador, panel de
 * inicio) es común y no se toca.
 * ========================================================================== */

/* Lo llenan los archivos de contenido/: CONTENIDO.inicial, CONTENIDO.avanzada. */
const CONTENIDO = {};

const CLASES = [
    {
        id: 'inicial',
        nivel: 'Inicial',
        titulo: 'Servidores con Express',
        subtitulo: 'Levantar un servidor, crear endpoints y armar un CRUD sobre un arreglo',

        clave: 'clase_express_v1',            // dónde se guarda el avance en el navegador
        motor: 'inicial',                     // js/motor/inicial.js

        paquetes: { express: '4.19.2' },      // lo que `npm install` conoce en esta clase
        paqueteJson: { name: 'clase-express', description: 'API de alumnos de la EETP 602' },
        ayudaNpm: 'instala Express',

        rutaPedido: '/api/alumnos',           // ruta inicial del panel de pedidos
        conCabeceras: false,                  // el panel de pedidos no muestra el campo de cabeceras
        ejemploArchivo: 'rutas/materias.js',
        reinicioConBase: false
    },
    {
        id: 'avanzada',
        nivel: 'Avanzada',
        titulo: 'API profesional con Express',
        subtitulo: 'Arquitectura en capas, base de datos, bcrypt, JWT y guards',

        clave: 'clase_express_avanzado_v1',
        motor: 'avanzada',

        paquetes: {
            express: '4.19.2', bcrypt: '5.1.1', jsonwebtoken: '9.0.2',
            dotenv: '16.4.5', sequelize: '6.37.3'
        },
        paqueteJson: { name: 'clase-express-avanzado', description: 'API profesional de la EETP 602' },
        ayudaNpm: 'instala los paquetes de esta clase',

        rutaPedido: '/api/auth/login',
        conCabeceras: true,
        ejemploArchivo: 'routes/tareas.js',
        reinicioConBase: true
    }
];
