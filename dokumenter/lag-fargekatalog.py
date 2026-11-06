"""Lager dokumenter/fargekatalog.html - oversikten over alle farger og
bakgrunner i Neam.

Kjoeres fra repo-rota, etter at farger eller bakgrunner er endret:

    python dokumenter/lag-fargekatalog.py

Leser alle sidene og fellesfilene og finner tre ting:

  1. Variablene (--navn: verdi) - der de er satt, hva de betyr og hvor
     de brukes.
  2. Hardkodede farger - hex, rgb() og hsl() skrevet rett i koden, med
     fil og linje og den variabelen de ligger naermest.
  3. Bakgrunnene - gradienter og bilder.

Ingenting her endrer en farge. Katalogen er kartet; endringene bestilles
derfra og gjoeres i koden."""

import glob
import json
import os
import re

ROT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROT)
UT = 'dokumenter/fargekatalog.html'

KODEFILER = sorted(glob.glob('*.html') + glob.glob('*.js') + glob.glob('*.css'))
KODE = {f: open(f, encoding='utf8').read() for f in KODEFILER}


def blankt(m):
    """Kommentaren blir mellomrom, men linjeskiftene staar - da stemmer
    linjenumrene fortsatt med fila."""
    return re.sub(r'[^\n]', ' ', m.group(0))


def uten_kommentarer(s):
    s = re.sub(r'/\*.*?\*/', blankt, s, flags=re.S)
    s = re.sub(r'<!--.*?-->', blankt, s, flags=re.S)
    return re.sub(r'(?m)^[ \t]*//.*$', blankt, s)


REN = {f: uten_kommentarer(s) for f, s in KODE.items()}


def linje_nr(s, pos):
    return s.count('\n', 0, pos) + 1


def linje_tekst(s, pos):
    a = s.rfind('\n', 0, pos) + 1
    b = s.find('\n', pos)
    t = s[a:b if b >= 0 else len(s)].strip()
    return t if len(t) <= 160 else t[:157] + '…'


# ----------------------------------------------------------------------
# CSS-omraadene: .css-filene hele, og <style>-blokkene i sidene. Alt annet
# er HTML eller JavaScript, og der finnes ingen velger aa lese.
# ----------------------------------------------------------------------
def css_omraader(f, s):
    if f.endswith('.css'):
        return [(0, len(s))]
    if f.endswith('.html'):
        return [(m.start(1), m.end(1)) for m in re.finditer(r'<style[^>]*>(.*?)</style>', s, re.S)]
    return []


def blokker(s, fra, til):
    """Hvert tegn i CSS-omraadet faar velgeren og @media-en det staar i.
    Returnerer en liste med (start, slutt, velger, media) for hver blokk."""
    ut, stabel, start = [], [], fra
    i = fra
    while i < til:
        c = s[i]
        if c == '{':
            velger = re.sub(r'\s+', ' ', s[start:i]).strip()
            stabel.append((velger, i + 1))
            start = i + 1
        elif c == '}':
            if stabel:
                velger, b = stabel.pop()
                media = ' '.join(v for v, _ in stabel if v.startswith('@'))
                ut.append((b, i, velger, media))
            start = i + 1
        elif c == ';':
            start = i + 1
        i += 1
    return ut


def blokk_for(bl, pos):
    """Den innerste blokken som inneholder pos."""
    beste = None
    for b, e, v, m in bl:
        if b <= pos <= e and (beste is None or b > beste[0]):
            beste = (b, e, v, m)
    return beste


# ----------------------------------------------------------------------
# Fargene
# ----------------------------------------------------------------------
HEX = r'#(?:[0-9A-Fa-f]{8}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{3,4})(?![0-9A-Za-z_-])'
FUNK = r'(?:rgba?|hsla?)\([^()]*\)'
FARGE = re.compile('(' + HEX + '|' + FUNK + ')')


def hex_til_rgba(h):
    h = h.lstrip('#')
    if len(h) in (3, 4):
        h = ''.join(c * 2 for c in h)
    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    a = int(h[6:8], 16) / 255 if len(h) == 8 else 1
    return r, g, b, a


def til_rgba(v):
    """(r, g, b, a) for en farge, eller None for det som ikke kan leses
    (hsl, eller rgb med variabler i)."""
    v = v.strip()
    if v.startswith('#'):
        return hex_til_rgba(v)
    m = re.match(r'rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+%?))?\s*\)$', v)
    if not m:
        return None
    a = m.group(4)
    if a is None:
        a = 1
    elif a.endswith('%'):
        a = float(a[:-1]) / 100
    else:
        a = float(a)
    return int(float(m.group(1))), int(float(m.group(2))), int(float(m.group(3))), a


