import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard, Sparkles, Compass, Bookmark, Users, Settings,
  Bell, SlidersHorizontal, Search, LogOut, Rocket, Briefcase, Heart,
  TrendingUp, MapPin, Loader2, ArrowUpRight, Plus, BarChart3,
  Inbox, CheckCircle2, XCircle, Clock, Building2, MessageSquare, Video
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

type Tab = "dashboard" | "for-you" | "discover" | "saved" | "requests" | "connections" | "preferences" | "notifications" | "settings" | "startups";

type Startup = { id: string; name: string; initials: string; sector: string; stage: string; location: string; ask: string; match: number };
type Investor = { id: string; name: string; initials: string; firm: string; focus: string; ticket: string; stage: string; portfolio: number; match: number };

const STARTUP_NAV = [
  { id: "dashboard", label: "Fundraising Home", icon: LayoutDashboard },
  { id: "startups", label: "Ecosystem Browse", icon: Building2 },
  { id: "discover", label: "Find Investors", icon: Compass },
  { id: "saved", label: "Shortlist", icon: Bookmark },
  { id: "requests", label: "My Outreach", icon: Inbox },
  { id: "connections", label: "Relationships", icon: Users },
  { id: "preferences", label: "Startup Profile", icon: Settings },
  { id: "notifications", label: "Alerts", icon: Bell },
  { id: "settings", label: "Account Settings", icon: Settings },
] as const;

const INVESTOR_NAV = [
  { id: "dashboard", label: "Deal Flow Home", icon: LayoutDashboard },
  { id: "discover", label: "Sourcing Marketplace", icon: Compass },
  { id: "saved", label: "Pipeline", icon: Bookmark },
  { id: "requests", label: "Inbound Leads", icon: Inbox },
  { id: "connections", label: "Portfolio Network", icon: Users },
  { id: "preferences", label: "Investment Thesis", icon: Settings },
  { id: "notifications", label: "Activity", icon: Bell },
  { id: "settings", label: "Account Settings", icon: Settings },
] as const;

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

