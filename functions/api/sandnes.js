/* ============================================================
   /api/sandnes - ukeplanene fra Sandnes skole
   ------------------------------------------------------------
   Cloudflare Pages Function. Ligger i repoet som
   functions/api/sandnes.js og svarer paa /api/sandnes.
   Laget 11. september 2026 for Andrea dash.

   HVORFOR EN EGEN FIL OG IKKE /api/hent: to skoler, to helt
   forskjellige sider. Roligheden har én samleside og .docx som
   pakkes ut til tekst. Sandnes ligger paa kommunens side, har
   én side per trinn, og legger ut PDF - som Neam leser direkte,
   saa her pakkes ingenting ut. Én fil med to greiner ville vaert
   to filer i én, og en rettelse for den ene skolen kunne knekt
   den andre. hent.js er uroert.

   HVORFOR SERVERSIDEN: samme grunn som for Roligheden - kommunen
   sender ingen CORS-hoder til neam.no.

   To ting den gjoer:
     ?hva=liste&trinn=4     - PDF-lenkene paa trinnsida, med uke
     ?hva=fil&url=...       - henter én PDF og gir den som base64

   Adressene til PDF-ene kan ikke regnes ut. De ser slik ut:
     /sandnesskole/for-elever/4-trinn/~/_f/p78/<tilfeldig id>/ukeplan-uke-38.pdf
   Derfor maa trinnsida leses foerst.

   VERTEN ER LAAST til kommunens side, og STIEN til Sandnes sin
   del av den. Uten den sperren ville endepunktet vaert en aapen
   videresender for hele arendal.kommune.no.

   FEIL SVARES MED 200 og {feil}, aldri 502. En Pages Function som
   svarer 502 faar kroppen sin byttet ut med Cloudflares egen
   «Bad gateway»-side, og diagnosen forsvinner (kartleggingen
   del 20). Klienten ser paa `feil`, ikke paa statuskoden.
   ============================================================ */

const VERT = 'www.arendal.kommune.no';
const ROT  = 'https://' + VERT;
const STI  = '/sandnesskole/';

/* En ukeplan er et par hundre kilobyte. Er svaret mange megabyte, er det
   noe annet enn det vi ba om. */
const MAKS = 10 * 1024 * 1024;

function trinnSide(trinn){
  return ROT + STI + 'for-elever/' + trinn + '-trinn/';
}

