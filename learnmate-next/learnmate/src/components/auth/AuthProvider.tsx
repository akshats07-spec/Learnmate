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
        const streak = data.user.streak_days || 1;
        const minutes = data.user.study_minutes || 0;
        const u = {
          id: data.user.id,
          email: data.user.email,
          user_metadata: {
            display_name: data.user.name,
            streak_days: streak,
            study_minutes: minutes,
          },
          app_metadata: {},
          aud: "authenticated",
          created_at: new Date().toISOString(),
        } as unknown as User;
        localStorage.setItem("learnmate_user", JSON.stringify(u));
        const userKey = `learnmate_user_stats_${data.user.email.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
        localStorage.setItem(userKey, JSON.stringify({
          streakDays: streak,
          totalStudyMinutes: minutes,
          lastActiveDate: new Date().toDateString(),
        }));
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
      user_metadata: {
        display_name: email.split("@")[0],
        streak_days: 1,
        study_minutes: 0,
      },
      app_metadata: {},
      aud: "authenticated",
      created_at: new Date().toISOString(),
    } as unknown as User;
    localStorage.setItem("learnmate_user", JSON.stringify(demoUser));
    const userKey = `learnmate_user_stats_${email.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
    localStorage.setItem(userKey, JSON.stringify({
      streakDays: 1,
      totalStudyMinutes: 0,
      lastActiveDate: new Date().toDateString(),
    }));
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
        // A brand new user ALWAYS starts at 1 Day streak and 0 study minutes
        const u = {
          id: data.user.id,
          email: data.user.email,
          user_metadata: {
            display_name: data.user.name,
            streak_days: 1,
            study_minutes: 0,
          },
          app_metadata: {},
          aud: "authenticated",
          created_at: new Date().toISOString(),
        } as unknown as User;
        localStorage.setItem("learnmate_user", JSON.stringify(u));
        const userKey = `learnmate_user_stats_${data.user.email.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
        // Explicitly set 1 Day streak for newly registered user
        localStorage.setItem(userKey, JSON.stringify({
          streakDays: 1,
          totalStudyMinutes: 0,
          lastActiveDate: new Date().toDateString(),
        }));
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
        options: { data: { display_name: name, streak_days: 1, study_minutes: 0 } },
      });
      return { error: error?.message ?? null };
    }

    // Local fallback for new user
    const demoUser = {
      id: `usr-${Date.now()}`,
      email,
      user_metadata: {
        display_name: name || email.split("@")[0],
        streak_days: 1,
        study_minutes: 0,
      },
      app_metadata: {},
      aud: "authenticated",
      created_at: new Date().toISOString(),
    } as unknown as User;
    localStorage.setItem("learnmate_user", JSON.stringify(demoUser));
    const userKey = `learnmate_user_stats_${email.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
    localStorage.setItem(userKey, JSON.stringify({
      streakDays: 1,
      totalStudyMinutes: 0,
      lastActiveDate: new Date().toDateString(),
    }));
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
    if (!supabase) {
      // Demo fallback
      const demoUser = {
        id: `usr-google-${Date.now()}`,
        email: "student@google.com",
        user_metadata: { display_name: "Google Student", streak_days: 1, study_minutes: 0 },
        app_metadata: {},
        aud: "authenticated",
        created_at: new Date().toISOString(),
      } as unknown as User;
      localStorage.setItem("learnmate_user", JSON.stringify(demoUser));
      setUser(demoUser);
      return { error: null };
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    return { error: error?.message ?? null };
  }, [supabase]);

  const resetPassword = useCallback(async (email: string) => {
    if (!supabase) {
      return { error: null };
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error?.message ?? null };
  }, [supabase]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        signInWithGoogle,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
