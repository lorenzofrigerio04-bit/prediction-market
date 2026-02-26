"use client";

interface CreaEventConfiguratorBoxProps {
  category: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
  title: string;
  onTitleChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
}

const inputClass =
  "w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all text-ds-body-sm";

export default function CreaEventConfiguratorBox({
  category,
  onCategoryChange,
  categories,
  title,
  onTitleChange,
  description,
  onDescriptionChange,
}: CreaEventConfiguratorBoxProps) {
  return (
    <article className="w-full max-w-md mx-auto crea-configurator-card card-raised rounded-2xl p-5 flex flex-col border-2 border-white/10 bg-white/5 backdrop-blur-sm shadow-xl">
      {/* Categoria + Scadenza (Fase 2) */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className={`${inputClass} flex-1 min-w-0 font-semibold appearance-none cursor-pointer`}
          aria-label="Categoria"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat} className="bg-gray-900 text-white">
              {cat}
            </option>
          ))}
        </select>
        <span className="shrink-0 inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-ds-caption font-bold bg-white/5 text-white/60 border border-white/10">
          Scadenza
        </span>
      </div>

      {/* Titolo */}
      <input
        type="text"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="Titolo dell'evento"
        className={`${inputClass} text-ds-body font-bold mb-2 placeholder:text-white/40`}
        maxLength={200}
        aria-label="Titolo"
      />

      {/* Descrizione */}
      <textarea
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        placeholder="Descrizione..."
        rows={2}
        className={`${inputClass} resize-none text-ds-body-sm min-h-[4rem]`}
        maxLength={1000}
        aria-label="Descrizione"
      />

      {/* Blocco Sì/No placeholder */}
      <div className="grid grid-cols-2 gap-0 mt-3 rounded-xl overflow-hidden border border-white/10">
        <div className="prediction-block-si rounded-l-xl border-r-0 p-2.5">
          <div className="text-lg font-extrabold font-numeric text-white/50">—%</div>
          <div className="text-ds-micro font-bold uppercase text-white/40">Sì</div>
        </div>
        <div className="prediction-block-no rounded-r-xl border-l-0 p-2.5">
          <div className="text-lg font-extrabold font-numeric text-white/50">—%</div>
          <div className="text-ds-micro font-bold uppercase text-white/40">No</div>
        </div>
      </div>
    </article>
  );
}
