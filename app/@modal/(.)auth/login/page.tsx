"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import LoginModal from "@/components/auth/LoginModal";

function safeCallbackPath(raw: string | null): string {
  if (raw && typeof raw === "string" && raw.startsWith("/") && !raw.startsWith("//")) {
    return raw;
  }
  return "/";
}

/**
 * Intercepting route: navigazione client a /auth/login apre il pannello vetro
 * sopra la pagina corrente (header e sfondo restano visibili), come per /auth/signup.
 *
 * Evitiamo `useSearchParams()` + `Suspense fallback={null}`: ritardavano il modal al click «Accedi».
 */
function LoginInterceptContent() {
  const router = useRouter();

  const handleClose = useCallback(() => {
    const fallback = safeCallbackPath(
      new URLSearchParams(typeof window !== "undefined" ? window.location.search : "").get(
        "callbackUrl"
      )
    );
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      queueMicrotask(() => {
        try {
          router.refresh();
        } catch {
          /* ignore */
        }
      });
      return;
    }
    router.replace(fallback);
    queueMicrotask(() => {
      try {
        router.refresh();
      } catch {
        /* ignore */
      }
    });
  }, [router]);

  return <LoginModal open onClose={handleClose} />;
}

export default function LoginInterceptedPage() {
  return <LoginInterceptContent />;
}
