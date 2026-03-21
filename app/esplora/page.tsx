"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Redirect: Esplora è stato sostituito da Sport */
export default function EsploraRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/sport");
  }, [router]);
  return null;
}
