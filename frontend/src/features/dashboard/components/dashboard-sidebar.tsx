import type { ReactNode } from "react";
import {
  Box,
  Building2,
  FileText,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  SquarePen,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { Hairline, LoadingBlock } from "../../../components/ui";
import type { Conversation, Me } from "../types";

interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
  show: boolean;
}

function getNavItems(me: Me): NavItem[] {
  return [
    { id: "documents", label: "Documents", icon: <FileText className="h-5 w-5" aria-hidden="true" />, show: me.company !== null },
    { id: "users", label: "Users", icon: <Users className="h-5 w-5" aria-hidden="true" />, show: me.role === "company_admin" },
    { id: "companies", label: "Companies", icon: <Building2 className="h-5 w-5" aria-hidden="true" />, show: me.role === "superadmin" },
    { id: "promote", label: "Promote", icon: <UserPlus className="h-5 w-5" aria-hidden="true" />, show: me.role === "superadmin" },
  ].filter((n) => n.show);
}

function displayTitle(c: Conversation): string {
  return c.title || `Conversation ${c.id}`;
}

export default function DashboardSidebar({
  me,
  rail,
  activeTab,
  activeId,
  conversations,
  visibleConversations,
  loadingConvos,
  canChat,
  query,
  searchOpen,
  hideTop = false,
  onToggleCollapsed,
  onNewChat,
  onSelectConversation,
  onSelectTab,
  onSetQuery,
  onSetSearchOpen,
  onNavigate,
}: {
  me: Me | null;
  rail: boolean;
  activeTab: string;
  activeId: number | null;
  conversations: Conversation[];
  visibleConversations: Conversation[];
  loadingConvos: boolean;
  canChat: boolean;
  query: string;
  searchOpen: boolean;
  hideTop?: boolean;
  onToggleCollapsed: () => void;
  onNewChat: () => void;
  onSelectConversation: (id: number) => void;
  onSelectTab: (id: string) => void;
  onSetQuery: (q: string) => void;
  onSetSearchOpen: (open: boolean) => void;
  onNavigate?: () => void;
}) {
  const navItems = me !== null ? getNavItems(me) : [];

  return (
    <>
      {/* ── Top: logo / collapse toggle ── */}
      {!hideTop &&
        (rail ? (
          <button
            type="button"
            onClick={onToggleCollapsed}
            title="Expand sidebar"
            aria-label="Expand sidebar"
            className="flex min-h-[44px] w-full shrink-0 cursor-pointer items-center justify-center gap-3 rounded-lg px-2 py-2 text-black transition hover:bg-[#E8E8E8]"
          >
            <span className="grid h-7 w-7 shrink-0 place-items-center">
              <PanelLeftOpen className="h-5 w-5" aria-hidden="true" />
            </span>
          </button>
        ) : (
          <div className="flex shrink-0 items-center justify-between gap-2">
            <span className="flex min-w-0 items-center gap-3 px-2">
              <Box className="h-7 w-7 shrink-0 text-black" aria-hidden="true" />
              <span className="truncate font-display text-sm leading-5 font-medium tracking-[-0.02em] text-black">
                Knowledge
              </span>
            </span>
            <button
              type="button"
              onClick={onToggleCollapsed}
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-black cursor-pointer transition hover:bg-[#E8E8E8]"
            >
              <PanelLeftClose className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        ))}

      {rail ? (
        <div aria-hidden="true" className="h-2 shrink-0" />
      ) : (
        <Hairline className="-mx-2 my-3 w-[calc(100%+16px)]" />
      )}

      {/* ── New chat ── */}
      <button
        type="button"
        onClick={() => {
          onNewChat();
          onNavigate?.();
        }}
        title="New chat"
        aria-label={rail ? "New chat" : "Start a new chat"}
        disabled={!canChat}
        className={`${rail ? "justify-center " : ""}flex min-h-[44px] w-full shrink-0 cursor-pointer items-center gap-3 rounded-lg bg-transparent px-2 py-2 text-sm leading-5 font-normal text-black transition hover:bg-[#E8E8E8] disabled:cursor-not-allowed disabled:bg-[#F5F5F5] disabled:text-[#999999]`}
      >
        <span className="grid h-7 w-7 shrink-0 place-items-center">
          <SquarePen className="h-5 w-5" aria-hidden="true" />
        </span>
        {!rail && <span className="whitespace-nowrap">New chat</span>}
      </button>

      {/* ── Search chats ── */}
      {rail ? (
        <button
          type="button"
          onClick={onToggleCollapsed}
          title="Search chats"
          aria-label="Search chats"
          className="mt-2 flex min-h-[44px] w-full shrink-0 cursor-pointer items-center justify-center gap-3 rounded-lg px-2 py-2 text-black transition hover:bg-[#E8E8E8]"
        >
          <span className="grid h-7 w-7 shrink-0 place-items-center">
            <Search className="h-5 w-5" aria-hidden="true" />
          </span>
        </button>
      ) : searchOpen ? (
        <div className="mt-1 flex min-h-[44px] shrink-0 items-center gap-3 rounded-lg border border-black bg-white px-2 py-2 transition">
          <span className="grid h-7 w-7 shrink-0 place-items-center">
            <Search className="h-5 w-5 text-black" aria-hidden="true" />
          </span>
          <input
            value={query}
            onChange={(e) => onSetQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                onSetQuery("");
                onSetSearchOpen(false);
              }
            }}
            placeholder="Search chats"
            aria-label="Search chats"
            className="min-w-0 flex-1 bg-transparent text-sm leading-5 font-normal text-black outline-none placeholder:text-[#999999]"
          />
          <button
            type="button"
            onClick={() => {
              onSetQuery("");
              onSetSearchOpen(false);
            }}
            aria-label="Clear search"
            className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-lg text-[#666666] transition hover:bg-[#E8E8E8] hover:text-black"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onSetSearchOpen(true)}
          disabled={!canChat}
          className="mt-1 flex min-h-[44px] w-full shrink-0 cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-left text-sm leading-5 font-normal text-black transition hover:bg-[#E8E8E8] disabled:cursor-not-allowed disabled:text-[#999999] disabled:hover:bg-transparent"
        >
          <span className="grid h-7 w-7 shrink-0 place-items-center">
            <Search className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="whitespace-nowrap">Search chats</span>
        </button>
      )}

      {rail ? (
        <div aria-hidden="true" className="h-2 shrink-0" />
      ) : (
        <Hairline className="-mx-2 my-3 w-[calc(100%+16px)]" />
      )}

      {/* ── Nav tabs ── */}
      <div className="shrink-0">
        <nav aria-label="Workspace" className={rail ? "flex flex-col gap-2" : "flex flex-col gap-1"}>
          {navItems.map((n) => {
            const selected = activeTab === n.id;
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => {
                  onSelectTab(n.id);
                  onNavigate?.();
                }}
                title={rail ? n.label : undefined}
                aria-label={n.label}
                aria-current={selected ? "page" : undefined}
                className={`flex min-h-[44px] w-full items-center gap-3 rounded-lg px-2 py-2 text-sm leading-5 font-normal cursor-pointer transition ${rail ? "justify-center " : ""}${selected ? "bg-[#E8E8E8] text-black" : "text-black hover:bg-[#E8E8E8]"}`}
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center">{n.icon}</span>
                {!rail && <span className="whitespace-nowrap">{n.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {navItems.length > 0 && !rail && <Hairline className="-mx-2 my-3 w-[calc(100%+16px)]" />}
      {navItems.length > 0 && rail && <div aria-hidden="true" className="h-2 shrink-0" />}

      {/* ── Chat history ── */}
      {!rail && canChat && (
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
              No chats match &ldquo;{query.trim()}&rdquo;.
            </p>
          )}
          <div className="mt-2 min-h-0 flex-1 overflow-y-auto pb-2">
            <ul className="space-y-1">
              {visibleConversations.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectConversation(c.id);
                      onNavigate?.();
                    }}
                    aria-current={activeId === c.id && activeTab === "chat"}
                    title={displayTitle(c)}
                    className={`flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-sm leading-5 font-normal cursor-pointer transition ${
                      activeId === c.id && activeTab === "chat"
                        ? "bg-[#E8E8E8] text-black"
                        : "text-black hover:bg-[#E8E8E8]"
                    }`}
                  >
                    <span className="grid h-7 w-7 shrink-0 place-items-center">
                      <MessageSquare className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1 truncate">{displayTitle(c)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {(!canChat || rail) && <div aria-hidden="true" className="min-h-4 flex-1" />}
    </>
  );
}
