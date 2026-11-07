/* Martín: Los Caminos del Volcán — dibujo del escenario y de Martín (IT Canarias)
   © 2026 IT Canarias. Todos los derechos reservados.
   Todo se pinta con código (sin imágenes). Solo dibuja: las reglas están en martin.js. */
'use strict';
(function () {
  const COL = {
    lapilli: '#241e1f', lapilli2: '#352c2c', tierra: '#9b4b2f', tierra2: '#c1693d', arena: '#e8c07f', roca: '#4a4143', roca2: '#6b5e5f', rocaOsc: '#2b2527',
    repisa: '#8c7968', repisa2: '#b3a08c', abismo: '#120d0e', camello: '#c99a5b', camello2: '#e8c690', camelloOsc: '#8a6234', manta: '#b3402a', manta2: '#f0d9a8',
    agua: '#3aa7e8', agua2: '#9ad6ff', cantaro: '#c0703f', cantaro2: '#8a4a28', verde: '#4f8a43', verde2: '#7aa94f', blanco: '#f4efe6'
  };
  const TAU = Math.PI * 2;
  const hash = n => { n = Math.imul(n ^ (n >>> 15), 0x2c1b3c6d); n = Math.imul(n ^ (n >>> 12), 0x297a2d39); return ((n ^ (n >>> 15)) >>> 0) / 4294967296; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* Temas por nivel: hora del día y ambiente */
  const TEMAS = [
    { cielo: ['#2a6fb8', '#5fa4d8', '#a9d3ea', '#f7e2b8'], sol: [0.78, 0.2], solC: '#fff3c4', haz: 0.10, lejos: '#9aa3c4', lejos2: '#7f86a8', med: '#6f5a63', geria: '#2a2223', tinte: 'rgba(255,230,170,0.06)', nubes: 0.8 },
    { cielo: ['#1f64b0', '#4f9ad6', '#9ccbea', '#f3e6c4'], sol: [0.5, 0.12], solC: '#fffbe0', haz: 0.05, lejos: '#a5b0cf', lejos2: '#8a94b4', med: '#74606a', geria: '#2c2425', tinte: 'rgba(255,255,255,0.03)', nubes: 1 },
    { cielo: ['#3a73b5', '#7fa9d2', '#e8cfa6', '#f6b982'], sol: [0.84, 0.3], solC: '#ffe0a0', haz: 0.14, lejos: '#a597b5', lejos2: '#8a7c9e', med: '#6b525a', geria: '#2a2022', tinte: 'rgba(255,170,90,0.10)', nubes: 0.9 },
    { cielo: ['#43508f', '#8a74a8', '#e5a28f', '#f8c47a'], sol: [0.8, 0.38], solC: '#ffd0a0', haz: 0.18, lejos: '#9a7ea0', lejos2: '#7d6488', med: '#5e4552', geria: '#241b20', tinte: 'rgba(255,130,100,0.12)', nubes: 0.9 },
    { cielo: ['#4a5663', '#7d8794', '#b0b3b6', '#d9c6a8'], sol: [0.7, 0.2], solC: '#f0e8d8', haz: 0.03, lejos: '#8e9199', lejos2: '#767a84', med: '#5f5558', geria: '#262021', tinte: 'rgba(120,130,150,0.12)', nubes: 1.3 },
    { cielo: ['#2e2f6e', '#a2506b', '#f08a5a', '#ffd27a'], sol: [0.76, 0.42], solC: '#ffe9a8', haz: 0.22, lejos: '#8a5f78', lejos2: '#6d4a64', med: '#4d3640', geria: '#1f171b', tinte: 'rgba(255,110,60,0.14)', nubes: 0.8 }
  ];

  /* ---- Texturas (se crean una vez) ---- */
  let TEX = null;
  function texturas() {
    if (TEX) return TEX;
    TEX = {};
    try {
      const mk = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); return c; };
      TEX.lapilli = mk(192, 192, (g, w, h) => {
        g.fillStyle = '#2a2122'; g.fillRect(0, 0, w, h);
        for (let i = 0; i < 520; i++) { const x = hash(i * 3) * w, y = hash(i * 3 + 1) * h, r = 0.8 + hash(i * 3 + 2) * 2.4, l = hash(i * 7); g.fillStyle = l < 0.5 ? 'rgba(10,6,7,.55)' : l < 0.85 ? 'rgba(88,70,66,.35)' : 'rgba(168,92,60,.30)'; g.beginPath(); g.ellipse(x, y, r * 1.3, r, hash(i) * 3, 0, TAU); g.fill(); }
      });
      TEX.tierra = mk(128, 64, (g, w, h) => {
        g.fillStyle = '#a5532f'; g.fillRect(0, 0, w, h);
        for (let i = 0; i < 160; i++) { const x = hash(i * 5 + 1) * w, y = hash(i * 5 + 2) * h; g.fillStyle = hash(i * 5 + 3) < 0.5 ? 'rgba(255,190,120,.18)' : 'rgba(60,20,10,.22)'; g.fillRect(x, y, 1 + hash(i) * 3, 1 + hash(i + 9) * 2); }
      });
    } catch (e) { TEX = {}; }
    return TEX;
  }
  function relleno(ctx, tex, ox, oy, fallback) {
    if (!tex) return fallback;
    const p = ctx.createPattern(tex, 'repeat');
    try { if (p && p.setTransform) p.setTransform(new DOMMatrix().translate(ox, oy)); } catch (e) {}
    return p || fallback;
  }

  /* ---- Preparación de lo que no cambia ---- */
  function preparaEscena(L, idx) {
    const sc = { rocas: [], deco: [], huecos: [], tema: (idx || 0) % TEMAS.length };
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
    let k = 0;
    for (const g of L.solids) {
      if (g.kind !== 'ground' || g.bot > -1e8) continue;
      for (let x = g.x0 + 1.6; x < g.x1 - 1.6; x += 1.9) {
        const h = hash(Math.floor(x * 10) + k * 977);
        if (h < 0.62) {
          const choque = L.solids.some(r => r.kind === 'rock' && r.x0 < x + 1.4 && r.x1 > x - 1.4 && Math.abs(r.top - g.top) < 3);
          const cerca = (L.obstacles || []).some(o => o.kind === 'gap' && o.x0 < x + 1.3 && o.x1 > x - 1.3);
          if (!choque && !cerca) {
            const q = hash(Math.floor(x * 13) + k * 31);
            sc.deco.push({ x: x + h * 1.0, y: g.top, t: q < 0.22 ? 'tunera' : q < 0.4 ? 'cardon' : q < 0.62 ? 'pita' : q < 0.8 ? 'piedra' : q < 0.88 ? 'lagarto' : 'flor', s: 0.75 + h * 1.0, h: q });
          }
        }
      }
      k++;
    }
    return sc;
  }

  /* ---- utilidades de trazo ---- */
  function esfera(ctx, x, y, r, c0, c1) { const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r); g.addColorStop(0, c0); g.addColorStop(1, c1); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
  function suelo(L, x, y) { let best = L.world.kill_y; for (const s of L.solids) if (s.kind !== 'oneway' && s.x0 <= x && s.x1 >= x && s.top <= y + 0.05 && s.top > best) best = s.top; return best; }

  /* ================== MARTÍN ================== */
  const PEL = { luz: '#dcb67c', claro: '#c79a5e', medio: '#aa7b45', sombra: '#86592f', osc: '#5a3a1c', borde: '#3a2312', hocico: '#e6cfa0' };

  /* Trazo cónico (muslo, caña, cuello): primero el contorno, luego el relleno, para que no se vean costuras */
  function conico(ctx, pts, ws, fill, borde, lw) {
    for (const pasada of [0, 1]) {
      ctx.fillStyle = pasada ? fill : borde;
      for (let i = 0; i < pts.length - 1; i++) {
        const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], e = pasada ? 0 : lw, w0 = ws[i] + e, w1 = ws[i + 1] + e;
        const dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
        ctx.beginPath(); ctx.moveTo(x0 + nx * w0 / 2, y0 + ny * w0 / 2); ctx.lineTo(x1 + nx * w1 / 2, y1 + ny * w1 / 2); ctx.lineTo(x1 - nx * w1 / 2, y1 - ny * w1 / 2); ctx.lineTo(x0 - nx * w0 / 2, y0 - ny * w0 / 2); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.arc(x1, y1, w1 / 2, 0, TAU); ctx.fill();
        if (i === 0) { ctx.beginPath(); ctx.arc(x0, y0, w0 / 2, 0, TAU); ctx.fill(); }
      }
    }
  }

  /* Pata de dromedario: cadera → rodilla (almohadilla oscura) → caña fina → pezuña ancha. sg = lado en que dobla la rodilla */
  function pata(ctx, hx, hy, fx, fy, sg, cerca, anchoMuslo) {
    const a = 0.47, b = 0.45, dx = fx - hx, dy = fy - hy, dd = Math.hypot(dx, dy) || 1, d = Math.min(dd, a + b - 0.004);
    const ux = dx / dd, uy = dy / dd, p = (d * d + a * a - b * b) / (2 * d), h = Math.sqrt(Math.max(0, a * a - p * p));
    const kx = hx + ux * p - uy * h * sg, ky = hy + uy * p + ux * h * sg, ex = hx + ux * d, ey = hy + uy * d;
    const col = cerca ? PEL.medio : PEL.sombra;
    conico(ctx, [[hx, hy], [kx, ky]], [anchoMuslo, 0.15], col, PEL.borde, 0.045);
    conico(ctx, [[kx, ky], [(kx + ex) / 2, (ky + ey) / 2], [ex, ey + 0.08]], [0.14, 0.1, 0.09], col, PEL.borde, 0.045);
    if (cerca) { ctx.fillStyle = 'rgba(255,235,190,.28)'; ctx.beginPath(); ctx.ellipse(hx - 0.02, hy - 0.12, anchoMuslo * 0.2, 0.15, 0.1, 0, TAU); ctx.fill(); }
    ctx.fillStyle = PEL.osc; ctx.beginPath(); ctx.ellipse(kx + 0.02 * sg, ky, 0.075, 0.06, 0, 0, TAU); ctx.fill();
    // pezuña (almohadilla ancha del camello)
    ctx.fillStyle = '#3b2616'; ctx.strokeStyle = PEL.borde; ctx.lineWidth = 0.03;
    ctx.beginPath(); ctx.moveTo(ex - 0.1, ey + 0.09); ctx.quadraticCurveTo(ex - 0.13, ey - 0.02, ex - 0.06, ey - 0.05); ctx.lineTo(ex + 0.14, ey - 0.05); ctx.quadraticCurveTo(ex + 0.19, ey - 0.02, ex + 0.12, ey + 0.09); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#d9c3a0'; ctx.fillRect(ex - 0.08, ey + 0.045, 0.2, 0.03);
  }

  function cabeza(ctx, T, st) {
    // origen = centro del cráneo; mira hacia +x
    const g = ctx.createLinearGradient(0, 0.14, 0, -0.2); g.addColorStop(0, PEL.luz); g.addColorStop(0.5, PEL.claro); g.addColorStop(1, PEL.medio);
    ctx.fillStyle = g; ctx.strokeStyle = PEL.borde; ctx.lineWidth = 0.04; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(-0.17, 0.08);
    ctx.bezierCurveTo(-0.1, 0.19, 0.05, 0.19, 0.17, 0.12);     // frente
    ctx.bezierCurveTo(0.27, 0.07, 0.34, 0.03, 0.4, 0.0);       // caballete
    ctx.bezierCurveTo(0.46, -0.03, 0.48, -0.14, 0.4, -0.18);   // hocico
    ctx.bezierCurveTo(0.34, -0.24, 0.2, -0.24, 0.1, -0.2);     // labio y mentón
    ctx.bezierCurveTo(0.0, -0.17, -0.1, -0.14, -0.18, -0.05); ctx.closePath(); ctx.fill(); ctx.stroke();
    // hocico claro y mejilla
    ctx.fillStyle = PEL.hocico; ctx.beginPath(); ctx.ellipse(0.33, -0.11, 0.11, 0.09, -0.2, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(120,70,30,.18)'; ctx.beginPath(); ctx.ellipse(-0.02, -0.07, 0.13, 0.06, 0.2, 0, TAU); ctx.fill();
    // ventana de la nariz y boca sonriente
    ctx.fillStyle = '#4a2e17'; ctx.beginPath(); ctx.ellipse(0.4, -0.045, 0.016, 0.026, 0.5, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#4a2e17'; ctx.lineWidth = 0.024; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0.41, -0.115); ctx.quadraticCurveTo(0.27, -0.15, 0.13, -0.115); ctx.quadraticCurveTo(0.1, -0.108, 0.09, -0.09); ctx.stroke();
    // cabezada de cuerda natural
    ctx.strokeStyle = '#e4cf9a'; ctx.lineWidth = 0.036; ctx.beginPath(); ctx.moveTo(0.24, 0.07); ctx.quadraticCurveTo(0.27, -0.06, 0.25, -0.19); ctx.moveTo(-0.02, 0.17); ctx.quadraticCurveTo(0.08, -0.04, 0.04, -0.17); ctx.stroke();
    ctx.strokeStyle = '#8a6a3a'; ctx.lineWidth = 0.014; ctx.beginPath(); ctx.moveTo(0.24, 0.07); ctx.quadraticCurveTo(0.27, -0.06, 0.25, -0.19); ctx.stroke();
    // ramal de arrastre con borla
    const rs = Math.sin(T * 2.3) * 0.03; ctx.strokeStyle = '#e4cf9a'; ctx.lineWidth = 0.03; ctx.beginPath(); ctx.moveTo(0.25, -0.2); ctx.quadraticCurveTo(0.2 + rs, -0.45, 0.28 + rs * 2, -0.62); ctx.stroke(); ctx.fillStyle = '#b3402a'; ctx.beginPath(); ctx.ellipse(0.28 + rs * 2, -0.67, 0.035, 0.055, rs, 0, TAU); ctx.fill();
    // oreja
    const fl = Math.sin(T * 2.7) > 0.93 ? 0.35 : 0;
    ctx.save(); ctx.translate(-0.1, 0.14); ctx.rotate(0.55 + fl); ctx.fillStyle = PEL.medio; ctx.strokeStyle = PEL.borde; ctx.lineWidth = 0.03;
    ctx.beginPath(); ctx.moveTo(-0.04, 0); ctx.quadraticCurveTo(-0.05, 0.13, 0.0, 0.2); ctx.quadraticCurveTo(0.06, 0.13, 0.05, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#e8a6a0'; ctx.beginPath(); ctx.ellipse(0.0, 0.07, 0.022, 0.06, 0, 0, TAU); ctx.fill(); ctx.restore();
    // flequillo
    ctx.fillStyle = PEL.osc; ctx.beginPath(); ctx.moveTo(-0.05, 0.16); ctx.quadraticCurveTo(0.0, 0.27, 0.07, 0.2); ctx.quadraticCurveTo(0.03, 0.2, 0.06, 0.15); ctx.closePath(); ctx.fill();
    // ojo grande y expresivo
    const parp = (Math.sin(T * 0.9) > 0.985) || st.golpe > 0 || st.anim === 'cae';
    if (parp) { ctx.strokeStyle = '#2a1a0e'; ctx.lineWidth = 0.03; ctx.beginPath(); ctx.arc(0.1, 0.045, 0.045, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }
    else {
      ctx.fillStyle = '#fff8ea'; ctx.beginPath(); ctx.ellipse(0.1, 0.045, 0.058, 0.05, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = PEL.borde; ctx.lineWidth = 0.02; ctx.stroke();
      ctx.fillStyle = '#3a2412'; ctx.beginPath(); ctx.arc(0.118, 0.04, 0.037, 0, TAU); ctx.fill(); ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(0.122, 0.04, 0.02, 0, TAU); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0.132, 0.055, 0.013, 0, TAU); ctx.arc(0.108, 0.026, 0.007, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#2a1a0e'; ctx.lineWidth = 0.02; ctx.beginPath(); for (const [x0, y0, x1, y1] of [[0.07, 0.085, 0.045, 0.125], [0.1, 0.095, 0.09, 0.14], [0.135, 0.09, 0.15, 0.13]]) { ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); } ctx.stroke();
      ctx.fillStyle = PEL.medio; ctx.beginPath(); ctx.moveTo(0.04, 0.062); ctx.quadraticCurveTo(0.1, 0.11, 0.16, 0.062); ctx.quadraticCurveTo(0.1, 0.085, 0.04, 0.062); ctx.fill();
    }
  }

  function dibujaMartin(ctx, u, px, py, st) {
    // (px,py) = pies; u = px por unidad. st: {dir, fase, anim, agua, golpe, t, alpha}
    ctx.save(); ctx.translate(px, py); ctx.scale(st.dir < 0 ? -u : u, -u);
    ctx.globalAlpha = st.alpha == null ? 1 : st.alpha;
    const T = st.t || 0, ph = st.fase, anim = st.anim, corre = anim === 'corre';
    const bob = anim === 'idle' ? Math.sin(T * 2.2) * 0.018 : (corre ? Math.abs(Math.sin(ph)) * 0.06 : 0);
    const hop = anim === 'gana' ? Math.abs(Math.sin(T * 6)) * 0.35 : 0;
    const sq = st.golpe > 0 ? 1 - st.golpe * 0.12 : 1, f = clamp(st.agua / 100, 0, 1);
    const cabeceo = anim === 'salta' ? 0.1 : anim === 'cae' ? -0.1 : 0;
    ctx.translate(0, hop); ctx.scale(1 + (1 - sq) * 0.6, sq);
    const hipY = 0.92 + bob, KX = 1.3;
    const objetivo = (hx, fase, delante, cerca) => {
      if (anim === 'salta') return [hx + (delante ? 0.42 : -0.3), delante ? 0.66 : 0.34];
      if (anim === 'cae') return [hx + (delante ? 0.26 : -0.28), 0.1];
      if (corre) { const s = Math.sin(fase), c = Math.cos(fase); return [hx + s * 0.4, Math.max(0, c) * 0.3]; }
      return [hx, 0];
    };
    const fN = ph, fL = ph + Math.PI;                       // paso de camello (dos patas del mismo lado a la vez)
    const patas = [[-0.5, fL, false, false, 1, 0.2], [0.44, fL, true, false, -1, 0.18], [-0.46, fN, false, true, 1, 0.22], [0.52, fN, true, true, -1, 0.19]];
    for (let i = 0; i < 2; i++) { const [hx, fa, de, ce, sg, an] = patas[i]; const [fx, fy] = objetivo(hx, fa, de, ce); pata(ctx, hx, hipY, fx, fy, sg, ce, an); }
    ctx.save(); ctx.translate(0, hipY); ctx.rotate(cabeceo); ctx.translate(0, -hipY);
    const B = bob;
    ctx.save(); ctx.scale(KX, 1);
    // cola con borla
    const sw = Math.sin(ph * 0.5 + T * 1.5) * 0.06;
    conico(ctx, [[-0.66, 1.2 + B], [-0.82, 1.1 + B], [-0.86 + sw, 0.88 + B], [-0.8 + sw * 1.5, 0.7 + B]], [0.1, 0.08, 0.07, 0.06], PEL.sombra, PEL.borde, 0.04);
    ctx.fillStyle = PEL.osc; ctx.strokeStyle = PEL.borde; ctx.lineWidth = 0.03; ctx.beginPath(); ctx.ellipse(-0.8 + sw * 1.5, 0.64 + B, 0.065, 0.12, sw, 0, TAU); ctx.fill(); ctx.stroke();
    // cuerpo
    ctx.beginPath(); ctx.moveTo(-0.64, 1.14 + B);
    ctx.bezierCurveTo(-0.52, 1.32 + B, -0.46, 1.64 + B, -0.22, 1.7 + B);
    ctx.bezierCurveTo(0.0, 1.74 + B, 0.02, 1.42 + B, 0.2, 1.36 + B);
    ctx.bezierCurveTo(0.34, 1.34 + B, 0.46, 1.36 + B, 0.54, 1.44 + B);
    ctx.bezierCurveTo(0.76, 1.3 + B, 0.76, 0.98 + B, 0.52, 0.82 + B);
    ctx.bezierCurveTo(0.2, 0.72 + B, -0.3, 0.74 + B, -0.52, 0.86 + B);
    ctx.bezierCurveTo(-0.74, 0.94 + B, -0.8, 1.1 + B, -0.64, 1.14 + B); ctx.closePath();
    let g = ctx.createLinearGradient(0, 1.74 + B, 0, 0.72 + B); g.addColorStop(0, PEL.luz); g.addColorStop(0.35, PEL.claro); g.addColorStop(0.75, PEL.medio); g.addColorStop(1, PEL.sombra);
    ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = PEL.borde; ctx.lineWidth = 0.045; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.save(); ctx.clip();
    ctx.fillStyle = 'rgba(70,35,10,.22)'; ctx.beginPath(); ctx.ellipse(0.0, 0.7 + B, 0.75, 0.2, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,245,215,.4)'; ctx.beginPath(); ctx.ellipse(-0.22, 1.56 + B, 0.2, 0.08, -0.3, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,240,200,.28)'; ctx.beginPath(); ctx.ellipse(0.0, 1.05 + B, 0.55, 0.1, 0.05, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(110,66,28,.4)'; ctx.lineWidth = 0.018; ctx.lineCap = 'round';
    for (let i = 0; i < 16; i++) { const x = -0.6 + (i % 8) * 0.17 + (i > 7 ? 0.08 : 0), y = 0.85 + Math.floor(i / 8) * 0.28 + hash(i) * 0.1; ctx.beginPath(); ctx.moveTo(x, y + B); ctx.lineTo(x - 0.05, y - 0.07 + B); ctx.stroke(); }
    ctx.restore();
    ctx.fillStyle = PEL.osc; ctx.beginPath(); ctx.ellipse(0.52, 0.85 + B, 0.1, 0.07, 0.5, 0, TAU); ctx.fill();   // callo del pecho
    // pelo largo de la joroba y de la pechera
    ctx.fillStyle = PEL.sombra; ctx.strokeStyle = PEL.borde; ctx.lineWidth = 0.025; ctx.lineJoin = 'round';
    [[-0.54, 1.46], [-0.47, 1.58], [-0.38, 1.67], [-0.27, 1.73], [-0.15, 1.74], [-0.04, 1.69], [0.03, 1.58]].forEach(([x, y], i) => { const o = Math.sin(T * 2 + i) * 0.012, dx = (i - 3) * 0.022; ctx.beginPath(); ctx.moveTo(x - 0.05, y + B - 0.03); ctx.quadraticCurveTo(x + dx, y + B + 0.1 + o, x + 0.05, y + B - 0.03); ctx.closePath(); ctx.fill(); });
    ctx.fillStyle = PEL.osc; for (let i = 0; i < 5; i++) { const x = 0.52 + i * 0.03, y = 1.0 - i * 0.04 + B; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 0.1, y - 0.15 + Math.sin(T * 2 + i) * 0.01, x + 0.02, y - 0.2); ctx.lineTo(x - 0.03, y - 0.02); ctx.closePath(); ctx.fill(); }
    ctx.restore();
    // cuello curvo con crin
    const sway = Math.sin(ph * 0.5) * (corre ? 0.05 : 0.01) + Math.sin(T * 1.7) * 0.012, tip = anim === 'salta' ? 0.08 : anim === 'cae' ? -0.1 : 0;
    const N = [[0.46, 1.3 + B], [0.78, 1.4 + B], [0.74, 1.68 + B], [0.86 + sway, 1.92 + B + tip]];
    const cub = q => { const m = 1 - q; return [m * m * m * N[0][0] + 3 * m * m * q * N[1][0] + 3 * m * q * q * N[2][0] + q * q * q * N[3][0], m * m * m * N[0][1] + 3 * m * m * q * N[1][1] + 3 * m * q * q * N[2][1] + q * q * q * N[3][1]]; };
    const pts = [], ws = []; for (let i = 0; i <= 10; i++) { const q = i / 10; pts.push(cub(q)); ws.push(0.46 - q * 0.22); }
    conico(ctx, pts, ws, PEL.claro, PEL.borde, 0.05);
    ctx.strokeStyle = 'rgba(255,240,200,.45)'; ctx.lineWidth = 0.07; ctx.beginPath(); for (let i = 1; i <= 8; i++) { const [x, y] = pts[i]; i === 1 ? ctx.moveTo(x - 0.05, y + 0.04) : ctx.lineTo(x - 0.05, y + 0.04); } ctx.stroke();
    ctx.strokeStyle = PEL.osc; ctx.lineWidth = 0.03; for (let i = 1; i < 10; i++) { const [x, y] = pts[i]; ctx.beginPath(); ctx.moveTo(x - ws[i] * 0.45, y + 0.02); ctx.lineTo(x - ws[i] * 0.45 - 0.09, y - 0.08 + Math.sin(T * 3 + i) * 0.01); ctx.stroke(); }
    // cabeza
    ctx.save(); ctx.translate(pts[10][0] + 0.02, pts[10][1] + 0.03); ctx.rotate(-0.18 - tip * 0.8 + sway); cabeza(ctx, T, st); ctx.restore();
    // manta de lana natural y silla de carga de madera (como las de los camellos de Timanfaya)
    ctx.save(); ctx.scale(KX, 1);
    ctx.beginPath(); ctx.moveTo(-0.5, 1.5 + B); ctx.bezierCurveTo(-0.34, 1.64 + B, -0.04, 1.62 + B, 0.1, 1.34 + B); ctx.lineTo(0.15, 1.0 + B); ctx.lineTo(-0.52, 1.02 + B); ctx.bezierCurveTo(-0.58, 1.18 + B, -0.56, 1.36 + B, -0.5, 1.5 + B); ctx.closePath();
    ctx.fillStyle = '#d9c7a0'; ctx.fill(); ctx.strokeStyle = PEL.borde; ctx.lineWidth = 0.035; ctx.stroke();
    ctx.save(); ctx.clip();
    for (const [yy, c, w] of [[1.38, '#6b4a2b', 0.07], [1.26, '#3d322b', 0.05], [1.17, '#a8402a', 0.03], [1.1, '#6b4a2b', 0.07]]) { ctx.fillStyle = c; ctx.fillRect(-0.7, yy + B, 1.0, w); }
    ctx.restore();
    ctx.strokeStyle = '#d9c7a0'; ctx.lineWidth = 0.028; for (let i = 0; i < 8; i++) { const x = -0.5 + i * 0.08; ctx.beginPath(); ctx.moveTo(x, 1.02 + B); ctx.lineTo(x - 0.01 + Math.sin(ph + i) * 0.012, 0.93 + B); ctx.stroke(); }
    // armazón de madera: dos horcones y travesaño, atados con cuerda
    const madera = '#8d5a2c', vet = 'rgba(40,20,8,.35)';
    conico(ctx, [[-0.55, 1.0 + B], [-0.6, 1.32 + B], [-0.52, 1.6 + B]], [0.09, 0.08, 0.07], madera, PEL.borde, 0.04);
    conico(ctx, [[0.15, 1.0 + B], [0.17, 1.28 + B], [0.1, 1.56 + B]], [0.09, 0.08, 0.07], madera, PEL.borde, 0.04);
    ctx.strokeStyle = vet; ctx.lineWidth = 0.012; ctx.beginPath(); ctx.moveTo(-0.58, 1.1 + B); ctx.lineTo(-0.58, 1.5 + B); ctx.moveTo(0.16, 1.1 + B); ctx.lineTo(0.15, 1.46 + B); ctx.stroke();
    ctx.strokeStyle = '#e4cf9a'; ctx.lineWidth = 0.03; for (const [x, y] of [[-0.53, 1.58], [0.11, 1.54], [-0.59, 1.26], [0.17, 1.24]]) { ctx.beginPath(); ctx.moveTo(x - 0.05, y - 0.03 + B); ctx.lineTo(x + 0.05, y + 0.04 + B); ctx.moveTo(x - 0.05, y + 0.04 + B); ctx.lineTo(x + 0.05, y - 0.03 + B); ctx.stroke(); }
    ctx.restore(); ctx.restore();
    // patas cercanas (por delante del cuerpo)
    ctx.save(); ctx.translate(0, hipY); ctx.rotate(cabeceo * 0.4); ctx.translate(0, -hipY);
    for (let i = 2; i < 4; i++) { const [hx, fa, de, ce, sg, an] = patas[i]; const [fx, fy] = objetivo(hx, fa, de, ce); pata(ctx, hx, hipY, fx, fy, sg, ce, an); }
    ctx.restore();
    // tinaja de barro colgada de la silla con una red de cuerda
    ctx.save(); ctx.translate(0, hipY); ctx.rotate(cabeceo); ctx.translate(0, -hipY);
    const jx = -0.3, jy = 0.84 + B + (anim === 'gana' ? 0.14 : 0) + (corre ? Math.sin(ph * 2) * 0.014 : 0);
    ctx.strokeStyle = '#e4cf9a'; ctx.lineWidth = 0.032; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(jx - 0.12, jy + 0.5); ctx.lineTo(-0.68, 1.58 + B); ctx.moveTo(jx + 0.12, jy + 0.5); ctx.lineTo(0.13, 1.54 + B); ctx.stroke();
    ctx.translate(jx, jy); ctx.scale(0.96, 0.96); ctx.translate(-jx, -jy);
    ctx.strokeStyle = '#6a4424'; ctx.lineWidth = 0.034; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(jx - 0.22, jy + 0.16); ctx.quadraticCurveTo(jx - 0.36, jy - 0.04, jx - 0.1, jy - 0.01); ctx.moveTo(jx + 0.22, jy + 0.16); ctx.quadraticCurveTo(jx + 0.34, jy - 0.03, jx + 0.1, jy - 0.01); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(jx, jy + 0.22, 0.24, 0.29, 0, 0, TAU);
    g = ctx.createRadialGradient(jx - 0.09, jy + 0.34, 0.02, jx, jy + 0.22, 0.34); g.addColorStop(0, '#e89862'); g.addColorStop(0.6, COL.cantaro); g.addColorStop(1, COL.cantaro2); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = '#5e2f17'; ctx.lineWidth = 0.04; ctx.stroke();
    ctx.fillStyle = COL.cantaro2; ctx.beginPath(); ctx.ellipse(jx, jy + 0.52, 0.11, 0.055, 0, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#6a3518'; ctx.beginPath(); ctx.ellipse(jx, jy + 0.55, 0.08, 0.028, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(255,240,200,.9)'; ctx.lineWidth = 0.024; ctx.beginPath(); for (let i = 0; i <= 9; i++) { const x = jx - 0.22 + i * 0.049, y = jy + 0.4 + (i % 2) * 0.04; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
    ctx.fillStyle = '#0d2233'; rr(ctx, jx - 0.08, jy + 0.03, 0.16, 0.3, 0.05); ctx.fill();
    ctx.save(); rr(ctx, jx - 0.08, jy + 0.03, 0.16, 0.3, 0.05); ctx.clip();
    const bajo = f < 0.3, hh = 0.3 * f; ctx.fillStyle = bajo ? '#ffd24a' : COL.agua; ctx.fillRect(jx - 0.1, jy + 0.03 + (0.3 - hh), 0.2, hh + 0.01); ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillRect(jx - 0.1, jy + 0.03 + (0.3 - hh), 0.2, 0.02);
    ctx.restore(); ctx.strokeStyle = 'rgba(255,255,255,.65)'; ctx.lineWidth = 0.016; rr(ctx, jx - 0.08, jy + 0.03, 0.16, 0.3, 0.05); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.38)'; ctx.beginPath(); ctx.ellipse(jx - 0.14, jy + 0.38, 0.03, 0.09, 0.3, 0, TAU); ctx.fill();
    ctx.restore();
    ctx.restore();
  }
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

  /* ================== ESCENARIO ================== */
  function cresta(x, s) { return Math.sin(x * 0.11 + s) * 0.5 + Math.sin(x * 0.27 + s * 2.3) * 0.3 + Math.sin(x * 0.61 + s * 4.1) * 0.12; }

  function capaMontes(ctx, W, H, u, cam, par, base, amp, color, haze, seed) {
    const by = H - (base - cam.y * par) * u, off = cam.x * par;
    ctx.beginPath(); ctx.moveTo(0, H);
    for (let x = 0; x <= W + 12; x += 12) { const wx = x / u + off; ctx.lineTo(x, by - (cresta(wx, seed) * amp + amp) * u); }
    ctx.lineTo(W + 12, H); ctx.closePath();
    const g = ctx.createLinearGradient(0, by - amp * 2 * u, 0, by + u * 1.5); g.addColorStop(0, color); g.addColorStop(1, haze); ctx.fillStyle = g; ctx.fill();
  }

  function volcan(ctx, cx, by, ah, aw, lit, dark, t, humo, seed) {
    // cono con ladera iluminada, cráter y estrías de lapilli
    const topW = aw * 0.13, ty = by - ah;
    ctx.beginPath(); ctx.moveTo(cx - aw, by); ctx.quadraticCurveTo(cx - aw * 0.35, by - ah * 0.5, cx - topW, ty); ctx.lineTo(cx + topW, ty); ctx.quadraticCurveTo(cx + aw * 0.35, by - ah * 0.5, cx + aw, by); ctx.closePath(); ctx.fillStyle = dark; ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx - aw, by); ctx.quadraticCurveTo(cx - aw * 0.35, by - ah * 0.5, cx - topW, ty); ctx.lineTo(cx + topW * 0.2, ty); ctx.quadraticCurveTo(cx + aw * 0.02, by - ah * 0.55, cx + aw * 0.1, by); ctx.closePath(); ctx.fillStyle = lit; ctx.fill();
    ctx.fillStyle = 'rgba(20,8,6,.5)'; ctx.beginPath(); ctx.ellipse(cx, ty, topW * 1.02, Math.max(2, ah * 0.035), 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(30,12,8,.22)'; ctx.lineWidth = Math.max(1, aw * 0.012);
    for (let i = 0; i < 6; i++) { const q = hash(seed + i), x0 = cx + (q - 0.5) * topW * 1.6, x1 = cx + (q - 0.5) * aw * 1.7; ctx.beginPath(); ctx.moveTo(x0, ty + ah * 0.05); ctx.lineTo(x1, by); ctx.stroke(); }
    if (humo) {
      const gl = ctx.createRadialGradient(cx, ty, 0, cx, ty, topW * 3.2); gl.addColorStop(0, 'rgba(255,140,60,' + (0.45 + Math.sin(t * 2 + seed) * 0.1) + ')'); gl.addColorStop(1, 'rgba(255,90,30,0)'); ctx.fillStyle = gl; ctx.fillRect(cx - topW * 3.2, ty - topW * 3.2, topW * 6.4, topW * 6.4);
      ctx.fillStyle = 'rgba(255,170,80,.9)';
      for (let i = 0; i < 5; i++) { const q = ((t * 0.35 + i * 0.21 + hash(seed + i)) % 1); ctx.beginPath(); ctx.arc(cx + (hash(seed + i * 3) - 0.5) * topW * 2.4 * q * 2, ty - Math.sin(q * Math.PI) * ah * 0.35, Math.max(1, aw * 0.004) * (1 - q * 0.6), 0, TAU); ctx.fill(); }
      for (let i = 0; i < 7; i++) { const q = ((t * 0.06 + i / 7) % 1), y = ty - q * ah * 1.1, x = cx + q * aw * 0.9 + Math.sin(q * 6 + i) * aw * 0.08, r = topW * (0.35 + q * 1.1); ctx.fillStyle = 'rgba(130,118,122,' + (0.28 * (1 - q)) + ')'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
    }
  }

  function casa(ctx, x, y, w, h, col) {
    ctx.fillStyle = col || '#f4efe6'; ctx.fillRect(x, y - h, w, h);
    ctx.fillStyle = 'rgba(80,60,60,.22)'; ctx.fillRect(x + w * 0.72, y - h, w * 0.28, h);
    ctx.fillStyle = '#c9c2b5'; ctx.fillRect(x - w * 0.04, y - h - h * 0.1, w * 1.08, h * 0.12);
    ctx.fillStyle = '#2f7a55'; ctx.fillRect(x + w * 0.16, y - h * 0.6, w * 0.22, h * 0.6);
    ctx.fillStyle = '#3a6f97'; ctx.fillRect(x + w * 0.52, y - h * 0.72, w * 0.18, h * 0.26);
  }
  function molino(ctx, x, y, s, t) {
    ctx.fillStyle = '#f1ebdf'; ctx.beginPath(); ctx.moveTo(x - s * 0.5, y); ctx.lineTo(x - s * 0.32, y - s * 1.5); ctx.lineTo(x + s * 0.32, y - s * 1.5); ctx.lineTo(x + s * 0.5, y); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(80,60,60,.2)'; ctx.beginPath(); ctx.moveTo(x + s * 0.1, y); ctx.lineTo(x + s * 0.1, y - s * 1.5); ctx.lineTo(x + s * 0.32, y - s * 1.5); ctx.lineTo(x + s * 0.5, y); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#7a3d2c'; ctx.beginPath(); ctx.moveTo(x - s * 0.4, y - s * 1.5); ctx.lineTo(x, y - s * 2.05); ctx.lineTo(x + s * 0.4, y - s * 1.5); ctx.closePath(); ctx.fill();
    ctx.save(); ctx.translate(x, y - s * 1.55); ctx.rotate(t * 0.5); ctx.strokeStyle = '#5a4030'; ctx.lineWidth = Math.max(1, s * 0.06);
    for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 2); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -s * 1.1); ctx.stroke(); ctx.fillStyle = 'rgba(255,248,235,.9)'; ctx.fillRect(-s * 0.06, -s * 1.1, s * 0.22, s * 0.7); }
    ctx.restore();
  }
  function palmera(ctx, x, y, s, t, seed) {
    ctx.strokeStyle = '#6b4a30'; ctx.lineWidth = Math.max(2, s * 0.09); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + s * 0.15, y - s * 0.7, x + s * 0.05, y - s * 1.4); ctx.stroke();
    const tx = x + s * 0.05, ty = y - s * 1.4; ctx.strokeStyle = '#3f7a3a'; ctx.lineWidth = Math.max(1.5, s * 0.07);
    for (let i = 0; i < 7; i++) { const a = -Math.PI * 0.95 + i * (Math.PI * 0.95 / 3) * 0.99 + Math.sin(t * 0.8 + seed + i) * 0.05; const l = s * (0.7 + hash(seed + i) * 0.2); ctx.beginPath(); ctx.moveTo(tx, ty); ctx.quadraticCurveTo(tx + Math.cos(a) * l * 0.6, ty + Math.sin(a) * l * 0.6 - l * 0.3, tx + Math.cos(a) * l, ty + Math.sin(a) * l * 0.6 + l * 0.28); ctx.stroke(); }
  }

  function dibujaFondo(ctx, W, H, u, cam, TM, t) {
    const sol = [W * TM.sol[0], H * TM.sol[1]];
    let g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, TM.cielo[0]); g.addColorStop(0.38, TM.cielo[1]); g.addColorStop(0.7, TM.cielo[2]); g.addColorStop(1, TM.cielo[3]); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // sol con halo y rayos suaves
    g = ctx.createRadialGradient(sol[0], sol[1], u * 0.2, sol[0], sol[1], u * 9); g.addColorStop(0, 'rgba(255,245,210,.85)'); g.addColorStop(0.15, 'rgba(255,230,170,.35)'); g.addColorStop(1, 'rgba(255,220,160,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = TM.solC; ctx.beginPath(); ctx.arc(sol[0], sol[1], u * 0.85, 0, TAU); ctx.fill();
    if (TM.haz > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 3; i++) { const a = 2.15 + i * 0.4 + Math.sin(t * 0.15 + i) * 0.04, l = Math.max(W, H) * 1.3; const gg = ctx.createLinearGradient(sol[0], sol[1], sol[0] + Math.cos(a) * l, sol[1] + Math.sin(a) * l); gg.addColorStop(0, 'rgba(255,240,200,' + TM.haz * 0.45 + ')'); gg.addColorStop(1, 'rgba(255,240,200,0)'); ctx.fillStyle = gg; ctx.beginPath(); ctx.moveTo(sol[0], sol[1]); ctx.lineTo(sol[0] + Math.cos(a - 0.05) * l, sol[1] + Math.sin(a - 0.09) * l); ctx.lineTo(sol[0] + Math.cos(a + 0.09) * l, sol[1] + Math.sin(a + 0.09) * l); ctx.fill(); } ctx.restore(); }
    // nubes
    for (let i = 0; i < 7; i++) {
      const per = 70, x = ((i * 11.3 + t * (0.18 + (i % 3) * 0.05) - cam.x * 0.05) % per + per) % per - 10, y = H * (0.08 + 0.075 * ((i * 5) % 5)), s = u * (0.8 + (i % 3) * 0.35) * TM.nubes;
      ctx.save(); ctx.translate(x * u, y);
      for (const [dx, dy, r] of [[0, 0, 1.0], [1.1, -0.35, 0.85], [2.1, -0.05, 1.0], [-1.0, 0.1, 0.7], [3.0, 0.1, 0.65]]) { const cg = ctx.createRadialGradient(dx * s, (dy - 0.25) * s, 0, dx * s, dy * s, r * s * 1.1); cg.addColorStop(0, 'rgba(255,255,255,.85)'); cg.addColorStop(1, 'rgba(235,232,245,0)'); ctx.fillStyle = cg; ctx.beginPath(); ctx.ellipse(dx * s, dy * s, r * s * 1.2, r * s * 0.7, 0, 0, TAU); ctx.fill(); }
      ctx.restore();
    }
    // aves lejanas
    ctx.strokeStyle = 'rgba(40,30,40,.55)'; ctx.lineWidth = Math.max(1, u * 0.04);
    for (let i = 0; i < 3; i++) { const x = (((t * 1.2 + i * 9) % 40) - 4) * u - cam.x * 0.1 * u % (W), y = H * (0.2 + i * 0.05) + Math.sin(t * 2 + i) * u * 0.2, a = Math.sin(t * 6 + i) * 0.3; if (x > -20 && x < W + 20) { ctx.beginPath(); ctx.moveTo(x - u * 0.3, y + a * u * 0.3); ctx.quadraticCurveTo(x - u * 0.12, y - u * 0.12 * (1 + a), x, y); ctx.quadraticCurveTo(x + u * 0.12, y - u * 0.12 * (1 - a), x + u * 0.3, y + a * u * 0.3); ctx.stroke(); } }
    // montañas y volcanes
    capaMontes(ctx, W, H, u, cam, 0.04, 0.7, 2.3, TM.lejos, TM.cielo[3], 1.7);
    // volcanes grandes (con humo) — paralaje 0,1
    const per1 = 38, off1 = cam.x * 0.1, i1 = Math.floor(off1 / per1) - 1, by1 = H - (0.35 - cam.y * 0.1) * u;
    for (let i = i1; i < i1 + Math.ceil(W / u / per1) + 3; i++) { const hk = hash(i * 31 + 5), cx = (i * per1 + hk * 14 - off1) * u; volcan(ctx, cx, by1, u * (6 + hk * 3.5), u * (8.5 + hk * 3), TM.lejos2, TM.med, t, hk > 0.45, i * 13); }
    ctx.fillStyle = TM.med; ctx.fillRect(0, by1 - 1, W, H - by1 + 2);
    capaMontes(ctx, W, H, u, cam, 0.2, 0.15, 1.5, TM.med, TM.geria, 4.2);
    // La Geria: ladera de lapilli con hoyos y muretes, casas, palmeras y molino — paralaje 0,38
    const par = 0.38, off = cam.x * par, by = H - (0.0 - cam.y * par) * u, per = 30;
    const yR = x => by - (0.9 + cresta(x, 8.3) * 0.9) * u;
    ctx.beginPath(); ctx.moveTo(0, H); for (let x = 0; x <= W + 10; x += 10) ctx.lineTo(x, yR(x / u + off)); ctx.lineTo(W + 10, H); ctx.closePath();
    g = ctx.createLinearGradient(0, by - 3 * u, 0, by + u); g.addColorStop(0, '#4a3a3a'); g.addColorStop(0.3, TM.geria); g.addColorStop(1, '#171112'); ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = 'rgba(190,170,150,.35)'; ctx.lineWidth = Math.max(1, u * 0.06);
    for (let x = -((off * u) % (u * 1.7)); x < W + u; x += u * 1.7) { const wx = (x / u + off); const yy = yR(wx) + u * (0.5 + hash(Math.floor(wx / 1.7)) * 0.9); ctx.beginPath(); ctx.arc(x, yy, u * 0.5, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke(); }
    const i0 = Math.floor(off / per) - 1;
    for (let i = i0; i < i0 + Math.ceil(W / u / per) + 3; i++) {
      const hk = hash(i * 17 + 3), wx = i * per + hk * 10, x = (wx - off) * u, y = yR(wx) + u * 0.15;
      if (hk > 0.7) molino(ctx, x, y, u * 1.5, t); else if (hk > 0.3) { casa(ctx, x, y, u * 1.4, u * 1.0); casa(ctx, x + u * 1.5, y, u * 1.0, u * 0.75, '#efe7d6'); } else casa(ctx, x, y, u * 1.2, u * 0.9);
      palmera(ctx, x + u * 3.1, y, u * 1.4, t, i * 7); if (hk > 0.5) palmera(ctx, x - u * 1.2, y, u * 1.1, t, i * 11);
    }
    // bruma del horizonte
    g = ctx.createLinearGradient(0, by - u * 3.5, 0, by + u * 0.8); g.addColorStop(0, 'rgba(255,225,185,0)'); g.addColorStop(1, 'rgba(255,225,185,.22)'); ctx.fillStyle = g; ctx.fillRect(0, by - u * 3.5, W, u * 4.3);
    ctx.fillStyle = '#16100f'; ctx.fillRect(0, by + u * 0.8, W, H);
  }

  /* ---- Primer plano ---- */
  function dibujaDeco(ctx, d, x, y, u, t) {
    const s = d.s * u, sw = Math.sin(t * 1.3 + d.x) * 0.03;
    if (d.t === 'lagarto' && d.px != null) x += clamp(d.px + 2.4 - d.x, 0, 6) * u;
    ctx.save(); ctx.translate(x, y); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.beginPath(); ctx.ellipse(0, 0, s * 0.45, s * 0.08, 0, 0, TAU); ctx.fill();
    if (d.t === 'pita') {
      for (let a = -4; a <= 4; a++) { const l = s * (0.9 - Math.abs(a) * 0.07), ang = a * 0.22 + sw; const gg = ctx.createLinearGradient(0, 0, Math.sin(ang) * l, -Math.cos(ang) * l); gg.addColorStop(0, '#2f6a3a'); gg.addColorStop(1, '#8dbf6a'); ctx.strokeStyle = gg; ctx.lineWidth = s * 0.1; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(Math.sin(ang) * l * 0.5, -Math.cos(ang) * l * 0.6, Math.sin(ang) * l, -Math.cos(ang) * l); ctx.stroke(); }
      if (d.h > 0.5) { ctx.strokeStyle = '#8a6a3f'; ctx.lineWidth = s * 0.05; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(sw * s, -s * 1.9); ctx.stroke(); ctx.fillStyle = '#e8d26a'; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(sw * s + (i % 2 ? 1 : -1) * s * 0.08, -s * (1.6 + i * 0.1), s * 0.06, 0, TAU); ctx.fill(); } }
    } else if (d.t === 'tunera') {
      for (const [dx, dy, r, rot] of [[0, 0.42, 0.32, 0], [-0.3, 0.88, 0.25, -0.3], [0.28, 0.82, 0.27, 0.3], [0.05, 1.22, 0.2, 0.1]]) {
        const gg = ctx.createRadialGradient(dx * s - r * s * 0.3, -dy * s - r * s * 0.3, 0, dx * s, -dy * s, r * s * 1.3); gg.addColorStop(0, '#9fcf6d'); gg.addColorStop(1, '#3f7a3a'); ctx.fillStyle = gg; ctx.strokeStyle = '#2a5a2c'; ctx.lineWidth = Math.max(1, s * 0.03); ctx.beginPath(); ctx.ellipse(dx * s, -dy * s, r * s * 0.8, r * s * 1.05, rot, 0, TAU); ctx.fill(); ctx.stroke();
        ctx.fillStyle = 'rgba(250,240,200,.8)'; for (let k = 0; k < 4; k++) { ctx.fillRect(dx * s + (k - 1.5) * r * s * 0.3, -dy * s + ((k * 7) % 3 - 1) * r * s * 0.4, Math.max(1, s * 0.025), Math.max(1, s * 0.025)); }
      }
      ctx.fillStyle = '#d8454a'; ctx.beginPath(); ctx.arc(0.1 * s, -1.42 * s, s * 0.07, 0, TAU); ctx.arc(-0.3 * s, -1.1 * s, s * 0.06, 0, TAU); ctx.fill();
    } else if (d.t === 'cardon') {
      ctx.fillStyle = '#4f9a58'; ctx.strokeStyle = '#2d6a3c'; ctx.lineWidth = Math.max(1, s * 0.03);
      for (const [dx, h, w] of [[0, 1.5, 0.16], [-0.26, 1.0, 0.12], [0.26, 1.15, 0.12], [-0.5, 0.65, 0.09]]) { rr(ctx, dx * s - w * s, -h * s, w * s * 2, h * s, w * s); ctx.fill(); ctx.stroke(); ctx.strokeStyle = 'rgba(30,80,50,.55)'; ctx.beginPath(); ctx.moveTo(dx * s, -h * s + w * s); ctx.lineTo(dx * s, -w * s); ctx.stroke(); ctx.strokeStyle = '#2d6a3c'; }
    } else if (d.t === 'lagarto') {
      const mov = d.px != null && d.px + 2.4 > d.x && d.px < d.x + 3.6, w = mov ? Math.sin(t * 28) : Math.sin(t * 2) * 0.2;
      ctx.fillStyle = '#4b5a3a'; ctx.strokeStyle = '#2a3322'; ctx.lineWidth = Math.max(1, s * 0.02);
      ctx.beginPath(); ctx.ellipse(0, -s * 0.1, s * 0.3, s * 0.1, 0, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(s * 0.33, -s * 0.12, s * 0.12, s * 0.07, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-s * 0.28, -s * 0.1); ctx.quadraticCurveTo(-s * 0.55, -s * (0.1 - w * 0.1), -s * 0.75, -s * 0.04 + w * s * 0.05); ctx.stroke();
      ctx.strokeStyle = '#2a3322'; for (const lx of [-0.15, 0.18]) { ctx.beginPath(); ctx.moveTo(s * lx, -s * 0.06); ctx.lineTo(s * (lx + w * 0.06), 0); ctx.stroke(); }
      ctx.fillStyle = '#d9d19a'; ctx.beginPath(); ctx.arc(s * 0.38, -s * 0.14, s * 0.018, 0, TAU); ctx.fill();
    } else if (d.t === 'piedra') {
      for (const [dx, r, c] of [[0, 0.18, '#5d5254'], [0.26, 0.11, '#6f6264'], [-0.22, 0.09, '#4c4244']]) { ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(dx * s, -r * s * 0.6, r * s * 1.2, r * s * 0.8, 0, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.beginPath(); ctx.ellipse(dx * s - r * s * 0.3, -r * s * 0.95, r * s * 0.5, r * s * 0.22, 0, 0, TAU); ctx.fill(); }
    } else {
      ctx.strokeStyle = '#4f8a43'; ctx.lineWidth = Math.max(1, s * 0.03);
      for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(i * s * 0.07, 0); ctx.quadraticCurveTo(i * s * 0.16, -s * 0.3, i * s * 0.2 + sw * s, -s * (0.5 + (i % 2) * 0.12)); ctx.stroke(); ctx.fillStyle = i % 2 ? '#f6d65a' : '#f4efe6'; ctx.beginPath(); ctx.arc(i * s * 0.2 + sw * s, -s * (0.52 + (i % 2) * 0.12), s * 0.06, 0, TAU); ctx.fill(); }
    }
    ctx.restore();
  }

  function dibujaSuelo(ctx, s, W, H, u, cam, sx, sy, TX) {
    const x0 = sx(s.x0), x1 = sx(s.x1), yt = sy(s.top), yb = s.bot > -1e8 ? sy(s.bot) : H + 4;
    const a = Math.max(x0, -6), b = Math.min(x1, W + 6); if (b <= a) return;
    // cuerpo de lapilli con degradado de profundidad y textura
    let g = ctx.createLinearGradient(0, yt, 0, Math.min(yb, yt + u * 6)); g.addColorStop(0, '#463533'); g.addColorStop(0.25, '#2c2324'); g.addColorStop(1, '#130d0e');
    ctx.fillStyle = g; ctx.fillRect(x0, yt, x1 - x0, yb - yt);
    if (TX.lapilli) { ctx.save(); ctx.beginPath(); ctx.rect(x0, yt, x1 - x0, yb - yt); ctx.clip(); ctx.globalAlpha = 0.75; ctx.fillStyle = relleno(ctx, TX.lapilli, -cam.x * u, cam.y * u, '#2a2122'); ctx.fillRect(a, yt, b - a, yb - yt); ctx.restore(); }
    g = ctx.createLinearGradient(0, yt, 0, yt + u * 5); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.55)'); ctx.fillStyle = g; ctx.fillRect(x0, yt, x1 - x0, yb - yt);
    // capa de tierra roja con borde irregular
    const th = Math.min(u * 0.62, yb - yt), paso = u * 0.32;
    ctx.beginPath(); ctx.moveTo(a, yt);
    for (let x = a; x <= b; x += paso) { const wx = x / u + cam.x; ctx.lineTo(x, yt + th * (0.7 + hash(Math.floor(wx * 3)) * 0.55)); }
    ctx.lineTo(b, yt); ctx.closePath();
    g = ctx.createLinearGradient(0, yt, 0, yt + th * 1.3); g.addColorStop(0, '#d27a46'); g.addColorStop(0.5, COL.tierra); g.addColorStop(1, '#6d3320'); ctx.fillStyle = g; ctx.fill();
    if (TX.tierra) { ctx.save(); ctx.clip(); ctx.globalAlpha = 0.5; ctx.fillStyle = relleno(ctx, TX.tierra, -cam.x * u, cam.y * u, '#a5532f'); ctx.fillRect(a, yt, b - a, th * 1.4); ctx.restore(); }
    // labio de arena iluminado
    ctx.fillStyle = COL.arena; ctx.fillRect(a, yt - u * 0.035, b - a, u * 0.08); ctx.fillStyle = 'rgba(255,245,210,.55)'; ctx.fillRect(a, yt - u * 0.035, b - a, u * 0.03);
    // piedrecitas y briznas en el borde
    for (let x = Math.max(s.x0, cam.x - 1); x < Math.min(s.x1, cam.x + W / u + 1); x += 0.55) {
      const hk = hash(Math.floor(x * 10) + 11); if (hk > 0.55) continue; const px = sx(x + hk), py = yt + u * (0.06 + hk * 0.35);
      ctx.fillStyle = hk < 0.2 ? 'rgba(40,20,14,.55)' : 'rgba(250,215,160,.5)'; ctx.fillRect(px, py, u * (0.05 + hk * 0.1), u * 0.05);
    }
    // bordes laterales con sombra y estratos
    for (const [xx, dir] of [[x0, 1], [x1, -1]]) {
      if (xx < -u || xx > W + u) continue;
      g = ctx.createLinearGradient(xx, 0, xx + dir * u * 0.55, 0); g.addColorStop(0, 'rgba(0,0,0,.5)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(dir > 0 ? xx : xx - u * 0.55, yt, u * 0.55, yb - yt);
    }
  }

  function dibujaRoca(ctx, s, base, W, H, u, sx, sy) {
    const x0 = sx(s.x0), x1 = sx(s.x1), yt = sy(s.top), yb = sy(base), w = x1 - x0, h = yb - yt, sd = Math.floor(s.x0 * 7);
    const P = [[0, 1], [0.0, 0.3], [0.1, 0.08], [0.32, 0.0], [0.58, 0.05], [0.82, 0.02], [1.0, 0.22], [1.0, 1]];
    const pts = P.map(([a, b], i) => [x0 + w * (a + (i > 0 && i < 6 ? (hash(sd + i) - 0.5) * 0.04 : 0)), yt + h * (b + (i > 0 && i < 6 ? hash(sd + i + 9) * 0.03 : 0))]);
    ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(x0 + w * 0.5, yb, w * 0.7, u * 0.14, 0, 0, TAU); ctx.fill();
    const trazo = () => { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); };
    trazo(); let g = ctx.createLinearGradient(x0, yt, x1, yb); g.addColorStop(0, '#6a5b5c'); g.addColorStop(0.55, COL.roca); g.addColorStop(1, '#2b2326'); ctx.fillStyle = g; ctx.fill();
    ctx.save(); trazo(); ctx.clip();
    // facetas
    ctx.fillStyle = 'rgba(255,235,210,.22)'; ctx.beginPath(); ctx.moveTo(pts[1][0], pts[1][1]); ctx.lineTo(pts[2][0], pts[2][1]); ctx.lineTo(pts[3][0], pts[3][1]); ctx.lineTo(x0 + w * 0.45, yt + h * 0.38); ctx.lineTo(x0 + w * 0.1, yt + h * 0.55); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(10,5,8,.3)'; ctx.beginPath(); ctx.moveTo(x0 + w * 0.6, yt + h * 0.12); ctx.lineTo(pts[6][0], pts[6][1]); ctx.lineTo(x1, yb); ctx.lineTo(x0 + w * 0.55, yb); ctx.lineTo(x0 + w * 0.5, yt + h * 0.5); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(15,8,10,.55)'; ctx.lineWidth = Math.max(1.2, u * 0.05); ctx.beginPath(); ctx.moveTo(x0 + w * 0.45, yt + h * 0.38); ctx.lineTo(x0 + w * 0.5, yt + h * 0.7); ctx.lineTo(x0 + w * 0.4, yb); ctx.moveTo(x0 + w * 0.7, yt + h * 0.2); ctx.lineTo(x0 + w * 0.62, yt + h * 0.55); ctx.stroke();
    ctx.fillStyle = 'rgba(190,100,60,.28)'; for (let i = 0; i < 8; i++) ctx.fillRect(x0 + w * hash(sd + i * 3), yt + h * (0.15 + hash(sd + i * 5) * 0.8), u * 0.07, u * 0.05);
    ctx.fillStyle = 'rgba(120,150,70,.55)'; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.ellipse(x0 + w * (0.1 + hash(sd + i) * 0.8), yt + h * (0.04 + hash(sd + i + 4) * 0.12), u * 0.12, u * 0.05, 0, 0, TAU); ctx.fill(); }
    ctx.restore();
    trazo(); ctx.strokeStyle = '#150d10'; ctx.lineWidth = Math.max(1.5, u * 0.06); ctx.lineJoin = 'round'; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,235,210,.4)'; ctx.lineWidth = Math.max(1, u * 0.03); ctx.beginPath(); ctx.moveTo(pts[1][0] + u * 0.05, pts[1][1] + u * 0.1); ctx.lineTo(pts[2][0], pts[2][1] + u * 0.03); ctx.lineTo(pts[3][0], pts[3][1] + u * 0.02); ctx.lineTo(pts[4][0], pts[4][1] + u * 0.03); ctx.stroke();
  }

  function dibujaRepisa(ctx, s, W, H, u, sx, sy) {
    const x0 = sx(s.x0), x1 = sx(s.x1), yt = sy(s.top), th = Math.max(u * 0.34, 5), w = x1 - x0;
    ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.fillRect(x0 + u * 0.1, yt + th, w - u * 0.1, u * 0.2);
    let g = ctx.createLinearGradient(0, yt, 0, yt + th); g.addColorStop(0, '#c7b6a0'); g.addColorStop(0.35, COL.repisa); g.addColorStop(1, '#5d5047'); ctx.fillStyle = g; rr(ctx, x0, yt, w, th, u * 0.08); ctx.fill();
    ctx.strokeStyle = '#2a201c'; ctx.lineWidth = Math.max(1.2, u * 0.04); ctx.stroke();
    ctx.strokeStyle = 'rgba(40,28,24,.5)'; ctx.lineWidth = Math.max(1, u * 0.03); for (let x = x0 + u * 0.9; x < x1 - u * 0.4; x += u * 0.9) { ctx.beginPath(); ctx.moveTo(x, yt + th * 0.15); ctx.lineTo(x - u * 0.06, yt + th * 0.95); ctx.stroke(); }
    ctx.fillStyle = 'rgba(255,245,225,.55)'; ctx.fillRect(x0 + u * 0.08, yt + 1, w - u * 0.16, Math.max(1, u * 0.04));
    ctx.fillStyle = 'rgba(70,50,40,.9)'; for (const xx of [x0 + u * 0.25, x1 - u * 0.25]) { ctx.beginPath(); ctx.moveTo(xx - u * 0.12, yt + th); ctx.lineTo(xx + u * 0.12, yt + th); ctx.lineTo(xx, yt + th + u * 0.38); ctx.closePath(); ctx.fill(); }
  }

  function dibujaEscena(ctx, W, H, u, cam, L, esc, t, fx) {
    const TM = TEMAS[esc.tema || 0], TX = texturas();
    const sx = wx => (wx - cam.x) * u, sy = wy => H - (wy - cam.y) * u;
    dibujaFondo(ctx, W, H, u, cam, TM, t);
    // abismo de los huecos
    for (const h of esc.huecos) {
      const x0 = sx(h.x0), x1 = sx(h.x1); if (x1 < -4 || x0 > W + 4) continue;
      const yt = sy(h.top), g = ctx.createLinearGradient(0, yt, 0, H); g.addColorStop(0, '#3a1d18'); g.addColorStop(0.35, '#1a0d0c'); g.addColorStop(1, '#070304'); ctx.fillStyle = g; ctx.fillRect(x0, yt, x1 - x0, H - yt + 2);
      const eg = ctx.createRadialGradient((x0 + x1) / 2, H, 0, (x0 + x1) / 2, H, Math.max(u * 3, (x1 - x0))); eg.addColorStop(0, 'rgba(255,120,50,.35)'); eg.addColorStop(1, 'rgba(255,90,30,0)'); ctx.fillStyle = eg; ctx.fillRect(x0, yt, x1 - x0, H - yt + 2);
      ctx.strokeStyle = 'rgba(90,50,40,.5)'; ctx.lineWidth = Math.max(1, u * 0.04); for (let k = 1; k < 5; k++) { const y = yt + u * k * 1.1; if (y > H) break; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y + (k % 2 ? u * 0.1 : -u * 0.1)); ctx.stroke(); }
    }
    for (const s of L.solids) {
      const x0 = sx(s.x0), x1 = sx(s.x1); if (x1 < -4 || x0 > W + 4) continue;
      if (s.kind === 'ground' || s.kind === 'wall') dibujaSuelo(ctx, s, W, H, u, cam, sx, sy, TX);
      else if (s.kind === 'rock') { const r = esc.rocas.find(q => q.id === s.id); dibujaRoca(ctx, s, r ? r.base : s.top - 1, W, H, u, sx, sy); }
      else if (s.kind === 'oneway') dibujaRepisa(ctx, s, W, H, u, sx, sy);
    }
    for (const d of esc.deco) { const x = sx(d.x); if (x < -60 || x > W + 60) continue; dibujaDeco(ctx, d, x, sy(d.y), u, t); }
    // puntos de control
    for (const c of L.cps) {
      const x = sx(c.x); if (x < -60 || x > W + 60) continue; const y = sy(c.y), ya = c.alcanzado, o = Math.sin(t * 4);
      if (ya) { const gg = ctx.createRadialGradient(x, y - u * 1.8, 0, x, y - u * 1.8, u * 2.2); gg.addColorStop(0, 'rgba(120,210,255,.35)'); gg.addColorStop(1, 'rgba(120,210,255,0)'); ctx.fillStyle = gg; ctx.fillRect(x - u * 2.2, y - u * 4, u * 4.4, u * 4.4); }
      ctx.strokeStyle = '#3a2a1c'; ctx.lineWidth = Math.max(2, u * 0.1); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - u * 2.3); ctx.stroke();
      ctx.fillStyle = ya ? '#2f93d4' : '#e6dfd0'; ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, y - u * 2.3); ctx.bezierCurveTo(x + u * 0.5, y - u * (2.4 + o * 0.08), x + u * 0.7, y - u * (2.0 - o * 0.08), x + u * 1.0, y - u * (1.95 + o * 0.05)); ctx.lineTo(x, y - u * 1.5); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#3a2a1c'; ctx.beginPath(); ctx.arc(x, y - u * 2.33, u * 0.08, 0, TAU); ctx.fill();
    }
    // meta: casita del pueblo con pozo
    const mx = sx(L.goals.finish_x);
    if (mx > -300 && mx < W + 300) {
      const gs = L.solids.find(s => s.kind !== 'wall' && s.x0 <= L.goals.finish_x && s.x1 >= L.goals.finish_x && s.bot < -1e8), y = sy(gs ? gs.top : 0);
      ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(mx + u * 3.4, y, u * 2.6, u * 0.2, 0, 0, TAU); ctx.fill();
      casa(ctx, mx + u * 1.6, y, u * 3.6, u * 2.5);
      ctx.fillStyle = '#b5532f'; ctx.beginPath(); ctx.moveTo(mx + u * 1.3, y - u * 2.5); ctx.lineTo(mx + u * 5.5, y - u * 2.5); ctx.lineTo(mx + u * 5.0, y - u * 3.0); ctx.lineTo(mx + u * 1.8, y - u * 3.0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#2f7a55'; ctx.beginPath(); ctx.moveTo(mx + u * 2.4, y); ctx.lineTo(mx + u * 2.4, y - u * 1.5); ctx.arc(mx + u * 2.85, y - u * 1.5, u * 0.45, Math.PI, 0); ctx.lineTo(mx + u * 3.3, y); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#3a6f97'; rr(ctx, mx + u * 3.9, y - u * 1.9, u * 0.9, u * 0.9, u * 0.08); ctx.fill(); ctx.strokeStyle = '#e8e2d4'; ctx.lineWidth = Math.max(1.5, u * 0.06); ctx.stroke();
      // pozo con agua que brilla
      ctx.fillStyle = '#7a6a68'; rr(ctx, mx - u * 0.2, y - u * 0.8, u * 1.3, u * 0.8, u * 0.08); ctx.fill(); ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(mx + u * 0.6, y - u * 0.8, u * 0.5, u * 0.8);
      ctx.fillStyle = COL.agua; ctx.fillRect(mx, y - u * 0.8, u * 0.9, u * 0.14); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillRect(mx + u * (0.1 + 0.5 * ((t * 0.5) % 1)), y - u * 0.8, u * 0.12, u * 0.05);
      ctx.strokeStyle = '#3a2a1c'; ctx.lineWidth = Math.max(2, u * 0.08); ctx.beginPath(); ctx.moveTo(mx, y - u * 0.8); ctx.lineTo(mx, y - u * 1.9); ctx.lineTo(mx + u * 0.9, y - u * 1.9); ctx.lineTo(mx + u * 0.9, y - u * 0.8); ctx.stroke();
      ctx.fillStyle = '#f6d65a'; ctx.beginPath(); ctx.moveTo(mx + u * 0.45, y - u * 1.9); ctx.lineTo(mx + u * 0.45, y - u * 2.15); ctx.stroke();
      // banderines
      ctx.strokeStyle = '#3a2a1c'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(mx + u * 1.5, y - u * 3.1); ctx.quadraticCurveTo(mx + u * 3.4, y - u * 2.7, mx + u * 5.4, y - u * 3.1); ctx.stroke();
      for (let i = 0; i < 6; i++) { const q = (i + 0.5) / 6, bx = mx + u * (1.5 + 3.9 * q), by = y - u * (3.1 - Math.sin(q * Math.PI) * 0.35); ctx.fillStyle = ['#d8454a', '#f6d65a', '#2f93d4'][i % 3]; ctx.beginPath(); ctx.moveTo(bx - u * 0.15, by); ctx.lineTo(bx + u * 0.15, by); ctx.lineTo(bx, by + u * 0.38); ctx.closePath(); ctx.fill(); }
    }
  }

  /* Primer plano: siluetas oscuras que pasan más deprisa que el suelo (profundidad) */
  function dibujaPrimerPlano(ctx, W, H, u, cam, t) {
    const per = 4.1, off = cam.x * 1.4, i0 = Math.floor(off / per) - 1;
    for (let i = i0; i < i0 + Math.ceil(W / u / per) + 3; i++) {
      const hk = hash(i * 23 + 7), x = (i * per + hk * 2.5 - off) * u, tipo = hk < 0.55 ? 0 : hk < 0.8 ? 1 : 2, sw = Math.sin(t * 1.4 + i) * 0.04;
      ctx.fillStyle = 'rgba(8,5,6,.93)';
      if (tipo === 0) { const h = u * (0.8 + hk * 0.9); for (let a = -3; a <= 3; a++) { ctx.beginPath(); ctx.moveTo(x - u * 0.06, H + 2); ctx.quadraticCurveTo(x + a * u * 0.1, H - h * 0.6, x + a * u * (0.2 + sw) , H - h * (0.75 + (3 - Math.abs(a)) * 0.07)); ctx.quadraticCurveTo(x + a * u * 0.1 + u * 0.05, H - h * 0.5, x + u * 0.06, H + 2); ctx.fill(); } }
      else if (tipo === 1) { const w = u * (0.9 + hk * 0.6); ctx.beginPath(); ctx.moveTo(x - w, H + 2); ctx.lineTo(x - w * 0.8, H - u * 0.35); ctx.lineTo(x - w * 0.2, H - u * 0.6); ctx.lineTo(x + w * 0.5, H - u * 0.42); ctx.lineTo(x + w, H + 2); ctx.closePath(); ctx.fill(); }
      else { ctx.fillRect(x - u * 0.07, H - u * 1.4, u * 0.14, u * 1.5); ctx.beginPath(); ctx.ellipse(x - u * 0.28, H - u * 0.8, u * 0.12, u * 0.3, 0.3, 0, TAU); ctx.ellipse(x + u * 0.3, H - u * 1.0, u * 0.12, u * 0.3, -0.3, 0, TAU); ctx.fill(); }
    }
  }

  /* Sombra de Martín bajo sus pies (se pinta antes que él) */
  function dibujaSombra(ctx, L, s, u, cam, H) {
    const gy = suelo(L, s.x, s.y), alt = Math.max(0, s.y - gy), k = clamp(1 - alt / 5, 0.25, 1);
    ctx.fillStyle = 'rgba(0,0,0,' + (0.3 * k) + ')'; ctx.beginPath(); ctx.ellipse((s.x - cam.x) * u, H - (gy - cam.y) * u, u * 0.85 * k, u * 0.12 * k, 0, 0, TAU); ctx.fill();
  }

  /* Partículas y efectos */
  function dibujaFx(ctx, W, H, u, cam, fx, t) {
    // motas de ceniza/polvo flotando (paralaje)
    ctx.fillStyle = 'rgba(255,235,200,.22)';
    for (let i = 0; i < 22; i++) { const x = (((i * 53.3 + t * (8 + i % 5) - cam.x * u * (0.3 + (i % 3) * 0.15)) % W) + W) % W, y = ((i * 97.7 + t * (5 + i % 4) * 2) % H + H) % H; ctx.beginPath(); ctx.arc(x, y, u * (0.015 + (i % 3) * 0.012), 0, TAU); ctx.fill(); }
    for (const f of fx) {
      const q = f.v / f.n, x = (f.x - cam.x) * u, y = H - (f.y - cam.y) * u;
      if (f.k === 'polvo') {
        const n = f.fuerte === false ? 3 : 6;
        for (let i = 0; i < n; i++) { const dir = (i % 2 ? 1 : -1), r = u * (0.1 + q * (0.22 + (i % 3) * 0.06)), dx = dir * (u * 0.2 + q * u * (0.5 + i * 0.07)), dy = -q * u * (0.3 + (i % 2) * 0.2); ctx.fillStyle = 'rgba(226,190,140,' + (0.5 * (1 - q)) + ')'; ctx.beginPath(); ctx.arc(x + dx, y + dy, r, 0, TAU); ctx.fill(); }
      } else if (f.k === 'gota') {
        const tt = f.v / 60, gx = x + f.vx * tt * u, gy = y - (f.vy * tt - 6 * tt * tt) * u; ctx.fillStyle = 'rgba(70,175,240,' + (1 - q) + ')'; ctx.beginPath(); ctx.arc(gx, gy, u * 0.09, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,' + (0.8 * (1 - q)) + ')'; ctx.beginPath(); ctx.arc(gx - u * 0.025, gy - u * 0.03, u * 0.03, 0, TAU); ctx.fill();
      } else if (f.k === 'confeti') {
        const tt = f.v / 60, cx = x + f.vx * tt * u, cy = y - (f.vy * tt - 5 * tt * tt) * u; ctx.save(); ctx.translate(cx, cy); ctx.rotate(tt * f.rot); ctx.globalAlpha = 1 - q * q; ctx.fillStyle = f.c; ctx.fillRect(-u * 0.07, -u * 0.04, u * 0.14, u * 0.08); ctx.restore();
      } else if (f.k === 'texto') {
        ctx.font = '800 ' + Math.round(u * 0.8) + 'px system-ui,sans-serif'; ctx.textAlign = 'center'; const yy = y - q * u * 1.2;
        ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(3, u * 0.14); ctx.strokeStyle = 'rgba(20,10,10,' + (0.85 * (1 - q)) + ')'; ctx.strokeText(f.txt, x, yy); ctx.fillStyle = 'rgba(255,255,255,' + (1 - q) + ')'; ctx.fillText(f.txt, x, yy); ctx.textAlign = 'left';
      }
    }
  }

  /* Pulido final: viñeta y tinte del momento del día */
  function dibujaPost(ctx, W, H, esc, agua) {
    const TM = TEMAS[esc.tema || 0];
    ctx.fillStyle = TM.tinte; ctx.fillRect(0, 0, W, H);
    const g = ctx.createRadialGradient(W / 2, H * 0.55, Math.min(W, H) * 0.35, W / 2, H * 0.55, Math.max(W, H) * 0.8); g.addColorStop(0, 'rgba(8,4,12,0)'); g.addColorStop(1, 'rgba(8,4,12,.45)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    if (agua > 0 && agua < 30) { const gg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.4, W / 2, H / 2, Math.max(W, H) * 0.75); gg.addColorStop(0, 'rgba(255,200,40,0)'); gg.addColorStop(1, 'rgba(255,190,30,.28)'); ctx.fillStyle = gg; ctx.fillRect(0, 0, W, H); }
  }

  /* Cabecera del mapa: paisaje vivo con Martín esperando */
  function dibujaHero(ctx, W, H, t, tema) {
    const u = H / 5.2, TM = TEMAS[tema % TEMAS.length], cam = { x: t * 0.9, y: -0.2 * H / u };
    dibujaFondo(ctx, W, H, u, cam, TM, t);
    const gy = H * 0.8;
    let g = ctx.createLinearGradient(0, gy, 0, H); g.addColorStop(0, '#d27a46'); g.addColorStop(0.3, COL.tierra); g.addColorStop(0.31, '#3a2d2c'); g.addColorStop(1, '#130d0e'); ctx.fillStyle = g; ctx.fillRect(0, gy, W, H - gy);
    ctx.fillStyle = COL.arena; ctx.fillRect(0, gy - 1, W, 3);
    for (const [fx, tp, sc] of [[0.12, 'tunera', 1.0], [0.55, 'pita', 1.1], [0.72, 'cardon', 1.0], [0.9, 'tunera', 0.8], [0.42, 'flor', 1]]) dibujaDeco(ctx, { t: tp, x: fx * 7, s: sc, h: 0.7 }, W * fx, gy, u, t);
    ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(W * 0.3, gy, u * 0.9, u * 0.12, 0, 0, TAU); ctx.fill();
    dibujaMartin(ctx, u * 0.95, W * 0.32, gy, { dir: 1, fase: 0, anim: 'idle', agua: 100, golpe: 0, t, alpha: 1 });
    dibujaPost(ctx, W, H, { tema }, 100);
  }
  /* Miniatura de nivel (tarjetas del mapa) */
  function dibujaMini(ctx, w, h, tema) {
    const TM = TEMAS[tema % TEMAS.length]; let g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, TM.cielo[0]); g.addColorStop(0.55, TM.cielo[1]); g.addColorStop(1, TM.cielo[3]); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = TM.solC; ctx.beginPath(); ctx.arc(w * TM.sol[0], h * 0.28, h * 0.1, 0, TAU); ctx.fill();
    ctx.fillStyle = TM.lejos2; ctx.beginPath(); ctx.moveTo(0, h * 0.8); ctx.lineTo(w * 0.28, h * 0.32); ctx.lineTo(w * 0.36, h * 0.32); ctx.lineTo(w * 0.7, h * 0.8); ctx.closePath(); ctx.fill();
    ctx.fillStyle = TM.med; ctx.beginPath(); ctx.moveTo(w * 0.4, h * 0.8); ctx.lineTo(w * 0.72, h * 0.5); ctx.lineTo(w, h * 0.8); ctx.closePath(); ctx.fill();
    g = ctx.createLinearGradient(0, h * 0.74, 0, h); g.addColorStop(0, '#c9693a'); g.addColorStop(0.3, '#8a4429'); g.addColorStop(1, '#1a1213'); ctx.fillStyle = g; ctx.fillRect(0, h * 0.74, w, h * 0.26);
    ctx.fillStyle = TM.tinte; ctx.fillRect(0, 0, w, h);
  }

  window.Dibujo = { COL, hash, TEMAS, preparaEscena, dibujaMartin, dibujaEscena, dibujaSombra, dibujaFx, dibujaPost, dibujaFondo, dibujaPrimerPlano, dibujaHero, dibujaMini };
})();
