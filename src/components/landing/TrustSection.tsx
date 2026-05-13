import { Star } from "lucide-react";

const logos = ["Sequoia", "a16z", "Lightspeed", "Accel", "Y Combinator", "Tiger", "Founders Fund", "Kleiner"];

const testimonials = [
  {
    name: "Anya Krishnan",
    role: "Founder, Lattice AI",
    quote: "Closed our seed in 6 weeks. The investor matching is unreasonably good.",
    rating: 5,
  },
  {
    name: "Marcus Vale",
    role: "Partner, Northwind Capital",
    quote: "The signal-to-noise here beats every other deal flow tool we use.",
    rating: 5,
  },
  {
    name: "Priya Shah",
    role: "Co-founder, Helio",
    quote: "From cold profile to a term sheet in 19 days. The data room shipped itself.",
    rating: 5,
  },
];

export function TrustSection() {
  return (
    <section className="relative border-y border-border bg-card/40 py-16 md:py-24">
      <div className="mx-auto w-full max-w-7xl px-4">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Trusted by the world's most ambitious operators
          </p>
          <div className="mx-auto mt-8 grid max-w-5xl grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4 md:grid-cols-8">
            {logos.map((l) => (
              <div
                key={l}
                className="font-display text-base font-semibold text-muted-foreground/70 transition-smooth hover:text-foreground"
              >
                {l}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className="group rounded-2xl border border-border bg-card p-6 shadow-card transition-smooth hover:-translate-y-1 hover:shadow-elegant"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, idx) => (
                  <Star key={idx} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-foreground">"{t.quote}"</p>
              <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary font-semibold text-primary-foreground">
                  {t.name[0]}
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
