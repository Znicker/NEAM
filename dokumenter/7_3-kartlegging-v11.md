# 7.3 – kartlegging, revidert (v11)

*Ført à jour 18. september 2026. v11 la til del 50–54 – språkmodus
for Emma og Andrea, grunnstoffspillet, personlige paletter og «hvem er
du?» på veggskjermen, svartiden som ikke er målt, og arbeidsdelingen
mellom uttrykk og bygging. Grunnstoffspillet (del 51) er bygget siden; de
fire andre står. v10 la til del 39–46 – diktatspillet,
bekreftelse på alt som skriver, verktøylagene `felles-lesalt`,
`felles-skriv`, `felles-hus` og `felles-tale`, innloggingen samlet på
forsiden, Neam som vet hvilken dag det er, stemmen begge veier, og to
runder med cachefella. Del 47–49 er besluttet, ikke bygget: belønningssystemet, måltidet som egen ting, og push. v9 la til del 34–38 –
oppskriftssidas firer, krydderblandingene, Neams oppskriftsverktøy,
Safari-fella med flex-barn, og importkøen som fylte seg selv. v8 la til
del 30–33 – innloggingen
mot Microsoft lagt om til 90 dager, sikkerhetssida og veien til Homey,
kameraet over WebRTC, og fireren som fikk Sikkerhet i hjørnet. v7 la til
del 25–29 – Andrea dash
og den andre skolen, mattespillet, portvakten mot `.pages.dev`, barnas
lekser som liste på kjøkkendashen, og ryddingen som viste seg å være gjort
for lenge siden. v6 la til del 18–24 – Emma dash, fagmodellen,
Neam-verktøyene på Emma dash, proxyene mot skolen og HI, fireren med
merker og rør, fem feller i datalaget, og kalenderfeilen som viste seg å
være mellomlageret. v5 la til del 15 og 16. v4 la til «Nåstatus + åpne
tråder» øverst som fast inngang. v3 la til del 13 og 14. Grunnlaget ellers
er verifiseringen fra 27. august.*

*Slik brukes den: **les toppblokka først** – den forteller hvor prosjektet
er og hva som gjenstår. Resten er oppslagsverket for hvorfor beslutninger
ble tatt. Siste handling i hver arbeidsøkt er å oppdatere toppblokka, så en
ny tråd alltid lander på samme sted.*

---

## Nåstatus – 18. september 2026

**Hvor prosjektet er nå.** Ni sider og tre spill. To økter 12.–13. september
endret tyngdepunktet i huset: fra sider som hver eier sine verktøy, til
**fellesfiler som gir Neam det samme overalt**.

Fredagen gikk til **diktatspillet** for Andrea (del 39): Neam leser ordene,
hun skriver på et ark han selv genererer, tar bilde, og han retter. Lørdagen
gikk til å **slippe Neam løs**: bekreftelse på alt som skriver (del 40),
lesing og skriving på tvers av appene (del 41–42), innloggingen samlet på
forsiden (del 43), klokka inn i systemteksten (del 44), og **stemmen begge
veier** (del 45).

**Fem nye fellesfiler:** `felles-lesalt.js` (lesing på tvers – skolearbeid,
diktat, kalender), `felles-skriv.js` (skriving på tvers – handleliste,
kalender, navigasjon), `felles-hus.js` (Homey: dør, kamera, røykvarslere),
`felles-ms.js` (Microsoft-token for sider uten egen innlogging),
`felles-tale.js` (tale ut og inn).

**Siste leverte versjoner:** `felles-neam.js ?v=71`, `felles-neam.css
?v=56`, `felles-tale.js ?v=5`, `felles-skriv.js ?v=4`, `felles-lesalt.js
?v=5`, `felles-hus.js ?v=3`, `felles-ms.js ?v=2`, `felles-data.js ?v=4`,
`felles-graph.js ?v=2`, `felles-rot.css ?v=5`, `felles-knapper.css ?v=1`;
alle ni sidene pluss `andrea-matte.html`, `andrea-diktat.html` og
`emma-grunnstoff.html`; `functions/_middleware.js`, `functions/api/` med
`hent.js`, `sandnes.js`, `sjo.js`, `claude.js`, `data.js`, `ms.js`,
`homey.js`.
Bildeversjoner: `MERKE_V=2`, `KNAPP_V=4`, `FAG_MERKE_V=3`, `SIK_MERKE_V=1`,
spillbildene `?v=1`, sikkerhetsmerkene `?v=1` (65 stk i
`bilder/sikkerhet/`).

**Brente numre – gjenbruk aldri:** neam.js 24–26 og 29–70; neam.css til og
med 55; data.js 1–3; rot.css 2–4; knapper `?v=1`; **lesalt 1–4, skriv 1–3,
hus `?v=1–2`, ms `?v=1`, tale 1–4**. Lesalt 1–2, skriv 1–2, hus 1, ms 1 og
tale 1–4 ble brent 13. september ved å endre en fil som alt var pushet uten
å heve nummeret – se del 46. Resten er tidligere leverte numre, som alltid
er brent i det de forlates.

**Hemmeligheter i Cloudflare:** `ANTHROPIC_API_KEY`, `MS_CLIENT_SECRET`,
`HOMEY_CLIENT_SECRET`. **En hemmelighet tas først i bruk ved neste
utrulling** – lagre den, og push eller trykk «Retry deployment».

**Økta 15. september ga ingen kode.** Den gikk med til å tenke høyt, og
resultatet er fem nye deler: språkmodus (del 50), grunnstoffspillet
(del 51), personlige paletter og veggskjermen (del 52), svartiden
(del 53) og arbeidsdelingen i design (del 54).

**Øktene 16.–18. september ga kode igjen.** 16. september: kalenderlesinga i
`felles-lesalt.js` lagt om til seks kall om gangen i stedet for etter tur,
Neam som kan endre skolearbeid fra alle sider, og **grunnstoffspillet** for
Emma – trinn 1 og trinn 2 samme dag. 17. september: seksten nye varslere på
sikkerhetssida, røyk, varme og vann. 18. september gikk i sin helhet til å
**bygge om grunnstoffspillet**: hele tabellen tent fra start, stjerne per
stoff, prøven som eneste vei videre, erfaringspoeng og nivå, nøytronet som
eget læretrinn bak nivå 3, og dypere atomtegning. Se del 51, «Slik ble det
bygget».

### Åpne tråder

**Besluttet, ikke bygget – fem systemer med begrunnelse i del 47–50 og 52:**
- **Belønningssystemet** (del 47). XP for gjøremål og lekser, ukesterskel
  som utløser ukepenger, overskudd i egen pool per barn mot en milepæl.
  Alt diskutert ferdig; ingen kode. **Største risiko, uttalt av Magne:** at
  de voksne ikke holder koken på godkjenningen.
- **Måltidet som egen ting** (del 48). Oppskrift er teksten, måltidet er
  gangen den ble laget. Kokk, trykkbare koketider, frysing, karakter fra dem
  som spiste. Krever timere som overlever sidebytte – `hub.html`.
- **Push** (del 49). Høyt ønsket, bredt omfang. Krever service worker, og
  **noe som våker på serveren** – det siste er den egentlige mangelen.
- **Språkmodus** (del 50). Neam snakker spansk med Emma og engelsk med
  Andrea, slått på ved å si det og av ved å si det på målspråket.
  Billigst av alt som står på lista: et modusflagg, en systemtekst og et
  gjenkjenningsspråk. **Svakheten er gjenkjenningen**, ikke modellen.
- **Personlige paletter og «hvem er du?»** (del 52). Farger og bilder per
  person, lik layout og oppførsel; veggskjermen spør ved oppvåkning, og
  grått husmodus når ingen svarer. Hører hjemme i skallet, ikke i åtte
  sider.

**Åpne spørsmål – ikke avgjort (del 51 og 53):**
- **Neam bruker fem til sju sekunder på enkle spørsmål.** Det er en
  følelse, ikke et tall – ingenting er målt. Mistenkte: en verktøyrunde
  før han begynner å snakke, og husregisteret pluss verktøydefinisjonene
  som sendes på nytt hver melding. **Modellvalget er spaken ingen har
  tatt i.**
- **Skal de to dokumentene være tilgjengelige for Neam?** Ikke i
  systemteksten – de er 121 og 95 kB. Verktøymodellen (som
  husregisteret) er riktig form hvis det gjøres. Uavklart om det er verdt
  vedlikeholdet.
- **Nøytronets farge i grunnstoffspillet.** Grå (`--ink-soft`) ble valgt
  18. september fordi nøytral farge passet en nøytral partikkel, men fargen
  står ikke i designsystemet. I tegningen skiller den klart fra
  elektronblått; i den lille beholderkula ligger de nærmere hverandre enn de
  burde. Se del 51.

**Avtalt som neste sak:**
- **Robotstemme fra en TTS-tjeneste.** Nettleserens `speechSynthesis` er en
  avspiller, ikke en lydkilde – vi får aldri signalet, og kan derfor verken
  legge på effekter eller importere en stemme. En tjeneste som returnerer
  en lydfil (Azure `nb-NO-FinnNeural`) løser tre ting på én gang: samme
  stemme på alle enheter, ekte mannsstemme, og ekte robotklang gjennom en
  ringmodulator i Web Audio. Krever en ny Cloudflare-funksjon med nøkkel,
  ca. et halvt sekund latens, og ~15 USD per million tegn.
  Nettleserstemmen blir stående som reserve.

**Må prøves:**
- **Stemmen begge veier på iPad fra hjemskjerm-appen.** Det eneste virkelig
  utestede: om `webkitSpeechRecognition` virker i standalone-modus, og om
  mikrofonen kan åpnes igjen programmatisk i samtalemodus (runde to og tre).
- **Tonehøyden.** Står på 0,6. Skal finstilles på telefonen med velgeren
  (langt trykk på høyttaleren), og den verdien som sitter skrives inn som
  standard.
- **Diktatarket med hjelpelinjer** – ett utfylt ark fotografert med iPhone.
- **Kameraet utenfor hjemmenettet.** Se del 32.
- **Fiskebeinet med åtte apper** på iPad og telefon.
- **Mattespillet i Safari.** Aldri kjørt på en ekte iPad.

**Bygging som gjenstår (avtalt):**
- **Skriving til skolearbeidet på tvers.** Det siste som bare kan gjøres fra
  sin egen side. Alt annet – handleliste, kalender, diktat, dør – virker
  overalt.
- **Grunnstoffspillets trinn 3 – bindinger** (del 51). Hun trykker på ett
  stoff, og de stoffene det kan binde seg med lyser opp. Begrensningen til
  det hun har låst opp er det som gjør trinnet mulig. Trinn 1 og 2 står.
- **Returen etter innlogging.** `loggInn()` på dashene lagrer `fh_tilbake`,
  men forsiden leser den ikke. Én linje.
- **Reserveveien i `index.html`** kan slettes: den faller tilbake på
  direkteveksling mot Microsoft, og er død kode nå som begge adressene står
  som Web i Azure.
- **Diktatsida over på `felles-tale.js`.** Den har egne `taleNr` og
  `taleStottes`; de må fjernes i samme commit, ellers er det en SyntaxError
  som tar ned hele skriptet.
- **Home Assistant.** Magne bestiller maskinvare. Krever Cloudflare Tunnel –
  som også er veien til **sjøtemperaturen**.
- **Importverktøyet sender hele lista** i stedet for endringene. Se del 38.
- **Steg to for krydderblandinger.** Se del 35.
- **Knappemerker** for oppskriftssidas firer og for Sikkerhet-knappen.
- **Skolevarsler på e-post**, **Neams bolk i husregisteret**,
  **utstyrsregelen**, **knappearket for Emma dash**, **fagvinduet** –
  alle uendret.

**Den store endringen (`hub.html`) skal ta med seg:**
1. `fh:` → `neam:`. **NB:** `auth:ms:` og `auth:homey:` ligger UTENFOR
   `fh:` med vilje og skal ikke flyttes inn – se del 30.
2. **KV → D1.** 3. **WebSocket i skallet.** 4. **Kalender fra sys.**
5. **Verktøylagene er allerede skallets form** – se del 42. Skallet arver
   dem, det skal ikke finne dem opp på nytt.
6. **Timere som overlever sidebytte** – se del 48. Nedtelling på koketid må
   lagres med et sluttidspunkt, ikke som en teller som går.
7. **Service worker** – se del 49. Bærer både push og offline.

**Rydding:**
- **Ni ubrukte SPA-adresser i Azure.** Bare `/kalender.html`, `/kalender`,
  `/` og `/index.html` er i bruk; de to siste ble flyttet til Web
  13. september. Resten kan slettes – se del 43.
- Tre `familiehub-7us.pages.dev`-adresser står igjen i Azure.
- Klienthemmeligheten for Microsoft har vært synlig i et skjermbilde.
  Magne vurderte risikoen som akseptabel.
- **Venstrespaltens knapper på oppskriftssida er skjult, ikke fjernet.**
  Se del 36.

**Dokumenter:** designsystemet er ført à jour til v13 samtidig med denne.

---

## 1. Feilene – status

| Funn i første kartlegging | Status |
|---|---|
| `overflow-x:hidden` i handleliste | **Var alt rettet.** Begge linjene (88 og 637) sier `clip`. |
| `esc()` slipper apostrofen i kalender | **Var alt rettet.** Identisk med dashboard, apostrof inkludert. |
| `.btn-primary` bruker feil farge i oppskrifter | **Bortfalt.** Klassen finnes ikke lenger; knappene er døpt om etter betydning. |
| `--lime` og `--blue` er samme verdi | **Står fortsatt.** Begge `#4A7FA8` i oppskrifter og handleliste. Dashboard definerer `--lime:#C8E64B` og bruker den aldri. |

**Rettet i denne økta i stedet:**

- `resetAddForm()` og `saveRecipe()` pekte på `.btn-primary`, en klasse som
  ikke finnes. Alvoret lå ikke i dobbeltkjøring – `saveRecipe` står allerede i
  `appBusy`-sperra – men i at `saveBtn.insertAdjacentElement()` i catch-blokka
  ikke var vaktet. En mislykket lagring kastet en TypeError inne i
  feilhåndteringa, og feilmeldingen nådde aldri skjermen.
- `#confirm-modal` lå bak sju andre modaler. Alle deler `z-index:100`, og de
  som står etter den i dokumentet malte over den. Kom først fram da
  avbryt-regelen begynte å åpne bekreftelser oppå andre modaler.

**Latent, ikke rettet:** kalender bygger Graph-URL-er ved å lime id-er rett
inn i stien – ni steder. Dashboard kjører alle gjennom `enc`
(`encodeURIComponent`) på fjorten steder. Det biter ikke i dag, fordi Graph
sine id-er i praksis er base64url, men det er en forskjell i robusthet der
den ene fila har rett.

---

## 2. Valg som må tas før noe slås sammen

**Uendret fra første kartlegging, og fortsatt ubesvart.** Bakgrunn
(`#ECEFF1` mot `#FAFAFA`), `--ink-soft`, `--line`, `--shadow` og skyggen under
logoen.

Det som er avklart siden: **disse hører til designgjennomgangen, ikke til
7.3.** Bakgrunnsvalget endrer utseendet på fire sider – det er et valg man tar
mens man ser på skjermen, flate for flate, ikke i et regneark før en
refaktorering. Felles `:root` (punkt 4 i den gamle rekkefølgen) kan ikke
bygges før dette er bestemt, ellers bygges den på verdier ingen har valgt.

Tillegg funnet under verifiseringen: dashboard har en tredje bakgrunnsverdi,
`--bg-2:#EDF3F8`, som første kartlegging ikke nevner.

---

## 3. Hva som faktisk kan deles – med tall

### App-skallet – oppskrifter + handleliste ✅ best kandidat

Av de atten reglene som ble påstått felles er **seksten identiske**. De to
som spriker gjør det knapt:

- `.modal-backdrop` har nøyaktig de samme ti deklarasjonene i ulik
  rekkefølge. Ingen reell forskjell.
- `button` er den eneste ekte: oppskrifter setter `font-family:inherit` og
  `cursor:pointer`, handleliste setter `touch-action:manipulation`. Ingen
  overlapp – men begge filene vil ha alle tre. Unionen er svaret.

`.home-hero-icon`, `.home-hero-sub` og `.tab-btn` spriker som beskrevet og
trenger hvert sitt valg. De to siste er typeskala: er faneteksten brødtekst
eller metatekst?

`cloudGet` og `cloudSet` skiller seg bare på parameternavn (`k`/`v` mot
`key`/`value`) og konstantnavn (`SKY_API` mot `API`). Åtte kallsteder.

**Dette er den tryggeste første flyttingen.**

### Filviseren – dashboard + kalender ⚠️ ikke som beskrevet

CSS-siden holder: seksten regler finnes i begge, tretten er identiske. De tre
som spriker gjør det på `#FFFFFF` mot `#fff` og `18px` mot `var(--radius)`.

**JS-siden holder ikke.** Første kartlegging sa fem av elleve identiske. Det
er **tre**: `lukkViser`, `lastNedFraViser` og `esc`. De åtte andre spriker, og
flere på oppførsel:

| Funksjon | Forskjell |
|---|---|
| `aapneVedleggFra` | dashboard koder id-ene med `enc()` og har null-sjekk; kalender har ingen av delene |
| `blobAv` | dashboard tåler tom input (`bytes \|\| ''`), kalender ikke |
| `erPdf` | kalender mangler filtype-sjekken helt |
| `erBilde` | dashboard bruker hjelperen `erFil()`, kalender gjentar odata-sjekken inline |
| `tegnForhaand` | setter **ulikt klassenavn i markupen** – `ved-bilde` mot `vedlegg-bilde` |
| `valgteFiler` | to forskjellige funksjoner, ikke to skrivemåter |
| `aapneViser`, `filTilBase64` | kosmetisk |

To ting følger av dette. For det første er den identiske CSS-en delvis
illusorisk: reglene er like, men `tegnForhaand` gir elementene ulike
klassenavn, så de treffer ikke nødvendigvis de samme reglene. For det andre
er dashboard-versjonen gjennomgående den mer robuste – **sammenslåingen er
ikke en flytting, den er åtte beslutninger, der svaret som regel er «ta
dashboard sin»**, og der kalender får rettet noen svakheter på kjøpet.

Det er fortsatt verdt å gjøre. Det er bare ikke det stedet man starter for å
bevise at fellesfil-oppsettet virker.

### Graph-laget – dashboard + kalender

Bekreftet. `graph(sti, valg)` mot `graph(path, method, payload)`, 29
kallsteder til sammen (17 + 12). `kalenderFarge`, `normEpost`, `htmlTilTekst`
og `dus` er identiske og kan følge med gratis.

### Innloggingen – index, dashboard, kalender

Uendret vurdering: bør vente. Den varige løsningen er å flytte kodevekslingen
til en Pages Function, og da er det den som skal deles.

---

## 4. Det som blokkerer

**Bekreftet i sin helhet.** Alle åtte klassenavnene betyr forskjellige ting i
index og kalender, med verdiene som beskrevet:

| Klasse | index | kalender |
|---|---|---|
| `.brand-icon` | `clamp(120px,17vw,195px)` | fast `56px` |
| `.grid` | én kolonne | `1fr 300px` |
| `.shell` | `max-width:1180px` | fullhøyde flex, `max-width:1960px` |
| `.panel` | `padding:22px`, `border-radius:18px` | `padding:16px`, `var(--radius)` |
| `.panel-title` | `color:var(--ink)` | `color:var(--ink-soft)` |
| `.top` | grid, tre kolonner | flex, sentrert |
| `.brand`, `.panel-head` | ulike oppsett |

Dette er fortsatt den største jobben, og den treffer HTML-en også.

---

## 5. Nytt press mot fellesfiler

Kom til i denne økta, og hører hjemme i regnestykket:

- **Avbryt-regelen er skrevet fire ganger.** `avtrykkAv`, `huskSkjema`,
  `skjemaEndret` og `avbrytSkjema` finnes nå i oppskrifter, handleliste og
  dashboard i nesten identiske versjoner, og kalender har sin egen variant av
  det samme. En endring i regelen må gjøres fire steder.
