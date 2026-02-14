import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "Informativa sulla privacy e sul trattamento dei dati personali.",
};

export default function PrivacyPage() {
  return (
    <article className="glass rounded-2xl border border-border dark:border-white/10 p-6 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold text-fg mb-2">
        Privacy policy
      </h1>
      <p className="text-fg-muted text-sm mb-8">
        Ultimo aggiornamento: febbraio 2025. Descriviamo come trattiamo i tuoi dati personali.
      </p>

      <div className="prose prose-sm max-w-none text-fg space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-fg mb-2">1. Dati raccolti</h2>
          <p className="text-fg-muted leading-relaxed">
            Raccogliamo i dati necessari per erogare il servizio: dati di registrazione (email, nome, eventuale username), 
            dati di utilizzo (previsioni, commenti, missioni, transazioni in crediti virtuali), dati tecnici (indirizzo IP, 
            tipo di dispositivo, log di accesso) per sicurezza e funzionamento. Non vendiamo i tuoi dati a terzi per scopi di marketing.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-fg mb-2">2. Base giuridica</h2>
          <p className="text-fg-muted leading-relaxed">
            Il trattamento è fondato su: esecuzione del contratto (erogazione del servizio), legittimo interesse (sicurezza, 
            anti-abuso, miglioramento del prodotto) e, ove richiesto dalla legge, sul tuo consenso. Per invii promozionali 
            utilizzeremo il consenso esplicito dove previsto dalla normativa.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-fg mb-2">3. Diritti dell&apos;utente (GDPR)</h2>
          <p className="text-fg-muted leading-relaxed">
            In conformità al Regolamento UE 2016/679 (GDPR) hai diritto di: accedere ai tuoi dati, ottenere la rettifica 
            o la cancellazione, limitare il trattamento, opporti al trattamento, richiedere la portabilità dei dati. Puoi 
            esercitare i diritti contattando il titolare del trattamento (indicato in app o nel sito). Hai inoltre diritto 
            a proporre reclamo all&apos;autorità di controllo competente (Garante per la protezione dei dati personali in Italia).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-fg mb-2">4. Conservazione e sicurezza</h2>
          <p className="text-fg-muted leading-relaxed">
            Conserviamo i dati per il tempo necessario a fornire il servizio e adempiere obblighi di legge. Adottiamo 
            misure tecniche e organizzative adeguate per proteggere i dati da accessi non autorizzati, perdita o alterazione.
          </p>
        </section>
      </div>
    </article>
  );
}
