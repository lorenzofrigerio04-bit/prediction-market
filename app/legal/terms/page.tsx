import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termini di servizio",
  description: "Termini e condizioni d'uso della piattaforma di previsioni.",
};

export default function TermsPage() {
  return (
    <article className="box-raised rounded-2xl p-6 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold text-fg mb-2">
        Termini di servizio
      </h1>
      <p className="text-fg-muted text-sm mb-8">
        Ultimo aggiornamento: febbraio 2025. Si consiglia di leggere con attenzione.
      </p>

      <div className="prose prose-sm max-w-none text-fg space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-fg mb-2">1. Età minima</h2>
          <p className="text-fg-muted leading-relaxed">
            L&apos;utilizzo della piattaforma è consentito solo a utenti che abbiano compiuto almeno 18 anni. 
            Registrandoti dichiari di avere l&apos;età richiesta. In caso contrario l&apos;account potrà essere sospeso.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-fg mb-2">2. Uso accettabile</h2>
          <p className="text-fg-muted leading-relaxed">
            Ti impegni a utilizzare il servizio in modo lecito e rispettoso. È vietato: usare la piattaforma per scopi illeciti, 
            violare diritti di terzi, manipolare eventi o risultati, creare account multipli per ottenere vantaggi indebiti, 
            diffondere contenuti offensivi o spam. La violazione di queste regole può comportare la sospensione o la chiusura dell&apos;account.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-fg mb-2">3. Crediti virtuali</h2>
          <p className="text-fg-muted leading-relaxed">
            I crediti utilizzati sulla piattaforma sono valuta virtuale di gioco. Non hanno valore monetario, 
            non sono convertibili in denaro né in altri beni e non sono prelevabili. Per maggiori dettagli vedi la pagina 
            &quot;Disclaimer crediti&quot;.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-fg mb-2">4. Modifiche e recesso</h2>
          <p className="text-fg-muted leading-relaxed">
            Ci riserviamo il diritto di modificare questi termini. In caso di modifiche sostanziali ti informeremo tramite 
            i canali previsti (es. notifica in-app o email). La prosecuzione dell&apos;uso del servizio dopo la comunicazione 
            costituisce accettazione. Puoi recedere in qualsiasi momento cessando l&apos;utilizzo e, se previsto, richiedendo 
            la cancellazione dell&apos;account dalle impostazioni.
          </p>
        </section>
      </div>
    </article>
  );
}
