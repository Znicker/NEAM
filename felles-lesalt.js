/* ============================================================
   Neam - les overalt
   ------------------------------------------------------------
   Laget 13. september 2026.

   «Les overalt, skriv der du staar» har vaert regelen for
   datalaget siden det ble laget, men bare den andre halvdelen
   var bygget: hver side kunne skrive sitt eget, og ingen side
   kunne lese noen andres. Sto du i kalenderen, visste Neam ikke
   at det sto melk paa handlelista.

   Denne fila er den foerste halvdelen. Den gir LESEVERKTOEY mot
   alle appene som bor i KV, og de virker likt uansett hvilken
   side de lastes paa.

   HVA SOM IKKE LIGGER HER, OG HVORFOR: handlelista,
   oppskriftsboka og ukemenyen kan alt leses fra hvor som helst -
   de ligger i HUS_VERKTOY i felles-data.js, og har gjort det
   lenge. Foerste utgave av denne fila bygget tre av dem om igjen
   uten aa vite det, og resultatet var tjue verktoey der fire var
   nesten-duplikater: `les_handleliste` ved siden av
   `les_husets_handleliste`, `les_oppskrifter` ved siden av
   `finn_oppskrift`. To verktoey som gjoer nesten det samme er
   verre enn ett som gjoer litt for lite - Neam velger ett av dem,
   og hvilket er tilfeldig.

   Denne fila daekker derfor bare det som IKKE fantes fra foer:
   skolearbeidet, diktatordene og kalenderen.

   INGENTING HER SKRIVER. Det er ikke en forglemmelse - det er
   hele poenget. Skriving krever at man kjenner appens egne
   regler: hvilken handletur som er aapen, hvordan en lekse
   knyttes til et fag, hva som skjer med setningene naar et
   diktatord byttes. De reglene bor i sidene, og det er der de
   skal bli. En skriving herfra ville vaert en andre sannhet om
   hvordan hver app virker.

   DOBBELTE NAVN: en side som alt har sitt eget les_handleliste
   skal ikke faa to. Kallstedet sender inn sine egne verktoey, og
   lesAltVerktoy() tar bort dem som kolliderer - sidens egen
   vinner alltid, fordi den leser fra minnet og ser det som
   staar paa skjermen akkurat naa.

   BRUK:
     window.neamVerktoy = async function(){
       const egne = MINE_VERKTOY;
       return egne.concat(lesAltVerktoy(egne), HUS_VERKTOY);
     };
     window.neamUtfor = async function(navn, arg){
       const mitt = await minUtfor(navn, arg);   if(mitt) return mitt;
       const alt  = await lesAltUtfor(navn, arg); if(alt) return alt;
       ...
     };

   FORVENTER dataLes() fra felles-data.js, som maa lastes FOER
   denne fila.
   ============================================================ */

/* Noeklene, samlet ett sted. De er spredt over fem sider i dag, og
   naar en av dem endres er dette stedet man ellers ville glemt. */
const LESALT_NOKLER = {
  andreaFag:   'andrea-fag:v1',
  emmaFag:     'emma-fag:v1',
  diktat:      'andrea-diktat:v1'
};

async function lesAltHent(nokkel){
  try{ return await dataLes(nokkel); }
  catch(e){ throw new Error('Fikk ikke lest ' + nokkel + ': ' + (e && e.message)); }
}

/* Barnet bak et navn. «andrea», «Andrea», «hun» naar bare ett barn er
   nevnt - Neam faar begge navnene i verktoeybeskrivelsen, saa dette er
   bare en trygghet mot store bokstaver og mellomrom. */
function lesAltBarn(navn){
  const n = String(navn || '').trim().toLowerCase();
  if(n.indexOf('andrea') === 0) return { navn:'Andrea', nokkel:LESALT_NOKLER.andreaFag };
  if(n.indexOf('emma')   === 0) return { navn:'Emma',   nokkel:LESALT_NOKLER.emmaFag };
  return null;
}

/* ------------------------------------------------------------
   Verktøyene
   ------------------------------------------------------------ */

