'use strict';
/* Robot que juega un nivel de Martín buscando entre muchas pulsaciones posibles (búsqueda en haz).
   Sirve para comprobar que cada nivel y cada ruta se pueden terminar, y para generar partidas de prueba.
   Uso: const { jugar } = require('./bot.cjs'); jugar(nivel, { ruta:'RUTA-ALTA', limpio:true }) → { ok, runs, estado } */
const M = require('../www/martin.js');

const ACCIONES = [2, 6, 0, 4, 1, 5];

function jugar(L, o) {
  o = o || {};
  const K = o.macro || 5, ANCHO = o.ancho || 110, MAXM = o.maxMacros || 6000;
  const s0 = M.nuevo(L, { mod: o.mod, agua: o.agua }); M.empezar(s0);
  const fondo = Math.min(...L.solids.filter(c => c.kind !== 'wall').map(c => c.kind === 'duna' ? Math.min(c.top0, c.top1) : c.top)) - 0.05;   // por debajo de todo el suelo ya no se salva (agua de las barcas)
  // en el aire sobre el agua de las barcas y sin barca debajo: casi seguro que cae (así no llenan el haz y se conserva a los que esperan en el muelle)
  const rios = (L.obstacles || []).filter(g => g.agua), barcas = L.movs || [];
  const enAgua = s => !s.suelo && rios.some(g => s.x > g.x0 && s.x < g.x1) && !barcas.some(c => { const d = M.movOff(c, s.t); return s.x + 0.5 > c.bx0 + d && s.x - 0.5 < c.bx1 + d; });
  let haz = [{ s: s0, padre: null, m: 0, sc: 0 }];
  for (let paso = 0; paso < MAXM; paso++) {
    const hijos = new Map();
    for (const nodo of haz) {
      for (const a of ACCIONES) {
        const s = M.clonar(nodo.s);
        let ok = true;
        for (let i = 0; i < K; i++) { M.paso(L, s, a); if (s.fase === 'meta' || s.fase === 'fallo') break; }
        if (s.fase === 'fallo') continue;
        if (o.limpio && s.caidas > 0) continue;
        if (o.limpio && (s.sofocos > 0 || s.perdidas > 0)) continue;   // Mundo 3: sin perder al camellero ni sofocarse
        if (o.ruta && s.ruta && s.ruta !== o.ruta) continue;
        if (o.sinDano && s.danos > 0) continue;
        const sc = s.x + 0.05 * s.agua - 40 * s.caidas - 0.05 * (s.calor || 0) + (s.fase === 'meta' ? 1e6 - s.t : 0) + 0.001 * s.y - (s.y < fondo ? 1000 : 0) - (rios.length && enAgua(s) ? 6 : 0);
        if (s.fase === 'meta') {
          // reconstruye las pulsaciones
          const seq = []; seq.push([a, K]); for (let n = nodo; n && n.padre; n = n.padre) seq.push([n.m, K]);
          seq.reverse();
          const g = M.grabadora(); for (const [m, c] of seq) for (let i = 0; i < c; i++) g.anota(m);
          const runs = g.runs();
          // vuelve a jugar exactamente lo grabado: el estado final debe coincidir
          const fin = M.repetir(L, runs, { mod: o.mod, agua: o.agua });
          return { ok: !!fin && fin.fase === 'meta', runs, estado: fin, pasos: paso + 1 };
        }
        const key = Math.round((s.lava || 0) * 2) + ',' + Object.keys(s.der).length + ',' + Math.round(s.x * 5) + ',' + Math.round(s.y * 5) + ',' + Math.round(s.vx) + ',' + Math.round(s.vy / 3) + ',' + (s.suelo ? 1 : 0) + ',' + s.fase + ',' + (s.agua >> 3);
        const p = hijos.get(key);
        if (!p || p.sc < sc) hijos.set(key, { s, padre: nodo, m: a, sc });
      }
    }
    if (!hijos.size) return { ok: false, razon: 'sin salida', pasos: paso };
    haz = [...hijos.values()].sort((a, b) => b.sc - a.sc).slice(0, ANCHO);
  }
  return { ok: false, razon: 'tiempo agotado' };
}
module.exports = { jugar };
