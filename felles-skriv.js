/* ============================================================
   Neam - skriving paa tvers, og navigasjon
   ------------------------------------------------------------
   Laget 13. september 2026. Den andre halvdelen av «les overalt,
   skriv der du staar» - eller rettere: det ene unntaket fra den.

   HVORFOR SAA FAA VERKTOEY HER: skriving krever appens egne
   regler, og de bor i sidene. Hvilken handletur som er aapen,
   hvordan en vare slaas sammen med en som staar der fra foer,
   hva varekatalogen har laert - alt det ligger i
   handleliste.html og skal bli der. Denne fila gjoer derfor ÉN
   ting mot handlelista: legger en vare paa den, med akkurat de
   samme feltene sida selv skriver. Alt annet - fjerne, endre,
   huke av, flytte mellom turer - hoerer hjemme paa sida.

   FELTNAVNENE ER SJEKKET MOT SIDA, ikke gjettet. Det er en dyrt
   kjoept lekse: foerste utgave av leselaget leste `vare`,
   `mengde` og `type`, og de finnes ikke - varen heter `name`,
   mengden ligger delt i `count`/`amt`/`unit`, og varetypen heter
   `cat`. En lesing som bommer gir tomme rader. En SKRIVING som
   bommer lager en rad sida ikke kan vise, og den blir liggende.

   Feltlista under MAA holdes lik med neamLeggTilVarer() og
   saveItem() i handleliste.html. Endres den der, endres den her.

   OM SAMTIDIGHET: sida lagrer hele objektet i én skriving, uten
   fletting. Staar handlelista aapen et annet sted mens vi skriver
   her, og lagrer den etterpaa, forsvinner var vare. Vi leser
   derfor rett foer vi skriver, saa vinduet er saa smalt som det
   lar seg gjoere - men det kan ikke lukkes herfra. Det er sidas
   lagring som maatte flette, og det er en annen jobb.

   FORVENTER dataLes() og dataSkriv() fra felles-data.js.
   ============================================================ */

const SKRIV_HANDLELISTE = 'handleliste:v1';
const SKRIV_KATALOG     = 'vare-katalog';

/* Samme sett som handleliste.html. Ikke utvid uten at begge endres. */
const SKRIV_VARETYPER = [
  'Frukt','Grønnsaker','Kjøtt','Fisk og sjømat','Meieri','Pålegg',
  'Brød og bakevarer','Tørrvarer','Hermetikk','Krydder og saus',
  'Frysevarer','Snacks','Drikke','Annet'
];

/* Id-ene foelger sidas form: prefiks, tid, teller, litt tilfeldig. */
let skrivTeller = 0;
function skrivId(prefiks){
  return prefiks + Date.now().toString(36) + (skrivTeller++).toString(36)
       + Math.random().toString(36).slice(2, 5);
}

function skrivUke(d){
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));
  const nyttaar = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t - nyttaar) / 86400000 + 1) / 7);
}


/* ------------------------------------------------------------
   Felles for handlelista
   ------------------------------------------------------------ */

/* Handleturen bak et navn, eller den nyeste i omraadet. Samme regel som
   sikreAktivOkt() i sida: den navngitte, ellers den nyeste, ellers en ny.
   `lagNy` styrer om vi har lov til aa lage en. */
function skrivFinnOkt(d, arg, lagNy){
  const omr = arg.omrade === 'annet' ? 'annet' : 'mat';
  const sok = String(arg.handletur || '').trim().toLowerCase();
  if(sok){
    const t = d.okter.filter(function(o){
      return String(o.navn || '').trim().toLowerCase() === sok;
    })[0] || d.okter.filter(function(o){
      return String(o.navn || '').trim().toLowerCase().indexOf(sok) !== -1;
    })[0];
    if(!t) throw new Error('Fant ingen handletur som heter «' + arg.handletur
                         + '». Bruk les_handleliste for navnene.');
    return t;
  }
  const iOmr = d.okter.filter(function(o){ return (o.omrade || 'mat') === omr; })
                      .sort(function(a, b){ return (a.opprettet || 0) - (b.opprettet || 0); });
  /* Den nyeste som IKKE er avsluttet. En avsluttet handletur er historie,
     og nye varer hoerer ikke hjemme der. */
  const aapne = iOmr.filter(function(o){ return !skrivErAvsluttet(o); });
  if(aapne.length) return aapne[aapne.length - 1];
  if(!lagNy){
    throw new Error('Det finnes ingen åpen handletur i ' + (omr === 'annet'
      ? 'Andre varer' : 'Dagligvarer') + '. Lag en med ny_handletur.');
  }
  const okt = { id: skrivId('o'), navn: 'Uke ' + skrivUke(new Date()),
                omrade: omr, startet: false, startTid: null, opprettet: Date.now() };
  d.okter.push(okt);
  return okt;
}

function skrivErAvsluttet(o){
  return !!(o && o.avsluttet && !o.startet);
}

/* Varene i en handletur som ikke er huket av. */
function skrivIgjen(d, okt){
  return d.items.filter(function(v){
    return v && v.oktId === okt.id && !v.done;
  });
}

/* Neste aapne handletur i samme omraade - dit varene flyttes naar en
   handel avsluttes med «flytt». Samme regel som nesteOkt() i sida. */
function skrivNesteOkt(d, okt){
  const liste = d.okter.filter(function(o){
    return (o.omrade || 'mat') === (okt.omrade || 'mat');
  }).sort(function(a, b){ return (a.opprettet || 0) - (b.opprettet || 0); });
  const i = liste.map(function(o){ return o.id; }).indexOf(okt.id);
  if(i === -1) return null;
  return liste.slice(i + 1).filter(function(o){ return !skrivErAvsluttet(o); })[0] || null;
}

/* Varen bak et navn i en handletur. Ukjoepte foerst: ber man om aa fjerne
   «melk» og den staar baade kjoept og ukjoept, er det den ukjoepte man
   mener. */
function skrivFinnVare(d, okt, navn){
  const n = String(navn || '').trim().toLowerCase();
  const iTur = d.items.filter(function(v){
    return v && v.oktId === okt.id && String(v.name || '').trim().toLowerCase() === n;
  });
  return iTur.filter(function(v){ return !v.done; })[0] || iTur[0] || null;
}

/* Naar ingen handletur er oppgitt, er det ikke den NYESTE man mener - det
   er den varen faktisk staar i.

   «Nyeste aapne» er riktig regel naar noe skal LEGGES TIL: da finnes
   varen ikke ennaa, og den skal dit man handler neste gang. Men for aa
   fjerne eller endre er den feil, og maalt feil: melk laa i Uke 38 mens
   Uke 39 var nyest, og «huk av melk» fant ingenting.

   Vi leter derfor gjennom de aapne turene i omraadet, nyeste foerst, og
   tar den foerste som har varen. Er handleturen oppgitt, gjelder bare
   den - da har brukeren sagt hvilken han mener. */
function skrivFinnVareBredt(d, arg, navn){
  if(String(arg.handletur || '').trim()){
    const okt = skrivFinnOkt(d, arg, false);
    return { okt: okt, vare: skrivFinnVare(d, okt, navn) };
  }
  const omr = arg.omrade === 'annet' ? 'annet' : 'mat';
  const aapne = d.okter.filter(function(o){
      return (o.omrade || 'mat') === omr && !skrivErAvsluttet(o);
    }).sort(function(a, b){ return (b.opprettet || 0) - (a.opprettet || 0); });
  for(const o of aapne){
    const v = skrivFinnVare(d, o, navn);
    if(v) return { okt: o, vare: v };
  }
  /* Ikke funnet noe sted. Da svarer vi med den nyeste aapne likevel, saa
     feilmeldingen kan si HVOR vi lette. */
  return { okt: aapne[0] || skrivFinnOkt(d, arg, false), vare: null };
}


/* ------------------------------------------------------------
   Kalenderen
   ------------------------------------------------------------
   Avtalene bor hos Microsoft, ikke i KV. Vi gaar gjennom
   lesAltGraph() i felles-lesalt.js - den henter tokenet fra
   gyldigToken() og virker paa alle sidene som har et. Begge
   filene lastes overalt, saa koblingen er trygg; den er nevnt her
   fordi den ellers ville vaert usynlig.

   TRE TING ER VERDT AA VITE:

   1. SERIER KREVER OMFANG. Graph tar imot baade PATCH og DELETE
      paa en enkelt forekomst - den foerste lager et unntak, den
      andre avlyser den ene dagen. Det farlige er tvetydigheten:
      «flytt fotballtreningen» kan bety denne gangen eller alle.
      Derfor kreves omfang, uten noe standardsvar.

   2. INGEN INNLEST LISTE AA SLAA OPP I. Paa kalendersida finnes
      avtalene i minnet, og verktoeyene der bruker dem. Herfra
      finnes de ikke, saa Neam maa kjoere les_kalender foerst og
      sende baade id og kalender_id videre.

   3. IKKE MED: vedlegg, og flytting mellom kalendere. Flyttingen
      er i praksis en ny avtale pluss en sletting, og det er for
      mye aa la ett verktoey gjoere bak én bekreftelse.
   ------------------------------------------------------------ */

