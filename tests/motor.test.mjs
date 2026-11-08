// Pruebas del motor de Martín (reglas, física y niveles). Corresponden a los casos T01–T28 del dossier.
// Uso: node tests/motor.test.mjs   (no necesita navegador; los robots de los niveles tardan unos minutos: SALTAR_ROBOT=1 los omite)
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const M = require('../www/martin.js');
const TEXTOS = require('../www/niveles.js');
let passed = 0, failed = 0;
const check = (n, c, x = '') => { if (c) { passed++; console.log('  ✓ ' + n); } else { failed++; console.log('  ✗ ' + n + (x ? ' → ' + x : '')); if (process.env.GITHUB_ACTIONS) console.log('::error::' + n); } };
const NIV = TEXTOS.map(t => M.cargar(t));
const L1 = NIV[0].nivel;

/* Nivel de pruebas: base de L01 con otro suelo */
const BASE = JSON.parse(TEXTOS[0]);
function mk(o) {
  const L = JSON.parse(JSON.stringify(BASE));
  L.level_id = 'prueba'; L.routes = []; L.hints = []; L.obstacles = o.obstacles || [];
  L.solids = o.solids; L.spawn = o.spawn || { x: 2, y: 0 }; L.checkpoint = o.checkpoint || { id: 'CP-01', x: 40, y: 0 };
  L.checkpoints_extra = o.extra || [];
  L.world.min_x = -5; L.world.max_x = o.max || 100; L.world.kill_y = o.kill == null ? -20 : o.kill;
  L.goals.finish_x = o.meta || 90; return M.validar(L);
}
const suelo = (x0, x1, top = 0, kind = 'ground') => ({ id: 'S' + x0 + '_' + x1 + '_' + top, kind, x0, x1, top, bottom: -1000, route: '' });
const nuevoJ = (L, op) => { const s = M.nuevo(L, op); M.empezar(s); return s; };
const corre = (L, s, m, n) => { for (let i = 0; i < n && s.fase !== 'meta' && s.fase !== 'fallo'; i++) M.paso(L, s, m); return s; };
const hasta = (L, s, m, cond, max = 900) => { let i = 0; while (!cond(s) && i++ < max && s.fase !== 'meta' && s.fase !== 'fallo') M.paso(L, s, m); return s; };
const plano = mk({ solids: [suelo(-5, 100)] });

console.log('T01 · Mover a derecha e izquierda');
let s = nuevoJ(plano); corre(plano, s, 2, 60);
check('al mantener derecha acelera hasta la velocidad máxima (4 u/s) y avanza', Math.abs(s.vx - M.VMAX) < 1e-9 && s.x > 5, s.vx + ' ' + s.x);
corre(plano, s, 0, 20);
check('al soltar frena del todo', s.vx === 0);
const x0 = s.x; corre(plano, s, 1, 30);
check('izquierda va hacia atrás y cambia la cara', s.x < x0 && s.cara === -1);
s = nuevoJ(plano); corre(plano, s, 3, 30);
check('izquierda + derecha a la vez = quieto', s.vx === 0 && s.x === 2);
check('el cronómetro cuenta pasos (1/60 s)', s.t === 30);

console.log('T02 · Dirección + salto en el mismo paso');
s = nuevoJ(plano); corre(plano, s, 2 | 4, 1);
check('ambas entradas se aplican en el mismo paso', s.vx > 0 && s.vy > 0 && !s.suelo, JSON.stringify([s.vx, s.vy]));

