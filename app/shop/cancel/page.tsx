import { redirect } from "next/navigation";

// Stripe redirects here if the user cancels. Just send them back to the shop.
export default function ShopCancelPage() {
  redirect("/shop");
}
