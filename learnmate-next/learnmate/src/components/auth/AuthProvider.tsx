"use client";
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getBrowserSupabase, hasSupabase } from "@/lib/supabase";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = getBrowserSupabase();

  useEffect(() => {
    try {
      const saved = localStorage.getItem("learnmate_user") || localStorage.getItem("learnmate_demo_user");
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Could not read stored user:", e);
    }

    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  const signIn = useCallback(async (email: string, password: string) => {
    // 1. Try real Python SQLite Backend first
    try {
      const res = await fetch("/api/py/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        const u = {
          id: data.user.id,
          email: data.user.email,
          user_metadata: { display_name: data.user.name },
          app_metadata: {},
          aud: "authenticated",
          created_at: new Date().toISOString(),
        } as unknown as User;
        localStorage.setItem("learnmate_user", JSON.stringify(u));
        setUser(u);
        return { error: null };
      }
      if (!res.ok && data.detail) {
        return { error: data.detail };
      }
    } catch {
      // Backend not reached, fallback to Supabase if configured or local demo
    }

    if (supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error?.message ?? null };
    }

    // Local fallback
    const demoUser = {
      id: `usr-${Date.now()}`,
      email,
      user_metadata: { display_name: email.split("@")[0] },
      app_metadata: {},
      aud: "authenticated",
      created_at: new Date().toISOString(),
    } as unknown as User;
    localStorage.setItem("learnmate_user", JSON.stringify(demoUser));
    setUser(demoUser);
    return { error: null };
  }, [supabase]);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    // 1. Try real Python SQLite Backend first
    try {
      const res = await fetch("/api/py/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        const u = {
          id: data.user.id,
          email: data.user.email,
          user_metadata: { display_name: data.user.name },
          app_metadata: {},
          aud: "authenticated",
          created_at: new Date().toISOString(),
        } as unknown as User;
        localStorage.setItem("learnmate_user", JSON.stringify(u));
        setUser(u);
        return { error: null };
      }
      if (!res.ok && data.detail) {
        return { error: data.detail };
      }
    } catch {
      // Backend not reached, fallback to Supabase or local
    }

    if (supabase) {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { display_name: name } },
      });
      return { error: error?.message ?? null };
    }

    const demoUser = {
      id: `usr-${Date.now()}`,
      email,
      user_metadata: { display_name: name || email.split("@")[0] },
      app_metadata: {},
      aud: "authenticated",
      created_at: new Date().toISOString(),
    } as unknown as User;
    localStorage.setItem("learnmate_user", JSON.stringify(demoUser));
    setUser(demoUser);
    return { error: null };
  }, [supabase]);

  const signOut = useCallback(async () => {
    try {
      localStorage.removeItem("learnmate_user");
      localStorage.removeItem("learnmate_demo_user");
    } catch {}
    setUser(null);
    setSession(null);
    if (!supabase) return;
    await supabase.auth.signOut();
  }, [supabase]);

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) return { error: "Supabase not configured." };
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    return { error: error?.message ?? null };
  }, [supabase]);

  const resetPassword = useCallback(async (email: string) => {
    if (!supabase) return { error: "Supabase not configured." };
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    });
    return { error: error?.message ?? null };
  }, [supabase]);

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut, signInWithGoogle, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export { hasSupabase };
