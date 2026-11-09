# Iconos, pantallas de arranque y gráfico de Google Play de Martín, a partir de la ilustración del camello
# (www/camello.png) sobre el paisaje de Timanfaya (www/paisaje-timanfaya.jpg).
# Uso (desde la raíz del repo): python3 tools/iconos.py      Necesita Pillow.
import glob
from PIL import Image, ImageDraw, ImageFont, ImageFilter

CAMELLO = Image.open('www/camello.png').convert('RGBA')        # 551×560, cabeza hacia (430, 90)
PAISAJE = Image.open('www/paisaje-timanfaya.jpg').convert('RGB')  # 1672×640
FONDO_APP = '#1c130b'


def escena(n, zoom=1.25, cx=0.64, cy=0.24, bgx=260, bgside=640):
    """Cuadrado de n px: paisaje de Timanfaya y Martín grande, con la cabeza en (cx, cy)."""
    b = PAISAJE.crop((bgx, 0, bgx + bgside, bgside)).resize((n, n), Image.LANCZOS)
    k = n * zoom / 551
    sp = CAMELLO.resize((max(1, int(551 * k)), max(1, int(560 * k))), Image.LANCZOS)
    b.paste(sp, (int(n * cx - 430 * k), int(n * cy - 90 * k)), sp)
    return b


def mascara(im, forma, r=0.18):
    n = im.size[0]
    m = Image.new('L', (n * 4, n * 4), 0)
    d = ImageDraw.Draw(m)
    if forma == 'circulo':
        d.ellipse((0, 0, n * 4 - 1, n * 4 - 1), fill=255)
    else:
        d.rounded_rectangle((0, 0, n * 4 - 1, n * 4 - 1), radius=int(n * 4 * r), fill=255)
    m = m.resize((n, n), Image.LANCZOS)
    o = Image.new('RGBA', (n, n), (0, 0, 0, 0))
    o.paste(im.convert('RGBA'), (0, 0), m)
    return o


def arranque(ruta, icono):
    w, h = Image.open(ruta).size
    c = Image.new('RGB', (w, h), FONDO_APP)
    s = int(min(w, h) * 0.42)
    ic = mascara(icono.resize((s, s), Image.LANCZOS), 'esquinas')
    c.paste(ic, ((w - s) // 2, (h - s) // 2), ic)
    c.save(ruta)


GRANDE = escena(1024)
MASCARA = escena(1024, zoom=1.1, cx=0.6, cy=0.3)   # con margen para los iconos «maskable»

# Android: icono adaptable (todo el dibujo de fondo, primer plano vacío), cuadrado con esquinas y redondo
for d, n in {'ldpi': 36, 'mdpi': 48, 'hdpi': 72, 'xhdpi': 96, 'xxhdpi': 144, 'xxxhdpi': 192}.items():
    base = f'android/app/src/main/res/mipmap-{d}/'
    im = GRANDE.resize((n, n), Image.LANCZOS)
    mascara(im, 'esquinas').save(base + 'ic_launcher.png')
    mascara(im, 'circulo').save(base + 'ic_launcher_round.png')
    im.save(base + 'ic_launcher_background.png')
    Image.new('RGBA', (n, n), (0, 0, 0, 0)).save(base + 'ic_launcher_foreground.png')
GRANDE.save('assets/icon-only.png')
GRANDE.save('assets/icon-background.png')
Image.new('RGBA', (1024, 1024), (0, 0, 0, 0)).save('assets/icon-foreground.png')

# Web, catálogo «Más juegos», página de descarga y Google Play
MASCARA.resize((512, 512), Image.LANCZOS).save('www/icons/icon-maskable-512.png')
for ruta, n in [('www/icons/icon-512.png', 512), ('www/icons/icon-192.png', 192), ('www/icons/apple-touch-icon.png', 180),
                ('www/juegos/martin.png', 192), ('docs/icon.png', 512), ('play-store/icono-512.png', 512)]:
    GRANDE.resize((n, n), Image.LANCZOS).save(ruta)

# Pantallas de arranque
for ruta in glob.glob('android/app/src/main/res/drawable*/splash.png') + ['assets/splash.png', 'assets/splash-dark.png']:
    arranque(ruta, GRANDE)

# Gráfico destacado de Google Play (1024×500): paisaje, Martín a la derecha y el título
W, H = 1024, 500
k = max(W / PAISAJE.width, H / PAISAJE.height)
g = PAISAJE.resize((int(PAISAJE.width * k), int(PAISAJE.height * k)), Image.LANCZOS).crop((200, 0, 200 + W, H))
sombra = Image.new('RGBA', (W, H), (0, 0, 0, 0))
ImageDraw.Draw(sombra).rectangle((0, 0, int(W * 0.62), H), fill=(20, 10, 6, 120))
sombra = sombra.filter(ImageFilter.GaussianBlur(60))
g = Image.alpha_composite(g.convert('RGBA'), sombra)
z = H * 1.02 / 560
sp = CAMELLO.resize((int(551 * z), int(560 * z)), Image.LANCZOS)
g.paste(sp, (W - sp.width - 10, H - sp.height + 8), sp)
d = ImageDraw.Draw(g)
f1 = ImageFont.truetype('/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf', 112)
f2 = ImageFont.truetype('/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf', 40)
for (x, y, t, f, col) in [(56, 120, 'Martín', f1, (255, 255, 255)), (60, 268, 'Los Caminos del Volcán', f2, (255, 214, 120))]:
    d.text((x + 3, y + 4), t, font=f, fill=(0, 0, 0, 150))
    d.text((x, y), t, font=f, fill=col)
g.convert('RGB').save('play-store/grafico-destacado-1024x500.png')
print('Listo: iconos, arranque y gráfico destacado')
