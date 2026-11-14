// Service worker: deja la versión web disponible sin conexión.
// En la app Android no hace falta (los archivos ya van dentro del APK) y podría servir
// una versión antigua tras actualizar, así que allí se da de baja solo.
const CACHE = 'martin-v3.4.2';
const ASSETS = ['./', 'index.html', 'martin.js', 'niveles.js', 'secretos.js', 'mundo3.js', 'extras.js', 'juego.js', 'dibujo.js', 'lugares.js', 'mapa-lz.js', 'naturaleza.js', 'paisaje-cueva.webp', 'camello.webp', 'guelfo.webp', 'paisaje-uga-iglesia.webp', 'paisaje-uga-calle.webp', 'paisaje-uga-vallito.webp', 'paisaje-uga-mercado.webp', 'paisaje-jable.webp', 'suelo-arena.webp', 'barca.webp', 'obj-higo.webp', 'obj-aljibe.webp', 'obj-tuno.webp', 'obj-malvasia.webp', 'obj-biberon.webp', 'obj-casa.webp', 'obj-control.webp', 'obj-repisa.webp', 'obj-ola.webp', 'obj-geiser.webp', 'obj-balsa.webp', 'obj-piedra.webp', 'obj-lava.webp', 'obj-agua.webp', 'obj-sal.webp', 'mercado-uga.webp', 'escena-biberon.webp', 'escena-calle-farolas.webp', 'guelfo-paso.webp', 'camellero-paso.webp', 'camellero-sube.webp', 'camellero-baja.webp', 'camellero-biberon.webp', 'camellero-llama.webp', 'camellero-agachado.webp', 'camellero.webp', 'echadero.webp', 'sendero-malpais.webp', 'fila-amanecer.webp', 'portada.webp', 'paisaje.webp', 'flora.webp', 'suelo-tierra.webp', 'suelo-lava.webp', 'paisaje-uga.webp', 'paisaje-timanfaya.webp', 'paisaje-geria.webp', 'paisaje-costa.webp', 'paisaje-ocaso.webp', 'paisaje-golfo.webp', 'paisaje-janubio.webp', 'paisaje-famara.webp', 'paisaje-haria.webp', 'paisaje-mirador.webp', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png', 'i18n-en.js', 'i18n-fr.js', 'i18n-de.js', 'i18n-it.js', 'idioma.js', 'masjuegos.js', 'audio-suave.js', 'turno.js', 'contador.js', 'invitacion.js', 'publicas.js', 'juegos/ajedrez.png', 'juegos/chinchon.png', 'juegos/pumba.png', 'juegos/damas.png', 'juegos/parchis.png', 'juegos/poker.png', 'juegos/uno.png', 'juegos/martin.png'];
const NATIVE = self.location.hostname === 'localhost' && self.location.protocol === 'https:';

self.addEventListener('install', e => {
  if (NATIVE) { self.skipWaiting(); return; }
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => NATIVE || k !== CACHE).map(k => caches.delete(k)));
    if (NATIVE) { await self.registration.unregister(); return; }
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', e => {
  if (NATIVE || e.request.method !== 'GET') return;
  // Solo los archivos de la propia app: lo demás (GitHub, PayPal…) va siempre a internet
  if (new URL(e.request.url).origin !== self.location.origin) return;
  // La página: primero internet (para tener siempre la última versión) y, sin conexión, la copia
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put('index.html', copy)); return res; })
      .catch(() => caches.match('index.html')));
    return;
  }
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }))
  );
});
