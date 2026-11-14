// Graba un vídeo corto de promoción (1280×720) con partidas del robot: node play-store/video.mjs → /tmp/video/promo.mp4
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { readFileSync, readdirSync, renameSync, mkdirSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
const ROOT = fileURLToPath(new URL('../', import.meta.url));
const TMP = process.env.VID || '/tmp/video/'; mkdirSync(TMP, { recursive: true });
const PART = JSON.parse(readFileSync(ROOT + 'tests/partidas.json', 'utf8'));
const W = 1280, H = 720, SEG = 3.6;
// [nivel, partida, desde qué fracción, texto]
const TOMAS = [
  [0, 'uga_l01_water_delivery|RUTA-ALTA', 0.16, 'Lleva el agua por Lanzarote'],
  [2, 'uga_l03_dry_ravine', -1, '¡Corre, que viene la lava!'],
  [22, 'norte_e02_barcas_orzola', 0.22, 'Cruza el mar en barca'],
  [23, 'sur_e03_rios_de_fuego', 0.2, 'Salta sobre ríos de fuego'],
  [21, 'norte_e01_jable_famara', 0.3, 'Sube y baja las dunas'],
  [14, 'uga3_l02_calles', 0.3, 'Sigue al camellero por Uga'],
];
const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-gpu-rasterization'] });
const partes = [];
for (let i = 0; i < TOMAS.length; i++) {
  const [idx, key, desde, txt] = TOMAS[i], runs = PART[key].runs;
  const ctx = await b.newContext({ viewport: { width: W, height: H }, recordVideo: { dir: TMP + 'raw/', size: { width: W, height: H } } });
  const p = await ctx.newPage();
  await p.addInitScript(() => { window.MARTIN_ONLINE_URL = ''; localStorage.setItem('martin.v1', JSON.stringify({ onboarded: true, iosHint: true, sound: false, coach: { mover: true, saltar: true } })); });
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(1200);
  await p.evaluate(([idx, runs, desde, txt]) => {
    try { closeModal(); } catch (e) {} for (let k = 0; k < NIV.length; k++) prog(k).done = true;
    window.MARTIN_REPLAY = runs; jugar(idx, 'nivel'); empezar();
    let n = 0; for (let j = 1; j < runs.length; j += 2) n += runs[j];
    if (desde < 0) { let j = 0; while (__martin.RUN.s.lava == null && j++ < n) paso1(); for (let k = 0; k < 90; k++) paso1(); }   // la lava: desde que empieza a bajar
    else for (let j = 0; j < n * desde; j++) paso1();
    const R = __martin.RUN; R.acc = 0; R.last = performance.now();
    const st = document.createElement('style'); st.textContent = '.mg-pad{display:none!important}.mg-hint{display:none!important}#promo{position:fixed;left:0;right:0;bottom:7%;text-align:center;font:800 54px "Inter Display",Inter,sans-serif;color:#ffd978;text-shadow:0 4px 18px #000,0 0 3px #000;z-index:99}'; document.head.appendChild(st);
    window.dispatchEvent(new Event('resize')); if (R.s.lava != null) { const pega = () => { if (R.s && R.s.lava != null) R.s.lava = Math.max(R.s.lava, R.s.x - 3.6); requestAnimationFrame(pega); }; pega(); }   // solo para el vídeo: la lava, a la vista
    const d = document.createElement('div'); d.id = 'promo'; d.textContent = txt; document.body.appendChild(d);
  }, [idx, runs, desde, txt]);
  await p.waitForTimeout(400);   // la cámara se coloca
  const t0 = Date.now(); await p.waitForTimeout(SEG * 1000 + 300);
  await ctx.close();
  const f = readdirSync(TMP + 'raw/').filter(x => x.endsWith('.webm')).map(x => TMP + 'raw/' + x).find(x => !partes.some(q => q.src === x));
  const out = `${TMP}p${i}.mp4`;
  execSync(`ffmpeg -y -loglevel error -sseof -${SEG + 0.2} -i "${f}" -t ${SEG} -vf "fps=30,fade=t=in:st=0:d=0.25,fade=t=out:st=${SEG - 0.25}:d=0.25" -c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p -an "${out}"`);
  partes.push({ src: f, out });
  console.log('toma', i, txt);
}
// cierre: título y lo esencial
const p = await b.newPage({ viewport: { width: W, height: H } });
const fondo = 'data:image/png;base64,' + readFileSync(ROOT + 'play-store/grafico-destacado-1024x500.png').toString('base64');
await p.setContent(`<html><body style="margin:0;width:${W}px;height:${H}px;background:#140805 url(${fondo}) center/cover;display:flex;align-items:flex-end;justify-content:flex-start;font-family:'Inter Display',Inter,sans-serif"><div style="margin:0 0 70px 60px;padding:18px 36px;border-radius:24px;background:#140805cc;color:#fff3e4;font:700 40px 'Inter Display',Inter;text-align:center">Gratis · Sin anuncios · Sin cuentas<br><span style="color:#ffd978;font-size:30px">24 niveles por Lanzarote y reto diario</span></div></body></html>`);
await p.screenshot({ path: TMP + 'fin.png' }); await b.close();
execSync(`ffmpeg -y -loglevel error -loop 1 -i ${TMP}fin.png -t 3.2 -vf "fps=30,fade=t=in:st=0:d=0.3,fade=t=out:st=2.8:d=0.4" -c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p ${TMP}pfin.mp4`);
writeFileSync(TMP + 'lista.txt', [...partes.map(q => q.out), TMP + 'pfin.mp4'].map(x => `file '${x}'`).join('\n'));
execSync(`ffmpeg -y -loglevel error -f concat -safe 0 -i ${TMP}lista.txt -c copy ${TMP}promo-mudo.mp4`);
console.log('Listo:', TMP + 'promo-mudo.mp4');
