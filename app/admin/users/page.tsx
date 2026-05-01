"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

interface UserRow {
  id: string;
  email: string | null;
  name: string | null;
  role: string;
  /** Es. `["google"]`, `["credentials"]` o entrambi se collegati */
  authProviders?: string[];
  createdAt: string;
  credits: number;
}

interface UsersResponse {
  users: UserRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const accentBtn =
  "inline-flex items-center justify-center gap-2 rounded-2xl border border-[#81D8D0]/45 bg-transparent px-4 py-2.5 text-sm font-semibold text-fg transition-all hover:bg-[#81D8D0]/10 hover:border-[#81D8D0]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#81D8D0]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-admin-bg";

const ghostBtn =
  "inline-flex items-center justify-center rounded-2xl border border-border/70 bg-admin-bg px-4 py-2.5 text-sm font-medium text-fg-muted transition-all hover:border-[#81D8D0]/35 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#81D8D0]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-admin-bg disabled:opacity-40";

function formatAuthProvidersLabel(providers: string[] | undefined): string {
  if (!providers?.length) return "—";
  const map: Record<string, string> = {
    google: "Google",
    credentials: "Email",
  };
  return providers.map((p) => map[p] ?? p).join(" · ");
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
      <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 30,
    total: 0,
    totalPages: 0,
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "30",
      });
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/users?${params}`, {
        cache: "no-store",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Errore caricamento");
      const data: UsersResponse = await res.json();
      setUsers(Array.isArray(data.users) ? data.users : []);
      setPagination(
        data.pagination && typeof data.pagination === "object"
          ? data.pagination
          : { page: 1, limit: 30, total: 0, totalPages: 0 }
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const handleDelete = async (u: UserRow) => {
    if (session?.user?.id === u.id) return;
    if (u.role === "ADMIN") return;
    const mail = u.email ?? u.id;
    if (
      !window.confirm(
        `Eliminare l'utente ${mail}? L'operazione non è annullabile. Gli eventi da lui creati risulteranno attribuiti al tuo account admin.`
      )
    ) {
      return;
    }
    setDeletingId(u.id);
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "Errore eliminazione");
      }
      await fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Errore eliminazione");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-admin-bg text-fg">
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10 settings-flat-page">
        <div className="box-raised rounded-3xl border border-border/70 bg-admin-bg p-5 md:p-8 shadow-[0_10px_40px_-28px_rgba(0,0,0,0.65)]">
          <header className="mb-8">
            <h1 className="font-kalshi text-[1.75rem] md:text-[2.1rem] font-bold text-fg leading-[1.05] tracking-[0.01em]">
              Utenti
            </h1>
            <p className="mt-2 text-sm text-fg-muted leading-relaxed max-w-2xl">
              Elenco utenti registrati: email, nome, ruolo e crediti. Elimina account di test per riusare la stessa email in fase di sviluppo.
            </p>
          </header>

          <form
            onSubmit={handleSearch}
            className="mb-8 flex flex-wrap items-stretch sm:items-center gap-3"
          >
            <label className="sr-only" htmlFor="admin-users-search">
              Cerca per email o nome
            </label>
            <input
              id="admin-users-search"
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cerca per email o nome"
              className="min-h-[46px] min-w-[220px] flex-1 rounded-2xl border border-border/70 bg-admin-bg px-4 py-3 text-sm text-fg placeholder:text-fg-subtle transition-colors hover:border-[#81D8D0]/25 focus:outline-none focus:border-[#81D8D0]/45 focus:ring-2 focus:ring-[#81D8D0]/15"
            />
            <button type="submit" className={`${accentBtn} min-h-[46px] shrink-0`}>
              Cerca
            </button>
            {search ? (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  setSearch("");
                  setPage(1);
                }}
                className={`${ghostBtn} min-h-[46px] shrink-0`}
              >
                Reset filtro
              </button>
            ) : null}
          </form>

          {loading ? (
            <div className="flex justify-center py-16">
              <div
                className="h-9 w-9 animate-spin rounded-full border-2 border-[#81D8D0]/30 border-t-[#81D8D0]"
                aria-hidden
              />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-2xl border border-border/60 bg-admin-bg">
                <table className="min-w-full text-left">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th
                        scope="col"
                        className="px-4 py-3.5 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-fg-muted"
                      >
                        Email
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3.5 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-fg-muted"
                      >
                        Nome
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3.5 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-fg-muted whitespace-nowrap"
                      >
                        Accesso
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3.5 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-fg-muted"
                      >
                        Ruolo
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3.5 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-fg-muted text-right"
                      >
                        Crediti
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3.5 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-fg-muted whitespace-nowrap"
                      >
                        Registrato il
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3.5 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-fg-muted text-right w-[1%]"
                      >
                        Azioni
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-14 text-center text-sm text-fg-muted">
                          Nessun utente trovato.
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => {
                        const isSelf = session?.user?.id === u.id;
                        const canDelete = u.role !== "ADMIN" && !isSelf;

                        return (
                          <tr
                            key={u.id}
                            className="border-b border-white/[0.04] last:border-0 transition-colors hover:bg-white/[0.02]"
                          >
                            <td className="px-4 py-3.5 text-sm font-medium text-fg">
                              {u.email ?? "—"}
                            </td>
                            <td className="px-4 py-3.5 text-sm text-fg-muted">{u.name ?? "—"}</td>
                            <td className="px-4 py-3.5 text-sm text-fg-muted whitespace-nowrap">
                              {formatAuthProvidersLabel(u.authProviders)}
                            </td>
                            <td className="px-4 py-3.5">
                              <span
                                className={
                                  u.role === "ADMIN"
                                    ? "inline-flex rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold tracking-wide text-amber-100/95"
                                    : "inline-flex rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-0.5 text-xs font-medium text-fg-muted"
                                }
                              >
                                {u.role}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-sm text-right font-numeric text-fg tabular-nums">
                              {u.credits}
                            </td>
                            <td className="px-4 py-3.5 text-sm text-fg-subtle font-numeric whitespace-nowrap tabular-nums">
                              {new Date(u.createdAt).toLocaleDateString("it-IT", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              {canDelete ? (
                                <button
                                  type="button"
                                  onClick={() => handleDelete(u)}
                                  disabled={deletingId === u.id}
                                  title="Elimina utente"
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 text-fg-muted transition-all hover:border-red-400/45 hover:bg-red-500/10 hover:text-red-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-admin-bg disabled:pointer-events-none disabled:opacity-40"
                                >
                                  {deletingId === u.id ? (
                                    <span className="h-4 w-4 animate-spin rounded-full border border-current border-t-transparent" />
                                  ) : (
                                    <TrashIcon />
                                  )}
                                  <span className="sr-only">Elimina {u.email}</span>
                                </button>
                              ) : (
                                <span className="text-xs text-fg-subtle tabular-nums">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {pagination.totalPages > 1 ? (
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  <p className="text-sm text-fg-muted tabular-nums">
                    Pagina {pagination.page} di {pagination.totalPages} · {pagination.total}{" "}
                    utenti
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className={`${ghostBtn} px-5 py-2.5`}
                    >
                      Indietro
                    </button>
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                      disabled={page >= pagination.totalPages}
                      className={`${ghostBtn} px-5 py-2.5`}
                    >
                      Avanti
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
