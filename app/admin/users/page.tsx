"use client";

import { useState, useEffect } from "react";

interface UserRow {
  id: string;
  email: string;
  name: string | null;
  role: string;
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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 30,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "30",
      });
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error("Errore caricamento");
      const data: UsersResponse = await res.json();
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-bg text-fg p-6 md:p-8">
      <h1 className="text-2xl font-bold text-fg mb-2">
        Utenti
      </h1>
      <p className="text-fg-muted mb-6">
        Elenco utenti registrati (email, nome, ruolo, crediti).
      </p>

      <form onSubmit={handleSearch} className="mb-6 flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Cerca per email o nome..."
          className="px-4 py-2.5 border border-border dark:border-white/10 rounded-xl bg-white/5 text-fg placeholder:text-fg-subtle min-w-[200px] max-w-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
        />
        <button
          type="submit"
          className="px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-hover font-medium transition-colors"
        >
          Cerca
        </button>
        {search && (
          <button
            type="button"
            onClick={() => {
              setSearchInput("");
              setSearch("");
              setPage(1);
            }}
            className="px-4 py-2.5 text-fg-muted hover:text-primary transition-colors"
          >
            Cancella filtro
          </button>
        )}
      </form>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto card-raised rounded-2xl">
            <table className="min-w-full divide-y divide-border dark:divide-white/10">
              <thead className="bg-surface/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-fg-muted uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-fg-muted uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-fg-muted uppercase tracking-wider">
                    Ruolo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-fg-muted uppercase tracking-wider">
                    Crediti
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-fg-muted uppercase tracking-wider">
                    Registrato il
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-white/10">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-fg-muted">
                      Nessun utente trovato.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-surface/30 transition-colors">
                      <td className="px-4 py-3 text-sm text-fg font-medium">
                        {u.email}
                      </td>
                      <td className="px-4 py-3 text-sm text-fg-muted">
                        {u.name ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full ${
                            u.role === "ADMIN"
                              ? "bg-warning/10 text-warning"
                              : "bg-surface text-fg-muted"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-fg font-numeric">
                        {u.credits}
                      </td>
                      <td className="px-4 py-3 text-sm text-fg-subtle font-numeric">
                        {new Date(u.createdAt).toLocaleDateString("it-IT", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-fg-muted">
                Pagina <span className="font-numeric">{pagination.page}</span> di <span className="font-numeric">{pagination.totalPages}</span> · <span className="font-numeric">{pagination.total}</span> utenti
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-4 py-2 border border-border dark:border-white/10 rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-surface/80 transition-colors text-fg"
                >
                  Indietro
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page >= pagination.totalPages}
                  className="px-4 py-2 border border-border dark:border-white/10 rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-surface/80 transition-colors text-fg"
                >
                  Avanti
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
