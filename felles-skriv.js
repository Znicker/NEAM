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