def normaliser(v):
    """Samme farge skal havne paa samme kort: #fff og #FFFFFF er én."""
    rgba = til_rgba(v)
    if rgba is None:
        return re.sub(r'\s+', '', v.lower())
    r, g, b, a = rgba
    if a >= 1:
        return '#%02X%02X%02X' % (r, g, b)
    return 'rgba(%d,%d,%d,%s)' % (r, g, b, ('%.3f' % a).rstrip('0').rstrip('.'))


def er_farge_her(s, m):
    """En hex kan ogsaa vaere en id-velger (#tom{), et anker (href="#fe")
    eller et tegn (&#039;). Bare det som staar der en verdi staar, telles."""
    if m.group(0).startswith('#'):
        foer = s[max(0, m.start() - 12):m.start()]
        etter = s[m.end():m.end() + 3]
        if foer.endswith('&') or re.search(r'href=["\']$', foer):
            return False
        if re.match(r'\s*\{', etter):
            return False
        if re.search(r'(querySelector(All)?|closest|matches)\(\s*["\']$', foer):
            return False
    return True


# ----------------------------------------------------------------------
# Variablene
# ----------------------------------------------------------------------
DEF = re.compile(r'(?<![\w-])(--[A-Za-z0-9_-]+)\s*:\s*([^;{}]+?)\s*(?=[;}])')
FARGEAKTIG = re.compile(HEX + '|' + FUNK + r'|gradient\(|url\(|\btransparent\b|\bcurrentColor\b')


def kommentar_til(s, pos):
    """Kommentaren som hoerer til en definisjon: den paa samme linje, ellers
    den som staar rett over (bare mellomrom mellom)."""
    slutt = s.find('\n', pos)
    linja = s[pos:slutt if slutt >= 0 else len(s)]
    m = re.search(r'/\*(.*?)\*/', linja, re.S)
    if m:
        return re.sub(r'\s+', ' ', m.group(1)).strip()
    foer = s[:s.rfind('\n', 0, pos) + 1]
    m = re.search(r'/\*((?:(?!\*/).)*?)\*/\s*$', foer, re.S)
    if m:
        t = re.sub(r'\s+', ' ', m.group(1)).strip()
        t = re.sub(r'^-+\s*|\s*-+$', '', t)
        return t
    return ''


defs = {}         # navn -> [definisjoner]
for f in KODEFILER:
    s, r = KODE[f], REN[f]
    for fra, til in css_omraader(f, r):
        bl = blokker(r, fra, til)
        for m in DEF.finditer(r, fra, til):
            blokk = blokk_for(bl, m.start())
            defs.setdefault(m.group(1), []).append({
                'fil': f, 'linje': linje_nr(r, m.start()), 'verdi': m.group(2).strip(),
                'velger': blokk[2] if blokk else '', 'media': blokk[3] if blokk else '',
                'kommentar': kommentar_til(s, m.start()),
            })

# Fargevariabler: verdien er en farge, eller en annen fargevariabel.
fargevar = {n for n, d in defs.items() if any(FARGEAKTIG.search(x['verdi']) for x in d)}
while True:
    nye = {n for n, d in defs.items() if n not in fargevar
           and any(re.fullmatch(r'var\(\s*(--[\w-]+)\s*(,[^)]*)?\)', x['verdi'])
                   and re.match(r'var\(\s*(--[\w-]+)', x['verdi']).group(1) in fargevar for x in d)}
    if not nye:
        break
    fargevar |= nye

# Designsystemet: tabellradene med `--navn` i foerste celle.
DS = sorted(glob.glob('dokumenter/neam-designsystem-*.md'),
            key=lambda p: int(re.search(r'(\d+)\.md$', p).group(1)))[-1]
ds_tekst = open(DS, encoding='utf8').read()
ds_rad = {}
for m in re.finditer(r'(?m)^\|([^\n]*)\|\s*$', ds_tekst):
    celler = [c.strip() for c in m.group(1).split('|')]
    # Bare rader som begynner med variabelen - omdoepingstabellene har
    # gamle navn og «dashboards --bg-2» i foerste celle og skal ikke med.
    navn = re.findall(r'`(--[\w-]+)`', celler[0]) if celler[0].startswith('`--') else []
    if not navn or len(celler) < 2 or not celler[-1].strip():
        continue
    verdi = re.findall(r'`(#[0-9A-Fa-f]{3,8})`', ' '.join(celler[:2]))
    tekst = re.sub(r'\*\*|`', '', celler[-1]).strip()
    for n in navn:
        ds_rad.setdefault(n, (tekst, verdi[0].upper() if verdi else ''))


