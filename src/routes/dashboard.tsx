import { 
  DndContext, 
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  LayoutDashboard, Sparkles, Compass, Bookmark, Users, Settings,
  Bell, SlidersHorizontal, Search, LogOut, Rocket, Briefcase, Heart,
  TrendingUp, MapPin, Loader2, ArrowUpRight, Plus, BarChart3,
  Inbox, CheckCircle2, Check, XCircle, Clock, Building2, MessageSquare, Video,
  ShieldCheck, Zap, Activity, Globe, Shield, Lock, Award, PieChart, Info, Calendar, ShieldAlert,
  MoreVertical, ChevronRight, FileText, Upload, DollarSign, Percent, LogIn, Filter
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type IntroRequest = Database["public"]["Tables"]["intro_requests"]["Row"] & {
  appointment_time?: string | null;
  founder_name?: string | null;
  details?: string | null;
};

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Ventura" },
      { name: "description", content: "Your Ventura ecosystem dashboard." },
    ],
  }),
  component: DashboardPage,
});

type Tab = "dashboard" | "for-you" | "discover" | "saved" | "requests" | "connections" | "preferences" | "notifications" | "settings" | "startups" | "appointments";

type Startup = { id: string; name: string; initials: string; sector: string; stage: string; location: string; ask: string; match: number; verified?: boolean };
type Investor = { id: string; name: string; initials: string; firm: string; focus: string; ticket: string; stage: string; portfolio: number; match: number; verified?: boolean };

const STARTUP_NAV = [
  { id: "dashboard", label: "Fundraising Home", icon: LayoutDashboard },
  { id: "startups", label: "Ecosystem Browse", icon: Building2 },
  { id: "discover", label: "Find Investors", icon: Compass },
  { id: "saved", label: "Shortlist", icon: Bookmark },
  { id: "requests", label: "My Outreach", icon: Inbox },
  { id: "appointments", label: "My Appointments", icon: Calendar },
  { id: "connections", label: "Relationships", icon: Users },
  { id: "notifications", label: "Alerts", icon: Bell },
  { id: "settings", label: "Account Settings", icon: Settings },
] as const;

const INVESTOR_NAV = [
  { id: "dashboard", label: "Deal Flow Home", icon: LayoutDashboard },
  { id: "discover", label: "Sourcing Marketplace", icon: Compass },
  { id: "saved", label: "Pipeline", icon: Bookmark },
  { id: "requests", label: "Inbound Leads", icon: Inbox },
  { id: "appointments", label: "My Appointments", icon: Calendar },
  { id: "connections", label: "Portfolio Network", icon: Users },
  { id: "notifications", label: "Activity", icon: Bell },
  { id: "settings", label: "Account Settings", icon: Settings },
] as const;

const STARTUPS: any[] = [
  { id: "s1", name: "Helix Bio", initials: "HB", sector: "Healthtech", stage: "Seed", location: "Boston, US", ask: "$2M", match: 96, address: "88 Binney St, Cambridge, MA", experience: "4 Years", domain: "Biotechnology & Therapeutics", verified: true },
  { id: "s2", name: "Northwave AI", initials: "NW", sector: "AI · Infra", stage: "Pre-seed", location: "SF, US", ask: "$800K", match: 92, address: "221 Main St, San Francisco, CA", experience: "1 Year", domain: "Artificial Intelligence Infrastructure", verified: false },
  { id: "s3", name: "LedgerLoop", initials: "LL", sector: "Fintech", stage: "Series A", location: "London, UK", ask: "$6M", match: 88, address: "10 Lower Thames St, London", experience: "3 Years", domain: "Decentralized Finance & Ledger Tech", verified: true },
  { id: "s4", name: "Forma Labs", initials: "FL", sector: "Climate", stage: "Seed", location: "Berlin, DE", ask: "$3M", match: 85, address: "Lobeckstraße 36, Berlin", experience: "2 Years", domain: "Carbon Capture & Climate Intelligence", verified: false },
  { id: "s5", name: "Atlas Grid", initials: "AG", sector: "Energy", stage: "Series A", location: "Austin, US", ask: "$8M", match: 81, address: "701 Brazos St, Austin, TX", experience: "5 Years", domain: "Renewable Energy Grid Management", verified: false },
  { id: "s6", name: "Quanta SaaS", initials: "QS", sector: "B2B SaaS", stage: "Seed", location: "Bangalore, IN", ask: "$1.5M", match: 78, address: "MG Road, Bangalore, KA", experience: "2 Years", domain: "Enterprise Resource Planning", verified: false },
];

const INVESTORS: any[] = [
  { id: "i1", name: "Northwind Capital", initials: "NC", firm: "Northwind Capital", focus: "AI · Fintech", ticket: "$250K – $2M", stage: "Pre-seed → Seed", portfolio: 47, match: 95, type: "Venture Capital Firm", experience: "12+ Years", bio: "Leading early-stage investments in the next generation of AI-driven infrastructure and financial ecosystems.", trustScore: 98, verified: true },
  { id: "i2", name: "Halo Ventures", initials: "HV", firm: "Halo Ventures", focus: "Healthtech · Bio", ticket: "$500K – $5M", stage: "Seed → Series A", portfolio: 62, match: 91, type: "VC / Family Office", experience: "15+ Years", bio: "Strategic capital for breakthrough innovations in healthcare delivery and biotechnology.", trustScore: 94, verified: false },
  { id: "i3", name: "Meridian Partners", initials: "MP", firm: "Meridian Partners", focus: "B2B SaaS", ticket: "$1M – $10M", stage: "Series A → B", portfolio: 38, match: 87, type: "Institutional VC", experience: "8+ Years", bio: "Accelerating the growth of enterprise software solutions with capital and operational expertise.", trustScore: 92, verified: true },
  { id: "i4", name: "Cedar Angels", initials: "CA", firm: "Cedar Angels", focus: "Climate · Energy", ticket: "$50K – $500K", stage: "Pre-seed", portfolio: 24, match: 82, type: "Angel Syndicate", experience: "5+ Years", bio: "A network of mission-driven angels investing in climate resilience and renewable energy tech.", trustScore: 89, verified: false },
  { id: "i5", name: "Orbit Syndicate", initials: "OS", firm: "Orbit Syndicate", focus: "Consumer · DTC", ticket: "$100K – $1M", stage: "Seed", portfolio: 31, match: 76, type: "Syndicate", experience: "7+ Years", bio: "Partnering with bold founders building the future of consumer engagement and direct-to-consumer brands.", trustScore: 85, verified: false },
];

