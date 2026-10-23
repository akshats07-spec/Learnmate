"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Target,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Award,
  AlertTriangle,
  BookmarkCheck,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { demoQuestions, sampleText } from "@/lib/demo";
import type { Question } from "@/lib/types";

export default function PracticePage() {
  const [activeDocTitle, setActiveDocTitle] = useState("Cell Biology & Energetics");
  const [activeDocText, setActiveDocText] = useState(sampleText);
  const [questions, setQuestions] = useState<Question[]>(demoQuestions);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(new Array(demoQuestions.length).fill(-1));
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quizKind, setQuizKind] = useState<"diagnostic" | "practice">("diagnostic");

  // Load uploaded material from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("learnmate_materials");
      if (saved) {
        const list = JSON.parse(saved);
        if (Array.isArray(list) && list.length > 0) {
          const doc = list[0];
          if (doc.name) setActiveDocTitle(doc.name);
          if (doc.text) {
            setActiveDocText(doc.text);
            // Auto generate initial quiz if user uploaded a document
            generateQuizFromText(doc.text, doc.name);
          }
        }
      }
    } catch (e) {
      console.warn("Could not load material for practice:", e);
    }
  }, []);

  const generateQuizFromText = async (textToUse: string, title: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/learn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "quiz",
          text: textToUse,
        }),
      });
      const data = await res.json();
      if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
        setQuestions(data.questions);
        setSelectedAnswers(new Array(data.questions.length).fill(-1));
      }
    } catch {
      // Keep existing demo fallback
    } finally {
      setLoading(false);
    }
  };

  const currentQ = questions[currentIdx];

  const handleSelect = (optIdx: number) => {
    if (submitted) return;
    const updated = [...selectedAnswers];
    updated[currentIdx] = optIdx;
    setSelectedAnswers(updated);
  };

  const score = selectedAnswers.reduce(
    (sum, a, i) => sum + (a === questions[i]?.correctIndex ? 1 : 0),
    0
  );

  const weakTopics = questions
    .filter((q, i) => selectedAnswers[i] !== q.correctIndex)
    .map((q) => q.topic);

  const handleSubmit = () => {
    setSubmitted(true);
    const missed = questions
      .filter((q, i) => selectedAnswers[i] !== q.correctIndex)
      .map((q) => q.topic);

    // Save weak topics to localStorage so Revision Planner updates immediately
    try {
      localStorage.setItem("learnmate_weak_topics", JSON.stringify(missed.length ? missed : ["General Mastery"]));
      localStorage.setItem("learnmate_last_quiz", JSON.stringify({
        score,
        total: questions.length,
        weakTopics: missed,
        materialTitle: activeDocTitle,
        timestamp: new Date().toISOString(),
      }));
    } catch (e) {
      console.warn("Could not save weak topics:", e);
    }
  };

  const handleLoadNewQuiz = async (kind: "diagnostic" | "practice") => {
    setLoading(true);
    setQuizKind(kind);
    setSubmitted(false);
    setCurrentIdx(0);

    try {
      const res = await fetch("/api/learn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: kind,
          text: activeDocText || sampleText,
          weakTopics: weakTopics.length ? weakTopics : ["Foundational Concepts", "Processes & Cycles"],
        }),
      });

      const data = await res.json();
      if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
        setQuestions(data.questions);
        setSelectedAnswers(new Array(data.questions.length).fill(-1));
      }
    } catch {
      // Keep existing demo fallback
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Top Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xs font-semibold uppercase tracking-wider text-violet-bright">
              Adaptive Practice Engine
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-mint" />
            <Badge variant="mint" className="text-2xs py-0">
              <BookOpen size={10} className="mr-1" /> {activeDocTitle}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Quizzes & Targeted Practice
          </h1>
          <p className="text-xs text-muted mt-1">
            Test conceptual retention and diagnose specific misconceptions before exams.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleLoadNewQuiz("diagnostic")}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>New Diagnostic</span>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleLoadNewQuiz("practice")}
            disabled={loading}
          >
            <Target size={14} />
            <span>Targeted Practice</span>
          </Button>
        </div>
      </div>

      {/* ── Active Quiz Flow ──────────────────────────────────── */}
      {!submitted && currentQ && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-8 p-6 space-y-6">
            {/* Question Meta */}
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-violet uppercase">
                  Question {currentIdx + 1} of {questions.length}
                </span>
                <Badge variant="violet">{currentQ.topic}</Badge>
              </div>
              <span className="text-2xs text-muted font-mono flex items-center gap-1">
                <BookmarkCheck size={13} className="text-violet" />
                Page {currentQ.page}
              </span>
            </div>

            {/* Question Prompt */}
            <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
              {currentQ.prompt}
            </h3>

            {/* Options */}
            <div className="space-y-3">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = selectedAnswers[currentIdx] === optIdx;
                const letter = String.fromCharCode(65 + optIdx);

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelect(optIdx)}
                    className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all flex items-start gap-3 ${
                      isSelected
                        ? "bg-violet-400/20 border-violet text-white shadow-sm"
                        : "bg-surface border-line text-slate-300 hover:border-slate-700 hover:bg-surface/80"
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                        isSelected ? "bg-violet text-white" : "bg-panel text-slate-400"
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="pt-0.5">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Nav controls */}
            <div className="flex items-center justify-between pt-4 border-t border-line">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                disabled={currentIdx === 0}
              >
                Previous
              </Button>

              {currentIdx < questions.length - 1 ? (
                <Button size="sm" onClick={() => setCurrentIdx((i) => i + 1)}>
                  Next <ChevronRight size={14} />
                </Button>
              ) : (
                <Button size="sm" onClick={handleSubmit} disabled={selectedAnswers.some((a) => a === -1)}>
                  Submit & Diagnose Weaknesses
                </Button>
              )}
            </div>
          </Card>

          {/* Right question palette */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="p-5 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Question Navigator
              </h4>

              <div className="grid grid-cols-5 gap-2">
                {questions.map((_, i) => {
                  const isCur = currentIdx === i;
                  const isAns = selectedAnswers[i] !== -1;

                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentIdx(i)}
                      className={`h-9 rounded-xl text-xs font-bold transition-all ${
                        isCur
                          ? "bg-violet text-white ring-2 ring-violet-bright"
                          : isAns
                          ? "bg-violet-dim/30 text-violet-bright border border-violet/40"
                          : "bg-surface text-slate-500 border border-line hover:border-slate-700"
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 text-2xs text-muted">
                Answered: {selectedAnswers.filter((a) => a !== -1).length} of {questions.length}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ── Quiz Results & Evaluation Review ──────────────────── */}
      {submitted && (
        <div className="space-y-6">
          {/* Score Header Card */}
          <Card className="p-6 bg-gradient-to-r from-panel via-surface to-panel border-violet/30 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Award size={18} className="text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    Diagnostic Outcome
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Score: {score} / {questions.length} ({Math.round((score / questions.length) * 100)}%)
                </h2>
                <p className="text-xs text-muted mt-1 max-w-xl leading-relaxed">
                  {score / questions.length >= 0.8
                    ? "Great retention! You demonstrated strong mastery across key topics. Continue with periodic spaced review."
                    : `Identified ${weakTopics.length} weak areas requiring focused review: ${weakTopics.join(", ")}.`}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Link href="/revision">
                  <Button size="sm">
                    View Adaptive Revision Plan <ChevronRight size={14} />
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={() => handleLoadNewQuiz("practice")}>
                  Practice Weak Topics
                </Button>
              </div>
            </div>
          </Card>

          {/* Question-by-Question Review */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Detailed Question Feedback & Citations
            </h3>

            {questions.map((q, idx) => {
              const userAns = selectedAnswers[idx];
              const isCorrect = userAns === q.correctIndex;

              return (
                <div
                  key={q.id}
                  className={`p-5 rounded-2xl border text-xs space-y-3 transition-all ${
                    isCorrect
                      ? "bg-mint/5 border-mint/30"
                      : "bg-rose-500/5 border-rose-500/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 font-medium text-white text-sm">
                      {isCorrect ? (
                        <CheckCircle2 size={16} className="text-mint shrink-0" />
                      ) : (
                        <XCircle size={16} className="text-rose-400 shrink-0" />
                      )}
                      <span>Q{idx + 1}. {q.prompt}</span>
                    </div>
                    <Badge variant="slate">Page {q.page}</Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-2xs">
                    {q.options.map((opt, optIdx) => (
                      <div
                        key={optIdx}
                        className={`p-2.5 rounded-lg border font-medium ${
                          optIdx === q.correctIndex
                            ? "bg-mint/15 text-mint border-mint/40"
                            : optIdx === userAns
                            ? "bg-rose-500/15 text-rose-300 border-rose-500/40"
                            : "bg-surface/50 text-slate-400 border-line/60 opacity-60"
                        }`}
                      >
                        {opt}
                        {optIdx === q.correctIndex && " (Correct)"}
                        {optIdx === userAns && optIdx !== q.correctIndex && " (Your choice)"}
                      </div>
                    ))}
                  </div>

                  <p className="text-2xs text-muted leading-relaxed pt-1">
                    <strong className="text-slate-300">Explanation:</strong> {q.explanation}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