console.log('T03 · Coyote time (0,10 s)');
const borde = mk({ solids: [suelo(-5, 10), suelo(30, 100)], obstacles: [{ id: 'O1', kind: 'gap', x0: 10, x1: 30 }], max: 100, meta: 90, checkpoint: { id: 'CP-01', x: 50, y: 0 } });
function salto(Lx, retraso) {            // camina hacia el borde y salta `retraso` pasos después de pisar fuera
  const t = nuevoJ(Lx); t.x = 9.2; t.suelo = true; let fuera = -1;
  for (let i = 0; i < 80; i++) {
    const enAire = !t.suelo; if (enAire && fuera < 0) fuera = i;
    const m = 2 | ((fuera >= 0 && i - fuera === retraso) ? 4 : 0);
    M.paso(Lx, t, m); if (fuera >= 0 && i - fuera > retraso + 3) break;
  }
  return t;
}
const tc = salto(borde, 4), tl = salto(borde, 9);
check('salta si pulsa dentro de la ventana de coyote', tc.vy > 0 || tc.saltos === 1, JSON.stringify([tc.vy, tc.saltos]));
check('no salta si pulsa pasada la ventana', tl.saltos === 0, String(tl.saltos));

console.log('T04 · Jump buffer (0,12 s)');
{ const t = nuevoJ(plano); t.y = 0.1; t.suelo = false; t.vy = 0; t.coy = 0;
  corre(plano, t, 4, 1);                                       // pulsa en el aire, cerca del suelo
  let saltoDespues = false, aterrizo = false;
  for (let i = 0; i < 20; i++) { M.paso(plano, t, 4); if (t.suelo) aterrizo = true; if (aterrizo && t.vy > 0) { saltoDespues = true; break; } }
  check('un salto pedido poco antes de aterrizar se ejecuta al tocar el suelo', saltoDespues);
  const u = nuevoJ(plano); u.y = 6; u.suelo = false; u.vy = 0; u.coy = 0; corre(plano, u, 4, 1); corre(plano, u, 0, 60);
  check('si el suelo está lejos, la orden caduca (no salta al aterrizar)', u.saltos === 0, String(u.saltos)); }

console.log('T05 · Salto corto y largo, sin doble salto');
function altura(mantener) { const t = nuevoJ(plano); let top = 0; for (let i = 0; i < 90; i++) { M.paso(plano, t, i < mantener ? 4 : 0); top = Math.max(top, t.y); } return top; }
const corto = altura(1), largo = altura(40);
check('mantener el salto llega más alto (≈1,5 u frente a ≈1,9 u)', corto > 1.2 && corto < 1.7 && largo > 1.8 && largo < 2.1 && largo > corto, corto.toFixed(2) + ' / ' + largo.toFixed(2));
{ const t = nuevoJ(plano); let top = 0; for (let i = 0; i < 90; i++) { M.paso(plano, t, 4); top = Math.max(top, t.y); }
  check('mantenerlo pulsado en el aire no da un segundo salto', top < 2.1 && t.saltos <= 2, top.toFixed(2)); }

console.log('T06 · Hueco de 1,4 u');
{ const h = mk({ solids: [suelo(-5, 20), suelo(21.4, 100)], obstacles: [{ id: 'O1', kind: 'gap', x0: 20, x1: 21.4 }], checkpoint: { id: 'CP-01', x: 50, y: 0 } });
  const t = nuevoJ(h); t.x = 12; t.suelo = true; let hecho = false;
  for (let i = 0; i < 300 && !hecho; i++) { const m = 2 | ((t.x > 19.2 && t.suelo) ? 4 : 0); M.paso(h, t, m); if (t.x > 24 && t.suelo) hecho = true; }
  check('se supera con un salto normal y sin perder agua', hecho && t.agua === 100 && t.fase !== 'fallo', JSON.stringify([t.agua, t.fase])); }

console.log('T07–T09 · Aterrizajes');
function caida(h) {
  const Lc = mk({ solids: [suelo(-5, 14, h), suelo(14, 100, 0)], obstacles: [], spawn: { x: 2, y: h }, checkpoint: { id: 'CP-01', x: 40, y: 0 } });
  const t = nuevoJ(Lc); t.x = 9; t.y = h; corre(Lc, t, 2, 400); return t;
}
const c15 = caida(1.5), c25 = caida(2.5), c4 = caida(4), c6 = caida(6);
check('T07 bajar un escalón de 1,5 u no cuesta agua (v < 10 u/s)', c15.agua === 100 && c15.danos === 0, String(c15.agua));
check('T08 caída media: −12 exactos, una sola vez', c25.agua === 88 && c25.danos === 12 && c25.caidas === 0, JSON.stringify([c25.agua, c25.danos]));
check('T09 caída fuerte: −25 exactos, una sola vez', c4.agua === 75 && c4.danos === 25, JSON.stringify([c4.agua, c4.danos]));
check('T09 una caída mayor sigue costando solo 25 (no se acumula por rebotes)', c6.agua === 75, String(c6.agua));

