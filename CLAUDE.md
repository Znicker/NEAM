# Neam (Familiehub)

Husets egen app: statiske HTML-sider med fellesfiler i repo-rota, servert av
Cloudflare Pages på `neam.no`, med Pages Functions i `functions/`. Ingen
byggesteg – webroten er repo-rota slik den ligger.

## Dokumentene – les dem, ikke gjett

To dokumenter i `dokumenter/` er fasiten. Filnavnet har versjonsnummer; bruk
alltid den nyeste (per nå `7_3-kartlegging-v11.md` og
`neam-designsystem-13.md`).

- **Kartleggingen** – hvor prosjektet står og hvorfor beslutninger ble tatt.
  **Les toppblokka «Nåstatus» først** i hver økt: siste leverte `?v=`,
  brente numre, åpne tråder og hva som er avtalt som neste sak.
  «Avkreftet – ikke prøv igjen»-listene sparer deg for kjente blindspor.
- **Designsystemet** – regler som gjelder *alle* sidene: typeskala, farger og
  deres betydning, knappeklasser, avbryt- og bekreftelsesregler, fireren,
  Neams verktøylag, praktiske feller. Står noe der, gjelder det overalt.
  Står det ikke der, er det et nytt valg – spør, og foreslå at det føres inn.

Ikke kopier innhold fra dokumentene hit. Henvis til del/kapittel.

## Arbeidsregler

- **Hold endringene strengt til det som ble bedt om.** Ser du noe annet som
  burde rettes, si fra i svaret – ikke rett det. En endring som sprer seg til
  filer ingen spurte om, er den dyreste feilen i dette repoet.
- **Tell opp før du planlegger.** Dokumentene kan henge etter koden. Sjekk
  med grep hva som faktisk står i filene før en jobb estimeres.
- **Slå opp feltnavn og former i koden – aldri gjett.** Les både funksjonen
  som skriver og den som *viser* dataene.
- **Sjekk `HUS_VERKTOY` og fellesfilene før du lager et nytt Neam-verktøy.**
  To nesten-like verktøy er verre enn ett.
- **Fellesfiler lastes av mange sider:** vanlige norske ord er alt tatt.
  Prefiks interne navn (JS og CSS-klasser). En dobbel `const` eller en
  `const` lest før definisjonen tar ned hele sidens skript uten spor.
- **Dashene er kopier av hverandre** (`dashboard`, `emma`, `andrea`). En
  retting i én: nevn i svaret om de andre har samme feil.
- **Store filer endres med verifisering:** hver søkestreng skal treffe
  nøyaktig forventet antall ganger, og endringen leses tilbake fra den
  ferdige fila – ikke antatt fra at et skript kjørte.
- **Feilsøking: hard oppdatering og konsollen før teori.** Pages svarer 200
  med forsiden for filer som ikke finnes; content-type avslører det.
- **Si alltid fra når en kommando feiler**, også når en omvei ga svaret
  likevel. En omvei som ikke nevnes, er en antakelse ingen vet om holder.
- **Pages Functions svarer aldri 502 med diagnose** – bruk 200 + `{feil}`.
- **Absolutte stier** (`/bilder/…`), mappenavn i små bokstaver, og `width`/
  `height` på alle `<img>`.
- **Alt som skriver via Neam skal bekreftes** (`neamSkriver` + en lesbar
  `neamBeskriv`) – se designsystemet, «Bekreftelse».
- **Valg om farge, layout eller uttrykk som ikke står i designsystemet:
  stopp og spør.** Ikke gjett, og ikke velg noe som ser rimelig ut.
- **Siste handling i en økt med endringer:** foreslå oppdatering av
  toppblokka i kartleggingen (nye `?v=`, brente numre, åpne tråder).
- Commit og push bare når Magne ber om det. Nye filer må være med i commiten.

## Versjonsregelen for `?v=`

Fellesfiler lenkes med versjon (`/felles-neam.js?v=71`), og bilder har egne
konstanter (`MERKE_V`, `KNAPP_V`, `FAG_MERKE_V`, `SIK_MERKE_V`). Cloudflare
bufrer per URL, og et feil svar kan bli liggende for alltid.

1. **Endrer du en fil, skal nummeret opp** – også om fila bare er endret
   igjen senere i samme økt etter at den er pushet.
2. **Bump nummeret i HTML-en i samme commit som fila selv.** Aldri før fila
   er pushet: da bufres gammelt innhold (eller forsiden) under ny URL.
3. **Gjenbruk aldri et nummer** som kan ha vært forespurt. Se «Brente numre»
   i toppblokka før du velger neste.
4. **Oppdater alle sidene** som laster fila – grep etter filnavnet.
5. **Diagnose:** åpne `https://neam.no/<fil>?v=N` direkte og søk etter det
   nye innholdet. Neams faktiske verktøyliste:
   `(await window.neamVerktoy()).map(v => v.name)`.

Detaljer: kartleggingen del 17 og 46, designsystemet «Statiske filer» og
«Bilder – merker og knapper».

## Aldri rør (uten uttrykkelig beskjed)

- **Nøkler som bærer data:** `fh_`-nøklene i localStorage, `fh:`-prefikset i
  KV, `DB_NAME = 'familiehub'`, og KV-nøkler som `handleliste:v1`,
  `husregister:v1`, `emma-fag:v1`. Omdøping er en migrering, ikke en
  tekstendring (kartleggingen del 12).
- **`auth:ms:` og `auth:homey:` ligger utenfor `fh:` med vilje** – prefikset
  er en tilgangsgrense. Flytt dem aldri inn (del 30).
- **`functions/_middleware.js`** – portvakten mot `.pages.dev` (del 27).
- **Innlogging og hemmeligheter:** `functions/api/ms.js`, `homey.js`,
  `claude.js`, Azure-/Cloudflare-oppsett og secrets. Aldri logg eller lagre
  tokener, klienthemmeligheter eller WebRTC-tilbud.
- **Ikke døp om eller flytt sidene** (f.eks. `dashboard.html`) – bokmerker,
  snarveier og returadresser i Azure peker på dem. Nye sider er greit.
- **Oppslagstabellene** `BUTIKK_LOGO`, `VARE_BILDE`, `ALLE_BUTIKKER` – de
  utvides, de regenereres ikke. Og bildene i `vareikoner/`, `butikklogoer/`
  og `bilder/`.
- **`.gitattributes`** (låste LF-linjeskift).
- **Paletten i `felles-rot.css`** er kontrastregnet mot WCAG – ikke gjør
  flatene mørkere uten å regne på nytt (del 17).
- **Dokumentene i `dokumenter/`** – endres bare når Magne ber om det.
