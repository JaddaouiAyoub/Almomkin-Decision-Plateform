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
  experimentId: string,
  studyCaseId?: string
): Promise<OverallStats> {
  const responseWhere = {
    session: {
      experimentId,
      ...(studyCaseId ? { studyCaseId } : {}),
    },
    ...(studyCaseId ? { studyCaseId } : {}),
  };

  const sessionWhere = {
    experimentId,
    ...(studyCaseId ? { studyCaseId } : {}),
  };

  // Get all groups
  const groups = await prisma.experimentGroup.findMany({
    where: { experimentId },
    orderBy: { label: "asc" },
  });

  // Get all responses with their details
  const responses = await prisma.response.findMany({
    where: responseWhere,
    include: {
      group: true,
      studyCase: true,
      answerOption: true,
      question: {
        include: { options: { orderBy: { order: "asc" } } },
      },
    },
  });

  // Completed sessions count
  const completedSessions = await prisma.testSession.count({
    where: { ...sessionWhere, status: "COMPLETED" },
  });

  const totalSessions = await prisma.testSession.count({
    where: sessionWhere,
  });

  const totalParticipants = await prisma.participant.count({
    where: {
      sessions: {
        some: {
          experimentId,
          ...(studyCaseId ? { studyCaseId } : {}),
        },
      },
    },
  });

  // Build group stats
  const groupStatsMap = new Map<string, GroupStats>();

  for (const group of groups) {
    const groupResponses = responses.filter((r) => r.groupId === group.id);
    const groupParticipants = await prisma.participant.count({
      where: {
        sessions: {
          some: {
            groupId: group.id,
            experimentId,
            ...(studyCaseId ? { studyCaseId } : {}),
          },
        },
      },
    });

    const times = groupResponses.map((r) => r.decisionTimeMs);
    const confidences = groupResponses
      .filter((r) => r.confidenceScore !== null)
      .map((r) => r.confidenceScore as number);

    // Group-level Answer distribution (aggregated across all questions)
    const optionCounts = new Map<string, number>();
    groupResponses.forEach((r) => {
      if (!r.answerOptionId) return;
      optionCounts.set(
        r.answerOptionId,
        (optionCounts.get(r.answerOptionId) ?? 0) + 1
      );
    });

    // We can't build a meaningful aggregated distribution if questions have different options,
    // but we'll try to find common option labels (A, B, C, D) for the high-level chart.
    const aggregatedDist = ["A", "B", "C", "D"].map((label) => {
      // Find all options with this label in the experiment
      const matchingResponses = groupResponses.filter((r) => r.answerOption?.label === label);
      const count = matchingResponses.length;
      return {
        optionId: `agg-${label}`,
        label,
        text: `Option ${label}`,
        count,
        percentage: groupResponses.length > 0 ? Math.round((count / groupResponses.length) * 100) : 0,
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
      answerDistribution: aggregatedDist,
    });
  }

  // Build PER-QUESTION stats
  const perQuestionStats: import("@/types").PerQuestionStats[] = [];
  
  // Find all unique questions in the responses
  const uniqueQuestions = Array.from(new Set(responses.map(r => r.questionId)))
    .map(qid => responses.find(r => r.questionId === qid)!.question)
    .sort((a, b) => a.order - b.order);

  for (const q of uniqueQuestions) {
    const qResponses = responses.filter(r => r.questionId === q.id);
    
    // Helper to calculate stats for a specific group for this question
    const getGroupQStats = (groupLabel: string) => {
      const gResponses = qResponses.filter(r => r.group.label === groupLabel);
      const gTimes = gResponses.map(r => r.decisionTimeMs);
      const gConfidences = gResponses.filter(r => r.confidenceScore !== null).map(r => r.confidenceScore as number);
      
      const distribution = q.options.map(opt => {
        const count = gResponses.filter(r => r.answerOptionId === opt.id).length;
        return {
          optionId: opt.id,
          label: opt.label,
          text: opt.text,
          count,
          percentage: gResponses.length > 0 ? Math.round((count / gResponses.length) * 100) : 0,
        };
      });

      return {
        avgDecisionTimeMs: gTimes.length > 0 ? Math.round(gTimes.reduce((a, b) => a + b, 0) / gTimes.length) : 0,
        avgConfidence: gConfidences.length > 0 ? Math.round((gConfidences.reduce((a, b) => a + b, 0) / gConfidences.length) * 10) / 10 : 0,
        answerDistribution: distribution,
      };
    };

    perQuestionStats.push({
      questionId: q.id,
      questionText: q.text,
      questionOrder: q.order,
      caseTitle: qResponses.length > 0 ? qResponses[0].studyCase.title : "",
      totalResponses: qResponses.length,
      groupA: getGroupQStats("A"),
      groupB: getGroupQStats("B"),
    });
  }

  const allTimes = responses.map((r) => r.decisionTimeMs);
  const allConfidences = responses
    .filter((r) => r.confidenceScore !== null)
    .map((r) => r.confidenceScore as number);

  const sessionResponses = new Map<string, typeof responses>();
  for (const response of responses) {
    const current = sessionResponses.get(response.sessionId) ?? [];
    current.push(response);
    sessionResponses.set(response.sessionId, current);
  }
  let initialConfidenceTotal = 0;
  let finalConfidenceTotal = 0;
  let confidencePairs = 0;
  let changedDecisions = 0;
  let comparableDecisions = 0;
  let helpedYes = 0;
  let helpedPartially = 0;
  let helpedNo = 0;
  for (const session of sessionResponses.values()) {
    const initial = session.find((r) => r.question.stage === "INITIAL_CONFIDENCE");
    const final = session.find((r) => r.question.stage === "FINAL_CONFIDENCE");
    const initialDecision = session.find((r) => r.question.stage === "INITIAL_DECISION");
    const finalDecision = session.find((r) => r.question.stage === "FINAL_DECISION");
    const helped = session.find((r) => r.question.stage === "ALMOMKIN_HELPED");
    if (initial?.confidenceScore != null && final?.confidenceScore != null) {
      initialConfidenceTotal += initial.confidenceScore;
      finalConfidenceTotal += final.confidenceScore;
      confidencePairs += 1;
    }
    if (initialDecision && finalDecision) {
      comparableDecisions += 1;
      if (initialDecision.answerOptionId !== finalDecision.answerOptionId || initialDecision.responseText !== finalDecision.responseText) changedDecisions += 1;
    }
    const helpedLabel = helped?.answerOption?.text || helped?.responseText;
    if (helpedLabel === "Oui") helpedYes += 1;
    if (helpedLabel === "Partiellement") helpedPartially += 1;
    if (helpedLabel === "Non") helpedNo += 1;
  }

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
    perQuestion: perQuestionStats,
    journey: {
      initialConfidence: confidencePairs ? Math.round((initialConfidenceTotal / confidencePairs) * 10) / 10 : 0,
      finalConfidence: confidencePairs ? Math.round((finalConfidenceTotal / confidencePairs) * 10) / 10 : 0,
      changedDecisions,
      comparableDecisions,
      helpedYes,
      helpedPartially,
      helpedNo,
    },
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
      questionOrder: r.question.order,
      questionText: r.question.text,
      answerLabel: r.answerOption?.label || "",
      answerText: r.answerOption?.text || r.responseText || "",
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

export async function getDecisionTimeDistribution(experimentId: string, studyCaseId?: string) {
  const responses = await prisma.response.findMany({
    where: {
      session: { experimentId, ...(studyCaseId ? { studyCaseId } : {}) },
      ...(studyCaseId ? { studyCaseId } : {}),
    },
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

export async function getConfidenceDistribution(experimentId: string, studyCaseId?: string) {
  const responses = await prisma.response.findMany({
    where: {
      session: { experimentId, ...(studyCaseId ? { studyCaseId } : {}) },
      ...(studyCaseId ? { studyCaseId } : {}),
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
