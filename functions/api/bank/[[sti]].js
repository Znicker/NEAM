/* ============================================================
   Neam - bank, serversiden (Enable Banking)

   Ligger i repoet som:  functions/api/bank/[[sti]].js
   Gir endepunktene:
     GET /api/bank?hva=status          - er banken koblet, og til naar
     GET /api/bank?hva=kontoer         - kontoene med saldo
     GET /api/bank?hva=transaksjoner&konto=<uid>[&fra=AAAA-MM-DD]
     GET /api/bank?hva=banker          - bankene Enable Banking tilbyr i Norge
     GET /api/bank?hva=innboks         - nye transaksjoner fra felleskontoene, med forslag
     POST /api/bank {hva:'godkjenn'}   - godkjenner og stryker poster
     POST /api/bank {hva:'angre'}      - legger poster tilbake i innboksen
     GET /api/bank?hva=trumf           - er Trumf koblet, og virker innloggingen
     GET /api/bank?hva=trumf-kjop      - kjoepene fra trumf.no (siste 12 mnd)
     GET /api/bank?hva=trumf-kvittering&id=<batchId> - varelinjene
     POST /api/bank {hva:'trumf-innlogging', cookie} / {hva:'trumf-koble-fra'}
     POST /api/bank {hva:'kvittering-ny', kvittering}   - kvittering lest fra bilde/PDF
     GET /api/bank?hva=kvittering&id=<postId>         - varelinjene til en kvitteringspost
     GET /api/bank?hva=budsjett / POST {hva:'budsjett', standard} - standardbudsjettet
     GET /api/bank?hva=regnskap&mnd=AAAA-MM            - godkjente poster summert per kategori
     GET /api/bank?hva=varsler          - det som trenger noen (kortet paa forsiden)
     GET /api/bank?hva=regnskap-aar     - godkjente poster per maaned og kategori, hele perioden
     GET /api/bank?hva=formue / POST {hva:'formue', verdier, gjeld, maal} - det banken ikke gir
     POST /api/bank {hva:'forslag', forslag:[{id, kategori, sikker}]}    - Neams kategoriforslag
     POST /api/bank {hva:'kontonavn', uid, navn}                         - eget navn paa en konto (tomt fjerner)
     GET /api/bank?hva=hent             - vekker hentingen; ogsaa kitchen@, svarer ingenting om innholdet
     GET /api/bank?hvem=1              - diagnose: hvilke identitetskilder finnes
     POST /api/bank {hva:'roller'}     - setter rollen paa kontoer
     GET /api/bank/start               - sender deg til DNB for samtykke (BankID)
     GET /api/bank/tilbake             - DNB sender deg hit igjen etterpaa

   HVORFOR DEN FINNES
   Banken snakker bare med en klient som kan signere med appens
   private noekkel. Noekkelen skal aldri i nettleseren (planen,
   «Viktige hensyn»), saa alt mot Enable Banking gaar herfra.

   ENABLE BANKING I KORT FORM
   Hver forespoersel baerer et JWT signert med RS256, `kid` = app-ID.
   Samtykket gis én gang med BankID og varer det banken tillater -
   for de fleste 180 dager. Appen er i «restricted»-modus: den ser
   bare kontoene som er koblet i kontrollpanelet deres.

   HEMMELIGHETER OG MILJOEVARIABLER (Cloudflare Pages -> Settings):
     ENABLE_BANKING_KEY  - hele .pem-fila (hemmelighet)
     ACCESS_TEAM         - teamnavnet i Cloudflare Zero Trust, det som
                           staar foran .cloudflareaccess.com (vanlig variabel)
   En hemmelighet tas foerst i bruk ved neste utrulling.

   TILGANG - STRENGERE ENN DE ANDRE FUNKSJONENE
   ms.js og homey.js leser Access-beviset uten aa sjekke signaturen.
   Her sjekkes den, mot sertifikatene til teamet: bankdata er det
   mest foelsomme huset har, og et usignert bevis kan i prinsippet
   skrives av hvem som helst som allerede er innenfor. Bare
   kontoene i TILGANG slipper til.

   NOEKLER I KV - ALT UNDER `auth:bank:`, UTENFOR `fh:` MED VILJE
     auth:bank:hus             - oekta: session_id, kontoene, gyldig til
     auth:bank:roller          - { <konto-uid>: rolle } - overlever et nytt samtykke
                                 saa lenge banken gir kontoen samme uid
     auth:bank:tilstand:<rnd>  - engangsbevis for runden til DNB (15 min)
     auth:bank:buffer:<navn>   - mellomlager for svar fra banken
     auth:bank:poster          - innboksens poster: ny / godkjent / stroket, med kategori
     auth:bank:laert           - { motpart: kategori } - det Neam foreslaar neste gang
     auth:bank:innboks-fra     - datoen innboksen henter fra (satt foerste gang)
     auth:bank:trumf           - innloggingscookien fra trumf.no (se Trumf-delen)
     auth:bank:kv:<postId>     - varelinjene fra en kvittering lest fra bilde (bildet lagres ikke)
     auth:bank:sist-hentet     - naar vekkeren sist hentet
     auth:bank:trumf-feil      - siste Trumf-feil (slettes naar hentingen virker igjen)
     auth:bank:formue          - verdier, gjeld og familiemaal, fylt inn for haand
     auth:bank:kontonavn       - { <konto-uid>: eget navn } - DNB sender ikke nettbanknavnene
     auth:bank:budsjett        - standardbudsjettet { kategori: kr per maaned } - ALDRI i koden,
                                 repoet er offentlig
   `/api/data` slipper familien til alt under `fh:`. Kontoer og
   transaksjoner skal ikke kunne leses ut derfra.

   HVOR OFTE BANKEN SPOERRES
   Mange banker tillater fire hentinger i doegnet uten at brukeren er
   til stede. Svar fra banken lagres derfor i seks timer, og en ny
   henting skjer foerst naar noen ber om det etter det. `fersk=1`
   tvinger en ny henting; svarer banken nei, faar man bufferen tilbake
   med beskjed om det.
   ============================================================ */

const API = 'https://api.enablebanking.com';
const APP_ID = '429ce2c9-55e4-4183-a695-d9df8763a260';   // ikke hemmelig - staar i kontrollpanelet
const BANK = { name:'DNB', country:'NO' };
const TILBAKE = 'https://neam.no/api/bank/tilbake';
/* Bare sys@ mens okonomi.html er under arbeid (Magne, 28. oktober 2026).
   magne@ og nina@ legges til naar sida tas i bruk. */
const TILGANG = ['sys@neam.no'];
/* Kan vekke hentingen (?hva=hent), men faar ikke se noe. Se der. */
const HENT_TILGANG = TILGANG.concat(['kitchen@neam.no']);
const SIST_HENTET_NOKKEL = 'auth:bank:sist-hentet';
const TRUMF_FEIL_NOKKEL = 'auth:bank:trumf-feil';

/* Rollene en konto kan ha. Rollen avgjoer hvor transaksjonene havner:
   felles -> husholdningsbudsjettet, magne/nina -> den personlige sida,
   emma/andrea -> barnas sider, sparing -> formuen, ignorer -> ingen steder. */
const ROLLER = ['felles', 'magne', 'nina', 'sparing', 'emma', 'andrea', 'ignorer'];
const ROLLE_NOKKEL = 'auth:bank:roller';
/* Egne navn paa kontoene. DNB sender ikke navnene man har satt i nettbanken
   gjennom open banking - bare produktnavn - saa de gis i Neam (Oppsett). */
const KONTONAVN_NOKKEL = 'auth:bank:kontonavn';

const NOKKEL = 'auth:bank:hus';
const BUFFER_TID = 6 * 3600 * 1000;

/* Alt svares med 200, ogsaa feil - Cloudflare bytter kroppen paa 5xx.
   Kallstedet leser `ok`. */
function svar(obj){
  return new Response(JSON.stringify(obj), {
    status: 200,
    headers: { 'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store' }
  });
}
/* Start og tilbake er sider man lander paa i nettleseren, ikke kall fra
   kode. De svarer derfor med en kort side i klartekst. */
function side(tittel, tekst){
  const vask = s => String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' })[c]);
  return new Response('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'
    + '<title>' + vask(tittel) + '</title>'
    + '<body style="font-family:system-ui,sans-serif;max-width:32em;margin:3em auto;padding:0 16px;color:#2C3E50">'
    + '<h1 style="font-size:20px">' + vask(tittel) + '</h1><p>' + vask(tekst) + '</p><p><a href="/">Til forsiden</a></p>', {
    status: 200,
    headers: { 'Content-Type':'text/html; charset=utf-8', 'Cache-Control':'no-store' }
  });
}

