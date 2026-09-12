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
    description: 'Lekser og prøver for Andrea eller Emma, med fag og frist. Virker fra '
               + 'hvilken som helst side. Uten argument gis begge barna. Endringer må '
               + 'gjøres på barnets egen side.',
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
  }
];

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
          return { fag: fagNavn[l.fagId] || '(ukjent fag)', tekst: l.tekst,
                   frist: l.frist || null, ferdig: !!l.ferdig };
        }),
        prover: ((d && d.prover) || []).slice(0, 20).map(function(p){
          return { fag: fagNavn[p.fagId] || '(ukjent fag)', type: p.type || 'prøve',
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

  /* ---------------- Kalenderen ---------------- */
  if(navn === 'les_kalender'){
    if(!lesAltHarToken()){
      throw new Error('Denne siden kan ikke snakke med Microsoft. Si det, og '
                    + 'foreslå kalendersiden.');
    }
    return await lesAltKalender(arg);
  }

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
  /* Etter tur, ikke alle paa én gang: samtidige kall mot Graph gir 429,
     og det var det som fikk avtaler til aa forsvinne i kalenderen. */
  for(const c of kal){
    try{
      const d = await lesAltGraph('/me/calendars/' + encodeURIComponent(c.id) + q);
      ((d && d.value) || []).forEach(function(e){
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
    }catch(e){
      /* En kalender som ikke svarte er noe helt annet enn en som er tom. */
      feilet.push(c.name);
    }
  }
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
  const alle = lesAltHarToken()
    ? LESALT_VERKTOY.concat([LESALT_KAL_VERKTOY])
    : LESALT_VERKTOY;
  return alle.filter(function(v){ return !tatt[v.name]; });
}