console.log('T10 · Golpe lateral contra roca');
function roca(prisa) {
  const Lr = mk({ solids: [suelo(-5, 100), { id: 'R1', kind: 'rock', x0: 20, x1: 21.2, top: 1.0, bottom: 0, route: '' }], checkpoint: { id: 'CP-01', x: 50, y: 0 } });
  const t = nuevoJ(Lr); t.x = prisa ? 8 : 19.4; corre(Lr, t, 2, prisa ? 240 : 30); return t;
}
const rr = roca(true), rl = roca(false);
check('con prisa descuenta 10 y solo una vez', rr.agua === 90 && rr.golpes === 1, JSON.stringify([rr.agua, rr.golpes]));
check('despacio no hay daño', rl.agua === 100 && rl.golpes === 0, JSON.stringify([rl.agua, rl.golpes]));
{ const Lw = mk({ solids: [suelo(-5, 100), { id: 'W1', kind: 'wall', x0: 20, x1: 21, top: 3, bottom: 0, route: '' }], checkpoint: { id: 'CP-01', x: 50, y: 0 } });
  const t = nuevoJ(Lw); t.x = 8; corre(Lw, t, 2, 240);
  check('una pared de tierra nunca hace daño', t.agua === 100 && t.x < 20.1); }

console.log('T11 · Con 0 de agua se detiene y falla');
{ const Lf = mk({ solids: [suelo(-5, 14, 8), suelo(14, 100, 0)], spawn: { x: 2, y: 8 }, checkpoint: { id: 'CP-01', x: 40, y: 0 } });
  const t = nuevoJ(Lf, { agua: 20 }); t.x = 9; t.y = 8; corre(Lf, t, 2, 400);
  check('una caída fuerte con poca agua termina en fallo por agua', t.fase === 'fallo' && t.causa === 'agua' && t.agua === 0, JSON.stringify([t.fase, t.causa, t.agua]));
  const x = t.x, tt = t.t; corre(Lf, t, 2, 30);
  check('después del fallo ya nada se mueve ni corre el reloj', t.x === x && t.t === tt); }

console.log('T12 · Punto de control');
{ const Lk = mk({ solids: [suelo(-5, 100)], checkpoint: { id: 'CP-01', x: 40, y: 0 } });
  const t = nuevoJ(Lk); corre(Lk, t, 2, 200);
  check('antes de x=40 la reaparición sigue siendo el inicio', t.cp === 0 || t.rx === 2 || t.x >= 40, JSON.stringify([t.x, t.rx, t.cp]));
  const u = nuevoJ(Lk); u.x = 30; corre(Lk, u, 2, 20);
  check('el punto de control no se activa antes de cruzarlo', u.x < 40 && u.rx === 2, JSON.stringify([u.x, u.rx]));
  hasta(Lk, u, 2, z => z.x >= 41, 200);
  check('al cruzar x=40 pasa a ser el punto de reaparición', u.rx === 40 && u.cp === 1, JSON.stringify([u.rx, u.cp]));
  const w = nuevoJ(Lk); corre(Lk, w, 2, 660);
  check('cruzarlo no repone agua y solo cuenta una vez', w.cp === 1 && w.agua === 100 && w.x > 41, JSON.stringify([w.cp, w.agua, w.x])); }

