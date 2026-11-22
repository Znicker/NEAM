/* ============================================================
   /api/yr - vaermeldingen fra yr.no (MET Norge)
   ------------------------------------------------------------
   Cloudflare Pages Function. Ligger i repoet som
   functions/api/yr.js og svarer paa /api/yr?lat=..&lon=..

   Laget 22. november 2026 (Magne: «Lag en egen boks der det står
   YR.no med en liten illustrasjon. Når man trykker kan vi få en
   utvidet utgave av været.»).

   HVORFOR SERVERSIDEN: MET Norge krever at hver klient sier hvem den
   er i User-Agent, og det kan ikke en nettleser sette. Svaret
   mellomlagres en halvtime hos Cloudflare, saa skjermene i huset ikke
   spoer api.met.no hver gang de vaakner (MET ber om det).

   HVA DEN GIR (kortet ned fra locationforecast/2.0/compact):
     { ok:true, oppdatert:"2026-11-22T19:28:27Z",
       tider:[ { t:"2026-11-22T19:00:00Z", temp:0.4, vind:3.8, retning:334,
                 fukt:64.3, sym1:"clearsky_night", mm1:0,
                 sym6:"...", mm6:0, sym12:"..." }, ... ] }
   eller { feil:"..." } - alltid 200, se kartleggingen om 502.

   Dataene er CC BY 4.0 fra MET Norge - kreditt staar i vaerboblen.
   ============================================================ */

const KILDE = 'https://api.met.no/weatherapi/locationforecast/2.0/compact';
/* Hvem vi er, slik MET ber om: appnavn og en adresse. Ingen personer. */
const UA = 'neam.no husapp https://neam.no';

function svar(obj){
  return new Response(JSON.stringify(obj), {
    status: 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
  });
}

/* MET vil ha hoeyst fire desimaler; tre (ca. 100 m) gir samme svar til
   alle skjermene i huset, og dermed samme mellomlagring. */
function koord(v, min, max){
  if(v === null || String(v).trim() === '') return null;
  const t = Number(v);
  if(!isFinite(t) || t < min || t > max) return null;
  return Math.round(t * 1000) / 1000;
}

export async function onRequest(context){
  const inn = new URL(context.request.url);
  const lat = koord(inn.searchParams.get('lat'), -90, 90);
  const lon = koord(inn.searchParams.get('lon'), -180, 180);
  if(lat === null || lon === null) return svar({ feil:'Mangler lat og lon.' });
  try{
    const r = await fetch(KILDE + '?lat=' + lat + '&lon=' + lon, {
      headers: { 'User-Agent': UA, 'Accept': 'application/json' },
      cf: { cacheTtl: 1800, cacheEverything: true }
    });
    if(!r.ok) return svar({ feil:'api.met.no svarte ' + r.status + '.' });
    const d = await r.json();
    const p = (d && d.properties) || {};
    const tider = (p.timeseries || []).map(function(x){
      const da = x.data || {};
      const i = (da.instant && da.instant.details) || {};
      const n1 = da.next_1_hours || {}, n6 = da.next_6_hours || {}, n12 = da.next_12_hours || {};
      const sym = function(n){ return (n.summary && n.summary.symbol_code) || null; };
      const mm = function(n){ return (n.details && typeof n.details.precipitation_amount === 'number') ? n.details.precipitation_amount : null; };
      return {
        t: x.time, temp: i.air_temperature, vind: i.wind_speed, retning: i.wind_from_direction,
        fukt: i.relative_humidity, sym1: sym(n1), mm1: mm(n1), sym6: sym(n6), mm6: mm(n6), sym12: sym(n12)
      };
    });
    if(!tider.length) return svar({ feil:'Tomt svar fra api.met.no.' });
    return svar({ ok:true, oppdatert: (p.meta && p.meta.updated_at) || null, tider: tider });
  }catch(e){
    return svar({ feil: (e && e.message) || 'Noe gikk galt.' });
  }
}
