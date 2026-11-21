import { useEffect, useState } from "react";
import type { Development } from "./types/property";
import { Navbar } from "./components/Navbar";
import { DevelopmentsSection } from "./components/DevelopmentsSection";
import { FeaturedProperties } from "./components/FeaturedProperties";
import { WhyChooseUs } from "./components/WhyChooseUs";
import { AboutDeveloper } from "./components/AboutDeveloper";
import { ContactSection } from "./components/ContactSection";
import { Footer } from "./components/Footer";
import { apiUrl } from "./utils/api";

export default function App() {
  const [developments, setDevelopments] = useState<Development[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadDevelopments() {
      try {
        const res = await fetch(apiUrl("/api/developments"));
        if (res.ok && active) {
          const data = (await res.json()) as Development[];
          setDevelopments(data);
        }
      } catch {
        // Fallback handled smoothly by loading state
      } finally {
        if (active) setLoading(false);
      }
    }
    loadDevelopments();
    return () => {
      active = false;
    };
  }, []);

  const scrollToContact = () => {
    const el = document.getElementById("contact");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8F6] text-[#0B1829]">
      <Navbar onNavigateContact={scrollToContact} />
      <main className="flex-1">
        {/* <Hero /> */}
        <DevelopmentsSection developments={developments} loading={loading} />
        <FeaturedProperties developments={developments} />
        <WhyChooseUs />
        <AboutDeveloper />
        <ContactSection developments={developments} />
      </main>
      <Footer />
    </div>
  );
}