- **Bekreftelsen ser ikke lik ut.** Oppskrifter bruker sin egen
  `showConfirmModal`, de tre andre bruker nettleserens `confirm()`.
- **Lim-inn-fra-utklippstavle finnes bare i oppskrifter.** Skal den ut på
  kalender og dashboard, blir det samme kode et tredje og fjerde sted.

---

## 6. Rekkefølge og status

*Status per 28. august 2026:*

1. ~~**Designgjennomgangen**~~ – **GJORT** for verdienes del: de fem verdiene
   i del 2 og typeskala-spørsmålene er avgjort og innført i alle fem sidene.
   Gjennomgangen flate for flate (iPad først) står fortsatt igjen som egen økt.
2. ~~**App-skallet ut i egen fil**~~ – **GJORT.** `felles-skall.css` i rota,
   oppskrifter + handleliste, `?v=1`.
3. ~~**Felles `:root` + typeskala**~~ – **GJORT.** `felles-rot.css`, alle fem
   sidene, med omdøpingene beskrevet i designsystemet.
4. ~~**Avbryt-regelen og utklippstavla inn i felles atferdsfil**~~ –
   **GJORT.** `felles-skjema.js` bærer nå `avtrykkAv`, `huskSkjema`,
   `skjemaEndret` og `avbrytSkjema`; kopiene i sidene er borte. Oppskrifters
   `showConfirmModal` er også fjernet – de ni kallstedene går gjennom
   `bekreft()` som resten.
5. ~~**Filviseren**~~ – **GJORT.** `felles-filviser.css` + `felles-filviser.js`
   (`?v=2`), dashboard + kalender. PDF-forhåndsvisningen ble samtidig byttet
   fra innebygd iframe til et klikkbart kort – se designsystemet.
6. **Navnekollisjonene i index og kalender.** GJENSTÅR – men
   **nedprioritert 29. august.** Kollisjonene blokkerer bare en flate der
   begge sidene lastes samtidig, altså ramme-modellen for `hub.html`. Den
   ble lagt bort (se del 13): uten en kamerastrøm eller annen tilstand som
   må overleve i bakgrunnen tåler alt vanlig sideveksling, og da kolliderer
   ingenting. Jobben gjøres den dagen noe faktisk krever rammen, ikke før.
7. ~~**Graph-laget.**~~ – **GJORT.** `felles-graph.js` (`?v=1`), kalender +
   dashboard.

Endringen fra første kartlegging er at filviseren har byttet plass med
app-skallet, og at designgjennomgangen står først i stedet for å ligge ved
siden av.

---

## 7. Kalendermodellen – omgjort 28. august 2026

*Denne delen sa tidligere det motsatte. Den er skrevet om fordi
beslutningen ble reversert samme dag, og en kartlegging som står igjen med
feil konklusjon er nøyaktig det som får en til å gå samme omvei igjen.*

**Modellen er nå:** fem vanlige kalendere – Magne, Nina, Emma, Andrea,
Familien – opprettet på `sys@neam.no` og delt til alle fire kontoene med
**Kan redigere**. Egen standardkalender er privat og deles ikke. Regelen er
én setning: alt delt ligger hos sys, alt privat ligger i din egen kalender.

**Hvorfor dette og ikke delte standardkalendere.** Det oppsettet ble prøvd
og forkastet. En delt standardkalender mellom personlige Microsoft-kontoer
er en *speiling* i mottakerens postkasse. Speilingen bærer beskjeder, ikke
referanser: opprettelse går gjennom, mens sletting og alle
vedleggsoperasjoner krever den fjerne identiteten og feiler med «The item's
remote identity is missing or corrupt». Lese og opprette, ikke slette eller
legge ved – for tungvint til å leve med.

Det er ikke noe å omgå. `/users/{eier}` svarer ErrorInvalidUser fra en
personlig konto, `Calendars.ReadWrite.Shared` er virkningsløst, og «Kan
redigere» er det høyeste delingsnivået outlook.com tilbyr.

**Hvorfor den gamle modellen ikke har problemet:** avtalene bor fysisk i sys
sin postkasse. Sys treffer dem med `/me/...`, og de fire andre går gjennom
kalenderen de er delt til.

**Alternativene som ble vurdert og lagt bort:**

- *Microsoft 365-leietaker med app-only-tilgang.* Løser alt, og gjør Graph-
  abonnementer til push mye tryggere. Koster fem Exchange Online-lisenser,
  rundt 250–300 kr i måneden. Kan kjøpes senere uten at noe av dagens arbeid
  kastes.
- *Egen kalender i KV med ICS-publisering.* Ingen Microsoft-begrensninger,
  men stor omskriving og telefonene blir skrivebeskyttet.
- *«Bare endre egne avtaler».* Virker teknisk, men kjøkken-dashen kjører som
  sys og eier ingenting under det oppsettet. Utelukket.
- *Familiegruppekalenderen «Din familie».* Ikke brukt. Den ligger ikke i sys
  sin postkasse, så den ene mest delte kalenderen ville fulgt andre regler
  enn de fire andre – og dashboards elleve `/me/events/{id}`-kall ville
  feilet akkurat der.

**Gjort i koden 28. august:**

- `Calendars.ReadWrite.Shared` fjernet fra `kalender.html` og `index.html`.
- Kommentaren over `avtaleSti()` skrevet om. Funksjonen står, og er nå
  riktig av en annen grunn enn den ble laget for.
- Kalendermenyen (`#caldropBtn`) skjult for alle andre enn sys, via
  `KAL_ADMIN` og `erKalAdmin`. Grunnen: hver konto ser også sin egen
  standardkalender, bursdager og helligdager i `/me/calendars`, og hvilke
  kalendere som er i spill er en avgjørelse for husstanden, ikke noe hver
  enkelt skal stille inn per enhet.
- Menyen bygget om til en **tilgangsmatrise**, lagret i KV som
  `fh:kal-tilgang`. To rader per kalender – *Tilgang* og *Vis ved start* –
  med husstandens initialer som brytere, og en ALLE/INGEN-knapp per rad.
  Markerte initialer tar kalenderens egen farge, så raden leses som én
  kalender – samme regel som initialstripa. `FARGE_ADMIN` ned til bare sys.
- `fh_cal_valgt` og `fh_cal_strip` fjernet fra localStorage. De lå per
  enhet og var nøkla på kalender-id, og døde derfor hver gang kalenderne
  ble bygget om. Matrisen er nøkla på **navn**, som fargene: en delt
  kalender har én id i sys sin postkasse og en annen i Emmas, så id-er kan
  ikke krysse kontoer.
- Ingenting huskes mellom økter. Oppstartstilstanden kommer fra matrisen;
  det brukeren trykker seg fram til i løpet av økta er sitt eget og
  forsvinner ved neste innlogging. Bevisst: et hurtigvalg som overlever
  økta blir et filter man ikke husker at man satte.
- Tom matrise betyr «ikke satt opp» og gir alle alt, som før. Fra første
  lagring er matrisen fasit, og en kalender som ikke står der finnes ikke.
  Nye kalendere føres inn med full tilgang første gang sys åpner panelet,
  så en nyopprettet kalender aldri blir usynlig i stillhet.

**Dashboard er flyttet over på `avtaleSti()`.** Den brukte `/me/events/{id}`
elleve steder, som virket utelukkende fordi den kjørte som sys – eieren av
alle kalenderne. Fire hjelpere har fått kalenderen inn i signaturen
(`hentVedlegg`, `leggVedFil`, `aapneVedleggFra`, `hentOgTegn`), og
`lagreAvtale` fører nå `malKalId` ved siden av `malId`, siden ny, flyttet og
endret avtale havner i hver sin kalender og vedleggsopplastingen etterpå må
vite hvilken. Dermed kan dashboard kjøre som hvilken som helst konto
kalenderne er delt til.

Verifisert 28. august: sletting fra en konto som ikke eier kalenderen
fungerer på delte *navngitte* kalendere. Det er forskjellen fra delte
standardkalendere, og den bærer hele modellen.

**To ting var utledet av kalenderlista i egen postkasse, og måtte bort.**
Lista er forskjellig for hver konto – sys ser sin standardkalender,
bursdager og abonnementer som ingen andre har – og alt som regnes ut fra
den blir derfor ulikt fra person til person:

- *Reservefargen* lå på `PALETTE[i % lengde]`, der `i` var plassen i lista.
  Samme kalender fikk ulik farge hos ulike folk så lenge ingen hadde valgt
  en eksplisitt. Nå utledes den av navnet (`palettFor`), som er likt
  overalt. Valgte farger i `fh:kal-farger` lå alt på navn og var aldri
  berørt. Endret likt i kalender og dashboard, som har hver sin kopi.
- *Initialene* regnet kollisjoner over hele lista, så sys delte ut to
  bokstaver der kitchen klarte seg med én. `byggInitialer()` teller nå bare
  kalendere med tilgang i matrisen.

**Verdt å vite:**

- `FASTE_FARGER` og fargeoverstyringene i KV er nøkla på *navn*. Så lenge
  kalenderne heter Magne, Nina, Emma, Andrea og Familien, overlever fargene
  enhver ombygging. `INITIAL_PRI` har de samme fem.
- `kalenderValg` og `stripValg` er nøkla på *id*, i localStorage per enhet.
  Nye kalendere = nye id-er = alt på som standard. Gamle nøkler blir
  liggende som død vekt; `fh_cal_valgt` og `fh_cal_strip` er det man tømmer.
- Sletter man en delt kalender hos eieren, blir lenken liggende igjen som en
  tom skygge hos mottakerne. Den kan ikke skrives til, men den kan fjernes,
  og det må gjøres fra hver enkelt konto.

**Egen kjøkkenkonto – besluttet 28. august, ikke bygget.** Kjøkken-iPaden
skal ikke lenger kjøre som sys. Begrunnelsen er admin-eksponering: sys eier
alle kalenderne og er eneste `KAL_ADMIN` og `FARGE_ADMIN`, og en skjerm som
henger permanent innlogget på veggen er en dør uten lås.

Kontoen skal ha *annen*, ikke mindre, funksjonalitet – Homey-styring og
dagsoversikt hører til flaten den henger på. Den skal kunne slette avtaler.

Kontoen heter `kitchen@neam.no` og står utenfor familiegruppa – den gir
bare Family Safety, abonnementsdeling og «Din familie»-kalenderen, og
kjøkkenet trenger ingen av delene. Skriverett på delte kalendere krever
ikke familiemedlemskap; det ble verifisert.

Gjort: `avtaleSti()` i dashboard, `kitchen@neam.no` inn i `HUSSTAND` som
sjette kolonne i matrisen, og `DASH_TILGANG` utvidet til `['kitchen', 'sys']`.
Sys står igjen med vilje – uten den ville en feil på kitchen-kontoen låst
oss ute av veggskjermen uten vei inn. Fjern den når kitchen har stått en
stund.

Initialrekkefølgen i matrisen er N, E, A, M, K, S: husstanden først,
systemkontoene sist.

Gjenstår: Access-bruker for `kitchen@neam.no`.

Rollemodellen på sikt hører til `hub.html`: sys bestemmer hvilke fliser og
funksjoner hver identitet ser, lagret i KV som kalendertilgangen alt er.

## 8. Graph-laget – gjort 28. august 2026

`felles-graph.js`, lastet av kalender og dashboard før sidenes eget skript.

**Signaturen.** De to versjonene hadde ulik form, ikke ulik oppgave:
`graph(sti, valg)` mot `graph(path, method, payload)`. Dashboards form vant –
et valg-objekt tåler at det kommer en tredje ting en dag uten at signaturen
må endres igjen. Fem kallsteder i kalenderen ble skrevet om; resten er
enkle GET-kall som ser like ut i begge former.

**En ekte feil ble rettet på veien.** Dashboard prøvde om igjen på *alle*
metoder ved 429/503/504, ikke bare GET. Et nytt forsøk på en POST som
egentlig gikk gjennom lager avtalen to ganger. Kalenderens sperre
(`kanProveIgjen`) er nå felles.

**Motsatt vei vant dashboard:** et tomt svar som ikke er `ok` kaster nå en
feil med status. Kalenderen returnerte `null` og lot feilen forsvinne i
stillhet.

**Fila inneholder:** `GRAPH`, `TZ`, `enc`, `graph()`, `avtaleSti()`,
`normEpost`, `htmlTilTekst`, `rgbAv`, `dus`, `PALETTE`, `FASTE_FARGER`,
`fargeOverstyring`, `palettFor`, `kalenderFarge`. De fire følgesvennene var
identiske bortsett fra mellomrom; fargefunksjonene ble duplisert samme dag
og er ryddet med det samme.

**Blir liggende i sidene, med vilje:** `hentFarger`/`lagreFarger` (kalender
kan også skrive og har `FARGE_ADMIN`; dashboard bare leser), `dusFast`
(bare kalender), og token-funksjonen. Kalenderens `validToken` er døpt om
til `gyldigToken`, som er navnet dashboard og index alt brukte – fellesfila
kaller det, sidene definerer det.

**Latent, ikke rørt:** `FASTE_FARGER` har nøkkelen `Familie`, men kalenderen
heter `Familien`. Den treffer altså aldri, og faller på `palettFor`. Ett ord
å rette, men det endrer en farge og hører til en design-økt.

---

## 9. Dialoger og flytting – 28. august 2026

**`felles-dialog.css` + `felles-dialog.js`.** Nettleserens `confirm()` og
`alert()` er ute av kalender, dashboard og handleliste – elleve kallsteder.
De så ut som noe annet enn resten av huben, og på iOS stopper de alt annet
på sida mens de står.

    await bekreft('Slette avtalen?', {jaTekst:'Slett', fare:true})
    varsle('Fikk ikke lagret: …')

`bekreft()` er asynkron der `confirm()` var synkron, så kallstedene måtte
bli `async`. Fire funksjoner ble det – og `lukkMiddagNotat` ble oppdaget av
syntaksjekken, ikke av lesing. Markupen lages av JS-en ved første bruk, så
ingen side har noe liggende i HTML-en. Rødt bare når knappen faktisk sletter;
avbryt er alltid nøytral, etter avbryt-regelen.

**Gjort 28.–29. august:** oppskrifters `showConfirmModal` er fjernet og de
ni kallstedene flyttet over på `bekreft()`. Alle fire sidene har nå samme
dialog.

**`flyttAvtale()` er felles og kalenderen har fått den.** Kalenderen låste
kalendervelgeren ved redigering med kommentaren «flytting mellom kalendere
støttes ikke»; dashboard fikk funksjonen senere og kalenderen ble aldri
oppdatert. Nå ligger den i `felles-graph.js` og begge bruker den. Låst
fortsatt på serier – en enkeltdag kan ikke løftes ut av en gjentakende serie.

Den delte versjonen henter vedleggslista fra Graph i stedet for fra sidens
skjema, og tar med alt som ligger igjen. Vedlegg som skal bort slettes fra
originalen først. Det er samme lærdom som i `slettVedlegg`: vedlegg-id-er fra
da dialogen ble åpnet kan ha gått ut på dato.

---

## 10. Ytelse i kalenderen – 28. august 2026

Sida ble merkbart tregere da kalenderne gikk fra fire til seks. To ting, og
begge var mekaniske:

**Matrisen ble bygget i hver `render()`.** Altså ved hver navigering, hvert
sveip og hver bakgrunnsoppdatering – 72 knapper i strengbygging pluss
`tell()` over alle avtalene, seks ganger, for et panel som sto lukket.
Bygges nå bare når panelet faktisk er oppe, og når det åpnes.

**`GRENSE` i `hentVindu()` sto på 3.** Med seks kalendere ble det to runder
etter hverandre – dobbel ventetid på hver eneste henting. Grensen var satt
for å unngå struping, men `graph()` prøver nå om igjen av seg selv ved 429 på
lesing, så strupingen håndteres der den oppstår i stedet for ved å holde
igjen alle. Satt til 6: én runde.

**En regresjon fra samme dag, rettet:** lasteoverlegget ble endret til å
vises «når `S.calendars` er tom». Men kalenderlista lagres aldri lokalt, så
den er tom ved *hver* innlasting – ikke bare den første. Overlegget la seg
derfor over de cachede avtalene hver gang og ble stående til alle seks
kalenderne var hentet, i tre–fire sekunder. Vilkåret er nå at det heller
ikke finnes cachede avtaler: er det noe på skjermen, blir det stående, og
den snurrende oppdater-knappen er tegnet på at noe skjer.

**Rotårsaken til de tre–fire sekundene, funnet og rettet:** `fyllFraCache()`
bygger lista over påslåtte kalendere fra `S.calendars`, som var tom ved
innlasting fordi kalenderlista aldri ble lagret lokalt. Cachen fantes, men
ble filtrert bort til ingenting – skjermen sto tom til `/me/calendars` og
seks `calendarView`-kall var ferdige. «Vis det vi hadde sist» hadde altså
aldri virket ved oppstart, i noen versjon.

Kalenderlista lagres nå sammen med avtalene i `fh_kal_cache` (id, navn,
farge, `kanEndre`, `on`). Lista er slik *denne* brukeren så den sist, så den
kan ikke vise noe vedkommende ikke allerede hadde på skjermen – ingen
lekkasje mens `hentTildeling()` er underveis.

**Lasteindikatoren har fått en mild variant.** `.laster.mild` er en liten
pille øverst i stedet for et teppe over hele skjermen, brukt når det alt
står cachet innhold der. Full dekning bare når skjermen faktisk er tom.

**Neste lever, ikke tatt:** `hentVindu` henter `body` for hver avtale over et
vindu på minst 225 dager, ganger seks kalendere, og kjører `htmlTilTekst`
(DOMParser) på hvert notat. Det er trolig den dominerende kostnaden nå.
Å hente notatet først når en avtale åpnes ville kuttet både nedlasting og
parsing kraftig – men det må gjøres varsomt: `bodyPreview` i stedet for
`body` ga i sin tid stille avkorting av notater ved lagring, og den fella
skal ikke gjenåpnes.

---

## 11. Delingsfella – oppdaget 28. august 2026

**En kalender som først deles med visningsrett og senere endres til «Kan
redigere», forblir skrivebeskyttet hos mottakeren.** Rettigheten ser riktig
ut i eierens delingsliste, men mottakerens kobling er låst i den tilstanden
den ble akseptert i.

Dette kostet en økt å finne, fordi symptomet peker feil vei: kalenderen
dukker opp, den vises, alt ser riktig ut i oppsettet – bare skriving feiler.
Det ligner et token- eller scope-problem, og er det ikke.

**Verifisert:** Andrea-kalenderen, delt til kitchen med visning først og
oppgradert etterpå, kunne ikke skrives til. Magne-kalenderen, delt til samme
konto med «Kan redigere» fra start, virket umiddelbart. Samme konto, samme
aliasoppsett, samme delingsnivå i lista.

**Å fjerne og dele på nytt med én gang hjelper ikke** – den ødelagte
koblingen gjenbrukes. Rekkefølgen som virker: fjern kalenderen fra
mottakeren, fjern mottakeren fra delingslista hos eieren, *vent* (rapporter
nevner opptil en time), del så på nytt.

**Regel:** del aldri en kalender med visningsrett til noen som senere skal
kunne redigere. Er du i tvil, gi «Kan redigere» fra start. Nedgradering går
greit; oppgradering gjør det ikke.

**Blindspor underveis, så de ikke gjentas:** manglende
`Calendars.ReadWrite.Shared` (irrelevant – feilsøkingen skjedde i Outlook,
ikke i huben), alias som ikke var registrert på kontoen (de var det),
postkasse som ikke var provisjonert (den var det), og medlemskap i
Microsoft-familiegruppa (ingen dokumentasjon støtter at det kreves).

---

## 12. Navnebyttet – 28. august 2026

«Familie Hub» er ute. Systemet heter **Neam** – husassistenten er stemmen,
roboten er maskotten, og navnet favner alt.

Skrivemåten i koden er `Neam`. Merkelinja (`.brand-sub`) har
`text-transform:uppercase` i CSS, så den viser NEAM av seg selv; det er
ingen grunn til å skrive store bokstaver i kilden.

