/**
 * Sfondo globale della piattaforma — "Deep Oracle".
 *
 * Un'unica distesa di blu-notte profondo su cui galleggia tutta la piattaforma:
 * base obsidiana-navy con una colonna di luce che scende dall'alto, due aurore
 * di brand che derivano lentissime (la "luce della preveggenza" in ciano +
 * la dualità SI/NO del mercato sussurrata negli angoli bassi), un bagliore di
 * orizzonte ("il limite del noto"), due strati di stelle in parallasse, grana
 * fine anti-banding e una vignetta di messa a fuoco.
 *
 * Costruito per essere "vissuto" a lungo: movimenti lenti, basso contrasto, mai
 * tremolante. Sta a z-index:-3, dietro a tutto il contenuto. Puramente
 * decorativo (nessuna interazione) → server component.
 */
export default function AppBackground() {
  return (
    <div className="app-background-unified" aria-hidden role="presentation">
      <div className="pm-bg pm-bg-base" />
      <div className="pm-bg pm-bg-aurora" />
      <div className="pm-bg pm-bg-aurora2" />
      <div className="pm-bg pm-bg-beam" />
      <div className="pm-bg pm-bg-stars" />
      <div className="pm-bg pm-bg-stars2" />
      <div className="pm-bg pm-bg-horizon" />
      <div className="pm-bg pm-bg-grain" />
      <div className="pm-bg pm-bg-vignette" />
    </div>
  );
}
