/* ============================================================
   Neam – pinkodene på kjøkkenskjermen (Cloudflare Pages Function)

   Ligger i repoet som:  functions/api/pin.js
   Gir endepunktet:      /api/pin

   HVORFOR DEN FINNES
   Kjøkkenskjermen er alltid logget inn som felles@. Den som står
   foran den, taster sin egen sekssifrede kode, og skjermen vet da
   hvem det er (Magne, 8. november 2026: «alle har sin egen ...
   pinkode. taster man sin kode åpnes sin bruker»). Kodene er ikke
   superhemmelige – barna velger dem selv og gir dem til sys@, som
   legger dem inn.

     GET  /api/pin                         -> { ok, personer:[{ id, navn, harKode }] }   bare sys@
     POST /api/pin { hva:'sett', hvem, kode }                                             bare sys@
     POST /api/pin { hva:'fjern', hvem }                                                  bare sys@
     POST /api/pin { hva:'sjekk', kode }   -> { ok, hvem, navn } | { ok:false, feil, laast }
     POST /api/pin { hva:'vaaken', igjen? } -> { ok }   holder oekta paa serveren i live
     POST /api/pin { hva:'glem' }           -> { ok }   skjermen sovnet: oekta slettes

   HVEM SOM SPØR
   Identiteten er Microsoft-innloggingen, lest med tokenet sida sender
   (Authorization: Bearer). Det er den samme kontoen sida selv vet om –
   Access-identiteten kan være en annen på samme maskin (se homey.js).

   NØKLER I KV – UTENFOR `fh:` MED VILJE
     pin:koder  – { <id>: { salt, hash, satt } }
     pin:feil   – { antall, til } – bremsen mot gjetting
     pin:okt:<id> – { hvem, epost, sist, til } – oekta etter riktig kode
   `/api/data` slipper alle innloggede til alt under `fh:`. Seks sifre er
   bare en million muligheter, så en hash som kan leses derfra, er så
   godt som koden selv. Samme grep som `auth:` (kartleggingen del 30).

   ØKTA PÅ SERVEREN (8. november 2026)
   Magne: «Det er kun nina og magne som kan komme inn på økonomi med
   sin pin.» Sperra i nettleseren holder barna unna leksene, men ikke
   unna penger, så riktig kode gir ogsaa en oekt her: en tilfeldig id i
   kaka `neam_pin` (HttpOnly, bare /api) og personen i KV. Bank-
   funksjonen leser den og slipper fellesenheten inn naar oekta er
   Magnes eller Ninas. Oekta foelger skjermens regel: tre minutter uten
   trykk, eller tiden valgt fra laaseikonet. Nettleseren melder trykk
   (`vaaken`, hoeyst hvert minutt) og sier fra naar skjermen sovner
   (`glem`); da slettes kaka, saa neste kall er uten oekt med en gang.

   Alt svares med 200, også feil – kallstedet leser `ok`.
   ============================================================ */

const ADMIN = 'sys@neam.no';
const PERSONER = [
  { id:'magne',  navn:'Magne'  },
  { id:'nina',   navn:'Nina'   },
  { id:'emma',   navn:'Emma'   },
  { id:'andrea', navn:'Andrea' }
];
const KODER = 'pin:koder';
const FEIL = 'pin:feil';
const MAKS_FEIL = 5;
const LAAS_MS = 60 * 1000;
const OKT = 'pin:okt:';
const OKT_KAKE = 'neam_pin';
/* Tre minutter som paa skjermen, pluss ett for pingen som gaar hvert minutt. */
const OKT_HVILE_MS = 4 * 60 * 1000;
/* Lengste aapningstid fra laaseikonet er én time; mer enn det godtas ikke. */
const OKT_MAKS_MS = 60 * 60 * 1000;

