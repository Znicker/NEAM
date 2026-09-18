/* ============================================================
   Neam - Homey, serversiden

   Ligger i repoet som:  functions/api/homey.js
   Gir endepunktet:      /api/homey

   HVORFOR DEN FINNES
   Homey staar paa hjemmenettet. En Pages Function kjoerer hos
   Cloudflare og kommer aldri inn dit - hverken paa IP-adressen
   eller paa `homeylocal.com`-navnet, som peker paa den samme
   private adressen. Veien gaar derfor gjennom Athoms sky, som
   gir hver Homey Pro en offentlig `remoteUrl`.

   VEIEN INN ER FIRE STEG, ikke ett:
     1. OAuth2 mot api.athom.com  -> access + refresh token
     2. GET /user/me              -> hvilke Homey-er, og remoteUrl
     3. POST /delegation/token    -> et delegeringsbevis
     4. POST {remoteUrl}/api/manager/users/login -> sesjonstoken
   Foerst DA kan vi spoerre om enheter. Stegene 2-4 gjoeres om
   igjen naar sesjonen gaar ut; steg 1 holder i praksis for alltid.

   LEVETIDER (fra Athoms spesifikasjon):
     access token   - 1 time
     refresh token  - utloeper ALDRI, med mindre brukeren trekker
                      tilbake tilgangen eller det gaar 6 maaneder
                      uten et eneste kall
     sesjonstoken   - ukjent lengde; vi merker det som 401 og
                      lager en ny
   Refresh-tokenet er altsaa mer varig enn Microsofts 90 dager.
   Vi trenger ingen timer for aa holde den i live - siden brukes.

   HVA NETTLESEREN SER
   Ingen tokener. Sida ber om enheter og sender kommandoer; alt
   som kan brukes til aa naa Homey blir her.

   NOEKKELEN LIGGER UTENFOR `fh:` MED VILJE - se ms.js. `/api/data`
   slipper familien til alt under `fh:`, og et refresh-token mot
   huset er ikke noe noen skal kunne lese ut derfra.
   ============================================================ */

const ATHOM = 'https://api.athom.com';
const KLIENT_ID = '6aa482381886c16fbed1f999';

/* Alt svares med 200, ogsaa feil - Cloudflare bytter kroppen paa 5xx.
   Kallstedet leser `ok`. */
