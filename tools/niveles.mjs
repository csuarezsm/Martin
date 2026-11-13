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
  llano(w, ruta, extra) { const s = Object.assign({ id: this.id('G'), kind: 'ground', x0: r2(this.x), x1: r2(this.x + w), top: r2(this.top) }, extra || {}); if (ruta) s.route = ruta; this.sol.push(s); this.x = r2(this.x + w); this.minTop = Math.min(this.minTop, this.top); return this; }
  sal(w) { return this.llano(w, '', { sal: true }); }
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


/* ======================= Mundo 2 · La costa y el norte (2.3) ======================= */
/* ---------- L07 · El Golfo: arena negra, olas y el cráter partido por el mar ---------- */
function l07() {
  const n = new N(7, 'golfo');
  n.llano(30).pista('olas', 14, 60, { hasta_x: 60 });
  n.roca(1.4, 0.8).llano(14).hueco(2.2).llano(16);
  rocas(n, [[1.4, 0.8], [1.6, 1.0]], 10); n.baja(1.2).llano(18).control();
  n.llano(16).hueco(2.6).llano(6).hueco(2.4).llano(18);
  sube(n, 2, 1.2, 8); n.hueco(2.8).llano(14); baja(n, 2, 1.2, 12);
  n.llano(18).roca(1.4, 0.9).llano(16).control();
  n.llano(14).hueco(3.0).llano(16); rocas(n, [[1.2, 0.7], [1.2, 0.9], [1.2, 0.7]], 7);
  n.llano(18).hueco(2.4).llano(5).hueco(2.6).llano(18);
  n.sube(1.3).llano(10).hueco(2.6).llano(8).baja(1.3).llano(20).control();
  rocas(n, [[1.4, 1.0]], 12); n.llano(16).hueco(3.0).llano(18); baja(n, 1, 1.0, 16);
  n.llano(46);
  n.pista('entrega', n.x - 28, n.x - 6, {});
  return cierra(n, { id: 'norte_l07_el_golfo', nombre: 'La laguna verde', resumen: 'Arena negra y olas que revientan contra la orilla. Espera tu momento.', estrella3: 220, tema: 'golfo' });
}

/* ---------- L08 · Salinas de Janubio: la sal resbala ---------- */
function l08() {
  const n = new N(8, 'janubio');
  n.llano(24).pista('sal', 22, 70, { hasta_x: 70 });
  n.sal(16).llano(4).hueco(1.6).llano(3).sal(12).llano(6);
  n.roca(1.4, 0.7).llano(10).control();
  n.sal(10).hueco(2.0).sal(10).hueco(2.2).sal(8).llano(8);
  n.sal(14).roca(1.4, 0.7).sal(12).llano(6).baja(1.0).llano(10).control();
  n.sal(8).hueco(2.4).sal(6).hueco(2.4).sal(6).hueco(2.6).llano(10);
  n.sube(1.2).llano(6).sal(10).hueco(2.6).sal(10).baja(1.2).llano(12);
  rocas(n, [[1.4, 0.8], [1.4, 0.8]], 8); n.llano(6).control();
  n.sal(12).roca(1.2, 0.7).sal(8).roca(1.2, 0.9).sal(10).llano(4).hueco(2.8).llano(8);
  n.sal(6).hueco(2.2).sal(6).hueco(2.2).sal(6).hueco(2.2).llano(12);
  n.sal(18).llano(10).hueco(3.0).llano(14);
  n.llano(46);
  n.pista('entrega', n.x - 28, n.x - 6, {});
  return cierra(n, { id: 'norte_l08_janubio', nombre: 'Las salinas', resumen: 'La sal resbala: arranca con calma y frena antes de los bordes.', estrella3: 230, tema: 'janubio' });
}

/* ---------- L09 · Famara: dunas, viento y piedras que caen del risco ---------- */
function l09() {
  const n = new N(9, 'famara');
  n.llano(28).pista('viento', 18, 70, { hasta_x: 70 });
  n.sube(0.8).llano(10).baja(0.8).llano(12).hueco(2.4).llano(16);
  n.sube(1.0).llano(8).sube(1.0).llano(8).hueco(2.6).llano(8).baja(1.0).llano(6).baja(1.0).llano(16).control();
  n.llano(18).hueco(2.8).llano(18); rocas(n, [[1.4, 0.8], [1.4, 1.0]], 9);
  n.llano(20).hueco(2.4).llano(6).hueco(2.6).llano(20).control();
  sube(n, 2, 0.9, 10); n.hueco(3.0).llano(18); baja(n, 2, 0.9, 12);
  n.llano(22).hueco(2.6).llano(20);
  n.roca(1.6, 1.0).llano(12).hueco(2.8).llano(22).control();
  n.llano(20).hueco(3.0).llano(8).sube(1.2).llano(8).hueco(2.6).llano(8).baja(1.2).llano(22);
  n.llano(46);
  n.pista('entrega', n.x - 28, n.x - 6, {});
  return cierra(n, { id: 'norte_l09_famara', nombre: 'Bajo el risco', resumen: 'Viento del norte y piedras que bajan del risco de Famara.', estrella3: 230, tema: 'famara' });
}

