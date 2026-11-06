"""Lager dokumenter/bildekatalog.html - oversikten over alle bilder i Neam.

Kjoeres fra repo-rota, etter at bilder er lagt til, byttet eller koblet inn:

    python dokumenter/lag-bildekatalog.py

Leser alle bildemappene, finner hvor hvert bilde brukes i koden, og skriver
katalogen paa nytt. Ingenting her endrer et bilde. Krever Pillow (maal i px:
CLAUDE.md vil ha width og height paa alle <img>).

Tekstene som IKKE kan leses ut av koden - motivbeskrivelser og stilene til
bestillingene - staar i tabellene under, og er stedet aa rette dem."""

import glob
import hashlib
import html
import json
import os
import re
import sys

try:
    from PIL import Image
except ImportError:
    sys.exit('Pillow mangler: python -m pip install --user pillow')

ROT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROT)
UT = 'dokumenter/bildekatalog.html'

# ----------------------------------------------------------------------
# Stilene. Stilblokken er engelsk fordi bildemodellene treffer best paa
# det - samme form som bilder/kort/motiv-bestilling.txt. Den limes inn
# uendret hver gang, saa alt som bestilles i samme stil blir likt.
# ----------------------------------------------------------------------
STILER = {
    'flis': {
        'navn': 'Flis',
        'bruk': 'Områder og apper, knapper i fireren, fliser på forsiden.',
        'format': 'PNG, 512 × 512, gjennomsiktig utenfor flisa',
        'mappe': 'bilder/ikoner/',
        'stil': (
            'Soft 3D clay-style icon, centred on a rounded-square tile in one light pastel '
            'colour (corner radius about 18 % of the tile). One single subject that fills about '
            '65 % of the tile. Gentle light from the upper left, a soft shadow under the subject, '
            'smooth matte surfaces, calm pastel palette with deep navy (#1F2A3C) for the darkest '
            'details. Transparent background outside the tile. '
            'NO text, NO letters, NO numbers, NO border, NO frame, NO watermark.'),
    },
    'robot': {
        'navn': 'Robotflis',
        'bruk': 'Når Neam selv skal gjøre noe: planlagte apper, spill, logoer med personlighet.',
        'format': 'PNG, 768 × 768, gjennomsiktig utenfor flisa',
        'mappe': 'bilder/ikoner/',
        'stil': (
            'Soft 3D illustration of the mascot "Neam" on a rounded-square tile in one light '
            'pastel colour (corner radius about 18 %). Neam is a friendly retro robot: square, '
            'cream-coloured, slightly worn metal head with rivets; big round dark-brown eyes with '
            'brass rims; a wide smile with visible teeth; small brass ear discs; a short antenna '
            'with a red ball; a worn olive-green baseball cap with a red "N" patch; a cream chest '
            'plate with a big red "N"; segmented brass arms. Half body, facing the viewer, '
            'holding or using one prop that shows what the tile is for. Gentle light from the '
            'upper left. Transparent background outside the tile. '
            'NO text or letters except the N on the cap and the chest. NO border, NO watermark.'),
    },
    'strek': {
        'navn': 'Strekikon',
        'bruk': 'Små handlinger og kontroller: legg til, endre, lukk, kalender, kurv.',
        'format': 'PNG, 256 × 256, gjennomsiktig – ingen flis',
        'mappe': 'bilder/ikoner/',
        'stil': (
            'Flat colour icon with rounded, even dark-navy (#1F2A3C) outlines and muted fills: '
            'soft blue #8FB1D6, sage green #6E9E73, coral red #D9735F, warm yellow #F2C14E, '
            'cream #F6EEDC. One single subject, centred, filling about 80 % of the canvas. '
            'Transparent background, NO tile, NO drop shadow. '
            'NO text, NO letters, NO numbers, NO watermark.'),
    },
    'tilstand': {
        'navn': 'Tilstandsflis',
        'bruk': 'Enheter med tilstand (sikkerhet): samme motiv i normal, varsel og alarm.',
        'format': 'PNG, 512 × 512 per flis, tre fliser – én fil per tilstand',
        'mappe': 'bilder/ikoner/sikkerhet/',
        'stil': (
            'Three versions of the same soft 3D clay-style icon, each on its own rounded-square '
            'tile, the subject placed identically on all three: '
            '1) pale green tile with a small green round badge with a white check mark at the '
            'bottom right (normal); 2) pale yellow tile with an orange round badge with a white '
            '"!" (warning); 3) pale red tile with a red round badge with a white bell (alarm). '
            'Gentle light from the upper left. Transparent background outside the tiles, clear '
            'space between them. NO other text, NO letters, NO border, NO watermark.'),
    },
    'avatar': {
        'navn': 'Avatar',
        'bruk': 'Personene i huset.',
        'format': 'PNG, 512 × 512, gjennomsiktig utenfor flisa',
        'mappe': 'bilder/avatarer/',
        'stil': (
            'Rounded-square tile in a very light pastel tint of the person colour, with a subtle '
            'gradient and a thin glossy arc in the upper-left corner. One big, rounded, bold '
            'sans-serif capital letter in the person colour, centred. Soft and clean. '
            'Transparent background outside the tile. NO other text, NO border, NO watermark.'),
    },
    'vare': {
        'navn': 'Varebilde',
        'bruk': 'Varer i handlelista.',
        'format': 'WEBP, 192 × 192 (gjerne levert i 384 × 384), gjennomsiktig',
        'mappe': 'vareikoner/',
        'stil': (
            'Realistic product illustration of a typical Norwegian grocery or household item as '
            'it looks in the shop, front view, centred, filling about 85 % of the canvas, soft '
            'even studio light. Transparent background. NO extra text added, NO watermark.'),
    },
    'foto': {
        'navn': 'Kortmotiv',
        'bruk': 'Grunnstoffkortene. Egen bestilling: bilder/kort/motiv-bestilling.txt.',
        'format': 'WEBP, minst 1024 × 1024',
        'mappe': 'bilder/kort/motiv/',
        'stil': (
            'Photographic macro product shot on a dark laboratory bench. Cool cyan and '
            'steel-blue rim lighting from the upper left, deep shadows, shallow depth of field, '
            'subject centred and filling the frame, square 1:1 composition, high detail, no '
            'people. NO text, NO letters, NO numbers, NO labels, NO watermarks, NO logos, '
            'NO card frame, NO border, NO UI elements.'),
    },
}
# Bildetyper som IKKE bestilles fra AI.
IKKE_AI = {
    'logo': 'Logoen er fast. Endres bare som et bevisst valg, ikke som bestilling.',
    'butikk': 'Butikkens egen logo – hentes fra butikken, lages ikke av AI.',
    'gammel': 'Gammel stil (steampunk). Bestill på nytt i en av stilene over.',
    'svg': 'Strektegning i koden.',
    'tekstur': 'Bakgrunn eller tekstur, ikke et ikon.',
}

