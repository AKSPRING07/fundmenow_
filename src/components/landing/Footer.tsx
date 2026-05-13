import { Sparkles, Twitter, Linkedin, Github, Send } from "lucide-react";

const groups = [
  {
    title: "Platform",
    links: ["Startups", "Investors", "Events", "Masterclasses", "Demo Days"],
  },
  {
    title: "Community",
    links: ["Founders Hub", "Investor Network", "Mentors", "Co-founder Match", "Slack"],
  },
  {
    title: "Company",
    links: ["About", "Careers", "Press", "Contact", "Blog"],
  },
  {
    title: "Legal",
    links: ["Privacy", "Terms", "Cookies", "Disclosures", "Refund Policy"],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto w-full max-w-7xl px-4 py-16">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-elegant">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold tracking-tight">
                Ventura<span className="text-gradient-primary">.</span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              The premium startup ecosystem. Where founders raise, investors discover, and the next generation of companies gets built.
            </p>

            <form className="mt-6 flex max-w-sm gap-2">
              <input
                type="email"
                placeholder="you@startup.com"
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-smooth focus:border-primary"
              />
              <button className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-elegant transition-smooth hover:shadow-glow">
                <Send className="h-3.5 w-3.5" /> Join
              </button>
            </form>

            <div className="mt-6 flex gap-2">
              {[Twitter, Linkedin, Github].map((I, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-smooth hover:border-primary/40 hover:text-foreground"
                >
                  <I className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-8">
            {groups.map((g) => (
              <div key={g.title}>
                <div className="font-display text-sm font-semibold">{g.title}</div>
                <ul className="mt-4 space-y-2.5">
                  {g.links.map((l) => (
                    <li key={l}>
                      <a
                        href="#"
                        className="text-sm text-muted-foreground transition-smooth hover:text-foreground"
                      >
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <span>© 2026 Ventura Labs · All rights reserved.</span>
          <span>Built for the next generation of founders.</span>
        </div>
      </div>
    </footer>
  );
}
