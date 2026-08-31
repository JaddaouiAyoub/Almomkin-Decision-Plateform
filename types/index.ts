// ============================================================
// SHARED TYPES FOR ALMOMKIN TEST V1
// ============================================================

export type GroupLabel = "A" | "B";

export type SessionStatus =
  | "STARTED"
  | "CASE_SHOWN"
  | "QUESTION_SHOWN"
  | "ANSWERED"
  | "COMPLETED";

// ============================================================
// REUSABLE QUESTION DATA
// ============================================================

export interface QuestionData {
  id: string;
  text: string;
  order: number;
  options: {
    id: string;
    label: string;
    text: string;
    order: number;
  }[];
}

// ============================================================
// API RESPONSE TYPES
// ============================================================

export interface StartSessionResponse {
  participantId: string;
  sessionId: string;
  studyCase: {
    id: string;
    title: string;
    content: string; // content for the assigned group
  };
  questions: QuestionData[];
}

export interface QuestionShownResponse {
  questionShownAt: string; // ISO string
}

export interface SubmitDecisionResponse {
  responseId: string;
  decisionTimeMs: number;
}

export interface ConfidenceResponse {
  success: boolean;
}

// ============================================================
// TEST FLOW STATE
// ============================================================

export type TestStep =
  | "landing"
  | "case"
  | "question"
  | "confidence"
  | "completed";

export interface TestState {
  step: TestStep;
  participantId?: string;
  sessionId?: string;
  studyCase?: {
    id: string;
    title: string;
    content: string;
  };
  questions: QuestionData[];
  currentQuestionIndex: number;
  selectedOptionId?: string;
  responseId?: string;
  questionShownAt?: string;
  decisionTimeMs?: number;
  confidenceScore?: number;
}

// ============================================================
// ADMIN STATISTICS TYPES
// ============================================================

export interface AnswerDistItem {
  optionId: string;
  label: string;
  text: string;
  count: number;
  percentage: number;
}

export interface PerQuestionStats {
  questionId: string;
  questionText: string;
  questionOrder: number;
  caseTitle: string;
  totalResponses: number;
  groupA: {
    avgDecisionTimeMs: number;
    avgConfidence: number;
    answerDistribution: AnswerDistItem[];
  };
  groupB: {
    avgDecisionTimeMs: number;
    avgConfidence: number;
    answerDistribution: AnswerDistItem[];
  };
}

export interface GroupStats {
  groupId: string;
  groupLabel: GroupLabel;
  groupName: string;
  participantCount: number;
  responseCount: number;
  avgDecisionTimeMs: number;
  medianDecisionTimeMs: number;
  avgConfidence: number;
  answerDistribution: AnswerDistItem[];
}

export interface OverallStats {
  totalParticipants: number;
  totalResponses: number;
  completedSessions: number;
  completionRate: number;
  avgDecisionTimeMs: number;
  avgConfidence: number;
  groupA: GroupStats;
  groupB: GroupStats;
  perQuestion: PerQuestionStats[];
}

// ============================================================
// ADMIN TABLE TYPES
// ============================================================

export interface ResultRow {
  responseId: string;
  participantId: string;
  sessionId: string;
  groupLabel: string;
  groupName: string;
  caseTitle: string;
  questionOrder: number;
  questionText: string;
  answerLabel: string;
  answerText: string;
  decisionTimeMs: number;
  confidenceScore: number | null;
  createdAt: string;
}

// ============================================================
// CHART DATA TYPES
// ============================================================

export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface ABComparisonData {
  metric: string;
  groupA: number;
  groupB: number;
}
