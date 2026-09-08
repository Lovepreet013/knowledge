import { useEffect, useState } from "react";
import api from "../../lib/api";

interface Conversation {
  id: number;
  title: string;
  created_at: string;
}

interface Source {
  document_id: number;
  document_name: string;
}

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  created_at: string;
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const loadConversations = async () => {
    const res = await api.get("/conversations/");
    setConversations(res.data);
  };

  const loadMessages = async (conversationId: number) => {
    const res = await api.get(`/conversations/${conversationId}/messages/`);
    const normalized: Message[] = (res.data ?? []).map((m: Message) => ({
      ...m,
      sources: m.sources ?? [],
    }));
    setMessages(normalized);
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (activeId !== null) {
      loadMessages(activeId);
    }
  }, [activeId]);

  const handleNewConversation = async () => {
    const res = await api.post("/conversations/", { title: "New chat" });
    await loadConversations();
    setActiveId(res.data.id);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || activeId === null) return;

    setError("");
    setSending(true);

    // optimistically show the user's message right away
    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: input,
      sources: [],
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const res = await api.post(`/conversations/${activeId}/messages/`, {
        content: userMessage.content,
      });
      const assistantMessage: Message = {
        ...res.data,
        sources: res.data.sources ?? [],
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setError("Failed to get a response. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <div style={{ width: 220, borderRight: "1px solid #ccc", padding: 16 }}>
        <button onClick={handleNewConversation} style={{ marginBottom: 16, width: "100%" }}>
          + New Chat
        </button>
        {conversations.map((c) => (
          <div
            key={c.id}
            onClick={() => setActiveId(c.id)}
            style={{
              padding: 8,
              cursor: "pointer",
              background: activeId === c.id ? "#eee" : "transparent",
              borderRadius: 4,
              marginBottom: 4,
            }}
          >
            {c.title || `Conversation ${c.id}`}
          </div>
        ))}
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 16 }}>
        {activeId === null ? (
          <p>Select or start a conversation to begin.</p>
        ) : (
          <>
            <div style={{ flex: 1, overflowY: "auto", marginBottom: 16 }}>
              {messages.map((m) => (
                <div
                  key={m.id}
                  style={{
                    marginBottom: 16,
                    textAlign: m.role === "user" ? "right" : "left",
                  }}
                >
                  <div
                    style={{
                      display: "inline-block",
                      padding: "8px 12px",
                      borderRadius: 8,
                      background: m.role === "user" ? "#dbeafe" : "#f3f4f6",
                      maxWidth: "70%",
                      textAlign: "left",
                    }}
                  >
                    {m.content}
                  {(m.sources ?? []).length > 0 && (
                    <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                      Sources: {(m.sources ?? []).map((s) => s.document_name).join(", ")}
                    </div>
                  )}
                  </div>
                </div>
              ))}
              {sending && <p style={{ color: "#888" }}>Thinking...</p>}
            </div>

            <form onSubmit={handleSend} style={{ display: "flex", gap: 8 }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question about your company documents..."
                style={{ flex: 1, padding: 8 }}
                disabled={sending}
              />
              <button type="submit" disabled={sending}>
                Send
              </button>
            </form>
            {error && <p style={{ color: "red" }}>{error}</p>}
          </>
        )}
      </div>
    </div>
  );
}