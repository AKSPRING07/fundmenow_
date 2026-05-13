import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  TrendingUp,
  Users,
  Zap,
  CheckCircle2,
  BarChart3,
} from "lucide-react";
import { useEffect, useState } from "react";

function useCounter(target: number, duration = 1800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.floor(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

function Stat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const v = useCounter(value);
  return (
    <div className="flex flex-col">
      <span className="font-display text-2xl font-bold text-foreground md:text-3xl">
        {v.toLocaleString()}
        {suffix}
      </span>
      <span className="text-xs font-medium text-muted-foreground md:text-sm">{label}</span>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-hero pb-20 pt-32 md:pb-32 md:pt-40">
      <div className="absolute inset-0 grid-pattern opacity-60" />
      <div className="absolute -left-32 top-32 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-pulse-glow" />
      <div className="absolute -right-20 top-60 h-80 w-80 rounded-full bg-primary-glow/30 blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />

      <div className="relative mx-auto grid w-full max-w-7xl gap-12 px-4 lg:grid-cols-2 lg:items-center">
        <div className="animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            Live · 412 founders raising this week
          </div>

          <h1 className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
            Connecting <span className="text-gradient-primary">visionary startups</span> with smart investors.
          </h1>

          <p className="mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
            The premium ecosystem where ambitious founders raise capital, investors discover their next unicorn, and the startup community grows — together.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/role-select"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-elegant transition-smooth hover:shadow-glow hover:-translate-y-0.5"
            >
              Raise Capital
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link
              to="/role-select"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 text-sm font-semibold text-foreground shadow-card transition-smooth hover:border-primary/40 hover:-translate-y-0.5"
            >
              Discover Startups
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-6 border-t border-border pt-8">
            <Stat value={2400} suffix="+" label="Startups onboarded" />
            <Stat value={840} suffix="M+" label="Capital raised ($)" />
            <Stat value={1250} suffix="+" label="Active investors" />
          </div>
        </div>

        <div className="relative animate-fade-up" style={{ animationDelay: "0.15s" }}>
          <DashboardMock />
        </div>
      </div>
    </section>
  );
}

function DashboardMock() {
  return (
    <div className="relative">
      {/* glow */}
      <div className="absolute -inset-4 rounded-3xl bg-gradient-primary opacity-20 blur-2xl" />

      <div className="relative rounded-3xl border border-border bg-card p-5 shadow-premium">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-chart-4/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-success/70" />
          </div>
          <span className="text-xs font-medium text-muted-foreground">Founder Dashboard</span>
        </div>

        {/* main card */}
        <div className="rounded-2xl bg-gradient-navy p-5 text-navy-foreground">
          <div className="flex items-center justify-between text-xs opacity-80">
            <span>Total raised this round</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-success/20 px-2 py-0.5 text-success">
              <TrendingUp className="h-3 w-3" /> +28.4%
            </span>
          </div>
          <div className="mt-2 font-display text-3xl font-bold">$3,420,000</div>
          <div className="mt-1 text-xs opacity-70">Goal · $5,000,000</div>

          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-primary-glow to-primary-foreground" />
          </div>

          {/* mini chart */}
          <svg viewBox="0 0 300 80" className="mt-5 w-full">
            <defs>
              <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.85 0.12 245)" stopOpacity="0.6" />
                <stop offset="100%" stopColor="oklch(0.85 0.12 245)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0,60 C30,50 50,55 70,40 C95,22 120,45 150,35 C180,25 210,12 240,18 C270,22 290,10 300,8 L300,80 L0,80 Z"
              fill="url(#g1)"
            />
            <path
              d="M0,60 C30,50 50,55 70,40 C95,22 120,45 150,35 C180,25 210,12 240,18 C270,22 290,10 300,8"
              fill="none"
              stroke="oklch(0.92 0.05 245)"
              strokeWidth="2"
            />
          </svg>
        </div>

        {/* metric grid */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          {[
            { icon: Users, label: "Investors", value: "184", delta: "+12" },
            { icon: BarChart3, label: "Profile views", value: "9.2K", delta: "+24%" },
            { icon: Zap, label: "Meetings", value: "37", delta: "+5" },
            { icon: CheckCircle2, label: "Verified", value: "Pro", delta: "Tier 1" },
          ].map((m) => (
            <div key={m.label} className="rounded-xl border border-border bg-secondary/40 p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <m.icon className="h-3.5 w-3.5" />
                {m.label}
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="font-display text-lg font-semibold">{m.value}</span>
                <span className="text-[11px] font-medium text-success">{m.delta}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* floating cards */}
      <div className="absolute -left-6 top-24 hidden w-52 rounded-2xl border border-border bg-card p-3 shadow-elegant animate-float md:block">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">New investor match</div>
            <div className="text-sm font-semibold">Sequoia Scout</div>
          </div>
        </div>
      </div>

      <div className="absolute -right-4 -bottom-6 hidden w-56 rounded-2xl border border-border bg-card p-3 shadow-elegant animate-float md:block" style={{ animationDelay: "1.5s" }}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">MRR Growth</span>
          <span className="text-xs font-semibold text-success">+42%</span>
        </div>
        <div className="mt-2 flex items-end gap-1 h-10">
          {[30, 45, 38, 60, 52, 78, 90].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm bg-gradient-to-t from-primary to-primary-glow"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