console.log('T13 · Caída por un hueco');
{ const Lg = mk({ solids: [suelo(-5, 20), suelo(40, 100)], obstacles: [{ id: 'O1', kind: 'gap', x0: 20, x1: 40 }], checkpoint: { id: 'CP-01', x: 10, y: 0 } });
  const t = nuevoJ(Lg); t.x = 9; hasta(Lg, t, 2, z => z.caidas >= 1, 600); corre(Lg, t, 0, 60);
  check('cae, pierde 15 y reaparece en el punto de control', t.agua === 85 && t.caidas === 1 && t.fase === 'jugando' && Math.abs(t.x - 10) < 0.6, JSON.stringify([t.agua, t.caidas, t.x]));
  const Li = mk({ solids: [suelo(-5, 20), suelo(40, 100)], obstacles: [{ id: 'O1', kind: 'gap', x0: 20, x1: 40 }], checkpoint: { id: 'CP-01', x: 50, y: 0 } });
  const u = nuevoJ(Li); corre(Li, u, 2, 400);
  check('si aún no llegó al punto de control, vuelve al inicio', u.caidas >= 1 && u.rx === 2, JSON.stringify([u.rx, u.caidas]));
  const v = nuevoJ(Li, { agua: 10 }); corre(Li, v, 2, 400);
  check('si la caída deja el agua en 0, falla', v.fase === 'fallo' && v.agua === 0, JSON.stringify([v.fase, v.agua])); }

console.log('T15–T17 · Meta y estrellas');
{ const Lm = mk({ solids: [suelo(-5, 100)], meta: 30 });
  const t = nuevoJ(Lm); corre(Lm, t, 2, 600);
  check('T15 llegar con agua > 0 completa el nivel y para el reloj', t.fase === 'meta' && t.t > 0);
  const tt = t.t; M.paso(Lm, t, 2); M.paso(Lm, t, 2);
  check('T15 el reloj se detiene exactamente una vez (no sigue contando)', t.t === tt);
  check('T17 estrellas: entrega + agua ≥ 75 + tiempo → 3', t.estrellas === 3, String(t.estrellas));
  const lento = mk({ solids: [suelo(-5, 100)], meta: 30 }); lento.goals.star_3_time_s = 1;
  const u = nuevoJ(lento); corre(lento, u, 2, 600);
  check('T17 sin llegar a tiempo: 2 estrellas', u.fase === 'meta' && u.estrellas === 2, String(u.estrellas));
  const v = nuevoJ(lento, { agua: 60 }); corre(lento, v, 2, 600);
  check('T17 con poca agua: 1 estrella', v.fase === 'meta' && v.estrellas === 1, String(v.estrellas));
  const x = nuevoJ(Lm, { agua: 1 }); x.agua = 0; x.fase = 'fallo'; M.paso(Lm, x, 2);
  check('T16 con 0 de agua no se completa: prevalece el fallo', x.fase === 'fallo'); }

console.log('T18 · Pausa y reanudación');
{ const t = nuevoJ(plano); corre(plano, t, 2, 40); M.pausar(t);
  const a = JSON.stringify(M.clonar(t)); corre(plano, t, 2, 120);
  check('en pausa la física y el reloj están congelados', JSON.stringify(M.clonar(t)) === a && t.fase === 'pausa');
  M.reanudar(t); const x = t.x; corre(plano, t, 2, 1);
  check('al reanudar continúa sin saltos de posición', Math.abs(t.x - x) < 0.2 && t.fase === 'jugando');
  const r1 = M.repetir(plano, [2, 100], {}), r2 = (() => { const q = nuevoJ(plano); corre(plano, q, 2, 50); M.pausar(q); M.reanudar(q); corre(plano, q, 2, 50); return q; })();
  check('pausar y reanudar no cambia el resultado de la partida', r1.x === r2.x && r1.t === r2.t); }

console.log('T19 · Reintentar');
{ const t = nuevoJ(plano); corre(plano, t, 2 | 4, 50);
  const n = M.nuevo(plano, {});
  check('un intento nuevo empieza en el inicio, con 100 de agua y el reloj a 0', n.x === 2 && n.agua === 100 && n.t === 0 && n.fase === 'lista' && n.cp === 0); }

