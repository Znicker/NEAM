/* ============================================================
   Neam - bank, serversiden (Enable Banking)

   Ligger i repoet som:  functions/api/bank/[[sti]].js
   Gir endepunktene:
     GET /api/bank?hva=status          - er banken koblet, og til naar
     GET /api/bank?hva=kontoer         - kontoene med saldo
     GET /api/bank?hva=transaksjoner&konto=<uid>[&fra=AAAA-MM-DD]
     GET /api/bank?hva=banker          - bankene Enable Banking tilbyr i Norge
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

/* Rollene en konto kan ha. Rollen avgjoer hvor transaksjonene havner:
   felles -> husholdningsbudsjettet, magne/nina -> den personlige sida,
   emma/andrea -> barnas sider, sparing -> formuen, ignorer -> ingen steder. */
const ROLLER = ['felles', 'magne', 'nina', 'sparing', 'emma', 'andrea', 'ignorer'];
const ROLLE_NOKKEL = 'auth:bank:roller';

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
  const ut = [];
  let eldst = Date.now(), advarsel = '';
  for(const k of okt.kontoer){
    const r = await medBuffer(env, 'saldo:' + k.uid, fersk, () => eb(env, 'GET', '/accounts/' + encodeURIComponent(k.uid) + '/balances'));
    if(!r.ok){ ut.push(Object.assign({}, k, { rolle:roller[k.uid] || '', feil:r.feil })); continue; }
    if(r.advarsel) advarsel = r.advarsel;
    eldst = Math.min(eldst, r.hentet);
    const saldoer = (r.data && r.data.balances) || [];
    /* Disponibelt foran bokfoert: det er det man kan bruke. */
    const velg = ['ITAV', 'CLAV', 'ITBD', 'CLBD', 'XPCD'];
    saldoer.sort((a, b) => velg.indexOf(a.balance_type) - velg.indexOf(b.balance_type));
    const s = saldoer[0];
    ut.push(Object.assign({}, k, {
      rolle: roller[k.uid] || '',
      saldo: s ? Number(s.balance_amount.amount) : null,
      saldoType: s ? s.balance_type : '',
      hentet: r.hentet
    }));
  }
  return svar({ ok:true, hentet:eldst, advarsel:advarsel || undefined, kontoer:ut });
}

async function transaksjoner(env, okt, uid, fra, fersk){
  if(!okt.kontoer.some(k => k.uid === uid)) return svar({ ok:false, feil:'Ukjent konto' });
  const fraDato = /^\d{4}-\d{2}-\d{2}$/.test(fra || '') ? fra
    : new Date(Date.now() - 31 * 24 * 3600 * 1000).toISOString().slice(0, 10);
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
  if(!r.ok) return svar(r);
  const ut = (r.data || []).map(t => ({
    id: t.entry_reference || t.transaction_id || '',
    dato: t.booking_date || t.value_date || t.transaction_date || '',
    belop: Number(t.transaction_amount && t.transaction_amount.amount) * (t.credit_debit_indicator === 'DBIT' ? -1 : 1),
    valuta: t.transaction_amount && t.transaction_amount.currency,
    tekst: [].concat(t.remittance_information || []).join(' ').trim(),
    motpart: (t.creditor && t.creditor.name) || (t.debtor && t.debtor.name) || '',
    status: t.status || ''
  }));
  return svar({ ok:true, hentet:r.hentet, fraBuffer:r.fraBuffer, advarsel:r.advarsel, fra:fraDato, transaksjoner:ut });
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
    if(!okt) return svar({ ok:false, feil:'Banken er ikke koblet. Åpne /api/bank/start.' });
    const fersk = url.searchParams.get('fersk') === '1';
    if(hva === 'kontoer') return await kontoer(env, okt, fersk);
    if(hva === 'transaksjoner') return await transaksjoner(env, okt, url.searchParams.get('konto') || '', url.searchParams.get('fra'), fersk);
    return svar({ ok:false, feil:'Ukjent hva: ' + hva });
  }catch(e){
    /* Meldingen, aldri stakken - den kan baere biter av noekkelen. */
    return iNettleser ? side('Noe gikk galt', String(e && e.message || e)) : svar({ ok:false, feil:String(e && e.message || e) });
  }
}

/* POST /api/bank  { hva:'roller', roller:{ <uid>: rolle } }
   Fletter inn i det som er lagret; en tom rolle fjerner kontoen fra lista.
   Bare kontoer i oekta og roller i ROLLER godtas. */
export async function onRequestPost({ request, env }){
  if(!env.FAMILIE_KV) return svar({ ok:false, feil:'KV ikke bundet' });
  const v = await voksen(request, env);
  if(!v.ok) return svar(v);
  let kropp = null;
  try{ kropp = await request.json(); }catch(e){ return svar({ ok:false, feil:'Ugyldig JSON' }); }
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