const SKRIV_TZ = 'Europe/Oslo';

function skrivDatoTekst(s){
  const t = String(s || '');
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t);
  if(!m) return t;
  const d = new Date(t + 'T12:00:00');
  if(isNaN(d)) return t;
  return d.toLocaleDateString('nb-NO', { weekday:'long', day:'numeric', month:'long' })
       + (d.getFullYear() !== new Date().getFullYear() ? ' ' + d.getFullYear() : '');
}

/* Kalenderen bak et navn. Navnet trenger ikke vaere eksakt - et menneske
   sier «Emma», ikke «Emma (skole)». */
async function skrivFinnKalender(navn){
  const d = await lesAltGraph('/me/calendars?$select=id,name,canEdit&$top=50');
  const alle = (d && d.value) || [];
  const n = String(navn || '').trim().toLowerCase();
  if(!n) return { alle: alle, treff: null };
  const treff = alle.filter(function(c){ return String(c.name||'').toLowerCase() === n; })[0]
             || alle.filter(function(c){ return String(c.name||'').toLowerCase().indexOf(n) === 0; })[0]
             || alle.filter(function(c){ return String(c.name||'').toLowerCase().indexOf(n) !== -1; })[0]
             || null;
  return { alle: alle, treff: treff };
}

/* Stien til det som faktisk skal endres. For hele serien maa vi foerst
   spoerre Graph hvilken avtale som ER serien: kalendervisningen gir oss
   forekomstene, og serien selv har en annen id. */
async function skrivAvtaleSti(kalId, eventId, omfang){
  const base = '/me/calendars/' + encodeURIComponent(kalId)
             + '/events/' + encodeURIComponent(eventId);
  if(omfang !== 'serien') return base;
  const d = await lesAltGraph(base + '?$select=seriesMasterId');
  const mor = d && d.seriesMasterId;
  if(!mor) throw new Error('Fant ikke serien bak avtalen. Den må åpnes i Outlook.');
  return '/me/calendars/' + encodeURIComponent(kalId)
       + '/events/' + encodeURIComponent(mor);
}

async function skrivGraph(sti, metode, kropp){
  const t = await gyldigToken();
  if(!t) throw new Error('Ingen Microsoft-økt akkurat nå. Si at noen må innom '
                       + 'kalendersiden og logge inn.');
  const r = await fetch('https://graph.microsoft.com/v1.0' + sti, {
    method: metode,
    headers: { Authorization:'Bearer ' + t, 'Content-Type':'application/json',
               Prefer: 'outlook.timezone="' + SKRIV_TZ + '"' },
    body: kropp ? JSON.stringify(kropp) : undefined
  });
  if(r.status === 204) return null;
  const tekst = await r.text();
  if(!r.ok){
    let m = 'Microsoft svarte ' + r.status;
    try{ const d = JSON.parse(tekst); m = (d.error && d.error.message) || m; }catch(e){}
    throw new Error(m);
  }
  try{ return tekst ? JSON.parse(tekst) : null; }catch(e){ return null; }
}


/* ------------------------------------------------------------
   Verktøyene
   ------------------------------------------------------------ */

/* ------------------------------------------------------------
   Skolearbeidet - paa tvers
   ------------------------------------------------------------
   Lagt til 16. september 2026. Fram til da kunne lekser, proever
   og laeringsmaal bare endres fra barnets egen dash - alt annet i
   huset kunne gjoeres overalt.

   HVEM DET GJELDER ER PAAKREVD. Staar man paa Emma dash, vet sida
   hvem hun er. Herfra gjoer den ikke det, og et standardvalg ville
   skrevet i feil barns lekser uten at noen ble spurt. `barn` har
   derfor ingen standardverdi - samme regel som `omfang` paa serier.

   BARE DER NOEN ER LOGGET INN SOM SEG SELV. Kjoekkenskjermen
   kjoerer som kitchen@, og skal etter planen spoerre «hvem er
   dette?» ved oppvaakning. Den mekanismen finnes ikke ennaa, og
   inntil den gjoer det, tilbys ikke disse verktoeyene der: en skjerm
   som kan endre begge barnas lekser uten at noen vet hvem som
   trykket, hoerer ikke hjemme paa veggen. Sperren er
   skrivSkoleTillatt(), og den gjelder baade naar verktoeylista
   bygges og naar verktoeyet kjoeres.

   SAMTIDIG SKRIVING. Noekkelen er ETT objekt med fag, lekser og
   proever i seg. Emma kan sitte med sin egen dash aapen mens vi
   skriver her, og KV har ingen «skriv bare hvis uendret». To ting
   demper det, begge tatt fra sida (kartleggingen del 22):

     1. Vi holder aldri paa et objekt vi leste for lenge siden.
        Verktoeyene sender en ENDRINGSFUNKSJON til skrivFagEndre(),
        som leser ferskt rett foer skrivingen og kjoerer endringen
        paa DET. Den roerer én lekse, ikke hele lista.
     2. Alle skrivinger mot samme noekkel staar i ko, saa to
        verktoeykall i samme svar ikke leser samme utgangspunkt.

   Vinduet blir dermed millisekunder i stedet for sekunder. Det er
   IKKE lukket: skriver Emma i samme sekund, vinner den siste. Helt
   tett krever D1, eller at sida fletter i stedet for aa lagre hele
   objektet. Skrevet ned saa ingen tror det er loest.

   FELTNAVNENE ER SLAATT OPP i ryddFag() og verktoeyene i emma.html,
   ikke gjettet. Endres formen der, endres den her.
   ------------------------------------------------------------ */

const SKRIV_FAG_NOKLER = { emma:'emma-fag:v1', andrea:'andrea-fag:v1' };

/* Verktoeyene som bare tilbys en innlogget person. */
const SKRIV_SKOLE = ['legg_til_lekse', 'endre_lekse', 'slett_lekse',
                     'legg_til_prove', 'endre_prove', 'sett_laeringsmaal'];

/* Kontoene som ikke er en person: veggskjermen og systemkontoen. */
const SKRIV_UPERSONLIG = ['kitchen@neam.no', 'sys@neam.no'];

let skrivMeg = null;
let skrivMegPerson = false;
let skrivMegSpurt = false;

async function skrivHentMeg(){
  if(skrivMegSpurt) return;
  skrivMegSpurt = true;
  if(typeof gyldigToken !== 'function') return;
  try{
    const me = await skrivGraph('/me?$select=mail,userPrincipalName', 'GET');
    const e = String((me && (me.mail || me.userPrincipalName)) || '').trim().toLowerCase();
    if(!e) return;
    skrivMeg = e;
    skrivMegPerson = SKRIV_UPERSONLIG.indexOf(e) === -1;
  }catch(e){
    /* Ingen oekt, eller Graph svarte ikke. Da tilbys ikke skolearbeidet.
       Et verktoey som ikke kan virke er verre enn ingen. */
  }
}
/* Varmes ved sidelasting, som husregisteret i felles-data.js:
   verktoeylista bygges ved hver melding, og da maa svaret alt vaere her. */
setTimeout(skrivHentMeg, 0);

function skrivSkoleTillatt(){ return !!skrivMegPerson; }

function skrivBarnNavn(b){
  const s = String(b || '').trim().toLowerCase();
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}

function skrivFagNokkel(barn){
  const n = SKRIV_FAG_NOKLER[String(barn || '').trim().toLowerCase()];
  if(!n) throw new Error('Si hvem det gjelder - Emma eller Andrea. Ikke velg selv.');
  return n;
}

function skrivFagTom(d){
  const o = (d && typeof d === 'object') ? d : {};
  return { fag:    Array.isArray(o.fag)    ? o.fag    : [],
           lekser: Array.isArray(o.lekser) ? o.lekser : [],
           prover: Array.isArray(o.prover) ? o.prover : [] };
}

const skrivFagKoer   = {};   /* noekkel -> Promise */
const skrivFagVakter = {};   /* noekkel -> {foer, tid, sist} */

/* Les - endre - skriv. `endring` faar det ferskeste vi har og returnerer
   det samme objektet endret. Gi den ALDRI noe du leste tidligere. */
function skrivFagEndre(barn, endring){
  const nokkel = skrivFagNokkel(barn);
  const forrige = skrivFagKoer[nokkel] || Promise.resolve();
  const jobb = function(){ return skrivFagNaa(nokkel, endring); };
  /* Baade ved suksess og feil: en skriving som ryker skal ikke sperre
     dem som staar bak i koen. */
  const neste = forrige.then(jobb, jobb);
  skrivFagKoer[nokkel] = neste.catch(function(){});
  return neste;
}

async function skrivFagNaa(nokkel, endring){
  const vakt = skrivFagVakter[nokkel]
            || (skrivFagVakter[nokkel] = { foer:null, tid:0, sist:null });

  let fersk = skrivFagTom(await dataLes(nokkel));
  const ferskJson = JSON.stringify(fersk);

  /* KV mellomlagrer lesinger i opptil 60 sekunder. Er svaret NOEYAKTIG
     det som sto foer var forrige skriving, er det cachen som svarer - og
     da er var egen siste versjon den ferskeste som finnes. Uten dette
     skriver den andre endringen den foerste bort. Samme vakt som
     erUtdatert() i emma.html. */
  if(vakt.foer && vakt.sist && ferskJson === vakt.foer
     && Date.now() - vakt.tid < 90000){
    fersk = vakt.sist;
  }else{
    vakt.foer = ferskJson;
  }

  const ny = skrivFagTom(endring(fersk));
  await dataSkriv(nokkel, ny);
  vakt.tid  = Date.now();
  vakt.sist = ny;
  return ny;
}