# ----------------------------------------------------------------------
# Motivene: det som ikke kan leses ut av koden. Brukes som standardtekst
# naar man trykker «Bestill nytt».
# ----------------------------------------------------------------------
MOTIV = {
    # Ikonarket (strek)
    'hjem': 'Lite hus med rød takstein og blå dør',
    'kjokken-dash': 'Lyseblått kjøleskap med to dører',
    'kalender': 'Kalenderblad med rød topp og blå datoruter',
    'ny-avtale': 'Kalenderblad med et grønt pluss nederst til høyre',
    'ukeplan': 'Kalender med fargede kolonner (uke)',
    'handleliste': 'Grønn handlekurv',
    'matlaging': 'Blå kjele med damp',
    'fag': 'Åpen bok',
    'lekse': 'Ark med tekstlinjer og en grønn hake',
    'spill': 'Spillkontroll',
    'paaminnelse': 'Korallrød bjelle',
    'enheter': 'Gul lyspære med stråler',
    'apper': 'Fire fargede ruter i to rader',
    'sikkerhet': 'Grønt skjold med hvit hake',
    'laas': 'Blå hengelås',
    'neamow': 'Robotgressklipper ovenfra, grønn og grå',
    'vaer': 'Sol bak en hvit sky',
    'sted': 'Rød kartnål',
    'legg-til': 'Grønt pluss',
    'endre': 'Gul blyant',
    'slett': 'Korallrød søppelbøtte',
    'send-til': 'Boks med en blå pil som går ut',
    'lim-inn': 'Utklippstavle med tekstlinjer',
    'skann-ark': 'Ark med skannerhjørner rundt',
    'oppdater': 'To piler i sirkel, grønn og blå',
    'snakk': 'Lilla mikrofon',
    'innstillinger': 'Tre glidebrytere',
    'logg-ut': 'Dør med en korallrød pil ut',
    'ferdig': 'Grønn hake',
    'lukk': 'Korallrødt kryss',
    # Flisarket
    'familie': 'Hus med familie (to figurer) og et hjerte',
    'emma': 'Stor lilla bokstav E',
    'andrea': 'Stor rosa bokstav A',
    'avbryt': 'Korallrødt kryss',
    'husregister': 'Hus med et hjerte',
    'i-dag': 'Kalenderblad med tallet 1',
    'denne-uken': 'Ukekalender med rosa rad',
    'timeplan': 'Timeplan-tabell med fargede kolonnehoder',
    'rediger-fag': 'Tekstlinjer med en blyant',
    'slett-ukas-lekser': 'Rød søppelbøtte',
    'prove': 'Dokument med en grønn hake',
    'hent-fra-nett': 'Blå sky med pil ned',
    'se-paa-nett': 'Grønn boks med pil ut',
    'roligheden': 'Skolebygning med rødt tak og flagg',
    'system': 'Skjerm med tannhjul',
    'klokkespill': 'Rød veggklokke',
    # Robotflisene
    'neam': 'gives a thumbs up with one hand',
    'arbeidsoppgaver': 'holds a clipboard with a checklist and a pencil',
    'bil': 'holds up a car key; a small blue car behind him',
    'bilder': 'holds a camera up in front of him',
    'kvitteringer': 'points at a long paper receipt in his hand',
    'okonomi': 'holds a calculator; a stack of coins beside him',
    'mattespill': 'holds a small chalkboard that says 3+2',
    'diktat': 'reads from a red book with "Aa" on the cover; a speech bubble with "Aa"',
    # Sikkerhet
    'kamera-tunet': 'Hvitt overvåkingskamera på veggfeste',
    'ytterdor': 'Hengelås (fargen er tilstanden: blå ulåst, grønn låst, gul ingen kontakt, rød åpen dør)',
    'royk': 'Hvit røykvarsler i taket med røykkrøller under',
    'vann': 'Blå vanndråpe',
    'varme': 'Termometer med varmestriper',
    # Avatarer
    'magne': 'Bokstaven M i rødt (#B42A2F)',
    'nina': 'Bokstaven N i varm grå-brun (#6B5D4D)',
    'emma_avatar': 'Bokstaven E i lilla (#6A3FA0)',
    'andrea_avatar': 'Bokstaven A i rosa (#B93479)',
}

