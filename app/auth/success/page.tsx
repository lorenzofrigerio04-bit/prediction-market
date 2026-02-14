import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Pagina intermedia dopo il login: verifica la sessione lato server (cookie)
 * e reindirizza alla destinazione. Garantisce che il server veda il cookie
 * di sessione prima di mostrare la home, evitando che la UI resti in stato "non loggato".
 */
export default async function AuthSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { callbackUrl } = await searchParams;
  const destination =
    callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")
      ? callbackUrl
      : "/";

  if (session?.user) {
    redirect(destination);
  }

  redirect("/auth/login");
}
