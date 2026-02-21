import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import EcosystemSection from "@/components/EcosystemSection";
import AlgorithmsSection from "@/components/AlgorithmsSection";
import WhyChooseSection from "@/components/WhyChooseSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <EcosystemSection />
      <AlgorithmsSection />
      <WhyChooseSection />
      <CTASection />
      <Footer />
    </>
  );
}
