import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  LayoutGrid,
  LifeBuoy,
  Rocket,
} from "lucide-react";

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

export default function AppsSection() {
  return (
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
  );
}
