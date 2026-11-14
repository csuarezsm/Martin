'use strict';
/* Partidas «tranquilas» del robot para el vídeo de Google Play: salta solo cuando hace falta.
   Uso: node tools/partidas-video.cjs → play-store/partidas-video.json */
const fs = require('fs'), path = require('path');
const M = require('../www/martin.js'), T = require('../www/niveles.js'); require('../www/secretos.js'); require('../www/mundo3.js'); require('../www/extras.js');
const { jugar } = require('./bot.cjs');
const QUIERO = ['uga_l01_water_delivery', 'uga_l03_dry_ravine', 'norte_e02_barcas_orzola', 'sur_e03_rios_de_fuego', 'norte_e01_jable_famara', 'uga3_l02_calles'];
const out = {};
for (const t of T) {
  const L = M.cargar(t).nivel; if (!QUIERO.includes(L.level_id)) continue;
  let r = null;
  for (const calma of [4, 2.5, 1.5, 0.8]) { r = jugar(L, { limpio: true, calma, ruta: (L.routes || []).length ? 'RUTA-BAJA' : undefined }); if (r.ok) { r.calma = calma; break; } }
  if (!r.ok) throw new Error('No termina ' + L.level_id);
  out[L.level_id] = { runs: r.runs, calma: r.calma };
  console.log(L.level_id, 'calma', r.calma, 'saltos', r.estado.saltos, 'tiempo', (r.estado.t / 60).toFixed(1) + ' s');
}
fs.writeFileSync(path.join(__dirname, '..', 'play-store', 'partidas-video.json'), JSON.stringify(out));
