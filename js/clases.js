const CONTENIDO = {};

const CLASES = [
    {
        id: 'inicial',
        color: 'verde',
        nivel: 'Inicial',
        titulo: 'Servidores con Express',
        subtitulo: 'Levantar un servidor, crear endpoints y armar un CRUD sobre un arreglo',

        clave: 'clase_express_v1',
        motor: 'inicial',

        paquetes: { express: '4.19.2' },
        paqueteJson: { name: 'clase-express', description: 'API de alumnos de la EETP 602' },
        ayudaNpm: 'instala Express',

        rutaPedido: '/api/alumnos',
        conCabeceras: false,
        ejemploArchivo: 'rutas/materias.js',
        reinicioConBase: false
    },
    {
        id: 'avanzada',
        color: 'verde',
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
    },
    {
        id: 'angular',
        color: 'violeta',
        nivel: 'Inicial',
        titulo: 'Fundamentos de Angular',
        subtitulo: 'Componentes, bindings, directivas y comunicación entre componentes',

        clave: 'clase_angular_v1',
        motor: 'angular',
        tipo: 'angular'
    },
    {
        id: 'angular2',
        color: 'violeta',
        nivel: 'Avanzada',
        titulo: 'Angular II: servicios y RxJS',
        subtitulo: 'Interfaces, servicios, Observables, RxJS y estado compartido',

        clave: 'clase_angular2_v1',
        motor: 'angular',
        tipo: 'angular'
    },
    {
        id: 'practica',
        color: 'violeta',
        nivel: 'Práctica',
        titulo: 'Práctica de Angular',
        subtitulo: 'Ejercicios extra: bindings, formularios, proyección, ContentChild, pipes y control flow',

        clave: 'clase_practica_v1',
        motor: 'angular',
        tipo: 'angular'
    },
    {
        id: 'ministore',
        color: 'violeta',
        nivel: 'Avanzada',
        titulo: 'MiniStore: consumir una API',
        subtitulo: 'HttpClient, interfaces, service, signals y componentes con datos reales',

        clave: 'clase_ministore_v1',
        motor: 'angular',
        tipo: 'angular',
        api: true
    },
    {
        id: 'ministore2',
        color: 'violeta',
        nivel: 'Avanzada',
        titulo: 'MiniStore II: paginación, filtros y estados',
        subtitulo: 'limit y skip, componente de paginación, búsqueda, categorías y estados de carga y error',

        clave: 'clase_ministore2_v1',
        motor: 'angular',
        tipo: 'angular',
        api: true
    },
    {
        id: 'bdd',
        color: 'azul',
        nivel: 'Qsy',
        titulo: 'Bases de datos',
        subtitulo: 'Se esta codeando.',

        enDesarrollo: true
    }
];
