// Monta las capturas de Google Play con un titular arriba (las capturas sin texto salen de capturas.mjs).
// Uso (desde la raíz del repo):
//   SHOTS=1-partida,3-lava,barcas,fuego,jable,calles,5-cuaderno,8-reto OUTD=/tmp/shots/ node play-store/capturas.mjs
//   OUTD=/tmp/shots/ node play-store/marcos.mjs
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
const ROOT = fileURLToPath(new URL('../', import.meta.url));
const OUT = ROOT + 'play-store/';
const IN = process.env.OUTD || '/tmp/shots/';
const TEXTOS = [
  ['1-partida', 'Lleva el agua por Lanzarote', 'Sin derramarla: salta con cabeza'],
  ['3-lava', '¡Corre, que viene la lava!', 'En Timanfaya baja por el camino detrás de ti'],
  ['barcas', 'Cruza el mar en barca', 'Las barcas de Órzola te llevan de muelle a muelle'],
  ['fuego', 'Salta sobre ríos de fuego', 'Súbete a las costras de roca que flotan'],
  ['jable', 'Las dunas del jable', 'Cuesta abajo se coge carrerilla'],
  ['calles', 'El guelfo de Uga', 'Mundo 3: sigue al camellero por las calles del pueblo'],
  ['5-cuaderno', 'Aprende mientras juegas', 'Lugares reales, plantas y animales, con fuentes oficiales'],
  ['8-reto', 'Reto diario para todos', 'El mismo nivel cada día y ranking con el mejor tiempo'],
];
const SIZES = [['movil', 1080, 1920], ['tablet7', 1200, 1920], ['tablet10', 1920, 1200]];
const b = await chromium.launch();
for (const [dev, W, H] of SIZES) {
  const p = await b.newPage({ viewport: { width: W, height: H } });
  for (let i = 0; i < TEXTOS.length; i++) {
    const [k, t1, t2] = TEXTOS[i];
    const img = 'data:image/png;base64,' + readFileSync(`${IN}${dev}-${k}.png`).toString('base64');
    const ancho = W > H;   // tablet de 10": titular más bajo y captura más ancha
    const band = ancho ? 200 : Math.round(H * 0.155), pad = ancho ? 36 : 44;
    await p.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>
      html,body{margin:0;width:${W}px;height:${H}px;overflow:hidden;font-family:'Inter Display','Inter',sans-serif}
      body{background:radial-gradient(120% 70% at 50% 0%,#7a2a0e 0%,#3a1408 45%,#140805 100%);display:flex;flex-direction:column;align-items:center}
      .t{height:${band}px;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:0 ${pad}px;box-sizing:border-box;width:100%}
      h1{margin:0;color:#ffd978;font-weight:800;font-size:${ancho ? 68 : W * 0.072}px;line-height:1.05;letter-spacing:-.01em;text-shadow:0 4px 18px #0009}
      p{margin:${ancho ? 10 : 16}px 0 0;color:#fff3e4;font-weight:500;font-size:${ancho ? 34 : W * 0.036}px;line-height:1.2;opacity:.92}
      .c{flex:1;display:flex;align-items:flex-start;justify-content:center;width:100%;padding-bottom:${pad}px;box-sizing:border-box;min-height:0}
      img{max-width:${W - pad * 2}px;max-height:100%;border-radius:${ancho ? 28 : 40}px;box-shadow:0 0 0 4px #ffd97855,0 24px 60px #000c}
    </style></head><body><div class="t"><h1>${t1}</h1><p>${t2}</p></div><div class="c"><img src="${img}"></div></body></html>`);
    await p.waitForTimeout(150);
    await p.screenshot({ path: `${OUT}${dev}-${i + 1}-${k.replace(/^\d-/, '')}.png` });
  }
  await p.close();
}
await b.close();
console.log('Listo: play-store/');
