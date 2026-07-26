export type NavTab = 
  | 'landing'
  | 'dashboard'
  | 'setup'
  | 'live-session'
  | 'rapid-practice'
  | 'report'
  | 'resume-analyzer'
  | 'question-bank'
  | 'communication'
  | 'aptitude'
  | 'company-oa'
  | 'tpo-portal'
  | 'certificates'
  | 'p2p-room'
  | 'salary-negotiation'
  | 'company-cheatsheets'
  | 'history'
  | 'profile'
  | 'admin';

export type InterviewerPersona = 
  | 'coach' 
  | 'strict' 
  | 'bar_raiser'
  | 'strict-tech-lead'
  | 'friendly-hr'
  | 'faang-engineer'
  | 'system-architect';

export interface VisualBodyLanguageMetrics {
  eyeContactScore: number;
  blinkRatePerMin: number;
  headTiltAngle: number;
  composureStatus: string;
  postureStatus: string;
  visualConfidenceIndex: number;
  warnings: string[];
}

export interface ProctoringViolationLog {
  timestamp: string;
  type: 'tab_switch' | 'window_blur' | 'copy_paste' | 'cam_offline' | 'audio_noise';
  details: string;
}


export interface UserProfile {
  id: number;
  email: string;
  username: string;
  fullName: string;
  targetRole: string;
  experienceLevel: string;
  readinessScore: number;
  totalInterviews: number;
  streakDays: number;
  xpPoints: number;
  planTier?: 'FREE STARTER' | 'PRO UNLIMITED';
  sessionsLeft?: number;
  monthlyQuota?: number;
}

export interface QuestionItem {
  id: number;
  question_order: number;
  category: string;
  question_text: string;
  expected_keywords?: string[];
  ideal_answer?: string;
  code_template?: string;
}

export interface InterviewSession {
  id: number;
  title: string;
  role: string;
  company: string;
  difficulty: string;
  interviewType: string;
  persona?: InterviewerPersona;
  questions: QuestionItem[];
  currentQuestionIndex: number;
  overallScore?: number;
  technicalScore?: number;
  communicationScore?: number;
  hiringRecommendation?: string;
}

export interface EvaluationResult {
  question_id: number;
  score: number;
  technical_accuracy: number;
  clarity_score: number;
  star_method_score: number;
  strengths: string[];
  improvements: string[];
  model_answer: string;
  filler_words_detected: number;
  wpm: number;
}

export interface PastInterviewItem {
  id: number;
  title: string;
  role: string;
  company: string;
  difficulty: string;
  interview_type: string;
  overall_score: number;
  hiring_recommendation: string;
  status: string;
  created_at: string;
}
