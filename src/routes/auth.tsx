import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { zodValidator } from "@tanstack/zod-adapter";
import { Loader2, Eye, EyeOff, Settings, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const searchSchema = z.object({
  role: z.enum(["startup", "investor"]).default("startup"),
  mode: z.enum(["signin", "signup"]).default("signin"),
});

export const Route = createFileRoute("/auth")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Sign in — Ventura" },
      { name: "description", content: "Sign in or create your Ventura account to access the startup-investor ecosystem." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { role, mode } = Route.useSearch();
  const navigate = useNavigate();
  const isSignup = mode === "signup";
  const isInvestor = role === "investor";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const switchMode = () =>
    navigate({ to: "/auth", search: { role, mode: isSignup ? "signin" : "signup" } });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { role, full_name: name, company_name: company },
          },
        });
        if (error) throw error;
        toast.success("Account created! Redirecting…");
        navigate({ to: "/dashboard" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate({ to: "/dashboard" });
      }
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const oauth = async (provider: "google" | "github") => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/dashboard` },
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message ?? "OAuth not configured");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-5 md:px-10">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600">
            <span className="font-display text-sm font-bold text-white">V</span>
          </div>
          <span className="font-display text-lg font-bold tracking-tight">Ventura<span className="text-emerald-500">.</span></span>
        </Link>
        <div className="flex items-center gap-5 text-sm text-muted-foreground">
          <button className="hidden items-center gap-1.5 hover:text-foreground sm:inline-flex">
            <span>Need help?</span>
          </button>
          <button aria-label="Settings" className="rounded-full p-1.5 hover:bg-muted">
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 pb-16 md:grid-cols-2 md:px-10 md:pt-8">
        {/* LEFT — Illustration */}
        <div className="hidden flex-col justify-between rounded-3xl bg-gradient-to-b from-muted/40 to-background p-10 md:flex">
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight">
              {isSignup ? "Hi, Get started" : "Hi, Welcome back"}
            </h1>
            <p className="mt-3 text-base text-muted-foreground">
              {isInvestor
                ? "Discover high-potential startups with intelligent matchmaking."
                : "More effectively with optimized workflows."}
            </p>
          </div>

          <div className="my-10 flex items-center justify-center">
            <IllustrationDashboard />
          </div>

          <div className="flex items-center justify-center gap-8 opacity-60 grayscale">
            <Logo>chase</Logo>
            <Logo>monday</Logo>
            <Logo>airbnb</Logo>
            <Logo>stripe</Logo>
            <Logo>notion</Logo>
          </div>
        </div>

        {/* RIGHT — Form */}
        <div className="flex items-center justify-center px-2 py-6 md:px-10">
          <div className="w-full max-w-md">
            <h2 className="font-display text-2xl font-bold tracking-tight">
              {isSignup ? "Create your account" : "Sign in to your account"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                onClick={switchMode}
                className="font-semibold text-emerald-600 hover:text-emerald-700"
              >
                {isSignup ? "Sign in" : "Get started"}
              </button>
            </p>

            <form onSubmit={submit} className="mt-8 space-y-5">
              {isSignup && (
                <>
                  <FloatField label="Full name" value={name} onChange={setName} placeholder="Ada Lovelace" required />
                  <FloatField
                    label={isInvestor ? "Firm (optional)" : "Startup name (optional)"}
                    value={company}
                    onChange={setCompany}
                    placeholder={isInvestor ? "Northwind Capital" : "Acme AI"}
                  />
                </>
              )}

              <FloatField
                label="Email address"
                value={email}
                onChange={setEmail}
                type="email"
                required
              />

              {!isSignup && (
                <div className="flex justify-end -mb-2">
                  <button
                    type="button"
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <FloatField
                label="Password"
                value={password}
                onChange={setPassword}
                type={showPwd ? "text" : "password"}
                placeholder="6+ characters"
                required
                trailing={
                  <button
                    type="button"
                    onClick={() => setShowPwd((s) => !s)}
                    aria-label={showPwd ? "Hide password" : "Show password"}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-foreground text-sm font-semibold text-background transition-colors hover:bg-foreground/90 disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : isSignup ? "Create account" : "Sign in"}
              </button>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-dashed border-border" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-background px-3 text-xs font-semibold tracking-wider text-muted-foreground">
                    OR
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-6">
                <SocialBtn label="Google" onClick={() => oauth("google")}>
                  <GoogleIcon />
                </SocialBtn>
                <SocialBtn label="GitHub" onClick={() => oauth("github")}>
                  <GitHubIcon />
                </SocialBtn>
                <SocialBtn label="X" onClick={() => toast.message("X login coming soon")}>
                  <XIcon />
                </SocialBtn>
              </div>

              <p className="pt-4 text-center text-[11px] leading-relaxed text-muted-foreground">
                By continuing, you agree to Ventura's{" "}
                <a className="underline hover:text-foreground" href="#">Terms of Service</a> and{" "}
                <a className="underline hover:text-foreground" href="#">Privacy Policy</a>.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Field with floating label ---------- */
function FloatField({
  label, value, onChange, placeholder, type = "text", required, trailing,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; required?: boolean; trailing?: React.ReactNode;
}) {
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? " "}
        required={required}
        className={`peer h-14 w-full rounded-lg border border-border bg-background px-4 pt-4 text-sm transition-colors placeholder:text-muted-foreground/50 focus:border-foreground focus:outline-none ${trailing ? "pr-11" : ""}`}
      />
      <label className="pointer-events-none absolute left-4 top-2 text-[11px] font-medium text-muted-foreground">
        {label}
      </label>
      {trailing && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">{trailing}</div>
      )}
    </div>
  );
}

function SocialBtn({ children, label, onClick }: { children: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-muted"
    >
      {children}
    </button>
  );
}

/* ---------- Icons ---------- */
function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-6 w-6">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.5 29.3 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.4-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.5 29.3 4.5 24 4.5 16.3 4.5 9.7 8.6 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 43.5c5.2 0 9.9-2 13.4-5.3l-6.2-5.1c-2 1.4-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.2-7.9l-6.5 5C9.6 39.4 16.2 43.5 24 43.5z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.2 5.1c-.4.4 6.6-4.8 6.6-14.7 0-1.2-.1-2.4-.4-3.5z"/>
    </svg>
  );
}
function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-foreground">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2c-3.2.7-3.87-1.36-3.87-1.36-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.25 3.34.95.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.7 5.4-5.27 5.69.41.36.78 1.07.78 2.16v3.2c0 .31.21.68.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z"/>
    </svg>
  );
}
function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-foreground">
      <path d="M18.244 2H21.5l-7.5 8.57L23 22h-6.844l-5.36-7.01L4.5 22H1.24l8.02-9.16L1 2h6.92l4.84 6.39L18.244 2zm-2.4 18h1.86L7.24 4H5.28l10.564 16z"/>
    </svg>
  );
}

function Logo({ children }: { children: React.ReactNode }) {
  return <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{children}</span>;
}

/* ---------- Decorative illustration ---------- */
function IllustrationDashboard() {
  return (
    <svg viewBox="0 0 360 280" className="h-64 w-full max-w-md">
      <defs>
        <linearGradient id="g1" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#3aa6ff" />
          <stop offset="1" stopColor="#0a72c9" />
        </linearGradient>
      </defs>
      {/* big card */}
      <rect x="20" y="40" width="220" height="160" rx="14" fill="hsl(var(--card))" stroke="hsl(var(--border))" />
      <circle cx="36" cy="56" r="3" fill="#ff6b6b" />
      <circle cx="46" cy="56" r="3" fill="#ffd93d" />
      <circle cx="56" cy="56" r="3" fill="#6bcB77" />
      <rect x="34" y="74" width="120" height="6" rx="3" fill="hsl(var(--muted))" />
      {/* phone */}
      <rect x="40" y="100" width="110" height="90" rx="10" fill="url(#g1)" />
      <path d="M55 170 q20 -40 40 -20 t40 -10" stroke="white" strokeWidth="3" fill="none" />
      <rect x="80" y="180" width="30" height="3" rx="1.5" fill="white" opacity=".8" />
      {/* image card */}
      <rect x="170" y="100" width="60" height="46" rx="6" fill="hsl(var(--muted))" />
      <circle cx="186" cy="118" r="6" fill="#ffd93d" />
      <path d="M178 138 l8 -10 l8 8 l10 -14 l8 16 z" fill="#6bcB77" />
      {/* pencil */}
      <rect x="240" y="110" width="60" height="10" rx="2" fill="#ffb84d" transform="rotate(45 270 115)" />
      {/* pie */}
      <circle cx="200" cy="200" r="28" fill="#ef4444" />
      <path d="M200 172 A28 28 0 0 1 228 200 L200 200 Z" fill="#22c55e" />
      <path d="M228 200 A28 28 0 0 1 200 228 L200 200 Z" fill="#3b82f6" />
      <path d="M200 228 A28 28 0 0 1 172 200 L200 200 Z" fill="#facc15" />
      {/* hand */}
      <circle cx="50" cy="220" r="14" fill="#34d399" />
      <rect x="56" y="200" width="14" height="22" rx="6" fill="#fcd5b5" />
    </svg>
  );
}
