import os
import json
from typing import Dict, Any, List, Optional
from google import genai
from google.genai import types
from config import GEMINI_API_KEY, GEMINI_MODEL

def get_client() -> genai.Client:
    api_key = GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY", "")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set. Please set it in backend/.env or your environment.")
    return genai.Client(api_key=api_key)

# 1. Concept Explanations with Page References & Hindi/English Toggle
def explain_concept(
    material_text: str,
    concept: Optional[str] = None,
    language: str = "english"
) -> Dict[str, Any]:
    client = get_client()
    
    lang_instruction = (
        "Provide explanations in clear Hindi with English technical terms in brackets (Hinglish/Devanagari friendly for Indian students)."
        if language.lower() in ["hindi", "hinglish"]
        else "Provide explanations in simple, clear, engaging English."
    )
    
    prompt = f"""
You are LearnMate, an award-winning personalized AI learning tutor.
Study Material Context:
\"\"\"
{material_text[:25000]}
\"\"\"

Task:
Explain the {"concept: " + concept if concept else "core concepts of this study material"} in simple, easy-to-understand language.
Requirements:
1. Break down complex terminology into intuitive analogies.
2. Provide grounded citations with exact page numbers or section titles referenced in the text.
3. {lang_instruction}
4. Format output strictly as JSON matching this schema:
{{
  "title": "string",
  "summary": "string",
  "key_concepts": [
    {{
      "concept": "string",
      "explanation": "string",
      "page_reference": "string (e.g. Page 2, Section 1.3)",
      "quote_or_passage": "string (direct quote from material proving this)",
      "analogy": "string (simple real-life analogy)"
    }}
  ],
  "quick_takeaway": "string",
  "hindi_translation_note": "string (brief bilingual note if applicable)"
}}
"""
    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.3
        )
    )
    return json.loads(response.text)

# 2. Generate Diagnostic Quiz
def generate_quiz(material_text: str, num_questions: int = 5) -> Dict[str, Any]:
    client = get_client()
    
    prompt = f"""
You are an expert diagnostic exam designer for LearnMate.
Study Material:
\"\"\"
{material_text[:25000]}
\"\"\"

Generate a diagnostic quiz of {num_questions} high-yield multiple-choice questions covering different sub-topics of the material.
Ensure questions test conceptual understanding rather than trivial memorization.
Every question MUST cite the specific page/passage from the material.

Output strictly valid JSON with this schema:
{{
  "quiz_title": "string",
  "questions": [
    {{
      "id": 1,
      "question": "string",
      "topic": "string (specific subtopic)",
      "options": ["string", "string", "string", "string"],
      "correct_answer_index": 0,
      "explanation": "string",
      "page_reference": "string (e.g. Page 3, Paragraph 2)"
    }}
  ]
}}
"""
    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.2
        )
    )
    return json.loads(response.text)

# 3. Evaluate Quiz Answers & Identify Weak Topics
def evaluate_quiz(
    material_text: str,
    questions: List[Dict[str, Any]],
    user_answers: List[int]
) -> Dict[str, Any]:
    client = get_client()
    
    score = 0
    weak_topics = []
    evaluation_items = []
    
    for idx, q in enumerate(questions):
        user_choice = user_answers[idx] if idx < len(user_answers) else -1
        is_correct = (user_choice == q["correct_answer_index"])
        if is_correct:
            score += 1
        else:
            weak_topics.append({
                "topic": q.get("topic", "General"),
                "question": q["question"],
                "student_answer": q["options"][user_choice] if 0 <= user_choice < len(q["options"]) else "Skipped",
                "correct_answer": q["options"][q["correct_answer_index"]],
                "page_reference": q.get("page_reference", "Uploaded text")
            })
            
        evaluation_items.append({
            "question_id": q.get("id", idx + 1),
            "is_correct": is_correct,
            "user_choice": user_choice,
            "correct_choice": q["correct_answer_index"],
            "explanation": q.get("explanation", ""),
            "topic": q.get("topic", "General")
        })

    # Call Gemini to provide diagnostic synthesis and actionable feedback
    prompt = f"""
A student just completed a diagnostic quiz on this material.
Material Context:
\"\"\"
{material_text[:15000]}
\"\"\"

Quiz Results:
Total Questions: {len(questions)}
Score: {score}/{len(questions)}
Wrong Questions & Weak Topics:
{json.dumps(weak_topics, indent=2)}

Task:
Analyze the student's misconceptions based on the incorrect answers.
Provide:
1. Pinpointed weak topics with why the student got confused.
2. Specific pages/passages from the material they must re-read.
3. Encouraging, targeted pedagogical feedback.

Return JSON matching:
{{
  "score": {score},
  "total": {len(questions)},
  "percentage": {round((score / len(questions)) * 100, 1) if questions else 0},
  "diagnosis_summary": "string",
  "weak_topics_analysis": [
    {{
      "topic": "string",
      "misconception": "string",
      "recommended_review": "string",
      "page_reference": "string"
    }}
  ],
  "immediate_advice": "string"
}}
"""
    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.3
        )
    )
    result = json.loads(response.text)
    result["detailed_evaluations"] = evaluation_items
    return result

