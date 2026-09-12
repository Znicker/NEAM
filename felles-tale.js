/* ============================================================
   Neam - stemmen
   ------------------------------------------------------------
   Laget 13. september 2026. Talesyntesen i nettleseren, samlet
   ett sted, saa den kan brukes baade av Neambot-panelet og av
   diktatsida.

   DETTE ER BARE HALVE VEIEN: ut, ikke inn. Neam kan lese opp det
   han skriver. Aa snakke TIL ham - trykk-og-snakk, og bilmodus -
   er en annen jobb, og den staar igjen.

   AA FINNE DEN NORSKE STEMMEN er verre enn det burde vaere. Alt
   under er lekser fra diktatsida, der det ble proevd paa ekte
   enheter:

   - Lista er tom rett etter at sida er lastet, og fylles i sitt
     eget tempo. `onvoiceschanged` fyrer paa noen enheter og ikke
     paa andre, saa vi spoer om igjen med korte mellomrom i stedet
     for aa stole paa hendelsen. Paa noen enheter kommer lista
     foerst ETTER det foerste kallet til speak().
   - Sprakkoden skrives ulikt: «nb-NO» i iOS, «nb_NO» i enkelte
     Android-nettlesere, «no-NO» i eldre Windows-stemmer.
   - Plattformene legger ut flere varianter av samme stemme, og
     den som staar foerst er sjelden den beste. «Premium»,
     «Enhanced», «Neural» og «Natural» er de nedlastede
     utgavene; «Compact» er den minste og mest metalliske.

   iOS KREVER EN BRUKERHANDLING bak den foerste ytringen. Derfor
   skrur man stemmen PAA med et trykk, og det trykket sier noe -
   se taleSkruPaa(). Uten en ytring i selve trykket staar
   synteseren laast resten av oekten.

   VAKTHUNDEN i taleLes() er ikke pynt: i Safari hender det at
   `onend` aldri fyrer, og da ville en kjede staatt bom stille
   uten at noe saa galt ut.

   ADVARSEL FOER DEN LASTES PAA DIKTATSIDA: andrea-diktat.html har
   sine EGNE `TALE_TONE`, `taleNr` og `taleStottes` fra den gangen
   talen bare fantes der. To `const` med samme navn er en
   SyntaxError som tar ned HELE skriptet i sida, uten at noe peker
   paa aarsaken - samme felle som `SIK_MERKE_V` i sikkerhet.html.
   Skal diktatsida over paa denne fila, maa dens egne tre fjernes
   i samme commit.
   ============================================================ */

const TALE_LAGER = 'neam-tale';          /* av/paa, per enhet */
const TALE_STEMME = 'neam-tale-stemme';  /* valgt stemme, per enhet */

const TALE_FART = 0.98;
const TALE_TONE = 1.0;

let taleStottes = ('speechSynthesis' in window);
let taleStemme = null;
let taleStemmer = [];        /* de norske, rangert */
let taleAlle = [];           /* alt enheten har - til diagnose */
let taleNr = 0;              /* sekvensnummer, se taleStopp() */

function taleNormLang(v){
  return String((v && v.lang) || '').replace('_', '-').toLowerCase();
}

function taleErNorsk(v){
  return /^(nb|nn|no)(-|$)/.test(taleNormLang(v))
      || /norsk|norwegian|bokm/i.test(String((v && v.name) || ''));
}

function taleSkaar(v){
  const n = String((v && v.name) || '').toLowerCase();
  let s = 0;
  if(/premium|enhanced|neural|natural/.test(n)) s += 6;
  if(/google/.test(n)) s += 3;
  if(/siri/.test(n)) s += 2;
  if(/compact/.test(n)) s -= 4;
  if(/^nb(-|$)/.test(taleNormLang(v))) s += 1;   /* bokmaal foer nynorsk */
  return s;
}

function taleFinnStemme(){
  if(!taleStottes) return;
  try{ taleAlle = window.speechSynthesis.getVoices() || []; }catch(e){ taleAlle = []; }
  taleStemmer = taleAlle.filter(taleErNorsk).sort(function(a, b){
    return taleSkaar(b) - taleSkaar(a);
  });
  let valgt = null;
  try{ valgt = localStorage.getItem(TALE_STEMME); }catch(e){}
  taleStemme = (valgt && taleStemmer.filter(function(v){
      return (v.voiceURI || v.name) === valgt;
    })[0]) || taleStemmer[0] || null;
}

/* Spoer om igjen til lista dukker opp. Ti ganger med 300 ms er tre
   sekunder - lenger enn noen enhet trenger. */
function taleLetEtterStemme(naarFerdig){
  let forsok = 0;
  (function igjen(){
    taleFinnStemme();
    if(taleStemme || forsok >= 10){ if(naarFerdig) naarFerdig(); return; }
    forsok++;
    setTimeout(igjen, 300);
  })();
}

if(taleStottes){
  taleFinnStemme();
  window.speechSynthesis.onvoiceschanged = taleFinnStemme;
}

/* ------------------------------------------------------------
   Av og på
   ------------------------------------------------------------ */

function taleErPaa(){
  try{ return localStorage.getItem(TALE_LAGER) === '1'; }catch(e){ return false; }
}

/* MAA kalles fra et trykk. Den korte ytringen er ikke en hilsen for
   hyggens skyld - den laaser opp synteseren paa iOS, som ellers nekter
   aa si noe resten av oekten. */
