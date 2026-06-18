import Header from "@/components/Header";
import Hero from "@/components/Hero";
import PainSection from "@/components/PainSection";
import FeaturesSection from "@/components/FeaturesSection";
import DirectBookingSection from "@/components/DirectBookingSection";
import ForWhoSection from "@/components/ForWhoSection";
import PricingSection from "@/components/PricingSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FAQSection from "@/components/FAQSection";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <PainSection />
        <FeaturesSection />
        <DirectBookingSection />
        <ForWhoSection />
        <PricingSection />
        <TestimonialsSection />
        <FAQSection />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
