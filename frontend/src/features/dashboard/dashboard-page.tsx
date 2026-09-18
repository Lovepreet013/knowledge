import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { Box, Menu, X } from "lucide-react";
import AppShell from "../../components/app-shell";
import { AlertBox, LoadingBlock } from "../../components/ui";
import api from "../../lib/api";
import { firstApiError } from "../../lib/utils";
import UsersTab from "./tabs/users-tab";
import DocumentsTab from "./tabs/documents-tab";
import CompaniesTab from "./tabs/companies-tab";
import PromoteTab from "./tabs/promote-tab";
import DashboardSidebar from "./components/dashboard-sidebar";
import ChatComposer from "./components/chat-composer";
import ChatThread from "./components/chat-thread";
import type { Conversation, Message } from "./types";

const SIDEBAR_KEY = "ka-sidebar-collapsed";
const ATTACHMENT_EXTENSIONS = ["pdf", "txt", "png", "jpg", "jpeg"];
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === "1";
  } catch {
    return false;
  }
}

function sortConversationsNewestFirst(list: Conversation[]): Conversation[] {
  return [...list].sort((a, b) => {
    const ta = Date.parse(a.created_at);
    const tb = Date.parse(b.created_at);
    if (!Number.isNaN(ta) && !Number.isNaN(tb) && ta !== tb) return tb - ta;
    return b.id - a.id;
  });
}

