import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  FileCheck,
  Zap,
  BookOpen,
  Layers,
  Sparkles,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import type { StudyMaterial } from "../types";
import { SAMPLE_BIOLOGY_MATERIAL } from "../services/sampleData";
import { apiService } from "../services/apiService";

interface DocumentUploadProps {
  currentMaterial: StudyMaterial | null;
  onMaterialLoaded: (material: StudyMaterial) => void;
  onProceedToStudy: () => void;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  currentMaterial,
  onMaterialLoaded,
  onProceedToStudy
}) => {
  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload");
  const [pastedTitle, setPastedTitle] = useState("Introduction to Cellular Respiration");
  const [pastedText, setPastedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle PDF file selection
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setUploadError("Please upload a PDF document (.pdf)");
      return;
    }
    setUploadError(null);
    setIsLoading(true);
    try {
      const material = await apiService.uploadPdf(file);
      onMaterialLoaded(material);
    } catch (err: any) {
      setUploadError("Failed to extract text from PDF. " + (err.message || ""));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Pasted Text Submission
  const handlePastedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedText.trim()) {
      setUploadError("Please paste your study notes or chapter text.");
      return;
    }
    setUploadError(null);
    setIsLoading(true);
    try {
      const material = await apiService.uploadText(pastedTitle, pastedText);
      onMaterialLoaded(material);
    } catch (err: any) {
      setUploadError("Error processing text: " + (err.message || ""));
    } finally {
      setIsLoading(false);
    }
  };

  // 1-Click Sample Material Loader for Hackathon Demos
  const handleLoadSample = (sample: StudyMaterial) => {
    setIsLoading(true);
    setTimeout(() => {
      onMaterialLoaded(sample);
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Problem Statement Alignment */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900/40 border border-indigo-500/20 p-6 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Step 1: Ingest Course Material</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Turn Any Study Material into Personalised Mastery
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Upload textbook chapters or notes up to 20 pages. LearnMate parses individual pages, builds conceptual citations, diagnoses student weaknesses through targeted quizzes, and automatically creates an adaptive revision plan.
            </p>
          </div>

          {/* Quick Demo Preload Buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto">
            <button
              onClick={() => handleLoadSample(SAMPLE_BIOLOGY_MATERIAL)}
              className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all hover:scale-102 active:scale-98"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Load Sample: Bio Ch 7 (5 Pages)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Upload & Ingestion Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: File Dropzone or Paste Tab */}
        <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-lg">
          {/* Tab selector */}
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-4 mb-5">
            <button
              onClick={() => setActiveTab("upload")}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "upload"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload PDF Document</span>
            </button>
            <button
              onClick={() => setActiveTab("paste")}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "paste"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Paste Notes / Chapter Text</span>
            </button>
          </div>

          {uploadError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {uploadError}
            </div>
          )}

          {/* Upload Tab */}
          {activeTab === "upload" && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                dragOver
                  ? "border-indigo-500 bg-indigo-500/10"
                  : "border-slate-700/80 hover:border-indigo-500/60 bg-slate-950/40 hover:bg-slate-900/50"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400">
                <UploadCloud className="w-7 h-7" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1">
                Drag and drop your chapter PDF here
              </h3>
              <p className="text-xs text-slate-400 mb-4 max-w-sm">
                Supports textbook chapters, lecture slides, and notes (up to 20 pages). Learnmate breaks each page down into traceable citations.
              </p>
              <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-indigo-300 text-xs font-medium border border-slate-700/60 hover:bg-slate-700">
                Browse Files (.PDF)
              </span>
            </div>
          )}

          {/* Paste Tab */}
          {activeTab === "paste" && (
            <form onSubmit={handlePastedSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Document / Chapter Title
                </label>
                <input
                  type="text"
                  value={pastedTitle}
                  onChange={(e) => setPastedTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Chapter 7: Cellular Respiration"
                  required
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Paste Chapter Text / Study Material
                  </label>
                  <span className="text-[11px] text-slate-500">
                    {pastedText.split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  rows={8}
                  className="w-full p-3.5 rounded-xl bg-slate-950/80 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 leading-relaxed font-mono"
                  placeholder="Paste your course notes, slides, or chapter text here..."
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <span>Process & Ingest Study Material</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Ingested Material Inspection Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-lg h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Current Material
                  </h3>
                </div>
                {currentMaterial && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-medium flex items-center gap-1">
                    <FileCheck className="w-3 h-3" />
                    Active & Paginated
                  </span>
                )}
              </div>

              {currentMaterial ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                    <h4 className="text-base font-bold text-white mb-2 leading-snug">
                      {currentMaterial.title}
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-xs text-slate-400">
                      <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80">
                        <span className="block text-slate-500 text-[10px] uppercase font-semibold">
                          Pages Detected
                        </span>
                        <span className="text-sm font-bold text-indigo-300">
                          {currentMaterial.pages.length} Pages
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80">
                        <span className="block text-slate-500 text-[10px] uppercase font-semibold">
                          Total Characters
                        </span>
                        <span className="text-sm font-bold text-indigo-300">
                          {currentMaterial.rawText.length.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Page Preview List */}
                  <div>
                    <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-400" />
                      Page Citations Index
                    </h5>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {currentMaterial.pages.map((p) => (
                        <div
                          key={p.page_number}
                          className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/70 text-xs flex items-start space-x-2.5"
                        >
                          <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold">
                            P.{p.page_number}
                          </span>
                          <p className="text-slate-300 line-clamp-2 text-[11px] leading-relaxed">
                            {p.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-400" />
                  <p className="text-xs">No study material loaded yet.</p>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Upload a PDF or click "Load Sample" to begin your learning journey.
                  </p>
                </div>
              )}
            </div>

            {currentMaterial && (
              <div className="pt-4 border-t border-slate-800/80 mt-4">
                <button
                  onClick={onProceedToStudy}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all hover:scale-101"
                >
                  <span>Explore Concepts & Page Citations</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