Sidetitler følger nå **SIDENAVN – Neam**: «Kalender – Neam», «Handleliste –
Neam», «Matlaging – Neam», «Kjøkken dash – Neam». Forsiden er bare «Neam» –
den *er* huben og har ikke noe sidenavn foran seg. Designsystemet er døpt om
til `neam-designsystem-7.md`.

**Identifikatorer er med vilje ikke rørt.** De bærer data, og et prefiks er
et internt håndtak, ikke en merkevare:

- `DB_NAME = 'familiehub'` i handleliste og oppskrifter – omdøping gjør all
  lokal data på hver enhet usynlig
- de elleve `fh_`-nøklene i localStorage – `fh_cal_auth` ville logget ut
  alle på alle enheter
- `fh:`-prefikset i KV – tilgangsmatrise, farger, huskeliste, middagsnotat
- `format:'familiehub-handleliste-1'` og `-varekatalog-1` i eksportfilene –
  importen validerer den ikke, så gevinsten er null

Skal `fh:` bort en dag, er det en migrering, ikke en tekstendring.

**Gjort samtidig, fordi det var gratis:** `merke-familie.png` heter nå
`merke-neam.png`, og formatnavnene i eksportfilene er `neam-handleliste-1`
og `neam-varekatalog-1`. Importen validerer aldri feltet, så gamle
sikkerhetskopier går uendret inn.

### Til 7.5: de to migreringene

Ligger her fordi `hub.html` uansett skal ta over datalaget – gjøres de da,
gjøres de én gang i stedet for to.

**`DB_NAME` fra `familiehub` til `neam`.** IndexedDB per enhet. Et rått
navnebytte gir hver enhet en tom database. Riktig framgangsmåte: åpne den
gamle, kopiere alt over, verifisere, og først deretter slutte å lese fra
den. Overgangskoden må bli stående til alle fem enhetene har vært innom –
regn i måneder, ikke dager.

**`fh:`-prefikset i KV til `neam:`.** Samme jobb på serversiden: liste alle
nøkler, skrive dem på nytt under nytt prefiks, verifisere, slette de gamle.
Enklere enn IndexedDB fordi det finnes ett sted og ikke fem, men det er
fortsatt en migrering med tapsrisiko.

Argumentet for å ikke utsette i det uendelige: datamengden under det gamle
navnet vokser. Argumentet for å vente til 7.5: jobben er den samme uansett
når, og datalaget skal uansett røres da.

---

## 13. Neam-flaten – bygget 28.–29. august 2026

Assistenten er ikke lenger en plan. `felles-neam.js` (`?v=24`) og
`felles-neam.css` (`?v=10`) lastes nå av **alle fem sidene**. Panelet har
verktøy og bakgrunn bare i handleliste så langt; de fire andre laster flaten
og femmeren, men mangler ennå verktøy (se del 14, punkt 4). Dashboard rydder
femmeren i `nullstillHvile()` via `neamFemmerNed()`, så veggskjermen ikke blir
stående med et åpent grep. Index fikk `felles-dialog.js` + CSS på kjøpet, som
femmeren trenger.

### Modellvalget som ble tatt først

Ramme-modellen (`hub.html` med sidene i iframes, panelet i skallet) ble
vurdert og lagt bort. Argumentet for den var at samtalen og en framtidig
kamerastrøm skulle overleve sidebytte. Uten kamera er samtalen det eneste,
og den overlever i `sessionStorage`. Kontrakten mot sidene er asynkron fra
første linje, så en senere flytting til ramme via `postMessage` endrer
ingen kallsteder. Det er grunnen til at del 6 er nedprioritert.

### Kontrakten

Fem funksjoner på `window`, alle valgfrie, alle asynkrone:

| Funksjon | Rolle |
|---|---|
| `neamKontekst()` | hvor er jeg, hva ser jeg – sant NÅ |
| `neamBakgrunn()` | det som alltid er sant om appen |
| `neamVerktoy()` | verktøylista, med egne felter under |
| `neamUtfor(navn, arg)` | kjører verktøyet |
| `neamStart(beskjed, valg)` | sida starter en oppgave |

Verktøyfeltene: `neamSkriver` (krever bekreftelse), `neamBeskriv(arg)`
(setningen i bekreftelsen), `neamTabell(arg)` (avkryssingstabell i
panelet), `neamSkjerm(arg)` (sida tegner sin egen fullskjerm; panelet
gjemmes; svaret legges oppå argumentene før `neamUtfor`).

`neamStart`-valgene: `friskt` (tøm samtalen), `modell` (lås modellen for
oppgaven – vises i knappen med fylt flate, ett trykk løfter låsen),
`verktoy` (begrens verktøylista for den ene turen).

Regelen: lesing går rett gjennom, parallelt. Skriving stopper og spør,
sekvensielt. Avslag er ikke feil – Neam får beskjed og foreslår noe annet.

### Rammene rundt

- **Tenkning er AV** (`thinking:{type:'disabled'}`). Dette var rotårsaken
  til all treghet: 28 000 tegn resonnement spiste hele `max_tokens` før
  svaret begynte. Målt, ikke gjettet – tre gjetninger bommet først.
- **`max_tokens` 4000, målt gjennomstrømming ~200 tokens/sek.** Farten er
  utskriving, ikke venting. `/api/claude` klemmer ikke taket (verifisert).
- **Avkutting sier alltid fra**, også når det står tekst foran, og logger
  blokker og tokens til konsollen. Stille feil kostet tre feilsøkingsrunder.
- **Tidsgrense 60 sek** med AbortController, uten nytt forsøk.
- **Nettsøk alltid på** (`web_search`, maks 3 per melding), tegnet som
  lilla linje med søkeordet. Systemteksten forbyr oppslag av husets egne
  ting på nettet.
- **Modellvelger i topplinja:** Haiku → Sonnet → Opus, husket i
  `localStorage` – en innstilling som vises hele tiden kan huskes.
- **`neamReparer()`** fyller inn manglende `tool_result` ved innlasting.
  Uten den låser ett avbrutt verktøykall hele samtalen permanent, siden
  historikken bor i `sessionStorage`.

### Importflyten – lagt om to ganger, endte her

Ingenting skrives ved import. Matlaging spør hvilken handletur varene skal
til (leser `handleliste:v1` rett fra KV), valget følger pakka. I
handlelista blir pakka liggende i innboksen, og Neam startes med kun to
verktøy: `les_ny_pakke` (rådata – hver ingrediens med mengder, enheter og
retter) og `foresla_import` (tabellen).

Tabellen er `view-import` i sidas eget design: kolonnene Vare, Mengde,
Enhet, Antall, Varetype (nedtrekk), Fra (kilde-chips), og en stryk-knapp
som gjør raden dus i stedet for å fjerne den. Basisvarer i to bolker under:
«Utelatt» (setning – det Neam tok bort selv) og «Usikker – ta med?»
(avkryssing). Ved «Legg inn» skrives varene, bekreftet varetype lagres i
varekatalogen – **malen lærer** – og pakka ryddes først da.

`kortGjennomgang()` i oppskrifter er frakoblet: den gjorde Neams jobb før
sending, uten noen å spørre, og var det som «hang» etter handletur-valget.
Står ubrukt sammen med view-merge; ryddes når det nye har stått en stund.

### Femmeren – navigasjon fra merket

Neam-merket i hjørnet er inngangen til alt. Trykk løfter det opp og folder ut
fire knapper rundt det, plassert som fem på en terning:

- **oppe venstre:** hjem (index)
- **oppe høyre:** applista (horisontal rekke, ikon + navn, sida du står på
  utelates)
- **midten:** samtalen med Neam
- **nede høyre:** lys/Homey – sier ærlig «kommer», med kroken `window.neamLys()`
- **nede venstre:** står ledig. Var «legg ned», men trykk utenfor gjør samme
  jobb, så knappen var overflødig.

Trykk utenfor legger femmeren ned. Applista er festet med `position:fixed;
left:14px; right:14px` og `flex-wrap`, etter at den rant utenfor skjermkanten
på telefon i stående.

Femmeren ligger i Neam-laget (`felles-neam.js`/`felles-neam.css`), ikke i
`felles-skall.css`. Det er med vilje: den hører til Neam, ikke til app-skallet
for oppskrifter og handleliste. Den flytter til skallet den dagen `hub.html`
kommer og skallet eier navigasjonen på ordentlig.

Skillet som skal gjelde framover: **venstre = «ut og Neam», høyre = «her og
nå».** Femmer-grepet skal generaliseres til et gjenbrukbart utfoldingsmønster
og erstatte de vertikale knapperekkene på høyre side.

**Stemme – spesifisert, ikke bygget.** Push-to-talk på langt trykk på merket:
hold gir en rød sirkulerende ring; slipp rett sender teksten til Neam; dra
høyre og slipp legger teksten i skrivefeltet for gjennomsyn først; dra venstre
avbryter. Kort trykk er femmeren, terskel ~0,5 sek. Retningen må vises mens man
drar. `webkitSpeechRecognition`, norsk, lokalt. **iPhone/iPad hjemskjerm-modus
må testes først** – historisk upålitelig der.

### Lærdommer med overføringsverdi

- **Når modellen gjør noe annet enn instruert: fjern muligheten
  strukturelt.** Tre ganger bekreftet. Verktøyfilteret per oppgave kom til
  fordi «ikke ta dem én og én» ikke satt uansett formulering.
- **Når Neam kaller samme verktøy repetitivt, mangler det data i det han
  alt får.** 21 katalogsøk ble til `basisvare` og `foreslattType` rett i
  `les_handlelista`.
- **Mål før gjetting.** Konsollmålingen mot `/api/claude` avgjorde på én
  runde det tre kodeendringer ikke fant.
- **Test i fersk samtale etter verktøyfiks** – historikken bærer gamle feil.
- **En reserveverdi skal ikke bli lærdom.** Importen skrev `'Annet'` inn i
  varekatalogen, som slås opp før stikkordene – «vann» var Annet for alltid.
- **Feil skal koste én runde, ikke tre:** skjermfeil gir rød boks,
  avkutting logger innholdet, tom tabell kaster.

### Kjente rester

- Sjekk om `/vareikoner/icons/annen-vare.svg` finnes på serveren – bilder
  skjules nå ved feil i stedet for å blinke, men årsaken står.
- `oppskrifter.html` har LF som de andre. CRLF-advarselen fra tidligere
  notater er utdatert.
- Alle fem sidene laster panelet, men bare handleliste har verktøy og bakgrunn.
  Oppskrifter, kalender, dashboard og index laster flaten og femmeren tomme
  (del 14, punkt 4).

---

## 14. Veien videre – besluttet 29. august 2026

Kvelden endte i arkitektur, ikke kode. Beslutningene, med begrunnelse:

**Strategien er «les overalt, skriv der du står, send beskjed til
resten».** Neam skal se hele huset fra hvilken som helst side. Han endrer
det sida hans eier. Det som hører hjemme et annet sted sendes dit – slik
Matlaging alt sender til innboksen.

**Rekkefølgen:** *(status 29. august kveld: punkt 1 og 2 GJORT – se del 15.
Punkt 3 står for tur, med angre-modellen beskrevet i åpne tråder.)*

1. ~~**Husregisteret.**~~ GJORT. Én KV-nøkkel (`husregister:v1`), et enkelt
   redigeringsskjema, én linje i hver sides `neamBakgrunn`. Hva huset
   alltid har, hva som aldri kjøpes, hvem som ikke spiser hva, hvilke
   butikker som gjelder. Liten jobb, treffer nesten alt som skurret i
   økta: basisvare-bolken som alltid var tom, vann-heuristikken,
   importspørsmål om salt. Læringen – at «det har vi i springen» i
   fritekstfeltet blir en oppføring – er ett verktøy til, med skjermen til
   å godkjenne. Skjemaet først.
2. ~~**Lesing på tvers**~~ GJORT (som felles verktøyblokk på alle fem, ikke bare handleliste). – `felles-data.js` med `lesHandleliste()`,
   `lesOppskrifter()`, `lesKatalog()`. Noen titalls linjer rett mot KV,
   ingen refaktorisering. Gir «trenger jeg melk til pølsegratengen» fra
   alle sider.
3. **Senk sperrene.** `endre_vare`, `slaa_sammen`, `sett_varetype` uten
   dialog, med angreknapp i stedet. Grensen som alt gjelder: en feil som
   er lett å se og lett å rette trenger ikke spørres om.

**Datalag-refaktoriseringen er utsatt med utløser, ikke avvist.**
Argumentet mot å ta den nå: skrivebehovene på tvers er ukjente, og et lag
bygget mot en gjettet assistent blir feil lag – samme grunn som felte
ramme-modellen. Utløseren: den dagen Neam trenger sin andre ekte skriving
på tvers, eller innboks-mønsteret skurrer for andre gang, gjøres jobben som
en avgrenset flytting med kjente krav. «Gjort riktig én gang betyr ikke
gjort før du vet hva det er.»

---

## 15. Husregisteret og lesing på tvers – bygget 29. august 2026

Del 14 punkt 1 og 2, gjennomført samme kveld.

**`felles-data.js`** er datalaget som var forutsatt, startet med
husregisteret og utvidet med leserne samme kveld. Innhold: `dataLes`/
`dataSkriv` (tynn KV-kontrakt: GET → `{value}`, PUT rå JSON),
husregisteret (`husregister:v1`, fem fritekst-bolker, buffer, formaterer),
`finnOppskrifter`/`lesOppskrift`/`lesUkeplan` (mot Matlagings `p:`-nøkler),
`lesHandleliste` (mot `handleliste:v1`), og `HUS_VERKTOY` + `husUtfor` +
`HUS_BAKGRUNN` – husets fire leseverktøy som alle fem sidene kobler på med
to linjer.

**Husregisteret:** fritekst per bolk, ikke rader – leseren er en
språkmodell, og «Emma spiser fisk hvis den ikke ser ut som fisk» er en
setning, ikke et felt. Alle i husstanden kan redigere. Skjemaet bor på
index (panelet «Huset», lukket med sammendragslinje), fordi registeret
ikke tilhører noen app. Tomme bolker utelates helt fra teksten Neam får –
en tom overskrift kan leses som «ingenting er forbudt». Bufferen varmes
ved sidelasting: neamSpor gir opp etter 2 sek, og går fristen ut faller
HELE bakgrunnen bort, ikke bare registeret.

**Bildestripping er datalagets ansvar.** En oppskrift kan være 4,5 MB
fordi rettbilde og stegbilder ligger som base64 i objektet; målt gikk én
oppskrift fra 400 487 til 333 tegn. Strippingen ligger i leseren og ikke
hos kallstedet – et filter man må huske å bruke er et filter som glemmes.
Indeksen bufres i 60 sekunder (tre søk lastet ellers 400 kB tre ganger).

**Delt i finn + les, ikke ett verktøy.** `finn_oppskrift` gir titler og
id-er, `les_oppskrift` ingrediensene til én. Ett verktøy som ga alt ville
sendt hele boka inn i samtalen – samme lærdom som de 21 katalogsøkene,
motsatt vei.

**Grensa som IKKE ble flyttet:** skriving går fortsatt bare der sida eier
dataene. Ikke fordi lesing er farlig, men fordi hver side holder sin egen
kopi i minnet – en skriving til handlelistas KV fra Matlaging gir en liste
som viser noe annet enn det som er lagret til den lastes på nytt.
Innboksen løser det, og den finnes. (Husregisteret er unntaket som
bekrefter regelen: én KV-nøkkel uten kopi i noen sides minne, derfor kan
det skrives hvorfra som helst når læringsverktøyet kommer.)

**Funn underveis:**
- **To varekataloger, ikke én.** Handleliste leser `vare-katalog`
  (uprefikset), Matlaging `p:vare-katalog`. Holdes i takt manuelt med
  «Last ned katalogen»/«Slå sammen». Skal de bli én, er det en beslutning,
  ikke en leserfunksjon.
- **`p:`-prefikset lekker.** Matlagings fullKey() er nå kunnskap i
  felles-data.js. Skrevet ned som argument for datalag-refaktoriseringen.
- **Navnekollisjoner i fellesfiler:** `UKEDAGER` og `ukeNokkel` fantes i
  dashboard (med ANNEN betydning), `mengdeTekst` i handleliste. En `const`
  deklarert to ganger er en SyntaxError som stopper hele sidens skript
  uten spor til årsaken. Alle interne hjelpere i felles-data.js heter nå
  `hus…`/`HUS_…`. Regel: en fellesfil som lastes av fem sider må regne med
  at alle vanlige norske ord alt er tatt.

**Neam på sider uten verktøy dikter.** Observert på Matlaging før
verktøyene kom: han oppga en konkret (oppdiktet) rett som torsdagens
middag og fant på en forklaring på hvorfor han ikke så oppskriftene.
Instruksen dekket handlinger, ikke påstander. HUS_BAKGRUNN sier nå
uttrykkelig: vet du ikke, si det – ikke gjett, og ikke finn på en
forklaring.

## 16. Sidefemmeren og felles-knapper – bygget 29. august 2026

**`felles-knapper.css`** (sjette flytting): `.btn`, `.btn-blokk` og de
seks betydningsklassene ut av oppskrifter og handleliste, `.btn-ghost` ut
av skallet, alt i én fil lastet av oppskrifter + handleliste + index.
Kalender og dashboard står UTENFOR med vilje: kalender har sin egen `.btn`
(`.ghost`/`.solid`/`.fare` – samme betydninger, andre navn), og to
.btn-definisjoner der den ene skygger stille for den andre er
`.btn-primary`-fella på nytt. Detaljene i designsystemet.

**Sidefemmeren** (høyre hjørne): speilvendt femmer med sidas eget merke.
Kontrakten er `window.neamSideHandlinger()` → `[{plass, navn, ikon,
gjor}]`, hentet ved hver åpning. Tomme plasser tegnes døde, ikke skjult –
fem faste posisjoner man lærer utenat er poenget, og trykk på en død plass
sier at den er ledig i stedet for å tie. `.bottom-bar` i handleliste og
kalender er løftet til 90px; femmeren skal spise dem side for side.

**`neamSti()`:** Cloudflare Pages serverer rene URL-er
(`/handleliste.html` → `/handleliste`), så alt som sammenlignet
`location.pathname` mot en skrevet sti bommet stille – både sidemerket og
«utelat sida du står på» i applista. Normaliserer `.html`, `/index` og
store bokstaver. Bruk den, aldri pathname direkte.

**Escape-trykket:** første trykk utenfor en åpen femmer lukker den og gjør
INGENTING annet – stopper forplantning, svelger klikket etterpå (0,7 sek
frist), men uten preventDefault på pointerdown, så rulling går. Gjelder
begge femmerne.

## 17. Paletten, bakgrunnen – og tre feller – 29. august 2026, kveld

**Paletten er varmet** mot steampunk-bakgrunnen: `--paper #FBF9F5`,
`--boks-mild #F1EDE5`, `--boks-kant #E2DCD0`, `--line #E6E1D8`,
`--paper-soft #F1EEE8`, `--bg-1/-2` tilsvarende, skyggen tonet mot --ink
og litt kraftigere. Alt kontrastregnet: mildeste flate mot --ink-soft gir
4,64 mot WCAG-grensen 4,5 – **ikke gjør disse mørkere uten å regne på
nytt.** Angrestien (de gamle verdiene) står som kommentar i felles-rot.css.
Skrivefelt og dokumentflater er fortsatt rent hvite med vilje.

**Bakgrunnen:** `bakgrunn.webp` + `bakgrunn-staaende.webp` (egne
komposisjoner, ikke rotasjon), 105/103 kB, q=86 målt mot banding i
midtpartiet. Lagene: gradient på `html` nederst, bildet i `body::before`
(fast, z-index:-1, pointer-events:none), innholdet øverst.
`--side-bakgrunn` er TRANSPARENT med vilje – sidene maler den på body, og
en gradient der la seg over bildelaget. `background-attachment:fixed` er
ute: iOS måler fast bakgrunn mot dokumentets høyde og blåste cover opp til
et utsnitt av det tomme midtpartiet.

