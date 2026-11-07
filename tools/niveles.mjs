/* Genera www/niveles.js (los 6 niveles de Uga en JSON) a partir de una descripción corta de cada tramo.
   Uso:  node tools/niveles.mjs      (la app NO usa este archivo: usa el JSON ya generado en www/niveles.js)
   Las medidas salen del motor: salto corto 1,49 u de alto y 2,87 u de largo; salto largo 1,92 y 3,27 u.
   Reglas de diseño: escalones de subida ≤ 1,4 u (el salto corto llega); huecos ≤ 3,4 u; caídas de ≥ 2,1 u derraman agua. */
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const aqui = path.dirname(fileURLToPath(import.meta.url));
const r2 = v => Math.round(v * 100) / 100;

class N {
  constructor(num, slug) { this.num = num; this.slug = slug; this.x = 0; this.top = 0; this.sol = []; this.obs = []; this.pistas = []; this.cps = []; this.rutas = []; this.n = 0; this.nobs = 0; this.minTop = 0; }
  id(p) { return p + String(++this.n).padStart(2, '0'); }
  llano(w, ruta) { const s = { id: this.id('G'), kind: 'ground', x0: r2(this.x), x1: r2(this.x + w), top: r2(this.top) }; if (ruta) s.route = ruta; this.sol.push(s); this.x = r2(this.x + w); this.minTop = Math.min(this.minTop, this.top); return this; }
  hueco(w, nombre) { this.obs.push({ id: nombre || 'OBS-' + String(++this.nobs).padStart(2, '0'), kind: 'gap', x0: r2(this.x), x1: r2(this.x + w) }); this.x = r2(this.x + w); return this; }
  roca(w, h, ruta) { const s = { id: this.id('R'), kind: 'rock', x0: r2(this.x), x1: r2(this.x + w), top: r2(this.top + h) }; if (ruta) s.route = ruta; this.sol.push(s); this.x = r2(this.x + w); return this; }
  sube(h) { this.top = r2(this.top + h); return this; }
  baja(h) { this.top = r2(this.top - h); return this; }
  tabla(w, alto, ruta) { const s = { id: this.id('T'), kind: 'oneway', x0: r2(this.x), x1: r2(this.x + w), top: r2(this.top + alto), bottom: r2(this.top + alto - 0.3) }; if (ruta) s.route = ruta; this.sol.push(s); return this; }
  repisa(x0, x1, top, ruta) { const s = { id: this.id('T'), kind: 'oneway', x0: r2(x0), x1: r2(x1), top: r2(top), bottom: r2(top - 0.3) }; if (ruta) s.route = ruta; this.sol.push(s); return this; }
  control() { this.cps.push({ id: 'CP-' + String(this.cps.length + 1).padStart(2, '0'), x: r2(this.x), y: r2(this.top) }); return this; }
  pista(id, x0, x1, hide) { this.pistas.push(Object.assign({ id, x0, x1 }, hide || {})); return this; }
  ruta(id, x0, x1) { this.rutas.push({ id, x0, x1 }); return this; }
}

function cierra(n, meta) {
  const cps = n.cps;
  const fin = n.x;
  return {
    schema_version: '0.2', level_id: meta.id, content_version: 1,
    name: meta.nombre, brief: meta.resumen,
    world: { min_x: 0, max_x: r2(fin), kill_y: r2(n.minTop - 4.6) },
    spawn: { x: 4, y: 0 },
    checkpoint: cps[0],
    checkpoints_extra: cps.slice(1),
    cargo: { type: 'water', initial_integrity: 100 },
    goals: { finish_x: r2(fin - 6), finish_min_integrity: 1, star_2_integrity: 75, star_3_time_s: meta.estrella3, star_3_integrity: 75 },
    solids: n.sol, obstacles: n.obs, routes: n.rutas, hints: n.pistas,
    theme: meta.tema, resources: ['martin', 'agua', 'suelo_uga', 'fondo_uga', 'sfx_salto', 'sfx_golpe', 'sfx_exito']
  };
}

