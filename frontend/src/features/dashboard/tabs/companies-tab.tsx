import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";
import { AlertBox, EmptyState, LoadingBlock, PageHeader, SharpButton, inputCls, labelCls } from "../../../components/ui";
import api from "../../../lib/api";

interface Company {
  id: number;
  name: string;
  slug: string;
  invite_code: string;
  is_active: boolean;
}

export default function CompaniesTab() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const loadCompanies = async () => {
    try {
      const res = await api.get("/companies/");
      setCompanies(res.data);
    } catch {
      setError("Failed to load companies.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCompanies();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/companies/", { name, slug });
      setName("");
      setSlug("");
      await loadCompanies();
    } catch (err: unknown) {
      const data = (err as { response?: { data?: unknown } }).response?.data as
        | Record<string, string[]>
        | undefined;
      const firstError = data ? (Object.values(data)[0] as string[])?.[0] : null;
      setError(firstError || "Failed to create company.");
    }
  };

  const handleDeleteCompany = async (id: number) => {
    setError("");
    try {
      await api.delete(`/companies/${id}/`);
      setConfirmDeleteId(null);
      await loadCompanies();
    } catch {
      setError("Failed to delete company.");
    }
  };

  const copyInvite = async (c: Company) => {
    try {
      await navigator.clipboard.writeText(c.invite_code);
      setCopiedId(c.id);
      setTimeout(() => setCopiedId((v) => (v === c.id ? null : v)), 1500);
    } catch {
      setError("Copy failed. Select the code manually.");
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Companies" sub="Create tenants and share invite codes." />

      <form onSubmit={handleCreate} className="rounded-lg border border-[#E0E0E0] bg-white p-6">
        <p className="font-display text-base font-medium tracking-[-0.02em] text-black">
          Create company
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
          <div>
            <label htmlFor="company-name" className={labelCls}>
              Name
            </label>
            <input
              id="company-name"
              placeholder="Acme Corp"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="company-slug" className={labelCls}>
              Slug
            </label>
            <input
              id="company-slug"
              placeholder="acme"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="flex items-end">
            <SharpButton type="submit" size="sm">
              Create
            </SharpButton>
          </div>
        </div>
      </form>

      {error !== "" && <AlertBox>{error}</AlertBox>}
      {loading && <LoadingBlock label="Loading companies…" />}

      {!loading && companies.length === 0 && (
        <EmptyState title="No companies yet" sub="Create your first tenant above." />
      )}

      <ul className="grid gap-3">
        {companies.map((c) => (
          <li
            key={c.id}
            className="rounded-lg border border-[#E0E0E0] bg-white p-4 transition hover:border-[#CCCCCC]"
          >
            <div className="flex gap-4">
              <span
                aria-hidden="true"
                className="mt-1 grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#EDE9FE] text-[#7C3AED]"
              >
                <Building2 className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-base font-medium tracking-[-0.02em] text-black">{c.name}</p>
                  <span className="font-display rounded border border-[#E0E0E0] bg-[#F5F5F5] px-2 py-0.5 text-xs font-medium uppercase text-black">
                    {c.slug}
                  </span>
                  {confirmDeleteId === c.id ? (
                    <span className="ml-auto inline-flex flex-wrap items-center gap-2">
                      <span className="text-sm font-normal text-[#666666]">
                        Delete all users, documents, and chats?
                      </span>
                      <SharpButton variant="danger" size="sm" onClick={() => void handleDeleteCompany(c.id)}>
                        Confirm
                      </SharpButton>
                      <SharpButton variant="secondary" size="sm" onClick={() => setConfirmDeleteId(null)}>
                        Keep
                      </SharpButton>
                    </span>
                  ) : (
                    <span className="ml-auto">
                      <SharpButton
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          setError("");
                          setConfirmDeleteId(c.id);
                        }}
                      >
                        Delete
                      </SharpButton>
                    </span>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-[#F5F5F5] px-3 py-2">
                  <span className="font-display text-xs font-medium text-[#666666]">Invite code</span>
                  <span className="rounded-lg border border-[#E0E0E0] bg-white px-2 py-0.5 text-sm font-medium text-black">
                    {c.invite_code}
                  </span>
                  <span className="ml-auto">
                    <SharpButton variant="secondary" size="sm" onClick={() => void copyInvite(c)}>
                      {copiedId === c.id ? "Copied" : "Copy"}
                    </SharpButton>
                  </span>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