function svar(obj, kake){
  const headers = { 'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store' };
  if(kake) headers['Set-Cookie'] = kake;
  return new Response(JSON.stringify(obj), { status: 200, headers });
}
function oktKake(id){
  return OKT_KAKE + '=' + (id || '') + '; Path=/api; HttpOnly; Secure; SameSite=Strict' + (id ? '' : '; Max-Age=0');
}
function kakeAv(request, navn){
  const raa = request.headers.get('Cookie') || '';
  for(const bit of raa.split(';')){
    const i = bit.indexOf('=');
    if(i !== -1 && bit.slice(0, i).trim() === navn) return bit.slice(i + 1).trim();
  }
  return '';
}
/* Samme regel som i bank-funksjonen (oktGyldig der). */
function oktGyldig(o, naa){
  if(!o) return false;
  return o.til ? naa < o.til : naa - (o.sist || 0) <= OKT_HVILE_MS;
}

async function hvemSpor(request){
  const auth = request.headers.get('Authorization') || '';
  if(!auth.startsWith('Bearer ')) return '';
  try{
    const r = await fetch('https://graph.microsoft.com/v1.0/me?$select=mail,userPrincipalName', {
      headers: { Authorization: auth }
    });
    if(!r.ok) return '';
    const me = await r.json();
    return String(me.mail || me.userPrincipalName || '').trim().toLowerCase();
  }catch(e){ return ''; }
}

async function lesJson(env, nokkel, tom){
  try{
    const raa = await env.FAMILIE_KV.get(nokkel);
    return raa ? JSON.parse(raa) : tom;
  }catch(e){ return tom; }
}

function hex(buf){
  return Array.from(new Uint8Array(buf), b => ('0' + b.toString(16)).slice(-2)).join('');
}
async function hashAv(salt, kode){
  return hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(salt + ':' + kode)));
}

/* Seks sifre. Ikke samme siffer seks ganger, og ikke en rekke opp eller
   ned (123456, 654321, 345678 ...). */
function kodeFeil(kode){
  if(!/^[0-9]{6}$/.test(kode)) return 'Koden må være seks sifre.';
  if(/^(\d)\1{5}$/.test(kode)) return 'Samme siffer seks ganger er ikke lov.';
  let opp = true, ned = true;
  for(let i = 1; i < 6; i++){
    const d = kode.charCodeAt(i) - kode.charCodeAt(i - 1);
    if(d !== 1) opp = false;
    if(d !== -1) ned = false;
  }
  if(opp || ned) return 'En rekke som 123456 er ikke lov.';
  return '';
}

async function finnEier(koder, kode){
  for(const p of PERSONER){
    const k = koder[p.id];
    if(k && k.salt && k.hash && (await hashAv(k.salt, kode)) === k.hash) return p;
  }
  return null;
}

export async function onRequestGet({ request, env }){
  if(!env.FAMILIE_KV) return svar({ ok:false, feil:'KV ikke bundet (FAMILIE_KV mangler)' });
  const epost = await hvemSpor(request);
  if(epost !== ADMIN) return svar({ ok:false, feil:'Bare administratoren kan se pinkodene.' });
  const koder = await lesJson(env, KODER, {});
  return svar({ ok:true, personer: PERSONER.map(p => ({
    id:p.id, navn:p.navn, harKode: !!(koder[p.id] && koder[p.id].hash), satt: (koder[p.id] && koder[p.id].satt) || null
  })) });
}