/* ---------- L10 · Haría: el valle de las mil palmeras (dos caminos) ---------- */
function l10() {
  const n = new N(10, 'haria');
  n.llano(28).pista('mover', 0, 36, { hasta_x: 18 });
  n.roca(1.4, 0.8).llano(12); sube(n, 2, 1.1, 8); n.hueco(2.4).llano(10); baja(n, 1, 1.1, 10).control();
  n.llano(14).pista('palmeras', n.x - 22, n.x + 4, {});
  const F = r2(n.x + 4), t = n.top, LONG = 108, U = 1.35;
  n.llano(4);
  n.ruta('RUTA-ALTA', F, F + LONG).ruta('RUTA-BAJA', F, F + LONG);
  // camino bajo: entre los muros de las huertas, con rocas y suelo frágil
  n.llano(8, 'RUTA-BAJA').roca(1.4, 0.8, 'RUTA-BAJA').llano(10, 'RUTA-BAJA').hueco(1.8).llano(8, 'RUTA-BAJA').roca(1.4, 0.9, 'RUTA-BAJA').llano(8, 'RUTA-BAJA')
    .hueco(2.0).llano(8, 'RUTA-BAJA').roca(1.4, 0.8, 'RUTA-BAJA').llano(8, 'RUTA-BAJA').roca(1.4, 0.8, 'RUTA-BAJA').llano(F + LONG - n.x, 'RUTA-BAJA');
  // camino alto: por las copas de las palmeras (repisas cortas con huecos)
  n.repisa(F, F + 4, t + U, 'RUTA-ALTA').repisa(F + 4, F + 8, t + 2 * U, 'RUTA-ALTA');
  let x = F + 8; const tramos = [9, 6, 7, 6, 8, 6, 7, 8, 7], brechas = [2.6, 2.8, 2.4, 3.0, 2.6, 2.8, 2.4, 2.6];
  tramos.forEach((w, i) => { n.repisa(x, x + w, t + 3 * U, 'RUTA-ALTA'); if (i < brechas.length) { n.obs.push({ id: 'PAL-' + (i + 1), kind: 'brecha', x0: r2(x + w), x1: r2(x + w + brechas[i]) }); x += w + brechas[i]; } else x += w; });
  n.repisa(x, F + LONG - 8, t + 3 * U, 'RUTA-ALTA').repisa(F + LONG - 8, F + LONG - 4, t + 2 * U, 'RUTA-ALTA').repisa(F + LONG - 4, F + LONG, t + U, 'RUTA-ALTA');
  n.llano(14).hueco(2.6).llano(10).sube(1.2).llano(8).hueco(2.8).llano(8).baja(1.2).llano(14).control();
  rocas(n, [[1.4, 0.8], [1.4, 1.0], [1.4, 0.8]], 8); huecos(n, [2.4, 2.8], 8);
  sube(n, 2, 1.2, 6); n.hueco(2.8).llano(8); baja(n, 2, 1.2, 10);
  n.llano(46);
  n.pista('entrega', n.x - 28, n.x - 6, {});
  return cierra(n, { id: 'norte_l10_haria', nombre: 'Las mil palmeras', resumen: 'Por las huertas o saltando de palmera en palmera. Tú eliges.', estrella3: 240, tema: 'haria' });
}

/* ---------- L11 · Mirador del Río: la subida al risco ---------- */
function l11() {
  const n = new N(11, 'mirador');
  n.llano(28).pista('subida', 14, 60, { hasta_x: 60 });
  sube(n, 3, 1.2, 7); n.hueco(2.4).llano(8); sube(n, 2, 1.3, 6); n.llano(8).control();
  n.roca(1.4, 0.8).llano(8).hueco(2.6).llano(6); sube(n, 2, 1.2, 6); n.hueco(2.8).llano(10);
  n.llano(4).hueco(2.4).llano(4).hueco(2.6).llano(4).hueco(2.8).llano(12).control();
  sube(n, 3, 1.3, 5); n.roca(1.4, 0.9).llano(8); n.hueco(3.0).llano(8); n.baja(1.0).llano(10);
  rocas(n, [[1.2, 0.8], [1.2, 1.0]], 6); sube(n, 2, 1.2, 6); n.hueco(2.6).llano(12).control();
  n.llano(4).hueco(2.6).llano(4).sube(1.0).hueco(2.6).llano(4).sube(1.0).hueco(2.6).llano(10);
  sube(n, 2, 1.3, 5); n.roca(1.6, 1.0).llano(10); n.hueco(3.2).llano(10).control();
  n.llano(6).hueco(2.8).llano(5).hueco(2.8).llano(5); sube(n, 2, 1.2, 6); n.hueco(3.0).llano(14);
  n.llano(54);
  n.pista('entrega', n.x - 28, n.x - 6, {});
  return cierra(n, { id: 'norte_l11_mirador', nombre: 'Lo alto del risco', resumen: 'La gran subida hasta el mirador, con el viento de cara.', estrella3: 300, tema: 'mirador' });
}

