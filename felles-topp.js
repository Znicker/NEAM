/* ============================================================
   felles-topp.js - topplinja, lik paa alle sidene
   ------------------------------------------------------------
   Fra 8. november 2026. Sidas ikon og navn (lenke til forsiden),
   laaseikonet paa fellesenhetene, vaeret med stedet ved siden av, og
   klapptavla med dato - og til venstre for den alarmene, nedtellingene
   og stoppeklokkene som gaar.

   Bruk: et tomt element der toppen skal staa,
     <header class="ntp" id="neamTopp" data-ikon="sikkerhet" data-navn="Sikkerhet"></header>
   og fila lastet ETTER felles-neam.js (klapptavla, ikonene og laasen
   kommer derfra). data-hjem setter hvor ikonet lenker (spillene gaar
   tilbake til dashet sitt); uten den: forsiden. Tomt data-navn gir bare
   ikonet. Toppen tegnes med en gang fila leses.

   Vaeret viser i dag. En side som blar i dager (dashene) setter
   window.ntpVaerDag = function(){ return <Date> } og kaller
   ntpVaerTegn() naar dagen skifter - da foelger vaeret og vaerboblen
   den dagen.

   Posisjonen deles med dashene (fh_pos i localStorage): spurt én gang,
   husket etterpaa. Uten svar staar Arendal.

   Matlagingen (oppskrifter.html) legger «neam-matlaging» i localStorage
   mens en rett lages. Da staar matlagingsikonet til venstre for klokka,
   med en ring som gaar rundt og tiden som har gaatt, og det leder
   tilbake dit.
   ============================================================ */

const NTP_STED = { lat: 58.4614, lon: 8.7724, navn: 'Arendal' };  /* som STED paa dashene */
const NTP_DAGER = ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag'];
const NTP_MND = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august',
  'september', 'oktober', 'november', 'desember'];
const NTP_WMO = {
  0:['☀️','Klarvær'], 1:['🌤️','Stort sett klart'], 2:['⛅','Delvis skyet'], 3:['☁️','Skyet'],
  45:['🌫️','Tåke'], 48:['🌫️','Rimtåke'],
  51:['🌦️','Lett yr'], 53:['🌦️','Yr'], 55:['🌧️','Kraftig yr'],
  56:['🌧️','Underkjølt yr'], 57:['🌧️','Underkjølt yr'],
  61:['🌦️','Lett regn'], 63:['🌧️','Regn'], 65:['🌧️','Kraftig regn'],
  66:['🌧️','Underkjølt regn'], 67:['🌧️','Underkjølt regn'],
  71:['🌨️','Lett snø'], 73:['🌨️','Snø'], 75:['❄️','Kraftig snø'], 77:['🌨️','Snøkorn'],
  80:['🌦️','Regnbyger'], 81:['🌧️','Regnbyger'], 82:['⛈️','Kraftige byger'],
  85:['🌨️','Snøbyger'], 86:['❄️','Kraftige snøbyger'],
  95:['⛈️','Torden'], 96:['⛈️','Torden med hagl'], 99:['⛈️','Kraftig torden']
};
/* Vaeret hentes paa nytt naar det er eldre enn dette. */
const NTP_VAER_MAKS = 15 * 60000;

let ntpPos = { lat: NTP_STED.lat, lon: NTP_STED.lon, navn: NTP_STED.navn };
let ntpVaerHentet = 0;
let ntpVaerData = null;

function ntpEsc(s){
  return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
    return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
  });
}
function ntpTo(n){ return String(n).padStart(2, '0'); }
function ntpDatoNokkel(d){ return d.getFullYear() + '-' + ntpTo(d.getMonth() + 1) + '-' + ntpTo(d.getDate()); }

