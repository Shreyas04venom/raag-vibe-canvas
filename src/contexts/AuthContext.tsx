import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { supabase, supabaseAuth } from '@/integrations/supabase/app-client';
import type { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  premium: boolean;
}

interface AuthCtx {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (patch: Partial<Profile>) => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const profileLoadId = useRef(0);
  const refreshTimer = useRef<number | null>(null);

  useEffect(() => {
    let active = true;

    const clearRefreshTimer = () => {
      if (refreshTimer.current != null) {
        window.clearTimeout(refreshTimer.current);
        refreshTimer.current = null;
      }
    };

    const scheduleRefresh = (s: Session | null) => {
      clearRefreshTimer();
      if (!s?.refresh_token) return;

      const expiresInSeconds = typeof s.expires_in === 'number' && s.expires_in > 0
        ? s.expires_in
        : 3600;
      const refreshInMs = Math.max(60_000, (expiresInSeconds - 300) * 1000);

      refreshTimer.current = window.setTimeout(async () => {
        supabaseAuth.auth.stopAutoRefresh();
        const { data, error } = await supabaseAuth.auth.refreshSession();
        supabaseAuth.auth.stopAutoRefresh();

        if (!active) return;
        if (error) {
          scheduleRefresh(s);
          return;
        }
        applySession(data.session ?? s);
      }, refreshInMs);
    };

    const applySession = (s: Session | null) => {
      if (!active) return;
      scheduleRefresh(s);
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
      if (s?.user) setTimeout(() => loadProfile(s.user.id), 0);
      else setProfile(null);
    };

    supabaseAuth.auth.stopAutoRefresh();

    const { data: sub } = supabaseAuth.auth.onAuthStateChange((_event, s) => {
      supabaseAuth.auth.stopAutoRefresh();
      applySession(s);
    });

    supabaseAuth.auth.getSession().then(({ data }) => {
      supabaseAuth.auth.stopAutoRefresh();
      applySession(data.session);
    }).catch(() => applySession(null));

    return () => {
      active = false;
      clearRefreshTimer();
      sub.subscription.unsubscribe();
    };
  }, []);

  async function loadProfile(uid: string) {
    const requestId = ++profileLoadId.current;
    const { data } = await supabase.from('profiles').select('id,display_name,avatar_url,bio,premium').eq('id', uid).maybeSingle();
    if (requestId === profileLoadId.current) setProfile((data ?? null) as Profile | null);
  }

  async function signUp(email: string, password: string, displayName: string) {
    supabaseAuth.auth.stopAutoRefresh();
    const { data, error } = await supabaseAuth.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/home`, data: { display_name: displayName } },
    });
    if (error) return { error: error.message };
    supabaseAuth.auth.stopAutoRefresh();
    if (data.session) {
      setSession(data.session);
      setUser(data.session.user);
      await loadProfile(data.session.user.id);
    }
    toast.success('Welcome to RaagWeather!');
    return {};
  }
  async function signIn(email: string, password: string) {
    supabaseAuth.auth.stopAutoRefresh();
    const { data, error } = await supabaseAuth.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    supabaseAuth.auth.stopAutoRefresh();
    setSession(data.session);
    setUser(data.user);
    await loadProfile(data.user.id);
    toast.success('Welcome back!');
    return {};
  }
  async function signOut() {
    await supabaseAuth.auth.signOut();
    toast.success('Signed out');
  }
  async function updateProfile(patch: Partial<Profile>) {
    if (!user) return;
    const { error } = await supabase.from('profiles').update(patch as any).eq('id', user.id);
    if (error) { toast.error(error.message); return; }
    setProfile((p) => (p ? { ...p, ...patch } : p));
    toast.success('Profile updated');
  }

  return (
    <Ctx.Provider value={{ user, session, profile, loading, signUp, signIn, signOut, updateProfile }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAuth outside provider');
  return c;
};
