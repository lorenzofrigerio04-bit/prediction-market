"use client";

import { useState, useEffect } from "react";
import CrystalBallOnly from "@/components/crea/CrystalBallOnly";

const HOME_SEEN_KEY = "pm_home_seen";

function capitalizeName(name: string): string {
  if (!name.trim()) return name;
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

interface HomeHeaderPostLoginProps {
  displayName: string;
}

export default function HomeHeaderPostLogin({ displayName }: HomeHeaderPostLoginProps) {
  // Inizialmente sempre "Benvenuto" per evitare hydration mismatch (server non ha localStorage).
  const [welcomeWord, setWelcomeWord] = useState<"Benvenuto" | "Bentornato">("Benvenuto");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = localStorage.getItem(HOME_SEEN_KEY);
    if (seen) {
      queueMicrotask(() => setWelcomeWord("Bentornato"));
    } else {
      localStorage.setItem(HOME_SEEN_KEY, "1");
    }
  }, []);

  const nameCapitalized = capitalizeName(displayName);
  const message = `${welcomeWord} ${nameCapitalized}`;

  return (
    <header className="mb-5 md:mb-6 flex justify-center">
      <CrystalBallOnly message={message} />
    </header>
  );
}
