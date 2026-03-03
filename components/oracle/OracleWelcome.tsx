"use client";

import { useState, useEffect } from "react";

const WELCOME_TEXT = "Hey, sono il tuo Oracle Assistant! Posso aiutarti a prevedere eventi futuri.";
const CHAR_DELAY_MS = 28;
const CURSOR_BLINK_MS = 530;

/** Benvenuto con typewriter super fluido */
export default function OracleWelcome() {
  const [displayed, setDisplayed] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < WELCOME_TEXT.length) {
        setDisplayed(WELCOME_TEXT.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setIsComplete(true);
      }
    }, CHAR_DELAY_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, CURSOR_BLINK_MS);
    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center animate-in-fade-up">
      <p
        className="text-[22px] md:text-[26px] font-medium text-white leading-relaxed max-w-md"
        style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif" }}
      >
        {displayed}
        {!isComplete && (
          <span
            className={`inline-block w-0.5 h-[1.1em] align-middle ml-0.5 bg-white transition-opacity duration-75 ${
              showCursor ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden
          />
        )}
      </p>
      {isComplete && (
        <p className="mt-4 text-[15px] text-gray-500 max-w-sm leading-relaxed">
          Chiedimi un argomento: Serie A, elezioni, tecnologia AI...
        </p>
      )}
    </div>
  );
}
