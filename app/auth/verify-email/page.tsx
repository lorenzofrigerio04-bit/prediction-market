import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import BackLink from "@/components/ui/BackLink";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import Header from "@/components/Header";
import VerifyEmailCodeForm from "@/components/auth/VerifyEmailCodeForm";
import { verifyEmailWithUrlToken } from "@/lib/email-verification";
import { sendWelcomeEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ token?: string }>;

export default async function VerifyEmailPage({ searchParams }: { searchParams: SearchParams }) {
  const { token } = await searchParams;
  const trimmed = token?.trim();

  if (!trimmed) {
    return (
      <div className="min-h-screen bg-bg flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="max-w-md w-full card-raised rounded-3xl border border-border dark:border-white/10 p-6 md:p-8">
            <h1 className="text-xl font-bold text-fg mb-2 text-center">Verifica la tua email</h1>
            <VerifyEmailCodeForm />
            <p className="text-center text-fg-muted text-sm mt-4">
              Oppure riapri il link che hai ricevuto nell’email.
            </p>
            <BackLink
              href="/"
              className="mt-4 block text-center text-sm text-primary hover:underline"
            >
              Home
            </BackLink>
          </div>
        </div>
      </div>
    );
  }

  const result = await verifyEmailWithUrlToken(trimmed);

  if (!result.ok) {
    return (
      <div className="min-h-screen bg-bg flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="max-w-md w-full card-raised rounded-3xl border border-border dark:border-white/10 p-6 md:p-8 text-center space-y-4">
            <h1 className="text-xl font-bold text-fg">Link non più valido</h1>
            <p className="text-fg-muted text-sm">
              Il link è scaduto (24 ore) o non è corretto. Puoi accedere, richiedere una nuova email o usare il
              codice a 6 cifre.
            </p>
            <Link
              href="/auth/verify-email"
              className="inline-block min-h-[48px] px-6 py-3 bg-primary text-white font-semibold rounded-2xl hover:bg-primary-hover"
            >
              Inserisci il codice
            </Link>
            <Link
              href="/auth/login"
              className="inline-block min-h-[48px] px-6 py-3 border border-border rounded-2xl font-semibold text-fg hover:bg-bg-muted"
            >
              Accedi / Reinvio email
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (result.wasFreshVerification) {
    const u = await prisma.user.findUnique({
      where: { email: result.email },
      select: { name: true },
    });
    sendWelcomeEmail(result.email, u?.name ?? null).catch((e) =>
      console.error("[verify-email-page] welcome email", e)
    );
  }

  const session = await getServerSession(authOptions);

  if (session?.user?.email && session.user.email.toLowerCase() === result.email.toLowerCase()) {
    redirect("/?verified=1");
  }
  redirect("/auth/login?verified=1");
}