/* ---------- L01 · Agua para Uga (anclas exactas del dossier MARTIN-L01-001) ---------- */
function l01() {
  const sol = [], S = (id, kind, x0, x1, top, extra) => sol.push(Object.assign({ id, kind, x0, x1, top }, extra || {}));
  S('G01', 'ground', 0, 88, 0);
  S('G02', 'ground', 89.4, 116, 0);
  S('G03', 'ground', 117.6, 140, 0);
  S('G04', 'ground', 140, 146, -1.2);
  S('G05', 'ground', 146, 218, -2.4);
  S('R01', 'rock', 171, 172.4, -1.5);
  S('R02', 'rock', 174, 176, -1.1);
  // ruta baja: suelo firme, dos obstáculos pequeños
  S('G06', 'ground', 218, 280, -2.4, { route: 'RUTA-BAJA' });
  S('G06b', 'ground', 280, 290, -2.4);
  S('R03', 'rock', 236, 237.4, -1.8, { route: 'RUTA-BAJA' });
  S('R04', 'rock', 262, 263.6, -1.7, { route: 'RUTA-BAJA' });
  // ruta alta: repisas que se suben desde abajo y pasarela con dos huecos (más rápida, pero una caída desde allí derrama agua)
  const T = (id, x0, x1, top) => S(id, 'oneway', x0, x1, top, { bottom: Math.round((top - 0.3) * 100) / 100, route: 'RUTA-ALTA' });
  T('A01', 214, 218, -1.05); T('A02', 218, 222, 0.3);
  T('A03', 222, 238, 1.65); T('A04', 240.6, 258, 1.65); T('A05', 261, 280, 1.65);
  T('A06', 280, 284, 0.3); T('A07', 284, 288, -1.05);
  // combinación de destrezas
  S('G07', 'ground', 290, 302, -2.4);
  S('G08', 'ground', 302, 312, -1.1);
  S('R05', 'rock', 306, 307.4, -0.3);
  S('G09', 'ground', 312, 318, 0.2);
  S('G10', 'ground', 319.8, 334, 0.2);
  S('G11', 'ground', 334, 340, -1.1);
  S('G12', 'ground', 340, 420, -2.4);
  return {
    schema_version: '0.2', level_id: 'uga_l01_water_delivery', content_version: 1,
    name: 'Agua para Uga', brief: 'Lleva el cántaro de agua hasta el punto de entrega del pueblo.',
    world: { min_x: 0, max_x: 420, kill_y: -7 },
    spawn: { x: 4, y: 0 },
    checkpoint: { id: 'CP-01', x: 205, y: -2.4 },
    checkpoints_extra: [],
    cargo: { type: 'water', initial_integrity: 100 },
    goals: { finish_x: 414, finish_min_integrity: 1, star_2_integrity: 75, star_3_time_s: 180, star_3_integrity: 75 },
    solids: sol,
    obstacles: [
      { id: 'OBS-01', kind: 'gap', x0: 88, x1: 89.4 }, { id: 'OBS-02', kind: 'gap', x0: 116, x1: 117.6 },
      { id: 'OBS-03', kind: 'rocks', x0: 171, x1: 176 },
      { id: 'OBS-04', kind: 'gap', x0: 318, x1: 319.8 },
      { id: 'OBS-05', kind: 'brecha', x0: 238, x1: 240.6 }, { id: 'OBS-06', kind: 'brecha', x0: 258, x1: 261 }
    ],
    routes: [{ id: 'RUTA-ALTA', x0: 218, x1: 280 }, { id: 'RUTA-BAJA', x0: 218, x1: 280 }],
    hints: [
      { id: 'mover', x0: 0, x1: 60, hasta_x: 22 },
      { id: 'saltar', x0: 56, x1: 90, hasta_saltos: 1 },
      { id: 'mantener', x0: 90, x1: 117, hasta_saltos: 4 },
      { id: 'caidas', x0: 124, x1: 148 },
      { id: 'rocas', x0: 158, x1: 178 },
      { id: 'dos_caminos', x0: 196, x1: 218 },
      { id: 'hueco_final', x0: 296, x1: 320 },
      { id: 'entrega', x0: 392, x1: 414 }
    ],
    theme: 'uga', resources: ['martin', 'agua', 'suelo_uga', 'fondo_uga', 'sfx_salto', 'sfx_golpe', 'sfx_exito']
  };
}

/* Pasajes reutilizables */
const rocas = (n, lista, sep) => { for (const [w, h] of lista) n.roca(w, h).llano(sep); return n; };
const huecos = (n, lista, tierra) => { for (const w of lista) n.hueco(w).llano(tierra); return n; };
const sube = (n, k, h, w) => { for (let i = 0; i < k; i++) n.sube(h).llano(w); return n; };
const baja = (n, k, h, w) => { for (let i = 0; i < k; i++) n.baja(h).llano(w); return n; };

