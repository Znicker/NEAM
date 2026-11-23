/* ============================================================
   felles-topp.js - topplinja, lik paa alle sidene
   ------------------------------------------------------------
   Fra 8. november 2026. Sidas ikon og navn (lenke til forsiden),
   laaseikonet paa fellesenhetene, Inne og Ute (Netatmo via Homey) med
   maalerne bak et trykk, Sjø med alle dybdene, yr.no med vaerboblen
   (der det er plass), og
   klapptavla med dato - og til venstre for den alarmene, nedtellingene
   og stoppeklokkene som gaar.

   Bruk: et tomt element der toppen skal staa,
     <header class="ntp" id="neamTopp" data-ikon="sikkerhet" data-navn="Sikkerhet"></header>
   og fila lastet ETTER felles-neam.js (klapptavla, ikonene og laasen
   kommer derfra). data-hjem setter hvor ikonet lenker (spillene gaar
   tilbake til dashet sitt); uten den gaar et trykk til forsiden,
   se ntpMerkeTrykk(). Tomt data-navn gir bare
   ikonet. Toppen tegnes med en gang fila leses.

   Vaeret viser i dag. En side som blar i dager (dashene) setter
   window.ntpVaerDag = function(){ return <Date> } og kaller
   ntpVaerTegn() naar dagen skifter - da foelger vaeret og vaerboblen
   den dagen.

   Posisjonen deles med dashene (fh_pos i localStorage): spurt én gang,
   husket etterpaa. Uten svar staar Arendal.

   Matlagingen (oppskrifter.html) legger «neam-matlaging» i localStorage
   mens retter lages - et oppslag {<oppskrifts-id>: {...}}, flere samtidig.
   Da staar et matlagingsikon per rett til venstre for klokka, med en ring
   som gaar rundt og tiden som har gaatt, og hvert leder tilbake til sin rett.
   ============================================================ */

/* Stedet vaeret gjelder (Magne, 22. november 2026: «gjerne der man er (om
   det er nøyaktig nok) skal bli ospefjell her»): skjermens posisjon naar
   den er noeyaktig nok, og Ospefjell hjemme - innenfor NTP_HJEM_M fra
   Ospefjell brukes Ospefjell selv, med yr.no sine koordinater (sted
   1-2359843), saa varselet er det samme som paa yr. Uten posisjon, eller
   med en som er for grov, er det ogsaa Ospefjell - foer var det Arendal. */
const NTP_STED = { lat: 58.4968, lon: 8.8975, navn: 'Ospefjell' };
const NTP_HJEM_M = 2000;          /* saa naer hjemme er hjemme */
const NTP_GROV_M = 5000;          /* posisjon grovere enn dette brukes ikke */
const NTP_DAGER = ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag'];
const NTP_MND = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august',
  'september', 'oktober', 'november', 'desember'];
/* yr.no sine symbolkoder (uten _day/_night/_polartwilight) som en liten
   illustrasjon og et ord. «...andthunder» faar tordenskyen. */
const NTP_YR = {
  clearsky:['☀️','Klarvær'], fair:['🌤️','Lettskyet'], partlycloudy:['⛅','Delvis skyet'],
  cloudy:['☁️','Skyet'], fog:['🌫️','Tåke'],
  lightrain:['🌦️','Lett regn'], rain:['🌧️','Regn'], heavyrain:['🌧️','Kraftig regn'],
  lightrainshowers:['🌦️','Lette regnbyger'], rainshowers:['🌦️','Regnbyger'], heavyrainshowers:['🌧️','Kraftige regnbyger'],
  lightsleet:['🌨️','Lett sludd'], sleet:['🌨️','Sludd'], heavysleet:['🌨️','Kraftig sludd'],
  lightsleetshowers:['🌨️','Lette sluddbyger'], sleetshowers:['🌨️','Sluddbyger'], heavysleetshowers:['🌨️','Kraftige sluddbyger'],
  lightsnow:['🌨️','Lett snø'], snow:['❄️','Snø'], heavysnow:['❄️','Kraftig snø'],
  lightsnowshowers:['🌨️','Lette snøbyger'], snowshowers:['🌨️','Snøbyger'], heavysnowshowers:['❄️','Kraftige snøbyger']
};
/* Vaeret hentes paa nytt naar det er eldre enn dette. */
const NTP_VAER_MAKS = 15 * 60000;

let ntpPos = { lat: NTP_STED.lat, lon: NTP_STED.lon, navn: NTP_STED.navn };
/* Avstand i meter (godt nok paa denne skalaen). */
function ntpAvstand(a, b){
  const r = Math.PI / 180, x = (b.lon - a.lon) * r * Math.cos((a.lat + b.lat) / 2 * r), y = (b.lat - a.lat) * r;
  return Math.sqrt(x * x + y * y) * 6371000;
}
/* Naer hjemme er Ospefjell. */
function ntpHjemme(p){
  return ntpAvstand(p, NTP_STED) <= NTP_HJEM_M ? { lat:NTP_STED.lat, lon:NTP_STED.lon, navn:NTP_STED.navn } : p;
}
let ntpVaerHentet = 0;
let ntpVaerData = null;

function ntpEsc(s){
  return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
    return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
  });
}
function ntpTo(n){ return String(n).padStart(2, '0'); }
function ntpDatoNokkel(d){ return d.getFullYear() + '-' + ntpTo(d.getMonth() + 1) + '-' + ntpTo(d.getDate()); }

function ntpTegn(){
  const t = document.getElementById('neamTopp');
  if(!t || t.dataset.klar) return;
  t.dataset.klar = '1';
  const ikon = t.dataset.ikon || 'neam';
  const navn = t.hasAttribute('data-navn') ? t.dataset.navn : 'Neam';
  const hjem = t.dataset.hjem || '/';
  /* Ikonet hentes som paa resten av sidene, med IKON_V fra felles-neam.js. */
  const bilde = (typeof neamIkonImg === 'function')
    ? neamIkonImg(ikon)
    : '<img class="ikon-flis" src="/bilder/ikoner/' + ntpEsc(ikon) + '.png" alt="">';
  /* Raden ligger i en egen boks, saa CSS-en kan maale bredden toppen faar
     (container query) og ikke bredden paa skjermen - Handleliste staar i
     en smal spalte ogsaa paa PC. */
  t.innerHTML = '<div class="ntp-rad">'
    + '<a class="ntp-merke" href="' + ntpEsc(hjem) + '" aria-label="' + ntpEsc(navn || 'Neam')
    +   (hjem === '/' ? ' – til forsiden' : ' – tilbake') + '">'
    +   '<span class="ntp-ikon">' + bilde + '</span>'
    +   (navn ? '<span class="ikon-navn ntp-navn">' + ntpEsc(navn) + '</span>' : '')
    + '</a>'
    /* Laaseikonet fylles og vises av felles-neam.js, bare paa fellesenhetene. */
    + '<button type="button" class="neam-laas" id="neamLaas" hidden></button>'
    /* Stedet staar inntil vaeret (Magne, 8. november 2026) - det gir plass
       til timerne under klokka. */
    + '<div class="ntp-vaer" id="ntpVaer" hidden></div>'
    /* Matlagingen som gaar: til venstre for klokka, med en ring som gaar
       rundt (Magne, 8. november 2026). Fylles av ntpMatIkon(). */
    + '<div class="ntp-matrad" id="ntpMat" hidden></div>'
    /* Oekonomien: ikonet med roed prikk naar noe venter i innboksen. Fylles av ntpOkTegn(). */
    + '<div class="ntp-matrad ntp-okrad" id="ntpOk" hidden></div>'
    /* Timerne til venstre for klokka, ikke under den - under gjorde de
       toppen for hoey (Magne, 8. november 2026). */
    + '<div class="ntp-timere" id="ntpTimere" role="button" tabindex="0" hidden'
    +   ' aria-label="Alarmer, nedtellinger og stoppeklokker"></div>'
    + '<div class="ntp-klokke" id="ntpKlokke" role="button" tabindex="0"'
    +   ' aria-label="Klokka – alarmer, nedtellinger og stoppeklokker">'
    +   '<div class="ntp-tid" id="ntpTid">--:--</div>'
    +   '<div class="ntp-dato" id="ntpDato">&nbsp;</div>'
    + '</div>'
    + '</div>';
  if(typeof neamLaasTegn === 'function') neamLaasTegn();
  ntpMerkeTrykk(t.querySelector('.ntp-merke'), !!t.dataset.hjem);
  /* Laast ved rulling: bakgrunn naar sida er rullet, og hoeyden som
     --ntp-h til sider med en egen laast rad under. */
  const rull = function(){ t.classList.toggle('ntp-rullet', window.scrollY > 4); };
  window.addEventListener('scroll', rull, { passive:true });
  rull();
  const hoyde = function(){ document.documentElement.style.setProperty('--ntp-h', t.offsetHeight + 'px'); };
  if(window.ResizeObserver) new ResizeObserver(hoyde).observe(t);
  hoyde();
  document.getElementById('ntpMat').addEventListener('click', function(e){
    /* Paa matlagingssida selv aapnes retten uten ny lasting. */
    const a = e.target.closest('[data-mat-id]');
    if(a && typeof window.ntpMatGaaTil === 'function'){ e.preventDefault(); window.ntpMatGaaTil(a.dataset.matId); }
  });
  ['ntpKlokke', 'ntpTimere'].forEach(function(id){
    const kl = document.getElementById(id);
    kl.addEventListener('click', function(){ ntpTmApne(); });
    kl.addEventListener('keydown', function(ev){ if(ev.key === 'Enter' || ev.key === ' '){ ev.preventDefault(); ntpTmApne(); } });
  });
  ntpKlokke();
  setInterval(ntpKlokke, 10000);
  ntpVaerStart();
  ntpTmStart();
  ntpOkStart();
}