const LESALT_VERKTOY = [
  {
    name: 'les_skolearbeid',
    description: 'Lekser og prøver for Andrea eller Emma, med fag, frist og id. Virker '
               + 'fra hvilken som helst side. Uten argument gis begge barna.\n\n'
               + 'Id-ene herfra er det endre_lekse, slett_lekse og endre_prove går på. '
               + 'Kjør denne først når noe skal endres.',
    input_schema: {
      type:'object',
      properties:{
        barn: { type:'string', description:'Andrea eller Emma. Utelat for begge.' },
        medFerdige: { type:'boolean', description:'true tar med lekser som er huket av.' }
      },
      required:[]
    }
  },
  {
    name: 'les_diktatord',
    description: 'Diktatordene Andrea øver på, uke for uke, med resultatene hun har fått. '
               + 'Nyeste uke sist.',
    input_schema: {
      type:'object',
      properties:{ antall: { type:'integer', description:'Hvor mange uker bakover. Standard 3.' } },
      required:[]
    }
  },
  {
    name: 'list_skoleplaner',
    description: 'Filene som ligger under «Ukeplaner og filer» på Rolighedens side - '
               + 'Emmas skole - med navn, ukenummer og adresse. Virker fra hvilken '
               + 'som helst side. Bruk dette for å finne HVILKEN ukeplan som er den '
               + 'nyeste før du henter den.\n\n'
               + 'ANDREAS SKOLE ER EN ANNEN. Sandnes legger ut PDF, og den hentes med '
               + '«Hent fra nett» under Ukeplan-knappen på Andrea dash - den kan ikke '
               + 'hentes herfra.',
    input_schema: { type:'object', properties:{}, required:[] }
  },
  {
    name: 'hent_skoleplan',
    description: 'Henter en .docx fra Rolighedens side og gir innholdet som tekst. '
               + 'Virker fra hvilken som helst side. Uten argument hentes den NYESTE '
               + 'ukeplanen for 8. trinn.\n\n'
               + 'Skal du ha en TIMEPLAN eller noe annet enn en ukeplan, send navn '
               + 'eller url fra list_skoleplaner - timeplanene har ikke ukenummer og '
               + 'finnes ikke av søket etter nyeste ukeplan.\n\n'
               + 'Etter dette: sorter leksene på fag og legg dem fram med '
               + 'foreslaa_lekser, som bare finnes på Emma dash. Står du et annet '
               + 'sted, les planen opp og si at innleggingen gjøres der - eller legg '
               + 'inn én lekse av gangen med legg_til_lekse når hun har sagt hva som '
               + 'skal inn.',
    input_schema: {
      type:'object',
      properties:{
        uke:  { type:'integer', description:'Ukenummer. Utelat for den nyeste.' },
        navn: { type:'string', description:'Navnet på fila slik det står i '
                                         + 'list_skoleplaner, for eksempel '
                                         + '«Timeplan, 8C».' },
        url:  { type:'string', description:'Full adresse fra list_skoleplaner. '
                                         + 'Alternativ til navn.' }
      },
      required:[]
    }
  }
];

/* ------------------------------------------------------------
   Skolens side - Roligheden
   ------------------------------------------------------------
   /api/hent gjoer jobben: kommunen sender ingen CORS-hoder, og
   .docx pakkes ut til tekst paa tjeneren. Her er det bare to kall.

   Lista huskes resten av oekten, som paa Emma dash: hent_skoleplan
   slaar opp i den to ganger i samme runde.
   ------------------------------------------------------------ */
let lesAltPlanerHusk = null;

async function lesAltSkolePlaner(){
  if(lesAltPlanerHusk) return lesAltPlanerHusk;
  const r = await fetch('/api/hent?hva=liste', {cache:'no-store'});
  const d = await r.json().catch(function(){ return null; });
  if(!r.ok || !d || d.feil){
    throw new Error((d && d.feil) || ('Fikk ikke tak i skolens side (' + r.status + ').'));
  }
  lesAltPlanerHusk = d.lenker || [];
  return lesAltPlanerHusk;
}

async function lesAltSkoleFil(url){
  const r = await fetch('/api/hent?hva=fil&url=' + encodeURIComponent(url),
                        {cache:'no-store'});
  const d = await r.json().catch(function(){ return null; });
  if(!r.ok || !d || d.feil){
    throw new Error((d && d.feil) || ('Fikk ikke hentet fila (' + r.status + ').'));
  }
  return d;
}

/* ------------------------------------------------------------
   Utførelsen
   ------------------------------------------------------------ */

