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
  // Client-only: ephemeral upload preview for the optimistic user bubble.
  // Never comes from the backend (attachments aren't stored); lost on reload,
  // where the assistant's source pill remains the persisted record.
  attachmentPreview?: {
    name: string;
    url?: string;
    kind: "image" | "file";
  };
}
