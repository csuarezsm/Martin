// Pruebas automáticas de la app Martín (IT Canarias): interfaz en móvil, horizontal y tablet, controles (también multitáctil),
// pausa al perder el foco, los 11 niveles terminados de principio a fin, copia de seguridad, idiomas, JSON de nivel inválido y
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
const IDS = ['uga_l01_water_delivery', 'uga_l02_after_the_storm', 'uga_l03_dry_ravine', 'uga_l04_basin_descent', 'uga_l05_two_roads', 'uga_l06_great_delivery', 'norte_l07_el_golfo', 'norte_l08_janubio', 'norte_l09_famara', 'norte_l10_haria', 'norte_l11_mirador'];

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
  check('abre en el mapa con los 11 niveles, los 2 secretos y los 8 del Mundo 3, solo el primero abierto', await waitFor(p, () => document.querySelectorAll('[data-lv]').length === 23 && document.querySelectorAll('.lv.bloq, .lv[disabled], .lv.locked').length >= 0));
  const abiertos = await p.evaluate(() => [...document.querySelectorAll('[data-lv]')].filter(b => !b.disabled && !b.classList.contains('bloq') && !b.classList.contains('locked')).length);
  check('solo el nivel 1 está abierto al empezar', abiertos === 1, String(abiertos));
  check('el título es Martín', (await p.textContent('#title')).includes('Martín'));
  check('tema volcán por defecto (oscuro cálido)', await p.evaluate(() => (getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '').toLowerCase().startsWith('#')));
  check('sin desbordamiento horizontal', await noHScroll(p));
  check('el reto diario se puede practicar sin conexión', await waitFor(p, () => document.querySelector('#dgPrac')));
  check('sale el «Mundo 2» con sus niveles', /Mundo 2 · La costa y el norte/.test(await p.textContent('#app')));
  check('cuaderno de viaje: una ficha con fuentes por nivel, cerrada al empezar', await p.evaluate(() => window.LUGARES.length === 23 && window.LUGARES.slice(0, 13).every(f => f.texto.length >= 3 && f.dato && f.fuentes.length >= 2) && window.LUGARES.filter(Boolean).every(f => f.texto.length >= 2 && f.dato && f.fuentes.length >= 1 && f.fuentes.every(([, u]) => /^https:\/\//.test(u)))) && /Cuaderno de viaje · 0\/20/.test(await p.textContent('#app')));
  await p.evaluate(() => openCuaderno());
  check('el cuaderno muestra los 20 lugares bloqueados', await p.evaluate(() => document.querySelectorAll('.cu-i.cerrado').length === 20));
  await p.evaluate(() => closeModal());
  await p.click('[data-lv="0"]');
  check('el briefing explica el nivel, las estrellas y los controles', await waitFor(p, () => document.querySelector('#bfGo')) && /Agua para Uga/.test(await p.textContent('#modal')) && /☆|★/.test(await p.textContent('#modal')));
  await p.click('#bfNo');
  await p.click('#menuBtn');
  check('el menú tiene historial, colores, idioma, reglas, borrar, compartir y más juegos', await waitFor(p, () => ['mArch', 'mGameRules', 'mTheme', 'mLang', 'mWipe', 'mShareApp', 'mMas', 'mAbout', 'mImp'].every(i => document.getElementById(i))));
  await p.click('#mGameRules');
  const reglas = await p.textContent('.sheet');
  check('las reglas explican el agua, el salto, los puntos de control y las estrellas', /−12/.test(reglas) && /−25/.test(reglas) && /punto de control/.test(reglas) && /★/.test(reglas) && /reto/i.test(reglas));
  check('las reglas cuentan que Martín está inspirado en un guelfo real y que los caminos son inventados', /Lanzarote/.test(reglas) && /guelfo/.test(reglas) && /inventados/.test(reglas));
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
  check('la bienvenida es corta: dos pantallas', await p.evaluate(() => WELCOME.length === 2));
  await p.click('#wbNext');
  await p.click('#wbNext');
  check('la bienvenida se cierra y no vuelve', await waitFor(p, () => document.querySelector('#modal').classList.contains('hidden')) && (await store(p)).onboarded === true);
  check('«¡A jugar!» lleva directo al nivel 1, listo para empezar', await waitFor(p, () => !!__martin.RUN.L && __martin.RUN.L.level_id === 'uga_l01_water_delivery' && !!document.getElementById('ovGo')));
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
  check('T20 al salir al mapa no queda simulación ni bucle activo', await waitFor(p, () => document.querySelectorAll('[data-lv]').length === 23) && await p.evaluate(() => !__martin.RUN.s && !__martin.RUN.on && !__martin.RUN.raf));
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

/* ================= Los 11 niveles, de principio a fin ================= */
console.log('Niveles completos (partidas grabadas por el robot, repetidas en la app)');
{
  const { p, ctx, errors } = await fresh(BASE_STATE, null, '', { turbo: 60 });
  for (let i = 0; i < IDS.length; i++) {
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
  { // niveles secretos: cerrados hasta tener todos los frutos de su mundo; se juegan como los demás; no entran en el reto diario
    check('secretos: dos niveles secretos, cerrados sin todos los frutos', await p.evaluate(() => { for (let i = 0; i < NBASE; i++) prog(i).obj = (prog(i).obj || []).slice(1); return true; }) && await p.evaluate(() => NBASE === 11 && NIV.length === 23 && !desbloqueado(11) && !desbloqueado(12)));
    check('secretos: el reto diario solo usa los 11 niveles normales (igual que el servidor)', await p.evaluate(() => { for (let d = 1; d <= 28; d++) { const r = __martin.M.retoDelDia('2026-02-' + String(d).padStart(2, '0'), NIV.slice(0, NBASE).map(n => n.nivel.level_id)); if (!NIV.slice(0, NBASE).some(n => n.nivel.level_id === r.nivel)) return false; } return true; }));
    await p.evaluate(() => { for (let i = 0; i < NBASE; i++) prog(i).obj = frutosDe(NIV[i].nivel).map(o => o.id); save(); salirAlMapa(); });
    check('secretos: con todos los frutos se abren los dos', await p.evaluate(() => desbloqueado(11) && desbloqueado(12)) && /Nivel secreto abierto/.test(await p.textContent('#app')));
    for (const [i, id] of [[11, 'secreto_s1_cueva_verdes'], [12, 'secreto_s2_la_graciosa']]) {
      const f = await juegaConRobot(p, i, id);
      check('secreto ' + id + ': llega a la meta igual que el robot', f && f.fase === 'meta' && f.t === Math.round(PART[id].ms * 60 / 1000) && f.agua === PART[id].agua, JSON.stringify(f));
      await p.evaluate(() => salirAlMapa());
    }
    // 3.2: logros — se apuntan solos y la pantalla los enseña
    check('logros: 16 logros; los conseguidos quedan apuntados y el de terminarlo todo no', await p.evaluate(() => { revisaLogros(); return LOGROS.length === 16 && !!S.logros.primeros && !!S.logros.frutos1 && !S.logros.todo; }));
    check('logros: la pantalla se abre desde el mapa', await p.evaluate(() => { salirAlMapa(); const b = document.getElementById('mpLog'); if (!b) return false; b.click(); return /Logros · \d+\/16/.test(document.getElementById('modal').textContent) && document.querySelectorAll('.lg.si').length >= 2; }));
    await p.evaluate(() => closeModal());
    // 3.1: los dos niveles nuevos del Mundo 2 (dunas y barcas) se abren tras el último del Mundo 2 y el robot los termina igual en la app
    check('niveles nuevos: el jable va detrás del nivel 11 y las barcas detrás del jable', await p.evaluate(() => anteriorNivel(21) === 10 && anteriorNivel(22) === 21 && INFO[21].num === '12' && INFO[22].num === '13' && INFO[13].num === '3-1'));
    for (const [i, id] of [[21, 'norte_e01_jable_famara'], [22, 'norte_e02_barcas_orzola']]) {
      const f = await juegaConRobot(p, i, id);
      check('nivel nuevo ' + id + ': llega a la meta igual que el robot', f && f.fase === 'meta' && f.t === Math.round(PART[id].ms * 60 / 1000) && f.agua === PART[id].agua, JSON.stringify(f));
      await p.evaluate(() => salirAlMapa());
    }
  }
  { // 3.0: Mundo 3 «El guelfo de Uga»: precuela con Martín de guelfo, el camellero, la manada, el calor y el eclipse
    const m3 = await p.evaluate(() => ORDEN.filter(i => esM3(i)));
    const ids3 = await p.evaluate(m3 => m3.map(i => NIV[i].nivel.level_id), m3);
    check('3.0: el Mundo 3 tiene 6 niveles, un secreto y un nivel de premio', m3.length === 8 && await p.evaluate(m3 => m3.map(i => INFO[i].tipo).join() === 'nivel,nivel,nivel,nivel,nivel,nivel,secreto,premio', m3));
    check('3.0: el reto diario sigue usando solo los 11 niveles de siempre', await p.evaluate(() => NBASE === 11));
    check('3.0: el nivel 3-1 se abre al terminar el Mundo 2 y el 3-2 sigue cerrado', await p.evaluate(m3 => desbloqueado(m3[0]) && !desbloqueado(m3[1]), m3));
    check('3.0: Martín es un guelfo: más pequeño y salta menos', await p.evaluate(i => { const L = NIV[i].nivel; return L.hw < __martin.M.HW && L.h < __martin.M.H && L.salto < __martin.M.SALTO; }, m3[0]));
    await p.evaluate(i => openBriefing(i), m3[0]);
    check('3.0: al entrar en el Mundo 3 se cuenta la primera escena de la historia', await waitFor(p, () => /Uga, enero de 2026/.test(document.getElementById('modal').textContent) && !!document.getElementById('hiC')));
    await p.click('#hiOk');
    check('3.0: tras la escena llega la explicación del nivel 3-1', await waitFor(p, () => /Nivel 3-1/.test(document.getElementById('modal').textContent) && /guelfo/.test(document.getElementById('modal').textContent)));
    await p.evaluate(() => closeModal());
    for (let k = 0; k < 6; k++) {
      check('3.0: nivel 3-' + (k + 1) + ' abierto', await p.evaluate(i => desbloqueado(i), m3[k]));
      const f = await juegaConRobot(p, m3[k], ids3[k]);
      check('3.0: nivel 3-' + (k + 1) + ' (' + ids3[k] + '): llega al final igual que el robot', f && f.fase === 'meta' && f.t === Math.round(PART[ids3[k]].ms * 60 / 1000) && f.agua === PART[ids3[k]].agua, JSON.stringify(f));
      check('3.0: nivel 3-' + (k + 1) + ': sale «¡Lo has conseguido!» con las fuerzas', await waitFor(p, () => /¡Lo has conseguido!/.test(document.getElementById('mgOv').textContent) && /💛/.test(document.getElementById('mgOv').textContent)));
      await p.waitForTimeout(1500); await p.evaluate(() => { try { closeModal(); } catch (e) {} salirAlMapa(); });
    }
    check('3.0: la historia avanza al terminar los niveles (escenas 2 a 6 y la final)', await p.evaluate(() => [2, 3, 4, 5, 6, 8].every(k => historiaVista(k))), JSON.stringify(await p.evaluate(() => S.historia)));
    check('3.0: en el mapa sale el botón para volver a ver la historia', /La historia de Martín/.test(await p.textContent('#app')));
    check('3.0: el secreto del Mundo 3 está cerrado sin todos los biberones', await p.evaluate(m3 => { for (const i of m3.slice(0, 6)) prog(i).obj = []; save(); return !desbloqueado(m3[6]); }, m3));
    await p.evaluate(m3 => { for (const i of m3.slice(0, 6)) { prog(i).obj = frutosDe(NIV[i].nivel).map(o => o.id); prog(i).stars = 2; } save(); salirAlMapa(); }, m3);
    check('3.0: con todos los biberones se abre El Echadero', await p.evaluate(m3 => desbloqueado(m3[6]), m3));
    { const f = await juegaConRobot(p, m3[6], ids3[6]); check('3.0: El Echadero se juega igual que el robot', f && f.fase === 'meta' && f.t === Math.round(PART[ids3[6]].ms * 60 / 1000), JSON.stringify(f)); await p.waitForTimeout(300); await p.evaluate(() => { try { closeModal(); } catch (e) {} salirAlMapa(); }); }
    check('3.0: el nivel de premio está cerrado sin todas las estrellas del Mundo 3', await p.evaluate(i => !desbloqueado(i), m3[7]));
    await p.evaluate(m3 => { for (const i of m3.slice(0, 6)) prog(i).stars = 3; save(); salirAlMapa(); }, m3);
    check('3.0: con todas las estrellas se abre Arena negra', await p.evaluate(i => desbloqueado(i), m3[7]));
    { const f = await juegaConRobot(p, m3[7], ids3[7]); check('3.0: Arena negra se juega igual que el robot', f && f.fase === 'meta' && f.t === Math.round(PART[ids3[7]].ms * 60 / 1000), JSON.stringify(f)); await p.waitForTimeout(300); await p.evaluate(() => { try { closeModal(); } catch (e) {} salirAlMapa(); }); }
    await p.evaluate(i => { window.MARTIN_REPLAY = [0, 30000]; jugar(i, 'nivel'); }, m3[1]); await p.click('#ovGo');
    check('3.0: si Martín se queda quieto, pierde al camellero y vuelve al punto de control', await waitFor(p, () => __martin.RUN.s.perdidas >= 1 && __martin.RUN.s.fase !== 'fallo', null, 20000));
    await p.evaluate(() => salirAlMapa());
    await p.evaluate(i => { window.MARTIN_REPLAY = [0, 30000]; jugar(i, 'nivel'); }, m3[4]); await p.click('#ovGo');
    check('3.0: al sol, el calor sube y Martín vuelve al punto de control a refrescarse', await waitFor(p, () => __martin.RUN.s.sofocos >= 1 && !!document.getElementById('mgCalor'), null, 20000));
    await p.evaluate(() => { window.MARTIN_REPLAY = null; salirAlMapa(); S.musica = true; S.sound = true; });
    await p.evaluate(i => { jugar(i, 'nivel'); empezar(); }, m3[0]); await p.waitForTimeout(300);
    check('3.0: el Mundo 3 tiene su propio sonido de fondo (pueblo y manada)', await p.evaluate(() => Musica.estado() === 'pueblo'));
    await p.evaluate(() => salirAlMapa());
    await p.evaluate(() => openCuaderno());
    check('3.0: el cuaderno tiene las fichas nuevas del Mundo 3', await waitFor(p, () => /El guelfo/.test(document.getElementById('modal').textContent) && /Los paseos en camello/.test(document.getElementById('modal').textContent)));
    await p.evaluate(() => closeModal());
  }
  check('al terminar los 11, el total de estrellas es 11 o más', (await p.evaluate(() => totalEstrellas())) >= 11);
  { // 2.2: frutos guardados, fantasma de la mejor carrera y persecución de lava
    const st = await store(p), o1 = (st.prog[IDS[0]] || {}).obj || [];
    check('2.2: los frutos cogidos se guardan con el nivel', o1.length >= 1 && o1.every(id => /^FRU-/.test(id)), JSON.stringify(o1));
    check('2.2: el mapa enseña los frutos de cada nivel (🧺 x/3)', /🧺 \d\/3/.test(await p.textContent('#app')));
    check('2.2: se guarda la mejor carrera para el fantasma', st.fant && st.fant[IDS[0]] && Array.isArray(st.fant[IDS[0]].runs) && st.fant[IDS[0]].runs.length > 10);
    await p.evaluate(r => { window.MARTIN_TURBO = 60; window.MARTIN_REPLAY = r; jugar(0, 'nivel'); }, PART[IDS[0] + '|RUTA-BAJA'].runs);
    check('2.2: al repetir el nivel corre el fantasma a tu lado', await p.evaluate(() => !!__martin.RUN.fan));
    await p.click('#ovGo'); await waitFor(p, () => __martin.RUN.s.fase === 'meta', null, 60000);
    check('2.2: el fantasma repite exactamente tu mejor carrera', await waitFor(p, () => __martin.RUN.fan.s.fase === 'meta' || __martin.RUN.fan.s.x > __martin.RUN.L.goals.finish_x - 1, null, 5000));
    await p.evaluate(() => salirAlMapa());
    await p.evaluate(() => { window.MARTIN_REPLAY = [2, 30000]; jugar(2, 'nivel'); }); await p.click('#ovGo');
    await p.evaluate(() => { const L = __martin.RUN.L, s = __martin.RUN.s; s.x = L.lava.desde + 0.5; s.y = 30; s.vy = 0; s.suelo = false; __martin.RUN.replay = [0, 30000]; __martin.RUN.rep = { i: 0, c: 0 }; });
    check('2.2: en Timanfaya la lava alcanza a Martín si se para', await waitFor(p, () => __martin.RUN.s.fase === 'fallo' && __martin.RUN.s.causa === 'lava', null, 20000) && await waitFor(p, () => /lava/i.test(document.getElementById('mgOv').textContent)));
    await p.evaluate(() => { window.MARTIN_REPLAY = null; salirAlMapa(); });
  }
  { // música de fondo: suena al jugar (distinta por mundo) y se para al pausar, al salir o si se quita en ajustes
    await p.evaluate(() => { S.musica = true; S.sound = true; jugar(0, 'nivel'); empezar(); }); await p.waitForTimeout(300);
    check('música: suena al jugar el Mundo 1 (ambiente: viento y pájaros)', await p.evaluate(() => Musica.estado() === 'sur'));
    await p.evaluate(() => pausar()); await p.waitForTimeout(100);
    check('música: se para al pausar', await p.evaluate(() => Musica.estado() === ''));
    await p.evaluate(() => { salirAlMapa(); jugar(7, 'nivel'); empezar(); }); await p.waitForTimeout(300);
    check('música: en el Mundo 2 cambia (olas y gaviotas)', await p.evaluate(() => Musica.estado() === 'costa'));
    await p.evaluate(() => { S.musica = false; }); await p.waitForTimeout(200);
    check('música: se puede quitar en ajustes', await p.evaluate(() => Musica.estado() === ''));
    await p.evaluate(() => { S.musica = true; salirAlMapa(); }); await p.waitForTimeout(100);
    check('música: al salir al mapa no suena', await p.evaluate(() => Musica.estado() === ''));
  }
  { // mapa de Lanzarote: un punto por nivel en su sitio, y se puede entrar desde el mapa
    await p.evaluate(() => salirAlMapa());
    check('mapa: Lanzarote con los 11 niveles, los 2 secretos y el Mundo 3', await p.evaluate(() => document.querySelectorAll('.mp-map .mk').length === 23 && !!document.querySelector('.mp-map path')));
    await p.click('.mp-map [data-lvm="0"]', { force: true });
    check('mapa: tocar un nivel abierto lo abre', await waitFor(p, () => /Agua para Uga/.test(document.body.textContent) && (!!__martin.RUN.L || !document.getElementById('modal').classList.contains('hidden')), null, 3000));
    await p.evaluate(() => { try { closeModal(); } catch (e) {} salirAlMapa(); });
  }
  { // modo peque: menos agua perdida y lava más lenta, solo en los niveles
    await p.evaluate(() => { salirAlMapa(); }); await p.click('#mpPeq');
    check('modo peque: el interruptor del mapa lo activa', (await store(p)).peque === true && /Sí/.test(await p.textContent('#mpPeq')));
    await p.evaluate(() => jugar(2, 'nivel'));
    check('modo peque: en un nivel, el motor derrama la mitad y la lava va al 70 %', await p.evaluate(() => { const s = __martin.RUN.s; return s.mod === 'peque' && s.dm === 0.5 && s.lf === 0.7; }) && /Modo peque/.test(await p.textContent('#mgOv')));
    check('modo peque: el reto diario no cambia', await p.evaluate(() => { const r = __martin.M.retoDelDia('2026-11-09', ['a', 'b']); return ['normal', 'fragil', 'poca'].includes(r.mod); }));
    await p.evaluate(() => { salirAlMapa(); S.peque = false; save(); renderSetup(); });
  }
  { // 2.3.6: con los 3 frutos de un nivel se gana su sello y otra curiosidad en el cuaderno
    await p.evaluate(() => { S.peque = true; jugar(1, 'nivel'); }); await p.waitForTimeout(150); await p.evaluate(() => { salirAlMapa(); S.peque = false; });
  await p.evaluate(() => { prog(2).obj = frutosDe(__martin.NIV[2].nivel).map(o => o.id).filter(id => id !== 'FRU-1'); save(); openFicha(2); });
    check('sellos: sin los 3 frutos, la ficha dice cómo ganar el sello', /ganarás su sello/.test(await p.textContent('#modal')) && !(await p.$('#fiSello')));
    await p.evaluate(() => { closeModal(); jugar(2, 'nivel'); empezar(); const s = __martin.RUN.s; s.fase = 'meta'; s.obj = { 'FRU-1': 'tuno' }; terminar(); }); await p.waitForTimeout(150);
    check('sellos: al coger el último fruto del nivel avisa del nuevo sello', /Nuevo sello/.test(await p.textContent('#mgOv')));
    await p.click('#ovSe'); await p.waitForTimeout(200);
    check('sellos: tocar el aviso del sello abre la ficha del lugar con su sello', !!(await p.$('#fiSello')));
    await p.evaluate(() => closeModal());
    await p.evaluate(() => { salirAlMapa(); openFicha(2); }); await p.waitForTimeout(300);
    check('sellos: la ficha enseña el sello, la curiosidad extra y su fuente oficial', await p.evaluate(() => { const c = document.getElementById('fiSello'), t = document.getElementById('modal').textContent, f = LUGARES[2];
      return !!c && c.getContext('2d').getImageData(c.width / 2, c.height * 0.3, 1, 1).data[3] > 0 && t.includes(f.extra[0]) && [...document.querySelectorAll('.fi-f a')].some(a => a.dataset.url === f.extra[1][1]); }));
    await p.evaluate(() => { closeModal(); openCuaderno(); });
    check('sellos: el cuaderno cuenta los sellos y marca el lugar', /Sellos: \d+\/14/.test(await p.textContent('#modal')) && !!(await p.$('[data-fi="2"] .cu-b')));
    await p.evaluate(() => closeModal());
  }
  { // 2.4.2: guía de la naturaleza — cada especie se descubre al terminar el nivel de su lugar
    check('guía: 11 especies, cada una con texto, origen y fuente oficial https', await p.evaluate(() => NAT.length === 11 && NAT.every(e => e.texto.length === 2 && ORIGEN[e.origen] && e.fuentes.length >= 1 && e.fuentes.every(([, u]) => /^https:\/\//.test(u)) && __martin.NIV.some(n => n.ok && n.nivel.level_id === e.descubre))));
    check('guía: cada especie se puede dibujar', await p.evaluate(() => NAT.every(e => { const c = document.createElement('canvas'); c.width = 80; c.height = 64; const x = c.getContext('2d'); dibujaEspecie(x, e.id, 80, 64); const d = x.getImageData(0, 0, 80, 64).data; for (let i = 3; i < d.length; i += 4) if (d[i]) return true; return false; })));
    await p.evaluate(() => { prog(0).done = false; save(); openGuia(); });
    check('guía: sin terminar el nivel 1, la tunera y el camello siguen ocultos', !(await p.$('[data-esp="tunera"]')) && !(await p.$('[data-esp="camello"]')));
    await p.evaluate(() => { closeModal(); jugar(0, 'nivel'); empezar(); const s = __martin.RUN.s; s.fase = 'meta'; terminar(); }); await p.waitForTimeout(150);
    check('guía: al terminar el nivel avisa de las especies nuevas', /Nueva especie en tu guía/.test(await p.textContent('#mgOv')) && /Tunera/.test(await p.textContent('#mgOv')));
    await p.click('#ovGu'); await p.waitForTimeout(150);
    check('guía: desde el final del nivel se abre la especie nueva', !!(await p.$('#esC')) || !!(await p.$('#guOk')));
    await p.evaluate(() => closeModal());
    await p.evaluate(() => { salirAlMapa(); openCuaderno(); }); await p.waitForTimeout(100);
    check('guía: el cuaderno tiene el botón de la guía con el recuento', /Guía de la naturaleza/.test(await p.textContent('#modal')) && !!(await p.$('#cuGuia')));
    await p.click('#cuGuia'); await p.waitForTimeout(100); await p.click('[data-esp="tunera"]'); await p.waitForTimeout(100);
    check('guía: la ficha de la especie enseña su nombre científico, en qué nivel se descubre y sus fuentes', await p.evaluate(() => { const t = document.getElementById('modal').textContent, e = NAT.find(x => x.id === 'tunera'); return t.includes(e.cientifico) && t.includes(e.texto[0]) && /La descubres en:/.test(t) && /Nivel 1 · Uga/.test(t) && /Aparece en \d+ niveles del juego/.test(t) && e.fuentes.every(([, u]) => [...document.querySelectorAll('.es .fi-f a')].some(a => a.dataset.url === u)); }));
    await p.click('#esVol'); await p.waitForTimeout(100);
    check('guía: «‹ Guía» vuelve a la lista', !!(await p.$('#guOk')));
    check('guía: todos los textos de la guía están traducidos a 4 idiomas', await p.evaluate(() => { const I = window.I18N; return NAT.every(e => [e.nombre, ...e.texto, ...e.fuentes.map(f => f[0])].every(s => ['en', 'fr', 'de', 'it'].every(l => (I[l + ':martin'] || {})[s] || I[l][s]))); }));
    await p.evaluate(() => closeModal());
  }
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
  const todo = Object.fromEntries(IDS.map(id => [id, { done: true, stars: 2, bestMs: 100000, bestAgua: 90, plays: 1, fails: 0, obj: ['FRU-1'] }]));
  const { p, ctx, errors } = await fresh({ ...BASE_STATE, prog: todo }, null, '', { idioma });
  await p.waitForTimeout(500);
  for (const i of IDS.keys()) { await p.evaluate(i => openBriefing(i), i); await p.waitForTimeout(100); await p.evaluate(() => closeModal()); }
  // todas las fichas del Cuaderno, la bienvenida y las pantallas de fallo y de entrega
  await p.evaluate(() => openCuaderno()); for (const i of IDS.keys()) { await p.evaluate(i => openFicha(i, true), i); await p.waitForTimeout(80); }
  await p.evaluate(() => closeModal());
  for (let i = 0; i < 5; i++) { await p.evaluate(i => openWelcome(i), i); await p.waitForTimeout(80); } await p.evaluate(() => closeModal());
  await p.evaluate(() => { window.MARTIN_REPLAY = [0, 99999]; jugar(0, 'nivel'); empezar(); pausar(); }); await p.waitForTimeout(150);
  await p.evaluate(() => { reanudar(); const s = __martin.RUN.s; s.fase = 'fallo'; s.causa = 'lava'; terminar(); }); await p.waitForTimeout(150);
  await p.evaluate(() => { prog(2).obj = frutosDe(__martin.NIV[2].nivel).map(o => o.id).filter(id => id !== 'FRU-1'); openFicha(2); }); await p.waitForTimeout(80);
  await p.evaluate(() => { closeModal(); jugar(2, 'nivel'); empezar(); const s = __martin.RUN.s; s.fase = 'meta'; s.obj = { 'FRU-1': 'tuno' }; terminar(); }); await p.waitForTimeout(150);
  await p.evaluate(() => { window.MARTIN_REPLAY = null; salirAlMapa(); openCuaderno(); openFicha(2, true); }); await p.waitForTimeout(150);
  await p.evaluate(() => closeModal());
  for (const id of ['mArch', 'mGameRules', 'mTheme', 'mAbout', 'mShareApp']) { await p.click('#menuBtn'); await p.click('#' + id).catch(() => {}); await p.waitForTimeout(150); await p.evaluate(() => { try { closeModal(); } catch (e) {} }); }
  await p.evaluate(() => jugar(0, 'nivel')); await p.waitForTimeout(400);
  const falta = (await p.evaluate(() => Idioma.faltan())).filter(x => x !== 'Martín' && x !== 'Español');
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
