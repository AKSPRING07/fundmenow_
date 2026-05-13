import {
  Users2,
  Wallet,
  GraduationCap,
  Calendar,
  Rocket,
  Handshake,
  Sparkles,
  Globe2,
} from "lucide-react";

const features = [
  { icon: Users2, title: "Founder Networking", desc: "Tap into a curated graph of 12K+ vetted operators." },
  { icon: Wallet, title: "Investor Access", desc: "1,250+ active investors actively writing checks." },
  { icon: GraduationCap, title: "Startup Mentorship", desc: "1:1 office hours with unicorn founders." },
  { icon: Sparkles, title: "Masterclasses", desc: "Live cohorts on fundraising, growth, and product." },
  { icon: Calendar, title: "Startup Events", desc: "Demo days and curated mixers in 14 cities." },
  { icon: Rocket, title: "Demo Days", desc: "Pitch live to a room of pre-qualified investors." },
  { icon: Handshake, title: "Co-founder Matching", desc: "Find your technical, design, or GTM partner." },
  { icon: Globe2, title: "Industry Communities", desc: "Vertical groups for AI, fintech, climate, health." },
];

export function Ecosystem() {
  return (
    <section id="community" className="relative py-24 md:py-32">
      <div className="mx-auto w-full max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
            <Sparkles className="h-3 w-3 text-primary" /> The Ecosystem
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight md:text-5xl">
            More than a marketplace.
            <br />
            <span className="text-gradient-primary">An operating system for founders.</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Capital is the start. We help you ship faster, hire smarter, and scale beyond the round.
          </p>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-card transition-smooth hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-elegant"
            >
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-primary opacity-0 blur-2xl transition-opacity group-hover:opacity-30" />
              <div className="relative">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