/* ---------- base64url ---------- */
function b64url(bytes){
  let s = '';
  const b = new Uint8Array(bytes);
  for(let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function fraB64url(s){
  let b = String(s).replace(/-/g, '+').replace(/_/g, '/');
  while(b.length % 4) b += '=';
  const raa = atob(b), ut = new Uint8Array(raa.length);
  for(let i = 0; i < raa.length; i++) ut[i] = raa.charCodeAt(i);
  return ut;
}
const tekstTilBytes = s => new TextEncoder().encode(s);

/* ---------- Identitet fra Access, med signaturen sjekket ---------- */
function cookieAv(request, navn){
  const raa = request.headers.get('Cookie') || '';
  for(const bit of raa.split(';')){
    const i = bit.indexOf('=');
    if(i === -1) continue;
    if(bit.slice(0, i).trim() === navn) return bit.slice(i + 1).trim();
  }
  return '';
}
async function accessNoekler(team){
  const r = await fetch('https://' + team + '.cloudflareaccess.com/cdn-cgi/access/certs', { cf:{ cacheTtl:3600 } });
  if(!r.ok) return [];
  const d = await r.json();
  return (d && d.keys) || [];
}
/* Gir e-posten bare naar beviset er signert av vaart Access-team og ikke
   er utloept. Ellers tom streng - og `grunn` sier hvorfor, til ?hvem=1. */
async function verifisertEpost(request, env){
  const tok = request.headers.get('Cf-Access-Jwt-Assertion') || cookieAv(request, 'CF_Authorization');
  if(!tok) return { epost:'', grunn:'intet Access-bevis' };
  const team = String(env.ACCESS_TEAM || '').trim().toLowerCase();
  if(!team) return { epost:'', grunn:'ACCESS_TEAM er ikke satt' };
  try{
    const [h, p, sig] = tok.split('.');
    const hode = JSON.parse(new TextDecoder().decode(fraB64url(h)));
    const innhold = JSON.parse(new TextDecoder().decode(fraB64url(p)));
    const jwk = (await accessNoekler(team)).filter(k => k.kid === hode.kid)[0];
    if(!jwk) return { epost:'', grunn:'ukjent noekkel i beviset' };
    const noekkel = await crypto.subtle.importKey('jwk', jwk, { name:'RSASSA-PKCS1-v1_5', hash:'SHA-256' }, false, ['verify']);
    const gyldig = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', noekkel, fraB64url(sig), tekstTilBytes(h + '.' + p));
    if(!gyldig) return { epost:'', grunn:'signaturen stemmer ikke' };
    if(innhold.iss !== 'https://' + team + '.cloudflareaccess.com') return { epost:'', grunn:'feil utsteder' };
    if(!innhold.exp || innhold.exp * 1000 < Date.now()) return { epost:'', grunn:'beviset er utloept' };
    return { epost:String(innhold.email || '').trim().toLowerCase(), grunn:'' };
  }catch(e){
    return { epost:'', grunn:'beviset kunne ikke leses' };
  }
}
async function voksen(request, env){
  const id = await verifisertEpost(request, env);
  if(!id.epost) return { ok:false, feil:'Ingen gyldig innlogging (' + id.grunn + ')' };
  if(TILGANG.indexOf(id.epost) === -1) return { ok:false, feil:'Bankdata er ikke åpnet for denne kontoen' };
  return { ok:true, epost:id.epost };
}
function masker(epost){
  const [navn, domene] = String(epost).split('@');
  return navn ? navn.slice(0, 1) + '***@' + (domene || '') : '';
}

/* ---------- Mot Enable Banking ---------- */
async function appNoekkel(env){
  const pem = String(env.ENABLE_BANKING_KEY || '');
  if(!pem) throw new Error('ENABLE_BANKING_KEY er ikke satt');
  /* Kontrollpanelet lager noekkelen med SubtleCrypto og eksporterer PKCS#8. */
  const kropp = pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
  return crypto.subtle.importKey('pkcs8', fraB64url(kropp.replace(/\+/g, '-').replace(/\//g, '_')),
    { name:'RSASSA-PKCS1-v1_5', hash:'SHA-256' }, false, ['sign']);
}
async function appJwt(env){
  const naa = Math.floor(Date.now() / 1000);
  const hode = b64url(tekstTilBytes(JSON.stringify({ typ:'JWT', alg:'RS256', kid:APP_ID })));
  const innhold = b64url(tekstTilBytes(JSON.stringify({ iss:'enablebanking.com', aud:'api.enablebanking.com', iat:naa, exp:naa + 3600 })));
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', await appNoekkel(env), tekstTilBytes(hode + '.' + innhold));
  return hode + '.' + innhold + '.' + b64url(sig);
}
/* Svarer { ok, data } eller { ok:false, feil, status }. Tokenet logges aldri. */
async function eb(env, metode, sti, kropp){
  const r = await fetch(API + sti, {
    method: metode,
    headers: Object.assign({ 'Authorization':'Bearer ' + await appJwt(env) },
      kropp ? { 'Content-Type':'application/json' } : {}),
    body: kropp ? JSON.stringify(kropp) : undefined
  });
  let data = null;
  try{ data = await r.json(); }catch(e){}
  if(!r.ok){
    const melding = (data && (data.message || data.error || data.detail)) || ('HTTP ' + r.status);
    return { ok:false, status:r.status, feil:'Enable Banking: ' + (typeof melding === 'string' ? melding : JSON.stringify(melding)) };
  }
  return { ok:true, data:data };
}

async function lesOekt(env){
  const raa = await env.FAMILIE_KV.get(NOKKEL);
  if(!raa) return null;
  try{ return JSON.parse(raa); }catch(e){ return null; }
}

/* Mellomlager: gir bufferen hvis den er ung nok, ellers henter og lagrer.
   Feiler hentingen og bufferen finnes, faar man den gamle med beskjed. */
async function medBuffer(env, navn, fersk, hent){
  const nokkel = 'auth:bank:buffer:' + navn;
  let gammel = null;
  try{ gammel = JSON.parse(await env.FAMILIE_KV.get(nokkel) || 'null'); }catch(e){}
  if(gammel && !fersk && Date.now() - gammel.hentet < BUFFER_TID) return Object.assign({ ok:true, fraBuffer:true }, gammel);
  const ny = await hent();
  if(!ny.ok){
    if(gammel) return Object.assign({ ok:true, fraBuffer:true, advarsel:ny.feil }, gammel);
    return ny;
  }
  const lagre = { hentet:Date.now(), data:ny.data };
  await env.FAMILIE_KV.put(nokkel, JSON.stringify(lagre));
  return Object.assign({ ok:true, fraBuffer:false }, lagre);
}

/* Kontonummeret vises bare med de fire siste sifrene. Nok til aa kjenne
   igjen kontoen, lite nok til at et skjermbilde ikke deler det. */
function kontoUt(k){
  const iban = (k.account_id && k.account_id.iban) || '';
  return {
    uid: k.uid,
    navn: k.name || k.product || '',
    produkt: k.product || '',
    type: k.cash_account_type || '',
    valuta: k.currency || '',
    slutt: iban ? iban.slice(-4) : ''
  };
}

/* ---------- Rutene ---------- */
async function start(env){
  /* Bankens lengste samtykke, slik den selv oppgir det. */
  const liste = await eb(env, 'GET', '/aspsps?country=' + BANK.country);
  let sekunder = 180 * 24 * 3600;
  if(liste.ok){
    const dnb = ((liste.data && liste.data.aspsps) || []).filter(a => a.name === BANK.name)[0];
    if(dnb && dnb.maximum_consent_validity) sekunder = dnb.maximum_consent_validity;
  }
  const tilstand = b64url(crypto.getRandomValues(new Uint8Array(24)));
  await env.FAMILIE_KV.put('auth:bank:tilstand:' + tilstand, '1', { expirationTtl:900 });
  const r = await eb(env, 'POST', '/auth', {
    access: { valid_until: new Date(Date.now() + (sekunder - 3600) * 1000).toISOString() },
    aspsp: BANK,
    state: tilstand,
    redirect_url: TILBAKE,
    psu_type: 'personal'
  });
  if(!r.ok) return side('Kunne ikke starte koblingen', r.feil);
  return Response.redirect(r.data.url, 302);
}

async function tilbake(env, url, epost){
  const feil = url.searchParams.get('error');
  if(feil) return side('Koblingen ble ikke fullført', 'Banken svarte: ' + (url.searchParams.get('error_description') || feil));
  const tilstand = url.searchParams.get('state') || '';
  const kode = url.searchParams.get('code') || '';
  if(!tilstand || !(await env.FAMILIE_KV.get('auth:bank:tilstand:' + tilstand))){
    return side('Koblingen ble ikke fullført', 'Lenken er brukt eller for gammel. Start på nytt fra Neam.');
  }
  await env.FAMILIE_KV.delete('auth:bank:tilstand:' + tilstand);
  const r = await eb(env, 'POST', '/sessions', { code:kode });
  if(!r.ok) return side('Koblingen ble ikke fullført', r.feil);
  const okt = {
    session_id: r.data.session_id,
    gyldigTil: (r.data.access && r.data.access.valid_until) || '',
    kontoer: (r.data.accounts || []).map(kontoUt),
    godkjentAv: epost,
    laget: new Date().toISOString()
  };
  await env.FAMILIE_KV.put(NOKKEL, JSON.stringify(okt));
  /* Gammel buffer hoerer til forrige samtykke. */
  const gamle = await env.FAMILIE_KV.list({ prefix:'auth:bank:buffer:' });
  for(const k of gamle.keys) await env.FAMILIE_KV.delete(k.name);
  return side('DNB er koblet', okt.kontoer.length + ' kontoer er tilgjengelige for Neam. Samtykket varer til '
    + (okt.gyldigTil ? okt.gyldigTil.slice(0, 10) : 'ukjent dato') + '. Du kan lukke denne fanen.');
}

async function lesRoller(env){
  try{ return JSON.parse(await env.FAMILIE_KV.get(ROLLE_NOKKEL) || '{}') || {}; }catch(e){ return {}; }
}

async function kontoer(env, okt, fersk){
  const roller = await lesRoller(env);
  const navn = await lesJson(env, KONTONAVN_NOKKEL, {});
  const ut = [];
  let eldst = Date.now(), advarsel = '';
  for(const k of okt.kontoer){
    const r = await medBuffer(env, 'saldo:' + k.uid, fersk, () => eb(env, 'GET', '/accounts/' + encodeURIComponent(k.uid) + '/balances'));
    if(!r.ok){ ut.push(Object.assign({}, k, { navn:navn[k.uid] || k.navn, bankNavn:k.navn, rolle:roller[k.uid] || '', feil:r.feil })); continue; }
    if(r.advarsel) advarsel = r.advarsel;
    eldst = Math.min(eldst, r.hentet);
    const saldoer = (r.data && r.data.balances) || [];
    /* Disponibelt foran bokfoert: det er det man kan bruke. */
    const velg = ['ITAV', 'CLAV', 'ITBD', 'CLBD', 'XPCD'];
    saldoer.sort((a, b) => velg.indexOf(a.balance_type) - velg.indexOf(b.balance_type));
    const s = saldoer[0];
    ut.push(Object.assign({}, k, {
      navn: navn[k.uid] || k.navn,
      bankNavn: k.navn,
      rolle: roller[k.uid] || '',
      saldo: s ? Number(s.balance_amount.amount) : null,
      saldoType: s ? s.balance_type : '',
      hentet: r.hentet
    }));
  }
  await formuePunkt(env, ut);
  return svar({ ok:true, hentet:eldst, advarsel:advarsel || undefined, kontoer:ut });
}

/* Henter og pakker om transaksjonene for én konto. Brukes av baade
   ?hva=transaksjoner og innboksen, saa de ser det samme. */
async function hentTransaksjoner(env, uid, fraDato, fersk){
  const r = await medBuffer(env, 'trans:' + uid + ':' + fraDato, fersk, async () => {
    /* Banken deler lange lister i sider; continuation_key peker paa neste. */
    let alle = [], neste = '', runder = 0;
    do{
      const sti = '/accounts/' + encodeURIComponent(uid) + '/transactions?date_from=' + fraDato
        + (neste ? '&continuation_key=' + encodeURIComponent(neste) : '');
      const s = await eb(env, 'GET', sti);
      if(!s.ok) return s;
      alle = alle.concat((s.data && s.data.transactions) || []);
      neste = (s.data && s.data.continuation_key) || '';
    }while(neste && ++runder < 20);
    return { ok:true, data:alle };
  });
  if(!r.ok) return r;
  const sett = {};
  const liste = [];
  for(const t of (r.data || [])){
    const p = {
      id: t.entry_reference || t.transaction_id || '',
      dato: t.booking_date || t.value_date || t.transaction_date || '',
      belop: Number(t.transaction_amount && t.transaction_amount.amount) * (t.credit_debit_indicator === 'DBIT' ? -1 : 1),
      valuta: t.transaction_amount && t.transaction_amount.currency,
      tekst: [].concat(t.remittance_information || []).join(' ').trim(),
      motpart: (t.creditor && t.creditor.name) || (t.debtor && t.debtor.name) || '',
      status: t.status || ''
    };
    /* Uten bankens egen id lages én av innholdet. To like kjoep samme dag
       paa samme konto er mulig (to kaffer), saa nummeret i rekka er med. */
    if(!p.id){
      const grunn = [uid, p.dato, p.belop, p.tekst, p.motpart].join('|');
      sett[grunn] = (sett[grunn] || 0) + 1;
      p.id = 'h' + b64url(await crypto.subtle.digest('SHA-256', tekstTilBytes(grunn + '|' + sett[grunn]))).slice(0, 22);
    }
    liste.push(p);
  }
  return { ok:true, hentet:r.hentet, fraBuffer:r.fraBuffer, advarsel:r.advarsel, liste:liste };
}

async function transaksjoner(env, okt, uid, fra, fersk){
  if(!okt.kontoer.some(k => k.uid === uid)) return svar({ ok:false, feil:'Ukjent konto' });
  const fraDato = /^\d{4}-\d{2}-\d{2}$/.test(fra || '') ? fra
    : new Date(Date.now() - 31 * 24 * 3600 * 1000).toISOString().slice(0, 10);
  const r = await hentTransaksjoner(env, uid, fraDato, fersk);
  if(!r.ok) return svar(r);
  return svar({ ok:true, hentet:r.hentet, fraBuffer:r.fraBuffer, advarsel:r.advarsel, fra:fraDato, transaksjoner:r.liste });
}

/* ---------- Innboksen ----------
   Transaksjonene fra kontoene med rollen «felles» blir poster som venter
   paa godkjenning, slik skissen viser. Neam foreslaar kategori; det som
   mangler forslag, blir liggende til noen velger. Ingenting utloeper.

   Forslaget kommer fra, i denne rekkefoelgen:
     1. det Neam har laert - samme motpart fikk denne kategorien sist
     2. NOKKELORD under - kjente navn som KIWI, Tibber, Netflix
   Kategoriene foelger BUDSJETT-arket (skissen), pluss to utenfor
   budsjettet: overfoeringer mellom egne kontoer og nedbetaling av
   kortgjeld. Den siste er viktig: kortgjelden betales samlet fra
   felleskontoen, mens kvitteringene viser hva den besto av. Tellet som
   forbruk ville det blitt dobbelt. */
const KATEGORIER = [
  'Bolig · Boliglån', 'Bolig · Boligforsikringer', 'Bolig · Strøm', 'Bolig · Kommunale avgifter', 'Bolig · Annet',
  'Bil · Bompenger', 'Bil · Parkering', 'Bil · Utgifter PHEV', 'Bil · Utgifter Suzuki', 'Bil · Annet',
  'Mat · Dagligvare', 'Mat · Takeaway', 'Mat · Annet',
  'Barna · Felles', 'Barna · Emma', 'Barna · Andrea', 'Barna · Annet',
  'Felles fritid · TV/streaming', 'Felles fritid · Forsikring', 'Felles fritid · Annet',
  'Andre utgifter · Magne', 'Andre utgifter · Nina', 'Andre utgifter · Felles',
  'Inntekter · Magne', 'Inntekter · Nina', 'Inntekter · Barnetrygd', 'Inntekter · Strømstøtte', 'Inntekter · Annet',
  'Sparing · Buffer', 'Sparing · Reise', 'Sparing · Fond', 'Sparing · Annet',
  'Utenfor budsjett · Overføring mellom egne kontoer', 'Utenfor budsjett · Nedbetaling av kortgjeld'
];
/* Bare navn som entydig peker paa én kategori. Drivstoff staar ikke her:
   Circle K kan vaere PHEV eller Suzuki, og det laerer Neam av foerste valg. */
const NOKKELORD = [
  [/KREDITTBANKEN|SPAREBANK 1 KRED|NORGESGRUPPEN FINANS|TRUMF|COOP MASTERCARD/, 'Utenfor budsjett · Nedbetaling av kortgjeld'],
  [/OVERFØRING|OVERF\.|EGEN KONTO|TIL SPAREKONTO|FRA SPAREKONTO/, 'Utenfor budsjett · Overføring mellom egne kontoer'],
  [/BARNETRYGD/, 'Inntekter · Barnetrygd'],
  [/\b(KIWI|REMA|MENY|COOP|EXTRA|OBS|SPAR|JOKER|BUNNPRIS|PRIX|MEGA|ODA)\b/, 'Mat · Dagligvare'],
  [/FOODORA|WOLT|PEPPES|DOLLY DIMPLES|MCDONALD|BURGER KING|MAX BURGERS/, 'Mat · Takeaway'],
  [/TIBBER|AGDER ENERGI|NETTLEIE|ELVIA|GLITRE/, 'Bolig · Strøm'],
  [/NETFLIX|HBO|DISNEY|SPOTIFY|YOUTUBE|TV ?2|PRIME VIDEO|TELENOR/, 'Felles fritid · TV/streaming'],
  [/AUTOPASS|FJELLINJEN|FERDE|SKYTTEL|BOMPENGER/, 'Bil · Bompenger'],
  [/EASYPARK|APCOA|ONEPARK|PARKERING/, 'Bil · Parkering'],
  [/STATENS PENSJONSKASSE|\bSPK\b|BULDER/, 'Bolig · Boliglån']
];
/* Egne poster: det Magne legger til selv, og linjene under postene som
   Excel-importen lager («Bolig · Strøm · Nettleie»). De ligger i KV og ikke
   her, fordi linjenavnene sier mer om huset enn et offentlig repo skal.
   Et tredje ledd er en linje under posten; summen av posten er posten
   selv pluss linjene. */
const EGNE_NOKKEL = 'auth:bank:kategorier';
async function lesEgne(env){ return [].concat(await lesJson(env, EGNE_NOKKEL, [])); }
function flett(egne){
  const ut = KATEGORIER.slice();
  for(const k of egne){
    if(ut.indexOf(k) !== -1) continue;
    const d = k.split(' · ');
    if(d.length === 3){
      /* Etter posten og linjene den alt har. */
      const forelder = d[0] + ' · ' + d[1];
      let i = ut.lastIndexOf(forelder);
      if(i === -1) continue;
      while(i + 1 < ut.length && ut[i + 1].indexOf(forelder + ' · ') === 0) i++;
      ut.splice(i + 1, 0, k);
    } else {
      /* Foran «Annet» i gruppen, ellers sist i gruppen. */
      let i = ut.indexOf(d[0] + ' · Annet');
      if(i === -1) ut.forEach((x, j) => { if(x.split(' · ')[0] === d[0]) i = j + 1; });
      if(i === -1) continue;
      ut.splice(i, 0, k);
    }
  }
  return ut;
}
async function alleKategorier(env){ return flett(await lesEgne(env)); }
async function budsjettKategorier(env){ return (await alleKategorier(env)).filter(k => k.indexOf('Utenfor budsjett') !== 0); }

/* Nye poster: { forelder, navn }. Forelderen er en gruppe (gir en ny post)
   eller en post (gir en linje). Utenfor budsjett tar ikke imot nye. */
async function nyeKategorier(env, kropp){
  const egne = await lesEgne(env);
  const grupper = KATEGORIER.map(k => k.split(' · ')[0]).filter(g => g !== 'Utenfor budsjett');
  const nye = [];
  for(const n of [].concat(kropp.nye || []).slice(0, 200)){
    const navn = String(n && n.navn || '').replace(/·/g, '').replace(/\s+/g, ' ').trim().slice(0, 40);
    const forelder = String(n && n.forelder || '');
    if(!navn) return svar({ ok:false, feil:'Posten mangler navn' });
    const alle = flett(egne);
    if(forelder.indexOf(' · ') === -1){
      if(grupper.indexOf(forelder) === -1) return svar({ ok:false, feil:'Ukjent gruppe: ' + forelder });
    } else if(alle.indexOf(forelder) === -1 || forelder.split(' · ').length !== 2 || forelder.indexOf('Utenfor budsjett') === 0){
      return svar({ ok:false, feil:'Ukjent post: ' + forelder });
    }
    const ny = forelder + ' · ' + navn;
    if(alle.some(k => k.toLowerCase() === ny.toLowerCase())) continue;
    if(egne.length >= 400) return svar({ ok:false, feil:'For mange egne poster' });
    egne.push(ny); nye.push(ny);
  }
  await env.FAMILIE_KV.put(EGNE_NOKKEL, JSON.stringify(egne));
  return svar({ ok:true, nye:nye, kategorier:flett(egne).filter(k => k.indexOf('Utenfor budsjett') !== 0), egne:egne });
}
/* Bare egne poster kan fjernes, og bare naar ingen foering bruker dem.
   Budsjettet og det Neam har laert for posten, fjernes sammen med den. */
async function slettKategori(env, kropp){
  const k = String(kropp.kategori || '');
  const egne = await lesEgne(env);
  if(egne.indexOf(k) === -1) return svar({ ok:false, feil:'Bare egne poster kan fjernes' });
  if(egne.some(x => x.indexOf(k + ' · ') === 0)) return svar({ ok:false, feil:'Fjern linjene under posten først' });
  const poster = await lesJson(env, POST_NOKKEL, {});
  const brukt = Object.keys(poster).filter(id => poster[id].kategori === k || (poster[id].deler || []).some(d => d.kategori === k)).length;
  if(brukt) return svar({ ok:false, feil:'Posten er brukt i ' + brukt + (brukt === 1 ? ' føring' : ' føringer') + ' og kan ikke fjernes' });
  egne.splice(egne.indexOf(k), 1);
  await env.FAMILIE_KV.put(EGNE_NOKKEL, JSON.stringify(egne));
  const b = await lesJson(env, BUDSJETT_NOKKEL, null);
  if(b && b.standard && b.standard[k] != null){ delete b.standard[k]; await env.FAMILIE_KV.put(BUDSJETT_NOKKEL, JSON.stringify(b)); }
  const laert = await lesJson(env, LAERT_NOKKEL, {});
  let endret = false;
  for(const m of Object.keys(laert)) if(laert[m] === k){ delete laert[m]; endret = true; }
  if(endret) await env.FAMILIE_KV.put(LAERT_NOKKEL, JSON.stringify(laert));
  return svar({ ok:true, kategorier:flett(egne).filter(x => x.indexOf('Utenfor budsjett') !== 0), egne:egne });
}
const POST_NOKKEL = 'auth:bank:poster';
const LAERT_NOKKEL = 'auth:bank:laert';
const FRA_NOKKEL = 'auth:bank:innboks-fra';

/* Motparten uten tall og stoey - «KIWI 123 LYNGDAL» og «KIWI 456 LYNGDAL»
   er samme butikk. Mangler motpart, brukes de tre foerste ordene i teksten. */
function motpartNokkel(p){
  const raa = (p.motpart || String(p.tekst || '').split(/\s+/).slice(0, 3).join(' ')).toUpperCase();
  return raa.replace(/[0-9*#.,:/\\-]+/g, ' ').replace(/\s+/g, ' ').trim();
}
function foreslaa(p, laert){
  const n = motpartNokkel(p);
  if(n && laert[n]) return { kategori:laert[n], kilde:'laert' };
  const tekst = (p.motpart + ' ' + p.tekst).toUpperCase();
  for(const [re, kat] of NOKKELORD) if(re.test(tekst)) return { kategori:kat, kilde:'ord' };
  return { kategori:'', kilde:'' };
}
async function lesJson(env, nokkel, tom){
  try{ return JSON.parse(await env.FAMILIE_KV.get(nokkel) || 'null') || tom; }catch(e){ return tom; }
}

/* ---------- Trumf-kvitteringene i innboksen ----------
   Et Trumf-kjoep kan vaere betalt fra felleskontoen - da finnes det to
   ganger: som banktrekk og som kvittering. De slaas sammen: kvitteringen
   blir posten (den har varene), og banktrekket merkes `dekketAv` og vises
   ikke for seg. Er banktrekket alt godkjent naar kvitteringen kommer,
   kan de ikke slaas sammen stille; da merkes kvitteringen `mulDobbel`, og
   sida stryker den til noen sier noe annet. Betalt med Trumf-kortet
   finnes kjoepet ikke i banken, og kvitteringen er eneste post.

   Lik: samme beloep (til oeret) og hoeyst tre dager mellom datoene - et
   kortkjoep bokfoeres gjerne en dag eller to etter. */
function dagerMellom(a, b){ return Math.abs(Date.parse(a) - Date.parse(b)) / 86400000; }
function erLik(bank, kv){
  return Math.abs(Math.abs(bank.belop) - Math.abs(kv.belop)) < 0.005 && dagerMellom(bank.dato, kv.dato) <= 3;
}
function kobleKvittering(poster, kv){
  if(kv.bankId || kv.mulDobbel) return;
  for(const id of Object.keys(poster)){
    const b = poster[id];
    if(b.fra || b.dekketAv || b.belop >= 0 || !erLik(b, kv)) continue;
    if(b.status === 'ny'){ b.dekketAv = kv.id; kv.bankId = b.id; kv.bankKonto = b.kontoNavn; }
    else if(b.status === 'godkjent'){ kv.mulDobbel = b.id; kv.bankKonto = b.kontoNavn; }
    return;
  }
}

async function innboks(env, okt, fersk){
  const roller = await lesRoller(env);
  const felles = okt.kontoer.filter(k => roller[k.uid] === 'felles');
  const trumfKoblet = !!(await lesJson(env, TRUMF_NOKKEL, null));
  /* Uten felleskonto og Trumf kan innboksen likevel ha kvitteringer lagt inn som bilde. */
  /* Foerste gang: fra den foerste i maaneden. Datoen staar fast etterpaa,
     saa en post som er godkjent eller stroeket, aldri kommer tilbake. */
  let fra = await env.FAMILIE_KV.get(FRA_NOKKEL);
  if(!fra){ fra = new Date().toISOString().slice(0, 8) + '01'; await env.FAMILIE_KV.put(FRA_NOKKEL, fra); }
  const poster = await lesJson(env, POST_NOKKEL, {});
  const laert = await lesJson(env, LAERT_NOKKEL, {});
  let hentet = Date.now(), advarsel = '', nye = 0;
  for(const k of felles){
    const r = await hentTransaksjoner(env, k.uid, fra, fersk);
    if(!r.ok){ advarsel = r.feil; continue; }
    hentet = Math.min(hentet, r.hentet);
    if(r.advarsel) advarsel = r.advarsel;
    for(const t of r.liste){
      /* Bare bokfoerte. En reservasjon kan endre beloep eller forsvinne. */
      if(t.status && t.status !== 'BOOK') continue;
      if(poster[t.id]) continue;
      const f = foreslaa(t, laert);
      const ny = { id:t.id, konto:k.uid, kontoNavn:k.navn, dato:t.dato, belop:t.belop, tekst:t.tekst, motpart:t.motpart,
        status:'ny', kategori:f.kategori, kilde:f.kilde };
      poster[t.id] = ny;
      /* Kom kvitteringen foer banktrekket, kobles de naa. */
      for(const id of Object.keys(poster)){
        const kv = poster[id];
        if(kv.fra && kv.status === 'ny' && !kv.bankId && !kv.mulDobbel && !ny.dekketAv && ny.belop < 0 && erLik(ny, kv)){
          ny.dekketAv = kv.id; kv.bankId = ny.id; kv.bankKonto = ny.kontoNavn;
        }
      }
      nye++;
    }
  }
  if(trumfKoblet){
    const t = await trumfListe(env, fersk);
    /* Feilen huskes for varselkortet: «Trumf trenger ny innlogging» skal
       synes ogsaa naar ingen har aapnet okonomi.html. */
    if(!t.ok){ advarsel = t.feil; await env.FAMILIE_KV.put(TRUMF_FEIL_NOKKEL, JSON.stringify({ kode:t.kode || 'format', feil:t.feil, tid:Date.now() })); }
    else{
      await env.FAMILIE_KV.delete(TRUMF_FEIL_NOKKEL);
      if(t.advarsel) advarsel = t.advarsel;
      hentet = Math.min(hentet, t.hentet);
      for(const k of t.data){
        const dato = k.tid.slice(0, 10);
        if(!dato || dato < fra) continue;
        const id = 'trumf:' + k.id;
        if(poster[id]) continue;
        const kv = { id:id, fra:'trumf', trumfId:k.id, konto:'trumf', kontoNavn:'Trumf-kvittering', dato:dato,
          belop:-Math.abs(k.belop), tekst:'', motpart:k.butikk, harKvittering:k.harKvittering, status:'ny' };
        const f = foreslaa(kv, laert);
        kv.kategori = f.kategori; kv.kilde = f.kilde;
        kobleKvittering(poster, kv);
        poster[id] = kv;
        nye++;
      }
    }
  }
  /* «Spoer bare naar den er usikker» (Magne, 29. oktober). En post Neam
     kjenner - samme motpart foert foer, eller et kjent navn - foeres med en
     gang og merkes `auto`. Den vises under «Foert automatisk» og kan angres;
     en angret post (`manuell`) foeres aldri automatisk igjen. Mulig dobbel
     foeres aldri av seg selv. */
  const naa = new Date().toISOString();
  let endret = nye > 0;
  for(const id of Object.keys(poster)){
    const p = poster[id];
    if(p.status !== 'ny' || p.dekketAv || p.mulDobbel || p.manuell) continue;
    if(!p.kategori){ const f = foreslaa(p, laert); if(f.kategori){ p.kategori = f.kategori; p.kilde = f.kilde; } }
    if(!p.kategori || (p.kilde !== 'laert' && p.kilde !== 'ord')) continue;
    autoFoer(poster, p, naa);
    endret = true;
  }
  if(endret) await env.FAMILIE_KV.put(POST_NOKKEL, JSON.stringify(poster));
  const alle = Object.keys(poster).map(id => poster[id]);
  /* Et banktrekk som er slaatt sammen med en kvittering, vises ikke for seg. */
  const venter = alle.filter(p => p.status === 'ny' && !p.dekketAv).sort((a, b) => b.dato.localeCompare(a.dato));
  for(const p of venter){
    if(p.kategori) continue;
    const f = foreslaa(p, laert);
    if(f.kategori){ p.kategori = f.kategori; p.kilde = f.kilde; }
  }
  /* De automatisk foerte siste 14 dager, nyeste foerst - til gjennomsyn og angre. */
  const grense = new Date(Date.now() - 14 * 86400000).toISOString();
  const auto = alle.filter(p => p.status === 'godkjent' && p.auto && (p.behandlet || '') >= grense)
    .sort((a, b) => b.dato.localeCompare(a.dato)).slice(0, 60);
  /* Egne kontonavn i svaret - postene har navnet fra da de kom inn. */
  const kn = await lesJson(env, KONTONAVN_NOKKEL, {});
  const medNavn = p => {
    const ut = Object.assign({}, p);
    if(kn[p.konto]) ut.kontoNavn = kn[p.konto];
    if(p.bankId && poster[p.bankId] && kn[poster[p.bankId].konto]) ut.bankKonto = kn[poster[p.bankId].konto];
    return ut;
  };
  return svar({ ok:true, hentet:hentet, advarsel:advarsel || undefined, fra:fra, kontoer:felles.length, trumf:trumfKoblet,
    kategorier:await alleKategorier(env), poster:venter.map(medNavn), auto:auto.map(medNavn), godkjent:alle.filter(p => p.status === 'godkjent').length });
}
async function lagreKontonavn(env, kropp){
  const okt = await lesOekt(env);
  if(!okt || !okt.kontoer.some(k => k.uid === kropp.uid)) return svar({ ok:false, feil:'Ukjent konto' });
  const navn = await lesJson(env, KONTONAVN_NOKKEL, {});
  const nytt = String(kropp.navn || '').trim().slice(0, 50);
  if(nytt) navn[kropp.uid] = nytt; else delete navn[kropp.uid];
  await env.FAMILIE_KV.put(KONTONAVN_NOKKEL, JSON.stringify(navn));
  return svar({ ok:true, navn:nytt || null });
}
function autoFoer(poster, p, naa){
  Object.assign(p, { status:'godkjent', auto:true, behandlet:naa, av:'neam' });
  if(p.bankId && poster[p.bankId]) Object.assign(poster[p.bankId], { status:'sammenslatt', behandlet:naa, av:'neam' });
}

/* Neams forslag for poster ingen regel kjente. Sida spoer Claude (via
   /api/claude) og sender svaret hit: { forslag:[{ id, kategori, sikker }] }.
   Sikker -> foeres automatisk og laeres for motparten. Usikker -> blir
   staaende med forslaget, og da spoer sida Magne. Tom kategori -> Neam
   visste ikke; posten merkes saa den ikke sendes paa nytt. */
async function lagreForslag(env, kropp){
  const poster = await lesJson(env, POST_NOKKEL, {});
  const laert = await lesJson(env, LAERT_NOKKEL, {});
  const naa = new Date().toISOString();
  let foert = 0;
  const kategorier = await alleKategorier(env);
  for(const f of [].concat(kropp.forslag || []).slice(0, 100)){
    const p = poster[f && f.id];
    if(!p || p.status !== 'ny') continue;
    p.aiSpurt = true;
    if(!f.kategori || kategorier.indexOf(f.kategori) === -1) continue;
    if(p.kategori && p.kilde !== 'ai-usikker') continue;   /* et menneskes eller en regels valg vinner */
    p.kategori = f.kategori;
    if(f.sikker && !p.mulDobbel && !p.manuell){
      p.kilde = 'ai'; autoFoer(poster, p, naa); foert++;
      const n = motpartNokkel(p);
      if(n) laert[n] = f.kategori;
    } else p.kilde = 'ai-usikker';
  }
  await env.FAMILIE_KV.put(POST_NOKKEL, JSON.stringify(poster));
  await env.FAMILIE_KV.put(LAERT_NOKKEL, JSON.stringify(laert));
  return svar({ ok:true, foert:foert });
}

/* ---------- «Neam ber om input» ----------
   Det varselkortet paa forsiden viser. Regnes fra det som alt er hentet -
   ingen kall til banken her, saa kortet kan spoerre hver gang forsiden
   aapnes. Tom liste betyr at ingenting trenger noen. */
async function varsler(env, okt){
  const poster = await lesJson(env, POST_NOKKEL, {});
  const venter = Object.keys(poster).map(id => poster[id]).filter(p => p.status === 'ny' && !p.dekketAv);
  const uten = venter.filter(p => !p.kategori).length;
  const tf = await lesJson(env, TRUMF_FEIL_NOKKEL, null);
  const sist = await lesJson(env, SIST_HENTET_NOKKEL, null);
  const ut = [];
  if(venter.length) ut.push({ type:'innboks', tekst:venter.length + (venter.length === 1 ? ' post venter' : ' poster venter') + ' på godkjenning'
    + (uten ? ', ' + uten + ' uten kategori' : '') });
  /* Til Status-kortet «Til godkjenning»: hvor sikker Neam er paa det som venter. */
  const innboks = {
    forslag: venter.filter(p => p.kategori && p.kilde !== 'ai-usikker' && !p.mulDobbel).length,
    usikker: venter.filter(p => p.kategori && p.kilde === 'ai-usikker' && !p.mulDobbel).length,
    uten: venter.filter(p => !p.kategori && !p.mulDobbel).length,
    dobbel: venter.filter(p => p.mulDobbel).length,
    eldste: venter.reduce((m, p) => !m || String(p.dato) < m ? String(p.dato) : m, '')
  };
  if(tf) ut.push({ type:'trumf', tekst: tf.kode === 'innlogging' ? 'Trumf trenger ny innlogging' : 'Trumf-hentingen virker ikke – sida er trolig endret' });
  if(!okt) ut.push({ type:'bank', tekst:'Banken er ikke koblet' });
  else{
    const dager = okt.gyldigTil ? Math.floor((Date.parse(okt.gyldigTil) - Date.now()) / 86400000) : null;
    if(dager != null && dager <= 14) ut.push({ type:'samtykke', tekst: dager < 0 ? 'DNB-samtykket har gått ut' : 'DNB-samtykket går ut om ' + dager + (dager === 1 ? ' dag' : ' dager') });
  }
  return svar({ ok:true, varsler:ut, innboks:innboks, sistHentet:sist && sist.tid });
}

/* ---------- Budsjett og regnskap ----------
   Standardbudsjettet ligger i KV, ikke i koden: repoet er offentlig, og
   budsjettet inneholder loenn. Det fylles inn fra okonomi.html (for haand
   eller fra Excel-arket i nettleseren). Regnskapet er summen av de
   godkjente postene per kategori og maaned; «Utenfor budsjett» telles ikke.
   Fortegn: utgifter og sparing som positive beloep (det som gikk ut),
   inntekter som positive beloep (det som kom inn). */
const BUDSJETT_NOKKEL = 'auth:bank:budsjett';

async function budsjett(env){
  const b = await lesJson(env, BUDSJETT_NOKKEL, null);
  return svar({ ok:true, kategorier:await budsjettKategorier(env), egne:await lesEgne(env), standard:(b && b.standard) || {}, endret:b && b.endret, av:b && masker(b.av) });
}
async function lagreBudsjett(env, kropp, epost){
  const inn = kropp.standard || {};
  const ut = {};
  const kategorier = await budsjettKategorier(env);
  for(const k of Object.keys(inn)){
    if(kategorier.indexOf(k) === -1) return svar({ ok:false, feil:'Ukjent kategori: ' + k });
    const v = Math.round(Number(inn[k]) || 0);
    if(v < 0 || v > 1e7) return svar({ ok:false, feil:'Ugyldig beløp for ' + k });
    if(v) ut[k] = v;
  }
  await env.FAMILIE_KV.put(BUDSJETT_NOKKEL, JSON.stringify({ standard:ut, endret:new Date().toISOString(), av:epost }));
  return budsjett(env);
}
/* Hele perioden, maaned for maaned: { 'AAAA-MM': { kategori: beloep } }. For År-fanen. */
async function regnskapAar(env){
  const poster = await lesJson(env, POST_NOKKEL, {});
  const kategorier = await budsjettKategorier(env);
  const ut = {};
  for(const id of Object.keys(poster)){
    const p = poster[id];
    if(p.status !== 'godkjent') continue;
    const m = String(p.dato).slice(0, 7);
    const deler = p.deler && p.deler.length ? p.deler : [{ kategori:p.kategori, belop:p.belop }];
    for(const d of deler){
      if(kategorier.indexOf(d.kategori) === -1) continue;
      if(!ut[m]) ut[m] = {};
      const v = d.kategori.indexOf('Inntekter') === 0 ? d.belop : -d.belop;
      ut[m][d.kategori] = Math.round(((ut[m][d.kategori] || 0) + v) * 100) / 100;
    }
  }
  return svar({ ok:true, fra:(await env.FAMILIE_KV.get(FRA_NOKKEL)) || '', maaneder:ut });
}

/* ---------- Verdier, gjeld og familiemaal ----------
   Det banken ikke gir: husets verdi, bilen, fond, laan (Bulder og SPK er
   ikke koblet) og familiemaalet. Fylles inn for haand i Oppsett, med dato
   paa hvert tall - planen: «hvert tall viser hvor ferskt det er». Saldo
   paa kontoer med rollen «sparing» legges til av sida, fra banken. */
const FORMUE_NOKKEL = 'auth:bank:formue';
async function formue(env){
  const f = await lesJson(env, FORMUE_NOKKEL, {});
  return svar({ ok:true, verdier:f.verdier || [], gjeld:f.gjeld || [], maal:f.maal || null,
    historikk:await lesJson(env, FORMUE_MND_NOKKEL, {}) });
}
/* Netto formue per maaned, slik at Status kan vise endringen siden forrige
   maaned. Siste tall i maaneden vinner; det skrives hver gang kontoene
   hentes og tallet har endret seg. Samme regnestykke som sida gjoer:
   verdier + saldo paa «sparing»-kontoene - gjeld. */
const FORMUE_MND_NOKKEL = 'auth:bank:formue-mnd';
async function formuePunkt(env, kontoliste){
  const f = await lesJson(env, FORMUE_NOKKEL, {});
  const verdier = f.verdier || [], gjeld = f.gjeld || [];
  const sparing = kontoliste.filter(k => k.rolle === 'sparing' && typeof k.saldo === 'number');
  if(!verdier.length && !gjeld.length && !sparing.length) return;
  const netto = Math.round(verdier.reduce((s, v) => s + v.belop, 0) + sparing.reduce((s, k) => s + k.saldo, 0) - gjeld.reduce((s, g) => s + g.belop, 0));
  const hist = await lesJson(env, FORMUE_MND_NOKKEL, {});
  const mnd = new Date().toISOString().slice(0, 7);
  if(hist[mnd] === netto) return;
  hist[mnd] = netto;
  await env.FAMILIE_KV.put(FORMUE_MND_NOKKEL, JSON.stringify(hist));
}
async function lagreFormue(env, kropp, epost){
  const rad = (r, medRente) => {
    const navn = String(r && r.navn || '').trim().slice(0, 60);
    const belop = Math.round(Number(r && r.belop) || 0);
    if(!navn || belop < 0 || belop > 1e9) return null;
    const ut = { navn:navn, belop:belop, dato:/^\d{4}-\d{2}-\d{2}$/.test(r.dato || '') ? r.dato : new Date().toISOString().slice(0, 10) };
    if(medRente){ const rente = Number(r.rente); if(rente >= 0 && rente < 30) ut.rente = Math.round(rente * 100) / 100; }
    return ut;
  };
  const verdier = [].concat(kropp.verdier || []).slice(0, 30).map(r => rad(r, false)).filter(Boolean);
  const gjeld = [].concat(kropp.gjeld || []).slice(0, 30).map(r => rad(r, true)).filter(Boolean);
  let maal = null;
  if(kropp.maal && String(kropp.maal.navn || '').trim()){
    maal = { navn:String(kropp.maal.navn).trim().slice(0, 60), belop:Math.max(0, Math.round(Number(kropp.maal.belop) || 0)),
      spart:Math.max(0, Math.round(Number(kropp.maal.spart) || 0)), konto:String(kropp.maal.konto || '').slice(0, 80) };
  }
  await env.FAMILIE_KV.put(FORMUE_NOKKEL, JSON.stringify({ verdier:verdier, gjeld:gjeld, maal:maal, endret:new Date().toISOString(), av:epost }));
  return formue(env);
}

async function regnskap(env, mnd){
  if(!/^\d{4}-\d{2}$/.test(mnd || '')) mnd = new Date().toISOString().slice(0, 7);
  const poster = await lesJson(env, POST_NOKKEL, {});
  const kategorier = await budsjettKategorier(env);
  const sum = {};
  let antall = 0;
  for(const id of Object.keys(poster)){
    const p = poster[id];
    if(p.status !== 'godkjent' || String(p.dato).slice(0, 7) !== mnd) continue;
    antall++;
    const deler = p.deler && p.deler.length ? p.deler : [{ kategori:p.kategori, belop:p.belop }];
    for(const d of deler){
      if(kategorier.indexOf(d.kategori) === -1) continue;
      const v = d.kategori.indexOf('Inntekter') === 0 ? d.belop : -d.belop;
      sum[d.kategori] = Math.round(((sum[d.kategori] || 0) + v) * 100) / 100;
    }
  }
  const fra = await env.FAMILIE_KV.get(FRA_NOKKEL);
  return svar({ ok:true, mnd:mnd, fra:fra || '', poster:antall, regnskap:sum });
}

/* Hvor varelinjene til en kvitteringspost ligger. Trumf bufrer dem selv;
   en kvittering lest fra bilde lagres naar den kommer inn. */
function kvitteringNokkel(p){
  return p.fra === 'trumf' ? 'auth:bank:buffer:trumf:kv:' + p.trumfId : 'auth:bank:kv:' + p.id;
}

/* ---------- Kvittering fra bilde eller PDF ----------
   Sida lar Neam lese bildet (via /api/claude) og sender det som ble lest
   hit. Selve bildet lagres ikke - bare butikk, dato, sum og varelinjene.
   Posten havner i innboksen som alle andre og maa godkjennes; det er
   bekreftelsen paa at Neam leste riktig (designsystemet, «Bekreftelse»). */
async function nyKvittering(env, kropp, epost){
  const k = kropp.kvittering || {};
  const dato = String(k.dato || '');
  const sum = Math.abs(Number(k.belop));
  if(!/^\d{4}-\d{2}-\d{2}$/.test(dato) || !(sum > 0) || sum > 1e6) return svar({ ok:false, feil:'Mangler dato eller sum – les kvitteringen på nytt eller fyll inn' });
  const butikk = String(k.butikk || '').slice(0, 120) || 'Ukjent butikk';
  const linjer = [].concat(k.linjer || []).slice(0, 300).map(l => ({
    navn: String(l.navn || '').slice(0, 120),
    antall: Number(l.antall) || 1,
    enhet: String(l.enhet || '').slice(0, 10),
    belop: Math.round((Number(l.belop) || 0) * 100) / 100,
    rabatt: Math.round((Number(l.rabatt) || 0) * 100) / 100
  })).filter(l => l.navn);
  /* Samme kvittering lest to ganger skal ikke bli to poster. */
  const id = 'foto:' + b64url(await crypto.subtle.digest('SHA-256', tekstTilBytes([butikk, dato, sum.toFixed(2)].join('|')))).slice(0, 18);
  const poster = await lesJson(env, POST_NOKKEL, {});
  if(poster[id]) return svar({ ok:false, feil:'Denne kvitteringen er allerede lagt inn (' + butikk + ', ' + dato + ')' });
  const laert = await lesJson(env, LAERT_NOKKEL, {});
  const p = { id:id, fra:'foto', konto:'foto', kontoNavn:'Kvittering fra bilde', dato:dato, belop:-sum, tekst:'', motpart:butikk,
    harKvittering: linjer.length > 0, status:'ny', lagtInnAv:epost, lagtInn:new Date().toISOString() };
  const f = foreslaa(p, laert);
  p.kategori = f.kategori; p.kilde = f.kilde;
  kobleKvittering(poster, p);
  poster[id] = p;
  if(linjer.length) await env.FAMILIE_KV.put(kvitteringNokkel(p), JSON.stringify({ id:id, belop:sum, linjer:linjer }));
  await env.FAMILIE_KV.put(POST_NOKKEL, JSON.stringify(poster));
  return svar({ ok:true, post:p });
}
async function lagretKvittering(env, id){
  const poster = await lesJson(env, POST_NOKKEL, {});
  const p = poster[id];
  if(!p || !p.fra) return svar({ ok:false, feil:'Ukjent kvittering' });
  if(p.fra === 'trumf') return trumfKvittering(env, p.trumfId);
  const kv = await lesJson(env, kvitteringNokkel(p), null);
  if(!kv) return svar({ ok:false, feil:'Kvitteringen har ingen varelinjer' });
  return svar(Object.assign({ ok:true }, kv));
}

/* Varelinjer med egen kategori: { <linjenummer>: kategori }. Resten av
   beloepet - varer som foelger kjoepet, pant, avrunding - gaar til
   kjoepets kategori. Gir [{ kategori, belop }] med negativt beloep som posten. */
async function fordelKvittering(env, p, linjeKat, hovedKat){
  const kv = await lesJson(env, kvitteringNokkel(p), null);
  if(!kv || !kv.linjer) return null;
  const sum = {};
  const kategorier = await alleKategorier(env);
  let flyttet = 0;
  for(const i of Object.keys(linjeKat || {})){
    const l = kv.linjer[Number(i)], kat = linjeKat[i];
    if(!l || !kat || kat === hovedKat) continue;
    if(kategorier.indexOf(kat) === -1) return null;
    const b = (Number(l.belop) || 0) + (Number(l.rabatt) || 0);
    sum[kat] = (sum[kat] || 0) + b;
    flyttet += b;
  }
  if(!flyttet) return null;
  const deler = [{ kategori:hovedKat, belop:-(Math.abs(p.belop) - flyttet) }];
  for(const kat of Object.keys(sum)) deler.push({ kategori:kat, belop:-sum[kat] });
  return deler.map(d => ({ kategori:d.kategori, belop:Math.round(d.belop * 100) / 100 }));
}

/* Godkjenner og stryker i én runde. Kategorien som velges, huskes for
   motparten - neste gang foreslaas den samme. */
async function godkjenn(env, kropp, epost){
  const poster = await lesJson(env, POST_NOKKEL, {});
  const laert = await lesJson(env, LAERT_NOKKEL, {});
  const naa = new Date().toISOString();
  const kategorier = await alleKategorier(env);
  const ok = [], strok = [];
  for(const g of [].concat(kropp.godkjenn || [])){
    const p = poster[g && g.id];
    if(!p) return svar({ ok:false, feil:'Ukjent post' });
    if(kategorier.indexOf(g.kategori) === -1) return svar({ ok:false, feil:'Ukjent kategori: ' + g.kategori });
    Object.assign(p, { status:'godkjent', kategori:g.kategori, behandlet:naa, av:epost });
    delete p.deler;
    if(g.linjer && Object.keys(g.linjer).some(i => g.linjer[i] && kategorier.indexOf(g.linjer[i]) === -1)){
      return svar({ ok:false, feil:'Ukjent kategori på en vare' });
    }
    if(p.fra && g.linjer){
      const deler = await fordelKvittering(env, p, g.linjer, g.kategori);
      if(deler) p.deler = deler;
    }
    /* Banktrekket kvitteringen dekker, foelger med - det skal ikke telles. */
    if(p.bankId && poster[p.bankId]) Object.assign(poster[p.bankId], { status:'sammenslatt', behandlet:naa, av:epost });
    const n = motpartNokkel(p);
    if(n) laert[n] = g.kategori;
    ok.push(p.id);
  }
  for(const id of [].concat(kropp.strok || [])){
    const p = poster[id];
    if(!p) return svar({ ok:false, feil:'Ukjent post' });
    Object.assign(p, { status:'stroket', behandlet:naa, av:epost });
    /* Stryker man kvitteringen, er banktrekket ikke lenger dekket - det
       kommer tilbake i innboksen som vanlig post. */
    if(p.bankId && poster[p.bankId]){ delete poster[p.bankId].dekketAv; delete p.bankId; }
    strok.push(id);
  }
  await env.FAMILIE_KV.put(POST_NOKKEL, JSON.stringify(poster));
  await env.FAMILIE_KV.put(LAERT_NOKKEL, JSON.stringify(laert));
  return svar({ ok:true, godkjent:ok, stroket:strok });
}
/* Angre-stripa: legger nettopp behandlede poster tilbake i innboksen.
   Det Neam laerte, blir staaende - det er et forslag, ikke en foering. */
async function angre(env, kropp){
  const poster = await lesJson(env, POST_NOKKEL, {});
  let n = 0;
  for(const id of [].concat(kropp.ider || [])){
    const p = poster[id];
    if(!p || p.status === 'ny') continue;
    /* En automatisk foert post som angres, foeres aldri automatisk igjen. */
    if(p.auto){ p.manuell = true; delete p.auto; }
    p.status = 'ny'; delete p.behandlet; delete p.av; delete p.deler; n++;
    /* Banktrekket som ble slaatt sammen, gaar tilbake til «dekket». Ble
       kvitteringen stroeket, mistet den koblingen; da kobles den paa nytt,
       ellers staar kjoepet dobbelt i innboksen. */
    if(p.bankId && poster[p.bankId] && poster[p.bankId].status === 'sammenslatt'){
      poster[p.bankId].status = 'ny'; delete poster[p.bankId].behandlet; delete poster[p.bankId].av;
    }
    if(p.fra && !p.bankId){ delete p.mulDobbel; kobleKvittering(poster, p); }
  }
  await env.FAMILIE_KV.put(POST_NOKKEL, JSON.stringify(poster));
  return svar({ ok:true, tilbake:n });
}

/* Bankene appen faar velge mellom i Norge, slik Enable Banking selv svarer.
   Fasiten for om en utsteder kan kobles - den offentlige lista paa
   nettsidene deres kan henge etter. Krever ingen oekt. */
async function banker(env){
  const r = await eb(env, 'GET', '/aspsps?country=' + BANK.country);
  if(!r.ok) return svar(r);
  const ut = ((r.data && r.data.aspsps) || []).map(a => ({
    navn: a.name,
    bic: a.bic || '',
    typer: a.psu_types || [],
    samtykkeDager: a.maximum_consent_validity ? Math.floor(a.maximum_consent_validity / 86400) : null,
    beta: !!a.beta
  })).sort((a, b) => a.navn.localeCompare(b.navn, 'nb'));
  return svar({ ok:true, land:BANK.country, antall:ut.length, banker:ut });
}

/* ---------- Trumf ----------
   Trumf-kortet (NorgesGruppen Finans) finnes ikke hos Enable Banking.
   Kvitteringene fra KIWI, MENY, SPAR og Joker hentes derfor fra trumf.no,
   slik github.com/fredrsat/trumf-connector gjoer det: med innloggings-
   cookien fra nettleseren, og ved aa lese dataene som ligger i sida.

   UOFFISIELT OG SKJOERT. Trumfs gamle REST-API ble lagt ned i september
   2026; dette leser innloggede nettsider. Endrer Trumf sida, slutter det
   aa virke. Derfor skilles to feil fra hverandre (planen, «Varsel 1/2»):
     kode 'innlogging' - cookien er utloept eller feil: lim inn ny
     kode 'format'     - innlogget, men dataene ligger ikke der de pleide:
                         koden maa rettes
   Cookien varer rundt et aar ifoelge connectoren. Trumf har bare de
   siste 12 maanedene.

   Cookien er en innlogging og lagres som en: under `auth:bank:`, aldri i
   svar, aldri i logg. */
const TRUMF = 'https://www.trumf.no';
const TRUMF_LISTE = '/trumf-profil/kvitteringer';
const TRUMF_NOKKEL = 'auth:bank:trumf';
const NETTLESER = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml',
  'Accept-Language': 'nb-NO,nb;q=0.9,en;q=0.8'
};

/* Next.js legger dataene i sida som biter av typen
   self.__next_f.push([1,"..."]). Hver bit er en JSON-streng; settes de
   sammen, staar dataene der som vanlig JSON. Finnes ingen slike biter,
   leses sida som den er (connectorens maate, med escapede anfoerselstegn). */
function rscTekst(html){
  const re = /self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g;
  let ut = '', m;
  while((m = re.exec(html))){ try{ ut += JSON.parse(m[1]); }catch(e){} }
  return ut || null;
}
/* Finner verdien etter "noekkel": - et objekt eller en liste - ved aa
   telle klammer utenfor strenger. Gir null hvis noekkelen ikke finnes. */
function jsonEtter(tekst, nokkel, escapet){
  const merke = escapet ? nokkel + '\\":' : '"' + nokkel + '":';
  const i = tekst.indexOf(merke);
  if(i === -1) return null;
  let s = i + merke.length;
  while(s < tekst.length && tekst[s] !== '[' && tekst[s] !== '{') s++;
  let dybde = 0, iStreng = false;
  for(let j = s; j < tekst.length; j++){
    const c = tekst[j];
    if(c === '"'){
      let b = 0, k = j - 1;
      while(k >= 0 && tekst[k] === '\\'){ b++; k--; }
      /* Escapet: \" er en ekte strenggrense, \\\" er et anfoerselstegn inne
         i en streng. Uescapet: " er grense, \" er inne i strengen. */
      if(escapet ? (b % 4 === 1) : (b % 2 === 0)) iStreng = !iStreng;
      continue;
    }
    if(iStreng) continue;
    if(c === '[' || c === '{') dybde++;
    else if(c === ']' || c === '}'){
      dybde--;
      if(dybde === 0){
        let raa = tekst.slice(s, j + 1);
        if(escapet) raa = raa.replace(/\\\\/g, '\u0000').replace(/\\"/g, '"').replace(/\u0000/g, '\\');
        /* Next merker datoer som "$D2026-10-01T..." */
        return JSON.parse(raa.replace(/"\$D/g, '"'));
      }
    }
  }
  return null;
}
function trumfData(html, nokkel){
  const rsc = rscTekst(html);
  if(rsc){ const v = jsonEtter(rsc, nokkel, false); if(v != null) return v; }
  return jsonEtter(html, nokkel, true);
}

async function trumfSide(env, sti){
  const lagret = await lesJson(env, TRUMF_NOKKEL, null);
  if(!lagret || !lagret.cookie) return { ok:false, kode:'innlogging', feil:'Trumf er ikke koblet' };
  const r = await fetch(TRUMF + sti, { headers:Object.assign({ Cookie:lagret.cookie }, NETTLESER), redirect:'follow' });
  const html = await r.text();
  /* En utloept innlogging sender deg til innloggingssida, ofte med 200. */
  let endteStiPaa = '';
  try{ endteStiPaa = new URL(r.url).pathname; }catch(e){}
  if(r.status === 401 || r.status === 403 || /logg-?inn|login|signin|auth\/|innlogging/i.test(endteStiPaa)){
    return { ok:false, kode:'innlogging', feil:'Trumf trenger ny innlogging' };
  }
  if(!r.ok) return { ok:false, kode:'format', feil:'Trumf svarte HTTP ' + r.status };
  return { ok:true, html:html };
}
function trumfFeil(html, hva){
  /* Ingen data: er det fordi vi ikke er innlogget, eller fordi sida er endret? */
  if(/logg inn|logg på|innlogging/i.test(html) && !/kvittering/i.test(html)) return { ok:false, kode:'innlogging', feil:'Trumf trenger ny innlogging' };
  return { ok:false, kode:'format', feil:'Fant ikke ' + hva + ' på trumf.no – sida er trolig endret, og koden må rettes' };
}

async function trumfListe(env, fersk){
  return medBuffer(env, 'trumf:liste', fersk, async () => {
    const s = await trumfSide(env, TRUMF_LISTE);
    if(!s.ok) return s;
    let liste = null;
    try{ liste = trumfData(s.html, 'transactionsData'); }catch(e){ liste = null; }
    if(!Array.isArray(liste)) return trumfFeil(s.html, 'kjøpslista');
    return { ok:true, data:liste.map(t => ({
      id: String(t.batchId || ''),
      tid: String(t.transaksjonsTidspunkt || ''),
      butikk: String(t.beskrivelse || ''),
      belop: Number(t.belop) || 0,
      bonus: Number(t.bonus) || 0,
      harKvittering: t.harKvittering !== false
    })).filter(t => t.id) };
  });
}
async function trumfKvittering(env, id){
  if(!/^[\w.:-]{1,80}$/.test(id)) return svar({ ok:false, feil:'Ugyldig kvitterings-id' });
  /* En kvittering endrer seg ikke; den hentes én gang og ligger. */
  const nokkel = 'auth:bank:buffer:trumf:kv:' + id;
  const lagret = await lesJson(env, nokkel, null);
  if(lagret) return svar(Object.assign({ ok:true }, lagret));
  const s = await trumfSide(env, TRUMF_LISTE + '/' + encodeURIComponent(id));
  if(!s.ok) return svar(s);
  let k = null;
  try{ k = trumfData(s.html, 'purchaseDetails'); }catch(e){ k = null; }
  if(!k || typeof k !== 'object') return svar(trumfFeil(s.html, 'kvitteringen'));
  const ut = {
    id: id,
    tid: String(k.transaksjonsTidspunkt || ''),
    belop: Number(k.belop) || 0,
    bonus: Number(k.bonus) || 0,
    linjer: [].concat(k.varelinjer || []).map(l => ({
      navn: String(l.produktBeskrivelse || ''),
      antall: Number(l.antall) || 1,
      enhet: String(l.enhetsType || ''),
      belop: Number(l.belop) || 0,
      rabatt: [].concat(l.besparelser || []).reduce((s, b) => s + (Number(b.belop) || 0), 0)
    }))
  };
  await env.FAMILIE_KV.put(nokkel, JSON.stringify(ut));
  return svar(Object.assign({ ok:true }, ut));
}
async function trumfStatus(env){
  const lagret = await lesJson(env, TRUMF_NOKKEL, null);
  if(!lagret) return svar({ ok:true, koblet:false });
  const r = await trumfListe(env, false);
  const ut = { ok:true, koblet:true, lagret:lagret.lagret, lagretAv:masker(lagret.av) };
  if(!r.ok) return svar(Object.assign(ut, { virker:false, kode:r.kode, feil:r.feil }));
  const liste = r.data || [];
  return svar(Object.assign(ut, { virker:true, hentet:r.hentet, advarsel:r.advarsel, antall:liste.length,
    nyeste:liste.reduce((m, t) => t.tid > m ? t.tid : m, '') }));
}
async function trumfInnlogging(env, kropp, epost){
  const c = String(kropp.cookie || '').trim();
  /* Det connectoren krever: hele Cookie-headeren, med session-tokenet i. */
  if(!/authjs\.session-token/.test(c) || c.length > 8000) return svar({ ok:false, feil:'Dette ser ikke ut som Cookie-feltet fra trumf.no – det skal inneholde «authjs.session-token».' });
  await env.FAMILIE_KV.put(TRUMF_NOKKEL, JSON.stringify({ cookie:c, lagret:new Date().toISOString(), av:epost }));
  await env.FAMILIE_KV.delete('auth:bank:buffer:trumf:liste');
  return trumfStatus(env);
}

export async function onRequestGet({ request, env }){
  const url = new URL(request.url);
  const sti = url.pathname.replace(/\/+$/, '');

  /* Diagnose foer alt annet: den skal virke ogsaa naar resten ikke gjoer det.
     Ja/nei per kilde, aldri innholdet, e-posten maskert. */
  if(url.searchParams.get('hvem') === '1'){
    const id = await verifisertEpost(request, env);
    return svar({
      ok: true,
      jwtHeader: !!request.headers.get('Cf-Access-Jwt-Assertion'),
      cookie: !!cookieAv(request, 'CF_Authorization'),
      accessTeam: !!env.ACCESS_TEAM,
      noekkel: !!env.ENABLE_BANKING_KEY,
      kv: !!env.FAMILIE_KV,
      verifisert: !!id.epost,
      grunn: id.grunn || undefined,
      epost: masker(id.epost),
      voksen: TILGANG.indexOf(id.epost) !== -1
    });
  }

  if(!env.FAMILIE_KV) return svar({ ok:false, feil:'KV ikke bundet' });

  /* «Hent naa» - vekkeren. Kjoekkendashbordet kaller den hver sjette time
     fordi skjermen staar paa hele dagen (Magne, 29. oktober). Den henter
     det innboksen henter, og svarer INGENTING om innholdet: ingen poster,
     ingen saldo, ingen antall. Derfor kan kitchen@ faa bruke den uten aa
     faa se oekonomien. Bankens grense holdes av bufferen paa seks timer. */
  if(url.searchParams.get('hva') === 'hent'){
    const id = await verifisertEpost(request, env);
    if(!id.epost || HENT_TILGANG.indexOf(id.epost) === -1) return svar({ ok:false, feil:'Ingen tilgang' });
    const okt = await lesOekt(env);
    if(okt){
      try{ await innboks(env, okt, false); }
      catch(e){ return svar({ ok:false, feil:'Hentingen feilet' }); }
    }
    await env.FAMILIE_KV.put(SIST_HENTET_NOKKEL, JSON.stringify({ tid:Date.now() }));
    return svar({ ok:true });
  }

  const v = await voksen(request, env);
  const iNettleser = sti.endsWith('/start') || sti.endsWith('/tilbake');
  if(!v.ok) return iNettleser ? side('Ingen tilgang', v.feil) : svar(v);

  try{
    if(sti.endsWith('/start')) return await start(env);
    if(sti.endsWith('/tilbake')) return await tilbake(env, url, v.epost);

    const hva = url.searchParams.get('hva') || 'status';
    const okt = await lesOekt(env);
    if(hva === 'status'){
      if(!okt) return svar({ ok:true, koblet:false });
      const igjen = okt.gyldigTil ? Math.floor((Date.parse(okt.gyldigTil) - Date.now()) / 86400000) : null;
      return svar({ ok:true, koblet:true, bank:BANK.name, gyldigTil:okt.gyldigTil, dagerIgjen:igjen,
        kontoer:okt.kontoer.length, godkjentAv:masker(okt.godkjentAv), laget:okt.laget });
    }
    if(hva === 'banker') return await banker(env);
    if(hva === 'varsler') return await varsler(env, okt);
    /* Trumf trenger ikke banken - den har sin egen innlogging. */
    if(hva === 'trumf') return await trumfStatus(env);
    if(hva === 'trumf-kjop'){
      const r = await trumfListe(env, url.searchParams.get('fersk') === '1');
      if(!r.ok) return svar(r);
      return svar({ ok:true, hentet:r.hentet, fraBuffer:r.fraBuffer, advarsel:r.advarsel, kjop:r.data });
    }
    if(hva === 'trumf-kvittering') return await trumfKvittering(env, url.searchParams.get('id') || '');
    if(hva === 'kvittering') return await lagretKvittering(env, url.searchParams.get('id') || '');
    if(hva === 'budsjett') return await budsjett(env);
    if(hva === 'regnskap') return await regnskap(env, url.searchParams.get('mnd') || '');
    if(hva === 'regnskap-aar') return await regnskapAar(env);
    if(hva === 'formue') return await formue(env);
    if(!okt) return svar({ ok:false, feil:'Banken er ikke koblet. Åpne /api/bank/start.' });
    const fersk = url.searchParams.get('fersk') === '1';
    if(hva === 'kontoer') return await kontoer(env, okt, fersk);
    if(hva === 'transaksjoner') return await transaksjoner(env, okt, url.searchParams.get('konto') || '', url.searchParams.get('fra'), fersk);
    if(hva === 'innboks') return await innboks(env, okt, fersk);
    return svar({ ok:false, feil:'Ukjent hva: ' + hva });
  }catch(e){
    /* Meldingen, aldri stakken - den kan baere biter av noekkelen. */
    return iNettleser ? side('Noe gikk galt', String(e && e.message || e)) : svar({ ok:false, feil:String(e && e.message || e) });
  }
}

/* POST /api/bank
     { hva:'roller', roller:{ <uid>: rolle } }
       Fletter inn i det som er lagret; en tom rolle fjerner kontoen fra lista.
       Bare kontoer i oekta og roller i ROLLER godtas.
     { hva:'godkjenn', godkjenn:[{ id, kategori }], strok:[id] }
     { hva:'angre', ider:[id] } */
export async function onRequestPost({ request, env }){
  if(!env.FAMILIE_KV) return svar({ ok:false, feil:'KV ikke bundet' });
  const v = await voksen(request, env);
  if(!v.ok) return svar(v);
  let kropp = null;
  try{ kropp = await request.json(); }catch(e){ return svar({ ok:false, feil:'Ugyldig JSON' }); }
  if(kropp && kropp.hva === 'godkjenn') return await godkjenn(env, kropp, v.epost);
  if(kropp && kropp.hva === 'angre') return await angre(env, kropp);
  if(kropp && kropp.hva === 'trumf-innlogging') return await trumfInnlogging(env, kropp, v.epost);
  if(kropp && kropp.hva === 'kvittering-ny') return await nyKvittering(env, kropp, v.epost);
  if(kropp && kropp.hva === 'budsjett') return await lagreBudsjett(env, kropp, v.epost);
  if(kropp && kropp.hva === 'formue') return await lagreFormue(env, kropp, v.epost);
  if(kropp && kropp.hva === 'forslag') return await lagreForslag(env, kropp);
  if(kropp && kropp.hva === 'kontonavn') return await lagreKontonavn(env, kropp);
  if(kropp && kropp.hva === 'kategori-ny') return await nyeKategorier(env, kropp);
  if(kropp && kropp.hva === 'kategori-slett') return await slettKategori(env, kropp);
  if(kropp && kropp.hva === 'trumf-koble-fra'){
    await env.FAMILIE_KV.delete(TRUMF_NOKKEL);
    await env.FAMILIE_KV.delete('auth:bank:buffer:trumf:liste');
    return svar({ ok:true, koblet:false });
  }
  if(!kropp || kropp.hva !== 'roller' || typeof kropp.roller !== 'object') return svar({ ok:false, feil:'Ukjent hva' });
  const okt = await lesOekt(env);
  if(!okt) return svar({ ok:false, feil:'Banken er ikke koblet' });
  const kjente = okt.kontoer.map(k => k.uid);
  const roller = await lesRoller(env);
  for(const uid of Object.keys(kropp.roller)){
    if(kjente.indexOf(uid) === -1) return svar({ ok:false, feil:'Ukjent konto' });
    const r = String(kropp.roller[uid] || '');
    if(r && ROLLER.indexOf(r) === -1) return svar({ ok:false, feil:'Ukjent rolle: ' + r });
    if(r) roller[uid] = r; else delete roller[uid];
  }
  await env.FAMILIE_KV.put(ROLLE_NOKKEL, JSON.stringify(roller));
  return svar({ ok:true, roller:roller });
}

export async function onRequest(){
  return svar({ ok:false, feil:'Bare GET og POST' });
}
