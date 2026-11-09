/* Martín: Los Caminos del Volcán — pantallas, dibujo, controles y reto diario (IT Canarias)
   © 2026 IT Canarias. Todos los derechos reservados.
   Las reglas viven en martin.js (el mismo archivo que usa el servidor). Aquí solo se dibuja y se escuchan los dedos.
   Los dibujos y sonidos son propios (se pintan con código); personajes, lugares y rutas son ficción. */
'use strict';
const M = window.Martin;
// Servidor de juegos (repo csuarezsm/juegos-servidor): el reto diario. Vacío = el reto diario solo se puede practicar.
const ONLINE_URL = 'MARTIN_ONLINE_URL' in window ? window.MARTIN_ONLINE_URL : 'wss://juegos.itcanarias.com/ws';
const HTTP_BASE = ONLINE_URL ? ONLINE_URL.replace(/^ws/, 'http').replace(/\/ws$/, '') : '';
const NIV = (window.MARTIN_NIVELES || []).map(t => M.cargar(t));
const MODS_TXT = { normal: ['Agua normal', 'Todo como siempre.'], fragil: ['Cántaro frágil', 'Los golpes y las caídas derraman un 50 % más.'], poca: ['Poca agua', 'Sales con solo 70 de agua.'] };
const CAUSAS = { agua: 'Se ha derramado toda el agua.', caida: 'Martín ha caído demasiadas veces.', tiempo: 'Se ha acabado el tiempo.', lava: '¡La lava ha alcanzado a Martín!' };
const TR = x => (window.Idioma && Idioma.tr ? Idioma.tr(x) : x);
const FRUTOS = { tuno: 'Tuno', higo: 'Higo', malvasia: 'Uva malvasía' };
const PISTAS = {
  mover: 'Mantén ◀ ▶ para caminar. Si sueltas, Martín se detiene.',
  saltar: 'Toca ⬆ (o la barra espaciadora) para saltar el hueco.',
  mantener: 'Si mantienes el salto, Martín llega un poco más alto.',
  caidas: 'Cuidado: caer desde muy alto derrama agua. Baja escalón a escalón.',
  rocas: 'Una roca golpeada con prisa derrama agua: frena o sáltala.',
  rocas2: 'Las rocas se saltan, o se rozan despacio.',
  dos_caminos: 'Dos caminos: por arriba, más directo pero con huecos; por abajo, firme y seguro.',
  bifurca: 'Dos caminos: sube por las repisas (directo, con huecos) o sigue por el suelo (seguro).',
  hueco_final: 'Mira bien el hueco y salta justo en el borde.',
  barranco: 'Las grietas se saltan desde el mismo borde. Sin prisa.',
  bajada: 'Bajar de un salto desde muy alto derrama agua: baja escalón a escalón.',
  olas: 'El mar burbujea antes de que reviente la ola: espera a que pase.',
  sal: 'La sal resbala: Martín tarda en arrancar y patina al frenar.',
  viento: 'Cuando la manga se levanta, el viento sopla en contra: espera para saltar.',
  palmeras: 'Dos caminos: por las copas de las palmeras (rápido) o por las huertas (seguro).',
  subida: 'Una gran subida: salta de escalón en escalón y no te pares en el suelo agrietado.',
  entrega: '¡Ya casi! Llega al punto de entrega con agua en el cántaro.'
};

/* ================= Sonidos (sintetizados: sin archivos de audio) ================= */
const Sound = (() => {
  let ctx = null;
  const ac = () => {
    if (!ctx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; try { ctx = new C(); } catch (e) { return null; } }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  };
  const out = c => (window.AudioSuave ? AudioSuave.salida(c) : c.destination);
  function tone(c, t, f0, f1, dur, vol, type) {
    const o = c.createOscillator(), g = c.createGain();
    o.type = type || 'triangle'; o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(out(c)); o.start(t); o.stop(t + dur + 0.02);
  }
  function ruido(c, t, dur, vol) {
    const len = Math.floor(c.sampleRate * dur), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
    const s = c.createBufferSource(), g = c.createGain(); g.gain.value = vol; s.buffer = buf; s.connect(g); g.connect(out(c)); s.start(t);
  }
  function play(kind) {
    if (S.sound === false) return;
    const c = ac(); if (!c) return;
    const t = c.currentTime + 0.005;
    try {
      if (kind === 'salto') tone(c, t, 320, 620, 0.12, 0.06);
      else if (kind === 'aterriza') ruido(c, t, 0.05, 0.04);
      else if (kind === 'golpe') { ruido(c, t, 0.14, 0.12); tone(c, t, 180, 70, 0.14, 0.07); }
      else if (kind === 'control') [660, 880].forEach((f, i) => tone(c, t + i * 0.1, f, f, 0.14, 0.05));
      else if (kind === 'caida') tone(c, t, 520, 90, 0.4, 0.05, 'sawtooth');
      else if (kind === 'fallo') [330, 262, 196].forEach((f, i) => tone(c, t + i * 0.16, f, f, 0.22, 0.06));
      else if (kind === 'exito') [523, 659, 784, 1046].forEach((f, i) => tone(c, t + i * 0.11, f, f, 0.26, 0.06));
      else if (kind === 'aviso') tone(c, t, 880, 880, 0.08, 0.04, 'square');
      else if (kind === 'clic') tone(c, t, 500, 500, 0.05, 0.03);
      else if (kind === 'vapor') { ruido(c, t, 0.5, 0.09); tone(c, t, 140, 60, 0.4, 0.05, 'sawtooth'); }
      else if (kind === 'ola') { ruido(c, t, 0.7, 0.11); }
      else if (kind === 'piedra') { ruido(c, t, 0.12, 0.14); tone(c, t, 120, 50, 0.2, 0.08); }
      else if (kind === 'cruje') { for (let i = 0; i < 3; i++) ruido(c, t + i * 0.07, 0.04, 0.06); }
      else if (kind === 'derrumbe') { ruido(c, t, 0.35, 0.1); tone(c, t, 90, 40, 0.3, 0.06); }
      else if (kind === 'fruto') [784, 988, 1318].forEach((f, i) => tone(c, t + i * 0.06, f, f, 0.12, 0.05, 'sine'));
      else if (kind === 'aljibe') { [523, 784].forEach((f, i) => tone(c, t + i * 0.08, f, f * 1.02, 0.16, 0.05, 'sine')); ruido(c, t, 0.18, 0.03); }
      else if (kind === 'lava') { tone(c, t, 70, 45, 1.1, 0.09, 'sawtooth'); ruido(c, t, 0.9, 0.07); [440, 440].forEach((f, i) => tone(c, t + 0.3 + i * 0.25, f, f, 0.12, 0.04, 'square')); }
    } catch (e) {}
  }
  return { play };
})();

