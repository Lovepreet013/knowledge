import { useEffect, useState } from "react";
import { AlertBox, EmptyState, LoadingBlock, PageHeader, SharpButton, StatusBadge } from "../../../components/ui";
import api from "../../../lib/api";

interface Document {
  id: number;
  file: string;
  file_type: string;
  status: string;
  error_message: string | null;
  created_at: string;
}

export default function DocumentsTab({ canManage }: { canManage: boolean }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState("");

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
    void loadDocuments();
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
    setDeleteError("");
    try {
      await api.delete(`/documents/${id}/`);
      setConfirmDeleteId(null);
      await loadDocuments();
    } catch {
      setDeleteError("Failed to delete. You may not have permission.");
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        badge="Documents"
        title="Company documents"
        sub={canManage ? "Upload PDFs/TXTs. They chunk + embed automatically." : "Browse your company's knowledge base."}
      />

      {canManage && (
        <form onSubmit={handleUpload} className="rounded-lg border border-[#E0E0E0] bg-white p-6">
          <p className="font-display text-base font-medium tracking-[-0.02em] text-black">
            Upload documents
          </p>
          <p className="mt-1 text-sm font-normal text-[#666666]">PDF / TXT only.</p>
          <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
            <input
              type="file"
              accept=".pdf,.txt"
              aria-label="Choose a PDF or TXT file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="min-h-[44px] w-full flex-1 cursor-pointer rounded-lg border border-[#CCCCCC] bg-white px-4 py-2.5 text-sm font-normal text-black transition hover:border-[#999999] focus:border-black focus:shadow-none focus:outline-none file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-black file:px-4 file:py-2 file:text-sm file:text-white hover:file:opacity-85"
            />
            <SharpButton type="submit" size="sm" disabled={uploading}>
              {uploading ? "Uploading…" : "Upload"}
            </SharpButton>
          </div>
        </form>
      )}

      {error !== "" && <AlertBox>{error}</AlertBox>}
      {deleteError !== "" && <AlertBox>{deleteError}</AlertBox>}
      {loading && <LoadingBlock label="Loading documents…" />}

      {!loading && documents.length === 0 && (
        <EmptyState
          title="No documents yet"
          sub={canManage ? "Upload your first PDF or TXT above." : "Ask your admin to upload documents."}
        />
      )}

      <ul className="grid gap-3">
        {documents.map((doc) => (
          <li
            key={doc.id}
            className="rounded-lg border border-[#E0E0E0] bg-white p-4 transition hover:border-[#CCCCCC]"
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-base font-medium tracking-[-0.02em] text-black">
                {doc.file.split("/").pop()}
              </p>
              <span className="font-display rounded border border-[#E0E0E0] bg-[#F5F5F5] px-2 py-0.5 text-xs font-medium uppercase text-black">
                {doc.file_type}
              </span>
              {(canManage || doc.status !== "ready") && <StatusBadge status={doc.status} />}
            </div>
            {doc.error_message && (
              <p className="mt-2 rounded-lg border border-[#972121] px-3 py-2 text-sm font-normal text-[#972121]">
                {doc.error_message}
              </p>
            )}
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <span className="text-sm font-normal text-[#666666]">
                {new Date(doc.created_at).toLocaleString()}
              </span>
              {canManage &&
                (confirmDeleteId === doc.id ? (
                  <span className="ml-auto inline-flex flex-wrap items-center gap-2">
                    <span className="text-sm font-normal text-[#666666]">Delete this document?</span>
                    <SharpButton variant="danger" size="sm" onClick={() => void handleDelete(doc.id)}>
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
                        setDeleteError("");
                        setConfirmDeleteId(doc.id);
                      }}
                    >
                      Delete
                    </SharpButton>
                  </span>
                ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
