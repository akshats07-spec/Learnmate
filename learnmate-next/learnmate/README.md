# 🎓 LearnMate: AI-Powered Autonomous Learning & Revision SaaS

LearnMate is a production-oriented AI education SaaS that converts study materials (PDFs, images, notes) into structured topic trees, grounded AI explanations, interactive 3D visual aids, diagnostic quizzes, and personalized 3-day revision plans.

---

## 🌟 Key Capabilities

1. **Multimodal Ingestion**: Supports text and scanned PDFs, PNG, JPG, and WEBP notes up to 20 pages (12 MB limit) with page-level reference tracking.
2. **Grounded AI Tutor**: Answers student questions strictly from uploaded content with citation badges (`Page 2`). Flags unmentioned concepts with a strict **Hallucination Guard**.
3. **3D Educational Visuals**: Automatically generates 3D spatial concepts, cutaway models, step-by-step breakdowns, and cognitive analogies for complex scientific and engineering topics.
4. **Diagnostic Quizzes & Gap Analysis**: 5-question conceptual diagnostic assessments that isolate specific student misconceptions.
5. **Adaptive 3-Day Revision Plans**: Spaced repetition schedules prioritized by diagnosed weak topics, with targeted practice questions and step-by-step solutions.
6. **INR Subscription Tiers**:
   - **Starter** (₹500/month): 10 docs/mo, 100 AI tutor queries, 10 3D visuals.
   - **Pro** (₹1,000/month — Most Popular): 50 docs/mo, 500 AI tutor queries, 50 3D visuals, full analytics.
   - **Ultra** (₹1,500/month): Unlimited docs, queries, and visuals with priority queueing.
7. **Production-Ready Tech Stack**: Next.js 14 App Router, TypeScript, Tailwind CSS, Google Gemini 2.0 Flash (`@google/generative-ai`), Supabase PostgreSQL with RLS, and Razorpay INR billing abstraction.

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Add your **Google Gemini API Key** from [Google AI Studio](https://aistudio.google.com/):
```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.0-flash
```

*(Optional)* Configure **Supabase** for database persistence and authentication:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

*(Optional)* Configure **Razorpay** for Indian Rupee subscription payments:
```env
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
```

### 3. Launch Development Server
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## 📂 Project Architecture

```
learnmate/
├── src/
│   ├── app/
│   │   ├── page.tsx               # Public marketing landing page
│   │   ├── pricing/page.tsx       # Pricing & 3-tier INR comparison
│   │   ├── login/page.tsx         # User authentication login
│   │   ├── signup/page.tsx        # User registration with plan selection
│   │   ├── forgot-password/page.tsx# Password reset flow
│   │   ├── onboarding/page.tsx    # 3-step personalized student setup
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx         # Dashboard shell with sidebar
│   │   │   ├── dashboard/page.tsx # Overview KPIs, streak & mastery
│   │   │   ├── library/page.tsx   # PDF & image upload library
│   │   │   ├── library/[id]/page.tsx # Topic workspace & citations
│   │   │   ├── visuals/page.tsx   # 3D visual learning gallery
│   │   │   ├── tutor/page.tsx     # Grounded AI tutor chat
│   │   │   ├── practice/page.tsx  # Diagnostic quizzes & feedback
│   │   │   ├── revision/page.tsx  # 3-day spaced revision planner
│   │   │   ├── progress/page.tsx  # Longitudinal mastery charts
│   │   │   ├── billing/page.tsx   # Razorpay subscription management
│   │   │   └── settings/page.tsx  # Profile & data management
│   │   └── api/
│   │       ├── upload/route.ts    # PDF & image OCR extraction
│   │       ├── learn/route.ts     # Gemini grounded tutor & quizzes
│   │       ├── visuals/route.ts   # 3D visual concept generation
│   │       └── billing/
│   │           ├── checkout/route.ts # Razorpay order creation
│   │           └── webhook/route.ts  # Signature verification
│   ├── components/
│   │   ├── ui/                    # Reusable design system (Button, Card, Badge, Input)
│   │   ├── nav/                   # MarketingNav, MarketingFooter, DashboardSidebar
│   │   └── auth/                  # AuthProvider (Supabase SSR)
│   └── lib/
│       ├── demo.ts                # Built-in high-yield demo coursework
│       ├── plans.ts               # Subscription plan definitions & pricing
│       ├── types.ts               # Complete TypeScript data schemas
│       ├── supabase.ts            # Browser & admin Supabase clients
│       └── supabase-server.ts     # Server-side cookie SSR helper
├── supabase/
│   └── schema.sql                 # Complete PostgreSQL schema with RLS
└── tailwind.config.ts             # Custom dark design system tokens
```
