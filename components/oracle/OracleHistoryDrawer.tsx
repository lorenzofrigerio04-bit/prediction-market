"use client";

import { useEffect, useRef, useState } from "react";

export interface OracleReportItem {
  id: string;
  userQuery: string;
  reportText: string;
  topic: string | null;
  createdAt: string;
}

interface OracleHistoryDrawerProps {
  open: boolean;
  onClose: () => void;
  reports: OracleReportItem[];
  onSelectReport: (report: OracleReportItem) => void;
  onDeleteReport: (report: OracleReportItem) => void;
  onNewChat: () => void;
  onOpenAppMenu?: () => void;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60 * 60 * 1000) return "Oggi";
  if (diff < 24 * 60 * 60 * 1000) return "Ieri";
  if (diff < 7 * 24 * 60 * 60 * 1000) return `${Math.floor(diff / (24 * 60 * 60 * 1000))} giorni fa`;
  return d.toLocaleDateString("it-IT", { day: "numeric", month: "short" });
}

function IconTrash({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

export default function OracleHistoryDrawer({
  open,
  onClose,
  reports,
  onSelectReport,
  onDeleteReport,
  onNewChat,
  onOpenAppMenu,
}: OracleHistoryDrawerProps) {
  const panelRef = useRef<HTMLElement>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        aria-hidden
        onClick={onClose}
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-label="Storico chat Oracle"
        className="fixed top-0 left-0 bottom-0 z-50 w-[min(320px,85vw)] bg-[#171717] border-r border-white/10 shadow-xl flex flex-col oracle-drawer-slide-in"
        style={{ paddingTop: "var(--safe-area-inset-top)" }}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
          <h2 className="text-[15px] font-semibold text-white">Storico</h2>
          <div className="flex items-center gap-1">
            {onOpenAppMenu && (
              <button
                type="button"
                onClick={onOpenAppMenu}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Menu app"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            <button
            type="button"
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Chiudi"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            onNewChat();
            onClose();
          }}
          className="mx-4 mt-4 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuova chat
        </button>
        <div className="flex-1 overflow-y-auto py-4">
          {reports.length === 0 ? (
            <p className="px-4 text-[14px] text-gray-500 text-center py-8">
              Nessun report ancora
            </p>
          ) : (
            <ul className="space-y-1 px-3">
              {reports.map((r) => (
                <li key={r.id} className="group/item flex items-stretch rounded-xl hover:bg-white/5">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectReport(r);
                      onClose();
                    }}
                    className="flex-1 min-w-0 text-left px-4 py-3 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <p className="text-[14px] font-medium text-white truncate group-hover/item:text-gray-200 transition-colors">
                      {r.userQuery || r.topic || "Report"}
                    </p>
                    <p className="text-[12px] text-gray-500 mt-0.5">
                      {formatDate(r.createdAt)}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (deletingId === r.id) return;
                      setDeletingId(r.id);
                      onDeleteReport(r);
                    }}
                    disabled={deletingId === r.id}
                    className="flex items-center justify-center px-3 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-r-xl transition-colors disabled:opacity-50"
                    aria-label="Elimina chat"
                  >
                    <IconTrash className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}
