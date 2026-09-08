import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import AppShell from "../../components/app-shell";
import { AlertBox, EmptyState, LoadingBlock, PageHeader, StatusBadge } from "../../components/ui";
import api from "../../lib/api";

interface CompanyUser {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
}

export default function CompanyUsersPage() {
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const reduceMotion = useReducedMotion();

  const loadUsers = async () => {
    try {
      const res = await api.get("/companies/users/");
      setUsers(res.data);
      setError("");
    } catch {
      setError("Failed to load users. You may not have permission.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const toggleActive = async (user: CompanyUser) => {
    setUpdatingId(user.id);
    try {
      await api.patch(`/companies/users/${user.id}/`, { is_active: !user.is_active });
      await loadUsers();
    } catch {
      alert("Failed to update user.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: reduceMotion ? 0 : 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="space-y-5"
      >
        <PageHeader
          badge="Company admin"
          title="Company users"
          sub="Activate or deactivate members of your company only."
        />

        {error && <AlertBox>{error}</AlertBox>}
        {loading && <LoadingBlock label="Loading users…" />}

        {!loading && error === "" && users.length === 0 && (
          <EmptyState title="No users found" sub="Members appear here after registering with your invite code." />
        )}

        <ul className="grid gap-3">
          {users.map((u) => (
            <li key={u.id} className="border-2 border-neutral-950 bg-white p-4 shadow-[5px_5px_0_#0a0a0b]">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[14.5px] font-extrabold tracking-[-0.01em]">
                  {u.username}{" "}
                  <span className="font-medium text-neutral-400">#{u.id}</span>
                </p>
                <span className="border-2 border-neutral-950 bg-neutral-100 px-1.5 py-0.5 text-[10.5px] font-extrabold tracking-[0.06em] uppercase">
                  {u.role}
                </span>
                <StatusBadge status={u.is_active ? "active" : "inactive"} />
                <button
                  type="button"
                  onClick={() => toggleActive(u)}
                  disabled={updatingId === u.id}
                  className="ml-auto border-2 border-neutral-950 bg-white px-2.5 py-1 text-[11px] font-extrabold tracking-[0.06em] uppercase shadow-[3px_3px_0_#0a0a0b] transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-neutral-950 hover:text-white disabled:opacity-60"
                >
                  {updatingId === u.id ? "Saving…" : u.is_active ? "Deactivate" : "Activate"}
                </button>
              </div>
              <p className="mt-1.5 truncate text-[12.5px] font-medium text-neutral-500">{u.email}</p>
            </li>
          ))}
        </ul>
      </motion.div>
    </AppShell>
  );
}