/* Ikonet oppe til venstre: ett trykk er forsiden (Magne, 21. november
   2026: «for å komme tilbake til hovedmenyen trenges bare et enkelt klikk
   på ikonet opp til venstre. ikke hold»). Til da var et kort trykk sidas
   startvisning og to sekunder holdt inne forsiden - startvisningen naas
   fortsatt med andre trykk paa sidehaandtaket. Undersidene (spillene,
   fagene) har data-hjem og lenker til dashet sitt som foer. Paa forsiden
   selv er trykket forsidens startvisning (window.neamSideAndreTrykk, om
   den er satt) og rulling til toppen. */
function ntpMerkeTrykk(a, harHjem){
  if(!a) return;
  a.addEventListener('click', function(ev){
    if(harHjem || ev.metaKey || ev.ctrlKey || ev.shiftKey) return;
    if(location.pathname !== '/' && location.pathname !== '/index.html') return;
    ev.preventDefault();
    if(typeof window.neamSideAndreTrykk === 'function'){
      try{ window.neamSideAndreTrykk(); }
      catch(e){ console.warn('neamSideAndreTrykk feilet:', e); }
    }
    window.scrollTo({ top:0, behavior:'smooth' });
  });
}

function ntpKlokke(){
  const el = document.getElementById('ntpTid');
  if(!el) return;
  /* Klapptavla bygger og flipper seg selv - se neamFlipKlokke i felles-neam.js. */
  if(typeof neamFlipKlokke === 'function') neamFlipKlokke(el);
  else{
    const n0 = new Date();
    el.textContent = ntpTo(n0.getHours()) + ':' + ntpTo(n0.getMinutes());
  }
  const n = new Date();
  document.getElementById('ntpDato').textContent =
    NTP_DAGER[n.getDay()] + ' ' + n.getDate() + '. ' + NTP_MND[n.getMonth()];
}

/* ---------- Posisjonen ---------- */
function ntpLesPos(){
  try{
    const p = JSON.parse(localStorage.getItem('fh_pos') || 'null');
    if(p && typeof p.lat === 'number' && typeof p.lon === 'number'){
      /* For grov (noy er noeyaktigheten i meter, satt av toppen): ikke bruk den. */
      if(typeof p.noy === 'number' && p.noy > NTP_GROV_M) return true;
      ntpPos = ntpHjemme({ lat: p.lat, lon: p.lon, navn: p.navn || 'Din posisjon' });
      return true;
    }
  }catch(e){}
  return false;
}
async function ntpFinnPos(){
  if(ntpLesPos() || !navigator.geolocation) return;
  try{
    const p = await new Promise(function(ok, nei){
      navigator.geolocation.getCurrentPosition(ok, nei, { enableHighAccuracy:false, timeout:8000, maximumAge:86400000 });
    });
    const noy = Math.round(p.coords.accuracy || 0);
    const fant = {
      lat: Math.round(p.coords.latitude * 10000) / 10000,
      lon: Math.round(p.coords.longitude * 10000) / 10000,
      navn: 'Din posisjon'
    };
    /* For grov - som en posisjon fra nettverket alene: Ospefjell staar, og
       ingenting lagres (dashene leser fh_pos og ser ikke paa noy). */
    if(noy > NTP_GROV_M) return;
    ntpPos = ntpHjemme(fant);
    if(ntpPos.navn === NTP_STED.navn){
      try{ localStorage.setItem('fh_pos', JSON.stringify(Object.assign({ presis:true, noy:noy }, fant, { navn:NTP_STED.navn }))); }catch(e){}
      return;
    }
    try{
      const g = await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client'
        + '?latitude=' + ntpPos.lat + '&longitude=' + ntpPos.lon + '&localityLanguage=no');
      if(g.ok){
        const gd = await g.json();
        const n = gd.locality || gd.city || gd.principalSubdivision;
        if(n) ntpPos.navn = n;
      }
    }catch(e){}
    try{ localStorage.setItem('fh_pos', JSON.stringify(Object.assign({ presis:true, noy:noy }, ntpPos))); }catch(e){}
  }catch(e){ /* Avslaatt eller tidsavbrudd - Ospefjell staar. */ }
}

/* ---------- Vaeret ----------
   Fra 22. november 2026 kommer vaeret fra yr.no (MET Norge) gjennom
   /api/yr - foer var det open-meteo. Magne: «Lag en egen boks der det
   står YR.no med en liten illustrasjon. Når man trykker kan vi få en
   utvidet utgave av været.» Boksen staar ved Inne, Ute og Sjø der det
   er plass (se felles-topp.css), og vaerboblen er bak et trykk paa den. */
/* yr.no sine egne vaersymboler (Magne, 22. november 2026), lagt i
   /bilder/vaer/ med samme navn som symbolkoden. Fra github.com/metno/
   weathericons, MIT-lisens (LICENSE i mappa). Logoen til Yr faar vi ikke
   bruke - MET sine vilkaar - men symbolene er laget for aa pakkes med.
   Emojien er reserve naar en kode mangler fil. */
const NTP_VAER_V = 1;
function ntpYrBilde(kode, kl){
  if(!kode || !/^[a-z_]+$/.test(kode)) return '';
  return '<img class="' + kl + '" src="/bilder/vaer/' + kode + '.svg?v=' + NTP_VAER_V + '" alt="" width="100" height="100">';
}
function ntpYrSym(kode){
  if(!kode) return ['🌡️', '—'];
  const natt = /_night$/.test(kode);
  let k = String(kode).replace(/_(day|night|polartwilight)$/, '');
  const torden = /andthunder$/.test(k);
  k = k.replace(/andthunder$/, '');
  let v = NTP_YR[k] || ['🌡️', '—'];
  if(natt && (k === 'clearsky' || k === 'fair')) v = ['🌙', v[1]];
  if(torden) v = ['⛈️', v[1] + ' og torden'];
  return [v[0], v[1], ntpYrBilde(kode, 'ntp-yr-ikon') || v[0]];
}
function ntpRund(v){ return Math.round(v); }
function ntpKomma(v, des){ return Number(v).toFixed(des).replace('.', ','); }
function ntpVindPil(grader){
  if(grader === null || grader === undefined) return '';
  const v = (Number(grader) + 180) % 360;
  return '<svg class="ntp-pil" viewBox="0 0 24 24" aria-hidden="true" style="transform:rotate(' + v + 'deg)">'
    + '<path d="M12 3 L12 21 M12 3 L7 9 M12 3 L17 9" fill="none" stroke="currentColor" stroke-width="2.4"'
    + ' stroke-linecap="round" stroke-linejoin="round"/></svg>';
}
/* «kl. 20:14, for 6 min siden» - eller dato foran naar det ikke er i dag. */
function ntpNaar(iso){
  const d = iso ? new Date(iso) : null;
  if(!d || isNaN(d)) return 'ukjent';
  const kl = 'kl. ' + ntpTo(d.getHours()) + ':' + ntpTo(d.getMinutes());
  const min = Math.round((Date.now() - d.getTime()) / 60000);
  const siden = min < 1 ? 'nå nettopp' : min < 60 ? 'for ' + min + ' min siden'
    : min < 1440 ? 'for ' + Math.floor(min / 60) + ' t siden' : '';
  const iDag = ntpDatoNokkel(d) === ntpDatoNokkel(new Date());
  return (iDag ? '' : d.getDate() + '. ' + NTP_MND[d.getMonth()] + ' ') + kl + (siden ? ', ' + siden : '');
}
/* Dagen vaeret gjelder: den sida viser, ellers i dag. */
function ntpDag(){
  try{ if(typeof window.ntpVaerDag === 'function'){ const d = window.ntpVaerDag(); if(d instanceof Date) return d; } }catch(e){}
  return new Date();
}
async function ntpVaer(){
  ntpVaerHentet = Date.now();
  try{
    const r = await fetch('/api/yr?lat=' + ntpPos.lat + '&lon=' + ntpPos.lon, { cache:'no-store' });
    const d = r.ok ? await r.json() : null;
    if(!d || !d.ok || !Array.isArray(d.tider) || !d.tider.length){
      if(d && d.feil) console.warn('Været fra yr.no:', d.feil);
    }else ntpVaerData = d;
  }catch(e){}
  ntpVaerTegn();
  ntpSjo();
}
/* Maalingen som gjelder naa: den siste som har begynt. */
function ntpYrNaa(){
  const d = ntpVaerData;
  if(!d) return null;
  const naa = Date.now();
  let best = d.tider[0];
  d.tider.forEach(function(x){ if(new Date(x.t).getTime() <= naa) best = x; });
  return best;
}

/* ---------- Inne og ute ----------
   Fra 22. november 2026 (Magne): «erstatte vær og lokasjon med temperatur
   og luftfuktighet inne og ute. Skriv inne og ute, ikke navnet på enheten».
   Tallene kommer fra Netatmo-stasjonen i Homey via /api/homey. Enhetene
   finnes paa appen og maalingene, ikke paa navnet - navnene er endret
   foer: inne er stasjonen (CO2 og lufttrykk), ute er modulen med
   temperatur uten CO2. Et trykk viser alt maalerne melder, med naar
   hver maaling sist kom (Magne samme kveld). Hentes hvert kvarter. */