# Robotflisene - samme mappe som de andre flisene.
ROBOT = {'neam', 'arbeidsoppgaver', 'bil', 'bilder', 'kvitteringer', 'okonomi',
         'mattespill', 'diktat'}

FAGNAVN = {
    'engelsk': 'Engelsk', 'innsats-for-andre': 'Innsats for andre', 'krle': 'KRLE',
    'kroppsoving': 'Kroppsøving', 'kunst-og-handverk': 'Kunst og håndverk',
    'mat-og-helse': 'Mat og helse', 'matematikk': 'Matematikk', 'musikk': 'Musikk',
    'naturfag': 'Naturfag', 'norsk': 'Norsk', 'samfunnsfag': 'Samfunnsfag',
    'spansk': 'Spansk', 'utdanningsvalg': 'Utdanningsvalg', 'glemsk-robot': 'Glemsk robot',
}

# ----------------------------------------------------------------------
# Koden som leses for aa finne bruken
# ----------------------------------------------------------------------
KODEFILER = sorted(glob.glob('*.html') + glob.glob('*.js') + glob.glob('*.css'))
KODE = {f: open(f, encoding='utf8').read() for f in KODEFILER}


def uten_kommentarer(s):
    """Bruken skal leses av koden, ikke av kommentarene - en kommentar om
    et fjernet bilde er ikke bruk av det."""
    s = re.sub(r'/\*.*?\*/', '', s, flags=re.S)
    s = re.sub(r'<!--.*?-->', '', s, flags=re.S)
    return re.sub(r'(?m)^\s*//.*$', '', s)


KODE_REN = {f: uten_kommentarer(s) for f, s in KODE.items()}


def brukt_i(moenstre):
    """Filene der minst ett av moenstrene (regex) finnes."""
    ut = []
    for f, s in KODE_REN.items():
        if any(re.search(m, s) for m in moenstre):
            ut.append(f)
    return ut


strek_m = re.search(r'const NEAM_IKON_STREK = \[(.*?)\];', KODE.get('felles-neam.js', ''), re.S)
STREK = set(re.findall(r"'([a-z-]+)'", strek_m.group(1))) if strek_m else set()
fra_m = re.search(r'const NEAM_IKON_FRA = \{(.*?)\};', KODE.get('felles-neam.js', ''), re.S)
IKON_FRA = {}
if fra_m:
    for gml, ny in re.findall(r"'([a-z-]+)'\s*:\s*'([a-z-]+)'", fra_m.group(1)):
        IKON_FRA[ny] = gml          # nytt filnavn -> navnet kallstedet bruker

