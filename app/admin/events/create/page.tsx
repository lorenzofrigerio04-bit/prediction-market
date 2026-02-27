"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BackLink from "@/components/ui/BackLink";
import FilterDropdown from "@/components/ui/FilterDropdown";

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    closesAt: "",
    resolutionSourceUrl: "",
    resolutionNotes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDateModal, setShowDateModal] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/events/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    const next =
      name === "resolutionNotes"
        ? { ...formData, [name]: value.toLowerCase() }
        : { ...formData, [name]: value };
    setFormData(next);
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Il titolo è obbligatorio";
    } else if (formData.title.trim().length < 5) {
      newErrors.title = "Il titolo deve essere di almeno 5 caratteri";
    }

    if (!formData.category) {
      newErrors.category = "La categoria è obbligatoria";
    }

    if (!formData.closesAt) {
      newErrors.closesAt = "La data di chiusura è obbligatoria";
    } else {
      const closesAtDate = new Date(formData.closesAt);
      if (isNaN(closesAtDate.getTime())) {
        newErrors.closesAt = "Data non valida";
      } else if (closesAtDate <= new Date()) {
        newErrors.closesAt = "La data di chiusura deve essere nel futuro";
      }
    }

    if (!formData.resolutionSourceUrl.trim()) {
      newErrors.resolutionSourceUrl = "L'URL della fonte di risoluzione è obbligatorio";
    }
    if (!formData.resolutionNotes.trim()) {
      newErrors.resolutionNotes = "Le note di risoluzione sono obbligatorie";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "Errore nella creazione dell'evento");
        return;
      }

      const data = await response.json();
      alert("Evento creato con successo!");
      router.push(`/events/${data.event.id}`);
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Errore nella creazione dell'evento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-fg p-6 md:p-8 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <BackLink
            href="/admin"
            className="inline-flex items-center text-fg-muted hover:text-primary transition-colors mb-4"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Indietro
          </BackLink>
          <h1 className="text-2xl md:text-3xl font-bold text-fg mb-2">
            Crea Nuovo Evento
          </h1>
          <p className="text-fg-muted">
            Compila il form per creare un nuovo evento di previsione
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card-raised rounded-2xl p-6 md:p-8">
          {/* Title */}
          <div className="mb-6">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-fg-muted mb-2"
            >
              Titolo *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-xl bg-white/5 text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${
                errors.title ? "border-danger" : "border-border dark:border-white/10"
              }`}
              placeholder="Es: La Juventus vincerà il campionato?"
            />
            {errors.title && (
              <p className="mt-1.5 text-sm text-danger">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-fg-muted mb-2"
            >
              Descrizione (opzionale)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 border border-border dark:border-white/10 rounded-xl bg-white/5 text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              placeholder="Aggiungi dettagli sull'evento..."
            />
          </div>

          {/* Category — dropdown come in classifica, scrollabile e ottimizzato per mobile */}
          <div className="mb-6">
            <FilterDropdown
              label="Categoria *"
              options={[
                { id: "", label: "Seleziona una categoria" },
                ...categories.map((c) => ({ id: c, label: c })),
              ]}
              value={formData.category}
              onChange={(id) => {
                setFormData((prev) => ({ ...prev, category: id }));
                if (errors.category) {
                  setErrors((prev) => ({ ...prev, category: "" }));
                }
              }}
              className="w-full"
            />
            {errors.category && (
              <p className="mt-1.5 text-sm text-danger">{errors.category}</p>
            )}
            {categories.length === 0 && (
              <p className="mt-2 text-sm text-fg-subtle">
                Nessuna categoria disponibile. Puoi inserire una nuova categoria
                digitandola nel campo sotto.
              </p>
            )}
          </div>

          {/* Custom Category Input */}
          <div className="mb-6">
            <label
              htmlFor="customCategory"
              className="block text-sm font-medium text-fg-muted mb-2"
            >
              Oppure inserisci una nuova categoria
            </label>
            <input
              type="text"
              id="customCategory"
              name="customCategory"
              onChange={(e) => {
                if (e.target.value.trim()) {
                  setFormData((prev) => ({
                    ...prev,
                    category: e.target.value.trim(),
                  }));
                }
              }}
              className="w-full px-4 py-3 border border-border dark:border-white/10 rounded-xl bg-white/5 text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              placeholder="Es: Sport, Politica, Tecnologia..."
            />
          </div>

          {/* Closes At — apertura in modale per sfondo stabile e calendario leggibile */}
          <div className="mb-6">
            <label
              htmlFor="closesAt"
              className="block text-sm font-medium text-fg-muted mb-2"
            >
              Data e ora di chiusura *
            </label>
            <button
              type="button"
              id="closesAt-trigger"
              onClick={() => setShowDateModal(true)}
              className={`w-full px-4 py-3 border rounded-xl bg-white/5 text-fg text-left focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors flex items-center justify-between ${
                errors.closesAt ? "border-danger" : "border-border dark:border-white/10"
              }`}
            >
              <span className={formData.closesAt ? "" : "text-fg-subtle"}>
                {formData.closesAt
                  ? new Date(formData.closesAt).toLocaleString("it-IT", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "Scegli data e ora"}
              </span>
              <svg className="w-5 h-5 text-fg-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            {errors.closesAt && (
              <p className="mt-1.5 text-sm text-danger">{errors.closesAt}</p>
            )}
            <p className="mt-2 text-sm text-fg-subtle">
              Dopo questa data, gli utenti non potranno più fare previsioni
              sull&apos;evento.
            </p>
          </div>

          {/* Modale calendario: sfondo fisso, calendario in primo piano */}
          {showDateModal && (
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowDateModal(false)}
              role="dialog"
              aria-modal="true"
              aria-labelledby="date-modal-title"
            >
              <div
                className="bg-bg border border-border dark:border-white/10 rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 border-b border-border dark:border-white/10 flex items-center justify-between">
                  <h2 id="date-modal-title" className="text-lg font-semibold text-fg">
                    Data e ora di chiusura
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowDateModal(false)}
                    className="p-2 rounded-lg hover:bg-white/10 text-fg-muted hover:text-fg transition-colors"
                    aria-label="Chiudi"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  <input
                    type="datetime-local"
                    id="closesAt"
                    name="closesAt"
                    value={formData.closesAt}
                    onChange={(e) => {
                      handleChange(e);
                      if (e.target.value) setShowDateModal(false);
                    }}
                    className={`w-full px-4 py-3 border rounded-xl bg-white/5 text-fg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-base min-h-[48px] ${
                      errors.closesAt ? "border-danger" : "border-border dark:border-white/10"
                    }`}
                  />
                </div>
                <div className="p-4 pt-0">
                  <button
                    type="button"
                    onClick={() => setShowDateModal(false)}
                    className="w-full py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary-hover transition-colors"
                  >
                    Fatto
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Resolution source URL */}
          <div className="mb-6">
            <label
              htmlFor="resolutionSourceUrl"
              className="block text-sm font-medium text-fg-muted mb-2"
            >
              URL fonte di risoluzione *
            </label>
            <input
              type="url"
              id="resolutionSourceUrl"
              name="resolutionSourceUrl"
              value={formData.resolutionSourceUrl}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-xl bg-white/5 text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${
                errors.resolutionSourceUrl ? "border-danger" : "border-border dark:border-white/10"
              }`}
              placeholder="https://..."
            />
            {errors.resolutionSourceUrl && (
              <p className="mt-1.5 text-sm text-danger">{errors.resolutionSourceUrl}</p>
            )}
            <p className="mt-2 text-sm text-fg-subtle">
              Link alla fonte ufficiale che verrà usata per risolvere l&apos;evento.
            </p>
          </div>

          {/* Resolution notes — testo minuscolo, incolla link consentito */}
          <div className="mb-6">
            <label
              htmlFor="resolutionNotes"
              className="block text-sm font-medium text-fg-muted mb-2"
            >
              Note di risoluzione *
            </label>
            <textarea
              id="resolutionNotes"
              name="resolutionNotes"
              value={formData.resolutionNotes}
              onChange={handleChange}
              rows={3}
              className={`w-full px-4 py-3 border rounded-xl bg-white/5 text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors lowercase ${
                errors.resolutionNotes ? "border-danger" : "border-border dark:border-white/10"
              }`}
              placeholder="criteri e note per determinare l'esito (sì/no). puoi incollare un link..."
              style={{ textTransform: "lowercase" }}
            />
            {errors.resolutionNotes && (
              <p className="mt-1.5 text-sm text-danger">{errors.resolutionNotes}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary-hover transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_24px_-6px_rgba(var(--primary-glow),0.45)]"
            >
              {loading ? "Creazione..." : "Crea Evento"}
            </button>
            <Link
              href="/admin"
              className="px-6 py-3 border border-border dark:border-white/10 rounded-xl hover:bg-surface/50 transition-colors font-medium text-center text-fg"
            >
              Annulla
            </Link>
          </div>
        </form>
    </div>
  );
}