/* ======================= Niveles secretos (se abren con todos los frutos de su mundo) ======================= */
/* Van en www/secretos.js, aparte: el servidor del reto diario no los carga y su lista de niveles no cambia. */
/* ---------- S1 · Cueva de los Verdes: dentro del tubo volcánico ---------- */
function s01() {
  const n = new N(12, 'cueva');
  n.llano(26).pista('cueva', 10, 56, { hasta_x: 56 });
  n.llano(10).hueco(2.2).llano(10); rocas(n, [[1.4, 0.8]], 10); n.baja(1.0).llano(14).control();
  n.llano(8).hueco(2.4).llano(5).hueco(2.4).llano(12); sube(n, 2, 1.0, 7); n.hueco(2.6).llano(10); baja(n, 2, 1.0, 10);
  n.llano(16).roca(1.4, 0.9).llano(14).control();
  n.llano(6).hueco(2.6).llano(4).hueco(2.6).llano(4).hueco(2.8).llano(14);
  n.baja(1.2).llano(12).hueco(2.4).llano(10).sube(1.2).llano(14).control();
  rocas(n, [[1.2, 0.8], [1.4, 1.0]], 8); n.llano(10).hueco(3.0).llano(16);
  n.llano(46);
  n.pista('entrega', n.x - 28, n.x - 6, {});
  return cierra(n, { id: 'secreto_s1_cueva_verdes', nombre: 'La cueva de lava', resumen: 'Nivel secreto: el túnel de lava de la Cueva de los Verdes. Cuidado con el techo.', estrella3: 230, tema: 'cueva' });
}
/* ---------- S2 · La Graciosa: pistas de arena, olas y viento ---------- */
function s02() {
  const n = new N(13, 'graciosa');
  n.llano(28).pista('graciosa', 10, 60, { hasta_x: 60 });
  n.llano(12).hueco(2.4).llano(14); rocas(n, [[1.4, 0.8]], 12); n.llano(10).control();
  n.llano(16).hueco(2.6).llano(8).hueco(2.6).llano(16); sube(n, 1, 1.1, 10); n.hueco(2.8).llano(10); baja(n, 1, 1.1, 14);
  n.llano(18).roca(1.4, 0.9).llano(14).control();
  n.llano(20).hueco(3.0).llano(18); rocas(n, [[1.2, 0.7], [1.4, 0.9]], 9);
  n.llano(16).hueco(2.6).llano(6).hueco(2.8).llano(18).control();
  sube(n, 2, 1.1, 8); n.hueco(2.8).llano(10); baja(n, 2, 1.1, 12); n.llano(14).hueco(3.0).llano(16);
  n.llano(46);
  n.pista('entrega', n.x - 28, n.x - 6, {});
  return cierra(n, { id: 'secreto_s2_la_graciosa', nombre: 'La octava isla', resumen: 'Nivel secreto: La Graciosa, sin asfalto, con olas y viento del norte.', estrella3: 240, tema: 'graciosa' });
}

