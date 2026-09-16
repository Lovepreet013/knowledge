import { useNavigate } from "react-router";

export default function CtaSection() {
  const navigate = useNavigate();

  return (
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
  );
}
