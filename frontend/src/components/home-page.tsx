import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowRight,
  BookOpen,
  Box,
  ChartColumn,
  FileText,
  FileUp,
  GraduationCap,
  HeartHandshake,
  Layers,
  LayoutGrid,
  LifeBuoy,
  ListChecks,
  MessageCircleQuestionMark,
  MessagesSquare,
  Rocket,
  ShieldCheck,
  Users,
} from "lucide-react";
import { MarketingCard, Pill } from "./ui";
import { getAccessToken } from "../lib/api";

const NAV = ["Product", "Solutions", "Documents", "Pricing", "Security"];

const FEATURES = [
  {
    title: "Documents & Ingest",
    body: "Admins upload PDFs and TXTs once. Parsing, chunking, and Gemini embeddings run automatically with per-file status.",
    icon: <FileUp className="h-4 w-4" aria-hidden="true" />,
  },
  {
    title: "Chat with sources",
    body: "Every answer cites the exact company documents it came from, so teams can verify instead of guessing.",
    icon: <MessagesSquare className="h-4 w-4" aria-hidden="true" />,
  },
  {
    title: "Tenant isolation",
    body: "Retrieval filters by company before any similarity math runs. No tenant ever sees another tenant's chunks.",
    icon: <ShieldCheck className="h-4 w-4" aria-hidden="true" />,
  },
  {
    title: "Roles & invites",
    body: "Superadmins create companies, share invite codes, and promote company admins. Admins manage their own members.",
    icon: <Users className="h-4 w-4" aria-hidden="true" />,
  },
];

const APPS = [
  {
    name: "Policy Q&A",
    desc: "Ask handbook questions, get cited answers.",
    popular: true,
    tint: "#FDE8D8",
    icon: <BookOpen className="h-4 w-4" aria-hidden="true" />,
  },
  {
    name: "Support macros",
    desc: "Draft replies grounded in your docs.",
    popular: true,
    tint: "#DDEAF6",
    icon: <LifeBuoy className="h-4 w-4" aria-hidden="true" />,
  },
  {
    name: "Onboarding guide",
    desc: "New hires self-serve with sources.",
    popular: false,
    tint: "#E8DFF7",
    icon: <GraduationCap className="h-4 w-4" aria-hidden="true" />,
  },
  {
    name: "Release notes",
    desc: "Summarize changes per company.",
    popular: false,
    tint: "#DFF2E0",
    icon: <Rocket className="h-4 w-4" aria-hidden="true" />,
  },
];

const STEPS = [
  {
    name: "Documents",
    desc: "PDFs chunked into 600-word windows, embedded with Gemini.",
    mock: "documents" as const,
  },
  {
    name: "Chat",
    desc: "Top-5 company-scoped chunks answer with citations.",
    mock: "chat" as const,
  },
  {
    name: "Members",
    desc: "Invite codes onboard users straight into the tenant.",
    mock: "members" as const,
  },
];