def hovedfil(d):
    """Den definisjonen som er «hjemmet»: felles-rot.css foer andre
    fellesfiler, fellesfiler foer sidene, utenfor @media foer inni."""
    def rang(x):
        return (0 if x['fil'] == 'felles-rot.css' else 1 if x['fil'].startswith('felles-') else 2,
                1 if x['media'] else 0, x['fil'], x['linje'])
    return sorted(d, key=rang)[0]


def bruk_av(navn):
    moenster = re.compile(r'var\(\s*' + re.escape(navn) + r'\s*[,)]')
    ut = {}
    for f in KODEFILER:
        n = len(moenster.findall(REN[f]))
        if n:
            ut[f] = n
    return ut


variabler = []
for navn in sorted(fargevar):
    d = defs[navn]
    hoved = hovedfil(d)
    bruk = bruk_av(navn)
    ds, ds_verdi = ds_rad.get(navn, ('', ''))
    verdi_norm = normaliser(hoved['verdi']) if til_rgba(hoved['verdi']) else ''
    variabler.append({
        'id': 'v:' + navn, 'navn': navn, 'verdi': hoved['verdi'], 'hex': verdi_norm,
        'fil': hoved['fil'], 'linje': hoved['linje'], 'velger': hoved['velger'],
        'felles': hoved['fil'].startswith('felles-'),
        'defs': d, 'bruk': bruk, 'antall': sum(bruk.values()),
        'betydning': ds or hoved['kommentar'], 'fraDs': bool(ds),
        'kommentar': hoved['kommentar'],
        'dsVerdi': ds_verdi,
        'avvik': bool(ds_verdi and verdi_norm and ds_verdi != verdi_norm),
    })

# Variablene som kan sammenlignes med en hardkodet farge: de med én
# ugjennomsiktig verdi, i fellesfilene foerst.
SAMMENLIGN = [(v['navn'], til_rgba(v['hex'])) for v in variabler if v['hex'].startswith('#')]


def naermest(rgba):
    if rgba is None or not SAMMENLIGN:
        return None
    r, g, b, a = rgba
    beste = None
    for navn, (r2, g2, b2, _) in SAMMENLIGN:
        # Vektet etter hvor foelsomt oeyet er for hver kanal.
        d = ((2 * (r - r2) ** 2 + 4 * (g - g2) ** 2 + 3 * (b - b2) ** 2) / 9) ** .5
        if beste is None or d < beste[1]:
            beste = (navn, d)
    if beste[1] > 30:
        return None     # ingen variabel ligger i naerheten
    return {'navn': beste[0], 'avstand': round(beste[1], 1), 'alfa': round(a, 3)}


# ----------------------------------------------------------------------
# Hardkodede farger og bakgrunner
# ----------------------------------------------------------------------
hard = {}
bakgrunner = []
BAKGRUNN = re.compile(r'(?<![\w-])(background(?:-image|-color)?)\s*:\s*')


def hele_verdien(r, i):
    """Verdien fra i til ; eller } - men ikke de inne i parenteser eller
    anfoerselstegn: en data-URL har ; i seg, og en gradient kan gaa over
    flere linjer."""
    dybde, sitat, j = 0, '', i
    while j < len(r):
        c = r[j]
        if sitat:
            if c == sitat:
                sitat = ''
        elif c in '"\'' and dybde:
            sitat = c
        elif c == '(':
            dybde += 1
        elif c == ')':
            dybde -= 1
        elif c in ';}' and dybde <= 0:
            break
        elif c in '"\'' and not dybde:
            break       # slutten paa en JavaScript-streng
        j += 1
    return re.sub(r'\s+', ' ', r[i:j]).strip()


def egenskap_foer(r, pos, fra):
    """CSS-egenskapen en verdi staar i: teksten mellom siste ; eller { og :."""
    a = max(r.rfind(';', fra, pos), r.rfind('{', fra, pos), r.rfind('\n', fra, pos))
    m = re.search(r'([\w-]+)\s*:[^:]*$', r[a + 1:pos])
    if m:
        return m.group(1)
    m = re.search(r'([\w-]+)\s*=\s*["\']?$', r[max(fra, pos - 30):pos])
    return m.group(1) if m else ''


