import { prisma } from "@/lib/prisma";
import { assignGroup } from "./assignGroup";
import type { StartSessionResponse } from "@/types";

/**
 * Starts a new test session for an anonymous participant.
 * Creates Participant, assigns Group, creates TestSession.
 */
export async function startSession(
  experimentId: string
): Promise<StartSessionResponse> {
  // Load the complete ordered journey before creating participant sessions.
  const studyCases = await prisma.studyCase.findMany({
    where: { experimentId, isActive: true },
    include: {
      groupContents: true,
      questions: {
        where: { isActive: true },
        orderBy: { order: "asc" },
        include: {
          options: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
    orderBy: { order: "asc" },
  });

  if (studyCases.length === 0) {
    throw new Error("No active study case found");
  }

  if (studyCases.some((studyCase) => studyCase.questions.length === 0)) {
    throw new Error("No active questions found for this study case");
  }

  // 2. Assign group (server-side)
  const { groupId, groupLabel } = await assignGroup(experimentId);

  // Create one participant and one session per case for before/after comparison.
  const participant = await prisma.participant.create({ data: {} });

  const cases = await Promise.all(studyCases.map(async (studyCase) => {
    const groupContent = studyCase.groupContents.find(
      (content) => content.groupLabel === groupLabel
    );

    if (!groupContent) {
      throw new Error(`No content found for group ${groupLabel}`);
    }

    const session = await prisma.testSession.create({
      data: {
        participantId: participant.id,
        experimentId,
        groupId,
        studyCaseId: studyCase.id,
        status: "STARTED",
      },
    });

    return {
      sessionId: session.id,
      studyCase: {
        id: studyCase.id,
        title: studyCase.title,
        content: groupContent.content,
        newInformation: studyCase.newInformation,
      },
      questions: studyCase.questions.map((question) => ({
        id: question.id,
        text: question.text,
        order: question.order,
        type: question.type,
        stage: question.stage,
        options: question.options.map((option) => ({
          id: option.id,
          label: option.label,
          text: option.text,
          order: option.order,
        })),
      })),
    };
  }));

  return {
    participantId: participant.id,
    sessionId: cases[0].sessionId,
    totalCases: cases.length,
    cases,
    studyCase: cases[0].studyCase,
    questions: cases[0].questions,
  };
}