/* ================= Frutos y fantasma ================= */
const frutosDe = L => (L.objetos || []).filter(o => o.kind !== 'aljibe');
const frutosHechos = i => { const n = NIV[i]; if (!n || !n.ok) return 0; const ids = new Set(progR(i).obj || []); return frutosDe(n.nivel).filter(o => ids.has(o.id)).length; };
const firmaNivel = L => L._firma || (L._firma = M.fnv(JSON.stringify([L.solids.map(q => [q.id, q.x0, q.x1, q.top, q.kind, !!q.fragil]), L.objetos, L.peligros, L.lava, L.goals, L.spawn])));
function iconoFruto(k, ok, px) {
  const c = document.createElement('canvas'), d = Math.min(window.devicePixelRatio || 1, 2); c.width = c.height = Math.round(px * d); c.style.width = c.style.height = px + 'px';
  const g = c.getContext('2d'); if (!ok) g.globalAlpha = 0.6; fruto(g, k, px * d / 2, px * d * 0.58, px * d * 0.36);
  if (!ok) { g.globalAlpha = 1; g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(150,150,160,.9)'; g.fillRect(0, 0, c.width, c.height); }
  return c;
}
function pintaFrutos(cont, L, tom, px) {
  if (!cont) return; cont.textContent = '';
  for (const o of frutosDe(L)) { const ic = iconoFruto(o.kind, !!tom[o.id], px); ic.setAttribute('aria-hidden', 'true'); cont.appendChild(ic); }
}
/* ================= Progreso ================= */
function DEFAULTS() { S.prog = S.prog || {}; S.mano = S.mano || 'normal'; S.best = S.best || {}; }

const lid = i => (NIV[i] && NIV[i].ok ? NIV[i].nivel.level_id : 'nivel-' + i);
const PROG0 = () => ({ done: false, stars: 0, bestMs: 0, bestAgua: 0, plays: 0, fails: 0 });
const prog = i => (S.prog[lid(i)] = S.prog[lid(i)] || PROG0());          // para escribir (crea la entrada)
const progR = i => S.prog[lid(i)] || PROG0();                              // para leer (no crea nada)
const desbloqueado = i => i === 0 || (!!S.prog[lid(i - 1)] && !!S.prog[lid(i - 1)].done);
const MUNDOS = [{ desde: 0, nombre: 'Mundo 1 · Uga y el sur', lema: 'Aprender el camino y llevar el agua' }, { desde: 6, nombre: 'Mundo 2 · La costa y el norte', lema: 'El Golfo, Janubio, Famara, Haría y el Mirador del Río' }];
const totalEstrellas = () => NIV.reduce((a, n, i) => a + (n.ok ? progR(i).stars : 0), 0);
const fmtT = ms => { const t = Math.max(0, Math.round(ms / 100)); const m = Math.floor(t / 600), s = Math.floor((t % 600) / 10); return m + ':' + String(s).padStart(2, '0') + '.' + (t % 10); };
const estrellasTxt = (n, tot) => '★'.repeat(n) + '☆'.repeat((tot || 3) - n);

/* ================= Dibujo (www/dibujo.js) ================= */
const { COL, hash, dibujaLavaVista, fruto, preparaEscena, dibujaMartin, dibujaEscena, dibujaSombra, dibujaFx, dibujaPost, dibujaPrimerPlano, dibujaHero, dibujaMini } = window.Dibujo;

/* ================= Partida en marcha ================= */
const RUN = { on: false, raf: 0, last: 0, acc: 0, cv: null, ctx: null, L: null, esc: null, s: null, idx: 0, modo: 'nivel', opts: {}, inp: { pila: [], salto: false }, rec: null, cam: { x: 0, y: 0 },
  fx: [], overlay: '', replay: null, rep: { i: 0, c: 0 }, t: 0, fase: 0, golpe: 0, vistas: {}, tFin: 0, reapT: 0, nuevo: null, enviado: null, u: 16, hint: '' };
const STEP_MS = 1000 / 60;
const turbo = () => (typeof window.MARTIN_TURBO === 'number' ? window.MARTIN_TURBO : 1);
const jugando = () => !!RUN.s;
const debugCaja = /hitbox/.test(location.search);
function modalAbierto() { const m = document.getElementById('modal'); return !!(m && !m.classList.contains('hidden')); }
function stopLoop(conTeclas) { RUN.on = false; cancelAnimationFrame(RUN.raf); RUN.raf = 0; if (!conTeclas) window.onkeydown = window.onkeyup = window.onblur = null; RUN.inp.pila = []; RUN.inp.salto = false; }

function maskInput() {
  const p = RUN.inp.pila, d = p.length ? p[p.length - 1] : 0;
  return (d < 0 ? 1 : d > 0 ? 2 : 0) | (RUN.inp.salto ? 4 : 0);
}
function replayNext() {
  const r = RUN.replay, p = RUN.rep;
  if (!r || p.i >= r.length) return 0;
  const m = r[p.i]; if (++p.c >= r[p.i + 1]) { p.i += 2; p.c = 0; }
  return m;
}
function paso1() {
  const s = RUN.s, L = RUN.L;
  const m = RUN.replay ? replayNext() : maskInput();
  if (s.fase === 'jugando' || s.fase === 'reaparece') RUN.rec.anota(m);
  M.paso(L, s, m);
  const F = RUN.fan;
  if (F && (F.s.fase === 'jugando' || F.s.fase === 'reaparece')) {
    let fm = 0; if (F.rep.i < F.runs.length) { fm = F.runs[F.rep.i]; if (++F.rep.c >= F.runs[F.rep.i + 1]) { F.rep.i += 2; F.rep.c = 0; } }
    M.paso(L, F.s, fm); F.s.ev.length = 0; F.fase = (F.fase || 0) + Math.abs(F.s.vx) * M.DT * 3.2;
  }
  for (const e of s.ev) evento(e);
  s.ev.length = 0;
  if (s.fase === 'reaparece') RUN.reapT = s.rt;
  if (RUN.golpe > 0) RUN.golpe = Math.max(0, RUN.golpe - 1 / 21);
  RUN.fase += Math.abs(s.vx) * M.DT * 3.2;
  if (s.suelo && Math.abs(s.vx) > 1.5 && (RUN.paso = (RUN.paso || 0) + 1) % 11 === 0) RUN.fx.push({ k: 'polvo', x: s.x - s.cara * 0.5, y: s.y, v: 0, n: 16, fuerte: false });
  RUN.t += M.DT;
  RUN.fx = RUN.fx.filter(f => (f.v += 1) < f.n);
  if ((s.fase === 'meta' || s.fase === 'fallo') && !RUN.tFin) RUN.tFin = performance.now();
}
function evento(e) {
  const s = RUN.s;
  if (e.t === 'salto') Sound.play('salto');
  else if (e.t === 'aterriza') { Sound.play('aterriza'); RUN.fx.push({ k: 'polvo', x: s.x, y: s.y, v: 0, n: 18 }); if (e.v > 8) { RUN.shake = Math.max(RUN.shake || 0, 0.35); RUN.fx.push({ k: 'polvo', x: s.x + 0.6, y: s.y, v: 0, n: 22 }); } }
  else if (e.t === 'cruje') Sound.play('cruje');
  else if (e.t === 'derrumbe') { Sound.play('derrumbe'); RUN.shake = Math.max(RUN.shake || 0, 0.5); const c = RUN.L.solids.find(q => q.id === e.id); if (c) for (let i = 0; i < 8; i++) RUN.fx.push({ k: 'gota', piedra: true, x: c.x0 + (c.x1 - c.x0) * (i + 0.5) / 8, y: c.top, v: 0, n: 50, vx: (hash(i) - 0.5) * 2, vy: 1 + hash(i + 3) * 2 }); }
  else if (e.t === 'dano') {
    Sound.play(e.tipo === 'vapor' ? 'vapor' : e.tipo === 'ola' ? 'ola' : e.tipo === 'piedra' ? 'piedra' : 'golpe'); vibrate(40); RUN.golpe = 1; RUN.shake = Math.max(RUN.shake || 0, e.cantidad >= 20 ? 1 : 0.6); RUN.fx.push({ k: 'texto', x: s.x, y: s.y + 2.2, v: 0, n: 60, txt: '−' + e.cantidad }); for (let i = 0; i < 6; i++) RUN.fx.push({ k: 'gota', x: s.x, y: s.y + 1.7, v: 0, n: 40, vx: (i - 2.5) * 0.9, vy: 3 + (i % 3) });
    if (e.resto > 0 && e.resto < 30 && !RUN.avisado) { RUN.avisado = true; Sound.play('aviso'); }
  } else if (e.t === 'caida') { Sound.play('caida'); vibrate(60); RUN.fx.push({ k: 'texto', x: s.x, y: RUN.L.world.kill_y + 3, v: 0, n: 70, txt: '−' + e.cantidad }); }
  else if (e.t === 'control') { Sound.play('control'); const c = RUN.L.cps.find(q => q.id === e.id); if (c) c.alcanzado = true; RUN.fx.push({ k: 'texto', x: s.x, y: s.y + 2.4, v: 0, n: 70, txt: TR('⚑ Punto de control') }); }
  else if (e.t === 'meta') { Sound.play('exito'); for (let i = 0; i < 46; i++) RUN.fx.push({ k: 'confeti', x: s.x, y: s.y + 1.5, v: 0, n: 100, vx: (hash(i * 3) - 0.5) * 9, vy: 4 + hash(i * 5) * 7, rot: 4 + hash(i * 7) * 10, c: ['#f6d65a', '#d8454a', '#2f93d4', '#f4efe6', '#7ac36a'][i % 5] }); }
  else if (e.t === 'fallo') Sound.play('fallo');
  else if (e.t === 'ruta') RUN.rutaVista = e.id;
  else if (e.t === 'recoge') {
    if (e.kind === 'aljibe') { Sound.play('aljibe'); RUN.avisado = s.agua < 30 && RUN.avisado; RUN.fx.push({ k: 'texto', x: s.x, y: s.y + 2.4, v: 0, n: 70, txt: e.mas > 0 ? '💧 +' + e.mas : TR('💧 lleno') }); }
    else { Sound.play('fruto'); vibrate(15); RUN.fx.push({ k: 'texto', x: s.x, y: s.y + 2.6, v: 0, n: 80, txt: '✨ ' + TR(FRUTOS[e.kind]) }); for (let i = 0; i < 14; i++) RUN.fx.push({ k: 'confeti', x: s.x, y: s.y + 2.2, v: 0, n: 50, vx: (hash(i * 3 + 1) - 0.5) * 6, vy: 2 + hash(i * 5 + 2) * 4, rot: 6, c: ['#f6d65a', '#fff3b0', '#ffb347'][i % 3] }); }
  } else if (e.t === 'lava') { Sound.play('lava'); vibrate(80); RUN.shake = Math.max(RUN.shake || 0, 1.2); RUN.lavaAviso = performance.now(); }
}
function startLoop() {
  stopLoop(true); RUN.on = true; RUN.last = performance.now(); RUN.acc = 0;
  const bucle = ts => {
    if (!RUN.on) return;
    const dt = Math.min(100, ts - RUN.last); RUN.last = ts;
    const s = RUN.s;
    if (s) {
      const parar = document.hidden || modalAbierto();
      if (parar && s.fase === 'jugando') { pausar(); }
      if (s.fase === 'jugando' || s.fase === 'reaparece') {
        RUN.acc += dt; let n = 0;
        while (RUN.acc >= STEP_MS && n < 8) { RUN.acc -= STEP_MS; n++; paso1(); if (s.fase !== 'jugando' && s.fase !== 'reaparece') break; }
        if (RUN.acc > STEP_MS * 8) RUN.acc = 0;                      // máximo de pasos recuperados por imagen: sin «espiral de la muerte»
        for (let k = 1; k < turbo() && (s.fase === 'jugando' || s.fase === 'reaparece'); k++) paso1();
      } else if (s.fase === 'meta' || s.fase === 'fallo') { RUN.t += dt / 1000; RUN.fx = RUN.fx.filter(f => (f.v += 1) < f.n); }
      else RUN.t += dt / 1000;
      dibujar(dt); hud();
      RUN.ema = RUN.ema == null ? dt : RUN.ema * 0.95 + dt * 0.05; RUN.nf = (RUN.nf || 0) + 1;
      if (RUN.nf > 90 && RUN.ema > 22) { if (!window.SIN_OLAS) window.SIN_OLAS = true; else if (RUN.dprMax > 1.25) RUN.dprMax -= 0.25; RUN.nf = 0; RUN.ema = 16; }   // si va lento: primero fuera el oleaje, luego menos resolución
      if ((s.fase === 'meta' || s.fase === 'fallo') && RUN.tFin && !RUN.overlay && performance.now() - RUN.tFin > (s.fase === 'meta' ? 900 : 700) / Math.max(1, turbo() > 1 ? 4 : 1)) terminar();
    }
    if (RUN.on) RUN.raf = requestAnimationFrame(bucle);
  };
  RUN.raf = requestAnimationFrame(bucle);
}
function ajustaCanvas() {
  const cv = RUN.cv; if (!cv) return;
  // el tamaño del lienzo se consulta cada medio segundo (no en cada imagen) y la resolución baja sola si el móvil no llega a 45 imágenes/s
  const ahora = performance.now();
  if (!RUN.rect || ahora - RUN.rectT > 500) { RUN.rect = cv.parentNode.getBoundingClientRect(); RUN.rectT = ahora; }
  if (RUN.dprMax == null) RUN.dprMax = 2;
  const r = RUN.rect, dpr = Math.min(window.devicePixelRatio || 1, RUN.dprMax);
  const w = Math.max(160, Math.round(r.width * dpr)), h = Math.max(120, Math.round(r.height * dpr));
  if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
  const asp = w / h, vw = asp >= 1.4 ? 15 : Math.max(asp < 1 ? 9 : 10, 15 - (1.4 - asp) * 12);   // cámara cercana: Martín se ve grande; en vertical, aún más
  RUN.u = Math.min(w / vw, h / 7.4);
}
function dibujar(dt) {
  const cv = RUN.cv, ctx = RUN.ctx, s = RUN.s, L = RUN.L; if (!cv || !ctx) return;
  ajustaCanvas();
  const W = cv.width, H = cv.height, u = RUN.u, vw = W / u, vh = H / u;
  // cámara: Martín al ~35 % del ancho con un poco de anticipación; vertical suavizado con zona muerta
  const k = 1 - Math.exp(-(dt || 16) / 1000 * 5);
  const huye = s.lava != null && L.lava && s.x < L.lava.hasta;   // con la lava detrás, la cámara deja ver el frente que persigue
  let objX = s.x - vw * (huye ? (W < H ? 0.6 : 0.5) : W < H ? 0.24 : 0.33) + Math.max(-1, Math.min(1, s.vx / 4)) * 1.4;
  objX = Math.max(L.world.min_x - 0.5, Math.min(L.world.max_x - vw + 0.5, objX));
  const piso = s.fase === 'reaparece' ? s.ry : s.y;
  const idealY = piso - vh * (W < H ? 0.27 : 0.30);
  if (RUN.camInit !== RUN.idx + ':' + RUN.modo + ':' + RUN.intento) { RUN.camInit = RUN.idx + ':' + RUN.modo + ':' + RUN.intento; RUN.cam.x = objX; RUN.cam.y = idealY; }
  RUN.cam.x += (objX - RUN.cam.x) * Math.min(1, k * 2.4);
  const dz = vh * 0.12; if (idealY - RUN.cam.y > dz) RUN.cam.y += (idealY - dz - RUN.cam.y) * k; else if (RUN.cam.y - idealY > dz) RUN.cam.y += (idealY + dz - RUN.cam.y) * k;
  for (const d of RUN.esc.deco) if (d.t === 'lagarto') d.px = s.x;
  RUN.esc.s = s;
  let shx = 0, shy = 0; if (RUN.shake > 0) { const a = RUN.shake * 0.12; shx = (Math.random() - 0.5) * a; shy = (Math.random() - 0.5) * a; RUN.shake = Math.max(0, RUN.shake - (dt || 16) / 260); RUN.cam.x += shx; RUN.cam.y += shy; }
  dibujaEscena(ctx, W, H, u, RUN.cam, L, RUN.esc, RUN.t, RUN.fx);
  const px = (s.x - RUN.cam.x) * u, py = H - (s.y - RUN.cam.y) * u;
  const F = RUN.fan;
  if (F && F.s.fase !== 'lista' && (F.s.fase !== 'reaparece' || F.s.rt < 24) && F.s.fase !== 'fallo') {
    const fs = F.s, fx = (fs.x - RUN.cam.x) * u, fy = H - (fs.y - RUN.cam.y) * u;
    if (fx > -u * 3 && fx < W + u * 3) { let fa = 'idle'; if (!fs.suelo) fa = fs.vy > 0 ? 'salta' : 'cae'; else if (Math.abs(fs.vx) > 0.3) fa = 'corre';
      dibujaMartin(ctx, u, fx, fy, { dir: fs.cara, fase: F.fase, anim: fa, agua: fs.agua, golpe: 0, t: RUN.t, alpha: 0.42 }); }
  }
  // personaje
  if (s.fase !== 'reaparece' || s.rt < 24) {
    dibujaSombra(ctx, L, s, u, RUN.cam, H);
    let anim = 'idle';
    if (s.fase === 'meta') anim = 'gana'; else if (!s.suelo) anim = s.vy > 0 ? 'salta' : 'cae'; else if (Math.abs(s.vx) > 0.3) anim = 'corre';
    const parpadeo = s.fase === 'reaparece' ? 0.4 + 0.6 * ((24 - s.rt) / 24) : (s.frio > 0 && s.fase === 'jugando' && Math.floor(s.frio / 3) % 2 === 0 ? 0.55 : 1);
    dibujaMartin(ctx, u, px, py, { dir: s.cara, fase: RUN.fase, anim, agua: s.agua, golpe: RUN.golpe, t: RUN.t, alpha: parpadeo });
  }
  if (debugCaja) { ctx.strokeStyle = '#ff0'; ctx.lineWidth = 2; ctx.strokeRect(px - M.HW * u, py - M.H * u, M.W * u, M.H * u); ctx.fillStyle = '#f00'; ctx.fillRect(px - 2, py - 2, 4, 4); }
  dibujaLavaVista(ctx, W, H, u, RUN.cam, L, s, RUN.t);
  dibujaPrimerPlano(ctx, W, H, u, RUN.cam, RUN.t);
  dibujaFx(ctx, W, H, u, RUN.cam, RUN.fx, RUN.t);
  dibujaPost(ctx, W, H, RUN.esc, s.agua);
  RUN.cam.x -= shx; RUN.cam.y -= shy;
  // sin avisos de color solo: contorno en la vista de poca agua
  if (s.agua > 0 && s.agua < 30) { ctx.strokeStyle = 'rgba(255,210,74,.75)'; ctx.lineWidth = 6; ctx.setLineDash([18, 12]); ctx.strokeRect(3, 3, W - 6, H - 6); ctx.setLineDash([]); }
}
/* Pistas del tramo (arriba y centradas: no tapan el obstáculo ni los botones) */
function pistaActual() {
  const s = RUN.s, L = RUN.L;
  for (const h of L.hints || []) {
    if (s.x < h.x0 || s.x > h.x1) continue;
    if (h.hasta_x != null && s.x > h.hasta_x) continue;
    if (h.hasta_saltos != null && s.saltos >= h.hasta_saltos) continue;
    return PISTAS[h.id] || '';
  }
  return '';
}
function hud() {
  const s = RUN.s; if (!s) return;
  const set = (id, v) => { const el = document.getElementById(id); if (el && el.textContent !== String(v)) el.textContent = v; };
  set('mgAgua', s.agua); set('mgTiempo', fmtT(s.t * 1000 / 60));
  const b = document.getElementById('mgBar'); if (b) { b.style.width = s.agua + '%'; b.parentNode.classList.toggle('bajo', s.agua < 30); }
  set('mgBajo', s.agua < 30 ? '⚠' : '');
  const fv = Object.keys(s.obj || {}).join(','); if (fv !== RUN.fruVista) { RUN.fruVista = fv; pintaFrutos(document.getElementById('mgFru'), RUN.L, s.obj || {}, 24); }
  const lv = document.getElementById('mgLava'); if (lv) { const on = s.lava != null && s.x < RUN.L.lava.hasta && s.fase === 'jugando'; lv.classList.toggle('on', on); if (on) set('mgLavaD', Math.max(0, Math.round(s.x - s.lava)) + ' m'); }
  const h = pistaActual(); if (h !== RUN.hint) { RUN.hint = h; const el = document.getElementById('mgHint'); if (el) { el.textContent = h; el.classList.toggle('on', !!h); } }
}

/* ================= Controles ================= */
function enlazarControles() {
  const inp = RUN.inp; inp.pila = []; inp.salto = false;
  const dir = (d, v) => { inp.pila = inp.pila.filter(x => x !== d); if (v) inp.pila.push(d); };
  const hold = (id, fn) => {
    const b = document.getElementById(id); if (!b) return;
    const ids = new Set();
    b.onpointerdown = e => { ids.add(e.pointerId); try { b.setPointerCapture(e.pointerId); } catch (x) {} fn(true); b.classList.add('on'); e.preventDefault(); };
    const off = e => { ids.delete(e.pointerId); if (!ids.size) { fn(false); b.classList.remove('on'); } };
    b.onpointerup = b.onpointercancel = b.onlostpointercapture = off;
    b.oncontextmenu = e => e.preventDefault();
  };
  hold('mgL', v => dir(-1, v)); hold('mgR', v => dir(1, v)); hold('mgJ', v => { inp.salto = v; });
  window.onkeydown = ev => {
    if (!RUN.on || modalAbierto() || /INPUT|TEXTAREA/.test((ev.target || {}).tagName || '')) return;
    const k = ev.key;
    if (k === 'ArrowLeft' || k === 'a' || k === 'A') { if (!ev.repeat) dir(-1, true); ev.preventDefault(); }
    else if (k === 'ArrowRight' || k === 'd' || k === 'D') { if (!ev.repeat) dir(1, true); ev.preventDefault(); }
    else if (k === ' ' || k === 'ArrowUp' || k === 'w' || k === 'W') { inp.salto = true; ev.preventDefault(); if (RUN.overlay === 'listo') empezar(); }
    else if (k === 'Escape' || k === 'p' || k === 'P') { if (RUN.s && RUN.s.fase === 'jugando') pausar(); else if (RUN.overlay === 'pausa') reanudar(); }
    else if (k === 'Enter') { if (RUN.overlay === 'listo') empezar(); else if (RUN.overlay === 'fallo') reintentar(); }
  };
  window.onkeyup = ev => {
    const k = ev.key;
    if (k === 'ArrowLeft' || k === 'a' || k === 'A') dir(-1, false);
    else if (k === 'ArrowRight' || k === 'd' || k === 'D') dir(1, false);
    else if (k === ' ' || k === 'ArrowUp' || k === 'w' || k === 'W') inp.salto = false;
  };
  // sin foco de la ventana: pausa segura y ninguna pulsación se queda retenida (T22)
  window.onblur = () => { inp.pila = []; inp.salto = false; if (RUN.s && RUN.s.fase === 'jugando') pausar(); };
}
function soltarTodo() { RUN.inp.pila = []; RUN.inp.salto = false; document.querySelectorAll('.mg-b.on').forEach(b => b.classList.remove('on')); }

/* ================= Flujo de la partida ================= */
function crearIntento() {
  const n = NIV[RUN.idx].nivel;
  RUN.L = n; RUN.esc = RUN.esc && RUN.esc.id === n.level_id ? RUN.esc : Object.assign(preparaEscena(n, RUN.idx), { id: n.level_id });
  for (const c of n.cps) c.alcanzado = false;
  RUN.s = M.nuevo(n, Object.assign({ eventos: true }, RUN.opts));
  RUN.rec = M.grabadora(); RUN.fx = []; RUN.golpe = 0; RUN.t = 0; RUN.fase = 0; RUN.tFin = 0; RUN.overlay = 'listo'; RUN.hint = ''; RUN.avisado = false; RUN.rutaVista = '';
  RUN.nuevo = null; RUN.enviado = null; RUN.intento = (RUN.intento || 0) + 1; RUN.acc = 0;
  RUN.rep = { i: 0, c: 0 }; RUN.replay = Array.isArray(window.MARTIN_REPLAY) ? window.MARTIN_REPLAY : null;
  RUN.fruVista = null; RUN.fan = null;
  const fa = RUN.modo === 'nivel' && S.fantasma !== false && S.fant && S.fant[n.level_id];
  if (fa && fa.firma === firmaNivel(n) && Array.isArray(fa.runs)) RUN.fan = { s: M.nuevo(n, {}), runs: fa.runs, rep: { i: 0, c: 0 }, ms: fa.ms };
  soltarTodo();
}
function jugar(idx, modo, opts) {
  if (!NIV[idx] || !NIV[idx].ok) { openErrorNivel(idx); return; }
  closeModal();
  RUN.idx = idx; RUN.modo = modo || 'nivel'; RUN.opts = opts || {};
  crearIntento(); render();
}
function empezar() {
  if (!RUN.s || RUN.s.fase !== 'lista') return;
  M.empezar(RUN.s); if (RUN.fan) M.empezar(RUN.fan.s); RUN.overlay = ''; soltarTodo(); ponOverlay(); keepAwake();
  if (RUN.modo === 'nivel') prog(RUN.idx).plays++;
}
function pausar() {
  if (!RUN.s || RUN.s.fase !== 'jugando') return;
  M.pausar(RUN.s); soltarTodo(); RUN.overlay = 'pausa'; ponOverlay();
}
function reanudar() {
  if (!RUN.s || RUN.s.fase !== 'pausa') return;
  soltarTodo(); M.reanudar(RUN.s); RUN.overlay = ''; RUN.last = performance.now(); ponOverlay();
}
function reintentar() { crearIntento(); render(); }
function salirAlMapa() { stopLoop(); RUN.s = null; RUN.overlay = ''; RUN.replay = null; render(); }
function abandonar() { if (RUN.s && RUN.s.fase !== 'meta' && RUN.s.fase !== 'fallo' && RUN.s.fase !== 'lista') { if (RUN.modo === 'nivel') prog(RUN.idx).fails++; } salirAlMapa(); }
function siguiente() { const i = RUN.idx + 1; if (i < NIV.length && desbloqueado(i)) jugar(i, 'nivel'); else salirAlMapa(); }

function terminar() {
  const s = RUN.s, L = RUN.L; if (!s) return;
  const res = M.resultado(s);
  if (s.fase === 'meta') {
    const nu = { tiempo: false, agua: false, estrellas: false };
    if (RUN.modo === 'nivel') {
      const p = prog(RUN.idx);
      if (!p.done) nu.primera = true;
      p.done = true;
      if (res.estrellas > p.stars) { p.stars = res.estrellas; nu.estrellas = true; }
      if (!p.bestMs || res.ms < p.bestMs) { if (p.bestMs) nu.tiempo = true; p.bestMs = res.ms; }
      if (res.agua > p.bestAgua) { if (p.bestAgua) nu.agua = true; p.bestAgua = res.agua; }
      const antes = new Set(p.obj || []), nuevos = res.objetos.filter(id => !antes.has(id));
      if (nuevos.length) { const sa = selloAbierto(RUN.idx); p.obj = [...antes, ...nuevos]; nu.frutos = nuevos.map(id => (L.objetos.find(o => o.id === id) || {}).kind).filter(Boolean); if (!sa && selloAbierto(RUN.idx)) nu.sello = true; }
      const f0 = S.fant && S.fant[L.level_id], firma = firmaNivel(L);
      if (!f0 || f0.firma !== firma || res.ms < f0.ms) { S.fant = S.fant || {}; S.fant[L.level_id] = { ms: res.ms, firma, runs: RUN.rec.runs() }; if (f0 && f0.firma === firma) nu.fantasma = true; }
      S.archive.unshift({ id: uid(), created: Date.now(), finished: Date.now(), mode: 'nivel', nivel: L.level_id, ms: res.ms, agua: res.agua, estrellas: res.estrellas, caidas: res.caidas, ruta: s.ruta || '' });
      S.archive = S.archive.slice(0, MAX_ARCHIVE);
    } else if (RUN.modo === 'diario' || RUN.modo === 'practica') {
      const d = RUN.dia || '';
      const dd = S.diario && S.diario.dia === d ? S.diario : (S.diario = { dia: d });
      if (RUN.modo === 'diario' && (!dd.ms || res.ms < dd.ms)) { dd.ms = res.ms; dd.agua = res.agua; nu.tiempo = true; }
      S.archive.unshift({ id: uid(), created: Date.now(), finished: Date.now(), mode: RUN.modo, nivel: L.level_id, ms: res.ms, agua: res.agua, estrellas: res.estrellas, caidas: res.caidas, ruta: s.ruta || '', mod: RUN.opts.mod || 'normal', dia: d });
      S.archive = S.archive.slice(0, MAX_ARCHIVE);
    }
    RUN.nuevo = nu; save();
    if (RUN.modo === 'diario') enviarReto(RUN.rec.runs(), res);
  } else if (RUN.modo === 'nivel') { prog(RUN.idx).fails++; save(); }
  RUN.overlay = s.fase === 'meta' ? 'fin' : 'fallo'; ponOverlay(); autoBackup(false);
}

/* ================= Pantallas ================= */
function uiNombre(L) { return L.name; }
function renderSetup() {
  const flexible = NIV.every(n => n.ok);
  if (!flexible && !NIV.some(n => n.ok)) { $('#app').innerHTML = `<div class="sec"><h2>Error</h2><div class="empty">No se han podido cargar los niveles.</div><div class="acts"><button class="btn-gold" id="reintCarga">Reintentar</button></div></div>`; $('#reintCarga').onclick = () => location.reload(); return; }
  $('#subtitle').textContent = ' · Lanzarote';
  const est = totalEstrellas(), tot = NIV.length * 3;
  const sig = NIV.findIndex((n, i) => n.ok && desbloqueado(i) && !progR(i).done);
  let h = `<div class="mp">
    <div class="mp-hero"><img class="mp-img" src="portada.jpg" alt="" decoding="async"><div class="mp-top"><div class="mp-h"><b>Los Caminos del Volcán</b><span>Lleva el agua por toda la isla</span></div><div class="mp-est" title="Estrellas">★ ${est}/${tot}</div></div></div>
    ${sig >= 0 ? `<button class="btn-gold mp-cont" id="mpCont">▶ ${S.archive.some(a => a.mode === 'nivel') ? 'Continuar' : 'Empezar'} · Nivel ${sig + 1}: ${esc(NIV[sig].nivel.name)}</button>` : ''}
    ${cuadernoBoton()}
    <div id="mpDiario">${diarioHtml()}</div>
    <div class="mp-lv">`;
  NIV.forEach((n, i) => {
    const mu = MUNDOS.find(w => w.desde === i);
    if (mu) h += `<div class="mp-mu"><b>${esc(mu.nombre)}</b><span>${esc(mu.lema)}</span></div>`;
    if (!n.ok) { h += `<div class="lv bad"><div class="lv-n">!</div><div class="lv-b"><b>Nivel ${i + 1}</b><span>No se ha podido cargar (${esc(n.error)}).</span></div></div>`; return; }
    const p = progR(i), ab = desbloqueado(i);
    h += `<button class="lv ${ab ? '' : 'cerrado'} ${p.done ? 'hecho' : ''}" data-lv="${i}" ${ab ? '' : 'disabled'}>
      <div class="lv-n">${LUG[i] ? `<div class="lv-c" style="background:url('${LUG[i].img}') ${LUG[i].pos}/cover"></div>` : `<canvas class="lv-c" data-tema="${i}" width="112" height="112" aria-hidden="true"></canvas>`}<span>${ab ? i + 1 : '🔒'}</span></div>
      <div class="lv-b"><b>${esc(n.nivel.name)}</b><span>${ab ? esc(n.nivel.brief) : 'Termina el nivel anterior para abrirlo.'}</span>
        ${p.done ? `<small>⏱ ${fmtT(p.bestMs)} · 💧 ${p.bestAgua}/100${frutosDe(n.nivel).length ? ` · 🧺 ${frutosHechos(i)}/${frutosDe(n.nivel).length}` : ''}</small>` : ''}</div>
      <div class="lv-s" aria-label="${p.stars} de 3 estrellas">${ab ? estrellasTxt(p.stars) : ''}</div></button>`;
  });
  h += `</div>
  </div>`;
  $('#app').innerHTML = h;
  document.querySelectorAll('[data-lv]').forEach(b => b.onclick = () => openBriefing(+b.dataset.lv));
  document.querySelectorAll('canvas.lv-c').forEach(c => dibujaMini(c.getContext('2d'), c.width, c.height, +c.dataset.tema));
  animaHero();
  const c = $('#mpCont'); if (c) c.onclick = () => openBriefing(sig);
  const cb = $('#mpCuad'); if (cb) cb.onclick = openCuaderno;
  enlazarDiario();
  retoCargar(false);
}
let heroRaf = 0;
function animaHero() {
  cancelAnimationFrame(heroRaf);
  const cv = document.getElementById('mpHero'); if (!cv) return;
  const ctx = cv.getContext('2d'); let t0 = performance.now(), ult = 0;
  const f = ts => {
    const c = document.getElementById('mpHero'); if (!c || c !== cv || RUN.s) return;
    if (ts - ult > 33 && !document.hidden) {
      ult = ts; const r = cv.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2), w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
      if (w > 20 && (cv.width !== w || cv.height !== h)) { cv.width = w; cv.height = h; }
      dibujaHero(ctx, cv.width, cv.height, (ts - t0) / 1000, Math.min(S.prog ? Object.keys(S.prog).length : 0, 5));
    }
    heroRaf = requestAnimationFrame(f);
  };
  heroRaf = requestAnimationFrame(f);
}
function openErrorNivel(i) {
  const n = NIV[i];
  openModal(`<h3>⚠️ Nivel no disponible</h3><div class="sub">${esc(n ? n.error : 'No existe ese nivel.')}</div><div class="acts"><button class="btn-ghost" id="enNo">Volver</button><button class="btn-gold" id="enRe">Reintentar</button></div>`);
  $('#enNo').onclick = closeModal; $('#enRe').onclick = () => { closeModal(); location.reload(); };
}
function openBriefing(i) {
  const n = NIV[i].nivel, p = progR(i), g = n.goals;
  openModal(`<h3>Nivel ${i + 1} · ${esc(n.name)}</h3><div class="sub">${esc(n.brief)}</div>
    <div class="rules"><h4>Objetivos</h4><ul>
      <li>${p.stars >= 1 ? '★' : '☆'} Llega al punto de entrega con agua en el cántaro.</li>
      <li>${p.stars >= 2 ? '★' : '☆'} Termina con ${g.star_2_integrity} de agua o más.</li>
      <li>${p.stars >= 3 ? '★' : '☆'} Termina en ${Math.floor(g.star_3_time_s / 60)} min ${g.star_3_time_s % 60 ? (g.star_3_time_s % 60) + ' s' : ''} o menos y con ${g.star_3_integrity != null ? g.star_3_integrity : g.star_2_integrity} de agua o más.</li></ul>
      ${p.done ? `<h4>Tus récords</h4><p>⏱ Mejor tiempo: <b>${fmtT(p.bestMs)}</b> · 💧 Mejor agua: <b>${p.bestAgua}/100</b></p>` : ''}
      <p class="mut">Si Martín se cae, vuelve al último punto de control y pierde 15 de agua.</p></div>
    <div class="acts"><button class="btn-ghost" id="bfNo">Volver</button><button class="btn-gold" id="bfGo">▶ Jugar</button></div>`);
  $('#bfNo').onclick = closeModal; $('#bfGo').onclick = () => jugar(i, 'nivel');
}

