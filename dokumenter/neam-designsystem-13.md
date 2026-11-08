# Neam – designsystem

*Hva som er bestemt, og hva som ennå ikke er det. Skrevet under gjennomgangen
før refaktoreringen (7.3), mens beslutningene ble tatt – ikke rekonstruert
etterpå.*

**Slik brukes den:** når noe skal endres i én fil, sjekk om det står her.
Står det her, gjelder det **alle sidene**. Står det ikke her, er det et nytt
valg – og da bør det inn.

*«Alle fem» står flere steder nedenfor og er skrevet da huset hadde fem
sider. Det er åtte pluss fire spill og en spillside nå (`index`,
`dashboard`, `kalender`, `handleliste`, `oppskrifter`, `emma`, `andrea`,
`sikkerhet`, spillene `andrea-matte`, `andrea-diktat`, `andrea-klokke`,
`emma-grunnstoff`, spillsida `andrea-spill`, og fra 11. oktober 2026
`neamow`). Tallet er
ikke rettet overalt – meningen er «alle», og det er greit å vite hvorfor det
står fem.*

Mye ligger nå i **fellesfiler** (`felles-rot.css`, `felles-skall.css`,
`felles-filviser.*`, `felles-graph.js`, `felles-skjema.js`, `felles-dialog.*`,
`felles-neam.*`, `felles-data.js`, og fra 13. september `felles-lesalt.js`,
`felles-skriv.js`, `felles-hus.js`, `felles-ms.js`, `felles-tale.js`). Det som ennå er kopiert per fil, holdes likt av dette
dokumentet – det er fortsatt fasiten for hva som skal være likt på tvers.

*Sist oppdatert 8. november 2026: **matlagingen** i Oppskriftssida (se
der). Samme dag: **topplinja er felles** på alle sidene,
også dashene, og **klokka har alarm, nedtelling og stoppeklokke** (se
«Topplinja»). Samme dag: **pinkoden på kjøkkenskjermen** –
tastaturet, «Hei Magne!», Pinkoder for sys@, og låseikonet med valgt tid
og pling (se «Neam-assistenten»).
Forrige oppdatering 6. november 2026: **fargekatalogen** er nytt verktøy for
farger og bakgrunner (se «Farger → Fargekatalogen»), bildekatalogen kan
bestille strektegningene i koden og dele store utvalg i flere ark (se
«Bilder – ikoner og bestilling»), og fargetabellen har fått verdiene fra
den varme paletten. Forrige oppdatering 2. november 2026: Kjøkken dash
fikk Dag | Uke i avtalekortet, som Emma dash. Forrige oppdatering
1. november 2026: nytt
visuelt uttrykk (24. oktober–
1. november, alternativ C). Steampunk-bakgrunnen og treklokka er borte,
merkelappene er erstattet av ikoner med **navnet som tekst under**,
messingrørene er tynne koblinger, NEAM-logoen står på forsiden og i
venstre tommelknapp, og alle sidene har samme hjemskjermikon.
**Bildekatalogen** er nytt verktøy for alle bilder og for bestilling fra
AI. Se «Ikonene og navnet under» og «Bilder – ikoner og bestilling».
Begrunnelsene ligger i toppblokka i kartleggingen.
Forrige oppdatering 12. oktober 2026: kalendersida fikk egen seksjon –
høyre firer i stedet for de runde knappene, i dag på andre trykk,
tommelknappene nær kanten med fri bunn, merket foran månedsnavnet, og
visningsvalg og initialer nederst mellom tommelknappene – også på
liggende telefon – og avtalene i Liste tonet oppå papir.
Forrige oppdatering 11. oktober 2026: Neamow ført inn – egen seksjon, et
unntak fra de fem betydningene (gress i kartet), enhetsknapper med merke i
fireren, bekreftelsen for en maskin som settes i gang, og
`NMW_SYMBOL_V` under bildene. Begrunnelsene ligger i kartleggingen del 56.
Forrige oppdatering 10. oktober 2026: klokkespillet og spillsida ført inn;
«Spillet har ingen vei til andre spill» flyttet fra «Ikke bestemt ennå»
til besluttet under Andrea dash – ett kort som åpner spillsida. Forrige
oppdatering 15. september 2026 (v13): tre nye prinsippkapitler som er
besluttet, ikke bygget – «Språk og læring» og «Paletter per person»;
ny regel om gjenkjenningsspråk under Stemmen; og arbeidsdelingen mellom
uttrykk og bygging ført inn under Arbeidsmåte. Begrunnelsene ligger i
kartleggingen del 50–54. Forrige oppdatering
13. september 2026 (v12): verktøylagene ført inn –
`felles-lesalt`, `felles-skriv`, `felles-hus`, `felles-ms` og
`felles-tale`; ny regel om at Neam skal ha samme verktøy overalt og om
hvem som vinner ved navnekollisjon; bekreftelse på alt som skriver;
stemmen begge veier; diktatspillet; klokka i systemteksten; og
versjonsregelen utvidet med den halvdelen som manglet; og to nye
prinsippkapitler – «Belønning og måltid» og «Varsling» – som er
besluttet, ikke bygget. Forrige oppdatering
12. september 2026 (v11): oppskriftssida ført inn med
firer, filter og krydderblandinger; nye regler om avkryssing som viser
faktisk tilstand, om angre framfor bekreftelse, og om tilstand som ikke
tåler å tegnes på nytt; ny felle om flex-barn i Safari og om sperrer som
låser hverandre. Forrige oppdatering 11. september, natt (v10): sikkerhetssida ført inn;
«Hvem slipper inn» skrevet om etter at innloggingen mot Microsoft ble lagt
om til 90 dager; ny regel om tilstand som ikke tåler å tegnes på nytt; ny
post om fiskebeinets tak. Forrige oppdatering 11. september (v9): Andrea dash og mattespillet ført
inn; seksjonen «Navn som skal ryddes i 7.3» er gjort om til historikk –
ryddingen var utført for lenge siden, og dokumentet hang etter koden; ny
regel om klassenavn i store filer; primærenhetstabellen utvidet fra fem til
åtte sider. Forrige oppdatering 5. september (v8): fireren erstattet
femmeren; menyer i dybden, knappemerker, rør på utsiden og fiskebeinet ført
inn (se «Neam – panel og firer»); nye poster om Emma dash, om datalaget (kø,
cachevakt, speiling) og om bilder til merker og knapper; nye feller. Forrige oppdatering
29. august: femmeren og Neam-panelet ført inn, og notatene om `felles-dialog`
og navigasjon mellom sidene rettet etter at de ble bygget. Forrige oppdatering 27. august, etter økta der
knappene ble navngitt etter betydning, tilbakepilene ble erstattet av
nettleserhistorikk, og kartleggingen til 7.3 ble gjort. Kartleggingen ligger
som eget dokument – den er en liste over funn og valg, ikke regler, og hører
ikke hjemme her.*

---

## Typeskala

Fem roller. Endres i `:root`, aldri nede i reglene.

| Variabel | Rolle | mobil | iPad | PC |
|---|---|---|---|---|
| `--t-etikett` | små merkelapper, versaler | 11 | 12 | 11 |
| `--t-meta` | sekundær info under en tittel | 13 | 14 | 13 |
| `--t-brod` | vanlig tekst | 15 | 17 | 15 |
| `--t-stor` | kortets hovedtekst | 20 | 22 | 20 |
| `--t-display` | klokke | 46 | 60 | 60 |
| `--t-pil` | piler og lukkekryss | 20 | 22 | 20 |
| `--t-ikon` | større glyffer, værsymbol | 28 | 32 | 28 |

**`--t-rute`** finnes bare i `kalender.html`: 10 / 11 / 10. Tekst inne i
måneds- og ukerutenettet, der cellene har fast høyde. Uten den flyter
innholdet ut av cellene. Bevisst unntak, ikke etterslep.

**Flytt elementer mellom roller, ikke mellom tall.** Er noe for stort, hører
det i en annen rolle. Er rollen riktig men resultatet feil, er det som regel
bredden eller høyden som skal endres, ikke skriften.

**Ett unntak, og bare ett:** tettpakkede kontroller i smale spalter kan gå
under skalaen. I dag gjelder det fanetekstene i oppskriftsvisningen (fem ord
på 375px) og Inkluder/Ekskluder ved søkefeltet. Ingenting annet.

**Skjemafelt står utenfor skalaen.** iOS Safari zoomer inn når man trykker i
et felt under 16px. Derfor er `input, select, textarea` hardkodet til 16px.
Ikke koble dem til `--t-brod` – den er 15 på mobil.

Kjente unntak som fortsatt er under grensa og bør rettes: `.fld
select/textarea` i kalender, `.ing-row input` og `.sec-row input` i
oppskrifter.

**Handleliste er ryddet.** `.field input/select/textarea`, `.type-rad
select` og de to innlimingsfeltene står nå hardkodet på 16px med kommentar
om hvorfor. Kommentaren er der for at ingen skal koble dem til `--t-brod`
senere i god tro.

## Vekt

**600 og 700.** 800 og 900 er fjernet fra alle fem filene.

## Farger

### Fargekatalogen

*Fra 6. november 2026.*

**Fargekatalogen er stedet å begynne.** `dokumenter/fargekatalog.html`
viser tre ting: fargevariablene – hvor de er satt, hva de betyr, hvor de
brukes og kontrasten; fargene som står hardkodet i koden – fil, linje og
den variabelen de ligger nærmest; og bakgrunnene – gradienter, bilder og
sidebakgrunnene. Velg det som skal endres, sett eventuelt ny verdi, og
kopier bestillingsteksten til Claude. Den har med variabel, fil, linje og
reglene i dette kapitlet. **Etter hver endring i farger eller bakgrunner
kjøres `python dokumenter/lag-fargekatalog.py`**, ellers lyver katalogen.
Betydningen hentes fra tabellene under; står ikke variabelen der, brukes
kommentaren i koden. Utseendet ligger i `dokumenter/fargekatalog-mal.html`.

**Kontrasten regnes for bruken fargen har.** En lys farge regnes som flate
med `--ink` og `--ink-soft` på; en mørk som knapp med hvit tekst og som
tekst på `--paper`. Under 4,5:1 merkes rødt.

**Hardkodede farger når ikke en endring i variablene.** 6. november sto
671 farger skrevet rett i koden, 196 ulike – og 432 av stedene hadde samme
farge som en variabel. Om de skal byttes til variabelen, er foreslått,
ikke avgjort; det er det som ville gjort de personlige palettene til ett
sett overstyringer.

### Flater og tekst

| Variabel | Betydning |
|---|---|
| `--ink` `#2C3E50` | tekst |
| `--ink-soft` `#5A6C7D` | sekundær tekst |
| `--paper` `#FBF9F5` | **kort** – hvit tilhører kortene |
| `--line` `#E6E1D8` | kanter |
| `--boks-mild` `#F1EDE5` | **flate** – grupperingsbokser |
| `--boks-kant` `#E2DCD0` | kant på slike bokser |

**Verdiene er varmet 29. august 2026** og ført inn her 6. november.
Kortet er en varm, nesten hvit tone; før sto det `#FFFFFF`, `#E4E8EC`,
`#EDF3F8` og `#DCE6EF`. Begrunnelsen og angrelista står øverst i
`felles-rot.css`. Betydningene er de samme.

Skrivefelt er unntaket fra hvit-regelen: et `input` er hvitt med egen kant
inne i en mild boks. Det er en kontroll, ikke en flate.

### Fem betydninger

| Variabel | Farge | Betyr |
|---|---|---|
| `--handling-ny` | `#4F8F5F` | **skaper noe** – ny oppskrift, nytt tips, legg til rett |
| `--handling-endre` | `#B8873A` | **endrer noe** – rediger, erstatt bilde |
| `--danger` | `#A64D3C` | **sletter noe** |
| `--aksent` | `#4A7FA8` | **alt annet** – kategori på, sortering, planmodus, og enhver knapp som verken skaper, endrer, sletter eller avbryter |
| `--handling-tvers` | `#7A5EA8` | **går på tvers av apper** – send til handlelista |

**Blå er ikke en betydning, men fravær av en.** Den ble tidligere beskrevet
som «valgt / navigerer». Det holdt ikke: knapper som `Last ned`, `Slå
sammen` og `Ferdig` gjør ingen av delene, men skal fortsatt være blå. Regelen
er derfor negativ – blått er det som blir igjen når de fire andre ikke passer.
Det gjør den lett å bruke og betyr at en ny farge må begrunnes mot de fire,
ikke mot blå.

**Unntak: grønt i Neamow-kartet er gress.** Plenområdene er dempet grønt
(`--nmw-gress` `#DDE7D2`, kant `--nmw-gress-kant` `#7C9B6F`), og det betyr
verken «skaper noe» eller «i orden». Valgt av Magne 11. oktober 2026.
Fargen er dempet nok til at den ikke leses som en knapp, og den bor bare
i kartet (`.nmw-kart`). Et **valgt** område bruker «valgt»-fargen
(`--aksent-lys` med `--aksent`-kant), ikke en ny farge. Klipperen og
laderen er messing – det gamle metallet. Klapptavla var samme messing
til 27. oktober 2026; den er lys nå (se «Bakgrunn og klapptavle»).

De fire første gjør noe **her**. Lilla flytter noe **dit** – den er en annen
kategori, ikke en femte handlingstype. Det er begrunnelsen for at den fikk
være en femte farge; kommer det en sjette, må den ha en like klar
begrunnelse.

`--handling-endre` må holde avstand til `--danger`. En rødoransje ville sett
lik ut ved siden av Slett i samme meny; oker gjør ikke det.

**Trykktilstand har egne verdier.** `--handling-ny-moerk`,
`--handling-endre-moerk`, `--handling-tvers-moerk`, `--aksent-moerk` og
`--danger-moerk` `#8E4033`. Den siste er ny, og verdien er hentet fra
`.rediger-topp-knapp.avbryt` der den alt sto hardkodet. Uten den arvet
sletteknappene trykktilstanden fra den grønne klassen og **ble grønne i det
øyeblikket man trykte på dem**.

**Formregelen som følger fargen:** fylt flate betyr at knappen skaper noe.
Tekst uten flate betyr at den tar deg et sted. Da trengs ingen skillestrek
mellom navigasjonsvalg og en opprett-knapp – flaten skiller selv.

**Kjent avvik fra formregelen:** `.store-header` og `.category-header` i
handleliste er fylte flater uten å skape noe. De er overskriftsbånd, ikke
knapper – samme mønster som `.ing-type-head` i oppskrifter. Beholdt bevisst
til 7.3 avgjør om overskriftsbånd skal ha en egen form som ikke låner
knappens.

**Ord slår symboler når det er plass.** Hake og kryss, blyant og
søppelbøtte, to like utklippstavler – alle er byttet mot ord der bredden
tillater det. Der radene er for tette (ingredienslista) beholdes symbolet,
men det får fargen som forklarer det.

### Knappeklasser

Klassene heter det de **betyr**, ikke det de er store som. Dette er avgjort og
gjennomført i oppskrifter og handleliste.

| Klasse | Farge | Når |
|---|---|---|
| `.btn-ny` | grønn | lagrer eller legger til |
| `.btn-endre` | oker | endrer noe som finnes |
| `.btn-slett` | rød | sletter |
| `.btn-ghost` | nøytral | avbryter |
| `.btn-tvers` | lilla | går på tvers av apper |
| `.btn-blaa` | blå | alt annet |

**Formen ligger for seg.** `.btn-blokk` er full bredde, `.btn-pille` er den
lave avrundede. En knapp skal kunne skifte betydning uten å skifte størrelse.

### Avbryt-regelen

*Avgjort og gjennomført på alle fem sidene 27. august 2026.*

**Avbryt er alltid nøytral.** Rødt betyr slett, og en farge kan ikke bety to
ting i samme app. Nøytral er `--paper` med `--line`-ramme og `--ink`-tekst –
det er allerede behandlingen dashboard (`.hu-avbryt`) og kalender (`.btn`)
bruker, så regelen er de andre sidenes praksis skrevet ned.

**Advarselen ligger i en bekreftelse, ikke i fargen.** Det var faren som
gjorde at Avbryt ble rød i redigeringsmodus i oppskrifter: den forkastet alt
uten å spørre, og fargen var den eneste advarselen som fantes. Bekreftelsen
overtar den jobben, og da kan fargen si det den skal.

**Bekreftelsen kommer bare når det finnes noe å miste.** To ledd:

1. Ødelegger knappen noe som er *lagt inn* – tekst, tall eller filer – og som
   ikke finnes lagret noe annet sted?
2. Er det faktisk endret siden skjemaet ble åpnet?

Valg i nedtrekk og avkryssinger teller ikke. De koster ingenting å gjøre om,
og å spørre om dem er å bruke opp folks tålmodighet på noe som ikke står på
spill. Er ingenting endret, går Avbryt rett ut uten dialog. **Det er hele
poenget: en dialog man får hver gang, er en dialog man slutter å lese.**

Ledd 2 er samme prinsipp som «Avbryt må angre alt» under Redigeringsmodus –
ta vare på utgangspunktet når skjemaet åpnes, sammenlign når man går ut.

**Slik er den bygget.** Hver side har `huskSkjema(id)` ved åpning og
`avbrytSkjema(id, lukk)` på knappen; `lukk` er sidens egen lukkefunksjon, så
oppryddingen ligger fortsatt ett sted. I oppskrifter er avtrykket hektet på
`openModal()`, så nye modaler er dekket uten å gjøre noe. Lagre- og
slettestiene kaller lukkefunksjonen direkte og spør aldri.

**Samlet 28.–29. august:** `felles-dialog.css` + `felles-dialog.js` bærer nå
`bekreft()` og `varsle()`, og har erstattet nettleserens `confirm()`/`alert()`
i kalender, dashboard og handleliste. Oppskrifters egen `showConfirmModal` er
fjernet og de ni kallstedene flyttet over. Alle fire sidene har nå samme dialog.
`bekreft()` er asynkron der `confirm()` var synkron, så kallstedene måtte bli
`async`.

## Felles filer

### `felles-skall.css`

*Første flytting i 7.3, gjennomført 27. august 2026. Gjelder oppskrifter og
handleliste.*

Sidemønsteret de to deler ligger nå i én fil: topplinje, faner, visninger,
modalbakgrunn, kort, skjemafelt, hero og tom tilstand – 31 regler. De sto
allerede tegn for tegn like i begge filene; dette er en flytting, ikke en
omskriving.

**Lastes før sidens egen `<style>.** Da kan en side overstyre en delt regel
ved å skrive den om lokalt, og alle `@media`-blokker i sidene virker som før
siden de kommer etter.

**Fire spørsmål måtte avgjøres for å få reglene like:**

| | Valg | Hvorfor |
|---|---|---|
| `.tab-btn` | `--t-meta` | Faneteksten er alt versal, fet og spatiert. På brødtekststørrelse konkurrerer den med innholdet den navigerer i. Oppskrifter lå på `--t-brod`. |
| `.home-hero-sub` | `--t-meta` | Samme vurdering. |
| `.field input/textarea/select` | `16px` | Et gulv, ikke en smakssak: under 16px zoomer iOS inn på feltet ved fokus. Oppskrifter lå på 17px. |
| `button` | unionen | Oppskrifter satte `font-family` og `cursor`, handleliste `touch-action`. Begge vil ha alle tre. |

**Blir liggende i sidene, med vilje:** fargen på `.topbar h1` (hvit i
oppskrifter, mørk i handleliste), `.field-hint`, `.field-note` og
`.topbar-home-actions` som bare handleliste har, og `#confirm-modal`s
`z-index` som bare oppskrifter trenger.

**`?v=1` på lenka.** Cloudflare kan servere fila fra cache, og en iPad som
sitter igjen med gammel versjon er vanskelig å feilsøke. Bump tallet i begge
filene når `felles-skall.css` endres.

### Hvor mange fellesfiler, og hvem deler hva

**`felles-skall.css` skal ikke vokse til fem sider.** Navnet inviterer til
det, så det er verdt å slå fast: de tre andre sidene bruker **null** av de 36
selektorene i fila. Ikke én. Sjekket 27. august 2026.

Det er ikke drift som skal ryddes opp – det er tre forskjellige slags sider:

| Side | Hva den er | Egne strukturklasser |
|---|---|---|
| oppskrifter, handleliste | apper med topplinje, faner, visninger, modaler | `.topbar`, `.tabs`, `.view`, `.card-panel`, `.field` |
| index | oppstartsflate, rutenett av app-fliser | `.app`, `.app-icon`, `.app-badge`, `.shell`, `.top` |
| dashboard | informasjonsskjerm | `.kort`, `.kort-tittel`, `.hu-felt`, `.av-felt` |
| kalender | rutenett med paneler | `.panel`, `.fld`, `.fab`, `.boble-notat` |

Index, dashboard og kalender har hver sin struktur fordi de gjør hver sin
jobb. Å tvinge dem inn i app-skallet ville vært å finne på et fellesskap som
ikke finnes.

**Delingen går derfor på tre nivåer, ikke ett:**

1. **`:root` – alle fem.** Palett og typeskala. Den henger ikke på at sidene
   deler struktur, bare at de deler farger og størrelser. Neste flytting.
2. **App-skallet – oppskrifter + handleliste.** Gjort.
3. **Filviseren – dashboard + kalender.** Deres delte komponent: seksten
   CSS-regler, tretten identiske. Ikke skallet, men like reelt.

**Én ekte dublett som ikke passer i noen av de tre:** skjemaboksen finnes tre
ganger med tre navn – `.field` i skallet, `.av-felt`/`.hu-felt` i dashboard,
`.fld` i kalender. De gjør samme jobb. Å slå dem sammen betyr å døpe om
klasser i HTML-en, altså samme slags jobb som navnekollisjonene mellom index
og kalender, og hører hjemme i den økta – ikke i skallet.

### `felles-rot.css`

*Andre flytting i 7.3, gjennomført 27. august 2026. Gjelder alle fem sidene.*

Palett og typeskala ligger nå i én fil, lastet først – før
`felles-skall.css` og før sidens egen `<style>`. Typeskalaen sto allerede
identisk i alle fem, på alle tre bruddpunktene; den var en ren flytting.

**Navnesakene fra 7.3 er gjennomført her, siden alle fem filene måtte endres
samtidig:**

