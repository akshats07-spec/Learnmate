import React, { useState } from "react";
import {
  X,
  Server,
  Key,
  Sparkles,
  Check,
  AlertCircle,
  ExternalLink,
  Laptop
} from "lucide-react";
import { apiService, type ApiMode } from "../services/apiService";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (mode: ApiMode) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [mode, setMode] = useState<ApiMode>(apiService.getMode());
  const [apiKey, setApiKey] = useState(apiService.getApiKey());
  const [backendUrl, setBackendUrl] = useState(apiService.getBackendUrl());
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    apiService.setMode(mode);
    apiService.setApiKey(apiKey);
    apiService.setBackendUrl(backendUrl);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onSave(mode);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                LearnMate Connection & Engine Settings
              </h3>
              <p className="text-xs text-slate-400">
                Choose how LearnMate interacts with Google Gemini 3.8
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector Radio Cards */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
            Execution Architecture
          </label>

          <div
            onClick={() => setMode("demo")}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
              mode === "demo"
                ? "bg-indigo-950/40 border-indigo-500 shadow-md ring-1 ring-indigo-500"
                : "bg-slate-950/50 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-start space-x-3">
              <Laptop className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-white">
                    Interactive Standalone Demo (Recommended for judging)
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    Zero Setup
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Instant offline testing with pre-computed biology/quantum chapters, dynamic quiz diagnostics, and 3-day revision plans without requiring API keys.
                </p>
              </div>
            </div>
          </div>

          <div
            onClick={() => setMode("backend")}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
              mode === "backend"
                ? "bg-indigo-950/40 border-indigo-500 shadow-md ring-1 ring-indigo-500"
                : "bg-slate-950/50 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-start space-x-3">
              <Server className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-white">
                    Python FastAPI Backend
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                    Full Stack
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Communicates with the Python FastAPI server in <code className="text-indigo-300">backend/</code>, using PyPDF and SQLite progress persistence.
                </p>
              </div>
            </div>
          </div>

          <div
            onClick={() => setMode("direct_gemini")}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
              mode === "direct_gemini"
                ? "bg-indigo-950/40 border-indigo-500 shadow-md ring-1 ring-indigo-500"
                : "bg-slate-950/50 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-start space-x-3">
              <Key className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-white">
                    Direct Google AI Studio API
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                    Client SDK
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Executes live requests directly from your browser to Google AI Studio using <code className="text-indigo-300">@google/genai</code>.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Backend URL Input (if in backend mode) */}
        {mode === "backend" && (
          <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <label className="block text-xs font-semibold text-slate-300">
              FastAPI Backend Endpoint URL
            </label>
            <input
              type="text"
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
              placeholder="http://localhost:8000"
            />
            <p className="text-[10px] text-slate-500">
              Start with: <code className="text-indigo-400">cd backend && python run.py</code>
            </p>
          </div>
        )}

        {/* Gemini API Key Input (if in direct_gemini mode) */}
        {mode === "direct_gemini" && (
          <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-semibold text-slate-300">
                Google Gemini API Key
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>Get API Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
              placeholder="AIzaSy..."
            />
          </div>
        )}

        {/* Footer Save Button */}
        <div className="pt-2 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Settings persist in browser LocalStorage.
          </span>
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-102"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Saved & Applied!</span>
              </>
            ) : (
              <span>Save & Connect</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