function svar(obj){
  return new Response(JSON.stringify(obj), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}

/* Access gir identiteten paa tre maater - se ms.js for hvorfor alle
   tre trengs. Maalt 11. september 2026: e-postheaderen kommer ikke
   fram til en Pages Function hos oss, beviset gjoer det. */
function jwtEpost(tok){
  try{
    const deler = String(tok || '').split('.');
    if(deler.length < 2) return '';
    let b = deler[1].replace(/-/g, '+').replace(/_/g, '/');
    while(b.length % 4) b += '=';
    const d = JSON.parse(atob(b));
    return String((d && (d.email || d.sub_email)) || '').trim().toLowerCase();
  }catch(e){ return ''; }
}
function cookieAv(request, navn){
  const raa = request.headers.get('Cookie') || '';
  for(const bit of raa.split(';')){
    const i = bit.indexOf('=');
    if(i === -1) continue;
    if(bit.slice(0, i).trim() === navn) return bit.slice(i + 1).trim();
  }
  return '';
}
function epostAv(request){
  const rett = (request.headers.get('Cf-Access-Authenticated-User-Email') || '').trim().toLowerCase();
  if(rett) return rett;
  const fraHeader = jwtEpost(request.headers.get('Cf-Access-Jwt-Assertion'));
  if(fraHeader) return fraHeader;
  return jwtEpost(cookieAv(request, 'CF_Authorization'));
}

function lovligRedirect(u){
  let url;
  try{ url = new URL(String(u || '')); }catch(e){ return null; }
  if(url.protocol !== 'https:') return null;
  if(url.hostname.toLowerCase() !== 'neam.no') return null;
  return url.origin + url.pathname;
}

/* ÉN noekkel for hele huset, ikke én per person.

   Homey er husets, ikke den enkeltes: doera er den samme uansett hvem
   som staar og ser paa den. Foerste utgave laa under
   `auth:homey:<epost>`, og da maatte hver enhet godkjennes for seg -
   Access-identiteten er ikke den samme paa PC-en og telefonen.

   Dette er den ene forskjellen fra ms.js, som ER personlig: kalenderen
   er din, huset er vaart.

   Godkjenningen gjoeres av én person, og den staar for alle. Hvem det
   var, skrives ned - ikke for aa begrense noe, men fordi den dagen
   tilgangen skal trekkes tilbake, er det den kontoen hos Athom det
   gjelder. */
const NOKKEL = 'auth:homey:hus';

async function lesOekt(env, epost){
  let raa = await env.FAMILIE_KV.get(NOKKEL);
  if(!raa && epost){
    /* Fra tiden da oekta laa per person. Finnes en slik, flyttes den til
       husnoekkelen ved foerste bruk - da slipper man aa godkjenne paa
       nytt. Den gamle blir staaende til den er tom; en sletting som
       ryker midtveis skal ikke koste noen tilgangen. */
    raa = await env.FAMILIE_KV.get('auth:homey:' + epost);
    if(raa) await env.FAMILIE_KV.put(NOKKEL, raa);
  }
  if(!raa) return null;
  try{ return JSON.parse(raa); }catch(e){ return null; }
}
async function skrivOekt(env, epost, o){
  if(epost && !o.godkjentAv) o.godkjentAv = epost;
  await env.FAMILIE_KV.put(NOKKEL, JSON.stringify(o));
}

/* ---------- Steg 1: OAuth2 mot Athom ----------
   MERK formen: parameteren heter `authorization_code`, ikke `code`,
   og hemmeligheten sendes som Basic-header, ikke i kroppen. Begge
   deler skiller seg fra Microsoft, og begge gir en uklar feil hvis
   man tar feil. */
async function ettTokenforsoek(felter, env, iKropp){
  const hodet = { 'Content-Type': 'application/x-www-form-urlencoded' };
  const kropp = Object.assign({}, felter);

  if(iKropp){
    kropp.client_id     = KLIENT_ID;
    kropp.client_secret = env.HOMEY_CLIENT_SECRET;
  }else{
    hodet.Authorization = 'Basic ' + btoa(KLIENT_ID + ':' + env.HOMEY_CLIENT_SECRET);
  }

  const r = await fetch(ATHOM + '/oauth2/token', {
    method: 'POST', headers: hodet, body: new URLSearchParams(kropp)
  });
  const tekst = await r.text();
  let d;
  try{ d = JSON.parse(tekst); }
  catch(e){ return { feil: 'Uventet svar fra Athom', status: r.status }; }
  if(!r.ok){
    let tekstFeil = d.error_description;
    /* Athom svarer noen ganger med et OBJEKT i error_description, ikke
       en streng - {"response_type":"Invalid value"}. Uten dette ble
       feilmeldingen til «[object Object]» paa skjermen. */
    if(tekstFeil && typeof tekstFeil === 'object') tekstFeil = JSON.stringify(tekstFeil);
    return { feil: tekstFeil || d.error || ('Athom svarte ' + r.status),
             kode: d.error || '', status: r.status };
  }
  return { data: d };
}

/* To maater aa vise hemmeligheten paa, og vi vet ikke hvilken Athom vil
   ha. Spesifikasjonen sier Basic-header. Men den samme spesifikasjonen
   sa ogsaa `authorization_type` der tjeneren ville ha `response_type`
   (maalt 11. september 2026), saa den er ikke til aa stole blindt paa.

   Derfor: Basic foerst, som dokumentert. Avvises nøklene, prøves
   kroppen - som er den andre lovlige maaten i OAuth2. Det koster ett
   ekstra kall den gangen den foerste ikke virker, og ingenting etterpaa.

   Begge samtidig er IKKE et alternativ: flere tjenere avviser en
   forespoersel som viser legitimasjon paa to maater. */
async function athomToken(felter, env){
  const a = await ettTokenforsoek(felter, env, false);
  if(!a.feil) return a;

  const nekter = a.status === 400 || a.status === 401;
  if(!nekter) return a;

  const b = await ettTokenforsoek(felter, env, true);
  if(!b.feil) return b;

  /* Begge veier ble avvist. Da er det hemmeligheten det staar paa, og
     meldingen skal si det - ikke bare gjenta Athoms ordlyd. */
  return { feil: b.feil + ' (prøvde både Basic-header og kropp – '
                 + 'sjekk HOMEY_CLIENT_SECRET i Cloudflare, og at den er rullet ut)',
           kode: b.kode, status: b.status };
}

/* Et access token som lever, eller et nytt. Skriver alltid ned et nytt
   refresh-token naar Athom gir et - «save the entire new token», sier
   spesifikasjonen. */
async function gyldigAccess(env, epost, oekt){
  if(oekt.access && oekt.accessUt && Date.now() < oekt.accessUt){
    return { access: oekt.access, oekt: oekt };
  }
  if(!oekt.refresh) return { feil: 'Ingen økt', maaGodkjenne: true };

  const r = await athomToken({ grant_type: 'refresh_token', refresh_token: oekt.refresh }, env);
  if(r.feil){
    const doedt = r.status === 400 || r.status === 401;
    return { feil: r.feil, maaGodkjenne: doedt };
  }
  oekt.access   = r.data.access_token;
  oekt.refresh  = r.data.refresh_token || oekt.refresh;
  oekt.accessUt = Date.now() + (Number(r.data.expires_in) || 3600) * 1000 - 60000;
  /* Sesjonen paa Homey hoerer til det gamle tokenet; la den staa, men
     den kan vaere doed. Den fornyes ved 401 lenger nede. */
  await skrivOekt(env, epost, oekt);
  return { access: oekt.access, oekt: oekt };
}

/* ---------- Steg 2-4: fram til en sesjon paa Homey ---------- */
async function homeyAdresse(access, oekt){
  const r = await fetch(ATHOM + '/user/me', { headers: { Authorization: 'Bearer ' + access } });
  if(!r.ok) return { feil: 'Fikk ikke hentet kontoen din fra Athom (' + r.status + ')' };
  const d = await r.json();
  const liste = (d && d.homeys) || [];
  if(!liste.length) return { feil: 'Ingen Homey på denne kontoen' };

  /* Er det flere, brukes den vi alt har valgt. Ellers den foerste.
     Adressene kan endre seg og bli null - derfor hentes de paa nytt
     hver gang sesjonen bygges, ikke bare én gang. */
  let h = liste[0];
  if(oekt.homeyId){
    const traff = liste.filter(function(x){ return x._id === oekt.homeyId; })[0];
    if(traff) h = traff;
  }
  if(!h.remoteUrl) return { feil: 'Homeyen din har ingen fjernadresse akkurat nå' };
  return { id: h._id, navn: h.name, url: h.remoteUrl };
}

async function nySesjon(env, epost, oekt, access){
  const adr = await homeyAdresse(access, oekt);
  if(adr.feil) return { feil: adr.feil };

  /* Delegeringsbeviset: et JWT med publikum «homey». Svaret er en
     JSON-STRENG, ikke et objekt. */
  const rd = await fetch(ATHOM + '/delegation/token?audience=homey', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + access }
  });
  if(!rd.ok) return { feil: 'Fikk ikke delegeringsbevis (' + rd.status + ')' };
  const delegering = (await rd.json());

  const rs = await fetch(adr.url + '/api/manager/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: delegering })
  });
  if(!rs.ok) return { feil: 'Homey avviste innloggingen (' + rs.status + ')' };
  const sesjon = await rs.json();

  oekt.homeyId  = adr.id;
  oekt.homeyNavn = adr.navn;
  oekt.url      = adr.url;
  oekt.sesjon   = sesjon;
  await skrivOekt(env, epost, oekt);
  return { url: adr.url, sesjon: sesjon };
}

