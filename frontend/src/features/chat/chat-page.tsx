import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import AppShell from "../../components/app-shell";
import { AlertBox, EmptyState, LoadingBlock, PageHeader, SharpButton } from "../../components/ui";
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
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const reduceMotion = useReducedMotion();
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadConversations = async () => {
    try {
      const res = await api.get("/conversations/");
      setConversations(res.data);
    } catch {
      setError("Failed to load conversations.");
    } finally {
      setLoadingConvos(false);
    }
  };

  const loadMessages = async (conversationId: number) => {
    setLoadingMsgs(true);
    try {
      const res = await api.get(`/conversations/${conversationId}/messages/`);
      const normalized: Message[] = (res.data ?? []).map((m: Message) => ({
        ...m,
        sources: m.sources ?? [],
      }));
      setMessages(normalized);
    } catch {
      setError("Failed to load messages.");
    } finally {
      setLoadingMsgs(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (activeId !== null) {
      loadMessages(activeId);
    } else {
      setMessages([]);
    }
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  }, [messages, sending, reduceMotion]);

  const handleNewConversation = async () => {
    try {
      const res = await api.post("/conversations/", { title: "New chat" });
      await loadConversations();
      setActiveId(res.data.id);
      setError("");
    } catch {
      setError("Failed to start a conversation.");
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || activeId === null || sending) return;

    setError("");
    setSending(true);

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
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: reduceMotion ? 0 : 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="space-y-4"
      >
        <PageHeader
          badge="Chat"
          title="Ask your docs"
          sub="Tenant-isolated answers with cited sources."
          actions={<SharpButton onClick={handleNewConversation}>+ New chat</SharpButton>}
        />

        {error && <AlertBox>{error}</AlertBox>}

        <div className="grid gap-3 lg:grid-cols-[240px_1fr]">
          {/* conversations */}
          <div className="border-2 border-neutral-950 bg-white p-3 shadow-[5px_5px_0_#0a0a0b]">
            <p className="px-1 text-[11px] font-extrabold tracking-[0.1em] uppercase text-neutral-500">
              Conversations
            </p>
            {loadingConvos && (
              <div className="mt-2">
                <LoadingBlock label="Loading…" />
              </div>
            )}
            {!loadingConvos && conversations.length === 0 && (
              <p className="mt-2 border-2 border-dashed border-neutral-950 bg-neutral-50 px-3 py-4 text-center text-[12.5px] font-bold text-neutral-500">
                No chats yet. Start one above.
              </p>
            )}
            <ul className="mt-2 max-h-72 space-y-1.5 overflow-y-auto lg:max-h-[52vh]">
              {conversations.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(c.id)}
                    aria-current={activeId === c.id}
                    className={
                      activeId === c.id
                        ? "w-full border-2 border-neutral-950 bg-neutral-950 px-2.5 py-2 text-left text-[13px] font-extrabold tracking-[-0.01em] text-white"
                        : "w-full border-2 border-neutral-950 bg-white px-2.5 py-2 text-left text-[13px] font-bold tracking-[-0.01em] transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#0a0a0b]"
                    }
                  >
                    <span className="block truncate">{c.title || `Conversation ${c.id}`}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* messages */}
          <div className="flex min-h-[52vh] flex-col border-2 border-neutral-950 bg-white shadow-[5px_5px_0_#0a0a0b]">
            {activeId === null ? (
              <div className="flex flex-1 items-center justify-center p-6">
                <EmptyState title="Select or start a conversation" sub="Your Q/A with cited sources appears here." />
              </div>
            ) : (
              <>
                <div className="max-h-[46vh] flex-1 space-y-3 overflow-y-auto border-b-2 border-neutral-950 bg-neutral-50 p-4">
                  {loadingMsgs && <LoadingBlock label="Loading messages…" />}
                  {!loadingMsgs &&
                    messages.map((m) => (
                      <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={
                            m.role === "user"
                              ? "max-w-[80%] border-2 border-neutral-950 bg-neutral-950 px-3 py-2 text-[13.5px] font-medium tracking-[-0.01em] text-white shadow-[4px_4px_0_#a3a3a3]"
                              : "max-w-[80%] border-2 border-neutral-950 bg-white px-3 py-2 text-[13.5px] font-medium tracking-[-0.01em] shadow-[4px_4px_0_#0a0a0b]"
                          }
                        >
                          <p className="whitespace-pre-wrap">{m.content}</p>
                          {(m.sources ?? []).length > 0 && (
                            <p className="mt-2 flex flex-wrap gap-1.5">
                              {(m.sources ?? []).map((s) => (
                                <span
                                  key={s.document_id}
                                  className="border-2 border-neutral-950 bg-[#FFD02F] px-1.5 py-0.5 text-[10.5px] font-extrabold tracking-[0.04em] uppercase"
                                >
                                  {s.document_name.split("/").pop()}
                                </span>
                              ))}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  {sending && (
                    <p className="inline-block animate-pulse border-2 border-neutral-950 bg-white px-2.5 py-1 text-[11px] font-extrabold tracking-[0.1em] uppercase">
                      Thinking…
                    </p>
                  )}
                  <div ref={bottomRef} />
                </div>

                <form onSubmit={handleSend} className="flex gap-2 p-3">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question about your company documents…"
                    disabled={sending}
                    aria-label="Ask a question"
                    className="flex-1 border-2 border-neutral-950 bg-white px-3 py-2 text-[13px] font-medium tracking-[-0.01em] placeholder:text-neutral-400 focus:shadow-[4px_4px_0_#0a0a0b] focus:outline-none disabled:opacity-60"
                  />
                  <SharpButton type="submit" disabled={sending || !input.trim()}>
                    Send
                  </SharpButton>
                </form>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </AppShell>
  );
}
