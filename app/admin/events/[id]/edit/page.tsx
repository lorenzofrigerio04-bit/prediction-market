"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import BackLink from "@/components/ui/BackLink";

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
      <div className="min-h-screen bg-bg p-6 md:p-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-fg p-6 md:p-8 max-w-3xl">
      <div className="mb-8">
        <BackLink href="/admin" className="inline-flex items-center text-fg-muted hover:text-primary transition-colors mb-4">
          ← Indietro
        </BackLink>
        <h1 className="text-2xl font-bold text-fg">Modifica evento</h1>
      </div>
      <form onSubmit={handleSubmit} className="card-raised rounded-2xl p-6 md:p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-fg-muted mb-2">Titolo *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-xl bg-white/5 text-fg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${errors.title ? "border-danger" : "border-border dark:border-white/10"}`}
          />
          {errors.title && <p className="text-sm text-danger mt-1.5">{errors.title}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-fg-muted mb-2">Descrizione</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 border border-border dark:border-white/10 rounded-xl bg-white/5 text-fg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-fg-muted mb-2">Categoria *</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-xl bg-white/5 text-fg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors appearance-none ${errors.category ? "border-danger" : "border-border dark:border-white/10"}`}
          >
            <option value="">Seleziona</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {errors.category && <p className="text-sm text-danger mt-1.5">{errors.category}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-fg-muted mb-2">Chiusura *</label>
          <input
            type="datetime-local"
            name="closesAt"
            value={formData.closesAt}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-xl bg-white/5 text-fg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${errors.closesAt ? "border-danger" : "border-border dark:border-white/10"}`}
          />
          {errors.closesAt && <p className="text-sm text-danger mt-1.5">{errors.closesAt}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-fg-muted mb-2">URL fonte risoluzione *</label>
          <input
            type="url"
            name="resolutionSourceUrl"
            value={formData.resolutionSourceUrl}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-xl bg-white/5 text-fg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${errors.resolutionSourceUrl ? "border-danger" : "border-border dark:border-white/10"}`}
          />
          {errors.resolutionSourceUrl && <p className="text-sm text-danger mt-1.5">{errors.resolutionSourceUrl}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-fg-muted mb-2">Note di risoluzione *</label>
          <textarea
            name="resolutionNotes"
            value={formData.resolutionNotes}
            onChange={handleChange}
            rows={3}
            className={`w-full px-4 py-3 border rounded-xl bg-white/5 text-fg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${errors.resolutionNotes ? "border-danger" : "border-border dark:border-white/10"}`}
          />
          {errors.resolutionNotes && <p className="text-sm text-danger mt-1.5">{errors.resolutionNotes}</p>}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary-hover disabled:opacity-50 font-medium transition-colors shadow-[0_0_24px_-6px_rgba(var(--primary-glow),0.45)]"
          >
            {loading ? "Salvataggio..." : "Salva"}
          </button>
          <Link href="/admin" className="px-6 py-3 border border-border dark:border-white/10 rounded-xl text-center text-fg hover:bg-surface/50 transition-colors">
            Annulla
          </Link>
        </div>
      </form>
    </div>
  );
}
