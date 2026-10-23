import React, { useState } from "react";
import { Header } from "./components/Header";
import { DocumentUpload } from "./components/DocumentUpload";
import { ConceptExplainer } from "./components/ConceptExplainer";
import { DiagnosticQuiz } from "./components/DiagnosticQuiz";
import { RevisionPlanView } from "./components/RevisionPlanView";
import { ProgressAnalytics } from "./components/ProgressAnalytics";
import { AudioRevisionPlayer } from "./components/AudioRevisionPlayer";
import { GroundedTutorChat } from "./components/GroundedTutorChat";
import { FlashcardsDeck } from "./components/FlashcardsDeck";
import { SettingsModal } from "./components/SettingsModal";
import type { StudyMaterial, QuizEvaluation, QuizQuestion } from "./types";
import { SAMPLE_BIOLOGY_MATERIAL } from "./services/sampleData";
import { apiService, type ApiMode } from "./services/apiService";

export function App() {
  const [currentMaterial, setCurrentMaterial] = useState<StudyMaterial>(SAMPLE_BIOLOGY_MATERIAL);
  const [activeTab, setActiveTab] = useState<string>("material");
  const [language, setLanguage] = useState<string>("english");
  const [apiMode, setApiMode] = useState<ApiMode>(apiService.getMode());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [latestEvaluation, setLatestEvaluation] = useState<QuizEvaluation | null>(null);
  const [, setLastQuestions] = useState<QuizQuestion[]>([]);

  const handleMaterialLoaded = (material: StudyMaterial) => {
    setCurrentMaterial(material);
    setActiveTab("concepts");
  };

  const handleQuizCompleted = (evaluation: QuizEvaluation, questions: QuizQuestion[]) => {
    setLatestEvaluation(evaluation);
    setLastQuestions(questions);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Header
        language={language}
        setLanguage={setLanguage}
        apiMode={apiMode}
        onOpenSettings={() => setIsSettingsOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === "material" && (
          <DocumentUpload
            currentMaterial={currentMaterial}
            onMaterialLoaded={handleMaterialLoaded}
            onProceedToStudy={() => setActiveTab("concepts")}
          />
        )}

        {activeTab === "concepts" && currentMaterial && (
          <ConceptExplainer
            material={currentMaterial}
            language={language}
            setLanguage={setLanguage}
            onProceedToQuiz={() => setActiveTab("quiz")}
          />
        )}

        {activeTab === "quiz" && currentMaterial && (
          <DiagnosticQuiz
            material={currentMaterial}
            onQuizCompleted={handleQuizCompleted}
            onViewRevisionPlan={() => setActiveTab("revision")}
          />
        )}

        {activeTab === "revision" && currentMaterial && (
          <RevisionPlanView
            material={currentMaterial}
            evaluation={latestEvaluation}
            language={language}
          />
        )}

        {activeTab === "progress" && currentMaterial && (
          <ProgressAnalytics
            material={currentMaterial}
            onRetakeQuiz={() => setActiveTab("quiz")}
          />
        )}

        {activeTab === "audio" && currentMaterial && (
          <AudioRevisionPlayer
            material={currentMaterial}
            language={language}
          />
        )}

        {activeTab === "chat" && currentMaterial && (
          <GroundedTutorChat
            material={currentMaterial}
            language={language}
          />
        )}

        {activeTab === "flashcards" && (
          <FlashcardsDeck />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            LearnMate &copy; 2026 &bull; Powered by Google AI Studio & Gemini 3.8 Flash
          </span>
          <div className="flex items-center space-x-4 text-[11px] text-slate-400">
            <span>Adaptive Pedagogical Diagnostics</span>
            <span>&bull;</span>
            <span>Grounded Hallucination Guard</span>
            <span>&bull;</span>
            <span>2-Min Audio Overview</span>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={(newMode) => setApiMode(newMode)}
      />
    </div>
  );
}

export default App;
