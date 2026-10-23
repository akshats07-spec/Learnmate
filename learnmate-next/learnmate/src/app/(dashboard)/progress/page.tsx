"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Award,
  Clock,
  Flame,
  CheckCircle2,
  Calendar,
  Box,
  Target,
  Download,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { getUserStats, formatStudyTime, UserStats } from "@/lib/userStats";

export default function ProgressPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    const loaded = getUserStats(user?.email);
    setStats(loaded);
  }, [user]);

  const streakDays = stats?.streakDays ?? 1;
  const studyTimeFormatted = formatStudyTime(stats?.totalStudyMinutes ?? 25);
  const masteryPct = stats?.overallMastery ?? 60;
  const attempts = stats?.quizAttempts ?? [];

  const handleDownloadReport = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* ── Top Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xs font-semibold uppercase tracking-wider text-violet-bright">
              Longitudinal Analytics
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-mint" />
            <span className="text-2xs text-muted">Personalized Study Metrics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Learning Progress & Retention
          </h1>
          <p className="text-xs text-muted mt-1">
            Track your real mastery growth, quiz scores, and study streak across all uploaded materials.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handleDownloadReport}>
          <Download size={14} /> Export Report (Print)
        </Button>
      </div>

      {/* ── Metric Summary Cards (Dynamic & Scoped to User) ──── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Overall Mastery",
            value: `${masteryPct}%`,
            sub: attempts.length > 0 ? `Across ${attempts.length} quiz attempt(s)` : "Calibrate via diagnostic quiz",
            icon: Award,
            tint: "text-mint bg-mint/10",
          },
          {
            label: "Learning Streak",
            value: `${streakDays} ${streakDays === 1 ? "Day" : "Days"}`,
            sub: streakDays === 1 ? "Day 1 — Welcome to LearnMate!" : "Keep your daily streak going!",
            icon: Flame,
            tint: "text-amber-400 bg-amber-400/10",
          },
          {
            label: "Total Study Time",
            value: studyTimeFormatted,
            sub: "Recorded across active sessions",
            icon: Clock,
            tint: "text-sky-400 bg-sky-400/10",
          },
          {
            label: "Discovered Topics",
            value: `${stats?.topicsDiscovered || 4} Topics`,
            sub: `Across ${stats?.materialsCount || 1} material(s)`,
            icon: BookOpen,
            tint: "text-violet bg-violet/10",
          },
        ].map((m, i) => (
          <Card key={i} className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted font-medium">{m.label}</span>
              <div className={`p-2 rounded-xl ${m.tint}`}>
                <m.icon size={16} />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white mb-1">{m.value}</div>
            <span className="text-2xs text-muted">{m.sub}</span>
          </Card>
        ))}
      </div>

      {/* ── Score Progression Trajectory ──────────────────────── */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-violet" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Diagnostic Quiz Score Trajectory
            </h3>
          </div>
          <Link href="/practice" className="text-xs text-violet hover:underline">
            Take Quiz Now →
          </Link>
        </div>

        {attempts.length > 0 ? (
          <div className="space-y-4 pt-2">
            {attempts.map((att, idx) => (
              <div key={att.id || idx} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">
                    {att.materialTitle || "Quiz Attempt"} &bull;{" "}
                    <span className="text-muted font-normal">{att.date}</span>
                  </span>
                  <span className="font-mono font-bold text-violet-bright">
                    {att.score} / {att.total} ({att.pct}%)
                  </span>
                </div>
                <div className="w-full bg-surface rounded-full h-3 p-0.5 border border-line">
                  <div
                    className="bg-gradient-to-r from-violet to-mint h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.max(5, att.pct)}%` }}
                  />
                </div>
                {att.weakTopics && att.weakTopics.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 text-2xs text-muted">
                    <span>Weak areas flagged for revision:</span>
                    {att.weakTopics.map((w, wIdx) => (
                      <span
                        key={wIdx}
                        className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 font-mono"
                      >
                        {w}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-surface/50 border border-line text-center space-y-3">
            <Target size={32} className="mx-auto text-violet/60" />
            <h4 className="text-sm font-semibold text-white">No Quiz Attempts Recorded Yet</h4>
            <p className="text-xs text-muted max-w-sm mx-auto">
              Select any of your uploaded PDFs or study materials to take an interactive quiz and track your learning curve.
            </p>
            <Link href="/practice">
              <Button size="sm">
                <Target size={14} /> Launch Practice Quiz
              </Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}