| Gammelt | Nytt | Hvor |
|---|---|---|
| `--lime`, `--blue`, `--blaa` | `--aksent` | de tre var samme verdi `#4A7FA8` under tre navn, to av dem side om side i samme stilark |
| `--lime-dark` | `--aksent-moerk` | |
| `--blue-light` | `--aksent-lys` | betyr «valgt» – ikke slå sammen med `--boks-mild` |
| `--gronn`, `--gronn-mork` | `--handling-ny`, `--handling-ny-moerk` | dashboard |
| `--oransje`, `--oransje-mork` | `--handling-endre`, `--handling-endre-moerk` | dashboard |
| `--rod` | `--danger` | dashboard |
| dashboards `--bg-2` `#EDF3F8` | `--boks-mild` | begge bruksstedene var grupperingsbokser – det er den betydningen, og det er verdien de fire andre alt hadde |

Den ubrukte limegrønnen `#C8E64B` er ute. Den lå igjen i dashboard under
navnet `--lime` og ble aldri brukt.

**Blir liggende i sidene, med vilje** – de brukes bare ett sted hver:
`--shadow-lift` (index), `--t-dagsnavn` (dashboard), `--grid`, `--idag` og
`--t-rute` (kalender). Sistnevnte følger de samme bruddpunktene som
typeskalaen og har egne små `@media`-linjer i sida.

Fire variabler settes fra JavaScript og hører ikke hjemme i noen stilfil:
`--dlg-topp`/`--dlg-hoyde` (dashboard), `--peker`/`--hale` (kalender) og
`--topbar-h` (oppskrifter).

### `felles-filviser.css` + `felles-filviser.js`

*Tredje flytting i 7.3, gjennomført 27. august 2026. Gjelder dashboard og
kalender – de to sidene som henter vedlegg fra Graph. Fra 8. november 2026
også Økonomi: filene lagt ved postene åpnes her, ikke i en ny fane, og
viseren ligger over sidas dialoger (`#filviser{ z-index:130 }`).*

Første JS-flytting, og den første som er en **sammenslåing og ikke bare en
flytting**. På CSS-siden var reglene så godt som like; på JS-siden var bare
tre av elleve funksjoner identiske. Dashboardversjonen vant nesten overalt,
fordi den var den mer robuste. Det som følger med kalenderen er derfor
rettelser, ikke bare omplassering:

- `erPdf` manglet filtype-sjekken helt, og kunne ta en vedlagt avtale med
  «.pdf» i navnet for en PDF.
- `blobAv` kastet på et vedlegg uten innhold; `atob(bytes || '')` gjør ikke det.
- `filTilBase64` sendte `undefined` videre på en tom fil.

**Én ting går motsatt vei.** Dashboards `erFil` krevde at `@odata.type`
finnes; kalenderens sjekk tålte at feltet manglet. Den delte versjonen tar
kalenderens toleranse – mangler typen, antar vi filvedlegg. Det strengeste
valget ville skjult vedlegg der Graph utelater feltet, og det er en verre
feil enn den den forhindrer.

**Klassenavnene på forhåndsvisningen er kalenderens:** `.vedlegg-bilde`,
`.vedlegg-pdf`, `.vedlegg-aapne`. Dashboard skrev `ved-*`. Det fulle ordet
vant fordi det matcher `vedleggNye` og `hentVedlegg` i koden. Dashboards
`.ved-rad` og `.ved-fjern` er noe annet – vedleggsraden i skjemaet – og blir
liggende i sida.

**PDF-forhåndsvisningen er et kort, ikke en innebygd visning** (`?v=2`,
28. august 2026): en `<iframe>` med PDF er sin egen rullebeholder inne i et
panel som også ruller, og iOS overstyrer høyden på PDF-innhold uansett.
Kortet (`.vedlegg-pdf-kort`, rødt PDF-merke + filnavn) åpner filviseren, som
fyller skjermen. Bilder beholder ekte forhåndsvisning – `<img>` skalerer som
den skal.

**Én ekte fargeforskjell dukket opp** da palettnavnene ble slått sammen:
`.filviser-knapp` sto på `--boks-mild` i dashboard og `--bg-2` i kalender.
Før omdøpingen så det ut som to navn på én farge; det var det ikke.
`--boks-mild` vant – en kantet pille på et hvitt kort trenger en flate å stå
på.

**Blir liggende i sidene, med vilje:** `aapneVedleggFra()`, som kaller
`graph()` – de to signaturene er ikke slått sammen ennå – og viser feil på
hver sin måte, og `valgteFiler()`, som er to forskjellige funksjoner mot hver
sin vedleggsliste, ikke to skrivemåter av én.

Det var sammenblandingen av form og farge som gjorde skaden: `.btn-primary`
bar både «hovedknapp i skjemaet» og en farge, og siden hver fil hadde valgt
sin egen farge til den rollen, betydde **samme klassenavn grønn i handleliste
og blå i oppskrifter**. `.btn-ghost` var derimot identisk i begge. Hadde
filene blitt slått sammen slik, ville den ene siden arvet den andres
knappefarger uten at noe så galt ut i diffen.

**Ingen inline `background` på knapper.** Sju sletteknapper var skrevet som
`class="btn btn-primary" style="background:var(--danger)"` – de så ut som de
skapte noe, og så ble flaten overstyrt. Finnes ikke klassen du trenger, lag
den; ikke overstyr en som betyr noe annet.

**`.btn-success` er avviklet.** Navnet sa «vellykket» mens fargen sa «endre».

### Navn som er ryddet (historikk)

*Sto som en oppgaveliste til og med v8: `--lime` skulle bli `--aksent`, og
kjøkkendashens `--gronn`/`--oransje`/`--rod` skulle over på fellesnavnene.
**Opptelling 11. september 2026: null forekomster av de gamle navnene i
noen fil.** Jobben var gjort samtidig med `felles-rot.css` – se
omdøpingstabellen der – og dokumentet hang etter koden i to uker.*

De gamle navnene står igjen her fordi de dukker opp i eldre notater og
skjermbilder.

**Lærdommen er verdt mer enn listen:** en oppryddingsliste råtner fortere
enn koden. **Tell opp før du planlegger jobben.** Å telle tok fem minutter;
jobben planlagt ut fra dokumentet var to timer og for det meste
unødvendig.

`--blue-light` `#E3ECF4` betyr «valgt» (sortering, suksess). Den må ikke slås
sammen med `--boks-mild`.

Bakgrunn på alle sider: `--side-bakgrunn`
= `linear-gradient(160deg,#F5F5F5 0%,#ECEFF1 100%)`,
`background-attachment:fixed`. Kort: `border-radius:18px`, skygge
`0 2px 14px rgba(0,0,0,.06)`.

**Gjennomført på alle fem filene 27. august 2026.** Fire av dem lå på
`#F5F5F5→#FAFAFA` og er flyttet hit. Kortene er hvite, og mot `#FAFAFA` hadde
de knapt noen flate å ligge på – kanten var det eneste som skilte dem. Det
merkes mest på kjøkken-iPaden, som leses på avstand.

**Bakgrunnen har fått en egen variabel, og det var nødvendig.** De fire filene
bygde gradienten av `--bg-1` og `--bg-2`, men de to er *flatetoner* med egne
jobber: topplinje, søkefelt og knappeflater i oppskrifter og handleliste, og
tretten steder i kalenderen – rutenett, ukehode, segmentknapper, celler
utenfor måneden. Hadde `--bg-2` blitt satt til `#ECEFF1`, ville alle de
flatene skiftet farge med på kjøpet. `--side-bakgrunn` er bakgrunnen og
ingenting annet, og er den som skal løftes inn i felles `:root` i 7.3.

**`--ink-soft` er endret fra `#7A8899` til `#5A6C7D`** – altså verdien de fire
andre filene alt hadde, ikke dashboardets. Doc'en sa tidligere `#7A8899`.
Grunnen til omgjøringen er kontrast: `#7A8899` gir 3,46 mot bakgrunnen, og
3,13 mot dashboardets egen flate. WCAG-grensen for vanlig tekst er 4,5.
`#5A6C7D` gir 5,19. Metateksten er de små linjene – mengder, kategorier, «sist
endret av» – på 11 og 13 px, på en skjerm som henger på veggen. Det er
nøyaktig der lav kontrast biter.

**`--line` er `#E4E8EC` i alle fem.** Index lå på `rgba(44,62,80,.10)`.

**`--shadow` er `0 2px 14px rgba(0,0,0,.06)` i alle fem.** Index og kalender lå
på den hardere `0 2px 10px rgba(0,0,0,.08)`; dashboard hadde ingen `--shadow`
i det hele tatt og har fått den.

**Skyggen under logoen er `rgba(44,62,80,.18)`.** Oppskrifter lå på ren svart
`rgba(0,0,0,.28)`. Den nye er tonet med `--ink`, som resten av paletten.

**Handleliste er migrert hit.** Fila lå igjen på den gamle
material-paletten og hadde en egen femlags vignettbakgrunn med mørke
ellipser og prikktekstur – ingen andre filer hadde noe slikt. Den er nå på
felles `:root` og felles gradient, og knappene er fordelt på de fem
betydningene: grønt på Legg til og Lagre, oker på flytte- og
bekreftelsesknapper, og en ny klasse `.btn-tvers` i lilla på Les inn, Last
ned katalogen, Slå sammen og import-knappen. Det er fire knapper som alle
flytter data mellom apper – nøyaktig det lilla betyr.

## Skjemaer og tastatur

Dette kostet en hel økt og flere feilgjetninger. Reglene under er dyrekjøpte.

**`vh` krymper ikke når tastaturet kommer opp.** iOS later som vinduet er
like høyt, selv om halve skjermen er dekket. Alt som regner høyde i `vh` for
å holde seg over tastaturet, regner derfor på en høyde som ikke finnes.
Bruk `visualViewport.height` og `visualViewport.offsetTop`, og oppdater på
`resize` og `scroll` på den. `vh` beholdes bare som reserve for nettlesere
uten den.

**Knapperaden skal ligge utenfor rullefeltet.** Et skjema som ruller
innvendig tar knappene med seg ut av syne. Kortet er `flex-direction:column`
med `overflow:hidden`; overskrift og knapperad er `flex-shrink:0`, og bare
selve skjemaet ruller. Da kan innholdet bli så høyt det vil uten at Lagre
forsvinner.

**Høyde løses med kolonner, ikke med posisjon.** Seks felt under hverandre
blir høyt uansett hvor høyt oppe skjemaet starter. Bredere kort og to eller
tre kolonner er det som faktisk får hele skjemaet over tastaturet. Kjøkken
dash bruker `grid-template-areas`, handleliste et enklere rutenett som går
fra én til to til tre kolonner.

**iOS tegner `date`, `time` og `select` med sin egen drakt.** De får egen
høyde, egen minstebredde og midtstilt tekst – datofeltet stakk ut over
nabokolonnen, kalendervalget var 8px lavere enn tekstfeltet ved siden av, og
klokkeslettene sto midtstilt mens alt annet sto til venstre. Chrome sin
iPad-simulator tegner dem som vanlige bokser, så feilen synes ikke der. Slå
av drakta med `-webkit-appearance:none`, sett høyde og `text-align:left`
selv – og tegn nedtrekkspila inn igjen på `select`, for den forsvinner
sammen med drakta.

**En filvelger kan ikke være `display:none`.** Safari nekter å åpne den
programmatisk. Legg den utenfor skjermen i stedet.

**`transform` på en forelder gjør `position:fixed` relativ til den.** Å bryte
et element ut av en smal spalte med `margin-left:50%; transform:translateX(-50%)`
ødelegger derfor alt som er fastposisjonert inni. Bruk en klasse på `body` og
sett bredden på `main` i stedet.

**Bakteppet lukker ikke skjemaet.** Et halvskrevet notat skal ikke ryke av et
bomtrykk. Veien ut er Avbryt, krysset eller Escape.

**Foto duger ikke til feilsøking av layout.** Fire runder gikk med på å gjette
ut fra bilder tatt på skrå av en skjerm i landskap. Be om skjermbilde – da er
det piksler å måle i stedet for perspektiv.

## Modus

- **mobil** under 700px – kjapt, på farten
- **iPad** 700–1300px – display og betjening, leses på avstand
- **PC** over 1300px – oversikt, tåler tett informasjon

**Landskapsbetingelsen** skrives alltid slik:

```
@media (min-width:820px) and (min-height:600px) and (orientation:landscape)
```

Høydekravet er ikke pynt – uten det treffer regelen telefon i landskap. For
lave skjermer generelt brukes `@media(max-height:600px)`, ikke `orientation`.
I JavaScript finnes betingelsen som konstanten `LANDSKAP` – gjenbruk den.

## Primærenhet per side

Alt skal **virke** overalt. Bare primærenheten skal være **forseggjort**.

| Side | Primærenhet |
|---|---|
| Kjøkken dash | kjøkken-iPad |
| oppskrifter | iPad ved benken, PC ved innlegging |
| handleliste | mobil |
| kalender | mobil og PC |
| index | alle |
| Emma dash | hennes egen enhet |
| Andrea dash | hennes egen enhet |
| Mattespill | iPad |
| Sikkerhet | mobil og iPad |

PC er utviklingsflate, ikke bruksflate.

## Topplinja

*Fra 8. november 2026.*

**Alle sidene har samme topp:** sidas ikon på 84 px med navnet ved siden
av (trykk: startvisningen, hold inne: forsiden), låseikonet på fellesenhetene, været med stedet
inntil, og klapptavla med dato til høyre – med alarmene og timerne under. Den ligger i `felles-topp.js` og
`felles-topp.css`; en side får den med
`<header class="ntp" id="neamTopp" data-ikon="…" data-navn="…">` og fila
lastet etter `felles-neam.js`. **En ny side skal ha den** – ikke en egen
variant.

- **Ikonet er flisen man trykket på** for å komme dit. **Kort trykk** er
  tilbake til sidas startvisning og til toppen – det samme som andre trykk
  på sidehåndtaket (`window.neamSideAndreTrykk`). Spill- og øvingssidene
  lenker tilbake til dashet sitt (`data-hjem`). **Hold inne i to sekunder**
  er forsiden, uten å slippe; at sida bytter er tegnet på at tiden er gått
  (8. november 2026, Magne). **En ny side med faner eller visninger skal
  sette `neamSideAndreTrykk`** – uten den ruller trykket bare til toppen.
- **Forsiden viser bare logoen** (`data-navn=""`) – NEAM-logoen sier
  navnet selv.
- **Navnet på den innloggede står ikke i toppen**, verken her eller på
  dashene.
- **Været er alltid nå** utenfor dashene. På dashene følger det dagen man
  ser på (`window.ntpVaerDag`). **Trykk på været** åpner værboblen: døgnet
  hver tredje time og langtidsvarselet.
- **Kompakt under 700 px:** ikon på 56 px, navn og liten klokke; været og
  stedet vises ikke. Bredden som måles er **toppens egen** (container
  query), ikke skjermens – en side i smal spalte på PC blir også kompakt.
  Stedet faller bort under 780 px, vinden under 900 px.
- **Kalender skjuler toppen** i fullskjerm og på liggende telefon, der
  høyden trengs til kalenderen.
- **Låst ved rulling** (8. november 2026, Magne). Toppen står øverst hele
  tiden og får bakgrunn og en svak skygge når sida er rullet – samme
  oppskrift som skallets `.topbar`. En side med en egen låst rad under
  (fanene i Økonomi) bruker `top:var(--ntp-h)`, som `felles-topp.js` setter.
  På Handleliste og Matlaging står toppen i skallets `.topbar`, som er den
  som låses – og som vises på alle visningene, også i en oppskrift.
- **`overflow-x:hidden` på `html` eller `body` stopper låsingen** – bruk
  `clip` (se «Praktiske feller»).

**Klokka: alarm, nedtelling og stoppeklokke** (8. november 2026, Magne).
- **Trykk på klokka** gir lista: navn, tid og hvem, med **Endre** (oker),
  **Slett** (rød) og Pause/Fortsett på stoppeklokka, og **Ny** (grønn).
  Det som fjerner heter Slett – «Avbryt» er nøytral og bare for å gå ut av
  skjemaet (Avbryt-regelen).
- **Til venstre for klokka:** små ikoner med tallet under – alarmen
  `--aksent`, nedtellingen `--handling-endre`, stoppeklokka
  `--handling-ny` – i høyst to rader. **Ikke under klokka:** det gjorde
  toppen for høy. **Høyst ti** på en skjerm. En nedtelling laget fra en
  koketid i en oppskrift har en **liten gryte** (matlagingsikonet) i
  stedet for timeglasset – ved klokka, i lista og når den ringer.
- **Gjelder for:** «Bare denne enheten», eller Kjøkkenet og/eller Magne,
  Nina, Emma og Andrea. Det delte ringer der en mottaker har Neam åpen, og
  der det ble laget – ikke på en låst telefon (det krever push).
- **Når den ringer:** kort midt på skjermen med navnet og et pip som
  gjentas, **Stopp** og **Slumre 5 min**. Kortet ligger over alt, også
  låseskjermen på kjøkkenet.
- Panelene bygger på `felles-dialog.css` og ligger mellom Neam (til 92) og
  sidenes dialoger (120), så en bekreftelse fra skjemaet havner oppå.

Avvik fra den felles toppen på en side er et nytt valg – spør.

## Kjøkken dash

Fila het `dashboard.html` og gjør det fortsatt – bare det synlige navnet er
endret, så snarveier og bokmerker holder.

**Ikonet og navnet øverst:** sidas ikon på 84 px og sidenavnet ved
siden av (`.merke-navn`, i ikonstilen). Fram til 27. oktober 2026 sto bare
merkelappen der, med navnet malt inn. Navnet på den innloggede står ikke
der – sidenavnet forteller hvem dashet tilhører når hver får sitt. Ikonet
er det samme som flisen på forsiden, så man kjenner igjen sida man
trykket seg inn på. Samme topp på Emma dash og Andrea dash. **Fra
8. november 2026 er det den felles toppen** (se «Topplinja»).

**Døgnet skifter klokka 20.** Etter det viser skjermen morgendagen, og
etiketten sier «I morgen» – ikke «I dag», som ville vært en løgn. Alt som
bare gjelder den virkelige i dag (pågår, forbi, nå-været) sjekker en egen
`viserIdag()`, ikke `dagOffset`. Skjermen står på hele døgnet, så den må
oppdage skiftet selv: klokka sammenligner dagsbasisen mot forrige tikk og
tegner om, både kl. 20 og ved midnatt.

Dette ble tidligere skrevet opp som «bør utløses av hvilen, ikke av klokka».
Det ble klokka. Hvilen nullstilles av hvert trykk, og en skjerm noen står
foran og lager middag ville da aldri skiftet.

**Passerte avtaler ruller opp av seg selv**, slik at neste avtale ligger
øverst. De blir stående – man kommer til dem ved å rulle tilbake. Skjer bare
når man ser på i dag.

**Ingen bunnrad.** «Sist oppdatert», Oppdater og Logg ut er borte. Skjermen
oppdaterer seg selv hvert femte minutt, når den kommer fram igjen, og ved
døgnskifte. En kjøkkenskjerm har ingen som logger ut.

**Klokkeslettene er svarte.** Den pågående avtalen hadde blå tid, resten
svart – «noen er blå og noen er svarte» er ikke en regel man leser av en
skjerm på avstand.

**Merknader og Denne uken.** Dagens merknader står hele dagen uten å falme.
Ukemerknadene har ingen dato, bare en ukedag («innen ons»), og hukes av med
en boks som ligger **utenfor** den fargede raden, til høyre. Avhukede synker
til bunnen og blir stående ut uken. Under panseret lagres fortsatt en dato,
beregnet fra ukedagen – da er uke- og sorteringslogikken urørt.

**Dag | Uke i avtalekortet** (2. november 2026), kopiert fra Emma dash
uten Fag. Bytteren står i korttittelen. **Uke** er sju døgnsøyler med
**alle** kalenderne – Emma dash viser bare hennes egne – og tar hele
bredden; påminnelsene og middagen står der igjen når man går tilbake til
Dag. Åpnes en avtale fra uka, kommer høyrekolonnen fram for detaljkortet
(`settBredde()`). Pilene og sveipen blar én dag i Dag og én uke i Uke, og
tittelen viser uketallet. **Hvilen og «Tilbake til i dag» legger skjermen
i Dag på i dag** – standard er dagsvisningen, ikke bare dagens dato.
Oppdateringen, døgnskiftet og lagring tegner den visningen som står
framme (`tegnVisning()`).

## Redigeringsmodus

Mønsteret fra oppskriftssiden, ment å gjenbrukes.

**Én knapp slår på modusen.** Mens den står på: okerskjær på alt som kan
endres, faner med redigerbart innhold får samme duse flate, og det som ikke
kan endres her gråes ut.

**Veiene ut ligger samme sted som knappen som slo den på** – Lagre i grønt
over Avbryt i nøytralt. Ingen dupliserte knapper lenger nede på siden.
(Sto tidligere som «Avbryt i rødt». Det motsa fargetabellen, og det er
fargetabellen som gjelder – se Avbryt-regelen.)

**Avbryt må angre alt.** Ikke bare det ene feltet man ser. Løsningen er å ta
vare på utgangspunktet når modusen slås på, og skrive det tilbake hvis noe
faktisk ble endret. Uten det betyr Avbryt «angre det siste», og da er den
ikke til å stole på.

**Poster åpnes én om gangen.** Tips, kommentarer og vurderinger står i ro
med Endre og Slett til høyre – ikke ti åpne felt samtidig.

**Rekkefølge flyttes med piler og et skrivbart nummer**, ikke med draing.
Draing slåss mot rulling på berøringsskjerm, og nettleseren avbryter draget
når den tror du blar. Piler for nabobytte, tall for lange hopp.

**Sletting hører nederst på siden**, ikke i samme hjørne som Lagre.

## Mønstre

**Korttitler** er svarte, `--t-meta`, versaler, `letter-spacing:.1em`.

**Sorteringsknappen** er `.sorter-flyt` / `.sorter-knapp` – fast nede til
høyre, 48px, samme i alle skjermformater. Flytende knapper i samme hjørne
skal ha samme diameter; sideluft legges først til når en knapp folder ut
tekst.

