import { BadgeCheck, Bookmark, Search, SlidersHorizontal, Star, TrendingUp, Users } from "lucide-react";
import { useState } from "react";

type Startup = {
  name: string;
  industry: string;
  ask: string;
  stage: string;
  pitch: string;
  interest: number;
  featured?: boolean;
  initials: string;
  color: string;
};

const startups: Startup[] = [
  { name: "Lattice AI", industry: "AI Infra", ask: "$2.5M", stage: "Seed", pitch: "Inference orchestration for enterprise AI workloads.", interest: 84, featured: true, initials: "LA", color: "from-blue-500 to-cyan-500" },
  { name: "Helio Health", industry: "Healthtech", ask: "$5M", stage: "Series A", pitch: "AI co-pilot reducing diagnostic time by 62%.", interest: 121, featured: true, initials: "HH", color: "from-emerald-500 to-teal-500" },
  { name: "Northwind", industry: "Climate", ask: "$1.2M", stage: "Pre-seed", pitch: "Carbon capture as a service for industrial emitters.", interest: 47, initials: "NW", color: "from-indigo-500 to-purple-500" },
  { name: "Quill", industry: "Fintech", ask: "$3M", stage: "Seed", pitch: "Embedded compliance for cross-border payments.", interest: 62, initials: "QL", color: "from-amber-500 to-orange-500" },
  { name: "Atlas Robotics", industry: "Hardware", ask: "$8M", stage: "Series A", pitch: "Autonomous warehouse arms. 3.4x faster picks.", interest: 98, initials: "AR", color: "from-rose-500 to-pink-500" },
  { name: "Verdant", industry: "Agritech", ask: "$1.8M", stage: "Seed", pitch: "Soil intelligence platform for regenerative farms.", interest: 39, initials: "VR", color: "from-lime-500 to-emerald-500" },
];

const filters = ["All", "AI Infra", "Healthtech", "Climate", "Fintech", "Hardware", "Agritech"];

export function FeaturedStartups() {
  const [active, setActive] = useState("All");
  const visible = active === "All" ? startups : startups.filter((s) => s.industry === active);

  return (
    <section id="startups" className="relative bg-secondary/40 py-24 md:py-32">
      <div className="mx-auto w-full max-w-7xl px-4">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
              Marketplace
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight md:text-5xl">
              Featured <span className="text-gradient-primary">startups</span> raising now
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Verified founders. Real traction. Active rounds.
            </p>
          </div>

          <div className="flex w-full max-w-md items-center gap-2 rounded-xl border border-border bg-card p-1.5 shadow-card md:w-auto">
            <Search className="ml-2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search startups, industries..."
              className="flex-1 bg-transparent px-1 py-1.5 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button className="flex items-center gap-1.5 rounded-lg bg-gradient-primary px-3 py-2 text-xs font-semibold text-primary-foreground">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
            </button>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-smooth ${
                active === f
                  ? "bg-foreground text-background shadow-elegant"
                  : "border border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((s) => (
            <article
              key={s.name}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card transition-smooth hover:-translate-y-1 hover:border-primary/40 hover:shadow-elegant"
            >
              {s.featured && (
                <div className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-gradient-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                  <Star className="h-2.5 w-2.5 fill-current" /> Featured
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${s.color} font-display text-base font-bold text-white shadow-elegant`}>
                  {s.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-display text-base font-semibold">{s.name}</h3>
                    <BadgeCheck className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-xs text-muted-foreground">{s.industry} · {s.stage}</div>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{s.pitch}</p>

              <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Raising</div>
                  <div className="font-display text-lg font-bold text-foreground">{s.ask}</div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  <span className="font-semibold text-foreground">{s.interest}</span> interested
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button className="flex-1 rounded-lg bg-foreground py-2 text-xs font-semibold text-background transition-smooth group-hover:bg-gradient-primary group-hover:text-primary-foreground">
                  Request Intro
                </button>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-smooth hover:border-primary/40 hover:text-primary">
                  <Bookmark className="h-3.5 w-3.5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
