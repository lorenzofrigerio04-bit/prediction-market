import Header from "@/components/Header";
import SignupScreen from "@/components/auth/SignupScreen";

type SearchParams = Promise<{ callbackUrl?: string }>;

export default async function SignupPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const raw = sp.callbackUrl;
  const authSuccessCallbackUrl =
    typeof raw === "string" && raw.startsWith("/") && !raw.startsWith("//") ? raw : undefined;
  return (
    <div className="flex min-h-dvh flex-col bg-admin-bg">
      <Header showCategoryStrip={false} />
      <main className="auth-page-suppress-when-modal-open relative flex min-h-0 flex-1 flex-col">
        <SignupScreen authSuccessCallbackUrl={authSuccessCallbackUrl} />
      </main>
    </div>
  );
}