export default function DashboardPage() {
  // ── State ──
  const [me, setMe] = useState<{ id: number; email: string; username: string; role: string; company: number | null; company_name?: string | null } | null>(null);
  const [meError, setMeError] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [drawer, setDrawer] = useState(false);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const bottomRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Marks a freshly created conversation whose messages are managed locally
  // (optimistic question + server answer). The [activeId] loader must skip it,
  // or its fetch resolves mid-flight and wipes the question.
  const skipLoadRef = useRef<number | null>(null);
  // Navigation + send scroll signals:
  // - scrollAfterLoadRef is set only by loadMessages, which runs solely when
  //   a conversation is opened.
  // - sends scroll explicitly via scrollChatToBottom (question + Thinking).
  // - prevTabRef detects returning to the chat tab with an open conversation.
  const scrollAfterLoadRef = useRef(false);
  const prevTabRef = useRef<string>("chat");
  // Scroll the window to the absolute bottom (latest question + Thinking /
  // answer just above the sticky composer). rAF waits for the thread to
  // paint. Instant (CSS scroll-behavior: auto), matching open-chat scroll.
  const scrollChatToBottom = () => {
    requestAnimationFrame(() => {
      window.scrollTo(0, document.documentElement.scrollHeight);
    });
  };
  // Object URLs minted for optimistic image previews. Revoked whenever the
  // messages holding them are discarded (never on append), plus on unmount.
  const previewUrlsRef = useRef<string[]>([]);

  const revokePreviews = () => {
    for (const url of previewUrlsRef.current) URL.revokeObjectURL(url);
    previewUrlsRef.current = [];
  };

  useEffect(() => () => revokePreviews(), []);

  const canChat = me !== null && me.company !== null;

  // ── Data loading ──

  useEffect(() => {
    api
      .get("/auth/me/")
      .then((res) => setMe(res.data))
      .catch(() => setMeError("Failed to load your profile."));
  }, []);

  const loadConversations = async () => {
    try {
      const res = await api.get("/conversations/");
      setConversations(sortConversationsNewestFirst(res.data ?? []));
    } catch {
      setError("Failed to load conversations.");
    } finally {
      setLoadingConvos(false);
    }
  };

  const loadMessages = async (conversationId: number) => {
    revokePreviews();
    setLoadingMsgs(true);
    try {
      const res = await api.get(`/conversations/${conversationId}/messages/`);
      const normalized: Message[] = (res.data ?? []).map((m: Message) => ({
        ...m,
        sources: m.sources ?? [],
      }));
      setMessages(normalized);
      // Navigation-only signal for the scroll effect below: a completed load
      // means the user opened a conversation. Sends never set this flag.
      scrollAfterLoadRef.current = true;
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
    if (activeId === null) {
      setMessages([]);
      return;
    }
    if (skipLoadRef.current === activeId) {
      skipLoadRef.current = null;
      return;
    }
    loadMessages(activeId);
  }, [activeId]);

  useEffect(() => {
    if (!drawer) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawer(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [drawer]);

  // ── Tab routing ──

  const rawTab = searchParams.get("tab") ?? "chat";

  const isTabAllowed = (t: string): boolean => {
    if (t === "chat") return true;
    if (me === null) return false;
    if (t === "documents") return me.company !== null;
    if (t === "users") return me.role === "company_admin";
    if (t === "companies" || t === "promote") return me.role === "superadmin";
    return false;
  };

  const activeTab = isTabAllowed(rawTab) ? rawTab : "chat";

  useEffect(() => {
    if (me !== null && rawTab !== "chat" && activeTab === "chat") {
      setSearchParams({}, { replace: true });
    }
  }, [me, rawTab, activeTab, setSearchParams]);

  const goTab = (id: string) => {
    const current = searchParams.get("tab") ?? "chat";
    if (current === id) return;
    setSearchParams(id === "chat" ? {} : { tab: id });
  };

  // ── Sidebar helpers ──

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_KEY, next ? "1" : "0");
      } catch {
        /* storage unavailable — collapse still works for this session */
      }
      return next;
    });
  };

  const normalizedQuery = query.trim().toLowerCase();
  const visibleConversations = sortConversationsNewestFirst(
    normalizedQuery === ""
      ? conversations
      : conversations.filter((c) => (c.title || `Conversation ${c.id}`).toLowerCase().includes(normalizedQuery)),
  );

  // ── Chat actions ──

  const postMessage = async (text: string, conversationId: number, file: File | null) => {
    const trimmed = text.trim();
    if (trimmed === "" || sending) return;
    setError("");
    setSending(true);
    let attachmentPreview: Message["attachmentPreview"];
    if (file) {
      if (/\.(png|jpe?g)$/i.test(file.name)) {
        const url = URL.createObjectURL(file);
        previewUrlsRef.current.push(url);
        attachmentPreview = { name: file.name, url, kind: "image" };
      } else {
        attachmentPreview = { name: file.name, kind: "file" };
      }
    }
    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: trimmed,
      sources: [],
      created_at: new Date().toISOString(),
      ...(attachmentPreview ? { attachmentPreview } : {}),
    };
    setMessages((prev) => [...prev, userMessage]);
    // Move down so the just-asked question + Thinking indicator are visible
    // just above the sticky composer (rAF waits for the thread to paint).
    scrollChatToBottom();
    try {
      let res;
      if (file) {
        const formData = new FormData();
        formData.append("content", trimmed);
        formData.append("file", file);
        res = await api.post(`/conversations/${conversationId}/messages/`, formData);
      } else {
        res = await api.post(`/conversations/${conversationId}/messages/`, {
          content: trimmed,
        });
      }
      const assistantMessage: Message = {
        ...res.data,
        sources: res.data.sources ?? [],
      };
      setMessages((prev) => [...prev, assistantMessage]);
      // Keep the new answer in view after it arrives.
      scrollChatToBottom();
      // First message in a placeholder-titled chat ("New chat" button flow):
      // rename it to the question, mirroring the direct-input flow where the
      // conversation is created with the question as its title.
      const current = conversations.find((c) => c.id === conversationId);
      if (current && (current.title === "New chat" || current.title.trim() === "")) {
        const newTitle = trimmed.slice(0, 60);
        try {
          await api.patch(`/conversations/${conversationId}/`, { title: newTitle });
          setConversations((prev) =>
            prev.map((c) => (c.id === conversationId ? { ...c, title: newTitle } : c)),
          );
        } catch {
          /* non-fatal — chat works, keeps the placeholder name */
        }
      }
    } catch (err: unknown) {
      setError(firstApiError(err, "Failed to get a response. Please try again."));
    } finally {
      setSending(false);
    }
  };

  const handleNewConversation = async () => {
    try {
      const res = await api.post("/conversations/", { title: "New chat" });
      await loadConversations();
      revokePreviews();
      setMessages([]);
      skipLoadRef.current = res.data.id;
      setActiveId(res.data.id);
      goTab("chat");
      setError("");
      setDrawer(false);
      requestAnimationFrame(() => composerRef.current?.focus());
    } catch {
      setError("Failed to start a conversation.");
    }
  };

  const startSuggested = async (prompt: string, file: File | null = null) => {
    if (sending) return;
    try {
      const res = await api.post("/conversations/", { title: prompt.slice(0, 60) });
      await loadConversations();
      revokePreviews();
      setMessages([]);
      skipLoadRef.current = res.data.id;
      setActiveId(res.data.id);
      setError("");
      setDrawer(false);
      await postMessage(prompt, res.data.id, file);
    } catch {
      setError("Failed to start a conversation.");
    }
  };

  const pickConversation = (id: number) => {
    if (id === activeId) {
      // Re-clicking the already-open chat jumps to its latest message.
      // (A different id flows through loadMessages → scrollAfterLoadRef.)
      requestAnimationFrame(() => {
        window.scrollTo(0, document.documentElement.scrollHeight);
      });
    }
    setActiveId(id);
    goTab("chat");
    setDrawer(false);
  };

  const handleAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!file) return;
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ATTACHMENT_EXTENSIONS.includes(extension)) {
      setError("Only PDF, TXT, PNG and JPG files can be attached.");
      return;
    }
    if (file.size > MAX_ATTACHMENT_BYTES) {
      setError("Attached files must be 10MB or smaller.");
      return;
    }
    setError("");
    setAttachment(file);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending || !canChat) return;
    const text = input;
    const file = attachment;
    setInput("");
    setAttachment(null);
    if (activeId === null) {
      void startSuggested(text, file);
    } else {
      void postMessage(text, activeId, file);
    }
  };

  // Fresh / empty chat (including just-created via "New chat") reuses the
  // centered welcome layout instead of an empty thread with a bottom composer.
  const isNewEmptyChat =
    activeId !== null && !loadingMsgs && !sending && messages.length === 0;

  // Tab switches away from chat always start at top. The window is the
  // scroller (tab bodies just toggle hidden divs), so without this the
  // previous tab's scrollY is preserved.
  useEffect(() => {
    if (activeTab !== "chat") {
      window.scrollTo(0, 0);
    }
  }, [activeTab]);

  // Chat scrolling: opening a chat (or returning to the chat tab) pins to
  // the absolute bottom — last AI response + composer. Asking a question
  // scrolls explicitly via scrollChatToBottom in postMessage (question +
  // Thinking, then answer). This effect handles navigation only:
  // loadMessages is the only writer of scrollAfterLoadRef and runs solely on
  // conversation open, so sends can't double-trigger here. rAF waits for the
  // thread to paint. Instant (CSS scroll-behavior: auto).
  useEffect(() => {
    if (activeTab !== "chat") {
      prevTabRef.current = activeTab;
      return;
    }
    const returnedToChat = prevTabRef.current !== "chat";
    prevTabRef.current = "chat";
    if (activeId === null || isNewEmptyChat) {
      window.scrollTo(0, 0);
      return;
    }
    if (loadingMsgs) return;
    if (scrollAfterLoadRef.current || returnedToChat) {
      scrollAfterLoadRef.current = false;
      const frame = requestAnimationFrame(() => {
        window.scrollTo(0, document.documentElement.scrollHeight);
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [activeTab, activeId, isNewEmptyChat, loadingMsgs]);

  // ── Sidebar props ──

  const sidebarProps = {
    me,
    activeTab,
    activeId,
    conversations,
    visibleConversations,
    loadingConvos,
    canChat,
    query,
    searchOpen,
    onToggleCollapsed: toggleCollapsed,
    onNewChat: () => void handleNewConversation(),
    onSelectConversation: pickConversation,
    onSelectTab: goTab,
    onSetQuery: setQuery,
    onSetSearchOpen: setSearchOpen,
  } as const;

  // ── Render ──

  return (
    <>
      <AppShell
        headerLead={
          <button
            type="button"
            onClick={() => setDrawer(true)}
            aria-label="Open navigation"
            aria-expanded={drawer}
            className="pointer-events-auto grid h-11 w-11 cursor-pointer place-items-center rounded-lg border border-[#E0E0E0] bg-white text-black shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition hover:bg-[#F5F5F5] lg:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        }
        sidebar={
          <>
            {/* Desktop sidebar */}
            <aside
              aria-label="Workspace sidebar"
              className={`hidden shrink-0 flex-col border-r border-[#f0f0f0] bg-white px-2 py-4 lg:sticky lg:top-0 lg:flex lg:h-svh lg:min-h-0 lg:overflow-hidden ${collapsed ? "w-[76px]" : "w-[256px]"}`}
            >
              <DashboardSidebar {...sidebarProps} rail={collapsed} />
            </aside>

            {/* Mobile drawer */}
            {drawer && (
              <div className="fixed inset-0 z-30 lg:hidden" role="dialog" aria-modal="true" aria-label="Workspace navigation">
                <div aria-hidden="true" className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDrawer(false)} />
                <aside className="absolute inset-y-0 left-0 flex w-[300px] flex-col overflow-hidden bg-white px-2 py-4">
                  <div className="flex shrink-0 items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-3 px-2">
                      <Box className="h-7 w-7 shrink-0 text-black" aria-hidden="true" />
                      <span className="truncate font-display text-base leading-[28px] font-medium tracking-[-0.02em] text-black">
                        Knowledge
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setDrawer(false)}
                      aria-label="Close navigation"
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-black cursor-pointer transition hover:bg-[#E8E8E8]"
                    >
                      <X className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                  <DashboardSidebar {...sidebarProps} rail={false} hideTop onNavigate={() => setDrawer(false)} />
                </aside>
              </div>
            )}
          </>
        }
      >
        <section aria-label="Workspace" className="relative z-[1] flex w-full flex-1 flex-col bg-white">
          {/* Loading state */}
          {me === null && meError === "" && (
            <div className="mx-auto flex min-h-svh w-full max-w-3xl flex-1 items-center justify-center px-4 py-10 sm:px-6">
              <LoadingBlock label="Loading workspace…" />
            </div>
          )}

          {/* Error banners */}
          {(meError !== "" || error !== "") && (
            <div className="mx-auto w-full max-w-3xl space-y-3 px-4 pt-4 sm:px-6">
              {meError !== "" && <AlertBox>{meError}</AlertBox>}
              {error !== "" && <AlertBox>{error}</AlertBox>}
            </div>
          )}

          {/* No-company info */}
          {me !== null && !canChat && (
            <div className="mx-auto w-full max-w-3xl px-4 pt-4 sm:px-6">
              <AlertBox tone="info">
                {me.role === "superadmin"
                  ? "Superadmins have no company: manage everything from Companies + Promote."
                  : "You are not in a company yet — register again with a valid invite code."}
              </AlertBox>
            </div>
          )}

          {/* ── Chat tab ── */}
          <div className={activeTab === "chat" ? "flex w-full flex-1 flex-col" : "hidden"}>
            {/* Welcome / empty state */}
            {me !== null && (activeId === null || isNewEmptyChat) && (
              <div className="mx-auto flex min-h-svh w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-10 text-center sm:px-6">
                <h1 className="font-display max-w-xl text-[32px] leading-[36px] font-medium tracking-[-0.03em] text-balance text-black sm:text-[40px] sm:leading-[44px]">
                  {isNewEmptyChat ? <>Let&apos;s discover</> : "Ask any question to get started"}
                </h1>
                <div className="mt-6 w-full max-w-2xl">
                  <ChatComposer
                    id="ask-empty"
                    input={input}
                    attachment={attachment}
                    sending={sending}
                    canChat={canChat}
                    composerRef={composerRef}
                    fileInputRef={fileInputRef}
                    onInputChange={setInput}
                    onAttach={handleAttach}
                    onRemoveAttachment={() => setAttachment(null)}
                    onSend={handleSend}
                  />
                </div>
                <p className="mt-10 max-w-xl text-sm leading-5 font-normal text-[#666666]">
                  Knowledge answers only from your company documents. Verify important information.
                </p>
              </div>
            )}

            {/* Active conversation */}
            {me !== null && activeId !== null && !isNewEmptyChat && (
              <div className="mx-auto flex min-h-svh w-full max-w-3xl flex-1 flex-col px-4 pt-20 pb-0 sm:px-6 lg:pt-22">
                {loadingMsgs ? (
                  <div className="flex flex-1 items-center justify-center" aria-live="polite" aria-busy="true">
                    <LoadingBlock label="Loading messages…" />
                  </div>
                ) : (
                  <ChatThread messages={messages} sending={sending} bottomRef={bottomRef} />
                )}
                {!loadingMsgs && <div aria-hidden="true" className="min-h-6 flex-1" />}
                <div className="sticky bottom-0 z-10 bg-transparent pt-8 pb-6">
                  <ChatComposer
                    id="ask-thread"
                    input={input}
                    attachment={attachment}
                    sending={sending}
                    canChat={canChat}
                    composerRef={composerRef}
                    fileInputRef={fileInputRef}
                    onInputChange={setInput}
                    onAttach={handleAttach}
                    onRemoveAttachment={() => setAttachment(null)}
                    onSend={handleSend}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── Admin tabs ── */}
          {me !== null && activeTab !== "chat" && (
            <div className="mx-auto w-full max-w-3xl flex-1 px-4 pt-20 pb-6 sm:px-6">
              {activeTab === "documents" &&
                (me.company !== null ? (
                  <DocumentsTab canManage={me.role === "company_admin"} />
                ) : (
                  <AlertBox tone="info">
                    You are not in a company yet — register again with a valid invite code.
                  </AlertBox>
                ))}
              {activeTab === "users" &&
                (me.role === "company_admin" ? (
                  <UsersTab />
                ) : (
                  <AlertBox>You do not have permission to manage users.</AlertBox>
                ))}
              {activeTab === "companies" &&
                (me.role === "superadmin" ? (
                  <CompaniesTab />
                ) : (
                  <AlertBox>You do not have permission to manage companies.</AlertBox>
                ))}
              {activeTab === "promote" &&
                (me.role === "superadmin" ? (
                  <PromoteTab />
                ) : (
                  <AlertBox>You do not have permission to promote users.</AlertBox>
                ))}
            </div>
          )}
        </section>
      </AppShell>
    </>
  );
}
