import { Link, useNavigate } from "react-router";
import { motion, useReducedMotion } from "framer-motion";
import AppIcon from "./app-icon";

const NAV = ["Product", "Solutions", "Documents", "Pricing", "Security"];

export default function HomePage() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const isAuthed =
    typeof window !== "undefined" && !!localStorage.getItem("access_token");

  const rise = (delay: number) => ({
    initial: { opacity: 0, y: reduceMotion ? 0 : 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55, delay, ease: "easeOut" as const },
  });

  return (
    <div className="flex min-h-screen flex-col bg-white font-[Inter,ui-sans-serif,system-ui] text-neutral-950 antialiased">
      {/* ── Sharp bar nav ── */}
      <div className="shrink-0 px-4 pt-4 sm:px-6">
        <motion.header
          {...rise(0)}
          className="mx-auto flex h-14 max-w-5xl items-center justify-between border-2 border-neutral-950 bg-white py-2 pr-2 pl-4 shadow-[6px_6px_0_#0a0a0b]"
        >
          <Link to="/" className="flex items-center gap-2" aria-label="Company Knowledge AI home">
            <span className="grid h-7 w-7 place-items-center overflow-hidden border-2 border-neutral-950 bg-neutral-950 text-white">
              <AppIcon className="h-5 w-5" />
            </span>
            <span className="text-[15px] font-extrabold tracking-[-0.02em] uppercase">Company Knowledge AI</span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-6 text-[14px] font-bold tracking-[0.08em] text-neutral-600 lg:flex lg:items-center">
            {NAV.map((item) => (
              <span key={item} className="cursor-pointer border-b-2 border-transparent pb-0.5 transition hover:border-neutral-950 hover:text-neutral-950 tracking-tight">
                {item}
                {item === "Documents" && (
                  <span className="ml-1.5 border-2 border-neutral-950 bg-[#FFD02F] px-1.5 py-0.5 align-center text-[10px] font-extrabold tracking-[0.06em] text-neutral-950">
                    NEW
                  </span>
                )}
              </span>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="border-2 border-neutral-950 bg-white px-4 py-1.5 text-[13px] font-bold tracking-[-0.01em] text-neutral-950 shadow-[3px_3px_0_#0a0a0b] transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#0a0a0b] active:translate-x-0 active:translate-y-0 active:shadow-none"
            >
              Sign in
            </Link>
            <button
              type="button"
              onClick={() => navigate(isAuthed ? "/dashboard" : "/register")}
              className="border-2 border-neutral-950 bg-neutral-950 px-4 py-1.5 text-[13px] font-bold tracking-[-0.01em] text-white shadow-[3px_3px_0_#a3a3a3] transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#a3a3a3] active:translate-x-0 active:translate-y-0 active:shadow-none"
            >
              Contact
            </button>
          </div>
        </motion.header>
      </div>

      {/* ── Hero ── */}
      <main className="flex flex-1 flex-col">
        <section aria-label="Company Knowledge AI hero" className="relative flex flex-1 flex-col justify-center overflow-hidden">

          <div className="relative mx-auto my-auto w-full max-w-3xl px-5 py-10 text-center sm:px-8 sm:py-14">
            {/* ratings — sharp badges */}
            <motion.p {...rise(0.05)} className="flex flex-wrap items-center justify-center gap-2 text-[11.5px] font-extrabold tracking-widest uppercase">
              <span className="border-2 border-neutral-950 bg-white px-2.5 py-1 shadow-[3px_3px_0_#0a0a0b]">✓ Isolated</span>
              <span className="border-2 border-neutral-950 bg-neutral-950 px-2.5 py-1 text-white shadow-[3px_3px_0_#a3a3a3]">★ Cited</span>
            </motion.p>

            {/* headline — Inter tight letter-spacing, bold highlight */}
            <motion.h1
              {...rise(0.12)}
              className="mt-5 text-[2.75rem] leading-[0.98] font-extrabold tracking-tighter text-balance sm:text-6xl"
            >
              AI-powered answers to{" "}
              <span className="inline-block border border-neutral-950 bg-neutral-950 px-2 text-white shadow-[5px_5px_0_#a3a3a3]">
                stay organized
              </span>
            </motion.h1>

            <motion.p
              {...rise(0.2)}
              className="mx-auto mt-5 max-w-xl text-[14.5px] leading-relaxed font-medium tracking-[-0.01em] text-pretty text-neutral-600"
            >
              From PDFs to team chat, manage everything in one tenant-isolated place and keep your team moving forward.
            </motion.p>

            {/* CTAs — sharp + hard shadows */}
            <motion.div {...rise(0.28)} className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate(isAuthed ? "/dashboard" : "/register")}
                className="w-full border-2 border-neutral-950 bg-neutral-950 px-6 py-2.5 text-[13.5px] font-bold tracking-[-0.01em] text-white uppercase shadow-[5px_5px_0_#a3a3a3] transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0_#a3a3a3] active:translate-x-0 active:translate-y-0 active:shadow-none sm:w-auto cursor-pointer"
              >
                {isAuthed ? "Go to dashboard" : "Get started free"}
              </button>
              <Link
                to="/login"
                className="w-full border-2 border-neutral-950 bg-white px-6 py-2.5 text-center text-[13.5px] font-bold tracking-[-0.01em] text-neutral-950 uppercase shadow-[5px_5px_0_#0a0a0b] transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0_#0a0a0b] active:translate-x-0 active:translate-y-0 active:shadow-none sm:w-auto"
              >
                Sign in to workspace
              </Link>
            </motion.div>

          </div>
        </section>
      </main>
    </div>
  );
}