async function lesAltUtfor(navn, arg){
  arg = arg || {};

  /* ---------------- Skolearbeidet ---------------- */
  if(navn === 'les_skolearbeid'){
    const barn = [];
    if(arg.barn){
      const b = lesAltBarn(arg.barn);
      if(!b) throw new Error('Barnet må være Andrea eller Emma.');
      barn.push(b);
    }else{
      barn.push({ navn:'Andrea', nokkel:LESALT_NOKLER.andreaFag });
      barn.push({ navn:'Emma',   nokkel:LESALT_NOKLER.emmaFag });
    }

    const ut = [];
    for(const b of barn){
      let d = null;
      /* Ett barn som feiler skal ikke ta med seg det andre. En tom liste
         og en liste vi ikke fikk lest er to forskjellige ting. */
      try{ d = await lesAltHent(b.nokkel); }
      catch(e){ ut.push({ barn:b.navn, feil:(e && e.message) || 'ukjent feil' }); continue; }

      const fag = (d && d.fag) || [];
      const fagNavn = {};
      fag.forEach(function(f){ fagNavn[f.id] = f.navn; });

      let lekser = (d && d.lekser) || [];
      if(!arg.medFerdige) lekser = lekser.filter(function(l){ return !l.ferdig; });
      lekser = lekser.slice().sort(function(a, c){
        return String(a.frist || '9999') < String(c.frist || '9999') ? -1 : 1;
      });

      ut.push({
        barn: b.navn,
        lekser: lekser.slice(0, 40).map(function(l){
          /* Id-en MAA vaere med: den er det eneste endre_lekse og
             slett_lekse i felles-skriv.js kan gaa paa naar man staar et
             annet sted enn barnets egen dash. */
          return { id: l.id, fag: fagNavn[l.fagId] || '(ukjent fag)', tekst: l.tekst,
                   frist: l.frist || null, ferdig: !!l.ferdig };
        }),
        prover: ((d && d.prover) || []).slice(0, 20).map(function(p){
          return { id: p.id, fag: fagNavn[p.fagId] || '(ukjent fag)',
                   type: p.type || 'prøve',
                   dato: p.dato || null, karakter: p.karakter || null };
        })
      });
    }
    return { barn: ut };
  }

  /* ---------------- Diktaten ---------------- */
  if(navn === 'les_diktatord'){
    const d = await lesAltHent(LESALT_NOKLER.diktat);
    const lister = (d && Array.isArray(d.lister)) ? d.lister
                 : (d && d.liste) ? [d.liste] : [];
    const runder = (d && d.runder) || [];
    const antall = Math.max(1, Math.min(20, arg.antall || 3));

    return {
      uker: lister.slice(-antall).map(function(l){
        const mine = runder.filter(function(r){ return r.listeId === l.id; });
        const siste = mine.length ? mine[mine.length - 1] : null;
        return {
          uke: l.uke || null,
          aar: l.aar || null,
          ord: (l.ord || []).map(function(o){ return o.ord; }),
          forsok: mine.length,
          /* Hele ordet, eller ingenting - samme regel som diktatsida. */
          siste_riktige: siste
            ? (siste.ord || []).filter(function(o){
                return (o.skrevet || []).join('').trim().toLowerCase()
                     === String(o.ord).toLowerCase();
              }).length
            : null
        };
      })
    };
  }

  /* ---------------- Skolens side ---------------- */
  if(navn === 'list_skoleplaner'){
    const d = await lesAltSkolePlaner();
    return { antall: d.length, planer: d.map(function(l){
      return { navn:l.navn, uke:l.uke, url:l.url };
    })};
  }

  if(navn === 'hent_skoleplan'){
    let url = String(arg.url || '').trim();
    let hvilken = null;

    /* En TIMEPLAN ligger i lista UTEN ukenummer - da er soeket etter
       «nyeste ukeplan» feil sted aa lete. Neam ba om timeplanen og fikk
       «fant ingen ukeplan» i retur, som er sant, men ikke svar. */
    if(!url && arg.navn){
      const planer = await lesAltSkolePlaner();
      const sok = String(arg.navn).trim().toLowerCase();
      const t = planer.filter(function(l){
                  return String(l.navn || '').toLowerCase() === sok; })[0]
             || planer.filter(function(l){
                  return String(l.navn || '').toLowerCase().indexOf(sok) !== -1; })[0];
      if(!t) throw new Error('Fant ingen fil som heter «' + arg.navn + '». '
                           + 'Bruk list_skoleplaner for å se hva som ligger der.');
      url = t.url;
      hvilken = t;
    }

    if(!url){
      const planer = await lesAltSkolePlaner();
      /* «8. trinn» og et ukenummer. Timeplanene ligger i samme liste og
         har ikke uke, saa de faller ut av seg selv. */
      const ukeplaner = planer.filter(function(l){
        return l.uke && /8\.?\s*trinn/i.test(l.navn);
      });
      if(!ukeplaner.length){
        throw new Error('Fant ingen ukeplan for 8. trinn på skolens side. '
                      + 'Bruk list_skoleplaner for å se hva som ligger der.');
      }
      hvilken = arg.uke
        ? ukeplaner.filter(function(l){ return l.uke === Number(arg.uke); })[0]
        : ukeplaner.slice().sort(function(a, b){ return b.uke - a.uke; })[0];
      if(!hvilken){
        throw new Error('Fant ingen ukeplan for uke ' + arg.uke + '. Tilgjengelig: '
                      + ukeplaner.map(function(l){ return l.uke; }).join(', ') + '.');
      }
      url = hvilken.url;
    }

    const d = await lesAltSkoleFil(url);

    /* Ukenummeret staar to steder: i LENKENAVNET og inne i DOKUMENTET.
       Spriker de, er det som regel en gammel fil lastet opp under et nytt
       navn. Vi sier fra om begge tallene i stedet for aa velge ett.

       Bare de foerste 400 tegnene: uketallet staar i overskriften, og
       lenger ned dukker «uke» opp i andre sammenhenger. */
    const topp = String(d.tekst || '').slice(0, 400);
    const iTekst = [];
    const re = /uke\s*(\d{1,2})/gi;
    let m;
    while((m = re.exec(topp)) !== null){
      const u = parseInt(m[1], 10);
      if(u >= 1 && u <= 53 && iTekst.indexOf(u) === -1) iTekst.push(u);
    }
    const fraNavn = hvilken ? hvilken.uke : null;

    return { navn: d.navn,
             ukeFraNavn: fraNavn,
             ukeIDokumentet: iTekst.length ? iTekst : null,
             uketallene_stemmer: (fraNavn && iTekst.length)
               ? (iTekst.indexOf(fraNavn) !== -1) : null,
             tekst: d.tekst };
  }

  /* ---------------- Kalenderen ---------------- */
  if(navn === 'les_kalender'){
    if(!lesAltHarToken()){
      throw new Error('Denne siden kan ikke snakke med Microsoft. Si det, og '
                    + 'foreslå kalendersiden.');
    }
    return await lesAltKalender(arg);
  }

  /* ---------------- Økonomien ---------------- */
  if(LESALT_OK_VERKTOY.some(function(v){ return v.name === navn; })) return await lesAltOkUtfor(navn, arg);

  return null;
}

