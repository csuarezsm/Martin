# Martín: Los Caminos del Volcán · Qué tienes que hacer en GitHub (paso a paso)

Todo el trabajo está hecho por mí. Solo faltan los pasos que necesitan tu cuenta. Cuenta de GitHub: `csuarezsm`. Repositorio de la app: **Martin** (público). Alias de la clave de firma: `martin`. Paquete: `com.itcanarias.martin`.

## 0 · Crear el repositorio

1. GitHub → **New repository** → nombre **Martin** → **Public** → sin README ni .gitignore.
2. Avísame cuando exista y lo subo yo (no puedo crear repositorios públicos).

## 1 · Secretos de firma (una sola vez)

1. Repositorio **Martin** → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.
2. Crea dos secretos:
   - `ANDROID_KEYSTORE_BASE64` → pega todo el contenido del archivo `martin-keystore-base64.txt` que te envío en el chat (una sola línea larga).
   - `ANDROID_KEYSTORE_PASSWORD` → la contraseña que te doy en el chat.
3. Guarda a salvo `martin-release.jks` (alias `martin`) y la contraseña: si se pierden no podrás actualizar la app instalada.
4. Cuando termines, borra el `.txt` de base64 del ordenador.

## 2 · GitHub Pages (iPhone, descarga y privacidad)

1. Repositorio **Martin** → **Settings** → **Pages**.
2. *Source*: **Deploy from a branch** → Branch **main** → carpeta **/docs** → *Save*.
3. En 1–2 minutos funcionan https://csuarezsm.github.io/Martin/ (descarga), https://csuarezsm.github.io/Martin/app/ (app web para iPhone) y https://csuarezsm.github.io/Martin/privacidad.html.

## 3 · Primera versión (APK)

1. Pestaña **Actions** → workflow *Android* → **Re-run all jobs** (la primera vez falla por falta de secretos).
2. Tarda 8–12 minutos: pasa las pruebas (incluidas las del reto diario contra el servidor), compila, firma y crea la Release **v1.0.0**.
3. Pestaña **Releases**: deben estar `martin.apk` y `martin-play.aab`.
4. Android: abre https://csuarezsm.github.io/Martin/ en **Chrome** → «Descargar para Android». iPhone: abre `…/Martin/app/` en Safari → Compartir → «Añadir a pantalla de inicio».

## 4 · Servidor en línea (VPS) — solo el reto diario

El servidor ya tiene el reto de Martín en GitHub (`juegos-servidor` v2.6.0: `src/reto.js` + `motores/martin/`). Para que el **reto diario** funcione hay que actualizar el VPS **cuando tú lo decidas** (yo no lo he tocado):

```
cd /opt/juegos-servidor && git pull && bash despliegue/instalar-vps.sh
```

Sin eso, Martín funciona entero (6 niveles) y el reto diario se puede **practicar** pero no envía tiempos (dirá «sin conexión»). También entra el contador de instalaciones de Martín, Póker, UNO e Invasores.

## 5 · Otras apps: ya incluyen Martín en «Más juegos»

He actualizado Ajedrez, Damas, Pumba, Chinchón, Parchís, Póker, UNO e Invasores (nueva versión patch de cada una). Cuando su workflow termine, publica la Release y las apps ya instaladas verán la actualización. El catálogo común (`juegos-servidor/docs/juegos.json`) también lo incluye.

## 6 · Google Play (cuando quieras)

La ficha, los textos y las capturas están en `play-store/FICHA-GOOGLE-PLAY.md`. **Antes de publicar**, revisa que el nombre «Martín» esté libre como marca (el dossier lo deja pendiente).

© 2026 IT Canarias. Todos los derechos reservados.