**To trykk på berøringsskjerm:** første trykk viser navnet, andre utfører.
Navnet trekker seg inn ved rulling, ved trykk et annet sted, og etter fire
sekunder. Brukes bare der navnet ikke får plass.

**Autofullfør erstatter nedtrekkslister.** Mønsteret fra handleliste, ment
å gjenbrukes: et vanlig `input` i en `.ac-wrap`, med en `.ac-drop` under som
filtrerer mens man skriver. `acBind(felt, hentListe, valg)` binder det hele.

To varianter, og forskjellen er prinsipiell. **Lukket liste** (`closed`) lar
deg filtrere, men ikke finne på noe nytt – brukes der verdien betyr noe for
resten av systemet: varetype og hvem som la den til, fordi begge grupperer og
sorterer. **Åpen liste** gir ekstra valg nederst når det du skrev ikke finnes:
legg til denne gangen (`canAddOnce`), eller legg til permanent (`canAddPerm`).

**Enheten er flyttet fra lukket til åpen.** Den ble aldri brukt til å gruppere
noe – den er bare tekst som havner bak mengden. En «klype» eller en «neve» er
noe brukeren vet bedre enn lista, og lista i koden røres ikke: enheten lagres
på varen som en engangsverdi. Butikkfeltet er fortsatt det eneste med
permanent lagring.

**Mengdefeltet er tekst, ikke tall.** `type="number"` avviser alt som ikke er
siffer, og «1/2», «ca 2» eller desimalkomma på norsk tastatur er dermed
umulig. Mengden lagres og vises som ren tekst overalt – ingenting regner på
den – så feltet er nå `type="text"`. Prisen er at det vanlige tastaturet
kommer opp i stedet for talltastaturet.

Rader i nedtrekket kan ha bilde. Butikkfeltet viser butikklogo, varefeltet
viser produktbilde. Det er det samme mønsteret, ikke to.

**Ett skjema for oppretting og endring.** Handleliste hadde to: en side for
ny vare og en modal for rediger, med hvert sitt sett felt (`f-` og `e-`).
Modalen er slettet, og `openEdit()` fyller ut det samme skjemaet.
`saveItem()` greiner på om det ligger en id i `byttId`. Poenget er ikke å
spare linjer, men at et felt som legges til, fjernes eller flyttes bare kan
gjøres ett sted – to skjemaer glir fra hverandre uten at noen merker det før
det ene mangler noe.

Det som **ikke** skal kunne endres i etterkant, skjules i stedet for å stå
dødt: fanene Dagligvare/Andre varer er borte når man endrer, fordi lagringen
ikke flytter en vare mellom listene. Et valg som ikke virker er verre enn
ingen valg.

**Sletting ligger bak Endre, ikke i lista.** En sletteknapp på hver rad er
for lett å treffe med tommelen. Merknadene på Kjøkken dash har derfor bare én
oransje endre-knapp per rad; Slett står i rødt nederst til venstre i skjemaet
som åpnes, med bekreftelse på overskriften.

**En pil er ikke en knapp.** Symboler som ikke gjør noe ved trykk skal ikke
se ut som knapper. En uttoning sier «det er mer her».

**Vindretning tegnes som pil, ikke som «NØ».** Meteorologiske grader sier hvor
vinden kommer *fra*; pila viser hvor den blåser *mot* – grader pluss 180.

**Kartnål betyr «et sted». Sikteikon betyr «min posisjon nå».**

**Orddeling:** `lang="nb"`, ikke `"no"`. «no» er en paraplykode uten
orddelingsordbok. Sammensatte ord får `&shy;` på fugen og `hyphens:manual` –
automatisk deling gjetter feil («KVITTERIN-GER»).

**Tall skal ha grunnlaget sitt med seg.** Per 100 g og per porsjon er samme
felt med to betydninger. Regn om bare når mengden er oppgitt i vekt – aldri
gjett vekten av «2 stk løk».

**Mengde og enhet er to felt, ikke ett.** En vare har `amt` og `unit`, begge
tekst. Den gamle `qty` var fritekst og finnes fortsatt, men bare som avledet
visningstekst for import av gamle lister. Skriv aldri til `qty` som kilde.
Standardenhet er «stk».

**Navn som står to steder må skrives to steder.** Oppskriftens tittel ligger
både på oppskrifta og i indeksen forsiden leser.

### Den sammenleggbare linja (fra 6. november 2026)

**Lister som ikke trenger å stå åpne, ligger under en linje man klikker
opp** (Magne: «vi må kunne legge flere lister under kollapsbare linjer»).
Den er én byggekloss, ikke en ny tegning for hver side. Første side som
bruker den, er Økonomi.

- **Oppbygning:** pil (›, dreies ned når linja er åpen), eventuelt en
  statusprikk, tittelen i fet `--t-brod`, og et **sammendrag** til høyre i
  `--t-meta` og `--ink-soft`. Klikk hvor som helst på linja åpner og lukker.
  **Tittelen krymper ikke**; et langt sammendrag bryter over flere linjer
  i stedet (7. november 2026: «Verdier» havnet under sammendraget på
  telefon).
  Innholdet står under, rykket inn 26 px (ikke rykket inn på telefon).
- **Sammendraget skal gjøre det unødvendig å åpne:** antall («3 poster»),
  sum («3 poster · 1 240 kr»), status («Hentet i dag 21:52») eller det som
  mangler («Ikke satt»).
- **Statusprikken har tre farger:** grønn `--handling-ny` er i orden, gul
  `--handling-endre` trenger noe, rød `--danger` feilet. Gul og rød farger
  også sammendraget. Samme betydning som prikkene for kildene.
- **Flere linjer i ett kort** – skilt med en tynn strek (`--line`) – er
  vanligere enn ett kort per linje. Er alle linjene i et kort skjult, skjules
  kortet.
- **Sida husker hva som er åpent** (localStorage), per linje. Det som må
  sees først, står åpent første gang: «Trenger et valg» i innboksen,
  «Uten rolle» blant kontoene.
- **Tastatur og skjermleser:** en ekte `<button>` med `aria-expanded` og
  `aria-controls`. Ingen andre grep.
- **Linjer kan stå inni linjer** – gruppe › post › linje – men lukk ikke
  mer enn to nivåer inni hverandre.

I koden: `okFold()` og `okFoldSett()` i `okonomi.html`. Skal en annen side
bruke den, flyttes den til en fellesfil først – to kopier er verre enn én.

## Navigasjon og historikk

**Ingen tilbakepiler.** På nettbrett og telefon er sveip fra kanten
tilstrekkelig; på PC har nettleseren egne navigasjonsknapper. Piler i skjermen
er en tredje vei som må vedlikeholdes og plasseres, og som ikke sier noe mer
enn bevegelsen allerede gjør. `.topbar-back` og `.back-fab` er fjernet.

**Men sveipen må ha noe å gripe i.** Visningene byttes med `showView()` uten
sidelasting. Uten historikkoppføringer finnes det ingenting å gå tilbake til,
og sveipen forlater hele appen i stedet for å gå ett steg. Mønsteret:

- `history.replaceState({fh:true, visning:HJEM}, '')` når sida lastes
- `history.pushState` i `showView()`, men ikke når visningen alt ligger øverst
- en `popstate`-lytter som kaller appens egen navigasjonsfunksjon
- et flagg som er sant mens `popstate` behandles, så tilbakesteget ikke selv
  legger igjen en ny oppføring

**Hjemvisningen står som `class="view active"` i markupen og går aldri gjennom
`showView()`.** Derfor må den første oppføringen settes eksplisitt ved lasting.
Overlates det til første `showView()`-kall, blir det en *under*visning som
kaller `replaceState` – den legger seg da **over** forsiden i stedet for etter
den, og ett tilbakesteg bærer rett ut av appen. Dette var ikke åpenbart før det
ble testet på enhet.

**Sidene er ekte sidelastinger.** Når visningene først ligger i historikken,
tar den samme sveipen deg videre ut til appen du kom fra. Navigasjon på tvers
krever derfor ingen egen mekanisme.

**`replaceState` med `{}` sletter tilstanden.** Dyplenken i oppskrifter ryddet
`?rett=` ut av adressen og tømte samtidig `fh`-merket. Send `history.state`
inn igjen når det bare er adressen som skal endres.

**Kalender har ikke dette ennå.** Fire visninger og et sidepanel bytter uten
historikk. Sveipen oppfører seg derfor ulikt i de tre appene – verre enn om
ingen hadde hatt det.

## Neam – panel og firer

Neam-assistenten lastes av alle sidene som fellesfil (`felles-neam.css` +
`felles-neam.js`). Panelet er samtalen; **merket i hjørnet er inngangen til
alt.** Arkitekturen – kontrakten mot sidene, verktøykallene – ligger i
kartleggingen (del 13, 19); her står bare det som angår utseende og
betjening.

**Fireren.** Ett merke i hvert nedre hjørne. Trykk folder ut tre knapper i
et hjørnemønster: `opp` (rett over), `skraa` (diagonalt) og `ved` (til
siden). Venstre hjørne er Neam og huset: Enheter, Apper, Dash, og andre
trykk på merket åpner samtalen. Høyre hjørne er sidas egne handlinger
(`neamSideHandlinger`). Tynne koblinger binder knappene til hjørnet –
se «Koblingene» under. Venstre hjørne viser den runde NEAM-logoen
(`neam-logo`), høyre hjørne sidas eget ikon.

**Knappene er like i alle visningene på en side.** Settet skiftet en stund
med visningen på Emma dash («Avtale» i Dag, «Rediger» i Fag); da måtte man
vite hvor man sto for å vite hva hjørnet kunne. Det som avhenger av
visningen ligger inne i menyene i stedet.

**Menyene går i dybden, ikke i bredden.** `neamSideStabel(plass, liste)`
åpner en stabel over knappen; et valg merket `meny:true` åpner en *ny*
stabel på samme plass og lar fireren stå. Fem valg med to undervalg hver
ville vært femten knapper i et hjørne. Tilbake er andre trykk på merket.

**Over tre valg legges stabelen i to rader** – også på telefon. Fire over
hverandre nådde toppen av skjermen. **Det gjelder også `ved`:** på smal
skjerm (under 900 px) legges en `ved`-stabel med flere enn tre valg som
skrå-stabelen, og ledningen forlenges ned til knappen (7. november 2026 –
før det ble den en søyle som nådde 107 px fra toppen på telefon).

**Bildeknapper.** En knapp kan bære et ikon (`merke:true`,
`knappMerke('navn')`, filene i `bilder/ikoner/`). Da faller papirskiva bort,
og **navnet står under bildet** i ikonstilen – se «Ikonene og navnet
under». Fram til 27. oktober 2026 var bildene knappemerker med navnet malt
inn (`bilder/knapper/`), og teksten var skjult. Laster ikke bildet, tas
`merke` av knappen og papirskiva kommer tilbake – en bildeknapp uten bilde
er ellers bare et navn som henger i lufta. Regel: **et ikon skal si
nøyaktig det knappen gjør** – «Skann ark» på en knapp som limer inn tekst
er verre enn ingen ikon. To knappenavn har fått ikon under et annet
filnavn (`NEAM_IKON_FRA`): `avtale` → `ny-avtale`, `rediger` → `endre`.

**Koblingene ligger på utsiden.** For kolonner tegner JS (`neamRorKolonne`)
en ledning 14 px utenfor knappene mot skjermkanten, T-stykke ved hver
knapp, bend øverst og inn i hjørnet nederst. For rader og for fiskebeinet
gjelder egne figurer. Ingen kobling går bak en knapp. **Måltall i CSS er
fra toppen; `bottom` regner fra bunnen.**

**Koblingene (fra 27. oktober 2026).** Tynne linjer, 6 px, i dempet
pastellblå (`--kobling` `#A9BCD3`), med myke svinger og endepunkter i en
mørkere blå (`--kobling-ende` `#6F89AB`) der messingkragene satt. Bare
CSS: delene heter fortsatt `.rdel` med de gamle bildenes mål, og skjøtene
tegnes på de samme armsentrene, så geometrien i `neamRorKolonne()` og
`neamRorRad()` er urørt. Fargene er variabler, så et personlig tema kan
sette sine egne. **Navnene under ikonene har papirflate bak seg**, så
linjene går bak teksten og ikke tvers over den.

**Applista er et fiskebein:** loddrett stamme i midtkolonnen, rett over
Apper-knappen, par på tverrbjelker, en enslig på toppen (2-2-1 med fem,
2-2-2 med seks, 2-2-2-1 med sju). Kryss der stammen fortsetter opp
gjennom en bjelke, T der den slutter. De første appene nederst, nærmest
tommelen.

**Figuren krymper når den ikke får plass.** Med åtte apper i lista ble
fiskebeinet fire nivåer høyt, og på iPad stakk toppen 46 px over
skjermkanten — merkene lå der uten å kunne trykkes, og ingenting sa fra.
Høyden måles nå mot vindushøyden, og hele boksen skaleres fra **bunnen
midt**, der stammen går ned i knappen, så festepunktet ikke flytter seg.

Målingen leser CSS-variablene, ikke `getBoundingClientRect`: den skjer før
boksen vises, og en skjult boks har ingen høyde å måle.

**Bunnen på 0,55 er en grense, ikke en innstilling.** Kommer figuren dit,
er det lista som må filtreres på innlogget bruker — ikke skalaen som skal
settes lavere.

**Innstillingene: hold inne høyre tommelknapp i tre sekunder** (7. november
2026), på alle sidene. En blå ring (`--aksent` med gjennomsiktighet) vokser
rundt knappen mens man holder; når man slipper, spør Neam «Åpne
innstillinger?». Spørsmålet kommer ved slipp, aldri mens fingeren ligger
på. Svarer man ja, åpner hjørnet seg med **bare innstillingene**:
Husregisteret (opp), Reset (skrå – Myk og Hard reset i en stabel) og Logg
ut (ved). Reset og Logg ut spør først med en vanlig bekreftelse («Last på
nytt», «Hent på nytt», «Logg ut»), fordi det som ikke er lagret,
forsvinner. Andre trykk på knappen lukker bare. Forsidens egen «System»
er borte – den ligger her nå.

Ringen er 36 px bred, så den synes rundt tommelen. **Knappen kan ikke
dras** mens man holder (bildet tar ikke imot pekeren, knappen har
`touch-action:none`). Når tiden er ute, **blir ikonet innstillinger**, og
det kommer et kort rykk – bare der nettleseren kan (Android; iPhone gir
ikke rykk). Svarer man nei, kommer sidas ikon tilbake.

**Tommelknappene synes alltid** (7. november 2026): Rommene og Neamow
legger seg under dem (z-index 88), og spillsidene har dem også – uten
samtalen, så andre trykk på NEAM bare lukker. Høyre knapp står også på
sider uten egne handlinger; et vanlig trykk der sier at man kan holde inne
for innstillinger. Dialogene (120) ligger fortsatt øverst.

**Ingenting man skal trykke på, får ligge under tommelknappene.** De står
fast nederst, så en side som ruller, må ha plass til dem i bunnen
(`calc(var(--f-handtak) + var(--f-marg-y) + 16px)`), og en side som ikke
ruller – som runden i mattespillet – må krympe noe annet enn knappene
når skjermen er lav (8. november 2026: robotfeltet i mattespillet).
Sjekk på 390×660, som er omtrent det en iPhone viser i Safari.

**Pinkoden på kjøkkenskjermen** (8. november 2026). Bare når sida er logget
inn som felles@ (fellesenhetene – het kitchen@ til 8. november 2026).
Første trykk etter tre minutter i ro – eller første trykk
etter at sida lastet – svelges, og tastaturet kommer: tittelen «Tast koden
din», **seks prikker** i `--aksent` (fylt for hvert siffer), og **store
taster** i tre kolonner (76 px høye, 34 px tall, `--paper-soft` med
`--boks-kant`; 58 px når skjermen er lav). Nederst «Hopp over» til venstre
og «Slett» til høyre som lette tekstknapper. Det sjette sifferet sender
koden – ingen OK-knapp, alle kodene har seks sifre. Feil står i `--danger`
under tastene. Riktig kode gir **«Hei Magne!»** i displaystørrelse og en
blå OK over hele bredden; den må trykkes bort. «Hopp over» gir husmodus.
Tastaturet ligger på `.dlg-bak` (120) og lukkes ikke av bakteppet.

**Pinkoder for sys@ ligger under Husregisteret** i innstillingene: for sys@
åpner Husregisteret en liten stabel med Husregisteret og Pinkoder
(låsikonet). Alle andre ser Husregisteret som før. Lista viser de fire med
«Har kode» / «Ingen kode», og knappene følger betydningene: grønn «Sett
kode», oker «Endre», rød «Fjern» (spør først). En ny kode tastes på det
samme tastaturet, to ganger.

**Låseikonet på fellesenhetene** (8. november 2026) står til høyre for
ikonet oppe til venstre (Kjøkken dash og forsiden), 64 px, med navnet
under i ikonstilen: «Låst», personen eller minuttene som er igjen. Trykk
gir valget om tid – store, nøytrale knapper i `--paper-soft` (15 minutter,
30 minutter, 1 time), og «Lås nå» og «Avbryt» som nøytrale dialogknapper.
Fem og to minutter før tiden er ute: «Skjermen låses om 5 minutter.» med
OK (nøytral) og Forleng (blå), og **et lite pling** – to korte toner laget
i nettleseren. Plinget brukes bare når skjermen er i ferd med å låse seg.

**Neams egne klasser har `neam-`-prefiks, også modifikatorene.** Høyre
hjørne het `.side` til 7. november 2026, og fem spillsider og kalenderen
har sin egen `.side` – på spillene ble knappen en lang smal oval. Nå
`.neam-hoyre`. Samme dag ble `.merke` på knappene til `.neam-merke`: dashene
har `.merke{width:100%}` (knappene ble 280 px brede) og spillene `.merke`
på 64 px (knappene krympet). Vanlige ord er alt tatt av sidene.

**Venstre firer: `ved` er Sikkerhet, ikke Dash** (fra 11. september 2026).
Kjøkkendashen nås fra applista som alle andre sider; sikkerhet er det ene
man vil nå uten å lete. Knappen har **ikke** merke — et «Dash»-merke ville
løyet, og et ikon skal si nøyaktig det knappen gjør. Den har fått
Sikkerhet-ikonet 27. oktober 2026, det samme som i applista.

**Enheter er en kolonne over knappen, fylt av `window.neamEnheter`** –
en liste av `{navn, ikon, gjor, merke}`. Den sto tom til 10. oktober 2026;
nå setter `felles-hus.js` den, så alle sidene med Neam får de samme
enhetene. **`merke:true`** gjør ikonet til et bilde med navnet under, som
knappene i fireren. Første enhet er Neamow.

**Fireren bor i Neam-laget, ikke i `felles-skall.css`.** Den flytter til
skallet den dagen `hub.html` eier navigasjonen.

**Merket har to grep, og de må ikke kollidere.** Kort trykk er fireren. Langt
trykk er push-to-talk (spesifisert, ikke bygget): hold gir en rød sirkulerende
ring, slipp rett sender til Neam, dra høyre legger teksten i skrivefeltet
først, dra venstre avbryter. Terskelen mellom kort og langt er ~0,5 sek, og
retningen må vises mens man drar. Fordi det lange trykket på midten er reservert
til stemme, skal ikke et annet «langt trykk» legges på de ytre knappene – to
like bevegelser med ulik betydning, centimeter fra hverandre, lærer hånden
aldri. Stemmen er dessuten det ene skjulte grepet systemet har råd til; flere
blir en hemmelighet folk ikke finner.

**Unntak, Magnes valg 7. november 2026:** høyre knapp har likevel fått et
langt trykk – tre sekunder til innstillingene (se over). Det er langt nok
til ikke å forveksles med stemmens ~0,5 sek, og et vanlig trykk på en side
uten handlinger sier at grepet finnes.

### Fast til høyre på PC (fra 6. november 2026)

**På PC står Neam oppe hele tiden, til høyre** (Magne: «på pc kan neam ha
adskillig større plass på høyre side og være oppe hele tiden»). Ligger i
`felles-neam.js` og `felles-neam.css`, og gjelder alle sidene som laster
Neam.

- **PC betyr bred skjerm og mus:** `(min-width:1280px) and (pointer:fine)`.
  Berøringsskjermer – kjøkkenskjermen, iPadene – får det vanlige panelet,
  også når de er brede. Smalere enn 1280 px er det også det vanlige.
- **Bredden er omtrent en tredjedel av skjermen:** `clamp(420px, 33vw,
  760px)` – 475 px på en 1440-skjerm, 634 px på en 1920-skjerm. Panelet står
  16 px fra kantene, med samme skygge som kortene (`--shadow`).
- **Det lukkes ikke.** Ingen ×-knapp, og Escape stopper tale og mikrofon
  uten å skjule panelet. Det åpnes uten å ta fokus – sida skal kunne brukes
  med tastaturet uten at Neam tar det. Blir vinduet smalt, lukkes det, så
  det ikke plutselig legger seg over sida.
- **Sidenes egne dialoger og lag ligger over Neam.** Panelet har z-index 30
  i fast modus, under sidenes lag (40 og opp): en dialog fra sida dekker
  Neam slik den dekker resten. Bekreftelsene fra `felles-dialog.js` (120)
  ligger fortsatt over.
- **Sida får plassen som er igjen** gjennom `padding-right` på `body`.
  Rammen på sida står midt i den.

**Regler for sidene:**

- **Noe som er festet til høyre kant, trekker fra `--neam-plass`:**
  `right:calc(20px + var(--neam-plass, 0px))`, og en linje i full bredde
  `right:var(--neam-plass, 0px)`. Variabelen finnes bare når Neam står fast;
  reserven `0px` gjør at alt er som før ellers. Handlelista, kalenderen og
  oppskriftene gjør det.
- **Plasseringer regnet fra `50vw` eller `100vw` må regne med den:** midten
  av plassen som er igjen er `50vw - var(--neam-plass, 0px) / 2`, og full
  bredde er `100vw - var(--neam-plass, 0px)`. Se blapilene på kalenderen og
  detaljvisningen i oppskriftene.
- **Sidefireren i høyre hjørne flytter seg selv** – den måles fra
  `--f-marg-h`, som er `--f-marg-x` pluss plassen til Neam.
- **En side som trenger hele bredden, melder seg ut** med
  `window.neamFast = false`, satt før sida er lastet ferdig. Ingen gjør det
  i dag.
