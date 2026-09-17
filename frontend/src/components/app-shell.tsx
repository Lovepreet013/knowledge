import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Box, ChevronDown, LogOut, User } from "lucide-react";
import { useMe } from "./me-provider";
import { clearAuthTokens } from "../lib/api";
import { Hairline, StatusBadge } from "./ui";

export default function AppShell({
  headerLead,
  sidebar,
  children,
}: {
  headerLead?: ReactNode;
  sidebar?: ReactNode;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const me = useMe();
  const [menuOpen, setMenuOpen] = useState(false);
  const chipRef = useRef<HTMLButtonElement>(null);

  const logout = () => {
    clearAuthTokens();
    navigate("/");
  };

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        chipRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const initial = (me?.username ?? "?").slice(0, 1).toUpperCase();

  const headerActions = (
    <div className="relative flex shrink-0 items-center gap-3">
      {me !== null && (
        <>
          <button
            ref={chipRef}
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="Account menu"
            className="pointer-events-auto inline-flex min-h-[40px] cursor-pointer items-center gap-2 rounded-full border border-[#E0E0E0] bg-white py-1 pr-3 pl-1 text-black shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition hover:bg-[#E8E8E8]"
          >
            <span
              aria-hidden="true"
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-black font-display text-xs font-medium text-white"
            >
              {initial}
            </span>
            <span className="max-w-32 truncate font-display text-sm font-medium text-black">
              {me.username}
            </span>
            <ChevronDown
              aria-hidden="true"
              className={`h-4 w-4 shrink-0 transition ${menuOpen ? "rotate-180" : ""}`}
            />
          </button>
          {menuOpen && (
            <>
              <button
                type="button"
                aria-hidden="true"
                tabIndex={-1}
                onClick={closeMenu}
                className="pointer-events-auto fixed inset-0 z-20 cursor-default bg-transparent"
              />
              <div
                role="menu"
                aria-label="Account"
                className="pointer-events-auto absolute top-[calc(100%+8px)] right-0 z-30 w-64 rounded-lg border border-[#E0E0E0] bg-white py-2 shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
              >
                <div className="flex items-center gap-3 px-4 pt-1 pb-3">
                  <span
                    aria-hidden="true"
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-black font-display text-sm font-medium text-white"
                  >
                    {initial}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-sm font-medium text-black">
                      {me.username}
                    </p>
                    <p className="truncate text-sm leading-5 font-normal text-[#666666]">
                      {me.company_name ?? (me.company !== null ? `Company ${me.company}` : "No company")}
                    </p>
                  </div>
                </div>
                <p className="px-4 pb-3">
                  <StatusBadge status={me.role} />
                </p>
                <Hairline className="w-full" />
                <div className="flex flex-col gap-1 px-2 pt-2">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={closeMenu}
                    className="flex min-h-[44px] w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-left text-sm leading-5 font-normal text-black transition hover:bg-[#E8E8E8]"
                  >
                    <User className="h-5 w-5 shrink-0" aria-hidden="true" />
                    <span>Profile</span>
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={logout}
                    className="flex min-h-[44px] w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-left text-sm leading-5 font-normal text-black transition hover:bg-[#E8E8E8]"
                  >
                    <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="flex min-h-screen min-h-svh flex-col bg-white font-sans text-black antialiased">
      {sidebar ? (
        <div className="flex min-h-svh flex-col lg:flex-row">
          {sidebar}
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="pointer-events-none fixed inset-x-0 top-0 z-20 shrink-0 bg-transparent">
              <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-5">
                <div className="flex min-w-0 flex-1 items-center gap-2">{headerLead}</div>
                {headerActions}
              </div>
            </div>
            <main className="min-w-0 flex-1">{children}</main>
          </div>
        </div>
      ) : (
        <>
          <div className="sticky top-0 z-20 bg-white">
            <header className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between px-4 sm:px-5 lg:px-8">
              <Link to="/dashboard" className="flex items-center gap-3" aria-label="Knowledge dashboard">
                <Box className="h-7 w-7 text-black" aria-hidden="true" />
                <span className="font-display text-base leading-[23.2px] font-medium tracking-[-0.02em] text-black">
                  Knowledge
                </span>
              </Link>
              {headerActions}
            </header>
          </div>
          <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-6 sm:px-5 lg:px-8">{children}</main>
        </>
      )}
    </div>
  );
}
