import type { NewsFormat } from "@/lib/news-engine/types";

/**
 * Bio pubbliche per la pagina rubrica /news/format/[slug].
 * Testo tra virgolette tipografiche, senza incipit "Sono…".
 */
export const NEWS_FORMAT_AUTHOR_BIO: Record<NewsFormat, string> = {
  BREAKING:
    "“Mi piace arrivare prima degli altri con i fatti. Scrivo aggiornamenti brevi e netti—niente riempitivi, solo ciò che conta davvero quando succede. Se è importante adesso, lo trovi qui.”",
  GOSSIP:
    "“Vivo di retroscena: corridoio, indiscrezioni e quel pizzico di ironia che ti fa sorridere mentre leggi. Ti racconto le voci come al bar con gli amici—leggera, diretta, mai noiosa.”",
  ANALYTICS:
    "“Il campo, per me, è numeri, trend e probabilità. Ti porto analisi che puoi seguire anche se non sei uno statistico—dati alla mano, conclusioni chiare. Sensazioni lasciamole alle tribune.”",
  REPORT:
    "“Seguo il calcio da anni: nei miei pezzi ti do contesto, prospettiva e il perché dietro la notizia. Scrivo report che vogliono resistere anche dopo il titolo del giorno dopo.”",
  HOT_TAKE:
    "“Qui si dice quel che molti pensano sottovoce. Ti porto opinioni che possono bruciare—non per fare rumore a vuoto, ma per farti ragionare anche quando non sei d’accordo con me.”",
};