const NTP_IU_GAMMEL = 2 * 3600000;   /* eldre maaling vises graa, som sjoeen */
let ntpIu = null;
let ntpNetatmo = [];                 /* [{ rolle:'Inne'|'Ute'|navn, d }] til boblen */
async function ntpInneUte(){
  let e = null;
  try{
    const r = await fetch('/api/homey?hva=enheter', { cache:'no-store' });
    e = r.ok ? await r.json() : null;
  }catch(err){ e = null; }
  if(!e || !e.ok || !e.enheter) return;
  const ut = { inne:null, ute:null };
  const alle = [];
  Object.keys(e.enheter).forEach(function(id){
    const d = e.enheter[id] || {};
    if(!/^homey:app:com\.netatmo:/.test(String(d.driverId || d.driverUri || ''))) return;
    const o = d.capabilitiesObj || {};
    if(!o.measure_temperature) return;
    const m = { t:o.measure_temperature, f:o.measure_humidity || null, borte: d.available === false };
    let rolle = String(d.name || 'Netatmo');
    if(o.measure_co2 && o.measure_pressure && !ut.inne){ ut.inne = m; rolle = 'Inne'; }
    else if(!o.measure_co2 && !ut.ute){ ut.ute = m; rolle = 'Ute'; }
    alle.push({ rolle:rolle, d:d });
  });
  const rang = function(x){ return x.rolle === 'Inne' ? 0 : x.rolle === 'Ute' ? 1 : 2; };
  ntpNetatmo = alle.sort(function(a, b){ return rang(a) - rang(b); });
  ntpIu = ut;
  ntpVaerTegn();
}
function ntpIuDel(navn, m){
  let grad = '–', fukt = '', gammel = false;
  if(m && m.t && typeof m.t.value === 'number'){
    grad = m.t.value.toFixed(1).replace('.', ',') + '°';
    const naar = m.t.lastUpdated ? new Date(m.t.lastUpdated).getTime() : NaN;
    gammel = m.borte || (!isNaN(naar) && Date.now() - naar > NTP_IU_GAMMEL);
  }
  if(m && m.f && typeof m.f.value === 'number') fukt = Math.round(m.f.value) + ' %';
  /* Hver sin knapp (Magne, 23. november 2026: «Når jeg trykker utetemp er
     det kun ute-data jeg vil ha, samme med inne-temp»). */
  return '<button type="button" class="ntp-iu ntp-maaler' + (gammel ? ' gammel' : '') + '"'
    + ' data-rolle="' + navn + '" aria-label="' + navn + ': ' + grad + ' – trykk for måleren">'
    + '<span class="ntp-iu-navn">' + navn + '</span>'
    + '<span class="ntp-iu-grad">' + grad + '</span>'
    + '<span class="ntp-iu-fukt">' + (fukt || '&nbsp;') + '</span>'
    + '</button>';
}

/* Toppens felt mellom navnet og klokka: Inne og Ute, sjoeen og yr.no.
   Navnet ntpVaerTegn er beholdt - dashene kaller den naar dagen skifter. */
function ntpVaerTegn(){
  const el = document.getElementById('ntpVaer');
  if(!el || (!ntpIu && !ntpVaerData)) return;
  const iu = ntpIu || {};
  const naa = ntpYrNaa();
  let yr = '';
  if(naa){
    const sym = ntpYrSym(naa.sym1 || naa.sym6);
    yr = '<button type="button" class="ntp-iu ntp-yr" aria-label="Været fra yr.no: ' + ntpEsc(sym[1]) + ', '
      + ntpRund(naa.temp) + ' grader – trykk for værmeldingen">'
      + '<span class="ntp-iu-navn">YR.no</span>'
      + '<span class="ntp-iu-grad"><span class="ntp-yr-sym" aria-hidden="true">' + sym[2] + '</span>' + ntpRund(naa.temp) + '°</span>'
      + '<span class="ntp-iu-fukt">' + ntpEsc(sym[1]) + '</span></button>';
  }
  el.innerHTML =
      '<span class="ntp-vaer-naa ntp-iu-knapp">'
    +   ntpIuDel('Inne', iu.inne) + ntpIuDel('Ute', iu.ute)
    + '</span>'
    + '<button type="button" class="ntp-iu ntp-sjo" id="ntpSjo"></button>'
    + yr;
  el.hidden = false;
  Array.from(el.querySelectorAll('.ntp-maaler')).forEach(function(b){
    b.addEventListener('click', function(ev){ ntpNetatmoBoble(ev, b.dataset.rolle); });
  });
  el.querySelector('#ntpSjo').addEventListener('click', ntpSjoBoble);
  const y = el.querySelector('.ntp-yr');
  if(y) y.addEventListener('click', ntpVaerBoble);
  ntpSjoTegn(ntpSjoSist);
}

/* Boblen under toppen - vaeret, maalerne og sjoeen bruker den samme.
   Lukkes med kryss, trykk utenfor eller Escape. */
function ntpBoble(html, etikett, bred){
  let bak = document.getElementById('ntpVbBak');
  if(!bak){
    bak = document.createElement('div');
    bak.id = 'ntpVbBak';
    bak.className = 'ntp-vb-bak';
    bak.innerHTML = '<div class="ntp-vb" role="dialog">'
      + '<button type="button" class="ntp-vb-lukk" aria-label="Lukk">×</button><div class="ntp-vb-inn"></div></div>';
    bak.addEventListener('click', function(e){
      if(e.target === bak || e.target.closest('.ntp-vb-lukk')){ bak.hidden = true; return; }
      /* Vaeret: en dag, forrige og neste dag, og tilbake til alle dagene. */
      const dag = e.target.closest('[data-yr-dag]');
      if(dag){ ntpYrDag(dag.dataset.yrDag); return; }
      if(e.target.closest('[data-yr-alle]')) ntpVaerBoble();
    });
    bak.addEventListener('keydown', function(e){
      const dag = e.target.closest && e.target.closest('tr[data-yr-dag]');
      if(dag && (e.key === 'Enter' || e.key === ' ')){ e.preventDefault(); ntpYrDag(dag.dataset.yrDag); }
    });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape') bak.hidden = true; });
    document.body.appendChild(bak);
  }
  const kort = bak.querySelector('.ntp-vb');
  kort.setAttribute('aria-label', etikett);
  kort.classList.toggle('bred', !!bred);
  bak.querySelector('.ntp-vb-inn').innerHTML = html;
  kort.scrollTop = 0;
  bak.hidden = false;
}

/* Vaermeldingen fra yr.no, bygd som yr.no sin «daglig tabell» (Magne,
   22. november 2026: «jeg ønsker at man kan trykke seg videre på været
   slik som her»): «nå» oeverst, dagene med natt, morgen, ettermiddag og
   kveld, og et trykk paa en dag gir time for time med «Forrige dag» og
   «Neste dag». Bred paa iPad (Magne: «Er god plass på Ipad»). */
const NTP_YR_DELER = [['Natt', 0], ['Morgen', 6], ['Ettermiddag', 12], ['Kveld', 18]];
/* Vindstyrken med ord, slik yr.no skriver den (Beaufort, norsk). */
function ntpVindOrd(ms, fra){
  const g = [[0.3,'Stille'],[1.6,'Flau vind'],[3.4,'Svak vind'],[5.5,'Lett bris'],[8,'Laber bris'],[10.8,'Frisk bris'],
             [13.9,'Liten kuling'],[17.2,'Stiv kuling'],[20.8,'Sterk kuling'],[24.5,'Liten storm'],[28.5,'Full storm'],[32.7,'Sterk storm']];
  let ord = 'Orkan';
  for(let i = 0; i < g.length; i++){ if(ms < g[i][0]){ ord = g[i][1]; break; } }
  if(ord === 'Stille' || fra === null || fra === undefined) return ord;
  const r = ['nord', 'nordøst', 'øst', 'sørøst', 'sør', 'sørvest', 'vest', 'nordvest'][Math.round(((Number(fra) % 360) + 360) % 360 / 45) % 8];
  return ord + ' fra ' + r;
}
/* Tidsseriene gruppert paa lokal dato. */
function ntpYrDager(){
  const d = ntpVaerData, dager = {};
  if(!d) return dager;
  d.tider.forEach(function(x){
    const l = new Date(x.t), k = ntpDatoNokkel(l);
    const g = dager[k] || (dager[k] = { min:Infinity, max:-Infinity, mm:0, vind:0, retning:null, deler:{}, rader:[], dato:l });
    g.min = Math.min(g.min, x.temp); g.max = Math.max(g.max, x.temp);
    if(x.vind > g.vind){ g.vind = x.vind; g.retning = x.retning; }
    if(typeof x.mm1 === 'number') g.mm += x.mm1;
    else if(typeof x.mm6 === 'number') g.mm += x.mm6;
    /* Natt, morgen, ettermiddag og kveld: seks-timerssymbolet som starter
       i den delen av dagen. Lenger fram kommer bolkene i UTC - kl. 01, 07,
       13 og 19 her om vinteren - saa det er delen som teller, ikke timen;
       en bolk som starter paa delens foerste time gaar foran. */
    const del = Math.floor(l.getHours() / 6) * 6;
    if(x.sym6 && (!g.deler[del] || l.getHours() % 6 === 0)) g.deler[del] = x.sym6;
    g.rader.push(x);
  });
  return dager;
}
function ntpYrDagNavn(l, kort){
  const iDag = ntpDatoNokkel(l) === ntpDatoNokkel(new Date());
  const navn = iDag ? 'I dag' : NTP_DAGER[l.getDay()].charAt(0).toUpperCase() + NTP_DAGER[l.getDay()].slice(1);
  return navn + ' ' + l.getDate() + '. ' + (kort ? NTP_MND[l.getMonth()].slice(0, 3) + '.' : NTP_MND[l.getMonth()]);
}
function ntpYrKilde(){
  return '<div class="ntp-vb-kilde">Værdata fra MET Norge (yr.no), oppdatert ' + ntpEsc(ntpNaar(ntpVaerData.oppdatert)) + '.</div>';
}

