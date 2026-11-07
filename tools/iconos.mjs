// Genera iconos, pantalla de arranque y gráficos de Martín dibujando con el propio dibujo del juego.
// Uso: node tools/iconos.mjs   (desde la raíz del repo; necesita Playwright y Chrome)
import { chromium } from 'playwright';
import http from 'node:http'; import fs from 'node:fs'; import { readFile } from 'node:fs/promises'; import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = fileURLToPath(new URL('../', import.meta.url));
const T = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.webmanifest': 'application/json', '.png': 'image/png' };
const srv = http.createServer(async (q, r) => { const p = normalize(decodeURIComponent(q.url.split('?')[0])); try { const f = await readFile(join(ROOT, 'www', p === '/' ? 'index.html' : p)); r.writeHead(200, { 'content-type': T[extname(p)] || 'text/html' }); r.end(f); } catch { r.writeHead(404); r.end(); } });
await new Promise(r => srv.listen(0, r));
let b; try { b = await chromium.launch(); } catch (e) { b = await chromium.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome' }); }
const p = await (await b.newContext({ serviceWorkers: 'block' })).newPage();
await p.route('https://**', r => r.abort());
await p.addInitScript(() => { localStorage.setItem('martin.v1', JSON.stringify({ onboarded: true, iosHint: true })); });
await p.goto('http://localhost:' + srv.address().port + '/'); await p.waitForTimeout(500);
// Dibujo: modo 'icono' (cielo + volcán + Martín), 'fondo' (solo cielo y volcán), 'primer' (solo Martín, transparente)
const dibuja = (W, H, modo, escala) => {
  const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  const m = Math.min(W, H);
  const banner = modo === 'banner'; if (banner) modo = 'icono';
  if (modo !== 'primer') {
    const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2a1c18'); g.addColorStop(0.45, '#8a3b22'); g.addColorStop(1, '#e8893a');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.fillStyle = 'rgba(255,214,140,.9)'; x.beginPath(); x.arc(W * (modo === 'banner' ? 0.9 : 0.2), H * 0.2, m * 0.08, 0, 7); x.fill();
    const base = H * 0.82;
    x.fillStyle = '#4a2418'; x.beginPath(); x.moveTo(W * 0.02, base); x.lineTo(W * 0.38, H * 0.40); x.lineTo(W * 0.44, H * 0.38); x.lineTo(W * 0.52, H * 0.40); x.lineTo(W * 0.92, base); x.closePath(); x.fill();
    x.fillStyle = 'rgba(70,50,44,.55)'; x.beginPath(); x.arc(W * 0.45, H * 0.30, m * 0.05, 0, 7); x.arc(W * 0.49, H * 0.23, m * 0.04, 0, 7); x.fill();
    x.fillStyle = '#ff7a2e'; x.beginPath(); x.moveTo(W * 0.40, H * 0.395); x.lineTo(W * 0.44, H * 0.37); x.lineTo(W * 0.5, H * 0.395); x.lineTo(W * 0.46, H * 0.42); x.closePath(); x.fill();
    x.fillStyle = '#2e1610'; x.fillRect(0, base, W, H - base);
    x.fillStyle = '#1f0f0b'; x.beginPath(); x.moveTo(0, base + m * 0.02); for (let i = 0; i <= 12; i++) x.lineTo(W * i / 12, base + m * (0.015 + 0.02 * ((i * 7) % 3))); x.lineTo(W, H); x.lineTo(0, H); x.fill();
  }
  if (modo !== 'fondo') {
    const u = m * escala, px = W * 0.47, py = H * 0.84;
    dibujaMartin(x, u, px, py, { dir: 1, fase: 0.4, anim: 'idle', agua: 100, golpe: 0, t: 0, alpha: 1 });
  }
  if (banner) { x.textAlign = 'left'; x.fillStyle = '#fff'; x.shadowColor = 'rgba(0,0,0,.6)'; x.shadowBlur = 12; x.font = '800 ' + Math.round(H * 0.2) + 'px system-ui,sans-serif'; x.fillText('Martín', W * 0.06, H * 0.42); x.fillStyle = '#ffd24a'; x.font = '700 ' + Math.round(H * 0.075) + 'px system-ui,sans-serif'; x.fillText('Los Caminos del Volcán', W * 0.065, H * 0.54); x.fillStyle = '#fff'; x.font = '600 ' + Math.round(H * 0.052) + 'px system-ui,sans-serif'; x.fillText('Entrega el agua por los caminos de Lanzarote', W * 0.065, H * 0.64); }
  return c.toDataURL('image/png');
};
const guarda = async (ruta, W, H, modo, escala, fondoSolido) => {
  const d = await p.evaluate(([f, W, H, modo, esc]) => eval('(' + f + ')')(W, H, modo, esc), [dibuja.toString(), W, H, modo, escala]);
  fs.mkdirSync(join(ROOT, ruta, '..'), { recursive: true }); fs.writeFileSync(join(ROOT, ruta), Buffer.from(d.split(',')[1], 'base64')); console.log(ruta, W + '×' + H);
};
await guarda('assets/icon-only.png', 1024, 1024, 'icono', 0.30);
await guarda('assets/icon-background.png', 1024, 1024, 'fondo');
await guarda('assets/icon-foreground.png', 1024, 1024, 'primer', 0.27);
await guarda('assets/splash.png', 2732, 2732, 'icono', 0.2);
await guarda('assets/splash-dark.png', 2732, 2732, 'icono', 0.2);
await guarda('www/icons/icon-512.png', 512, 512, 'icono', 0.30);
await guarda('www/icons/icon-192.png', 192, 192, 'icono', 0.30);
await guarda('www/icons/icon-maskable-512.png', 512, 512, 'icono', 0.24);
await guarda('www/icons/apple-touch-icon.png', 180, 180, 'icono', 0.30);
await guarda('www/juegos/martin.png', 192, 192, 'icono', 0.30);
await guarda('docs/icon.png', 512, 512, 'icono', 0.30);
await guarda('play-store/icono-512.png', 512, 512, 'icono', 0.30);
await guarda('play-store/grafico-destacado-1024x500.png', 1024, 500, 'banner', 0.27);
await b.close(); srv.close();