function renderGame() {
  const n = RUN.L;
  $('#subtitle').textContent = '';
  const inv = S.mano === 'invertida';
  $('#app').innerHTML = `<div class="mg ${inv ? 'inv' : ''}" id="mg">
    <div class="mg-cv"><canvas id="mgCv" aria-label="Juego"></canvas>
      <div class="mg-hud">
        <div class="mg-izq"><div class="mg-nom">${esc(n.name)}</div>
          <div class="mg-agua" role="img" aria-label="Agua del cántaro"><span class="mg-ic"><svg viewBox="0 0 24 30" width="20" height="24" aria-hidden="true"><path d="M12 1C12 1 2 13 2 19a10 10 0 0 0 20 0C22 13 12 1 12 1Z" fill="#5cc0f5" stroke="#fff" stroke-width="1.6"/><path d="M7 19a5 5 0 0 0 4 4.8" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" opacity=".8"/></svg></span><div class="mg-bar"><i id="mgBar"></i></div><b id="mgAgua">100</b><em id="mgBajo"></em></div>${frutosDe(n).length ? '<div class="mg-fru" id="mgFru" role="img" aria-label="Frutos escondidos"></div>' : ''}</div>
        <div class="mg-der"><div class="mg-t">⏱ <b id="mgTiempo">0:00.0</b></div><button class="mg-pausa" id="mgPausa" aria-label="Pausa"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M8 5v14M16 5v14" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg></button></div>
      </div>
      <div class="mg-hint" id="mgHint"></div>${n.lava ? '<div class="mg-lava" id="mgLava">🌋 ¡Corre! La lava está a <b id="mgLavaD"></b></div>' : ''}
      <div class="mg-ov" id="mgOv"></div>
    </div>
    <div class="mg-pad"><div class="mg-lr"><button class="mg-b" id="mgL" aria-label="Izquierda"><svg viewBox="0 0 48 48" width="1em" height="1em" aria-hidden="true"><path d="M30 8 14 24 30 40" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg></button><button class="mg-b" id="mgR" aria-label="Derecha"><svg viewBox="0 0 48 48" width="1em" height="1em" aria-hidden="true"><path d="M18 8 34 24 18 40" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div><button class="mg-b mg-j" id="mgJ" aria-label="Saltar"><svg viewBox="0 0 48 48" width="1em" height="1em" aria-hidden="true"><path d="M8 32 24 14 40 32" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="mg-jt">SALTAR</span></button></div>
  </div>`;
  RUN.cv = $('#mgCv'); RUN.ctx = RUN.cv.getContext('2d'); RUN.camInit = '';
  enlazarControles();
  $('#mgPausa').onclick = () => { if (RUN.s.fase === 'jugando') pausar(); else if (RUN.overlay === 'pausa') reanudar(); };
  ponOverlay(); startLoop();
}
/* ================= Cuaderno de viaje ================= */
const LUG = window.LUGARES || [];
const fichaAbierta = i => !!(NIV[i] && NIV[i].ok && progR(i).done);
// Sellos del cuaderno: con los 3 frutos de un nivel se gana el sello del lugar y una curiosidad más
const selloAbierto = i => { const n = NIV[i]; if (!n || !n.ok || !LUG[i] || !LUG[i].extra) return false; const t = frutosDe(n.nivel).length; return t > 0 && frutosHechos(i) >= t; };
const sellosHechos = () => LUG.filter((_, i) => selloAbierto(i)).length;
function pintaSello(cv, i) {   // sello de correos: ilustración del lugar, borde dentado, nombre y número
  const f = LUG[i], g = cv.getContext('2d'), W = cv.width, H = cv.height, r = W * 0.035, m = W * 0.07;
  const dibuja = img => {
    g.clearRect(0, 0, W, H); g.fillStyle = '#fbf6ea'; g.fillRect(0, 0, W, H);
    g.save(); g.globalCompositeOperation = 'destination-out';
    for (let x = r * 1.4; x < W; x += r * 2.8) for (const y of [0, H]) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
    for (let y = r * 1.4; y < H; y += r * 2.8) for (const x of [0, W]) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
    g.restore();
    const iw = W - m * 2, ih = H * 0.66;
    if (img) { const [px, py] = (f.pos || '50% 50%').split(' ').map(v => parseFloat(v) / 100), k = Math.max(iw / img.width, ih / img.height), sw = iw / k, sh = ih / k;
      g.drawImage(img, (img.width - sw) * px, (img.height - sh) * py, sw, sh, m, m, iw, ih); }
    g.strokeStyle = 'rgba(60,40,20,.5)'; g.lineWidth = Math.max(1, W * 0.008); g.strokeRect(m, m, iw, ih);
    g.fillStyle = '#7a2e12'; g.textAlign = 'center'; g.font = `800 ${Math.round(W * 0.085)}px system-ui, sans-serif`;
    let t = Idioma.tr(f.lugar).toUpperCase(); while (g.measureText(t).width > iw && t.length > 4) t = t.slice(0, -2) + '…';
    g.fillText(t, W / 2, m + ih + H * 0.11);
    g.fillStyle = '#6b5a45'; g.font = `600 ${Math.round(W * 0.06)}px system-ui, sans-serif`; g.fillText('LANZAROTE · ' + (i + 1), W / 2, m + ih + H * 0.19);
  };
  dibuja(null); const img = new Image(); img.onload = () => dibuja(img); img.src = f.img;
}
function cuadernoBoton() {
  if (!LUG.length) return '';
  const n = LUG.filter((_, i) => fichaAbierta(i)).length;
  const se = sellosHechos();
  return `<button class="mp-cuad" id="mpCuad"><div class="ic">📖</div><div><b>Cuaderno de viaje · ${n}/${LUG.length}</b>${se ? `<small class="mp-se">🏅 ${se}/${LUG.length}</small>` : ''}<span>${n ? 'Lo que has aprendido de Lanzarote en el camino.' : 'Termina un nivel para conocer su lugar.'}</span></div></button>`;
}
function openCuaderno() {
  let h = `<h3>📖 Cuaderno de viaje</h3><div class="sub">Cada nivel recorre un lugar real de Lanzarote. Termínalo para abrir su ficha.</div>
    <div class="cu-se"><b>🏅 Sellos: ${sellosHechos()}/${LUG.length}</b><span>Encuentra los 3 frutos de un nivel y gana el sello de ese lugar.</span></div><div class="cu-l">`;
  LUG.forEach((f, i) => {
    const ok = fichaAbierta(i);
    h += `<button class="cu-i ${ok ? '' : 'cerrado'}" data-fi="${i}" ${ok ? '' : 'disabled'} style="background-image:url('${f.img}');background-position:${f.pos}"><span>${ok ? `<b>${esc(f.lugar)}</b>${esc(f.titulo)}` : `🔒 Nivel ${i + 1}`}</span>${selloAbierto(i) ? '<i class="cu-b" aria-label="Sello">🏅</i>' : ''}</button>`;
  });
  h += `</div><div class="acts"><button class="btn-gold" id="cuOk">Cerrar</button></div>`;
  openModal(h);
  document.querySelectorAll('[data-fi]').forEach(b => b.onclick = () => openFicha(+b.dataset.fi, true));
  $('#cuOk').onclick = closeModal;
}
function openFicha(i, desdeCuaderno) {
  const f = LUG[i]; if (!f) return;
  openModal(`<div class="fi"><div class="fi-img" style="background-image:url('${f.img}');background-position:${f.pos}"></div>
    <div class="fi-l"><span>Nivel ${i + 1}</span> · <span>${esc(f.lugar)}</span></div><h3>${esc(f.titulo)}</h3>
    ${f.texto.map(p => `<p>${esc(p)}</p>`).join('')}
    <div class="fi-dato"><b>¿Sabías que…?</b> ${esc(f.dato)}</div>
    ${NIV[i] && NIV[i].ok && frutosDe(NIV[i].nivel).length ? `<div class="fi-fru"><span id="fiFru"></span><span>Frutos del camino: <b>${frutosHechos(i)}/${frutosDe(NIV[i].nivel).length}</b>${frutosHechos(i) < frutosDe(NIV[i].nivel).length ? ' · Busca en lo alto y sobre los huecos.' : ''}</span></div>` : ''}
    ${f.extra && NIV[i] && NIV[i].ok && frutosDe(NIV[i].nivel).length ? (selloAbierto(i)
      ? `<div class="fi-se"><canvas id="fiSello" width="240" height="280" aria-label="Sello de ${esc(f.lugar)}"></canvas><div><b>🏅 ¡Sello conseguido!</b><p><b>Otra curiosidad:</b> ${esc(f.extra[0])}</p></div></div>`
      : `<div class="fi-se cerrado"><div class="se-v">🔒</div><span>Encuentra los 3 frutos de este nivel y ganarás su sello y otra curiosidad.</span></div>`) : ''}
    <div class="fi-f">Fuentes: ${[...f.fuentes, ...(f.extra && selloAbierto(i) ? [f.extra[1]] : [])].map(([t, u]) => `<a href="#" data-url="${esc(u)}">${esc(t)}</a>`).join(' · ')}</div></div>
    <div class="acts">${desdeCuaderno ? '<button class="btn-ghost" id="fiVol">‹ Cuaderno</button>' : ''}<button class="btn-gold" id="fiOk">Cerrar</button></div>`);
  if ($('#fiFru')) { const ids = new Set(progR(i).obj || []), tom = {}; for (const o of frutosDe(NIV[i].nivel)) if (ids.has(o.id)) tom[o.id] = 1; pintaFrutos($('#fiFru'), NIV[i].nivel, tom, 24); }
  if ($('#fiSello')) pintaSello($('#fiSello'), i);
  document.querySelectorAll('.fi-f a').forEach(a => a.onclick = e => { e.preventDefault(); openExternal(a.dataset.url); });
  $('#fiOk').onclick = closeModal; const v = $('#fiVol'); if (v) v.onclick = openCuaderno;
}

