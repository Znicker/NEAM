/* ============================================================
   Neam - innlogging mot Microsoft, serversiden

   Ligger i repoet som:  functions/api/ms.js
   Gir endepunktet:      /api/ms

   HVORFOR DEN FINNES
   Fram til 11. september 2026 vekslet nettleseren koden selv, mot
   en app-registrering av typen «Single-page application». Da er
   refresh-tokenet laast til 24 timers levetid, og det kan ikke
   konfigureres bort - det er Microsofts regel for SPA-er, ikke en
   innstilling. Resultatet var at alle maatte logge inn hver dag.

   Alle andre klienttyper faar 90 dager, glidende. Betingelsen er
   at vekslingen skjer med en KLIENTHEMMELIGHET, og en hemmelighet
   kan ikke ligge i en nettleser. Derfor denne fila.

   HVA DEN GJOER
     POST /api/ms  {hva:'kode',  code, verifier, redirect}
       Foerste innlogging. Veksler koden, lagrer refresh-tokenet,
       svarer med et access token.

     POST /api/ms  {hva:'forny', redirect}
       Henter refresh-tokenet fra lageret, fornyer, lagrer det nye,
       svarer med et access token. Kalles naar det gamle gaar ut.

     POST /api/ms  {hva:'ut'}
       Glemmer oekta. Brukes av «Logg ut».

   HVA NETTLESEREN ALDRI SER
   Refresh-tokenet. Det gaar inn hit og ut til Microsoft, aldri
   tilbake til sida. I dag ligger det i localStorage, lesbart for
   alt som kjoerer paa sida. Dette er altsaa ogsaa en innstramming,
   ikke bare en forlengelse.

   HVEM SPOER
   Cloudflare Access setter `Cf-Access-Authenticated-User-Email` paa
   hver forespoersel, og den er verifisert av Access - nettleseren
   kan ikke finne paa den, fordi alt maa gjennom Access foer det
   naar oss. Portvakten (functions/_middleware.js) stenger den ene
   veien utenom, `.pages.dev`.

   NOEKKELEN LIGGER UTENFOR `fh:` MED VILJE
   `/api/data` legger paa prefikset `fh:` og slipper familien til
   alt som ligger der. Refresh-tokener skal INGEN kunne lese, heller
   ikke oss selv fra en annen side. `auth:ms:<epost>` kan derfor
   ikke naas via /api/data uansett hva man ber om.
   ============================================================ */

const AUTH_BASE = 'https://login.microsoftonline.com/common/oauth2/v2.0';
const KLIENT_ID = 'ccab6959-abc2-4d09-9212-4b33c0db025c';

/* Samme sett som sidene ber om. Staar her ogsaa fordi fornyelsen
   skjer uten at nettleseren er med paa aa si hva den vil ha. */
const SCOPES = 'openid profile offline_access User.Read Calendars.Read Calendars.ReadWrite';

/* Alt svares med 200, ogsaa feil. Cloudflare bytter kroppen paa 5xx,
   og da forsvinner diagnosen - laert av /api/sjo (kartleggingen del
   20). Kallstedet leser `ok`, ikke statuskoden. */
function svar(obj){
  return new Response(JSON.stringify(obj), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}

function epostAv(request){
  const e = request.headers.get('Cf-Access-Authenticated-User-Email') || '';
  return e.trim().toLowerCase();
}

/* Adressen Microsoft skal sende brukeren tilbake til. Den kommer fra
   sida, og maa derfor kontrolleres: en ukontrollert redirect_uri gjoer
   endepunktet til et verktoey for aa sende koder et annet sted.
   Microsoft sjekker den mot de registrerte adressene ogsaa, men vi
   skal ikke vaere avhengige av at noen andre passer paa. */
function lovligRedirect(u){
  let url;
  try{ url = new URL(String(u || '')); }catch(e){ return null; }
  if(url.protocol !== 'https:') return null;
  if(url.hostname.toLowerCase() !== 'neam.no') return null;
  /* Uten spoerring og uten fragment - adressen maa vaere tegn for tegn
     lik den som ble sendt ved innloggingen, ellers avviser Microsoft. */
  return url.origin + url.pathname;
}

function nokkel(epost){ return 'auth:ms:' + epost; }

async function motMicrosoft(felter, hemmelighet){
  const kropp = new URLSearchParams(Object.assign({
    client_id: KLIENT_ID,
    client_secret: hemmelighet
  }, felter));

  const r = await fetch(AUTH_BASE + '/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: kropp
  });
  const tekst = await r.text();
  let d;
  try{ d = JSON.parse(tekst); }
  catch(e){ return { feil: 'Uventet svar fra Microsoft' }; }
  if(!r.ok){
    return { feil: d.error_description || d.error || ('Microsoft svarte ' + r.status),
             kode: d.error || '' };
  }
  return { data: d };
}

