// Graba un vídeo corto de promoción (1280×720) con partidas del robot: node play-store/video.mjs → /tmp/video/promo.mp4
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { readFileSync, readdirSync, renameSync, mkdirSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
const ROOT = fileURLToPath(new URL('../', import.meta.url));
const TMP = (process.env.VID || '/tmp/video/') + (process.env.VERTICAL ? 'v/' : ''); mkdirSync(TMP, { recursive: true });
const PART = JSON.parse(readFileSync(ROOT + 'play-store/partidas-video.json', 'utf8'));   // partidas tranquilas: node tools/partidas-video.cjs
const VERT = !!process.env.VERTICAL, W = VERT ? 720 : 1280, H = VERT ? 1280 : 720, SEG = 3.6, NOM = VERT ? 'promo-vertical' : 'promo';   // VERTICAL=1 → 720×1280 (Shorts, estados, redes)
// [nivel, partida, desde qué fracción, texto]
const TOMAS = [
  [0, 'uga_l01_water_delivery', 0.16, 'Lleva el agua por Lanzarote'],
  [2, 'uga_l03_dry_ravine', -1, '¡Corre, que viene la lava!'],
  [22, 'norte_e02_barcas_orzola', 0.22, 'Cruza el mar en barca'],
  [23, 'sur_e03_rios_de_fuego', 0.2, 'Salta sobre ríos de fuego'],
  [21, 'norte_e01_jable_famara', 0.3, 'Sube y baja las dunas'],
  [14, 'uga3_l02_calles', 0.3, 'Con el camellero por las calles de Uga'],
];
const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-gpu-rasterization'] });
const partes = [];
for (let i = 0; i < TOMAS.length; i++) {
  const [idx, key, desde, txt] = TOMAS[i], runs = PART[key].runs;
  const ctx = await b.newContext({ viewport: { width: W, height: H }, recordVideo: { dir: TMP + 'raw/', size: { width: W, height: H } } });
  const p = await ctx.newPage(); p.on('console', m => { if (m.text().startsWith('tramo')) console.log(m.text()); });
  await p.addInitScript(() => { window.MARTIN_ONLINE_URL = ''; localStorage.setItem('martin.v1', JSON.stringify({ onboarded: true, iosHint: true, sound: false, coach: { mover: true, saltar: true } })); });
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(1200);
  await p.evaluate(([idx, runs, desde, txt, SEGS]) => {
    try { closeModal(); } catch (e) {} for (let k = 0; k < NIV.length; k++) prog(k).done = true;
    let n = 0; for (let j = 1; j < runs.length; j += 2) n += runs[j];
    // primero una pasada en seco: se elige el tramo en el que Martín pasa más tiempo con los pies en el suelo (que no parezca que solo salta)
    window.MARTIN_REPLAY = runs; jugar(idx, 'nivel'); empezar();
    const T = [], L0 = __martin.RUN.L, enMov = st => st.sobre != null && (L0.movs || []).some(c => c.id === st.sobre);
    for (let j = 0; j < n; j++) { paso1(); const st = __martin.RUN.s; if (!st || (st.fase !== 'jugando' && st.fase !== 'reaparece')) break; T.push([st.suelo ? 1 : 0, enMov(st) ? 1 : 0, st.lava != null ? 1 : 0, st.fase === 'jugando' ? 1 : 0, st.guia != null && st.guia - st.x > 0.8 && st.guia - st.x < 6 ? 1 : 0]); }
    const V = Math.round(SEGS * 60), quiere = desde < 0 ? 2 : L0.guia ? 4 : (L0.movs && L0.movs.length ? 1 : -1);
    let mejor = Math.round(T.length * Math.max(0, desde)), mp = -1e9;
    for (let a = Math.round(T.length * (quiere === 4 ? 0.01 : 0.08)); a + V < T.length - 30; a += 10) {
      let pie = 0, extra = 0, ok = 1; for (let k = a; k < a + V; k++) { pie += T[k][0]; if (quiere >= 0) extra += T[k][quiere]; ok &= T[k][3]; }
      const pt = pie / V + (quiere >= 0 ? Math.min(0.5, extra / V) * (quiere === 4 ? 3 : 1.2) : 0) - (ok ? 0 : 5) - Math.abs(a / T.length - Math.max(0.05, desde)) * 0.15;
      if (pt > mp) { mp = pt; mejor = a; }
    }
    if (innerWidth < innerHeight) window.CAMARA_VIDEO = { x: 0.4, huye: 0.72, y: 0.16 };   // en vertical: Martín más centrado y menos tierra debajo
    window.MARTIN_REPLAY = runs; jugar(idx, 'nivel'); empezar();
    for (let j = 0; j < mejor; j++) paso1();
    console.log('tramo', idx, mejor, T.length, mp.toFixed(2));
    const R = __martin.RUN; R.acc = 0; R.last = performance.now();
    const st = document.createElement('style'); st.textContent = '.mg-pad{display:none!important}.mg-hint{display:none!important}#promo{position:fixed;left:0;right:0;' + (innerWidth < innerHeight ? 'top:13%;padding:0 30px;' : 'bottom:7%;') + 'text-align:center;font:800 ' + (innerWidth < innerHeight ? 46 : 54) + 'px "Inter Display",Inter,sans-serif;color:#ffd978;text-shadow:0 4px 18px #000,0 0 3px #000;z-index:99}'; document.head.appendChild(st);
    window.dispatchEvent(new Event('resize')); if (R.s.lava != null) { const pega = () => { if (R.s && R.s.lava != null) R.s.lava = Math.max(R.s.lava, R.s.x - 3.6); requestAnimationFrame(pega); }; pega(); }   // solo para el vídeo: la lava, a la vista
    const d = document.createElement('div'); d.id = 'promo'; d.textContent = txt; document.body.appendChild(d);
  }, [idx, runs, desde, txt, SEG]);
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
// el gráfico destacado (1024×500) entero, sin recortar: más ancho que 16:9, así que va arriba con su fondo difuminado y el texto debajo
const GW = W - (VERT ? 40 : 120), GH = Math.round(GW * 500 / 1024), GT = VERT ? Math.round((H - GH) / 2) - 120 : 34;
await p.setContent(`<html><body style="margin:0;width:${W}px;height:${H}px;overflow:hidden;background:#140805;font-family:'Inter Display',Inter,sans-serif">
  <div style="position:absolute;inset:-40px;background:url(${fondo}) center/cover;filter:blur(28px) brightness(.45)"></div>
  <img src="${fondo}" style="position:absolute;left:${(W - GW) / 2}px;top:${GT}px;width:${GW}px;height:${GH}px;border-radius:22px;box-shadow:0 0 0 3px #ffd97855,0 18px 50px #000c">
  <div style="position:absolute;left:0;right:0;top:${GT + GH + (VERT ? 50 : 22)}px;text-align:center;color:#fff3e4;font:700 ${VERT ? 36 : 38}px 'Inter Display',Inter;text-shadow:0 2px 10px #000">Gratis · Sin anuncios${VERT ? '<br>' : ' · '}Sin cuentas<div style="color:#ffd978;font-size:28px;margin-top:6px">24 niveles por Lanzarote y reto diario</div></div>
</body></html>`);
await p.waitForTimeout(200);
await p.screenshot({ path: TMP + 'fin.png' }); await b.close();
execSync(`ffmpeg -y -loglevel error -loop 1 -i ${TMP}fin.png -t 3.2 -vf "fps=30,fade=t=in:st=0:d=0.3,fade=t=out:st=2.8:d=0.4" -c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p ${TMP}pfin.mp4`);
writeFileSync(TMP + 'lista.txt', [...partes.map(q => q.out), TMP + 'pfin.mp4'].map(x => `file '${x}'`).join('\n'));
execSync(`ffmpeg -y -loglevel error -f concat -safe 0 -i ${TMP}lista.txt -c copy ${TMP}${NOM}-mudo.mp4`);
console.log('Listo:', TMP + NOM + '-mudo.mp4');
