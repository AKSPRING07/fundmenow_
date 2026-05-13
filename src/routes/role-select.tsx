import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Rocket, Briefcase, ArrowRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/role-select")({
  head: () => ({
    meta: [
      { title: "Choose your role — Ventura" },
      { name: "description", content: "Continue as a startup founder raising capital, or as an investor discovering high-growth startups." },
    ],
  }),
  component: RoleSelectPage,
});

function RoleSelectPage() {
  const navigate = useNavigate();
  const go = (role: "startup" | "investor") =>
    navigate({ to: "/auth", search: { role, mode: "signin" } });

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-hero px-4 py-16">
      <div className="absolute inset-0 grid-pattern opacity-40" />
      <div className="absolute -left-24 top-24 h-80 w-80 rounded-full bg-primary/25 blur-3xl animate-pulse-glow" />
      <div className="absolute -right-24 bottom-24 h-96 w-96 rounded-full bg-primary-glow/30 blur-3xl animate-pulse-glow" style={{ animationDelay: "1.2s" }} />

      <div className="relative w-full max-w-5xl">
        <div className="text-center animate-fade-up">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-elegant">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold">Ventura<span className="text-gradient-primary">.</span></span>
          </Link>
          <h1 className="mt-8 font-display text-3xl font-bold tracking-tight md:text-5xl">
            How do you want to <span className="text-gradient-primary">join Ventura?</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Choose your path. You can always switch or add a second profile later.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <RoleCard
            icon={<Rocket className="h-6 w-6" />}
            tag="For Founders"
            title="Continue as Startup"
            description="Raise capital, get warm investor intros, and showcase your traction to a vetted network of backers."
            bullets={["Get matched to thesis-aligned investors", "Pitch deck + traction profile", "Direct DMs and intro requests"]}
            cta="Continue as Startup"
            onClick={() => go("startup")}
            accent="from-primary to-primary-glow"
          />
          <RoleCard
            icon={<Briefcase className="h-6 w-6" />}
            tag="For Investors"
            title="Continue as Investor"
            description="Discover high-signal startups, filter by thesis, and connect with founders before everyone else does."
            bullets={["AI-powered deal flow", "Save & track promising startups", "Direct founder DMs"]}
            cta="Continue as Investor"
            onClick={() => go("investor")}
            accent="from-[oklch(0.55_0.18_280)] to-primary"
          />
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/auth" search={{ role: "startup", mode: "signin" }} className="font-semibold text-foreground hover:text-primary">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

function RoleCard({
  icon, tag, title, description, bullets, cta, onClick, accent,
}: {
  icon: React.ReactNode; tag: string; title: string; description: string;
  bullets: string[]; cta: string; onClick: () => void; accent: string;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-3xl border border-border bg-card/80 p-8 text-left shadow-card backdrop-blur transition-smooth hover:-translate-y-1 hover:border-primary/40 hover:shadow-premium animate-fade-up"
    >
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-2xl transition-smooth group-hover:bg-primary/20" />

      <div className="relative">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary">
          {tag}
        </span>
        <div className="mt-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-elegant">
          {icon}
        </div>
        <h3 className="mt-5 font-display text-2xl font-bold">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>

        <ul className="mt-5 space-y-2">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-2 text-sm text-foreground/80">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              {b}
            </li>
          ))}
        </ul>

        <span className="mt-6 inline-flex items-center gap-2 font-semibold text-primary">
          {cta}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </button>
  );
}