const NTP_STED_SVG = '<svg class="ntp-sted-ikon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"'
  + ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
  + '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>';

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
    + '<a class="ntp-mat" id="ntpMat" href="/oppskrifter.html" hidden>'
    +   '<span class="ntp-mat-ikon"></span><b id="ntpMatTid"></b>'
    + '</a>'
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
    if(typeof window.ntpMatGaaTil === 'function'){ e.preventDefault(); window.ntpMatGaaTil(); }
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
      ntpPos = { lat: p.lat, lon: p.lon, navn: p.navn || 'Din posisjon' };
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
    ntpPos = {
      lat: Math.round(p.coords.latitude * 10000) / 10000,
      lon: Math.round(p.coords.longitude * 10000) / 10000,
      navn: 'Din posisjon'
    };
    try{
      const g = await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client'
        + '?latitude=' + ntpPos.lat + '&longitude=' + ntpPos.lon + '&localityLanguage=no');
      if(g.ok){
        const gd = await g.json();
        const n = gd.locality || gd.city || gd.principalSubdivision;
        if(n) ntpPos.navn = n;
      }
    }catch(e){}
    try{ localStorage.setItem('fh_pos', JSON.stringify(Object.assign({ presis:true }, ntpPos))); }catch(e){}
  }catch(e){ /* Avslaatt eller tidsavbrudd - Arendal duger. */ }
}

/* ---------- Vaeret ---------- */
function ntpVkode(c){ return NTP_WMO[c] || ['🌡️', '—']; }
function ntpRund(v){ return Math.round(v); }
function ntpVindPil(grader){
  if(grader === null || grader === undefined) return '';
  const v = (Number(grader) + 180) % 360;
  return '<svg class="ntp-pil" viewBox="0 0 24 24" aria-hidden="true" style="transform:rotate(' + v + 'deg)">'
    + '<path d="M12 3 L12 21 M12 3 L7 9 M12 3 L17 9" fill="none" stroke="currentColor" stroke-width="2.4"'
    + ' stroke-linecap="round" stroke-linejoin="round"/></svg>';
}
/* Dagen vaeret gjelder: den sida viser, ellers i dag. */
function ntpDag(){
  try{ if(typeof window.ntpVaerDag === 'function'){ const d = window.ntpVaerDag(); if(d instanceof Date) return d; } }catch(e){}
  return new Date();
}
async function ntpVaer(){
  ntpVaerHentet = Date.now();
  try{
    const r = await fetch('https://api.open-meteo.com/v1/forecast'
      + '?latitude=' + ntpPos.lat + '&longitude=' + ntpPos.lon
      + '&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m'
      + '&hourly=temperature_2m,weather_code,precipitation,wind_speed_10m,wind_direction_10m'
      + '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,wind_direction_10m_dominant,sunrise,sunset'
      + '&timezone=Europe%2FOslo&forecast_days=5');
    if(!r.ok) return;
    ntpVaerData = await r.json();
  }catch(e){ return; }
  ntpVaerTegn();
  ntpSjo();
}
function ntpVaerTegn(){
  const d = ntpVaerData, el = document.getElementById('ntpVaer');
  if(!d || !el || !d.current) return;
  const dag = ntpDag(), nokkel = ntpDatoNokkel(dag);
  const idag = nokkel === ntpDatoNokkel(new Date());
  const i = d.daily ? d.daily.time.indexOf(nokkel) : -1;
  let ikon, stort, tekst, under;
  if(idag){
    const n = d.current, iv = ntpVkode(n.weather_code);
    ikon = iv[0]; tekst = iv[1]; stort = ntpRund(n.temperature_2m) + '°';
    under = 'Føles som ' + ntpRund(n.apparent_temperature) + '° · '
      + ntpVindPil(n.wind_direction_10m) + ntpRund(n.wind_speed_10m) + ' km/t';
  }else if(i >= 0){
    const iv = ntpVkode(d.daily.weather_code[i]);
    ikon = iv[0]; tekst = iv[1]; stort = ntpRund(d.daily.temperature_2m_max[i]) + '°';
    under = 'Lavest ' + ntpRund(d.daily.temperature_2m_min[i]) + '° · '
      + ntpVindPil(d.daily.wind_direction_10m_dominant[i]) + ntpRund(d.daily.wind_speed_10m_max[i]) + ' km/t';
  }else{
    ikon = '·'; tekst = 'Ingen værmelding så langt fram'; stort = '–'; under = '';
  }
  el.innerHTML =
      '<button type="button" class="ntp-vaer-naa" aria-label="Værmeldingen">'
    +   '<span class="ntp-vaer-ikon">' + ikon + '</span>'
    +   '<span class="ntp-vaer-tall">'
    +     '<span class="ntp-grad">' + stort + '</span>'
    +     '<span class="ntp-tekst">' + ntpEsc(tekst) + '</span>'
    +     (under ? '<span class="ntp-vind">' + under + '</span>' : '')
    +   '</span>'
    + '</button>'
    + '<span class="ntp-sted">' + NTP_STED_SVG + '<span>' + ntpEsc(ntpPos.navn) + '</span></span>'
    + '<span class="ntp-sjo" id="ntpSjo"></span>';
  el.hidden = false;
  el.querySelector('.ntp-vaer-naa').addEventListener('click', ntpVaerBoble);
  if(ntpSjoSist) ntpSjoTegn(ntpSjoSist);
}