function skrivFagId(){
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/* Faget bak et navn. Hele navnet foerst, saa entydig delstreng. Treffer
   flere, er det et spoersmaal til brukeren og ikke et valg vi tar. */
function skrivFagFinn(d, navn){
  const sok = String(navn || '').trim().toLowerCase();
  if(!sok) throw new Error('Si hvilket fag det gjelder.');
  const alle = d.fag || [];
  const eksakt = alle.filter(function(f){
    return String(f.navn || '').trim().toLowerCase() === sok;
  });
  const treff = eksakt.length ? eksakt : alle.filter(function(f){
    return String(f.navn || '').toLowerCase().indexOf(sok) !== -1;
  });
  if(treff.length === 1) return treff[0];
  const navnene = alle.map(function(f){ return f.navn; }).join(', ');
  if(!treff.length) throw new Error('Fant ingen fag som heter «' + navn + '». '
                                  + 'Fagene er: ' + navnene + '. Nye fag legges inn '
                                  + 'på barnets egen dash.');
  throw new Error('«' + navn + '» passer på flere fag: '
                + treff.map(function(f){ return f.navn; }).join(', ')
                + '. Spør brukeren hvilket det gjelder.');
}

function skrivFagNavnAv(d, fagId){
  const f = (d.fag || []).filter(function(x){ return x.id === fagId; })[0];
  return (f && f.navn) || '(ukjent fag)';
}

function skrivDatoKrev(s, hva){
  const t = String(s || '').trim();
  if(!t) return '';
  if(!/^\d{4}-\d{2}-\d{2}$/.test(t)){
    throw new Error(hva + ' skal være på formen 2026-09-08.');
  }
  return t;
}

function skrivNaaKlokke(){
  const d = new Date();
  const p = function(n){ return String(n).padStart(2, '0'); };
  return p(d.getHours()) + ':' + p(d.getMinutes());
}

function skrivDatoNokkel(d){
  const p = function(n){ return String(n).padStart(2, '0'); };
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

/* ISO-uke med aaret som hoerer til uka - i romjula er de to ulike, og det
   er derfor aaret ikke kan tas rett fra datoen. Samme form som
   ukeNokkel() i sida: «2026-W38». */
function skrivIsoUke(d){
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));
  const aar = t.getUTCFullYear();
  const nyttaar = new Date(Date.UTC(aar, 0, 1));
  return { aar: aar, uke: Math.ceil(((t - nyttaar) / 86400000 + 1) / 7) };
}

/* Tar imot «2026-W38», «38» eller ingenting (denne uka). */
function skrivUkeNokkel(uke){
  const p = function(n){ return String(n).padStart(2, '0'); };
  const raa = String(uke || '').trim().toUpperCase();
  if(/^\d{4}-W\d{2}$/.test(raa)) return raa;
  const naa = new Date();
  if(/^\d{1,2}$/.test(raa)){
    const n = Number(raa);
    if(n < 1 || n > 53) throw new Error('Ukenummeret må være mellom 1 og 53.');
    /* Naermeste uke med det nummeret, et halvaar hver vei - samme grep som
       mandagIUke() i sida, saa uke 1 i januar ikke blir i fjor. */
    for(let i = -26; i <= 26; i++){
      const d = new Date(naa.getFullYear(), naa.getMonth(), naa.getDate() + i * 7);
      const u = skrivIsoUke(d);
      if(u.uke === n) return u.aar + '-W' + p(u.uke);
    }
    throw new Error('Fant ikke uke ' + n + '.');
  }
  if(raa) throw new Error('Uka skal være «2026-W38» eller et ukenummer.');
  const u = skrivIsoUke(naa);
  return u.aar + '-W' + p(u.uke);
}


