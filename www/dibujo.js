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
    { cielo: ['#0f5fc4', '#2b84dc', '#6db3ea', '#cfe7f6'], sol: [0.8, 0.14], solC: '#fff8dc', haz: 0.06, lejos: '#8f86b0', lejos2: '#766c98', fuego: '#b4513a', med: '#2f2a2d', geria: '#2a2223', tinte: 'rgba(255,230,170,0.06)', nubes: 0.8 },
    { cielo: ['#0b58bd', '#2a80da', '#74b8ec', '#d6ebf7'], sol: [0.5, 0.1], solC: '#fffbe6', haz: 0.03, lejos: '#9590b8', lejos2: '#7b74a0', fuego: '#ad4c36', med: '#302a2c', geria: '#2c2425', tinte: 'rgba(255,255,255,0.03)', nubes: 1 },
    { cielo: ['#1d66bf', '#4f93d6', '#b9d2e2', '#f2cf9e'], sol: [0.84, 0.3], solC: '#ffe8b0', haz: 0.1, lejos: '#9a88ad', lejos2: '#80709a', med: '#33292c', geria: '#2a2022', tinte: 'rgba(255,170,90,0.10)', nubes: 0.9 },
    { cielo: ['#43508f', '#8a74a8', '#e5a28f', '#f8c47a'], sol: [0.8, 0.38], solC: '#ffd0a0', haz: 0.18, lejos: '#9a7ea0', lejos2: '#7d6488', med: '#2f2428', geria: '#241b20', tinte: 'rgba(255,130,100,0.12)', nubes: 0.9 },
    { cielo: ['#4a5663', '#7d8794', '#b0b3b6', '#d9c6a8'], sol: [0.7, 0.2], solC: '#f0e8d8', haz: 0.03, lejos: '#8e9199', lejos2: '#767a84', med: '#302b2d', geria: '#262021', tinte: 'rgba(120,130,150,0.12)', nubes: 1.3 },
    { cielo: ['#2e2f6e', '#a2506b', '#f08a5a', '#ffd27a'], sol: [0.76, 0.42], solC: '#ffe9a8', haz: 0.22, lejos: '#8a5f78', lejos2: '#6d4a64', med: '#2a1f24', geria: '#1f171b', tinte: 'rgba(255,110,60,0.14)', nubes: 0.8 }
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
  const PEL = { luz: '#f6d99c', claro: '#e9bd76', medio: '#d3a05a', sombra: '#a8743a', osc: '#7a4a24', borde: '#8a5a2a', hocico: '#f2d9a6' };

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

  /* Pata de dibujo animado: muslo grueso, rodilla redonda de callo marrón, caña y pezuña grande oscura. sg = lado en que dobla la rodilla */
  function pata(ctx, hx, hy, fx, fy, sg, cerca, anchoMuslo) {
    const a = 0.44, b = 0.42, dx = fx - hx, dy = fy - hy, dd = Math.hypot(dx, dy) || 1, d = Math.min(dd, a + b - 0.004);
    const ux = dx / dd, uy = dy / dd, p = (d * d + a * a - b * b) / (2 * d), h = Math.sqrt(Math.max(0, a * a - p * p));
    const kx = hx + ux * p - uy * h * sg, ky = hy + uy * p + ux * h * sg, ex = hx + ux * d, ey = hy + uy * d;
    const col = cerca ? PEL.claro : PEL.medio;
    conico(ctx, [[hx, hy + 0.05], [(hx + kx) / 2, (hy + ky) / 2], [kx, ky]], [anchoMuslo + 0.04, anchoMuslo * 0.7, 0.2], col, PEL.borde, 0.035);
    conico(ctx, [[kx, ky], [(kx + ex) / 2, (ky + ey) / 2], [ex, ey + 0.09]], [0.2, 0.15, 0.17], col, PEL.borde, 0.035);
    if (cerca) { ctx.fillStyle = 'rgba(255,248,225,.45)'; ctx.beginPath(); ctx.ellipse(hx - 0.02, hy - 0.1, anchoMuslo * 0.2, 0.15, 0.1, 0, TAU); ctx.fill(); }
    ctx.fillStyle = '#bd8450'; ctx.strokeStyle = PEL.borde; ctx.lineWidth = 0.03; ctx.beginPath(); ctx.arc(kx + 0.02 * sg, ky, 0.105, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,225,170,.35)'; ctx.beginPath(); ctx.arc(kx + 0.02 * sg - 0.03, ky + 0.03, 0.04, 0, TAU); ctx.fill();
    ctx.fillStyle = '#5b4333'; ctx.strokeStyle = '#3a281c'; ctx.lineWidth = 0.028;
    ctx.beginPath(); ctx.moveTo(ex - 0.1, ey + 0.15); ctx.quadraticCurveTo(ex - 0.15, ey - 0.03, ex - 0.04, ey - 0.03); ctx.lineTo(ex + 0.12, ey - 0.03); ctx.quadraticCurveTo(ex + 0.23, ey, ex + 0.17, ey + 0.1); ctx.quadraticCurveTo(ex + 0.1, ey + 0.16, ex - 0.1, ey + 0.15); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,230,190,.25)'; ctx.beginPath(); ctx.ellipse(ex + 0.02, ey + 0.1, 0.07, 0.025, 0, 0, TAU); ctx.fill();
  }

  function cabeza(ctx, T, st) {
    // origen = centro del cráneo; mira hacia +x. Cabeza grande y simpática, con bozal de malla y correas de cuero
    const cuero = '#8a4f26';
    // mechón y oreja (detrás)
    ctx.fillStyle = PEL.medio; ctx.strokeStyle = PEL.borde; ctx.lineWidth = 0.03; ctx.lineJoin = 'round';
    const fl = Math.sin(T * 2.7) > 0.93 ? 0.3 : 0;
    ctx.save(); ctx.translate(-0.12, 0.17); ctx.rotate(0.5 + fl); ctx.beginPath(); ctx.ellipse(0, 0.08, 0.075, 0.13, 0, 0, TAU); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#eea9a1'; ctx.beginPath(); ctx.ellipse(0, 0.07, 0.04, 0.085, 0, 0, TAU); ctx.fill(); ctx.restore();
    // cráneo y hocico
    const g = ctx.createLinearGradient(0, 0.25, 0, -0.25); g.addColorStop(0, PEL.luz); g.addColorStop(0.6, PEL.claro); g.addColorStop(1, PEL.medio);
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-0.24, 0.0);
    ctx.bezierCurveTo(-0.24, 0.2, -0.05, 0.27, 0.12, 0.22);
    ctx.bezierCurveTo(0.3, 0.17, 0.5, 0.1, 0.56, -0.04);
    ctx.bezierCurveTo(0.6, -0.17, 0.5, -0.27, 0.36, -0.27);
    ctx.bezierCurveTo(0.2, -0.27, 0.05, -0.25, -0.08, -0.2);
    ctx.bezierCurveTo(-0.2, -0.16, -0.24, -0.08, -0.24, 0.0); ctx.closePath(); ctx.fill(); ctx.stroke();
    // mechones de pelo sobre la frente
    ctx.fillStyle = PEL.sombra; for (const [x, y, l, a] of [[-0.12, 0.2, 0.15, -0.5], [-0.03, 0.25, 0.17, -0.2], [0.07, 0.24, 0.14, 0.15]]) { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(-0.045, 0); ctx.quadraticCurveTo(0, l * 1.1, 0.045, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); }
    // boca abierta y sonriente con la lengua rosa
    ctx.fillStyle = '#7a2428'; ctx.beginPath(); ctx.ellipse(0.43, -0.2, 0.13, 0.065, 0.12, 0, TAU); ctx.fill(); ctx.fillStyle = '#e8737c'; ctx.beginPath(); ctx.ellipse(0.44, -0.225, 0.08, 0.03, 0.1, 0, TAU); ctx.fill();
    ctx.fillStyle = '#fff3dc'; ctx.fillRect(0.34, -0.15, 0.05, 0.03); ctx.fillRect(0.4, -0.145, 0.05, 0.03);
    ctx.fillStyle = 'rgba(140,90,40,.25)'; ctx.beginPath(); ctx.ellipse(0.5, -0.02, 0.025, 0.035, 0.4, 0, TAU); ctx.fill();   // ollar
    // cabezada de lona beige con costuras rojas y hebillas
    const lona = (pts) => { ctx.lineCap = 'round'; ctx.strokeStyle = '#7a5a3a'; ctx.lineWidth = 0.075; ctx.beginPath(); pts(); ctx.stroke(); ctx.strokeStyle = '#ecdcb0'; ctx.lineWidth = 0.056; ctx.beginPath(); pts(); ctx.stroke(); ctx.strokeStyle = '#c0453a'; ctx.lineWidth = 0.01; ctx.setLineDash([0.03, 0.025]); ctx.beginPath(); pts(); ctx.stroke(); ctx.setLineDash([]); };
    lona(() => { ctx.moveTo(0.46, 0.0); ctx.quadraticCurveTo(0.42, -0.1, 0.44, -0.24); });                 // frontalera del hocico
    lona(() => { ctx.moveTo(0.44, -0.06); ctx.quadraticCurveTo(0.2, -0.04, 0.0, 0.0); });               // carrillera
    lona(() => { ctx.moveTo(0.0, 0.2); ctx.quadraticCurveTo(0.08, 0.02, 0.0, -0.14); });              // testera
    lona(() => { ctx.moveTo(0.2, 0.16); ctx.quadraticCurveTo(0.26, 0.04, 0.22, -0.04); });
    ctx.fillStyle = '#b9bcc0'; ctx.strokeStyle = '#555'; ctx.lineWidth = 0.012; rr(ctx, 0.14, -0.05, 0.06, 0.07, 0.01); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#9a9ea2'; ctx.lineWidth = 0.025; ctx.beginPath(); ctx.arc(0.43, -0.29, 0.035, 0, TAU); ctx.stroke();
    // cuerda que cuelga del bozal
    const rs = Math.sin(T * 2.3) * 0.03; ctx.strokeStyle = '#ead6a4'; ctx.lineWidth = 0.05; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0.43, -0.31); ctx.quadraticCurveTo(0.34 + rs, -0.6, 0.5 + rs * 2, -0.8); ctx.stroke(); ctx.strokeStyle = '#b89a62'; ctx.lineWidth = 0.014; ctx.stroke();
    // ojo grande y expresivo
    const parp = (Math.sin(T * 0.9) > 0.985) || st.golpe > 0 || st.anim === 'cae';
    if (parp) { ctx.strokeStyle = '#3a2412'; ctx.lineWidth = 0.035; ctx.beginPath(); ctx.arc(0.1, 0.06, 0.06, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }
    else {
      ctx.fillStyle = '#fff8ea'; ctx.beginPath(); ctx.ellipse(0.1, 0.06, 0.085, 0.08, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = '#5a3a22'; ctx.lineWidth = 0.025; ctx.stroke();
      ctx.fillStyle = '#6a3a1e'; ctx.beginPath(); ctx.arc(0.12, 0.055, 0.06, 0, TAU); ctx.fill(); ctx.fillStyle = '#1a0e08'; ctx.beginPath(); ctx.arc(0.125, 0.055, 0.033, 0, TAU); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0.142, 0.08, 0.02, 0, TAU); ctx.arc(0.108, 0.035, 0.01, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#3a2412'; ctx.lineWidth = 0.025; ctx.beginPath(); ctx.moveTo(0.02, 0.1); ctx.quadraticCurveTo(0.1, 0.16, 0.19, 0.1); ctx.moveTo(0.03, 0.12); ctx.lineTo(0.0, 0.16); ctx.stroke();
    }

  }

  /* Martín a partir de la ilustración (camello.png, 551×560, mirando a la derecha). Si aún no ha cargado, se usa el dibujo vectorial. */
  const SPR = { img: null, ok: false, cache: {}, ax: 232, ay: 553, alto: 2.4, win: [184, 315, 19, 32], cad: 366, cx0: 172, cx1: 236,
    // altura de las pezuñas en el dibujo (en perspectiva las traseras quedan más arriba): se estiran sus columnas hasta el suelo
    corte: [[235, 340], [222, 440], [214, 465], [200, 485], [196, 600]],
    pies: [[0, 484], [120, 484], [165, 500], [200, 520], [270, 522], [320, 553], [551, 553]] };
  const pieY = x => { const P = SPR.pies; for (let i = 1; i < P.length; i++) if (x <= P[i][0]) { const a = P[i - 1], b = P[i], q = (x - a[0]) / (b[0] - a[0]); return a[1] + (b[1] - a[1]) * q; } return 553; };
  if (typeof Image !== 'undefined') { SPR.img = new Image(); SPR.img.onload = () => { SPR.ok = true; }; SPR.img.src = 'camello.png'; }
  function sprEscalado(hp) {
    const k = Math.max(16, Math.round(hp)); if (SPR.cache[k]) return SPR.cache[k];
    const s = k / 560, c = document.createElement('canvas'); c.width = Math.ceil(551 * s); c.height = k;
    const g = c.getContext('2d'); g.imageSmoothingQuality = 'high';
    // reducción en pasos de ½ para que no se pierda el detalle
    let src = SPR.img, w = 551, h = 560;
    while (w * 0.5 > c.width) { const t2 = document.createElement('canvas'); t2.width = Math.ceil(w * 0.5); t2.height = Math.ceil(h * 0.5); const g2 = t2.getContext('2d'); g2.imageSmoothingQuality = 'high'; g2.drawImage(src, 0, 0, t2.width, t2.height); src = t2; w = t2.width; h = t2.height; }
    g.drawImage(src, 0, 0, c.width, c.height);
    // dos capas de patas (traseras / delanteras) separadas por la línea donde se cruzan las patas del lado lejano
    const y0 = Math.round(SPR.cad * s), capa = del => { const q = document.createElement('canvas'); q.width = c.width; q.height = c.height; const h = q.getContext('2d'); h.drawImage(c, 0, 0);
      h.globalCompositeOperation = 'destination-in'; h.beginPath(); const L = SPR.corte;
      if (del) { h.moveTo(c.width, y0); L.forEach(([x, y]) => h.lineTo(x * s, y * s)); h.lineTo(c.width, c.height); }
      else { h.moveTo(0, y0); L.forEach(([x, y]) => h.lineTo(x * s, y * s)); h.lineTo(0, c.height); }
      h.closePath(); h.fill(); return q; };
    c.tras = capa(false); c.del = capa(true);
    const ks = Object.keys(SPR.cache); if (ks.length > 6) delete SPR.cache[ks[0]];
    return (SPR.cache[k] = c);
  }
  function dibujaMartinSprite(ctx, u, px, py, st) {
    const T = st.t || 0, ph = st.fase || 0, anim = st.anim, f = clamp(st.agua / 100, 0, 1);
    const hp = SPR.alto * u, s = hp / 560, cv = sprEscalado(hp);
    let dy = 0, rot = 0, sx = 1, sy = 1;
    if (anim === 'corre') { const c = ph / 3.2 / ((150 * SPR.alto / 560) / 0.62) * Math.PI * 4; dy = -(0.5 + 0.5 * Math.cos(c)) * 0.05 * u; rot = Math.sin(c / 2) * 0.012; }
    else if (anim === 'idle') { sy = 1 + Math.sin(T * 2.2) * 0.012; }
    else if (anim === 'salta') { rot = -0.09; sx = 0.97; sy = 1.04; }
    else if (anim === 'cae') { rot = 0.07; sx = 1.02; sy = 0.98; }
    else if (anim === 'gana') { dy = -Math.abs(Math.sin(T * 6)) * 0.35 * u; rot = Math.sin(T * 6) * 0.04; }
    if (st.golpe > 0) { sy *= 1 - st.golpe * 0.12; sx *= 1 + st.golpe * 0.08; }
    ctx.save(); ctx.globalAlpha = st.alpha == null ? 1 : st.alpha;
    ctx.translate(px, py + dy); if (st.dir < 0) ctx.scale(-1, 1);
    ctx.rotate(rot); ctx.scale(sx, sy);
    // cuerpo fijo y patas animadas: la franja de las patas se dibuja en columnas que se inclinan desde la cadera
    const ox = -SPR.ax * s, oy = -SPR.ay * s, y0 = Math.round(SPR.cad * s), bh = cv.height - y0;
    // la pose de las patas se cuantiza en 24 fotogramas que se pintan una sola vez y se guardan: después cada imagen es un único drawImage
    let clave = 'q', c0 = 0;
    if (anim === 'corre' || anim === 'gana') { const D = 150 * (SPR.alto / 560) / 0.62, dist = anim === 'gana' ? T * 1.2 : ph / 3.2; c0 = Math.floor(((dist / D) % 1 + 1) % 1 * 24) / 24; clave = 'c' + Math.round(c0 * 24); }
    else if (anim === 'salta') clave = 's'; else if (anim === 'cae') clave = 'f';
    if (!cv.fot) cv.fot = {};
    let fr = cv.fot[clave];
    if (!fr) {
      let Ah = 0, Af = 0, Lh = 0, Lf = 0;
      if (clave[0] === 'c') {
        const S = 150, P = 0.62;
        const pie = c => { const v = c - Math.floor(c); if (v < P) return [S / 2 - (v / P) * S, 0]; const w = (v - P) / (1 - P); return [-S / 2 + S * (0.5 - 0.5 * Math.cos(Math.PI * w)), Math.sin(Math.PI * w) * 0.12]; };
        [Ah, Lh] = pie(c0); [Af, Lf] = pie(c0 + 0.5);
      } else if (clave === 's') { Ah = -14; Af = 26; Lh = 0.16; Lf = 0.2; }
      else if (clave === 'f') { Ah = -18; Af = 16; }
      const pad = Math.ceil(110 * s); fr = document.createElement('canvas'); fr.width = cv.width + pad * 2; fr.height = cv.height; fr.pad = pad;
      const g = fr.getContext('2d'); g.drawImage(cv, 0, 0, cv.width, y0, pad, 0, cv.width, y0);
      const N = 40, cw = cv.width / N;
      for (const [lay, A0, L0] of [[cv.tras, Ah, Lh], [cv.del, Af, Lf]]) for (let i = 0; i < N; i++) {
        const x0 = i * cw, xm = (x0 + cw / 2) / s, fy = (SPR.ay - SPR.cad) / (pieY(xm) - SPR.cad), w = Math.min(cw + 1, cv.width - x0);
        g.save(); g.translate(pad + x0, y0); g.transform(1, 0, A0 * s / bh, fy * (1 - L0), 0, 0);
        g.drawImage(lay, x0, y0, w, bh, 0, 0, w, bh); g.restore();
      }
      cv.fot[clave] = fr;
    }
    ctx.drawImage(fr, ox - fr.pad, oy);
    // ronzal: cuelga flojo de la anilla del bozal y vuelve hasta la silla, balanceándose con el paso
    { const sw = Math.sin(T * 2.1) * 6 + (anim === 'corre' ? Math.sin(ph * 1.1) * 8 : 0), P = (x, y) => [(x - SPR.ax) * s, (y - SPR.ay) * s];
      const [a1, a2] = P(467, 156), [c1, c2] = P(455 + sw, 330), [d1, d2] = P(300 + sw * 0.4, 300), [e1, e2] = P(262, 222);
      ctx.lineCap = 'round'; for (const [col, lw] of [['#7a5a32', 7.5], ['#ead6a4', 5]]) { ctx.strokeStyle = col; ctx.lineWidth = lw * s; ctx.beginPath(); ctx.moveTo(a1, a2); ctx.bezierCurveTo(c1, c2, d1, d2, e1, e2); ctx.stroke(); }
      ctx.strokeStyle = 'rgba(150,115,60,.6)'; ctx.lineWidth = 1.4 * s; ctx.setLineDash([4 * s, 3 * s]); ctx.beginPath(); ctx.moveTo(a1, a2); ctx.bezierCurveTo(c1, c2, d1, d2, e1, e2); ctx.stroke(); ctx.setLineDash([]); }
    // nivel de agua en la ventana de la cantimplora
    const [wx, wy, ww, wh] = SPR.win, X = (wx - SPR.ax) * s, Y = (wy - SPR.ay) * s, W = ww * s, H = wh * s, r = Math.min(W, H) * 0.25;
    ctx.fillStyle = '#0d2233'; rr(ctx, X, Y, W, H, r); ctx.fill();
    ctx.save(); rr(ctx, X, Y, W, H, r); ctx.clip(); const hh = H * f;
    ctx.fillStyle = f < 0.3 ? '#ffd24a' : '#3aa0ff'; ctx.fillRect(X, Y + H - hh, W, hh); ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillRect(X, Y + H - hh, W, Math.max(1, H * 0.06)); ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = Math.max(1, s * 2.5); rr(ctx, X, Y, W, H, r); ctx.stroke();
    if (st.golpe > 0) { ctx.globalCompositeOperation = 'source-atop'; }
    ctx.restore();
  }

  function dibujaMartin(ctx, u, px, py, st) {
    if (SPR.ok) return dibujaMartinSprite(ctx, u, px, py, st);
    // (px,py) = pies; u = px por unidad. st: {dir, fase, anim, agua, golpe, t, alpha}
    ctx.save(); ctx.translate(px, py); ctx.scale(st.dir < 0 ? -u : u, -u);
    ctx.globalAlpha = st.alpha == null ? 1 : st.alpha;
    const T = st.t || 0, ph = st.fase, anim = st.anim, corre = anim === 'corre';
    const bob = anim === 'idle' ? Math.sin(T * 2.2) * 0.018 : (corre ? Math.abs(Math.sin(ph)) * 0.05 : 0), B = bob;
    const hop = anim === 'gana' ? Math.abs(Math.sin(T * 6)) * 0.35 : 0;
    const sq = st.golpe > 0 ? 1 - st.golpe * 0.12 : 1, f = clamp(st.agua / 100, 0, 1);
    const cabeceo = anim === 'salta' ? 0.08 : anim === 'cae' ? -0.08 : 0;
    ctx.translate(0, hop); ctx.scale(1 + (1 - sq) * 0.6, sq);
    const hipY = 0.84 + bob;
    const objetivo = (hx, fase, delante) => {
      if (anim === 'salta') return delante ? [hx + 0.34, 0.6] : [hx - 0.3, 0.3];
      if (anim === 'cae') return delante ? [hx + 0.2, 0.12] : [hx - 0.22, 0.1];
      if (corre) { const s = Math.sin(fase), c = Math.cos(fase); return [hx + s * 0.34, Math.max(0, c) * (delante ? 0.32 : 0.26)]; }
      return [hx, 0];
    };
    const fN = ph, fL = ph + Math.PI;
    const patas = [[-0.55, fL, false, false, -1, 0.26], [0.5, fL, true, false, 1, 0.22], [-0.55, fN, false, true, -1, 0.28], [0.5, fN, true, true, 1, 0.24]];
    const dibPata = i => { const [hx, fa, de, ce, sg, an] = patas[i]; const [fx, fy] = objetivo(hx, fa, de); pata(ctx, hx, hipY, fx, fy, sg, ce, an); };
    dibPata(0); dibPata(1);
    ctx.save(); ctx.translate(0, hipY); ctx.rotate(cabeceo); ctx.translate(0, -hipY);
    // cola con gran borla marrón
    const sw = Math.sin(ph * 0.5 + T * 1.5) * 0.07;
    conico(ctx, [[-0.84, 1.1 + B], [-1.0, 1.0 + B], [-1.02 + sw, 0.84 + B], [-0.98 + sw * 1.5, 0.7 + B]], [0.13, 0.1, 0.08, 0.07], PEL.medio, PEL.borde, 0.03);
    ctx.fillStyle = '#7a4a28'; ctx.strokeStyle = '#4a2c18'; ctx.lineWidth = 0.025; ctx.beginPath(); ctx.moveTo(-1.04 + sw * 1.5, 0.74 + B); ctx.quadraticCurveTo(-1.12 + sw * 1.5, 0.5 + B, -1.0 + sw * 1.5, 0.4 + B); ctx.quadraticCurveTo(-0.9 + sw * 1.5, 0.52 + B, -0.9 + sw * 1.5, 0.74 + B); ctx.closePath(); ctx.fill(); ctx.stroke();
    // cuerpo redondeado
    ctx.beginPath(); ctx.moveTo(-0.9, 1.05 + B);
    ctx.bezierCurveTo(-0.9, 1.3 + B, -0.65, 1.42 + B, -0.4, 1.46 + B);
    ctx.bezierCurveTo(-0.44, 1.6 + B, -0.36, 1.94 + B, -0.08, 2.0 + B);
    ctx.bezierCurveTo(0.2, 2.04 + B, 0.36, 1.8 + B, 0.42, 1.52 + B);
    ctx.bezierCurveTo(0.68, 1.42 + B, 0.92, 1.2 + B, 0.9, 0.98 + B);
    ctx.bezierCurveTo(0.88, 0.76 + B, 0.4, 0.7 + B, -0.1, 0.74 + B);
    ctx.bezierCurveTo(-0.5, 0.76 + B, -0.64, 0.8 + B, -0.76, 0.84 + B);
    ctx.bezierCurveTo(-0.92, 0.88 + B, -0.9, 0.96 + B, -0.9, 1.05 + B); ctx.closePath();
    let g = ctx.createLinearGradient(0, 1.75 + B, 0, 0.7 + B); g.addColorStop(0, PEL.luz); g.addColorStop(0.4, PEL.claro); g.addColorStop(0.85, PEL.medio); g.addColorStop(1, PEL.sombra);
    ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = PEL.borde; ctx.lineWidth = 0.035; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.save(); ctx.clip();
    ctx.fillStyle = 'rgba(255,248,225,.45)'; ctx.beginPath(); ctx.ellipse(-0.58, 1.05 + B, 0.22, 0.2, 0.4, 0, TAU); ctx.fill();   // muslo
    ctx.beginPath(); ctx.ellipse(0.55, 1.05 + B, 0.2, 0.22, -0.3, 0, TAU); ctx.fill();   // hombro
    ctx.strokeStyle = 'rgba(160,100,50,.3)'; ctx.lineWidth = 0.016; ctx.lineCap = 'round';
    for (let i = 0; i < 18; i++) { const x = -0.8 + (i % 9) * 0.2 + (i > 8 ? 0.09 : 0), y = 0.82 + Math.floor(i / 9) * 0.26 + hash(i) * 0.1; ctx.beginPath(); ctx.moveTo(x, y + B); ctx.lineTo(x - 0.05, y - 0.07 + B); ctx.stroke(); }
    ctx.restore();
    // pelo largo de la pechera
    ctx.fillStyle = PEL.medio; ctx.strokeStyle = PEL.borde; ctx.lineWidth = 0.02;
    for (let i = 0; i < 5; i++) { const x = 0.8 + (i % 2) * 0.03, y = 1.1 - i * 0.07 + B; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 0.15, y - 0.12 + Math.sin(T * 2 + i) * 0.01, x + 0.02, y - 0.2); ctx.lineTo(x - 0.04, y - 0.02); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    // cuello alto y grueso en S
    const sway = Math.sin(ph * 0.5) * (corre ? 0.04 : 0.01) + Math.sin(T * 1.7) * 0.012, tip = anim === 'salta' ? 0.06 : anim === 'cae' ? -0.1 : 0;
    const N = [[0.55, 1.22 + B], [1.1, 1.08 + B], [0.96, 1.6 + B], [1.2, 1.9 + B + tip]];
    const cub = q => { const m = 1 - q; return [m * m * m * N[0][0] + 3 * m * m * q * N[1][0] + 3 * m * q * q * N[2][0] + q * q * q * N[3][0], m * m * m * N[0][1] + 3 * m * m * q * N[1][1] + 3 * m * q * q * N[2][1] + q * q * q * N[3][1]]; };
    const pts = [], ws = []; for (let i = 0; i <= 14; i++) { const q = i / 14; pts.push(cub(q)); ws.push(0.66 - q * 0.3 - Math.sin(q * Math.PI) * 0.04); }
    conico(ctx, pts, ws, PEL.claro, PEL.borde, 0.035);
    ctx.strokeStyle = 'rgba(255,248,225,.5)'; ctx.lineWidth = 0.07; ctx.beginPath(); for (let i = 3; i <= 11; i++) { const [x, y] = pts[i]; i === 3 ? ctx.moveTo(x - 0.08, y) : ctx.lineTo(x - 0.08, y); } ctx.stroke();
    // cabeza
    ctx.save(); ctx.translate(pts[14][0] + 0.06, pts[14][1] + 0.0); ctx.rotate(-0.2 - tip * 0.8 + sway); ctx.scale(0.9, 0.9); cabeza(ctx, T, st); ctx.restore();
    ctx.beginPath(); ctx.moveTo(-0.42, 1.5 + B); ctx.bezierCurveTo(-0.44, 1.6 + B, -0.36, 1.94 + B, -0.08, 2.0 + B); ctx.bezierCurveTo(0.2, 2.04 + B, 0.36, 1.8 + B, 0.42, 1.52 + B); ctx.closePath();
    ctx.fillStyle = '#e4cf9c'; ctx.fill(); ctx.strokeStyle = '#7a4a24'; ctx.lineWidth = 0.045; ctx.stroke();
    ctx.strokeStyle = 'rgba(122,74,36,.55)'; ctx.lineWidth = 0.012; ctx.setLineDash([0.03, 0.025]); ctx.beginPath(); ctx.moveTo(-0.36, 1.56 + B); ctx.bezierCurveTo(-0.38, 1.7 + B, -0.3, 1.9 + B, -0.08, 1.94 + B); ctx.bezierCurveTo(0.16, 1.98 + B, 0.3, 1.78 + B, 0.36, 1.56 + B); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255,250,230,.45)'; ctx.beginPath(); ctx.ellipse(-0.12, 1.84 + B, 0.14, 0.07, -0.3, 0, TAU); ctx.fill();
    // manta crema y silla verde: asiento de cuero, barandilla con barrotes y caballete en aspa
    const verde = '#2f7d49', verdeO = '#1d5a33', cuero = '#8a4a22';
    ctx.beginPath(); ctx.moveTo(-0.55, 1.12 + B); ctx.quadraticCurveTo(-0.62, 1.4 + B, -0.4, 1.52 + B); ctx.lineTo(0.4, 1.52 + B); ctx.quadraticCurveTo(0.58, 1.4 + B, 0.52, 1.12 + B); ctx.closePath();
    ctx.fillStyle = '#ecdcb4'; ctx.fill(); ctx.strokeStyle = PEL.borde; ctx.lineWidth = 0.03; ctx.stroke();
    for (const x of [-0.34, 0.2]) { ctx.fillStyle = '#d7c08a'; ctx.fillRect(x, 1.14 + B, 0.1, 0.38); ctx.strokeStyle = '#c0453a'; ctx.lineWidth = 0.01; ctx.setLineDash([0.03, 0.025]); ctx.beginPath(); ctx.moveTo(x + 0.05, 1.16 + B); ctx.lineTo(x + 0.05, 1.5 + B); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = '#b9bcc0'; ctx.fillRect(x - 0.01, 1.28 + B, 0.12, 0.06); }
    ctx.strokeStyle = 'rgba(190,160,110,.5)'; ctx.lineWidth = 0.014; ctx.beginPath(); ctx.moveTo(-0.55, 1.2 + B); ctx.lineTo(0.52, 1.2 + B); ctx.stroke();
    // caballete en aspa (delante) y barandilla (detrás)
    ctx.lineCap = 'round'; for (const [c, w] of [[verdeO, 0.07], [verde, 0.045]]) { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(0.5, 1.5 + B); ctx.lineTo(0.5, 1.66 + B); ctx.moveTo(0.5, 1.62 + B); ctx.lineTo(0.58, 1.74 + B); ctx.moveTo(0.5, 1.62 + B); ctx.lineTo(0.42, 1.74 + B); ctx.stroke(); }
    ctx.fillStyle = verde; ctx.strokeStyle = verdeO; ctx.lineWidth = 0.03; ctx.beginPath(); ctx.moveTo(-0.58, 1.38 + B); ctx.lineTo(-0.56, 1.5 + B); ctx.lineTo(0.5, 1.54 + B); ctx.lineTo(0.52, 1.4 + B); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.save(); ctx.translate(-0.04, 1.52 + B); ctx.rotate(0.03); ctx.fillStyle = cuero; rr(ctx, -0.42, 0, 0.84, 0.15, 0.07); ctx.fill(); ctx.strokeStyle = '#4a2a14'; ctx.lineWidth = 0.022; ctx.stroke(); ctx.fillStyle = 'rgba(255,200,140,.3)'; ctx.fillRect(-0.34, 0.09, 0.6, 0.025); ctx.restore();
    ctx.strokeStyle = verdeO; ctx.lineWidth = 0.05; ctx.beginPath(); ctx.moveTo(-0.58, 1.52 + B); ctx.lineTo(-0.58, 1.84 + B); ctx.quadraticCurveTo(-0.55, 1.9 + B, -0.4, 1.9 + B); ctx.stroke(); ctx.strokeStyle = verde; ctx.lineWidth = 0.028; ctx.stroke();
    ctx.strokeStyle = verde; ctx.lineWidth = 0.03; for (const x of [-0.53, -0.45, -0.37]) { ctx.beginPath(); ctx.moveTo(x, 1.54 + B); ctx.lineTo(x, 1.86 + B); ctx.stroke(); }
    ctx.strokeStyle = '#f0e0b0'; ctx.lineWidth = 0.035; ctx.beginPath(); ctx.moveTo(0.2, 1.52 + B); ctx.bezierCurveTo(0.34, 1.48 + B, 0.4, 1.56 + B, 0.3, 1.6 + B); ctx.stroke();   // cuerda del caballete
    // correa verde de pecho con hebilla
    ctx.strokeStyle = verdeO; ctx.lineWidth = 0.075; ctx.beginPath(); ctx.moveTo(0.4, 1.42 + B); ctx.quadraticCurveTo(0.66, 1.26 + B, 0.84, 0.96 + B); ctx.quadraticCurveTo(0.7, 0.8 + B, 0.4, 0.78 + B); ctx.stroke(); ctx.strokeStyle = verde; ctx.lineWidth = 0.05; ctx.stroke();
    ctx.fillStyle = '#d9a35c'; ctx.strokeStyle = '#6a4220'; ctx.lineWidth = 0.02; rr(ctx, 0.5, 1.2 + B, 0.08, 0.1, 0.02); ctx.fill(); ctx.stroke();
    ctx.restore();
    // patas cercanas
    ctx.save(); ctx.translate(0, hipY); ctx.rotate(cabeceo * 0.4); ctx.translate(0, -hipY);
    dibPata(2); dibPata(3);
    ctx.restore();
    // tinaja de barro con ventana de agua, colgada del flanco con correas de cuero
    ctx.save(); ctx.translate(0, hipY); ctx.rotate(cabeceo); ctx.translate(0, -hipY);
    const jx = -0.02, jy = 0.84 + B + (anim === 'gana' ? 0.1 : 0) + (corre ? Math.sin(ph * 2) * 0.012 : 0);
    ctx.strokeStyle = '#7a4524'; ctx.lineWidth = 0.06; ctx.lineCap = 'butt'; ctx.beginPath(); ctx.moveTo(jx - 0.2, 1.22 + B); ctx.lineTo(jx - 0.2, jy + 0.42); ctx.moveTo(jx + 0.2, 1.22 + B); ctx.lineTo(jx + 0.2, jy + 0.42); ctx.stroke();
    ctx.fillStyle = '#d9a35c'; ctx.fillRect(jx - 0.23, 1.12 + B, 0.06, 0.05); ctx.fillRect(jx + 0.17, 1.12 + B, 0.06, 0.05);
    ctx.translate(jx, jy); ctx.scale(0.95, 0.95); ctx.translate(-jx, -jy);
    ctx.beginPath(); ctx.moveTo(jx - 0.22, jy + 0.0); ctx.quadraticCurveTo(jx - 0.3, jy + 0.2, jx - 0.18, jy + 0.44); ctx.lineTo(jx + 0.18, jy + 0.44); ctx.quadraticCurveTo(jx + 0.3, jy + 0.2, jx + 0.22, jy + 0.0); ctx.closePath();
    g = ctx.createRadialGradient(jx - 0.08, jy + 0.3, 0.02, jx, jy + 0.22, 0.34); g.addColorStop(0, '#e88a4a'); g.addColorStop(0.6, '#c8602c'); g.addColorStop(1, '#8e3d18'); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = '#5e2f17'; ctx.lineWidth = 0.035; ctx.stroke();
    ctx.fillStyle = '#a24c22'; rr(ctx, jx - 0.1, jy + 0.44, 0.2, 0.09, 0.03); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#0d2233'; rr(ctx, jx - 0.075, jy + 0.07, 0.15, 0.28, 0.05); ctx.fill();
    ctx.save(); rr(ctx, jx - 0.075, jy + 0.07, 0.15, 0.28, 0.05); ctx.clip();
    const bajo = f < 0.3, hh = 0.28 * f; ctx.fillStyle = bajo ? '#ffd24a' : COL.agua; ctx.fillRect(jx - 0.1, jy + 0.07 + (0.28 - hh), 0.2, hh + 0.01); ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillRect(jx - 0.1, jy + 0.07 + (0.28 - hh), 0.2, 0.02);
    ctx.restore(); ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 0.018; rr(ctx, jx - 0.075, jy + 0.07, 0.15, 0.28, 0.05); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.beginPath(); ctx.ellipse(jx - 0.15, jy + 0.3, 0.025, 0.09, 0.2, 0, TAU); ctx.fill();
    ctx.restore();
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

  let DYN = null;   // mientras se pinta una capa en caché, aquí se anotan los elementos que se mueven (humo, aspas)
  function volcan(ctx, cx, by, ah, aw, lit, dark, t, humo, seed) {
    // cono truncado de Timanfaya: ladera iluminada rojo óxido, sombra morada, cráter ancho y regueros de picón
    const topW = aw * 0.3, ty = by - ah, perfil = () => { ctx.beginPath(); ctx.moveTo(cx - aw, by); ctx.bezierCurveTo(cx - aw * 0.6, by - ah * 0.2, cx - topW * 1.4, ty + ah * 0.08, cx - topW, ty); ctx.quadraticCurveTo(cx, ty - ah * 0.04, cx + topW, ty); ctx.bezierCurveTo(cx + topW * 1.4, ty + ah * 0.08, cx + aw * 0.6, by - ah * 0.2, cx + aw, by); ctx.closePath(); };
    perfil(); let g = ctx.createLinearGradient(cx - aw, 0, cx + aw, 0); g.addColorStop(0, lit); g.addColorStop(0.45, lit); g.addColorStop(0.62, '#7a3f45'); g.addColorStop(1, dark); ctx.fillStyle = g; ctx.fill();
    ctx.save(); perfil(); ctx.clip();
    g = ctx.createLinearGradient(0, ty, 0, by); g.addColorStop(0, 'rgba(255,170,120,.22)'); g.addColorStop(0.5, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(40,20,30,.45)'); ctx.fillStyle = g; ctx.fillRect(cx - aw, ty - 2, aw * 2, ah + 4);
    ctx.strokeStyle = 'rgba(40,18,22,.35)'; ctx.lineWidth = Math.max(1, aw * 0.018); ctx.lineCap = 'round';
    for (let i = 0; i < 9; i++) { const q = hash(seed + i), x0 = cx + (q - 0.5) * topW * 1.9, x1 = cx + (q - 0.5) * aw * 1.8; ctx.beginPath(); ctx.moveTo(x0, ty + ah * 0.06); ctx.quadraticCurveTo((x0 + x1) / 2 + (hash(seed + i + 5) - 0.5) * aw * 0.1, (ty + by) / 2, x1, by); ctx.stroke(); }
    ctx.restore();
    // cráter: borde claro y hueco oscuro
    ctx.fillStyle = '#3a2228'; ctx.beginPath(); ctx.ellipse(cx, ty + ah * 0.01, topW * 0.92, Math.max(2, ah * 0.06), 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(230,150,110,.55)'; ctx.lineWidth = Math.max(1, ah * 0.012); ctx.beginPath(); ctx.ellipse(cx, ty + ah * 0.01, topW * 0.92, Math.max(2, ah * 0.06), 0, Math.PI * 0.05, Math.PI * 0.95); ctx.stroke();
    if (humo) { if (DYN) DYN.push({ k: 'humo', cx, ty, topW: topW * 0.4, ah, aw, seed }); else humoDyn(ctx, { cx, ty, topW: topW * 0.4, ah, aw, seed }, t, 0, 0); }
  }
  function humoDyn(ctx, it, t, ox, oy) {
    const { topW, ah, aw, seed } = it, cx = it.cx + ox, ty = it.ty + oy;
    const gl = ctx.createRadialGradient(cx, ty, 0, cx, ty, topW * 3.2); gl.addColorStop(0, 'rgba(255,140,60,' + (0.45 + Math.sin(t * 2 + seed) * 0.1) + ')'); gl.addColorStop(1, 'rgba(255,90,30,0)'); ctx.fillStyle = gl; ctx.fillRect(cx - topW * 3.2, ty - topW * 3.2, topW * 6.4, topW * 6.4);
    ctx.fillStyle = 'rgba(255,170,80,.9)';
    for (let i = 0; i < 5; i++) { const q = ((t * 0.35 + i * 0.21 + hash(seed + i)) % 1); ctx.beginPath(); ctx.arc(cx + (hash(seed + i * 3) - 0.5) * topW * 2.4 * q * 2, ty - Math.sin(q * Math.PI) * ah * 0.35, Math.max(1, aw * 0.004) * (1 - q * 0.6), 0, TAU); ctx.fill(); }
    for (let i = 0; i < 7; i++) { const q = ((t * 0.06 + i / 7) % 1), y = ty - q * ah * 1.1, x = cx + q * aw * 0.9 + Math.sin(q * 6 + i) * aw * 0.08, r = topW * (0.35 + q * 1.1); ctx.fillStyle = 'rgba(130,118,122,' + (0.28 * (1 - q)) + ')'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
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
    ctx.fillStyle = '#c7412f'; ctx.beginPath(); ctx.moveTo(x - s * 0.4, y - s * 1.5); ctx.lineTo(x, y - s * 2.05); ctx.lineTo(x + s * 0.4, y - s * 1.5); ctx.closePath(); ctx.fill();
    if (DYN) DYN.push({ k: 'molino', x, y: y - s * 1.55, s }); else aspasDyn(ctx, { x, y: y - s * 1.55, s }, t, 0, 0);
  }
  function aspasDyn(ctx, it, t, ox, oy) {
    const s = it.s; ctx.save(); ctx.translate(it.x + ox, it.y + oy); ctx.rotate(t * 0.5); ctx.strokeStyle = '#5a4030'; ctx.lineWidth = Math.max(1, s * 0.06);
    for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 2); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -s * 1.1); ctx.stroke(); ctx.fillStyle = 'rgba(255,248,235,.9)'; ctx.fillRect(-s * 0.06, -s * 1.1, s * 0.22, s * 0.7); }
    ctx.restore();
  }
  function palmera(ctx, x, y, s, t, seed) {
    ctx.strokeStyle = '#6b4a30'; ctx.lineWidth = Math.max(2, s * 0.09); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + s * 0.15, y - s * 0.7, x + s * 0.05, y - s * 1.4); ctx.stroke();
    const tx = x + s * 0.05, ty = y - s * 1.4; ctx.strokeStyle = '#3f7a3a'; ctx.lineWidth = Math.max(1.5, s * 0.07);
    for (let i = 0; i < 7; i++) { const a = -Math.PI * 0.95 + i * (Math.PI * 0.95 / 3) * 0.99 + Math.sin(t * 0.8 + seed + i) * 0.05; const l = s * (0.7 + hash(seed + i) * 0.2); ctx.beginPath(); ctx.moveTo(tx, ty); ctx.quadraticCurveTo(tx + Math.cos(a) * l * 0.6, ty + Math.sin(a) * l * 0.6 - l * 0.3, tx + Math.cos(a) * l, ty + Math.sin(a) * l * 0.6 + l * 0.28); ctx.stroke(); }
  }

  /* ---------- Fondo: capas en caché (se pintan pocas veces y luego solo se desplazan) ---------- */
  const CACHE = new WeakMap(), ESC = 0.5;
  const lienzo = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; };
  function nubeSprite() {
    if (nubeSprite.c) return nubeSprite.c; const s = 64, c = lienzo(s * 5, s * 2.4), g2 = c.getContext('2d'); g2.translate(s * 1.4, s * 1.3);
    for (const [dx, dy, r] of [[0, 0, 1.0], [1.1, -0.35, 0.85], [2.1, -0.05, 1.0], [-1.0, 0.1, 0.7], [3.0, 0.1, 0.65]]) { const cg = g2.createRadialGradient(dx * s, (dy - 0.25) * s, 0, dx * s, dy * s, r * s * 1.1); cg.addColorStop(0, 'rgba(255,255,255,.85)'); cg.addColorStop(1, 'rgba(235,232,245,0)'); g2.fillStyle = cg; g2.beginPath(); g2.ellipse(dx * s, dy * s, r * s * 1.2, r * s * 0.7, 0, 0, TAU); g2.fill(); }
    return (nubeSprite.c = c);
  }
  function capaCache(c, nombre, par, W, H, u, cam, pinta) {
    const Ws = Math.ceil(W * 2.4), Hs = Math.ceil(H + u * 7), off = cam.x * par; let L = c.capas[nombre];
    if (!L || (off - L.off) * u < W * 0.05 || (off - L.off) * u > Ws - W * 1.05) {
      const o = off - W * 0.6 / u; L = c.capas[nombre] = L || {}; L.off = o; L.dyn = [];
      if (!L.cv) L.cv = lienzo(Ws * ESC, Hs * ESC); const g2 = L.cv.getContext('2d'); g2.setTransform(1, 0, 0, 1, 0, 0); g2.clearRect(0, 0, L.cv.width, L.cv.height); g2.scale(ESC, ESC);
      DYN = L.dyn; try { pinta(g2, Ws, Hs, u, { x: o / par, y: 0 }); } finally { DYN = null; }
    }
    const dx = -(off - L.off) * u, dy = H - Hs + cam.y * par * u;
    return { cv: L.cv, dx, dy, Ws, Hs, dyn: L.dyn };
  }

  function pintaLejos(ctx, W, H, u, cam, TM) {
    const hz = H - (0.7 - cam.y * 0.04) * u - u * 2.7;
    let g = ctx.createLinearGradient(0, hz, 0, hz + u * 3); g.addColorStop(0, TM.cielo[3]); g.addColorStop(0.15, '#4a86b4'); g.addColorStop(1, '#1f4f7a'); ctx.fillStyle = g; ctx.fillRect(0, hz, W, u * 3.4);
    ctx.fillStyle = 'rgba(255,248,215,.55)'; for (let i = 0; i < 40; i++) { const x = (i * 83.3) % W, y = hz + u * (0.15 + (i % 7) * 0.3), w = u * (0.12 + (i % 4) * 0.08); ctx.fillRect(x, y, w, Math.max(1, u * 0.025)); }
    capaMontes(ctx, W, H, u, cam, 0.04, 0.7, 2.3, TM.lejos, TM.cielo[3], 1.7);
  }
  function pintaVolcanes(ctx, W, H, u, cam, TM) {
    const per1 = 26, off1 = cam.x * 0.1, i1 = Math.floor(off1 / per1) - 1, by1 = H - (0.35 - cam.y * 0.1) * u;
    for (let i = i1; i < i1 + Math.ceil(W / u / per1) + 3; i++) { const hk = hash(i * 31 + 5), cx = (i * per1 + hk * 14 - off1) * u; volcan(ctx, cx, by1, u * (2.6 + hk * 1.6), u * (5.6 + hk * 2.4), TM.fuego || '#a8512e', '#4e3348', 0, hk > 0.8, i * 13); volcan(ctx, cx + u * (9 + hk * 6), by1, u * (2.6 + hk * 2), u * (4.5 + hk * 2), '#8c4a30', '#2f1f22', 0, false, i * 29 + 7); }
    ctx.fillStyle = TM.med; ctx.fillRect(0, by1 - 1, W, H - by1 + 2);
  }
  function pintaMedia(ctx, W, H, u, cam, TM) {
    capaMontes(ctx, W, H, u, cam, 0.2, 0.15, 1.1, TM.med, '#1a1517', 4.2);
    // malpaís: bloques de lava y matas de tabaiba
    const par = 0.2, off = cam.x * par, by = H - (0.15 - cam.y * par) * u;
    for (let x = -((off * u) % (u * 0.8)) - u; x < W + u; x += u * 0.8) {
      const wx = x / u + off, k = Math.floor(wx / 0.8), hk = hash(k * 13 + 1), y = by - (cresta(wx, 4.2) * 1.1 + 1.1) * u + u * (0.6 + hk * 0.9);
      ctx.fillStyle = hk < 0.5 ? '#3a3336' : '#28222a'; ctx.beginPath(); ctx.ellipse(x, y, u * (0.3 + hk * 0.3), u * (0.16 + hk * 0.12), 0, Math.PI, 0); ctx.fill();
      if (hk > 0.72) { ctx.fillStyle = '#a7b84a'; ctx.beginPath(); ctx.ellipse(x + u * 0.3, y - u * 0.02, u * 0.22, u * 0.12, 0, Math.PI, 0); ctx.fill(); ctx.fillStyle = '#d3c35a'; ctx.beginPath(); ctx.ellipse(x + u * 0.26, y - u * 0.08, u * 0.1, u * 0.05, 0, Math.PI, 0); ctx.fill(); }
    }
  }
  function pintaGeria(ctx, W, H, u, cam, TM) {
    const par = 0.38, off = cam.x * par, by = H - (0.0 - cam.y * par) * u, per = 30;
    const yR = x => by - (0.9 + cresta(x, 8.3) * 0.9) * u;
    ctx.beginPath(); ctx.moveTo(0, H); for (let x = 0; x <= W + 10; x += 10) ctx.lineTo(x, yR(x / u + off)); ctx.lineTo(W + 10, H); ctx.closePath();
    let g = ctx.createLinearGradient(0, by - 3 * u, 0, by + u); g.addColorStop(0, '#4a3a3a'); g.addColorStop(0.3, TM.geria); g.addColorStop(1, '#171112'); ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = 'rgba(190,170,150,.35)'; ctx.lineWidth = Math.max(1, u * 0.06);
    for (let x = -((off * u) % (u * 1.7)); x < W + u; x += u * 1.7) { const wx = (x / u + off); const yy = yR(wx) + u * (0.5 + hash(Math.floor(wx / 1.7)) * 0.9); ctx.beginPath(); ctx.arc(x, yy, u * 0.5, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke(); }
    const i0 = Math.floor(off / per) - 1;
    for (let i = i0; i < i0 + Math.ceil(W / u / per) + 3; i++) {
      const hk = hash(i * 17 + 3), wx = i * per + hk * 10, x = (wx - off) * u, y = yR(wx) + u * 0.15;
      if (hk > 0.7) molino(ctx, x, y, u * 1.5, 0); else if (hk > 0.3) { casa(ctx, x, y, u * 1.4, u * 1.0); casa(ctx, x + u * 1.5, y, u * 1.0, u * 0.75, '#efe7d6'); } else casa(ctx, x, y, u * 1.2, u * 0.9);
      palmera(ctx, x + u * 3.1, y, u * 1.4, 0, i * 7); if (hk > 0.5) palmera(ctx, x - u * 1.2, y, u * 1.1, 0, i * 11);
    }
    // muro de piedra seca volcánica
    { const yM = by + u * 0.25; for (let x = -((off * u) % (u * 0.42)) - u; x < W + u; x += u * 0.42) { const k = Math.floor((x / u + off) / 0.42); for (let f = 0; f < 2; f++) { const hk = hash(k * 7 + f * 31), xx = x + (f ? u * 0.21 : 0), yy = yM - f * u * 0.26 - hk * u * 0.04; ctx.fillStyle = hk < 0.33 ? '#2a2427' : hk < 0.66 ? '#3a3236' : '#4a4044'; ctx.beginPath(); ctx.ellipse(xx, yy, u * (0.19 + hk * 0.04), u * (0.14 + hk * 0.03), (hk - 0.5) * 0.4, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,240,220,.12)'; ctx.beginPath(); ctx.ellipse(xx - u * 0.05, yy - u * 0.06, u * 0.08, u * 0.04, 0, 0, TAU); ctx.fill(); } } }
    g = ctx.createLinearGradient(0, by - u * 3.5, 0, by + u * 0.8); g.addColorStop(0, 'rgba(255,225,185,0)'); g.addColorStop(1, 'rgba(255,225,185,.22)'); ctx.fillStyle = g; ctx.fillRect(0, by - u * 3.5, W, u * 4.3);
    ctx.fillStyle = '#16100f'; ctx.fillRect(0, by + u * 0.8, W, H);
  }

  /* Paisaje ilustrado (paisaje.jpg, 1672×640): se repite en espejo para que empalme sin cortes y se desplaza despacio (paralaje) */
  // un paisaje por nivel: Uga, tras la tormenta, Timanfaya, La Geria (la hoya), la costa y el atardecer
  const PAI = { w: 1672, h: 640, suelo: null, fotos: [
    { src: 'paisaje-uga.jpg', cielo: ['#0070c8', '#0281d4'] },
    { src: 'paisaje.jpg', cielo: ['#0070e0', '#028dfc'] },
    { src: 'paisaje-timanfaya.jpg', cielo: ['#006fae', '#0182bf'] },
    { src: 'paisaje-geria.jpg', cielo: ['#1a96b8', '#25aac6'] },
    { src: 'paisaje-costa.jpg', cielo: ['#1688d0', '#209be4'] },
    { src: 'paisaje-ocaso.jpg', cielo: ['#41629c', '#6b8ccc'] }],
    porTema: [0, 1, 2, 3, 4, 5] };
  function fotoTema(tema) {
    const f = PAI.fotos[PAI.porTema[tema] || 0];
    if (!f.img && typeof Image !== 'undefined') { f.img = new Image(); f.img.onload = () => { f.ok = true; }; f.img.src = f.src; }
    return f.ok ? f : null;
  }
  fotoTema(0);
  function dibujaPaisaje(ctx, W, H, u, cam, TM, t, F) {
    const suelo = (PAI.suelo != null ? PAI.suelo : H - H * (W < H ? 0.27 : 0.3)) + u * 0.5;   // el dibujo se apoya en el suelo que se ve en pantalla
    const alto = Math.max(suelo * 0.78, u * 6.5), k = alto / PAI.h, ancho = PAI.w * k, top = suelo - alto;
    let g = ctx.createLinearGradient(0, 0, 0, Math.max(1, top + 2)); g.addColorStop(0, F.cielo[0]); g.addColorStop(1, F.cielo[1]); ctx.fillStyle = g; ctx.fillRect(0, 0, W, Math.max(0, top) + 2);
    const off = cam.x * u * 0.18, i0 = Math.floor(off / ancho);
    for (let i = i0; ancho * i - off < W; i++) {
      const x = ancho * i - off;
      if (i % 2 === 0) ctx.drawImage(F.img, x, top, ancho + 1, alto);
      else { ctx.save(); ctx.translate(x + ancho, top); ctx.scale(-1, 1); ctx.drawImage(F.img, 0, 0, ancho + 1, alto); ctx.restore(); }
    }
    if (top > 0) { const fz = alto * 0.14, gf = ctx.createLinearGradient(0, top - 1, 0, top + fz); gf.addColorStop(0, F.cielo[1]); gf.addColorStop(1, F.cielo[1] + '00'); ctx.fillStyle = gf; ctx.fillRect(0, top - 1, W, fz + 1); }   // empalme suave entre el cielo y el dibujo
    ctx.fillStyle = '#16100f'; ctx.fillRect(0, suelo - 1, W, H - suelo + 1);
    if (false) { ctx.fillStyle = TM.tinte.replace(/[\d.]+\)$/, m => (parseFloat(m) * 2.5).toFixed(2) + ')'); ctx.fillRect(0, 0, W, suelo); }
  }
  function dibujaFondo(ctx, W, H, u, cam, TM, t) {
    { const F = fotoTema(TEMAS.indexOf(TM)); if (F) return dibujaPaisaje(ctx, W, H, u, cam, TM, t, F); }
    const cv = ctx.canvas, tema = TEMAS.indexOf(TM), key = W + 'x' + H + 'x' + u.toFixed(2) + 'x' + tema;
    let c = CACHE.get(cv); if (!c || c.key !== key) { c = { key, capas: {} }; CACHE.set(cv, c); }
    if (!c.cielo) {   // cielo, sol y rayos: una sola vez
      const k = lienzo(W * ESC, H * ESC), g2 = k.getContext('2d'); g2.scale(ESC, ESC); const sol = [W * TM.sol[0], H * TM.sol[1]];
      let g = g2.createLinearGradient(0, 0, 0, H); g.addColorStop(0, TM.cielo[0]); g.addColorStop(0.38, TM.cielo[1]); g.addColorStop(0.7, TM.cielo[2]); g.addColorStop(1, TM.cielo[3]); g2.fillStyle = g; g2.fillRect(0, 0, W, H);
      g = g2.createRadialGradient(sol[0], sol[1], u * 0.2, sol[0], sol[1], u * 9); g.addColorStop(0, 'rgba(255,245,210,.85)'); g.addColorStop(0.15, 'rgba(255,230,170,.35)'); g.addColorStop(1, 'rgba(255,220,160,0)'); g2.fillStyle = g; g2.fillRect(0, 0, W, H);
      g2.fillStyle = TM.solC; g2.beginPath(); g2.arc(sol[0], sol[1], u * 0.85, 0, TAU); g2.fill();
      if (TM.haz > 0) { g2.save(); g2.globalCompositeOperation = 'lighter'; for (let i = 0; i < 3; i++) { const a = 2.15 + i * 0.4, l = Math.max(W, H) * 1.3; const gg = g2.createLinearGradient(sol[0], sol[1], sol[0] + Math.cos(a) * l, sol[1] + Math.sin(a) * l); gg.addColorStop(0, 'rgba(255,240,200,' + TM.haz * 0.45 + ')'); gg.addColorStop(1, 'rgba(255,240,200,0)'); g2.fillStyle = gg; g2.beginPath(); g2.moveTo(sol[0], sol[1]); g2.lineTo(sol[0] + Math.cos(a - 0.09) * l, sol[1] + Math.sin(a - 0.09) * l); g2.lineTo(sol[0] + Math.cos(a + 0.09) * l, sol[1] + Math.sin(a + 0.09) * l); g2.fill(); } g2.restore(); }
      c.cielo = k;
    }
    ctx.drawImage(c.cielo, 0, 0, W, H);
    // nubes (sprite) y aves
    const sp = nubeSprite();
    for (let i = 0; i < 7; i++) {
      const per = 70, x = ((i * 11.3 + t * (0.18 + (i % 3) * 0.05) - cam.x * 0.05) % per + per) % per - 10, y = H * (0.08 + 0.075 * ((i * 5) % 5)), s = u * (0.8 + (i % 3) * 0.35) * TM.nubes, k = s / 64;
      ctx.drawImage(sp, x * u - 1.4 * s, y - 1.3 * s, sp.width * k, sp.height * k);
    }
    ctx.strokeStyle = 'rgba(40,30,40,.55)'; ctx.lineWidth = Math.max(1, u * 0.04);
    for (let i = 0; i < 3; i++) { const x = (((t * 1.2 + i * 9) % 40) - 4) * u - cam.x * 0.1 * u % (W), y = H * (0.2 + i * 0.05) + Math.sin(t * 2 + i) * u * 0.2, a = Math.sin(t * 6 + i) * 0.3; if (x > -20 && x < W + 20) { ctx.beginPath(); ctx.moveTo(x - u * 0.3, y + a * u * 0.3); ctx.quadraticCurveTo(x - u * 0.12, y - u * 0.12 * (1 + a), x, y); ctx.quadraticCurveTo(x + u * 0.12, y - u * 0.12 * (1 + 0 - a), x + u * 0.3, y + a * u * 0.3); ctx.stroke(); } }
    // capas con paralaje
    for (const [nombre, par, f] of [['lejos', 0.04, pintaLejos], ['volc', 0.1, pintaVolcanes], ['media', 0.2, pintaMedia], ['geria', 0.38, pintaGeria]]) {
      const L = capaCache(c, nombre, par, W, H, u, cam, (g2, Ws, Hs, uu, fc) => f(g2, Ws, Hs, uu, fc, TM));
      L.dy -= Math.max(0, H * (W < H ? 0.27 : 0.3) - u * 0.7);   // el horizonte de cada capa se apoya en la línea del suelo (si no, en vertical quedaba tapado por la tierra)
      { const sx = Math.max(0, -L.dx), sy = Math.max(0, -L.dy), sw = Math.min(W - Math.max(0, L.dx), L.Ws - sx), sh = Math.min(H - Math.max(0, L.dy), L.Hs - sy);
        if (sw > 0 && sh > 0) ctx.drawImage(L.cv, sx * ESC, sy * ESC, sw * ESC, sh * ESC, sx + L.dx, sy + L.dy, sw, sh); }
      for (const it of L.dyn) { const x = it.k === 'humo' ? it.cx : it.x, y = it.k === 'humo' ? it.ty : it.y; if (x + L.dx < -u * 12 || x + L.dx > W + u * 12) continue; if (it.k === 'humo') humoDyn(ctx, it, t, L.dx, L.dy); else aspasDyn(ctx, it, t, L.dx, L.dy); }
    }
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
      // tabaiba / aulaga: mata baja y redonda de ramitas con rosetas verde-amarillas
      ctx.strokeStyle = '#6a5a3a'; ctx.lineWidth = Math.max(1, s * 0.04);
      for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.32; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * s * 0.55, Math.sin(a) * s * 0.5); ctx.stroke(); }
      for (let i = 0; i < 13; i++) { const a = Math.PI + (i / 12) * Math.PI, r = s * (0.42 + hash(i + 3) * 0.14), x = Math.cos(a) * r * 1.05, y = Math.sin(a) * r * 0.85 - s * 0.08;
        ctx.fillStyle = i % 3 ? '#8fae3a' : '#b7c24a'; ctx.beginPath(); ctx.arc(x, y, s * (0.13 + hash(i) * 0.05), 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(240,230,120,.7)'; ctx.beginPath(); ctx.arc(x - s * 0.03, y - s * 0.04, s * 0.04, 0, TAU); ctx.fill(); }
    } else if (d.t === 'lagarto') {
      const mov = d.px != null && d.px + 2.4 > d.x && d.px < d.x + 3.6, w = mov ? Math.sin(t * 28) : Math.sin(t * 2) * 0.2;
      // lagarto atlántico (Gallotia atlantica): esbelto, cabeza en cuña, cola larguísima y motas azules en el costado
      const L = s * 1.0, lw = Math.max(1, s * 0.022), ph = t * (mov ? 28 : 2);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      // cola larga y fina, ondulando
      ctx.strokeStyle = '#2a2a22'; ctx.lineWidth = s * 0.075; ctx.beginPath(); ctx.moveTo(-L * 0.3, -s * 0.12); ctx.bezierCurveTo(-L * 0.6, -s * (0.1 - w * 0.07), -L * 0.85, -s * (0.04 + w * 0.08), -L * 1.35, -s * (0.1 - w * 0.06)); ctx.stroke();
      ctx.strokeStyle = '#4a4636'; ctx.lineWidth = s * 0.06; ctx.stroke();
      // patas con dedos largos (alternas al correr)
      ctx.strokeStyle = '#3a3a2c'; ctx.lineWidth = s * 0.06;
      for (const [lx, fase] of [[0.18, 0], [0.18, Math.PI], [-0.12, Math.PI], [-0.12, 0]]) { const sw2 = Math.sin(ph + fase) * (mov ? 0.12 : 0.03), far = fase > 1; ctx.globalAlpha = far ? 0.6 : 1; ctx.beginPath(); ctx.moveTo(s * lx, -s * 0.11); ctx.lineTo(s * (lx - 0.05 + sw2), -s * 0.04); ctx.lineTo(s * (lx + 0.12 + sw2), 0); ctx.stroke(); }
      ctx.globalAlpha = 1;
      // cuerpo en huso
      ctx.fillStyle = '#4a4636'; ctx.strokeStyle = '#25231a'; ctx.lineWidth = lw;
      ctx.beginPath(); ctx.moveTo(-L * 0.32, -s * 0.13); ctx.bezierCurveTo(-L * 0.1, -s * 0.27, L * 0.2, -s * 0.26, L * 0.36, -s * 0.17); ctx.bezierCurveTo(L * 0.2, -s * 0.05, -L * 0.1, -s * 0.04, -L * 0.32, -s * 0.13); ctx.closePath(); ctx.fill(); ctx.stroke();
      // cabeza triangular
      ctx.beginPath(); ctx.moveTo(L * 0.26, -s * 0.22); ctx.quadraticCurveTo(L * 0.45, -s * 0.24, L * 0.6, -s * 0.15); ctx.quadraticCurveTo(L * 0.45, -s * 0.07, L * 0.26, -s * 0.08); ctx.closePath(); ctx.fillStyle = '#524e3a'; ctx.fill(); ctx.stroke();
      // franjas claras del lomo y motas azules del costado
      ctx.strokeStyle = '#b9b48a'; ctx.lineWidth = s * 0.018; ctx.beginPath(); ctx.moveTo(-L * 0.28, -s * 0.2); ctx.quadraticCurveTo(0, -s * 0.28, L * 0.3, -s * 0.22); ctx.stroke();
      ctx.fillStyle = '#4db3d9'; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(-L * 0.2 + i * L * 0.12, -s * 0.11 - (i % 2) * s * 0.02, s * 0.022, 0, TAU); ctx.fill(); }
      ctx.fillStyle = '#e9e2b0'; ctx.beginPath(); ctx.arc(L * 0.43, -s * 0.16, s * 0.02, 0, TAU); ctx.fill();
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
    { // altura en pantalla del suelo bajo el centro de la vista (suavizada) para apoyar el paisaje
      const cx = cam.x + W / u / 2; let top = null; for (const s of L.solids) if (s.kind === 'ground' && s.x0 <= cx + 3 && s.x1 >= cx - 3 && (top == null || s.top > top)) top = s.top;
      if (top != null) { const y = sy(top); PAI.suelo = PAI.suelo == null || Math.abs(PAI.suelo - y) > H * 0.5 ? y : PAI.suelo + (y - PAI.suelo) * 0.06; } }
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
    const TM = TEMAS[esc.tema || 0], cv = ctx.canvas, key = W + 'x' + H + 'x' + (esc.tema || 0); let c = CACHE.get(cv);
    if (!c) { c = { key: '', capas: {} }; CACHE.set(cv, c); }
    if (c.postKey !== key) {
      const k = lienzo(W * ESC, H * ESC), g2 = k.getContext('2d'); g2.scale(ESC, ESC);
      g2.fillStyle = TM.tinte; g2.fillRect(0, 0, W, H);
      let g = g2.createRadialGradient(W / 2, H * 0.55, Math.min(W, H) * 0.35, W / 2, H * 0.55, Math.max(W, H) * 0.8); g.addColorStop(0, 'rgba(8,4,12,0)'); g.addColorStop(1, 'rgba(8,4,12,.45)'); g2.fillStyle = g; g2.fillRect(0, 0, W, H);
      const k2 = lienzo(W * ESC, H * ESC), h2 = k2.getContext('2d'); h2.scale(ESC, ESC);
      g = h2.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.4, W / 2, H / 2, Math.max(W, H) * 0.75); g.addColorStop(0, 'rgba(255,200,40,0)'); g.addColorStop(1, 'rgba(255,190,30,.28)'); h2.fillStyle = g; h2.fillRect(0, 0, W, H);
      c.post = k; c.postBajo = k2; c.postKey = key;
    }
    ctx.drawImage(c.post, 0, 0, W, H);
    if (agua > 0 && agua < 30) ctx.drawImage(c.postBajo, 0, 0, W, H);
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
