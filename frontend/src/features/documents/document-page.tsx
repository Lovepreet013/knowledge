import { useEffect, useState } from "react";
import api from "../../lib/api";

interface Document {
  id: number;
  file: string;
  file_type: string;
  status: string;
  error_message: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: "gray",
  processing: "orange",
  ready: "green",
  failed: "red",
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const loadDocuments = async () => {
    const res = await api.get("/documents/");
    setDocuments(res.data);
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Please select a file first.");
      return;
    }

    // infer file_type from the extension
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
      loadDocuments();
    } catch (err: any) {
      const data = err.response?.data;
      const firstError = data ? (Object.values(data)[0] as string[])?.[0] : null;
      setError(firstError || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "40px auto" }}>
      <h2>Documents</h2>

      <form onSubmit={handleUpload} style={{ marginBottom: 24 }}>
        <input
          type="file"
          accept=".pdf,.txt"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          style={{ display: "block", marginBottom: 8 }}
        />
        <button type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload"}
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {documents.map((doc) => (
          <li
            key={doc.id}
            style={{ marginBottom: 12, borderBottom: "1px solid #ccc", paddingBottom: 8 }}
          >
            <strong>{doc.file.split("/").pop()}</strong> ({doc.file_type})
            <br />
            Status:{" "}
            <span style={{ color: statusColors[doc.status], fontWeight: "bold" }}>
              {doc.status}
            </span>
            {doc.error_message && (
              <p style={{ color: "red", fontSize: 12 }}>{doc.error_message}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}