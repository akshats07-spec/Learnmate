"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  FolderOpen,
  Upload,
  FileText,
  Image as ImageIcon,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  RefreshCw,
  Plus,
  Clock,
  Sparkles,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

interface MaterialItem {
  id: string;
  name: string;
  type: "pdf" | "image" | "text";
  pages: number;
  topicsCount: number;
  mastery: number;
  uploadedAt: string;
  lastStudied: string;
  status: "ready" | "processing" | "failed";
}

const INITIAL_MATERIALS: MaterialItem[] = [
  {
    id: "bio-ch7",
    name: "Introduction to Cell Biology & Energy Synthesis.pdf",
    type: "pdf",
    pages: 5,
    topicsCount: 4,
    mastery: 68,
    uploadedAt: "Today, 10:15 AM",
    lastStudied: "2 hours ago",
    status: "ready",
  },
  {
    id: "physics-optics",
    name: "Ray Optics & Thin Lens Diagrams.png",
    type: "image",
    pages: 1,
    topicsCount: 3,
    mastery: 45,
    uploadedAt: "Yesterday",
    lastStudied: "Yesterday",
    status: "ready",
  },
];

export default function LibraryPage() {
  const [materials, setMaterials] = useState<MaterialItem[]>(INITIAL_MATERIALS);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "pdf" | "image">("all");
  const [uploading, setUploading] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user's saved materials from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("learnmate_materials");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge custom uploads with initial defaults
          const ids = new Set(parsed.map((p: any) => p.id));
          const combined = [...parsed, ...INITIAL_MATERIALS.filter((m) => !ids.has(m.id))];
          setMaterials(combined);
        }
      }
    } catch (err) {
      console.warn("Could not load materials from storage:", err);
    }
  }, []);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setUploadNotice(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      const topics = data.topics || [];
      const newId = `doc-${Date.now()}`;

      const newItem: MaterialItem & { text?: string; topics?: any[] } = {
        id: newId,
        name: data.title || data.name,
        type: file.type.includes("pdf") ? "pdf" : "image",
        pages: data.pageCount || 1,
        topicsCount: topics.length || 3,
        mastery: 20,
        uploadedAt: "Just now",
        lastStudied: "Just now",
        status: "ready",
        text: data.text || "",
        topics: topics,
      };

      setMaterials((prev) => {
        const updated = [newItem, ...prev];
        try {
          localStorage.setItem("learnmate_materials", JSON.stringify(updated));
          // Store specific material text & topics for workspace access
          localStorage.setItem(`learnmate_doc_${newId}`, JSON.stringify(newItem));
        } catch (e) {
          console.warn("Storage quota exceeded:", e);
        }
        return updated;
      });

      setUploadNotice(
        `Successfully processed "${data.title || file.name}"! Discovered ${topics.length} topics.`
      );
    } catch (err: any) {
      setUploadNotice(err.message || "Upload failed. Please try a text PDF or image under 12 MB.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id: string) => {
    setMaterials((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      try {
        localStorage.setItem("learnmate_materials", JSON.stringify(updated));
        localStorage.removeItem(`learnmate_doc_${id}`);
      } catch (e) {}
      return updated;
    });
  };

  const filtered = materials.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || m.type === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-8">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xs font-semibold uppercase tracking-wider text-violet-bright">Document Ingestion</span>
            <span className="w-1.5 h-1.5 rounded-full bg-mint" />
            <span className="text-2xs text-muted">PDF & Image OCR</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">My Study Library</h1>
          <p className="text-xs text-muted mt-1">Manage and inspect all uploaded documents, slides, and notes.</p>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn-primary rounded-xl px-4 py-2.5 text-xs font-semibold flex items-center gap-2 shadow-glow-sm"
        >
          <Upload size={14} />
          <span>Upload PDF or Image</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
        />
      </div>

      {/* Upload notice */}
      {uploadNotice && (
        <div className="p-3.5 rounded-xl bg-violet-dim/20 border border-violet/30 text-violet-bright text-xs flex items-center gap-2">
          <Sparkles size={16} />
          <span>{uploadNotice}</span>
        </div>
      )}

      {/* ── Drag & Drop Upload Zone ───────────────────────────── */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="p-8 rounded-3xl border-2 border-dashed border-line hover:border-violet/60 bg-surface/40 hover:bg-surface/70 transition-all text-center cursor-pointer space-y-3"
      >
        <div className="w-12 h-12 rounded-2xl bg-violet/10 border border-violet/20 text-violet-bright flex items-center justify-center mx-auto">
          {uploading ? <RefreshCw size={24} className="animate-spin" /> : <Upload size={24} />}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">
            {uploading ? "Extracting text and topics with Gemini AI..." : "Drop PDF or image files to upload"}
          </h3>
          <p className="text-xs text-muted max-w-md mx-auto mt-1">
            Supports text and scanned PDFs, PNG, JPG, and WEBP up to 20 pages (12 MB max).
          </p>
        </div>
      </div>

      {/* ── Search & Filter Controls ──────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-panel border border-line">
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents by name..."
            className="input-base pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-2xs text-muted font-medium flex items-center gap-1">
            <Filter size={12} /> Filter:
          </span>
          {(["all", "pdf", "image"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all uppercase text-2xs ${
                filterType === t
                  ? "bg-violet text-white shadow-sm"
                  : "bg-surface border border-line text-slate-400 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── Materials List / Cards ────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((mat) => {
          const isPdf = mat.type === "pdf";

          return (
            <Card key={mat.id} className="p-5 flex flex-col justify-between hover:border-slate-700 transition-all">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-surface border border-line text-violet">
                      {isPdf ? <FileText size={18} /> : <ImageIcon size={18} />}
                    </div>
                    <div>
                      <span className="text-2xs text-muted uppercase font-bold tracking-wider">
                        {isPdf ? `${mat.pages} Pages` : "Image Note"} &bull; {mat.topicsCount} Topics
                      </span>
                      <h3 className="text-sm font-bold text-white line-clamp-1">{mat.name}</h3>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(mat.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10"
                    title="Delete material"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Mastery progress */}
                <div className="space-y-1.5 my-3">
                  <div className="flex justify-between text-2xs">
                    <span className="text-muted">Mastery Retention:</span>
                    <span className="font-mono font-bold text-white">{mat.mastery}%</span>
                  </div>
                  <div className="w-full bg-line rounded-full h-1.5">
                    <div className="bg-gradient-to-r from-violet to-mint h-1.5 rounded-full" style={{ width: `${mat.mastery}%` }} />
                  </div>
                </div>

                <div className="flex items-center gap-4 text-2xs text-muted mt-3 pt-3 border-t border-line/60">
                  <span>Uploaded: {mat.uploadedAt}</span>
                  <span>&bull;</span>
                  <span>Studied: {mat.lastStudied}</span>
                </div>
              </div>

              <div className="pt-4 mt-2 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Link href={`/practice?materialId=${mat.id}`}>
                    <Button size="sm" className="w-full justify-center text-xs">
                      <span>Take Quiz</span>
                    </Button>
                  </Link>
                  <Link href={`/visuals?topic=${encodeURIComponent(mat.name)}`}>
                    <Button variant="secondary" size="sm" className="w-full justify-center text-xs">
                      <span>3D Model</span>
                    </Button>
                  </Link>
                </div>
                <Link href={`/library/${mat.id}`}>
                  <Button variant="outline" size="sm" className="w-full justify-between text-xs">
                    <span>Open Learning Workspace</span>
                    <ChevronRight size={14} />
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