function ponOverlay() {
  const ov = document.getElementById('mgOv'); if (!ov) return;
  const s = RUN.s, n = RUN.L, o = RUN.overlay;
  ov.className = 'mg-ov' + (o ? ' on' : '');
  if (!o) { ov.innerHTML = ''; return; }
  if (o === 'listo') {
    const rt = RUN.modo === 'diario' ? `<div class="mg-tag">📅 Reto diario · ${esc(MODS_TXT[RUN.opts.mod || 'normal'][0])}</div>` : RUN.modo === 'practica' ? '<div class="mg-tag">🎯 Práctica</div>' : '';
    ov.innerHTML = `<div class="ov-c">${rt}<div class="ov-t">${esc(n.name)}</div><div class="ov-s">${esc(n.brief)}</div>
      <div class="ov-k"><span>◀ ▶ moverse</span><span>⬆ saltar</span></div><button class="btn-gold ov-go" id="ovGo">▶ ¡Vamos!</button>
      <button class="btn-ghost" id="ovMapa">Volver al mapa</button></div>`;
    $('#ovGo').onclick = empezar; $('#ovMapa').onclick = salirAlMapa;
  } else if (o === 'pausa') {
    ov.innerHTML = `<div class="ov-c"><div class="ov-t">⏸ Pausa</div><div class="ov-s">El reloj está parado.</div>
      <button class="btn-gold ov-go" id="ovSig">▶ Seguir</button><button class="btn-ghost" id="ovRei">↻ Empezar de nuevo</button><button class="btn-ghost" id="ovMapa">Salir al mapa</button></div>`;
    $('#ovSig').onclick = reanudar; $('#ovRei').onclick = reintentar; $('#ovMapa').onclick = abandonar;
  } else if (o === 'fallo') {
    ov.innerHTML = `<div class="ov-c"><div class="ov-t">${s.causa === 'lava' ? '🌋' : '💧'} Misión fallida</div><div class="ov-s">${esc(CAUSAS[s.causa] || '')}</div>
      <div class="ov-d"><span>⏱ ${fmtT(s.t * 1000 / 60)}</span><span>Caídas ${s.caidas}</span><span>Golpes ${s.golpes}</span></div>
      <button class="btn-gold ov-go" id="ovRei">↻ Reintentar</button><button class="btn-ghost" id="ovMapa">Volver al mapa</button></div>`;
    $('#ovRei').onclick = reintentar; $('#ovMapa').onclick = salirAlMapa;
  } else if (o === 'fin') {
    const r = M.resultado(s), g = n.goals, nu = RUN.nuevo || {};
    const razon = [`${r.estrellas >= 1 ? '★' : '☆'} Entregaste el agua`, `${r.estrellas >= 2 ? '★' : '☆'} ${g.star_2_integrity} de agua o más`, `${r.estrellas >= 3 ? '★' : '☆'} En ${g.star_3_time_s} s o menos con ${g.star_3_integrity != null ? g.star_3_integrity : g.star_2_integrity} de agua`];
    const sigOk = RUN.modo === 'nivel' && RUN.idx + 1 < NIV.length;
    ov.innerHTML = `<div class="ov-c"><div class="ov-t">¡Entregado!</div><div class="ov-est" aria-label="${r.estrellas} de 3 estrellas">${estrellasTxt(r.estrellas)}</div>
      <div class="ov-d big"><span>⏱ <b>${fmtT(r.ms)}</b>${nu.tiempo ? ' 🏅' : ''}</span><span>💧 <b>${r.agua}</b>/100${nu.agua ? ' 🏅' : ''}</span></div>
      <div class="ov-d"><span>Agua perdida ${r.danos}</span><span>Caídas ${r.caidas}</span>${s.ruta ? `<span>${s.ruta === 'RUTA-ALTA' ? 'Camino alto' : 'Camino bajo'}</span>` : ''}</div>
      <ul class="ov-r">${razon.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
      ${frutosDe(n).length ? `<div class="ov-fru"><span id="ovFru"></span><span>${r.objetos.length === frutosDe(n).length ? '¡Todos los frutos!' : `Frutos ${r.objetos.length}/${frutosDe(n).length}`}</span>${nu.frutos && nu.frutos.length ? '<span class="ov-nue">✨ ¡Nuevo!</span>' : ''}</div>` : ''}
      ${nu.sello ? '<div class="ov-se"><b>🏅 ¡Nuevo sello en el cuaderno!</b><span>Ábrelo para ver una curiosidad más de este lugar.</span></div>' : ''}
      ${nu.fantasma ? '<div class="ov-fan">👻 Tu nueva mejor carrera será tu rival la próxima vez.</div>' : ''}
      ${RUN.modo === 'diario' ? `<div class="ov-env" id="ovEnv">${envioTxt()}</div>` : ''}
      ${RUN.modo === 'nivel' && LUG[RUN.idx] ? `<button class="ov-fi" id="ovFi">📖 ${(RUN.nuevo || {}).primera ? '✨ Nueva ficha: ' : 'Conoce '}${esc(LUG[RUN.idx].lugar)}</button>` : ''}
      <button class="btn-gold ov-go" id="ovSig">${RUN.modo === 'nivel' ? (sigOk ? 'Siguiente nivel ›' : 'Volver al mapa') : 'Volver al mapa'}</button>
      <div class="ov-row"><button class="btn-ghost" id="ovRei">↻ Repetir</button>${RUN.modo === 'diario' ? '<button class="btn-ghost" id="ovRank">🏆 Ranking</button>' : '<button class="btn-ghost" id="ovMapa">Mapa</button>'}</div></div>`;
    $('#ovSig').onclick = RUN.modo === 'nivel' ? siguiente : salirAlMapa; $('#ovRei').onclick = reintentar;
    const rk = $('#ovRank'); if (rk) rk.onclick = () => openRanking();
    const mp = $('#ovMapa'); if (mp) mp.onclick = salirAlMapa;
    const fi = $('#ovFi'); if (fi) fi.onclick = () => openFicha(RUN.idx, false);
    pintaFrutos($('#ovFru'), n, s.obj || {}, 26);
  }
}