/* ---------- Peligros vivos (2.1): se colocan sobre tramos llanos, lejos del inicio, de los puntos de control y de la meta ---------- */
function peligros(L, plan) {
  const hz = [], ocup = [], cps = [L.checkpoint].concat(L.checkpoints_extra || []);
  const fin = L.goals.finish_x, h = (k) => { let x = Math.sin(k * 127.1 + L.level_id.length * 13.7) * 43758.5453; return x - Math.floor(x); };
  const libre = (x0, x1) => x0 > 26 && x1 < fin - 14 && !cps.some(c => c.x > x0 - 7 && c.x < x1 + 7) && !ocup.some(([a, b]) => x0 < b + 6 && x1 > a - 6);
  const llanos = L.solids.filter(s => s.kind === 'ground' && !s.route).sort((a, b) => a.x0 - b.x0);
  const gaps = (L.obstacles || []).filter(o => o.kind === 'gap').sort((a, b) => a.x0 - b.x0);
  const tramos = (min) => llanos.filter(s => s.x1 - s.x0 >= min && libre(s.x0, s.x1));
  const elige = (lista, k) => lista.length ? lista[Math.floor(lista.length * (0.15 + 0.7 * ((k + 0.5) / Math.max(1, plan.length))))] || lista[lista.length - 1] : null;
  plan.forEach((tipo, k) => {
    const id = tipo.toUpperCase().slice(0, 3) + '-' + String(k + 1).padStart(2, '0'), des = Math.floor(h(k + 1) * 600);
    if (tipo === 'piedra') {
      const s = elige(tramos(14), k); if (!s) return;
      const x0 = r2(s.x0 + 1), x1 = r2(Math.min(s.x1, s.x0 + 24) - 1), vel = 3.2;
      hz.push({ id, kind: 'piedra', x0, x1, y: s.top, vel, periodo: Math.ceil((x1 - x0) / vel * 60) + 100, desfase: des }); ocup.push([x0, x1]);
    } else if (tipo === 'geiser') {
      const s = elige(tramos(7), k); if (!s) return;
      const x = r2((s.x0 + s.x1) / 2);
      hz.push({ id, kind: 'geiser', x, y: s.top, periodo: 170, aviso: 55, activo: 45, fuerza: 8.5, desfase: des }); ocup.push([x - 1, x + 1]);
    } else if (tipo === 'ola') {
      const s = elige(tramos(10), k); if (!s) return;
      const c = (s.x0 + s.x1) / 2, x0 = r2(c - 2), x1 = r2(c + 2);
      hz.push({ id, kind: 'ola', x0, x1, y: s.top, alto: 1.6, periodo: 210, aviso: 55, activo: 40, desfase: des }); ocup.push([x0, x1]);
    } else if (tipo === 'viento') {
      const g = elige(gaps.filter(o => o.x1 - o.x0 >= 2.0 && libre(o.x0 - 8, o.x1 + 6)), k); if (!g) return;
      const x0 = r2(g.x0 - 8), x1 = r2(g.x1 + 6);
      hz.push({ id, kind: 'viento', x0, x1, fuerza: -1.8, periodo: 300, activo: 150, desfase: des }); ocup.push([x0, x1]);
    }
  });
  if (plan.fragiles) {
    let n = 0;
    for (const s of L.solids) {
      if (n >= plan.fragiles) break;
      if ((s.kind === 'ground' || s.kind === 'oneway') && s.x1 - s.x0 <= 4.2 && s.x0 > 30 && s.x1 < fin - 14 && !cps.some(c => c.x >= s.x0 - 1 && c.x <= s.x1 + 1) && h(s.x0) < 0.6 && !(plan.fragilSinViento && hz.some(z => z.kind === 'viento' && s.x0 < z.x1 + 3 && s.x1 > z.x0 - 3))) { s.fragil = true; n++; }
    }
  }
  L.hazards = hz;
  return L;
}
/* ---------- Objetos (2.2): aljibes que reponen agua y tres frutos escondidos por nivel ---------- */
function objetos(L, frutos, lava) {
  const it = [], cps = [L.checkpoint].concat(L.checkpoints_extra || []), fin = L.goals.finish_x;
  const usado = (x) => (L.hazards || []).some(h => (h.x != null ? Math.abs(h.x - x) < 5 : x > h.x0 - 5 && x < h.x1 + 5)) || it.some(o => Math.abs(o.x - x) < 8);
  const llanos = L.solids.filter(s => s.kind === 'ground' && !s.route && !s.fragil && s.x1 - s.x0 >= 6 && s.x0 > 20 && s.x1 < fin - 10).sort((a, b) => a.x0 - b.x0);
  const enX = (q) => { const x = L.goals.finish_x * q; return llanos.filter(s => !usado((s.x0 + s.x1) / 2)).sort((a, b) => Math.abs((a.x0 + a.x1) / 2 - x) - Math.abs((b.x0 + b.x1) / 2 - x))[0]; };
  // aljibes: a 40 % y 75 % del recorrido, a la altura del cántaro (se recogen andando)
  // frutos: dos en alto sobre suelo (hay que saltar) y uno sobre un hueco ancho (salto largo y mantenido)
  const sit = [0.22, 0.6];
  sit.forEach((q, k) => { const s = enX(q); if (s) it.push({ id: 'FRU-' + (k + 1), kind: frutos[k], x: r2((s.x0 + s.x1) / 2), y: r2(s.top + 2.9) }); });
  const g = (L.obstacles || []).filter(o => o.kind === 'gap' && o.x1 - o.x0 >= 1.4 && o.x0 > fin * 0.3 && !usado((o.x0 + o.x1) / 2) && !(lava && o.x0 > lava.desde)).sort((a, b) => b.x1 - b.x0 - (a.x1 - a.x0))[0];
  if (g) { const ant = L.solids.filter(s => s.kind === 'ground' && Math.abs(s.x1 - g.x0) < 0.01)[0]; if (ant) it.push({ id: 'FRU-3', kind: frutos[2], x: r2((g.x0 + g.x1) / 2), y: r2(ant.top + 3.1) }); }
  [0.42, 0.76].forEach((q, k) => { const s = enX(q); if (s) it.push({ id: 'ALJ-' + (k + 1), kind: 'aljibe', x: r2((s.x0 + s.x1) / 2), y: r2(s.top + 0.9) }); });
  L.items = it;
  return L;
}
function conLava(L) { // persecución: desde el último punto de control, la lava avanza detrás de Martín hasta la zona de entrega
  const cps = [L.checkpoint].concat(L.checkpoints_extra || []).sort((a, b) => a.x - b.x), ult = cps[cps.length - 1];
  const lava = { id: 'LAVA', kind: 'lava', desde: r2(ult.x + 1.5), ventaja: 10, vel: 3.05, hasta: r2(L.goals.finish_x - 30) };
  L.hazards = (L.hazards || []).filter(h => !(h.x != null ? h.x > ult.x : h.x1 > ult.x)).concat([lava]);
  return lava;
}
const plan = (lista, fragiles, extra) => Object.assign(lista, { fragiles: fragiles || 0 }, extra || {});
const niveles = [
  objetos(peligros(l01(), plan(['piedra'])), ['tuno','higo','malvasia']),
  objetos(peligros(l02(), plan(['piedra', 'viento', 'piedra', 'viento'])), ['higo','tuno','higo']),
  (L => { const lv = conLava(L); return objetos(L, ['tuno', 'tuno', 'higo'], lv); })(peligros(l03(), plan(['geiser', 'piedra', 'geiser', 'geiser'], 2))),
  objetos(peligros(l04(), plan(['viento', 'piedra', 'viento'], 3)), ['malvasia','malvasia','malvasia']),
  objetos(peligros(l05(), plan(['ola', 'geiser', 'ola', 'ola'], 2)), ['tuno','higo','tuno']),
  objetos(peligros(l06(), plan(['piedra', 'viento', 'geiser', 'piedra', 'ola'], 3)), ['malvasia','higo','tuno']),
  objetos(peligros(l07(), plan(['ola', 'ola', 'piedra', 'ola', 'ola'], 1)), ['tuno', 'higo', 'tuno']),
  objetos(peligros(l08(), plan(['viento', 'ola', 'viento'])), ['higo', 'tuno', 'higo']),
  objetos(peligros(l09(), plan(['viento', 'piedra', 'viento', 'piedra', 'viento', 'piedra'])), ['malvasia', 'tuno', 'malvasia']),
  objetos(peligros(l10(), plan(['piedra', 'viento', 'piedra'], 3, { fragilSinViento: true })), ['higo', 'higo', 'tuno']),
  objetos(peligros(l11(), plan(['viento', 'piedra', 'viento', 'geiser', 'viento'], 4, { fragilSinViento: true })), ['tuno', 'malvasia', 'higo'])
];
const secretos = [
  { mundo: 0, L: objetos(peligros(s01(), plan(['piedra', 'piedra', 'piedra'], 3)), ['higo', 'tuno', 'malvasia']) },
  { mundo: 1, L: objetos(peligros(s02(), plan(['ola', 'viento', 'ola', 'viento', 'ola'], 1, { fragilSinViento: true })), ['tuno', 'malvasia', 'higo']) }
];