/* Vaerboblen - fra Kjoekken dash, naa paa alle sidene: hele doegnet
   hver tredje time, og langtidsvarselet under. Lukkes med kryss, trykk
   utenfor eller Escape. */
function ntpVaerBoble(ev){
  if(ev) ev.stopPropagation();
  const d = ntpVaerData;
  if(!d) return;
  let bak = document.getElementById('ntpVbBak');
  if(!bak){
    bak = document.createElement('div');
    bak.id = 'ntpVbBak';
    bak.className = 'ntp-vb-bak';
    bak.innerHTML = '<div class="ntp-vb" role="dialog" aria-label="Værmeldingen">'
      + '<button type="button" class="ntp-vb-lukk" aria-label="Lukk">×</button><div class="ntp-vb-inn"></div></div>';
    bak.addEventListener('click', function(e){ if(e.target === bak || e.target.closest('.ntp-vb-lukk')) bak.hidden = true; });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape') bak.hidden = true; });
    document.body.appendChild(bak);
  }
  const dag = ntpDag(), dato = ntpDatoNokkel(dag);
  const i = d.daily.time.indexOf(dato);
  let topp = '<div class="ntp-vb-tittel">' + ntpEsc(NTP_DAGER[dag.getDay()] + ' ' + dag.getDate() + '. ' + NTP_MND[dag.getMonth()]) + '</div>';
  if(i >= 0){
    const sol = function(s){ return s ? String(s).slice(11, 16) : ''; };
    topp += '<div class="ntp-vb-sammendrag">' + ntpEsc(ntpVkode(d.daily.weather_code[i])[1])
      + ' · ' + ntpRund(d.daily.temperature_2m_min[i]) + '° til ' + ntpRund(d.daily.temperature_2m_max[i]) + '°'
      + ' · ' + ntpVindPil(d.daily.wind_direction_10m_dominant[i]) + ntpRund(d.daily.wind_speed_10m_max[i]) + ' km/t'
      + (d.daily.sunrise ? ' · sol ' + sol(d.daily.sunrise[i]) + '–' + sol(d.daily.sunset[i]) : '') + '</div>';
  }
  let rader = '';
  const h = d.hourly;
  for(let k = 0; k < h.time.length; k++){
    if(h.time[k].slice(0, 10) !== dato || Number(h.time[k].slice(11, 13)) % 3 !== 0) continue;
    const mm = h.precipitation ? h.precipitation[k] : 0;
    rader += '<tr><td class="ntp-vb-kl">' + h.time[k].slice(11, 16) + '</td>'
      + '<td>' + ntpVkode(h.weather_code[k])[0] + '</td>'
      + '<td class="ntp-vb-gr">' + ntpRund(h.temperature_2m[k]) + '°</td>'
      + '<td class="ntp-vb-regn">' + (mm > 0.05 ? mm.toFixed(1).replace('.', ',') + ' mm' : '') + '</td>'
      + '<td class="ntp-vb-vind">' + ntpVindPil(h.wind_direction_10m[k]) + ntpRund(h.wind_speed_10m[k]) + '</td></tr>';
  }
  let dager = '';
  for(let k = 0; k < d.daily.time.length; k++){
    const dt = new Date(d.daily.time[k] + 'T12:00:00');
    const mm = d.daily.precipitation_sum[k];
    dager += '<tr' + (d.daily.time[k] === dato ? ' class="na"' : '') + '>'
      + '<td class="ntp-vb-dagnavn">' + ntpEsc(NTP_DAGER[dt.getDay()].slice(0, 3) + ' ' + dt.getDate() + '.') + '</td>'
      + '<td>' + ntpVkode(d.daily.weather_code[k])[0] + '</td>'
      + '<td class="ntp-vb-gr">' + ntpRund(d.daily.temperature_2m_min[k]) + '° / ' + ntpRund(d.daily.temperature_2m_max[k]) + '°</td>'
      + '<td class="ntp-vb-regn">' + (mm > 0.05 ? mm.toFixed(1).replace('.', ',') + ' mm' : '') + '</td>'
      + '<td class="ntp-vb-vind">' + ntpVindPil(d.daily.wind_direction_10m_dominant[k]) + ntpRund(d.daily.wind_speed_10m_max[k]) + '</td></tr>';
  }
  bak.querySelector('.ntp-vb-inn').innerHTML = topp
    + '<div class="ntp-vb-bolk">Time for time</div>'
    + (rader ? '<table class="ntp-vb-tabell">' + rader + '</table>' : '<div class="ntp-vb-tom">Ingen timevarsel så langt fram.</div>')
    + '<div class="ntp-vb-bolk">Langtidsvarsel</div><table class="ntp-vb-tabell">' + dager + '</table>';
  bak.hidden = false;
}