console.log('T25 · Pasos fijos: el resultado no depende de los fotogramas por segundo');
{ const r = [2, 40, 6, 12, 2, 60, 0, 30];
  const a = M.repetir(plano, r, {}); const b = nuevoJ(plano);
  // «simula» 144 fotogramas de 7 ms y de 25 ms alimentando pasos fijos con un acumulador
  const acum = dt => { const q = nuevoJ(plano); let ac = 0, t = 0, i = 0; const ent = []; r.forEach((v, k) => { if (k % 2 === 0) for (let j = 0; j < r[k + 1]; j++) ent.push(v); });
    while (i < ent.length) { ac += dt; while (ac >= 1 / 60 && i < ent.length) { M.paso(plano, q, ent[i++]); ac -= 1 / 60; } t += dt; } return q; };
  const f1 = acum(7 / 1000), f2 = acum(25 / 1000);
  check('mismas pulsaciones en pantallas de 144 Hz y de 40 Hz dan la misma posición final', f1.x === f2.x && f1.y === f2.y && f1.x === a.x && f1.t === a.t, [f1.x, f2.x, a.x].join(' / ')); }

console.log('T28 · Resultado reproducible');
{ const r = [2, 70, 6, 14, 2, 100, 6, 14, 2, 80];
  const a = M.repetir(L1, r, {}), b = M.repetir(L1, r, {});
  check('las mismas pulsaciones dan exactamente el mismo estado', JSON.stringify(M.clonar(a)) === JSON.stringify(M.clonar(b)));
  const g = M.grabadora(); const s2 = nuevoJ(L1);
  for (let i = 0; i < 400; i++) { const m = i % 90 < 60 ? 2 : (i % 90 < 74 ? 6 : 0); g.anota(m); M.paso(L1, s2, m); }
  const rep = M.repetir(L1, g.runs(), {});
  check('lo que graba la grabadora, repetido, da el mismo estado', rep.x === s2.x && rep.y === s2.y && rep.t === s2.t && rep.agua === s2.agua);
  check('el reto del día es siempre el mismo para la misma fecha y reparte niveles y condiciones',
    JSON.stringify(M.retoDelDia('2026-11-07', NIV.map(n => n.nivel.level_id))) === JSON.stringify(M.retoDelDia('2026-11-07', NIV.map(n => n.nivel.level_id)))
    && new Set(Array.from({ length: 60 }, (_, i) => M.retoDelDia('2026-10-' + String(i % 28 + 1).padStart(2, '0') + i, NIV.map(n => n.nivel.level_id)).nivel)).size >= 4); }

console.log('T24 · Niveles: validación y JSON inválido');
check('los 11 niveles son válidos', NIV.length === 11 && NIV.every(n => n.ok), NIV.map(n => n.error).filter(Boolean).join('; '));
check('cada nivel tiene un identificador y una suma de control distintos', new Set(NIV.map(n => n.nivel.level_id)).size === 11 && new Set(NIV.map(n => n.nivel.checksum)).size === 11);
const malo = (f) => { const x = JSON.parse(TEXTOS[0]); f(x); return M.cargar(JSON.stringify(x)); };
check('texto que no es JSON → error recuperable (no lanza)', M.cargar('{no es json').ok === false && /./.test(M.cargar('{no es json').error));
check('sin suelo en la meta → error', !malo(x => { x.goals.finish_x = 9999; x.world.max_x = 10000; }).ok);
check('inicio en el aire → error', !malo(x => { x.spawn.y = 50; }).ok);
check('identificadores repetidos → error', !malo(x => { x.solids.push(Object.assign({}, x.solids[0])); }).ok);
check('un hueco con suelo debajo → error', !malo(x => { x.obstacles.push({ id: 'OBS-X', kind: 'gap', x0: 10, x1: 11.4 }); }).ok);
check('falta el mundo → error', !malo(x => { delete x.world; }).ok);

