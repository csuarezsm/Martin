# Genera www/mapa-lz.js: contorno de Lanzarote y sus islotes (OpenStreetMap, ODbL, vía @geo-maps 100 m)
# y la posición real de cada nivel. Uso: python3 tools/mapa.py
import json, math, os
R = os.path.dirname(os.path.abspath(__file__))
anillos = [r for r in json.load(open(os.path.join(R, 'geo', 'lanzarote-osm.json'))) if min(p[1] for p in r) < 29.285]   # sin Alegranza ni Montaña Clara (alargaban el mapa)
LAT0 = 29.03; K = math.cos(math.radians(LAT0))
lon_min = min(p[0] for r in anillos for p in r); lon_max = max(p[0] for r in anillos for p in r)
lat_min = min(p[1] for r in anillos for p in r); lat_max = max(p[1] for r in anillos for p in r)
W = 360.0; esc = W / ((lon_max - lon_min) * K); M = 14
H = (lat_max - lat_min) * esc
def pr(lon, lat): return (M + (lon - lon_min) * K * esc, M + (lat_max - lat) * esc)
def suave(pts):   # Catmull-Rom cerrado -> curvas Bézier
    n = len(pts); d = 'M%.1f %.1f' % pts[0]
    for i in range(n):
        p0, p1, p2, p3 = pts[i - 1], pts[i], pts[(i + 1) % n], pts[(i + 2) % n]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6); c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d += 'C%.1f %.1f %.1f %.1f %.1f %.1f' % (c1 + c2 + p2)
    return d + 'Z'
anillos.sort(key=len, reverse=True)
caminos = []
for r in anillos:
    pts = [pr(*p) for p in r]
    if pts[0] == pts[-1]: pts = pts[:-1]
    caminos.append(suave(pts))
# lugares de cada nivel (lat, lon aproximados del sitio real)
LUG = [('Uga', 28.951, -13.764), ('Tiagua', 29.044, -13.639), ('Timanfaya', 29.004, -13.752), ('La Geria', 28.986, -13.712),
       ('Los Hervideros', 28.954, -13.832), ('Teguise', 29.061, -13.560), ('El Golfo', 28.980, -13.835), ('Janubio', 28.933, -13.823),
       ('Famara', 29.115, -13.565), ('Haría', 29.145, -13.499), ('Mirador del Río', 29.214, -13.481),
       ('Cueva de los Verdes', 29.157, -13.438), ('La Graciosa', 29.232, -13.505)]   # secretos
puntos = [[round(v, 1) for v in pr(lon, lat)] for (_, lat, lon) in LUG]
# donde los lugares están muy juntos (Hervideros, El Golfo, Janubio), el círculo sale al mar unido por una línea a su punto
DESP = {4: (-30, 2), 6: (-28, -24), 7: (-22, 26)}
etiquetas = [[round(puntos[i][0] + DESP.get(i, (0, 0))[0], 1), round(puntos[i][1] + DESP.get(i, (0, 0))[1], 1)] for i in range(len(puntos))]
out = {'w': round(W + 2 * M), 'h': round(H + 2 * M), 'isla': caminos[0], 'islotes': caminos[1:], 'puntos': puntos, 'etiquetas': etiquetas}
dst = os.path.join(R, '..', 'www', 'mapa-lz.js')
open(dst, 'w').write('/* Mapa de Lanzarote para el selector de niveles. GENERADO por tools/mapa.py: no editar a mano.\n   Contorno: © colaboradores de OpenStreetMap (ODbL). © 2026 IT Canarias. */\nwindow.MAPA_LZ = ' + json.dumps(out, separators=(',', ':')) + ';\n')
print('ok', out['w'], out['h'], len(out['isla']), len(out['islotes']))