/* ---------- L02 · Tras la tormenta ---------- */
function l02() {
  const n = new N(2, 'tras_la_tormenta');
  n.llano(30).pista('mover', 0, 40, { hasta_x: 18 });
  rocas(n, [[1.6, 0.7], [1.6, 0.9]], 13).roca(2, 1.2).llano(16).pista('rocas2', 28, 80, { hasta_x: 80 });
  n.hueco(1.8).llano(14);
  rocas(n, [[1.2, 0.6], [1.2, 0.6]], 8);
  baja(n, 2, 1.2, 14).llano(8).control();
  n.llano(10).roca(3, 1.0).llano(14);
  huecos(n, [2.0], 10); sube(n, 1, 1.2, 8); n.roca(1.4, 0.8).llano(6); huecos(n, [2.2], 12);
  baja(n, 1, 1.2, 18);
  rocas(n, [[1.4, 1.0], [1.4, 1.0], [1.4, 1.0]], 9);
  n.hueco(2.0).llano(20);
  // segunda mitad: más rocas seguidas y bajadas con roca al final
  rocas(n, [[1.4, 0.7], [1.4, 0.9], [1.4, 1.1], [1.4, 0.9]], 7).llano(8).control();
  baja(n, 1, 1.2, 8); n.roca(2.4, 1.3).llano(10); baja(n, 1, 1.2, 12);
  huecos(n, [2.0, 2.2], 8); rocas(n, [[1.4, 0.8]], 8);
  sube(n, 1, 1.3, 14); baja(n, 1, 1.3, 10);
  rocas(n, [[1.2, 0.7], [1.2, 0.9], [1.2, 1.1], [1.2, 0.9], [1.2, 0.7]], 6);
  n.hueco(2.4).llano(16);
  n.sube(1.3).llano(14).baja(1.3).llano(10);
  n.llano(46);
  n.pista('entrega', n.x - 28, n.x - 6, {});
  return cierra(n, { id: 'uga_l02_after_the_storm', nombre: 'Tras la tormenta', resumen: 'La tormenta ha dejado rocas por el camino. Frena o salta con cabeza.', estrella3: 210, tema: 'uga' });
}

/* ---------- L03 · El barranco seco ---------- */
function l03() {
  const n = new N(3, 'barranco');
  n.llano(24).pista('barranco', 10, 48, { hasta_x: 48 });
  huecos(n, [2.2, 2.4], 9);
  n.llano(2).hueco(2.6).llano(4).hueco(2.6).llano(4).hueco(2.6).llano(14).control();
  n.sube(1.3).llano(6).hueco(2.8).llano(8).baja(1.3).hueco(2.4).llano(6);
  n.roca(1.4, 0.9).llano(10).hueco(3.0).llano(10);
  n.sube(1.2).llano(5).hueco(2.6).llano(5).sube(1.2).llano(5).hueco(2.6).llano(8);
  n.baja(1.2).llano(5).hueco(2.4).llano(4).baja(1.2).llano(14).control();
  n.hueco(3.2).llano(6).hueco(1.8).llano(6).hueco(3.2).llano(20);
  n.roca(1.4, 0.8).llano(12).hueco(2.4).llano(10);
  // tramo de las tres pasarelas
  for (let i = 0; i < 3; i++) { n.llano(4).hueco(2.8 + i * 0.2).llano(3).sube(0.6).hueco(2.6).llano(5).baja(0.6); }
  n.llano(14).sube(1.4).llano(4).hueco(2.6).llano(4).baja(1.4).hueco(2.6).llano(10).control();
  huecos(n, [2.4, 3.0, 2.4, 3.2], 6);
  n.roca(1.2, 0.8).llano(5).hueco(2.6).llano(5).sube(1.3).llano(4).hueco(2.8).llano(4).baja(1.3).llano(12);
  huecos(n, [2.0, 2.0, 2.0], 5); n.llano(10).hueco(3.4).llano(16);
  n.llano(46);
  n.pista('entrega', n.x - 28, n.x - 6, {});
  return cierra(n, { id: 'uga_l03_dry_ravine', nombre: 'El barranco seco', resumen: 'Las lluvias abrieron grietas en el camino. Calcula cada salto.', estrella3: 200, tema: 'uga' });
}

