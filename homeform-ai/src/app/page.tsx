import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Problem } from "@/components/landing/Problem";
import { BrandBand } from "@/components/landing/BrandBand";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { AnalysisShowcase } from "@/components/landing/AnalysisShowcase";
import { CoachSection } from "@/components/landing/CoachSection";
import { ProgressShowcase } from "@/components/landing/ProgressShowcase";
import { Pricing } from "@/components/landing/Pricing";
import { Faq } from "@/components/landing/Faq";
import { FinalCta, Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <BrandBand />
        <Problem />
        <HowItWorks />
        <AnalysisShowcase />
        <CoachSection />
        <ProgressShowcase />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
