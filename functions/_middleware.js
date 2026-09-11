/* ============================================================
   Neam - portvakt for vertsnavnet

   Ligger i repoet som:  functions/_middleware.js
   Kjoerer foer ALT annet: hver side, hver fil og hver funksjon.

   HVORFOR DEN FINNES
   Cloudflare Pages gir prosjektet en gratisadresse i tillegg til
   vaar egen: familiehub-7us.pages.dev. Den serverer noeyaktig
   samme app som neam.no, men Access-policyen gjelder BARE
   neam.no. Alt laa altsaa aapent for den som kjente adressen -
   ikke bare sidene, men /api/data, som svarer paa GET og PUT mot
   hele KV-lageret. Maalt 11. september 2026: husregisteret kom
   ut som ren JSON i et privat vindu, uten innlogging.

   Access kan ikke settes paa selve prosjektadressen. En
   Access-applikasjon paa *.familiehub-7us.pages.dev dekker
   forhaandsvisningene, men ikke familiehub-7us.pages.dev selv -
   det er et kjent hull hos Cloudflare, ikke noe vi har satt opp
   feil. Derfor stenges den her i stedet, i kode som foelger med
   hver eneste utrulling.

   HVA DEN GJOER
   Kommer forespoerselen paa noe som slutter paa .pages.dev,
   svares 403 og ingenting annet. Alt annet gaar videre uroert.

   MERK: dette stenger ogsaa forhaandsvisningene av grener. Vi
   bruker dem ikke - alt gaar rett paa main og testes paa live -
   men skal de tas i bruk, maa unntaket inn her.

   MERK OGSAA: den svarer 403 og ikke 404. En side som later som
   den ikke finnes, er vanskeligere aa feilsoeke naar noe en dag
   ikke virker, og adressen er uansett ingen hemmelighet.
   ============================================================ */

export async function onRequest(context){
  const vert = new URL(context.request.url).hostname.toLowerCase();

  /* Hele .pages.dev-treet, ikke bare den ene adressen: prosjektet
     kan bytte navn, og forhaandsvisninger faar sine egne. */
  if(vert === 'pages.dev' || vert.endsWith('.pages.dev')){
    return new Response('Neam ligger på neam.no.', {
      status: 403,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
        /* Ingen søkemotor skal indeksere denne adressen heller. */
        'X-Robots-Tag': 'noindex, nofollow'
      }
    });
  }

  return context.next();
}
