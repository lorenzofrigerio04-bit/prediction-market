/**
 * Esempi numerici: come funziona acquisto/vendita con la nuova liquidità (b alto).
 * Usa la stessa logica LMSR del progetto (lib/pricing/lmsr.ts).
 *
 * Run: npx tsx scripts/examples-liquidity.ts
 */

import { getPrice, buyShares, sellShares } from "../lib/pricing/lmsr";

const SCALE = 1_000_000;

// b vecchio (prima della modifica) vs nuovo (con LIQUIDITY_MULTIPLIER = 25)
const B_VECCHIO = 500;
const B_NUOVO = 500 * 25; // 12_500 (es. Sport)

function round2(x: number): number {
  return Math.round(x * 100) / 100;
}

function pct(x: number): string {
  return (x * 100).toFixed(1) + "%";
}

/**
 * Trova q_no dato q_yes e prezzo desiderato per YES (approssimato).
 * p_yes = exp(q_yes/b) / (exp(q_yes/b) + exp(q_no/b)) => q_no ≈ b * ln((1-p)/p) + q_yes per p piccolo.
 */
function qNoForYesPrice(qYes: number, b: number, targetPriceYes: number): number {
  if (targetPriceYes >= 1 || targetPriceYes <= 0) return qYes;
  const ratio = (1 - targetPriceYes) / targetPriceYes; // exp((q_no - q_yes)/b) = ratio
  return qYes + b * Math.log(ratio);
}

console.log("═══════════════════════════════════════════════════════════════");
console.log("  ESEMPI: ACQUISTO / VENDITA CON NUOVA LIQUIDITÀ (b alto)");
console.log("═══════════════════════════════════════════════════════════════\n");

// ---- Esempio 1: Mercato al 2% SÌ, spendi 100 crediti in SÌ ----
console.log("── Esempio 1: Mercato al 2% SÌ, spendi 100 crediti in SÌ ──\n");

const qYes2 = 200;
const qNo2Old = Math.round(qNoForYesPrice(qYes2, B_VECCHIO, 0.02));
const qNo2New = Math.round(qNoForYesPrice(qYes2, B_NUOVO, 0.02));

const priceBeforeOld = getPrice(qYes2, qNo2Old, B_VECCHIO, "YES");
const priceBeforeNew = getPrice(qYes2, qNo2New, B_NUOVO, "YES");

console.log("Stato mercato (prezzo SÌ ≈ 2%):");
console.log("  b vecchio (500):  q_yes=" + qYes2 + ", q_no=" + qNo2Old + " → prezzo SÌ = " + pct(priceBeforeOld));
console.log("  b nuovo (12500): q_yes=" + qYes2 + ", q_no=" + qNo2New + " → prezzo SÌ = " + pct(priceBeforeNew));
console.log("");

const creditiSpesi = 100;

const { sharesBought: quoteVecchio, actualCostPaid: costVecchio } = buyShares(
  qYes2, qNo2Old, B_VECCHIO, "YES", creditiSpesi
);
const { sharesBought: quoteNuovo, actualCostPaid: costNuovo } = buyShares(
  qYes2, qNo2New, B_NUOVO, "YES", creditiSpesi
);

const avgPriceVecchio = costVecchio / quoteVecchio;
const avgPriceNuovo = costNuovo / quoteNuovo;

console.log("Spendi " + creditiSpesi + " crediti in SÌ:");
console.log("  Con b = 500 (prima):");
console.log("    Quote ricevute: " + Math.round(quoteVecchio).toLocaleString("it-IT"));
console.log("    Prezzo medio acquisto: " + pct(avgPriceVecchio) + " (in UI vedevi ~" + pct(avgPriceVecchio) + ")");
console.log("    Formula naif crediti/prezzo: " + Math.round(creditiSpesi / priceBeforeOld).toLocaleString("it-IT") + " quote (non vale con slippage)");
console.log("");
console.log("  Con b = 12.500 (ora):");
console.log("    Quote ricevute: " + Math.round(quoteNuovo).toLocaleString("it-IT"));
console.log("    Prezzo medio acquisto: " + pct(avgPriceNuovo) + " ≈ prezzo mostrato " + pct(priceBeforeNew));
console.log("");

// ---- Esempio 2: Mercato 50/50, spendi 50 crediti in SÌ ----
console.log("── Esempio 2: Mercato 50/50, spendi 50 crediti in SÌ ──\n");

const qYes50 = 0;
const qNo50 = 0;
const price50 = getPrice(qYes50, qNo50, B_VECCHIO, "YES"); // 0.5

const { sharesBought: quote50Old } = buyShares(qYes50, qNo50, B_VECCHIO, "YES", 50);
const { sharesBought: quote50New } = buyShares(qYes50, qNo50, B_NUOVO, "YES", 50);

const avg50Old = 50 / quote50Old;
const avg50New = 50 / quote50New;

console.log("Mercato 50/50 (q_yes=q_no=0), spendi 50 crediti in SÌ:");
console.log("  Con b = 500:    " + Math.round(quote50Old) + " quote, prezzo medio " + pct(avg50Old));
console.log("  Con b = 12.500: " + Math.round(quote50New) + " quote, prezzo medio " + pct(avg50New));
console.log("  (Atteso senza slippage: 50/0.5 = 100 quote; con b alto ci si avvicina.)");
console.log("");

// ---- Esempio 3: Vendita ----
console.log("── Esempio 3: Vendi 500 quote SÌ (mercato era al 2% SÌ) ──\n");

const qYesSell = 200 + 500;  // dopo acquisto di 500 quote SÌ
const qNoSellOld = qNo2Old;
const qNoSellNew = qNo2New;

const prezzoVenditaOld = getPrice(qYesSell, qNoSellOld, B_VECCHIO, "YES");
const prezzoVenditaNew = getPrice(qYesSell, qNoSellNew, B_NUOVO, "YES");

const ricavoOld = sellShares(qYesSell, qNoSellOld, B_VECCHIO, "YES", 500);
const ricavoNew = sellShares(qYesSell, qNoSellNew, B_NUOVO, "YES", 500);

console.log("Vendi 500 quote SÌ (stato: mercato aveva q_yes aumentato di 500):");
console.log("  Con b = 500:    prezzo implicito ≈ " + pct(prezzoVenditaOld) + ", ricavi ≈ " + round2(ricavoOld).toFixed(2) + " crediti");
console.log("  Con b = 12.500: prezzo implicito ≈ " + pct(prezzoVenditaNew) + ", ricavi ≈ " + round2(ricavoNew).toFixed(2) + " crediti");
console.log("  Con b alto il prezzo di vendita resta più vicino al 2% (meno impatto della tua vendita).");
console.log("");

// ---- Riepilogo ----
console.log("═══════════════════════════════════════════════════════════════");
console.log("  RIEPILOGO");
console.log("═══════════════════════════════════════════════════════════════");
console.log("• Il prezzo che vedi (es. 2% SÌ) è il prezzo marginale (costo della prossima quota).");
console.log("• Con b alto (ora): il prezzo medio del tuo ordine è vicino a quel 2%.");
console.log("• Con b basso (prima): ordini grandi facevano salire tanto il prezzo → prezzo medio molto più alto.");
console.log("• In questo modo è l’insieme degli utenti (chi compra SÌ vs NO) a muovere il prezzo,");
console.log("  non la dimensione del singolo ordine.");
console.log("");
