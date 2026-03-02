import { redirect } from "next/navigation";

/**
 * La visione "consigliati" a griglia è stata unificata con il feed su /discover.
 * Reindirizziamo per mantenere link e bookmark funzionanti.
 */
export default function DiscoverConsigliatiPage() {
  redirect("/discover");
}
