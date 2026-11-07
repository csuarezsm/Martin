// Genera las capturas y gráficos para la ficha de Google Play.
// Uso (desde la raíz del repo): node play-store/capturas.mjs [movil|tablet7|tablet10]
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
const ROOT = fileURLToPath(new URL('../', import.meta.url));
const OUT = ROOT + 'play-store/';
const APP = 'file://' + ROOT + 'www/index.html';
let b; try { b = await chromium.launch(); } catch (e) { b = await chromium.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome' }); }

// Partidas del robot (para llevar a Martín a un punto concreto del nivel sin jugar a mano)
const PART = JSON.parse(readFileSync(ROOT + 'tests/partidas.json', 'utf8'));
// Prepara cada pantalla dentro de la app (se ejecuta en el navegador)
const setup = async ([name, runs]) => {
  const avanza = (ticks) => {                       // repite la partida del robot hasta ese paso y deja la escena dibujada, sin que corra el reloj
    jugar(0, 'nivel'); const R = __martin.RUN, s = R.s, L = R.L; M_.empezar(s); let t = 0;
    for (let i = 0; i < runs.length && t < ticks; i += 2) for (let j = 0; j < runs[i + 1] && t < ticks; j++, t++) M_.paso(L, s, runs[i]);
    R.overlay = ''; ponOverlay(); R.fase = t / 6; R.on = false; cancelAnimationFrame(R.raf); dibujar(0); hud();
  };
  const M_ = __martin.M;
  if (name === '1-partida') avanza(1325);
  if (name === '2-camino') avanza(3875);
  if (name === '3-mapa' || name === '5-reto') {
    S.prog = { uga_l01_water_delivery: { done: true, stars: 3, bestMs: 102600, bestAgua: 100, plays: 4, fails: 1 }, uga_l02_after_the_storm: { done: true, stars: 2, bestMs: 141000, bestAgua: 82, plays: 3, fails: 0 } };
    S.diario = name === '5-reto' ? { dia: retoInfoLocal().dia, ms: 118400, agua: 91 } : null; save(); salirAlMapa();
    RETO.estado = 'listo'; RETO.info = retoInfoLocal(); pintaDiario();
    if (name === '5-reto') document.getElementById('mpDiario').scrollIntoView({ block: 'start' });
  }
  if (name === '4-final') { avanza(1e9); terminar(); ponOverlay(); }
};
const SHOTS = ['1-partida', '2-camino', '3-mapa', '4-final', '5-reto'];
const SIZES = [
  ['movil', 405, 720, 1080 / 405],
  ['tablet7', 600, 960, 2],
  ['tablet10', 1280, 800, 1.5],
];
const only = process.argv[2];
for (const [dev, w, h, dsf] of SIZES) {
  if (only && only !== dev) continue;
  for (const name of SHOTS) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dsf, isMobile: dev === 'movil', hasTouch: true });
    const p = await ctx.newPage();
    await p.addInitScript(() => { window.MARTIN_ONLINE_URL = ''; }); await p.addInitScript(() => { if (!sessionStorage.s) { localStorage.setItem('martin.v1', JSON.stringify({ onboarded: true, iosHint: true })); sessionStorage.s = 1; } });
    await p.goto(APP); await p.evaluate(setup, [name, PART['uga_l01_water_delivery|RUTA-ALTA'].runs]); await p.evaluate(() => document.querySelector('#toast') && document.querySelector('#toast').classList.remove('on')); await p.waitForTimeout(name === '4-final' ? 900 : 500);
    await p.screenshot({ path: `${OUT}${dev}-${name}.png` });
    await ctx.close();
  }
}
await b.close();
console.log('Listo: play-store/ (el icono y el gráfico destacado: node tools/iconos.mjs)');