console.log('Nivel 1 · valores exactos del dossier');
check('longitud 420 u, hueco 1 en 88–89,4, hueco 2 en 116–117,6, rocas 171–176, punto de control en x=205 y meta en 414',
  L1.world.max_x >= 420 && L1.obstacles.some(o => o.id === 'OBS-01' && o.x0 === 88 && o.x1 === 89.4) && L1.obstacles.some(o => o.id === 'OBS-02' && o.x0 === 116 && o.x1 === 117.6)
  && L1.obstacles.some(o => o.id === 'OBS-03' && o.x0 === 171 && o.x1 === 176) && L1.checkpoint.x === 205 && L1.goals.finish_x === 414);
check('estrellas del dossier: agua ≥ 75 y 180 s', L1.goals.star_2_integrity === 75 && L1.goals.star_3_time_s === 180);
check('dos rutas en el cruce (alta y baja)', (L1.routes || []).length === 2);

console.log('Condiciones del reto');
{ const a = M.nuevo(plano, { mod: 'poca' }), f = M.nuevo(plano, { mod: 'fragil' });
  check('«poca agua» empieza con 70', a.agua === 70);
  const Lc = mk({ solids: [suelo(-5, 14, 4), suelo(14, 100, 0)], spawn: { x: 2, y: 4 }, checkpoint: { id: 'CP-01', x: 40, y: 0 } });
  const t = nuevoJ(Lc, { mod: 'fragil' }); t.x = 9; t.y = 4; corre(Lc, t, 2, 400);
  check('«cántaro frágil»: una caída fuerte cuesta 38 (25 × 1,5 redondeado)', t.agua === 62, String(t.agua)); }

if (!process.env.SALTAR_ROBOT) {
  console.log('T14 · Todos los niveles y rutas se terminan (robot)');
  const { jugar } = require('../tools/bot.cjs');
  for (let i = 0; i < NIV.length; i++) {
    const L = NIV[i].nivel, rutas = (L.routes || []).map(r => r.id), casos = rutas.length ? rutas : [''];
    for (const ruta of casos) {
      const o = jugar(L, { limpio: true, ruta: ruta || undefined });
      check('nivel ' + (i + 1) + (ruta ? ' · ' + ruta : '') + ': se termina con ' + (o.ok ? o.estado.agua + ' de agua y ' + (o.estado.t / 60).toFixed(0) + ' s' : '—'), o.ok && o.estado.estrellas >= 1 && (!ruta || o.estado.ruta === ruta), o.razon || (o.estado && o.estado.ruta));
    }
  }
}

