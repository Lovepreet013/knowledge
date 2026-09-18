import { useNavigate } from "react-router";
import { ArrowRight, Box } from "lucide-react";

export default function HomeFooter() {
  const navigate = useNavigate();

  return (
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
  );
}
