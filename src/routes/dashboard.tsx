import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard, Sparkles, Compass, Bookmark, Users, Settings,
  Bell, SlidersHorizontal, Search, LogOut, Rocket, Briefcase, Heart,
  TrendingUp, MapPin, Loader2, ArrowUpRight, Plus, BarChart3,
  Inbox, CheckCircle2, XCircle, Clock, Building2, MessageSquare,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";

type IntroRequest = Database["public"]["Tables"]["intro_requests"]["Row"];

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Ventura" },
      { name: "description", content: "Your Ventura ecosystem dashboard." },
    ],
  }),
  component: DashboardPage,
});

type Tab = "dashboard" | "for-you" | "discover" | "saved" | "requests" | "connections" | "preferences" | "notifications" | "settings";

function DashboardPage() {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("for-you");
  const [search, setSearch] = useState("");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { role: "startup", mode: "signin" } });
  }, [loading, user, navigate]);

  if (loading || !user || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isInvestor = profile.role === "investor";
  const items = isInvestor ? INVESTOR_NAV : STARTUP_NAV;

  const toggleSave = (id: string) =>
    setSavedIds((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
        <div className="flex items-center gap-2 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-elegant">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold">Ventura<span className="text-gradient-primary">.</span></span>
        </div>

        <div className="mx-3 mb-3 flex items-center gap-2 rounded-xl bg-accent/60 px-3 py-2 text-xs font-semibold text-primary">
          {isInvestor ? <Briefcase className="h-3.5 w-3.5" /> : <Rocket className="h-3.5 w-3.5" />}
          {isInvestor ? "Investor workspace" : "Founder workspace"}
        </div>

        <nav className="flex-1 space-y-0.5 px-3">
          {items.map((it) => (
            <button
              key={it.id}
              onClick={() => setTab(it.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-smooth ${
                tab === it.id
                  ? "bg-gradient-primary text-primary-foreground shadow-elegant"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <it.icon className="h-4 w-4" />
              {it.label}
            </button>
          ))}
        </nav>

        {/* Profile */}
        <div className="m-3 rounded-2xl border border-border bg-background p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-navy font-display text-sm font-bold text-navy-foreground">
              {(profile.full_name ?? user.email ?? "?").slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">
                {profile.full_name ?? user.email}
              </div>
              <div className="truncate text-xs text-muted-foreground capitalize">
                {profile.role}{profile.company_name ? ` · ${profile.company_name}` : ""}
              </div>
            </div>
          </div>
          <button
            onClick={async () => { await signOut(); navigate({ to: "/" }); }}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition-smooth hover:border-destructive/40 hover:text-destructive"
          >
            <LogOut className="h-3.5 w-3.5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="min-w-0 flex-1">
        {/* Topbar */}
        <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-xl">
          <div className="flex flex-wrap items-center gap-3 px-4 py-3 md:px-8">
            <Link to="/" className="flex items-center gap-2 lg:hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
            </Link>
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isInvestor
                  ? "Search startups, sectors, funding stage…"
                  : "Search investors, sectors, ticket size…"}
                className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5 text-xs font-semibold text-muted-foreground transition-smooth hover:border-primary/40 hover:text-foreground">
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </button>
            <button className="relative rounded-xl border border-border bg-background p-2.5 text-muted-foreground transition-smooth hover:border-primary/40 hover:text-foreground">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
            </button>
          </div>
        </header>

        <main className="px-4 py-8 md:px-8">
          {tab === "for-you" || tab === "dashboard" ? (
            <ForYou
              isInvestor={isInvestor}
              search={search}
              savedIds={savedIds}
              onToggleSave={toggleSave}
            />
          ) : tab === "discover" ? (
            <Discover isInvestor={isInvestor} search={search} savedIds={savedIds} onToggleSave={toggleSave} />
          ) : tab === "saved" ? (
            <Saved isInvestor={isInvestor} savedIds={savedIds} onToggleSave={toggleSave} />
          ) : tab === "requests" ? (
            <RequestsView isInvestor={isInvestor} userId={user.id} />
          ) : tab === "connections" ? (
            <Connections />
          ) : tab === "notifications" ? (
            <EmptyState icon={Bell} title="No new notifications" desc="You'll see intro requests, matches, and event invites here." />
          ) : (
            <Settings_ profile={profile} />
          )}
        </main>
      </div>
    </div>
  );
}

const STARTUP_NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "for-you", label: "For You", icon: Sparkles },
  { id: "discover", label: "Discover", icon: Compass },
  { id: "saved", label: "Saved", icon: Bookmark },
  { id: "requests", label: "My Requests", icon: Inbox },
  { id: "connections", label: "Connections", icon: Users },
  { id: "preferences", label: "My Startup Profile", icon: Settings },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

const INVESTOR_NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "for-you", label: "For You", icon: Sparkles },
  { id: "discover", label: "Discover", icon: Compass },
  { id: "saved", label: "Saved", icon: Bookmark },
  { id: "requests", label: "Requests", icon: Inbox },
  { id: "connections", label: "Connections", icon: Users },
  { id: "preferences", label: "My Preferences", icon: Settings },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

// ============ MOCK DATA ============
type Startup = { id: string; name: string; initials: string; sector: string; stage: string; location: string; ask: string; match: number };
type Investor = { id: string; name: string; initials: string; firm: string; focus: string; ticket: string; stage: string; portfolio: number; match: number };

const STARTUPS: Startup[] = [
  { id: "s1", name: "Helix Bio", initials: "HB", sector: "Healthtech", stage: "Seed", location: "Boston, US", ask: "$2M", match: 96 },
  { id: "s2", name: "Northwave AI", initials: "NW", sector: "AI · Infra", stage: "Pre-seed", location: "SF, US", ask: "$800K", match: 92 },
  { id: "s3", name: "LedgerLoop", initials: "LL", sector: "Fintech", stage: "Series A", location: "London, UK", ask: "$6M", match: 88 },
  { id: "s4", name: "Forma Labs", initials: "FL", sector: "Climate", stage: "Seed", location: "Berlin, DE", ask: "$3M", match: 85 },
  { id: "s5", name: "Atlas Grid", initials: "AG", sector: "Energy", stage: "Series A", location: "Austin, US", ask: "$8M", match: 81 },
  { id: "s6", name: "Quanta SaaS", initials: "QS", sector: "B2B SaaS", stage: "Seed", location: "Bangalore, IN", ask: "$1.5M", match: 78 },
];

const INVESTORS: Investor[] = [
  { id: "i1", name: "Northwind Capital", initials: "NC", firm: "Northwind Capital", focus: "AI · Fintech", ticket: "$250K – $2M", stage: "Pre-seed → Seed", portfolio: 47, match: 95 },
  { id: "i2", name: "Halo Ventures", initials: "HV", firm: "Halo Ventures", focus: "Healthtech · Bio", ticket: "$500K – $5M", stage: "Seed → Series A", portfolio: 62, match: 91 },
  { id: "i3", name: "Meridian Partners", initials: "MP", firm: "Meridian Partners", focus: "B2B SaaS", ticket: "$1M – $10M", stage: "Series A → B", portfolio: 38, match: 87 },
  { id: "i4", name: "Cedar Angels", initials: "CA", firm: "Cedar Angels", focus: "Climate · Energy", ticket: "$50K – $500K", stage: "Pre-seed", portfolio: 24, match: 82 },
  { id: "i5", name: "Orbit Syndicate", initials: "OS", firm: "Orbit Syndicate", focus: "Consumer · DTC", ticket: "$100K – $1M", stage: "Seed", portfolio: 31, match: 76 },
];

// ============ SECTIONS ============
function ForYou({
  isInvestor, search, savedIds, onToggleSave,
}: {
  isInvestor: boolean; search: string; savedIds: Set<string>; onToggleSave: (id: string) => void;
}) {
  const items = useMemo(() => {
    const list = isInvestor ? STARTUPS : INVESTORS;
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((x: any) =>
      [x.name, x.sector, x.focus, x.stage, x.firm].filter(Boolean).join(" ").toLowerCase().includes(q)
    );
  }, [isInvestor, search]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
            For you
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isInvestor ? "AI-curated startups matched to your thesis." : "Investors most likely to back your round."}
          </p>
        </div>
        <div className="flex gap-2">
          {["Match %", "Recently added", isInvestor ? "Funding needed" : "Ticket size"].map((s, i) => (
            <button key={s} className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-smooth ${i === 0 ? "border-primary/40 bg-accent text-primary" : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={TrendingUp} label="New matches" value="38" trend="+12% wk" />
        <KpiCard icon={Users} label="Active connections" value="14" trend="+3" />
        <KpiCard icon={Bookmark} label="Saved" value={String(savedIds.size)} trend="" />
        <KpiCard icon={BarChart3} label={isInvestor ? "Deals viewed" : "Profile views"} value="284" trend="+24% wk" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((it: any) =>
          isInvestor
            ? <StartupCard key={it.id} s={it} saved={savedIds.has(it.id)} onSave={() => onToggleSave(it.id)} />
            : <InvestorCard key={it.id} i={it} saved={savedIds.has(it.id)} onSave={() => onToggleSave(it.id)} />
        )}
      </div>
    </div>
  );
}

function Discover({
  isInvestor, search, savedIds, onToggleSave,
}: { isInvestor: boolean; search: string; savedIds: Set<string>; onToggleSave: (id: string) => void; }) {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">Discover</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {isInvestor ? "Search the full Ventura startup marketplace." : "Browse every investor on the network."}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {["All", "AI", "Fintech", "Healthtech", "Climate", "B2B SaaS", "Consumer"].map((t, i) => (
          <button key={t} className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-smooth ${i === 0 ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <ForYou isInvestor={isInvestor} search={search} savedIds={savedIds} onToggleSave={onToggleSave} />
      </div>
    </div>
  );
}

function Saved({
  isInvestor, savedIds, onToggleSave,
}: { isInvestor: boolean; savedIds: Set<string>; onToggleSave: (id: string) => void; }) {
  const list = (isInvestor ? STARTUPS : INVESTORS).filter((x) => savedIds.has(x.id));

  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">Saved</h1>
      <p className="mt-1 text-sm text-muted-foreground">Your bookmarked {isInvestor ? "startups" : "investors"} and notes.</p>

      {list.length === 0 ? (
        <div className="mt-10">
          <EmptyState icon={Bookmark} title="No saved items yet" desc={`Save ${isInvestor ? "startups" : "investors"} from your For You feed to track them here.`} />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((it: any) =>
            isInvestor
              ? <StartupCard key={it.id} s={it} saved onSave={() => onToggleSave(it.id)} />
              : <InvestorCard key={it.id} i={it} saved onSave={() => onToggleSave(it.id)} />
          )}
        </div>
      )}
    </div>
  );
}

function Connections() {
  const [tab, setTab] = useState<"pending" | "active" | "archived">("active");
  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">Connections</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage your intros, conversations, and shared contacts.</p>

      <div className="mt-6 inline-flex rounded-xl border border-border bg-card p-1">
        {(["pending", "active", "archived"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-1.5 text-xs font-semibold capitalize transition-smooth ${
              tab === t ? "bg-gradient-primary text-primary-foreground shadow-elegant" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-8">
        <EmptyState icon={Users} title={`No ${tab} connections`} desc="Once you request or accept an intro, it'll show up here." />
      </div>
    </div>
  );
}

function Settings_({ profile }: { profile: any }) {
  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">Profile and account preferences.</p>

      <div className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6">
        <Row label="Full name" value={profile.full_name ?? "—"} />
        <Row label="Role" value={profile.role} />
        <Row label={profile.role === "investor" ? "Firm" : "Startup"} value={profile.company_name ?? "—"} />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="text-sm font-medium capitalize">{value}</span>
    </div>
  );
}

function StartupCard({ s, saved, onSave }: { s: Startup; saved: boolean; onSave: () => void }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card transition-smooth hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elegant">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-navy font-display text-sm font-bold text-navy-foreground">{s.initials}</div>
          <div>
            <div className="font-display text-base font-semibold">{s.name}</div>
            <div className="text-xs text-muted-foreground">{s.sector} · {s.stage}</div>
          </div>
        </div>
        <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success">{s.match}% match</span>
      </div>

      <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {s.location}</span>
        <span>·</span>
        <span>Asking <span className="font-semibold text-foreground">{s.ask}</span></span>
      </div>

      <div className="mt-5 flex gap-2">
        <button className="group/cta inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gradient-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-elegant transition-smooth hover:shadow-glow">
          Request intro <ArrowUpRight className="h-3 w-3 transition-transform group-hover/cta:translate-x-0.5" />
        </button>
        <button onClick={onSave} className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-smooth ${saved ? "border-primary/40 bg-accent text-primary" : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}>
          <Heart className="h-4 w-4" fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
    </div>
  );
}

function InvestorCard({ i, saved, onSave }: { i: Investor; saved: boolean; onSave: () => void }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card transition-smooth hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elegant">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-navy font-display text-sm font-bold text-navy-foreground">{i.initials}</div>
          <div>
            <div className="font-display text-base font-semibold">{i.firm}</div>
            <div className="text-xs text-muted-foreground">{i.focus}</div>
          </div>
        </div>
        <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success">{i.match}% match</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div>
          <div className="text-muted-foreground">Ticket</div>
          <div className="font-semibold">{i.ticket}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Portfolio</div>
          <div className="font-semibold">{i.portfolio} cos.</div>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <Link to="/request/$investorId" params={{ investorId: i.id }} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gradient-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-elegant transition-smooth hover:shadow-glow">
          Request intro <ArrowUpRight className="h-3 w-3" />
        </Link>
        <button onClick={onSave} className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-smooth ${saved ? "border-primary/40 bg-accent text-primary" : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}>
          <Heart className="h-4 w-4" fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, trend }: { icon: any; label: string; value: string; trend: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-primary">
          <Icon className="h-4 w-4" />
        </div>
        {trend && <span className="text-xs font-semibold text-success">{trend}</span>}
      </div>
      <div className="mt-4 font-display text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{desc}</p>
      <button className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-gradient-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-elegant transition-smooth hover:shadow-glow">
        <Plus className="h-3.5 w-3.5" /> Explore
      </button>
    </div>
  );
}

// ============ REQUESTS VIEW ============
function RequestsView({ isInvestor, userId }: { isInvestor: boolean; userId: string }) {
  const [items, setItems] = useState<IntroRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "accepted" | "rejected">("all");

  useEffect(() => {
    let active = true;
    const load = async () => {
      const q = supabase.from("intro_requests").select("*").order("created_at", { ascending: false });
      const { data, error } = isInvestor ? await q : await q.eq("startup_user_id", userId);
      if (!active) return;
      if (error) toast.error(error.message);
      setItems((data ?? []) as IntroRequest[]);
      setLoading(false);
    };
    load();

    const channel = supabase
      .channel("intro_requests_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "intro_requests" }, load)
      .subscribe();

    return () => { active = false; supabase.removeChannel(channel); };
  }, [isInvestor, userId]);

  const filtered = items.filter((r) => filter === "all" || r.status === filter);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
        {isInvestor ? "Incoming requests" : "My requests"}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {isInvestor
          ? "Startups requesting an intro. Review and accept or reject each one."
          : "Track the intros you've sent. Accepted requests turn green, rejected turn red."}
      </p>

      <div className="mt-6 inline-flex flex-wrap rounded-xl border border-border bg-card p-1">
        {(["all", "pending", "accepted", "rejected"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-1.5 text-xs font-semibold capitalize transition-smooth ${
              filter === f ? "bg-gradient-primary text-primary-foreground shadow-elegant" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f} {f !== "all" && `(${items.filter((i) => i.status === f).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-10 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="mt-8">
          <EmptyState icon={Inbox} title={`No ${filter === "all" ? "" : filter} requests`} desc={isInvestor ? "Once startups request intros, they'll appear here." : "Send your first intro request from Discover."} />
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {filtered.map((r) => (
            <RequestCard key={r.id} req={r} isInvestor={isInvestor} />
          ))}
        </div>
      )}
    </div>
  );
}

function RequestCard({ req, isInvestor }: { req: IntroRequest; isInvestor: boolean }) {
  const [responding, setResponding] = useState<null | "accepted" | "rejected">(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const statusColor =
    req.status === "accepted" ? "border-success bg-success/5"
    : req.status === "rejected" ? "border-destructive bg-destructive/5"
    : "border-border bg-card";

  const StatusBadge = () => {
    if (req.status === "accepted") return <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-0.5 text-[11px] font-bold text-success"><CheckCircle2 className="h-3 w-3" /> Accepted</span>;
    if (req.status === "rejected") return <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2.5 py-0.5 text-[11px] font-bold text-destructive"><XCircle className="h-3 w-3" /> Rejected</span>;
    return <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-bold text-primary"><Clock className="h-3 w-3" /> Pending</span>;
  };

  const respond = async () => {
    if (!responding) return;
    if (!reason.trim()) { toast.error("Please add a short reason."); return; }
    setBusy(true);
    const { error } = await supabase
      .from("intro_requests")
      .update({ status: responding, response_reason: reason.trim().slice(0, 1000), responded_at: new Date().toISOString() })
      .eq("id", req.id);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Request ${responding}`);
    setResponding(null);
    setReason("");
  };

  return (
    <div className={`overflow-hidden rounded-2xl border-2 ${statusColor} p-5 shadow-card transition-smooth`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {req.logo_url ? (
            <img src={req.logo_url} alt="" className="h-12 w-12 rounded-xl object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-navy font-display text-sm font-bold text-navy-foreground">
              <Building2 className="h-5 w-5" />
            </div>
          )}
          <div>
            <div className="font-display text-lg font-bold">{req.company_name}</div>
            <div className="text-xs text-muted-foreground">
              {isInvestor ? "→ requesting intro to you" : `→ ${req.investor_name}`}
              {req.address && <> · {req.address}</>}
            </div>
          </div>
        </div>
        <StatusBadge />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Detail label="Expected raise" value={req.expected_amount} />
        <Detail label={isInvestor ? "Investor profile" : "Investor"} value={`${req.investor_name}${req.investor_focus ? ` · ${req.investor_focus}` : ""}`} />
      </div>

      <div className="mt-4">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Reason</div>
        <p className="mt-1 text-sm text-foreground/90">{req.reason}</p>
      </div>

      {req.response_reason && (
        <div className={`mt-4 rounded-xl p-3 ${req.status === "accepted" ? "bg-success/10" : "bg-destructive/10"}`}>
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide">
            <MessageSquare className="h-3 w-3" />
            {req.status === "accepted" ? "Investor's note" : "Reason for rejection"}
          </div>
          <p className="mt-1 text-sm">{req.response_reason}</p>
        </div>
      )}

      {isInvestor && req.status === "pending" && !responding && (
        <div className="mt-5 flex gap-2">
          <button onClick={() => setResponding("accepted")} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-success px-4 py-2.5 text-xs font-semibold text-white shadow-elegant transition-smooth hover:opacity-90">
            <CheckCircle2 className="h-4 w-4" /> Select
          </button>
          <button onClick={() => setResponding("rejected")} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-destructive px-4 py-2.5 text-xs font-semibold text-destructive-foreground shadow-elegant transition-smooth hover:opacity-90">
            <XCircle className="h-4 w-4" /> Reject
          </button>
        </div>
      )}

      {isInvestor && responding && (
        <div className="mt-5 rounded-xl border border-border bg-background p-4">
          <div className="text-xs font-semibold">
            {responding === "accepted" ? "Reason for selecting" : "Reason for rejecting"} {req.company_name}
          </div>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={1000}
            rows={3}
            placeholder={responding === "accepted" ? "Why this startup fits your thesis, next steps…" : "Polite, specific feedback for the founder…"}
            className="mt-2 w-full resize-none rounded-lg border border-border bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <div className="mt-3 flex justify-end gap-2">
            <button onClick={() => { setResponding(null); setReason(""); }} disabled={busy} className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground">Cancel</button>
            <button onClick={respond} disabled={busy} className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-semibold text-white shadow-elegant transition-smooth ${responding === "accepted" ? "bg-success" : "bg-destructive"} disabled:opacity-60`}>
              {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : responding === "accepted" ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
              Confirm {responding === "accepted" ? "select" : "reject"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/50 p-3">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-semibold">{value}</div>
    </div>
  );
}
