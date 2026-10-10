/* ============================================================
   Neam - Roborock (Neamow, gressklipperen), serversiden

   Ligger i repoet som:  functions/api/roborock.js
   Gir endepunktet:      /api/roborock

   HVORFOR DEN FINNES
   Neamow er en Roborock RockMow Z115 (modell roborock.mower.a235).
   Homey har ingen app for klipperne, og Roborock har ikke noe aapent
   API. Veien er den samme som Roborock-appen selv bruker: innlogging
   med kode paa e-post mot Roborocks sky, og deretter meldinger til
   klipperen over skyens MQTT. Maalt mot Neamow 10. oktober 2026.

   Protokollen er hentet fra python-roborock (Apache-2.0) og kartformatet
   fra ha-roborock-mower (Matze89x). Ingen av dem er offisielle - Roborock
   kan endre dette uten aa si fra, og da er det her det maa rettes.

   TO VEIER INN, med hver sin grunn:
     HTTPS - innlogging, og én gang for aa finne klipperen og dens
             lokale noekkel. python-roborock holder hjemmedata-kallet
             under 5 i timen og 40 i doegnet; det gjoer vi ogsaa, ved aa
             spoerre bare ved innlogging.
     MQTT  - alt som skjer NAA: kartet (get_map_diff) og full status
             (GET_ROBOT_STATUS). Én kort forbindelse per spoersmaal.

   ALT ER SKREVET HER, uten npm: MD5 og AES finnes ikke i den formen
   protokollen vil ha dem i WebCrypto (AES-ECB mangler helt), og repoet
   har ikke noe byggesteg. Begge er smaa og testet mot Node sin crypto.

   HVA NETTLESEREN SER
   Ingen tokener, ingen lokal noekkel, ingen GPS. Kartet sendes i
   klipperens egne meter fra ladestasjonen - ikke koordinater som peker
   ut huset.

   NOEKKELEN LIGGER UTENFOR `fh:` MED VILJE - se ms.js og homey.js.
   ============================================================ */

import { connect } from 'cloudflare:sockets';

const NOKKEL  = 'auth:roborock:hus';
const VENTER  = 'auth:roborock:venter';
const BASER   = ['https://euiot.roborock.com', 'https://usiot.roborock.com',
                 'https://cniot.roborock.com', 'https://ruiot.roborock.com'];
const SALT    = 'TXdfu$jyZ#TZHsg4';
const MQTT_VENT = 12000;

/* Alt svares med 200, ogsaa feil - Cloudflare bytter kroppen paa 5xx. */
function svar(obj){
  return new Response(JSON.stringify(obj), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}

/* Access-identiteten - samme tre veier som homey.js og ms.js. */
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

/* ============================================================
   Bytes
   ============================================================ */
const TE = new TextEncoder();
const TD = new TextDecoder();

function sammen(){
  let n = 0;
  for(const d of arguments) n += d.length;
  const ut = new Uint8Array(n);
  let i = 0;
  for(const d of arguments){ ut.set(d, i); i += d.length; }
  return ut;
}
function hex(b){
  let s = '';
  for(const x of b) s += x.toString(16).padStart(2, '0');
  return s;
}
function b64(b){
  let s = '';
  for(const x of b) s += String.fromCharCode(x);
  return btoa(s);
}
function tilfeldig(n){
  const b = new Uint8Array(n);
  crypto.getRandomValues(b);
  return b;
}
function tilfeldigTall(fra, til){
  const b = tilfeldig(4);
  const v = ((b[0] << 24) | (b[1] << 16) | (b[2] << 8) | b[3]) >>> 0;
  return fra + (v % (til - fra + 1));
}
function tilfeldigTekst(n){
  const tegn = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let s = '';
  for(const x of tilfeldig(n)) s += tegn[x % tegn.length];
  return s;
}

/* ============================================================
   MD5 - protokollen bruker den til noekler og navn, ikke til sikkerhet
   ============================================================ */
const MD5_K = new Uint32Array(64);
for(let i = 0; i < 64; i++) MD5_K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296) >>> 0;
const MD5_S = [7,12,17,22,7,12,17,22,7,12,17,22,7,12,17,22,
               5,9,14,20,5,9,14,20,5,9,14,20,5,9,14,20,
               4,11,16,23,4,11,16,23,4,11,16,23,4,11,16,23,
               6,10,15,21,6,10,15,21,6,10,15,21,6,10,15,21];

