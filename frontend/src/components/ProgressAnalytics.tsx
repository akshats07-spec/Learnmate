import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Award,
  History,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  PlusCircle
} from "lucide-react";
import type { StudyMaterial, AttemptRecord } from "../types";
import { apiService } from "../services/apiService";

interface ProgressAnalyticsProps {
  material: StudyMaterial;
  onRetakeQuiz: () => void;
}

export const ProgressAnalytics: React.FC<ProgressAnalyticsProps> = ({
  material,
  onRetakeQuiz
}) => {
  const [attempts, setAttempts] = useState<AttemptRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadProgress = async () => {
    setIsLoading(true);
    try {
      const records = await apiService.getProgressHistory(material.id);
      setAttempts(records);
    } catch (err) {
      console.error("Failed to load progress history:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProgress();
  }, [material.id]);

  // Demo helper: simulate a 3rd attempt showing mastery improvement to 100%!
  const handleSimulateMasteryAttempt = () => {
    const newRecord: AttemptRecord = {
      id: "attempt-" + Date.now(),
      timestamp: new Date().toLocaleString(),
      score: 5,
      total: 5,
      percentage: 100.0,
      weak_topics: []
    };
    apiService.saveLocalAttempt(material.id, newRecord);
    setAttempts((prev) => [...prev, newRecord]);
  };

  const latestAttempt = attempts[attempts.length - 1];
  const firstAttempt = attempts[0];
  const improvement =
    attempts.length >= 2
      ? latestAttempt.percentage - firstAttempt.percentage
      : 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
              Step 5: Longitudinal Progress Tracking
            </span>
            <span className="text-xs text-slate-400">
              {attempts.length} Recorded Attempts
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Learning Progression & Retention Analytics
          </h2>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleSimulateMasteryAttempt}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/40 text-emerald-300 border border-emerald-700/50 hover:bg-emerald-900/30 text-xs font-semibold transition-colors"
            title="Simulate a follow-up attempt demonstrating mastery"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Simulate Mastered Attempt (100%)</span>
          </button>
          <button
            onClick={onRetakeQuiz}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all hover:scale-102"
          >
            <span>Retake Diagnostic Quiz</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Analytics KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Latest Score
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white">
              {latestAttempt ? `${latestAttempt.percentage}%` : "--"}
            </span>
            <span className="text-xs text-slate-400">
              {latestAttempt ? `(${latestAttempt.score}/${latestAttempt.total})` : ""}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Current retention rate on {material.title}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Learning Delta / Growth
          </span>
          <div className="flex items-baseline space-x-2">
            <span
              className={`text-3xl font-black ${
                improvement >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {improvement >= 0 ? `+${improvement}%` : `${improvement}%`}
            </span>
            <span className="text-xs text-slate-400">across attempts</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Targeted revision plan impact
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Remaining Weak Topics
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-amber-400">
              {latestAttempt?.weak_topics.length ?? 0}
            </span>
            <span className="text-xs text-slate-400">topics flagged</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Pending mastery consolidation
          </p>
        </div>
      </div>

      {/* Visual Progression Chart */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Score Growth Trajectory Across Attempts
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Goal: 100% Mastery
          </span>
        </div>

        {/* Visual Bar Graph */}
        <div className="space-y-4 pt-2">
          {attempts.map((att, idx) => (
            <div key={att.id || idx} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-indigo-400 font-bold">
                    {idx + 1}
                  </span>
                  Attempt {idx + 1} ({att.timestamp})
                </span>
                <span className="font-mono font-bold text-indigo-300">
                  {att.score} / {att.total} ({att.percentage}%)
                </span>
              </div>
              <div className="w-full bg-slate-950 rounded-xl h-4 p-0.5 border border-slate-800">
                <div
                  className={`h-full rounded-lg transition-all duration-700 ${
                    att.percentage >= 80
                      ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                      : att.percentage >= 60
                      ? "bg-gradient-to-r from-indigo-500 to-purple-500"
                      : "bg-gradient-to-r from-amber-500 to-rose-500"
                  }`}
                  style={{ width: `${Math.max(att.percentage, 5)}%` }}
                />
              </div>

              {att.weak_topics.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">
                    Flagged Weak Spots:
                  </span>
                  {att.weak_topics.map((t, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2 py-0.5 rounded bg-rose-950/40 border border-rose-500/30 text-rose-300 text-[10px]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="pt-1">
                  <span className="px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[10px] font-semibold flex items-center gap-1 w-fit">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    All diagnostic concepts mastered!
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Attempt History Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
          <History className="w-4 h-4 text-indigo-400" />
          Attempt Audit Log
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3">Attempt #</th>
                <th className="p-3">Date & Time</th>
                <th className="p-3">Score</th>
                <th className="p-3">Status</th>
                <th className="p-3">Weak Topic Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {attempts.map((att, idx) => (
                <tr key={att.id || idx} className="hover:bg-slate-800/40">
                  <td className="p-3 font-bold text-white">#{idx + 1}</td>
                  <td className="p-3 font-mono text-slate-400">{att.timestamp}</td>
                  <td className="p-3 font-mono font-bold text-indigo-300">
                    {att.score}/{att.total} ({att.percentage}%)
                  </td>
                  <td className="p-3">
                    {att.percentage >= 80 ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold text-[10px]">
                        Mastered
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold text-[10px]">
                        Revising
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-slate-400">{att.weak_topics.length} topics</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
