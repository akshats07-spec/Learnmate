import React, { useState, useEffect } from "react";
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  Award,
  ChevronRight,
  BookmarkCheck,
  AlertTriangle
} from "lucide-react";
import confetti from "canvas-confetti";
import type { StudyMaterial, QuizQuestion, QuizEvaluation } from "../types";
import { apiService } from "../services/apiService";

interface DiagnosticQuizProps {
  material: StudyMaterial;
  onQuizCompleted: (evaluation: QuizEvaluation, questions: QuizQuestion[]) => void;
  onViewRevisionPlan: () => void;
}

export const DiagnosticQuiz: React.FC<DiagnosticQuizProps> = ({
  material,
  onQuizCompleted,
  onViewRevisionPlan
}) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<QuizEvaluation | null>(null);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(0);

  // Load diagnostic quiz questions
  const loadQuiz = async () => {
    setIsLoading(true);
    setIsSubmitted(false);
    setEvaluation(null);
    setCurrentIdx(0);
    setTimeSpentSeconds(0);
    try {
      const qList = await apiService.generateQuiz(material, 5);
      setQuestions(qList);
      setSelectedAnswers(new Array(qList.length).fill(-1));
    } catch (err) {
      console.error("Failed to load quiz:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuiz();
  }, [material.id]);

  // Quiz timer
  useEffect(() => {
    if (isSubmitted || isLoading) return;
    const interval = setInterval(() => {
      setTimeSpentSeconds((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isSubmitted, isLoading]);

  const handleSelectOption = (optionIndex: number) => {
    if (isSubmitted) return;
    const updated = [...selectedAnswers];
    updated[currentIdx] = optionIndex;
    setSelectedAnswers(updated);
  };

  const handleSubmitQuiz = async () => {
    setIsLoading(true);
    try {
      const evalData = await apiService.evaluateQuiz(material, questions, selectedAnswers);
      setEvaluation(evalData);
      setIsSubmitted(true);

      // Save attempt to progress tracking
      apiService.saveLocalAttempt(material.id, {
        id: "attempt-" + Date.now(),
        timestamp: new Date().toLocaleString(),
        score: evalData.score,
        total: evalData.total,
        percentage: evalData.percentage,
        weak_topics: evalData.weak_topics_analysis.map((w) => w.topic)
      });

      // Trigger confetti if high score
      if (evalData.percentage >= 80) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      onQuizCompleted(evalData, questions);
    } catch (err) {
      console.error("Quiz evaluation failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (isLoading && questions.length === 0) {
    return (
      <div className="py-24 text-center">
        <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-white">
          Gemini is constructing your diagnostic quiz...
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Formulating high-yield questions with page citations to pinpoint knowledge gaps
        </p>
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  const answeredCount = selectedAnswers.filter((a) => a !== -1).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
              Step 3: Diagnostic Assessment
            </span>
            <span className="text-xs text-slate-400">
              {questions.length} Diagnostic Questions
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Discover What You Know and What Needs Attention
          </h2>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{formatTime(timeSpentSeconds)}</span>
          </div>
          <button
            onClick={loadQuiz}
            disabled={isLoading}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-indigo-400" : ""}`} />
            <span>Retake / New Questions</span>
          </button>
        </div>
      </div>

      {/* Main Quiz Flow */}
      {!isSubmitted && currentQ && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Question Display */}
          <div className="lg:col-span-8 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            {/* Question Header & Meta */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  Question {currentIdx + 1} of {questions.length}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[11px] font-medium">
                  {currentQ.topic}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px] border border-slate-700 flex items-center gap-1">
                <BookmarkCheck className="w-3 h-3 text-indigo-400" />
                {currentQ.page_reference}
              </span>
            </div>

            {/* Question Text */}
            <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
              {currentQ.question}
            </h3>

            {/* Multiple Choice Options */}
            <div className="space-y-3">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = selectedAnswers[currentIdx] === optIdx;
                const letter = String.fromCharCode(65 + optIdx);
                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all flex items-start space-x-3 ${
                      isSelected
                        ? "bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-600/10"
                        : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                        isSelected
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="pt-0.5 leading-relaxed">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => setCurrentIdx((i) => Math.max(i - 1, 0))}
                disabled={currentIdx === 0}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold text-slate-300 border border-slate-700"
              >
                Previous
              </button>

              {currentIdx < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIdx((i) => i + 1)}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 flex items-center space-x-1.5"
                >
                  <span>Next Question</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={answeredCount === 0 || isLoading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center space-x-2"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <>
                      <span>Submit & Diagnose Weaknesses</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Right Question Palette & Quick Jump */}
          <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Question Navigator
            </h4>

            <div className="grid grid-cols-5 gap-2">
              {questions.map((_, idx) => {
                const isCurrent = currentIdx === idx;
                const isAnswered = selectedAnswers[idx] !== -1;
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentIdx(idx)}
                    className={`h-10 rounded-xl text-xs font-bold transition-all ${
                      isCurrent
                        ? "bg-indigo-600 text-white ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900"
                        : isAnswered
                        ? "bg-indigo-950/70 text-indigo-300 border border-indigo-700/60"
                        : "bg-slate-950 text-slate-500 border border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Completed:</span>
                <span className="font-bold text-white">
                  {answeredCount} / {questions.length}
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div
                  className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(answeredCount / questions.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-indigo-300 text-xs leading-relaxed">
              <p className="font-semibold mb-1 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                Adaptive Diagnostic
              </p>
              Your answers will immediately reveal conceptual blind spots, link back to exact textbook pages, and generate a personalized 3-day revision plan.
            </div>
          </div>
        </div>
      )}

      {/* Submitted Results & Review Card */}
      {isSubmitted && evaluation && (
        <div className="space-y-6">
          {/* Score Header Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    Diagnostic Outcome
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white">
                  Score: {evaluation.score} / {evaluation.total} ({evaluation.percentage}%)
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  {evaluation.diagnosis_summary}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  onClick={onViewRevisionPlan}
                  className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-102"
                >
                  <span>View Adaptive Revision Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Detailed Question Review List */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Detailed Question Review & Page Citations
            </h4>

            {questions.map((q, idx) => {
              const userAns = selectedAnswers[idx];
              const isCorrect = userAns === q.correct_answer_index;

              return (
                <div
                  key={q.id}
                  className={`p-5 rounded-2xl border shadow-md transition-all ${
                    isCorrect
                      ? "bg-emerald-950/20 border-emerald-500/30"
                      : "bg-rose-950/20 border-rose-500/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center space-x-2.5">
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                      )}
                      <span className="text-sm font-bold text-white">
                        Q{idx + 1}. {q.question}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px] border border-slate-700 shrink-0">
                      {q.page_reference}
                    </span>
                  </div>

                  {/* Options status */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs">
                    {q.options.map((opt, optIdx) => {
                      const isChosen = userAns === optIdx;
                      const isTargetCorrect = optIdx === q.correct_answer_index;

                      return (
                        <div
                          key={optIdx}
                          className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-between ${
                            isTargetCorrect
                              ? "bg-emerald-500/20 text-emerald-200 border-emerald-500/40"
                              : isChosen && !isTargetCorrect
                              ? "bg-rose-500/20 text-rose-200 border-rose-500/40"
                              : "bg-slate-900/60 text-slate-400 border-slate-800/80 opacity-60"
                          }`}
                        >
                          <span>{opt}</span>
                          {isTargetCorrect && (
                            <span className="text-[10px] font-bold text-emerald-400 ml-2">
                              (Correct Answer)
                            </span>
                          )}
                          {isChosen && !isTargetCorrect && (
                            <span className="text-[10px] font-bold text-rose-400 ml-2">
                              (Your Choice)
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation with Citation */}
                  <div className="mt-3.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 leading-relaxed flex items-start space-x-2">
                    <BookmarkCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-indigo-300 block mb-0.5">
                        Grounded Explanation ({q.page_reference}):
                      </strong>
                      <span>{q.explanation}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
