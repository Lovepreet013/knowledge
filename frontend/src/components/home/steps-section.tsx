import { useState } from "react";
import { ArrowRight, FileUp, ListChecks } from "lucide-react";

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

function DocumentsPreview() {
  return (
    <>
      <p className="font-display text-xs leading-4 font-normal text-[#666666]">
        ingest · acme tenant
      </p>
      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-[#E0E0E0] px-4 py-3">
          <span className="flex items-center gap-3 text-sm font-normal text-black">
            <FileUp className="h-4 w-4" aria-hidden="true" />
            handbook.pdf
          </span>
          <span className="rounded bg-black px-2 py-0.5 font-display text-xs font-medium text-white">
            Ready
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-xl border border-[#E0E0E0] px-4 py-3">
          <span className="flex items-center gap-3 text-sm font-normal text-black">
            <FileUp className="h-4 w-4" aria-hidden="true" />
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
  );
}

function ChatPreview() {
  return (
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
  );
}

function MembersPreview() {
  return (
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
  );
}

const PREVIEW_MAP = {
  documents: DocumentsPreview,
  chat: ChatPreview,
  members: MembersPreview,
} as const;

export default function StepsSection() {
  const [activeStep, setActiveStep] = useState(0);
  const Preview = PREVIEW_MAP[STEPS[activeStep].mock];

  return (
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
              <Preview />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
