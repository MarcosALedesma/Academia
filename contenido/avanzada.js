CONTENIDO.avanzada = [

{
    id: 'p01',
    titulo: 'De un arreglo a una API profesional',
    minutos: 10,

    teoria: [
        { h: 'De dónde venimos' },
        { p: 'En la clase de Express armaron un CRUD entero sobre un **arreglo en memoria**. Estuvo bien para aprender el framework: rutas, `req`/`res`, códigos de estado, middleware. Pero un arreglo en un archivo de JavaScript tiene dos problemas que en un proyecto real no se pueden ignorar.' },
        { numerada: [
            'Se borra cada vez que el proceso se reinicia. Ningún negocio puede perder sus datos porque el servidor se cayó.',
            'Cualquiera que le pegue a la API puede leer, crear o borrar lo que quiera. No hay noción de "quién sos" ni de "qué te dejo hacer".'
        ] },
        { p: 'Esta clase resuelve esos dos problemas: **una base de datos** en vez de un arreglo, y **autenticación** en vez de acceso libre. "Autenticarse" es, ni más ni menos, demostrarle al servidor quién sos —típicamente con un email y una contraseña—. Una vez que lo demostraste, el servidor te da un **token**: una credencial temporal, como una pulserita de un evento, que mostrás en cada pedido siguiente para no tener que mandar la contraseña de nuevo cada vez. Ninguno de los dos términos hace falta entenderlos del todo hoy —se arman paso a paso, del 6 al 9—; alcanza con la idea general para seguir el resto de este paso.' },

        { h: 'La arquitectura en capas' },
        { p: 'Hasta ahora todo el código de un paso vivía en `app.js`. A partir de acá el proyecto se separa en carpetas, cada una con un trabajo bien definido. Es el patrón que van a encontrar en cualquier proyecto profesional de Node, tenga el nombre que tenga.' },
        { tabla: {
            cabeceras: ['Carpeta', 'Qué guarda', 'Ejemplo'],
            filas: [
                ['`routes/`', 'Qué URL y qué método dispara qué función. Nada de lógica.', '`router.post(\'/registro\', authController.registrar)`'],
                ['`controllers/`', 'La lógica de cada acción: qué hacer con el pedido.', '`async function registrar(req, res) { ... }`'],
                ['`models/`', 'La forma de los datos y cómo se guardan.', '`sequelize.define(\'Usuario\', { ... })`'],
                ['`middlewares/`', 'Funciones que se paran antes de un controller: el guard de esta clase vive acá.', '`verificarToken`'],
                ['`config/`', 'Cómo se conecta a cosas externas.', '`config/db.js`']
            ]
        } },
        { p: 'En un dibujo, así viaja un pedido de arriba a abajo hasta convertirse en una respuesta:' },
        { diagrama:
"      Pedido HTTP  (por ejemplo: POST /api/auth/registro)\n" +
"          │\n" +
"          ▼\n" +
"   ┌──────────────┐   ¿a qué URL y con qué método vino?\n" +
"   │    routes    │   decide a qué controller le toca\n" +
"   └──────┬───────┘   (routes/auth.routes.js)\n" +
"          │\n" +
"          ▼\n" +
"   ┌──────────────┐   la lógica: qué hacer con este pedido\n" +
"   │  controllers │   lee req, decide, arma la respuesta\n" +
"   └──────┬───────┘   (controllers/auth.controller.js)\n" +
"          │\n" +
"          ▼\n" +
"   ┌──────────────┐   ¿cómo son los datos, y cómo se guardan?\n" +
"   │    models    │   habla con la base de datos\n" +
"   └──────┬───────┘   (models/Usuario.js)\n" +
"          │\n" +
"          ▼\n" +
"      Respuesta JSON" },
        { p: 'La regla de oro: **una ruta no sabe cómo se hace algo, sólo sabe a quién avisarle.** Esa separación es la que permite que un archivo de 300 líneas se vuelva diez archivos de 30, cada uno leíble solo.' },
        { clave: 'Un `router` conecta URL con función. Un `controller` es esa función. Un `model` describe los datos. Nada de eso cambia lo que ya saben de Express — `req`, `res`, `next`, `express.Router()` siguen siendo los mismos — sólo cambia **dónde vive cada cosa**.' },

        { h: 'El mapa de esta clase, de un vistazo' },
        { p: 'Antes de entrar paso a paso, así se ven de punta a punta las tres conversaciones que va a tener el cliente con el servidor. No hace falta entender cada palabra todavía —`hashear`, `token`, `guard`— van a aparecer explicadas, una por una, en los pasos que siguen. Esto es sólo el mapa.' },
        { diagrama:
"REGISTRARSE (paso 5 y 6)\n\n" +
"  cliente                                servidor\n" +
"    │   POST /api/auth/registro              │\n" +
"    │   { nombre, email, password }          │\n" +
"    ├────────────────────────────────────────▶\n" +
"    │              hashea la contraseña (bcrypt)\n" +
"    │              y guarda { email, hash } en la base\n" +
"    │◀────────────────────────────────────────┤\n" +
"    │        { id, nombre, email }            │" },
        { diagrama:
"LOGUEARSE (paso 7 y 8)\n\n" +
"  cliente                                servidor\n" +
"    │   POST /api/auth/login                 │\n" +
"    │   { email, password }                  │\n" +
"    ├────────────────────────────────────────▶\n" +
"    │              busca el usuario por email\n" +
"    │              compara la contraseña con el hash\n" +
"    │              si coincide: firma un TOKEN\n" +
"    │◀────────────────────────────────────────┤\n" +
"    │        { token }                        │" },
        { diagrama:
"HACER UN PEDIDO PROTEGIDO (paso 9)\n\n" +
"  cliente                                servidor\n" +
"    │   GET /api/tareas                      │\n" +
"    │   Authorization: Bearer <token>        │\n" +
"    ├────────────────────────────────────────▶\n" +
"    │              el GUARD revisa el token\n" +
"    │              ¿es válido?  sí → sigue al controller\n" +
"    │                           no → 401, y ahí se corta\n" +
"    │◀────────────────────────────────────────┤\n" +
"    │        200 + los datos   ó   401         │" },
        { clave: 'El token reemplaza a la contraseña en TODOS los pedidos después del login. La contraseña se manda una sola vez, en el login; de ahí en más, el token es la credencial.' },

        { h: 'Lo que se instala' },
        { p: 'Esta clase usa cinco paquetes de npm. Los cinco se instalan igual que instalaron Express: `npm install <paquete>`.' },
        { tabla: {
            cabeceras: ['Paquete', 'Para qué'],
            filas: [
                ['`express`', 'El framework, como siempre.'],
                ['`bcrypt`', 'Hashear contraseñas —transformarlas en algo que no se puede leer ni deshacer— para que nunca queden guardadas en texto plano. Se explica en el paso 6.'],
                ['`jsonwebtoken`', 'Emitir y verificar el token que prueba que alguien está logueado. Se explica en el paso 8.'],
                ['`dotenv`', 'Leer configuración y secretos desde un archivo `.env`, afuera del código.'],
                ['`sequelize`', 'Hablar con una base de datos con JavaScript en vez de SQL a mano.']
            ]
        } },
        { nota: 'Igual que con `import`/`export`, esta clase asume que ya hicieron la clase de Express: `req`/`res`, middleware, `next()`, `express.Router()`, códigos 200/201/204/400/404 se dan por sabidos y no se vuelven a explicar desde cero.' }
    ],

    consigna: [
        { p: 'En la consola, creá el proyecto e instalá los cinco paquetes:' },
        { terminal: 'npm init -y\nnpm install express bcrypt jsonwebtoken dotenv sequelize' },
        { p: 'Después probá `cat package.json` y fijate que los cinco quedaron anotados en `dependencies`.' }
    ],

    consolaSugerida: ['npm init -y', 'npm install express bcrypt jsonwebtoken dotenv sequelize', 'cat package.json'],

    chequeos: [
        { entorno: { archivoExiste: 'package.json' },
          pista: 'Te falta crear el proyecto: escribí  npm init -y  en la consola.' },
        { entorno: { instalado: 'express' }, pista: 'Instalá Express:  npm install express' },
        { entorno: { instalado: 'bcrypt' }, pista: 'Instalá bcrypt:  npm install bcrypt' },
        { entorno: { instalado: 'jsonwebtoken' }, pista: 'Instalá jsonwebtoken:  npm install jsonwebtoken' },
        { entorno: { instalado: 'dotenv' }, pista: 'Instalá dotenv:  npm install dotenv' },
        { entorno: { instalado: 'sequelize' }, pista: 'Instalá sequelize:  npm install sequelize' }
    ]
},

{
    id: 'p02',
    titulo: 'Variables de entorno con dotenv',
    minutos: 12,

    teoria: [
        { h: 'Qué es un repositorio, en criollo' },
        { p: 'Un **repositorio** (o "repo") es la carpeta del proyecto, subida a un servicio como GitHub, con **todo su historial de cambios guardado** — cada versión de cada archivo, desde el primer día. Sirve para que un equipo trabaje sobre el mismo código sin mandarse archivos por mail, y para poder volver atrás si algo se rompe. En esta clase no van a usar Git ni GitHub —no entra en el alcance—, pero el hábito que sigue vale igual el día que sí lo usen.' },

        { h: 'Por qué un secreto no va en el código' },
        { p: 'En un rato vamos a necesitar una clave para firmar tokens, y más adelante, los datos para conectarnos a una base. Ninguna de esas dos cosas puede estar escrita adentro de `app.js`: ese archivo es justamente el que se sube al repositorio, y un repositorio lo puede ver cualquiera con acceso a él — incluido, algún día, todo internet si el repositorio es público. Y como el repositorio **guarda el historial completo**, borrar el secreto en un cambio posterior no alcanza: sigue estando ahí, en la versión vieja, para siempre.' },
        { p: 'La solución es separar **el código** (que es igual en todas partes) de **la configuración** (que cambia según dónde corra: en tu máquina, en la del compañero, en un servidor de verdad). La configuración vive en un archivo aparte, `.env`, que **nunca se sube al repositorio**.' },

        { h: 'El archivo .env' },
        { p: 'Es texto plano, una variable por línea, sin comillas ni punto y coma:' },
        { codigo: 'PORT=3000\nJWT_SECRET=una-frase-larga-dificil-de-adivinar', archivo: '.env' },
        { p: 'El paquete `dotenv` lee ese archivo y carga cada línea en `process.env`, el objeto global de Node donde vive toda la configuración del sistema. Se usa con una sola línea, **la primera de todo el programa**:' },
        { codigo: 'require(\'dotenv\').config();', archivo: 'app.js' },
        { nota: 'Tiene que ser la primera línea. Si algún archivo lee `process.env.JWT_SECRET` antes de que `dotenv.config()` haya corrido, se encuentra con `undefined`. Es un bug clásico: todo funciona menos una variable, y nadie entiende por qué hasta que se fijan en el orden.' },

        { h: 'Usarlo' },
        { p: 'Una vez cargado, cualquier archivo del proyecto puede leer `process.env.NOMBRE`. Por ejemplo, el puerto ya no queda fijo en el código:' },
        { codigo: 'app.listen(process.env.PORT, () => {\n  console.log(\'Servidor escuchando en el puerto \' + process.env.PORT);\n});' },
        { clave: '`.env` va en el `.gitignore`, junto a `node_modules`. Lo que sí se sube es un `.env.example` con los nombres de las variables y valores de ejemplo, para que cualquiera sepa qué configurar sin ver los secretos reales. En esta clase no hay repositorio de verdad, pero la costumbre es la misma desde el primer proyecto.' }
    ],

    consigna: [
        { p: 'Ya te dejamos un `.env` con un `PORT` y un `JWT_SECRET` de arranque (podés cambiar el secreto si querés, no hace falta). En `app.js`, escribí el servidor mínimo: cargá dotenv **primero**, traé Express, creá la app, y quedate escuchando en `process.env.PORT`, imprimiendo `Servidor escuchando en el puerto <el puerto>`.' },
        { terminal: 'node app.js\ncurl http://localhost:3000/' },
        { p: 'Vas a ver el 404 de siempre: hay servidor, todavía no hay rutas.' }
    ],

    semilla: {
        '.env': 'PORT=3000\nJWT_SECRET=cambiame-por-un-secreto-largo-y-dificil-de-adivinar\n',
        'app.js': '// app.js — nuestra API\n\n'
    },

    consolaSugerida: ['node app.js', 'curl http://localhost:3000/', 'cat .env'],
    probar: [{ metodo: 'GET', ruta: '/' }],

    solucion: {
        '.env': 'PORT=3000\nJWT_SECRET=cambiame-por-un-secreto-largo-y-dificil-de-adivinar\n',
        'app.js': "require('dotenv').config();\nconst express = require('express');\n\nconst app = express();\n\napp.listen(process.env.PORT, () => {\n  console.log('Servidor escuchando en el puerto ' + process.env.PORT);\n});\n"
    },

    chequeos: [
        { fuente: { debeTener: [
            { re: "require\\(\\s*['\"]dotenv['\"]\\s*\\)", que: 'Falta traer dotenv con require(\'dotenv\').' },
            { re: '\\.config\\(\\s*\\)', que: 'Falta llamar a .config() sobre lo que devuelve require(\'dotenv\'): require(\'dotenv\').config();' },
            { re: "require\\(\\s*['\"]express['\"]\\s*\\)", que: 'Falta traer Express.' },
            { re: 'app\\.listen\\(', que: 'Falta app.listen(process.env.PORT, ...).' }
        ] } },
        { fuente: { archivo: '.env', debeTener: [
            { re: 'PORT\\s*=', que: 'El .env necesita una línea PORT=...' },
            { re: 'JWT_SECRET\\s*=', que: 'El .env necesita una línea JWT_SECRET=...' }
        ] } },
        { arranque: { escuchando: true, consolaContiene: 'Servidor escuchando en el puerto' },
          pista: 'Acordate del mensaje exacto: \'Servidor escuchando en el puerto \' + process.env.PORT' }
    ]
},

{
    id: 'p03',
    titulo: 'Conectar la base: Sequelize y async/await',
    minutos: 14,

    teoria: [
        { h: 'Por qué esto no puede ser sincrónico' },
        { p: 'Todo lo que hicieron en la clase de Express pasaba **en el mismo instante**: llega el pedido, se busca en el arreglo, se responde. Conectarse a una base de datos es distinto: hay que esperar una respuesta que no está lista al instante — puede tardar unos milisegundos, o (si la base está en otra ciudad) unos cuantos más.' },
        { diagrama:
"SINCRÓNICO — cada línea tiene que terminar para que arranque la siguiente\n\n" +
"  línea 1  ▶▶▶  línea 2  ▶▶▶  línea 3  ▶▶▶  línea 4\n" +
"  (ya)          (ya)          (ya)          (ya)\n\n\n" +
"CON UNA ESPERA ADENTRO — como conectarse a una base\n\n" +
"  línea 1  ▶▶▶  línea 2 = conectarABase()\n" +
"                            │\n" +
"                (acá NO hay nada esperando:\n" +
"                 el resultado todavía no existe)\n" +
"                            │\n" +
"                            ▼   (algún milisegundo después)\n" +
"                    la conexión está lista\n" +
"                            │\n" +
"                            ▼\n" +
"                línea 3  ▶▶▶  línea 4" },

        { h: 'Qué es una promesa' },
        { p: 'Una **promesa** (`Promise`) es un objeto que representa **un dato que todavía no está, pero va a estar** —o va a fallar en el intento—. Es la forma que tiene JavaScript de decir "acá tenés un recibo; cuando el dato esté listo, te aviso". Es la misma idea que un número de pedido en una casa de comidas: no es la comida, pero es lo que después SE CONVIERTE en la comida (o en un "se nos acabó", si algo salió mal).' },
        { p: 'Una promesa está siempre en uno de tres estados:' },
        { tabla: {
            cabeceras: ['Estado', 'Qué significa'],
            filas: [
                ['pendiente', 'Todavía se está resolviendo. El dato no está listo.'],
                ['resuelta (fulfilled)', 'Terminó bien. Ya existe un resultado.'],
                ['rechazada (rejected)', 'Terminó mal. Hay un error en vez de un resultado.']
            ]
        } },
        { p: 'Se puede trabajar con una promesa de dos formas. La primera, con `.then()`/`.catch()` — "cuando termine, hacé esto; si falla, hacé esto otro":' },
        { codigo: 'algoQueTarda()\n  .then((resultado) => console.log(resultado))\n  .catch((error) => console.error(error));' },
        { p: 'La segunda es `async`/`await`, y es la que va a usar el resto de esta clase: una función marcada `async` puede poner `await` adelante de una promesa, y el código se lee de arriba a abajo como si fuera sincrónico — aunque por dentro no lo sea. Es exactamente el mismo mecanismo de arriba, con otra letra:' },
        { codigo: 'async function ejemplo() {\n  const resultado = await algoQueTarda();\n  console.log(resultado);   // esto espera a que algoQueTarda() termine\n}' },
        { nota: 'Si te olvidás el `await`, `resultado` no es el dato: es la promesa misma, un objeto `Promise { <pending> }` — el "recibo", no la comida. Es uno de los bugs más comunes de esta clase: el código no explota, simplemente el dato que esperabas no está.' },
        { clave: '`async` y `await` no reemplazan a las promesas: son una forma más prolija de escribir el mismo `.then()`. Cualquier función `async` devuelve, ella misma, una promesa — por eso `await` sólo tiene sentido adentro de una función `async`.' },

        { h: 'Sequelize' },
        { p: '**Sequelize** es un ORM: un traductor entre objetos de JavaScript y tablas de una base de datos relacional (MySQL, PostgreSQL, SQLite...). En vez de escribir `SELECT * FROM usuarios WHERE email = ...`, se escribe `Usuario.findOne({ where: { email } })`. El paso que sigue arma el primer modelo; este paso arma sólo la conexión.' },
        { codigo: "const { Sequelize } = require('sequelize');\n\nconst sequelize = new Sequelize(process.env.DB_NAME);\n\nmodule.exports = sequelize;", archivo: 'config/db.js' },
        { p: 'Fijate que `config/db.js` no arranca nada por su cuenta: sólo **crea y exporta** la conexión. Quien la necesite —`app.js`, un modelo— la importa con `require(\'./config/db\')`.' },

        { h: 'Probar la conexión' },
        { p: '`sequelize.authenticate()` devuelve una promesa: se resuelve si la base contesta, se rechaza si no. Es lo primero que tiene que pasar antes de levantar el servidor — no tiene sentido aceptar pedidos si no hay dónde guardar nada.' },
        { codigo: "sequelize.authenticate()\n  .then(() => {\n    console.log('Conexión a la base de datos OK');\n    app.listen(process.env.PORT, () => { ... });\n  })\n  .catch((error) => {\n    console.error('No se pudo conectar a la base:', error.message);\n  });" },
        { clave: 'El `.catch()` no es opcional. Si una promesa se rechaza y nadie la atajó, en Node de verdad el proceso entero puede caerse. Cada `.then()` que abre una conexión, un archivo o un pedido de red necesita su `.catch()` en algún punto de la cadena.' }
    ],

    consigna: [
        { p: 'Agregá `DB_NAME=api_tareas` al `.env`. Creá `config/db.js` con la conexión de Sequelize de arriba. En `app.js`, importala, llamá a `sequelize.authenticate()`, y recién dentro del `.then()` arrancá el servidor con `app.listen`. Agregá un `.catch()` que imprima el error.' },
        { terminal: 'node app.js' },
        { p: 'Tiene que verse en la consola, en este orden: primero \'Conexión a la base de datos OK\', después \'Servidor escuchando en el puerto 3000\'.' }
    ],

    consolaSugerida: ['node app.js'],

    solucion: {
        '.env': 'PORT=3000\nJWT_SECRET=cambiame-por-un-secreto-largo-y-dificil-de-adivinar\nDB_NAME=api_tareas\n',
        'config/db.js': "const { Sequelize } = require('sequelize');\n\nconst sequelize = new Sequelize(process.env.DB_NAME);\n\nmodule.exports = sequelize;\n",
        'app.js': "require('dotenv').config();\nconst express = require('express');\nconst sequelize = require('./config/db');\n\nconst app = express();\n\nsequelize.authenticate()\n  .then(() => {\n    console.log('Conexión a la base de datos OK');\n    app.listen(process.env.PORT, () => {\n      console.log('Servidor escuchando en el puerto ' + process.env.PORT);\n    });\n  })\n  .catch((error) => {\n    console.error('No se pudo conectar a la base:', error.message);\n  });\n"
    },

    chequeos: [
        { fuente: { archivo: 'config/db.js', debeTener: [
            { re: "require\\(\\s*['\"]sequelize['\"]\\s*\\)", que: 'Falta traer Sequelize.' },
            { re: 'new Sequelize\\(', que: 'Falta crear la conexión con new Sequelize(...).' }
        ] } },
        { fuente: { debeTener: [
            { re: "require\\(\\s*['\"]\\.\\/config\\/db['\"]\\s*\\)", que: 'Falta importar la conexión: require(\'./config/db\')' },
            { re: '\\.authenticate\\(', que: 'Falta llamar a sequelize.authenticate().' }
        ] } },
        { arranque: { escuchando: true, consolaContiene: 'Conexión a la base de datos OK' },
          pista: 'app.listen tiene que estar DENTRO del .then() de sequelize.authenticate(), no al lado.' }
    ]
},

{
    id: 'p04',
    titulo: 'El primer modelo: Usuario',
    minutos: 14,

    teoria: [
        { h: 'sequelize.define' },
        { p: 'Un **modelo** describe una tabla: cómo se llama, y qué columnas tiene con qué tipo. Se declara con `sequelize.define(nombre, columnas)`:' },
        { codigo: "const { DataTypes } = require('sequelize');\nconst sequelize = require('../config/db');\n\nconst Usuario = sequelize.define('Usuario', {\n  nombre: { type: DataTypes.STRING, allowNull: false },\n  email: { type: DataTypes.STRING, allowNull: false, unique: true },\n  password: { type: DataTypes.STRING, allowNull: false },\n  rol: { type: DataTypes.STRING, defaultValue: 'usuario' }\n});\n\nmodule.exports = Usuario;", archivo: 'models/Usuario.js' },
        { tabla: {
            cabeceras: ['Opción', 'Qué hace'],
            filas: [
                ['`allowNull: false`', 'La columna es obligatoria. Crear sin ella tira un error.'],
                ['`unique: true`', 'No puede haber dos filas con el mismo valor. Dos emails iguales, error.'],
                ['`defaultValue`', 'Si no se manda, se usa este valor. `rol` va a servir en el paso 12.']
            ]
        } },
        { p: 'Los tipos más comunes son `DataTypes.STRING` (texto corto), `DataTypes.TEXT` (texto largo), `DataTypes.INTEGER`, `DataTypes.BOOLEAN` y `DataTypes.DATE`.' },

        { h: 'sync()' },
        { p: '`sequelize.sync()` es lo que efectivamente prepara la base para los modelos que se definieron. Se llama una sola vez, al arrancar, después de `authenticate()` y antes de aceptar pedidos:' },
        { codigo: "sequelize.authenticate()\n  .then(() => sequelize.sync())\n  .then(() => {\n    console.log('Conexión a la base de datos OK');\n    app.listen(...);\n  })\n  .catch((error) => console.error(error.message));" },
        { nota: 'Para que un modelo exista tiene que **requerirse en algún lado antes del sync()**, aunque nadie use la variable todavía. `require(\'./models/Usuario\');` alcanza: ejecutar ese archivo es lo que registra el modelo.' },
        { clave: 'Un modelo definido pero nunca requerido simplemente no existe para `sync()`. Es lo mismo que le pasaba a un router de la clase anterior si nadie hacía `app.use()` sobre él: el archivo puede estar perfecto y no formar parte del programa.' }
    ],

    consigna: [
        { p: 'Creá `models/Usuario.js` con el modelo de arriba. En `app.js`, requerilo (para que se registre) y encadená `sequelize.sync()` después de `authenticate()`, antes de armar el servidor.' },
        { terminal: 'node app.js' }
    ],

    consolaSugerida: ['node app.js'],

    solucion: {
        '.env': 'PORT=3000\nJWT_SECRET=cambiame-por-un-secreto-largo-y-dificil-de-adivinar\nDB_NAME=api_tareas\n',
        'config/db.js': "const { Sequelize } = require('sequelize');\n\nconst sequelize = new Sequelize(process.env.DB_NAME);\n\nmodule.exports = sequelize;\n",
        'models/Usuario.js': "const { DataTypes } = require('sequelize');\nconst sequelize = require('../config/db');\n\nconst Usuario = sequelize.define('Usuario', {\n  nombre: { type: DataTypes.STRING, allowNull: false },\n  email: { type: DataTypes.STRING, allowNull: false, unique: true },\n  password: { type: DataTypes.STRING, allowNull: false },\n  rol: { type: DataTypes.STRING, defaultValue: 'usuario' }\n});\n\nmodule.exports = Usuario;\n",
        'app.js': "require('dotenv').config();\nconst express = require('express');\nconst sequelize = require('./config/db');\nrequire('./models/Usuario');\n\nconst app = express();\n\nsequelize.authenticate()\n  .then(() => sequelize.sync())\n  .then(() => {\n    console.log('Conexión a la base de datos OK');\n    app.listen(process.env.PORT, () => {\n      console.log('Servidor escuchando en el puerto ' + process.env.PORT);\n    });\n  })\n  .catch((error) => {\n    console.error('No se pudo conectar a la base:', error.message);\n  });\n"
    },

    chequeos: [
        { fuente: { archivo: 'models/Usuario.js', debeTener: [
            { re: "sequelize\\.define\\(\\s*['\"]Usuario['\"]", que: 'Falta sequelize.define(\'Usuario\', { ... }).' },
            { re: 'allowNull', que: 'Ninguna columna tiene allowNull: false.' },
            { re: 'unique', que: 'El email tiene que ser unique: true.' }
        ] } },
        { fuente: { debeTener: [
            { re: "require\\(\\s*['\"]\\.\\/models\\/Usuario['\"]\\s*\\)", que: 'Falta requerir el modelo en app.js: require(\'./models/Usuario\');' },
            { re: '\\.sync\\(\\s*\\)', que: 'Falta llamar a sequelize.sync().' }
        ] } },
        { arranque: { escuchando: true, consolaContiene: 'Conexión a la base de datos OK' } }
    ]
},

{
    id: 'p05',
    titulo: 'Arquitectura en capas: routes y controllers',
    minutos: 14,

    teoria: [
        { h: 'El primer endpoint, repartido en capas' },
        { p: 'Un **endpoint** es, ni más ni menos, una de esas rutas de las que ya vienen hablando: una combinación de método y URL a la que la API sabe responder — `POST /api/auth/registro`, `GET /api/tareas`. Es la palabra que se usa en la vida real cuando se habla de una API, así que vale la pena empezar a usarla ya.' },
        { p: 'Ahora sí arman el primer endpoint de verdad: `POST /api/auth/registro`. En vez de escribirlo adentro de `app.js` como en la clase anterior, se reparte en dos archivos.' },
        { codigo: "const express = require('express');\nconst router = express.Router();\nconst authController = require('../controllers/auth.controller');\n\nrouter.post('/registro', authController.registrar);\n\nmodule.exports = router;", archivo: 'routes/auth.routes.js' },
        { codigo: "const Usuario = require('../models/Usuario');\n\nasync function registrar(req, res) {\n  const { nombre, email, password } = req.body;\n  const usuario = await Usuario.create({ nombre, email, password });\n  res.status(201).json({ id: usuario.id, nombre: usuario.nombre, email: usuario.email });\n}\n\nmodule.exports = { registrar };", archivo: 'controllers/auth.controller.js' },
        { p: 'El router no sabe **cómo** se registra un usuario, sólo que un `POST /registro` le toca a `authController.registrar`. El controller no sabe **cuál es la URL**, sólo qué hacer con `req` y `res`. Cada uno se puede leer, probar y cambiar sin tocar el otro.' },

        { h: 'Usuario.create()' },
        { p: '`Model.create(datos)` es async: crea la fila y devuelve una promesa con el objeto creado, ya con su `id`. Si falta un campo obligatorio o se repite un `unique`, la promesa se **rechaza** — más sobre esto en un rato.' },
        { p: '`res.status(201).json({...})` manda **sólo los campos elegidos**, nunca el objeto entero. Es una costumbre a mantener siempre, incluso ahora que la contraseña todavía viaja en texto plano: la respuesta de la API no tiene por qué mostrar todo lo que la base guarda.' },

        { h: 'Montar el router' },
        { p: 'En `app.js`, dos líneas nuevas: `express.json()` (para poder leer `req.body`, como en la clase anterior) y montar el router bajo un prefijo:' },
        { codigo: "app.use(express.json());\n\nconst authRoutes = require('./routes/auth.routes');\napp.use('/api/auth', authRoutes);" },
        { nota: 'Con eso, `router.post(\'/registro\', ...)` queda escuchando en `/api/auth/registro`. El prefijo lo pone `app.use`, la ruta relativa la pone el router — exactamente como `express.Router()` en la clase anterior.' },
        { clave: 'Ojo: el registro de este paso guarda la contraseña **tal cual la mandaron**, en texto plano. Funciona — y es exactamente el problema que arregla el próximo paso.' }
    ],

    consigna: [
        { p: 'Creá `controllers/auth.controller.js` y `routes/auth.routes.js` con el código de arriba. Montá el router en `app.js` bajo `/api/auth`, y agregá `express.json()`.' },
        { terminal: "node app.js\ncurl -X POST http://localhost:3000/api/auth/registro -H \"Content-Type: application/json\" -d '{\"nombre\":\"Ana\",\"email\":\"ana@mail.com\",\"password\":\"1234\"}'" }
    ],

    consolaSugerida: ['node app.js'],
    probar: [{ metodo: 'POST', ruta: '/api/auth/registro', cuerpo: '{\n  "nombre": "Ana",\n  "email": "ana@mail.com",\n  "password": "1234"\n}' }],

    solucion: {
        '.env': 'PORT=3000\nJWT_SECRET=cambiame-por-un-secreto-largo-y-dificil-de-adivinar\nDB_NAME=api_tareas\n',
        'config/db.js': "const { Sequelize } = require('sequelize');\n\nconst sequelize = new Sequelize(process.env.DB_NAME);\n\nmodule.exports = sequelize;\n",
        'models/Usuario.js': "const { DataTypes } = require('sequelize');\nconst sequelize = require('../config/db');\n\nconst Usuario = sequelize.define('Usuario', {\n  nombre: { type: DataTypes.STRING, allowNull: false },\n  email: { type: DataTypes.STRING, allowNull: false, unique: true },\n  password: { type: DataTypes.STRING, allowNull: false },\n  rol: { type: DataTypes.STRING, defaultValue: 'usuario' }\n});\n\nmodule.exports = Usuario;\n",
        'controllers/auth.controller.js': "const Usuario = require('../models/Usuario');\n\nasync function registrar(req, res) {\n  const { nombre, email, password } = req.body;\n  const usuario = await Usuario.create({ nombre, email, password });\n  res.status(201).json({ id: usuario.id, nombre: usuario.nombre, email: usuario.email });\n}\n\nmodule.exports = { registrar };\n",
        'routes/auth.routes.js': "const express = require('express');\nconst router = express.Router();\nconst authController = require('../controllers/auth.controller');\n\nrouter.post('/registro', authController.registrar);\n\nmodule.exports = router;\n",
        'app.js': "require('dotenv').config();\nconst express = require('express');\nconst sequelize = require('./config/db');\nrequire('./models/Usuario');\nconst authRoutes = require('./routes/auth.routes');\n\nconst app = express();\napp.use(express.json());\n\napp.use('/api/auth', authRoutes);\n\nsequelize.authenticate()\n  .then(() => sequelize.sync())\n  .then(() => {\n    console.log('Conexión a la base de datos OK');\n    app.listen(process.env.PORT, () => {\n      console.log('Servidor escuchando en el puerto ' + process.env.PORT);\n    });\n  })\n  .catch((error) => {\n    console.error('No se pudo conectar a la base:', error.message);\n  });\n"
    },

    chequeos: [
        { fuente: { archivo: 'controllers/auth.controller.js', debeTener: [
            { re: 'async', que: 'La función registrar tiene que ser async.' },
            { re: 'Usuario\\.create\\(', que: 'Falta Usuario.create({ ... }).' },
            { re: 'req\\.body', que: 'Falta leer los datos de req.body.' }
        ] } },
        { fuente: { archivo: 'routes/auth.routes.js', debeTener: [
            { re: 'express\\.Router\\(\\s*\\)', que: 'Falta express.Router().' },
            { re: "router\\.post\\(\\s*['\"]\\/registro['\"]", que: "Falta router.post('/registro', ...)." }
        ] } },
        { fuente: { debeTener: [
            { re: 'express\\.json\\(\\s*\\)', que: 'Falta app.use(express.json()).' },
            { re: "app\\.use\\(\\s*['\"]\\/api\\/auth['\"]", que: "Falta montar el router: app.use('/api/auth', authRoutes)." }
        ] } },
        { pedido: { metodo: 'POST', ruta: '/api/auth/registro',
                    json: { nombre: 'Ana', email: 'ana@mail.com', password: '1234' } },
          espera: { estado: 201, camposEnCadaUno: ['id', 'nombre', 'email'], sinCampos: ['password'] },
          pista: 'Devolvé sólo { id, nombre, email }, nunca el objeto Usuario completo.' }
    ]
},

{
    id: 'p06',
    titulo: 'Nunca en texto plano: bcrypt',
    minutos: 14,

    teoria: [
        { h: 'Por qué esto importa de verdad' },
        { p: 'Si alguien entra a la base de datos —por un bug, un empleado deshonesto, un backup mal guardado— y las contraseñas están en texto plano, ve la contraseña de cada usuario, tal cual la escribió. Como mucha gente reutiliza contraseñas, esa filtración no afecta sólo a esta aplicación: afecta el email, el banco, todo lo demás de esa persona. Es, con diferencia, el error de seguridad más común y más grave que puede tener un sistema de login.' },

        { h: 'Qué es hashear' },
        { p: 'La solución no es "encriptar" la contraseña: encriptar se puede deshacer (con la clave correcta, un dato encriptado vuelve a ser el original), y acá no se quiere que NADIE —ni siquiera el propio sistema— pueda recuperar la contraseña real. La solución es **hashear**: pasarla por una función matemática de un solo sentido, que a partir de un texto arma otro texto de largo fijo, siempre el mismo para la misma entrada, pero **imposible de revertir**.' },
        { p: 'Una imagen que ayuda: es como picar carne. De la carne se puede hacer carne picada — pero de la carne picada no se puede volver a armar el bife de donde salió. `bcrypt.hash("1234", ...)` es la picadora; el hash que devuelve es la carne picada. Guardar la carne picada en la base alcanza para más adelante comprobar "¿esto que me mandaron, picado, da lo mismo que lo que tengo guardado?" — sin necesitar jamás la carne entera de vuelta.' },
        { diagrama:
'"1234"  ──▶  [ bcrypt.hash ]  ──▶  "$2b$10$N9qo8uLOickgx2ZMRZoMy..."\n\n' +
'No existe una función que vaya para atrás:\n\n' +
'"$2b$10$N9qo8uLOickgx2ZMRZoMy..."  ──▶  [ ??? ]  ──▶  "1234"\n' +
'                                          (no hay forma de calcular esto)' },

        { h: 'bcrypt' },
        { p: '`bcrypt.hash(texto, rondas)` devuelve una promesa con el hash. Las "rondas" controlan cuánto trabajo cuesta calcularlo — más rondas, más lento de calcular (a propósito: eso es lo que hace inviable probar millones de contraseñas por segundo). `10` es un valor típico.' },
        { codigo: "const bcrypt = require('bcrypt');\n\nconst hash = await bcrypt.hash('1234', 10);\n// algo como $2b$10$N9qo8uLOickgx2ZMRZoMy...\n\nawait bcrypt.hash('1234', 10);\n// un hash DISTINTO al de arriba, aunque el texto sea el mismo" },
        { nota: 'Dos hashes de la misma contraseña dan resultados distintos, a propósito: cada uno lleva una "sal" al azar mezclada adentro. Eso evita que dos usuarios con la misma contraseña tengan el mismo hash guardado, y hace inútiles las tablas precalculadas de hashes conocidos.' },
        { p: 'Como el hash no se puede deshacer, la única forma de comprobar una contraseña es `bcrypt.compare(texto, hash)`, que devuelve `true` o `false`. Eso es tema del próximo paso: el login.' },
        { clave: '`bcrypt.hash` y `bcrypt.compare` son **async**: siempre con `await`, nunca esperar que devuelvan el valor directo.' }
    ],

    consigna: [
        { p: 'En `controllers/auth.controller.js`, antes de crear el usuario, hasheá la contraseña con `bcrypt.hash(password, 10)` y guardá el hash en vez del texto original.' },
        { terminal: "node app.js\ncurl -X POST http://localhost:3000/api/auth/registro -H \"Content-Type: application/json\" -d '{\"nombre\":\"Beto\",\"email\":\"beto@mail.com\",\"password\":\"secreta\"}'" }
    ],

    consolaSugerida: ['node app.js'],
    probar: [{ metodo: 'POST', ruta: '/api/auth/registro', cuerpo: '{\n  "nombre": "Beto",\n  "email": "beto@mail.com",\n  "password": "secreta"\n}' }],

    solucion: {
        '.env': 'PORT=3000\nJWT_SECRET=cambiame-por-un-secreto-largo-y-dificil-de-adivinar\nDB_NAME=api_tareas\n',
        'config/db.js': "const { Sequelize } = require('sequelize');\n\nconst sequelize = new Sequelize(process.env.DB_NAME);\n\nmodule.exports = sequelize;\n",
        'models/Usuario.js': "const { DataTypes } = require('sequelize');\nconst sequelize = require('../config/db');\n\nconst Usuario = sequelize.define('Usuario', {\n  nombre: { type: DataTypes.STRING, allowNull: false },\n  email: { type: DataTypes.STRING, allowNull: false, unique: true },\n  password: { type: DataTypes.STRING, allowNull: false },\n  rol: { type: DataTypes.STRING, defaultValue: 'usuario' }\n});\n\nmodule.exports = Usuario;\n",
        'controllers/auth.controller.js': "const bcrypt = require('bcrypt');\nconst Usuario = require('../models/Usuario');\n\nasync function registrar(req, res) {\n  const { nombre, email, password } = req.body;\n  const hash = await bcrypt.hash(password, 10);\n  const usuario = await Usuario.create({ nombre, email, password: hash });\n  res.status(201).json({ id: usuario.id, nombre: usuario.nombre, email: usuario.email });\n}\n\nmodule.exports = { registrar };\n",
        'routes/auth.routes.js': "const express = require('express');\nconst router = express.Router();\nconst authController = require('../controllers/auth.controller');\n\nrouter.post('/registro', authController.registrar);\n\nmodule.exports = router;\n",
        'app.js': "require('dotenv').config();\nconst express = require('express');\nconst sequelize = require('./config/db');\nrequire('./models/Usuario');\nconst authRoutes = require('./routes/auth.routes');\n\nconst app = express();\napp.use(express.json());\n\napp.use('/api/auth', authRoutes);\n\nsequelize.authenticate()\n  .then(() => sequelize.sync())\n  .then(() => {\n    console.log('Conexión a la base de datos OK');\n    app.listen(process.env.PORT, () => {\n      console.log('Servidor escuchando en el puerto ' + process.env.PORT);\n    });\n  })\n  .catch((error) => {\n    console.error('No se pudo conectar a la base:', error.message);\n  });\n"
    },

    chequeos: [
        { fuente: { archivo: 'controllers/auth.controller.js', debeTener: [
            { re: "require\\(\\s*['\"]bcrypt['\"]\\s*\\)", que: 'Falta traer bcrypt.' },
            { re: 'bcrypt\\.hash\\(', que: 'Falta bcrypt.hash(password, 10).' }
        ] } },
        { pedido: { metodo: 'POST', ruta: '/api/auth/registro',
                    json: { nombre: 'Beto', email: 'beto@mail.com', password: 'secreta' } },
          espera: { estado: 201, camposEnCadaUno: ['id', 'email'], sinCampos: ['password'] } }
    ]
},

{
    id: 'p07',
    titulo: 'Login: bcrypt.compare y el 401',
    minutos: 12,

    teoria: [
        { h: 'El endpoint de login' },
        { p: 'Loguearse es: buscar al usuario por email, y comparar la contraseña que mandó contra el hash guardado. Dos cosas pueden fallar — que el email no exista, o que la contraseña no coincida — y **las dos tienen que dar exactamente la misma respuesta**.' },
        { codigo: "async function login(req, res) {\n  const { email, password } = req.body;\n  const usuario = await Usuario.findOne({ where: { email } });\n  if (!usuario) return res.status(401).json({ error: 'Credenciales inválidas' });\n\n  const coincide = await bcrypt.compare(password, usuario.password);\n  if (!coincide) return res.status(401).json({ error: 'Credenciales inválidas' });\n\n  // el paso que sigue agrega el token acá\n}", archivo: 'controllers/auth.controller.js' },

        { h: 'Por qué el mismo mensaje' },
        { p: 'Es tentador devolver "no existe ese email" en un caso y "contraseña incorrecta" en el otro — es más claro para quien se equivocó. Pero eso también le informa a un atacante, sin querer, **qué emails están registrados en el sistema**: probando emails al voleo, un mensaje distinto le confirma cuáles existen. Es una técnica real llamada enumeración de usuarios.' },
        { clave: 'Un mismo mensaje genérico —`\'Credenciales inválidas\'`— para "no existe" y para "contraseña mal" cierra esa puerta. La UX pierde un poco de precisión; la seguridad gana bastante.' },

        { h: '`Usuario.findOne`' },
        { p: '`Model.findOne({ where: {...} })` devuelve la primera fila que coincide, o `null` si no hay ninguna. Es distinto de `findByPk`, que busca por el `id`. Los dos son async.' }
    ],

    consigna: [
        { p: 'En `controllers/auth.controller.js`, agregá `login`. Buscá por email, comparalo con `bcrypt.compare`, y en cualquiera de los dos fallos devolvé 401 con `{ error: \'Credenciales inválidas\' }`. Si todo coincide, por ahora respondé `{ mensaje: \'Login correcto\' }` con 200 — el token llega en el próximo paso. Agregá la ruta en `routes/auth.routes.js`.' },
        { terminal: "curl -X POST http://localhost:3000/api/auth/login -H \"Content-Type: application/json\" -d '{\"email\":\"beto@mail.com\",\"password\":\"secreta\"}'" }
    ],

    consolaSugerida: ['node app.js'],
    probar: [{ metodo: 'POST', ruta: '/api/auth/login', cuerpo: '{\n  "email": "beto@mail.com",\n  "password": "secreta"\n}' }],

    solucion: {
        '.env': 'PORT=3000\nJWT_SECRET=cambiame-por-un-secreto-largo-y-dificil-de-adivinar\nDB_NAME=api_tareas\n',
        'config/db.js': "const { Sequelize } = require('sequelize');\n\nconst sequelize = new Sequelize(process.env.DB_NAME);\n\nmodule.exports = sequelize;\n",
        'models/Usuario.js': "const { DataTypes } = require('sequelize');\nconst sequelize = require('../config/db');\n\nconst Usuario = sequelize.define('Usuario', {\n  nombre: { type: DataTypes.STRING, allowNull: false },\n  email: { type: DataTypes.STRING, allowNull: false, unique: true },\n  password: { type: DataTypes.STRING, allowNull: false },\n  rol: { type: DataTypes.STRING, defaultValue: 'usuario' }\n});\n\nmodule.exports = Usuario;\n",
        'controllers/auth.controller.js': "const bcrypt = require('bcrypt');\nconst Usuario = require('../models/Usuario');\n\nasync function registrar(req, res) {\n  const { nombre, email, password } = req.body;\n  const hash = await bcrypt.hash(password, 10);\n  const usuario = await Usuario.create({ nombre, email, password: hash });\n  res.status(201).json({ id: usuario.id, nombre: usuario.nombre, email: usuario.email });\n}\n\nasync function login(req, res) {\n  const { email, password } = req.body;\n  const usuario = await Usuario.findOne({ where: { email } });\n  if (!usuario) return res.status(401).json({ error: 'Credenciales inválidas' });\n\n  const coincide = await bcrypt.compare(password, usuario.password);\n  if (!coincide) return res.status(401).json({ error: 'Credenciales inválidas' });\n\n  res.json({ mensaje: 'Login correcto' });\n}\n\nmodule.exports = { registrar, login };\n",
        'routes/auth.routes.js': "const express = require('express');\nconst router = express.Router();\nconst authController = require('../controllers/auth.controller');\n\nrouter.post('/registro', authController.registrar);\nrouter.post('/login', authController.login);\n\nmodule.exports = router;\n",
        'app.js': "require('dotenv').config();\nconst express = require('express');\nconst sequelize = require('./config/db');\nrequire('./models/Usuario');\nconst authRoutes = require('./routes/auth.routes');\n\nconst app = express();\napp.use(express.json());\n\napp.use('/api/auth', authRoutes);\n\nsequelize.authenticate()\n  .then(() => sequelize.sync())\n  .then(() => {\n    console.log('Conexión a la base de datos OK');\n    app.listen(process.env.PORT, () => {\n      console.log('Servidor escuchando en el puerto ' + process.env.PORT);\n    });\n  })\n  .catch((error) => {\n    console.error('No se pudo conectar a la base:', error.message);\n  });\n"
    },

    chequeos: [
        { fuente: { archivo: 'controllers/auth.controller.js', debeTener: [
            { re: 'bcrypt\\.compare\\(', que: 'Falta bcrypt.compare(password, usuario.password).' },
            { re: 'findOne\\(', que: 'Falta buscar el usuario con Usuario.findOne({ where: { email } }).' }
        ] } },
        { pedido: { metodo: 'POST', ruta: '/api/auth/registro',
                    json: { nombre: 'Carla', email: 'carla@mail.com', password: 'clave123' } },
          espera: { estado: 201 } },
        { pedido: { metodo: 'POST', ruta: '/api/auth/login',
                    json: { email: 'carla@mail.com', password: 'clave123' } },
          espera: { estado: 200 } },
        { pedido: { metodo: 'POST', ruta: '/api/auth/login',
                    json: { email: 'carla@mail.com', password: 'esta-mal' } },
          espera: { estado: 401, json: { error: 'Credenciales inválidas' } },
          pista: 'El mensaje de error tiene que ser exactamente { error: \'Credenciales inválidas\' }.' },
        { pedido: { metodo: 'POST', ruta: '/api/auth/login',
                    json: { email: 'no-existe@mail.com', password: 'lo-que-sea' } },
          espera: { estado: 401, json: { error: 'Credenciales inválidas' } },
          pista: 'Un email que no existe tiene que dar EL MISMO mensaje que una contraseña incorrecta.' }
    ]
},

{
    id: 'p08',
    titulo: 'El token: jsonwebtoken',
    minutos: 12,

    teoria: [
        { h: 'Qué es un JWT' },
        { p: 'HTTP no recuerda nada entre un pedido y el siguiente. Cada pedido es una llamada nueva, sin memoria de la anterior. Entonces, después de loguearse, ¿cómo sabe el servidor quién sos en el pedido de acá a un minuto? La respuesta de esta clase es un **JWT** (JSON Web Token): una credencial que el servidor firma al loguearse, y que el cliente reenvía en cada pedido siguiente.' },
        { p: 'Un JWT son tres partes separadas por puntos: `cabecera.payload.firma`. El `payload` es JSON con los datos que el servidor decidió guardar ahí —típicamente el `id` del usuario— codificado, **no encriptado**: cualquiera puede leerlo. La `firma` es la que garantiza que nadie lo alteró: sale de mezclar cabecera + payload con una clave secreta que sólo el servidor conoce.' },
        { clave: 'Un JWT es a prueba de manipulación, no a prueba de lectura. Nunca va adentro un dato sensible: ni contraseña, ni hash, nada que no debiera poder ver quien tenga el token — y quien tiene el token es, ni más ni menos, el propio usuario logueado.' },

        { h: 'jwt.sign' },
        { p: '`jwt.sign(payload, secreto, opciones)` arma y firma el token. A diferencia de `bcrypt`, **no es async**: devuelve el string directo, sin `await`.' },
        { codigo: "const jwt = require('jsonwebtoken');\n\nconst token = jwt.sign(\n  { id: usuario.id, rol: usuario.rol },\n  process.env.JWT_SECRET,\n  { expiresIn: '2h' }\n);\n\nres.json({ token });" },
        { p: '`expiresIn` pone una fecha de vencimiento adentro del token. Pasado ese tiempo, el propio `jwt.verify` (el que van a escribir en el próximo paso, del lado del que RECIBE el token) lo va a rechazar, aunque la firma sea perfecta.' },
        { nota: 'El secreto es el mismo `JWT_SECRET` del `.env` del paso 2. Si alguien lo consigue, puede firmar tokens falsos que el servidor va a aceptar como válidos: es la pieza más sensible de toda esta clase.' }
    ],

    consigna: [
        { p: 'En `login`, en vez del mensaje de texto, firmá un token con `{ id: usuario.id, rol: usuario.rol }`, usando `process.env.JWT_SECRET` y `expiresIn: \'2h\'`. Devolvé `{ token }`.' },
        { terminal: "curl -X POST http://localhost:3000/api/auth/login -H \"Content-Type: application/json\" -d '{\"email\":\"beto@mail.com\",\"password\":\"secreta\"}'" }
    ],

    consolaSugerida: ['node app.js'],
    probar: [{ metodo: 'POST', ruta: '/api/auth/login', cuerpo: '{\n  "email": "beto@mail.com",\n  "password": "secreta"\n}' }],

    solucion: {
        '.env': 'PORT=3000\nJWT_SECRET=cambiame-por-un-secreto-largo-y-dificil-de-adivinar\nDB_NAME=api_tareas\n',
        'config/db.js': "const { Sequelize } = require('sequelize');\n\nconst sequelize = new Sequelize(process.env.DB_NAME);\n\nmodule.exports = sequelize;\n",
        'models/Usuario.js': "const { DataTypes } = require('sequelize');\nconst sequelize = require('../config/db');\n\nconst Usuario = sequelize.define('Usuario', {\n  nombre: { type: DataTypes.STRING, allowNull: false },\n  email: { type: DataTypes.STRING, allowNull: false, unique: true },\n  password: { type: DataTypes.STRING, allowNull: false },\n  rol: { type: DataTypes.STRING, defaultValue: 'usuario' }\n});\n\nmodule.exports = Usuario;\n",
        'controllers/auth.controller.js': "const bcrypt = require('bcrypt');\nconst jwt = require('jsonwebtoken');\nconst Usuario = require('../models/Usuario');\n\nasync function registrar(req, res) {\n  const { nombre, email, password } = req.body;\n  const hash = await bcrypt.hash(password, 10);\n  const usuario = await Usuario.create({ nombre, email, password: hash });\n  res.status(201).json({ id: usuario.id, nombre: usuario.nombre, email: usuario.email });\n}\n\nasync function login(req, res) {\n  const { email, password } = req.body;\n  const usuario = await Usuario.findOne({ where: { email } });\n  if (!usuario) return res.status(401).json({ error: 'Credenciales inválidas' });\n\n  const coincide = await bcrypt.compare(password, usuario.password);\n  if (!coincide) return res.status(401).json({ error: 'Credenciales inválidas' });\n\n  const token = jwt.sign({ id: usuario.id, rol: usuario.rol }, process.env.JWT_SECRET, { expiresIn: '2h' });\n  res.json({ token });\n}\n\nmodule.exports = { registrar, login };\n",
        'routes/auth.routes.js': "const express = require('express');\nconst router = express.Router();\nconst authController = require('../controllers/auth.controller');\n\nrouter.post('/registro', authController.registrar);\nrouter.post('/login', authController.login);\n\nmodule.exports = router;\n",
        'app.js': "require('dotenv').config();\nconst express = require('express');\nconst sequelize = require('./config/db');\nrequire('./models/Usuario');\nconst authRoutes = require('./routes/auth.routes');\n\nconst app = express();\napp.use(express.json());\n\napp.use('/api/auth', authRoutes);\n\nsequelize.authenticate()\n  .then(() => sequelize.sync())\n  .then(() => {\n    console.log('Conexión a la base de datos OK');\n    app.listen(process.env.PORT, () => {\n      console.log('Servidor escuchando en el puerto ' + process.env.PORT);\n    });\n  })\n  .catch((error) => {\n    console.error('No se pudo conectar a la base:', error.message);\n  });\n"
    },

    chequeos: [
        { fuente: { archivo: 'controllers/auth.controller.js', debeTener: [
            { re: "require\\(\\s*['\"]jsonwebtoken['\"]\\s*\\)", que: 'Falta traer jsonwebtoken.' },
            { re: 'jwt\\.sign\\(', que: 'Falta jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: ... }).' }
        ] } },
        { pedido: { metodo: 'POST', ruta: '/api/auth/registro',
                    json: { nombre: 'Dana', email: 'dana@mail.com', password: 'xyz789' } },
          espera: { estado: 201 } },
        { pedido: { metodo: 'POST', ruta: '/api/auth/login',
                    json: { email: 'dana@mail.com', password: 'xyz789' } },
          espera: { estado: 200, camposEnCadaUno: ['token'] },
          pista: 'La respuesta del login tiene que traer { token: \'...\' }.' }
    ]
},

{
    id: 'p09',
    titulo: 'El guard: un middleware que exige el token',
    minutos: 14,

    teoria: [
        { h: 'De vuelta a los middlewares' },
        { p: 'Un **guard** es un middleware que decide si un pedido puede seguir. Ya conocen la mecánica de un middleware desde la clase anterior: recibe `req`, `res`, `next`. La única novedad es qué hace adentro: leer el token, verificarlo, y si es válido, colgarle el usuario a `req` para que el controller lo use después.' },
        { p: 'El token viaja en la cabecera `Authorization`, con el formato `Bearer <token>` (es una convención del protocolo HTTP, no un capricho de esta clase — la van a ver igual en cualquier API).' },
        { diagrama:
"cliente               verificarToken                controller\n" +
"  │                        │                             │\n" +
"  │  GET /api/auth/perfil  │                             │\n" +
"  │  Authorization: Bearer <token>                       │\n" +
"  ├───────────────────────▶                              │\n" +
"  │                 ¿vino la cabecera Authorization?      │\n" +
"  │                  no ──▶ res.status(401) ─┐            │\n" +
"  │                  sí                       │            │\n" +
"  │                 jwt.verify(token, secreto) │            │\n" +
"  │                  falla ──▶ res.status(401) ┤           │\n" +
"  │                  ok ──▶ req.usuario = payload          │\n" +
"  │                          next() ───────────────────────▶\n" +
"  │                                                  usa req.usuario\n" +
"  │◀──────────────────────────────────────────────────────┤\n" +
"  │              200, ó 401 (nunca llega acá)              │" },
        { codigo: "const jwt = require('jsonwebtoken');\n\nfunction verificarToken(req, res, next) {\n  const cabecera = req.headers['authorization'];\n  if (!cabecera || !cabecera.startsWith('Bearer ')) {\n    return res.status(401).json({ error: 'Falta el token' });\n  }\n\n  const token = cabecera.slice(7);   // saca el 'Bearer ' de adelante\n  try {\n    req.usuario = jwt.verify(token, process.env.JWT_SECRET);\n    next();\n  } catch (error) {\n    return res.status(401).json({ error: 'Token inválido o vencido' });\n  }\n}\n\nmodule.exports = verificarToken;", archivo: 'middlewares/verificarToken.js' },

        { h: 'jwt.verify() no devuelve null: TIRA UN ERROR' },
        { p: 'Es la trampa más común de este paso. `jwt.verify(token, secreto)` no es como un `find()` que devuelve `undefined` cuando no hay resultado: si la firma no coincide, si el formato está roto, o si venció el `expiresIn`, **lanza una excepción**. Sin `try/catch` alrededor, esa excepción revienta el pedido entero con un 500, en vez del 401 prolijo que tendría que ver el cliente.' },
        { nota: 'Si todo sale bien, `jwt.verify` devuelve el payload original: `{ id, rol, iat, exp }`. Eso es lo que se guarda en `req.usuario`, disponible para cualquier controller que venga después del guard.' },

        { h: 'Usarlo en una ruta' },
        { p: 'El guard se agrega como un argumento más, entre la ruta y el controller final:' },
        { codigo: "router.get('/perfil', verificarToken, authController.perfil);" },
        { clave: 'Express corre las funciones de una ruta EN ORDEN — es la fila de capas de la clase anterior. Si `verificarToken` responde con 401, nunca llega a `authController.perfil`. Si llama a `next()`, `req.usuario` ya está listo para cuando el controller lo necesite.' }
    ],

    consigna: [
        { p: 'Creá `middlewares/verificarToken.js` con el código de arriba. Agregá a `controllers/auth.controller.js` una función `perfil` que devuelva `{ id: req.usuario.id, rol: req.usuario.rol }`. Agregá la ruta `GET /perfil` en `routes/auth.routes.js`, protegida con el guard.' },
        { p: 'Probá primero sin token (401), después con el token que te devuelve el login (200): pegalo en el campo Cabeceras del panel Pedidos, como `Authorization: Bearer <el token>`.' },
        { terminal: 'curl http://localhost:3000/api/auth/perfil' }
    ],

    consolaSugerida: ['node app.js'],
    probar: [{ metodo: 'GET', ruta: '/api/auth/perfil' }],

    solucion: {
        '.env': 'PORT=3000\nJWT_SECRET=cambiame-por-un-secreto-largo-y-dificil-de-adivinar\nDB_NAME=api_tareas\n',
        'config/db.js': "const { Sequelize } = require('sequelize');\n\nconst sequelize = new Sequelize(process.env.DB_NAME);\n\nmodule.exports = sequelize;\n",
        'models/Usuario.js': "const { DataTypes } = require('sequelize');\nconst sequelize = require('../config/db');\n\nconst Usuario = sequelize.define('Usuario', {\n  nombre: { type: DataTypes.STRING, allowNull: false },\n  email: { type: DataTypes.STRING, allowNull: false, unique: true },\n  password: { type: DataTypes.STRING, allowNull: false },\n  rol: { type: DataTypes.STRING, defaultValue: 'usuario' }\n});\n\nmodule.exports = Usuario;\n",
        'middlewares/verificarToken.js': "const jwt = require('jsonwebtoken');\n\nfunction verificarToken(req, res, next) {\n  const cabecera = req.headers['authorization'];\n  if (!cabecera || !cabecera.startsWith('Bearer ')) {\n    return res.status(401).json({ error: 'Falta el token' });\n  }\n\n  const token = cabecera.slice(7);\n  try {\n    req.usuario = jwt.verify(token, process.env.JWT_SECRET);\n    next();\n  } catch (error) {\n    return res.status(401).json({ error: 'Token inválido o vencido' });\n  }\n}\n\nmodule.exports = verificarToken;\n",
        'controllers/auth.controller.js': "const bcrypt = require('bcrypt');\nconst jwt = require('jsonwebtoken');\nconst Usuario = require('../models/Usuario');\n\nasync function registrar(req, res) {\n  const { nombre, email, password } = req.body;\n  const hash = await bcrypt.hash(password, 10);\n  const usuario = await Usuario.create({ nombre, email, password: hash });\n  res.status(201).json({ id: usuario.id, nombre: usuario.nombre, email: usuario.email });\n}\n\nasync function login(req, res) {\n  const { email, password } = req.body;\n  const usuario = await Usuario.findOne({ where: { email } });\n  if (!usuario) return res.status(401).json({ error: 'Credenciales inválidas' });\n\n  const coincide = await bcrypt.compare(password, usuario.password);\n  if (!coincide) return res.status(401).json({ error: 'Credenciales inválidas' });\n\n  const token = jwt.sign({ id: usuario.id, rol: usuario.rol }, process.env.JWT_SECRET, { expiresIn: '2h' });\n  res.json({ token });\n}\n\nasync function perfil(req, res) {\n  res.json({ id: req.usuario.id, rol: req.usuario.rol });\n}\n\nmodule.exports = { registrar, login, perfil };\n",
        'routes/auth.routes.js': "const express = require('express');\nconst router = express.Router();\nconst authController = require('../controllers/auth.controller');\nconst verificarToken = require('../middlewares/verificarToken');\n\nrouter.post('/registro', authController.registrar);\nrouter.post('/login', authController.login);\nrouter.get('/perfil', verificarToken, authController.perfil);\n\nmodule.exports = router;\n",
        'app.js': "require('dotenv').config();\nconst express = require('express');\nconst sequelize = require('./config/db');\nrequire('./models/Usuario');\nconst authRoutes = require('./routes/auth.routes');\n\nconst app = express();\napp.use(express.json());\n\napp.use('/api/auth', authRoutes);\n\nsequelize.authenticate()\n  .then(() => sequelize.sync())\n  .then(() => {\n    console.log('Conexión a la base de datos OK');\n    app.listen(process.env.PORT, () => {\n      console.log('Servidor escuchando en el puerto ' + process.env.PORT);\n    });\n  })\n  .catch((error) => {\n    console.error('No se pudo conectar a la base:', error.message);\n  });\n"
    },

    chequeos: [
        { fuente: { archivo: 'middlewares/verificarToken.js', debeTener: [
            { re: 'jwt\\.verify\\(', que: 'Falta jwt.verify(token, process.env.JWT_SECRET).' },
            { re: 'try\\s*{', que: 'jwt.verify() puede tirar un error: hace falta un try.' },
            { re: 'catch\\s*\\(', que: 'Falta el catch alrededor de jwt.verify().' }
        ] } },
        { fuente: { archivo: 'routes/auth.routes.js', debeTener: [
            { re: 'verificarToken', que: 'La ruta /perfil tiene que pasar por verificarToken.' }
        ] } },
        { pedido: { metodo: 'GET', ruta: '/api/auth/perfil' }, espera: { estado: 401 },
          pista: 'Sin cabecera Authorization, verificarToken tiene que cortar con 401.' },
        { pedido: { metodo: 'POST', ruta: '/api/auth/registro',
                    json: { nombre: 'Eva', email: 'eva@mail.com', password: 'clave2024' } },
          espera: { estado: 201 } },
        { pedido: { metodo: 'POST', ruta: '/api/auth/login',
                    json: { email: 'eva@mail.com', password: 'clave2024' } },
          espera: { estado: 200, camposEnCadaUno: ['token'] },
          guardar: { token: 'token' } },
        { pedido: { metodo: 'GET', ruta: '/api/auth/perfil',
                    cabeceras: { Authorization: 'Bearer {{token}}' } },
          espera: { estado: 200, camposEnCadaUno: ['id', 'rol'] } },
        { pedido: { metodo: 'GET', ruta: '/api/auth/perfil',
                    cabeceras: { Authorization: 'Bearer esto.no.es-un-token-valido' } },
          espera: { estado: 401 },
          pista: 'Un token con formato roto tiene que dar 401, no un 500. Revisá el try/catch.' }
    ]
},

{
    id: 'p10',
    titulo: 'El modelo Tarea: un recurso protegido',
    minutos: 14,

    teoria: [
        { h: 'Un segundo modelo, relacionado con el primero' },
        { p: 'Cada tarea le pertenece a un usuario. En una base relacional eso se modela con una **clave foránea** ("foreign key"): una columna que no guarda un dato propio de la tarea, sino el `id` de una fila de OTRA tabla — acá, el usuario dueño. Es el mismo mecanismo con el que cualquier base relacional conecta dos tablas entre sí.' },
        { diagrama:
"tabla Usuario                       tabla Tarea\n" +
"┌────┬───────────┐                  ┌────┬───────────┬───────────┐\n" +
"│ id │ email     │                  │ id │ titulo    │ usuarioId │\n" +
"├────┼───────────┤                  ├────┼───────────┼───────────┤\n" +
"│ 1  │ ana@...   │  ◀────────────── │ 7  │ Estudiar  │     1     │\n" +
"│ 2  │ beto@...  │  ◀────────────── │ 8  │ Comprar   │     1     │\n" +
"│    │           │  ◀────────────── │ 9  │ Barrer    │     2     │\n" +
"└────┴───────────┘                  └────┴───────────┴───────────┘\n\n" +
"        usuarioId = 1   quiere decir   \"esta tarea es de Ana\"" },
        { codigo: "const { DataTypes } = require('sequelize');\nconst sequelize = require('../config/db');\n\nconst Tarea = sequelize.define('Tarea', {\n  titulo: { type: DataTypes.STRING, allowNull: false },\n  hecha: { type: DataTypes.BOOLEAN, defaultValue: false },\n  usuarioId: { type: DataTypes.INTEGER, allowNull: false }\n});\n\nmodule.exports = Tarea;", archivo: 'models/Tarea.js' },
        { nota: 'Sequelize tiene una forma más avanzada de declarar esto (`Tarea.belongsTo(Usuario)`), que además arma automáticamente métodos como `tarea.getUsuario()`. Esta clase se queda con la versión explícita —una columna común, un `where: { usuarioId }` a mano— porque es la misma idea sin una capa extra de magia, y entenderla primero así hace que la versión con `belongsTo` se entienda sola el día que la vean.' },

        { h: 'Un router protegido entero' },
        { p: 'Hasta ahora aplicaron el guard ruta por ruta. Cuando **todas** las rutas de un router necesitan estar logueado, alcanza con un `router.use()` al principio del archivo — se aplica a todo lo que venga después, en ese router:' },
        { codigo: "const express = require('express');\nconst router = express.Router();\nconst tareasController = require('../controllers/tareas.controller');\nconst verificarToken = require('../middlewares/verificarToken');\n\nrouter.use(verificarToken);\n\nrouter.get('/', tareasController.listar);\nrouter.post('/', tareasController.crear);\n\nmodule.exports = router;", archivo: 'routes/tareas.routes.js' },

        { h: 'Sólo MIS tareas' },
        { p: 'El `id` del usuario logueado está en `req.usuario.id` —lo puso el guard—. Nunca se lee de un parámetro de la URL ni del body: si lo tomaran de ahí, cualquiera podría pedir `?usuarioId=1` y ver tareas ajenas. El único lugar confiable es el token verificado.' },
        { codigo: "async function listar(req, res) {\n  const tareas = await Tarea.findAll({ where: { usuarioId: req.usuario.id } });\n  res.json(tareas);\n}\n\nasync function crear(req, res) {\n  const tarea = await Tarea.create({ titulo: req.body.titulo, usuarioId: req.usuario.id });\n  res.status(201).json(tarea);\n}", archivo: 'controllers/tareas.controller.js' },
        { clave: 'Cada capa filtra un poquito más de confianza: el guard confirma quién sos, y el controller usa ese "quién sos" —nunca lo que mandó el cliente por otro lado— para decidir qué datos mostrar.' }
    ],

    consigna: [
        { p: 'Creá `models/Tarea.js`, requerilo en `app.js` (igual que con Usuario). Creá `controllers/tareas.controller.js` con `listar` y `crear`, y `routes/tareas.routes.js` con el guard aplicado a todo el router. Montalo en `app.js` bajo `/api/tareas`.' },
        { terminal: "curl http://localhost:3000/api/tareas" }
    ],

    consolaSugerida: ['node app.js'],
    probar: [{ metodo: 'GET', ruta: '/api/tareas' }],

    solucion: {
        '.env': 'PORT=3000\nJWT_SECRET=cambiame-por-un-secreto-largo-y-dificil-de-adivinar\nDB_NAME=api_tareas\n',
        'config/db.js': "const { Sequelize } = require('sequelize');\n\nconst sequelize = new Sequelize(process.env.DB_NAME);\n\nmodule.exports = sequelize;\n",
        'models/Usuario.js': "const { DataTypes } = require('sequelize');\nconst sequelize = require('../config/db');\n\nconst Usuario = sequelize.define('Usuario', {\n  nombre: { type: DataTypes.STRING, allowNull: false },\n  email: { type: DataTypes.STRING, allowNull: false, unique: true },\n  password: { type: DataTypes.STRING, allowNull: false },\n  rol: { type: DataTypes.STRING, defaultValue: 'usuario' }\n});\n\nmodule.exports = Usuario;\n",
        'models/Tarea.js': "const { DataTypes } = require('sequelize');\nconst sequelize = require('../config/db');\n\nconst Tarea = sequelize.define('Tarea', {\n  titulo: { type: DataTypes.STRING, allowNull: false },\n  hecha: { type: DataTypes.BOOLEAN, defaultValue: false },\n  usuarioId: { type: DataTypes.INTEGER, allowNull: false }\n});\n\nmodule.exports = Tarea;\n",
        'middlewares/verificarToken.js': "const jwt = require('jsonwebtoken');\n\nfunction verificarToken(req, res, next) {\n  const cabecera = req.headers['authorization'];\n  if (!cabecera || !cabecera.startsWith('Bearer ')) {\n    return res.status(401).json({ error: 'Falta el token' });\n  }\n\n  const token = cabecera.slice(7);\n  try {\n    req.usuario = jwt.verify(token, process.env.JWT_SECRET);\n    next();\n  } catch (error) {\n    return res.status(401).json({ error: 'Token inválido o vencido' });\n  }\n}\n\nmodule.exports = verificarToken;\n",
        'controllers/auth.controller.js': "const bcrypt = require('bcrypt');\nconst jwt = require('jsonwebtoken');\nconst Usuario = require('../models/Usuario');\n\nasync function registrar(req, res) {\n  const { nombre, email, password } = req.body;\n  const hash = await bcrypt.hash(password, 10);\n  const usuario = await Usuario.create({ nombre, email, password: hash });\n  res.status(201).json({ id: usuario.id, nombre: usuario.nombre, email: usuario.email });\n}\n\nasync function login(req, res) {\n  const { email, password } = req.body;\n  const usuario = await Usuario.findOne({ where: { email } });\n  if (!usuario) return res.status(401).json({ error: 'Credenciales inválidas' });\n\n  const coincide = await bcrypt.compare(password, usuario.password);\n  if (!coincide) return res.status(401).json({ error: 'Credenciales inválidas' });\n\n  const token = jwt.sign({ id: usuario.id, rol: usuario.rol }, process.env.JWT_SECRET, { expiresIn: '2h' });\n  res.json({ token });\n}\n\nasync function perfil(req, res) {\n  res.json({ id: req.usuario.id, rol: req.usuario.rol });\n}\n\nmodule.exports = { registrar, login, perfil };\n",
        'controllers/tareas.controller.js': "const Tarea = require('../models/Tarea');\n\nasync function listar(req, res) {\n  const tareas = await Tarea.findAll({ where: { usuarioId: req.usuario.id } });\n  res.json(tareas);\n}\n\nasync function crear(req, res) {\n  const tarea = await Tarea.create({ titulo: req.body.titulo, usuarioId: req.usuario.id });\n  res.status(201).json(tarea);\n}\n\nmodule.exports = { listar, crear };\n",
        'routes/auth.routes.js': "const express = require('express');\nconst router = express.Router();\nconst authController = require('../controllers/auth.controller');\nconst verificarToken = require('../middlewares/verificarToken');\n\nrouter.post('/registro', authController.registrar);\nrouter.post('/login', authController.login);\nrouter.get('/perfil', verificarToken, authController.perfil);\n\nmodule.exports = router;\n",
        'routes/tareas.routes.js': "const express = require('express');\nconst router = express.Router();\nconst tareasController = require('../controllers/tareas.controller');\nconst verificarToken = require('../middlewares/verificarToken');\n\nrouter.use(verificarToken);\n\nrouter.get('/', tareasController.listar);\nrouter.post('/', tareasController.crear);\n\nmodule.exports = router;\n",
        'app.js': "require('dotenv').config();\nconst express = require('express');\nconst sequelize = require('./config/db');\nrequire('./models/Usuario');\nrequire('./models/Tarea');\nconst authRoutes = require('./routes/auth.routes');\nconst tareasRoutes = require('./routes/tareas.routes');\n\nconst app = express();\napp.use(express.json());\n\napp.use('/api/auth', authRoutes);\napp.use('/api/tareas', tareasRoutes);\n\nsequelize.authenticate()\n  .then(() => sequelize.sync())\n  .then(() => {\n    console.log('Conexión a la base de datos OK');\n    app.listen(process.env.PORT, () => {\n      console.log('Servidor escuchando en el puerto ' + process.env.PORT);\n    });\n  })\n  .catch((error) => {\n    console.error('No se pudo conectar a la base:', error.message);\n  });\n"
    },

    chequeos: [
        { fuente: { archivo: 'models/Tarea.js', debeTener: [
            { re: "sequelize\\.define\\(\\s*['\"]Tarea['\"]", que: 'Falta sequelize.define(\'Tarea\', { ... }).' },
            { re: 'usuarioId', que: 'Falta la columna usuarioId.' }
        ] } },
        { fuente: { archivo: 'routes/tareas.routes.js', debeTener: [
            { re: 'express\\.Router\\(\\s*\\)', que: 'Falta express.Router().' },
            { re: 'router\\.use\\(\\s*verificarToken\\s*\\)', que: 'Falta proteger todo el router con router.use(verificarToken).' }
        ] } },
        { fuente: { archivo: 'controllers/tareas.controller.js', debeTener: [
            { re: 'req\\.usuario\\.id', que: 'El dueño de la tarea tiene que salir de req.usuario.id, no de la URL ni del body.' }
        ] } },
        { pedido: { metodo: 'GET', ruta: '/api/tareas' }, espera: { estado: 401 } },
        { pedido: { metodo: 'POST', ruta: '/api/auth/registro',
                    json: { nombre: 'Fran', email: 'fran@mail.com', password: 'clave2024' } },
          espera: { estado: 201 } },
        { pedido: { metodo: 'POST', ruta: '/api/auth/login',
                    json: { email: 'fran@mail.com', password: 'clave2024' } },
          espera: { estado: 200 }, guardar: { token: 'token' } },
        { pedido: { metodo: 'POST', ruta: '/api/tareas', json: { titulo: 'Estudiar Sequelize' },
                    cabeceras: { Authorization: 'Bearer {{token}}' } },
          espera: { estado: 201, jsonParcial: { titulo: 'Estudiar Sequelize', hecha: false } } },
        { pedido: { metodo: 'GET', ruta: '/api/tareas', cabeceras: { Authorization: 'Bearer {{token}}' } },
          espera: { estado: 200, esArreglo: true, largo: 1 } }
    ]
},

{
    id: 'p11',
    titulo: 'Actualizar y borrar: PUT, DELETE y el dueño de cada tarea',
    minutos: 14,

    teoria: [
        { h: 'Buscar, comprobar dueño, recién ahí actuar' },
        { p: 'Actualizar o borrar una tarea agrega un paso que crear y listar no tenían: comprobar que la tarea sea del usuario logueado **antes** de tocarla. Si no, cualquiera con sesión —no hace falta ser el dueño— podría editar o borrar tareas ajenas con sólo adivinar un `id`.' },
        { codigo: "async function actualizar(req, res) {\n  const tarea = await Tarea.findByPk(req.params.id);\n  if (!tarea || tarea.usuarioId !== req.usuario.id) {\n    return res.status(404).json({ error: 'No existe esa tarea' });\n  }\n\n  if (req.body.titulo !== undefined) tarea.titulo = req.body.titulo;\n  if (req.body.hecha !== undefined) tarea.hecha = req.body.hecha;\n  await tarea.save();\n  res.json(tarea);\n}", archivo: 'controllers/tareas.controller.js' },
        { nota: '¿Por qué 404 y no 403? Un 403 ("no tenés permiso") le confirma a quien pregunta que la tarea EXISTE, sólo que no es suya. Un 404 ("no existe") no distingue entre "no es tuya" y "nunca existió": no le regala a nadie información sobre lo que hay en la base de otros usuarios. Es la misma idea del mensaje único del login, aplicada acá.' },

        { h: 'save() y destroy()' },
        { p: 'Una fila que salió de `findByPk`, `findOne` o `findAll` tiene métodos propios: `instancia.save()` guarda los cambios hechos a mano sobre sus propiedades, e `instancia.destroy()` la borra. Los dos son async.' },
        { codigo: "async function eliminar(req, res) {\n  const tarea = await Tarea.findByPk(req.params.id);\n  if (!tarea || tarea.usuarioId !== req.usuario.id) {\n    return res.status(404).json({ error: 'No existe esa tarea' });\n  }\n\n  await tarea.destroy();\n  res.status(204).send();\n}" },
        { clave: 'PUT/PATCH que modifican devuelven 200 con el recurso actualizado. DELETE que borra devuelve 204 sin cuerpo — ya lo vieron en la clase anterior, y acá se suma la comprobación de dueño antes de cualquiera de las dos.' }
    ],

    consigna: [
        { p: 'Agregá `actualizar` y `eliminar` a `controllers/tareas.controller.js`, y las rutas `PUT /:id` y `DELETE /:id` en `routes/tareas.routes.js`.' },
        { terminal: "curl -X PUT http://localhost:3000/api/tareas/1 -H \"Content-Type: application/json\" -H \"Authorization: Bearer <token>\" -d '{\"hecha\":true}'" }
    ],

    consolaSugerida: ['node app.js'],
    probar: [{ metodo: 'GET', ruta: '/api/tareas' }],

    solucion: {
        '.env': 'PORT=3000\nJWT_SECRET=cambiame-por-un-secreto-largo-y-dificil-de-adivinar\nDB_NAME=api_tareas\n',
        'config/db.js': "const { Sequelize } = require('sequelize');\n\nconst sequelize = new Sequelize(process.env.DB_NAME);\n\nmodule.exports = sequelize;\n",
        'models/Usuario.js': "const { DataTypes } = require('sequelize');\nconst sequelize = require('../config/db');\n\nconst Usuario = sequelize.define('Usuario', {\n  nombre: { type: DataTypes.STRING, allowNull: false },\n  email: { type: DataTypes.STRING, allowNull: false, unique: true },\n  password: { type: DataTypes.STRING, allowNull: false },\n  rol: { type: DataTypes.STRING, defaultValue: 'usuario' }\n});\n\nmodule.exports = Usuario;\n",
        'models/Tarea.js': "const { DataTypes } = require('sequelize');\nconst sequelize = require('../config/db');\n\nconst Tarea = sequelize.define('Tarea', {\n  titulo: { type: DataTypes.STRING, allowNull: false },\n  hecha: { type: DataTypes.BOOLEAN, defaultValue: false },\n  usuarioId: { type: DataTypes.INTEGER, allowNull: false }\n});\n\nmodule.exports = Tarea;\n",
        'middlewares/verificarToken.js': "const jwt = require('jsonwebtoken');\n\nfunction verificarToken(req, res, next) {\n  const cabecera = req.headers['authorization'];\n  if (!cabecera || !cabecera.startsWith('Bearer ')) {\n    return res.status(401).json({ error: 'Falta el token' });\n  }\n\n  const token = cabecera.slice(7);\n  try {\n    req.usuario = jwt.verify(token, process.env.JWT_SECRET);\n    next();\n  } catch (error) {\n    return res.status(401).json({ error: 'Token inválido o vencido' });\n  }\n}\n\nmodule.exports = verificarToken;\n",
        'controllers/auth.controller.js': "const bcrypt = require('bcrypt');\nconst jwt = require('jsonwebtoken');\nconst Usuario = require('../models/Usuario');\n\nasync function registrar(req, res) {\n  const { nombre, email, password } = req.body;\n  const hash = await bcrypt.hash(password, 10);\n  const usuario = await Usuario.create({ nombre, email, password: hash });\n  res.status(201).json({ id: usuario.id, nombre: usuario.nombre, email: usuario.email });\n}\n\nasync function login(req, res) {\n  const { email, password } = req.body;\n  const usuario = await Usuario.findOne({ where: { email } });\n  if (!usuario) return res.status(401).json({ error: 'Credenciales inválidas' });\n\n  const coincide = await bcrypt.compare(password, usuario.password);\n  if (!coincide) return res.status(401).json({ error: 'Credenciales inválidas' });\n\n  const token = jwt.sign({ id: usuario.id, rol: usuario.rol }, process.env.JWT_SECRET, { expiresIn: '2h' });\n  res.json({ token });\n}\n\nasync function perfil(req, res) {\n  res.json({ id: req.usuario.id, rol: req.usuario.rol });\n}\n\nmodule.exports = { registrar, login, perfil };\n",
        'controllers/tareas.controller.js': "const Tarea = require('../models/Tarea');\n\nasync function listar(req, res) {\n  const tareas = await Tarea.findAll({ where: { usuarioId: req.usuario.id } });\n  res.json(tareas);\n}\n\nasync function crear(req, res) {\n  const tarea = await Tarea.create({ titulo: req.body.titulo, usuarioId: req.usuario.id });\n  res.status(201).json(tarea);\n}\n\nasync function actualizar(req, res) {\n  const tarea = await Tarea.findByPk(req.params.id);\n  if (!tarea || tarea.usuarioId !== req.usuario.id) {\n    return res.status(404).json({ error: 'No existe esa tarea' });\n  }\n\n  if (req.body.titulo !== undefined) tarea.titulo = req.body.titulo;\n  if (req.body.hecha !== undefined) tarea.hecha = req.body.hecha;\n  await tarea.save();\n  res.json(tarea);\n}\n\nasync function eliminar(req, res) {\n  const tarea = await Tarea.findByPk(req.params.id);\n  if (!tarea || tarea.usuarioId !== req.usuario.id) {\n    return res.status(404).json({ error: 'No existe esa tarea' });\n  }\n\n  await tarea.destroy();\n  res.status(204).send();\n}\n\nmodule.exports = { listar, crear, actualizar, eliminar };\n",
        'routes/auth.routes.js': "const express = require('express');\nconst router = express.Router();\nconst authController = require('../controllers/auth.controller');\nconst verificarToken = require('../middlewares/verificarToken');\n\nrouter.post('/registro', authController.registrar);\nrouter.post('/login', authController.login);\nrouter.get('/perfil', verificarToken, authController.perfil);\n\nmodule.exports = router;\n",
        'routes/tareas.routes.js': "const express = require('express');\nconst router = express.Router();\nconst tareasController = require('../controllers/tareas.controller');\nconst verificarToken = require('../middlewares/verificarToken');\n\nrouter.use(verificarToken);\n\nrouter.get('/', tareasController.listar);\nrouter.post('/', tareasController.crear);\nrouter.put('/:id', tareasController.actualizar);\nrouter.delete('/:id', tareasController.eliminar);\n\nmodule.exports = router;\n",
        'app.js': "require('dotenv').config();\nconst express = require('express');\nconst sequelize = require('./config/db');\nrequire('./models/Usuario');\nrequire('./models/Tarea');\nconst authRoutes = require('./routes/auth.routes');\nconst tareasRoutes = require('./routes/tareas.routes');\n\nconst app = express();\napp.use(express.json());\n\napp.use('/api/auth', authRoutes);\napp.use('/api/tareas', tareasRoutes);\n\nsequelize.authenticate()\n  .then(() => sequelize.sync())\n  .then(() => {\n    console.log('Conexión a la base de datos OK');\n    app.listen(process.env.PORT, () => {\n      console.log('Servidor escuchando en el puerto ' + process.env.PORT);\n    });\n  })\n  .catch((error) => {\n    console.error('No se pudo conectar a la base:', error.message);\n  });\n"
    },

    chequeos: [
        { fuente: { archivo: 'controllers/tareas.controller.js', debeTener: [
            { re: 'findByPk\\(', que: 'Falta buscar la tarea con Tarea.findByPk(req.params.id).' },
            { re: 'tarea\\.usuarioId\\s*!==\\s*req\\.usuario\\.id', que: 'Falta comprobar que la tarea sea del usuario logueado.' },
            { re: '\\.destroy\\(', que: 'Falta tarea.destroy() en eliminar.' }
        ] } },
        { pedido: { metodo: 'POST', ruta: '/api/auth/registro',
                    json: { nombre: 'Gina', email: 'gina@mail.com', password: 'clave2024' } },
          espera: { estado: 201 } },
        { pedido: { metodo: 'POST', ruta: '/api/auth/login',
                    json: { email: 'gina@mail.com', password: 'clave2024' } },
          espera: { estado: 200 }, guardar: { tokenGina: 'token' } },
        { pedido: { metodo: 'POST', ruta: '/api/tareas', json: { titulo: 'Lavar los platos' },
                    cabeceras: { Authorization: 'Bearer {{tokenGina}}' } },
          espera: { estado: 201 }, guardar: { idTarea: 'id' } },

        { pedido: { metodo: 'POST', ruta: '/api/auth/registro',
                    json: { nombre: 'Hugo', email: 'hugo@mail.com', password: 'clave2024' } },
          espera: { estado: 201 } },
        { pedido: { metodo: 'POST', ruta: '/api/auth/login',
                    json: { email: 'hugo@mail.com', password: 'clave2024' } },
          espera: { estado: 200 }, guardar: { tokenHugo: 'token' } },
        { pedido: { metodo: 'PUT', ruta: '/api/tareas/{{idTarea}}', json: { hecha: true },
                    cabeceras: { Authorization: 'Bearer {{tokenHugo}}' } },
          espera: { estado: 404 },
          pista: 'Hugo no es el dueño de esta tarea: tiene que dar 404, no 200 ni 403.' },
        { pedido: { metodo: 'DELETE', ruta: '/api/tareas/{{idTarea}}',
                    cabeceras: { Authorization: 'Bearer {{tokenHugo}}' } },
          espera: { estado: 404 } },

        { pedido: { metodo: 'PUT', ruta: '/api/tareas/{{idTarea}}', json: { hecha: true },
                    cabeceras: { Authorization: 'Bearer {{tokenGina}}' } },
          espera: { estado: 200, jsonParcial: { hecha: true } } },
        { pedido: { metodo: 'DELETE', ruta: '/api/tareas/{{idTarea}}',
                    cabeceras: { Authorization: 'Bearer {{tokenGina}}' } },
          espera: { estado: 204, cuerpoVacio: true } },
        { pedido: { metodo: 'GET', ruta: '/api/tareas', cabeceras: { Authorization: 'Bearer {{tokenGina}}' } },
          espera: { estado: 200, esArreglo: true, largo: 0 } }
    ]
},

{
    id: 'p12',
    titulo: 'Roles y permisos: sólo un admin ve todos los usuarios',
    minutos: 14,

    teoria: [
        { h: '401 vs. 403' },
        { p: 'Ya usaron los dos, pero ahora importa la diferencia. **401 (Unauthorized)** es "no sé quién sos": falta el token, o está roto. **403 (Forbidden)** es "sé perfectamente quién sos, y no podés hacer esto": el guard de token pasó, pero un chequeo de permiso, no.' },
        { p: 'El campo `rol` que quedó guardado en el modelo `Usuario` desde el paso 4 —y viajando adentro del JWT desde el paso 8— es la base para el segundo tipo de guard: uno que no pregunta "¿estás logueado?" sino "¿tenés el permiso que hace falta?".' },
        { codigo: "function esAdmin(req, res, next) {\n  if (req.usuario.rol !== 'admin') {\n    return res.status(403).json({ error: 'No tenés permiso para hacer esto' });\n  }\n  next();\n}\n\nmodule.exports = esAdmin;", archivo: 'middlewares/esAdmin.js' },
        { nota: '`esAdmin` asume que ya pasó `verificarToken` antes —si no, `req.usuario` ni existe—. Los guards se encadenan en el orden en que hacen falta: primero quién sos, después qué podés hacer.' },
        { codigo: "router.get('/', verificarToken, esAdmin, usuariosController.listar);", archivo: 'routes/usuarios.routes.js' },

        { h: 'El primer usuario del sistema' },
        { p: 'Ahora bien: si nadie puede registrarse como admin, ¿de dónde sale el primero? La trampa fácil sería dejar que el que se registra mande `"rol": "admin"` en el body — y ESA es precisamente la vulnerabilidad a evitar: cualquiera podría autopromoverse mandando ese campo de más. El registro de esta clase, desde el paso 5, ignora a propósito cualquier `rol` que venga en el body.' },
        { p: 'La solución de esta clase —y de bastantes sistemas reales chicos— es un arranque especial: **la primera persona que se registra en todo el sistema queda como admin**, automáticamente. Nadie lo pide, nadie lo manda por el body: se decide solo, mirando si ya hay algo en la tabla.' },
        { codigo: "async function registrar(req, res) {\n  const { nombre, email, password } = req.body;\n  const hash = await bcrypt.hash(password, 10);\n  const esPrimero = (await Usuario.count()) === 0;\n  const usuario = await Usuario.create({\n    nombre, email, password: hash,\n    rol: esPrimero ? 'admin' : 'usuario'\n  });\n  res.status(201).json({ id: usuario.id, nombre: usuario.nombre, email: usuario.email });\n}", archivo: 'controllers/auth.controller.js' },
        { clave: '`Model.count(opciones)` devuelve, async, cuántas filas hay (con `where` opcional, para contar sólo un subconjunto). Acá cuenta la tabla entera: si da 0, no hay nadie todavía, así que quien se está registrando es el primero.' }
    ],

    consigna: [
        { p: 'Modificá `registrar` para que la primera persona registrada quede como `rol: \'admin\'`. Creá `middlewares/esAdmin.js`, `controllers/usuarios.controller.js` (con `listar`, que devuelva `id`, `nombre`, `email` y `rol` de todos los usuarios, nunca la contraseña) y `routes/usuarios.routes.js` con `GET /` protegido por los dos guards. Montalo en `app.js` bajo `/api/usuarios`.' },
        { terminal: "curl http://localhost:3000/api/usuarios -H \"Authorization: Bearer <token>\"" }
    ],

    consolaSugerida: ['node app.js'],
    probar: [{ metodo: 'GET', ruta: '/api/usuarios' }],

    solucion: {
        '.env': 'PORT=3000\nJWT_SECRET=cambiame-por-un-secreto-largo-y-dificil-de-adivinar\nDB_NAME=api_tareas\n',
        'config/db.js': "const { Sequelize } = require('sequelize');\n\nconst sequelize = new Sequelize(process.env.DB_NAME);\n\nmodule.exports = sequelize;\n",
        'models/Usuario.js': "const { DataTypes } = require('sequelize');\nconst sequelize = require('../config/db');\n\nconst Usuario = sequelize.define('Usuario', {\n  nombre: { type: DataTypes.STRING, allowNull: false },\n  email: { type: DataTypes.STRING, allowNull: false, unique: true },\n  password: { type: DataTypes.STRING, allowNull: false },\n  rol: { type: DataTypes.STRING, defaultValue: 'usuario' }\n});\n\nmodule.exports = Usuario;\n",
        'models/Tarea.js': "const { DataTypes } = require('sequelize');\nconst sequelize = require('../config/db');\n\nconst Tarea = sequelize.define('Tarea', {\n  titulo: { type: DataTypes.STRING, allowNull: false },\n  hecha: { type: DataTypes.BOOLEAN, defaultValue: false },\n  usuarioId: { type: DataTypes.INTEGER, allowNull: false }\n});\n\nmodule.exports = Tarea;\n",
        'middlewares/verificarToken.js': "const jwt = require('jsonwebtoken');\n\nfunction verificarToken(req, res, next) {\n  const cabecera = req.headers['authorization'];\n  if (!cabecera || !cabecera.startsWith('Bearer ')) {\n    return res.status(401).json({ error: 'Falta el token' });\n  }\n\n  const token = cabecera.slice(7);\n  try {\n    req.usuario = jwt.verify(token, process.env.JWT_SECRET);\n    next();\n  } catch (error) {\n    return res.status(401).json({ error: 'Token inválido o vencido' });\n  }\n}\n\nmodule.exports = verificarToken;\n",
        'middlewares/esAdmin.js': "function esAdmin(req, res, next) {\n  if (req.usuario.rol !== 'admin') {\n    return res.status(403).json({ error: 'No tenés permiso para hacer esto' });\n  }\n  next();\n}\n\nmodule.exports = esAdmin;\n",
        'controllers/auth.controller.js': "const bcrypt = require('bcrypt');\nconst jwt = require('jsonwebtoken');\nconst Usuario = require('../models/Usuario');\n\nasync function registrar(req, res) {\n  const { nombre, email, password } = req.body;\n  const hash = await bcrypt.hash(password, 10);\n  const esPrimero = (await Usuario.count()) === 0;\n  const usuario = await Usuario.create({\n    nombre, email, password: hash,\n    rol: esPrimero ? 'admin' : 'usuario'\n  });\n  res.status(201).json({ id: usuario.id, nombre: usuario.nombre, email: usuario.email });\n}\n\nasync function login(req, res) {\n  const { email, password } = req.body;\n  const usuario = await Usuario.findOne({ where: { email } });\n  if (!usuario) return res.status(401).json({ error: 'Credenciales inválidas' });\n\n  const coincide = await bcrypt.compare(password, usuario.password);\n  if (!coincide) return res.status(401).json({ error: 'Credenciales inválidas' });\n\n  const token = jwt.sign({ id: usuario.id, rol: usuario.rol }, process.env.JWT_SECRET, { expiresIn: '2h' });\n  res.json({ token });\n}\n\nasync function perfil(req, res) {\n  res.json({ id: req.usuario.id, rol: req.usuario.rol });\n}\n\nmodule.exports = { registrar, login, perfil };\n",
        'controllers/tareas.controller.js': "const Tarea = require('../models/Tarea');\n\nasync function listar(req, res) {\n  const tareas = await Tarea.findAll({ where: { usuarioId: req.usuario.id } });\n  res.json(tareas);\n}\n\nasync function crear(req, res) {\n  const tarea = await Tarea.create({ titulo: req.body.titulo, usuarioId: req.usuario.id });\n  res.status(201).json(tarea);\n}\n\nasync function actualizar(req, res) {\n  const tarea = await Tarea.findByPk(req.params.id);\n  if (!tarea || tarea.usuarioId !== req.usuario.id) {\n    return res.status(404).json({ error: 'No existe esa tarea' });\n  }\n\n  if (req.body.titulo !== undefined) tarea.titulo = req.body.titulo;\n  if (req.body.hecha !== undefined) tarea.hecha = req.body.hecha;\n  await tarea.save();\n  res.json(tarea);\n}\n\nasync function eliminar(req, res) {\n  const tarea = await Tarea.findByPk(req.params.id);\n  if (!tarea || tarea.usuarioId !== req.usuario.id) {\n    return res.status(404).json({ error: 'No existe esa tarea' });\n  }\n\n  await tarea.destroy();\n  res.status(204).send();\n}\n\nmodule.exports = { listar, crear, actualizar, eliminar };\n",
        'controllers/usuarios.controller.js': "const Usuario = require('../models/Usuario');\n\nasync function listar(req, res) {\n  const usuarios = await Usuario.findAll();\n  res.json(usuarios.map((u) => ({ id: u.id, nombre: u.nombre, email: u.email, rol: u.rol })));\n}\n\nmodule.exports = { listar };\n",
        'routes/auth.routes.js': "const express = require('express');\nconst router = express.Router();\nconst authController = require('../controllers/auth.controller');\nconst verificarToken = require('../middlewares/verificarToken');\n\nrouter.post('/registro', authController.registrar);\nrouter.post('/login', authController.login);\nrouter.get('/perfil', verificarToken, authController.perfil);\n\nmodule.exports = router;\n",
        'routes/tareas.routes.js': "const express = require('express');\nconst router = express.Router();\nconst tareasController = require('../controllers/tareas.controller');\nconst verificarToken = require('../middlewares/verificarToken');\n\nrouter.use(verificarToken);\n\nrouter.get('/', tareasController.listar);\nrouter.post('/', tareasController.crear);\nrouter.put('/:id', tareasController.actualizar);\nrouter.delete('/:id', tareasController.eliminar);\n\nmodule.exports = router;\n",
        'routes/usuarios.routes.js': "const express = require('express');\nconst router = express.Router();\nconst usuariosController = require('../controllers/usuarios.controller');\nconst verificarToken = require('../middlewares/verificarToken');\nconst esAdmin = require('../middlewares/esAdmin');\n\nrouter.get('/', verificarToken, esAdmin, usuariosController.listar);\n\nmodule.exports = router;\n",
        'app.js': "require('dotenv').config();\nconst express = require('express');\nconst sequelize = require('./config/db');\nrequire('./models/Usuario');\nrequire('./models/Tarea');\nconst authRoutes = require('./routes/auth.routes');\nconst tareasRoutes = require('./routes/tareas.routes');\nconst usuariosRoutes = require('./routes/usuarios.routes');\n\nconst app = express();\napp.use(express.json());\n\napp.use('/api/auth', authRoutes);\napp.use('/api/tareas', tareasRoutes);\napp.use('/api/usuarios', usuariosRoutes);\n\nsequelize.authenticate()\n  .then(() => sequelize.sync())\n  .then(() => {\n    console.log('Conexión a la base de datos OK');\n    app.listen(process.env.PORT, () => {\n      console.log('Servidor escuchando en el puerto ' + process.env.PORT);\n    });\n  })\n  .catch((error) => {\n    console.error('No se pudo conectar a la base:', error.message);\n  });\n"
    },

    chequeos: [
        { fuente: { archivo: 'middlewares/esAdmin.js', debeTener: [
            { re: "req\\.usuario\\.rol", que: 'Falta comprobar req.usuario.rol.' }
        ] } },
        { fuente: { archivo: 'controllers/auth.controller.js', debeTener: [
            { re: 'count\\(', que: 'Falta Usuario.count() para saber si es el primer usuario del sistema.' }
        ] } },
        { fuente: { archivo: 'routes/usuarios.routes.js', debeTener: [
            { re: 'esAdmin', que: 'La ruta tiene que estar protegida también por esAdmin.' }
        ] } },
        { pedido: { metodo: 'POST', ruta: '/api/auth/registro',
                    json: { nombre: 'Admin', email: 'admin@mail.com', password: 'clave2024' } },
          espera: { estado: 201 } },
        { pedido: { metodo: 'POST', ruta: '/api/auth/login',
                    json: { email: 'admin@mail.com', password: 'clave2024' } },
          espera: { estado: 200 }, guardar: { tokenAdmin: 'token' } },
        { pedido: { metodo: 'POST', ruta: '/api/auth/registro',
                    json: { nombre: 'Ines', email: 'ines@mail.com', password: 'clave2024' } },
          espera: { estado: 201 } },
        { pedido: { metodo: 'POST', ruta: '/api/auth/login',
                    json: { email: 'ines@mail.com', password: 'clave2024' } },
          espera: { estado: 200 }, guardar: { tokenUsuaria: 'token' } },
        { pedido: { metodo: 'GET', ruta: '/api/usuarios', cabeceras: { Authorization: 'Bearer {{tokenUsuaria}}' } },
          espera: { estado: 403 },
          pista: 'Un usuario común no tiene que poder ver la lista completa de usuarios.' },
        { pedido: { metodo: 'GET', ruta: '/api/usuarios', cabeceras: { Authorization: 'Bearer {{tokenAdmin}}' } },
          espera: { estado: 200, esArreglo: true, largo: 2, sinCampos: ['password'] },
          pista: 'El primer usuario registrado tiene que haber quedado como admin.' },
        { pedido: { metodo: 'POST', ruta: '/api/auth/registro',
                    json: { nombre: 'Kevin', email: 'kevin@mail.com', password: 'clave2024', rol: 'admin' } },
          espera: { estado: 201 } },
        { pedido: { metodo: 'POST', ruta: '/api/auth/login',
                    json: { email: 'kevin@mail.com', password: 'clave2024' } },
          espera: { estado: 200 }, guardar: { tokenKevin: 'token' } },
        { pedido: { metodo: 'GET', ruta: '/api/usuarios', cabeceras: { Authorization: 'Bearer {{tokenKevin}}' } },
          espera: { estado: 403 },
          pista: 'Kevin mandó "rol":"admin" en el registro. Ese campo se tiene que ignorar: no es el primer ' +
                 'usuario, así que tiene que quedar como usuario común.' }
    ]
},

{
    id: 'p13',
    titulo: 'Manejo de errores centralizado',
    minutos: 12,

    teoria: [
        { h: 'Un solo lugar para lo que se rompe' },
        { p: 'Hasta acá, cada controller decide su propio 400/401/403/404. Pero algo puede fallar de formas que ningún `if` anticipó: un bug, un tipo de dato inesperado, algo que la clase ni pensó. Ese error termina en el middleware de **cuatro parámetros** —lo vieron en la clase anterior— si lo hay al final de la cadena.' },
        { codigo: "app.use((error, req, res, next) => {\n  console.error(error);\n  res.status(error.status || 500).json({ error: 'Algo salió mal' });\n});", archivo: 'app.js' },
        { p: 'Va **al final de todo**, después de montar todos los routers: si nadie más atendió el error, éste es el último cartel antes de que la respuesta salga.' },

        { h: 'Por qué ya funciona con los controllers async' },
        { p: 'En la clase de Express, un middleware normal que tiraba una excepción quedaba atajado automáticamente y mandado a este tipo de middleware. Acá pasa lo mismo con los controllers `async`: si una promesa dentro de un `await` se rechaza y nadie puso su propio `try/catch`, el motor de esta clase la manda sola al error-handler — es el comportamiento de las versiones modernas de Express. (En Express 4 clásico, cada handler async necesita su propio `try/catch` o un wrapper; en Express 5 en adelante es automático, como acá.)' },
        { nota: 'El `console.error(error)` es a propósito ANTES de responder: el detalle completo del error queda en la consola del servidor, para quien lo esté operando. Lo que recibe el cliente es genérico — nunca un stack trace ni el mensaje crudo, que podrían regalar información sobre cómo está armado el sistema por dentro.' },
        { clave: '`error.status` es el mismo campo que usa `express.json()` cuando el body no es JSON válido (lo vieron en la clase anterior): si el error trae uno, se respeta; si no, 500 por default.' }
    ],

    consigna: [
        { p: 'Agregá el middleware de errores al final de `app.js`, después de montar los tres routers.' },
        { terminal: "curl -X POST http://localhost:3000/api/auth/login -H \"Content-Type: application/json\" -d '{esto no es json'" }
    ],

    consolaSugerida: ['node app.js'],

    solucion: {
        '.env': 'PORT=3000\nJWT_SECRET=cambiame-por-un-secreto-largo-y-dificil-de-adivinar\nDB_NAME=api_tareas\n',
        'config/db.js': "const { Sequelize } = require('sequelize');\n\nconst sequelize = new Sequelize(process.env.DB_NAME);\n\nmodule.exports = sequelize;\n",
        'models/Usuario.js': "const { DataTypes } = require('sequelize');\nconst sequelize = require('../config/db');\n\nconst Usuario = sequelize.define('Usuario', {\n  nombre: { type: DataTypes.STRING, allowNull: false },\n  email: { type: DataTypes.STRING, allowNull: false, unique: true },\n  password: { type: DataTypes.STRING, allowNull: false },\n  rol: { type: DataTypes.STRING, defaultValue: 'usuario' }\n});\n\nmodule.exports = Usuario;\n",
        'models/Tarea.js': "const { DataTypes } = require('sequelize');\nconst sequelize = require('../config/db');\n\nconst Tarea = sequelize.define('Tarea', {\n  titulo: { type: DataTypes.STRING, allowNull: false },\n  hecha: { type: DataTypes.BOOLEAN, defaultValue: false },\n  usuarioId: { type: DataTypes.INTEGER, allowNull: false }\n});\n\nmodule.exports = Tarea;\n",
        'middlewares/verificarToken.js': "const jwt = require('jsonwebtoken');\n\nfunction verificarToken(req, res, next) {\n  const cabecera = req.headers['authorization'];\n  if (!cabecera || !cabecera.startsWith('Bearer ')) {\n    return res.status(401).json({ error: 'Falta el token' });\n  }\n\n  const token = cabecera.slice(7);\n  try {\n    req.usuario = jwt.verify(token, process.env.JWT_SECRET);\n    next();\n  } catch (error) {\n    return res.status(401).json({ error: 'Token inválido o vencido' });\n  }\n}\n\nmodule.exports = verificarToken;\n",
        'middlewares/esAdmin.js': "function esAdmin(req, res, next) {\n  if (req.usuario.rol !== 'admin') {\n    return res.status(403).json({ error: 'No tenés permiso para hacer esto' });\n  }\n  next();\n}\n\nmodule.exports = esAdmin;\n",
        'controllers/auth.controller.js': "const bcrypt = require('bcrypt');\nconst jwt = require('jsonwebtoken');\nconst Usuario = require('../models/Usuario');\n\nasync function registrar(req, res) {\n  const { nombre, email, password } = req.body;\n  const hash = await bcrypt.hash(password, 10);\n  const esPrimero = (await Usuario.count()) === 0;\n  const usuario = await Usuario.create({\n    nombre, email, password: hash,\n    rol: esPrimero ? 'admin' : 'usuario'\n  });\n  res.status(201).json({ id: usuario.id, nombre: usuario.nombre, email: usuario.email });\n}\n\nasync function login(req, res) {\n  const { email, password } = req.body;\n  const usuario = await Usuario.findOne({ where: { email } });\n  if (!usuario) return res.status(401).json({ error: 'Credenciales inválidas' });\n\n  const coincide = await bcrypt.compare(password, usuario.password);\n  if (!coincide) return res.status(401).json({ error: 'Credenciales inválidas' });\n\n  const token = jwt.sign({ id: usuario.id, rol: usuario.rol }, process.env.JWT_SECRET, { expiresIn: '2h' });\n  res.json({ token });\n}\n\nasync function perfil(req, res) {\n  res.json({ id: req.usuario.id, rol: req.usuario.rol });\n}\n\nmodule.exports = { registrar, login, perfil };\n",
        'controllers/tareas.controller.js': "const Tarea = require('../models/Tarea');\n\nasync function listar(req, res) {\n  const tareas = await Tarea.findAll({ where: { usuarioId: req.usuario.id } });\n  res.json(tareas);\n}\n\nasync function crear(req, res) {\n  const tarea = await Tarea.create({ titulo: req.body.titulo, usuarioId: req.usuario.id });\n  res.status(201).json(tarea);\n}\n\nasync function actualizar(req, res) {\n  const tarea = await Tarea.findByPk(req.params.id);\n  if (!tarea || tarea.usuarioId !== req.usuario.id) {\n    return res.status(404).json({ error: 'No existe esa tarea' });\n  }\n\n  if (req.body.titulo !== undefined) tarea.titulo = req.body.titulo;\n  if (req.body.hecha !== undefined) tarea.hecha = req.body.hecha;\n  await tarea.save();\n  res.json(tarea);\n}\n\nasync function eliminar(req, res) {\n  const tarea = await Tarea.findByPk(req.params.id);\n  if (!tarea || tarea.usuarioId !== req.usuario.id) {\n    return res.status(404).json({ error: 'No existe esa tarea' });\n  }\n\n  await tarea.destroy();\n  res.status(204).send();\n}\n\nmodule.exports = { listar, crear, actualizar, eliminar };\n",
        'controllers/usuarios.controller.js': "const Usuario = require('../models/Usuario');\n\nasync function listar(req, res) {\n  const usuarios = await Usuario.findAll();\n  res.json(usuarios.map((u) => ({ id: u.id, nombre: u.nombre, email: u.email, rol: u.rol })));\n}\n\nmodule.exports = { listar };\n",
        'routes/auth.routes.js': "const express = require('express');\nconst router = express.Router();\nconst authController = require('../controllers/auth.controller');\nconst verificarToken = require('../middlewares/verificarToken');\n\nrouter.post('/registro', authController.registrar);\nrouter.post('/login', authController.login);\nrouter.get('/perfil', verificarToken, authController.perfil);\n\nmodule.exports = router;\n",
        'routes/tareas.routes.js': "const express = require('express');\nconst router = express.Router();\nconst tareasController = require('../controllers/tareas.controller');\nconst verificarToken = require('../middlewares/verificarToken');\n\nrouter.use(verificarToken);\n\nrouter.get('/', tareasController.listar);\nrouter.post('/', tareasController.crear);\nrouter.put('/:id', tareasController.actualizar);\nrouter.delete('/:id', tareasController.eliminar);\n\nmodule.exports = router;\n",
        'routes/usuarios.routes.js': "const express = require('express');\nconst router = express.Router();\nconst usuariosController = require('../controllers/usuarios.controller');\nconst verificarToken = require('../middlewares/verificarToken');\nconst esAdmin = require('../middlewares/esAdmin');\n\nrouter.get('/', verificarToken, esAdmin, usuariosController.listar);\n\nmodule.exports = router;\n",
        'app.js': "require('dotenv').config();\nconst express = require('express');\nconst sequelize = require('./config/db');\nrequire('./models/Usuario');\nrequire('./models/Tarea');\nconst authRoutes = require('./routes/auth.routes');\nconst tareasRoutes = require('./routes/tareas.routes');\nconst usuariosRoutes = require('./routes/usuarios.routes');\n\nconst app = express();\napp.use(express.json());\n\napp.use('/api/auth', authRoutes);\napp.use('/api/tareas', tareasRoutes);\napp.use('/api/usuarios', usuariosRoutes);\n\napp.use((error, req, res, next) => {\n  console.error(error);\n  res.status(error.status || 500).json({ error: 'Algo salió mal' });\n});\n\nsequelize.authenticate()\n  .then(() => sequelize.sync())\n  .then(() => {\n    console.log('Conexión a la base de datos OK');\n    app.listen(process.env.PORT, () => {\n      console.log('Servidor escuchando en el puerto ' + process.env.PORT);\n    });\n  })\n  .catch((error) => {\n    console.error('No se pudo conectar a la base:', error.message);\n  });\n"
    },

    chequeos: [
        { fuente: { debeTener: [
            { re: '\\(\\s*(error|err)\\s*,\\s*req\\s*,\\s*res\\s*,\\s*next\\s*\\)', que: 'Falta un middleware con los cuatro parámetros (error, req, res, next).' },
            { re: 'res\\.status\\(\\s*(error|err)\\.status', que: 'El middleware de errores tiene que usar error.status si vino, y 500 si no.' }
        ] } },
        { pedido: { metodo: 'POST', ruta: '/api/auth/login', texto: '{esto no es json',
                    cabeceras: { 'Content-Type': 'application/json' } },
          espera: { estado: 400 },
          pista: 'Un body que no es JSON válido tiene que llegar al error-handler con status 400, no 500.' }
    ]
},

{
    id: 'p14',
    titulo: 'Desafío: marcar todas las tareas como hechas',
    minutos: 20,

    teoria: [
        { h: 'Lo que ya tienen' },
        { p: 'Repasando: arquitectura en capas (`routes` → `controllers` → `models`), variables de entorno con `dotenv`, conexión a una base con Sequelize, contraseñas hasheadas con `bcrypt`, sesión sin estado con JWT, un guard que exige el token, un segundo guard que exige un rol, un recurso protegido con dueño, y un manejador de errores centralizado. Es, pieza por pieza, la misma forma que tiene una API profesional de verdad.' },
        { h: 'El desafío' },
        { p: 'Sin ejemplo de código esta vez: arme el endpoint con lo que ya sabe.' },
        { numerada: [
            'Un endpoint `PATCH /api/tareas/completar-todas`, protegido (como el resto de `/api/tareas`).',
            'Marca `hecha: true` en TODAS las tareas del usuario logueado — ni una de otro usuario.',
            'Devuelve `{ actualizadas: <cantidad> }`, con la cantidad real de tareas que tenía esa persona.'
        ] },
        { nota: '`Model.update(datos, { where })` actualiza todas las filas que matchean el `where` de una sola vez, y devuelve (async) un arreglo cuyo primer elemento es la cantidad de filas afectadas: `const [cantidad] = await Tarea.update({ hecha: true }, { where: { usuarioId: req.usuario.id } });`' },
        { clave: 'Fíjense que ni siquiera hace falta un `findAll` primero: `update` con un `where` bien puesto actualiza en una sola operación, la misma idea que ya usaron para armar cada `where` de esta clase.' }
    ],

    consigna: [
        { p: 'Agregá `completarTodas` a `controllers/tareas.controller.js` y la ruta `PATCH /completar-todas` en `routes/tareas.routes.js`. Probalo: creá un par de tareas, marcá todas como hechas de una, y confirmá con un `GET /api/tareas` que ninguna quedó con `hecha: false`.' },
        { terminal: "curl -X PATCH http://localhost:3000/api/tareas/completar-todas -H \"Authorization: Bearer <token>\"" }
    ],

    consolaSugerida: ['node app.js'],
    probar: [{ metodo: 'PATCH', ruta: '/api/tareas/completar-todas' }],

    solucion: {
        '.env': 'PORT=3000\nJWT_SECRET=cambiame-por-un-secreto-largo-y-dificil-de-adivinar\nDB_NAME=api_tareas\n',
        'config/db.js': "const { Sequelize } = require('sequelize');\n\nconst sequelize = new Sequelize(process.env.DB_NAME);\n\nmodule.exports = sequelize;\n",
        'models/Usuario.js': "const { DataTypes } = require('sequelize');\nconst sequelize = require('../config/db');\n\nconst Usuario = sequelize.define('Usuario', {\n  nombre: { type: DataTypes.STRING, allowNull: false },\n  email: { type: DataTypes.STRING, allowNull: false, unique: true },\n  password: { type: DataTypes.STRING, allowNull: false },\n  rol: { type: DataTypes.STRING, defaultValue: 'usuario' }\n});\n\nmodule.exports = Usuario;\n",
        'models/Tarea.js': "const { DataTypes } = require('sequelize');\nconst sequelize = require('../config/db');\n\nconst Tarea = sequelize.define('Tarea', {\n  titulo: { type: DataTypes.STRING, allowNull: false },\n  hecha: { type: DataTypes.BOOLEAN, defaultValue: false },\n  usuarioId: { type: DataTypes.INTEGER, allowNull: false }\n});\n\nmodule.exports = Tarea;\n",
        'middlewares/verificarToken.js': "const jwt = require('jsonwebtoken');\n\nfunction verificarToken(req, res, next) {\n  const cabecera = req.headers['authorization'];\n  if (!cabecera || !cabecera.startsWith('Bearer ')) {\n    return res.status(401).json({ error: 'Falta el token' });\n  }\n\n  const token = cabecera.slice(7);\n  try {\n    req.usuario = jwt.verify(token, process.env.JWT_SECRET);\n    next();\n  } catch (error) {\n    return res.status(401).json({ error: 'Token inválido o vencido' });\n  }\n}\n\nmodule.exports = verificarToken;\n",
        'middlewares/esAdmin.js': "function esAdmin(req, res, next) {\n  if (req.usuario.rol !== 'admin') {\n    return res.status(403).json({ error: 'No tenés permiso para hacer esto' });\n  }\n  next();\n}\n\nmodule.exports = esAdmin;\n",
        'controllers/auth.controller.js': "const bcrypt = require('bcrypt');\nconst jwt = require('jsonwebtoken');\nconst Usuario = require('../models/Usuario');\n\nasync function registrar(req, res) {\n  const { nombre, email, password } = req.body;\n  const hash = await bcrypt.hash(password, 10);\n  const esPrimero = (await Usuario.count()) === 0;\n  const usuario = await Usuario.create({\n    nombre, email, password: hash,\n    rol: esPrimero ? 'admin' : 'usuario'\n  });\n  res.status(201).json({ id: usuario.id, nombre: usuario.nombre, email: usuario.email });\n}\n\nasync function login(req, res) {\n  const { email, password } = req.body;\n  const usuario = await Usuario.findOne({ where: { email } });\n  if (!usuario) return res.status(401).json({ error: 'Credenciales inválidas' });\n\n  const coincide = await bcrypt.compare(password, usuario.password);\n  if (!coincide) return res.status(401).json({ error: 'Credenciales inválidas' });\n\n  const token = jwt.sign({ id: usuario.id, rol: usuario.rol }, process.env.JWT_SECRET, { expiresIn: '2h' });\n  res.json({ token });\n}\n\nasync function perfil(req, res) {\n  res.json({ id: req.usuario.id, rol: req.usuario.rol });\n}\n\nmodule.exports = { registrar, login, perfil };\n",
        'controllers/tareas.controller.js': "const Tarea = require('../models/Tarea');\n\nasync function listar(req, res) {\n  const tareas = await Tarea.findAll({ where: { usuarioId: req.usuario.id } });\n  res.json(tareas);\n}\n\nasync function crear(req, res) {\n  const tarea = await Tarea.create({ titulo: req.body.titulo, usuarioId: req.usuario.id });\n  res.status(201).json(tarea);\n}\n\nasync function actualizar(req, res) {\n  const tarea = await Tarea.findByPk(req.params.id);\n  if (!tarea || tarea.usuarioId !== req.usuario.id) {\n    return res.status(404).json({ error: 'No existe esa tarea' });\n  }\n\n  if (req.body.titulo !== undefined) tarea.titulo = req.body.titulo;\n  if (req.body.hecha !== undefined) tarea.hecha = req.body.hecha;\n  await tarea.save();\n  res.json(tarea);\n}\n\nasync function eliminar(req, res) {\n  const tarea = await Tarea.findByPk(req.params.id);\n  if (!tarea || tarea.usuarioId !== req.usuario.id) {\n    return res.status(404).json({ error: 'No existe esa tarea' });\n  }\n\n  await tarea.destroy();\n  res.status(204).send();\n}\n\nasync function completarTodas(req, res) {\n  const [cantidad] = await Tarea.update(\n    { hecha: true },\n    { where: { usuarioId: req.usuario.id } }\n  );\n  res.json({ actualizadas: cantidad });\n}\n\nmodule.exports = { listar, crear, actualizar, eliminar, completarTodas };\n",
        'controllers/usuarios.controller.js': "const Usuario = require('../models/Usuario');\n\nasync function listar(req, res) {\n  const usuarios = await Usuario.findAll();\n  res.json(usuarios.map((u) => ({ id: u.id, nombre: u.nombre, email: u.email, rol: u.rol })));\n}\n\nmodule.exports = { listar };\n",
        'routes/auth.routes.js': "const express = require('express');\nconst router = express.Router();\nconst authController = require('../controllers/auth.controller');\nconst verificarToken = require('../middlewares/verificarToken');\n\nrouter.post('/registro', authController.registrar);\nrouter.post('/login', authController.login);\nrouter.get('/perfil', verificarToken, authController.perfil);\n\nmodule.exports = router;\n",
        'routes/tareas.routes.js': "const express = require('express');\nconst router = express.Router();\nconst tareasController = require('../controllers/tareas.controller');\nconst verificarToken = require('../middlewares/verificarToken');\n\nrouter.use(verificarToken);\n\nrouter.get('/', tareasController.listar);\nrouter.post('/', tareasController.crear);\nrouter.put('/:id', tareasController.actualizar);\nrouter.delete('/:id', tareasController.eliminar);\nrouter.patch('/completar-todas', tareasController.completarTodas);\n\nmodule.exports = router;\n",
        'routes/usuarios.routes.js': "const express = require('express');\nconst router = express.Router();\nconst usuariosController = require('../controllers/usuarios.controller');\nconst verificarToken = require('../middlewares/verificarToken');\nconst esAdmin = require('../middlewares/esAdmin');\n\nrouter.get('/', verificarToken, esAdmin, usuariosController.listar);\n\nmodule.exports = router;\n",
        'app.js': "require('dotenv').config();\nconst express = require('express');\nconst sequelize = require('./config/db');\nrequire('./models/Usuario');\nrequire('./models/Tarea');\nconst authRoutes = require('./routes/auth.routes');\nconst tareasRoutes = require('./routes/tareas.routes');\nconst usuariosRoutes = require('./routes/usuarios.routes');\n\nconst app = express();\napp.use(express.json());\n\napp.use('/api/auth', authRoutes);\napp.use('/api/tareas', tareasRoutes);\napp.use('/api/usuarios', usuariosRoutes);\n\napp.use((error, req, res, next) => {\n  console.error(error);\n  res.status(error.status || 500).json({ error: 'Algo salió mal' });\n});\n\nsequelize.authenticate()\n  .then(() => sequelize.sync())\n  .then(() => {\n    console.log('Conexión a la base de datos OK');\n    app.listen(process.env.PORT, () => {\n      console.log('Servidor escuchando en el puerto ' + process.env.PORT);\n    });\n  })\n  .catch((error) => {\n    console.error('No se pudo conectar a la base:', error.message);\n  });\n\nmodule.exports = app;\n"
    },

    chequeos: [
        { fuente: { archivo: 'controllers/tareas.controller.js', debeTener: [
            { re: '\\.update\\(', que: 'Falta Tarea.update({ hecha: true }, { where: { usuarioId: req.usuario.id } }).' }
        ] } },
        { fuente: { archivo: 'routes/tareas.routes.js', debeTener: [
            { re: "router\\.patch\\(\\s*['\"]\\/completar-todas['\"]", que: "Falta router.patch('/completar-todas', ...)." }
        ] } },
        { pedido: { metodo: 'POST', ruta: '/api/auth/registro',
                    json: { nombre: 'Julia', email: 'julia@mail.com', password: 'clave2024' } },
          espera: { estado: 201 } },
        { pedido: { metodo: 'POST', ruta: '/api/auth/login',
                    json: { email: 'julia@mail.com', password: 'clave2024' } },
          espera: { estado: 200 }, guardar: { token: 'token' } },
        { pedido: { metodo: 'POST', ruta: '/api/tareas', json: { titulo: 'Uno' },
                    cabeceras: { Authorization: 'Bearer {{token}}' } },
          espera: { estado: 201 } },
        { pedido: { metodo: 'POST', ruta: '/api/tareas', json: { titulo: 'Dos' },
                    cabeceras: { Authorization: 'Bearer {{token}}' } },
          espera: { estado: 201 } },
        { pedido: { metodo: 'PATCH', ruta: '/api/tareas/completar-todas',
                    cabeceras: { Authorization: 'Bearer {{token}}' } },
          espera: { estado: 200, jsonParcial: { actualizadas: 2 } } },
        { pedido: { metodo: 'GET', ruta: '/api/tareas', cabeceras: { Authorization: 'Bearer {{token}}' } },
          espera: { estado: 200, esArreglo: true, largo: 2, noContieneObjeto: { hecha: false } },
          pista: 'Ninguna tarea puede haber quedado con hecha: false.' }
    ]
}

];
