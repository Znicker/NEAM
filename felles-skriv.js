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
   Verktøyene
   ------------------------------------------------------------ */

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
  }
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

    /* Handleturen. Samme regel som sikreAktivOkt() i sida: den navngitte,
       ellers den nyeste i omraadet, ellers en ny med ukenummeret. */
    let okt = null;
    const sok = String(arg.handletur || '').trim().toLowerCase();
    if(sok){
      okt = d.okter.filter(function(o){
        return String(o.navn || '').trim().toLowerCase() === sok;
      })[0] || d.okter.filter(function(o){
        return String(o.navn || '').trim().toLowerCase().indexOf(sok) !== -1;
      })[0] || null;
      if(!okt) throw new Error('Fant ingen handletur som heter «' + arg.handletur
                             + '». Bruk les_handleliste for navnene.');
    }else{
      const iOmr = d.okter.filter(function(o){ return (o.omrade || 'mat') === omr; })
                          .sort(function(a, b){ return (a.opprettet || 0) - (b.opprettet || 0); });
      okt = iOmr.length ? iOmr[iOmr.length - 1] : null;
      if(!okt){
        okt = { id: skrivId('o'), navn: 'Uke ' + skrivUke(new Date()),
                omrade: omr, startet: false, startTid: null, opprettet: Date.now() };
        d.okter.push(okt);
      }
    }
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

  return null;
}

/* Verktoeyene sida ikke alt har selv - samme regel som lesAltVerktoy().
   Staar man PAA Matlaging, vinner sidas eget legg_til_varer: bare det ser
   hvilken handletur brukeren faktisk har oppe, og bare det tegner lista
   om etterpaa. */
function skrivVerktoy(egne){
  const tatt = {};
  (egne || []).forEach(function(v){ if(v && v.name) tatt[v.name] = true; });
  return SKRIV_VERKTOY.filter(function(v){ return !tatt[v.name]; });
}