/* ======================= Mundo 3 · El guelfo de Uga (3.0) =======================
   Precuela: Martín es un guelfo, más pequeño y con menos salto (cuerpo.escala y cuerpo.salto), y crece de nivel en nivel.
   Sin cántaro: la barra es de fuerzas. Pasos más bajos y huecos más cortos que en los otros mundos. Van en www/mundo3.js, aparte. */
const guelfo = (L, escala, salto, extra) => Object.assign(L, { cuerpo: { escala, salto } }, extra || {});
function m31() {   // Un guelfo en el corral: tutorial, hasta el camellero
  const n = new N(14, 'corral');
  n.llano(26).pista('guelfo', 0, 40, { hasta_x: 20 });
  n.roca(1.2, 0.5).llano(12).hueco(1.2).llano(12).pista('guelfo_salta', 30, 60, { hasta_saltos: 2 });
  n.sube(0.6).llano(10).baja(0.6).llano(12).control();
  rocas(n, [[1.2, 0.5], [1.2, 0.6]], 10); n.hueco(1.4).llano(12);
  n.sube(0.6).llano(8).sube(0.6).llano(10).baja(0.6).llano(8).baja(0.6).llano(14).control();
  n.hueco(1.6).llano(10).roca(1.2, 0.6).llano(14).hueco(1.6).llano(16);
  n.llano(40);
  n.pista('camellero', n.x - 28, n.x - 6, {});
  return cierra(n, { id: 'uga3_l01_corral', nombre: 'Un guelfo en el corral', resumen: 'Los primeros pasos de Martín: llega hasta el camellero.', estrella3: 120, tema: 'uga' });
}
function m32() {   // Calles de Uga: seguir al camellero hasta la escultura de la entrada del pueblo
  const n = new N(15, 'calles');
  n.llano(30).pista('silbido', 0, 50, { hasta_x: 46 });
  n.roca(1.2, 0.6).llano(14).hueco(1.4).llano(12); n.sube(0.7).llano(14).baja(0.7).llano(16).control();
  rocas(n, [[1.2, 0.5], [1.2, 0.7]], 12); n.hueco(1.6).llano(14); n.sube(0.7).llano(10).sube(0.7).llano(12);
  n.baja(0.7).llano(10).baja(0.7).llano(16).control();
  n.hueco(1.8).llano(12).roca(1.2, 0.6).llano(14).hueco(1.6).llano(10); n.sube(0.8).llano(14).baja(0.8).llano(16);
  rocas(n, [[1.2, 0.6]], 14); n.hueco(1.8).llano(16).control();
  n.sube(0.7).llano(12).hueco(1.6).llano(10).baja(0.7).llano(16);
  n.llano(44);
  n.pista('escultura', n.x - 30, n.x - 6, {});
  const L = cierra(n, { id: 'uga3_l02_calles', nombre: 'Calles de Uga', resumen: 'Sigue al camellero por el pueblo sin perderlo de vista.', estrella3: 170, tema: 'uga' });
  return Object.assign(L, { guia: { ventaja: 7, vel: 2.5, pierde: 17, hasta: L.goals.finish_x + 3 }, escultura: L.goals.finish_x + 2 });
}
function m33() {   // El Vallito: muros de piedra seca entre huertas (saltarlos en dos tiempos)
  const n = new N(16, 'vallito');
  n.llano(28).pista('muros', 10, 60, { hasta_x: 60 });
  const muro = () => { n.roca(1.0, 0.6).llano(1.6).roca(1.2, 1.15).llano(10); };
  muro(); n.llano(6).hueco(1.6).llano(12); muro(); n.llano(4).control();
  n.sube(0.7).llano(12).hueco(1.8).llano(10).baja(0.7).llano(12); muro(); n.llano(8);
  rocas(n, [[1.2, 0.6], [1.2, 0.7]], 10); n.hueco(1.8).llano(14).control();
  muro(); n.sube(0.8).llano(10).hueco(2.0).llano(10).baja(0.8).llano(10); muro(); n.llano(6);
  n.hueco(1.8).llano(8).hueco(2.0).llano(14).control();
  muro(); n.llano(4); muro(); n.sube(0.7).llano(12).baja(0.7).llano(14);
  n.llano(44);
  n.pista('corral', n.x - 28, n.x - 6, {});
  return cierra(n, { id: 'uga3_l03_vallito', nombre: 'El Vallito', resumen: 'Entre muros de piedra y huertas, hasta el corral de la manada.', estrella3: 190, tema: 'uga' });
}
function m34() {   // La fila del amanecer: ir detrás de la manada por el sendero
  const n = new N(17, 'fila');
  n.llano(34).pista('fila', 0, 60, { hasta_x: 56 });
  n.sube(0.6).llano(14).roca(1.2, 0.6).llano(14).hueco(1.6).llano(16).baja(0.6).llano(14).control();
  rocas(n, [[1.2, 0.5], [1.4, 0.7]], 12); n.hueco(1.8).llano(16); n.sube(0.8).llano(14).baja(0.8).llano(16);
  n.hueco(2.0).llano(14).control();
  n.sube(0.7).llano(10).sube(0.7).llano(14).hueco(1.8).llano(12).baja(0.7).llano(10).baja(0.7).llano(16);
  rocas(n, [[1.2, 0.6], [1.2, 0.8]], 12); n.hueco(2.0).llano(16).control();
  n.sube(0.8).llano(14).hueco(1.8).llano(12).baja(0.8).llano(18); n.roca(1.4, 0.7).llano(16);
  n.llano(46);
  n.pista('fila_fin', n.x - 28, n.x - 6, {});
  const L = cierra(n, { id: 'uga3_l04_fila', nombre: 'La fila del amanecer', resumen: 'Ve detrás de la manada sin quedarte atrás.', estrella3: 200, tema: 'uga' });
  return Object.assign(L, { guia: { ventaja: 9, vel: 2.6, pierde: 18, hasta: L.goals.finish_x + 6, manada: 4 } });
}
function m35() {   // Calor de julio: malpaís al sol; la sombra de muros y piedras refresca
  const n = new N(18, 'calor');
  const sombras = [], sombra = (w) => { sombras.push([r2(n.x), r2(n.x + w)]); };
  n.llano(24).pista('calor', 0, 50, { hasta_x: 48 });
  sombra(6); n.llano(10); n.roca(1.2, 0.6).llano(14).hueco(1.6).llano(12);
  sombra(5); n.llano(10).control(); n.sube(0.7).llano(14).baja(0.7).llano(12);
  rocas(n, [[1.2, 0.6], [1.4, 0.7]], 10); sombra(5); n.llano(10); n.hueco(1.8).llano(14);
  n.sube(0.8).llano(10).hueco(1.8).llano(10).baja(0.8).llano(8); sombra(6); n.llano(12).control();
  rocas(n, [[1.2, 0.6]], 12); n.hueco(2.0).llano(14); sombra(5); n.llano(10);
  n.sube(0.7).llano(12).sube(0.7).llano(10).hueco(1.8).llano(10).baja(0.7).llano(8).baja(0.7).llano(10); sombra(6); n.llano(12).control();
  n.roca(1.4, 0.7).llano(14).hueco(2.0).llano(12); sombra(5); n.llano(12);
  n.llano(44);
  n.pista('sombra_fin', n.x - 28, n.x - 6, {});
  const L = cierra(n, { id: 'uga3_l05_calor', nombre: 'Calor de julio', resumen: 'El camino quema: busca la sombra de los muros y no te alejes del sendero.', estrella3: 200, tema: 'uga' });
  for (const s of L.solids) if (s.kind === 'rock') sombras.push([r2(s.x0 - 3), r2(s.x0)]);   // la sombra de cada piedra grande, a su lado
  sombras.sort((a, b) => a[0] - b[0]);
  return Object.assign(L, { calor: { sube: 4.5, baja: 30, sombras } });
}
function m36() {   // La luz que se apaga: el eclipse del 12 de agosto, en el Vallito, a la caída de la tarde
  const n = new N(19, 'eclipse');
  n.llano(30).pista('eclipse', 0, 56, { hasta_x: 52 });
  n.roca(1.2, 0.6).llano(14).hueco(1.8).llano(14).sube(0.7).llano(12).baja(0.7).llano(14).control();
  rocas(n, [[1.2, 0.6], [1.4, 0.8]], 10); n.hueco(2.0).llano(14);
  n.sube(0.8).llano(10).hueco(2.0).llano(10).baja(0.8).llano(14).control();
  n.roca(1.0, 0.6).llano(1.6).roca(1.2, 1.15).llano(12); n.hueco(2.0).llano(12); rocas(n, [[1.2, 0.7]], 12);
  n.sube(0.7).llano(10).sube(0.7).llano(12).hueco(2.0).llano(10).baja(0.7).llano(10).baja(0.7).llano(14).control();
  n.hueco(2.2).llano(12).roca(1.4, 0.8).llano(14).hueco(2.0).llano(16);
  n.llano(44);
  n.pista('camellero_eclipse', n.x - 30, n.x - 6, {});
  return Object.assign(cierra(n, { id: 'uga3_l06_eclipse', nombre: 'La luz que se apaga', resumen: '12 de agosto: el Sol empieza a apagarse. Encuentra al camellero.', estrella3: 200, tema: 'uga' }), { eclipse: true });
}
function m3s() {   // Secreto: El Echadero, tranquilo
  const n = new N(20, 'echadero');
  n.llano(30).pista('echadero', 0, 56, { hasta_x: 52 });
  n.roca(1.2, 0.6).llano(14).hueco(1.6).llano(14).sube(0.7).llano(14).baja(0.7).llano(16).control();
  rocas(n, [[1.2, 0.6], [1.2, 0.7]], 12); n.hueco(1.8).llano(16); n.sube(0.8).llano(12).hueco(1.8).llano(12).baja(0.8).llano(16).control();
  n.roca(1.4, 0.7).llano(14).hueco(2.0).llano(16).sube(0.7).llano(14).baja(0.7).llano(16);
  n.llano(46);
  n.pista('echadero_fin', n.x - 30, n.x - 6, {});
  return Object.assign(cierra(n, { id: 'uga3_s_echadero', nombre: 'El Echadero', resumen: 'Nivel secreto: por fin llegas hasta donde trabaja la manada.', estrella3: 170, tema: 'timanfaya' }), { manadaFin: true });
}
function m3p() {   // Premio: arena negra, sin prisa
  const n = new N(21, 'arena');
  n.llano(32).pista('arena', 0, 60, { hasta_x: 56 });
  n.sube(0.6).llano(16).baja(0.6).llano(18).hueco(1.4).llano(18).control();
  n.sube(0.7).llano(14).baja(0.7).llano(20).hueco(1.6).llano(18).sube(0.6).llano(16).baja(0.6).llano(18).control();
  n.hueco(1.6).llano(20).sube(0.7).llano(16).baja(0.7).llano(20);
  n.llano(46);
  n.pista('arena_fin', n.x - 30, n.x - 6, {});
  return cierra(n, { id: 'uga3_p_arena_negra', nombre: 'Arena negra', resumen: 'Nivel de premio: juega, salta y revuélcate en la arena.', estrella3: 150, tema: 'golfo' });
}
const sinPeligros = L => { L.hazards = []; return L; };
const sinAljibes = L => { L.items = (L.items || []).filter(o => o.kind !== 'aljibe'); return L; };   // el guelfo no lleva agua: en el Mundo 3 no hay aljibes
const B3 = ['biberon', 'biberon', 'biberon'];
const mundo3 = [
  { tipo: 'nivel', L: guelfo(objetos(sinPeligros(m31()), B3), 0.66, 0.88, { camellero: null }) },
  { tipo: 'nivel', L: guelfo(objetos(sinPeligros(m32()), B3), 0.69, 0.89) },
  { tipo: 'nivel', L: guelfo(objetos(sinPeligros(m33()), B3), 0.72, 0.9) },
  { tipo: 'nivel', L: guelfo(objetos(sinPeligros(m34()), B3), 0.75, 0.91) },
  { tipo: 'nivel', L: guelfo(objetos(sinPeligros(m35()), B3), 0.78, 0.92) },
  { tipo: 'nivel', L: guelfo(objetos(sinPeligros(m36()), B3), 0.8, 0.93) },
  { tipo: 'secreto', L: guelfo(objetos(sinPeligros(m3s()), B3), 0.8, 0.93) },
  { tipo: 'premio', L: guelfo(sinPeligros(m3p()), 0.8, 0.93) }
];
for (const x of mundo3) { sinAljibes(x.L); const L = x.L; if (L.camellero === null || L.eclipse) L.camellero = r2(L.goals.finish_x + 1.5); else delete L.camellero; }
const out3 = '/* Mundo 3 de Martín, «El guelfo de Uga» (3.0). GENERADO por tools/niveles.mjs: no editar a mano.\n'
  + '   Va aparte para que la lista del reto diario (servidor) no cambie. © 2026 IT Canarias. */\n'
  + '(function (root) {\nconst S = [\n' + mundo3.map(x => '  { tipo: ' + JSON.stringify(x.tipo) + ', texto: ' + JSON.stringify(JSON.stringify(x.L)) + ' }').join(',\n') + '\n];\n'
  + 'root.MARTIN_MUNDO3 = S;\nif (root.MARTIN_NIVELES) for (const x of S) root.MARTIN_NIVELES.push(x.texto);\nif (typeof module !== "undefined" && module.exports) module.exports = S;\n})(typeof self !== "undefined" ? self : globalThis);\n';
