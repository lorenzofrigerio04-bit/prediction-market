# Personal Design System — Dark Premium Liquid Glass

> Linee guida personali per tutti i progetti UI/UX.
> **Priorità massima**: questo file sovrascrive qualsiasi raccomandazione generica del skill.
> Aggiornato: Aprile 2026

---

## Filosofia

**Ultra premium. Minimal. Fluido.**

L'interfaccia deve comunicare qualità attraverso l'assenza — non attraverso decorazioni.
Ogni elemento deve guadagnarsi il suo spazio. Le animazioni si _sentono_ ma non si _notano_.
Il risultato finale deve sembrare che Apple e Linear abbiano costruito insieme un prodotto fintech.

---

## Background & Superfici

| Livello | Token | Valore |
|---------|-------|--------|
| Base (pagina) | `--bg-primary` | `#09090B` — Zinc Black |
| Surface (card, panel) | `--bg-surface` | `rgba(255, 255, 255, 0.05)` |
| Elevated (modal, dropdown) | `--bg-elevated` | `rgba(255, 255, 255, 0.08)` |
| Overlay (tooltip, popover) | `--bg-overlay` | `rgba(255, 255, 255, 0.10)` |

**Regola**: mai usare un colore opaco per le card — sempre vetro (rgba + blur).

---

## Colori

### Testo
| Token | Valore | Uso |
|-------|--------|-----|
| `--text-primary` | `#FAFAFA` | Titoli, body principale |
| `--text-muted` | `#A1A1AA` | Descrizioni, sottotitoli |
| `--text-subtle` | `#71717A` | Label, placeholder, metadata |
| `--text-disabled` | `#3F3F46` | Elementi disabilitati |

### Accent — Tiffany Teal
| Token | Valore | Uso |
|-------|--------|-----|
| `--accent` | `#33C4C0` | CTA primario, link attivo, indicatori |
| `--accent-hover` | `#2ABFBB` | Hover state dell'accent |
| `--accent-subtle` | `rgba(51, 196, 192, 0.12)` | Background di badge/tag accent |
| `--accent-border` | `rgba(51, 196, 192, 0.30)` | Bordo di elementi accent |

**Regola**: l'accent si usa _raramente_ — massimo 2-3 punti per pagina (CTA principale, stato attivo, un highlight). Non decorare con l'accent.

### Bordi
| Token | Valore | Uso |
|-------|--------|-----|
| `--border` | `rgba(255, 255, 255, 0.08)` | Bordi default di card/panel |
| `--border-strong` | `rgba(255, 255, 255, 0.15)` | Bordi su hover o focus |
| `--border-accent` | `rgba(51, 196, 192, 0.30)` | Bordi su elementi selezionati |

---

## Liquid Glass — Ricetta

```css
/* Card standard */
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
}

/* Card elevated (modal, sheet) */
.glass-elevated {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
}

/* Navbar floating */
.glass-nav {
  background: rgba(9, 9, 11, 0.80);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
```

---

## Tipografia

**Font**: Geist (preferito) → Inter (fallback)

```css
/* Next.js con Geist */
import { GeistSans } from 'geist/font/sans';

/* Google Fonts fallback */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
```

| Elemento | Size | Weight | Letter-spacing | Line-height |
|----------|------|--------|----------------|-------------|
| Hero (H1) | 56-72px | 700 | -0.03em | 1.1 |
| Heading (H2) | 36-48px | 600 | -0.02em | 1.2 |
| Subheading (H3) | 24-32px | 600 | -0.01em | 1.3 |
| Body | 16px | 400 | 0 | 1.6 |
| Small / Label | 14px | 400-500 | 0.01em | 1.5 |
| Micro | 12px | 500 | 0.02em | 1.4 |

**Regole**:
- Tracking negativo (`-0.02em` / `-0.03em`) sui titoli grandi — li rende più premium
- Mai font-weight sotto 300 su dark background (illeggibile)
- Mai tutti maiuscoli su testo lungo

