/* ============================================================
   felles-topp.js - topplinja, lik paa alle sidene
   ------------------------------------------------------------
   Fra 8. november 2026. Samme topp som dashene: sidas ikon og navn
   (lenke til forsiden), laaseikonet paa fellesenhetene, vaeret naa,
   stedet og klapptavla med dato.

   Bruk: et tomt element der toppen skal staa,
     <header class="ntp" id="neamTopp" data-ikon="sikkerhet" data-navn="Sikkerhet"></header>
   og fila lastet ETTER felles-neam.js. data-hjem setter hvor ikonet
   lenker (spillene gaar tilbake til dashet sitt); uten den: forsiden. (klapptavla, ikonene og laasen
   kommer derfra). Toppen tegnes med en gang fila leses.

   Dashene har fortsatt sin egen topp: vaeret der foelger dagen man ser
   paa, og klokka skifter dagen klokka 20. Her er vaeret alltid naa.

   Posisjonen deles med dashene (fh_pos i localStorage): spurt én gang,
   husket etterpaa. Uten svar staar Arendal.
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

function ntpEsc(s){
  return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
    return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
  });
}

function ntpTegn(){
  const t = document.getElementById('neamTopp');
  if(!t || t.dataset.klar) return;
  t.dataset.klar = '1';
  const ikon = t.dataset.ikon || 'neam';
  /* Tomt data-navn gir bare ikonet - forsidens logo sier navnet selv. */
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
    + '<div class="ntp-vaer" id="ntpVaer" hidden></div>'
    + '<div class="ntp-sted" id="ntpStedRad" hidden>'
    +   '<svg class="ntp-sted-ikon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"'
    +   ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
    +   '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>'
    +   '<span id="ntpSted"></span>'
    + '</div>'
    + '<div class="ntp-klokke">'
    +   '<div class="ntp-tid" id="ntpTid">--:--</div>'
    +   '<div class="ntp-dato" id="ntpDato">&nbsp;</div>'
    + '</div>'
    + '</div>';
  if(typeof neamLaasTegn === 'function') neamLaasTegn();
  ntpKlokke();
  setInterval(ntpKlokke, 10000);
  ntpVaerStart();
}

function ntpKlokke(){
  const el = document.getElementById('ntpTid');
  if(!el) return;
  /* Klapptavla bygger og flipper seg selv - se neamFlipKlokke i felles-neam.js. */
  if(typeof neamFlipKlokke === 'function') neamFlipKlokke(el);
  else{
    const n0 = new Date();
    el.textContent = String(n0.getHours()).padStart(2, '0') + ':' + String(n0.getMinutes()).padStart(2, '0');
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

/* ---------- Vaeret naa ---------- */
function ntpVindPil(grader){
  if(grader === null || grader === undefined) return '';
  const v = (Number(grader) + 180) % 360;
  return '<svg class="ntp-pil" viewBox="0 0 24 24" aria-hidden="true" style="transform:rotate(' + v + 'deg)">'
    + '<path d="M12 3 L12 21 M12 3 L7 9 M12 3 L17 9" fill="none" stroke="currentColor" stroke-width="2.4"'
    + ' stroke-linecap="round" stroke-linejoin="round"/></svg>';
}
async function ntpVaer(){
  ntpVaerHentet = Date.now();
  let d;
  try{
    const r = await fetch('https://api.open-meteo.com/v1/forecast'
      + '?latitude=' + ntpPos.lat + '&longitude=' + ntpPos.lon
      + '&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m'
      + '&timezone=Europe%2FOslo');
    if(!r.ok) return;
    d = await r.json();
  }catch(e){ return; }
  const n = d && d.current;
  const el = document.getElementById('ntpVaer');
  if(!n || !el) return;
  const iv = NTP_WMO[n.weather_code] || ['🌡️', '—'];
  el.innerHTML =
      '<span class="ntp-vaer-ikon">' + iv[0] + '</span>'
    + '<span class="ntp-vaer-tall">'
    +   '<span class="ntp-grad">' + Math.round(n.temperature_2m) + '°</span>'
    +   '<span class="ntp-tekst">' + ntpEsc(iv[1]) + '</span>'
    +   '<span class="ntp-vind">Føles som ' + Math.round(n.apparent_temperature) + '° · '
    +     ntpVindPil(n.wind_direction_10m) + Math.round(n.wind_speed_10m) + ' km/t</span>'
    + '</span>'
    + '<span class="ntp-sjo" id="ntpSjo"></span>';
  el.hidden = false;
  document.getElementById('ntpSted').textContent = ntpPos.navn;
  document.getElementById('ntpStedRad').hidden = false;
  ntpSjo();
}

/* ---------- Sjoetemperaturen ----------
   Samme kilder som paa dashene: /api/sjo, ellers KV-noekkelen «sjo». */
async function ntpSjo(){
  const el = document.getElementById('ntpSjo');
  if(!el) return;
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
  if(!d || typeof d.temp !== 'number'){ el.innerHTML = ''; return; }
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

if(document.getElementById('neamTopp')) ntpTegn();
else document.addEventListener('DOMContentLoaded', ntpTegn);
