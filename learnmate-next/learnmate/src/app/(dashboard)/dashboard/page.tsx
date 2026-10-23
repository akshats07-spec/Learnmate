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
  ArrowRight
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState("Good afternoon");

  useEffect(() => {
    const hr = new Date().getHours();
    if (hr < 12) setGreeting("Good morning");
    else if (hr < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const userName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Student";

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
            You're currently studying <strong className="text-white">Biology Chapter 7: Cellular Respiration</strong>.
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

      {/* ── 2. Metric KPI Cards ───────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Learning Streak", value: "4 Days", icon: Flame, tint: "text-amber-400 bg-amber-400/10", sub: "Keep it up today!" },
          { label: "Total Study Time", value: "3h 45m", icon: Clock, tint: "text-sky-400 bg-sky-400/10", sub: "+45m this week" },
          { label: "Topics Discovered", value: "14 Topics", icon: BookOpen, tint: "text-violet-bright bg-violet/10", sub: "Across 2 materials" },
          { label: "Overall Mastery", value: "68%", icon: TrendingUp, tint: "text-mint bg-mint/10", sub: "+12% from last attempt" },
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
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Continue Learning</h3>
              </div>
              <Badge variant="mint">5 Pages Indexed</Badge>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-line flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-2xs text-muted uppercase font-bold block mb-1">Active Coursework</span>
                <h4 className="text-base font-bold text-white">Introduction to Cell Biology & Energy Synthesis.pdf</h4>
                <p className="text-xs text-muted mt-1">
                  Last active: 2 hours ago &bull; 4 core topics detected &bull; 1 pending revision plan
                </p>
              </div>
              <Link href="/library/bio-ch7" className="shrink-0">
                <Button size="sm">Open Workspace <ChevronRight size={14} /></Button>
              </Link>
            </div>

            {/* Topic Mastery Progress Bars */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-semibold text-slate-300 block">Topic Mastery Breakdown</span>
              {[
                { name: "Cell Membrane & Transport", mastery: 85, status: "Mastered", color: "bg-mint" },
                { name: "Mitochondria & Energy Harvesting", mastery: 48, status: "Needs Practice", color: "bg-rose-400" },
                { name: "Plant vs Animal Organelles", mastery: 64, status: "Good Progress", color: "bg-violet" },
                { name: "Photosynthesis vs Respiration", mastery: 35, status: "High Priority", color: "bg-amber-400" },
              ].map((topic, i) => (
                <div key={i} className="p-3 rounded-xl bg-surface/50 border border-line/60 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-white">{topic.name}</span>
                    <span className="text-2xs text-muted font-mono">{topic.mastery}% ({topic.status})</span>
                  </div>
                  <div className="w-full bg-line rounded-full h-1.5 overflow-hidden">
                    <div className={`h-full ${topic.color} rounded-full transition-all`} style={{ width: `${topic.mastery}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Quiz Performance Chart Mockup */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <Target size={16} className="text-mint" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Diagnostic Performance History</h3>
              </div>
              <Link href="/progress" className="text-xs text-violet hover:underline">Full Analytics →</Link>
            </div>

            <div className="space-y-3">
              {[
                { attempt: "Attempt #2", date: "Today, 2:40 PM", score: "3 / 5", pct: 60, weak: ["Mitochondria", "Photosynthesis"] },
                { attempt: "Attempt #1", date: "Yesterday, 10:15 AM", score: "2 / 5", pct: 40, weak: ["Organelles", "Energy", "Plant Cells"] },
              ].map((att, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-surface border border-line flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-white font-semibold">{att.attempt}</strong>
                      <span className="text-2xs text-muted font-mono">{att.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-2xs text-muted">Weak points flagged:</span>
                      {att.weak.map((w, wIdx) => (
                        <span key={wIdx} className="px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-300 text-2xs border border-rose-500/20">{w}</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-white block">{att.score} ({att.pct}%)</span>
                    <span className="text-2xs text-mint">+20% improvement</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Upcoming Revision & Quick Tools */}
        <div className="lg:col-span-4 space-y-6">
          {/* Upcoming 3-Day Tasks */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Spaced Revision Tasks</h3>
              </div>
              <Link href="/revision" className="text-2xs text-violet hover:underline">View Plan</Link>
            </div>

            <div className="space-y-2.5">
              {[
                { day: "Day 1 (Today)", task: "Review Mitochondrial Cristae on Page 2", time: "5m", done: false },
                { day: "Day 1 (Today)", task: "Solve 2 targeted questions on ATP synthesis", time: "4m", done: false },
                { day: "Day 2 (Tomorrow)", task: "Active recall test on Photosynthesis equation", time: "6m", done: false },
              ].map((t, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-surface border border-line flex items-start gap-2.5 text-xs">
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
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Interactive AI Tools</h3>
            <div className="space-y-2">
              <Link href="/tutor" className="p-3 rounded-xl bg-surface border border-line hover:border-violet/40 block transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain size={16} className="text-violet" />
                    <span className="text-xs font-semibold text-white">Ask Grounded AI Tutor</span>
                  </div>
                  <ChevronRight size={14} className="text-muted" />
                </div>
                <p className="text-2xs text-muted mt-1">Get simple explanations with verified page citations.</p>
              </Link>

              <Link href="/visuals" className="p-3 rounded-xl bg-surface border border-line hover:border-violet/40 block transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Box size={16} className="text-mint" />
                    <span className="text-xs font-semibold text-white">Generate 3D Visual</span>
                  </div>
                  <ChevronRight size={14} className="text-muted" />
                </div>
                <p className="text-2xs text-muted mt-1">Turn complex biology and physics into visual models.</p>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
