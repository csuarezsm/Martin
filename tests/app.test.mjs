// Pruebas automáticas de la app Martín (IT Canarias): interfaz en móvil, horizontal y tablet, controles (también multitáctil),
// pausa al perder el foco, los 6 niveles terminados de principio a fin, copia de seguridad, idiomas, JSON de nivel inválido y
// el reto diario contra una copia local del servidor común (juegos-servidor).
// Se ejecutan en GitHub antes de compilar: si alguna falla, no se publica la versión.
// Uso local: node tests/app.test.mjs   (la parte del reto busca el servidor en ../juegos-servidor o en JUEGOS_SERVIDOR)
// Las partidas de los robots están en tests/partidas.json (se regeneran con: node tools/generar-partidas.cjs).
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let passed = 0, failed = 0;
const check = (name, cond, extra = '') => { if (cond) { passed++; console.log('  ✓ ' + name); } else { failed++; console.log('  ✗ ' + name + (extra ? ' → ' + extra : '')); if (process.env.GITHUB_ACTIONS) console.log('::error::' + name); } };

const ROOT = fileURLToPath(new URL('../www/', import.meta.url));
const PART = JSON.parse(fs.readFileSync(fileURLToPath(new URL('./partidas.json', import.meta.url)), 'utf8'));
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png' };
const server = http.createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(req.url.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
  try { const f = await readFile(join(ROOT, path === '/' ? 'index.html' : path)); res.writeHead(200, { 'content-type': TYPES[extname(path)] || 'text/html' }); res.end(f); }
  catch { res.writeHead(404); res.end(); }
});
await new Promise(r => server.listen(0, r));
const URL_APP = `http://localhost:${server.address().port}/`;
let browser;
try { browser = await chromium.launch(); } catch (e) { browser = await chromium.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome' }); }
const BASE_STATE = { onboarded: true, iosHint: true };
const IDS = ['uga_l01_water_delivery', 'uga_l02_after_the_storm', 'uga_l03_dry_ravine', 'uga_l04_basin_descent', 'uga_l05_two_roads', 'uga_l06_great_delivery'];

async function fresh(state, viewport, online = '', hooks = {}) {
  const ctx = await browser.newContext({ viewport: viewport || { width: 412, height: 860 }, isMobile: true, hasTouch: true, serviceWorkers: 'block', acceptDownloads: true });
  await ctx.route('https://api.github.com/**', r => r.abort());
  await ctx.route('https://csuarezsm.github.io/**', r => r.abort());
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', e => errors.push(e.message));
  await p.addInitScript(u => { window.MARTIN_ONLINE_URL = u; }, online);          // en las pruebas, nunca el servidor real
  await p.addInitScript(h => { if (h.turbo) window.MARTIN_TURBO = h.turbo; if (h.idioma) localStorage.setItem('idioma', h.idioma); }, hooks);
  await p.addInitScript(st => { if (st && !sessionStorage.getItem('seeded')) { localStorage.setItem('martin.v1', JSON.stringify(st)); sessionStorage.setItem('seeded', '1'); } }, state);
  await p.goto(URL_APP);
  return { p, ctx, errors };
}
const waitFor = (p, fn, arg, timeout = 15000) => p.waitForFunction(fn, arg, { timeout }).then(() => true, () => false);
const noHScroll = p => p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const store = p => p.evaluate(() => JSON.parse(localStorage.getItem('martin.v1')));
const R = p => p.evaluate(() => { const s = __martin.RUN.s; return s ? { fase: s.fase, x: s.x, y: s.y, agua: s.agua, t: s.t, estrellas: s.estrellas, ruta: s.ruta, causa: s.causa, caidas: s.caidas } : null; });
/** Juega un nivel entero repitiendo una partida del robot (a mucha velocidad) y devuelve el estado final */
async function juegaConRobot(p, idx, clave, extraOpts = null) {
  await p.evaluate(([runs, i, o]) => { window.MARTIN_REPLAY = runs; jugar(i, 'nivel', o || undefined); }, [PART[clave].runs, idx, extraOpts]);
  await waitFor(p, () => document.querySelector('#ovGo'));
  await p.click('#ovGo');
  await waitFor(p, () => __martin.RUN.s && __martin.RUN.s.fase === 'meta', null, 60000);
  return R(p);
}

/* ================= Mapa del mundo ================= */
console.log('Mapa de Uga');
{
  const { p, ctx, errors } = await fresh(BASE_STATE, null, '');
  check('abre en el mapa con los 6 niveles, solo el primero abierto', await waitFor(p, () => document.querySelectorAll('[data-lv]').length === 6 && document.querySelectorAll('.lv.bloq, .lv[disabled], .lv.locked').length >= 0));
  const abiertos = await p.evaluate(() => [...document.querySelectorAll('[data-lv]')].filter(b => !b.disabled && !b.classList.contains('bloq') && !b.classList.contains('locked')).length);
  check('solo el nivel 1 está abierto al empezar', abiertos === 1, String(abiertos));
  check('el título es Martín', (await p.textContent('#title')).includes('Martín'));
  check('tema volcán por defecto (oscuro cálido)', await p.evaluate(() => (getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '').toLowerCase().startsWith('#')));
  check('sin desbordamiento horizontal', await noHScroll(p));
  check('el reto diario se puede practicar sin conexión', await waitFor(p, () => document.querySelector('#dgPrac')));
  check('sale el «Mundo 2» como próximamente', /Muy pronto/.test(await p.textContent('#app')));
  await p.click('[data-lv="0"]');
  check('el briefing explica el nivel, las estrellas y los controles', await waitFor(p, () => document.querySelector('#bfGo')) && /Agua para Uga/.test(await p.textContent('#modal')) && /☆|★/.test(await p.textContent('#modal')));
  await p.click('#bfNo');
  await p.click('#menuBtn');
  check('el menú tiene historial, colores, idioma, reglas, borrar, compartir y más juegos', await waitFor(p, () => ['mArch', 'mGameRules', 'mTheme', 'mLang', 'mWipe', 'mShareApp', 'mMas', 'mAbout', 'mImp'].every(i => document.getElementById(i))));
  await p.click('#mGameRules');
  const reglas = await p.textContent('.sheet');
  check('las reglas explican el agua, el salto, los puntos de control y las estrellas', /−12/.test(reglas) && /−25/.test(reglas) && /punto de control/.test(reglas) && /★/.test(reglas) && /reto/i.test(reglas));
  check('las reglas citan que es ficción inspirada en Lanzarote', /Lanzarote/.test(reglas) && /Ficción/.test(reglas));
  await p.click('#grOk');
  await p.click('#menuBtn'); await p.click('#mTheme');
  const bgAntes = await p.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--bg').trim());
  await p.click('[data-theme="claro"]');
  check('cambiar el tema se aplica al momento', await waitFor(p, b => getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() !== b, bgAntes));
  check('sin errores de JavaScript', errors.length === 0, errors.join(' | '));
  await ctx.close();
}
{
  const { p, ctx } = await fresh({ iosHint: true });
  check('la primera vez sale la bienvenida', await waitFor(p, () => document.querySelector('#wbNext')));
  for (let k = 0; k < 3; k++) await p.click('#wbNext');
  await p.click('#wbNext');
  check('la bienvenida se cierra y no vuelve', await waitFor(p, () => document.querySelector('#modal').classList.contains('hidden')) && (await store(p)).onboarded === true);
  await ctx.close();
}

/* ================= Controles ================= */
console.log('Controles');
{
  const { p, ctx, errors } = await fresh(BASE_STATE, null, '');
  await p.click('[data-lv="0"]'); await p.click('#bfGo');
  check('aparece el campo, los tres botones y el HUD de agua y tiempo', await waitFor(p, () => ['mgCv', 'mgL', 'mgR', 'mgJ', 'mgAgua', 'mgTiempo', 'mgPausa'].every(i => document.getElementById(i))));
  check('empieza en «listo»: el reloj no corre hasta pulsar ▶', (await R(p)).fase === 'lista' && (await R(p)).t === 0);
  await p.click('#ovGo');
  check('al empezar, la partida corre', await waitFor(p, () => __martin.RUN.s.fase === 'jugando'));
  // botones con el ratón / un dedo
  const caja = id => p.evaluate(i => { const r = document.getElementById(i).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height }; }, id);
  const bR = await caja('mgR');
  check('los botones son lo bastante grandes para el dedo (≥ 56 px)', bR.w >= 56 && bR.h >= 56, JSON.stringify(bR));
  await p.mouse.move(bR.x, bR.y); await p.mouse.down(); await p.waitForTimeout(900);
  const a = await R(p);
  check('mantener ▶ camina a la derecha', a.x > 6, String(a.x));
  await p.mouse.up(); await p.waitForTimeout(500);
  const b = await R(p); await p.waitForTimeout(300); const c = await R(p);
  check('al soltar, Martín se detiene', c.x === b.x, b.x + ' → ' + c.x);
  // multitáctil: derecha + salto a la vez con dos dedos (T21)
  const cdp = await ctx.newCDPSession(p);
  const bJ = await caja('mgJ'), bR2 = await caja('mgR');
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: bR2.x, y: bR2.y, id: 1 }, { x: bJ.x, y: bJ.y, id: 2 }] });
  await p.waitForTimeout(150);
  const dos = await p.evaluate(() => ({ pila: [...__martin.RUN.inp.pila], salto: __martin.RUN.inp.salto, y: __martin.RUN.s.y }));
  check('T21 con dos dedos a la vez: se mueve y salta sin cancelarse', dos.pila.includes(1) && dos.salto === true, JSON.stringify(dos));
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [{ x: bJ.x, y: bJ.y, id: 2 }] });
  await p.waitForTimeout(100);
  const uno = await p.evaluate(() => ({ pila: [...__martin.RUN.inp.pila], salto: __martin.RUN.inp.salto }));
  check('T21 al levantar solo el dedo del salto, sigue caminando', uno.pila.includes(1) && uno.salto === false, JSON.stringify(uno));
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await p.waitForTimeout(100);
  check('T21 al levantar todo, no queda nada pulsado', await p.evaluate(() => __martin.RUN.inp.pila.length === 0 && !__martin.RUN.inp.salto));
  // teclado
  await p.keyboard.down('ArrowRight'); await p.waitForTimeout(400);
  const k1 = await R(p); await p.keyboard.up('ArrowRight');
  await p.keyboard.down('ArrowLeft'); await p.keyboard.down('ArrowRight'); await p.waitForTimeout(300);
  check('el teclado funciona; con dos direcciones manda la última (T01)', await p.evaluate(() => __martin.RUN.inp.pila.slice(-1)[0] === 1));
  await p.keyboard.up('ArrowLeft'); await p.keyboard.up('ArrowRight');
  await p.keyboard.press('Escape');
  check('Esc pausa', await waitFor(p, () => __martin.RUN.s.fase === 'pausa'));
  const pz = await R(p); await p.waitForTimeout(500); const pz2 = await R(p);
  check('T18 en pausa, nada se mueve y el reloj no corre', pz.x === pz2.x && pz.y === pz2.y && pz.t === pz2.t);
  await p.keyboard.press('Escape');
  check('T18 al reanudar vuelve a jugar', await waitFor(p, () => __martin.RUN.s.fase === 'jugando'));
  // pérdida de foco (T22)
  await p.keyboard.down('ArrowRight');
  await p.evaluate(() => window.dispatchEvent(new Event('blur')));
  check('T22 sin foco: pausa y ninguna pulsación retenida', await waitFor(p, () => __martin.RUN.s.fase === 'pausa') && await p.evaluate(() => __martin.RUN.inp.pila.length === 0 && !__martin.RUN.inp.salto));
  await p.keyboard.up('ArrowRight');
  // salir al mapa (T20)
  await p.evaluate(() => reanudar()); await p.waitForTimeout(100);
  await p.evaluate(() => abandonar());
  check('T20 al salir al mapa no queda simulación ni bucle activo', await waitFor(p, () => document.querySelectorAll('[data-lv]').length === 6) && await p.evaluate(() => !__martin.RUN.s && !__martin.RUN.on && !__martin.RUN.raf));
  check('sin errores de JavaScript', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

/* ================= Pantallas: móvil, horizontal, tablet (T23) ================= */
console.log('Pantallas');
for (const [nombre, vp] of [['móvil vertical', { width: 390, height: 844 }], ['móvil pequeño', { width: 320, height: 568 }], ['móvil horizontal', { width: 844, height: 390 }], ['tablet', { width: 1024, height: 768 }]]) {
  const { p, ctx, errors } = await fresh(BASE_STATE, vp, '');
  check(nombre + ': el mapa no se desborda', await noHScroll(p));
  await p.evaluate(() => jugar(0, 'nivel')); await waitFor(p, () => document.getElementById('mgCv'));
  await p.waitForTimeout(400);
  const lay = await p.evaluate(() => {
    const rc = id => { const r = document.getElementById(id).getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom }; };
    const W = innerWidth, H = innerHeight, ids = ['mgCv', 'mgL', 'mgR', 'mgJ', 'mgAgua', 'mgTiempo', 'mgPausa'], q = Object.fromEntries(ids.map(i => [i, rc(i)]));
    const dentro = ids.every(i => q[i].l >= -1 && q[i].t >= -1 && q[i].r <= W + 1 && q[i].b <= H + 1);
    const solapa = (a, b) => !(a.r <= b.l + 1 || b.r <= a.l + 1 || a.b <= b.t + 1 || b.b <= a.t + 1);
    const botones = ['mgL', 'mgR', 'mgJ'], sol = [];
    for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) if (solapa(q[botones[i]], q[botones[j]])) sol.push(botones[i] + '/' + botones[j]);
    return { dentro, sol, cv: q.mgCv, W, H };
  });
  check(nombre + ': campo, botones y HUD dentro de la pantalla', lay.dentro, JSON.stringify(lay));
  check(nombre + ': los botones no se solapan entre sí', lay.sol.length === 0, lay.sol.join(','));
  check(nombre + ': el campo ocupa un buen trozo de la pantalla', (lay.cv.r - lay.cv.l) >= lay.W * 0.8 && (lay.cv.b - lay.cv.t) >= lay.H * 0.4, JSON.stringify(lay.cv));
  check(nombre + ': sin desbordamiento durante la partida', await noHScroll(p));
  check(nombre + ': sin errores', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

/* ================= Los 6 niveles, de principio a fin ================= */
console.log('Niveles completos (partidas grabadas por el robot, repetidas en la app)');
{
  const { p, ctx, errors } = await fresh(BASE_STATE, null, '', { turbo: 60 });
  for (let i = 0; i < 6; i++) {
    const desb = await p.evaluate(i => desbloqueado(i), i);
    check('nivel ' + (i + 1) + ' abierto al terminar el anterior', desb);
    const rutas = Object.keys(PART).filter(k => k.startsWith(IDS[i]));
    for (const k of rutas) {
      const ruta = k.includes('|') ? k.split('|')[1] : '';
      const f = await juegaConRobot(p, i, k);
      check('nivel ' + (i + 1) + (ruta ? ' · ' + ruta : '') + ': llega a la meta con ' + (f && f.agua) + ' de agua (' + (f && (f.t / 60).toFixed(0)) + ' s)', f && f.fase === 'meta' && f.agua >= 1 && f.estrellas >= 1 && (!ruta || f.ruta === ruta), JSON.stringify(f));
      check('nivel ' + (i + 1) + (ruta ? ' · ' + ruta : '') + ': el resultado coincide exactamente con el del robot', f && f.t === Math.round(PART[k].ms * 60 / 1000) && f.agua === PART[k].agua, JSON.stringify([f && f.t, PART[k].ms, f && f.agua, PART[k].agua]));
    }
    await waitFor(p, id => { const q = S.prog[id]; return q && q.done; }, IDS[i]);
    const st = await store(p);
    const pr = st.prog && st.prog[IDS[i]];
    check('nivel ' + (i + 1) + ': se guarda el progreso (hecho, estrellas, mejor tiempo y agua)', pr && pr.done && pr.stars >= 1 && pr.bestMs > 0 && pr.bestAgua >= 1, JSON.stringify(pr));
    check('nivel ' + (i + 1) + ': sale la pantalla de «¡Entregado!»', await waitFor(p, () => /¡Entregado!/.test(document.getElementById('mgOv').textContent)));
    await p.evaluate(() => salirAlMapa());
  }
  check('al terminar los 6, el total de estrellas es 6 o más', (await p.evaluate(() => totalEstrellas())) >= 6);
  check('sin errores de JavaScript', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

/* ================= Fallo, reintento, desbloqueo y pistas ================= */
console.log('Fallo y reintento');
{
  const { p, ctx } = await fresh(BASE_STATE, null, '', { turbo: 60 });
  check('el nivel 2 está cerrado al empezar', !(await p.evaluate(() => desbloqueado(1))));
  await p.evaluate(() => { window.MARTIN_REPLAY = [2, 30000]; jugar(0, 'nivel'); });
  await waitFor(p, () => document.querySelector('#ovGo')); await p.click('#ovGo');
  check('caminar sin saltar: se cae por los huecos y se acaba el agua', await waitFor(p, () => __martin.RUN.s.fase === 'fallo', null, 60000));
  const f = await R(p);
  check('T11 el fallo se debe al agua o a las caídas y se ve el motivo', (f.causa === 'agua' || f.causa === 'caida') && await waitFor(p, () => /agua|caído/.test(document.getElementById('mgOv').textContent)), JSON.stringify(f));
  check('T11 con 0 de agua no se completa el nivel (T16)', f.fase === 'fallo' && !((await store(p)).prog || {})[IDS[0]]?.done);
  check('el fallo cuenta en el progreso', await waitFor(p, id => S.prog[id] && S.prog[id].fails >= 1, IDS[0]));
  await p.evaluate(() => { window.MARTIN_REPLAY = null; });
  await p.click('#ovRei');
  const r = await R(p);
  check('T19 reintentar deja todo como al principio: posición, agua, reloj y fase', r.fase === 'lista' && r.agua === 100 && r.t === 0 && r.x === 4 && r.caidas === 0, JSON.stringify(r));
  check('al reintentar no queda el aviso de fallo', await waitFor(p, () => !/Se ha derramado|caído/.test(document.getElementById('mgOv').textContent)));
  await ctx.close();
}

/* ================= T24 · Nivel con JSON inválido ================= */
console.log('Nivel inválido');
{
  const { p, ctx, errors } = await fresh(BASE_STATE, null, '');
  await p.evaluate(() => { NIV[0] = window.Martin.cargar('{ esto no es un nivel'); render(); });
  await p.evaluate(() => { try { jugar(0, 'nivel'); } catch (e) { window.__err = String(e); } });
  check('T24 muestra un error recuperable y no empieza ninguna escena', await waitFor(p, () => /no disponible/i.test(document.getElementById('modal').textContent)) && await p.evaluate(() => !__martin.RUN.s && !window.__err));
  await p.click('#enNo');
  check('T24 se puede cerrar y volver al mapa', await waitFor(p, () => document.querySelectorAll('[data-lv]').length >= 1));
  check('sin errores de JavaScript sin capturar', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

/* ================= Copia de seguridad ================= */
console.log('Copia de seguridad');
{
  const { p, ctx } = await fresh({ ...BASE_STATE, prog: { [IDS[0]]: { done: true, stars: 3, bestMs: 100000, bestAgua: 100, plays: 5, fails: 2 }, [IDS[1]]: { done: true, stars: 2, bestMs: 130000, bestAgua: 80, plays: 3, fails: 0 } }, theme: 'noche', mano: 'invertida', online: { nombre: 'Carlos' } }, null, '');
  const copia = await p.evaluate(() => backupJSON());
  const j = JSON.parse(copia);
  check('la copia lleva la app, el progreso, el tema, la mano y el nombre', j.app === 'martin' && j.prog[IDS[0]].stars === 3 && j.theme === 'noche' && j.mano === 'invertida' && j.online.nombre === 'Carlos');
  await ctx.close();
  const o = await fresh({ ...BASE_STATE, prog: { [IDS[0]]: { done: true, stars: 1, bestMs: 150000, bestAgua: 90, plays: 1, fails: 0 } } }, null, '');
  const n = await o.p.evaluate(c => { mergeBackup(JSON.parse(c)); return S.prog; }, copia);
  check('al recuperar se queda lo mejor de cada uno (más estrellas, menor tiempo, más agua)', n[IDS[0]].stars === 3 && n[IDS[0]].bestMs === 100000 && n[IDS[0]].bestAgua === 100 && n[IDS[1]].done, JSON.stringify(n));
  const mal = await o.p.evaluate(() => {
    try {
      const raros = [{ app: 'martin', format: 2, archive: 'x', prog: {} }, null, 7, { app: 'otra', archive: [] }].map(x => !!validBackup(x));
      const b = JSON.parse('{"app":"martin","format":2,"archive":[],"prog":{"__proto__":{"stars":3},"<b>":{"done":true},"uga_l02_after_the_storm":{"done":true,"stars":99,"bestMs":-5,"bestAgua":9999}}}');
      mergeBackup(b); const q = S.prog['uga_l02_after_the_storm'];
      return { raros, polvo: ({}).stars, mala: S.prog['<b>'], q };
    } catch (e) { return { lanza: e.message }; }
  });
  check('las copias raras se rechazan', mal.raros && mal.raros.every(x => x === false), JSON.stringify(mal));
  check('una copia manipulada no contamina el progreso ni deja valores fuera de rango', !mal.lanza && mal.polvo == null && mal.mala == null && mal.q && mal.q.stars <= 3 && mal.q.bestAgua <= 100 && mal.q.bestMs >= 0, JSON.stringify(mal));
  await o.ctx.close();
}

/* ================= T26 · Idiomas ================= */
console.log('Idiomas');
for (const idioma of ['en', 'fr', 'de', 'it']) {
  const { p, ctx, errors } = await fresh(BASE_STATE, null, '', { idioma });
  await p.waitForTimeout(500);
  for (const i of [0, 1, 2, 3, 4, 5]) { await p.evaluate(i => openBriefing(i), i); await p.waitForTimeout(100); await p.evaluate(() => closeModal()); }
  for (const id of ['mArch', 'mGameRules', 'mTheme', 'mAbout', 'mShareApp']) { await p.click('#menuBtn'); await p.click('#' + id).catch(() => {}); await p.waitForTimeout(150); await p.evaluate(() => { try { closeModal(); } catch (e) {} }); }
  await p.evaluate(() => jugar(0, 'nivel')); await p.waitForTimeout(400);
  const falta = (await p.evaluate(() => Idioma.faltan())).filter(x => x !== 'Martín');
  check(idioma + ': todo lo que se ve está traducido (sin textos sueltos en español)', falta.length === 0, falta.slice(0, 6).join(' | '));
  check(idioma + ': el HUD no se desborda con textos más largos', await noHScroll(p));
  check(idioma + ': sin errores', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

/* ================= Reto diario (contra una copia local del servidor común) ================= */
console.log('Reto diario');
{
  const SERV = process.env.JUEGOS_SERVIDOR || fileURLToPath(new URL('../../juegos-servidor/', import.meta.url));
  let serverOk = false, crearServidor, PS, RETO;
  if (fs.existsSync(join(SERV, 'src/reto.js'))) {
    try {
      Object.assign(process.env, { DATA_DIR: fs.mkdtempSync(join(process.env.TMPDIR || '/tmp', 'juegos-')), RETO_DIA: '2026-11-07', RETO_FORZAR: IDS[0] + ':normal', RETO_LIMITE_IP: '1000' });
      const cr = createRequire(join(SERV, 'package.json'));
      ({ crearServidor } = cr('./src/server.js')); RETO = cr('./src/reto.js');
      serverOk = true;
    } catch (e) { console.log('  (no se pudo cargar el servidor: ' + e.message + ')'); }
  } else console.log('  ⚠ El servidor común todavía no tiene el reto de Martín (src/reto.js): se omite la parte en línea.');
  if (serverOk) {
    const { server: PSrv } = crearServidor(); PS = PSrv;
    await new Promise(r => PS.listen(0, '127.0.0.1', r));
    const WS = `ws://127.0.0.1:${PS.address().port}/ws`, HTTP = `http://127.0.0.1:${PS.address().port}`;
    const { p, ctx, errors } = await fresh({ ...BASE_STATE, online: { token: 'tokenprueba000001' } }, null, WS, { turbo: 60 });
    check('el mapa enseña el reto de hoy con su nivel y sus condiciones', await waitFor(p, () => document.querySelector('#dgJugar')) && /Nivel 1/.test(await p.textContent('#mpDiario')) && /Agua normal/.test(await p.textContent('#mpDiario')));
    check('sin partidas todavía: el ranking está vacío', (await (await fetch(HTTP + '/reto/ranking', { method: 'POST', body: JSON.stringify({ dia: '2026-11-07' }) })).json()).total === 0);
    await p.evaluate(runs => { window.MARTIN_REPLAY = runs; }, PART[IDS[0] + '|RUTA-BAJA'].runs);
    await p.click('#dgJugar');
    check('al jugar el reto, la app pide un nombre una sola vez', await waitFor(p, () => document.querySelector('#ovGo')));
    await p.click('#ovGo');
    check('al llegar a la meta, pide el nombre para el ranking', await waitFor(p, () => document.querySelector('#rnNom'), null, 60000));
    await p.fill('#rnNom', 'Carlos'); await p.click('#rnOk');
    check('el servidor repite la partida y acepta el tiempo (puesto 1 de 1)', await waitFor(p, () => /Puesto/.test(document.getElementById('ovEnv') ? document.getElementById('ovEnv').textContent : ''), null, 20000) && /1<\/b> de 1|Puesto\s*1 de 1/.test(await p.innerHTML('#ovEnv')) || /Puesto 1 de 1/.test(await p.textContent('#ovEnv')), await p.textContent('#ovEnv'));
    const rk = await (await fetch(HTTP + '/reto/ranking', { method: 'POST', body: JSON.stringify({ dia: '2026-11-07' }) })).json();
    const esperado = Math.round(PART[IDS[0] + '|RUTA-BAJA'].ms);
    check('en el ranking sale Carlos con el tiempo calculado por el servidor (no por el móvil)', rk.total === 1 && rk.top[0].nombre === 'Carlos' && Math.abs(rk.top[0].ms - esperado) < 40, JSON.stringify(rk.top));
    check('la app guarda tu mejor marca de hoy', (await store(p)).diario && (await store(p)).diario.dia === '2026-11-07' && (await store(p)).diario.ms > 0);
    await p.evaluate(() => { window.MARTIN_REPLAY = null; salirAlMapa(); });
    await p.click('#dgRank').catch(() => {});
    check('el ranking de la app lista a Carlos', await waitFor(p, () => /Carlos/.test(document.getElementById('modal').textContent)));
    check('el servidor no devuelve el identificador de nadie', !JSON.stringify(rk).includes('tokenprueba'));
    // otro nivel/condiciones: la app de otro móvil con una versión vieja es rechazada
    const mala = await fetch(HTTP + '/reto/enviar', { method: 'POST', body: JSON.stringify({ token: 'tokenprueba000002', nombre: 'X', dia: '2026-11-07', nivel: IDS[1], mod: 'normal', runs: PART[IDS[1]].runs }) });
    check('una partida de otro nivel no entra en el reto de hoy', mala.status === 400);
    check('sin errores de JavaScript', errors.length === 0, errors.join(' | '));
    await ctx.close();
    // sin servidor: la app sigue funcionando, solo avisa
    const off = await fresh(BASE_STATE, null, 'ws://127.0.0.1:9/ws');
    check('con el servidor caído, el reto se puede practicar y avisa «sin conexión»', await waitFor(off.p, () => document.querySelector('#dgPrac') && /sin conexión/.test(document.getElementById('mpDiario').textContent)));
    await off.ctx.close();
    await new Promise(r => PS.close(r)); try { RETO.guardarYa(); } catch (e) {}
  }
}

await browser.close(); server.close();
console.log(`\n${passed} correctas, ${failed} falladas`);
process.exit(failed ? 1 : 0);