# Oppslagstabellene i handlelista: fil -> varenavn / butikknavn
hl = KODE.get('handleliste.html', '')
VARENAVN = {}
for navn, fil in re.findall(r'"([^"]+)":\s*"vareikoner/([^"]+)"', hl):
    VARENAVN.setdefault(fil, []).append(navn)
BUTIKKNAVN = {}
bl = re.search(r'const BUTIKK_LOGO = \{(.*?)\};', hl, re.S)
if bl:
    for navn, fil in re.findall(r'"([^"]+)":\s*"([^"]+)"', bl.group(1)):
        BUTIKKNAVN.setdefault(fil, []).append(navn)
VARE_DEFAULT = re.search(r"const VARE_BILDE_DEFAULT = '([^']+)'", hl)
BUTIKK_DEFAULT = re.search(r"const BUTIKK_LOGO_DEFAULT = '([^']+)'", hl)


def er_strek(sti):
    """Strekikon eller flis? En flis er ugjennomsiktig midt paa venstre
    kant; et strekikon har luft der. Leses av bildet, ikke av en liste,
    saa ikoner som ikke er koblet inn ennaa ogsaa havner riktig."""
    try:
        with Image.open(sti) as im:
            if im.mode != 'RGBA':
                return False
            b, h = im.size
            return im.getpixel((1, h // 2))[3] < 20 and im.getpixel((b // 2, 1))[3] < 20
    except Exception:
        return False


def maal(sti):
    try:
        with Image.open(sti) as im:
            return im.size
    except Exception:
        return (0, 0)


def post(sti, navn, stil, motiv='', merknad='', status=None, bruk=None, ekstra=None):
    b, h = maal(sti) if os.path.exists(sti) else (0, 0)
    bruk = bruk if bruk is not None else []
    if status is None:
        status = 'i bruk' if bruk else 'ikke i bruk'
    p = {
        'sti': '/' + sti.replace('\\', '/'), 'fil': os.path.basename(sti), 'navn': navn,
        'stil': stil, 'motiv': motiv, 'merknad': merknad, 'status': status,
        'bruk': bruk, 'b': b, 'h': h,
        'kb': round(os.path.getsize(sti) / 1024) if os.path.exists(sti) else 0,
    }
    if ekstra:
        p.update(ekstra)
    return p


def pent(slug):
    return slug.replace('-', ' ').capitalize()


seksjoner = []
sett = set()          # filer som er plassert i en seksjon


def legg(sid, tittel, lapp, poster, apen=True):
    for p in poster:
        sett.add(p['sti'].lstrip('/'))
    seksjoner.append({'id': sid, 'tittel': tittel, 'lapp': lapp, 'poster': poster, 'apen': apen})


# ---- Logo og hjemskjerm ------------------------------------------------
logo = [
    post('bilder/ikoner/neam-logo.png', 'NEAM-logoen (rund)', 'logo',
         'NEAM i fire farger på kremhvit sirkel', bruk=brukt_i([r'neam-logo']),
         merknad='Øverst på forsiden og i venstre tommelknapp.'),
    post('bilder/neam-hjemskjerm.png', 'Hjemskjermikonet', 'logo',
         'NEAM i fire farger på kremhvitt kvadrat',
         bruk=brukt_i([r'neam-hjemskjerm\.png']),
         merknad='apple-touch-icon. Helt kvadrat med fylt bakgrunn – iOS runder hjørnene selv.'),
]
legg('logo', 'Logo og hjemskjerm', 'Fast identitet. Bestilles ikke på nytt uten et bevisst valg.', logo)

# ---- Ikonene i bilder/ikoner/ -------------------------------------------
def ikonbruk(navn):
    kall = [navn] + ([IKON_FRA[navn]] if navn in IKON_FRA else [])
    m = [r'/bilder/ikoner/%s\.png' % re.escape(navn)]
    for k in kall:
        m += [r"neamIkonImg\('%s'" % re.escape(k), r"knappMerke\('%s'\)" % re.escape(k),
              r"ikon:'%s'" % re.escape(k)]
    return brukt_i(m)


fliser, roboter, streker = [], [], []
for sti in sorted(glob.glob('bilder/ikoner/*.png')):
    navn = os.path.splitext(os.path.basename(sti))[0]
    if navn == 'neam-logo':
        continue
    motiv = MOTIV.get(navn, '')
    if navn in STREK or (navn not in ROBOT and er_strek(sti)):
        b, _ = maal(sti)
        streker.append(post(sti, pent(navn), 'strek', motiv, bruk=ikonbruk(navn),
                            merknad=('Lav oppløsning (%d px) – blir uskarp på iPad. Bestill i 256 px.' % b)
                            if b and b < 200 else ''))
    elif navn in ROBOT:
        roboter.append(post(sti, pent(navn), 'robot', motiv, bruk=ikonbruk(navn)))
    else:
        fliser.append(post(sti, pent(navn), 'flis', motiv, bruk=ikonbruk(navn)))
legg('robot', 'Robotfliser', 'Neam med et rekvisitt som viser hva flisa er for.', roboter)
legg('flis', 'Fliser', 'Ett motiv på pastellflis. Navnet står som tekst under, aldri i bildet.', fliser)
legg('strek', 'Strekikoner', 'Uten flis. Får en lys flis rundt seg i CSS (.ikon-strek) der de står alene.', streker)

# ---- Sikkerhet ---------------------------------------------------------
sik = []
sik_kode = KODE_REN.get('sikkerhet.html', '')
for sti in sorted(glob.glob('bilder/ikoner/sikkerhet/*.png')):
    navn = os.path.splitext(os.path.basename(sti))[0]
    type_ = navn.split('-')[0] if not navn.startswith('kamera') else 'kamera-tunet'
    bruk = ['sikkerhet.html'] if re.search(r"'%s'" % re.escape(navn), sik_kode) \
        or ('/bilder/ikoner/sikkerhet/%s.png' % navn) in sik_kode else []
    sik.append(post(sti, pent(navn), 'tilstand', MOTIV.get(type_, ''), bruk=bruk,
                    merknad='Kameraet vises som video på sikkerhetssida – flisa er ikke koblet inn.'
                            if navn.startswith('kamera') and not bruk else ''))
legg('sikkerhet', 'Sikkerhet – tilstandsfliser',
     'Én flis per type og tilstand. Rommet står som tekst under, fra Homey.', sik)

# ---- Avatarer ----------------------------------------------------------
av = []
for sti in sorted(glob.glob('bilder/avatarer/*.png')):
    navn = os.path.splitext(os.path.basename(sti))[0]
    av.append(post(sti, navn.capitalize(), 'avatar',
                   MOTIV.get(navn + '_avatar', MOTIV.get(navn, '')),
                   bruk=brukt_i([r'avatarer/%s' % re.escape(navn)]),
                   merknad='Ikke tatt i bruk ennå – venter på «Hvem står her?» og personlige temaer.'))
legg('avatar', 'Avatarer', 'Én per person, i personens farge.', av)

# ---- Fagmerkene --------------------------------------------------------
fag = []
for sti in sorted(glob.glob('bilder/fag/*.png')):
    navn = os.path.splitext(os.path.basename(sti))[0]
    bruk = [f for f in ('emma.html', 'andrea.html') if re.search(r"'%s'" % re.escape(navn), KODE_REN.get(f, ''))]
    fag.append(post(sti, FAGNAVN.get(navn, pent(navn)), 'gammel',
                    'Symbol for faget %s' % FAGNAVN.get(navn, pent(navn)).lower(),
                    status='trenger nytt' if bruk else 'ikke i bruk', bruk=bruk,
                    merknad='Gammel stil med navnet malt inn. Bestill som flis.' if bruk else '',
                    ekstra={'nystil': 'flis'}))
legg('fag', 'Fagmerker', 'Emma og Andrea dash. Gammel stil – står til nye fliser er laget.', fag)

# ---- Spillene ----------------------------------------------------------
spill = []
for sti in sorted(glob.glob('bilder/spill/*.webp')):
    navn = os.path.splitext(os.path.basename(sti))[0]
    bruk = brukt_i([re.escape(os.path.basename(sti))])
    spill.append(post(sti, pent(navn), 'gammel', '',
                      status='trenger nytt' if bruk else 'ikke i bruk', bruk=bruk,
                      merknad='Gammel stil, brukes inne i spillene.' if bruk else
                              'Erstattet av robotflisene.',
                      ekstra={'nystil': 'robot' if navn == 'robot' else 'flis'}))
legg('spill', 'Spillbilder', 'Logoene er erstattet; roboten, stjerna og batteriet brukes inne i spillene.', spill)

# ---- Andre bilder i bruk -------------------------------------------------
andre = []
for sti, navn, stil, merk in [
    ('bilder/symbol-neamow.png', 'Klippersymbolet', 'tekstur', 'Neamow-kartet, sett ovenfra.'),
    ('bilder/neamow-hage.webp', 'Hagebildet', 'tekstur', 'Bakgrunn i Neamow-kartet.'),
    ('bilder/kort/ramme.webp', 'Ramma på grunnstoffkortene', 'tekstur', 'Én ramme, teksten legges på av kort.html.'),
    ('bilder/deler/ror-glatt.png', 'Rørbit', 'tekstur', 'Brukes inne i matte- og klokkespillet.'),
]:
    andre.append(post(sti, navn, stil, '', merknad=merk,
                      bruk=brukt_i([re.escape(os.path.basename(sti))])))
legg('andre', 'Andre bilder', 'Bilder som ikke er ikoner.', andre)

# ---- Strektegninger i koden ----------------------------------------------
# Hva hver tegning er, noeklet paa hashen under (den staar i filnavnet
# svg-xxxxxxxx). Bestilles som strekikon og kobles inn i stedet for SVG-en.
# Tredje felt: motivet. Fjerde: merknad. Uten nytt filnavn bestilles den ikke.
# Endres en tegning, faar den ny hash og havner som «uten beskrivelse».
SVG_MOTIV = {
    'de032e6d': ('Les høyt', 'les-hoyt.png', 'Høyttaler med lydbølger – øv med opplesing.', ''),
    '77be3b17': ('Skriv ut', 'skriv-ut.png', 'Skriver med et ark – diktat på papir.', ''),
    'bde53739': ('Ta bilde', 'ta-bilde.png', 'Kamera – ta bilde av diktatet.', ''),
    '00613e73': ('Les klokka', 'les-klokka.png', 'Analog klokke med to visere.', ''),
    '79579545': ('Still klokka', 'still-klokka.png', 'Klokke med én viser som dras rundt.', ''),
    '42dcade1': ('Urskiva', '', '', 'Urskiva i klokkespillet – tegnes av koden, bestilles ikke.'),
    'b29aefde': ('Slett tall', 'slett-tegn.png', 'Tilbaketast: pil mot venstre med kryss i.', ''),
    '0c84bcf9': ('Dag', 'dag.png', 'Sol med stråler – dagtid i klokkespillet.', ''),
    '35138fb3': ('Natt', 'natt.png', 'Månesigd – kveld og natt i klokkespillet.', ''),
    '59a466cd': ('Last ned', 'last-ned.png', 'Pil ned mot en strek – last ned fil.', ''),
    'a51af6b0': ('Lukk', 'lukk.png', 'Kryss – lukk.', 'Strekikonet lukk.png finnes – kan kobles inn uten ny bestilling.'),
    'd00526eb': ('Sted', 'sted.png', 'Kartnål – stedet for været.', 'Strekikonet sted.png finnes – kan kobles inn uten ny bestilling.'),
    'c5382ba8': ('Påminnelser', 'paaminnelse.png', 'Bokmerke med pluss – ny påminnelse.', 'Strekikonet paaminnelse.png finnes – kan kobles inn uten ny bestilling.'),
    '2fa8dadd': ('Påminnelse denne uken', 'ny-avtale.png', 'Kalender med pluss.', 'Strekikonet ny-avtale.png finnes – kan kobles inn uten ny bestilling.'),
    'c7bdf352': ('Atomdefinisjoner', '', '', 'Usynlig: bare definisjoner for atomtegningene, ikke et ikon.'),
    '1fbf9b40': ('Grunnstoffer', 'grunnstoffer.png', 'Atom med tre elektronbaner rundt en kjerne.', ''),
    '4cde63eb': ('Naturfag', 'naturfag.png', 'Erlenmeyerkolbe med væske og bobler.', ''),
    '7b4e85cd': ('Skjold', 'sikkerhet.png', 'Skjold med hake.', 'Strekikonet sikkerhet.png finnes – kan kobles inn uten ny bestilling.'),
    'e81ba00a': ('Varsel', 'varsel.png', 'Varseltrekant med utropstegn.', ''),
    'bd645307': ('Flytt', 'flytt.png', 'Seks prikker i to kolonner – håndtak for å dra og flytte.', ''),
    '171c1249': ('Rommene', 'rommene.png', 'Lyspære – lys og enheter i rommene.', ''),
    '0d323d35': ('Snakk', 'snakk.png', 'Mikrofon – snakk til Neam.', 'Strekikonet snakk.png finnes – kan kobles inn uten ny bestilling.'),
    '288ad02b': ('Send', 'send.png', 'Pil mot høyre – send meldingen til Neam.', ''),
    'b3d4e5d1': ('Logg inn', 'logg-inn.png', 'Pil mot høyre inn mot en dør – logg inn.', ''),
    '48939684': ('Forrige', 'forrige.png', 'Vinkel mot venstre – bla bakover.', ''),
    'b137224f': ('Neste', 'neste.png', 'Vinkel mot høyre – bla fremover.', ''),
    '2a718cce': ('Snu telefonen', 'snu-telefonen.png', 'Mobil som vris fra stående til liggende, med pil.', ''),
    '99ee53d3': ('Kalendere', 'kalender.png', 'Kalenderblad.', 'Strekikonet kalender.png finnes – kan kobles inn uten ny bestilling.'),
    'b9d084bf': ('Oppdater', 'oppdater.png', 'Sirkelpil – oppdater.', 'Strekikonet oppdater.png finnes – kan kobles inn uten ny bestilling.'),
    '57cfc19a': ('Google Maps', '', '', 'Google Maps sin egen logo – merkevare, lages ikke av AI.'),
    '9733fab1': ('Lyd av', 'lyd-av.png', 'Høyttaler med kryss – lyd av.', ''),
    'ee82591c': ('Lyd på', 'lyd-paa.png', 'Høyttaler med lydbølger – lyd på.', ''),
}
svger = {}
for f, s in KODE.items():
    for m in re.finditer(r'<svg\b[^>]*>.*?</svg>', s, re.S):
        # Tegninger i JavaScript-strenger staar i biter: 'a' + 'b'. Bitene
        # skjoetes; det som fortsatt har variabler i seg, hoppes over.
        blokk = re.sub(r"""(['"])\s*\+\s*\1""", '', m.group(0))
        if "' +" in blokk or '" +' in blokk or '${' in blokk or "\\'" in blokk:
            continue
        norm = re.sub(r'\s+', ' ', blokk)
        nokkel = re.sub(r'\s(id|class|aria-[a-z]+|width|height|style|onclick)="[^"]*"', '', norm)
        h = hashlib.md5(nokkel.encode()).hexdigest()[:8]
        if h not in svger:
            svger[h] = {'svg': norm, 'bruk': set()}
        svger[h]['bruk'].add(f)
svgposter = []
for i, (h, v) in enumerate(sorted(svger.items(), key=lambda kv: sorted(kv[1]['bruk'])[0])):
    navn, nyfil, motiv, merk = SVG_MOTIV.get(h, (
        'Strektegning %d' % (i + 1), '', '',
        'Ny strektegning uten beskrivelse – før den inn i SVG_MOTIV i lag-bildekatalog.py.'))
    p = {'sti': '', 'fil': 'svg-' + h, 'navn': navn, 'stil': 'svg',
         'motiv': motiv, 'merknad': merk, 'status': 'i bruk', 'bruk': sorted(v['bruk']),
         'b': 0, 'h': 0, 'kb': 0, 'svg': v['svg']}
    if nyfil:
        p.update(nystil='strek', nyfil=nyfil)
    svgposter.append(p)
seksjoner.append({'id': 'svg', 'tittel': 'Strektegninger i koden', 'apen': False, 'poster': svgposter,
                  'lapp': 'SVG skrevet rett i sidene. De bestilles som strekikoner og kobles inn i stedet. '
                          'Bare de som står i ett stykke er med – tegninger som bygges av JavaScript i '
                          'biter, kan ikke vises uten å kjøre sida.'})

# ---- Varer og butikker ---------------------------------------------------
varer = []
for sti in sorted(glob.glob('vareikoner/*')):
    fil = os.path.basename(sti)
    navn = VARENAVN.get(fil, [])
    varer.append(post(sti, navn[0] if navn else os.path.splitext(fil)[0], 'vare',
                      navn[0] if navn else '', bruk=['handleliste.html'] if navn else [],
                      merknad=('Også: ' + ', '.join(navn[1:6]) + (' …' if len(navn) > 6 else '')) if len(navn) > 1 else ''))
if VARE_DEFAULT and not os.path.exists(VARE_DEFAULT.group(1).lstrip('/')):
    varer.insert(0, {'sti': VARE_DEFAULT.group(1), 'fil': os.path.basename(VARE_DEFAULT.group(1)),
                     'navn': 'Annen vare (reserve)', 'stil': 'vare', 'motiv': 'Generisk vare: pose eller eske uten merke',
                     'merknad': 'FILA FINNES IKKE. VARE_BILDE_DEFAULT i handleliste.html peker hit – '
                                'Pages svarer med forsiden, og bildet blir brutt.',
                     'status': 'mangler', 'bruk': ['handleliste.html'], 'b': 0, 'h': 0, 'kb': 0})
legg('varer', 'Varebilder', 'Handlelista. Oppslagstabellen VARE_BILDE utvides, den regenereres ikke.', varer, apen=False)

butikker = []
for sti in sorted(glob.glob('butikklogoer/*')):
    slug = os.path.splitext(os.path.basename(sti))[0]
    navn = BUTIKKNAVN.get(slug, [])
    reserve = BUTIKK_DEFAULT and slug == BUTIKK_DEFAULT.group(1)
    butikker.append(post(sti, navn[0].title() if navn else pent(slug), 'butikk', '',
                         bruk=['handleliste.html'] if (navn or reserve) else [],
                         merknad='Reservelogoen.' if reserve else ''))
legg('butikker', 'Butikklogoer', 'Handlelista. Butikkenes egne logoer – bestilles ikke fra AI.', butikker, apen=False)

# ---- Arkiv: alt annet som ligger i bilder/ ---------------------------------
arkiv = []
alle = [f.replace('\\', '/') for f in glob.glob('bilder/**/*', recursive=True) if os.path.isfile(f)]
alle += [f for f in ('robot.png', 'tre-lys.png', 'tre-mork.png') if os.path.exists(f)]
for sti in sorted(alle):
    if sti in sett or not re.search(r'\.(png|webp|jpe?g|gif|svg)$', sti):
        continue
    bruk = brukt_i([re.escape(os.path.basename(sti))])
    arkiv.append(post(sti, os.path.splitext(os.path.basename(sti))[0], 'gammel',
                      bruk=bruk, merknad='Mappe: ' + os.path.dirname(sti) if os.path.dirname(sti) else 'Repo-rota'))
legg('arkiv', 'Arkiv', 'Alt annet i bilder/. De fleste er den gamle steampunk-stilen og brukes ikke '
     'lenger – de ligger igjen fordi bildene i bilder/ ikke slettes uten beskjed.', arkiv, apen=False)

# ---- Bestilt, ikke levert ----------------------------------------------------
bestilt = []
motivfil = 'bilder/kort/motiv-bestilling.txt'
if os.path.exists(motivfil):
    levert = len(glob.glob('bilder/kort/motiv/*'))
    bestilt.append({'sti': '', 'fil': '001-h.webp … 118-og.webp', 'navn': 'Kortmotivene (118)',
                    'stil': 'foto', 'motiv': 'Se bilder/kort/motiv-bestilling.txt – ett motiv per grunnstoff',
                    'merknad': '%d av 118 levert. Hele bestillingen står i %s.' % (levert, motivfil),
                    'status': 'mangler', 'bruk': ['kort.html'], 'b': 0, 'h': 0, 'kb': 0})
legg('bestilt', 'Bestilt, ikke levert', 'Bilder koden venter på.', bestilt)

# ----------------------------------------------------------------------
# Siden
# ----------------------------------------------------------------------
antall = {}
for s in seksjoner:
    for p in s['poster']:
        antall[p['status']] = antall.get(p['status'], 0) + 1
totalt = sum(len(s['poster']) for s in seksjoner)

data = {'stiler': STILER, 'ikkeAi': IKKE_AI, 'seksjoner': seksjoner}
mal = open(os.path.join('dokumenter', 'bildekatalog-mal.html'), encoding='utf8').read()
side = (mal.replace('/*DATA*/null', json.dumps(data, ensure_ascii=False).replace('</', '<\\/'))
           .replace('{{TOTALT}}', str(totalt))
           .replace('{{I_BRUK}}', str(antall.get('i bruk', 0)))
           .replace('{{TRENGER}}', str(antall.get('trenger nytt', 0)))
           .replace('{{MANGLER}}', str(antall.get('mangler', 0)))
           .replace('{{UBRUKT}}', str(antall.get('ikke i bruk', 0))))
open(UT, 'w', encoding='utf8', newline='\n').write(side)
print('%s: %d bilder i %d seksjoner – %s' % (UT, totalt, len(seksjoner),
      ', '.join('%s %d' % kv for kv in sorted(antall.items()))))
