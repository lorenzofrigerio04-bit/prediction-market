# Variabili d'Ambiente - Source Mesh Deterministico (Blocco 2)

Questa documentazione descrive le variabili d'ambiente necessarie per il sistema di ingestion deterministico che raccoglie dati da fonti multiple senza utilizzare AI o embeddings.

## Variabili Richieste

### `NEWSAPI_API_KEY`

**Tipo:** Stringa  
**Obbligatoria:** Sì (se si utilizza il fetcher NewsAPI.ai)  
**Descrizione:** API key per NewsAPI.ai utilizzata per il fetcher di notizie nel pipeline di ingestion.

**Come ottenerla:**
1. Registrati su [NewsAPI.ai](https://newsapi.ai/)
2. Crea un account e ottieni la tua API key dal dashboard
3. Aggiungi la chiave al file `.env.local` o alle variabili d'ambiente di Vercel

**Esempio:**
```bash
NEWSAPI_API_KEY="d67a8f14-6c19-40a9-88b3-a2dafee7638a"
```

**Note:**
- La chiave viene utilizzata dal fetcher `lib/ingestion/fetchers/newsapi.ts`
- Assicurati di non committare la chiave nel repository (è già nel `.gitignore`)

---

### `JACCARD_THRESHOLD`

**Tipo:** Numero decimale (Float)  
**Obbligatoria:** No (ha un valore predefinito)  
**Valore predefinito:** `0.5`  
**Range:** `0.0` - `1.0`  
**Descrizione:** Threshold per il clustering Jaccard similarity. Articoli con similarity superiore a questo valore vengono raggruppati nello stesso cluster.

**Come funziona:**
- Il clustering Jaccard calcola la similarità tra articoli usando la formula: `J(A,B) = |A ∩ B| / |A ∪ B|`
- Se la similarità tra due articoli è > `JACCARD_THRESHOLD`, vengono aggiunti allo stesso cluster
- Valori più bassi (es. 0.3) creano cluster più ampi (più articoli raggruppati)
- Valori più alti (es. 0.7) creano cluster più stretti (solo articoli molto simili)

**Esempio:**
```bash
JACCARD_THRESHOLD=0.5
```

**Note:**
- Il valore viene letto dal file `lib/ingestion/processing/jaccard.ts`
- Puoi sperimentare con valori diversi per ottimizzare il clustering in base alle tue esigenze

---

### `CRON_SECRET`

**Tipo:** Stringa  
**Obbligatoria:** Sì  
**Descrizione:** Secret utilizzato per autenticare le richieste da Vercel Cron all'endpoint `/api/cron/ingest`. Protegge l'endpoint da chiamate non autorizzate.

**Come generarla:**
```bash
# Usa openssl per generare un secret sicuro
openssl rand -base64 32
```

**Esempio:**
```bash
CRON_SECRET="S0KHhewruv7x3/p95N1arfXLGXR5YhqaONV1VVDAEy4="
```

**Note:**
- Il secret viene verificato nell'endpoint `app/api/cron/ingest/route.ts`
- Vercel Cron invia questo secret nell'header della richiesta
- Assicurati di configurare lo stesso valore sia nelle variabili d'ambiente di Vercel che nel file `.env.local` per test locali
- **NON committare** questo valore nel repository

---

### `INGESTION_ENABLED`

**Tipo:** Booleano (Stringa: "true" o "false")  
**Obbligatoria:** No (ha un valore predefinito)  
**Valore predefinito:** `true`  
**Descrizione:** Abilita o disabilita il pipeline di ingestion. Utile per disabilitare temporaneamente l'ingestion durante manutenzioni o test.

**Valori possibili:**
- `true` - Il pipeline di ingestion è attivo
- `false` - Il pipeline di ingestion è disabilitato

**Esempio:**
```bash
INGESTION_ENABLED=true
```

**Note:**
- Quando disabilitato, il cron job `/api/cron/ingest` restituirà immediatamente senza eseguire il pipeline
- Utile per debugging o per evitare ingestion durante test

---

## Configurazione Vercel

Per configurare queste variabili in Vercel:

1. Vai al tuo progetto su [Vercel Dashboard](https://vercel.com/dashboard)
2. Naviga su **Settings** → **Environment Variables**
3. Aggiungi tutte le variabili elencate sopra
4. Assicurati di selezionare gli ambienti corretti (Production, Preview, Development)

**Variabili da configurare:**
- `NEWSAPI_API_KEY`
- `JACCARD_THRESHOLD` (opzionale, usa default se non specificato)
- `CRON_SECRET`
- `INGESTION_ENABLED` (opzionale, usa default se non specificato)

## Configurazione Locale

Per sviluppo locale, crea un file `.env.local` nella root del progetto:

```bash
# Copia il template
cp .env.example .env.local

# Modifica i valori con le tue chiavi
```

**Nota:** Il file `.env.local` è già nel `.gitignore` e non verrà committato nel repository.

## Verifica Configurazione

Per verificare che le variabili siano configurate correttamente:

1. **Locale:** Controlla che il file `.env.local` esista e contenga tutte le variabili richieste
2. **Vercel:** Verifica nel dashboard che tutte le variabili siano presenti
3. **Test:** Esegui manualmente il cron job e controlla i log per eventuali errori di configurazione

## Troubleshooting

### Errore: "NEWSAPI_API_KEY is not defined"
- Verifica che la variabile sia presente nel file `.env.local` o nelle variabili d'ambiente di Vercel
- Riavvia il server di sviluppo dopo aver aggiunto la variabile

### Errore: "Invalid CRON_SECRET"
- Verifica che il valore di `CRON_SECRET` corrisponda tra Vercel e il codice
- Assicurati che il secret sia stato generato correttamente

### Clustering non funziona come previsto
- Prova ad aggiustare `JACCARD_THRESHOLD` con valori diversi
- Controlla i log di ingestion per vedere i valori di similarity calcolati

## Riferimenti

- [Piano di Implementazione - Blocco 2](../.cursor/plans/blocco_2_-_source_mesh_deterministico_234dd273.plan.md)
- [NewsAPI.ai Documentation](https://newsapi.ai/documentation)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