function svar(obj){
  return new Response(JSON.stringify(obj), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}

/* ------------------------------------------------------------
   Adresser
   ------------------------------------------------------------ */

function avkod(s){
  return String(s || '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/&aring;/g, 'å').replace(/&oslash;/g, 'ø').replace(/&aelig;/g, 'æ')
    .replace(/&Aring;/g, 'Å').replace(/&Oslash;/g, 'Ø').replace(/&AElig;/g, 'Æ');
}

/* Med og uten www. er samme vert. Kommunen lenker gjerne til begge, og
   en lenke som ikke staver seg akkurat som ROT ble ellers kastet av
   filteret - lista sto tom uten at noe hadde gaatt galt. Samme lekse som
   i hent.js. */
function riktigVert(v){
  return String(v || '').toLowerCase().replace(/^www\./, '') === VERT.replace(/^www\./, '');
}

/* Innenfor sperra: riktig vert, http(s), og under Sandnes sin sti.
   Ikke endsWith paa verten - «arendal.kommune.no.angriper.no» ville
   sluppet gjennom en slurvete sjekk. */
function innenfor(u){
  return riktigVert(u.hostname)
      && /^https?:$/.test(u.protocol)
      && u.pathname.toLowerCase().indexOf(STI) === 0;
}

function absolutt(href, base){
  try{
    const u = new URL(avkod(href).trim(), base);
    if(riktigVert(u.hostname)){ u.protocol = 'https:'; u.hostname = VERT; }
    return u;
  }catch(e){ return null; }
}

/* Uketallet fra lenketeksten foerst, saa fra filnavnet. «Uke 38.pdf»,
   «ukeplan-uke-38.pdf» og «Ukeplan uke 38» skal alle gi 38. */
function ukeAv(tekst){
  const m = /uke[\s\-_.]*(\d{1,2})(?!\d)/i.exec(String(tekst || ''));
  if(!m) return null;
  const n = parseInt(m[1], 10);
  return (n >= 1 && n <= 53) ? n : null;
}

function lenkerFra(html, base){
  const ut = [];
  const re = /<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while((m = re.exec(html)) !== null){
    const u = absolutt(m[1], base);
    if(!u || !innenfor(u)) continue;
    if(!/\.pdf$/i.test(u.pathname)) continue;
    const fil  = decodeURIComponent(u.pathname.split('/').pop() || '');
    const navn = avkod(m[2].replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim() || fil;
    ut.push({ navn: navn, fil: fil, url: u.toString(),
              uke: ukeAv(navn) || ukeAv(fil) });
  }
  /* Samme fil kan staa to steder paa sida. */
  const sett = {};
  return ut.filter(function(l){
    if(sett[l.url]) return false;
    sett[l.url] = true;
    return true;
  });
}

/* ------------------------------------------------------------ */

async function hent(url){
  const r = await fetch(url, {
    headers: {
      /* En vanlig nettleser. Kommunens side ligger bak en publiserings-
         loesning som kan svare 403 paa klienter den ikke kjenner. */
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36',
      'Accept': 'text/html,application/pdf,*/*;q=0.8',
      'Accept-Language': 'nb-NO,nb;q=0.9,no;q=0.8'
    },
    redirect: 'follow',
    cf: { cacheTtl: 300, cacheEverything: true }
  });
  const buf = await r.arrayBuffer();
  if(buf.byteLength > MAKS) throw new Error('Fila er for stor (' + buf.byteLength + ' byte).');
  return { ok: r.ok, status: r.status, bytes: new Uint8Array(buf),
           type: r.headers.get('content-type') || '', endelig: r.url || url };
}

/* Base64 i biter. String.fromCharCode.apply med hele fila paa én gang
   sprenger kallstakken paa noen hundre kilobyte. */
function tilBase64(bytes){
  let s = '';
  const bit = 0x8000;
  for(let i = 0; i < bytes.length; i += bit){
    s += String.fromCharCode.apply(null, bytes.subarray(i, i + bit));
  }
  return btoa(s);
}

/* Det vi fikk, kort - saa en feil kan diagnostiseres uten aa gjette. Er
   det HTML, er det som regel en 404-side eller en omdirigering. */
function start(bytes){
  return new TextDecoder().decode(bytes.subarray(0, 300)).replace(/\s+/g, ' ').trim();
}

export async function onRequest(context){
  const inn = new URL(context.request.url);
  const hva = inn.searchParams.get('hva') || 'liste';

  try{
    if(hva === 'liste'){
      const trinn = parseInt(inn.searchParams.get('trinn') || '', 10);
      if(!(trinn >= 1 && trinn <= 7)) return svar({ feil:'Trinnet må være 1–7.' });

      const side = trinnSide(trinn);
      const r = await hent(side);
      if(!r.ok){
        return svar({ feil:'Kommunens side svarte ' + r.status + '.',
                      kilde:side, type:r.type, start:start(r.bytes) });
      }
      const html = new TextDecoder('utf-8').decode(r.bytes);
      const lenker = lenkerFra(html, r.endelig);

      /* ?alle=1 gir hver lenke paa sida, ufiltrert. Staar lista tom, er
         spoersmaalet om lenkene mangler eller om filteret spiste dem - og
         det kan ikke gjettes utenfra. */
      if(inn.searchParams.get('alle')){
        const raa = [];
        const re = /<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
        let m;
        while((m = re.exec(html)) !== null && raa.length < 300){
          raa.push({ navn: avkod(m[2].replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim(),
                     href: m[1] });
        }
        return svar({ kilde:side, tegn:html.length, antallLenker:raa.length,
                      etterFilter:lenker.length, lenker:lenker, alle:raa });
      }

      return svar({ kilde:side, antall:lenker.length, lenker:lenker });
    }

    if(hva === 'fil'){
      let mal;
      try{ mal = new URL(inn.searchParams.get('url') || ''); }
      catch(e){ return svar({ feil:'Ugyldig adresse.' }); }
      if(!innenfor(mal)){
        return svar({ feil:'Bare filer under ' + VERT + STI + ' kan hentes.' });
      }

      const r = await hent(mal.toString());
      if(!r.ok){
        return svar({ feil:'Kommunens side svarte ' + r.status + ' på fila.',
                      type:r.type, start:start(r.bytes) });
      }

      /* Filtypen avgjoeres av de fire foerste BYTENE, ikke av navnet eller
         content-type - samme lekse som med skolens getfile.php. «%PDF» er
         PDF. */
      const b = r.bytes;
      const erPdf = b.length > 4 && b[0] === 0x25 && b[1] === 0x50
                                 && b[2] === 0x44 && b[3] === 0x46;
      if(!erPdf){
        return svar({ feil:'Fila er ikke en PDF.', type:r.type,
                      bytes:b.length, start:start(b) });
      }

      const navn = decodeURIComponent(mal.pathname.split('/').pop() || 'ukeplan.pdf');
      return svar({ url: mal.toString(), navn: navn, uke: ukeAv(navn),
                    bytes: b.length, type: 'application/pdf',
                    data: tilBase64(b) });
    }

    return svar({ feil:'Ukjent forespørsel.' });

  }catch(e){
    return svar({ feil: (e && e.message) || 'Noe gikk galt.' });
  }
}
