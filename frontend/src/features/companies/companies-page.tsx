import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import AppShell from "../../components/app-shell";
import { AlertBox, EmptyState, LoadingBlock, PageHeader, SharpButton, inputCls, labelCls } from "../../components/ui";
import api from "../../lib/api";

interface Company {
  id: number;
  name: string;
  slug: string;
  invite_code: string;
  is_active: boolean;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const reduceMotion = useReducedMotion();

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
    loadCompanies();
  }, []);

  const handleCreate = async (e: React.SubmitEvent<HTMLFormElement>) => {
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
    if (!confirm("Delete this company? This deletes ALL its users, documents, and chats. This cannot be undone.")) return;
    try {
      await api.delete(`/companies/${id}/`);
      await loadCompanies();
    } catch {
      alert("Failed to delete company.");
    }
  };

  const copyInvite = async (c: Company) => {
    try {
      await navigator.clipboard.writeText(c.invite_code);
      setCopiedId(c.id);
      setTimeout(() => setCopiedId((v) => (v === c.id ? null : v)), 1500);
    } catch {
      alert("Copy failed. Select the code manually.");
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
        <PageHeader badge="Superadmin" title="Companies" sub="Create tenants and share invite codes." />

        <form onSubmit={handleCreate} className="border-2 border-neutral-950 bg-white p-4 shadow-[5px_5px_0_#0a0a0b]">
          <p className="text-[11.5px] font-extrabold tracking-[0.08em] uppercase">Create company</p>
          <div className="mt-2.5 grid gap-2.5 sm:grid-cols-[1fr_1fr_auto]">
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
              <SharpButton type="submit">Create</SharpButton>
            </div>
          </div>
        </form>

        {error && <AlertBox>{error}</AlertBox>}
        {loading && <LoadingBlock label="Loading companies…" />}

        {!loading && companies.length === 0 && (
          <EmptyState title="No companies yet" sub="Create your first tenant above." />
        )}

        <ul className="grid gap-3">
          {companies.map((c) => (
            <li key={c.id} className="border-2 border-neutral-950 bg-white p-4 shadow-[5px_5px_0_#0a0a0b]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[15px] font-extrabold tracking-[-0.02em]">
                  {c.name}{" "}
                  <span className="ml-1 border-2 border-neutral-950 bg-neutral-100 px-1.5 py-0.5 align-middle text-[10.5px] tracking-[0.06em] uppercase">
                    {c.slug}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => handleDeleteCompany(c.id)}
                  className="border-2 border-neutral-950 bg-white px-2.5 py-1 text-[11px] font-extrabold tracking-[0.06em] uppercase text-red-600 shadow-[3px_3px_0_#0a0a0b] transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-red-600 hover:text-white"
                >
                  Delete
                </button>
              </div>
              <div className="mt-2.5 flex flex-wrap items-center gap-2 border-2 border-neutral-950 bg-neutral-50 px-2.5 py-2">
                <span className="text-[11px] font-extrabold tracking-[0.08em] uppercase text-neutral-500">
                  Invite code
                </span>
                <code className="border-2 border-neutral-950 bg-[#FFD02F] px-2 py-0.5 text-[13px] font-extrabold tracking-[0.02em]">
                  {c.invite_code}
                </code>
                <button
                  type="button"
                  onClick={() => copyInvite(c)}
                  className="ml-auto border-2 border-neutral-950 bg-white px-2.5 py-1 text-[11px] font-extrabold tracking-[0.06em] uppercase shadow-[3px_3px_0_#0a0a0b] transition hover:bg-neutral-950 hover:text-white"
                >
                  {copiedId === c.id ? "Copied ✓" : "Copy"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </motion.div>
    </AppShell>
  );
}
