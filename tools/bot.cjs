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
        if (o.ruta && s.ruta && s.ruta !== o.ruta) continue;
        if (o.sinDano && s.danos > 0) continue;
        const sc = s.x + 0.05 * s.agua - 40 * s.caidas + (s.fase === 'meta' ? 1e6 - s.t : 0) + 0.001 * s.y;
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
        const key = Object.keys(s.der).length + ',' + Math.round(s.x * 5) + ',' + Math.round(s.y * 5) + ',' + Math.round(s.vx) + ',' + Math.round(s.vy / 3) + ',' + (s.suelo ? 1 : 0) + ',' + s.fase + ',' + (s.agua >> 3);
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
