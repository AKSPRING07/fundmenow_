import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = "startup" | "investor";

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string | null;
  company_name: string | null;
  avatar_url: string | null;
  bio: string | null;
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        // defer to avoid deadlocks
        setTimeout(() => loadProfile(sess.user.id), 0);
      } else {
        setProfile(null);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        loadProfile(data.session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  async function loadProfile(uid: string) {
    const activeRole = localStorage.getItem("ventura_active_role");
    
    // Fetch all profiles for this user
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", uid);
      
    if (data && data.length > 0) {
      // Find the one matching the active role, or fallback to the first one
      const matched = data.find(p => p.role === activeRole) || data[0];
      setProfile(matched as Profile);
    }
  }

  async function signOut() {
    localStorage.removeItem("ventura_active_role");
    await supabase.auth.signOut();
  }

  return { session, user, profile, loading, signOut };
}
