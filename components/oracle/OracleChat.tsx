"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import OracleMessage from "./OracleMessage";
import OracleInput from "./OracleInput";
import OracleWelcome from "./OracleWelcome";
import OracleHistoryDrawer from "./OracleHistoryDrawer";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export interface OracleReportItem {
  id: string;
  userQuery: string;
  reportText: string;
  topic: string | null;
  createdAt: string;
}

interface OracleChatProps {
  historyOpen?: boolean;
  onHistoryClose?: () => void;
  onNewChat?: () => void;
  onOpenAppMenu?: () => void;
}

export default function OracleChat({
  historyOpen = false,
  onHistoryClose = () => {},
  onNewChat = () => {},
  onOpenAppMenu = () => {},
}: OracleChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reports, setReports] = useState<OracleReportItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const fetchReports = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/oracle/reports?limit=20");
      if (!res.ok) throw new Error("Errore caricamento report");
      const data = await res.json();
      const list = data.reports ?? [];
      setReports(list);
    } catch {
      setReports([]);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  useEffect(() => {
    const handler = () => handleNewChat();
    window.addEventListener("oracle-new-chat", handler);
    return () => window.removeEventListener("oracle-new-chat", handler);
  }, [handleNewChat]);

  const handleSelectReport = useCallback((r: OracleReportItem) => {
    setMessages([
      { id: `u-${r.id}`, role: "user", content: r.userQuery },
      { id: r.id, role: "assistant", content: r.reportText },
    ]);
    setError(null);
  }, []);

  const handleDeleteReport = useCallback(
    async (r: OracleReportItem) => {
      try {
        const res = await fetch(`/api/oracle/reports/${r.id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Errore eliminazione");
        setReports((prev) => prev.filter((x) => x.id !== r.id));
        setMessages((prev) => {
          const hasThisReport = prev.some((m) => m.id === r.id || m.id === `u-${r.id}`);
          return hasThisReport ? [] : prev;
        });
      } catch {
        setError("Impossibile eliminare la chat");
      }
    },
    []
  );

  const handleSend = useCallback(
    async (message: string) => {
      if (loading) return;

      const userMsg: ChatMessage = {
        id: `temp-${Date.now()}`,
        role: "user",
        content: message,
      };
      setMessages((prev) => [...prev, userMsg]);

      const assistantMsg: ChatMessage = {
        id: `stream-${Date.now()}`,
        role: "assistant",
        content: "",
        isStreaming: true,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setLoading(true);
      setError(null);

      abortControllerRef.current = new AbortController();

      try {
        const res = await fetch("/api/oracle/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message }),
          signal: abortControllerRef.current.signal,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error ?? "Errore nella richiesta");
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("Nessun stream");

        const decoder = new TextDecoder();
        let fullText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullText += chunk;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id
                ? { ...m, content: fullText, isStreaming: true }
                : m
            )
          );
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id
              ? { ...m, content: fullText, isStreaming: false }
              : m
          )
        );
        fetchReports();
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Errore durante la generazione";
        setError(msg);
        setMessages((prev) =>
          prev.filter((m) => m.id !== assistantMsg.id)
        );
      } finally {
        setLoading(false);
        abortControllerRef.current = null;
      }
    },
    [loading, fetchReports]
  );

  return (
    <div className="flex flex-col h-full min-h-0 relative">
      {/* PredictionMaster in sfondo, infondo allo schermo, appoggiato alla bottom nav */}
      <div
        className="fixed left-1/2 -translate-x-1/2 pointer-events-none select-none opacity-[0.1] z-0"
        style={{ bottom: "calc(5rem + var(--safe-area-inset-bottom, 0px) + 0.5rem)" }}
        aria-hidden
      >
        <span className="brand-logo__text tracking-tight text-lg md:text-xl whitespace-nowrap">
          <span className="brand-logo__word brand-logo__word--prediction">Prediction</span>
          <span className="brand-logo__word brand-logo__word--master">Master</span>
        </span>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-32">
        {loadingHistory ? (
          <div className="flex items-center justify-center py-12 text-gray-500 text-[15px]">
            Caricamento...
          </div>
        ) : messages.length === 0 ? (
          <OracleWelcome />
        ) : (
          <div className="space-y-4">
            {messages.map((m) => (
              <OracleMessage
                key={m.id}
                role={m.role}
                content={m.content}
                isStreaming={m.isStreaming}
              />
            ))}
            <div ref={messagesEndRef} aria-hidden />
          </div>
        )}
        {error && (
          <div
            className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-[14px]"
            role="alert"
          >
            {error}
          </div>
        )}
      </div>
      <OracleInput onSend={handleSend} disabled={loading} showDisclaimer={messages.length === 0} />
      <OracleHistoryDrawer
        open={historyOpen}
        onClose={onHistoryClose}
        reports={reports}
        onSelectReport={handleSelectReport}
        onDeleteReport={handleDeleteReport}
        onNewChat={() => {
          onHistoryClose();
          onNewChat();
        }}
        onOpenAppMenu={() => {
          onHistoryClose();
          onOpenAppMenu();
        }}
      />
    </div>
  );
}