/* Oversikten: naa og dagene. Dagen dashet viser er uthevet. */
function ntpVaerBoble(ev){
  if(ev) ev.stopPropagation();
  const d = ntpVaerData;
  if(!d) return;
  const vist = ntpDatoNokkel(ntpDag());
  let html = '<div class="ntp-vb-tittel">Været</div><div class="ntp-vb-sammendrag">' + ntpEsc(ntpPos.navn) + '</div>';
  const naa = ntpYrNaa();
  if(naa){
    const sym = ntpYrSym(naa.sym1 || naa.sym6);
    html += '<div class="ntp-yr-naa"><span class="ntp-yr-naa-sym" aria-hidden="true">' + sym[2] + '</span>'
      + '<span class="ntp-yr-naa-gr">' + ntpRund(naa.temp) + '°</span>'
      + '<span class="ntp-yr-naa-tekst"><b>' + ntpEsc(sym[1]) + '</b><br>'
      + ntpVindPil(naa.retning) + ntpRund(naa.vind) + ' m/s, ' + ntpEsc(ntpVindOrd(naa.vind, naa.retning).toLowerCase())
      + ' · luftfuktighet ' + ntpRund(naa.fukt) + ' %'
      + (typeof naa.mm1 === 'number' && naa.mm1 > 0 ? ' · ' + ntpKomma(naa.mm1, 1) + ' mm neste time' : '')
      + '</span></div>';
  }
  const dager = ntpYrDager();
  let rader = '';
  Object.keys(dager).sort().forEach(function(k){
    const g = dager[k];
    rader += '<tr class="ntp-yr-dagrad' + (k === vist ? ' na' : '') + '" data-yr-dag="' + k + '" tabindex="0" role="button"'
      + ' aria-label="' + ntpEsc(ntpYrDagNavn(g.dato, false)) + ' – time for time">'
      + '<td class="ntp-vb-dagnavn">' + ntpEsc(ntpYrDagNavn(g.dato, true)) + '</td>'
      + NTP_YR_DELER.map(function(del){
          const kode = g.deler[del[1]], sym = kode ? ntpYrSym(kode) : null;
          return '<td class="ntp-yr-del"' + (sym ? ' title="' + del[0] + ': ' + ntpEsc(sym[1]) + '"' : '') + '>' + (sym ? sym[2] : '') + '</td>';
        }).join('')
      + '<td class="ntp-vb-gr">' + ntpRund(g.max) + '° / ' + ntpRund(g.min) + '°</td>'
      + '<td class="ntp-vb-regn">' + (g.mm > 0.05 ? ntpKomma(g.mm, 1) + ' mm' : '') + '</td>'
      + '<td class="ntp-vb-vind">' + ntpVindPil(g.retning) + ntpRund(g.vind) + ' m/s</td>'
      + '<td class="ntp-yr-pil" aria-hidden="true">›</td></tr>';
  });
  html += '<table class="ntp-vb-tabell ntp-yr-dager"><thead><tr><th></th>'
    + NTP_YR_DELER.map(function(del){ return '<th class="ntp-yr-del">' + del[0] + '</th>'; }).join('')
    + '<th>Maks / min</th><th>Nedbør</th><th class="ntp-vb-vind">Vind</th><th></th></tr></thead><tbody>' + rader + '</tbody></table>'
    + '<div class="ntp-vb-tom">Trykk på en dag for time for time.</div>'
    + ntpYrKilde();
  ntpBoble(html, 'Været fra yr.no', true);
}

/* Én dag, time for time - eller hver sjette time der varselet bare har
   det (lenger fram enn et par doegn). */
function ntpYrDag(k){
  const dager = ntpYrDager(), nokler = Object.keys(dager).sort();
  const g = dager[k];
  if(!g){ ntpVaerBoble(); return; }
  const i = nokler.indexOf(k);
  const naa = Date.now();
  let rader = '';
  g.rader.forEach(function(x){
    const l = new Date(x.t);
    /* I dag: bare timene som ikke er over. */
    if(l.getTime() + 3600000 <= naa) return;
    const sym = ntpYrSym(x.sym1 || x.sym6);
    const mm = typeof x.mm1 === 'number' ? x.mm1 : x.mm6;
    const seks = typeof x.mm1 !== 'number';
    rader += '<tr><td class="ntp-vb-kl">' + ntpTo(l.getHours()) + (seks ? '–' + ntpTo((l.getHours() + 6) % 24) : '') + '</td>'
      + '<td class="ntp-yr-del" title="' + ntpEsc(sym[1]) + '">' + sym[2] + '</td>'
      + '<td class="ntp-vb-gr">' + ntpRund(x.temp) + '°</td>'
      + '<td class="ntp-vb-regn">' + (mm > 0.05 ? ntpKomma(mm, 1) + ' mm' : '') + '</td>'
      + '<td class="ntp-vb-vind">' + ntpVindPil(x.retning) + ntpRund(x.vind) + ' m/s</td>'
      + '<td class="ntp-yr-vindord">' + ntpEsc(ntpVindOrd(x.vind, x.retning)) + '</td></tr>';
  });
  const knapp = function(nk, tekst, kl){
    return nk ? '<button type="button" class="ntp-yr-knapp ' + kl + '" data-yr-dag="' + nk + '">' + tekst + '</button>' : '<span></span>';
  };
  const html = '<button type="button" class="ntp-yr-tilbake" data-yr-alle>‹ Alle dager</button>'
    + '<div class="ntp-vb-tittel">' + ntpEsc(ntpYrDagNavn(g.dato, false)) + '</div>'
    + '<div class="ntp-vb-sammendrag">' + ntpEsc(ntpPos.navn) + ' · ' + ntpRund(g.max) + '° / ' + ntpRund(g.min) + '°'
    + (g.mm > 0.05 ? ' · ' + ntpKomma(g.mm, 1) + ' mm' : '') + '</div>'
    + '<table class="ntp-vb-tabell ntp-yr-timer"><thead><tr><th>Tid</th><th>Vær</th><th>Temp.</th><th>Nedbør</th>'
    + '<th class="ntp-vb-vind">Vind</th><th class="ntp-yr-vindord">Beskrivelse</th></tr></thead><tbody>'
    + (rader || '<tr><td colspan="6" class="ntp-vb-tom">Dagen er over.</td></tr>') + '</tbody></table>'
    + '<div class="ntp-yr-blad">' + knapp(nokler[i - 1], '‹ Forrige dag', 'forrige') + knapp(nokler[i + 1], 'Neste dag ›', 'neste') + '</div>'
    + ntpYrKilde();
  ntpBoble(html, ntpYrDagNavn(g.dato, false) + ' – time for time', true);
}

/* Netatmo-maalerne: alt de melder, og naar hver maaling sist kom. */
const NTP_NETATMO_NAVN = {
  measure_temperature:'Temperatur', measure_humidity:'Luftfuktighet', measure_co2:'CO₂',
  measure_noise:'Lyd', measure_pressure:'Lufttrykk', measure_battery:'Batteri', alarm_battery:'Lavt batteri'
};
/* rolle: 'Ute' viser bare uteenheten, 'Inne' hovedenheten og eventuelle
   ekstra innemoduler. Uten rolle: alle, som foer. */
function ntpNetatmoBoble(ev, rolle){
  if(ev) ev.stopPropagation();
  const valgte = ntpNetatmo.filter(function(m){
    if(rolle === 'Ute') return m.rolle === 'Ute';
    if(rolle === 'Inne') return m.rolle !== 'Ute';
    return true;
  });
  const tittel = rolle ? ('Måleren ' + rolle.toLowerCase()) : 'Målerne';
  if(!valgte.length){ ntpBoble('<div class="ntp-vb-tittel">' + tittel + '</div><div class="ntp-vb-tom">Fikk ikke kontakt med Netatmo i Homey.</div>', tittel); return; }
  let html = '<div class="ntp-vb-tittel">' + tittel + '</div><div class="ntp-vb-sammendrag">Netatmo, gjennom Homey</div>';
  valgte.forEach(function(m){
    const o = m.d.capabilitiesObj || {};
    let rader = '';
    Object.keys(NTP_NETATMO_NAVN).forEach(function(k){
      const c = o[k];
      if(!c || c.value === null || c.value === undefined) return;
      let v;
      if(typeof c.value === 'boolean') v = c.value ? 'Ja' : 'Nei';
      else if(k === 'measure_temperature') v = ntpKomma(c.value, 1) + ' °C';
      else v = ntpRund(c.value) + (c.units ? ' ' + c.units : '');
      rader += '<tr><td class="ntp-vb-kl">' + NTP_NETATMO_NAVN[k] + '</td><td class="ntp-vb-gr">' + ntpEsc(v) + '</td>'
        + '<td class="ntp-vb-vind">' + ntpEsc(ntpNaar(c.lastUpdated)) + '</td></tr>';
    });
    html += '<div class="ntp-vb-bolk">' + ntpEsc(m.rolle) + (m.d.available === false ? ' – uten kontakt' : '') + '</div>'
      + (rader ? '<table class="ntp-vb-tabell">' + rader + '</table>' : '<div class="ntp-vb-tom">Ingen målinger.</div>');
  });
  ntpBoble(html, tittel);
}

/* ---------- Sjoetemperaturen ----------
   Samme kilder som paa dashene: /api/sjo, ellers KV-noekkelen «sjo».
   Et trykk viser alle dybdene boeyen maaler - HI viser 1, 19 og 75 m -
   og naar de ble maalt (Magne, 22. november 2026). */
