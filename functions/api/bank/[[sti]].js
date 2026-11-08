/* ============================================================
   Neam - bank, serversiden (Enable Banking)

   Ligger i repoet som:  functions/api/bank/[[sti]].js
   Gir endepunktene:
     GET /api/bank?hva=status          - er banken koblet, og til naar
     GET /api/bank?hva=kontoer         - kontoene med saldo
     GET /api/bank?hva=transaksjoner&konto=<uid>[&fra=AAAA-MM-DD]
     GET /api/bank?hva=banker          - bankene Enable Banking tilbyr i Norge
     GET /api/bank?hva=innboks         - nye transaksjoner fra felleskontoene, med forslag
     GET /api/bank?hva=alle-poster     - alle transaksjonene fra nullpunktet (kontoutskriften)
     POST /api/bank {hva:'godkjenn'}   - godkjenner og stryker poster
     POST /api/bank {hva:'angre'}      - legger poster tilbake i innboksen
     GET /api/bank?hva=trumf           - er Trumf koblet, og virker innloggingen
     GET /api/bank?hva=trumf-kjop      - kjoepene fra trumf.no (siste 12 mnd)
     GET /api/bank?hva=trumf-kvittering&id=<batchId> - varelinjene
     POST /api/bank {hva:'trumf-innlogging', cookie} / {hva:'trumf-koble-fra'}
     POST /api/bank {hva:'kvittering-ny', kvittering, forHand} - kvittering lest fra bilde/PDF, eller en foering lagt inn for haand
     GET /api/bank?hva=kvittering&id=<postId>         - varelinjene til en kvitteringspost
     GET /api/bank?hva=kvittering-fil&id=<postId>     - selve bildet eller PDF-en
     GET /api/bank?hva=budsjett / POST {hva:'budsjett', standard} - standardbudsjettet
     POST /api/bank {hva:'budsjett', mnd, maaned} / {hva:'budsjett', mnd, tilbake:true} - én maaneds budsjett
     GET /api/bank?hva=regnskap&mnd=AAAA-MM            - godkjente poster summert per kategori
     GET /api/bank?hva=foringer&mnd=AAAA-MM&kategori=<k>[&eksakt=1] - foeringene bak ett tall
     POST /api/bank {hva:'kategori-ny', nye:[{forelder, navn}]} / {hva:'kategori-slett', kategori} - egne poster
     POST /api/bank {hva:'kategori-navn', fra, navn} - nytt navn paa en egen post eller linje
     POST /api/bank {hva:'koble-alle', utfor} - kvitteringer og transaksjoner som hoerer sammen, i ettertid
     POST /api/bank {hva:'faktura-innboks', id} - en faktura som venter, blir en post i innboksen
     POST /api/bank {hva:'faktura-kategori', id, kategori} - kategorien paa en faktura som venter
     GET /api/bank?hva=post&id= - alt om én foering (vinduet i Regnskap)
     POST /api/bank {hva:'post-endre', id, motpart?, belop?, notat?, merke?, dato?} - endre en foering
     POST /api/bank {hva:'post-vedlegg', id, type, data, navn} / {hva:'post-vedlegg-slett', id, n} - vedleggene
     GET /api/bank?hva=regningskonto / POST {hva:'regningskonto', uid} - bufferen regningskontoen trenger
     POST /api/bank {hva:'kategori-merke', kategori, merke} - merket paa en post (forsikring, laan …); tomt fjerner
     POST /api/bank {hva:'budsjett-perioder', kategori, maaneder} - hvilke maaneder posten kommer (tom = hver maaned)
     POST /api/bank {hva:'merke-ny', navn, fast, forelder} / {hva:'merke-endre', id, navn, fast, forelder} / {hva:'merke-slett', id} - merkene selv
     GET /api/bank?hva=varsler          - det som trenger noen (kortet paa forsiden)
     GET /api/bank?hva=laert / POST {hva:'laert', motpart, kategori} - «Neam husker» (tom kategori glemmer)
     GET /api/bank/dropbox-start / dropbox-tilbake - kobler Dropbox (appmappa) med OAuth
     GET /api/bank?hva=dropbox          - er Dropbox koblet
     GET /api/bank?hva=dropbox-filer    - kvitteringsfilene som ligger i appmappa
     GET /api/bank?hva=dropbox-fil&id=<id> - selve fila (bilde eller PDF)
     POST {hva:'dropbox-ferdig', id, navn, mappe} / {hva:'dropbox-koble-fra'}
     POST {hva:'dropbox-lagre', navn, data} - en PDF (base64) til «Importert»
     GET /api/bank?hva=regnskap-aar     - godkjente poster per maaned og kategori, hele perioden,
                                          og fakturaene som venter (forfaller)
     GET /api/bank?hva=formue / POST {hva:'formue', verdier, gjeld, maal} - det banken ikke gir
     POST /api/bank {hva:'forslag', forslag:[{id, kategori, sikker}]}    - Neams kategoriforslag
     POST /api/bank {hva:'kontonavn', uid, navn}                         - eget navn paa en konto (tomt fjerner)
     GET /api/bank?hva=hent             - vekker hentingen; ogsaa felles@, svarer ingenting om innholdet
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
     DROPBOX_APP_KEY, DROPBOX_APP_SECRET - Dropbox-appen med tilgang til egen
                           mappe (hemmeligheter; se Dropbox-delen)
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
     auth:bank:kv:<postId>     - varelinjene fra en kvittering lest fra bilde
     auth:bank:fil:<postId>    - selve bildet eller PDF-en, { type, data } i base64 (fra 6. november 2026)
     auth:bank:sist-hentet     - naar vekkeren sist hentet
     auth:bank:trumf-feil      - siste Trumf-feil (slettes naar hentingen virker igjen)
     auth:bank:dropbox         - Dropbox: refresh-tokenet til appmappa, og naar den sist ble sjekket
     auth:bank:regningskonto   - hvilken konto som er regningskontoen ({ uid })
     auth:bank:formue          - verdier, gjeld og familiemaal, fylt inn for haand
     auth:bank:kontonavn       - { <konto-uid>: eget navn } - DNB sender ikke nettbanknavnene
     auth:bank:kontonr         - { <konto-uid>: '1234.56.78901' } - hentet én gang fra /details
     auth:bank:budsjett        - { standard:{ kategori: kr }, maaneder:{ 'AAAA-MM':{ kategori: kr } } } - ALDRI i koden,
                                 repoet er offentlig
   `/api/data` slipper familien til alt under `fh:`. Kontoer og
   transaksjoner skal ikke kunne leses ut derfra.

   HVOR OFTE BANKEN SPOERRES
   Mange banker tillater fire hentinger i doegnet uten at brukeren er
   til stede. Svar fra banken lagres derfor i seks timer, og en ny
   henting skjer foerst naar noen ber om det etter det. `fersk=1`
   tvinger en ny henting naar noen sitter med sida (PSU-headerne, se
   psuAv) - for Trumf alltid, den koster ingenting. Svarer banken nei,
   faar man bufferen tilbake med beskjed om det.
   ============================================================ */

const API = 'https://api.enablebanking.com';
const APP_ID = '429ce2c9-55e4-4183-a695-d9df8763a260';   // ikke hemmelig - staar i kontrollpanelet
const BANK = { name:'DNB', country:'NO' };
const TILBAKE = 'https://neam.no/api/bank/tilbake';
/* sys@, Magne og Nina - Neam skal kunne bruke økonomien fra alle sidene
   for dem (Magne, 6. november 2026). Aldri barna, og felles@ bare med
   Magnes eller Ninas pinkode (se PIN_TILGANG under). */
const TILGANG = ['sys@neam.no', 'magne@neam.no', 'nina@neam.no'];
/* Kan vekke hentingen (?hva=hent), men faar ikke se noe. Se der. */
/* Fellesenhetene - felles@ het kitchen@ til 8. november 2026. */
const FELLES = ['felles@neam.no', 'kitchen@neam.no'];
const HENT_TILGANG = TILGANG.concat(FELLES);
/* Paa fellesenheten slipper Magne og Nina inn med pinkoden sin (Magne,
   8. november 2026: «Det er kun nina og magne som kan komme inn på
   økonomi med sin pin»). Oekta lages av /api/pin ved riktig kode og
   ligger i KV under pin:okt:<id>, med id-en i kaka neam_pin. Regelen
   for naar den er ute, er den samme som i pin.js (oktGyldig der). */