/* Kaller Homey. Svarer den 401, er sesjonen doed - da bygges en ny og
   kallet gjentas ÉN gang. Uten den ene gjentakelsen ville hver tur
   etter at sesjonen gikk ut sett ut som en feil for brukeren. */
async function motHomey(env, epost, sti, valg){
  const oekt0 = await lesOekt(env, epost);
  if(!oekt0) return { feil: 'Ingen økt', maaGodkjenne: true };

  const a = await gyldigAccess(env, epost, oekt0);
  if(a.feil) return { feil: a.feil, maaGodkjenne: !!a.maaGodkjenne };
  let oekt = a.oekt;

  async function ett(){
    if(!oekt.url || !oekt.sesjon){
      const s = await nySesjon(env, epost, oekt, a.access);
      if(s.feil) return { feil: s.feil };
    }
    const hodet = { Authorization: 'Bearer ' + oekt.sesjon };
    let kropp;
    if(valg && valg.tekst !== undefined){
      /* WebRTC-tilbudet sendes som ren tekst, ikke JSON - se
         onRequestPost, hva:'tilbud'. */
      hodet['Content-Type'] = 'text/plain';
      kropp = valg.tekst;
    }else if(valg && valg.body){
      hodet['Content-Type'] = 'application/json';
      kropp = JSON.stringify(valg.body);
    }
    const r = await fetch(oekt.url + sti, {
      method: (valg && valg.method) || 'GET',
      headers: hodet,
      body: kropp
    });
    return { r: r };
  }

  let ut = await ett();
  if(ut.feil) return ut;

  if(ut.r.status === 401){
    oekt.sesjon = null;
    const s = await nySesjon(env, epost, oekt, a.access);
    if(s.feil) return { feil: s.feil };
    ut = await ett();
    if(ut.feil) return ut;
  }

  if(!ut.r.ok){
    const t = await ut.r.text();
    return { feil: 'Homey svarte ' + ut.r.status + (t ? ': ' + t.slice(0, 200) : '') };
  }
  const tekst = await ut.r.text();
  if(valg && valg.svarTekst) return { tekst: tekst };
  try{ return { data: tekst ? JSON.parse(tekst) : null }; }
  catch(e){ return { data: null }; }
}

