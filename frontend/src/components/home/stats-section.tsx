import { ArrowRight, ChartColumn, FileText } from "lucide-react";

export default function StatsSection() {
  return (
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
              tenant's data.
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
                  <FileText className="h-3 w-3" aria-hidden="true" />
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
  );
}
