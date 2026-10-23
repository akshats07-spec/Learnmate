"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Sparkles, Compass, Eye, Target, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [subject, setSubject] = useState("Human Biology & Cell Energetics");
  const [goal, setGoal] = useState("Prepare for upcoming semester exam");
  const [studyStyle, setStudyStyle] = useState<"visual" | "reading" | "practice" | "mixed">("mixed");

  const handleFinish = () => {
    // Save onboarding preferences
    try {
      localStorage.setItem("learnmate_onboarding", JSON.stringify({ subject, goal, studyStyle }));
    } catch {}
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-ink">
      <div className="w-full max-w-lg space-y-8">
        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                step === s ? "w-8 bg-violet" : step > s ? "w-4 bg-mint" : "w-4 bg-line"
              }`}
            />
          ))}
        </div>

        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-violet-gradient text-white flex items-center justify-center mx-auto shadow-glow-sm">
            <Sparkles size={24} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            {step === 1 && "What are you studying right now?"}
            {step === 2 && "What is your primary learning goal?"}
            {step === 3 && "How do you learn best?"}
          </h2>
          <p className="text-xs text-muted">
            Personalizing your AI tutor and revision schedule
          </p>
        </div>

        {/* Step Container Card */}
        <div className="p-8 rounded-3xl bg-panel border border-line shadow-card space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <Input
                label="Current subject or course topic"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Organic Chemistry, Quantum Physics, Data Structures"
              />

              <div className="space-y-1.5 pt-2">
                <span className="text-2xs font-semibold uppercase tracking-wider text-muted block">Suggested options:</span>
                <div className="flex flex-wrap gap-2">
                  {["Cell Biology", "Thermodynamics", "Machine Learning", "Microeconomics", "Neuroscience"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSubject(s)}
                      className="text-xs px-2.5 py-1 rounded-lg border border-line bg-surface hover:border-violet/40 text-slate-300"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <Button onClick={() => setStep(2)} className="w-full mt-4">
                Continue <ArrowRight size={16} />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Input
                label="Target goal or milestone"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. Score an A in my midterm exam"
              />

              <div className="space-y-2 pt-2">
                {[
                  "Pass an upcoming midterm or final exam",
                  "Deep conceptual understanding & retention",
                  "Brush up on weak topics before clinicals / interviews",
                  "Self-directed rapid learning"
                ].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGoal(g)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                      goal === g
                        ? "bg-violet-400/10 border-violet text-violet-bright font-medium"
                        : "bg-surface border-line text-slate-300 hover:border-slate-600"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="ghost" onClick={() => setStep(1)} className="flex-1">Back</Button>
                <Button onClick={() => setStep(3)} className="flex-1">Continue <ArrowRight size={16} /></Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: "visual", title: "Visual & 3D Models", desc: "Diagrams, analogies, and spatial representations", icon: Eye },
                  { id: "practice", title: "Active Practice", desc: "Rapid diagnostic quizzes & targeted questions", icon: Target },
                  { id: "reading", title: "Textual & In-Depth", desc: "Structured summaries & page references", icon: BookOpen },
                  { id: "mixed", title: "Adaptive Hybrid", desc: "A balanced mix of all learning modes", icon: Compass },
                ].map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setStudyStyle(style.id as any)}
                    className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      studyStyle === style.id
                        ? "bg-violet-400/10 border-violet text-white ring-1 ring-violet shadow-sm"
                        : "bg-surface border-line text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div>
                      <div className="w-8 h-8 rounded-lg bg-surface border border-line flex items-center justify-center text-violet mb-2">
                        <style.icon size={16} />
                      </div>
                      <h4 className="text-xs font-bold text-white mb-1">{style.title}</h4>
                      <p className="text-2xs text-muted leading-relaxed">{style.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="ghost" onClick={() => setStep(2)} className="flex-1">Back</Button>
                <Button onClick={handleFinish} className="flex-1">Launch My Workspace <ArrowRight size={16} /></Button>
              </div>
            </div>
          )}
        </div>

        {/* Skip action */}
        <div className="text-center">
          <button
            onClick={handleFinish}
            className="text-xs text-muted hover:text-white underline underline-offset-4"
          >
            Skip setup and go directly to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
