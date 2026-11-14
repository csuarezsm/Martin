/* Martín: Los Caminos del Volcán — pantallas, dibujo, controles y reto diario (IT Canarias)
   © 2026 IT Canarias. Todos los derechos reservados.
   Las reglas viven en martin.js (el mismo archivo que usa el servidor). Aquí solo se dibuja y se escuchan los dedos.
   Los dibujos y sonidos son propios (se pintan con código); Martín está inspirado en un guelfo real de Uga; la historia y las rutas son inventadas. */
'use strict';
const M = window.Martin;
// Servidor de juegos (repo csuarezsm/juegos-servidor): el reto diario. Vacío = el reto diario solo se puede practicar.
const ONLINE_URL = 'MARTIN_ONLINE_URL' in window ? window.MARTIN_ONLINE_URL : 'wss://juegos.itcanarias.com/ws';
const HTTP_BASE = ONLINE_URL ? ONLINE_URL.replace(/^ws/, 'http').replace(/\/ws$/, '') : '';
const NIV = (window.MARTIN_NIVELES || []).map(t => M.cargar(t));
const MODS_TXT = { normal: ['Agua normal', 'Todo como siempre.'], fragil: ['Cántaro frágil', 'Los golpes y las caídas derraman un 50 % más.'], poca: ['Poca agua', 'Sales con solo 70 de agua.'] };
const CAUSAS3 = { agua: 'Martín se ha quedado sin fuerzas.', caida: 'Martín se ha caído demasiadas veces.', tiempo: 'Se ha acabado el tiempo.' };
const CAUSAS = { agua: 'Se ha derramado toda el agua.', caida: 'Martín ha caído demasiadas veces.', tiempo: 'Se ha acabado el tiempo.', lava: '¡La lava ha alcanzado a Martín!', rio_lava: '¡Martín ha caído en la lava!' };
const TR = x => (window.Idioma && Idioma.tr ? Idioma.tr(x) : x);
const FRUTOS = { tuno: 'Tuno', higo: 'Higo', malvasia: 'Uva malvasía', biberon: 'Biberón' };
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
  cueva: 'Dentro del tubo de lava: atento a las piedras que caen del techo.',
  graciosa: 'Calles de arena, olas en la orilla y viento del norte: salta con calma.',
  entrega: '¡Ya casi! Llega al punto de entrega con agua en el cántaro.',
  duna: 'Dunas de arena: cuesta arriba se va despacio y cuesta abajo se coge carrerilla. Si te paras en la cuesta, la arena te baja.',
  barca: 'El agua no se salta: espera en el muelle a que llegue la barca, súbete y deja que te lleve.',
  balsa: 'La lava no se salta: espera en la orilla a que llegue la costra de roca, súbete y deja que te lleve.',
  guelfo: 'Martín es un guelfo: aún es pequeño. Mantén ◀ ▶ para caminar.',
  guelfo_salta: 'Toca ⬆ para saltar. Todavía salta poco: las piedras pequeñas, de una en una.',
  camellero: '¡Mira! El camellero te espera al final del camino.',
  silbido: 'Sigue al camellero. Si te quedas muy atrás, lo pierdes y vuelves al último punto de control.',
  escultura: 'Ya llegáis a la entrada del pueblo, donde está la escultura de los camellos.',
  muros: 'Los muros altos se saltan en dos tiempos: primero a la piedra pequeña y luego arriba.',
  corral: '¡Ya casi! El corral de la manada está ahí delante.',
  fila: 'La manada sale en fila. Ve detrás sin quedarte atrás.',
  fila_fin: 'Eres el último de la fila y el más pequeño, pero ya conoces el camino.',
  calor: 'El calor sube al sol. Párate un momento a la sombra de los muros y de las piedras.',
  sombra_fin: '¡Ya casi! Un último tramo al sol.',
  eclipse: 'El Sol empieza a apagarse por un borde. Busca al camellero.',
  camellero_eclipse: 'Ahí está el camellero, bajo la media luna de luz.',
  echadero: 'Por fin, el Echadero: aquí trabaja la manada.',
  echadero_fin: 'Los camellos de la manada descansan al final del camino.',
  arena: 'Arena negra y sin prisa: salta y juega todo lo que quieras.',
  arena_fin: '¡Qué cosquillas hace la arena!'
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
  function ruidoF(c, t, dur, vol, fq, tipo) {   // ruido filtrado (arena, agua)
    const len = Math.floor(c.sampleRate * dur), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 1.5);
    const src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); f.type = tipo || 'lowpass'; f.frequency.value = fq; g.gain.value = vol;
    src.buffer = buf; src.connect(f); f.connect(g); g.connect(out(c)); src.start(t);
  }
  function roce(c, t, dur, vol, fq) {   // ruido que entra y sale despacio (sin golpe al principio), filtrado en banda
    const len = Math.floor(c.sampleRate * dur), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(Math.sin(Math.PI * i / len), 2);
    const src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); f.type = 'bandpass'; f.frequency.value = fq; f.Q.value = 0.8; g.gain.value = vol;
    src.buffer = buf; src.connect(f); f.connect(g); g.connect(out(c)); src.start(t);
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
      else if (kind === 'silbido') [1568, 2093, 1568].forEach((f, i) => tone(c, t + i * 0.16, f, f * (i === 1 ? 1.02 : 0.97), 0.14, 0.035, 'sine'));
      else if (kind === 'sofoco') { ruido(c, t, 0.3, 0.05); tone(c, t, 300, 180, 0.4, 0.04, 'sine'); }
      else if (kind === 'arena') roce(c, t, 0.16, 0.022, 3200);   // pisada en la arena: un roce suave («shhh»), sin golpe
      else if (kind === 'barca') { tone(c, t, 170, 120, 0.12, 0.08); tone(c, t + 0.05, 140, 100, 0.1, 0.05); ruidoF(c, t + 0.04, 0.45, 0.06, 700); }   // golpe en la cubierta y el agua debajo
      else if (kind === 'logro') { [659, 784, 988, 1318, 1568].forEach((f, i) => tone(c, t + i * 0.08, f, f, 0.3, 0.045, 'sine')); [1976, 2637].forEach((f, i) => tone(c, t + 0.45 + i * 0.07, f, f, 0.25, 0.02, 'sine')); }
      else if (kind === 'lava') { tone(c, t, 70, 45, 1.1, 0.09, 'sawtooth'); ruido(c, t, 0.9, 0.07); [440, 440].forEach((f, i) => tone(c, t + 0.3 + i * 0.25, f, f, 0.12, 0.04, 'square')); }
    } catch (e) {}
  }
  return { play, ac, out };
})();

/* ================= Música de fondo (sintetizada, muy suave) =================
   Se programan las notas con medio segundo de adelanto desde un temporizador (no desde el bucle de dibujo):
   apenas gasta. Mundo 1: ambiente (viento, pájaros y alguna nota de guitarra); Mundo 2: olas, viento y gaviotas; cueva: zumbido y gotas. */