function taleSkruPaa(){
  try{ localStorage.setItem(TALE_LAGER, '1'); }catch(e){}
  taleFinnStemme();
  taleLes('Stemmen er på.');
  taleLetEtterStemme();
}

function taleSkruAv(){
  try{ localStorage.setItem(TALE_LAGER, '0'); }catch(e){}
  taleStopp();
}

function taleStopp(){
  taleNr++;
  if(taleStottes){ try{ window.speechSynthesis.cancel(); }catch(e){} }
}

/* ------------------------------------------------------------
   Selve opplesningen
   ------------------------------------------------------------ */

function taleLes(tekst, fart){
  return new Promise(function(ok){
    const t = String(tekst || '').trim();
    if(!taleStottes || !t){ ok(false); return; }
    const y = new SpeechSynthesisUtterance(t);
    /* Finner vi ingen norsk stemme i lista, setter vi likevel spraaket og
       lar nettleseren velge. En stum knapp er verre enn en uttale som
       bommer. */
    if(taleStemme) y.voice = taleStemme;
    y.lang = taleStemme ? taleStemme.lang : 'nb-NO';
    y.rate = fart || TALE_FART;
    y.pitch = TALE_TONE;
    let ferdig = false;
    const slutt = function(){
      if(ferdig) return;
      ferdig = true;
      clearTimeout(vakt);
      ok(true);
    };
    y.onend = slutt;
    y.onerror = slutt;
    const vakt = setTimeout(slutt, Math.max(3500, t.length * 160 / (y.rate || 1)));
    try{ window.speechSynthesis.speak(y); }catch(e){ slutt(); }
  });
}

/* ------------------------------------------------------------
   Fra skjermtekst til noe som kan sies
   ------------------------------------------------------------
   Et svar fra Neam er skrevet for oeyet: punktlister, fete ord,
   kodesnutter, lenker. Lest opp tegn for tegn blir det uleselig -
   «stjerne stjerne melk stjerne stjerne».

   Vi tar derfor bort merkingen, ikke innholdet. Kodeblokker gaar
   ut i sin helhet: en kommando lest hoeyt hjelper ingen, og den
   staar paa skjermen.
   ------------------------------------------------------------ */
function taleRydd(tekst){
  let t = String(tekst || '');
  t = t.replace(/```[\s\S]*?```/g, '\n');        /* kodeblokker ut */
  t = t.replace(/`([^`]*)`/g, '$1');            /* kode i linja: behold ordet */
  t = t.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ');  /* bilder */
  t = t.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');/* lenker: behold teksten */
  t = t.replace(/^\s{0,3}#{1,6}\s*/gm, '');     /* overskrifter */
  t = t.replace(/\*\*([^*]+)\*\*/g, '$1');
  t = t.replace(/(^|\W)\*([^*\n]+)\*/g, '$1$2');
  t = t.replace(/(^|\W)_([^_\n]+)_/g, '$1$2');
  /* Punkter blir til pauser. Uten dette renner lista sammen til én
     setning, og man hoerer ikke hvor det ene slutter og det neste
     begynner. */
  t = t.replace(/^\s*[-*·]\s+/gm, '');
  t = t.replace(/^\s*\d+[.)]\s+/gm, '');
  t = t.replace(/\|/g, ' ');                    /* tabellstreker */
  t = t.replace(/^[\s\-:|]+$/gm, '');           /* tabellskiller */
  t = t.replace(/\n{2,}/g, '. ');
  t = t.replace(/\n/g, '. ');
  /* Et avsnitt som alt sluttet med punktum faar ikke ett til. «oppdatert..»
     leses av noen stemmer som et opphold, av andre som ingenting - men
     skrevet er det uansett feil, og teksten kan bli vist. */
  t = t.replace(/([.!?:])\s*\.\s*/g, '$1 ');
  t = t.replace(/\.\s*\.\s*(\.\s*)+/g, '. ');   /* opphopede punktum */
  /* Et punktum som staar alene mellom mellomrom kommer av en linje som
     ble tom - en tabellskiller eller en kodeblokk vi tok bort. Det er
     ikke en setning, og det hoeres som en hikke. */
  t = t.replace(/\s+\.\s+/g, '. ');
  t = t.replace(/\s{2,}/g, ' ');
  return t.trim();
}

/* Et langt svar skal ikke leses i sin helhet. Den som hoerer paa har
   skjermen foran seg, og en opplesning som varer i to minutter er noe
   man avbryter, ikke noe man foelger. Vi tar begynnelsen og stopper ved
   en setningsslutt. */
const TALE_MAKS = 700;

function taleKort(tekst){
  const t = taleRydd(tekst);
  if(t.length <= TALE_MAKS) return t;
  const bit = t.slice(0, TALE_MAKS);
  const i = Math.max(bit.lastIndexOf('. '), bit.lastIndexOf('! '), bit.lastIndexOf('? '));
  return (i > 200 ? bit.slice(0, i + 1) : bit) + ' Resten står på skjermen.';
}

/* Leser et svar, hvis stemmen er paa. Sekvensnummeret gjoer at et nytt
   svar avbryter det forrige i stedet for aa stille seg i koe - samme
   regel som ellers i huset: kast det som er utdatert. */
async function taleSvar(tekst){
  if(!taleErPaa()) return;
  const t = taleKort(tekst);
  if(!t) return;
  taleStopp();
  const mitt = taleNr;
  if(!taleStemme) taleFinnStemme();
  if(mitt !== taleNr) return;
  await taleLes(t);
}
