"use client";
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
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export default function ProgressPage() {
  const attempts = [
    { id: 1, date: "Today, 2:40 PM", score: 3, total: 5, pct: 60, material: "Introduction to Cell Biology" },
    { id: 2, date: "Yesterday, 10:15 AM", score: 2, total: 5, pct: 40, material: "Introduction to Cell Biology" },
  ];

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
            <span className="text-2xs text-muted">Active Mastery Metrics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Learning Progress & Retention
          </h1>
          <p className="text-xs text-muted mt-1">
            Track mastery growth, quiz trends, and study velocity across your courses.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handleDownloadReport}>
          <Download size={14} /> Export Report (Print)
        </Button>
      </div>

      {/* ── Metric Summary Cards ──────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Overall Mastery", value: "68%", sub: "+20% from first attempt", icon: Award, tint: "text-mint bg-mint/10" },
          { label: "Learning Streak", value: "4 Days", sub: "Goal: 7 days", icon: Flame, tint: "text-amber-400 bg-amber-400/10" },
          { label: "Total Study Time", value: "3h 45m", sub: "Recorded across sessions", icon: Clock, tint: "text-sky-400 bg-sky-400/10" },
          { label: "Completed Tasks", value: "8 / 12", sub: "66% revision completion", icon: CheckCircle2, tint: "text-violet bg-violet/10" },
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
          <span className="text-2xs text-muted font-mono">Goal: 100% Mastery</span>
        </div>

        <div className="space-y-4 pt-2">
          {attempts.map((att) => (
            <div key={att.id} className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white">
                  Attempt #{att.id} &bull; <span className="text-muted font-normal">{att.date}</span>
                </span>
                <span className="font-mono font-bold text-violet-bright">
                  {att.score} / {att.total} ({att.pct}%)
                </span>
              </div>
              <div className="w-full bg-surface rounded-full h-3 p-0.5 border border-line">
                <div
                  className="bg-gradient-to-r from-violet to-mint h-full rounded-full transition-all duration-700"
                  style={{ width: `${att.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Topic Mastery Matrix ──────────────────────────────── */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
          Subject Topic Mastery Matrix
        </h3>

        <div className="space-y-3">
          {[
            { name: "Cell Membrane & Transport", mastery: 85, status: "Mastered", color: "bg-mint" },
            { name: "Mitochondria & ATP Synthesis", mastery: 48, status: "Revising", color: "bg-rose-400" },
            { name: "Plant vs Animal Organelles", mastery: 64, status: "Familiar", color: "bg-violet" },
            { name: "Photosynthesis vs Respiration", mastery: 35, status: "Priority Focus", color: "bg-amber-400" },
          ].map((topic, i) => (
            <div key={i} className="p-4 rounded-xl bg-surface border border-line flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-semibold text-white block">{topic.name}</span>
                <span className="text-2xs text-muted">Status: {topic.status}</span>
              </div>
              <div className="w-full sm:w-48 space-y-1">
                <div className="flex justify-between text-2xs font-mono">
                  <span className="text-muted">Mastery:</span>
                  <span className="text-white font-bold">{topic.mastery}%</span>
                </div>
                <div className="w-full bg-line rounded-full h-1.5 overflow-hidden">
                  <div className={`h-full ${topic.color} rounded-full`} style={{ width: `${topic.mastery}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
