import { prisma } from "@/lib/prisma";

export interface ExportFilters {
  groupLabel?: string;
  studyCaseId?: string;
  startDate?: Date;
  endDate?: Date;
}

export type ExportRow = {
  participantId: string;
  sessionId: string;
  group: { label: string; name: string };
  studyCase: { id: string; title: string };
  question: { id: string; text: string; order: number };
  answerOption: { label: string; text: string };
  decisionTimeMs: number;
  confidenceScore: number | null;
  questionShownAt: Date;
  answeredAt: Date;
  createdAt: Date;
};

export function buildResultsCsv(rows: ExportRow[]): string {
  const headers = [
    "participant_id",
    "session_id",
    "group_label",
    "group_name",
    "case_id",
    "case_title",
    "question_order",
    "question_id",
    "question_text",
    "answer_label",
    "answer_text",
    "decision_time_ms",
    "decision_time_seconds",
    "confidence_score",
    "question_shown_at",
    "answered_at",
    "created_at",
  ];

  const csvRows = rows.map((r) => [
    r.participantId,
    r.sessionId,
    r.group.label,
    r.group.name,
    r.studyCase.id,
    `"${r.studyCase.title.replace(/"/g, '""')}"`,
    r.question.order,
    r.question.id,
    `"${r.question.text.replace(/"/g, '""')}"`,
    r.answerOption.label,
    `"${r.answerOption.text.replace(/"/g, '""')}"`,
    r.decisionTimeMs,
    (r.decisionTimeMs / 1000).toFixed(2),
    r.confidenceScore ?? "",
    r.questionShownAt.toISOString(),
    r.answeredAt.toISOString(),
    r.createdAt.toISOString(),
  ]);

  return [headers.join(","), ...csvRows.map((row) => row.join(","))].join("\n");
}

export async function exportResultsToCSV(
  filters: ExportFilters = {}
): Promise<string> {
  const where: Record<string, unknown> = {};

  if (filters.groupLabel) {
    where.group = { label: filters.groupLabel };
  }
  if (filters.studyCaseId) {
    where.studyCaseId = filters.studyCaseId;
  }
  if (filters.startDate || filters.endDate) {
    where.createdAt = {
      ...(filters.startDate && { gte: filters.startDate }),
      ...(filters.endDate && { lte: filters.endDate }),
    };
  }

  const responses = await prisma.response.findMany({
    where,
    include: {
      group: true,
      studyCase: true,
      question: true,
      answerOption: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return buildResultsCsv(
    responses.map((r) => ({
      participantId: r.participantId,
      sessionId: r.sessionId,
      group: { label: r.group.label, name: r.group.name },
      studyCase: { id: r.studyCaseId, title: r.studyCase.title },
      question: { id: r.questionId, text: r.question.text, order: r.question.order },
      answerOption: { label: r.answerOption?.label || "", text: r.answerOption?.text || r.responseText || "" },
      decisionTimeMs: r.decisionTimeMs,
      confidenceScore: r.confidenceScore,
      questionShownAt: r.questionShownAt,
      answeredAt: r.answeredAt,
      createdAt: r.createdAt,
    }))
  );
}