const Musica = (() => {
  let on = false, estilo = '', timer = 0, tNext = 0, paso = 0, ruidoBuf = null;
  const H = k => { const x = Math.sin(k * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const N = n => 440 * Math.pow(2, (n - 69) / 12);   // nota MIDI a Hz
  function nota(c, t, f, dur, vol, tipo, ataque) {
    const o = c.createOscillator(), g = c.createGain(); o.type = tipo || 'triangle'; o.frequency.value = f;
    vol *= 0.6;   // la música queda por debajo de los efectos
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + (ataque || 0.008)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(Sound.out(c)); o.start(t); o.stop(t + dur + 0.05);
  }
  function ola(c, t, dur, vol) {
    if (!ruidoBuf) { const len = c.sampleRate * 2, b = c.createBuffer(1, len, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1; ruidoBuf = b; }
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = ruidoBuf; s.loop = true; f.type = 'lowpass'; f.frequency.value = 520;
    vol *= 0.6;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + dur * 0.45); g.gain.linearRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(Sound.out(c)); s.start(t); s.stop(t + dur + 0.05);
  }
  function ruido(c) { if (!ruidoBuf) { const len = c.sampleRate * 2, b = c.createBuffer(1, len, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1; ruidoBuf = b; } return ruidoBuf; }
  function viento(c, t, dur, vol, fc) {
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = ruido(c); s.loop = true; f.type = 'bandpass'; f.Q.value = 0.9;
    f.frequency.setValueAtTime(fc, t); f.frequency.linearRampToValueAtTime(fc * 1.35, t + dur * 0.5); f.frequency.linearRampToValueAtTime(fc, t + dur);
    vol *= 0.6; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + dur * 0.4); g.gain.linearRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(Sound.out(c)); s.start(t, Math.random()); s.stop(t + dur + 0.05);
  }
  function gaviota(c, t, h) {   // dos o tres graznidos que bajan
    const n = 2 + Math.floor(h * 2), f0 = 1500 + h * 400;
    for (let k = 0; k < n; k++) { const o = c.createOscillator(), fl = c.createBiquadFilter(), g = c.createGain(), u = t + k * 0.32; o.type = 'sawtooth';
      o.frequency.setValueAtTime(f0, u); o.frequency.exponentialRampToValueAtTime(f0 * 0.62, u + 0.24);
      fl.type = 'bandpass'; fl.frequency.value = f0 * 1.2; fl.Q.value = 3;
      g.gain.setValueAtTime(0.0001, u); g.gain.linearRampToValueAtTime(0.01 * 0.6, u + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, u + 0.26);
      o.connect(fl); fl.connect(g); g.connect(Sound.out(c)); o.start(u); o.stop(u + 0.3); }
  }
  function pajaro(c, t, h) {   // dos a cuatro silbidos cortos que suben
    const n = 2 + Math.floor(h * 3), f0 = 2400 + h * 1400;
    for (let k = 0; k < n; k++) { const o = c.createOscillator(), g = c.createGain(), u = t + k * 0.13; o.type = 'sine';
      o.frequency.setValueAtTime(f0, u); o.frequency.exponentialRampToValueAtTime(f0 * 1.35, u + 0.07);
      g.gain.setValueAtTime(0.0001, u); g.gain.linearRampToValueAtTime(0.012 * 0.6, u + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, u + 0.09);
      o.connect(g); g.connect(Sound.out(c)); o.start(u); o.stop(u + 0.12); }
  }
  // cuerda pulsada (timple, guitarra, bandurria): diente de sierra con un filtro que se va cerrando
  function pulsa(c, t, f, dur, vol, brillo) {
    const o = c.createOscillator(), fl = c.createBiquadFilter(), g = c.createGain(); o.type = 'sawtooth'; o.frequency.value = f;
    fl.type = 'lowpass'; fl.Q.value = 0.8; fl.frequency.setValueAtTime(Math.min(9000, f * (brillo || 6)), t); fl.frequency.exponentialRampToValueAtTime(Math.max(120, f * 1.3), t + dur * 0.7);
    vol *= 0.6; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(fl); fl.connect(g); g.connect(Sound.out(c)); o.start(t); o.stop(t + dur + 0.05);
  }
  const AC = { D: [62, 66, 69], G: [55, 59, 62], A7: [57, 61, 64, 67], Am: [57, 60, 64], E7: [52, 56, 59, 62], C: [48, 52, 55], G7: [55, 59, 62, 65] };
  const EST = {
    // sur: solo ambiente — viento del malpaís, algún pájaro y de vez en cuando unas notas sueltas de guitarra
    sur: { pulso: 0.5, toca(c, t, p) {
      if (p % 12 === 0) viento(c, t, 7.5, 0.03 + H(p) * 0.015, 380 + H(p + 1) * 420);
      if (H(p * 1.7) > 0.86) pajaro(c, t, H(p + 3));
      if (p % 16 === 8 && H(p * 2.3) > 0.35) { const ac = [AC.D, AC.G, AC.A7, AC.D][Math.floor(p / 16) % 4]; ac.slice(0, 3).forEach((m, i) => pulsa(c, t + i * 0.42, N(m), 2.2, 0.022, 2.5)); } } },
    // costa: solo ambiente — las olas rompiendo, alguna gaviota y el viento del mar
    costa: { pulso: 0.5, toca(c, t, p) {
      if (p % 9 === 0) ola(c, t, 5.5 + H(p) * 1.5, 0.03 + H(p + 2) * 0.012);
      if (p % 14 === 5) viento(c, t, 7, 0.018, 500 + H(p + 1) * 300);
      if (H(p * 1.9) > 0.93) gaviota(c, t, H(p + 4)); } },
    // pueblo y manada (Mundo 3): viento suave, algún pájaro, pasos lejanos de la manada y, de vez en cuando, el silbido del camellero
    pueblo: { pulso: 0.5, toca(c, t, p) {
      if (p % 12 === 0) viento(c, t, 7, 0.022 + H(p) * 0.01, 420 + H(p + 1) * 300);
      if (H(p * 1.7) > 0.88) pajaro(c, t, H(p + 3));
      if (p % 4 === 2 && H(p * 0.37) > 0.45) nota(c, t, 90 + H(p) * 20, 0.08, 0.016, 'sine', 0.004);
      if (p % 40 === 20 && H(p * 2.9) > 0.3) [1568, 2093, 1568].forEach((f, i) => nota(c, t + i * 0.17, f, 0.15, 0.012, 'sine', 0.01)); } },
    // cueva: zumbido grave y gotas con eco
    cueva: { pulso: 0.8, toca(c, t, p) { if (p % 8 === 0) nota(c, t, N(38), 7, 0.035, 'sine', 1.2);
      if (H(p) > 0.62) { const f = 1100 + H(p + 7) * 900; nota(c, t, f, 0.18, 0.02, 'sine', 0.003); nota(c, t + 0.28, f * 0.98, 0.18, 0.008, 'sine', 0.003); } } }
  };
  function programa() {
    const c = Sound.ac(); if (!on || !c) return;
    const E = EST[estilo]; if (c.currentTime > tNext + 1) tNext = c.currentTime + 0.1;   // tras una pausa larga, empieza de nuevo
    try { while (tNext < c.currentTime + 0.6) { E.toca(c, tNext, paso); tNext += E.pulso; paso++; } } catch (e) {}
    timer = setTimeout(programa, 250);
  }
  // se llama en cada imagen: arranca o para la música según el estado (no hace nada si no cambia)
  function tick(suena, est) {
    const quiere = suena && S.musica !== false && S.sound !== false && !!EST[est];
    if (quiere && (!on || est !== estilo)) { clearTimeout(timer); on = true; if (est !== estilo) { estilo = est; paso = 0; } const c = Sound.ac(); tNext = c ? c.currentTime + 0.15 : 0; programa(); }
    else if (!quiere && on) { on = false; clearTimeout(timer); }
  }
  // para escuchar una muestra sin jugar (y para las pruebas): programa unos segundos en el contexto que se le pase
  function muestra(c, est, seg) { const E = EST[est]; let t = 0.1, p = 0; while (t < seg) { E.toca(c, t, p); t += E.pulso; p++; } }
  return { tick, muestra, estado: () => (on ? estilo : '') };
})();
const estiloMusica = i => secretoDe(i) === 0 ? 'cueva' : INFO[i] && INFO[i].tipo === 'premio' ? 'costa' : INFO[i] && INFO[i].mundo === 2 ? 'pueblo' : (INFO[i] && INFO[i].mundo === 1 ? 'costa' : 'sur');

/* ================= Frutos y fantasma ================= */
const frutosDe = L => (L.objetos || []).filter(o => o.kind !== 'aljibe' && o.kind !== 'toma');
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
// niveles secretos (secretos.js): van detrás de los normales y se abren con todos los frutos de su mundo
// Mundo 3 (mundo3.js): 6 niveles, un secreto y un nivel de premio, detrás de los secretos de los Mundos 1 y 2
// niveles nuevos (extras.js, 3.1): van al final y cada uno dice su mundo; no entran en el reto diario ni cuentan para abrir el secreto de su mundo
const SECS = window.MARTIN_SECRETOS || [], M3 = window.MARTIN_MUNDO3 || [], EXT = window.MARTIN_EXTRAS || [];
const NBASE = NIV.length - SECS.length - M3.length - EXT.length, NANT = NBASE + SECS.length + M3.length;
const INFO = NIV.map((_, i) => {
  if (i < NBASE) return { mundo: i >= 6 ? 1 : 0, tipo: 'nivel', num: String(i + 1) };
  if (i < NBASE + SECS.length) return { mundo: SECS[i - NBASE].mundo, tipo: 'secreto', num: '' };
  if (i >= NANT) { const e = i - NANT, x = EXT[e], prev = EXT.slice(0, e).map((y, j) => y.mundo === x.mundo ? NANT + j : -1).filter(j => j >= 0).pop();
    const ultBase = x.mundo === 0 ? 5 : NBASE - 1;   // los nuevos se numeran a continuación de los once de siempre (12, 13, 14…)
    return { mundo: x.mundo, tipo: 'nivel', num: String(NBASE + 1 + e), extra: true, ant: prev != null ? prev : ultBase }; }
  const k = i - NBASE - SECS.length, x = M3[k];
  return { mundo: 2, tipo: x.tipo, num: x.tipo === 'nivel' ? '3-' + M3.slice(0, k + 1).filter(y => y.tipo === 'nivel').length : '' };
});
// paisaje de los niveles nuevos: el del nivel de su misma zona (Famara, La Graciosa…)
const TEMA_PROPIO = { jable: 21, timanfaya: 2 };   // niveles nuevos con paisaje propio (índice de TEMAS en dibujo.js)
const temaDe = i => { if (!INFO[i] || !INFO[i].extra || !NIV[i].ok) return i; const t = NIV[i].nivel.theme; if (TEMA_PROPIO[t] != null) return TEMA_PROPIO[t]; const j = NIV.findIndex((n, k) => k < NANT && n.ok && n.nivel.theme === t); return j >= 0 ? j : i; };
INFO.forEach((x, i) => { if (x.extra && NIV[i].ok) NIV[i].nivel.temaIdx = temaDe(i); });
const esM3 = i => !!(INFO[i] && INFO[i].mundo === 2);
const secretoDe = i => INFO[i] && INFO[i].tipo === 'secreto' ? INFO[i].mundo : -1;
const premioDe = i => !!(INFO[i] && INFO[i].tipo === 'premio');
const nomNivel = i => secretoDe(i) >= 0 ? 'Nivel secreto' : premioDe(i) ? 'Nivel de premio' : `Nivel ${INFO[i] ? INFO[i].num : i + 1}`;
const nivelesMundo = m => INFO.map((x, i) => (x.mundo === m && x.tipo === 'nivel' ? i : -1)).filter(i => i >= 0);
function frutosMundo(m) { let h = 0, t = 0; for (const i of nivelesMundo(m)) { if (INFO[i].extra) continue; if (!NIV[i].ok) continue; t += frutosDe(NIV[i].nivel).length; h += frutosHechos(i); } return { h, t }; }
const mundoCompleto = m => { const f = frutosMundo(m); return f.t > 0 && f.h >= f.t; };
const estrellasMundo = m => nivelesMundo(m).every(i => progR(i).stars >= 3);
const anteriorNivel = i => { if (INFO[i] && INFO[i].ant != null) return INFO[i].ant; for (let j = i - 1; j >= 0; j--) if (INFO[j].tipo === 'nivel') return j; return -1; };
const desbloqueado = i => { const m = secretoDe(i); if (m >= 0) return mundoCompleto(m); if (premioDe(i)) return estrellasMundo(INFO[i].mundo); const j = anteriorNivel(i); return j < 0 || (!!S.prog[lid(j)] && !!S.prog[lid(j)].done); };
const ORDEN = []; [0, 1, 2].forEach(m => ['nivel', 'secreto', 'premio'].forEach(tp => INFO.forEach((x, i) => { if (x.mundo === m && x.tipo === tp) ORDEN.push(i); })));
const MUNDOS = [{ desde: 0, nombre: 'Mundo 1 · Uga y el sur', lema: 'Aprender el camino y llevar el agua' }, { desde: 6, nombre: 'Mundo 2 · La costa y el norte', lema: 'El Golfo, Janubio, Famara, Haría y el Mirador del Río' }, { desde: NBASE + SECS.length, nombre: 'Mundo 3 · El guelfo de Uga', lema: 'Cómo Martín aprendió a ser camello' }];
const totalEstrellas = () => NIV.reduce((a, n, i) => a + (n.ok ? progR(i).stars : 0), 0);
const fmtT = ms => { const t = Math.max(0, Math.round(ms / 100)); const m = Math.floor(t / 600), s = Math.floor((t % 600) / 10); return m + ':' + String(s).padStart(2, '0') + '.' + (t % 10); };
const estrellasTxt = (n, tot) => '★'.repeat(n) + '☆'.repeat((tot || 3) - n);

/* ================= Dibujo (www/dibujo.js) ================= */
const { COL, hash, especiesDe, dibujaEspecie, dibujaLavaVista, fruto, preparaEscena, dibujaMartin, dibujaEscena, dibujaSombra, dibujaFx, dibujaPost, dibujaPrimerPlano, dibujaHero, dibujaMini } = window.Dibujo;

/* ================= Partida en marcha ================= */
const RUN = { on: false, raf: 0, last: 0, acc: 0, cv: null, ctx: null, L: null, esc: null, s: null, idx: 0, modo: 'nivel', opts: {}, inp: { pila: [], salto: false }, rec: null, cam: { x: 0, y: 0 },
  fx: [], overlay: '', replay: null, rep: { i: 0, c: 0 }, t: 0, fase: 0, golpe: 0, vistas: {}, tFin: 0, reapT: 0, nuevo: null, enviado: null, u: 16, hint: '' };
const STEP_MS = 1000 / 60;
const turbo = () => (typeof window.MARTIN_TURBO === 'number' ? window.MARTIN_TURBO : 1);
const jugando = () => !!RUN.s;
const debugCaja = /hitbox/.test(location.search);
function modalAbierto() { const m = document.getElementById('modal'); return !!(m && !m.classList.contains('hidden')); }
function stopLoop(conTeclas) { Musica.tick(false, ''); RUN.on = false; cancelAnimationFrame(RUN.raf); RUN.raf = 0; if (!conTeclas) window.onkeydown = window.onkeyup = window.onblur = null; RUN.inp.pila = []; RUN.inp.salto = false; }

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
  if (s.suelo && Math.abs(s.vx) > 1.5 && (RUN.paso = (RUN.paso || 0) + 1) % 11 === 0) { RUN.fx.push({ k: 'polvo', x: s.x - s.cara * 0.5, y: s.y, v: 0, n: 16, fuerte: false }); if (RUN.paso % 22 === 0 && pisa(s) && pisa(s).arena) Sound.play('arena'); }
  // al subir a una barca (andando o de un salto) suena la cubierta
  if (s.sobre !== RUN.sobre) { const q = s.suelo ? pisa(s) : null; if (q && q.mdx && RUN.sobre !== undefined) Sound.play('barca'); RUN.sobre = s.sobre; }
  RUN.t += M.DT;
  RUN.fx = RUN.fx.filter(f => (f.v += 1) < f.n);
  if ((s.fase === 'meta' || s.fase === 'fallo') && !RUN.tFin) RUN.tFin = performance.now();
}
// qué está pisando Martín (para el sonido: arena, barca…)
function pisa(s) { const L = RUN.L; if (!L || !s.sobre) return null; if (RUN.solL !== L) { RUN.solL = L; RUN.solPor = new Map(L.solids.map(q => [q.id, q])); } return RUN.solPor.get(s.sobre) || null; }
function evento(e) {
  const s = RUN.s;
  if (e.t === 'salto') Sound.play('salto');
  else if (e.t === 'aterriza') { Sound.play('aterriza'); RUN.fx.push({ k: 'polvo', x: s.x, y: s.y, v: 0, n: 18 }); if (e.v > 8) { RUN.shake = Math.max(RUN.shake || 0, 0.35); RUN.fx.push({ k: 'polvo', x: s.x + 0.6, y: s.y, v: 0, n: 22 }); } }
  else if (e.t === 'cruje') Sound.play('cruje');
  else if (e.t === 'derrumbe') { Sound.play('derrumbe'); RUN.shake = Math.max(RUN.shake || 0, 0.5); const c = RUN.L.solids.find(q => q.id === e.id); if (c) for (let i = 0; i < 8; i++) RUN.fx.push({ k: 'gota', piedra: true, x: c.x0 + (c.x1 - c.x0) * (i + 0.5) / 8, y: c.top, v: 0, n: 50, vx: (hash(i) - 0.5) * 2, vy: 1 + hash(i + 3) * 2 }); }
  else if (e.t === 'dano') {
    Sound.play(e.tipo === 'vapor' ? 'vapor' : e.tipo === 'ola' ? 'ola' : e.tipo === 'piedra' ? 'piedra' : 'golpe'); vibrate(40); RUN.golpe = 1; RUN.shake = Math.max(RUN.shake || 0, e.cantidad >= 20 ? 1 : 0.6); RUN.fx.push({ k: 'texto', x: s.x, y: s.y + 2.2, v: 0, n: 60, txt: '−' + e.cantidad }); if (RUN.L.cuerpo) { RUN.fx.push({ k: 'polvo', x: s.x - 0.3, y: s.y, v: 0, n: 22, fuerte: true }, { k: 'polvo', x: s.x + 0.4, y: s.y, v: 0, n: 22, fuerte: true }); for (let i = 0; i < 4; i++) RUN.fx.push({ k: 'gota', estrella: true, x: s.x, y: s.y + 1.4, v: 0, n: 45, vx: (i - 1.5) * 0.8, vy: 2.5 + (i % 2) }); } else for (let i = 0; i < 6; i++) RUN.fx.push({ k: 'gota', x: s.x, y: s.y + 1.7, v: 0, n: 40, vx: (i - 2.5) * 0.9, vy: 3 + (i % 3) })   // el guelfo no lleva agua: polvo y estrellitas;
    if (e.resto > 0 && e.resto < 30 && !RUN.avisado) { RUN.avisado = true; Sound.play('aviso'); }
  } else if (e.t === 'caida') { Sound.play('caida'); vibrate(60); RUN.fx.push({ k: 'texto', x: s.x, y: RUN.L.world.kill_y + 3, v: 0, n: 70, txt: '−' + e.cantidad }); }
  else if (e.t === 'control') { Sound.play('control'); const c = RUN.L.cps.find(q => q.id === e.id); if (c) c.alcanzado = true; RUN.fx.push({ k: 'texto', x: s.x, y: s.y + 2.4, v: 0, n: 70, txt: TR('⚑ Punto de control') }); }
  else if (e.t === 'meta') { Sound.play('exito'); for (let i = 0; i < 46; i++) RUN.fx.push({ k: 'confeti', x: s.x, y: s.y + 1.5, v: 0, n: 100, vx: (hash(i * 3) - 0.5) * 9, vy: 4 + hash(i * 5) * 7, rot: 4 + hash(i * 7) * 10, c: ['#f6d65a', '#d8454a', '#2f93d4', '#f4efe6', '#7ac36a'][i % 5] }); }
  else if (e.t === 'fallo') Sound.play('fallo');
  else if (e.t === 'ruta') RUN.rutaVista = e.id;
  else if (e.t === 'recoge') {
    if (e.kind === 'aljibe' || e.kind === 'toma') { Sound.play('aljibe'); RUN.avisado = s.agua < 30 && RUN.avisado; RUN.fx.push({ k: 'texto', x: s.x, y: s.y + 2.4, v: 0, n: 70, txt: e.mas > 0 ? (e.kind === 'toma' ? '🍼 💛 +' : RUN.L.cuerpo ? '💛 +' : '💧 +') + e.mas : TR(RUN.L.cuerpo ? '💛 a tope' : '💧 lleno') }); }
    else { Sound.play('fruto'); vibrate(15); RUN.fx.push({ k: 'texto', x: s.x, y: s.y + 2.6, v: 0, n: 80, txt: '✨ ' + TR(FRUTOS[e.kind]) + (e.kind === 'biberon' && e.mas > 0 ? ' 💛 +' + e.mas : '') }); for (let i = 0; i < 14; i++) RUN.fx.push({ k: 'confeti', x: s.x, y: s.y + 2.2, v: 0, n: 50, vx: (hash(i * 3 + 1) - 0.5) * 6, vy: 2 + hash(i * 5 + 2) * 4, rot: 6, c: ['#f6d65a', '#fff3b0', '#ffb347'][i % 3] }); }
  } else if (e.t === 'perdido') { Sound.play('silbido'); vibrate(40); RUN.fx.push({ k: 'texto', x: s.x, y: s.y + 2.4, v: 0, n: 90, txt: TR(RUN.L.guia && RUN.L.guia.manada ? '🎵 Has perdido la fila' : '🎵 Has perdido al camellero') }); }
  else if (e.t === 'sofoco') { Sound.play('sofoco'); vibrate(40); RUN.fx.push({ k: 'texto', x: s.x, y: s.y + 2.4, v: 0, n: 90, txt: TR('🥵 ¡Qué calor! A la sombra') }); }
  else if (e.t === 'lava') { Sound.play('lava'); vibrate(80); RUN.shake = Math.max(RUN.shake || 0, 1.2); RUN.lavaAviso = performance.now(); }
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
      if (s.fase === 'jugando') { const d = Math.min(dt, 60); RUN.ema = RUN.ema == null ? d : RUN.ema * 0.95 + d * 0.05; RUN.nf = (RUN.nf || 0) + 1; }   // solo se mide jugando, y un tirón suelto no cuenta como lentitud
      if (RUN.nf > 150 && RUN.ema > 22) { if (!window.SIN_OLAS) window.SIN_OLAS = true; else if (RUN.dprMax > 1.25) RUN.dprMax -= 0.25; RUN.nf = 0; RUN.ema = 16; }   // si va lento: primero fuera el oleaje, luego menos resolución
      if ((s.fase === 'meta' || s.fase === 'fallo') && RUN.tFin && !RUN.overlay && performance.now() - RUN.tFin > (s.fase === 'meta' ? 900 : 700) / Math.max(1, turbo() > 1 ? 4 : 1)) terminar();
    }
    Musica.tick(!!(RUN.s && RUN.modo !== undefined && (RUN.s.fase === 'jugando' || RUN.s.fase === 'reaparece') && !document.hidden), RUN.s ? estiloMusica(RUN.idx) : '');
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
      dibujaMartin(ctx, u * (L.cuerpo ? L.cuerpo.escala : 1), fx, fy, { dir: fs.cara, fase: F.fase, anim: fa, agua: fs.agua, golpe: 0, t: RUN.t, alpha: 0.42, guelfo: !!L.cuerpo }); }
  }
  if (L.cuerpo) window.Dibujo.dibujaMundo3(ctx, W, H, u, RUN.cam, L, s, RUN.t);
  // personaje
  if (s.fase !== 'reaparece' || s.rt < 24) {
    dibujaSombra(ctx, L, s, u, RUN.cam, H);
    let anim = 'idle';
    if (s.fase === 'meta') anim = 'gana'; else if (!s.suelo) anim = s.vy > 0 ? 'salta' : 'cae'; else if (Math.abs(s.vx) > 0.3) anim = 'corre';
    const parpadeo = s.fase === 'reaparece' ? 0.4 + 0.6 * ((24 - s.rt) / 24) : (s.frio > 0 && s.fase === 'jugando' && Math.floor(s.frio / 3) % 2 === 0 ? 0.55 : 1);
    dibujaMartin(ctx, u * (L.cuerpo ? L.cuerpo.escala : 1), px, py, { dir: s.cara, fase: RUN.fase / (L.cuerpo ? L.cuerpo.escala : 1), anim, agua: s.agua, golpe: RUN.golpe, t: RUN.t, alpha: parpadeo, guelfo: !!L.cuerpo });
  }
  if (debugCaja) { ctx.strokeStyle = '#ff0'; ctx.lineWidth = 2; ctx.strokeRect(px - (L.hw || M.HW) * u, py - (L.h || M.H) * u, (L.hw || M.HW) * 2 * u, (L.h || M.H) * u); ctx.fillStyle = '#f00'; ctx.fillRect(px - 2, py - 2, 4, 4); }
  dibujaLavaVista(ctx, W, H, u, RUN.cam, L, s, RUN.t);
  dibujaPrimerPlano(ctx, W, H, u, RUN.cam, RUN.t);
  dibujaFx(ctx, W, H, u, RUN.cam, RUN.fx, RUN.t);
  if (L.eclipse) window.Dibujo.dibujaEclipse(ctx, W, H, Math.min(1, Math.max(0, (s.x - L.spawn.x) / (L.goals.finish_x - L.spawn.x))), W * 0.8, H * 0.16, Math.min(W, H) * 0.06);
  if (L.calor && s.calor > 20) { ctx.fillStyle = 'rgba(255,150,40,' + ((s.calor - 20) / 80 * 0.16).toFixed(3) + ')'; ctx.fillRect(0, 0, W, H); }
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
    if (!S.peque && h.hasta_x != null && s.x > h.hasta_x) continue;          // en modo peque las pistas se quedan todo el tramo
    if (!S.peque && h.hasta_saltos != null && s.saltos >= h.hasta_saltos) continue;
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
  const ca = document.getElementById('mgCalor'); if (ca) { ca.style.width = Math.round(s.calor || 0) + '%'; ca.parentNode.classList.toggle('bajo', (s.calor || 0) > 70); }
  const gu = document.getElementById('mgGuia'); if (gu) { const d = s.guia - s.x, on = s.fase === 'jugando' && d > RUN.L.guia.pierde * 0.6; gu.classList.toggle('on', on); if (on) set('mgGuiaD', Math.round(d) + ' m'); if (on && !RUN.silbo) { RUN.silbo = true; Sound.play('silbido'); } else if (!on) RUN.silbo = false; }
  const lv = document.getElementById('mgLava'); if (lv) { const on = s.lava != null && s.x < RUN.L.lava.hasta && s.fase === 'jugando'; lv.classList.toggle('on', on); if (on) set('mgLavaD', Math.max(0, Math.round(s.x - s.lava)) + ' m'); }
  // pista del tramo: pequeña, debajo del marcador, y se va sola a los pocos segundos (o al tocarla); en modo peque se queda más
  const h = pistaActual(), el = document.getElementById('mgHint');
  if (h !== RUN.hint) { RUN.hint = h; RUN.hintT = s.t; if (el) { el.textContent = h; el.classList.toggle('on', !!h); el.onclick = () => el.classList.remove('on'); } }
  else if (h && el && el.classList.contains('on') && s.t - RUN.hintT > (S.peque ? 60 * 12 : 60 * 6)) el.classList.remove('on');
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
  RUN.sobre = undefined; RUN.logroSono = false;   // sonidos: no suena la barca al empezar ni se repite el del logro
  RUN.L = n; RUN.esc = RUN.esc && RUN.esc.id === n.level_id ? RUN.esc : Object.assign(preparaEscena(n, RUN.idx), { id: n.level_id });
  for (const c of n.cps) c.alcanzado = false;
  RUN.s = M.nuevo(n, Object.assign({ eventos: true }, RUN.opts, RUN.modo === 'nivel' && S.peque ? { mod: 'peque' } : {}));   // modo peque: solo en los niveles (el reto diario es igual para todos)
  RUN.rec = M.grabadora(); RUN.fx = []; RUN.golpe = 0; RUN.t = 0; RUN.fase = 0; RUN.tFin = 0; RUN.overlay = 'listo'; RUN.hint = ''; RUN.avisado = false; RUN.rutaVista = '';
  RUN.nuevo = null; RUN.enviado = null; RUN.intento = (RUN.intento || 0) + 1; RUN.acc = 0;
  RUN.rep = { i: 0, c: 0 }; RUN.replay = Array.isArray(window.MARTIN_REPLAY) ? window.MARTIN_REPLAY : null;
  RUN.fruVista = null; RUN.fan = null;
  const fa = RUN.modo === 'nivel' && S.fantasma !== false && S.fant && S.fant[n.level_id];
  if (fa && fa.firma === firmaNivel(n) && Array.isArray(fa.runs)) RUN.fan = { s: M.nuevo(n, fa.mod ? { mod: fa.mod } : {}), runs: fa.runs, rep: { i: 0, c: 0 }, ms: fa.ms };
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
  M.empezar(RUN.s); if (RUN.fan) M.empezar(RUN.fan.s); RUN.overlay = ''; RUN.nf = 0; RUN.ema = null; soltarTodo(); ponOverlay(); keepAwake();
  if (RUN.modo === 'nivel') prog(RUN.idx).plays++;
}
function pausar() { Musica.tick(false, '');
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
const siguienteDe = i => { const k = ORDEN.indexOf(i); for (let j = k + 1; j < ORDEN.length; j++) { const n = ORDEN[j]; if (INFO[n].tipo === 'nivel' || desbloqueado(n)) return desbloqueado(n) ? n : -1; } return -1; };
function siguiente() { const i = siguienteDe(RUN.idx); if (i >= 0 && esM3(i)) { stopLoop(); RUN.s = null; render(); openBriefing(i); } else if (i >= 0) jugar(i, 'nivel'); else salirAlMapa(); }

function terminar() {
  const s = RUN.s, L = RUN.L; if (!s) return;
  const res = M.resultado(s);
  if (s.fase === 'meta') {
    const nu = { tiempo: false, agua: false, estrellas: false };
    if (RUN.modo === 'nivel') {
      const espAntes = especiesVistas(RUN.idx), p = prog(RUN.idx), premioAntes = ORDEN.filter(i => premioDe(i) && desbloqueado(i)).length;
      if (!p.done) nu.primera = true;
      p.done = true;
      if (res.estrellas > p.stars) { p.stars = res.estrellas; nu.estrellas = true; }
      if (!p.bestMs || res.ms < p.bestMs) { if (p.bestMs) nu.tiempo = true; p.bestMs = res.ms; }
      if (res.agua > p.bestAgua) { if (p.bestAgua) nu.agua = true; p.bestAgua = res.agua; }
      const antes = new Set(p.obj || []), nuevos = res.objetos.filter(id => !antes.has(id));
      if (nuevos.length) { const sa = selloAbierto(RUN.idx), abiertos = [0, 1, 2].map(mundoCompleto); p.obj = [...antes, ...nuevos]; nu.frutos = nuevos.map(id => (L.objetos.find(o => o.id === id) || {}).kind).filter(Boolean); if (!sa && selloAbierto(RUN.idx)) nu.sello = true; const m = [0, 1, 2].find(k => !abiertos[k] && mundoCompleto(k)); if (m != null) nu.secreto = m; }
      const f0 = S.fant && S.fant[L.level_id], firma = firmaNivel(L);
      if (!f0 || f0.firma !== firma || res.ms < f0.ms) { S.fant = S.fant || {}; S.fant[L.level_id] = { ms: res.ms, firma, runs: RUN.rec.runs(), mod: s.mod !== 'normal' ? s.mod : undefined }; if (f0 && f0.firma === firma) nu.fantasma = true; }
      { const nuevas = descubreEn(RUN.idx).filter(e => !espAntes.has(e)); if (nuevas.length) { nu.especies = nuevas.map(e => (NAT.find(x => x.id === e) || {}).nombre).filter(Boolean); nu.espIds = nuevas; } }
      if (ORDEN.filter(i => premioDe(i) && desbloqueado(i)).length > premioAntes) nu.premio = true;
      if (nu.primera && esM3(RUN.idx) && INFO[RUN.idx].tipo === 'nivel') { const k = +INFO[RUN.idx].num.split('-')[1]; nu.escena = k === 6 ? 8 : k < 6 ? k + 1 : 0; }
      if (nu.primera && secretoDe(RUN.idx) === 2) nu.escena = 9;
      S.archive.unshift({ id: uid(), created: Date.now(), finished: Date.now(), mode: 'nivel', nivel: L.level_id, ms: res.ms, agua: res.agua, estrellas: res.estrellas, caidas: res.caidas, ruta: s.ruta || '' });
      S.archive = S.archive.slice(0, MAX_ARCHIVE);
    } else if (RUN.modo === 'diario' || RUN.modo === 'practica') {
      const d = RUN.dia || '';
      const dd = S.diario && S.diario.dia === d ? S.diario : (S.diario = { dia: d });
      if (RUN.modo === 'diario' && (!dd.ms || res.ms < dd.ms)) { dd.ms = res.ms; dd.agua = res.agua; nu.tiempo = true; }
      S.archive.unshift({ id: uid(), created: Date.now(), finished: Date.now(), mode: RUN.modo, nivel: L.level_id, ms: res.ms, agua: res.agua, estrellas: res.estrellas, caidas: res.caidas, ruta: s.ruta || '', mod: RUN.opts.mod || 'normal', dia: d });
      S.archive = S.archive.slice(0, MAX_ARCHIVE);
    }
    { const lg = revisaLogros(); if (lg.length) nu.logros = lg; }
    RUN.nuevo = nu; save();
    if (RUN.modo === 'diario') enviarReto(RUN.rec.runs(), res);
  } else if (RUN.modo === 'nivel') { prog(RUN.idx).fails++; save(); }
  RUN.overlay = s.fase === 'meta' ? 'fin' : 'fallo'; ponOverlay(); autoBackup(false);
  const ne = RUN.nuevo && RUN.nuevo.escena; if (s.fase === 'meta' && ne && ne !== 7 && !historiaVista(ne)) setTimeout(() => { if (RUN.overlay === 'fin' && !modalAbierto()) openHistoria(ne, false); }, 1300);
}

/* ================= Pantallas ================= */
function uiNombre(L) { return L.name; }
function renderSetup() {
  const flexible = NIV.every(n => n.ok);
  if (!flexible && !NIV.some(n => n.ok)) { $('#app').innerHTML = `<div class="sec"><h2>Error</h2><div class="empty">No se han podido cargar los niveles.</div><div class="acts"><button class="btn-gold" id="reintCarga">Reintentar</button></div></div>`; $('#reintCarga').onclick = () => location.reload(); return; }
  $('#subtitle').textContent = ' · Lanzarote';
  revisaLogros(); save();   // se apuntan sin avisar (la primera vez, los que ya se tenían); al terminar un nivel sí se avisa
  const est = totalEstrellas(), tot = NIV.length * 3;
  const sig = NIV.findIndex((n, i) => n.ok && desbloqueado(i) && !progR(i).done);
  let h = `<div class="mp">
    <div class="mp-hero"><img class="mp-img" src="portada.webp" alt="" decoding="async"><div class="mp-top"><div class="mp-h"><b>Los Caminos del Volcán</b><span>Lleva el agua por toda la isla</span></div><div class="mp-est" title="Estrellas">★ ${est}/${tot}</div></div></div>
    ${sig >= 0 ? `<button class="btn-gold mp-cont" id="mpCont">▶ ${S.archive.some(a => a.mode === 'nivel') ? 'Continuar' : 'Empezar'} · ${nomNivel(sig)}: ${esc(NIV[sig].nivel.name)}</button>` : ''}
    ${cuadernoBoton()}
    ${logrosBoton()}
    <button class="mp-peq ${S.peque ? 'on' : ''}" id="mpPeq" aria-pressed="${S.peque ? 'true' : 'false'}"><span>🧒 Modo peque</span><b>${S.peque ? 'Sí' : 'No'}</b></button>
    <div id="mpDiario">${diarioHtml()}</div>
    ${mapaIsla(sig)}
    <div class="mp-lv">`;
  ORDEN.forEach(i => {
    const n = NIV[i], mu = MUNDOS.find(w => w.desde === i), sm = secretoDe(i), pr = premioDe(i), m3 = esM3(i);
    if (mu) { const m = MUNDOS.indexOf(mu), f = frutosMundo(m);
      h += `<div class="mp-mu"><b>${esc(mu.nombre)}</b><span>${esc(mu.lema)}</span>${NIV.some((_, k) => secretoDe(k) === m) && f.t ? `<small class="mp-sec ${f.h >= f.t ? 'ok' : ''}"><i>${m === 2 ? '🍼' : '🧺'} ${f.h}/${f.t}</i> <i>${f.h >= f.t ? '✨ ¡Nivel secreto abierto!' : m === 2 ? '✨ Todos los biberones abren un nivel secreto' : '✨ Todos los frutos abren un nivel secreto'}</i></small>` : ''}${m === 2 && historiaVistas().length ? '<button class="mp-his" id="mpHis">📜 La historia de Martín</button>' : ''}</div>`; }
    if (!n.ok) { h += `<div class="lv bad"><div class="lv-n">!</div><div class="lv-b"><b>${nomNivel(i)}</b><span>No se ha podido cargar (${esc(n.error)}).</span></div></div>`; return; }
    const p = progR(i), ab = desbloqueado(i);
    h += `<button class="lv ${ab ? '' : 'cerrado'} ${p.done ? 'hecho' : ''} ${sm >= 0 ? 'secreto' : ''}" data-lv="${i}" ${ab ? '' : 'disabled'}>
      <div class="lv-n">${LUG[i] ? `<div class="lv-c" style="background:url('${LUG[i].img}') ${LUG[i].pos}/cover"></div>` : `<canvas class="lv-c" data-tema="${temaDe(i)}" width="112" height="112" aria-hidden="true"></canvas>`}<span class="${m3 && sm < 0 && !pr ? 'lv-m3' : ''}">${sm >= 0 ? (ab ? '✨' : '?') : pr ? (ab ? '🎁' : '?') : ab ? INFO[i].num : '🔒'}</span></div>
      <div class="lv-b"><b>${sm >= 0 && !ab ? 'Nivel secreto' : pr && !ab ? 'Nivel de premio' : esc(n.nivel.name)}</b><span>${ab ? esc(n.nivel.brief) : sm === 2 ? 'Encuentra todos los biberones del Mundo 3 para abrirlo.' : sm >= 0 ? `Encuentra todos los frutos del Mundo ${sm + 1} para abrirlo.` : pr ? 'Consigue todas las estrellas del Mundo 3 para abrirlo.' : m3 && anteriorNivel(i) === NBASE - 1 ? 'Termina el Mundo 2 para abrirlo.' : 'Termina el nivel anterior para abrirlo.'}</span>
        ${p.done ? `<small>⏱ ${fmtT(p.bestMs)} · ${m3 ? '💛' : '💧'} ${p.bestAgua}/100${frutosDe(n.nivel).length ? ` · ${m3 ? '🍼' : '🧺'} ${frutosHechos(i)}/${frutosDe(n.nivel).length}` : ''}</small>` : ''}</div>
      <div class="lv-s" aria-label="${p.stars} de 3 estrellas">${ab ? estrellasTxt(p.stars) : ''}</div></button>`;
  });
  h += `</div>
  </div>`;
  $('#app').innerHTML = h;
  document.querySelectorAll('[data-lv]').forEach(b => b.onclick = () => openBriefing(+b.dataset.lv));
  document.querySelectorAll('canvas.lv-c').forEach(c => dibujaMini(c.getContext('2d'), c.width, c.height, +c.dataset.tema));
  animaHero();
  const c = $('#mpCont'); if (c) c.onclick = () => openBriefing(sig);
  document.querySelectorAll('[data-lvm]').forEach(g => { const ir = () => openBriefing(+g.dataset.lvm); g.addEventListener('click', ir); g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ir(); } }); });
  const cb = $('#mpCuad'); if (cb) cb.onclick = openCuaderno;
  const lb = $('#mpLog'); if (lb) lb.onclick = openLogros;
  const hi = $('#mpHis'); if (hi) hi.onclick = () => openHistoria(historiaVistas()[0], true);
  const pq = $('#mpPeq'); if (pq) pq.onclick = () => { S.peque = !S.peque; save(); renderSetup(); if (S.peque) toast('🧒 Modo peque: pierdes la mitad de agua y la lava va más despacio.'); };
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
  if (esM3(i) && INFO[i].num === '3-1' && !historiaVista(1)) { openHistoria(1, false, () => openBriefing(i)); return; }
  if (esM3(i)) return openBriefing3(i);
  const n = NIV[i].nivel, p = progR(i), g = n.goals;
  openModal(`<h3>${nomNivel(i)} · ${esc(n.name)}</h3><div class="sub">${esc(n.brief)}</div>
    <div class="rules"><h4>Objetivos</h4><ul>
      <li>${p.stars >= 1 ? '★' : '☆'} Llega al punto de entrega con agua en el cántaro.</li>
      <li>${p.stars >= 2 ? '★' : '☆'} Termina con ${g.star_2_integrity} de agua o más.</li>
      <li>${p.stars >= 3 ? '★' : '☆'} Termina en ${Math.floor(g.star_3_time_s / 60)} min ${g.star_3_time_s % 60 ? (g.star_3_time_s % 60) + ' s' : ''} o menos y con ${g.star_3_integrity != null ? g.star_3_integrity : g.star_2_integrity} de agua o más.</li></ul>
      ${p.done ? `<h4>Tus récords</h4><p>⏱ Mejor tiempo: <b>${fmtT(p.bestMs)}</b> · 💧 Mejor agua: <b>${p.bestAgua}/100</b></p>` : ''}
      <p class="mut">Si Martín se cae, vuelve al último punto de control y pierde 15 de agua.</p></div>
    <div class="acts"><button class="btn-ghost" id="bfNo">Volver</button><button class="btn-gold" id="bfGo">▶ Jugar</button></div>`);
  $('#bfNo').onclick = closeModal; $('#bfGo').onclick = () => jugar(i, 'nivel');
}