function DashboardPage() {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [search, setSearch] = useState("");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [isVerified, setIsVerified] = useState(() => {
    return localStorage.getItem('isVerified') === 'true';
  });
  const [requestingInvestor, setRequestingInvestor] = useState<Investor | null>(null);
  const [showAddCompany, setShowAddCompany] = useState(false);

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
        <div 
          onClick={() => setTab("preferences")}
          className="m-3 cursor-pointer rounded-2xl border border-border bg-background p-3 transition-smooth hover:border-primary/40 hover:shadow-elegant"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-navy font-display text-sm font-bold text-navy-foreground">
              {(profile.full_name ?? user.email ?? "?").slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">
                {profile.full_name ?? user.email}
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <span className="truncate text-xs text-muted-foreground capitalize">
                  {profile.role}{profile.company_name ? ` · ${profile.company_name}` : ""}
                </span>
                {isVerified && <CheckCircle2 className="h-3 w-3 text-success shrink-0" />}
              </div>
            </div>
          </div>
          <button
            onClick={async (e) => { e.stopPropagation(); await signOut(); navigate({ to: "/" }); }}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition-smooth hover:border-destructive/40 hover:text-destructive"
          >
            <LogOut className="h-3.5 w-3.5" /> Logout
          </button>
          
          <button
            onClick={async (e) => {
              e.stopPropagation();
              const newRole = isInvestor ? "startup" : "investor";
              const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", user.id);
              if (error) {
                toast.error(error.message);
              } else {
                toast.success(`Switched to ${newRole} workspace`);
                window.location.reload(); // Hard reload to refresh all state
              }
            }}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-accent/40 px-3 py-2 text-[10px] font-bold text-primary transition-smooth hover:bg-primary/10"
          >
            Switch to {isInvestor ? "Founder" : "Investor"} Workspace
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
          {tab === "dashboard" ? (
            isInvestor ? (
              <InvestorHome
                search={search}
                savedIds={savedIds}
                onToggleSave={toggleSave}
                onRequestIntro={setRequestingInvestor}
              />
            ) : (
              <StartupHome
                search={search}
                savedIds={savedIds}
                onToggleSave={toggleSave}
                onRequestIntro={setRequestingInvestor}
                onAddCompany={() => setShowAddCompany(true)}
                isVerified={isVerified}
              />
            )
          ) : tab === "startups" ? (
            <StartupsMarketplace search={search} savedIds={savedIds} onToggleSave={toggleSave} />
          ) : tab === "discover" ? (
            <Discover isInvestor={isInvestor} search={search} savedIds={savedIds} onToggleSave={toggleSave} onRequestIntro={setRequestingInvestor} />
          ) : tab === "saved" ? (
            <Saved isInvestor={isInvestor} savedIds={savedIds} onToggleSave={toggleSave} onRequestIntro={setRequestingInvestor} />
          ) : tab === "requests" ? (
            <RequestsView isInvestor={isInvestor} userId={user.id} />
          ) : tab === "connections" ? (
            <Connections isInvestor={isInvestor} />
          ) : tab === "notifications" ? (
            <EmptyState icon={Bell} title="No new notifications" desc="You'll see intro requests, matches, and event invites here." />
          ) : (
            <Settings_ 
              profile={profile} 
              user={user} 
              isVerified={isVerified} 
              onVerify={(v) => {
                setIsVerified(v);
                localStorage.setItem('isVerified', String(v));
              }}
            />
          )}
        </main>
      </div>

      {showAddCompany && (
        <AddCompanyModal 
          onClose={() => setShowAddCompany(false)} 
          onSubmit={(data) => {
            const reqs = getIntroReqs();
            reqs.push({
              id: Math.random().toString(36).slice(2),
              investorId: 'self',
              investorName: 'Internal Listing',
              investorFocus: 'Platform',
              status: 'pending',
              date: new Date().toISOString(),
              ...data
            });
            saveIntroReqs(reqs);
            setShowAddCompany(false);
            toast.success("Company idea added to My Requests!");
          }} 
        />
      )}

      {requestingInvestor && (
        <IntroRequestModal 
          investor={requestingInvestor} 
          onClose={() => setRequestingInvestor(null)} 
          onSubmit={(data) => {
            const reqs = getIntroReqs();
            reqs.push({
              id: Math.random().toString(36).slice(2),
              investorId: requestingInvestor.id,
              investorName: requestingInvestor.firm,
              investorFocus: requestingInvestor.focus,
              status: 'pending',
              date: new Date().toISOString(),
              ...data
            });
            saveIntroReqs(reqs);
            setRequestingInvestor(null);
          }} 
        />
      )}
    </div>
  );
}

// ... constants moved above ...

// ============ MOCK DATA ============
// removed duplicated section

