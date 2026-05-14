import { Link } from "@tanstack/react-router";
import { Menu, X, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

const links = [
  { label: "Startups", href: "#startups" },
  { label: "Investors", href: "#investors" },
  { label: "Events", href: "#events" },
  { label: "Community", href: "#community" },
  { label: "Pricing", href: "#pricing" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-smooth ${
        scrolled ? "py-2" : "py-4"
      }`}
    >
      <div className="mx-auto w-full max-w-7xl px-4">
        <div
          className={`flex items-center justify-between rounded-2xl px-4 py-2.5 transition-smooth ${
            scrolled ? "glass shadow-card" : "bg-transparent"
          }`}
        >
          <Link to="/" className="flex items-center gap-2">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-elegant">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">
              Ventura<span className="text-gradient-primary">.</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-smooth hover:bg-accent hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-4 md:flex">
            <div className="flex items-center gap-1 border-r border-border pr-4 mr-2">
              <Link
                to="/auth"
                search={{ role: "investor", mode: "signin" }}
                className="rounded-lg px-3 py-1.5 text-xs font-bold text-muted-foreground transition-smooth hover:text-foreground"
              >
                Investor Login
              </Link>
              <Link
                to="/auth"
                search={{ role: "startup", mode: "signin" }}
                className="rounded-lg px-3 py-1.5 text-xs font-bold text-muted-foreground transition-smooth hover:text-foreground"
              >
                Startup Login
              </Link>
            </div>
            <Link
              to="/role-select"
              className="group relative overflow-hidden rounded-xl bg-gradient-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-elegant transition-smooth hover:shadow-glow"
            >
              Join Ventura
            </Link>
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg p-2 md:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="mt-2 rounded-2xl glass p-4 shadow-card md:hidden animate-scale-in">
            <nav className="flex flex-col gap-1">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  {l.label}
                </a>
              ))}
              <div className="mt-2 flex gap-2 border-t border-border pt-3">
                <Link to="/auth" search={{ role: "startup", mode: "signin" }} onClick={() => setOpen(false)} className="flex-1 rounded-lg border border-border px-4 py-2 text-center text-sm font-medium">
                  Login
                </Link>
                <Link to="/role-select" onClick={() => setOpen(false)} className="flex-1 rounded-lg bg-gradient-primary px-4 py-2 text-center text-sm font-semibold text-primary-foreground">
                  Get Started
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