/* ================= Reto diario ================= */
const RETO = { info: null, estado: 'nada', ranking: null, err: '' };
const diaLocal = () => { try { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Atlantic/Canary' }).format(new Date()); } catch (e) { return new Date().toISOString().slice(0, 10); } };
function retoInfoLocal() {
  const dia = diaLocal(), r = M.retoDelDia(dia, NIV.map(n => (n.ok ? n.nivel.level_id : '')));
  return { dia, nivel: r.nivel, mod: r.mod, local: true };
}
async function pide(ruta, cuerpo) {
  const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 8000);
  try {
    const r = await fetch(HTTP_BASE + ruta, cuerpo ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(cuerpo), signal: ctl.signal } : { signal: ctl.signal, cache: 'no-store' });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || 'Error ' + r.status);
    return j;
  } finally { clearTimeout(to); }
}
async function retoCargar(forzar) {
  if (!HTTP_BASE) { RETO.estado = 'local'; RETO.info = retoInfoLocal(); pintaDiario(); return; }
  if (RETO.estado === 'cargando') return;
  if (!forzar && RETO.estado === 'listo' && RETO.info && Date.now() - (RETO.t || 0) < 600e3) return;
  RETO.estado = 'cargando'; pintaDiario();
  try { const j = await pide('/reto/hoy'); RETO.info = { dia: j.dia, nivel: j.nivel, mod: j.mod, checksum: j.checksum }; RETO.estado = 'listo'; RETO.t = Date.now(); }
  catch (e) { RETO.estado = 'error'; RETO.err = String(e.message || e); RETO.info = retoInfoLocal(); }
  pintaDiario();
}
function diarioHtml() {
  const r = RETO.info, i = r ? NIV.findIndex(n => n.ok && n.nivel.level_id === r.nivel) : -1;
  if (!r || i < 0) return `<div class="dia"><div class="dia-h"><b>📅 Reto diario</b></div><div class="mut">${RETO.estado === 'cargando' ? 'Buscando el reto de hoy…' : 'Aún no hay reto disponible.'}</div></div>`;
  const m = MODS_TXT[r.mod] || MODS_TXT.normal, mio = S.diario && S.diario.dia === r.dia ? S.diario : null;
  const st = RETO.estado === 'listo' ? '' : RETO.estado === 'cargando' ? '<span class="mut"> · conectando…</span>' : '<span class="mut"> · sin conexión</span>';
  return `<div class="dia"><div class="dia-h"><b>📅 Reto diario</b>${st}</div>
    <div class="dia-b"><div><b>Nivel ${i + 1} · ${esc(NIV[i].nivel.name)}</b><span>${esc(m[0])} — ${esc(m[1])}</span>${mio && mio.ms ? `<small>Tu mejor hoy: ⏱ ${fmtT(mio.ms)} · 💧 ${mio.agua}</small>` : '<small>Mismo recorrido y mismas condiciones para todos.</small>'}</div></div>
    <div class="acts">${RETO.estado === 'listo' ? '<button class="btn-ghost" id="dgRank">🏆 Ranking</button><button class="btn-gold" id="dgJugar">▶ Jugar el reto</button>' : `<button class="btn-ghost" id="dgRe">↻ Reintentar</button><button class="btn-gold" id="dgPrac">🎯 Practicar</button>`}</div></div>`;
}
function pintaDiario() { const el = document.getElementById('mpDiario'); if (el) { el.innerHTML = diarioHtml(); enlazarDiario(); } }
function enlazarDiario() {
  const q = id => document.getElementById(id), r = RETO.info;
  const idx = r ? NIV.findIndex(n => n.ok && n.nivel.level_id === r.nivel) : -1;
  if (q('dgJugar')) q('dgJugar').onclick = () => { RUN.dia = r.dia; jugar(idx, 'diario', { mod: r.mod }); };
  if (q('dgPrac')) q('dgPrac').onclick = () => { RUN.dia = r.dia; jugar(idx, 'practica', { mod: r.mod }); };
  if (q('dgRe')) q('dgRe').onclick = () => retoCargar(true);
  if (q('dgRank')) q('dgRank').onclick = () => openRanking();
}
const envioTxt = () => RUN.enviado == null ? '📤 Enviando tu tiempo…' : RUN.enviado.ok ? `🏆 Puesto <b>${RUN.enviado.puesto}</b> de ${RUN.enviado.total}${RUN.enviado.mejora ? ' · ¡mejor marca!' : ' · tu mejor marca de hoy sigue valiendo'}` : `⚠️ ${esc(RUN.enviado.error || 'No se pudo enviar')}`;
async function enviarReto(runs, res) {
  const r = RETO.info; if (!r || !HTTP_BASE) { RUN.enviado = { ok: false, error: 'Sin conexión: el tiempo no se ha enviado.' }; return; }
  const n = RUN.L;
  if (r.checksum && r.checksum !== n.checksum) { RUN.enviado = { ok: false, error: 'Tu versión del nivel es distinta: actualiza la app.' }; refrescaEnvio(); return; }
  if (!(S.online && S.online.nombre)) { await pedirNombre(); }
  try {
    const j = await pide('/reto/enviar', { token: onToken(), nombre: (S.online && S.online.nombre) || 'Anónimo', dia: r.dia, nivel: r.nivel, mod: r.mod, runs });
    RUN.enviado = { ok: true, puesto: j.puesto, total: j.total, mejora: j.mejora, ms: j.ms };
  } catch (e) { RUN.enviado = { ok: false, error: String(e.message || e) }; }
  refrescaEnvio();
}
function refrescaEnvio() { const el = document.getElementById('ovEnv'); if (el) el.innerHTML = envioTxt(); }
function onToken() { S.online = S.online || {}; if (!S.online.token) S.online.token = Array.from(crypto.getRandomValues(new Uint8Array(14)), b => 'abcdefghijkmnpqrstuvwxyz23456789'[b % 32]).join('').slice(0, 18); save(); return S.online.token; }
function pedirNombre() {
  return new Promise(res => {
    openModal(`<h3>🏆 ¿Cómo te llamas?</h3><div class="sub">Tu nombre saldrá en el ranking del reto diario. Es opcional: puedes usar un apodo.</div>
      <input id="rnNom" maxlength="18" placeholder="Tu nombre o apodo" value="${esc((S.online && S.online.nombre) || S.lastName || '')}" style="width:100%;padding:12px;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--txt);font-size:16px">
      <div class="acts"><button class="btn-gold" id="rnOk">Guardar</button></div>`);
    const ok = () => { const v = cleanName($('#rnNom').value).slice(0, 18) || 'Anónimo'; S.online = S.online || {}; S.online.nombre = v; save(); closeModal(); res(v); };
    $('#rnOk').onclick = ok; modalOnClose = () => { if (!(S.online && S.online.nombre)) { S.online = S.online || {}; S.online.nombre = 'Anónimo'; } res(); };
  });
}
async function openRanking() {
  const r = RETO.info; if (!r) return;
  openModal(`<h3>🏆 Ranking de hoy</h3><div class="sub">Cargando…</div>`);
  try {
    const j = await pide('/reto/ranking', { dia: r.dia, token: onToken() });
    const fila = (p, i) => `<div class="rk ${p.yo ? 'yo' : ''}"><span>${i + 1}. ${esc(p.nombre)}</span><b>${fmtT(p.ms)} · 💧${p.agua}</b></div>`;
    openModal(`<h3>🏆 Ranking de hoy</h3><div class="sub">${esc(r.dia)} · el menor tiempo gana; a igual tiempo, más agua. Cada tiempo se comprueba repitiendo tu partida en el servidor.</div>
      ${j.top.length ? j.top.map(fila).join('') : '<div class="empty">Aún no hay tiempos hoy. ¡Sé el primero!</div>'}
      ${j.yo && !j.top.some(p => p.yo) ? `<div class="mut" style="margin:8px 0 2px">Tu puesto</div>${fila(j.yo, j.yo.puesto - 1)}` : ''}
      <div class="acts"><button class="btn-gold" id="rkOk">Cerrar</button></div>`);
    $('#rkOk').onclick = closeModal;
  } catch (e) {
    openModal(`<h3>🏆 Ranking de hoy</h3><div class="sub">No se pudo cargar: ${esc(String(e.message || e))}</div><div class="acts"><button class="btn-gold" id="rkOk">Cerrar</button></div>`); $('#rkOk').onclick = closeModal;
  }
}

/* ================= Gancho con el resto de la app ================= */
function openCards() { openGameRules(); }
window.__martin = { RUN, NIV, M };
