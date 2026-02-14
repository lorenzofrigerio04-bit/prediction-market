# Come aggiornare il sito online (Vercel) con le ultime modifiche locali

**Perché online non vedi tema scuro e altre modifiche?**  
Le modifiche che fai sono **solo sul tuo computer**. La cartella del progetto **non è collegata a Git**, quindi Vercel non riceve mai gli aggiornamenti in automatico. Il sito pubblico resta alla versione dell’ultimo deploy (spesso vecchia).

Per vedere online tema scuro, impostazioni e tutto il resto devi fare un **nuovo deploy**.

---

## Opzione A: Deploy da terminale con Vercel CLI (più veloce)

1. **Apri il terminale** (Terminal.app o iTerm) nella cartella del progetto:
   ```bash
   cd /Users/lorenzofrigerio/Desktop/prediction-market
   ```

2. **Esegui il deploy di produzione:**
   ```bash
   npx vercel --prod
   ```
   - La prima volta ti chiederà login Vercel e di collegare il progetto.
   - `--prod` aggiorna l’URL di produzione (quello che usi per aprire il sito).

3. Quando il comando termina, vedrai l’URL di produzione. Apri quel link (o il tuo solito `https://prediction-market-xxx.vercel.app`) per vedere la nuova versione con tema scuro e tutte le modifiche.

**Se compare l’errore “unable to get local issuer certificate”:**  
Succede spesso con reti aziendali o proxy. Prova:
- Eseguire lo stesso comando da un’altra rete (es. hotspot del telefono) **oppure**
- Usare l’**Opzione B** qui sotto (GitHub + Vercel): fai push da un altro PC/rete e Vercel fa il deploy da solo.

---

## Opzione B: Collegare il progetto a GitHub e usare il push (consigliato a lungo termine)

Se colleghi il repo a Vercel, ogni **push** sul branch collegato (es. `main`) avvia un deploy automatico. Così non devi più lanciare a mano `vercel --prod`.

### Passi

1. Crea un repository su **GitHub** (es. `prediction-market`) e annota l’URL (es. `https://github.com/TUO_USER/prediction-market.git`).

2. **Nella cartella del progetto** inizializza Git e collega il remoto (se non l’hai già fatto):
   ```bash
   cd /Users/lorenzofrigerio/Desktop/prediction-market
   git init
   git remote add origin https://github.com/TUO_USER/prediction-market.git
   ```

3. Aggiungi tutto, committa e push:
   ```bash
   git add .
   git commit -m "UI aggiornata: tema scuro, impostazioni, ultime modifiche"
   git branch -M main
   git push -u origin main
   ```

4. Su **Vercel**: Dashboard → tuo progetto → **Settings** → **Git** → connetti il repository GitHub e scegli il branch `main`. I deploy successivi partiranno automaticamente a ogni push.

5. D’ora in poi: quando modifichi qualcosa in locale, fai:
   ```bash
   git add .
   git commit -m "Descrizione modifiche"
   git push origin main
   ```
   e in 1–2 minuti il sito pubblico si aggiorna.

---

## Verifica

- **In locale:** `npm run dev` → `http://localhost:3000` (tema scuro e impostazioni già presenti).
- **Online:** apri l’URL del progetto su Vercel **dopo** che il deploy è “Ready” in **Deployments**.

Se il deploy è andato a buon fine ma vedi ancora la vecchia interfaccia, prova:
- **Hard refresh:** `Ctrl+F5` (Windows) o `Cmd+Shift+R` (Mac)
- **Finestra in incognito** per evitare cache del browser