---

## Animazioni

### Curve di easing
```css
/* Spring — per elementi interattivi (button, card hover) */
--spring: cubic-bezier(0.34, 1.56, 0.64, 1);

/* Smooth — per layout, reveal, slide */
--smooth: cubic-bezier(0.16, 1, 0.3, 1);

/* Exit — per elementi che escono */
--exit: cubic-bezier(0.4, 0, 1, 1);
```

### Durate
| Tipo | Durata | Uso |
|------|--------|-----|
| Micro | 150ms | Hover colore, opacity, border |
| Standard | 250ms | Button press, icon change |
| Layout | 300-400ms | Card expand, accordion, drawer |
| Page | 400-500ms | Transizioni tra pagine |
| **MAI** | >600ms | Qualsiasi cosa — diventa lenta |

### Scroll Reveal
```js
// Regola: translateY 20px max, opacity 0→1, 400ms smooth
const observer = new IntersectionObserver((entries) => {
  entries.forEach(el => {
    if (el.isIntersecting) {
      el.target.style.opacity = '1';
      el.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

// CSS di partenza
.reveal { opacity: 0; transform: translateY(20px); transition: all 400ms cubic-bezier(0.16,1,0.3,1); }
```

### Hover Magnetico (CTAs)
```js
// Solo su CTA primario e hero elements — max 8-12px di offset
el.addEventListener('mousemove', (e) => {
  const rect = el.getBoundingClientRect();
  const x = (e.clientX - rect.left - rect.width / 2) * 0.15;
  const y = (e.clientY - rect.top - rect.height / 2) * 0.15;
  el.style.transform = `translate(${x}px, ${y}px)`;
});
el.addEventListener('mouseleave', () => {
  el.style.transform = 'translate(0, 0)';
});
```

### Page Transitions (Next.js)
```jsx
// View Transitions API (preferito)
document.startViewTransition(() => router.push(href));

// CSS
::view-transition-old(root) { animation: 150ms ease-out fade-out; }
::view-transition-new(root) { animation: 300ms cubic-bezier(0.16,1,0.3,1) fade-in; }
```

---

## Cosa NON fare (Anti-pattern personali)

| Vietato | Alternativa |
|---------|-------------|
| Gradiente sul testo (`bg-clip-text`) | Testo solido `#FAFAFA` o accent `#33C4C0` |
| Ombre dure (`box-shadow: 0 0 20px color`) | Borders sottili rgba o nessuna ombra |
| Animazioni su loop continui nei componenti | Solo su hero background se necessario |
| `ease-in-out` su elementi interattivi | Spring `cubic-bezier(0.34,1.56,0.64,1)` |
| Background completamente opaco sulle card | Glass `rgba(255,255,255,0.05)` + blur |
| Emojis come icone UI | SVG icons da Lucide o Heroicons |
| Accent su più di 3 elementi per pagina | Usare `--text-muted` per gli altri |
| `border-radius` sotto 8px su card | Minimo 12px, standard 16px |
| Testo bianco su sfondo bianco/chiaro | Dark-only, nessun light mode |

---

## Stack di riferimento

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **Componenti**: shadcn/ui (tema dark personalizzato)
- **Animazioni**: Framer Motion
- **Font**: Geist (npm) → Inter (Google Fonts fallback)
- **Icone**: Lucide React
- **Grafici**: Recharts o Tremor (tema dark)

---

## Come usare questo file

Quando l'AI lavora su UI per questo progetto, deve:

1. **Leggere prima questo file** come fonte primaria
2. Applicare sempre `--bg-primary: #09090B` come base
3. Usare il glass recipe per ogni card/panel
4. Applicare spring physics su tutti gli elementi interattivi
5. Limitare l'accent `#33C4C0` a max 2-3 punti per view
6. Seguire le durate di animazione indicate
7. Verificare il pre-delivery checklist del SKILL.md

