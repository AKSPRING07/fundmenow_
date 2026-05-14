import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="mx-auto w-full max-w-7xl px-4">
        <div className="relative overflow-hidden rounded-3xl bg-navy text-navy-foreground shadow-premium md:p-16 p-10">
          {/* Background Image with Overlay */}
          <img 
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop" 
            alt="Collaboration" 
            className="absolute inset-0 h-full w-full object-cover opacity-20 transition-all duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy/95 to-primary/20" />
          <div className="absolute inset-0 bg-gradient-mesh opacity-40" />
          
          <div className="absolute -left-10 top-10 h-48 w-48 rounded-full bg-primary-glow/30 blur-3xl animate-float-slow" />
          <div className="absolute -right-10 bottom-10 h-56 w-56 rounded-full bg-primary/30 blur-3xl animate-float-slow" style={{ animationDelay: "2s" }} />

          <div className="relative mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">
              Join 12,000+ founders & investors
            </span>
            <h2 className="mt-5 font-display text-3xl font-bold tracking-tight md:text-6xl">
              Join the future of <br />
              <span className="bg-gradient-to-r from-primary-glow to-white bg-clip-text text-transparent">
                startup investing.
              </span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-sm opacity-80 md:text-base">
              Whether you're shipping the next category-defining company or backing it — your ecosystem starts here.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link to="/role-select" className="group inline-flex items-center gap-2 rounded-xl bg-primary-foreground px-7 py-3.5 text-sm font-semibold text-navy shadow-elegant transition-smooth hover:bg-white hover:-translate-y-0.5">
                Raise Capital
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link to="/role-select" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-semibold backdrop-blur transition-smooth hover:bg-white/10 hover:-translate-y-0.5">
                Become an Investor
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
