import React, { useState, useEffect } from "react";
import {
  Sparkles,
  BookOpen,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Globe,
  Quote,
  Lightbulb,
  ArrowRight,
  RefreshCw,
  BookmarkCheck
} from "lucide-react";
import type { StudyMaterial, ConceptExplanation } from "../types";
import { apiService } from "../services/apiService";

interface ConceptExplainerProps {
  material: StudyMaterial;
  language: string;
  setLanguage: (lang: string) => void;
  onProceedToQuiz: () => void;
}

export const ConceptExplainer: React.FC<ConceptExplainerProps> = ({
  material,
  language,
  setLanguage,
  onProceedToQuiz
}) => {
  const [explanation, setExplanation] = useState<ConceptExplanation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [copiedQuote, setCopiedQuote] = useState<string | null>(null);

  // Fetch or regenerate explanations when material or language changes
  const loadExplanations = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.explainConcepts(material, undefined, language);
      setExplanation(data);
    } catch (err) {
      console.error("Failed to load concept explanations:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadExplanations();
  }, [material.id, language]);

  // Audio Speech Synthesis for spoken explanation
  const handleReadAloud = (text: string, index: number) => {
    if (!window.speechSynthesis) return;

    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    if (language === "hindi") {
      utterance.lang = "hi-IN";
    }

    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);

    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyQuote = (quote: string) => {
    navigator.clipboard.writeText(quote);
    setCopiedQuote(quote);
    setTimeout(() => setCopiedQuote(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
              Step 2: Grounded Conceptual Understanding
            </span>
            <span className="text-xs text-slate-400">
              {material.title} ({material.pages.length} Pages)
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Clear Explanations with Exact Page Citations
          </h2>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* Hindi / English Toggle */}
          <button
            onClick={() => setLanguage(language === "english" ? "hindi" : "english")}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span>
              {language === "english" ? "Translate to हिन्दी" : "Show in English"}
            </span>
          </button>

          {/* Regenerate Button */}
          <button
            onClick={loadExplanations}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Re-generate concept breakdown"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-indigo-400" : ""}`} />
          </button>

          {/* Jump to Diagnostic Quiz */}
          <button
            onClick={onProceedToQuiz}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all hover:scale-102"
          >
            <span>Take Diagnostic Quiz</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 text-center">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-white">
            Gemini is grounding explanations against your uploaded pages...
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Extracting core analogies, page citations, and direct textbook passages
          </p>
        </div>
      ) : explanation ? (
        <div className="space-y-6">
          {/* Executive Summary Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-purple-950/30 border border-indigo-500/20 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                  Concept Synthesis
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  {explanation.title}
                </h3>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  {explanation.summary}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>

            {explanation.hindi_translation_note && (
              <div className="mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs leading-relaxed flex items-start space-x-2">
                <Globe className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block text-amber-300 mb-0.5">
                    हिन्दी सारांश (Hindi Summary):
                  </strong>
                  <span>{explanation.hindi_translation_note}</span>
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                <strong className="text-slate-200">Key Takeaway:</strong> {explanation.quick_takeaway}
              </span>
            </div>
          </div>

          {/* Breakdown Cards with Page Citations & Analogies */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {explanation.key_concepts.map((kc, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition-all group"
              >
                <div>
                  {/* Top Reference Badge & Read Aloud */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 font-mono text-[11px] font-bold border border-indigo-500/30 flex items-center gap-1">
                      <BookmarkCheck className="w-3 h-3 text-indigo-400" />
                      {kc.page_reference}
                    </span>
                    <button
                      onClick={() =>
                        handleReadAloud(`${kc.concept}. ${kc.explanation}. Analogy: ${kc.analogy}`, idx)
                      }
                      className={`p-1.5 rounded-lg border text-xs transition-colors ${
                        speakingIndex === idx
                          ? "bg-indigo-600 text-white border-indigo-500 animate-pulse"
                          : "bg-slate-800 text-slate-400 hover:text-white border-slate-700"
                      }`}
                      title={speakingIndex === idx ? "Stop Audio" : "Listen to explanation"}
                    >
                      {speakingIndex === idx ? (
                        <VolumeX className="w-3.5 h-3.5" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <h4 className="text-base font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                    {kc.concept}
                  </h4>

                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    {kc.explanation}
                  </p>

                  {/* Real-Life Intuition Analogy */}
                  <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 text-purple-200 text-xs mb-4">
                    <div className="flex items-center space-x-1.5 text-purple-300 font-semibold mb-1">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
                      <span className="text-[11px] uppercase tracking-wider">Intuitive Analogy</span>
                    </div>
                    <p className="text-[11px] text-purple-200/90 leading-relaxed italic">
                      "{kc.analogy}"
                    </p>
                  </div>
                </div>

                {/* Grounded Quote / Passage */}
                <div className="pt-3 border-t border-slate-800/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                      <Quote className="w-2.5 h-2.5" />
                      Source Passage Citation
                    </span>
                    <button
                      onClick={() => handleCopyQuote(kc.quote_or_passage)}
                      className="text-slate-500 hover:text-slate-300 text-[10px] flex items-center gap-1"
                    >
                      {copiedQuote === kc.quote_or_passage ? (
                        <>
                          <Check className="w-2.5 h-2.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-2.5 h-2.5" />
                          <span>Copy Quote</span>
                        </>
                      )}
                    </button>
                  </div>
                  <blockquote className="text-[11px] text-slate-400 italic bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60 leading-relaxed">
                    "{kc.quote_or_passage}"
                  </blockquote>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};