function openBriefing3(i) {
  const n = NIV[i].nivel, p = progR(i), g = n.goals;
  openModal(`<h3>${nomNivel(i)} · ${esc(n.name)}</h3><div class="sub">${esc(n.brief)}</div>
    <div class="rules"><h4>Objetivos</h4><ul>
      <li>${p.stars >= 1 ? '★' : '☆'} Llega al final del camino.</li>
      <li>${p.stars >= 2 ? '★' : '☆'} Termina con ${g.star_2_integrity} de fuerzas o más.</li>
      <li>${p.stars >= 3 ? '★' : '☆'} Termina en ${Math.floor(g.star_3_time_s / 60)} min ${g.star_3_time_s % 60 ? (g.star_3_time_s % 60) + ' s' : ''} o menos y con ${g.star_3_integrity != null ? g.star_3_integrity : g.star_2_integrity} de fuerzas o más.</li></ul>
      ${p.done ? `<h4>Tus récords</h4><p>⏱ Mejor tiempo: <b>${fmtT(p.bestMs)}</b> · 💛 Más fuerzas: <b>${p.bestAgua}/100</b></p>` : ''}
      <p class="mut">Martín todavía es un guelfo: es más pequeño y salta un poco menos. Si se cae, vuelve al último punto de control y pierde 15 de fuerzas.</p>
      ${n.guia ? `<p class="mut">${n.guia.manada ? 'Si te quedas muy atrás, pierdes la fila de la manada' : 'Si te quedas muy atrás, pierdes al camellero'} y vuelves al último punto de control.</p>` : ''}
      ${n.calor ? '<p class="mut">El calor sube al sol y baja a la sombra de los muros y las piedras. Si llega al máximo, Martín vuelve al último punto de control a refrescarse.</p>' : ''}</div>
    <div class="acts"><button class="btn-ghost" id="bfNo">Volver</button><button class="btn-gold" id="bfGo">▶ Jugar</button></div>`);
  $('#bfNo').onclick = closeModal; $('#bfGo').onclick = () => { if (n.eclipse && !historiaVista(7)) openHistoria(7, false, () => jugar(i, 'nivel')); else jugar(i, 'nivel'); };
}
/* ================= La historia de Martín (escenas del Mundo 3) ================= */
const HISTORIA = {
  1: 'Uga, enero de 2026. Entre muros de piedra ha nacido un guelfo. Su madre no se acerca a él. Pero alguien sí.',
  2: 'Le pusieron Martín. Tomaba biberón como un bebé y, antes de aprender su nombre, aprendió un silbido.',
  3: 'Donde iba el camellero, iba Martín. Como si fuera su sombra.',
  4: 'Cada mañana, con la primera luz, los camellos salían en fila hacia el Echadero. Martín quería ir con ellos.',
  5: 'Era el último de la fila y el más pequeño. Pero ya conocía el camino.',
  6: 'El verano enseña a buscar la sombra. Y a no alejarse de quien te cuida.',
  7: '12 de agosto. El Sol empezó a apagarse por un borde, como si alguien le diera un bocado. La manada levantó la cabeza. Martín buscó al camellero.',
  8: 'Los encontró juntos, bajo una media luna de luz. Alguien apretó un botón, y aquel momento se quedó para siempre. Martín existe. Este juego es suyo.',
  9: 'Por fin, el Echadero. Los camellos de la manada descansan con sus sillas vacías, esperando el trabajo del día. Martín los mira desde abajo: algún día él también será uno de ellos.'
};
const historiaVista = k => !!(S.historia && S.historia.includes(k));
const historiaVistas = () => Object.keys(HISTORIA).map(Number).filter(historiaVista);
function openHistoria(k, repaso, luego) {
  if (!HISTORIA[k]) { if (luego) luego(); return; }
  S.historia = S.historia || []; if (!S.historia.includes(k)) { S.historia.push(k); save(); }
  const vistas = historiaVistas(), sig = repaso ? vistas[vistas.indexOf(k) + 1] : null;
  openModal(`<div class="hi"><canvas id="hiC" width="640" height="360" aria-hidden="true"></canvas><p class="hi-t">${esc(HISTORIA[k])}</p><small class="mut">${k <= 8 ? `La historia de Martín · ${k}/8` : 'La historia de Martín · El Echadero'}</small></div>
    <div class="acts">${sig ? '<button class="btn-ghost" id="hiSig">Siguiente ›</button>' : ''}<button class="btn-gold" id="hiOk">${luego ? 'Seguir ›' : 'Cerrar'}</button></div>`);
  window.Dibujo.dibujaHistoria($('#hiC').getContext('2d'), 640, 360, k);
  const fin = () => { closeModal(); if (luego) luego(); };
  $('#hiOk').onclick = fin; const s = $('#hiSig'); if (s) s.onclick = () => openHistoria(sig, true);
}
function renderGame() {
  const n = RUN.L;
  $('#subtitle').textContent = '';
  const inv = S.mano === 'invertida';
  $('#app').innerHTML = `<div class="mg ${inv ? 'inv' : ''}" id="mg">
    <div class="mg-cv"><canvas id="mgCv" aria-label="Juego"></canvas>
      <div class="mg-hud">
        <div class="mg-izq"><div class="mg-nom">${esc(n.name)}</div>
          <div class="mg-agua ${n.cuerpo ? 'm3' : ''}" role="img" aria-label="${n.cuerpo ? 'Fuerzas de Martín' : 'Agua del cántaro'}"><span class="mg-ic">${n.cuerpo ? '<b class="mg-cor" aria-hidden="true">💛</b>' : '<svg viewBox="0 0 24 30" width="20" height="24" aria-hidden="true"><path d="M12 1C12 1 2 13 2 19a10 10 0 0 0 20 0C22 13 12 1 12 1Z" fill="#5cc0f5" stroke="#fff" stroke-width="1.6"/><path d="M7 19a5 5 0 0 0 4 4.8" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" opacity=".8"/></svg>'}</span><div class="mg-bar"><i id="mgBar"></i></div><b id="mgAgua">100</b><em id="mgBajo"></em></div>${n.calor ? '<div class="mg-agua mg-calor" role="img" aria-label="Calor"><b aria-hidden="true">🌡️</b><div class="mg-bar"><i id="mgCalor"></i></div></div>' : ''}${frutosDe(n).length ? `<div class="mg-fru" id="mgFru" role="img" aria-label="${n.cuerpo ? 'Biberones escondidos' : 'Frutos escondidos'}"></div>` : ''}</div>
        <div class="mg-der"><div class="mg-t">⏱ <b id="mgTiempo">0:00.0</b></div><button class="mg-pausa" id="mgPausa" aria-label="Pausa"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M8 5v14M16 5v14" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg></button></div>
      </div>
      <div class="mg-hint" id="mgHint"></div>${n.lava ? '<div class="mg-lava" id="mgLava">🌋 ¡Corre! La lava está a <b id="mgLavaD"></b></div>' : ''}${n.guia ? `<div class="mg-lava mg-guia" id="mgGuia">🎵 ${n.guia.manada ? '¡Que se va la manada!' : '¡Que se va el camellero!'} <b id="mgGuiaD"></b> ›</div>` : ''}
      <div class="mg-ov" id="mgOv"></div>
    </div>
    <div class="mg-pad"><div class="mg-lr"><button class="mg-b" id="mgL" aria-label="Izquierda"><svg viewBox="0 0 48 48" width="1em" height="1em" aria-hidden="true"><path d="M30 8 14 24 30 40" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg></button><button class="mg-b" id="mgR" aria-label="Derecha"><svg viewBox="0 0 48 48" width="1em" height="1em" aria-hidden="true"><path d="M18 8 34 24 18 40" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div><button class="mg-b mg-j" id="mgJ" aria-label="Saltar"><svg viewBox="0 0 48 48" width="1em" height="1em" aria-hidden="true"><path d="M8 32 24 14 40 32" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="mg-jt">SALTAR</span></button></div>
  </div>`;
  RUN.cv = $('#mgCv'); RUN.ctx = RUN.cv.getContext('2d'); RUN.camInit = '';
  enlazarControles();
  $('#mgPausa').onclick = () => { if (RUN.s.fase === 'jugando') pausar(); else if (RUN.overlay === 'pausa') reanudar(); };
  ponOverlay(); startLoop();
}
/* ================= Logros (3.2) =================
   Se calculan con lo que ya se guarda (progreso y partidas); una vez conseguido, queda apuntado en S.logros con su fecha */
