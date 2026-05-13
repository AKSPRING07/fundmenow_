import { Check, Sparkles } from "lucide-react";

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
  {
    name: "Investor Pro",
    price: "₹4,999",
    period: "/ month",
    desc: "Built for serious deal flow.",
    features: ["AI deal recommendations", "Full startup analytics", "Custom alerts & filters", "Direct founder access", "Investor-only events"],
    cta: "Join as investor",
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative py-24 md:py-32">
      <div className="mx-auto w-full max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
            Pricing
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight md:text-5xl">
            Built for every stage of the <span className="text-gradient-primary">journey</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Simple plans. No hidden fees. Cancel anytime. Powered by Razorpay.
          </p>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-4">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`group relative flex flex-col rounded-2xl border p-6 transition-smooth hover:-translate-y-1 ${
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
                <h3 className="font-display text-lg font-semibold">{p.name}</h3>
                <p className={`mt-1 text-xs ${p.highlight ? "opacity-70" : "text-muted-foreground"}`}>
                  {p.desc}
                </p>
              </div>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold tracking-tight">{p.price}</span>
                <span className={`text-sm ${p.highlight ? "opacity-70" : "text-muted-foreground"}`}>
                  {p.period}
                </span>
              </div>

              <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        p.highlight ? "text-primary-glow" : "text-primary"
                      }`}
                    />
                    <span className={p.highlight ? "opacity-90" : "text-foreground"}>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`mt-7 rounded-xl py-3 text-sm font-semibold transition-smooth ${
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
      </div>
    </section>
  );
}
