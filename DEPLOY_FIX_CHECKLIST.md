# Checklist per Risolvere Errori di Deploy Vercel

## Problema Principale
Il build fallisce con errori TypeScript legati a modelli Prisma mancanti o campi non esistenti. La risoluzione sta andando in loop perché si correggono errori uno alla volta senza un approccio sistematico.

## Errori Identificati

### 1. Modelli Prisma Mancanti nello Schema
- ❌ `verificationToken` (usato da NextAuth ma non nello schema)
- ❌ `badge` / `userBadge` (usati nel codice ma non nello schema)
- ❌ `eventFollower` (usato nel codice ma non nello schema)
- ❌ `commentReaction` (dovrebbe essere `reaction`)

### 2. Campi Non Esistenti nei Modelli
- ❌ `Notification.title` (non esiste, solo `type` e `data`)
- ❌ `Notification.message` (non esiste)
- ❌ `Notification.referenceId` (non esiste)
- ❌ `Notification.applyBoost` (non esiste)
- ❌ `User.password` (non esiste nello schema)
- ❌ `User.role` (non esiste nello schema)
- ❌ `User.credits` (esiste ma potrebbe essere usato in modo errato)
- ❌ `Transaction.description` (non esiste)
- ❌ `Transaction.referenceType` (non esiste, solo `referenceId`)

### 3. Errori di Sintassi Introdotti dalle Correzioni
- ❌ Righe duplicate dopo rimozioni con `sed`
- ❌ Blocchi di codice incompleti dopo rimozioni parziali
- ❌ Variabili non dichiarate (`needsReview`, `autoResolved`)

## Checklist di Risoluzione Sistematica

### STEP 1: Analisi Completa degli Errori
```bash
# Eseguire build e salvare TUTTI gli errori in un file
npm run build 2>&1 | tee build-errors.log

# Contare quanti errori ci sono
grep -c "Type error" build-errors.log

# Estrarre tutti gli errori unici
grep "Type error" build-errors.log | sort | uniq > unique-errors.txt
```

### STEP 2: Verifica Schema Prisma Completo
```bash
# Leggere lo schema completo
cat prisma/schema.prisma

# Verificare che tutti i modelli referenziati nel codice esistano
grep -r "prisma\." app/api --include="*.ts" | grep -o "prisma\.[a-zA-Z]*" | sort | uniq > used-models.txt
grep "^model" prisma/schema.prisma | sed 's/model //' | sed 's/ {.*//' | sort > defined-models.txt
diff used-models.txt defined-models.txt
```

### STEP 3: Mappatura Modelli Prisma vs Codice
Creare una tabella di mappatura:
- `prisma.comment` → ✅ Esiste (`Comment`)
- `prisma.reaction` → ✅ Esiste (`Reaction`)
- `prisma.badge` → ❌ NON ESISTE
- `prisma.userBadge` → ❌ NON ESISTE
- `prisma.verificationToken` → ❌ NON ESISTE (NextAuth)
- `prisma.eventFollower` → ❌ NON ESISTE
- `prisma.commentReaction` → ❌ NON ESISTE (usare `reaction`)

### STEP 4: Correzione Sistematica (NON uno alla volta!)

#### 4a. Rimuovere/Risolvere Modelli Non Esistenti
Per ogni modello non esistente:
1. Trovare tutti i file che lo usano: `grep -r "prisma.badge" app/api`
2. **OPZIONE A**: Rimuovere completamente il codice che lo usa
3. **OPZIONE B**: Aggiungere il modello allo schema Prisma
4. **OPZIONE C**: Sostituire con modello esistente equivalente

#### 4b. Rimuovere Campi Non Esistenti
Per ogni campo non esistente:
1. Trovare tutti gli usi: `grep -r "title:" app/api --include="*.ts"`
2. Rimuovere SOLO le righe che assegnano quel campo
3. **NON** rimuovere righe intere con `sed` che possono rompere la sintassi
4. Usare strumenti più precisi (read_file + search_replace)

#### 4c. Correggere Errori di Sintassi
1. Verificare che ogni file modificato sia sintatticamente corretto
2. Non lasciare righe isolate o blocchi incompleti
3. Se si rimuove codice, assicurarsi che le parentesi/graffe siano bilanciate

### STEP 5: Rigenerare Prisma Client
```bash
# DOPO ogni modifica allo schema.prisma
npx prisma generate

# Verificare che il client sia stato rigenerato
ls -la node_modules/.prisma/client/
```

### STEP 6: Verifica Incrementale
```bash
# Dopo ogni correzione, verificare quanti errori rimangono
npm run build 2>&1 | grep -c "Type error"

# Se il numero aumenta invece di diminuire, FERMARSI e analizzare
```

## Approccio Corretto (NON Fare)

❌ **NON** correggere errori uno alla volta
❌ **NON** usare `sed` per rimuovere righe senza verificare il contesto
❌ **NON** rimuovere codice senza capire cosa fa
❌ **NON** continuare se gli errori aumentano invece di diminuire
❌ **NON** dimenticare di rigenerare Prisma client dopo modifiche allo schema

## Approccio Corretto (Fare)

✅ **FARE** analisi completa di tutti gli errori prima di iniziare
✅ **FARE** mappatura modelli Prisma vs codice
✅ **FARE** correzioni per categoria (tutti i modelli, poi tutti i campi)
✅ **FARE** verifiche incrementali dopo ogni categoria
✅ **FARE** usare `read_file` + `search_replace` invece di `sed` per modifiche precise
✅ **FARE** testare la sintassi dopo ogni modifica
✅ **FARE** rigenerare Prisma client dopo modifiche allo schema

## File da Correggere (Priorità)

### Alta Priorità (Bloccanti)
1. `app/api/admin/events/[id]/resolve/route.ts` - Usa modelli/campi non esistenti
2. `app/api/comments/[id]/reactions/route.ts` - Usa `commentReaction` invece di `reaction`
3. `app/api/badges/route.ts` - Usa `badge` che non esiste
4. `app/api/auth/send-verification-email/route.ts` - Usa `verificationToken` che non esiste

### Media Priorità
5. Tutti i file che creano `Notification` con campi non esistenti
6. File che usano `User.password` o `User.role`
7. File che usano `Transaction.description` o `Transaction.referenceType`

### Bassa Priorità (Errori di sintassi introdotti)
8. File con righe duplicate o blocchi incompleti dopo correzioni precedenti

## Comandi Utili

```bash
# Trovare tutti i file che usano un modello specifico
grep -r "prisma\.badge" app/api --include="*.ts" -l

# Trovare tutti i file che usano un campo specifico
grep -r "\.title" app/api --include="*.ts" -l

# Verificare sintassi TypeScript di un file
npx tsc --noEmit app/api/badges/route.ts

# Rigenerare Prisma client
npx prisma generate

# Verificare schema Prisma
npx prisma validate
```

## Note Finali

Il problema principale è che si sta correggendo in modo reattivo (un errore alla volta) invece che in modo proattivo (analisi completa → correzione sistematica → verifica).

**Raccomandazione**: Iniziare una nuova sessione con questa checklist, fare STEP 1-3 completamente, poi correggere per categoria invece che per errore singolo.