/* ------------------------------------------------------------
   Kalenderen
   ------------------------------------------------------------
   Den eneste appen som ikke bor i KV. Avtalene ligger hos
   Microsoft og hentes med tokenet til den som er logget inn, saa
   dette verktoeyet virker BARE paa sider som har gyldigToken():
   forsiden, kjoekkendashen, kalenderen, Andrea og Emma.
   Handleliste, oppskrifter og sikkerhet har ingen innlogging mot
   Microsoft, og der tilbys det ikke - et verktoey som ikke kan
   virke er verre enn ingen, fordi Neam lover noe han ikke kan
   holde.

   Vi bruker IKKE graph() fra felles-graph.js: den fila er ikke
   lastet paa alle disse sidene, og hele poenget her er aa virke
   overalt tokenet finnes. Kallet er lite nok til aa staa selv.
   ------------------------------------------------------------ */

const LESALT_GRAPH = 'https://graph.microsoft.com/v1.0';
const LESALT_TZ = 'Europe/Oslo';

function lesAltHarToken(){
  return typeof gyldigToken === 'function';
}

async function lesAltGraph(sti){
  const t = await gyldigToken();
  /* Oekta bor paa tjeneren og lages naar noen logger inn - i praksis paa
     kalendersida. Finnes den ikke, er det DET som mangler, ikke noe ved
     sida man staar paa. Meldingen maa si hvor man gaar. */
  if(!t) throw new Error('Ingen Microsoft-økt akkurat nå. Si at noen må innom '
                       + 'kalendersiden og logge inn - da virker dette overalt etterpå.');
  const r = await fetch(LESALT_GRAPH + sti, {
    headers: { Authorization:'Bearer ' + t,
               Prefer: 'outlook.timezone="' + LESALT_TZ + '"' }
  });
  const tekst = await r.text();
  if(!r.ok){
    let m = 'Microsoft svarte ' + r.status;
    try{ const d = JSON.parse(tekst); m = (d.error && d.error.message) || m; }catch(e){}
    throw new Error(m);
  }
  try{ return JSON.parse(tekst); }
  catch(e){ throw new Error('Uventet svar fra Microsoft.'); }
}

function lesAltKlokke(iso){
  const d = new Date(iso);
  if(isNaN(d)) return null;
  const p = function(n){ return String(n).padStart(2, '0'); };
  return p(d.getHours()) + ':' + p(d.getMinutes());
}

