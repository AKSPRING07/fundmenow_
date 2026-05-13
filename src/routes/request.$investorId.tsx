import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Briefcase, Building2, Loader2, Send, Sparkles, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Mock investor list (mirrors dashboard data — kept here so the form can resolve any investor by id)
const INVESTORS = [
  { id: "i1", name: "Northwind Capital", initials: "NC", firm: "Northwind Capital", focus: "AI · Fintech", ticket: "$250K – $2M", stage: "Pre-seed → Seed", portfolio: 47, match: 95 },
  { id: "i2", name: "Halo Ventures", initials: "HV", firm: "Halo Ventures", focus: "Healthtech · Bio", ticket: "$500K – $5M", stage: "Seed → Series A", portfolio: 62, match: 91 },
  { id: "i3", name: "Meridian Partners", initials: "MP", firm: "Meridian Partners", focus: "B2B SaaS", ticket: "$1M – $10M", stage: "Series A → B", portfolio: 38, match: 87 },
  { id: "i4", name: "Cedar Angels", initials: "CA", firm: "Cedar Angels", focus: "Climate · Energy", ticket: "$50K – $500K", stage: "Pre-seed", portfolio: 24, match: 82 },
  { id: "i5", name: "Orbit Syndicate", initials: "OS", firm: "Orbit Syndicate", focus: "Consumer · DTC", ticket: "$100K – $1M", stage: "Seed", portfolio: 31, match: 76 },
];

export const Route = createFileRoute("/request/$investorId")({
  head: () => ({ meta: [{ title: "Request intro — Ventura" }] }),
  component: RequestForm,
});

