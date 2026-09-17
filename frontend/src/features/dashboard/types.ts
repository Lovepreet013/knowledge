export interface Me {
  id: number;
  email: string;
  username: string;
  role: string;
  company: number | null;
  company_name?: string | null;
}

export interface Conversation {
  id: number;
  title: string;
  created_at: string;
}

export interface Source {
  document_id: number | null;
  document_name: string;
  origin?: "company" | "attachment";
}

export interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  created_at: string;
  // Persisted attachment (backend MEDIA_ROOT): the little thumbnail / file
  // pill that remains on reload + is reused for follow-up questions.
  // `attachment` / `attachment_thumbnail` are relative URLs (e.g.
  // "/media/chat_attachments/2026/09/report.pdf"); resolve via fileUrl().
  attachment?: string | null;
  attachment_thumbnail?: string | null;
  attachment_name?: string;
  attachment_kind?: string;
  // Client-only: optimistic upload preview for the just-sent user bubble.
  // Shown immediately via blob URL; on reload the persisted fields above
  // take over (preview is never returned by the backend).
  attachmentPreview?: {
    name: string;
    url?: string;
    kind: "image" | "file";
  };
}
