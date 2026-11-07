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

/* ------------------------------------------------------------
   Matlaging
   ------------------------------------------------------------
   Oppskriftsboka skriver gjennom sin egen fullKey(), som setter
   `p:` foran. Noeklene gjentas derfor ikke her - de staar i
   felles-data.js (OPPSKRIFT_INDEKS, OPPSKRIFT_NOKKEL,
   UKEPLAN_NOKKEL), som lastes foer denne fila, og én nokkel ett
   sted er hele poenget.

   TO NOEKLER, ÉN SANNHET. Hver oppskrift bor under `p:recipe:<id>`
   med alt innholdet, og `p:recipe-index` baerer en kort rad per
   oppskrift til forsida. Skriver man bare den ene, finnes
   oppskriften halvveis: enten usynlig i lista, eller som en rad
   som aapner ingenting. Alle tre verktoeyene under roerer begge.

   VERDIENE ER JSON-STRENGER. window.storage i Matlaging lagrer
   JSON.stringify(objektet), og KV-funksjonen stringifyer det den
   faar én gang til. Vi skriver derfor dataSkriv(nokkel,
   JSON.stringify(x)) og leser med husLesJson(), som pakker ut
   begge lagene. Skriver man objektet raatt, staar oppskriften der
   i en form sida ikke kan lese.
   ------------------------------------------------------------ */

/* Samme liste som CATEGORY_LIST i oppskrifter.html. Duplisert, ikke
   delt: fellesfila kan ikke lese en const inne i sida. Endres lista
   der, endres den her - en kategori som ikke finnes i filteret gjoer
   oppskriften umulig aa finne igjen. */
const SKRIV_MAT_KATEGORIER = ['Frokost', 'Lunsj', 'Middag', 'Kvelds',
  'Bakst', 'Brødbakst', 'Søtbakst', 'Snacks', 'Sauser',
  'Krydderblandinger', 'Tilbehør'];

/* Standard porsjoner i ukemenyen naar oppskriften ikke sier noe.
   PLAN_STD_PORSJONER i oppskrifter.html. */
const SKRIV_MAT_PORSJONER = 4;

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
                     'legg_til_prove', 'endre_prove', 'sett_laeringsmaal',
                     'legg_til_fag', 'endre_fag', 'sett_diktatord'];

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

/* Fra 8. november 2026 ogsaa paa kjoekkenskjermen naar noen har tastet
   pinkoden sin (neamHvemStaar i felles-neam.js) - med de samme
   rettighetene som om de var logget inn som seg selv. */
function skrivSkoleTillatt(){
  if(skrivMegPerson) return true;
  return typeof neamHvemStaar === 'function' && !!neamHvemStaar();
}

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
                                  + 'Fagene er: ' + navnene + '. Mangler faget, '
                                  + 'lag det med legg_til_fag.');
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


/* ============================================================
   Gjentakelse - én bygger, to veier inn
   ------------------------------------------------------------
   Skjemaet i kalender.html og Neam skal ikke kunne lage hver sin
   sort serie, saa formen paa `recurrence` lages ETT sted. Sida
   kaller denne ogsaa - den laster felles-skriv.js fra foer.

   Samme fire moenstre som skjemaet tilbyr, og samme krav: en serie
   maa ha en slutt. En dato, eller et antall ganger. Graph har en
   tredje form (`noEnd`), og den er med vilje utelatt begge steder.
   ============================================================ */

/* Norsk inn, Graphs egne navn ut. Begge skrivemaatene av loerdag og
   soendag staar med: en modell som skriver «lordag» skal ikke faa en
   feilmelding om en bokstav. */
const SKRIV_GJENTA_DAGER = {
  'mandag':'monday', 'tirsdag':'tuesday', 'onsdag':'wednesday',
  'torsdag':'thursday', 'fredag':'friday',
  'lørdag':'saturday', 'lordag':'saturday',
  'søndag':'sunday',  'sondag':'sunday'
};

/* getDay()-rekkefoelge: soendag er 0. */
const SKRIV_GJENTA_UKEDAG = ['sunday','monday','tuesday','wednesday','thursday',
                             'friday','saturday'];

function skrivGjentakelse(arg, dato){
  const v = String((arg && arg.gjentas) || '').trim().toLowerCase();
  if(!v) return null;

  if(['daglig','ukentlig','annenhver','manedlig','arlig'].indexOf(v) === -1){
    throw new Error('Ukjent gjentakelse «' + arg.gjentas + '». Bruk daglig, ukentlig, '
                  + 'annenhver, manedlig eller arlig.');
  }
  if(arg.sluttdato && arg.sluttdato !== dato){
    throw new Error('En gjentagende avtale kan ikke gå over flere dager. Send samme '
                  + 'dato, eller la sluttdato stå tom.');
  }
  const start = new Date(dato + 'T00:00:00');
  if(isNaN(start)) throw new Error('Ugyldig dato for en gjentagende avtale.');

  const p = { interval: v === 'annenhver' ? 2 : 1 };
  if(v === 'daglig') p.type = 'daily';
  else if(v === 'ukentlig' || v === 'annenhver'){
    p.type = 'weekly';
    const inn = Array.isArray(arg.ukedager) ? arg.ukedager : [];
    const dager = inn.map(function(d){
      const n = SKRIV_GJENTA_DAGER[String(d || '').trim().toLowerCase()];
      if(!n) throw new Error('Ukjent ukedag «' + d + '». Skriv dem på norsk: mandag, '
                           + 'tirsdag, onsdag, torsdag, fredag, lørdag, søndag.');
      return n;
    });
    p.daysOfWeek = dager.length ? dager : [SKRIV_GJENTA_UKEDAG[start.getDay()]];
    /* Uten firstDayOfWeek regner Graph annenhver uke fra soendag, og en
       mandagstrening havner i feil uke annenhver gang. */
    p.firstDayOfWeek = 'monday';
  }
  else if(v === 'manedlig'){ p.type = 'absoluteMonthly'; p.dayOfMonth = start.getDate(); }
  else { p.type = 'absoluteYearly'; p.dayOfMonth = start.getDate();
         p.month = start.getMonth() + 1; }

  const r = { startDate: dato, recurrenceTimeZone: SKRIV_TZ };
  const til = String((arg && arg.slutter) || '').trim();
  const ganger = parseInt(arg && arg.ganger, 10);

  if(til){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(til)){
      throw new Error('Ugyldig sluttdato. Bruk formen 2026-12-15.');
    }
    if(til < dato) throw new Error('Serien kan ikke slutte før den begynner.');
    r.type = 'endDate';
    r.endDate = til;
  }else if(ganger >= 1){
    r.type = 'numbered';
    r.numberOfOccurrences = ganger;
  }else{
    throw new Error('En gjentagende avtale må ha en slutt. Spør brukeren om den skal gå '
                  + 'til en dato (slutter) eller et antall ganger (ganger) - ikke velg '
                  + 'selv.');
  }
  return { pattern: p, range: r };
}

/* Setningen bekreftelsen viser. Tom naar avtalen ikke gjentas. */
function skrivGjentaTekst(arg){
  const v = String((arg && arg.gjentas) || '').trim().toLowerCase();
  if(!v) return '';
  const navn = { daglig:'hver dag', ukentlig:'hver uke', annenhver:'annenhver uke',
                 manedlig:'hver måned', arlig:'hvert år' };
  const dager = Array.isArray(arg.ukedager) && arg.ukedager.length
    ? ' (' + arg.ukedager.join(', ') + ')' : '';
  const slutt = String(arg.slutter || '').trim()
    ? ', til og med ' + skrivDatoTekst(arg.slutter)
    : (parseInt(arg.ganger, 10) >= 1 ? ', ' + parseInt(arg.ganger, 10) + ' ganger' : '');
  return (navn[v] || v) + dager + slutt;
}

/* ============================================================
   Paaminnelsene - huskelista paa tvers
   ------------------------------------------------------------
   Lagt til 20. september 2026. Én KV-noekkel, `huskeliste`, og tre
   skjermer som viser den samme lista: kjoekkendashen kaller radene
   MERKNADER, Emma og Andrea kaller dem PAAMINNELSER.

   FOER DETTE fantes verktoeyene bare paa barnas to skjermer, og
   bare for aa lese og legge til. Veggskjermen - den man staar ved
   naar noen sier «roerleggeren kommer torsdag» - hadde ingen. Det
   var ikke et valg; det var bare der lista ble TEGNET.

   FRIST OG OMFANG HENGER SAMMEN, og settes aldri hver for seg:
     omfang 'dag'  -> frist er datoen, og raden staar i dagsboksen
     omfang 'uke'  -> frist er SOENDAGEN i uka, og raden staar i
                      ukesboksen - det er slik ukeAv() finner sine
   Settes de i utakt, forsvinner raden fra begge boksene, og
   ingenting feiler.

   SKRIVINGEN GAAR GJENNOM SIDAS EGEN KO der sida har en: de tre
   skjermene leser friskt, fletter, lagrer og tegner om. Da ser man
   raden komme mens man staar der. Har sida ingen, skriver vi selv.
   ============================================================ */
const SKRIV_HUSKE = 'huskeliste';

/* Navnene skjermene fargelegger etter. Et navn utenfor lista gir en
   rad uten farge og uten bokstavmerke, saa den avvises heller. */
const SKRIV_HUSKE_HVEM = ['Familie', 'Magne', 'Nina', 'Emma', 'Andrea'];

/* Sist leste liste. Bekreftelsesteksten er synkron og kan ikke slaa opp
   selv - og Neam har alltid kjoert les_paaminnelser for aa faa en id. */
let skrivHuskeSiste = [];

async function skrivHuskeLes(){
  let d = null;
  try{ d = await dataLes(SKRIV_HUSKE); }catch(e){ d = null; }
  if(typeof d === 'string'){ try{ d = JSON.parse(d); }catch(e){ d = null; } }
  skrivHuskeSiste = Array.isArray(d) ? d : [];
  return skrivHuskeSiste;
}

async function skrivHuskeEndre(endring){
  /* Sidas egen ko leser friskt, fletter, lagrer OG tegner om. Den er
     bedre enn vaar egen skriving overalt der den finnes. */
  if(typeof endreHuske === 'function') return await endreHuske(endring);
  const ny = endring(await skrivHuskeLes());
  await dataSkriv(SKRIV_HUSKE, ny);
  skrivHuskeSiste = ny;
  return ny;
}

function skrivHuskeFinn(liste, id){
  const nokkel = String(id || '').trim();
  const m = liste.filter(function(x){ return x && x.id === nokkel; })[0];
  if(!m) throw new Error('Fant ingen påminnelse med id «' + id + '». Kjør '
                       + 'les_paaminnelser først, og bruk id-en derfra.');
  return m;
}

/* Til bekreftelsen: navnet, ikke id-en. Er den ikke lest inn, sies det -
   det ses foer man trykker ja, ikke etterpaa. */
function skrivHuskeNavn(id){
  const m = skrivHuskeSiste.filter(function(x){ return x && x.id === id; })[0];
  return m ? ('«' + (m.overskrift || 'uten tekst') + '»')
           : ('en påminnelse som ikke er lest inn (' + id + ')');
}

/* skrivDatoNokkel() staar lenger opp i fila - den er felles. */

/* Soendagen i uka - der ukesboksen leter etter sine punkter. */
function skrivUkeSlutt(uke){
  const n = skrivUkeNokkel(uke);              /* «2026-W38» */
  const aar = Number(n.slice(0, 4));
  const nr  = Number(n.slice(6));
  /* 4. januar ligger alltid i uke 1. Derfra er det hele uker. */
  const d = new Date(aar, 0, 4);
  d.setDate(d.getDate() - ((d.getDay() || 7) - 1) + (nr - 1) * 7 + 6);
  return d;
}

function skrivHuskeHvem(navn){
  const s = String(navn || '').trim().toLowerCase();
  if(!s) return 'Familie';
  const treff = SKRIV_HUSKE_HVEM.filter(function(p){ return p.toLowerCase() === s; })[0];
  if(!treff) throw new Error('«' + navn + '» er ikke en av dem huset kjenner. Bruk '
                           + SKRIV_HUSKE_HVEM.join(', ') + '.');
  return treff;
}