export async function onRequestPost({ request, env }){
  if(!env.MS_CLIENT_SECRET) return svar({ ok:false, feil:'MS_CLIENT_SECRET mangler' });
  if(!env.FAMILIE_KV)       return svar({ ok:false, feil:'KV ikke bundet' });

  const epost = epostAv(request);
  if(!epost) return svar({ ok:false, feil:'Ingen Access-identitet' });

  let inn;
  try{ inn = await request.json(); }
  catch(e){ return svar({ ok:false, feil:'Ugyldig JSON' }); }

  const hva = String(inn && inn.hva || '');

  /* ---------- Logg ut ---------- */
  if(hva === 'ut'){
    await env.FAMILIE_KV.delete(nokkel(epost));
    return svar({ ok:true });
  }

  /* ---------- Foerste innlogging ---------- */
  if(hva === 'kode'){
    const redirect = lovligRedirect(inn.redirect);
    if(!redirect) return svar({ ok:false, feil:'Ugyldig returadresse' });
    if(!inn.code || !inn.verifier) return svar({ ok:false, feil:'Mangler kode' });

    const r = await motMicrosoft({
      grant_type: 'authorization_code',
      code: String(inn.code),
      code_verifier: String(inn.verifier),
      redirect_uri: redirect,
      scope: SCOPES
    }, env.MS_CLIENT_SECRET);

    if(r.feil) return svar({ ok:false, feil:r.feil, kode:r.kode });

    if(r.data.refresh_token){
      await env.FAMILIE_KV.put(nokkel(epost), JSON.stringify({
        refresh: r.data.refresh_token,
        satt: Date.now()
      }));
    }
    return svar({
      ok: true,
      access_token: r.data.access_token,
      expires_in: r.data.expires_in || 3600
    });
  }

  /* ---------- Fornyelse ---------- */
  if(hva === 'forny'){
    const raa = await env.FAMILIE_KV.get(nokkel(epost));
    if(!raa) return svar({ ok:false, feil:'Ingen økt', maaLoggeInn:true });

    let lagret;
    try{ lagret = JSON.parse(raa); }
    catch(e){ return svar({ ok:false, feil:'Ingen økt', maaLoggeInn:true }); }
    if(!lagret || !lagret.refresh) return svar({ ok:false, feil:'Ingen økt', maaLoggeInn:true });

    const r = await motMicrosoft({
      grant_type: 'refresh_token',
      refresh_token: lagret.refresh,
      scope: SCOPES
    }, env.MS_CLIENT_SECRET);

    if(r.feil){
      /* Et refresh-token som er trukket tilbake eller utloept kommer
         aldri til live igjen. Da skal det ut av lageret, saa sida faar
         beskjed om aa logge inn i stedet for aa proeve i det uendelige.
         Andre feil - Microsoft nede, nettverk - roerer ingenting. */
      const doedt = ['invalid_grant', 'interaction_required', 'invalid_client']
        .indexOf(r.kode) !== -1;
      if(doedt) await env.FAMILIE_KV.delete(nokkel(epost));
      return svar({ ok:false, feil:r.feil, maaLoggeInn:doedt });
    }

    /* Microsoft gir et nytt refresh-token ved hver fornyelse, og det er
       DET som flytter 90-dagersvinduet framover. Skrives det ikke ned,
       staar vi paa startdatoen og oekta doer etter tre maaneder uansett
       hvor mye den brukes. */
    if(r.data.refresh_token){
      await env.FAMILIE_KV.put(nokkel(epost), JSON.stringify({
        refresh: r.data.refresh_token,
        satt: Date.now()
      }));
    }
    return svar({
      ok: true,
      access_token: r.data.access_token,
      expires_in: r.data.expires_in || 3600
    });
  }

  return svar({ ok:false, feil:'Ukjent hva: ' + hva });
}

/* GET brukes til én ting: si om det finnes en oekt, uten aa hente noe.
   Sida spoer ved oppstart for aa vite om den skal vise porten eller
   vente paa et token. Svarer aldri med noe av innholdet. */
export async function onRequestGet({ request, env }){
  const epost = epostAv(request);
  if(!epost || !env.FAMILIE_KV) return svar({ ok:true, oekt:false });
  const raa = await env.FAMILIE_KV.get(nokkel(epost));
  return svar({ ok:true, oekt: !!raa, epost: epost });
}

export async function onRequest({ request }){
  return svar({ ok:false, feil:'Bruk GET eller POST', metode: request.method });
}