**De tre fellene – samme feil i tre lag, alle truffet samme kveld:**

1. **Brent versjonsnummer.** `?v=`-bump i HTML før fellesfila er pushet →
   Cloudflare bufrer gammelt innhold under ny URL, for alltid. Symptom:
   fila er riktig åpnet direkte, gal for sida. Push fellesfil og HTML i
   samme commit; gjenbruk aldri et brukt nummer.
2. **Rene URL-er.** Se del 16 / neamSti().
3. **Forgiftet kant-cache.** En sti forespurt FØR fila fantes svarer 200
   med forsiden (Pages har ingen 404-side), og kanten bufrer det svaret.
   Fila kan så være hel i git, bygget og på pages.dev – og fortsatt gal på
   domenet. Ulike kantnoder har hver sin kopi, så det kan virke på PC og
   ikke på iPad samtidig. Kur: hard oppdatering / purge.

**Feilsøkingsregler som ble dyre å lære:**
- **«Kan det henge igjen?» sjekkes med hard oppdatering FØR noen teori
  formuleres.** Ctrl+Shift+R koster to sekunder og eliminerer et helt
  lag. (Magne foreslo det; det ble avfeid på feil grunnlag og kostet en
  time.)
- **200 betyr ingenting på Pages** – en manglende fil serveres som
  forsiden. Det er content-type som avslører den.
- **Mål per lag:** CSS-fila kan være fersk mens bildet den peker på er
  bufret gammelt. fetch() i konsollen og CSS-ens egen lasting går gjennom
  hver sin cache-vurdering.

---

**Avkreftet – ikke prøv igjen:** delte standardkalendere mellom personlige
kontoer, `/users/{eier}`-stier fra personlig konto, scopet
`Calendars.ReadWrite.Shared`, familiegruppekalenderen som delt flate,
utvidet tenkning i Neam-panelet (spiser hele svarbudsjettet), «skriv
tydeligere instruks» som svar på at modellen tar verktøy én om gangen. Nytt
i kveld: `background-attachment:fixed` med bilde (iOS-feilen, del 17),
gjenbruk av et `?v=`-nummer som har vært forespurt, drift-brytere i
husregisteret som brems på verktøy (strukturell sperre virker, prompt-tekst
gjør det ikke – tredje gang bekreftet), og `location.pathname` sammenlignet
mot skrevne stier (bruk neamSti()).

## 18. Emma dash – bygget 4. september 2026

**Prinsippet: egen fil per bruker.** `emma.html` er kopiert fra
`dashboard.html` og skåret til. Alternativet – én dash med brukerbryter –
ble lagt bort: en 13-årings skjerm og et kjøkkens veggskjerm har
forskjellige behov, og en fil som skal være begge blir dårlig på begge.
Konstantene øverst (`EIER`, `EIER_KALENDERE`, `EIER_MERKNADER`,
`DASH_TILGANG`) er det som skiller den fra kjøkkenet.

**Tre visninger i venstre kolonne:** Dag (kjøkkendashens plan), Uke (sju
søyler som kalenderappen) og Fag (rutenett av fagkort). Alle blar med piler
og sveip. Uke og Fag tar full bredde og skjuler høyrekolonnen.

**Fagfanen har sin egen uke.** Fra fredag klokka 18 peker Fag på uka som
kommer – ukeplanen for neste uke ligger ute i helga, og det er da den
legges inn. Gjelder bare Fag; Dag og Uke følger døgnskiftet klokka 20 som
før. Regnet fra mandagen i dag, ikke fra `dagenViser()`, og
`dagOffset` legges *oppå* skiftet – ellers gjorde første pilklikk
ingenting i helga. Tolv tilfeller testet.

**Fagkortet:** merket til venstre (fast bredde, høyde av bildet), teksten i
egen kolonne til høyre, stables under 520 px. Ingen hake i oversikten –
avkryssing skjer i fagvinduet. Stempel på skrå over merket: «Ingen lekser»
i rødt, «Ferdig» i grønt (grønt betyr gjort som haken; rødt betyr sletter,
og en farge kan ikke bety to ting).

**Fagvinduet** dekker 88 % av skjermen: læringsmål for uka øverst,
lekser med hake og hastestripe, prøver, og et notatfelt som lagrer seg
selv (600 ms etter siste tastetrykk, ved blur, og ved lukking). Notat og
læringsmål skrives *ikke* via `endreFag()` – den tegner vinduet om og tar
markøren ut av feltet.

**Hastefarger på lekser er tidsproporsjonale:** gul ved ≤ 50 % av tida
igjen, rød ved ≤ 15 %, forfalt eller frist i dag. Antatt frist fra
`TIMEPLAN` når planen mangler dato: siste dagen faget har time den uka,
merket oransje «antatt» i forslagspanelet.

**Lekser i Påminnelser i dag er utledet, ikke kopiert.** Raden viser
merket «lekse», ingen hake (krysses ut under Fag). Kjøkkendashen leser
`emma-fag:v1` og viser de samme radene. Én sannhet, vist to steder.

**Mobil:** under 700 px snus prinsippet – sida ruller, kortene gjør det
ikke. Ukesvisningen ruller sidelengs med sju søyler i samme rullefelt.
Dialogene fyller skjermen. `touch-action:pan-y` på kortene så sveipen ikke
slår inn under loddrett rulling.

**Merkeoppslaget er tolerant:** `fagNoekkel()` normaliserer navn (parentes,
tegnsetting, store bokstaver) og kallenavnene fra timeplanen er alias.
«Utdanningsvalg (UTV)» fant ikke merket sitt før dette. Oppslaget bygges
ved *første bruk* – første utgave var en IIFE som leste `FAG_KALLENAVN`
hundre tusen tegn lenger ned i fila, og et `const` lest før initialisering
tar ned hele skriptet uten en advarsel.

## 19. Fagmodellen og Neam-verktøyene – 4.–5. september 2026

**KV-nøkler:** `emma-fag:v1` (fag, lekser, prøver – ett oppslag),
`emma-bilde:<id>` (bilder i lekser, ett per bilde), `fh:huskeliste` delt
med kjøkkenet og filtrert på `EIER_MERKNADER`.

**Modellen:**
```
fag:    {id, navn, laerer, dager:[0-6], notat, maal:{"2026-W36": tekst}}
lekser: {id, fagId, tekst, frist, ferdig, laget, nar, av, bilder:[]}
prover: {id, fagId, type, dato, karakter, av}
```
Læringsmål ligger **per uke** – ett felt ville blitt overskrevet hver
mandag. `av` er hvem som la inn (Emma/Magne/Nina/Neam); `nar` er
klokkeslett, redigerbart. Ukedager tas imot i alle former (`dagerInn`):
array, streng med komma/og/skråstrek, tall, korte og lange navn, uten
særtegn. Atten former testet.

**Seksten verktøy.** Lesende: `les_fagene`, `les_lekser`, `les_prover`,
`les_paaminnelser`, `list_skoleplaner`, `hent_skoleplan`. Skrivende:
`legg_til_lekse`, `endre_lekse`, `slett_lekse`, `legg_til_prove`,
`endre_prove`, `endre_fag`, `legg_til_fag`, `sett_laeringsmaal`,
`legg_til_paaminnelse`. Via godkjenning: `foreslaa_lekser` – tar lekser
*og* læringsmål i samme kall og legger dem fram gruppert per fag.

**Rutingen av beskjeder ligger i verktøyet, ikke i Neams hode.**
`legg_til_paaminnelse` med dato → «i dag» på den datoen; uten dato →
«denne uken» i uka Neam oppgir (`uke`-argument), ellers uka skjermen står
på – som nesten aldri er planens. Lekser med frist viser seg av seg selv i
Påminnelser i dag, og Neam er instruert til aldri å føre dem inn en gang
til.

**Ukesjekk mot innholdet:** `hent_skoleplan` gir ukenummer fra både
lenkenavnet og de første 400 tegnene i dokumentet, og ber Neam spørre når
de spriker. `foreslaa_lekser` merker frister som havner utenfor planens
uke i rødt.

**Neam vet at hun heter Emma.** Ukeplanen er felles for trinnet; beskjeder
med hennes navn tas med, med andre navn ikke, uten navn gjelder klassen.

**Forslagspanelet** er gruppert per fag med undertekstene «Læringsmål» og
«Lekser», fagnavnet redigeres én gang i overskriften og flytter hele
gruppa, tekstfelt vokser med innholdet (`voksFelt`). Ett rullefelt – to
flex-bokser i samme dialog klemte lekselista til null høyde mens
teksten over sa at fem frister var antatt.

**Bildetilgang:** `neamStart(beskjed, {bilder:[{type,data}]})` bygger
innholdet som blokker, bildene først. Miniatyr vises i samtalen selv når
instruksen er skjult (`auto`). Historikk-kuttingen godtar en bildemelding
som ekte brukertur. «Skann ark» åpner kameraet
(`capture=environment`), inntil fire sider, krympet til 1400 px.

## 20. Proxyene – `/api/hent` og `/api/sjo`

**`functions/api/hent.js`** henter skolens ukeplaner. Verten er låst til
`roligheden.skole.arendal.no`. `?hva=liste` gir lenkene; `?hva=fil&url=`
laster en .docx og pakker den ut til tekst med en ren ZIP-leser i Workers
(`DecompressionStream`, ingen npm). Tabeller: rader med `\n`, celler med
` | `. Titler over tabeller tok tre forsøk – løst ved å merke `<w:tbl>`
eksplisitt. Filtypen avgjøres av de fire første bytene, ikke av navnet
eller content-type (skolens getfile.php sender octet-stream). `?alle=1`
gir alle lenker ufiltrert, til diagnose.

**`functions/api/sjo.js`** skulle hente sjøtemperatur fra HI Flødevigen.
Visningssida `draw.map` har ingen tall – de lastes med JavaScript fra
`updateLastReadings.ajx?boey=1`, som svarer XML med CDATA (`<depth>`,
`<dval>`, `<date>`, `<time>`, `<measure><type>0</type>` = temperatur).
Tolkeren er skrevet mot den formen og testet. **Men endepunktet svarer 404
til Cloudflares adresser** uansett GET/POST/Referer/X-Requested-With/
sesjonskake/Accept – og 200 fra en norsk IP. Se del 24.

**Regel funnet i kveld: aldri svar 502 fra en Pages Function når du vil
si noe.** Cloudflare bytter kroppen med sin egen «Bad gateway»-side, og
diagnosen forsvinner. `sjo.js` svarer 200 med `{feil, start}`; `hent.js`
bør rettes samme vei.

## 21. Fireren – merker, menyer og rør – 4.–5. september 2026

**Like knapper i alle visninger.** Høyre firer på Emma dash er `opp`
Rediger (→ Rediger fag, Slett ukas lekser), `skraa` Roligheden (→ Ukeplan
→ Hent fra nett / Lim inn / Skann ark / Se på nett; Timeplan), `ved` Legg
til (→ Påminnelse → I dag / Denne uken; Avtale; Lekse; Prøve; Fag).
Kjøkkendashen har `ved` Påminnelser. Plussene i korttitlene og
snarveiene i fagoverskriften er borte.

**Menyene går i dybden.** `neamSideStabel()` erstatter stabelen på samme
plass; et valg merket `meny:true` beholder fireren oppe i stedet for å slå
den ned. Uten det hang undermenyen i en lukket firer og knappene forsvant.

**`fra-skraa`** manglet – skrå-stabelen falt i `ved`-grenen én knapp for
lavt. Lagt til i CSS, speilvendt for høyre.

**Knappemerker:** `merke:true` + `knappMerke('navn')` gir en knapp uten
skive og uten tekst – merket bærer navnet. Teksten følger med skjult, og
**faller tilbake når bildet ikke laster** (`neamMerkeFeilet`): skive og
navn i stedet for en usynlig knapp. Det skjedde da mappa het `Knapper`
med stor K – Windows bryr seg ikke, Linux gjør det.

**Rør på yttersiden.** `neamRorKolonne()` tegner ledning 14 px utenfor
knappene mot skjermkanten, T-stykke ved hver knapp, bend øverst og
nederst. De manglende delene ble laget av de eksisterende: `bend-ov`/
`bend-oh` er `bend-nv`/`bend-nh` speilet loddrett, `t-venstre`/`t-hoyre`
er `t-ned` dreid en kvart runde – lyset ligger på yttersvingen og tåler
det, i motsetning til fri rotasjon. Måltall målt på filene, ikke gjettet.
**`bottom` regner fra bunnen; måltallene i CSS-en er fra toppen** –
kryssene lå ti piksler feil til det var rettet.

**Fiskebeinet.** Applista er en loddrett stamme med par på tverrbjelker
og en enslig på toppen (2-2-1 med fem, 2-2-2 med seks). Stammen står i
midtkolonnen, rett over `skraa`, så ingen diagonal trengs. `kryss.png`
brukes der stammen fortsetter opp gjennom en bjelke; T der den slutter.
`.neam-apper.fiskeben` hadde samme spesifisitet som `[hidden]` og sto
sist – lista lot seg åpne, aldri lukke.

**Telefon:** radstabelen blir kolonne under 900 px, plassert over begge
radene i fireren (ellers landet den oppå `skraa`). Over tre valg legges
kolonner i to rader også på telefon – fire valg over hverandre nådde
toppen av skjermen.

## 22. Fem feller i datalaget – funnet 5. september 2026

Alle fem ga samme symptom utenfra: «verktøyet svarte OK, men ingenting
ble lagret.»

1. **Parallelle skrivinger.** `felles-neam.js` kjører verktøykall som
   ikke er `neamSkriver` gjennom `Promise.all`. Elleve `endre_fag` leste
   samme utgangspunkt og skrev tilbake; ett overlevde. Simulert: 1 av 11.
   **Kur: kø** (`iKo`) rundt `endreFag`/`endreHuske` i datalaget – ikke
   `neamSkriver`, som gir en dialog per kall. 11 av 11 etter.
2. **Speiling som ruller tilbake.** KV cacher lesinger 60 s. Speilingen
   hvert tredje sekund fikk den gamle verdien, så den var «annerledes»
   enn det vi nettopp skrev, og la den over. Neste skriving bygde på den
   gamle. **Kur: vakt** (`erUtdatert`) – en lesing som er *nøyaktig* det
   som sto før vår skriving er cache, og ignoreres i 90 s. Simulert med
   KV-etterligning: 11 av 11.
3. **Byggeskript som melder ok og aldri skriver.** Skriptene avbrøt ved
   første feilende steg *etter* å ha meldt ok på de foregående – fila ble
   aldri skrevet, og jeg leverte en fil der endringene ikke var. Tre
   ganger. Kur: samle feil, skriv alltid det som gikk gjennom, list
   feilene til slutt.
4. **Klipp med `s.index()` mellom to merker** tok med seg CSS som var lagt
   inn imellom. Lekseblokkas CSS forsvant slik.
5. **`const` i IIFE før definisjonen** – se del 18.

**Speilingen er avmålt:** 3 s gir ingenting over KVs 60-sekundersgulv.
Målt: 12 198 forespørsler på 7,8 timer. Skal ned til 15–20 s, eller
erstattes av D1 + WebSocket i skallet.

## 23. Kalenderfeilen – 5. september 2026

Emma så ikke en avtale i sin egen kalender som sys så. Tre teorier ble
prøvd før konsollen ga svaret: filteret `EIER_KALENDERE` (nei), Outlooks
replika av delte kalendere (nei – Outlook viste avtalen), og til slutt
**mellomlageret**: `fh_kal_cache` i localStorage lagret kalenderlista med
Graph-ID-er uten å knytte den til brukeren. Et brukerbytte i samme
nettleser ga Emma sys sine ID-er; Graph svarte 404 «not found in the
store» på hver kalender inkludert hennes egen, mens cachen tegnet en full
uke fra før. Utenfra så det ut som ett hull.

**Kur:** cachen bærer kontoen (`konto`) og forkastes i `loadMe()` når
identiteten er kjent – cachen leses med vilje *før* det, for at skjermen
ikke skal stå tom. Ryddes ved utlogging. Ingenting ble tregere.

**Regel som ble dyr:** *be om konsollen før teorien.* De to gangene jeg
fikk den (kalenderen, knappemerkene) var feilen funnet på ett minutt; de
fire rundene med skjermbilder ga fire gale teorier.

## 24. Sjøtemperatur – besluttet 5. september 2026, natt

**Visningen er ferdig** på begge dashene: «🌊 16,4°» med «1 m · kl. 03:59»
under, der timestripa sto. Over et døgn gammel → tallet dempet, tidspunktet
i rødt med «gammel». Hentes ved oppstart og hver vekking. Tomt felt når
ingen kilde svarer – ingenting å vise er bedre enn et gammelt tall som ser
ferskt ut. Leser `/api/sjo` først, så KV-nøkkelen `sjo`.

**Veien: Homey.** Cloudflare avvises av HI. Alternativer som ble veid:
Frost-API (annen måling, ikke Flødevigen), GitHub Actions (nøyaktig, men
enda en plass ting kjører), Neam (står bak samme dører). Homey står i
huset med norsk IP og kjører allerede.

**Oppsettet** (i `homey/OPPSETT.md`, ikke i git): servicetoken i Zero
Trust; **egen Access-applikasjon for `neam.no/api/data`** med to policyer –
familien (Allow) og tokenet (Service Auth) – så tokenet ikke kan nå
sidene; HomeyScript `sjotemperatur.js` som henter, tolker og PUT-er
`{temp, dybde, tid, kilde, hentet}`; flyt hvert kvarter. Skriptet er
kjørt med stubbet nett mot den faktiske XML-en.

**Første gang noe annet enn en person får tilgang til neam.no.** Derfor
den egne applikasjonen – og familien må stå i den også, ellers stenges de
ute fra sine egne data.

---

**Avkreftet – ikke prøv igjen (tillegg 5. september):** `neamSkriver` som
kur mot parallelle skrivinger (dialog per kall); raskere polling mot KV
(60-sekundersgulv); WebSocket før `hub.html` (må rives); Cloudflare mot
HI sitt `.ajx`-endepunkt (IP-avvist); 502 fra Pages Functions med
diagnose i kroppen (Cloudflare bytter kroppen); klipping av merker som
overlapper i kilden (regenerer arket); `bred` slått av på telefon (fire
over hverandre når toppen); flytende merke med tekst ved siden (float +
flex-boks er uforutsigbart – to kolonner); `min-height` + `overflow:hidden`
som sperre mot kort som ikke vokser (de klippet innholdet).


## 25. Andrea dash og den andre skolen – 11. september 2026

**Bygget fra `emma.html`, ikke fra kjøkkendashen.** Emma dash var allerede
skåret til for et barn; Andrea dash er samme snitt med andre konstanter.
Det som skiller den: `EIER`, `EIER_KALENDERE`, `EIER_MERKNADER`,
`DASH_TILGANG`, fagnøkkelen `andrea-fag:v1`, barneskolefagene, timeplanen
for 4. trinn (gruppe Skare), og skolen.

**Byggeskript framfor manuell redigering.** Fila er 7 400 linjer, og et
navnebytte på tvers av den kan ikke gjøres for hånd. Skriptet verifiserer
at hver søkestreng finnes **nøyaktig n ganger**, samler avvikene, skriver
fila uansett og lister feilene til slutt. Mønsteret er nå brukt i fire
runder og har fanget flere feil enn det har laget.

**Plassholdere må ikke inneholde ordet som byttes.** Første forsøk brukte
`@@EMMA_HOLD@@` for å beskytte steder der «Emma» skulle bli stående – og
det globale navnebyttet traff plassholderen selv. De endelige het
`@@PH_EH@@`.

**Et navnebytte treffer også kommentarene dine.** «HVA SOM SKILLER DEN FRA
EMMA DASH» ble til «… FRA ANDREA DASH», altså en overskrift som sier at
fila skiller seg fra seg selv. Les gjennom kommentarene etter et globalt
bytte.

