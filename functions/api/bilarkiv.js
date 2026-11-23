/* ============================================================
   Neam – bilarkivet (Cloudflare Pages Function)

   Ligger i repoet som:  functions/api/bilarkiv.js
   Gir endepunktet:      /api/bilarkiv

   HVORFOR DEN FINNES
   Bilvakta paa Kjoekken dash (dashboard.html) tar to stillbilder naar
   en bil kommer. Magne, 23. november 2026: «jeg tenker også at vi må ha
   et lite arkiv her. kan vi ta vare på de bildene med biler i neam
   sikkerhet?» Arkivet viser de to siste bilene (begge bildene) og en
   liste over alle bilene den siste maaneden, i Neam Sikkerhet.

     GET  /api/bilarkiv                       -> { ok, liste:[{ id, tid, soppel, kvittert, bilder }] }  nyeste foerst
     GET  /api/bilarkiv?bilde=<id>&n=<0|1>    -> image/jpeg
     POST /api/bilarkiv { hva:'lagre', bilder:[dataUrl, dataUrl], soppel, bevegelse }
                                              -> { ok, id, dobbel }
     POST /api/bilarkiv { hva:'kvitter' }     -> { ok }   alle bilene er sett
     POST /api/bilarkiv { hva:'nei', bilder } -> { ok }   det siste NEI-paret (bilvakta)
     GET  /api/bilarkiv?nei=info              -> { ok, tid }
     GET  /api/bilarkiv?nei=<0|1>             -> image/jpeg

   NEI-PARET (23. november 2026)
   Bilvakta lagrer de to bildene fra siste test der Haiku svarte NEI, saa
   en bil som ikke ble funnet kan sees i ettertid. Ett par, overskrives
   hver gang, og KV sletter det selv etter et doegn.

   SAMME BIL TO GANGER
   Hver aapen Kjoekken dash kjoerer sin egen bilvakt. Samme bevegelse
   (Homeys `lastUpdated`) eller en bil innen DOBBEL_MS etter forrige er
   samme bil, og lagres ikke paa nytt.

   KVITTERT
   En bil er ukvittert til noen lukker varselet paa dashen eller aapner
   arkivet. Dashen viser Sikkerhet-ikonet med roed ring ved klokka saa
   lenge en bil er ukvittert og varselet har lukket seg selv.

   NOEKLER I KV
     bilarkiv:liste           – lista, uten bildene
     bilarkiv:bilde:<id>:<n>  – bildet som base64-JPEG, slettes av KV
                                selv etter VARER_S
   Utenfor `fh:`: bildene skal ikke ligge i det `/api/data` deler ut.

   Alt svares med 200, også feil – kallstedet leser `ok`.
   ============================================================ */

const LISTE = 'bilarkiv:liste';
const BILDE = 'bilarkiv:bilde:';
/* En maaned, og litt til for at lista og bildene skal gaa ut samtidig. */
const VARER_MS = 31 * 24 * 3600 * 1000;
const VARER_S = 32 * 24 * 3600;
const DOBBEL_MS = 45 * 1000;
const MAKS_BILDE = 1.5 * 1024 * 1024;   /* base64-tegn per bilde */
const JPEG = 'data:image/jpeg;base64,';
const NEI = 'bilarkiv:nei';
const NEI_S = 24 * 3600;

function svar(obj){
  return new Response(JSON.stringify(obj), { status:200,
    headers:{ 'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store' } });
}

async function lesListe(env){
  try{
    const raa = await env.FAMILIE_KV.get(LISTE);
    const l = raa ? JSON.parse(raa) : [];
    return Array.isArray(l) ? l : [];
  }catch(e){ return []; }
}
function fersk(liste){
  const grense = Date.now() - VARER_MS;
  return liste.filter(function(x){ return x && x.tid >= grense; });
}