export default function HomePage() {
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);
  const [pageLoaded, setPageLoaded] = useState(false);

  const isAuthed =
    typeof window !== "undefined" && getAccessToken() !== null;

  /*
   * Trigger the initial hero animation after the first paint.
   * Using requestAnimationFrame ensures the browser first renders
   * the initial opacity/transform state, then transitions to visible.
   */
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setPageLoaded(true);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  /*
   * NOTE: the "Upload once, ask anything" preview card below remounts via
   * key={activeStep}, and its .preview-enter mount animation (index.css)
   * plays on every step change. An earlier state-toggled
   * opacity/translate approach was removed: flipping classes off and on
   * around requestAnimationFrame never reliably re-triggered the
   * transition, so step clicks swapped content with no visible motion.
   */

  /*
   * Tailwind's JIT compiler needs the class names to exist as
   * literal strings in the source. Keeping the delay classes here
   * ensures all of them are generated correctly.
   */
  const rise = (delay: number) => {
    const delayClass =
      delay === 0.05
        ? "delay-[50ms]"
        : delay === 0.12
          ? "delay-[120ms]"
          : delay === 0.2
            ? "delay-[200ms]"
            : delay === 0.28
              ? "delay-[280ms]"
              : delay === 0.4
                ? "delay-[400ms]"
                : delay === 0.46
                  ? "delay-[460ms]"
                  : "delay-0";

    return [
      "transform-gpu",
      "transition-all",
      "duration-500",
      "ease-out",
      delayClass,
      pageLoaded
        ? "translate-y-0 opacity-100"
        : "translate-y-4 opacity-0",
    ].join(" ");
  };

  return (
    <div className="flex min-h-screen flex-col bg-white font-sans text-black antialiased">
      {/* ── Header ── */}
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

      <main className="flex flex-1 flex-col">
        {/* ── Hero ── */}
        <section
          aria-label="Knowledge hero"
          className="hero-bg relative overflow-hidden"
        >
          <div className="relative mx-auto w-full max-w-[1200px] px-4 pt-12 pb-8 text-center sm:px-5 lg:px-8">
            {/* Announcement */}
            <div className={rise(0.05)}>
              <div className="flex justify-center">
                <Pill>
                  <span className="font-display rounded-full bg-[#FFB3B3] px-2 py-0.5 text-xs leading-4 font-medium text-black">
                    New
                  </span>

                  <span className="text-black">
                    Tenant-isolated RAG
                  </span>

                  <ArrowRight
                    className="h-4 w-4 text-black"
                    aria-hidden="true"
                  />
                </Pill>
              </div>
            </div>

            {/* Hero heading */}
            <h1
              className={`mx-auto mt-8 max-w-3xl font-display text-4xl leading-[36px] font-medium tracking-[-0.03em] text-balance text-black sm:text-[56px] sm:leading-[56px] ${rise(
                0.12,
              )}`}
            >
              The AI your company documents deserve
            </h1>

            {/* Hero description */}
            <p
              className={`mx-auto mt-6 max-w-xl text-lg leading-[25.2px] font-normal text-pretty text-black ${rise(
                0.2,
              )}`}
            >
              Upload PDFs once, chat with citations forever. Every answer
              scoped to your tenant, nothing shared across companies.
            </p>

            {/* Hero buttons */}
            <div
              className={`mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row ${rise(
                0.28,
              )}`}
            >
              <button
                type="button"
                onClick={() =>
                  navigate(isAuthed ? "/dashboard" : "/register")
                }
                className="inline-flex min-h-[46px] w-full cursor-pointer items-center justify-center rounded-lg bg-black px-[22px] py-3 text-base leading-[18.4px] font-normal text-white transition hover:opacity-85 active:bg-[#1A1A1A] sm:w-auto"
              >
                {isAuthed ? "Go to dashboard" : "Start free trial"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="inline-flex min-h-[46px] w-full cursor-pointer items-center justify-center rounded-lg bg-[#7C3AED] px-[22px] py-3 text-base leading-[18.4px] font-normal text-white transition hover:opacity-85 sm:w-auto"
              >
                Get a demo
              </button>
            </div>

            {/* CSS-only product motif */}
            <div
              aria-hidden="true"
              className={`relative mx-auto mt-12 max-w-4xl ${rise(0.4)}`}
            >
              <div className="grid-floor h-44 rounded-xl border border-[#E0E0E0] bg-white/60" />

              <div className="absolute top-4 left-4 rounded-xl border border-[#E0E0E0] bg-white/80 px-4 py-3 text-left shadow-[0_4px_12px_rgba(0,0,0,0.08)] backdrop-blur sm:left-12">
                <p className="font-display text-xs leading-4 font-normal text-[#666666]">
                  handbook.pdf
                </p>

                <p className="font-display mt-1 text-base font-medium text-black">
                  Chunked + embedded
                </p>
              </div>

              <div className="absolute top-16 right-4 rounded-xl border border-[#E0E0E0] bg-white/80 px-4 py-3 text-left shadow-[0_4px_12px_rgba(0,0,0,0.08)] backdrop-blur sm:right-12">
                <p className="font-display text-xs leading-4 font-normal text-[#666666]">
                  chat
                </p>

                <p className="font-display mt-1 text-base font-medium text-black">
                  “What is our refund policy?”
                </p>
              </div>
            </div>

            {/* Company strip */}
            <div
              className={`mt-12 border-t border-[#E0E0E0] pt-8 ${rise(
                0.46,
              )}`}
            >
              <p className="font-display text-md leading-[18.2px] font-normal text-[#666666]">
                Tenant-isolated teams run on Knowledge
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[#999999]">
                {["ACME", "Globex", "Initech", "Umbrella", "Hooli"].map(
                  (logo) => (
                    <span
                      key={logo}
                      className="font-display text-xl font-medium tracking-[-0.02em]"
                    >
                      {logo}
                    </span>
                  ),
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Feature grid ── */}
        <section aria-label="Platform" className="bg-white">
          <div className="mx-auto w-full max-w-[1200px] px-4 py-14 sm:px-5 sm:py-20 lg:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="flex items-center gap-2 font-display text-sm leading-[18.2px] font-normal text-[#666666]">
                  <Layers className="h-4 w-4" aria-hidden="true" />
                  The knowledge platform
                </p>

                <h2 className="font-display mt-4 max-w-md text-[32px] leading-[36px] font-medium tracking-[-0.03em] text-black sm:text-[40px] sm:leading-[44px]">
                  Built for tenant-isolated answers
                </h2>
              </div>

              <div className="max-w-md">
                <p className="text-base leading-[23.2px] font-normal text-black">
                  One pipeline from upload to cited chat — scoped by company
                  at every query, managed by roles your team already
                  understands.
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-lg border border-black bg-transparent px-[22px] py-3 text-base leading-[18.4px] font-normal text-black transition hover:bg-[#F5F5F5]"
                >
                  Explore the platform
                </button>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((f) => (
                <MarketingCard
                  key={f.title}
                  title={f.title}
                  body={f.body}
                  icon={f.icon}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section aria-label="How it works" className="bg-white">
          <div className="mx-auto w-full max-w-[1200px] px-4 pb-14 sm:px-5 sm:pb-20 lg:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="flex items-center gap-2 font-display text-sm leading-[18.2px] font-normal text-[#666666]">
                  <ListChecks className="h-4 w-4" aria-hidden="true" />
                  How it works
                </p>

                <h2 className="font-display mt-4 max-w-md text-[32px] leading-[36px] font-medium tracking-[-0.03em] text-black sm:text-[40px] sm:leading-[44px]">
                  Upload once, ask anything
                </h2>
              </div>
            </div>

            <div className="mt-8 grid items-stretch gap-4 lg:grid-cols-2">
              {/* Step selector */}
              <div className="flex flex-col overflow-hidden rounded-xl border border-[#E0E0E0]">
                {STEPS.map((step, i) => {
                  const isActive = i === activeStep;

                  return (
                    <button
                      key={step.name}
                      type="button"
                      onClick={() => setActiveStep(i)}
                      aria-pressed={isActive}
                      className={`group flex flex-1 items-center justify-between gap-4 border-b border-[#E0E0E0] px-6 py-4 text-left transition-colors duration-300 last:border-b-0 focus-visible:outline-none ${isActive
                          ? "dot-grid bg-[#EDE9FE]/60"
                          : "bg-white hover:bg-[#F5F5F5]"
                        }`}
                    >
                      <span>
                        <span className="font-display block text-base font-medium text-black">
                          <span className="mr-2 inline-block w-6 font-display text-sm font-normal text-[#999999]">
                            0{i + 1}
                          </span>

                          {step.name}
                        </span>

                        <span className="mt-1 block pl-8 text-sm leading-5 font-normal text-[#666666]">
                          {step.desc}
                        </span>
                      </span>

                      <span
                        className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border transition-all duration-300 group-hover:scale-105 ${isActive
                            ? "border-black bg-black text-white"
                            : "border-[#E0E0E0] bg-white text-black"
                          }`}
                      >
                        <ArrowRight
                          className={`h-4 w-4 transition-transform duration-300 ${isActive
                              ? ""
                              : "group-hover:translate-x-0.5"
                            }`}
                          aria-hidden="true"
                        />
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Animated preview */}
              <div className="dot-grid rounded-xl bg-[#EDE9FE]/50 p-4 sm:p-6">
                <div
                  key={activeStep}
                  className="preview-enter flex h-full min-h-[360px] flex-col justify-center rounded-xl border border-[#E0E0E0] bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.08)] sm:min-h-[300px]"
                >
                  {STEPS[activeStep].mock === "documents" && (
                    <>
                      <p className="font-display text-xs leading-4 font-normal text-[#666666]">
                        ingest · acme tenant
                      </p>

                      <div className="mt-4 space-y-3">
                        <div className="flex items-center justify-between gap-3 rounded-xl border border-[#E0E0E0] px-4 py-3">
                          <span className="flex items-center gap-3 text-sm font-normal text-black">
                            <FileUp
                              className="h-4 w-4"
                              aria-hidden="true"
                            />
                            handbook.pdf
                          </span>

                          <span className="rounded bg-black px-2 py-0.5 font-display text-xs font-medium text-white">
                            Ready
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-3 rounded-xl border border-[#E0E0E0] px-4 py-3">
                          <span className="flex items-center gap-3 text-sm font-normal text-black">
                            <FileUp
                              className="h-4 w-4"
                              aria-hidden="true"
                            />
                            policy.txt
                          </span>

                          <span className="rounded bg-[#EDE9FE] px-2 py-0.5 font-display text-xs font-medium text-[#7C3AED]">
                            Embedding
                          </span>
                        </div>

                        <p className="pt-1 text-center font-display text-xs leading-4 font-normal text-[#666666]">
                          12 chunks · 768-d vectors · tenant-scoped
                        </p>
                      </div>
                    </>
                  )}

                  {STEPS[activeStep].mock === "chat" && (
                    <>
                      <p className="font-display text-xs leading-4 font-normal text-[#666666]">
                        conversation · acme tenant
                      </p>

                      <div className="mt-4 space-y-3">
                        <div className="ml-auto max-w-[80%] rounded-xl rounded-br-sm bg-black px-4 py-3 text-sm leading-5 font-normal text-white">
                          What is our refund policy?
                        </div>

                        <div className="max-w-[85%] rounded-xl rounded-bl-sm border border-[#E0E0E0] bg-white px-4 py-3 text-sm leading-5 font-normal text-black">
                          Refunds are issued within 30 days of purchase with a
                          receipt. See handbook §4.

                          <span className="mt-2 flex flex-wrap gap-2">
                            <span className="font-display rounded bg-[#FFB3B3] px-2 py-0.5 text-xs font-medium text-black">
                              handbook.pdf
                            </span>

                            <span className="font-display rounded bg-[#F5F5F5] px-2 py-0.5 text-xs font-medium text-black">
                              policy.txt
                            </span>
                          </span>
                        </div>
                      </div>
                    </>
                  )}

                  {STEPS[activeStep].mock === "members" && (
                    <>
                      <p className="font-display text-xs leading-4 font-normal text-[#666666]">
                        members · acme tenant
                      </p>

                      <div className="mt-4 space-y-3">
                        <div className="flex items-center justify-between gap-3 rounded-xl bg-[#F5F5F5] px-4 py-3">
                          <span className="font-display text-sm font-medium tracking-[0.04em] text-black">
                            ACME-8X2K
                          </span>

                          <span className="rounded-lg border border-black bg-white px-3 py-1.5 font-display text-xs font-medium text-black">
                            Copy invite
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-3 rounded-xl border border-[#E0E0E0] px-4 py-3">
                          <span className="flex items-center gap-3 text-sm font-normal text-black">
                            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#EDE9FE] font-display text-xs font-medium text-[#7C3AED]">
                              P
                            </span>

                            priya · company admin
                          </span>

                          <span className="rounded bg-black px-2 py-0.5 font-display text-xs font-medium text-white">
                            Active
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── App cards ── */}
        <section aria-label="Use cases" className="bg-white">
          <div className="mx-auto w-full max-w-[1200px] px-4 pb-14 sm:px-5 sm:pb-20 lg:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="flex items-center gap-2 font-display text-sm leading-[18.2px] font-normal text-[#666666]">
                  <LayoutGrid className="h-4 w-4" aria-hidden="true" />
                  Use cases
                </p>

                <h2 className="font-display mt-4 max-w-md text-[32px] leading-[36px] font-medium tracking-[-0.03em] text-black sm:text-[40px] sm:leading-[44px]">
                  Answers for every team, every function
                </h2>
              </div>

              <p className="max-w-md pb-1 text-base leading-[23.2px] font-normal text-black lg:text-right">
                Start from a proven pattern, then point it at your own tenant
                documents.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {APPS.map((a) => (
                <article
                  key={a.name}
                  className="group rounded-xl bg-[#F5F5F5] p-6 transition-shadow duration-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
                >
                  <div className="flex items-start justify-between">
                    <span
                      className="grid h-8 w-8 place-items-center rounded-full text-black"
                      style={{ background: a.tint }}
                    >
                      {a.icon}
                    </span>

                    {a.popular && (
                      <span className="font-display rounded bg-[#EDE9FE] px-2 py-0.5 text-xs leading-4 font-medium text-[#7C3AED]">
                        POPULAR
                      </span>
                    )}
                  </div>

                  <h3 className="font-display mt-4 text-base font-medium text-black">
                    {a.name}
                  </h3>

                  <p className="mt-1 text-sm leading-5 font-normal text-[#666666]">
                    {a.desc}
                  </p>

                  <p className="mt-4 inline-flex items-center gap-2 text-sm font-normal text-black">
                    Use this pattern

                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pastel stats ── */}
        <section aria-label="Results" className="bg-white">
          <div className="mx-auto w-full max-w-[1200px] px-4 pb-14 sm:px-5 sm:pb-20 lg:px-8">
            <p className="flex items-center gap-2 font-display text-sm leading-[18.2px] font-normal text-[#666666]">
              <ChartColumn className="h-4 w-4" aria-hidden="true" />
              Why teams switch
            </p>

            <h2 className="font-display mt-4 max-w-lg text-[32px] leading-[36px] font-medium tracking-[-0.03em] text-black sm:text-[40px] sm:leading-[44px]">
              Isolated by default, cited by design
            </h2>

            <div className="mt-8 grid gap-4 sm:mt-12 sm:grid-cols-2 lg:grid-cols-4">
              {/* Large tile */}
              <article className="group flex min-h-[320px] flex-col rounded-xl bg-[#FDE8D8] p-6 transition hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] sm:col-span-2 lg:row-span-2">
                <p className="font-display text-[32px] leading-[36px] font-medium tracking-[-0.03em] text-black">
                  100%
                </p>

                <p className="mt-2 max-w-sm text-sm leading-5 font-normal text-black">
                  of retrieved chunks scoped to your company
                </p>

                <p className="mt-4 max-w-sm text-sm leading-5 font-normal text-black">
                  Every query is filtered to your company before any similarity
                  search runs. Documents, chunks, and conversations never
                  cross tenant boundaries — no tenant ever sees another
                  tenant’s data.
                </p>

                <p className="mt-auto flex items-center justify-between gap-2 pt-6 text-sm leading-5 font-normal text-black">
                  <span>Isolation</span>

                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </p>
              </article>

              {/* Wide tile */}
              <article className="group flex min-h-[190px] flex-col rounded-xl bg-[#DDEAF6] p-6 transition hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] sm:col-span-2 lg:col-span-2">
                <p className="font-display text-[32px] leading-[36px] font-medium tracking-[-0.03em] text-black">
                  5
                </p>

                <p className="mt-2 max-w-md text-sm leading-5 font-normal text-black">
                  cited sources attached to every answer
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {["handbook.pdf", "policy.txt"].map((name) => (
                    <span
                      key={name}
                      className="font-display inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs leading-4 font-medium text-black"
                    >
                      <FileText
                        className="h-3 w-3"
                        aria-hidden="true"
                      />

                      {name}
                    </span>
                  ))}
                </div>

                <p className="mt-auto flex items-center justify-between gap-2 pt-4 text-sm leading-5 font-normal text-black">
                  <span>Citations</span>

                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </p>
              </article>

              {/* Embeddings */}
              <article className="group flex min-h-[190px] flex-col rounded-xl bg-[#E8DFF7] p-6 transition hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
                <p className="font-display text-[32px] leading-[36px] font-medium tracking-[-0.03em] text-black">
                  768-d
                </p>

                <p className="mt-2 text-sm leading-5 font-normal text-black">
                  Gemini embeddings per document chunk
                </p>

                <p className="mt-auto flex items-center justify-between gap-2 pt-4 text-sm leading-5 font-normal text-black">
                  <span>Embeddings</span>

                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </p>
              </article>

              {/* Accessibility */}
              <article className="group flex min-h-[190px] flex-col rounded-xl bg-[#DFF2E0] p-6 transition hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
                <p className="font-display text-[32px] leading-[36px] font-medium tracking-[-0.03em] text-black">
                  44px
                </p>

                <p className="mt-2 text-sm leading-5 font-normal text-black">
                  minimum touch targets across the app
                </p>

                <p className="mt-auto flex items-center justify-between gap-2 pt-4 text-sm leading-5 font-normal text-black">
                  <span>Accessible</span>

                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* ── Resources ── */}
        <section aria-label="Resources" className="bg-white">
          <div className="mx-auto w-full max-w-[1200px] px-4 pb-14 sm:px-5 sm:pb-20 lg:px-8">
            <h2 className="font-display text-center text-[32px] leading-[36px] font-medium tracking-[-0.03em] text-black sm:text-[40px] sm:leading-[44px]">
              Your rollout starts here
            </h2>

            <div className="mt-8 grid gap-4 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  step: "Step 1",
                  title: "Invite your team",
                  body: "Share one code per company. Members land in the right tenant.",
                  tint: "#DFF2E0",
                  chip: "#BBF7D0",
                  iconColor: "text-[#15803D]",
                  icon: (
                    <HeartHandshake
                      className="h-6 w-6"
                      aria-hidden="true"
                    />
                  ),
                },
                {
                  step: "Step 2",
                  title: "Upload first docs",
                  body: "PDFs and TXTs chunk and embed with live status.",
                  tint: "#DDEAF6",
                  chip: "#BFDBFE",
                  iconColor: "text-[#1D4ED8]",
                  icon: (
                    <FileUp
                      className="h-6 w-6"
                      aria-hidden="true"
                    />
                  ),
                },
                {
                  step: "Step 3",
                  title: "Ask with sources",
                  body: "Chat cites handbook pages instead of guessing.",
                  tint: "#E8DFF7",
                  chip: "#DDD6FE",
                  iconColor: "text-[#7C3AED]",
                  icon: (
                    <MessageCircleQuestionMark
                      className="h-6 w-6"
                      aria-hidden="true"
                    />
                  ),
                },
              ].map((c) => (
                <article
                  key={c.title}
                  className="group flex min-h-[240px] flex-col overflow-hidden rounded-xl border border-[#E0E0E0] bg-white transition hover:border-[#CCCCCC] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
                >
                  <div
                    className="dot-grid relative flex h-28 shrink-0 items-center justify-between gap-4 overflow-hidden px-6"
                    style={{ background: c.tint }}
                  >
                    <span
                      className={`grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white ${c.iconColor}`}
                    >
                      {c.icon}
                    </span>

                    <span className="font-display rounded-full bg-white px-3 py-1 text-xs leading-4 font-medium text-[#666666]">
                      {c.step}
                    </span>

                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-6 -bottom-8 scale-[5] -rotate-12 text-black/15"
                    >
                      {c.icon}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="font-display text-base leading-[22.4px] font-medium tracking-[-0.02em] text-black">
                      {c.title}
                    </h3>

                    <p className="mt-2 flex-1 text-sm leading-5 font-normal text-[#666666]">
                      {c.body}
                    </p>

                    <button
                      type="button"
                      onClick={() => navigate("/register")}
                      className="mt-4 inline-flex items-center gap-2 self-start text-sm font-normal text-black transition hover:text-[#972121] hover:underline hover:decoration-[#972121] hover:underline-offset-4"
                    >
                      Get started

                      <ArrowRight
                        className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA band ── */}
        <section aria-label="Get started" className="bg-white">
          <div className="mx-auto w-full max-w-[1200px] px-4 pb-14 sm:px-5 sm:pb-20 lg:px-8">
            <div className="rounded-xl bg-black px-6 py-12 text-center sm:px-12">
              <h2 className="font-display mx-auto max-w-xl text-[32px] leading-[36px] font-medium tracking-[-0.03em] text-white sm:text-[40px] sm:leading-[44px]">
                Bring cited answers to your company
              </h2>

              <p className="mx-auto mt-4 max-w-md text-base leading-[23.2px] font-normal text-white/80">
                Create a tenant, share the invite code, upload the handbook.
                Done.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="inline-flex min-h-[46px] w-full cursor-pointer items-center justify-center rounded-lg bg-white px-[22px] py-3 text-base leading-[18.4px] font-normal text-black transition hover:opacity-85 sm:w-auto"
                >
                  Start free trial
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="inline-flex min-h-[46px] w-full cursor-pointer items-center justify-center rounded-lg border border-white/40 bg-transparent px-[22px] py-3 text-base leading-[18.4px] font-normal text-white transition hover:bg-white/10 sm:w-auto"
                >
                  Get a demo
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Dark footer ── */}
      <footer className="bg-[#111111] text-white">
        <div className="mx-auto w-full max-w-[1200px] px-4 py-14 sm:px-5 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                h: "Platform",
                links: ["Documents", "Chat", "Embeddings", "Status"],
              },
              {
                h: "Solutions",
                links: [
                  "Support teams",
                  "Operations",
                  "Onboarding",
                  "Compliance",
                ],
              },
              {
                h: "Resources",
                links: [
                  "Rollout guide",
                  "Isolation model",
                  "Support",
                  "Changelog",
                ],
              },
              {
                h: "Company",
                links: ["About", "Security", "Contact", "Legal"],
              },
            ].map((col) => (
              <nav key={col.h} aria-label={col.h}>
                <p className="font-display flex items-center gap-2 border-b border-white/10 pb-3 text-base font-medium text-white">
                  {col.h}

                  <ArrowRight
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                </p>

                <ul className="mt-4 space-y-3">
                  {col.links.map((l) => (
                    <li
                      key={l}
                      className="text-sm leading-5 font-normal text-white/60 transition hover:text-white"
                    >
                      {l}
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Box className="h-7 w-7 text-white" aria-hidden="true" />

              <span className="font-display text-base font-medium text-white">
                Knowledge
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="inline-flex min-h-[40px] cursor-pointer items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-normal text-black transition hover:opacity-85"
              >
                Start free trial
              </button>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="inline-flex min-h-[40px] cursor-pointer items-center justify-center rounded-lg border border-white/40 bg-transparent px-4 py-2 text-sm font-normal text-white transition hover:bg-white/10"
              >
                Get a demo
              </button>
            </div>
          </div>

          <p className="mt-8 font-display text-xs leading-4 font-normal text-white/40">
            © 2026 Knowledge · Tenant-isolated answers with cited sources
          </p>
        </div>
      </footer>
    </div>
  );
}