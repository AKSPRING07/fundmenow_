import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Rocket, Briefcase, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/role-select")({
  head: () => ({
    meta: [
      { title: "Choose Your Path — Ventura" },
      { name: "description", content: "Join Ventura as a startup founder or an investor." },
    ],
  }),
  component: RoleSelectPage,
});

function RoleSelectPage() {
  const navigate = useNavigate();

  const roles = [
    {
      id: "startup",
      title: "I'm a Founder",
      desc: "Raise capital, discover mentors, and scale your vision.",
      icon: Rocket,
      color: "from-blue-600 to-indigo-600",
      features: ["Verified investor database", "Fundraising workflows", "Ecosystem perks"],
      cta: "Join as Startup",
    },
    {
      id: "investor",
      title: "I'm an Investor",
      desc: "Discover vetted startups and manage your deal flow.",
      icon: Briefcase,
      color: "from-navy-600 to-blue-900",
      features: ["AI-powered deal sourcing", "KYC-verified startups", "Portfolio management"],
      cta: "Join as Investor",
    },
  ];

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/5 blur-[120px]" />
      </div>

      <header className="relative z-10 flex items-center justify-between px-6 py-6 md:px-12">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-elegant">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">Ventura<span className="text-gradient-primary">.</span></span>
        </Link>
      </header>

      <main className="relative z-10 flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-5xl">
          <div className="text-center mb-16">
            <h1 className="font-display text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
              Choose your <span className="text-gradient-primary">path</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Select the workspace that best fits your goals. Ventura provides tailored ecosystems for both visionary founders and strategic backers.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {roles.map((r) => (
              <div 
                key={r.id}
                onClick={() => navigate({ to: "/auth", search: { role: r.id as any, mode: "signup" } })}
                className="group relative overflow-hidden rounded-3xl border border-border bg-card p-10 shadow-card transition-smooth hover:-translate-y-2 hover:border-primary/40 hover:shadow-elegant cursor-pointer"
              >
                {/* Gradient Accent */}
                <div className={`absolute inset-0 bg-gradient-to-br ${r.color} opacity-0 transition-opacity group-hover:opacity-[0.03]`} />
                
                <div className={`mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${r.color} shadow-lg transition-smooth group-hover:scale-110`}>
                  <r.icon className="h-8 w-8 text-white" />
                </div>

                <h2 className="font-display text-2xl font-bold mb-3">{r.title}</h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">{r.desc}</p>

                <ul className="space-y-4 mb-10">
                  {r.features.map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm font-medium">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <CheckCircle2 className="h-3 w-3" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>

                <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-4 text-sm font-bold text-background transition-smooth hover:bg-foreground/90">
                  {r.cta} <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <p className="mt-12 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/auth" search={{ mode: "signin", role: "startup" }} className="font-bold text-primary hover:underline">Sign in here</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
