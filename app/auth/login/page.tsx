import { Suspense } from "react";
import Header from "@/components/Header";
import LoginScreen from "@/components/auth/LoginScreen";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <div className="flex min-h-dvh flex-col bg-[#060a12]">
        <Header showCategoryStrip={false} />
        <main className="auth-page-suppress-when-modal-open relative flex min-h-0 flex-1 flex-col">
          <LoginScreen />
        </main>
      </div>
    </Suspense>
  );
}
