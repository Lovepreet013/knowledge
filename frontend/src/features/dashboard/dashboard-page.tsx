import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { useReducedMotion } from "framer-motion";
import {
  ArrowUp,
  Box,
  Building2,
  FileText,
  Menu,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  SquarePen,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import AppShell from "../../components/app-shell";
import { AlertBox, Hairline, LoadingBlock, ThinkingIndicator } from "../../components/ui";
import api from "../../lib/api";
import UsersTab from "./tabs/users-tab";
import DocumentsTab from "./tabs/documents-tab";
import CompaniesTab from "./tabs/companies-tab";
import PromoteTab from "./tabs/promote-tab";

interface Me {
  id: number;
  email: string;
  username: string;
  role: string;
  company: number | null;
  company_name?: string | null;
}

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

const SIDEBAR_KEY = "ka-sidebar-collapsed";

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === "1";
  } catch {
    return false;
  }
}

export default function DashboardPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [meError, setMeError] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [drawer, setDrawer] = useState(false);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const reduceMotion = useReducedMotion();
  const bottomRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLInputElement>(null);
  // Marks a freshly created conversation whose messages are managed locally
  // (optimistic question + server answer). The [activeId] loader must skip it,
  // or its fetch resolves mid-flight and wipes the question.
  const skipLoadRef = useRef<number | null>(null);

  const canChat = me !== null && me.company !== null;

  useEffect(() => {
    api
      .get("/auth/me/")
      .then((res) => setMe(res.data))
      .catch(() => setMeError("Failed to load your profile."));
  }, []);

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
    bottomRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  }, [messages, sending, reduceMotion]);

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

  const postMessage = async (text: string, conversationId: number) => {
    const trimmed = text.trim();
    if (trimmed === "" || sending) return;
    setError("");
    setSending(true);
    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: trimmed,
      sources: [],
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    try {
      const res = await api.post(`/conversations/${conversationId}/messages/`, {
        content: trimmed,
      });
      const assistantMessage: Message = {
        ...res.data,
        sources: res.data.sources ?? [],
      };
      setMessages((prev) => [...prev, assistantMessage]);
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
    } catch {
      setError("Failed to get a response. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending || !canChat) return;
    const text = input;
    setInput("");
    if (activeId === null) {
      void startSuggested(text);
    } else {
      void postMessage(text, activeId);
    }
  };

  const handleNewConversation = async () => {
    try {
      const res = await api.post("/conversations/", { title: "New chat" });
      await loadConversations();
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

  const startSuggested = async (prompt: string) => {
    if (sending) return;
    try {
      const res = await api.post("/conversations/", { title: prompt.slice(0, 60) });
      await loadConversations();
      setMessages([]);
      skipLoadRef.current = res.data.id;
      setActiveId(res.data.id);
      setError("");
      setDrawer(false);
      await postMessage(prompt, res.data.id);
    } catch {
      setError("Failed to start a conversation.");
    }
  };

  const pickConversation = (id: number) => {
    setActiveId(id);
    goTab("chat");
    setDrawer(false);
  };

  const navItems =
    me !== null
      ? [
        { id: "documents", label: "Documents", icon: <FileText className="h-6 w-6" aria-hidden="true" />, show: me.company !== null },
        { id: "users", label: "Users", icon: <Users className="h-6 w-6" aria-hidden="true" />, show: me.role === "company_admin" },
        { id: "companies", label: "Companies", icon: <Building2 className="h-6 w-6" aria-hidden="true" />, show: me.role === "superadmin" },
        { id: "promote", label: "Promote", icon: <UserPlus className="h-6 w-6" aria-hidden="true" />, show: me.role === "superadmin" },
      ].filter((n) => n.show)
      : [];

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

  const normalizedQuery = query.trim().toLowerCase();
  const visibleConversations =
    normalizedQuery === ""
      ? conversations
      : conversations.filter((c) => (c.title || `Conversation ${c.id}`).toLowerCase().includes(normalizedQuery));

  const renderNav = (rail: boolean, onNavigate?: () => void) => (
    <nav aria-label="Workspace" className={rail ? "flex flex-col gap-2" : "flex flex-col gap-1"}>
      {navItems.map((n) => {
        const selected = activeTab === n.id;
        return (
          <button
            key={n.id}
            type="button"
            onClick={() => {
              goTab(n.id);
              onNavigate?.();
            }}
            title={rail ? n.label : undefined}
            aria-label={n.label}
            aria-current={selected ? "page" : undefined}
            className={`flex min-h-[44px] w-full items-center gap-3 rounded-lg px-2 py-2 text-base leading-[23.2px] font-normal cursor-pointer transition ${rail ? "justify-center " : ""}${selected ? "bg-[#EDE9FE] text-[#7C3AED]" : "text-black hover:bg-[#EDE9FE]/60"}`}
          >
            <span className="grid h-7 w-7 shrink-0 place-items-center">{n.icon}</span>
            {!rail && <span className="whitespace-nowrap">{n.label}</span>}
          </button>
        );
      })}
    </nav>
  );

  const displayTitle = (c: Conversation) => c.title || `Conversation ${c.id}`;

  const renderHistory = (onNavigate?: () => void) => {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <p className="px-2 font-display text-sm leading-[18.2px] font-normal text-[#666666]">Chat</p>
        {loadingConvos && (
          <div className="mt-3">
            <LoadingBlock label="Loading…" />
          </div>
        )}
        {!loadingConvos && conversations.length === 0 && (
          <p className="mt-3 rounded-lg border border-[#E0E0E0] bg-white px-4 py-4 text-center text-sm leading-5 font-normal text-[#666666]">
            No chats yet. Start one above.
          </p>
        )}
        {!loadingConvos && conversations.length > 0 && visibleConversations.length === 0 && (
          <p className="mt-3 rounded-lg border border-[#E0E0E0] bg-white px-4 py-4 text-center text-sm leading-5 font-normal text-[#666666]">
            No chats match “{query.trim()}”.
          </p>
        )}
        <div className="mt-2 min-h-0 flex-1 overflow-y-auto pb-2">
          <ul className="space-y-1">
            {visibleConversations.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => {
                    pickConversation(c.id);
                    onNavigate?.();
                  }}
                  aria-current={activeId === c.id && activeTab === "chat"}
                  title={displayTitle(c)}
                  className={`flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-base leading-[23.2px] font-normal cursor-pointer transition ${activeId === c.id && activeTab === "chat" ? "bg-[#EDE9FE] text-[#7C3AED]" : "text-black hover:bg-[#EDE9FE]/60"
                    }`}
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center">
                    <MessageSquare className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1 truncate">{displayTitle(c)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const sidebarBody = (rail: boolean, onNavigate?: () => void, hideTop = false) => (
    <>
      {!hideTop &&
        (rail ? (
          <button
            type="button"
            onClick={toggleCollapsed}
            title="Expand sidebar"
            aria-label="Expand sidebar"
            className="flex min-h-[44px] w-full shrink-0 cursor-pointer items-center justify-center gap-3 rounded-lg px-2 py-2 text-black transition hover:bg-[#EDE9FE]/60"
          >
            <span className="grid h-7 w-7 shrink-0 place-items-center">
              <PanelLeftOpen className="h-6 w-6" aria-hidden="true" />
            </span>
          </button>
        ) : (
          <div className="flex shrink-0 items-center justify-between gap-2">
            <span className="flex min-w-0 items-center gap-3 px-2">
              <Box className="h-7 w-7 shrink-0 text-black" aria-hidden="true" />
              <span className="truncate font-display text-base leading-[28px] font-medium tracking-[-0.02em] text-black">
                Knowledge
              </span>
            </span>
            <button
              type="button"
              onClick={toggleCollapsed}
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-black cursor-pointer transition hover:bg-[#EDE9FE]/60"
            >
              <PanelLeftClose className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        ))}
      {rail ? (
        <div aria-hidden="true" className="h-2 shrink-0" />
      ) : (
        <Hairline className="-mx-2 my-3 w-[calc(100%+16px)]" />
      )}
      {/* New chat — primary sidebar action, SquarePen matches compose affordance */}
      <button
        type="button"
        onClick={() => {
          void handleNewConversation();
          onNavigate?.();
        }}
        title="New chat"
        aria-label={rail ? "New chat" : "Start a new chat"}
        disabled={!canChat}
        className={`${rail ? "justify-center " : ""}flex min-h-[44px] w-full shrink-0 cursor-pointer items-center gap-3 rounded-lg bg-transparent px-2 py-2 text-base leading-[23.2px] font-normal text-black transition hover:bg-[#EDE9FE]/60 disabled:cursor-not-allowed disabled:bg-[#F5F5F5] disabled:text-[#999999]`}
      >
        <span className="grid h-7 w-7 shrink-0 place-items-center">
          <SquarePen className="h-6 w-6" aria-hidden="true" />
        </span>
        {!rail && <span className="whitespace-nowrap">New chat</span>}
      </button>
      {/* Search chats — filters grouped history below */}
      {rail ? (
        <button
          type="button"
          onClick={toggleCollapsed}
          title="Search chats"
          aria-label="Search chats"
          className="mt-2 flex min-h-[44px] w-full shrink-0 cursor-pointer items-center justify-center gap-3 rounded-lg px-2 py-2 text-black transition hover:bg-[#EDE9FE]/60"
        >
          <span className="grid h-7 w-7 shrink-0 place-items-center">
            <Search className="h-6 w-6" aria-hidden="true" />
          </span>
        </button>
      ) : searchOpen ? (
        <div className="mt-1 flex min-h-[44px] shrink-0 items-center gap-3 rounded-lg border border-black bg-white px-2 py-2 transition">
          <span className="grid h-7 w-7 shrink-0 place-items-center">
            <Search className="h-6 w-6 text-black" aria-hidden="true" />
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setQuery("");
                setSearchOpen(false);
              }
            }}
            placeholder="Search chats"
            aria-label="Search chats"
            className="min-w-0 flex-1 bg-transparent text-base leading-[23.2px] font-normal text-black outline-none placeholder:text-[#999999]"
          />
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSearchOpen(false);
            }}
            aria-label="Clear search"
            className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-lg text-[#666666] transition hover:bg-[#EDE9FE]/60 hover:text-black"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          disabled={!canChat}
          className="mt-1 flex min-h-[44px] w-full shrink-0 cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-left text-base leading-[23.2px] font-normal text-black transition hover:bg-[#EDE9FE]/60 disabled:cursor-not-allowed disabled:text-[#999999] disabled:hover:bg-transparent"
        >
          <span className="grid h-7 w-7 shrink-0 place-items-center">
            <Search className="h-6 w-6" aria-hidden="true" />
          </span>
          <span className="whitespace-nowrap">Search chats</span>
        </button>
      )}
      {rail ? (
        <div aria-hidden="true" className="h-2 shrink-0" />
      ) : (
        <Hairline className="-mx-2 my-3 w-[calc(100%+16px)]" />
      )}
      <div className="shrink-0">{renderNav(rail, onNavigate)}</div>
      {navItems.length > 0 && !rail && <Hairline className="-mx-2 my-3 w-[calc(100%+16px)]" />}
      {navItems.length > 0 && rail && <div aria-hidden="true" className="h-2 shrink-0" />}
      {!rail && canChat && renderHistory(onNavigate)}
      {(!canChat || rail) && <div aria-hidden="true" className="min-h-4 flex-1" />}
    </>
  );

  const sendDisabled = sending || input.trim() === "" || !canChat;

  const renderComposer = (id: string) => (
    <form onSubmit={handleSend} className="w-full" aria-label="Ask your documents">
      <div className="flex min-h-[56px] w-full items-center gap-2 rounded-full border border-[#E0E0E0] bg-white py-2 pr-2 pl-5 shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
        <label htmlFor={id} className="sr-only">
          Ask about your company documents
        </label>
        <input
          ref={composerRef}
          id={id}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={canChat ? "Ask about your company documents…" : "Join a company to start chatting…"}
          disabled={sending || !canChat}
          autoComplete="off"
          className="min-h-[40px] min-w-0 flex-1 bg-transparent text-base leading-[23.2px] font-normal text-black outline-none placeholder:text-[#999999] disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={sendDisabled}
          aria-label="Send message"
          title="Send message"
          className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-full bg-black text-white transition hover:opacity-85 active:bg-[#1A1A1A] disabled:cursor-not-allowed disabled:bg-[#CCCCCC] disabled:text-white disabled:hover:opacity-100"
        >
          <ArrowUp className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </form>
  );

  return (
    <>
      <AppShell
        headerLead={
          <button
            type="button"
            onClick={() => setDrawer(true)}
            aria-label="Open navigation"
            aria-expanded={drawer}
            className="pointer-events-auto grid h-11 w-11 cursor-pointer place-items-center rounded-lg bg-white text-black transition hover:bg-[#F5F5F5] lg:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        }
        sidebar={
          <>
            <aside
              aria-label="Workspace sidebar"
              className={`hidden shrink-0 flex-col border-r border-[#f0f0f0] bg-white px-2 py-4 lg:sticky lg:top-0 lg:flex lg:h-svh lg:min-h-0 lg:overflow-hidden ${collapsed ? "w-[76px]" : "w-[280px]"
                }`}
            >
              {sidebarBody(collapsed)}
            </aside>
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
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-black cursor-pointer transition hover:bg-[#EDE9FE]/60"
                    >
                      <X className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                  {sidebarBody(false, () => setDrawer(false), true)}
                </aside>
              </div>
            )}
          </>
        }
      >
        <section aria-label="Workspace" className="relative z-[1] flex w-full flex-1 flex-col bg-white">
          {me === null && meError === "" && (
            <div className="mx-auto flex min-h-svh w-full max-w-3xl flex-1 items-center justify-center px-4 py-10 sm:px-6">
              <LoadingBlock label="Loading workspace…" />
            </div>
          )}
          {(meError !== "" || error !== "") && (
            <div className="mx-auto w-full max-w-3xl space-y-3 px-4 pt-4 sm:px-6">
              {meError !== "" && <AlertBox>{meError}</AlertBox>}
              {error !== "" && <AlertBox>{error}</AlertBox>}
            </div>
          )}

          {me !== null && !canChat && (
            <div className="mx-auto w-full max-w-3xl px-4 pt-4 sm:px-6">
              <AlertBox tone="info">
                {me.role === "superadmin"
                  ? "Superadmins have no company: manage everything from Companies + Promote."
                  : "You are not in a company yet — register again with a valid invite code."}
              </AlertBox>
            </div>
          )}

          <div className={activeTab === "chat" ? "flex w-full flex-1 flex-col" : "hidden"}>
          {me !== null && activeId === null && (
            <div className="mx-auto flex min-h-svh w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-10 text-center sm:px-6">
              <h1 className="font-display max-w-xl text-[32px] leading-[36px] font-medium tracking-[-0.03em] text-balance text-black sm:text-[40px] sm:leading-[44px]">
                Where should we begin?
              </h1>
              <p className="mt-3 max-w-md text-base leading-[23.2px] font-normal text-[#666666]">
                Tenant-isolated answers with cited sources.
              </p>
              <div className="mt-6 w-full max-w-2xl">{renderComposer("ask-empty")}</div>
              <p className="mt-10 max-w-xl text-sm leading-5 font-normal text-[#666666]">
                Knowledge answers only from your company documents. Verify important information.
              </p>
            </div>
          )}

          {me !== null && activeId !== null && (
            <div className="mx-auto flex min-h-svh w-full max-w-3xl flex-1 flex-col px-4 pt-20 pb-0 sm:px-6 lg:pt-22">
              {loadingMsgs ? (
                <div className="flex flex-1 items-center justify-center" aria-live="polite" aria-busy="true">
                  <LoadingBlock label="Loading messages…" />
                </div>
              ) : (
                <div className="space-y-3" aria-live="polite">
                  {messages.map((m) => (
                    <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={
                          m.role === "user"
                            ? "max-w-[80%] rounded-xl rounded-br-sm bg-black px-4 py-3 text-base leading-[22.4px] font-normal text-white"
                            : "max-w-[80%] rounded-xl rounded-bl-sm border border-[#E0E0E0] bg-white px-4 py-3 text-base leading-[22.4px] font-normal text-black"
                        }
                      >
                        <p className="whitespace-pre-wrap">{m.content}</p>
                        {(m.sources ?? []).length > 0 && (
                          <p className="mt-2 flex flex-wrap gap-1.5">
                            {(m.sources ?? []).map((s) => (
                              <span
                                key={s.document_id}
                                className="font-display rounded bg-[#DDEAF6] px-2 py-0.5 text-xs leading-4 font-medium text-black"
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
                    <div className="inline-block rounded-xl rounded-bl-sm border border-[#E0E0E0] bg-white px-4 py-3">
                      <ThinkingIndicator label="Thinking" />
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>
              )}
              {!loadingMsgs && <div aria-hidden="true" className="min-h-6 flex-1" />}
              <div className="sticky bottom-0 z-10 bg-transparent pt-8 pb-6">
                {renderComposer("ask-thread")}
              </div>
            </div>
          )}
          </div>
          {me !== null && activeTab !== "chat" && (
            <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-6">
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
