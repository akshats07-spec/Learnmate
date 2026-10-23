"use client";

export interface QuizAttempt {
  id: string;
  materialTitle: string;
  score: number;
  total: number;
  pct: number;
  date: string;
  weakTopics: string[];
}

export interface UserStats {
  streakDays: number;
  totalStudyMinutes: number;
  topicsDiscovered: number;
  overallMastery: number;
  quizAttempts: QuizAttempt[];
  materialsCount: number;
  activeMaterialTitle: string;
  activeMaterialId: string;
}

export function resolveActiveEmail(explicitEmail?: string): string {
  if (explicitEmail && explicitEmail.trim()) {
    return explicitEmail.toLowerCase().trim();
  }

  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("learnmate_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.email) return parsed.email.toLowerCase().trim();
      }
    } catch {}
  }

  return "guest_user";
}

export function getUserStats(userEmail?: string): UserStats {
  if (typeof window === "undefined") {
    return {
      streakDays: 1,
      totalStudyMinutes: 0,
      topicsDiscovered: 4,
      overallMastery: 70,
      quizAttempts: [],
      materialsCount: 1,
      activeMaterialTitle: "Introduction to Cell Biology & Energy Synthesis.pdf",
      activeMaterialId: "bio-ch7",
    };
  }

  const activeEmail = resolveActiveEmail(userEmail);
  const uid = activeEmail.replace(/[^a-z0-9]/g, "_");
  const statsKey = `learnmate_user_stats_${uid}`;
  const historyKey = `learnmate_quiz_history_${uid}`;

  // 1. Load User's Uploaded Materials
  let materials: any[] = [];
  try {
    const rawMats = localStorage.getItem("learnmate_materials");
    if (rawMats) {
      materials = JSON.parse(rawMats);
    }
  } catch (e) {
    console.warn("Could not load materials for stats:", e);
  }

  let totalTopics = 0;
  if (Array.isArray(materials) && materials.length > 0) {
    materials.forEach((m) => {
      if (Array.isArray(m.topics)) totalTopics += m.topics.length;
      else if (typeof m.topicsCount === "number") totalTopics += m.topicsCount;
    });
  }
  if (totalTopics === 0) totalTopics = materials.length > 0 ? materials.length * 3 : 0;

  const activeMaterial = materials[0] || null;
  const activeMaterialTitle = activeMaterial ? activeMaterial.name : "Cell Biology & Energy Synthesis.pdf";
  const activeMaterialId = activeMaterial ? activeMaterial.id : "bio-ch7";

  // 2. Load User's Quiz History (Scoped to this exact user)
  let quizAttempts: QuizAttempt[] = [];
  try {
    const rawHist = localStorage.getItem(historyKey);
    if (rawHist) {
      quizAttempts = JSON.parse(rawHist);
    }
  } catch (e) {
    console.warn("Could not load quiz history:", e);
  }

  // Calculate mastery from this user's real quiz history
  let overallMastery = 0;
  if (quizAttempts.length > 0) {
    const sumPct = quizAttempts.reduce((acc, q) => acc + q.pct, 0);
    overallMastery = Math.round(sumPct / quizAttempts.length);
  } else {
    overallMastery = 50; // Initial baseline before taking a quiz
  }

  // 3. User's Real Streak & Study Time (Individually stored per user account)
  let streakDays = 1;
  let totalStudyMinutes = 0;

  try {
    const rawStats = localStorage.getItem(statsKey);
    if (rawStats) {
      const parsed = JSON.parse(rawStats);
      if (typeof parsed.streakDays === "number") streakDays = parsed.streakDays;
      if (typeof parsed.totalStudyMinutes === "number") totalStudyMinutes = parsed.totalStudyMinutes;
    } else {
      // Check if user object in Auth has streak_days from SQLite backend
      const storedUser = localStorage.getItem("learnmate_user");
      if (storedUser) {
        try {
          const u = JSON.parse(storedUser);
          if (u.user_metadata?.streak_days) streakDays = u.user_metadata.streak_days;
          if (u.user_metadata?.study_minutes) totalStudyMinutes = u.user_metadata.study_minutes;
        } catch {}
      }
      // Save exact fresh stats for this specific user
      localStorage.setItem(
        statsKey,
        JSON.stringify({ streakDays, totalStudyMinutes, created: new Date().toISOString() })
      );
    }
  } catch (e) {
    console.warn("Could not read stats:", e);
  }

  return {
    streakDays,
    totalStudyMinutes,
    topicsDiscovered: totalTopics,
    overallMastery,
    quizAttempts,
    materialsCount: materials.length,
    activeMaterialTitle,
    activeMaterialId,
  };
}

export function recordQuizAttempt(
  userEmail: string | undefined,
  attempt: { materialTitle: string; score: number; total: number; weakTopics: string[] }
) {
  if (typeof window === "undefined") return;
  const activeEmail = resolveActiveEmail(userEmail);
  const uid = activeEmail.replace(/[^a-z0-9]/g, "_");
  const historyKey = `learnmate_quiz_history_${uid}`;
  const statsKey = `learnmate_user_stats_${uid}`;

  const pct = Math.round((attempt.score / attempt.total) * 100);
  const newAttempt: QuizAttempt = {
    id: `att-${Date.now()}`,
    materialTitle: attempt.materialTitle,
    score: attempt.score,
    total: attempt.total,
    pct,
    date: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + ", " + new Date().toLocaleDateString([], { month: "short", day: "numeric" }),
    weakTopics: attempt.weakTopics,
  };

  try {
    let existing: QuizAttempt[] = [];
    const raw = localStorage.getItem(historyKey);
    if (raw) existing = JSON.parse(raw);
    const updated = [newAttempt, ...existing].slice(0, 20); // Keep last 20
    localStorage.setItem(historyKey, JSON.stringify(updated));

    // Increase study time by 10 minutes for this user
    const rawStats = localStorage.getItem(statsKey);
    let stats = rawStats ? JSON.parse(rawStats) : { streakDays: 1, totalStudyMinutes: 0 };
    stats.totalStudyMinutes = (stats.totalStudyMinutes || 0) + 10;
    localStorage.setItem(statsKey, JSON.stringify(stats));
  } catch (e) {
    console.warn("Could not save attempt:", e);
  }
}

export function formatStudyTime(totalMinutes: number): string {
  if (!totalMinutes || totalMinutes <= 0) return "0m";
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h`;
  return `${mins}m`;
}
