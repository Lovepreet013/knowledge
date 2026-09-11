import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { Box, LogOut } from "lucide-react";

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

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/");
  };

  const headerActions = (
    <div className="flex shrink-0 items-center gap-3">
      <button
        type="button"
        onClick={logout}
        className="inline-flex min-h-[40px] cursor-pointer items-center gap-2 rounded-lg border border-[#E0E0E0] bg-transparent px-4 py-2 text-sm leading-[18.4px] font-normal text-black shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition hover:bg-[#F5F5F5]"
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
        Logout
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen min-h-svh flex-col bg-white font-sans text-black antialiased">
      {sidebar ? (
        <div className="flex min-h-svh flex-col lg:flex-row">
          {sidebar}
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="sticky top-0 z-20 shrink-0 bg-white">
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
              <Link to="/dashboard" className="flex items-center gap-3" aria-label="Knowledge AI dashboard">
                <Box className="h-7 w-7 text-black" aria-hidden="true" />
                <span className="font-display text-base leading-[23.2px] font-medium tracking-[-0.02em] text-black">
                  Knowledge AI
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
