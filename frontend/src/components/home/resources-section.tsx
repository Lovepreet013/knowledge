import { useNavigate } from "react-router";
import {
  ArrowRight,
  FileUp,
  HeartHandshake,
  MessageCircleQuestionMark,
} from "lucide-react";

const RESOURCES = [
  {
    step: "Step 1",
    title: "Invite your team",
    body: "Share one code per company. Members land in the right tenant.",
    tint: "#DFF2E0",
    chip: "#BBF7D0",
    iconColor: "text-[#15803D]",
    icon: <HeartHandshake className="h-6 w-6" aria-hidden="true" />,
  },
  {
    step: "Step 2",
    title: "Upload first docs",
    body: "PDFs and TXTs chunk and embed with live status.",
    tint: "#DDEAF6",
    chip: "#BFDBFE",
    iconColor: "text-[#1D4ED8]",
    icon: <FileUp className="h-6 w-6" aria-hidden="true" />,
  },
  {
    step: "Step 3",
    title: "Ask with sources",
    body: "Chat cites handbook pages instead of guessing.",
    tint: "#E8DFF7",
    chip: "#DDD6FE",
    iconColor: "text-[#7C3AED]",
    icon: (
      <MessageCircleQuestionMark className="h-6 w-6" aria-hidden="true" />
    ),
  },
];

export default function ResourcesSection() {
  const navigate = useNavigate();

  return (
    <section aria-label="Resources" className="bg-white">
      <div className="mx-auto w-full max-w-[1200px] px-4 pb-14 sm:px-5 sm:pb-20 lg:px-8">
        <h2 className="font-display text-center text-[32px] leading-[36px] font-medium tracking-[-0.03em] text-black sm:text-[40px] sm:leading-[44px]">
          Your rollout starts here
        </h2>

        <div className="mt-8 grid gap-4 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3">
          {RESOURCES.map((c) => (
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
  );
}