const SKRIV_VERKTOY = [
  {
    name: 'legg_paa_handlelista',
    description: 'Legger varer på handlelista fra hvilken som helst side. Uten '
               + 'handletur legges de på den nyeste i området - finnes ingen, lages '
               + 'en med ukenummeret som navn.\n\n'
               + 'Send alle varene i ETT kall. Varer som alt står der ukjøpt blir ikke '
               + 'lagt til på nytt, og du får vite hvilke.\n\n'
               + 'Skal noe fjernes, endres eller hukes av, må det gjøres på '
               + 'Matlaging-siden - herfra kan det bare legges til.',
    input_schema: {
      type:'object',
      properties:{
        varer: {
          type:'array',
          description:'Varene som skal legges til.',
          items:{
            type:'object',
            properties:{
              vare:   { type:'string', description:'Varenavnet, som man ville skrevet '
                                                 + 'det på en lapp.' },
              mengde: { type:'string', description:'Selve målet: «500 g», «1,5 l». '
                                                 + 'Utelat om brukeren ikke sa noe.' },
              antall: { type:'string', description:'Hvor mange av mengden - «2» i '
                                                 + '«2 × 1,5 l».' },
              type:   { type:'string', enum:SKRIV_VARETYPER,
                        description:'Utelat om du ikke er sikker - da slås den opp i '
                                  + 'varekatalogen.' }
            },
            required:['vare']
          }
        },
        omrade: { type:'string', enum:['mat','annet'],
                  description:'mat = Dagligvarer, annet = Andre varer. Standard er mat.' },
        handletur: { type:'string', description:'Navnet på en bestemt handletur. '
                                              + 'Utelat for den nyeste.' }
      },
      required:['varer']
    },
    neamSkriver: true,
    neamBeskriv: function(arg){
      const liste = (arg.varer || []).map(function(v){
        const m = [v.antall, v.mengde].filter(Boolean).join(' × ');
        return '· ' + v.vare + (m ? ' (' + m + ')' : '');
      }).join('\n');
      return 'Legge på handlelista'
           + (arg.handletur ? ' (' + arg.handletur + ')' : '')
           + (arg.omrade === 'annet' ? ' under Andre varer' : '') + ':\n\n' + liste;
    }
  },
  {
    name: 'fjern_fra_handlelista',
    description: 'Fjerner varer fra handlelista. Send alle i ett kall. Varer som ikke '
               + 'finnes blir rapportert tilbake, ikke behandlet som en feil.\n\n'
               + 'Er varen KJØPT og skal bare ut av veien, hører den hjemme der - en '
               + 'avsluttet handletur er kvitteringen. Fjern bare når brukeren har bedt '
               + 'om akkurat det.',
    input_schema: {
      type:'object',
      properties:{
        varer: { type:'array', items:{ type:'string' },
                 description:'Varenavnene slik de står på lista.' },
        omrade: { type:'string', enum:['mat','annet'] },
        handletur: { type:'string', description:'Utelat for den nyeste åpne.' }
      },
      required:['varer']
    },
    neamSkriver: true,
    neamBeskriv: function(arg){
      return 'Fjerne fra handlelista'
           + (arg.handletur ? ' (' + arg.handletur + ')' : '') + ':\n\n'
           + (arg.varer || []).map(function(v){ return '· ' + v; }).join('\n');
    }
  },
  {
    name: 'endre_vare_paa_handlelista',
    description: 'Endrer ÉN vare som står på lista - mengde, varetype, butikk, eller om '
               + 'den er huket av som kjøpt. Bare feltene du sender blir rørt.\n\n'
               + 'BRUK DENNE i stedet for å fjerne og legge til på nytt: da beholder '
               + 'varen plassen sin.',
    input_schema: {
      type:'object',
      properties:{
        vare:   { type:'string', description:'Varenavnet slik det står på lista.' },
        mengde: { type:'string', description:'«500 g», «1,5 l». Tom streng fjerner den.' },
        antall: { type:'string', description:'Hvor mange av mengden.' },
        type:   { type:'string', enum:SKRIV_VARETYPER },
        butikk: { type:'string', description:'Tom streng fjerner butikken.' },
        kjopt:  { type:'boolean', description:'true huker av, false tar haken bort.' },
        omrade: { type:'string', enum:['mat','annet'] },
        handletur: { type:'string', description:'Utelat for den nyeste åpne.' }
      },
      required:['vare']
    },
    neamSkriver: true,
    neamBeskriv: function(arg){
      /* Avhuking sies for seg - det er handlingen selv, ikke et felt. */
      const bare = Object.keys(arg).filter(function(k){
        return ['omrade','handletur','vare'].indexOf(k) === -1;
      });
      if(bare.length === 1 && bare[0] === 'kjopt'){
        return (arg.kjopt ? 'Huke av ' : 'Ta bort haken på ') + '«' + arg.vare + '».';
      }
      const rader = [];
      if(arg.mengde !== undefined) rader.push('· mengde: ' + (arg.mengde || '(fjernes)'));
      if(arg.antall !== undefined) rader.push('· antall: ' + (arg.antall || '(fjernes)'));
      if(arg.type   !== undefined) rader.push('· varetype: ' + arg.type);
      if(arg.butikk !== undefined) rader.push('· butikk: ' + (arg.butikk || '(fjernes)'));
      if(arg.kjopt  !== undefined) rader.push('· kjøpt: ' + (arg.kjopt ? 'ja' : 'nei'));
      return 'Endre «' + arg.vare + '» på handlelista'
           + (rader.length ? ':\n\n' + rader.join('\n') : '.');
    }
  },
  {
    name: 'ny_handletur',
    description: 'Lager en ny handletur. Uten navn får den ukenummeret. Den blir den '
               + 'nyeste åpne, så varer som legges til etterpå havner der.',
    input_schema: {
      type:'object',
      properties:{
        navn:   { type:'string', description:'Utelat for «Uke N».' },
        omrade: { type:'string', enum:['mat','annet'],
                  description:'mat = Dagligvarer, annet = Andre varer. Standard er mat.' }
      },
      required:[]
    },
    neamSkriver: true,
    neamBeskriv: function(arg){
      return 'Lage handleturen «' + (arg.navn || 'Uke ' + skrivUke(new Date())) + '»'
           + (arg.omrade === 'annet' ? ' under Andre varer' : ' under Dagligvarer') + '.';
    }
  },
  {
    name: 'start_handletur',
    description: 'Setter handleturen i handlemodus - det samme som å trykke play på '
               + 'Matlaging. Brukes når noen er på butikken.',
    input_schema: {
      type:'object',
      properties:{
        omrade: { type:'string', enum:['mat','annet'] },
        handletur: { type:'string', description:'Utelat for den nyeste åpne.' }
      },
      required:[]
    },
    neamSkriver: true,
    neamBeskriv: function(arg){
      return 'Starte handleturen' + (arg.handletur ? ' «' + arg.handletur + '»' : '') + '.';
    }
  },
  {
    name: 'avslutt_handletur',
    description: 'Avslutter en handletur. Du MÅ si hva som skjer med varene som ikke er '
               + 'huket av - spør brukeren, ikke velg selv:\n'
               + '  la_staa  - de blir liggende i den avsluttede turen\n'
               + '  flytt    - de flyttes til neste åpne handletur\n'
               + '  forkast  - de slettes\n\n'
               + 'Les opp hva som står igjen før du spør, så brukeren vet hva valget '
               + 'gjelder. «forkast» kan ikke angres.',
    input_schema: {
      type:'object',
      properties:{
        rester: { type:'string', enum:['la_staa','flytt','forkast'],
                  description:'Hva som skjer med varene som ikke er kjøpt.' },
        omrade: { type:'string', enum:['mat','annet'] },
        handletur: { type:'string', description:'Utelat for den nyeste åpne.' }
      },
      required:['rester']
    },
    neamSkriver: true,
    neamBeskriv: function(arg){
      const hva = arg.rester === 'flytt'
        ? 'Varene som ikke er kjøpt flyttes til neste handletur.'
        : arg.rester === 'forkast'
        ? 'Varene som ikke er kjøpt SLETTES. Det kan ikke angres.'
        : 'Varene som ikke er kjøpt blir liggende i den avsluttede turen.';
      return 'Avslutte handleturen' + (arg.handletur ? ' «' + arg.handletur + '»' : '')
           + '\n\n' + hva;
    }
  },
  {
    name: 'legg_til_avtale',
    description: 'Lager en ny avtale i en av familiens kalendere. Si hvilken kalender - '
               + 'bruk les_kalender om du ikke vet navnene. Gjentagende avtaler kan ikke '
               + 'lages herfra; de må settes opp i Outlook.',
    input_schema: {
      type:'object',
      properties:{
        tittel:    { type:'string', description:'Navnet på avtalen.' },
        kalender:  { type:'string', description:'Hvilken kalender den skal i.' },
        dato:      { type:'string', description:'Dato på formen 2026-09-08.' },
        fra:       { type:'string', description:'Klokkeslett, 14:30. Utelat for hele dagen.' },
        til:       { type:'string', description:'Klokkeslett, 15:30.' },
        heleDagen: { type:'boolean', description:'true for en avtale uten klokkeslett.' },
        sluttdato: { type:'string', description:'Bare hvis avtalen går over flere dager.' },
        sted:      { type:'string' },
        notat:     { type:'string' }
      },
      required:['tittel','dato']
    },
    neamSkriver: true,
    neamBeskriv: function(arg){
      const nar = (arg.heleDagen || !arg.fra)
        ? skrivDatoTekst(arg.dato)
          + (arg.sluttdato && arg.sluttdato !== arg.dato
             ? ' til ' + skrivDatoTekst(arg.sluttdato) : '') + ', hele dagen'
        : skrivDatoTekst(arg.dato) + ' ' + arg.fra + (arg.til ? '–' + arg.til : '');
      return 'Legge inn «' + arg.tittel + '»'
           + (arg.kalender ? ' i ' + arg.kalender : '') + ':\n\n· ' + nar
           + (arg.sted ? '\n· sted: ' + arg.sted : '')
           + (arg.notat ? '\n· notat: ' + arg.notat : '');
    }
  },
  {
    name: 'endre_avtale',
    description: 'Endrer en avtale som finnes. Du MÅ ha kjørt les_kalender først - både '
               + 'id og kalender_id kommer derfra. Bare feltene du sender blir rørt, og '
               + 'sender du klokkeslett må du sende begge.\n\n'
               + 'Er avtalen gjentagende (serie:true), MÅ du spørre brukeren om det '
               + 'gjelder denne gangen eller hele serien, og sende omfang. Ikke velg selv.',
    input_schema: {
      type:'object',
      properties:{
        id:          { type:'string', description:'Avtalens id fra les_kalender.' },
        kalender_id: { type:'string', description:'Kalenderens id fra les_kalender.' },
        tittel:      { type:'string' },
        dato:        { type:'string', description:'Dato på formen 2026-09-08.' },
        fra:         { type:'string', description:'Klokkeslett, 14:30.' },
        til:         { type:'string', description:'Klokkeslett, 15:30.' },
        heleDagen:   { type:'boolean' },
        sted:        { type:'string', description:'Tom streng fjerner stedet.' },
        notat:       { type:'string', description:'Tom streng fjerner notatet.' },
        omfang:      { type:'string', enum:['denne','serien'],
                       description:'Bare for gjentagende avtaler. Spør brukeren.' }
      },
      required:['id','kalender_id']
    },
    neamSkriver: true,
    neamBeskriv: function(arg){
      const rader = [];
      if(arg.tittel !== undefined) rader.push('· nytt navn: ' + arg.tittel);
      if(arg.dato   !== undefined) rader.push('· dato: ' + skrivDatoTekst(arg.dato));
      if(arg.fra    !== undefined) rader.push('· fra: ' + arg.fra);
      if(arg.til    !== undefined) rader.push('· til: ' + arg.til);
      if(arg.sted   !== undefined) rader.push('· sted: ' + (arg.sted || '(fjernes)'));
      if(arg.notat  !== undefined) rader.push('· notat: ' + (arg.notat || '(fjernes)'));
      return 'Endre en avtale i kalenderen'
           + (rader.length ? ':\n\n' + rader.join('\n') : '.')
           + (arg.omfang === 'serien' ? '\n\nDette gjelder ALLE gangene i serien.'
            : arg.omfang === 'denne'  ? '\n\nDette gjelder bare denne ene dagen.' : '');
    }
  },
  {
    name: 'slett_avtale',
    description: 'Sletter en avtale. Du MÅ ha kjørt les_kalender først - id og '
               + 'kalender_id kommer derfra. Er avtalen gjentagende, MÅ du spørre om det '
               + 'gjelder denne gangen eller hele serien.\n\n'
               + 'Les opp hvilken avtale det gjelder før du spør, så brukeren vet hva '
               + 'som forsvinner.',
    input_schema: {
      type:'object',
      properties:{
        id:          { type:'string', description:'Avtalens id fra les_kalender.' },
        kalender_id: { type:'string', description:'Kalenderens id fra les_kalender.' },
        tittel:      { type:'string', description:'Avtalens navn - brukes bare til å '
                                                + 'vise brukeren hva som slettes. Send '
                                                + 'det du fikk fra les_kalender.' },
        omfang:      { type:'string', enum:['denne','serien'],
                       description:'Bare for gjentagende avtaler. Spør brukeren.' }
      },
      required:['id','kalender_id']
    },
    neamSkriver: true,
    neamBeskriv: function(arg){
      const hode = arg.omfang === 'serien'
        ? 'SLETTE HELE SERIEN' + (arg.tittel ? ' «' + arg.tittel + '»' : '')
        : 'SLETTE' + (arg.tittel ? ' «' + arg.tittel + '»' : ' en avtale');
      const hale = arg.omfang === 'serien'
        ? '\n\nAlle gangene forsvinner, ikke bare denne. Dette kan ikke angres.'
        : arg.omfang === 'denne'
        ? '\n\nBare denne ene dagen avlyses. Dette kan ikke angres.'
        : '\n\nDette kan ikke angres.';
      return hode + hale;
    }
  },
  {
    name: 'gaa_til',
    description: 'Åpner en annen side i Neam. Bruk den når brukeren ber om å komme et '
               + 'sted, eller når svaret ditt er at noe må gjøres et annet sted.\n\n'
               + 'SAMTALEN TAR SLUTT når siden skifter - panelet følger ikke med. Si '
               + 'derfor alt du har å si i det samme svaret, og hold det kort. Ikke '
               + 'still et spørsmål og naviger i samme slengen.\n\n'
               + 'Naviger aldri uten at brukeren har bedt om det eller sagt ja til det.',
    input_schema: {
      type:'object',
      properties:{
        side: { type:'string',
                enum:['forsiden','kalender','handleliste','oppskrifter',
                      'andrea','emma','diktat','kjokken','sikkerhet'],
                description:'Hvilken side som skal åpnes.' }
      },
      required:['side']
    },
    /* Ikke `neamSkriver`: navigasjon oedelegger ingenting. Men den avslutter
       samtalen, og det staar i beskrivelsen - en dialog for hvert eneste
       «ta meg til handlelista» ville vaert i veien, ikke til hjelp. */
  },
  {
    name: 'legg_til_lekse',
    description: 'Legger en lekse inn hos Emma eller Andrea, fra hvilken som helst side.\n\n'
               + 'Si ALLTID hvem det gjelder. Vet du det ikke, spør - ikke gjett ut fra '
               + 'hvem som snakker.\n\n'
               + 'Faget må være et barnet har; bruk les_skolearbeid for å se hvilke. Nye '
               + 'fag legges inn på barnets egen dash.',
    input_schema: {
      type:'object',
      properties:{
        barn:  { type:'string', enum:['Emma','Andrea'],
                 description:'Hvem leksa er for.' },
        fag:   { type:'string', description:'Faget, slik det står i les_skolearbeid.' },
        tekst: { type:'string', description:'Hva som skal gjøres.' },
        frist: { type:'string', description:'Dato på formen 2026-09-08. Utelat om det '
                                          + 'ikke ble sagt noen frist.' }
      },
      required:['barn','fag','tekst']
    },
    neamSkriver: true,
    neamBeskriv: function(arg){
      return 'Legge inn lekse for ' + skrivBarnNavn(arg.barn) + ' i ' + arg.fag + ':\n\n'
           + '· ' + arg.tekst
           + (arg.frist ? '\n· frist: ' + skrivDatoTekst(arg.frist) : '\n· uten frist');
    }
  },
  {
    name: 'endre_lekse',
    description: 'Endrer en lekse som finnes - tekst, frist, fag, eller huker den av som '
               + 'gjort. Du MÅ ha kjørt les_skolearbeid først: både id og barn kommer '
               + 'derfra.\n\n'
               + 'Bare feltene du sender blir rørt. Send `lekse` med teksten slik den '
               + 'står nå, så brukeren ser hvilken det gjelder.',
    input_schema: {
      type:'object',
      properties:{
        barn:   { type:'string', enum:['Emma','Andrea'], description:'Hvem leksa er hos.' },
        id:     { type:'string', description:'Leksas id fra les_skolearbeid.' },
        lekse:  { type:'string', description:'Leksas nåværende tekst - vises til brukeren.' },
        tekst:  { type:'string', description:'Ny tekst.' },
        frist:  { type:'string', description:'Ny frist, 2026-09-08. Tom streng fjerner den.' },
        ferdig: { type:'boolean', description:'true huker av, false tar bort haken.' },
        fag:    { type:'string', description:'Flytt leksa til et annet fag.' }
      },
      required:['barn','id','lekse']
    },
    neamSkriver: true,
    neamBeskriv: function(arg){
      const rader = [];
      if(arg.ferdig === true)  rader.push('· huke av som gjort');
      if(arg.ferdig === false) rader.push('· ta bort haken');
      if(arg.tekst !== undefined) rader.push('· ny tekst: ' + arg.tekst);
      if(arg.frist !== undefined) rader.push('· frist: '
        + (arg.frist ? skrivDatoTekst(arg.frist) : '(fjernes)'));
      if(arg.fag   !== undefined) rader.push('· flyttes til ' + arg.fag);
      return 'Endre «' + arg.lekse + '» hos ' + skrivBarnNavn(arg.barn)
           + (rader.length ? ':\n\n' + rader.join('\n') : '.');
    }
  },
  {
    name: 'slett_lekse',
    description: 'Sletter en lekse. Du MÅ ha kjørt les_skolearbeid først - id og barn '
               + 'kommer derfra. Les opp hvilken lekse det gjelder før du spør, så '
               + 'brukeren vet hva som forsvinner.\n\n'
               + 'Er leksa gjort, skal den hukes av med endre_lekse - ikke slettes.',
    input_schema: {
      type:'object',
      properties:{
        barn:  { type:'string', enum:['Emma','Andrea'], description:'Hvem leksa er hos.' },
        id:    { type:'string', description:'Leksas id fra les_skolearbeid.' },
        lekse: { type:'string', description:'Leksas tekst - vises til brukeren.' }
      },
      required:['barn','id','lekse']
    },
    neamSkriver: true,
    neamBeskriv: function(arg){
      return 'SLETTE leksa «' + arg.lekse + '» hos ' + skrivBarnNavn(arg.barn)
           + '\n\nDen forsvinner fra dashen hennes. Dette kan ikke angres.';
    }
  },
  {
    name: 'legg_til_prove',
    description: 'Legger inn en prøve, innlevering eller framføring hos Emma eller '
               + 'Andrea. Si alltid hvem det gjelder.',
    input_schema: {
      type:'object',
      properties:{
        barn:     { type:'string', enum:['Emma','Andrea'], description:'Hvem prøven er for.' },
        fag:      { type:'string', description:'Faget, slik det står i les_skolearbeid.' },
        type:     { type:'string', description:'Hva det er - «prøve», «innlevering», '
                                             + '«framføring», «gloseprøve».' },
        dato:     { type:'string', description:'Dato på formen 2026-09-08.' },
        karakter: { type:'string', description:'Bare hvis den alt er satt.' }
      },
      required:['barn','fag','type']
    },
    neamSkriver: true,
    neamBeskriv: function(arg){
      return 'Legge inn ' + (arg.type || 'prøve') + ' for ' + skrivBarnNavn(arg.barn)
           + ' i ' + arg.fag + ':\n\n'
           + '· ' + (arg.dato ? skrivDatoTekst(arg.dato) : 'uten dato')
           + (arg.karakter ? '\n· karakter: ' + arg.karakter : '');
    }
  },
  {
    name: 'endre_prove',
    description: 'Endrer en prøve som finnes - type, dato eller karakter. Du MÅ ha kjørt '
               + 'les_skolearbeid først: id og barn kommer derfra. Bare feltene du '
               + 'sender blir rørt.',
    input_schema: {
      type:'object',
      properties:{
        barn:     { type:'string', enum:['Emma','Andrea'], description:'Hvem prøven er hos.' },
        id:       { type:'string', description:'Prøvens id fra les_skolearbeid.' },
        prove:    { type:'string', description:'Prøvens type og fag slik det står nå - '
                                             + 'vises til brukeren.' },
        type:     { type:'string' },
        dato:     { type:'string', description:'Ny dato, 2026-09-08.' },
        karakter: { type:'string', description:'Tom streng fjerner karakteren.' }
      },
      required:['barn','id','prove']
    },
    neamSkriver: true,
    neamBeskriv: function(arg){
      const rader = [];
      if(arg.type     !== undefined) rader.push('· type: ' + arg.type);
      if(arg.dato     !== undefined) rader.push('· dato: ' + skrivDatoTekst(arg.dato));
      if(arg.karakter !== undefined) rader.push('· karakter: '
        + (arg.karakter || '(fjernes)'));
      return 'Endre ' + arg.prove + ' hos ' + skrivBarnNavn(arg.barn)
           + (rader.length ? ':\n\n' + rader.join('\n') : '.');
    }
  },
  {
    name: 'sett_laeringsmaal',
    description: 'Setter læringsmålet for ett fag i én uke. Målene ligger per uke, så et '
               + 'nytt mål erstatter bare den ukas - ikke de andre.\n\n'
               + 'Utelat uke for inneværende uke. Gjelder det uka som kommer, MÅ du si '
               + 'det - ikke anta. Tom tekst fjerner målet.',
    input_schema: {
      type:'object',
      properties:{
        barn: { type:'string', enum:['Emma','Andrea'], description:'Hvem det gjelder.' },
        fag:  { type:'string', description:'Faget, slik det står i les_skolearbeid.' },
        maal: { type:'string', description:'Læringsmålet. Tom streng fjerner det som står.' },
        uke:  { type:'string', description:'«2026-W38» eller ukenummeret. Utelat for '
                                         + 'inneværende uke.' }
      },
      required:['barn','fag','maal']
    },
    neamSkriver: true,
    neamBeskriv: function(arg){
      let uke;
      try{ uke = skrivUkeNokkel(arg.uke); }catch(e){ uke = String(arg.uke || ''); }
      const tekst = String(arg.maal || '').trim();
      return (tekst ? 'Sette læringsmål' : 'FJERNE læringsmålet')
           + ' i ' + arg.fag + ' for ' + skrivBarnNavn(arg.barn)
           + ', uke ' + uke.replace(/^\d{4}-W/, '') + ' (' + uke + ')'
           + (tekst ? ':\n\n· ' + tekst
                    : '\n\nDet som står der nå blir borte.');
    }
  },
];

