'use strict';
/* Comprueba los niveles de Uga: validación y que un robot los termina (por cada ruta). Uso: node tools/comprobar-niveles.cjs [num] */
const M = require('../www/martin.js');
const textos = require('../www/niveles.js'); require('../www/secretos.js'); require('../www/mundo3.js'); require('../www/extras.js');   // los secretos se añaden a la misma lista
const { jugar } = require('./bot.cjs');
const sel = process.argv[2] ? [+process.argv[2] - 1] : textos.map((_, i) => i);
for (const i of sel) {
  const r = M.cargar(textos[i]);
  if (!r.ok) { console.log('Nivel', i + 1, 'NO VÁLIDO:', r.error); continue; }
  const L = r.nivel, t0 = Date.now();
  const rutas = (L.routes || []).map(x => x.id);
  const casos = rutas.length ? rutas.map(x => ({ ruta: x })) : [{}];
  for (const c of casos) {
    const out = jugar(L, Object.assign({ limpio: true }, c));
    console.log('L0' + (i + 1), L.level_id, c.ruta || '(única)', out.ok ? 'OK ' + (out.estado.t / 60).toFixed(1) + ' s, agua ' + out.estado.agua + ', estrellas ' + out.estado.estrellas + ', ruta ' + (out.estado.ruta || '-') + ', ' + (Date.now() - t0) + ' ms' : 'FALLA: ' + out.razon);
  }
}
