# Martín: Los Caminos del Volcán · Reglas y decisiones

Juego **original** de IT Canarias, diseñado a partir del dossier «Martín — Proyecto de videojuego y Nivel 01 (MARTIN-L01-001)», de 07/11/2026. Como el juego es propio, **mandan las reglas del dossier** (no hay reglamento oficial que contrastar). Estas reglas son también la especificación de las pruebas automáticas (`tests/motor.test.mjs`, casos T01–T28 del dossier).

Los valores de arranque (los «TUN» del dossier) están en `www/martin.js` y se pueden afinar tras probar con gente. **Los nombres Martín, Uga y los caminos son ficción** inspirada en los colores y formas de Lanzarote: no son rutas reales ni deben imitarse.

## Qué se juega

Martín es un camello canario joven criado en Uga. Tras una tormenta ficticia, varios caminos quedan dañados. Hay que **llevar un cántaro de agua** desde el inicio hasta el punto de entrega (la casita blanca con el pozo) **sin quedarse sin agua**.

## Controles

- ◀ ▶ caminan; al soltar, Martín frena enseguida. Con las dos direcciones pulsadas manda la última.
- Un **salto**, sin doble salto: cuanto más tiempo se mantiene (hasta unos 0,17 s) más alto llega (≈1,5 u el corto, ≈1,9 u el largo).
- **Coyote time** (0,10 s): se puede saltar un instante después de salir del borde. **Jump buffer** (0,12 s): si se pulsa justo antes de aterrizar, el salto se hace al tocar el suelo.
- Teclado: flechas o A/D, barra espaciadora (o ↑/W) para saltar, Esc/P para pausa.
- Botones grandes con multitáctil; opción de mano invertida.

## El agua (de 0 a 100)

| Situación | Efecto |
| --- | --- |
| Aterrizar con fuerza media (caída desde más de ≈2,1 u de alto) | −12 |
| Aterrizar con mucha fuerza (caída desde más de ≈3,5 u) | −25 |
| Chocar de lado contra una **roca** con prisa (velocidad > 2,5 u/s) | −10 |
| Chocar contra una pared de tierra, ir despacio, saltar o bajar escalones normales | 0 |
| Caerse por un hueco | −15 y vuelta al **último punto de control** (o al inicio) |

- Un mismo golpe solo cuenta una vez y después hay un instante de 0,35 s sin daño.
- Con 0 de agua la misión falla (y con 0 no se completa aunque se cruce la meta: prevalece el fallo).
- El punto de control **no repone el agua**.
- Con menos de 30 de agua sale un aviso con símbolo y borde discontinuo (no solo color).

## Meta y estrellas

- Se completa al llegar al punto de entrega con al menos 1 de agua; el reloj se detiene exactamente una vez.
- ★ entregar el agua · ★★ llegar con el agua que pide el nivel (normalmente 75 o más) · ★★★ además, dentro del tiempo del nivel.
- Se guardan por separado el mejor tiempo y la mejor cantidad de agua.

## Mundo de Uga (6 niveles)

| Nivel | Nombre | Longitud | Tiempo ★★★ | Novedad |
| --- | --- | --- | --- | --- |
| 1 | Agua para Uga | 420 u | 3 min | Nivel de referencia del dossier: huecos de 1,4 u (x 88 y 116), rocas (x 171–176), punto de control en x = 205, bifurcación (x 218–280) y meta en x = 414 |
| 2 | Tras la tormenta | 539 u | 3 min 30 s | Rocas y tramos más largos |
| 3 | El barranco seco | 506 u | 3 min 20 s | Grietas: saltos desde el mismo borde |
| 4 | Bajada a la hoya | 438 u | 3 min 30 s | Larga bajada: las caídas altas derraman el agua |
| 5 | Dos caminos | 481 u | 3 min 40 s | Camino alto (repisas con huecos) o bajo (firme con rocas) |
| 6 | El gran encargo | 621 u | 5 min | Todo lo aprendido, con 4 puntos de control |

Un nivel se abre al terminar el anterior. La **ruta alta** del cruce es arriesgada (una caída desde la cubierta cuesta 25); la **baja** es segura. Con una partida perfecta ambas tardan lo mismo (decisión aceptada: la diferencia es de riesgo, no de tiempo).

## Reto diario

- Cada día hay **un nivel y unas condiciones iguales para todos**, que salen solo de la fecha (zona horaria de Canarias): agua normal, **cántaro frágil** (golpes y caídas derraman un 50 % más) o **poca agua** (se sale con 70).
- Gana el **menor tiempo**; a igual tiempo, más agua.
- La app envía las **pulsaciones** de la partida y el servidor la **repite con el mismo motor** (`motores/martin/martin.js` en `juegos-servidor`). Solo cuenta el tiempo que sale de esa repetición, y solo si llega a la meta. Esto comprueba que el tiempo es *físicamente posible con esas pulsaciones*; no puede distinguir a una persona de un programa.
- Se aceptan envíos del día y del anterior. El servidor guarda 35 días de resultados (día, nombre, tiempo, agua y un resumen del identificador).

## Decisiones tomadas (con Carlos)

- Alcance: **Mundo Uga entero (6 niveles)**, más allá de la recomendación del dossier (solo nivel 01 hasta validar con usuarios).
- Tecnología: **plantilla de IT Canarias** (Capacitor + JavaScript con canvas) en lugar de Flutter/Flame del dossier.
- En línea: **desafío diario con récord comparable**, validado por repetición de pulsaciones.
- Pendiente (dossier): el nombre definitivo «Martín» necesita revisión de marca antes de publicar en tiendas; sonido y dibujos son provisionales y propios.

## Fuentes

- Dossier «Martín — Proyecto de videojuego y Nivel 01 (MARTIN-L01-001)», 07/11/2026 (reglas, valores TUN, pruebas T01–T28).
- Ministerio de Agricultura, Pesca y Alimentación — Ficha oficial de la raza Camello Canario: https://www.mapa.gob.es/es/ganaderia/temas/zootecnia/razas-ganaderas/razas/catalogo-razas/otras-especies/camello-canario (referencia del dromedario de una joroba).
- Gobierno de Canarias — Normas de visita de Timanfaya: https://www.gobiernodecanarias.org/parquesnacionales/timanfaya/visita/normas_de_visita/index.html (el juego no imita rutas reales y avisa de ello).
- Flame (https://docs.flame-engine.org/latest/index.html), citado en el dossier: no se usa; el juego se hace con la plantilla web de IT Canarias.
