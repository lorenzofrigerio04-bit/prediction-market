"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";

const STORAGE_KEY = "pm_returning_visitor";

/** Dopo almeno un login riuscito, la pagina /auth/login può mostrare copy da “utente che torna”. */
export default function MarkReturningVisitor() {
  const { status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") return;
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore quota / private mode */
    }
  }, [status]);

  return null;
}
