import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { zodValidator } from "@tanstack/zod-adapter";
import { Loader2, Eye, EyeOff, Settings, HelpCircle, Briefcase, Users, Sparkles, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

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
  const [activeOauthProvider, setActiveOauthProvider] = useState<"google" | "github" | "twitter" | null>(null);

  const switchMode = () =>
    navigate({ to: "/auth", search: { role, mode: isSignup ? "signin" : "signup" } });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignup) {
        // Try sign up first
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { role, full_name: name, company_name: company },
          },
        });

        if (signUpError) {
          // If already registered, try to sign in and then add the profile
          if (signUpError.message.includes("already registered")) {
            const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
            if (signInError) throw signInError;
            
            // Successfully signed in, now ensure the profile for this role exists
            const { data: user } = await supabase.auth.getUser();
            if (user.user) {
              await supabase.from("profiles").upsert({
                id: user.user.id,
                role: role as any,
                full_name: name,
                company_name: company,
              });
            }
          } else {
            throw signUpError;
          }
        }
        
        localStorage.setItem("ventura_active_role", role);
        toast.success(`Account ready as ${role}! Redirecting…`);
        navigate({ to: "/dashboard", search: { role } });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        // Store the active role for this session to separate the "Account" experience
        localStorage.setItem("ventura_active_role", role);
        
        toast.success(`Welcome back as ${role === 'investor' ? 'an Investor' : 'a Startup'}!`);
        navigate({ to: "/dashboard", search: { role } });
      }
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const signInSimulatedUser = async (email: string, fullName: string, companyName: string) => {
    setLoading(true);
    try {
      const defaultPassword = "password123";
      
      // 1. Try to sign up first
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: defaultPassword,
        options: {
          data: { role, full_name: fullName, company_name: companyName },
        },
      });

      if (signUpError) {
        // 2. If already registered, try to sign in
        if (signUpError.message.includes("already registered") || signUpError.message.includes("already exists")) {
          const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: defaultPassword });
          if (signInError) throw signInError;
        } else {
          throw signUpError;
        }
      }
      
      // Ensure the profile role is fully matched/aligned in DB
      const { data: user } = await supabase.auth.getUser();
      if (user?.user) {
        await supabase.from("profiles").upsert({
          id: user.user.id,
          role: role as any,
          full_name: fullName,
          company_name: companyName || (role === "investor" ? "Northwind Capital" : "Helix Bio"),
        });
      }

      localStorage.setItem("ventura_active_role", role);
      toast.success(`Welcome back, ${fullName}! Signed in successfully.`);
      navigate({ to: "/dashboard", search: { role } });
      setActiveOauthProvider(null);
    } catch (err: any) {
      toast.error(err.message ?? "SSO authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const oauth = async (provider: "google" | "github" | "twitter") => {
    setLoading(true);
    // Simulate a secure network handshake delay (e.g. 450ms) for visual premium realism
    setTimeout(() => {
      setActiveOauthProvider(provider);
      setLoading(false);
    }, 450);
  };

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden flex flex-col bg-background text-foreground">
      {/* Top bar */}
      <header className="flex-shrink-0 flex items-center justify-between px-6 py-4 md:py-5 md:px-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.history.back()}
            className="group flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background transition-colors hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">Ventura<span className="text-blue-600">.</span></span>
          </Link>
        </div>
        <div className="flex items-center gap-5 text-sm text-muted-foreground">
          <button className="hidden items-center gap-1.5 hover:text-foreground sm:inline-flex">
            <span>Need help?</span>
          </button>
          <button aria-label="Settings" className="rounded-full p-1.5 hover:bg-muted">
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 min-h-0 mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:gap-12 px-6 pb-6 md:pb-8 md:pt-2 md:grid-cols-2 md:px-10 w-full">
        {/* LEFT — Illustration */}
        <div className="hidden flex-col justify-between rounded-3xl bg-gradient-to-b from-muted/40 to-background p-8 lg:p-10 border border-border/50 md:flex min-h-0 h-full overflow-hidden">
          <div>
            <h1 className="font-display text-3xl lg:text-4xl font-bold tracking-tight">
              {isSignup ? "Hi, Get started" : "Hi, Welcome back"}
            </h1>
            <p className="mt-2 text-sm lg:text-base text-muted-foreground">
              {isInvestor
                ? "Discover high-potential startups with intelligent matchmaking."
                : "More effectively with optimized workflows."}
            </p>
          </div>

          <div className="flex-1 flex items-center justify-center my-4 min-h-0">
            <IllustrationDashboard className="h-full max-h-[220px] lg:max-h-[260px] w-auto max-w-md object-contain" />
          </div>

          <div className="flex-shrink-0 flex items-center justify-center gap-6 lg:gap-8 opacity-60 grayscale">
            <Logo>chase</Logo>
            <Logo>monday</Logo>
            <Logo>airbnb</Logo>
            <Logo>stripe</Logo>
            <Logo>notion</Logo>
          </div>
        </div>

        {/* RIGHT — Form */}
        <div className="flex items-center justify-center px-2 py-4 md:py-6 md:px-10 min-h-0 h-full overflow-y-auto md:overflow-y-visible">
          <div className="w-full max-w-md flex flex-col justify-center">
            <div className="mb-4">
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${isInvestor ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"}`}>
                  {isInvestor ? <Briefcase className="h-3 w-3" /> : <Users className="h-3 w-3" />}
                  <span>{isInvestor ? "Investor" : "Startup"}</span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate({ to: "/auth", search: { mode, role: isInvestor ? "startup" : "investor" } })}
                  className="text-xs font-semibold text-muted-foreground/80 hover:text-foreground transition-colors"
                >
                  Switch role
                </button>
              </div>
            </div>

            <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
              {isSignup ? "Create your account" : "Sign in to your account"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                onClick={switchMode}
                className="font-semibold text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline"
              >
                {isSignup ? "Sign in" : "Get started"}
              </button>
            </p>

            <form onSubmit={submit} className="mt-6 md:mt-8 space-y-4">
              {isSignup && (
                <div className="space-y-4">
                  <FloatField label="Full name" value={name} onChange={setName} placeholder="Ada Lovelace" required />
                  <FloatField
                    label={isInvestor ? "Firm (optional)" : "Startup name (optional)"}
                    value={company}
                    onChange={setCompany}
                    placeholder={isInvestor ? "Northwind Capital" : "Acme AI"}
                  />
                </div>
              )}

              <FloatField
                label="Email address"
                value={email}
                onChange={setEmail}
                type="email"
                required
              />

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
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-foreground text-sm font-semibold text-background transition-colors hover:bg-foreground/90 disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : isSignup ? "Create account" : "Sign in"}
              </button>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-dashed border-border" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-background px-3 text-[10px] font-bold tracking-wider text-muted-foreground">
                    OR
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4">
                <SocialBtn label="Google" onClick={() => oauth("google")}>
                  <GoogleIcon />
                </SocialBtn>
                <SocialBtn label="GitHub" onClick={() => oauth("github")}>
                  <GitHubIcon />
                </SocialBtn>
                <SocialBtn label="X" onClick={() => oauth("twitter")}>
                  <XIcon />
                </SocialBtn>
              </div>

              <p className="pt-2 text-center text-[10px] leading-relaxed text-muted-foreground">
                By continuing, you agree to Ventura's{" "}
                <a className="underline hover:text-foreground" href="#">Terms of Service</a> and{" "}
                <a className="underline hover:text-foreground" href="#">Privacy Policy</a>.
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Premium High-Fidelity SSO Simulator Modal */}
      <AnimatePresence>
        {activeOauthProvider && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              {activeOauthProvider === "google" && (
                <div className="p-8 flex flex-col items-center">
                  {/* Google Logo */}
                  <svg className="h-10 w-10 mb-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <h3 className="font-display text-2xl font-bold tracking-tight text-slate-800">Sign in with Google</h3>
                  <p className="text-slate-500 text-sm mt-1 mb-6">to continue to <span className="font-bold text-blue-600">Ventura</span></p>

                  <div className="w-full space-y-3">
                    <button 
                      onClick={() => {
                        const email = role === "investor" ? "elcot.investor.google@test.com" : "elcot.startup.google@test.com";
                        const name = role === "investor" ? "ELCOT Investor" : "ELCOT Startup";
                        signInSimulatedUser(email, name, role === "investor" ? "Northwind Capital" : "Helix Bio");
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all text-left animate-fade-in"
                    >
                      <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0 uppercase">
                        {role === "investor" ? "EI" : "ES"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-slate-800">{role === "investor" ? "ELCOT Investor" : "ELCOT Startup"}</div>
                        <div className="text-xs text-slate-500 truncate">{role === "investor" ? "elcot.investor.google@test.com" : "elcot.startup.google@test.com"}</div>
                      </div>
                      <div className={`rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider ${role === "investor" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {role}
                      </div>
                    </button>

                    <button 
                      onClick={() => {
                        const entered = prompt("Enter your Google Email:", role === "investor" ? "partner@firm.com" : "founder@startup.com");
                        if (!entered) return;
                        const name = entered.split('@')[0];
                        const sanitizedEmail = entered.includes('@') ? entered : `${entered}@gmail.com`;
                        signInSimulatedUser(sanitizedEmail, name, role === "investor" ? "Northwind Capital" : "Helix Bio");
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all text-left"
                    >
                      <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold shrink-0">
                        +
                      </div>
                      <div className="text-sm font-bold text-slate-800">Use another account</div>
                    </button>
                  </div>

                  <button 
                    onClick={() => setActiveOauthProvider(null)}
                    className="mt-6 text-xs text-slate-400 hover:text-slate-600 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {activeOauthProvider === "github" && (
                <div className="p-8">
                  {/* GitHub Auth Header */}
                  <div className="flex items-center justify-center gap-6 mb-6">
                    <svg className="h-12 w-12 text-slate-800 fill-slate-800" viewBox="0 0 24 24">
                      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2c-3.2.7-3.87-1.36-3.87-1.36-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.25 3.34.95.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.7 5.4-5.27 5.69.41.36.78 1.07.78 2.16v3.2c0 .31.21.68.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z"/>
                    </svg>
                    <div className="h-1.5 w-8 bg-slate-200 rounded-full" />
                    <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                      V
                    </div>
                  </div>

                  <h3 className="font-display text-2xl font-bold tracking-tight text-slate-800 text-center mb-1">Authorize Ventura</h3>
                  <p className="text-slate-500 text-xs text-center mb-6">Ventura Venture Infrastructure wants to access your GitHub account.</p>

                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs text-slate-600 space-y-2 mb-6">
                    <div className="flex gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>Personal profile information (read-only)</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>Verified email addresses</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => setActiveOauthProvider(null)}
                      className="flex-1 rounded-xl border border-slate-200 py-3 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => {
                        const email = role === "investor" ? "elcot.investor.github@test.com" : "elcot.startup.github@test.com";
                        const name = role === "investor" ? "ELCOT Partner" : "ELCOT Developer";
                        signInSimulatedUser(email, name, role === "investor" ? "Northwind Capital" : "Helix Bio");
                      }}
                      className="flex-[2] rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 text-xs font-bold text-white shadow-md transition-all"
                    >
                      Authorize Ventura
                    </button>
                  </div>
                </div>
              )}

              {activeOauthProvider === "twitter" && (
                <div className="p-8">
                  {/* X Logo */}
                  <div className="flex justify-center mb-6">
                    <svg className="h-10 w-10 text-slate-900 fill-slate-900" viewBox="0 0 24 24">
                      <path d="M18.244 2H21.5l-7.5 8.57L23 22h-6.844l-5.36-7.01L4.5 22H1.24l8.02-9.16L1 2h6.92l4.84 6.39L18.244 2zm-2.4 18h1.86L7.24 4H5.28l10.564 16z"/>
                    </svg>
                  </div>

                  <h3 className="font-display text-2xl font-bold tracking-tight text-slate-800 text-center mb-1">Authorize Ventura to use your account?</h3>
                  <p className="text-slate-500 text-xs text-center mb-6">This application will be able to read posts and profile info.</p>

                  <div className="space-y-4 mb-6">
                    <div className="rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                      Target Role
                      <div className="text-xs font-bold text-slate-800 uppercase mt-0.5">{role}</div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => {
                        const email = role === "investor" ? "elcot.investor.x@test.com" : "elcot.startup.x@test.com";
                        const name = role === "investor" ? "ELCOT Investor" : "ELCOT Startup";
                        signInSimulatedUser(email, name, role === "investor" ? "Northwind Capital" : "Helix Bio");
                      }}
                      className="w-full rounded-xl bg-slate-900 hover:bg-slate-850 py-3 text-xs font-bold text-white shadow-md transition-all"
                    >
                      Authorize App
                    </button>
                    <button 
                      onClick={() => setActiveOauthProvider(null)}
                      className="w-full rounded-xl border border-slate-200 py-3 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
function IllustrationDashboard({ className = "h-64 w-full max-w-md" }: { className?: string }) {
  return (
    <svg viewBox="0 0 360 280" className={className}>
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