**Delte timer i timeplanen.** «Norsk/Matte» er to fag i én time.
`timeplanFagListe()` splitter på skråstrek, og `timeplanDager()` teller
dagen for begge. Uten det mistet Matematikk tirsdag og torsdag – uten at
noe så galt ut.

**`LEKSEDAG = 4`.** På barneskolen har ukeleksene ingen egen dato; fredag
står «Innlevering lekser». `sisteFagdag()` returnerer derfor fredag i
planens uke, ikke siste dagen faget har time (Emmas regel). `null` gir
Emma-regelen tilbake.

**`antattGrunn()` er en funksjon, ikke en const.** Den leser `UKEDAGER`,
som er deklarert lenger ned i fila. En `const` lest før initialisering
kaster og tar ned hele skriptet. Samme felle som del 18.

### Sandnes skole – PDF i stedet for .docx

**Egen proxy, ikke en gren i `hent.js`.** To skoler, to helt ulike sider.
Én fil med to greiner ville vært to filer i én.
`functions/api/sandnes.js`: `?hva=liste&trinn=4` gir PDF-lenkene med
uketall, `?hva=fil&url=…` gir PDF-en som base64. Verten er låst til
`www.arendal.kommune.no`, stien til `/sandnesskole/`.

**Filtypen avgjøres av de fire første bytene (`%PDF`), ikke av
content-type.** Tjenere lyver om content-type.

**Base64 i biter à 0x8000.** Hele fila gjennom `String.fromCharCode`
sprenger kallstakken.

**Feil svares alltid med 200 + `{feil}`.** Aldri 502 – Cloudflare bytter
kroppen på 502 og diagnosen forsvinner. Bekreftet i del 20, brukt her fra
starten.

**Kommunen slipper Cloudflare inn.** I motsetning til HI (del 24). Det var
ikke gitt, og det var det eneste som ikke kunne testes herfra.

### PDF til Neam – `felles-neam.js` v64

`neamStart(beskjed, {dokumenter:[{type, data, navn}]})`. Dokumentblokker
først, så bilder, så tekst. `neamKlipp()` regner en dokumentmelding som en
ekte brukertur. Proxyen `/api/claude` sender kroppen videre uendret uten
størrelsesgrense – verifisert, ingen endring nødvendig.

**Henting skjer i KNAPPEN, ikke som Neam-verktøy.** Emma dash har
`list_skoleplaner` og `hent_skoleplan`; de er tatt ut her. Knappen henter
PDF-en og gir den til Neam i samme melding som instruksen. Et dokument i
et *verktøysvar* er en form som ikke er prøvd mot API-et, og det er ikke
stedet å finne det ut.

**`velgUkeplan()`** tar uka Fag-visningen står på, ellers den nyeste målt
som «lengst fram i tid» – som tåler nyttårsskiftet, der uke 1 er nyere enn
uke 52.

## 26. Mattespillet – 11. september 2026

**En egen side, ikke en visning i dashen.** `andrea-matte.html` lastes fra
et kort nederst i høyrekolonnen på Andrea dash. Neam står i den ene enden
av et messingrør, laderen i den andre; hvert riktige svar tenner en lampe
og flytter ham ett skritt. Et galt svar flytter ham ingenting.

**Valgene:** pluss, minus og ganging, én eller flere. Ganging folder ut
tabellene 1–10. Tre nivåer: Lett (0–5, ti oppgaver), Middels (0–7, ti),
Vanskelig (0–10, femten). **Nivå og regneart er uavhengige** – en
gangetabell går alltid 1–10 uansett nivå. Det var et uttrykkelig valg: det
er tabellen man øver på, ikke et intervall.

**Ingen klokke.** Bevisst.

**Stjerner:** 5 for alt riktig, så ned i femtedeler, med 1 som gulv – hun
har hjulpet ham uansett.

**Lagring i `andrea-matte:v1`,** med et speil i `localStorage`. Rekordene
er **utledet av rundene**, ikke lagret ved siden av dem, så de to kan ikke
bli uenige. Ved skriving flettes alltid minnet inn i det KV svarer, på
rundens id – KV cacher lesinger i 60 sekunder, og to korte runder etter
hverandre ville ellers mistet den første. En runde som ikke kom fram
sendes neste gang spillet åpnes.

**Redigering for `magne@` og `sys@`.** Identiteten hentes fra
`/cdn-cgi/access/get-identity`, ikke fra Graph: spillet logger ikke inn mot
Microsoft. **Svakheten er nedskrevet:** Access-sesjonen kan henge igjen som
forrige bruker på en delt iPad, og da ser Andrea knappen. Skal det bli
tett, må sida laste `felles-graph.js` og spørre Graph som dashen – og da
trengs Azure-adresser for `/andrea-matte`.

**Sletting fletter først, filtrerer så.** En runde spilt på en annen enhet
skal ikke ryke med. En *usendt* runde på en annen enhet kommer likevel
tilbake når den enheten åpner spillet; da sletter man den en gang til.
Skrevet ned fordi det ser ut som en feil når det skjer.

### Klassenavnkollisjonen – den dyreste feilen i spillet

Svarrubrikken brukte klassen `.tom` for «ingenting skrevet ennå». `.tom`
var allerede klassen for tomme lister nederst i samme fil, og den setter
`font-size:var(--t-meta)`. **En klasseregel slår arv.** Rubrikken sto
derfor i 14 px i stedet for de arvede 84, og vokste til full størrelse i
det første tallet kom.

**Dette er samme felle som `UKEDAGER` og `mengdeTekst` i `felles-data.js`
(del 15) – men i CSS.** I en fil som er stor nok, er alle de vanlige
ordene alt tatt. Regelen gjelder klassenavn like mye som JavaScript-navn.
Tilstanden heter nå `.ingen`.

**Symptomet var misvisende:** det så ut som et *breddeproblem*, og den
første fiksen (fast bredde) hadde skjult årsaken uten å fjerne den.
Måling – `getComputedStyle` på elementet, og et søk gjennom
`document.styleSheets` etter regler som treffer det – fant den på ett
forsøk.

**Robot, batteri og stjerne er bilder,** klippet ut av ett ark Magne
lagde. Røret, lampene og snakkeboblen er fortsatt CSS: boblen må vokse med
teksten, og røret må kunne være ti eller femten lamper langt.
Tom stjerne er **den samme fila avfarget i CSS** – ett bilde, to
tilstander, som ikke kan komme i utakt.

**Klipping:** bakgrunnen er hvit og motivet lyst beige, så alfa kan **ikke**
utledes av hvor lyst et piksel er – da blir robotkroppen halvgjennomsiktig.
Bakgrunnen flomfylles fra kantene i stedet. Webp mot png: 65 kB mot 305.

## 27. Portvakten – `.pages.dev` sto åpen

**Funnet 11. september 2026.** Cloudflare Pages gir prosjektet en
gratisadresse ved siden av vår egen: `familiehub-7us.pages.dev`. Den
serverer nøyaktig samme app, men **Access-policyen gjelder bare
`neam.no`.** Husregisteret kom ut som ren JSON i et privat vindu, uten
innlogging. `/api/data` svarer på både GET og PUT, så hele KV-lageret sto
åpent for lesing og skriving for den som kjente adressen.

**Access kan ikke settes på selve prosjektadressen.** En
Access-applikasjon på `*.familiehub-7us.pages.dev` dekker
forhåndsvisningene, men ikke `familiehub-7us.pages.dev` selv. Det er et
kjent hull hos Cloudflare, ikke et oppsett vi har gjort feil.

**Løsningen: `functions/_middleware.js`.** Den ligger i roten av
`functions/` og kjører før alt – hver side, hver fil, hvert API-kall.
Slutter vertsnavnet på `.pages.dev`, svares 403. Den følger med hver
utrulling, og dekker alt på én gang.

**Den stenger også forhåndsvisninger av grener.** Vi bruker dem ikke, men
skal de tas i bruk, må unntaket inn der.

**403 og ikke 404:** en side som later som den ikke finnes er vanskeligere
å feilsøke når noe en dag ikke virker, og adressen er ingen hemmelighet.

**Det som fortsatt står åpent som prinsipp:** `/api/data` har ingen egen
sperre og stoler fullt og helt på lagene foran. Ett hull der gir full
tilgang til KV. En sjekk av `Cf-Access-Authenticated-User-Email` i
funksjonen er det neste laget – men den bryter Homey-tokenet hvis den
gjøres uten å tenke på det. Hører sammen med Homey-jobben.

**Regel av dette:** når en ny vei inn i huset åpnes, skal den testes i et
privat vindu før den regnes som stengt. Det tok tolv sekunder å finne
dette da noen først så etter det.

## 28. Barnas lekser – én liste, ikke en kopi per barn

Kjøkkendashens lekseblokk gjaldt bare Emma. Da Andrea kom, sto valget
mellom å duplisere alt med «andrea» i navnene eller å gjøre det ene barnet
til en liste. **Duplisering koster det samme for to og mer for tre;** lista
koster likt uansett. `BARN = [{navn, nokkel}, …]`, og navnet er det samme
som i `PERSONER`, så farge og initial på raden faller på plass av seg selv.

**Id-ene er lokale for hvert barn.** Begge kan ha en lekse `l1` – id-ene
lever i hver sin nøkkel. Raden bærer derfor navnet:
`lekse:andrea:l1`. Uten det ville to søstre delt id på skjermen.

**Et barn som ikke svarer rører ingenting.** En tom liste og en mislykket
lesing ser like ut på skjermen, og den gamle er den riktigste av de to.

**Speilingen tegner én gang** selv om begge har endret seg, og ikke i det
hele tatt når ingenting er nytt.

**To ting testen avslørte, som var riktig oppførsel:** kjøkkendashen
skifter døgn klokka 20, så en fredag kveld står den allerede på lørdagen –
en test som la fristen på «i dag» feilet på noe som var riktig. Og
lekserader har ingen `data-id`: de er ikke merknader og kan ikke redigeres
derfra.

## 29. Ryddingen – 11. september 2026

**Halve lista var allerede gjort, og dokumentene visste det ikke.**

- `--lime`, `--lime-dark`, `--gronn`, `--oransje`, `--rod`, `--blue`,
  `--blue-light`: **null forekomster** i noen av de tjue filene. Alt bruker
  `--aksent`, `--handling-*` og `--danger` – 403 forekomster, alle på
  fellesnavn. Designsystemet v8 sa noe annet.
- `flis-*.png` og `bilder/fagkort/`: borte.
- Graph-koding: kartleggingen sa «ni steder» i kalenderen. `avtaleSti()` i
  `felles-graph.js` koder alt, og alle ni gikk allerede gjennom den.

**Lærdom: en oppryddingsliste råtner fortere enn koden.** Tell opp før du
planlegger jobben. Å telle tok fem minutter; jobben jeg beskrev ut fra
dokumentet var to timer og for det meste unødvendig.

**Det som faktisk ble gjort:**

1. **`enc()` på kalender-id-en** i `calendarView`-stien – fire filer, én
   linje hver. Det var den siste ukodede Graph-stien i huset. Linja var
   kopiert videre hver gang en ny dash ble bygget fra den forrige, **så
   feilen spredte seg mens den ble rettet andre steder.** Det er
   argumentet for at en ny dash bør arve mer fra fellesfiler, ikke fra en
   fil.
2. **`.hu-ny`** ut av dashboard, emma og andrea – to regler per fil,
   ubrukt.
3. **`kortGjennomgang()`** med `FOERINGER_API`, `FOERINGER_STANDARD`,
   `hentFoeringer()`, `hentEksisterendeVarer()` og `TREFF_SYSTEM` ut av
   oppskrifter – 5 800 tegn, frakoblet siden 29. august.
   `HANDLELISTE_API` lå inne i blokka men brukes av `hentHandleturer()`,
   så den er flyttet ut. **Beskrivelsen av hvorfor det ikke gjettes ved
   overføring blir stående** – beslutningen gjelder fortsatt selv om koden
   er borte.

**Kontroll etter utklipp av CSS:** tell `{` mot `}`, tell hvor mange regler
som forsvant (ventet tall, ikke «noen»), og la en parser lese CSS-en på
nytt. Tekstsøk-utklipp i en 8 000-linjers fil fortjener tre uavhengige
sjekker.

---

**Avkreftet – ikke prøv igjen (tillegg 11. september):** Access-policy på
selve `prosjekt.pages.dev` (dekker bare undernavnene); dokumenter og bilder
i *verktøysvar* til Claude (uprøvd form – legg dem i brukermeldingen);
klassenavn som `.tom`, `.ny`, `.liten` i en fil over noen tusen linjer
(kolliderer, og en klasseregel slår arv); plassholdere som inneholder ordet
et globalt navnebytte leter etter; oppryddingslister fra et dokument uten
opptelling først.


## 30. Innloggingen mot Microsoft – lagt om 11. september 2026, natt

**Problemet var ett sted, og det var ikke vårt.** Refresh-tokener som
sendes til en redirect-URI registrert som `spa` varer i **24 timer**, og
nye tokener hentet med dem arver samme utløp. Det kan ikke konfigureres
bort – det er Microsofts regel for klienttypen, ikke en innstilling. Alle
andre klienttyper får **90 dager, glidende**.

**Det var to tellere, ikke én.** Cloudflare Access har også en
sesjonslengde, standard 24 timer. Hos oss sto den allerede på én måned, så
den var ikke synderen – men den måtte sjekkes først, fordi den er gratis å
endre og ville gjort resten unødvendig hvis den var feil.

**Løsningen: `functions/api/ms.js`.** Vekslingen skjer på tjeneren med en
klienthemmelighet (`MS_CLIENT_SECRET`), og adressene er flyttet fra
«Single-page application» til «Web» i Azure. **Rekkefølgen er kritisk:**
koden må være ute FØR adressene flyttes, ellers er sida låst ute i
mellomtiden.

**Nettleseren ser aldri refresh-tokenet lenger.** Det ligger i KV under
`auth:ms:<epost>`, og sida får bare access tokens som varer en time.
Tidligere lå det i `localStorage`, lesbart for alt som kjørte på sida.
Omleggingen er altså også en innstramming.

**Nøkkelen ligger utenfor `fh:` med vilje.** `/api/data` legger på det
prefikset og slipper familien til alt som ligger der. Et refresh-token er
ikke noe noen skal kunne lese ut derfra – heller ikke oss selv fra en
annen side.

### Identiteten: e-postheaderen kom ikke fram

**`Cf-Access-Authenticated-User-Email` settes IKKE mot en Pages Function
hos oss.** Målt: `{"epostHeader":false,"jwtHeader":true,"cookie":true}`.
Access legger ved et signert bevis i tillegg, både som header
(`Cf-Access-Jwt-Assertion`) og som cookie (`CF_Authorization`), og det kom
fram. Funksjonene leser derfor tre kilder i rekkefølge.

**Beviset leses uten at signaturen kontrolleres.** Det holder fordi Access
gjør jobben før forespørselen når oss, og portvakten stenger veien utenom.
Skal det bli tett, må signaturen verifiseres mot
`https://<team>.cloudflareaccess.com/cdn-cgi/access/certs`. Skrevet ned i
kommentaren i fila så det ikke glemmes.

**Diagnosen som løste det:** `?hvem=1` på endepunktet svarer med hvilke
kilder som finnes – ja/nei per kilde, aldri innholdet, og e-posten maskert.
Uten den var «Ingen Access-identitet» en blindvei. **Et endepunkt som kan
si hvorfor det ikke virker, er verdt de ti linjene.**

## 31. Veien til Homey – `/api/homey`

**Cloudflare kan ikke nå Homey.** Den står på hjemmenettet, og hverken
IP-adressen eller `homeylocal.com`-navnet er tilgjengelig utenfra. Veien
går gjennom Athoms sky, som gir hver Homey Pro en offentlig `remoteUrl`.

**Fire steg, ikke ett:** OAuth2 mot `api.athom.com` → `GET /user/me` for
`remoteUrl` → `POST /delegation/token?audience=homey` → `POST
{remoteUrl}/api/manager/users/login`. Først da kan man spørre om enheter.
Steg 2–4 gjentas når sesjonen dør; steg 1 holder i praksis for alltid.

**Refresh-tokenet fra Athom utløper ALDRI**, med mindre brukeren trekker
tilbake tilgangen eller det går seks måneder uten et eneste kall. Mer
holdbart enn Microsofts 90 dager – ingen timer trengs.

### Athoms dokumentasjon tok feil to ganger

1. Spesifikasjonen sier `authorization_type=code` på autorisasjonen.
   Tjeneren svarte `{"response_type":"Invalid value"}`. Den vil ha
   standardnavnet.
2. Spesifikasjonen sier klienthemmeligheten skal sendes som
   **Basic-header**. Tjeneren svarte «Client credentials are invalid», og
   godtok den i **kroppen**.

**Grepet som løste begge:** send begge formene der det er ufarlig (to
feltnavn for koden), og prøv den ene og så den andre der det ikke er
(Basic først, kropp hvis nøklene avvises). **Begge samtidig er ikke et
alternativ** – mange tjenere avviser en forespørsel som viser legitimasjon
på to måter.

**Lærdom med overføringsverdi:** når en tjeneste har tatt feil i egen
dokumentasjon én gang, skal neste steg bygges tolerant framfor å stole på
teksten. Det koster noen linjer og sparer en runde med feilsøking per
uoverensstemmelse.

**En feilmelding kan være et OBJEKT.** Athom svarer noen ganger med
`error_description` som et objekt, ikke en streng. Uten håndtering blir det
til «[object Object]» på skjermen.

## 32. Sikkerhetssida og kameraet – 11. september 2026, natt

**Enhetene er merker der fargen ER tilstanden.** Ytterdøra: rød når døra
står åpen, grønn når låst, blå når ulåst og lukket, oransje uten kontakt.
Røykvarslerne: rød ved røyk eller feiltilstand, oransje ved lavt batteri
eller uten kontakt, grønn ellers. **Rekkefølgen er verst først** – en
varsler i alarm skal være rød selv om batteriet også er lavt.

**Valgene i dialogen bygges av `setable` på kapabilitetene.** Vi holder
ingen liste over hva en lås kan; Homey vet det, og en enhet som får flere
muligheter får riktige knapper uten at noe endres her.

**Å låse opp spør alltid.** Grensen ellers i huset er at en feil som er
lett å se og lett å rette ikke trenger dialog. En ytterdør som står ulåst
er ingen av delene: man ser den ikke, og man retter den ikke før man er
hjemme.

**Linja under merket utelates når det ikke er noe å si.** Et tomt felt
eller en strek er verre enn ingen linje.

### Kameraet – WebRTC

**Homey serverer video som WebRTC til frontenden** fra og med v12.12.0,
nettopp for at den skal kunne vises i nettleser og utenfor hjemmenettet.
Tapo-kameraet meldes inn som `rtsp` med h265-demukser, men kommer ut som
WebRTC.

**Stien ble funnet i Homeys egen webapp,** ikke i dokumentasjonen:
`POST {url}/api/manager/videos/video/{videoId}/offer`. Video-id-en står i
`videos[0].videoObj.id` på enheten.

**Formen på kroppen: JSON med feltet `offer`.** Nettverksloggen viste rå
SDP, men tjeneren svarte «Missing Parameter: offer» på nettopp det. Begge
former er derfor i koden – JSON først, tekst som reserve.

**Alle ICE-kandidater samles FØR tilbudet sendes.** Homey tar ikke imot
dem etterpå (ingen trickle), så et halvferdig tilbud gir en forbindelse som
aldri kobler seg opp. Med et tak på tre sekunder, så en kandidat som aldri
kommer ikke stopper alt.

**Selve strømmen går DIREKTE mellom nettleseren og kameraet.** Bare
utvekslingen går gjennom oss. Video gjennom en Pages Function ville vært
både tregt og dyrt.

**Et tilbud inneholder husets offentlige IP-adresse i klartekst.** Normalt
for WebRTC, men det skal derfor ikke lagres eller logges noe sted.

### Feilen som så ut som nettverket, og var vår egen

Bildet falt ut etter noen sekunder. «Kobler til kameraet» kom tilbake. En
omlasting hjalp. Alle tre peker mot nettet.

