import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Download,
  EllipsisVertical,
  FileText,
  FileUp,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import {
  AlertBox,
  EmptyState,
  LoadingBlock,
  SharpButton,
  StatusBadge,
} from "../../../components/ui";
import api from "../../../lib/api";

interface Document {
  id: number;
  file: string;
  file_type: string;
  status: string;
  error_message: string | null;
  created_at: string;
}

type FileFilter = "all" | "pdf" | "txt";
type SortKey = "newest" | "oldest" | "name";

function baseName(path: string): string {
  return path.split("/").pop() ?? path;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function fileUrl(raw: string): string {
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  const base = (api.defaults.baseURL ?? "http://localhost:8000/api").replace(
    /\/api\/?$/,
    "",
  );
  return `${base}${raw.startsWith("/") ? raw : `/${raw}`}`;
}

function firstApiError(err: unknown, fallback: string): string {
  const data = (err as { response?: { data?: unknown } }).response?.data as
    | Record<string, string[]>
    | undefined;
  const first = data ? (Object.values(data)[0] as string[])?.[0] : null;
  return first || fallback;
}

export default function DocumentsTab({ canManage }: { canManage: boolean }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [fileFilter, setFileFilter] = useState<FileFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (openMenuId === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenuId(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openMenuId]);

  const uploadFiles = async (list: File[]) => {
    if (list.length === 0 || uploading) return;
    setError("");
    setUploading(true);
    try {
      for (const f of list) {
        const extension = f.name.split(".").pop()?.toLowerCase();
        if (extension !== "pdf" && extension !== "txt") {
          setError(`Only PDF and TXT files are supported. Skipped ${f.name}.`);
          continue;
        }
        const formData = new FormData();
        formData.append("file", f);
        formData.append("file_type", extension);
        try {
          await api.post("/documents/", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } catch (err: unknown) {
          setError(firstApiError(err, `Upload failed for ${f.name}.`));
        }
      }
      await loadDocuments();
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    void uploadFiles(files);
  };

  const handleDelete = async (id: number) => {
    setDeleteError("");
    try {
      await api.delete(`/documents/${id}/`);
      setConfirmDeleteId(null);
      setOpenMenuId(null);
      await loadDocuments();
    } catch {
      setDeleteError("Failed to delete. You may not have permission.");
    }
  };

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = documents
    .filter((d) => {
      if (fileFilter !== "all" && d.file_type.toLowerCase() !== fileFilter)
        return false;
      if (normalizedQuery === "") return true;
      return baseName(d.file).toLowerCase().includes(normalizedQuery);
    })
    .sort((a, b) => {
      if (sortKey === "name")
        return baseName(a.file).localeCompare(baseName(b.file));
      const ta = new Date(a.created_at).getTime();
      const tb = new Date(b.created_at).getTime();
      return sortKey === "newest" ? tb - ta : ta - tb;
    });

  return (
    <div className="space-y-6">
      <div>
        <p className="font-display inline-flex items-center gap-2 rounded-lg bg-[#FFB3B3]/40 px-2 py-0.5 text-sm leading-[18.2px] font-medium text-[#972121]">
          <FileText className="h-4 w-4" aria-hidden="true" />
          Documents
        </p>
        <div className="mt-4">
          <h1 className="font-display text-[32px] leading-[36px] font-medium tracking-[-0.03em] text-black sm:text-[40px] sm:leading-[44px]">
            Company documents
          </h1>
          <p className="mt-3 max-w-xl text-base leading-[23.2px] font-normal text-[#666666]">
            Upload PDFs/TXTs. They chunk and embed automatically for
            tenant-isolated search.
          </p>
        </div>
      </div>

      {canManage && (
        <div
          role="region"
          aria-label="Upload documents dropzone"
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            void uploadFiles(Array.from(e.dataTransfer.files ?? []));
          }}
          className={`rounded-xl border border-dashed p-6 text-center transition sm:p-8 ${dragging
              ? "border-[#972121] bg-[#FFB3B3]/20"
              : "border-[#FFB3B3] bg-[#FFB3B3]/10"
            }`}
        >
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#FFB3B3]/40">
            <FileUp className="h-6 w-6 text-[#972121]" aria-hidden="true" />
          </div>
          <p className="font-display mt-4 text-base font-medium tracking-[-0.02em] text-black">
            Upload documents
          </p>
          <p className="mt-2 text-sm leading-5 font-normal text-[#666666]">
            Drag and drop PDF or TXT files here, or choose a file.
          </p>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex min-h-[46px] cursor-pointer items-center gap-2 rounded-lg bg-black px-[22px] py-3 text-base leading-[18.4px] font-normal text-white transition hover:opacity-85 active:bg-[#1A1A1A] disabled:cursor-not-allowed disabled:bg-[#CCCCCC] disabled:text-[#999999] disabled:hover:opacity-100"
            >
              <Upload className="h-4 w-4" aria-hidden="true" />
              {uploading ? "Uploading…" : "Choose file"}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt"
            multiple
            onChange={handleInputChange}
            aria-label="Choose PDF or TXT files"
            className="hidden"
          />
          <p className="mt-4 text-sm leading-5 font-normal text-[#666666]">
            PDF / TXT only • Files are automatically chunked and embedded.
          </p>
        </div>
      )}

      {error !== "" && <AlertBox>{error}</AlertBox>}
      {deleteError !== "" && <AlertBox>{deleteError}</AlertBox>}

      <div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-[#666666]"
              aria-hidden="true"
            />
            <label htmlFor="doc-search" className="sr-only">
              Search documents
            </label>
            <input
              id="doc-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search documents…"
              autoComplete="off"
              className="min-h-[44px] w-full rounded-lg border border-[#CCCCCC] bg-white pr-4 pl-11 text-base leading-[23.2px] font-normal text-black transition placeholder:text-[#999999] hover:border-[#999999] focus:border-black focus:shadow-none focus:outline-none"
            />
          </div>
          <div className="relative shrink-0">
            <label htmlFor="doc-filter" className="sr-only">
              Filter by file type
            </label>
            <select
              id="doc-filter"
              value={fileFilter}
              onChange={(e) => setFileFilter(e.target.value as FileFilter)}
              className="min-h-[44px] w-full cursor-pointer appearance-none rounded-lg border border-[#CCCCCC] bg-white pr-10 pl-4 text-base leading-[23.2px] font-normal text-black transition hover:border-[#999999] focus:border-black focus:shadow-none focus:outline-none sm:w-auto"
            >
              <option value="all">All files</option>
              <option value="pdf">PDFs only</option>
              <option value="txt">TXTs only</option>
            </select>
            <ChevronDown
              className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-black"
              aria-hidden="true"
            />
          </div>
          <div className="flex shrink-0 items-center gap-4">
            <div className="relative">
              <select
                id="doc-sort"
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="min-h-[44px] cursor-pointer appearance-none rounded-lg border border-[#CCCCCC] bg-white pr-10 pl-4 text-base leading-[23.2px] font-normal text-black transition hover:border-[#999999] focus:border-black focus:shadow-none focus:outline-none"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="name">Name A–Z</option>
              </select>
              <ChevronDown
                className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-black"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
        <p className="sr-only" aria-live="polite">
          Uploaded documents: {filtered.length} available for search and chat.
        </p>

        {loading && (
          <div className="mt-4">
            <LoadingBlock label="Loading documents…" />
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="mt-4">
            <EmptyState
              title={
                documents.length === 0
                  ? "No documents yet"
                  : "No documents match your search"
              }
              sub={
                documents.length === 0
                  ? canManage
                    ? "Upload your first PDF or TXT above."
                    : "Ask your admin to upload documents."
                  : "Try a different search or filter."
              }
            />
          </div>
        )}

        <ul className="mt-4 grid gap-3">
          {filtered.map((doc) => {
            const name = baseName(doc.file);
            const menuOpen = openMenuId === doc.id;
            const confirming = confirmDeleteId === doc.id;
            return (
              <li
                key={doc.id}
                className="rounded-lg border border-[#E0E0E0] bg-white p-4 transition hover:border-[#CCCCCC]"
              >
                <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                  <span
                    aria-hidden="true"
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#FFB3B3]/30"
                  >
                    <FileText className="h-5 w-5 text-[#972121]" />
                  </span>
                  <div className="min-w-0 flex-1 basis-48">
                    <p
                      title={name}
                      className="truncate text-base font-medium tracking-[-0.02em] text-black"
                    >
                      {name}
                    </p>
                    <p className="mt-1 truncate text-sm leading-5 font-normal text-[#666666]">
                      {formatDate(doc.created_at)}
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-2">
                    <span className="font-display rounded border border-[#E0E0E0] bg-[#F5F5F5] px-2 py-0.5 text-xs leading-4 font-medium uppercase text-black">
                      {doc.file_type}
                    </span>
                    <StatusBadge status={doc.status} />
                  </span>
                  {canManage &&
                    (confirming ? (
                      <span className="ml-auto inline-flex flex-wrap items-center gap-2">
                        <span className="text-sm font-normal text-[#666666]">
                          Delete this document?
                        </span>
                        <SharpButton
                          variant="danger"
                          size="sm"
                          onClick={() => void handleDelete(doc.id)}
                        >
                          Confirm
                        </SharpButton>
                        <SharpButton
                          variant="secondary"
                          size="sm"
                          onClick={() => setConfirmDeleteId(null)}
                        >
                          Keep
                        </SharpButton>
                      </span>
                    ) : (
                      <span className="ml-auto inline-flex shrink-0 items-center gap-4">
                        <span className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenMenuId(menuOpen ? null : doc.id)
                            }
                            aria-haspopup="menu"
                            aria-expanded={menuOpen}
                            aria-label={`More actions for ${name}`}
                            title="More actions"
                            className="grid h-11 w-11 cursor-pointer place-items-center rounded-lg text-black transition hover:bg-[#F5F5F5]"
                          >
                            <EllipsisVertical
                              className="h-5 w-5"
                              aria-hidden="true"
                            />
                          </button>
                          {menuOpen && (
                            <>
                              <button
                                type="button"
                                aria-hidden="true"
                                tabIndex={-1}
                                onClick={() => setOpenMenuId(null)}
                                className="fixed inset-0 z-20 cursor-default bg-transparent"
                              />
                              <span
                                role="menu"
                                aria-label={`Actions for ${name}`}
                                className="absolute top-[calc(100%+8px)] right-0 z-30 w-48 rounded-lg border border-[#E0E0E0] bg-white py-2 shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
                              >
                                <a
                                  role="menuitem"
                                  href={fileUrl(doc.file)}
                                  download={name}
                                  onClick={() => setOpenMenuId(null)}
                                  className="flex min-h-[44px] w-full items-center gap-3 px-4 py-3 text-left text-base leading-[23.2px] font-normal text-black transition hover:bg-[#F5F5F5]"
                                >
                                  <Download
                                    className="h-4 w-4 shrink-0"
                                    aria-hidden="true"
                                  />
                                  Download
                                </a>
                                <button
                                  type="button"
                                  role="menuitem"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    setDeleteError("");
                                    setConfirmDeleteId(doc.id);
                                  }}
                                  className="flex min-h-[44px] w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-base leading-[23.2px] font-normal text-[#972121] transition hover:bg-[#F5F5F5]"
                                >
                                  <Trash2
                                    className="h-4 w-4 shrink-0"
                                    aria-hidden="true"
                                  />
                                  Delete
                                </button>
                              </span>
                            </>
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteError("");
                            setConfirmDeleteId(doc.id);
                          }}
                          aria-label={`Delete ${name}`}
                          className="inline-flex min-h-[40px] cursor-pointer items-center gap-2 rounded-lg border border-[#972121] bg-white px-4 py-2 text-sm leading-[18.4px] font-normal text-[#972121] transition hover:bg-[#972121]/5"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                          Delete
                        </button>
                      </span>
                    ))}
                </div>
                {doc.error_message && (
                  <p className="mt-3 rounded-lg border border-[#972121] px-3 py-2 text-sm font-normal text-[#972121]">
                    {doc.error_message}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
