import { useEffect, useState } from "react";
import HomeHeader from "./home/header";
import HeroSection from "./home/hero-section";
import FeaturesSection from "./home/features-section";
import StepsSection from "./home/steps-section";
import AppsSection from "./home/apps-section";
import StatsSection from "./home/stats-section";
import ResourcesSection from "./home/resources-section";
import CtaSection from "./home/cta-section";
import HomeFooter from "./home/footer";

export default function HomePage() {
  const [pageLoaded, setPageLoaded] = useState(false);

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
      <HomeHeader />
      <main className="flex flex-1 flex-col">
        <HeroSection rise={rise} />
        <FeaturesSection />
        <StepsSection />
        <AppsSection />
        <StatsSection />
        <ResourcesSection />
        <CtaSection />
      </main>
      <HomeFooter />
    </div>
  );
}