function md5(data){
  if(typeof data === 'string') data = TE.encode(data);
  const len = data.length;
  const blokker = ((len + 8) >>> 6) + 1;
  const buf = new Uint8Array(blokker * 64);
  buf.set(data);
  buf[len] = 0x80;
  const dv = new DataView(buf.buffer);
  dv.setUint32(blokker * 64 - 8, (len * 8) >>> 0, true);
  dv.setUint32(blokker * 64 - 4, Math.floor(len / 536870912), true);
  let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;
  const M = new Uint32Array(16);
  for(let o = 0; o < buf.length; o += 64){
    for(let j = 0; j < 16; j++) M[j] = dv.getUint32(o + j * 4, true);
    let A = a0, B = b0, C = c0, D = d0;
    for(let i = 0; i < 64; i++){
      let F, g;
      if(i < 16){      F = (B & C) | (~B & D); g = i; }
      else if(i < 32){ F = (D & B) | (~D & C); g = (5 * i + 1) % 16; }
      else if(i < 48){ F = B ^ C ^ D;          g = (3 * i + 5) % 16; }
      else {           F = C ^ (B | ~D);       g = (7 * i) % 16; }
      F = (F + A + MD5_K[i] + M[g]) >>> 0;
      A = D; D = C; C = B;
      B = (B + ((F << MD5_S[i]) | (F >>> (32 - MD5_S[i])))) >>> 0;
    }
    a0 = (a0 + A) >>> 0; b0 = (b0 + B) >>> 0; c0 = (c0 + C) >>> 0; d0 = (d0 + D) >>> 0;
  }
  const ut = new Uint8Array(16);
  const uv = new DataView(ut.buffer);
  uv.setUint32(0, a0, true); uv.setUint32(4, b0, true);
  uv.setUint32(8, c0, true); uv.setUint32(12, d0, true);
  return ut;
}
function md5hex(s){ return hex(md5(s)); }

/* ============================================================
   AES-128 - ECB for meldingene, CBC med null-IV for kartet
   ============================================================ */
const AES_S  = new Uint8Array(256);
const AES_SI = new Uint8Array(256);
(function(){
  const rotl = function(x, n){ return ((x << n) | (x >>> (8 - n))) & 0xff; };
  let p = 1, q = 1;
  do{
    p = (p ^ (p << 1) ^ (p & 0x80 ? 0x1b : 0)) & 0xff;
    q ^= q << 1; q ^= q << 2; q ^= q << 4; q &= 0xff;
    if(q & 0x80) q ^= 0x09;
    AES_S[p] = (q ^ rotl(q, 1) ^ rotl(q, 2) ^ rotl(q, 3) ^ rotl(q, 4) ^ 0x63) & 0xff;
  }while(p !== 1);
  AES_S[0] = 0x63;
  for(let i = 0; i < 256; i++) AES_SI[AES_S[i]] = i;
})();
function xt(b){ return ((b << 1) ^ (b & 0x80 ? 0x1b : 0)) & 0xff; }
function gmul(a, b){
  let r = 0;
  while(b){ if(b & 1) r ^= a; a = xt(a); b >>= 1; }
  return r;
}
function aesNokkel(k){
  const w = new Uint8Array(176);
  w.set(k);
  let rcon = 1;
  for(let i = 16; i < 176; i += 4){
    let t = [w[i - 4], w[i - 3], w[i - 2], w[i - 1]];
    if(i % 16 === 0){
      t = [AES_S[t[1]] ^ rcon, AES_S[t[2]], AES_S[t[3]], AES_S[t[0]]];
      rcon = xt(rcon);
    }
    for(let j = 0; j < 4; j++) w[i + j] = w[i - 16 + j] ^ t[j];
  }
  return w;
}
function aesInn(s, w, r){ for(let i = 0; i < 16; i++) s[i] ^= w[r * 16 + i]; }
function aesKrypter(w, inn){
  const s = Uint8Array.from(inn);
  const t = new Uint8Array(16);
  aesInn(s, w, 0);
  for(let r = 1; r <= 10; r++){
    for(let i = 0; i < 16; i++) s[i] = AES_S[s[i]];
    for(let c = 0; c < 4; c++) for(let k = 0; k < 4; k++) t[k + 4 * c] = s[k + 4 * ((c + k) % 4)];
    s.set(t);
    if(r < 10){
      for(let c = 0; c < 4; c++){
        const a0 = s[4*c], a1 = s[4*c+1], a2 = s[4*c+2], a3 = s[4*c+3];
        s[4*c]   = xt(a0) ^ xt(a1) ^ a1 ^ a2 ^ a3;
        s[4*c+1] = a0 ^ xt(a1) ^ xt(a2) ^ a2 ^ a3;
        s[4*c+2] = a0 ^ a1 ^ xt(a2) ^ xt(a3) ^ a3;
        s[4*c+3] = xt(a0) ^ a0 ^ a1 ^ a2 ^ xt(a3);
      }
    }
    aesInn(s, w, r);
  }
  return s;
}
function aesDekrypter(w, inn){
  const s = Uint8Array.from(inn);
  const t = new Uint8Array(16);
  aesInn(s, w, 10);
  for(let r = 9; r >= 0; r--){
    for(let c = 0; c < 4; c++) for(let k = 0; k < 4; k++) t[k + 4 * c] = s[k + 4 * ((c - k + 4) % 4)];
    for(let i = 0; i < 16; i++) s[i] = AES_SI[t[i]];
    aesInn(s, w, r);
    if(r > 0){
      for(let c = 0; c < 4; c++){
        const a0 = s[4*c], a1 = s[4*c+1], a2 = s[4*c+2], a3 = s[4*c+3];
        s[4*c]   = gmul(a0,14) ^ gmul(a1,11) ^ gmul(a2,13) ^ gmul(a3,9);
        s[4*c+1] = gmul(a0,9)  ^ gmul(a1,14) ^ gmul(a2,11) ^ gmul(a3,13);
        s[4*c+2] = gmul(a0,13) ^ gmul(a1,9)  ^ gmul(a2,14) ^ gmul(a3,11);
        s[4*c+3] = gmul(a0,11) ^ gmul(a1,13) ^ gmul(a2,9)  ^ gmul(a3,14);
      }
    }
  }
  return s;
}
function pkcs7(b){
  const n = 16 - (b.length % 16);
  const ut = new Uint8Array(b.length + n);
  ut.set(b);
  ut.fill(n, b.length);
  return ut;
}
function uten7(b){
  const n = b[b.length - 1];
  if(n < 1 || n > 16 || n > b.length) throw new Error('Feil utfylling');
  return b.subarray(0, b.length - n);
}
function ecbKrypter(nokkel, b){
  const w = aesNokkel(nokkel), inn = pkcs7(b), ut = new Uint8Array(inn.length);
  for(let i = 0; i < inn.length; i += 16) ut.set(aesKrypter(w, inn.subarray(i, i + 16)), i);
  return ut;
}
function ecbDekrypter(nokkel, b){
  const w = aesNokkel(nokkel), ut = new Uint8Array(b.length);
  for(let i = 0; i < b.length; i += 16) ut.set(aesDekrypter(w, b.subarray(i, i + 16)), i);
  return uten7(ut);
}
function cbcDekrypter(nokkel, b){
  const w = aesNokkel(nokkel), ut = new Uint8Array(b.length);
  let forrige = new Uint8Array(16);
  for(let i = 0; i < b.length; i += 16){
    const blokk = b.subarray(i, i + 16);
    const d = aesDekrypter(w, blokk);
    for(let j = 0; j < 16; j++) ut[i + j] = d[j] ^ forrige[j];
    forrige = blokk;
  }
  return uten7(ut);
}