for f in KODEFILER:
    s, r = KODE[f], REN[f]
    omr = css_omraader(f, r)
    bl = [b for fra, til in omr for b in blokker(r, fra, til)]

    skr = ([(0, len(r))] if f.endswith('.js') else
           [(m.start(1), m.end(1)) for m in re.finditer(r'<script[^>]*>(.*?)</script>', r, re.S)])

    def i_css(pos):
        return any(fra <= pos < til for fra, til in omr)

    def i_skript(pos):
        return any(fra <= pos < til for fra, til in skr)

    for m in FARGE.finditer(r):
        if not er_farge_her(r, m) or re.search(r"['\"+]", m.group(0)):
            continue        # rgba(' + r + ...) bygges av JavaScript - ingen fast farge
        pos = m.start()
        css = i_css(pos)
        egenskap = egenskap_foer(r, pos, 0)
        if egenskap.startswith('--'):
            continue        # en variabel som settes - den staar under Variablene
        if css:
            blokk = blokk_for(bl, pos)
            if blokk is None:
                continue    # ikke inne i en regel: en id-velger, ikke en farge
            velger = blokk[2]
        else:
            velger = ''
        verdi = normaliser(m.group(0))
        post = hard.setdefault(verdi, {'id': 'h:' + verdi, 'verdi': verdi, 'steder': []})
        post['steder'].append({'fil': f, 'linje': linje_nr(r, pos), 'egenskap': egenskap,
                               'velger': velger, 'utdrag': linje_tekst(s, pos),
                               'sted': 'css' if css else 'js' if i_skript(pos) else 'html'})

    for m in BAKGRUNN.finditer(r):
        pos = m.start()
        verdi = hele_verdien(r, m.end())
        blokk = blokk_for(bl, pos) if i_css(pos) else None
        # Gradienter og bilder overalt; sidebakgrunnen (html og body) ogsaa
        # naar den er en ren farge.
        side = bool(blokk and re.match(r'(html|body)\b', blokk[2]))
        if not (side or re.search(r'gradient\(|url\(', verdi)):
            continue
        bakgrunner.append({
            'id': 'b:%s:%d' % (f, linje_nr(r, pos)), 'fil': f, 'linje': linje_nr(r, pos),
            'egenskap': m.group(1), 'verdi': verdi,
            'velger': blokk[2] if blokk else '', 'media': blokk[3] if blokk else '',
            'utdrag': linje_tekst(s, pos),
        })

# Sidebakgrunnen settes ogsaa som variabel - den hoerer med blant bakgrunnene.
for v in variabler:
    if re.search(r'gradient\(|url\(', v['verdi']) or 'bakgrunn' in v['navn']:
        for d in v['defs']:
            bakgrunner.append({
                'id': 'b:%s:%d' % (d['fil'], d['linje']), 'fil': d['fil'], 'linje': d['linje'],
                'egenskap': v['navn'], 'verdi': d['verdi'], 'velger': d['velger'], 'media': d['media'],
                'utdrag': v['navn'] + ':' + d['verdi'],
            })
# Sidebakgrunnen i felles-rot.css foerst - den gjelder alle sidene.
bakgrunner.sort(key=lambda b: (0 if b['fil'] == 'felles-rot.css' and re.match(r'(html|body)\b', b['velger']) else
                               1 if b['fil'].startswith('felles-') else 2, b['fil'], b['linje']))

hardliste = []
for verdi, p in hard.items():
    rgba = til_rgba(verdi)
    p['antall'] = len(p['steder'])
    p['filer'] = sorted({x['fil'] for x in p['steder']})
    p['naer'] = naermest(rgba)
    p['lik'] = bool(p['naer'] and p['naer']['avstand'] == 0)
    hardliste.append(p)
hardliste.sort(key=lambda p: (-p['antall'], p['verdi']))

# ----------------------------------------------------------------------
# Siden
# ----------------------------------------------------------------------
# Alle variablenes verdier, saa forhaandsvisningene kan bruke var(--x).
rot_verdier = {v['navn']: v['verdi'] for v in variabler}
for n, d in defs.items():
    rot_verdier.setdefault(n, hovedfil(d)['verdi'])

data = {
    'variabler': variabler, 'hard': hardliste, 'bakgrunner': bakgrunner,
    'rot': rot_verdier, 'ds': DS.replace('\\', '/'),
}
antall_steder = sum(p['antall'] for p in hardliste)
like = sum(p['antall'] for p in hardliste if p['lik'])
mal = open(os.path.join('dokumenter', 'fargekatalog-mal.html'), encoding='utf8').read()
side = (mal.replace('/*DATA*/null', json.dumps(data, ensure_ascii=False).replace('</', '<\\/'))
           .replace('{{VARIABLER}}', str(len(variabler)))
           .replace('{{HARD}}', str(antall_steder))
           .replace('{{HARD_ULIKE}}', str(len(hardliste)))
           .replace('{{LIKE}}', str(like))
           .replace('{{BAKGRUNNER}}', str(len(bakgrunner)))
           .replace('{{AVVIK}}', str(sum(1 for v in variabler if v['avvik']))))
open(UT, 'w', encoding='utf8', newline='\n').write(side)
print('%s: %d variabler, %d hardkodede (%d ulike, %d lik en variabel), %d bakgrunner, %d avvik fra designsystemet'
      % (UT, len(variabler), antall_steder, len(hardliste), like, len(bakgrunner),
         sum(1 for v in variabler if v['avvik'])))
