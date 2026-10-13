export type NavTab = 
  | 'landing'
  | 'dashboard'
  | 'roadmap'
  | 'setup'
  | 'live-session'
  | 'report'
  | 'resume-analyzer'
  | 'question-bank'
  | 'communication'
  | 'aptitude'
  | 'company-oa'
  | 'tpo-portal'
  | 'certificates'
  | 'p2p-room'
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
  onboardingCompleted?: boolean;
  onboardingCompletedAt?: string;
  onboardingStep?: number;
  interviewDate?: string;
  interviewDatePreset?: string;
  targetCompany?: string;
  resumeUrl?: string;
  aptitudeAccuracy?: number;
}

export interface StudyPlanTask {
  id: number;
  week_number: number;
  day_number: number;
  title: string;
  session_type: 'fundamentals' | 'dsa' | 'system_design' | 'star_behavioral' | 'mock_interview';
  sessions_count: number;
  status: 'pending' | 'done';
  completed_at?: string;
}

export interface StudyPlan {
  role: string;
  experience_level: string;
  weeks_count: number;
  days_until_interview?: number;
  interview_date?: string;
  total_sessions: number;
  remaining_monthly_sessions: number;
  quota_capped: boolean;
  quota_warning?: string;
  tasks: StudyPlanTask[];
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
  adaptive_followup_question?: string;
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
  technical_score?: number;
  communication_score?: number;
  behavioral_score?: number;
  confidence_score?: number;
  duration_minutes?: number;
  question_count?: number;
  strengths?: string[];
  improvements?: string[];
  average_wpm?: number;
  total_fillers?: number;
  questions?: any[];
}

export interface RoadmapResource {
  title: string;
  url: string;
  type: string;
}

export interface RoadmapQuizQuestion {
  question: string;
  options: string[];
  answer_index: number;
  explanation: string;
}

export interface RoadmapTopic {
  id: number;
  phase_id: number;
  topic_order: number;
  title: string;
  description: string;
  learning_objectives?: string[];
  prerequisites?: string[];
  key_concepts?: string;
  exercises?: string[];
  resources?: (RoadmapResource | string)[];
  assessment_quiz?: (RoadmapQuizQuestion | any)[];
  practical_link_tab?: string;
  practical_action_label?: string;
  status: 'not_started' | 'in_progress' | 'completed';
  quiz_score?: number | null;
  is_verified?: boolean;
  completed_at?: string | null;
}

export interface RoadmapPhase {
  id: number;
  roadmap_id: number;
  phase_order: number;
  title: string;
  purpose: string;
  estimated_weeks: number;
  milestone_project?: string;
  is_completed: boolean;
  topics: RoadmapTopic[];
  completed_topics_count: number;
  total_topics_count: number;
  progress_percentage: number;
}

export interface CareerRoadmap {
  id: number;
  user_id: number;
  domain: string;
  skill_level: string;
  target_role: string;
  study_time_daily: string;
  learning_preference: string;
  target_date?: string | null;
  overall_progress: number;
  status: string;
  phases: RoadmapPhase[];
  total_phases: number;
  total_topics: number;
  completed_topics: number;
  current_phase_title?: string;
  next_recommended_topic?: RoadmapTopic | null;
}

export interface RoadmapRecommendation {
  roadmap_id: number;
  recommended_topic: RoadmapTopic | null;
  phase_title?: string | null;
  reason: string;
  prerequisites_met: boolean;
  missing_prerequisites: string[];
}