/* ============================================================
   Endepunktene
   ============================================================ */

export async function onRequestPost({ request, env }){
  if(!env.HOMEY_CLIENT_SECRET) return svar({ ok:false, feil:'HOMEY_CLIENT_SECRET mangler' });
  if(!env.FAMILIE_KV)          return svar({ ok:false, feil:'KV ikke bundet' });

  const epost = epostAv(request);
  if(!epost) return svar({ ok:false, feil:'Ingen Access-identitet' });

  let inn;
  try{ inn = await request.json(); }
  catch(e){ return svar({ ok:false, feil:'Ugyldig JSON' }); }

  const hva = String(inn && inn.hva || '');

  /* ---------- Godkjenningen kommer tilbake ---------- */
  if(hva === 'kode'){
    if(!lovligRedirect(inn.redirect)) return svar({ ok:false, feil:'Ugyldig returadresse' });
    if(!inn.code) return svar({ ok:false, feil:'Mangler kode' });

    /* Athoms spesifikasjon sier `authorization_code`; standarden sier
       `code`. Ved godkjenningen viste det seg at tjeneren fulgte
       standarden og ikke spesifikasjonen (se sikkerhet.html), saa her
       sendes begge. Et felt for mye blir ignorert; et felt for lite
       gir en uklar feil. */
    const r = await athomToken({
      grant_type: 'authorization_code',
      authorization_code: String(inn.code),
      code: String(inn.code)
    }, env);
    if(r.feil) return svar({ ok:false, feil:r.feil });

    await skrivOekt(env, epost, {
      refresh:  r.data.refresh_token,
      access:   r.data.access_token,
      accessUt: Date.now() + (Number(r.data.expires_in) || 3600) * 1000 - 60000,
      satt:     Date.now()
    });
    return svar({ ok:true });
  }

  /* ---------- Glem oekta ---------- */
  if(hva === 'ut'){
    await env.FAMILIE_KV.delete(NOKKEL);
    await env.FAMILIE_KV.delete('auth:homey:' + epost);
    return svar({ ok:true });
  }

  /* ---------- Sett en verdi paa en enhet ---------- */
  if(hva === 'sett'){
    const id  = String(inn.enhet || '');
    const kap = String(inn.kapabilitet || '');
    if(!id || !kap) return svar({ ok:false, feil:'Mangler enhet eller kapabilitet' });
    /* Id-ene er Homeys egne og kan inneholde tegn som deler opp en sti. */
    const sti = '/api/manager/devices/device/' + encodeURIComponent(id)
              + '/capability/' + encodeURIComponent(kap);
    const r = await motHomey(env, epost, sti, { method:'PUT', body:{ value: inn.verdi } });
    if(r.feil) return svar({ ok:false, feil:r.feil, maaGodkjenne: !!r.maaGodkjenne });
    return svar({ ok:true, svar:r.data });
  }

  /* ---------- WebRTC: tilbud inn, svar ut ----------
     Nettleseren lager et tilbud (SDP), vi sender det videre til Homey,
     og Homey svarer med sitt. Deretter gaar selve videostroemmen DIREKTE
     mellom nettleseren og kameraet - bare denne ene utvekslingen gaar
     gjennom oss. Video gjennom en Pages Function ville vaert baade tregt
     og dyrt.

     Kroppen er REN TEKST i begge retninger. Ingen JSON, ingen felter
     rundt - maalt i Homeys egen webapp 11. september 2026.

     MERK: et tilbud inneholder husets offentlige IP-adresse i klartekst.
     Det er normalt for WebRTC, men det skal derfor ikke lagres eller
     logges noe sted. Vi sender det videre og glemmer det. */
  if(hva === 'tilbud'){
    const id = String(inn.video || '');
    if(!id)       return svar({ ok:false, feil:'Mangler video' });
    if(!inn.sdp)  return svar({ ok:false, feil:'Mangler tilbud' });

    const sti = '/api/manager/videos/video/' + encodeURIComponent(id) + '/offer';

    /* Homey vil ha tilbudet i et FELT som heter `offer`, ikke som ren
       tekst - den svarte «Missing Parameter: offer» paa raa SDP
       (maalt 11. september 2026). Ren tekst er likevel beholdt som
       reserve: nettverksloggen fra Homeys egen webapp viste raa SDP i
       kroppen, saa formen kan variere med versjon. JSON foerst,
       tekst hvis den avvises. */
    let r = await motHomey(env, epost, sti,
                           { method:'POST', body:{ offer:String(inn.sdp) }, svarTekst:true });

    if(r.feil && /Missing Parameter|400/i.test(r.feil)){
      r = await motHomey(env, epost, sti,
                         { method:'POST', tekst:String(inn.sdp), svarTekst:true });
    }

    if(r.feil) return svar({ ok:false, feil:r.feil, maaGodkjenne: !!r.maaGodkjenne });
    if(!r.tekst) return svar({ ok:false, feil:'Homey svarte uten innhold' });

    /* Svaret kan komme som ren SDP eller som JSON med svaret i et felt.
       Vi tar begge; sida skal bare ha strengen. */
    let sdp = r.tekst;
    const t = sdp.trim();
    if(t.charAt(0) === '{'){
      try{
        const d = JSON.parse(t);
        sdp = d.answer || d.sdp || d.answerSdp || sdp;
      }catch(e){}
    }
    return svar({ ok:true, sdp:sdp });
  }

  return svar({ ok:false, feil:'Ukjent hva: ' + hva });
}

