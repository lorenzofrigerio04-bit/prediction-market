# Mappatura Completa Campi Prisma: Schema vs Codice

## Obiettivo
Documentare la mappatura completa tra i campi definiti nello schema Prisma e i campi utilizzati nel codice, identificando eventuali discrepanze che causano errori di build TypeScript.

---

## 1. Model Notification

### Campi DEFINITI nello Schema Prisma
```prisma
model Notification {
  id        String   @id @default(cuid())
  userId    String
  type      String   // EVENT_CLOSING_SOON | EVENT_RESOLVED | RANK_UP | STREAK_RISK
  data      String?  // Dati aggiuntivi in formato JSON
  readAt    DateTime?
  createdAt DateTime @default(now())
}
```

**Campi esistenti nello schema:**
- ✅ `id` (String, PK)
- ✅ `userId` (String, FK → User.id)
- ✅ `type` (String)
- ✅ `data` (String?, JSON)
- ✅ `readAt` (DateTime?)
- ✅ `createdAt` (DateTime)

### Campi USATI nel Codice ma NON ESISTENTI nello Schema

#### ❌ `title` (String)
- **Stato**: NON ESISTE nello schema
- **Uso previsto**: Titolo della notifica
- **Soluzione**: Rimuovere assegnazioni o spostare in campo `data` (JSON)
- **File da verificare**: Tutti i file che creano/aggiornano Notification

#### ❌ `message` (String)
- **Stato**: NON ESISTE nello schema
- **Uso previsto**: Messaggio della notifica
- **Soluzione**: Rimuovere assegnazioni o spostare in campo `data` (JSON)
- **File da verificare**: Tutti i file che creano/aggiornano Notification

#### ❌ `referenceId` (String?)
- **Stato**: NON ESISTE nello schema
- **Uso previsto**: ID di riferimento (es: eventId, predictionId)
- **Soluzione**: Usare campo `data` (JSON) invece, es: `data: JSON.stringify({ eventId: "..." })`
- **File da verificare**: Tutti i file che creano Notification con riferimento a entità

#### ❌ `applyBoost` (Boolean?)
- **Stato**: NON ESISTE nello schema
- **Uso previsto**: Flag per applicare boost
- **Soluzione**: Rimuovere assegnazioni o spostare in campo `data` (JSON)
- **File da verificare**: Tutti i file che creano Notification

### Mappatura Campi Notification

| Campo nel Codice | Esiste nello Schema? | Campo Equivalente nello Schema | Azione Richiesta |
|------------------|---------------------|-------------------------------|------------------|
| `id` | ✅ Sì | `id` | Nessuna |
| `userId` | ✅ Sì | `userId` | Nessuna |
| `type` | ✅ Sì | `type` | Nessuna |
| `data` | ✅ Sì | `data` | Nessuna |
| `readAt` | ✅ Sì | `readAt` | Nessuna |
| `createdAt` | ✅ Sì | `createdAt` | Nessuna |
| `title` | ❌ No | - | **RIMUOVERE** o spostare in `data` |
| `message` | ❌ No | - | **RIMUOVERE** o spostare in `data` |
| `referenceId` | ❌ No | Usare `data` (JSON) | **SOSTITUIRE** con `data` |
| `applyBoost` | ❌ No | - | **RIMUOVERE** o spostare in `data` |

---

## 2. Model User