const hechoId = id => { const i = NIV.findIndex(n => n.ok && n.nivel.level_id === id); return i >= 0 && progR(i).done; };
const LOGROS = [
  { id: 'primeros', ic: '🐪', t: 'Primeros pasos', d: 'Termina el primer nivel.', ok: () => progR(0).done },
  { id: 'lleno', ic: '💧', t: 'Sin perder nada', d: 'Termina un nivel con 100 de agua o de fuerzas.', ok: () => S.archive.some(a => a.mode === 'nivel' && a.agua >= 100) },
  { id: 'firme', ic: '🦶', t: 'Pie firme', d: 'Termina 5 niveles distintos sin caerte.', ok: () => new Set(S.archive.filter(a => a.mode === 'nivel' && !a.caidas).map(a => a.nivel)).size >= 5 },
  { id: 'frutos1', ic: '🍇', t: 'Despensa del sur', d: 'Encuentra todos los frutos del Mundo 1.', ok: () => mundoCompleto(0) },
  { id: 'frutos2', ic: '🌊', t: 'Despensa del norte', d: 'Encuentra todos los frutos del Mundo 2.', ok: () => mundoCompleto(1) },
  { id: 'biberones', ic: '🍼', t: 'Guelfo bien criado', d: 'Encuentra todos los biberones del Mundo 3.', ok: () => mundoCompleto(2) },
  { id: 'secreto', ic: '✨', t: 'Lugar secreto', d: 'Termina un nivel secreto.', ok: () => NIV.some((n, i) => secretoDe(i) >= 0 && progR(i).done) },
  { id: 'estrellas1', ic: '⭐', t: 'Estrellas del sur', d: 'Consigue 3 estrellas en todos los niveles del Mundo 1.', ok: () => estrellasMundo(0) },
  { id: 'estrellas2', ic: '🌟', t: 'Estrellas del norte', d: 'Consigue 3 estrellas en todos los niveles del Mundo 2.', ok: () => estrellasMundo(1) },
  { id: 'estrellas3', ic: '💫', t: 'Estrellas del guelfo', d: 'Consigue 3 estrellas en todos los niveles del Mundo 3.', ok: () => estrellasMundo(2) },
  { id: 'dunas', ic: '🏜️', t: 'Rey de las dunas', d: 'Termina El jable de Famara.', ok: () => hechoId('norte_e01_jable_famara') },
  { id: 'barcas', ic: '⛵', t: 'Marinero de Órzola', d: 'Termina Las barcas de Órzola.', ok: () => hechoId('norte_e02_barcas_orzola') },
  { id: 'eclipse', ic: '🌘', t: 'Bajo el eclipse', d: 'Termina La luz que se apaga.', ok: () => NIV.some((n, i) => n.ok && n.nivel.eclipse && progR(i).done) },
  { id: 'todo', ic: '🏆', t: 'Todo el camino', d: 'Termina todos los niveles de los tres mundos.', ok: () => INFO.every((x, i) => x.tipo !== 'nivel' || !NIV[i].ok || progR(i).done) },
  { id: 'diario', ic: '📅', t: 'Reto del día', d: 'Termina un reto diario.', ok: () => S.archive.some(a => a.mode === 'diario') },
  { id: 'constancia', ic: '🔁', t: 'Constancia', d: 'Juega 50 partidas.', ok: () => NIV.reduce((a, n, i) => a + (progR(i).plays || 0), 0) >= 50 }
];
/* apunta los logros conseguidos; devuelve los nuevos. La primera vez (S.logros sin crear) se apuntan sin avisar */
function revisaLogros() {
  const prim = !S.logros; S.logros = S.logros || {}; const nuevos = [];
  for (const l of LOGROS) { if (S.logros[l.id]) continue; let ok = false; try { ok = !!l.ok(); } catch (e) {} if (ok) { S.logros[l.id] = Date.now(); if (!prim) nuevos.push(l); } }
  return nuevos;
}
const logrosHechos = () => LOGROS.filter(l => S.logros && S.logros[l.id]).length;
function logrosBoton() { const n = logrosHechos(); return `<button class="mp-cuad mp-log" id="mpLog"><div class="ic">🏆</div><div><b>Logros · ${n}/${LOGROS.length}</b><span>${n ? 'Lo que has conseguido en el camino.' : 'Retos para todo el viaje: estrellas, frutos, sitios secretos…'}</span></div></button>`; }
function openLogros() {
  revisaLogros(); save();
  const f = ms => new Date(ms).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  openModal(`<h3>🏆 Logros · ${logrosHechos()}/${LOGROS.length}</h3><div class="sub">Se consiguen jugando: no hace falta hacer nada más.</div>
    <div class="lg-lista">${LOGROS.map(l => { const h = S.logros[l.id]; return `<div class="lg ${h ? 'si' : ''}"><div class="lg-ic" aria-hidden="true">${h ? l.ic : '🔒'}</div><div class="lg-tx"><b>${esc(l.t)}</b><span>${esc(l.d)}</span>${h ? `<small>${f(h)}</small>` : ''}</div></div>`; }).join('')}</div>
    <div class="acts"><button class="btn-gold" id="lgOk">Cerrar</button></div>`);
  $('#lgOk').onclick = closeModal;
}

