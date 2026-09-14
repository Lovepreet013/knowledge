import { useEffect, useState } from "react";
import { AlertBox, EmptyState, LoadingBlock, PageHeader, SharpButton, StatusBadge } from "../../../components/ui";
import api from "../../../lib/api";

interface CompanyUser {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
}

export default function UsersTab() {
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

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
    void loadUsers();
  }, []);

  const toggleActive = async (user: CompanyUser) => {
    setUpdatingId(user.id);
    setError("");
    try {
      await api.patch(`/companies/users/${user.id}/`, { is_active: !user.is_active });
      await loadUsers();
    } catch {
      setError("Failed to update user. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Company users"
        sub="Activate or deactivate members of your company only."
      />

      {error !== "" && <AlertBox>{error}</AlertBox>}
      {loading && <LoadingBlock label="Loading users…" />}

      {!loading && error === "" && users.length === 0 && (
        <EmptyState title="No users found" sub="Members appear here after registering with your invite code." />
      )}

      <ul className="grid gap-3">
        {users.map((u) => (
          <li
            key={u.id}
            className="rounded-lg border border-[#E0E0E0] bg-white p-4 transition hover:border-[#CCCCCC]"
          >
            <div className="flex items-center gap-4">
              <span
                aria-hidden="true"
                className="font-display grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#EDE9FE] text-sm font-medium text-[#7C3AED]"
              >
                {u.username.slice(0, 1).toUpperCase() || "?"}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-base font-medium tracking-[-0.02em] text-black">
                    {u.username} <span className="text-sm font-normal text-[#666666]">#{u.id}</span>
                  </p>
                  <span className="font-display rounded border border-[#E0E0E0] bg-[#F5F5F5] px-2 py-0.5 text-xs font-medium text-black">
                    {u.role}
                  </span>
                  <StatusBadge status={u.is_active ? "active" : "inactive"} />
                  <span className="ml-auto">
                    <SharpButton
                      variant="secondary"
                      size="sm"
                      onClick={() => void toggleActive(u)}
                      disabled={updatingId === u.id}
                    >
                      {updatingId === u.id ? "Saving…" : u.is_active ? "Deactivate" : "Activate"}
                    </SharpButton>
                  </span>
                </div>
                <p className="mt-1.5 truncate text-sm font-normal text-[#666666]">{u.email}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
