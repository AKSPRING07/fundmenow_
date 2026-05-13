import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { zodValidator } from "@tanstack/zod-adapter";
import { Sparkles, Rocket, Briefcase, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";
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
  const [loading, setLoading] = useState(false);

  const switchMode = () =>
    navigate({ to: "/auth", search: { role, mode: isSignup ? "signin" : "signup" } });

  const switchRole = () =>
    navigate({ to: "/auth", search: { role: isInvestor ? "startup" : "investor", mode } });

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

  const accent = isInvestor
    ? "from-[oklch(0.55_0.18_280)] to-primary"
    : "from-primary to-primary-glow";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-hero px-4 py-10">
      <div className="absolute inset-0 grid-pattern opacity-40" />
      <div className="absolute -left-24 top-24 h-80 w-80 rounded-full bg-primary/25 blur-3xl animate-pulse-glow" />
      <div className="absolute -right-24 bottom-24 h-96 w-96 rounded-full bg-primary-glow/30 blur-3xl animate-pulse-glow" style={{ animationDelay: "1.2s" }} />

      <div className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-border bg-card/80 shadow-premium backdrop-blur-xl">
        <div className="grid md:grid-cols-2">
          {/* LEFT — Form */}
          <div className="p-8 md:p-12">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-elegant">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold">Ventura<span className="text-gradient-primary">.</span></span>
            </Link>

            <div className="mt-8 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary">
                {isInvestor ? <Briefcase className="h-3 w-3" /> : <Rocket className="h-3 w-3" />}
                {isInvestor ? "Investor" : "Startup"}
              </span>
              <button
                onClick={switchRole}
                type="button"
                className="text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Switch role
              </button>
            </div>

            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
              {isSignup ? "Create your account" : "Welcome back"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {isSignup
                ? `Join Ventura as ${isInvestor ? "an investor" : "a founder"}.`
                : "Sign in to continue to your dashboard."}
            </p>

            <form onSubmit={submit} className="mt-8 space-y-4">
              {isSignup && (
                <>
                  <Field label="Full name" value={name} onChange={setName} placeholder="Ada Lovelace" required />
                  <Field
                    label={isInvestor ? "Firm (optional)" : "Startup name (optional)"}
                    value={company}
                    onChange={setCompany}
                    placeholder={isInvestor ? "Northwind Capital" : "Acme AI"}
                  />
                </>
              )}
              <Field label="Email" value={email} onChange={setEmail} placeholder="you@company.com" type="email" required />
              <Field label="Password" value={password} onChange={setPassword} placeholder="••••••••" type="password" required />

              {!isSignup && (
                <div className="flex justify-end">
                  <button type="button" className="text-xs font-medium text-muted-foreground hover:text-primary">
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${accent} px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-elegant transition-smooth hover:shadow-glow disabled:opacity-60`}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>
                  {isSignup ? "Create account" : "Sign in"}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              {isSignup ? "Already have an account?" : "New to Ventura?"}{" "}
              <button onClick={switchMode} className="font-semibold text-foreground hover:text-primary">
                {isSignup ? "Sign in" : "Create one"}
              </button>
            </p>
          </div>

          {/* RIGHT — Promo */}
          <div className={`relative hidden overflow-hidden bg-gradient-to-br ${accent} p-12 text-primary-foreground md:flex md:flex-col md:justify-center`}>
            <div className="absolute -left-10 top-10 h-48 w-48 rounded-full bg-white/20 blur-3xl animate-float-slow" />
            <div className="absolute -right-10 bottom-10 h-56 w-56 rounded-full bg-white/10 blur-3xl animate-float-slow" style={{ animationDelay: "2s" }} />
            <div className="relative">
              <h2 className="font-display text-4xl font-bold leading-tight">
                {isSignup
                  ? (isInvestor ? "Discover your next breakout investment." : "Raise capital from investors who get it.")
                  : (isInvestor ? "Welcome back, partner." : "Your next round starts here.")}
              </h2>
              <p className="mt-4 text-base opacity-90">
                {isInvestor
                  ? "AI-curated deal flow, founder DMs, and live traction analytics — all in one ecosystem."
                  : "Showcase your traction, get warm intros, and close your round faster."}
              </p>

              <div className="mt-10 grid grid-cols-3 gap-4">
                <Stat label={isInvestor ? "Active deals" : "Investors"} value="1,250+" />
                <Stat label="Capital raised" value="$840M" />
                <Stat label="Verified" value="100%" />
              </div>

              <div className="mt-10 rounded-2xl bg-white/10 p-5 backdrop-blur-md">
                <p className="text-sm italic opacity-90">
                  “Ventura gave us our lead investor in 9 days. The match quality is unreal.”
                </p>
                <div className="mt-3 text-xs font-semibold opacity-80">— Maya R., Founder · Helix Bio</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, type = "text", required,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; required?: boolean;
}) {
  const isPassword = type === "password";
  const [show, setShow] = useState(false);
  const inputType = isPassword ? (show ? "text" : "password") : type;
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>
      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={`w-full rounded-xl border border-border bg-background px-4 py-3 text-sm transition-smooth placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${isPassword ? "pr-11" : ""}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-smooth hover:text-foreground"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-display text-2xl font-bold">{value}</div>
      <div className="text-xs opacity-80">{label}</div>
    </div>
  );
}
