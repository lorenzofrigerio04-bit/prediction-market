import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer crediti",
  description: "Informazioni sui crediti virtuali e sul loro utilizzo sulla piattaforma.",
};

export default function CreditsDisclaimerPage() {
  return (
    <article className="box-raised rounded-3xl p-6 md:p-8 border border-border/70 bg-admin-bg">
      <h1 className="font-kalshi text-[1.9rem] md:text-[2.25rem] font-bold text-fg leading-[1.04] tracking-[0.01em] mb-2">
        Disclaimer crediti
      </h1>
      <p className="text-fg-muted text-sm mb-8">
        Informazioni importanti sulla valuta virtuale utilizzata nella piattaforma.
      </p>

      <div className="rounded-2xl bg-[#81D8D0]/[0.08] border border-[#81D8D0]/35 p-5 mb-8">
        <p className="text-fg font-medium leading-relaxed">
          I crediti sono valuta di gioco. Non hanno valore monetario, non sono prelevabili né convertibili in denaro o altri beni.
        </p>
      </div>

      <div className="prose prose-sm max-w-none text-fg space-y-6">
        <section>
          <h2 className="font-kalshi text-[1.25rem] font-bold text-fg leading-[1.06] tracking-[0.01em] mb-2">Cosa sono i crediti</h2>
          <p className="text-fg-muted leading-relaxed">
            I crediti sono l&apos;unità virtuale utilizzata sulla piattaforma per partecipare alle previsioni, ritirare bonus 
            giornalieri, completare missioni e utilizzare le funzioni del negozio (ove presenti). Servono esclusivamente 
            a rendere l&apos;esperienza coinvolgente e a misurare la performance in un contesto di gioco.
          </p>
        </section>

        <section>
          <h2 className="font-kalshi text-[1.25rem] font-bold text-fg leading-[1.06] tracking-[0.01em] mb-2">Nessun valore reale</h2>
          <p className="text-fg-muted leading-relaxed">
            I crediti non rappresentano denaro né alcun bene di valore economico. Non possono essere prelevati, venduti, 
            scambiati né convertiti in valuta reale o in altri beni o servizi a pagamento. Eventuali riferimenti a 
            &quot;vincite&quot; o &quot;guadagni&quot; si intendono esclusivamente in termini di crediti virtuali all&apos;interno del gioco.
          </p>
        </section>

        <section>
          <h2 className="font-kalshi text-[1.25rem] font-bold text-fg leading-[1.06] tracking-[0.01em] mb-2">Uso del servizio</h2>
          <p className="text-fg-muted leading-relaxed">
            Utilizzando la piattaforma accetti che le previsioni e le relative ricompense in crediti siano parte di un 
            servizio di intrattenimento e non costituiscano scommesse o giochi con denaro. Per i termini completi del 
            servizio si rimanda alla pagina Termini di servizio.
          </p>
        </section>
      </div>
    </article>
  );
}
