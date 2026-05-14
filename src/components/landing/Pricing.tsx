import { useState } from "react";
import { Check, Sparkles, Building2, Search, DollarSign, User } from "lucide-react";

type Plan = {
  name: string;
  price: string;
  period: string;
  desc: string;
  features: string[];
  highlight?: boolean;
  cta: string;
};

const plans: Plan[] = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    desc: "Build your profile. Get discovered.",
    features: ["Public startup profile", "Browse investor directory", "Community access", "2 event tickets / quarter"],
    cta: "Start free",
  },
  {
    name: "Premium Founder",
    price: "₹2,499",
    period: "/ month",
    desc: "Everything you need to close the round.",
    features: ["Verified badge", "Priority investor matches", "Unlimited DMs", "Pitch deck analytics", "All masterclasses", "Mentor office hours"],
    highlight: true,
    cta: "Start raising",
  },
  {
    name: "Featured Startup",
    price: "₹6,999",
    period: "/ month",
    desc: "Top of every search. Maximum signal.",
    features: ["Everything in Premium", "Featured placement", "Demo Day priority", "Dedicated success manager", "PR & media support"],
    cta: "Get featured",
  },
];

export function Pricing() {
  const [activeRole, setActiveRole] = useState<"startup" | "investor">("startup");

  return (
    <section id="pricing" className="relative py-24 md:py-32">
      <div className="mx-auto w-full max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
            Get Started
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight md:text-5xl">
            Built for every stage of the <span className="text-gradient-primary">journey</span>
          </h2>
          
          {/* Role Switcher */}
          <div className="mx-auto mt-10 flex w-fit items-center gap-1 rounded-2xl border border-border bg-card p-1 shadow-card">
            <button
              onClick={() => setActiveRole("startup")}
              className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition-all ${
                activeRole === "startup"
                  ? "bg-primary text-primary-foreground shadow-elegant"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              For Startups
            </button>
            <button
              onClick={() => setActiveRole("investor")}
              className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition-all ${
                activeRole === "investor"
                  ? "bg-primary text-primary-foreground shadow-elegant"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              For Investors
            </button>
          </div>
        </div>

        <div className="mt-16">
          {activeRole === "startup" ? (
            <div className="grid gap-6 md:grid-cols-3">
              {plans.map((p) => (
                <div
                  key={p.name}
                  className={`group relative flex flex-col rounded-3xl border p-8 transition-smooth hover:-translate-y-1 ${
                    p.highlight
                      ? "border-transparent bg-gradient-navy text-navy-foreground shadow-premium scale-[1.02]"
                      : "border-border bg-card shadow-card hover:border-primary/40 hover:shadow-elegant"
                  }`}
                >
                  {p.highlight && (
                    <div className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-gradient-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-glow">
                      <Sparkles className="h-2.5 w-2.5" /> Most popular
                    </div>
                  )}

                  <div>
                    <h3 className="font-display text-xl font-bold">{p.name}</h3>
                    <p className={`mt-1.5 text-sm ${p.highlight ? "opacity-70" : "text-muted-foreground"}`}>
                      {p.desc}
                    </p>
                  </div>

                  <div className="mt-8 flex items-baseline gap-1">
                    <span className="font-display text-5xl font-bold tracking-tight">{p.price}</span>
                    <span className={`text-base ${p.highlight ? "opacity-70" : "text-muted-foreground"}`}>
                      {p.period}
                    </span>
                  </div>

                  <ul className="mt-8 flex-1 space-y-4 text-sm">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-3">
                        <div className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full ${
                          p.highlight ? "bg-primary-glow/20 text-primary-glow" : "bg-primary/10 text-primary"
                        }`}>
                          <Check className="h-3 w-3 shrink-0" strokeWidth={3} />
                        </div>
                        <span className={p.highlight ? "opacity-90" : "text-foreground"}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`mt-10 rounded-2xl py-4 text-sm font-bold transition-smooth ${
                      p.highlight
                        ? "bg-primary-foreground text-navy hover:bg-white"
                        : "bg-foreground text-background hover:bg-gradient-primary hover:text-primary-foreground"
                    }`}
                  >
                    {p.cta}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="mx-auto max-w-xl animate-fade-up">
              <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-premium">
                <div className="bg-gradient-primary p-6 text-center text-primary-foreground">
                  <h3 className="font-display text-2xl font-bold">Find the Next Unicorn</h3>
                  <p className="mt-1 text-sm opacity-90">Enter your details and start your search</p>
                </div>
                <form className="space-y-5 p-8" onSubmit={(e) => e.preventDefault()}>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Investor Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input 
                        type="text" 
                        placeholder="e.g. Jane Doe"
                        className="w-full rounded-2xl border border-border bg-secondary/50 py-3 pl-11 pr-4 text-sm transition-all focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Investor Domain</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input 
                        type="text" 
                        placeholder="e.g. Fintech, SaaS, AI"
                        className="w-full rounded-2xl border border-border bg-secondary/50 py-3 pl-11 pr-4 text-sm transition-all focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Amount ready to invest</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input 
                        type="text" 
                        placeholder="e.g. ₹10,00,000 - ₹50,00,000"
                        className="w-full rounded-2xl border border-border bg-secondary/50 py-3 pl-11 pr-4 text-sm transition-all focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground py-4 text-sm font-bold text-background transition-smooth hover:bg-gradient-primary hover:text-primary-foreground shadow-elegant"
                  >
                    <Search className="h-4 w-4" />
                    Search correct startup
                  </button>
                </form>
              </div>
              <p className="mt-6 text-center text-xs text-muted-foreground italic">
                By clicking search, our AI will match you with startups that fit your investment thesis.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
