import { prisma } from "@/lib/prisma";

export interface ExportFilters {
  groupLabel?: string;
  studyCaseId?: string;
  startDate?: Date;
  endDate?: Date;
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

  // CSV Header
  const headers = [
    "participant_id",
    "session_id",
    "group_label",
    "group_name",
    "case_id",
    "case_title",
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

  const rows = responses.map((r) => [
    r.participantId,
    r.sessionId,
    r.group.label,
    r.group.name,
    r.studyCaseId,
    r.studyCase.title,
    r.questionId,
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

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  return csvContent;
}
