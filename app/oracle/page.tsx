"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Redirect: Oracle Assistant è stato sostituito da Exchange */
export default function OracleRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/exchange");
  }, [router]);
  return null;
}
