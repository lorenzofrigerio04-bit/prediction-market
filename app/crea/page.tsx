"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { LoadingBlock } from "@/components/ui";
import CreaEventTileConfigurator from "@/components/crea/CreaEventTileConfigurator";
import CreaEventHomeBox from "@/components/crea/CreaEventHomeBox";
import CrystalBallOnly from "@/components/crea/CrystalBallOnly";
import CrystalBallStep from "@/components/crea/CrystalBallStep";
import EventInRevisionModal from "@/components/crea/EventInRevisionModal";
import PublishPhoneModal from "@/components/crea/PublishPhoneModal";

type SubmitStatus = "idle" | "loading" | "approved" | "rejected" | "pendingReview";

interface SubmitResult {
  approved?: boolean;
  pendingReview?: boolean;
  submissionId?: string;
  eventId?: string;
  errors?: string[];
  warnings?: string[];
  message?: string;
}

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all";
const labelClass = "block text-ds-body-sm font-semibold text-white/90 mb-1.5";

export default function CreaPage() {
  const { status } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState<string[]>([]);
  const [loadingCat, setLoadingCat] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [closesAt, setClosesAt] = useState("");
  const [resolutionSource, setResolutionSource] = useState("");
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  /** Flusso conferma: idle → retracting (messaggi rientrano) → sliding (palla+box salgono) → confirmed */
  const [confirmState, setConfirmState] = useState<"idle" | "retracting" | "sliding" | "confirmed">("idle");
  /** Per animare lo slide: applica translateY dopo il primo frame */
  const [slideApplied, setSlideApplied] = useState(false);
  /** Titolo "confermato" = utente ha fatto blur o Invio sulla tastiera; lo step 3 si mostra solo dopo */
  const [titleConfirmed, setTitleConfirmed] = useState(false);
  /** Popup telefono + termini prima di inviare (stato "confirmed") */
  const [showPublishPhoneModal, setShowPublishPhoneModal] = useState(false);

  const minDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16);

  const fetchCategories = useCallback(async () => {
    setLoadingCat(true);
    try {
      const res = await fetch("/api/events/categories");
      if (res.ok) {
        const data = await res.json();
        const list = data.categories || [];
        setCategories(list);
      }
    } catch {
      setCategories([]);
    } finally {
      setLoadingCat(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (showPublishPhoneModal) setErrorMsg("");
  }, [showPublishPhoneModal]);

  const handleSubmit = async (e: React.FormEvent, notifyPhone?: string) => {
    e.preventDefault();
    if (status !== "authenticated") {
      setErrorMsg("Devi effettuare il login per creare un evento.");
      return;
    }
    if (!title.trim() || !category || !closesAt || !resolutionSource.trim()) {
      setErrorMsg("Compila tutti i campi obbligatori: categoria, titolo, scadenza e link risoluzione.");
      return;
    }
    setSubmitStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/events/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          category,
          closesAt: new Date(closesAt).toISOString(),
          resolutionSource: resolutionSource.trim() || null,
          ...(notifyPhone != null && notifyPhone.trim() ? { notifyPhone: notifyPhone.trim() } : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMsg(data.error || data.message || "Errore durante l'invio. Riprova.");
        setSubmitStatus("idle");
        return;
      }
      if (data.approved && data.eventId) {
        setSubmitResult(data);
        setSubmitStatus("approved");
        setShowPublishPhoneModal(false);
      } else if (data.pendingReview && data.submissionId) {
        setSubmitResult(data);
        setSubmitStatus("pendingReview");
        setShowPublishPhoneModal(false);
        router.replace("/discover?tab=seguiti#creati");
      } else {
        setSubmitResult(data);
        setSubmitStatus("rejected");
        setShowPublishPhoneModal(false);
      }
    } catch {
      setErrorMsg("Errore di rete. Riprova.");
      setSubmitStatus("idle");
    }
  };

  const resetForm = () => {
    setConfirmState("idle");
    setSlideApplied(false);
    setTitle("");
    setDescription("");
    setTitleConfirmed(false);
    setCategory(categories[0] || "");
    setClosesAt("");
    setResolutionSource("");
    setSubmitStatus("idle");
    setSubmitResult(null);
    setErrorMsg("");
  };

  const closeRevisionModal = () => {
    setSubmitStatus("idle");
    setSubmitResult(null);
    setConfirmState("idle");
    setSlideApplied(false);
    setTitle("");
    setDescription("");
    setTitleConfirmed(false);
    setCategory(categories[0] || "");
    setClosesAt("");
    setResolutionSource("");
  };

  /** Conferma evento: ritira messaggi, poi slide su di palla + box */
  const handleConfirm = () => {
    if (confirmState !== "idle") return;
    setConfirmState("retracting");
  };

  useEffect(() => {
    if (confirmState !== "retracting") return;
    const t = setTimeout(() => {
      setConfirmState("sliding");
    }, 600);
    return () => clearTimeout(t);
  }, [confirmState]);

  useEffect(() => {
    if (confirmState !== "sliding") return;
    const raf = requestAnimationFrame(() => {
      setSlideApplied(true);
    });
    return () => cancelAnimationFrame(raf);
  }, [confirmState]);

  useEffect(() => {
    if (confirmState !== "sliding" || !slideApplied) return;
    const t = setTimeout(() => setConfirmState("confirmed"), 650);
    return () => clearTimeout(t);
  }, [confirmState, slideApplied]);

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen relative">
        <Header />
        <main id="main-content" className="mx-auto max-w-md px-page-x py-page-y md:py-8">
          <div className="crea-page-box create-event-modal rounded-2xl p-6 text-center">
            <h1 className="text-ds-h2 font-bold text-white mb-2">Crea evento</h1>
            <p className="text-ds-body text-white/80 mb-6">
              Accedi per proporre un nuovo evento alla community.
            </p>
            <Link
              href={`/auth/login?callbackUrl=${encodeURIComponent("/crea")}`}
              className="landing-cta-primary min-h-[48px] px-6 py-3 rounded-xl font-semibold text-ds-body-sm w-full inline-flex items-center justify-center"
            >
              Accedi
            </Link>
          </div>
        </main>
      </div>
    );
  }

  /* Mostra la schermata di caricamento solo al primo carico (nessuna categoria ancora). Quando l'utente seleziona la categoria restiamo sulla schermata attuale così si vede la scossa della sfera. */
  if (loadingCat && categories.length === 0) {
    return (
      <div className="min-h-screen relative">
        <Header />
        <main id="main-content" className="mx-auto max-w-md px-page-x py-page-y md:py-8 flex items-center justify-center min-h-[60vh]">
          <LoadingBlock message="Caricamento…" />
        </main>
      </div>
    );
  }

  /* Unica schermata: crea evento. Idle = compila + conferma; retracting/sliding/confirmed = palla ritira messaggi e sale con il box */
  if (status === "authenticated" && (confirmState === "idle" || confirmState === "retracting")) {
    const step5Done = resolutionSource.trim().length > 0;
    const canConfirm = !!category && title.trim().length > 0 && !!closesAt && step5Done;
    const step1Done = !!category;
    const step2Done = titleConfirmed;
    const step3Done = description.trim().length > 0;
    const step4Done = !!closesAt;
    const isRetracting = confirmState === "retracting";
    return (
      <div className="min-h-screen relative flex flex-col">
        <Header />
        <main
          id="main-content"
          className="relative mx-auto px-4 flex flex-col flex-1 min-h-0 pt-4 pb-[calc(0.5cm+5rem+var(--safe-area-inset-bottom))] md:pb-[calc(0.5cm+5rem)]"
        >
          <header className="relative flex items-center justify-center shrink-0 pt-1 pb-3 min-h-[3rem]">
            <h1 className="text-sm sm:text-lg font-semibold text-white/90 tracking-tight uppercase whitespace-nowrap px-2 text-center">
              Crea il tuo evento
            </h1>
          </header>
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 min-h-0" aria-hidden />
            <CrystalBallStep
              step1Done={step1Done}
              step2Done={step2Done}
              step3Done={step3Done}
              step4Done={step4Done}
              step5Done={step5Done}
              retract={isRetracting}
            />
            <div className="flex-1 flex items-center justify-center min-h-0 py-4 overflow-auto overflow-x-hidden">
              <div className="w-full max-w-[320px] sm:max-w-[360px] min-w-[280px] sm:min-w-[320px] scroll-mt-4">
                <CreaEventHomeBox
                  category={category}
                  onCategoryChange={setCategory}
                  categories={categories}
                  title={title}
                  onTitleChange={(value) => {
                    setTitle(value);
                    if (!value.trim()) setTitleConfirmed(false);
                  }}
                  onTitleConfirm={() => title.trim().length > 0 && setTitleConfirmed(true)}
                  description={description}
                  onDescriptionChange={setDescription}
                  closesAt={closesAt}
                  onClosesAtChange={setClosesAt}
                  resolutionSource={resolutionSource}
                  onResolutionSourceChange={setResolutionSource}
                  minDate={minDate}
                />
              </div>
            </div>
          </div>
          <div className="shrink-0 flex justify-center">
            <button
              id="crea-confirm-button"
              type="button"
              onClick={handleConfirm}
              disabled={!canConfirm || isRetracting}
              className="landing-cta-primary min-h-[52px] px-8 py-3 rounded-xl font-semibold text-ds-body-sm w-full max-w-md inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Conferma
            </button>
          </div>
        </main>
      </div>
    );
  }

  /* Sliding o confirmed: blocco palla + box (senza numeri) che è salito */
  if (status === "authenticated" && (confirmState === "sliding" || confirmState === "confirmed")) {
    const blockClass =
      confirmState === "confirmed"
        ? "crea-confirmed-block crea-confirmed-block--done"
        : `crea-confirmed-block ${slideApplied ? "crea-confirmed-block--sliding" : ""}`;
    return (
      <div className="min-h-screen relative flex flex-col">
        <Header />
        <main
          id="main-content"
          className="relative mx-auto px-4 flex flex-col flex-1 min-h-0 pt-4 pb-[calc(0.5cm+5rem+var(--safe-area-inset-bottom))] md:pb-[calc(0.5cm+5rem)]"
        >
          <header className="relative flex items-center justify-center shrink-0 pt-1 pb-3 min-h-[3rem]">
            <h1 className="text-sm sm:text-lg font-semibold text-white/90 tracking-tight uppercase whitespace-nowrap px-2 text-center">
              Crea il tuo evento
            </h1>
          </header>
          <div className="flex-1 flex items-center justify-center overflow-auto">
            <div className={`${blockClass} flex flex-col items-center gap-4`}>
              <div className="flex flex-col items-center shrink-0">
                <CrystalBallOnly
                  message={confirmState === "confirmed" ? "Complimenti! Il tuo evento è creato" : undefined}
                />
              </div>
              <div className="w-full max-w-[320px] sm:max-w-[360px]">
                <CreaEventTileConfigurator
                  category={category}
                  categories={categories}
                  title={title}
                  description={description}
                  readOnly
                  closesAt={closesAt || undefined}
                />
              </div>
            </div>
          </div>
          {confirmState === "confirmed" && (
            <>
              <div className="shrink-0 flex flex-col items-center gap-2 w-full max-w-md">
                <button
                  type="button"
                  onClick={() => setShowPublishPhoneModal(true)}
                  disabled={submitStatus === "loading"}
                  className="landing-cta-primary min-h-[52px] px-8 py-3 rounded-xl font-semibold text-ds-body-sm w-full inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Pubblica
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmState("idle");
                    setSlideApplied(false);
                  }}
                  className="text-sm font-medium text-white/70 hover:text-white transition-colors py-2"
                >
                  Modifica
                </button>
              </div>
              <PublishPhoneModal
                open={showPublishPhoneModal}
                onClose={() => {
                  setShowPublishPhoneModal(false);
                  setErrorMsg("");
                }}
                onConfirm={(phone) =>
                  handleSubmit({ preventDefault: () => {} } as React.FormEvent, phone)
                }
                isSubmitting={submitStatus === "loading"}
                error={errorMsg}
              />
            </>
          )}
        </main>
      </div>
    );
  }

  if (submitStatus === "approved" && submitResult?.eventId) {
    return (
      <div className="min-h-screen relative">
        <Header />
        <main id="main-content" className="mx-auto max-w-md px-page-x py-page-y md:py-8">
          <div className="crea-page-box create-event-modal rounded-2xl p-6 text-center animate-in-fade-up">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-ds-h2 font-bold text-white mb-2">Evento pubblicato!</h1>
            <p className="text-ds-body text-white/80 mb-6">
              Il tuo evento è stato approvato e pubblicato. Ora la community può fare previsioni!
            </p>
            {submitResult.warnings && submitResult.warnings.length > 0 && (
              <div className="mb-4 p-3 rounded-lg bg-yellow-500/20 border border-yellow-500/30 text-yellow-200 text-ds-body-sm text-left">
                <p className="font-semibold mb-1">Suggerimenti:</p>
                <ul className="list-disc list-inside space-y-1">
                  {submitResult.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex flex-col gap-3">
              <Link
                href={`/events/${submitResult.eventId}`}
                className="landing-cta-primary min-h-[48px] px-6 py-3 rounded-xl font-semibold text-ds-body-sm w-full inline-flex items-center justify-center"
              >
                Vai all&apos;evento →
              </Link>
              <Link
                href="/crea"
                onClick={resetForm}
                className="min-h-[44px] px-6 py-2.5 rounded-xl font-semibold text-ds-body-sm w-full bg-white/10 text-white hover:bg-white/20 transition-colors inline-flex items-center justify-center"
              >
                Crea un altro evento
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (submitStatus === "rejected" && submitResult) {
    return (
      <div className="min-h-screen relative">
        <Header />
        <main id="main-content" className="mx-auto max-w-md px-page-x py-page-y md:py-8">
          <div className="crea-page-box create-event-modal rounded-2xl p-6 text-center animate-in-fade-up">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-ds-h2 font-bold text-white mb-2">Evento non approvato</h1>
            <p className="text-ds-body text-white/80 mb-4">
              L&apos;evento non rispetta i criteri della piattaforma. Ecco cosa correggere:
            </p>
            {submitResult.errors && submitResult.errors.length > 0 && (
              <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-left">
                <ul className="space-y-2">
                  {submitResult.errors.map((err, i) => (
                    <li key={i} className="flex items-start gap-2 text-ds-body-sm text-red-200">
                      <span className="text-red-400 mt-0.5">•</span>
                      <span>{err}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="landing-cta-primary min-h-[48px] px-6 py-3 rounded-xl font-semibold text-ds-body-sm w-full"
              >
                Riprova
              </button>
              <Link
                href="/discover"
                className="min-h-[44px] px-6 py-2.5 rounded-xl font-semibold text-ds-body-sm w-full bg-white/10 text-white hover:bg-white/20 transition-colors inline-flex items-center justify-center"
              >
                Torna agli eventi
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return null;
}