let ntpSjoSist = null;
async function ntpSjo(){
  let d = null;
  try{
    let r = await fetch('/api/sjo', { cache:'no-store' });
    d = r.ok ? await r.json() : null;
    if(!d || typeof d.temp !== 'number'){
      r = await fetch('/api/data?key=sjo', { cache:'no-store' });
      const kv = r.ok ? await r.json() : null;
      d = kv && kv.value && typeof kv.value === 'object' ? kv.value : null;
    }
  }catch(e){ d = null; }
  ntpSjoSist = (d && typeof d.temp === 'number') ? d : null;
  ntpSjoTegn(ntpSjoSist);
}
function ntpSjoTegn(d){
  const el = document.getElementById('ntpSjo');
  if(!el) return;
  if(!d){ el.innerHTML = ''; return; }
  const naar = d.tid ? new Date(d.tid) : null;
  const gammel = naar && !isNaN(naar) && (Date.now() - naar.getTime()) > 24 * 3600000;
  /* Samme boks som Inne og Ute, med «Sjø» i stedet for bølgen
     (22. november 2026, Magne). Linja under står tom så tallene står likt. */
  el.className = 'ntp-iu ntp-sjo' + (gammel ? ' gammel' : '');
  el.innerHTML = '<span class="ntp-iu-navn">Sjø</span>'
    + '<span class="ntp-iu-grad">' + d.temp.toFixed(1).replace('.', ',') + '°</span>'
    + '<span class="ntp-iu-fukt">&nbsp;</span>';
  el.setAttribute('aria-label', 'Sjøen ' + d.temp.toFixed(1).replace('.', ',') + ' grader' + (gammel ? ', gammel måling' : '') + ' – trykk for alle dybdene');
}
function ntpSjoBoble(ev){
  if(ev) ev.stopPropagation();
  const d = ntpSjoSist;
  if(!d) return;
  const dybder = (Array.isArray(d.dybder) && d.dybder.length) ? d.dybder : [{ dybde:d.dybde || 1, temp:d.temp }];
  const rader = dybder.map(function(x){
    return '<tr><td class="ntp-vb-kl">' + ntpEsc(String(x.dybde).replace('.', ',')) + ' m</td>'
      + '<td class="ntp-vb-gr">' + ntpKomma(x.temp, 1) + ' °C</td></tr>';
  }).join('');
  ntpBoble('<div class="ntp-vb-tittel">Sjøen</div>'
    + '<div class="ntp-vb-sammendrag">Bøyen ved Flødevigen, målt ' + ntpEsc(ntpNaar(d.tid)) + '</div>'
    + '<div class="ntp-vb-bolk">Temperatur etter dybde</div>'
    + '<table class="ntp-vb-tabell">' + rader + '</table>'
    + '<div class="ntp-vb-kilde">Målt av Havforskningsinstituttet.</div>', 'Sjøtemperaturen');
}

async function ntpVaerStart(){
  ntpInneUte();
  await ntpFinnPos();
  ntpVaer();
  setInterval(function(){ if(!document.hidden){ ntpVaer(); ntpInneUte(); } }, NTP_VAER_MAKS);
  document.addEventListener('visibilitychange', function(){
    if(!document.hidden){
      ntpKlokke();
      if(Date.now() - ntpVaerHentet > NTP_VAER_MAKS){ ntpVaer(); ntpInneUte(); }
    }
  });
}

/* ============================================================
   Alarmer, nedtellinger og stoppeklokker
   ------------------------------------------------------------
   Fra 8. november 2026 (Magne). Trykk paa klokka: lista med navnene,
   Endre og Slett, og «Ny». Opptil ti om gangen paa en enhet.

   Hvem den gjelder for:
   - «Bare denne enheten»: lagres i nettleseren (localStorage), ingen
     andre ser den.
   - Kjoekkenet og/eller personene: lagres i KV («timere:v1») og hentes
     hvert 15. sekund. Den ringer paa alle skjermer der en av mottakerne
     har Neam aapen - og der den ble laget. Stopp et sted fjerner den
     overalt (innen neste henting). En laast telefon ringer IKKE: det
     krever push (kartleggingen del 49).

   Tidene er klokkeslett (ms), ikke nedtelling i minnet: en side som
   lastes paa nytt, eller en annen skjerm, regner ut det samme.
   ============================================================ */
const NTP_TM_MAKS = 10;
const NTP_TM_LOKAL = 'neam-timere';          /* localStorage, bare denne enheten */
const NTP_TM_KV = 'timere:v1';               /* KV, delt */
const NTP_TM_HENT = 15000;
const NTP_TM_SLUMRE = 5 * 60000;
const NTP_TM_FOLK = [
  { id:'kjokken', navn:'Kjøkkenet' },
  { id:'magne', navn:'Magne' }, { id:'nina', navn:'Nina' },
  { id:'emma', navn:'Emma' }, { id:'andrea', navn:'Andrea' }
];
const NTP_TM_TYPER = { alarm:'Alarm', nedtelling:'Nedtelling', stoppeklokke:'Stoppeklokke' };
const NTP_TM_SVG = {
  alarm: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="13" r="7"/><path d="M12 9.5V13l2.2 1.6M5 4 2.8 6.2M19 4l2.2 2.2"/></svg>',
  nedtelling: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h12M6 21h12M7 3c0 5 10 5 10 9s-10 4-10 9M17 3c0 5-10 5-10 9"/></svg>',
  stoppeklokke: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="14" r="7"/><path d="M12 14V10.5M10 3h4M12 3v4M18.5 7.5l1.5-1.5"/></svg>'
};

let ntpTmLokal = [];
let ntpTmDelt = [];
let ntpTmRinger = null;          /* id-en som ringer akkurat naa */
let ntpTmStoppet = {};           /* id -> tid: stoppet her, venter paa at KV sier det samme */
let ntpTmTikker = null;

/* Hvem er denne skjermen? Kjoekkenet (fellesenhetene) og den som har
   tastet pinkoden sin der, ellers den innloggede personen. */
function ntpTmMeg(){
  const meg = [];
  if(typeof neamErKjokken === 'function' && neamErKjokken()){
    meg.push('kjokken');
    const p = (typeof neamHvemStaar === 'function') ? neamHvemStaar() : null;
    if(p && p.hvem) meg.push(p.hvem);
  }else if(typeof skrivMeg !== 'undefined' && skrivMeg){
    const id = String(skrivMeg).split('@')[0];
    if(NTP_TM_FOLK.some(function(f){ return f.id === id; })) meg.push(id);
  }
  return meg;
}
function ntpTmEnhet(){
  let id = null;
  try{ id = localStorage.getItem('neam-enhet'); }catch(e){}
  if(!id){
    id = 'e' + Math.random().toString(36).slice(2, 10);
    try{ localStorage.setItem('neam-enhet', id); }catch(e){}
  }
  return id;
}
function ntpTmLesLokal(){
  try{ const l = JSON.parse(localStorage.getItem(NTP_TM_LOKAL) || '[]'); ntpTmLokal = Array.isArray(l) ? l : []; }
  catch(e){ ntpTmLokal = []; }
}
function ntpTmSkrivLokal(){
  try{ localStorage.setItem(NTP_TM_LOKAL, JSON.stringify(ntpTmLokal)); }catch(e){}
}
/* De delte som angaar denne skjermen: mottaker her, eller laget her. */
function ntpTmMine(){
  const meg = ntpTmMeg(), enhet = ntpTmEnhet();
  return ntpTmDelt.filter(function(t){
    return t.enhet === enhet || (t.for || []).some(function(f){ return meg.indexOf(f) !== -1; });
  });
}
function ntpTmAlle(){
  return ntpTmLokal.concat(ntpTmMine()).sort(function(a, b){ return ntpTmSortTid(a) - ntpTmSortTid(b); });
}
function ntpTmSortTid(t){ return t.type === 'stoppeklokke' ? Infinity : (t.mal || 0); }

async function ntpTmHent(){
  try{
    const r = await fetch('/api/data?key=' + encodeURIComponent(NTP_TM_KV), { cache:'no-store' });
    if(!r.ok) return;
    const d = await r.json();
    const l = d && d.value && Array.isArray(d.value.liste) ? d.value.liste : [];
    ntpTmDelt = l.filter(function(t){ return !ntpTmStoppet[t.id]; });
    /* Det som er stoppet her og ikke lenger finnes i KV, er ferdig. */
    Object.keys(ntpTmStoppet).forEach(function(id){
      if(!l.some(function(t){ return t.id === id; })) delete ntpTmStoppet[id];
    });
  }catch(e){}
  ntpTmTegn();
}
/* Les - endre - skriv rett foer lagring, saa en annen skjerms endring
   ikke overskrives. Siste skriver vinner bare for den samme timeren. */
async function ntpTmEndreDelt(fn){
  let l = [];
  const r = await fetch('/api/data?key=' + encodeURIComponent(NTP_TM_KV), { cache:'no-store' });
  if(!r.ok) throw new Error('Fikk ikke hentet timerne (' + r.status + ')');
  const d = await r.json();
  l = d && d.value && Array.isArray(d.value.liste) ? d.value.liste : [];
  l = fn(l);
  const w = await fetch('/api/data?key=' + encodeURIComponent(NTP_TM_KV), {
    method:'PUT', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ liste:l })
  });
  if(!w.ok) throw new Error('Fikk ikke lagret timerne (' + w.status + ')');
  ntpTmDelt = l;
  ntpTmTegn();
}
async function ntpTmLagre(t){
  const lokal = !t.for || !t.for.length;
  /* En timer kan flyttes mellom «bare her» og delt ved endring. */
  ntpTmLokal = ntpTmLokal.filter(function(x){ return x.id !== t.id; });
  if(lokal){
    ntpTmLokal.push(t); ntpTmSkrivLokal();
    if(ntpTmDelt.some(function(x){ return x.id === t.id; }))
      await ntpTmEndreDelt(function(l){ return l.filter(function(x){ return x.id !== t.id; }); });
    ntpTmTegn();
  }else{
    ntpTmSkrivLokal();
    await ntpTmEndreDelt(function(l){ return l.filter(function(x){ return x.id !== t.id; }).concat([t]); });
  }
}
async function ntpTmFjern(t){
  if(ntpTmLokal.some(function(x){ return x.id === t.id; })){
    ntpTmLokal = ntpTmLokal.filter(function(x){ return x.id !== t.id; });
    ntpTmSkrivLokal(); ntpTmTegn();
    return;
  }
  ntpTmStoppet[t.id] = Date.now();
  ntpTmDelt = ntpTmDelt.filter(function(x){ return x.id !== t.id; });
  ntpTmTegn();
  await ntpTmEndreDelt(function(l){ return l.filter(function(x){ return x.id !== t.id; }); });
}

