import React from "react";
import { Sparkles, Brain, Settings, Globe, Server, CheckCircle2, AlertCircle } from "lucide-react";
import type { ApiMode } from "../services/apiService";

interface HeaderProps {
  language: string;
  setLanguage: (lang: string) => void;
  apiMode: ApiMode;
  onOpenSettings: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  setLanguage,
  apiMode,
  onOpenSettings,
  activeTab,
  setActiveTab
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
                LearnMate
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                Gemini 3.8
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Personalised Learning & Adaptive Revision Engine
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center overflow-x-auto max-w-full space-x-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
          {[
            { id: "material", label: "Study Material" },
            { id: "concepts", label: "Concepts & Citations" },
            { id: "quiz", label: "Diagnostic Quiz" },
            { id: "revision", label: "Personalised Plan" },
            { id: "progress", label: "Progress & History" },
            { id: "audio", label: "Audio Overview" },
            { id: "chat", label: "Grounded Q&A" },
            { id: "flashcards", label: "Flashcards" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Controls: Language, Mode Pill, Settings */}
        <div className="flex items-center space-x-2.5">
          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === "english" ? "hindi" : "english")}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-xs font-medium text-slate-300 border border-slate-700/60 transition-colors"
            title="Toggle between English and Hindi explanations"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span>{language === "english" ? "English" : "हिन्दी (Hindi)"}</span>
          </button>

          {/* Mode Pill */}
          <button
            onClick={onOpenSettings}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              apiMode === "backend"
                ? "bg-emerald-950/40 text-emerald-300 border-emerald-700/50 hover:bg-emerald-900/30"
                : apiMode === "direct_gemini"
                ? "bg-purple-950/40 text-purple-300 border-purple-700/50 hover:bg-purple-900/30"
                : "bg-slate-800/80 text-slate-300 border-slate-700/60 hover:bg-slate-700"
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>
              {apiMode === "backend"
                ? "FastAPI"
                : apiMode === "direct_gemini"
                ? "Gemini Studio"
                : "Interactive Demo"}
            </span>
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
            title="Configure API Mode & Keys"
          >
            <Settings className="w-4 h-4 text-slate-400 hover:text-white" />
          </button>
        </div>
      </div>
    </header>
  );
};