function RequestForm() {
  const { investorId } = Route.useParams();
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const investor = INVESTORS.find((i) => i.id === investorId);

  const [face, setFace] = useState<"investor" | "startup">("investor");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    company_name: "",
    logo_url: "",
    address: "",
    reason: "",
    expected_amount: "",
  });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { role: "startup", mode: "signin" } });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (profile?.company_name) setForm((f) => ({ ...f, company_name: profile.company_name! }));
  }, [profile]);

  if (loading || !user || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (profile.role !== "startup") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="max-w-md rounded-2xl border border-border bg-card p-8 text-center">
          <h1 className="font-display text-xl font-bold">Startups only</h1>
          <p className="mt-2 text-sm text-muted-foreground">Only startup accounts can send intro requests to investors.</p>
          <Link to="/dashboard" className="mt-5 inline-block rounded-lg bg-gradient-primary px-4 py-2 text-xs font-semibold text-primary-foreground">Back to dashboard</Link>
        </div>
      </div>
    );
  }

  if (!investor) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="max-w-md rounded-2xl border border-border bg-card p-8 text-center">
          <h1 className="font-display text-xl font-bold">Investor not found</h1>
          <Link to="/dashboard" className="mt-5 inline-block rounded-lg bg-gradient-primary px-4 py-2 text-xs font-semibold text-primary-foreground">Back to dashboard</Link>
        </div>
      </div>
    );
  }

  const clear = () => setForm({ company_name: "", logo_url: "", address: "", reason: "", expected_amount: "" });

  const submit = async () => {
    if (!form.company_name.trim() || !form.reason.trim() || !form.expected_amount.trim()) {
      toast.error("Please fill company name, reason, and expected amount.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("intro_requests").insert({
      startup_user_id: user.id,
      investor_id: investor.id,
      investor_name: investor.firm,
      investor_focus: investor.focus,
      investor_ticket: investor.ticket,
      investor_initials: investor.initials,
      company_name: form.company_name.trim().slice(0, 200),
      logo_url: form.logo_url.trim().slice(0, 500) || null,
      address: form.address.trim().slice(0, 500) || null,
      reason: form.reason.trim().slice(0, 2000),
      expected_amount: form.expected_amount.trim().slice(0, 100),
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Intro request sent ✨");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/30">
      <header className="border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 md:px-8">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-smooth hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary"><Sparkles className="h-4 w-4 text-primary-foreground" /></div>
            <span className="font-display text-base font-bold">Ventura<span className="text-gradient-primary">.</span></span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 md:px-8">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary">
          <Send className="h-3 w-3" /> Intro request
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Request an intro to <span className="text-gradient-primary">{investor.firm}</span></h1>
        <p className="mt-2 text-sm text-muted-foreground">Two-step form. Confirm investor details, then introduce your startup.</p>

        {/* Stepper */}
        <div className="mt-8 flex items-center gap-3">
          {[
            { id: "investor", label: "Investor", icon: Briefcase },
            { id: "startup", label: "Your startup", icon: Building2 },
          ].map((s, i) => {
            const active = face === s.id;
            const done = (s.id === "investor" && face === "startup");
            return (
              <button
                key={s.id}
                onClick={() => setFace(s.id as "investor" | "startup")}
                className={`flex flex-1 items-center gap-3 rounded-xl border px-4 py-3 text-left transition-smooth ${
                  active ? "border-primary bg-gradient-primary text-primary-foreground shadow-elegant"
                  : done ? "border-success/40 bg-success/10 text-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40"
                }`}
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${active ? "bg-white/20" : "bg-accent text-primary"}`}>
                  <s.icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs opacity-80">Step {i + 1}</div>
                  <div className="text-sm font-semibold">{s.label}</div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-card md:p-8">
          {face === "investor" ? (
            <div>
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-navy font-display text-base font-bold text-navy-foreground">{investor.initials}</div>
                <div>
                  <div className="font-display text-xl font-bold">{investor.firm}</div>
                  <div className="text-sm text-muted-foreground">{investor.focus}</div>
                  <span className="mt-2 inline-block rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success">{investor.match}% match</span>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field label="Ticket size" value={investor.ticket} />
                <Field label="Stage focus" value={investor.stage} />
                <Field label="Portfolio" value={`${investor.portfolio} companies`} />
                <Field label="Match score" value={`${investor.match}%`} />
              </div>

              <div className="mt-8 flex justify-end">
                <button onClick={() => setFace("startup")} className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-elegant transition-smooth hover:shadow-glow">
                  Continue to your details →
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="font-display text-lg font-bold">Tell {investor.firm} about your startup</h2>
              <p className="mt-1 text-xs text-muted-foreground">Be specific. Investors review hundreds of intros each week.</p>

              <div className="mt-6 space-y-4">
                <Input label="Company name *" value={form.company_name} onChange={(v) => setForm({ ...form, company_name: v })} placeholder="Acme Inc." />
                <Input label="Logo URL" value={form.logo_url} onChange={(v) => setForm({ ...form, logo_url: v })} placeholder="https://..." />
                <Input label="Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} placeholder="San Francisco, CA" />
                <TextArea label="Reason for the intro *" value={form.reason} onChange={(v) => setForm({ ...form, reason: v })} placeholder="What you're building, traction, why this investor…" rows={5} />
                <Input label="How much are you raising? *" value={form.expected_amount} onChange={(v) => setForm({ ...form, expected_amount: v })} placeholder="$1.5M seed round" />
              </div>

              {form.logo_url && (
                <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-background p-3">
                  <img src={form.logo_url} alt="Logo preview" className="h-10 w-10 rounded-lg object-cover" onError={(e) => ((e.currentTarget.style.display = "none"))} />
                  <span className="text-xs text-muted-foreground">Logo preview</span>
                </div>
              )}

              <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                <button onClick={() => setFace("investor")} className="text-xs font-semibold text-muted-foreground hover:text-foreground">← Back</button>
                <div className="flex gap-2">
                  <button onClick={clear} disabled={submitting} className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-smooth hover:border-destructive/40 hover:text-destructive disabled:opacity-50">
                    <X className="h-4 w-4" /> Clear
                  </button>
                  <button onClick={submit} disabled={submitting} className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-elegant transition-smooth hover:shadow-glow disabled:opacity-60">
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Send request
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-foreground">{label}</span>
      <input
        value={value}
        maxLength={500}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}

function TextArea({ label, value, onChange, placeholder, rows }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-foreground">{label}</span>
      <textarea
        value={value}
        rows={rows ?? 4}
        maxLength={2000}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}