/* ---------- L04 · Bajada a la hoya ---------- */
function l04() {
  const n = new N(4, 'hoya');
  n.llano(26).pista('bajada', 12, 60, { hasta_x: 60 });
  baja(n, 3, 1.0, 9).roca(1.4, 0.7).llano(10);
  n.baja(1.2).llano(6).hueco(2.0).llano(8).baja(1.0).llano(10).control();
  rocas(n, [[1.6, 0.9], [1.6, 0.9]], 8);
  baja(n, 2, 1.2, 8); n.hueco(2.4).llano(8); n.roca(2.0, 1.1).llano(10);
  baja(n, 2, 1.0, 8); rocas(n, [[1.4, 0.8], [1.4, 0.8]], 8);
  n.hueco(2.2).llano(8).baja(1.2).llano(12).control();
  // fondo de la hoya y salida en escalera
  n.hueco(2.4).llano(8); n.roca(2.4, 1.2).llano(10);
  sube(n, 3, 1.3, 7); n.llano(4);
  n.hueco(2.6).llano(8); n.baja(1.3).llano(6); n.roca(1.4, 0.8).llano(12);
  sube(n, 1, 1.2, 6); n.hueco(2.4).llano(6); sube(n, 1, 1.2, 10);
  rocas(n, [[1.4, 0.9], [1.4, 1.0]], 9); n.hueco(2.8).llano(10);
  baja(n, 2, 1.2, 10); n.roca(1.4, 0.9).llano(8); n.baja(1.0).llano(8); n.hueco(2.2).llano(12);
  n.llano(46);
  n.pista('entrega', n.x - 28, n.x - 6, {});
  return cierra(n, { id: 'uga_l04_basin_descent', nombre: 'Bajada a la hoya', resumen: 'Una larga bajada: las caídas altas derraman el agua.', estrella3: 210, tema: 'uga' });
}

/* ---------- L05 · Dos caminos ---------- */
function l05() {
  const n = new N(5, 'dos_caminos');
  n.llano(28).pista('mover', 0, 36, { hasta_x: 18 });
  n.roca(1.4, 0.8).llano(12).hueco(2.2).llano(12).baja(1.2).llano(10).roca(1.6, 0.9).llano(14).control();
  n.llano(16).pista('bifurca', n.x - 24, n.x + 4, {});
  const F = r2(n.x + 4), t = n.top, LONG = 96;
  n.llano(4);
  // camino bajo: suelo, rocas y dos huecos pequeños (más largo de cruzar, pero sin sustos)
  n.ruta('RUTA-ALTA', F, F + LONG).ruta('RUTA-BAJA', F, F + LONG);
  n.llano(8, 'RUTA-BAJA').roca(1.4, 0.7, 'RUTA-BAJA').llano(8, 'RUTA-BAJA').roca(1.4, 0.7, 'RUTA-BAJA').llano(6, 'RUTA-BAJA').hueco(1.6).llano(8, 'RUTA-BAJA')
    .roca(1.4, 0.8, 'RUTA-BAJA').llano(8, 'RUTA-BAJA').hueco(1.8).llano(8, 'RUTA-BAJA').roca(1.4, 0.8, 'RUTA-BAJA').llano(F + LONG - n.x, 'RUTA-BAJA');
  // camino alto: repisas, pasarela con cuatro huecos y bajada
  const U = 1.35;
  n.repisa(F, F + 4, t + U, 'RUTA-ALTA').repisa(F + 4, F + 8, t + 2 * U, 'RUTA-ALTA');
  n.repisa(F + 8, F + 24, t + 3 * U, 'RUTA-ALTA').repisa(F + 26.6, F + 42, t + 3 * U, 'RUTA-ALTA').repisa(F + 44.8, F + 58, t + 3 * U, 'RUTA-ALTA')
    .repisa(F + 61, F + 72, t + 3 * U, 'RUTA-ALTA').repisa(F + 74.6, F + 86, t + 3 * U, 'RUTA-ALTA');
  n.obs.push({ id: 'ALT-01', kind: 'brecha', x0: F + 24, x1: F + 26.6 }, { id: 'ALT-02', kind: 'brecha', x0: F + 42, x1: F + 44.8 }, { id: 'ALT-03', kind: 'brecha', x0: F + 58, x1: F + 61 }, { id: 'ALT-04', kind: 'brecha', x0: F + 72, x1: F + 74.6 });
  n.repisa(F + 86, F + 90, t + 2 * U, 'RUTA-ALTA').repisa(F + 90, F + 94, t + U, 'RUTA-ALTA');
  n.llano(14).hueco(2.4).llano(10).baja(1.0).llano(8).roca(1.6, 1.0).llano(10);
  n.llano(2).hueco(2.6).llano(5).hueco(2.6).llano(5).sube(1.2).llano(10).control();
  n.roca(1.4, 0.8).llano(10).hueco(2.2).llano(10).baja(1.2).llano(12);
  rocas(n, [[1.4, 0.8], [1.4, 1.0], [1.4, 0.8]], 8); huecos(n, [2.4, 2.6], 8);
  sube(n, 2, 1.3, 6); n.hueco(2.8).llano(8); baja(n, 2, 1.3, 8);
  rocas(n, [[1.2, 0.7], [1.2, 0.9]], 6); huecos(n, [2.2, 2.2, 2.2], 4); n.llano(8);
  n.llano(46);
  n.pista('entrega', n.x - 28, n.x - 6, {});
  return cierra(n, { id: 'uga_l05_two_roads', nombre: 'Dos caminos', resumen: 'Camino alto y rápido, o camino bajo y seguro. Tú eliges.', estrella3: 220, tema: 'uga' });
}