/* ---------- Sjoetemperaturen ----------
   Samme kilder som paa dashene: /api/sjo, ellers KV-noekkelen «sjo». */
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
  el.className = 'ntp-sjo' + (gammel ? ' gammel' : '');
  el.innerHTML = '<span class="ntp-sjo-ikon">🌊</span>'
    + '<span class="ntp-sjo-grad">' + d.temp.toFixed(1).replace('.', ',') + '°</span>';
  el.title = 'Sjøen' + (d.dybde ? ', ' + d.dybde + ' m' : '') + (gammel ? ' – gammel måling' : '');
}

async function ntpVaerStart(){
  await ntpFinnPos();
  ntpVaer();
  setInterval(function(){ if(!document.hidden) ntpVaer(); }, NTP_VAER_MAKS);
  document.addEventListener('visibilitychange', function(){
    if(!document.hidden){
      ntpKlokke();
      if(Date.now() - ntpVaerHentet > NTP_VAER_MAKS) ntpVaer();
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

/* ---------- Matlagingen ----------
   Settes av oppskrifter.html: {id, tittel, porsjoner, start, ...}. */
const NTP_MAT = 'neam-matlaging';
function ntpMat(){
  try{
    const m = JSON.parse(localStorage.getItem(NTP_MAT) || 'null');
    return (m && m.id && m.start) ? m : null;
  }catch(e){ return null; }
}

/* Ikonet til venstre for klokka. Gir matlagingen tilbake, eller null. */
function ntpMatIkon(){
  const a = document.getElementById('ntpMat');
  const mat = ntpMat();
  if(!a) return mat;
  a.hidden = !mat;
  if(!mat) return null;
  const ikon = a.querySelector('.ntp-mat-ikon');
  if(!ikon.firstChild){
    const url = (typeof neamIkonUrl === 'function') ? neamIkonUrl('matlaging') : '/bilder/ikoner/matlaging.png';
    ikon.innerHTML = '<img src="' + ntpEsc(url) + '" alt="" width="512" height="511">';
  }
  a.title = 'Matlaging: ' + (mat.tittel || '') + ' – trykk for å gå tilbake';
  a.setAttribute('aria-label', a.title);
  document.getElementById('ntpMatTid').textContent = ntpTmVarighet(Date.now() - mat.start);
  return mat;
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
      + NTP_TM_SVG[t.type] + '<b>' + ntpTmKort(t) + '</b></span>';
  }).join('');
  const panel = document.getElementById('ntpTmBak');
  if(panel && !panel.hidden && panel.dataset.vis === 'liste') ntpTmListe();
  /* Sekundene teller bare naar noe gaar - ogsaa en alarm langt fram,
     ellers ville ingen sett at tiden kom. */
  const trenger = alle.length > 0 || !!mat;
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
  const mat = ntpMat(), mb = document.getElementById('ntpMatTid');
  if(mat && mb) mb.textContent = ntpTmVarighet(naa - mat.start);
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
          + '<span class="ntp-tm-radikon ntp-tm-' + t.type + '">' + NTP_TM_SVG[t.type] + '</span>'
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
  kort.innerHTML = '<div class="ntp-tm-ringikon ntp-tm-' + t.type + '">' + NTP_TM_SVG[t.type] + '</div>'
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