export async function onRequestPost({ request, env }){
  if(!env.FAMILIE_KV) return svar({ ok:false, feil:'KV ikke bundet (FAMILIE_KV mangler)' });
  let k;
  try{ k = await request.json(); }catch(e){ return svar({ ok:false, feil:'Ugyldig forespørsel' }); }
  const hva = String((k && k.hva) || '');
  const epost = await hvemSpor(request);
  if(!epost) return svar({ ok:false, feil:'Ingen gyldig Microsoft-innlogging' });

  if(hva === 'sjekk'){
    const naa = Date.now();
    const brems = await lesJson(env, FEIL, { antall:0, til:0 });
    if(brems.til && brems.til > naa){
      return svar({ ok:false, feil:'For mange feil. Vent litt.', laast: Math.ceil((brems.til - naa) / 1000) });
    }
    const kode = String(k.kode || '');
    const eier = /^[0-9]{6}$/.test(kode) ? await finnEier(await lesJson(env, KODER, {}), kode) : null;
    if(!eier){
      const antall = (brems.til && brems.til <= naa ? 0 : (brems.antall || 0)) + 1;
      const ny = antall >= MAKS_FEIL ? { antall:0, til: naa + LAAS_MS } : { antall, til:0 };
      await env.FAMILIE_KV.put(FEIL, JSON.stringify(ny));
      return svar({ ok:false, feil:'Feil kode', laast: ny.til ? Math.ceil(LAAS_MS / 1000) : 0 });
    }
    if(brems.antall) await env.FAMILIE_KV.put(FEIL, JSON.stringify({ antall:0, til:0 }));
    const gammel = kakeAv(request, OKT_KAKE);
    if(/^[0-9a-f]{48}$/.test(gammel)) await env.FAMILIE_KV.delete(OKT + gammel);
    const id = hex(crypto.getRandomValues(new Uint8Array(24)));
    await env.FAMILIE_KV.put(OKT + id, JSON.stringify({ hvem:eier.id, epost, sist:naa, til:0 }),
                             { expirationTtl: Math.ceil(OKT_MAKS_MS / 1000) + 300 });
    return svar({ ok:true, hvem:eier.id, navn:eier.navn }, oktKake(id));
  }

  if(hva === 'vaaken' || hva === 'glem'){
    const id = kakeAv(request, OKT_KAKE);
    if(!/^[0-9a-f]{48}$/.test(id)) return svar({ ok:false, feil:'Ingen økt' }, id ? oktKake('') : '');
    const naa = Date.now();
    const o = hva === 'vaaken' ? await lesJson(env, OKT + id, null) : null;
    if(!oktGyldig(o, naa)){
      await env.FAMILIE_KV.delete(OKT + id);
      return svar(hva === 'glem' ? { ok:true } : { ok:false, feil:'Økta er ute' }, oktKake(''));
    }
    o.sist = naa;
    if(k.igjen !== undefined){
      const igjen = Number(k.igjen) || 0;
      o.til = igjen > 0 ? naa + Math.min(igjen, OKT_MAKS_MS) : 0;
    }
    await env.FAMILIE_KV.put(OKT + id, JSON.stringify(o), { expirationTtl: Math.ceil(OKT_MAKS_MS / 1000) + 300 });
    return svar({ ok:true });
  }

  if(epost !== ADMIN) return svar({ ok:false, feil:'Bare administratoren kan endre pinkodene.' });
  const person = PERSONER.filter(p => p.id === String(k.hvem || ''))[0];
  if(!person) return svar({ ok:false, feil:'Ukjent person' });
  const koder = await lesJson(env, KODER, {});

  if(hva === 'fjern'){
    delete koder[person.id];
    await env.FAMILIE_KV.put(KODER, JSON.stringify(koder));
    return svar({ ok:true });
  }

  if(hva === 'sett'){
    const kode = String(k.kode || '');
    const galt = kodeFeil(kode);
    if(galt) return svar({ ok:false, feil:galt });
    const eier = await finnEier(koder, kode);
    if(eier && eier.id !== person.id) return svar({ ok:false, feil:eier.navn + ' har den koden.' });
    const salt = hex(crypto.getRandomValues(new Uint8Array(16)));
    koder[person.id] = { salt, hash: await hashAv(salt, kode), satt: new Date().toISOString() };
    await env.FAMILIE_KV.put(KODER, JSON.stringify(koder));
    return svar({ ok:true });
  }

  return svar({ ok:false, feil:'Ukjent handling' });
}

export async function onRequest(context){
  const m = context.request.method;
  if(m === 'GET') return onRequestGet(context);
  if(m === 'POST') return onRequestPost(context);
  return svar({ ok:false, feil:'Bruk GET eller POST' });
}
