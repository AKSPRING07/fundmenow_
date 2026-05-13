import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { TrustSection } from "@/components/landing/TrustSection";
import { Ecosystem } from "@/components/landing/Ecosystem";
import { FeaturedStartups } from "@/components/landing/FeaturedStartups";
import { InvestorExperience } from "@/components/landing/InvestorExperience";
import { Events } from "@/components/landing/Events";
import { Pricing } from "@/components/landing/Pricing";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ventura — The Premium Startup & Investor Ecosystem" },
      {
        name: "description",
        content:
          "Ventura is the premium ecosystem connecting visionary startups with smart investors. Raise capital, discover startups, join masterclasses, and grow your company.",
      },
      { property: "og:title", content: "Ventura — Startup & Investor Ecosystem" },
      {
        property: "og:description",
        content: "Where founders raise capital and investors discover their next unicorn.",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@500;600;700;800&display=swap",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Hero />
        <TrustSection />
        <Ecosystem />
        <FeaturedStartups />
        <InvestorExperience />
        <Events />
        <Pricing />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
