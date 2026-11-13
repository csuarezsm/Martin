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
    { cielo: ['#2e2f6e', '#a2506b', '#f08a5a', '#ffd27a'], sol: [0.76, 0.42], solC: '#ffe9a8', haz: 0.22, lejos: '#8a5f78', lejos2: '#6d4a64', med: '#2a1f24', geria: '#1f171b', tinte: 'rgba(255,110,60,0.14)', nubes: 0.8 },
    // Mundo 2 (2.3): El Golfo, Janubio, Famara, Haría y el Mirador del Río
    { cielo: ['#0e62b8', '#2c8ad8', '#79bfe9', '#d4ecf6'], sol: [0.8, 0.16], solC: '#fff6d8', haz: 0.05, lejos: '#8e86a8', lejos2: '#746c90', med: '#2c2628', geria: '#272022', tinte: 'rgba(120,200,170,0.05)', nubes: 0.7 },
    { cielo: ['#2266b8', '#5e9ad8', '#b9d6ec', '#f3e3d0'], sol: [0.7, 0.2], solC: '#fffaf0', haz: 0.08, lejos: '#a08ea8', lejos2: '#86749a', med: '#302a2c', geria: '#2a2224', tinte: 'rgba(255,200,210,0.07)', nubes: 0.6 },
    { cielo: ['#3f6d9e', '#7aa0c4', '#c3d3df', '#e9e1cf'], sol: [0.6, 0.18], solC: '#fffbe8', haz: 0.12, lejos: '#8c94a0', lejos2: '#727c8a', med: '#2f2b2a', geria: '#272322', tinte: 'rgba(230,220,200,0.08)', nubes: 1.2 },
    { cielo: ['#1260b8', '#3a8ad4', '#86c2ea', '#d8eef6'], sol: [0.82, 0.14], solC: '#fff8dc', haz: 0.05, lejos: '#7f9a8c', lejos2: '#68826f', med: '#2c2a26', geria: '#24221e', tinte: 'rgba(160,220,140,0.05)', nubes: 0.9 },
    { cielo: ['#1d4f9a', '#4a86c8', '#9cc6e6', '#e4f0f6'], sol: [0.78, 0.12], solC: '#fffbe6', haz: 0.04, lejos: '#7e8aa6', lejos2: '#66708e', med: '#2a2629', geria: '#221e21', tinte: 'rgba(170,200,255,0.06)', nubes: 1.1 },
    // secretos: Cueva de los Verdes (fondo dibujado) y La Graciosa
    { cielo: ['#120c0a', '#1e1411', '#2a1c16', '#3a271e'], sol: [0.5, 0.1], solC: '#ffcf8a', haz: 0, lejos: '#2a1d18', lejos2: '#22170f', med: '#1a120f', geria: '#140e0b', tinte: 'rgba(255,170,90,0.06)', nubes: 0 },
    { cielo: ['#0f62c0', '#2f8ad8', '#7cc2ec', '#d8eef8'], sol: [0.8, 0.14], solC: '#fff8dc', haz: 0.05, lejos: '#8c94a0', lejos2: '#727c8a', med: '#2f2b2a', geria: '#272322', tinte: 'rgba(230,220,200,0.06)', nubes: 1.0 },
    // Mundo 3 (3.0): el guelfo de Uga — mañana de invierno, el pueblo, el Vallito, el amanecer, el calor de julio, el eclipse a la caída de la tarde, el Echadero y la arena negra
    { cielo: ['#2a6fbf', '#5a98d6', '#a9cbe6', '#efe2c8'], sol: [0.78, 0.2], solC: '#fff3d0', haz: 0.06, lejos: '#9590b8', lejos2: '#7b74a0', fuego: '#ad4c36', med: '#302a2c', geria: '#2c2425', tinte: 'rgba(255,225,190,0.06)', nubes: 0.9 },
    { cielo: ['#0b58bd', '#2a80da', '#74b8ec', '#d6ebf7'], sol: [0.6, 0.12], solC: '#fffbe6', haz: 0.04, lejos: '#9590b8', lejos2: '#7b74a0', fuego: '#ad4c36', med: '#302a2c', geria: '#2c2425', tinte: 'rgba(255,255,255,0.03)', nubes: 1 },
    { cielo: ['#1260b8', '#3a8ad4', '#86c2ea', '#d8eef6'], sol: [0.82, 0.14], solC: '#fff8dc', haz: 0.05, lejos: '#8f86b0', lejos2: '#766c98', fuego: '#b4513a', med: '#2f2a2d', geria: '#2a2223', tinte: 'rgba(255,230,170,0.05)', nubes: 0.8 },
    { cielo: ['#3a4a8a', '#8a6fa8', '#f0a58a', '#ffd9a0'], sol: [0.2, 0.42], solC: '#ffe2b0', haz: 0.16, lejos: '#9a7ea0', lejos2: '#7d6488', med: '#2f2428', geria: '#241b20', tinte: 'rgba(255,170,140,0.12)', nubes: 0.7 },
    { cielo: ['#3f8ad6', '#79b2e4', '#cfe0ea', '#f6e6c4'], sol: [0.55, 0.08], solC: '#ffffff', haz: 0.2, lejos: '#a08ea0', lejos2: '#86748a', fuego: '#b4513a', med: '#33292c', geria: '#2a2022', tinte: 'rgba(255,190,90,0.12)', nubes: 0.2 },
    { cielo: ['#2e2f6e', '#a2506b', '#f08a5a', '#ffd27a'], sol: [0.76, 0.4], solC: '#ffe9a8', haz: 0.2, lejos: '#8a5f78', lejos2: '#6d4a64', med: '#2a1f24', geria: '#1f171b', tinte: 'rgba(255,110,60,0.12)', nubes: 0.5 },
    { cielo: ['#1d66bf', '#4f93d6', '#b9d2e2', '#f2cf9e'], sol: [0.84, 0.3], solC: '#ffe8b0', haz: 0.1, lejos: '#9a88ad', lejos2: '#80709a', med: '#33292c', geria: '#2a2022', tinte: 'rgba(255,170,90,0.08)', nubes: 0.9 },
    { cielo: ['#0e62b8', '#2c8ad8', '#79bfe9', '#d4ecf6'], sol: [0.8, 0.16], solC: '#fff6d8', haz: 0.05, lejos: '#8e86a8', lejos2: '#746c90', med: '#2c2628', geria: '#272022', tinte: 'rgba(120,200,170,0.05)', nubes: 0.7 },
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
      // texturas pintadas sacadas de los paisajes (mismo estilo que el fondo)
      for (const [k, src] of [['tierraP', 'suelo-tierra.jpg'], ['lavaP', 'suelo-lava.jpg']]) { const im = new Image(); im.onload = () => { TEX[k] = im; }; im.src = src; }
    } catch (e) { TEX = {}; }
    return TEX;
  }
  function relleno(ctx, tex, ox, oy, fallback, esc) {
    if (!tex) return fallback;
    const p = ctx.createPattern(tex, 'repeat');
    try { if (p && p.setTransform) p.setTransform(new DOMMatrix().translate(Math.round(ox), Math.round(oy)).scale(esc || 1)); } catch (e) {}
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
      if (g.kind !== 'ground' || g.bot > -1e8 || g.sal) continue;
      for (let x = g.x0 + 1.6; x < g.x1 - 1.6; x += 1.9) {
        const h = hash(Math.floor(x * 10) + k * 977);
        if (h < 0.62) {
          const choque = L.solids.some(r => r.kind === 'rock' && r.x0 < x + 1.4 && r.x1 > x - 1.4 && Math.abs(r.top - g.top) < 3);
          const cerca = (L.obstacles || []).some(o => o.kind === 'gap' && o.x0 < x + 1.3 && o.x1 > x - 1.3);
          if (!choque && !cerca) {
            const q = hash(Math.floor(x * 13) + k * 31);
            if (sc.tema === 11) { if (q < 0.5) sc.deco.push({ x: x + h * 1.0, y: g.top, t: 'piedra', s: 0.75 + h * 1.0, h: q }); continue; }   // en la cueva no crecen plantas: solo piedras
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
    if (!st.guelfo) { const lona = (pts) => { ctx.lineCap = 'round'; ctx.strokeStyle = '#7a5a3a'; ctx.lineWidth = 0.075; ctx.beginPath(); pts(); ctx.stroke(); ctx.strokeStyle = '#ecdcb0'; ctx.lineWidth = 0.056; ctx.beginPath(); pts(); ctx.stroke(); ctx.strokeStyle = '#c0453a'; ctx.lineWidth = 0.01; ctx.setLineDash([0.03, 0.025]); ctx.beginPath(); pts(); ctx.stroke(); ctx.setLineDash([]); };
    lona(() => { ctx.moveTo(0.46, 0.0); ctx.quadraticCurveTo(0.42, -0.1, 0.44, -0.24); });                 // frontalera del hocico
    lona(() => { ctx.moveTo(0.44, -0.06); ctx.quadraticCurveTo(0.2, -0.04, 0.0, 0.0); });               // carrillera
    lona(() => { ctx.moveTo(0.0, 0.2); ctx.quadraticCurveTo(0.08, 0.02, 0.0, -0.14); });              // testera
    lona(() => { ctx.moveTo(0.2, 0.16); ctx.quadraticCurveTo(0.26, 0.04, 0.22, -0.04); });
    ctx.fillStyle = '#b9bcc0'; ctx.strokeStyle = '#555'; ctx.lineWidth = 0.012; rr(ctx, 0.14, -0.05, 0.06, 0.07, 0.01); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#9a9ea2'; ctx.lineWidth = 0.025; ctx.beginPath(); ctx.arc(0.43, -0.29, 0.035, 0, TAU); ctx.stroke();
    // cuerda que cuelga del bozal
    const rs = Math.sin(T * 2.3) * 0.03; ctx.strokeStyle = '#ead6a4'; ctx.lineWidth = 0.05; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0.43, -0.31); ctx.quadraticCurveTo(0.34 + rs, -0.6, 0.5 + rs * 2, -0.8); ctx.stroke(); ctx.strokeStyle = '#b89a62'; ctx.lineWidth = 0.014; ctx.stroke(); }
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

  /* Martín de guelfo (Mundo 3): ilustración guelfo.png (461×640, mirando a la derecha, las cuatro pezuñas en la misma línea).
     Las patas se mueven inclinando la franja de debajo de la cadera: traseras y delanteras a contratiempo. Los fotogramas se pintan una vez y se guardan. */
  const GSP0 = { img: null, ok: false, w: 461, h: 640, ax: 217, ay: 640, alto: 2.6, cad: 376, corte: 0.45, cache: {}, paso: 0.24, alza: 0.1,
    patas: [[0, 95, 0, 0], [95, 125, 0, 1], [125, 240, 1, 1], [240, 290, 1, 0], [290, 461, 0, 0]] };
  const GSP = GSP0; if (typeof Image !== 'undefined') { GSP.img = new Image(); GSP.img.onload = () => { GSP.ok = true; }; GSP.img.src = 'guelfo.png'; }
  const CSP = { img: null, ok: false, w: 380, h: 640, ax: 190, ay: 636, alto: 2.25, cad: 330, corte: 0.5, cache: {} };   // el camellero (camellero.png, 380×640, de lado mirando a la derecha)
  if (typeof Image !== 'undefined') { CSP.img = new Image(); CSP.img.onload = () => { CSP.ok = true; }; CSP.img.src = 'camellero.png'; }
  function guelfoFoto(hp, clave, ang, GSP) {
    const k = Math.max(16, Math.round(hp)), C = GSP.cache[k] || (GSP.cache[k] = {});
    if (!C.base) {
      const s = k / GSP.h, c = document.createElement('canvas'); c.width = Math.ceil(GSP.w * s); c.height = k;
      let src = GSP.img, w = GSP.w, h = GSP.h;
      while (w * 0.5 > c.width) { const t2 = document.createElement('canvas'); t2.width = Math.ceil(w * 0.5); t2.height = Math.ceil(h * 0.5); const g2 = t2.getContext('2d'); g2.imageSmoothingQuality = 'high'; g2.drawImage(src, 0, 0, t2.width, t2.height); src = t2; w = t2.width; h = t2.height; }
      const g = c.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(src, 0, 0, c.width, c.height); C.base = c; C.s = s;
      const ks = Object.keys(GSP.cache); if (ks.length > 6) delete GSP.cache[ks[0]];
    }
    clave = 'k' + clave; if (C[clave]) return C[clave];
    const b = C.base, s = C.s, y0 = Math.round(GSP.cad * s), pad = Math.ceil(b.height * 0.2), xc = Math.round(b.width * GSP.corte);
    const f = document.createElement('canvas'); f.width = b.width + pad * 2; f.height = b.height; f.pad = pad; const g = f.getContext('2d');
    g.drawImage(b, 0, 0, b.width, y0, pad, 0, b.width, y0);
    const bh = b.height - y0;
    if (GSP.patas && ang.length === 3) {   // paso de camello (ambladura): las dos patas del mismo lado se mueven a la vez; cada pata, en tiras finas que giran desde la cadera
      const ph = ang[0], S = GSP.paso * bh, N = 120, cw = b.width / N, z = GSP.patas;
      const pie = c => { const v = ((c % 1) + 1) % 1, P = 0.6; if (v < P) return [S / 2 - (v / P) * S, 0]; const w = (v - P) / (1 - P); return [-S / 2 + S * (0.5 - 0.5 * Math.cos(Math.PI * w)), Math.sin(Math.PI * w) * GSP.alza]; };
      const lado = xo => { for (const [a0, a1, l0, l1] of z) if (xo >= a0 && xo <= a1) return l0 + (l1 - l0) * (xo - a0) / Math.max(1, a1 - a0); return 0; };   // 0 = lado cercano, 1 = lado lejano (con transición suave)
      for (let i = 0; i < N; i++) {
        const x0 = i * cw, xo = (x0 + cw / 2) / s, l = lado(xo), [d0, h0] = pie(ph), [d1, h1] = pie(ph + 0.5), dx = d0 + (d1 - d0) * l, lift = h0 + (h1 - h0) * l, w = Math.min(cw + 1.5, b.width - x0);
        g.save(); g.translate(pad + x0, y0); g.transform(1, 0, dx / bh, 1 - lift, 0, 0); g.drawImage(b, x0, y0, w, bh, 0, 0, w, bh); g.restore();
      }
    } else for (const [x0, x1, sh] of [[0, xc, ang[0]], [xc, b.width, ang[1]]]) { g.save(); g.translate(pad + x0, y0); g.transform(1, 0, sh, 1, 0, 0); g.drawImage(b, x0, y0, x1 - x0, bh, 0, 0, x1 - x0, bh); g.restore(); }
    return (C[clave] = f);
  }
  // el paso del guelfo: 12 dibujos (guelfo-paso.png, 278×286 cada uno; el 1 es de pie y del 2 al 12 un paso completo)
  const GW0 = { img: null, ok: false, n: 12, fw: 278, fh: 286, ax: 143, ay: 284, alto: 2.75, pie: 1, cache: {} };
  // el paso del camellero: 7 dibujos (camellero-paso.png, 380×480 cada uno), de la zancada más larga a la más corta: cada vuelta es un paso
  const CW = { img: null, ok: false, n: 7, fw: 380, fh: 480, ax: 182, ay: 479, alto: 2.35, pie: 0, cache: {} };
  if (typeof Image !== 'undefined') for (const [o, src] of [[GW0, 'guelfo-paso.png'], [CW, 'camellero-paso.png']]) { o.img = new Image(); o.img.onload = () => { o.ok = true; }; o.img.src = src; }
  function pasoEscalado(hp, GW) {
    const k = Math.max(16, Math.round(hp)); if (GW.cache[k]) return GW.cache[k];
    const s = k / GW.fh, c = document.createElement('canvas'); c.width = Math.ceil(GW.fw * GW.n * s); c.height = k;
    let src = GW.img, w = GW.fw * GW.n, h = GW.fh;
    while (h * 0.5 > k) { const t2 = document.createElement('canvas'); t2.width = Math.ceil(w * 0.5); t2.height = Math.ceil(h * 0.5); const g2 = t2.getContext('2d'); g2.imageSmoothingQuality = 'high'; g2.drawImage(src, 0, 0, t2.width, t2.height); src = t2; w = t2.width; h = t2.height; }
    const g = c.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(src, 0, 0, c.width, c.height); c.s = s;
    const ks = Object.keys(GW.cache); if (ks.length > 6) delete GW.cache[ks[0]];
    return (GW.cache[k] = c);
  }
  function dibujaGuelfoPaso(ctx, u, px, py, st, SP) {
    const GW = SP || GW0, T = st.t || 0, anim = st.anim, hp = GW.alto * u, c = pasoEscalado(hp, GW), s = c.s;
    let f = 0, dy = 0, rot = 0, sy = 1;
    if (anim === 'corre' || anim === 'gana') { const fase = anim === 'gana' ? T * 7 : (st.fase || 0) * 0.55, v = ((fase / (Math.PI * 2)) % 1 + 1) % 1; f = GW.pie + Math.floor(v * (GW.n - GW.pie)) % (GW.n - GW.pie); }
    else if (anim === 'salta') { f = 2; rot = -0.06; }
    else if (anim === 'cae') { f = 8; rot = 0.05; }
    else sy = 1 + Math.sin(T * 2.4) * 0.012;
    if (anim === 'gana') dy -= Math.abs(Math.sin(T * 6)) * 0.3 * u;
    if (st.golpe > 0) sy *= 1 - st.golpe * 0.12;
    const fw = GW.fw * s;
    ctx.save(); ctx.globalAlpha = st.alpha == null ? 1 : st.alpha; ctx.translate(px, py + dy); if (st.dir < 0) ctx.scale(-1, 1); ctx.rotate(rot); ctx.scale(1, sy);
    ctx.drawImage(c, f * fw, 0, fw, c.height, -GW.ax * s, -GW.ay * s, fw, c.height);
    ctx.restore();
  }
  function dibujaGuelfo(ctx, u, px, py, st, SP) {
    const GSP = SP || GSP0, T = st.t || 0, anim = st.anim, hp = GSP.alto * u, s = hp / GSP.h;
    let dy = 0, rot = 0, sx = 1, sy = 1, clave = 'q', ang = [0, 0];
    if (anim === 'corre' || anim === 'gana') { const fase = anim === 'gana' ? T * 7 : (st.fase || 0) * 0.55, q = Math.round(((fase / (Math.PI * 2)) % 1 + 1) % 1 * 16) % 16, a = Math.sin(q / 16 * Math.PI * 2) * 0.2;
      if (true) { const w = q / 16 * Math.PI * 2; clave = 'q'; dy = -Math.abs(Math.sin(w)) * 0.03 * u; rot = Math.sin(w) * 0.018; sy = 1 + Math.cos(w * 2) * 0.006; }   // guelfo: no se deforman las patas (con una sola ilustración no quedaba natural); solo un balanceo suave al andar
      else { clave = 'c' + q; ang = [a, -a]; dy = -Math.abs(Math.cos(q / 16 * Math.PI * 2)) * 0.035 * u; } }
    else if (anim === 'salta') { clave = 's'; ang = [0.22, -0.26]; rot = -0.07; }
    else if (anim === 'cae') { clave = 'f'; ang = [-0.12, 0.16]; rot = 0.06; }
    else sy = 1 + Math.sin(T * 2.4) * 0.012;
    if (anim === 'gana') dy -= Math.abs(Math.sin(T * 6)) * 0.3 * u;
    if (st.golpe > 0) { sy *= 1 - st.golpe * 0.12; sx *= 1 + st.golpe * 0.08; }
    const fr = guelfoFoto(hp, clave, ang, GSP);
    ctx.save(); ctx.globalAlpha = st.alpha == null ? 1 : st.alpha; ctx.translate(px, py + dy); if (st.dir < 0) ctx.scale(-1, 1); ctx.rotate(rot); ctx.scale(sx, sy);
    ctx.drawImage(fr, -GSP.ax * s - fr.pad, -GSP.ay * s);
    ctx.restore();
  }

  function dibujaMartin(ctx, u, px, py, st) {
    if (st.guelfo && GW0.ok) return dibujaGuelfoPaso(ctx, u, px, py, st);
    if (st.guelfo && GSP.ok) return dibujaGuelfo(ctx, u, px, py, st);
    if (SPR.ok && !st.guelfo) return dibujaMartinSprite(ctx, u, px, py, st);
    const GU = !!st.guelfo;   // Mundo 3: guelfo sin manta, sin silla, sin tinaja y sin cabezada; cabeza más grande
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
    ctx.save(); ctx.translate(pts[14][0] + 0.06, pts[14][1] + 0.0); ctx.rotate(-0.2 - tip * 0.8 + sway); ctx.scale(GU ? 1.12 : 0.9, GU ? 1.12 : 0.9); cabeza(ctx, T, st); ctx.restore();
    if (GU) {   // joroba de guelfo: forma parte del cuerpo (sin costura por debajo) y solo se perfila por arriba
      const jo = () => { ctx.moveTo(-0.5, 1.36 + B); ctx.bezierCurveTo(-0.5, 1.56 + B, -0.36, 1.86 + B, -0.08, 1.9 + B); ctx.bezierCurveTo(0.2, 1.94 + B, 0.4, 1.7 + B, 0.46, 1.36 + B); };
      const gj = ctx.createLinearGradient(0, 1.9 + B, 0, 1.3 + B); gj.addColorStop(0, PEL.luz); gj.addColorStop(1, PEL.claro);
      ctx.beginPath(); jo(); ctx.closePath(); ctx.fillStyle = gj; ctx.fill();
      ctx.beginPath(); jo(); ctx.strokeStyle = PEL.borde; ctx.lineWidth = 0.035; ctx.stroke();
      ctx.fillStyle = 'rgba(255,250,230,.4)'; ctx.beginPath(); ctx.ellipse(-0.14, 1.74 + B, 0.16, 0.07, -0.25, 0, TAU); ctx.fill();
    } else {
    ctx.beginPath(); ctx.moveTo(-0.42, 1.5 + B); ctx.bezierCurveTo(-0.44, 1.6 + B, -0.36, 1.94 + B, -0.08, 2.0 + B); ctx.bezierCurveTo(0.2, 2.04 + B, 0.36, 1.8 + B, 0.42, 1.52 + B); ctx.closePath();
    ctx.fillStyle = '#e4cf9c'; ctx.fill(); ctx.strokeStyle = '#7a4a24'; ctx.lineWidth = 0.045; ctx.stroke(); }
    if (!GU) { ctx.strokeStyle = 'rgba(122,74,36,.55)'; ctx.lineWidth = 0.012; ctx.setLineDash([0.03, 0.025]); ctx.beginPath(); ctx.moveTo(-0.36, 1.56 + B); ctx.bezierCurveTo(-0.38, 1.7 + B, -0.3, 1.9 + B, -0.08, 1.94 + B); ctx.bezierCurveTo(0.16, 1.98 + B, 0.3, 1.78 + B, 0.36, 1.56 + B); ctx.stroke(); ctx.setLineDash([]);
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
    ctx.fillStyle = '#d9a35c'; ctx.strokeStyle = '#6a4220'; ctx.lineWidth = 0.02; rr(ctx, 0.5, 1.2 + B, 0.08, 0.1, 0.02); ctx.fill(); ctx.stroke(); }
    ctx.restore();
    // patas cercanas
    ctx.save(); ctx.translate(0, hipY); ctx.rotate(cabeceo * 0.4); ctx.translate(0, -hipY);
    dibPata(2); dibPata(3);
    ctx.restore();
    // tinaja de barro con ventana de agua, colgada del flanco con correas de cuero
    if (!GU) { ctx.save(); ctx.translate(0, hipY); ctx.rotate(cabeceo); ctx.translate(0, -hipY);
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
    ctx.restore(); }
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
    { src: 'paisaje-uga.jpg', ini: 0.36, fin: 0.83, cielo: ['#0070c8', '#0281d4'] },
    { src: 'paisaje.jpg', ini: 0.24, fin: 0.9, cielo: ['#0070e0', '#028dfc'] },
    { src: 'paisaje-timanfaya.jpg', cielo: ['#006fae', '#0182bf'] },
    { src: 'paisaje-geria.jpg', ini: 0.34, cielo: ['#1a96b8', '#25aac6'] },
    { src: 'paisaje-costa.jpg', mar: [0.42, 1], cielo: ['#1688d0', '#209be4'] },
    { src: 'paisaje-ocaso.jpg', ini: 0.17, cielo: ['#41629c', '#6b8ccc'] },
    // Mundo 2: El Golfo, Janubio, Famara, Haría y el Mirador del Río
    { src: 'paisaje-golfo.jpg', mar: [0.5, 1], cielo: ['#007cf0', '#008bfd'] },
    { src: 'paisaje-janubio.jpg', cielo: ['#007cf0', '#0089fe'] },
    { src: 'paisaje-famara.jpg', mar: [0.55, 1], cielo: ['#0070e8', '#007ffb'] },
    { src: 'paisaje-haria.jpg', ini: 0.2, cielo: ['#0070e8', '#0080fd'] },
    { src: 'paisaje-mirador.jpg', mar: [0.27, 1], cielo: ['#006ae8', '#0078fb'] },
    // Mundo 3: las calles de Uga (panorámicas)
    { src: 'paisaje-uga-iglesia.jpg', cielo: ['#1f6fd8', '#3d8fe6'] },
    { src: 'paisaje-uga-calle.jpg', cielo: ['#1f6fd8', '#3d8fe6'] }],
    porTema: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, -1, 8, 11, 12, 0, 0, 2, 5, 2, 6] };   // Mundo 3: Uga, Timanfaya (calor y Echadero), atardecer (eclipse) y El Golfo (arena negra)   // 11: cueva (fondo dibujado); 12: La Graciosa (vista del risco de Famara)
  function fotoTema(tema) {
    if (PAI.porTema[tema] === -1) return null;
    const f = PAI.fotos[PAI.porTema[tema] || 0];
    if (!f.img && typeof Image !== 'undefined') {
      f.img = new Image();
      f.img.onload = () => {   // el dibujo entero (sin fundidos, que mezclaban dos sitios distintos); nunca se repite
        const x0 = Math.round(f.img.naturalWidth * (f.ini || 0)), w = Math.round(f.img.naturalWidth * (f.fin || 1)) - x0, h = f.img.naturalHeight;   // se recorta lo que no conviene en los bordes (palmeras grandes…)
        const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(f.img, x0, 0, w, h, 0, 0, w, h);
        f.tile = c; f.ok = true;
        if (f.mar) try { f.agua = capaAgua(c, f.mar); } catch (e) { f.agua = null; }
      };
      f.img.src = f.src;
    }
    return f.ok ? f : null;
  }
  fotoTema(0);
  /* Oleaje: se separa del dibujo solo el agua (píxeles azules o de espuma dentro de la franja del mar) y luego se pinta
     encima en tiras finas que suben y bajan un poco, como olas que llegan a la orilla. La arena, el risco o la laguna no se mueven. */
  function capaAgua(c, mar) {
    const w = c.width, h = c.height, y0 = Math.floor(h * mar[0]), y1 = Math.min(h, Math.ceil(h * mar[1]));
    const src = c.getContext('2d').getImageData(0, y0, w, y1 - y0), d = src.data, n = w * (y1 - y0), a = new Float32Array(n);
    for (let i = 0; i < n; i++) { const r = d[i * 4], g = d[i * 4 + 1], b = d[i * 4 + 2];
      a[i] = (b >= r + 25 && b >= g - 15 && b > 90) ? 1 : (Math.min(r, g, b) > 205 && b >= r - 8) ? 1 : 0; }
    // bordes suaves (para que no se note el recorte) y la franja se funde arriba con el horizonte
    const t = new Float32Array(n), R = 3, hh = y1 - y0;   // desenfoque en caja con sumas acumuladas (rápido: no frena al empezar el nivel)
    for (let y = 0; y < hh; y++) { const o = y * w; let sm = 0, k = 0; for (let j = 0; j < R && j < w; j++) { sm += a[o + j]; k++; }
      for (let x = 0; x < w; x++) { const e = x + R, b = x - R - 1; if (e < w) { sm += a[o + e]; k++; } if (b >= 0) { sm -= a[o + b]; k--; } t[o + x] = sm / k; } }
    for (let x = 0; x < w; x++) { let sm = 0, k = 0; for (let j = 0; j < R && j < hh; j++) { sm += t[j * w + x]; k++; }
      for (let y = 0; y < hh; y++) { const e = y + R, b = y - R - 1; if (e < hh) { sm += t[e * w + x]; k++; } if (b >= 0) { sm -= t[b * w + x]; k--; }
        const al = Math.min(1, (sm / k) * 1.4 - 0.2); d[(y * w + x) * 4 + 3] = Math.max(0, al) * 255 * Math.min(1, y / (hh * 0.08)); } }
    const o = document.createElement('canvas'); o.width = w; o.height = h; o.getContext('2d').putImageData(src, 0, y0);
    o.y0 = y0; o.y1 = y1; return o;
  }
  // el oleaje cuesta: como mucho ~40 tiras, y si el móvil va justo de fotogramas se desactiva solo (el juego va primero)
  const OLAS = { ms: 0, n: 0, off: false };
  function dibujaOlas(ctx, A, x, top, k, t, W) {
    if (OLAS.off) return;
    const t0 = performance.now(), y0 = A.y0, y1 = A.y1, alto = y1 - y0, paso = Math.max(6, Math.ceil(alto / 40));
    const a0 = Math.max(0, Math.floor(-x / k) - 4), a1 = Math.min(A.width, Math.ceil((W - x) / k) + 4), w = a1 - a0;   // solo la parte visible
    if (w <= 0) return;
    try { olasTiras(ctx, A, x, top, k, t, y0, y1, alto, paso, a0, w); } finally {
      const d = performance.now() - t0; OLAS.ms = OLAS.n ? OLAS.ms * 0.95 + d * 0.05 : d; OLAS.n++;
      if (OLAS.n > 90 && OLAS.ms > 3.5) OLAS.off = true;
    }
  }
  function olasTiras(ctx, A, x, top, k, t, y0, y1, alto, paso, a0, w) {
    for (let y = y0; y < y1; y += paso) {
      const p = (y - y0) / alto, f = 0.15 + p,                       // más cerca de la orilla, olas más grandes y más separadas
        fase = Math.pow(p, 1.5) * 7 * Math.PI * 2 - t * 1.7,
        dy = Math.sin(fase) * 3.6 * f, dx = Math.sin(fase * 0.6 + t * 0.8) * 2.2 * f;
      const sy = Math.max(0, Math.min(A.height - paso, y + dy));
      ctx.drawImage(A, a0, sy, w, paso, x + (a0 + dx) * k, top + y * k, w * k, paso * k + 1);
    }
  }
  function dibujaPaisaje(ctx, W, H, u, cam, TM, t, F, largo) {
    // tamaño fijo (antes dependía de la altura del suelo y hacía un zoom brusco); en vertical sigue al suelo suavemente y solo en parte (paralaje)
    const ref = H - H * (W < H ? 0.27 : 0.3), suelo = ref + u * 0.5;   // fijo en vertical: seguir al suelo daba saltos
    // el dibujo nunca se repite (repetirlo, aunque fuera en espejo, duplicaba el sol, los molinos…): si la pantalla es muy ancha se agranda hasta cubrirla
    let alto = Math.max(ref * 0.78, u * 6.5), dib = alto * 1.25, k = dib / PAI.h;
    if (F.tile.width * k < W * 1.15) { k = W * 1.15 / F.tile.width; dib = k * PAI.h; alto = dib / 1.25; }
    const ancho = F.tile.width * k, top = suelo - alto, sobra = Math.max(0, ancho - W);
    let g = ctx.createLinearGradient(0, 0, 0, Math.max(1, top + 2)); g.addColorStop(0, F.cielo[0]); g.addColorStop(1, F.cielo[1]); ctx.fillStyle = g; ctx.fillRect(0, 0, W, Math.max(0, top) + 2);
    // paralaje: en un nivel el dibujo avanza justo lo necesario para recorrerlo una vez de punta a punta;
    // en la portada va y vuelve despacio
    let off;
    if (largo) off = Math.min(sobra, Math.max(0, cam.x * u * sobra / Math.max(1, largo * u)));
    else { const pp = (cam.x * u * 0.18) % Math.max(1, 2 * sobra); off = pp < sobra ? pp : 2 * sobra - pp; }
    ctx.drawImage(F.tile, -off, top, ancho + 1, dib);
    if (F.agua && !(typeof window !== 'undefined' && window.SIN_OLAS)) dibujaOlas(ctx, F.agua, -off, top, k, t, W);
    if (top > 0) { const fz = alto * 0.14, gf = ctx.createLinearGradient(0, top - 1, 0, top + fz); gf.addColorStop(0, F.cielo[1]); gf.addColorStop(1, F.cielo[1] + '00'); ctx.fillStyle = gf; ctx.fillRect(0, top - 1, W, fz + 1); }   // empalme suave entre el cielo y el dibujo
    ctx.fillStyle = '#16100f'; ctx.fillRect(0, top + dib - 1, W, H);
    if (false) { ctx.fillStyle = TM.tinte.replace(/[\d.]+\)$/, m => (parseFloat(m) * 2.5).toFixed(2) + ')'); ctx.fillRect(0, 0, W, suelo); }
  }
  /* Cueva de los Verdes: roca volcánica, techo con estalactitas y focos de luz cálida. Se pinta una vez (por tamaño) y cada imagen solo la copia. */
  const CUEVA = { key: '', cv: null };
  function capaCueva(W, H, u) {
    const TX = texturas(), key = W + 'x' + H + 'x' + u.toFixed(1) + (TX.lavaP ? 't' : ''); if (CUEVA.key === key && CUEVA.cv) return CUEVA.cv;   // se repinta una vez cuando llega la textura
    const LW = Math.ceil(W * 2), c = document.createElement('canvas'); c.width = Math.ceil(LW * ESC); c.height = Math.ceil(H * ESC); const g = c.getContext('2d'); g.scale(ESC, ESC);
    let gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#120b09'); gr.addColorStop(0.4, '#33231b'); gr.addColorStop(0.75, '#241812'); gr.addColorStop(1, '#0d0907'); g.fillStyle = gr; g.fillRect(0, 0, LW, H);
    if (TX.lavaP) { g.globalAlpha = 0.45; const pt = g.createPattern(TX.lavaP, 'repeat'); try { pt.setTransform(new DOMMatrix().scale(u * 3.2 / TX.lavaP.height)); } catch (e) {} g.fillStyle = pt; g.fillRect(0, 0, LW, H); g.globalAlpha = 1; }
    const per = (x, k) => Math.sin(x / LW * Math.PI * 2 * k);   // todo periódico en el ancho de la capa: se empalma sin costura
    for (let i = 0; i < 4; i++) {   // focos de luz cálida (rojiza y ámbar, como la iluminación de la cueva)
      const x = LW * (i + 0.5) / 4, y = H * (0.45 + 0.08 * per(x, 3)), r = u * (5 + (i % 2) * 2);
      const rg = g.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, i % 2 ? 'rgba(255,120,50,.40)' : 'rgba(255,190,100,.36)'); rg.addColorStop(1, 'rgba(255,140,60,0)'); g.fillStyle = rg; g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    // forma de tubo: arriba y abajo más oscuro
    gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(5,3,2,.85)'); gr.addColorStop(0.3, 'rgba(5,3,2,0)'); gr.addColorStop(0.7, 'rgba(5,3,2,0)'); gr.addColorStop(1, 'rgba(5,3,2,.7)'); g.fillStyle = gr; g.fillRect(0, 0, LW, H);
    // techo irregular y estalactitas finas de distintos largos
    const techo = x => H * (0.12 + 0.035 * per(x, 2) + 0.022 * per(x, 5) + 0.01 * per(x, 13));
    g.fillStyle = '#0a0605'; g.beginPath(); g.moveTo(0, 0); for (let x = 0; x <= LW; x += u * 0.2) g.lineTo(x, techo(x)); g.lineTo(LW, 0); g.closePath(); g.fill();
    for (let k = 0; k < 30; k++) {
      const x0 = LW * (k + hash(k * 7 + 1)) / 30, w = u * (0.12 + hash(k * 7 + 2) * 0.22), l = u * (0.3 + hash(k * 7 + 3) ** 2 * 1.6);
      for (const x of [x0, x0 - LW, x0 + LW]) { if (x < -u || x > LW + u) continue; const b = techo(x) - 2;
        g.fillStyle = '#0a0605'; g.beginPath(); g.moveTo(x - w, b); g.quadraticCurveTo(x - w * 0.25, b + l * 0.6, x, b + l); g.quadraticCurveTo(x + w * 0.25, b + l * 0.6, x + w, b); g.closePath(); g.fill();
        g.strokeStyle = 'rgba(255,170,90,.16)'; g.lineWidth = Math.max(1, u * 0.03); g.beginPath(); g.moveTo(x - w * 0.6, b + l * 0.15); g.quadraticCurveTo(x - w * 0.2, b + l * 0.6, x, b + l); g.stroke(); }
    }
    CUEVA.key = key; CUEVA.cv = c; CUEVA.lw = LW; return c;
  }
  function dibujaCueva(ctx, W, H, u, cam) {
    const c = capaCueva(W, H, u), LW = CUEVA.lw, off = ((cam.x * u * 0.15) % LW + LW) % LW;
    ctx.drawImage(c, -off, 0, LW, H); if (LW - off < W) ctx.drawImage(c, LW - off, 0, LW, H);
  }
  function dibujaFondo(ctx, W, H, u, cam, TM, t, largo) {
    if (TEMAS.indexOf(TM) === 11) return dibujaCueva(ctx, W, H, u, cam);
    { const F = fotoTema(TEMAS.indexOf(TM)); if (F) return dibujaPaisaje(ctx, W, H, u, cam, TM, t, F, largo); }
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
  /* Plantas y piedras de Lanzarote dibujadas (flora.png): [x, y, ancho, alto] en el atlas y altura en el mundo */
  const FLO = { ok: false, img: null, m: {"palmera": [0, 0, 203, 179, 3.3], "tabaibal": [205, 0, 227, 164, 1.6], "tunera": [434, 0, 172, 158, 1.5], "pita": [608, 0, 188, 143, 1.25], "vid": [798, 0, 200, 124, 1.0], "vid2": [0, 470, 200, 124, 1.0], "aloe": [0, 181, 147, 116, 1.3], "gris": [149, 181, 166, 112, 1.0], "bejeque": [317, 181, 160, 110, 1.05], "aulaga": [479, 181, 156, 110, 1.0], "morada": [637, 181, 143, 106, 0.95], "muro": [782, 181, 210, 106, 0.9], "salado": [0, 299, 145, 104, 0.9], "roca": [147, 299, 151, 104, 1.0], "hierba": [300, 299, 120, 84, 0.8], "piedra": [422, 299, 104, 80, 0.6], "rosas": [528, 299, 120, 80, 0.55], "amarillas": [650, 299, 135, 73, 0.5], "piedras": [787, 299, 112, 64, 0.45], "rojas": [0, 405, 152, 62, 0.45]},
    por: { tunera: ['tunera', 'tunera', 'bejeque', 'aloe'], cardon: ['tabaibal', 'aulaga', 'morada', 'gris', 'salado', 'bejeque', 'vid', 'palmera'], pita: ['pita', 'aloe'], piedra: ['piedra', 'piedras', 'roca', 'piedra'], flor: ['rojas', 'amarillas', 'rosas', 'hierba'] } };
  if (typeof Image !== 'undefined') { FLO.img = new Image(); FLO.img.onload = () => { FLO.ok = true; }; FLO.img.src = 'flora.png'; }
  function decoSprite(ctx, d, x, y, u) {
    const l = FLO.por[d.t]; if (!l) return false;
    let n = l[Math.floor(hash(Math.floor(d.x * 7) + 5) * l.length)];
    if (n === 'vid' && hash(Math.floor(d.x * 13) + 3) < 0.5) n = 'vid2';   // parra en su hoyo de picón: con zoco de piedra en media luna o sin muro
    const m = FLO.m[n];
    const hh = m[4] * u * (0.85 + clamp((d.s - 0.75) / 1, 0, 1) * 0.35), ww = hh * m[2] / m[3];
    const hoyo = n === 'vid' || n === 'vid2';   // la parra está dentro de su hoyo de picón: el hoyo se hunde en el suelo (si no, parece que flota)
    ctx.save(); ctx.translate(x, y + hh * (hoyo ? 0.27 : 0.04)); if (hash(Math.floor(d.x * 11)) < 0.5) ctx.scale(-1, 1);
    if (!hoyo) { ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(0, -hh * 0.03, ww * 0.42, hh * 0.07, 0, 0, TAU); ctx.fill(); }
    ctx.drawImage(FLO.img, m[0], m[1], m[2], m[3], -ww / 2, -hh, ww, hh); ctx.restore(); return true;
  }
  function dibujaDeco(ctx, d, x, y, u, t) {
    if (FLO.ok && d.t !== 'lagarto' && decoSprite(ctx, d, x, y, u)) return;
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
      // lagarto atlántico (Gallotia atlantica) de perfil: silueta continua del hocico a la punta de la cola, lomo pardo con
      // escamas moteadas, vientre claro, manchas azules en el costado, patas con codo y dedos largos, ojo con brillo
      const mov = d.px != null && d.px + 2.4 > d.x && d.px < d.x + 3.6, ph = t * (mov ? 22 : 1.5), sd = Math.floor(d.x * 13);
      const L = s * 1.9, ancho = q => q < 0.07 ? 0.004 + q * 0.5 : q < 0.12 ? 0.039 : q < 0.16 ? 0.039 - (q - 0.12) * 0.2 : q < 0.37 ? 0.031 + Math.sin((q - 0.16) / 0.21 * Math.PI) * 0.01 : 0.029 * Math.pow(1 - (q - 0.37) / 0.63, 1.15) + 0.0015;
      // columna: del hocico (q=0, a la derecha) a la punta de la cola (q=1); cuerpo levantado sobre las patas y cola que baja hasta el suelo y ondula
      const esp = q => { const x = L * (0.36 - q), alto = q < 0.15 ? 0.1 - q * 0.05 : q < 0.37 ? 0.0925 - (q - 0.15) * 0.04 : 0.084 - (q - 0.37) / 0.63 * 0.074;
        const ond = q > 0.4 ? Math.sin(q * 11 - ph * (mov ? 1 : 0.5)) * 0.006 * (q - 0.4) * 4 : 0; return [x, -L * (alto + ond)]; };
      const N = 34, arr = [], aba = [];
      for (let i = 0; i <= N; i++) { const q = i / N, [x, y] = esp(q), w = ancho(q) * L; arr.push([x, y - w * 1.05]); aba.push([x, y + w * 0.85]); }
      const pataS = (bx, fase, lejos, atras) => {   // pata: muslo hacia abajo, codo/rodilla marcados, pie apoyado con dedos largos
        const sw = Math.sin(ph + fase) * (mov ? 0.05 : 0.006), [px, py] = esp(bx), dir = atras ? -1 : 1;
        const cx = px + L * (0.025 * dir + sw), cy = py * 0.45, fx = px + L * (0.012 * dir + sw * 1.8), fy = -L * 0.004;
        ctx.strokeStyle = lejos ? '#2a2219' : '#4a3d2c'; ctx.lineWidth = L * 0.019; ctx.beginPath(); ctx.moveTo(px, py + L * 0.012); ctx.lineTo(cx, cy); ctx.lineTo(fx, fy); ctx.stroke();
        ctx.lineWidth = Math.max(0.7, L * 0.0055); ctx.beginPath(); for (const k of [-1, 0, 1, 2]) { ctx.moveTo(fx, fy); ctx.lineTo(fx + L * (0.024 + k * 0.004) * (k === 2 ? -0.6 : 1), fy + k * L * 0.002); } ctx.stroke();
      };
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.beginPath(); ctx.ellipse(L * 0.08, 0, L * 0.28, L * 0.012, 0, 0, TAU); ctx.fill();
      pataS(0.17, Math.PI, true, false); pataS(0.36, 0, true, true);   // patas del lado de allá, más oscuras
      const sil = () => { ctx.beginPath(); arr.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); for (let i = aba.length - 1; i >= 0; i--) ctx.lineTo(aba[i][0], aba[i][1]); ctx.closePath(); };
      sil(); let g = ctx.createLinearGradient(0, -L * 0.14, 0, -L * 0.055); g.addColorStop(0, '#221c15'); g.addColorStop(0.5, '#3e3428'); g.addColorStop(0.8, '#6e604a'); g.addColorStop(1, '#9a8b6c'); ctx.fillStyle = g; ctx.fill();
      ctx.save(); sil(); ctx.clip();
      for (let i = 0; i < 46; i++) {   // escamas: motas oscuras y claras por el lomo y los flancos
        const q = 0.05 + hash(sd + i) * 0.7, [x, y] = esp(q), w = ancho(q) * L, yy = y - w * (0.9 - hash(sd + i + 40) * 1.2);
        ctx.fillStyle = i % 3 ? 'rgba(30,22,14,.45)' : 'rgba(220,205,160,.35)'; ctx.beginPath(); ctx.ellipse(x, yy, L * 0.008, L * 0.006, 0, 0, TAU); ctx.fill(); }
      for (let i = 0; i < 6; i++) { const q = 0.19 + i * 0.03, [x, y] = esp(q); ctx.fillStyle = 'rgba(70,170,225,.85)'; ctx.beginPath(); ctx.arc(x, y + L * (i % 2 ? 0.006 : -0.004), L * 0.0085, 0, TAU); ctx.fill(); }   // manchas azules del costado
      ctx.strokeStyle = 'rgba(25,18,10,.35)'; ctx.lineWidth = Math.max(0.6, L * 0.004); ctx.beginPath(); { const [x, y] = esp(0.13); ctx.moveTo(x, y - L * 0.06); ctx.quadraticCurveTo(x - L * 0.012, y, x + L * 0.005, y + L * 0.05); } ctx.stroke();   // pliegue del cuello
      ctx.restore();
      sil(); ctx.strokeStyle = 'rgba(28,20,12,.7)'; ctx.lineWidth = Math.max(0.7, L * 0.006); ctx.stroke();
      pataS(0.18, 0, false, false); pataS(0.37, Math.PI, false, true);   // patas del lado de acá
      { const [x, y] = esp(0.055); ctx.fillStyle = '#1a140c'; ctx.beginPath(); ctx.arc(x, y - L * 0.012, L * 0.011, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,250,230,.9)'; ctx.beginPath(); ctx.arc(x + L * 0.004, y - L * 0.016, L * 0.0035, 0, TAU); ctx.fill();   // ojo
        const [ox, oy] = esp(0.1); ctx.fillStyle = 'rgba(25,18,10,.6)'; ctx.beginPath(); ctx.ellipse(ox, oy - L * 0.004, L * 0.006, L * 0.009, 0, 0, TAU); ctx.fill(); }   // oído
      { const [x, y] = esp(0.01); ctx.strokeStyle = 'rgba(25,18,10,.6)'; ctx.lineWidth = Math.max(0.6, L * 0.004); ctx.beginPath(); ctx.moveTo(x, y + L * 0.004); ctx.lineTo(x - L * 0.05, y + L * 0.012); ctx.stroke(); }   // boca
    } else if (d.t === 'piedra') {
      for (const [dx, r, c] of [[0, 0.18, '#5d5254'], [0.26, 0.11, '#6f6264'], [-0.22, 0.09, '#4c4244']]) { ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(dx * s, -r * s * 0.6, r * s * 1.2, r * s * 0.8, 0, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.beginPath(); ctx.ellipse(dx * s - r * s * 0.3, -r * s * 0.95, r * s * 0.5, r * s * 0.22, 0, 0, TAU); ctx.fill(); }
    } else {
      ctx.strokeStyle = '#4f8a43'; ctx.lineWidth = Math.max(1, s * 0.03);
      for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(i * s * 0.07, 0); ctx.quadraticCurveTo(i * s * 0.16, -s * 0.3, i * s * 0.2 + sw * s, -s * (0.5 + (i % 2) * 0.12)); ctx.stroke(); ctx.fillStyle = i % 2 ? '#f6d65a' : '#f4efe6'; ctx.beginPath(); ctx.arc(i * s * 0.2 + sw * s, -s * (0.52 + (i % 2) * 0.12), s * 0.06, 0, TAU); ctx.fill(); }
    }
    ctx.restore();
  }

  const VECINOS = new WeakMap();   // suelo de al lado de cada tramo (para saber qué parte de su lateral se ve)
  function vecinos(sol) {
    const gs = sol.filter(q => q.kind === 'ground' || q.kind === 'wall');
    for (const q of gs) { if (VECINOS.has(q)) continue; const I = gs.find(o => o !== q && Math.abs(o.x1 - q.x0) < 0.06 && o.bot <= q.top), D = gs.find(o => o !== q && Math.abs(o.x0 - q.x1) < 0.06 && o.bot <= q.top); VECINOS.set(q, { i: I ? I.top : null, d: D ? D.top : null }); }
  }
  function dibujaSuelo(ctx, s, W, H, u, cam, sx, sy, TX) {
    if (TX.tierraP && TX.lavaP) {
      const x0 = sx(s.x0), x1 = sx(s.x1), yt = sy(s.top), yb = s.bot > -1e8 ? sy(s.bot) : H + 4, a = Math.max(x0, -u), b = Math.min(x1, W + u); if (b <= a) return;
      const kL = u * 2.2 / TX.lavaP.height, kT = u * 0.95 / TX.tierraP.height, sd = Math.floor(s.x0 * 13 + s.top * 7);
      // cuánto se ve de cada lateral: si al lado hay suelo, solo la parte que queda por encima de él (antes se sombreaba entero y salía una raya)
      const vec = VECINOS.get(s) || {}, caraI = vec.i == null ? yb - yt : Math.max(0, sy(vec.i) - yt), caraD = vec.d == null ? yb - yt : Math.max(0, sy(vec.d) - yt);
      const paso = u * 0.28, salta = (k, y, cara) => { const q = (y - yt) / Math.max(1, cara); return y - yt < u * 0.12 ? -u * 0.1 : u * (0.04 + hash(sd + k * 7) * 0.2) * Math.min(1, (cara - (y - yt)) / (u * 0.5)) * (q < 1 ? 1 : 0); };
      const perfil = () => {   // canto de roca natural: esquinas redondeadas y laterales irregulares (solo en la parte visible)
        ctx.beginPath(); ctx.moveTo(x0 + (caraI > 2 ? u * 0.14 : 0), yt - 1);
        ctx.lineTo(x1 - (caraD > 2 ? u * 0.14 : 0), yt - 1);
        if (caraD > 2) { let k = 0; for (let y = yt + u * 0.06; y < yt + caraD; y += paso, k++) ctx.lineTo(x1 + salta(k, y, caraD), y); }
        ctx.lineTo(x1, Math.min(yb, yt + caraD)); ctx.lineTo(x1, yb); ctx.lineTo(x0, yb); ctx.lineTo(x0, Math.min(yb, yt + caraI));
        if (caraI > 2) { const ys = []; for (let y = yt + u * 0.06; y < yt + caraI; y += paso) ys.push(y); for (let k = ys.length - 1; k >= 0; k--) ctx.lineTo(x0 - salta(k + 50, ys[k], caraI), ys[k]); }
        ctx.closePath();
      };
      ctx.save(); perfil(); ctx.clip();
      const ea = a - u * 0.4, eb = b + u * 0.4;
      // textura y oscurecido anclados al tramo más bajo de alrededor: así dos bloques vecinos casan sin costura
      const yr = sy(Math.min(s.top, vec.i == null ? s.top : vec.i, vec.d == null ? s.top : vec.d));
      ctx.fillStyle = relleno(ctx, TX.lavaP, -cam.x * u * 1, sy(0), '#2a2122', kL); ctx.fillRect(ea, yt - 1, eb - ea, yb - yt + 1);
      let g = ctx.createLinearGradient(0, yr, 0, yr + u * 5); g.addColorStop(0, 'rgba(10,6,6,0)'); g.addColorStop(1, 'rgba(10,6,6,.6)'); ctx.fillStyle = g; ctx.fillRect(ea, yt, eb - ea, yb - yt);
      // laterales: sombra suave solo en la cara que se ve, con alguna arista iluminada
      for (const [xx, dir, cara] of [[x0, 1, caraI], [x1, -1, caraD]]) {
        if (cara < 2 || xx < -u * 2 || xx > W + u * 2) continue;
        const ex = xx - dir * u * 0.25; g = ctx.createLinearGradient(ex, 0, ex + dir * u * 0.9, 0); g.addColorStop(0, 'rgba(0,0,0,.42)'); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.fillRect(Math.min(ex, ex + dir * u * 0.9), yt, u * 0.9, cara + u * 0.3);
        ctx.strokeStyle = 'rgba(255,215,170,.13)'; ctx.lineWidth = Math.max(1, u * 0.03);
        for (let k = 0; k < cara / (u * 0.9); k++) { const y = yt + u * (0.5 + k * 0.9 + hash(sd + k) * 0.3), x = xx - dir * u * (0.02 + hash(sd + k + 3) * 0.12); if (y > yt + cara - u * 0.2) break; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dir * u * (0.15 + hash(sd + k + 5) * 0.2), y + u * 0.12); ctx.stroke(); }
      }
      // capa de tierra con el borde inferior irregular
      const th = Math.min(u * 0.7, yb - yt), pt = u * 0.3;
      ctx.beginPath(); ctx.moveTo(ea, yt - 1);
      { const ps = pt / u; let wx = Math.floor((ea / u + cam.x) / ps) * ps; ctx.lineTo((wx - cam.x) * u, yt - 1); for (; (wx - cam.x) * u <= eb + pt; wx += ps) ctx.lineTo((wx - cam.x) * u, yt + th * (0.72 + hash(Math.round(wx / ps)) * 0.5)); }   // puntos fijos en el mundo (antes se movían con la cámara y el borde temblaba)
      ctx.lineTo(eb, yt - 1); ctx.closePath(); ctx.clip();
      ctx.fillStyle = relleno(ctx, TX.tierraP, -cam.x * u, yt, '#a5532f', kT); ctx.fillRect(ea, yt - 1, eb - ea, th * 1.4);
      g = ctx.createLinearGradient(0, yt, 0, yt + th * 1.3); g.addColorStop(0, 'rgba(255,220,160,.14)'); g.addColorStop(0.6, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(30,10,5,.35)'); ctx.fillStyle = g; ctx.fillRect(ea, yt - 1, eb - ea, th * 1.4);
      ctx.restore();
      return;
    }
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
    if (FLO.ok) { const x0 = sx(s.x0), x1 = sx(s.x1), yt = sy(s.top), yb = sy(base), m = FLO.m.roca, w = x1 - x0, h = yb - yt, sp = u * 0.25;
      ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(x0 + w / 2, yb, w * 0.62, u * 0.13, 0, 0, TAU); ctx.fill();
      ctx.drawImage(FLO.img, m[0], m[1], m[2], m[3], x0 - sp, yt - h * 0.08, w + sp * 2, h * 1.12); return; }
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

  /* Repisa: muro de piedra seca recto (dos hiladas de piedras volcánicas, arriba plano). Se pinta una vez por repisa y tamaño. */
  const REPISAS = new Map();
  function muroSeco(s, w, th, u) {
    const key = s.id + '|' + Math.round(w) + '|' + Math.round(th); let c = REPISAS.get(key); if (c) return c;
    if (REPISAS.size > 80) REPISAS.clear();
    const pad = Math.ceil(u * 0.15); c = document.createElement('canvas'); c.width = Math.ceil(w + pad * 2); c.height = Math.ceil(th + pad * 2); c.pad = pad;
    const g = c.getContext('2d'), sd = Math.floor(s.x0 * 31 + s.top * 17), rh = th / 2;
    g.fillStyle = '#1a1312'; g.beginPath(); rr(g, pad, pad + th * 0.06, w, th * 0.94, u * 0.06); g.fill();   // juntas oscuras
    for (let fila = 0; fila < 2; fila++) {
      let x = pad - (fila ? u * 0.18 : 0), k = 0;
      while (x < pad + w) {
        const sw = u * (0.34 + hash(sd + fila * 97 + k * 7) * 0.3), y = pad + fila * rh + u * 0.02, hh = rh - u * 0.05, x0 = Math.max(pad, x), x1 = Math.min(pad + w, x + sw);
        if (x1 - x0 > u * 0.08) {
          const v = hash(sd + k * 13 + fila), PAL = [['#6e5a50', '#3a2d28'], ['#5b4b46', '#2e2522'], ['#7a5a48', '#40291f'], ['#4f4442', '#262020']], cc = PAL[Math.floor(v * PAL.length)];
          const dy = fila ? (hash(sd + k * 3 + 1) - 0.5) * u * 0.06 : 0, dh = fila ? (hash(sd + k * 9) - 0.5) * u * 0.08 : (hash(sd + k * 9) - 0.5) * u * 0.05;
          const gr = g.createLinearGradient(0, y + dy, 0, y + dy + hh + dh); gr.addColorStop(0, cc[0]); gr.addColorStop(1, cc[1]); g.fillStyle = gr;
          g.beginPath(); rr(g, x0 + u * 0.025, y + dy, x1 - x0 - u * 0.05, hh + dh, u * 0.11); g.fill();
          g.fillStyle = 'rgba(255,235,210,.16)'; g.fillRect(x0 + u * 0.06, y + u * 0.03, Math.max(0, x1 - x0 - u * 0.14), u * 0.04);   // luz arriba
          g.fillStyle = 'rgba(15,8,6,.35)'; for (let q = 0; q < 3; q++) g.fillRect(x0 + (x1 - x0) * hash(sd + k * 5 + q), y + hh * (0.3 + hash(sd + k * 3 + q) * 0.5), Math.max(1, u * 0.03), Math.max(1, u * 0.03));   // poros
          if (hash(sd + k * 11 + fila * 3) < 0.3) { g.fillStyle = 'rgba(214,170,60,.55)'; g.beginPath(); g.ellipse(x0 + (x1 - x0) * 0.4, y + hh * 0.45, u * 0.06, u * 0.04, 0, 0, TAU); g.fill(); }   // liquen
        }
        x += sw; k++;
      }
    }
    g.fillStyle = 'rgba(255,225,180,.18)'; g.fillRect(pad, pad + th * 0.06, w, Math.max(1, u * 0.03));   // borde de arriba, recto
    REPISAS.set(key, c); return c;
  }
  function dibujaRepisa(ctx, s, W, H, u, sx, sy) {
    if (FLO.ok) {
      const x0 = sx(s.x0), x1 = sx(s.x1), yt = sy(s.top), th = Math.max(u * 0.62, 8), w = x1 - x0;
      if (x1 < -u || x0 > W + u) return;
      ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.fillRect(x0 + u * 0.1, yt + th * 0.95, w - u * 0.1, u * 0.16);
      const c = muroSeco(s, w, th, u); ctx.drawImage(c, x0 - c.pad, yt - th * 0.06 - c.pad); return; }
    const x0 = sx(s.x0), x1 = sx(s.x1), yt = sy(s.top), th = Math.max(u * 0.34, 5), w = x1 - x0;
    ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.fillRect(x0 + u * 0.1, yt + th, w - u * 0.1, u * 0.2);
    let g = ctx.createLinearGradient(0, yt, 0, yt + th); g.addColorStop(0, '#c7b6a0'); g.addColorStop(0.35, COL.repisa); g.addColorStop(1, '#5d5047'); ctx.fillStyle = g; rr(ctx, x0, yt, w, th, u * 0.08); ctx.fill();
    ctx.strokeStyle = '#2a201c'; ctx.lineWidth = Math.max(1.2, u * 0.04); ctx.stroke();
    ctx.strokeStyle = 'rgba(40,28,24,.5)'; ctx.lineWidth = Math.max(1, u * 0.03); for (let x = x0 + u * 0.9; x < x1 - u * 0.4; x += u * 0.9) { ctx.beginPath(); ctx.moveTo(x, yt + th * 0.15); ctx.lineTo(x - u * 0.06, yt + th * 0.95); ctx.stroke(); }
    ctx.fillStyle = 'rgba(255,245,225,.55)'; ctx.fillRect(x0 + u * 0.08, yt + 1, w - u * 0.16, Math.max(1, u * 0.04));
    ctx.fillStyle = 'rgba(70,50,40,.9)'; for (const xx of [x0 + u * 0.25, x1 - u * 0.25]) { ctx.beginPath(); ctx.moveTo(xx - u * 0.12, yt + th); ctx.lineTo(xx + u * 0.12, yt + th); ctx.lineTo(xx, yt + th + u * 0.38); ctx.closePath(); ctx.fill(); }
  }

  /* Haría (2.3): el camino alto va por las copas de las palmeras */
  function dibujaCopa(ctx, s, W, H, u, sx, sy, L, t) {
    const x0 = sx(s.x0), x1 = sx(s.x1), yt = sy(s.top), w = x1 - x0, base = sy(suelo(L, (s.x0 + s.x1) / 2, s.top - 0.5));
    const n = Math.max(1, Math.round((s.x1 - s.x0) / 3.2));
    for (let i = 0; i < n; i++) { // troncos con anillos
      const cx = x0 + w * (i + 0.5) / n, tw = u * 0.32;
      const g = ctx.createLinearGradient(cx - tw, 0, cx + tw, 0); g.addColorStop(0, '#5a4130'); g.addColorStop(0.5, '#8a6a4c'); g.addColorStop(1, '#4a3426'); ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(cx - tw * 0.8, yt + u * 0.2); ctx.lineTo(cx + tw * 0.8, yt + u * 0.2); ctx.lineTo(cx + tw, base); ctx.lineTo(cx - tw, base); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(40,26,18,.55)'; ctx.lineWidth = Math.max(1, u * 0.04); for (let y = yt + u * 0.5; y < base; y += u * 0.32) { ctx.beginPath(); ctx.moveTo(cx - tw * 0.9, y); ctx.lineTo(cx + tw * 0.9, y + u * 0.05); ctx.stroke(); }
    }
    const m = FLO.m.palmera, ch = m[3] * 0.5, cw = w / n + u * 1.4, dh = Math.min(ch * cw / m[2], u * 2.0); // copas: la mitad alta del dibujo de la palmera, una por tronco
    for (let i = 0; i < n; i++) { const sw = Math.sin(t * 1.3 + s.x0 + i) * u * 0.04; ctx.drawImage(FLO.img, m[0], m[1], m[2], ch, x0 + w * i / n - u * 0.7 + sw, yt - dh * 0.45, cw, dh); }
  }
  /* ---- Peligros vivos: piedras que ruedan, géiseres, viento y olas (su estado sale del reloj del motor) ---- */
  function dibujaPeligros(ctx, W, H, u, sx, sy, L, st, t) {
    const MP = window.Martin.peligro;
    for (const h of L.peligros) {
      const e = MP(h, st.t);
      if (h.kind === 'piedra') {
        const xa = sx(h.x1), y0 = sy(h.y);
        if (xa > -u * 3 && xa < W + u * 3) { // cantera de donde salen: montón de piedras sueltas
          ctx.fillStyle = '#2b2326'; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.ellipse(xa + u * (0.2 + k * 0.28), y0 - u * (0.15 + (k % 2) * 0.12), u * 0.28, u * 0.2, 0, 0, TAU); ctx.fill(); }
          if (!e.activo && e.c > h.periodo - 50) { ctx.fillStyle = 'rgba(255,210,90,.95)'; ctx.font = '900 ' + Math.round(u * 0.9) + 'px system-ui'; ctx.textAlign = 'center'; ctx.fillText('!', xa + u * 0.5, y0 - u * (1.1 + Math.abs(Math.sin(t * 10)) * 0.25)); }
        }
        if (!e.activo) continue;
        const x = sx(e.x), r = u * 0.42, y = y0 - r; if (x < -r * 3 || x > W + r * 3) continue;
        ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(x, y0, r * 1.1, r * 0.25, 0, 0, TAU); ctx.fill();
        for (let k = 1; k < 4; k++) { ctx.fillStyle = 'rgba(200,160,120,' + (0.25 - k * 0.06) + ')'; ctx.beginPath(); ctx.arc(x + r * (0.8 + k * 0.7), y0 - r * 0.3, r * (0.35 + k * 0.12), 0, TAU); ctx.fill(); }
        ctx.save(); ctx.translate(x, y); ctx.rotate(-(h.x1 - e.x) / 0.42);
        if (FLO.ok) { const m = FLO.m.piedra; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.clip(); ctx.drawImage(FLO.img, m[0], m[1], m[2], m[3], -r * 1.25, -r * 1.25, r * 2.5, r * 2.5); }
        else { ctx.fillStyle = '#3a3034'; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); }
        ctx.restore(); ctx.strokeStyle = 'rgba(20,10,10,.6)'; ctx.lineWidth = Math.max(1, u * 0.04); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
      } else if (h.kind === 'geiser') {
        const x = sx(h.x), y = sy(h.y); if (x < -u * 3 || x > W + u * 3) continue;
        ctx.fillStyle = '#1a1012'; ctx.beginPath(); ctx.ellipse(x, y + u * 0.02, u * 0.55, u * 0.14, 0, 0, TAU); ctx.fill();
        const brillo = e.aviso ? 0.35 + 0.4 * (e.c / h.aviso) : e.activo ? 0.8 : 0.18;
        let g = ctx.createRadialGradient(x, y, 0, x, y, u * 0.9); g.addColorStop(0, 'rgba(255,140,50,' + brillo + ')'); g.addColorStop(1, 'rgba(255,90,30,0)'); ctx.fillStyle = g; ctx.fillRect(x - u, y - u, u * 2, u * 1.3);
        if (e.aviso) { for (let k = 0; k < 4; k++) { const q = ((t * 1.6 + k / 4) % 1); ctx.fillStyle = 'rgba(235,235,240,' + (0.5 * (1 - q)) + ')'; ctx.beginPath(); ctx.arc(x + Math.sin(k * 2 + t * 3) * u * 0.2, y - q * u * 0.9, u * (0.12 + q * 0.2), 0, TAU); ctx.fill(); } }
        if (e.activo) {
          const q = (e.c - h.aviso) / h.activo, alto = u * 3.6 * Math.min(1, q * 5) * (q > 0.8 ? (1 - q) * 5 : 1);
          for (let k = 0; k < 26; k++) { // columna de vapor: bocanadas que se abren al subir
            const a = hash(k * 11 + 5), sube = alto * (0.05 + 0.95 * ((a + t * 1.8) % 1)), ab = (hash(k * 3) - 0.5) * u * (0.3 + sube / u * 0.35);
            const r = u * (0.22 + sube / u * 0.16), al = 0.75 * (1 - sube / (alto + 1)) + 0.1;
            ctx.fillStyle = 'rgba(248,248,250,' + al + ')'; ctx.beginPath(); ctx.arc(x + ab, y - sube, r, 0, TAU); ctx.fill();
          }
          ctx.fillStyle = 'rgba(255,200,140,.55)'; ctx.beginPath(); ctx.ellipse(x, y - u * 0.15, u * 0.35, u * 0.2, 0, 0, TAU); ctx.fill();
        }
      } else if (h.kind === 'viento') {
        const x0 = sx(h.x0), x1 = sx(h.x1); if (x1 < 0 || x0 > W) continue;
        // manga de viento al principio de la zona
        const mx = x0 + u * 0.3, my = sy(st.y) - u * 0.2; const pY = (() => { let top = null; for (const s of L.solids) if (s.kind === 'ground' && h.x0 + 0.3 >= s.x0 && h.x0 + 0.3 <= s.x1) top = s.top; return top == null ? null : sy(top); })();
        if (pY != null) {
          ctx.strokeStyle = '#5a4030'; ctx.lineWidth = Math.max(2, u * 0.07); ctx.beginPath(); ctx.moveTo(mx, pY); ctx.lineTo(mx, pY - u * 2.2); ctx.stroke();
          const f = e.activo ? e.q : 0.08, ang = (1 - f) * 1.2 + Math.sin(t * 7) * 0.08 * (0.3 + f);
          ctx.save(); ctx.translate(mx, pY - u * 2.1); ctx.rotate(Math.PI / 2 + ang * (h.fuerza < 0 ? 1 : -1) - (h.fuerza < 0 ? Math.PI : 0));
          for (let k = 0; k < 4; k++) { ctx.fillStyle = k % 2 ? '#f4f0e8' : '#d6452f'; ctx.fillRect(k * u * 0.22, -u * 0.13 + k * u * 0.02, u * 0.23, u * 0.26 - k * u * 0.04); }
          ctx.restore();
        }
        const f = e.activo ? e.q : (e.aviso ? 0.15 : 0); if (f <= 0.02) continue;
        ctx.save(); ctx.beginPath(); ctx.rect(x0, 0, x1 - x0, H); ctx.clip();
        ctx.strokeStyle = 'rgba(255,248,235,' + (0.8 * f) + ')'; ctx.lineWidth = Math.max(2.5, u * 0.07); ctx.lineCap = 'round';
        const dir = h.fuerza < 0 ? -1 : 1;
        for (let k = 0; k < 34; k++) { const yy = H * (0.15 + 0.7 * hash(k * 7 + 1)), sp = W * (0.6 + hash(k) * 0.6), xx = (((k * 97 + t * sp * dir) % (W * 1.3)) + W * 1.3) % (W * 1.3) - W * 0.15, l = u * (1.2 + hash(k + 9) * 2) * f;
          ctx.beginPath(); ctx.moveTo(xx, yy); ctx.quadraticCurveTo(xx - dir * l * 0.5, yy - u * 0.12, xx - dir * l, yy); ctx.stroke(); }
        ctx.fillStyle = 'rgba(225,165,110,' + (0.6 * f) + ')'; for (let k = 0; k < 40; k++) { const xx = (((k * 61 + t * W * 0.9 * dir) % W) + W) % W, yy = H * (0.45 + 0.4 * hash(k * 3 + 2)); ctx.beginPath(); ctx.arc(xx, yy, u * 0.06, 0, TAU); ctx.fill(); }
        ctx.restore();
      } else if (h.kind === 'ola') {
        const x0 = sx(h.x0), x1 = sx(h.x1), y = sy(h.y); if (x1 < -u * 3 || x0 > W + u * 3) continue;
        const cx = (x0 + x1) / 2, w = x1 - x0;
        ctx.fillStyle = 'rgba(15,40,60,.45)'; ctx.beginPath(); ctx.ellipse(cx, y + u * 0.05, w * 0.5, u * 0.16, 0, 0, TAU); ctx.fill();   // roca mojada del bufadero
        ctx.fillStyle = '#0d1a22'; ctx.beginPath(); ctx.ellipse(cx, y + u * 0.04, w * 0.18, u * 0.08, 0, 0, TAU); ctx.fill();
        if (e.aviso) { const q = e.c / h.aviso; for (let k = 0; k < 7; k++) { const qq = ((t * 2 + k / 7) % 1); ctx.fillStyle = 'rgba(200,240,255,' + (0.7 * (1 - qq) * q) + ')'; ctx.beginPath(); ctx.arc(cx + (hash(k) - 0.5) * w * 0.4, y - qq * u * 0.8 * q, u * 0.1, 0, TAU); ctx.fill(); } }
        if (e.activo) {
          const q = (e.c - h.aviso) / h.activo, alto = u * h.alto * 1.35 * Math.sin(Math.PI * Math.min(1, q * 1.15));
          // penacho de espuma: muchas burbujas que suben y se abren
          for (let k = 0; k < 34; k++) {
            const a = hash(k * 13 + 3), bb = hash(k * 7 + 11), sube = alto * (0.15 + 0.95 * a), ab = (bb - 0.5) * w * (0.35 + a * 0.75);
            const r = u * (0.18 + (1 - a) * 0.32) * (0.7 + 0.3 * Math.sin(t * 9 + k));
            ctx.fillStyle = a > 0.7 ? 'rgba(255,255,255,.92)' : a > 0.35 ? 'rgba(200,236,248,.88)' : 'rgba(70,160,205,.85)';
            ctx.beginPath(); ctx.arc(cx + ab, y - sube, r, 0, TAU); ctx.fill();
          }
          ctx.fillStyle = 'rgba(255,255,255,.95)'; for (let k = 0; k < 12; k++) { const qq = ((t * 1.5 + k / 12) % 1); ctx.beginPath(); ctx.arc(cx + (hash(k * 5) - 0.5) * (w + u * 1.5) * (0.5 + qq), y - alto - qq * u * 0.6 + qq * qq * u * 1.6, u * (0.07 + hash(k) * 0.07), 0, TAU); ctx.fill(); }
        }
      }
    }
  }


  /* Objetos: aljibes encalados que reponen agua y frutos de la isla escondidos en alto */
  function fruto(ctx, k, x, y, r) {
    ctx.lineWidth = Math.max(1.2, r * 0.12); ctx.strokeStyle = 'rgba(40,20,20,.55)';
    if (k === 'tuno') { // higo pico (tuno): ovalado, rojo púrpura, con puntitos de espinas
      esfera(ctx, x, y, r, '#ff7a86', '#a3173a'); ctx.save(); ctx.translate(x, y); ctx.scale(0.82, 1);
      ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.restore(); ctx.stroke();
      ctx.fillStyle = '#ffd9a0'; for (let i = 0; i < 6; i++) { const a = i * 2.1; ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * 0.5, y + Math.sin(a) * r * 0.55, r * 0.07, 0, TAU); ctx.fill(); }
      ctx.fillStyle = '#7a1028'; ctx.beginPath(); ctx.ellipse(x, y - r * 0.92, r * 0.32, r * 0.12, 0, 0, TAU); ctx.fill();
    } else if (k === 'higo') { // higo: lágrima morada con rabito
      const g = ctx.createRadialGradient(x - r * 0.3, y, r * 0.1, x, y + r * 0.2, r * 1.1); g.addColorStop(0, '#b07ad0'); g.addColorStop(1, '#3f1650'); ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(x, y - r * 1.05); ctx.bezierCurveTo(x + r * 0.5, y - r * 0.7, x + r * 1.05, y + r * 0.1, x + r * 0.85, y + r * 0.55); ctx.arc(x, y + r * 0.35, r * 0.88, 0.25, Math.PI - 0.25); ctx.bezierCurveTo(x - r * 1.05, y + r * 0.1, x - r * 0.5, y - r * 0.7, x, y - r * 1.05); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#4c6a2a'; ctx.lineWidth = Math.max(1.5, r * 0.16); ctx.beginPath(); ctx.moveTo(x, y - r * 1.0); ctx.lineTo(x + r * 0.15, y - r * 1.35); ctx.stroke();
    } else if (k === 'biberon') { // biberón: botella blanca con leche, tapa azul y tetina
      ctx.save(); ctx.translate(x, y); ctx.rotate(-0.25);
      ctx.fillStyle = '#e6a07a'; ctx.beginPath(); ctx.ellipse(0, -r * 1.05, r * 0.2, r * 0.26, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#3f8fd8'; rr(ctx, -r * 0.42, -r * 0.88, r * 0.84, r * 0.3, r * 0.08); ctx.fill(); ctx.stroke();
      const gb = ctx.createLinearGradient(-r * 0.5, 0, r * 0.5, 0); gb.addColorStop(0, '#ffffff'); gb.addColorStop(1, '#d6dde6'); ctx.fillStyle = gb;
      rr(ctx, -r * 0.48, -r * 0.6, r * 0.96, r * 1.55, r * 0.3); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fff8e6'; rr(ctx, -r * 0.4, -r * 0.05, r * 0.8, r * 0.92, r * 0.24); ctx.fill();
      ctx.strokeStyle = 'rgba(60,90,130,.6)'; ctx.lineWidth = Math.max(1, r * 0.06); for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-r * 0.48, -r * 0.3 + i * r * 0.32); ctx.lineTo(-r * 0.2, -r * 0.3 + i * r * 0.32); ctx.stroke(); }
      ctx.restore();
    } else { // malvasía: racimo dorado verdoso con hoja
      ctx.fillStyle = '#4f8a2e'; ctx.beginPath(); ctx.ellipse(x + r * 0.45, y - r * 0.95, r * 0.5, r * 0.26, -0.5, 0, TAU); ctx.fill();
      const pos = [[-0.45, -0.55], [0, -0.6], [0.45, -0.55], [-0.25, -0.1], [0.25, -0.1], [-0.45, 0.35], [0.45, 0.35], [0, 0.35], [-0.2, 0.78], [0.2, 0.78]];
      for (const [a, b] of pos) esfera(ctx, x + a * r, y + b * r, r * 0.3, '#f0f0a0', '#7f9a2a');
    }
  }
  function dibujaObjetos(ctx, W, H, u, sx, sy, L, st, t) {
    const tom = (st && st.obj) || {};
    for (const it of L.objetos) {
      const x = sx(it.x), y = sy(it.y); if (x < -u * 2 || x > W + u * 2) continue;
      if (it.kind === 'aljibe') { // aljibe: cubo encalado con tapa redonda, puertecita y una gota que flota si aún tiene agua
        const lleno = !tom[it.id], gy = y + u * 0.9, w = u * 1.3, h = u * 0.95;
        ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.beginPath(); ctx.ellipse(x, gy, w * 0.62, u * 0.12, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = lleno ? '#f3efe4' : '#cfc8b8'; rr(ctx, x - w / 2, gy - h, w, h, u * 0.08); ctx.fill();
        ctx.beginPath(); ctx.ellipse(x, gy - h, w * 0.42, u * 0.38, 0, Math.PI, 0); ctx.fill();
        ctx.fillStyle = 'rgba(0,0,0,.08)'; ctx.fillRect(x + w * 0.18, gy - h, w * 0.32, h);
        ctx.fillStyle = '#2c6e8f'; rr(ctx, x - u * 0.2, gy - u * 0.62, u * 0.4, u * 0.5, u * 0.05); ctx.fill();
        ctx.strokeStyle = 'rgba(60,50,40,.35)'; ctx.lineWidth = Math.max(1, u * 0.03); ctx.strokeRect(x - w / 2, gy - h, w, h);
        if (lleno) { const by = gy - h - u * (0.9 + Math.sin(t * 3 + it.x) * 0.1), r = u * 0.22;
          const g = ctx.createRadialGradient(x, by, 0, x, by, u * 0.7); g.addColorStop(0, 'rgba(120,210,255,.45)'); g.addColorStop(1, 'rgba(120,210,255,0)'); ctx.fillStyle = g; ctx.fillRect(x - u * 0.7, by - u * 0.7, u * 1.4, u * 1.4);
          ctx.fillStyle = COL.agua; ctx.strokeStyle = '#fff'; ctx.lineWidth = Math.max(1.5, u * 0.05); ctx.beginPath(); ctx.moveTo(x, by - r * 1.5); ctx.quadraticCurveTo(x + r * 1.1, by - r * 0.1, x + r, by + r * 0.2); ctx.arc(x, by + r * 0.2, r, 0, Math.PI); ctx.quadraticCurveTo(x - r * 1.1, by - r * 0.1, x, by - r * 1.5); ctx.fill(); ctx.stroke(); }
        continue;
      }
      if (tom[it.id]) continue;
      const by = y + Math.sin(t * 2.6 + it.x) * u * 0.1, r = u * 0.36, pul = 0.5 + 0.5 * Math.sin(t * 4 + it.x);
      const g = ctx.createRadialGradient(x, by, 0, x, by, u * 0.85); g.addColorStop(0, 'rgba(255,236,150,' + (0.35 + pul * 0.25) + ')'); g.addColorStop(1, 'rgba(255,236,150,0)'); ctx.fillStyle = g; ctx.fillRect(x - u, by - u, u * 2, u * 2);
      fruto(ctx, it.kind, x, by, r);
      if (pul > 0.92) { ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.beginPath(); ctx.arc(x + r * 0.9, by - r * 0.9, u * 0.06, 0, TAU); ctx.fill(); }
    }
  }
  /* Lava: un frente incandescente que avanza por detrás de Martín */
  function dibujaLava(ctx, W, H, u, sx, sy, L, st, t, cam0) {
    if (st.lava == null) return;
    const xe = sx(st.lava), ux = x => (x / u) + cam0;   // de pantalla a mundo
    // altura del camino en cada punto (la colada va por encima del suelo y de las rocas; en un hueco cae al fondo)
    const sol = L.solids.filter(q => q.kind !== 'oneway');
    const suelo = wx => { let top = null; for (const q of sol) if (q.x0 <= wx && q.x1 >= wx && (top == null || q.top > top)) top = q.top; return top; };
    const dist = st.x - st.lava;
    if (xe < -u * 0.5) {   // aún no se ve: resplandor rojizo a ras de suelo en el borde, que crece según se acerca
      const ys = suelo(ux(0)), y0 = ys == null ? H : sy(ys), a = Math.max(0, Math.min(0.55, (9 - dist) / 9 * 0.55 + 0.12 * Math.sin(t * 8)));
      const g = ctx.createRadialGradient(0, y0, 0, 0, y0, u * 4); g.addColorStop(0, 'rgba(255,90,20,' + a + ')'); g.addColorStop(1, 'rgba(255,70,20,0)'); ctx.fillStyle = g; ctx.fillRect(0, y0 - u * 4, u * 4, u * 6); return;
    }
    const paso = Math.max(3, u * 0.18), ALTO = 1.25, FR = 1.7;   // espesor de la colada (mundo) y largo de la lengua del frente
    const arr = [], aba = [];
    let ult = suelo(ux(-paso)); if (ult == null) { for (let k = 1; k < 40 && ult == null; k++) ult = suelo(ux(-paso) - k * 0.5); if (ult == null) ult = 0; }
    for (let x = -paso; ; x += paso) {
      const xx = Math.min(x, xe), wx = ux(xx), real = suelo(wx), d = (xe - xx) / u;   // d: distancia al frente
      const ys = real == null ? ult : real; ult = ys;   // en un hueco la lava lo rellena y sigue al nivel del camino
      const base = real == null ? H + 4 : sy(ys) + u * 0.18;
      const grueso = u * ALTO * (d < FR ? Math.sin(Math.min(1, d / FR) * Math.PI / 2) : 1) * (0.92 + 0.08 * Math.sin(wx * 2.3 - t * 1.4));
      arr.push([xx, sy(ys) - grueso + (d < FR ? 0 : Math.sin(wx * 4.1 + t * 2) * u * 0.04)]); aba.push([xx, base]);
      if (xx >= xe) break;
    }
    for (let i = 1; i < arr.length - 1; i++) arr[i][1] = Math.min(arr[i][1], (arr[i - 1][1] + arr[i + 1][1]) / 2 + u * 0.05);   // al bajar un escalón la lava se derrama en cuesta
    const yf = aba[aba.length - 1][1] - u * 0.18;
    // resplandor del frente sobre el suelo
    { const g = ctx.createRadialGradient(xe, yf, 0, xe, yf, u * 3.2); g.addColorStop(0, 'rgba(255,140,40,.5)'); g.addColorStop(1, 'rgba(255,100,30,0)'); ctx.fillStyle = g; ctx.fillRect(xe - u * 3.2, yf - u * 3.2, u * 6.4, u * 4.2); }
    const forma = () => { ctx.beginPath(); ctx.moveTo(aba[0][0], aba[0][1]); arr.forEach(([x, y]) => ctx.lineTo(x, y)); ctx.quadraticCurveTo(xe + u * 0.35, yf - u * 0.1, xe, aba[aba.length - 1][1]); for (let i = aba.length - 1; i >= 0; i--) ctx.lineTo(aba[i][0], aba[i][1]); ctx.closePath(); };
    ctx.save(); forma(); ctx.clip();
    { // lava fundida que asoma por las grietas de una costra oscura y rugosa; la costra se enfría (y oscurece) lejos del frente
      const top = Math.min(...arr.map(p => p[1])) - u, fondo = Math.min(H + 4, Math.max(...aba.map(p => p[1])) + u);
      let g = ctx.createLinearGradient(xe - u * 7, 0, xe, 0); g.addColorStop(0, '#3d0a03'); g.addColorStop(0.45, '#a3290a'); g.addColorStop(0.8, '#f06a18'); g.addColorStop(1, '#ffd27a'); ctx.fillStyle = g; ctx.fillRect(-2, top, xe + u, fondo - top);
      // costra: placas pequeñas e irregulares; avanzan con la colada
      const R = u * 0.3, dx = R * 1.5, dy = R * 1.732, fx = (st.lava * u) % dx;
      const cols = Math.ceil((xe + u) / dx) + 2, rows = Math.ceil((fondo - top) / dy) + 2;
      for (let i = 0; i < cols; i++) {
        const cerca = Math.min(1, Math.max(0, (i - 0.5) / 3)), ci = i + Math.floor(st.lava * u / dx);
        for (let j = -1; j < rows; j++) {
          const k = ci * 131 + j * 17, cx = xe - R * 0.6 - i * dx + fx - dx + (hash(k) - 0.5) * R * 0.7, cy = top + j * dy + (ci % 2) * dy / 2 + (hash(k + 1) - 0.5) * R * 0.7;
          const r = R * (0.7 + 0.42 * cerca) * (0.92 + hash(k + 3) * 0.2), v = hash(k + 4);
          ctx.fillStyle = cerca < 0.3 ? 'rgba(110,28,8,.55)' : 'rgb(' + Math.round(52 - 18 * cerca + v * 16) + ',' + Math.round(38 - 14 * cerca + v * 10) + ',' + Math.round(33 - 10 * cerca + v * 8) + ')';
          ctx.beginPath(); for (let q = 0; q < 7; q++) { const a = q * TAU / 7 + hash(k + 2) * 0.6, rq = r * (0.84 + hash(k + q + 5) * 0.26); q ? ctx.lineTo(cx + Math.cos(a) * rq, cy + Math.sin(a) * rq) : ctx.moveTo(cx + Math.cos(a) * rq, cy + Math.sin(a) * rq); } ctx.closePath(); ctx.fill();
          if (cerca > 0.4) { ctx.fillStyle = 'rgba(140,115,100,.16)'; ctx.beginPath(); ctx.ellipse(cx - r * 0.25, cy - r * 0.35, r * 0.45, r * 0.16, 0.2, 0, TAU); ctx.fill();   // brillo mate de la costra
            ctx.fillStyle = 'rgba(15,8,6,.45)'; for (let q = 0; q < 3; q++) ctx.fillRect(cx + (hash(k + q * 3) - 0.5) * r, cy + (hash(k + q * 3 + 1) - 0.5) * r, Math.max(1, u * 0.03), Math.max(1, u * 0.03)); }   // poros
        }
      }
      // volumen: arriba la piel enfriada, abajo más oscuro
      g = ctx.createLinearGradient(0, top + u, 0, fondo); g.addColorStop(0, 'rgba(255,190,140,.10)'); g.addColorStop(0.5, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(20,4,0,.45)'); ctx.fillStyle = g; ctx.fillRect(-2, top, xe + u, fondo - top);
      // punta del frente: el núcleo incandescente asoma por debajo de la costra
      const gt = ctx.createRadialGradient(xe - u * 0.2, yf + u * 0.1, 0, xe - u * 0.2, yf + u * 0.1, u * 1.5); gt.addColorStop(0, 'rgba(255,240,170,.95)'); gt.addColorStop(0.35, 'rgba(255,150,40,.7)'); gt.addColorStop(1, 'rgba(255,90,20,0)'); ctx.fillStyle = gt; ctx.fillRect(xe - u * 1.8, yf - u * 1.6, u * 2.2, u * 2);
      ctx.strokeStyle = 'rgba(30,6,2,.55)'; ctx.lineWidth = u * 0.2; ctx.beginPath(); aba.forEach(([x, y], i) => i ? ctx.lineTo(x, y - u * 0.08) : ctx.moveTo(x, y - u * 0.08)); ctx.stroke();   // sombra en la base
    }
    ctx.restore();
    ctx.strokeStyle = 'rgba(70,52,44,.85)'; ctx.lineWidth = Math.max(1.5, u * 0.05); ctx.beginPath(); { let ini = false; for (const [x, y] of arr) { if ((xe - x) / u < FR * 0.8) break; if (ini) ctx.lineTo(x, y); else { ctx.moveTo(x, y); ini = true; } } } ctx.stroke();
    // borde incandescente solo en la lengua del frente
    ctx.strokeStyle = 'rgba(255,225,140,.85)'; ctx.lineWidth = Math.max(2, u * 0.06); ctx.beginPath();
    { let ini = false; for (const [x, y] of arr) { if ((xe - x) / u > FR * 1.2) continue; if (ini) ctx.lineTo(x, y); else { ctx.moveTo(x, y); ini = true; } } ctx.quadraticCurveTo(xe + u * 0.35, yf - u * 0.1, xe, aba[aba.length - 1][1]); } ctx.stroke();
    // humo que sube de la colada y chispas en el frente
    for (let i = 0; i < 6; i++) {
      const f = (t * (0.18 + hash(i + 30) * 0.1) + hash(i + 31)) % 1, px = xe - u * (0.6 + hash(i + 32) * 5), ys = suelo(ux(px)) ?? suelo(st.lava); if (px < -u || ys == null) continue;
      const y = sy(ys) - u * ALTO - f * u * 3.5, r = u * (0.35 + f * 0.9); ctx.globalAlpha = 0.28 * (1 - f) * Math.min(1, f * 5);
      ctx.fillStyle = '#5a504c'; ctx.beginPath(); ctx.arc(px + Math.sin(t + i) * u * 0.3 + f * u * 0.6, y, r, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1; ctx.fillStyle = 'rgba(255,220,120,.9)';
    for (let i = 0; i < 7; i++) { const f = (t * (0.7 + hash(i) * 0.6) + hash(i + 4)) % 1, xx = xe - u * hash(i + 20) * 1.2 + f * u * 0.6; ctx.globalAlpha = 1 - f; ctx.beginPath(); ctx.arc(xx, yf - u * hash(i + 8) * ALTO - f * u * 1.4, u * 0.06, 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1;
  }
  function dibujaEscena(ctx, W, H, u, cam, L, esc, t, fx) {
    const TM = TEMAS[esc.tema || 0], TX = texturas();
    const sx = wx => (wx - cam.x) * u, sy = wy => H - (wy - cam.y) * u;
    { // altura en pantalla del suelo bajo el centro de la vista (suavizada) para apoyar el paisaje
      const cx = cam.x + W / u / 2; let top = null; for (const s of L.solids) if (s.kind === 'ground' && s.x0 <= cx + 3 && s.x1 >= cx - 3 && (top == null || s.top > top)) top = s.top;
      if (top != null) { const y = sy(top); PAI.suelo = PAI.suelo == null || Math.abs(PAI.suelo - y) > H * 0.5 ? y : PAI.suelo + (y - PAI.suelo) * 0.035; } }
    dibujaFondo(ctx, W, H, u, cam, TM, t, Math.max(0, (L.world.max_x - Math.max(0, L.world.min_x))) + 2);
    // abismo de los huecos
    for (const h of esc.huecos) {
      const x0 = sx(h.x0), x1 = sx(h.x1); if (x1 < -4 || x0 > W + 4) continue;
      if (TX.lavaP) { // abismo pintado: la misma lava, más oscura según se hunde
        const yt = sy(h.top); ctx.fillStyle = relleno(ctx, TX.lavaP, -cam.x * u, yt, '#1a0d0c', u * 2.2 / TX.lavaP.height); ctx.fillRect(x0, yt, x1 - x0, H - yt + 2);
        const g = ctx.createLinearGradient(0, yt, 0, yt + u * 3); g.addColorStop(0, 'rgba(8,4,4,.55)'); g.addColorStop(1, 'rgba(4,2,2,.92)'); ctx.fillStyle = g; ctx.fillRect(x0, yt, x1 - x0, H - yt + 2);
        const eg = ctx.createRadialGradient((x0 + x1) / 2, H, 0, (x0 + x1) / 2, H, Math.max(u * 3, (x1 - x0))); eg.addColorStop(0, 'rgba(255,120,50,.3)'); eg.addColorStop(1, 'rgba(255,90,30,0)'); ctx.fillStyle = eg; ctx.fillRect(x0, yt, x1 - x0, H - yt + 2);
        continue;
      }
      const yt = sy(h.top), g = ctx.createLinearGradient(0, yt, 0, H); g.addColorStop(0, '#3a1d18'); g.addColorStop(0.35, '#1a0d0c'); g.addColorStop(1, '#070304'); ctx.fillStyle = g; ctx.fillRect(x0, yt, x1 - x0, H - yt + 2);
      const eg = ctx.createRadialGradient((x0 + x1) / 2, H, 0, (x0 + x1) / 2, H, Math.max(u * 3, (x1 - x0))); eg.addColorStop(0, 'rgba(255,120,50,.35)'); eg.addColorStop(1, 'rgba(255,90,30,0)'); ctx.fillStyle = eg; ctx.fillRect(x0, yt, x1 - x0, H - yt + 2);
      ctx.strokeStyle = 'rgba(90,50,40,.5)'; ctx.lineWidth = Math.max(1, u * 0.04); for (let k = 1; k < 5; k++) { const y = yt + u * k * 1.1; if (y > H) break; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y + (k % 2 ? u * 0.1 : -u * 0.1)); ctx.stroke(); }
    }
    const st = esc.s; vecinos(L.solids);
    for (const s of L.solids) {
      const x0 = sx(s.x0), x1 = sx(s.x1); if (x1 < -4 || x0 > W + 4) continue;
      let jit = 0;
      if (s.fragil && st && st.der) { const dv = st.der[s.id]; if (dv === 0) continue; if (dv > 0) { jit = Math.sin(t * 60) * u * 0.05 * (1 + (60 - dv) / 30); ctx.save(); ctx.translate(jit, Math.max(0, 60 - dv) * u * 0.002); } }
      if (s.kind === 'ground' || s.kind === 'wall') dibujaSuelo(ctx, s, W, H, u, cam, sx, sy, TX);
      if (s.sal) { // salina: costra blanca y rosada, con cuadrícula de tajos y destellos de sal
        const yt = sy(s.top), xa = Math.max(x0, -4), xb = Math.min(x1, W + 4), g = ctx.createLinearGradient(0, yt - u * 0.08, 0, yt + u * 1.1);
        g.addColorStop(0, '#fdfaf7'); g.addColorStop(0.3, '#f3e3e2'); g.addColorStop(0.55, 'rgba(226,170,180,.85)'); g.addColorStop(1, 'rgba(190,120,135,0)'); ctx.fillStyle = g; ctx.fillRect(xa, yt - u * 0.08, xb - xa, u * 1.18);
        ctx.strokeStyle = 'rgba(190,140,150,.45)'; ctx.lineWidth = Math.max(1, u * 0.03); ctx.beginPath();
        for (let wx = Math.ceil(s.x0 / 1.6) * 1.6; wx < s.x1; wx += 1.6) { const px = sx(wx); if (px < -4 || px > W + 4) continue; ctx.moveTo(px, yt); ctx.lineTo(px - u * 0.15, yt + u * 0.3); } ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,.95)';
        for (let wx = Math.ceil(s.x0 * 2) / 2; wx < s.x1; wx += 0.5) { const px = sx(wx); if (px < -4 || px > W + 4) continue; const k = Math.floor(wx * 2), q = Math.sin(t * 2.2 + k * 1.7); if (q > 0.8) { const r = u * 0.05 * (q - 0.8) * 5; ctx.fillRect(px - r, yt - u * 0.02, r * 2, u * 0.03); ctx.fillRect(px - u * 0.012, yt - r, u * 0.024, r * 2); } }
      }
      else if (s.kind === 'rock') { const r = esc.rocas.find(q => q.id === s.id), base = r ? r.base : s.top - 1;
        if (s.top - base > 1.7) { dibujaSuelo(ctx, { x0: s.x0, x1: s.x1, top: s.top - 1.1, bot: -1e9 }, W, H, u, cam, sx, sy, TX); dibujaRoca(ctx, s, s.top - 1.2, W, H, u, sx, sy); }
        else dibujaRoca(ctx, s, base, W, H, u, sx, sy); }
      else if (s.kind === 'oneway') { if (esc.tema === 9 && s.route && FLO.ok) dibujaCopa(ctx, s, W, H, u, sx, sy, L, t); else dibujaRepisa(ctx, s, W, H, u, sx, sy); }
      if (s.fragil) { // grietas: avisan de que el suelo cede
        const yt = sy(s.top); ctx.strokeStyle = 'rgba(20,8,4,.85)'; ctx.lineWidth = Math.max(1.5, u * 0.05); ctx.lineCap = 'round';
        for (let k = 0; k < 3; k++) { const cx = x0 + (x1 - x0) * (0.25 + k * 0.25); ctx.beginPath(); ctx.moveTo(cx, yt); ctx.lineTo(cx + u * 0.12, yt + u * 0.22); ctx.lineTo(cx - u * 0.05, yt + u * 0.42); ctx.lineTo(cx + u * 0.1, yt + u * 0.62); ctx.stroke(); }
      }
      if (jit) ctx.restore();
    }
    if (st && L.peligros && L.peligros.length && window.Martin) dibujaPeligros(ctx, W, H, u, sx, sy, L, st, t);
    for (const d of esc.deco) { const x = sx(d.x); if (x < -60 || x > W + 60) continue; dibujaDeco(ctx, d, x, sy(d.y), u, t); }
    if (L.calor) dibujaSombrasCalor(ctx, W, H, u, sx, sy, L);
    if (L.objetos && L.objetos.length) dibujaObjetos(ctx, W, H, u, sx, sy, L, st, t);
    // puntos de control
    for (const c of L.cps) {
      const x = sx(c.x); if (x < -60 || x > W + 60) continue; const y = sy(c.y), ya = c.alcanzado, o = Math.sin(t * 4);
      if (ya) { const gg = ctx.createRadialGradient(x, y - u * 1.8, 0, x, y - u * 1.8, u * 2.2); gg.addColorStop(0, 'rgba(120,210,255,.35)'); gg.addColorStop(1, 'rgba(120,210,255,0)'); ctx.fillStyle = gg; ctx.fillRect(x - u * 2.2, y - u * 4, u * 4.4, u * 4.4); }
      ctx.strokeStyle = '#3a2a1c'; ctx.lineWidth = Math.max(2, u * 0.1); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - u * 2.3); ctx.stroke();
      ctx.fillStyle = ya ? '#2f93d4' : '#e6dfd0'; ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, y - u * 2.3); ctx.bezierCurveTo(x + u * 0.5, y - u * (2.4 + o * 0.08), x + u * 0.7, y - u * (2.0 - o * 0.08), x + u * 1.0, y - u * (1.95 + o * 0.05)); ctx.lineTo(x, y - u * 1.5); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#3a2a1c'; ctx.beginPath(); ctx.arc(x, y - u * 2.33, u * 0.08, 0, TAU); ctx.fill();
    }
    // meta: casita del pueblo con pozo (en el Mundo 3 no: Martín aún no lleva agua; la meta es el camellero, que le espera)
    const mx = sx(L.goals.finish_x);
    if (!L.cuerpo && mx > -300 && mx < W + 300) {
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
    if (FLO.ok) return;   // las siluetas planas no casaban con el estilo pintado
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
        const tt = f.v / 60, gx = x + f.vx * tt * u, gy = y - (f.vy * tt - 6 * tt * tt) * u; if (f.piedra) { ctx.fillStyle = 'rgba(40,30,32,' + (1 - q) + ')'; ctx.fillRect(gx - u * 0.1, gy - u * 0.1, u * 0.2, u * 0.16); continue; } ctx.fillStyle = 'rgba(70,175,240,' + (1 - q) + ')'; ctx.beginPath(); ctx.arc(gx, gy, u * 0.09, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,' + (0.8 * (1 - q)) + ')'; ctx.beginPath(); ctx.arc(gx - u * 0.025, gy - u * 0.03, u * 0.03, 0, TAU); ctx.fill();
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

  function dibujaLavaVista(ctx, W, H, u, cam, L, st, t) { if (!st || !L.lava) return; dibujaLava(ctx, W, H, u, wx => (wx - cam.x) * u, wy => H - (wy - cam.y) * u, L, st, t, cam.x); }
  /* Guía de la naturaleza: qué especies salen en un nivel (misma regla que elige cada dibujo) y su retrato */
  const SPR_ESP = { palmera: 'palmera', tabaibal: 'tabaiba', tunera: 'tunera', pita: 'pita', vid: 'vid', aloe: 'aloe', bejeque: 'bejeque', aulaga: 'aulaga' };
  function especiesDe(L, idx) {
    const sc = preparaEscena(L, idx), set = new Set(['camello']);
    for (const d of sc.deco) {
      if (d.t === 'lagarto') { set.add('lagarto'); continue; }
      const l = FLO.por[d.t]; if (!l) continue;
      const n = l[Math.floor(hash(Math.floor(d.x * 7) + 5) * l.length)]; if (SPR_ESP[n]) set.add(SPR_ESP[n]);
    }
    if (sc.tema === 9) set.add('palmera');                       // Haría: el camino alto va por las copas de las palmeras
    if (L.solids.some(q => q.sal)) set.add('artemia');           // salinas
    return [...set];
  }
  function dibujaEspecie(ctx, id, W, H) {
    ctx.clearRect(0, 0, W, H);
    const inv = Object.keys(SPR_ESP).find(k => SPR_ESP[k] === id);
    if (inv && FLO.ok) { const m0 = FLO.m[inv], dx = Math.round(m0[2] * 0.035), m = [m0[0] + dx, m0[1], m0[2] - 2 * dx, m0[3]], k = Math.min(W * 0.92 / m[2], H * 0.92 / m[3]); ctx.drawImage(FLO.img, m[0], m[1], m[2], m[3], (W - m[2] * k) / 2, (H - m[3] * k) / 2, m[2] * k, m[3] * k); return; }
    if (id === 'lagarto') { dibujaDeco(ctx, { t: 'lagarto', x: 0, s: 1, h: 0.85 }, W * 0.4, H * 0.7, W / 1.35, 0); return; }
    if (id === 'camello' && SPR.ok) { const k = Math.min(W * 0.9 / 551, H * 0.9 / 560); ctx.drawImage(SPR.img, (W - 551 * k) / 2, (H - 560 * k) / 2, 551 * k, 560 * k); return; }
    if (id === 'artemia') {   // pequeño crustáceo rojo, nadando boca arriba
      ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(-0.25); const L = W * 0.36;
      ctx.strokeStyle = '#c94a3a'; ctx.lineWidth = Math.max(1, W * 0.012); for (let i = 0; i < 11; i++) { const x = -L * 0.45 + i * L * 0.075; ctx.beginPath(); ctx.moveTo(x, 0); ctx.quadraticCurveTo(x + L * 0.04, -L * 0.12, x + L * 0.02, -L * 0.2); ctx.stroke(); }
      const g = ctx.createLinearGradient(0, -L * 0.1, 0, L * 0.1); g.addColorStop(0, '#ec7a5e'); g.addColorStop(1, '#b8332a'); ctx.fillStyle = g;
      ctx.beginPath(); ctx.ellipse(-L * 0.1, 0, L * 0.45, L * 0.07, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.moveTo(L * 0.3, -L * 0.03); ctx.quadraticCurveTo(L * 0.7, 0, L * 0.85, L * 0.12); ctx.lineTo(L * 0.82, -L * 0.02); ctx.quadraticCurveTo(L * 0.62, -L * 0.04, L * 0.3, -L * 0.05); ctx.fill();
      ctx.fillStyle = '#2a1414'; for (const yy of [-1, 1]) { ctx.beginPath(); ctx.arc(-L * 0.58, yy * L * 0.06, L * 0.035, 0, TAU); ctx.fill(); }
      ctx.restore(); return;
    }
    ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.beginPath(); ctx.arc(W / 2, H / 2, Math.min(W, H) * 0.35, 0, TAU); ctx.fill();   // aún sin cargar
  }

  /* ================== Mundo 3 (3.0): el camellero, la manada, la escultura de Uga, la sombra, el calor y el eclipse ================== */
  // camellero: de lado, sombrero de paja, camisa clara y vara; nunca se le ve la cara de cerca (pies en x,y de pantalla; u = px por unidad)
  function camelleroFig(ctx, x, y, u, fase, dir, alfa) {
    if (CW.ok) { dibujaGuelfoPaso(ctx, u, x, y, { dir, fase: fase || 0, anim: fase ? 'corre' : 'idle', t: 0, golpe: 0, alpha: alfa }, CW); return; }
    if (CSP.ok) { dibujaGuelfo(ctx, u, x, y, { dir, fase: (fase || 0) / 1.6 * 0.9, anim: fase ? 'corre' : 'idle', t: 0, golpe: 0, alpha: alfa }, CSP); return; }
    ctx.save(); ctx.translate(x, y); ctx.scale(dir < 0 ? -u : u, -u); ctx.globalAlpha = alfa == null ? 1 : alfa; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const pa = Math.sin(fase) * 0.22, br = Math.sin(fase) * 0.25;
    const pierna = (a, col) => { ctx.strokeStyle = col; ctx.lineWidth = 0.2; ctx.beginPath(); ctx.moveTo(0, 1.02); ctx.lineTo(Math.sin(a) * 0.5, 0.52); ctx.lineTo(Math.sin(a) * 0.62 - 0.04, 0.06); ctx.stroke();
      ctx.fillStyle = '#2a1d16'; ctx.beginPath(); ctx.ellipse(Math.sin(a) * 0.62 + 0.06, 0.04, 0.14, 0.06, 0, 0, TAU); ctx.fill(); };
    pierna(-pa, '#2c3a4e'); 
    ctx.strokeStyle = '#d9cbb0'; ctx.lineWidth = 0.13; ctx.beginPath(); ctx.moveTo(-0.02, 1.78); ctx.lineTo(-Math.sin(br) * 0.4, 1.26); ctx.lineTo(-Math.sin(br) * 0.46 + 0.06, 0.98); ctx.stroke();   // brazo de atrás
    ctx.fillStyle = '#efe6d2'; ctx.strokeStyle = '#8a7a60'; ctx.lineWidth = 0.03; ctx.beginPath(); ctx.moveTo(-0.22, 1.0); ctx.lineTo(-0.24, 1.8); ctx.quadraticCurveTo(0, 1.92, 0.22, 1.8); ctx.lineTo(0.22, 1.0); ctx.closePath(); ctx.fill(); ctx.stroke();   // camisa
    pierna(pa, '#344660');
    ctx.fillStyle = '#c99a6b'; ctx.beginPath(); ctx.arc(0.02, 2.05, 0.17, 0, TAU); ctx.fill();   // cabeza (de lado, sin cara)
    ctx.fillStyle = '#e8cf86'; ctx.strokeStyle = '#9a7a3a'; ctx.lineWidth = 0.025; ctx.beginPath(); ctx.ellipse(0.02, 2.16, 0.38, 0.07, 0, 0, TAU); ctx.fill(); ctx.stroke();   // ala del sombrero
    ctx.beginPath(); ctx.moveTo(-0.17, 2.17); ctx.quadraticCurveTo(-0.15, 2.4, 0.02, 2.4); ctx.quadraticCurveTo(0.19, 2.4, 0.2, 2.17); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#8a3a2a'; ctx.fillRect(-0.16, 2.17, 0.36, 0.05);
    ctx.strokeStyle = '#e2d6bd'; ctx.lineWidth = 0.13; ctx.beginPath(); ctx.moveTo(0.04, 1.78); ctx.lineTo(Math.sin(br) * 0.32 + 0.12, 1.3); ctx.lineTo(Math.sin(br) * 0.3 + 0.36, 1.12); ctx.stroke();   // brazo de delante
    ctx.strokeStyle = '#6a4a2a'; ctx.lineWidth = 0.06; ctx.beginPath(); ctx.moveTo(Math.sin(br) * 0.3 + 0.3, 1.5); ctx.lineTo(Math.sin(br) * 0.3 + 0.62, 0.0); ctx.stroke();   // vara
    ctx.restore();
  }
  // camellos de la manada con la silla de los paseos (la ilustración de Martín, a otro tamaño)
  function camelloManada(ctx, x, y, u, fase, alfa) {
    if (!SPR.ok) { dibujaMartin(ctx, u, x, y, { dir: 1, fase, anim: 'corre', agua: 100, golpe: 0, t: 0, alpha: alfa }); return; }
    dibujaMartinSprite(ctx, u, x, y, { dir: 1, fase, anim: fase == null ? 'idle' : 'corre', agua: 100, golpe: 0, t: fase || 0, alpha: alfa == null ? 0.96 : alfa });
  }
  // escultura de picón rojo de la entrada de Uga: un camello, una camella y un guelfo (siluetas propias, sobre un pedestal)
  let ESCU = null;
  function escultura(ctx, x, y, u) {
    if (!SPR.ok) return;
    if (!ESCU) { const c = document.createElement('canvas'); c.width = 551; c.height = 560; const g = c.getContext('2d'); g.drawImage(SPR.img, 0, 0); g.globalCompositeOperation = 'source-atop';
      const gr = g.createLinearGradient(0, 0, 0, 560); gr.addColorStop(0, '#b3523a'); gr.addColorStop(1, '#6e2a1c'); g.fillStyle = gr; g.globalAlpha = 0.86; g.fillRect(0, 0, 551, 560);
      g.globalAlpha = 0.25; for (let i = 0; i < 900; i++) { g.fillStyle = i % 2 ? '#2a0f08' : '#e08a62'; g.fillRect(hash(i * 3) * 551, hash(i * 3 + 1) * 560, 3, 3); } ESCU = c; }
    ctx.fillStyle = '#5a4a44'; ctx.fillRect(x - u * 3.4, y - u * 0.55, u * 6.8, u * 0.55); ctx.fillStyle = '#6e5c55'; ctx.fillRect(x - u * 3.4, y - u * 0.6, u * 6.8, u * 0.12);
    const pon = (dx, alto, dir) => { const h = alto * u, w = h * 551 / 560; ctx.save(); ctx.translate(x + dx * u, y - u * 0.55); if (dir < 0) ctx.scale(-1, 1); ctx.drawImage(ESCU, -w * 0.42, -h, w, h); ctx.restore(); };
    pon(-1.6, 2.7, 1); pon(1.4, 2.5, -1); pon(0.1, 1.5, 1);
  }
  // sombra de muros y piedras en el nivel del calor: una franja oscura en el suelo y un muro bajo de piedra seca detrás
  function dibujaSombrasCalor(ctx, W, H, u, sx, sy, L) {
    const C = L.calor; if (!C) return;
    for (const z of C.sombras) {
      const x0 = sx(z[0]), x1 = sx(z[1]); if (x1 < -u * 2 || x0 > W + u * 2) continue;
      let top = null; for (const s of L.solids) if (s.kind === 'ground' && s.x0 <= (z[0] + z[1]) / 2 && s.x1 >= (z[0] + z[1]) / 2) top = s.top; if (top == null) continue;
      const y = sy(top);
      // la sombra solo en el suelo: una mancha oscura y alargada, más fuerte en el centro
      const g = ctx.createRadialGradient((x0 + x1) / 2, y, 0, (x0 + x1) / 2, y, (x1 - x0) * 0.6);
      g.addColorStop(0, 'rgba(25,12,20,.45)'); g.addColorStop(1, 'rgba(25,12,20,0)');
      ctx.save(); ctx.translate((x0 + x1) / 2, y); ctx.scale(1, 0.16); ctx.translate(-(x0 + x1) / 2, -y); ctx.fillStyle = g; ctx.beginPath(); ctx.arc((x0 + x1) / 2, y, (x1 - x0) * 0.6, 0, TAU); ctx.fill(); ctx.restore();
      // muro de piedra seca: las mismas piedras pintadas del paisaje, en una hilera baja (solo en las sombras anchas; las demás son de las rocas del camino)
      if (z[1] - z[0] > 4.5 && FLO.ok) {
        const m = FLO.m.piedras, hh = u * 0.85, ww = hh * m[2] / m[3], n = Math.max(2, Math.ceil((x1 - x0) / (ww * 0.8)));
        for (let k = 0; k < n; k++) { const cx = x0 + (k + 0.5) * (x1 - x0) / n, f = hash(k + Math.floor(z[0] * 7)) < 0.5 ? -1 : 1;
          ctx.save(); ctx.translate(cx, y + hh * 0.08); ctx.scale(f, 1); ctx.drawImage(FLO.img, m[0], m[1], m[2], m[3], -ww / 2, -hh, ww, hh); ctx.restore(); }
      }
    }
  }
  // capa por encima de la escena: el camellero o la manada, la escultura y los camellos del Echadero (no cambia nada de las reglas)
  function dibujaMundo3(ctx, W, H, u, cam, L, st, t) {
    const sx = wx => (wx - cam.x) * u, sy = wy => H - (wy - cam.y) * u;
    const top = x => { let b = null; for (const s of L.solids) if (s.kind !== 'oneway' && s.x0 <= x && s.x1 >= x && (b == null || s.top > b)) b = s.top; return b == null ? 0 : b; };
    if (L.escultura != null) { const x = sx(L.escultura); if (x > -u * 5 && x < W + u * 5) escultura(ctx, x, sy(top(Math.min(L.escultura, L.world.max_x - 0.5))), u); }
    if (L.manadaFin) for (let k = 0; k < 4; k++) { const wx = L.goals.finish_x + 1.5 + k * 2.6, x = sx(wx); if (x > -u * 4 && x < W + u * 4) camelloManada(ctx, x, sy(top(Math.min(wx, L.world.max_x - 0.5))), u * 0.95, null, 0.95); }
    const G = L.guia;
    if (G && st && st.guia != null) {
      const gx = st.guia, anda = gx < G.hasta && (st.fase === 'jugando'), f = gx * 1.9;
      for (let k = (G.manada || 0); k >= 1; k--) { const wx = gx - 0.8 - k * 2.05, x = sx(wx); if (x > -u * 4 && x < W + u * 4) camelloManada(ctx, x, sy(top(wx)), u, anda ? f - k : null); }
      const x = sx(gx); if (x > -u * 2 && x < W + u * 2) camelleroFig(ctx, x, sy(top(gx)), u * 0.95, anda ? gx * 7.3 : 0, 1);
    } else if (L.camellero != null || L.cuerpo) { const cx = L.camellero != null ? L.camellero : L.goals.finish_x + 1.5, x = sx(cx); if (x > -u * 2 && x < W + u * 2) camelleroFig(ctx, x, sy(top(Math.min(cx, L.world.max_x - 0.5))), u * 0.95, 0, -1); }
  }
  // eclipse del 12 de agosto (parcial en Lanzarote, a la caída de la tarde): la luz baja y se enfría poco a poco y el Sol se vuelve media luna
  const ECL = new Map();   // medias lunas ya pintadas (no se crea nada nuevo en cada imagen)
  function dibujaEclipse(ctx, W, H, q, cx, cy, r) {
    q = clamp(q, 0, 1);
    ctx.fillStyle = 'rgba(30,24,70,' + (0.38 * q) + ')'; ctx.fillRect(0, 0, W, H);
    const x = cx == null ? W * 0.8 : cx, y = cy == null ? H * 0.2 : cy, R = r || Math.min(W, H) * 0.07;
    const g = ctx.createRadialGradient(x, y, R * 0.5, x, y, R * 3); g.addColorStop(0, 'rgba(255,220,150,' + (0.5 * (1 - q * 0.6)) + ')'); g.addColorStop(1, 'rgba(255,200,120,0)'); ctx.fillStyle = g; ctx.fillRect(x - R * 3, y - R * 3, R * 6, R * 6);
    const qq = Math.round(q * 40) / 40, key = Math.round(R) + ':' + qq; let c = ECL.get(key);
    if (!c) { c = document.createElement('canvas'); c.width = c.height = Math.ceil(R * 2 + 4); const h = c.getContext('2d'), o0 = R + 2;
      h.fillStyle = '#ffd27a'; h.beginPath(); h.arc(o0, o0, R, 0, TAU); h.fill();
      h.globalCompositeOperation = 'destination-out'; h.beginPath(); h.arc(o0 + R * (2 - 1.56 * qq), o0 - R * 0.35 * qq, R * 1.02, 0, TAU); h.fill();   // la Luna tapa hasta unos tres cuartos del Sol
      if (ECL.size > 60) ECL.clear(); ECL.set(key, c); }
    const o = R + 2; ctx.drawImage(c, x - o, y - o);
  }
  // fondo de las escenas de la historia del Mundo 3 (dibujo fijo, sin texto)
  const HIST_IMG = {};
  function dibujaHistoria(ctx, W, H, k, luego = true) {
    const cielos = { 1: ['#1c2a5a', '#6a6fa8', '#e7b49a'], 2: ['#3a6fb8', '#8ab8e0', '#f2e2c4'], 3: ['#2f7fd0', '#79b6e6', '#e8eef0'], 4: ['#3a4a8a', '#c58aa0', '#ffd39a'], 5: ['#4a6fb0', '#e09a7a', '#ffd9a0'], 6: ['#4a8ad6', '#a9cde6', '#f6e6c4'], 7: ['#2e2f6e', '#a2506b', '#ffc27a'], 8: ['#24275a', '#8a4a6a', '#f0a060'] };
    const cs = cielos[k] || cielos[3], g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, cs[0]); g.addColorStop(0.6, cs[1]); g.addColorStop(1, cs[2]); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const u = H / 6; let suelo = H * 0.82;
    // fondo: el mismo paisaje pintado de los niveles, con la luz de la hora de cada escena
    const fotos = { 1: ['paisaje-uga.jpg', 'rgba(20,24,70,.55)'], 2: ['escena-calle-palmera.jpg', 'rgba(255,220,170,.04)', 1], 3: ['escena-calle-farolas.jpg', 'rgba(0,0,0,0)', 1], 4: ['fila-amanecer.jpg', 'rgba(0,0,0,0)', 1], 5: ['fila-amanecer.jpg', 'rgba(255,190,140,.06)', 1], 9: ['echadero.jpg', 'rgba(0,0,0,0)', 1], 6: ['sendero-malpais.jpg', 'rgba(255,200,110,.10)'], 7: ['paisaje-ocaso.jpg', 'rgba(40,30,90,.18)'], 8: ['paisaje-ocaso.jpg', 'rgba(30,24,80,.34)'] }, fo = fotos[k];
    if (fo) { const im = HIST_IMG[fo[0]] || (HIST_IMG[fo[0]] = Object.assign(new Image(), { src: fo[0] }));
      if (im.complete && im.naturalWidth) { const kk = Math.max(W / im.naturalWidth, H / im.naturalHeight), w = im.naturalWidth * kk, h = im.naturalHeight * kk; ctx.drawImage(im, (W - w) * 0.5, H - h, w, h); ctx.fillStyle = fo[1]; ctx.fillRect(0, 0, W, H); suelo = H * 0.95; }
      else { if (luego) im.addEventListener('load', () => dibujaHistoria(ctx, W, H, k), { once: true }); } }
    if (k >= 7) dibujaEclipse(ctx, W, H, k === 7 ? 0.45 : 0.85, W * 0.76, H * 0.3, H * 0.09);
    else if (k !== 1 && !(fo && HIST_IMG[fo[0]] && HIST_IMG[fo[0]].naturalWidth)) { ctx.fillStyle = 'rgba(255,245,210,.9)'; ctx.beginPath(); ctx.arc(W * (k === 4 ? 0.2 : 0.8), H * (k === 4 ? 0.62 : 0.2), H * 0.07, 0, TAU); ctx.fill(); }
    const conFoto = fo && HIST_IMG[fo[0]] && HIST_IMG[fo[0]].complete && HIST_IMG[fo[0]].naturalWidth;
    if (!conFoto) { ctx.fillStyle = '#7d6488'; ctx.beginPath(); ctx.moveTo(0, suelo - u * 1.2); for (let i = 0; i <= 8; i++) ctx.lineTo(W * i / 8, suelo - u * (1.0 + Math.sin(i * 1.7 + k) * 0.5 + hash(i + k * 9) * 0.4)); ctx.lineTo(W, suelo); ctx.lineTo(0, suelo); ctx.fill(); }   // montañas
    if (!conFoto) { const ts = texturas().tierraP; ctx.fillStyle = ts ? relleno(ctx, ts, 0, suelo, '#3a2a24', u * 1.6 / ts.height) : '#3a2a24'; ctx.fillRect(0, suelo, W, H - suelo); const gs = ctx.createLinearGradient(0, suelo, 0, H); gs.addColorStop(0, 'rgba(0,0,0,0)'); gs.addColorStop(1, 'rgba(0,0,0,.45)'); ctx.fillStyle = gs; ctx.fillRect(0, suelo, W, H - suelo); }
    if (!conFoto) ctx.fillStyle = '#2a1f1c'; if (!conFoto) for (let i = 0; i < 18; i++) { const bx = i * W / 17 - u * 0.2; ctx.beginPath(); ctx.ellipse(bx, suelo - u * 0.3, u * 0.32, u * 0.3, 0, 0, TAU); ctx.fill(); }   // muro de piedra seca al fondo
    const ilus = fo && fo[2] && HIST_IMG[fo[0]] && HIST_IMG[fo[0]].naturalWidth;
    if (ilus) { const im = HIST_IMG[fo[0]], kk = Math.max(W / im.naturalWidth, H / im.naturalHeight); ctx.drawImage(im, (W - im.naturalWidth * kk) / 2, (H - im.naturalHeight * kk) / 2, im.naturalWidth * kk, im.naturalHeight * kk); ctx.fillStyle = fo[1]; ctx.fillRect(0, 0, W, H);
      if (k === 2 || k === 3) { camelleroFig(ctx, W * (k === 2 ? 0.3 : 0.42), H * 0.95, H * 0.115, 0, 1, 1); dibujaMartin(ctx, H * 0.085, W * (k === 2 ? 0.5 : 0.6), H * 0.95, { dir: k === 2 ? -1 : 1, fase: 0.6, anim: 'idle', agua: 100, golpe: 0, t: 1, guelfo: true }); return; }
      if (k === 5) dibujaMartin(ctx, H * 0.055, W * 0.955, H * 0.475, { dir: -1, fase: 0.6, anim: 'idle', agua: 100, golpe: 0, t: 1, guelfo: true });   // el último de la fila, al fondo
      else if (k === 9) dibujaMartin(ctx, H * 0.2, W * 0.5, H * 0.97, { dir: 1, fase: 0.6, anim: 'idle', agua: 100, golpe: 0, t: 1, guelfo: true });
      else dibujaMartin(ctx, H * 0.11, W * 0.12, H * 0.97, { dir: 1, fase: 0.6, anim: 'idle', agua: 100, golpe: 0, t: 1, guelfo: true }); return; }
    if (k === 4 || k === 7) for (let i = 0; i < 3; i++) camelloManada(ctx, W * (0.06 + i * 0.17), suelo, u * 0.62, k === 7 ? null : i * 0.8, 0.95);
    const mx = k === 1 ? W * 0.5 : k === 5 ? W * 0.68 : k === 8 ? W * 0.56 : W * 0.6;
    if (k >= 2) camelleroFig(ctx, k === 3 ? W * 0.42 : k === 6 ? W * 0.42 : k === 5 ? W * 0.8 : W * 0.4, suelo, u * 0.95, k === 3 || k === 5 ? 0.8 : 0, k === 8 || k === 6 || k === 2 ? 1 : 1, 1);
    dibujaMartin(ctx, u * 0.62, mx, suelo, { dir: k === 8 ? -1 : 1, fase: 0.6, anim: k === 6 || k === 1 ? 'idle' : 'idle', agua: 100, golpe: 0, t: 1, guelfo: true });
    if (k === 8) { const v = u * 0.55; ctx.save(); ctx.translate(W * 0.12, suelo - u * 0.25); ctx.globalAlpha = 0.85; ctx.fillStyle = '#1c1626'; ctx.beginPath(); ctx.ellipse(0, -v * 1.45, v * 0.24, v * 0.42, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(0, -v * 2.05, v * 0.17, 0, TAU); ctx.fill(); ctx.fillRect(-v * 0.16, -v * 1.1, v * 0.12, v * 1.1); ctx.fillRect(v * 0.04, -v * 1.1, v * 0.12, v * 1.1); ctx.fillRect(v * 0.1, -v * 1.75, v * 0.38, v * 0.12); ctx.fillRect(v * 0.42, -v * 1.82, v * 0.16, v * 0.24); ctx.restore(); }   // la fotógrafa, de espaldas y a lo lejos
    if (k === 1) { ctx.fillStyle = 'rgba(255,255,255,.75)'; for (let i = 0; i < 30; i++) { ctx.beginPath(); ctx.arc(hash(i * 3) * W, hash(i * 3 + 1) * H * 0.5, 1 + hash(i) * 1.5, 0, TAU); ctx.fill(); } }   // de madrugada: estrellas
    const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, W * 0.7); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.35)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  }
  window.Dibujo = { COL, especiesDe, dibujaEspecie, dibujaLavaVista, fruto, hash, TEMAS, preparaEscena, dibujaMartin, dibujaEscena, dibujaSombra, dibujaFx, dibujaPost, dibujaFondo, dibujaPrimerPlano, dibujaHero, dibujaMini, dibujaMundo3, dibujaEclipse, dibujaHistoria, dibujaSombrasCalor, camelleroFig };
})();