### Campi DEFINITI nello Schema Prisma
```prisma
model User {
  id            String    @id @default(cuid())
  email         String?   @unique
  name          String?
  emailVerified DateTime?
  image         String?
  streakCount   Int       @default(0)
  credits       Int       @default(100)
  totalEarned   Int       @default(0)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

**Campi esistenti nello schema:**
- ✅ `id` (String, PK)
- ✅ `email` (String?, unique)
- ✅ `name` (String?)
- ✅ `emailVerified` (DateTime?)
- ✅ `image` (String?)
- ✅ `streakCount` (Int, default: 0)
- ✅ `credits` (Int, default: 100)
- ✅ `totalEarned` (Int, default: 0)
- ✅ `createdAt` (DateTime)
- ✅ `updatedAt` (DateTime)

### Campi USATI nel Codice ma NON ESISTENTI nello Schema

#### ❌ `password` (String)
- **Stato**: NON ESISTE nello schema
- **Uso previsto**: Password hash per autenticazione
- **Soluzione**: Rimuovere assegnazioni/letture (probabilmente usando NextAuth che gestisce password separatamente)
- **File da verificare**: File di autenticazione, signup, login

#### ❌ `role` (String o Enum?)
- **Stato**: NON ESISTE nello schema
- **Uso previsto**: Ruolo utente (es: ADMIN, USER)
- **Soluzione**: 
  - **Opzione A**: Rimuovere se non necessario
  - **Opzione B**: Aggiungere campo allo schema se necessario per admin (es: `role String @default("USER")`)
- **File da verificare**: File admin, middleware di autorizzazione
- **Nota**: Il piano menziona protezione route `/admin` con `role ADMIN` (THINGS_TO_DO.md linea 106)

### Mappatura Campi User

| Campo nel Codice | Esiste nello Schema? | Campo Equivalente nello Schema | Azione Richiesta |
|------------------|---------------------|-------------------------------|------------------|
| `id` | ✅ Sì | `id` | Nessuna |
| `email` | ✅ Sì | `email` | Nessuna |
| `name` | ✅ Sì | `name` | Nessuna |
| `emailVerified` | ✅ Sì | `emailVerified` | Nessuna |
| `image` | ✅ Sì | `image` | Nessuna |
| `streakCount` | ✅ Sì | `streakCount` | Nessuna |
| `credits` | ✅ Sì | `credits` | Nessuna |
| `totalEarned` | ✅ Sì | `totalEarned` | Nessuna |
| `createdAt` | ✅ Sì | `createdAt` | Nessuna |
| `updatedAt` | ✅ Sì | `updatedAt` | Nessuna |
| `password` | ❌ No | - | **RIMUOVERE** (NextAuth gestisce password) |
| `role` | ❌ No | - | **RIMUOVERE** o **AGGIUNGERE** allo schema se necessario |

---

## 3. Model Transaction

### Campi DEFINITI nello Schema Prisma
```prisma
model Transaction {
  id          String   @id @default(cuid())
  userId      String
  type        String   // PREDICTION_WIN, PREDICTION_LOSS, DAILY_BONUS, MISSION_REWARD, etc.
  amount      Int      // Importo in crediti (positivo per guadagni, negativo per perdite)
  referenceId String?  // ID di riferimento (es: predictionId, eventId, missionId)
  createdAt   DateTime @default(now())
}
```

**Campi esistenti nello schema:**
- ✅ `id` (String, PK)
- ✅ `userId` (String, FK → User.id)
- ✅ `type` (String)
- ✅ `amount` (Int)
- ✅ `referenceId` (String?)
- ✅ `createdAt` (DateTime)

### Campi USATI nel Codice ma NON ESISTENTI nello Schema

#### ❌ `description` (String?)
- **Stato**: NON ESISTE nello schema
- **Uso previsto**: Descrizione testuale della transazione
- **Soluzione**: Rimuovere assegnazioni (il tipo di transazione è già indicato da `type`)
- **File da verificare**: Tutti i file che creano Transaction

#### ❌ `referenceType` (String?)
- **Stato**: NON ESISTE nello schema
- **Uso previsto**: Tipo di riferimento (es: "prediction", "event", "mission")
- **Soluzione**: 
  - **Opzione A**: Rimuovere se non necessario
  - **Opzione B**: Usare campo `type` per dedurre il tipo di riferimento
  - **Opzione C**: Aggiungere campo allo schema se necessario
- **File da verificare**: Tutti i file che creano Transaction con `referenceType`

### Mappatura Campi Transaction

| Campo nel Codice | Esiste nello Schema? | Campo Equivalente nello Schema | Azione Richiesta |
|------------------|---------------------|-------------------------------|------------------|
| `id` | ✅ Sì | `id` | Nessuna |
| `userId` | ✅ Sì | `userId` | Nessuna |
| `type` | ✅ Sì | `type` | Nessuna |
| `amount` | ✅ Sì | `amount` | Nessuna |
| `referenceId` | ✅ Sì | `referenceId` | Nessuna |
| `createdAt` | ✅ Sì | `createdAt` | Nessuna |
| `description` | ❌ No | - | **RIMUOVERE** (usare `type` per descrizione) |
| `referenceType` | ❌ No | Usare `type` o rimuovere | **RIMUOVERE** o dedurre da `type` |

---

## 4. Altri Modelli (Verifica Rapida)

### Model Event
**Campi nello schema**: `id`, `title`, `description`, `category`, `closesAt`, `resolutionSourceUrl`, `resolutionNotes`, `createdById`, `resolutionStatus`, `b`, `resolutionBufferHours`, `resolved`, `resolvedAt`, `outcome`, `resolutionDisputedAt`, `resolutionDisputedBy`, `createdAt`, `updatedAt`

**Nessun campo problematico identificato nel piano.**

### Model Comment
**Campi nello schema**: `id`, `eventId`, `userId`, `parentId`, `content`, `hidden`, `createdAt`, `updatedAt`

**Nessun campo problematico identificato nel piano.**

### Model Reaction
**Campi nello schema**: `id`, `commentId`, `userId`, `type`, `createdAt`

**Nessun campo problematico identificato nel piano.**

### Model Prediction
**Campi nello schema**: `id`, `eventId`, `userId`, `outcome`, `amount`, `credits`, `won`, `payout`, `resolved`, `createdAt`, `updatedAt`

**Nessun campo problematico identificato nel piano.**

### Model AuditLog
**Campi nello schema**: `id`, `userId`, `action`, `entityType`, `entityId`, `payload`, `createdAt`

**Nessun campo problematico identificato nel piano.**

---

## 5. Riepilogo Campi da Correggere

### Priorità ALTA (Bloccanti per Build)

1. **Notification.title** - Rimuovere o spostare in `data`
2. **Notification.message** - Rimuovere o spostare in `data`
3. **Notification.referenceId** - Sostituire con `data` (JSON)
4. **Notification.applyBoost** - Rimuovere o spostare in `data`

### Priorità MEDIA

1. **User.password** - Rimuovere (gestito da NextAuth)
2. **User.role** - Rimuovere o aggiungere allo schema se necessario per admin
3. **Transaction.description** - Rimuovere
4. **Transaction.referenceType** - Rimuovere o dedurre da `type`

---

## 6. Comandi Utili per Verifica

```bash
# Trovare tutti i file che usano Notification.title
grep -r "\.title" app --include="*.ts" --include="*.tsx" | grep -i notification

