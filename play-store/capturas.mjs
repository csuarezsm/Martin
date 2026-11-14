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
const RUNS = { 0: PART['uga_l01_water_delivery|RUTA-ALTA'].runs, 2: PART['uga_l03_dry_ravine'].runs, 6: PART['norte_l07_el_golfo'].runs, 14: PART['uga3_l02_calles'].runs, 16: PART['uga3_l04_fila'].runs, 21: PART['norte_e01_jable_famara'].runs, 22: PART['norte_e02_barcas_orzola'].runs, 23: PART['sur_e03_rios_de_fuego'].runs };
// Prepara cada pantalla dentro de la app (se ejecuta en el navegador)
const setup = async ([name, RUNS]) => {
  const M_ = __martin.M;
  // repite la partida del robot del nivel idx hasta el paso «ticks» (o hasta que «hasta» diga que pare) y deja la escena dibujada, sin que corra el reloj
  const avanza = (idx, ticks, hasta) => {
    const runs = RUNS[idx]; jugar(idx, 'nivel'); const R = __martin.RUN, s = R.s, L = R.L; M_.empezar(s); let t = 0;
    fuera: for (let i = 0; i < runs.length; i += 2) for (let j = 0; j < runs[i + 1]; j++, t++) { if (t >= ticks || (hasta && hasta(s))) break fuera; M_.paso(L, s, runs[i]); }
    R.overlay = ''; ponOverlay(); R.fase = t / 6; R.t = t * (M_.DT || 1 / 60); R.on = false; cancelAnimationFrame(R.raf); const vx = s.vx; s.vx = 0; for (let k = 0; k < 90; k++) dibujar(16); s.vx = vx; hud(); const hi = document.getElementById('mgHint'); if (hi && name !== '1-partida') hi.classList.remove('on'); return t;
  };
  const hechos = (n, frutos) => { S.prog = {}; for (let i = 0; i < n; i++) { const p = prog(i); Object.assign(p, { done: true, stars: 3 - (i % 3 === 2), bestMs: 100000 + i * 9000, bestAgua: 100 - i * 3, plays: 2 + i, fails: i % 2 });
      if (frutos.includes(i)) p.obj = frutosDe(__martin.NIV[i].nivel).map(o => o.id); } save(); };
  const total = idx => { let n = 0; for (let i = 1; i < RUNS[idx].length; i += 2) n += RUNS[idx][i]; return n; };
  if (name === '1-partida') avanza(0, 1325);
  if (name.startsWith('t-')) { const [, idx, f] = name.split('-'); avanza(+idx, Math.round(total(+idx) * f)); }
  if (name === 'manada') avanza(16, 1e9, s => s.x > 30 && s.guia != null && s.guia - s.x < 1.5);
  if (name === 'calles') avanza(14, 1e9, s => s.x > 25 && s.guia != null && s.guia - s.x < 3.5);
  if (name === 'jable') avanza(21, 1e9, s => s.x >= 40 && Math.abs(s.pend || 0) > 0.15);
  const enMov = s => { const L = __martin.RUN.L; return s.sobre != null && (L.movs || []).some(c => c.id === s.sobre); };
  if (name === 'barcas') avanza(22, 1e9, s => s.suelo && enMov(s) && (s.mvT = (s.mvT || 0) + 1) > 40);
  if (name === 'fuego') avanza(23, 1e9, s => s.suelo && enMov(s) && (s.mvT = (s.mvT || 0) + 1) > 25);
  if (name === '2-costa') avanza(6, 1e9, s => s.x >= 118);
  if (name === '3-lava') {   // la lava, a la vista y justo detrás de Martín
    avanza(2, 1e9, s => s.lava != null && s.x >= 372 && s.suelo); const R = __martin.RUN, s = R.s;
    s.lava = s.x - R.cv.width / R.u * 0.2; for (let k = 0; k < 90; k++) dibujar(16); hud();
  }
  if (name === '4-mapa' || name === '8-reto') {
    hechos(7, [0, 1, 2, 4]); S.diario = name === '8-reto' ? { dia: retoInfoLocal().dia, ms: 118400, agua: 91 } : null; save(); salirAlMapa();
    RETO.estado = 'listo'; RETO.info = retoInfoLocal(); pintaDiario();
    if (name === '8-reto') document.getElementById('mpDiario').scrollIntoView({ block: 'start' });
    else { const m = document.querySelector('.mp-map'); if (m) m.scrollIntoView({ block: 'center' }); }
  }
  if (name === '5-cuaderno') { hechos(8, [0, 1, 2, 4]); salirAlMapa(); openCuaderno(); }
  if (name === '6-guia') { hechos(9, []); salirAlMapa(); openEspecie('lagarto'); }
  if (name === '7-final') { avanza(0, 1e9); terminar(); ponOverlay(); }
};
const SHOTS = process.env.SHOTS ? process.env.SHOTS.split(',') : ['1-partida', '2-costa', '3-lava', '4-mapa', '5-cuaderno', '6-guia', '7-final', '8-reto'];
const OUTD = process.env.OUTD || OUT;
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
    await p.addInitScript(() => { window.MARTIN_ONLINE_URL = ''; }); await p.addInitScript(() => { if (!sessionStorage.s) { localStorage.setItem('martin.v1', JSON.stringify({ onboarded: true, iosHint: true, sound: false })); sessionStorage.s = 1; } });
    await p.goto(APP); await p.waitForTimeout(800);   // que carguen las fotos del fondo
    await p.evaluate(setup, [name, RUNS]); await p.waitForTimeout(400);
    await p.evaluate(() => { const R = __martin.RUN; if (R.s && !R.on) dibujar(0); const t = document.querySelector('#toast'); if (t) t.classList.remove('on'); });   // vuelve a dibujar con todo cargado
    await p.waitForTimeout(name === '7-final' ? 900 : 300);
    await p.screenshot({ path: `${OUTD}${dev}-${name}.png` });
    await ctx.close();
  }
}
await b.close();
console.log('Listo: play-store/ (el icono y el gráfico destacado: python3 tools/iconos.py)');
