import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { AlertBox, EmptyState, LoadingBlock, PageHeader, SharpButton } from "../../../components/ui";
import api from "../../../lib/api";

interface DirectoryUser {
  id: number;
  username: string;
  email: string;
  role: string;
  company: number | null;
  company_name?: string | null;
  is_active: boolean;
}

function roleLabel(role: string): string {
  if (role === "company_admin") return "Admin";
  if (role === "superadmin") return "Superadmin";
  return "Member";
}

export default function PromoteTab() {
  const [users, setUsers] = useState<DirectoryUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [promotingId, setPromotingId] = useState<number | null>(null);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const loadUsers = async () => {
    try {
      const res = await api.get("/companies/all-users/");
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

  const handlePromote = async (u: DirectoryUser) => {
    if (promotingId !== null) return;
    setPromotingId(u.id);
    setError("");
    setResult("");
    try {
      const res = await api.post(`/companies/promote/${u.id}/`);
      setResult(`${res.data.username} is now ${res.data.role}.`);
      await loadUsers();
    } catch {
      setError(`Failed to promote ${u.username}. Please try again.`);
    } finally {
      setPromotingId(null);
    }
  };

  const normalizedQuery = query.trim().toLowerCase();
  const visible =
    normalizedQuery === ""
      ? users
      : users.filter((u) =>
          [u.username, u.email, u.company_name ?? "", `#${u.id}`]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery),
        );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Promote users"
        sub="Find any member across all companies and make them a company admin."
      />

      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-[#666666]"
          aria-hidden="true"
        />
        <label htmlFor="promote-search" className="sr-only">
          Search users
        </label>
        <input
          id="promote-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email, or company…"
          autoComplete="off"
          className="min-h-[44px] w-full rounded-lg border border-[#CCCCCC] bg-white pr-4 pl-11 text-base leading-[23.2px] font-normal text-black transition placeholder:text-[#999999] hover:border-[#999999] focus:border-black focus:shadow-none focus:outline-none"
        />
      </div>

      {result !== "" && <AlertBox tone="success">{result}</AlertBox>}
      {error !== "" && <AlertBox>{error}</AlertBox>}
      {loading && <LoadingBlock label="Loading users…" />}

      {!loading && error === "" && visible.length === 0 && (
        <EmptyState
          title={users.length === 0 ? "No users yet" : "No users match your search"}
          sub={
            users.length === 0
              ? "Members appear here after registering with an invite code."
              : "Try a different search."
          }
        />
      )}

      <ul className="grid gap-3">
        {visible.map((u) => (
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
                  <p className="truncate text-base font-medium tracking-[-0.02em] text-black">
                    {u.username}{" "}
                    <span className="text-sm font-normal text-[#666666]">#{u.id}</span>
                  </p>
                  <span className="font-display rounded border border-[#E0E0E0] bg-[#F5F5F5] px-2 py-0.5 text-xs font-medium text-black">
                    {u.company_name ?? "No company"}
                  </span>
                  <span className="ml-auto inline-flex items-center gap-2">
                    <span className="font-display rounded border border-[#E0E0E0] bg-[#F5F5F5] px-2 py-0.5 text-xs font-medium uppercase text-black">
                      {u.role}
                    </span>
                    {u.role === "user" ? (
                      <SharpButton
                        size="sm"
                        variant="secondary"
                        disabled={promotingId !== null}
                        onClick={() => void handlePromote(u)}
                      >
                        {promotingId === u.id ? "Working…" : "Promote"}
                      </SharpButton>
                    ) : (
                      <span className="px-2 py-0.5 text-sm font-normal text-[#666666]">
                        {roleLabel(u.role)}
                      </span>
                    )}
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