const SKRIV_SIDER = {
  forsiden:    '/index.html',
  kalender:    '/kalender.html',
  handleliste: '/handleliste.html',
  oppskrifter: '/oppskrifter.html',
  andrea:      '/andrea.html',
  emma:        '/emma.html',
  diktat:      '/andrea-diktat.html',
  kjokken:     '/dashboard.html',
  sikkerhet:   '/sikkerhet.html'
};

async function skrivUtfor(navn, arg){
  arg = arg || {};

  /* ---------------- Navigasjon ---------------- */
  if(navn === 'gaa_til'){
    const mal = SKRIV_SIDER[String(arg.side || '').toLowerCase()];
    if(!mal) throw new Error('Ukjent side: ' + arg.side);
    /* Vi drar ikke med det samme. Svaret fra Neam skal rekke aa komme paa
       skjermen foerst - navigerer vi i samme oeyeblikk, ser brukeren bare
       at sida bytter og faar aldri vite hvorfor. */
    setTimeout(function(){ location.href = mal; }, 2500);
    return { navigerer: true, side: arg.side,
             beskjed: 'Siden åpnes om et par sekunder. Si kort hva du gjorde, '
                    + 'og ikke still spørsmål nå.' };
  }

  /* ---------------- Handlelista ---------------- */
  if(navn === 'legg_paa_handlelista'){
    const varer = (Array.isArray(arg.varer) ? arg.varer : [])
      .filter(function(v){ return v && String(v.vare || '').trim(); });
    if(!varer.length) throw new Error('Ingen varer å legge til.');
    if(varer.length > 40) throw new Error('Høyst 40 varer om gangen.');

    const omr = arg.omrade === 'annet' ? 'annet' : 'mat';

    /* Les - endre - skriv. Verdien hentes HER og ikke tidligere: staar
       handlelista aapen et annet sted, vil vi ha den ferskeste. */
    const d = await dataLes(SKRIV_HANDLELISTE) || {};
    if(!Array.isArray(d.okter)) d.okter = [];
    if(!Array.isArray(d.items)) d.items = [];

    /* Handleturen. Den navngitte, ellers den nyeste AAPNE, ellers en ny.
       skrivFinnOkt() eier regelen; foerste utgave hadde en egen kopi her
       som ikke filtrerte bort avsluttede turer, og da kunne en vare havne
       i en handel du var ferdig med. */
    const okt = skrivFinnOkt(d, arg, true);
    const oktOmr = okt.omrade || 'mat';

    /* Varekatalogen sier hva huset pleier aa kalle en varetype. Den leses,
       men skrives ikke: aa laere katalogen noe er sidas jobb, og en
       gjetning herfra er ikke laerdom. */
    let katalog = {};
    try{
      const k = await dataLes(SKRIV_KATALOG);
      katalog = (k && k.katalog) || {};
    }catch(e){ katalog = {}; }

    const lagt = [], hoppet = [];
    varer.forEach(function(v){
      const navn = String(v.vare).trim();

      /* Staar varen der alt og er ukjoept, blir det ikke en rad til. */
      const finnes = d.items.filter(function(x){
        return x && x.oktId === okt.id && (x.omrade || 'mat') === oktOmr && !x.done
            && String(x.name || '').trim().toLowerCase() === navn.toLowerCase();
      })[0];
      if(finnes){ hoppet.push(navn); return; }

      const oppgitt = String(v.type || '').trim();
      const fra = katalog[navn.toLowerCase()];
      const cat = SKRIV_VARETYPER.indexOf(oppgitt) !== -1 ? oppgitt
                : (fra && SKRIV_VARETYPER.indexOf(fra.type) !== -1 ? fra.type : '');

      /* Mengden: `amt` og `unit` deles fra teksten naar den ser ut som et
         maal, ellers blir hele strengen staaende i `qty` - som sida gjoer
         det for verdier den ikke kjenner igjen. */
      const m = String(v.mengde || '').trim();
      const delt = /^(\d+(?:[.,]\d+)?)\s*([a-zA-ZæøåÆØÅ]+)?$/.exec(m);

      d.items.push({
        id: skrivId('i'),
        name: navn,
        oktId: okt.id,
        store: '', cat: cat, by: '',
        notes: '',
        qty: delt ? '' : m,
        count: String(v.antall || '').trim(),
        amt: delt ? delt[1] : '',
        unit: delt ? (delt[2] || '') : '',
        basis: !!(fra && fra.basis),
        omrade: oktOmr,
        done: false
      });
      lagt.push({ vare: navn, type: cat || null });
    });

    if(lagt.length) await dataSkriv(SKRIV_HANDLELISTE, d);

    return {
      handletur: okt.navn,
      omrade: oktOmr === 'annet' ? 'Andre varer' : 'Dagligvarer',
      lagt_til: lagt,
      sto_der_fra_for: hoppet,
      merknad: lagt.length
        ? 'Varene vises på Matlaging neste gang siden åpnes.'
        : 'Ingenting ble lagt til.'
    };
  }


  /* ---------------- Fjerne, endre, handleturer ---------------- */
  if(navn === 'fjern_fra_handlelista' || navn === 'endre_vare_paa_handlelista'
  || navn === 'ny_handletur' || navn === 'start_handletur'
  || navn === 'avslutt_handletur'){

    const d = await dataLes(SKRIV_HANDLELISTE) || {};
    if(!Array.isArray(d.okter)) d.okter = [];
    if(!Array.isArray(d.items)) d.items = [];

    if(navn === 'ny_handletur'){
      const omr = arg.omrade === 'annet' ? 'annet' : 'mat';
      const okt = { id: skrivId('o'),
                    navn: String(arg.navn || '').trim() || 'Uke ' + skrivUke(new Date()),
                    omrade: omr, startet: false, startTid: null, opprettet: Date.now() };
      d.okter.push(okt);
      await dataSkriv(SKRIV_HANDLELISTE, d);
      return { laget:true, handletur: okt.navn,
               omrade: omr === 'annet' ? 'Andre varer' : 'Dagligvarer' };
    }

    if(navn === 'fjern_fra_handlelista'){
      const navnene = (Array.isArray(arg.varer) ? arg.varer : [])
        .map(function(v){ return String(v || '').trim(); }).filter(Boolean);
      if(!navnene.length) throw new Error('Ingen varer å fjerne.');
      const fjernet = [], fant_ikke = [];
      const turer = {};
      navnene.forEach(function(n){
        const t = skrivFinnVareBredt(d, arg, n);
        if(!t.vare){ fant_ikke.push(n); return; }
        d.items = d.items.filter(function(x){ return x.id !== t.vare.id; });
        fjernet.push(t.vare.name);
        turer[t.okt.navn] = true;
      });
      if(fjernet.length) await dataSkriv(SKRIV_HANDLELISTE, d);
      return { handleturer: Object.keys(turer), fjernet: fjernet, fant_ikke: fant_ikke };
    }

    if(navn === 'endre_vare_paa_handlelista'){
      const t = skrivFinnVareBredt(d, arg, arg.vare);
      const okt = t.okt;
      const v = t.vare;
      if(!v) throw new Error('Fant ingen vare som heter «' + arg.vare + '»'
                           + (String(arg.handletur || '').trim()
                              ? ' i ' + okt.navn : ' på de åpne handleturene')
                           + '. Bruk les_handleliste.');
      if(arg.type !== undefined){
        if(SKRIV_VARETYPER.indexOf(arg.type) === -1){
          throw new Error('Ukjent varetype: ' + arg.type);
        }
        v.cat = arg.type;
      }
      if(arg.butikk !== undefined) v.store = String(arg.butikk || '').trim();
      if(arg.kjopt  !== undefined) v.done = !!arg.kjopt;
      if(arg.antall !== undefined) v.count = String(arg.antall || '').trim();
      if(arg.mengde !== undefined){
        /* Samme deling som naar varen legges inn: ser den ut som et maal,
           skilles tall og enhet; ellers blir hele strengen staaende. */
        const m = String(arg.mengde || '').trim();
        const delt = /^(\d+(?:[.,]\d+)?)\s*([a-zA-ZæøåÆØÅ]+)?$/.exec(m);
        v.qty  = delt ? '' : m;
        v.amt  = delt ? delt[1] : '';
        v.unit = delt ? (delt[2] || '') : '';
      }
      await dataSkriv(SKRIV_HANDLELISTE, d);
      return { endret:true, vare: v.name, handletur: okt.navn, kjopt: !!v.done };
    }

    /* «Avslutt handleturen» betyr den som er I GANG, ikke den nyeste.
       Er ingen startet, faller vi tilbake paa nyeste aapne. Uten dette
       traff «avslutt» en tom tur laget i gaar mens den man faktisk sto og
       handlet paa ble staaende. */
    let okt = null;
    if(!String(arg.handletur || '').trim()){
      const omr = arg.omrade === 'annet' ? 'annet' : 'mat';
      okt = d.okter.filter(function(o){
        return (o.omrade || 'mat') === omr && o.startet && !skrivErAvsluttet(o);
      }).sort(function(a, b){ return (b.startTid || 0) - (a.startTid || 0); })[0] || null;
    }
    if(!okt) okt = skrivFinnOkt(d, arg, false);

    if(navn === 'start_handletur'){
      if(skrivErAvsluttet(okt)){
        throw new Error('«' + okt.navn + '» er avsluttet. Lag en ny med ny_handletur.');
      }
      if(okt.startet) return { startet:false, handletur: okt.navn,
                               beskjed:'Den var i gang fra før.' };
      okt.startet = true;
      okt.startTid = Date.now();
      await dataSkriv(SKRIV_HANDLELISTE, d);
      return { startet:true, handletur: okt.navn };
    }

    /* avslutt_handletur */
    if(skrivErAvsluttet(okt)){
      return { avsluttet:false, handletur: okt.navn,
               beskjed:'Den var avsluttet fra før.' };
    }
    const igjen = skrivIgjen(d, okt);
    let gjort = 'Varene som ikke var kjøpt ble liggende.';

    if(arg.rester === 'flytt' && igjen.length){
      const neste = skrivNesteOkt(d, okt);
      if(!neste){
        throw new Error('Det finnes ingen annen åpen handletur å flytte '
                      + igjen.length + ' varer til. Lag en med ny_handletur først, '
                      + 'eller velg la_staa eller forkast.');
      }
      igjen.forEach(function(v){ v.oktId = neste.id; });
      gjort = igjen.length + ' varer flyttet til «' + neste.navn + '».';
    }else if(arg.rester === 'forkast' && igjen.length){
      const ider = {};
      igjen.forEach(function(v){ ider[v.id] = true; });
      d.items = d.items.filter(function(v){ return !ider[v.id]; });
      gjort = igjen.length + ' varer ble slettet.';
    }

    okt.startet = false;
    okt.avsluttet = Date.now();
    await dataSkriv(SKRIV_HANDLELISTE, d);
    return { avsluttet:true, handletur: okt.navn,
             sto_igjen: igjen.length, gjort: gjort };
  }


  /* ---------------- Kalenderen ---------------- */
  if(navn === 'legg_til_avtale'){
    if(!String(arg.tittel || '').trim()) throw new Error('Avtalen må ha et navn.');
    if(!/^\d{4}-\d{2}-\d{2}$/.test(String(arg.dato || ''))){
      throw new Error('Ugyldig dato. Bruk formen 2026-09-08.');
    }
    const k = await skrivFinnKalender(arg.kalender);
    let c = k.treff;
    if(arg.kalender && !c){
      throw new Error('Fant ingen kalender som heter «' + arg.kalender
                    + '». Bruk les_kalender for navnene.');
    }
    if(!c){
      /* Ingen kalender oppgitt. Er det bare ÉN vi kan skrive i, er valget
         gitt; er det flere, skal Neam spoerre - ikke gjette hvem avtalen
         gjelder. */
      const kan = k.alle.filter(function(x){ return x.canEdit !== false; });
      if(kan.length !== 1){
        throw new Error('Si hvilken kalender avtalen skal i. Bruk les_kalender '
                      + 'for navnene.');
      }
      c = kan[0];
    }
    if(c.canEdit === false){
      throw new Error('Kalenderen «' + c.name + '» er delt med oss som lesetilgang.');
    }

    const heleDagen = !!arg.heleDagen || !arg.fra;
    const p = {
      subject: String(arg.tittel).trim(),
      isAllDay: heleDagen,
      location: { displayName: String(arg.sted || '').trim() },
      body: { contentType:'text', content: String(arg.notat || '').trim() }
    };
    if(heleDagen){
      const d2 = arg.sluttdato || arg.dato;
      if(d2 < arg.dato) throw new Error('Sluttdatoen er før startdatoen.');
      /* Graph vil ha dagen ETTER som slutt paa en heldagsavtale. */
      const etter = new Date(d2 + 'T00:00:00');
      etter.setDate(etter.getDate() + 1);
      const p2 = function(n){ return String(n).padStart(2, '0'); };
      p.start = { dateTime: arg.dato + 'T00:00:00', timeZone: SKRIV_TZ };
      p.end   = { dateTime: etter.getFullYear() + '-' + p2(etter.getMonth() + 1)
                          + '-' + p2(etter.getDate()) + 'T00:00:00', timeZone: SKRIV_TZ };
    }else{
      if(!/^\d{2}:\d{2}$/.test(String(arg.fra || ''))
      || !/^\d{2}:\d{2}$/.test(String(arg.til || ''))){
        throw new Error('Send både fra og til som klokkeslett, for eksempel 14:30.');
      }
      const d2 = (arg.sluttdato && arg.sluttdato >= arg.dato) ? arg.sluttdato : arg.dato;
      if(d2 === arg.dato && arg.til <= arg.fra){
        throw new Error('Sluttidspunktet må være etter starten.');
      }
      p.start = { dateTime: arg.dato + 'T' + arg.fra + ':00', timeZone: SKRIV_TZ };
      p.end   = { dateTime: d2 + 'T' + arg.til + ':00', timeZone: SKRIV_TZ };
    }

    const laget = await skrivGraph('/me/calendars/' + encodeURIComponent(c.id) + '/events',
                                   'POST', p);
    /* Staar vi PAA kalendersida, skal skjermen vise det med det samme. */
    if(typeof refresh === 'function'){ try{ await refresh(); }catch(e){} }
    return { lagret:true, id: laget && laget.id, kalender: c.name,
             tittel: p.subject, dato: arg.dato };
  }

  if(navn === 'endre_avtale' || navn === 'slett_avtale'){
    const id = String(arg.id || '').trim();
    const kalId = String(arg.kalender_id || '').trim();
    if(!id || !kalId){
      throw new Error('Både id og kalender_id må med. Kjør les_kalender for tidsrommet '
                    + 'først, og bruk verdiene derfra.');
    }
    /* Er den gjentagende, maa omfanget vaere avklart. Vi spoer Graph i
       stedet for aa stole paa at Neam husket riktig fra lesingen. */
    const info = await lesAltGraph('/me/calendars/' + encodeURIComponent(kalId)
                                 + '/events/' + encodeURIComponent(id)
                                 + '?$select=id,subject,type,seriesMasterId,isAllDay,start,end');
    const erSerie = !!(info && (info.seriesMasterId
                    || info.type === 'occurrence' || info.type === 'exception'));
    if(erSerie && arg.omfang !== 'denne' && arg.omfang !== 'serien'){
      throw new Error('«' + ((info && info.subject) || 'Avtalen') + '» er gjentagende. '
                    + 'Spør brukeren om det gjelder bare denne gangen eller hele serien, '
                    + 'og send omfang «denne» eller «serien». Ikke velg selv.');
    }
    const sti = await skrivAvtaleSti(kalId, id, erSerie ? arg.omfang : 'denne');

    if(navn === 'slett_avtale'){
      await skrivGraph(sti, 'DELETE', null);
      if(typeof refresh === 'function'){ try{ await refresh(); }catch(e){} }
      return { slettet:true, tittel: (info && info.subject) || null,
               omfang: erSerie ? arg.omfang : 'enkeltavtale' };
    }

    const p = {};
    if(arg.tittel !== undefined){
      if(!String(arg.tittel).trim()) throw new Error('Avtalen må ha et navn.');
      p.subject = String(arg.tittel).trim();
    }
    if(arg.sted  !== undefined) p.location = { displayName: String(arg.sted).trim() };
    if(arg.notat !== undefined) p.body = { contentType:'text', content: String(arg.notat).trim() };

    /* Tid: dato og klokkeslett henger sammen. Endres ett av dem, maa hele
       start og slutt settes paa nytt - Graph tar ikke imot en halv tid. */
    if(arg.dato !== undefined || arg.fra !== undefined || arg.til !== undefined){
      const naa = new Date(String((info && info.start && info.start.dateTime) || ''));
      const p2 = function(n){ return String(n).padStart(2, '0'); };
      const gjeldende = isNaN(naa) ? null : {
        dato: naa.getFullYear() + '-' + p2(naa.getMonth() + 1) + '-' + p2(naa.getDate()),
        fra:  p2(naa.getHours()) + ':' + p2(naa.getMinutes())
      };
      const slutt = new Date(String((info && info.end && info.end.dateTime) || ''));
      const dato = arg.dato || (gjeldende && gjeldende.dato);
      if(!dato || !/^\d{4}-\d{2}-\d{2}$/.test(dato)){
        throw new Error('Ugyldig dato. Bruk formen 2026-09-08.');
      }
      const heleDagen = (arg.heleDagen !== undefined) ? !!arg.heleDagen
                      : !!(info && info.isAllDay);
      if(heleDagen && arg.fra === undefined){
        const dager = (!isNaN(slutt) && !isNaN(naa))
          ? Math.max(1, Math.round((slutt - naa) / 86400000)) : 1;
        const etter = new Date(dato + 'T00:00:00');
        etter.setDate(etter.getDate() + dager);
        p.isAllDay = true;
        p.start = { dateTime: dato + 'T00:00:00', timeZone: SKRIV_TZ };
        p.end   = { dateTime: etter.getFullYear() + '-' + p2(etter.getMonth() + 1)
                            + '-' + p2(etter.getDate()) + 'T00:00:00', timeZone: SKRIV_TZ };
      }else{
        const fra = arg.fra !== undefined ? arg.fra : (gjeldende && gjeldende.fra);
        const til = arg.til !== undefined ? arg.til
                  : (isNaN(slutt) ? null : p2(slutt.getHours()) + ':' + p2(slutt.getMinutes()));
        if(!/^\d{2}:\d{2}$/.test(String(fra)) || !/^\d{2}:\d{2}$/.test(String(til))){
          throw new Error('Klokkeslett skal være på formen 14:30.');
        }
        if(til <= fra) throw new Error('Sluttidspunktet må være etter starten.');
        p.isAllDay = false;
        p.start = { dateTime: dato + 'T' + fra + ':00', timeZone: SKRIV_TZ };
        p.end   = { dateTime: dato + 'T' + til + ':00', timeZone: SKRIV_TZ };
      }
    }

    if(!Object.keys(p).length) throw new Error('Ingenting å endre - send minst ett felt.');
    await skrivGraph(sti, 'PATCH', p);
    if(typeof refresh === 'function'){ try{ await refresh(); }catch(e){} }
    return { endret:true, tittel: p.subject || (info && info.subject) || null,
             omfang: erSerie ? arg.omfang : 'enkeltavtale' };
  }

  /* ---------------- Skolearbeidet ---------------- */

  /* Sperren staar baade her og i skrivVerktoy(). Lista bygges ved hver
     melding, men et verktoey Neam alt har sett i samtalen kan han forsoeke
     igjen etterpaa - og da skal det si nei her ogsaa. */
  if(SKRIV_SKOLE.indexOf(navn) !== -1 && !skrivSkoleTillatt()){
    throw new Error('Skolearbeidet kan bare endres fra en skjerm der noen er logget '
                  + 'inn som seg selv. Si at det må gjøres fra telefonen eller fra '
                  + 'barnets egen dash.');
  }

  if(navn === 'legg_til_lekse'){
    const tekst = String(arg.tekst || '').trim();
    if(!tekst) throw new Error('Leksa må ha en tekst.');
    const frist = skrivDatoKrev(arg.frist, 'Fristen');
    let fagNavn = '';
    await skrivFagEndre(arg.barn, function(d){
      const f = skrivFagFinn(d, arg.fag);
      fagNavn = f.navn;
      /* Samme felter som legg_til_lekse i emma.html. `av` er hvem som la
         den inn, og det er Neam - ikke den som ba om det. */
      d.lekser.push({ id:skrivFagId(), fagId:f.id, tekst:tekst, frist:frist,
                      ferdig:false, laget:skrivDatoNokkel(new Date()),
                      nar:skrivNaaKlokke(), av:'Neam', bilder:[] });
      return d;
    });
    return { lagt:{ barn:skrivBarnNavn(arg.barn), fag:fagNavn, tekst:tekst,
                    frist:frist || null } };
  }

  if(navn === 'endre_lekse'){
    const felt = {};
    if(arg.tekst  !== undefined) felt.tekst  = String(arg.tekst).trim();
    if(arg.frist  !== undefined) felt.frist  = skrivDatoKrev(arg.frist, 'Fristen');
    if(arg.ferdig !== undefined) felt.ferdig = !!arg.ferdig;
    if(!Object.keys(felt).length && arg.fag === undefined){
      throw new Error('Ingenting å endre - send minst ett felt.');
    }
    let ut = null;
    await skrivFagEndre(arg.barn, function(d){
      const gammel = d.lekser.filter(function(l){ return l.id === arg.id; })[0];
      if(!gammel) throw new Error('Fant ingen lekse med id «' + arg.id + '» hos '
                                + skrivBarnNavn(arg.barn)
                                + '. Kjør les_skolearbeid på nytt - den kan være '
                                + 'slettet eller endret et annet sted.');
      const endring = Object.assign({}, felt);
      if(arg.fag !== undefined) endring.fagId = skrivFagFinn(d, arg.fag).id;
      /* Bare denne ene raden roeres. Resten av objektet er det vi nettopp
         leste, ikke noe vi har baaret med oss. */
      d.lekser = d.lekser.map(function(l){
        return l.id === arg.id ? Object.assign({}, l, endring) : l;
      });
      const ny = d.lekser.filter(function(l){ return l.id === arg.id; })[0];
      ut = { barn:skrivBarnNavn(arg.barn), fag:skrivFagNavnAv(d, ny.fagId),
             tekst:ny.tekst, frist:ny.frist || null, ferdig:!!ny.ferdig };
      return d;
    });
    return { endret: ut };
  }

  if(navn === 'slett_lekse'){
    let tekst = '';
    await skrivFagEndre(arg.barn, function(d){
      const l = d.lekser.filter(function(x){ return x.id === arg.id; })[0];
      if(!l) throw new Error('Fant ingen lekse med id «' + arg.id + '» hos '
                           + skrivBarnNavn(arg.barn) + '. Kjør les_skolearbeid på nytt.');
      tekst = l.tekst;
      d.lekser = d.lekser.filter(function(x){ return x.id !== arg.id; });
      return d;
    });
    return { slettet:true, barn:skrivBarnNavn(arg.barn), tekst:tekst };
  }

  if(navn === 'legg_til_prove'){
    const type = String(arg.type || '').trim();
    if(!type) throw new Error('Prøven må ha en type - «prøve», «innlevering», «framføring».');
    const dato = skrivDatoKrev(arg.dato, 'Datoen');
    let fagNavn = '';
    await skrivFagEndre(arg.barn, function(d){
      const f = skrivFagFinn(d, arg.fag);
      fagNavn = f.navn;
      d.prover.push({ id:skrivFagId(), fagId:f.id, type:type, dato:dato,
                      karakter:String(arg.karakter || '').trim(), av:'Neam' });
      return d;
    });
    return { lagt:{ barn:skrivBarnNavn(arg.barn), fag:fagNavn, type:type,
                    dato:dato || null } };
  }

  if(navn === 'endre_prove'){
    const felt = {};
    if(arg.type     !== undefined) felt.type     = String(arg.type).trim();
    if(arg.dato     !== undefined) felt.dato     = skrivDatoKrev(arg.dato, 'Datoen');
    if(arg.karakter !== undefined) felt.karakter = String(arg.karakter).trim();
    if(!Object.keys(felt).length) throw new Error('Ingenting å endre - send minst ett felt.');
    let ut = null;
    await skrivFagEndre(arg.barn, function(d){
      const p = d.prover.filter(function(x){ return x.id === arg.id; })[0];
      if(!p) throw new Error('Fant ingen prøve med id «' + arg.id + '» hos '
                           + skrivBarnNavn(arg.barn) + '. Kjør les_skolearbeid på nytt.');
      d.prover = d.prover.map(function(x){
        return x.id === arg.id ? Object.assign({}, x, felt) : x;
      });
      const ny = d.prover.filter(function(x){ return x.id === arg.id; })[0];
      ut = { barn:skrivBarnNavn(arg.barn), fag:skrivFagNavnAv(d, ny.fagId),
             type:ny.type, dato:ny.dato || null, karakter:ny.karakter || null };
      return d;
    });
    return { endret: ut };
  }

  if(navn === 'sett_laeringsmaal'){
    const uke = skrivUkeNokkel(arg.uke);
    const tekst = String(arg.maal || '').trim();
    let fagNavn = '';
    await skrivFagEndre(arg.barn, function(d){
      const f = skrivFagFinn(d, arg.fag);
      fagNavn = f.navn;
      /* Maalene ligger PER UKE. Vi roerer den ene uka og lar de andre
         staa - se ryddFag() i emma.html for hvorfor. */
      d.fag = d.fag.map(function(x){
        if(x.id !== f.id) return x;
        const m = Object.assign({}, x.maal || {});
        if(tekst) m[uke] = tekst; else delete m[uke];
        return Object.assign({}, x, { maal:m });
      });
      return d;
    });
    return { barn:skrivBarnNavn(arg.barn), fag:fagNavn, uke:uke, maal:tekst || null };
  }

  return null;
}

/* Verktoeyene sida ikke alt har selv - samme regel som lesAltVerktoy().
   Staar man PAA Matlaging, vinner sidas eget legg_til_varer: bare det ser
   hvilken handletur brukeren faktisk har oppe, og bare det tegner lista
   om etterpaa. */
function skrivVerktoy(egne){
  const tatt = {};
  (egne || []).forEach(function(v){ if(v && v.name) tatt[v.name] = true; });
  const skole = skrivSkoleTillatt();
  return SKRIV_VERKTOY.filter(function(v){
    if(tatt[v.name]) return false;
    /* Skolearbeidet bare der noen er logget inn som seg selv - se
       avsnittet om skolearbeidet over. Et verktoey som ikke kan virke
       er verre enn ingen: Neam lover da noe han ikke kan holde. */
    if(!skole && SKRIV_SKOLE.indexOf(v.name) !== -1) return false;
    return true;
  });
}
