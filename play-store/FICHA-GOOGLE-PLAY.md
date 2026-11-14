# Martín: Los Caminos del Volcán · Ficha de Google Play

Paquete: `com.itcanarias.martin` · Archivo para subir: `martin-play.aab` (en la Release de GitHub) · Desarrollador: IT Canarias

Las imágenes de esta carpeta se generan con `python3 tools/iconos.py` (icono y gráfico) y con `capturas.mjs` + `marcos.mjs` (capturas con titular); el vídeo, con `video.mjs`.

> ⚠️ **Revisión de marca pendiente**: el dossier del proyecto deja el nombre definitivo «Martín» pendiente de verificación (búsqueda de marca y de nombres en Google Play) antes de publicar en tiendas. El subtítulo «Los Caminos del Volcán» ayuda a distinguirlo. Martín y su historia son ficción; los niveles recorren lugares reales de Lanzarote, dibujados (no son fotos), y los textos del cuaderno y de la guía citan fuentes oficiales.

## Recursos gráficos

| Archivo | Uso en Play Console |
| --- | --- |
| `icono-512.png` | Icono de la aplicación (512×512) |
| `grafico-destacado-1024x500.png` | Gráfico destacado |
| `movil-1…8-*.png` (1080×1920) | Capturas de teléfono (las 8, en este orden) |
| `tablet7-1…8-*.png` (1200×1920) | Capturas de tablet de 7" |
| `tablet10-1…8-*.png` (1920×1200) | Capturas de tablet de 10" |
| Vídeo de YouTube | Vídeo promocional (ver abajo) |

Orden de las capturas, cada una con su titular: 1-partida (Uga), 2-lava (la lava persigue a Martín), 3-barcas (Órzola), 4-fuego (ríos de lava en Timanfaya), 5-jable (dunas de Famara), 6-calles (Mundo 3, el guelfo y el camellero), 7-cuaderno (aprende mientras juegas), 8-reto (reto diario y mapa).

Cómo se regeneran (desde la raíz del repo):

```bash
SHOTS=1-partida,3-lava,barcas,fuego,jable,calles,5-cuaderno,8-reto OUTD=/tmp/shots/ node play-store/capturas.mjs   # capturas sin texto
OUTD=/tmp/shots/ node play-store/marcos.mjs                                                                     # con titular
node play-store/video.mjs                                                                                       # vídeo (necesita la web en http://localhost:8765)
```

### Vídeo promocional (25 s)

Google Play solo admite un enlace de YouTube:

1. Sube `promo.mp4` a YouTube (canal de IT Canarias), visibilidad **Pública** u **Oculta** (no «Privada»).
2. Sin anuncios en el vídeo (Play lo exige) y sin restricción de edad.
3. Pega el enlace (`https://www.youtube.com/watch?v=…`) en Play Console → Ficha de Play Store → Vídeo.

Son seis tomas reales de partidas del robot en modo «tranquilo» (`node tools/partidas-video.cjs`: solo salta cuando hace falta) (Uga, la lava, las barcas, los ríos de fuego, el jable y las calles de Uga), con un titular cada una, y un cierre: «Gratis · Sin anuncios · Sin cuentas». Suena la música del juego.

## Ficha principal

**Nombre de la aplicación** (máx. 30)
Martín: Los Caminos del Volcán

**Descripción breve** (máx. 80)
Lleva el agua por Lanzarote: 24 niveles, lava, barcas, dunas y reto diario

**Descripción completa**

Martín es un guelfo, una cría de camello canario de Uga, y existe de verdad. Tras una tormenta, los caminos de la isla han quedado dañados y hay que llevar el agua sin derramarla. Un juego de plataformas con reglas claras, para partidas cortas y para toda la familia. Sin anuncios y sin cuentas.

🐪 UN JUEGO DE REGLAS CLARAS
• Un salto (más alto si lo mantienes) y nada de trucos: lo que pasa siempre tiene una causa que se ve.
• El agua baja con las caídas fuertes, los golpes contra las rocas y los huecos. Con 0, se reintenta.
• Puntos de control, pistas en cada tramo y tres estrellas por nivel. En las primeras partidas, el botón que toca pulsar se ilumina.

🌋 24 NIVELES POR LANZAROTE
• Mundo 1, Uga y el sur: rocas, grietas, géiseres… y en Timanfaya la lava baja por el camino detrás de ti.
• Mundo 2, la costa y el norte: El Golfo, Janubio, Famara, Haría y el Mirador del Río, con el mar en movimiento.
• Mundo 3, el guelfo de Uga: cómo Martín aprendió a ser camello, siguiendo al camellero y a la manada por el pueblo.
• Niveles nuevos: las dunas del jable de Famara, las barcas de Órzola y los ríos de fuego, donde hay que subirse a las costras de roca que flotan.
• Niveles secretos y un nivel de premio que se abren recogiendo todos los frutos y biberones.

