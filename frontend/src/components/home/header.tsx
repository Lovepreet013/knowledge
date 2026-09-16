import { Link, useNavigate } from "react-router";
import { Box } from "lucide-react";
import { getAccessToken } from "../../lib/api";

const NAV = ["Product", "Solutions", "Documents", "Pricing", "Security"];

export default function HomeHeader() {
  const navigate = useNavigate();
  const isAuthed =
    typeof window !== "undefined" && getAccessToken() !== null;

  return (
    <div className="sticky top-0 z-20 border-b border-[#e8e8e8] bg-white">
      <header className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between px-4 sm:px-5 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-3"
          aria-label="Knowledge home"
        >
          <Box className="h-7 w-7 shrink-0 text-black" aria-hidden="true" />
          <span className="font-display text-base leading-[23.2px] font-medium tracking-[-0.02em] text-black">
            Knowledge
          </span>
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-1 lg:flex"
        >
          {NAV.map((item) => (
            <span
              key={item}
              className="cursor-pointer rounded px-4 py-2 text-base leading-[23.2px] font-normal text-black transition hover:bg-[#F5F5F5]"
            >
              {item}
            </span>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="inline-flex min-h-[40px] items-center justify-center rounded-lg px-4 py-2 text-sm leading-[18.4px] font-normal text-black transition hover:bg-[#F5F5F5]"
          >
            Log in
          </Link>

          <button
            type="button"
            onClick={() =>
              navigate(isAuthed ? "/dashboard" : "/register")
            }
            className="inline-flex min-h-[40px] cursor-pointer items-center justify-center rounded-lg bg-black px-4 py-2 text-sm leading-[18.4px] font-normal text-white transition hover:opacity-85 active:bg-[#1A1A1A]"
          >
            Get started
          </button>
        </div>
      </header>
    </div>
  );
}
