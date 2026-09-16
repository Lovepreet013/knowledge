import type { ReactNode } from "react";
import { Link } from "react-router";
import { ArrowLeft, Box } from "lucide-react";

/**
 * Shared two-column layout for login and register pages.
 * Left column: scrollable form content (passed as children).
 * Right column: hero image with overlay text (desktop only).
 */
export default function AuthLayout({
  aside,
  children,
}: {
  /** Overlay content shown on the right-side image panel. */
  aside: { headline: string; sub: string };
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen min-h-svh flex-col bg-white font-sans text-black antialiased">
      {/* ── Header ── */}
      <div className="sticky top-0 z-20 bg-white shadow-[0px_1px_0px_0px_rgba(0,0,0,0.16)]">
        <header className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between px-4 sm:px-5 lg:px-8">
          <Link
            to="/"
            className="flex min-w-0 items-center gap-3"
            aria-label="Knowledge home"
          >
            <Box className="h-7 w-7 shrink-0 text-black" aria-hidden="true" />
            <span className="font-display text-base leading-[23.2px] font-medium tracking-[-0.02em] text-black">
              Knowledge
            </span>
          </Link>
          <Link
            to="/"
            className="inline-flex min-h-[40px] shrink-0 items-center justify-center gap-2 rounded-lg border border-[#E0E0E0] bg-transparent px-4 py-2 text-sm leading-[18.4px] font-normal text-black shadow-xs transition hover:bg-[#F5F5F5]"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
            Back to home
          </Link>
        </header>
      </div>

      {/* ── Body: two columns ── */}
      <main className="flex min-w-0 flex-1 flex-col">
        <section
          aria-label="Authentication"
          className="grid min-w-0 flex-1 lg:grid-cols-2"
        >
          {/* Left — form content */}
          <div className="flex min-w-0 w-full max-w-full flex-col justify-start px-4 py-10 sm:px-5 lg:px-0 lg:py-14 lg:pr-12 lg:pl-[max(2rem,calc((100vw-75rem)/2+2rem))]">
            <div className="mx-auto min-w-0 w-full max-w-md lg:mx-0">
              {children}
            </div>
          </div>

          {/* Right — hero image */}
          <aside
            aria-label="Product preview"
            className="relative hidden overflow-hidden lg:block"
          >
            <img
              src="/login.webp"
              alt="Misty lakeside mountains in the style of a Japanese woodblock print"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-white/70 to-transparent"
            />
            <div className="absolute inset-x-0 top-0 p-8 lg:p-14">
              <span aria-hidden="true" className="flex h-7 items-center">
                <span className="block h-1 w-8 bg-black" />
              </span>
              <p className="font-display mt-4 max-w-xs text-[32px] leading-[36px] font-medium tracking-[-0.03em] text-black sm:text-[36px] sm:leading-[40px]">
                {aside.headline}
              </p>
              <p className="mt-3 max-w-xs text-base leading-[23.2px] font-normal text-black">
                {aside.sub}
              </p>
            </div>
          </aside>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-[#E0E0E0] bg-white">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-2 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-5 lg:px-8">
          <p className="text-xs leading-4 font-normal text-[#666666]">
            © 2026 Knowledge. All rights reserved.
          </p>
          <p className="flex items-center gap-6 text-xs leading-4 font-normal text-[#666666]">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Support</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
