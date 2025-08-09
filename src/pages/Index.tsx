import { Header } from "@/components/sections/header";
import { HeroSection } from "@/components/sections/hero-section";
import { AboutSection } from "@/components/sections/about-section";
import { CasesSection } from "@/components/sections/cases-section";
import { ContactSection } from "@/components/sections/contact-section";
import { Footer } from "@/components/sections/footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <AboutSection />
      <CasesSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
