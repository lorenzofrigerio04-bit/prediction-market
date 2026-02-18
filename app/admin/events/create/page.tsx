"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BackLink from "@/components/ui/BackLink";

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
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Rimuovi errore quando l'utente inizia a digitare
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
    <div className="p-6 md:p-8 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <BackLink
            href="/admin"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 mb-4"
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Crea Nuovo Evento
          </h1>
          <p className="text-gray-600">
            Compila il form per creare un nuovo evento di previsione
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8">
          {/* Title */}
          <div className="mb-6">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Titolo *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Es: La Juventus vincerà il campionato?"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Descrizione (opzionale)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Aggiungi dettagli sull'evento..."
            />
          </div>

          {/* Category */}
          <div className="mb-6">
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Categoria *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.category ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Seleziona una categoria</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category}</p>
            )}
            {categories.length === 0 && (
              <p className="mt-2 text-sm text-gray-500">
                Nessuna categoria disponibile. Puoi inserire una nuova categoria
                digitandola nel campo sopra.
              </p>
            )}
          </div>

          {/* Custom Category Input */}
          <div className="mb-6">
            <label
              htmlFor="customCategory"
              className="block text-sm font-medium text-gray-700 mb-2"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Es: Sport, Politica, Tecnologia..."
            />
          </div>

          {/* Closes At */}
          <div className="mb-6">
            <label
              htmlFor="closesAt"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Data e ora di chiusura *
            </label>
            <input
              type="datetime-local"
              id="closesAt"
              name="closesAt"
              value={formData.closesAt}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.closesAt ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.closesAt && (
              <p className="mt-1 text-sm text-red-600">{errors.closesAt}</p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              Dopo questa data, gli utenti non potranno più fare previsioni
              sull&apos;evento.
            </p>
          </div>

          {/* Resolution source URL */}
          <div className="mb-6">
            <label
              htmlFor="resolutionSourceUrl"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              URL fonte di risoluzione *
            </label>
            <input
              type="url"
              id="resolutionSourceUrl"
              name="resolutionSourceUrl"
              value={formData.resolutionSourceUrl}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.resolutionSourceUrl ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="https://..."
            />
            {errors.resolutionSourceUrl && (
              <p className="mt-1 text-sm text-red-600">{errors.resolutionSourceUrl}</p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              Link alla fonte ufficiale che verrà usata per risolvere l&apos;evento.
            </p>
          </div>

          {/* Resolution notes */}
          <div className="mb-6">
            <label
              htmlFor="resolutionNotes"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Note di risoluzione *
            </label>
            <textarea
              id="resolutionNotes"
              name="resolutionNotes"
              value={formData.resolutionNotes}
              onChange={handleChange}
              rows={3}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.resolutionNotes ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Criteri e note per determinare l'esito (SÌ/NO)..."
            />
            {errors.resolutionNotes && (
              <p className="mt-1 text-sm text-red-600">{errors.resolutionNotes}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creazione..." : "Crea Evento"}
            </button>
            <Link
              href="/admin"
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-center"
            >
              Annulla
            </Link>
          </div>
        </form>
    </div>
  );
}
