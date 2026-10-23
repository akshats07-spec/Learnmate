"use client";
import { useState, useEffect } from "react";
import {
  User,
  Settings as SettingsIcon,
  Shield,
  Key,
  Save,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  Server
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { checkBackendHealth } from "@/lib/backend";

export default function SettingsPage() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(
    user?.user_metadata?.display_name || "Alex Sharma"
  );
  const [studySubject, setStudySubject] = useState("Human Biology & Cell Energetics");
  const [studyStyle, setStudyStyle] = useState("mixed");
  const [saved, setSaved] = useState(false);
  const [backendStatus, setBackendStatus] = useState<{ online: boolean; model?: string }>({ online: false });

  useEffect(() => {
    checkBackendHealth().then((status) => setBackendStatus(status));
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClearDemoData = () => {
    try {
      localStorage.removeItem("learnmate-demo-state-v1");
      localStorage.removeItem("learnmate_onboarding");
      alert("Local study session reset successfully.");
      window.location.reload();
    } catch {}
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* ── Top Header ────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xs font-semibold uppercase tracking-wider text-violet-bright">
            Account Preferences
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-mint" />
          <span className="text-2xs text-muted">User Profile</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Settings & Profile
        </h1>
        <p className="text-xs text-muted mt-1">
          Manage your personal details, study configuration, and application preferences.
        </p>
      </div>

      {saved && (
        <div className="p-3.5 rounded-xl bg-mint/15 border border-mint/30 text-mint text-xs flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>Profile changes successfully saved!</span>
        </div>
      )}

      {/* ── Profile Information ───────────────────────────────── */}
      <Card className="p-6 space-y-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <User size={16} className="text-violet" />
          Personal Details
        </h3>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your Name"
            />

            <Input
              label="Email Address"
              value={user?.email || "alex@university.edu"}
              disabled
              className="opacity-60 cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Input
              label="Primary Study Subject"
              value={studySubject}
              onChange={(e) => setStudySubject(e.target.value)}
              placeholder="e.g. Biology, Chemistry"
            />

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Preferred Study Style
              </label>
              <select
                value={studyStyle}
                onChange={(e) => setStudyStyle(e.target.value)}
                className="input-base text-xs"
              >
                <option value="visual">Visual & 3D Models</option>
                <option value="practice">Active Recall & Practice</option>
                <option value="reading">Textual & In-Depth</option>
                <option value="mixed">Adaptive Hybrid</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" size="sm">
              <Save size={14} /> Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* ── Environment Status Card ───────────────────────────── */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Key size={16} className="text-mint" />
          External Service Integrations
        </h3>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-xl bg-surface border border-line flex items-center justify-between">
            <div>
              <strong className="text-white block">FastAPI Python Microservice Backend</strong>
              <span className="text-2xs text-muted">Running on http://localhost:8000 with SQLite (learnmate.db)</span>
            </div>
            {backendStatus.online ? (
              <Badge variant="mint">Online (Port 8000)</Badge>
            ) : (
              <Badge variant="slate">Offline (Run python run.py)</Badge>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-surface border border-line flex items-center justify-between">
            <div>
              <strong className="text-white block">Google Gemini AI Studio</strong>
              <span className="text-2xs text-muted">Powering grounded reasoning, quizzes, and 3D visual concepts</span>
            </div>
            <Badge variant="mint">Online (gemini-3.5-flash)</Badge>
          </div>

          <div className="p-3.5 rounded-xl bg-surface border border-line flex items-center justify-between">
            <div>
              <strong className="text-white block">Supabase PostgreSQL & Auth</strong>
              <span className="text-2xs text-muted">User authentication and database persistence</span>
            </div>
            <Badge variant="violet">Configurable in .env</Badge>
          </div>

          <div className="p-3.5 rounded-xl bg-surface border border-line flex items-center justify-between">
            <div>
              <strong className="text-white block">Razorpay Payment Gateway</strong>
              <span className="text-2xs text-muted">Indian Rupee (INR) subscription management</span>
            </div>
            <Badge variant="slate">Sandbox Mode Active</Badge>
          </div>
        </div>
      </Card>

      {/* ── Data Management & Reset ───────────────────────────── */}
      <Card className="p-6 space-y-4 border-rose-500/30 bg-rose-500/5">
        <h3 className="text-sm font-bold text-rose-300 uppercase tracking-wider flex items-center gap-2">
          <AlertTriangle size={16} className="text-rose-400" />
          Data Management
        </h3>

        <p className="text-xs text-muted leading-relaxed">
          Reset local study sessions, clear cached quiz attempts, or restart the demo workspace.
        </p>

        <div>
          <Button variant="danger" size="sm" onClick={handleClearDemoData}>
            <Trash2 size={14} /> Reset Local Learning Session
          </Button>
        </div>
      </Card>
    </div>
  );
}