/* Dato eller uke inn, frist og omfang ut - se blokka over. */
function skrivHuskeNaar(arg){
  const dato = String((arg && arg.dato) || '').trim();
  if(dato){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(dato)){
      throw new Error('Ugyldig dato. Bruk formen 2026-09-08.');
    }
    return { omfang:'dag', frist: dato };
  }
  return { omfang:'uke', frist: skrivDatoNokkel(skrivUkeSlutt(arg && arg.uke)) };
}

function skrivHuskeLinje(m){
  return { id: m.id,
           tekst: m.overskrift || '',
           utdypning: m.tekst || null,
           dato: m.frist || null,
           hvor: m.omfang === 'uke' ? 'Påminnelser denne uken' : 'Påminnelser i dag',
           gjelder: m.gjelder || '',
           ferdig: !!m.ferdig,
           av: m.av || null };
}

/* Setningen for hvor raden havner - den samme i alle bekreftelsene. */
function skrivHuskeNaarTekst(arg){
  const naar = skrivHuskeNaar(arg);
  return naar.omfang === 'dag'
    ? skrivDatoTekst(naar.frist) + ', i dagsboksen'
    : 'uke ' + skrivIsoUke(skrivUkeSlutt(arg && arg.uke)).uke + ', i ukesboksen';
}

/* ------------------------------------------------------------
   Matlaging - hjelperne
   ------------------------------------------------------------ */

/* Dagnummer 1-7 av et dagnavn. HUS_UKEDAGER i felles-data.js har
   tom streng paa plass 0, saa indeksen ER dagnummeret. */
function skrivMatDag(dag){
  const n = String(dag || '').trim().toLowerCase();
  const i = HUS_UKEDAGER.indexOf(n);
  if(i < 1) throw new Error('Ukjent dag: «' + dag + '». Bruk mandag til søndag.');
  return i;
}

/* Bare kategorier huset kjenner. En ukjent kategori blir usynlig i
   filteret, og oppskriften umulig aa finne igjen. Samme sjekk som
   neamLagreOppskrift() i oppskrifter.html. */
function skrivMatKategorier(liste, tittel){
  const kat = (liste || [])
    .map(function(c){
      return SKRIV_MAT_KATEGORIER.filter(function(k){
        return k.toLowerCase() === String(c).trim().toLowerCase();
      })[0];
    })
    .filter(Boolean);
  if(!kat.length){
    throw new Error('«' + (tittel || 'Oppskriften') + '» mangler en gyldig kategori. '
                  + 'Gyldige: ' + SKRIV_MAT_KATEGORIER.join(', ') + '.');
  }
  return kat;
}

/* amount er tall, amountText det som ikke lot seg regne paa («en
   klype»). Bare én av dem er satt - se lesOppskrift() i
   felles-data.js, som leser dem tilbake. */
function skrivMatIngredienser(liste){
  return (liste || []).map(function(i){
    const tall = (typeof i.mengde === 'number' && !isNaN(i.mengde)) ? i.mengde : null;
    return {
      amount: tall,
      amountText: tall === null ? String(i.mengdetekst || '').trim() : '',
      unit: String(i.enhet || '').trim(),
      name: String(i.navn || '').trim(),
      allergens: [],
      nutrition: null,
      section: ''
    };
  }).filter(function(i){ return i.name; });
}

function skrivMatSteg(liste){
  return (liste || [])
    .map(function(t){ return String(t || '').trim(); })
    .filter(Boolean)
    .map(function(t){ return { text:t, photo:null, section:'' }; });
}

/* RENE STRENGER, ikke objekter. Neam lagret tipsene som {text:...} en
   periode, og de oppskriftene lot seg ikke AAPNE i det hele tatt - de
   sto i lista og var doede. ryddOppskrift() i sida retter det ved
   lesing, men den retter ikke det vi skriver. */
function skrivMatTips(liste){
  return (liste || [])
    .map(function(t){ return (t && typeof t === 'object') ? String(t.text || '') : String(t == null ? '' : t); })
    .filter(function(t){ return t.trim(); });
}

async function skrivMatIndeks(){
  const d = await husLesJson(OPPSKRIFT_INDEKS);
  return Array.isArray(d) ? d : [];
}

/* Begge lagene: objektet stringifyes her, og KV-funksjonen
   stringifyer det den faar én gang til. Se blokka om JSON-strenger
   over - skriver man objektet raatt, staar oppskriften i en form
   sida ikke kan lese. */
async function skrivMatSkriv(nokkel, verdi){
  const r = await dataSkriv(nokkel, JSON.stringify(verdi));
  /* Leselaget bufrer indeksen i 60 sekunder. Skriver vi den uten aa
     tomme bufferet, leser Neam sin egen endring tilbake som det den
     var foer - og retter den en gang til. */
  if(nokkel === OPPSKRIFT_INDEKS) glemOppskriftsindeks();
  return r;
}

async function skrivMatHent(id){
  const r = await husLesJson(OPPSKRIFT_NOKKEL + id);
  if(!r || typeof r !== 'object'){
    throw new Error('Fant ingen oppskrift med id ' + id + '. Kjør finn_oppskrift først.');
  }
  return r;
}

/* Raden i indeksen holdes i takt med oppskriften. Feltene er de
   persistRecipeIndex() i sida skriver; `thumb` og terningkastene
   roeres ikke - de hoerer til bildet og vurderingene, som vi ikke
   eier herfra. */
function skrivMatIndeksRad(rad, r){
  return Object.assign({}, rad, {
    id: r.id,
    title: r.title,
    time: r.time,
    categories: r.categories
  });
}

/* ============================================================
   Fagene, varekatalogen, innboksen og diktaten
   ------------------------------------------------------------
   Lagt til 2. november 2026, som siste runde av «flytt det som kan
   flyttes». Reglene er lest ut av sidene, ikke gjettet:

     fagene      emma.html / andrea.html - dagNr(), dagerInn(),
                 fagKrev() og les_fagene
     katalogen   handleliste.html - katalogLagre() og sok_varekatalog
     innboksen   handleliste.html - innboksNavn() og neamLesNyPakke()
     diktaten    andrea.html - diktatNormal() og sett_diktatord

   HVA SOM IKKE BLE FLYTTET, og hvorfor det ikke er en forglemmelse:
   `finn_opprydding` og `slaa_sammen` hviler paa sidas egen
   mengdemotor - kjerne(), finnKlynger(), parseMengde(), normEnhet() og
   ENHET_ALIAS - som ogsaa «Rydd i varene» bruker. En kopi her ville
   vaert to motorer som skal holdes like, og det er dyrere enn at de to
   verktoeyene staar paa sin egen side. De flyttes den dagen motoren
   selv flyttes. `foresla_import`, `foresla_opprydding` og
   `foreslaa_lekser` tegner en skjerm sida eier, og kan ikke flyttes i
   det hele tatt - se designsystemet, «Neams verktoey».
   ============================================================ */

const SKRIV_INNBOKS      = 'innboks';
const SKRIV_DIKTAT       = 'andrea-diktat:v1';
const SKRIV_DIKTAT_MAKS  = 100;          /* som DIKTAT_MAKS_LISTER i sida */

/* Mandag er 0 - fagenes `dager` er indekser i denne lista, og det er
   sidenes egen rekkefoelge. Blandes den med Date.getDay(), der soendag
   er 0, flytter alle timer seg én dag. */
const SKRIV_UKEDAGER = ['mandag','tirsdag','onsdag','torsdag','fredag','lørdag','søndag'];

/* Tar «tor», «torsdag», «Torsdag.», «3» - samme som dagNr() i sida. */
function skrivDagNr(v){
  if(typeof v === 'number' && v >= 0 && v <= 6) return v;
  const n = String(v || '').trim().toLowerCase().replace(/[.]/g, '')
              .replace(/^soendag$/, 'søndag').replace(/^loerdag$/, 'lørdag');
  if(!n) return -1;
  if(/^[0-6]$/.test(n)) return +n;
  for(let i = 0; i < 7; i++){
    const d = SKRIV_UKEDAGER[i];
    if(d.indexOf(n) === 0 || n.indexOf(d) === 0) return i;
  }
  return -1;
}

/* Liste, streng eller tall inn - dagnumre ut. null naar ingenting ble
   sendt, saa et utelatt felt kan skilles fra «fjern alle dagene». */
function skrivDagerInn(v){
  if(v === undefined || v === null) return null;
  let biter;
  if(Array.isArray(v)) biter = v;
  else if(typeof v === 'string') biter = v.split(/\s*(?:,|;|\/|\bog\b|\+)\s*|\s+/i);
  else biter = [v];
  const ut = [];
  biter.forEach(function(d){
    const i = skrivDagNr(d);
    if(i !== -1 && ut.indexOf(i) === -1) ut.push(i);
  });
  ut.sort(function(a, b){ return a - b; });
  return ut;
}

function skrivDagNavn(dager){
  return (Array.isArray(dager) ? dager : [])
    .map(function(n){ return SKRIV_UKEDAGER[n]; }).filter(Boolean);
}

/* Én fagrad slik les_fagene svarer. `ukeN` er uka laeringsmaalet
   hentes for - skjermen bruker uka man ser paa, herfra er det denne. */
function skrivFagLinje(d, f, ukeN){
  const idag = skrivDatoNokkel(new Date());
  const lekser = (d.lekser || []).filter(function(x){
    return x.fagId === f.id && !x.ferdig;
  });
  const prover = (d.prover || []).filter(function(x){
    return x.fagId === f.id && x.dato && String(x.dato) >= idag;
  });
  return { id: f.id, navn: f.navn,
           faglaerer: f.laerer || null,
           ukedager: skrivDagNavn(f.dager),
           laeringsmaal: (f.maal && f.maal[ukeN]) || null,
           apneLekser: lekser.length,
           kommendeProver: prover.length };
}

/* ---- Varekatalogen ----
   `{ katalog:{ <navn i smaa bokstaver>:{vare, basis, type} }, avvist:[] }`
   `avvist` roeres ikke herfra - den hoerer til oppryddingen paa sida. */
async function skrivKatalogLes(){
  let d = null;
  try{ d = await dataLes(SKRIV_KATALOG); }catch(e){ d = null; }
  const o = (d && typeof d === 'object') ? d : {};
  return { katalog: (o.katalog && typeof o.katalog === 'object') ? o.katalog : {},
           avvist: Array.isArray(o.avvist) ? o.avvist : [] };
}

/* Samme regler som katalogLagre() i sida: navnet beholdes slik det ble
   skrevet foerste gang, og en utelatt `basis` endrer ikke det som star. */
function skrivKatalogLagre(k, navn, type, basis){
  const n = String(navn || '').trim();
  if(!n) return;
  const foer = k.katalog[n.toLowerCase()];
  k.katalog[n.toLowerCase()] = {
    vare:  foer ? foer.vare : n,
    basis: basis === undefined ? (foer ? !!foer.basis : false) : !!basis,
    type:  type || (foer ? foer.type : '') || 'Annet'
  };
}

/* ---- Diktaten ---- Samme normalisering som diktatNormal() i sida: den
   gamle enkeltlista loeftes inn i `lister`, og halve lister kastes. */