/* ================= Cuaderno de viaje ================= */
const LUG = window.LUGARES || [], LUGN = LUG.filter(Boolean).length;
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
    g.fillStyle = '#6b5a45'; g.font = `600 ${Math.round(W * 0.06)}px system-ui, sans-serif`; g.fillText('LANZAROTE · ' + (INFO[i] ? INFO[i].num || '✦' : i + 1), W / 2, m + ih + H * 0.19);
  };
  dibuja(null); const img = new Image(); img.onload = () => dibuja(img); img.src = f.img;
}
/* Mapa de Lanzarote: cada nivel en su sitio real, unidos por el camino de Martín (dibujo fijo: no se repinta durante la partida) */
function mapaIsla(sig) {
  const Z = window.MAPA_LZ; if (!Z) return '';
  // Mundo 3: todo pasa entre Uga, el Vallito, el sendero y el Echadero; los botones van en fila sobre el mar, unidos a su sitio
  const R3 = [[106, 316], [105, 318], [102, 311], [109, 298], [112, 290], [101, 313], [116, 279], [47, 300]], E3 = R3.map((_, k) => [158 + k * 30, 408]);
    const RX = [[248, 186], [347, 76], [92, 258]], EX = [[226, 200], [372, 64], [66, 238]];   // 3.1: el jable de Famara y el muelle de Órzola; 3.3: los ríos de fuego de Timanfaya
  const P = Z.puntos.slice(0, NBASE + SECS.length).concat(R3.slice(0, M3.length), RX.slice(0, EXT.length)), ET = (Z.etiquetas || Z.puntos).slice(0, NBASE + SECS.length).concat(E3.slice(0, M3.length), EX.slice(0, EXT.length));
  const n = Math.min(P.length, NBASE), nt = Math.min(P.length, NIV.length);
  let camino = ''; for (let i = 0; i < n; i++) { const [x, y] = P[i]; if (!i) { camino += `M${x} ${y}`; continue; } const [a, b] = P[i - 1], mx = (a + x) / 2 + (b - y) * 0.18, my = (b + y) / 2 + (x - a) * 0.18; camino += `Q${mx.toFixed(1)} ${my.toFixed(1)} ${x} ${y}`; }
  let hecho = ''; for (let i = 1; i < n; i++) if (progR(i - 1).done && desbloqueado(i)) { const [a, b] = P[i - 1], [x, y] = P[i], mx = (a + x) / 2 + (b - y) * 0.18, my = (b + y) / 2 + (x - a) * 0.18; hecho += `M${a} ${b}Q${mx.toFixed(1)} ${my.toFixed(1)} ${x} ${y}`; }
  let mk = '';
  for (let i = 0; i < nt; i++) {
    const [px, py] = P[i], [x, y] = ET[i], nv = NIV[i], ab = nv && nv.ok && desbloqueado(i), p = progR(i), es = i === sig;
    if (px !== x || py !== y) mk += `<line x1="${px}" y1="${py}" x2="${x}" y2="${y}" stroke="#f3dcae" stroke-width="${esM3(i) ? 0.8 : 1.5}" stroke-opacity="${esM3(i) ? 0.45 : 1}"/><circle cx="${px}" cy="${py}" r="3" fill="#f3dcae"/>`;
    const sm = secretoDe(i) >= 0 || premioDe(i) ? 1 : -1, col = sm >= 0 ? (ab ? (p.done ? '#f4c13d' : '#c9a4ff') : '#4a3a66') : !ab ? '#6b625c' : p.done ? '#f4c13d' : '#ffffff', txt = !ab ? '#d8d0c8' : '#2a1a10';
    mk += `<g class="mk ${ab ? '' : 'cerrado'}" ${ab ? `data-lvm="${i}" tabindex="0" role="button"` : ''} aria-label="${nomNivel(i)}" transform="translate(${x} ${y})">
      ${es ? `<circle class="mk-pulso" r="12" fill="none" stroke="#ffffff" stroke-width="3"/>` : ''}
      <circle r="13" fill="rgba(0,0,0,.35)" cy="2"/><circle class="fondo" r="12" fill="${col}" stroke="${p.done ? '#7a4a12' : '#3a2a20'}" stroke-width="2"/>
      <text text-anchor="middle" dy="${INFO[i].num.length > 2 ? 4 : 4.5}" font-size="${INFO[i].num.length > 2 ? 10 : 13}" font-weight="800" fill="${txt}" font-family="system-ui,sans-serif">${secretoDe(i) >= 0 ? (ab ? '✨' : '?') : premioDe(i) ? (ab ? '🎁' : '?') : ab ? INFO[i].num : '🔒'}</text>
      ${p.done ? `<text text-anchor="middle" y="24" font-size="9" fill="#ffd968" stroke="#2a1a10" stroke-width="2.5" paint-order="stroke" font-family="system-ui,sans-serif">${'★'.repeat(p.stars)}${'☆'.repeat(3 - p.stars)}</text>` : ''}
      ${selloAbierto(i) ? '<text x="10" y="-8" font-size="11">🏅</text>' : ''}</g>`;
  }
  const olas = [[40, 120], [300, 90], [60, 420], [320, 380], [210, 500], [30, 260]].map(([x, y]) => `<path d="M${x} ${y}q8 -6 16 0t16 0" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="2" stroke-linecap="round"/>`).join('');
  return `<div class="mp-map"><h4>🗺️ Tu viaje por Lanzarote</h4>
    <svg viewBox="0 0 ${Z.w} ${Z.h}" role="img" aria-label="Mapa de Lanzarote con los niveles">
      <defs><radialGradient id="mzMar" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#2f8fd0"/><stop offset="1" stop-color="#11507f"/></radialGradient>
        <linearGradient id="mzTierra" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d9a066"/><stop offset=".55" stop-color="#b9743f"/><stop offset="1" stop-color="#7d4a2b"/></linearGradient></defs>
      <rect width="${Z.w}" height="${Z.h}" fill="url(#mzMar)"/>${olas}
      ${[Z.isla, ...Z.islotes].map(d => `<path d="${d}" transform="translate(2.5 3.5)" fill="rgba(0,20,40,.35)"/>`).join('')}
      ${[Z.isla, ...Z.islotes].map(d => `<path d="${d}" fill="url(#mzTierra)" stroke="#f3dcae" stroke-width="2.2" stroke-linejoin="round"/>`).join('')}
      <path d="${camino}" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="2.5" stroke-dasharray="2 6" stroke-linecap="round"/>
      ${hecho ? `<path d="${hecho}" fill="none" stroke="#ffd968" stroke-width="3" stroke-dasharray="2 6" stroke-linecap="round"/>` : ''}
      ${M3.length ? `<path d="M${E3.slice(0, M3.length).map(([x, y]) => x + ' ' + y).join('L')}" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="2" stroke-dasharray="2 5"/><text x="${E3[0][0] - 12}" y="390" font-size="11" font-weight="800" fill="#ffe6a8" stroke="#10324f" stroke-width="3" paint-order="stroke" font-family="system-ui,sans-serif">Mundo 3 · alrededor de Uga</text>` : ''}
      ${mk}
    </svg><small>Mapa: © OpenStreetMap</small></div>`;
}
/* Guía de la naturaleza: las especies de cada nivel se descubren al terminarlo */
const NAT = window.NATURALEZA || [];
const ORIGEN = { 'endemica-lz': ['Solo en Lanzarote', '#3fb27f'], endemica: ['Endemismo canario', '#3fb27f'], nativa: ['Nativa', '#5aa0d8'], introducida: ['Llegó de fuera', '#d89a3f'], invasora: ['Llegó de fuera · invasora', '#e0604a'], cultivo: ['De cultivo', '#b98ad8'], salinas: ['Vive en las salinas', '#e07a9a'], raza: ['Raza canaria reconocida', '#3fb27f'], simbolo: ['Símbolo vegetal de Lanzarote', '#3fb27f'] };
const ESP_NIV = [];
const especiesNivel = i => ESP_NIV[i] || (ESP_NIV[i] = NIV[i] && NIV[i].ok ? especiesDe(NIV[i].nivel, i) : []);
const descubreEn = i => NAT.filter(e => NIV[i] && NIV[i].ok && e.descubre === NIV[i].nivel.level_id).map(e => e.id);   // cada especie se descubre en el nivel de su lugar
const especiesVistas = (sin) => { const v = new Set(); NIV.forEach((n, i) => { if (i !== sin && progR(i).done) descubreEn(i).forEach(e => v.add(e)); }); return v; };
function openGuia() {
  const v = especiesVistas();
  let h = `<h3>🌿 Guía de la naturaleza</h3><div class="sub">Las plantas y los animales que salen en el juego. Cada uno se descubre al terminar el nivel del lugar donde vive.</div><div class="gu-l">`;
  NAT.forEach(e => { const ok = v.has(e.id); h += `<button class="gu-i ${ok ? '' : 'cerrado'}" ${ok ? `data-esp="${e.id}"` : 'disabled'}><canvas class="gu-c" data-espc="${e.id}" width="160" height="128" aria-hidden="true"></canvas><b>${ok ? esc(e.nombre) : '?'}</b></button>`; });
  h += `</div><div class="acts"><button class="btn-ghost" id="guVol">‹ Cuaderno</button><button class="btn-gold" id="guOk">Cerrar</button></div>`;
  openModal(h);
  document.querySelectorAll('[data-espc]').forEach(c => { dibujaEspecie(c.getContext('2d'), c.dataset.espc, c.width, c.height); if (!v.has(c.dataset.espc)) c.style.filter = 'brightness(0) opacity(.35)'; });
  document.querySelectorAll('[data-esp]').forEach(b => b.onclick = () => openEspecie(b.dataset.esp));
  $('#guOk').onclick = closeModal; $('#guVol').onclick = openCuaderno;
}
function openEspecie(id) {
  const e = NAT.find(x => x.id === id); if (!e) return; const o = ORIGEN[e.origen] || ['', '#888'];
  const iv = NIV.findIndex(n => n.ok && n.nivel.level_id === e.descubre), lugar = iv >= 0 ? nomNivel(iv) + (LUG[iv] ? ' · ' + LUG[iv].lugar : '') : '', veces = NIV.filter((n, i) => n.ok && especiesNivel(i).includes(id)).length;
  openModal(`<div class="es"><canvas id="esC" width="320" height="240" aria-hidden="true"></canvas>
    <h3>${esc(e.nombre)}</h3><div class="es-c"><i>${esc(e.cientifico)}</i></div><span class="es-o" style="background:${o[1]}">${esc(o[0])}</span>
    ${e.texto.map(p => `<p>${esc(p)}</p>`).join('')}
    ${lugar ? `<div class="es-d"><b>La descubres en:</b> <span>${esc(lugar)}</span></div>` : ''}${veces ? `<div class="es-d"><b>Aparece en ${veces} niveles del juego</b></div>` : ''}
    <div class="fi-f">${e.fuentes.length > 1 ? 'Fuentes:' : 'Fuente:'} ${e.fuentes.map(([t, u]) => `<a href="#" data-url="${esc(u)}">${esc(t)}</a>`).join(' · ')}</div></div>
    <div class="acts"><button class="btn-ghost" id="esVol">‹ Guía</button><button class="btn-gold" id="esOk">Cerrar</button></div>`);
  dibujaEspecie($('#esC').getContext('2d'), id, 320, 240);
  document.querySelectorAll('.es .fi-f a').forEach(a => a.onclick = ev => { ev.preventDefault(); openExternal(a.dataset.url); });
  $('#esOk').onclick = closeModal; $('#esVol').onclick = openGuia;
}
function cuadernoBoton() {
  if (!LUGN) return '';
  const n = LUG.filter((f, i) => f && fichaAbierta(i)).length;
  const se = sellosHechos();
  return `<button class="mp-cuad" id="mpCuad"><div class="ic">📖</div><div><b>Cuaderno de viaje · ${n}/${LUGN}</b>${se ? `<small class="mp-se">🏅 ${se}/${LUG.filter(f => f && f.extra).length}</small>` : ''}<span>${n ? 'Lo que has aprendido de Lanzarote en el camino.' : 'Termina un nivel para conocer su lugar.'}</span></div></button>`;
}
function openCuaderno() {
  let h = `<h3>📖 Cuaderno de viaje</h3><div class="sub">Cada nivel recorre un lugar real de Lanzarote. Termínalo para abrir su ficha.</div>
    ${NAT.length ? `<button class="cu-gu" id="cuGuia"><span>🌿 Guía de la naturaleza</span><b>${especiesVistas().size}/${NAT.length}</b></button>` : ''}
    <div class="cu-se"><b>🏅 Sellos: ${sellosHechos()}/${LUG.filter(f => f && f.extra).length}</b><span>Encuentra los 3 frutos de un nivel y gana el sello de ese lugar.</span></div><div class="cu-l">`;
  LUG.forEach((f, i) => {
    if (!f) return;
    const ok = fichaAbierta(i);
    h += `<button class="cu-i ${ok ? '' : 'cerrado'}" data-fi="${i}" ${ok ? '' : 'disabled'} style="background-image:url('${f.img}');background-position:${f.pos}"><span>${ok ? `<b>${esc(f.lugar)}</b>${esc(f.titulo)}` : `🔒 ${nomNivel(i)}`}</span>${selloAbierto(i) ? '<i class="cu-b" aria-label="Sello">🏅</i>' : ''}</button>`;
  });
  h += `</div><div class="acts"><button class="btn-gold" id="cuOk">Cerrar</button></div>`;
  openModal(h);
  document.querySelectorAll('[data-fi]').forEach(b => b.onclick = () => openFicha(+b.dataset.fi, true));
  $('#cuOk').onclick = closeModal; const gb = $('#cuGuia'); if (gb) gb.onclick = openGuia;
}
function openFicha(i, desdeCuaderno) {
  const f = LUG[i]; if (!f) return;
  openModal(`<div class="fi"><div class="fi-img" style="background-image:url('${f.img}');background-position:${f.pos}"></div>
    <div class="fi-l"><span>${nomNivel(i)}</span> · <span>${esc(f.lugar)}</span></div><h3>${esc(f.titulo)}</h3>
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
    const rt = RUN.modo === 'diario' ? `<div class="mg-tag">📅 Reto diario · ${esc(MODS_TXT[RUN.opts.mod || 'normal'][0])}</div>` : RUN.modo === 'practica' ? '<div class="mg-tag">🎯 Práctica</div>' : RUN.s && RUN.s.mod === 'peque' ? '<div class="mg-tag">🧒 Modo peque</div>' : '';
    ov.innerHTML = `<div class="ov-c">${rt}<div class="ov-t">${esc(n.name)}</div><div class="ov-s">${esc(n.brief)}</div>
      <div class="ov-k"><span>◀ ▶ moverse</span><span>⬆ saltar</span></div><button class="btn-gold ov-go" id="ovGo">▶ ¡Vamos!</button>
      <button class="btn-ghost" id="ovMapa">Volver al mapa</button></div>`;
    $('#ovGo').onclick = empezar; $('#ovMapa').onclick = salirAlMapa;
  } else if (o === 'pausa') {
    ov.innerHTML = `<div class="ov-c"><div class="ov-t">⏸ Pausa</div><div class="ov-s">El reloj está parado.</div>
      <button class="btn-gold ov-go" id="ovSig">▶ Seguir</button><button class="btn-ghost" id="ovRei">↻ Empezar de nuevo</button><button class="btn-ghost" id="ovMapa">Salir al mapa</button></div>`;
    $('#ovSig').onclick = reanudar; $('#ovRei').onclick = reintentar; $('#ovMapa').onclick = abandonar;
  } else if (o === 'fallo') {
    ov.innerHTML = `<div class="ov-c"><div class="ov-t">${s.causa === 'lava' || s.causa === 'rio_lava' ? '🌋' : n.cuerpo ? '💛' : '💧'} ${n.cuerpo ? '¡Uf! Otra vez' : 'Misión fallida'}</div><div class="ov-s">${esc((n.cuerpo ? CAUSAS3 : CAUSAS)[s.causa] || '')}</div>
      <div class="ov-d"><span>⏱ ${fmtT(s.t * 1000 / 60)}</span><span>Caídas ${s.caidas}</span><span>Golpes ${s.golpes}</span></div>
      <button class="btn-gold ov-go" id="ovRei">↻ Reintentar</button><button class="btn-ghost" id="ovMapa">Volver al mapa</button></div>`;
    $('#ovRei').onclick = reintentar; $('#ovMapa').onclick = salirAlMapa;
  } else if (o === 'fin') {
    const r = M.resultado(s), g = n.goals, nu = RUN.nuevo || {};
    const m3 = !!n.cuerpo, ag = m3 ? 'fuerzas' : 'agua';
    const razon = [`${r.estrellas >= 1 ? '★' : '☆'} ${m3 ? 'Llegaste al final del camino' : 'Entregaste el agua'}`, `${r.estrellas >= 2 ? '★' : '☆'} ${g.star_2_integrity} de ${ag} o más`, `${r.estrellas >= 3 ? '★' : '☆'} En ${g.star_3_time_s} s o menos con ${g.star_3_integrity != null ? g.star_3_integrity : g.star_2_integrity} de ${ag}`];
    const sigOk = RUN.modo === 'nivel' && siguienteDe(RUN.idx) >= 0;
    ov.innerHTML = `<div class="ov-c"><div class="ov-t">${m3 ? '¡Lo has conseguido!' : '¡Entregado!'}</div><div class="ov-est" aria-label="${r.estrellas} de 3 estrellas">${estrellasTxt(r.estrellas)}</div>
      <div class="ov-d big"><span>⏱ <b>${fmtT(r.ms)}</b>${nu.tiempo ? ' 🏅' : ''}</span><span>${m3 ? '💛' : '💧'} <b>${r.agua}</b>/100${nu.agua ? ' 🏅' : ''}</span></div>
      <div class="ov-d"><span>${m3 ? 'Fuerzas perdidas' : 'Agua perdida'} ${r.danos}</span><span>Caídas ${r.caidas}</span>${s.ruta ? `<span>${s.ruta === 'RUTA-ALTA' ? 'Camino alto' : 'Camino bajo'}</span>` : ''}</div>
      <ul class="ov-r">${razon.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
      ${frutosDe(n).length ? `<div class="ov-fru"><span id="ovFru"></span><span>${r.objetos.length === frutosDe(n).length ? (m3 ? '¡Todos los biberones!' : '¡Todos los frutos!') : `${m3 ? 'Biberones' : 'Frutos'} ${r.objetos.length}/${frutosDe(n).length}`}</span>${nu.frutos && nu.frutos.length ? '<span class="ov-nue">✨ ¡Nuevo!</span>' : ''}</div>` : ''}
      ${nu.secreto != null ? `<div class="ov-se"><b>✨ ¡Has abierto un nivel secreto!</b><span>Búscalo en el mapa, al final del Mundo ${nu.secreto + 1}.</span></div>` : ''}
      ${nu.premio ? '<div class="ov-se"><b>🎁 ¡Has abierto el nivel de premio!</b><span>Búscalo al final del Mundo 3.</span></div>' : ''}
      ${nu.escena && HISTORIA[nu.escena] ? `<button class="ov-se ov-ir" id="ovHis"><b>📜 La historia de Martín</b><span>Una escena nueva de la historia.</span></button>` : ''}
      ${nu.especies && nu.especies.length ? `<button class="ov-gu ov-ir" id="ovGu"><b>🌿 Nueva especie en tu guía</b><span>${nu.especies.map(esc).join(' · ')}</span></button>` : ''}
      ${nu.sello ? '<button class="ov-se ov-ir" id="ovSe"><b>🏅 ¡Nuevo sello en el cuaderno!</b><span>Ábrelo para ver una curiosidad más de este lugar.</span></button>' : ''}
      ${nu.logros ? `<button class="ov-se ov-ir" id="ovLog"><b>🏆 ¡Nuevo logro!</b><span>${nu.logros.map(l => l.ic + ' ' + esc(l.t)).join(' · ')}</span></button>` : ''}
      ${nu.fantasma ? '<div class="ov-fan">👻 Tu nueva mejor carrera será tu rival la próxima vez.</div>' : ''}
      ${RUN.modo === 'diario' ? `<div class="ov-env" id="ovEnv">${envioTxt()}</div>` : ''}
      ${RUN.modo === 'nivel' && LUG[RUN.idx] ? `<button class="ov-fi" id="ovFi">📖 ${(RUN.nuevo || {}).primera ? '✨ Nueva ficha: ' : 'Conoce '}${esc(LUG[RUN.idx].lugar)}</button>` : ''}
      <button class="btn-gold ov-go" id="ovSig">${RUN.modo === 'nivel' ? (sigOk ? 'Siguiente nivel ›' : 'Volver al mapa') : 'Volver al mapa'}</button>
      <div class="ov-row"><button class="btn-ghost" id="ovRei">↻ Repetir</button>${RUN.modo === 'diario' ? '<button class="btn-ghost" id="ovRank">🏆 Ranking</button>' : '<button class="btn-ghost" id="ovMapa">Mapa</button>'}</div></div>`;
    $('#ovSig').onclick = RUN.modo === 'nivel' ? siguiente : salirAlMapa; $('#ovRei').onclick = reintentar;
    const rk = $('#ovRank'); if (rk) rk.onclick = () => openRanking();
    const mp = $('#ovMapa'); if (mp) mp.onclick = salirAlMapa;
    const fi = $('#ovFi'); if (fi) fi.onclick = () => openFicha(RUN.idx, false);
    const se = $('#ovSe'); if (se) se.onclick = () => openFicha(RUN.idx, false);
    const ol = $('#ovLog'); if (ol) { ol.onclick = openLogros; if (!RUN.logroSono) { RUN.logroSono = true; setTimeout(() => Sound.play('logro'), 700); } }   // la ficha enseña el sello y la curiosidad nueva
    const oh = $('#ovHis'); if (oh) oh.onclick = () => openHistoria(nu.escena, false);
    const gu = $('#ovGu'); if (gu) gu.onclick = () => { const ids = nu.espIds || []; if (ids.length === 1) openEspecie(ids[0]); else openGuia(); };
    pintaFrutos($('#ovFru'), n, s.obj || {}, 26);
  }
}

/* ================= Reto diario ================= */
const RETO = { info: null, estado: 'nada', ranking: null, err: '' };
const diaLocal = () => { try { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Atlantic/Canary' }).format(new Date()); } catch (e) { return new Date().toISOString().slice(0, 10); } };
function retoInfoLocal() {
  const dia = diaLocal(), r = M.retoDelDia(dia, NIV.slice(0, NBASE).map(n => (n.ok ? n.nivel.level_id : '')));   // los secretos no entran (igual que en el servidor)
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