/* ---------- Oekonomien ----------
   Naar noe venter i innboksen i Oekonomi (okonomi.html), staar
   Oekonomi-ikonet ved klokka med en roed prikk, i samme form som
   matlagingen; trykk gaar til innboksen (Magne, 8. november 2026: «Dersom
   det er innhold i innboksen kan det dukke opp et ikon likt
   matlagingssymbolet ved klokken med en rød prikk»). /api/bank svarer bare
   den som har tilgang - alle andre faar ok:false, og da spoer sida ikke
   igjen paa en time. Svaret huskes i localStorage («neam-okonomi»), saa
   ikonet staar med en gang paa neste side; okonomi.html skriver det
   ogsaa naar innboksen endres. */
const NTP_OK = 'neam-okonomi';
const NTP_OK_NEI_MS = 3600e3, NTP_OK_FERSK_MS = 120e3;
function ntpOkLes(){ try{ return JSON.parse(localStorage.getItem(NTP_OK) || 'null'); }catch(e){ return null; } }
function ntpOkTegn(s){
  const rad = document.getElementById('ntpOk');
  if(!rad) return;
  /* Paa Oekonomi-sida selv baerer fanene prikken - der staar ikke ikonet. */
  const vis = !!(s && s.venter) && !/^\/okonomi(\.html)?$/.test(location.pathname);
  rad.hidden = !vis;
  if(!vis){ rad.innerHTML = ''; return; }
  if(rad.firstChild) return;
  const url = (typeof neamIkonUrl === 'function') ? neamIkonUrl('okonomi') : '/bilder/ikoner/okonomi.png';
  const navn = 'Økonomi: noe venter i innboksen – trykk for å gå dit';
  rad.innerHTML = '<a class="ntp-mat ntp-ok" href="/okonomi.html#innboks" title="' + ntpEsc(navn) + '" aria-label="' + ntpEsc(navn) + '">'
    + '<span class="ntp-mat-ikon"><img src="' + ntpEsc(url) + '" alt="" width="579" height="604"><span class="ntp-ok-prikk"></span></span>'
    + '<span class="ntp-mat-navn">Innboks</span></a>';
}
function ntpOkHent(){
  const s = ntpOkLes();
  if(s && Date.now() - s.t < (s.nei ? NTP_OK_NEI_MS : NTP_OK_FERSK_MS)) return;
  fetch('/api/bank?hva=varsler', { credentials:'same-origin', cache:'no-store' })
    .then(function(r){ return r.json(); })
    .then(function(v){
      const ny = v && v.ok
        ? { venter:(v.varsler || []).some(function(x){ return x.type === 'innboks'; }), t:Date.now() }
        : { nei:true, t:Date.now() };
      try{ localStorage.setItem(NTP_OK, JSON.stringify(ny)); }catch(e){}
      ntpOkTegn(ny);
    })
    .catch(function(){});
}
function ntpOkStart(){
  ntpOkTegn(ntpOkLes());
  ntpOkHent();
  setInterval(ntpOkHent, 300e3);
  /* En annen fane (okonomi.html) kan ha endret innboksen. */
  window.addEventListener('storage', function(e){ if(e.key === NTP_OK) ntpOkTegn(ntpOkLes()); });
}

/* ---------- Matlagingen ----------
   Settes av oppskrifter.html: {id, tittel, porsjoner, start, ...}. */
const NTP_MAT = 'neam-matlaging';
/* Rettene som lages, eldste foerst. Det gamle formatet var én rett. */
function ntpMatAlle(){
  try{
    const m = JSON.parse(localStorage.getItem(NTP_MAT) || 'null');
    if(!m || typeof m !== 'object') return [];
    const liste = (m.id && m.start) ? [m] : Object.keys(m).map(function(k){ return m[k]; });
    return liste.filter(function(x){ return x && x.id && x.start; })
      .sort(function(a, b){ return a.start - b.start; });
  }catch(e){ return []; }
}

/* Ikonene til venstre for klokka, ett per rett. Gir rettene tilbake. */
function ntpMatIkon(){
  const rad = document.getElementById('ntpMat');
  const alle = ntpMatAlle();
  if(!rad) return alle;
  rad.hidden = !alle.length;
  rad.classList.toggle('flere', alle.length > 1);
  /* Samme retter som sist: bare tiden oppdateres (ntpTmTikk), ellers
     ville ringen startet paa nytt med et rykk ved hver henting. */
  const nokkel = alle.map(function(m){ return m.id + ':' + m.start; }).join('|');
  if(rad.dataset.nokkel === nokkel) return alle;
  rad.dataset.nokkel = nokkel;
  const url = (typeof neamIkonUrl === 'function') ? neamIkonUrl('matlaging') : '/bilder/ikoner/matlaging.png';
  rad.innerHTML = alle.map(function(m){
    const navn = 'Matlaging: ' + (m.tittel || '') + ' – trykk for å gå tilbake';
    return '<a class="ntp-mat" href="/oppskrifter.html?rett=' + encodeURIComponent(m.id) + '" data-mat-id="' + ntpEsc(m.id) + '"'
      + ' title="' + ntpEsc(navn) + '" aria-label="' + ntpEsc(navn) + '">'
      + '<span class="ntp-mat-ikon"><img src="' + ntpEsc(url) + '" alt="" width="512" height="511"></span>'
      /* Rettens navn under symbolet (Magne, 8. november 2026), tiden under det. */
      + '<span class="ntp-mat-navn">' + ntpEsc(m.tittel || 'Matlaging') + '</span>'
      + '<b data-start="' + m.start + '">' + ntpTmVarighet(Date.now() - m.start) + '</b></a>';
  }).join('');
  return alle;
}

/* Symbolet for en timer. Nedtellinger fra en oppskrift faar et lite
   matlagingssymbol i stedet for timeglasset (Magne, 8. november 2026). */
function ntpTmSymbol(t){
  if(!t.mat) return NTP_TM_SVG[t.type];
  const url = (typeof neamIkonUrl === 'function') ? neamIkonUrl('matlaging') : '/bilder/ikoner/matlaging.png';
  return '<img class="ntp-tm-matbilde" src="' + ntpEsc(url) + '" alt="" width="512" height="511">';
}

/* ---------- Tid ---------- */
function ntpTmVarighet(ms){
  const s = Math.max(0, Math.round(ms / 1000));
  const t = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sek = s % 60;
  return t ? t + ':' + ntpTo(m) + ':' + ntpTo(sek) : m + ':' + ntpTo(sek);
}
function ntpTmKlokkeslett(ms){ const d = new Date(ms); return ntpTo(d.getHours()) + ':' + ntpTo(d.getMinutes()); }
function ntpTmGaatt(t){ return (t.akk || 0) + (t.start ? Date.now() - t.start : 0); }
/* Det som staar under ikonet. */
function ntpTmKort(t){
  if(t.type === 'stoppeklokke') return ntpTmVarighet(ntpTmGaatt(t));
  if(t.type === 'alarm') return ntpTmKlokkeslett(t.mal);
  return ntpTmVarighet(t.mal - Date.now());
}
function ntpTmHvem(t){
  if(!t.for || !t.for.length) return 'Bare denne enheten';
  return t.for.map(function(id){ const f = NTP_TM_FOLK.filter(function(x){ return x.id === id; })[0]; return f ? f.navn : id; }).join(', ');
}

/* ---------- Under klokka ---------- */
function ntpTmTegn(){
  const el = document.getElementById('ntpTimere');
  if(!el) return;
  const alle = ntpTmAlle();
  const mat = ntpMatIkon();
  if(typeof window.ntpTimereEndret === 'function'){ try{ window.ntpTimereEndret(); }catch(e){} }
  el.hidden = !alle.length;
  el.innerHTML = alle.map(function(t){
    return '<span class="ntp-tm ntp-tm-' + t.type + (ntpTmRinger === t.id ? ' ringer' : '') + '" data-id="' + ntpEsc(t.id) + '" title="' + ntpEsc(t.navn || NTP_TM_TYPER[t.type]) + '">'
      + ntpTmSymbol(t) + '<b>' + ntpTmKort(t) + '</b></span>';
  }).join('');
  const panel = document.getElementById('ntpTmBak');
  if(panel && !panel.hidden && panel.dataset.vis === 'liste') ntpTmListe();
  /* Sekundene teller bare naar noe gaar - ogsaa en alarm langt fram,
     ellers ville ingen sett at tiden kom. */
  const trenger = alle.length > 0 || mat.length > 0;
  if(trenger && !ntpTmTikker) ntpTmTikker = setInterval(ntpTmTikk, 1000);
  if(!trenger && ntpTmTikker){ clearInterval(ntpTmTikker); ntpTmTikker = null; }
}
function ntpTmTikk(){
  const naa = Date.now();
  if(!ntpTmRinger){
    const ferdig = ntpTmAlle().filter(function(t){ return t.type !== 'stoppeklokke' && t.mal <= naa; })[0];
    if(ferdig) ntpTmRing(ferdig);
  }
  const alle = ntpTmAlle();
  document.querySelectorAll('#ntpTimere .ntp-tm[data-id]').forEach(function(s){
    const t = alle.filter(function(x){ return x.id === s.dataset.id; })[0];
    if(t) s.querySelector('b').textContent = ntpTmKort(t);
  });
  document.querySelectorAll('#ntpMat b[data-start]').forEach(function(b){
    b.textContent = ntpTmVarighet(naa - Number(b.dataset.start));
  });
  const panel = document.getElementById('ntpTmBak');
  if(panel && !panel.hidden && panel.dataset.vis === 'liste'){
    panel.querySelectorAll('[data-tm-tid]').forEach(function(s){
      const t = ntpTmAlle().filter(function(x){ return x.id === s.dataset.tmTid; })[0];
      if(t) s.textContent = ntpTmLang(t);
    });
  }
}

