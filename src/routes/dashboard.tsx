import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard, Sparkles, Compass, Bookmark, Users, Settings,
  Bell, SlidersHorizontal, Search, LogOut, Rocket, Briefcase, Heart,
  TrendingUp, MapPin, Loader2, ArrowUpRight, Plus, BarChart3,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Ventura" },
      { name: "description", content: "Your Ventura ecosystem dashboard." },
    ],
  }),
  component: DashboardPage,
});

type Tab = "dashboard" | "for-you" | "discover" | "saved" | "connections" | "preferences" | "notifications" | "settings";

function DashboardPage() {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [search, setSearch] = useState("");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [requestingInvestor, setRequestingInvestor] = useState<Investor | null>(null);

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
          {tab === "dashboard" ? (
            <ForYou
              isInvestor={isInvestor}
              search={search}
              savedIds={savedIds}
              onToggleSave={toggleSave}
              onRequestIntro={setRequestingInvestor}
            />
          ) : tab === "discover" ? (
            <Discover isInvestor={isInvestor} search={search} savedIds={savedIds} onToggleSave={toggleSave} onRequestIntro={setRequestingInvestor} />
          ) : tab === "saved" ? (
            <Saved isInvestor={isInvestor} savedIds={savedIds} onToggleSave={toggleSave} onRequestIntro={setRequestingInvestor} />
          ) : tab === "connections" ? (
            <Connections isInvestor={isInvestor} />
          ) : tab === "notifications" ? (
            <EmptyState icon={Bell} title="No new notifications" desc="You'll see intro requests, matches, and event invites here." />
          ) : (
            <Settings_ profile={profile} user={user} />
          )}
        </main>
      </div>

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

const STARTUP_NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "discover", label: "Discover", icon: Compass },
  { id: "saved", label: "Saved", icon: Bookmark },
  { id: "connections", label: "Connections", icon: Users },
  { id: "preferences", label: "My Startup Profile", icon: Settings },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

const INVESTOR_NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "discover", label: "Discover", icon: Compass },
  { id: "saved", label: "Saved", icon: Bookmark },
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
  isInvestor, search, savedIds, onToggleSave, onRequestIntro
}: {
  isInvestor: boolean; search: string; savedIds: Set<string>; onToggleSave: (id: string) => void; onRequestIntro: (i: Investor) => void;
}) {
  const [profileDomain, setProfileDomain] = useState("");

  useEffect(() => {
    const loadDomain = () => {
      try {
        const key = isInvestor ? "investorProfile" : "startupProfile";
        const saved = localStorage.getItem(key);
        if (saved) {
          const data = JSON.parse(saved);
          setProfileDomain(data.domain || "");
        }
      } catch {}
    };
    loadDomain();
    window.addEventListener('profileUpdated', loadDomain);
    return () => window.removeEventListener('profileUpdated', loadDomain);
  }, [isInvestor]);

  const items = useMemo(() => {
    const list = isInvestor ? STARTUPS : INVESTORS;
    const q = search.trim().toLowerCase();
    
    let filteredList = list;
    if (profileDomain && !q) {
      const pDomain = profileDomain.toLowerCase();
      filteredList = list.filter((x: any) => {
        const target = isInvestor ? x.sector : x.focus;
        return target && target.toLowerCase().includes(pDomain);
      });
      if (filteredList.length === 0) filteredList = list;
    }

    if (!q) return filteredList;
    return list.filter((x: any) =>
      [x.name, x.sector, x.focus, x.stage, x.firm].filter(Boolean).join(" ").toLowerCase().includes(q)
    );
  }, [isInvestor, search, profileDomain]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
            Dashboard
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
            : <InvestorCard key={it.id} i={it} saved={savedIds.has(it.id)} onSave={() => onToggleSave(it.id)} onRequestIntro={() => onRequestIntro(it)} />
        )}
      </div>
    </div>
  );
}

function Discover({
  isInvestor, search, savedIds, onToggleSave, onRequestIntro
}: { isInvestor: boolean; search: string; savedIds: Set<string>; onToggleSave: (id: string) => void; onRequestIntro: (i: Investor) => void; }) {
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
  const [reqs, setReqs] = useState<IntroRequest[]>([]);
  const [actionModal, setActionModal] = useState<{ req: IntroRequest; action: 'accepted' | 'rejected' } | null>(null);
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

function Settings_({ profile, user }: { profile: any; user: any }) {
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
  };

  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return { ...defaultData, ...JSON.parse(saved) };
    } catch {}
    return defaultData;
  });

  const [savedMsg, setSavedMsg] = useState("");

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
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
        {isInvestor ? "Investor Profile" : "Startup Profile"}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">Update your details to find better matches.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase">Company Name</label>
            <input name="companyName" value={formData.companyName} onChange={handleChange} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase">Company Logo URL</label>
            <input name="companyLogo" value={formData.companyLogo} onChange={handleChange} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase">Domain / Sector (e.g. AI, Fintech)</label>
            <input name="domain" value={formData.domain} onChange={handleChange} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase">Reason for Investors</label>
            <textarea name="reason" value={formData.reason} onChange={handleChange} rows={3} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase">{isInvestor ? "Ticket Size" : "Expected Funding"}</label>
            <input name="expectedFunding" value={formData.expectedFunding} onChange={handleChange} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Mobile No</label>
              <input name="mobile" value={formData.mobile} onChange={handleChange} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Email ID</label>
              <input name="email" value={formData.email} onChange={handleChange} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase">Website</label>
            <input name="website" value={formData.website} onChange={handleChange} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
          </div>
        </div>
        
        <div className="pt-4 flex items-center justify-between">
          <button type="submit" className="rounded-lg bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-elegant hover:shadow-glow transition-smooth">
            Save Profile
          </button>
          {savedMsg && <span className="text-sm font-medium text-success">{savedMsg}</span>}
        </div>
      </form>
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

type IntroRequest = {
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

const getIntroReqs = (): IntroRequest[] => {
  try { return JSON.parse(localStorage.getItem('introReqs') || '[]'); } catch { return []; }
};
const saveIntroReqs = (r: IntroRequest[]) => {
  localStorage.setItem('introReqs', JSON.stringify(r));
  window.dispatchEvent(new Event('reqsUpdated'));
};