📖 APRENDE MIENTRAS JUEGAS
• Cuaderno de viaje: cada nivel abre la ficha de su lugar real, con datos de fuentes oficiales.
• Sellos: recoge los 3 frutos de un nivel (tunos, higos, uvas…) y gana su sello y una curiosidad más.
• Guía de la naturaleza: el camello canario, el lagarto atlántico, el bejeque, la tabaiba, la palmera canaria… 11 plantas y animales de la isla, explicando cuáles solo viven aquí y cuáles llegaron de fuera.

🏆 LOGROS Y RETO DIARIO
• 16 logros para conseguir por toda la isla.
• Cada día, el mismo nivel y las mismas condiciones para todos, con ranking del mejor tiempo. El servidor repite tu partida para comprobar que es posible.

🧒 MODO PEQUE
• Para los más pequeños: se derrama la mitad de agua, la lava va más despacio y las pistas no se quitan.

👆 CONTROLES A TU GUSTO
• Botones grandes con multitáctil, mano invertida y teclado en tablet y ordenador.
• Vibración suave en los golpes y al coger fruta (se puede quitar). Pausa automática si sales de la app.

✨ HECHO EN LANZAROTE
• Música propia en cada zona: viento y pájaros en el sur, olas y gaviotas en la costa, arena en el jable y el retumbar del volcán en Timanfaya.
• Temas de colores y tamaño de letra. Funciona en vertical, en horizontal y en tablet, también en móviles sencillos, y en español, inglés, francés, alemán e italiano.

🔒 SIN ANUNCIOS Y SIN CUENTAS
Tu progreso se guarda solo en tu móvil. Solo si juegas el reto diario se envían el nombre que pongas y las pulsaciones de esa partida, para comprobar el tiempo.

Juego de entretenimiento sin apuestas. Martín está inspirado en un guelfo real de Uga; la historia del juego es inventada, y los lugares, las plantas y los animales son de Lanzarote. App desarrollada en Lanzarote por IT Canarias, con dibujos, sonidos y código propios. Mapa: © colaboradores de OpenStreetMap.

## Datos de la ficha

| Campo | Valor |
| --- | --- |
| Tipo | Juego |
| Categoría | Plataformas (o Educativos / Aventuras) |
| Etiquetas | Plataformas, Aventura, Un jugador, Casual, Educativo |
| Correo de contacto | [correo de contacto de IT Canarias] |
| Sitio web | https://itcanarias.com |
| Política de privacidad | https://csuarezsm.github.io/Martin/privacidad.html |
| Precio | Gratis |

## Contenido de la aplicación (formularios)

| Formulario | Respuesta |
| --- | --- |
| Política de privacidad | La URL de arriba (hay que activar GitHub Pages) |
| Acceso a la aplicación | Todas las funciones están disponibles sin restricciones |
| Anuncios | No contiene anuncios |
| Clasificación de contenido | Categoría «Juego». Violencia: **ninguna** (un camello, caídas y golpes contra rocas sin sangre). Sexo, lenguaje, drogas, apuestas: No. Interacción entre usuarios: **Sí, mínima** (ranking del reto diario con nombre o apodo; no hay chat) |
| Público objetivo | Todas las edades o 13+ (no hay chat, compras ni anuncios). Si se marca un público con menores de 13, Google aplica la Política de Familias: el ranking del reto con nombre libre obliga a revisarlo; lo más sencillo es 13+ |
| Seguridad de los datos | Reto diario: **Sí recoge** → «Información personal: Nombre» (apodo opcional) e «Identificadores de usuario/dispositivo» (identificador aleatorio de la app), más «Actividad en la app» (pulsaciones de la partida). Finalidad «Funciones de la aplicación». Cifrado en tránsito (HTTPS). Opcional: solo si se juega el reto. No se comparte con terceros. Se guarda unos 35 días (nombre, tiempo, agua y un resumen del identificador). |
| Aplicación gubernamental | No |
| Funciones financieras | Ninguna |
| Salud | Ninguna |
| Permisos | `INTERNET` y `VIBRATE` (vibración, que se puede quitar en Ajustes). El permiso de instalar paquetes va solo en la versión de GitHub, no en el AAB de Play |

## Versión

- Nombre de la versión: el mismo que la Release (por ejemplo, 1.0.0).
- Notas: copia la primera línea del commit de la Release.

## Firma

Play App Signing activado (opción por defecto). La clave de subida es `martin-release.jks` (alias `martin`), la misma que firma el APK de GitHub.

## Cuenta

- Cuenta personal: prueba cerrada con 12 testers durante 14 días seguidos antes de producción.
- Cuenta de organización (con número D-U-N-S): sin ese requisito.

© 2026 IT Canarias. Todos los derechos reservados.
