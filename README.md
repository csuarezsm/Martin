# Martín: Los Caminos del Volcán

Un camello canario joven de Uga lleva el agua por los caminos que dejó la tormenta: lava, rocas, huecos y bajadas. **11 niveles de plataformas en dos mundos** con tres estrellas cada uno, a veces con dos caminos (uno rápido y arriesgado, otro lento y seguro), y un **reto diario** igual para todos con ranking.
Para Android e iPhone. Gratis, sin anuncios y sin cuentas. App Capacitor + web (`www/`). Todo se guarda en el móvil; solo el reto diario usa el servidor de juegos (nombre y pulsaciones, para comprobar el tiempo).
Paquete: `com.itcanarias.martin` · versión 2.4.6

Novedades de la 2.3: **Mundo 2 · La costa y el norte**, con 5 niveles nuevos en El Golfo, las Salinas de Janubio (¡la sal resbala!), Famara, Haría (por las copas de las palmeras) y el Mirador del Río, y sus fichas en el Cuaderno de viaje.

De la 2.2: **¡la lava te persigue en Timanfaya!**, **aljibes** que reponen agua, **3 frutos escondidos** por nivel (tunos, higos y uvas malvasía) y el **fantasma** de tu mejor carrera para competir contra ti mismo.

De la 2.1: **peligros vivos** (piedras que ruedan, géiseres de vapor, rachas de viento, olas y suelo que se hunde), sacudidas, polvo y sonidos nuevos.

De la 2.0: **Cuaderno de viaje**. Cada nivel recorre un lugar real de Lanzarote (Uga, los molinos de Tiagua y Teguise, Timanfaya, La Geria, Los Hervideros y Teguise) y, al terminarlo, se abre su ficha divulgativa con un dato curioso y sus fuentes. Los textos están en `www/lugares.js`.

**iPhone y navegadores**: la misma app se publica como versión web instalable en https://csuarezsm.github.io/Martin/app/ (GitHub Pages, carpeta `docs/app`, copia de `www/`). En Safari: Compartir → «Añadir a pantalla de inicio». Tras cambiar `www/`, ejecuta `npm run web`.

© 2026 IT Canarias. Todos los derechos reservados. Martín, Uga y sus caminos son ficción inspirada en Lanzarote; dibujos, sonidos y código propios.

Hecha con la misma plantilla que Ajedrez, Damas, Chinchón, Pumba, Parchís, Póker, UNO e Invasores espaciales (tema por defecto: volcán). Las reglas, con sus fuentes, están en [REGLAS.md](REGLAS.md).

## Qué hace

- **Plataformas con reglas claras**: un salto (más alto si lo mantienes), coyote time y jump buffer; el agua baja solo por caídas fuertes, golpes contra rocas y huecos, y siempre se ve la causa.
- **11 niveles**: Mundo 1 · Uga y el sur (Agua para Uga, Tras la tormenta, El barranco seco, Bajada a la hoya, Dos caminos, El gran encargo) y Mundo 2 · La costa y el norte (La laguna verde, Las salinas, Bajo el risco, Las mil palmeras, Lo alto del risco), con punto de control, pistas por tramos, estrellas y récords de tiempo y agua.
- **Reto diario**: mismo nivel y condiciones para todos (agua normal, cántaro frágil o poca agua); el servidor repite tu partida con tus pulsaciones para comprobar el tiempo (`juegos-servidor`, `src/reto.js`).
- Botones grandes con multitáctil, mano invertida, teclado, pausa automática al perder el foco, tamaño de letra y colores a tu gusto.
- Español, inglés, francés, alemán e italiano. Copia de seguridad automática, exportar e importar.

## Motor y niveles

- `www/martin.js`: reglas y física deterministas a 1/60 s (el **mismo archivo** que usa el servidor: `motores/martin/martin.js`). `Martin.repetir(nivel, runs, {mod})` repite una partida a partir de sus pulsaciones.
- `www/niveles.js`: niveles en JSON (esquema v0.2, validados con suma de control). Se generan con `node tools/niveles.mjs`.
- `tools/bot.cjs`: robot (búsqueda en haz) que comprueba que cada nivel y cada ruta se pueden terminar. `node tools/comprobar-niveles.cjs [n]`.
- `tools/generar-partidas.cjs`: graba las partidas del robot para las pruebas de la app (`tests/partidas.json`).
- `tools/iconos.py`: crea los iconos, la pantalla de arranque y el gráfico de Play con la ilustración de Martín sobre el paisaje de Timanfaya.

## Pruebas

`npm test` = `tests/motor.test.mjs` (casos T01–T28 del dossier + los 11 niveles con el robot) y `tests/app.test.mjs` (Playwright: móvil, horizontal, tablet, multitáctil, pausa, los 6 niveles de principio a fin, copias, idiomas, JSON inválido y reto diario contra una copia local del servidor).

## Publicar una versión

Sube `versionCode`/`versionName` en `android/app/build.gradle`, `APP_VERSION` en `www/index.html`, `CACHE` en `www/sw.js` y `version` en `package.json`; `npm run web`; commit y push a `main`. El workflow prueba, compila, firma y crea la Release. Pasos de la primera vez en [GITHUB-PASOS.md](GITHUB-PASOS.md).
