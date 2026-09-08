import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router";
import AppShell from "../../components/app-shell";
import { AlertBox, EmptyState, LoadingBlock, PageHeader, StatusBadge } from "../../components/ui";
import api from "../../lib/api";

interface Me {
  id: number;
  email: string;
  username: string;
  role: string;
  company: number | null;
  company_name?: string | null;
}

export default function DashboardPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState("");
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    api
      .get("/auth/me/")
      .then((res) => setMe(res.data))
      .catch(() => setError("Failed to load your profile."));
  }, []);

  const actions: { to: string; label: string; desc: string; show: boolean }[] = me
    ? [
        {
          to: "/documents",
          label: "Documents",
          desc: me.role === "company_admin" ? "Upload + manage PDFs" : "View documents",
          show: me.company !== null,
        },
        { to: "/chat", label: "Chat", desc: "Ask with sources", show: me.company !== null },
        { to: "/company-users", label: "Users", desc: "Activate team", show: me.role === "company_admin" },
        { to: "/companies", label: "Companies", desc: "Create + invites", show: me.role === "superadmin" },
        { to: "/promote", label: "Promote", desc: "Make admins", show: me.role === "superadmin" },
      ]
    : [];

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: reduceMotion ? 0 : 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="space-y-5"
      >
        <PageHeader
          badge="Dashboard"
          title={`Welcome, ${me?.username ?? "…"}`}
          sub={
            me?.role === "user"
              ? "Browse your company's documents and chat. Uploads are managed by your admin."
              : "Your workspace at a glance. Actions below respect your role."
          }
        />

        {error && <AlertBox>{error}</AlertBox>}

        {me === null && error === "" && <LoadingBlock label="Loading profile…" />}

        {me !== null && (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="border-2 border-neutral-950 bg-white p-4 shadow-[5px_5px_0_#0a0a0b]">
                <p className="text-[11px] font-extrabold tracking-[0.1em] uppercase text-neutral-500">Role</p>
                <p className="mt-1.5">
                  <StatusBadge status={me.role} />
                </p>
              </div>
              <div className="border-2 border-neutral-950 bg-white p-4 shadow-[5px_5px_0_#0a0a0b]">
                <p className="text-[11px] font-extrabold tracking-[0.1em] uppercase text-neutral-500">Company</p>
                <p className="mt-1.5 truncate text-lg font-extrabold tracking-[-0.02em]">
                  {me.company_name ?? (me.company !== null ? `ID ${me.company}` : "None")}
                </p>
              </div>
              <div className="border-2 border-neutral-950 bg-white p-4 shadow-[5px_5px_0_#0a0a0b]">
                <p className="text-[11px] font-extrabold tracking-[0.1em] uppercase text-neutral-500">Email</p>
                <p className="mt-1.5 truncate text-[13.5px] font-bold tracking-[-0.01em]">{me.email || "—"}</p>
              </div>
            </div>

            {me.company === null && (
              <AlertBox tone="info">
                {me.role === "superadmin"
                  ? "Superadmins have no company: manage everything from Companies + Promote."
                  : "You are not in a company yet — register again with a valid invite code."}
              </AlertBox>
            )}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {actions
                .filter((a) => a.show)
                .map((a) => (
                  <Link
                    key={a.to}
                    to={a.to}
                    className="group border-2 border-neutral-950 bg-white p-4 shadow-[5px_5px_0_#0a0a0b] transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0_#0a0a0b]"
                  >
                    <p className="text-[15px] font-extrabold tracking-[-0.02em] uppercase group-hover:bg-[#FFD02F] group-hover:inline-block">
                      {a.label} →
                    </p>
                    <p className="mt-1 text-[13px] font-medium text-neutral-500">{a.desc}</p>
                  </Link>
                ))}
            </div>

            {actions.filter((a) => a.show).length === 0 && (
              <EmptyState title="No actions available" sub="Ask your admin for access." />
            )}
          </>
        )}
      </motion.div>
    </AppShell>
  );
}
