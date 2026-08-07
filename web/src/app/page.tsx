import { Navbar } from "@/components/ui/navbar";
import { ScrollProgress } from "@/components/landing/scroll-progress";
import { Hero } from "@/components/landing/hero";
import { LiveTerminalSection } from "@/components/landing/live-terminal-section";
import { ProblemSection } from "@/components/landing/problem-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FeaturesGrid } from "@/components/landing/features-grid";
import { PricingSection } from "@/components/landing/pricing-section";
import { SocialProof } from "@/components/landing/social-proof";
import { Faq } from "@/components/landing/faq";
import { CtaBanner } from "@/components/landing/cta-banner";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <>
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        <LiveTerminalSection />
        <ProblemSection />
        <HowItWorks />
        <FeaturesGrid />
        <PricingSection />
        <SocialProof />
        <Faq />
        <CtaBanner />
      </main>
      <Footer />
    </>
  );
}