console.log('T30 · Peligros vivos (2.1)');
{
  const conPel = (hz, solids) => { const L = JSON.parse(JSON.stringify(BASE)); L.level_id = 'peligros'; L.routes = []; L.hints = []; L.obstacles = [];
    L.solids = solids || [{ id: 'P', kind: 'ground', x0: -5, x1: 100, top: 0 }]; L.spawn = { x: 2, y: 0 }; L.checkpoint = { id: 'CP-01', x: 40, y: 0 }; L.checkpoints_extra = [];
    L.world.min_x = -5; L.world.max_x = 100; L.world.kill_y = -20; L.goals.finish_x = 90; L.hazards = hz; return M.validar(L); };
  // piedra: baja de x1 a x0 y golpea
  let L = conPel([{ id: 'PIE-1', kind: 'piedra', x0: 2, x1: 20, y: 0, vel: 3.2, periodo: 400, desfase: 0 }]);
  let s = nuevoJ(L); corre(L, s, 0, 400);
  check('una piedra que rueda golpea a Martín (−12) y lo echa hacia atrás', s.danos === M.DANO_PIEDRA && s.golpes === 1, s.danos);
  s = nuevoJ(L); s.t = 0; corre(L, s, 4, 1); hasta(L, s, 4, q => q.t > 330); 
  const e0 = M.peligro(L.peligros[0], 10), e1 = M.peligro(L.peligros[0], 10);
  check('el estado de un peligro depende solo del reloj (igual en la app y en el servidor)', JSON.stringify(e0) === JSON.stringify(e1) && e0.x < 20);
  // géiser: lanza hacia arriba y quita 8
  L = conPel([{ id: 'GEI-1', kind: 'geiser', x: 2, y: 0, periodo: 120, aviso: 30, activo: 30, fuerza: 9, desfase: 0 }]);
  s = nuevoJ(L); corre(L, s, 0, 31);
  check('el géiser lanza a Martín por el aire y quita 8 de agua', s.vy > 5 && !s.suelo && s.danos === M.DANO_VAPOR, s.vy + ' ' + s.danos);
  s = nuevoJ(L); corre(L, s, 0, 29);
  check('mientras el géiser solo avisa, no hace nada', s.danos === 0 && s.suelo);
  // ola: empuja hacia atrás
  L = conPel([{ id: 'OLA-1', kind: 'ola', x0: 0, x1: 6, y: 0, alto: 1.6, periodo: 120, aviso: 20, activo: 30, desfase: 0 }]);
  s = nuevoJ(L); corre(L, s, 0, 21);
  check('la ola empuja hacia atrás y quita 8', s.vx < 0 && s.danos === M.DANO_OLA, s.vx + ' ' + s.danos);
  // viento en contra: avanza más despacio
  L = conPel([{ id: 'VIE-1', kind: 'viento', x0: 0, x1: 99, fuerza: -1.8, periodo: 300, activo: 299, desfase: 0 }]);
  s = nuevoJ(L); corre(L, s, 2, 150);
  const libre = nuevoJ(plano); corre(plano, libre, 2, 150);
  check('con viento en contra se avanza menos, pero se avanza', s.x < libre.x - 1 && s.x > 4, s.x + ' vs ' + libre.x);
  s = nuevoJ(L); corre(L, s, 0, 150);
  check('quieto, el viento empuja hacia atrás', s.x < 2);
  // suelo frágil: aguanta 1 s y se hunde; vuelve al reaparecer
  L = conPel([], [{ id: 'A', kind: 'ground', x0: -5, x1: 10, top: 0 }, { id: 'F', kind: 'ground', x0: 10, x1: 14, top: 0, fragil: true }, { id: 'B', kind: 'ground', x0: 14, x1: 100, top: 0 }]);
  s = nuevoJ(L); s.x = 12; s.rx = 2; corre(L, s, 0, M.DERRUMBE - 2);
  check('el suelo agrietado aguanta un momento al pisarlo', s.suelo && s.y === 0);
  corre(L, s, 0, 40);
  check('después se hunde y Martín cae', s.der.F === 0 && (s.y < -1 || s.fase === 'reaparece'));
  hasta(L, s, 0, q => q.fase === 'jugando' && q.caidas === 1, 600);
  check('al reaparecer, el suelo vuelve a estar', Object.keys(s.der).length === 0 && s.caidas === 1);
  // validación
  let err = ''; try { conPel([{ id: 'X', kind: 'meteorito', periodo: 100, desfase: 0 }]); } catch (e) { err = e.message; }
  check('un peligro desconocido hace el nivel no válido', /peligro desconocido/.test(err));
  check('los 6 niveles traen peligros vivos', NIV.every(n => n.ok && n.nivel.peligros.length >= 1) && NIV.some(n => n.nivel.solids.some(q => q.fragil)));
}

