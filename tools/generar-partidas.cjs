'use strict';
/* Graba con el robot una partida completa de cada nivel (y de cada ruta) para las pruebas de la app: tests/partidas.json
   Uso: node tools/generar-partidas.cjs   (tarda unos minutos; solo hace falta si cambian los niveles o el motor) */
const fs = require('fs'), path = require('path');
const M = require('../www/martin.js'), T = require('../www/niveles.js'), _s = require('../www/secretos.js'), _m3 = require('../www/mundo3.js'), _ex = require('../www/extras.js'), { jugar } = require('./bot.cjs');
const soloM3 = process.argv[2] === 'mundo3', soloEx = process.argv[2] === 'extras', out = soloM3 || soloEx ? JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'tests', 'partidas.json'), 'utf8')) : {};   // «mundo3»: solo graba los niveles del Mundo 3
T.forEach((t, i) => {
  const L = M.cargar(t).nivel; if (soloM3 && !L.cuerpo) return; if (soloEx && !_ex.some(x => x.texto === t)) return;   // «extras»: solo los niveles nuevos (3.1)
  const rutas = (L.routes || []).map(r => r.id);
  for (const ruta of (rutas.length ? rutas : [''])) {
    const r = jugar(L, { limpio: true, ruta: ruta || undefined });
    if (!r.ok) throw new Error('El robot no termina ' + L.level_id + ' ' + ruta);
    out[L.level_id + (ruta ? '|' + ruta : '')] = { runs: r.runs, ms: r.estado.t * 1000 / 60, agua: r.estado.agua, estrellas: r.estado.estrellas, ruta: r.estado.ruta || '' };
    console.log(L.level_id, ruta, r.estado.t, r.estado.agua, r.estado.estrellas);
  }
});
fs.writeFileSync(path.join(__dirname, '..', 'tests', 'partidas.json'), JSON.stringify(out));
