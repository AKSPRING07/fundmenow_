import { Brain, Bookmark, Calendar, MessageCircle, BarChart3, Settings2 } from "lucide-react";

const investors = [
  { name: "Northwind Capital", focus: "AI · Fintech · Climate", range: "$250K – $2M", stage: "Pre-seed → Seed", initials: "NC", portfolio: 47 },
  { name: "Halo Ventures", focus: "Healthtech · Bio", range: "$500K – $5M", stage: "Seed → Series A", initials: "HV", portfolio: 62 },
  { name: "Meridian Partners", focus: "B2B SaaS", range: "$1M – $10M", stage: "Series A → B", initials: "MP", portfolio: 38 },
];

const benefits = [
  { icon: Brain, title: "AI-powered deal flow", desc: "Recommendations tuned to your thesis." },
  { icon: Bookmark, title: "Save & track", desc: "Watchlists with funding-round alerts." },
  { icon: MessageCircle, title: "Direct founder DMs", desc: "Skip the warm intro chase." },
  { icon: Calendar, title: "1-click meetings", desc: "Calendar sync, no scheduling chaos." },
  { icon: BarChart3, title: "Live analytics", desc: "Traction metrics, pulled from the source." },
  { icon: Settings2, title: "Investment preferences", desc: "Filter by stage, geo, check size, vertical." },
];

export function InvestorExperience() {
  return (
    <section id="investors" className="relative py-24 md:py-32">
      <div className="mx-auto w-full max-w-7xl px-4">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
              For Investors
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight md:text-5xl">
              Deal flow that <span className="text-gradient-primary">filters itself.</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Sharper signal. Better founders. Less time on cold inbound. Built for partners, scouts, syndicates, and family offices.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {benefits.map((b) => (
                <div key={b.title} className="flex gap-3 rounded-xl border border-border bg-card p-4 transition-smooth hover:border-primary/40">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                    <b.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{b.title}</div>
                    <div className="text-xs text-muted-foreground">{b.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {investors.map((inv, i) => (
              <div
                key={inv.name}
                className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-card transition-smooth hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elegant"
                style={{ marginLeft: i === 1 ? "1.5rem" : i === 2 ? "3rem" : 0 }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-navy font-display text-sm font-bold text-navy-foreground">
                  {inv.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-display text-base font-semibold">{inv.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{inv.focus}</div>
                </div>
                <div className="hidden text-right sm:block">
                  <div className="text-xs text-muted-foreground">Check size</div>
                  <div className="text-sm font-semibold">{inv.range}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Portfolio</div>
                  <div className="font-display text-base font-bold">{inv.portfolio}</div>
                </div>
              </div>
            ))}

            <div className="mt-4 rounded-2xl bg-gradient-navy p-6 text-navy-foreground shadow-premium">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs opacity-70">This week</div>
                  <div className="font-display text-2xl font-bold">38 new matches</div>
                </div>
                <button className="rounded-lg bg-white/10 px-4 py-2 text-xs font-semibold backdrop-blur transition-smooth hover:bg-white/20">
                  View dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