**Årsaken: `tegn()` bygde kamerafeltet på nytt ved hver oppfriskning.**
`<video>`-elementet ble byttet ut hvert tolvte sekund, mens strømmen gikk
videre i bakgrunnen mot et element som ikke lå i sida lenger.

**En videostrøm er TILSTAND.** Den tåler ikke at elementet under den byttes
ut. Kameraene tegnes nå bare når settet har endret seg; enhetene tegnes som
før. Samme feilklasse som «skip if busy»-flagg på rendering: et symptom som
peker utover, med årsak innenfor.

**Kameraet kan ikke styres.** Tapo-appen melder bare `alarm_motion`, og den
er lesbar. Finnes ikke bryteren i Homey, finnes den ikke for oss.

## 33. Fireren: Sikkerhet i hjørnet – og fiskebeinets tak

**«Til Dash» ble «Sikkerhet».** Kjøkkendashen nås fra applista som alle
andre sider; sikkerhet er det ene man vil nå UTEN å lete – er døra låst,
brenner det. En fast plass i hjørnet er verdt mer der.

**Knappen har ikke merke.** Et «Dash»-merke ville løyet, og regelen er at
et merke skal si nøyaktig det knappen gjør. Den faller derfor tilbake på
papirskive og tekst – samme reserve som når en merkefil mangler.

**Fiskebeinet nådde taket sitt.** Med åtte apper i lista viser den sju fra
hver side, altså 2-2-2-1 – fire nivåer. På iPad stakk toppen **46 px over
skjermkanten**, og merkene lå der uten å kunne trykkes. Ingenting sa fra.

**Løsningen er skalering, ikke et tak på antall apper.** Figuren måles mot
vindushøyden og krymper fra bunnen midt, der stammen går ned i knappen, så
festepunktet ikke flytter seg. Bunnen på 0,55 er der for at den ikke skal
kunne krympe til uleselighet – kommer man dit, er det lista som må
filtreres på innlogget bruker.

**Målingen leser CSS-variablene, ikke `getBoundingClientRect`.** Den skjer
før boksen vises, og en skjult boks har ingen høyde å måle.

---

**Avkreftet – ikke prøv igjen (tillegg natt til 12. september):**
SPA-registrering hvis man vil ha lengre enn 24 timer (hard grense hos
Microsoft); `Cf-Access-Authenticated-User-Email` som eneste identitetskilde
mot en Pages Function; Athoms dokumentasjon som fasit på parameternavn og
autentiseringsform; rå SDP i kroppen til `/offer` (vil ha JSON med `offer`);
trickle-ICE mot Homey; å bygge et `<video>`-element på nytt mens en strøm
går til det; lys- eller sirenestyring på Tapo-kameraet gjennom Homey
(appen melder bare `alarm_motion`).


## 34. Porsjoner i ukemenyen – 12. september 2026

**Det var halvveis bygget fra før.** Hver oppføring i ukemenyen hadde
`servings`, og overføringen til handlelista skalerte allerede hver
ingrediens med forholdet mellom valgte og oppskriftens egne porsjoner.
Det som manglet var at man **ble spurt**.

**Og man ble spurt av og til.** Gikk man via dagvelgeren, kom
porsjonsvalget. Var dagen alt valgt, hoppet `leggTilDirekte()` over det
som «et unødvendig mellomledd» og brukte oppskriftens tall. **Et valg som
noen ganger kommer og noen ganger ikke, er verre enn ett trykk ekstra.**

**Nå spørres det alltid**, og velgeren starter på `PLAN_STD_PORSJONER = 4`
— husstanden bestemmer hvor mange som skal spise, ikke den som skrev
oppskriften. Oppskriftens tall vises under, så man ser hva man skalerer
fra. Hver rett i ukemenyen har dessuten minus og pluss, som lagrer med én
gang og ruller tilbake hvis lagringen ryker.

### Tre feil som fulgte av den ene endringen

**Banneret løy.** `addToPlanDay()` nullstilte `planTargetDay` uten å tegne
banneret på nytt. Det ble stående og sa «Velg rett til lørdag» mens dagen
bak var borte — og da gjorde hvert trykk ingenting, uten at noe sa fra.
Feilen lå der fra før, men ble sjelden truffet; nå gikk alle retter den
veien. **En tilstand og en tekst som kan komme i utakt, kommer det før
eller siden.**

**Sperren mot dobbelttrykk låste seg selv.** En liste nederst i fila
pakker inn alle funksjoner som lagrer, med ett felles `appBusy`-flagg.
Både `leggTilDirekte` og `openDayPicker` sto der. Den ytre satte flagget,
den indre så at appen var opptatt og returnerte **stille**. Symptomet var
en pluss-knapp som ikke gjorde noe — uten en linje i konsollen.

**REGEL: en funksjon på den lista må aldri kalle en annen fra samme
liste.** `leggTilDirekte` er tatt ut; den lagrer ingenting lenger.

**Testmetoden narret meg to ganger.** `p.evaluate` når ikke skript-scope
med vanlig tilordning, og eval-wrappere rundt funksjoner forstyrret
målingen slik at alt så ut til å feile. Fasiten kom først av en `console.log`
lagt rett inn i fila. **Når sporingen er mer komplisert enn koden, mål
enklere.**

## 35. Krydderblandinger – 12. september 2026

**En helt vanlig oppskrift med kategorien «Krydderblandinger».** Det som
skiller den, er at navnet kan dukke opp som ingrediens i en annen oppskrift
— «tacokrydder, 2 ss» — og da blir det en lenke som viser innholdet uten
at man forlater retten man står i.

**Oppslaget normaliserer bort all luft og alle bindestreker:**
«Tacokrydder», «taco-krydder» og «TACO KRYDDER» er samme blanding, og folk
skriver det på alle tre måter. Hele navnet må stemme — «krydder» alene
treffer ingenting — så sammenslåingen gir ikke falske treff.

**Kartet bygges i `persistRecipeIndex()`**, ikke ved oppslag: indeksen
endres sjelden, ingredienslista slår opp mange ganger per oppskrift.

**Filteret ble snudd.** Sauser, Krydderblandinger og Tilbehør er
byggeklosser, ikke måltider. De starter **uten** avkryssing, mens alle
andre starter med. Det betyr at **en tom liste nå betyr «ingenting», ikke
«alt»** — en reell forskjell fra før. Til gjengjeld viser avkryssingene
faktisk tilstand; før sto alle tomme mens alt likevel vistes.

Oppskrifter uten kategori vises alltid: en oppskrift som ingen avkryssing
kan nå, ville vært borte for godt.

**Gjenstår (steg to):** spørsmålet ved overføring til handlelista — «har du
tacokrydder?» — der ja hopper over og nei legger inn de enkelte krydderne.

## 36. Neam legger inn oppskrifter – 12. september 2026

Verktøyet `legg_inn_oppskrifter` tar imot en liste brukeren limer inn og
legger dem fram som forslag med avkryssing per rad (`neamTabell`).

**Han skal ikke dikte, og det står i beskrivelsen.** En oppskrift han har
gjettet på ser nøyaktig like riktig ut som en du har gitt ham, og du
oppdager forskjellen først når maten smaker feil. Ingen bilder: et bilde
han fant et sted er en annen rett.

**Indeksen skrives ÉN gang til slutt.** Ti oppskrifter ville ellers gitt ti
skrivinger av hele lista.

### To feller på rad

**Verktøydefinisjonen som konstant tok ned hele skriptet.** Den leser
`CATEGORY_LIST`, som er deklarert lenger ned i fila. En `const` lest før
deklarasjonen er utført kaster, og da virker ingenting på sida. Samme felle
som `antattGrunn()` på Andrea dash (del 25). **Definisjonen er nå en
funksjon**, som leses når Neam spør.

**`tips` skal være rene strenger.** Jeg lagret notatet som `{text: …}`.
`renderTips()` kaller `.trim()` rett på hvert element, så oppskriften lot
seg **ikke åpne i det hele tatt** — den lå i lista og så helt normal ut.
Eneste symptom var at den ikke reagerte på trykk.

**LÆRDOM: jeg leste `saveRecipe()` for å finne feltnavnene, men ikke
`renderTips()` for å finne formen inni.** Felt for felt var riktig;
innholdet i ett av dem var ikke. Skriver man en ny datastruktur, må man
lese den som LESER den, ikke bare den som skriver.

`loadFullRecipe()` rydder nå formen ved lesing, hver gang — en oppskrift
med feil form åpner seg ikke, og da kommer man heller aldri til å rette
den.

### Oppskriftssidas firer

`ved` = Ny oppskrift, `skraa` = Ukemeny (åpne / legg i), `opp` = Sortering.
Andre trykk på håndtaket legger sida i utgangsstand.

**Sorteringsnavnene leses fra knappene i sorteringsmenyen** som alt finnes,
så det er én liste og ikke to.

**De gamle knappene er skjult, ikke fjernet.** Markupen kalles fortsatt —
fireren leser sorteringsnavnene derfra, og `renderPlanFab()` peker på
elementene. Å rive dem ut ville vært en større operasjon uten gevinst.

## 37. Safari, flex-barn og fiskebeinets rør

**Merkebilder ble gigantiske på iPhone.** Bildet ligger i en knapp med
`display:flex`, og **et flex-barn har `min-width:auto` som standard** —
altså sin egen naturlige bredde. Chrome ser gjennom fingrene med det;
Safari gjør det ikke. Et 512-pikslers merke fikk 512 piksler, og med
`overflow:visible` flommet det utover.

Det rammet bare Emma og Andrea dash — de eneste sidene med merkebilder i
fireren. Rettet med `min-width:0; max-width:100%` på `.neam-enhet img`.

**Kan ikke bekreftes i Chromium**, som tilgir feilen. Må ses på en ekte
iPhone.

**Og i to-rads-stabelen hang bare første kolonne sammen.** `::before` ga
rør til kolonnen over moderknappen; de andre sto løst over sin egen rad.
Knapper med klassen `.over` henger nå ned i raden under, samme grep som
`.rad` alt brukte.

## 38. Importkøen som fylte seg selv – 12. september 2026

**Symptomet:** «Neam ble avbrutt midt i — svaret ble for langt», gang på
gang, selv når Magne bare la til én rett.

**Første diagnose var feil.** Jeg hevet `max_tokens` fra 4000 til 12000 og
trodde det var lengden på ukens varer. Magne svarte «dette var kun en
rett», og da holdt ikke forklaringen.

**Den ekte årsaken:** en pakke fjernes fra innboksen **bare når importen
fullføres**. Avbryter man — eller blir Neam avbrutt — blir den liggende.
Det hadde samlet seg **sju pakker**, tre av dem samme rett. Hver ny import
leste alle: 169 varer i ett verktøykall. Det traff taket, som ga et nytt
avbrudd, som la igjen en pakke til.

**En selvforsterkende sirkel, ikke en tilfeldig feil.**

**Rettet med to ting:** sletteknapp per pakke og «slett alle», og en
**angre-stripe** etter hver import. Stripa forsvinner ikke av seg selv — en
import som gikk galt oppdages ofte først når man leser lista etterpå.
Angre fjerner bare rader som kom inn med importen, målt på id-er, så en
rad som ble slått sammen med noe som sto der fra før blir stående.

**Gjenstår:** importverktøyet sender hele den sammenslåtte lista tilbake,
ikke bare endringene. Kostnaden vokser med lengden på handlelista uansett
hvor lite man legger til, og taket vil treffes igjen en dag.

**LÆRDOM: et symptom som gjentar seg har ofte en tilstand bak seg.** Jeg
behandlet «for langt svar» som et spørsmål om størrelse to ganger før jeg
spurte hva som lå i køen.

---

## 39. Diktatspillet – 12. september 2026

Andrea har fem diktatord i uka. **Neam leser dem opp, hun skriver på et ark
han har laget, tar bilde, og han retter.** Bygget på én økt.

**Arket har ruter, og det er hele poenget.** Uten dem må modellen selv finne
hvor én bokstav slutter og den neste begynner i barneskrift, og en
feilsegmentert bokstav blir til en skrivefeil som ikke finnes. Med ruter er
spørsmålet «hva står i denne ruta».

**Tolv ruter til alle ord, ikke ordlengde.** Første utgave ga hvert ord like
mange ruter som bokstaver pluss to – men da røper arket hvor langt ordet er,
og lengden er en del av det hun skal kunne.

**Hjelpelinjer i rutene.** Ruta er 12 × 16,5 mm med tre soner som i en
skrivebok: tak, stiplet hjelpelinje 5,5 mm ned, kraftig hovedlinje 11 mm ned,
kjeller under. Hun ble usikker på hvor bokstaven skulle sitte – en tom
firkant sier ingenting om høyde. Linjene gir dessuten modellen noe å måle mot.

**Fasiten sendes ALDRI med bildet.** En modell som vet hva det skal stå,
leser det den venter å se. Den får bildet og antall rader, og
sammenligningen skjer i sida som ren tegnsammenligning.

**Oppstilling, ikke rute mot rute.** Målt feil: «MatTerialer» mot
«Materialer» er én bokstav for mye, men rute mot rute forskjøv alt etter den
ekstra T-en og gjorde ett tastetrykk til åtte feil bokstaver. Nå brukes
redigeringsavstand med fire trekk – lik, feil, for mye, mangler.

**`i`, `l` og `I` regnes som samme tegn.** Dette er den avgjørelsen som
lettest blir snudd av en misforståelse senere, så den står med begrunnelse:
stor I og liten l er nøyaktig samme strek, og en rute har ingen skrivelinje.
Med blandet barneskrift traff forvekslingen nesten annethvert ord. Prisen er
at «vil» og «vii» ikke skilles. Den er betalt med vitende og vilje –
**bildet inneholder ikke informasjonen som trengs**, så alternativet er ikke
strengere retting, det er tilfeldig retting. Skal skillet tilbake, er det
arket som må endres, ikke koden.

**Store og små bokstaver ignoreres.** Mange på 4. trinn skriver med store
bokstaver hele veien; ellers ville hvert ord blitt feil av en grunn som ikke
har med staving å gjøre.

**En instruks kan lære modellen feil vane.** Jeg skrev «er du i tvil om
hvilket tegn som står i en rute, merk den usikker – for eksempel når streken
kan være både en l og en stor I». Da merket den hver eneste én. Eksempelet
BLE instruksen.

**Stjerner og prosent.** Én stjerne per helt riktig ord – diktat er alt
eller ingenting – og prosent over alle bokstavene i alle ordene **samlet**.
Per ord ville korte ord blitt urimelig harde: én feil i «vi» er femti
prosent, én feil i «kanskje» er fjorten.

**Uker med ISO-nummer, lagret på lista.** Nummeret regnes ikke ut av
tidspunktet hver gang: legger man inn ordene søndag kveld for uka som
kommer, ville lista skiftet navn ved midnatt.

**LÆRDOM: den dyreste feilen var at jeg gjettet feltnavn.** Se del 41.

---

## 40. Bekreftelse på alt som skriver – 13. september 2026

Andrea og Emma dash hadde ti skriveverktøy hver, men bare **sletting**
spurte først. Det var et bevisst valg, dokumentert i fila: en enkeltendring
er én ting om gangen, den er bedt om i klartekst, og den står på skjermen
etterpå – da gjelder regelen om at en handling kan miste dialogen når feilen
blir stående synlig.

**Magne omgjorde det:** alt som skriver eller sletter skal bekreftes.

**Prisen er kjent og skrevet ned:** «en dialog man får hver gang, er en
dialog man slutter å lese». Legger man inn fem lekser én og én, blir det fem
paneler.

**Derfor er hver setning gjort gjenkjennelig.** En bekreftelse man kan lese
på et halvt sekund er den eneste sorten som fortsatt blir lest når den
kommer ofte:

- Endringer slår opp teksten på id-en: *Huke av «Les side 42» i Norsk* –
  ikke id-en Neam sendte. Finnes ikke id-en, står det «en lekse som ikke
  finnes (xx)», og det ses **før** man trykker ja.
- Datoer formateres med ukedag. `2026-09-15` sier ingenting om det er i
  morgen.
- Avhuking sies for seg, ikke som «ferdig: ja» i en feltliste. Det er
  handlingen selv.

**To verktøy er med vilje ikke merket:** `foreslaa_lekser` skriver ingenting
i seg selv – den åpner godkjenningspanelet, og en bekreftelse der ville vært
en bekreftelse på å få se et skjema. Og `slett_lekse` spør allerede via
`bekreft()` i utførelsen; merking ville gitt to dialoger.

---

## 41. Leselaget – og tre gjettede feltnavn

`felles-lesalt.js` gir Neam lesing på tvers av appene fra alle sidene.

**Første utgave var delvis feil, og på samme måte tre ganger: jeg antok
feltnavn i stedet for å slå dem opp.**

| Verktøy | Jeg skrev | Det heter |
|---|---|---|
| handleliste | `vare`, `mengde`, `type` | `name`, `count`/`amt`/`unit`, `cat` |
| oppskrifter | `tags`, søk i ingredienser | `categories`; indeksen har ingen ingredienser |
| oppskrift | `servings`, `amount` | `baseServings`, `amount` *eller* `amountText` |

Alle tre ga tomme eller feil svar. Skolearbeidet og diktaten stemte – de
skrev jeg mot filer jeg nettopp hadde lest.

**Den større feilen: jeg bygget noe som alt fantes.** `HUS_VERKTOY` i
`felles-data.js` hadde hatt kryss-app-lesing for oppskrifter, ukemeny og
handleliste i to uker. Resultatet var tjue verktøy der fire var
nesten-duplikater – `les_handleliste` ved siden av `les_husets_handleliste`,
`les_oppskrifter` ved siden av `finn_oppskrift`.

**To verktøy som gjør nesten det samme er verre enn ett som gjør litt for
lite:** Neam velger ett av dem, og hvilket er tilfeldig. Duplikatene er
fjernet; `felles-lesalt.js` dekker nå bare det som ikke fantes –
**skolearbeid, diktatord og kalender**.

**Avsluttede handleturer er historie.** Den etablerte leseren filtrerte dem
alt bort (`husLevendeTurer`); min duplikat slapp dem gjennom, og Neam
rapporterte varer fra en tur som var ferdig som om de gjensto.

**Tvetydighet er bare tvetydig innenfor ett område.** Flere åpne handleturer
i samme område → Neam skal spørre hvilken. Dagligvarer og Andre varer er to
forskjellige lister for et menneske, og et spørsmål om hvilken av dem man
mener er et spørsmål ingen har stilt.

---

## 42. Skrivelaget – og regelen om hvem som vinner

`felles-skriv.js` gir skriving på tvers: handlelista i sin helhet (legge
til, fjerne, endre, huke av, ny/start/avslutt handletur), kalenderen (lage,
endre, slette) og navigasjon mellom sidene.

**Feltlista er slått opp mot sida, ikke gjettet.** Etter lesefeilen i del 41:
en lesing som bommer gir tomme rader, men **en skriving som bommer lager en
rad sida ikke kan vise, og den blir liggende.**

**Sidens egne verktøy vinner der man står.** `lesAltVerktoy(egne)` og
`skrivVerktoy(egne)` fjerner dem som kolliderer. Bare sidas eget ser hvilken
handletur brukeren har oppe og tegner lista om etterpå.

**Tre regler kom fra testing, ikke fra design:**

1. **«Nyeste åpne» er riktig for å legge til, feil for å endre.** Melk lå i
   Uke 38 mens Uke 39 var nyest, og «huk av melk» fant ingenting. Nå letes
   det gjennom alle åpne turer, nyeste først, og den som har varen vinner.
2. **«Avslutt handleturen» betyr den som er i gang**, ikke den nyeste. Ellers
   traff avslutningen en tom tur laget i går.
3. **Å avslutte krever et valg som ikke kan gjettes:** hva skjer med varene
   som ikke er kjøpt – la stå, flytt til neste tur, eller forkast.

**Serier kan røres, og det var jeg først for streng om.** Kommentaren i
`felles-graph.js` om at en enkeltdag ikke kan løftes ut av en serie står ved
`flyttAvtale()` og gjelder **flytting mellom kalendere** – der er den riktig,
fordi flytting i praksis er «lag ny, slett gammel». Graph tar imot både
PATCH og DELETE på en enkelt forekomst. Det farlige er tvetydigheten, og den
løses med `omfang` uten standardverdi.