/* ---------- L06 · El gran encargo ---------- */
function l06() {
  const n = new N(6, 'gran_encargo');
  n.llano(30).pista('mover', 0, 40, { hasta_x: 18 });
  n.roca(1.4, 0.8).llano(10).hueco(2.4).llano(8); sube(n, 1, 1.2, 6); n.hueco(2.6).llano(8); baja(n, 1, 1.2, 10); n.control();
  rocas(n, [[1.2, 0.7], [1.2, 0.9], [1.2, 1.1]], 6).llano(6);
  baja(n, 2, 1.2, 5); n.hueco(2.4).llano(8); sube(n, 2, 1.3, 5); n.llano(5).hueco(2.8).llano(8);
  huecos(n, [2.2, 2.2, 2.2], 3).llano(9).control();
  n.roca(2.0, 1.2).llano(10); baja(n, 1, 1.3, 6); n.roca(1.4, 0.9).llano(6); baja(n, 1, 1.3, 10);
  n.hueco(3.0).llano(8); sube(n, 1, 1.4, 5); n.hueco(2.8).llano(5); baja(n, 1, 1.4, 8); n.hueco(3.2).llano(12);
  rocas(n, [[1.4, 0.9], [1.4, 0.9]], 7); n.hueco(2.6).llano(14).control();
  sube(n, 1, 1.3, 6); n.roca(1.4, 0.8).llano(5).hueco(2.4).llano(6); sube(n, 1, 1.3, 6); n.hueco(2.6).llano(8);
  baja(n, 1, 1.3, 5); n.hueco(2.8).llano(4); baja(n, 1, 1.3, 8); n.roca(1.6, 1.0).llano(8).hueco(3.2).llano(14);
  rocas(n, [[1.2, 0.8], [1.2, 0.8]], 5); huecos(n, [2.4, 2.4], 4).llano(4); baja(n, 1, 1.2, 14).control();
  // gran final: pasarelas, rocas altas, bajada y escalera
  for (let i = 0; i < 3; i++) { n.hueco(2.6 + (i % 2) * 0.4).llano(3.5); }
  n.llano(8); rocas(n, [[1.4, 0.9], [1.4, 1.1]], 5);
  sube(n, 2, 1.3, 5); n.hueco(3.0).llano(6); baja(n, 2, 1.3, 5); n.hueco(2.8).llano(10);
  rocas(n, [[1.2, 0.7], [1.2, 0.9], [1.2, 0.7]], 5);
  huecos(n, [2.4, 3.2], 6); n.roca(1.8, 1.2).llano(10);
  // cuesta final con checkpoint en medio del recorrido largo
  n.roca(1.4, 0.8).llano(6).hueco(2.4).llano(8);
  n.llano(54);
  n.pista('entrega', n.x - 28, n.x - 6, {});
  return cierra(n, { id: 'uga_l06_great_delivery', nombre: 'El gran encargo', resumen: 'El recorrido más largo de Uga: todo lo aprendido, en un solo viaje.', estrella3: 300, tema: 'uga' });
}

const niveles = [l01(), l02(), l03(), l04(), l05(), l06()];
const out = '/* Niveles de Uga (JSON validado por Martin.cargar). GENERADO por tools/niveles.mjs: no editar a mano. © 2026 IT Canarias. */\n'
  + '(function (root) {\nconst N = [\n' + niveles.map(l => '  ' + JSON.stringify(JSON.stringify(l))).join(',\n') + '\n];\n'
  + 'root.MARTIN_NIVELES = N;\nif (typeof module !== "undefined" && module.exports) module.exports = N;\n})(typeof self !== "undefined" ? self : globalThis);\n';
fs.writeFileSync(path.join(aqui, '..', 'www', 'niveles.js'), out);
console.log('niveles.js escrito:', niveles.map(l => l.level_id + ' (' + l.world.max_x + ' u)').join(', '));