export async function onRequestGet({ request, env }){
  const epost = epostAv(request);
  if(!epost) return svar({ ok:false, feil:'Ingen Access-identitet' });
  if(!env.FAMILIE_KV) return svar({ ok:false, feil:'KV ikke bundet' });

  let hva = '';
  try{ hva = new URL(request.url).searchParams.get('hva') || ''; }catch(e){}

  /* Finnes det en godkjenning? Sida spoer ved oppstart. */
  if(!hva || hva === 'status'){
    const o = await lesOekt(env, epost);
    return svar({ ok:true, godkjent: !!(o && o.refresh),
                  homey: (o && o.homeyNavn) || '',
                  godkjentAv: (o && o.godkjentAv) || '' });
  }

  if(hva === 'enheter'){
    const r = await motHomey(env, epost, '/api/manager/devices/device');
    if(r.feil) return svar({ ok:false, feil:r.feil, maaGodkjenne: !!r.maaGodkjenne });
    return svar({ ok:true, enheter: r.data });
  }

  if(hva === 'soner'){
    const r = await motHomey(env, epost, '/api/manager/zones/zone');
    if(r.feil) return svar({ ok:false, feil:r.feil, maaGodkjenne: !!r.maaGodkjenne });
    return svar({ ok:true, soner: r.data });
  }

  /* ---------- Flowene ----------
     BARE LESING.

     HVORFOR DE TRENGS: kortet som utloeser en X-Sense-test er
     app-definert og finnes IKKE som kapabilitet paa enheten. Maalt
     17. september 2026: alt paa en roykvarsler er `setable:false`,
     ogsaa `alarm_muted`. Veien gaar derfor gjennom en flow.

     Svaret holdes lite med vilje: id, navn, om den staar paa, og
     hvilke enhets-id-er flowen nevner. Det siste er det eneste vi
     trenger for aa binde en flow til et merke paa sikkerhetssida.
     Resten av en flow er ingens sak her - den kan inneholde adresser
     og nokler vi ikke skal sende videre. */
  if(hva === 'flyter'){
    const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g;
    const ut = [];

    async function samle(sti, slag){
      const r = await motHomey(env, epost, sti);
      if(r.feil) return r.feil;
      const d = r.data || {};
      Object.keys(d).forEach(function(id){
        const f = d[id] || {};
        const egen = f.id || id;
        /* Enhets-id-ene ligger i kortenes argumenter, men feltnavnene
           varierer mellom vanlige og avanserte flows. Vi leter i hele
           flowen i stedet for aa gjette paa en form. */
        const funnet = JSON.stringify(f).match(UUID) || [];
        ut.push({
          id: egen,
          navn: f.name || '',
          slag: slag,
          paa: f.enabled !== false,
          enheter: funnet.filter(function(x, i){
            return x !== egen && funnet.indexOf(x) === i;
          })
        });
      });
      return null;
    }

    const feil1 = await samle('/api/manager/flow/flow', 'vanlig');
    /* Avanserte flows ligger for seg. At de ikke finnes er ikke en feil. */
    await samle('/api/manager/flow/advancedflow', 'avansert');

    if(!ut.length && feil1) return svar({ ok:false, feil:feil1 });
    return svar({ ok:true, flyter: ut });
  }

  return svar({ ok:false, feil:'Ukjent hva: ' + hva });
}

export async function onRequest({ request }){
  return svar({ ok:false, feil:'Bruk GET eller POST', metode: request.method });
}
