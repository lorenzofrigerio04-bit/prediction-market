/**
 * 100 definizioni evento per il seed del feed eventi.
 * Temi attuali (marzo 2025), distribuiti in 7 categorie.
 * Ogni evento ha title, description, category; resolutionSourceUrl e resolutionNotes sono impostati nello script.
 */

import type { AllowedCategory } from "../../lib/event-utils";

export interface EventoDefSeed {
  title: string;
  description: string;
  category: AllowedCategory;
}

export const EVENTI_ATTUALI_100: EventoDefSeed[] = [
  // --- Sport (15) ---
  {
    title: "L'Italia vincerà il Sei Nazioni?",
    description: "La nazionale italiana di rugby vincerà il prossimo torneo Sei Nazioni. Esito verificabile a fine torneo entro 12 mesi.",
    category: "Sport",
  },
  {
    title: "Il Napoli si qualificherà in Champions League?",
    description: "Il Napoli terminerà la Serie A nei primi quattro posti accedendo alla Champions League. Esito a fine campionato entro 8 mesi.",
    category: "Sport",
  },
  {
    title: "Un italiano vincerà una tappa del Giro d'Italia?",
    description: "Almeno un ciclista italiano vincerà una tappa del prossimo Giro d'Italia. Verificabile a fine Giro entro 6 mesi.",
    category: "Sport",
  },
  {
    title: "La Ferrari vincerà almeno un Gran Premio in F1?",
    description: "La scuderia Ferrari vincerà almeno una gara del prossimo campionato mondiale F1. Esito a fine stagione entro 12 mesi.",
    category: "Sport",
  },
  {
    title: "L'Inter vincerà lo scudetto ?",
    description: "L'Inter vincerà il campionato di Serie A in corso. Esito verificabile a fine campionato entro 6 mesi.",
    category: "Sport",
  },
  {
    title: "L'Italia si qualificherà al Mondiale?",
    description: "La nazionale italiana di calcio si qualificherà alla prossima Coppa del Mondo. Esito dopo le qualificazioni UEFA entro 24 mesi.",
    category: "Sport",
  },
  {
    title: "Jannik Sinner vincerà Wimbledon?",
    description: "Jannik Sinner vincerà il prossimo torneo di Wimbledon nel singolare maschile. Esito entro 6 mesi.",
    category: "Sport",
  },
  {
    title: "La Lazio arriverà in zona Europa League ?",
    description: "La Lazio terminerà la Serie A in corso in posizione utile per Europa League o Conference League. Esito a fine campionato entro 6 mesi.",
    category: "Sport",
  },
  {
    title: "Il Milan vincerà la Coppa Italia ?",
    description: "Il Milan vincerà la Coppa Italia nella stagione in corso. Esito verificabile a fine manifestazione entro 6 mesi.",
    category: "Sport",
  },
  {
    title: "L'Italia vincerà la Coppa Davis?",
    description: "La nazionale italiana di tennis vincerà la prossima Coppa Davis. Esito a fine competizione entro 12 mesi.",
    category: "Sport",
  },
  {
    title: "Una squadra italiana vincerà la Conference League ?",
    description: "Una squadra di club italiana vincerà la prossima UEFA Conference League. Esito a fine stagione entro 8 mesi.",
    category: "Sport",
  },
  {
    title: "Vincenzo Nibali vincerà una classica delle Ardenne nei prossimi 12 mesi?",
    description: "Vincenzo Nibali vincerà almeno una delle classiche delle Ardenne (Liegi, Amstel, Freccia Vallone) entro 6 mesi. Esito a fine primavera.",
    category: "Sport",
  },
  {
    title: "La Juventus arriverà in top 4 in Serie A ?",
    description: "La Juventus terminerà il campionato Serie A in corso nei primi quattro posti. Esito a fine campionato entro 6 mesi.",
    category: "Sport",
  },
  {
    title: "L'Italia vincerà medaglie d'oro alle Olimpiadi invernali?",
    description: "L'Italia vincerà almeno una medaglia d'oro ai prossimi Giochi Olimpici Invernali Milano-Cortina. Esito a fine Olimpiadi entro 24 mesi.",
    category: "Sport",
  },
  {
    title: "Il Bologna si qualificherà in Champions?",
    description: "Il Bologna terminerà la Serie A in corso nei primi quattro posti accedendo alla Champions League. Esito a fine campionato entro 6 mesi.",
    category: "Sport",
  },
  // --- Politica (14) ---
  {
    title: "Ci sarà un governo di coalizione in Germania entro 6 mesi?",
    description: "Un nuovo governo di coalizione sarà formato in Germania entro 6 mesi. Esito verificabile da fonti ufficiali.",
    category: "Politica",
  },
  {
    title: "Il Parlamento UE approverà la legge sull'IA?",
    description: "Il regolamento europeo sull'intelligenza artificiale sarà approvato in via definitiva dal Parlamento UE entro 12 mesi. Fonte: sito UE.",
    category: "Politica",
  },
  {
    title: "L'Italia ratificherà la riforma del Mes?",
    description: "Il Parlamento italiano ratificherà la riforma del Meccanismo Europeo di Stabilità (Mes) entro 12 mesi. Fonte: Gazzetta Ufficiale.",
    category: "Politica",
  },
  {
    title: "Ci sarà un cambio di premier in Italia entro 12 mesi?",
    description: "Il Presidente del Consiglio in carica lascerà l'incarico (dimissioni o voto di sfiducia) entro 12 mesi dalla data di chiusura. Fonte: Quirinale o governo.",
    category: "Politica",
  },
  {
    title: "La Francia avrà un governo di unità nazionale?",
    description: "In Francia sarà formato un governo di unità nazionale o di larga intesa entro 9 mesi. Fonte: Presidenza francese.",
    category: "Politica",
  },
  {
    title: "Il Regno Unito entrerà in recessione nei prossimi 12 mesi?",
    description: "L'ufficio statistico nazionale del Regno Unito dichiarerà almeno due trimestri consecutivi di crescita negativa nei prossimi 12 mesi. Fonte: ONS.",
    category: "Politica",
  },
  {
    title: "L'ONU approverà una risoluzione vincolante sul clima entro 12 mesi?",
    description: "Il Consiglio di sicurezza o l'Assemblea generale ONU approverà una risoluzione vincolante su obiettivi climatici entro 12 mesi. Fonte: ONU.",
    category: "Politica",
  },
  {
    title: "La NATO accoglierà un nuovo membro europeo?",
    description: "Un nuovo paese europeo diventerà membro della NATO entro 24 mesi. Fonte: sito NATO.",
    category: "Politica",
  },
  {
    title: "Il Senato USA passerà una legge federale sulla cannabis nei prossimi 12 mesi?",
    description: "Il Senato degli Stati Uniti approverà una legge che depenalizza o legalizza la cannabis a livello federale nei prossimi 12 mesi. Fonte: Congress.gov.",
    category: "Politica",
  },
  {
    title: "L'Ue sbloccherà i fondi per l'Ungheria?",
    description: "La Commissione europea sbloccherà almeno una tranche significativa di fondi sospesi all'Ungheria entro 3 mesi. Fonte: Commissione UE.",
    category: "Politica",
  },
  {
    title: "Ci sarà un accordo di pace formale tra Israele e Hamas entro 12 mesi?",
    description: "Sarà siglato un accordo di pace o cessate il fuoco di lungo periodo tra Israele e Hamas entro 12 mesi. Fonte: ONU o parti in causa.",
    category: "Politica",
  },
  {
    title: "La Cina interverrà militarmente a Taiwan?",
    description: "Le forze armate cinesi condurranno un'invasione o un blocco militare significativo di Taiwan entro 24 mesi. Fonte: agenzie internazionali.",
    category: "Politica",
  },
  {
    title: "Il Parlamento italiano approverà la riforma del presidenzialismo?",
    description: "Una riforma costituzionale che introduce elementi di presidenzialismo sarà approvata in Parlamento entro 12 mesi. Fonte: Gazzetta Ufficiale.",
    category: "Politica",
  },
  {
    title: "L'India supererà la Cina come paese più popoloso al mondo?",
    description: "Le stime ufficiali ONU o dei censimenti nazionali indicheranno l'India come paese più popoloso al mondo entro 12 mesi. Fonte: UN Population Division.",
    category: "Politica",
  },
  // --- Tecnologia (15) ---
  {
    title: "OpenAI lancerà GPT-5?",
    description: "OpenAI renderà disponibile commercialmente un modello denominato GPT-5 o equivalente di nuova generazione entro 12 mesi. Fonte: sito OpenAI.",
    category: "Tecnologia",
  },
  {
    title: "Apple presenterà un visore AR con successo di vendita superiore a 1M unità nei prossimi 12 mesi?",
    description: "Apple venderà oltre un milione di unità del suo visore AR/VR (Vision Pro o successore) nei prossimi 12 mesi. Fonte: report Apple o analisti riconosciuti.",
    category: "Tecnologia",
  },
  {
    title: "Il prezzo del Bitcoin supererà i 150.000 dollari entro 12 mesi?",
    description: "Il prezzo di Bitcoin su almeno un exchange principale supererà i 150.000 USD entro 12 mesi. Fonte: CoinGecko o Bloomberg.",
    category: "Tecnologia",
  },
  {
    title: "Google raggiungerà il parity con ChatGPT su benchmark pubblici?",
    description: "Un modello Gemini di Google supererà o eguaglierà GPT-4 o equivalente su almeno tre benchmark pubblici (MMLU, HumanEval, GSM8K) entro 12 mesi. Fonte: paper o blog ufficiali.",
    category: "Tecnologia",
  },
  {
    title: "Tesla lancerà il Robotaxi in almeno una città?",
    description: "Tesla avvierà un servizio di robotaxi (auto a guida autonoma senza conducente) in almeno una città entro 24 mesi. Fonte: comunicati Tesla.",
    category: "Tecnologia",
  },
  {
    title: "Meta raggiungerà 3 miliardi di utenti mensili attivi entro 12 mesi?",
    description: "Il numero di utenti mensili attivi (MAU) dei prodotti Meta (Facebook, Instagram, WhatsApp) supererà i 3 miliardi entro 12 mesi. Fonte: report trimestrali Meta.",
    category: "Tecnologia",
  },
  {
    title: "Nvidia supererà Apple in capitalizzazione di mercato nei prossimi 12 mesi?",
    description: "La capitalizzazione di mercato di Nvidia supererà quella di Apple in almeno una seduta di borsa nei prossimi 12 mesi. Fonte: dati di mercato (Yahoo Finance, Bloomberg).",
    category: "Tecnologia",
  },
  {
    title: "Un modello open source supererà GPT-4 su LLM Leaderboard?",
    description: "Un modello open source (licenza permissive) supererà GPT-4 sul ranking Open LLM Leaderboard (o equivalente) entro 12 mesi. Fonte: Hugging Face.",
    category: "Tecnologia",
  },
  {
    title: "Amazon lancerà droni per consegna a domicilio in un'altra città UE?",
    description: "Amazon avvierà consegne con drone in almeno una città europea oltre quella già annunciata entro 24 mesi. Fonte: comunicati Amazon.",
    category: "Tecnologia",
  },
  {
    title: "Microsoft integrerà Copilot in tutte le edizioni di Windows 11?",
    description: "Microsoft renderà Copilot (o equivalente AI) disponibile di default in tutte le edizioni consumer di Windows 11 entro 12 mesi. Fonte: Microsoft.",
    category: "Tecnologia",
  },
  {
    title: "Il mercato delle criptovalute supererà i 4.000 miliardi di capitalizzazione nei prossimi 12 mesi?",
    description: "La capitalizzazione di mercato totale delle criptovalute supererà i 4.000 miliardi di dollari in almeno un giorno nei prossimi 12 mesi. Fonte: CoinGecko o CoinMarketCap.",
    category: "Tecnologia",
  },
  {
    title: "SpaceX effettuerà un volo con equipaggio su Marte?",
    description: "SpaceX lancerà una missione con equipaggio umano verso Marte (o orbita marziana) entro 60 mesi. Fonte: NASA o SpaceX.",
    category: "Tecnologia",
  },
  {
    title: "L'UE imporrà una multa superiore a 500M a un big tech nei prossimi 12 mesi?",
    description: "L'Unione europea (Commissione o autorità antitrust) imporrà una multa superiore a 500 milioni di euro a Google, Apple, Meta, Amazon o Microsoft nei prossimi 12 mesi. Fonte: Commissione UE.",
    category: "Tecnologia",
  },
  {
    title: "Il 5G coprirà oltre il 90% della popolazione italiana entro 12 mesi?",
    description: "Secondo i dati AGCOM o operatori, la copertura 5G supererà il 90% della popolazione italiana entro 12 mesi. Fonte: AGCOM.",
    category: "Tecnologia",
  },
  {
    title: "Anthropic lancerà Claude 4?",
    description: "Anthropic renderà disponibile un modello denominato Claude 4 o successore di Claude 3 entro 12 mesi. Fonte: sito Anthropic.",
    category: "Tecnologia",
  },
  // --- Economia (14) ---
  {
    title: "La Fed taglierà i tassi almeno due volte nei prossimi 12 mesi?",
    description: "La Federal Reserve statunitense ridurrà il tasso sui fed funds in almeno due riunioni nei prossimi 12 mesi. Fonte: Federal Reserve.",
    category: "Economia",
  },
  {
    title: "L'inflazione in zona euro scenderà sotto il 2% entro 6 mesi?",
    description: "L'inflazione armonizzata Eurozona (HICP) sarà inferiore al 2% su base annua in almeno un mese entro 6 mesi. Fonte: Eurostat.",
    category: "Economia",
  },
  {
    title: "Il PIL italiano crescerà oltre l'1% nei prossimi 12 mesi?",
    description: "Il PIL italiano in termini reali crescerà di oltre l'1% nei prossimi 12 mesi secondo le stime Istat. Fonte: Istat.",
    category: "Economia",
  },
  {
    title: "La Borsa di Milano (FTSE MIB) chiuderà in rialzo nei prossimi 12 mesi?",
    description: "L'indice FTSE MIB chiuderà il prossimo anno solare a un livello superiore alla chiusura dell'anno precedente. Fonte: Borsa Italiana. Esito entro 12 mesi.",
    category: "Economia",
  },
  {
    title: "Lo spread BTP-Bund supererà i 150 punti nei prossimi 12 mesi?",
    description: "Lo spread tra BTP decennale italiano e Bund tedesco supererà i 150 punti base in almeno una seduta nei prossimi 12 mesi. Fonte: Bloomberg o Reuters.",
    category: "Economia",
  },
  {
    title: "Il prezzo del petrolio WTI supererà i 100 dollari nei prossimi 12 mesi?",
    description: "Il prezzo del petrolio WTI supererà i 100 dollari al barile in almeno una seduta nei prossimi 12 mesi. Fonte: CME o Bloomberg.",
    category: "Economia",
  },
  {
    title: "L'oro supererà i 2.500 dollari l'oncia nei prossimi 12 mesi?",
    description: "Il prezzo dell'oro supererà i 2.500 dollari per oncia in almeno una seduta nei prossimi 12 mesi. Fonte: Bloomberg o LBMA.",
    category: "Economia",
  },
  {
    title: "Un grande istituto bancario europeo fallirà o sarà salvato con fondi pubblici nei prossimi 12 mesi?",
    description: "Una banca europea con attività superiore a 100 miliardi subirà fallimento, risoluzione o salvataggio con fondi pubblici nei prossimi 12 mesi. Fonte: autorità di vigilanza o governi.",
    category: "Economia",
  },
  {
    title: "La BCE taglierà i tassi almeno tre volte nei prossimi 12 mesi?",
    description: "La Banca centrale europea ridurrà il tasso sui depositi in almeno tre decisioni di politica monetaria nei prossimi 12 mesi. Fonte: BCE.",
    category: "Economia",
  },
  {
    title: "Il debito pubblico italiano scenderà sotto il 140% del PIL entro 12 mesi?",
    description: "Il rapporto debito/PIL italiano sarà inferiore al 140% secondo le stime ufficiali (ISTAT, MEF) entro 12 mesi. Fonte: Ministero Economia o Istat.",
    category: "Economia",
  },
  {
    title: "La disoccupazione in Italia scenderà sotto il 5,5% nei prossimi 12 mesi?",
    description: "Il tasso di disoccupazione italiano (ISTAT) sarà inferiore al 5,5% in almeno un mese nei prossimi 12 mesi. Fonte: Istat.",
    category: "Economia",
  },
  {
    title: "Il dollaro (DXY) chiuderà l'anno sopra 108?",
    description: "L'indice del dollaro DXY chiuderà il prossimo anno solare a un livello superiore a 108. Fonte: Bloomberg o Fed. Esito entro 12 mesi.",
    category: "Economia",
  },
  {
    title: "Il mercato immobiliare italiano registrerà un calo dei prezzi nei prossimi 12 mesi?",
    description: "Gli indici ufficiali dei prezzi delle case (ISTAT o Nomisma) mostreranno una variazione negativa su base annua nei prossimi 12 mesi. Fonte: Istat o fonti riconosciute.",
    category: "Economia",
  },
  {
    title: "La Cina supererà gli USA come prima economia al mondo per PIL (PPP) nei prossimi 12 mesi?",
    description: "Le stime IMF o World Bank indicheranno la Cina come prima economia mondiale per PIL a parità di potere d'acquisto nei prossimi 12 mesi. Fonte: FMI o Banca Mondiale.",
    category: "Economia",
  },
  // --- Cultura (14) ---
  {
    title: "Un film italiano vincerà la Palma d'oro a Cannes?",
    description: "Un film con produzione o regia italiana vincerà la Palma d'oro al prossimo Festival di Cannes. Fonte: sito ufficiale Cannes. Esito entro 12 mesi.",
    category: "Cultura",
  },
  {
    title: "Il libro più venduto in Italia nei prossimi 12 mesi sarà di un autore italiano?",
    description: "Il libro di narrativa più venduto in Italia nei prossimi 12 mesi (classifica Nielsen o equivalente) sarà scritto da un autore italiano. Fonte: classifiche editoriali.",
    category: "Cultura",
  },
  {
    title: "La Scala aprirà la prossima stagione con un'opera italiana?",
    description: "La prima della prossima stagione del Teatro alla Scala sarà un'opera di un compositore italiano. Fonte: sito Teatro alla Scala. Esito entro 12 mesi.",
    category: "Cultura",
  },
  {
    title: "Un artista italiano vincerà il Leone d'oro alla Biennale di Venezia?",
    description: "Il Leone d'oro per la partecipazione nazionale o per il miglior artista alla prossima Biennale Arte andrà a un artista italiano. Fonte: Biennale di Venezia. Esito entro 18 mesi.",
    category: "Cultura",
  },
  {
    title: "Il Festival di Sanremo sarà condotto da una donna?",
    description: "Il conduttore o la conduttrice principale del prossimo Festival di Sanremo sarà una donna. Fonte: RAI o comunicati ufficiali. Esito entro 24 mesi.",
    category: "Cultura",
  },
  {
    title: "Un museo italiano entrerà nella top 20 mondiale per visitatori nei prossimi 12 mesi?",
    description: "Almeno un museo italiano figurerà nella classifica top 20 mondiale per numero di visitatori nei prossimi 12 mesi (The Art Newspaper o TEA). Fonte: report settoriali.",
    category: "Cultura",
  },
  {
    title: "Verrà annunciato un nuovo film di Sorrentino?",
    description: "Sarà annunciato ufficialmente un nuovo lungometraggio diretto da Paolo Sorrentino con uscita prevista nei prossimi 24 mesi. Fonte: trade (Variety, Deadline) o produzione.",
    category: "Cultura",
  },
  {
    title: "Il Premio Strega andrà a un autore under 40?",
    description: "Il vincitore del prossimo Premio Strega sarà un autore o un'autrice under 40 anni. Fonte: Fondazione Bellonci. Esito entro 12 mesi.",
    category: "Cultura",
  },
  {
    title: "La RAI aumenterà l'offerta di contenuti in 4K nei prossimi 12 mesi?",
    description: "La RAI annuncerà o lancerà almeno tre nuovi programmi o canali in 4K nei prossimi 12 mesi. Fonte: RAI.",
    category: "Cultura",
  },
  {
    title: "Un romanzo italiano sarà nella shortlist del Booker Prize?",
    description: "Un romanzo scritto in italiano (anche in traduzione) sarà nella shortlist del prossimo International Booker Prize. Fonte: Booker Prize Foundation. Esito entro 12 mesi.",
    category: "Cultura",
  },
  {
    title: "Il Colosseo supererà i 7 milioni di visitatori nei prossimi 12 mesi?",
    description: "Il Parco archeologico del Colosseo registrerà oltre 7 milioni di visitatori nei prossimi 12 mesi. Fonte: MiC o gestore del sito.",
    category: "Cultura",
  },
  {
    title: "Verrà istituito un nuovo ministero della Cultura in Italia?",
    description: "Un governo italiano annuncerà la creazione di un ministero dedicato alla Cultura (o rinomina equivalente) entro 24 mesi. Fonte: Gazzetta Ufficiale.",
    category: "Cultura",
  },
  {
    title: "Un documentario italiano vincerà un Oscar nei prossimi 24 mesi?",
    description: "Un documentario con produzione o regia italiana vincerà l'Oscar al miglior documentario alla prossima cerimonia. Fonte: Academy of Motion Picture Arts and Sciences. Esito entro 24 mesi.",
    category: "Cultura",
  },
  {
    title: "La lingua italiana avrà più parlanti nel mondo nei prossimi 12 mesi rispetto al 2024?",
    description: "Le stime ufficiali (ISTAT, Ministero Esteri o Ethnologue) indicheranno un numero di parlanti italiano (L1+L2) superiore al 2024. Fonte: fonti linguistiche riconosciute.",
    category: "Cultura",
  },
  // --- Scienza (14) ---
  {
    title: "La NASA atterrerà astronauti sulla Luna?",
    description: "La missione NASA Artemis atterrerà con equipaggio sulla Luna entro 24 mesi. Fonte: NASA.",
    category: "Scienza",
  },
  {
    title: "Verrà approvato un vaccino mRNA per un nuovo patogeno?",
    description: "Un vaccino a mRNA riceverà approvazione regolatoria (EMA o FDA) per un nuovo patogeno entro 12 mesi. Fonte: EMA o FDA.",
    category: "Scienza",
  },
  {
    title: "Un esperimento di fusione nucleare raggiungerà il break-even nei prossimi 12 mesi?",
    description: "Un reattore a fusione (es. JET, ITER o equivalente) pubblicherà risultati con guadagno di energia (Q>=1) nei prossimi 12 mesi. Fonte: paper peer-reviewed o comunicato ufficiale.",
    category: "Scienza",
  },
  {
    title: "Il livello medio del mare salirà di oltre 3 mm nei prossimi 12 mesi?",
    description: "La variazione del livello medio globale del mare nei prossimi 12 mesi supererà i 3 mm secondo dati NOAA o equivalente. Fonte: NOAA o Copernicus.",
    category: "Scienza",
  },
  {
    title: "Verrà scoperto un esopianeta abitabile (zona abitabile) entro 12 mesi?",
    description: "Sarà annunciata la scoperta di un esopianeta in zona abitabile con caratteristiche compatibili con acqua liquida entro 12 mesi. Fonte: NASA, ESA o paper peer-reviewed.",
    category: "Scienza",
  },
  {
    title: "L'OMS dichiarerà la fine della pandemia COVID-19 come emergenza globale?",
    description: "L'OMS revocherà lo stato di emergenza di salute pubblica di rilevanza internazionale per COVID-19 entro 12 mesi. Fonte: OMS.",
    category: "Scienza",
  },
  {
    title: "Un farmaco anti-invecchiamento passerà la fase III?",
    description: "Un farmaco con indicazione anti-invecchiamento o longevità completerà con successo uno studio di fase III entro 24 mesi. Fonte: clinicaltrials.gov o azienda.",
    category: "Scienza",
  },
  {
    title: "La temperatura globale supererà 1,5°C sopra i livelli preindustriali in un anno?",
    description: "La temperatura media globale annuale supererà 1,5°C rispetto all'era preindustriale in almeno un anno entro 24 mesi. Fonte: NOAA, NASA o WMO.",
    category: "Scienza",
  },
  {
    title: "Verrà annunciato un traguardo significativo nei computer quantistici nei prossimi 12 mesi?",
    description: "Un'azienda o ente di ricerca annuncerà un computer quantistico con oltre 1000 qubit logici o un algoritmo utile eseguito con advantage quantistico nei prossimi 12 mesi. Fonte: comunicati ufficiali o paper.",
    category: "Scienza",
  },
  {
    title: "L'Europa lancerà una missione con equipaggio oltre l'orbita terrestre?",
    description: "L'ESA o una partnership europea lancerà una missione con astronauti europei oltre l'orbita terrestre bassa entro 60 mesi. Fonte: ESA.",
    category: "Scienza",
  },
  {
    title: "Un trial clinico dimostrerà efficacia di un farmaco per l'Alzheimer nei prossimi 12 mesi?",
    description: "Un farmaco in sviluppo mostrerà risultati positivi in uno studio di fase III per la malattia di Alzheimer nei prossimi 12 mesi (comunicato o pubblicazione). Fonte: azienda o rivista peer-reviewed.",
    category: "Scienza",
  },
  {
    title: "Il CERN annuncerà la scoperta di una nuova particella?",
    description: "Il CERN annuncerà prove statisticamente significative di una nuova particella elementare entro 24 mesi. Fonte: CERN.",
    category: "Scienza",
  },
  {
    title: "La produzione di energia da fusione supererà 1 MW per oltre 1 minuto nei prossimi 12 mesi?",
    description: "Un reattore a fusione manterrà una potenza di uscita superiore a 1 MW per oltre 60 secondi nei prossimi 12 mesi. Fonte: comunicato o paper ufficiale.",
    category: "Scienza",
  },
  {
    title: "L'Italia raggiungerà il 50% di energia da rinnovabili nel mix elettrico nei prossimi 12 mesi?",
    description: "La quota di produzione elettrica da fonti rinnovabili in Italia supererà il 50% nei prossimi 12 mesi. Fonte: Terna o GSE.",
    category: "Scienza",
  },
  // --- Intrattenimento (14) ---
  {
    title: "Un film supererà i 2 miliardi di dollari al botteghino nei prossimi 12 mesi?",
    description: "Almeno un film uscito nei prossimi 12 mesi supererà i 2 miliardi di dollari di incassi globali. Fonte: Box Office Mojo o Comscore.",
    category: "Intrattenimento",
  },
  {
    title: "La seconda stagione di The Last of Us uscirà?",
    description: "La seconda stagione della serie TV The Last of Us sarà trasmessa o pubblicata entro 24 mesi. Fonte: HBO o Max.",
    category: "Intrattenimento",
  },
  {
    title: "Un videogioco italiano vincerà il Game of the Year ai TGA?",
    description: "Un videogioco con sviluppo o pubblicazione italiana vincerà il premio Game of the Year ai prossimi The Game Awards. Fonte: The Game Awards. Esito entro 12 mesi.",
    category: "Intrattenimento",
  },
  {
    title: "Netflix supererà i 300 milioni di abbonati entro 12 mesi?",
    description: "Netflix annuncerà oltre 300 milioni di abbonati paganti in un report trimestrale entro 12 mesi. Fonte: Netflix investor relations.",
    category: "Intrattenimento",
  },
  {
    title: "Taylor Swift vincerà almeno un Grammy nei prossimi 24 mesi?",
    description: "Taylor Swift vincerà almeno un Grammy Award alla prossima cerimonia. Fonte: Recording Academy. Esito entro 24 mesi.",
    category: "Intrattenimento",
  },
  {
    title: "Il sequel di Avatar uscirà?",
    description: "Un nuovo film della saga Avatar (Avatar 3 o successivo) uscirà nelle sale entro 36 mesi. Fonte: Disney o annunci ufficiali.",
    category: "Intrattenimento",
  },
  {
    title: "Un anime supererà Demon Slayer negli incassi in Giappone nei prossimi 12 mesi?",
    description: "Un film anime uscito nei prossimi 12 mesi supererà gli incassi del miglior film di Demon Slayer in Giappone. Fonte: box office giapponese.",
    category: "Intrattenimento",
  },
  {
    title: "Spotify supererà i 700 milioni di utenti mensili attivi entro 12 mesi?",
    description: "Spotify annuncerà oltre 700 milioni di utenti mensili attivi in un report trimestrale entro 12 mesi. Fonte: Spotify.",
    category: "Intrattenimento",
  },
  {
    title: "Il Festival di Sanremo avrà oltre 12 milioni di spettatori in media?",
    description: "La media degli ascolti delle serate del prossimo Festival di Sanremo supererà i 12 milioni di spettatori. Fonte: Auditel o RAI. Esito entro 24 mesi.",
    category: "Intrattenimento",
  },
  {
    title: "Un film di supereroi vincerà l'Oscar al miglior film nei prossimi 24 mesi?",
    description: "Un film appartenente al genere supereroi (Marvel, DC o simile) vincerà l'Oscar al miglior film alla prossima cerimonia. Fonte: Academy. Esito entro 24 mesi.",
    category: "Intrattenimento",
  },
  {
    title: "GTA VI venderà oltre 50 milioni di copie nel primo anno?",
    description: "Grand Theft Auto VI venderà oltre 50 milioni di copie nel primo anno dalla release. Fonte: Take-Two o comunicati ufficiali.",
    category: "Intrattenimento",
  },
  {
    title: "Disney+ supererà Netflix in abbonati in Europa entro 12 mesi?",
    description: "Disney+ annuncerà più abbonati in Europa di Netflix in un report trimestrale entro 12 mesi. Fonte: Disney e Netflix investor relations.",
    category: "Intrattenimento",
  },
  {
    title: "Una serie TV non in inglese vincerà l'Emmy come miglior serie drammatica nei prossimi 12 mesi?",
    description: "Una serie in lingua non inglese vincerà l'Emmy per Outstanding Drama Series alla prossima cerimonia. Fonte: Television Academy. Esito entro 12 mesi.",
    category: "Intrattenimento",
  },
  {
    title: "Il videogioco più venduto nei prossimi 12 mesi sarà un titolo single-player?",
    description: "Il videogioco con più vendite globali nei prossimi 12 mesi (senza contare free-to-play) sarà un titolo single-player. Fonte: NPD, GSD o equivalente.",
    category: "Intrattenimento",
  },
];

if (EVENTI_ATTUALI_100.length !== 100) {
  throw new Error(`EVENTI_ATTUALI_100 must have exactly 100 items, got ${EVENTI_ATTUALI_100.length}`);
}