- **Ny side med noe festet til høyre: sjekk den på 1440 px med mus** – at
  den ikke ruller sidelengs, og at ingenting ligger oppå Neam.

## Ikonene og navnet under

*Fra 27. oktober 2026. Erstatter merkelappene – reglene for dem står
under som historikk.*

**Alle ikoner ligger i `bilder/ikoner/`** og settes inn gjennom
`neamIkonImg(navn)` eller `knappMerke(navn)` i `felles-neam.js`. `navn` er
filnavnet uten `.png`, ikke en sti. Versjonen er `IKON_V`. Sider uten
`felles-neam.js` skriver stien selv, med `?v=1`.

**To slags bilder, én familie:**
- **Flis** (`.ikon-flis`) – motivet på en pastellfarget, avrundet flis
  som er tegnet inn i bildet. Områder, apper og de fleste knappene.
  **Robotflisene** er flisene der Neam selv gjør noe: Neam,
  Arbeidsoppgaver, Bil, Bilder, Kvitteringer, Økonomi, Mattespill og Diktat.
- **Strekikon** (`.ikon-strek`) – ikon uten bakgrunn, med mørk kontur. Får
  en lys papirflis rundt seg i CSS, så det står side om side med flisene.
  Lista er `NEAM_IKON_STREK` i `felles-neam.js`.

**Navnet står som tekst under bildet, aldri i det.** Det snur regelen
fra merkelappene. Stilen er `.ikon-navn`: Figtree, halvfet (650), mørk
marineblå `#142036`, rundt 9 % av flisbredden. Figtree lastes med
`@import` øverst i `felles-neam.css` – sider uten den fila faller tilbake
til Archivo. Teksten kan rettes, oversettes og leses av skjermleser, og et
nytt ikon trenger ikke et nytt bilde for hvert sted det står.

**Roboten er bare i sine egne fliser**, ikke i områdenes ikoner.

**Logoen og hjemskjermikonet.** Den runde NEAM-logoen (`neam-logo`, N
brun-grå, E lilla, A rosa, M rød på kremhvitt) står øverst på forsiden og
i venstre tommelknapp. Hjemskjermikonet er `bilder/neam-hjemskjerm.png`:
et helt kvadrat med fylt bakgrunn, fordi iOS runder hjørnene selv og
fyller gjennomsiktige hjørner med svart. **Alle sidene skal lenke det**
(`<link rel="apple-touch-icon" href="/bilder/neam-hjemskjerm.png?v=1">`) –
uten lenke spør iOS etter `/apple-touch-icon.png` i rota, som ikke finnes.

**Sikkerhetsenhetene har én flis per type og tilstand** i
`bilder/ikoner/sikkerhet/` (`SIK_IKON` i `sikkerhet.html`), ikke ett merke
per enhet. Stedet står som navn under, fra Homey.

**Minste størrelse er rundt 40 px.** Under det blir flisene grøt; bruk et
strekikon. Strekikonene fra det første arket er bare rundt 100 px og blir
uskarpe over 50 px på iPad – de bør lages i dobbel størrelse.

### Merkelappene (historikk, til 27. oktober 2026)

Hver ferdige app hadde sin egen **NEAM-merkelapp**: en rund klistremerke-figur
med et bånd nederst der appens navn sto. Filene ligger igjen i `bilder/`.

**Navnet sto i bildet, altså ikke ved siden av det.** Der en merkelapp
brukes, er tekstetiketten fjernet – på flisene i index, i topplinja på index,
og i hero-en på både handleliste og oppskrifter. Der sto «Handleliste / NEAM»
og «Neam / Matlaging» under merket; begge er borte, og merket er
utvidet fra 80px til 125px slik at det fyller høyden de to linjene tok.
Hero-en er like høy som før. Navnet på innlogget bruker står igjen under. Navnet ligger i `alt` på bildet og i
`aria-label` på lenka, så skjermlesere og lange trykk finner det fortsatt.

**Merkelappen står fritt.** Ingen sirkel, ingen luft, ingen skygge rundt.
Figuren har eget omriss og egen bunn. Dette er mønsteret i `.merke-ikon`
(dashboard) og `.brand-icon` (kalender, index).

**Ikke klipp den i en sirkel.** `border-radius:50%` med `overflow:hidden`
kapper endene av båndet nederst. Kjøkken dash-flisa i index hadde dette uten
at noen la merke til det, fordi kappingen var symmetrisk. Merkelappene har
gjennomsiktige hjørner og trenger ikke klipp.

**Filene er beskåret tett.** Bildets bredde *er* sirkelens diameter, og
sirkelen starter øverst i bildet. Båndet nederst gjør fila 3–8 % høyere enn
bred. Der merkelappen skal fylle en hvit sirkel – hero-en i handleliste og
oppskrifter – betyr det `padding:0`, `align-items:flex-start` og
`width:100%`, ikke midtstilling. Midtstilt blir det en hvit halvmåne i
bunnen.

**Størrelse på hovedlogoen i index** er `clamp(120px, 17vw, 195px)`. Den
følger fliseikonene i begge ender: 194px på full skjerm, 125px på telefon.
Midtpartiet kan ikke matches – mellom 700 og 1000px bytter rutenettet til
færre kolonner uten at skjermen blir smalere, så flisene vokser til 270px.
Et merke på 270px i topplinja ville tatt hele iPad-skjermen. `17vw` bremser
der med vilje.

*(Til 5. september:)* **De seks planlagte flisene hadde de gamle strekikonene.** Fikk de
merkelapper senere, er endringen å legge til klassen `merke` og fjerne
`app-name` – da oppfører de seg som de fire andre.

*(Til 27. oktober; nå står Familie-flisa der:)* **Innloggingsportene hadde
Neam-roboten**, ikke sidens eget
merke. Gjelder `#port .ikon` i index og dashboard og `.gate-icon` i kalender.
Bevisst inntil videre, ikke etterslep.

## Planlagte fliser i index

De seks appene som ikke er bygd ligger skjult bak bryteren **«Vis planlagte»**
i panelhodet. Skjult er standardtilstanden, så de ferdige får hele bredden.
**De planlagte har robotfliser** fra 27. oktober (`app merke soon planlagt`)
med navnet som tekst under, som de ferdige appene; «Kommer» står under
navnet. `flis-*.png` og de gamle merkelappene brukes ikke lenger.

**Bryteren setter klassen `skjul-planlagte` på rutenettet**, ikke
`hidden`-attributtet på hver flis. `.app` har `display:flex`, og det
overstyrer `[hidden]` stille – se fella under.

**`.app.merke` slår `.app-icon` inne i mediaspørringene**, fordi den er mer
spesifikk. Alt som skal gjelde ved lav skjermhøyde må derfor gjentas i en
egen `.app.merke`-regel inne i den mediaspørringen.

## Emma dash

Egen fil per bruker (`emma.html`), skåret fra kjøkkendashen. Konstantene
øverst (`EIER`, `EIER_KALENDERE`, `EIER_MERKNADER`, `DASH_TILGANG`) er det
som skiller den. Detaljene i kartleggingen del 18–19; her står reglene.

**Fagkortet:** merke til venstre med fast bredde og høyde av bildet, tekst i
egen kolonne, stables under 520 px. **Ingen hake i oversikten** –
avkryssing skjer i fagvinduet der leksa står med hele teksten. Stempel på
skrå over merket: «Ingen lekser» rødt, «Ferdig» grønt. Grønt er gjort, som
haken; rødt er sletter. **En farge betyr én ting.**

**Fristen skrives fullt ut** («Mandag 7. september») på egen linje over
teksten; teksten har hele bredden. Ukedager på fag skrives fullt ut. Korte
former beholdes bare der sju står på rad (ukesvisningen) og i merkelapper.

**Hastefarger er tidsproporsjonale**, ikke dagbaserte: gul ved halve tida
igjen, rød ved 15 %, forfalt eller i dag. Samme stripe i kortet,
fagvinduet og Påminnelser i dag.

**Felt som lagres av seg selv** (notat, læringsmål): 600 ms etter siste
tastetrykk, ved blur, og ved lukking. Ingen lagreknapp – en knapp man må
huske er en knapp man glemmer. «lagret»/«ikke lagret» i overskriften.
Tekstfelt vokser med innholdet (`voksFelt`), både ved åpning og skriving.

**Fagfanen har sin egen uke:** fra fredag 18 peker den på uka som kommer.
Bare Fag – Dag og Uke følger døgnskiftet klokka 20. Uketallet står i
tittelen så det aldri er en overraskelse.

**Godkjenningspanelet:** gruppert per fag med undertekstene «Læringsmål»
og «Lekser», fagnavnet redigeres én gang i overskriften, ett rullefelt.
Frister utenfor planens uke merkes i rødt; antatte frister i oransje.
Ingenting lagres før «Legg inn».

**Mobil (< 700 px):** sida ruller, kortene gjør det ikke. Rulling inni
rulling er det ene som aldri fungerer på berøringsskjerm. Ukesvisningen
ruller sidelengs med hode og innhold i samme rullefelt. Dialoger fyller
skjermen. `touch-action:pan-y` på kort med sveip.

## Andrea dash

Samme snitt som Emma dash (`andrea.html`, bygget fra `emma.html`
11. september 2026). Alt i seksjonen over gjelder her også; det som skiller
står nedenfor.

**Barneskolen har andre regler enn ungdomsskolen.** `TRINN = 4`,
`GRUPPE = 'Skare'`, ti LK20-fag, og `LEKSEDAG = 4`: ukeleksene har ingen
egen dato, og fredag står «Innlevering lekser». `sisteFagdag()` returnerer
derfor fredag i planens uke, ikke siste dagen faget har time.

**Skolen leverer PDF, ikke .docx.** Egen proxy (`/api/sandnes`), egen knapp,
og PDF-en går rett til Neam som dokument i brukermeldingen – ikke gjennom
et verktøy. Skoleplanverktøyene fra Emma dash er tatt ut her.

**Timeplanen kan ha to fag i samme time** («Norsk/Matte»). Splittes på
skråstrek; dagen teller for begge.

**Snarveien til spillene er ett kort nederst i høyrekolonnen,** ikke
en fjerde knapp i hjørnet. Alle tre plassene i høyre firer er tatt, og
applista er felles for hele huset. Kortet viker sammen med
påminnelsesboksene når en avtale åpnes, og vises bare i Dag-visningen.

**Ett kort, ikke ett per spill.** Kortet åpner spillsida
(`andrea-spill.html`), og det er der hun velger. Et nytt spill legges til
på spillsida – dashen røres ikke. Besluttet 10. oktober 2026, da det tredje
spillet kom.

## Mattespillet

`andrea-matte.html`. Egen side, ikke en visning. Reglene som gjelder
utseende:

**Ingen Neam-firer.** På telefon ville håndtaket ligget oppå tastaturet, og
samtalen er en rask vei til svaret. Veien ut er merket oppe til venstre og
sveip tilbake.

**Roboten, batteriet og stjerna er bilder** (`bilder/spill/`, webp).
Røret, lampene og snakkeboblen er CSS: boblen må vokse med teksten, og
røret må kunne være ti eller femten lamper langt. **Tom stjerne er den
samme fila avfarget i CSS** – ett bilde, to tilstander, som ikke kan komme
i utakt.

**Svarrubrikken har fast bredde,** stor nok til tre sifre. En rubrikk som
vokser mens man skriver flytter stykket ved siden av; en rubrikk som er
liten til man fyller den ser ikke ut som et sted man skal skrive.

**Et galt svar er ikke rødt.** Rødt betyr slett i dette huset, og det skal
ikke kjennes som straff å regne feil. Det strøkne svaret står lite ved
siden av fasiten, i grått.

**Gult (`--lys #F2C14E`) betyr «det der gikk bra»** tre steder i spillet:
lampa som tennes, rubrikken ved riktig svar, og stjernene. Én farge, én
betydning – samme regel som ellers.

**Redaktørknapper vises bare for dem som skal ha dem,** og aldri som en
knapp som spør om hvem du er. Identiteten hentes i bakgrunnen; er du ikke
redaktør, finnes ikke knappen.

## Diktatspillet

*Bygget 12. september 2026. `andrea-diktat.html`.*

Neam leser ukas fem ord, Andrea skriver på et ark han selv genererer, tar
bilde, og han retter. Reglene som gjelder utover spillet:

**Ruter, ikke fri skrift.** Uten dem må modellen selv segmentere
barneskrift, og en feilsegmentert bokstav blir til en skrivefeil som ikke
finnes.

**Like mange ruter til alle ord.** Ruter etter ordlengde røper hvor langt
ordet er, og lengden er en del av det hun skal kunne.

**Hjelpelinjer.** Tre soner som i en skrivebok. En tom firkant sier
ingenting om hvor bokstaven skal sitte.

**Fasiten sendes aldri med bildet.** Se «Instrukser til modellen».

**Oppstilling, ikke posisjon for posisjon.** Redigeringsavstand med fire
trekk – lik, feil, for mye, mangler. Rute mot rute gjorde én innsatt bokstav
til åtte feil.

**`i`, `l` og `I` er samme tegn, og store bokstaver ignoreres.** Bildet
inneholder ikke informasjonen som trengs for å skille dem – alternativet er
ikke strengere retting, det er tilfeldig retting. Prisen er at «vil» og
«vii» ikke skilles; den er betalt med vitende og vilje. Skal skillet
tilbake, er det arket som må endres, ikke koden.

**Panelet er ikke på denne sida.** Samtalen ville vært en rask vei til
fasiten.

## Klokkespillet

*Bygget 10. oktober 2026. `andrea-klokke.html`.*

Samme ramme som mattespillet, og alt under «Mattespillet» gjelder her også
– ingen Neam-firer, galt svar er ikke rødt, gult betyr «det der gikk bra».
Det som kommer i tillegg:

**Viserklokka er tegnet i SVG.** Messing er rammen, viserne er blekk. Den
korte viseren er tydelig bredere enn den lange, så de ikke forveksles.

**Skiva er større når den skal stilles enn når den skal leses.** Da er den
selve kontrollen. Størrelsen har tak i høyden, så Svar-knappen alltid er
synlig.

**Knottene på viserne finnes bare når viserne kan dras.** Når hun bare
skal lese klokka, er det ingenting å ta i.

**En viserklokke vet ikke om det er dag eller natt.** Der viserklokka
leses, er både 3:15 og 15:15 riktig. Bare 24-timersoppgavene skiller.

**Klokka med ord følger skolen:** minuttene mellom kvart over og kvart på
regnes fra halv – «ti på halv fire», «ti over halv fire».

**Ikke bestemt:** tre utseendevalg ble tatt under byggingen og står til
godkjenning – digitalklokka som mild flate, gjennomskinnelige blå knotter,
og en blek grå viser der hun stilte feil. Se kartleggingen del 55.

## Spillsida

*Bygget 10. oktober 2026. `andrea-spill.html`.*

**Tre lenker, ingen skript.** Hele kortet er lenken. Kortene står stablet
på telefon og tre i bredden ellers, med samme bilder som kortene hadde på
dashen.

**Spillenes merke går til Andrea dash, ikke hit.** Sveip tilbake fra et
spill kommer hit.

---

## Sikkerhet

`sikkerhet.html`. Kameraet øverst, alltid synlig; huset under som merker.

**Fargen ER tilstanden.** Rødt betyr fare — åpen dør, røyk. Grønt betyr i
orden — låst, alt vel. Blått er hviletilstand: ulåst, men lukket. Oransje
er «vi vet ikke» — uten kontakt eller lavt batteri. Fire farger, fire
betydninger, like på tvers av enhetstyper.

**Verst først.** En røykvarsler i alarm er rød selv om batteriet også er
lavt. En åpen dør slår låst. Rekkefølgen i tilstandsberegningen er en
beslutning, ikke en tilfeldighet.

**Merkene bærer navnet sitt**, tegnet per enhet og tilstand
(`bilder/sikkerhet/`, 21 stk). Navnet kommer altså fra bildet, ikke fra
Homey. Det binder hvert merke til én enhet — kommer en femte røykvarsler,
trengs et nytt merke. Valgt likevel: med fire varslere er kostnaden liten,
og et merke med bånd er husets uttrykk.

**Høyden settes på merkene, ikke bredden.** De er tegnet med litt ulike
proporsjoner; med fast bredde ble raden ujevn.

**Linja under merket utelates når det ikke er noe å si.** Et tomt felt
eller en strek er verre enn ingen linje.

**Valgene bygges av enheten, ikke av en liste.** Dialogen leser `setable`
på kapabilitetene. Vi holder ingen oversikt over hva en lås kan; Homey vet
det, og en enhet som får flere muligheter får riktige knapper av seg selv.

**Å låse opp spør alltid.** Grensen ellers er at en feil som er lett å se
og lett å rette ikke trenger dialog. En ytterdør som står ulåst er ingen av
delene: man ser den ikke, og man retter den ikke før man er hjemme.

**Ett kamera fyller ikke bredden.** Taket på 460 px er ikke pynt: uten det
ble bildet 663 px høyt på iPad, og enhetene havnet under skjermkanten —
sida åpnet på noe man ikke kan handle på. Med taket legger flere kameraer
seg ved siden av hverandre av seg selv.

**En videostrøm er tilstand — se «Praktiske feller».**

## Rommene

Enhetene fra Homey, åpnet fra **Rommene** under Enheter. Bygget
11. oktober–1. november 2026, alt i `felles-hus.js` (`hsk`-prefiks) og
`felles-neam.css`. **Midlertidig form** til plantegningen kommer.

**Alle rommene på én flate, som kort.** Rommene tas fra Homeys soner
(Hjem > etasje > rom). Etasjefanene ble fjernet 1. november 2026:
rekkefølgen man velger selv erstatter dem. Uten eget oppsett står
hovedetasjen først.

**Kolonner etter plassen:** minst 300 px hver og høyst tre – én på
telefon, to på iPad på høykant, tre på tvers. Uten eget oppsett legges
rommene i den kolonnen som er kortest så langt, regnet med det som vises
vanligvis – ikke det som vises under «Rediger», ellers stokkes rommene
bare av å trykke på knappen. CSS-kolonner ble prøvd og forlatt: ett høyt
rom fikk resten til å passe i kolonne to, og den tredje sto tom.

**«Rediger» velger og flytter.** Knappen står i toppen av kortet (oker –
den endrer; «Ferdig» er blå). Da vises alle enhetene med avhuking, uten
knapper, og et trykk hvor som helst på raden huker av. Man tar tak i et
bånd (grep til høyre) og drar rommet; en stiplet plass viser hvor det
havner, de andre flytter seg, og det smekker på plass når man slipper.
Nær kanten av kortet rulles det. **Enhetene flyttes innad i rommet**
med grepet til høyre på raden – ikke mellom rom. Avhukingen er en egen
label og grepet står utenfor den, ellers huket et drag av enheten idet
man slapp. Rekkefølgen gjelder også utenfor «Rediger»; nye enheter havner
nederst i rommet. **Hele rom kan skjules** med avhukingen først i
båndet (2. november 2026): et rom uten hake dempes under «Rediger» og
står ikke utenfor – unntatt når en varsler i det ikke er i orden, av
samme grunn som for enhetene. Kolonnene fordeles med de skjulte rommene
med, så de står likt under «Rediger» og utenfor. **Oppsettet lagres per skjerm**
(`neam-rommene:v1` i nettleseren, Magnes valg) og per antall kolonner, så
iPaden på tvers og på høykant kan ha hvert sitt.

**Rommet er et hvitt kort med mørk kant og mørkt tittelbånd** (`--ink`),
på en mild flate (`--boks-mild` på hele kortet). Romnavnet er en
korttittel – versaler, spatiert – men hvit på båndet. Valgt av Magne
1. november 2026 av tre varianter: kraftig kant, mørkt bånd, kant med
lyst bånd. Båndet står alltid, også når enhetene ligger rett i etasjen
og navnet gjentar fanen – uten bånd så rommet uferdig ut.

**Varslere i orden står ikke som rader** – med mindre man huker dem på
under «Rediger». Røyk-, varme- og vannvarslerne er et skjold i båndet så
lenge alt er vel. Er noe galt, blir båndet og kanten gule eller røde,
skjoldet blir et varseltegn, og varsleren det gjelder står som rad –
**også om den er huket av**: en skjult alarm er verre enn en rad for
mye. **Nivåene er sikkerhetssidas:**
rødt (`--danger`) er utløst, eller røykvarsler som melder feil; gult
(`--handling-endre`, okeren som er «gul» i fristene på dashene) er uten
kontakt eller lavt batteri – `alarm_battery`, eller 20 % og under. Verst
først for hele rommet. De to stedene skal aldri si forskjellige ting –
endres grensene, endres `tilstand()` i `sikkerhet.html` og
`hskVarselNivaa()` sammen.

**Ett symbol per type** (`HSK_ART`), strektegninger som ikonene i
fireren. I rommet står det man styrer først, det man bare ser til sist.

**På og av er en skyvebryter** til høyre på navnelinja, som på iPhone
(Magnes valg 1. november 2026), 50 × 30 px. Blå (`--aksent`, «valgt»)
når den står på, grå når den er av – grønt er «skaper noe» i huset og
passer ikke. Bryteren sier alt om på og av, så «På»/«Av» står ikke i
tilstandslinja under. **De andre knappene er blå** – de verken skaper,
endrer eller sletter, samme som Neamow. På fargelampene står **fargen lampa har nå** som en
prikk til høyre for glideren – den viser, den er ingen knapp. Under
bryteren tok den en hel linje på telefonen. Under glideren står
**«Naturlig hvitt»** (`HSK_HVITT`, `light_temperature` 0,8) og
**«Fargevalg»**, som åpner fargehjulet (fargetone rundt, hvitt i midten),
side om side: de deler linja likt og krymper (`--t-meta`) heller enn å
legge seg under hverandre. Begge tenner lampa om den var av. **Glider,
knapper og hjul går under hele raden, også under bryteren** – i
navnefeltet alene ble det for trangt (1. november 2026).

**Viftestyrken** (varmepumpen i stua, `fan_speed` 0–5) er «Vifte 3» på
egen linje, og under den **− Auto +**, blå som temperaturknappene. Auto
setter 0 – automatisk vifte – og er markert med samme ring som
«Fargevalg» når hjulet er oppe; − og + går mellom 1 og 5, og − er
dempet mens Auto står på. Tallet står over knappene fordi + ble skjøvet
ut på telefon på én linje. Valgt av Magne 2. november 2026.

