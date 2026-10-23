export interface PageContent {
  page_number: number;
  text: string;
}

export interface StudyMaterial {
  id: string;
  title: string;
  rawText: string;
  pages: PageContent[];
  createdAt: string;
}

export interface KeyConcept {
  concept: string;
  explanation: string;
  page_reference: string;
  quote_or_passage: string;
  analogy: string;
}

export interface ConceptExplanation {
  title: string;
  summary: string;
  key_concepts: KeyConcept[];
  quick_takeaway: string;
  hindi_translation_note?: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  topic: string;
  options: string[];
  correct_answer_index: number;
  explanation: string;
  page_reference: string;
}

export interface WeakTopicAnalysis {
  topic: string;
  misconception: string;
  recommended_review: string;
  page_reference: string;
}

export interface DetailedEvaluation {
  question_id: number;
  is_correct: boolean;
  user_choice: number;
  correct_choice: number;
  explanation: string;
  topic: string;
}

export interface QuizEvaluation {
  score: number;
  total: number;
  percentage: number;
  diagnosis_summary: string;
  weak_topics_analysis: WeakTopicAnalysis[];
  immediate_advice: string;
  detailed_evaluations?: DetailedEvaluation[];
  attempt_id?: string;
}

export interface PriorityFocusArea {
  priority: "HIGH" | "MEDIUM" | "LOW";
  topic: string;
  action_item: string;
  pages_to_review: string;
  key_rule_to_remember: string;
}

export interface SpacedScheduleDay {
  day: string;
  focus: string;
  duration_minutes: number;
  checklist: string[];
}

export interface FollowupPracticeQuestion {
  id: number;
  targeted_weak_topic: string;
  question: string;
  options: string[];
  correct_answer_index: number;
  step_by_step_solution: string;
  page_reference: string;
}

export interface RevisionPlan {
  plan_title: string;
  priority_focus_areas: PriorityFocusArea[];
  spaced_schedule: SpacedScheduleDay[];
  followup_practice_questions: FollowupPracticeQuestion[];
}

export interface AudioSegment {
  speaker: string;
  time_range: string;
  text: string;
  key_point: string;
}

export interface AudioSummary {
  title: string;
  duration_seconds: number;
  style: string;
  spoken_script: string;
  audio_segments: AudioSegment[];
  memory_mnemonic: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  is_out_of_scope?: boolean;
  page_reference?: string | null;
  quoted_evidence?: string | null;
  suggested_questions?: string[];
  timestamp: string;
}

export interface AttemptRecord {
  id: string;
  quiz_id?: string;
  timestamp: string;
  score: number;
  total: number;
  percentage: number;
  weak_topics: string[];
}

export interface Flashcard {
  id: number;
  topic: string;
  front: string;
  back: string;
  page_reference: string;
  mastered: boolean;
}