export async function onRequestGet({ request, env }){
  if(!env.FAMILIE_KV) return svar({ ok:false, feil:'KV ikke bundet (FAMILIE_KV mangler)' });
  const url = new URL(request.url);
  const nei = url.searchParams.get('nei');
  if(nei){
    let p = null;
    try{ p = JSON.parse(await env.FAMILIE_KV.get(NEI) || 'null'); }catch(e){}
    if(!p) return svar({ ok:false, feil:'Ingen NEI-bilder siste døgn' });
    if(nei === 'info') return svar({ ok:true, tid:p.tid, bilder:(p.bilder || []).length });
    const b64 = (p.bilder || [])[nei === '1' ? 1 : 0];
    if(!b64) return svar({ ok:false, feil:'Bildet finnes ikke' });
    const bin = atob(b64), u8 = new Uint8Array(bin.length);
    for(let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    return new Response(u8, { status:200, headers:{ 'Content-Type':'image/jpeg', 'Cache-Control':'no-store' } });
  }
  const id = url.searchParams.get('bilde');
  if(id){
    const n = url.searchParams.get('n') === '1' ? 1 : 0;
    if(!/^[0-9a-z]{6,40}$/.test(id)) return svar({ ok:false, feil:'Ugyldig id' });
    const b64 = await env.FAMILIE_KV.get(BILDE + id + ':' + n);
    if(!b64) return svar({ ok:false, feil:'Bildet finnes ikke lenger' });
    const bin = atob(b64);
    const u8 = new Uint8Array(bin.length);
    for(let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    /* Id-en er ny for hver bil, saa bildet bak en adresse endres aldri. */
    return new Response(u8, { status:200, headers:{ 'Content-Type':'image/jpeg',
      'Cache-Control':'private, max-age=2764800, immutable' } });
  }
  const liste = fersk(await lesListe(env)).sort(function(a, b){ return b.tid - a.tid; });
  return svar({ ok:true, liste: liste.map(function(x){
    return { id:x.id, tid:x.tid, soppel:!!x.soppel, kvittert:!!x.kvittert, bilder:x.bilder || 1 };
  }) });
}

export async function onRequestPost({ request, env }){
  if(!env.FAMILIE_KV) return svar({ ok:false, feil:'KV ikke bundet (FAMILIE_KV mangler)' });
  let k;
  try{ k = await request.json(); }catch(e){ return svar({ ok:false, feil:'Ugyldig forespørsel' }); }
  const hva = String((k && k.hva) || '');

  if(hva === 'kvitter'){
    const liste = await lesListe(env);
    if(liste.some(function(x){ return !x.kvittert; })){
      await env.FAMILIE_KV.put(LISTE, JSON.stringify(fersk(liste).map(function(x){
        return Object.assign({}, x, { kvittert:true });
      })));
    }
    return svar({ ok:true });
  }

  if(hva === 'nei'){
    const bilder = (Array.isArray(k.bilder) ? k.bilder : []).slice(0, 2).filter(function(b){
      return typeof b === 'string' && b.indexOf(JPEG) === 0 && b.length - JPEG.length <= MAKS_BILDE;
    }).map(function(b){ return b.slice(JPEG.length); });
    if(!bilder.length) return svar({ ok:false, feil:'Ingen bilder' });
    await env.FAMILIE_KV.put(NEI, JSON.stringify({ tid:Date.now(), bilder }), { expirationTtl: NEI_S });
    return svar({ ok:true });
  }

  if(hva === 'lagre'){
    const bilder = (Array.isArray(k.bilder) ? k.bilder : []).slice(0, 2).filter(function(b){
      return typeof b === 'string' && b.indexOf(JPEG) === 0 && b.length - JPEG.length <= MAKS_BILDE;
    }).map(function(b){ return b.slice(JPEG.length); });
    if(!bilder.length) return svar({ ok:false, feil:'Ingen bilder' });
    const naa = Date.now();
    const bevegelse = k.bevegelse ? String(k.bevegelse).slice(0, 40) : '';
    const liste = fersk(await lesListe(env));
    const dobbel = liste.filter(function(x){
      return (bevegelse && x.bevegelse === bevegelse) || Math.abs(naa - x.tid) < DOBBEL_MS;
    })[0];
    if(dobbel){
      /* En skjerm saa en soeppelbil der den andre saa en bil - da er det en soeppelbil. */
      if(k.soppel && !dobbel.soppel){
        dobbel.soppel = true;
        await env.FAMILIE_KV.put(LISTE, JSON.stringify(liste));
      }
      return svar({ ok:true, id:dobbel.id, dobbel:true });
    }
    const id = naa.toString(36) + Math.random().toString(36).slice(2, 8);
    for(let n = 0; n < bilder.length; n++){
      await env.FAMILIE_KV.put(BILDE + id + ':' + n, bilder[n], { expirationTtl: VARER_S });
    }
    liste.push({ id, tid:naa, soppel:!!k.soppel, kvittert:false, bilder:bilder.length, bevegelse });
    await env.FAMILIE_KV.put(LISTE, JSON.stringify(liste));
    return svar({ ok:true, id, dobbel:false });
  }

  return svar({ ok:false, feil:'Ukjent handling' });
}

export async function onRequest(context){
  const m = context.request.method;
  if(m === 'GET') return onRequestGet(context);
  if(m === 'POST') return onRequestPost(context);
  return svar({ ok:false, feil:'Bruk GET eller POST' });
}
