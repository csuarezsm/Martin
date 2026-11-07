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
const CAUSAS = { agua: 'Se ha derramado toda el agua.', caida: 'Martín ha caído demasiadas veces.', tiempo: 'Se ha acabado el tiempo.' };
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
    } catch (e) {}
  }
  return { play };
})();

/* ================= Progreso ================= */
function DEFAULTS() { S.prog = S.prog || {}; S.mano = S.mano || 'normal'; S.best = S.best || {}; }

const lid = i => (NIV[i] && NIV[i].ok ? NIV[i].nivel.level_id : 'nivel-' + i);
const PROG0 = () => ({ done: false, stars: 0, bestMs: 0, bestAgua: 0, plays: 0, fails: 0 });
const prog = i => (S.prog[lid(i)] = S.prog[lid(i)] || PROG0());          // para escribir (crea la entrada)
const progR = i => S.prog[lid(i)] || PROG0();                              // para leer (no crea nada)
const desbloqueado = i => i === 0 || (!!S.prog[lid(i - 1)] && !!S.prog[lid(i - 1)].done);
const totalEstrellas = () => NIV.reduce((a, n, i) => a + (n.ok ? progR(i).stars : 0), 0);
const fmtT = ms => { const t = Math.max(0, Math.round(ms / 100)); const m = Math.floor(t / 600), s = Math.floor((t % 600) / 10); return m + ':' + String(s).padStart(2, '0') + '.' + (t % 10); };
const estrellasTxt = (n, tot) => '★'.repeat(n) + '☆'.repeat((tot || 3) - n);

/* ================= Dibujo ================= */
const COL = {
  cieloA: '#2f78b5', cieloB: '#8fc4e4', cieloC: '#f2dcb0', lejos: '#5a4545', lejos2: '#7a5448', medio: '#3d302e', ceniza: '#cbbfb4',
  lapilli: '#241e1f', lapilli2: '#352c2c', tierra: '#9b4b2f', tierra2: '#c1693d', arena: '#e0b978', roca: '#4a4143', roca2: '#6b5e5f', rocaOsc: '#2b2527',
  repisa: '#8c7968', repisa2: '#b3a08c', abismo: '#120d0e', camello: '#c99a5b', camello2: '#e6c590', camelloOsc: '#9c7340', manta: '#a8452a', manta2: '#f0d9a8',
  agua: '#3aa7e8', agua2: '#9ad6ff', cantaro: '#b8693a', cantaro2: '#8a4a28', verde: '#4f8a43', verde2: '#7aa94f', blanco: '#f4efe6'
};
const hash = n => { n = Math.imul(n ^ (n >>> 15), 0x2c1b3c6d); n = Math.imul(n ^ (n >>> 12), 0x297a2d39); return ((n ^ (n >>> 15)) >>> 0) / 4294967296; };

/* Prepara lo que no cambia de un nivel: base de cada roca y adornos */
function preparaEscena(L) {
  const sc = { rocas: [], deco: [], huecos: [], flags: [] };
  for (const s of L.solids) {
    if (s.kind === 'rock') {
      let base = L.world.kill_y;
      for (const g of L.solids) if (g.kind === 'ground' && g.x0 < s.x1 && g.x1 > s.x0 && g.top < s.top && g.top > base) base = g.top;
      sc.rocas.push({ id: s.id, base });
    }
  }
  for (const o of L.obstacles || []) if (o.kind === 'gap') {
    let a = -99, b = -99;
    for (const g of L.solids) { if (g.bot > -1e8) continue; if (Math.abs(g.x1 - o.x0) < 0.01) a = g.top; if (Math.abs(g.x0 - o.x1) < 0.01) b = g.top; }
    const top = Math.max(a, b) > -90 ? Math.min(a > -90 ? a : b, b > -90 ? b : a) : 0;
    sc.huecos.push({ x0: o.x0, x1: o.x1, top });
  }
  // adornos (tuneras y pitas) sobre suelo llano, sin tapar obstáculos
  let k = 0;
  for (const g of L.solids) {
    if (g.kind !== 'ground' || g.bot > -1e8) continue;
    for (let x = g.x0 + 2; x < g.x1 - 2; x += 2.6) {
      const h = hash(Math.floor(x * 10) + k * 977);
      if (h < 0.34) {
        const choque = L.solids.some(r => r.kind === 'rock' && r.x0 < x + 1.2 && r.x1 > x - 1.2 && Math.abs(r.top - g.top) < 3);
        if (!choque) sc.deco.push({ x: x + h * 1.2, y: g.top, t: h < 0.17 ? 'tunera' : 'pita', s: 0.7 + h * 1.6 });
      }
    }
    k++;
  }
  return sc;
}