# Trovare tutti i file che usano Notification.message
grep -r "\.message" app --include="*.ts" --include="*.tsx" | grep -i notification

# Trovare tutti i file che usano Notification.referenceId
grep -r "referenceId" app --include="*.ts" --include="*.tsx" | grep -i notification

# Trovare tutti i file che usano User.password
grep -r "\.password" app --include="*.ts" --include="*.tsx" | grep -i user

# Trovare tutti i file che usano User.role
grep -r "\.role" app --include="*.ts" --include="*.tsx" | grep -i user

# Trovare tutti i file che usano Transaction.description
grep -r "\.description" app --include="*.ts" --include="*.tsx" | grep -i transaction

# Trovare tutti i file che usano Transaction.referenceType
grep -r "referenceType" app --include="*.ts" --include="*.tsx" | grep -i transaction

# Trovare tutti i file che creano Notification
grep -r "prisma\.notification\.create" app --include="*.ts" --include="*.tsx"

# Trovare tutti i file che creano Transaction
grep -r "prisma\.transaction\.create" app --include="*.ts" --include="*.tsx"
```

---

## 7. Note Importanti

1. **Campo `data` in Notification**: È un campo JSON (`String?`) che può contenere dati strutturati. Usare questo campo per memorizzare `title`, `message`, `referenceId`, ecc. invece di creare campi separati.

2. **Campo `type` in Transaction**: Contiene già informazioni sul tipo di transazione (es: `PREDICTION_WIN`, `DAILY_BONUS`). Il campo `referenceType` potrebbe essere dedotto da `type` o rimosso.

3. **User.role**: Se necessario per funzionalità admin, considerare di aggiungere allo schema:
   ```prisma
   role String @default("USER") // USER, ADMIN
   ```

4. **User.password**: NextAuth gestisce le password separatamente, quindi questo campo non dovrebbe esistere nel modello User.

---

## 8. Prossimi Passi

1. ✅ **Completato**: Creazione mappatura completa campi
2. ⏭️ **Prossimo**: Eseguire ricerca sistematica nei file del codice per identificare tutti i punti dove questi campi vengono usati
3. ⏭️ **Prossimo**: Correggere ogni occorrenza rimuovendo o sostituendo i campi non esistenti
4. ⏭️ **Prossimo**: Verificare build TypeScript dopo ogni correzione

---

**Data creazione**: 2026-02-17  
**Ultima modifica**: 2026-02-17
