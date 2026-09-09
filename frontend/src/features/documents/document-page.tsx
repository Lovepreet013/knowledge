import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import AppShell from "../../components/app-shell";
import { AlertBox, EmptyState, LoadingBlock, PageHeader, SharpButton, StatusBadge } from "../../components/ui";
import api from "../../lib/api";

interface Document {
  id: number;
  file: string;
  file_type: string;
  status: string;
  error_message: string | null;
  created_at: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [role, setRole] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  const loadDocuments = async () => {
    try {
      const res = await api.get("/documents/");
      setDocuments(res.data);
    } catch {
      setError("Failed to load documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api
      .get("/auth/me/")
      .then((res) => setRole(res.data.role))
      .catch(() => setRole(null));
    loadDocuments();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Please select a file first.");
      return;
    }

    const extension = file.name.split(".").pop()?.toLowerCase();
    if (extension !== "pdf" && extension !== "txt") {
      setError("Only PDF and TXT files are supported right now.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("file_type", extension);

    setUploading(true);
    try {
      await api.post("/documents/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFile(null);
      (e.currentTarget as HTMLFormElement).reset();
      await loadDocuments();
    } catch (err: unknown) {
      const data = (err as { response?: { data?: unknown } }).response?.data as
        | Record<string, string[]>
        | undefined;
      const firstError = data ? (Object.values(data)[0] as string[])?.[0] : null;
      setError(firstError || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this document? This cannot be undone.")) return;
    try {
      await api.delete(`/documents/${id}/`);
      await loadDocuments();
    } catch {
      alert("Failed to delete. You may not have permission.");
    }
  };

  const canManage = role === "company_admin";

  return (
    <AppShell>
      <motion.div
        className="space-y-5"
      >
        <PageHeader
          badge="Documents"
          title="Company documents"
          sub={canManage ? "Upload PDFs/TXTs. They chunk + embed automatically." : "Browse your company's knowledge base."}
        />

        {canManage && (
          <form onSubmit={handleUpload} className="border-2 border-neutral-950 bg-white p-4 shadow-[5px_5px_0_#0a0a0b]">
            <p className="text-[11.5px] font-extrabold tracking-[0.08em] uppercase">Upload — PDF / TXT only</p>
            <div className="mt-2.5 flex flex-col gap-2.5 sm:flex-row">
              <input
                type="file"
                accept=".pdf,.txt"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="flex-1 border-2 border-neutral-950 bg-neutral-50 px-3 py-2 text-[13px] font-medium file:mr-3 file:border-2 file:border-neutral-950 file:bg-[#FFD02F] file:px-2.5 file:py-1 file:text-[11px] file:font-extrabold file:tracking-[0.06em] file:uppercase"
              />
              <SharpButton type="submit" disabled={uploading}>
                {uploading ? "Uploading…" : "Upload"}
              </SharpButton>
            </div>
          </form>
        )}

        {error && <AlertBox>{error}</AlertBox>}
        {loading && <LoadingBlock label="Loading documents…" />}

        {!loading && documents.length === 0 && (
          <EmptyState title="No documents yet" sub={canManage ? "Upload your first PDF or TXT above." : "Ask your admin to upload documents."} />
        )}

        <ul className="grid gap-3">
          {documents.map((doc) => (
            <li key={doc.id} className="border-2 border-neutral-950 bg-white p-4 shadow-[5px_5px_0_#0a0a0b]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[14px] font-extrabold tracking-[-0.01em]">
                  {doc.file.split("/").pop()}{" "}
                  <span className="ml-1 border-2 border-neutral-950 bg-neutral-100 px-1.5 py-0.5 align-middle text-[10.5px] tracking-[0.06em] uppercase">
                    {doc.file_type}
                  </span>
                </p>
                {(canManage || doc.status !== "ready") && <StatusBadge status={doc.status} />}
              </div>
              {doc.error_message && (
                <p className="mt-2 border-2 border-neutral-950 bg-red-50 px-2.5 py-1.5 text-[12px] font-bold text-red-700">
                  {doc.error_message}
                </p>
              )}
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <span className="text-[11.5px] font-medium text-neutral-400">
                  {new Date(doc.created_at).toLocaleString()}
                </span>
                {canManage && (
                  <button
                    type="button"
                    onClick={() => handleDelete(doc.id)}
                    className="ml-auto border-2 border-neutral-950 bg-white px-2.5 py-1 text-[11px] font-extrabold tracking-[0.06em] uppercase text-red-600 shadow-[3px_3px_0_#0a0a0b] transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-red-600 hover:text-white"
                  >
                    Delete
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </motion.div>
    </AppShell>
  );
}
