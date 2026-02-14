"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
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
    if (!eventId) return;
    Promise.all([
      fetch(`/api/admin/events/${eventId}`).then((r) => r.json()),
      fetch("/api/events/categories").then((r) => r.json()),
    ]).then(([eventData, catData]) => {
      if (eventData.error) {
        router.push("/admin");
        return;
      }
      const e = eventData;
      setFormData({
        title: e.title ?? "",
        description: e.description ?? "",
        category: e.category ?? "",
        closesAt: e.closesAt ? new Date(e.closesAt).toISOString().slice(0, 16) : "",
        resolutionSourceUrl: e.resolutionSourceUrl ?? "",
        resolutionNotes: e.resolutionNotes ?? "",
      });
      setCategories(catData.categories || []);
    }).catch(() => router.push("/admin"))
      .finally(() => setLoadingData(false));
  }, [eventId, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title?.trim()) newErrors.title = "Il titolo è obbligatorio";
    if (!formData.category) newErrors.category = "La categoria è obbligatoria";
    if (!formData.closesAt) newErrors.closesAt = "La data di chiusura è obbligatoria";
    if (!formData.resolutionSourceUrl?.trim()) newErrors.resolutionSourceUrl = "URL fonte obbligatorio";
    if (!formData.resolutionNotes?.trim()) newErrors.resolutionNotes = "Note di risoluzione obbligatorie";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !eventId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Errore");
      alert("Evento aggiornato.");
      router.push("/admin");
    } catch (err: any) {
      alert(err.message || "Errore");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="p-6 md:p-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      <div className="mb-8">
        <Link href="/admin" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
          ← Torna alla dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Modifica evento</h1>
      </div>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titolo *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg ${errors.title ? "border-red-500" : "border-gray-300 dark:border-gray-600"} dark:bg-gray-700`}
          />
          {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrizione</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoria *</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg ${errors.category ? "border-red-500" : "border-gray-300 dark:border-gray-600"} dark:bg-gray-700`}
          >
            <option value="">Seleziona</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {errors.category && <p className="text-sm text-red-600">{errors.category}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Chiusura *</label>
          <input
            type="datetime-local"
            name="closesAt"
            value={formData.closesAt}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg ${errors.closesAt ? "border-red-500" : "border-gray-300 dark:border-gray-600"} dark:bg-gray-700`}
          />
          {errors.closesAt && <p className="text-sm text-red-600">{errors.closesAt}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL fonte risoluzione *</label>
          <input
            type="url"
            name="resolutionSourceUrl"
            value={formData.resolutionSourceUrl}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg ${errors.resolutionSourceUrl ? "border-red-500" : "border-gray-300 dark:border-gray-600"} dark:bg-gray-700`}
          />
          {errors.resolutionSourceUrl && <p className="text-sm text-red-600">{errors.resolutionSourceUrl}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Note di risoluzione *</label>
          <textarea
            name="resolutionNotes"
            value={formData.resolutionNotes}
            onChange={handleChange}
            rows={3}
            className={`w-full px-4 py-2 border rounded-lg ${errors.resolutionNotes ? "border-red-500" : "border-gray-300 dark:border-gray-600"} dark:bg-gray-700`}
          />
          {errors.resolutionNotes && <p className="text-sm text-red-600">{errors.resolutionNotes}</p>}
        </div>
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Salvataggio..." : "Salva"}
          </button>
          <Link href="/admin" className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-center">
            Annulla
          </Link>
        </div>
      </form>
    </div>
  );
}