function skrivDiktatNormal(d){
  const lister = (d && Array.isArray(d.lister)) ? d.lister
               : (d && d.liste) ? [d.liste] : [];
  return {
    versjon: 2,
    lister: lister.filter(function(l){
      return l && typeof l.id === 'string' && Array.isArray(l.ord) && l.ord.length;
    }),
    runder: (d && Array.isArray(d.runder)) ? d.runder : []
  };
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
    name: 'les_paaminnelser',
    description: 'Påminnelsene huset har liggende - det kjøkkenskjermen kaller '
               + 'MERKNADER og barnas skjermer kaller PÅMINNELSER. Én liste, sett '
               + 'fra tre steder. Gir id, tekst, hvem den gjelder, hvilken boks den '
               + 'står i og om den er huket av. Bruk id-ene herfra i de andre '
               + 'verktøyene.\n\n'
               + 'LEKSENE som vises i samme boks er IKKE påminnelser. De bor i faget '
               + 'og hentes med les_skolearbeid - en lekse lagt inn her ville blitt '
               + 'to ting som er uenige første gang noen huker av.',
    input_schema: {
      type:'object',
      properties:{
        gjelder:    { type:'string', description:'Bare én persons: Familie, Magne, Nina, '
                                               + 'Emma eller Andrea. Utelat for alle.' },
        medFerdige: { type:'boolean', description:'true tar med de avhukede også.' }
      },
      required:[]
    }
  },
  {
    name: 'legg_til_paaminnelse',
    description: 'Legger en påminnelse på skjermene. Brukes til beskjeder som skal '
               + 'huskes: at noen kommer, at noe skal leveres, at noe må med.\n\n'
               + 'MED DATO havner den i dagsboksen på den datoen. UTEN DATO gjelder '
               + 'den uka, og havner i ukesboksen - send da uke, ellers havner den i '
               + 'uka det er nå.\n\n'
               + 'SI HVEM DEN GJELDER. Uten det står den på Familie, og en beskjed '
               + 'til én person blir da liggende som om den gjaldt alle.\n\n'
               + 'SEND ALDRI EN LEKSE HIT - lekser hører til et fag og går gjennom '
               + 'legg_til_lekse.',
    input_schema: {
      type:'object',
      properties:{
        tekst:     { type:'string', description:'Kort overskrift. Det er denne som leses '
                                              + 'på skjermen - hold den på få ord.' },
        utdypning: { type:'string', description:'Valgfri lengre tekst, vises når '
                                              + 'påminnelsen åpnes.' },
        dato:      { type:'string', description:'Dato på formen 2026-09-08. Utelat for '
                                              + 'noe som gjelder uka.' },
        uke:       { type:'integer', description:'Ukenummer. Bare for påminnelser uten '
                                               + 'dato. Utelat for uka det er nå.' },
        gjelder:   { type:'string', description:'Familie, Magne, Nina, Emma eller Andrea.' }
      },
      required:['tekst']
    },
    neamSkriver: true,
    neamBeskriv: function(arg){
      return 'Legge til påminnelse for ' + skrivHuskeHvem(arg.gjelder) + ':\n\n· '
           + String(arg.tekst || '') + '\n· ' + skrivHuskeNaarTekst(arg)
           + (arg.utdypning ? '\n· utdypning: ' + arg.utdypning : '');
    }
  },
  {
    name: 'endre_paaminnelse',
    description: 'Endrer en påminnelse som finnes. Bare feltene du sender blir rørt. '
               + 'Sender du dato, flyttes den til dagsboksen den dagen; sender du dato '
               + 'som tom streng, flyttes den til ukesboksen.',
    input_schema: {
      type:'object',
      properties:{
        id:        { type:'string', description:'Fra les_paaminnelser.' },
        tekst:     { type:'string', description:'Ny overskrift.' },
        utdypning: { type:'string', description:'Tom streng fjerner den.' },
        dato:      { type:'string', description:'Dato på formen 2026-09-08. Tom streng '
                                              + 'flytter den til ukesboksen.' },
        uke:       { type:'integer', description:'Ukenummer. Bare sammen med tom dato.' },
        gjelder:   { type:'string', description:'Familie, Magne, Nina, Emma eller Andrea.' }
      },
      required:['id']
    },
    neamSkriver: true,
    neamBeskriv: function(arg){
      const rader = [];
      if(arg.tekst     !== undefined) rader.push('· ny tekst: ' + arg.tekst);
      if(arg.utdypning !== undefined) rader.push('· utdypning: ' + (arg.utdypning || '(fjernes)'));
      if(arg.gjelder   !== undefined) rader.push('· gjelder: ' + skrivHuskeHvem(arg.gjelder));
      if(arg.dato !== undefined || arg.uke !== undefined){
        rader.push('· flyttes til ' + skrivHuskeNaarTekst(arg));
      }
      return 'Endre ' + skrivHuskeNavn(arg.id)
           + (rader.length ? ':\n\n' + rader.join('\n') : '.');
    }
  },
  {
    name: 'huk_av_paaminnelse',
    description: 'Huker av en påminnelse, eller tar haken bort igjen. Den blir stående '
               + 'på skjermen med strek over - den forsvinner ikke.',
    input_schema: {
      type:'object',
      properties:{
        id:     { type:'string', description:'Fra les_paaminnelser.' },
        ferdig: { type:'boolean', description:'Utelat for å huke av. false tar haken bort.' }
      },
      required:['id']
    },
    neamSkriver: true,
    neamBeskriv: function(arg){
      return (arg.ferdig === false ? 'Ta bort haken på ' : 'Huke av ')
           + skrivHuskeNavn(arg.id) + '.';
    }
  },
  {
    name: 'slett_paaminnelse',
    description: 'Sletter en påminnelse. Skal den bare bort fra skjermen fordi den er '
               + 'gjort, bruk huk_av_paaminnelse i stedet - da ser den som lurer på om '
               + 'det ble gjort at det ble gjort.',
    input_schema: {
      type:'object',
      properties:{ id: { type:'string', description:'Fra les_paaminnelser.' } },
      required:['id']
    },
    neamSkriver: true,
    neamBeskriv: function(arg){
      return 'SLETTE ' + skrivHuskeNavn(arg.id) + '. Den kan ikke hentes tilbake.';
    }
  },
  {
    name: 'les_fagene',
    description: 'Fagene et av barna har, med faglærer, hvilke ukedager faget er, '
               + 'ukas læringsmål og hvor mange åpne lekser og kommende prøver '
               + 'hvert fag har. Virker fra hvilken som helst side. Kjør denne før '
               + 'du sender et fagnavn til et annet verktøy - navnet må være slik '
               + 'det står her.',
    input_schema: {
      type:'object',
      properties:{ barn: { type:'string', enum:['Emma','Andrea'] } },
      required:['barn']
    }
  },
  {
    name: 'legg_til_fag',
    description: 'Oppretter et nytt fag hos Emma eller Andrea, fra hvilken som helst '
               + 'side. Finnes faget fra før, blir det ikke laget på nytt.\n\n'
               + 'Si ALLTID hvem det gjelder. Vet du det ikke, spør - ikke gjett ut '
               + 'fra hvem som snakker.',
    input_schema: {
      type:'object',
      properties:{
        barn:   { type:'string', enum:['Emma','Andrea'] },
        navn:   { type:'string', description:'Fagets navn.' },
        laerer: { type:'string', description:'Faglærerens navn.' },
        dager:  { type:'array', items:{ type:'string' },
                  description:'Ukedagene faget har time, på norsk: '
                            + '["mandag","torsdag"].' }
      },
      required:['barn','navn']
    },
    neamSkriver: true,
    neamBeskriv: function(arg){
      const d = skrivDagerInn(arg.dager);
      return 'Opprette faget ' + arg.navn + ' hos ' + skrivBarnNavn(arg.barn)
           + (arg.laerer ? '\n\n· faglærer: ' + arg.laerer : '')
           + (d && d.length ? '\n· dager: ' + skrivDagNavn(d).join(', ') : '');
    }
  },
  {
    name: 'endre_fag',
    description: 'Setter faglærer og hvilke ukedager et fag er, eller gir det nytt '
               + 'navn - fra hvilken som helst side. Bare feltene du sender blir '
               + 'rørt.\n\n'
               + 'DAGENE ERSTATTER de gamle, så send hele lista hver gang, ikke bare '
               + 'den som skal legges til. Et fag som er både mandag og torsdag skal '
               + 'ha begge. Tom liste fjerner alle dagene.',
    input_schema: {
      type:'object',
      properties:{
        barn:   { type:'string', enum:['Emma','Andrea'] },
        fag:    { type:'string', description:'Navnet faget har nå, fra les_fagene.' },
        navn:   { type:'string', description:'Nytt navn på faget.' },
        laerer: { type:'string', description:'Tom streng fjerner faglæreren.' },
        dager:  { type:'array', items:{ type:'string' },
                  description:'ALLE ukedagene faget har time, på norsk.' }
      },
      required:['barn','fag']
    },
    neamSkriver: true,
    neamBeskriv: function(arg){
      const rader = [];
      if(arg.navn   !== undefined) rader.push('· nytt navn: ' + arg.navn);
      if(arg.laerer !== undefined) rader.push('· faglærer: ' + (arg.laerer || '(fjernes)'));
      if(arg.dager  !== undefined){
        const d = skrivDagerInn(arg.dager);
        rader.push('· dager: ' + (d && d.length ? skrivDagNavn(d).join(', ')
                                                : '(alle fjernes)'));
      }
      return 'Endre faget ' + arg.fag + ' hos ' + skrivBarnNavn(arg.barn)
           + (rader.length ? ':\n\n' + rader.join('\n') : '.');
    }
  },
  {
    name: 'sett_diktatord',
    description: 'Legger inn diktatordene Andrea skal øve på en uke, fra hvilken som '
               + 'helst side. Ordene ERSTATTER dem som står for den uka - send hele '
               + 'lista. Et ord som står der fra før beholder eksempelsetningene '
               + 'sine; nye ord får sine laget neste gang diktatsiden åpnes.\n\n'
               + 'Høyst 15 ord om gangen. Uten uke og år havner de i uka det er nå.',
    input_schema: {
      type:'object',
      properties:{
        ord: { type:'array', items:{ type:'string' },
               description:'Ordene, slik de skal staves.' },
        uke: { type:'integer', description:'Ukenummer. Utelat for uka det er nå.' },
        aar: { type:'integer', description:'Årstall. Utelat for i år.' }
      },
      required:['ord']
    },
    neamSkriver: true,
    neamBeskriv: function(arg){
      const ord = (arg.ord || []).map(function(o){ return String(o).trim(); }).filter(Boolean);
      const u = arg.uke ? ('uke ' + arg.uke) : 'denne uka';
      return 'Sette ' + ord.length + ' diktatord for ' + u + ':\n\n'
           + ord.join(', ') + '\n\nOrdene som står der nå for den uka blir erstattet.';
    }
  },
  {
    name: 'list_handleturer',
    description: 'Handleturene huset har, med navn, område, hvor mange varer hver har '
               + 'og hvor mange som gjenstår. Virker fra hvilken som helst side. '
               + 'Bruk denne når brukeren nevner en handletur du ikke vet navnet på.\n\n'
               + 'HVILKEN TUR SOM ER OPPE på brukerens egen skjerm kan ikke leses '
               + 'herfra - det vet bare Handle selv. Avsluttede turer er historie, og '
               + 'er merket slik.',
    input_schema: { type:'object', properties:{}, required:[] }
  },
  {
    name: 'sok_varekatalog',
    description: 'Søker i varekatalogen - varene huset har handlet før, med varetypen '
               + 'de pleier å få og om de er basisvarer. Virker fra hvilken som helst '
               + 'side.\n\n'
               + 'KATALOGEN ER IKKE HANDLELISTA: den sier hva en vare ER, ikke at den '
               + 'skal kjøpes. Uten søkeord gis de første 40.',
    input_schema: {
      type:'object',
      properties:{
        sok:       { type:'string', description:'Ord fra varenavnet. Delstreng holder.' },
        bareBasis: { type:'boolean', description:'true gir bare basisvarene.' }
      },
      required:[]
    }
  },
  {
    name: 'les_ny_pakke',
    description: 'Leser pakkene Matlaging har sendt til Handle og som ikke er lagt inn '
               + 'ennå - hver ingrediens med mengder, enheter og hvilken rett den kom '
               + 'fra. Virker fra hvilken som helst side, og svarer på «har det kommet '
               + 'noe fra Matlaging?».\n\n'
               + 'SELVE IMPORTEN GJØRES PÅ HANDLE. Der legger foresla_import fram en '
               + 'tabell brukeren godkjenner. Herfra kan du lese pakka og legge '
               + 'enkeltvarer på lista med legg_paa_handlelista - men si da at pakka '
               + 'blir liggende i innboksen til noen går gjennom den på Handle.',
    input_schema: { type:'object', properties:{}, required:[] }
  },
  {
    name: 'sett_varetype',
    description: 'Setter varetype på én eller flere varer på en handletur, fra hvilken '
               + 'som helst side. Dette er den ene endringen du gjør uten å spørre: '
               + 'varetypen styrer bare rekkefølgen varene står i mens man handler, og '
               + 'den er like lett å rette igjen. Ser du en vare uten type, gi den en.\n\n'
               + 'Typen lagres også i varekatalogen for dagligvarer, så varen får den '
               + 'av seg selv neste gang.',
    input_schema: {
      type:'object',
      properties:{
        varer: { type:'array',
                 items:{ type:'object',
                         properties:{ vare:{ type:'string' },
                                      type:{ type:'string', enum:SKRIV_VARETYPER } },
                         required:['vare','type'] },
                 description:'Varene og typen hver av dem skal ha.' },
        omrade:    { type:'string', enum:['mat','annet'] },
        handletur: { type:'string', description:'Utelat for den nyeste åpne.' }
      },
      required:['varer']
    }
    /* Ingen neamSkriver, som paa sida: grensen for hva som maa bekreftes
       gaar ved om en feil er lett aa se og lett aa rette - en gal varetype
       er begge deler. */
  },
  {
    name: 'legg_til_avtale',
    description: 'Lager en ny avtale i en av familiens kalendere. Si hvilken kalender - '
               + 'bruk les_kalender om du ikke vet navnene.\n\n'
               + 'SKAL DEN GJENTA SEG, sett gjentas. Da MÅ du også si når serien '
               + 'slutter - en dato i slutter, eller et antall i ganger. Spør '
               + 'brukeren om det; en serie uten slutt er lettere å lage enn å bli '
               + 'kvitt, og huset lager dem ikke. En gjentagende avtale kan ikke gå '
               + 'over flere dager.',
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
        gjentas:   { type:'string', enum:['daglig','ukentlig','annenhver','manedlig','arlig'],
                     description:'Gjentakelse. «annenhver» er annenhver uke, «manedlig» samme '
                               + 'dato hver måned, «arlig» samme dato hvert år. Utelat for en '
                               + 'avtale som bare skjer én gang.' },
        ukedager:  { type:'array', items:{ type:'string' },
                     description:'Bare ved ukentlig eller annenhver: ukedagene på norsk, for '
                               + 'eksempel ["mandag","torsdag"]. Utelat for ukedagen datoen '
                               + 'faller på.' },
        slutter:   { type:'string', description:'Siste dato serien kan falle på, 2026-12-15.' },
        ganger:    { type:'integer', description:'Antall ganger serien skal gå, i stedet for '
                                               + 'en sluttdato.' },
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
      const gjentas = skrivGjentaTekst(arg);
      return 'Legge inn «' + arg.tittel + '»'
           + (arg.kalender ? ' i ' + arg.kalender : '') + ':\n\n· ' + nar
           + (gjentas ? '\n· gjentas: ' + gjentas : '')
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
    name: 'last_sida_paa_nytt',
    description: 'Laster sida brukeren står på, på nytt - når noe ikke vises riktig, eller for å få med '
               + 'seg en endring. Brukeren bekrefter først, og bekreftelsen viser det sida vet er ulagret. '
               + 'Si fra om det før du foreslår det. Samtalen ligger igjen etterpå, men svaret ditt må komme '
               + 'før sida lastes.',
    input_schema: { type:'object', properties:{}, required:[] },
    neamSkriver: true,
    /* Sider kan svare paa window.neamUlagret() med det som forsvinner -
       Oekonomi gjoer det. De andre sier ikke noe, og da staar det her. */
    neamBeskriv: function(){
      let u = null;
      try{ if(typeof window.neamUlagret === 'function') u = [].concat(window.neamUlagret() || []); }catch(e){}
      return 'Laste sida på nytt?'
        + (u === null ? '\n\nDenne sida sier ikke fra om noe er ulagret - sjekk selv før du sier ja.'
           : u.length ? '\n\nDette er ikke lagret og forsvinner:\n' + u.map(function(x){ return '• ' + x; }).join('\n')
           : '\n\nIngenting er ulagret.');
    }
  },
  {
    name: 'gaa_til',
    description: 'Åpner en annen side i Neam. Bruk den når brukeren ber om å komme et '
               + 'sted, eller når svaret ditt er at noe må gjøres et annet sted.\n\n'
               + 'SAMTALEN TAR SLUTT når siden skifter - panelet følger ikke med. Si '
               + 'derfor alt du har å si i det samme svaret, og hold det kort. Ikke '
               + 'still et spørsmål og naviger i samme slengen.\n\n'
               + 'Naviger aldri uten at brukeren har bedt om det eller sagt ja til det.\n\n'
               + 'UNNTAK - Økonomi: med `oppgave` fortsetter du samtalen der når sida er '
               + 'åpnet, og gjør det brukeren sa ja til. Bare til Økonomi.',
    input_schema: {
      type:'object',
      properties:{
        side: { type:'string',
                enum:['forsiden','kalender','handleliste','oppskrifter',
                      'andrea','emma','diktat','kjokken','sikkerhet','okonomi'],
                description:'Hvilken side som skal åpnes.' },
        oppgave: { type:'string',
                   description:'Bare for okonomi: det du skal gjøre når sida er åpnet, '
                             + 'skrevet til deg selv - hva brukeren ba om og sa ja til, med '
                             + 'navn og beløp.' }
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

  /* ---------------- Matlaging ----------------
     `legg_inn_oppskrifter` baerer samme navn som sidas eget, med
     vilje: staar man PAA Matlaging, filtrerer skrivVerktoy() dette
     bort og sidas eget vinner. Det tegner lista om etterpaa, og
     det gjoer ikke vi. */
  {
    name: 'legg_inn_oppskrifter',
    description:
      'Legger inn én eller flere oppskrifter i oppskriftsboka. Virker fra '
      + 'hvilken som helst side.\n\n'
      + 'VIKTIG: bruk BARE det brukeren faktisk har gitt deg. Ikke fyll inn '
      + 'mengder, ingredienser eller framgangsmåte du ikke har fått. Mangler '
      + 'en mengde, la den stå tom. Skal du foreslå noe selv, spør først i '
      + 'stedet for å legge det inn.\n\n'
      + 'Kategorier må være blant: ' + SKRIV_MAT_KATEGORIER.join(', ') + '. '
      + 'En krydderblanding hører til «Krydderblandinger».',
    input_schema: {
      type:'object',
      properties:{
        oppskrifter: {
          type:'array',
          description:'Oppskriftene som skal legges inn.',
          items:{
            type:'object',
            properties:{
              tittel:     { type:'string' },
              kategorier: { type:'array', items:{type:'string'},
                            description:'Minst én. Må være fra den faste lista.' },
              porsjoner:  { type:'number', description:'Utelates om det ikke er oppgitt.' },
              tid:        { type:'string', description:'For eksempel «20 minutter». Utelates om ukjent.' },
              ingredienser: {
                type:'array',
                items:{
                  type:'object',
                  properties:{
                    mengde:      { type:'number', description:'Tall. Utelates om mengden er en tekst.' },
                    mengdetekst: { type:'string', description:'For eksempel «1 klype» eller «etter smak».' },
                    enhet:       { type:'string', description:'ts, ss, g, dl …' },
                    navn:        { type:'string' }
                  },
                  required:['navn']
                }
              },
              fremgangsmate: { type:'array', items:{type:'string'},
                               description:'Ett steg per element. Utelates for krydderblandinger.' },
              notat: { type:'string', description:'Kommentar, for eksempel hva den passer til.' }
            },
            required:['tittel','kategorier']
          }
        }
      },
      required:['oppskrifter']
    },
    neamSkriver: true,
    neamBeskriv: function(a){
      const n = ((a && a.oppskrifter) || []).length;
      return n === 1
        ? 'Legger inn oppskriften «' + ((a.oppskrifter[0] || {}).tittel || '') + '».'
        : 'Legger inn ' + n + ' oppskrifter.';
    },
    /* Flere under ett, med avkryssing per rad - samme som sidas eget.
       Da slipper man å svare ja ti ganger for ti krydderblandinger. */
    neamTabell: function(a){
      return ((a && a.oppskrifter) || []).map(function(o){
        const ing = (o.ingredienser || []).length;
        return {
          tittel: o.tittel || '(uten navn)',
          under: (o.kategorier || []).join(', ')
               + (ing ? ' · ' + ing + ' ingrediens' + (ing > 1 ? 'er' : '')
                      : ' · ingen ingredienser')
        };
      });
    }
  },
  {
    name: 'endre_oppskrift',
    description:
      'Endrer en oppskrift som alt ligger i boka. Krever id fra finn_oppskrift '
      + 'eller les_ukeplanen – kjør en av dem først.\n\n'
      + 'Bare feltene du sender med endres; resten står som de er. Sender du '
      + 'ingredienser, framgangsmåte eller tips, ERSTATTER lista den som ligger '
      + 'der – ta med alle linjene, ikke bare de nye. Bilder røres aldri.',
    input_schema: {
      type:'object',
      properties:{
        id:         { type:'string', description:'Oppskriftens id.' },
        tittel:     { type:'string' },
        kategorier: { type:'array', items:{type:'string'},
                      description:'Erstatter kategoriene. Fra den faste lista: '
                                + SKRIV_MAT_KATEGORIER.join(', ') + '.' },
        porsjoner:  { type:'number' },
        tid:        { type:'string', description:'For eksempel «20 minutter».' },
        ingredienser: {
          type:'array',
          description:'Erstatter hele ingredienslista.',
          items:{
            type:'object',
            properties:{
              mengde:      { type:'number' },
              mengdetekst: { type:'string' },
              enhet:       { type:'string' },
              navn:        { type:'string' }
            },
            required:['navn']
          }
        },
        fremgangsmate: { type:'array', items:{type:'string'},
                         description:'Erstatter hele framgangsmåten.' },
        tips: { type:'array', items:{type:'string'},
                description:'Erstatter tipsene. Tom liste fjerner dem.' }
      },
      required:['id']
    },
    neamSkriver: true,
    neamBeskriv: function(a){
      a = a || {};
      const felt = [];
      if(a.tittel        != null) felt.push('navnet til «' + a.tittel + '»');
      if(a.kategorier    != null) felt.push('kategoriene til ' + (a.kategorier || []).join(', '));
      if(a.porsjoner     != null) felt.push('porsjonene til ' + a.porsjoner);
      if(a.tid           != null) felt.push('tiden til ' + a.tid);
      if(a.ingredienser  != null) felt.push('HELE ingredienslista (' + (a.ingredienser || []).length + ' linjer)');
      if(a.fremgangsmate != null) felt.push('HELE framgangsmåten (' + (a.fremgangsmate || []).length + ' steg)');
      if(a.tips          != null) felt.push((a.tips || []).length ? 'tipsene' : 'tipsene (fjernes)');
      return 'Endrer en oppskrift i boka:\n\n· '
           + (felt.length ? felt.join('\n· ') : 'ingenting');
    }
  },
  {
    name: 'slett_oppskrift',
    description:
      'Sletter en oppskrift fra boka for godt. Krever id fra finn_oppskrift. '
      + 'Den tas samtidig ut av ukemenyen de ukene den står i.',
    input_schema: {
      type:'object',
      properties:{ id: { type:'string', description:'Oppskriftens id.' } },
      required:['id']
    },
    neamSkriver: true,
    neamBeskriv: function(){
      return 'SLETTER en oppskrift fra boka for godt, og tar den ut av '
           + 'ukemenyen.\n\nDen kan ikke hentes tilbake.';
    }
  },
  {
    name: 'sett_middag',
    description:
      'Setter en rett på en dag i ukemenyen. Krever id fra finn_oppskrift. '
      + 'Uten uke brukes inneværende uke. Flere retter kan stå på samme dag.',
    input_schema: {
      type:'object',
      properties:{
        id:        { type:'string', description:'Oppskriftens id.' },
        dag:       { type:'string', description:'mandag, tirsdag, onsdag, torsdag, fredag, lørdag eller søndag.' },
        uke:       { type:'string', description:'«2026-W44», eller bare ukenummeret. Standard: denne uka.' },
        porsjoner: { type:'number', description:'Standard: oppskriftens egne, ellers 4.' }
      },
      required:['id','dag']
    },
    neamSkriver: true,
    neamBeskriv: function(a){
      a = a || {};
      let uke;
      try{ uke = skrivUkeNokkel(a.uke); }catch(e){ uke = String(a.uke || ''); }
      return 'Setter en rett på ' + String(a.dag || '').toLowerCase()
           + ' i uke ' + uke.replace(/^\d{4}-W/, '') + ' (' + uke + ')'
           + (a.porsjoner ? ', ' + a.porsjoner + ' porsjoner' : '') + '.';
    }
  },
  {
    name: 'fjern_middag',
    description:
      'Tar en rett av en dag i ukemenyen. Krever id fra les_ukeplanen. '
      + 'Oppskriften selv blir stående i boka.',
    input_schema: {
      type:'object',
      properties:{
        id:  { type:'string', description:'Oppskriftens id, fra les_ukeplanen.' },
        dag: { type:'string', description:'mandag, tirsdag, onsdag, torsdag, fredag, lørdag eller søndag.' },
        uke: { type:'string', description:'«2026-W44», eller bare ukenummeret. Standard: denne uka.' }
      },
      required:['id','dag']
    },
    neamSkriver: true,
    neamBeskriv: function(a){
      a = a || {};
      let uke;
      try{ uke = skrivUkeNokkel(a.uke); }catch(e){ uke = String(a.uke || ''); }
      return 'Tar en rett av ' + String(a.dag || '').toLowerCase()
           + ' i uke ' + uke.replace(/^\d{4}-W/, '') + ' (' + uke + ').';
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
  sikkerhet:   '/sikkerhet.html',
  okonomi:     '/okonomi.html'
};
/* Oppgaven Neam tar med til Oekonomi-sida (gaa_til med `oppgave`). Sida
   leser den naar den aapnes og lar Neam fortsette - se okNeamOppgave() i
   okonomi.html. sessionStorage, som samtalen: den doer med fana. */
const SKRIV_OPPGAVE = 'neam_oppgave';

async function skrivUtfor(navn, arg){
  arg = arg || {};

  /* ---------------- Økonomien (se nederst) ---------------- */
  if(SKRIV_OK_VERKTOY.some(function(v){ return v.name === navn; })) return await skrivOkUtfor(navn, arg);

  /* ---------------- Navigasjon ---------------- */
  if(navn === 'last_sida_paa_nytt'){
    /* Som gaa_til: svaret skal rekke aa komme paa skjermen foerst. */
    setTimeout(function(){ location.reload(); }, 2500);
    return { laster:true, beskjed:'Sida lastes på nytt om et par sekunder. Si bare kort at du gjør det.' };
  }

  if(navn === 'gaa_til'){
    const side = String(arg.side || '').toLowerCase();
    const mal = SKRIV_SIDER[side];
    if(!mal) throw new Error('Ukjent side: ' + arg.side);
    if(side === 'okonomi' && !(typeof lesAltOkonomiTillatt === 'function' && lesAltOkonomiTillatt())){
      throw new Error('Økonomi er ikke åpnet for denne innloggingen.');
    }
    const oppgave = side === 'okonomi' ? String(arg.oppgave || '').trim() : '';
    if(oppgave){
      try{ sessionStorage.setItem(SKRIV_OPPGAVE, JSON.stringify({ side:side, tekst:oppgave.slice(0, 2000), tid:Date.now() })); }catch(e){}
    }
    /* Vi drar ikke med det samme. Svaret fra Neam skal rekke aa komme paa
       skjermen foerst - navigerer vi i samme oeyeblikk, ser brukeren bare
       at sida bytter og faar aldri vite hvorfor. */
    setTimeout(function(){ location.href = mal; }, 2500);
    return { navigerer: true, side: arg.side,
             beskjed: oppgave
               ? 'Siden åpnes om et par sekunder, og der fortsetter du med oppgaven. Si bare kort at dere går dit.'
               : 'Siden åpnes om et par sekunder. Si kort hva du gjorde, '
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


  /* ---------------- Paaminnelsene ---------------- */
  if(navn === 'les_paaminnelser'){
    const liste = await skrivHuskeLes();
    const hvem = String(arg.gjelder || '').trim() ? skrivHuskeHvem(arg.gjelder) : null;
    const ut = liste.filter(function(m){
      if(!m) return false;
      if(hvem && String(m.gjelder || '').trim() !== hvem) return false;
      if(!arg.medFerdige && m.ferdig) return false;
      return true;
    });
    /* Samme grunn til et tak som ellers: et svar som fyller budsjettet
       gaar ut over det Neam selv skal rekke aa si etterpaa. */
    return { antall: ut.length,
             paaminnelser: ut.slice(0, 80).map(skrivHuskeLinje),
             avkortet: ut.length > 80 };
  }

  if(navn === 'legg_til_paaminnelse'){
    const tekst = String(arg.tekst || '').trim();
    if(!tekst) throw new Error('Påminnelsen må ha en tekst.');
    const naar = skrivHuskeNaar(arg);
    const ny = {
      id: skrivId('m'),
      laget: new Date().toISOString(),
      overskrift: tekst,
      tekst: String(arg.utdypning || '').trim(),
      frist: naar.frist,
      omfang: naar.omfang,
      gjelder: skrivHuskeHvem(arg.gjelder),
      av: 'Neam'
    };
    await skrivHuskeEndre(function(liste){ return liste.concat([ny]); });
    return { lagt:{ tekst: tekst, gjelder: ny.gjelder, dato: ny.frist,
                    hvor: naar.omfang === 'uke' ? 'Påminnelser denne uken'
                                                : 'Påminnelser i dag' } };
  }

  if(navn === 'endre_paaminnelse' || navn === 'huk_av_paaminnelse'
  || navn === 'slett_paaminnelse'){
    const liste = await skrivHuskeLes();
    const m = skrivHuskeFinn(liste, arg.id);

    if(navn === 'slett_paaminnelse'){
      await skrivHuskeEndre(function(l){
        return l.filter(function(x){ return x.id !== m.id; });
      });
      return { slettet:true, tekst: m.overskrift || '' };
    }

    const endring = {};
    if(navn === 'huk_av_paaminnelse'){
      endring.ferdig = arg.ferdig === undefined ? true : !!arg.ferdig;
    }else{
      if(arg.tekst !== undefined){
        if(!String(arg.tekst).trim()) throw new Error('Påminnelsen må ha en tekst.');
        endring.overskrift = String(arg.tekst).trim();
      }
      if(arg.utdypning !== undefined) endring.tekst = String(arg.utdypning || '').trim();
      if(arg.gjelder   !== undefined) endring.gjelder = skrivHuskeHvem(arg.gjelder);
      if(arg.dato !== undefined || arg.uke !== undefined){
        const naar = skrivHuskeNaar(arg);
        endring.frist  = naar.frist;
        endring.omfang = naar.omfang;
      }
      if(!Object.keys(endring).length){
        throw new Error('Ingenting å endre - send minst ett felt utenom id.');
      }
      endring.endret = new Date().toISOString();
    }

    await skrivHuskeEndre(function(l){
      return l.map(function(x){
        return x.id === m.id ? Object.assign({}, x, endring) : x;
      });
    });
    return navn === 'huk_av_paaminnelse'
      ? { ferdig: endring.ferdig, tekst: m.overskrift || '' }
      : { endret:true, tekst: endring.overskrift || m.overskrift || '' };
  }

  /* ---------------- Fagene ---------------- */
  if(navn === 'les_fagene'){
    const d = skrivFagTom(await dataLes(skrivFagNokkel(arg.barn)));
    const ukeN = skrivUkeNokkel(null);
    return { barn: skrivBarnNavn(arg.barn), uke: ukeN,
             fag: (d.fag || []).map(function(f){ return skrivFagLinje(d, f, ukeN); }) };
  }

  if(navn === 'legg_til_fag'){
    const nytt = String(arg.navn || '').trim();
    if(!nytt) throw new Error('Faget må ha et navn.');
    const dager = skrivDagerInn(arg.dager) || [];
    let fantes = null;
    await skrivFagEndre(arg.barn, function(d){
      /* Oppslaget skjer INNE i endringen, mot det ferskeste: to kall rett
         etter hverandre skal ikke lage faget to ganger. */
      fantes = (d.fag || []).filter(function(f){
        return String(f.navn || '').trim().toLowerCase() === nytt.toLowerCase();
      })[0] || null;
      if(!fantes){
        d.fag.push({ id: skrivFagId(), navn: nytt,
                     laerer: String(arg.laerer || '').trim(), dager: dager });
      }
      return d;
    });
    if(fantes) return { fantes:true, navn: fantes.navn,
                        beskjed:'Faget finnes fra før og ble ikke laget på nytt.' };
    return { lagt:{ barn: skrivBarnNavn(arg.barn), navn: nytt,
                    dager: skrivDagNavn(dager) } };
  }

  if(navn === 'endre_fag'){
    const endring = {};
    if(arg.navn   !== undefined && String(arg.navn).trim()) endring.navn = String(arg.navn).trim();
    if(arg.laerer !== undefined) endring.laerer = String(arg.laerer).trim();
    const dager = skrivDagerInn(arg.dager);
    if(dager) endring.dager = dager;
    if(!Object.keys(endring).length) throw new Error('Ingenting å endre - send minst '
                                                   + 'ett felt utenom barn og fag.');
    let ut = null;
    await skrivFagEndre(arg.barn, function(d){
      const f = skrivFagFinn(d, arg.fag);
      d.fag = d.fag.map(function(x){
        return x.id === f.id ? Object.assign({}, x, endring) : x;
      });
      ut = d.fag.filter(function(x){ return x.id === f.id; })[0];
      return d;
    });
    return { endret:{ barn: skrivBarnNavn(arg.barn), navn: ut.navn,
                      faglaerer: ut.laerer || null,
                      ukedager: skrivDagNavn(ut.dager) } };
  }

  /* ---------------- Diktatordene ---------------- */
  if(navn === 'sett_diktatord'){
    const ord = (arg.ord || []).map(function(o){ return String(o).trim(); }).filter(Boolean);
    if(!ord.length) throw new Error('Ingen ord å legge inn.');
    if(ord.length > 15) throw new Error('Høyst 15 ord om gangen.');

    const na = skrivIsoUke(new Date());
    const uke = arg.uke || na.uke;
    const aar = arg.aar || na.aar;
    const tid = new Date().toISOString();

    /* Les - flett - skriv, og lesingen skjer HER: diktatsida kan ha
       skrevet en runde i mellomtiden. */
    const d = skrivDiktatNormal(await dataLes(SKRIV_DIKTAT));
    const finnes = d.lister.filter(function(l){
      return l.uke === uke && l.aar === aar;
    })[0];

    /* Setningene foelger ORDET, ikke plassen - et ord som sto der fra foer
       skal beholde sine. */
    const foer = {};
    if(finnes){
      finnes.ord.forEach(function(o){
        foer[String(o.ord).trim().toLowerCase()] = o.setninger || [];
      });
    }
    const nyeOrd = ord.map(function(o){
      return { ord:o, setninger: foer[o.toLowerCase()] || [] };
    });

    if(finnes){
      finnes.ord = nyeOrd;
      finnes.endret = tid;
    }else{
      d.lister.push({ id: skrivId('d'), tid: tid, endret: tid,
                      uke: uke, aar: aar, ord: nyeOrd });
      d.lister.sort(function(x, y){ return x.tid < y.tid ? -1 : x.tid > y.tid ? 1 : 0; });
      if(d.lister.length > SKRIV_DIKTAT_MAKS){
        d.lister = d.lister.slice(-SKRIV_DIKTAT_MAKS);
      }
    }

    await dataSkriv(SKRIV_DIKTAT, d);
    const nye = ord.filter(function(o){ return !foer[o.toLowerCase()]; }).length;
    return { lagret:true, uke:uke, aar:aar, antall:ord.length, nye_ord:nye,
             merknad: nye
               ? 'Eksempelsetningene lages av seg selv neste gang diktatsiden åpnes.'
               : 'Ingen nye ord - alle hadde setninger fra før.' };
  }

  /* ---------------- Handleturene, katalogen og innboksen ---------------- */
  if(navn === 'list_handleturer'){
    const d = await dataLes(SKRIV_HANDLELISTE) || {};
    const okter = Array.isArray(d.okter) ? d.okter : [];
    const items = Array.isArray(d.items) ? d.items : [];
    return { handleturer: okter
      .slice()
      .sort(function(a, b){ return (a.opprettet || 0) - (b.opprettet || 0); })
      .map(function(o){
        const mine = items.filter(function(v){ return v && v.oktId === o.id; });
        return { navn: o.navn || 'Uten navn',
                 omrade: (o.omrade || 'mat') === 'annet' ? 'Andre varer' : 'Dagligvarer',
                 antall: mine.length,
                 gjenstaar: mine.filter(function(v){ return !v.done; }).length,
                 /* En avsluttet tur er en kvittering. Den er med i lista -
                    man kan spoerre hva som ble kjoept - men den skal ikke
                    leses som noe som gjenstaar. */
                 avsluttet: !!skrivErAvsluttet(o),
                 igang: !!o.startet };
      }) };
  }

  if(navn === 'sok_varekatalog'){
    const k = await skrivKatalogLes();
    const sok = String(arg.sok || '').trim().toLowerCase();
    const alle = Object.keys(k.katalog).map(function(n){ return k.katalog[n]; })
      .filter(function(x){ return !sok || String(x.vare || '').toLowerCase().indexOf(sok) !== -1; })
      .filter(function(x){ return !arg.bareBasis || !!x.basis; });
    /* Samme tak som sidas eget: en full katalog spiste hele svarbudsjettet. */
    return { sok: arg.sok || null, antall: alle.length,
             treff: alle.slice(0, 40).map(function(x){
               return { vare:x.vare, type:x.type || '', basisvare: !!x.basis };
             }),
             avkortet: alle.length > 40 };
  }

  if(navn === 'les_ny_pakke'){
    let inn = null;
    try{ inn = await dataLes(SKRIV_INNBOKS); }catch(e){ inn = null; }
    const pakker = Array.isArray(inn) ? inn : [];
    if(!pakker.length) return { beskjed:'Ingen ny pakke venter i innboksen.' };

    const varer = [], basis = [];
    pakker.forEach(function(p){
      (p.varer || []).forEach(function(v){
        const n = String((v && v.vare) || '').trim();
        if(!n) return;
        varer.push({
          vare: n,
          type: v.type || '',
          mengder: (v.mengder || []).map(function(m){
            return { mengde: (m && m.mengde != null) ? String(m.mengde) : '',
                     enhet: (m && m.enhet) || '' };
          }),
          fritekst: v.fritekst || [],
          fraRetter: v.fraRetter || [],
          basisvare: !!v.basis
        });
      });
      (p.basisvarer || []).forEach(function(n){ if(n) basis.push(String(n).trim()); });
    });

    /* Navnet paa pakka, samme regel som innboksNavn() i sida. */
    const fra = pakker.map(function(p){
      return p.fraOppskrift ? String(p.fraOppskrift)
           : p.uke ? ('Uke ' + p.uke) : 'Handleliste';
    });
    return { fra: fra, antall: varer.length, varer: varer.slice(0, 120),
             avkortet: varer.length > 120, basisvarer: basis,
             merknad: 'Importen gjøres på Handle, med foresla_import.' };
  }

  if(navn === 'sett_varetype'){
    const inn = (Array.isArray(arg.varer) ? arg.varer : []).filter(function(o){
      return o && String(o.vare || '').trim()
             && SKRIV_VARETYPER.indexOf(String(o.type || '').trim()) !== -1;
    });
    if(!inn.length) throw new Error('Send varer med en varetype fra lista: '
                                  + SKRIV_VARETYPER.join(', ') + '.');

    const d = await dataLes(SKRIV_HANDLELISTE) || {};
    if(!Array.isArray(d.okter)) d.okter = [];
    if(!Array.isArray(d.items)) d.items = [];
    const okt = skrivFinnOkt(d, arg, false);
    const erMat = (okt.omrade || 'mat') === 'mat';

    const satt = [], fant_ikke = [];
    const k = erMat ? await skrivKatalogLes() : null;
    inn.forEach(function(o){
      const sok = String(o.vare).trim().toLowerCase();
      const rader = d.items.filter(function(v){
        return v && v.oktId === okt.id
               && String(v.name || '').trim().toLowerCase() === sok;
      });
      if(!rader.length){ fant_ikke.push(o.vare); return; }
      rader.forEach(function(v){
        v.cat = String(o.type).trim();
        /* Katalogen laerer bare av dagligvarer - Andre varer har ingen
           faste varetyper, og en type derfra ville blitt staaende som
           laerdom om en vare som ikke har noen. */
        if(erMat) skrivKatalogLagre(k, v.name, v.cat, !!v.basis);
      });
      satt.push({ vare: rader[0].name, type: String(o.type).trim() });
    });

    if(satt.length){
      await dataSkriv(SKRIV_HANDLELISTE, d);
      if(erMat) await dataSkriv(SKRIV_KATALOG, k);
    }
    return { handletur: okt.navn, satt: satt, fant_ikke: fant_ikke };
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

    const gjenta = skrivGjentakelse(arg, arg.dato);
    if(gjenta) p.recurrence = gjenta;

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
                  + 'inn som seg selv, eller på kjøkkenskjermen etter at noen har tastet '
                  + 'pinkoden sin. Ingen har tastet koden sin her nå.');
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

  /* ---------------- Matlaging ---------------- */

  if(navn === 'legg_inn_oppskrifter'){
    const inn = (Array.isArray(arg.oppskrifter) ? arg.oppskrifter : [])
      .filter(function(o){ return o && String(o.tittel || '').trim(); });
    if(!inn.length) throw new Error('Ingen oppskrifter å legge inn.');
    if(inn.length > 20) throw new Error('Høyst 20 oppskrifter om gangen.');

    /* Formene bygges FOERST, alle sammen. En ugyldig kategori paa nummer
       tre skal ikke etterlate de to foerste lagret og resten ikke. */
    const bygget = inn.map(function(o){
      const tittel = String(o.tittel).trim();
      return {
        id: skrivId('r_'),
        title: tittel,
        photo: null,
        baseServings: (typeof o.porsjoner === 'number' && o.porsjoner > 0) ? o.porsjoner : null,
        time: String(o.tid || '').trim(),
        ingredients: skrivMatIngredienser(o.ingredienser),
        steps: skrivMatSteg(o.fremgangsmate),
        /* Notatet blir et tips, ikke et steg: «god til pasta» er ikke
           noe man utfoerer. */
        tips: skrivMatTips(String(o.notat || '').trim() ? [o.notat] : []),
        tastings: [],
        chefComments: [],
        categories: skrivMatKategorier(o.kategorier, tittel),
        nutrition: null,
        createdAt: Date.now()
      };
    });

    /* Oppskriftene foer indeksen. Faller vi mellom de to, er det bedre
       at en oppskrift ligger uten rad (usynlig, men hel) enn at en rad
       peker paa noe som ikke finnes (den aapner ingenting). */
    for(let i = 0; i < bygget.length; i++){
      await skrivMatSkriv(OPPSKRIFT_NOKKEL + bygget[i].id, bygget[i]);
    }
    const indeks = await skrivMatIndeks();
    bygget.forEach(function(r){
      indeks.push({ id:r.id, title:r.title, time:r.time, thumb:null,
                    createdAt:r.createdAt, rating:0, ratingCount:0,
                    categories:r.categories });
    });
    await skrivMatSkriv(OPPSKRIFT_INDEKS, indeks);

    return { lagt_inn: bygget.map(function(r){
      return { id:r.id, tittel:r.title, kategorier:r.categories };
    }) };
  }

  if(navn === 'endre_oppskrift'){
    const id = String(arg.id || '').trim();
    if(!id) throw new Error('Mangler id på oppskriften.');

    /* Les - endre - skriv, som resten av fila. Hentes HER og ikke
       tidligere: staar Matlaging aapen et annet sted, vil vi ha den
       ferskeste. Vinduet kan ikke lukkes herfra - sidas lagring
       skriver hele objektet uten fletting. */
    const r = await skrivMatHent(id);
    const endret = [];

    if(arg.tittel != null){
      const t = String(arg.tittel).trim();
      if(!t) throw new Error('Tittelen kan ikke være tom.');
      r.title = t; endret.push('tittel');
    }
    if(arg.kategorier != null){ r.categories = skrivMatKategorier(arg.kategorier, r.title); endret.push('kategorier'); }
    if(arg.porsjoner != null){
      r.baseServings = (typeof arg.porsjoner === 'number' && arg.porsjoner > 0) ? arg.porsjoner : null;
      endret.push('porsjoner');
    }
    if(arg.tid != null){ r.time = String(arg.tid).trim(); endret.push('tid'); }
    if(arg.ingredienser != null){ r.ingredients = skrivMatIngredienser(arg.ingredienser); endret.push('ingredienser'); }
    if(arg.fremgangsmate != null){ r.steps = skrivMatSteg(arg.fremgangsmate); endret.push('framgangsmåte'); }
    if(arg.tips != null){ r.tips = skrivMatTips(arg.tips); endret.push('tips'); }

    if(!endret.length) throw new Error('Ingenting å endre - send med minst ett felt.');

    await skrivMatSkriv(OPPSKRIFT_NOKKEL + r.id, r);

    /* Indeksen baerer tittel, tid og kategorier. Endres de uten at raden
       foelger med, viser forsida fortsatt det gamle. */
    const indeks = await skrivMatIndeks();
    let traff = false;
    const ny = indeks.map(function(rad){
      if(!rad || rad.id !== r.id) return rad;
      traff = true;
      return skrivMatIndeksRad(rad, r);
    });
    /* Fantes ingen rad, er oppskriften usynlig i lista. Da lager vi
       raden i stedet for aa la den vaere borte. */
    if(!traff){
      ny.push({ id:r.id, title:r.title, time:r.time, thumb:null,
                createdAt:r.createdAt || Date.now(), rating:0, ratingCount:0,
                categories:r.categories });
    }
    await skrivMatSkriv(OPPSKRIFT_INDEKS, ny);

    return { endret: { id:r.id, tittel:r.title, felt:endret } };
  }

  if(navn === 'slett_oppskrift'){
    const id = String(arg.id || '').trim();
    if(!id) throw new Error('Mangler id på oppskriften.');
    const r = await skrivMatHent(id);

    /* Indeksen foerst. Faller vi mellom de to, er en oppskrift uten rad
       usynlig - en rad uten oppskrift aapner ingenting og ser ut som en
       feil i appen. */
    const indeks = await skrivMatIndeks();
    await skrivMatSkriv(OPPSKRIFT_INDEKS, indeks.filter(function(rad){
      return !rad || rad.id !== id;
    }));
    await dataSlett(OPPSKRIFT_NOKKEL + id);

    /* Ut av ukemenyen ogsaa. En rett som er slettet, men staar paa
       torsdag, er en dag ingen kan lage mat av. */
    const plan = await husLesJson(UKEPLAN_NOKKEL);
    let fjernet = 0;
    if(plan && typeof plan === 'object'){
      Object.keys(plan).forEach(function(uke){
        const u = plan[uke]; if(!u || typeof u !== 'object') return;
        Object.keys(u).forEach(function(dag){
          if(!Array.isArray(u[dag])) return;
          const igjen = u[dag].filter(function(e){ return !e || e.id !== id; });
          fjernet += u[dag].length - igjen.length;
          if(igjen.length) u[dag] = igjen; else delete u[dag];
        });
      });
      if(fjernet) await skrivMatSkriv(UKEPLAN_NOKKEL, plan);
    }

    return { slettet: { id:id, tittel:r.title || 'Uten navn' },
             tatt_av_ukemenyen: fjernet };
  }

  if(navn === 'sett_middag' || navn === 'fjern_middag'){
    const id  = String(arg.id || '').trim();
    if(!id) throw new Error('Mangler id på retten.');
    const dag = skrivMatDag(arg.dag);
    const uke = skrivUkeNokkel(arg.uke);

    const plan = (await husLesJson(UKEPLAN_NOKKEL)) || {};
    if(typeof plan !== 'object') throw new Error('Ukemenyen har en form vi ikke kjenner.');

    if(navn === 'fjern_middag'){
      const u = plan[uke] || {};
      const liste = u[dag] || u[String(dag)] || [];
      const igjen = liste.filter(function(e){ return !e || e.id !== id; });
      if(igjen.length === liste.length){
        throw new Error('Den retten står ikke på ' + HUS_UKEDAGER[dag]
                      + ' i uke ' + uke + '. Kjør les_ukeplanen.');
      }
      if(igjen.length) u[dag] = igjen; else { delete u[dag]; delete u[String(dag)]; }
      plan[uke] = u;
      await skrivMatSkriv(UKEPLAN_NOKKEL, plan);
      return { fjernet: { uke:uke, dag:HUS_UKEDAGER[dag] } };
    }

    /* Retten maa finnes. Et oppslag i indeksen holder - vi trenger bare
       tittelen, og den fulle oppskriften kan vaere flere megabyte. */
    const indeks = await skrivMatIndeks();
    const rad = indeks.filter(function(x){ return x && x.id === id; })[0];
    if(!rad) throw new Error('Fant ingen oppskrift med id ' + id + '. Kjør finn_oppskrift først.');

    let porsjoner = (typeof arg.porsjoner === 'number' && arg.porsjoner > 0) ? arg.porsjoner : null;
    if(porsjoner === null){
      /* Oppskriftens egne, ellers husets standard - samme regel som
         dagvelgeren i sida. */
      try{ porsjoner = Number((await skrivMatHent(id)).baseServings) || SKRIV_MAT_PORSJONER; }
      catch(e){ porsjoner = SKRIV_MAT_PORSJONER; }
    }

    if(!plan[uke]) plan[uke] = {};
    const u = plan[uke];
    if(!Array.isArray(u[dag])) u[dag] = u[String(dag)] || [];
    u[dag].push({ id:id, title:rad.title || 'Uten navn', servings:porsjoner });
    await skrivMatSkriv(UKEPLAN_NOKKEL, plan);

    return { satt: { uke:uke, dag:HUS_UKEDAGER[dag],
                     rett:rad.title || 'Uten navn', porsjoner:porsjoner } };
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
  /* Økonomien bare for dem bank-funksjonen slipper inn (felles-lesalt.js spoer). */
  const okonomi = typeof lesAltOkonomiTillatt === 'function' && lesAltOkonomiTillatt();
  return SKRIV_VERKTOY.concat(okonomi ? SKRIV_OK_VERKTOY : []).filter(function(v){
    if(tatt[v.name]) return false;
    /* Noe kan bare gjoeres naar man staar paa Oekonomi-sida. */
    if(v.okBareSida && !skrivOkPaaSida()) return false;
    /* Skolearbeidet bare der noen er logget inn som seg selv - se
       avsnittet om skolearbeidet over. Et verktoey som ikke kan virke
       er verre enn ingen: Neam lover da noe han ikke kan holde. */
    if(!skole && SKRIV_SKOLE.indexOf(v.name) !== -1) return false;
    return true;
  });
}

/* ------------------------------------------------------------
   Økonomien (6. november 2026)
   ------------------------------------------------------------
   Godkjenne poster i innboksen og endre budsjettet, fra hvilken som
   helst side - for Magne, Nina og sys (Magne, 6. november). Grensen er
   bank-funksjonen: den sjekker det signerte Access-beviset og nekter alle
   andre. Lista viser verktoeyene bare naar felles-lesalt.js har faatt ja
   fra ?hvem=1.

   Bekreftelsene viser navn, dato og beloep fra det Neam sist leste
   (lesAltOkSist i felles-lesalt.js) - id-ene sier ingen noe. Etter en
   skriving faar Økonomi-sida beskjed (window.okonomiEtterSkriv), saa den
   tegner seg paa nytt. */
const SKRIV_OK_DATO = new Intl.DateTimeFormat('nb-NO', { weekday:'long', day:'numeric', month:'long' });
function skrivOkKr(n){ return new Intl.NumberFormat('nb-NO', { maximumFractionDigits:2 }).format(n) + ' kr'; }
function skrivOkPost(id){
  const p = typeof lesAltOkSist !== 'undefined' && lesAltOkSist.innboks[id];
  if(!p) return 'en post Neam ikke har lest ennå (' + id + ')';
  return p.sted + ', ' + SKRIV_OK_DATO.format(new Date(String(p.dato).slice(0, 10) + 'T12:00:00')) + ', ' + skrivOkKr(p.belop);
}
/* Staar vi paa Oekonomi-sida? Sida setter flagget selv; adressen kan vaere
   baade /okonomi og /okonomi.html. Utenfor sida kan Neam bare legge beloep
   i felt som finnes (Magne, 6. november 2026). */
function skrivOkPaaSida(){ return window.okonomiSida === true; }
const SKRIV_OK_UTENFOR = 'Nye felt kan bare legges til på Økonomi-sida. Foreslå feltet for brukeren, si at det '
  + 'må gjøres der, og spør om du skal ta dem dit og gjøre det (gaa_til med side «okonomi» og oppgave).';
function skrivOkKat(k){ return String(k || '').split(' · ').join(' › '); }
/* Varene som foeres for seg, med navnet fra kvitteringen Neam sist leste. */
function skrivOkLinjer(id, linjer){
  const nr = Object.keys(linjer || {}).filter(function(i){ return linjer[i]; });
  if(!nr.length) return '';
  const navn = typeof lesAltOkSist !== 'undefined' && lesAltOkSist.kvittering[id];
  return nr.map(function(i){ return '\n    – ' + ((navn && navn[Number(i)]) || 'vare ' + i) + ' → ' + skrivOkKat(linjer[i]); }).join('');
}
function skrivOkMaal(maal){
  if(maal === 'standard') return 'standardbudsjettet';
  const n = new Intl.DateTimeFormat('nb-NO', { month:'long', year:'numeric' }).format(new Date(maal + '-01T12:00:00'));
  return 'budsjettet for ' + n;
}

const SKRIV_OK_VERKTOY = [
  {
    name: 'godkjenn_okonomi_poster',
    okBareSida: true,
    description: 'Godkjenner poster i økonomi-innboksen med kategori, og/eller stryker poster så de ikke '
               + 'føres. Id og gyldige kategorier kommer fra les_okonomi_innboks - kjør den først. '
               + 'Godkjent blir regnskap, og Neam husker kategorien for motparten til neste gang. '
               + 'På en kvittering kan enkeltvarer føres på en annen kategori enn kjøpet (linjer, med '
               + 'numrene fra les_okonomi_kvittering); resten av beløpet følger kjøpets kategori.',
    input_schema: { type:'object', properties:{
      godkjenn: { type:'array', description:'Poster som skal godkjennes.', items:{ type:'object', properties:{
        id: { type:'string' }, kategori: { type:'string', description:'En kategori fra lista, f.eks. «Mat · Dagligvare».' },
        linjer: { type:'object', description:'Bare for kvitteringer: { "<linjenummer>": "<kategori>" } for varene som skal '
                + 'føres på noe annet enn kjøpet, f.eks. { "3": "Andre utgifter · Felles" }.', additionalProperties:{ type:'string' } }
      }, required:['id', 'kategori'] } },
      stryk: { type:'array', description:'Id-er som strykes (føres ikke).', items:{ type:'string' } }
    }, required:[] },
    neamSkriver: true,
    neamBeskriv: function(arg){
      const g = [].concat(arg.godkjenn || []), s = [].concat(arg.stryk || []);
      let t = '';
      if(g.length) t += 'Godkjenne i økonomien:\n' + g.map(function(x){ return '• ' + skrivOkPost(x.id) + ' → ' + skrivOkKat(x.kategori) + skrivOkLinjer(x.id, x.linjer); }).join('\n');
      if(s.length) t += (t ? '\n\n' : '') + 'Stryke (føres ikke):\n' + s.map(function(id){ return '• ' + skrivOkPost(id); }).join('\n');
      return t;
    }
  },
  {
    name: 'sett_okonomi_budsjett',
    description: 'Endrer beløp i budsjettet: standardbudsjettet (gjelder fra neste måned; måneder som har '
               + 'startet, beholder sitt) eller én måneds eget budsjett. Kategoriene er postene eller linjene '
               + 'fra les_okonomi_maaned. Beløp i hele kroner per måned. Bare postene som nevnes, endres. '
               + 'Bare poster som finnes - en ny post eller linje lages på Økonomi-sida.',
    input_schema: { type:'object', properties:{
      maal: { type:'string', description:'«standard», eller måneden som ÅÅÅÅ-MM.' },
      endringer: { type:'array', items:{ type:'object', properties:{
        kategori: { type:'string' }, belop: { type:'number', description:'Nytt beløp i kroner.' }
      }, required:['kategori', 'belop'] } }
    }, required:['maal', 'endringer'] },
    neamSkriver: true,
    neamBeskriv: function(arg){
      const sist = typeof lesAltOkSist !== 'undefined' && lesAltOkSist.budsjett;
      const gamle = sist && sist.maal === arg.maal ? sist.verdier : null;
      return 'Endre ' + skrivOkMaal(arg.maal) + ':\n' + [].concat(arg.endringer || []).map(function(e){
        const fra = gamle ? skrivOkKr(gamle[e.kategori] || 0) + ' → ' : '';
        return '• ' + String(e.kategori || '').split(' · ').join(' › ') + ': ' + fra + skrivOkKr(Math.round(Number(e.belop) || 0));
      }).join('\n') + (arg.maal === 'standard' ? '\n\nGjelder fra neste måned. Måneder som har startet, beholder budsjettet de har.' : '');
    }
  }
];

/* Formuen - verdier, gjeld og familiemaalet - er tall dere skal kunne gi
   Neam fra hvilken som helst side (Magne, 6. november 2026). Navnet er
   noekkelen: finnes det, faar det nytt beloep, ellers legges det til.
   En verdi som foelger en konto, har saldoen fra banken og endres ikke her. */
const SKRIV_OK_LAN = { bolig:'boliglån', bil:'billån', baat:'båtlån', forbruk:'forbrukslån', studie:'studielån', annet:'annet lån' };
const SKRIV_OK_FORMUE = {
  name: 'sett_okonomi_formue',
  description: 'Fyller inn eller endrer beløp i formuen i økonomien: verdier (f.eks. «Bolig»), gjeld med rente '
             + '(f.eks. «Boliglån») og familiemålet. Finnes navnet, får det nytt beløp. Kjør les_okonomi_kontoer '
             + 'først for å se hva som står der. Beløp i hele kroner, rente i prosent. Bare det som nevnes, endres. '
             + 'På Økonomi-sida kan nye navn legges til. Utenfor den bare felt som finnes, pluss Bolig, Boliglån, '
             + 'familiemålet og Fastlønn i bruttoinntekten (feltene i «Neam trenger») når de mangler. '
             + 'Bruttoinntekten er lønn før skatt i kroner per ÅR, per person, med punkter som Fastlønn og tillegg.',
  input_schema: { type:'object', properties:{
    verdier: { type:'array', items:{ type:'object', properties:{ navn:{ type:'string' }, belop:{ type:'number' } }, required:['navn', 'belop'] } },
    gjeld: { type:'array', items:{ type:'object', properties:{
      navn:{ type:'string' }, belop:{ type:'number', description:'Restgjeld i kroner.' }, rente:{ type:'number', description:'Nominell rente i prosent, f.eks. 5.1.' },
      type:{ type:'string', enum:['bolig', 'bil', 'baat', 'forbruk', 'studie', 'annet'], description:'Hva slags lån. Boliglån teller i belåningsgraden.' }
    }, required:['navn'] } },
    familiemaal: { type:'object', properties:{ navn:{ type:'string' }, belop:{ type:'number', description:'Målbeløpet i kroner.' } }, required:['navn', 'belop'] },
    bruttoinntekt: { type:'array', items:{ type:'object', properties:{
      hvem:{ type:'string', enum:['Magne', 'Nina'] },
      navn:{ type:'string', description:'Punktet, f.eks. «Fastlønn» eller «Tillegg». Utelat for Fastlønn.' },
      belop:{ type:'number', description:'Kroner per år, før skatt.' }
    }, required:['hvem', 'belop'] } }
  }, required:[] },
  neamSkriver: true,
  neamBeskriv: function(arg){
    const f = typeof lesAltOkSist !== 'undefined' && lesAltOkSist.formue;
    const finn = function(liste, navn){ return f ? (f[liste] || []).filter(function(x){ return String(x.navn).toLowerCase() === String(navn || '').trim().toLowerCase(); })[0] : null; };
    const fra = function(gammel, felt, tekst){ return gammel && gammel[felt] != null ? tekst(gammel[felt]) + ' → ' : (f ? '(ny) ' : ''); };
    const linjer = [];
    [].concat(arg.verdier || []).forEach(function(v){
      linjer.push('• ' + v.navn + ': ' + fra(finn('verdier', v.navn), 'belop', skrivOkKr) + skrivOkKr(Math.round(Number(v.belop) || 0)));
    });
    [].concat(arg.gjeld || []).forEach(function(g){
      const gammel = finn('gjeld', g.navn), del = [];
      if(g.belop != null) del.push(fra(gammel, 'belop', skrivOkKr) + skrivOkKr(Math.round(Number(g.belop) || 0)));
      if(g.rente != null) del.push('rente ' + fra(gammel, 'rente', function(r){ return String(r).replace('.', ',') + ' %'; }) + String(g.rente).replace('.', ',') + ' %');
      if(g.type) del.push('type ' + (SKRIV_OK_LAN[g.type] || g.type));
      linjer.push('• ' + g.navn + ' (gjeld): ' + del.join(', '));
    });
    if(arg.familiemaal) linjer.push('• Familiemål: ' + arg.familiemaal.navn + ', ' + skrivOkKr(Math.round(Number(arg.familiemaal.belop) || 0)));
    [].concat(arg.bruttoinntekt || []).forEach(function(b){
      const hvem = String(b.hvem || ''), navn = String(b.navn || 'Fastlønn');
      const liste = f && f.brutto ? (f.brutto[hvem.toLowerCase()] || []) : null;
      const gammel = liste ? liste.filter(function(x){ return String(x.navn).toLowerCase() === navn.toLowerCase(); })[0] : null;
      linjer.push('• ' + hvem + ', ' + navn + ' (brutto per år): ' + fra(gammel, 'belop', skrivOkKr) + skrivOkKr(Math.round(Number(b.belop) || 0)));
    });
    return 'Endre formuen i økonomien:\n' + linjer.join('\n');
  }
};
/* Lagt til her, etter at lista er laget - en const kan ikke leses foer den finnes. */
SKRIV_OK_VERKTOY.push(SKRIV_OK_FORMUE);

async function skrivOkBank(sti, kropp){
  const r = await fetch('/api/bank' + sti, kropp
    ? { method:'POST', credentials:'same-origin', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify(kropp) }
    : { credentials:'same-origin', cache:'no-store' });
  let d = null;
  try{ d = await r.json(); }catch(e){}
  if(!d) throw new Error('Fikk ikke svar fra økonomien.');
  if(!d.ok) throw new Error(d.feil || 'Økonomien sa nei.');
  return d;
}
function skrivOkFerdig(){ try{ if(typeof window.okonomiEtterSkriv === 'function') window.okonomiEtterSkriv(); }catch(e){} }

async function skrivOkUtfor(navn, arg){
  if(!(typeof lesAltOkonomiTillatt === 'function' && lesAltOkonomiTillatt())) throw new Error('Økonomien er ikke åpnet for denne innloggingen.');

  if(navn === 'godkjenn_okonomi_poster'){
    if(!skrivOkPaaSida()) throw new Error('Godkjenning gjøres på Økonomi-sida. Spør om du skal ta brukeren dit (gaa_til med side «okonomi» og oppgave).');
    const g = [].concat(arg.godkjenn || []).filter(function(x){ return x && x.id && x.kategori; })
      .map(function(x){
        const ut = { id:String(x.id), kategori:String(x.kategori) };
        if(x.linjer && typeof x.linjer === 'object'){
          const l = {};
          Object.keys(x.linjer).forEach(function(i){ if(/^\d+$/.test(i) && x.linjer[i]) l[i] = String(x.linjer[i]); });
          if(Object.keys(l).length) ut.linjer = l;
        }
        return ut;
      });
    const s = [].concat(arg.stryk || []).map(String).filter(Boolean);
    if(!g.length && !s.length) throw new Error('Ingen poster å godkjenne eller stryke.');
    const r = await skrivOkBank('', { hva:'godkjenn', godkjenn:g, strok:s });
    skrivOkFerdig();
    return { godkjent:g.length, stroket:s.length, svar:'Ført. Det kan angres fra Økonomi-sida.', detaljer:{ godkjent:r.godkjent, stroket:r.stroket } };
  }

  if(navn === 'sett_okonomi_formue'){
    const f = await skrivOkBank('?hva=formue');
    const verdier = (f.verdier || []).slice(), gjeld = (f.gjeld || []).map(function(x){ return Object.assign({}, x); });
    const finn = function(liste, n){ return liste.filter(function(x){ return String(x.navn).toLowerCase() === n.toLowerCase(); })[0]; };
    const endret = [];
    /* Utenfor sida: bare det som finnes, og feltene «Neam trenger» viser. */
    const sida = skrivOkPaaSida();
    const bolig = function(x){ return /bolig|hus|leilighet/i.test(x.navn); };
    const nyttGreit = function(liste, n){
      if(sida) return true;
      if(liste === verdier) return /^bolig$/i.test(n) && !verdier.some(bolig);
      return /^boliglån$/i.test(n) && !gjeld.some(bolig);
    };
    const nekt = function(n){ throw new Error('«' + n + '» finnes ikke i formuen. ' + SKRIV_OK_UTENFOR); };
    [].concat(arg.verdier || []).forEach(function(v){
      const n = String(v && v.navn || '').trim(), b = Math.round(Number(v && v.belop));
      if(!n) throw new Error('En verdi mangler navn.');
      if(!(b >= 0)) throw new Error('Ugyldig beløp for ' + n);
      const x = finn(verdier, n);
      if(x && x.konto) throw new Error(n + ' følger saldoen på en konto og kan ikke settes her.');
      if(x){ endret.push({ navn:x.navn, fra:x.belop, til:b }); x.belop = b; }
      else if(!nyttGreit(verdier, n)) nekt(n);
      else { endret.push({ navn:n, ny:true, til:b }); verdier.push({ navn:n, belop:b }); }
    });
    [].concat(arg.gjeld || []).forEach(function(g){
      const n = String(g && g.navn || '').trim();
      if(!n) throw new Error('En gjeld mangler navn.');
      let x = finn(gjeld, n);
      if(!x){
        if(!nyttGreit(gjeld, n)) nekt(n);
        if(g.belop == null) throw new Error('Ny gjeld trenger et beløp: ' + n);
        x = { navn:n, belop:0 }; gjeld.push(x);
      }
      if(g.belop != null){ const b = Math.round(Number(g.belop)); if(!(b >= 0)) throw new Error('Ugyldig beløp for ' + n); x.belop = b; }
      if(g.rente != null){ const r = Number(g.rente); if(!(r >= 0 && r < 30)) throw new Error('Ugyldig rente for ' + n); x.rente = r; }
      if(g.type){ if(!SKRIV_OK_LAN[g.type]) throw new Error('Ukjent type lån: ' + g.type); x.type = g.type; }
      endret.push({ navn:x.navn, gjeld:x.belop, rente:x.rente });
    });
    let maal = f.maal && String(f.maal.navn || '').trim() ? f.maal : null;
    if(arg.familiemaal){
      const n = String(arg.familiemaal.navn || '').trim(), b = Math.round(Number(arg.familiemaal.belop));
      if(!n || !(b > 0)) throw new Error('Familiemålet trenger navn og beløp.');
      if(!sida && maal && maal.navn.toLowerCase() !== n.toLowerCase()) throw new Error('Familiemålet heter «' + maal.navn + '». ' + SKRIV_OK_UTENFOR);
      maal = Object.assign({ spart:0, konto:'' }, maal || {}, { navn:n, belop:b });
      endret.push({ familiemaal:n, til:b });
    }
    /* Bruttoinntekten per person; Fastloenn kan fylles inn utenfor sida naar
       personen ikke har noe, som feltet i «Neam trenger». */
    const brutto = { magne:((f.brutto || {}).magne || []).map(function(x){ return Object.assign({}, x); }),
                     nina:((f.brutto || {}).nina || []).map(function(x){ return Object.assign({}, x); }) };
    [].concat(arg.bruttoinntekt || []).forEach(function(b){
      const hvem = String(b && b.hvem || '').toLowerCase(), navn = String(b && b.navn || 'Fastlønn').trim() || 'Fastlønn';
      const v = Math.round(Number(b && b.belop));
      if(!brutto[hvem]) throw new Error('Bruttoinntekt gjelder Magne eller Nina.');
      if(!(v >= 0)) throw new Error('Ugyldig beløp for ' + navn);
      const x = finn(brutto[hvem], navn);
      if(x){ endret.push({ brutto:b.hvem, navn:x.navn, fra:x.belop, til:v }); x.belop = v; }
      else if(!sida && !(/^fastlønn$/i.test(navn) && !brutto[hvem].length)) nekt(b.hvem + ', ' + navn);
      else { endret.push({ brutto:b.hvem, navn:navn, ny:true, til:v }); brutto[hvem].push({ navn:navn, belop:v }); }
    });
    if(!endret.length) throw new Error('Ingen endringer.');
    const r = await skrivOkBank('', { hva:'formue', verdier:verdier, gjeld:gjeld, maal:maal, brutto:brutto });
    if(typeof lesAltOkSist !== 'undefined') lesAltOkSist.formue = { verdier:r.verdier || [], gjeld:r.gjeld || [], maal:r.maal || null, brutto:r.brutto || {} };
    skrivOkFerdig();
    return { endret:endret, svar:'Lagret i formuen. Det kan endres i Oppsett på Økonomi.' };
  }

  if(navn === 'sett_okonomi_budsjett'){
    const maal = String(arg.maal || '');
    if(maal !== 'standard' && !/^\d{4}-\d{2}$/.test(maal)) throw new Error('maal må være «standard» eller ÅÅÅÅ-MM.');
    const b = await skrivOkBank('?hva=budsjett');
    const kat = b.kategorier || [];
    const grunn = maal === 'standard' ? (b.standard || {}) : ((b.maaneder || {})[maal] || b.standard || {});
    const nytt = Object.assign({}, grunn), endret = [];
    [].concat(arg.endringer || []).forEach(function(e){
      const k = String(e && e.kategori || ''), v = Math.round(Number(e && e.belop));
      if(kat.indexOf(k) === -1) throw new Error('Posten «' + k + '» finnes ikke i budsjettet. ' + (skrivOkPaaSida()
        ? 'Lag den med endre_okonomi_budsjettposter først.' : SKRIV_OK_UTENFOR));
      if(!(v >= 0)) throw new Error('Ugyldig beløp for ' + k);
      endret.push({ kategori:k, fra:grunn[k] || 0, til:v });
      nytt[k] = v;
    });
    if(!endret.length) throw new Error('Ingen endringer.');
    await skrivOkBank('', maal === 'standard' ? { hva:'budsjett', standard:nytt } : { hva:'budsjett', mnd:maal, maaned:nytt });
    if(typeof lesAltOkSist !== 'undefined') lesAltOkSist.budsjett = { maal:maal, verdier:nytt };
    skrivOkFerdig();
    return { maal:maal, endret:endret };
  }

  throw new Error('Ukjent økonomiverktøy: ' + navn);
}
