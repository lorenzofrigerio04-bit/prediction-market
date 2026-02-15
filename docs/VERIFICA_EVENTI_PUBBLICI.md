# Verifica eventi sul sito pubblico

## Risultati verifiche (15 feb 2026)

### 1. Database (locale)
- **Script:** `npx tsx scripts/check-events-list.ts`
- **Risultato:** 15 eventi aperti nel DB. I 5 creati dalla pipeline (Juventus, Dune 3, governo, Bitcoin, Parlamento UE) sono i più recenti (in cima alla lista).
- **Conclusione:** Il DB usato in locale contiene i nuovi eventi.

### 2. API eventi (localhost)
- **Chiamata:** `GET /api/events?sort=recent&status=open&limit=5`
- **Risultato:** L’API restituisce i 5 eventi più recenti con i titoli corretti (Juventus, Dune 3, governo italiano, Bitcoin, Parlamento UE).
- **Conclusione:** L’API in locale risponde correttamente e con ordinamento “recent”.

### 3. Front-end (Home, Discover, Landing)
- **Home (utente loggato):** fetch con `sort=recent`, `limit=4`.
- **Discover:** default `sort=recent`, `limit=12`.
- **Landing (non loggato):** fetch con `sort=recent`, `limit=5`.
- **Conclusione:** Il codice usa già l’ordinamento “recent” e non “popular”.

---

## Perché potresti non vedere nulla

Se stai guardando il **sito deployato** (es. `https://xxx.vercel.app`):

- Quell’app usa il **database di produzione** (variabili d’ambiente su Vercel).
- I 5 eventi sono stati creati solo nel **database locale** (quando hai lanciato `run-cron-generate-events.ts` in locale).
- Quindi sul sito pubblico deployato è normale non vederli, finché non crei eventi anche nel DB di produzione.

**Cosa fare:**

1. **Vedere i nuovi eventi in locale**  
   Avvia l’app in locale e apri **http://localhost:3000** (loggato o non loggato). Dovresti vedere i 5 eventi in Home / Landing / Discover.

2. **Vedere eventi sul sito deployato**  
   I eventi devono esistere nel DB di produzione. Puoi:
   - far girare il cron di generazione in produzione (es. dalla dashboard Vercel, Cron Jobs → trigger di `generate-events`), oppure
   - eseguire in locale lo script con il DB di produzione:
     - copia la `DATABASE_URL` di produzione da Vercel in un file `.env.production.local`,
     - poi:  
       `dotenv -e .env.production.local -- npx tsx scripts/run-cron-generate-events.ts 5`  
       (richiede `dotenv-cli`: `npm i -D dotenv-cli`).

---

## Verifiche rapide che puoi rifare

```bash
# Eventi nel DB (stesso DB usato da Next in locale)
npx tsx scripts/check-events-list.ts
```

Con il server avviato (`npm run dev`), apri in un’altra tab:
- **Landing:** http://localhost:3000 (senza login) → sezione “Eventi in corso”
- **API diretta:** http://localhost:3000/api/events?sort=recent&status=open&limit=5 → vedi il JSON con gli eventi
