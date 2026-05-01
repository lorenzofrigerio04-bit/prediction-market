"use client";

import { useCallback, useLayoutEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SignupModal from "@/components/auth/SignupModal";

/**
 * Intercepting route: soft nav a /auth/signup mostra il sheet senza sostituire
 * la vista sottostante finché non si fa refresh o ingresso diretto.
 */
function SignupInterceptContent() {
  const router = useRouter();
  const [returnPath, setReturnPath] = useState<string | null>(null);

  useLayoutEffect(() => {
    const raw = new URLSearchParams(window.location.search).get("callbackUrl");
    setReturnPath(raw?.startsWith("/") && !raw.startsWith("//") ? raw : null);
  }, []);

  const handleWelcomeEmbedded = useCallback(() => {
    if (returnPath) {
      router.replace(returnPath);
    } else if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.replace("/");
    }
    router.refresh();
  }, [router, returnPath]);

  return (
    <SignupModal
      open
      onClose={() => router.back()}
      welcomeNavigateEmbedded={handleWelcomeEmbedded}
      authSuccessCallbackUrl={returnPath ?? "/"}
    />
  );
}

export default function SignupInterceptedPage() {
  return <SignupInterceptContent />;
}
