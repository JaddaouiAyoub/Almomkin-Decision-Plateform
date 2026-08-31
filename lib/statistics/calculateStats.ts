import { prisma } from "@/lib/prisma";
import type { GroupStats, OverallStats } from "@/types";

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

export async function calculateStats(
  experimentId: string
): Promise<OverallStats> {
  // Get all groups
  const groups = await prisma.experimentGroup.findMany({
    where: { experimentId },
    orderBy: { label: "asc" },
  });

  // Get all responses with their details
  const responses = await prisma.response.findMany({
    where: {
      session: { experimentId },
    },
    include: {
      group: true,
      answerOption: true,
      question: {
        include: { options: { orderBy: { order: "asc" } } },
      },
    },
  });

  // Completed sessions count
  const completedSessions = await prisma.testSession.count({
    where: { experimentId, status: "COMPLETED" },
  });

  const totalSessions = await prisma.testSession.count({
    where: { experimentId },
  });

  const totalParticipants = await prisma.participant.count({
    where: { sessions: { some: { experimentId } } },
  });

  // Build group stats
  const groupStatsMap = new Map<string, GroupStats>();

  for (const group of groups) {
    const groupResponses = responses.filter((r) => r.groupId === group.id);
    const groupParticipants = await prisma.participant.count({
      where: { sessions: { some: { groupId: group.id, experimentId } } },
    });

    const times = groupResponses.map((r) => r.decisionTimeMs);
    const confidences = groupResponses
      .filter((r) => r.confidenceScore !== null)
      .map((r) => r.confidenceScore as number);

    // Answer distribution
    const optionCounts = new Map<string, number>();
    groupResponses.forEach((r) => {
      optionCounts.set(
        r.answerOptionId,
        (optionCounts.get(r.answerOptionId) ?? 0) + 1
      );
    });

    // Get all options for the question (from first response)
    const questionOptions =
      groupResponses.length > 0 ? groupResponses[0].question.options : [];

    const answerDistribution = questionOptions.map((opt) => {
      const count = optionCounts.get(opt.id) ?? 0;
      return {
        optionId: opt.id,
        label: opt.label,
        text: opt.text,
        count,
        percentage:
          groupResponses.length > 0
            ? Math.round((count / groupResponses.length) * 100)
            : 0,
      };
    });

    groupStatsMap.set(group.label, {
      groupId: group.id,
      groupLabel: group.label as "A" | "B",
      groupName: group.name,
      participantCount: groupParticipants,
      responseCount: groupResponses.length,
      avgDecisionTimeMs:
        times.length > 0
          ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
          : 0,
      medianDecisionTimeMs: Math.round(median(times)),
      avgConfidence:
        confidences.length > 0
          ? Math.round(
              (confidences.reduce((a, b) => a + b, 0) / confidences.length) *
                10
            ) / 10
          : 0,
      answerDistribution,
    });
  }

  const allTimes = responses.map((r) => r.decisionTimeMs);
  const allConfidences = responses
    .filter((r) => r.confidenceScore !== null)
    .map((r) => r.confidenceScore as number);

  const emptyGroup: GroupStats = {
    groupId: "",
    groupLabel: "A",
    groupName: "",
    participantCount: 0,
    responseCount: 0,
    avgDecisionTimeMs: 0,
    medianDecisionTimeMs: 0,
    avgConfidence: 0,
    answerDistribution: [],
  };

  return {
    totalParticipants,
    totalResponses: responses.length,
    completedSessions,
    completionRate:
      totalSessions > 0
        ? Math.round((completedSessions / totalSessions) * 100)
        : 0,
    avgDecisionTimeMs:
      allTimes.length > 0
        ? Math.round(allTimes.reduce((a, b) => a + b, 0) / allTimes.length)
        : 0,
    avgConfidence:
      allConfidences.length > 0
        ? Math.round(
            (allConfidences.reduce((a, b) => a + b, 0) /
              allConfidences.length) *
              10
          ) / 10
        : 0,
    groupA: groupStatsMap.get("A") ?? emptyGroup,
    groupB: groupStatsMap.get("B") ?? emptyGroup,
  };
}

export async function getResponsesForTable(filters: {
  groupLabel?: string;
  studyCaseId?: string;
  answerLabel?: string;
  page?: number;
  pageSize?: number;
  search?: string;
}) {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = {};

  if (filters.groupLabel) {
    where.group = { label: filters.groupLabel };
  }
  if (filters.studyCaseId) {
    where.studyCaseId = filters.studyCaseId;
  }
  if (filters.answerLabel) {
    where.answerOption = { label: filters.answerLabel };
  }
  if (filters.search) {
    where.participantId = { contains: filters.search, mode: "insensitive" };
  }

  const [responses, total] = await Promise.all([
    prisma.response.findMany({
      where,
      include: {
        group: true,
        studyCase: true,
        question: true,
        answerOption: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.response.count({ where }),
  ]);

  return {
    responses: responses.map((r) => ({
      responseId: r.id,
      participantId: r.participantId,
      sessionId: r.sessionId,
      groupLabel: r.group.label,
      groupName: r.group.name,
      caseTitle: r.studyCase.title,
      questionText: r.question.text,
      answerLabel: r.answerOption.label,
      answerText: r.answerOption.text,
      decisionTimeMs: r.decisionTimeMs,
      confidenceScore: r.confidenceScore,
      createdAt: r.createdAt.toISOString(),
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getDecisionTimeDistribution(experimentId: string) {
  const responses = await prisma.response.findMany({
    where: { session: { experimentId } },
    select: { decisionTimeMs: true, group: { select: { label: true } } },
  });

  // Build histogram buckets (0-5s, 5-10s, 10-20s, 20-30s, 30-60s, 60s+)
  const buckets = [
    { label: "0-5s", min: 0, max: 5000 },
    { label: "5-10s", min: 5000, max: 10000 },
    { label: "10-20s", min: 10000, max: 20000 },
    { label: "20-30s", min: 20000, max: 30000 },
    { label: "30-60s", min: 30000, max: 60000 },
    { label: "60s+", min: 60000, max: Infinity },
  ];

  return buckets.map((bucket) => {
    const inBucket = responses.filter(
      (r) => r.decisionTimeMs >= bucket.min && r.decisionTimeMs < bucket.max
    );
    const groupA = inBucket.filter((r) => r.group.label === "A").length;
    const groupB = inBucket.filter((r) => r.group.label === "B").length;
    return { label: bucket.label, groupA, groupB, total: inBucket.length };
  });
}

export async function getConfidenceDistribution(experimentId: string) {
  const responses = await prisma.response.findMany({
    where: {
      session: { experimentId },
      confidenceScore: { not: null },
    },
    select: {
      confidenceScore: true,
      group: { select: { label: true } },
    },
  });

  return Array.from({ length: 11 }, (_, i) => {
    const atScore = responses.filter((r) => r.confidenceScore === i);
    return {
      score: i,
      groupA: atScore.filter((r) => r.group.label === "A").length,
      groupB: atScore.filter((r) => r.group.label === "B").length,
      total: atScore.length,
    };
  });
}