function lesAltDato(iso){
  const d = new Date(iso);
  if(isNaN(d)) return null;
  const p = function(n){ return String(n).padStart(2, '0'); };
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

const LESALT_KAL_VERKTOY = {
  name: 'les_kalender',
  description: 'Avtalene i familiens kalendere i et tidsrom, på tvers av alle kalenderne. '
             + 'Uten argumenter gis de neste sju dagene. Endringer må gjøres på '
             + 'kalendersiden - herfra kan avtalene bare leses.',
  input_schema: {
    type:'object',
    properties:{
      fra: { type:'string', description:'Første dag, på formen 2026-09-08. Utelat for i dag.' },
      til: { type:'string', description:'Siste dag, på formen 2026-09-08. Utelat for sju '
                                      + 'dager fram.' },
      kalender: { type:'string', description:'Navnet på én kalender, for eksempel Emma. '
                                           + 'Utelat for alle.' }
    },
    required:[]
  }
};

async function lesAltKalender(arg){
  const fra = arg.fra ? new Date(arg.fra + 'T00:00:00') : new Date();
  if(isNaN(fra)) throw new Error('Ugyldig fra-dato. Bruk formen 2026-09-08.');
  fra.setHours(0, 0, 0, 0);
  const til = arg.til ? new Date(arg.til + 'T23:59:59')
                      : new Date(fra.getTime() + 7 * 86400000);
  if(isNaN(til)) throw new Error('Ugyldig til-dato. Bruk formen 2026-09-08.');
  if(til < fra) throw new Error('Til-datoen er før fra-datoen.');

  const liste = await lesAltGraph('/me/calendars?$select=id,name&$top=50');
  let kal = (liste && liste.value) || [];
  const sok = String(arg.kalender || '').trim().toLowerCase();
  if(sok){
    kal = kal.filter(function(c){
      return String(c.name || '').toLowerCase().indexOf(sok) !== -1;
    });
    if(!kal.length) throw new Error('Fant ingen kalender som heter «' + arg.kalender + '».');
  }
  /* Et tak paa hvor mange kalendere som spoerres. Uten det blir ett
     spoersmaal til tolv kall mot Microsoft, og da kommer strupingen. */
  kal = kal.slice(0, 10);

  const q = '/calendarView?startDateTime=' + fra.toISOString()
          + '&endDateTime=' + til.toISOString()
          + '&$orderby=start/dateTime&$top=100'
          + '&$select=id,subject,isAllDay,start,end,location,body,seriesMasterId,type';

  const ut = [];
  const feilet = [];
  /* SEKS OM GANGEN - ikke alle paa én gang, og ikke etter tur.

     Samtidige kall mot Graph gir 429, og det var DET som fikk avtaler
     til aa forsvinne i kalenderen. Grensa staar derfor igjen, men den
     er ikke 1: seks er tallet kalendersida alt kjoerer med (se
     kartleggingen del 10). Merk forskjellen paa de to stedene -
     kalendersida gaar gjennom graph() i felles-graph.js, som proever om
     igjen ved 429. lesAltGraph her gjoer IKKE det, saa en kalender som
     blir strupet faller rett i `feilet`. Derfor skal dette ikke opp
     uten at gjentakelsen kommer paa plass foerst.

     Maalt 16. september 2026: elleve kall etter tur var ca. 2,8 sek av
     en svartid paa sju, hvert enkelt 160-520 ms. I bolker blir det to
     runder à det tregeste kallet. allSettled: én kalender som feiler
     velter ikke de andre, og svarene leses i kalenderrekkefoelge under,
     saa utfallet er det samme som da de gikk etter tur.

     12. oktober 2026: seks var for mange. Outlook taaler 4 samtidige
     kall per postkasse, og alle kalenderne bor hos sys - kalendersida
     fikk 429 paa to av seks ved hver oppdatering. Her ble de to bare
     borte i `feilet`. Naa fire om gangen som en koe: et ledig spor tar
     neste kalender med en gang, i stedet for aa vente paa hele bolken. */
  const GRENSE = 4;
  const svar = new Array(kal.length);
  let lesAltNeste = 0;
  async function lesAltSpor(){
    while(lesAltNeste < kal.length){
      const i = lesAltNeste++;
      try{
        svar[i] = { status:'fulfilled', value: await lesAltGraph(
          '/me/calendars/' + encodeURIComponent(kal[i].id) + q) };
      }catch(err){
        svar[i] = { status:'rejected', reason:err };
      }
    }
  }
  const lesAltKjoerer = [];
  for(let k = 0; k < Math.min(GRENSE, kal.length); k++) lesAltKjoerer.push(lesAltSpor());
  await Promise.all(lesAltKjoerer);

  kal.forEach(function(c, i){
    const r = svar[i];
    if(r.status !== 'fulfilled'){
      /* En kalender som ikke svarte er noe helt annet enn en som er tom. */
      feilet.push(c.name);
      return;
    }
    ((r.value && r.value.value) || []).forEach(function(e){
      ut.push({
        /* Id-ene MAA vaere med: de er det eneste endre_avtale og
           slett_avtale kan gaa paa naar man staar et annet sted enn
           kalendersida, der det ikke finnes noen innlest liste. */
        id: e.id,
        kalender_id: c.id,
        kalender: c.name,
        tittel: e.subject || '(uten tittel)',
        dato: lesAltDato(e.start.dateTime + (e.start.timeZone === 'UTC' ? 'Z' : '')),
        fra: e.isAllDay ? null
           : lesAltKlokke(e.start.dateTime + (e.start.timeZone === 'UTC' ? 'Z' : '')),
        til: e.isAllDay ? null
           : lesAltKlokke(e.end.dateTime + (e.end.timeZone === 'UTC' ? 'Z' : '')),
        hele_dagen: !!e.isAllDay,
        sted: (e.location && e.location.displayName) || null,
        notat: (e.body && e.body.content)
          ? String(e.body.content).replace(/<[^>]*>/g, ' ')
              .replace(/\s+/g, ' ').trim().slice(0, 300) || null
          : null,
        serie: !!e.seriesMasterId || e.type === 'occurrence' || e.type === 'exception'
      });
    });
  });
  ut.sort(function(a, b){
    return (a.dato + (a.fra || '')) < (b.dato + (b.fra || '')) ? -1 : 1;
  });

  return { antall: ut.length, avtaler: ut.slice(0, 100),
           avkortet: ut.length > 100, kalendere_som_feilet: feilet };
}

/* Verktoeyene sida ikke alt har selv. Sidens egne vinner: de leser fra
   minnet og ser det som staar paa skjermen naa, mens disse gaar til KV
   og kan ligge inntil et minutt bak. */
function lesAltVerktoy(egne){
  const tatt = {};
  (egne || []).forEach(function(v){ if(v && v.name) tatt[v.name] = true; });
  let alle = lesAltHarToken()
    ? LESALT_VERKTOY.concat([LESALT_KAL_VERKTOY])
    : LESALT_VERKTOY;
  /* Økonomien bare for dem bank-funksjonen slipper inn - se under. */
  if(lesAltOkonomiTillatt()) alle = alle.concat(LESALT_OK_VERKTOY);
  return alle.filter(function(v){ return !tatt[v.name]; });
}

/* ------------------------------------------------------------
   Økonomien (6. november 2026)
   ------------------------------------------------------------
   Neam skal kunne svare på økonomien fra hvilken som helst side -
   «samme Neam» for Magne, Nina og sys, men ikke for kjøkkenskjermen
   og ikke for barna (Magne, 6. november). Grensen er bank-funksjonen
   (TILGANG i functions/api/bank/[[sti]].js): den sjekker det signerte
   Access-beviset og nekter alle andre uansett hva sida tror. Her
   spoerres den én gang ved lasting (?hvem=1), og verktoeyene vises
   bare naar svaret er ja - et verktoey som ikke kan virke, er verre
   enn ingen.

   Det som leses sist, huskes i lesAltOkSist, saa bekreftelsene i
   felles-skriv.js kan vise navn og beloep i stedet for id-er. */
let lesAltOkTilgang = false;
const lesAltOkSist = { innboks:{}, budsjett:null };
(function(){
  try{
    fetch('/api/bank?hvem=1', { credentials:'same-origin', cache:'no-store' })
      .then(function(r){ return r.json(); })
      .then(function(d){ lesAltOkTilgang = !!(d && d.voksen); })
      .catch(function(){});
  }catch(e){}
})();
function lesAltOkonomiTillatt(){ return lesAltOkTilgang; }

async function lesAltBank(sti){
  const r = await fetch('/api/bank' + sti, { credentials:'same-origin', cache:'no-store' });
  let d = null;
  try{ d = await r.json(); }catch(e){}
  if(!d) throw new Error('Fikk ikke svar fra økonomien.');
  if(!d.ok) throw new Error(d.feil || 'Økonomien svarte ikke.');
  return d;
}
function lesAltOkMnd(m){
  return /^\d{4}-\d{2}$/.test(String(m || '')) ? m : new Date().toISOString().slice(0, 7);
}
/* Budsjettet for en maaned: maanedens egen kopi, ellers standarden. */
function lesAltOkBudFor(b, m){ return (b.maaneder && b.maaneder[m]) || b.standard || {}; }

const LESALT_OK_VERKTOY = [
  {
    name: 'les_okonomi_maaned',
    description: 'Husholdningsbudsjettet mot regnskapet for én måned: per gruppe (Bolig, Mat …) og post, '
               + 'med budsjett, faktisk og avvik, og summene for inntekter, utgifter, sparing og overskudd. '
               + 'Beløp i kroner; utgifter og inntekter begge som positive tall. Regnskapet er bare '
               + 'GODKJENTE poster - det som ligger i innboksen, er ikke med. Bruk denne til «hvordan '
               + 'ligger vi an», «er vi over på mat» o.l.',
    input_schema: { type:'object', properties:{
      mnd: { type:'string', description:'Måneden som ÅÅÅÅ-MM. Utelat for måneden som pågår.' }
    }, required:[] }
  },
  {
    name: 'les_okonomi_foringer',
    description: 'De godkjente føringene bak ett tall i regnskapet: hvert kjøp med dato, sted, kilde og '
               + 'beløp. Kategorien kan være en gruppe («Mat»), en post («Mat · Dagligvare») eller en '
               + 'linje. Føringer med kvittering har id som les_okonomi_kvittering tar.',
    input_schema: { type:'object', properties:{
      kategori: { type:'string', description:'Gruppe, post eller linje, skrevet som i les_okonomi_maaned.' },
      mnd: { type:'string', description:'Måneden som ÅÅÅÅ-MM. Utelat for måneden som pågår.' }
    }, required:['kategori'] }
  },
  {
    name: 'les_okonomi_innboks',
    description: 'Postene som venter på godkjenning i økonomien, med id, dato, sted, beløp (negativt = '
               + 'penger ut), kategorien Neam foreslår og hvor sikker forslaget er. Gir også lista over '
               + 'gyldige kategorier. Kjør denne før godkjenn_okonomi_poster.',
    input_schema: { type:'object', properties:{}, required:[] }
  },
  {
    name: 'les_okonomi_kontoer',
    description: 'Kontoene i DNB med eget navn, rolle (felles, sparing, magne, nina …) og saldo.',
    input_schema: { type:'object', properties:{}, required:[] }
  },
  {
    name: 'les_okonomi_aar',
    description: 'Hele perioden måned for måned: utgifter mot budsjett, inntekter og sparing. Til '
               + 'spørsmål om utvikling over tid.',
    input_schema: { type:'object', properties:{}, required:[] }
  },
  {
    name: 'les_okonomi_kvittering',
    description: 'Varelinjene på én kvittering (Trumf eller lest fra bilde), med navn, antall og beløp. '
               + 'Id-en kommer fra les_okonomi_innboks eller les_okonomi_foringer.',
    input_schema: { type:'object', properties:{
      id: { type:'string', description:'Postens id.' }
    }, required:['id'] }
  }
];

async function lesAltOkUtfor(navn, arg){
  arg = arg || {};
  if(!lesAltOkonomiTillatt()) throw new Error('Økonomien er ikke åpnet for denne innloggingen.');
  const kr = function(n){ return Math.round(Number(n) || 0); };

  if(navn === 'les_okonomi_maaned'){
    const mnd = lesAltOkMnd(arg.mnd);
    const b = await lesAltBank('?hva=budsjett'), r = await lesAltBank('?hva=regnskap&mnd=' + mnd);
    const bud = lesAltOkBudFor(b, mnd), reg = r.regnskap || {};
    const kat = b.kategorier || [];
    const linjer = function(p){ return kat.filter(function(k){ return k.indexOf(p + ' · ') === 0; }); };
    const sum = function(kilde, p){ return linjer(p).reduce(function(s, l){ return s + (kilde[l] || 0); }, kilde[p] || 0); };
    const grupper = {}, rekke = [];
    let inn = 0, ut = 0, spar = 0, innB = 0, utB = 0, sparB = 0;
    kat.filter(function(k){ return k.split(' · ').length === 2; }).forEach(function(p){
      const g = p.split(' · ')[0], fb = sum(bud, p), ff = sum(reg, p);
      if(g === 'Inntekter'){ inn += ff; innB += fb; }
      else if(g === 'Sparing'){ spar += ff; sparB += fb; }
      else if(g !== 'Utenfor budsjett'){ ut += ff; utB += fb; }
      if(!fb && !ff) return;
      if(!grupper[g]){ grupper[g] = { gruppe:g, budsjett:0, faktisk:0, poster:[] }; rekke.push(g); }
      grupper[g].budsjett += fb; grupper[g].faktisk += ff;
      grupper[g].poster.push({ post:p, budsjett:kr(fb), faktisk:kr(ff), avvik:kr(ff - fb) });
    });
    rekke.forEach(function(g){ grupper[g].budsjett = kr(grupper[g].budsjett); grupper[g].faktisk = kr(grupper[g].faktisk); grupper[g].avvik = grupper[g].faktisk - grupper[g].budsjett; });
    const naa = new Date(), d = new Date(mnd + '-01T12:00:00');
    const dager = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    lesAltOkSist.budsjett = { maal:mnd, verdier:Object.assign({}, bud) };
    return {
      mnd:mnd, pagaar:mnd === naa.toISOString().slice(0, 7),
      dager_igjen:mnd === naa.toISOString().slice(0, 7) ? dager - naa.getDate() : 0,
      budsjett:b.maaneder && b.maaneder[mnd] ? 'månedens eget budsjett' : 'standardbudsjettet',
      godkjente_poster:r.poster,
      summer:{ inntekter:kr(inn), utgifter:kr(ut), sparing:kr(spar), overskudd:kr(inn - ut - spar),
               budsjett_inntekter:kr(innB), budsjett_utgifter:kr(utB), budsjett_sparing:kr(sparB) },
      grupper:rekke.map(function(g){ return grupper[g]; })
    };
  }

  if(navn === 'les_okonomi_foringer'){
    const mnd = lesAltOkMnd(arg.mnd), kat = String(arg.kategori || '').trim();
    if(!kat) throw new Error('Mangler kategori.');
    const r = await lesAltBank('?hva=foringer&mnd=' + mnd + '&kategori=' + encodeURIComponent(kat));
    const liste = (r.foringer || []).map(function(f){
      return { id:f.id, dato:f.dato, sted:f.tekst, kilde:f.kilde + (f.betaltFra ? ', betalt fra ' + f.betaltFra : ''),
               kategori:f.kategori, belop:f.belop, kvittering:!!f.harKvittering, del_av_kvittering:!!f.del };
    });
    return { mnd:mnd, kategori:kat, antall:liste.length, sum:Math.round(liste.reduce(function(s, f){ return s + f.belop; }, 0) * 100) / 100,
             foringer:liste.slice(0, 80), avkortet:liste.length > 80 };
  }

  if(navn === 'les_okonomi_innboks'){
    const r = await lesAltBank('?hva=innboks');
    lesAltOkSist.innboks = {};
    const poster = (r.poster || []).map(function(p){
      const sted = p.motpart || p.tekst || 'Uten tekst';
      lesAltOkSist.innboks[p.id] = { sted:sted, dato:p.dato, belop:p.belop };
      return { id:p.id, dato:p.dato, sted:sted, tekst:p.tekst && p.tekst !== sted ? p.tekst : undefined, belop:p.belop,
               kilde:p.fra ? (p.fra === 'trumf' ? 'Trumf-kvittering' : 'kvittering fra bilde') : (p.kontoNavn || 'bank'),
               kategori:p.kategori || '', forslag:!p.kategori ? 'mangler kategori' : p.kilde === 'ai-usikker' ? 'Neam er usikker' : 'Neam er sikker',
               mulig_dobbel:!!p.mulDobbel, kvittering:!!p.fra };
    });
    return { antall:poster.length, poster:poster.slice(0, 60), avkortet:poster.length > 60,
             kategorier:(r.kategorier || []).filter(function(k){ return k.split(' · ').length >= 2; }) };
  }

  if(navn === 'les_okonomi_kontoer'){
    const r = await lesAltBank('?hva=kontoer');
    return { hentet:new Date(r.hentet).toISOString(), kontoer:(r.kontoer || []).filter(function(k){ return k.rolle !== 'ignorer'; })
      .map(function(k){ return { navn:k.navn, rolle:k.rolle || 'uten rolle', saldo:typeof k.saldo === 'number' ? k.saldo : null, feil:k.feil || undefined }; }) };
  }

  if(navn === 'les_okonomi_aar'){
    const b = await lesAltBank('?hva=budsjett'), r = await lesAltBank('?hva=regnskap-aar');
    const gr = function(k){ return k.split(' · ')[0]; };
    const mnder = Object.keys(r.maaneder || {}).sort();
    return { maaneder:mnder.map(function(m){
      const x = r.maaneder[m], bud = lesAltOkBudFor(b, m);
      const s = function(f, kilde){ return kr(Object.keys(kilde).filter(f).reduce(function(t, k){ return t + kilde[k]; }, 0)); };
      const utgift = function(k){ return gr(k) !== 'Inntekter' && gr(k) !== 'Sparing' && gr(k) !== 'Utenfor budsjett'; };
      return { mnd:m, utgifter:s(utgift, x), budsjett_utgifter:s(utgift, bud),
               inntekter:s(function(k){ return gr(k) === 'Inntekter'; }, x), sparing:s(function(k){ return gr(k) === 'Sparing'; }, x) };
    }) };
  }

  if(navn === 'les_okonomi_kvittering'){
    const id = String(arg.id || '');
    if(!id) throw new Error('Mangler id.');
    const r = await lesAltBank('?hva=kvittering&id=' + encodeURIComponent(id));
    return { id:id, linjer:(r.linjer || []).map(function(l){
      return { navn:l.navn, antall:l.antall, belop:Math.round(((l.belop || 0) + (l.rabatt || 0)) * 100) / 100 }; }) };
  }

  throw new Error('Ukjent økonomiverktøy: ' + navn);
}
