import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Termini e condizioni – Notifiche e comunicazioni",
  description: "Termini per l'inserimento del numero di telefono in fase di creazione evento: notifiche e aggiornamenti.",
};

export default function TerminiCreazioneEventoPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-8 md:py-12">
        <Link
          href="/crea"
          className="inline-flex items-center text-sm text-white/70 hover:text-white mb-6"
        >
          ← Torna alla creazione evento
        </Link>
        <article className="box-raised rounded-2xl p-6 md:p-8 bg-white/5 border border-white/10">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Termini e condizioni – Notifiche e comunicazioni
          </h1>
          <p className="text-white/70 text-sm mb-8">
            Inserendo il tuo numero di telefono in fase di pubblicazione di un evento accetti quanto segue.
          </p>

          <div className="prose prose-sm max-w-none text-white/90 space-y-6">
            <section>
              <h2 className="text-lg font-semibold text-white mb-2">1. Finalità del trattamento</h2>
              <p className="text-white/80 leading-relaxed">
                Il numero di telefono da te fornito sarà utilizzato per:
              </p>
              <ul className="list-disc list-inside text-white/80 space-y-1 ml-2">
                <li>
                  <strong>Notifica di approvazione:</strong> avvisarti tramite WhatsApp (o altro canale di messaggistica) quando il tuo evento sarà approvato e pubblicato sulla piattaforma.
                </li>
                <li>
                  <strong>Comunicazioni di aggiornamento e marketing:</strong> inviarti aggiornamenti sul lancio del tuo evento, iniziative della piattaforma e, con il tuo consenso implicito tramite l&apos;accettazione di questi termini, comunicazioni promozionali e di marketing relative ai servizi offerti.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">2. Base giuridica e consenso</h2>
              <p className="text-white/80 leading-relaxed">
                Il conferimento del numero e l&apos;accettazione di questi termini costituiscono consenso al trattamento per le finalità di cui sopra. Puoi revocare il consenso in qualsiasi momento contattandoci o tramite le impostazioni della piattaforma, senza pregiudicare la liceità del trattamento basato sul consenso prestato in precedenza.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">3. Conservazione e sicurezza</h2>
              <p className="text-white/80 leading-relaxed">
                I dati di contatto sono conservati per il tempo necessario a erogare le notifiche e le comunicazioni descritte e, ove applicabile, per il periodo consentito dalla normativa in materia di marketing. Adottiamo misure tecniche e organizzative adeguate per proteggere i tuoi dati.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">4. Diritti dell&apos;interessato</h2>
              <p className="text-white/80 leading-relaxed">
                In conformità al Regolamento (UE) 2016/679 (GDPR) e alla normativa italiana, hai diritto di accesso, rettifica, cancellazione, limitazione del trattamento, portabilità dei dati e opposizione, nonché a proporre reclamo all&apos;Autorità Garante per la protezione dei dati personali. Per esercitare i tuoi diritti o per qualsiasi domanda puoi contattarci tramite i canali indicati nella piattaforma (es. pagina Contatti o Supporto).
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">5. Natura del conferimento</h2>
              <p className="text-white/80 leading-relaxed">
                Il conferimento del numero di telefono e l&apos;accettazione di questi termini sono facoltativi; in assenza di tale conferimento potrai comunque pubblicare l&apos;evento, senza ricevere le notifiche e le comunicazioni descritte sopra.
              </p>
            </section>
          </div>

          <p className="text-white/60 text-sm mt-8">
            Ultimo aggiornamento: febbraio 2025.
          </p>
        </article>
      </main>
    </div>
  );
}
