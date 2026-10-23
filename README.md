# 🏆 LearnMate: Turn Study Materials into Personalised Learning
### *Google AI Hackathon — Flagship Submission*

[![Gemini 3.8 Flash](https://img.shields.io/badge/Gemini-3.8%20Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://aistudio.google.com/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/SQLite-Tracking-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org/)

---

## 📌 Problem Statement & Solution

**The Problem**:
Students often possess abundant textbooks, lecture slides, and notes, yet face two immense challenges:
1. They cannot pinpoint *what* specific concepts they do not understand.
2. They do not know *how* to prioritize what to study next.

**LearnMate's Solution**:
LearnMate is an AI-powered personalized learning companion that ingests course materials (PDF or text up to 20 pages), explains concepts with verifiable page citations, diagnoses misconceptions through a targeted diagnostic quiz, and automatically synthesizes a **personalized, adaptive 3-day revision plan** with targeted follow-up practice.

---

## ✨ Hackathon Requirements & Feature Matrix

| Minimum & Scope Requirement | LearnMate Implementation | Status |
|---|---|---|
| **Accept PDF or pasted study material** | Drag-and-drop PDF extraction with page segmentation + instant text paste + 1-click sample loaders | ✅ Completed |
| **Explain concepts with page/passage citations** | High-level synthesis, key concepts with direct quotes, page references (`[Page 2, Section 1]`), and intuitive analogies | ✅ Completed |
| **Generate diagnostic quiz & diagnose weak topics** | 5 high-yield MCQs with instant feedback; pedagogical analysis pinpointing exact student misconceptions | ✅ Completed |
| **Personalised revision plan & follow-up practice** | 3-day spaced repetition schedule, priority ranking (High/Medium/Low), and 3 targeted practice questions with step-by-step solutions | ✅ Completed |
| **Save quiz results & show progress across attempts** | Longitudinal attempt audit log, score growth trajectory (+40% to 100% mastery), persistent SQLite storage | ✅ Completed |
| **Indicate when answer is unavailable** | Grounded Q&A Assistant with strict **Hallucination Guard** flagging `⚠️ Unavailable in uploaded material` | ✅ Completed |
| **Optional Extension: Hindi Explanations** | One-click bilingual toggle translating concepts and audio overviews into natural Hindi / Hinglish | ✅ Completed |
| **Optional Extension: Spoken Revision Summaries** | NotebookLM-style 2-Minute conversational podcast dialogue with interactive speaker controls & audio player | ✅ Completed |
| **Hackathon Winning Extra: Flashcards** | 3D interactive flip flashcard deck powered by Leitner spaced repetition for active recall | ✅ Completed |

---

## 🚀 Quick Start (Demo in 30 Seconds)

### Option A: Run the Frontend (Zero Setup / Instant Demo Mode)
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser. 
> The app comes pre-loaded with **Biology Chapter 7: Cellular Respiration** (5 pages). You can immediately test the diagnostic quiz, review the adaptive revision plan, play the 2-minute audio podcast, or upload any new PDF!

### Option B: Run the Python FastAPI Backend
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Add your GEMINI_API_KEY from https://aistudio.google.com/
python run.py
```
- API Server: `http://localhost:8000`
- Interactive Swagger UI: `http://localhost:8000/docs`

---

## 👥 How Teammates Can Use Google Antigravity to Work on the Backend

We structured this repository so any team member can open it in **Antigravity** and extend backend capabilities effortlessly.

### How to Collaborate with Antigravity:
1. Open the project root in the Antigravity IDE.
2. Refer to [`TEAMMATE_BACKEND_GUIDE.md`](./TEAMMATE_BACKEND_GUIDE.md) for full endpoint specifications.
3. Use the ready-to-run Antigravity prompt recipes below.

### Antigravity Prompt Recipes for Teammates:

#### 1. Adding User Authentication (JWT)
> *"Antigravity, please add user authentication to `backend/main.py` using JWT and bcrypt. Add a `users` table to `backend/database.py`, register/login endpoints, and associate each quiz attempt with the logged-in student."*

#### 2. Scaling to 100+ Page Textbooks (RAG + Vector Search)
> *"Antigravity, implement a RAG pipeline in `backend/rag_service.py` using `gemini-embedding-2` from the `google-genai` SDK. When documents exceed 20 pages, chunk the text and retrieve top-5 relevant passages for `explain_concept` and `answer_grounded_question`."*

#### 3. Real-Time Gemini Live Audio WebSocket
> *"Antigravity, add a WebSocket endpoint `/ws/live-tutor` in `backend/main.py` using the Gemini Live API to enable two-way voice conversation between the student and LearnMate."*

#### 4. Cloud Run Deployment
> *"Antigravity, generate a production `Dockerfile` and `cloudbuild.yaml` in `backend/` to deploy our FastAPI backend to Google Cloud Run."*

---

## 🏗️ Project Architecture

```
.
├── frontend/                     # Modern React 19 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/           # Modular UI Components
│   │   │   ├── Header.tsx        # Navigation, Language & Connection Mode Switcher
│   │   │   ├── DocumentUpload.tsx# Drag-and-Drop PDF & Pasted Ingestion Engine
│   │   │   ├── ConceptExplainer.tsx # Grounded Explanations with Page Citations
│   │   │   ├── DiagnosticQuiz.tsx# MCQ Assessment & Confetti Celebration
│   │   │   ├── RevisionPlanView.tsx # 3-Day Spaced Repetition & Follow-Up Practice
│   │   │   ├── ProgressAnalytics.tsx# Score Growth & Historical Attempt Tracking
│   │   │   ├── AudioRevisionPlayer.tsx # NotebookLM-Style 2-Min Spoken Overview
│   │   │   ├── GroundedTutorChat.tsx# Hallucination-Guarded Q&A
│   │   │   ├── FlashcardsDeck.tsx# 3D Flip Active Recall Cards
│   │   │   └── SettingsModal.tsx # API Keys & Backend URL Config
│   │   ├── services/
│   │   │   ├── apiService.ts     # Tri-Mode Client (Backend, Direct Gemini, Demo)
│   │   │   └── sampleData.ts     # Pre-loaded 5-Page Biology Material & Data
│   │   ├── types/                # TypeScript Data Contracts
│   │   ├── App.tsx               # Main Learning Journey Flow
│   │   └── main.tsx              # Application Entrypoint
│   └── package.json
│
├── backend/                      # Production Python 3.12 + FastAPI Backend
│   ├── config.py                 # Configuration & Environment Variables
│   ├── database.py               # SQLite Database (Materials, Quizzes, Attempts, Plans)
│   ├── gemini_service.py         # Official Google GenAI SDK (gemini-3.8-flash)
│   ├── main.py                   # REST API Endpoints with PyPDF & CORS
│   ├── run.py                    # Server Entrypoint
│   └── requirements.txt          # Python Dependencies
│
├── TEAMMATE_BACKEND_GUIDE.md     # Dedicated Antigravity Collaboration Guide
└── README.md                     # Hackathon Documentation
```

---

## 🎯 24-Hour Hackathon Demo Script (Follow This to Win!)

1. **Step 1: Ingestion**: Open the app. Point out that a 5-page chapter on *Cellular Respiration* is already loaded. Demonstrate uploading a new PDF or pasting text.
2. **Step 2: Grounded Explanations**: Click **"Concepts & Citations"**. Show how each concept has an exact page reference (`[Page 2, Section 1.3]`), a direct passage quote, an intuitive real-world analogy, and click **"Translate to हिन्दी"** to demonstrate multilingual support. Click the speaker icon to play spoken explanations.
3. **Step 3: Diagnostic Quiz**: Click **"Diagnostic Quiz"**. Take the 5 questions. Intentionally answer Question 3 (Krebs cycle) and Question 5 (Complex II vs I) incorrectly. Click **"Submit & Diagnose Weaknesses"**.
4. **Step 4: Weakness Diagnosis & Revision Plan**: Show the immediate diagnosis: LearnMate pinpointed the exact misconception (Complex II bypassing Complex I) and referenced Pages 4 and 5. Click **"Personalised Plan"** to reveal the 3-day spaced revision schedule and solve the 3 follow-up targeted questions.
5. **Step 5: Progress Growth**: Click **"Progress & History"**. Demonstrate how score improved across attempts (Attempt 1: 40% -> Attempt 2: 60% -> Attempt 3: 100%) and how weak spots disappeared.
6. **Step 6: Audio Overview**: Click **"Audio Overview"** and hit Play to listen to the 2-minute NotebookLM-style dialogue.
7. **Step 7: Grounded Q&A**: Ask: *"Explain photosynthesis"*. Show the prominent warning: **"⚠️ Unavailable in uploaded material"** — proving zero hallucinations! Then ask: *"What is the role of Oxygen?"* and show the exact citation from Page 4.
