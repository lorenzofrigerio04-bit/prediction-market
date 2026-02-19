import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Regole contenuti",
  description: "Linee guida sui contenuti consentiti e vietati sulla piattaforma.",
};

export default function ContentRulesPage() {
  return (
    <article className="box-raised rounded-2xl p-6 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold text-fg mb-2">
        Regole contenuti
      </h1>
      <p className="text-fg-muted text-sm mb-8">
        Per mantenere la piattaforma sicura e rispettosa per tutti.
      </p>

      <div className="prose prose-sm max-w-none text-fg space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-fg mb-2">Contenuti vietati</h2>
          <p className="text-fg-muted leading-relaxed mb-4">
            Non sono ammessi:
          </p>
          <ul className="list-disc pl-6 text-fg-muted space-y-1">
            <li><strong className="text-fg">Insulti, minacce, hate speech</strong> verso persone o gruppi</li>
            <li><strong className="text-fg">Spam</strong> o contenuti ripetuti a scopo promozionale non autorizzato</li>
            <li><strong className="text-fg">Informazioni false</strong> diffuse in modo deliberato per fuorviare la comunità</li>
            <li>Contenuti illegali, diffamatori o che violano diritti di terzi</li>
          </ul>
          <p className="text-fg-muted leading-relaxed mt-4">
            La moderazione può rimuovere contenuti e adottare provvedimenti (avviso, sospensione, chiusura account) in base alla gravità.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-fg mb-2">Previsioni e crediti</h2>
          <p className="text-fg-muted leading-relaxed">
            Le previsioni sulla piattaforma sono effettuate esclusivamente con <strong className="text-fg">crediti virtuali</strong>. 
            I crediti non hanno valore reale e non sono convertibili in denaro. Si tratta di un ambiente di gioco e di confronto 
            sulle previsioni, senza carattere di scommessa con denaro.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-fg mb-2">Segnalazioni</h2>
          <p className="text-fg-muted leading-relaxed">
            Puoi segnalare contenuti inappropriati tramite le funzioni previste in app. Le segnalazioni vengono esaminate 
            dal team di moderazione in tempi ragionevoli.
          </p>
        </section>
      </div>
    </article>
  );
}
