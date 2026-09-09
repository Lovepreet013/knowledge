import type { ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import AppIcon from "./app-icon";
import { useMe } from "./me-provider";
import type { Me } from "./me-provider";

function navItems(me: Me | null) {
  const items: { to: string; label: string }[] = [{ to: "/dashboard", label: "Dashboard" }];
  if (me !== null && me.company !== null) {
    items.push({ to: "/documents", label: "Documents" });
    items.push({ to: "/chat", label: "Chat" });
  }
  if (me?.role === "company_admin") items.push({ to: "/company-users", label: "Users" });
  if (me?.role === "superadmin") {
    items.push({ to: "/companies", label: "Companies" });
    items.push({ to: "/promote", label: "Promote" });
  }
  return items;
}

export default function AppShell({ children }: { children: ReactNode }) {
  // NOTE: me comes from MeProvider above <Routes> — never fetch here,
  // or the badge refetches (and visibly refreshes) on every page jump.
  const me = useMe();
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/");
  };

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "border-2 border-neutral-950 bg-neutral-950 px-3 py-1.5 text-[12px] font-extrabold tracking-[0.06em] text-white uppercase"
      : "border-2 border-neutral-950 bg-white px-3 py-1.5 text-[12px] font-extrabold tracking-[0.06em] uppercase transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#0a0a0b]";

  return (
    <div className="flex min-h-screen min-h-svh flex-col bg-white font-[Inter,ui-sans-serif,system-ui] text-neutral-950 antialiased">
      <div className="shrink-0 px-4 pt-4 sm:px-6">
        <header className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 border-2 border-neutral-950 bg-white py-2 pr-2 pl-4 shadow-[6px_6px_0_#0a0a0b]">
          <Link to="/dashboard" className="flex items-center gap-2" aria-label="Company Knowledge AI dashboard">
            <span className="grid h-7 w-7 place-items-center overflow-hidden border-2 border-neutral-950 bg-neutral-950 text-white">
              <AppIcon className="h-5 w-5" />
            </span>
            <span className="hidden text-[15px] font-extrabold tracking-[-0.02em] uppercase sm:block">
              Company Knowledge AI
            </span>
          </Link>
          <div className="flex items-center gap-2">
            {me !== null && (
              <span className="hidden max-w-48 truncate border-2 border-neutral-950 bg-[#FFD02F] px-2 py-1 text-[10.5px] font-extrabold tracking-[0.08em] uppercase md:block">
                {me.role} • {me.company_name ?? (me.company !== null ? `Co ${me.company}` : "No Co")}
              </span>
            )}
            <button
              type="button"
              onClick={logout}
              className="border-2 border-neutral-950 bg-white px-4 py-1.5 text-[13px] font-bold tracking-[-0.01em] shadow-[3px_3px_0_#0a0a0b] transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#0a0a0b] active:translate-x-0 active:translate-y-0 active:shadow-none cursor-pointer"
            >
              Logout
            </button>
          </div>
        </header>
        <nav aria-label="Workspace" className="mx-auto mt-3 flex max-w-6xl gap-2 overflow-x-auto pb-1">
          {(me === null ? [] : navItems(me)).map((n) => (
            <NavLink key={n.to} to={n.to} className={linkCls}>
              {n.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
