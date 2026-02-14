import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import Header from "@/components/Header";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ token?: string }>;

export default async function VerifyEmailPage({ searchParams }: { searchParams: SearchParams }) {
  const { token } = await searchParams;

  if (!token?.trim()) {
    return (
      <div className="min-h-screen bg-bg flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="max-w-md w-full glass rounded-3xl border border-border dark:border-white/10 p-6 md:p-8 text-center">
            <h1 className="text-xl font-bold text-fg mb-2">Link non valido</h1>
            <p className="text-fg-muted text-sm mb-6">
              Il link di verifica è scaduto o non è corretto. Richiedi una nuova email di verifica dal tuo profilo.
            </p>
            <Link
              href="/"
              className="inline-block min-h-[48px] px-6 py-3 bg-primary text-white font-semibold rounded-2xl hover:bg-primary-hover"
            >
              Torna alla home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const session = await getServerSession(authOptions);
  const verification = await prisma.verificationToken.findUnique({
    where: { token: token.trim() },
  });

  if (!verification || verification.expires < new Date()) {
    await prisma.verificationToken.deleteMany({ where: { token: token.trim() } }).catch(() => {});
    return (
      <div className="min-h-screen bg-bg flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="max-w-md w-full glass rounded-3xl border border-border dark:border-white/10 p-6 md:p-8 text-center">
            <h1 className="text-xl font-bold text-fg mb-2">Link scaduto</h1>
            <p className="text-fg-muted text-sm mb-6">
              Il link è scaduto (valido 24 ore). Richiedi una nuova email di verifica dal profilo dopo il login.
            </p>
            <Link
              href="/auth/login"
              className="inline-block min-h-[48px] px-6 py-3 bg-primary text-white font-semibold rounded-2xl hover:bg-primary-hover"
            >
              Accedi
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const email = verification.identifier;
  await prisma.user.updateMany({
    where: { email },
    data: { emailVerified: new Date() },
  });
  await prisma.verificationToken.deleteMany({ where: { token: token.trim() } }).catch(() => {});

  if (session?.user?.email === email) {
    redirect("/?verified=1");
  }
  redirect("/auth/login?verified=1");
}
