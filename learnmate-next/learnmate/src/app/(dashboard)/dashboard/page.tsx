"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  BookOpen,
  TrendingUp,
  Target,
  Clock,
  Flame,
  Upload,
  Brain,
  Box,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { getUserStats, formatStudyTime, UserStats } from "@/lib/userStats";

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState("Good afternoon");
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    const hr = new Date().getHours();
    if (hr < 12) setGreeting("Good morning");
    else if (hr < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    // Load dynamic user stats from storage
    const loaded = getUserStats(user?.email);
    setStats(loaded);
  }, [user]);

  const userName =
    user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Student";

  const streakDays = stats?.streakDays ?? 1;
  const studyTimeFormatted = formatStudyTime(stats?.totalStudyMinutes ?? 25);
  const topicsCount = stats?.topicsDiscovered ?? 4;
  const masteryPct = stats?.overallMastery ?? 60;
  const activeTitle = stats?.activeMaterialTitle ?? "Cell Biology & Energy Synthesis.pdf";
  const activeId = stats?.activeMaterialId ?? "bio-ch7";
  const attempts = stats?.quizAttempts ?? [];

  return (
    <div className="space-y-8">
      {/* ── 1. Top Greeting & Quick Actions Bar ────────────────── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-violet-dim/20 via-panel to-panel border border-violet/20 shadow-glow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xs font-semibold uppercase tracking-wider text-violet-bright">
              {greeting}, {userName}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-mint" />
            <span className="text-2xs text-muted">Pro Plan Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Ready to continue your mastery?
          </h1>
          <p className="text-xs text-muted mt-1">
            You're currently studying <strong className="text-white">{activeTitle}</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/library">
            <Button size="sm">
              <Upload size={14} /> Upload Material
            </Button>
          </Link>
          <Link href="/practice">
            <Button variant="secondary" size="sm">
              <Target size={14} /> Take Quiz
            </Button>
          </Link>
          <Link href="/visuals">
            <Button variant="ghost" size="sm">
              <Box size={14} /> 3D Visuals
            </Button>
          </Link>
        </div>
      </div>

      {/* ── 2. Metric KPI Cards (Personalized & Dynamic) ──────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Learning Streak",
            value: `${streakDays} ${streakDays === 1 ? "Day" : "Days"}`,
            icon: Flame,
            tint: "text-amber-400 bg-amber-400/10",
            sub: streakDays === 1 ? "Day 1 — Welcome to LearnMate!" : "Keep your daily streak going!",
          },
          {
            label: "Total Study Time",
            value: studyTimeFormatted,
            icon: Clock,
            tint: "text-sky-400 bg-sky-400/10",
            sub: "Logged study time",
          },
          {
            label: "Topics Discovered",
            value: `${topicsCount} Topics`,
            icon: BookOpen,
            tint: "text-violet-bright bg-violet/10",
            sub: `Across ${stats?.materialsCount || 1} material(s)`,
          },
          {
            label: "Overall Mastery",
            value: `${masteryPct}%`,
            icon: TrendingUp,
            tint: "text-mint bg-mint/10",
            sub: attempts.length > 0 ? `Across ${attempts.length} quiz attempt(s)` : "Take a quiz to calibrate",
          },
        ].map((m, i) => (
          <Card key={i} className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400">{m.label}</span>
              <div className={`p-2 rounded-xl ${m.tint}`}>
                <m.icon size={16} />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white mb-1">{m.value}</div>
            <span className="text-2xs text-muted">{m.sub}</span>
          </Card>
        ))}
      </div>

      {/* ── 3. Main Dashboard Grid ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Continue Learning & Topic Mastery */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Material Card */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-violet" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Active Coursework
                </h3>
              </div>
              <Badge variant="mint">Ready for Study</Badge>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-line flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-2xs text-muted uppercase font-bold block mb-1">
                  Active Document
                </span>
                <h4 className="text-base font-bold text-white">{activeTitle}</h4>
                <p className="text-xs text-muted mt-1">
                  Indexed topics available &bull; Grounded AI Tutor & 3D Visuals ready
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/library/${activeId}`} className="shrink-0">
                  <Button size="sm">
                    Open Workspace <ChevronRight size={14} />
                  </Button>
                </Link>
                <Link href={`/practice?materialId=${activeId}`} className="shrink-0">
                  <Button variant="secondary" size="sm">
                    Take Quiz
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick Actions for this material */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <Link
                href="/tutor"
                className="p-3 rounded-xl bg-surface/60 border border-line hover:border-violet/40 transition-colors flex items-center gap-2.5 text-xs text-slate-200"
              >
                <Brain size={16} className="text-violet shrink-0" />
                <span>Ask Grounded Tutor</span>
              </Link>
              <Link
                href="/visuals"
                className="p-3 rounded-xl bg-surface/60 border border-line hover:border-mint/40 transition-colors flex items-center gap-2.5 text-xs text-slate-200"
              >
                <Box size={16} className="text-mint shrink-0" />
                <span>Explore in 3D</span>
              </Link>
              <Link
                href="/practice"
                className="p-3 rounded-xl bg-surface/60 border border-line hover:border-amber-400/40 transition-colors flex items-center gap-2.5 text-xs text-slate-200"
              >
                <Target size={16} className="text-amber-400 shrink-0" />
                <span>Realtime Quiz</span>
              </Link>
            </div>
          </Card>

          {/* Diagnostic Performance History */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <Target size={16} className="text-mint" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Diagnostic Quiz Performance
                </h3>
              </div>
              <Link href="/practice" className="text-xs text-violet hover:underline">
                New Quiz →
              </Link>
            </div>

            {attempts.length > 0 ? (
              <div className="space-y-3">
                {attempts.slice(0, 3).map((att, idx) => (
                  <div
                    key={att.id || idx}
                    className="p-3.5 rounded-xl bg-surface border border-line flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-white font-semibold">
                          {att.materialTitle || "Quiz Attempt"}
                        </strong>
                        <span className="text-2xs text-muted font-mono">{att.date}</span>
                      </div>
                      {att.weakTopics && att.weakTopics.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          <span className="text-2xs text-muted">Weak points flagged:</span>
                          {att.weakTopics.map((w, wIdx) => (
                            <span
                              key={wIdx}
                              className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-300 text-2xs border border-rose-500/20"
                            >
                              {w}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold text-white block">
                        {att.score} / {att.total} ({att.pct}%)
                      </span>
                      <span className="text-2xs text-mint">
                        {att.pct >= 70 ? "Mastery Demonstrated" : "Revision Recommended"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-surface/50 border border-line text-center space-y-2">
                <p className="text-xs text-slate-300 font-medium">
                  No quizzes completed yet. Test your understanding to calibrate your mastery score!
                </p>
                <Link href="/practice">
                  <Button size="sm" className="mt-2">
                    <Target size={14} /> Start Realtime Quiz
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Upcoming Revision & Quick Tools */}
        <div className="lg:col-span-4 space-y-6">
          {/* Upcoming 3-Day Tasks */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Spaced Revision Tasks
                </h3>
              </div>
              <Link href="/revision" className="text-2xs text-violet hover:underline">
                View Plan
              </Link>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  day: "Day 1 (Today)",
                  task: `Review high-priority concepts in ${activeTitle.slice(0, 24)}...`,
                  time: "5m",
                },
                {
                  day: "Day 1 (Today)",
                  task: "Solve targeted practice questions on weak topics",
                  time: "4m",
                },
                {
                  day: "Day 2 (Tomorrow)",
                  task: "Active recall test on key structural relationships",
                  time: "6m",
                },
              ].map((t, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-surface border border-line flex items-start gap-2.5 text-xs"
                >
                  <div className="w-4 h-4 rounded border border-line mt-0.5 shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xs font-bold text-violet">{t.day}</span>
                      <span className="text-2xs text-muted font-mono">{t.time}</span>
                    </div>
                    <p className="text-slate-200 mt-0.5 leading-snug">{t.task}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/revision">
              <Button variant="outline" size="sm" className="w-full mt-2">
                Launch Revision Planner
              </Button>
            </Link>
          </Card>

          {/* Quick Learning Aids */}
          <Card className="space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
              Interactive AI Tools
            </h3>
            <div className="space-y-2">
              <Link
                href="/tutor"
                className="p-3 rounded-xl bg-surface border border-line hover:border-violet/40 block transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain size={16} className="text-violet" />
                    <span className="text-xs font-semibold text-white">Ask Grounded AI Tutor</span>
                  </div>
                  <ChevronRight size={14} className="text-muted" />
                </div>
                <p className="text-2xs text-muted mt-1">
                  Get simple explanations with verified page citations.
                </p>
              </Link>

              <Link
                href="/visuals"
                className="p-3 rounded-xl bg-surface border border-line hover:border-violet/40 block transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Box size={16} className="text-mint" />
                    <span className="text-xs font-semibold text-white">Generate 3D Visual</span>
                  </div>
                  <ChevronRight size={14} className="text-muted" />
                </div>
                <p className="text-2xs text-muted mt-1">
                  Turn complex concepts into interactive 3D models.
                </p>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
