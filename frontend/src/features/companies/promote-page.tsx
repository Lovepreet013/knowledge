import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import AppShell from "../../components/app-shell";
import { AlertBox, PageHeader, SharpButton, inputCls, labelCls } from "../../components/ui";
import api from "../../lib/api";

export default function PromotePage() {
  const [userId, setUserId] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const reduceMotion = useReducedMotion();

  const handlePromote = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting || !userId.trim()) return;
    setError("");
    setResult("");
    setSubmitting(true);
    try {
      const res = await api.post(`/companies/promote/${userId.trim()}/`);
      setResult(`${res.data.username} is now ${res.data.role}`);
      setUserId("");
    } catch {
      setError("Failed to promote user. Check the user ID and your permissions.");
    } finally {
      setSubmitting(false);
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
          badge="Superadmin"
          title="Promote user"
          sub="Turn a company member into a company_admin by user ID."
        />

        <form onSubmit={handlePromote} className="max-w-md border-2 border-neutral-950 bg-white p-4 shadow-[5px_5px_0_#0a0a0b]">
          <label htmlFor="promote-user-id" className={labelCls}>
            User ID
          </label>
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <input
              id="promote-user-id"
              placeholder="e.g. 7"
              inputMode="numeric"
              required
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className={inputCls}
            />
            <SharpButton type="submit" disabled={submitting}>
              {submitting ? "Working…" : "Promote"}
            </SharpButton>
          </div>
          <p className="mt-2.5 text-[12px] font-medium text-neutral-500">
            Tip: find IDs in Django admin or ask the user to share theirs. Promotion is one-way.
          </p>
        </form>

        {result && <AlertBox tone="success">{result}</AlertBox>}
        {error && <AlertBox>{error}</AlertBox>}
      </motion.div>
    </AppShell>
  );
}
