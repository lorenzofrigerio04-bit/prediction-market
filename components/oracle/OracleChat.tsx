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

const NEAR_BOTTOM_THRESHOLD = 120;

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastScrollTopRef = useRef(0);
  const streamRafRef = useRef<number | null>(null);
  const streamContentRef = useRef<string>("");
  const streamMsgIdRef = useRef<string | null>(null);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const handleScroll = () => {
      const scrollTop = el.scrollTop;
      const scrollingUp = scrollTop < lastScrollTopRef.current;
      lastScrollTopRef.current = scrollTop;
      window.dispatchEvent(
        new CustomEvent("oracle-chat-scroll", {
          detail: { scrollTop, scrollingUp },
        })
      );
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (messages.length > 0 || loadingHistory) return;
    const el = scrollContainerRef.current;
    if (!el) return;
    let startY = 0;
    let triggered = false;
    let lastTap = 0;
    const MIN_PULL = 40;
    const DOUBLE_TAP_MS = 400;

    const showNav = () => {
      if (triggered) return;
      triggered = true;
      window.dispatchEvent(new CustomEvent("oracle-show-nav"));
    };

    const tryTrigger = (currentY: number) => {
      if (triggered) return;
      const deltaY = currentY - startY;
      if (deltaY > MIN_PULL) showNav();
    };

    const touchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      triggered = false;
    };
    const touchMove = (e: TouchEvent) => {
      if (triggered) {
        e.preventDefault();
        return;
      }
      tryTrigger(e.touches[0].clientY);
    };
    const touchEnd = () => {
      const now = Date.now();
      if (lastTap > 0 && now - lastTap < DOUBLE_TAP_MS && now - lastTap > 80) {
        showNav();
      }
      lastTap = Date.now();
    };

    const mouseDownWithMove = (e: MouseEvent) => {
      startY = e.clientY;
      triggered = false;
      const onMove = (ev: MouseEvent) => tryTrigger(ev.clientY);
      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp, { once: true });
    };
    const mouseClick = () => {
      const now = Date.now();
      if (lastTap > 0 && now - lastTap < DOUBLE_TAP_MS && now - lastTap > 80) {
        showNav();
      }
      lastTap = Date.now();
    };

    el.addEventListener("touchstart", touchStart, { passive: true });
    el.addEventListener("touchmove", touchMove, { passive: false });
    el.addEventListener("touchend", touchEnd, { passive: true });
    el.addEventListener("mousedown", mouseDownWithMove);
    el.addEventListener("click", mouseClick);
    return () => {
      el.removeEventListener("touchstart", touchStart);
      el.removeEventListener("touchmove", touchMove);
      el.removeEventListener("touchend", touchEnd);
      el.removeEventListener("mousedown", mouseDownWithMove);
      el.removeEventListener("click", mouseClick);
    };
  }, [messages.length, loadingHistory]);

  const isNearBottom = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return true;
    const { scrollTop, scrollHeight, clientHeight } = el;
    return scrollHeight - scrollTop - clientHeight < NEAR_BOTTOM_THRESHOLD;
  }, []);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const el = scrollContainerRef.current;
    const anchor = messagesEndRef.current;
    if (el && anchor) {
      if (behavior === "instant") {
        el.scrollTop = el.scrollHeight;
      } else {
        anchor.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    }
  }, []);


  const flushStreamUpdate = useCallback(() => {
    streamRafRef.current = null;
    const content = streamContentRef.current;
    const id = streamMsgIdRef.current;
    if (!id) return;
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, content, isStreaming: true } : m
      )
    );
    if (isNearBottom()) {
      const el = scrollContainerRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    }
  }, [isNearBottom]);

  const scheduleStreamUpdate = useCallback(() => {
    if (streamRafRef.current !== null) return;
    streamRafRef.current = requestAnimationFrame(flushStreamUpdate);
  }, [flushStreamUpdate]);

  const fetchReports = useCallback(async (showLoading = false) => {
    if (showLoading) setLoadingHistory(true);
    try {
      const res = await fetch("/api/oracle/reports?limit=20");
      if (!res.ok) throw new Error("Errore caricamento report");
      const data = await res.json();
      const list = data.reports ?? [];
      setReports(list);
    } catch {
      setReports([]);
    } finally {
      if (showLoading) setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchReports(true);
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
    requestAnimationFrame(() => scrollToBottom("instant"));
  }, [scrollToBottom]);

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
      const assistantMsg: ChatMessage = {
        id: `stream-${Date.now()}`,
        role: "assistant",
        content: "",
        isStreaming: true,
      };
      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setLoading(true);
      setError(null);

      streamContentRef.current = "";
      streamMsgIdRef.current = assistantMsg.id;

      abortControllerRef.current = new AbortController();

      if (isNearBottom()) {
        requestAnimationFrame(() => scrollToBottom("instant"));
      }

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
          streamContentRef.current = fullText;
          scheduleStreamUpdate();
        }

        streamContentRef.current = fullText;
        if (streamRafRef.current !== null) {
          cancelAnimationFrame(streamRafRef.current);
        }
        flushStreamUpdate();
        streamMsgIdRef.current = null;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id
              ? { ...m, content: fullText, isStreaming: false }
              : m
          )
        );
        if (isNearBottom()) requestAnimationFrame(() => scrollToBottom("instant"));
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
    [loading, fetchReports, isNearBottom, scrollToBottom, scheduleStreamUpdate, flushStreamUpdate]
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
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 pb-32 min-h-0 overscroll-contain"
        style={{ overflowAnchor: "auto" }}
      >
        {loadingHistory ? (
          <div className="flex items-center justify-center min-h-[200px] py-12 text-gray-500 text-[15px] animate-pulse">
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