console.log('T31 · Lava, aljibes y frutos (2.2)');
{
  const mkO = (extra) => { const L = JSON.parse(JSON.stringify(BASE)); L.level_id = 'objetos'; L.routes = []; L.hints = []; L.obstacles = [];
    L.solids = [{ id: 'P', kind: 'ground', x0: -5, x1: 200, top: 0 }]; L.spawn = { x: 2, y: 0 }; L.checkpoint = { id: 'CP-01', x: 40, y: 0 }; L.checkpoints_extra = [];
    L.world.min_x = -5; L.world.max_x = 200; L.world.kill_y = -20; L.goals.finish_x = 190; Object.assign(L, extra); return M.validar(L); };
  let L = mkO({ items: [{ id: 'A1', kind: 'aljibe', x: 6, y: 0.9 }, { id: 'F1', kind: 'tuno', x: 12, y: 2.9 }] });
  let s = nuevoJ(L, { agua: 50 }); s.ag0 = 100; corre(L, s, 2, 120);
  check('el aljibe repone 20 de agua al pasar', s.agua === 70 && s.obj.A1 === 'aljibe', s.agua);
  check('el fruto en alto no se coge andando', !s.obj.F1);
  s = nuevoJ(L, { agua: 95 }); corre(L, s, 2, 120);
  check('el aljibe no pasa del agua inicial', s.agua === 95);
  s = nuevoJ(L); s.x = 12; corre(L, s, 4, 25);
  check('saltando debajo se coge el fruto', !!s.obj.F1 && M.resultado(s).objetos.includes('F1') && !M.resultado(s).objetos.includes('A1'));
  L = mkO({ hazards: [{ id: 'LAVA', kind: 'lava', desde: 10, ventaja: 6, vel: 3, hasta: 150 }] });
  s = nuevoJ(L); corre(L, s, 2, 300);
  check('corriendo sin parar, la lava no alcanza a Martín', s.fase === 'jugando' && s.lava != null && s.x - s.lava > 6, s.x + ' ' + s.lava);
  corre(L, s, 0, 400);
  check('si se para, la lava le alcanza y la misión falla', s.fase === 'fallo' && s.causa === 'lava');
  s = nuevoJ(L); corre(L, s, 2, 3000);
  check('pasada la zona segura, la lava se detiene', s.fase !== 'fallo' && s.x > 150);
  check('Timanfaya (nivel 3) tiene persecución de lava y todos los niveles tienen aljibes y 3 frutos', !!NIV[2].nivel.lava && NIV.every(n => n.nivel.objetos.filter(o => o.kind === 'aljibe').length >= 1 && n.nivel.objetos.filter(o => o.kind !== 'aljibe').length === 3), NIV.map(n => n.nivel.objetos.length).join(','));
}

console.log('T32 · Salinas que resbalan (2.3)');
{
  const mkS = (sal) => { const L = JSON.parse(JSON.stringify(BASE)); L.level_id = 'sal'; L.routes = []; L.hints = []; L.obstacles = []; L.hazards = []; L.items = [];
    L.solids = [{ id: 'P', kind: 'ground', x0: -5, x1: 200, top: 0, sal }]; L.spawn = { x: 2, y: 0 }; L.checkpoint = { id: 'CP-01', x: 40, y: 0 }; L.checkpoints_extra = [];
    L.world.min_x = -5; L.world.max_x = 200; L.world.kill_y = -20; L.goals.finish_x = 190; return M.validar(L); };
  const frena = (L) => { const s = nuevoJ(L); corre(L, s, 2, 90); const x0 = s.x, v = s.vx; corre(L, s, 0, 200); return { d: s.x - x0, v }; };
  const a = frena(mkS(false)), b = frena(mkS(true));
  check('en suelo normal Martín frena casi en seco', a.d < 0.5, a.d.toFixed(2));
  check('sobre la sal resbala más de 2 u al soltar', b.d > 2 && b.d < 4, b.d.toFixed(2));
  check('sobre la sal llega igual a la velocidad máxima', Math.abs(b.v - M.VMAX) < 1e-9);
  const arr = (L) => { const s = nuevoJ(L); corre(L, s, 2, 12); return s.vx; };
  check('sobre la sal se arranca más despacio', arr(mkS(true)) < arr(mkS(false)) * 0.6);
  check('las salinas de Janubio (nivel 8) tienen suelo de sal', NIV[7] && NIV[7].nivel.solids.some(q => q.sal));
  check('hay 11 niveles válidos', NIV.length === 11 && NIV.every(n => n.ok));
}

console.log(`\n${passed} correctas, ${failed} falladas`);
process.exit(failed ? 1 : 0);
