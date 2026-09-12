/* ============================================================
   Neam - Microsoft-token for sider uten egen innlogging
   ------------------------------------------------------------
   Laget 13. september 2026.

   PROBLEMET: kalenderen kan bare leses av Neam paa sider som har
   en gyldigToken(). Fem sider har det - forsiden, kjoekkendashen,
   kalenderen, Andrea og Emma - og tre har det ikke: handleliste,
   oppskrifter og sikkerhet. Der kunne han ikke svare paa «hva
   skjer i morgen», selv om spoersmaalet er like naturlig der.

   HVORFOR DET ER SMAATT AA RETTE: kalenderen la om 11. september
   2026 slik at oekta bor paa TJENEREN, noeklet til den som er
   logget inn i Cloudflare Access. Nettleseren ser aldri
   refresh-tokenet. Det betyr at en hvilken som helst side kan be
   /api/ms om et ferskt access token UTEN aa ha en innloggingsflyt
   selv - oekta finnes allerede, den ble laget da noen logget inn
   paa kalenderen.

   Denne fila gjoer ikke annet enn aa spoerre om det tokenet.

   HVA DEN IKKE GJOER:
   - Ingen innloggingsknapp, ingen omdirigering. Finnes det ingen
     oekt, svarer den null, og Neam sier at man maa innom
     kalendersida. Aa sende en bruker som staar i handlelista til
     Microsoft og tilbake er en stor ting aa gjoere for aa svare
     paa ett spoersmaal.
   - Ingen utlogging. Den hoerer til sidene som eier innloggingen.

   HVORFOR DE FEM ANDRE SIDENE IKKE ROERES: `gyldigToken` er en
   funksjonserklaering. Laster en side denne fila FOERST og sin
   egen etterpaa, vinner sidens egen. Fila kan derfor legges paa
   alle uten at noe eksisterende endrer oppfoersel - den fyller
   bare hullet der det er et hull.

   HUSET HAR FORTSATT TRE INNLOGGINGER: denne, dashboardets (som
   Andrea og Emma har kopiert ordrett) og forsidens eldre. Aa slaa
   dem sammen er en stoerre jobb og hoerer til hub.html-skallet.
   Dette er ikke den jobben; dette er hullet.

   Lastes FOER sidens eget skript.
   ============================================================ */

/* Samme noekkel som kalenderen bruker. Med vilje: det er det SAMME
   access-tokenet, og en side som nettopp har vaert innom kalenderen
   slipper da et kall. Bare access-tokenet ligger her, og det varer en
   time uansett. */
const MS_LAGER = 'fh_cal_auth';

const MS = { token:null, expires:0, oekt:null };   /* oekt null = ikke spurt */

function msLes(){
  try{
    const raa = localStorage.getItem(MS_LAGER);
    if(!raa) return false;
    const d = JSON.parse(raa);
    MS.token = d.token || null;
    MS.expires = d.expires || 0;
    return !!MS.token;
  }catch(e){ return false; }
}

function msLagre(d){
  MS.token = d.access_token;
  MS.oekt = true;
  MS.expires = Date.now() + (d.expires_in || 3600) * 1000 - 60000;
  try{
    localStorage.setItem(MS_LAGER, JSON.stringify({ token:MS.token, expires:MS.expires }));
  }catch(e){}
}

/* Har tjeneren en oekt for oss? Svaret huskes for sidelastingen - det
   endrer seg ikke mens man staar her, og uten det ville hvert eneste
   kall hos Neam blitt to. */
async function msHarOekt(){
  if(MS.oekt !== null) return MS.oekt;
  try{
    const r = await fetch('/api/ms', { cache:'no-store' });
    const d = await r.json();
    MS.oekt = !!(d && d.oekt);
  }catch(e){ MS.oekt = false; }
  return MS.oekt;
}

let msFornyelse = null;

/* Selve henteren. Har et EGET navn saa den kan kalles ogsaa fra sider
   som har sin egen gyldigToken() - de bruker den som reserve naar deres
   eget refresh-token er borte eller utgaatt. Se nederst. */
async function msToken(){
  if(!MS.token) msLes();
  if(MS.token && Date.now() < MS.expires) return MS.token;
  if(!(await msHarOekt())) return null;

  /* Flere kall kan be om token samtidig - gjenbruk samme fornyelse i
     stedet for aa sende flere mot tjeneren. Samme grep som kalenderen
     gjoer naar sju kalendere spoer paa én gang. */
  if(!msFornyelse){
    msFornyelse = fetch('/api/ms', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ hva:'forny', redirect: location.origin + location.pathname }),
        cache:'no-store'
      })
      .then(function(r){ return r.text(); })
      .then(function(t){
        let d;
        try{ d = JSON.parse(t); }catch(e){ throw new Error('Uventet svar fra innloggingen'); }
        if(!d.ok){
          /* Sier tjeneren at oekta er doed, skal vi ikke proeve igjen paa
             denne sida. Ved forbigaaende feil staar oekta, og neste
             forsoek kan lykkes. */
          if(d.maaLoggeInn){ MS.oekt = false; MS.token = null; MS.expires = 0; }
          throw new Error(d.feil || 'Innlogging feilet');
        }
        msLagre(d);
        return MS.token;
      })
      .catch(function(e){
        MS.token = null; MS.expires = 0;
        throw e;
      })
      .finally(function(){ msFornyelse = null; });
  }
  return msFornyelse;
}

/* Sider uten egen innlogging faar msToken() under det navnet
   felles-lesalt.js leter etter. Har sida sin egen, erklaeres den etter
   denne fila og vinner - en funksjonserklaering i et senere skript
   skygger for en tidligere. Fila kan derfor legges paa alle uten at noe
   eksisterende endrer oppfoersel.

   Sider som HAR sin egen, men vil bruke oekta paa tjeneren som reserve,
   kaller msToken() selv. Det er det dashboard, Andrea, Emma og forsiden
   gjoer fra 13. september 2026 - se gyldigToken() i hver av dem. */
async function gyldigToken(){ return msToken(); }