**Lamper som ikke melder hvitmodus** (`light_mode`, f.eks. taklysene hos
Andrea): skjermen husker om noen sist trykket «Naturlig hvitt» eller valgte
en farge, lagret med resten av oppsettet for Rommene, og prikken viser det.
Lamper som melder modus selv, følger Homeys svar. Det er et minne, ikke
noe lest fra lampa – endres fargen fra en annen skjerm eller app, vet ikke
denne skjermen det før noen trykker her.

**Hvitevarene viser tid igjen** på egen linje under navnet, i brødtekst og
fet – «1 t 33 min igjen» – og ellers ingenting (Magne: «tid til slutt er
det jeg ønsker», 1. november 2026). Der maskinen melder fremdrift
(Bosch), står prosenten til høyre og en **fremdriftslinje** under, blå
(`--aksent`) på kantfargen som glideren. Oppvaskmaskinen melder ikke hvor
langt den er kommet, så der er det ingen linje – heller ingen linje enn en
gjetning. Oppvaskmaskinen melder minutter (`measure_timeToEnd`),
og tiden vises når den er over null: tilstanden sa «Idle» mens maskinen
gikk, så den brukes ikke. Vaskemaskinen og tørketrommelen (Bosch,
`bshc_string.*`) melder «MM:SS» og fremdrift i prosent, og tiden vises bare
mellom 0 og 100 % – ved 0 er programmet bare valgt, ved 100 er det ferdig
(`hskMinIgjen()`).

**Unntak fra «Fem betydninger»:** de to fargeknappene er ikke blå. De
viser hva de gjør – «Naturlig hvitt» i den varmhvite fargen lyset får
(samme som `HSK_HVITT_CSS`, endres sammen), «Fargevalg» som en lys
regnbue – begge med mørk tekst, fordi hvit forsvinner på gult og mørk på
sterk blå. Valgt av Magne 1. november 2026, vel vitende om at det avviker
fra malen.

**Rediger og Lukk står øverst og blir stående** når man ruller (7. november
2026: «Exit og redigerknappen kan flyte med på toppen»), på kortets milde
flate ut til kantene. Lukk er nøytral og bare der – ikke også nederst.

**Grupper innad i rommet** (7. november 2026). Under «Rediger» dras en
enhet oppå en annen i samme rom – raden den holdes over, lyses opp i
«valgt»-blått (`--aksent-lys` med `--aksent`-kant), og sluppet der blir de
en gruppe. Gruppa er da en mild ramme (`--boks-mild`, `--boks-kant`) med
navnefeltet øverst og **Løs opp** (nøytral) til høyre; en enhet dras ut ved
å slippe den utenfor rammen. Til vanlig er gruppa **én rad**: navnet, eller
enhetsnavnene når den ikke har noe, «1 av 2 på», og én skyvebryter – er
noen på, slås alle av, ellers alle på. «N enheter» (nøytral) viser hver
enkelt innrykket under, med en kantlinje til venstre. Bare enheter med
av/på kan grupperes – det er bryteren som er felles. Ikke på tvers av rom
ennå (Magne: «Vi venter med på tvers av rom»).

**Fjernkontrollen til TV-ene** (7. november 2026). «Fjernkontroll» står
under TV-raden, en blå knapp over hele bredden som åpner fjernkontrollen
under, med samme ring som «Fargevalg» når den er oppe. Bare én TV har den
oppe om gangen. Hver TV er **én rad**: bryteren og av/på-knappen går til
TV-ens SmartThings-enhet, som vet om den er på, og tastene til
Samsung SmartTV-enheten i samme rom, som ikke vises for seg.

**Unntak fra husets farger, valgt av Magne** («Lag den slik den er», etter
et bilde av TV-ens egen fjernkontroll): mørk kropp og mørke runde knapper,
rød av/på, fargeprikker på fargetasten, et rundt hjul med pilene i ringen
og OK i midten, vipper for volum og kanal, og tre appknapper med navnet som
tekst (Netflix, Prime, Rakuten) – ingen logoer. Fargene står i
`felles-neam.css` og ikke i paletten, fordi de bare gjelder denne. Ingen
mikrofon – den kan ikke styres utenfra. 123 og fargeprikken åpner
talltaster og fire fargetaster inne i fjernkontrollen.

**På telefon (under 700 px) fyller den skjermen** (Magne: «fylle store
deler av skjermen. Men må ha en tydelig exit»), på den milde flaten, med
TV-navnet og **Lukk** øverst – nøytral, som Lukk ellers. Den forstørres
etter plassen. Escape lukker bare fjernkontrollen, ikke Rommene. Trykkene
bekreftes ikke: bekreftelsesregelen gjelder det Neam gjør, ikke knapper man
trykker selv.

**Ytterdøra, kameraet og varslerne styres ikke herfra.** De vises med
tilstand; låsen styres fra sikkerhetssida og av Neam, der opplåsing
alltid spør.

## Neamow

Gressklipperen (Roborock RockMow Z115). Bygget 10.–11. oktober 2026; veien
inn og alt som er målt står i kartleggingen del 56.

**To flater, og de sier aldri forskjellige ting.** **Kortet** åpnes fra
Neamow under Enheter: kart, status og knappene for det man gjør oftest.
**`neamow.html`** har resten: valg av områder, klippehøyde, innstillinger,
tidsplaner og historikk. Begge tegner med det samme fra `felles-hus.js`
(`nmwKart`, `nmwTilstand`, `nmwKnapper`) – en ny tilstand rettes ett sted.

**Sida nås bare fra kortet** («Mer om Neamow», tekst uten flate – den tar
deg et sted). Ikke fra applista, som skal holdes kort (se fiskebeinets
tak).

**Kortet står på dialogens bakteppe og kort** (`felles-dialog.css`), med
egne `.nmw-*`-klasser for det som er eget. Korttittelen følger «Mønstre».

**Kartet:** gress-grønt (se unntaket under «Fem betydninger»), områdenavn i
midten, dekning per område bak navnet **bare under en tur** – etterpå er
tallene forrige turs og sier ingenting om nå. Klipperen er Magnes eget
symbol sett ovenfra, dreid etter retningen; messingskiva under er reserven
om bildet ikke laster.

**Med hagebilde under** (`NMW_HAGE`, et tilpasset skjermbilde av appens
realistiske kart): sonene får **hvit kant og hvite navn** med mørk kant, og
bare et svakt hvitt slør – som i Roborock-appen, så de to ser like ut.
Gress-grønt brukes bare når det ikke er noe bilde. Bildet skal ikke vise
noe vi også tegner selv: appens linjer, navn og lader tas ut av det.

**Knappene følger tilstanden.** Bare det som gir mening nå vises:
Start når den hviler, Pause og Send hjem når den klipper, Fortsett, Stopp
og Send hjem på pause, ingen knapper på vei hjem. En knapp som ikke virker
er verre enn ingen knapp. Alle er blå – de verken skaper, endrer eller
sletter.

**Innstillinger og tidsplaner følger «Sletting ligger bak Endre».** Det
lagrede vises som tekst med én oker **Endre**; skjemaet åpnes i kortet med
**Lagre** (grønn), **Avbryt** (nøytral) og for planer **Slett** (rød, med
bekreftelse). **Ny plan** er grønn. Avbryt går rett ut – alt i skjemaene er
valg. **Skjemaene har bare nedtrekk, glidere og avkrysning**, aldri
tekstfelt, så tastaturet aldri kommer opp. Etter lagring vises det
klipperen faktisk lagret, ikke det som ble sendt.

**Navnene er appens.** «Standard» og «Effektiv», «Full» og «Kanter»,
«Klipp like etter regn». Et navn appen ikke har (MANICURE) vises som det
er – aldri et ord vi fant på.

**Hentetakten følger det som skjer:** hvert 3. sekund mens den klipper
eller kjører hjem, hvert 10. på pause, hvert 30. når den hviler, og
ingenting når fanen er skjult. Kartet hentes bare når kartfila er endret.
Hver henting er en innlogging hos Roborock og et kall i Cloudflare – en
skjerm som står oppe hele dagen skal ikke koste mer enn det den viser.
**2 sekunder var for ofte**: Roborock sa nei (kode 5) etter én dag.
Flere skjermer deler én henting gjennom et mellomlager på serveren.

**Når Roborock sier nei, prøver vi ikke igjen med en gang.** Serveren
venter 15 minutter av seg selv, og kortet viser hva som skjedde og en
knapp for å logge inn på nytt – ikke bare en feilmelding. En feil man
ikke kan gjøre noe med, er en feil man slutter å lese.

## Kalender

**Fireren tok over hjørnet** (12. oktober 2026). `ved` = Ny avtale
(grønn, med `avtale`-merket som på dashene), `skraa` = Oppdater – navnet
bærer når kalenderen sist ble hentet – og `opp` = Kalendere, **bare for
sys**; plassen skjules for de andre. **Andre trykk på håndtaket går til i
dag** – veien hjem, som på Andrea dash og oppskriftssida.

De fire runde knappene (`.bottom-bar .fab`) er **skjult, ikke fjernet**:
kalendervelgeren bor fortsatt i bunnlinja, og skriptet leser `refreshBtn`
og `idagTall`.

**Tommelknappene står 8 px fra kanten, og bunnen holdes fri for dem.**
`body{--f-marg-y:8px}`, og `.shell` har `--f-marg-y` + det høyeste av
håndtaket og raden med visningsvalg (`--kv-hoyde`) + `8px` nederst, så
innholdet slutter over begge i stedet for under dem.
Gjelder bare denne sida – et unntak fra fellesverdiene i
`felles-neam.css` – fordi rutenettet fyller hele høyden og ellers ligger
under begge hjørnene. Settes på `body`, ikke `:root`, så den vinner over
medieregelene uansett rekkefølge. Gjelder også liggende telefon, der
kalenderen blir rundt 60 px lavere enn da hjørnene bare ble dekket.

**Merket står foran månedsnavnet, ikke i egen rad.** `.mnav-hode` i
første felt av `.mnav-topp`, med «Kalender» og «Neam · navn». Det var
raden over som betalte for den frie bunnen; den (`#topp`) vises nå bare på
innloggingsskjermen. **Tittelen brytes aldri inni seg selv:** får en lang
tittel – dag og uke – ikke plass ved siden av merket, legger den seg hel
under det, på alle bredder. I fullskjerm og på liggende telefon er merket
skjult, som topplinja var.

**Visningsvalget og initialene står nederst, mellom tommelknappene**
(`.kal-valg`, fast i bunnen). Toppen har bare merket og tittelen. Det er
der tommelen er, og plassen var alt holdt fri for håndtakene.
- **PC, liggende nettbrett og liggende telefon:** én rad mellom
  håndtakene. På en liggende telefon (844 px) får ti initialer plass.
- **Telefon og stående nettbrett (til 900 px):** to rader – initialene i
  full bredde over håndtakene (26 px), visningsvalget mellom dem, på linje
  med håndtakene. Mellom håndtakene på en 375 px telefon er det 227 px;
  visningsvalget er strammet inn til ca. 205.

Raden ligger under dempelaget, så den tones ned når en firer åpnes.
`renderHurtigKal()` regner kolonnene ut fra plassen raden faktisk har, og
setter `--kv-hoyde`. Blir det flere kalendere enn én rad rommer, brytes
initialene på en ny linje, og bunnen følger med.

**Avtalene i Liste er tonet oppå papir.** Toningen er den samme som i uke
og dag (`dus(farge, .18)`), men lista har ingen papirflate under seg, og
alene slapp den sidebakgrunnen gjennom. Flaten er derfor
`background-color: var(--paper)` med toningen som `background-image`.

## Oppskriftssida

**Fireren tok over hjørnene.** `ved` = Ny oppskrift (det som skaper),
`skraa` = Ukemeny, `opp` = Sortering. Andre trykk på håndtaket legger sida
i utgangsstand: søk og filtre nullstilt, ut av kalendermodus,
standardsortering, ut av en åpen oppskrift.

De gamle knappene i venstrespalten er **skjult, ikke fjernet** — fireren
leser sorteringsnavnene fra dem, så det finnes én liste og ikke to.

**Venstrespalten har det man SER MED**, fireren det man GJØR: søk, filtre
og ukevelgeren står igjen i spalten. Ukevelgeren er en innstilling — hvilken
uke man legger retter i — og hører ikke under tommelen sammen med
handlingene.

**Avkryssingene viser faktisk tilstand.** Alle kategorier starter avkrysset
unntatt Sauser, Krydderblandinger og Tilbehør. Det betyr at en tom liste
betyr «ingenting», ikke «alt» — motsatt av hvordan filteret virket før. Til
gjengjeld er boksene til å forstå: før sto alle tomme mens alt likevel
vistes, og da forklarte ingenting hva en avkryssing betydde.

**Hake, ikke fylt boks.** En fylt flate sier «her er det noe»; en hake sier
«denne er valgt». Når de fleste står på fra start, er det det siste som er
poenget.

**«Velg alle» og «Velg ingen»** står under, dempet. «Velg ingen» gir en tom
liste med vilje: da ser man at det er filteret som skjuler alt, i stedet
for å lure på hvor oppskriftene ble av — og veien tilbake står ved siden av.

**Porsjoner spørres ALLTID**, med fire som utgangspunkt. Et valg som noen
ganger kommer og noen ganger ikke, er verre enn ett trykk ekstra.

**Krydderblandinger er byggeklosser.** Navnet blir en lenke i andre
oppskrifters ingredienslister — understreket og i aksentfarge, ikke en
knapp: den utfører ingenting, den viser noe.

### En oppskrift: fanene og matlagingen

*Fra 8. november 2026 (Magne).*

**Fanene er Ingredienser og Steg (telefon) eller Oppskrift (landskap),
Tips, Handleliste og Vurdering.** Tips og Kokken er én fane: tipsene
først, kokkens kommentarer under. Handleliste viser ingrediensene for
porsjonene som er valgt, og der ligger knappen til handlelista.

**Under fanene står porsjonene, «Finn ingredienser» og «Start
matlaging».** Finn ingredienser gir lista gruppert som i handlelista –
det er også det man ser før noe er trykket.

**Start matlaging spør om antallet porsjoner og låser det.** Så står
ingrediensene i oppskriftens rekkefølge, og matlagingsikonet står til
venstre for klokka i topplinja, på alle sidene – **større enn timerne**
(78 px, 54 px når toppen er kompakt), med en ring i `--aksent` som går
rundt så man ser at den er i gang, og tiden under. Trykk leder tilbake til
retten. Ringen står stille ved redusert bevegelse.
Mens retten lages, bytter Finn-knappen mellom de to rekkefølgene.

**Ord i stegene kan trykkes:** et ingrediensnavn lyser opp raden sin i
lista (aksentkant og mild flate, som en valgt rad ellers); en koketid,
merket med timeglass, åpner nedtellingen i klokka ferdig utfylt – man
velger hvem og lagrer selv. Begge er prikkunderstreket: de viser noe eller
foreslår noe, de utfører ingenting alene.
- **Ingrediensen kjennes igjen** i bøyd form («tomatene»), i sammensatte
  ord («risen» – Basmatiris) og via fellesord: «kjøtt», «fisk»,
  «grønnsaker» og «krydder» treffer alle ingrediensene av den varetypen
  («ta ut kjøttet» – Mørbrad). Ett ord kan lyse opp flere rader.
  Småord og kjøkkenord («pannen», «vannet») treffer ingenting.
- **Den valgte raden legges midt i kolonnen**, uten myk rulling – den ble
  stående i kolonnen som ruller selv. Første og siste rad kan ikke komme
  helt til midten.
- **Nedtellingen får navnet fra steget:** leddet tiden står i, uten tiden
  og småordene foran – «Kok basmatirisen i 10 minutter» blir «Kok
  basmatirisen».
- **Nedtellingene fra retten står under knappene** med tiden og **Slett**
  (rød). Det er de samme som ved klokka; Avslutt matlaging sletter dem.

**Neam husker hvor man var** mens retten lages, og sida åpner seg der
igjen.

**Avslutt matlaging spør før den lukkes:** Vurder retten, Skriv et tips og
Kokkens kommentar (grønne – de legger til), Bare avslutt (blå) og Avbryt
(nøytral).

## Økonomi

Den skjulte `okonomi.html` (sys@, Magne og Nina). Arkitekturen står i
kartleggingen, del 57; her står det som angår oppbygning og utseende.

**Fem faner, hver ting ett sted** (skissen «Neam Økonomi – ny struktur»,
godkjent 6. november 2026; Innboks ble Transaksjoner samme kveld). Fra
8. november 2026 (skissen «Regnskap, Budsjett, Resultat»): Status,
Resultat, Regnskap, Budsjett og Transaksjoner. **Oppsett og Oppdater ligger
på høyre tommelknapp** – Oppdater på skrå, Oppsett ved siden av, gult når
en kilde ikke er oppdatert. **Regnskap, Budsjett og Resultat har samme
plassering:** én periodevelger over alle tre (‹ måned ›, Måned / Hittil i
år / Siste 12 mnd), så sumboksene, et kort med diagrammet og «På tvers»
som sammenleggbare linjer, og postene gruppe for gruppe – Inntekter
først, Sparing sist. Bare tallene skiller dem:

- **Status** – bare oversikt: fire tallbokser, måneden som én stolpe med de
  tre postene med minst igjen, nøkkeltallene, netto formue og
  familiemålet. **Differanse, ikke «foran skjema»** (fra 8. november 2026):
  budsjett minus brukt for måneden, overforbruk som røde minustall og
  under eller lik bruk som grønne tall (`.ok-avvik.over`/`.under`). På
  telefon står Differanse i stedet for Budsjett. **Måneden vises også uten fullt budsjett** (fra 6. november
  2026): uten budsjett «… brukt så langt» og «Mest brukt», uten stolpe; med
  delvis budsjett stolpen som før. Det som mangler, står i **mangel-boksen**
  (`.ok-mangler`): mild flate, kant og venstrestrek i `--handling-endre` –
  gul fordi det trenger noe, ikke rød som en feil – med «Fyll inn ›» til
  høyre. Poster med forbruk uten budsjett står der, ikke i tabellen. **Stolpen har ingen strek** for det som var ventet i dag (fra
  7. november: «det har vi oversikt over selv») – den viser bare brukt av
  budsjettet; dato og dager igjen står i teksten. **Det som forfaller** i
  måneden er med (fra 7. november 2026): «3 000 kr brukt av 11 000 kr
  (herav forfaller 1 800 kr)», en lysere del i stolpen som i Regnskap
  (opasitet .38), og «herav … forfaller» under «Brukt i …» i
  tallboksene.
- **Transaksjoner** (fra 6. november 2026, het Innboks) – to underfaner:
  - **Innboks** – det som venter på deg, i sammenleggbare linjer: Trenger
    et valg, Klare til godkjenning, Ført automatisk, Fakturaer som venter og
    Neam trenger. Én linje per post også på PC (fra 8. november 2026;
    før sto den valgte posten til høyre). Tallet for det
    som venter står både på fanen og på underfanen. Øverst «Legg til
    kvittering» (`.btn-ny`) og «Lim inn» (`.btn-blaa`, 7. november 2026):
    bilde, PDF eller tekst fra utklippstavla – eller Ctrl+V på sida, når
    markøren ikke står i et felt.
  - **Alle** – kontoutskriften fra nullpunktet. Øverst ‹ måned ›, så et
    kort med søk, konto, kategori, type og fra–til, så en meta-linje med
    antall og inn/ut, og radene som kjøpene i Regnskap (dato, navn med
    kategori og kilde under, beløp, ›). **Uten filter** vises én måned;
    **med søk, filter eller periode** vises alt som treffer, med måneden
    som overskrift (`.ok-etikett`), og ‹ måned › byttes mot «Søk og
    filter» og Nullstill. En rad åpnes på stedet med detaljene og
    handlingene (varene, PDF-en, «Send tilbake til innboksen»). Strøket
    vises med lav opasitet og streket navn, som i innboksen. Vedlegget
    står i meta-linja på raden («PDF vedlagt», «bilde vedlagt»,
    «varelinjer») – en lenke inni radknappen ville vært en knapp i en knapp.
  Valgt ut uten skisse (Magne: «bare kjør det ut på neam»).
- **Regnskap** (fra 8. november 2026) – det som er brukt, uten budsjett,
  med det som forfaller: sumboksene som under, diagrammet uten
  budsjettstrek og uten rødt, «På tvers» med bare brukt. **Merkene** er de
  samme som i Budsjett: postene viser merket under navnet, og «På tvers»
  har samme liste i Regnskap, Budsjett og Resultat – merkene med budsjett
  eller regnskap i perioden, «–» der tallet mangler (fra 8. november 2026).
  Et merke satt på en enkelt føring teller under det merket. **Samme liste som
  Budsjett:** grupper som åpnes, postene under; trykk en post for linjene
  og **føringene** (dato, sted, kilde, beløp – innrykket med en strek til
  venstre, `.ok-rg-inn`). **Trykk en føring:** et stort vindu
  (`.dlg-kort.ok-fr-stor`, 960 px) med to spalter fra 820 px (`.ok-fr-to`):
  alt om føringen som en liste (`.ok-fr-info`, navn til venstre i
  `--ink-soft`) og varelinjene fra kvitteringen til venstre, vedleggene til
  høyre – bilder i full bredde (`.ok-fr-stort-bilde`), PDF som kort – og
  valgene under: **Rediger** (`.btn-endre`), «Stryk – føres ikke» og «Send
  tilbake til innboksen» (`.btn-ghost`). Under hverandre på telefon. I
  menyen på en post eller linje i Regnskap står **«Før inn ny utgift …»**
  (i Budsjett «Ny linje under …»); skjemaet åpnes i samme vindu.
  Rediger viser feltene: navn, sum, kategori i tre nedtrekk side om side
  (gruppe › post › linje; under hverandre på telefon), merke, notat og
  vedleggene med «Fjern» og «+ Legg til vedlegg»; Lagre (`.btn-ny`) og
  Avbryt. **En endret sum** får et utropstegn (`.ok-fr-utrop`: rund, hvit
  «!» på `--handling-endre`) overalt der føringen vises, og i vinduet en
  gul boks (`.ok-mangler`) med bankens sum. **Høyreklikk** (hold fingeren på telefon) på
  en føring eller kategori åpner menyen (`.ok-meny`). **Én spalte, som
  Budsjett** – også Resultat, der kjøpene bak en post åpnes i en dialog
  («Vis kjøpene ›», `#ok-kb-bak`).
