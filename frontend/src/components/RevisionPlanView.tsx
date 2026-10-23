import React, { useState, useEffect } from "react";
import {
  Calendar,
  CheckSquare,
  Square,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  BookOpen,
  Layers,
  HelpCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Printer
} from "lucide-react";
import type { StudyMaterial, RevisionPlan, QuizEvaluation, FollowupPracticeQuestion } from "../types";
import { apiService } from "../services/apiService";

interface RevisionPlanViewProps {
  material: StudyMaterial;
  evaluation: QuizEvaluation | null;
  language: string;
}

export const RevisionPlanView: React.FC<RevisionPlanViewProps> = ({
  material,
  evaluation,
  language
}) => {
  const [plan, setPlan] = useState<RevisionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({});
  
  // Follow-up practice question state
  const [practiceAnswers, setPracticeAnswers] = useState<Record<number, number>>({});
  const [revealedSolutions, setRevealedSolutions] = useState<Record<number, boolean>>({});

  const loadRevisionPlan = async () => {
    setIsLoading(true);
    try {
      const weakTopics = evaluation?.weak_topics_analysis || [];
      const planData = await apiService.generateRevisionPlan(material, weakTopics, language);
      setPlan(planData);
    } catch (err) {
      console.error("Failed to generate revision plan:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRevisionPlan();
  }, [material.id, evaluation?.score, language]);

  const toggleTask = (taskKey: string) => {
    setCheckedTasks((prev) => ({
      ...prev,
      [taskKey]: !prev[taskKey]
    }));
  };

  const handleSelectPracticeAnswer = (qId: number, optIdx: number) => {
    setPracticeAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const toggleSolution = (qId: number) => {
    setRevealedSolutions((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-white">
          Gemini is constructing your personalised adaptive revision plan...
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Targeting your diagnosed weak topics with spaced recall & focused practice questions
        </p>
      </div>
    );
  }

  if (!plan) return null;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
              Step 4: Personalised Revision & Practice
            </span>
            <span className="text-xs text-slate-400">
              Adaptive to Quiz Results ({evaluation ? `${evaluation.score}/${evaluation.total}` : "Initial Diagnostic"})
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {plan.plan_title}
          </h2>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition-colors"
            title="Print or Export PDF"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export Plan</span>
          </button>
          <button
            onClick={loadRevisionPlan}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Regenerate Plan"
          >
            <RefreshCw className="w-4 h-4 text-indigo-400" />
          </button>
        </div>
      </div>

      {/* Priority Focus Areas (High / Med / Low) */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          Targeted Weak Areas & Focus Ranking
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plan.priority_focus_areas.map((area, idx) => {
            const isHigh = area.priority === "HIGH";
            const isMedium = area.priority === "MEDIUM";

            return (
              <div
                key={idx}
                className={`p-5 rounded-2xl border shadow-lg flex flex-col justify-between ${
                  isHigh
                    ? "bg-rose-950/20 border-rose-500/40"
                    : isMedium
                    ? "bg-amber-950/20 border-amber-500/40"
                    : "bg-slate-900/60 border-slate-800"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
                        isHigh
                          ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                          : isMedium
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                          : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      }`}
                    >
                      {area.priority} PRIORITY
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {area.pages_to_review}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white mb-2 leading-snug">
                    {area.topic}
                  </h4>

                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    {area.action_item}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block mb-1">
                    Rule to Master:
                  </span>
                  <p className="text-[11px] text-slate-300 italic bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                    "{area.key_rule_to_remember}"
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3-Day Spaced Learning Schedule */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              3-Day Spaced Repetition Timetable
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Scientifically timed to overcome the Ebbinghaus forgetting curve
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plan.spaced_schedule.map((dayItem, dIdx) => (
            <div
              key={dIdx}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-400">
                    {dayItem.day}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono">
                    {dayItem.duration_minutes} mins
                  </span>
                </div>

                <h4 className="text-xs font-semibold text-white mb-3">
                  {dayItem.focus}
                </h4>

                {/* Task Checklists */}
                <div className="space-y-2">
                  {dayItem.checklist.map((task, tIdx) => {
                    const taskKey = `${dIdx}-${tIdx}`;
                    const isChecked = checkedTasks[taskKey];
                    return (
                      <button
                        key={tIdx}
                        onClick={() => toggleTask(taskKey)}
                        className={`w-full text-left p-2 rounded-lg text-xs flex items-start space-x-2 transition-all ${
                          isChecked
                            ? "bg-emerald-950/30 text-emerald-300 line-through opacity-70"
                            : "bg-slate-900/80 text-slate-300 hover:bg-slate-800"
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                        )}
                        <span className="text-[11px] leading-relaxed">{task}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Follow-up Targeted Practice Questions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Follow-Up Targeted Practice Questions
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Address the specific misconceptions diagnosed in your quiz
          </span>
        </div>

        <div className="space-y-4">
          {plan.followup_practice_questions.map((pq, pqIdx) => {
            const userChoice = practiceAnswers[pq.id];
            const hasAnswered = userChoice !== undefined;
            const isCorrect = userChoice === pq.correct_answer_index;
            const showSolution = revealedSolutions[pq.id];

            return (
              <div
                key={pq.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider border border-indigo-500/30">
                      Fixing: {pq.targeted_weak_topic}
                    </span>
                    <h4 className="text-sm font-bold text-white leading-snug">
                      Practice Q{pqIdx + 1}. {pq.question}
                    </h4>
                  </div>
                  <span className="text-xs font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 shrink-0">
                    {pq.page_reference}
                  </span>
                </div>

                {/* Option choices */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {pq.options.map((opt, optIdx) => {
                    const isSelected = userChoice === optIdx;
                    const letter = String.fromCharCode(65 + optIdx);

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectPracticeAnswer(pq.id, optIdx)}
                        className={`p-3 rounded-xl border text-left flex items-start space-x-2.5 transition-all ${
                          isSelected
                            ? isCorrect
                              ? "bg-emerald-950/40 border-emerald-500 text-white"
                              : "bg-rose-950/40 border-rose-500 text-white"
                            : "bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700"
                        }`}
                      >
                        <span className="w-5 h-5 rounded bg-slate-800 flex items-center justify-center font-bold text-[11px] shrink-0 text-slate-300">
                          {letter}
                        </span>
                        <span className="leading-relaxed">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Feedback & Step-by-Step Solution toggle */}
                <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-slate-800/80">
                  <div>
                    {hasAnswered && (
                      <div className="flex items-center space-x-2 text-xs font-semibold">
                        {isCorrect ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Correct! You mastered this weak spot.
                          </span>
                        ) : (
                          <span className="text-rose-400 flex items-center gap-1">
                            <XCircle className="w-4 h-4" /> Not quite. Check the step-by-step solution below.
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => toggleSolution(pq.id)}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
                  >
                    {showSolution ? "Hide Step-by-Step Solution" : "View Step-by-Step Solution"}
                  </button>
                </div>

                {showSolution && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-line">
                    <strong className="text-white block mb-1">
                      Step-by-Step Solution ({pq.page_reference}):
                    </strong>
                    {pq.step_by_step_solution}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