**Navigasjon venter 2,5 sekunder.** Navigerer man i samme øyeblikk, ser
brukeren bare at sida bytter og får aldri vite hvorfor.

**Døra: å låse og å låse opp er ikke samme sak.** To verktøy, ikke ett med
et valg, så asymmetrien er synlig i navnet. Låsing går rett gjennom;
opplåsing krever godkjenning. **Risikoen som er igjen:** Neam leser tekst
andre har skrevet – kalendernotater, ukeplaner, e-post. En instruks som står
der er ikke en beskjed fra brukeren, og en opplåsing utløst slik etterlater
døra åpen for noen som står **utenfor**. At nettbrettet aldri forlater huset
hjelper ikke mot den.

---

## 43. Innloggingen samlet på forsiden – 13. september 2026

Huset hadde **tre forskjellige innlogginger**: dashboard/Andrea/Emma tegn
for tegn like, forsiden en eldre variant, og kalenderen den nye med økt på
serveren.

**Forsiden eier nå døra.** Den veksler koden gjennom `/api/ms` og lager den
90-dagers økta. Økta lagres som `auth:ms:<epost>` – **på personen, ikke på
sida** – så alle de andre sidene kan hente et ferskt access token uten å ha
en innlogging selv.

**Hvorfor forsiden og ikke kalenderen:** den er inngangen til huset, alle er
innom den uansett, og den blir til `hub.html`. Kjøkkendashen var uaktuell –
den kjører `kitchen@neam.no`, og en økt laget der ville tilhørt den kontoen.

**Azure-fella:** en returadresse kan ligge som «Single-page application»
**eller** som «Web», ikke begge. `/api/ms` veksler med klienthemmelighet,
som bare Web godtar. Flyttingen og deployen måtte derfor egentlig skje
samtidig. **Løst med en reservevei:** feiler serververslingen, faller
forsiden tilbake på den gamle direktevekslingen – og den virker nettopp så
lenge adressen er SPA. Da spiller rekkefølgen ingen rolle.

**4 800 tegn slettet per fil, tre ganger:** `base64url`, `lagVerifier`,
`lagChallenge`, PKCE-utgaven av `loggInn`, `bytt`, `lagreToken`, `lesToken`,
`gyldigToken`, `CFG` og `AUTH_BASE`. En app-id som ligger fem steder er en
app-id som kan bli ulik.

**En felle i utloggingen, funnet ved navigasjon.** `fh_ut` var et flagg uten
utløpstid: fullførte man ikke rundturen innom Microsoft, ble det liggende og
fyrte neste gang forsiden ble lastet – da ble man kastet ut av Access på et
helt annet tidspunkt. Flagget lagrer nå tidspunktet og godtas bare innen ett
minutt. **Feilen hadde ligget der siden utloggingen ble skrevet;
navigasjonsverktøyet gjorde den bare mye lettere å treffe.**

---

## 44. Neam visste ikke hvilken dag det var – 13. september 2026

Systemteksten inneholdt ingenting om tid. Han kunne lese en frist fra en
lekse og en dato fra en avtale, men ikke avgjøre om de var i morgen eller i
fjor – og «legg det inn på fredag» hadde han ingen måte å regne ut.

Nå står dato, ukedag, klokkeslett, ISO-form og ukenummer øverst i
systemteksten.

**Regnes ut ved hver melding, ikke ved sidelasting.** Kjøkkendashen står
våken i dagevis; en dato bakt inn ved oppstart ville vært gårsdagens lenge
før noen la merke til det – **og en feil dato ser ut som en riktig dato.**

---

## 45. Stemmen – 13. september 2026

`felles-tale.js`. Ut først, så inn.

**Ut:** en høyttalerknapp i panelets topp. Skjermtekst gjøres om til
talespråk – punktlister, fete ord og overskrifter fjernes, kodeblokker går ut
i sin helhet, lenker beholder teksten. Uten det blir det «stjerne stjerne
melk stjerne stjerne». Lange svar kuttes ved 700 tegn på en setningsslutt.

**Påskruingen sier «Stemmen er på», og det er ikke en hilsen.** iOS nekter
talesyntesen å si noe uten en brukerhandling bak seg, og sperren gjelder hele
økten. Uten en ytring i selve trykket står synteseren låst.

**Inn:** en mikrofonknapp ved siden av send. **Ett trykk, ikke hold** –
trykk-og-hold er vondt i en bil, og iOS legger en kontekstmeny oppå lange
trykk. Den stopper selv når man blir stille, og sender.

**Samtalemodus henger på høyttaleren.** Er stemmen på når man trykker
mikrofonen, går sløyfa til man trykker igjen. En samtale er nettopp det å
høre og bli hørt; er stemmen av, finnes det ingen samtale å fortsette.

**Fire ting måtte på plass for at sløyfa ikke skal spise seg selv:**
mikrofonen åpnes først når `taleSvar()` er ferdig (ellers hører han sin egen
stemme og svarer på den); tre tomme runder avslutter (ellers går den i det
uendelige med mikrofonen på og telefonen i lomma); lukket panel stopper
samtalen; og slås stemmen av, avsluttes den.

**Stemmevalget ligger bak et langt trykk på høyttaleren.** Stemmene finnes
bare på enheten man står på, så valget kan ikke gjøres i en fil – det må
gjøres der man hører resultatet, som regel på en telefon uten konsoll. Hver
endring sier noe med det samme.

**Tonehøyde 0,6.** Under omtrent 0,75 slutter en stemme å høres ut som et
menneske som snakker lavt, og begynner å høres ut som noe som er laget.
Under 0,5 forsvinner konsonantene.

**Ekte robotklang er ikke mulig i nettleseren.** `speechSynthesis` er en
avspiller, ikke en lydkilde – lyden går rett til høyttaleren, og vi får aldri
signalet. Se «Avtalt som neste sak» i toppblokka.

---

## 46. Cachefella – to ganger på én dag

**Regelen sto allerede i dokumentene:** bump aldri `?v=` før fila er pushet,
for da cacher Cloudflare permanent det gamle innholdet under den nye
adressen.

**Den andre halvdelen sto ikke:** *endrer du en fil etter at den er pushet,
må versjonen opp.*

Det skjedde to ganger 13. september. Jeg la fem verktøy i `felles-skriv.js`
etter at `?v=1` var ute, og rettet tre feltnavn i `felles-lesalt.js` på samme
måte. Nettleseren spurte etter `?v=1` og fikk det den fikk sist.

**Symptomet var villedende:** Neam svarte at verktøyet ikke fantes – og han
hadde rett, hos ham. Flere runder gikk med til å lete i koden.

**Diagnosen som avgjorde:** åpne `https://neam.no/felles-skriv.js?v=2`
direkte og søke etter verktøynavnet. Tre utfall, med hver sin årsak: fila er
riktig (cache i nettleseren), man får `index.html` (ikke pushet – Pages
svarer 200 med forsiden for filer som ikke finnes), eller fila mangler
innholdet (feil versjon pushet).

**Den endelige bekreftelsen kom fra konsollen:**
`(await window.neamVerktoy()).map(v => v.name)` – nøyaktig det Neam får se.
Det var også den som avslørte duplikatene i del 41.

**En samtale kan holde på en feil etter at den er rettet.** Neam hadde slått
fast flere ganger at verktøyet ikke fantes, og gjentok det i stedet for å se
etter på nytt. Verktøylista bygges ved hver melding, så den var riktig – det
var samtalen som dro ham tilbake. **Ny samtale var løsningen.**

---

---

## 47. Belønningssystemet – besluttet 13. september 2026, ikke bygget

*Diskutert i sin helhet, ikke påbegynt. Skrevet ned fordi begrunnelsene
ikke finnes noe annet sted enn i samtalen.*

**Formen:** Andrea og Emma får stjerner (XP) for gjennomførte gjøremål og
lekser. Når ukas sum er over en terskel – og visse obligatoriske gjøremål er
med – utløses ukepenger uka etter. Ukas XP nullstilles. **Overskuddet går
inn i en egen pool per barn**, og når poolen når en milepæl, følger en
større belønning. Begge deler vises på barnets dash.

**Hvorfor to tidsskalaer.** Uka gir noe å strekke seg etter nå; poolen gir
noe å bygge mot. Uten poolen blir alt over terskelen bortkastet, og da
slutter man å gjøre noe når man er i mål på onsdag.

**Overskudd må være det normale, ikke unntaket.** Er terskelen satt så høyt
at man akkurat klarer den, vokser poolen aldri, og den delen som skulle bære
det lange står stille i ukevis. Terskelen bør passeres torsdag, ikke søndag
kveld.

**Nullstillingen har en kjent svakhet:** hver uke har et punkt der barnet kan
regne ut at den ikke går – og fra da jobber systemet mot deg. Verst med
obligatoriske gjøremål: bommer hun mandag, er uka over mandag. Ikke løst;
skal vurderes når det bygges.

**Egne pooler, ikke felles.** Aldersforskjellen er for stor. Felles pool
inviterer dessuten til at den ene føler hun betaler for den andre – en
søskenkrangel systemet selv lager.

**Poeng måler INNSATS, ikke ansvar.** Da er «rydde rommet» verdt det samme
for begge. Det er det eneste som ikke blir urettferdig når de sammenligner –
og de kommer til å sammenligne, tallene står på hver sin dash i samme hus.
**Aldersforskjellen bæres av terskelen og ukepengene**, ikke av
poengverdiene: Emma har flere og tyngre gjøremål, altså høyere terskel,
altså mer i uka. Andrea ser at søsteren får mer, og ser samtidig hvorfor.

**Barnet krysser av, den voksne bekrefter.** Et system der barnet godkjenner
seg selv slutter å bety noe. **Bekreftelsen er anledningen til å se leksa** –
poengene er det som får den voksne til å gjøre det. Det er en bedre
begrunnelse enn belønningen i seg selv.

**Ikke god nok lekse sendes tilbake**, ikke avvises. Da blir godkjenningen
et sted arbeidet blir sett, ikke en dom – og det er den eneste varianten som
ikke gjør det fristende å la være å melde inn når man er usikker. Delvis
uttelling ble vraket: det krever en gradering klokka ni om kvelden.

**Bonus for over normalt bra gjennomført.** Teller **aldri** mot
ukesterskelen – uka skal være forutsigbar: gjør du det du skal, klarer du
den. Bonus hører hjemme i poolen.
- **Bonus må ha en grunn som blir sagt.** Ikke «+3», men «+3 fordi du gjorde
  hele oppgave 12 selv om bare halve var lekse». Da er det ikke et tall som
  dukker opp – det er at noen så noe bestemt.
- **Gis den ofte, blir den normalen**, og en godkjenning uten bonus blir en
  skuffelse. Gis den tilfeldig, er den lotteri og påvirker ingenting.

**Hagler det med bonus, hev prisen – ikke listen.** Å heve ukesterskelen
ville rammet det vanlige arbeidet for å dempe noe som skjer et annet sted,
og lært barnet at innsats koster. Riktig svar er at neste milepæl settes
lenger unna **fordi belønningen er større** – som i et spill, der kurven
stiger og premien vokser samtidig. Klarer man bare den ene halvdelen, er det
ikke progresjon, det er slitasje.

**Ingen levels.** Et level er en egenskap ved personen – du *er* level 12 –
og det gjør forskjellen mellom søstrene permanent på en skjerm de begge går
forbi. Poolen er en vei mot en ting, den tømmes når man kommer fram, og så
begynner en ny. Det er også sannere: det er ikke Andrea som er blitt større,
det er at hun har ryddet rommet tjue ganger.

**En milepæl flyttes ALDRI mens noen jobber mot den.** Endringer gjelder fra
neste runde. Ellers slutter tallet å bety noe, uansett hvor godt begrunnet
endringen er.

**Milepælen bestemmes når den settes, ikke når den nås.** En stripe som
fylles mot noe ukjent motiverer langt dårligere enn en mot noe man vet hva
er. Det forplikter: dere må kunne innfri den.

### Den største risikoen – uttalt av Magne selv

**«Den største sannsynlige grunnen til at dette ikke kommer til å fungere er
at vi voksne ikke holder koken.»**

Godkjenningen er den eneste delen som krever noe av de voksne hver dag. Alt
annet går av seg selv. Systemet står og faller på det leddet.

Følger:
- **Når de voksne svikter, skal det ikke gå ut over barna.** Poeng som ikke
  er godkjent fordi ingen rakk det, er ikke barnets feil. Ubehandlede
  innmeldinger bør telle til de er avvist – det plasserer kostnaden ved
  etterslepet hos den som forårsaket det.
- **Jo mindre de voksne må gjøre, jo lenger lever det.** En godkjenning som
  krever å åpne riktig side, finne riktig barn og trykke fire ganger, blir
  gjort i to uker. En som ligger som ett spørsmål på kjøkkendashen mens
  middagen koker, kan leve i årevis.
- **Avtalen mellom de to voksne er viktigere enn koden.** Hvem gjør det, når
  på dagen, hva skjer når den ene er bortreist.
- **Holder de ikke daglig, skal det designes ukentlig.** Et system som
  forutsetter noe man ikke gjør, er verre enn et enklere som passer.

### Ukepenger og Vipps

**Vipps' API er for bedrifter med avtale** – ikke en vei her. Det som
eventuelt finnes er en **dyplenke** som åpner appen med mottaker og beløp
fylt ut; man trykker send selv. **Ikke verifisert** – testes med én lenke på
telefonen den dagen det bygges.

**Knappen er ikke den verdifulle delen.** Å åpne Vipps og taste 180 tar
tjue sekunder i uka. Det som koster er å huske at det er søndag og hva
summen er. **Påminnelsen med et beløp man kan stole på er poenget** –
lenka er en bonus, og systemet er like nyttig uten.

**Kjøkkenskjermen har ikke Vipps.** Godkjenningen skjer der, utbetalingen på
telefonen.

---

## 48. Måltidet som egen ting – besluttet 13. september 2026, ikke bygget

**Oppskrift og måltid skilles.** Oppskriften er teksten; **måltidet er
gangen den ble laget**. Samme form som huset alt bruker: diktatlista mot
diktatrunden, handleturen mot varene. Det gir spørsmål som ikke finnes i
dag – «hvor mange ganger har vi hatt dette», «hvem lagde det sist».

**Flyten:**
1. Man åpner en oppskrift og trykker **begynn å lage denne retten**, og
   velger kokk. Oppskriften låses til det måltidet.
2. Alle koketider i teksten blir **trykkbare** – nedtelling startes i
   skallet.
3. Etter **30 minutter + forventet tidsbruk** kan måltidet **fryses**, med
   spørsmål om man fortsatt lager mat.
4. Kokken avslutter måltidet: velger hvem som spiste, kommenterer, og
   **velger hvem som skal spørres om karakter**.
5. De valgte får push med spørsmål om karakter og kommentar.

**Karakteren er verdt noe fordi den kommer fra dem som spiste**, ikke fra
den som tilfeldigvis åpner appen. Det er data som kan styre ukemenyen.

**Det frosne måltidet blokkerer neste.** Dette er selvopprydding, og det er
bedre enn automatisk lukking: neste gang noen skal lage mat, må de rydde opp
i forrige – det skjer innen et døgn, av seg selv, uten at noen må huske noe.
**Automatisk lukking ville gjettet på hva som skjedde; dette spør den som
faktisk vet.** Et måltid uten karakter er helt greit; et måltid som aldri
ble avsluttet er et hull i dataene.

**Sperren må si hva som er i veien:** «Nina startet kjøttkaker klokka 17:40,
den står fortsatt åpen» – ikke bare «lukk forrige måltid først». Ellers er
blokkeringen en gåte for den som kommer hjem sent og bare vil lage egg.

**Ett måltid om gangen.** Stemmer nesten hver kveld. Blir det i veien en
gang i halvåret, ser vi på det da.

**Kokken velger hvem som spørres** – det løser også når man skal la være.
Ingen regel om at femte taco ikke får karakter; kokken vet om det er noe å
spørre om. Og Andrea på ni skal ikke nødvendigvis ha et kommentarfelt hver
gang.

**Timeren på 30 min + koketid er en PÅMINNELSE til kokken**, ikke en
avgjørelse om at måltidet er over. Ellers kommer spørsmålet midt i middagen
den kvelden det tok lengre tid.

**Den dyreste delen: nedtellingen må overleve at man går ut av rommet.** En
timer som bare finnes i sida dør når man navigerer, låser skjermen eller
slipper appen – da er den dårligere enn komfyren. Den må lagres med et
**sluttidspunkt**, ikke som en teller som går. Det er en `hub.html`-sak.

---

## 49. Push – besluttet som retning 13. september 2026

**Høyt på lista, ikke bygget.** Ønsket omfang er bredt: «nå er det middag»,
brannalarm, meldinger mellom brukere, ukepenger, skolevarsler.

**Push krever en service worker.** Det er den som tar imot varselet når sida
er lukket. Det betyr at kostnaden ikke er «litt varsling», men **et nytt lag
mellom nettleseren og alt** – og en service worker er nettopp en cache, en
man selv må rydde i. Med tanke på hvor mange ganger cachefella har slått til
(del 46), er det verdt å si høyt.

**Offline kommer nesten gratis med**, men er ikke ønsket – det er greit.
Halve jobben blir gjort uansett.

**Tre ting må avgjøres før det bygges:**
1. **Varsler går til en PERSON, ikke en skjerm.** Abonnementet knyttes til
   Access-identiteten, slik økta gjør. Ellers får kjøkkenskjermen beskjed om
   at Emma har lekser, og den skjermen er ingen.
2. **Hvert varsel må vite hvor det fører.** En beskjed man ikke kan trykke
   på er halvveis. Alt som sender må oppgi en adresse – `gaa_til` i
   `felles-skriv.js` er allerede et hint om formen.
3. **Noe må våke.** Det finnes ingenting i Neam som kjører når ingen ser på.
   Ukepenger søndag, en dør som står ulåst til natta, et skolevarsel på
   e-post – alle trenger det samme, og det er ikke push. **Det er en klokke
   på serveren.** Det er egentlig den store mangelen i huset; push er bare
   måten et våkent system når deg på.

**Brannalarmen bør IKKE gå via nettpush.** iOS gir ingen garanti for
leveringstid, varselet kan holdes tilbake i strømsparing, og det kommer som
et varsel blant alle andre. Til noe som faktisk brenner bør det gå gjennom
Homey, som har alarmen og en app bygget for å bryte gjennom. Neam kan vise
det på skjermene, men ikke være veien beskjeden kommer.

**Meldinger mellom brukere er en ny app**, ikke en pushkilde – hvem sendte
til hvem, er den lest, hvor står den når man åpner Neam. Den forandrer hva
Neam er: fra et verktøy fire personer bruker hver for seg, til et sted der
folk snakker sammen gjennom det. Bør ikke bygges som biprodukt av push.

**Rekkefølge:** service worker og push først, med **én enkel kilde** –
ukepenger eller «nå er det middag». Når et varsel beviselig når fram til
telefonen fra kjøkkenskjermen, er resten kilder som kobles på. Feiler det,
har man spart seg en meldingsapp man ikke får varsler fra.

**Belønningssystemet er en god første kilde:** verdifull, ufarlig om den
kommer sent, og den kommer én gang i uka.

**Push er ikke nødvendig for å komme i gang.** En påminnelse i Påminnelser
med beløpet i teksten varsler på alle Magnes enheter i dag, uten noe nytt
lag. Kjøkkenskjermen kan vise «Ukepenger klare» søndag; telefonen gjør
jobben.

---

## 50. Språkmodus – besluttet 15. september 2026, ikke bygget

*Diskutert i bil, ikke påbegynt. Emma har begynt med spansk på skolen;
Andrea sliter litt med engelsk. Samme maskineri, to språk og to nivåer.*

**Hva det egentlig løser.** Barrieren er ikke å kunne ordene, det er å si
dem høyt til et annet menneske. En tålmodig robot som aldri sukker er et
billig sted å være dårlig i spansk. Det er derfor dette hører hjemme i
stemmen og ikke i et skjemafelt.