/* ---------- Panelet ---------- */
function ntpTmBak(){
  let bak = document.getElementById('ntpTmBak');
  if(bak) return bak;
  bak = document.createElement('div');
  bak.id = 'ntpTmBak';
  bak.className = 'dlg-bak ntp-tm-bak';
  bak.hidden = true;
  bak.innerHTML = '<div class="dlg-kort ntp-tm-kort" role="dialog" aria-label="Alarmer og timere"></div>';
  bak.addEventListener('click', function(e){ if(e.target === bak && bak.dataset.vis === 'liste') bak.hidden = true; });
  document.body.appendChild(bak);
  return bak;
}
function ntpTmApne(){
  ntpTmLyd();
  ntpTmListe();
  ntpTmBak().hidden = false;
  ntpTmHent();
}
function ntpTmLang(t){
  if(t.type === 'stoppeklokke') return ntpTmVarighet(ntpTmGaatt(t)) + (t.start ? '' : ' · stoppet');
  if(t.type === 'alarm') return 'kl. ' + ntpTmKlokkeslett(t.mal);
  return ntpTmVarighet(t.mal - Date.now()) + ' igjen · ferdig ' + ntpTmKlokkeslett(t.mal);
}
function ntpTmListe(){
  const bak = ntpTmBak(), kort = bak.querySelector('.ntp-tm-kort');
  bak.dataset.vis = 'liste';
  const alle = ntpTmAlle();
  kort.innerHTML = '<div class="ntp-tm-tittel">Alarmer og timere</div>'
    + (alle.length ? '<div class="ntp-tm-liste">' + alle.map(function(t){
        return '<div class="ntp-tm-rad" data-id="' + ntpEsc(t.id) + '">'
          + '<span class="ntp-tm-radikon ntp-tm-' + t.type + '">' + ntpTmSymbol(t) + '</span>'
          + '<div class="ntp-tm-radtekst"><b>' + ntpEsc(t.navn || NTP_TM_TYPER[t.type]) + '</b>'
          +   '<span data-tm-tid="' + ntpEsc(t.id) + '">' + ntpTmLang(t) + '</span>'
          +   '<span class="ntp-tm-hvem">' + ntpEsc(NTP_TM_TYPER[t.type] + ' · ' + ntpTmHvem(t)) + '</span></div>'
          + '<div class="ntp-tm-valg">'
          +   (t.type === 'stoppeklokke'
                ? '<button type="button" class="ntp-tm-knapp blaa" data-gjor="pause">' + (t.start ? 'Pause' : 'Fortsett') + '</button>'
                : '')
          +   '<button type="button" class="ntp-tm-knapp endre" data-gjor="endre">Endre</button>'
          +   '<button type="button" class="ntp-tm-knapp slett" data-gjor="slett">Slett</button>'
          + '</div></div>';
      }).join('') + '</div>'
      : '<p class="ntp-tm-tom">Ingen alarmer eller timere går nå.</p>')
    + '<div class="dlg-rad">'
    +   '<button type="button" class="dlg-knapp nei" data-gjor="lukk">Lukk</button>'
    +   '<button type="button" class="dlg-knapp ja ntp-tm-ny" data-gjor="ny">Ny</button>'
    + '</div>';
  kort.onclick = async function(e){
    const b = e.target.closest('[data-gjor]');
    if(!b) return;
    const rad = b.closest('.ntp-tm-rad');
    const t = rad ? ntpTmAlle().filter(function(x){ return x.id === rad.dataset.id; })[0] : null;
    const g = b.dataset.gjor;
    try{
      if(g === 'lukk') bak.hidden = true;
      else if(g === 'ny'){
        if(ntpTmAlle().length >= NTP_TM_MAKS){ ntpTmVarsle('Det går alt ' + NTP_TM_MAKS + ' her. Slett én først.'); return; }
        ntpTmSkjema(null);
      }
      else if(g === 'endre' && t) ntpTmSkjema(t);
      else if(g === 'slett' && t) await ntpTmFjern(t);
      else if(g === 'pause' && t){
        const ny = Object.assign({}, t);
        if(ny.start){ ny.akk = ntpTmGaatt(t); ny.start = null; } else { ny.start = Date.now(); }
        await ntpTmLagre(ny);
      }
    }catch(err){ ntpTmVarsle(err.message || String(err)); }
  };
}
function ntpTmVarsle(tekst){
  if(typeof varsle === 'function') varsle(tekst); else alert(tekst);
}

/* ---------- Skjemaet: ny eller endre ---------- */
function ntpTmSkjema(t, forslag){
  const bak = ntpTmBak(), kort = bak.querySelector('.ntp-tm-kort');
  bak.dataset.vis = 'skjema';
  const ny = !t;
  const type = t ? t.type : ((forslag && forslag.type) || 'nedtelling');
  const rest = t && t.type === 'nedtelling' ? Math.max(0, t.mal - Date.now())
    : (forslag && forslag.ms) ? forslag.ms : 10 * 60000;
  const alarmTid = t && t.type === 'alarm' ? ntpTmKlokkeslett(t.mal) : '';
  const valgt = t ? (t.for || []) : [];
  kort.innerHTML = '<div class="ntp-tm-tittel">' + (ny ? 'Ny' : 'Endre') + '</div>'
    + '<div class="ntp-tm-typer" role="radiogroup">'
    +   Object.keys(NTP_TM_TYPER).map(function(k){
          return '<button type="button" class="ntp-tm-type' + (k === type ? ' valgt' : '') + '" data-type="' + k + '"'
            + (ny ? '' : ' disabled') + '>' + NTP_TM_SVG[k] + NTP_TM_TYPER[k] + '</button>';
        }).join('')
    + '</div>'
    + '<label class="ntp-tm-felt">Navn<input type="text" id="ntpTmNavn" maxlength="40" placeholder="F.eks. Pasta"'
    +   ' value="' + ntpEsc(t ? t.navn || '' : (forslag && forslag.navn) || '') + '"></label>'
    + '<div class="ntp-tm-del" data-for="alarm"><label class="ntp-tm-felt">Klokkeslett'
    +   '<input type="time" id="ntpTmAlarm" value="' + alarmTid + '"></label></div>'
    + '<div class="ntp-tm-del" data-for="nedtelling"><div class="ntp-tm-felt">Hvor lenge'
    +   '<div class="ntp-tm-hms">'
    +     '<label><input type="number" id="ntpTmT" min="0" max="23" inputmode="numeric" value="' + Math.floor(rest / 3600000) + '"> t</label>'
    +     '<label><input type="number" id="ntpTmM" min="0" max="59" inputmode="numeric" value="' + Math.floor((rest % 3600000) / 60000) + '"> min</label>'
    +     '<label><input type="number" id="ntpTmS" min="0" max="59" inputmode="numeric" value="' + Math.floor((rest % 60000) / 1000) + '"> sek</label>'
    +   '</div>'
    +   '<div class="ntp-tm-raske">' + [1, 3, 5, 10, 15, 30, 60].map(function(m){
          return '<button type="button" class="ntp-tm-rask" data-min="' + m + '">' + (m < 60 ? m + ' min' : '1 t') + '</button>';
        }).join('') + '</div>'
    + '</div></div>'
    + '<div class="ntp-tm-del" data-for="stoppeklokke"><p class="ntp-tm-hint">'
    +   (ny ? 'Starter når du lagrer.' : 'Navnet og hvem den gjelder for kan endres. Pause og Fortsett ligger i lista.') + '</p></div>'
    + '<div class="ntp-tm-felt">Gjelder for<div class="ntp-tm-folk">'
    +   '<label class="ntp-tm-hake"><input type="checkbox" data-hvem="enhet"' + (valgt.length ? '' : ' checked') + '> Bare denne enheten</label>'
    +   NTP_TM_FOLK.map(function(f){
          return '<label class="ntp-tm-hake"><input type="checkbox" data-hvem="' + f.id + '"'
            + (valgt.indexOf(f.id) !== -1 ? ' checked' : '') + '> ' + f.navn + '</label>';
        }).join('')
    + '</div></div>'
    + '<p class="ntp-tm-feil" id="ntpTmFeil" hidden></p>'
    + '<div class="dlg-rad">'
    +   '<button type="button" class="dlg-knapp nei" data-gjor="avbryt">Avbryt</button>'
    +   '<button type="button" class="dlg-knapp ntp-tm-lagre ' + (ny ? 'ny' : 'endre') + '" data-gjor="lagre">Lagre</button>'
    + '</div>';
  let valgtType = type;
  const vis = function(){
    kort.querySelectorAll('.ntp-tm-del').forEach(function(d){ d.hidden = d.dataset.for !== valgtType; });
    kort.querySelectorAll('.ntp-tm-type').forEach(function(b){ b.classList.toggle('valgt', b.dataset.type === valgtType); });
  };
  vis();
  const start = ntpTmSkjemaAvtrykk(kort);
  /* «Bare denne enheten» og mottakerne utelukker hverandre. */
  kort.querySelectorAll('[data-hvem]').forEach(function(h){
    h.addEventListener('change', function(){
      if(h.dataset.hvem === 'enhet' && h.checked) kort.querySelectorAll('[data-hvem]:not([data-hvem="enhet"])').forEach(function(x){ x.checked = false; });
      if(h.dataset.hvem !== 'enhet' && h.checked) kort.querySelector('[data-hvem="enhet"]').checked = false;
      if(!kort.querySelector('[data-hvem]:checked')) kort.querySelector('[data-hvem="enhet"]').checked = true;
    });
  });
  kort.onclick = async function(e){
    const tb = e.target.closest('.ntp-tm-type');
    if(tb && !tb.disabled){ valgtType = tb.dataset.type; vis(); return; }
    const rask = e.target.closest('.ntp-tm-rask');
    if(rask){
      const m = Number(rask.dataset.min);
      kort.querySelector('#ntpTmT').value = Math.floor(m / 60);
      kort.querySelector('#ntpTmM').value = m % 60;
      kort.querySelector('#ntpTmS').value = 0;
      return;
    }
    const b = e.target.closest('[data-gjor]');
    if(!b) return;
    if(b.dataset.gjor === 'avbryt'){
      /* Avbryt-regelen: spoer bare naar noe er skrevet inn og endret. */
      if(ntpTmSkjemaAvtrykk(kort) !== start && kort.querySelector('#ntpTmNavn').value.trim()
         && typeof bekreft === 'function' && !(await bekreft('Forkaste det du har skrevet?', { jaTekst:'Forkast' }))) return;
      ntpTmListe();
      return;
    }
    if(b.dataset.gjor !== 'lagre') return;
    const feil = kort.querySelector('#ntpTmFeil');
    const visFeil = function(tekst){ feil.textContent = tekst; feil.hidden = false; };
    const navn = kort.querySelector('#ntpTmNavn').value.trim();
    const hvem = [].slice.call(kort.querySelectorAll('[data-hvem]:checked'))
      .map(function(h){ return h.dataset.hvem; }).filter(function(h){ return h !== 'enhet'; });
    const nyT = Object.assign({}, t || {
      id: 'tm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      laget: Date.now(), enhet: ntpTmEnhet(), av: ntpTmMeg()[0] || null
    }, { type: valgtType, navn: navn, for: hvem });
    /* Laget fra en koketid i en oppskrift: retten huskes, saa matlagingen
       kan vise og slette sine egne nedtellinger. */
    if(!t && forslag && forslag.mat) nyT.mat = forslag.mat;
    if(valgtType === 'alarm'){
      const v = kort.querySelector('#ntpTmAlarm').value;
      if(!/^\d{2}:\d{2}$/.test(v)){ visFeil('Velg et klokkeslett.'); return; }
      const d = new Date(); d.setHours(Number(v.slice(0, 2)), Number(v.slice(3, 5)), 0, 0);
      if(d.getTime() <= Date.now()) d.setDate(d.getDate() + 1);
      nyT.mal = d.getTime();
    }else if(valgtType === 'nedtelling'){
      const tall = function(id){ return Math.max(0, Number(kort.querySelector(id).value) || 0); };
      const ms = (tall('#ntpTmT') * 3600 + tall('#ntpTmM') * 60 + tall('#ntpTmS')) * 1000;
      if(ms < 1000){ visFeil('Sett hvor lenge nedtellingen skal gå.'); return; }
      nyT.mal = Date.now() + ms;
      nyT.lengde = ms;
    }else if(!t || t.type !== 'stoppeklokke'){
      nyT.start = Date.now(); nyT.akk = 0; delete nyT.mal;
    }
    b.disabled = true;
    try{ await ntpTmLagre(nyT); ntpTmListe(); }
    catch(err){ b.disabled = false; visFeil(err.message || String(err)); }
  };
}
function ntpTmSkjemaAvtrykk(kort){
  return [].slice.call(kort.querySelectorAll('input')).map(function(i){ return i.type === 'checkbox' ? i.checked : i.value; }).join('|');
}

