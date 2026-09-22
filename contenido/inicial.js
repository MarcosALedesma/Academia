CONTENIDO.inicial = [

{
    id: 'p01',
    titulo: 'El proyecto',
    minutos: 10,

    teoria: [
        { h: 'Qué estamos por hacer' },
        { p: 'Hasta ahora todo lo que programaron corre **en la máquina del que lo usa**: abrís la página y el JavaScript se ejecuta en tu navegador. Hoy cambiamos de lado. Vamos a escribir un programa que se queda **prendido, esperando**, y que le contesta a cualquiera que le pregunte algo.' },
        { p: 'Eso es un servidor. Y lo que vamos a construir es una **API**: un servidor que no devuelve páginas para mirar, sino **datos para que otro programa los use**.' },

        { h: 'Cliente y servidor, en criollo' },
        { p: 'El **cliente** pregunta. El **servidor** contesta. El cliente puede ser un navegador, una app de celular, otro servidor, o el `curl` que vamos a usar en la consola de acá al lado. Al servidor no le importa quién sea.' },
        { p: 'Cada pregunta viaja por HTTP y tiene siempre las mismas dos partes:' },
        { tabla: {
            cabeceras: ['Parte', 'Qué es', 'Ejemplo'],
            filas: [
                ['Método', 'Qué querés hacer', 'GET, POST, PUT, DELETE'],
                ['Ruta', 'Con qué cosa', '/api/alumnos, /api/alumnos/3']
            ]
        } },
        { p: 'Y cada respuesta también trae siempre dos partes: un **código de estado** (un número: 200 salió bien, 404 no existe) y un **cuerpo** (el dato en sí, normalmente en JSON).' },
        { clave: '`GET /api/alumnos` no es una dirección de una página. Es una **frase**: "dame la lista de alumnos". El método es el verbo y la ruta es el sustantivo.' },

        { h: 'Node y Express' },
        { p: '**Node.js** es lo que permite correr JavaScript afuera del navegador, como un programa cualquiera de la computadora. Node solo ya sabe atender pedidos HTTP, pero hacerlo a mano es tedioso: hay que leer el pedido carácter por carácter, mirar la ruta, armar la respuesta.' },
        { p: '**Express** es una biblioteca que se ocupa de todo eso. Con Express, atender un pedido es escribir una línea que dice "cuando llegue un GET a esta ruta, corré esta función".' },
        { p: 'Express **no viene con Node**. Es un paquete que se baja de internet con **npm**, el instalador de paquetes que viene con Node. Por eso el primer paso de cualquier proyecto es siempre el mismo: crear el proyecto e instalar lo que hace falta.' },

        { h: 'Los dos comandos de siempre' },
        { p: '`npm init -y` crea el archivo `package.json`, que es la ficha del proyecto: cómo se llama, qué versión tiene y —lo importante— **qué paquetes necesita**. El `-y` es para que no pregunte nada y ponga los valores por defecto.' },
        { p: '`npm install express` baja Express, lo deja en una carpeta llamada `node_modules` y lo anota en el `package.json`. Ese anotarlo es todo el punto: el que reciba tu proyecto no necesita tu `node_modules`, le alcanza con hacer `npm install` y npm lee la lista.' },
        { nota: 'Por eso `node_modules` nunca se sube a un repositorio y siempre va en el `.gitignore`: son miles de archivos que se pueden volver a bajar en diez segundos.' }
    ],

    consigna: [
        { p: 'En la consola de la derecha, escribí estos dos comandos, uno por vez, y mirá lo que contesta cada uno:' },
        { terminal: 'npm init -y\nnpm install express' },
        { p: 'Después probá `ls` para ver los archivos que te quedaron, y `cat package.json` para leer la ficha del proyecto. Fijate que Express quedó anotado en `dependencies`.' }
    ],

    consolaSugerida: ['npm init -y', 'npm install express', 'ls', 'cat package.json'],

    chequeos: [
        { entorno: { archivoExiste: 'package.json' },
          pista: 'Te falta crear el proyecto: escribí  npm init -y  en la consola.' },
        { entorno: { instalado: 'express' },
          pista: 'Todavía no instalaste Express: escribí  npm install express  en la consola.' }
    ]
},

{
    id: 'p02',
    titulo: 'El servidor mínimo',
    minutos: 10,

    teoria: [
        { h: 'Tres líneas y ya hay servidor' },
        { p: 'Un servidor de Express arranca siempre igual, con tres movimientos:' },
        { codigo: 'const express = require(\'express\');   // 1. traer la biblioteca\nconst app = express();                 // 2. crear la aplicación\napp.listen(3000);                      // 3. quedarse escuchando', archivo: 'la idea' },

        { p: '**`require(\'express\')`** es cómo Node importa algo. Le pedís un paquete por nombre y te devuelve lo que ese paquete exporta. En el caso de Express, lo que te devuelve es una función.' },
        { p: '**`express()`** llama a esa función y te devuelve tu aplicación: el objeto donde vas a ir colgando todas las rutas. Por convención se le dice `app`.' },
        { p: '**`app.listen(3000)`** es la línea que cambia todo. Sin ella, tu programa se ejecuta de arriba a abajo, llega al final y **se termina**, como cualquier script. Con ella, el proceso se queda prendido esperando pedidos en el puerto 3000.' },

        { h: 'Qué es un puerto' },
        { p: 'Una computadora tiene una sola dirección de red, pero puede tener muchos programas escuchando a la vez. El **puerto** es el número que los distingue: es como el número de interno de un teléfono. El 3000 no tiene nada de especial, es el que se usa por costumbre para desarrollo.' },
        { p: '`localhost` es el nombre de tu propia máquina. `http://localhost:3000` quiere decir "el programa que está escuchando en el interno 3000 de esta misma computadora".' },
        { nota: 'Si dos programas quieren el mismo puerto, el segundo falla con `EADDRINUSE`. Cuando les pase en la vida real, es casi siempre un servidor de antes que quedó prendido: hay que cerrarlo con Ctrl+C.' },

        { h: 'El segundo argumento de listen' },
        { p: '`app.listen` acepta una función que se ejecuta **cuando el servidor ya está escuchando**. Sirve para avisarte que arrancó bien:' },
        { codigo: 'app.listen(3000, () => {\n  console.log(\'Servidor escuchando en http://localhost:3000\');\n});' },
        { p: 'Ese `console.log` no lo ve el que use la API: lo ves vos, en la consola donde corriste `node app.js`. Es el equivalente al cartel de "abierto" del negocio.' },
        { clave: 'Un servidor no "termina". Arranca y se queda. Mientras la consola no te devuelva el prompt, tu servidor está vivo.' }
    ],

    consigna: [
        { p: 'Escribí en `app.js` el servidor mínimo: traer Express, crear la app y quedarte escuchando en el puerto **3000**, imprimiendo el mensaje `Servidor escuchando en http://localhost:3000`.' },
        { p: 'Después arrancalo desde la consola:' },
        { terminal: 'node app.js' },
        { p: 'Cuando esté andando, probá pedirle algo: `curl http://localhost:3000/`. Te va a contestar **Cannot GET /** con un 404. Eso está bien: hay un servidor, pero todavía no tiene ni una sola ruta. Eso es el paso que sigue.' }
    ],

    semilla: { 'app.js': '// app.js — nuestro servidor\n\n' },
    consolaSugerida: ['node app.js', 'curl http://localhost:3000/'],
    probar: [{ metodo: 'GET', ruta: '/' }],

    solucion: {
        'app.js': 'const express = require(\'express\');\nconst app = express();\n\napp.listen(3000, () => {\n  console.log(\'Servidor escuchando en http://localhost:3000\');\n});\n'
    },

    chequeos: [
        { fuente: { debeTener: [
            { re: 'require\\(\\s*[\'"]express[\'"]\\s*\\)', que: 'Falta traer Express con require(\'express\').' },
            { re: 'express\\s*\\(\\s*\\)', que: 'Falta crear la aplicación con express().' }
          ] } },
        { arranque: { escuchando: true, puerto: 3000,
                      consolaContiene: 'Servidor escuchando en http://localhost:3000' },
          pista: 'Acordate: app.listen(3000, () => { console.log(...) }); — el mensaje tiene que decir exactamente "Servidor escuchando en http://localhost:3000".' }
    ]
},

{
    id: 'p03',
    titulo: 'La primera ruta',
    minutos: 10,

    teoria: [
        { h: 'Una ruta es un método, una ruta y una función' },
        { p: 'Todo Express se reduce a esto:' },
        { codigo: 'app.get(\'/\', (req, res) => {\n  res.send(\'Hola\');\n});' },
        { p: 'Se lee así: **cuando llegue un GET a la ruta `/`, ejecutá esta función**. Nada más. La función no se ejecuta ahora: queda guardada, esperando. Se va a ejecutar una vez por cada pedido que coincida, y puede ser cero veces o mil.' },

        { h: 'req y res' },
        { p: 'A esa función Express le pasa siempre dos objetos, y son los dos que van a usar toda la vida:' },
        { tabla: {
            cabeceras: ['Objeto', 'Qué trae', 'Sentido'],
            filas: [
                ['`req`', 'Todo lo que mandó el cliente: la ruta, los parámetros, el cuerpo, las cabeceras', 'Entra'],
                ['`res`', 'Las herramientas para contestar: `res.send`, `res.json`, `res.status`', 'Sale']
            ]
        } },
        { p: 'Los nombres `req` y `res` son una convención, no una regla: podrías llamarlos `pedido` y `respuesta`. **No lo hagas.** Todo el mundo escribe `req` y `res`, y todo el código que vas a leer en tu vida los llama así.' },

        { h: 'Contestar: res.send' },
        { p: '`res.send(...)` manda la respuesta y **cierra el pedido**. Es importante entender que cierra: después de un `res.send`, ese pedido ya está contestado.' },
        { nota: 'El error más común de toda la cursada va a ser contestar dos veces al mismo pedido: un `res.send` adentro de un `if` y otro abajo, sin `return` en el medio. Express tira *"Cannot set headers after they are sent to the client"*. Cuando lo vean, busquen el `return` que falta.' },
        { clave: 'Si al terminar la función no llamaste a `res.send`, `res.json` o alguno de sus hermanos, **el pedido queda colgado**: el cliente se queda esperando para siempre.' }
    ],

    consigna: [
        { p: 'Agregá una ruta `GET /` que conteste con el texto `API de alumnos de la EETP 602`.' },
        { p: 'Ojo con **dónde** la ponés: tiene que estar **antes** del `app.listen`. Después de `listen` también funcionaría, pero se lee mal y es una mala costumbre.' },
        { p: 'Guardá, y acordate de que el servidor **no se entera solo**: hay que pararlo con `Ctrl+C` y volver a hacer `node app.js`. Después probá con `curl http://localhost:3000/`.' },
        { nota: 'Ese reinicio a mano en cada cambio es tan molesto que existe un paquete llamado `nodemon` que lo hace por vos. No entra en esta clase, pero anótenlo.' }
    ],

    consolaSugerida: ['node app.js', 'curl http://localhost:3000/'],
    probar: [{ metodo: 'GET', ruta: '/' }, { metodo: 'GET', ruta: '/otracosa' }],

    solucion: {
        'app.js': 'const express = require(\'express\');\nconst app = express();\n\napp.get(\'/\', (req, res) => {\n  res.send(\'API de alumnos de la EETP 602\');\n});\n\napp.listen(3000, () => {\n  console.log(\'Servidor escuchando en http://localhost:3000\');\n});\n'
    },

    chequeos: [
        { arranque: { escuchando: true } },
        { pedido: { metodo: 'GET', ruta: '/' },
          espera: { estado: 200, textoContiene: 'API de alumnos de la EETP 602' },
          pista: 'app.get(\'/\', (req, res) => { res.send(\'API de alumnos de la EETP 602\'); });' },
        { pedido: { metodo: 'GET', ruta: '/cualquier-cosa' },
          espera: { estado: 404 },
          pista: 'Una ruta que no declaraste tiene que seguir dando 404. Si te da otra cosa, fijate que no hayas puesto la ruta como \'*\'.' }
    ]
},

{
    id: 'p04',
    titulo: 'Devolver datos: res.json',
    minutos: 10,

    teoria: [
        { h: 'Texto no, JSON' },
        { p: 'Una API no manda texto suelto: manda **datos estructurados**, para que el programa que los recibe pueda usarlos sin adivinar. El formato universal para eso es **JSON**.' },
        { p: 'JSON es, casi literalmente, un objeto de JavaScript escrito como texto. `res.json(...)` hace dos cosas por vos:' },
        { lista: [
            'Convierte el objeto o arreglo a texto JSON (`JSON.stringify` por dentro).',
            'Avisa en la cabecera `Content-Type: application/json` que lo que viene es JSON.'
        ] },
        { p: 'Esa segunda parte es la que importa y la que nadie ve. Sin ella, el cliente recibe un texto y no sabe que puede parsearlo.' },
        { nota: '`res.send({...})` con un objeto adentro **también** manda JSON: Express se da cuenta. Igual usen `res.json`, porque dice lo que hace.' },

        { h: 'Dónde están los datos' },
        { p: 'En una aplicación de verdad, los alumnos estarían en una base de datos. Hoy no: van a estar en **un arreglo, en memoria**. Es un arreglo común, declarado arriba de todo en `app.js`.' },
        { p: 'Que esté en memoria tiene una consecuencia que van a ver a cada rato hoy: **cuando reinicies el servidor, todo lo que cargaste se pierde**. El arreglo vuelve a como está escrito en el código. No es un error, es lo que significa "en memoria".' },
        { clave: 'El arreglo vive mientras vive el proceso. Cada pedido que llega lo encuentra como lo dejó el pedido anterior. Eso —y sólo eso— es lo que hace que el CRUD funcione.' },

        { h: 'Una convención que conviene respetar' },
        { p: 'Las rutas de datos se escriben con el prefijo `/api` y en **plural**: `/api/alumnos`, no `/api/alumno` ni `/api/traerAlumnos`. El verbo ya lo pone el método HTTP; la ruta nombra la **colección**.' }
    ],

    consigna: [
        { p: 'Arriba de las rutas, declará el arreglo de alumnos tal cual está acá (los datos importan para que la verificación dé bien):' },
        { codigo: 'const alumnos = [\n  { id: 1, nombre: \'Ana Torres\',   comision: 1 },\n  { id: 2, nombre: \'Beto Ramirez\', comision: 2 },\n  { id: 3, nombre: \'Cami Ledesma\', comision: 1 }\n];' },
        { p: 'Y agregá una ruta `GET /api/alumnos` que devuelva **el arreglo entero** con `res.json`.' },
        { p: 'Probá con `curl http://localhost:3000/api/alumnos` y fijate cómo viene la respuesta.' }
    ],

    consolaSugerida: ['node app.js', 'curl http://localhost:3000/api/alumnos'],
    probar: [{ metodo: 'GET', ruta: '/api/alumnos' }],

    solucion: {
        'app.js': 'const express = require(\'express\');\nconst app = express();\n\nconst alumnos = [\n  { id: 1, nombre: \'Ana Torres\',   comision: 1 },\n  { id: 2, nombre: \'Beto Ramirez\', comision: 2 },\n  { id: 3, nombre: \'Cami Ledesma\', comision: 1 }\n];\n\napp.get(\'/\', (req, res) => {\n  res.send(\'API de alumnos de la EETP 602\');\n});\n\napp.get(\'/api/alumnos\', (req, res) => {\n  res.json(alumnos);\n});\n\napp.listen(3000, () => {\n  console.log(\'Servidor escuchando en http://localhost:3000\');\n});\n'
    },

    chequeos: [
        { arranque: { escuchando: true } },
        { pedido: { metodo: 'GET', ruta: '/api/alumnos' },
          espera: { estado: 200, tipoContenido: 'application/json', esArreglo: true, largo: 3,
                    camposEnCadaUno: ['id', 'nombre', 'comision'] },
          pista: 'Tiene que ser res.json(alumnos) — con res.send(...) y un texto armado a mano no alcanza, porque el Content-Type queda mal.' },
        { pedido: { metodo: 'GET', ruta: '/api/alumnos' },
          espera: { contieneObjeto: { id: 2, nombre: 'Beto Ramirez', comision: 2 } },
          pista: 'Copiá el arreglo tal cual está en la consigna: los nombres y las comisiones se usan para verificar.' }
    ]
},

{
    id: 'p05',
    titulo: 'Un alumno solo: req.params',
    minutos: 12,

    teoria: [
        { h: 'Rutas con un agujero' },
        { p: 'Ya sabemos pedir la lista entera. Ahora queremos **uno**. La ruta no puede estar escrita a mano, porque no sabemos de antemano qué ids van a existir. Express resuelve esto con los **parámetros de ruta**:' },
        { codigo: 'app.get(\'/api/alumnos/:id\', (req, res) => {\n  console.log(req.params.id);\n});' },
        { p: 'Los dos puntos en `:id` marcan un hueco. Esa ruta matchea `/api/alumnos/1`, `/api/alumnos/57` y `/api/alumnos/pepe`, y lo que haya en ese lugar queda en **`req.params.id`**.' },
        { p: 'El nombre después de los dos puntos lo elegís vos y es el que después leés: si escribís `:legajo`, se lee en `req.params.legajo`.' },

        { h: 'La trampa: siempre llega texto' },
        { p: 'Esto es lo que más los va a hacer renegar hoy. **Todo lo que viene en la URL es texto.** `req.params.id` para `/api/alumnos/2` no vale `2`, vale `\'2\'`.' },
        { codigo: '\'2\' === 2      // false\nNumber(\'2\') === 2   // true' },
        { p: 'Por eso, para comparar contra el `id` del arreglo —que es un número— hay que convertirlo con `Number(...)`:' },
        { codigo: 'const alumno = alumnos.find(a => a.id === Number(req.params.id));' },
        { nota: 'Si te olvidás del `Number`, `find` no encuentra nunca nada y todos los alumnos "no existen". No hay error, no hay mensaje: simplemente no funciona. Es el bug más frecuente de esta clase entera.' },

        { h: 'El orden de las rutas importa' },
        { p: 'Express prueba las rutas **en el orden en que las declaraste** y usa la primera que coincide. Por eso `/api/alumnos` y `/api/alumnos/:id` conviven sin problema: la primera sólo matchea si no hay nada después de la barra.' },
        { clave: 'Una ruta con `:algo` matchea **cualquier cosa** en ese lugar. Si alguna vez ponen `/api/alumnos/:id` antes que `/api/alumnos/activos`, la palabra `activos` va a caer en `:id` y la otra ruta no se va a ejecutar nunca. Lo específico va primero.' }
    ],

    consigna: [
        { p: 'Agregá la ruta `GET /api/alumnos/:id` que busque el alumno con `find` y lo devuelva con `res.json`.' },
        { p: 'Ponela **después** de `GET /api/alumnos`, y no te olvides del `Number(...)`.' },
        { p: 'Probá `curl http://localhost:3000/api/alumnos/2`, y probá también con un id que no exista, como el 99. Fijate qué devuelve: ese caso lo arreglamos en el paso siguiente.' }
    ],

    consolaSugerida: ['node app.js', 'curl http://localhost:3000/api/alumnos/2', 'curl http://localhost:3000/api/alumnos/99'],
    probar: [{ metodo: 'GET', ruta: '/api/alumnos/2' }, { metodo: 'GET', ruta: '/api/alumnos/99' }],

    solucion: {
        'app.js': 'const express = require(\'express\');\nconst app = express();\n\nconst alumnos = [\n  { id: 1, nombre: \'Ana Torres\',   comision: 1 },\n  { id: 2, nombre: \'Beto Ramirez\', comision: 2 },\n  { id: 3, nombre: \'Cami Ledesma\', comision: 1 }\n];\n\napp.get(\'/\', (req, res) => {\n  res.send(\'API de alumnos de la EETP 602\');\n});\n\napp.get(\'/api/alumnos\', (req, res) => {\n  res.json(alumnos);\n});\n\napp.get(\'/api/alumnos/:id\', (req, res) => {\n  const alumno = alumnos.find(a => a.id === Number(req.params.id));\n  res.json(alumno);\n});\n\napp.listen(3000, () => {\n  console.log(\'Servidor escuchando en http://localhost:3000\');\n});\n'
    },

    chequeos: [
        { arranque: { escuchando: true } },
        { pedido: { metodo: 'GET', ruta: '/api/alumnos/2' },
          espera: { estado: 200, jsonParcial: { id: 2, nombre: 'Beto Ramirez' } },
          pista: 'Si te devuelve null o vacío, casi seguro te falta el Number(): req.params.id llega como texto y \'2\' === 2 da false.' },
        { pedido: { metodo: 'GET', ruta: '/api/alumnos/3' },
          espera: { estado: 200, jsonParcial: { id: 3, nombre: 'Cami Ledesma' } } },
        { pedido: { metodo: 'GET', ruta: '/api/alumnos' },
          espera: { estado: 200, largo: 3 },
          pista: 'La ruta de la lista completa tiene que seguir funcionando: fijate que la nueva quedó DESPUÉS y no la pisó.' }
    ]
},

{
    id: 'p06',
    titulo: 'Códigos de estado: el 404',
    minutos: 12,

    teoria: [
        { h: 'El número que nadie mira y todos necesitan' },
        { p: 'Cuando pediste el alumno 99, el servidor contestó con un `200 OK` y un cuerpo vacío. Eso es **mentir**: el 200 significa "acá tenés lo que pediste", y no había nada.' },
        { p: 'El código de estado es la primera cosa que mira el programa que consume tu API — antes que el cuerpo. Si le mentís, el cliente no tiene forma de distinguir "no existe" de "existe y está vacío".' },
        { tabla: {
            cabeceras: ['Código', 'Significa', 'Cuándo'],
            filas: [
                ['200 OK', 'Salió bien', 'GET, PUT que funcionaron'],
                ['201 Created', 'Se creó algo', 'POST que dio de alta'],
                ['204 No Content', 'Salió bien y no hay nada que devolver', 'DELETE'],
                ['400 Bad Request', 'Mandaste mal el pedido', 'Faltan datos, o vienen mal'],
                ['404 Not Found', 'No existe eso que pedís', 'Un id que no está'],
                ['500 Internal Server Error', 'Se rompió el servidor', 'Un bug tuyo']
            ]
        } },
        { p: 'La regla gruesa: **4xx la culpa es del cliente, 5xx la culpa es tuya.**' },

        { h: 'Cómo se manda' },
        { codigo: 'res.status(404).json({ error: \'No existe el alumno\' });' },
        { p: '`res.status(...)` **no responde**: sólo deja anotado el número. Devuelve el mismo `res`, y por eso se puede encadenar con `.json(...)`, que es el que efectivamente responde.' },
        { nota: 'No confundir `res.status(404)` con `res.send(404)`. El segundo manda el **número 404 como texto en el cuerpo**, con un estado 200. Es un clásico.' },

        { h: 'El return que salva' },
        { codigo: 'const alumno = alumnos.find(a => a.id === Number(req.params.id));\n\nif (!alumno) {\n  return res.status(404).json({ error: \'No existe el alumno \' + req.params.id });\n}\n\nres.json(alumno);' },
        { p: 'Ese `return` no devuelve nada útil: está para **cortar la función**. Sin él, se ejecutan las dos respuestas y Express explota con *"Cannot set headers after they are sent"*.' },
        { clave: 'El patrón es siempre igual y lo van a escribir cien veces: buscar, preguntar si no está, `return` con el error, y recién después el camino feliz.' },

        { h: 'Y el cuerpo del error también es JSON' },
        { p: 'Si tu API contesta JSON cuando todo va bien, tiene que contestar JSON cuando algo falla. Un cliente que hace `JSON.parse` de la respuesta no debería reventar justo el día que algo sale mal. Por eso `{ error: \'...\' }` y no un texto pelado.' }
    ],

    consigna: [
        { p: 'Modificá `GET /api/alumnos/:id` para que, cuando no encuentre el alumno, devuelva un **404** con un objeto JSON que tenga una propiedad `error`.' },
        { p: 'Probá los dos casos: el 2 tiene que seguir dando 200, y el 99 tiene que dar 404.' },
        { p: 'Fijate en el panel de pedidos que ahora el código de estado se muestra en color: verde el 2xx, naranja el 4xx.' }
    ],

    consolaSugerida: ['node app.js', 'curl http://localhost:3000/api/alumnos/99'],
    probar: [{ metodo: 'GET', ruta: '/api/alumnos/2' }, { metodo: 'GET', ruta: '/api/alumnos/99' }],

    solucion: {
        'app.js': 'const express = require(\'express\');\nconst app = express();\n\nconst alumnos = [\n  { id: 1, nombre: \'Ana Torres\',   comision: 1 },\n  { id: 2, nombre: \'Beto Ramirez\', comision: 2 },\n  { id: 3, nombre: \'Cami Ledesma\', comision: 1 }\n];\n\napp.get(\'/\', (req, res) => {\n  res.send(\'API de alumnos de la EETP 602\');\n});\n\napp.get(\'/api/alumnos\', (req, res) => {\n  res.json(alumnos);\n});\n\napp.get(\'/api/alumnos/:id\', (req, res) => {\n  const alumno = alumnos.find(a => a.id === Number(req.params.id));\n\n  if (!alumno) {\n    return res.status(404).json({ error: \'No existe el alumno \' + req.params.id });\n  }\n\n  res.json(alumno);\n});\n\napp.listen(3000, () => {\n  console.log(\'Servidor escuchando en http://localhost:3000\');\n});\n'
    },

    chequeos: [
        { arranque: { escuchando: true } },
        { pedido: { metodo: 'GET', ruta: '/api/alumnos/99' },
          espera: { estado: 404, tipoContenido: 'application/json', camposEnCadaUno: ['error'] },
          pista: 'return res.status(404).json({ error: \'...\' });  — con la propiedad llamada exactamente "error".' },
        { pedido: { metodo: 'GET', ruta: '/api/alumnos/2' },
          espera: { estado: 200, jsonParcial: { id: 2 } },
          pista: 'El alumno que SÍ existe tiene que seguir dando 200. Si te da 404, revisá la condición del if.' },
        { pedido: { metodo: 'GET', ruta: '/api/alumnos' },
          espera: { estado: 200, largo: 3 } }
    ]
},

{
    id: 'p07',
    titulo: 'Crear: POST y req.body',
    minutos: 14,

    teoria: [
        { h: 'La C de CRUD' },
        { p: 'CRUD son las cuatro cosas que se le hacen a una colección de datos, y cada una tiene su método HTTP:' },
        { tabla: {
            cabeceras: ['', 'Qué hace', 'Método', 'Ruta'],
            filas: [
                ['**C**reate', 'Dar de alta', 'POST', '/api/alumnos'],
                ['**R**ead', 'Leer', 'GET', '/api/alumnos y /api/alumnos/:id'],
                ['**U**pdate', 'Modificar', 'PUT', '/api/alumnos/:id'],
                ['**D**elete', 'Borrar', 'DELETE', '/api/alumnos/:id']
            ]
        } },
        { p: 'Fijate que la **ruta se repite** y lo que cambia es el método. `POST /api/alumnos` y `GET /api/alumnos` son dos cosas completamente distintas aunque la ruta sea la misma. Eso es exactamente lo que se busca.' },

        { h: 'El cuerpo del pedido' },
        { p: 'Un GET no manda datos: todo lo que dice está en la ruta. Un POST sí — el alumno nuevo tiene que viajar de alguna forma. Viaja en el **cuerpo** del pedido, en JSON.' },
        { p: 'Y acá viene lo importante: **Express no lee el cuerpo por su cuenta.** Si no le decís nada, `req.body` vale `undefined`. Hay que activarlo con una línea:' },
        { codigo: 'app.use(express.json());' },
        { p: 'Eso es un **middleware**: una función que se ejecuta antes de las rutas, mira el pedido y lo modifica. `express.json()` mira si el pedido trae JSON en el cuerpo, lo parsea y lo deja en `req.body`. En el paso 12 vamos a escribir uno nuestro.' },
        { nota: 'Tiene que ir **antes** de las rutas que lo necesitan, porque Express ejecuta las cosas en el orden en que las declaraste. Si lo ponés al final, `req.body` sigue siendo `undefined` y vas a ver un `Cannot read properties of undefined (reading \'nombre\')`. Ese error, hoy, quiere decir casi siempre "te falta express.json()".' },

        { h: 'La ruta del alta' },
        { codigo: 'app.post(\'/api/alumnos\', (req, res) => {\n  const nuevo = {\n    id: alumnos.length + 1,\n    nombre: req.body.nombre,\n    comision: req.body.comision\n  };\n\n  alumnos.push(nuevo);\n  res.status(201).json(nuevo);\n});' },
        { p: 'Tres detalles que no son casualidad:' },
        { lista: [
            'El **id lo pone el servidor**, no el cliente. Nunca se confía en un id que llega de afuera.',
            'Se responde **201**, no 200: "creé algo nuevo".',
            'Se devuelve **el objeto creado**, con su id incluido. El cliente necesita saber qué id le tocó.'
        ] },
        { clave: '`const alumnos = [...]` y aún así le hacemos `push`. No hay contradicción: `const` impide **reasignar la variable**, no modificar el arreglo. `alumnos.push(x)` es legal; `alumnos = []` no.' }
    ],

    consigna: [
        { p: 'Dos cosas:' },
        { numerada: [
            'Agregá `app.use(express.json());` justo después de crear la app, antes de todas las rutas.',
            'Agregá la ruta `POST /api/alumnos` que arme el alumno nuevo, lo meta con `push` y lo devuelva con estado **201**.'
        ] },
        { p: 'Para probarlo desde la consola hace falta más que un `curl` pelado, porque hay que mandar el cuerpo y avisar que es JSON:' },
        { terminal: 'curl -X POST http://localhost:3000/api/alumnos -H "Content-Type: application/json" -d \'{"nombre":"Dana Ruiz","comision":3}\'' },
        { p: 'Es largo y se escribe mal fácil: usá el **panel de pedidos** de abajo, que ya lo tiene armado. Después hacé un GET a la lista y fijate que el alumno nuevo esté.' },
        { nota: 'Probá también a propósito mandar el POST **sin** la cabecera `Content-Type: application/json`. Vas a ver el error de `req.body` undefined. Es el mismo que van a tener el día que se olviden de esa cabecera desde el front.' }
    ],

    consolaSugerida: ['node app.js', 'curl http://localhost:3000/api/alumnos'],
    probar: [
        { metodo: 'POST', ruta: '/api/alumnos', cuerpo: '{ "nombre": "Dana Ruiz", "comision": 3 }' },
        { metodo: 'GET', ruta: '/api/alumnos' }
    ],

    solucion: {
        'app.js': 'const express = require(\'express\');\nconst app = express();\n\napp.use(express.json());\n\nconst alumnos = [\n  { id: 1, nombre: \'Ana Torres\',   comision: 1 },\n  { id: 2, nombre: \'Beto Ramirez\', comision: 2 },\n  { id: 3, nombre: \'Cami Ledesma\', comision: 1 }\n];\n\napp.get(\'/\', (req, res) => {\n  res.send(\'API de alumnos de la EETP 602\');\n});\n\napp.get(\'/api/alumnos\', (req, res) => {\n  res.json(alumnos);\n});\n\napp.get(\'/api/alumnos/:id\', (req, res) => {\n  const alumno = alumnos.find(a => a.id === Number(req.params.id));\n\n  if (!alumno) {\n    return res.status(404).json({ error: \'No existe el alumno \' + req.params.id });\n  }\n\n  res.json(alumno);\n});\n\napp.post(\'/api/alumnos\', (req, res) => {\n  const nuevo = {\n    id: alumnos.length + 1,\n    nombre: req.body.nombre,\n    comision: req.body.comision\n  };\n\n  alumnos.push(nuevo);\n  res.status(201).json(nuevo);\n});\n\napp.listen(3000, () => {\n  console.log(\'Servidor escuchando en http://localhost:3000\');\n});\n'
    },

    chequeos: [
        { fuente: { debeTener: [
            { re: 'express\\.json\\s*\\(\\s*\\)', que: 'Falta app.use(express.json()); — sin eso req.body nunca se llena.' }
          ] } },
        { arranque: { escuchando: true } },
        { pedido: { metodo: 'POST', ruta: '/api/alumnos', json: { nombre: 'Dana Ruiz', comision: 3 } },
          espera: { estado: 201, tipoContenido: 'application/json',
                    jsonParcial: { nombre: 'Dana Ruiz', comision: 3 }, camposEnCadaUno: ['id'] },
          pista: 'Tiene que responder 201 y devolver el objeto creado, con el id que le puso el servidor.' },
        { pedido: { metodo: 'GET', ruta: '/api/alumnos' },
          espera: { estado: 200, largo: 4, contieneObjeto: { nombre: 'Dana Ruiz' } },
          pista: 'Después del POST la lista tiene que tener 4. Si sigue en 3, te falta el alumnos.push(nuevo).' }
    ]
}
,

{
    id: 'p08',
    titulo: 'Validar: el 400',
    minutos: 10,

    teoria: [
        { h: 'Nunca confíes en lo que te mandan' },
        { p: 'Ahora mismo, si alguien hace un POST con el cuerpo vacío, tu API da de alta felizmente un alumno así:' },
        { codigo: '{ "id": 5, "nombre": undefined, "comision": undefined }' },
        { p: 'Y queda para siempre en el arreglo, ensuciando todas las respuestas siguientes. El cliente no se entera de que hizo algo mal, porque le contestaste **201 Created**.' },
        { p: 'La regla es vieja y no cambió nunca: **todo lo que viene de afuera es sospechoso hasta que lo revises.** No importa si el que lo manda es tu propio formulario; entre el formulario y el servidor hay una red.' },

        { h: 'El 400' },
        { p: '`400 Bad Request` quiere decir: "el pedido está mal armado, no lo voy a procesar". La culpa es del cliente, no tuya, y por eso es 4xx.' },
        { codigo: 'if (!req.body.nombre) {\n  return res.status(400).json({ error: \'Falta el nombre\' });\n}' },
        { p: 'El mensaje tiene que decir **qué** falta. Un `{ error: "Datos inválidos" }` no le sirve a nadie: el que lo recibe no sabe qué corregir.' },

        { h: 'Cuidado con el ! en JavaScript' },
        { p: '`!req.body.nombre` da `true` para `undefined`, para `null`, para el texto vacío... y también para el número `0` y para `false`. Para un nombre eso está bien. Para un campo numérico **no**:' },
        { tabla: {
            cabeceras: ['Valor', '`!valor`', '¿Es un dato válido?'],
            filas: [
                ['`undefined`', '`true`', 'No'],
                ['`\'\'` (vacío)', '`true`', 'No'],
                ['`0`', '`true`', '**Sí, y te lo rechaza**'],
                ['`\'Ana\'`', '`false`', 'Sí']
            ]
        } },
        { p: 'Para campos que pueden valer cero, la pregunta correcta es `req.body.horas === undefined`. Lo vamos a necesitar en el desafío final.' },
        { clave: 'Validar es preguntar antes de tocar los datos. Todas las validaciones van arriba de todo en la función, cada una con su `return`. Recién cuando pasaron todas, se modifica el arreglo.' }
    ],

    consigna: [
        { p: 'Agregá al principio de `POST /api/alumnos` la validación: si no viene `nombre`, devolver **400** con `{ error: ... }` y cortar con `return`.' },
        { p: 'Probá los dos casos desde el panel de pedidos: uno con el cuerpo `{}` (tiene que dar 400) y uno completo (tiene que seguir dando 201).' }
    ],

    probar: [
        { metodo: 'POST', ruta: '/api/alumnos', cuerpo: '{}' },
        { metodo: 'POST', ruta: '/api/alumnos', cuerpo: '{ "nombre": "Dana Ruiz", "comision": 3 }' },
        { metodo: 'GET', ruta: '/api/alumnos' }
    ],

    solucion: {
        'app.js': 'const express = require(\'express\');\nconst app = express();\n\napp.use(express.json());\n\nconst alumnos = [\n  { id: 1, nombre: \'Ana Torres\',   comision: 1 },\n  { id: 2, nombre: \'Beto Ramirez\', comision: 2 },\n  { id: 3, nombre: \'Cami Ledesma\', comision: 1 }\n];\n\napp.get(\'/\', (req, res) => {\n  res.send(\'API de alumnos de la EETP 602\');\n});\n\napp.get(\'/api/alumnos\', (req, res) => {\n  res.json(alumnos);\n});\n\napp.get(\'/api/alumnos/:id\', (req, res) => {\n  const alumno = alumnos.find(a => a.id === Number(req.params.id));\n\n  if (!alumno) {\n    return res.status(404).json({ error: \'No existe el alumno \' + req.params.id });\n  }\n\n  res.json(alumno);\n});\n\napp.post(\'/api/alumnos\', (req, res) => {\n  if (!req.body.nombre) {\n    return res.status(400).json({ error: \'Falta el nombre\' });\n  }\n\n  const nuevo = {\n    id: alumnos.length + 1,\n    nombre: req.body.nombre,\n    comision: req.body.comision\n  };\n\n  alumnos.push(nuevo);\n  res.status(201).json(nuevo);\n});\n\napp.listen(3000, () => {\n  console.log(\'Servidor escuchando en http://localhost:3000\');\n});\n'
    },

    chequeos: [
        { arranque: { escuchando: true } },
        { pedido: { metodo: 'POST', ruta: '/api/alumnos', json: {} },
          espera: { estado: 400, camposEnCadaUno: ['error'] },
          pista: 'Con el cuerpo vacío tiene que dar 400 y un objeto con la propiedad "error".' },
        { pedido: { metodo: 'POST', ruta: '/api/alumnos', json: { comision: 2 } },
          espera: { estado: 400 },
          pista: 'Falta el nombre aunque venga la comisión: también es 400.' },
        { pedido: { metodo: 'GET', ruta: '/api/alumnos' },
          espera: { largo: 3 },
          pista: 'Los POST rechazados NO tienen que agregar nada al arreglo. Si la lista creció, el push quedó antes del return.' },
        { pedido: { metodo: 'POST', ruta: '/api/alumnos', json: { nombre: 'Dana Ruiz', comision: 3 } },
          espera: { estado: 201, jsonParcial: { nombre: 'Dana Ruiz' } },
          pista: 'El alta válida tiene que seguir funcionando igual que antes.' }
    ]
},

{
    id: 'p09',
    titulo: 'Modificar: PUT',
    minutos: 12,

    teoria: [
        { h: 'La U de CRUD' },
        { p: '`PUT /api/alumnos/3` quiere decir "cambiá el alumno 3 por esto". Junta las dos cosas que ya sabemos hacer: el `:id` de la ruta te dice **cuál**, y el `req.body` te dice **con qué**.' },
        { p: 'Por eso el PUT es la mezcla de los dos casos anteriores, y tiene **las dos** validaciones:' },
        { lista: [
            '¿Existe el alumno? Si no → **404**.',
            '¿Vinieron los datos? Si no → **400**.'
        ] },

        { h: 'Modificar el objeto que está adentro del arreglo' },
        { p: 'Acá hay algo que se entiende mal seguido. `find` **no te devuelve una copia**: te devuelve una referencia al objeto que está adentro del arreglo. Entonces esto alcanza:' },
        { codigo: 'const alumno = alumnos.find(a => a.id === Number(req.params.id));\nalumno.nombre = req.body.nombre;   // ya quedó cambiado adentro del arreglo' },
        { p: 'No hace falta volver a guardarlo ni buscar el índice: `alumno` **es** el elemento del arreglo, no una fotocopia.' },
        { nota: 'Lo contrario también es cierto y es una fuente eterna de bugs: si le hacés `alumno.nombre = ...` a algo que sacaste de un arreglo, lo cambiaste ahí, aunque no era tu intención.' },

        { h: 'Los campos que no vinieron' },
        { p: 'Si el cliente manda sólo `{ "nombre": "Ana Torres Gomez" }`, ¿qué hacemos con la comisión? Si escribís `alumno.comision = req.body.comision` a secas, le estás poniendo `undefined` y le borraste el dato.' },
        { codigo: 'alumno.nombre = req.body.nombre;\n\nif (req.body.comision !== undefined) {\n  alumno.comision = req.body.comision;\n}' },
        { p: 'Se pregunta por `undefined` y no con `!`, porque una comisión podría ser 0 en otro sistema y `!0` es `true`.' },
        { clave: 'Al terminar, se devuelve **el objeto ya modificado** con `res.json(alumno)` y estado 200. El cliente necesita ver cómo quedó.' }
    ],

    consigna: [
        { p: 'Agregá `PUT /api/alumnos/:id`. Tiene que:' },
        { numerada: [
            'Buscar el alumno. Si no está, 404.',
            'Si no vino `nombre`, 400.',
            'Cambiarle el nombre, y la comisión sólo si vino.',
            'Devolver el alumno modificado con 200.'
        ] },
        { p: 'Probá con el panel: modificá el alumno 1, después hacé un GET a `/api/alumnos/1` y comprobá que el cambio quedó. Probá también con el id 99.' }
    ],

    probar: [
        { metodo: 'PUT', ruta: '/api/alumnos/1', cuerpo: '{ "nombre": "Ana Torres Gomez", "comision": 2 }' },
        { metodo: 'GET', ruta: '/api/alumnos/1' },
        { metodo: 'PUT', ruta: '/api/alumnos/99', cuerpo: '{ "nombre": "Fantasma" }' },
        { metodo: 'PUT', ruta: '/api/alumnos/1', cuerpo: '{}' }
    ],

    solucion: {
        'app.js': 'const express = require(\'express\');\nconst app = express();\n\napp.use(express.json());\n\nconst alumnos = [\n  { id: 1, nombre: \'Ana Torres\',   comision: 1 },\n  { id: 2, nombre: \'Beto Ramirez\', comision: 2 },\n  { id: 3, nombre: \'Cami Ledesma\', comision: 1 }\n];\n\napp.get(\'/\', (req, res) => {\n  res.send(\'API de alumnos de la EETP 602\');\n});\n\napp.get(\'/api/alumnos\', (req, res) => {\n  res.json(alumnos);\n});\n\napp.get(\'/api/alumnos/:id\', (req, res) => {\n  const alumno = alumnos.find(a => a.id === Number(req.params.id));\n\n  if (!alumno) {\n    return res.status(404).json({ error: \'No existe el alumno \' + req.params.id });\n  }\n\n  res.json(alumno);\n});\n\napp.post(\'/api/alumnos\', (req, res) => {\n  if (!req.body.nombre) {\n    return res.status(400).json({ error: \'Falta el nombre\' });\n  }\n\n  const nuevo = {\n    id: alumnos.length + 1,\n    nombre: req.body.nombre,\n    comision: req.body.comision\n  };\n\n  alumnos.push(nuevo);\n  res.status(201).json(nuevo);\n});\n\napp.put(\'/api/alumnos/:id\', (req, res) => {\n  const alumno = alumnos.find(a => a.id === Number(req.params.id));\n\n  if (!alumno) {\n    return res.status(404).json({ error: \'No existe el alumno \' + req.params.id });\n  }\n\n  if (!req.body.nombre) {\n    return res.status(400).json({ error: \'Falta el nombre\' });\n  }\n\n  alumno.nombre = req.body.nombre;\n\n  if (req.body.comision !== undefined) {\n    alumno.comision = req.body.comision;\n  }\n\n  res.json(alumno);\n});\n\napp.listen(3000, () => {\n  console.log(\'Servidor escuchando en http://localhost:3000\');\n});\n'
    },

    chequeos: [
        { arranque: { escuchando: true } },
        { pedido: { metodo: 'PUT', ruta: '/api/alumnos/1', json: { nombre: 'Ana Torres Gomez', comision: 2 } },
          espera: { estado: 200, jsonParcial: { id: 1, nombre: 'Ana Torres Gomez', comision: 2 } },
          pista: 'Tiene que devolver el objeto ya modificado, con su id.' },
        { pedido: { metodo: 'GET', ruta: '/api/alumnos/1' },
          espera: { estado: 200, jsonParcial: { nombre: 'Ana Torres Gomez' } },
          pista: 'El cambio tiene que haber quedado en el arreglo. Si el GET devuelve el nombre viejo, estás modificando una copia.' },
        { pedido: { metodo: 'PUT', ruta: '/api/alumnos/1', json: { nombre: 'Ana Torres Gomez 2' } },
          espera: { estado: 200, jsonParcial: { comision: 2 } },
          pista: 'Si no viene la comisión hay que dejarla como estaba, no ponerle undefined.' },
        { pedido: { metodo: 'PUT', ruta: '/api/alumnos/99', json: { nombre: 'Fantasma' } },
          espera: { estado: 404 },
          pista: 'Un id que no existe es 404, igual que en el GET.' },
        { pedido: { metodo: 'PUT', ruta: '/api/alumnos/1', json: {} },
          espera: { estado: 400 },
          pista: 'Sin nombre es 400. Ojo con el orden: primero se pregunta si existe (404) y después si vinieron los datos (400).' }
    ]
},

{
    id: 'p10',
    titulo: 'Borrar: DELETE (y el bug del id)',
    minutos: 14,

    teoria: [
        { h: 'La D de CRUD' },
        { p: 'Para borrar hace falta el **índice**, no el objeto: `splice` trabaja con posiciones. Por eso acá se usa `findIndex` en vez de `find`.' },
        { codigo: 'const indice = alumnos.findIndex(a => a.id === Number(req.params.id));\n\nif (indice === -1) {\n  return res.status(404).json({ error: \'No existe el alumno \' + req.params.id });\n}\n\nalumnos.splice(indice, 1);' },
        { nota: '`findIndex` devuelve **-1** cuando no encuentra, no `undefined`. Y `-1` es un número distinto de cero, así que `if (!indice)` está mal: sería `true` justo cuando el elemento está en la posición 0. La comparación correcta es `indice === -1`.' },
        { p: '`alumnos.splice(indice, 1)` quiere decir "a partir de esa posición, sacá 1 elemento". Modifica el arreglo original, que es lo que queremos.' },

        { h: 'El 204' },
        { p: 'Después de borrar no hay nada que devolver: el recurso ya no existe. Para eso está el **204 No Content**, que significa "salió bien y no te mando cuerpo".' },
        { codigo: 'res.status(204).send();' },
        { p: 'Fijate el `send()` sin argumentos. Un 204 con cuerpo es contradictorio, y algunos clientes directamente lo descartan.' },

        { h: 'Y ahora el bug que dejamos plantado' },
        { p: 'Hacé la prueba en este orden: borrá el alumno 2, y después dá de alta uno nuevo. Mirá qué id le toca.' },
        { p: 'Le toca el **3**, que ya lo tiene Cami. Ahora hay dos alumnos con id 3, y `find` siempre va a encontrar el primero. El otro es inalcanzable: no lo podés leer, no lo podés modificar, no lo podés borrar.' },
        { p: 'La culpa es de esta línea, que venimos arrastrando desde el paso 7:' },
        { codigo: 'id: alumnos.length + 1' },
        { p: 'Funciona sólo mientras nadie borre nada. Es un ejemplo perfecto de bug que no se ve en las pruebas fáciles y aparece en producción. Lo correcto es mirar el id **más grande que existe**, no cuántos hay:' },
        { codigo: 'function proximoId() {\n  if (alumnos.length === 0) {\n    return 1;\n  }\n  return Math.max(...alumnos.map(a => a.id)) + 1;\n}' },
        { p: '`alumnos.map(a => a.id)` arma el arreglo de ids; los tres puntos lo desarman en argumentos sueltos para `Math.max`, que no recibe arreglos. Y el `if` está porque `Math.max()` sin argumentos devuelve `-Infinity`.' },
        { clave: 'Un id no es una posición. Es un identificador, y una vez que se usó, no se reusa nunca más.' }
    ],

    consigna: [
        { p: 'Dos cosas:' },
        { numerada: [
            'Agregá `DELETE /api/alumnos/:id`: buscar el índice, 404 si no está, `splice`, y responder 204 sin cuerpo.',
            'Escribí la función `proximoId()` y usala en el POST en lugar de `alumnos.length + 1`.'
        ] },
        { p: 'Probá la secuencia completa: borrá el 2, listá, y dá de alta uno nuevo. El id nuevo tiene que ser el **4**.' }
    ],

    probar: [
        { metodo: 'DELETE', ruta: '/api/alumnos/2' },
        { metodo: 'GET', ruta: '/api/alumnos' },
        { metodo: 'POST', ruta: '/api/alumnos', cuerpo: '{ "nombre": "Elsa Vera", "comision": 1 }' },
        { metodo: 'DELETE', ruta: '/api/alumnos/99' }
    ],

    solucion: {
        'app.js': 'const express = require(\'express\');\nconst app = express();\n\napp.use(express.json());\n\nconst alumnos = [\n  { id: 1, nombre: \'Ana Torres\',   comision: 1 },\n  { id: 2, nombre: \'Beto Ramirez\', comision: 2 },\n  { id: 3, nombre: \'Cami Ledesma\', comision: 1 }\n];\n\nfunction proximoId() {\n  if (alumnos.length === 0) {\n    return 1;\n  }\n  return Math.max(...alumnos.map(a => a.id)) + 1;\n}\n\napp.get(\'/\', (req, res) => {\n  res.send(\'API de alumnos de la EETP 602\');\n});\n\napp.get(\'/api/alumnos\', (req, res) => {\n  res.json(alumnos);\n});\n\napp.get(\'/api/alumnos/:id\', (req, res) => {\n  const alumno = alumnos.find(a => a.id === Number(req.params.id));\n\n  if (!alumno) {\n    return res.status(404).json({ error: \'No existe el alumno \' + req.params.id });\n  }\n\n  res.json(alumno);\n});\n\napp.post(\'/api/alumnos\', (req, res) => {\n  if (!req.body.nombre) {\n    return res.status(400).json({ error: \'Falta el nombre\' });\n  }\n\n  const nuevo = {\n    id: proximoId(),\n    nombre: req.body.nombre,\n    comision: req.body.comision\n  };\n\n  alumnos.push(nuevo);\n  res.status(201).json(nuevo);\n});\n\napp.put(\'/api/alumnos/:id\', (req, res) => {\n  const alumno = alumnos.find(a => a.id === Number(req.params.id));\n\n  if (!alumno) {\n    return res.status(404).json({ error: \'No existe el alumno \' + req.params.id });\n  }\n\n  if (!req.body.nombre) {\n    return res.status(400).json({ error: \'Falta el nombre\' });\n  }\n\n  alumno.nombre = req.body.nombre;\n\n  if (req.body.comision !== undefined) {\n    alumno.comision = req.body.comision;\n  }\n\n  res.json(alumno);\n});\n\napp.delete(\'/api/alumnos/:id\', (req, res) => {\n  const indice = alumnos.findIndex(a => a.id === Number(req.params.id));\n\n  if (indice === -1) {\n    return res.status(404).json({ error: \'No existe el alumno \' + req.params.id });\n  }\n\n  alumnos.splice(indice, 1);\n  res.status(204).send();\n});\n\napp.listen(3000, () => {\n  console.log(\'Servidor escuchando en http://localhost:3000\');\n});\n'
    },

    chequeos: [
        { arranque: { escuchando: true } },
        { pedido: { metodo: 'DELETE', ruta: '/api/alumnos/2' },
          espera: { estado: 204, cuerpoVacio: true },
          pista: 'res.status(204).send();  — sin nada adentro del send.' },
        { pedido: { metodo: 'GET', ruta: '/api/alumnos' },
          espera: { largo: 2, noContieneObjeto: { id: 2 } },
          pista: 'Después del DELETE el alumno 2 no tiene que estar más. Revisá el splice.' },
        { pedido: { metodo: 'DELETE', ruta: '/api/alumnos/2' },
          espera: { estado: 404 },
          pista: 'Borrar dos veces lo mismo es 404 la segunda vez. Acordate: findIndex devuelve -1, no undefined.' },
        { pedido: { metodo: 'POST', ruta: '/api/alumnos', json: { nombre: 'Elsa Vera', comision: 1 } },
          espera: { estado: 201, jsonParcial: { id: 4, nombre: 'Elsa Vera' } },
          pista: 'Después de borrar al 2 quedan los ids 1 y 3, así que el nuevo tiene que ser el 4. Si te dio 3, todavía estás usando alumnos.length + 1 en vez de proximoId().' },
        { pedido: { metodo: 'GET', ruta: '/api/alumnos' },
          espera: { largo: 3, contieneObjeto: { id: 4, nombre: 'Elsa Vera' } } }
    ]
},

{
    id: 'p11',
    titulo: 'Filtrar: req.query',
    minutos: 12,

    teoria: [
        { h: 'La tercera forma de mandar datos' },
        { p: 'Ya vimos dos: en la ruta (`req.params`) y en el cuerpo (`req.body`). Falta la tercera, que es la que se usa para **filtrar, buscar y ordenar**: la *query string*.' },
        { codigo: 'GET /api/alumnos?comision=1&buscar=ana' },
        { p: 'Todo lo que va después del `?` son pares `clave=valor` separados por `&`. Express los parsea solo y los deja en **`req.query`**, sin que tengas que declarar nada en la ruta:' },
        { codigo: 'req.query.comision   // \'1\'\nreq.query.buscar     // \'ana\'' },

        { h: 'Las tres, comparadas' },
        { tabla: {
            cabeceras: ['', 'Dónde va', 'Para qué', 'Se declara'],
            filas: [
                ['`req.params`', 'En la ruta: `/alumnos/3`', 'Identificar **cuál**', 'Sí, con `:id`'],
                ['`req.query`', 'Después del `?`', 'Filtrar, buscar, ordenar', 'No, viene solo'],
                ['`req.body`', 'En el cuerpo', 'Mandar datos nuevos', 'Sí, `express.json()`']
            ]
        } },
        { p: 'La diferencia de fondo entre `params` y `query`: el parámetro es **obligatorio** —sin él la ruta ni siquiera matchea— y la query es **opcional**. `/api/alumnos` sin nada tiene que seguir devolviendo todo.' },
        { nota: 'Y de nuevo: **todo lo que viene en la query es texto.** `req.query.comision` vale `\'1\'`, no `1`. El mismo `Number(...)` de siempre.' },

        { h: 'Filtros que se pueden encadenar' },
        { p: 'El patrón es empezar con todo y ir recortando. Cada filtro se aplica sólo si vino:' },
        { codigo: 'let resultado = alumnos;\n\nif (req.query.comision) {\n  resultado = resultado.filter(a => a.comision === Number(req.query.comision));\n}\n\nif (req.query.buscar) {\n  const texto = req.query.buscar.toLowerCase();\n  resultado = resultado.filter(a => a.nombre.toLowerCase().includes(texto));\n}\n\nres.json(resultado);' },
        { p: 'Fijate que es `let` y no `const`: la variable se reasigna en cada filtro. Y que `filter` **no toca** el arreglo original —devuelve uno nuevo—, que es justo lo que queremos: filtrar no es borrar.' },
        { clave: 'Las dos `toLowerCase()` son para que buscar "ana" encuentre a "Ana Torres". Si comparás sin normalizar, el usuario tiene que escribir con las mayúsculas exactas, y no lo va a hacer.' }
    ],

    consigna: [
        { p: 'Modificá `GET /api/alumnos` para que acepte dos filtros opcionales por query string:' },
        { lista: [
            '`?comision=1` → sólo los de esa comisión.',
            '`?buscar=ram` → sólo aquellos cuyo nombre contenga ese texto, sin distinguir mayúsculas.'
        ] },
        { p: 'Los dos tienen que poder combinarse, y sin ningún filtro tiene que seguir devolviendo la lista completa.' }
    ],

    probar: [
        { metodo: 'GET', ruta: '/api/alumnos' },
        { metodo: 'GET', ruta: '/api/alumnos?comision=1' },
        { metodo: 'GET', ruta: '/api/alumnos?buscar=ram' },
        { metodo: 'GET', ruta: '/api/alumnos?comision=1&buscar=an' }
    ],

    solucion: {
        'app.js': 'const express = require(\'express\');\nconst app = express();\n\napp.use(express.json());\n\nconst alumnos = [\n  { id: 1, nombre: \'Ana Torres\',   comision: 1 },\n  { id: 2, nombre: \'Beto Ramirez\', comision: 2 },\n  { id: 3, nombre: \'Cami Ledesma\', comision: 1 }\n];\n\nfunction proximoId() {\n  if (alumnos.length === 0) {\n    return 1;\n  }\n  return Math.max(...alumnos.map(a => a.id)) + 1;\n}\n\napp.get(\'/\', (req, res) => {\n  res.send(\'API de alumnos de la EETP 602\');\n});\n\napp.get(\'/api/alumnos\', (req, res) => {\n  let resultado = alumnos;\n\n  if (req.query.comision) {\n    resultado = resultado.filter(a => a.comision === Number(req.query.comision));\n  }\n\n  if (req.query.buscar) {\n    const texto = req.query.buscar.toLowerCase();\n    resultado = resultado.filter(a => a.nombre.toLowerCase().includes(texto));\n  }\n\n  res.json(resultado);\n});\n\napp.get(\'/api/alumnos/:id\', (req, res) => {\n  const alumno = alumnos.find(a => a.id === Number(req.params.id));\n\n  if (!alumno) {\n    return res.status(404).json({ error: \'No existe el alumno \' + req.params.id });\n  }\n\n  res.json(alumno);\n});\n\napp.post(\'/api/alumnos\', (req, res) => {\n  if (!req.body.nombre) {\n    return res.status(400).json({ error: \'Falta el nombre\' });\n  }\n\n  const nuevo = {\n    id: proximoId(),\n    nombre: req.body.nombre,\n    comision: req.body.comision\n  };\n\n  alumnos.push(nuevo);\n  res.status(201).json(nuevo);\n});\n\napp.put(\'/api/alumnos/:id\', (req, res) => {\n  const alumno = alumnos.find(a => a.id === Number(req.params.id));\n\n  if (!alumno) {\n    return res.status(404).json({ error: \'No existe el alumno \' + req.params.id });\n  }\n\n  if (!req.body.nombre) {\n    return res.status(400).json({ error: \'Falta el nombre\' });\n  }\n\n  alumno.nombre = req.body.nombre;\n\n  if (req.body.comision !== undefined) {\n    alumno.comision = req.body.comision;\n  }\n\n  res.json(alumno);\n});\n\napp.delete(\'/api/alumnos/:id\', (req, res) => {\n  const indice = alumnos.findIndex(a => a.id === Number(req.params.id));\n\n  if (indice === -1) {\n    return res.status(404).json({ error: \'No existe el alumno \' + req.params.id });\n  }\n\n  alumnos.splice(indice, 1);\n  res.status(204).send();\n});\n\napp.listen(3000, () => {\n  console.log(\'Servidor escuchando en http://localhost:3000\');\n});\n'
    },

    chequeos: [
        { arranque: { escuchando: true } },
        { pedido: { metodo: 'GET', ruta: '/api/alumnos' },
          espera: { estado: 200, largo: 3 },
          pista: 'Sin filtros tiene que devolver los 3. Si te devuelve 0, el if del filtro se está ejecutando igual.' },
        { pedido: { metodo: 'GET', ruta: '/api/alumnos?comision=1' },
          espera: { estado: 200, largo: 2, contieneObjeto: { nombre: 'Ana Torres' },
                    noContieneObjeto: { nombre: 'Beto Ramirez' } },
          pista: 'Acordate del Number(req.query.comision): la query llega como texto y \'1\' === 1 da false.' },
        { pedido: { metodo: 'GET', ruta: '/api/alumnos?buscar=ram' },
          espera: { estado: 200, largo: 1, contieneObjeto: { nombre: 'Beto Ramirez' } },
          pista: 'Con "ram" en minúscula tiene que encontrar a "Beto Ramirez": van las dos toLowerCase().' },
        { pedido: { metodo: 'GET', ruta: '/api/alumnos?comision=1&buscar=an' },
          espera: { estado: 200, largo: 1, contieneObjeto: { nombre: 'Ana Torres' } },
          pista: 'Los dos filtros se tienen que poder combinar: el segundo filtra sobre el resultado del primero, no sobre el arreglo original.' },
        { pedido: { metodo: 'GET', ruta: '/api/alumnos/3' },
          espera: { estado: 200, jsonParcial: { nombre: 'Cami Ledesma' } },
          pista: 'La ruta de un alumno solo tiene que seguir andando.' }
    ]
},

{
    id: 'p12',
    titulo: 'Middleware propio y next()',
    minutos: 14,

    teoria: [
        { h: 'Qué es un middleware' },
        { p: 'Un middleware es una función que se mete **en el medio** del camino, entre que llega el pedido y que lo atiende la ruta. Ya usaste uno sin escribirlo: `express.json()`.' },
        { p: 'Se ve igual que un manejador de ruta, pero con **un tercer parámetro**:' },
        { codigo: 'app.use((req, res, next) => {\n  console.log(req.method + \' \' + req.originalUrl);\n  next();\n});' },
        { p: '`app.use(...)` sin ruta quiere decir "esto corre para **todos** los pedidos".' },

        { h: 'next() es todo el asunto' },
        { p: 'Express arma una **fila** con todo lo que declaraste, en orden: middlewares y rutas mezclados. Cada pedido entra por arriba y va bajando. Cada capa tiene dos opciones y sólo dos:' },
        { lista: [
            '**Responder** (`res.json`, `res.send`...) y ahí termina todo: lo de abajo no se ejecuta.',
            '**Llamar a `next()`** para pasarle el pedido a la capa siguiente.'
        ] },
        { nota: 'Si una capa no hace ninguna de las dos, el pedido **queda colgado**. El cliente espera para siempre y en la consola no aparece ningún error, porque para Express no pasó nada malo: simplemente nadie contestó. Cuando algo "no responde y no tira error", buscá el `next()` que falta.' },

        { h: 'El orden es el código' },
        { p: 'Esta es la idea que hay que llevarse de todo el paso: en Express **el orden en que escribís las líneas es el orden en que pasan las cosas**. No hay configuración mágica, hay una lista.' },
        { p: 'Por eso `app.use(express.json())` va arriba: si lo ponés abajo de las rutas, cuando el pedido llega al POST todavía nadie parseó el cuerpo. Y por eso el logger va primero: para que registre todo.' },
        { codigo: '1. app.use(logger)          ← registra\n2. app.use(express.json())  ← llena req.body\n3. app.get(\'/api/alumnos\')  ← atiende\n4. (nadie respondió)        ← Express manda su 404', archivo: 'el orden de la fila' },

        { h: 'Para qué se usan en serio' },
        { p: 'Un logger es el ejemplo de juguete. En una aplicación real los middlewares son el lugar donde vive todo lo que es transversal: **autenticación** (¿este pedido trae un token válido?), permisos, límites de uso, CORS, medición de tiempos. Todo lo que hay que hacer en todos los pedidos y no querés repetir en cada ruta.' },
        { clave: 'Un middleware que corta la fila sin llamar a `next()` es un **portero**: si el token está mal, responde 401 y la ruta ni se entera de que existió ese pedido.' }
    ],

    consigna: [
        { p: 'Agregá un middleware propio, **arriba de todo**, antes de `express.json()`, que imprima en la consola del servidor el método y la ruta de cada pedido, así:' },
        { terminal: 'GET /api/alumnos\nPOST /api/alumnos\nDELETE /api/alumnos/2' },
        { p: 'Usá `req.method` y `req.originalUrl`, y no te olvides de `next()`.' },
        { p: 'Después hacé varios pedidos desde el panel y mirá cómo se va llenando la consola. Probá también sacarle el `next()` y ver qué pasa: el pedido se cuelga.' }
    ],

    probar: [
        { metodo: 'GET', ruta: '/api/alumnos' },
        { metodo: 'GET', ruta: '/api/alumnos/1' },
        { metodo: 'POST', ruta: '/api/alumnos', cuerpo: '{ "nombre": "Facu Diaz", "comision": 2 }' }
    ],

    solucion: {
        'app.js': 'const express = require(\'express\');\nconst app = express();\n\napp.use((req, res, next) => {\n  console.log(req.method + \' \' + req.originalUrl);\n  next();\n});\n\napp.use(express.json());\n\nconst alumnos = [\n  { id: 1, nombre: \'Ana Torres\',   comision: 1 },\n  { id: 2, nombre: \'Beto Ramirez\', comision: 2 },\n  { id: 3, nombre: \'Cami Ledesma\', comision: 1 }\n];\n\nfunction proximoId() {\n  if (alumnos.length === 0) {\n    return 1;\n  }\n  return Math.max(...alumnos.map(a => a.id)) + 1;\n}\n\napp.get(\'/\', (req, res) => {\n  res.send(\'API de alumnos de la EETP 602\');\n});\n\napp.get(\'/api/alumnos\', (req, res) => {\n  let resultado = alumnos;\n\n  if (req.query.comision) {\n    resultado = resultado.filter(a => a.comision === Number(req.query.comision));\n  }\n\n  if (req.query.buscar) {\n    const texto = req.query.buscar.toLowerCase();\n    resultado = resultado.filter(a => a.nombre.toLowerCase().includes(texto));\n  }\n\n  res.json(resultado);\n});\n\napp.get(\'/api/alumnos/:id\', (req, res) => {\n  const alumno = alumnos.find(a => a.id === Number(req.params.id));\n\n  if (!alumno) {\n    return res.status(404).json({ error: \'No existe el alumno \' + req.params.id });\n  }\n\n  res.json(alumno);\n});\n\napp.post(\'/api/alumnos\', (req, res) => {\n  if (!req.body.nombre) {\n    return res.status(400).json({ error: \'Falta el nombre\' });\n  }\n\n  const nuevo = {\n    id: proximoId(),\n    nombre: req.body.nombre,\n    comision: req.body.comision\n  };\n\n  alumnos.push(nuevo);\n  res.status(201).json(nuevo);\n});\n\napp.put(\'/api/alumnos/:id\', (req, res) => {\n  const alumno = alumnos.find(a => a.id === Number(req.params.id));\n\n  if (!alumno) {\n    return res.status(404).json({ error: \'No existe el alumno \' + req.params.id });\n  }\n\n  if (!req.body.nombre) {\n    return res.status(400).json({ error: \'Falta el nombre\' });\n  }\n\n  alumno.nombre = req.body.nombre;\n\n  if (req.body.comision !== undefined) {\n    alumno.comision = req.body.comision;\n  }\n\n  res.json(alumno);\n});\n\napp.delete(\'/api/alumnos/:id\', (req, res) => {\n  const indice = alumnos.findIndex(a => a.id === Number(req.params.id));\n\n  if (indice === -1) {\n    return res.status(404).json({ error: \'No existe el alumno \' + req.params.id });\n  }\n\n  alumnos.splice(indice, 1);\n  res.status(204).send();\n});\n\napp.listen(3000, () => {\n  console.log(\'Servidor escuchando en http://localhost:3000\');\n});\n'
    },

    chequeos: [
        { fuente: { debeTener: [
            { re: 'next\\s*\\(\\s*\\)', que: 'Falta llamar a next() adentro del middleware: sin eso el pedido nunca llega a las rutas.' },
            { re: 'req\\.method', que: 'El mensaje tiene que incluir req.method.' }
          ] } },
        { arranque: { escuchando: true } },
        { pedido: { metodo: 'GET', ruta: '/api/alumnos' },
          espera: { estado: 200, largo: 3, consolaContiene: 'GET /api/alumnos' },
          pista: 'console.log(req.method + \' \' + req.originalUrl); — método, un espacio, y la ruta.' },
        { pedido: { metodo: 'POST', ruta: '/api/alumnos', json: { nombre: 'Facu Diaz', comision: 2 } },
          espera: { estado: 201, consolaContiene: 'POST /api/alumnos' },
          pista: 'El middleware tiene que registrar también los POST, y el POST tiene que seguir funcionando: si el middleware quedó DESPUÉS de express.json() igual anda, pero probá dejarlo primero.' },
        { pedido: { metodo: 'DELETE', ruta: '/api/alumnos/1' },
          espera: { estado: 204, consolaContiene: 'DELETE /api/alumnos/1' } }
    ]
},

{
    id: 'p13',
    titulo: 'Ordenar: express.Router()',
    minutos: 14,

    teoria: [
        { h: 'El archivo se está haciendo largo' },
        { p: '`app.js` tiene ya más de cien líneas y sólo maneja **un** recurso. Agregale materias, profesores y notas y se vuelve imposible de leer. Express trae la herramienta para partirlo: **el router**.' },
        { p: 'Un router es una aplicación en chiquito: tiene sus propias rutas y sus propios middlewares, pero no escucha en ningún puerto. Se **monta** adentro de la app principal.' },

        { h: 'El archivo del router' },
        { codigo: 'const express = require(\'express\');\nconst router = express.Router();\n\nrouter.get(\'/\', (req, res) => { ... });\nrouter.get(\'/:id\', (req, res) => { ... });\n\nmodule.exports = router;', archivo: 'rutas/alumnos.js' },
        { p: 'Dos cosas nuevas:' },
        { lista: [
            '`express.Router()` en vez de `express()`.',
            '`module.exports = router` al final. Eso es lo que Node se lleva cuando alguien hace `require` de este archivo. **Si te lo olvidás, el `require` devuelve un objeto vacío** y `app.use` te va a decir que esperaba una función.'
        ] },

        { h: 'Y el montaje' },
        { codigo: 'const rutasAlumnos = require(\'./rutas/alumnos\');\n\napp.use(\'/api/alumnos\', rutasAlumnos);', archivo: 'app.js' },
        { p: 'El `./` adelante no es decorativo: le dice a Node "este es un archivo mío, no un paquete de npm". Sin el punto, Node lo busca en `node_modules` y no lo encuentra. La extensión `.js` se puede omitir.' },

        { h: 'Las rutas se acortan' },
        { p: 'Este es el detalle que confunde a todo el mundo la primera vez. Adentro del router, las rutas se escriben **relativas al lugar donde lo montaste**:' },
        { tabla: {
            cabeceras: ['Antes, en app.js', 'Ahora, en el router', 'La ruta real sigue siendo'],
            filas: [
                ['`app.get(\'/api/alumnos\')`', '`router.get(\'/\')`', '`/api/alumnos`'],
                ['`app.get(\'/api/alumnos/:id\')`', '`router.get(\'/:id\')`', '`/api/alumnos/:id`']
            ]
        } },
        { p: 'El prefijo `/api/alumnos` se escribe **una sola vez**, en el `app.use`. Si mañana la API cambia a `/api/v2/alumnos`, tocás una línea.' },
        { nota: 'El error típico: dejar las rutas largas adentro del router. Te queda `/api/alumnos/api/alumnos` y todo da 404. Si después de partir el archivo todo dejó de andar, es esto.' },
        { clave: 'El arreglo `alumnos` se muda **adentro del router**, junto con las rutas que lo usan. Cada archivo se lleva sus datos y su lógica. Eso es lo que hace que el archivo se pueda leer solo.' }
    ],

    consigna: [
        { p: 'Vamos a partir el proyecto en dos. En las solapas del editor ya tenés `rutas/alumnos.js` creado.' },
        { numerada: [
            'Mudá a `rutas/alumnos.js` el arreglo `alumnos`, la función `proximoId()` y **las cinco rutas** de alumnos, cambiando `app.` por `router.` y acortando las rutas.',
            'No te olvides de `const express = require(\'express\');` y `const router = express.Router();` arriba, ni de `module.exports = router;` abajo.',
            'En `app.js` dejá sólo: Express, el logger, `express.json()`, la ruta `GET /`, el `require` del router, el `app.use(\'/api/alumnos\', ...)` y el `listen`.'
        ] },
        { p: 'Cuando termine, la API tiene que funcionar **exactamente igual** que antes. Ese es el punto: reordenar sin cambiar el comportamiento.' }
    ],

    semilla: {
        'rutas/alumnos.js': '// rutas/alumnos.js — todo lo de alumnos vive acá\n\n'
    },

    probar: [
        { metodo: 'GET', ruta: '/api/alumnos' },
        { metodo: 'GET', ruta: '/api/alumnos/2' },
        { metodo: 'POST', ruta: '/api/alumnos', cuerpo: '{ "nombre": "Gina Lopez", "comision": 3 }' },
        { metodo: 'GET', ruta: '/' }
    ],

    solucion: {
        'app.js': 'const express = require(\'express\');\nconst rutasAlumnos = require(\'./rutas/alumnos\');\n\nconst app = express();\n\napp.use((req, res, next) => {\n  console.log(req.method + \' \' + req.originalUrl);\n  next();\n});\n\napp.use(express.json());\n\napp.get(\'/\', (req, res) => {\n  res.send(\'API de alumnos de la EETP 602\');\n});\n\napp.use(\'/api/alumnos\', rutasAlumnos);\n\napp.listen(3000, () => {\n  console.log(\'Servidor escuchando en http://localhost:3000\');\n});\n',
        'rutas/alumnos.js': 'const express = require(\'express\');\nconst router = express.Router();\n\nconst alumnos = [\n  { id: 1, nombre: \'Ana Torres\',   comision: 1 },\n  { id: 2, nombre: \'Beto Ramirez\', comision: 2 },\n  { id: 3, nombre: \'Cami Ledesma\', comision: 1 }\n];\n\nfunction proximoId() {\n  if (alumnos.length === 0) {\n    return 1;\n  }\n  return Math.max(...alumnos.map(a => a.id)) + 1;\n}\n\nrouter.get(\'/\', (req, res) => {\n  let resultado = alumnos;\n\n  if (req.query.comision) {\n    resultado = resultado.filter(a => a.comision === Number(req.query.comision));\n  }\n\n  if (req.query.buscar) {\n    const texto = req.query.buscar.toLowerCase();\n    resultado = resultado.filter(a => a.nombre.toLowerCase().includes(texto));\n  }\n\n  res.json(resultado);\n});\n\nrouter.get(\'/:id\', (req, res) => {\n  const alumno = alumnos.find(a => a.id === Number(req.params.id));\n\n  if (!alumno) {\n    return res.status(404).json({ error: \'No existe el alumno \' + req.params.id });\n  }\n\n  res.json(alumno);\n});\n\nrouter.post(\'/\', (req, res) => {\n  if (!req.body.nombre) {\n    return res.status(400).json({ error: \'Falta el nombre\' });\n  }\n\n  const nuevo = {\n    id: proximoId(),\n    nombre: req.body.nombre,\n    comision: req.body.comision\n  };\n\n  alumnos.push(nuevo);\n  res.status(201).json(nuevo);\n});\n\nrouter.put(\'/:id\', (req, res) => {\n  const alumno = alumnos.find(a => a.id === Number(req.params.id));\n\n  if (!alumno) {\n    return res.status(404).json({ error: \'No existe el alumno \' + req.params.id });\n  }\n\n  if (!req.body.nombre) {\n    return res.status(400).json({ error: \'Falta el nombre\' });\n  }\n\n  alumno.nombre = req.body.nombre;\n\n  if (req.body.comision !== undefined) {\n    alumno.comision = req.body.comision;\n  }\n\n  res.json(alumno);\n});\n\nrouter.delete(\'/:id\', (req, res) => {\n  const indice = alumnos.findIndex(a => a.id === Number(req.params.id));\n\n  if (indice === -1) {\n    return res.status(404).json({ error: \'No existe el alumno \' + req.params.id });\n  }\n\n  alumnos.splice(indice, 1);\n  res.status(204).send();\n});\n\nmodule.exports = router;\n'
    },

    chequeos: [
        { fuente: { archivo: 'rutas/alumnos.js', debeTener: [
            { re: 'express\\.Router\\s*\\(\\s*\\)', que: 'Falta const router = express.Router();' },
            { re: 'module\\.exports\\s*=\\s*router', que: 'Falta module.exports = router; al final del archivo.' },
            { re: 'router\\.(get|post|put|delete)\\s*\\(', que: 'Las rutas del router se declaran con router.get(...), router.post(...), etc.' }
          ] } },
        { fuente: { archivo: 'app.js', debeTener: [
            { re: 'require\\(\\s*[\'"]\\./rutas/alumnos', que: 'Falta el require(\'./rutas/alumnos\') en app.js. Ojo con el ./ adelante.' },
            { re: 'app\\.use\\(\\s*[\'"]/api/alumnos[\'"]', que: 'Falta montar el router: app.use(\'/api/alumnos\', rutasAlumnos);' }
          ], noDebeTener: [
            { re: 'app\\.(get|post|put|delete)\\s*\\(\\s*[\'"]/api/alumnos', que: 'Quedaron rutas de alumnos sueltas en app.js: todas tienen que estar adentro del router.' }
          ] } },
        { arranque: { escuchando: true } },
        { pedido: { metodo: 'GET', ruta: '/' },
          espera: { estado: 200, textoContiene: 'API de alumnos' },
          pista: 'La ruta raíz se queda en app.js: no es de alumnos.' },
        { pedido: { metodo: 'GET', ruta: '/api/alumnos' },
          espera: { estado: 200, largo: 3 },
          pista: 'Si te da 404, casi seguro dejaste la ruta larga adentro del router. Adentro del router va router.get(\'/\'), no router.get(\'/api/alumnos\').' },
        { pedido: { metodo: 'GET', ruta: '/api/alumnos?comision=1' }, espera: { largo: 2 } },
        { pedido: { metodo: 'GET', ruta: '/api/alumnos/2' },
          espera: { estado: 200, jsonParcial: { nombre: 'Beto Ramirez' } },
          pista: 'Adentro del router esta ruta es router.get(\'/:id\').' },
        { pedido: { metodo: 'GET', ruta: '/api/alumnos/99' }, espera: { estado: 404 } },
        { pedido: { metodo: 'POST', ruta: '/api/alumnos', json: { nombre: 'Gina Lopez', comision: 3 } },
          espera: { estado: 201, jsonParcial: { id: 4, nombre: 'Gina Lopez' }, consolaContiene: 'POST /api/alumnos' },
          pista: 'El logger sigue en app.js y tiene que registrar también lo que atiende el router.' },
        { pedido: { metodo: 'PUT', ruta: '/api/alumnos/1', json: { nombre: 'Ana Torres Gomez' } },
          espera: { estado: 200, jsonParcial: { nombre: 'Ana Torres Gomez' } } },
        { pedido: { metodo: 'DELETE', ruta: '/api/alumnos/2' }, espera: { estado: 204 } },
        { pedido: { metodo: 'GET', ruta: '/api/alumnos' },
          espera: { largo: 3, noContieneObjeto: { id: 2 } } }
    ]
},

{
    id: 'p14',
    titulo: 'Desafío: el recurso materias',
    minutos: 20,

    teoria: [
        { h: 'Ahora solos' },
        { p: 'Este paso no trae nada nuevo. Trae **todo lo anterior junto**, que es distinto: una cosa es seguir el ejemplo y otra es armarlo de cero.' },
        { p: 'La API tiene que manejar ahora un segundo recurso, **materias**, con su propio router y su propio archivo, exactamente como quedó alumnos.' },
        { clave: 'La estructura que armaste en el paso 13 es la que se usa en serio. Agregar un recurso nuevo a una API bien ordenada es crear un archivo y agregar un `app.use`. Eso es todo lo que tendría que costar.' },
        { h: 'La chuleta' },
        { tabla: {
            cabeceras: ['Necesito...', 'Se hace con'],
            filas: [
                ['La lista completa', '`router.get(\'/\')` + `res.json(arreglo)`'],
                ['Uno solo por id', '`router.get(\'/:id\')` + `find` + `Number(req.params.id)`'],
                ['Filtrar', '`req.query.loQueSea` + `filter`'],
                ['Crear', '`router.post(\'/\')` + `req.body` + `push` + `201`'],
                ['Modificar', '`router.put(\'/:id\')` + `find` + asignar + `200`'],
                ['Borrar', '`router.delete(\'/:id\')` + `findIndex` + `splice` + `204`'],
                ['No existe', '`return res.status(404).json({ error: ... })`'],
                ['Faltan datos', '`return res.status(400).json({ error: ... })`']
            ]
        } }
    ],

    consigna: [
        { p: 'Creá el recurso **materias** en `rutas/materias.js`, montado en `/api/materias` desde `app.js`. Una materia tiene `id`, `nombre` y `horas`.' },
        { p: 'Empezá con este arreglo, tal cual:' },
        { codigo: 'const materias = [\n  { id: 1, nombre: \'Programacion\',  horas: 6 },\n  { id: 2, nombre: \'Base de Datos\', horas: 4 },\n  { id: 3, nombre: \'Ingles\',        horas: 2 }\n];' },
        { p: 'Tiene que soportar:' },
        { lista: [
            '`GET /api/materias` → todas. Con `?minimo=4`, sólo las de esa cantidad de horas **o más**.',
            '`GET /api/materias/:id` → una sola, o **404**.',
            '`POST /api/materias` → alta con id calculado por el servidor y estado **201**. Si falta `nombre` **o** falta `horas`, **400**.',
            '`PUT /api/materias/:id` → **404** si no existe, **400** si no viene `nombre`, y devuelve la materia modificada.',
            '`DELETE /api/materias/:id` → **404** si no existe, **204** si borró.'
        ] },
        { nota: 'Ojo con la validación de `horas`: una materia de 0 horas es un dato raro pero **válido**, y `!0` es `true`. Para ese campo la pregunta correcta es `req.body.horas === undefined`. Es exactamente la trampa del paso 8.' },
        { p: 'Y lo más importante: **todo lo de alumnos tiene que seguir funcionando igual**. Un recurso nuevo no rompe los que ya estaban.' }
    ],

    semilla: {
        'rutas/materias.js': '// rutas/materias.js — el desafío final\n\n'
    },

    probar: [
        { metodo: 'GET', ruta: '/api/materias' },
        { metodo: 'GET', ruta: '/api/materias?minimo=4' },
        { metodo: 'GET', ruta: '/api/materias/2' },
        { metodo: 'POST', ruta: '/api/materias', cuerpo: '{ "nombre": "Redes", "horas": 3 }' },
        { metodo: 'POST', ruta: '/api/materias', cuerpo: '{ "horas": 3 }' },
        { metodo: 'DELETE', ruta: '/api/materias/1' },
        { metodo: 'GET', ruta: '/api/alumnos' }
    ],

    solucion: {
        'app.js': 'const express = require(\'express\');\nconst rutasAlumnos = require(\'./rutas/alumnos\');\nconst rutasMaterias = require(\'./rutas/materias\');\n\nconst app = express();\n\napp.use((req, res, next) => {\n  console.log(req.method + \' \' + req.originalUrl);\n  next();\n});\n\napp.use(express.json());\n\napp.get(\'/\', (req, res) => {\n  res.send(\'API de alumnos de la EETP 602\');\n});\n\napp.use(\'/api/alumnos\', rutasAlumnos);\napp.use(\'/api/materias\', rutasMaterias);\n\napp.listen(3000, () => {\n  console.log(\'Servidor escuchando en http://localhost:3000\');\n});\n',
        'rutas/materias.js': 'const express = require(\'express\');\nconst router = express.Router();\n\nconst materias = [\n  { id: 1, nombre: \'Programacion\',  horas: 6 },\n  { id: 2, nombre: \'Base de Datos\', horas: 4 },\n  { id: 3, nombre: \'Ingles\',        horas: 2 }\n];\n\nfunction proximoId() {\n  if (materias.length === 0) {\n    return 1;\n  }\n  return Math.max(...materias.map(m => m.id)) + 1;\n}\n\nrouter.get(\'/\', (req, res) => {\n  let resultado = materias;\n\n  if (req.query.minimo) {\n    resultado = resultado.filter(m => m.horas >= Number(req.query.minimo));\n  }\n\n  res.json(resultado);\n});\n\nrouter.get(\'/:id\', (req, res) => {\n  const materia = materias.find(m => m.id === Number(req.params.id));\n\n  if (!materia) {\n    return res.status(404).json({ error: \'No existe la materia \' + req.params.id });\n  }\n\n  res.json(materia);\n});\n\nrouter.post(\'/\', (req, res) => {\n  if (!req.body.nombre) {\n    return res.status(400).json({ error: \'Falta el nombre\' });\n  }\n\n  if (req.body.horas === undefined) {\n    return res.status(400).json({ error: \'Faltan las horas\' });\n  }\n\n  const nueva = {\n    id: proximoId(),\n    nombre: req.body.nombre,\n    horas: req.body.horas\n  };\n\n  materias.push(nueva);\n  res.status(201).json(nueva);\n});\n\nrouter.put(\'/:id\', (req, res) => {\n  const materia = materias.find(m => m.id === Number(req.params.id));\n\n  if (!materia) {\n    return res.status(404).json({ error: \'No existe la materia \' + req.params.id });\n  }\n\n  if (!req.body.nombre) {\n    return res.status(400).json({ error: \'Falta el nombre\' });\n  }\n\n  materia.nombre = req.body.nombre;\n\n  if (req.body.horas !== undefined) {\n    materia.horas = req.body.horas;\n  }\n\n  res.json(materia);\n});\n\nrouter.delete(\'/:id\', (req, res) => {\n  const indice = materias.findIndex(m => m.id === Number(req.params.id));\n\n  if (indice === -1) {\n    return res.status(404).json({ error: \'No existe la materia \' + req.params.id });\n  }\n\n  materias.splice(indice, 1);\n  res.status(204).send();\n});\n\nmodule.exports = router;\n'
    },

    chequeos: [
        { fuente: { archivo: 'rutas/materias.js', debeTener: [
            { re: 'express\\.Router\\s*\\(\\s*\\)', que: 'Falta const router = express.Router();' },
            { re: 'module\\.exports\\s*=\\s*router', que: 'Falta module.exports = router;' }
          ] } },
        { fuente: { archivo: 'app.js', debeTener: [
            { re: 'app\\.use\\(\\s*[\'"]/api/materias[\'"]', que: 'Falta montar el router de materias con app.use(\'/api/materias\', ...).' }
          ] } },
        { arranque: { escuchando: true } },

        { pedido: { metodo: 'GET', ruta: '/api/materias' },
          espera: { estado: 200, esArreglo: true, largo: 3, camposEnCadaUno: ['id', 'nombre', 'horas'] },
          pista: 'Copiá el arreglo de materias tal cual está en la consigna.' },
        { pedido: { metodo: 'GET', ruta: '/api/materias?minimo=4' },
          espera: { largo: 2, contieneObjeto: { nombre: 'Base de Datos' }, noContieneObjeto: { nombre: 'Ingles' } },
          pista: 'Es "esa cantidad o más": la comparación va con >=, no con >. Y acordate del Number().' },
        { pedido: { metodo: 'GET', ruta: '/api/materias/2' },
          espera: { estado: 200, jsonParcial: { id: 2, nombre: 'Base de Datos', horas: 4 } } },
        { pedido: { metodo: 'GET', ruta: '/api/materias/99' },
          espera: { estado: 404, camposEnCadaUno: ['error'] } },

        { pedido: { metodo: 'POST', ruta: '/api/materias', json: { horas: 3 } },
          espera: { estado: 400 },
          pista: 'Sin nombre es 400.' },
        { pedido: { metodo: 'POST', ruta: '/api/materias', json: { nombre: 'Redes' } },
          espera: { estado: 400 },
          pista: 'Sin horas también es 400.' },
        { pedido: { metodo: 'POST', ruta: '/api/materias', json: { nombre: 'Taller', horas: 0 } },
          espera: { estado: 201, jsonParcial: { nombre: 'Taller', horas: 0 } },
          pista: 'Cero horas es un valor VÁLIDO. Si te lo rechaza, estás validando con !req.body.horas en vez de req.body.horas === undefined.' },
        { pedido: { metodo: 'POST', ruta: '/api/materias', json: { nombre: 'Redes', horas: 3 } },
          espera: { estado: 201, jsonParcial: { nombre: 'Redes', horas: 3 }, camposEnCadaUno: ['id'] } },
        { pedido: { metodo: 'GET', ruta: '/api/materias' },
          espera: { largo: 5 },
          pista: 'Las tres del principio más las dos que se dieron de alta (Taller y Redes).' },

        { pedido: { metodo: 'PUT', ruta: '/api/materias/3', json: { nombre: 'Ingles Tecnico', horas: 3 } },
          espera: { estado: 200, jsonParcial: { id: 3, nombre: 'Ingles Tecnico', horas: 3 } } },
        { pedido: { metodo: 'PUT', ruta: '/api/materias/99', json: { nombre: 'Nada' } },
          espera: { estado: 404 } },
        { pedido: { metodo: 'PUT', ruta: '/api/materias/1', json: {} },
          espera: { estado: 400 } },

        { pedido: { metodo: 'DELETE', ruta: '/api/materias/1' },
          espera: { estado: 204, cuerpoVacio: true } },
        { pedido: { metodo: 'DELETE', ruta: '/api/materias/1' },
          espera: { estado: 404 },
          pista: 'Borrar dos veces la misma materia: la segunda es 404.' },
        { pedido: { metodo: 'GET', ruta: '/api/materias' },
          espera: { largo: 4, noContieneObjeto: { id: 1 } } },

        { pedido: { metodo: 'GET', ruta: '/api/alumnos' },
          espera: { estado: 200, largo: 3 },
          pista: 'Agregar materias no puede romper alumnos. Si esto falla, algo del router de alumnos se movió de lugar.' },
        { pedido: { metodo: 'GET', ruta: '/api/alumnos/1' },
          espera: { estado: 200, jsonParcial: { nombre: 'Ana Torres' } } }
    ]
}

];
