import { Calendar, MapPin, Mic2, Users } from "lucide-react";

const events = [
  {
    title: "Founder Demo Day · Q2",
    date: "Jun 14, 2026",
    location: "San Francisco · Hybrid",
    type: "Demo Day",
    speakers: 12,
    countdown: "12d : 04h",
    color: "from-blue-500 to-indigo-600",
  },
  {
    title: "AI Infra Masterclass",
    date: "Jun 22, 2026",
    location: "Live · Online",
    type: "Masterclass",
    speakers: 4,
    countdown: "20d : 11h",
    color: "from-violet-500 to-fuchsia-600",
  },
  {
    title: "Investor Mixer · NYC",
    date: "Jul 02, 2026",
    location: "Brooklyn, NY",
    type: "Networking",
    speakers: 8,
    countdown: "30d : 02h",
    color: "from-emerald-500 to-teal-600",
  },
];

export function Events() {
  return (
    <section id="events" className="relative bg-secondary/40 py-24 md:py-32">
      <div className="mx-auto w-full max-w-7xl px-4">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
              Events & Masterclasses
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight md:text-5xl">
              Where deals <span className="text-gradient-primary">get done.</span>
            </h2>
          </div>
          <button className="rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold transition-smooth hover:border-primary/40">
            View all events →
          </button>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {events.map((e) => (
            <article
              key={e.title}
              className="group overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-smooth hover:-translate-y-1.5 hover:shadow-elegant"
            >
              <div className={`relative h-40 bg-gradient-to-br ${e.color} p-5`}>
                <div className="absolute inset-0 grid-pattern opacity-20" />
                <div className="relative flex h-full flex-col justify-between text-white">
                  <span className="inline-flex w-fit items-center rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur">
                    {e.type}
                  </span>
                  <div>
                    <div className="text-[11px] uppercase tracking-wider opacity-80">Starts in</div>
                    <div className="font-display text-2xl font-bold tabular-nums">{e.countdown}</div>
                  </div>
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-display text-lg font-semibold">{e.title}</h3>
                <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> {e.date}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> {e.location}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mic2 className="h-3.5 w-3.5" /> {e.speakers} speakers
                  </div>
                </div>
                <button className="mt-5 w-full rounded-lg bg-foreground py-2.5 text-xs font-semibold text-background transition-smooth group-hover:bg-gradient-primary group-hover:text-primary-foreground">
                  Register now
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