// ============ SECTIONS ============
function StartupHome({
  search, savedIds, onToggleSave, onRequestIntro, onAddCompany, isVerified
}: {
  search: string; savedIds: Set<string>; onToggleSave: (id: string) => void; onRequestIntro: (i: Investor) => void; onAddCompany?: () => void; isVerified: boolean;
}) {
  const [profileDomain, setProfileDomain] = useState("");

  useEffect(() => {
    const loadDomain = () => {
      try {
        const saved = localStorage.getItem("startupProfile");
        if (saved) {
          const data = JSON.parse(saved);
          setProfileDomain(data.domain || "");
        }
      } catch {}
    };
    loadDomain();
    window.addEventListener('profileUpdated', loadDomain);
    return () => window.removeEventListener('profileUpdated', loadDomain);
  }, []);

  const items = useMemo(() => {
    const list = INVESTORS;
    const q = search.trim().toLowerCase();
    
    let filteredList = list;
    if (profileDomain && !q) {
      const pDomain = profileDomain.toLowerCase();
      filteredList = list.filter((x: any) => x.focus && x.focus.toLowerCase().includes(pDomain));
      if (filteredList.length === 0) filteredList = list;
    }

    if (!q) return filteredList;
    return list.filter((x: any) =>
      [x.name, x.focus, x.firm].filter(Boolean).join(" ").toLowerCase().includes(q)
    );
  }, [search, profileDomain]);

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
            Fundraising Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Strategic investors matched to your current funding round.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              if (!isVerified) {
                toast.error("Verification Required", {
                  description: "Please complete your KYC and company verification in Profile settings first.",
                });
                return;
              }
              onAddCompany?.();
            }}
            className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-xs font-bold transition-smooth ${
              isVerified 
                ? "bg-gradient-primary text-primary-foreground shadow-elegant hover:shadow-glow" 
                : "bg-muted text-muted-foreground cursor-not-allowed border border-border"
            }`}
          >
            <Plus className="h-4 w-4" /> Add My Company
          </button>
          {["Match %", "Recently added", "Ticket size"].map((s, i) => (
            <button key={s} className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-smooth ${i === 0 ? "border-primary/40 bg-accent text-primary" : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={TrendingUp} label="Investor matches" value="38" trend="+12% wk" />
        <KpiCard icon={Inbox} label="Outreach sent" value="14" trend="+3" />
        <KpiCard icon={Bookmark} label="Shortlisted" value={String(savedIds.size)} trend="" />
        <KpiCard icon={BarChart3} label="Profile views" value="284" trend="+24% wk" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((it: any) =>
          <InvestorCard key={it.id} i={it} saved={savedIds.has(it.id)} onSave={() => onToggleSave(it.id)} onRequestIntro={() => onRequestIntro(it)} />
        )}
      </div>
    </div>
  );
}

function InvestorHome({
  search, savedIds, onToggleSave, onRequestIntro
}: {
  search: string; savedIds: Set<string>; onToggleSave: (id: string) => void; onRequestIntro: (s: any) => void;
}) {
  const [thesis, setThesis] = useState("");

  useEffect(() => {
    const loadThesis = () => {
      try {
        const saved = localStorage.getItem("investorProfile");
        if (saved) {
          const data = JSON.parse(saved);
          setThesis(data.domain || "");
        }
      } catch {}
    };
    loadThesis();
    window.addEventListener('profileUpdated', loadThesis);
    return () => window.removeEventListener('profileUpdated', loadThesis);
  }, []);

  const items = useMemo(() => {
    const list = STARTUPS;
    const q = search.trim().toLowerCase();
    
    let filteredList = list;
    if (thesis && !q) {
      const pThesis = thesis.toLowerCase();
      filteredList = list.filter((x: any) => x.sector && x.sector.toLowerCase().includes(pThesis));
      if (filteredList.length === 0) filteredList = list;
    }

    if (!q) return filteredList;
    return list.filter((x: any) =>
      [x.name, x.sector, x.stage, x.location].filter(Boolean).join(" ").toLowerCase().includes(q)
    );
  }, [search, thesis]);

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
            Deal Flow Explorer
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Vetted startups matching your current investment thesis.
          </p>
        </div>
        <div className="flex gap-2">
          {["High match", "Newest", "Funding stage"].map((s, i) => (
            <button key={s} className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-smooth ${i === 0 ? "border-primary/40 bg-accent text-primary" : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={Sparkles} label="Vetted startups" value="126" trend="+8% wk" />
        <KpiCard icon={Inbox} label="Inbound leads" value="42" trend="+12" />
        <KpiCard icon={Bookmark} label="In Pipeline" value={String(savedIds.size)} trend="" />
        <KpiCard icon={Users} label="Portfolio cos." value="47" trend="+2" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((it: any) =>
          <StartupCard key={it.id} s={it} saved={savedIds.has(it.id)} onSave={() => onToggleSave(it.id)} onRequestIntro={() => onRequestIntro(it)} />
        )}
      </div>
    </div>
  );
}

function Discover({
  isInvestor, search, savedIds, onToggleSave, onRequestIntro
}: { isInvestor: boolean; search: string; savedIds: Set<string>; onToggleSave: (id: string) => void; onRequestIntro: (i: any) => void; }) {
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
        <ForYou isInvestor={isInvestor} search={search} savedIds={savedIds} onToggleSave={onToggleSave} onRequestIntro={onRequestIntro} />
      </div>
    </div>
  );
}

function ForYou({
  isInvestor, search, savedIds, onToggleSave, onRequestIntro
}: {
  isInvestor: boolean; search: string; savedIds: Set<string>; onToggleSave: (id: string) => void; onRequestIntro: (i: any) => void;
}) {
  const list = isInvestor ? STARTUPS : INVESTORS;
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return list;
    return list.filter((it: any) => 
      isInvestor 
        ? [it.name, it.sector, it.stage].join(' ').toLowerCase().includes(q)
        : [it.firm, it.focus].join(' ').toLowerCase().includes(q)
    );
  }, [list, search, isInvestor]);

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {filtered.map((it: any) =>
        isInvestor
          ? <StartupCard key={it.id} s={it} saved={savedIds.has(it.id)} onSave={() => onToggleSave(it.id)} onRequestIntro={() => onRequestIntro(it)} />
          : <InvestorCard key={it.id} i={it} saved={savedIds.has(it.id)} onSave={() => onToggleSave(it.id)} onRequestIntro={() => onRequestIntro(it)} />
      )}
    </div>
  );
}

function Saved({
  isInvestor, savedIds, onToggleSave, onRequestIntro
}: { isInvestor: boolean; savedIds: Set<string>; onToggleSave: (id: string) => void; onRequestIntro: (i: Investor) => void; }) {
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
              : <InvestorCard key={it.id} i={it} saved onSave={() => onToggleSave(it.id)} onRequestIntro={() => onRequestIntro(it)} />
          )}
        </div>
      )}
    </div>
  );
}

function Connections({ isInvestor }: { isInvestor: boolean }) {
  const [tab, setTab] = useState<"pending" | "active" | "archived">("pending");
  const [reqs, setReqs] = useState<LocalIntroRequest[]>([]);
  const [actionModal, setActionModal] = useState<{ req: LocalIntroRequest; action: 'accepted' | 'rejected' } | null>(null);
  const [actionReason, setActionReason] = useState("");

  useEffect(() => {
    setReqs(getIntroReqs());
    const handler = () => setReqs(getIntroReqs());
    window.addEventListener('reqsUpdated', handler);
    return () => window.removeEventListener('reqsUpdated', handler);
  }, []);

  const filtered = reqs.filter(r => {
    if (tab === 'pending') return r.status === 'pending';
    if (tab === 'active') return r.status === 'accepted';
    if (tab === 'archived') return r.status === 'rejected';
    return false;
  });

  const handleActionSubmit = () => {
    if (!actionModal) return;
    const updated = reqs.map(r => r.id === actionModal.req.id ? { ...r, status: actionModal.action, actionReason } : r);
    saveIntroReqs(updated);
    setActionModal(null);
    setActionReason("");
  };

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

      <div className="mt-8 space-y-4">
        {filtered.length === 0 ? (
          <EmptyState icon={Users} title={`No ${tab} connections`} desc="Once you request or accept an intro, it'll show up here." />
        ) : (
          filtered.map(r => (
            <div key={r.id} className={`rounded-2xl border bg-card p-5 shadow-card flex flex-col md:flex-row gap-4 justify-between items-start ${r.status === 'accepted' ? 'border-success/50' : r.status === 'rejected' ? 'border-destructive/50' : 'border-border'}`}>
              <div>
                <div className="font-display text-lg font-bold flex items-center gap-2">
                  {isInvestor ? r.companyName : r.investorName}
                  {r.status === 'accepted' && <span className="flex h-4 w-4 items-center justify-center rounded-full bg-success text-[10px] text-white">✓</span>}
                  {r.status === 'rejected' && <span className="flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white">✕</span>}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {isInvestor ? `Asking: ${r.expected}` : `Focus: ${r.investorFocus}`}
                </div>
                <div className="mt-3 text-sm">{r.reason}</div>
                {r.actionReason && (
                  <div className={`mt-3 text-xs font-semibold p-2 rounded-lg ${r.status === 'accepted' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                    {r.status === 'accepted' ? 'Accepted' : 'Rejected'}: {r.actionReason}
                  </div>
                )}
              </div>

              {isInvestor && r.status === 'pending' && (
                <div className="flex gap-2">
                  <button onClick={() => setActionModal({ req: r, action: 'accepted' })} className="rounded-lg bg-success px-4 py-2 text-xs font-semibold text-white transition-smooth hover:bg-success/80">Accept</button>
                  <button onClick={() => setActionModal({ req: r, action: 'rejected' })} className="rounded-lg bg-destructive px-4 py-2 text-xs font-semibold text-white transition-smooth hover:bg-destructive/80">Reject</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-background p-6 shadow-2xl">
            <h2 className="font-display text-xl font-bold mb-2">Reason to {actionModal.action === 'accepted' ? 'Accept' : 'Reject'}</h2>
            <textarea value={actionReason} onChange={e => setActionReason(e.target.value)} rows={3} className="mt-4 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" placeholder="Provide a reason..." />
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setActionModal(null)} className="rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground border border-border hover:bg-accent">Cancel</button>
              <button onClick={handleActionSubmit} className="rounded-lg bg-gradient-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-elegant hover:shadow-glow">Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Settings_({ profile, user, isVerified, onVerify }: { profile: any; user: any; isVerified: boolean; onVerify: (v: boolean) => void }) {
  const isInvestor = profile.role === "investor";
  const storageKey = isInvestor ? "investorProfile" : "startupProfile";
  
  const defaultData = {
    companyName: profile.company_name || "",
    companyLogo: profile.avatar_url || "",
    domain: "",
    reason: "",
    expectedFunding: "",
    mobile: "",
    email: user?.email || "",
    website: "",
    gstNumber: "",
    founderName: "",
    incorporationDate: "",
    traction: "",
  };

  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return { ...defaultData, ...JSON.parse(saved) };
    } catch {}
    return defaultData;
  });

  const [savedMsg, setSavedMsg] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [step, setStep] = useState(0);

  const verificationSteps = [
    "KYC & Identity Verification",
    "Founder Details Check",
    "GST Validation",
    "Incorporation Validation",
    "Traction Validation",
    "AI Startup Scoring"
  ];

  const handleVerify = () => {
    setVerifying(true);
    setStep(0);
    
    const interval = setInterval(() => {
      setStep(s => {
        if (s >= verificationSteps.length - 1) {
          clearInterval(interval);
          setVerifying(false);
          onVerify(true);
          toast.success("Verification Successful!", {
            description: "Your company has been verified. You can now post ideas.",
          });
          return s;
        }
        return s + 1;
      });
    }, 1200);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(storageKey, JSON.stringify(formData));
    setSavedMsg("Profile saved successfully!");
    setTimeout(() => setSavedMsg(""), 3000);
    window.dispatchEvent(new Event('profileUpdated'));
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
          {isInvestor ? "Investor Profile" : "Startup Profile"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Update your details to find better matches.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Company Name</label>
                <input name="companyName" value={formData.companyName} onChange={handleChange} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none transition-smooth" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Founder Name</label>
                <input name="founderName" value={formData.founderName} onChange={handleChange} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none transition-smooth" />
              </div>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">GST Number</label>
                <input name="gstNumber" value={formData.gstNumber} onChange={handleChange} placeholder="Optional for now" className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none transition-smooth" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Incorporation Date</label>
                <input name="incorporationDate" type="date" value={formData.incorporationDate} onChange={handleChange} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none transition-smooth" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Current Traction (MRR/ARR)</label>
              <input name="traction" value={formData.traction} onChange={handleChange} placeholder="e.g. $10k MRR" className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none transition-smooth" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Mobile No</label>
                <input name="mobile" value={formData.mobile} onChange={handleChange} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Email ID</label>
                <input name="email" value={formData.email} onChange={handleChange} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
              </div>
            </div>
            
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Website</label>
              <input name="website" value={formData.website} onChange={handleChange} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
            </div>
          </div>
          
          <div className="pt-4 flex items-center justify-between">
            <button type="submit" className="rounded-lg bg-gradient-navy px-6 py-2 text-sm font-bold text-navy-foreground shadow-elegant hover:opacity-90 transition-smooth">
              Save Details
            </button>
            {savedMsg && <span className="text-sm font-medium text-success animate-fade-in">{savedMsg}</span>}
          </div>
        </form>
      </div>

      <div className="space-y-6">
        <h2 className="font-display text-xl font-bold">Verification Center</h2>
        <div className={`rounded-2xl border p-6 shadow-card transition-smooth ${isVerified ? "border-success/30 bg-success/5" : "border-border bg-card"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${isVerified ? "bg-success/20 text-success" : "bg-accent text-primary"}`}>
                {isVerified ? <CheckCircle2 className="h-6 w-6" /> : <Rocket className="h-6 w-6" />}
              </div>
              <div>
                <div className="font-bold">{isVerified ? "Company Verified" : "Verification Required"}</div>
                <div className="text-xs text-muted-foreground">
                  {isVerified ? "Your identity and business are validated." : "Complete the process to start posting ideas."}
                </div>
              </div>
            </div>
            {isVerified && (
              <div className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold text-primary uppercase">
                AI Score: 88/100
              </div>
            )}
          </div>

          <div className="mt-8 space-y-4">
            {verificationSteps.map((s, i) => {
              const isActive = verifying && i === step;
              const isDone = isVerified || (verifying && i < step);
              return (
                <div key={s} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-bold transition-smooth ${
                      isDone ? "border-success bg-success text-white" : isActive ? "border-primary bg-primary/10 text-primary animate-pulse" : "border-border text-muted-foreground"
                    }`}>
                      {isDone ? "✓" : i + 1}
                    </div>
                    <span className={`text-xs font-medium transition-smooth ${isDone ? "text-foreground" : isActive ? "text-primary" : "text-muted-foreground"}`}>
                      {s}
                    </span>
                  </div>
                  {isActive && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
                </div>
              );
            })}
          </div>

          {!isVerified && (
            <button 
              onClick={handleVerify}
              disabled={verifying}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary py-3 text-sm font-bold text-primary-foreground shadow-elegant hover:shadow-glow transition-smooth disabled:opacity-50"
            >
              {verifying ? <><Loader2 className="h-4 w-4 animate-spin" /> Verifying...</> : "Verify My Company"}
            </button>
          )}
        </div>

        <div className="rounded-2xl border border-dashed border-border p-6 bg-accent/30">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> AI Startup Insights
          </h3>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            Our AI analysis engine will evaluate your traction, founder history, and GST data to provide a trust score to investors. Verified startups get 3x more engagement.
          </p>
        </div>
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

function StartupCard({ s, saved, onSave, onRequestIntro }: { s: Startup; saved: boolean; onSave: () => void; onRequestIntro?: () => void }) {
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
        <button onClick={onRequestIntro} className="group/cta inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gradient-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-elegant transition-smooth hover:shadow-glow">
          Request intro <ArrowUpRight className="h-3 w-3 transition-transform group-hover/cta:translate-x-0.5" />
        </button>
        <button onClick={onSave} className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-smooth ${saved ? "border-primary/40 bg-accent text-primary" : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}>
          <Heart className="h-4 w-4" fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
    </div>
  );
}

function InvestorCard({ i, saved, onSave, onRequestIntro }: { i: Investor; saved: boolean; onSave: () => void; onRequestIntro?: () => void }) {
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
        <button onClick={onRequestIntro} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gradient-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-elegant transition-smooth hover:shadow-glow">
          Request intro <ArrowUpRight className="h-3 w-3" />
        </button>
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

function IntroRequestModal({ investor, onClose, onSubmit }: { investor: Investor; onClose: () => void; onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({ companyName: '', logo: '', address: '', reason: '', expected: '' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-background shadow-2xl flex flex-col md:flex-row">
        <div className="bg-muted p-8 md:w-1/3 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-border">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-navy font-display text-2xl font-bold text-navy-foreground mb-4">{investor.initials}</div>
          <h2 className="font-display text-xl font-bold">{investor.firm}</h2>
          <p className="text-sm text-muted-foreground mt-1">{investor.focus}</p>
          <div className="mt-6 w-full rounded-xl bg-background p-4 text-left shadow-sm">
            <div className="text-xs text-muted-foreground mb-1">Ticket Size</div>
            <div className="font-semibold text-sm mb-3">{investor.ticket}</div>
            <div className="text-xs text-muted-foreground mb-1">Portfolio</div>
            <div className="font-semibold text-sm">{investor.portfolio} cos.</div>
          </div>
        </div>

        <div className="p-8 md:w-2/3">
          <h2 className="font-display text-2xl font-bold mb-1">Request Intro</h2>
          <p className="text-sm text-muted-foreground mb-6">Fill in your details to request an intro with this investor.</p>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Company Name</label>
                <input value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Logo URL</label>
                <input value={formData.logo} onChange={e => setFormData({...formData, logo: e.target.value})} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Address</label>
              <input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Reason for Intro</label>
              <textarea value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} rows={3} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Expected Funding</label>
              <input value={formData.expected} onChange={e => setFormData({...formData, expected: e.target.value})} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button onClick={() => setFormData({ companyName: '', logo: '', address: '', reason: '', expected: '' })} className="rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground">Clear</button>
            <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground border border-border hover:bg-muted">Cancel</button>
            <button onClick={() => onSubmit(formData)} className="rounded-lg bg-gradient-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-elegant hover:shadow-glow">Send Request</button>
          </div>
        </div>
      </div>
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
      
      const remoteReqs = (data ?? []) as IntroRequest[];
      const localReqs = getIntroReqs();
      
      // Convert local reqs to IntroRequest format for unified display
      const mappedLocal = localReqs.map(l => ({
        id: l.id,
        created_at: l.date,
        startup_user_id: userId,
        investor_id: l.investorId,
        investor_name: l.investorName,
        investor_focus: l.investorFocus,
        company_name: l.companyName,
        logo_url: l.logo,
        address: l.address,
        reason: l.reason,
        expected_amount: l.expected,
        status: l.status as any,
        response_reason: l.actionReason || '',
        responded_at: null,
      })) as unknown as IntroRequest[];

      setItems([...mappedLocal, ...remoteReqs]);
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
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
          {isInvestor ? "Incoming requests" : "My requests"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isInvestor
            ? "Startups requesting an intro. Review and accept or reject each one."
            : "Track the intros you've sent and your own company listings."}
        </p>
      </div>

      <div className="mb-8 inline-flex flex-wrap rounded-xl border border-border bg-card p-1">
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
          <EmptyState icon={Inbox} title={`No ${filter === "all" ? "" : filter} items`} desc={isInvestor ? "Once startups request intros, they'll appear here." : "Start by adding your company or discovering investors."} />
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((r) => (
            <RequestCard key={r.id} req={r} isInvestor={isInvestor} />
          ))}
        </div>
      )}
    </div>
  );
}

type LocalIntroRequest = {
  id: string;
  investorId: string;
  investorName: string;
  investorFocus: string;
  companyName: string;
  logo: string;
  address: string;
  reason: string;
  expected: string;
  status: 'pending' | 'accepted' | 'rejected';
  actionReason?: string;
  date: string;
};

const getIntroReqs = (): LocalIntroRequest[] => {
  try { return JSON.parse(localStorage.getItem('introReqs') || '[]'); } catch { return []; }
};
const saveIntroReqs = (r: LocalIntroRequest[]) => {
  localStorage.setItem('introReqs', JSON.stringify(r));
  window.dispatchEvent(new Event('reqsUpdated'));
};

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

function AddCompanyModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({ companyName: '', logo: '', address: '', reason: '', expected: '', founderName: '', details: '' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-background shadow-2xl animate-fade-up">
        <div className="bg-gradient-primary p-6 text-center text-primary-foreground">
          <h2 className="font-display text-2xl font-bold">Register Your Company</h2>
          <p className="mt-1 text-sm opacity-90">Share your vision with the Ventura ecosystem</p>
        </div>
        
        <div className="p-8">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Company Name</label>
                <input value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} placeholder="e.g. Acme Corp" className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Founder Name</label>
                <input value={formData.founderName} onChange={e => setFormData({...formData, founderName: e.target.value})} placeholder="e.g. John Doe" className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Company Details</label>
              <textarea value={formData.details} onChange={e => setFormData({...formData, details: e.target.value})} rows={2} placeholder="Briefly describe what your company does..." className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Idea for Funding</label>
              <textarea value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} rows={3} placeholder="Why are you seeking funding? What is the main idea?" className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Amount You Expect</label>
                <input value={formData.expected} onChange={e => setFormData({...formData, expected: e.target.value})} placeholder="e.g. $500,000" className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Logo URL (Optional)</label>
                <input value={formData.logo} onChange={e => setFormData({...formData, logo: e.target.value})} placeholder="https://..." className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 border-t border-border pt-6">
            <button onClick={onClose} className="rounded-lg px-6 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted">Cancel</button>
            <button onClick={() => onSubmit(formData)} className="rounded-lg bg-gradient-primary px-8 py-2 text-sm font-bold text-primary-foreground shadow-elegant hover:shadow-glow transition-smooth">
              Add Me
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StartupsMarketplace({ search, savedIds, onToggleSave }: { search: string; savedIds: Set<string>; onToggleSave: (id: string) => void }) {
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return STARTUPS;
    return STARTUPS.filter(s => 
      [s.name, s.sector, s.stage, s.location].join(' ').toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">Startups Marketplace</h1>
        <p className="mt-1 text-sm text-muted-foreground">Browse other innovative companies in the Ventura ecosystem.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map(s => (
          <StartupCard key={s.id} s={s} saved={savedIds.has(s.id)} onSave={() => onToggleSave(s.id)} />
        ))}
      </div>
    </div>
  );
}