- **Resultat** (het Regnskap til 8. november 2026) – budsjett mot faktisk.
  **Fra 8. november 2026 (skissen «Resultat – måneder og kategorier»):**
  sumboksene viser differansen (Status' regel: røde minustall over, grønt
  ellers); så én sammenleggbar linje, «Utgifter mot budsjett», med **ett
  stolpediagram** (`.ok-dr`): først utgiftene per måned, jan–des (blå, rød
  over budsjettet, forfaller lysere, budsjettet som mørk strek – bare for
  måneder som er startet i Budsjett), og **standardbudsjettet** som en
  beige søyle med kant helt til høyre («Std»). Trykk en måned:
  utgiftsgruppene med **tre stolper** side om side – **regnskap** (`--aksent`,
  `--danger` over budsjettet), **budsjett** (`--boks-kant` med 1 px
  `--ink-soft`-kant) og **snitt** (`--paper` med 1,5 px stiplet
  `--ink-soft`-kant; stiplet betyr snitt som ellers på sida). Tallene i en
  tabell under (`.ok-dr-rad`), differansen i rødt eller grønt under navnet.
  Trykk en gruppe for postene, en post for linjene; «‹ …» øverst går ett
  nivå tilbake. Under: «På tvers» og «Hvor det glir». **Så samme liste som
  Regnskap og Budsjett** («Budsjett mot regnskap», fra 8. november 2026),
  med summene i tre kolonner – budsjett (`--ink-soft`), regnskap (fet),
  avvik (rødt/grønt) – og overskriftene over i `--t-etikett`; trykk og
  høyreklikk som i Regnskap. Med **periode**: én måned (med
  ‹ måned ›), hittil i år, eller siste 12 måneder. Budsjettet er da summen av
  månedsbudsjettene. Trenden og «Hvor det glir» står som linjer øverst, og
  kjøpene bak en post i dialogen (til 8. november 2026 i spalten til
  høyre). Erstatter Måned, År og budsjett
  mot regnskap. Linja «På tvers – forsikring, lån …» viser hovedmerkene
  med undermerkene rykket inn under (se Budsjett), med brukt, budsjett og
  avvik for perioden.
  **Det som forfaller** (fakturaer som venter, 7. november 2026) står i
  stolpen som en lysere del etter det betalte (`.ok-bar-fyll.forfaller`,
  samme farge med opasitet .38, rød når summen går over budsjettet).
  **De store tallene tar det med** (fra 7. november 2026): «Faktisk 6 000 kr
  (herav forfaller 1 800 kr)», og summen på posten og i spalten til høyre.
  I Regnskap viser sumboksene Utgifter og Sparing med det som forfaller,
  «herav … forfaller» under, og Overskudd med «betalt så langt …» under, i
  `--t-meta`. I Resultat viser de differansen – røde minustall over, grønt
  ellers, «23 300 av 23 500 kr» under – og inntekter og sparing over
  budsjettet er ikke røde. I diagrammet «Utgifter per måned» ligger det oppå det
  betalte med samme opasitet. På posten står «Forfaller … (20. nov.) –
  telles når trekket kommer fra banken». En måned fram i tid heter «Fram i
  tid». Under
  kjøpene bak posten står regningen først, som en vanlig rad med
  «Forfaller – ikke betalt ennå» i meta-linja og «Åpne PDF-en ›».
- **Budsjett** – lista for perioden (fra 8. november 2026), med budsjett
  per måned gjennom året som diagram – bare startede måneder, og
  standardbudsjettet helt til høyre. **Ingen knapper for å endre** (fra
  8. november 2026, Magne: «ønsker man å endre trykker man andre
  museknapp på kategorien eller linjen man ønsker endring på. ingen andre
  knapper for dette»): **høyreklikk** – eller hold fingeren på telefon – på
  en gruppe, post eller linje åpner menyen (`.ok-meny`), og alt lagres med
  en gang: beløp i måneden og i standarden, navn, merke, måneder, ny
  linje/post, slett, og Start budsjett / Kopier standardbudsjettet hit
  (spør med `bekreft()` når måneden alt har tall). Poster med linjer
  åpnes med › som gruppene; poster uten budsjett vises fra menyen på
  gruppen. En linje under overskriften sier at man høyreklikker.
  «Standardbudsjett ›» viser standarden med «‹ Tilbake til budsjettet».
  Skjemaene er som før:
  standardbudsjettet eller ett månedsbudsjett om gangen. Fra 6. november 2026 (Magne: «er veldig
  generisk nå»):
  - **Hver gruppe i sitt eget kort** (`.ok-bu-gruppe`, papir, skygge,
    radius 14 px) – Inntekter og Sparing øverst, utgiftsgruppene under, to i
    bredden og tre fra 1280 px. Ingen ramme rundt hele budsjettet.
  - **Under gruppenavnet en tynn stolpe** (4 px, `--aksent` som stolpene i
    Regnskap) med «25 % av inntekten». På Sparing blir det sparegraden.
  - **Null er en dempet strek** (–), så tallene som teller, synes.
  - **I redigering er navnet et felt** uten synlig ramme til man holder
    over eller skriver; nytt navn lagres med en gang.
  - **Plusset er grønt og står til venstre for navnet** (`.ok-pluss`):
    20 px rund, `--handling-ny` på 14 % som flate og fullt grønn ved
    hover – grønt fordi det legger til, som `.btn-ny`. Rader uten pluss
    holder av plassen, så navnene står rett under hverandre.
  - «Uten linje» vises bare når en post med linjer har et eget beløp.
  - **Gruppenavnene og summene deres står i `--t-stor`, fet** – Inntekter
    og Sparing som de andre, ikke som en liten etikett. Postene står i
    `--t-brod`, så forskjellen synes (Magne: «Kategorinavnene må skille seg
    mer ut»). «Utgifter» over gruppekortene er fortsatt en etikett.
  - **Merker på tvers** (Magne: «vi har forsikringer på tvers av
    budsjettkategoriene»). En post eller linje kan ha ett merke. En linje
    uten eget merke arver postens. **Merker og undermerker** (7. november
    2026): to ledd, f.eks. Lån › Studielån, Abonnement › Telefon; hoved-
    merket samler undermerkene i alle summer. Standardlista er Forsikring,
    Lån (med lånetypene fra Gjeld under), Abonnement, Strøm og energi og
    Annen fast utgift; egne merker og undermerker lages fra posten («+ Nytt
    merke …» nederst i valget, med navn og «Eget hovedmerke» eller «Under
    …») eller i Oppsett › Budsjett › «Merker på tvers», der de også får
    nytt navn, flyttes og slettes. Et hovedmerke med undermerker kan ikke
    slettes eller flyttes før de er flyttet. Slettes et merke som er i bruk,
    spør raden først («trykk × igjen»), ikke en dialog. («Fast» og delingen
    i fast og variabelt var med en kveld og er tatt ut: «Er dette nødvendig
    da?».) I valget står undermerkene som «Lån › Studielån». I visning en
    **merkelapp** etter navnet (`.ok-bu-merkelapp`: pille, `--boks-mild`
    med `--boks-kant`, `--t-etikett`); i redigering en liten nedtrekksliste
    i samme form, med fylt flate når et merke er satt. Øverst i budsjettet
    «På tvers» med én pille per hovedmerke og summen (`.stor`: papir og
    skygge; undermerkene i tittelen), og «Merkene ›» til Oppsett.
  - **Transaksjoner › Alle** viser merket i meta-linja og har merket som
    filter; et hovedmerke tar med undermerkene.
  - **Månedene en post kommer i** (7. november 2026: «kommunale utgifter er
    hver tredje måned»). I redigering av standarden en liten pille,
    «Månedlig» (`.ok-bu-periode`, som merkevalget; fylt når måneder er
    valgt, og da står de: «jan · apr · jul · okt»). Trykk gir en rad med
    knappene 01–12 under posten (`.ok-bu-mnd`, valgt som en valgt
    `.ok-fane`) og «Månedlig». Første trykk fra Månedlig velger bare den
    måneden. I visning står månedene etter navnet i `--t-etikett`. Beløpet
    er det som kommer hver gang; summene i standarden er snitt per måned,
    og teksten over sier det.
  - **I redigering står merket og månedene på egen linje under navnet**
    (`.ok-bu-valg`), så navnet aldri kuttes – på PC som på telefon.
  - **Beløpene har kroner og øre**: «549,90» er 549,90; punktum foran komma
    er tusenskille. Øre vises bare når de finnes.
  - **Regnestykker i tallfeltene** (7. november 2026), i alle feltene med
    desimaltastatur på Økonomi – budsjettet og formuen: «1500+2342+112»,
    «3200 x 4 : 12», parenteser. Svaret settes i feltet når det forlates
    eller med Enter; regnestykket står i feltets tittel. Kan det ikke
    regnes ut, får feltet rød kant (`--danger`).
  - **Menyen på en post** (`.ok-meny`): høyreklikk, eller hold fingeren
    på telefon. Papir, `--line`-kant, skygge, radius 12; tre deler under
    små overskrifter – «Endre» (snarveier som åpner redigeringen), «Regn»
    (endrer utkastet, lagres med Lagre) og «Kopier – lagres med en gang»
    (grået ut mens noe redigeres). Valg som sletter, er røde og må trykkes
    to ganger. Nederst: «Shift + høyreklikk: vanlig meny». Lukkes med
    Escape, klikk utenfor eller rulling.
- **Oppsett** (åpnes fra høyre tommelknapp fra 8. november 2026) – alt som sammenleggbare linjer: én linje per kilde (med
  statusprikk, og kildens kort inni), kontoene per rolle, formuen (verdier,
  gjeld, bruttoinntekt, buffer, familiemål), **Regningskontoen** (7. november
  2026: kontoen i et nedtrekk, «anbefalt buffer» som `.ok-stort`, og
  månedene som rader – hvor langt ned saldoen gikk før påfyllet) og «Neam
  husker».

**Regler:**

- **Samme tall vises ett sted.** En visning hører ikke hjemme i Oppsett, og
  en innstilling hører ikke hjemme i innboksen.
- **Sumboksene er de samme overalt:** Inntekter · Utgifter · Sparing ·
  Overskudd, i den rekkefølgen og med de ordene.
- **Periodevalg, budsjettvalg og underfanene** ser ut som fanene
  (`.ok-fane` med `aria-pressed`), men er knapper i en gruppe, ikke faner.
- **Toppfanene må få plass på 375 px.** Med «Transaksjoner» er de tettere
  på telefon (3 px sidepolstring, litt tettere bokstaver). Et lengre
  fanenavn må måles der før det tas i bruk.
- **Toppen står fast** når man ruller, og sida har plass nederst så det
  siste kan rulles fram over NEAM-knappen (se lærdommene i kartleggingen,
  del 57).

## Angre framfor å spørre

Huset spør før noe slettes, fordi en rad som forsvinner ikke etterlater
noe å legge merke til. Men **det motsatte gjelder når noe LEGGES TIL i
bulk**: en import av tjue varer kan ikke forhåndsgodkjennes på en måte som
er til å forstå, og feilen ser man først når man leser lista etterpå.

Da er svaret en **angre-stripe**, ikke en dialog foran. Den skal:

- **stå til man gjør noe med den** — ikke forsvinne etter noen sekunder.
  En feilslått import oppdages når man blar gjennom, ikke i øyeblikket.
- **fjerne bare det som faktisk kom inn**, målt på id-er. Ble en ny vare
  slått sammen med en som sto der fra før, blir den raden stående.
- **ha et kryss** for den som bare vil bli kvitt stripa.

## Datalaget – kø, vakt og speiling

Gjelder alt som gjør les–endre–skriv mot KV.

**Alle skrivinger går i kø** (`iKo`) i datalaget. Parallelle
les–endre–skriv taper data stille: den siste vinner. `felles-neam.js`
kjører verktøykall parallelt når de ikke er `neamSkriver`, og
`neamSkriver` er ikke kuren – den gir en dialog per kall. En skriving som
ryker sperrer ikke dem bak.

**Speiling tegner bare når noe er endret** (avtrykk) og **ignorerer
lesinger som er nøyaktig det som sto før vår siste skriving** i 90 s
(`erUtdatert`). KV cacher lesinger i 60 s; uten vakten rullet speilingen
vår egen skriving tilbake og neste skriving bygde på den gamle.

**Speiling hopper over når noe står åpent** (boble, skjema, fagvindu) og
tar igjen når det lukkes. En liste som stokker om seg mens man leser er
verre enn en som er noen sekunder gammel.

**KV har et 60-sekundersgulv på lesing.** Polling raskere enn det gir
ingenting og koster. Sanntid krever D1 (ingen lesecache) og/eller
WebSocket i skallet.

**Utledet, ikke kopiert.** Lekser vises i Påminnelser i dag på begge
dashene, men finnes bare i faget. To sannheter om samme sak blir uenige.

**Cache i localStorage bærer kontoen sin.** Kalender-ID-er hører til én
postkasse; et brukerbytte i samme nettleser ga én bruker en annens ID-er
og 404 på alt. Cachen leses før identiteten er kjent (for rask skjerm) og
kontrolleres når den er det.

## Bilder – ikoner og bestilling

**Bildekatalogen er stedet å begynne.** `dokumenter/bildekatalog.html`
viser alle bildene – fil, mål, stil, status og hvilke sider som bruker
dem – og lager bestillinger til AI: enten enkeltbilder med fast
stilblokk, eller et **oppdrag med utvalg**, der de valgte bildene tegnes på
et nummerert referanseark og teksten ber om en prøverunde med tre
retninger, en justering av gruppa eller nye ikoner i samme stil.
**Etter hver endring i bildene kjøres `python
dokumenter/lag-bildekatalog.py`**, ellers lyver katalogen. Stilblokkene
og motivbeskrivelsene står øverst i den fila; utseendet i
`dokumenter/bildekatalog-mal.html`. Bildene som kommer tilbake, klippes og
legges på filnavnet nummereringen sier.

**Store utvalg og strektegningene** (6. november 2026). «Velg alt» velger
det som vises – søk og filter gjelder. Over 40 bilder deles
referansearket i flere ark med fortløpende nummer, og hvert ark får sin
egen nedlastingsknapp: nettleseren slipper bare én nedlasting per trykk.
**Strektegningene i koden** (SVG) bestilles som strekikoner og kobles inn i
stedet. Motivet og det nye filnavnet står i `SVG_MOTIV` i
`lag-bildekatalog.py`, nøklet på hashen i `svg-xxxxxxxx`; endres en
tegning, får den ny hash og står som «uten beskrivelse» til den føres inn
igjen. Der et strekikon alt finnes, sier kortet at det bare må kobles inn.

**Alle bildeadresser har versjon.** `IKON_V` (ikonene i `bilder/ikoner/`),
`FAG_MERKE_V` (fagmerker), `NMW_SYMBOL_V` (klippersymbolet i
Neamow-kartet, i `felles-hus.js`). `MERKE_V` og `KNAPP_V` gjaldt de gamle
merkene og står igjen i koden som historikk. Byttes en fil under samme navn:
øk tallet. **Gjenbruk aldri et tall som kan ha vært forespurt mens fila
manglet** – Cloudflare cacher forsidens 200-svar mot adressen for alltid.
Knapper `?v=1` er brent slik.

**Mappenavn i små bokstaver.** Windows bryr seg ikke, Linux gjør det, og
Cloudflare kjører Linux. `Knapper` virket lokalt og feilet i produksjon.
Omdøping av bare store/små i Git på Windows krever to steg via et
mellomnavn.

**Nye filer må hukes av i GitHub Desktop.** En ny mappe med 22 filer er
den vanligste grunnen til at «alt er pushet» ikke er sant.

**Klipping av merker fra ark:** mål bakgrunnen før terskelen velges
(208–223 i mørkeste kanal på de arkene som er brukt – terskel 200);
komponentdeteksjon per rad; fyll hull per merke, ikke globalt. **Berører
eller overlapper merkene hverandre på arket, må arket genereres på nytt
med luft imellom** – det finnes ingen klipp som skiller to ringer som
skjærer hverandre. Ark 2 (elleve knapper) klippes rent; ark 1 (tretten)
gjør det ikke.

**Ikonene bærer ikke navnet sitt** – navnet står som tekst under (se
«Ikonene og navnet under»). Merkene gjorde det motsatte til 27. oktober
2026; fagmerkene og spillbildene er fortsatt i den gamle stilen.

**Fallback når et bilde ikke laster:** skjul ramma (fagmerker) eller vis
skive og tekst (bildeknapper i fireren). Aldri et brutt bildeikon – det ser ut som
en feil i innholdet, ikke i en fil.

## Bakgrunn og klapptavle

*Fra 27. oktober 2026.*

**Ingen bakgrunnsbilde.** Steampunk-bildet er fjernet; sidene står på den
rolige gradienten på `html` i `felles-rot.css`. Filene ligger igjen i
`bilder/`, og sikkerhetskopien av den gamle layouten er grenen
`backup/layout-steampunk-2026-10-27`.

**Klapptavla er lys.** Hvite kort, nedre halvdel et hakk mørkere, sifre i
mørk marineblå `#142036` – samme farge som navnene under ikonene. Den
vipper som før (`neamFlipKlokke()`), og bruker ingen bildefiler lenger.

## Praktiske feller

**Rekkefølge avgjør ved lik spesifisitet.** En media query må stå *etter*
reglene den skal overstyre. Dette har slått til fem ganger. Femte gang var
`.topbar-back` med `color:var(--ink)` etterfulgt av `.icon-btn` med
`color:var(--paper)` på samme knapp: pila var hvit på nesten hvit bakgrunn.
Den var der og virket, den var bare ikke til å se. To klasser på samme element
som begge setter samme egenskap er et varsel i seg selv. Legg blokker som
overstyrer mye **sist i arket**, og scope dem på en id, så både rekkefølge og
spesifisitet peker samme vei.

**`overflow-x` må være `clip`, ikke `hidden`.** `hidden` på `html`/`body`
gjør dokumentroten til en rullebeholder, og da slutter `position:sticky` å
virke lenger nede. Handleliste hadde **begge** – `clip` øverst i arket og
`hidden` i en senere regel som vant. Samme `.topbar`-regel som virket i
oppskrifter gjorde derfor ingenting der. Å sette regelen ett sted er ikke nok
når en annen regel lenger ned setter den om igjen.

**`esc()` må ta med apostrofen.** Kalender escapet `&<>"` men ikke `'`. Et
avtalenavn med apostrof bryter da ut av et attributt skrevet med enkle
hermetegn. Bruk også `String(s == null ? '' : s)`, ikke `String(s||'')` –
den siste gjør tallet 0 om til tom tekst.

**Et klassenavn er også et navn i et felles rom.** Svarrubrikken i
mattespillet brukte `.tom` for «ingenting skrevet ennå». `.tom` var
allerede klassen for tomme lister lenger nede i samme fil, og den setter
`font-size:var(--t-meta)`. **En klasseregel slår arv**, så rubrikken sto i
14 px i stedet for de arvede 84 – helt til det første tallet kom, og da
vokste den til full størrelse. Symptomet så ut som et breddeproblem, og en
fiks på bredden ville skjult årsaken uten å fjerne den.

Dette er samme felle som `UKEDAGER` og `mengdeTekst` i `felles-data.js`,
men i CSS: **i en fil som er stor nok, er alle de vanlige ordene alt
tatt.** Unngå `.tom`, `.ny`, `.liten`, `.aktiv` som tilstandsnavn på et
enkelt element – gi dem et prefiks, eller et ord som bare kan bety én ting.

Finn den med måling, ikke med lesing: `getComputedStyle` på elementet, og
et søk gjennom `document.styleSheets` etter regler som `element.matches()`.
Det tar ett forsøk.

**Et flex-barn har `min-width:auto`.** Et bilde i en knapp med
`display:flex` får derfor sin egen naturlige bredde som gulv. Chrome ser
gjennom fingrene med det; **Safari gjør det ikke** — et 512-pikslers merke
ble 512 piksler på iPhone, og med `overflow:visible` flommet det utover.
Sett `min-width:0` på bilder i flex-beholdere. Målt 12. september 2026, og
kan ikke reproduseres i Chromium.

**En sperre som gjelder per funksjon, tåler ikke at to av dem kaller
hverandre.** Oppskriftssida pakker alle lagrende handlinger i ett felles
`appBusy`-flagg. Da én av dem begynte å kalle en annen derfra, satte den
ytre flagget og den indre returnerte **stille** — ingen feil, ingen
melding, knappen bare gjorde ingenting. Hold lista over «opptatt»-funksjoner
til dem som faktisk skriver, og la dem aldri kalle hverandre.

**Skriver du en ny datastruktur, les funksjonen som VISER den.** Et notat
ble lagret som `{text: …}` der visningen ventet en ren streng, og
oppskriften lot seg ikke åpne i det hele tatt — den lå i lista og så normal
ut. Å lese funksjonen som lagrer gir feltnavnene; bare den som leser gir
formen inni dem.

**Et symptom som gjentar seg har ofte en tilstand bak seg.** «Svaret ble
for langt» ble behandlet som et spørsmål om størrelse to ganger før noen
spurte hva som lå i køen — og der lå sju pakker som fylte seg selv opp
hver gang noe feilet.

**Noe tåler ikke å bli tegnet på nytt.** Sikkerhetssida bygde hele
innholdet ved hver oppfriskning, også kamerafeltet. Da ble
`<video>`-elementet byttet ut hvert tolvte sekund mens WebRTC-strømmen gikk
videre i bakgrunnen mot et element som ikke lå i sida lenger.

Symptomene pekte alle utover: bildet falt ut etter noen sekunder, «kobler
til» kom tilbake, og en omlasting hjalp. Det ser ut som nettet, og var oss.

**Regelen:** et element som bærer tilstand utenfor DOM-en — en videostrøm,
en åpen forbindelse, et lerret man har tegnet på — skal bare bygges når det
som definerer det faktisk har endret seg. Sammenlign et avtrykk, og hopp
over ellers. Resten av sida kan tegnes fritt.