fs.writeFileSync(path.join(aqui, '..', 'www', 'mundo3.js'), out3);
console.log('mundo3.js escrito:', mundo3.map(x => x.L.level_id + ' (' + x.L.world.max_x + ' u)').join(', '));
const outS = '/* Niveles secretos de Martín: se abren con todos los frutos de su mundo. GENERADO por tools/niveles.mjs: no editar a mano.\n'
  + '   Van aparte de niveles.js para que la lista del reto diario (servidor) no cambie. © 2026 IT Canarias. */\n'
  + '(function (root) {\nconst S = [\n' + secretos.map(x => '  { mundo: ' + x.mundo + ', texto: ' + JSON.stringify(JSON.stringify(x.L)) + ' }').join(',\n') + '\n];\n'
  + 'root.MARTIN_SECRETOS = S;\nif (root.MARTIN_NIVELES) for (const x of S) root.MARTIN_NIVELES.push(x.texto);\nif (typeof module !== "undefined" && module.exports) module.exports = S;\n})(typeof self !== "undefined" ? self : globalThis);\n';
fs.writeFileSync(path.join(aqui, '..', 'www', 'secretos.js'), outS);
console.log('secretos.js escrito:', secretos.map(x => x.L.level_id + ' (' + x.L.world.max_x + ' u)').join(', '));
const out = '/* Niveles de Uga (JSON validado por Martin.cargar). GENERADO por tools/niveles.mjs: no editar a mano. © 2026 IT Canarias. */\n'
  + '(function (root) {\nconst N = [\n' + niveles.map(l => '  ' + JSON.stringify(JSON.stringify(l))).join(',\n') + '\n];\n'
  + 'root.MARTIN_NIVELES = N;\nif (typeof module !== "undefined" && module.exports) module.exports = N;\n})(typeof self !== "undefined" ? self : globalThis);\n';
fs.writeFileSync(path.join(aqui, '..', 'www', 'niveles.js'), out);
console.log('niveles.js escrito:', niveles.map(l => l.level_id + ' (' + l.world.max_x + ' u)').join(', '));
