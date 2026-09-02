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

export type QuestionType = "SINGLE_CHOICE" | "FREE_TEXT" | "SCALE";
export type QuestionStage =
  | "INITIAL_DECISION"
  | "JUSTIFICATION"
  | "INITIAL_CONFIDENCE"
  | "ALMOMKIN_ANALYSIS"
  | "FINAL_DECISION"
  | "FINAL_CONFIDENCE"
  | "ALMOMKIN_HELPED";

// ============================================================
// REUSABLE QUESTION DATA
// ============================================================

export interface QuestionData {
  id: string;
  text: string;
  order: number;
  type: QuestionType;
  stage: QuestionStage;
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
  totalCases: number;
  cases: Array<{
    sessionId: string;
    studyCase: StartSessionResponse["studyCase"];
    questions: QuestionData[];
  }>;
  studyCase: {
    id: string;
    title: string;
    content: string; // content for the assigned group
    newInformation: string | null;
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
  | "information"
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
  responseText?: string;
  responseId?: string;
  questionShownAt?: string;
  decisionTimeMs?: number;
  confidenceScore?: number;
  cases: StartSessionResponse["cases"];
  currentCaseIndex: number;
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
  journey: {
    initialConfidence: number;
    finalConfidence: number;
    changedDecisions: number;
    comparableDecisions: number;
    helpedYes: number;
    helpedPartially: number;
    helpedNo: number;
  };
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