**Modellen kan språkene fra før.** Det som skal bygges er ikke spansk, det
er **når han bytter og hvor hardt han presser**. Det er en systemtekst, et
modusflagg og et gjenkjenningsspråk – lite kode målt mot resten av lista.

**Inngangen sies, den trykkes ikke.** Sier hun «hola, Neam», står spansk
resten av økta. Gjenkjenningen kan stå på norsk og likevel fange et tydelig
*hola* eller *buenos días* – slike ord kommer gjenkjennelig gjennom en feil
språkmodell. **Ikke verifisert**; det er det første som må prøves.

**Veien ut sies på målspråket.** Hun må klare «quiero volver al noruego»
for å komme tilbake. Nødutgangen er selv en øvelse – det er den peneste
delen av hele ideen.

**Men det må finnes en knapp også.** Den talte veien er den *tenkte* veien;
knappen er brannutgangen. En nybegynner som står fast midt i en økt uten vei
ut er den ene måten dette kan bli vondt på, og det er ikke en risiko verdt
å ta for elegansens skyld.

**Den svake lenken er gjenkjenningen, ikke modellen.**
`webkitSpeechRecognition` må få språket satt **før** hun snakker – den kan
ikke høre spansk mens den lytter etter norsk. Konsekvensen er at når spansk
modus først står på, kommer norsk tilbake som røre. **Det er derfor knappen
er påkrevd og ikke valgfri.**

**Ny samtale er norsk.** Samtalen ligger i øktlageret, så en ny økt er
virkelig ny – språkmodus blir bare enda en ting som ikke overlever den. En
modus som lever videre etter økta den ble slått på i, er en felle på en
veggskjerm fire personer deler.

**Lærerrollen: gradert ordforråd, og en regel for retting.** Konstant retting
dreper samtalen; å la alt passere lærer ingenting. Regelen er **rett det som
ødelegger meningen med en gang, og spar småfeilene til slutt**. Han holder
seg på spansk så lenge hun henger med, og faller tilbake til norsk når hun
står fast – ikke lar henne bli stående.

**Andrea får engelsk gjennom det samme.** Annet nivå, samme modus. Det er
argumentet for å bygge det som en generell språkmodus med et målspråk, ikke
som «spanskmodus».

**Arver en utestet risiko:** stemmen begge veier er aldri prøvd fra
hjemskjerm-appen på iPad (se Åpne tråder). Virker ikke mikrofonen der,
virker ikke språkmodus der heller.

---

## 51. Grunnstoffspillet – trinn 1 og 2 bygget 16.–18. september 2026

*Emma har begynt på periodesystemet i naturfag. Tre trinn, hvert av dem
spillbart alene – det er det som gjør at dette kan bygges i etapper i stedet
for å stå halvferdig.*

**Trinn 1 – de ti første.** Hele tabellen er synlig, men bare ti stoffer er
tent. **Framdrift som geografi, ikke som en prosentstripe:** hun ser hvor hun
skal, og hvor lite hun har tatt av det. Hvert stoff har to veier: **vis meg**
(hvordan det tegnes, noen egenskaper) og **test meg**.

**Hun velger selv testen.** Antall stoffer og hvilke sider av dem – navn,
symbol, atomnummer, skall. Da skalerer den samme siden fra to minutter i
bilen til en økt ved bordet, uten at det bygges to ting.

**Trinn 2 – hun bygger atomet.** Dra protoner, nøytroner og elektroner på
plass i skallene. **Det gjør tallet til noe hun konstruerer i stedet for noe
hun husker.** Og det retter seg selv: to i første skall, åtte i neste –
spillet trenger ikke mye logikk for å si ja eller nei.

**Trinn 3 – bindinger, ved 20–30 stoffer.** Hun trykker på ett stoff, og de
stoffene det kan binde seg med lyser opp. **Valens uten at ordet brukes.**

**Begrensningen er det som gjør trinn 3 mulig:** bare innenfor det hun har
låst opp. Uten den lyser tabellen i alle retninger, og da er det ingenting
å legge merke til. Og belønningen er at vann blir **bygget** i stedet for
fortalt.

**Utseendet teller mer her enn i de to andre spillene.** Mattespillet er et
spørsmål og et svar; dette er et bilde hun sitter og ser på, og da er
layouten halve læringen. Steampunk passer uvanlig godt: messingplater,
graverte symboler, låste stoffer mørke og upolerte – og **å låse opp et
stoff kan være noe man ser skje**.

**Magnes egen kjemikunnskap er ikke begrensningen.** Hvilke stoffer som
binder seg med hvilke er oppslagsverk. Det som faktisk krever ham er valget
om at hun skal **oppdage** valens i stedet for å få den fortalt – den
avgjørelsen finnes ikke i noen tabell.

**Følger spillmønsteret:** egen side og egen fil, snarvei fra dashen, ikke en
visning inni en annen side. Og **klassenavnkollisjonen fra del 26 er den
dyreste fella i dette huset** – et nytt spill med egne klassenavn i en stor
fil skal sjekkes mot fellesfilene før det pushes.

### Slik ble det bygget – 16.–18. september 2026

*`emma-grunnstoff.html`, snarvei fra Emma dash. Trinn 1 og 2 står; trinn 3
gjenstår. Økta 18. september bygget om det som alt var levert, og avgjorde
en rekke ting som ikke lå i beslutningen over.*

**Hele tabellen er tent fra første stund.** Beslutningen sa «bare ti stoffer
tent», og slik ble den bygget først: resten var mørke og upolerte. Det kostet
mer enn det ga. Et periodesystem i gruppefarger ER kartet, og et mørkt felt
er ikke et mål man går mot – det er bare et hull. Nå står alle 118 i fargen
sin, og framdriften ligger i **stjerna oppe til høyre i ruta**: ingen stjerne
betyr at stoffet kan leses om, men ikke prøves; tom stjerne at prøven er
åpen; gullstjerne at den er bestått. Samme `stjerne.webp` avfarget i CSS –
tre tilstander med to utseender, og ingen fil som kan komme i utakt.

**Hun kan lese om alle 118.** Trykk på et hvilket som helst stoff åpner
laben. Stoffer uten tilgang viser gruppefarge, tilstand og **én setning om
hva stoffet er**; åpne stoffer får i tillegg et hverdagsavsnitt, tallene og
atomtegningen. Én setning per grunnstoff er skrevet for alle 118,
hverdagsavsnitt for de tjue første.

**Prøven er den eneste veien videre.** Fem spørsmål om ETT stoff, og deretter
må hun bygge atomet. Alle fem riktige og et riktig bygget atom gir
gullstjerne, 100 XP og åpner neste stoff i rekka. Øvingsrunden står ved siden
av og gir XP, men **åpner ingenting** – to veier som begge låste opp ville
gjort det uklart hva som faktisk flytter henne framover. Den gamle regelen
(fem nye stoffer for 90 % på en runde på minst ti) er borte.

**Erfaringspoeng og nivå.** 10 XP per riktig øvingssvar – altså 50, 100 og
150 for en feilfri runde på 5, 10 og 15. 100 XP per gullstjerne, 500 for
nøytrontesten. Nivågrensene er 500, 1000, 2000, 5000, 10 000, 20 000, 50 000
og 100 000. **Premier ved nytt nivå er ikke bestemt** – stripa står der,
belønningen kommer senere.

**Poeng deles ut ett sted og gjenopprettes et annet.** `girXp()` legger til,
punktum. Gulvet som redder poeng etter en tapt skriving til KV ligger i
`flett()`, der stjernene og nøytrontesten er kjent og kan regnes om til XP.
Blandes de to, telles en stjerne som alt er satt to ganger – én gang som gulv
og én gang som de hundre hun nettopp fikk.

**Nøytronet kommer på nivå 3, ikke før.** Den opprinnelige begrunnelsen for
å utelate nøytroner sto seg: antallet kan ikke utledes av atomnummeret, så
hun måtte fått det oppgitt. Løsningen er at hun får **massetallet** og
regner selv: `nøytroner = massetall − atomnummer`. Da er det noe hun finner
ut i stedet for noe hun blir fortalt. Testen på seks spørsmål gir 500 XP, og
først etterpå finnes nøytroner i tegningen, i faktalista og som egen
beholder i byggeboksen.

**Porten er nivået, ikke antall stoffer.** Første utgave åpnet nøytronet når
stoff elleve var åpnet. `NOYTRON_NIVAA = 3` er 1000 XP, og de to veiene dit
møtes omtrent samme sted – ti gullstjerner er nettopp 1000 XP, og da står
hun med elleve åpne stoffer. Forskjellen er at **øving også teller**, så den
som repeterer mye kommer dit uten å ha bestått alt. Det er med vilje: øving
er ekte arbeid. Porten kan gå opp midt i en runde, så `girXp()` tegner
læringsboksen på nytt – ellers ville den ligget og ventet til neste gang
sida ble tegnet.

**Massetallet må ha et opphav, ellers er regnestykket en oppskrift.** Første
utgave av leksjonen var én tekstvegg, og hullet i den var at massetallet
dukket opp uten forklaring – det sto bare at hun «får det oppgitt». Da er
`massetall − atomnummer` noe hun følger, ikke noe hun forstår. Leksjonen er
derfor bygget om til **fire korte steg som bygger tallet opp**: kjernen har
to slags partikler; et proton og et nøytron veier like mye, og et elektron
1/1836 av et proton; altså sitter hele vekta i kjernen, og vekta ER antallet
partikler der; **det antallet er massetallet**. Og så, det som manglet helt:
**hvorfor det må måles og ikke kan regnes** – samme grunnstoff kan ha ulikt
antall nøytroner, karbon-12 og karbon-14 er begge karbon. Antall protoner er
alltid det samme, og det er nettopp derfor atomnummeret kan stå trykt i
tabellen mens massetallet må oppgis hver gang. Først etter dette kommer
subtraksjonen.

**Hvert steg har en kjerne tegnet ved siden av seg** – karbon 6 + 6,
hydrogen 1 + 0, natrium 11 + 12 – med den samme tegneren som laben og
byggeplata bruker, bare uten skall. Da ser kjernen i leksjonen ut som
kjernen hun skal bygge, og ikke som en illustrasjon av noe i nærheten.

**Beholderne er utømmelige.** Før sto det «3 igjen» på hver brikke, og
knappen ble grå når tallet nådde null. Det gjorde halve oppgaven for henne:
hun kunne telle magasinet i stedet for å telle atomet. Nå henter hun så mange
hun vil, og det er rettingen som teller. Tallet under beholderen sier hvor
mange hun HAR lagt ut.

**Bare kula følger fingeren.** Før fulgte hele brikka med navnet på, og
navnet dekket nettopp det stedet på plata hun siktet mot.

**Tegningen har dybde.** Kuler med lys ovenfra og skygge under, gravert
messing i ringene, skjær rundt kjernen. Gradientene og filteret ligger i ett
skjult `<svg class="gs-defs">` som begge tegningene peker til med `url(#…)` –
ett sted å endre dybden, og ingen id-er i to eksemplarer. Protonene og
nøytronene pakkes i et solsikkemønster, 137,5° per kule, som tar et
vilkårlig antall uten å velges ringvis: kjernen blir en klump og ikke en
stabel. Laben er 340 px mot 260 før, plata 380 mot 330.

**Utsnittet er trangt i laben og fast på byggeplata**, og det er ikke en
smakssak. Plata regner ut hvor hun slapp brikka ved å gange museposisjonen
med 360 delt på bredden – endret utsnittet seg mens hun la ut skall, ville
treffpunktene flyttet seg under fingeren hennes. Laben tegner et ferdig atom
som ikke skal endre seg, og der er det motsatte problemet det virkelige:
hydrogen med ett skall fylte 39 % av et lerret laget for fire, og lå som en
flekk i hjørnet av panelet. Skriftstørrelsen i tegningen regnes derfor mot
utsnittet og ikke i SVG-enheter.

**Nøytronet ble grått (`--ink-soft`), og det er ikke avgjort.** Nøytral farge
til nøytral partikkel var det nærmeste, men fargen står ikke i
designsystemet. Se «Åpne spørsmål» i toppblokka.

**Ikke gjort, med vilje:** den tomme byggeplata er glissen. Rammen må holde
fire skall, så før hun legger ut det første ligger det en liten stiplet
kjerne midt i 380 piksler – verst på telefon. Fire svake stiplete
hjelperinger ville løst det og samtidig vist hvor skallene kan ligge, men det
er et layoutvalg som ikke står i designsystemet, og det er ikke spurt om.

**Nøkkelen er uendret.** `emma-grunnstoff:v1` i KV og
`neam-emma-grunnstoff:v1` i localStorage. Ombyggingen la til felt i verdien
(`mestret`, `xp`, `noytron`) og beholdt `apne` som tallet det var – å døpe
det om ville vært en migrering, ikke en tekstendring (del 12).

---

## 52. Personlige paletter og «hvem er du?» – besluttet 15. september 2026, ikke bygget

**Utgangspunktet var en ærlig innrømmelse.** Steampunk er Magnes smak mer
enn husets. De andre synes roboten er morsom; uttrykket rundt ham er det ikke
sikkert noen andre er glade i. Første tanke var å dempe hele greia.

**Svaret ble et annet: samme skjelett, ulik hud.** Farger og noen bilder
varierer per person; **layout og oppførsel gjør det ikke**. Den grensen må
trekkes før det bygges, ellers vedlikeholdes fire apper i stedet for én.

**Arkitekturen peker allerede dit** – fargene bor i `felles-rot.css`. Det er
én fil, ikke åtte.

**Paletten følger personen inn i fellessidene.** Oppskrifter og handleliste
skal også være i hennes farger. Det er selve argumentet for at dette hører
hjemme i **skallet**: identiteten er kjent én gang, og paletten følger med
på tvers – i stedet for å gjentas i hver side.

**Én robot, ikke fire.** Han kan tones mot den enkeltes farger, men det skal
være samme figur. Fire roboter ville gjort ham til fire assistenter, og han
er husets.

**Veggskjermen: en innlogging som aldri tar slutt er feil modell for en delt
skjerm.** Riktig spørsmål ved oppvåkning er «hvem er dette?», og ett trykk.

**Det som gjør det billig, er at de to tingene er skilt:** kontoen styrer
**rettigheter**, trykket styrer bare **utseende og standardvisning**. Ingen
ny autentisering, ingen Access-runde – bare hvem som står der.

**Knyttes til dvalen som alt finnes**, ikke til en ny tidtaker. Skjermen
våkner, den spør, ett trykk og man er inne. «Hvem er dette?» er dessuten det
eneste spørsmålet som er verdt å stille i det øyeblikket.

**Trykker ingen, står grått husmodus.** Ingens farger, bare det felles:
dagens middag, kalenderen, været. Grått sier at dette tilhører alle uten å
velge side – og det er den ærlige standardtilstanden, siden det meste av
tiden ikke står noen der i det hele tatt.

---

## 53. Svartiden og hva Neam bærer med seg – åpent, 15. september 2026

**Fem til sju sekunder på enkle spørsmål.** Det er mer enn skrivehastighet,
altså venter han på noe før han begynner å snakke.

**Ingenting er målt.** Det er en følelse, ikke et tall, og **å optimalisere
en umålt ventetid er gjetting**. Første handling er å finne ut hvor tida
faktisk går – ikke å fjerne noe.

**Mistenkte, i rå rekkefølge:** en verktøyrunde før første ord, og alt som
sendes på nytt hver eneste melding – husregisteret pluss verktøydefinisjonene
fra fem fellesfiler. Det siste vokser hver gang det legges til et verktøy,
og ingen har sett på summen.

**Modellvalget er spaken ingen har tatt i.** Haiku til oppslag, Sonnet der
det faktisk kreves resonnement. Det er den største enkeltforskjellen og den
billigste å prøve.

### Dokumentene til Neam – ikke avgjort

Spørsmålet som kom opp: skal kartleggingen og designsystemet være
tilgjengelige for Neam, slik at planen kan diskuteres med ham direkte?

**Ikke i systemteksten.** De er 121 og 95 kB – større enn alt annet han
bærer til sammen, og det ville blitt sendt på nytt ved hver melding. **Det
gjør nøyaktig det problemet over verre.**

**Riktig form er verktøy, slik husregisteret alt er:** `les_plan` og
`les_designsystem` som henter fra KV bare når samtalen faktisk handler om
det. Da betales kostnaden i de samtalene som trenger den.

**Vedlikeholdsfella:** dokumentene får nytt versjonsnummer hver økt.
KV-kopien er utdatert fra det øyeblikket, med mindre oppdatering blir en
fast del av hver push – og et dokument Neam siterer feil fra er verre enn
ingen dokumenter.

**Og hva vinnes egentlig?** Planleggingen skjer i Claude-tråden, der
dokumentene alt ligger, og Neam skriver ikke kode. Den eneste verdien som er
hans alene er **å kunne spørre «hvor står 7.5 nå?» fra veggskjermen uten å
åpne PC-en**. Ikke avgjort om det er verdt vedlikeholdet.

---

## 54. Arbeidsdelingen i design – besluttet 15. september 2026

**Magnes observasjon, ordrett nok:** Claude er god på logikk og
funksjonalitet, og svakere på design – farger, tegninger og layout treffer
ikke slik han vil.

**Den er riktig, og verdt å være presis om hva som er svakt.** Layout går
rimelig når det finnes et skjermbilde å reagere på. Det som er svakt er
**smak i det abstrakte** – å foreslå en original visuell retning før det
finnes noe å reagere på.

**Mye av gapet er tilbakemeldingssløyfa, ikke modellen.** Her beskrives det,
bygges det, ses det på, rettes det. Designere setter opp tjue varianter på
ti minutter og kaster nitten.

**Arbeidsdelingen:** Gemini til stemning, bilder og retning – abonnementet
finnes alt. Claude til byggingen.

**Be Gemini om to ting, ikke én.** Bildet bærer stemningen; **en designbrief
bærer beslutningene** – palett i hex, hva typografien skal gjøre, luft, hva
metallet gjør i ramma. Uten den andre gjetter begge ender.

**Si arbeidsdelingen til Gemini også:** at Claude skriver koden, og at det
som leveres skal være noe Claude kan bygge fra. Det endrer faktisk hva som
kommer tilbake.

**Ta med begge deler hit – skjermbilde og brief, lest ved siden av
hverandre.** En gjengivelse er ikke CSS: «få det til å se slik ut» er
riktig bestilling, ikke punktvis reproduksjon av en rendering.

**Uttrykk og bygging i hver sin økt.** Én der det bare ses og reageres, uten
at noe implementeres. Så en byggeøkt der utseendet alt er bestemt.
**Feilmodusen som unngås er designvalg tatt i hastverk sent på en
kodekveld** – det er også to forskjellige sinnstilstander, og å bytte mellom
dem midt i en økt er dyrt.

**Kjent felle:** et bilde kan være nydelig og likevel ryke på en iPad i
høydeformat. Briefen skal leses mot enhetene, ikke bare mot smaken.

---

**Avkreftet – ikke prøv igjen (tillegg 12. september):** en funksjon i
`appBusy`-lista som kaller en annen derfra; `const`-definisjoner som leser
konstanter lenger ned i fila; å skrive en datastruktur uten å lese
funksjonen som viser den; `p.evaluate` med vanlig tilordning for å nå
skript-scope; eval-wrappere som sporingsverktøy; flex-barn uten
`min-width:0` når bildet er større enn boksen.

**Avkreftet – ikke prøv igjen (tillegg 13. september):** å gjette feltnavn
i en datastruktur i stedet for å lese sida som skriver den; å bygge et
verktøy uten først å sjekke `HUS_VERKTOY`; et eksempel i en
modellinstruks som viser hva som er *usikkert* (eksempelet blir
instruksen); å endre en pushet fellesfil uten å heve `?v=`; en tom
`neamBeskriv` for å hoppe over bekreftelsen (den faller tilbake på en
generisk dialog); `location.href` uten opphold etter et Neam-svar.
