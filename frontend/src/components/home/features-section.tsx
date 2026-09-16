import { useNavigate } from "react-router";
import {
  FileUp,
  Layers,
  MessagesSquare,
  ShieldCheck,
  Users,
} from "lucide-react";
import { MarketingCard } from "../ui";

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

export default function FeaturesSection() {
  const navigate = useNavigate();

  return (
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
  );
}