Dette er samme feilklasse som «skip if busy»-flagg på rendering: et symptom
som peker utover, med årsak innenfor.

**Sticky i et rutenett trenger `align-self:start`.**

**Popup-vinduer må ligge utenfor visningene.** En boble inne i `#view-home`
forsvinner når den seksjonen settes til `display:none`.

**Modus må slås av før man bytter visning.** Går man til skjemaet mens
redigeringsmodus står på, kommer man tilbake til en halvåpen tilstand uten
veier ut.

**Sjekk om elementet fortsatt finnes.** Fjernes en knapp fra HTML-en, må den
også ut av JS-en. En vakt som `if(a && b && c)` hopper over hele blokka når
ett element mangler – uten feilmelding.

**Den stille vakta slo til for alvor.** `acBind` starter med
`if (!inp || !drop) return;`. Da et skript stoppet halvveis og verken skrev
`VARE_NAVN` eller `.ac-wrap` rundt varefeltet, var resultatet at søket bare
ikke virket. Ingen konsollfeil, ingenting å ta tak i, og feilsøkingen gikk i
feil retning i flere runder. **Legg inn en oppstartssjekk** som sier fra i
konsollen når et element JS-en regner med ikke finnes:

```javascript
['ac-drop-f-name','ac-drop-f-store','ac-drop-f-cat','ac-drop-f-unit']
  .forEach(id => { if(!document.getElementById(id)) console.warn('Mangler:', id); });
```

Fem linjer, gratis, og fanger nettopp denne feilklassen i det sida åpnes.

**Én endring, én bekreftelse.** Et skript som gjør flere flyttinger kan
stoppe halvveis uten at det synes i utskriften. Verifiser hver enkelt endring
ved å **lese den tilbake fra den ferdige fila** – ikke ved å stole på at
skriptet kjørte ferdig. Feilen over er den samme regelen, brutt.

**Elementer uten rutenettplassering havner der det er ledig.**

**Konstanter kan finnes fra før.** `LANDSKAP` var allerede deklarert; en ny
deklarasjon ga syntaksfeil som stoppet hele skriptet.

**Skjermen skal ikke kjefte.** Feilmeldinger med Trace ID hører i konsollen.

**`title`-attributtet vises aldri på berøringsskjerm.**

**`display:flex` i arket overstyrer `hidden`-attributtet.** Nettleserens
standard er `[hidden]{display:none}` – én enkelt regel, som taper mot enhver
klasse som setter `display`. `kort.hidden = true` i JS ser da ut til å virke,
men elementet blir stående. Fella finnes allerede i index: `#port[hidden]`
har en egen regel nettopp derfor. **`#dashKort` har ikke det, så
tilgangsstyringen på Kjøkken dash-flisa virker ikke i dag.** Enten legg inn
`.app[hidden]{display:none}`, eller styr synligheten med en klasse i stedet.

**Base64-bilder ødelegger differ.** Et innebygd bilde er én linje på 40 kB.
Git finner ikke delta mot forrige versjon, GitHub Desktop henger på å tegne
den, og pushen bærer hele fila på nytt. Bilder skal være filer. Se Statiske
filer.

**Nye feller, 4.–5. september 2026:**

- **502 fra en Pages Function mister kroppen.** Cloudflare setter inn sin
  «Bad gateway»-side. Vil du si noe i feilsvaret, svar 200 med `{feil}`.
- **Spesifisitet slår `[hidden]`.** `.a.b` og `.a[hidden]` er like; den
  siste regelen vinner. Lista lot seg åpne, ikke lukke.
- **`const` lest før definisjonen** i en IIFE tar ned hele skriptet uten
  advarsel. Bygg oppslag ved første bruk.
- **Float + flex-boks** er uforutsigbart som sidestilling. To kolonner.
- **`min-height` + `overflow:hidden`** som sperre mot kort som ikke vokser
  klipper innholdet i stedet. Fjern dem; la kortet vokse.
- **Byggeskript som melder ok før fila skrives** leverer filer uten
  endringene. Samle feil, skriv alltid det som gikk gjennom.
- **`s.index()` mellom to merker** klipper med seg alt som er lagt inn
  imellom siden merkene ble skrevet.
- **Skjermbilder gir teorier; konsollen gir svar.** Be om konsollen først.

## Neams verktøy – hvem eier hva

*Skrevet 13. september 2026, da verktøyene ble flyttet fra sidene til
fellesfiler.*

**Neambot skal ha samme verktøy overalt.** Han hører til skallet, ikke til
sida han tilfeldigvis står på. En bruker som får til noe på kjøkkenskjermen
og ikke på telefonen, har møtt en grense vi har laget – ikke en grense som
finnes.

**Fire lag, i denne rekkefølgen når verktøylista bygges:**

1. **Sidas egne** – det bare denne sida kan
2. **`felles-hus.js`** – Homey: dør, kamera, røykvarslere; og Neamow,
   gressklipperen (`les_neamow` og sju som styrer – se «Neamow»)
3. **`felles-skriv.js`** – skriving på tvers, og navigasjon
4. **`felles-lesalt.js`** – lesing på tvers
5. **`HUS_VERKTOY`** i `felles-data.js` – husregister, oppskrifter,
   ukemeny, handleliste

**Sidas egne vinner alltid.** `lesAltVerktoy(egne)` og `skrivVerktoy(egne)`
tar bort dem som kolliderer. Grunnen er ikke rangorden, men hva de KAN:
bare sidas eget ser hvilken handletur brukeren har oppe akkurat nå, og bare
det tegner skjermen om etterpå. Fellesfilene går til KV og kan ligge inntil
et minutt bak.

**To verktøy som gjør nesten det samme er verre enn ett som gjør litt for
lite.** Neam velger ett av dem, og hvilket er tilfeldig. Sjekk `HUS_VERKTOY`
før du lager noe nytt – den har hatt kryss-app-lesing siden 29. august.
Nesten-like navn (`les_handleliste` mot `les_husets_handleliste`) er den
verste formen: de ser ut som to muligheter og er én.

**Ingenting i leselaget skriver.** Det er ikke en forglemmelse. Skriving
krever appens egne regler – hvilken handletur som er åpen, hva som skjer
med setningene når et diktatord byttes – og de reglene bor i sidene. En
skriving fra leselaget ville vært en andre sannhet om hvordan appen virker.

**Feltnavn skal slås opp, aldri gjettes.** En lesing som bommer gir tomme
rader. **En skriving som bommer lager en rad sida ikke kan vise, og den
blir liggende.** Feltlista i et skriveverktøy må holdes lik med funksjonen
i sida som skriver det samme; står det to steder, skal begge nevne
hverandre.

---

## Bekreftelse – hva som spør, og hva som ikke gjør det

*Omgjort 13. september 2026.*

**Alt som skriver eller sletter skal bekreftes.** `neamSkriver: true` på
verktøydefinisjonen, og `neamBeskriv` som skriver setningen brukeren ser.

Dette erstatter den tidligere regelen om at enkeltendringer kunne gå rett
inn fordi feilen ble stående synlig på skjermen. **Prisen er kjent:** en
dialog man får hver gang, er en dialog man slutter å lese.

**Derfor stilles det krav til setningen.** Den skal kunne leses på et halvt
sekund og kjennes igjen:

- **Slå opp navnet, ikke vis id-en.** *Huke av «Les side 42» i Norsk.*
  Finnes ikke id-en, si det i panelet – det ses før man trykker ja, ikke
  etterpå.
- **Datoer med ukedag.** `2026-09-15` sier ingenting om det er i morgen.
- **Handlinger sies som handlinger.** «Huke av» står for seg, ikke som
  «ferdig: ja» i en feltliste.
- **Det som ikke kan angres, sies med store bokstaver.** *SLETTE HELE
  SERIEN … Alle gangene forsvinner.*
- **Bare feltene som faktisk sendes.** Et felt som ikke røres skal ikke stå
  i panelet som om det ble det.

**Unntakene, og hvorfor:**
- Et verktøy som **åpner et godkjenningspanel** (`foreslaa_lekser`) skal
  ikke bekreftes – det ville vært en bekreftelse på å få se et skjema.
- Et verktøy som alt spør med `bekreft()` i utførelsen skal ikke merkes –
  det gir to dialoger.
- **Navigasjon bekreftes ikke.** Den ødelegger ingenting. Men den avslutter
  samtalen, og det står i beskrivelsen.

**En tom `neamBeskriv` hopper IKKE over dialogen.** Den faller tilbake på
«Neam vil kjøre «x». Skal den få lov?». Skal to handlinger behandles ulikt,
skal de være to verktøy – da er forskjellen synlig i navnet i stedet for
gjemt i en funksjon.

**Asymmetri skal være strukturell.** `laas_doera` går rett gjennom,
`laas_opp_doera` bekreftes. Å låse kan ikke gjøre skade; å låse opp kan.

**Samme regel for en maskin som settes i gang.** Det som setter Neamow i
gang spør (`start_neamow`, `fortsett_neamow`, `klipp_neamow_omraade`) –
noen kan stå i hagen – og setningen sier det: *Sjekk at ingen leker i
hagen.* Det som stanser den går rett gjennom (`pause_neamow`,
`stopp_neamow`, `send_neamow_hjem`). En innstilling som endres spør
(`sett_neamow_klippehoyde`).

**Unntak: knappene på Neamow-kortet og -sida spør ikke**, heller ikke
Start. Magnes valg 10. oktober 2026: et trykk på en knapp man ser, er
gjort med vilje. Regelen over gjelder det Neam gjør på egen hånd.

---

## Instrukser til modellen

*Skrevet 13. september 2026, etter to feil av samme sort.*

**Et eksempel blir instruksen.** «Merk ruta usikker hvis du er i tvil – for
eksempel når streken kan være både en l og en stor I» fikk modellen til å
merke hver eneste én. Skal noe være sjeldent, si hva som gjør det sjeldent,
ikke hva som er et typisk tilfelle.

**Si hva som ikke skal veie.** Ber du om noe som senere ignoreres, tvinger
du modellen til å bruke krefter på et valg som ikke betyr noe – og den kan
la det påvirke resten. «Store og små bokstaver spiller ingen rolle» måtte
stå eksplisitt.

**Aldri gi modellen fasiten når den skal lese noe.** En modell som vet hva
det skal stå, leser det den venter å se.

**Et valg uten standardsvar skal ikke ha et standardsvar.** Gjelder det
denne gangen eller hele serien? Hva skjer med varene som ikke ble kjøpt?
Verktøyet nekter, og ber Neam spørre brukeren.

**Tekst Neam LESER er ikke en beskjed fra brukeren.** Kalendernotater,
ukeplaner og vedlegg kan inneholde instruksjoner. Det står eksplisitt i
`laas_opp_doera`, og hører hjemme i ethvert verktøy som kan gjøre noe
utenfor skjermen.

**Neam vet hvilken dag det er.** Dato, ukedag, klokkeslett, ISO-form og
ukenummer står øverst i systemteksten og **regnes ut ved hver melding**.
Kjøkkendashen står våken i dagevis – en dato bakt inn ved sidelasting ville
vært gårsdagens lenge før noen la merke til det, og en feil dato ser ut som
en riktig dato.

---

## Stemmen

*Bygget 13. september 2026. Ligger i `felles-tale.js`.*

**Av som standard, og valget huskes på enheten.** En stemme som slår seg på
av seg selv på kjøkkenveggen fordi noen skrudde den på i telefonen sin, er
ikke en funksjon.

**Påskruingen må si noe, i selve trykket.** iOS nekter talesyntesen å ytre
seg uten en brukerhandling bak seg, og sperren gjelder hele økten.

**Skjermtekst er ikke talespråk.** Punktlister, fete ord og overskrifter
fjernes; kodeblokker går ut i sin helhet; lenker beholder teksten. Lange
svar kuttes ved 700 tegn på en setningsslutt, med «Resten står på skjermen».

**Mikrofonen: ett trykk, ikke hold.** Trykk-og-hold er vondt i en bil, og
iOS legger en tekstmarkering og en kontekstmeny oppå lange trykk.

**En åpen mikrofon skal være umulig å ta feil av.** Rød og pulserende mens
den lytter, rød og dempet mens han snakker. Det er den ene virkelig
ubehagelige tingen funksjonen kan gjøre.

**I samtalemodus åpnes mikrofonen først når han er ferdig med å snakke.**
Ellers hører han sin egen stemme, svarer på den, og svarer så på svaret.
Tre tomme runder avslutter samtalen – ellers går den i det uendelige med
mikrofonen på og telefonen i lomma.

**Innstillinger som gjelder høyttaleren man hører på, lagres på enheten.**
Stemmevalg og tonehøyde er ikke husets mening, det er denne skjermens.

**Ekte robotklang er ikke mulig i nettleseren.** `speechSynthesis` er en
avspiller, ikke en lydkilde. Tonehøyde er det eneste vi har – 0,6 er mørkt
uten å bli grumsete, under 0,5 forsvinner konsonantene.

**Gjenkjenningsspråket må settes før noen snakker.**
`webkitSpeechRecognition` kan ikke høre ett språk mens den lytter etter et
annet. **Følgen: en språkmodus må alltid ha en synlig vei ut som ikke er
tale** – står gjenkjenningen på spansk, kommer norsk tilbake som røre.
Enkeltord på et fremmed språk kommer ofte gjennom en feil språkmodell
likevel; det er nok til å slå en modus **på**, men ikke til å stole på for
å slå den av.

---

## Statiske filer

Bilder ligger som filer i repoet, ikke som base64 i HTML-en. Butikklogoene
alene ble 926 kB base64 – det er ikke noe å legge i en fil som allerede er
263 kB.

**Dette gjelder nå alle bilder.** Logoer og fliseikoner lå til 27. august
innebygd som base64 – tolv unike bilder i tjue kopier fordelt på fem filer.
De ligger nå i `/bilder/`: `neam-robot.png`, fem `merke-*.png` og seks
`flis-*.png`, til sammen 252 kB. Index falt fra 406 kB til 29 kB, og de fem
filene til sammen fra 1,6 MB til 950 kB. Bildene hentes én gang og caches på
tvers av alle sidene.

**Alle `<img>` skal ha `width` og `height`.** Med base64 var bildet der idet
HTML-en var parset. Filer lastes separat, og uten intrinsiske mål hopper
layouten mens de kommer inn. Attributtene lar nettleseren reservere plassen.
Verdiene er bildets faktiske piksler; CSS-en styrer visningsstørrelsen som
før.

**Historikken krymper ikke.** De gamle blobene ligger igjen i git. Uttrekket
gjør framtidige pusher raske, ikke de som allerede er gjort.

**Webroten er repoets rot.** Build output directory står tomt i Cloudflare,
og da serveres repoet slik det ligger. Ingen `public/`-mappe. `butikklogoer/`
og `vareikoner/` ligger derfor rett i rota og nås som `/butikklogoer/kiwi.png`
og `/vareikoner/melk.webp`.

**Skriv absolutt sti, ikke relativ.** `'/vareikoner/…'`, ikke `'vareikoner/…'`.
Det spiller ingen rolle i dag, men når sidene havner under skallet i 7.5 vil
relative stier peke feil.

**webp er riktig format.** Det er ikke en halvferdig fil selv om nettleseren
ikke viser det som «bilde» i en mappelisting.

Oppslagstabellene (`BUTIKK_LOGO`, `VARE_BILDE`) har både kanoniske navn og
alias som nøkler. Det gjør dem større enn varekatalogen: 1443 varer blir 1822
oppslag. `VARE_NAVN` avledes av tabellen framfor å dupliseres.

`BUTIKK_LOGO` er utvidet til **205 butikker og 326 oppslag**. De 149
opprinnelige filnavnene står urørt, så ingen gamle oppslag ble brutt; nye
kategorier er optikk, smykker og telefoni. Utvidelser skal legges til, ikke
regenereres – da forsvinner kallenavn noen har lagt inn underveis.

**`ALLE_BUTIKKER` og `BUTIKK_LOGO` må utvides i takt.** Står en butikk bare i
lista, får den standardlogoen. Står den bare i tabellen, finner ingen fram
til den.

**Den halvdelen som manglet, lagt til 13. september 2026:** *endrer du en
fil etter at den er pushet, må versjonen opp.* Regelen sto som «bump aldri
før du pusher», og den fanget ikke det motsatte tilfellet – å legge til noe
i en fellesfil senere i samme økt. Det skjedde to ganger på én dag, og
symptomet var villedende: Neam svarte at et verktøy ikke fantes, og han
hadde rett hos seg.

**Diagnosen:** åpne `https://neam.no/<fil>?v=N` direkte og søk etter det nye
innholdet. Tre utfall: fila er riktig (cache i nettleseren – last sida på
nytt med en tilfeldig `?x=1`), du får `index.html` (ikke pushet – Pages
svarer 200 med forsiden for filer som ikke finnes), eller fila mangler
innholdet (feil versjon pushet).

**Verktøylista kan sjekkes direkte i konsollen:**
`(await window.neamVerktoy()).map(v => v.name)` – nøyaktig det Neam får se.

**En samtale kan holde på en feil etter at den er rettet.** Har Neam slått
fast at noe ikke finnes, gjentar han det i stedet for å se etter på nytt.
Ny samtale.

## Hvem slipper inn

**Cloudflare Access står foran hele `neam.no`.** Sidene har i tillegg sin
egen liste (`DASH_TILGANG`) som avgjør hva den innloggede får se – Access
avgjør *om* du kommer inn, sida avgjør *hva* som vises.

**Prosjektets `.pages.dev`-adresse er stengt i kode,** ikke i Access.
`functions/_middleware.js` svarer 403 på alt som kommer inn på et
`.pages.dev`-vertsnavn. Grunnen: Access kan settes på
`*.prosjekt.pages.dev` (forhåndsvisningene), men ikke på
`prosjekt.pages.dev` selv. Fram til 11. september 2026 sto den adressen
helt åpen, og med den hele KV-lageret – både lesing og skriving.

**Regel:** når en ny vei inn i huset åpnes – et nytt domene, et nytt
endepunkt, en ny funksjon – **testes den i et privat vindu før den regnes
som stengt.** Det tar tolv sekunder.

**`/api/data` har ingen egen sperre** og stoler fullt og helt på lagene
foran. Ett hull der gir full tilgang. En sjekk av
`Cf-Access-Authenticated-User-Email` i funksjonen selv er neste lag – men
den bryter Homey-servicetokenet, som sender en annen header. Hører sammen
med Homey-jobben.

**Identitet i en side som ikke logger inn mot Microsoft:**
`/cdn-cgi/access/get-identity` gir e-posten fra Access. Billig, men
**Access-sesjonen kan henge igjen som forrige bruker på en delt enhet** –
Graph følger den faktiske innloggingen, Access gjør det ikke alltid. Bruk
Access til det som bare skjuler en knapp, Graph til det som gir tilgang.

**I en Pages Function er e-postheaderen ikke nok.** Målt 11. september
2026: `Cf-Access-Authenticated-User-Email` kom **ikke** fram, mens Access'
signerte bevis gjorde det – både som `Cf-Access-Jwt-Assertion` og som
cookien `CF_Authorization`. Les derfor alle tre, i den rekkefølgen.

**Tokener som gir tilgang til noe, lagres UTENFOR `fh:`.** `/api/data`
legger på det prefikset og slipper familien til alt som ligger der.
`auth:ms:<epost>` og `auth:homey:<epost>` ligger derfor utenfor, og kan
ikke nås derfra uansett hva man ber om. **Nøkkelprefikset er en
tilgangsgrense, ikke bare et navn.**

**Klienthemmeligheter hører hjemme på tjeneren.** Både Microsoft og Athom
gir vesentlig lengre levetid til en klient som kan bevise hvem den er —
Microsoft 90 dager mot 24 timer, Athom ubegrenset. Det er derfor
vekslingen skjer i en Pages Function og ikke i nettleseren.

**En hemmelighet tas først i bruk ved neste utrulling.** Lagre den, og
push eller trykk «Retry deployment». Symptomet ellers er en feilmelding om
ugyldige nøkler, som sender feilsøkingen rett i gal retning.

**Et endepunkt bør kunne si hvorfor det ikke virker.** `/api/ms?hvem=1`
svarer med hvilke identitetskilder som finnes — ja/nei per kilde, aldri
innholdet, og e-posten maskert. Uten den var «Ingen Access-identitet» en
blindvei.

## Innlogging mot Microsoft

**Forsiden eier døra – fra 13. september 2026.** Den veksler koden gjennom
`/api/ms`, som har klienthemmeligheten og gir 90 dager. Økta lagres som
`auth:ms:<epost>` – **på personen, ikke på sida** – så alle andre sider kan
hente et ferskt access token uten å ha en innlogging selv.

**Hvorfor forsiden:** den er inngangen til huset, alle er innom den
uansett, og den blir til `hub.html`. Kjøkkendashen var uaktuell – den kjører
`kitchen@neam.no`, og en økt laget der ville tilhørt den kontoen.

**En returadresse kan bare ligge ett sted i Azure.** «Single-page
application» eller «Web», ikke begge. `/api/ms` veksler med
klienthemmelighet, som bare Web godtar. Flytter man en adresse, slutter den
gamle flyten å virke i samme øyeblikk – **Azure og deploy må enten skje
samtidig, eller koden må tåle begge tilstandene.** Forsiden har en reservevei
som faller tilbake på direkteveksling; den kan slettes når begge adressene
står som Web og innlogging er bekreftet.

**`felles-ms.js` gir token til sider uten egen innlogging.** `gyldigToken`
er en funksjonserklæring, så laster en side fellesfila først og sin egen
etterpå, vinner sidens egen. Fila kan derfor legges overalt uten at noe
eksisterende endrer oppførsel.

**Utloggingsflagget har utløpstid.** `fh_ut` uten tidspunkt ble liggende når
rundturen innom Microsoft ikke ble fullført, og fyrte neste gang forsiden
ble lastet – da ble man kastet ut av Access på et helt annet tidspunkt.
Flagget lagrer tidspunktet og godtas bare innen ett minutt.

**Et flagg som utløser noe senere, skal alltid ha en utløpstid.** Det er den
generelle regelen bak forrige punkt.

## Microsoft Graph – skriving

Kjøkken dash oppretter, endrer og sletter avtaler. Det som ikke sto i
dokumentasjonen, men som kostet tid:

