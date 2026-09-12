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
  handleliste: 'handleliste:v1',
  oppskrifter: 'p:recipe-index',
  oppskrift:   'p:recipe:',        /* + id */
  andreaFag:   'andrea-fag:v1',
  emmaFag:     'emma-fag:v1',
  diktat:      'andrea-diktat:v1'
};

/* Oppskriftsappen lagrer JSON som en STRENG i KV, ikke som et objekt -
   den gaar gjennom sitt eget window.storage-lag som serialiserer selv.
   Verdien maa derfor tolkes én gang til. De andre appene lagrer objekter
   direkte, saa dette gjelder bare oppskriftene. */
function lesAltTolk(v){
  if(typeof v !== 'string') return v;
  try{ return JSON.parse(v); }catch(e){ return null; }
}

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
    name: 'les_handleliste',
    description: 'Varene som står på handlelista nå, på tvers av handleturer. '
               + 'Virker fra hvilken som helst side. Sier også hvilke som er '
               + 'huket av som kjøpt.',
    input_schema: {
      type:'object',
      properties:{
        handletur: { type:'string', description:'Navnet på én handletur. Utelat for alle.' },
        medKjopte: { type:'boolean', description:'true tar med de avhukede også. '
                                               + 'Standard er å utelate dem.' }
      },
      required:[]
    }
  },
  {
    name: 'les_oppskrifter',
    description: 'Oppskriftene i oppskriftsboka, med navn, tid, porsjoner og merkelapper. '
               + 'Bruk søkeordet for å finne fram - uten det kommer hele boka, og den kan '
               + 'være lang. Ingredienser og framgangsmåte får du med hent_oppskrift.',
    input_schema: {
      type:'object',
      properties:{
        sok: { type:'string', description:'Del av et navn, en merkelapp eller en '
                                        + 'ingrediens. Utelat for å liste alt.' }
      },
      required:[]
    }
  },
  {
    name: 'hent_oppskrift',
    description: 'Én oppskrift med ingredienser, framgangsmåte og tips. Bruk id-en fra '
               + 'les_oppskrifter. Skal ingrediensene på handlelista, må det gjøres fra '
               + 'Matlaging - herfra kan de bare leses.',
    input_schema: {
      type:'object',
      properties:{ id: { type:'string', description:'Oppskriftens id fra les_oppskrifter.' } },
      required:['id']
    }
  },
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

  /* ---------------- Handlelista ---------------- */
  if(navn === 'les_handleliste'){
    const d = await lesAltHent(LESALT_NOKLER.handleliste);
    const okter = (d && d.okter) || [];
    const items = (d && d.items) || [];
    const sok = String(arg.handletur || '').trim().toLowerCase();

    const turer = okter.filter(function(o){
      return !sok || String(o.navn || '').trim().toLowerCase().indexOf(sok) !== -1;
    });
    if(sok && !turer.length){
      throw new Error('Fant ingen handletur som heter «' + arg.handletur + '».');
    }

    return {
      handleturer: turer.map(function(o){
        let varer = items.filter(function(v){ return v.oktId === o.id; });
        const totalt = varer.length;
        if(!arg.medKjopte) varer = varer.filter(function(v){ return !v.done; });
        return {
          navn: o.navn || '(uten navn)',
          omrade: o.omrade === 'annet' ? 'Andre varer' : 'Dagligvarer',
          antall: totalt,
          gjenstaar: items.filter(function(v){ return v.oktId === o.id && !v.done; }).length,
          /* Et tak, ikke en mening om hva som er viktig: en lang liste
             fyller hele svaret og skyver ut alt annet Neam har lest. */
          varer: varer.slice(0, 80).map(function(v){
            return {
              vare: v.vare,
              mengde: [v.antall, v.mengde].filter(Boolean).join(' x ') || null,
              type: v.type || null,
              butikk: v.butikk || null,
              kjopt: !!v.done
            };
          }),
          avkortet: varer.length > 80
        };
      })
    };
  }

  /* ---------------- Oppskriftene ---------------- */
  if(navn === 'les_oppskrifter'){
    const raa = lesAltTolk(await lesAltHent(LESALT_NOKLER.oppskrifter));
    const alle = Array.isArray(raa) ? raa : [];
    const sok = String(arg.sok || '').trim().toLowerCase();

    const treff = alle.filter(function(r){
      if(!sok) return true;
      const felt = [r.title, r.name, r.navn].filter(Boolean).join(' ')
                 + ' ' + (Array.isArray(r.tags) ? r.tags.join(' ') : '')
                 + ' ' + (Array.isArray(r.ingredients)
                            ? r.ingredients.map(function(i){
                                return typeof i === 'string' ? i : (i && (i.name || i.vare) || '');
                              }).join(' ')
                            : '');
      return felt.toLowerCase().indexOf(sok) !== -1;
    });

    return {
      sok: arg.sok || null,
      antall: treff.length,
      oppskrifter: treff.slice(0, 60).map(function(r){
        return {
          id: r.id,
          navn: r.title || r.name || r.navn || '(uten navn)',
          tid: r.time || r.tid || null,
          porsjoner: r.servings || r.porsjoner || null,
          merkelapper: Array.isArray(r.tags) ? r.tags : []
        };
      }),
      avkortet: treff.length > 60
    };
  }

  if(navn === 'hent_oppskrift'){
    const id = String(arg.id || '').trim();
    if(!id) throw new Error('Send id-en fra les_oppskrifter.');
    const r = lesAltTolk(await lesAltHent(LESALT_NOKLER.oppskrift + id));
    if(!r) throw new Error('Fant ingen oppskrift med id «' + id + '». Bruk les_oppskrifter.');
    return {
      id: r.id || id,
      navn: r.title || r.name || r.navn || '(uten navn)',
      tid: r.time || r.tid || null,
      porsjoner: r.servings || r.porsjoner || null,
      merkelapper: Array.isArray(r.tags) ? r.tags : [],
      ingredienser: Array.isArray(r.ingredients) ? r.ingredients.map(function(i){
        if(typeof i === 'string') return i;
        if(!i) return '';
        return [i.amount || i.mengde, i.unit || i.enhet, i.name || i.vare]
          .filter(Boolean).join(' ');
      }).filter(Boolean) : [],
      framgangsmate: Array.isArray(r.steps) ? r.steps.map(function(s){
        return typeof s === 'string' ? s : String((s && (s.text || s.tekst)) || '');
      }).filter(Boolean) : [],
      tips: Array.isArray(r.tips) ? r.tips.map(function(t){
        return typeof t === 'string' ? t : String((t && t.text) || '');
      }).filter(Boolean) : []
    };
  }

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

  return null;
}

/* Verktoeyene sida ikke alt har selv. Sidens egne vinner: de leser fra
   minnet og ser det som staar paa skjermen naa, mens disse gaar til KV
   og kan ligge inntil et minutt bak. */
function lesAltVerktoy(egne){
  const tatt = {};
  (egne || []).forEach(function(v){ if(v && v.name) tatt[v.name] = true; });
  return LESALT_VERKTOY.filter(function(v){ return !tatt[v.name]; });
}