const PIN_TILGANG = { magne:'magne@neam.no', nina:'nina@neam.no' };
const PIN_OKT_HVILE_MS = 4 * 60 * 1000;
async function pinPerson(request, env){
  const id = cookieAv(request, 'neam_pin');
  if(!/^[0-9a-f]{48}$/.test(id) || !env.FAMILIE_KV) return '';
  const o = await lesJson(env, 'pin:okt:' + id, null);
  if(!o) return '';
  const naa = Date.now();
  const gyldig = o.til ? naa < o.til : naa - (o.sist || 0) <= PIN_OKT_HVILE_MS;
  return gyldig ? (PIN_TILGANG[o.hvem] || '') : '';
}
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
const KONTONR_NOKKEL = 'auth:bank:kontonr';

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
  if(TILGANG.indexOf(id.epost) === -1){
    /* Fellesenheten med Magnes eller Ninas kode: de er den som spoer. */
    if(FELLES.indexOf(id.epost) !== -1){
      const p = await pinPerson(request, env);
      if(p) return { ok:true, epost:p };
    }
    return { ok:false, feil:'Bankdata er ikke åpnet for denne kontoen' };
  }
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
async function eb(env, metode, sti, kropp, psu){
  const r = await fetch(API + sti, {
    method: metode,
    headers: Object.assign({ 'Authorization':'Bearer ' + await appJwt(env) },
      kropp ? { 'Content-Type':'application/json' } : {}, psu || {}),
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

/* Naar noen sitter med sida. Bankens grense paa fire hentinger i doegnet
   gjelder bare naar brukeren IKKE er til stede (PSD2); med PSU-headerne
   vet banken at hun er det, og sida kan hente ferskt hver gang den
   aapnes. Vekkeren sender dem ikke - den holder seg til bufferen. Bare
   IPv4: noen banker taaler ikke IPv6, og da blir det bufferen som foer. */
function psuAv(request){
  const ip = request.headers.get('CF-Connecting-IP') || '';
  if(!/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) return null;
  const h = { 'Psu-Ip-Address':ip, 'Psu-User-Agent':(request.headers.get('User-Agent') || '').slice(0, 300) };
  for(const [fra, til] of [['Accept', 'Psu-Accept'], ['Accept-Language', 'Psu-Accept-language'], ['Accept-Encoding', 'Psu-Accept-Encoding'], ['Referer', 'Psu-Referer']]){
    const v = request.headers.get(fra);
    if(v) h[til] = v.slice(0, 300);
  }
  return h;
}
/* Gjoer fn for hvert element, n om gangen, og gir svarene i samme rekkefoelge. */
async function iBolker(liste, n, fn){
  const ut = new Array(liste.length);
  let neste = 0;
  await Promise.all(Array.from({ length:Math.min(n, liste.length) }, async () => {
    while(neste < liste.length){ const i = neste++; ut[i] = await fn(liste[i], i); }
  }));
  return ut;
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
    /* Feilen huskes i bufferen til neste vellykte henting, saa
       kildeoversikten paa Status kan vise den. */
    await env.FAMILIE_KV.put(nokkel, JSON.stringify(Object.assign({}, gammel, { feil:ny.feil, feilTid:Date.now() })));
    if(gammel && gammel.hentet) return { ok:true, fraBuffer:true, advarsel:ny.feil, hentet:gammel.hentet, data:gammel.data };
    return ny;
  }
  const lagre = { hentet:Date.now(), data:ny.data };
  await env.FAMILIE_KV.put(nokkel, JSON.stringify(lagre));
  return Object.assign({ ok:true, fraBuffer:false }, lagre);
}

/* Kontonummeret: de fire siste sifrene (slutt) som foer, og fra 6. november
   2026 hele nummeret (kontonr), fordi Magne vil se det naar han velger konto
   paa Oekonomi-sida. Sida er bare for TILGANG, og Neam faar det ikke -
   les_okonomi_kontoer i felles-lesalt.js tar det ikke med. */
function kontoNr(iban){
  const s = String(iban || '').replace(/\s/g, '');
  if(/^NO\d{13}$/.test(s)){ const b = s.slice(4); return b.slice(0, 4) + '.' + b.slice(4, 6) + '.' + b.slice(6); }
  return s;
}
function kontoUt(k){
  const iban = (k.account_id && k.account_id.iban) || '';
  return {
    kontonr: kontoNr(iban),
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

async function kontoer(env, okt, fersk, psu){
  const roller = await lesRoller(env);
  const navn = await lesJson(env, KONTONAVN_NOKKEL, {});
  const ut = [];
  let eldst = Date.now(), advarsel = '';
  /* Fersk bare med noen til stede (psuAv). Fire kontoer om gangen, saa
     sida ikke venter paa 21 hentinger etter tur hver gang den aapnes. */
  const svarene = await iBolker(okt.kontoer, 4, k => medBuffer(env, 'saldo:' + k.uid, fersk && !!psu,
    () => eb(env, 'GET', '/accounts/' + encodeURIComponent(k.uid) + '/balances', null, psu)));
  /* Hele kontonummeret. Kontoene lagres naar DNB kobles, og de som ble
     koblet foer 6. november 2026, har bare de fire siste sifrene. Nummeret
     hentes da én gang per konto fra /details og lagres for godt - bare med
     noen til stede (psu), saa kjoekkenskjermens vekker ikke bruker av
     bankens kvote paa fire hentinger i doegnet. */
  const nr = await lesJson(env, KONTONR_NOKKEL, {});
  const utenNr = okt.kontoer.filter(k => !k.kontonr && !nr[k.uid]);
  if(utenNr.length && psu){
    const det = await iBolker(utenNr, 4, k => eb(env, 'GET', '/accounts/' + encodeURIComponent(k.uid) + '/details', null, psu));
    let nye = 0;
    utenNr.forEach((k, i) => {
      const iban = det[i] && det[i].ok && det[i].data && det[i].data.account_id && det[i].data.account_id.iban;
      if(iban){ nr[k.uid] = kontoNr(iban); nye++; }
    });
    if(nye) await env.FAMILIE_KV.put(KONTONR_NOKKEL, JSON.stringify(nr));
  }
  for(const [i, k] of okt.kontoer.entries()){
    const r = svarene[i];
    if(!r.ok){ ut.push(Object.assign({}, k, { navn:navn[k.uid] || k.navn, bankNavn:k.navn, kontonr:k.kontonr || nr[k.uid] || '', rolle:roller[k.uid] || '', feil:r.feil })); continue; }
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
      kontonr: k.kontonr || nr[k.uid] || '',
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
async function hentTransaksjoner(env, uid, fraDato, fersk, psu){
  const r = await medBuffer(env, 'trans:' + uid + ':' + fraDato, fersk && !!psu, async () => {
    /* Banken deler lange lister i sider; continuation_key peker paa neste. */
    let alle = [], neste = '', runder = 0;
    do{
      const sti = '/accounts/' + encodeURIComponent(uid) + '/transactions?date_from=' + fraDato
        + (neste ? '&continuation_key=' + encodeURIComponent(neste) : '');
      const s = await eb(env, 'GET', sti, null, psu);
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

async function transaksjoner(env, okt, uid, fra, fersk, psu){
  if(!okt.kontoer.some(k => k.uid === uid)) return svar({ ok:false, feil:'Ukjent konto' });
  const fraDato = /^\d{4}-\d{2}-\d{2}$/.test(fra || '') ? fra
    : new Date(Date.now() - 31 * 24 * 3600 * 1000).toISOString().slice(0, 10);
  const r = await hentTransaksjoner(env, uid, fraDato, fersk, psu);
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
/* Faste poster med nytt navn: { 'Bolig · Strøm': 'Bolig · Elektrisitet' }.
   De faste staar i koden; navnet Magne har gitt dem, ligger i KV (6. november
   2026: «Jeg må kunne endre navn på postene i budsjettet»). */
const OMDOPT_NOKKEL = 'auth:bank:kategori-omdopt';
async function lesOmdopt(env){ return await lesJson(env, OMDOPT_NOKKEL, {}); }
function flett(egne, omdopt){
  omdopt = omdopt || {};
  const ut = KATEGORIER.map(k => omdopt[k] || k);
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
/* Merker paa tvers av gruppene (Magne, 6. november 2026: «vi har
   forsikringer på tvers av budsjettkategoriene»). Én post eller linje har
   hoeyst ett merke; en linje uten eget merke arver postens. Laanemerkene
   er de samme typene som gjelden i formuen (LAN_TYPER). */
const MERKE_NOKKEL = 'auth:bank:kategori-merker';
/* Merkene selv: { id, navn, fast }. «fast» sier om utgiften er fast - alt
   uten et fast merke regnes som variabelt, saa fast + variabelt er alle
   utgiftene (Magne, 7. november 2026). Lista er standarden til noen endrer
   den; da ligger hele lista i KV, og egne merker kan legges til. Barnehage
   og SFO er tatt ut («ungene er for gamle for det»). */
const MERKELISTE_NOKKEL = 'auth:bank:merke-liste';
/* Merker og undermerker (Magne, 7. november 2026: «Lån - studielån,
   Abonnement - telefon …»): et undermerke har `forelder`, hoeyst to ledd.
   Om utgiften er fast, staar paa hovedmerket og gjelder undermerkene. */
const STANDARD_MERKER = [
  { id:'forsikring', navn:'Forsikring', fast:true },
  { id:'lan', navn:'Lån', fast:true },
  { id:'lan-bolig', navn:'Boliglån', forelder:'lan' }, { id:'lan-bil', navn:'Billån', forelder:'lan' }, { id:'lan-baat', navn:'Båtlån', forelder:'lan' },
  { id:'lan-studie', navn:'Studielån', forelder:'lan' }, { id:'lan-forbruk', navn:'Forbrukslån', forelder:'lan' }, { id:'lan-annet', navn:'Annet lån', forelder:'lan' },
  { id:'abonnement', navn:'Abonnement', fast:true }, { id:'energi', navn:'Strøm og energi', fast:true },
  { id:'fast-annet', navn:'Annen fast utgift', fast:true }
];
async function lesMerker(env){ return await lesJson(env, MERKE_NOKKEL, {}); }
async function lesMerkeliste(env){
  const lagret = await lesJson(env, MERKELISTE_NOKKEL, null);
  if(!lagret) return STANDARD_MERKER.map(m => Object.assign({}, m));
  /* En liste lagret foer undermerkene: laanene legges under «Lån». */
  if(!lagret.some(m => m.forelder) && lagret.some(m => /^lan-/.test(m.id)) && !lagret.some(m => m.id === 'lan')){
    const i = lagret.findIndex(m => /^lan-/.test(m.id));
    lagret.splice(i, 0, { id:'lan', navn:'Lån', fast:true });
    lagret.forEach(m => { if(/^lan-/.test(m.id)){ m.forelder = 'lan'; delete m.fast; } });
  }
  return lagret;
}
async function endreMerkeliste(env, kropp){
  const liste = (await lesMerkeliste(env)).map(m => Object.assign({}, m));
  const navn = String(kropp.navn == null ? '' : kropp.navn).replace(/\s+/g, ' ').trim().slice(0, 40);
  const finnes = n => liste.some(m => m.navn.toLowerCase() === n.toLowerCase());
  let id = String(kropp.id || '');
  /* Forelderen maa vaere et hovedmerke (uten egen forelder): to ledd. */
  const forelderOk = (f, selv) => {
    if(!f) return '';
    const fm = liste.filter(x => x.id === f)[0];
    if(!fm) return 'Ukjent hovedmerke';
    if(fm.forelder) return fm.navn + ' er selv et undermerke';
    if(selv && f === selv) return 'Et merke kan ikke ligge under seg selv';
    if(selv && liste.some(x => x.forelder === selv)) return 'Merket har undermerker og kan ikke selv bli et undermerke';
    return '';
  };
  if(kropp.hva === 'merke-ny'){
    if(!navn) return svar({ ok:false, feil:'Merket mangler navn' });
    if(finnes(navn)) return svar({ ok:false, feil:'Det finnes alt et merke som heter ' + navn });
    if(liste.length >= 80) return svar({ ok:false, feil:'For mange merker' });
    const f = String(kropp.forelder || ''), ff = forelderOk(f);
    if(ff) return svar({ ok:false, feil:ff });
    id = 'm-' + b64url(crypto.getRandomValues(new Uint8Array(6)));
    const ny = { id:id, navn:navn };
    if(f) ny.forelder = f; else ny.fast = !!kropp.fast;
    /* Undermerket legges etter de andre under samme hovedmerke. */
    let i = -1;
    if(f) liste.forEach((x, j) => { if(x.id === f || x.forelder === f) i = j; });
    if(i === -1) liste.push(ny); else liste.splice(i + 1, 0, ny);
  } else {
    const m = liste.filter(x => x.id === id)[0];
    if(!m) return svar({ ok:false, feil:'Ukjent merke' });
    if(kropp.hva === 'merke-slett'){
      const under = liste.filter(x => x.forelder === id);
      if(under.length) return svar({ ok:false, feil:m.navn + ' har undermerker (' + under.map(x => x.navn).join(', ') + ') – slett eller flytt dem først' });
      liste.splice(liste.indexOf(m), 1);
      /* Postene som hadde merket, mister det. */
      const merker = await lesMerker(env);
      let endret = false;
      for(const k of Object.keys(merker)) if(merker[k] === id){ delete merker[k]; endret = true; }
      if(endret) await env.FAMILIE_KV.put(MERKE_NOKKEL, JSON.stringify(merker));
    } else {
      if(kropp.navn != null){
        if(!navn) return svar({ ok:false, feil:'Merket mangler navn' });
        if(navn.toLowerCase() !== m.navn.toLowerCase() && finnes(navn)) return svar({ ok:false, feil:'Det finnes alt et merke som heter ' + navn });
        m.navn = navn;
      }
      if(kropp.forelder != null){
        const f = String(kropp.forelder || ''), ff = forelderOk(f, id);
        if(ff) return svar({ ok:false, feil:ff });
        if(f){
          m.forelder = f; delete m.fast;
          /* Flytt det til de andre under samme hovedmerke. */
          liste.splice(liste.indexOf(m), 1);
          let i = -1; liste.forEach((x, j) => { if(x.id === f || x.forelder === f) i = j; });
          liste.splice(i + 1, 0, m);
        } else if(m.forelder){
          const gammel = liste.filter(x => x.id === m.forelder)[0];
          delete m.forelder; m.fast = gammel ? !!gammel.fast : false;
        }
      }
      if(kropp.fast != null && !m.forelder) m.fast = !!kropp.fast;
    }
  }
  await env.FAMILIE_KV.put(MERKELISTE_NOKKEL, JSON.stringify(liste));
  return svar({ ok:true, id:id, merkeliste:liste, merker:await lesMerker(env) });
}
async function settMerke(env, kropp){
  const k = String(kropp.kategori || ''), m = String(kropp.merke || '');
  if((await budsjettKategorier(env)).indexOf(k) === -1 || k.split(' · ').length < 2) return svar({ ok:false, feil:'Ukjent post: ' + k });
  if(m && !(await lesMerkeliste(env)).some(x => x.id === m)) return svar({ ok:false, feil:'Ukjent merke: ' + m });
  const merker = await lesMerker(env);
  if(m) merker[k] = m; else delete merker[k];
  await env.FAMILIE_KV.put(MERKE_NOKKEL, JSON.stringify(merker));
  return svar({ ok:true, merker:merker });
}
async function alleKategorier(env){ return flett(await lesEgne(env), await lesOmdopt(env)); }
async function budsjettKategorier(env){ return (await alleKategorier(env)).filter(k => k.indexOf('Utenfor budsjett') !== 0); }

/* Nye poster: { forelder, navn }. Forelderen er en gruppe (gir en ny post)
   eller en post (gir en linje). Utenfor budsjett tar ikke imot nye. */
async function nyeKategorier(env, kropp){
  const egne = await lesEgne(env), omdopt = await lesOmdopt(env);
  const grupper = KATEGORIER.map(k => k.split(' · ')[0]).filter(g => g !== 'Utenfor budsjett');
  const nye = [];
  for(const n of [].concat(kropp.nye || []).slice(0, 200)){
    const navn = String(n && n.navn || '').replace(/·/g, '').replace(/\s+/g, ' ').trim().slice(0, 40);
    const forelder = String(n && n.forelder || '');
    if(!navn) return svar({ ok:false, feil:'Posten mangler navn' });
    const alle = flett(egne, omdopt);
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
  return svar({ ok:true, nye:nye, kategorier:flett(egne, omdopt).filter(k => k.indexOf('Utenfor budsjett') !== 0), egne:egne });
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
  const merker = await lesMerker(env);
  if(merker[k]){ delete merker[k]; await env.FAMILIE_KV.put(MERKE_NOKKEL, JSON.stringify(merker)); }
  const perioder = await lesPerioder(env);
  if(perioder[k]){ delete perioder[k]; await env.FAMILIE_KV.put(PERIODE_NOKKEL, JSON.stringify(perioder)); }
  const b = await lesJson(env, BUDSJETT_NOKKEL, null);
  if(b){
    let bEndret = false;
    if(b.standard && b.standard[k] != null){ delete b.standard[k]; bEndret = true; }
    for(const m of Object.keys(b.maaneder || {})) if(b.maaneder[m][k] != null){ delete b.maaneder[m][k]; bEndret = true; }
    if(bEndret) await env.FAMILIE_KV.put(BUDSJETT_NOKKEL, JSON.stringify(b));
  }
  const laert = await lesJson(env, LAERT_NOKKEL, {});
  let endret = false;
  for(const m of Object.keys(laert)) if(laert[m] === k){ delete laert[m]; endret = true; }
  if(endret) await env.FAMILIE_KV.put(LAERT_NOKKEL, JSON.stringify(laert));
  return svar({ ok:true, kategorier:flett(egne, await lesOmdopt(env)).filter(x => x.indexOf('Utenfor budsjett') !== 0), egne:egne });
}
/* Nytt navn paa en post eller linje: { fra, navn }. Linjene under,
   foeringene, budsjettet og det Neam har laert foelger med (Magne,
   6. november 2026 - Neam skal kunne endre postene paa Oekonomi-sida).
   En fast post faar navnet i OMDOPT_NOKKEL; gruppene og Utenfor budsjett
   faar ikke nytt navn. */
async function nyttKategoriNavn(env, kropp){
  const fra = String(kropp.fra || '');
  const navn = String(kropp.navn || '').replace(/·/g, '').replace(/\s+/g, ' ').trim().slice(0, 40);
  if(!navn) return svar({ ok:false, feil:'Det nye navnet mangler' });
  const egne = await lesEgne(env), omdopt = await lesOmdopt(env);
  if(flett(egne, omdopt).indexOf(fra) === -1 || fra.split(' · ').length < 2) return svar({ ok:false, feil:'Ukjent post: ' + fra });
  if(fra.indexOf('Utenfor budsjett') === 0) return svar({ ok:false, feil:'Postene utenfor budsjett får ikke nytt navn' });
  const til = fra.split(' · ').slice(0, -1).concat([navn]).join(' · ');
  if(til !== fra && flett(egne, omdopt).some(k => k !== fra && k.toLowerCase() === til.toLowerCase())) return svar({ ok:false, feil:'Det finnes alt en post som heter ' + til });
  const fast = KATEGORIER.filter(k => (omdopt[k] || k) === fra)[0];
  if(fast){
    if(til === fast) delete omdopt[fast]; else omdopt[fast] = til;
    await env.FAMILIE_KV.put(OMDOPT_NOKKEL, JSON.stringify(omdopt));
  }
  const bytt = k => k === fra ? til : (typeof k === 'string' && k.indexOf(fra + ' · ') === 0 ? til + k.slice(fra.length) : k);
  const nyeEgne = egne.map(bytt);
  await env.FAMILIE_KV.put(EGNE_NOKKEL, JSON.stringify(nyeEgne));
  const poster = await lesJson(env, POST_NOKKEL, {});
  let pEndret = false;
  for(const id of Object.keys(poster)){
    const p = poster[id];
    if(bytt(p.kategori) !== p.kategori){ p.kategori = bytt(p.kategori); pEndret = true; }
    for(const d of p.deler || []) if(bytt(d.kategori) !== d.kategori){ d.kategori = bytt(d.kategori); pEndret = true; }
  }
  if(pEndret) await env.FAMILIE_KV.put(POST_NOKKEL, JSON.stringify(poster));
  const b = await lesJson(env, BUDSJETT_NOKKEL, null);
  let bEndret = false;
  const flytt = o => { for(const k of Object.keys(o || {})) if(bytt(k) !== k){ o[bytt(k)] = o[k]; delete o[k]; bEndret = true; } };
  if(b){ flytt(b.standard); for(const m of Object.keys(b.maaneder || {})) flytt(b.maaneder[m]); }
  if(bEndret) await env.FAMILIE_KV.put(BUDSJETT_NOKKEL, JSON.stringify(b));
  const laert = await lesJson(env, LAERT_NOKKEL, {});
  let lEndret = false;
  for(const m of Object.keys(laert)) if(bytt(laert[m]) !== laert[m]){ laert[m] = bytt(laert[m]); lEndret = true; }
  if(lEndret) await env.FAMILIE_KV.put(LAERT_NOKKEL, JSON.stringify(laert));
  const merker = await lesMerker(env);
  let mEndret = false;
  for(const k of Object.keys(merker)) if(bytt(k) !== k){ merker[bytt(k)] = merker[k]; delete merker[k]; mEndret = true; }
  if(mEndret) await env.FAMILIE_KV.put(MERKE_NOKKEL, JSON.stringify(merker));
  const perioder = await lesPerioder(env);
  let pEndret2 = false;
  for(const k of Object.keys(perioder)) if(bytt(k) !== k){ perioder[bytt(k)] = perioder[k]; delete perioder[k]; pEndret2 = true; }
  if(pEndret2) await env.FAMILIE_KV.put(PERIODE_NOKKEL, JSON.stringify(perioder));
  return svar({ ok:true, fra:fra, til:til, kategorier:flett(nyeEgne, omdopt).filter(x => x.indexOf('Utenfor budsjett') !== 0), egne:nyeEgne });
}
const POST_NOKKEL = 'auth:bank:poster';
const LAERT_NOKKEL = 'auth:bank:laert';
/* «Neam husker» i innboksen: det Neam har laert per motpart. Tom kategori
   glemmer motparten; med kategori settes den (ogsaa naar en glemt angres). */
async function lagreLaert(env, kropp){
  const motpart = String(kropp.motpart || '').slice(0, 120);
  if(!motpart) return svar({ ok:false, feil:'Mangler motpart' });
  const laert = await lesJson(env, LAERT_NOKKEL, {});
  if(kropp.kategori){
    if((await alleKategorier(env)).indexOf(kropp.kategori) === -1) return svar({ ok:false, feil:'Ukjent kategori: ' + kropp.kategori });
    laert[motpart] = kropp.kategori;
  } else delete laert[motpart];
  await env.FAMILIE_KV.put(LAERT_NOKKEL, JSON.stringify(laert));
  return svar({ ok:true, laert:laert });
}
const FRA_NOKKEL = 'auth:bank:innboks-fra';

/* Motparten uten tall og stoey - «KIWI 123 LYNGDAL» og «KIWI 456 LYNGDAL»
   er samme butikk. Mangler motpart, brukes de tre foerste ordene i teksten. */
function motpartNokkel(p){
  const raa = (p.motpart || String(p.tekst || '').split(/\s+/).slice(0, 3).join(' ')).toUpperCase();
  return raa.replace(/[0-9*#.,:/\\-]+/g, ' ').replace(/\s+/g, ' ').trim();
}
function foreslaa(p, laert, omdopt){
  const n = motpartNokkel(p);
  if(n && laert[n]) return { kategori:laert[n], kilde:'laert' };
  const tekst = (p.motpart + ' ' + p.tekst).toUpperCase();
  /* Noekkelordene peker paa de faste navnene - har posten faatt nytt navn, brukes det. */
  for(const [re, kat] of NOKKELORD) if(re.test(tekst)) return { kategori:(omdopt && omdopt[kat]) || kat, kilde:'ord' };
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
/* Ligner kvitteringen en som alt er lagt inn? (Magne, 6. november 2026)
   Samme kjoep kan komme to ganger: fra Trumf og som bilde, eller samme
   bilde lest litt ulikt, saa id-en (butikk, dato, sum) blir en annen.
   Ligner: beloepet innen 1 kr, hoeyst tre dager mellom, og -
   naar begge har varelinjer - minst halvparten av varene like. Da merkes
   den nye `lignerPaa`, foeres aldri av seg selv, og sida stryker den til
   noen tar den med. Samme regel som mulDobbel mot banktrekket.
   Strammet inn (Magne, 7. november 2026 - to KIWI-kjoep paa 717,80 og
   724,53 dagen etter ble stoppet): to Trumf-kvitteringer er aldri samme
   kjoep, Trumf gir hvert kjoep sin egen id. Og beloepet maa matche paa
   krona, pluss/minus 1 kr - foer var det 1 % av summen. */
function varenavn(l){ return String(l && l.navn || '').toLowerCase().replace(/[^a-zæøå0-9]+/g, ' ').trim(); }
function vareLikhet(a, b){
  if(!a.length || !b.length) return null;
  const sa = new Set(a.map(varenavn)), sb = new Set(b.map(varenavn));
  let felles = 0;
  sa.forEach(n => { if(sb.has(n)) felles++; });
  return felles / Math.min(sa.size, sb.size);
}
async function finnLignende(env, poster, kv, linjer){
  const sum = Math.abs(kv.belop);
  for(const id of Object.keys(poster)){
    const a = poster[id];
    if(id === kv.id || !a.fra || a.status === 'stroket' || a.status === 'sammenslatt' || a.status === 'venter') continue;
    if(a.fra === 'trumf' && kv.fra === 'trumf') continue;
    const avvik = Math.abs(Math.abs(a.belop) - sum);
    if(avvik > 1 || dagerMellom(a.dato, kv.dato) > 3) continue;
    const andre = ((await lesJson(env, kvitteringNokkel(a), null)) || {}).linjer || [];
    const lik = vareLikhet(linjer || [], andre);
    if(lik !== null && lik < 0.5) continue;
    return { id:a.id, sted:a.motpart || a.tekst || '', dato:a.dato, belop:a.belop,
      kilde:a.fra === 'trumf' ? 'Trumf-kvittering' : a.forHand ? 'kjøp lagt inn for hånd' : 'kvittering fra bilde',
      varer:lik === null ? null : Math.round(lik * 100) };
  }
  return null;
}
/* ---------- Fakturaer ----------
   En faktura (e-faktura, giro) er ikke et kjoep, men varselet om et trekk.
   Den telles aldri selv: kommer den foer trekket, venter den (status
   `venter`), og naar trekket kommer fra banken, legges PDF-en ved det. Ligger
   trekket der alt, legges den ved med en gang. Samme vei begge veier -
   «det skal bare synces» (Magne, 6. november 2026).
   Lik: samme beloep til oeret, og trekket fra ti dager foer forfall til fem
   dager etter (betalt tidlig, eller forfall i en helg). */
function fakturaLik(bank, f){
  const d = (Date.parse(bank.dato) - Date.parse(f.dato)) / 86400000;
  return Math.abs(Math.abs(bank.belop) - Math.abs(f.belop)) < 0.005 && d >= -10 && d <= 5;
}
function fakturaTrekk(poster, f){
  return Object.keys(poster).map(x => poster[x]).filter(b => !b.fra && b.belop < 0 && !b.dekketAv
    && (b.status === 'ny' || b.status === 'godkjent') && fakturaLik(b, f));
}
async function flyttFaktura(env, f, b, naa){
  const fil = await lesJson(env, filNokkel(f.id), null);
  if(fil){ await env.FAMILIE_KV.put(filNokkel(b.id), JSON.stringify(fil)); b.harFil = true; b.filType = fil.type; }
  b.vedlagt = naa; b.faktura = { id:f.id, forfall:f.dato };
  /* Kategorien fra fakturaen foelger med til trekket, saa det som sto som
     «forfaller» havner paa samme linje naar det er betalt (7. november 2026).
     Trekket foeres med en gang - regningen var alt i regnskapet som
     «forfaller», og skal ikke forsvinne derfra til noen godkjenner. Angre
     legger det i innboksen som vanlig. */
  if(b.status === 'ny' && f.kategori && !b.manuell){
    b.kategori = f.kategori; b.kilde = 'faktura';
    if(!b.mulDobbel && !b.lignerPaa && !b.dekketAv) autoFoer({}, b, naa);
  }
  Object.assign(f, { status:'sammenslatt', slaattInn:b.id, behandlet:naa });
}
async function synkFakturaer(env, poster){
  const naa = new Date().toISOString();
  let n = 0;
  for(const id of Object.keys(poster)){
    const f = poster[id];
    if(f.status !== 'venter' || !f.faktura) continue;
    const b = fakturaTrekk(poster, f).filter(x => !x.harFil)[0];
    if(!b) continue;
    await flyttFaktura(env, f, b, naa);
    n++;
  }
  return n;
}
/* Kategorien paa en faktura som venter - den bestemmer hvilken linje i
   Regnskap den forfaller paa, og foelger med til trekket (7. november 2026). */
async function fakturaKategori(env, kropp){
  const poster = await lesJson(env, POST_NOKKEL, {});
  const p = poster[String(kropp.id || '')];
  if(!p || p.status !== 'venter') return svar({ ok:false, feil:'Fant ikke fakturaen' });
  const k = String(kropp.kategori || '');
  if(k && (await alleKategorier(env)).indexOf(k) === -1) return svar({ ok:false, feil:'Ukjent kategori' });
  if(k){ p.kategori = k; p.kilde = 'manuell'; } else { delete p.kategori; delete p.kilde; }
  await env.FAMILIE_KV.put(POST_NOKKEL, JSON.stringify(poster));
  return svar({ ok:true, post:p });
}
async function fakturaInnboks(env, kropp){
  const poster = await lesJson(env, POST_NOKKEL, {});
  const p = poster[String(kropp.id || '')];
  if(!p || p.status !== 'venter') return svar({ ok:false, feil:'Fant ikke fakturaen' });
  /* Betalt fra en konto Neam ikke henter - da blir fakturaen selve posten. */
  p.status = 'ny';
  kobleKvittering(poster, p);
  await env.FAMILIE_KV.put(POST_NOKKEL, JSON.stringify(poster));
  return svar({ ok:true });
}
/* ---------- Samme trekk med ny tekst ----------
   DNB gir ikke trekkene egne id-er, saa id-en lages av dato, beloep, tekst
   og motpart (hentTransaksjoner). Naar DNB senere legger til tekst eller
   motpart, eller flytter datoen en dag, faar samme trekk en ny id - og ble
   foert én gang til (Magne, 7. november 2026: Tibber to ganger, og flere).
   Kjennetegnet: den gamle id-en finnes ikke lenger i bankens liste, og et
   nytt trekk paa samme konto har samme beloep og hoeyst tre dager mellom.
   Da er det samme trekk; den nye id-en huskes paa den gamle posten
   (`bankIder`), og den gamle faar den rikere teksten. To like kjoep som
   begge staar i banken (to kaffer), roeres ikke. */
function bankFinnes(p, iBanken){ return iBanken.has(p.id) || (p.bankIder || []).some(i => iBanken.has(i)); }
function sammeTrekk(a, b){ return Math.abs(a.belop - b.belop) < 0.005 && dagerMellom(a.dato, b.dato) <= 3; }
function lagdId(id){ return /^h[\w-]{10,}$/.test(String(id || '')); }
function kobleKvittering(poster, kv){
  if(kv.bankId || kv.mulDobbel) return;
  for(const id of Object.keys(poster)){
    const b = poster[id];
    if(b.fra || b.dekketAv || b.belop >= 0 || !erLik(b, kv)) continue;
    if(b.status === 'ny'){ b.dekketAv = kv.id; kv.bankId = b.id; kv.bankKonto = b.kontoNavn; delete b.lignerPaa; }
    else if(b.status === 'godkjent'){ kv.mulDobbel = b.id; kv.bankKonto = b.kontoNavn; }
    return;
  }
}

async function innboks(env, okt, fersk, psu){
  const roller = await lesRoller(env);
  const felles = okt.kontoer.filter(k => roller[k.uid] === 'felles');
  const trumfKoblet = !!(await lesJson(env, TRUMF_NOKKEL, null));
  /* Uten felleskonto og Trumf kan innboksen likevel ha kvitteringer lagt inn som bilde. */
  /* Foerste gang: fra den foerste i maaneden. Datoen staar fast etterpaa,
     saa en post som er godkjent eller stroeket, aldri kommer tilbake. */
  let fra = await env.FAMILIE_KV.get(FRA_NOKKEL);
  if(!fra){ fra = new Date().toISOString().slice(0, 8) + '01'; await env.FAMILIE_KV.put(FRA_NOKKEL, fra); }
  const poster = await lesJson(env, POST_NOKKEL, {});
  const laert = await lesJson(env, LAERT_NOKKEL, {}), omdopt = await lesOmdopt(env);
  let hentet = Date.now(), advarsel = '', nye = 0, oppdatert = false;
  /* Id-er DNB har gitt samme trekk paa nytt (se sammeTrekk). */
  const alias = {};
  for(const id of Object.keys(poster)) for(const a of poster[id].bankIder || []) alias[a] = id;
  for(const k of felles){
    const r = await hentTransaksjoner(env, k.uid, fra, fersk, psu);
    if(!r.ok){ advarsel = r.feil; continue; }
    hentet = Math.min(hentet, r.hentet);
    if(r.advarsel) advarsel = r.advarsel;
    const iBanken = new Set(r.liste.map(x => x.id)), brukt = {};
    for(const t of r.liste){
      /* Bare bokfoerte. En reservasjon kan endre beloep eller forsvinne. */
      if(t.status && t.status !== 'BOOK') continue;
      if(poster[t.id] || alias[t.id]) continue;
      if(lagdId(t.id)){
        const gammel = Object.keys(poster).map(x => poster[x]).filter(p => !p.fra && p.konto === k.uid && lagdId(p.id)
          && p.status !== 'sammenslatt' && !brukt[p.id] && sammeTrekk(p, t) && !bankFinnes(p, iBanken))[0];
        if(gammel){
          brukt[gammel.id] = true; alias[t.id] = gammel.id;
          (gammel.bankIder = gammel.bankIder || []).push(t.id);
          if(t.motpart && !gammel.motpart) gammel.motpart = t.motpart;
          if(String(t.tekst || '').length > String(gammel.tekst || '').length) gammel.tekst = t.tekst;
          oppdatert = true;
          continue;
        }
      }
      const f = foreslaa(t, laert, omdopt);
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
      /* Var kvitteringen alt godkjent - ofte foert automatisk, fordi Trumf
         kommer samme dag og banktrekket en dag eller to etter - kan de ikke
         slaas sammen stille. Banktrekket merkes som mulig dobbel, foeres
         aldri av seg selv og staar stroeket til noen tar det med (Magne,
         6. november 2026). Uten dette ble kjoepet telt to ganger. */
      if(!ny.dekketAv && ny.belop < 0){
        for(const id of Object.keys(poster)){
          const kv = poster[id];
          if(!kv.fra || kv.status !== 'godkjent' || kv.bankId || !erLik(ny, kv)) continue;
          ny.lignerPaa = { id:kv.id, sted:kv.motpart || kv.tekst || '', dato:kv.dato, belop:kv.belop,
            kilde:kv.fra === 'trumf' ? 'Trumf-kvittering' : kv.forHand ? 'kjøp lagt inn for hånd' : 'kvittering fra bilde', varer:null };
          break;
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
        const f = foreslaa(kv, laert, omdopt);
        kv.kategori = f.kategori; kv.kilde = f.kilde;
        kobleKvittering(poster, kv);
        const ligner = await finnLignende(env, poster, kv, []);
        if(ligner) kv.lignerPaa = ligner;
        poster[id] = kv;
        nye++;
      }
    }
  }
  /* Fakturaer som venter, legges ved trekket naar det er kommet. */
  if(await synkFakturaer(env, poster)) nye++;
  /* «Spoer bare naar den er usikker» (Magne, 29. oktober). En post Neam
     kjenner - samme motpart foert foer, eller et kjent navn - foeres med en
     gang og merkes `auto`. Den vises under «Foert automatisk» og kan angres;
     en angret post (`manuell`) foeres aldri automatisk igjen. Mulig dobbel
     foeres aldri av seg selv. */
  const naa = new Date().toISOString();
  let endret = nye > 0 || oppdatert;
  for(const id of Object.keys(poster)){
    const p = poster[id];
    if(p.status !== 'ny' || p.dekketAv || p.mulDobbel || p.lignerPaa || p.manuell) continue;
    if(!p.kategori){ const f = foreslaa(p, laert, omdopt); if(f.kategori){ p.kategori = f.kategori; p.kilde = f.kilde; } }
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
    const f = foreslaa(p, laert, omdopt);
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
    kategorier:await alleKategorier(env), poster:venter.map(medNavn), auto:auto.map(medNavn),
    fakturaer:alle.filter(p => p.status === 'venter').sort((a, b) => a.dato.localeCompare(b.dato)).map(medNavn), godkjent:alle.filter(p => p.status === 'godkjent').length });
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
    if(f.sikker && !p.mulDobbel && !p.lignerPaa && !p.manuell){
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
    forslag: venter.filter(p => p.kategori && p.kilde !== 'ai-usikker' && !p.mulDobbel && !p.lignerPaa).length,
    usikker: venter.filter(p => p.kategori && p.kilde === 'ai-usikker' && !p.mulDobbel && !p.lignerPaa).length,
    uten: venter.filter(p => !p.kategori && !p.mulDobbel && !p.lignerPaa).length,
    dobbel: venter.filter(p => p.mulDobbel || p.lignerPaa).length,
    eldste: venter.reduce((m, p) => !m || String(p.dato) < m ? String(p.dato) : m, '')
  };
  if(tf) ut.push({ type:'trumf', tekst: tf.kode === 'innlogging' ? 'Trumf trenger ny innlogging' : 'Trumf-hentingen virker ikke: ' + tf.feil });
  if(!okt) ut.push({ type:'bank', tekst:'Banken er ikke koblet' });
  else{
    const dager = okt.gyldigTil ? Math.floor((Date.parse(okt.gyldigTil) - Date.now()) / 86400000) : null;
    if(dager != null && dager <= 14) ut.push({ type:'samtykke', tekst: dager < 0 ? 'DNB-samtykket har gått ut' : 'DNB-samtykket går ut om ' + dager + (dager === 1 ? ' dag' : ' dager') });
  }
  return svar({ ok:true, varsler:ut, innboks:innboks, sistHentet:sist && sist.tid });
}

/* ---------- Kildene ----------
   Oversikten paa Status: naar hver automatiske kilde sist ble hentet, og
   siste feil. Leser bare KV - spoer aldri banken eller Trumf. */
async function kilder(env, okt){
  const roller = await lesRoller(env);
  const navn = await lesJson(env, KONTONAVN_NOKKEL, {});
  const fra = await env.FAMILIE_KV.get(FRA_NOKKEL);
  const buffer = async n => {
    const b = await lesJson(env, 'auth:bank:buffer:' + n, null);
    return b ? { hentet:b.hentet || null, feil:b.feil, feilTid:b.feilTid } : null;
  };
  const kontoer = [];
  for(const k of okt ? okt.kontoer : []){
    const felles = roller[k.uid] === 'felles';
    kontoer.push({ navn:navn[k.uid] || k.navn, rolle:roller[k.uid] || '', saldo:await buffer('saldo:' + k.uid),
      trans: felles && fra ? await buffer('trans:' + k.uid + ':' + fra) : undefined });
  }
  const sist = await lesJson(env, SIST_HENTET_NOKKEL, null);
  const trumf = await lesJson(env, TRUMF_NOKKEL, null);
  /* Trumf-feilen fra foer bufferen husket feil, saa lenge ingen
     vellykket henting har kommet etter den. */
  const tb = trumf ? await buffer('trumf:liste') : null;
  const tf = await lesJson(env, TRUMF_FEIL_NOKKEL, null);
  const trumfFeil = (tb && tb.feil) || (tf && (!tb || !tb.hentet || tf.tid > tb.hentet) ? tf.feil : undefined);
  return svar({ ok:true, intervall:BUFFER_TID,
    dnb: okt ? { koblet:true, gyldigTil:okt.gyldigTil || '' } : { koblet:false },
    vekker: (sist && sist.tid) || null, kontoer:kontoer,
    trumf: trumf ? Object.assign({ koblet:true }, tb, { feil:trumfFeil }) : { koblet:false } });
}

/* ---------- Budsjett og regnskap ----------
   Standardbudsjettet ligger i KV, ikke i koden: repoet er offentlig, og
   budsjettet inneholder loenn. Det fylles inn fra okonomi.html.

   Hver maaned har sitt eget budsjett, som tar utgangspunkt i standarden
   (Magne, 29. oktober). En maaned uten egen kopi foelger standarden. Naar
   standarden lagres, faar maanedene som alt har startet en kopi av den
   gamle - en endring i standarden gjelder fra neste maaned, og historikken
   staar. Regnskapet er summen av de
   godkjente postene per kategori og maaned; «Utenfor budsjett» telles ikke.
   Fortegn: utgifter og sparing som positive beloep (det som gikk ut),
   inntekter som positive beloep (det som kom inn). */
const BUDSJETT_NOKKEL = 'auth:bank:budsjett';
/* Hvilke maaneder en post kommer i: { kategori: [1, 4, 7, 10] }. Uten
   oppfoering kommer den hver maaned. Beloepet i standarden er det som
   kommer hver gang; maaneder uten posten faar den ikke (Magne, 7. november
   2026: «kommunale utgifter er hver tredje måned»). En linje uten egne
   maaneder foelger posten. */
const PERIODE_NOKKEL = 'auth:bank:budsjett-perioder';
async function lesPerioder(env){ return await lesJson(env, PERIODE_NOKKEL, {}); }
function periodeFor(perioder, k){
  if(perioder[k]) return perioder[k];
  const d = k.split(' · ');
  return d.length === 3 ? (perioder[d[0] + ' · ' + d[1]] || null) : null;
}
/* Standarden slik den gjelder én maaned: postene som ikke kommer da, er borte. */
function standardFor(standard, perioder, m){
  const nr = Number(String(m).slice(5, 7)), ut = {};
  for(const k of Object.keys(standard)){
    const per = periodeFor(perioder, k);
    if(!per || per.indexOf(nr) !== -1) ut[k] = standard[k];
  }
  return ut;
}
async function settPerioder(env, kropp){
  const k = String(kropp.kategori || '');
  if((await budsjettKategorier(env)).indexOf(k) === -1 || k.split(' · ').length < 2) return svar({ ok:false, feil:'Ukjent post: ' + k });
  const mnd = [...new Set([].concat(kropp.maaneder || []).map(Number).filter(n => n >= 1 && n <= 12 && Math.floor(n) === n))].sort((a, b) => a - b);
  const perioder = await lesPerioder(env);
  if(!mnd.length || mnd.length === 12) delete perioder[k]; else perioder[k] = mnd;
  await env.FAMILIE_KV.put(PERIODE_NOKKEL, JSON.stringify(perioder));
  return budsjett(env);
}

async function budsjett(env){
  const b = await lesJson(env, BUDSJETT_NOKKEL, null);
  return svar({ ok:true, kategorier:await budsjettKategorier(env), egne:await lesEgne(env), standard:(b && b.standard) || {},
    maaneder:(b && b.maaneder) || {}, perioder:await lesPerioder(env), merker:await lesMerker(env), merkeliste:await lesMerkeliste(env), fra:(await env.FAMILIE_KV.get(FRA_NOKKEL)) || '', endret:b && b.endret, av:b && masker(b.av) });
}
async function lagreBudsjett(env, kropp, epost){
  const kategorier = await budsjettKategorier(env);
  const rens = inn => {
    const ut = {};
    for(const k of Object.keys(inn || {})){
      if(kategorier.indexOf(k) === -1) return { feil:'Ukjent kategori: ' + k };
      /* Kroner og oere (7. november 2026). */
      const v = Math.round((Number(inn[k]) || 0) * 100) / 100;
      if(v < 0 || v > 1e7) return { feil:'Ugyldig beløp for ' + k };
      if(v) ut[k] = v;
    }
    return { ut:ut };
  };
  const b = await lesJson(env, BUDSJETT_NOKKEL, null) || {};
  const standard = b.standard || {}, maaneder = b.maaneder || {};
  if(kropp.mnd){
    if(!/^\d{4}-\d{2}$/.test(kropp.mnd)) return svar({ ok:false, feil:'Ugyldig måned' });
    if(kropp.tilbake) delete maaneder[kropp.mnd];
    else{
      const r = rens(kropp.maaned);
      if(r.feil) return svar({ ok:false, feil:r.feil });
      maaneder[kropp.mnd] = r.ut;
    }
  } else {
    const r = rens(kropp.standard);
    if(r.feil) return svar({ ok:false, feil:r.feil });
    /* Maanedene som alt har startet, beholder budsjettet de hadde. */
    if(Object.keys(standard).length){
      const perioder = await lesPerioder(env);
      const naa = new Date().toISOString().slice(0, 7);
      const d = new Date((((await env.FAMILIE_KV.get(FRA_NOKKEL)) || naa).slice(0, 7)) + '-01T12:00:00Z');
      while(d.toISOString().slice(0, 7) <= naa){
        const m = d.toISOString().slice(0, 7);
        if(!maaneder[m]) maaneder[m] = standardFor(standard, perioder, m);
        d.setUTCMonth(d.getUTCMonth() + 1);
      }
    }
    b.standard = r.ut;
  }
  await env.FAMILIE_KV.put(BUDSJETT_NOKKEL, JSON.stringify({ standard:b.standard || {}, maaneder:maaneder, endret:new Date().toISOString(), av:epost }));
  return budsjett(env);
}
/* Hele perioden, maaned for maaned: { 'AAAA-MM': { kategori: beloep } }. For År-fanen. */
/* Fakturaene som venter, telles som «forfaller» i forfallsmaaneden - ved
   siden av det betalte, ikke i det (Magne, 7. november 2026: «skannede
   regninger til betaling må også bli med på oversikten over regnskapet på
   et vis, og dette må synces når betalingen er gjennomført»). Naar trekket
   kommer, legges fakturaen ved det (synkFakturaer) og er ikke lenger
   `venter` - da forsvinner den herfra, og trekket teller naar det er godkjent. */
async function regnskapAar(env){
  const poster = await lesJson(env, POST_NOKKEL, {});
  const kategorier = await budsjettKategorier(env);
  /* Summene per merke (8. november 2026): foeringens eget merke gaar foran
     kategoriens, og en linje uten merke arver postens - som i budsjettet. */
  const merker = await lesMerker(env), merkeUt = {};
  const merkeFor = (p, kat) => {
    if(p.merke) return p.merke;
    const d = String(kat).split(' · ');
    return merker[kat] || (d.length === 3 ? merker[d[0] + ' · ' + d[1]] : '') || '';
  };
  const ut = {}, forfaller = [];
  for(const id of Object.keys(poster)){
    const p = poster[id];
    if(p.status === 'venter' && p.faktura && kategorier.indexOf(p.kategori) !== -1 && p.kategori.indexOf('Inntekter') !== 0){
      forfaller.push({ id:p.id, mnd:String(p.dato).slice(0, 7), dato:p.dato, kategori:p.kategori, belop:Math.round(-p.belop * 100) / 100, motpart:p.motpart || p.tekst || '',
        harFil:!!p.harFil, filType:p.filType || '' });
      continue;
    }
    if(p.status !== 'godkjent') continue;
    const m = String(p.dato).slice(0, 7);
    const deler = p.deler && p.deler.length ? p.deler : [{ kategori:p.kategori, belop:p.belop }];
    for(const d of deler){
      if(kategorier.indexOf(d.kategori) === -1) continue;
      if(!ut[m]) ut[m] = {};
      const v = d.kategori.indexOf('Inntekter') === 0 ? d.belop : -d.belop;
      ut[m][d.kategori] = Math.round(((ut[m][d.kategori] || 0) + v) * 100) / 100;
      const mk = merkeFor(p, d.kategori);
      if(mk){ if(!merkeUt[m]) merkeUt[m] = {}; merkeUt[m][mk] = Math.round(((merkeUt[m][mk] || 0) + v) * 100) / 100; }
    }
  }
  return svar({ ok:true, fra:(await env.FAMILIE_KV.get(FRA_NOKKEL)) || '', maaneder:ut, merker:merkeUt, forfaller:forfaller });
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
    brutto:f.brutto || { magne:[], nina:[] }, buffer:f.buffer || [], historikk:await lesJson(env, FORMUE_MND_NOKKEL, {}) });
}
/* Netto formue per maaned, slik at Status kan vise endringen siden forrige
   maaned. Siste tall i maaneden vinner; det skrives hver gang kontoene
   hentes og tallet har endret seg. Samme regnestykke som sida gjoer:
   verdier + saldo paa «sparing»-kontoene - gjeld. En verdi med konto
   teller saldoen, og kontoen telles da ikke i tillegg som sparing. */
const FORMUE_MND_NOKKEL = 'auth:bank:formue-mnd';
async function formuePunkt(env, kontoliste){
  const f = await lesJson(env, FORMUE_NOKKEL, {});
  const verdier = f.verdier || [], gjeld = f.gjeld || [];
  const valgt = verdier.filter(v => v.konto).map(v => v.konto);
  const saldo = uid => { const k = kontoliste.find(x => x.uid === uid); return k && typeof k.saldo === 'number' ? Math.max(0, k.saldo) : 0; };
  const sparing = kontoliste.filter(k => k.rolle === 'sparing' && typeof k.saldo === 'number' && valgt.indexOf(k.uid) === -1);
  if(!verdier.length && !gjeld.length && !sparing.length) return;
  const netto = Math.round(verdier.reduce((s, v) => s + (v.konto ? saldo(v.konto) : v.belop), 0) + sparing.reduce((s, k) => s + k.saldo, 0) - gjeld.reduce((s, g) => s + g.belop, 0));
  const hist = await lesJson(env, FORMUE_MND_NOKKEL, {});
  const mnd = new Date().toISOString().slice(0, 7);
  if(hist[mnd] === netto) return;
  hist[mnd] = netto;
  await env.FAMILIE_KV.put(FORMUE_MND_NOKKEL, JSON.stringify(hist));
}
const LAN_TYPER = ['bolig', 'bil', 'baat', 'forbruk', 'studie', 'annet'];
async function lagreFormue(env, kropp, epost){
  const rad = (r, medRente) => {
    const navn = String(r && r.navn || '').trim().slice(0, 60);
    /* En verdi kan vaere en konto: beloepet er saldoen fra banken. */
    if(!medRente && r && r.konto) return { navn:navn || 'Konto', konto:String(r.konto).slice(0, 80) };
    const belop = Math.round(Number(r && r.belop) || 0);
    if(!navn || belop < 0 || belop > 1e9) return null;
    const ut = { navn:navn, belop:belop, dato:/^\d{4}-\d{2}-\d{2}$/.test(r.dato || '') ? r.dato : new Date().toISOString().slice(0, 10) };
    if(medRente){ const rente = Number(r.rente); if(rente >= 0 && rente < 30) ut.rente = Math.round(rente * 100) / 100; }
    /* Typen paa laanet - bolig, bil, baat … (Magne, 6. november 2026). */
    if(medRente && LAN_TYPER.indexOf(r.type) !== -1) ut.type = r.type;
    return ut;
  };
  const verdier = [].concat(kropp.verdier || []).slice(0, 30).map(r => rad(r, false)).filter(Boolean);
  const gjeld = [].concat(kropp.gjeld || []).slice(0, 30).map(r => rad(r, true)).filter(Boolean);
  let maal = null;
  if(kropp.maal && String(kropp.maal.navn || '').trim()){
    maal = { navn:String(kropp.maal.navn).trim().slice(0, 60), belop:Math.max(0, Math.round(Number(kropp.maal.belop) || 0)),
      spart:Math.max(0, Math.round(Number(kropp.maal.spart) || 0)), konto:String(kropp.maal.konto || '').slice(0, 80) };
  }
  /* Bruttoinntekten (foer skatt, kr per aar) per person, med underpunkter som
     fastloenn og tillegg - til gjeldsgraden (Magne, 6. november 2026).
     Sender en side ikke `brutto`, beholdes det som staar: en eldre utgave i
     nettleseren skal ikke slette den. */
  const gammel = await lesJson(env, FORMUE_NOKKEL, {});
  let brutto;
  if(kropp.brutto && typeof kropp.brutto === 'object'){
    brutto = {};
    for(const hvem of ['magne', 'nina']) brutto[hvem] = [].concat(kropp.brutto[hvem] || []).slice(0, 20).map(r => rad(r, false)).filter(r => r && !r.konto);
  } else {
    brutto = gammel.brutto || { magne:[], nina:[] };
  }
  /* Kontoene som teller i bufferen - egen liste, uavhengig av rollene, saa
     ogsaa felleskontoer kan telle uten at innboksen mister dem (Magne,
     6. november 2026). Samme regel som brutto: mangler den, beholdes den. */
  const buffer = Array.isArray(kropp.buffer)
    ? [...new Set(kropp.buffer.map(String))].filter(u => u && u.length <= 80).slice(0, 40)
    : (gammel.buffer || []);
  await env.FAMILIE_KV.put(FORMUE_NOKKEL, JSON.stringify({ verdier:verdier, gjeld:gjeld, maal:maal, brutto:brutto, buffer:buffer, endret:new Date().toISOString(), av:epost }));
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
/* Foeringene bak ett tall i budsjett mot regnskap: en gruppe («Bolig»),
   en post med linjene under, eller - med eksakt - bare posten selv.
   Fortegnet er det samme som i regnskapet, saa summen stemmer med tabellen. */
async function foringer(env, mnd, kat, eksakt){
  if(!/^\d{4}-\d{2}$/.test(mnd || '') || !kat) return svar({ ok:false, feil:'Mangler måned eller kategori' });
  const poster = await lesJson(env, POST_NOKKEL, {});
  const kn = await lesJson(env, KONTONAVN_NOKKEL, {});
  const treff = k => k === kat || (!eksakt && String(k).indexOf(kat + ' · ') === 0);
  const ut = [];
  for(const id of Object.keys(poster)){
    const p = poster[id];
    if(p.status !== 'godkjent' || String(p.dato).slice(0, 7) !== mnd) continue;
    const deler = p.deler && p.deler.length ? p.deler : [{ kategori:p.kategori, belop:p.belop }];
    for(const d of deler){
      if(!treff(d.kategori)) continue;
      const bank = p.bankId && poster[p.bankId];
      ut.push({ id:p.id, dato:p.dato, tekst:p.motpart || p.tekst || '', mer:p.motpart && p.tekst && p.tekst !== p.motpart ? p.tekst : '',
        kilde: p.fra ? (p.fra === 'trumf' ? 'Trumf-kvittering' : p.forHand ? 'Lagt inn for hånd' : 'Kvittering fra bilde') : (kn[p.konto] || p.kontoNavn || ''),
        betaltFra: bank ? (kn[bank.konto] || bank.kontoNavn || '') : '',
        kategori:d.kategori, del:deler.length > 1, harKvittering:(!!p.fra || !!p.harLinjer) && p.harKvittering !== false,
        harFil:!!p.harFil, filType:p.filType || '', overstyrt:!!p.overstyrt, merke:p.merke || '',
        belop: Math.round((d.kategori.indexOf('Inntekter') === 0 ? d.belop : -d.belop) * 100) / 100 });
    }
  }
  ut.sort((a, b) => String(a.dato).localeCompare(String(b.dato)));
  return svar({ ok:true, mnd:mnd, kategori:kat, foringer:ut });
}

/* ---------- Én foering: alt om den, og endringene (8. november 2026) ----------
   Magne: «Når jeg trykker på en føring ønsker jeg et større vindu som viser
   meg all info om den … Endre vedlegg, endre sum, endre navn osv.» Summen
   kan overstyres: den opprinnelige (fra banken) ligger i bankBelop, og
   overstyrt merkes - sida viser et utropstegn. En ny henting fra banken
   rører ikke en post som finnes (se hentingen), saa endringen blir staaende.
   Navnet: det opprinnelige i motpartBank. Merke paa foeringen gaar foran
   kategoriens. */
function vedleggListe(p){
  const l = [];
  if(p.harFil) l.push({ n:0, type:p.filType || '', navn:p.filNavn || '' });
  for(const v of (p.vedlegg || [])) l.push({ n:v.n, type:v.type, navn:v.navn || '' });
  return l;
}
async function postDetaljer(env, id){
  const poster = await lesJson(env, POST_NOKKEL, {});
  const p = poster[String(id || '')];
  if(!p) return svar({ ok:false, feil:'Fant ikke føringen' });
  const kn = await lesJson(env, KONTONAVN_NOKKEL, {});
  const bank = p.bankId && poster[p.bankId];
  return svar({ ok:true, post:{ id:p.id, dato:p.dato, datoBank:p.datoBank || '', belop:p.belop, bankBelop:p.bankBelop != null ? p.bankBelop : null, overstyrt:!!p.overstyrt,
    motpart:p.motpart || '', tekst:p.tekst || '', motpartBank:p.motpartBank || '', notat:p.notat || '', kategori:p.kategori || '', merke:p.merke || '',
    status:p.status || '', auto:!!p.auto, kilde:p.kilde || '', fra:p.fra || '', forHand:!!p.forHand, faktura:!!p.faktura,
    konto:p.konto ? (kn[p.konto] || p.kontoNavn || '') : '', betaltFra:bank ? (kn[bank.konto] || bank.kontoNavn || '') : '',
    behandlet:p.behandlet || '', av:p.av ? masker(p.av) : '', deler:(p.deler || []).map(d => ({ kategori:d.kategori, belop:d.belop })),
    harKvittering:(!!p.fra || !!p.harLinjer) && p.harKvittering !== false, vedlegg:vedleggListe(p) } });
}
async function postEndre(env, kropp){
  const poster = await lesJson(env, POST_NOKKEL, {});
  const p = poster[String(kropp.id || '')];
  if(!p) return svar({ ok:false, feil:'Fant ikke føringen' });
  if(kropp.motpart != null){
    const v = String(kropp.motpart).trim().slice(0, 120);
    if(!v) return svar({ ok:false, feil:'Navnet kan ikke være tomt' });
    if(v !== (p.motpart || p.tekst || '')){
      if(p.motpartBank == null) p.motpartBank = p.motpart || p.tekst || '';
      p.motpart = v;
      if(v === p.motpartBank) delete p.motpartBank;
    }
  }
  if(kropp.notat != null){ const n = String(kropp.notat).trim().slice(0, 1000); if(n) p.notat = n; else delete p.notat; }
  /* Datoen (8. november 2026): den opprinnelige i datoBank, som summen og navnet. */
  if(kropp.dato != null){
    const d = String(kropp.dato);
    if(!/^\d{4}-\d{2}-\d{2}$/.test(d) || isNaN(Date.parse(d))) return svar({ ok:false, feil:'Ugyldig dato' });
    if(d !== String(p.dato).slice(0, 10)){
      if(p.datoBank == null) p.datoBank = p.dato;
      p.dato = d;
      if(String(p.datoBank).slice(0, 10) === d){ p.dato = p.datoBank; delete p.datoBank; }
    }
  }
  if(kropp.belop != null){
    const b = Math.round(Number(kropp.belop) * 100) / 100;
    if(!isFinite(b) || Math.abs(b) > 1e8) return svar({ ok:false, feil:'Ugyldig beløp' });
    if(b !== p.belop){
      if(p.deler && p.deler.length > 1) return svar({ ok:false, feil:'Kvitteringen er delt på flere kategorier – endre fordelingen i kvitteringen' });
      if(p.bankBelop == null) p.bankBelop = p.belop;
      p.belop = b;
      if(b === p.bankBelop){ delete p.bankBelop; delete p.overstyrt; } else p.overstyrt = true;
    }
  }
  if(kropp.merke != null){
    const m = String(kropp.merke);
    if(m){
      const liste = await lesMerkeliste(env);
      if(!liste.some(x => x.id === m)) return svar({ ok:false, feil:'Ukjent merke' });
      p.merke = m;
    } else delete p.merke;
  }
  await env.FAMILIE_KV.put(POST_NOKKEL, JSON.stringify(poster));
  return postDetaljer(env, p.id);
}
async function postVedlegg(env, kropp){
  const poster = await lesJson(env, POST_NOKKEL, {});
  const p = poster[String(kropp.id || '')];
  if(!p) return svar({ ok:false, feil:'Fant ikke føringen' });
  const type = String(kropp.type || '');
  if(!/^(image\/(jpeg|png|webp)|application\/pdf)$/.test(type)) return svar({ ok:false, feil:'Bare bilde eller PDF' });
  const data = String(kropp.data || '');
  if(!data || data.length > 14e6) return svar({ ok:false, feil:'Fila er for stor' });
  const navn = String(kropp.navn || '').slice(0, 120);
  if(!p.harFil){
    await env.FAMILIE_KV.put(filNokkel(p.id), JSON.stringify({ type:type, data:data }));
    p.harFil = true; p.filType = type; if(navn) p.filNavn = navn; else delete p.filNavn;
  } else {
    const n = (p.vedlegg || []).reduce((s, v) => Math.max(s, v.n), 0) + 1;
    if(n > 20) return svar({ ok:false, feil:'For mange vedlegg' });
    await env.FAMILIE_KV.put(vedleggNokkel(p.id, n), JSON.stringify({ type:type, data:data }));
    (p.vedlegg = p.vedlegg || []).push({ n:n, type:type, navn:navn });
  }
  await env.FAMILIE_KV.put(POST_NOKKEL, JSON.stringify(poster));
  return postDetaljer(env, p.id);
}
async function postVedleggSlett(env, kropp){
  const poster = await lesJson(env, POST_NOKKEL, {});
  const p = poster[String(kropp.id || '')];
  if(!p) return svar({ ok:false, feil:'Fant ikke føringen' });
  const n = Number(kropp.n);
  if(n === 0){
    if(!p.harFil) return svar({ ok:false, feil:'Fant ikke vedlegget' });
    await env.FAMILIE_KV.delete(filNokkel(p.id));
    p.harFil = false; delete p.filType; delete p.filNavn;
  } else {
    const i = (p.vedlegg || []).findIndex(v => v.n === n);
    if(i === -1) return svar({ ok:false, feil:'Fant ikke vedlegget' });
    await env.FAMILIE_KV.delete(vedleggNokkel(p.id, n));
    p.vedlegg.splice(i, 1);
    if(!p.vedlegg.length) delete p.vedlegg;
  }
  await env.FAMILIE_KV.put(POST_NOKKEL, JSON.stringify(poster));
  return postDetaljer(env, p.id);
}

/* Alle transaksjonene fra nullpunktet - kontoutskriften under Transaksjoner
   › Alle (Magne, 6. november 2026). Det som er slaatt inn i en annen post,
   vises som den posten: et banktrekk dekket av en kvittering, og en
   kvittering eller faktura lagt ved et trekk. Sida soeker og filtrerer selv. */
async function allePoster(env){
  const poster = await lesJson(env, POST_NOKKEL, {});
  const kn = await lesJson(env, KONTONAVN_NOKKEL, {});
  const ut = [];
  for(const id of Object.keys(poster)){
    const p = poster[id];
    if(p.status === 'sammenslatt' || p.dekketAv) continue;
    const bank = p.bankId && poster[p.bankId];
    ut.push({ id:p.id, dato:p.dato, belop:p.belop, motpart:p.motpart || '', tekst:p.tekst || '', kategori:p.kategori || '',
      status:p.status, auto:!!p.auto, fra:p.fra || '', forHand:!!p.forHand, faktura:!!p.faktura,
      konto:p.konto || '', kontoNavn:kn[p.konto] || p.kontoNavn || '', betaltFra:bank ? (kn[bank.konto] || bank.kontoNavn || '') : '',
      deler:p.deler && p.deler.length > 1 ? p.deler.length : 0,
      harKvittering:(!!p.fra || !!p.harLinjer) && p.harKvittering !== false, harFil:!!p.harFil, filType:p.filType || '',
      overstyrt:!!p.overstyrt });
  }
  ut.sort((a, b) => String(b.dato).localeCompare(String(a.dato)));
  return svar({ ok:true, fra:(await env.FAMILIE_KV.get(FRA_NOKKEL)) || '', poster:ut });
}

/* ---------- Bufferen paa regningskontoen ----------
   Loenna kommer midt i maaneden, regningene baade midt i og i slutten
   (Magne, 7. november 2026). Med en buffer paa regningskontoen betales det
   som kommer foer loenna, med det som staar der fra foer - og maanedene kan
   vaere kalendermaaneder. Her regnes ut hvor stor bufferen maa vaere, fra
   trekkene paa kontoen: for hver maaned, hvor langt ned saldoen gikk fra
   den 1. til paafyllet (den stoerste innbetalingen i maaneden). Samme dag
   regnes utbetalingene foer paafyllet - rekkefoelgen er ukjent. Alle
   banktrekk teller, ogsaa stroekne (pengene gikk likevel); samme trekk to
   ganger fra DNB (sammenslaatt inn i et annet banktrekk) telles én gang.
   Bare kontoer med rollen Felles har trekk i Neam. */
const REGNING_NOKKEL = 'auth:bank:regningskonto';
async function regningskonto(env){
  const valg = await lesJson(env, REGNING_NOKKEL, {});
  const uid = String(valg.uid || '');
  if(!uid) return svar({ ok:true, uid:'', maaneder:[], behov:0, anbefalt:0 });
  const poster = await lesJson(env, POST_NOKKEL, {});
  const per = {};
  for(const id of Object.keys(poster)){
    const p = poster[id];
    if(p.fra || p.konto !== uid || p.status === 'venter') continue;
    const inn = p.status === 'sammenslatt' && p.slaattInn && poster[p.slaattInn];
    if(inn && !inn.fra) continue;
    const m = String(p.dato).slice(0, 7);
    (per[m] = per[m] || []).push(p);
  }
  const naa = new Date().toISOString().slice(0, 7);
  const maaneder = Object.keys(per).sort().map(m => {
    /* Samme dag: utbetalingene foerst. */
    const liste = per[m].slice().sort((a, b) => String(a.dato).localeCompare(String(b.dato)) || a.belop - b.belop);
    const pafyll = liste.filter(x => x.belop > 0).sort((a, b) => b.belop - a.belop)[0] || null;
    let lop = 0, minst = 0, ut = 0;
    for(const x of liste){
      if(x === pafyll) break;
      lop += x.belop;
      if(lop < minst) minst = lop;
      if(x.belop < 0) ut += -x.belop;
    }
    return { mnd:m, behov:Math.round(-minst), ut:Math.round(ut),
      pafyll:pafyll ? { dato:pafyll.dato, belop:Math.round(pafyll.belop), tekst:pafyll.motpart || pafyll.tekst || '' } : null,
      ferdig:m < naa || !!pafyll };
  });
  const hele = maaneder.filter(x => x.ferdig);
  const storst = hele.reduce((s, x) => !s || x.behov > s.behov ? x : s, null);
  const behov = storst ? storst.behov : 0;
  /* Ti prosent til, rundet opp til hele tusen. */
  return svar({ ok:true, uid:uid, maaneder:maaneder, behov:behov, storst:storst ? storst.mnd : '', anbefalt:behov ? Math.ceil(behov * 1.1 / 1000) * 1000 : 0 });
}
async function lagreRegningskonto(env, kropp){
  const uid = String(kropp.uid || '').slice(0, 80);
  if(uid) await env.FAMILIE_KV.put(REGNING_NOKKEL, JSON.stringify({ uid:uid }));
  else await env.FAMILIE_KV.delete(REGNING_NOKKEL);
  return regningskonto(env);
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
  const fil = kropp.fil || {};
  const filOk = KVITTERING_FILTYPER.indexOf(fil.type) !== -1 && typeof fil.data === 'string' && fil.data.length < 14e6 && /^[A-Za-z0-9+/]/.test(fil.data);
  /* Hoerer kvitteringen til en transaksjon som alt ligger der, legges den
     VED den i stedet for aa bli en ny post (Magne, 6. november 2026):
       1. samme kvittering lagt inn paa nytt, men uten fil
       2. et banktrekk som alt er godkjent - samme beloep til oeret, hoeyst
          tre dager mellom (erLik)
       3. en kvittering som ligner (finnLignende) - fra Trumf, eller samme
          bilde lest litt ulikt
     Fila (og varelinjene, paa et banktrekk) legges ved. Et banktrekk som
     venter, slaas sammen som foer (kobleKvittering). Har det som finnes alt
     en fil, blir det en ny post som merkes som mulig dobbel, som foer. */
  const leggVed = async function(maal, hva){
    if(filOk){ await env.FAMILIE_KV.put(filNokkel(maal.id), JSON.stringify({ type:fil.type, data:fil.data })); maal.harFil = true; maal.filType = fil.type; }
    if(linjer.length && !maal.fra && !maal.harLinjer){
      await env.FAMILIE_KV.put(kvitteringNokkel(maal), JSON.stringify({ id:maal.id, belop:sum, linjer:linjer }));
      maal.harLinjer = true;
    }
    maal.vedlagt = new Date().toISOString();
    await env.FAMILIE_KV.put(POST_NOKKEL, JSON.stringify(poster));
    return svar({ ok:true, post:maal, festet:hva });
  };
  if(poster[id]){
    if(!poster[id].harFil && filOk) return await leggVed(poster[id], 'samme');
    return svar({ ok:false, feil:'Denne kvitteringen er allerede lagt inn (' + butikk + ', ' + dato + ')' });
  }
  /* En faktura legges ved trekket som alt ligger der, ellers venter den (over). */
  const faktura = k.type === 'faktura' && !kropp.forHand;
  if(faktura){
    const trekk = fakturaTrekk(poster, { belop:-sum, dato:dato });
    const ledig = trekk.filter(b => !b.harFil)[0];
    if(ledig){
      if(filOk){ await env.FAMILIE_KV.put(filNokkel(ledig.id), JSON.stringify({ type:fil.type, data:fil.data })); ledig.harFil = true; ledig.filType = fil.type; }
      ledig.vedlagt = new Date().toISOString(); ledig.faktura = { id:id, forfall:dato };
      await env.FAMILIE_KV.put(POST_NOKKEL, JSON.stringify(poster));
      return svar({ ok:true, post:ledig, festet:'faktura' });
    }
    if(trekk.some(b => b.faktura)) return svar({ ok:false, feil:'Denne fakturaen er allerede lagt inn (' + butikk + ', ' + dato + ')' });
  }
  if(filOk && !kropp.forHand && !faktura){
    const forsoek = { id:id, belop:-sum, dato:dato };
    const bank = Object.keys(poster).map(x => poster[x])
      .filter(b => !b.fra && b.status === 'godkjent' && !b.harFil && b.belop < 0 && erLik(b, forsoek))[0];
    if(bank) return await leggVed(bank, 'banktrekk');
    const lik = await finnLignende(env, poster, forsoek, linjer);
    const maal = lik && poster[lik.id];
    if(maal && !maal.harFil) return await leggVed(maal, 'kvittering');
  }
  const laert = await lesJson(env, LAERT_NOKKEL, {}), omdopt = await lesOmdopt(env);
  const p = { id:id, fra:'foto', konto:'foto', kontoNavn:'Kvittering fra bilde', dato:dato, belop:-sum, tekst:'', motpart:butikk,
    harKvittering: linjer.length > 0, status:'ny', lagtInnAv:epost, lagtInn:new Date().toISOString() };
  /* Lagt inn for haand - av Neam etter en beskjed, uten kvittering. */
  if(kropp.forHand){ p.forHand = true; p.kontoNavn = 'Lagt inn for hånd'; }
  if(faktura){ p.faktura = true; p.kontoNavn = 'Faktura'; p.status = 'venter'; }
  const f = foreslaa(p, laert, omdopt);
  p.kategori = f.kategori; p.kilde = f.kilde;
  /* Bildet eller PDF-en lagres, saa kvitteringen kan aapnes igjen (Magne,
     6. november 2026). Siden krymper bildene foer de sendes. */
  if(filOk){
    await env.FAMILIE_KV.put(filNokkel(id), JSON.stringify({ type:fil.type, data:fil.data }));
    p.harFil = true; p.filType = fil.type;
  }
  if(!faktura){
    kobleKvittering(poster, p);
    const ligner = await finnLignende(env, poster, p, linjer);
    if(ligner) p.lignerPaa = ligner;
  }
  poster[id] = p;
  if(linjer.length) await env.FAMILIE_KV.put(kvitteringNokkel(p), JSON.stringify({ id:id, belop:sum, linjer:linjer }));
  await env.FAMILIE_KV.put(POST_NOKKEL, JSON.stringify(poster));
  return svar({ ok:true, post:p });
}
const KVITTERING_FILTYPER = ['image/jpeg', 'image/png', 'application/pdf'];
function filNokkel(id){ return 'auth:bank:fil:' + id; }
/* Flere vedlegg (8. november 2026): det foerste ligger som foer i fil:<id>
   (harFil/filType), de neste i fil:<id>:<n> og i p.vedlegg = [{ n, type, navn }]. */
function vedleggNokkel(id, n){ return n ? filNokkel(id) + ':' + n : filNokkel(id); }
/* Selve fila, aapnet i en egen fane fra Oekonomi-sida. */
async function kvitteringFil(env, id, n){
  /* Ogsaa et banktrekk kan ha en fil lagt ved - id-en er da bankens. */
  if(!/^[\w:.-]{1,120}$/.test(id)) return svar({ ok:false, feil:'Ugyldig id' });
  n = /^\d{1,2}$/.test(String(n || '')) ? Number(n) : 0;
  const f = await lesJson(env, vedleggNokkel(id, n), null);
  if(!f || !f.data) return svar({ ok:false, feil:'Fant ikke fila til kvitteringen' });
  const bin = atob(f.data), bytes = new Uint8Array(bin.length);
  for(let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Response(bytes, { status:200, headers:{ 'Content-Type':f.type, 'Content-Disposition':'inline', 'Cache-Control':'private, no-store' } });
}
async function lagretKvittering(env, id){
  const poster = await lesJson(env, POST_NOKKEL, {});
  const p = poster[id];
  if(!p || !(p.fra || p.harLinjer)) return svar({ ok:false, feil:'Ukjent kvittering' });
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
    if((p.fra || p.harLinjer) && g.linjer){
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
/* Koble i ettertid (Magne, 6. november 2026): det som ble lagt inn foer
   kvitteringer ble lagt ved transaksjonen som alt laa der. { utfor:false }
   gir forslagene, { utfor:true } gjoer dem. Reglene:
     - kvittering mot banktrekk (samme beloep til oeret, hoeyst tre dager):
       er kvitteringen ikke telt (venter eller stroeket) og banktrekket
       godkjent, legges fila og varelinjene ved banktrekket, og kvitteringen
       slaas inn i det («legg-ved»). Ellers blir kvitteringen posten og
       banktrekket slaas inn i den, som ved vanlig sammenslaaing
       («slaa-sammen») - er begge godkjent, var kjoepet telt to ganger.
     - kvittering mot kvittering med samme beloep til oeret, hoeyst tre
       dager mellom, og minst halvparten av varene like naar begge har
       varelinjer: den med mest innhold (Trumf, saa flest varer) beholdes,
       den andre slaas inn i den, og fila legges ved.
   Alt kan angres med angre paa den som ble slaatt inn. */
async function kobleAlle(env, kropp, request){
  const poster = await lesJson(env, POST_NOKKEL, {});
  const alle = Object.keys(poster).map(id => poster[id]);
  /* Bankens lister akkurat naa - for samme trekk ført to ganger (sammeTrekk). */
  const iBanken = {}; let bankFeil = '';
  const okt = await lesOekt(env);
  if(okt){
    const roller = await lesRoller(env), fra = await env.FAMILIE_KV.get(FRA_NOKKEL);
    for(const k of okt.kontoer.filter(x => roller[x.uid] === 'felles')){
      const r = fra ? await hentTransaksjoner(env, k.uid, fra, false, psuAv(request)) : { ok:false, feil:'Innboksen er ikke startet' };
      if(r.ok) iBanken[k.uid] = new Set(r.liste.map(x => x.id)); else bankFeil = r.feil;
    }
  }
  const kort = p => ({ id:p.id, sted:p.motpart || p.tekst || '', dato:p.dato, belop:p.belop, status:p.status,
    kilde:p.fra ? (p.fra === 'trumf' ? 'Trumf-kvittering' : p.forHand ? 'kjøp lagt inn for hånd' : 'kvittering fra bilde') : (p.kontoNavn || 'banken') });
  const linjerAv = async p => ((await lesJson(env, kvitteringNokkel(p), null)) || {}).linjer || [];
  const kv = alle.filter(p => p.fra && !p.forHand && p.status !== 'sammenslatt' && p.status !== 'venter' && !p.bankId && !p.slaattInn);
  const bank = alle.filter(p => !p.fra && p.belop < 0 && !p.dekketAv && p.status !== 'sammenslatt' && p.status !== 'stroket');
  const brukt = {}, forslag = [];
  for(const r of kv){
    const b = bank.find(x => !brukt[x.id] && erLik(x, r));
    if(!b) continue;
    const ikkeTelt = r.status === 'ny' || r.status === 'stroket';
    const hva = ikkeTelt && b.status === 'godkjent' ? 'legg-ved' : r.status === 'stroket' ? null : 'slaa-sammen';
    if(!hva) continue;
    brukt[b.id] = brukt[r.id] = true;
    forslag.push({ hva:hva, kvittering:kort(r), transaksjon:kort(b), dobbelt:r.status === 'godkjent' && b.status === 'godkjent', _r:r, _b:b });
  }
  const rang = async p => (p.fra === 'trumf' ? 1000 : 0) + (await linjerAv(p)).length + (p.harFil ? 0.5 : 0);
  for(const r of kv){
    if(brukt[r.id] || r.status === 'stroket') continue;
    for(const o of kv){
      if(o.id === r.id || brukt[o.id] || o.status === 'stroket') continue;
      if(Math.abs(Math.abs(o.belop) - Math.abs(r.belop)) >= 0.005 || dagerMellom(o.dato, r.dato) > 3) continue;
      const lik = vareLikhet(await linjerAv(r), await linjerAv(o));
      if(lik !== null && lik < 0.5) continue;
      const [behold, inn] = (await rang(r)) >= (await rang(o)) ? [r, o] : [o, r];
      brukt[r.id] = brukt[o.id] = true;
      forslag.push({ hva:'kvittering', kvittering:kort(inn), transaksjon:kort(behold), dobbelt:r.status === 'godkjent' && o.status === 'godkjent', _r:inn, _b:behold });
      break;
    }
  }
  /* Samme trekk to ganger fra banken: den ene finnes ikke lenger hos DNB.
     Er begge der - eller ingen - kan det vaere to ekte kjoep, og de roeres ikke. */
  const trekk = alle.filter(p => !p.fra && lagdId(p.id) && iBanken[p.konto] && p.status !== 'sammenslatt' && p.status !== 'stroket');
  for(let i = 0; i < trekk.length; i++){
    for(let j = i + 1; j < trekk.length; j++){
      const a = trekk[i], b = trekk[j];
      if(brukt[a.id] || brukt[b.id] || a.konto !== b.konto || !sammeTrekk(a, b)) continue;
      const fa = bankFinnes(a, iBanken[a.konto]), fb = bankFinnes(b, iBanken[b.konto]);
      if(fa === fb) continue;
      const borte = fa ? b : a, igjen = fa ? a : b;
      /* Den som har mest (kvittering, fil, fordeling, valgt for haand), beholdes. */
      const mer = p => (p.dekketAv ? 8 : 0) + (p.harFil ? 4 : 0) + (p.harLinjer || (p.deler && p.deler.length) ? 2 : 0) + (p.status === 'godkjent' && !p.auto ? 1 : 0);
      const [behold, inn] = mer(borte) > mer(igjen) ? [borte, igjen] : [igjen, borte];
      brukt[a.id] = brukt[b.id] = true;
      forslag.push({ hva:'bank-dobbel', kvittering:kort(inn), transaksjon:kort(behold), dobbelt:a.status === 'godkjent' && b.status === 'godkjent', _r:inn, _b:behold });
      break;
    }
  }
  if(!kropp.utfor) return svar({ ok:true, advarsel:bankFeil || undefined, forslag:forslag.map(f => ({ hva:f.hva, kvittering:f.kvittering, transaksjon:f.transaksjon, dobbelt:f.dobbelt })) });

  const naa = new Date().toISOString();
  const kopierFil = async (fra, til) => {
    if(!fra.harFil || til.harFil) return;
    const fil = await lesJson(env, filNokkel(fra.id), null);
    if(!fil) return;
    await env.FAMILIE_KV.put(filNokkel(til.id), JSON.stringify(fil));
    til.harFil = true; til.filType = fra.filType;
  };
  let gjort = 0;
  for(const f of forslag){
    const r = f._r, b = f._b;
    if(f.hva === 'legg-ved'){
      await kopierFil(r, b);
      const l = await linjerAv(r);
      if(l.length && !b.harLinjer){ await env.FAMILIE_KV.put(kvitteringNokkel(b), JSON.stringify({ id:b.id, belop:Math.abs(b.belop), linjer:l })); b.harLinjer = true; }
      Object.assign(r, { status:'sammenslatt', slaattInn:b.id, behandlet:naa });
      b.vedlagt = naa;
    } else if(f.hva === 'bank-dobbel'){
      await kopierFil(r, b);
      if(!b.kategori && r.kategori){ b.kategori = r.kategori; b.kilde = r.kilde; }
      (b.bankIder = b.bankIder || []).push(r.id);
      if(r.motpart && !b.motpart) b.motpart = r.motpart;
      Object.assign(r, { status:'sammenslatt', slaattInn:b.id, behandlet:naa });
    } else if(f.hva === 'slaa-sammen'){
      r.bankId = b.id; r.bankKonto = b.kontoNavn; b.dekketAv = r.id;
      delete r.mulDobbel; delete r.lignerPaa;
      if(b.status === 'godkjent') Object.assign(b, { status:'sammenslatt', behandlet:naa });
    } else {
      await kopierFil(r, b);
      Object.assign(r, { status:'sammenslatt', slaattInn:b.id, behandlet:naa });
      delete b.lignerPaa;
    }
    gjort++;
  }
  await env.FAMILIE_KV.put(POST_NOKKEL, JSON.stringify(poster));
  return svar({ ok:true, gjort:gjort });
}

async function angre(env, kropp){
  const poster = await lesJson(env, POST_NOKKEL, {});
  let n = 0;
  for(const id of [].concat(kropp.ider || [])){
    const p = poster[id];
    if(!p || p.status === 'ny') continue;
    /* En automatisk foert post som angres, foeres aldri automatisk igjen. */
    if(p.auto){ p.manuell = true; delete p.auto; }
    p.status = 'ny'; delete p.behandlet; delete p.av; delete p.deler; delete p.slaattInn; n++;
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
   Trumf har bare de siste 12 maanedene.

   Laert 29. oktober 2026:
   - Innloggingen fornyes underveis (session-token i biter, `.0`, `.1`),
     og de gamle bitene slutter da aa virke. Fornyede biter i Set-Cookie
     skrives derfor tilbake (trumfFornyCookie) - ellers doer cookien etter
     en time.
   - Utlogget faar man den samme sida uten kjoepene, og ordet «kvittering»
     staar i den likevel. Om det er innloggingen eller sida som er feil,
     avgjoeres derfor av trumf.no/api/auth/getToken: `null` er utlogget.
   - Avkreftet: aa hente kjoepene fra platform-rest-prod.ngdata.no
     (/trumf/medlemskap/transaksjoner med token fra getToken), slik sidas
     skript ser ut til aa gjoere. Svarte 404 med gyldig token.

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
const TRUMF_UTLOGGET = { ok:false, kode:'innlogging', feil:'Trumf trenger ny innlogging' };

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
  await trumfFornyCookie(env, lagret, r);
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

/* Trumf fornyer innloggingen underveis: svaret kan ha nye session-token-
   biter i Set-Cookie (`.0`, `.1` …), og de gamle slutter da aa virke. Ble
   de ikke tatt vare paa, doede cookien etter en time (29. oktober). Bare
   authjs-cookiene oppdateres; en utlogging visker aldri ut det som er lagret. */
async function trumfFornyCookie(env, lagret, r){
  const nye = typeof r.headers.getSetCookie === 'function' ? r.headers.getSetCookie() : [];
  if(!nye.length) return;
  const kaker = new Map(lagret.cookie.split(/;\s*/).filter(k => k.indexOf('=') > 0).map(k => [k.slice(0, k.indexOf('=')), k.slice(k.indexOf('=') + 1)]));
  let endret = false;
  for(const s of nye){
    const forste = s.split(';')[0], i = forste.indexOf('=');
    if(i < 1) continue;
    const navn = forste.slice(0, i).trim(), verdi = forste.slice(i + 1).trim();
    if(!/authjs\./.test(navn)) continue;
    if(!verdi || /;\s*max-age=0/i.test(s) || /;\s*expires=[^;]*1970/i.test(s)){ if(kaker.delete(navn)) endret = true; }
    else if(kaker.get(navn) !== verdi){ kaker.set(navn, verdi); endret = true; }
  }
  const cookie = [...kaker].map(k => k[0] + '=' + k[1]).join('; ');
  if(!endret || !/authjs\.session-token/.test(cookie)) return;
  lagret.cookie = cookie;
  await env.FAMILIE_KV.put(TRUMF_NOKKEL, JSON.stringify(Object.assign({}, lagret, { fornyet:new Date().toISOString() })));
}
/* Er cookien fortsatt innlogget? trumf.no svarer et token, eller `null`
   naar den ikke er det. Tokenet brukes ikke og lagres aldri. */
async function trumfInnlogget(env){
  const lagret = await lesJson(env, TRUMF_NOKKEL, null);
  if(!lagret || !lagret.cookie) return false;
  const r = await fetch(TRUMF + '/api/auth/getToken', { headers:Object.assign({}, NETTLESER, { Cookie:lagret.cookie, Accept:'application/json' }), redirect:'manual' });
  await trumfFornyCookie(env, lagret, r);
  if(!r.ok) return false;
  const tekst = (await r.text()).trim();
  return tekst.length > 20 && tekst !== 'null';
}
async function trumfFeil(env, html, hva, nokkel){
  /* Ingen data: er det fordi vi ikke er innlogget, eller fordi sida er endret? */
  if(!(await trumfInnlogget(env))) return TRUMF_UTLOGGET;
  /* Hva sida faktisk var, saa feilen kan leses uten aa logge inn paa
     trumf.no selv: tittelen, stoerrelsen, Next-bitene og om noekkelen
     finnes i det hele tatt. Ingenting fra innholdet ellers. */
  const tittel = ((html.match(/<title[^>]*>([^<]{0,80})/i) || [])[1] || '').trim();
  const biter = (html.match(/self\.__next_f\.push/g) || []).length;
  const spor = 'sida «' + (tittel || 'uten tittel') + '», ' + Math.round(html.length / 1024) + ' kB, ' + biter + ' Next-biter'
    + ', «' + nokkel + '» ' + (html.indexOf(nokkel) === -1 ? 'finnes ikke' : 'finnes, men kunne ikke leses');
  return { ok:false, kode:'format', feil:'Fant ikke ' + hva + ' på trumf.no – sida er trolig endret, og koden må rettes (' + spor + ')' };
}

async function trumfListe(env, fersk){
  return medBuffer(env, 'trumf:liste', fersk, async () => {
    const s = await trumfSide(env, TRUMF_LISTE);
    if(!s.ok) return s;
    let liste = null;
    try{ liste = trumfData(s.html, 'transactionsData'); }catch(e){ liste = null; }
    if(!Array.isArray(liste)) return await trumfFeil(env, s.html, 'kjøpslista', 'transactionsData');
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
  if(!k || typeof k !== 'object') return svar(await trumfFeil(env, s.html, 'kvitteringen', 'purchaseDetails'));
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
async function trumfStatus(env, fersk){
  const lagret = await lesJson(env, TRUMF_NOKKEL, null);
  if(!lagret) return svar({ ok:true, koblet:false });
  const r = await trumfListe(env, !!fersk);
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

/* ---------- Kvitteringer fra Dropbox ----------
   Det enkleste fra telefonen: lagre skjermbildet eller PDF-en av en
   kvittering (Coop-appen, papirkvitteringer) i Dropbox (Magne, 6. november).
   Dropbox-appen har bare tilgang til sin egen mappe, «Apper/<appnavn>».
   Sida henter filene derfra naar Økonomi aapnes, Neam leser dem som
   «Legg til kvittering», og ferdige filer flyttes til «Importert» (eller
   «Ikke lest» naar Neam ikke klarte dem) - ingenting leses to ganger.

   Oppsett (gjoeres av Magne):
     1. dropbox.com/developers -> Create app -> Scoped access, App folder.
        Tillatelser: files.metadata.read, files.content.read, files.content.write.
        Redirect URI: https://neam.no/api/bank/dropbox-tilbake
     2. App key og App secret som hemmeligheter i Pages: DROPBOX_APP_KEY,
        DROPBOX_APP_SECRET. En hemmelighet tas foerst i bruk ved neste utrulling.
     3. «Koble Dropbox» i Oppsett.
   Refresh-tokenet er en innlogging og lagres som en: under `auth:bank:`,
   aldri i svar, aldri i logg. Tilgangstokenet hentes per foresporsel og
   lagres ikke. */
const DROPBOX_NOKKEL = 'auth:bank:dropbox';
const DROPBOX_TILBAKE = 'https://neam.no/api/bank/dropbox-tilbake';
const DROPBOX_TYPER = { jpg:'image/jpeg', jpeg:'image/jpeg', png:'image/png', webp:'image/webp', gif:'image/gif', heic:'image/heic', heif:'image/heif', pdf:'application/pdf' };
function dropboxOppsatt(env){ return !!(env.DROPBOX_APP_KEY && env.DROPBOX_APP_SECRET); }

async function dropboxStart(env){
  if(!dropboxOppsatt(env)) return side('Dropbox er ikke satt opp', 'DROPBOX_APP_KEY og DROPBOX_APP_SECRET mangler i Cloudflare Pages. Se Oppsett på Økonomi-sida.');
  const tilstand = b64url(crypto.getRandomValues(new Uint8Array(24)));
  await env.FAMILIE_KV.put('auth:bank:tilstand:db:' + tilstand, '1', { expirationTtl:900 });
  const q = new URLSearchParams({ client_id:env.DROPBOX_APP_KEY, response_type:'code', token_access_type:'offline', redirect_uri:DROPBOX_TILBAKE, state:tilstand });
  return Response.redirect('https://www.dropbox.com/oauth2/authorize?' + q, 302);
}
async function dropboxTilbake(env, url, epost){
  const feil = url.searchParams.get('error');
  if(feil) return side('Dropbox ble ikke koblet', 'Dropbox svarte: ' + (url.searchParams.get('error_description') || feil));
  const tilstand = url.searchParams.get('state') || '', kode = url.searchParams.get('code') || '';
  if(!tilstand || !(await env.FAMILIE_KV.get('auth:bank:tilstand:db:' + tilstand))){
    return side('Dropbox ble ikke koblet', 'Lenken er brukt eller for gammel. Start på nytt fra Oppsett.');
  }
  await env.FAMILIE_KV.delete('auth:bank:tilstand:db:' + tilstand);
  const r = await fetch('https://api.dropboxapi.com/oauth2/token', { method:'POST', headers:{ 'Content-Type':'application/x-www-form-urlencoded' },
    body:new URLSearchParams({ code:kode, grant_type:'authorization_code', redirect_uri:DROPBOX_TILBAKE, client_id:env.DROPBOX_APP_KEY, client_secret:env.DROPBOX_APP_SECRET }) });
  let d = null; try{ d = await r.json(); }catch(e){}
  if(!r.ok || !d || !d.refresh_token) return side('Dropbox ble ikke koblet', 'Dropbox svarte: ' + ((d && (d.error_description || d.error)) || 'HTTP ' + r.status));
  await env.FAMILIE_KV.put(DROPBOX_NOKKEL, JSON.stringify({ refresh:d.refresh_token, konto:d.account_id || '', koblet:new Date().toISOString(), av:epost }));
  return side('Dropbox er koblet', 'Legg kvitteringer i Dropbox-mappa «Apper» → appens mappe, så leser Neam dem neste gang Økonomi åpnes. Du kan lukke denne fanen.');
}
/* Et kortlivet tilgangstoken fra refresh-tokenet. Lagres ikke. */
async function dropboxToken(env){
  const lagret = await lesJson(env, DROPBOX_NOKKEL, null);
  if(!lagret || !lagret.refresh) return { ok:false, feil:'Dropbox er ikke koblet' };
  if(!dropboxOppsatt(env)) return { ok:false, feil:'Dropbox er ikke satt opp i Cloudflare' };
  const r = await fetch('https://api.dropboxapi.com/oauth2/token', { method:'POST', headers:{ 'Content-Type':'application/x-www-form-urlencoded' },
    body:new URLSearchParams({ grant_type:'refresh_token', refresh_token:lagret.refresh, client_id:env.DROPBOX_APP_KEY, client_secret:env.DROPBOX_APP_SECRET }) });
  let d = null; try{ d = await r.json(); }catch(e){}
  if(!r.ok || !d || !d.access_token) return { ok:false, feil:'Dropbox må kobles på nytt (' + ((d && (d.error_description || d.error)) || 'HTTP ' + r.status) + ')' };
  return { ok:true, token:d.access_token, lagret:lagret };
}
async function dropboxApi(token, sti, kropp){
  const r = await fetch('https://api.dropboxapi.com/2/' + sti, { method:'POST', headers:{ Authorization:'Bearer ' + token, 'Content-Type':'application/json' }, body:JSON.stringify(kropp) });
  let d = null; try{ d = await r.json(); }catch(e){}
  if(!r.ok) return { ok:false, status:r.status, feil:'Dropbox svarte ' + ((d && (d.error_summary || d.error)) || 'HTTP ' + r.status), data:d };
  return { ok:true, data:d };
}
async function dropboxStatus(env){
  const lagret = await lesJson(env, DROPBOX_NOKKEL, null);
  return svar({ ok:true, oppsatt:dropboxOppsatt(env), koblet:!!(lagret && lagret.refresh),
    koblet_:lagret ? lagret.koblet : undefined, av:lagret ? masker(lagret.av) : undefined, sist:lagret ? lagret.sist : undefined, feil:lagret ? lagret.feil : undefined });
}
/* Filene i appmappa (ikke undermapper). Sjekket-tiden og en eventuell feil huskes for Kilder. */
async function dropboxFiler(env){
  const t = await dropboxToken(env);
  if(!t.ok) return svar(t);
  let r = await dropboxApi(t.token, 'files/list_folder', { path:'', recursive:false });
  const filer = [];
  let runder = 0;
  while(r.ok){
    for(const e of r.data.entries || []){
      if(e['.tag'] !== 'file') continue;
      const ending = String(e.name).split('.').pop().toLowerCase();
      if(!DROPBOX_TYPER[ending] || e.size > 15e6) continue;
      filer.push({ id:e.id, navn:e.name, storrelse:e.size, type:DROPBOX_TYPER[ending], endret:e.server_modified });
    }
    if(!r.data.has_more || ++runder > 10) break;
    r = await dropboxApi(t.token, 'files/list_folder/continue', { cursor:r.data.cursor });
  }
  const lagret = Object.assign({}, t.lagret, { sist:new Date().toISOString(), feil:r.ok ? undefined : r.feil });
  await env.FAMILIE_KV.put(DROPBOX_NOKKEL, JSON.stringify(lagret));
  if(!r.ok) return svar(r);
  filer.sort((a, b) => String(a.endret).localeCompare(String(b.endret)));
  return svar({ ok:true, filer:filer.slice(0, 20), flere:filer.length > 20 });
}
async function dropboxFil(env, id){
  if(!/^id:[\w-]{1,80}$/.test(id)) return svar({ ok:false, feil:'Ugyldig fil-id' });
  const t = await dropboxToken(env);
  if(!t.ok) return svar(t);
  const r = await fetch('https://content.dropboxapi.com/2/files/download', { method:'POST', headers:{ Authorization:'Bearer ' + t.token, 'Dropbox-API-Arg':JSON.stringify({ path:id }) } });
  if(!r.ok) return svar({ ok:false, feil:'Dropbox svarte HTTP ' + r.status + ' på fila' });
  let navn = '';
  try{ navn = JSON.parse(r.headers.get('Dropbox-API-Result') || '{}').name || ''; }catch(e){}
  const type = DROPBOX_TYPER[String(navn).split('.').pop().toLowerCase()] || 'application/octet-stream';
  return new Response(r.body, { status:200, headers:{ 'Content-Type':type, 'Cache-Control':'no-store' } });
}
/* Ferdig: flyttes til «Importert», eller «Ikke lest» naar Neam ikke klarte den. */
async function dropboxFerdig(env, kropp){
  const id = String(kropp.id || ''), navn = String(kropp.navn || '').replace(/[\/\\]/g, '_').slice(0, 200);
  if(!/^id:[\w-]{1,80}$/.test(id) || !navn) return svar({ ok:false, feil:'Mangler fil' });
  const mappe = kropp.mappe === 'Ikke lest' ? 'Ikke lest' : 'Importert';
  const t = await dropboxToken(env);
  if(!t.ok) return svar(t);
  await dropboxApi(t.token, 'files/create_folder_v2', { path:'/' + mappe, autorename:false });   /* finnes den, er det greit */
  const r = await dropboxApi(t.token, 'files/move_v2', { from_path:id, to_path:'/' + mappe + '/' + navn, autorename:true });
  if(!r.ok) return svar(r);
  return svar({ ok:true, mappe:mappe });
}
/* Det som legges inn paa sida - valgt fil eller limt inn - lagres som PDF i
   «Importert», saa alle kvitteringene og regningene ligger samlet i Dropbox
   (Magne, 7. november 2026). Sida lager PDF-en; her lastes den bare opp.
   Finnes navnet, faar den nye et tall bak (autorename). */
function dropboxArg(o){
  /* Dropbox-API-Arg er en HTTP-header: bare ASCII, resten som \uXXXX. */
  return JSON.stringify(o).replace(/[\u007f-\uffff]/g, c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));
}
async function dropboxLagre(env, kropp){
  const navn = String(kropp.navn || '').replace(/[\/\\:*?"<>|\u0000-\u001f]/g, '_').trim().slice(0, 180);
  const data = kropp.data;
  if(!/\.pdf$/i.test(navn) || typeof data !== 'string' || !data || data.length > 14e6 || !/^[A-Za-z0-9+/=]+$/.test(data)) return svar({ ok:false, feil:'Mangler PDF' });
  const t = await dropboxToken(env);
  if(!t.ok) return svar(t);
  const bin = atob(data), bytes = new Uint8Array(bin.length);
  for(let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  await dropboxApi(t.token, 'files/create_folder_v2', { path:'/Importert', autorename:false });   /* finnes den, er det greit */
  const r = await fetch('https://content.dropboxapi.com/2/files/upload', { method:'POST',
    headers:{ Authorization:'Bearer ' + t.token, 'Content-Type':'application/octet-stream', 'Dropbox-API-Arg':dropboxArg({ path:'/Importert/' + navn, mode:'add', autorename:true, mute:true }) },
    body:bytes });
  let d = null;
  try{ d = await r.json(); }catch(e){}
  if(!r.ok) return svar({ ok:false, feil:'Dropbox svarte ' + ((d && (d.error_summary || d.error)) || 'HTTP ' + r.status) });
  return svar({ ok:true, navn:(d && d.name) || navn });
}
async function dropboxKobleFra(env){
  const t = await dropboxToken(env);
  if(t.ok){ try{ await fetch('https://api.dropboxapi.com/2/auth/token/revoke', { method:'POST', headers:{ Authorization:'Bearer ' + t.token } }); }catch(e){} }
  await env.FAMILIE_KV.delete(DROPBOX_NOKKEL);
  return dropboxStatus(env);
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
     ingen saldo, ingen antall. Derfor kan felles@ faa bruke den uten aa
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
  const iNettleser = sti.endsWith('/start') || sti.endsWith('/tilbake') || sti.endsWith('/dropbox-start') || sti.endsWith('/dropbox-tilbake');
  if(!v.ok) return iNettleser ? side('Ingen tilgang', v.feil) : svar(v);

  try{
    /* Dropbox foer banken: «/dropbox-start» slutter ikke paa «/start», men vaer tydelig. */
    if(sti.endsWith('/dropbox-start')) return await dropboxStart(env);
    if(sti.endsWith('/dropbox-tilbake')) return await dropboxTilbake(env, url, v.epost);
    if(sti.endsWith('/start')) return await start(env);
    if(sti.endsWith('/tilbake')) return await tilbake(env, url, v.epost);

    const hva = url.searchParams.get('hva') || 'status';
    const okt = await lesOekt(env);
    const fersk = url.searchParams.get('fersk') === '1';
    const psu = psuAv(request);
    if(hva === 'status'){
      if(!okt) return svar({ ok:true, koblet:false });
      const igjen = okt.gyldigTil ? Math.floor((Date.parse(okt.gyldigTil) - Date.now()) / 86400000) : null;
      return svar({ ok:true, koblet:true, bank:BANK.name, gyldigTil:okt.gyldigTil, dagerIgjen:igjen,
        kontoer:okt.kontoer.length, godkjentAv:masker(okt.godkjentAv), laget:okt.laget });
    }
    if(hva === 'banker') return await banker(env);
    if(hva === 'varsler') return await varsler(env, okt);
    if(hva === 'laert') return svar({ ok:true, laert:await lesJson(env, LAERT_NOKKEL, {}) });
    if(hva === 'dropbox') return await dropboxStatus(env);
    if(hva === 'dropbox-filer') return await dropboxFiler(env);
    if(hva === 'dropbox-fil') return await dropboxFil(env, url.searchParams.get('id') || '');
    if(hva === 'kvittering-fil') return await kvitteringFil(env, url.searchParams.get('id') || '', url.searchParams.get('n') || '');
    if(hva === 'post') return await postDetaljer(env, url.searchParams.get('id') || '');
    if(hva === 'kilder') return await kilder(env, okt);
    /* Trumf trenger ikke banken - den har sin egen innlogging. */
    if(hva === 'trumf') return await trumfStatus(env, fersk);
    if(hva === 'trumf-kjop'){
      const r = await trumfListe(env, fersk);
      if(!r.ok) return svar(r);
      return svar({ ok:true, hentet:r.hentet, fraBuffer:r.fraBuffer, advarsel:r.advarsel, kjop:r.data });
    }
    if(hva === 'trumf-kvittering') return await trumfKvittering(env, url.searchParams.get('id') || '');
    if(hva === 'kvittering') return await lagretKvittering(env, url.searchParams.get('id') || '');
    if(hva === 'budsjett') return await budsjett(env);
    if(hva === 'regnskap') return await regnskap(env, url.searchParams.get('mnd') || '');
    if(hva === 'foringer') return await foringer(env, url.searchParams.get('mnd') || '', url.searchParams.get('kategori') || '', url.searchParams.get('eksakt') === '1');
    if(hva === 'regnskap-aar') return await regnskapAar(env);
    if(hva === 'regningskonto') return await regningskonto(env);
    if(hva === 'alle-poster') return await allePoster(env);
    if(hva === 'formue') return await formue(env);
    if(!okt) return svar({ ok:false, feil:'Banken er ikke koblet. Åpne /api/bank/start.' });
    if(hva === 'kontoer') return await kontoer(env, okt, fersk, psu);
    if(hva === 'transaksjoner') return await transaksjoner(env, okt, url.searchParams.get('konto') || '', url.searchParams.get('fra'), fersk, psu);
    if(hva === 'innboks') return await innboks(env, okt, fersk, psu);
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
  if(kropp && kropp.hva === 'koble-alle') return await kobleAlle(env, kropp, request);
  if(kropp && kropp.hva === 'faktura-innboks') return await fakturaInnboks(env, kropp);
  if(kropp && kropp.hva === 'faktura-kategori') return await fakturaKategori(env, kropp);
  if(kropp && kropp.hva === 'post-endre') return await postEndre(env, kropp);
  if(kropp && kropp.hva === 'post-vedlegg') return await postVedlegg(env, kropp);
  if(kropp && kropp.hva === 'post-vedlegg-slett') return await postVedleggSlett(env, kropp);
  if(kropp && kropp.hva === 'regningskonto') return await lagreRegningskonto(env, kropp);
  if(kropp && kropp.hva === 'kategori-merke') return await settMerke(env, kropp);
  if(kropp && kropp.hva === 'budsjett-perioder') return await settPerioder(env, kropp);
  if(kropp && (kropp.hva === 'merke-ny' || kropp.hva === 'merke-endre' || kropp.hva === 'merke-slett')) return await endreMerkeliste(env, kropp);
  if(kropp && kropp.hva === 'laert') return await lagreLaert(env, kropp);
  if(kropp && kropp.hva === 'dropbox-ferdig') return await dropboxFerdig(env, kropp);
  if(kropp && kropp.hva === 'dropbox-lagre') return await dropboxLagre(env, kropp);
  if(kropp && kropp.hva === 'dropbox-koble-fra') return await dropboxKobleFra(env);
  if(kropp && kropp.hva === 'trumf-innlogging') return await trumfInnlogging(env, kropp, v.epost);
  if(kropp && kropp.hva === 'kvittering-ny') return await nyKvittering(env, kropp, v.epost);
  if(kropp && kropp.hva === 'budsjett') return await lagreBudsjett(env, kropp, v.epost);
  if(kropp && kropp.hva === 'formue') return await lagreFormue(env, kropp, v.epost);
  if(kropp && kropp.hva === 'forslag') return await lagreForslag(env, kropp);
  if(kropp && kropp.hva === 'kontonavn') return await lagreKontonavn(env, kropp);
  if(kropp && kropp.hva === 'kategori-ny') return await nyeKategorier(env, kropp);
  if(kropp && kropp.hva === 'kategori-slett') return await slettKategori(env, kropp);
  if(kropp && kropp.hva === 'kategori-navn') return await nyttKategoriNavn(env, kropp);
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