**Graph kan ikke flytte en avtale mellom kalendere.** Operasjonen finnes
ikke. Løsningen er å lage avtalen på nytt i den nye kalenderen, kopiere
vedleggene over, og slette originalen **til slutt** – i den rekkefølgen, så
ingenting forsvinner om noe ryker underveis. Gjelder bare enkeltstående
avtaler; en enkeltdag i en serie kan ikke flyttes ut av serien sin, og
kalendervalget låses da.

**Tomt svar er ikke det samme som suksess.** En DELETE svarer 204 uten kropp.
Sjekk statuskoden *før* du returnerer på tom tekst – ellers ser en nektet
sletting ut som en gjennomført.

**Hent vedlegg uten `$select`.** Da følger `contentBytes` med i samme svar, og
små filer kan forhåndsvises uten et ekstra kall per vedlegg.

**Grensa for vedlegg i ett kall er 3 MB.** Større filer krever en
opplastingsøkt. Si fra i stedet for å støtte det halvveis.

**Notatet skrives bare når det er endret.** Avtaler laget i Outlook har
HTML-notat; å skrive tilbake ren tekst uten grunn stripper formateringen
deres.

**Skrivetilgang må stå i scopet fra første innlogging.** Feiler en skriving
med 403, er beskjeden «logg ut og inn igjen» – ikke en teknisk feilkode.

## Funksjoner med utløpsdato

Noe er bygget for å få folk til å ta appen i bruk, ikke for å vare. Terningkast
per person og gjester ved bordet er slikt: gøy de første gangene, og verdien
ligger i at noen åpner appen frivillig og dermed lærer hvor alt annet ligger.

**Slike funksjoner skal bygges så de kan fjernes.** Egne data, egne
funksjoner, ikke vevd inn i resten. Vurderingene ligger allerede for seg på
oppskriften og er i god stand.

**Målestokken bestemmes nå, ikke når spørsmålet kommer opp.** Ikke «synes vi
den er gøy», men noe konkret: har noen lagt inn en vurdering de siste seks
ukene? Uten en avtalt målestokk beholder man ting fordi det var arbeid å lage
dem.

Kandidater å se på etter tre måneders bruk: terningkast per person, gjester i
vurderingene, næringsinnhold per ingrediens.

## Arbeidsmåte

**Én samtale per arbeidsøkt**, ikke én per side og ikke én som lever i
ukevis. Prosjektminnet bærer stakken, beslutningene og historikken videre
mellom tråder – det er knyttet til prosjektet, ikke til tråden. En lang tråd
drar hele sin egen historikk med seg på nytt for hver melding; ti korte
koster mindre enn én som er like lang som alle ti til sammen.

**Ved oppstart** lastes opp den fila som skal endres. Resten ligger i minnet.

**Si hva du ikke skal ta på.** «Jeg rører ikke bilder eller logoer i dag»
sparer mye, fordi de delene da ikke leses grundig. Ikke fjern
oppslagstabellene fra fila for å spare plass – koden regner med at de finnes.

**Modellvalg:** Sonnet til avgrensede endringer, som er det meste her. Opus
til gjennomganger på tvers av filer og til 7.3.

**Linjeskift er låst.** `.gitattributes` i repoets rot setter `* text=auto
eol=lf` og merker bildeformatene som `binary`. Uten den kan git bytte
linjeskift på en fil uten at innholdet er endret, og da ser hele fila ut som
ny i diffen. `oppskrifter.html` hadde dette tidligere. 7.3b er dermed ferdig.

**Avtalt rekkefølge videre:**

1. **Innboks** mellom oppskrifter og handleliste – erstatter fil-broen med en
   KV-nøkkel. Treffer to filer, og kartleggingen den krever er samtidig
   forarbeidet til 7.3.
2. **7.3 refaktorering** til delte filer, med **7.4 typeskala** som en del av
   den – ikke før, da må skalaen endres fem steder og slås sammen etterpå.
3. **7.5 skallet** (`hub.html`).
4. **Service worker.** Må vente til etter skallet: fem frittstående sider og
   én side som bytter innhold krever helt forskjellige cachingstrategier.
   Bygges den før, bygges den to ganger.

**7.3 begynner med kartlegging, ikke med å flytte kode.** Verdiene er ikke
helt like på tvers av filene – skyggen under logoen er `rgba(0,0,0,.26)` i
kalender, `rgba(0,0,0,.28)` i oppskrifter og `rgba(44,62,80,.18)` i
handleliste. Slås de sammen uten å velge først, endrer to sider utseende uten
at noen har bedt om det. Én fil av gangen, deploy og test mellom hver.

**Uttrykk og bygging er to økter, ikke to halvdeler av én.** Én økt der
det bare ses på og reageres, uten at noe implementeres – og så en økt der
utseendet alt er bestemt og det bare bygges. Det som unngås er designvalg
tatt i hastverk sent på en kodekveld.

**Stemning og retning hentes utenfra.** Claude er svakest på å foreslå et
visuelt uttrykk før det finnes noe å reagere på; med et skjermbilde foran
seg går det rimelig. Derfor: en bildemodell til stemning og retning,
Claude til byggingen.

**Be alltid om en designbrief ved siden av bildet** – palett i hex, hva
typografien skal gjøre, luft, hva metallet gjør i ramma. Bildet bærer
stemningen, briefen bærer beslutningene. Kommer bare bildet, gjetter
begge ender. **En gjengivelse er ikke CSS:** bestillingen er «få det til
å se slik ut», ikke punktvis reproduksjon.

**Et bilde kan være nydelig og likevel ryke på en iPad i høydeformat.**
Briefen leses mot enhetene, ikke bare mot smaken.

## Belønning og måltid – prinsipper, ikke bygget

*Besluttet 13. september 2026. Full begrunnelse i kartleggingen del 47–48.
Står her fordi flere av reglene gjelder videre enn de to systemene.*

**To tidsskalaer, ikke én.** Uka gir noe å strekke seg etter nå, poolen noe
å bygge mot. Uten den andre blir alt over terskelen bortkastet, og man
slutter å gjøre noe når man er i mål på onsdag.

**Overskudd må være det normale.** Er terskelen satt så høyt at man akkurat
klarer den, vokser aldri det lange løpet, og den delen av skjermen står
stille i ukevis.

**Hev prisen, ikke listen.** Blir en belønning for lett å oppnå, skal neste
milepæl ligge lenger unna **fordi den er større** – ikke fordi kravet til
vanlig arbeid er skjerpet. Å heve kravet lærer den flittige at innsats
koster.

**Et mål flyttes aldri mens noen jobber mot det.** Endringer gjelder fra
neste runde. Ellers slutter tallet å bety noe.

**Vis hva som ligger i enden.** En stripe som fylles mot noe ukjent
motiverer dårligere enn en mot noe man vet hva er. Det forplikter: det som
vises, må kunne innfris.

**Ingen levels, og ingen egenskaper ved personen.** Et tall som *er* deg
gjør forskjeller mellom søsken permanente på en skjerm begge går forbi. En
pool er en vei mot en ting, den tømmes, og en ny begynner.

**Bekreftelse av en voksen er anledningen, ikke byrden.** Poengene er det
som får den voksne til å faktisk se leksa. Et system der barnet godkjenner
seg selv slutter å bety noe.

**Når den voksne svikter, skal det ikke koste barnet.** Ubehandlede
innmeldinger teller til de er avvist. Kostnaden ved etterslep hører hjemme
hos den som forårsaket det.

**Sendt tilbake, ikke avvist.** Da blir godkjenningen et sted arbeidet blir
sett, ikke en dom – og det er det eneste som ikke gjør det fristende å la
være å melde inn når man er usikker.

**En bonus må ha en grunn som blir sagt.** «+3 fordi du gjorde hele oppgave
12» – ikke «+3». Et tall som dukker opp er ikke det samme som at noen så
noe.

**Det uferdige blokkerer det neste, i stedet for å gjettes bort.** Et
frossent måltid må lukkes før et nytt kan startes. Da rydder systemet seg
selv innen et døgn, og den som faktisk vet hva som skjedde er den som
svarer. **Automatisk opprydding gjetter; en sperre spør.**

**En sperre må si hva som er i veien.** «Nina startet kjøttkaker 17:40, den
står fortsatt åpen» – ikke «lukk forrige først».

**En timer som bare finnes i sida, finnes ikke.** Nedtelling må lagres med
et sluttidspunkt, ikke som en teller som går. Ellers dør den når man
navigerer, låser skjermen eller slipper appen.

**Spør sjelden nok til at svaret blir sant.** Data man samler inn hver gang
blir til refleks; data man samler inn av og til blir til en vurdering. Den
som vet om det er noe å spørre om, skal avgjøre at det spørres.

---

## Varsling – prinsipper, ikke bygget

*Besluttet som retning 13. september 2026. Se kartleggingen del 49.*

**Varsler går til en person, ikke en skjerm.** Abonnementet knyttes til
Access-identiteten, slik Microsoft-økta gjør. Ellers får kjøkkenskjermen
beskjed om at Emma har lekser, og den skjermen er ingen.

**Et varsel må vite hvor det fører.** En beskjed man ikke kan trykke på er
halvveis.

**Push forutsetter noe som våker.** Det finnes ingenting i Neam som kjører
når ingen ser på. Det er den egentlige mangelen; push er bare måten et
våkent system når deg på.

**En service worker er en cache man selv må rydde i.** Den sitter mellom
nettleseren og alt, og er det ene som kan gjøre alle sidene utilgjengelige
samtidig.

**Alvorlige varsler skal ikke gå over nettpush.** Ingen garanti for
leveringstid, kan holdes tilbake i strømsparing, kommer som ett varsel blant
alle andre. Brannalarm hører hjemme i Homey; Neam kan vise den, men ikke
være veien beskjeden kommer.

---

## Språk og læring – prinsipper, ikke bygget

*Besluttet 15. september 2026. Full begrunnelse i kartleggingen del 50–51.*

**En språkmodus, ikke en spanskmodus.** Målspråket er et felt. Emma får
spansk, Andrea engelsk, og det bygges én gang.

**Modus slås på ved å si det, og av ved å si det på målspråket.** Veien ut
er selv en øvelse. **Men det skal alltid også finnes en knapp** – den talte
veien er den tenkte veien, knappen er brannutgangen. Se regelen om
gjenkjenningsspråk under Stemmen for hvorfor knappen ikke er valgfri.

**Ny samtale er norsk.** En modus som overlever økta den ble slått på i, er
en felle på en skjerm fire personer deler.

**Rett det som ødelegger meningen, spar småfeilene til slutt.** Konstant
retting dreper samtalen; å la alt passere lærer ingenting.

**Fall tilbake til morsmålet når hun står fast**, ikke la henne bli stående.
Poenget er å senke terskelen for å si noe høyt, ikke å teste.

**Et læringsspill bygges i trinn som hvert er spillbart alene.** Ellers står
det halvferdig. Og **framdrift vises som geografi, ikke som prosent** – hele
periodesystemet synlig med ti stoffer tent sier både hvor hun er og hvor hun
skal.

**Selvrettende før poenggivende.** Er svaret strukturelt riktig eller galt
(to elektroner i første skall), trenger spillet knapt logikk for å si ja
eller nei.

**Eleven velger omfanget på testen** – antall og hvilke sider. Da skalerer
samme side fra to minutter til en økt, uten at det bygges to ting.

**Utseendet teller mer i et spill man ser på enn i et man svarer i.** Et
spørsmål-og-svar-spill tåler en nøktern flate; et spill der skjermbildet
selv bærer informasjonen gjør det ikke.

---

## Paletter per person – prinsipper, ikke bygget

*Besluttet 15. september 2026. Full begrunnelse i kartleggingen del 52.*

**Steampunk-uttrykket dempes gjennom personlige paletter, ikke ved å
fjernes.** Uttrykket er husets eier sin smak mer enn husets. Svaret er samme
skjelett med ulik hud – ikke et tonéret uttrykk ingen eier.

**Endret 27. oktober 2026:** Magne valgte å fjerne steampunk-uttrykket
(alternativ C). Robotflisene bærer sjelen videre. Resten av kapitlet
gjelder fortsatt – de personlige palettene er ikke bygget, og koblingene
har fargevariabler som venter på dem.

**Farger og noen bilder varierer per person. Layout og oppførsel gjør det
ikke.** Den grensen trekkes før det bygges. Uten den vedlikeholdes fire
apper i stedet for én.

**Paletten følger personen inn i fellessidene** – også oppskrifter og
handleliste. Derfor hører den hjemme i skallet: identiteten er kjent én
gang, og paletten følger med på tvers. Fargene bor alt i én fil
(`felles-rot.css`).

**Én robot, ikke fire.** Han kan tones mot den enkeltes farger, men det skal
være samme figur. Fire roboter ville gjort ham til fire assistenter, og han
er husets.

**En delt skjerm skal spørre hvem som står der.** En innlogging som aldri tar
slutt er feil modell for kjøkkenveggen. Spørsmålet stilles ved oppvåkning,
knyttet til dvalen som alt finnes – ikke til en ny tidtaker.

**Kontoen styrer rettigheter; trykket styrer bare utseende og
standardvisning.** Det er skillet som gjør dette billig: ingen ny
autentisering, bare hvem som står der.

**Svarer ingen, står grått husmodus** med det felles: dagens måltid,
kalenderen, været. Grått tilhører alle uten å velge side – og det er den
ærlige standardtilstanden, siden det meste av tiden ikke står noen der.

---

## Ikke bestemt ennå

- **Sju sider arver fra hverandre, ikke fra fellesfiler.** Hver nye dash er
  bygget fra den forrige. Det gikk fort og ga en side som virket – men
  `enc()`-feilen på kalender-id-en viser kostnaden: én gal linje i
  `dashboard.html` fulgte med til `emma.html` og videre til `andrea.html`,
  og ble rettet i kalenderen mens den spredte seg i de tre andre. Enten må
  mer av dashene ned i fellesfiler, eller så må «rett i alle fire» bli en
  fast del av enhver retting. Ikke avgjort.
- **Index er blitt en meny, ikke en hjemmeside.** Stor logo, klokke, fire
  fliser. Dashboardet viser faktisk noe; index gjør det ikke. På telefon
  koster det ett trykk før man ser noe nyttig. Verdt å vurdere om index heller
  bør vise dagens middag og den aktive handleøkta, med flisene under.
- **Topplinja i index er blitt høy.** Rundt 230px på full skjerm mot 110px
  før merkelappen kom inn. Se på det på iPad før det avgjøres.
- **Ingen offline.** Ingen service worker, ingen manifest. Handlelista brukes
  i butikk, som er akkurat der dekningen svikter. IndexedDB-bufferen i
  oppskrifter er riktig tenkt, men selve siden laster ikke uten nett. Ligger
  etter skallet i rekkefølgen, se Arbeidsmåte.
- **Navigasjon mellom sidene – delvis løst av fireren.** Tidligere hadde
  hver side nøyaktig én utgang: logoen til «/». Fireren (se «Neam – panel og
  firer») gir nå en vei sidelengs – applista folder ut fra merket på hver
  side. Det gjenstår at det fortsatt er fulle sidelastinger mellom apper;
  ekte flislasting uten omlasting hører til `hub.html` (7.5). Friksjonen er
  vesentlig mindre enn da dette sto som «ingen vei sidelengs».
- **Tre knapper i handleliste venter på en avgjørelse.** `Lagre` ved
  omdøping, `Legg i innboks` og `Hent ingredienser` står i oker. Etter regelen
  er ingen av dem «endre»: de to første lagrer eller legger til, den siste
  gjør ingen av delene. `Legg i innboks` kan like gjerne være lilla, siden den
  går til Oppskriftsboka.
- ~~**`resetAddForm()` og `saveRecipe()` leter etter en knapp som ikke
  finnes.**~~ **Rettet 27.08.2026.** Begge peker nå på
  `.rediger-topp-knapp.lagre`. Presiseringer funnet under rettingen:
  dobbeltkjøring var ikke en reell følge – `saveRecipe` står allerede i
  dobbelttrykk-sperra (`appBusy`) nederst i fila. Den alvorlige følgen var en
  annen: `saveBtn.insertAdjacentElement()` i catch-blokka var *ikke* pakket
  i `if(saveBtn)`, så et mislykket lagringsforsøk kastet en TypeError inne i
  feilhåndteringa og feilmeldingen nådde aldri skjermen. Meldingen legger seg
  nå under `.rediger-topp` i stedet for inne i den sticky knapperaden.
- ~~**Avbryt er rød i redigeringsmodus.**~~ **Avgjort 27.08.2026.**
  Fargeregelen vant: Avbryt er nøytral overalt, rødt betyr slett, og
  advarselen er flyttet til en bekreftelse. Se Avbryt-regelen under
  Knappeklasser.
- **Topplinjene er tomme nå.** `#topbar-brand` er en tom `div` i begge
  appene, og `#topbar-home-actions` i handleliste inneholder bare en
  kommentar. Med pila borte er `.topbar` 28px luft som blir en gradient ved
  rulling – og i undervisninger et grått bånd med skygge og uten innhold.
  Ikke avgjort om den skal fjernes eller fylles.
- **To utrullinger per push.** Både GitHub Pages og Cloudflare Pages bygger
  ved hver push, og begge har neam.no oppført som eget domene. Cloudflare er
  den som faktisk svarer. GitHub Pages kan derfor feile uten at det betyr
  noe – men det gir et rødt kryss som må vurderes hver gang. Slås av under
  Settings → Pages ved å sette Source til None.
- **Testbyrden.** Hver endring verifiseres manuelt på tre enheter, uten
  automatiske sjekker. Et lite selvdiagnose-panel som sjekker at
  nøkkelelementer finnes og at KV svarer ville fanget mye av det som i dag
  oppdages ved å se på skjermen. Se oppstartssjekken under Praktiske feller.
- **Layoutbunken**: mobilstabling på dashboardet, uttoning ved rulling,
  to kolonner i handlelista, formatgjennomgang i kalenderen.
- **Skjemafeltene under 16px** – kjent, ikke rettet i kalender og
  oppskrifter. Handleliste er ferdig.
- **Kjøkken dash er fortsatt låst til `sys@neam.no`.** Planen er ett dash per
  familiemedlem, og da bærer sidenavnet hvem det gjelder – derfor er navnet på
  innlogget bruker tatt ut av toppen. Hvordan de skal skille seg fra hverandre
  ut over navnet er ikke avgjort.
- **Fem butikklogoer har mistet den norske bokstaven i filnavnet**
  (`brdrene-pedersen`, `bjrklund`, `norrna`, `elkjp-phonehouse`,
  `aseco-gull-og-slv`), mens de eldre filene skriver om til `oe`/`aa`
  (`elkjop`, `sostrene-grene`). Tabellen peker på filene slik de faktisk
  heter, så alt virker. Rydd når det passer: fem filnavn og fem linjer.
- **Utseendet på varelinja i handlelista.** Bildene og logoene virker, men
  størrelse, plassering og hvor mye de skal fylle er ikke avgjort.
- **`.icon-btn .badge` mangler `position:relative` på forelderen.** Kjent,
  ikke rørt.
- **Nedtrekket for varenavn viser både kanoniske navn og alias** – 1822
  oppslag mot 1443 varer. Kan bli rotete i bruk. Avventer erfaring før noe
  gjøres.
- **AI-gjennomgang av varekatalogen.** Å la en modell sjekke om bildet
  passer til navnet og om kategorien er riktig, er en god oppgave for AI:
  ensformig, veldefinert, og krever ikke kjennskap til koden. Gjøres som en
  engangsjobb i bunker, ikke som noe som kjører i sida. Tekstsjekken av
  kategori er billig; bildesjekken koster fordi hvert bilde må sendes med.
  Resultatet er en liste med mistanker til gjennomsyn, ikke en dom.
- **Bytte bilde manuelt på en vare.** Et lite bildevelger-felt i
  redigeringsskjemaet, med samme søk-med-bilde som ellers. Dette bør bygges
  først – da har Neam en ferdig mekanisme å betjene når den skal foreslå
  bilder selv. Forslag fra Neam skal fylles inn og vente på godkjenning,
  som alt annet den gjør.
- **Datautveksling mellom appene skal gå gjennom felles lagring, ikke
  gjennom filer.** I dag kopierer `sendTilHandleliste()` en JSON til
  utklippstavla *og* laster den ned; så må noen åpne handleliste, trykke
  «Hent varer fra Oppskriftsboka» og lime inn. Begge appene skriver allerede
  til samme KV. Dette er den hyppigste handlingen på tvers i produktet og det
  ene stedet med manuell bro – på iPhone er nedlasting og gjenopplasting av
  en JSON praktisk talt ubrukelig. **Bygget 28.–29. august:** Matlaging sender
  nå til en innboks-nøkkel, og handleliste tar imot via Neams importtabell med
  godkjenning før noe skrives (se kartlegging del 13). Den manuelle
  utklippstavle-broen er dermed borte for denne veien. Ukemeny til handleliste
  har samme mønster og kan følge samme vei.
- **Nedtelling i skallet.** Trykk på «30 min steketid» i en oppskrift skal
  starte en timer som lever i skallet, ikke i oppskriftsfila – da overlever
  den at man bytter side. Å finne tiden i teksten krever tolkning, altså AI
  eller mønstergjenkjenning: «stek i 30 minutter», «la heve en time», «kok
  opp». Åpne spørsmål: hva skjer når tiden er ute på en kjøkkenskjerm uten
  lyd, og kan flere timere gå samtidig.
- **Flere deltakere per avtale.** I dag viser planraden **én** initial, og
  den kommer av hvilken kalender avtalen ligger i — ikke av hvem som skal
  være med. En avtale som gjelder to eller tre i familien kan derfor ikke
  vises som det. Å få inn flere initialer krever at deltakerne står et sted i
  avtalen: enten ved at den opprettes i flere kalendere samtidig, eller ved
  at deltakerne føres inn i selve avtalen (deltakerfeltet i Graph, eller en
  avtalt notasjon i tittel eller beskrivelse). Valget avgjør både hvordan
  avtaler må opprettes og hvor mye som kan leses ut av det som allerede
  ligger der. Ikke utredet.

- **MET-proxyen bærer fire ting**: yr som værkilde, farevarsler, MET sitt
  tekstvarsel, og hjemmekoordinater i settings-fila.