/* ---- Martín ---- */
function dibujaMartin(ctx, u, px, py, st) {
  // u = píxeles por unidad; (px,py) = punto de apoyo (centro de los pies). st: {dir, fase, anim, agua, golpe, ganar, alpha}
  ctx.save(); ctx.translate(px, py); ctx.scale(st.dir < 0 ? -u : u, -u);   // y hacia arriba
  ctx.globalAlpha = st.alpha == null ? 1 : st.alpha;
  const t = st.fase;
  const sw = Math.sin(t), sw2 = Math.sin(t + Math.PI);
  let lift = 0, tuck = 0;
  if (st.anim === 'salta') tuck = 0.5; else if (st.anim === 'cae') tuck = -0.25;
  const bob = st.anim === 'idle' ? Math.sin(st.t * 2.4) * 0.025 : (st.anim === 'corre' ? Math.abs(Math.sin(t)) * 0.06 : 0);
  const sq = st.golpe > 0 ? 1 - st.golpe * 0.12 : 1;
  const hop = st.anim === 'gana' ? Math.abs(Math.sin(st.t * 6)) * 0.35 : 0;
  ctx.translate(0, hop);
  ctx.scale(1 + (1 - sq) * 0.6, sq);
  const pata = (x, ang, cen) => {
    // pata: de la cadera (x,0.72) a la pezuña
    const dx = Math.sin(ang) * 0.3, alza = st.anim === 'corre' ? Math.max(0, Math.cos(ang)) * 0.16 : 0;
    let fy = alza, fx = x + dx;
    if (tuck > 0) { fy = 0.38 * tuck + (cen ? 0.1 : 0); fx = x + (cen ? 0.16 : -0.06); }
    if (tuck < 0) { fy = 0.05; fx = x + (cen ? 0.22 : -0.22); }
    ctx.strokeStyle = COL.camelloOsc; ctx.lineWidth = 0.14; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, 0.78 + bob); ctx.lineTo((x + fx) / 2 + 0.03, 0.4 + fy / 2 + bob / 2); ctx.lineTo(fx, 0.05 + fy); ctx.stroke();
    ctx.fillStyle = '#3a2a1c'; ctx.beginPath(); ctx.ellipse(fx + 0.02, 0.05 + fy, 0.09, 0.05, 0, 0, 7); ctx.fill();
  };
  // patas de atrás (más oscuras) y de delante
  pata(-0.34, sw * 0.9, false); pata(0.3, sw2 * 0.9, true);
  // cola
  ctx.strokeStyle = COL.camelloOsc; ctx.lineWidth = 0.07;
  ctx.beginPath(); ctx.moveTo(-0.6, 1.0 + bob); ctx.quadraticCurveTo(-0.78, 0.95 + sw * 0.05, -0.74, 0.7); ctx.stroke();
  // cuerpo
  ctx.fillStyle = COL.camello; ctx.beginPath(); ctx.ellipse(0, 0.98 + bob, 0.62, 0.34, 0, 0, 7); ctx.fill();
  ctx.fillStyle = COL.camello2; ctx.beginPath(); ctx.ellipse(0.05, 0.88 + bob, 0.5, 0.2, 0, 0, 7); ctx.fill();
  // joroba
  ctx.fillStyle = COL.camello; ctx.beginPath(); ctx.ellipse(-0.1, 1.38 + bob, 0.27, 0.3, 0, 0, 7); ctx.fill();
  // manta
  ctx.fillStyle = COL.manta; ctx.beginPath(); ctx.moveTo(-0.28, 1.12 + bob); ctx.quadraticCurveTo(-0.1, 1.28 + bob, 0.14, 1.1 + bob); ctx.lineTo(0.08, 0.78 + bob); ctx.lineTo(-0.3, 0.8 + bob); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = COL.manta2; ctx.lineWidth = 0.04; ctx.beginPath(); ctx.moveTo(-0.29, 0.92 + bob); ctx.lineTo(0.1, 0.92 + bob); ctx.stroke();
  // cuello y cabeza
  ctx.strokeStyle = COL.camello; ctx.lineWidth = 0.25; ctx.beginPath(); ctx.moveTo(0.38, 1.0 + bob); ctx.quadraticCurveTo(0.62, 1.3 + bob, 0.58, 1.55 + bob); ctx.stroke();
  ctx.fillStyle = COL.camello; ctx.beginPath(); ctx.ellipse(0.68, 1.62 + bob, 0.22, 0.14, -0.15, 0, 7); ctx.fill();
  ctx.fillStyle = COL.camello2; ctx.beginPath(); ctx.ellipse(0.83, 1.57 + bob, 0.1, 0.085, -0.15, 0, 7); ctx.fill();
  ctx.fillStyle = COL.camelloOsc; ctx.beginPath(); ctx.ellipse(0.55, 1.78 + bob, 0.05, 0.09, 0.4, 0, 7); ctx.fill();
  ctx.fillStyle = '#20150d'; ctx.beginPath(); ctx.arc(0.7, 1.66 + bob, 0.032, 0, 7); ctx.fill();
  if (st.golpe > 0 || st.anim === 'cae') { ctx.strokeStyle = '#20150d'; ctx.lineWidth = 0.025; ctx.beginPath(); ctx.moveTo(0.66, 1.7 + bob); ctx.lineTo(0.74, 1.7 + bob); ctx.stroke(); }
  // cántaro de agua sobre la joroba
  const jx = -0.1, jy = 1.62 + bob + hop * 0.15 + (st.anim === 'gana' ? 0.18 : 0);
  ctx.fillStyle = COL.cantaro; ctx.beginPath(); ctx.ellipse(jx, jy + 0.18, 0.2, 0.24, 0, 0, 7); ctx.fill();
  ctx.fillStyle = COL.cantaro2; ctx.beginPath(); ctx.ellipse(jx, jy + 0.42, 0.09, 0.07, 0, 0, 7); ctx.fill();
  // el nivel del agua se ve a través de una ventanita
  const f = Math.max(0, Math.min(1, st.agua / 100));
  ctx.fillStyle = '#0d2233'; ctx.fillRect(jx - 0.07, jy - 0.02, 0.14, 0.4);
  ctx.fillStyle = f < 0.3 ? '#ffd24a' : COL.agua; const hh = 0.4 * f; ctx.fillRect(jx - 0.07, jy - 0.02 + (0.4 - hh), 0.14, hh);
  ctx.restore();
}

