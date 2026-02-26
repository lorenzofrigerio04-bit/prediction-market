/**
 * Frasi motivazionali / FOMO per la classifica, in base alla posizione.
 * Generano desiderio di salire e di "sfoggiare" il proprio risultato.
 */

export function getLeaderboardMotivationalPhrase(
  rank: number,
  totalUsers: number,
  correctPredictions: number,
  isCurrentUser: boolean
): string {
  const prefix = isCurrentUser ? "Tu: " : "";
  if (totalUsers === 0) return prefix + "Prevedi per entrare in classifica.";

  // Top 1
  if (rank === 1) {
    return (
      prefix +
      "Sei il migliore. Tutti ti guardano: continua così e resta in vetta."
    );
  }
  // Top 2–3
  if (rank <= 3) {
    return (
      prefix +
      "Podio d'élite. Ancora un passo e sei primo: non mollare ora."
    );
  }
  // Top 10
  if (rank <= 10) {
    return (
      prefix +
      "Sei tra i migliori. La vetta è vicina: ogni previsione conta."
    );
  }
  // Top 25
  if (rank <= 25) {
    return (
      prefix +
      "Zona alta. Chi è sopra di te sa che stai arrivando: aumenta il ritmo."
    );
  }
  // Top 50
  if (rank <= 50) {
    return (
      prefix +
      "Metà classifica superata. La top 10 non è un sogno: prevedi con criterio."
    );
  }
  // Top 100
  if (rank <= 100) {
    return (
      prefix +
      "Sei nella top 100. Fuori da qui tutti vorrebbero il tuo posto: consolidalo."
    );
  }
  // Oltre 100 ma con buone previsioni
  if (correctPredictions >= 5) {
    return (
      prefix +
      "Stai risalendo. Le tue previsioni funzionano: ancora un po' e entri in zona che conta."
    );
  }
  // In classifica ma in basso
  return (
    prefix +
    "Sei in classifica. Ogni previsione giusta ti fa salire: non restare indietro."
  );
}
