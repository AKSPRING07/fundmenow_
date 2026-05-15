import { Star } from "lucide-react";
import { Marquee } from "@/components/magicui/marquee";

const logos = [
  { name: "Sequoia", domain: "sequoiacap.com" },
  { name: "a16z", domain: "a16z.com" },
  { name: "Lightspeed", domain: "lsvp.com" },
  { name: "Accel", domain: "accel.com" },
  { name: "Y Combinator", domain: "ycombinator.com" },
  { name: "Tiger Global", domain: "tigerglobal.com" },
  { name: "Founders Fund", domain: "foundersfund.com" },
  { name: "Kleiner Perkins", domain: "kleinerperkins.com" },
  { name: "Benchmark", domain: "benchmark.com" },
  { name: "Greylock", domain: "greylock.com" },
  { name: "Index Ventures", domain: "indexventures.com" },
  { name: "Bessemer", domain: "bvp.com" },
];

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
  {
    name: "David Chen",
    role: "CEO, Techflow",
    quote: "The quality of investors here is unmatched. We found our lead in days.",
    rating: 5,
  },
  {
    name: "Sarah Jenkins",
    role: "Founder, GreenScale",
    quote: "Finally an ecosystem that actually understands what founders need.",
    rating: 5,
  },
  {
    name: "Alex Rivera",
    role: "Partner, Blue Ocean Ventures",
    quote: "A game-changer for deal flow discovery and due diligence efficiency.",
    rating: 5,
  },
];

const firstRow = testimonials.slice(0, testimonials.length / 2);
const secondRow = testimonials.slice(testimonials.length / 2);

function TestimonialCard({ t }: { t: typeof testimonials[0] }) {
  return (
    <div className="w-[350px] group rounded-2xl border border-border bg-card p-6 shadow-card transition-smooth hover:-translate-y-1 hover:shadow-elegant">
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
  );
}

export function TrustSection() {
  return (
    <section className="relative overflow-hidden border-y border-border bg-card/40 py-16 md:py-24">
      <div className="mx-auto w-full max-w-7xl px-4">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Trusted by the world's most ambitious operators
          </p>
          <div className="relative mt-12 w-full overflow-hidden">
            <Marquee className="[--duration:30s] [--gap:4rem] opacity-50 grayscale transition-all hover:opacity-100 hover:grayscale-0">
              {logos.map((l) => (
                <div key={l.name} className="flex items-center justify-center px-4">
                  <img
                    src={`https://logo.clearbit.com/${l.domain}`}
                    alt={l.name}
                    className="h-7 w-auto object-contain md:h-9"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                      (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="font-display text-sm font-bold text-muted-foreground">${l.name}</span>`;
                    }}
                  />
                </div>
              ))}
            </Marquee>
            {/* Gradients to fade edges of logos */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/6 bg-gradient-to-r from-card/40 to-transparent"></div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/6 bg-gradient-to-l from-card/40 to-transparent"></div>
          </div>
        </div>

        <div className="mt-20 relative flex w-full flex-col items-center justify-center overflow-hidden">
          <Marquee reverse pauseOnHover className="[--duration:40s] [--gap:1.5rem]">
            {firstRow.map((t) => (
              <TestimonialCard key={t.name} t={t} />
            ))}
          </Marquee>
          <Marquee pauseOnHover className="[--duration:45s] [--gap:1.5rem] mt-4">
            {secondRow.map((t) => (
              <TestimonialCard key={t.name} t={t} />
            ))}
          </Marquee>

          {/* Gradients to fade edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background/80 to-transparent"></div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background/80 to-transparent"></div>
        </div>
      </div>
    </section>
  );
}
