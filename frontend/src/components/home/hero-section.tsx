import { useNavigate } from "react-router";
import { ArrowRight } from "lucide-react";
import { Pill } from "../ui";
import { getAccessToken } from "../../lib/api";

export default function HeroSection({ rise }: { rise: (delay: number) => string }) {
  const navigate = useNavigate();
  const isAuthed =
    typeof window !== "undefined" && getAccessToken() !== null;

  return (
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
              What is our refund policy?
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
  );
}