/* ---------- CRC32 og gzip ---------- */
const CRC_T = new Uint32Array(256);
for(let n = 0; n < 256; n++){
  let c = n;
  for(let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  CRC_T[n] = c >>> 0;
}
function crc32(b){
  let c = 0xffffffff;
  for(const x of b) c = CRC_T[(c ^ x) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
async function gunzip(b){
  const s = new Blob([b]).stream().pipeThrough(new DecompressionStream('gzip'));
  return new Uint8Array(await new Response(s).arrayBuffer());
}

/* ============================================================
   Roborocks sky over HTTPS
   ============================================================ */

/* Roborock svarer med `code: 200` i kroppen, ikke HTTP-statusen. */
async function rrKall(url, valg){
  const r = await fetch(url, valg);
  const t = await r.text();
  try{ return JSON.parse(t); }
  catch(e){ return { code: r.status, msg: 'Uventet svar fra Roborock (' + r.status + ')' }; }
}
function skjema(o){ return new URLSearchParams(o).toString(); }

/* Klient-id-en er en MD5 av konto + en fast tilfeldig streng. Den lages
   ved foerste kode og brukes videre, saa Roborock ser én enhet. */
function klientHode(konto, ident){
  return b64(md5(konto + ident));
}

/* Hvilken region kontoen bor i. Roborock sier det selv. */
async function finnRegion(konto){
  for(const base of BASER){
    const d = await rrKall(base + '/api/v1/getUrlByEmail?' + skjema({ email: konto, needtwostepauth: 'false' }),
                           { method: 'POST' });
    if(d.code !== 200) continue;
    if(d.data && (d.data.countrycode || d.data.country)){
      return { base: d.data.url, land: d.data.country, landkode: d.data.countrycode };
    }
  }
  return null;
}

async function sendKode(konto, region, ident){
  return rrKall(region.base + '/api/v4/email/code/send', {
    method: 'POST',
    headers: {
      header_clientid: klientHode(konto, ident),
      'Content-Type': 'application/x-www-form-urlencoded',
      header_clientlang: 'en'
    },
    body: skjema({ email: konto, type: 'login', platform: '' })
  });
}

/* Avtaleversjonen maa vaere den siste, ellers svarer innloggingen 3006.
   Faller tilbake til 14.0, som python-roborock. */
async function avtaleVersjon(base, land){
  try{
    const d = await rrKall(base + '/api/v3/app/agreement/latest?' + skjema({ country: land }),
                           { headers: { header_clientlang: 'en' } });
    if(d.code === 200 && d.data && Number.isInteger(d.data.majorVersion)){
      return { majorVersion: d.data.majorVersion, minorVersion: d.data.minorVersion };
    }
  }catch(e){}
  return { majorVersion: 14, minorVersion: 0 };
}

async function loggInnMedKode(v, kode){
  const hode = klientHode(v.konto, v.ident);
  const ks = tilfeldigTekst(16);
  const sign = await rrKall(v.base + '/api/v3/key/sign?' + skjema({ s: ks }),
                            { method: 'POST', headers: { header_clientid: hode } });
  if(sign.code !== 200 || !sign.data || !sign.data.k){
    return { feil: 'Roborock ga ikke innloggingsnøkkel (' + (sign.msg || sign.code) + ')' };
  }
  const avtale = await avtaleVersjon(v.base, v.land);
  const d = await rrKall(v.base + '/api/v4/auth/email/login/code', {
    method: 'POST',
    headers: {
      header_clientid: hode,
      'x-mercy-ks': ks,
      'x-mercy-k': sign.data.k,
      'Content-Type': 'application/x-www-form-urlencoded',
      header_clientlang: 'en',
      header_appversion: '4.54.02',
      header_phonesystem: 'iOS',
      header_phonemodel: 'iPhone16,1'
    },
    body: skjema(Object.assign({ country: v.land, countryCode: v.landkode, email: v.konto, code: kode }, avtale))
  });
  if(d.code === 200 && d.data && d.data.rriot) return { bruker: d.data };
  const kjent = {
    2018: 'Feil kode – sjekk e-posten og prøv igjen.',
    3009: 'Du må godta brukeravtalen i Roborock-appen først.',
    3006: 'Brukeravtalen må godtas på nytt i Roborock-appen.',
    3039: 'Fant ikke kontoen i denne regionen.'
  };
  return { feil: kjent[d.code] || ((d.msg || 'Innloggingen feilet') + ' (' + d.code + ')') };
}

/* Hawk-signaturen for kallene mot rriot.r.a - HMAC-SHA256 over et
   kolonseparert sammendrag. Uten parametre er de to siste feltene tomme. */
async function hawk(rriot, sti){
  const ts = Math.floor(Date.now() / 1000);
  const nonce = b64(tilfeldig(6)).replace(/\+/g, '-').replace(/\//g, '_');
  const pre = [rriot.u, rriot.s, nonce, String(ts), md5hex(sti), '', ''].join(':');
  const k = await crypto.subtle.importKey('raw', TE.encode(rriot.h),
                                          { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = b64(new Uint8Array(await crypto.subtle.sign('HMAC', k, TE.encode(pre))));
  return 'Hawk id="' + rriot.u + '",s="' + rriot.s + '",ts="' + ts + '",nonce="' + nonce + '",mac="' + mac + '"';
}

/* Klipperen paa kontoen: navn, modell, duid og lokal noekkel. Kalles
   ved innlogging og ellers ikke - se toppen om grensene. */
async function finnKlipper(okt){
  const h = await rrKall(okt.base + '/api/v1/getHomeDetail', {
    headers: { header_clientid: klientHode(okt.konto, okt.ident), Authorization: okt.token }
  });
  if(h.code !== 200 || !h.data) return { feil: 'Fant ikke hjemmet på kontoen (' + (h.msg || h.code) + ')' };
  const sti = '/v3/user/homes/' + h.data.rrHomeId;
  const d = await rrKall(okt.rriot.r.a + sti, { headers: { Authorization: await hawk(okt.rriot, sti) } });
  if(!d.success || !d.result) return { feil: 'Fikk ikke hentet enhetene fra Roborock' };
  const produkter = {};
  (d.result.products || []).forEach(function(p){ produkter[p.id] = p; });
  const alle = (d.result.devices || []).concat(d.result.receivedDevices || []);
  const klipper = alle.filter(function(e){
    const p = produkter[e.productId];
    return p && p.category === 'roborock.mower';
  })[0];
  if(!klipper) return { feil: 'Ingen gressklipper på denne Roborock-kontoen' };
  return {
    duid: klipper.duid, navn: klipper.name, lokal: klipper.localKey,
    modell: produkter[klipper.productId].model, fw: klipper.fv
  };
}

/* ============================================================
   Meldingene til og fra klipperen (protokoll 1.0)
   ============================================================ */

/* Tidsstempelet stokkes i en fast rekkefoelge foer det blir en del av
   noekkelen. Ja, virkelig - se Utils.encode_timestamp i python-roborock. */
function stokketTid(ts){
  const h = ts.toString(16).padStart(8, '0');
  return [5, 6, 3, 7, 1, 2, 0, 4].map(function(i){ return h[i]; }).join('');
}
function meldingsNokkel(ts, lokal){
  return md5(sammen(TE.encode(stokketTid(ts)), TE.encode(lokal), TE.encode(SALT)));
}

function byggMelding(protokoll, nyttelast, lokal){
  const ts = Math.floor(Date.now() / 1000);
  const kryptert = ecbKrypter(meldingsNokkel(ts, lokal), nyttelast);
  const hode = new Uint8Array(3 + 4 + 4 + 4 + 2 + 2);
  hode.set(TE.encode('1.0'));
  const dv = new DataView(hode.buffer);
  dv.setUint32(3, tilfeldigTall(100000, 999999));
  dv.setUint32(7, tilfeldigTall(10000, 99999));
  dv.setUint32(11, ts);
  dv.setUint16(15, protokoll);
  dv.setUint16(17, kryptert.length);
  const kropp = sammen(hode, kryptert);
  const sum = new Uint8Array(4);
  new DataView(sum.buffer).setUint32(0, crc32(kropp));
  return sammen(kropp, sum);
}

/* Én MQTT-nyttelast kan holde flere meldinger etter hverandre. */
function lesMeldinger(b, lokal){
  const ut = [];
  let i = 0;
  while(i + 17 <= b.length){
    if(TD.decode(b.subarray(i, i + 3)) !== '1.0') break;
    const dv = new DataView(b.buffer, b.byteOffset + i);
    const ts = dv.getUint32(11);
    const protokoll = dv.getUint16(15);
    let nyttelast = null;
    let j = i + 17;
    if(j + 2 <= b.length){
      const n = dv.getUint16(17);
      j += 2;
      if(n){
        nyttelast = ecbDekrypter(meldingsNokkel(ts, lokal), b.subarray(j, j + n));
        j += n + 4;
      }
    }
    ut.push({ protokoll: protokoll, nyttelast: nyttelast });
    i = j;
  }
  return ut;
}

/* ============================================================
   MQTT 3.1.1 - bare det vi trenger: inn, abonner, send, motta, ut
   ============================================================ */
function mqttLengde(n){
  const ut = [];
  do{ let b = n % 128; n = Math.floor(n / 128); if(n) b |= 128; ut.push(b); }while(n);
  return Uint8Array.from(ut);
}
function mqttTekst(s){
  const b = TE.encode(s);
  return sammen(Uint8Array.from([b.length >> 8, b.length & 255]), b);
}
function mqttPakke(type, kropp){
  return sammen(Uint8Array.from([type]), mqttLengde(kropp.length), kropp);
}

async function mqttForbindelse(rriot){
  const url = new URL(rriot.r.m.replace(/^ssl:/, 'https:').replace(/^tcp:/, 'http:'));
  const sokkel = connect({ hostname: url.hostname, port: Number(url.port) },
                         { secureTransport: rriot.r.m.indexOf('ssl:') === 0 ? 'on' : 'off' });
  const leser = sokkel.readable.getReader();
  const skriver = sokkel.writable.getWriter();
  let buf = new Uint8Array(0);
  const ko = [];
  let venter = null;
  let lukket = false;

  /* Leser i bakgrunnen og deler strommen i pakker. */
  (async function(){
    try{
      for(;;){
        const r = await leser.read();
        if(r.done) break;
        buf = sammen(buf, r.value);
        for(;;){
          if(buf.length < 2) break;
          let n = 0, mult = 1, i = 1, b;
          do{
            if(i >= buf.length){ n = -1; break; }
            b = buf[i++]; n += (b & 127) * mult; mult *= 128;
          }while(b & 128);
          if(n < 0 || buf.length < i + n) break;
          const pakke = { type: buf[0], kropp: buf.slice(i, i + n) };
          buf = buf.slice(i + n);
          ko.push(pakke);
          if(venter){ const v = venter; venter = null; v(); }
        }
      }
    }catch(e){}
    lukket = true;
    if(venter){ const v = venter; venter = null; v(); }
  })();

  async function neste(frist){
    while(!ko.length){
      if(lukket) return null;
      const igjen = frist - Date.now();
      if(igjen <= 0) return null;
      await new Promise(function(ok){
        venter = ok;
        setTimeout(function(){ if(venter === ok){ venter = null; ok(); } }, igjen);
      });
    }
    return ko.shift();
  }

  const bruker = md5hex(rriot.u + ':' + rriot.k).slice(2, 10);
  const passord = md5hex(rriot.s + ':' + rriot.k).slice(16);
  await skriver.write(mqttPakke(0x10, sammen(
    mqttTekst('MQTT'), Uint8Array.from([4, 0xc2, 0, 60]),
    mqttTekst('neam' + hex(tilfeldig(6))), mqttTekst(bruker), mqttTekst(passord))));
  const ack = await neste(Date.now() + MQTT_VENT);
  if(!ack || (ack.type >> 4) !== 2 || ack.kropp[1] !== 0){
    try{ sokkel.close(); }catch(e){}
    throw new Error('Roborocks MQTT slapp oss ikke inn' + (ack ? ' (kode ' + ack.kropp[1] + ')' : ''));
  }

  return {
    bruker: bruker,
    async abonner(emne){
      await skriver.write(mqttPakke(0x82, sammen(Uint8Array.from([0, 1]), mqttTekst(emne), Uint8Array.from([0]))));
      for(;;){
        const p = await neste(Date.now() + MQTT_VENT);
        if(!p) throw new Error('Fikk ikke abonnert hos Roborock');
        if((p.type >> 4) === 9) return;
      }
    },
    send(emne, nyttelast){
      return skriver.write(mqttPakke(0x30, sammen(mqttTekst(emne), nyttelast)));
    },
    /* Neste PUBLISH, eller null naar fristen er ute. */
    async motta(frist){
      for(;;){
        const p = await neste(frist);
        if(!p) return null;
        if((p.type >> 4) !== 3) continue;
        const qos = (p.type >> 1) & 3;
        const tl = (p.kropp[0] << 8) | p.kropp[1];
        let i = 2 + tl;
        if(qos){
          await skriver.write(Uint8Array.from([0x40, 2, p.kropp[i], p.kropp[i + 1]]));
          i += 2;
        }
        return p.kropp.slice(i);
      }
    },
    async lukk(){
      try{ await skriver.write(Uint8Array.from([0xe0, 0])); }catch(e){}
      try{ sokkel.close(); }catch(e){}
    }
  };
}

/* Én kort oekt mot klipperen. `arbeid` faar en funksjon som sender en
   kommando og venter paa svaret. */
async function motKlipper(okt, arbeid){
  const m = await mqttForbindelse(okt.rriot);
  const ut  = 'rr/m/i/' + okt.rriot.u + '/' + m.bruker + '/' + okt.duid;
  const inn = 'rr/m/o/' + okt.rriot.u + '/' + m.bruker + '/' + okt.duid;
  const endepunkt = b64(md5(okt.rriot.k).subarray(8, 14));
  try{
    await m.abonner(inn);

    async function kommando(metode, params, kart){
      const id = tilfeldigTall(10000, 32767);
      const ts = Math.floor(Date.now() / 1000);
      const nonce = kart ? tilfeldig(16) : null;
      const indre = { id: id, method: metode, params: params === undefined ? [] : params };
      if(kart) indre.security = { endpoint: endepunkt, nonce: hex(nonce) };
      const last = TE.encode(JSON.stringify({ dps: { '101': JSON.stringify(indre) }, t: ts }));
      await m.send(ut, byggMelding(101, last, okt.lokal));

      const frist = Date.now() + MQTT_VENT;
      for(;;){
        const raa = await m.motta(frist);
        if(!raa) throw new Error('Neamow svarte ikke på ' + metode);
        let meldinger;
        try{ meldinger = lesMeldinger(raa, okt.lokal); }catch(e){ continue; }
        for(const mld of meldinger){
          if(!mld.nyttelast) continue;
          if(kart && mld.protokoll === 301){
            const h = mld.nyttelast;
            if(h.length < 24) continue;
            if(!TD.decode(h.subarray(0, 8)).startsWith(endepunkt)) continue;
            if((h[16] | (h[17] << 8)) !== id) continue;
            return await gunzip(cbcDekrypter(nonce, h.subarray(24)));
          }
          if(mld.protokoll === 102){
            let d;
            try{ d = JSON.parse(TD.decode(mld.nyttelast)); }catch(e){ continue; }
            const s = d && d.dps && d.dps['102'];
            if(!s) continue;
            let r;
            try{ r = JSON.parse(s); }catch(e){ continue; }
            if(r.id !== id) continue;
            if(r.error) throw new Error('Neamow avviste ' + metode + ': ' + JSON.stringify(r.error));
            if(!kart) return r.result;
          }
        }
      }
    }

    return await arbeid(kommando);
  }finally{
    await m.lukk();
  }
}

/* ============================================================
   Kartet - protobuf, slik ha-roborock-mower leser det
   ============================================================
   Feltene (maalt paa Neamow 10. oktober 2026):
     #4      kartinfo: #3 hoeyde, #4 bredde (piksler), #5 opploesning
     #10     et kartomraade. Hvert har ett eller flere #7 - SONENE:
               #1 id, #3 navn, #6 grensepunkter (#4 x, #5 y), #10 areal
             MERK: ha-roborock-mower tar bare foerste #7. Neamow har
             tre soner (A1-A3) i ett omraade, og alle maa med.
     #20     posisjoner: #1 klipperen, #2 ladestasjonen (#4 x, #5 y, #6 vinkel)
     #34     sist endret, som tekst
   Koordinatene er meter i klipperens eget kart, ikke GPS. */
function pbLes(b){
  const felt = {};
  let i = 0;
  const varint = function(){
    let v = 0, mult = 1, x;
    do{
      if(i >= b.length) throw new Error('kort');
      x = b[i++]; v += (x & 127) * mult; mult *= 128;
    }while(x & 128);
    return v;
  };
  while(i < b.length){
    const n = varint();
    const nr = Math.floor(n / 8), wt = n & 7;
    if(!nr) throw new Error('felt 0');
    let v;
    if(wt === 0) v = { t: 0, v: varint() };
    else if(wt === 1){ v = { t: 1, v: b.subarray(i, i + 8) }; i += 8; }
    else if(wt === 5){ v = { t: 5, v: b.subarray(i, i + 4) }; i += 4; }
    else if(wt === 2){ const l = varint(); v = { t: 2, v: b.subarray(i, i + l) }; i += l; }
    else throw new Error('wire ' + wt);
    if(i > b.length) throw new Error('kort');
    (felt[nr] = felt[nr] || []).push(v);
  }
  return felt;
}
function pbMld(v){
  if(!v || v.t !== 2) return {};
  try{ return pbLes(v.v); }catch(e){ return {}; }
}
function pbFoerste(f, nr){ return f[nr] && f[nr][0]; }
function pbTall(f, nr){
  const v = pbFoerste(f, nr);
  if(!v) return null;
  if(v.t === 5) return new DataView(v.v.buffer, v.v.byteOffset, 4).getFloat32(0, true);
  if(v.t === 0) return v.v;
  return null;     /* 64-bit lar vi staa - det er GPS-en */
}
function pbTekst(f, nr){
  const v = pbFoerste(f, nr);
  return v && v.t === 2 ? TD.decode(v.v) : null;
}
function rund(x, d){ return x === null ? null : Math.round(x * Math.pow(10, d)) / Math.pow(10, d); }
function pbPunkt(f){
  const x = pbTall(f, 4), y = pbTall(f, 5);
  if(x === null || y === null || Math.abs(x) > 5000 || Math.abs(y) > 5000) return null;
  return { x: rund(x, 2), y: rund(y, 2), vinkel: rund(pbTall(f, 6), 3) };
}

function lesKart(data){
  if(data[0] === 0x70 && data[1] === 0x62) data = data.subarray(2);   /* «pb» */
  const f = pbLes(data);
  const soner = [];
  (f[10] || []).forEach(function(o){
    const omr = pbMld(o);
    (omr[7] || []).forEach(function(z){
      const s = pbMld(z);
      const punkter = (s[6] || []).map(function(p){ return pbPunkt(pbMld(p)); })
                                  .filter(Boolean).map(function(p){ return [p.x, p.y]; });
      if(punkter.length < 3) return;
      soner.push({ id: pbTall(s, 1), navn: (pbTekst(s, 3) || '').trim(),
                   areal: rund(pbTall(s, 10), 1), punkter: punkter });
    });
  });
  const pos = pbMld(pbFoerste(f, 20));
  return {
    soner: soner,
    klipper: pbPunkt(pbMld(pbFoerste(pos, 1))),
    lader: pbPunkt(pbMld(pbFoerste(pos, 2))),
    endret: pbTekst(f, 34)
  };
}

/* ---------- Statusen, plukket ----------
   GET_ROBOT_STATUS er stor og har baade GPS (navigation.robot_gps),
   RTK-data og nettverksdetaljer. Nettleseren faar BARE feltene under,
   aldri resten - derfor plukkes de ett for ett i stedet for aa fjerne
   det vi vet om. Et nytt felt fra Roborock blir da borte, ikke lekket.
   Feltnavnene er maalt paa Neamow 10. oktober 2026. */
function plukkStatus(s){
  if(!s || typeof s !== 'object') return null;
  const hw = s.hardware || {};
  const bat = hw.battery || {};
  const kniv = hw.cutter_info || {};
  const mp = s.mow_progress || {};
  const sist = s.last_mow_abstract || {};
  const pose = s.navigation && s.navigation.map && s.navigation.map.robot_pose;
  const tall = function(x){ return typeof x === 'number' && isFinite(x) ? x : null; };
  return {
    batteri: tall(bat.percent),
    lader: bat.charged === true,
    klipper: String(s.fsm_mow_state || ''),
    oppgave: String((s.robot_task && s.robot_task.working_state) || ''),
    detalj: String((s.robot_task && s.robot_task.robot_detail_state) || ''),
    lading: String(s.fsm_charge_state || ''),
    stasjon: String(s.fsm_dock_state || ''),
    energi: String(s.fsm_energy_state || ''),
    feil: s.fsm_errors && Object.keys(s.fsm_errors).length ? s.fsm_errors : null,
    hoyde: tall(kniv.main_cutter_height),
    fremdrift: rund(tall(mp.cur_mow_progress), 1),
    soner: (mp.regions || []).map(function(r){
      return { id: r.id, dekket: rund(tall(r.cur_coverage_rate), 1) };
    }),
    posisjon: pose && tall(pose.f_x) !== null && tall(pose.f_y) !== null
      ? { x: rund(pose.f_x, 2), y: rund(pose.f_y, 2), vinkel: rund(tall(pose.f_yaw), 3) } : null,
    sist: sist.start ? {
      start: Number(sist.start.time) || null,
      slutt: sist.end ? Number(sist.end.time) || null : null,
      areal: rund(tall(sist.area), 1),
      sekunder: tall(sist.seconds),
      prosent: rund(tall(sist.percentage), 1),
      avbrutt: sist.abnormal_end === true
    } : null
  };
}

/* ============================================================
   Oekta i KV
   ============================================================ */
async function lesOkt(env){
  const raa = await env.FAMILIE_KV.get(NOKKEL);
  if(!raa) return null;
  try{ return JSON.parse(raa); }catch(e){ return null; }
}

/* ============================================================
   Endepunktene
   ============================================================ */

export async function onRequestPost({ request, env }){
  if(!env.FAMILIE_KV) return svar({ ok:false, feil:'KV ikke bundet' });
  const epost = epostAv(request);
  if(!epost) return svar({ ok:false, feil:'Ingen Access-identitet' });

  let inn;
  try{ inn = await request.json(); }
  catch(e){ return svar({ ok:false, feil:'Ugyldig JSON' }); }
  const hva = String(inn && inn.hva || '');

  /* ---------- Steg 1: send kode til Roborock-kontoen ---------- */
  if(hva === 'send_kode'){
    const konto = String(inn.konto || '').trim().toLowerCase();
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(konto)) return svar({ ok:false, feil:'Skriv e-posten til Roborock-kontoen' });
    const region = await finnRegion(konto);
    if(!region) return svar({ ok:false, feil:'Fant ingen Roborock-konto på den e-posten' });
    const ident = tilfeldigTekst(22);
    const d = await sendKode(konto, region, ident);
    if(d.code !== 200){
      const kjent = { 2008: 'Kontoen finnes ikke.', 9002: 'For mange koder på kort tid – vent litt.' };
      return svar({ ok:false, feil: kjent[d.code] || ((d.msg || 'Roborock sendte ingen kode') + ' (' + d.code + ')') });
    }
    await env.FAMILIE_KV.put(VENTER, JSON.stringify(Object.assign({ konto: konto, ident: ident }, region)),
                             { expirationTtl: 900 });
    return svar({ ok:true });
  }

  /* ---------- Steg 2: koden fra e-posten ---------- */
  if(hva === 'kode'){
    const kode = String(inn.kode || '').trim();
    if(!/^\d{4,8}$/.test(kode)) return svar({ ok:false, feil:'Skriv koden fra e-posten' });
    const raa = await env.FAMILIE_KV.get(VENTER);
    if(!raa) return svar({ ok:false, feil:'Koden er for gammel – be om en ny' });
    const v = JSON.parse(raa);
    const r = await loggInnMedKode(v, kode);
    if(r.feil) return svar({ ok:false, feil:r.feil });

    const okt = { konto: v.konto, ident: v.ident, base: v.base,
                  token: r.bruker.token, rriot: r.bruker.rriot,
                  godkjentAv: epost, satt: Date.now() };
    const k = await finnKlipper(okt);
    if(k.feil) return svar({ ok:false, feil:k.feil });
    Object.assign(okt, k);
    await env.FAMILIE_KV.put(NOKKEL, JSON.stringify(okt));
    await env.FAMILIE_KV.delete(VENTER);
    return svar({ ok:true, navn:k.navn, modell:k.modell });
  }

  /* ---------- Styr klipperen ----------
     Knappene er appens egne (AppButton over remote_pb), samme navn som
     ha-roborock-mower bruker. Lista er lukket med vilje: bare det som
     staar her kan sendes, aldri et fritt navn fra nettleseren.
     Bekreftelsen gjoeres i nettleseren (designsystemet, «Bekreftelse») -
     her er det bare oversettelsen. */
  if(hva === 'styr'){
    const KNAPPER = { start: 'MOW_GLOBAL', pause: 'MOW_PAUSE', fortsett: 'MOW_RESUME',
                      stopp: 'MOW_END', hjem: 'CHARGE' };
    const knapp = KNAPPER[String(inn.handling || '')];
    if(!knapp) return svar({ ok:false, feil:'Ukjent handling' });
    const okt = await lesOkt(env);
    if(!okt || !okt.duid) return svar({ ok:false, feil:'Neamow er ikke koblet til', maaGodkjenne:true });
    try{
      const r = await motKlipper(okt, function(kommando){
        return kommando('remote_pb', { id: String(Date.now()), type: 'APP_BUTTON', app_button: knapp });
      });
      /* Klipperen svarer «fail» naar den ikke kan (ha-roborock-mower). */
      const avvist = r === 'fail' || (Array.isArray(r) && r.indexOf('fail') !== -1);
      if(avvist) return svar({ ok:false, feil:'Neamow avviste det akkurat nå' });
      return svar({ ok:true });
    }catch(e){
      return svar({ ok:false, feil: String(e.message || e) });
    }
  }

  /* ---------- Glem oekta ---------- */
  if(hva === 'ut'){
    await env.FAMILIE_KV.delete(NOKKEL);
    return svar({ ok:true });
  }

  return svar({ ok:false, feil:'Ukjent hva: ' + hva });
}

export async function onRequestGet({ request, env }){
  if(!env.FAMILIE_KV) return svar({ ok:false, feil:'KV ikke bundet' });
  const epost = epostAv(request);
  if(!epost) return svar({ ok:false, feil:'Ingen Access-identitet' });

  let hva = '';
  try{ hva = new URL(request.url).searchParams.get('hva') || ''; }catch(e){}
  const okt = await lesOkt(env);

  if(!hva || hva === 'status'){
    return svar({ ok:true, godkjent: !!(okt && okt.duid),
                  navn: (okt && okt.navn) || '', modell: (okt && okt.modell) || '',
                  godkjentAv: (okt && okt.godkjentAv) || '' });
  }

  if(!okt || !okt.duid) return svar({ ok:false, feil:'Neamow er ikke koblet til', maaGodkjenne:true });

  /* ---------- Kart og status, i én forbindelse ---------- */
  if(hva === 'neamow'){
    try{
      const ut = await motKlipper(okt, async function(kommando){
        const kart = lesKart(await kommando('get_map_diff', undefined, true));
        let status = null, statusFeil = '';
        try{
          const s = await kommando('remote_pb', { id: String(Date.now()), type: 'GET_ROBOT_STATUS' });
          status = plukkStatus(typeof s === 'string' ? JSON.parse(s) : s);
        }catch(e){ statusFeil = String(e.message || e); }
        return { kart: kart, status: status, statusFeil: statusFeil };
      });
      return svar(Object.assign({ ok:true, navn: okt.navn }, ut));
    }catch(e){
      return svar({ ok:false, feil: String(e.message || e) });
    }
  }

  return svar({ ok:false, feil:'Ukjent hva: ' + hva });
}

export async function onRequest({ request }){
  return svar({ ok:false, feil:'Bruk GET eller POST', metode: request.method });
}