function DashboardPage() {
  const { user, profile: dbProfile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { role: urlRole } = Route.useSearch() as any;
  const [tab, setTab] = useState<Tab>("dashboard");
  const [search, setSearch] = useState("");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [isVerified, setIsVerified] = useState(() => {
    return localStorage.getItem('isVerified') === 'true';
  });
  const [requestingTarget, setRequestingTarget] = useState<any>(null);
  const [viewingInvestor, setViewingInvestor] = useState<any>(null);
  const [viewingStartup, setViewingStartup] = useState<any>(null);
  const [showAddCompany, setShowAddCompany] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { role: "startup", mode: "signin" } });
  }, [loading, user, navigate]);

  if (loading || !user || !dbProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Determine role: URL param > localStorage > DB Profile
  const activeRole = urlRole || localStorage.getItem("ventura_active_role") || dbProfile.role;
  const isInvestor = activeRole === "investor";
  
  // Use a local profile override to keep identities separate
  const profile = {
    ...dbProfile,
    role: activeRole as any,
    // You could add logic here to swap company_name/full_name from role-specific storage
  };

  const items = isInvestor ? INVESTOR_NAV : STARTUP_NAV;

  const toggleSave = (id: string) =>
    setSavedIds((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const handleRequestIntro = (target: any) => {
    if (isInvestor) {
      if (!isVerified) {
        toast.error("Investor verification is mandatory", {
          description: "Please complete your verification in Account Settings first.",
        });
        setTab("settings");
        return;
      }
    } else {
      if (!target.verified) {
        toast.error("Investor verification is mandatory", {
          description: "This investor has not completed verification and cannot accept introduction requests.",
        });
        return;
      }
    }
    setRequestingTarget(target);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card lg:flex z-40">
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
                {isVerified && <CheckCircle2 className="h-3 w-3 text-blue-500 fill-blue-500/10 shrink-0" />}
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
        <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-xl">
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
                onRequestIntro={handleRequestIntro}
                onViewProfile={setViewingStartup}
              />
            ) : (
              <StartupHome
                search={search}
                savedIds={savedIds}
                onToggleSave={toggleSave}
                onRequestIntro={handleRequestIntro}
                onViewProfile={setViewingInvestor}
                onAddCompany={() => setShowAddCompany(true)}
                isVerified={isVerified}
              />
            )
          ) : tab === "startups" ? (
            <StartupsMarketplace search={search} savedIds={savedIds} onToggleSave={toggleSave} onRequestIntro={handleRequestIntro} onViewProfile={setViewingStartup} />
          ) : tab === "discover" ? (
            <Discover isInvestor={isInvestor} search={search} savedIds={savedIds} onToggleSave={toggleSave} onRequestIntro={handleRequestIntro} onViewProfile={setViewingInvestor} onViewStartup={setViewingStartup} isVerified={isVerified} />
          ) : tab === "saved" ? (
            isInvestor ? <PipelineBoard search={search} /> : <Saved isInvestor={isInvestor} savedIds={savedIds} onToggleSave={toggleSave} onRequestIntro={handleRequestIntro} onViewProfile={setViewingInvestor} onViewStartup={setViewingStartup} isVerified={isVerified} />
          ) : tab === "requests" ? (
            <RequestsView isInvestor={isInvestor} userId={user.id} />
          ) : tab === "appointments" ? (
            <AppointmentsView userId={profile.id} />
          ) : tab === "connections" ? (
            <Connections isInvestor={isInvestor} userId={profile.id} isVerified={isVerified} onRedirectToSettings={() => setTab("settings")} />
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
              senderId: profile.id,
              senderName: profile.full_name || user.email,
              investorId: 'self',
              investorName: 'Institutional Pool',
              investorFocus: 'Platform Listing',
              status: 'pending',
              date: new Date().toISOString(),
              ...data
            });
            saveIntroReqs(reqs);
            setShowAddCompany(false);
            toast.success("Company successfully listed!", {
              description: "Your venture is now visible to the global investor ecosystem."
            });

            // Simulate an investor response after 10 seconds for demo
            setTimeout(() => {
              const current = getIntroReqs();
              const idx = current.findIndex(r => r.id === reqs[reqs.length - 1].id);
              if (idx > -1) {
                current[idx].status = 'accepted';
                const demoDate = new Date();
                demoDate.setDate(demoDate.getDate() + 2);
                demoDate.setHours(14, 0, 0, 0);
                const timeStr = demoDate.toISOString();
                
                current[idx].actionReason = "Impressive traction velocity. I've scheduled a deep-dive session for us.";
                current[idx].appointmentTime = timeStr;
                
                // Add to appointments list too
                const appts = JSON.parse(localStorage.getItem('appointments') || '[]');
                appts.push({
                  id: 'demo-' + Math.random().toString(36).slice(2),
                  senderId: 'demo-investor',
                  receiverId: profile.id,
                  targetId: 'demo-investor',
                  targetName: 'Northwind Capital',
                  targetInitials: 'NC',
                  time: timeStr,
                  meetLink: 'https://meet.google.com/abc-defg-hij',
                  status: 'confirmed'
                });
                localStorage.setItem('appointments', JSON.stringify(appts));
                
                saveIntroReqs(current);
                toast.info("Meeting Scheduled!", {
                  description: `Northwind Capital has scheduled a deep-dive for ${demoDate.toLocaleDateString()}.`
                });
              }
            }, 10000);
          }} 
        />
      )}

      {requestingTarget && (
        <IntroRequestModal 
          target={requestingTarget} 
          isInvestor={isInvestor}
          isConsulting={!isInvestor && isVerified}
          onClose={() => setRequestingTarget(null)} 
          onSubmit={(data) => {
            const reqs = getIntroReqs();
            const newReq = {
              id: Math.random().toString(36).slice(2),
              senderId: profile.id,
              senderName: profile.full_name || user.email,
              receiverId: requestingTarget.id,
              receiverName: requestingTarget.firm || requestingTarget.name,
              investorId: requestingTarget.id,
              investorName: requestingTarget.firm || requestingTarget.name,
              investorFocus: requestingTarget.focus || requestingTarget.sector,
              status: 'pending',
              date: new Date().toISOString(),
              appointmentTime: data.appointmentTime,
              ...data
            };
            reqs.push(newReq);

            // If the target is a startup listing, update the original listing state
            const listingIdx = reqs.findIndex(r => r.id === requestingTarget.id);
            if (listingIdx > -1) {
              reqs[listingIdx].status = 'accepted';
              reqs[listingIdx].actionReason = `Investor ${profile.full_name || 'Partner'} requested an intro: "${data.reason}"`;
              if (data.appointmentTime) {
                reqs[listingIdx].appointmentTime = data.appointmentTime;
              }
            }
            
            saveIntroReqs(reqs);

            if (data.appointmentTime) {
              const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
              appointments.push({
                id: Math.random().toString(36).slice(2),
                senderId: profile.id,
                receiverId: requestingTarget.id,
                targetId: requestingTarget.id,
                targetName: requestingTarget.name || requestingTarget.firm,
                targetInitials: requestingTarget.initials,
                time: data.appointmentTime,
                meetLink: `https://meet.google.com/${Math.random().toString(36).slice(2,5)}-${Math.random().toString(36).slice(2,6)}-${Math.random().toString(36).slice(2,5)}`,
                status: 'confirmed'
              });
              localStorage.setItem('appointments', JSON.stringify(appointments));

              // Trigger Google Calendar sync template
              const start = new Date(data.appointmentTime).toISOString().replace(/-|:|\.\d\d\d/g, "");
              const end = new Date(new Date(data.appointmentTime).getTime() + 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, "");
              const gUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("Ventura Intro: " + (requestingTarget.name || requestingTarget.firm))}&dates=${start}/${end}&details=${encodeURIComponent("Scheduled via Ventura Venture Infrastructure.")}&location=Google Meet`;
              window.open(gUrl, '_blank');
            }

            setRequestingTarget(null);
            toast.success(isInvestor ? "Appointment scheduled and synced!" : (!isInvestor && isVerified) ? "Consulting session booked!" : "Intro request sent!");
          }} 
        />
      )}

      {viewingInvestor && (
        <InvestorProfileModal 
          investor={viewingInvestor} 
          onClose={() => setViewingInvestor(null)} 
          onRequestIntro={() => {
            const target = viewingInvestor;
            setViewingInvestor(null);
            handleRequestIntro(target);
          }}
        />
      )}

      {viewingStartup && (
        <StartupProfileModal 
          startup={viewingStartup} 
          onClose={() => setViewingStartup(null)} 
          onCollaborate={() => {
            const target = viewingStartup;
            setViewingStartup(null);
            handleRequestIntro(target);
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
  search, savedIds, onToggleSave, onRequestIntro, onViewProfile, onAddCompany, isVerified
}: {
  search: string; savedIds: Set<string>; onToggleSave: (id: string) => void; onRequestIntro: (i: any) => void; onViewProfile?: (i: any) => void; onAddCompany?: () => void; isVerified: boolean;
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
        <KpiCard icon={TrendingUp} label="Institutional matches" value="38" trend="+12% wk" />
        <KpiCard icon={Inbox} label="Venture Intros" value="14" trend="+3" />
        <KpiCard icon={Bookmark} label="Shortlisted" value={String(savedIds.size)} trend="" />
        <KpiCard icon={BarChart3} label="Audit Visibility" value="284" trend="+24% wk" />
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-3xl border border-primary/20 bg-primary/5 p-8 relative overflow-hidden group">
          <div className="absolute right-0 top-0 h-64 w-64 translate-x-32 -translate-y-32 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8">
            <div className="max-w-md">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold text-primary uppercase tracking-widest mb-4">
                <Sparkles className="h-3 w-3" /> Proprietary Intelligence
              </div>
              <h2 className="font-display text-2xl font-bold tracking-tight">Fundraising Probability</h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Based on your current <span className="text-foreground font-semibold">Traction Velocity</span> and <span className="text-foreground font-semibold">Audit Status</span>, your probability of securing a Term Sheet within 60 days is currently <span className="text-primary font-bold">84%</span>.
              </p>
              <div className="mt-6 flex gap-4">
                <div className="flex-1 rounded-2xl bg-background/50 p-4 border border-border/50">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">Sector Heat</div>
                  <div className="mt-1 font-bold text-success flex items-center gap-1">High <TrendingUp className="h-3 w-3" /></div>
                </div>
                <div className="flex-1 rounded-2xl bg-background/50 p-4 border border-border/50">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">Inbound Index</div>
                  <div className="mt-1 font-bold text-primary">7.4/10</div>
                </div>
              </div>
            </div>
            <div className="flex shrink-0 items-center justify-center">
              <TrustScore score={84} label="Prob. Index" />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-8 flex flex-col justify-between">
          <div>
            <h3 className="font-bold flex items-center gap-2">
              <PieChart className="h-4 w-4 text-primary" /> Allocation Readiness
            </h3>
            <div className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                  <span>Data Room Completion</span>
                  <span>92%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-success" style={{ width: '92%' }} />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                  <span>Founder Verification</span>
                  <span>100%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-primary" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
          <button className="mt-8 w-full rounded-xl border border-border bg-background py-3 text-xs font-bold transition-smooth hover:bg-accent">
            Generate Intelligence Report
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((it: any) =>
          <InvestorCard key={it.id} i={it} saved={savedIds.has(it.id)} onSave={() => onToggleSave(it.id)} onRequestIntro={() => onRequestIntro(it)} onViewProfile={() => onViewProfile?.(it)} />
        )}
      </div>
    </div>
  );
}

function InvestorHome({
  search, savedIds, onToggleSave, onRequestIntro, onViewProfile
}: {
  search: string; savedIds: Set<string>; onToggleSave: (id: string) => void; onRequestIntro: (s: any) => void; onViewProfile?: (s: any) => void;
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
    const list = [...STARTUPS, ...getAddedCompanies()];
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
        <KpiCard icon={Sparkles} label="Vetted Ventures" value="126" trend="+8% wk" />
        <KpiCard icon={Inbox} label="Inbound Alpha" value="42" trend="+12" />
        <KpiCard icon={Bookmark} label="Investment Pipeline" value={String(savedIds.size)} trend="" />
        <KpiCard icon={Users} label="Institutional Network" value="47" trend="+2" />
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-3xl border border-blue-500/20 bg-blue-500/5 p-8 relative overflow-hidden group">
          <div className="absolute right-0 top-0 h-64 w-64 translate-x-32 -translate-y-32 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8">
            <div className="max-w-md">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-4">
                <Activity className="h-3 w-3" /> Deal Flow Intelligence
              </div>
              <h2 className="font-display text-2xl font-bold tracking-tight">Ecosystem Velocity</h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Venture activity in <span className="text-foreground font-semibold">AI & Deeptech</span> has increased by <span className="text-blue-600 font-bold">18%</span> in the last 7 days. Current deal flow quality score is at an institutional peak.
              </p>
              <div className="mt-6 flex gap-4">
                <div className="flex-1 rounded-2xl bg-background/50 p-4 border border-border/50">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">Round Pressure</div>
                  <div className="mt-1 font-bold text-blue-600 flex items-center gap-1">High <TrendingUp className="h-3 w-3" /></div>
                </div>
                <div className="flex-1 rounded-2xl bg-background/50 p-4 border border-border/50">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">Liquidity Score</div>
                  <div className="mt-1 font-bold text-blue-600">8.2/10</div>
                </div>
              </div>
            </div>
            <div className="flex shrink-0 items-center justify-center">
              <TrustScore score={91} label="Alpha Index" />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-8 flex flex-col justify-between">
          <div>
            <h3 className="font-bold flex items-center gap-2">
              <PieChart className="h-4 w-4 text-blue-600" /> Sourcing Coverage
            </h3>
            <div className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                  <span>Thesis Alignment</span>
                  <span>88%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: '88%' }} />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                  <span>Geographic Reach</span>
                  <span>Global</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-blue-500" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
          <button className="mt-8 w-full rounded-xl border border-border bg-background py-3 text-xs font-bold transition-smooth hover:bg-accent">
            Export Deal Intelligence
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((it: any) =>
          <StartupCard key={it.id} s={it} saved={savedIds.has(it.id)} onSave={() => onToggleSave(it.id)} onRequestIntro={() => onRequestIntro(it)} onViewProfile={() => onViewProfile?.(it)} />
        )}
      </div>
    </div>
  );
}

function Discover({
  isInvestor, search, savedIds, onToggleSave, onRequestIntro, onViewProfile, onViewStartup, isVerified
}: { isInvestor: boolean; search: string; savedIds: Set<string>; onToggleSave: (id: string) => void; onRequestIntro: (i: any) => void; onViewProfile?: (i: any) => void; onViewStartup?: (s: any) => void; isVerified: boolean; }) {
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
        <ForYou isInvestor={isInvestor} search={search} savedIds={savedIds} onToggleSave={onToggleSave} onRequestIntro={onRequestIntro} onViewProfile={onViewProfile} onViewStartup={onViewStartup} isVerified={isVerified} />
      </div>
    </div>
  );
}

function ForYou({
  isInvestor, search, savedIds, onToggleSave, onRequestIntro, onViewProfile, onViewStartup, isVerified
}: {
  isInvestor: boolean; search: string; savedIds: Set<string>; onToggleSave: (id: string) => void; onRequestIntro: (i: any) => void; onViewProfile?: (i: any) => void; onViewStartup?: (s: any) => void; isVerified: boolean;
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
          ? <StartupCard key={it.id} s={it} saved={savedIds.has(it.id)} onSave={() => onToggleSave(it.id)} onRequestIntro={() => onRequestIntro(it)} onViewProfile={() => onViewStartup?.(it)} />
          : <InvestorCard key={it.id} i={it} saved={savedIds.has(it.id)} onSave={() => onToggleSave(it.id)} onRequestIntro={() => onRequestIntro(it)} onViewProfile={() => onViewProfile?.(it)} isCurrentUserVerified={isVerified} />
      )}
    </div>
  );
}

function Saved({
  isInvestor, savedIds, onToggleSave, onRequestIntro, onViewProfile, onViewStartup, isVerified
}: { isInvestor: boolean; savedIds: Set<string>; onToggleSave: (id: string) => void; onRequestIntro: (i: any) => void; onViewProfile?: (i: any) => void; onViewStartup?: (s: any) => void; isVerified: boolean; }) {
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
              ? <StartupCard key={it.id} s={it} saved onSave={() => onToggleSave(it.id)} onViewProfile={() => onViewStartup?.(it)} />
              : <InvestorCard key={it.id} i={it} saved onSave={() => onToggleSave(it.id)} onRequestIntro={() => onRequestIntro(it)} onViewProfile={() => onViewProfile?.(it)} isCurrentUserVerified={isVerified} />
          )}
        </div>
      )}
    </div>
  );
}

function AppointmentsView({ userId }: { userId: string }) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const saved = localStorage.getItem('appointments');
    if (saved) {
      try {
        const all = JSON.parse(saved);
        if (Array.isArray(all)) {
          setAppointments(all.filter((a: any) => a.senderId === userId || a.receiverId === userId));
        }
      } catch (e) {
        console.error("Failed to parse appointments", e);
      }
    }
  }, [userId]);

  const days = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });
  }, [currentDate]);

  const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM

  const addToGoogleCalendar = (apt: any) => {
    const start = new Date(apt.time).toISOString().replace(/-|:|\.\d\d\d/g, "");
    const end = new Date(new Date(apt.time).getTime() + 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, "");
    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("Ventura Meeting: " + apt.targetName)}&dates=${start}/${end}&details=${encodeURIComponent("Google Meet Link: " + apt.meetLink)}&location=${encodeURIComponent(apt.meetLink)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="animate-fade-in flex flex-col h-[calc(100vh-160px)]">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">Appointments</h1>
          <p className="mt-1 text-sm text-muted-foreground">Synchronized with your venture network.</p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-1 shadow-sm">
          <button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)))} className="rounded-xl p-2 hover:bg-muted transition-smooth"><Activity className="h-4 w-4 rotate-180" /></button>
          <button onClick={() => setCurrentDate(new Date())} className="px-4 py-1.5 text-xs font-bold hover:bg-muted rounded-xl transition-smooth">Today</button>
          <button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)))} className="rounded-xl p-2 hover:bg-muted transition-smooth"><Activity className="h-4 w-4" /></button>
          <div className="px-4 py-1.5 text-xs font-bold border-l border-border ml-1">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto rounded-[2rem] border border-border bg-card shadow-elegant">
        <div className="min-w-[800px]">
          {/* Calendar Header */}
          <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-border sticky top-0 z-20 bg-card/80 backdrop-blur-md">
            <div className="h-20 border-r border-border flex items-center justify-center">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">GMT+5:30</span>
            </div>
            {days.map((d, i) => (
              <div key={i} className={`h-20 flex flex-col items-center justify-center border-r border-border last:border-0 ${d.toDateString() === new Date().toDateString() ? 'bg-primary/5' : ''}`}>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                <span className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold transition-smooth ${d.toDateString() === new Date().toDateString() ? 'bg-primary text-primary-foreground shadow-glow' : 'hover:bg-muted'}`}>
                  {d.getDate()}
                </span>
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="relative grid grid-cols-[80px_repeat(7,1fr)]">
            {/* Hour markers */}
            <div className="col-start-1">
              {hours.map(h => (
                <div key={h} className="h-24 border-r border-b border-border flex items-start justify-center pt-2">
                  <span className="text-[10px] font-bold text-muted-foreground">{h > 12 ? `${h-12} PM` : h === 12 ? '12 PM' : `${h} AM`}</span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {days.map((d, i) => (
              <div key={i} className="relative h-full border-r border-border last:border-0">
                {hours.map(h => (
                  <div key={h} className="h-24 border-b border-border" />
                ))}
                
                {/* Appointments for this day */}
                {appointments.filter(a => new Date(a.time).toDateString() === d.toDateString()).map(apt => {
                  const date = new Date(apt.time);
                  const startHour = date.getHours() + date.getMinutes() / 60;
                  const top = (startHour - 8) * 96; // 96px is h-24
                  
                  return (
                    <div 
                      key={apt.id} 
                      style={{ top: `${top}px` }} 
                      className="absolute left-1 right-1 z-10 rounded-xl bg-gradient-navy border border-primary/20 p-3 shadow-elegant transition-all hover:scale-[1.02] hover:shadow-glow group cursor-pointer h-24"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 font-display text-xs font-bold text-white shadow-sm">
                          {apt.targetInitials}
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); addToGoogleCalendar(apt); }}
                          className="rounded-lg bg-primary/20 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-primary"
                          title="Sync to Google Calendar"
                        >
                          <Globe className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="mt-2">
                        <div className="text-[10px] font-bold text-white/90 truncate">{apt.targetName}</div>
                        <div className="text-[9px] font-medium text-white/60 flex items-center gap-1 mt-0.5">
                          <Video className="h-2.5 w-2.5" /> Google Meet
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Current time indicator if today is in view */}
            {days.some(d => d.toDateString() === new Date().toDateString()) && (
              <div 
                className="absolute left-0 right-0 z-30 pointer-events-none"
                style={{ 
                  top: `${(new Date().getHours() + new Date().getMinutes() / 60 - 8) * 96}px`,
                  display: new Date().getHours() >= 8 && new Date().getHours() < 21 ? 'block' : 'none'
                }}
              >
                <div className="relative w-full border-t-2 border-primary/80">
                  <div className="absolute -left-1.5 -top-1.5 h-3 w-3 rounded-full bg-primary" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Connections({ isInvestor, userId, isVerified, onRedirectToSettings }: { isInvestor: boolean; userId: string; isVerified?: boolean; onRedirectToSettings?: () => void }) {
  const [tab, setTab] = useState<"pending" | "active" | "archived">("pending");
  const [reqs, setReqs] = useState<LocalIntroRequest[]>([]);
  const [actionModal, setActionModal] = useState<{ req: LocalIntroRequest; action: 'accepted' | 'rejected' } | null>(null);
  const [actionReason, setActionReason] = useState("");

  useEffect(() => {
    const load = () => {
      const all = getIntroReqs();
      // Filter where this user is the receiver
      setReqs(all.filter(r => r.receiverId === userId));
    };
    load();
    const handler = () => load();
    window.addEventListener('reqsUpdated', handler);
    return () => window.removeEventListener('reqsUpdated', handler);
  }, [userId]);

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
                  <span className="text-primary font-display">From: {r.senderName || r.investorName || 'New Request'}</span>
                  {r.status === 'accepted' && <span className="flex h-4 w-4 items-center justify-center rounded-full bg-success text-[10px] text-white">✓</span>}
                  {r.status === 'rejected' && <span className="flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white">✕</span>}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Target: {r.investorName} • {isInvestor ? `Asking: ${r.expected}` : `Focus: ${r.investorFocus}`}
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
                  <button 
                    onClick={() => {
                      if (!isVerified) {
                        toast.error("Investor verification is mandatory", {
                          description: "Please complete your verification in Account Settings to accept introduction requests.",
                        });
                        onRedirectToSettings?.();
                        return;
                      }
                      setActionModal({ req: r, action: 'accepted' });
                    }} 
                    className={`rounded-lg px-4 py-2 text-xs font-semibold text-white transition-smooth ${isVerified ? 'bg-success hover:bg-success/80' : 'bg-muted text-muted-foreground border border-border cursor-not-allowed opacity-80'}`}
                  >
                    Accept
                  </button>
                  <button onClick={() => setActionModal({ req: r, action: 'rejected' })} className="rounded-lg bg-destructive px-4 py-2 text-xs font-semibold text-white transition-smooth hover:bg-destructive/80">Reject</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <AnimatePresence>
        {actionModal && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm" onClick={() => setActionModal(null)}>
            <motion.div 
              initial={{ x: "100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md h-full bg-background shadow-2xl flex flex-col border-l border-border"
            >
              <div className="p-8 border-b border-border bg-gradient-to-br from-background to-muted/30">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-2xl font-bold tracking-tight">Institutional Action</h2>
                  <button onClick={() => setActionModal(null)} className="text-muted-foreground hover:text-foreground transition-smooth">
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground uppercase tracking-widest font-bold">
                  Decision: <span className={actionModal.action === 'accepted' ? 'text-success' : 'text-destructive'}>{actionModal.action}</span>
                </p>
              </div>

              <div className="flex-1 p-8 overflow-y-auto space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">Reasoning & Context *</label>
                  <textarea 
                    value={actionReason} 
                    onChange={e => setActionReason(e.target.value)} 
                    rows={6} 
                    className="w-full rounded-2xl border border-border bg-muted/20 px-4 py-4 text-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/5 transition-smooth" 
                    placeholder="Provide professional reasoning for this decision..." 
                  />
                  <p className="mt-2 text-[10px] text-muted-foreground italic">This reasoning will be visible to the requester in their activity feed.</p>
                </div>
              </div>

              <div className="p-8 border-t border-border bg-card/30 flex gap-4">
                <button 
                  onClick={handleActionSubmit} 
                  className="flex-1 rounded-2xl bg-gradient-primary py-4 text-sm font-bold text-primary-foreground shadow-elegant hover:shadow-glow transition-all active:scale-95"
                >
                  Confirm Decision
                </button>
                <button 
                  onClick={() => setActionModal(null)} 
                  className="rounded-2xl border border-border px-8 py-4 text-sm font-bold text-muted-foreground transition-smooth hover:bg-muted"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Settings_({ profile, user, isVerified, onVerify }: { profile: any; user: any; isVerified: boolean; onVerify: (v: boolean) => void }) {
  const isInvestor = profile.role === "investor";
  const storageKey = isInvestor ? `investor_profile_${user?.id}` : `startup_profile_${user?.id}`;
  
  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    
    return isInvestor ? {
      fullName: profile.full_name || "",
      email: user?.email || "",
      mobile: "",
      linkedin: "",
      investorType: "Angel Investor",
      jobTitle: "",
      firmName: profile.company_name || "",
      website: "",
      experience: "",
      panNumber: "",
      cinNumber: "",
      sectors: [] as string[],
      stages: [] as string[],
      minInvest: "",
      maxInvest: "",
      portfolio: "",
      bio: "",
      crunchbase: "",
      angelList: "",
    } : {
      companyName: profile.company_name || "",
      email: user?.email || "",
      mobile: "",
      website: "",
      linkedin: "",
      logo: "",
      founderName: profile.full_name || "",
      coFounders: "",
      founderLinkedin: "",
      founderEmail: user?.email || "",
      founderMobile: "",
      companyType: "Private Limited Company",
      cinNumber: "",
      llpinNumber: "",
      gstNumber: "",
      businessPan: "",
      establishmentYear: "",
      businessAddress: "",
      teamSize: "",
      location: "",
    };
  });

  const [verifying, setVerifying] = useState(false);
  const [step, setStep] = useState(0);
  const [savedMsg, setSavedMsg] = useState("");

  const verificationSteps = isInvestor ? [
    { name: "Professional Background", icon: Briefcase, desc: "Validation of experience and job title" },
    { name: "Identity & PAN Audit", icon: ShieldCheck, desc: "Regulatory check of tax identification" },
    { name: "Institutional Status", icon: Building2, desc: "VC Firm / Angel credential verification" },
    { name: "Portfolio Review", icon: Bookmark, desc: "Credibility check of previous investments" },
    { name: "AI Credibility Score", icon: Zap, desc: "Risk analysis and profiling" },
  ] : [
    { name: "KYC & Identity Verification", icon: ShieldCheck, desc: "Biometric and document-based identity audit" },
    { name: "Founder Integrity Check", icon: Users, desc: "Historical professional validation" },
    { name: "Entity Compliance Check", icon: Building2, desc: "GST and MCA incorporation audit" },
    { name: "Financial Audit", icon: BarChart3, desc: "Bank statement and traction validation" },
    { name: "AI Performance Scoring", icon: Zap, desc: "Growth potential and risk analysis" },
  ];

  const handleVerify = () => {
    onVerify(false); // Reset status to show animation
    setVerifying(true);
    setStep(0);
    
    const interval = setInterval(() => {
      setStep(s => {
        if (s >= verificationSteps.length - 1) {
          clearInterval(interval);
          setVerifying(false);
          onVerify(true);
          toast.success(isInvestor ? "Investor Accreditation Successful" : "Venture Infrastructure Verified", {
            description: isInvestor ? "Your institutional profile is now active for deal flow." : "Your operational infrastructure is now live for investor discovery.",
          });
          return s;
        }
        return s + 1;
      });
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleArrayField = (field: 'sectors' | 'stages', value: string) => {
    const current = [...(formData[field] || [])];
    const index = current.indexOf(value);
    if (index > -1) current.splice(index, 1);
    else current.push(value);
    setFormData({ ...formData, [field]: current });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(storageKey, JSON.stringify(formData));
    setSavedMsg("Operational profile updated");
    setTimeout(() => setSavedMsg(""), 3000);
    window.dispatchEvent(new Event('profileUpdated'));
    
    // Always trigger verification engine on submit
    if (!verifying) {
      handleVerify();
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-12 pb-20">
      <div className="lg:col-span-7">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
              {isInvestor ? "Investor Accreditation" : "Startup Verification"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage your institutional presence and operational data.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-8 rounded-3xl border border-border/50 bg-card/30 p-8 backdrop-blur-sm">
          {isInvestor ? (
            <div className="space-y-10">
              {/* Basic Information */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary border-b border-primary/10 pb-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px]">1</span>
                  Basic Information
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full Name *" name="fullName" value={formData.fullName} onChange={handleChange} />
                  <Field label="Email Address *" name="email" value={formData.email} onChange={handleChange} type="email" />
                  <Field label="Mobile Number *" name="mobile" value={formData.mobile} onChange={handleChange} />
                  <Field label="LinkedIn Profile URL *" name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/..." />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Investor Type *</label>
                  <div className="flex gap-4">
                    {["Angel Investor", "Venture Capital Firm"].map(t => (
                      <label key={t} className="flex items-center gap-2 cursor-pointer group">
                        <input type="radio" name="investorType" value={t} checked={formData.investorType === t} onChange={handleChange} className="accent-primary" />
                        <span className="text-sm font-medium group-hover:text-primary transition-smooth">{t}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </section>

              {/* Professional Information */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary border-b border-primary/10 pb-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px]">2</span>
                  Professional Information
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Current Job Title *" name="jobTitle" value={formData.jobTitle} onChange={handleChange} />
                  <Field label="Organization / Firm Name" name="firmName" value={formData.firmName} onChange={handleChange} />
                  <Field label="Official Website" name="website" value={formData.website} onChange={handleChange} placeholder="https://..." />
                  <Field label="Years of Investment Experience *" name="experience" value={formData.experience} onChange={handleChange} type="number" />
                </div>
              </section>

              {/* Identity Verification */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary border-b border-primary/10 pb-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px]">3</span>
                  Identity Verification
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="PAN Card Number *" name="panNumber" value={formData.panNumber} onChange={handleChange} placeholder="ABCDE1234F" />
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Upload PAN Card *</label>
                    <div className="flex h-[42px] items-center justify-center rounded-xl border border-dashed border-border bg-background/50 text-[10px] font-bold text-muted-foreground hover:border-primary/50 cursor-pointer transition-smooth">
                      Drag & Drop or Browse
                    </div>
                  </div>
                </div>
                {formData.investorType === "Venture Capital Firm" && (
                  <div className="mt-4 p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-4">
                    <div className="text-[10px] font-bold text-primary uppercase">VC Firm Credentials</div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Company CIN Number" name="cinNumber" value={formData.cinNumber} onChange={handleChange} />
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Registration Certificate</label>
                        <div className="flex h-[42px] items-center justify-center rounded-xl border border-dashed border-border bg-background/50 text-[10px] font-bold text-muted-foreground transition-smooth hover:border-primary/50 cursor-pointer">Upload PDF</div>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* Investment Preferences */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary border-b border-primary/10 pb-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px]">4</span>
                  Investment Preferences
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Preferred Startup Sectors *</label>
                  <div className="flex flex-wrap gap-2">
                    {["AI", "FinTech", "SaaS", "Healthcare", "EdTech", "E-Commerce", "Blockchain", "CleanTech", "Others"].map(s => (
                      <button key={s} type="button" onClick={() => toggleArrayField('sectors', s)} className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-smooth ${formData.sectors.includes(s) ? 'bg-primary text-white shadow-glow' : 'bg-background border border-border text-muted-foreground hover:border-primary/50'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Preferred Investment Stage *</label>
                  <div className="flex flex-wrap gap-2">
                    {["Idea Stage", "Pre-Seed", "Seed", "Early Stage"].map(s => (
                      <button key={s} type="button" onClick={() => toggleArrayField('stages', s)} className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-smooth ${formData.stages.includes(s) ? 'bg-primary text-white shadow-glow' : 'bg-background border border-border text-muted-foreground hover:border-primary/50'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 pt-2">
                  <Field label="Minimum Investment Amount *" name="minInvest" value={formData.minInvest} onChange={handleChange} placeholder="e.g. $50k" />
                  <Field label="Maximum Investment Amount *" name="maxInvest" value={formData.maxInvest} onChange={handleChange} placeholder="e.g. $500k" />
                </div>
              </section>

              {/* Credibility Verification */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary border-b border-primary/10 pb-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px]">5</span>
                  Credibility Verification
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Portfolio Companies</label>
                    <textarea name="portfolio" value={formData.portfolio} onChange={handleChange} placeholder="List some of your previous investments..." className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm min-h-[80px] focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-smooth" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Short Investor Bio *</label>
                    <textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="Tell founders about your investment philosophy..." className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm min-h-[100px] focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-smooth" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Crunchbase Profile URL" name="crunchbase" value={formData.crunchbase} onChange={handleChange} />
                    <Field label="AngelList Profile URL" name="angelList" value={formData.angelList} onChange={handleChange} />
                  </div>
                </div>
              </section>

              {/* Declarations */}
              <section className="space-y-4 bg-muted/30 p-6 rounded-3xl border border-border/50">
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Declaration</div>
                <div className="space-y-3">
                  {[
                    "I confirm that all provided information is accurate.",
                    "I agree to the investor verification process.",
                    "I agree to platform terms and conditions."
                  ].map((d, i) => (
                    <label key={i} className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" className="h-4 w-4 rounded border-border accent-primary" required />
                      <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-smooth">{d}</span>
                    </label>
                  ))}
                </div>
              </section>

              <div className="flex items-center justify-between pt-4">
                <button 
                  type="submit" 
                  disabled={verifying}
                  className="group flex items-center gap-2 rounded-2xl bg-primary px-10 py-4 text-sm font-bold text-white transition-smooth shadow-glow hover:scale-[1.02] disabled:opacity-50"
                >
                  {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {verifying ? "Processing..." : "Submit for Accreditation"}
                </button>
                {savedMsg && <span className="text-sm font-medium text-success flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> {savedMsg}</span>}
              </div>
            </div>
          ) : (
            <div className="space-y-10">
              {/* Basic Startup Information */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary border-b border-primary/10 pb-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px]">1</span>
                  Basic Startup Information
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Startup Name *" name="companyName" value={formData.companyName} onChange={handleChange} />
                  <Field label="Official Email Address *" name="email" value={formData.email} onChange={handleChange} type="email" />
                  <Field label="Official Mobile Number *" name="mobile" value={formData.mobile} onChange={handleChange} />
                  <Field label="Official Website" name="website" value={formData.website} onChange={handleChange} placeholder="https://..." />
                  <Field label="LinkedIn Company Profile" name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="https://linkedin.com/company/..." />
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Startup Logo Upload</label>
                    <div className="flex h-[42px] items-center justify-center rounded-xl border border-dashed border-border bg-background/50 text-[10px] font-bold text-muted-foreground hover:border-primary/50 cursor-pointer transition-smooth">Upload PNG/JPG</div>
                  </div>
                </div>
              </section>

              {/* Founder Information */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary border-b border-primary/10 pb-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px]">2</span>
                  Founder Information
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Founder Full Name *" name="founderName" value={formData.founderName} onChange={handleChange} />
                  <Field label="Co-Founder Name(s)" name="coFounders" value={formData.coFounders} onChange={handleChange} placeholder="Comma separated" />
                  <Field label="Founder LinkedIn Profile *" name="founderLinkedin" value={formData.founderLinkedin} onChange={handleChange} placeholder="https://linkedin.com/in/..." />
                  <Field label="Founder Email Address *" name="founderEmail" value={formData.founderEmail} onChange={handleChange} type="email" />
                  <Field label="Founder Mobile Number *" name="founderMobile" value={formData.founderMobile} onChange={handleChange} />
                </div>
              </section>

              {/* Company Verification */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary border-b border-primary/10 pb-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px]">3</span>
                  Company Verification
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Company Type *</label>
                    <div className="flex flex-wrap gap-4">
                      {["Private Limited Company", "LLP", "Sole Proprietorship", "Partnership Firm"].map(t => (
                        <label key={t} className="flex items-center gap-2 cursor-pointer group">
                          <input type="radio" name="companyType" value={t} checked={formData.companyType === t} onChange={handleChange} className="accent-primary" />
                          <span className="text-sm font-medium group-hover:text-primary transition-smooth">{t}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {formData.companyType === "LLP" ? (
                      <Field label="LLPIN Number" name="llpinNumber" value={formData.llpinNumber} onChange={handleChange} />
                    ) : (
                      <Field label="Company CIN Number" name="cinNumber" value={formData.cinNumber} onChange={handleChange} />
                    )}
                    <Field label="GST Number" name="gstNumber" value={formData.gstNumber} onChange={handleChange} />
                    <Field label="Business PAN Number" name="businessPan" value={formData.businessPan} onChange={handleChange} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Registration Certificate *</label>
                      <div className="flex h-[42px] items-center justify-center rounded-xl border border-dashed border-border bg-background/50 text-[10px] font-bold text-muted-foreground hover:border-primary/50 cursor-pointer transition-smooth">Upload PDF</div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">GST Certificate</label>
                      <div className="flex h-[42px] items-center justify-center rounded-xl border border-dashed border-border bg-background/50 text-[10px] font-bold text-muted-foreground hover:border-primary/50 cursor-pointer transition-smooth">Upload PDF</div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Business PAN Card *</label>
                      <div className="flex h-[42px] items-center justify-center rounded-xl border border-dashed border-border bg-background/50 text-[10px] font-bold text-muted-foreground hover:border-primary/50 cursor-pointer transition-smooth">Upload PDF</div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Business Information */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary border-b border-primary/10 pb-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px]">4</span>
                  Business Information
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Year of Establishment *" name="establishmentYear" value={formData.establishmentYear} onChange={handleChange} type="number" />
                  <Field label="Company Location *" name="location" value={formData.location} onChange={handleChange} placeholder="City, Country" />
                  <Field label="Current Team Size *" name="teamSize" value={formData.teamSize} onChange={handleChange} type="number" />
                  <Field label="Registered Business Address *" name="businessAddress" value={formData.businessAddress} onChange={handleChange} />
                </div>
              </section>

              {/* Verification Information */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary border-b border-primary/10 pb-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px]">5</span>
                  Verification Information
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Founder Government ID *</label>
                    <div className="flex h-[42px] items-center justify-center rounded-xl border border-dashed border-border bg-background/50 text-[10px] font-bold text-muted-foreground hover:border-primary/50 cursor-pointer transition-smooth">Aadhar/Passport/DL</div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Office/Workspace Photos</label>
                    <div className="flex h-[42px] items-center justify-center rounded-xl border border-dashed border-border bg-background/50 text-[10px] font-bold text-muted-foreground hover:border-primary/50 cursor-pointer transition-smooth">Upload Multi-Photos</div>
                  </div>
                </div>
              </section>

              {/* Declarations */}
              <section className="space-y-4 bg-muted/30 p-6 rounded-3xl border border-border/50">
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Declaration</div>
                <div className="space-y-3">
                  {[
                    "I confirm that all provided information is accurate.",
                    "I agree to startup verification checks.",
                    "I agree to platform terms and conditions."
                  ].map((d, i) => (
                    <label key={i} className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" className="h-4 w-4 rounded border-border accent-primary" required />
                      <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-smooth">{d}</span>
                    </label>
                  ))}
                </div>
              </section>

              <div className="flex items-center justify-between pt-4">
                <button 
                  type="submit" 
                  disabled={verifying}
                  className="group flex items-center gap-2 rounded-2xl bg-foreground px-10 py-4 text-sm font-bold text-background transition-smooth hover:opacity-90 hover:scale-[1.02] disabled:opacity-50"
                >
                  {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {verifying ? "Processing..." : "Submit Startup Verification"}
                </button>
                {savedMsg && <span className="text-sm font-medium text-success flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> {savedMsg}</span>}
              </div>
            </div>
          )}
        </form>
      </div>

      <div className="lg:col-span-5 space-y-6 sticky top-24 h-fit">
        <div className="rounded-3xl border border-border/50 bg-card/30 p-8 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-navy shadow-elegant`}>
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-lg">Verification Engine</div>
              <div className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Status: {isVerified ? "Audited" : "Pending"}</div>
            </div>
          </div>

          <div className="space-y-6">
            {verificationSteps.map((s, i) => {
              const isActive = verifying && i === step;
              const isDone = isVerified || (verifying && i < step);
              return (
                <div key={s.name} className="group flex items-start gap-4">
                  <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-bold transition-smooth ${
                    isDone ? "border-success bg-success text-white" : isActive ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground/40"
                  }`}>
                    {isDone ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : isActive ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                  </div>
                  <div className="flex-1">
                    <div className={`text-xs font-bold transition-smooth ${isDone ? "text-foreground" : isActive ? "text-primary" : "text-muted-foreground"}`}>
                      {s.name}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 opacity-60">{s.desc}</div>
                  </div>
                  {(isDone || isActive) && <Activity className={`h-3 w-3 ${isDone ? "text-success/40" : "text-primary animate-pulse"}`} />}
                </div>
              );
            })}
          </div>

          {!isVerified && (
            <button 
              onClick={handleVerify}
              disabled={verifying}
              className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-primary py-4 text-sm font-bold text-primary-foreground shadow-elegant hover:shadow-glow transition-smooth disabled:opacity-50"
            >
              {verifying ? <><Loader2 className="h-4 w-4 animate-spin" /> Audit in Progress...</> : <><Lock className="h-4 w-4" /> Start Compliance Audit</>}
            </button>
          )}

          {isVerified && (
            <div className="mt-8 space-y-6 animate-fade-up">
              <div className="flex justify-center">
                <TrustScore score={88} label="Trust Index" />
              </div>
              <div className="rounded-2xl bg-success/5 border border-success/20 p-4 text-center">
                <div className="text-[10px] font-bold text-success uppercase tracking-[0.2em]">Institutional-Grade Trust</div>
                <div className="mt-1 text-xs text-muted-foreground">Your institutional profile is now cryptographically verified for deal flow and intro sessions.</div>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-primary/20 bg-primary/5 p-8 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/10 blur-3xl transition-transform group-hover:scale-150" />
          <div className="relative z-10">
            <h3 className="font-display font-bold text-primary">AI Intelligence Layer</h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Our proprietary audit system continuously monitors your {isInvestor ? "investment track record" : "traction velocity"} and compliance status to maintain your trust index.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, name, value, onChange, type = "text", placeholder, readOnly = false }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</label>
      <input 
        name={name} 
        type={type}
        value={value} 
        onChange={onChange} 
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-smooth ${readOnly ? 'cursor-not-allowed opacity-70' : ''}`} 
      />
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

function TrustScore({ score, label }: { score: number; label: string }) {
  const [currentScore, setCurrentScore] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutExpo = 1 - Math.pow(2, -10 * progress);
      
      setCurrentScore(Math.floor(easeOutExpo * score));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [score]);

  return (
    <div className="flex flex-col items-center animate-fade-up">
      <div className="relative flex h-24 w-24 items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-primary/10 blur-2xl animate-pulse" />
        <svg className="h-full w-full rotate-[-90deg] relative z-10" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" className="stroke-muted/10 fill-none" strokeWidth="8" />
          <circle 
            cx="50" 
            cy="50" 
            r="42" 
            className="stroke-primary fill-none transition-all duration-[2000ms] ease-out" 
            strokeWidth="8" 
            strokeDasharray="263.9" 
            strokeDashoffset={263.9 - (263.9 * currentScore) / 100} 
            strokeLinecap="round" 
          />
        </svg>
        <div className="absolute flex flex-col items-center z-20">
          <span className="text-2xl font-black font-display tracking-tighter text-foreground leading-none">
            {currentScore}
          </span>
          <span className="text-[7px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-1">{label}</span>
        </div>
      </div>
    </div>
  );
}

function StartupCard({ s, saved, onSave, onRequestIntro, onViewProfile, alwaysShowIntelligence }: { s: Startup; saved: boolean; onSave: () => void; onRequestIntro?: () => void; onViewProfile?: () => void; alwaysShowIntelligence?: boolean }) {
  const [showIntelligence, setShowIntelligence] = useState(false);
  const displayIntelligence = showIntelligence || alwaysShowIntelligence;

  return (
    <div 
      onMouseEnter={() => setShowIntelligence(true)}
      onMouseLeave={() => setShowIntelligence(false)}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card transition-smooth hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elegant"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-navy font-display text-sm font-bold text-navy-foreground">{s.initials}</div>
          <div>
            <div onClick={onViewProfile} className="font-display text-base font-semibold cursor-pointer hover:text-primary transition-colors flex items-center gap-1.5">
              {s.name}
              {s.verified && (
                <span title="Verified Startup"><CheckCircle2 className="h-4 w-4 text-blue-500 fill-blue-500/10 shrink-0" /></span>
              )}
            </div>
            <div className="text-xs text-muted-foreground">{s.sector} · {s.stage}</div>
          </div>
        </div>
        <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success">{s.match}% match</span>
      </div>

      {alwaysShowIntelligence && displayIntelligence && (
        <div className="mt-3 animate-fade-in rounded-xl bg-primary/5 p-2.5 text-[10px] text-primary font-medium flex items-center gap-2 ring-1 ring-inset ring-primary/10">
          <Zap className="h-3 w-3" />
          Traction velocity high in {s.sector} sector • 94% Compatibility
        </div>
      )}

      <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {s.location}</span>
        <span>·</span>
        <span>Asking <span className="font-semibold text-foreground">{s.ask}</span></span>
      </div>

      <div className="mt-5 flex gap-2">
        {onRequestIntro && (
          <button onClick={onRequestIntro} className="group/cta inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gradient-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-elegant transition-smooth hover:shadow-glow">
            Request intro <ArrowUpRight className="h-3 w-3 transition-transform group-hover/cta:translate-x-0.5" />
          </button>
        )}
        <button onClick={onSave} className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-smooth ${saved ? "border-primary/40 bg-accent text-primary" : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}>
          <Heart className="h-4 w-4" fill={saved ? "currentColor" : "none"} />
        </button>
      </div>

      {!alwaysShowIntelligence && displayIntelligence && (
        <div className="mt-4 animate-fade-in rounded-xl bg-primary/5 p-2.5 text-[10px] text-primary font-medium flex items-center gap-2 ring-1 ring-inset ring-primary/10">
          <Zap className="h-3 w-3" />
          Traction velocity high in {s.sector} sector • 94% Compatibility
        </div>
      )}
    </div>
  );
}

function InvestorCard({ i, saved, onSave, onRequestIntro, onViewProfile, isCurrentUserVerified }: { i: any; saved: boolean; onSave: () => void; onRequestIntro?: () => void; onViewProfile?: () => void; isCurrentUserVerified?: boolean }) {
  const [showIntelligence, setShowIntelligence] = useState(false);

  return (
    <div 
      onMouseEnter={() => setShowIntelligence(true)}
      onMouseLeave={() => setShowIntelligence(false)}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card transition-smooth hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elegant"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-navy font-display text-sm font-bold text-navy-foreground">{i.initials}</div>
          <div>
            <div onClick={onViewProfile} className="font-display text-base font-semibold cursor-pointer hover:text-primary transition-colors flex items-center gap-1.5">
              {i.firm}
              {i.verified && (
                <span title="Verified Investor"><CheckCircle2 className="h-4 w-4 text-blue-500 fill-blue-500/10 shrink-0" /></span>
              )}
            </div>
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
          {isCurrentUserVerified ? "Get consulting" : "Request intro"} <ArrowUpRight className="h-3 w-3" />
        </button>
        <button onClick={onSave} className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-smooth ${saved ? "border-primary/40 bg-accent text-primary" : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}>
          <Heart className="h-4 w-4" fill={saved ? "currentColor" : "none"} />
        </button>
      </div>

      {showIntelligence && (
        <div className="mt-4 animate-fade-in rounded-xl bg-blue-500/5 p-2.5 text-[10px] text-blue-600 font-medium flex items-center gap-2 ring-1 ring-inset ring-blue-500/10">
          <Activity className="h-3 w-3" />
          High sector match • 88% Investment Readiness
        </div>
      )}
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, trend }: { icon: any; label: string; value: string; trend: string }) {
  return (
    <div className="group rounded-3xl border border-border bg-card/50 p-6 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-elegant">
      <div className="flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-background border border-border transition-colors group-hover:border-primary/20 group-hover:bg-primary/5">
          <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${trend.startsWith('+') ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
            {trend.startsWith('+') && <TrendingUp className="h-2.5 w-2.5" />} {trend}
          </div>
        )}
      </div>
      <div className="mt-6 flex flex-col">
        <span className="font-display text-2xl font-bold tracking-tight">{value}</span>
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-70">{label}</span>
      </div>
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

function IntroRequestModal({ 
  target, 
  isInvestor, 
  onClose, 
  onSubmit,
  isConsulting
}: { 
  target: any; 
  isInvestor: boolean; 
  onClose: () => void; 
  onSubmit: (data: any) => void;
  isConsulting?: boolean;
}) {
  const [formData, setFormData] = useState({ 
    name: '', 
    domain: '', 
    reason: '', 
    appointmentTime: '',
    companyName: '',
    logo: '',
    address: '',
    expected: ''
  });
  
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{ score: number; details: string[] } | null>(null);

  const runAIAnalysis = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalysisResult({
        score: Math.floor(Math.random() * (98 - 85) + 85),
        details: [
          "Zero legal disputes found",
          "Entity compliance verified",
          "Scalability aligns with thesis",
          "Founder background verified"
        ]
      });
      setAnalyzing(false);
      toast.success("AI Analysis Complete");
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div 
        initial={{ x: "100%" }} 
        animate={{ x: 0 }} 
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl h-full bg-background shadow-2xl flex flex-col md:flex-row border-l border-border"
      >
        {/* Left Sidebar */}
        <div className="bg-muted/30 p-8 md:w-72 shrink-0 flex flex-col items-center border-b md:border-b-0 md:border-r border-border/50">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-navy font-display text-2xl font-bold text-navy-foreground mb-4 shadow-elegant">
            {target.initials}
          </div>
          <h2 className="font-display text-xl font-bold tracking-tight text-center leading-tight flex items-center justify-center gap-1.5">
            {target.name || target.firm}
            {target.verified && (
              <span title="Verified"><CheckCircle2 className="h-5 w-5 text-blue-500 fill-blue-500/10 shrink-0" /></span>
            )}
          </h2>
          <p className="text-[9px] text-muted-foreground font-bold mt-1.5 uppercase tracking-widest">{target.sector || target.focus}</p>
          
          <div className="mt-6 w-full space-y-3">
            <div className="rounded-xl bg-background/80 border border-border/40 p-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Stage</div>
                  <div className="font-bold text-[10px]">{target.stage || target.ticket}</div>
                </div>
                <div>
                  <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Match</div>
                  <div className="font-bold text-[10px] text-primary">{target.match}%</div>
                </div>
              </div>
            </div>

            {isInvestor && (
              <div className="flex flex-col items-center p-4 rounded-2xl border border-primary/20 bg-primary/5">
                <button 
                  onClick={runAIAnalysis}
                  disabled={analyzing}
                  className="group relative flex h-20 w-20 items-center justify-center"
                >
                  <div className={`absolute inset-0 rounded-full border-4 ${analyzing ? 'border-primary border-t-transparent animate-spin' : 'border-primary/20'}`} />
                  {analysisResult ? (
                    <div className="flex flex-col items-center animate-fade-in">
                      <span className="text-xl font-bold text-primary">{analysisResult.score}%</span>
                    </div>
                  ) : (
                    <Zap className={`h-5 w-5 ${analyzing ? 'text-primary/40' : 'text-primary'}`} />
                  )}
                </button>
                {analysisResult && (
                  <div className="mt-3 space-y-1 w-full">
                    {analysisResult.details.map((detail, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-[8px] text-muted-foreground font-medium">
                        <CheckCircle2 className="h-2 w-2 text-success shrink-0" />
                        {detail}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right - Form */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="p-8 pb-0 flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight">Institutional Introduction</h2>
              <p className="text-xs text-muted-foreground mt-1">Configure your outreach and schedule your session.</p>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 pt-6">
            <div className="space-y-6">
              {isInvestor ? (
                <>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Representative Name</label>
                      <input 
                        placeholder="Michael Chen"
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})} 
                        className="w-full rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm focus:border-primary focus:bg-background outline-none transition-smooth" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Thesis Focus</label>
                      <input 
                        placeholder="Sustainable Infra"
                        value={formData.domain} 
                        onChange={e => setFormData({...formData, domain: e.target.value})} 
                        className="w-full rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm focus:border-primary focus:bg-background outline-none transition-smooth" 
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Strategic Context</label>
                    <textarea 
                      placeholder="Why request this introduction?"
                      value={formData.reason} 
                      onChange={e => setFormData({...formData, reason: e.target.value})} 
                      rows={3} 
                      className="w-full rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm focus:border-primary focus:bg-background outline-none resize-none transition-smooth" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Session Window (Google Meet)</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input 
                        type="datetime-local"
                        value={formData.appointmentTime} 
                        onChange={e => setFormData({...formData, appointmentTime: e.target.value})} 
                        className="w-full rounded-xl border border-border bg-muted/20 py-3 pl-12 pr-4 text-sm focus:border-primary focus:bg-background outline-none transition-smooth" 
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Venture Name</label>
                      <input value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} placeholder="Company Name" className="w-full rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm focus:border-primary focus:bg-background outline-none transition-smooth" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Current Raise</label>
                      <input value={formData.expected} onChange={e => setFormData({...formData, expected: e.target.value})} placeholder="$2M Seed" className="w-full rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm focus:border-primary focus:bg-background outline-none transition-smooth" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Headquarters Address</label>
                    <input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Operational headquarters" className="w-full rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm focus:border-primary focus:bg-background outline-none transition-smooth" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Intro Brief</label>
                    <textarea value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} rows={3} placeholder="Highlight synergy..." className="w-full rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm focus:border-primary focus:bg-background outline-none transition-smooth resize-none" />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="p-6 border-t border-border bg-card/30 flex items-center justify-end gap-3">
            <button onClick={onClose} className="rounded-xl px-6 py-3 text-xs font-bold text-muted-foreground hover:bg-muted transition-smooth">Discard</button>
            <button 
              onClick={() => {
                if (isInvestor && !formData.appointmentTime) {
                  toast.error("Appointment required");
                  return;
                }
                onSubmit(formData);
              }} 
              className="flex items-center gap-2 rounded-xl bg-gradient-primary px-8 py-3 text-xs font-bold text-primary-foreground transition-all hover:shadow-glow shadow-elegant"
            >
              {isInvestor ? (
                <>Schedule Session <Video className="h-4 w-4" /></>
              ) : isConsulting ? (
                <>Book my consulting <ArrowUpRight className="h-4 w-4" /></>
              ) : (
                <>Send Intro Request <ArrowUpRight className="h-4 w-4" /></>
              )}
            </button>
          </div>
        </div>
      </motion.div>
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
      
      // Filter local reqs to show both sent and received
      const filteredLocal = localReqs.filter(l => l.receiverId === userId || l.senderId === userId);
      
      const mappedLocal = filteredLocal.map(l => ({
        id: l.id,
        created_at: l.date,
        startup_user_id: l.senderId,
        investor_id: l.investorId,
        investor_name: l.investorName || 'Institutional Pool',
        investor_focus: l.investorFocus,
        company_name: l.companyName || l.senderName,
        logo_url: l.logo,
        address: l.address,
        reason: l.reason,
        expected_amount: l.expected,
        status: l.status as any,
        response_reason: l.actionReason || '',
        responded_at: null,
        founder_name: l.founderName,
        details: l.details,
        appointment_time: l.appointmentTime,
      })) as unknown as any[];

      setItems([...mappedLocal, ...remoteReqs]);
      setLoading(false);
    };
    load();

    const handleLocalUpdate = () => load();
    window.addEventListener('reqsUpdated', handleLocalUpdate);

    const channel = supabase
      .channel("intro_requests_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "intro_requests" }, load)
      .subscribe();

    return () => { 
      active = false; 
      supabase.removeChannel(channel); 
      window.removeEventListener('reqsUpdated', handleLocalUpdate);
    };
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
  appointmentTime?: string;
  receiverId?: string;
  senderName?: string;
  senderId?: string;
  founderName?: string;
  details?: string;
};

const getIntroReqs = (): LocalIntroRequest[] => {
  try { return JSON.parse(localStorage.getItem('introReqs') || '[]'); } catch { return []; }
};
const saveIntroReqs = (r: LocalIntroRequest[]) => {
  localStorage.setItem('introReqs', JSON.stringify(r));
  window.dispatchEvent(new Event('reqsUpdated'));
};

const getAddedCompanies = (): Startup[] => {
  const reqs = getIntroReqs();
  return reqs.filter(r => r.investorId === 'self').map(r => ({
    id: r.id,
    name: r.companyName,
    initials: r.companyName.slice(0, 2).toUpperCase(),
    sector: r.investorFocus || 'General',
    stage: 'Seed',
    location: r.address || 'Remote',
    ask: r.expected,
    match: 99
  }));
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
            <div className="text-[10px] font-bold text-primary uppercase tracking-widest mb-0.5">
              {isInvestor ? `From: ${req.company_name || 'Anonymous Startup'}` : `To: ${req.investor_name}`}
            </div>
            <div className="font-display text-lg font-bold">{isInvestor ? req.company_name : `My Listing: ${req.company_name || 'Project Idea'}`}</div>
            <div className="text-xs text-muted-foreground">
              {isInvestor ? "→ Institutional Outreach" : `→ Outreach Target: ${req.investor_name}`}
              {req.address && <> · {req.address}</>}
            </div>
          </div>
        </div>
        <StatusBadge />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Detail label="Expected raise" value={req.expected_amount || 'Not specified'} />
        <Detail label={isInvestor ? "Investor profile" : "Investor"} value={`${req.investor_name}${req.investor_focus ? ` · ${req.investor_focus}` : ""}`} />
      </div>

      <div className="mt-4">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Reason</div>
        <p className="mt-1 text-sm text-foreground/90">{req.reason || 'No specific reason provided for this outreach.'}</p>
      </div>

      {req.details && (
        <div className="mt-4">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">About the Venture</div>
          <p className="mt-1 text-sm text-foreground/80 leading-relaxed">{req.details}</p>
        </div>
      )}

      {req.appointment_time && (
        <div className="mt-4 rounded-xl border border-primary/30 bg-primary/5 p-4 animate-pulse-slow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <div className="text-xs font-bold text-primary uppercase tracking-wider">Investor Meeting Scheduled</div>
            </div>
            <div className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">CONFIRMED</div>
          </div>
          <div className="mt-2 text-sm font-bold text-foreground">
            {new Date(req.appointment_time).toLocaleString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric', 
              hour: 'numeric', 
              minute: '2-digit' 
            })}
          </div>
          <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
            <Video className="h-3 w-3" /> Google Meet link sent to your email
          </div>
        </div>
      )}

      {req.founder_name && (
        <div className="mt-4 flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="h-3 w-3 text-primary" />
          </div>
          <span className="text-xs font-medium text-muted-foreground">Founder: <span className="text-foreground">{req.founder_name}</span></span>
        </div>
      )}

      {req.response_reason && (
        <div className={`mt-5 rounded-xl p-4 ${req.status === "accepted" ? "bg-success/10 border border-success/20" : "bg-destructive/10 border border-destructive/20"}`}>
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
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div 
        initial={{ x: "100%" }} 
        animate={{ x: 0 }} 
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl h-full bg-background shadow-2xl flex flex-col border-l border-border"
      >
        <div className="bg-gradient-primary p-8 text-primary-foreground relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-white/10 blur-2xl" />
          <h2 className="font-display text-2xl font-bold tracking-tight">Register Your Company</h2>
          <p className="mt-1 text-xs opacity-90 max-w-sm leading-relaxed">Connect your venture with global capital partners.</p>
          <button onClick={onClose} className="absolute right-6 top-6 rounded-full bg-white/10 p-1.5 text-white hover:bg-white/20 transition-smooth">
            <XCircle className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Company Name</label>
                <input value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} placeholder="e.g. Acme Corp" className="w-full rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm focus:border-primary focus:bg-background outline-none transition-smooth" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Founder Name</label>
                <input value={formData.founderName} onChange={e => setFormData({...formData, founderName: e.target.value})} placeholder="e.g. John Doe" className="w-full rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm focus:border-primary focus:bg-background outline-none transition-smooth" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Core Mission & Product</label>
              <textarea value={formData.details} onChange={e => setFormData({...formData, details: e.target.value})} rows={2} placeholder="Briefly describe the problem you are solving..." className="w-full rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm focus:border-primary focus:bg-background outline-none transition-smooth resize-none" />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Investment Thesis / Why Ventura?</label>
              <textarea value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} rows={3} placeholder="What is your current fundraising goal?" className="w-full rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm focus:border-primary focus:bg-background outline-none transition-smooth resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Target Allocation</label>
                <input value={formData.expected} onChange={e => setFormData({...formData, expected: e.target.value})} placeholder="e.g. $500k" className="w-full rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm focus:border-primary focus:bg-background outline-none transition-smooth" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Digital Identity (Logo URL)</label>
                <input value={formData.logo} onChange={e => setFormData({...formData, logo: e.target.value})} placeholder="https://..." className="w-full rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm focus:border-primary focus:bg-background outline-none transition-smooth" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-border bg-card/30 flex items-center gap-4">
          <button onClick={onClose} className="flex-1 rounded-2xl border border-border py-3.5 text-sm font-bold text-muted-foreground hover:bg-muted transition-smooth">Cancel</button>
          <button onClick={() => onSubmit(formData)} className="flex-[2] rounded-2xl bg-gradient-primary py-3.5 text-sm font-bold text-primary-foreground shadow-elegant hover:shadow-glow transition-smooth">
            Register Venture
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function InvestorProfileModal({ investor, onClose, onRequestIntro }: { investor: any; onClose: () => void; onRequestIntro: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div 
        initial={{ x: "100%" }} 
        animate={{ x: 0 }} 
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl h-full bg-background shadow-2xl flex flex-col border-l border-border"
      >
        <div className="relative h-32 bg-gradient-navy shrink-0">
          <button onClick={onClose} className="absolute right-4 top-4 z-20 rounded-full bg-black/20 p-1.5 text-white transition-smooth hover:bg-black/40">
            <XCircle className="h-5 w-5" />
          </button>
          <div className="absolute -bottom-6 left-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-card border-4 border-background shadow-elegant z-10">
            <div className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-navy font-display text-xl font-bold text-white">
              {investor.initials}
            </div>
          </div>
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        </div>

        <div className="flex-1 overflow-y-auto mt-8 px-8 pb-6 pt-2">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight flex items-center gap-2">
                {investor.firm}
                {investor.verified && (
                  <span title="Verified Investor"><CheckCircle2 className="h-5 w-5 text-blue-500 fill-blue-500/10 shrink-0" /></span>
                )}
              </h2>
              <div className={`mt-1 flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-widest ${investor.verified ? 'text-primary' : 'text-muted-foreground'}`}>
                {investor.verified ? <ShieldCheck className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
                {investor.verified ? 'Institutional Partner' : 'Applicant Node'}
              </div>
            </div>
            <div className="flex flex-col items-end">
              <TrustScore score={investor.trustScore} label="Trust Index" />
              {investor.verified ? (
                <div className="mt-1.5 text-[9px] font-bold text-success uppercase tracking-[0.2em] bg-success/10 px-2.5 py-0.5 rounded-full border border-success/20">Audit Verified</div>
              ) : (
                <div className="mt-1.5 text-[9px] font-bold text-amber-500 uppercase tracking-[0.2em] bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">Pending Audit</div>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="space-y-4">
              <div className="rounded-2xl bg-muted/30 p-4 border border-border/50 shadow-sm">
                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Partner Credentials</div>
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-border/40 pb-1.5">
                    <span className="text-[11px] text-muted-foreground">Entity Type</span>
                    <span className="text-[11px] font-bold">{investor.type}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/40 pb-1.5">
                    <span className="text-[11px] text-muted-foreground">Experience</span>
                    <span className="text-[11px] font-bold">{investor.experience}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[11px] text-muted-foreground">Typical Ticket</span>
                    <span className="text-[11px] font-bold text-primary">{investor.ticket}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-primary/5 p-4 border border-primary/10 shadow-sm">
                <div className="text-[9px] font-bold text-primary uppercase tracking-widest mb-3">Strategic Focus</div>
                <div className="flex flex-wrap gap-1.5">
                  {investor.focus.split(' · ').map((f: string) => (
                    <span key={f} className="rounded-full bg-white px-2.5 py-0.5 text-[9px] font-bold text-primary border border-primary/10 shadow-sm">{f}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Thesis Overview</div>
                <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                  "{investor.bio}"
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Verification Status</div>
                <div className="space-y-2.5">
                  {[
                    { label: "Identity & PAN Audit" },
                    { label: "Professional Background" },
                    { label: "Institutional Status" }
                  ].map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-[10px] font-medium text-muted-foreground">{s.label}</span>
                      {investor.verified ? (
                        <div className="flex items-center gap-1 text-success font-bold text-[9px] uppercase tracking-wider">
                          Verified <CheckCircle2 className="h-3 w-3" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-amber-500 font-bold text-[9px] uppercase tracking-wider">
                          Pending <Clock className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-border bg-card/30 flex gap-3 shrink-0">
          <button 
            onClick={onRequestIntro}
            className="flex-1 rounded-2xl bg-gradient-primary py-3 text-xs font-bold text-primary-foreground shadow-elegant hover:shadow-glow transition-all active:scale-95"
          >
            Request Institutional Introduction
          </button>
          <button 
            onClick={onClose}
            className="rounded-2xl border border-border px-6 py-3 text-xs font-bold text-muted-foreground transition-smooth hover:bg-muted"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function StartupProfileModal({ startup, onClose, onCollaborate }: { startup: any; onClose: () => void; onCollaborate: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div 
        initial={{ x: "100%" }} 
        animate={{ x: 0 }} 
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl h-full bg-background shadow-2xl flex flex-col md:flex-row border-l border-border"
      >
        {/* Left - Brand Side */}
        <div className="md:w-64 bg-gradient-navy p-6 md:p-8 flex flex-col items-center justify-center text-center shrink-0">
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white/10 text-white font-display text-3xl font-bold shadow-elegant mb-4 ring-1 ring-white/20">
            {startup.initials}
          </div>
          <h3 className="text-white font-display text-2xl font-bold mb-2 tracking-tight flex items-center justify-center gap-1.5">
            {startup.name}
            {startup.verified && (
              <span title="Verified Startup"><CheckCircle2 className="h-5 w-5 text-blue-500 fill-blue-500/10 shrink-0" /></span>
            )}
          </h3>
          <p className="text-white/60 text-[10px] mb-6 leading-relaxed font-medium uppercase tracking-widest">Growth Phase Intelligence</p>
          
          <button 
            onClick={onCollaborate}
            className="w-full rounded-2xl bg-white px-6 py-3 text-xs font-bold text-navy transition-all hover:scale-105 active:scale-95 shadow-glow shadow-white/20"
          >
            Collaborate Now
          </button>
          <button 
            onClick={onClose}
            className="mt-4 text-[10px] font-bold text-white/40 hover:text-white/80 transition-smooth uppercase tracking-widest"
          >
            Close Profile
          </button>
        </div>

        {/* Right - Deep Intelligence */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight mb-1.5">Venture Intelligence</h2>
              <div className={`flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-[0.2em] ${startup.verified ? 'text-success' : 'text-amber-500'}`}>
                {startup.verified ? <ShieldCheck className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                {startup.verified ? 'Strategic Partner Node' : 'Verification Pending'}
              </div>
            </div>
            <div className="flex flex-col items-end">
              <TrustScore score={startup.match} label="Growth Index" />
              {startup.verified ? (
                <div className="mt-1.5 text-[9px] font-bold text-primary uppercase tracking-widest bg-primary/5 px-2.5 py-0.5 rounded-full border border-primary/20">High Potential</div>
              ) : (
                <div className="mt-1.5 text-[9px] font-bold text-amber-500 uppercase tracking-widest bg-amber-500/5 px-2.5 py-0.5 rounded-full border border-amber-500/20">Pending Assessment</div>
              )}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-4">
              <div className="rounded-2xl bg-muted/30 p-5 border border-border/50 shadow-sm">
                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-3 border-b border-border/40 pb-1.5">Institutional Hub</div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Headquarters</div>
                    <div className="text-xs font-bold leading-relaxed">
                      {startup.address || startup.location}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-primary/5 p-5 border border-primary/10 shadow-sm">
                <div className="text-[9px] font-bold text-primary uppercase tracking-widest mb-3 border-b border-primary/20 pb-1.5">Operational Sector</div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-primary uppercase tracking-widest mb-0.5">Market Vertical</div>
                    <div className="text-xs font-bold">{startup.domain || startup.sector}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-3 border-b border-border/40 pb-1.5">Market Traction</div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center text-success shrink-0">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Experience</div>
                    <div className="text-sm font-bold text-foreground">{startup.experience || '2+ Years'}</div>
                  </div>
                </div>
                <div className="mt-3 text-[10px] text-muted-foreground font-medium italic">
                  {startup.verified ? 'Verified institutional track record with consistent growth.' : 'Pending institutional audit verification.'}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-3 border-b border-border/40 pb-1.5">Raise Intelligence</div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-medium uppercase tracking-widest text-[10px]">Active Ask</span>
                    <span className="font-bold text-primary text-base">{startup.ask}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-medium uppercase tracking-widest text-[10px]">Current Stage</span>
                    <span className="font-bold bg-muted px-2.5 py-0.5 rounded-lg border border-border/50 text-[10px]">{startup.stage}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-navy p-6 text-navy-foreground flex items-center justify-between shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-white/5 blur-2xl" />
            <div className="max-w-md relative z-10">
              <div className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-50 mb-2">Strategic Status</div>
              <div className="text-xs font-medium leading-relaxed">This venture is currently open for strategic collaborations and institutional partnerships.</div>
            </div>
            <button 
              onClick={onCollaborate}
              className="relative z-10 rounded-xl bg-white/10 px-5 py-2.5 text-xs font-bold backdrop-blur-xl border border-white/20 transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
            >
              Express Interest
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ============ KANBAN PIPELINE ============

const PIPELINE_STAGES = [
  { id: 'started', label: 'Started', color: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-600' },
  { id: 'discussion', label: 'Discussion', color: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-600' },
  { id: 'due_diligence', label: 'Due Diligence', color: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-600' },
  { id: 'invested', label: 'Invested', color: 'bg-green-500', light: 'bg-green-50', text: 'text-green-600' },
  { id: 'active', label: 'Active', color: 'bg-teal-500', light: 'bg-teal-50', text: 'text-teal-600' },
  { id: 'finished', label: 'Finished', color: 'bg-gray-500', light: 'bg-gray-50', text: 'text-gray-600' },
];

const INITIAL_PIPELINE_DATA: any = {
  started: [
    { id: 'd1', name: 'Helix Bio', founder: 'Sarah Chen', industry: 'Healthtech', amount: '$2M', priority: 'High', date: '2024-05-10', avatar: 'SC' },
    { id: 'd2', name: 'Quanta SaaS', founder: 'Alex Rivers', industry: 'B2B SaaS', amount: '$1.5M', priority: 'Medium', date: '2024-05-12', avatar: 'AR' },
  ],
  discussion: [
    { id: 'd3', name: 'LedgerLoop', founder: 'Marcus Bell', industry: 'Fintech', amount: '$4.5M', priority: 'High', date: '2024-05-08', avatar: 'MB' },
  ],
  due_diligence: [],
  invested: [
    { id: 'd4', name: 'Atlas Grid', founder: 'Elena Rodriguez', industry: 'Energy', amount: '$8M', priority: 'Critical', date: '2024-04-20', avatar: 'ER' },
  ],
  active: [],
  finished: [],
};

function PipelineBoard({ search }: { search: string }) {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('investorPipeline');
    return saved ? JSON.parse(saved) : INITIAL_PIPELINE_DATA;
  });
  
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pendingMove, setPendingMove] = useState<any>(null);


  useEffect(() => {
    localStorage.setItem('investorPipeline', JSON.stringify(data));
  }, [data]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const findColumn = useCallback((id: string) => {
    if (id in data) return id;
    return Object.keys(data).find(key => data[key].some((item: any) => item.id === id));
  }, [data]);

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = useCallback((event: any) => {
    const { active, over } = event;
    const overId = over?.id;

    if (!overId) return;

    const activeColumn = findColumn(active.id);
    const overColumn = findColumn(overId);

    if (!activeColumn || !overColumn || activeColumn === overColumn) return;

    setData((prev: any) => {
      const activeItems = prev[activeColumn];
      const overItems = prev[overColumn];

      const activeIndex = activeItems.findIndex((i: any) => i.id === active.id);
      const overIndex = overItems.findIndex((i: any) => i.id === overId);

      let newIndex;
      if (overId in prev) {
        newIndex = overItems.length;
      } else {
        const isBelowLastItem = over && overIndex === overItems.length - 1;
        const modifier = isBelowLastItem ? 1 : 0;
        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length;
      }

      return {
        ...prev,
        [activeColumn]: activeItems.filter((i: any) => i.id !== active.id),
        [overColumn]: [
          ...overItems.slice(0, newIndex),
          activeItems[activeIndex],
          ...overItems.slice(newIndex)
        ]
      };
    });
  }, [findColumn]);

  const handleDragEnd = useCallback((event: any) => {
    const { active, over } = event;
    const overId = over?.id;

    if (!overId) {
      setActiveId(null);
      return;
    }

    const activeColumn = findColumn(active.id);
    const overColumn = findColumn(overId);

    if (activeColumn && overColumn && activeColumn !== overColumn) {
      // The item has already been moved to overColumn by handleDragOver
      const item = data[overColumn].find((i: any) => i.id === active.id);
      if (item) {
        setPendingMove({ item, from: activeColumn, to: overColumn });
      }
    }

    setActiveId(null);
  }, [data, findColumn]);

  const activeItem = activeId ? (Object.values(data).flat() as any[]).find((i: any) => i.id === activeId) : null;

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col animate-fade-in overflow-hidden">
      <div className="mb-4 flex items-center justify-between shrink-0">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">Deal Pipeline</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your active investment lifecycle and due diligence.</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-smooth hover:border-primary/40 hover:text-foreground">
          <Filter className="h-3.5 w-3.5" /> Filters
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-6 gap-3 h-full pb-2">
            {PIPELINE_STAGES.map((stage, idx) => (
              <DroppableColumn 
                key={stage.id}
                id={stage.id}
                stage={stage}
                items={data[stage.id] || []}
                idx={idx}
              />
            ))}
          </div>

          <DragOverlay>
            {activeId ? (
              <div className="opacity-100 scale-105 shadow-2xl rounded-sm border border-gray-200 bg-white p-3 w-full max-w-[180px]">
                <div className="text-xs font-medium text-[#172B4D]">{activeItem?.name}</div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <AnimatePresence>
        {pendingMove && (
          <MoveStatusModal 
            move={pendingMove} 
            onClose={() => setPendingMove(null)} 
            onConfirm={(notes: any) => {
              toast.success(`Deal stage updated to ${PIPELINE_STAGES.find(s => s.id === pendingMove.to)?.label}`);
              setPendingMove(null);
            }} 
          />
        )}

      </AnimatePresence>
    </div>
  );
}

function DroppableColumn({ id, stage, items, idx }: { id: string; stage: any; items: any[]; idx: number }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <SortableContext
      id={id}
      items={items.map(i => i.id)}
      strategy={verticalListSortingStrategy}
    >
      <div 
        ref={setNodeRef}
        className={`flex flex-col bg-[#F4F5F7] rounded-sm p-2 min-w-0 h-full border-t-2 transition-all ${isOver ? 'bg-gray-200 ring-2 ring-primary/20' : ''}`} 
        style={{ borderTopColor: stage.id === 'started' ? '#4C9AFF' : stage.id === 'discussion' ? '#FFAB00' : stage.id === 'due_diligence' ? '#6554C0' : stage.id === 'invested' ? '#36B37E' : stage.id === 'active' ? '#00B8D9' : '#5E6C84' }}
      >
        <div className="flex items-center gap-2 mb-3 px-1 pointer-events-none">
          <h3 className="font-bold text-[10px] text-[#5E6C84] uppercase tracking-wider truncate">{stage.label}</h3>
          <span className="text-[10px] font-bold text-[#5E6C84]">
            {items.length}
          </span>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto pr-1 scrollbar-hide min-h-0">
          {items.map((item: any, iIdx: number) => (
            <KanbanCard key={item.id} item={item} index={iIdx} stageIdx={idx} />
          ))}
          {items.length === 0 && (
            <div className="h-20 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-400 text-[9px] uppercase font-bold tracking-widest bg-white/50">
              Empty
            </div>
          )}
        </div>
        

      </div>
    </SortableContext>
  );
}

function KanbanCard({ item, index, stageIdx }: { item: any; index: number; stageIdx: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const key = `VNT-${100 + (stageIdx * 10) + index}`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group relative overflow-hidden rounded-md border border-gray-200 bg-white p-3 shadow-sm transition-all cursor-grab active:cursor-grabbing hover:bg-gray-50 ${isDragging ? 'opacity-30' : ''}`}
    >
      <div className="mb-4">
        <h4 className="text-[13px] font-medium text-[#172B4D] leading-tight group-hover:text-primary transition-colors">
          {item.name}
        </h4>
        <p className="text-[10px] text-[#5E6C84] mt-1">{item.industry}</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="flex h-4 w-4 items-center justify-center rounded-sm bg-[#4C9AFF] text-white">
            <Check className="h-3 w-3" />
          </div>
          <span className="text-[10px] font-bold text-[#5E6C84] uppercase">{key}</span>
        </div>
        
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white">
          {item.avatar || 'T'}
        </div>
      </div>
    </div>
  );
}

function MoveStatusModal({ move, onClose, onConfirm }: { move: any; onClose: () => void; onConfirm: (notes: any) => void }) {
  const stage = PIPELINE_STAGES.find(s => s.id === move.to);
  
  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div 
        initial={{ x: "100%" }} 
        animate={{ x: 0 }} 
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg h-full bg-background shadow-2xl flex flex-col border-l border-border"
      >
        <div className={`p-8 ${stage?.color} text-white relative overflow-hidden shrink-0`}>
          <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-white/10 blur-2xl" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/20">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold tracking-tight">Stage Update</h2>
              <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mt-0.5">Target: {stage?.label}</p>
            </div>
          </div>
          <button onClick={onClose} className="absolute right-6 top-6 rounded-full bg-white/10 p-1.5 text-white hover:bg-white/20 transition-smooth">
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="mb-6 p-4 rounded-xl bg-muted/30 border border-border/40">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Active Deal</div>
            <div className="font-bold text-base">{move.item.name}</div>
            <div className="text-[11px] text-muted-foreground mt-1">Moving from <span className="font-semibold text-foreground">{PIPELINE_STAGES.find(s => s.id === move.from)?.label}</span> to <span className="font-semibold text-foreground">{stage?.label}</span></div>
          </div>

          <div className="space-y-6">
            {move.to === 'discussion' && (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Meeting Window</label>
                  <input type="datetime-local" className="w-full rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm focus:border-primary focus:bg-background outline-none transition-smooth" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Meeting Agenda / Thesis</label>
                  <textarea placeholder="Key reasons for interest..." className="w-full rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm h-28 focus:border-primary focus:bg-background outline-none resize-none transition-smooth" />
                </div>
              </>
            )}

            {move.to === 'due_diligence' && (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Audit Checklist</label>
                  <div className="grid grid-cols-1 gap-1.5">
                    {['Cap Table Audit', 'Financial Verification', 'Tech Stack Review', 'Legal Compliance'].map(doc => (
                      <div key={doc} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/20 border border-border/40 group hover:border-primary/30 transition-smooth cursor-pointer">
                        <div className="h-3.5 w-3.5 rounded border border-border group-hover:border-primary transition-smooth" />
                        <span className="text-[10px] font-bold text-muted-foreground group-hover:text-foreground">{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Lead Institutional Analyst</label>
                  <select className="w-full rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm focus:border-primary focus:bg-background outline-none transition-smooth appearance-none">
                    <option>Principal Partner</option>
                    <option>Senior Investment Analyst</option>
                    <option>Legal Counsel</option>
                  </select>
                </div>
              </>
            )}

            {move.to === 'invested' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Final Commit</label>
                    <input placeholder="$250,000" className="w-full rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm focus:border-primary focus:bg-background outline-none transition-smooth" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Post-Money %</label>
                    <input placeholder="8.5%" className="w-full rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm focus:border-primary focus:bg-background outline-none transition-smooth" />
                  </div>
                </div>
                <div className="rounded-xl border-2 border-dashed border-primary/20 bg-primary/5 p-6 text-center cursor-pointer hover:bg-primary/10 transition-all group">
                  <Upload className="h-6 w-6 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] font-bold text-primary uppercase tracking-widest">Upload Term Sheet</span>
                </div>
              </>
            )}

            {(move.to === 'started' || move.to === 'active' || move.to === 'finished') && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Institutional Notes</label>
                <textarea placeholder="Record internal context..." className="w-full rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm h-36 focus:border-primary focus:bg-background outline-none resize-none transition-smooth" />
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-border bg-card/30 flex items-center gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl border border-border py-3 text-xs font-bold text-muted-foreground hover:bg-muted transition-smooth">Cancel</button>
          <button onClick={onConfirm} className={`flex-[2] rounded-xl py-3 text-xs font-bold text-white shadow-elegant hover:shadow-glow transition-all active:scale-95 ${stage?.color}`}>
            Confirm Update
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function CreateDealModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    name: '',
    founder: '',
    industry: 'Fintech',
    amount: '',
    priority: 'Medium',
    description: ''
  });

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div 
        initial={{ x: "100%" }} 
        animate={{ x: 0 }} 
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl h-full bg-background shadow-2xl flex flex-col border-l border-border"
      >
        <div className="bg-gradient-navy p-8 text-white relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-white/10 blur-2xl" />
          <h2 className="font-display text-2xl font-bold tracking-tight">Create New Deal</h2>
          <p className="mt-1 text-xs text-white/70">Initialize a new venture entry in your pipeline.</p>
          <button onClick={onClose} className="absolute right-6 top-6 rounded-full bg-white/10 p-1.5 text-white hover:bg-white/20 transition-smooth">
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Startup Identity</label>
                  <input 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Helix Bio" className="w-full rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm focus:border-primary outline-none transition-all focus:bg-background" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Founder Representative</label>
                  <input 
                    value={formData.founder} onChange={e => setFormData({...formData, founder: e.target.value})}
                    placeholder="Full Name" className="w-full rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm focus:border-primary outline-none transition-all focus:bg-background" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sector</label>
                    <select 
                      value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})}
                      className="w-full rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm focus:border-primary outline-none appearance-none"
                    >
                      <option>Fintech</option>
                      <option>Healthtech</option>
                      <option>AI / ML</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Priority</label>
                    <select 
                      value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}
                      className="w-full rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm focus:border-primary outline-none appearance-none"
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Funding Target</label>
                  <input 
                    value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})}
                    placeholder="$500K - $1M" className="w-full rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm focus:border-primary outline-none transition-all focus:bg-background" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Thesis / Brief</label>
                  <textarea 
                    value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Summary of the opportunity..." className="w-full rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm h-[100px] focus:border-primary outline-none resize-none transition-all focus:bg-background" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-border bg-card/30 flex items-center gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl border border-border py-3.5 text-xs font-bold text-muted-foreground transition-smooth hover:bg-muted">
            Discard
          </button>
          <button 
            disabled={!formData.name}
            onClick={() => onSubmit(formData)} 
            className="flex-[2] rounded-xl bg-gradient-navy py-3.5 text-xs font-bold text-white shadow-elegant hover:shadow-glow transition-smooth disabled:opacity-50"
          >
            Launch Deal Entry
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function StartupsMarketplace({ search, savedIds, onToggleSave, onRequestIntro, onViewProfile }: { search: string; savedIds: Set<string>; onToggleSave: (id: string) => void; onRequestIntro: (s: Startup) => void; onViewProfile?: (s: Startup) => void }) {
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
          <StartupCard 
            key={s.id} 
            s={{...s, onViewProfile: () => onViewProfile?.(s)}} 
            saved={savedIds.has(s.id)} 
            onSave={() => onToggleSave(s.id)} 
            alwaysShowIntelligence={true}
          />
        ))}
      </div>
    </div>
  );
}
