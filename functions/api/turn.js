/* ============================================================
   /api/turn - reiseveien for kamerabildet utenfor hjemmenettet
   ------------------------------------------------------------
   Laget 28. oktober 2026.

   HVORFOR: kamerabildet gaar DIREKTE mellom nettleseren og Homey
   (WebRTC - se sikkerhet.html og kartleggingen del 32). Hjemme ser de
   hverandre paa nettet. Ute maa forbindelsen gjennom to rutere, og paa
   5G og mange andre nett slipper de ikke en direkte forbindelse
   gjennom. Da trengs en TURN-server som sender bildet videre.

   Homey har ingen: Magne proevde kameraet i my.homey.app paa 5G
   28. oktober 2026, og det kom ikke bilde der heller. Vi bruker
   Cloudflares TURN.

   HVA DENNE GJOER: lager kortlivede paaloggingsdetaljer til TURN-
   serveren, og gir dem til sida. Selve noekkelen forlater aldri
   Cloudflare. Detaljene skal ikke logges eller lagres noe sted.

   HJEMME BRUKES DEN IKKE: nettleseren velger den direkte veien naar
   den finnes, og TURN koster bare det som faktisk sendes gjennom den.

   Hemmeligheter i Cloudflare (Pages -> Settings -> Variables and
   Secrets): TURN_KEY_ID og TURN_KEY_API_TOKEN. Tas i bruk ved neste
   utrulling.

   Svarer alltid 200 - med {ok:false, feil} naar noe er galt, aldri
   502 (Pages viser ikke diagnosen da). Sida faller tilbake paa STUN
   alene, slik den virket foer.
   ============================================================ */

/* Hvor lenge detaljene virker. Lengre enn noen ser paa kameraet i ett
   strekk; sida henter nye hver gang den kobler opp. */
const TTL = 4 * 3600;

function svar(obj){
  return new Response(JSON.stringify(obj), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}

/* Access gir identiteten paa tre maater - samme som homey.js; se ms.js
   for hvorfor alle tre trengs. */
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

/* Port 53 stenges av nettleserne. Homey tar ikke imot kandidater
   etterpaa (ingen trickle), saa sida venter paa alle foer tilbudet
   sendes - en adresse som aldri svarer ville bare spist av ventetiden. */
function utenPort53(servere){
  return (servere || []).map(function(s){
    const urls = [].concat(s.urls || []).filter(function(u){ return !/:53(\?|$)/.test(u); });
    return Object.assign({}, s, { urls: urls });
  }).filter(function(s){ return s.urls.length; });
}

export async function onRequestGet({ request, env }){
  if(!epostAv(request)) return svar({ ok:false, feil:'Ingen Access-identitet' });
  if(!env.TURN_KEY_ID || !env.TURN_KEY_API_TOKEN){
    return svar({ ok:false, mangler:true, feil:'TURN_KEY_ID eller TURN_KEY_API_TOKEN mangler i Cloudflare' });
  }

  let r;
  try{
    r = await fetch('https://rtc.live.cloudflare.com/v1/turn/keys/'
                    + encodeURIComponent(env.TURN_KEY_ID) + '/credentials/generate-ice-servers', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + env.TURN_KEY_API_TOKEN,
                 'Content-Type': 'application/json' },
      body: JSON.stringify({ ttl: TTL })
    });
  }catch(e){
    return svar({ ok:false, feil:'Fikk ikke kontakt med Cloudflare TURN' });
  }

  const tekst = await r.text();
  if(!r.ok) return svar({ ok:false, feil:'Cloudflare TURN svarte ' + r.status + (tekst ? ': ' + tekst.slice(0, 200) : '') });

  let d = null;
  try{ d = JSON.parse(tekst); }catch(e){}
  const servere = utenPort53(d && d.iceServers);
  if(!servere.length) return svar({ ok:false, feil:'Cloudflare TURN svarte uten servere' });
  return svar({ ok:true, iceServers: servere });
}

export async function onRequest({ request }){
  return svar({ ok:false, feil:'Bruk GET', metode: request.method });
}