/* ---- Escenario ---- */
function dibujaEscena(ctx, W, H, u, cam, L, esc, t, fx) {
  const sx = wx => (wx - cam.x) * u, sy = wy => H - (wy - cam.y) * u;
  // cielo
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, COL.cieloA); g.addColorStop(0.55, COL.cieloB); g.addColorStop(1, COL.cieloC);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // sol
  ctx.fillStyle = '#fff6d0'; ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.arc(W * 0.82, H * 0.2, u * 1.1, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
  // nubes (lentas)
  ctx.fillStyle = 'rgba(255,255,255,.7)';
  for (let i = 0; i < 6; i++) {
    const x = ((i * 9.7 + t * 0.25 - cam.x * 0.08) % 62 + 62) % 62 - 8, y = H * (0.1 + 0.07 * ((i * 5) % 4));
    ctx.beginPath(); ctx.ellipse(x * u, y, u * 2.2, u * 0.55, 0, 0, 7); ctx.ellipse(x * u + u * 1.2, y - u * 0.3, u * 1.4, u * 0.55, 0, 0, 7); ctx.fill();
  }
  // volcanes lejanos (paralaje 0,12) y laderas (0,3)
  const capas = [[0.12, COL.lejos, 6.2, 9, 46, 0.8], [0.3, COL.medio, 2.5, 6, 27, 0.5]];
  for (const [par, col, alt, ancho, per, baseY] of capas) {
    ctx.fillStyle = col;
    const off = cam.x * par, i0 = Math.floor(off / per) - 1, by = H - (baseY - cam.y * par) * u;
    for (let i = i0; i < i0 + Math.ceil(W / u / per) + 3; i++) {
      const hk = hash(i * 31 + (par * 100 | 0)), cx = (i * per + hk * per * 0.4 - off) * u, ah = (alt * (0.7 + hk * 0.6)) * u, aw = ancho * (0.8 + hk * 0.5) * u;
      ctx.beginPath(); ctx.moveTo(cx - aw, by); ctx.quadraticCurveTo(cx - aw * 0.3, by - ah * 0.55, cx - aw * 0.12, by - ah); ctx.lineTo(cx + aw * 0.12, by - ah); ctx.quadraticCurveTo(cx + aw * 0.3, by - ah * 0.55, cx + aw, by); ctx.closePath(); ctx.fill();
      ctx.fillStyle = par > 0.2 ? '#5d4a44' : COL.lejos2; ctx.beginPath(); ctx.moveTo(cx - aw * 0.12, by - ah); ctx.lineTo(cx + aw * 0.12, by - ah); ctx.lineTo(cx + aw * 0.2, by - ah * 0.8); ctx.lineTo(cx - aw * 0.2, by - ah * 0.8); ctx.closePath(); ctx.fill();
      ctx.fillStyle = col;
      if (par > 0.2 && hk > 0.5) { // casita blanca lejana
        ctx.fillStyle = COL.blanco; ctx.fillRect(cx + aw * 0.55, by - u * 0.55, u * 0.9, u * 0.55); ctx.fillStyle = '#b5532f'; ctx.fillRect(cx + aw * 0.55 - u * 0.05, by - u * 0.62, u * 1.0, u * 0.1); ctx.fillStyle = col;
      }
    }
    ctx.fillRect(0, by - 1, W, H - by + 2);
  }
  // abismo de los huecos
  ctx.fillStyle = COL.abismo;
  for (const h of esc.huecos) {
    const x0 = sx(h.x0), x1 = sx(h.x1); if (x1 < -4 || x0 > W + 4) continue;
    ctx.fillRect(x0, sy(h.top), x1 - x0, H);
  }
  // suelo, rocas y repisas
  for (const s of L.solids) {
    const x0 = sx(s.x0), x1 = sx(s.x1); if (x1 < -4 || x0 > W + 4) continue;
    const yt = sy(s.top);
    if (s.kind === 'ground' || s.kind === 'wall') {
      const yb = s.bot > -1e8 ? sy(s.bot) : H + 4;
      ctx.fillStyle = COL.lapilli; ctx.fillRect(x0, yt, x1 - x0, yb - yt);
      ctx.fillStyle = COL.tierra; ctx.fillRect(x0, yt, x1 - x0, Math.min(u * 0.55, yb - yt));
      ctx.fillStyle = COL.tierra2; ctx.fillRect(x0, yt, x1 - x0, u * 0.14);
      ctx.fillStyle = COL.arena; ctx.fillRect(x0, yt - u * 0.03, x1 - x0, u * 0.07);
      // lapilli: puntitos
      ctx.fillStyle = COL.lapilli2;
      for (let x = Math.max(s.x0, cam.x - 1); x < Math.min(s.x1, cam.x + W / u + 1); x += 0.7) {
        const hk = hash(Math.floor(x * 10) + 7); const px = sx(x + hk * 0.5), py = yt + u * (0.7 + hk * 1.6);
        if (py < yb) ctx.fillRect(px, py, u * 0.16, u * 0.12);
      }
      ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(x0, yt, u * 0.05, yb - yt); ctx.fillRect(x1 - u * 0.05, yt, u * 0.05, yb - yt);
    } else if (s.kind === 'rock') {
      const r = esc.rocas.find(q => q.id === s.id), base = r ? r.base : s.top - 1, yb = sy(base);
      ctx.fillStyle = COL.roca;
      ctx.beginPath(); ctx.moveTo(x0, yb); ctx.lineTo(x0, yt + u * 0.25); ctx.quadraticCurveTo(x0 + (x1 - x0) * 0.12, yt - u * 0.05, x0 + (x1 - x0) * 0.4, yt); ctx.quadraticCurveTo(x0 + (x1 - x0) * 0.75, yt - u * 0.12, x1 - u * 0.1, yt + u * 0.2); ctx.lineTo(x1, yt + u * 0.5); ctx.lineTo(x1, yb); ctx.closePath(); ctx.fill();
      ctx.fillStyle = COL.roca2; ctx.beginPath(); ctx.moveTo(x0 + u * 0.1, yt + u * 0.3); ctx.quadraticCurveTo(x0 + (x1 - x0) * 0.4, yt - u * 0.02, x1 - u * 0.2, yt + u * 0.28); ctx.lineTo(x1 - u * 0.3, yt + u * 0.42); ctx.lineTo(x0 + u * 0.15, yt + u * 0.45); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = COL.rocaOsc; ctx.lineWidth = Math.max(1.5, u * 0.07); ctx.beginPath(); ctx.moveTo(x0 + (x1 - x0) * 0.4, yt + u * 0.2); ctx.lineTo(x0 + (x1 - x0) * 0.5, yb - (yb - yt) * 0.35); ctx.stroke();
      ctx.strokeStyle = '#1c1618'; ctx.lineWidth = Math.max(1.5, u * 0.06);
      ctx.beginPath(); ctx.moveTo(x0, yb); ctx.lineTo(x0, yt + u * 0.25); ctx.quadraticCurveTo(x0 + (x1 - x0) * 0.12, yt - u * 0.05, x0 + (x1 - x0) * 0.4, yt); ctx.quadraticCurveTo(x0 + (x1 - x0) * 0.75, yt - u * 0.12, x1 - u * 0.1, yt + u * 0.2); ctx.lineTo(x1, yt + u * 0.5); ctx.lineTo(x1, yb); ctx.stroke();
    } else if (s.kind === 'oneway') {
      const th = Math.max(u * 0.3, 4);
      ctx.fillStyle = COL.repisa; ctx.fillRect(x0, yt, x1 - x0, th); ctx.fillStyle = COL.repisa2; ctx.fillRect(x0, yt, x1 - x0, u * 0.1);
      ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.fillRect(x0, yt + th, x1 - x0, u * 0.08);
      ctx.strokeStyle = '#1c1618'; ctx.lineWidth = 1; ctx.strokeRect(x0, yt, x1 - x0, th);
    }
  }
  // adornos
  for (const d of esc.deco) {
    const x = sx(d.x); if (x < -40 || x > W + 40) continue; const y = sy(d.y);
    if (d.t === 'pita') {
      ctx.strokeStyle = COL.verde; ctx.lineWidth = Math.max(2, u * 0.09); ctx.lineCap = 'round';
      for (let a = -3; a <= 3; a++) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + a * u * 0.14 * d.s, y - u * (0.45 + (3 - Math.abs(a)) * 0.08) * d.s); ctx.stroke(); }
    } else {
      ctx.fillStyle = COL.verde2;
      for (const [dx, dy, r] of [[0, 0.35, 0.28], [-0.22, 0.75, 0.2], [0.2, 0.7, 0.22]]) { ctx.beginPath(); ctx.ellipse(x + dx * u * d.s, y - dy * u * d.s, r * u * d.s * 0.8, r * u * d.s, 0, 0, 7); ctx.fill(); }
    }
  }
  // puntos de control
  for (const c of L.cps) {
    const x = sx(c.x); if (x < -40 || x > W + 40) continue; const y = sy(c.y), ya = c.alcanzado;
    ctx.strokeStyle = '#3a2a1c'; ctx.lineWidth = Math.max(2, u * 0.1); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - u * 2.1); ctx.stroke();
    ctx.fillStyle = ya ? COL.agua : '#d6d0c4'; ctx.beginPath(); ctx.moveTo(x, y - u * 2.1); ctx.lineTo(x + u * 0.9, y - u * 1.8 + Math.sin(t * 4) * u * 0.05); ctx.lineTo(x, y - u * 1.4); ctx.closePath(); ctx.fill();
  }
  // meta: pozo/punto de entrega con casita
  const mx = sx(L.goals.finish_x);
  if (mx > -200 && mx < W + 200) {
    const gs = L.solids.find(s => s.kind !== 'wall' && s.x0 <= L.goals.finish_x && s.x1 >= L.goals.finish_x && s.bot < -1e8), y = sy(gs ? gs.top : 0);
    ctx.fillStyle = COL.blanco; ctx.fillRect(mx + u * 1.5, y - u * 2.4, u * 3.4, u * 2.4);
    ctx.fillStyle = '#b5532f'; ctx.fillRect(mx + u * 1.3, y - u * 2.65, u * 3.8, u * 0.3);
    ctx.fillStyle = '#3a6f97'; ctx.fillRect(mx + u * 2.2, y - u * 1.7, u * 0.9, u * 1.7);
    ctx.fillStyle = '#e8e2d4'; ctx.fillRect(mx + u * 3.6, y - u * 1.9, u * 0.8, u * 0.8);
    // pozo
    ctx.fillStyle = COL.roca2; ctx.fillRect(mx - u * 0.1, y - u * 0.7, u * 1.1, u * 0.7); ctx.fillStyle = COL.agua; ctx.fillRect(mx + u * 0.05, y - u * 0.7, u * 0.8, u * 0.12);
    ctx.strokeStyle = '#3a2a1c'; ctx.lineWidth = Math.max(2, u * 0.08); ctx.beginPath(); ctx.moveTo(mx, y - u * 0.7); ctx.lineTo(mx, y - u * 1.6); ctx.lineTo(mx + u * 0.9, y - u * 1.6); ctx.lineTo(mx + u * 0.9, y - u * 0.7); ctx.stroke();
  }
}

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
  for (const e of s.ev) evento(e);
  s.ev.length = 0;
  if (s.fase === 'reaparece') RUN.reapT = s.rt;
  if (RUN.golpe > 0) RUN.golpe = Math.max(0, RUN.golpe - 1 / 21);
  RUN.fase += Math.abs(s.vx) * M.DT * 3.2;
  RUN.t += M.DT;
  RUN.fx = RUN.fx.filter(f => (f.v += 1) < f.n);
  if ((s.fase === 'meta' || s.fase === 'fallo') && !RUN.tFin) RUN.tFin = performance.now();
}
function evento(e) {
  const s = RUN.s;
  if (e.t === 'salto') Sound.play('salto');
  else if (e.t === 'aterriza') { Sound.play('aterriza'); RUN.fx.push({ k: 'polvo', x: s.x, y: s.y, v: 0, n: 18 }); }
  else if (e.t === 'dano') {
    Sound.play('golpe'); vibrate(40); RUN.golpe = 1; RUN.fx.push({ k: 'texto', x: s.x, y: s.y + 2.2, v: 0, n: 60, txt: '−' + e.cantidad }); for (let i = 0; i < 6; i++) RUN.fx.push({ k: 'gota', x: s.x, y: s.y + 1.7, v: 0, n: 40, vx: (i - 2.5) * 0.9, vy: 3 + (i % 3) });
    if (e.resto > 0 && e.resto < 30 && !RUN.avisado) { RUN.avisado = true; Sound.play('aviso'); }
  } else if (e.t === 'caida') { Sound.play('caida'); vibrate(60); RUN.fx.push({ k: 'texto', x: s.x, y: RUN.L.world.kill_y + 3, v: 0, n: 70, txt: '−' + e.cantidad }); }
  else if (e.t === 'control') { Sound.play('control'); const c = RUN.L.cps.find(q => q.id === e.id); if (c) c.alcanzado = true; RUN.fx.push({ k: 'texto', x: s.x, y: s.y + 2.4, v: 0, n: 70, txt: '⚑ Punto de control' }); }
  else if (e.t === 'meta') Sound.play('exito');
  else if (e.t === 'fallo') Sound.play('fallo');
  else if (e.t === 'ruta') RUN.rutaVista = e.id;
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
      if ((s.fase === 'meta' || s.fase === 'fallo') && RUN.tFin && !RUN.overlay && performance.now() - RUN.tFin > (s.fase === 'meta' ? 900 : 700) / Math.max(1, turbo() > 1 ? 4 : 1)) terminar();
    }
    if (RUN.on) RUN.raf = requestAnimationFrame(bucle);
  };
  RUN.raf = requestAnimationFrame(bucle);
}
function ajustaCanvas() {
  const cv = RUN.cv; if (!cv) return;
  const r = cv.parentNode.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  const w = Math.max(160, Math.round(r.width * dpr)), h = Math.max(120, Math.round(r.height * dpr));
  if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
  const asp = w / h, vw = asp >= 1.4 ? 22 : Math.max(15, 22 - (1.4 - asp) * 8);   // ~22 u de ancho; algo menos en vertical para que Martín se vea mayor
  RUN.u = Math.min(w / vw, h / 10);
}
function dibujar(dt) {
  const cv = RUN.cv, ctx = RUN.ctx, s = RUN.s, L = RUN.L; if (!cv || !ctx) return;
  ajustaCanvas();
  const W = cv.width, H = cv.height, u = RUN.u, vw = W / u, vh = H / u;
  // cámara: Martín al ~35 % del ancho con un poco de anticipación; vertical suavizado con zona muerta
  const k = 1 - Math.exp(-(dt || 16) / 1000 * 5);
  let objX = s.x - vw * 0.35 + Math.max(-1, Math.min(1, s.vx / 4)) * 1.4;
  objX = Math.max(L.world.min_x - 0.5, Math.min(L.world.max_x - vw + 0.5, objX));
  const piso = s.fase === 'reaparece' ? s.ry : s.y;
  const idealY = piso - vh * (W < H ? 0.24 : 0.32);
  if (RUN.camInit !== RUN.idx + ':' + RUN.modo + ':' + RUN.intento) { RUN.camInit = RUN.idx + ':' + RUN.modo + ':' + RUN.intento; RUN.cam.x = objX; RUN.cam.y = idealY; }
  RUN.cam.x += (objX - RUN.cam.x) * Math.min(1, k * 2.4);
  const dz = vh * 0.12; if (idealY - RUN.cam.y > dz) RUN.cam.y += (idealY - dz - RUN.cam.y) * k; else if (RUN.cam.y - idealY > dz) RUN.cam.y += (idealY + dz - RUN.cam.y) * k;
  dibujaEscena(ctx, W, H, u, RUN.cam, L, RUN.esc, RUN.t, RUN.fx);
  const px = (s.x - RUN.cam.x) * u, py = H - (s.y - RUN.cam.y) * u;
  // personaje
  if (s.fase !== 'reaparece' || s.rt < 24) {
    let anim = 'idle';
    if (s.fase === 'meta') anim = 'gana'; else if (!s.suelo) anim = s.vy > 0 ? 'salta' : 'cae'; else if (Math.abs(s.vx) > 0.3) anim = 'corre';
    const parpadeo = s.fase === 'reaparece' ? 0.4 + 0.6 * ((24 - s.rt) / 24) : (s.frio > 0 && s.fase === 'jugando' && Math.floor(s.frio / 3) % 2 === 0 ? 0.55 : 1);
    dibujaMartin(ctx, u, px, py, { dir: s.cara, fase: RUN.fase, anim, agua: s.agua, golpe: RUN.golpe, t: RUN.t, alpha: parpadeo });
  }
  if (debugCaja) { ctx.strokeStyle = '#ff0'; ctx.lineWidth = 2; ctx.strokeRect(px - M.HW * u, py - M.H * u, M.W * u, M.H * u); ctx.fillStyle = '#f00'; ctx.fillRect(px - 2, py - 2, 4, 4); }
  // partículas
  for (const f of RUN.fx) {
    const q = f.v / f.n, x = (f.x - RUN.cam.x) * u, y = H - (f.y - RUN.cam.y) * u;
    if (f.k === 'polvo') { ctx.fillStyle = 'rgba(224,185,120,' + (0.5 * (1 - q)) + ')'; ctx.beginPath(); ctx.arc(x - u * 0.3, y, u * (0.12 + q * 0.25), 0, 7); ctx.arc(x + u * 0.3, y, u * (0.12 + q * 0.25), 0, 7); ctx.fill(); }
    else if (f.k === 'gota') { ctx.fillStyle = 'rgba(58,167,232,' + (1 - q) + ')'; const tt = f.v / 60; ctx.beginPath(); ctx.arc(x + f.vx * tt * u, y - (f.vy * tt - 6 * tt * tt) * u, u * 0.07, 0, 7); ctx.fill(); }
    else if (f.k === 'texto') { ctx.fillStyle = 'rgba(255,255,255,' + (1 - q) + ')'; ctx.strokeStyle = 'rgba(0,0,0,' + (1 - q) + ')'; ctx.lineWidth = 3; ctx.font = '800 ' + Math.round(u * 0.8) + 'px system-ui,sans-serif'; ctx.textAlign = 'center'; const yy = y - q * u * 1.2; ctx.strokeText(f.txt, x, yy); ctx.fillText(f.txt, x, yy); ctx.textAlign = 'left'; }
  }
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
  RUN.L = n; RUN.esc = RUN.esc && RUN.esc.id === n.level_id ? RUN.esc : Object.assign(preparaEscena(n), { id: n.level_id });
  for (const c of n.cps) c.alcanzado = false;
  RUN.s = M.nuevo(n, Object.assign({ eventos: true }, RUN.opts));
  RUN.rec = M.grabadora(); RUN.fx = []; RUN.golpe = 0; RUN.t = 0; RUN.fase = 0; RUN.tFin = 0; RUN.overlay = 'listo'; RUN.hint = ''; RUN.avisado = false; RUN.rutaVista = '';
  RUN.nuevo = null; RUN.enviado = null; RUN.intento = (RUN.intento || 0) + 1; RUN.acc = 0;
  RUN.rep = { i: 0, c: 0 }; RUN.replay = Array.isArray(window.MARTIN_REPLAY) ? window.MARTIN_REPLAY : null;
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
  M.empezar(RUN.s); RUN.overlay = ''; soltarTodo(); ponOverlay(); keepAwake();
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
  $('#subtitle').textContent = ' · Mundo Uga';
  const est = totalEstrellas(), tot = NIV.length * 3;
  const sig = NIV.findIndex((n, i) => n.ok && desbloqueado(i) && !progR(i).done);
  let h = `<div class="mp">
    <div class="mp-top"><div class="mp-h"><b>Mundo 1 · Uga</b><span>Aprender el camino y llevar el agua</span></div><div class="mp-est" title="Estrellas">★ ${est}/${tot}</div></div>
    ${sig >= 0 ? `<button class="btn-gold mp-cont" id="mpCont">▶ ${S.archive.some(a => a.mode === 'nivel') ? 'Continuar' : 'Empezar'} · Nivel ${sig + 1}: ${esc(NIV[sig].nivel.name)}</button>` : ''}
    <div id="mpDiario">${diarioHtml()}</div>
    <div class="mp-lv">`;
  NIV.forEach((n, i) => {
    if (!n.ok) { h += `<div class="lv bad"><div class="lv-n">!</div><div class="lv-b"><b>Nivel ${i + 1}</b><span>No se ha podido cargar (${esc(n.error)}).</span></div></div>`; return; }
    const p = progR(i), ab = desbloqueado(i);
    h += `<button class="lv ${ab ? '' : 'cerrado'} ${p.done ? 'hecho' : ''}" data-lv="${i}" ${ab ? '' : 'disabled'}>
      <div class="lv-n">${ab ? i + 1 : '🔒'}</div>
      <div class="lv-b"><b>${esc(n.nivel.name)}</b><span>${ab ? esc(n.nivel.brief) : 'Termina el nivel anterior para abrirlo.'}</span>
        ${p.done ? `<small>⏱ ${fmtT(p.bestMs)} · 💧 ${p.bestAgua}/100</small>` : ''}</div>
      <div class="lv-s" aria-label="${p.stars} de 3 estrellas">${ab ? estrellasTxt(p.stars) : ''}</div></button>`;
  });
  h += `</div>
    <div class="lv proximo"><div class="lv-n">🌋</div><div class="lv-b"><b>Mundo 2 · La Geria</b><span>Viento y cambios de altura. Muy pronto.</span></div></div>
  </div>`;
  $('#app').innerHTML = h;
  document.querySelectorAll('[data-lv]').forEach(b => b.onclick = () => openBriefing(+b.dataset.lv));
  const c = $('#mpCont'); if (c) c.onclick = () => openBriefing(sig);
  enlazarDiario();
  retoCargar(false);
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
          <div class="mg-agua" role="img" aria-label="Agua del cántaro"><span class="mg-ic">💧</span><div class="mg-bar"><i id="mgBar"></i></div><b id="mgAgua">100</b><em id="mgBajo"></em></div></div>
        <div class="mg-der"><div class="mg-t">⏱ <b id="mgTiempo">0:00.0</b></div><button class="mg-pausa" id="mgPausa" aria-label="Pausa">⏸</button></div>
      </div>
      <div class="mg-hint" id="mgHint"></div>
      <div class="mg-ov" id="mgOv"></div>
    </div>
    <div class="mg-pad"><div class="mg-lr"><button class="mg-b" id="mgL" aria-label="Izquierda">◀</button><button class="mg-b" id="mgR" aria-label="Derecha">▶</button></div><button class="mg-b mg-j" id="mgJ" aria-label="Saltar">⬆</button></div>
  </div>`;
  RUN.cv = $('#mgCv'); RUN.ctx = RUN.cv.getContext('2d'); RUN.camInit = '';
  enlazarControles();
  $('#mgPausa').onclick = () => { if (RUN.s.fase === 'jugando') pausar(); else if (RUN.overlay === 'pausa') reanudar(); };
  ponOverlay(); startLoop();
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
    ov.innerHTML = `<div class="ov-c"><div class="ov-t">💧 Misión fallida</div><div class="ov-s">${esc(CAUSAS[s.causa] || '')}</div>
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
      ${RUN.modo === 'diario' ? `<div class="ov-env" id="ovEnv">${envioTxt()}</div>` : ''}
      <button class="btn-gold ov-go" id="ovSig">${RUN.modo === 'nivel' ? (sigOk ? 'Siguiente nivel ›' : 'Volver al mapa') : 'Volver al mapa'}</button>
      <div class="ov-row"><button class="btn-ghost" id="ovRei">↻ Repetir</button>${RUN.modo === 'diario' ? '<button class="btn-ghost" id="ovRank">🏆 Ranking</button>' : '<button class="btn-ghost" id="ovMapa">Mapa</button>'}</div></div>`;
    $('#ovSig').onclick = RUN.modo === 'nivel' ? siguiente : salirAlMapa; $('#ovRei').onclick = reintentar;
    const rk = $('#ovRank'); if (rk) rk.onclick = () => openRanking();
    const mp = $('#ovMapa'); if (mp) mp.onclick = salirAlMapa;
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