/* ---------- Ringingen ---------- */
let ntpTmLydKtx = null;
let ntpTmLydTimer = null;
/* Lyden maa vekkes av et trykk foer den kan spille (iOS). Vekkes ved
   hvert trykk, som plinget paa fellesenhetene. */
function ntpTmLyd(){
  try{
    if(!ntpTmLydKtx){
      const K = window.AudioContext || window.webkitAudioContext;
      if(K) ntpTmLydKtx = new K();
    }
    if(ntpTmLydKtx && ntpTmLydKtx.state === 'suspended') ntpTmLydKtx.resume();
  }catch(e){}
}
window.addEventListener('pointerdown', ntpTmLyd, true);
function ntpTmPip(){
  const k = ntpTmLydKtx;
  if(!k) return;
  try{
    [0, 0.22, 0.44].forEach(function(t){
      const o = k.createOscillator(), g = k.createGain(), s = k.currentTime + t;
      o.type = 'sine'; o.frequency.value = 1046;
      g.gain.setValueAtTime(0.0001, s);
      g.gain.exponentialRampToValueAtTime(0.35, s + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, s + 0.18);
      o.connect(g); g.connect(k.destination); o.start(s); o.stop(s + 0.2);
    });
  }catch(e){}
}
function ntpTmRing(t){
  ntpTmRinger = t.id;
  let bak = document.getElementById('ntpTmRingBak');
  if(!bak){
    bak = document.createElement('div');
    bak.id = 'ntpTmRingBak';
    bak.className = 'dlg-bak ntp-tm-ringbak';
    bak.innerHTML = '<div class="dlg-kort ntp-tm-ringkort" role="alertdialog"></div>';
    document.body.appendChild(bak);
  }
  const kort = bak.querySelector('.ntp-tm-ringkort');
  kort.innerHTML = '<div class="ntp-tm-ringikon ntp-tm-' + t.type + '">' + ntpTmSymbol(t) + '</div>'
    + '<div class="ntp-tm-ringnavn">' + ntpEsc(t.navn || NTP_TM_TYPER[t.type]) + '</div>'
    + '<div class="ntp-tm-ringtekst">' + (t.type === 'alarm' ? 'Alarm kl. ' + ntpTmKlokkeslett(t.mal) : 'Nedtellingen er ferdig') + '</div>'
    + '<div class="dlg-rad">'
    +   '<button type="button" class="dlg-knapp nei" data-gjor="slumre">Slumre 5 min</button>'
    +   '<button type="button" class="dlg-knapp ja" data-gjor="stopp">Stopp</button>'
    + '</div>';
  kort.onclick = async function(e){
    const b = e.target.closest('[data-gjor]');
    if(!b) return;
    ntpTmStille();
    try{
      if(b.dataset.gjor === 'stopp') await ntpTmFjern(t);
      else await ntpTmLagre(Object.assign({}, t, { mal: Date.now() + NTP_TM_SLUMRE }));
    }catch(err){ ntpTmVarsle(err.message || String(err)); }
  };
  bak.hidden = false;
  ntpTmPip();
  clearInterval(ntpTmLydTimer);
  const slutt = Date.now() + 10 * 60000;    /* ringer i maks ti minutter */
  ntpTmLydTimer = setInterval(function(){
    /* Stoppet paa en annen skjerm: borte fra lista ved neste henting. */
    if(!ntpTmAlle().some(function(x){ return x.id === t.id && x.mal <= Date.now(); }) || Date.now() > slutt){ ntpTmStille(); return; }
    ntpTmPip();
  }, 1500);
  ntpTmTegn();
}
function ntpTmStille(){
  clearInterval(ntpTmLydTimer); ntpTmLydTimer = null;
  ntpTmRinger = null;
  const bak = document.getElementById('ntpTmRingBak');
  if(bak) bak.hidden = true;
  ntpTmTegn();
}

/* Utenfra: aapner skjemaet med et forslag ferdig utfylt - en koketid
   trykket i en oppskrift. Man velger hvem og trykker Lagre selv. */
function ntpTmNyForslag(forslag){
  ntpTmLyd();
  if(ntpTmAlle().length >= NTP_TM_MAKS){ ntpTmVarsle('Det går alt ' + NTP_TM_MAKS + ' her. Slett én først.'); return; }
  ntpTmSkjema(null, forslag || {});
  ntpTmBak().hidden = false;
}
/* Matlagingen har startet eller sluttet paa denne sida. */
window.ntpMatTegn = function(){ ntpTmTegn(); };
/* For matlagingen: nedtellingene som er laget fra en rett, og sletting.
   Sletting her er det samme som Slett i lista ved klokka. */
window.ntpTimereFor = function(matId){
  return ntpTmAlle().filter(function(t){ return t.mat && t.mat === matId; });
};
window.ntpTimerSlett = async function(id){
  const t = ntpTmAlle().filter(function(x){ return x.id === id; })[0];
  if(t) await ntpTmFjern(t);
};
window.ntpTimerKort = function(t){ return ntpTmKort(t); };

function ntpTmStart(){
  ntpTmLesLokal();
  ntpTmTegn();
  ntpTmHent();
  setInterval(function(){ if(!document.hidden) ntpTmHent(); }, NTP_TM_HENT);
  document.addEventListener('visibilitychange', function(){ if(!document.hidden) ntpTmHent(); });
  window.addEventListener('storage', function(e){
    if(e.key === NTP_TM_LOKAL) ntpTmLesLokal();
    if(e.key === NTP_TM_LOKAL || e.key === NTP_MAT) ntpTmTegn();
  });
}

if(document.getElementById('neamTopp')) ntpTegn();
else document.addEventListener('DOMContentLoaded', ntpTegn);