# 4. Generate Personalized Revision Plan & Follow-Up Practice Questions
def generate_personalized_revision_plan(
    material_text: str,
    weak_topics: List[Dict[str, Any]],
    language: str = "english"
) -> Dict[str, Any]:
    client = get_client()
    
    prompt = f"""
You are the adaptive study coach for LearnMate.
Material Context:
\"\"\"
{material_text[:20000]}
\"\"\"

Student's Diagnosed Weak Topics:
{json.dumps(weak_topics, indent=2)}

Task:
Create a highly personalized, targeted revision plan and follow-up practice questions focused strictly on fixing the student's weak areas.

Requirements:
1. Prioritized 3-Step Study Plan (High Priority, Medium Priority, Consolidate).
2. Spaced revision schedule (Day 1, Day 2, Day 3).
3. Follow-up targeted practice questions (3 questions) specifically addressing the weak topics with step-by-step solutions and page references.
4. Language: {"Hindi / Hinglish" if language.lower() in ["hindi", "hinglish"] else "English"}.

Output strictly valid JSON with this schema:
{{
  "plan_title": "string",
  "priority_focus_areas": [
    {{
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "topic": "string",
      "action_item": "string",
      "pages_to_review": "string",
      "key_rule_to_remember": "string"
    }}
  ],
  "spaced_schedule": [
    {{
      "day": "Day 1 (Immediate)",
      "focus": "string",
      "duration_minutes": 20,
      "checklist": ["string", "string"]
    }},
    {{
      "day": "Day 2 (Active Recall)",
      "focus": "string",
      "duration_minutes": 15,
      "checklist": ["string", "string"]
    }},
    {{
      "day": "Day 3 (Mastery Check)",
      "focus": "string",
      "duration_minutes": 10,
      "checklist": ["string"]
    }}
  ],
  "followup_practice_questions": [
    {{
      "id": 101,
      "targeted_weak_topic": "string",
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correct_answer_index": 0,
      "step_by_step_solution": "string",
      "page_reference": "string"
    }}
  ]
}}
"""
    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.3
        )
    )
    return json.loads(response.text)

# 5. Spoken Revision Summary (NotebookLM style Audio / Script Overview)
def generate_spoken_summary(
    material_text: str,
    weak_topics: Optional[List[str]] = None,
    language: str = "english"
) -> Dict[str, Any]:
    client = get_client()
    
    lang_desc = "Hindi conversational style" if language.lower() in ["hindi", "hinglish"] else "Engaging, conversational English podcast/audio style"
    
    prompt = f"""
You are the host of LearnMate Audio Overview, an interactive audio learning companion similar to Google NotebookLM.
Study Material:
\"\"\"
{material_text[:20000]}
\"\"\"
Weak topics to emphasize: {weak_topics or 'Comprehensive overview'}
Language Style: {lang_desc}

Task:
Generate a spoken revision audio script that a student can listen to while commuting or revising.
Format as a conversational 2-minute dialogue between two friendly tutors (Alex and Sam) or a charismatic solo mentor.
Include timestamp markers and key memory hooks.

Output valid JSON:
{{
  "title": "string",
  "duration_seconds": 120,
  "style": "string",
  "spoken_script": "string (full text ready for text-to-speech)",
  "audio_segments": [
    {{
      "speaker": "string",
      "time_range": "0:00 - 0:30",
      "text": "string",
      "key_point": "string"
    }}
  ],
  "memory_mnemonic": "string"
}}
"""
    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.4
        )
    )
    return json.loads(response.text)

# 6. Strictly Grounded Q&A Chat with Out-Of-Scope Detection
def answer_grounded_question(
    material_text: str,
    question: str,
    language: str = "english"
) -> Dict[str, Any]:
    client = get_client()
    
    prompt = f"""
You are LearnMate Grounded Assistant.
You have strict instructions to answer questions ONLY using facts stated in the provided Study Material.

Study Material:
\"\"\"
{material_text[:25000]}
\"\"\"

Student's Question:
\"{question}\"

CRITICAL INSTRUCTION:
Check if the answer is contained in or directly inferred from the study material above.
- IF NOT CONTAINED or UNAVAILABLE: Set `is_out_of_scope` to true, and explain clearly: "⚠️ This information is not available in your uploaded study material."
- IF CONTAINED: Set `is_out_of_scope` to false, give a clear concise answer, and cite the exact page/section reference and quote.

Output JSON:
{{
  "is_out_of_scope": boolean,
  "answer": "string",
  "page_reference": "string or null",
  "quoted_evidence": "string or null",
  "suggested_questions": ["string", "string"]
}}
"""
    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.1
        )
    )
    return json.loads(response.text)
